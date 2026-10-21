import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
import {
  matchHelperForMessage,
  matchMultiHelpersForMessage,
  recommendHelperForMessage,
  isConversationalGreeting,
  buildCeoOrHelperSystemPrompt,
  isVisualGenerationHelper,
  isRestrictedStarterIntent,
  getStarterGuardResponse
} from '$lib/services/ceoRouter';
import { GEMINI_FALLBACK_MODELS } from '$lib/services/gemini';

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
  tier?: string;
  userPlan?: string;
  planTier?: string;
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
    models?: string[];
    label?: string;
  };
  vaultKeys?: Array<{
    provider: AIProvider;
    key: string;
    model?: string;
    models?: string[];
    label?: string;
  }>;
  openrouterModels?: string[];
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
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free'
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

    // Starter tier plan guard: intercept restricted requests politely
    const rawPlanTier = body.planTier || body.userPlan || body.tier || 'byok_starter';
    const isProTier =
      rawPlanTier === 'byok_pro' ||
      rawPlanTier === 'pro' ||
      rawPlanTier === 'managed' ||
      rawPlanTier === 'complete' ||
      rawPlanTier === 'ultra' ||
      rawPlanTier === 'byok';

    const isStarter = !isProTier && (
      rawPlanTier === 'byok_starter' ||
      rawPlanTier === 'free' ||
      !rawPlanTier
    );
    const effectivePlanTier = isProTier ? 'byok_pro' : rawPlanTier;

    if (isStarter && isRestrictedStarterIntent(message)) {
      const guardResponse = getStarterGuardResponse();
      return json({
        success: true,
        input: message,
        delegatedHelper: null,
        result: {
          type: 'text',
          text: guardResponse
        },
        reply: guardResponse,
        guarded: true,
        isPlanGuarded: true,
        provider: 'system'
      });
    }

    if (isProTier && isRestrictedStarterIntent(message)) {
      if (adminConfig.workflowCustomizationUserEnabled === false) {
        const lockedResponse = `🔒 **Workflow Studio Access Notice**\nভিজ্যুয়াল ওয়ার্কফ্লো স্টুডিও বর্তমানে প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর কর্তৃক সংরক্ষিত রয়েছে (Visual Workflow Studio is currently reserved for platform administrators)। অ্যাডমিন ব্যতীত সাধারণ ইউজারদের জন্য স্টুডিও এক্সেস সাময়িকভাবে বন্ধ আছে।`;

        return json({
          success: true,
          input: message,
          delegatedHelper: null,
          result: {
            type: 'text',
            text: lockedResponse
          },
          reply: lockedResponse,
          guarded: false,
          isPlanGuarded: false,
          isProWorkflowIntent: true,
          provider: 'system'
        });
      }

      const proWorkflowResponse = `✅ **Executive Workflow Customization Authority Active (Pro Plan)**
সম্মানিত প্রো গ্রাহক, আপনার অ্যাকাউন্টে **Visual Workflow Studio** এবং **Custom Agent Builder** সম্পূর্ণ আনলক করা আছে!

🛠️ আপনি নিচের যেকোনো উপায়ে এখনই ওয়ার্কফ্লো কাস্টমাইজ করতে পারেন:
1. সরাসরি ফুল-স্ক্রিন ভিজ্যুয়াল স্টুডিও ওপেন করুন:
👉 **[Open Visual Workflow Studio](#open-workflow-studio)**
2. অথবা ড্যাশবোর্ডের যেকোনো AI Helper ওপেন করে উপরের **'Customize Workflow'** বাটনে ক্লিক করুন।
3. স্টুডিওতে আপনি **'+ Add Node'** দিয়ে ১০০+ টুলস কানেক্ট করতে পারেন, নোডগুলোর ইনস্ট্রাকশন এডিট করতে পারেন, এবং **'Save Custom Agent'** দিয়ে আপনার কাস্টম অটোমেশন সংরক্ষণ করতে পারেন।`;

      return json({
        success: true,
        input: message,
        delegatedHelper: null,
        result: {
          type: 'text',
          text: proWorkflowResponse
        },
        reply: proWorkflowResponse,
        guarded: false,
        isPlanGuarded: false,
        isProWorkflowIntent: true,
        provider: 'system'
      });
    }

    // Match helper via AI CEO router or explicit helperId
    const isGreeting = isConversationalGreeting(message);
    const matchedHelper = isGreeting ? null : matchHelperForMessage(message, helperId);
    const multiHelpers = isGreeting ? [] : matchMultiHelpersForMessage(message);
    const isMultiChain = multiHelpers.length > 1;

    // Recommend helper when in CEO mode, no helper is matched, and query is not a greeting
    const recommendedHelper =
      !matchedHelper && !isGreeting && (!helperId || helperId === 'ceo') && mode === 'ceo'
        ? recommendHelperForMessage(message)
        : null;

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

    const recommendedHelperMeta = recommendedHelper
      ? {
          id: recommendedHelper.id,
          code: recommendedHelper.code,
          name: recommendedHelper.name,
          icon: recommendedHelper.icon,
          badge: recommendedHelper.badge,
          category: recommendedHelper.category
        }
      : null;

    const delegatedPipelineMeta = isMultiChain
      ? multiHelpers.map((h) => ({
          id: h.id,
          code: h.code,
          name: h.name,
          icon: h.icon,
          badge: h.badge
        }))
      : undefined;

    const systemPrompt = buildCeoOrHelperSystemPrompt(matchedHelper, {
      language,
      tone,
      mode,
      ceoCustomPrompt,
      planTier: effectivePlanTier,
      multiHelpers: isMultiChain ? multiHelpers : undefined,
      recommendedHelper
    });

    // Determine the key and provider to use
    let resolvedApiKey: string | undefined = undefined;
    let resolvedProvider: AIProvider = 'gemini';

    const hasUserVaultKey = !!(
      (vaultKey?.key && vaultKey.key.trim().length > 0) ||
      (body.vaultKeys && body.vaultKeys.some((k) => k.key && k.key.trim().length > 0))
    );
    const hasSingleKey = !!(apiKey && apiKey.trim().length > 0);
    const hasPlatformKey = !!(
      usePlatformKey &&
      (adminConfig.geminiApiKey || PLATFORM_GEMINI_KEY || adminConfig.openaiApiKey)
    );

    if (!hasUserVaultKey && !hasSingleKey && !hasPlatformKey) {
      return json(
        {
          success: false,
          requiresApiKey: true,
          error: 'No API Key configured. Please add your free Google Gemini or OpenRouter key in the API Vault.'
        },
        { status: 400 }
      );
    }

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
    } else if (body.vaultKeys && body.vaultKeys.length > 0 && body.vaultKeys[0].key) {
      resolvedApiKey = body.vaultKeys[0].key;
      resolvedProvider = body.vaultKeys[0].provider;
    } else if (apiKey) {
      resolvedApiKey = apiKey;
      resolvedProvider = 'gemini';
    } else if (adminConfig.geminiApiKey || PLATFORM_GEMINI_KEY) {
      resolvedApiKey = adminConfig.geminiApiKey || PLATFORM_GEMINI_KEY;
      resolvedProvider = 'gemini';
    }

    // Build candidate keys for resolved provider
    type CandidateKey = { provider: AIProvider; key: string; model?: string; models?: string[]; label?: string };
    let candidateKeys: CandidateKey[] = [];

    if (body.vaultKeys && body.vaultKeys.length > 0) {
      candidateKeys = body.vaultKeys.filter((k) => k.provider === resolvedProvider && k.key);
    }

    if (candidateKeys.length === 0) {
      if (vaultKey?.key) {
        candidateKeys = [{
          provider: vaultKey.provider || resolvedProvider,
          key: vaultKey.key,
          model: vaultKey.model,
          models: vaultKey.models,
          label: vaultKey.label || 'Primary Key'
        }];
      } else if (resolvedApiKey) {
        candidateKeys = [{
          provider: resolvedProvider,
          key: resolvedApiKey,
          label: 'Default Key'
        }];
      }
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

    // 1. Native Gemini Execution with Smart Round-Robin & Auto Failover across active keys and fallback models
    if (resolvedProvider === 'gemini' && candidateKeys.length > 0) {
      let lastGeminiErr = '';

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

      for (const kObj of candidateKeys) {
        const geminiKey = kObj.key;
        if (!geminiKey) continue;

        const candidateModels: string[] = [
          ...(kObj.model ? [kObj.model] : []),
          ...(requestedModel && requestedModel !== kObj.model ? [requestedModel] : []),
          ...GEMINI_FALLBACK_MODELS
        ].filter((m, i, arr) => arr.indexOf(m) === i);

        for (const geminiModel of candidateModels) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

          try {
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
                delegatedPipeline: delegatedPipelineMeta,
                recommendedHelper: recommendedHelperMeta,
                result: {
                  type: 'text',
                  text: reply
                },
                provider: 'gemini',
                model: geminiModel,
                keyLabel: kObj.label
              });
            }

            const errBody = await geminiRes.text().catch(() => '');
            lastGeminiErr = `HTTP ${geminiRes.status} (${geminiModel}): ${errBody}`;

            const isModelNotFound =
              geminiRes.status === 404 ||
              /not found|is not found|unsupported|not supported/i.test(errBody);

            const isRateLimitOrQuota =
              geminiRes.status === 429 ||
              /RESOURCE_EXHAUSTED|quota|rate_limit|exceeded/i.test(errBody);

            if (isModelNotFound) {
              console.warn(
                `[gemini-failover] Model "${geminiModel}" returned 404/not supported. Trying next fallback model...`
              );
              continue;
            }

            if (isRateLimitOrQuota) {
              console.warn(
                `[gemini-failover] Key "${kObj.label || 'key'}" hit rate-limit/quota on model "${geminiModel}". Failing over to next key...`
              );
              break; // Try next key
            }

            console.warn(`[gemini-failover] Model "${geminiModel}" error: ${errBody}. Trying next candidate model...`);
            continue;
          } catch (gErr: any) {
            lastGeminiErr = gErr.message;
            continue;
          }
        }
      }

      // If all keys and fallback models failed, return graceful 502 with friendly error
      return json(
        {
          success: false,
          error: `Gemini API Error: AI model service temporarily unavailable (${lastGeminiErr || 'All fallback models failed'}). Please verify your Gemini API key in the API Vault or switch to OpenRouter.`
        },
        { status: 502 }
      );
    }

    // 2. OpenRouter & OpenAI-compatible execution with Multi-Model & Multi-Key Failover
    if (resolvedProvider in OPENAI_COMPATIBLE_ENDPOINTS && candidateKeys.length > 0) {
      const endpoint = OPENAI_COMPATIBLE_ENDPOINTS[resolvedProvider];

      let candidateModels: string[] = [];
      if (resolvedProvider === 'openrouter') {
        if (body.openrouterModels && body.openrouterModels.length > 0) {
          candidateModels = body.openrouterModels;
        } else if (vaultKey?.models && vaultKey.models.length > 0) {
          candidateModels = vaultKey.models;
        } else if (body.routingStrategy === 'auto_free_rotate') {
          candidateModels = [
            vaultKey?.model || 'meta-llama/llama-3.3-70b-instruct:free',
            'google/gemini-2.0-flash-exp:free',
            'deepseek/deepseek-r1:free',
            'mistralai/mistral-7b-instruct:free',
            'qwen/qwen-2.5-coder-32b-instruct:free'
          ];
        } else {
          candidateModels = [vaultKey?.model || DEFAULT_MODELS.openrouter];
        }
      } else {
        candidateModels = [vaultKey?.model || DEFAULT_MODELS[resolvedProvider] || 'gpt-4o'];
      }

      let lastError = '';
      let successfulReply = '';
      let successfulModel = candidateModels[0];
      let successfulKeyLabel = '';

      openAiCompatibleKeyLoop: for (const keyObj of candidateKeys) {
        const currentKey = keyObj.key;
        if (!currentKey) continue;

        for (const modelToTry of candidateModels) {
          try {
            const providerRes = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentKey}`,
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
              successfulKeyLabel = keyObj.label || '';
              break openAiCompatibleKeyLoop;
            }

            const errMsg = providerData?.error?.message || `Provider returned HTTP ${providerRes.status}`;
            lastError = errMsg;

            const isRateLimitOrQuota =
              providerRes.status === 429 ||
              providerRes.status === 402 ||
              /rate limit|quota|credits|exceeded|too many requests|insufficient_quota/i.test(errMsg);

            if (isRateLimitOrQuota) {
              console.warn(
                `[${resolvedProvider}-failover] Model "${modelToTry}" with key "${keyObj.label || 'key'}" hit rate-limit/quota (${providerRes.status}: ${errMsg}). Failing over...`
              );
              continue;
            } else {
              console.warn(
                `[${resolvedProvider}-failover] Model "${modelToTry}" error: ${errMsg}. Trying next candidate...`
              );
              continue;
            }
          } catch (fetchErr: any) {
            lastError = fetchErr.message;
            continue;
          }
        }
      }

      if (successfulReply) {
        return json({
          success: true,
          input: message,
          delegatedHelper: delegatedHelperMeta,
          delegatedPipeline: delegatedPipelineMeta,
          recommendedHelper: recommendedHelperMeta,
          result: {
            type: 'text',
            text: successfulReply
          },
          provider: resolvedProvider,
          model: successfulModel,
          keyLabel: successfulKeyLabel
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
        message,
        apiKey: resolvedApiKey
      })
    });

    if (!engineResponse.ok) {
      const errText = await engineResponse.text();
      return json(
        {
          success: false,
          error: `AI engine service temporarily unavailable (${engineResponse.status}). Please check your API key in the API Vault.`
        },
        { status: engineResponse.status }
      );
    }

    const data = await engineResponse.json();

    // Catch any legacy backend brain errors (like GoogleGenerativeAI 404) and present gracefully
    if (data.result?.text && /GoogleGenerativeAI Error|404 Not Found|Brain Error/i.test(data.result.text)) {
      return json({
        success: false,
        error: 'The AI model service encountered a temporary error. Please verify your Gemini API key in the API Vault or switch to OpenRouter.'
      }, { status: 502 });
    }

    // Never leak accidental Railway tool matching when no delegation was intended
    if (!delegatedHelperMeta && data.result?.toolMatched) {
      data.result.toolMatched = undefined;
    }

    return json({
      ...data,
      delegatedHelper: delegatedHelperMeta,
      delegatedPipeline: delegatedPipelineMeta,
      recommendedHelper: recommendedHelperMeta,
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
