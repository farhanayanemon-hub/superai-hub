import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';

const RAILWAY_ENGINE_URL = process.env.WHATSAPP_ENGINE_URL || 'https://whatsapp-engine-production-04f4.up.railway.app';
const PLATFORM_GEMINI_KEY = process.env.PLATFORM_GEMINI_KEY || '';

type AIProvider = 'gemini' | 'openai' | 'grok' | 'deepseek' | 'openrouter' | 'replicate';

interface ChatRequest {
  message: string;
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
    const { message, apiKey, vaultKey, usePlatformKey } = body;

    if (!message) {
      return json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    // Determine the key and provider to use
    let resolvedApiKey: string | undefined = undefined;
    let resolvedProvider: AIProvider = 'gemini';

    if (usePlatformKey) {
      // Managed plan: check platform keys configured by Admin
      resolvedApiKey = adminConfig.geminiApiKey || PLATFORM_GEMINI_KEY || adminConfig.openaiApiKey;
      resolvedProvider = adminConfig.geminiApiKey ? 'gemini' : (adminConfig.openaiApiKey ? 'openai' : 'gemini');
    } else if (vaultKey?.key) {
      // Vault key provided by user
      resolvedApiKey = vaultKey.key;
      resolvedProvider = vaultKey.provider;
    } else if (apiKey) {
      // BYOK Gemini Key
      resolvedApiKey = apiKey;
      resolvedProvider = 'gemini';
    } else if (adminConfig.geminiApiKey) {
      // Fallback to platform gemini key if available
      resolvedApiKey = adminConfig.geminiApiKey;
      resolvedProvider = 'gemini';
    }

    const requestedModel = vaultKey?.model || (resolvedProvider in DEFAULT_MODELS ? DEFAULT_MODELS[resolvedProvider] : 'gemini-2.0-flash');

    // Check if the model is toggled OFF by admin
    const modelKey = requestedModel as keyof typeof adminConfig.modelsEnabled;
    if (adminConfig.modelsEnabled && adminConfig.modelsEnabled[modelKey] === false) {
      return json({
        success: false,
        error: `Model "${requestedModel}" has been temporarily disabled by the platform administrator in the Admin Panel.`
      }, { status: 403 });
    }

    // Direct native execution for OpenAI-compatible providers
    if (resolvedApiKey && resolvedProvider in OPENAI_COMPATIBLE_ENDPOINTS) {
      const endpoint = OPENAI_COMPATIBLE_ENDPOINTS[resolvedProvider];
      const model = vaultKey?.model || DEFAULT_MODELS[resolvedProvider] || 'gpt-4o';

      const providerRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resolvedApiKey}`,
          ...(resolvedProvider === 'openrouter' ? { 'HTTP-Referer': 'https://ezboagents.com', 'X-Title': 'EzboAgents' } : {})
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an elite, executive-level AI assistant on the EzboAgents platform. Deliver concise, highly structured, actionable, and world-class business responses.'
            },
            { role: 'user', content: message }
          ]
        })
      });

      const providerData = await providerRes.json().catch(() => ({}));
      if (!providerRes.ok) {
        const errorMsg = providerData?.error?.message || `Provider returned HTTP ${providerRes.status}`;
        return json({ success: false, error: `${resolvedProvider.toUpperCase()} Error: ${errorMsg}` }, { status: providerRes.status });
      }

      const reply = providerData.choices?.[0]?.message?.content || 'No output received from model.';
      return json({
        success: true,
        input: message,
        result: {
          type: 'text',
          text: reply
        },
        provider: resolvedProvider,
        model
      });
    }

    // Forward to Railway engine for Gemini / Image / Native tools
    const engineResponse = await fetch(`${RAILWAY_ENGINE_URL}/api/chat/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        apiKey: resolvedApiKey
      })
    });

    if (!engineResponse.ok) {
      const errText = await engineResponse.text();
      return json(
        { success: false, error: `Engine responded with status ${engineResponse.status}: ${errText}` },
        { status: engineResponse.status }
      );
    }

    const data = await engineResponse.json();
    return json({ ...data, provider: resolvedProvider });
  } catch (error: any) {
    console.error('Error forwarding chat message:', error);
    return json(
      { success: false, error: error.message || 'Failed to communicate with AI engine' },
      { status: 500 }
    );
  }
};
