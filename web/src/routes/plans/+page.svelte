<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import {
    currentUser,
    isAuthenticated,
    subscription,
    logout,
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

  onMount(() => {
    loadPublicPlans();

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

<div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
  <!-- Ambient background glow -->
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/10 blur-[140px] pointer-events-none rounded-full"></div>
  <div class="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full"></div>

  <!-- Top Navigation Header -->
  <header class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-10">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
        <Icon name="Bot" size={20} />
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-base font-extrabold tracking-tight text-slate-900">EzboAgents</span>
          <span class="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">CONSORTIUM</span>
        </div>
        <p class="text-[10px] text-slate-500">EXECUTIVE AI WORKSPACE</p>
      </div>
    </div>

    <!-- User Status & Actions -->
    <div class="flex items-center gap-3">
      {#if $isAuthenticated && $currentUser}
        <div class="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          {#if $currentUser.avatar}
            <img src={$currentUser.avatar} alt={$currentUser.name} class="w-6 h-6 rounded-lg object-cover" />
          {:else}
            <div class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {$currentUser.name.charAt(0)}
            </div>
          {/if}
          <div class="text-left">
            <p class="text-xs font-bold text-slate-800 leading-tight">{$currentUser.name}</p>
            <p class="text-[10px] text-slate-500 leading-tight">{$currentUser.email}</p>
          </div>
          <span class="ml-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
            Plan Required
          </span>
        </div>
        <button
          onclick={handleLogout}
          class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
        >
          Log Out
        </button>
      {:else}
        <a
          href="/login"
          class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          Sign In
        </a>
      {/if}
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1 flex flex-col justify-center">
    <!-- Notice Banner for Unsubscribed Gate -->
    <div class="mb-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start sm:items-center gap-3 text-amber-800 shadow-xs">
      <div class="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 sm:mt-0">
        <Icon name="ShieldCheck" size={18} />
      </div>
      <div class="flex-1 text-xs sm:text-sm">
        <p class="font-bold">Active Membership Required</p>
        <p class="text-amber-700 text-xs mt-0.5">
          To protect computing clusters and activate your personal neural channels, select a plan below. Your dashboard and 50+ AI executives will unlock immediately upon checkout confirmation.
        </p>
      </div>
    </div>

    <!-- Header & Pitch -->
    <div class="text-center max-w-2xl mx-auto mb-10 space-y-3">
      <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Activate Your Executive Workspace
      </h1>
      <p class="text-xs sm:text-sm text-slate-600">
        Choose how you want to deploy: bring your own API keys for zero token markups, or enjoy our fully managed high-speed cloud cluster.
      </p>

      <!-- Monthly / Yearly Toggle -->
      <div class="flex items-center justify-center gap-3 pt-4">
        <span class="text-xs sm:text-sm font-semibold {billingInterval === 'monthly' ? 'text-slate-900' : 'text-slate-500'}">Monthly</span>
        <button
          onclick={() => billingInterval = billingInterval === 'monthly' ? 'yearly' : 'monthly'}
          aria-label="Toggle billing interval"
          class="relative w-14 h-7 rounded-full transition-all duration-300 {billingInterval === 'yearly' ? 'bg-blue-600' : 'bg-slate-300'} cursor-pointer"
        >
          <span class="absolute top-1 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-xs {billingInterval === 'yearly' ? 'left-8' : 'left-1'}"></span>
        </button>
        <span class="text-xs sm:text-sm font-semibold {billingInterval === 'yearly' ? 'text-blue-700 font-bold' : 'text-slate-500'}">Yearly</span>
        {#if billingInterval === 'yearly'}
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            Save 20% • 2 months FREE
          </span>
        {/if}
      </div>
    </div>

    <!-- Error / Processing Status Alerts -->
    {#if paymentNotice}
      <div class="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
        <Icon name="Loader2" size={16} class="animate-spin text-blue-600" />
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
      <div class="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between hover:border-blue-400 transition-all duration-300 shadow-md shadow-slate-200/50">
        <div>
          <div class="mb-5">
            <span class="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
              {$plansStore.byok.badge}
            </span>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">{$plansStore.byok.name}</h2>
            <div class="flex items-baseline gap-1 mt-2">
              <span class="text-3xl font-extrabold text-slate-900">
                BDT {billingInterval === 'yearly' ? $plansStore.byok.yearlyMonthlyPrice : $plansStore.byok.monthlyPrice}
              </span>
              <span class="text-sm font-medium text-slate-500">/mo</span>
            </div>
            {#if billingInterval === 'yearly'}
              <p class="text-xs text-slate-500 mt-1">Billed annually (BDT {$plansStore.byok.yearlyTotal.toLocaleString()}/yr)</p>
            {/if}
          </div>

          <p class="text-xs text-slate-600 mb-6 leading-relaxed">
            {$plansStore.byok.description}
          </p>

          <ul class="space-y-3 text-xs text-slate-700">
            {#each $plansStore.byok.features as feature}
              <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> <span>{feature}</span></li>
            {/each}
          </ul>
        </div>

        <button
          onclick={() => handleSubscribe('byok')}
          disabled={isProcessing}
          class="mt-8 w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
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
      <div class="rounded-3xl bg-white border-2 border-blue-600 p-6 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-blue-500/10 scale-[1.01]">
        {#if $plansStore.managed.highlightBadge}
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
            {$plansStore.managed.highlightBadge}
          </div>
        {/if}

        <div>
          <div class="mb-5">
            <span class="px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200">
              {$plansStore.managed.badge}
            </span>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">{$plansStore.managed.name}</h2>
            <div class="flex items-baseline gap-1 mt-2">
              <span class="text-3xl font-extrabold text-slate-900">
                BDT {billingInterval === 'yearly' ? $plansStore.managed.yearlyMonthlyPrice : $plansStore.managed.monthlyPrice}
              </span>
              <span class="text-sm font-medium text-slate-500">/mo</span>
            </div>
            {#if billingInterval === 'yearly'}
              <p class="text-xs text-slate-500 mt-1">Billed annually (BDT {$plansStore.managed.yearlyTotal.toLocaleString()}/yr)</p>
            {/if}
          </div>

          <p class="text-xs text-slate-600 mb-6 leading-relaxed">
            {$plansStore.managed.description}
          </p>

          <ul class="space-y-3 text-xs text-slate-700">
            {#each $plansStore.managed.features as feature}
              <li class="flex items-center gap-2 font-semibold text-slate-900"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> <span>{feature}</span></li>
            {/each}
          </ul>
        </div>

        <button
          onclick={() => handleSubscribe('managed')}
          disabled={isProcessing}
          class="mt-8 w-full py-4 rounded-xl blue-btn text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
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
    <div class="mt-12 text-center text-xs text-slate-500 space-y-3">
      <div class="flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-600">
        <span class="flex items-center gap-1.5"><Icon name="ShieldCheck" size={14} class="text-emerald-600" /> Instant Activation</span>
        <span class="flex items-center gap-1.5"><Icon name="Lock" size={14} class="text-blue-600" /> 256-bit SSL Secure Checkout</span>
        <span class="flex items-center gap-1.5"><Icon name="RefreshCw" size={14} class="text-slate-500" /> Cancel Anytime</span>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        {#each ['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard'] as method}
          <span class="px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 shadow-2xs text-[11px]">
            {method}
          </span>
        {/each}
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="w-full py-4 text-center text-[11px] text-slate-400 border-t border-slate-200">
    EzboAgents • Enterprise AI Consortium • Secure Payment via OPayBD Gateway
  </footer>
</div>
