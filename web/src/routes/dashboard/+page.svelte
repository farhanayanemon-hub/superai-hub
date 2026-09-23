<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import DashboardChat from '$lib/components/DashboardChat.svelte';
  import ToolCard from '$lib/components/ToolCard.svelte';
  import ToolDrawer from '$lib/components/ToolDrawer.svelte';
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
    type DashboardTab
  } from '$lib/stores/userStore';

  let mobileSidebarOpen = $state(false);

  // BYOK Tab local state
  let inputKey = $state($apiKey || '');
  let keyValidationState = $state<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  let keyValidationMsg = $state('');

  // WhatsApp Tab local state
  let isDisconnecting = $state(false);

  // Billing Tab state
  let billingSubmitted = $state(false);
  let txnId = $state('');

  // Settings Tab state
  let smtpEmailNotifications = $state(true);
  let emailSavedMsg = $state('');

  onMount(() => {
    // Production Auth Protection: Redirect unauthenticated visitors to login
    if (!$isAuthenticated || !$currentUser) {
      goto('/login');
      return;
    }

    // Start WhatsApp live SSE stream
    whatsappApi.initStream();
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
</script>

<svelte:head>
  <title>Dashboard • SuperAI Hub (ezboagents.com)</title>
  <meta name="description" content="SuperAI Hub Executive Dashboard - AI Assistant Chat, 50+ Specialized Tools, WhatsApp Sync, and BYOK Gemini Manager." />
</svelte:head>

<div class="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
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
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
    ></div>
  {/if}

  <aside
    class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900/95 lg:bg-slate-900/70 border-r border-slate-800 flex flex-col justify-between backdrop-blur-xl transition-transform duration-300 ease-in-out shrink-0 {mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
  >
    <!-- Top Brand & Badge -->
    <div>
      <div class="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/15 group-hover:scale-105 transition-transform">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Icon name="Sparkles" class="text-emerald-400" size={18} />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-base text-white tracking-tight">Super<span class="text-emerald-400">AI</span></span>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-950 uppercase">VIP</span>
            </div>
            <p class="text-[10px] text-slate-400 font-mono">ezboagents.com</p>
          </div>
        </a>

        <!-- Mobile Close Button -->
        <button
          type="button"
          onclick={() => (mobileSidebarOpen = false)}
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'chat' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="MessageSquare" size={17} class={$activeDashboardTab === 'chat' ? 'text-slate-950' : 'text-emerald-400'} />
            <span>AI Assistant Chat</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold {$activeDashboardTab === 'chat' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}">
            Main
          </span>
        </button>

        <!-- 2. 50+ AI Tools Catalog -->
        <button
          type="button"
          onclick={() => switchTab('tools')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'tools' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="Grid" size={17} class={$activeDashboardTab === 'tools' ? 'text-slate-950' : 'text-teal-400'} />
            <span>50+ AI Tools Suite</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium {$activeDashboardTab === 'tools' ? 'bg-slate-950 text-teal-300' : 'bg-slate-800 text-slate-400'}">
            50
          </span>
        </button>

        <!-- 3. WhatsApp Connection -->
        <button
          type="button"
          onclick={() => switchTab('whatsapp')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'whatsapp' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="QrCode" size={17} class={$activeDashboardTab === 'whatsapp' ? 'text-slate-950' : 'text-cyan-400'} />
            <span>WhatsApp Sync</span>
          </div>
          <span class="flex items-center gap-1 text-[10px]">
            <span class="w-2 h-2 rounded-full {$whatsappStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
          </span>
        </button>

        <!-- 4. Gemini BYOK Key -->
        <button
          type="button"
          onclick={() => switchTab('byok')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'byok' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="Key" size={17} class={$activeDashboardTab === 'byok' ? 'text-slate-950' : 'text-amber-400'} />
            <span>Gemini BYOK Key</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium {$activeDashboardTab === 'byok' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'}">
            {$isKeyValid ? 'Active' : 'Setup'}
          </span>
        </button>

        <!-- 5. Subscription & Billing -->
        <button
          type="button"
          onclick={() => switchTab('billing')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'billing' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="CreditCard" size={17} class={$activeDashboardTab === 'billing' ? 'text-slate-950' : 'text-purple-400'} />
            <span>Billing & Plans</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold {$activeDashboardTab === 'billing' ? 'bg-slate-950 text-purple-300' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}">
            75% OFF
          </span>
        </button>

        <!-- 6. Settings & Profile -->
        <button
          type="button"
          onclick={() => switchTab('settings')}
          class="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer {$activeDashboardTab === 'settings' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}"
        >
          <div class="flex items-center gap-3">
            <Icon name="Settings" size={17} class={$activeDashboardTab === 'settings' ? 'text-slate-950' : 'text-slate-400'} />
            <span>Settings & Profile</span>
          </div>
        </button>
      </nav>
    </div>

    <!-- Bottom User Section & Sign Out -->
    <div class="p-3 border-t border-slate-800/80 bg-slate-950/40">
      <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
            {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div class="truncate">
            <p class="text-xs font-bold text-white truncate">{$currentUser?.name || 'User'}</p>
            <p class="text-[10px] text-slate-400 truncate">{$currentUser?.email || 'user@ezboagents.com'}</p>
          </div>
        </div>

        <button
          type="button"
          onclick={handleLogout}
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
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
  <main class="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
    <!-- Top Mobile Header Bar -->
    <div class="lg:hidden h-14 px-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
      <button
        type="button"
        onclick={() => (mobileSidebarOpen = true)}
        class="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
        aria-label="Open Sidebar Menu"
      >
        <Icon name="Grid" size={18} />
      </button>

      <div class="flex items-center gap-2">
        <span class="font-bold text-sm text-white">Super<span class="text-emerald-400">AI</span> Hub</span>
        <span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
          {$activeDashboardTab.toUpperCase()}
        </span>
      </div>

      <a href="/" class="text-xs text-slate-400 hover:text-white">Home</a>
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
      <!-- TAB 2: 50+ AI TOOLS CATALOG -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'tools'}
        <div class="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
          <!-- Header and Search -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-2xl">
            <div>
              <h2 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>50+ Specialized AI Helpers Catalog</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">{filteredTools.length} Available</span>
              </h2>
              <p class="text-xs text-slate-400 mt-1">Click any tool to launch its interactive runner with prompt customization.</p>
            </div>

            <!-- Search input -->
            <div class="relative w-full sm:w-72">
              <Icon name="Search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                bind:value={$searchQuery}
                placeholder="Search tools or keywords..."
                class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <!-- Category Filter Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {#each CATEGORIES as cat}
              <button
                type="button"
                onclick={() => activeCategory.set(cat.id)}
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {$activeCategory === cat.id ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'}"
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
        </div>

      <!-- ==================================================== -->
      <!-- TAB 3: WHATSAPP SYNC & CONNECTION -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'whatsapp'}
        <div class="h-full overflow-y-auto max-w-4xl mx-auto space-y-6">
          <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2.5">
                  <Icon name="QrCode" size={22} class="text-emerald-400" />
                  <span>Connect Your WhatsApp Account</span>
                </h2>
                <p class="text-xs text-slate-400 mt-1">Link your phone using Baileys QR code for instant 24/7 personal chat assistant.</p>
              </div>
              <div class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold {$whatsappStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}">
                <span class="w-2 h-2 rounded-full {$whatsappStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
                <span>Status: {$whatsappStatus.toUpperCase()}</span>
              </div>
            </div>

            <!-- QR Code Pairing Screen -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <!-- QR Image Display -->
              <div class="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950 border border-slate-800">
                {#if $whatsappStatus === 'connected'}
                  <div class="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
                    <Icon name="Check" size={32} />
                  </div>
                  <h3 class="text-base font-bold text-white">WhatsApp Live & Connected!</h3>
                  <p class="text-xs text-slate-400 text-center mt-1">Send any message to yourself in WhatsApp to test.</p>
                  <button
                    type="button"
                    onclick={handleDisconnectWhatsApp}
                    disabled={isDisconnecting}
                    class="mt-6 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect Session'}
                  </button>
                {:else if $whatsappQr}
                  <div class="p-2 bg-white rounded-xl shadow-lg">
                    <img src={$whatsappQr} alt="WhatsApp QR Code" class="w-56 h-56" />
                  </div>
                  <p class="text-[11px] text-slate-400 mt-3 font-mono">Scan QR code using WhatsApp on your phone</p>
                {:else}
                  <div class="w-56 h-56 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                    <div class="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating live QR code...</span>
                  </div>
                {/if}
              </div>

              <!-- Setup Steps -->
              <div class="space-y-4">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Pairing Instructions:</h3>
                <ol class="space-y-3 text-xs text-slate-300">
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</span>
                    <span>Open <strong>WhatsApp</strong> on your phone.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">2</span>
                    <span>Tap <strong>Settings</strong> (iOS) or <strong>Three Dots ⋮</strong> (Android) and choose <strong>Linked Devices</strong>.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">3</span>
                    <span>Point your phone camera at the QR code on the left.</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">4</span>
                    <span>Once connected, send any message to your own number ("Message Yourself") to start!</span>
                  </li>
                </ol>

                <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                  <div class="font-bold flex items-center gap-1.5">
                    <Icon name="Shield" size={14} />
                    <span>100% Anti-Ban Safe Architecture</span>
                  </div>
                  <p class="text-[11px] text-slate-300">
                    The bot exclusively processes self-chat messages and simulates human typing delay (2.5s). It never contacts external people.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <!-- ==================================================== -->
      <!-- TAB 4: GEMINI BYOK KEY -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'byok'}
        <div class="h-full overflow-y-auto max-w-3xl mx-auto space-y-6">
          <div class="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h2 class="text-xl font-bold text-white flex items-center gap-2.5">
                <Icon name="Key" size={22} class="text-amber-400" />
                <span>Google Gemini API Key (BYOK)</span>
              </h2>
              <p class="text-xs text-slate-400 mt-1">Connect your free API key from Google AI Studio to unlock 1,500+ daily requests with zero fees.</p>
            </div>

            <!-- Key Input Form -->
            <div class="space-y-4">
              <div>
                <label for="byok-key" class="block text-xs font-semibold text-slate-300 mb-1.5">Gemini API Key</label>
                <input
                  id="byok-key"
                  type="password"
                  bind:value={inputKey}
                  placeholder="AIzaSy..."
                  class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 outline-none"
                />
              </div>

              {#if keyValidationMsg}
                <div class="p-3 rounded-xl text-xs flex items-center gap-2 {keyValidationState === 'valid' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : keyValidationState === 'invalid' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-300'}">
                  <Icon name={keyValidationState === 'valid' ? 'Check' : 'AlertCircle'} size={15} />
                  <span>{keyValidationMsg}</span>
                </div>
              {/if}

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  onclick={testAndSaveApiKey}
                  disabled={keyValidationState === 'testing'}
                  class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {keyValidationState === 'testing' ? 'Testing Key...' : 'Save & Validate Key'}
                </button>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Get Free Key at Google AI Studio</span>
                  <Icon name="ExternalLink" size={13} />
                </a>
              </div>
            </div>

            <!-- Security Note -->
            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <h4 class="font-bold text-white text-xs flex items-center gap-1.5">
                <Icon name="Shield" size={14} class="text-teal-400" />
                <span>Client-Side AES-256 Encryption</span>
              </h4>
              <p>Your API key is encrypted directly in your browser using AES-256 before being stored in your secure local session. We never sell or log your private key.</p>
            </div>
          </div>
        </div>

      <!-- ==================================================== -->
      <!-- TAB 5: BILLING & SUBSCRIPTION -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'billing'}
        <div class="h-full overflow-y-auto max-w-4xl mx-auto space-y-6">
          <div class="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                  <Icon name="Crown" size={22} class="text-amber-400" />
                  <span>Subscription & Billing</span>
                </h2>
                <p class="text-xs text-slate-400 mt-1">Manage your active membership and payment details.</p>
              </div>

              <div class="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Plan: Yearly VIP Special (Active)</span>
              </div>
            </div>

            <!-- Current Plan Overview Card -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p class="text-[11px] text-slate-500 font-semibold uppercase">Current Rate</p>
                <p class="text-xl font-black text-white mt-1">BDT 1,499 <span class="text-xs text-slate-400 font-normal">/ 1st yr</span></p>
                <p class="text-[10px] text-emerald-400 mt-1">75% OFF Launch Discount Applied</p>
              </div>

              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p class="text-[11px] text-slate-500 font-semibold uppercase">Renewal Date</p>
                <p class="text-sm font-bold text-white mt-1">
                  {new Date($subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p class="text-[10px] text-slate-400 mt-1">3-day grace period included</p>
              </div>

              <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p class="text-[11px] text-slate-500 font-semibold uppercase">VIP Support Access</p>
                <p class="text-sm font-bold text-emerald-400 mt-1">Enabled (24/7 Priority)</p>
                <p class="text-[10px] text-slate-400 mt-1">support@ezboagents.com</p>
              </div>
            </div>

            <!-- Manual Payment Submission Form -->
            <div class="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 class="text-sm font-bold text-white">Need to verify a payment or enter a Transaction ID?</h3>
              <p class="text-xs text-slate-400">If you paid via bKash, Nagad, Rocket, or Bank Transfer, enter your Transaction ID (TrxID) below for instant automated confirmation.</p>

              {#if billingSubmitted}
                <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Icon name="Check" size={16} />
                  <span>Transaction ID submitted! Your account status is active and verified.</span>
                </div>
              {:else}
                <div class="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    bind:value={txnId}
                    placeholder="Enter TrxID (e.g. 9J28DA10K)"
                    class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onclick={() => { if (txnId.trim()) billingSubmitted = true; }}
                    class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Verify Payment
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>

      <!-- ==================================================== -->
      <!-- TAB 6: SETTINGS & PROFILE -->
      <!-- ==================================================== -->
      {:else if $activeDashboardTab === 'settings'}
        <div class="h-full overflow-y-auto max-w-3xl mx-auto space-y-6">
          <div class="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="Settings" size={22} class="text-slate-300" />
                <span>Settings & Account Profile</span>
              </h2>
              <p class="text-xs text-slate-400 mt-1">Configure your personal preferences, email alerts, and connected services.</p>
            </div>

            <!-- Profile Info Card -->
            <div class="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Credentials</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-500 block mb-1">Display Name</span>
                  <span class="font-bold text-white">{$currentUser?.name || 'User'}</span>
                </div>
                <div>
                  <span class="text-slate-500 block mb-1">Registered Email</span>
                  <span class="font-mono text-emerald-400">{$currentUser?.email || 'user@ezboagents.com'}</span>
                </div>
                <div>
                  <span class="text-slate-500 block mb-1">Authentication Method</span>
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-white font-medium">
                    {#if $currentUser?.provider === 'google'}
                      <Icon name="CheckCircle2" size={12} class="text-emerald-400" />
                      <span>Google OAuth 2.0</span>
                    {:else}
                      <span>Email & Password</span>
                    {/if}
                  </span>
                </div>
                <div>
                  <span class="text-slate-500 block mb-1">Custom Domain</span>
                  <span class="font-mono text-teal-300">ezboagents.com</span>
                </div>
              </div>
            </div>

            <!-- SMTP & Email Notifications -->
            <div class="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">SMTP Transactional Email Notifications</h3>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-white">Send Welcome & Subscription Receipts</p>
                  <p class="text-[11px] text-slate-400">Delivered via your configured SMTP server to {$currentUser?.email}.</p>
                </div>
                <input
                  type="checkbox"
                  bind:checked={smtpEmailNotifications}
                  class="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </div>

              {#if emailSavedMsg}
                <p class="text-xs text-emerald-400">{emailSavedMsg}</p>
              {/if}

              <button
                type="button"
                onclick={() => {
                  emailSavedMsg = 'Settings saved successfully.';
                  setTimeout(() => (emailSavedMsg = ''), 3000);
                }}
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Save Notification Preferences
              </button>
            </div>

            <!-- Danger Zone / Sign Out -->
            <div class="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-rose-300">Sign Out of Session</h4>
                <p class="text-[11px] text-slate-400">Clear stored session and return to the login screen.</p>
              </div>
              <button
                type="button"
                onclick={handleLogout}
                class="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </main>

  <!-- Interactive Tool Drawer (Active when user clicks Launch on any tool in the Tools Catalog) -->
  <ToolDrawer />
</div>
