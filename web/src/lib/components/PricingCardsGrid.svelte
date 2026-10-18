<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { plansStore } from '$lib/stores/plansStore';
  import { subscription, isAuthenticated, type PlanTier } from '$lib/stores/userStore';
  import type { PlanTierId, PlanConfig } from '$lib/config/plans';
  import { ALL_TOOLS } from '$lib/config/tools';

  let {
    context = 'landing',
    selectedInterval = $bindable<'monthly' | 'yearly'>('monthly'),
    onSelectPlan,
    isProcessing = false,
    activeTierProcessing = null
  } = $props<{
    context?: 'landing' | 'plans' | 'billing';
    selectedInterval?: 'monthly' | 'yearly';
    onSelectPlan?: (tier: PlanTierId, interval: 'monthly' | 'yearly') => void;
    isProcessing?: boolean;
    activeTierProcessing?: string | null;
  }>();

  // Ordered list of 2 plans to render: Starter and Pro
  const planOrder: PlanTierId[] = ['byok_starter', 'byok_pro'];

  function getHelperCountBadge(plan: PlanConfig): string {
    const toggles = plan?.featureToggles;
    if (!toggles || toggles.allHelpersEnabled !== false) {
      return `All ${ALL_TOOLS.length}+ AI Helpers Included`;
    }
    const count = toggles.enabledHelpers?.length || 0;
    return `${count} of ${ALL_TOOLS.length} AI Helpers Included`;
  }

  function isUserCurrentPlan(planId: PlanTierId): boolean {
    if (!$subscription || $subscription.status !== 'active') return false;
    const tier = $subscription.tier;
    if (planId === 'byok_starter' && (tier === 'byok_starter' || tier === 'byok')) return true;
    if (planId === 'byok_pro' && tier === 'byok_pro') return true;
    if (planId === 'managed' && (tier === 'managed' || tier === 'complete')) return true;
    return false;
  }
</script>

<div class="w-full space-y-8">
  <!-- Monthly / Yearly Billing Toggle Switch -->
  <div class="flex flex-col items-center justify-center gap-2">
    <div class="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#CFE2FA] shadow-xs">
      <button
        type="button"
        onclick={() => (selectedInterval = 'monthly')}
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedInterval === 'monthly' ? 'bg-[#102A56] text-white shadow-xs' : 'text-[#5E7694] hover:text-[#102A56]'}"
      >
        Monthly Billing
      </button>

      <button
        type="button"
        onclick={() => (selectedInterval = 'yearly')}
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 {selectedInterval === 'yearly' ? 'bg-[#1677FF] text-white shadow-xs' : 'text-[#5E7694] hover:text-[#102A56]'}"
      >
        <span>Yearly Billing</span>
        <span class="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-500 text-white shadow-2xs">
          20% OFF
        </span>
      </button>
    </div>
    {#if selectedInterval === 'yearly'}
      <p class="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in duration-200">
        <Icon name="Check" size={13} />
        <span>Get 2 full months FREE when billed annually!</span>
      </p>
    {/if}
  </div>

  <!-- 2-Tier Dynamic Pricing Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-4xl mx-auto">
    {#each planOrder as planId (planId)}
      {@const plan = $plansStore[planId] || $plansStore.byok_starter}
      {@const isCurrent = isUserCurrentPlan(planId)}
      {@const isPro = planId === 'byok_pro'}
      {@const isManaged = planId === 'managed'}

      <div
        class="rounded-3xl transition-all duration-300 flex flex-col justify-between relative {isManaged
          ? 'ui-banner-navy text-white shadow-2xl md:-translate-y-2 border-2 border-[#38CFFF]/40'
          : isPro
            ? 'bg-white text-[#102A56] border-2 border-[#1677FF] shadow-xl shadow-[#1677FF]/10 md:-translate-y-1'
            : 'bg-white text-[#102A56] border border-[#CFE2FA] shadow-sm hover:border-[#1677FF]/40'}"
      >
        <!-- Promotional Top Ribbon -->
        {#if plan.highlightBadge}
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
            <span
              class="px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-md flex items-center gap-1 whitespace-nowrap {isManaged
                ? 'bg-linear-to-r from-[#38CFFF] to-[#1677FF] text-[#102A56]'
                : isPro
                  ? 'bg-[#1677FF] text-white shadow-[#1677FF]/30'
                  : 'bg-[#102A56] text-white'}"
            >
              <Icon name="Zap" size={12} class="shrink-0" />
              <span>{plan.highlightBadge}</span>
            </span>
          </div>
        {/if}

        <div class="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
          <div class="space-y-4">
            <!-- Header & Badge -->
            <div class="flex items-center justify-between gap-2 pt-1">
              <span
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {isManaged
                  ? 'bg-white/15 text-[#38CFFF] border border-[#38CFFF]/30'
                  : isPro
                    ? 'bg-[#1677FF]/10 text-[#1677FF] border border-[#1677FF]/30'
                    : 'bg-[#F3F8FF] text-[#5E7694] border border-[#CFE2FA]'}"
              >
                {plan.badge}
              </span>

              {#if isCurrent}
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-white shadow-2xs flex items-center gap-1">
                  <Icon name="Check" size={11} />
                  <span>Your Plan</span>
                </span>
              {/if}
            </div>

            <!-- Plan Title -->
            <div>
              <h3 class="text-xl sm:text-2xl font-black tracking-tight {isManaged ? 'text-white' : 'text-[#102A56]'}">
                {plan.name}
              </h3>
              <p class="text-xs mt-1.5 leading-relaxed {isManaged ? 'text-white/80' : 'text-[#5E7694]'}">
                {plan.description}
              </p>
            </div>

            <!-- Rate Display (BDT) -->
            <div class="pt-2 pb-1 border-y {isManaged ? 'border-white/15' : 'border-[#F1F5F9]'}">
              <div class="flex items-baseline gap-1.5">
                <span class="text-3xl sm:text-4xl font-black tracking-tight {isManaged ? 'text-white' : 'text-[#102A56]'}">
                  BDT {selectedInterval === 'yearly' ? plan.yearlyMonthlyPrice?.toLocaleString() : plan.monthlyPrice?.toLocaleString()}
                </span>
                <span class="text-xs font-semibold {isManaged ? 'text-white/70' : 'text-[#5E7694]'}">
                  / month
                </span>
              </div>
              <p class="text-[11px] mt-1 {isManaged ? 'text-[#38CFFF]' : isPro ? 'text-[#1677FF]' : 'text-[#5E7694]'}">
                {selectedInterval === 'yearly'
                  ? `Billed annually (BDT ${plan.yearlyTotal?.toLocaleString()}/yr)`
                  : 'Billed monthly (cancel anytime)'}
              </p>
            </div>

            <!-- Dynamic Helper Count Pill -->
            <div class="p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold {isManaged ? 'bg-white/10 text-[#38CFFF]' : isPro ? 'bg-[#1677FF]/8 text-[#1677FF]' : 'bg-[#F8FAFC] text-[#102A56]'}">
              <Icon name="Bot" size={16} class="shrink-0" />
              <span>{getHelperCountBadge(plan)}</span>
            </div>

            <!-- Features Bullet Points -->
            <div class="space-y-2.5 pt-1">
              <p class="text-[10px] font-extrabold uppercase tracking-wider {isManaged ? 'text-white/60' : 'text-[#889DB5]'}">
                Features & Capabilities:
              </p>
              <ul class="space-y-2">
                {#each plan.features as feat}
                  <li class="flex items-start gap-2.5 text-xs leading-snug">
                    <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 {isManaged ? 'bg-[#38CFFF]/20 text-[#38CFFF]' : isPro ? 'bg-[#1677FF]/10 text-[#1677FF]' : 'bg-emerald-50 text-emerald-600'}">
                      <Icon name="Check" size={12} />
                    </div>
                    <span class={isManaged ? 'text-white/90' : 'text-[#243B53]'}>{feat}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>

          <!-- Action CTA Button -->
          <div class="pt-6">
            {#if context === 'billing' && isCurrent}
              <div class="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-600 dark:text-emerald-300 font-extrabold text-xs text-center flex items-center justify-center gap-1.5 shadow-2xs">
                <Icon name="CheckCircle2" size={16} />
                <span>Current Active Plan</span>
              </div>
            {:else if context === 'plans' || context === 'billing'}
              <button
                type="button"
                onclick={() => onSelectPlan?.(planId, selectedInterval)}
                disabled={isProcessing}
                class="w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed {isManaged
                  ? 'bg-gradient-to-r from-[#38CFFF] to-[#1677FF] hover:opacity-95 text-[#102A56] font-black'
                  : isPro
                    ? 'blue-btn text-white'
                    : 'bg-[#102A56] hover:bg-[#1A3660] text-white'}"
              >
                {#if isProcessing && activeTierProcessing === planId}
                  <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>Connecting to OPayBD...</span>
                {:else}
                  <span>{context === 'billing' ? `Switch to ${plan.name}` : `Activate ${plan.name}`}</span>
                  <Icon name="ArrowRight" size={14} />
                {/if}
              </button>
            {:else}
              <!-- Landing Page Context: Smart Sign In / Sign Up Link -->
              <a
                href={$isAuthenticated ? `/plans?plan=${planId}` : `/signup?plan=${planId}`}
                class="w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-center active:scale-98 {isManaged
                  ? 'bg-gradient-to-r from-[#38CFFF] to-[#1677FF] hover:opacity-95 text-[#102A56] font-black'
                  : isPro
                    ? 'blue-btn text-white'
                    : 'bg-[#102A56] hover:bg-[#1A3660] text-white'}"
              >
                <span>Choose {plan.name}</span>
                <Icon name="ArrowRight" size={14} />
              </a>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
