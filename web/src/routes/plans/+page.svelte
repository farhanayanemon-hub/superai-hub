<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
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

  onMount(async () => {
    loadPublicPlans();

    if ($isAuthenticated && $currentUser) {
      await syncUserAccessWithServer();
    }

    // If the user is already authenticated and subscribed, redirect to dashboard
    if ($isAuthenticated && $currentUser?.isSubscribed && $subscription.status === 'active') {
      goto('/dashboard');
      return;
    }

    // Check query params if a plan was pre-selected
    const planParam = page.url.searchParams.get('plan');
    if (planParam === 'managed') {
      // Keep state ready
    }
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
  <meta name="description" content="Select a subscription plan to activate your EzboAgents Executive AI Workspace and unlock 50+ specialized agents." />
</svelte:head>

<div class="min-h-screen bg-[#F3F8FF] text-[#102A56] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#1677FF] selection:text-white">
  <!-- Top Navigation Header -->
  <header class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-10 border-b border-[#E3ECF7]/60">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1677FF] to-[#38CFFF] text-white flex items-center justify-center shadow-xs">
        <Icon name="Bot" size={20} />
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-base font-extrabold tracking-tight text-[#102A56]">EzboAgents</span>
          <span class="hidden min-[380px]:inline-flex ui-badge-primary px-2 py-0.5 text-[10px] rounded-md">CONSORTIUM</span>
        </div>
        <p class="text-[10px] text-[#5E7694]">EXECUTIVE AI WORKSPACE</p>
      </div>
    </div>

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
    <!-- Notice Banner for Unsubscribed Gate -->
    <div class="mb-8 p-4 rounded-2xl bg-white border border-[#CFE2FA] flex items-start sm:items-center gap-3 text-[#102A56] shadow-2xs">
      <div class="w-9 h-9 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shrink-0 mt-0.5 sm:mt-0">
        <Icon name="ShieldCheck" size={18} />
      </div>
      <div class="flex-1 text-xs sm:text-sm">
        <p class="font-bold text-[#102A56]">Active Membership Required</p>
        <p class="text-[#4B6382] text-xs mt-0.5">
          To protect computing clusters and activate your personal neural channels, select a plan below. Your dashboard and 50+ AI executives will unlock immediately upon checkout confirmation.
        </p>
      </div>
    </div>

    <!-- Header & Pitch -->
    <div class="text-center max-w-2xl mx-auto mb-10 space-y-3">
      <h1 class="text-2xl sm:text-4xl font-extrabold text-[#102A56] tracking-tight">
        Activate Your Executive Workspace
      </h1>
      <p class="text-xs sm:text-sm text-[#4B6382]">
        Choose how you want to deploy: bring your own API keys for zero token markups, or enjoy our fully managed high-speed cloud cluster.
      </p>

      <!-- Monthly / Yearly Toggle -->
      <div class="flex items-center justify-center gap-3 pt-4 flex-wrap text-center">
        <span class="text-xs sm:text-sm font-semibold {billingInterval === 'monthly' ? 'text-[#102A56]' : 'text-[#4B6382]'}">Monthly</span>
        <button
          onclick={() => billingInterval = billingInterval === 'monthly' ? 'yearly' : 'monthly'}
          aria-label="Toggle billing interval"
          class="relative w-14 h-8 rounded-full transition-all duration-300 {billingInterval === 'yearly' ? 'bg-[#1677FF]' : 'bg-[#CBD9EC]'} cursor-pointer"
        >
          <span class="absolute top-1.5 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-xs {billingInterval === 'yearly' ? 'left-8' : 'left-1'}"></span>
        </button>
        <span class="text-xs sm:text-sm font-semibold {billingInterval === 'yearly' ? 'text-[#1677FF] font-bold' : 'text-[#4B6382]'}">Yearly</span>
        {#if billingInterval === 'yearly'}
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            Save 20% • 2 months FREE
          </span>
        {/if}
      </div>
    </div>

    <!-- Error / Processing Status Alerts -->
    {#if paymentNotice}
      <div class="mb-6 p-4 rounded-xl bg-white border border-[#1677FF]/30 text-[#102A56] flex items-center justify-center gap-2 text-xs font-semibold shadow-2xs">
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

    <!-- 2 Plans Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
      <!-- PLAN 1: BYOK MULTI-ENGINE -->
      <div class="rounded-3xl bg-white border border-[#E3ECF7] p-6 sm:p-8 flex flex-col justify-between hover:border-[#1677FF]/50 transition-all duration-300 shadow-xs">
        <div>
          <div class="mb-5">
            <span class="px-3 py-1 rounded-full bg-[#F3F8FF] text-xs font-bold text-[#102A56] border border-[#E3ECF7]">
              {$plansStore.byok.badge}
            </span>
            <h2 class="text-xl sm:text-2xl font-extrabold text-[#102A56] mt-3">{$plansStore.byok.name}</h2>
            <div class="flex items-baseline gap-1 mt-2">
              <span class="text-3xl font-extrabold text-[#102A56]">
                BDT {billingInterval === 'yearly' ? $plansStore.byok.yearlyMonthlyPrice : $plansStore.byok.monthlyPrice}
              </span>
              <span class="text-sm font-medium text-[#4B6382]">/mo</span>
            </div>
            {#if billingInterval === 'yearly'}
              <p class="text-xs text-[#4B6382] mt-1">Billed annually (BDT {$plansStore.byok.yearlyTotal.toLocaleString()}/yr)</p>
            {/if}
          </div>

          <p class="text-xs text-[#4B6382] mb-6 leading-relaxed">
            {$plansStore.byok.description}
          </p>

          <ul class="space-y-3 text-xs text-[#102A56]">
            {#each $plansStore.byok.features as feature}
              <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-[#1677FF] shrink-0" /> <span>{feature}</span></li>
            {/each}
          </ul>
        </div>

        <button
          onclick={() => handleSubscribe('byok')}
          disabled={isProcessing}
          class="mt-8 w-full py-4 rounded-xl btn-navy text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {#if isProcessing && activeTierProcessing === 'byok'}
            <Icon name="Loader2" size={14} class="animate-spin" />
            <span>Connecting...</span>
          {:else}
            <Icon name="CreditCard" size={14} />
            <span>Subscribe with OPay</span>
          {/if}
        </button>
      </div>

      <!-- PLAN 2: ALL-INCLUSIVE MANAGED (Featured) -->
      <div class="rounded-3xl bg-white border-2 border-[#1677FF] p-6 sm:p-8 flex flex-col justify-between relative shadow-md md:scale-[1.01]">
        {#if $plansStore.managed.highlightBadge}
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#1677FF] text-white text-[11px] font-black uppercase tracking-wider shadow-xs whitespace-nowrap">
            {$plansStore.managed.highlightBadge}
          </div>
        {/if}

        <div>
          <div class="mb-5">
            <span class="ui-badge-primary px-3 py-1 rounded-full text-xs">
              {$plansStore.managed.badge}
            </span>
            <h2 class="text-xl sm:text-2xl font-extrabold text-[#102A56] mt-3">{$plansStore.managed.name}</h2>
            <div class="flex items-baseline gap-1 mt-2">
              <span class="text-3xl font-extrabold text-[#102A56]">
                BDT {billingInterval === 'yearly' ? $plansStore.managed.yearlyMonthlyPrice : $plansStore.managed.monthlyPrice}
              </span>
              <span class="text-sm font-medium text-[#4B6382]">/mo</span>
            </div>
            {#if billingInterval === 'yearly'}
              <p class="text-xs text-[#4B6382] mt-1">Billed annually (BDT {$plansStore.managed.yearlyTotal.toLocaleString()}/yr)</p>
            {/if}
          </div>

          <p class="text-xs text-[#4B6382] mb-6 leading-relaxed">
            {$plansStore.managed.description}
          </p>

          <ul class="space-y-3 text-xs text-[#102A56]">
            {#each $plansStore.managed.features as feature}
              <li class="flex items-center gap-2 font-semibold text-[#102A56]"><Icon name="Check" size={14} class="text-[#1677FF] shrink-0" /> <span>{feature}</span></li>
            {/each}
          </ul>
        </div>

        <button
          onclick={() => handleSubscribe('managed')}
          disabled={isProcessing}
          class="mt-8 w-full py-4 rounded-xl blue-btn text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {#if isProcessing && activeTierProcessing === 'managed'}
            <Icon name="Loader2" size={14} class="animate-spin" />
            <span>Connecting...</span>
          {:else}
            <Icon name="Zap" size={14} />
            <span>Subscribe All-Inclusive</span>
          {/if}
        </button>
      </div>
    </div>

    <!-- Security & Trust Footer -->
    <div class="mt-12 text-center text-xs text-[#4B6382] space-y-3">
      <div class="flex items-center justify-center gap-6 text-[11px] font-semibold text-[#4B6382] flex-wrap">
        <span class="flex items-center gap-1.5"><Icon name="ShieldCheck" size={14} class="text-emerald-600" /> Instant Activation</span>
        <span class="flex items-center gap-1.5"><Icon name="Lock" size={14} class="text-[#1677FF]" /> 256-bit SSL Secure Checkout</span>
        <span class="flex items-center gap-1.5"><Icon name="RefreshCw" size={14} class="text-[#5E7694]" /> Cancel Anytime</span>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        {#each ['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard'] as method}
          <span class="px-3 py-1 rounded-lg bg-white border border-[#E3ECF7] font-semibold text-[#102A56] shadow-2xs text-[11px]">
            {method}
          </span>
        {/each}
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="w-full py-4 text-center text-[11px] text-[#5E7694] border-t border-[#E3ECF7] bg-white">
    EzboAgents • Enterprise AI Consortium • Secure Payment via OPayBD Gateway
  </footer>
</div>
