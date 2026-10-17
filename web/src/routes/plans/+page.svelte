<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import PaymentMethods from '$lib/components/PaymentMethods.svelte';
  import PricingCardsGrid from '$lib/components/PricingCardsGrid.svelte';
  import {
    currentUser,
    isAuthenticated,
    subscription,
    logout,
    syncUserAccessWithServer,
    type PlanTier,
    type BillingInterval
  } from '$lib/stores/userStore';
  import { initiateSubscriptionPayment } from '$lib/services/opay';
  import { plansStore, loadPublicPlans } from '$lib/stores/plansStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  let billingInterval = $state<'monthly' | 'yearly'>('monthly');
  let isProcessing = $state(false);
  let activeTierProcessing = $state<PlanTier | null>(null);
  let paymentError = $state('');
  let paymentNotice = $state('');

  let scrollY = $state(0);
  let scrollProgress = $state(0);
  let showScrollTop = $derived(scrollY > 280);

  function handleScroll() {
    if (typeof window === 'undefined') return;
    const docEl = document.documentElement;
    const totalHeight = docEl.scrollHeight - docEl.clientHeight;
    scrollY = window.scrollY || docEl.scrollTop;
    scrollProgress = totalHeight > 0 ? Math.min(100, Math.max(0, (scrollY / totalHeight) * 100)) : 0;
  }

  function scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onMount(() => {
    loadPublicPlans();
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    (async () => {
      if ($isAuthenticated && $currentUser) {
        await syncUserAccessWithServer();
      }

      // If the user is already authenticated and subscribed, redirect to dashboard
      if ($isAuthenticated && $currentUser?.isSubscribed && $subscription.status === 'active') {
        goto('/dashboard');
      }
    })();

    // Check query params if a plan was pre-selected
    const planParam = page.url.searchParams.get('plan');
    if (planParam === 'managed') {
      // Keep state ready
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  async function handleSubscribe(tier: PlanTier) {
    if (!$isAuthenticated || !$currentUser) {
      goto(`/signup?plan=${tier}`);
      return;
    }

    isProcessing = true;
    activeTierProcessing = tier;
    paymentError = '';
    paymentNotice = 'Connecting to OPayBD gateway...';

    try {
      const res = await initiateSubscriptionPayment(tier, billingInterval, $currentUser);
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      paymentNotice = '';
      paymentError = res.error || 'Payment gateway could not initialize. Please verify your OPay credentials in the Admin Panel (/admin).';
    } catch (e: any) {
      paymentNotice = '';
      paymentError = e.message || 'Payment request failed to connect.';
    } finally {
      isProcessing = false;
      activeTierProcessing = null;
    }
  }

  function handleLogout() {
    logout();
    goto('/login');
  }
</script>

<svelte:head>
  <title>Select Membership Plan • EzboAgents</title>
  <meta name="description" content="Select a subscription plan to activate your EzboAgents Workspace and unlock the Master AI CEO plus 75+ specialized AI Helpers." />
</svelte:head>

<div class="min-h-screen bg-[#F3F8FF] text-[#102A56] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#1677FF] selection:text-white">
  <!-- Top Navigation Header -->
  <header class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-10 border-b border-[#E3ECF7]/60">
    <a href="/" class="flex items-center gap-2.5 group">
      <img src="/logo.png" alt="EzboAgents" class="w-10 h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform" />
      <span class="font-extrabold text-lg text-[#102A56] tracking-tight">Ezbo<span class="text-[#1677FF]">Agents</span></span>
    </a>

    <!-- User Status & Actions -->
    <div class="flex items-center gap-3">
      {#if $isAuthenticated && $currentUser}
        <div class="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#E3ECF7] shadow-2xs">
          {#if $currentUser.avatar}
            <img src={$currentUser.avatar} alt={$currentUser.name} class="w-6 h-6 rounded-lg object-cover" />
          {:else}
            <div class="w-6 h-6 rounded-lg bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] flex items-center justify-center font-bold text-xs">
              {$currentUser.name.charAt(0)}
            </div>
          {/if}
          <div class="text-left">
            <p class="text-xs font-bold text-[#102A56] leading-tight">{$currentUser.name}</p>
            <p class="text-[10px] text-[#4B6382] leading-tight">{$currentUser.email}</p>
          </div>
          <span class="ml-1 px-2 py-0.5 rounded-full ui-badge-primary text-[10px]">
            Plan Required
          </span>
        </div>
        <button
          onclick={handleLogout}
          class="px-3 py-1.5 rounded-xl text-xs btn-secondary cursor-pointer"
        >
          Log Out
        </button>
      {:else}
        <a
          href="/login"
          class="px-4 py-2 rounded-xl text-xs btn-secondary"
        >
          Sign In
        </a>
      {/if}
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1 flex flex-col justify-center">
    <!-- Transparent Animated Active Membership Section (No Card Box) -->
    <div class="mb-10 text-center relative py-2">
      <!-- Ambient Backlight Glow -->
      <div class="absolute -top-8 left-1/2 -translate-x-1/2 w-80 sm:w-[480px] h-28 bg-[#38CFFF]/20 blur-3xl pointer-events-none rounded-full"></div>

      <!-- Animated Badge / Indicator -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#CFE2FA] text-[#1677FF] mb-3 backdrop-blur-md shadow-[0_2px_12px_rgba(22,119,255,0.08)]">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38CFFF] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[#1677FF]"></span>
        </span>
        <span class="text-[11px] font-bold uppercase tracking-wider">Access Verification Gate</span>
      </div>

      <!-- Animated Shimmer Title in Gorgeous Font -->
      <h2 class="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight animated-membership-title px-2 leading-tight">
        Active Membership Required
      </h2>

      <!-- Transparent High-Clarity Description -->
      <p class="text-xs sm:text-sm text-[#4B6382] max-w-xl mx-auto mt-2.5 px-3 leading-relaxed font-medium">
        To protect computing clusters and activate your personal neural channels, select a plan below. Your dashboard and <strong class="text-[#102A56] font-bold">75+ AI helpers</strong> will unlock immediately upon checkout confirmation.
      </p>
    </div>

    <!-- Header & Pitch -->
    <div class="text-center max-w-2xl mx-auto mb-10 space-y-3">
      <h1 class="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight animated-heading-title px-2 leading-tight max-w-md mx-auto">
        Activate Your<br class="sm:hidden" /> Executive Workspace
      </h1>
      <p class="text-xs sm:text-sm text-[#4B6382] leading-relaxed px-3">
        Choose how you want to deploy: bring your own API keys for zero token markups, or enjoy our fully managed high-speed cloud cluster.
      </p>

    </div>

    <!-- Error / Processing Status Alerts -->
    {#if paymentNotice}
      <div class="mb-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-[#1677FF]/30 text-[#102A56] flex items-center justify-center gap-2 text-xs font-semibold shadow-2xs">
        <Icon name="Loader2" size={16} class="animate-spin text-[#1677FF]" />
        <span>{paymentNotice}</span>
      </div>
    {/if}

    {#if paymentError}
      <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 text-xs font-medium">
        <Icon name="AlertCircle" size={16} class="shrink-0 mt-0.5 text-rose-600" />
        <span>{paymentError}</span>
      </div>
    {/if}

    <!-- 3-Tier Dynamic Pricing Grid -->
    <PricingCardsGrid
      context="plans"
      bind:selectedInterval={billingInterval}
      onSelectPlan={(tier) => handleSubscribe(tier)}
      isProcessing={isProcessing}
      activeTierProcessing={activeTierProcessing}
    />

    <!-- Security & Trust Footer -->
    <div class="mt-12 text-center text-xs text-[#4B6382] space-y-3">
      <div class="flex items-center justify-center gap-6 text-[11px] font-semibold text-[#4B6382] flex-wrap">
        <span class="flex items-center gap-1.5"><Icon name="ShieldCheck" size={14} class="text-emerald-600" /> Instant Activation</span>
        <span class="flex items-center gap-1.5"><Icon name="Lock" size={14} class="text-[#1677FF]" /> 256-bit SSL Secure Checkout</span>
        <span class="flex items-center gap-1.5"><Icon name="RefreshCw" size={14} class="text-[#5E7694]" /> Cancel Anytime</span>
      </div>

      <div class="pt-1">
        <PaymentMethods />
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="w-full py-4 text-center text-[11px] text-[#5E7694] border-t border-[#E3ECF7] bg-white/80 backdrop-blur-md">
    EzboAgents • Secure Payment via OPayBD Gateway
  </footer>

  <!-- Floating Scroll to Top & Progress Indicator -->
  <button
    type="button"
    onclick={scrollToTop}
    aria-label="Scroll to top of page (Currently at {Math.round(scrollProgress)}%)"
    class="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#CFE2FA] shadow-md hover:shadow-lg text-[#102A56] hover:text-[#1677FF] hover:border-[#1677FF]/60 flex items-center justify-center transition-all duration-300 group cursor-pointer {showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}"
  >
    <!-- Circular SVG Progress Ring around the button -->
    <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 44 44">
      <circle
        cx="22"
        cy="22"
        r="18"
        stroke="#E3ECF7"
        stroke-width="2.5"
        fill="transparent"
      />
      <circle
        cx="22"
        cy="22"
        r="18"
        stroke="#1677FF"
        stroke-width="2.5"
        stroke-linecap="round"
        fill="transparent"
        stroke-dasharray="113.097"
        stroke-dashoffset={113.097 - (113.097 * scrollProgress) / 100}
        class="transition-all duration-75 ease-out"
      />
    </svg>

    <!-- Upward Arrow Icon & Percentage Number -->
    <div class="relative flex flex-col items-center justify-center pointer-events-none -mt-0.5">
      <svg
        class="w-4 h-4 text-[#1677FF] group-hover:-translate-y-1 transition-transform duration-200 stroke-[2.75]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
      <span class="text-[8.5px] font-mono font-extrabold leading-none text-[#5E7694] group-hover:text-[#1677FF] transition-colors">
        {Math.round(scrollProgress)}%
      </span>
    </div>
  </button>
</div>

<style>
  @keyframes textShimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes badgePulse {
    0%, 100% {
      transform: translate(-50%, 0) scale(1);
      box-shadow: 0 0 14px rgba(22, 119, 255, 0.4);
    }
    50% {
      transform: translate(-50%, 0) scale(1.04);
      box-shadow: 0 0 24px rgba(56, 207, 255, 0.7);
    }
  }

  .animated-membership-title {
    background: linear-gradient(90deg, #102A56 0%, #1677FF 35%, #38CFFF 50%, #1677FF 65%, #102A56 100%);
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: textShimmer 4.5s ease-in-out infinite;
  }

  .animated-heading-title {
    background: linear-gradient(90deg, #102A56 0%, #1677FF 40%, #0E63E0 60%, #102A56 100%);
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: textShimmer 6s ease-in-out infinite;
  }
</style>
