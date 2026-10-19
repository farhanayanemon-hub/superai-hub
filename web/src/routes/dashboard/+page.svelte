<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import FloatingCeoChat from '$lib/components/FloatingCeoChat.svelte';
  import ChannelModal from '$lib/components/ChannelModal.svelte';
  import AppDownloadModal from '$lib/components/AppDownloadModal.svelte';
  import ToolCard from '$lib/components/ToolCard.svelte';
  import ToolDrawer from '$lib/components/ToolDrawer.svelte';
  import ApiVaultManager from '$lib/components/ApiVaultManager.svelte';
  import ApiKeyManager from '$lib/components/ApiKeyManager.svelte';
  import ToolConnectorsTab from '$lib/components/ToolConnectorsTab.svelte';
  import PricingCardsGrid from '$lib/components/PricingCardsGrid.svelte';
  import WorkflowStudioModal from '$lib/components/WorkflowStudioModal.svelte';
  import type { PlanTierId } from '$lib/config/plans';
  import { initiateSubscriptionPayment, verifyOpayTransaction } from '$lib/services/opay';
  import { plansStore, loadPublicPlans } from '$lib/stores/plansStore';
  import { whatsappApi } from '$lib/services/whatsappApi';
  import { validateGeminiKey } from '$lib/services/gemini';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';

  import { TOOLS, CATEGORIES, type AITool } from '$lib/config/tools';
  import {
    currentUser,
    isAuthenticated,
    logout,
    apiKey,
    setApiKey,
    isKeyValid,
    whatsappStatus,
    whatsappQr,
    activeDashboardTab,
    activeCategory,
    searchQuery,
    subscription,
    cancelSubscription,
    reactivateSubscription,
    switchPlan,
    syncUserAccessWithServer,
    closeToolDrawer,
    apiVault,
    ceoCustomPrompt,
    setCeoCustomPrompt,
    isProPlan,
    type DashboardTab,
    type PlanTier
  } from '$lib/stores/userStore';

  let sidebarOpen = $state(true);
  let mobileSidebarOpen = $state(false);
  let isChannelModalOpen = $state(false);
  let isCeoChatOpen = $state(false);
  let isAppDownloadModalOpen = $state(false);
  let hasCheckedServerAccess = $state(false);

  // Pro Workflow Studio State
  let isDashboardStudioOpen = $state(false);
  let studioAgentName = $state('Master Specialist Agent');
  let handleStudioTrigger: ((e: any) => void) | null = null;
  let handleHashChange: (() => void) | null = null;

  function openWorkflowStudio(agentName: string = 'Master Specialist Agent') {
    studioAgentName = agentName;
    isDashboardStudioOpen = true;
  }

  // Settings Tab AI CEO Persona & Custom Instructions State
  let customInstructions = $state($ceoCustomPrompt || '');
  let instructionsSaveNotice = $state('');

  $effect(() => {
    if ($ceoCustomPrompt && !customInstructions) {
      customInstructions = $ceoCustomPrompt;
    }
  });

  const CEO_PRESETS = [
    {
      title: 'Bengali Professional',
      subtitle: 'বাংলায় প্রফেশনাল উত্তর',
      prompt: 'আপনি EzboAgents-এর প্রধান এআই সিইও। সর্বদা ব্যবসায়িক, মার্জিত, প্রফেশনাল ও সাবলীল বাংলায় বিস্তারিত ও লাভজনক স্ট্র্যাটেজিক উত্তর দিন।'
    },
    {
      title: 'Concise Strategist',
      subtitle: 'Bullet-pointed, high-converting',
      prompt: 'Act as a top-tier executive strategist. Keep answers crisp, highly structured, bullet-pointed, and focused purely on execution with zero fluff.'
    },
    {
      title: 'E-Commerce & Marketing Master',
      subtitle: 'ROAS, hook & sales focused',
      prompt: 'Act as an elite direct-response marketer and e-commerce growth specialist. Relentlessly focus on ROAS, irresistible offers, scroll-stopping hooks, and conversion rate optimization.'
    }
  ];

  function applyCeoPreset(prompt: string) {
    customInstructions = prompt;
    setCeoCustomPrompt(prompt);
    instructionsSaveNotice = 'Instructions saved!';
    setTimeout(() => {
      instructionsSaveNotice = '';
    }, 3000);
  }

  function handleSaveInstructions() {
    setCeoCustomPrompt(customInstructions);
    instructionsSaveNotice = 'Instructions saved!';
    setTimeout(() => {
      instructionsSaveNotice = '';
    }, 3000);
  }

  // BYOK Tab local state
  let inputKey = $state($apiKey || '');
  let keyValidationState = $state<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  let keyValidationMsg = $state('');

  // WhatsApp Tab local state
  let isDisconnecting = $state(false);

  // Billing & Payment State
  let isCancelModalOpen = $state(false);
  let cancelReason = $state('too_expensive');
  let billingNotice = $state('');
  let billingError = $state('');
  let dashboardBillingInterval = $state<'monthly' | 'yearly'>('monthly');

  // OPay Payment state & handlers
  let isProcessingPayment = $state(false);

  async function handlePayPlan(tier: PlanTierId | PlanTier, interval?: 'monthly' | 'yearly') {
    isProcessingPayment = true;
    billingError = '';
    billingNotice = 'Connecting to OPayBD gateway...';
    if (interval) {
      dashboardBillingInterval = interval;
    }
    try {
      const res = await initiateSubscriptionPayment(tier as any, dashboardBillingInterval, $currentUser);
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      billingNotice = '';
      billingError = res.error || 'Payment gateway rejected initialization. Please ensure your OPAY_API_KEY is configured in the Admin Panel (/admin).';
    } catch (e: any) {
      billingNotice = '';
      billingError = e.message || 'Payment request failed to connect.';
    } finally {
      isProcessingPayment = false;
    }
  }

  // Telegram Channel state
  let telegramLinked = $state(false);
  let telegramUsername = $state('');
  let telegramSyncCode = $state('');
  let telegramDeepLink = $state('');
  let isGeneratingTelegramCode = $state(false);
  let isDisconnectingTelegram = $state(false);
  let telegramCopied = $state(false);
  let telegramPollTimer: any = null;

  async function checkTelegramStatus() {
    if (!$currentUser?.id) return;
    try {
      const res = await fetch(`/api/telegram/sync?userId=${encodeURIComponent($currentUser.id)}`);
      const data = await res.json();
      if (data.success) {
        telegramLinked = !!data.isLinked;
        telegramUsername = data.telegramUsername || '';
      }
    } catch {
      // ignore
    }
  }

  async function generateTelegramSync() {
    if (!$currentUser?.id) return;
    isGeneratingTelegramCode = true;
    try {
      const res = await fetch('/api/telegram/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: $currentUser.id,
          userName: $currentUser.name,
          userEmail: $currentUser.email,
          planTier: $subscription.tier,
          isSubscribed: $subscription.status === 'active',
          byokKey: $apiKey,
          unlockedBots: $subscription.unlockedStoreBots || []
        })
      });
      const data = await res.json();
      if (data.success) {
        telegramSyncCode = data.syncCode;
        telegramDeepLink = data.deepLink;
      }
    } catch (e) {
      console.error('Error generating telegram sync:', e);
    } finally {
      isGeneratingTelegramCode = false;
    }
  }

  async function handleDisconnectTelegram() {
    if (!$currentUser?.id) return;
    isDisconnectingTelegram = true;
    try {
      await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: $currentUser.id })
      });
      telegramLinked = false;
      telegramUsername = '';
      telegramSyncCode = '';
      telegramDeepLink = '';
      await generateTelegramSync();
    } catch (e) {
      console.error('Error disconnecting telegram:', e);
    } finally {
      isDisconnectingTelegram = false;
    }
  }

  function copyTelegramCode() {
    if (!telegramSyncCode) return;
    navigator.clipboard.writeText(telegramSyncCode);
    telegramCopied = true;
    setTimeout(() => { telegramCopied = false; }, 3000);
  }

  onMount(async () => {
    loadPublicPlans();

    // Production Auth Protection: Redirect unauthenticated visitors to login
    if (!$isAuthenticated || !$currentUser) {
      goto('/login');
      return;
    }

    // Sync any admin-assigned plan grants from server
    await syncUserAccessWithServer();
    hasCheckedServerAccess = true;

    // Mandatory Paywall Gate: If user has not subscribed or plan expired, redirect to /plans
    if (!$currentUser.isSubscribed || $subscription.status !== 'active') {
      goto('/plans');
      return;
    }

    // Start WhatsApp live SSE stream
    whatsappApi.initStream();

    // Init Telegram Channel
    checkTelegramStatus();
    generateTelegramSync();
    telegramPollTimer = setInterval(() => {
      if (!telegramLinked) {
        checkTelegramStatus();
      }
    }, 5000);

    // Workflow Studio Event & Hash Handler
    handleStudioTrigger = (e: any) => {
      openWorkflowStudio(e?.detail?.agentName || 'Master Specialist Agent');
    };
    handleHashChange = () => {
      if (window.location.hash === '#open-workflow-studio') {
        openWorkflowStudio();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('ezbo:open-workflow-studio', handleStudioTrigger);
      if (window.location.hash === '#open-workflow-studio') {
        openWorkflowStudio();
      }
      window.addEventListener('hashchange', handleHashChange);
    }
  });

  $effect(() => {
    if (typeof window !== 'undefined' && hasCheckedServerAccess) {
      if (!$isAuthenticated) {
        goto('/login');
      } else if ($currentUser && (!$currentUser.isSubscribed || $subscription.status !== 'active')) {
        goto('/plans');
      }
    }
  });

  onDestroy(() => {
    whatsappApi.closeStream();
    if (telegramPollTimer) clearInterval(telegramPollTimer);
    if (typeof window !== 'undefined') {
      if (handleStudioTrigger) window.removeEventListener('ezbo:open-workflow-studio', handleStudioTrigger);
      if (handleHashChange) window.removeEventListener('hashchange', handleHashChange);
    }
  });

  async function testAndSaveApiKey() {
    if (!inputKey.trim()) {
      keyValidationState = 'invalid';
      keyValidationMsg = 'Please enter a valid Google AI Studio Gemini API Key.';
      return;
    }

    keyValidationState = 'testing';
    keyValidationMsg = 'Validating key with Google AI Studio...';

    const isValid = await validateGeminiKey(inputKey.trim());
    if (isValid) {
      setApiKey(inputKey.trim(), true);
      keyValidationState = 'valid';
      keyValidationMsg = 'API Key verified successfully! Unlimited access enabled.';
    } else {
      keyValidationState = 'invalid';
      keyValidationMsg = 'Invalid Gemini API key or quota exceeded. Please check your key.';
    }
  }

  async function handleDisconnectWhatsApp() {
    isDisconnecting = true;
    await whatsappApi.triggerDisconnect();
    isDisconnecting = false;
  }

  function handleLogout() {
    logout();
    goto('/login');
  }

  function switchTab(tab: DashboardTab) {
    activeDashboardTab.set(tab);
    mobileSidebarOpen = false;
    if (tab === 'chat') {
      isCeoChatOpen = true;
    }
  }

  const filteredTools = $derived(
    TOOLS.filter((tool) => {
      const matchCategory = $activeCategory === 'all' || tool.category === $activeCategory;
      const query = $searchQuery.toLowerCase().trim();
      if (!query) return matchCategory;

      return (
        matchCategory &&
        (tool.name.toLowerCase().includes(query) ||
          tool.code.toLowerCase().includes(query) ||
          tool.nameEn.toLowerCase().includes(query) ||
          (tool.shortDesc || '').toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.keywords.some((k) => k.toLowerCase().includes(query)))
      );
    })
  );
</script>

<svelte:head>
  <title>Executive Console • EzboAgents (ezboagents.com)</title>
  <meta name="description" content="EzboAgents Executive Console - Master AI CEO Orchestrator, 75 Business & Freelancer AI Helpers, WhatsApp & Telegram Sync, and Multi-Provider AI Vault." />
</svelte:head>

<div class="h-screen w-full max-w-full bg-[#F3F8FF] text-[#102A56] flex overflow-hidden font-sans selection:bg-[#1677FF] selection:text-white">
  <!-- ======================================================== -->
  <!-- 1. RESPONSIVE LEFT SIDEBAR -->
  <!-- ======================================================== -->
  <!-- Mobile Overlay Backdrop -->
  {#if mobileSidebarOpen}
    <div
      role="button"
      tabindex="0"
      onclick={() => (mobileSidebarOpen = false)}
      onkeydown={(e) => { if (e.key === 'Escape') mobileSidebarOpen = false; }}
      class="fixed inset-0 bg-[#102A56]/40 backdrop-blur-md z-40 lg:hidden"
    ></div>
  {/if}

  <aside
    class="fixed lg:static inset-y-0 left-0 z-50 max-w-[85vw] ui-sidebar flex flex-col justify-between shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] {mobileSidebarOpen ? 'translate-x-0 w-72 opacity-100' : '-translate-x-full w-72 opacity-0 lg:opacity-100'} {sidebarOpen ? 'lg:w-72 lg:translate-x-0 lg:opacity-100' : 'lg:w-0 lg:-translate-x-full lg:opacity-0 lg:pointer-events-none'}"
  >
    <div class="w-72 flex flex-col justify-between h-full">
      <!-- Top Brand -->
      <div>
        <div class="h-16 px-5 border-b border-[#E3ECF7] flex items-center justify-between">
          <a href="/" class="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="EzboAgents" class="w-9 h-9 object-contain drop-shadow-xs group-hover:scale-105 transition-transform" />
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-base text-[#102A56] tracking-tight">Ezbo<span class="text-[#1677FF]">Agents</span></span>
              </div>
            </div>
          </a>

          <button
            type="button"
            onclick={() => (mobileSidebarOpen = false)}
            class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <!-- Navigation Menu Items -->
        <nav class="p-3 space-y-1.5">
          <!-- 1. AI Helpers -->
          <button
            type="button"
            onclick={() => switchTab('agents')}
            class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'agents' ? 'bg-[#1677FF] text-white shadow-xs font-bold' : 'text-[#4B6382] hover:text-[#102A56] hover:bg-[#F3F8FF]'}"
          >
            <div class="flex items-center gap-3">
              <Icon name="Grid" size={17} class={$activeDashboardTab === 'agents' ? 'text-white' : 'text-[#1677FF]'} />
              <span>My Agents</span>
            </div>
          </button>

          <!-- 2. Tools & Integrations Hub (100+) -->
          <button
            type="button"
            onclick={() => switchTab('tools')}
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 group text-left cursor-pointer {$activeDashboardTab === 'tools'
              ? 'bg-[#1677FF] text-white shadow-xs font-bold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-[#F3F8FF]/80'}"
          >
            <div class="flex items-center gap-3">
              <Icon name="Wrench" size={17} class={$activeDashboardTab === 'tools' ? 'text-white' : 'text-[#1677FF]'} />
              <span>Tools & Integrations</span>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold {$activeDashboardTab === 'tools' ? 'bg-white/20 text-white' : 'bg-[#CFE2FA]/50 text-[#1677FF]'}">100+</span>
          </button>

          <!-- 4. Subscription & Billing -->
          <button
            type="button"
            onclick={() => switchTab('billing')}
            class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'billing' ? 'bg-[#1677FF] text-white shadow-xs font-bold' : 'text-[#4B6382] hover:text-[#102A56] hover:bg-[#F3F8FF]'}"
          >
            <div class="flex items-center gap-3">
              <Icon name="CreditCard" size={17} class={$activeDashboardTab === 'billing' ? 'text-white' : 'text-[#1677FF]'} />
              <span>Billing & Plans</span>
            </div>
          </button>

          <!-- 5. Settings & Profile -->
          <button
            type="button"
            onclick={() => switchTab('settings')}
            class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'settings' ? 'bg-[#1677FF] text-white shadow-xs font-bold' : 'text-[#4B6382] hover:text-[#102A56] hover:bg-[#F3F8FF]'}"
          >
            <div class="flex items-center gap-3">
              <Icon name="Settings" size={17} class={$activeDashboardTab === 'settings' ? 'text-white' : 'text-[#5E7694]'} />
              <span>Settings</span>
            </div>
          </button>

          <!-- 5a. API Key Management (Child Tab under Settings) -->
          <button
            type="button"
            onclick={() => switchTab('api-keys')}
            class="w-[calc(100%-1rem)] ml-4 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'api-keys' || $activeDashboardTab === 'vault' ? 'bg-[#1677FF]/15 text-[#1677FF] font-bold border border-[#1677FF]/30 shadow-2xs' : 'text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF]'}"
          >
            <div class="flex items-center gap-2.5">
              <Icon name="Key" size={14} class={$activeDashboardTab === 'api-keys' || $activeDashboardTab === 'vault' ? 'text-[#1677FF]' : 'text-[#5E7694]'} />
              <span>API Key Management</span>
            </div>
            {#if $apiVault.length > 0}
              <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white">
                {$apiVault.length}
              </span>
            {/if}
          </button>

          <!-- 6. Download Mobile App -->
          <button
            type="button"
            onclick={() => {
              isAppDownloadModalOpen = true;
              mobileSidebarOpen = false;
            }}
            class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer text-[#4B6382] hover:text-[#102A56] hover:bg-[#F3F8FF] group"
          >
            <div class="flex items-center gap-3">
              <Icon name="Smartphone" size={17} class="text-[#1677FF] group-hover:scale-110 transition-transform" />
              <span>Download App</span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#CFE2FA]/50 text-[#1677FF] border border-[#CFE2FA]">APK</span>
          </button>
        </nav>
      </div>

      <!-- Bottom User Section & Sign Out -->
      <div class="p-3 border-t border-[#E3ECF7] bg-[#F3F8FF]">
        <div class="p-2.5 rounded-xl bg-white border border-[#E3ECF7] shadow-2xs flex items-center justify-between">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div class="w-8 h-8 rounded-lg bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] font-bold text-xs shrink-0">
              {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div class="truncate">
              <p class="text-xs font-bold text-[#102A56] truncate">{$currentUser?.name || 'User'}</p>
              <p class="text-[10px] text-[#4B6382] truncate">{$currentUser?.email || 'user@ezboagents.com'}</p>
            </div>
          </div>

          <button
            type="button"
            onclick={handleLogout}
            class="w-10 h-10 flex items-center justify-center rounded-xl text-[#5E7694] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <Icon name="LogOut" size={16} />
          </button>
        </div>
      </div>
    </div>
  </aside>

  <!-- ======================================================== -->
  <!-- 2. MAIN WORKSPACE AREA -->
  <!-- ======================================================== -->
  <main class="flex-1 flex flex-col h-full overflow-hidden bg-[#F3F8FF] relative">
    <!-- Top Navigation Bar with Animated 3-Line Hamburger Menu Toggle (Desktop & Mobile) -->
    <div class="h-14 sm:h-16 px-3 sm:px-6 border-b border-[#CFE2FA]/70 bg-white/70 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-2xs z-30 transition-all">
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Animated 3-line hamburger menu toggle button for Desktop and Mobile -->
        <button
          type="button"
          onclick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              mobileSidebarOpen = !mobileSidebarOpen;
            } else {
              sidebarOpen = !sidebarOpen;
            }
          }}
          class="w-10 h-10 flex flex-col items-center justify-center gap-1.2 rounded-xl bg-white/80 hover:bg-[#EAF2FF] border border-[#CFE2FA] hover:border-[#1677FF] text-[#102A56] transition-all cursor-pointer shadow-xs group"
          aria-label="Toggle Navigation Sidebar"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <span
            class="w-4.5 h-0.5 bg-[#102A56] group-hover:bg-[#1677FF] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] {(!sidebarOpen || mobileSidebarOpen) ? 'rotate-45 translate-y-1.7' : ''}"
          ></span>
          <span
            class="w-4.5 h-0.5 bg-[#102A56] group-hover:bg-[#1677FF] rounded-full transition-all duration-200 {(!sidebarOpen || mobileSidebarOpen) ? 'opacity-0 -translate-x-2' : ''}"
          ></span>
          <span
            class="w-4.5 h-0.5 bg-[#102A56] group-hover:bg-[#1677FF] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] {(!sidebarOpen || mobileSidebarOpen) ? '-rotate-45 -translate-y-1.7' : ''}"
          ></span>
        </button>

        <div class="flex items-center gap-2 sm:gap-2.5">
          <img src="/logo.png" alt="EzboAgents" class="w-7 h-7 object-contain drop-shadow-xs" />
          <span class="font-extrabold text-sm sm:text-base text-[#102A56] tracking-tight">Ezbo<span class="text-[#1677FF]">Agents</span></span>
          <span class="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#CFE2FA] uppercase tracking-wide">
            {$activeDashboardTab}
          </span>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        {#if $isProPlan}
          <button
            type="button"
            onclick={() => openWorkflowStudio()}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#38CFFF] hover:brightness-105 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Icon name="Sliders" size={14} />
            <span>Workflow Studio</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] bg-white/25 font-black uppercase">PRO</span>
          </button>
        {/if}

        <button
          type="button"
          onclick={() => switchTab('chat')}
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-[#F3F8FF] border border-[#CFE2FA] text-xs font-bold text-[#1677FF] transition-all cursor-pointer shadow-2xs"
        >
          <Icon name="Crown" size={14} class="text-[#1677FF]" />
          <span>Ezbo (AI CEO)</span>
        </button>

        <a
          href="/"
          class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-[#F3F8FF] border border-[#CFE2FA] text-xs font-semibold text-[#4B6382] hover:text-[#102A56] transition-all"
        >
          Home
        </a>
      </div>
    </div>

    <!-- Tab View Router -->
    <div class="flex-1 overflow-hidden p-3 sm:p-5">
      <!-- ==================================================== -->
      <!-- TAB 1: 75 AI HELPERS STUDIO -->
      <!-- ==================================================== -->
      {#if $activeDashboardTab === 'agents' || $activeDashboardTab === 'chat'}
        <div class="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
          <!-- Master AI CEO Banner + Search -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 ui-banner-navy text-white p-4 sm:p-6 rounded-3xl">
            <div class="space-y-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38CFFF]/15 border border-[#38CFFF]/35 text-[#38CFFF] text-[10px] font-extrabold uppercase tracking-wider max-w-full flex-wrap">
                <Icon name="Crown" size={12} class="shrink-0" />
                <span class="break-words">1 Master AI CEO + 75 Business & Freelancer AI Helpers</span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                <span>75 Specialized AI Helpers</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  {filteredTools.length} Ready
                </span>
              </h2>
              <p class="text-xs text-white/80 max-w-2xl">
                Every helper includes custom input options and a dedicated chat studio — or skip individual chats and command the <strong class="text-white">Master AI CEO</strong> from Web, <strong class="text-white">WhatsApp</strong>, or <strong class="text-white">Telegram</strong>!
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <div class="relative">
                <input
                  type="text"
                  bind:value={$searchQuery}
                  placeholder="Search #01-#75 or helper name..."
                  class="w-full sm:w-60 bg-[#0B1F42]/70 border border-[#38CFFF]/30 focus:border-[#38CFFF] focus:bg-[#0B1F42] rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/60 outline-none transition-all"
                />
              </div>
              {#if $isProPlan}
                <button
                  type="button"
                  onclick={() => openWorkflowStudio()}
                  class="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Icon name="Sliders" size={14} />
                  <span>Customize Workflows</span>
                </button>
              {/if}
              <button
                type="button"
                onclick={() => switchTab('chat')}
                class="px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Icon name="Crown" size={14} />
                <span>Command via AI CEO</span>
              </button>
            </div>
          </div>

          <!-- Base Tools Catalog -->
          {#if filteredTools.length === 0}
            <div class="text-center py-20 bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 rounded-3xl p-8 space-y-4 shadow-xs hover:shadow-md hover:border-[#1677FF]/40 transition-all">
              <div class="w-16 h-16 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] mx-auto shadow-2xs">
                <Icon name="Sparkles" size={28} />
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-bold text-[#102A56]">No Matching AI Helper Found</h3>
                <p class="text-xs text-[#4B6382] max-w-md mx-auto">
                  Try clearing your search filter or ask the Master AI CEO directly.
                </p>
              </div>
              <button
                type="button"
                onclick={() => { $searchQuery = ''; activeCategory.set('all'); }}
                class="px-5 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Show All 75 Helpers</span>
              </button>
            </div>
          {:else if filteredTools.length > 0}
            <!-- Category Filter Tabs -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {#each CATEGORIES as cat}
                <button
                  type="button"
                  onclick={() => activeCategory.set(cat.id)}
                  class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {$activeCategory === cat.id ? 'bg-[#1677FF] text-white shadow-xs font-bold' : 'bg-white border border-[#E3ECF7] text-[#4B6382] hover:border-[#1677FF] hover:text-[#1677FF]'}"
                >
                  {cat.name} ({cat.count})
                </button>
              {/each}
            </div>

            <!-- Tools Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
              {#each filteredTools as tool (tool.id)}
                <ToolCard {tool} />
              {/each}
            </div>
          {/if}
        </div>

      <!-- ==================================================== -->
      <!-- TAB 3: TOOLS & INTEGRATIONS HUB (100+) -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'tools'}
        <div class="h-full overflow-y-auto max-w-7xl mx-auto pb-12">
          <ToolConnectorsTab />
        </div>

      <!-- ==================================================== -->
      <!-- TAB 4: CHANNELS (MULTI-CHANNEL HUB, RENAMED FROM WHATSAPP) -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'channels' || $activeDashboardTab === 'whatsapp'}
        <div class="h-full overflow-y-auto max-w-5xl mx-auto space-y-6 pb-12">
          <!-- Header -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 shadow-xs hover:shadow-md hover:border-[#1677FF]/40 transition-all space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-4">
              <div>
                <h2 class="text-xl font-black bg-gradient-to-r from-[#102A56] via-[#1677FF] to-[#38CFFF] bg-clip-text text-transparent flex items-center gap-2.5">
                  <Icon name="QrCode" size={22} class="text-[#1677FF]" />
                  <span>Channels & Communication Hub</span>
                </h2>
                <p class="text-xs text-[#4B6382] mt-1">
                  Connect multiple communication channels to automate client interactions and executive workflows 24/7.
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold {$whatsappStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#F3F8FF] text-[#4B6382] border border-[#E3ECF7]'}">
                  <span class="w-2 h-2 rounded-full {$whatsappStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-[#7B92AE]'}"></span>
                  <span>WhatsApp: {$whatsappStatus.toUpperCase()}</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold {telegramLinked ? 'bg-[#F0FBFF] text-[#089CD0] border border-[#BAEFFF]' : 'bg-[#F3F8FF] text-[#4B6382] border border-[#E3ECF7]'}">
                  <span class="w-2 h-2 rounded-full {telegramLinked ? 'bg-[#38CFFF] animate-pulse' : 'bg-[#7B92AE]'}"></span>
                  <span>Telegram: {telegramLinked ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </div>
              </div>
            </div>

            <!-- WhatsApp Channel (Primary Active Channel) -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Channel 1</span>
                  <h3 class="text-sm font-bold text-[#102A56]">WhatsApp Private Intelligence Sync</h3>
                </div>
                <span class="text-xs text-[#5E7694] font-mono">Baileys Multi-Device</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
                <!-- QR Image Display -->
                <div class="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                  {#if $whatsappStatus === 'connected'}
                    <div class="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                      <Icon name="Check" size={32} />
                    </div>
                    <h3 class="text-base font-bold text-[#102A56]">WhatsApp Live & Connected!</h3>
                    <p class="text-xs text-[#4B6382] text-center mt-1">Send any message to yourself in WhatsApp to test.</p>
                    <button
                      type="button"
                      onclick={handleDisconnectWhatsApp}
                      disabled={isDisconnecting}
                      class="mt-6 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isDisconnecting ? 'Disconnecting...' : 'Disconnect Session'}
                    </button>
                  {:else if $whatsappQr}
                    <div class="p-3 bg-white rounded-2xl shadow-md border border-[#CFE2FA] max-w-full">
                      <img src={$whatsappQr} alt="WhatsApp QR Code" class="w-48 h-48 sm:w-56 sm:h-56 max-w-full object-contain mx-auto" />
                    </div>
                    <p class="text-[11px] text-[#1677FF] mt-3 font-mono font-semibold text-center">Scan QR code using WhatsApp on your phone</p>
                  {:else}
                    <div class="w-48 h-48 sm:w-56 sm:h-56 max-w-full rounded-2xl border border-dashed border-[#C8D8EC] bg-white/60 flex flex-col items-center justify-center text-[#4B6382] text-xs gap-2 p-4 text-center">
                      <div class="w-6 h-6 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating encrypted QR handshake...</span>
                    </div>
                  {/if}
                </div>

                <!-- Setup Steps -->
                <div class="space-y-4">
                  <h3 class="text-sm font-bold uppercase tracking-wider text-[#1677FF]">Pairing Instructions:</h3>
                  <ol class="space-y-3 text-xs text-[#102A56]">
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-[#F3F8FF] text-[#1677FF] flex items-center justify-center font-bold shrink-0 border border-[#CFE2FA]">1</span>
                      <span>Open <strong>WhatsApp</strong> on your phone.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-[#F3F8FF] text-[#1677FF] flex items-center justify-center font-bold shrink-0 border border-[#CFE2FA]">2</span>
                      <span>Tap <strong>Settings</strong> (iOS) or <strong>Three Dots ⋮</strong> (Android) and choose <strong>Linked Devices</strong>.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-[#F3F8FF] text-[#1677FF] flex items-center justify-center font-bold shrink-0 border border-[#CFE2FA]">3</span>
                      <span>Point your phone camera at the QR code on the left.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-[#F3F8FF] text-[#1677FF] flex items-center justify-center font-bold shrink-0 border border-[#CFE2FA]">4</span>
                      <span>Once connected, send any message to your own number ("Message Yourself") to start!</span>
                    </li>
                  </ol>

                  <div class="p-3.5 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] text-xs text-[#102A56] space-y-1">
                    <div class="font-bold flex items-center gap-1.5 text-[#1677FF]">
                      <Icon name="Shield" size={14} class="text-[#1677FF]" />
                      <span>100% Anti-Ban Encrypted Architecture</span>
                    </div>
                    <p class="text-[11px] text-[#4B6382]">
                      The bot exclusively processes self-chat messages and simulates human typing delay (2.5s). It never contacts external people.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- CHANNEL 2: TELEGRAM BOT EXECUTIVE HUB (LIVE INTEGRATION) -->
          <!-- ======================================================== -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 shadow-xs hover:shadow-md hover:border-[#1677FF]/40 transition-all space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FBFF] text-[#089CD0] border border-[#BAEFFF] uppercase">Channel 2</span>
                  <h3 class="text-sm font-black bg-gradient-to-r from-[#102A56] via-[#1677FF] to-[#38CFFF] bg-clip-text text-transparent">Telegram Bot Executive Hub</h3>
                </div>
                <p class="text-xs text-[#4B6382] mt-1">
                  Chat with your 50+ AI executives and generate images 24/7 without QR code scanning or disconnection risk.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <span class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 {telegramLinked ? 'bg-[#F0FBFF] text-[#089CD0] border border-[#BAEFFF]' : 'bg-[#F3F8FF] text-[#4B6382] border border-[#E3ECF7]'}">
                  <span class="w-2 h-2 rounded-full {telegramLinked ? 'bg-[#38CFFF] animate-pulse' : 'bg-[#7B92AE]'}"></span>
                  <span>{telegramLinked ? `CONNECTED${telegramUsername ? ` (@${telegramUsername})` : ''}` : 'DISCONNECTED'}</span>
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
              {#if telegramLinked}
                <!-- Connected State Card -->
                <div class="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#F0FBFF] border border-[#BAEFFF] space-y-3">
                  <div class="w-16 h-16 rounded-full bg-white border-2 border-[#38CFFF] flex items-center justify-center text-[#089CD0] animate-bounce shadow-2xs">
                    <Icon name="Send" size={30} />
                  </div>
                  <h3 class="text-base font-bold text-[#102A56]">Telegram Live &amp; Synchronized!</h3>
                  <p class="text-xs text-[#4B6382] text-center">
                    Connected as <strong class="text-[#1677FF]">{telegramUsername ? `@${telegramUsername}` : 'Telegram User'}</strong>. All commands and chats sync in real time.
                  </p>
                  <div class="flex items-center gap-3 pt-2">
                    {#if telegramDeepLink}
                      <a
                        href={telegramDeepLink}
                        target="_blank"
                        rel="noopener"
                        class="px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold flex items-center gap-2"
                      >
                        <Icon name="Send" size={13} />
                        <span>Open Telegram Chat</span>
                      </a>
                    {/if}
                    <button
                      type="button"
                      onclick={handleDisconnectTelegram}
                      disabled={isDisconnectingTelegram}
                      class="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isDisconnectingTelegram ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </div>
                </div>
              {:else}
                <!-- Pairing Box with Sync Code -->
                <div class="p-4 sm:p-6 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex flex-col items-center justify-center text-center space-y-4">
                  <div class="w-12 h-12 rounded-2xl bg-white border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shadow-2xs">
                    <Icon name="Send" size={24} />
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-[#102A56]">Pair Your Telegram Account</h4>
                    <p class="text-xs text-[#4B6382] mt-0.5">Use your 1-click sync link or enter your sync code below:</p>
                  </div>

                  <!-- Sync Code Pill with Copy -->
                  <div class="w-full max-w-full sm:max-w-xs flex items-center justify-between p-3 rounded-xl bg-white border border-[#E3ECF7] shadow-2xs">
                    <div class="text-left">
                      <span class="text-[10px] text-[#5E7694] font-bold uppercase tracking-wider block">Your Sync Code</span>
                      <span class="text-sm font-mono font-black text-[#102A56] tracking-wider">
                        {telegramSyncCode || 'EZBO-CONNECT'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onclick={copyTelegramCode}
                      class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {telegramCopied ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'btn-secondary'}"
                    >
                      <Icon name={telegramCopied ? 'Check' : 'Copy'} size={12} />
                      <span>{telegramCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <!-- 1-Click Launch Button -->
                  {#if telegramDeepLink}
                    <a
                      href={telegramDeepLink}
                      target="_blank"
                      rel="noopener"
                      class="w-full max-w-full sm:max-w-xs py-3 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Icon name="Send" size={14} />
                      <span>Open Telegram &amp; Connect (1-Click)</span>
                    </a>
                  {:else}
                    <button
                      type="button"
                      onclick={generateTelegramSync}
                      disabled={isGeneratingTelegramCode}
                      class="w-full max-w-full sm:max-w-xs py-2.5 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icon name="RefreshCw" size={13} class={isGeneratingTelegramCode ? 'animate-spin' : ''} />
                      <span>Generate Sync Code</span>
                    </button>
                  {/if}
                </div>
              {/if}

              <!-- Telegram Instructions & Command Cheatsheet -->
              <div class="space-y-4">
                <h4 class="text-sm font-bold uppercase tracking-wider text-[#1677FF]">Quick Pairing &amp; Commands:</h4>
                <ol class="space-y-2.5 text-xs text-[#102A56]">
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-[#F3F8FF] text-[#1677FF] flex items-center justify-center font-bold shrink-0 border border-[#CFE2FA]">1</span>
                    <span>Click <strong>"Open Telegram &amp; Connect"</strong> or find your bot on Telegram.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-[#F3F8FF] text-[#1677FF] flex items-center justify-center font-bold shrink-0 border border-[#CFE2FA]">2</span>
                    <span>Tap <strong>START</strong> in the bot chat — your account syncs instantly!</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-[#F3F8FF] text-[#1677FF] flex items-center justify-center font-bold shrink-0 border border-[#CFE2FA]">3</span>
                    <span>Start chatting or send any task directly in Telegram.</span>
                  </li>
                </ol>

                <!-- Command Cheatsheet Box -->
                <div class="p-3.5 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] text-xs space-y-2">
                  <div class="font-bold text-[#102A56] flex items-center gap-1.5">
                    <Icon name="Bot" size={14} class="text-[#1677FF]" />
                    <span>Telegram Slash Commands:</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div class="p-2 rounded-lg bg-white border border-[#E3ECF7]">
                      <code class="text-[#1677FF] font-mono font-bold">/status</code>
                      <p class="text-[#4B6382] text-[10px]">Plan &amp; active bot details</p>
                    </div>
                    <div class="p-2 rounded-lg bg-white border border-[#E3ECF7]">
                      <code class="text-[#1677FF] font-mono font-bold">/agents</code>
                      <p class="text-[#4B6382] text-[10px]">List &amp; switch 50+ specialists</p>
                    </div>
                    <div class="p-2 rounded-lg bg-white border border-[#E3ECF7]">
                      <code class="text-[#1677FF] font-mono font-bold">/image [prompt]</code>
                      <p class="text-[#4B6382] text-[10px]">Instant AI image creation</p>
                    </div>
                    <div class="p-2 rounded-lg bg-white border border-[#E3ECF7]">
                      <code class="text-[#1677FF] font-mono font-bold">/help</code>
                      <p class="text-[#4B6382] text-[10px]">Full command documentation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Omni-Channel Expansion Roadmap Cards -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 shadow-xs hover:shadow-md hover:border-[#1677FF]/40 transition-all space-y-4">
            <div>
              <h3 class="text-sm font-black bg-gradient-to-r from-[#102A56] via-[#1677FF] to-[#38CFFF] bg-clip-text text-transparent flex items-center gap-2">
                <Icon name="Layers" size={18} class="text-[#1677FF]" />
                <span>Multi-Channel Expansions</span>
              </h3>
              <p class="text-xs text-[#4B6382] mt-0.5">Integrations currently in pipeline for omni-channel customer message routing.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="MessageSquare" size={18} class="text-[#1677FF]" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-[#1677FF] border border-[#CFE2FA] uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-[#102A56]">Meta Messenger</h4>
                <p class="text-[11px] text-[#4B6382]">Facebook Page automated customer reply routing &amp; support.</p>
              </div>

              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="Smartphone" size={18} class="text-[#089CD0]" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-[#1677FF] border border-[#CFE2FA] uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-[#102A56]">Instagram DM</h4>
                <p class="text-[11px] text-[#4B6382]">Direct message e-commerce sales closer and product FAQ bot.</p>
              </div>

              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="Code" size={18} class="text-[#1677FF]" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-[#1677FF] border border-[#CFE2FA] uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-[#102A56]">REST API &amp; Webhooks</h4>
                <p class="text-[11px] text-[#4B6382]">Trigger custom agents via HTTP POST webhooks from external CRM software.</p>
              </div>

              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="Bot" size={18} class="text-[#102A56]" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-[#1677FF] border border-[#CFE2FA] uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-[#102A56]">Discord Bot</h4>
                <p class="text-[11px] text-[#4B6382]">Private server guild assistant with slash command integrations.</p>
              </div>
            </div>
          </div>
        </div>



      <!-- ==================================================== -->
      <!-- TAB 5: BILLING & SUBSCRIPTION -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'billing'}
        <div class="h-full overflow-y-auto max-w-5xl mx-auto space-y-6 pb-12">
          
          <!-- Notification Alert if action performed -->
          {#if billingNotice}
            <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#1677FF]/30 text-[#102A56] text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in shadow-2xs">
              <div class="flex items-center gap-2.5">
                <Icon name="CheckCircle2" size={18} class="text-[#1677FF]" />
                <span>{billingNotice}</span>
              </div>
              <button 
                onclick={() => billingNotice = ''} 
                class="p-1 hover:bg-[#E4F0FF] rounded-lg text-[#1677FF] transition-colors cursor-pointer"
                aria-label="Dismiss notice"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          {/if}

          <!-- Error Alert if payment initialization failed -->
          {#if billingError}
            <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
              <div class="flex items-center gap-2.5">
                <Icon name="AlertCircle" size={18} class="text-rose-600" />
                <span>{billingError}</span>
              </div>
              <button 
                onclick={() => billingError = ''} 
                class="p-1 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors cursor-pointer"
                aria-label="Dismiss error"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          {/if}

          <!-- Cancelled Subscription Notice (if cancelled) -->
          {#if $subscription.status === 'cancelled'}
            <div class="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <Icon name="AlertCircle" size={20} class="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p class="font-bold text-amber-800 text-sm">Subscription Auto-Renewal Cancelled</p>
                  <p class="text-[#4B6382] mt-0.5">
                    Your VIP privileges & 24/7 WhatsApp Bot access remain fully active until 
                    <strong class="text-[#102A56]">{new Date($subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>. 
                    You will not be billed again.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onclick={() => { reactivateSubscription(); billingNotice = 'Welcome back! Your VIP Subscription has been reactivated.'; }}
                class="px-4 py-2 rounded-xl blue-btn text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
              >
                Reactivate Subscription
              </button>
            </div>
          {/if}

          <!-- Current Subscription Overview Card -->
          <div class="p-6 sm:p-8 rounded-3xl ui-card-static space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-4">
              <div>
                <h2 class="text-xl font-bold text-[#102A56] flex items-center gap-2">
                  <Icon name="Crown" size={22} class="text-[#1677FF]" />
                  <span>Current Membership & Billing</span>
                </h2>
                <p class="text-xs text-[#4B6382] mt-1">Manage your active tier, renew, switch plans, or cancel anytime.</p>
              </div>

              <!-- Status Badge -->
              {#if $subscription.status === 'cancelled'}
                <div class="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Cancelled (Active until expiry)</span>
                </div>
              {:else if $subscription.plan === 'free'}
                <div class="px-3.5 py-1.5 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] text-[#4B6382] text-xs font-bold flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#7B92AE]"></span>
                  <span>Plan: Free / Starter</span>
                </div>
              {:else}
                <div class="px-3.5 py-1.5 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] text-[#1677FF] text-xs font-bold flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Plan: {$subscription.tier === 'byok_pro' ? 'Pro Plan' : $subscription.tier === 'managed' ? 'All-Inclusive Cloud' : 'Starter Plan'} ({$subscription.interval === 'yearly' ? 'Yearly' : 'Monthly'})</span>
                </div>
              {/if}
            </div>

            <!-- Current Plan Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                <p class="text-[11px] text-[#4B6382] font-semibold uppercase">Current Plan Rate</p>
                <p class="text-xl font-black text-[#102A56] mt-1">
                  {#if $subscription.tier === 'managed'}
                    BDT {$subscription.interval === 'yearly' ? '1,199' : '1,499'} <span class="text-xs text-[#4B6382] font-normal">/ mo</span>
                  {:else if $subscription.tier === 'byok_pro'}
                    BDT {$subscription.interval === 'yearly' ? '719' : '899'} <span class="text-xs text-[#4B6382] font-normal">/ mo</span>
                  {:else}
                    BDT {$subscription.interval === 'yearly' ? '399' : '499'} <span class="text-xs text-[#4B6382] font-normal">/ mo</span>
                  {/if}
                </p>
                <p class="text-[10px] text-[#1677FF] font-semibold mt-1">
                  {$subscription.tier === 'byok_pro' ? 'Pro Plan (Power Automation)' : $subscription.tier === 'managed' ? '100% Managed Cloud (Zero Keys)' : 'Starter Plan (Essential Starter)'}
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                <p class="text-[11px] text-[#4B6382] font-semibold uppercase">
                  {$subscription.status === 'cancelled' ? 'Access Expiration Date' : 'Next Billing / Expiration'}
                </p>
                <p class="text-sm font-bold text-[#102A56] mt-1">
                  {new Date($subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p class="text-[10px] text-[#5E7694] mt-1">
                  {$subscription.status === 'cancelled' ? 'No further renewal will occur' : 'Auto-renewal active'}
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                <p class="text-[11px] text-[#4B6382] font-semibold uppercase">WhatsApp AI Bot Feature</p>
                <p class="text-sm font-bold text-[#1677FF] mt-1">
                  {$subscription.plan === 'free' ? 'Disabled (Requires Pro/VIP)' : '24/7 Bot Activated'}
                </p>
                <p class="text-[10px] text-[#5E7694] mt-1">
                  {$subscription.plan === 'free' ? 'Upgrade to connect WhatsApp' : 'Priority Baileys routing enabled'}
                </p>
              </div>
            </div>

            <!-- Cancel Subscription Action Bar -->
            {#if $subscription.status === 'active' && $subscription.plan !== 'free'}
              <div class="pt-2 border-t border-[#E3ECF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span class="text-[#4B6382]">
                  Don't want to renew your VIP membership? You can cancel auto-renewal anytime without losing current days.
                </span>
                <button
                  type="button"
                  onclick={() => (isCancelModalOpen = true)}
                  class="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="X" size={14} />
                  <span>Cancel Subscription</span>
                </button>
              </div>
            {/if}
          </div>

          <!-- ==================================================== -->
          <!-- ALL AVAILABLE PLANS SHOWCASE & SWITCHER (UNIFIED) -->
          <!-- ==================================================== -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-bold text-[#102A56] flex items-center gap-2">
                <Icon name="Layers" size={20} class="text-[#1677FF]" />
                <span>Available Plans & Tiers</span>
              </h3>
              <p class="text-xs text-[#4B6382] mt-0.5">Switch between Starter Plan and Pro Plan to upgrade your AI capabilities.</p>
            </div>

            <!-- Unified Dynamic Pricing Grid -->
            <PricingCardsGrid
              context="billing"
              bind:selectedInterval={dashboardBillingInterval}
              onSelectPlan={(tier, interval) => handlePayPlan(tier, interval)}
              isProcessing={isProcessingPayment}
            />
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- CANCEL SUBSCRIPTION CONFIRMATION MODAL -->
        <!-- ==================================================== -->
        {#if isCancelModalOpen}
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 ui-modal-backdrop animate-in fade-in duration-200">
            <div class="w-full max-w-md ui-modal p-5 sm:p-6 space-y-5 text-left">
              <div class="flex items-center justify-between pb-3 border-b border-[#E3ECF7]">
                <div class="flex items-center gap-2.5 text-rose-600">
                  <Icon name="AlertCircle" size={22} />
                  <h3 class="text-base font-bold text-[#102A56]">Cancel Subscription?</h3>
                </div>
                <button
                  onclick={() => (isCancelModalOpen = false)}
                  class="p-1 rounded-lg text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] transition-colors"
                  aria-label="Close dialog"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div class="space-y-3 text-xs text-[#4B6382]">
                <p>
                  Are you sure you want to cancel your VIP subscription? 
                </p>
                <div class="p-3.5 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-2">
                  <p class="text-[#102A56] font-semibold flex items-center gap-1.5 text-[11px]">
                    <Icon name="CheckCircle2" size={14} class="text-[#1677FF]" />
                    <span>You won't lose your remaining time</span>
                  </p>
                  <p class="text-[#4B6382] text-[11px]">
                    Your VIP privileges and WhatsApp Bot will remain active until 
                    <strong class="text-[#102A56]">{new Date($subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                  </p>
                </div>

                <div class="space-y-1.5 pt-1">
                  <label for="cancel-reason-select" class="text-[11px] font-semibold text-[#102A56]">Please tell us why you are cancelling:</label>
                  <select
                    id="cancel-reason-select"
                    bind:value={cancelReason}
                    class="ui-select px-3 py-2 text-xs"
                  >
                    <option value="too_expensive">It is too expensive for me right now</option>
                    <option value="byok">I want to use my own free Gemini API key</option>
                    <option value="project_done">Finished my project / temporary need</option>
                    <option value="missing_features">Missing a specific feature I need</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3 border-t border-[#E3ECF7]">
                <button
                  type="button"
                  onclick={() => (isCancelModalOpen = false)}
                  class="w-full sm:w-auto px-4 py-2.5 rounded-xl btn-secondary text-xs cursor-pointer text-center"
                >
                  Keep My Plan
                </button>
                <button
                  type="button"
                  onclick={() => {
                    cancelSubscription();
                    isCancelModalOpen = false;
                    billingNotice = 'Your subscription has been cancelled. Access remains active until ' + new Date($subscription.expiresAt).toLocaleDateString();
                  }}
                  class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs text-center"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        {/if}

      <!-- ==================================================== -->
      <!-- TAB 6: SETTINGS -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'settings'}
        <div class="h-full overflow-y-auto max-w-4xl mx-auto space-y-6 pb-12">
          <!-- Master AI CEO Persona & Custom Instructions Card -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 space-y-6 shadow-xs hover:shadow-md hover:border-[#1677FF]/40 transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-4">
              <div>
                <h3 class="text-base sm:text-lg font-black bg-gradient-to-r from-[#102A56] via-[#1677FF] to-[#38CFFF] bg-clip-text text-transparent flex items-center gap-2">
                  <Icon name="Crown" size={20} class="text-[#1677FF]" />
                  <span>Ezbo — Master AI CEO Persona & Custom Instructions</span>
                </h3>
                <p class="text-xs text-[#4B6382] mt-1">
                  Give custom directives to Ezbo, your Master AI CEO. Ezbo will strictly follow these instructions across all tasks and delegations.
                </p>
              </div>

              {#if instructionsSaveNotice}
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                  <Icon name="Check" size={13} />
                  <span>{instructionsSaveNotice}</span>
                </span>
              {/if}
            </div>

            <!-- Presets Buttons -->
            <div class="space-y-2">
              <span class="text-[11px] font-bold text-[#5E7694] uppercase tracking-wider block">One-Click Quick Presets</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {#each CEO_PRESETS as preset}
                  <button
                    type="button"
                    onclick={() => applyCeoPreset(preset.prompt)}
                    class="p-3 rounded-2xl bg-white/80 hover:bg-[#EBF4FF] border border-[#CFE2FA] hover:border-[#1677FF] text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                  >
                    <div class="font-bold text-xs text-[#102A56] group-hover:text-[#1677FF] transition-colors">{preset.title}</div>
                    <div class="text-[10px] text-[#4B6382] mt-0.5">{preset.subtitle}</div>
                  </button>
                {/each}
              </div>
            </div>

            <!-- Textarea with Live Character Counter -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <label for="ceo-instructions" class="text-xs font-bold text-[#102A56]">Executive Directives</label>
                <span class="text-[11px] font-mono font-semibold text-[#5E7694]">
                  {customInstructions.length} / 2,000 characters
                </span>
              </div>
              <textarea
                id="ceo-instructions"
                bind:value={customInstructions}
                maxlength="2000"
                rows="4"
                placeholder="e.g. Always respond in professional Bengali. Provide high-converting marketing frameworks with structured action steps..."
                class="w-full ui-textarea p-3.5 text-xs sm:text-sm resize-none rounded-2xl bg-white/90 border border-[#CFE2FA] focus:border-[#1677FF] transition-all"
              ></textarea>
              <div class="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onclick={handleSaveInstructions}
                  class="px-5 py-2.5 rounded-xl blue-btn text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <Icon name="Save" size={14} />
                  <span>Save Directive</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Account Profile Card -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 space-y-6 shadow-xs hover:shadow-md hover:border-[#1677FF]/40 transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-4">
              <div>
                <h2 class="text-xl font-bold text-[#102A56] flex items-center gap-2">
                  <Icon name="Settings" size={22} class="text-[#1677FF]" />
                  <span>Settings & Preferences</span>
                </h2>
                <p class="text-xs text-[#4B6382] mt-1">Manage your account profile, API keys vault, and administrative control.</p>
              </div>

              <!-- Admin Link Pill -->
              <a
                href="/admin"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-secondary text-xs font-bold"
              >
                <Icon name="Shield" size={15} class="text-[#1677FF]" />
                <span>Admin Panel (/admin) →</span>
              </a>
            </div>

            <!-- Profile Info Grid (Custom Domain & Auth Method pruned per request) -->
            <div class="p-5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-4">
              <h3 class="text-xs font-bold text-[#102A56] uppercase tracking-wider">Account Information</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-[#4B6382] block mb-1">Display Name</span>
                  <span class="font-bold text-[#102A56] text-sm">{$currentUser?.name || 'Executive User'}</span>
                </div>
                <div>
                  <span class="text-[#4B6382] block mb-1">Registered Email</span>
                  <span class="font-mono text-[#1677FF] font-bold text-sm">{$currentUser?.email || 'user@ezboagents.com'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- API Key Management Gateway Card -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 space-y-4 shadow-xs hover:shadow-md hover:border-[#1677FF]/40 transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-4">
              <div>
                <h3 class="text-base font-bold text-[#102A56] flex items-center gap-2">
                  <Icon name="Key" size={18} class="text-[#1677FF]" />
                  <span>API Key Management & Model Hub</span>
                </h3>
                <p class="text-xs text-[#4B6382] mt-1">
                  Connect encrypted provider API keys (OpenRouter, Gemini, OpenAI, Groq, DeepSeek), sync 200+ live models, and select smart auto-rotating free models.
                </p>
              </div>

              <button
                type="button"
                onclick={() => switchTab('api-keys')}
                class="px-5 py-2.5 rounded-xl blue-btn text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all shrink-0 text-center"
              >
                <span>Open API Key Management</span>
                <Icon name="ArrowRight" size={14} />
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] space-y-1">
                <span class="text-[10px] font-bold text-[#1677FF] uppercase tracking-wider block">Auto Free Rotation</span>
                <p class="text-[11px] text-[#4B6382]">Smart fallback loop using OpenRouter free models (:free) with zero billing.</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] space-y-1">
                <span class="text-[10px] font-bold text-[#1677FF] uppercase tracking-wider block">Single Dedicated Model</span>
                <p class="text-[11px] text-[#4B6382]">Lock in your preferred model (Llama 3.3, Claude 3.5 Sonnet, GPT-4o).</p>
              </div>
              <div class="p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] space-y-1">
                <span class="text-[10px] font-bold text-[#1677FF] uppercase tracking-wider block">Client-Side Vault</span>
                <p class="text-[11px] text-[#4B6382]">AES-GCM encrypted in browser storage. Admin-filtered provider access.</p>
              </div>
            </div>
          </div>

          <!-- Danger Zone / Sign Out -->
          <div class="p-5 sm:p-6 rounded-3xl ui-card-static border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <h4 class="text-xs font-bold text-rose-700">Sign Out of Session</h4>
              <p class="text-[11px] text-[#4B6382]">Clear your stored local session and return to the login screen.</p>
            </div>
            <button
              type="button"
              onclick={handleLogout}
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-600/20 text-center"
            >
              Log Out
            </button>
          </div>
        </div>


      <!-- ==================================================== -->
      <!-- TAB 8: API KEY MANAGEMENT & MODEL EXPLORER -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'api-keys' || $activeDashboardTab === 'vault'}
        <ApiKeyManager />
      {/if}
    </div>
  </main>

  <!-- Interactive Tool Drawer (Active when user clicks Launch on any tool in the Tools Catalog) -->
  <ToolDrawer onOpenByok={() => { closeToolDrawer(); switchTab('settings'); }} />

  <!-- Floating ChatGPT-style Master AI CEO Chat Window & Launcher -->
  <FloatingCeoChat
    bind:isOpen={isCeoChatOpen}
    activeTab={$activeDashboardTab}
    onOpenChannels={() => { isChannelModalOpen = true; }}
  />

  <!-- Embedded Channel Connection Modal (WhatsApp & Telegram) -->
  <ChannelModal
    bind:isOpen={isChannelModalOpen}
    onClose={() => { isChannelModalOpen = false; }}
  />

  <!-- Embedded Mobile App Download Modal -->
  <AppDownloadModal
    bind:isOpen={isAppDownloadModalOpen}
    onClose={() => { isAppDownloadModalOpen = false; }}
  />

  <!-- Interactive Workflow Studio Modal for Pro Subscribers -->
  <WorkflowStudioModal
    bind:isOpen={isDashboardStudioOpen}
    agentName={studioAgentName}
  />
</div>
