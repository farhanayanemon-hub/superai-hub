import type { AITool } from '$lib/config/tools';

const GEMINI_MODEL = 'gemini-1.5-flash';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GenerateResult {
  text: string;
  error?: string;
  modelUsed: string;
}

export async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'অনুগ্রহ করে একটি সঠিক Gemini API Key দিন' };
  }

  try {
    const res = await fetch(`${API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, reply with OK if you are working' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP Error ${res.status}`;
      return { valid: false, error: `ভুল কী অথবা পারমিশন নেই: ${msg}` };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message || 'নেটওয়ার্ক এরর, আবার চেষ্টা করুন' };
  }
}

export async function executeToolWithGemini(
  apiKey: string,
  tool: AITool,
  userInputs: Record<string, string>
): Promise<GenerateResult> {
  if (!apiKey) {
    return {
      text: '',
      error: 'কোনো Gemini API Key পাওয়া যায়নি। দয়া করে ড্যাশবোর্ড থেকে আপনার ফ্রি কী যোগ করুন।',
      modelUsed: GEMINI_MODEL
    };
  }

  // Construct context from user inputs
  const inputEntries = Object.entries(userInputs)
    .filter(([_, val]) => val && val.trim().length > 0)
    .map(([key, val]) => {
      const inputDef = tool.inputs.find((i) => i.name === key);
      const label = inputDef?.label || key;
      return `[${label}]: ${val}`;
    })
    .join('\n');

  const promptMessage = `System Instructions:\n${tool.systemPrompt}\n\n---\nUser Input for Tool "${tool.name}" (${tool.nameEn}):\n${inputEntries}\n\nPlease generate the highest quality, ready-to-use output now.`;

  try {
    const res = await fetch(`${API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`, {
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
      return {
        text: '',
        error: `Gemini API এরর: ${msg}`,
        modelUsed: GEMINI_MODEL
      };
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const generatedText = candidate?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return {
        text: '',
        error: 'মডেল কোনো আউটপুট দেয়নি। প্রম্পট পরিবর্তন করে পুনরায় চেষ্টা করুন।',
        modelUsed: GEMINI_MODEL
      };
    }

    return {
      text: generatedText,
      modelUsed: GEMINI_MODEL
    };
  } catch (err: any) {
    return {
      text: '',
      error: err.message || 'রিকোয়েস্ট প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।',
      modelUsed: GEMINI_MODEL
    };
  }
}
