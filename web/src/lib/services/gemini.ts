import type { AITool } from '$lib/config/tools';

export const GEMINI_FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GenerateResult {
  text: string;
  error?: string;
  modelUsed: string;
}

export async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string; modelUsed?: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'Please enter a valid Gemini API Key.' };
  }

  let lastError = '';

  for (const model of GEMINI_FALLBACK_MODELS) {
    try {
      const res = await fetch(`${API_URL}/${model}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, reply with OK if you are working' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      if (res.ok) {
        return { valid: true, modelUsed: model };
      }

      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP Error ${res.status}`;
      lastError = msg;

      // If bad API key, no need to retry across all models
      if (res.status === 400 && /API_KEY_INVALID|API key not valid|bad request/i.test(msg)) {
        return { valid: false, error: `Invalid Gemini API Key: ${msg}` };
      }
      if (res.status === 403) {
        return { valid: false, error: `Gemini API Permission Denied: ${msg}` };
      }

      console.warn(`[gemini-validate] Model "${model}" returned ${res.status}: ${msg}. Failing over to next model...`);
    } catch (err: any) {
      lastError = err.message;
    }
  }

  return { valid: false, error: `Gemini validation error: ${lastError || 'All fallback models failed.'}` };
}

export async function executeToolWithGemini(
  apiKey: string,
  tool: AITool,
  userInputs: Record<string, string>
): Promise<GenerateResult> {
  if (!apiKey) {
    return {
      text: '',
      error: 'No Gemini API Key found. Please connect your free key from the dashboard.',
      modelUsed: GEMINI_FALLBACK_MODELS[0]
    };
  }

  // Construct context from user inputs
  const inputEntries = Object.entries(userInputs)
    .filter(([_, val]) => val && val.trim().length > 0)
    .map(([key, val]) => {
      const inputDef = (tool.inputs || []).find((i) => i.name === key);
      const label = inputDef?.label || key;
      return `[${label}]: ${val}`;
    })
    .join('\n');

  const promptMessage = `System Instructions:\n${tool.systemPrompt}\n\n---\nUser Input for Tool "${tool.name}" (${tool.nameEn}):\n${inputEntries}\n\nPlease generate the highest quality, ready-to-use output now.`;

  let lastError = '';

  for (const model of GEMINI_FALLBACK_MODELS) {
    try {
      const res = await fetch(`${API_URL}/${model}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: promptMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP Error ${res.status}`;
        lastError = msg;

        // If invalid key, stop early
        if (res.status === 400 && /API_KEY_INVALID|API key not valid|bad request/i.test(msg)) {
          return {
            text: '',
            error: `Gemini API Error: ${msg}`,
            modelUsed: model
          };
        }

        console.warn(`[gemini-tool] Model "${model}" failed with status ${res.status}: ${msg}. Failing over to next model...`);
        continue;
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const generatedText = candidate?.content?.parts?.[0]?.text || '';

      if (!generatedText) {
        return {
          text: '',
          error: 'The model returned no output. Please refine your inputs and try again.',
          modelUsed: model
        };
      }

      return {
        text: generatedText,
        modelUsed: model
      };
    } catch (err: any) {
      lastError = err.message;
      continue;
    }
  }

  return {
    text: '',
    error: `Gemini API Error: ${lastError || 'All fallback models failed.'}`,
    modelUsed: GEMINI_FALLBACK_MODELS[0]
  };
}
