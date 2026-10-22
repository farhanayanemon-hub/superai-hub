<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
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
    openrouterSelectedModels,
    setOpenRouterSelectedModels,
    addOpenRouterSelectedModel,
    removeOpenRouterSelectedModel,
    subscription,
    currentUser,
    activeDashboardTab,
    getEffectivePlanTier,
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

  // Cloud Managed plan check: hide BYOK if user is on Cloud Managed
  const isCloudManaged = $derived(
    $subscription?.tier === 'managed' || $currentUser?.tier === 'managed'
  );

  // Effective Plan Tier derivation & BYOK Pro gating
  const effectiveTier = $derived(
    getEffectivePlanTier($subscription?.tier || $currentUser?.tier, $subscription?.status === 'active' || !!$currentUser?.isSubscribed)
  );
  const isByokPro = $derived(effectiveTier === 'byok_pro' || effectiveTier === 'managed');
  const isByokStarter = $derived(effectiveTier === 'byok_starter' || effectiveTier === 'free');

  // Upgrade Modal State
  let isUpgradeModalOpen = $state(false);
  let upgradeFeatureTitle = $state('Pro Plan Feature');
  let upgradeFeatureDesc = $state('Upgrade to Pro Plan to unlock multi-key vaults, auto-failover, and custom model routing chains.');

  function triggerProUpgrade(featureTitle: string, featureDesc: string) {
    upgradeFeatureTitle = featureTitle;
    upgradeFeatureDesc = featureDesc;
    isUpgradeModalOpen = true;
  }

  // Filter providers to only those allowed by platform admin
  const visibleProviders = $derived(
    ALL_PROVIDERS.filter((p) => $adminAllowedProviders[p.id] !== false)
  );

  // Multi-Key input states
  let activeAddKeyProvider = $state<AIProvider | null>(null);
  let inputKeyValues = $state<Record<string, string>>({});
  let inputLabelValues = $state<Record<string, string>>({});
  let saveSuccessMsg = $state('');
  let isSavingKey = $state(false);

  // OpenRouter Model explorer state
  let isSyncingModels = $state(false);
  let syncedFreeModels = $state<SyncedModel[]>([]);
  let syncedPaidModels = $state<SyncedModel[]>([]);
  let modelSearchQuery = $state('');
  let modelTabFilter = $state<'all' | 'free' | 'paid'>('all');

  function getMaskedKey(k: ApiVaultKey): string {
    try {
      const plain = decryptVaultKey(k.encryptedKey, k.provider);
      if (!plain) return '••••••••••••';
      const last4 = plain.length >= 4 ? plain.slice(-4) : plain;
      return `••••••••${last4}`;
    } catch {
      return '••••••••••••';
    }
  }

  function getKeysForProvider(provider: AIProvider): ApiVaultKey[] {
    return $apiVault.filter((k) => k.provider === provider);
  }

  async function syncModelsFromOpenRouter() {
    isSyncingModels = true;
    try {
      const openrouterKeys = getKeysForProvider('openrouter');
      let queryParam = '';
      if (openrouterKeys.length > 0) {
        const decrypted = decryptVaultKey(openrouterKeys[0].encryptedKey, 'openrouter');
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

  function openAddKeyForm(providerId: AIProvider) {
    const existing = getKeysForProvider(providerId);
    if (isByokStarter && existing.length >= 1) {
      const pMeta = ALL_PROVIDERS.find((p) => p.id === providerId);
      triggerProUpgrade(
        'Multiple Keys for ' + (pMeta?.name || providerId),
        'Starter Plan includes 1 active API key per provider. Upgrade to Pro Plan to add unlimited backup keys with automatic round-robin load balancing and instant rate-limit failover.'
      );
      return;
    }
    activeAddKeyProvider = providerId;
    inputKeyValues[providerId] = '';
    inputLabelValues[providerId] = '';
  }

  function closeAddKeyForm() {
    activeAddKeyProvider = null;
  }

  function handleSaveKey(provider: AIProvider) {
    const rawKey = (inputKeyValues[provider] || '').trim();
    if (!rawKey) return;
    isSavingKey = true;
    saveSuccessMsg = '';

    try {
      const pMeta = ALL_PROVIDERS.find((p) => p.id === provider);
      const encrypted = encryptVaultKey(rawKey, provider);
      const existingCount = $apiVault.filter((k) => k.provider === provider).length;
      const customLabel = (inputLabelValues[provider] || '').trim();
      const finalLabel = customLabel || `${pMeta?.name || provider} Key ${existingCount + 1}`;

      addVaultKey({
        provider,
        label: finalLabel,
        encryptedKey: encrypted,
        model: pMeta?.defaultModel,
        isDefault: $apiVault.length === 0,
        isEnabled: true
      });

      inputKeyValues[provider] = '';
      inputLabelValues[provider] = '';
      activeAddKeyProvider = null;
      saveSuccessMsg = `✅ ${pMeta?.name || provider} API Key saved successfully.`;
      setTimeout(() => (saveSuccessMsg = ''), 4000);

      if (provider === 'openrouter') {
        syncModelsFromOpenRouter();
      }
    } finally {
      isSavingKey = false;
    }
  }

  function getModelDisplayName(modelId: string): string {
    const found = [...syncedFreeModels, ...syncedPaidModels].find((m) => m.id === modelId);
    if (found) return found.name;
    const parts = modelId.split('/');
    return parts[parts.length - 1] || modelId;
  }

  function isModelFree(modelId: string): boolean {
    if (modelId.endsWith(':free')) return true;
    const found = [...syncedFreeModels, ...syncedPaidModels].find((m) => m.id === modelId);
    return found?.isFree ?? false;
  }

  function moveModelUp(index: number) {
    if (index <= 0) return;
    const current = [...$openrouterSelectedModels];
    const temp = current[index - 1];
    current[index - 1] = current[index];
    current[index] = temp;
    setOpenRouterSelectedModels(current);
  }

  function moveModelDown(index: number) {
    if (index >= $openrouterSelectedModels.length - 1) return;
    const current = [...$openrouterSelectedModels];
    const temp = current[index + 1];
    current[index + 1] = current[index];
    current[index] = temp;
    setOpenRouterSelectedModels(current);
  }

  function handleSelectStrategy(strategy: RoutingStrategy) {
    if (strategy !== 'single_model' && isByokStarter) {
      triggerProUpgrade(
        strategy === 'auto_free_rotate' ? 'Auto Free Model Rotation' : 'Multi-Provider Key Rotation',
        'Model rotation and failover strategies require Pro Plan. Upgrade today to automatically rotate across models and prevent rate limits.'
      );
      return;
    }
    setRoutingStrategy(strategy);
  }

  function toggleModelInChain(modelId: string) {
    if ($openrouterSelectedModels.includes(modelId)) {
      removeOpenRouterSelectedModel(modelId);
    } else {
      if (isByokStarter && $openrouterSelectedModels.length >= 1) {
        triggerProUpgrade(
          'Multi-Model Failover Chains',
          'Starter Plan supports 1 active primary model. Upgrade to Pro Plan to configure multi-model failover chains with automatic fallback when rate limits occur.'
        );
        return;
      }
      addOpenRouterSelectedModel(modelId);
    }
  }

  // Filtered OpenRouter models (Free models pinned on top)
  const filteredOpenRouterModels = $derived.by(() => {
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
  {#if isCloudManaged}
    <!-- ====================================================================== -->
    <!-- CLOUD MANAGED PLAN BANNER (BYOK FORMS HIDDEN) -->
    <!-- ====================================================================== -->
    <div class="p-8 sm:p-10 rounded-3xl ui-banner-navy text-white shadow-xl relative overflow-hidden space-y-6">
      <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider w-fit">
        <Icon name="ShieldCheck" size={15} class="text-emerald-400" />
        <span>Enterprise Managed Mode Active</span>
      </div>

      <div class="space-y-3">
        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          You are on Cloud Managed Plan
        </h2>
        <p class="text-sm sm:text-base text-white/90 max-w-2xl font-medium leading-relaxed">
          All AI models and API keys are centrally managed by Ezbo Cloud. Zero configuration needed!
        </p>
      </div>

      <!-- Feature Pillars -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
          <div class="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <Icon name="Bot" size={16} class="text-[#38CFFF]" />
            <span>Bespoke Agents Unlocked</span>
          </div>
          <p class="text-[11px] text-white/75 leading-relaxed">
            Full unlimited access across Web, WhatsApp, and Telegram with zero setup.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
          <div class="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <Icon name="Cpu" size={16} class="text-[#38CFFF]" />
            <span>Automated Multi-Model AI</span>
          </div>
          <p class="text-[11px] text-white/75 leading-relaxed">
            High-performance flagship models dynamically routed with instant cloud failover.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
          <div class="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <Icon name="Zap" size={16} class="text-emerald-400" />
            <span>Zero Quota Worries</span>
          </div>
          <p class="text-[11px] text-white/75 leading-relaxed">
            No personal API tokens or external billing accounts required.
          </p>
        </div>
      </div>
    </div>
  {:else}
    <!-- ====================================================================== -->
    <!-- BYOK MODE: HEADER BANNER -->
    <!-- ====================================================================== -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 ui-banner-navy text-white p-5 sm:p-6 rounded-3xl">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38CFFF]/15 border border-[#38CFFF]/35 text-[#38CFFF] text-[10px] font-extrabold uppercase tracking-wider">
          <Icon name="Key" size={12} />
          <span>Private Key Vault & Multi-Model Engine</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <span>API Key Management</span>
        </h2>
        <p class="text-xs text-white/80 max-w-2xl leading-relaxed">
          Configure your private AI provider keys with multi-key round-robin auto-failover, or set custom model failover chains. All keys are encrypted client-side with AES-GCM.
        </p>
      </div>

      <!-- Quick Action / OpenRouter Sync -->
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
          Choose how the Master AI CEO and bespoke agents execute prompts across your models.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Option 1: Auto Free Model Rotation -->
        <button
          type="button"
          onclick={() => handleSelectStrategy('auto_free_rotate')}
          class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {$routingStrategy === 'auto_free_rotate' ? 'border-[#1677FF] bg-[#1677FF]/5 ring-2 ring-[#1677FF]/20 shadow-xs' : 'border-[#CFE2FA] bg-white hover:border-[#1677FF]/40'}"
        >
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <BrandIcon name="openrouter" size={16} />
                <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Free
                </span>
                {#if isByokStarter}
                  <span class="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-[#1677FF] text-white flex items-center gap-0.5">
                    <Icon name="Lock" size={9} />
                    <span>PRO</span>
                  </span>
                {/if}
              </div>
              <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center {$routingStrategy === 'auto_free_rotate' ? 'border-[#1677FF] bg-[#1677FF]' : 'border-[#CFE2FA]'}">
                {#if $routingStrategy === 'auto_free_rotate'}
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                {/if}
              </span>
            </div>
            <h4 class="text-xs font-bold text-[#102A56] flex items-center gap-1">
              <span>Auto Free Model Rotation</span>
            </h4>
            <p class="text-[11px] text-[#5E7694] leading-relaxed">
              Automatically routes and load-balances across OpenRouter Free models (`:free`). If one hits a rate limit, it instantly falls back to another free model.
            </p>
          </div>
        </button>

        <!-- Option 2: Single Dedicated Model -->
        <button
          type="button"
          onclick={() => handleSelectStrategy('single_model')}
          class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {$routingStrategy === 'single_model' ? 'border-[#1677FF] bg-[#1677FF]/5 ring-2 ring-[#1677FF]/20 shadow-xs' : 'border-[#CFE2FA] bg-white hover:border-[#1677FF]/40'}"
        >
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <BrandIcon name="gemini" size={16} />
                <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#F3F8FF] text-[#1677FF] border border-[#CFE2FA]">
                  Fixed Pin
                </span>
              </div>
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
          onclick={() => handleSelectStrategy('multi_provider_rotate')}
          class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {$routingStrategy === 'multi_provider_rotate' ? 'border-[#1677FF] bg-[#1677FF]/5 ring-2 ring-[#1677FF]/20 shadow-xs' : 'border-[#CFE2FA] bg-white hover:border-[#1677FF]/40'}"
        >
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="flex items-center -space-x-1">
                  <BrandIcon name="gemini" size={13} />
                  <BrandIcon name="openai" size={13} />
                  <BrandIcon name="deepseek" size={13} />
                </div>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Multi-Key
                </span>
                {#if isByokStarter}
                  <span class="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-[#1677FF] text-white flex items-center gap-0.5">
                    <Icon name="Lock" size={9} />
                    <span>PRO</span>
                  </span>
                {/if}
              </div>
              <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center {$routingStrategy === 'multi_provider_rotate' ? 'border-[#1677FF] bg-[#1677FF]' : 'border-[#CFE2FA]'}">
                {#if $routingStrategy === 'multi_provider_rotate'}
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                {/if}
              </span>
            </div>
            <h4 class="text-xs font-bold text-[#102A56] flex items-center gap-1">
              <span>Multi-Provider Rotation</span>
            </h4>
            <p class="text-[11px] text-[#5E7694] leading-relaxed">
              Distribute operations across all your enabled active provider keys with automated round-robin and rate-limit failover.
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- ====================================================================== -->
    <!-- 2. CONFIGURED PROVIDER CARDS (MULTI-KEY & IN-CARD OPENROUTER SELECTOR) -->
    <!-- ====================================================================== -->
    <div class="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#CFE2FA] shadow-xs space-y-4">
      <div>
        <h3 class="text-sm font-extrabold text-[#102A56] flex items-center gap-2">
          <Icon name="KeyRound" size={16} class="text-[#1677FF]" />
          <span>Configured API Providers ({visibleProviders.length} Enabled by Admin)</span>
        </h3>
        <p class="text-xs text-[#5E7694] mt-0.5">
          Add multiple keys per provider for smart round-robin load balancing and instant rate-limit failover.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each visibleProviders as p (p.id)}
          {@const providerKeys = getKeysForProvider(p.id)}
          {@const isToggledOn = $providerToggles[p.id] !== false}
          {@const isAddingKey = activeAddKeyProvider === p.id}

          <div class="p-4 sm:p-5 rounded-2xl bg-white border border-[#CFE2FA] shadow-2xs space-y-3.5 flex flex-col justify-between {p.id === 'openrouter' ? 'md:col-span-2' : ''}">
            <div class="space-y-3">
              <!-- Provider Header & Toggle -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                    <BrandIcon name={p.id} size={20} />
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
                  title={isToggledOn ? `${p.name} is Active` : `${p.name} is Disabled`}
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {isToggledOn ? 'translate-x-5' : 'translate-x-0'}"
                  ></span>
                </button>
              </div>

              <p class="text-[11px] text-[#5E7694] leading-relaxed">
                {p.description}
              </p>

              <!-- ========================================================== -->
              <!-- MULTIPLE API KEYS LIST -->
              <!-- ========================================================== -->
              <div class="pt-2 border-t border-[#F1F5F9] space-y-2">
                <div class="flex items-center justify-between text-[11px] font-bold text-[#5E7694]">
                  <span>Active Keys ({providerKeys.length})</span>
                  <button
                    type="button"
                    onclick={() => (isAddingKey ? closeAddKeyForm() : openAddKeyForm(p.id))}
                    class="text-[11px] text-[#1677FF] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Icon name={isAddingKey ? 'X' : providerKeys.length > 0 && isByokStarter ? 'Lock' : 'Plus'} size={12} />
                    <span>{isAddingKey ? 'Cancel' : providerKeys.length > 0 ? '+ Add Another Key' : '+ Add Key'}</span>
                    {#if !isAddingKey && providerKeys.length > 0 && isByokStarter}
                      <span class="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-[#1677FF] text-white shadow-2xs">PRO</span>
                    {/if}
                  </button>
                </div>

                {#if providerKeys.length === 0}
                  <div class="py-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-dashed border-[#CFE2FA] text-[11px] text-[#889DB5] text-center">
                    No keys configured yet. Click "+ Add Key" to configure your credentials.
                  </div>
                {:else}
                  <div class="space-y-1.5">
                    {#each providerKeys as k, kIdx (k.id)}
                      {@const isKeyEnabled = k.isEnabled !== false}
                      <div class="p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 {isKeyEnabled ? 'bg-[#F8FAFC] border-[#CFE2FA]' : 'bg-gray-50 border-gray-200 opacity-60'}">
                        <div class="flex items-center gap-2 min-w-0">
                          <span class="w-2 h-2 rounded-full shrink-0 {isKeyEnabled ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
                          <div class="min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                              <span class="text-xs font-bold text-[#102A56] break-words">{k.label || `${p.name} Key #${kIdx + 1}`}</span>
                              {#if kIdx === 0 && providerKeys.length > 1}
                                <span class="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase bg-blue-50 text-[#1677FF] border border-[#CFE2FA]">
                                  Primary
                                </span>
                              {/if}
                            </div>
                            <div class="text-[10px] font-mono text-[#5E7694]">
                              {getMaskedKey(k)}
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                          <!-- Toggle Key Switch -->
                          <button
                            type="button"
                            onclick={() => toggleVaultKeyEnabled(k.id)}
                            class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {isKeyEnabled ? 'bg-emerald-500' : 'bg-gray-200'}"
                            role="switch"
                            aria-checked={isKeyEnabled}
                            title={isKeyEnabled ? 'Key Active' : 'Key Paused'}
                          >
                            <span
                              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {isKeyEnabled ? 'translate-x-4' : 'translate-x-0'}"
                            ></span>
                          </button>

                          <!-- Delete Key Button -->
                          <button
                            type="button"
                            onclick={() => removeVaultKey(k.id)}
                            class="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer rounded-md hover:bg-rose-50"
                            title="Delete Key"
                          >
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}

                <!-- Inline Add Key Form -->
                {#if isAddingKey}
                  <div class="p-3 rounded-xl bg-[#F0F6FF] border border-[#CFE2FA] space-y-2.5 animate-in fade-in duration-150 mt-2">
                    <div class="space-y-1">
                      <label for="label-{p.id}" class="text-[10px] font-bold text-[#102A56] uppercase tracking-wider">Key Label (Optional)</label>
                      <input
                        id="label-{p.id}"
                        type="text"
                        bind:value={inputLabelValues[p.id]}
                        placeholder={`e.g. "Work Key", "Personal Key", "Backup"`}
                        class="w-full px-3 py-1.5 text-xs rounded-lg border border-[#CFE2FA] bg-white focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>

                    <div class="space-y-1">
                      <label for="key-{p.id}" class="text-[10px] font-bold text-[#102A56] uppercase tracking-wider">API Key String</label>
                      <input
                        id="key-{p.id}"
                        type="password"
                        bind:value={inputKeyValues[p.id]}
                        placeholder={p.placeholder}
                        class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#CFE2FA] bg-white focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onclick={closeAddKeyForm}
                        class="px-2.5 py-1 text-[11px] text-[#5E7694] hover:text-[#102A56] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!inputKeyValues[p.id]?.trim() || isSavingKey}
                        onclick={() => handleSaveKey(p.id)}
                        class="px-3 py-1.5 rounded-lg blue-btn text-white text-[11px] font-bold cursor-pointer disabled:opacity-40"
                      >
                        {isSavingKey ? 'Saving...' : 'Save Key'}
                      </button>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- ========================================================== -->
              <!-- IN-CARD OPENROUTER MODEL MULTI-SELECTOR -->
              <!-- ========================================================== -->
              {#if p.id === 'openrouter'}
                <div class="mt-4 pt-4 border-t border-[#E3ECF7] space-y-3.5">
                  <div class="flex items-center justify-between">
                    <div>
                      <h5 class="text-xs font-black text-[#102A56] flex items-center gap-1.5">
                        <Icon name="Sparkles" size={14} class="text-[#1677FF]" />
                        <span>Model Routing & Failover Chain</span>
                      </h5>
                      <p class="text-[10px] text-[#5E7694] mt-0.5">
                        1st model acts as Primary. If rate-limited (HTTP 429 / Quota), execution automatically fails over to 2nd, 3rd, etc.
                      </p>
                    </div>

                    {#if $openrouterSelectedModels.length > 0}
                      <button
                        type="button"
                        onclick={() => setOpenRouterSelectedModels([])}
                        class="text-[10px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                      >
                        Clear All
                      </button>
                    {/if}
                  </div>

                  <!-- Selected Models Chips in Primary-Fallback Order -->
                  <div class="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E3ECF7] space-y-2.5">
                    <div class="text-[10px] font-bold text-[#5E7694] uppercase tracking-wider flex items-center justify-between">
                      <span>Active Chain ({$openrouterSelectedModels.length} Selected)</span>
                      {#if $openrouterSelectedModels.length === 0}
                        <span class="text-[#889DB5] font-normal normal-case italic">Defaults to free models on execution</span>
                      {/if}
                    </div>

                    {#if $openrouterSelectedModels.length === 0}
                      <div class="py-3 px-4 text-center text-xs text-[#889DB5] border border-dashed border-[#CFE2FA] rounded-xl bg-white">
                        No custom models selected. Select models from the dropdown below to set your failover chain.
                      </div>
                    {:else}
                      <div class="flex flex-wrap gap-2">
                        {#each $openrouterSelectedModels as modelId, idx (modelId)}
                          {@const isFree = isModelFree(modelId)}
                          {@const name = getModelDisplayName(modelId)}
                          <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all max-w-full flex-wrap sm:flex-nowrap {idx === 0 ? 'bg-[#1677FF]/10 border-[#1677FF]/40 text-[#102A56]' : 'bg-white border-[#CFE2FA] text-[#243B53]'}">
                            <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase shrink-0 {idx === 0 ? 'bg-[#1677FF] text-white' : 'bg-gray-100 text-[#5E7694]'}">
                              {idx === 0 ? '#1 Primary' : `#${idx + 1} Fallback`}
                            </span>
                            <div class="shrink-0 flex items-center">
                              <BrandIcon {modelId} size={14} />
                            </div>
                            <span class="break-words font-medium text-[11px] sm:text-xs min-w-0" title={modelId}>{name}</span>
                            {#if isFree}
                              <span class="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-emerald-500 text-white shadow-2xs shrink-0">
                                FREE
                              </span>
                            {/if}

                            <!-- Move Up / Move Down -->
                            {#if idx > 0}
                              <button
                                type="button"
                                title="Move Up"
                                onclick={() => moveModelUp(idx)}
                                class="p-0.5 text-[#5E7694] hover:text-[#102A56] cursor-pointer"
                              >
                                <Icon name="ChevronLeft" size={12} />
                              </button>
                            {/if}
                            {#if idx < $openrouterSelectedModels.length - 1}
                              <button
                                type="button"
                                title="Move Down"
                                onclick={() => moveModelDown(idx)}
                                class="p-0.5 text-[#5E7694] hover:text-[#102A56] cursor-pointer"
                              >
                                <Icon name="ChevronRight" size={12} />
                              </button>
                            {/if}

                            <!-- Remove Button -->
                            <button
                              type="button"
                              title="Remove Model"
                              onclick={() => removeOpenRouterSelectedModel(modelId)}
                              class="ml-0.5 p-0.5 text-[#889DB5] hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Icon name="X" size={12} />
                            </button>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <!-- Search & Filter Controls -->
                  <div class="space-y-2">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div class="relative flex-1">
                        <input
                          type="text"
                          bind:value={modelSearchQuery}
                          placeholder="Search models (e.g. llama-3.3, gemini, deepseek, mistral)..."
                          class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#CFE2FA] bg-white focus:outline-none focus:border-[#1677FF] shadow-2xs"
                        />
                        <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#889DB5]">
                          <Icon name="Search" size={13} />
                        </div>
                      </div>

                      <div class="inline-flex p-0.5 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] text-[10px] font-bold shrink-0 self-start sm:self-auto">
                        <button
                          type="button"
                          onclick={() => (modelTabFilter = 'all')}
                          class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {modelTabFilter === 'all' ? 'bg-[#1677FF] text-white shadow-2xs' : 'text-[#4B6382] hover:text-[#102A56]'}"
                        >
                          All ({syncedFreeModels.length + syncedPaidModels.length})
                        </button>
                        <button
                          type="button"
                          onclick={() => (modelTabFilter = 'free')}
                          class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {modelTabFilter === 'free' ? 'bg-[#1677FF] text-white shadow-2xs' : 'text-[#4B6382] hover:text-[#102A56]'}"
                        >
                          Free ({syncedFreeModels.length})
                        </button>
                        <button
                          type="button"
                          onclick={() => (modelTabFilter = 'paid')}
                          class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {modelTabFilter === 'paid' ? 'bg-[#1677FF] text-white shadow-2xs' : 'text-[#4B6382] hover:text-[#102A56]'}"
                        >
                          Paid ({syncedPaidModels.length})
                        </button>
                      </div>
                    </div>

                    <!-- Scrollable Models Selection Box (Free models pinned on top) -->
                    <div class="max-h-60 overflow-y-auto space-y-1.5 p-2 rounded-2xl border border-[#CFE2FA] bg-white shadow-inner">
                      {#if filteredOpenRouterModels.length === 0}
                        <div class="py-6 text-center text-xs text-[#889DB5]">
                          {isSyncingModels ? 'Syncing models from OpenRouter...' : 'No models match your search.'}
                        </div>
                      {:else}
                        {#each filteredOpenRouterModels as m (m.id)}
                          {@const isSelected = $openrouterSelectedModels.includes(m.id)}
                          {@const selectIndex = $openrouterSelectedModels.indexOf(m.id)}

                          <div class="p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 {isSelected ? 'bg-[#1677FF]/5 border-[#1677FF]/40' : m.isFree ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-300' : 'bg-white border-[#F1F5F9] hover:border-[#CFE2FA]'}">
                            <div class="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                              <div class="w-7 h-7 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                                <BrandIcon modelId={m.id} size={15} />
                              </div>
                              <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                  <span class="text-xs font-bold text-[#102A56] break-words whitespace-normal">{m.name}</span>
                                  {#if m.isFree}
                                    <span class="px-1.5 py-0.2 rounded-full text-[8px] font-extrabold uppercase bg-emerald-500 text-white shadow-2xs shrink-0">
                                      FREE
                                    </span>
                                  {:else}
                                    <span class="px-1.5 py-0.2 rounded text-[8px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#CFE2FA] shrink-0">
                                      {m.promptPrice}
                                    </span>
                                  {/if}
                                </div>
                                <div class="text-[10px] text-[#5E7694] font-mono break-all mt-0.5">{m.id}</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onclick={() => toggleModelInChain(m.id)}
                              class="w-full sm:w-auto px-3.5 py-2 sm:py-1 rounded-lg text-xs sm:text-[10px] font-bold transition-all cursor-pointer shrink-0 text-center justify-center flex items-center gap-1 {isSelected ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs' : 'bg-[#F3F8FF] hover:bg-[#E4F0FF] text-[#1677FF] border border-[#CFE2FA]'}"
                            >
                              {#if isSelected}
                                <span>✓ In Chain (#{selectIndex + 1})</span>
                              {:else if isByokStarter && $openrouterSelectedModels.length >= 1}
                                <Icon name="Lock" size={11} />
                                <span>+ Add to Chain</span>
                                <span class="px-1 py-0.2 rounded text-[7px] font-black uppercase bg-[#1677FF] text-white">PRO</span>
                              {:else}
                                <span>+ Add to Chain</span>
                              {/if}
                            </button>
                          </div>
                        {/each}
                      {/if}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- ====================================================================== -->
  <!-- 3. BYOK PRO UPGRADE MODAL -->
  <!-- ====================================================================== -->
  {#if isUpgradeModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div class="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[#CFE2FA] shadow-2xl space-y-5 text-left relative animate-in zoom-in-95 duration-200">
        <!-- Close button -->
        <button
          type="button"
          onclick={() => (isUpgradeModalOpen = false)}
          class="absolute top-5 right-5 p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Icon name="X" size={18} />
        </button>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-[#1677FF]/10 text-[#1677FF] flex items-center justify-center shrink-0">
            <Icon name="Sparkles" size={24} />
          </div>
          <div>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#1677FF] text-white">PRO UPGRADE</span>
            <h3 class="text-base font-extrabold text-[#102A56] mt-0.5">{upgradeFeatureTitle}</h3>
          </div>
        </div>

        <p class="text-xs text-[#4B6382] leading-relaxed">
          {upgradeFeatureDesc}
        </p>

        <div class="p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] space-y-2 text-xs">
          <div class="flex items-center justify-between text-[#102A56] font-bold">
            <span>Pro Plan</span>
            <span class="text-[#1677FF]">BDT 899 / month</span>
          </div>
          <ul class="space-y-1.5 text-[11px] text-[#4B6382]">
            <li class="flex items-center gap-2"><Icon name="Check" size={13} class="text-emerald-500 shrink-0" /> Unlimited API keys per provider with auto round-robin</li>
            <li class="flex items-center gap-2"><Icon name="Check" size={13} class="text-emerald-500 shrink-0" /> Multi-model failover chains (HTTP 429 auto-retry)</li>
            <li class="flex items-center gap-2"><Icon name="Check" size={13} class="text-emerald-500 shrink-0" /> Full access to Master AI CEO and bespoke agent workflows</li>
          </ul>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            onclick={() => (isUpgradeModalOpen = false)}
            class="flex-1 py-3 rounded-xl border border-[#CFE2FA] text-xs font-bold text-[#5E7694] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={() => {
              isUpgradeModalOpen = false;
              activeDashboardTab.set('billing');
            }}
            class="flex-1 py-3 rounded-xl blue-btn text-white text-xs font-extrabold transition-all cursor-pointer shadow-md text-center"
          >
            Upgrade to Pro Plan
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
