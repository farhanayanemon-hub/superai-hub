<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { TOOLS, CATEGORIES, AI_CEO_PROFILE } from '$lib/config/tools';
  import { isAuthenticated, currentUser } from '$lib/stores/userStore';
  import { plansStore, loadPublicPlans } from '$lib/stores/plansStore';

  let openFaq = $state<number | null>(0);
  let billingInterval = $state<'monthly' | 'yearly'>('monthly');
  let selectedLandingCategory = $state<string>('all');

  const displayCategories = CATEGORIES.filter((c) => c.id !== 'all');

  const visibleCategories = $derived(
    selectedLandingCategory === 'all'
      ? displayCategories
      : displayCategories.filter((c) => c.id === selectedLandingCategory)
  );

  onMount(() => {
    loadPublicPlans();
  });

  const faqs = [
    {
      q: 'What is the Master AI CEO and how does it control all 75+ AI Helpers?',
      a: 'You do not have to open 75 separate chat windows if you do not want to! Simply tell the Master AI CEO what you need from the Web Console, WhatsApp, or Telegram — and the AI CEO automatically selects and commands the right helper (#01 to #75) for you. Or, if you prefer custom dropdowns and fields, you can open any helper’s dedicated Studio anytime.'
    },
    {
      q: 'Will I get newly added AI Helpers in the same subscription?',
      a: 'Yes! We regularly release new Business, Marketing, and Freelancer AI Helpers every month. All new AI Helpers are unlocked automatically inside your single active subscription at zero extra cost.'
    },
    {
      q: 'What is the difference between the 75 AI Helpers and Agents Store bots?',
      a: 'All 75+ AI Helpers and the Master AI CEO are included in your subscription and can be controlled from Web, WhatsApp, and Telegram. By contrast, bots in the "Agents Store" are standalone Autonomous Agents that run complex workflows exclusively inside the Web Dashboard (they are not controlled via WhatsApp or Telegram).'
    },
    {
      q: 'What is the BYOK (Bring Your Own Key) plan vs All-Inclusive Cloud?',
      a: 'The BYOK plan lets you connect your own API keys from Google Gemini (1,500 free daily requests!), OpenAI, Grok, DeepSeek, OpenRouter, and Replicate with zero token markups. The All-Inclusive Cloud plan requires ZERO API keys or setup — everything runs on our platform high-speed AI cluster immediately.'
    },
    {
      q: 'How do payments work and how fast is activation?',
      a: 'Payments via bKash, Nagad, Rocket, Visa, and Mastercard are processed instantly with immediate account activation and 3-day grace period protection.'
    }
  ];
</script>

<svelte:head>
  <title>EzboAgents — 1 Master AI CEO + 75+ Business & Freelancer AI Helpers</title>
  <meta
    name="description"
    content="1 Master AI CEO that controls 75+ specialized Business, Marketing & Freelancer AI Helpers across Web, WhatsApp, and Telegram. Regular new bots unlocked in 1 subscription."
  />
</svelte:head>

<div
  class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white"
>
  <Navbar />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION -->
    <!-- ======================================================== -->
    <section
      class="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-[#f8fafc]"
    >
      <!-- Ambient Animated Spotlights -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-b from-blue-400/15 via-indigo-400/10 to-transparent blur-[140px] pointer-events-none rounded-full animate-pulse"
      ></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Top Animated Pill: Regular New Bots in 1 Subscription -->
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 shadow-xs text-xs font-extrabold text-blue-700"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>
              👑 1 Master AI CEO + 75+ AI Helpers • New AI Bots Added Regularly in 1 Subscription!
            </span>
          </div>

          <!-- Main Title -->
          <h1
            class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12]"
          >
            1 Master <span class="blue-gradient-text font-serif italic">AI CEO</span> Controlling
            <br class="hidden sm:inline" />
            75+ Business & Freelancer Helpers.
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every helper features its own custom options and interactive Studio chat — or skip individual chats altogether and command the <strong>Master AI CEO</strong> directly from Web, <strong>WhatsApp</strong>, or <strong>Telegram</strong> to orchestrate all 75+ helpers for you.
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {#if $isAuthenticated}
              <a
                href={$currentUser?.isSubscribed ? '/dashboard' : '/plans'}
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm blue-btn text-white flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>
                  {$currentUser?.isSubscribed
                    ? 'Enter AI CEO Console'
                    : 'Select Your Plan & Unlock All 75+ Helpers'}
                </span>
                <Icon name="ArrowRight" size={16} />
              </a>
            {:else}
              <a
                href="/signup"
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm blue-btn text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Unlock AI CEO + 75+ Helpers</span>
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href="#helpers-catalog"
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200 text-slate-800 transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Explore All 75+ AI Helpers</span>
              </a>
            {/if}
          </div>

          <!-- Trust Badges -->
          <div class="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div
              class="p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <div class="flex items-center gap-2 text-blue-700 font-bold text-xs sm:text-sm">
                <Icon name="Crown" size={16} class="text-blue-600 shrink-0" />
                <span>1 Master AI CEO Orchestrator</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">
                Command and control all 75+ specialized helpers from a single chat
              </p>
            </div>

            <div
              class="p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <div class="flex items-center gap-2 text-blue-700 font-bold text-xs sm:text-sm">
                <Icon name="MessageSquare" size={16} class="text-blue-600 shrink-0" />
                <span>WhatsApp & Telegram Control</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">
                Instruct the AI CEO and all 75 helpers directly via WhatsApp & Telegram
              </p>
            </div>

            <div
              class="p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm">
                <Icon name="Sparkles" size={16} class="text-emerald-600 shrink-0" />
                <span>Regular New Bots in 1 Plan</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">
                New AI helpers added regularly — unlocked automatically in one subscription
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. MASTER AI CEO + 75+ TRANSPARENT ANIMATED HELPERS SHOWCASE -->
    <!-- ======================================================== -->
    <section
      id="helpers-catalog"
      class="py-20 relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-blue-50/25 to-[#f8fafc] border-t border-slate-200/80"
    >
      <!-- Ambient Floating Gradient Orbs -->
      <div
        class="pointer-events-none absolute top-32 -left-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl animate-pulse"
      ></div>
      <div
        class="pointer-events-none absolute bottom-32 -right-24 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl animate-pulse"
      ></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <!-- Section Title & Regular New Bots Promise Banner -->
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <div
            class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider"
          >
            <Icon name="Sparkles" size={13} />
            <span>75+ Specialized AI Helpers • Organized by Category</span>
          </div>
          <h2 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Meet Your <span class="blue-gradient-text">AI CEO</span> & 75+ AI Helpers
          </h2>
          <p class="text-sm sm:text-base text-slate-600">
            All 75+ helpers below are unlocked inside <strong>1 single subscription</strong>, with new bots added regularly at zero extra cost.
          </p>
        </div>

        <!-- Master AI CEO Hero Card (Transparent Animated Glassmorphic) -->
        <div
          class="relative rounded-3xl bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-slate-900/95 backdrop-blur-2xl border border-blue-400/40 p-6 sm:p-8 text-white shadow-2xl shadow-blue-500/15 overflow-hidden group"
        >
          <div
            class="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700"
          ></div>

          <div
            class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div class="flex items-start sm:items-center gap-4">
              <div
                class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-300/40 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform"
              >
                <Icon name="Crown" size={30} />
              </div>
              <div class="space-y-1.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="px-2.5 py-0.5 rounded-md bg-cyan-400/20 border border-cyan-300/40 text-cyan-300 font-mono text-xs font-extrabold"
                  >
                    MASTER #CEO
                  </span>
                  <h3 class="text-xl sm:text-2xl font-black text-white">
                    {AI_CEO_PROFILE.name}
                  </h3>
                  <span
                    class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase"
                  >
                    Web + WhatsApp + Telegram
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Don’t want to open individual helper chats? Simply instruct the main <strong>AI CEO</strong> — it automatically delegates to and controls all 75+ helpers across Web, WhatsApp, and Telegram.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <a
                href={$isAuthenticated ? '/dashboard' : '/signup'}
                class="px-5 py-3 rounded-xl blue-btn text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Command AI CEO</span>
                <Icon name="ArrowRight" size={14} />
              </a>
            </div>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex items-center justify-center gap-2 flex-wrap">
          {#each CATEGORIES as cat}
            <button
              type="button"
              onclick={() => (selectedLandingCategory = cat.id)}
              class="px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer {selectedLandingCategory ===
              cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'bg-white/75 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:border-blue-400 hover:text-blue-600'}"
            >
              {cat.name} ({cat.count})
            </button>
          {/each}
        </div>

        <!-- Category-Wise Sections of Transparent Animated Helper Cards -->
        <div class="space-y-12">
          {#each visibleCategories as category (category.id)}
            {@const catHelpers = TOOLS.filter((t) => t.category === category.id)}
            <div class="space-y-4">
              <!-- Category Section Header -->
              <div
                class="flex items-center justify-between border-b border-slate-200/80 pb-3 flex-wrap gap-2"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-200/80 flex items-center justify-center text-blue-600"
                  >
                    <Icon name={category.icon || 'Sparkles'} size={18} />
                  </div>
                  <div>
                    <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <span
                  class="px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-xs font-bold text-blue-700"
                >
                  {catHelpers.length} AI Helpers
                </span>
              </div>

              <!-- Compact Transparent Animated Cards Grid -->
              <div
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5"
              >
                {#each catHelpers as helper (helper.id)}
                  <a
                    href={$isAuthenticated ? '/dashboard' : '/signup'}
                    class="group relative rounded-2xl bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-slate-200/80 hover:border-blue-500/70 p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden"
                  >
                    <!-- Subtle Animated Glow -->
                    <div
                      class="pointer-events-none absolute -top-8 -right-8 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-400/15 blur-xl group-hover:scale-150 transition-transform duration-500"
                    ></div>

                    <div class="relative z-10 space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                          <div
                            class="w-8 h-8 rounded-lg bg-blue-50/90 border border-blue-200/70 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"
                          >
                            <Icon name={helper.icon || 'Sparkles'} size={15} />
                          </div>
                          <span
                            class="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-extrabold"
                          >
                            {helper.code}
                          </span>
                        </div>
                        <span
                          class="px-2 py-0.5 rounded-full bg-blue-50/80 border border-blue-200/70 text-[9px] font-bold text-blue-700 uppercase"
                        >
                          {helper.badge}
                        </span>
                      </div>

                      <h4
                        class="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {helper.name}
                      </h4>

                      <p class="text-[11px] text-slate-500 line-clamp-1">
                        {helper.shortDesc}
                      </p>
                    </div>
                  </a>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Bottom Banner: Regular New Bots Added in 1 Subscription -->
        <div
          class="rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-blue-500/40 p-6 sm:p-8 text-center space-y-3 shadow-lg shadow-blue-500/5"
        >
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Continuous Expansion Guarantee</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">
            New AI Bots & Helpers Added Regularly — All Included in 1 Subscription!
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            We continuously build and release new specialized AI Helpers for business growth, marketing, and freelancing. Every new helper is unlocked automatically in your existing plan at zero extra cost.
          </p>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. WHATSAPP & TELEGRAM ENGINE ARCHITECTURE -->
    <!-- ======================================================== -->
    <section id="features" class="py-24 bg-white border-t border-slate-200 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Control Your AI CEO & 75+ Helpers via WhatsApp & Telegram
          </h2>
          <p class="text-sm sm:text-base text-slate-600">
            Alongside the Web Console, you can command the Master AI CEO and all 75 AI Helpers directly from your personal WhatsApp and Telegram.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div
              class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-lg"
            >
              01
            </div>
            <h3 class="text-lg font-bold text-slate-900">Link WhatsApp or Telegram</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connect your WhatsApp QR or Telegram account in under 10 seconds from the Channels tab in your dashboard.
            </p>
          </div>

          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div
              class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-lg"
            >
              02
            </div>
            <h3 class="text-lg font-bold text-slate-900">Instruct AI CEO or #01–#75</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Describe any task in plain language and the Master AI CEO will automatically route it to the right helper, or type <code
                class="text-blue-600 font-mono font-bold">#01</code
              > through <code class="text-blue-600 font-mono font-bold">#75</code> to target a specific helper.
            </p>
          </div>

          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div
              class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-lg"
            >
              03
            </div>
            <h3 class="text-lg font-bold text-slate-900">Instant Executive Output</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Receive ready-to-use ad copies, proposals, humanized articles, graphics, and strategies directly in your chat within seconds.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. PRICING - 2 TIERS: BYOK vs ALL-INCLUSIVE MANAGED -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-24 relative bg-[#f8fafc] border-y border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            One Subscription. All 75+ Helpers + Future Bots Included.
          </h2>
          <p class="text-sm sm:text-base text-slate-600">
            Bring your own API keys (BYOK) or choose our 100% Managed Cloud — both plans unlock the Master AI CEO and all 75+ AI Helpers.
          </p>

          <!-- Monthly / Yearly Toggle -->
          <div class="flex items-center justify-center gap-3 pt-2">
            <span
              class="text-sm font-semibold {billingInterval === 'monthly'
                ? 'text-slate-900'
                : 'text-slate-500'}">Monthly</span
            >
            <button
              onclick={() =>
                (billingInterval = billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              aria-label="Toggle billing interval between monthly and yearly"
              class="relative w-14 h-7 rounded-full transition-all duration-300 {billingInterval ===
              'yearly'
                ? 'bg-blue-600'
                : 'bg-slate-300'} cursor-pointer"
            >
              <span
                class="absolute top-1 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-xs {billingInterval ===
                'yearly'
                  ? 'left-8'
                  : 'left-1'}"
              ></span>
            </button>
            <span
              class="text-sm font-semibold {billingInterval === 'yearly'
                ? 'text-blue-700 font-bold'
                : 'text-slate-500'}">Yearly</span
            >
            {#if billingInterval === 'yearly'}
              <span
                class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold"
                >Save 20% • 2 months FREE</span
              >
            {/if}
          </div>
        </div>

        <!-- 2-Tier Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- PLAN 1: BYOK MULTI-ENGINE -->
          <div
            class="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col justify-between hover:border-blue-300 transition-all duration-300 shadow-sm"
          >
            <div>
              <div class="mb-5">
                <span
                  class="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200"
                  >{$plansStore.byok.badge}</span
                >
                <h3 class="text-2xl font-extrabold text-slate-900 mt-3">
                  {$plansStore.byok.name}
                </h3>
                <div class="flex items-baseline gap-1 mt-2">
                  <span class="text-3xl font-extrabold text-slate-900"
                    >BDT {billingInterval === 'yearly'
                      ? $plansStore.byok.yearlyMonthlyPrice
                      : $plansStore.byok.monthlyPrice}</span
                  >
                  <span class="text-sm font-medium text-slate-500">/mo</span>
                </div>
                {#if billingInterval === 'yearly'}
                  <p class="text-xs text-slate-500 mt-1">
                    Billed annually (BDT {$plansStore.byok.yearlyTotal.toLocaleString()}/yr)
                  </p>
                {/if}
              </div>
              <p class="text-xs text-slate-600 mb-6 leading-relaxed">
                {$plansStore.byok.description}
              </p>
              <ul class="space-y-3 text-xs text-slate-700">
                {#each $plansStore.byok.features as feature}
                  <li class="flex items-center gap-2">
                    <Icon name="Check" size={14} class="text-blue-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>
            <a
              href={$isAuthenticated ? '/plans?plan=byok' : '/signup?plan=byok'}
              class="mt-8 w-full py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-all block cursor-pointer"
            >
              Start with BYOK
            </a>
          </div>

          <!-- PLAN 2: ALL-INCLUSIVE MANAGED (Featured) -->
          <div
            class="rounded-3xl bg-white border-2 border-blue-600 p-8 flex flex-col justify-between relative shadow-xl shadow-blue-500/10 scale-[1.02]"
          >
            {#if $plansStore.managed.highlightBadge}
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap"
              >
                {$plansStore.managed.highlightBadge}
              </div>
            {/if}
            <div>
              <div class="mb-5">
                <span
                  class="px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200"
                  >{$plansStore.managed.badge}</span
                >
                <h3 class="text-2xl font-extrabold text-slate-900 mt-3">
                  {$plansStore.managed.name}
                </h3>
                <div class="flex items-baseline gap-1 mt-2">
                  <span class="text-3xl font-extrabold text-slate-900"
                    >BDT {billingInterval === 'yearly'
                      ? $plansStore.managed.yearlyMonthlyPrice
                      : $plansStore.managed.monthlyPrice}</span
                  >
                  <span class="text-sm font-medium text-slate-500">/mo</span>
                </div>
                {#if billingInterval === 'yearly'}
                  <p class="text-xs text-slate-500 mt-1">
                    Billed annually (BDT {$plansStore.managed.yearlyTotal.toLocaleString()}/yr)
                  </p>
                {/if}
              </div>
              <p class="text-xs text-slate-600 mb-6 leading-relaxed">
                {$plansStore.managed.description}
              </p>
              <ul class="space-y-3 text-xs text-slate-700">
                {#each $plansStore.managed.features as feature}
                  <li class="flex items-center gap-2">
                    <Icon name="Check" size={14} class="text-blue-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>
            <a
              href={$isAuthenticated ? '/plans?plan=managed' : '/signup?plan=managed'}
              class="mt-8 w-full py-4 rounded-xl blue-btn text-white font-bold text-xs text-center transition-all block shadow-md cursor-pointer"
            >
              Start All-Inclusive
            </a>
          </div>
        </div>

        <!-- Payment methods -->
        <div class="mt-12 text-center text-xs text-slate-500 space-y-2">
          <p>Instant Activation • 100% Secure Checkout • 3-Day Grace Period</p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            {#each ['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard'] as method}
              <span
                class="px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 shadow-2xs"
                >{method}</span
              >
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 5. FAQ SECTION -->
    <!-- ======================================================== -->
    <section id="faq" class="py-24 bg-white relative">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 space-y-3">
          <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p class="text-xs sm:text-sm text-slate-600">
            Everything you need to know about the Master AI CEO, 75+ AI Helpers, and WhatsApp/Telegram control.
          </p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, i}
            <div
              class="rounded-2xl bg-[#f8fafc] border border-slate-200 hover:border-blue-300 overflow-hidden transition-all shadow-xs"
            >
              <button
                onclick={() => (openFaq = openFaq === i ? null : i)}
                class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <Icon
                  name="ChevronRight"
                  size={16}
                  class="text-blue-600 shrink-0 transform transition-transform {openFaq === i
                    ? 'rotate-90'
                    : ''}"
                />
              </button>
              {#if openFaq === i}
                <div
                  class="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                >
                  {faq.a}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>
