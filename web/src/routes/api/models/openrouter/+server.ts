import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';

export interface OpenRouterModelItem {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  isFree: boolean;
  promptPrice: string;
  completionPrice: string;
}

let cachedModels: {
  freeModels: OpenRouterModelItem[];
  paidModels: OpenRouterModelItem[];
  timestamp: number;
} | null = null;

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const GET: RequestHandler = async ({ url, request }) => {
  try {
    const userKey = url.searchParams.get('apiKey') || request.headers.get('x-openrouter-key');
    const adminConfig = getAdminConfig();
    const effectiveKey = userKey || adminConfig.openrouterApiKey;

    const now = Date.now();
    if (!userKey && cachedModels && now - cachedModels.timestamp < CACHE_TTL) {
      return json({
        success: true,
        cached: true,
        freeModels: cachedModels.freeModels,
        paidModels: cachedModels.paidModels,
        total: cachedModels.freeModels.length + cachedModels.paidModels.length
      });
    }

    const headers: Record<string, string> = {
      'HTTP-Referer': 'https://ezboagents.com',
      'X-Title': 'EzboAgents'
    };

    if (effectiveKey) {
      headers['Authorization'] = `Bearer ${effectiveKey}`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers,
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawList: any[] = Array.isArray(data?.data) ? data.data : [];

    const freeModels: OpenRouterModelItem[] = [];
    const paidModels: OpenRouterModelItem[] = [];

    for (const m of rawList) {
      if (!m || !m.id) continue;
      const promptNum = Number(m.pricing?.prompt || 0);
      const completionNum = Number(m.pricing?.completion || 0);
      const isFree = m.id.endsWith(':free') || (promptNum === 0 && completionNum === 0);

      const item: OpenRouterModelItem = {
        id: m.id,
        name: m.name || m.id,
        description: m.description || '',
        contextLength: m.context_length || 4096,
        isFree,
        promptPrice: promptNum > 0 ? `$${(promptNum * 1000000).toFixed(2)}/1M` : 'Free',
        completionPrice: completionNum > 0 ? `$${(completionNum * 1000000).toFixed(2)}/1M` : 'Free'
      };

      if (isFree) {
        freeModels.push(item);
      } else {
        paidModels.push(item);
      }
    }

    // Sort free models alphabetically by name
    freeModels.sort((a, b) => a.name.localeCompare(b.name));

    // Sort paid models prioritizing popular ones
    paidModels.sort((a, b) => {
      const isClaudeOrGptA = a.id.includes('claude') || a.id.includes('gpt-4');
      const isClaudeOrGptB = b.id.includes('claude') || b.id.includes('gpt-4');
      if (isClaudeOrGptA && !isClaudeOrGptB) return -1;
      if (!isClaudeOrGptA && isClaudeOrGptB) return 1;
      return a.name.localeCompare(b.name);
    });

    if (!userKey) {
      cachedModels = {
        freeModels,
        paidModels,
        timestamp: now
      };
    }

    return json({
      success: true,
      cached: false,
      freeModels,
      paidModels,
      total: freeModels.length + paidModels.length
    });
  } catch (err: any) {
    console.warn('[openrouter-sync] Error fetching models from OpenRouter:', err.message);

    // Provide robust curated fallback list if OpenRouter network times out
    const fallbackFree: OpenRouterModelItem[] = [
      {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Meta: Llama 3.3 70B Instruct (Free)',
        description: 'Flagship open-weights model with state-of-the-art reasoning and coding.',
        contextLength: 131072,
        isFree: true,
        promptPrice: 'Free',
        completionPrice: 'Free'
      },
      {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Google: Gemini 2.0 Flash Experimental (Free)',
        description: 'Next-generation ultra-fast multimodal reasoning model from Google DeepMind.',
        contextLength: 1048576,
        isFree: true,
        promptPrice: 'Free',
        completionPrice: 'Free'
      },
      {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek: R1 Reasoning (Free)',
        description: 'DeepSeek open reasoning model comparable to OpenAI o1.',
        contextLength: 65536,
        isFree: true,
        promptPrice: 'Free',
        completionPrice: 'Free'
      },
      {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral: Mistral 7B Instruct (Free)',
        description: 'High-performance fast European instruction-following model.',
        contextLength: 32768,
        isFree: true,
        promptPrice: 'Free',
        completionPrice: 'Free'
      },
      {
        id: 'qwen/qwen-2.5-coder-32b-instruct:free',
        name: 'Qwen: Qwen 2.5 Coder 32B (Free)',
        description: 'Specialized code and automation agent model.',
        contextLength: 32768,
        isFree: true,
        promptPrice: 'Free',
        completionPrice: 'Free'
      }
    ];

    return json({
      success: true,
      fallback: true,
      freeModels: fallbackFree,
      paidModels: [],
      total: fallbackFree.length
    });
  }
};
