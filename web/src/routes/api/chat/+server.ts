import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
import {
  matchHelperForMessage,
  buildCeoOrHelperSystemPrompt,
  isVisualGenerationHelper
} from '$lib/services/ceoRouter';

const RAILWAY_ENGINE_URL =
  process.env.WHATSAPP_ENGINE_URL || 'https://whatsapp-engine-production-04f4.up.railway.app';
const PLATFORM_GEMINI_KEY = process.env.PLATFORM_GEMINI_KEY || '';

type AIProvider = 'gemini' | 'openai' | 'grok' | 'deepseek' | 'openrouter' | 'replicate';

interface ChatHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  helperId?: string;
  mode?: 'ceo' | 'helper';
  language?: string;
  tone?: string;
  ceoCustomPrompt?: string;
  history?: ChatHistoryTurn[];
  // BYOK single key (Pro / legacy)
  apiKey?: string;
  // Multi-vault (Ultra)
  vaultKey?: {
    provider: AIProvider;
    key: string;
    model?: string;
  };
  // Complete plan flag
  usePlatformKey?: boolean;
  routingStrategy?: 'auto_free_rotate' | 'single_model' | 'multi_provider_rotate';
}

const OPENAI_COMPATIBLE_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  grok: 'https://api.x.ai/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions'
};

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o',
  grok: 'grok-3',
  deepseek: 'deepseek-chat',
  openrouter: 'meta-llama/llama-3.1-70b-instruct'
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const adminConfig = getAdminConfig();
    const body: ChatRequest = await request.json();
    const {
      message,
      helperId,
      mode = 'ceo',
      language,
      tone,
      ceoCustomPrompt,
      history = [],
      apiKey,
      vaultKey,
      usePlatformKey
    } = body;

    if (!message) {
      return json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    // Match helper via AI CEO router or explicit helperId
    const matchedHelper = matchHelperForMessage(message, helperId);
    const delegatedHelperMeta = matchedHelper
      ? {
          id: matchedHelper.id,
          code: matchedHelper.code,
          name: matchedHelper.name,
          icon: matchedHelper.icon,
          badge: matchedHelper.badge,
          category: matchedHelper.category
        }
      : null;

    const systemPrompt = buildCeoOrHelperSystemPrompt(matchedHelper, {
      language,
      tone,
      mode,
      ceoCustomPrompt
    });

    // Determine the key and provider to use
    let resolvedApiKey: string | undefined = undefined;
    let resolvedProvider: AIProvider = 'gemini';

    if (usePlatformKey) {
      resolvedApiKey =
        adminConfig.geminiApiKey || PLATFORM_GEMINI_KEY || adminConfig.openaiApiKey;
      resolvedProvider = adminConfig.geminiApiKey
        ? 'gemini'
        : adminConfig.openaiApiKey
          ? 'openai'
          : 'gemini';
    } else if (vaultKey?.key) {
      resolvedApiKey = vaultKey.key;
      resolvedProvider = vaultKey.provider;
    } else if (apiKey) {
      resolvedApiKey = apiKey;
      resolvedProvider = 'gemini';
    } else if (adminConfig.geminiApiKey || PLATFORM_GEMINI_KEY) {
      resolvedApiKey = adminConfig.geminiApiKey || PLATFORM_GEMINI_KEY;
      resolvedProvider = 'gemini';
    }

    const requestedModel =
      vaultKey?.model ||
      (resolvedProvider in DEFAULT_MODELS
        ? DEFAULT_MODELS[resolvedProvider]
        : 'gemini-2.0-flash');

    const modelKey = requestedModel as keyof typeof adminConfig.modelsEnabled;
    if (adminConfig.modelsEnabled && adminConfig.modelsEnabled[modelKey] === false) {
      return json(
        {
          success: false,
          error: `Model "${requestedModel}" has been temporarily disabled by the platform administrator in the Admin Panel.`
        },
        { status: 403 }
      );
    }

    // Visual Image / Logo generation support (#34 AI Commercial Image Generator, #35 AI Business Logo Generator)
    if (isVisualGenerationHelper(matchedHelper, message)) {
      const cleanPrompt = message
        .replace(/^\/img\s+/i, '')
        .replace(/^generate image:\s*/i, '')
        .replace(/^create logo:\s*/i, '')
        .trim();
      const encodedPrompt = encodeURIComponent(
        `${cleanPrompt}, ultra detailed commercial quality, 8k resolution, professional lighting`
      );
      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

      const captionHeader = matchedHelper
        ? `⚡ **AI CEO → Delegated to [${matchedHelper.code}] ${matchedHelper.name}**\n\nYour commercial visual render is ready. Preview or download below:`
        : `✨ Your AI visual render is ready:`;

      return json({
        success: true,
        input: message,
        delegatedHelper: delegatedHelperMeta,
        result: {
          type: 'image',
          url: imageUrl,
          caption: `${captionHeader}\n\n**Prompt:** ${cleanPrompt}`
        },
        provider: resolvedProvider,
        model: 'flux-pro-visual'
      });
    }

    // 1. Native Gemini Execution if Gemini API Key is present
    if (resolvedApiKey && resolvedProvider === 'gemini') {
      const geminiModel = vaultKey?.model || 'gemini-2.0-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${resolvedApiKey}`;

      const contents = [
        ...history.slice(-8).map((turn) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 2048
          }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const reply =
          geminiData?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text || '')
            .join('\n') || 'No output received from Gemini.';

        return json({
          success: true,
          input: message,
          delegatedHelper: delegatedHelperMeta,
          result: {
            type: 'text',
            text: reply
          },
          provider: 'gemini',
          model: geminiModel
        });
      }
    }

    // 2. Direct native execution for OpenAI-compatible providers
    if (resolvedApiKey && resolvedProvider in OPENAI_COMPATIBLE_ENDPOINTS) {
      const endpoint = OPENAI_COMPATIBLE_ENDPOINTS[resolvedProvider];
      const candidateModels =
        resolvedProvider === 'openrouter' && body.routingStrategy === 'auto_free_rotate'
          ? [
              vaultKey?.model || 'meta-llama/llama-3.3-70b-instruct:free',
              'google/gemini-2.0-flash-exp:free',
              'deepseek/deepseek-r1:free',
              'mistralai/mistral-7b-instruct:free',
              'qwen/qwen-2.5-coder-32b-instruct:free'
            ]
          : [vaultKey?.model || DEFAULT_MODELS[resolvedProvider] || 'gpt-4o'];

      let lastError = '';
      let successfulReply = '';
      let successfulModel = candidateModels[0];

      for (const modelToTry of candidateModels) {
        try {
          const providerRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resolvedApiKey}`,
              ...(resolvedProvider === 'openrouter'
                ? { 'HTTP-Referer': 'https://ezboagents.com', 'X-Title': 'EzboAgents' }
                : {})
            },
            body: JSON.stringify({
              model: modelToTry,
              messages: [
                { role: 'system', content: systemPrompt },
                ...history.slice(-8).map((turn) => ({
                  role: turn.role,
                  content: turn.content
                })),
                { role: 'user', content: message }
              ]
            })
          });

          const providerData = await providerRes.json().catch(() => ({}));
          if (providerRes.ok && providerData.choices?.[0]?.message?.content) {
            successfulReply = providerData.choices[0].message.content;
            successfulModel = modelToTry;
            break;
          } else {
            lastError =
              providerData?.error?.message || `Provider returned HTTP ${providerRes.status}`;
          }
        } catch (fetchErr: any) {
          lastError = fetchErr.message;
        }
      }

      if (successfulReply) {
        return json({
          success: true,
          input: message,
          delegatedHelper: delegatedHelperMeta,
          result: {
            type: 'text',
            text: successfulReply
          },
          provider: resolvedProvider,
          model: successfulModel
        });
      }

      return json(
        { success: false, error: `${resolvedProvider.toUpperCase()} Error: ${lastError}` },
        { status: 502 }
      );
    }

    // 3. Forward to Railway engine fallback
    const engineResponse = await fetch(`${RAILWAY_ENGINE_URL}/api/chat/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `${systemPrompt}\n\nUSER REQUEST:\n${message}`,
        apiKey: resolvedApiKey
      })
    });

    if (!engineResponse.ok) {
      const errText = await engineResponse.text();
      return json(
        {
          success: false,
          error: `Engine responded with status ${engineResponse.status}: ${errText}`
        },
        { status: engineResponse.status }
      );
    }

    const data = await engineResponse.json();
    return json({
      ...data,
      delegatedHelper: delegatedHelperMeta,
      provider: resolvedProvider
    });
  } catch (error: any) {
    console.error('Error forwarding chat message:', error);
    return json(
      { success: false, error: error.message || 'Failed to communicate with AI engine' },
      { status: 500 }
    );
  }
};
