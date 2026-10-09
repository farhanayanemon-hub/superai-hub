<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import DashboardChat from '$lib/components/DashboardChat.svelte';
  import ToolCard from '$lib/components/ToolCard.svelte';
  import ToolDrawer from '$lib/components/ToolDrawer.svelte';
  import ApiVaultManager from '$lib/components/ApiVaultManager.svelte';
  import { STORE_BOTS, STORE_CATEGORIES, type StoreBot } from '$lib/config/storeBots';
  import { initiateSubscriptionPayment, initiateBotPayment, verifyOpayTransaction } from '$lib/services/opay';
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
    unlockStoreBot,
    apiVault,
    type DashboardTab,
    type PlanTier
  } from '$lib/stores/userStore';

  let mobileSidebarOpen = $state(false);

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

  // Store Tab state
  let storeUnlockMsg = $state('');
  let storeError = $state('');
  let storeBillingInterval = $state<'monthly' | 'yearly'>('monthly');
  let storeCategory = $state<string>('all');

  // OPay Payment state & handlers
  let isProcessingPayment = $state(false);

  async function handlePayPlan(tier: PlanTier) {
    isProcessingPayment = true;
    billingError = '';
    billingNotice = 'Connecting to OPayBD gateway...';
    try {
      const res = await initiateSubscriptionPayment(tier, dashboardBillingInterval, $currentUser);
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

  async function handleUnlockBot(bot: StoreBot) {
    isProcessingPayment = true;
    storeError = '';
    storeUnlockMsg = `Connecting to OPayBD to unlock ${bot.name}...`;
    try {
      const res = await initiateBotPayment(bot, storeBillingInterval, $currentUser);
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      storeUnlockMsg = '';
      storeError = res.error || 'Payment gateway could not initialize. Please configure your OPay credentials in the Admin Panel (/admin).';
    } catch (e: any) {
      storeUnlockMsg = '';
      storeError = e.message || 'Failed to initialize agent checkout.';
    } finally {
      isProcessingPayment = false;
    }
  }

  onMount(() => {
    // Production Auth Protection: Redirect unauthenticated visitors to login
    if (!$isAuthenticated || !$currentUser) {
      goto('/login');
      return;
    }

    // Mandatory Paywall Gate: If user has not subscribed or plan expired, redirect to /plans
    if (!$currentUser.isSubscribed || $subscription.status !== 'active') {
      goto('/plans');
      return;
    }

    // Start WhatsApp live SSE stream
    whatsappApi.initStream();
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      if (!$isAuthenticated) {
        goto('/login');
      } else if ($currentUser && (!$currentUser.isSubscribed || $subscription.status !== 'active')) {
        goto('/plans');
      }
    }
  });

  onDestroy(() => {
    whatsappApi.closeStream();
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
      keyValidationMsg = 'API Key verified successfully! Unlimited BYOK access enabled.';
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
  }

  const filteredTools = $derived(
    TOOLS.filter((tool) => {
      const matchCategory = $activeCategory === 'all' || tool.category === $activeCategory;
      const query = $searchQuery.toLowerCase().trim();
      if (!query) return matchCategory;

      return (
        matchCategory &&
        (tool.name.toLowerCase().includes(query) ||
          tool.nameEn.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.keywords.some((k) => k.toLowerCase().includes(query)))
      );
    })
  );

  const unlockedBotsList = $derived(
    STORE_BOTS.filter((bot) => ($subscription.unlockedStoreBots || []).includes(bot.id))
  );

  const filteredStoreBots = $derived(
    STORE_BOTS.filter((bot) => storeCategory === 'all' || bot.category === storeCategory)
  );
</script>

<svelte:head>
  <title>Executive Console • EzboAgents (ezboagents.com)</title>
  <meta name="description" content="EzboAgents Executive Console - Central Brain AI Assistant, 50+ Specialized AI Executives, WhatsApp Encryption Sync, and BYOK Gemini Engine." />
</svelte:head>

<div class="h-screen w-screen bg-[#f8fafc] text-slate-900 flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
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
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
    ></div>
  {/if}

  <aside
    class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between shadow-sm transition-transform duration-300 ease-in-out shrink-0 {mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
  >
    <!-- Top Brand & Badge -->
    <div>
      <div class="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div class="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Icon name="Sparkles" class="text-blue-600" size={18} />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-base text-slate-900 tracking-tight">Ezbo<span class="text-blue-600">Agents</span></span>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">VIP</span>
            </div>
            <p class="text-[10px] text-slate-500 font-mono">ezboagents.com</p>
          </div>
        </a>

        <!-- Mobile Close Button -->
        <button
          type="button"
          onclick={() => (mobileSidebarOpen = false)}
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Close Sidebar"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      <!-- Navigation Menu Items -->
      <nav class="p-3 space-y-1.5">
        <!-- 1. AI Assistant Chat (Main Interface) -->
        <button
          type="button"
          onclick={() => switchTab('chat')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'chat' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="MessageSquare" size={17} class={$activeDashboardTab === 'chat' ? 'text-white' : 'text-blue-600'} />
            <span>Executive Chat</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold {$activeDashboardTab === 'chat' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
            Main
          </span>
        </button>

        <!-- 2. My Agents (Renamed from AI Agents) -->
        <button
          type="button"
          onclick={() => switchTab('agents')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'agents' || $activeDashboardTab === 'tools' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="Grid" size={17} class={$activeDashboardTab === 'agents' || $activeDashboardTab === 'tools' ? 'text-white' : 'text-blue-600'} />
            <span>My Agents</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium {$activeDashboardTab === 'agents' || $activeDashboardTab === 'tools' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
            {TOOLS.length + unlockedBotsList.length}
          </span>
        </button>

        <!-- 3. Agents Store (Directly below My Agents) -->
        <button
          type="button"
          onclick={() => switchTab('store')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'store' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="ShoppingBag" size={17} class={$activeDashboardTab === 'store' ? 'text-white' : 'text-blue-600'} />
            <span>Agents Store</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold {$activeDashboardTab === 'store' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
            Add-ons
          </span>
        </button>

        <!-- 4. Channels (Multi-Channel Integration, renamed from WhatsApp Sync) -->
        <button
          type="button"
          onclick={() => switchTab('channels')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'channels' || $activeDashboardTab === 'whatsapp' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="QrCode" size={17} class={$activeDashboardTab === 'channels' || $activeDashboardTab === 'whatsapp' ? 'text-white' : 'text-blue-600'} />
            <span>Channels</span>
          </div>
          <span class="flex items-center gap-1 text-[10px]">
            <span class="w-2 h-2 rounded-full {$whatsappStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}"></span>
          </span>
        </button>

        <!-- 5. Subscription & Billing -->
        <button
          type="button"
          onclick={() => switchTab('billing')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'billing' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="CreditCard" size={17} class={$activeDashboardTab === 'billing' ? 'text-white' : 'text-blue-600'} />
            <span>Billing & Plans</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold {$activeDashboardTab === 'billing' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
            Realtime
          </span>
        </button>

        <!-- 6. Settings & Profile (Contains API Key Vault) -->
        <button
          type="button"
          onclick={() => switchTab('settings')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'settings' || $activeDashboardTab === 'vault' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="Settings" size={17} class={$activeDashboardTab === 'settings' || $activeDashboardTab === 'vault' ? 'text-white' : 'text-slate-400'} />
            <span>Settings</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium {$activeDashboardTab === 'settings' || $activeDashboardTab === 'vault' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
            Vault
          </span>
        </button>
      </nav>
    </div>

    <!-- Bottom User Section & Sign Out -->
    <div class="p-3 border-t border-slate-200 bg-slate-50">
      <div class="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
            {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div class="truncate">
            <p class="text-xs font-bold text-slate-900 truncate">{$currentUser?.name || 'User'}</p>
            <p class="text-[10px] text-slate-500 truncate">{$currentUser?.email || 'user@ezboagents.com'}</p>
          </div>
        </div>

        <button
          type="button"
          onclick={handleLogout}
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          title="Sign Out"
        >
          <Icon name="LogOut" size={16} />
        </button>
      </div>
    </div>
  </aside>

  <!-- ======================================================== -->
  <!-- 2. MAIN WORKSPACE AREA -->
  <!-- ======================================================== -->
  <main class="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc] relative">
    <!-- Top Mobile Header Bar -->
    <div class="lg:hidden h-14 px-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm">
      <button
        type="button"
        onclick={() => (mobileSidebarOpen = true)}
        class="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
        aria-label="Open Sidebar Menu"
      >
        <Icon name="Grid" size={18} />
      </button>

      <div class="flex items-center gap-2">
        <span class="font-extrabold text-sm text-slate-900">Ezbo<span class="text-blue-600">Agents</span></span>
        <span class="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">
          {$activeDashboardTab.toUpperCase()}
        </span>
      </div>

      <a href="/" class="text-xs text-slate-500 hover:text-slate-900 font-medium">Home</a>
    </div>

    <!-- Tab View Router -->
    <div class="flex-1 overflow-hidden p-3 sm:p-5">
      <!-- ==================================================== -->
      <!-- TAB 1: AI ASSISTANT CHAT (MAIN INTERFACE) -->
      <!-- ==================================================== -->
      {#if $activeDashboardTab === 'chat'}
        <div class="h-full">
          <DashboardChat />
        </div>

      <!-- ==================================================== -->
      <!-- TAB 2: MY AGENTS (CUSTOM AGENTS + UNLOCKED STORE BOTS) -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'agents' || $activeDashboardTab === 'tools'}
        <div class="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
          <!-- Header and Search -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-sm">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span>My Agents</span>
                <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  {filteredTools.length + unlockedBotsList.length} Active
                </span>
              </h2>
              <p class="text-xs text-slate-500 mt-1">
                Your specialized AI Robot agents and directives. Launch real-time sessions anytime.
              </p>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                onclick={() => switchTab('store')}
                class="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="ShoppingBag" size={14} />
                <span>Agents Store</span>
              </button>
            </div>
          </div>

          <!-- Unlocked Store Bots Section -->
          {#if unlockedBotsList.length > 0}
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Icon name="Crown" size={16} class="text-blue-600" />
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Unlocked Add-on Robot Specialists</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {#each unlockedBotsList as bot}
                  <div class="p-5 rounded-3xl bg-white border border-blue-200 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div class="flex items-start gap-3">
                        <img src={bot.avatar} alt={bot.name} class="w-12 h-12 rounded-2xl object-cover border border-blue-200 shrink-0" />
                        <div>
                          <div class="flex items-center gap-1.5">
                            <h4 class="font-bold text-sm text-slate-900">{bot.name}</h4>
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
                          </div>
                          <p class="text-xs text-blue-600 font-semibold">{bot.role}</p>
                        </div>
                      </div>
                      <p class="text-xs text-slate-600 mt-3 leading-relaxed">{bot.description}</p>
                      <div class="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        <p class="text-[10px] font-bold text-slate-500 uppercase">Unlocked Features:</p>
                        {#each bot.features as feat}
                          <div class="flex items-start gap-1.5 text-[11px] text-slate-700">
                            <Icon name="CheckCircle2" size={13} class="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        {/each}
                      </div>
                    </div>
                    <button
                      type="button"
                      onclick={() => switchTab('chat')}
                      class="w-full py-2.5 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-500/20"
                    >
                      <Icon name="MessageSquare" size={14} />
                      <span>Launch in Executive Chat</span>
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Base Tools Catalog -->
          {#if filteredTools.length === 0 && unlockedBotsList.length === 0}
            <div class="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xs">
              <div class="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
                <Icon name="Sparkles" size={28} />
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-bold text-slate-900">Your AI Executives Desk</h3>
                <p class="text-xs text-slate-500 max-w-md mx-auto">
                  You can subscribe to specialized AI robot add-ons from the Agents Store, or request custom agent directives.
                </p>
              </div>
              <button
                type="button"
                onclick={() => switchTab('store')}
                class="px-5 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
              >
                <Icon name="ShoppingBag" size={14} />
                <span>Explore Agents Store</span>
              </button>
            </div>
          {:else if filteredTools.length > 0}
            <!-- Category Filter Tabs -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {#each CATEGORIES as cat}
                <button
                  type="button"
                  onclick={() => activeCategory.set(cat.id)}
                  class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {$activeCategory === cat.id ? 'bg-blue-600 text-white shadow-sm font-bold' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}"
                >
                  {cat.name}
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
      <!-- TAB 3: AGENTS STORE (SPECIALIZED AI ROBOT ADD-ONS) -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'store'}
        <div class="h-full flex flex-col space-y-5 overflow-y-auto pr-1 pb-12">
          <!-- Store Header -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
                <Icon name="ShoppingBag" size={13} />
                <span>Specialized Robot Executives Desk</span>
              </div>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">Agents Store</h2>
              <p class="text-xs text-slate-500 mt-1 max-w-xl">
                Add-on AI robot agents with dedicated cognitive skills. Available for 1-Month or 1-Year access. Full features and execution tools unlock immediately upon verified payment.
              </p>
            </div>

            <!-- 1 Month / 1 Year Interval Switcher -->
            <div class="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
              <span class="text-xs font-semibold {storeBillingInterval === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-500'}">1 Month</span>
              <button
                type="button"
                onclick={() => (storeBillingInterval = storeBillingInterval === 'monthly' ? 'yearly' : 'monthly')}
                class="relative w-12 h-6.5 rounded-full transition-colors duration-200 cursor-pointer {storeBillingInterval === 'yearly' ? 'bg-blue-600' : 'bg-slate-300'}"
                aria-label="Toggle store billing interval"
              >
                <span
                  class="absolute top-1 transition-all duration-200 w-4.5 h-4.5 rounded-full bg-white shadow-sm {storeBillingInterval === 'yearly' ? 'left-6.5' : 'left-1'}"
                ></span>
              </button>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold {storeBillingInterval === 'yearly' ? 'text-blue-700 font-bold' : 'text-slate-500'}">1 Year</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Save 20%</span>
              </div>
            </div>
          </div>

          <!-- Alert Notices -->
          {#if storeUnlockMsg}
            <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
              <div class="flex items-center gap-2.5">
                <Icon name="CheckCircle2" size={18} class="text-blue-600" />
                <span>{storeUnlockMsg}</span>
              </div>
              <button onclick={() => (storeUnlockMsg = '')} class="p-1 hover:bg-blue-100 rounded-lg text-blue-600">
                <Icon name="X" size={14} />
              </button>
            </div>
          {/if}

          {#if storeError}
            <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
              <div class="flex items-center gap-2.5">
                <Icon name="AlertCircle" size={18} class="text-rose-600" />
                <span>{storeError}</span>
              </div>
              <button onclick={() => (storeError = '')} class="p-1 hover:bg-rose-100 rounded-lg text-rose-600">
                <Icon name="X" size={14} />
              </button>
            </div>
          {/if}

          <!-- Category Filter Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {#each STORE_CATEGORIES as cat}
              <button
                type="button"
                onclick={() => (storeCategory = cat.id)}
                class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {storeCategory === cat.id ? 'bg-blue-600 text-white shadow-sm font-bold' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}"
              >
                {cat.label}
              </button>
            {/each}
          </div>

          <!-- Store Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {#each filteredStoreBots as bot (bot.id)}
              {@const isUnlocked = ($subscription.unlockedStoreBots || []).includes(bot.id)}
              <div class="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-shadow">
                <div class="space-y-4">
                  <!-- Header: Avatar, Name & Badges -->
                  <div class="flex items-start gap-3.5">
                    <div class="relative w-14 h-14 rounded-2xl overflow-hidden border border-blue-100 shadow-inner shrink-0">
                      <img src={bot.avatar} alt={bot.name} class="w-full h-full object-cover" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="font-bold text-slate-900 text-base">{bot.name}</h3>
                        {#if bot.badge}
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">{bot.badge}</span>
                        {/if}
                        {#if bot.isNew}
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">NEW</span>
                        {/if}
                      </div>
                      <p class="text-xs text-blue-600 font-semibold mt-0.5">{bot.role}</p>
                    </div>
                  </div>

                  <p class="text-xs text-slate-600 leading-relaxed">{bot.description}</p>

                  <!-- Technical Specs Card -->
                  <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 font-medium">Neural Engine:</span>
                      <span class="font-mono text-slate-900 font-semibold">{bot.specs.engine}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 font-medium">Latency:</span>
                      <span class="text-emerald-600 font-semibold">{bot.specs.responseTime}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 font-medium">Context Window:</span>
                      <span class="text-slate-900 font-semibold">{bot.specs.contextWindow}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 font-medium">Specialization:</span>
                      <span class="text-blue-700 font-medium truncate max-w-[160px]">{bot.specs.specialization}</span>
                    </div>
                  </div>

                  <!-- Features Preview -->
                  <div class="space-y-1.5">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Features Unlocked Upon Purchase:</p>
                    {#each bot.features as feat}
                      <div class="flex items-start gap-2 text-xs text-slate-700">
                        <Icon name="Check" size={13} class="text-blue-600 shrink-0 mt-0.5" />
                        <span class="text-[11px] leading-tight">{feat}</span>
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Price and Action CTA -->
                <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span class="text-xl font-black text-slate-900">
                      BDT {storeBillingInterval === 'yearly' ? bot.yearlyPrice.toLocaleString() : bot.monthlyPrice.toLocaleString()}
                    </span>
                    <span class="text-xs text-slate-500 font-medium">/{storeBillingInterval === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>

                  {#if isUnlocked}
                    <button
                      type="button"
                      onclick={() => switchTab('agents')}
                      class="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icon name="CheckCircle2" size={14} />
                      <span>Active in My Agents →</span>
                    </button>
                  {:else}
                    <button
                      type="button"
                      onclick={() => handleUnlockBot(bot)}
                      disabled={isProcessingPayment}
                      class="px-4 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Icon name="Zap" size={14} />
                      <span>{isProcessingPayment ? 'Connecting...' : 'Subscribe'}</span>
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

      <!-- ==================================================== -->
      <!-- TAB 4: CHANNELS (MULTI-CHANNEL HUB, RENAMED FROM WHATSAPP) -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'channels' || $activeDashboardTab === 'whatsapp'}
        <div class="h-full overflow-y-auto max-w-5xl mx-auto space-y-6 pb-12">
          <!-- Header -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                  <Icon name="QrCode" size={22} class="text-blue-600" />
                  <span>Channels & Communication Hub</span>
                </h2>
                <p class="text-xs text-slate-500 mt-1">
                  Connect multiple communication channels to automate client interactions and executive workflows 24/7.
                </p>
              </div>
              <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold {$whatsappStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
                <span class="w-2 h-2 rounded-full {$whatsappStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}"></span>
                <span>WhatsApp: {$whatsappStatus.toUpperCase()}</span>
              </div>
            </div>

            <!-- WhatsApp Channel (Primary Active Channel) -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Channel 1</span>
                  <h3 class="text-sm font-bold text-slate-900">WhatsApp Private Intelligence Sync</h3>
                </div>
                <span class="text-xs text-slate-500 font-mono">Baileys Multi-Device</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
                <!-- QR Image Display -->
                <div class="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
                  {#if $whatsappStatus === 'connected'}
                    <div class="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                      <Icon name="Check" size={32} />
                    </div>
                    <h3 class="text-base font-bold text-slate-900">WhatsApp Live & Connected!</h3>
                    <p class="text-xs text-slate-500 text-center mt-1">Send any message to yourself in WhatsApp to test.</p>
                    <button
                      type="button"
                      onclick={handleDisconnectWhatsApp}
                      disabled={isDisconnecting}
                      class="mt-6 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isDisconnecting ? 'Disconnecting...' : 'Disconnect Session'}
                    </button>
                  {:else if $whatsappQr}
                    <div class="p-3 bg-white rounded-2xl shadow-xl border border-blue-200">
                      <img src={$whatsappQr} alt="WhatsApp QR Code" class="w-56 h-56" />
                    </div>
                    <p class="text-[11px] text-blue-700 mt-3 font-mono font-semibold">Scan QR code using WhatsApp on your phone</p>
                  {:else}
                    <div class="w-56 h-56 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                      <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating encrypted QR handshake...</span>
                    </div>
                  {/if}
                </div>

                <!-- Setup Steps -->
                <div class="space-y-4">
                  <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-600">Pairing Instructions:</h3>
                  <ol class="space-y-3 text-xs text-slate-700">
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-200">1</span>
                      <span>Open <strong>WhatsApp</strong> on your phone.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-200">2</span>
                      <span>Tap <strong>Settings</strong> (iOS) or <strong>Three Dots ⋮</strong> (Android) and choose <strong>Linked Devices</strong>.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-200">3</span>
                      <span>Point your phone camera at the QR code on the left.</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-200">4</span>
                      <span>Once connected, send any message to your own number ("Message Yourself") to start!</span>
                    </li>
                  </ol>

                  <div class="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                    <div class="font-bold flex items-center gap-1.5 text-blue-700">
                      <Icon name="Shield" size={14} class="text-blue-600" />
                      <span>100% Anti-Ban Encrypted Architecture</span>
                    </div>
                    <p class="text-[11px] text-slate-600">
                      The bot exclusively processes self-chat messages and simulates human typing delay (2.5s). It never contacts external people.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Omni-Channel Expansion Roadmap Cards -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Icon name="Layers" size={18} class="text-blue-600" />
                <span>Multi-Channel Expansions</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Integrations currently in pipeline for multi-channel message routing.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="Send" size={18} class="text-sky-500" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-slate-900">Telegram Bot</h4>
                <p class="text-[11px] text-slate-500">Direct BotFather webhook synchronization for private command execution.</p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="MessageSquare" size={18} class="text-blue-600" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-slate-900">Meta Messenger</h4>
                <p class="text-[11px] text-slate-500">Facebook Page & Instagram Direct Message automated reply routing.</p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="Code" size={18} class="text-indigo-600" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-slate-900">REST API & Webhooks</h4>
                <p class="text-[11px] text-slate-500">Trigger custom agents via HTTP POST webhooks from external CRM software.</p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <Icon name="Bot" size={18} class="text-purple-600" />
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">Coming Soon</span>
                </div>
                <h4 class="text-xs font-bold text-slate-900">Discord Bot</h4>
                <p class="text-[11px] text-slate-500">Private server guild assistant with slash command integrations.</p>
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
            <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
              <div class="flex items-center gap-2.5">
                <Icon name="CheckCircle2" size={18} class="text-blue-600" />
                <span>{billingNotice}</span>
              </div>
              <button 
                onclick={() => billingNotice = ''} 
                class="p-1 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
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
                class="p-1 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
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
                  <p class="text-slate-600 mt-0.5">
                    Your VIP privileges & 24/7 WhatsApp Bot access remain fully active until 
                    <strong class="text-slate-900">{new Date($subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>. 
                    You will not be billed again.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onclick={() => { reactivateSubscription(); billingNotice = 'Welcome back! Your VIP Subscription has been reactivated.'; }}
                class="px-4 py-2 rounded-xl blue-btn text-white font-bold text-xs shrink-0 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                Reactivate Subscription
              </button>
            </div>
          {/if}

          <!-- Current Subscription Overview Card -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="Crown" size={22} class="text-blue-600" />
                  <span>Current Membership & Billing</span>
                </h2>
                <p class="text-xs text-slate-500 mt-1">Manage your active tier, renew, switch plans, or cancel anytime.</p>
              </div>

              <!-- Status Badge -->
              {#if $subscription.status === 'cancelled'}
                <div class="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Cancelled (Active until expiry)</span>
                </div>
              {:else if $subscription.plan === 'free'}
                <div class="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Plan: Free / BYOK</span>
                </div>
              {:else}
                <div class="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Plan: {$subscription.tier === 'managed' ? 'All-Inclusive Cloud' : 'BYOK Multi-Engine'} ({$subscription.interval === 'yearly' ? 'Yearly' : 'Monthly'})</span>
                </div>
              {/if}
            </div>

            <!-- Current Plan Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p class="text-[11px] text-slate-500 font-semibold uppercase">Current Plan Rate</p>
                <p class="text-xl font-black text-slate-900 mt-1">
                  {#if $subscription.tier === 'managed'}
                    BDT {$subscription.interval === 'yearly' ? '1,199' : '1,499'} <span class="text-xs text-slate-500 font-normal">/ mo</span>
                  {:else}
                    BDT {$subscription.interval === 'yearly' ? '399' : '499'} <span class="text-xs text-slate-500 font-normal">/ mo</span>
                  {/if}
                </p>
                <p class="text-[10px] text-blue-600 font-medium mt-1">
                  {$subscription.tier === 'managed' ? '100% Managed Cloud (Zero Keys)' : 'BYOK Multi-Engine (Client Keys)'}
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p class="text-[11px] text-slate-500 font-semibold uppercase">
                  {$subscription.status === 'cancelled' ? 'Access Expiration Date' : 'Next Billing / Expiration'}
                </p>
                <p class="text-sm font-bold text-slate-900 mt-1">
                  {new Date($subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p class="text-[10px] text-slate-500 mt-1">
                  {$subscription.status === 'cancelled' ? 'No further renewal will occur' : 'Auto-renewal active'}
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p class="text-[11px] text-slate-500 font-semibold uppercase">WhatsApp AI Bot Feature</p>
                <p class="text-sm font-bold text-blue-600 mt-1">
                  {$subscription.plan === 'free' ? 'Disabled (Requires Pro/VIP)' : '24/7 Bot Activated'}
                </p>
                <p class="text-[10px] text-slate-500 mt-1">
                  {$subscription.plan === 'free' ? 'Upgrade to connect WhatsApp' : 'Priority Baileys routing enabled'}
                </p>
              </div>
            </div>

            <!-- Cancel Subscription Action Bar -->
            {#if $subscription.status === 'active' && $subscription.plan !== 'free'}
              <div class="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span class="text-slate-500">
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
          <!-- ALL AVAILABLE PLANS SHOWCASE & SWITCHER -->
          <!-- ==================================================== -->
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="Layers" size={20} class="text-blue-600" />
                  <span>Available Plans & Tiers</span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">Switch between Bring-Your-Own-Key (Free) or fully managed AI with multi-API keys.</p>
              </div>

              <!-- Monthly / Yearly Toggle -->
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold {dashboardBillingInterval === 'monthly' ? 'text-slate-900' : 'text-slate-400'}">Monthly</span>
                <button
                  onclick={() => dashboardBillingInterval = dashboardBillingInterval === 'monthly' ? 'yearly' : 'monthly'}
                  aria-label="Toggle billing interval between monthly and yearly"
                  class="relative w-11 h-6 rounded-full transition-all duration-300 {dashboardBillingInterval === 'yearly' ? 'bg-blue-600' : 'bg-slate-200'}"
                >
                  <span class="absolute top-1 transition-all duration-300 w-4 h-4 rounded-full bg-white shadow {dashboardBillingInterval === 'yearly' ? 'left-6' : 'left-1'}"></span>
                </button>
                <span class="text-xs font-semibold {dashboardBillingInterval === 'yearly' ? 'text-blue-600 font-bold' : 'text-slate-400'}">Yearly</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <!-- Plan 1: BYOK Multi-Engine -->
              <div class="p-6 rounded-3xl bg-white border {($subscription.tier === 'byok' || $subscription.tier === 'pro' || $subscription.tier === 'ultra') && $subscription.interval === dashboardBillingInterval ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-slate-200'} flex flex-col justify-between relative shadow-sm">
                {#if ($subscription.tier === 'byok' || $subscription.tier === 'pro' || $subscription.tier === 'ultra') && $subscription.interval === dashboardBillingInterval}
                  <div class="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wide shadow-sm">
                    Active Plan
                  </div>
                {/if}
                <div class="space-y-3">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Bring Your Own Key</span>
                    <h4 class="text-lg font-bold text-slate-900 mt-1.5">BYOK Multi-Engine</h4>
                    <p class="text-xs text-slate-500 mt-1">Connect your own API keys with unlimited engine switching and zero token markups.</p>
                  </div>

                  <div class="pt-2 border-t border-slate-100">
                    <p class="text-2xl font-black text-slate-900">BDT {dashboardBillingInterval === 'yearly' ? '399' : '499'} <span class="text-xs text-slate-500 font-normal">/ mo</span></p>
                    <p class="text-[11px] text-slate-500">{dashboardBillingInterval === 'yearly' ? 'Billed annually (BDT 4,790/yr)' : 'Billed monthly'}</p>
                  </div>

                  <ul class="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> <strong>Universal Multi-API Key Vault</strong></li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> Gemini, OpenAI, Grok, DeepSeek, OpenRouter & Replicate</li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> Live model switcher (different keys per task)</li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> <strong>Zero token markup</strong> — direct provider rates</li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> WhatsApp self-assistant integration</li>
                  </ul>
                </div>

                <div class="pt-6">
                  {#if ($subscription.tier === 'byok' || $subscription.tier === 'pro' || $subscription.tier === 'ultra') && $subscription.interval === dashboardBillingInterval}
                    <button disabled class="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs cursor-default">Current Plan</button>
                  {:else}
                    <button onclick={() => handlePayPlan('byok')} disabled={isProcessingPayment} class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer border border-slate-200 disabled:opacity-50">
                      {isProcessingPayment ? 'Connecting...' : 'Subscribe'}
                    </button>
                  {/if}
                </div>
              </div>

              <!-- Plan 2: All-Inclusive Cloud -->
              <div class="p-6 rounded-3xl bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 border-2 {($subscription.tier === 'managed' || $subscription.tier === 'complete') && $subscription.interval === dashboardBillingInterval ? 'border-blue-600 ring-2 ring-blue-500/50 shadow-blue-500/20' : 'border-blue-500/60'} flex flex-col justify-between relative shadow-md">
                <div class="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wide shadow-md">
                  ⚡ Zero Setup • Most Popular
                </div>
                <div class="space-y-3">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">100% Managed Cloud</span>
                    <h4 class="text-lg font-bold text-slate-900 mt-1.5">All-Inclusive Cloud</h4>
                    <p class="text-xs text-slate-500 mt-1">Ready instantly with zero API keys or setup required.</p>
                  </div>

                  <div class="pt-2 border-t border-slate-100">
                    <p class="text-2xl font-black text-slate-900">BDT {dashboardBillingInterval === 'yearly' ? '1,199' : '1,499'} <span class="text-xs text-slate-500 font-normal">/ mo</span></p>
                    <p class="text-[11px] text-slate-500">{dashboardBillingInterval === 'yearly' ? 'Billed annually (BDT 14,390/yr)' : 'Billed monthly'}</p>
                  </div>

                  <ul class="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                    <li class="flex items-center gap-2 font-semibold text-slate-900"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> <strong class="text-blue-700 font-bold">ZERO API Keys Needed</strong></li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> Platform-managed high-speed AI cluster</li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> Gemini 2.0 Flash & GPT-4o pre-configured</li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> Priority fast-lane execution speeds</li>
                    <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> WhatsApp self-assistant integration</li>
                  </ul>
                </div>

                <div class="pt-6">
                  {#if ($subscription.tier === 'managed' || $subscription.tier === 'complete') && $subscription.interval === dashboardBillingInterval}
                    <button disabled class="w-full py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs cursor-default">Current Plan</button>
                  {:else}
                    <button onclick={() => handlePayPlan('managed')} disabled={isProcessingPayment} class="w-full py-2.5 rounded-xl blue-btn text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-blue-500/20">
                      {isProcessingPayment ? 'Connecting...' : 'Subscribe'}
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- CANCEL SUBSCRIPTION CONFIRMATION MODAL -->
        <!-- ==================================================== -->
        {#if isCancelModalOpen}
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-left">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <div class="flex items-center gap-2.5 text-rose-600">
                  <Icon name="AlertCircle" size={22} />
                  <h3 class="text-base font-bold text-slate-900">Cancel Subscription?</h3>
                </div>
                <button
                  onclick={() => (isCancelModalOpen = false)}
                  class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div class="space-y-3 text-xs text-slate-700">
                <p>
                  Are you sure you want to cancel your VIP subscription? 
                </p>
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p class="text-slate-900 font-semibold flex items-center gap-1.5 text-[11px]">
                    <Icon name="CheckCircle2" size={14} class="text-blue-600" />
                    <span>You won't lose your remaining time</span>
                  </p>
                  <p class="text-slate-500 text-[11px]">
                    Your VIP privileges and WhatsApp Bot will remain active until 
                    <strong class="text-slate-800">{new Date($subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                  </p>
                </div>

                <div class="space-y-1.5 pt-1">
                  <label for="cancel-reason-select" class="text-[11px] font-semibold text-slate-700">Please tell us why you are cancelling:</label>
                  <select
                    id="cancel-reason-select"
                    bind:value={cancelReason}
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="too_expensive">It is too expensive for me right now</option>
                    <option value="byok">I want to use my own free Gemini API key (BYOK)</option>
                    <option value="project_done">Finished my project / temporary need</option>
                    <option value="missing_features">Missing a specific feature I need</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onclick={() => (isCancelModalOpen = false)}
                  class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
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
                  class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-rose-600/20"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        {/if}

      <!-- ==================================================== -->
      <!-- TAB 6: SETTINGS & UNIVERSAL API VAULT -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'settings' || $activeDashboardTab === 'vault'}
        <div class="h-full overflow-y-auto max-w-4xl mx-auto space-y-6 pb-12">
          <!-- Account Profile Card -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="Settings" size={22} class="text-blue-600" />
                  <span>Settings & Preferences</span>
                </h2>
                <p class="text-xs text-slate-500 mt-1">Manage your account profile, API keys vault, and administrative control.</p>
              </div>

              <!-- Admin Link Pill -->
              <a
                href="/admin"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-700 font-bold text-xs transition-all shadow-xs"
              >
                <Icon name="Shield" size={15} class="text-blue-600" />
                <span>Admin Panel (/admin) →</span>
              </a>
            </div>

            <!-- Profile Info Grid (Custom Domain & Auth Method pruned per request) -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Information</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-500 block mb-1">Display Name</span>
                  <span class="font-bold text-slate-900 text-sm">{$currentUser?.name || 'Executive User'}</span>
                </div>
                <div>
                  <span class="text-slate-500 block mb-1">Registered Email</span>
                  <span class="font-mono text-blue-700 font-bold text-sm">{$currentUser?.email || 'user@ezboagents.com'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Universal API Key Vault (Moved inside Settings per request) -->
          <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div class="border-b border-slate-100 pb-3">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <Icon name="Key" size={18} class="text-blue-600" />
                <span>Universal API Key Vault</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Add and manage client-side encrypted API keys for Gemini, OpenAI, Grok, DeepSeek, and OpenRouter.
              </p>
            </div>

            <ApiVaultManager />

            {#if $subscription.tier !== 'ultra' && $subscription.tier !== 'complete'}
              <div class="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <h4 class="text-sm font-bold text-slate-900">Basic Gemini BYOK Key</h4>
                <p class="text-xs text-slate-500">Connect your free API key from Google AI Studio for personal BYOK access.</p>
                <div class="space-y-3">
                  <input
                    type="password"
                    bind:value={inputKey}
                    placeholder="AIzaSy..."
                    class="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 outline-none"
                  />
                  {#if keyValidationMsg}
                    <div class="p-3 rounded-xl text-xs flex items-center gap-2 {keyValidationState === 'valid' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : keyValidationState === 'invalid' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
                      <Icon name={keyValidationState === 'valid' ? 'Check' : 'AlertCircle'} size={14} />
                      <span>{keyValidationMsg}</span>
                    </div>
                  {/if}
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      onclick={testAndSaveApiKey}
                      disabled={keyValidationState === 'testing'}
                      class="px-5 py-2 rounded-xl blue-btn text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-blue-500/20"
                    >
                      {keyValidationState === 'testing' ? 'Validating...' : 'Save & Validate Key'}
                    </button>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" class="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors">
                      <span>Get Free Key</span>
                      <Icon name="ExternalLink" size={13} />
                    </a>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Danger Zone / Sign Out -->
          <div class="p-6 rounded-3xl bg-white border border-rose-200 shadow-sm flex items-center justify-between">
            <div>
              <h4 class="text-xs font-bold text-rose-700">Sign Out of Session</h4>
              <p class="text-[11px] text-slate-500">Clear your stored local session and return to the login screen.</p>
            </div>
            <button
              type="button"
              onclick={handleLogout}
              class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-600/20"
            >
              Log Out
            </button>
          </div>
        </div>
      {/if}
    </div>
  </main>

  <!-- Interactive Tool Drawer (Active when user clicks Launch on any tool in the Tools Catalog) -->
  <ToolDrawer />
</div>
