<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import BrandIcon from './BrandIcon.svelte';
  import WorkflowStudioModal from './WorkflowStudioModal.svelte';
  import {
    activeTool,
    isDrawerOpen,
    closeToolDrawer,
    apiKey,
    isKeyValid,
    currentUser,
    subscription,
    getActiveVaultKey,
    getRoundRobinVaultKeys,
    openrouterSelectedModels,
    routingStrategy,
    incrementManagedUsage,
    isProPlan,
    apiVault,
    activeDashboardTab
  } from '$lib/stores/userStore';
  import { getBusinessChannelsState, type ConnectedToolState } from '$lib/config/toolConnectors';
  import { decryptVaultKey } from '$lib/services/crypto';
  import { executeToolWithGemini } from '$lib/services/gemini';
  import { marked } from 'marked';
  import { workflowCustomizationUserStore } from '$lib/stores/plansStore';

  let { onOpenByok }: { onOpenByok?: () => void } = $props();

  let isStudioOpen = $state(false);
  let showUpgradeModal = $state(false);
  let isPro = $derived($isProPlan);
  const isAdmin = $derived(typeof window !== 'undefined' && sessionStorage.getItem('ezbo_admin_authed') === 'true');
  const isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false);

  const isCloudManaged = $derived(
    $subscription?.tier === 'managed' ||
    $subscription?.tier === 'complete' ||
    $currentUser?.tier === 'managed'
  );

  const hasActiveKey = $derived(
    isCloudManaged ||
    $apiVault.some((k) => k.isEnabled !== false && k.encryptedKey) ||
    (!!$apiKey && $apiKey.trim().length > 5)
  );

  function handleConnectKey() {
    closeToolDrawer();
    activeDashboardTab.set('api-keys');
    if (onOpenByok) {
      onOpenByok();
    }
  }

  let businessChannels = $state<Record<string, ConnectedToolState>>({});

  function refreshBusinessChannels(): void {
    businessChannels = getBusinessChannelsState();
  }

  onMount(() => {
    refreshBusinessChannels();
    const handleUpdate = () => {
      refreshBusinessChannels();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('ezbo:tools-updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
      return () => {
        window.removeEventListener('ezbo:tools-updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      };
    }
  });

  const isCustomerReplyAgent = $derived(
    $activeTool?.code === '#76' ||
    $activeTool?.code === '#77' ||
    $activeTool?.code === '#78' ||
    $activeTool?.code === '#79' ||
    $activeTool?.code === '#80' ||
    $activeTool?.id === 'omnichannel_customer_support' ||
    $activeTool?.id === 'whatsapp_business_support' ||
    $activeTool?.id === 'messenger_customer_support' ||
    $activeTool?.id === 'instagram_dm_support' ||
    $activeTool?.id === 'telegram_customer_support'
  );

  function handleNavigateToChannels() {
    closeToolDrawer();
    activeDashboardTab.set('tools');
    if (typeof window !== 'undefined') {
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById('core-business-channels');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts < 8) {
          attempts++;
          setTimeout(tryScroll, 60);
        }
      };
      setTimeout(tryScroll, 40);
    }
  }

  interface StudioTurn {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    timestamp: string;
  }

  let formValues = $state<Record<string, string>>({});
  let outputLanguage = $state('Professional English');
  let outputTone = $state('High-Converting & Persuasive');
  let isGenerating = $state(false);
  let outputText = $state('');
  let outputImageUrl = $state('');
  let errorMessage = $state('');
  let copied = $state(false);
  let followUpInput = $state('');
  let studioChatHistory = $state<StudioTurn[]>([]);

  const refinementChips = [
    {
      label: '✨ 100% Humanize',
      prompt: 'Rewrite this output so it sounds 100% natural, human-written, and bypasses AI detectors.'
    },
    {
      label: '🔥 Make More Persuasive',
      prompt: 'Make this more persuasive, punchy, and conversion-focused with stronger hooks.'
    },
    {
      label: '📏 Condense into Bullet Points',
      prompt: 'Condense this into crisp, high-impact executive bullet points.'
    },
    {
      label: '🇧🇩 Translate to Bengali',
      prompt: 'Translate and adapt this entire output into natural, high-converting Bengali.'
    },
    {
      label: '🇺🇸 Polish Executive English',
      prompt: 'Provide a polished, international-standard executive English version of this output.'
    }
  ];

  $effect(() => {
    if ($activeTool) {
      outputText = '';
      outputImageUrl = '';
      errorMessage = '';
      studioChatHistory = [];
      followUpInput = '';
      const initial: Record<string, string> = {};
      for (const input of $activeTool.inputs) {
        initial[input.name] = input.defaultValue || (input.options ? input.options[0] : '');
      }
      formValues = initial;
    }
  });

  function fillSampleInputs() {
    if (!$activeTool) return;
    const sample: Record<string, string> = {};
    for (const input of $activeTool.inputs) {
      if (input.type === 'select' && input.options?.length) {
        sample[input.name] = input.options[0];
      } else {
        sample[input.name] = input.placeholder || `Sample ${input.label} for ${$activeTool.name}`;
      }
    }
    formValues = sample;
  }

  function buildPromptFromInputs(): string {
    if (!$activeTool) return '';
    const entries = $activeTool.inputs
      .map((inp) => {
        const val = (formValues[inp.name] || '').trim();
        return val ? `- **${inp.label}**: ${val}` : null;
      })
      .filter(Boolean)
      .join('\n');

    return `Execute [${$activeTool.code}] ${$activeTool.name} with these specifications:\n${entries || '- Standard best-practice execution'}\n- **Output Language**: ${outputLanguage}\n- **Tone**: ${outputTone}`;
  }

  async function runHelperRequest(userPrompt: string, isInitialForm = false) {
    if (!$activeTool || isGenerating) return;
    if (!hasActiveKey) {
      errorMessage = 'No AI API Key connected. Please connect your free Google Gemini or OpenRouter key in the API Vault.';
      handleConnectKey();
      return;
    }
    errorMessage = '';
    isGenerating = true;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!isInitialForm) {
      studioChatHistory = [
        ...studioChatHistory,
        { id: `u-${Date.now()}`, role: 'user', content: userPrompt, timestamp: nowTime }
      ];
    }

    try {
      const activeVaultKey = getActiveVaultKey();
      const isCompletePlan =
        $subscription?.tier === 'complete' ||
        $subscription?.tier === 'managed' ||
        $currentUser?.tier === 'managed';

      const payload: Record<string, any> = {
        message: userPrompt,
        helperId: $activeTool.id,
        mode: 'helper',
        planTier: $isProPlan ? 'byok_pro' : ($subscription?.tier || $currentUser?.tier || 'byok_starter'),
        language: outputLanguage,
        tone: outputTone,
        history: studioChatHistory.map((t) => ({ role: t.role, content: t.content }))
      };

      if (isCompletePlan) {
        payload.usePlatformKey = true;
      } else if (activeVaultKey && activeVaultKey.encryptedKey) {
        const roundRobinKeys = getRoundRobinVaultKeys(activeVaultKey.provider);
        payload.vaultKey = {
          provider: activeVaultKey.provider,
          key: decryptVaultKey(activeVaultKey.encryptedKey, activeVaultKey.provider),
          model: activeVaultKey.model,
          models: activeVaultKey.provider === 'openrouter' ? $openrouterSelectedModels : undefined,
          label: activeVaultKey.label
        };
        payload.vaultKeys = roundRobinKeys.map((k) => ({
          provider: k.provider,
          key: decryptVaultKey(k.encryptedKey, k.provider),
          model: k.model,
          models: k.provider === 'openrouter' ? $openrouterSelectedModels : undefined,
          label: k.label
        }));
        payload.openrouterModels = $openrouterSelectedModels;
        payload.routingStrategy = $routingStrategy;
      } else if ($apiKey) {
        payload.apiKey = $apiKey;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.result) {
        if (data.result.type === 'image') {
          outputImageUrl = data.result.url || '';
          outputText = data.result.caption || '✨ Visual render completed successfully.';
        } else {
          outputText = data.result.text || '';
        }

        studioChatHistory = [
          ...studioChatHistory,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: outputText,
            imageUrl: outputImageUrl || undefined,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

        if (isCompletePlan) {
          incrementManagedUsage();
        }
      } else if (data.requiresApiKey || (!res.ok && data.requiresApiKey)) {
        errorMessage =
          data.error ||
          'No API Key configured. Please add your free Google Gemini or OpenRouter key in the API Vault.';
      } else if ($apiKey && $apiKey.trim().length > 10) {
        // Direct client-side Gemini fallback
        const fallback = await executeToolWithGemini($apiKey, $activeTool, {
          ...formValues,
          outputLanguage,
          outputTone,
          followUpInstruction: isInitialForm ? '' : userPrompt
        });
        if (fallback.error) {
          errorMessage = fallback.error;
        } else {
          outputText = fallback.text;
          studioChatHistory = [
            ...studioChatHistory,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: outputText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }
      } else {
        errorMessage =
          data.error ||
          'Please connect your free Google Gemini API Key in the Settings / API Vault tab, or upgrade to the All-Inclusive Managed Plan.';
      }
    } catch (err: any) {
      errorMessage = err.message || 'Network error occurred. Please try again.';
    } finally {
      isGenerating = false;
    }
  }

  async function handleGenerate() {
    if (!hasActiveKey) {
      errorMessage = 'No AI API Key connected. Please connect your free Google Gemini or OpenRouter key in the API Vault.';
      handleConnectKey();
      return;
    }
    const prompt = buildPromptFromInputs();
    await runHelperRequest(prompt, true);
  }

  async function handleFollowUpSend() {
    const text = followUpInput.trim();
    if (!text || isGenerating) return;
    if (!hasActiveKey) {
      errorMessage = 'No AI API Key connected. Please connect your free Google Gemini or OpenRouter key in the API Vault.';
      handleConnectKey();
      return;
    }
    followUpInput = '';
    await runHelperRequest(text, false);
  }

  function handleCopy(textToCopy = outputText) {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function sendToWhatsApp(textToShare = outputText) {
    if (!textToShare) return;
    const shareText = encodeURIComponent(
      `*[${$activeTool?.code}] ${$activeTool?.name}*\n\n${textToShare}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  }

  function renderMd(md: string): string {
    try {
      return marked.parse(md) as string;
    } catch {
      return md;
    }
  }
</script>

{#if $isDrawerOpen && $activeTool}
  <!-- Backdrop Overlay -->
  <div
    class="fixed inset-0 z-50 ui-modal-backdrop transition-opacity"
    onclick={closeToolDrawer}
    role="presentation"
  ></div>

  <!-- Slide-out Studio Panel -->
  <div
    class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white border-l border-[#E3ECF7] shadow-2xl flex flex-col transform transition-transform duration-300 overflow-hidden"
  >
    <!-- Drawer Header -->
    <div
      class="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E3ECF7] bg-[#F3F8FF] flex items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div
          class="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] text-[#1677FF] flex items-center justify-center shrink-0 shadow-sm"
        >
          <BrandIcon name={$activeTool.name} modelId={$activeTool.id} icon={$activeTool.icon || 'Sparkles'} size={24} />
          <span
            class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
          ></span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-md bg-[#102A56] text-white"
            >
              {$activeTool.code}
            </span>
            <h2 class="font-extrabold text-sm sm:text-base text-[#102A56] truncate">{$activeTool.name}</h2>
            {#if $activeTool.badge}
              <span
                class="px-2.5 py-0.5 text-[10px] font-bold ui-badge-primary rounded-full uppercase"
              >
                {$activeTool.badge}
              </span>
            {/if}
          </div>
          <p class="text-xs text-[#4B6382] mt-0.5 truncate">
            {$activeTool.shortDesc || $activeTool.description} •
            <span class="text-[#1677FF] font-semibold">{$activeTool.categoryName}</span>
          </p>
        </div>
      </div>

      <button
        onclick={closeToolDrawer}
        class="w-10 h-10 flex items-center justify-center rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-white border border-transparent hover:border-[#E3ECF7] transition-colors cursor-pointer shrink-0"
        aria-label="Close Helper Studio"
      >
        <Icon name="X" size={18} />
      </button>
    </div>

    <!-- WhatsApp / Telegram Remote Control Hint Bar -->
    <div
      class="px-4 sm:px-6 py-2.5 bg-[#102A56] text-[#CFE2FA] text-[11px] flex items-center justify-between gap-2 flex-wrap"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#38CFFF]"></span>
        <span>
          <strong class="text-white">AI CEO / WhatsApp / Telegram Command:</strong> Simply include
          <code class="px-1.5 py-0.5 rounded bg-white/10 text-[#38CFFF] font-mono font-bold"
            >{$activeTool.code}</code
          >
          in your message to trigger this helper directly!
        </span>
      </div>
      {#if !hasActiveKey}
        <button
          onclick={handleConnectKey}
          class="px-2.5 py-1 rounded-lg bg-[#1677FF] hover:bg-[#0E63E0] text-white font-bold text-[10px] cursor-pointer transition-colors"
        >
          Connect API Key
        </button>
      {/if}
    </div>

    <!-- Autonomous Workflow Pipeline & Gated Customization Bar -->
    <div class="px-4 sm:px-6 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-xs text-[#102A56]">
        <Icon name="GitBranch" size={14} class="text-[#1677FF]" />
        <span class="font-bold">Autonomous Workflow Pipeline</span>
        <span class="text-[10px] text-emerald-600 font-semibold">• Readymade 1-Click Execution</span>
      </div>

      {#if isWorkflowStudioVisible}
        {#if isPro || isAdmin}
          <button
            type="button"
            onclick={() => (isStudioOpen = true)}
            title={isAdmin && $workflowCustomizationUserStore === false ? "👑 Admin Preview: (Locked for regular users)" : "Customize Workflow"}
            class="px-2.5 py-1 rounded-lg text-xs font-bold {isAdmin && $workflowCustomizationUserStore === false ? 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300' : 'text-[#1677FF] hover:bg-[#F0F5FF] border border-[#CFE2FA]'} flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Icon name="Sliders" size={13} />
            <span>Customize Workflow</span>
            {#if isAdmin && $workflowCustomizationUserStore === false}
              <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-200 text-amber-950 border border-amber-300 shadow-2xs flex items-center gap-1" title="👑 Admin Preview: (Locked for regular users)">
                👑 Admin Preview: (Locked for regular users)
              </span>
            {/if}
          </button>
        {:else}
          <button
            type="button"
            onclick={() => (showUpgradeModal = true)}
            class="px-2.5 py-1 rounded-lg text-xs font-bold text-[#64748B] hover:text-[#102A56] hover:bg-gray-100 border border-gray-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Customize Workflow</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-[#1677FF] text-white shadow-2xs">
              [PRO]
            </span>
          </button>
        {/if}
      {/if}
    </div>

    <!-- Upgrade Prompt Modal for Starter Users -->
    {#if showUpgradeModal}
      <div
        role="button"
        tabindex="0"
        onclick={() => (showUpgradeModal = false)}
        onkeydown={(e) => { if (e.key === 'Escape') showUpgradeModal = false; }}
        class="fixed inset-0 bg-[#102A56]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
      >
        <div
          role="dialog"
          aria-modal="true"
          tabindex="0"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => { if (e.key === 'Escape') showUpgradeModal = false; }}
          class="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#CFE2FA] space-y-4 text-center"
        >
          <div class="w-12 h-12 rounded-2xl bg-[#F0F5FF] text-[#1677FF] border border-[#CFE2FA] flex items-center justify-center mx-auto">
            <Icon name="Lock" size={22} />
          </div>
          <h3 class="text-base font-extrabold text-[#102A56]">Upgrade to Pro Plan</h3>
          <p class="text-xs text-[#4B6382] leading-relaxed">
            Starter Plan allows running all 75 readymade workflows. Visual workflow customization, node editing, and custom agent building are exclusive to <strong>Pro Plan</strong>.
          </p>
          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onclick={() => (showUpgradeModal = false)}
              class="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Close
            </button>
            <a
              href="/plans"
              class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#1162DB] text-white shadow-xs inline-flex items-center gap-1"
            >
              <span>Upgrade to Pro Plan</span>
              <Icon name="ArrowRight" size={13} />
            </a>
          </div>
        </div>
      </div>
    {/if}

    <!-- Drawer Body -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 bg-white">
      <!-- Prominent Warning Card when No AI API Key is Connected -->
      {#if !hasActiveKey}
        <div class="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-xs space-y-3 animate-in fade-in">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-lg font-bold shadow-2xs">
              🔑
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="text-sm font-extrabold text-[#102A56]">No AI API Key Connected</h4>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  100% Free
                </span>
              </div>
              <p class="text-xs text-[#4B6382] mt-1 leading-relaxed">
                Google Gemini API is <strong>100% free with no credit card required</strong> and includes high rate limits. Connect your free key in 30 seconds to run this specialist workflow.
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end pt-1">
            <button
              type="button"
              onclick={handleConnectKey}
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1162DB] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>🔑 Connect Free API Key</span>
              <Icon name="ArrowRight" size={13} />
            </button>
          </div>
        </div>
      {/if}

      <!-- ⚡ Connected Business Channels (for Omnichannel Customer Reply Agents #76 to #80) -->
      {#if isCustomerReplyAgent}
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F0F5FF] via-white to-[#F8FAFD] border border-[#CFE2FA] shadow-xs space-y-3.5 animate-in fade-in">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-base">⚡</span>
              <h4 class="text-xs sm:text-sm font-extrabold text-[#102A56]">Connected Business Channels</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1677FF]/10 text-[#1677FF]">
                Auto-Reply
              </span>
            </div>
            <button
              type="button"
              onclick={handleNavigateToChannels}
              class="text-[11px] font-bold text-[#1677FF] hover:text-[#0E63E0] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <Icon name="ArrowRight" size={12} />
            </button>
          </div>

          <!-- 4 Channel Status Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <!-- WhatsApp -->
            <div class="p-2.5 rounded-xl bg-white border border-[#E3ECF7] flex items-center gap-2 shadow-2xs">
              <BrandIcon modelId="whatsapp_business" name="whatsapp" size={16} />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-bold text-[#102A56] truncate">WhatsApp</p>
                {#if businessChannels['whatsapp_business']?.status === 'connected'}
                  <p class="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live</span>
                  </p>
                {:else}
                  <p class="text-[10px] font-medium text-[#7B92AE]">Not connected</p>
                {/if}
              </div>
            </div>

            <!-- Messenger -->
            <div class="p-2.5 rounded-xl bg-white border border-[#E3ECF7] flex items-center gap-2 shadow-2xs">
              <BrandIcon modelId="facebook_messenger" name="messenger" size={16} />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-bold text-[#102A56] truncate">Messenger</p>
                {#if businessChannels['facebook_messenger']?.status === 'connected'}
                  <p class="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live</span>
                  </p>
                {:else}
                  <p class="text-[10px] font-medium text-[#7B92AE]">Not connected</p>
                {/if}
              </div>
            </div>

            <!-- Instagram -->
            <div class="p-2.5 rounded-xl bg-white border border-[#E3ECF7] flex items-center gap-2 shadow-2xs">
              <BrandIcon modelId="instagram_dm" name="instagram" size={16} />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-bold text-[#102A56] truncate">Instagram</p>
                {#if businessChannels['instagram_dm']?.status === 'connected'}
                  <p class="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live</span>
                  </p>
                {:else}
                  <p class="text-[10px] font-medium text-[#7B92AE]">Not connected</p>
                {/if}
              </div>
            </div>

            <!-- Telegram -->
            <div class="p-2.5 rounded-xl bg-white border border-[#E3ECF7] flex items-center gap-2 shadow-2xs">
              <BrandIcon modelId="telegram_support_bot" name="telegram" size={16} />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-bold text-[#102A56] truncate">Telegram</p>
                {#if businessChannels['telegram_support_bot']?.status === 'connected'}
                  <p class="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live</span>
                  </p>
                {:else}
                  <p class="text-[10px] font-medium text-[#7B92AE]">Not connected</p>
                {/if}
              </div>
            </div>
          </div>

          <!-- Direct 1-Click Action Button -->
          <button
            type="button"
            onclick={handleNavigateToChannels}
            class="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#F3F8FF] border border-[#CFE2FA] hover:border-[#1677FF] text-[#1677FF] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <span>🔗 Connect Channels in Tools &amp; Integrations</span>
            <Icon name="ArrowRight" size={13} />
          </button>
        </div>
      {/if}

      <!-- Tailored Helper Parameters Card -->
      <div
        class="p-5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-4"
      >
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3
            class="text-xs font-extrabold uppercase tracking-wider text-[#102A56] flex items-center gap-1.5"
          >
            <Icon name="Sliders" size={14} class="text-[#1677FF]" />
            <span>Helper Custom Options ({$activeTool.inputs.length})</span>
          </h3>
          <button
            type="button"
            onclick={fillSampleInputs}
            class="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EBF4FF] border border-[#E3ECF7] hover:border-[#1677FF] text-[11px] font-semibold text-[#1677FF] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Icon name="Zap" size={12} />
            <span>1-Click Sample Fill</span>
          </button>
        </div>

        {#each $activeTool.inputs as input}
          <div class="space-y-1.5">
            <label
              for={'input-' + input.name}
              class="block text-xs font-semibold text-[#102A56]"
            >
              {input.label}
              {#if input.required}
                <span class="text-[#1677FF]">*</span>
              {/if}
            </label>

            {#if input.type === 'textarea'}
              <textarea
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                rows={3}
                placeholder={input.placeholder}
                class="ui-textarea bg-white rounded-xl p-3 text-xs leading-relaxed"
              ></textarea>
            {:else if input.type === 'select'}
              <select
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                class="ui-select bg-white rounded-xl px-3.5 py-2.5 text-xs"
              >
                {#each input.options || [] as opt}
                  <option value={opt}>{opt}</option>
                {/each}
              </select>
            {:else}
              <input
                id={'input-' + input.name}
                type="text"
                bind:value={formValues[input.name]}
                placeholder={input.placeholder}
                class="ui-input bg-white rounded-xl px-3.5 py-2.5 text-xs"
              />
            {/if}
          </div>
        {/each}

        <!-- Global Studio Controls: Output Language & Tone -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E3ECF7]">
          <div>
            <label for="studio-lang" class="block text-[11px] font-semibold text-[#4B6382] mb-1">
              Output Language
            </label>
            <select
              id="studio-lang"
              bind:value={outputLanguage}
              class="ui-select bg-white rounded-xl px-3 py-2 text-xs"
            >
              <option value="Professional English">🇺🇸 Professional English</option>
              <option value="Bangla & English Mix">🇧🇩/🇺🇸 Bangla & English Mix</option>
              <option value="Pure Bengali">🇧🇩 Pure Bengali</option>
              <option value="Banglish">💬 Banglish (Social Style)</option>
            </select>
          </div>
          <div>
            <label for="studio-tone" class="block text-[11px] font-semibold text-[#4B6382] mb-1">
              Execution Tone
            </label>
            <select
              id="studio-tone"
              bind:value={outputTone}
              class="ui-select bg-white rounded-xl px-3 py-2 text-xs"
            >
              <option value="High-Converting & Persuasive">🔥 High-Converting & Persuasive</option>
              <option value="100% Human & Natural">✨ 100% Human & Natural</option>
              <option value="Executive & Corporate">👔 Executive & Corporate</option>
              <option value="Viral & Scroll-Stopping">🚀 Viral & Scroll-Stopping</option>
            </select>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          onclick={handleGenerate}
          disabled={isGenerating}
          class="w-full py-3.5 px-4 rounded-xl blue-btn text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          {#if isGenerating}
            <Icon name="Loader2" size={18} class="animate-spin text-white" />
            <span>Running [{$activeTool.code}] {$activeTool.name}...</span>
          {:else}
            <Icon name="Sparkles" size={18} />
            <span>Generate with {$activeTool.name}</span>
          {/if}
        </button>
      </div>

      <!-- Error Box -->
      {#if errorMessage}
        <div
          class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2.5"
        >
          <div class="flex items-start gap-2.5">
            <Icon name="AlertCircle" size={16} class="shrink-0 mt-0.5 text-rose-600" />
            <div class="flex-1 whitespace-pre-line">{errorMessage}</div>
          </div>
          {#if !hasActiveKey || errorMessage.includes('API Key') || errorMessage.includes('API Vault')}
            <div class="flex justify-end pt-1">
              <button
                type="button"
                onclick={handleConnectKey}
                class="px-3.5 py-1.5 rounded-lg bg-[#1677FF] hover:bg-[#1162DB] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔑 Connect Free API Key</span>
                <Icon name="ArrowRight" size={12} />
              </button>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Interactive Studio Output & Follow-Up Chat Thread -->
      {#if studioChatHistory.length === 0 && !isGenerating && !errorMessage}
        <div class="p-6 rounded-2xl bg-[#F3F8FF]/70 border border-dashed border-[#C8D8EC] text-center space-y-2">
          <div class="w-10 h-10 rounded-xl bg-white border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] mx-auto shadow-2xs">
            <Icon name="Sparkles" size={18} />
          </div>
          <p class="text-xs font-bold text-[#102A56]">Ready to Execute [{$activeTool.code}] {$activeTool.name}</p>
          <p class="text-[11px] text-[#4B6382] max-w-md mx-auto">
            Fill in the custom parameters above (or click <strong>1-Click Sample Fill</strong>) and press <strong>Generate</strong> to launch your interactive studio output.
          </p>
        </div>
      {:else if studioChatHistory.length > 0}
        <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3
              class="text-xs font-extrabold uppercase tracking-wider text-[#102A56] flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Live Helper Studio Output & Chat</span>
            </h3>

            <div class="flex items-center gap-2">
              <button
                onclick={() => handleCopy(outputText)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary cursor-pointer"
              >
                <Icon
                  name={copied ? 'Check' : 'Copy'}
                  size={13}
                  class={copied ? 'text-[#1677FF]' : ''}
                />
                <span>{copied ? 'Copied!' : 'Copy Latest'}</span>
              </button>

              <button
                onclick={() => sendToWhatsApp(outputText)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all shadow-2xs cursor-pointer"
              >
                <Icon name="MessageSquare" size={13} class="text-emerald-600" />
                <span>Share to WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Conversation Turns inside Helper Drawer -->
          <div class="space-y-3">
            {#each studioChatHistory as turn (turn.id)}
              {#if turn.role === 'user'}
                <div class="flex justify-end">
                  <div
                    class="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#1677FF] text-white px-4 py-2.5 text-xs shadow-xs"
                  >
                    <p class="whitespace-pre-wrap break-words">{turn.content}</p>
                  </div>
                </div>
              {:else}
                <div
                  class="p-5 rounded-2xl ui-card-static space-y-3"
                >
                  {#if turn.imageUrl}
                    <div class="rounded-xl overflow-hidden border border-[#E3ECF7] max-w-md">
                      <img
                        src={turn.imageUrl}
                        alt={$activeTool.name}
                        class="w-full h-auto object-cover"
                      />
                    </div>
                  {/if}
                  <div
                    class="prose prose-slate prose-xs sm:prose-sm max-w-none text-[#102A56] leading-relaxed"
                  >
                    {@html renderMd(turn.content)}
                  </div>
                </div>
              {/if}
            {/each}
          </div>

          <!-- 1-Click Quick Refinement Chips -->
          <div class="flex items-center gap-1.5 flex-wrap pt-1">
            {#each refinementChips as chip}
              <button
                type="button"
                disabled={isGenerating}
                onclick={() => runHelperRequest(chip.prompt, false)}
                class="px-2.5 py-1 rounded-full bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#E3ECF7] hover:border-[#1677FF] text-[11px] font-semibold text-[#1677FF] transition-all cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            {/each}
          </div>

          <!-- Follow-up Chat Input with this Helper -->
          <form
            onsubmit={(e) => {
              e.preventDefault();
              handleFollowUpSend();
            }}
            class="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              bind:value={followUpInput}
              placeholder="Give follow-up instructions to this helper (e.g. Make it shorter, revise option 2)..."
              class="flex-1 ui-input px-3.5 py-2.5 text-xs"
            />
            <button
              type="submit"
              disabled={isGenerating || !followUpInput.trim()}
              class="px-4 py-2.5 rounded-xl blue-btn text-white text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </form>
        </div>
      {/if}
    </div>
  </div>

  <!-- Full-Screen Interactive Workflow Studio Modal (Outside transformed panel) -->
  <WorkflowStudioModal bind:isOpen={isStudioOpen} agentName={$activeTool?.name || 'Specialist Agent'} />
{/if}
