<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import {
    apiVault,
    addVaultKey,
    removeVaultKey,
    setDefaultVaultKey,
    toggleVaultKeyEnabled,
    routingStrategy,
    setRoutingStrategy,
    providerToggles,
    setProviderToggle,
    adminAllowedProviders,
    type ApiVaultKey,
    type AIProvider,
    type RoutingStrategy
  } from '$lib/stores/userStore';
  import { encryptVaultKey, decryptVaultKey } from '$lib/services/crypto';
  import { onMount } from 'svelte';

  interface ProviderMeta {
    id: AIProvider;
    name: string;
    description: string;
    placeholder: string;
    defaultModel: string;
    docsUrl: string;
    icon: string;
    badge?: string;
  }

  const ALL_PROVIDERS: ProviderMeta[] = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Official Google Gemini models. Free API keys available on Google AI Studio.',
      placeholder: 'AIzaSy...',
      defaultModel: 'gemini-2.0-flash',
      docsUrl: 'https://aistudio.google.com/app/apikey',
      icon: 'Sparkles',
      badge: 'Free Tier Available'
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Unified AI gateway with 200+ models. Includes free zero-cost models and paid flagships.',
      placeholder: 'sk-or-v1-...',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
      docsUrl: 'https://openrouter.ai/keys',
      icon: 'Cpu',
      badge: 'Free & Top-Up'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4o, GPT-4o-mini, and OpenAI reasoning models.',
      placeholder: 'sk-proj-...',
      defaultModel: 'gpt-4o',
      docsUrl: 'https://platform.openai.com/api-keys',
      icon: 'Bot'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'DeepSeek-V3 and DeepSeek-R1 reasoning models at ultra-low token cost.',
      placeholder: 'sk-...',
      defaultModel: 'deepseek-chat',
      docsUrl: 'https://platform.deepseek.com/api_keys',
      icon: 'Zap'
    },
    {
      id: 'grok',
      name: 'xAI (Grok)',
      description: 'Grok-2 and Grok-3 models with real-time knowledge.',
      placeholder: 'xai-...',
      defaultModel: 'grok-3',
      docsUrl: 'https://console.x.ai/',
      icon: 'Terminal'
    },
    {
      id: 'replicate',
      name: 'Replicate (Image AI)',
      description: 'Optional paid provider for high-tier Flux Pro and SDXL image models.',
      placeholder: 'r8_...',
      defaultModel: 'black-forest-labs/flux-schnell',
      docsUrl: 'https://replicate.com/account/api-tokens',
      icon: 'Image'
    }
  ];

  interface SyncedModel {
    id: string;
    name: string;
    description: string;
    contextLength: number;
    isFree: boolean;
    promptPrice: string;
    completionPrice: string;
  }

  // Filter providers to only those allowed by platform admin
  const visibleProviders = $derived(
    ALL_PROVIDERS.filter((p) => $adminAllowedProviders[p.id] !== false)
  );

  // Key form state
  let selectedProviderForInput = $state<AIProvider>('openrouter');
  let inputKey = $state('');
  let inputLabel = $state('');
  let saveSuccessMsg = $state('');
  let isSavingKey = $state(false);

  // Model explorer state
  let isSyncingModels = $state(false);
  let syncedFreeModels = $state<SyncedModel[]>([]);
  let syncedPaidModels = $state<SyncedModel[]>([]);
  let modelSearchQuery = $state('');
  let modelTabFilter = $state<'all' | 'free' | 'paid'>('all');
  let selectedActiveModel = $state<string>('');

  // Find existing key for provider
  function getExistingKey(provider: AIProvider): ApiVaultKey | undefined {
    return $apiVault.find((k) => k.provider === provider);
  }

  async function syncModelsFromOpenRouter() {
    isSyncingModels = true;
    try {
      const openrouterKeyObj = getExistingKey('openrouter');
      let queryParam = '';
      if (openrouterKeyObj) {
        const decrypted = decryptVaultKey(openrouterKeyObj.encryptedKey, 'openrouter');
        if (decrypted) queryParam = `?apiKey=${encodeURIComponent(decrypted)}`;
      }

      const res = await fetch(`/api/models/openrouter${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          syncedFreeModels = data.freeModels || [];
          syncedPaidModels = data.paidModels || [];
        }
      }
    } catch (e) {
      console.warn('Failed to sync OpenRouter models:', e);
    } finally {
      isSyncingModels = false;
    }
  }

  onMount(() => {
    syncModelsFromOpenRouter();
  });

  function handleSaveKey(provider: AIProvider) {
    if (!inputKey.trim()) return;
    isSavingKey = true;
    saveSuccessMsg = '';

    try {
      const pMeta = ALL_PROVIDERS.find((p) => p.id === provider);
      const encrypted = encryptVaultKey(inputKey.trim(), provider);
      addVaultKey({
        provider,
        label: inputLabel.trim() || `${pMeta?.name || provider} Primary Key`,
        encryptedKey: encrypted,
        model: pMeta?.defaultModel,
        isDefault: $apiVault.length === 0,
        isEnabled: true
      });

      inputKey = '';
      inputLabel = '';
      saveSuccessMsg = `✅ ${pMeta?.name || provider} API Key saved successfully.`;
      setTimeout(() => (saveSuccessMsg = ''), 4000);

      if (provider === 'openrouter') {
        syncModelsFromOpenRouter();
      }
    } finally {
      isSavingKey = false;
    }
  }

  function handleSelectModelAsActive(modelId: string, isFree: boolean) {
    selectedActiveModel = modelId;
    // Update OpenRouter vault key model if present
    const openrouterKey = getExistingKey('openrouter');
    if (openrouterKey) {
      apiVault.update((keys) =>
        keys.map((k) => (k.id === openrouterKey.id ? { ...k, model: modelId } : k))
      );
    }
    saveSuccessMsg = `✅ Selected "${modelId}" as active model.`;
    setTimeout(() => (saveSuccessMsg = ''), 3000);
  }

  // Filtered models for explorer
  const filteredModels = $derived.by(() => {
    let list: SyncedModel[] = [];
    if (modelTabFilter === 'all') {
      list = [...syncedFreeModels, ...syncedPaidModels];
    } else if (modelTabFilter === 'free') {
      list = [...syncedFreeModels];
    } else {
      list = [...syncedPaidModels];
    }

    if (!modelSearchQuery.trim()) return list;
    const q = modelSearchQuery.toLowerCase();
    return list.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  });
</script>

<div class="h-full flex flex-col space-y-6 overflow-y-auto pr-1 pb-12">
  <!-- Header Banner -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 ui-banner-navy text-white p-5 sm:p-6 rounded-3xl">
    <div class="space-y-1">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38CFFF]/15 border border-[#38CFFF]/35 text-[#38CFFF] text-[10px] font-extrabold uppercase tracking-wider">
        <Icon name="Key" size={12} />
        <span>Bring Your Own Key (BYOK) & Multi-Model Engine</span>
      </div>
      <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
        <span>API Key Management & Model Hub</span>
      </h2>
      <p class="text-xs text-white/80 max-w-2xl leading-relaxed">
        Configure your private AI provider keys, choose auto-rotation across free models, or lock into your preferred flagship model. All keys are encrypted client-side with AES-GCM.
      </p>
    </div>

    <!-- Quick Action / OpenRouter Docs Link -->
    <div class="shrink-0">
      <button
        type="button"
        onclick={syncModelsFromOpenRouter}
        disabled={isSyncingModels}
        class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
      >
        <Icon name="RefreshCw" size={14} class={isSyncingModels ? 'animate-spin' : ''} />
        <span>{isSyncingModels ? 'Syncing Models...' : 'Sync Models'}</span>
      </button>
    </div>
  </div>

  {#if saveSuccessMsg}
    <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in duration-200 flex items-center gap-2">
      <Icon name="CheckCircle2" size={16} class="text-emerald-600 shrink-0" />
      <span>{saveSuccessMsg}</span>
    </div>
  {/if}

  <!-- ====================================================================== -->
  <!-- 1. ROUTING STRATEGY SELECTION -->
  <!-- ====================================================================== -->
  <div class="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#CFE2FA] shadow-xs space-y-4">
    <div>
      <h3 class="text-sm font-extrabold text-[#102A56] flex items-center gap-2">
        <Icon name="Cpu" size={16} class="text-[#1677FF]" />
        <span>Execution & Routing Strategy</span>
      </h3>
      <p class="text-xs text-[#5E7694] mt-0.5">
        Choose how the AI CEO and 75 Specialist Helpers execute prompts across your models.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <!-- Option 1: Auto Free Model Rotation -->
      <button
        type="button"
        onclick={() => setRoutingStrategy('auto_free_rotate')}
        class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {$routingStrategy === 'auto_free_rotate' ? 'border-[#1677FF] bg-[#1677FF]/5 ring-2 ring-[#1677FF]/20 shadow-xs' : 'border-[#CFE2FA] bg-white hover:border-[#1677FF]/40'}"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Free
            </span>
            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center {$routingStrategy === 'auto_free_rotate' ? 'border-[#1677FF] bg-[#1677FF]' : 'border-[#CFE2FA]'}">
              {#if $routingStrategy === 'auto_free_rotate'}
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              {/if}
            </span>
          </div>
          <h4 class="text-xs font-bold text-[#102A56]">Auto Free Model Rotation</h4>
          <p class="text-[11px] text-[#5E7694] leading-relaxed">
            Automatically routes and load-balances across OpenRouter Free models (`:free`). If one hits a rate limit, it instantly falls back to another free model.
          </p>
        </div>
      </button>

      <!-- Option 2: Single Dedicated Model -->
      <button
        type="button"
        onclick={() => setRoutingStrategy('single_model')}
        class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {$routingStrategy === 'single_model' ? 'border-[#1677FF] bg-[#1677FF]/5 ring-2 ring-[#1677FF]/20 shadow-xs' : 'border-[#CFE2FA] bg-white hover:border-[#1677FF]/40'}"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#F3F8FF] text-[#1677FF] border border-[#CFE2FA]">
              Fixed Pin
            </span>
            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center {$routingStrategy === 'single_model' ? 'border-[#1677FF] bg-[#1677FF]' : 'border-[#CFE2FA]'}">
              {#if $routingStrategy === 'single_model'}
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              {/if}
            </span>
          </div>
          <h4 class="text-xs font-bold text-[#102A56]">Single Dedicated Model</h4>
          <p class="text-[11px] text-[#5E7694] leading-relaxed">
            Direct all requests to one specific chosen model (e.g. Gemini 2.0 Flash, Llama 3.3 70B, or GPT-4o) without rotation.
          </p>
        </div>
      </button>

      <!-- Option 3: Multi-Provider Rotation -->
      <button
        type="button"
        onclick={() => setRoutingStrategy('multi_provider_rotate')}
        class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {$routingStrategy === 'multi_provider_rotate' ? 'border-[#1677FF] bg-[#1677FF]/5 ring-2 ring-[#1677FF]/20 shadow-xs' : 'border-[#CFE2FA] bg-white hover:border-[#1677FF]/40'}"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              High Availability
            </span>
            <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center {$routingStrategy === 'multi_provider_rotate' ? 'border-[#1677FF] bg-[#1677FF]' : 'border-[#CFE2FA]'}">
              {#if $routingStrategy === 'multi_provider_rotate'}
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              {/if}
            </span>
          </div>
          <h4 class="text-xs font-bold text-[#102A56]">Multi-Provider Rotation</h4>
          <p class="text-[11px] text-[#5E7694] leading-relaxed">
            Distribute operations across all your enabled active provider keys (Gemini, OpenRouter, OpenAI, Groq, DeepSeek).
          </p>
        </div>
      </button>
    </div>
  </div>

  <!-- ====================================================================== -->
  <!-- 2. ALLOWED PROVIDER KEYS & ON/OFF TOGGLES -->
  <!-- ====================================================================== -->
  <div class="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#CFE2FA] shadow-xs space-y-4">
    <div>
      <h3 class="text-sm font-extrabold text-[#102A56] flex items-center gap-2">
        <Icon name="KeyRound" size={16} class="text-[#1677FF]" />
        <span>Configured API Providers ({visibleProviders.length} Enabled by Admin)</span>
      </h3>
      <p class="text-xs text-[#5E7694] mt-0.5">
        Toggle providers ON/OFF or add your personal API keys below.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {#each visibleProviders as p (p.id)}
        {@const existingKey = getExistingKey(p.id)}
        {@const isToggledOn = $providerToggles[p.id] !== false}

        <div class="p-4 rounded-2xl bg-white border border-[#CFE2FA] shadow-2xs space-y-3">
          <!-- Provider Header & Toggle -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF]">
                <Icon name={p.icon} size={16} />
              </div>
              <div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4 class="text-xs font-bold text-[#102A56]">{p.name}</h4>
                  {#if p.badge}
                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.badge}
                    </span>
                  {/if}
                </div>
                <a
                  href={p.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[10px] text-[#1677FF] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Get API Key</span>
                  <Icon name="ExternalLink" size={10} />
                </a>
              </div>
            </div>

            <!-- Active On/Off Toggle Button -->
            <button
              type="button"
              onclick={() => setProviderToggle(p.id, !isToggledOn)}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {isToggledOn ? 'bg-[#1677FF]' : 'bg-gray-200'}"
              role="switch"
              aria-checked={isToggledOn}
              title={isToggledOn ? 'Provider is Active' : 'Provider is Disabled'}
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {isToggledOn ? 'translate-x-5' : 'translate-x-0'}"
              ></span>
            </button>
          </div>

          <p class="text-[11px] text-[#5E7694] leading-relaxed">
            {p.description}
          </p>

          <!-- Current Key Status -->
          <div class="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
            {#if existingKey}
              <div class="flex items-center gap-1.5 text-emerald-700">
                <Icon name="Check" size={14} class="text-emerald-600" />
                <span class="font-bold text-[11px]">Key Active (••••••••)</span>
              </div>
              <button
                type="button"
                onclick={() => removeVaultKey(existingKey.id)}
                class="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Remove
              </button>
            {:else}
              <span class="text-[11px] text-[#889DB5] font-medium">No key configured yet</span>
              <button
                type="button"
                onclick={() => {
                  selectedProviderForInput = p.id;
                  inputKey = '';
                }}
                class="text-[11px] text-[#1677FF] font-bold hover:underline cursor-pointer"
              >
                + Add Key
              </button>
            {/if}
          </div>

          <!-- Add Key Inline Form if Selected -->
          {#if selectedProviderForInput === p.id}
            <div class="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3ECF7] space-y-2.5 animate-in fade-in duration-150">
              <input
                type="password"
                bind:value={inputKey}
                placeholder={p.placeholder}
                class="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#CFE2FA] bg-white focus:outline-none focus:border-[#1677FF]"
              />
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onclick={() => (selectedProviderForInput = 'openrouter')}
                  class="px-2.5 py-1 text-[11px] text-[#5E7694] hover:text-[#102A56] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!inputKey.trim() || isSavingKey}
                  onclick={() => handleSaveKey(p.id)}
                  class="px-3 py-1.5 rounded-lg blue-btn text-white text-[11px] font-bold cursor-pointer disabled:opacity-40"
                >
                  Save Key
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- ====================================================================== -->
  <!-- 3. OPENROUTER MODEL SYNC & EXPLORER (Free Models Prioritized on Top) -->
  <!-- ====================================================================== -->
  <div class="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#CFE2FA] shadow-xs space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-extrabold text-[#102A56] flex items-center gap-2">
          <Icon name="Sparkles" size={16} class="text-[#1677FF]" />
          <span>OpenRouter Model Hub ({syncedFreeModels.length} Free Models Available)</span>
        </h3>
        <p class="text-xs text-[#5E7694] mt-0.5">
          Free models are pinned on top with zero token deductions. Paid top-up models are listed below.
        </p>
      </div>

      <!-- Tab Filter: All / Free / Paid -->
      <div class="inline-flex p-1 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] text-xs font-bold shrink-0">
        <button
          type="button"
          onclick={() => (modelTabFilter = 'all')}
          class="px-3 py-1 rounded-lg transition-all cursor-pointer {modelTabFilter === 'all' ? 'bg-[#1677FF] text-white shadow-2xs' : 'text-[#4B6382] hover:text-[#102A56]'}"
        >
          All ({syncedFreeModels.length + syncedPaidModels.length})
        </button>
        <button
          type="button"
          onclick={() => (modelTabFilter = 'free')}
          class="px-3 py-1 rounded-lg transition-all cursor-pointer {modelTabFilter === 'free' ? 'bg-[#1677FF] text-white shadow-2xs' : 'text-[#4B6382] hover:text-[#102A56]'}"
        >
          Free ({syncedFreeModels.length})
        </button>
        <button
          type="button"
          onclick={() => (modelTabFilter = 'paid')}
          class="px-3 py-1 rounded-lg transition-all cursor-pointer {modelTabFilter === 'paid' ? 'bg-[#1677FF] text-white shadow-2xs' : 'text-[#4B6382] hover:text-[#102A56]'}"
        >
          Paid ({syncedPaidModels.length})
        </button>
      </div>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <input
        type="text"
        bind:value={modelSearchQuery}
        placeholder="Search models (e.g. llama-3.3, gemini, deepseek, mistral)..."
        class="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE2FA] text-xs text-[#102A56] placeholder-[#889DB5] focus:outline-none focus:border-[#1677FF] bg-white shadow-2xs"
      />
    </div>

    <!-- Models Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
      {#each filteredModels as m (m.id)}
        <div
          class="p-3.5 rounded-2xl border transition-all flex flex-col justify-between {m.isFree
            ? 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-400'
            : 'bg-white border-[#E3ECF7] hover:border-[#CFE2FA]'}"
        >
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-1.5">
              {#if m.isFree}
                <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500 text-white shadow-2xs">
                  FREE
                </span>
              {:else}
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#CFE2FA]">
                  {m.promptPrice}
                </span>
              {/if}

              <span class="text-[9px] text-[#889DB5] font-mono">
                {(m.contextLength / 1024).toFixed(0)}k ctx
              </span>
            </div>

            <h4 class="text-xs font-bold text-[#102A56] leading-tight break-words">
              {m.name}
            </h4>
            <p class="text-[10px] text-[#5E7694] font-mono truncate">
              {m.id}
            </p>
            {#if m.description}
              <p class="text-[11px] text-[#5E7694] line-clamp-2 leading-relaxed">
                {m.description}
              </p>
            {/if}
          </div>

          <div class="pt-2.5 mt-2 border-t border-[#F1F5F9] flex items-center justify-between">
            <span class="text-[10px] font-bold {m.isFree ? 'text-emerald-700' : 'text-[#4B6382]'}">
              {m.isFree ? 'Zero Cost' : 'Top-Up Required'}
            </span>

            <button
              type="button"
              onclick={() => handleSelectModelAsActive(m.id, m.isFree)}
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer {selectedActiveModel === m.id
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-[#F3F8FF] hover:bg-[#E4F0FF] text-[#1677FF] border border-[#CFE2FA]'}"
            >
              {selectedActiveModel === m.id ? '✓ Selected' : 'Use Model'}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
