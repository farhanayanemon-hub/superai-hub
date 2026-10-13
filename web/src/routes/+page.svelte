<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import RobotAvatar from '$lib/components/RobotAvatar.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import RobotShowcase from '$lib/components/robots/RobotShowcase.svelte';
  import { isAuthenticated, currentUser } from '$lib/stores/userStore';
  import { plansStore, loadPublicPlans } from '$lib/stores/plansStore';

  let openFaq = $state<number | null>(0);
  let billingInterval = $state<'monthly' | 'yearly'>('monthly');

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
  class="min-h-screen bg-[#F3F8FF] text-[#102A56] flex flex-col font-sans selection:bg-[#1677FF] selection:text-white"
>
  <Navbar />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION -->
    <!-- ======================================================== -->
    <section
      class="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-[#F3F8FF]/60 to-[#F3F8FF] border-b border-[#E3ECF7]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Top Animated Pill: Regular New Bots in 1 Subscription -->
          <div
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E3ECF7] shadow-2xs text-[11px] sm:text-xs font-extrabold text-[#1677FF] max-w-full text-center flex-wrap justify-center"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="break-words">
              👑 1 Master AI CEO + 75+ AI Helpers • New AI Bots Added Regularly in 1 Subscription!
            </span>
          </div>

          <!-- Main Title -->
          <h1
            class="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#102A56] leading-[1.15] sm:leading-[1.12] break-words"
          >
            1 Master <span class="blue-gradient-text font-serif italic">AI CEO</span> Controlling
            <br class="hidden sm:inline" />
            75+ Business & Freelancer Helpers.
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-[#4B6382] max-w-2xl mx-auto leading-relaxed">
            Every helper features its own custom options and interactive Studio chat — or skip individual chats altogether and command the <strong class="text-[#102A56]">Master AI CEO</strong> directly from Web, <strong class="text-[#102A56]">WhatsApp</strong>, or <strong class="text-[#102A56]">Telegram</strong> to orchestrate all 75+ helpers for you.
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {#if $isAuthenticated}
              <a
                href={$currentUser?.isSubscribed ? '/dashboard' : '/plans'}
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm blue-btn text-white flex items-center justify-center gap-2 cursor-pointer"
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
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm blue-btn text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Unlock AI CEO + 75+ Helpers</span>
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href="#helpers"
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm btn-secondary flex items-center justify-center gap-2"
              >
                <span>Explore All 75+ AI Helpers</span>
              </a>
            {/if}
          </div>

          <!-- Trust Badges -->
          <div class="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div
              class="p-4 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/40 transition-all flex items-start gap-3"
            >
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#071324] via-[#0E203B] to-[#040A14] border border-[#38CFFF]/40 flex items-center justify-center shrink-0 p-0.5 shadow-xs"
              >
                <RobotAvatar helperId="ceo" size="custom" class="w-full h-full" ariaHidden={true} />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 text-[#102A56] font-bold text-xs sm:text-sm">
                  <span>1 Master AI CEO Orchestrator</span>
                </div>
                <p class="text-[11px] text-[#4B6382] mt-0.5 leading-relaxed">
                  Command and control all 75+ specialized helpers from a single chat
                </p>
              </div>
            </div>

            <div
              class="p-4 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/40 transition-all"
            >
              <div class="flex items-center gap-2 text-[#102A56] font-bold text-xs sm:text-sm">
                <Icon name="MessageSquare" size={16} class="text-[#1677FF] shrink-0" />
                <span>WhatsApp & Telegram Control</span>
              </div>
              <p class="text-[11px] text-[#4B6382] mt-1 leading-relaxed">
                Instruct the AI CEO and all 75 helpers directly via WhatsApp & Telegram
              </p>
            </div>

            <div
              class="p-4 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/40 transition-all"
            >
              <div class="flex items-center gap-2 text-[#102A56] font-bold text-xs sm:text-sm">
                <Icon name="Sparkles" size={16} class="text-[#1677FF] shrink-0" />
                <span>Regular New Bots in 1 Plan</span>
              </div>
              <p class="text-[11px] text-[#4B6382] mt-1 leading-relaxed">
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
    <section id="helpers" class="scroll-mt-16 py-10 sm:py-16 relative overflow-hidden bg-[#F3F8FF]">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <RobotShowcase signupUrl="/signup" />
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. WHATSAPP & TELEGRAM ENGINE ARCHITECTURE -->
    <!-- ======================================================== -->
    <section id="features" class="py-16 sm:py-24 bg-white border-t border-[#E3ECF7] relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-[#102A56] tracking-tight">
            Control Your AI CEO & 75+ Helpers via WhatsApp & Telegram
          </h2>
          <p class="text-sm sm:text-base text-[#4B6382]">
            Alongside the Web Console, you can command the Master AI CEO and all 75 AI Helpers directly from your personal WhatsApp and Telegram.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div
              class="w-12 h-12 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] font-mono font-bold text-lg"
            >
              01
            </div>
            <h3 class="text-lg font-bold text-[#102A56]">Link WhatsApp or Telegram</h3>
            <p class="text-xs sm:text-sm text-[#4B6382] leading-relaxed">
              Connect your WhatsApp QR or Telegram account in under 10 seconds from the Channels tab in your dashboard.
            </p>
          </div>

          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div
              class="w-12 h-12 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] font-mono font-bold text-lg"
            >
              02
            </div>
            <h3 class="text-lg font-bold text-[#102A56]">Instruct AI CEO or #01–#75</h3>
            <p class="text-xs sm:text-sm text-[#4B6382] leading-relaxed">
              Describe any task in plain language and the Master AI CEO will automatically route it to the right helper, or type <code
                class="text-[#1677FF] font-mono font-bold">#01</code
              > through <code class="text-[#1677FF] font-mono font-bold">#75</code> to target a specific helper.
            </p>
          </div>

          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div
              class="w-12 h-12 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] font-mono font-bold text-lg"
            >
              03
            </div>
            <h3 class="text-lg font-bold text-[#102A56]">Instant Executive Output</h3>
            <p class="text-xs sm:text-sm text-[#4B6382] leading-relaxed">
              Receive ready-to-use ad copies, proposals, humanized articles, graphics, and strategies directly in your chat within seconds.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. PRICING - 2 TIERS: BYOK vs ALL-INCLUSIVE MANAGED -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-24 relative bg-[#F3F8FF] border-y border-[#E3ECF7]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-[#102A56] tracking-tight">
            One Subscription. All 75+ Helpers + Future Bots Included.
          </h2>
          <p class="text-sm sm:text-base text-[#4B6382]">
            Bring your own API keys (BYOK) or choose our 100% Managed Cloud — both plans unlock the Master AI CEO and all 75+ AI Helpers.
          </p>

          <!-- Monthly / Yearly Toggle -->
          <div class="flex items-center justify-center gap-3 pt-2 flex-wrap text-center">
            <span
              class="text-sm font-semibold {billingInterval === 'monthly'
                ? 'text-[#102A56]'
                : 'text-[#4B6382]'}">Monthly</span
            >
            <button
              onclick={() =>
                (billingInterval = billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              aria-label="Toggle billing interval between monthly and yearly"
              class="relative w-14 h-8 rounded-full transition-all duration-300 {billingInterval ===
              'yearly'
                ? 'bg-[#1677FF]'
                : 'bg-[#CBD9EC]'} cursor-pointer"
            >
              <span
                class="absolute top-1.5 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-xs {billingInterval ===
                'yearly'
                  ? 'left-8'
                  : 'left-1'}"
              ></span>
            </button>
            <span
              class="text-sm font-semibold {billingInterval === 'yearly'
                ? 'text-[#1677FF] font-bold'
                : 'text-[#4B6382]'}">Yearly</span
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <!-- PLAN 1: BYOK MULTI-ENGINE -->
          <div
            class="rounded-3xl bg-white border border-[#E3ECF7] p-6 sm:p-8 flex flex-col justify-between hover:border-[#1677FF]/40 transition-all duration-300 shadow-xs"
          >
            <div>
              <div class="mb-5">
                <span
                  class="px-3 py-1 rounded-full bg-[#F3F8FF] text-xs font-bold text-[#102A56] border border-[#E3ECF7]"
                  >{$plansStore.byok.badge}</span
                >
                <h3 class="text-2xl font-extrabold text-[#102A56] mt-3">
                  {$plansStore.byok.name}
                </h3>
                <div class="flex items-baseline gap-1 mt-2">
                  <span class="text-3xl font-extrabold text-[#102A56]"
                    >BDT {billingInterval === 'yearly'
                      ? $plansStore.byok.yearlyMonthlyPrice
                      : $plansStore.byok.monthlyPrice}</span
                  >
                  <span class="text-sm font-medium text-[#4B6382]">/mo</span>
                </div>
                {#if billingInterval === 'yearly'}
                  <p class="text-xs text-[#4B6382] mt-1">
                    Billed annually (BDT {$plansStore.byok.yearlyTotal.toLocaleString()}/yr)
                  </p>
                {/if}
              </div>
              <p class="text-xs text-[#4B6382] mb-6 leading-relaxed">
                {$plansStore.byok.description}
              </p>
              <ul class="space-y-3 text-xs text-[#102A56]">
                {#each $plansStore.byok.features as feature}
                  <li class="flex items-center gap-2">
                    <Icon name="Check" size={14} class="text-[#1677FF] shrink-0" />
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>
            <a
              href={$isAuthenticated ? '/plans?plan=byok' : '/signup?plan=byok'}
              class="mt-8 w-full py-4 rounded-xl btn-secondary font-bold text-xs text-center transition-all block cursor-pointer"
            >
              Start with BYOK
            </a>
          </div>

          <!-- PLAN 2: ALL-INCLUSIVE MANAGED (Featured) -->
          <div
            class="rounded-3xl bg-white border-2 border-[#1677FF] p-6 sm:p-8 flex flex-col justify-between relative shadow-md md:scale-[1.01]"
          >
            {#if $plansStore.managed.highlightBadge}
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#1677FF] text-white text-[11px] font-black uppercase tracking-wider shadow-xs whitespace-nowrap"
              >
                {$plansStore.managed.highlightBadge}
              </div>
            {/if}
            <div>
              <div class="mb-5">
                <span
                  class="ui-badge-primary px-3 py-1 rounded-full text-xs"
                  >{$plansStore.managed.badge}</span
                >
                <h3 class="text-2xl font-extrabold text-[#102A56] mt-3">
                  {$plansStore.managed.name}
                </h3>
                <div class="flex items-baseline gap-1 mt-2">
                  <span class="text-3xl font-extrabold text-[#102A56]"
                    >BDT {billingInterval === 'yearly'
                      ? $plansStore.managed.yearlyMonthlyPrice
                      : $plansStore.managed.monthlyPrice}</span
                  >
                  <span class="text-sm font-medium text-[#4B6382]">/mo</span>
                </div>
                {#if billingInterval === 'yearly'}
                  <p class="text-xs text-[#4B6382] mt-1">
                    Billed annually (BDT {$plansStore.managed.yearlyTotal.toLocaleString()}/yr)
                  </p>
                {/if}
              </div>
              <p class="text-xs text-[#4B6382] mb-6 leading-relaxed">
                {$plansStore.managed.description}
              </p>
              <ul class="space-y-3 text-xs text-[#102A56]">
                {#each $plansStore.managed.features as feature}
                  <li class="flex items-center gap-2 font-medium">
                    <Icon name="Check" size={14} class="text-[#1677FF] shrink-0" />
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>
            <a
              href={$isAuthenticated ? '/plans?plan=managed' : '/signup?plan=managed'}
              class="mt-8 w-full py-4 rounded-xl blue-btn text-white font-bold text-xs text-center transition-all block cursor-pointer"
            >
              Start All-Inclusive
            </a>
          </div>
        </div>

        <!-- Payment methods -->
        <div class="mt-12 text-center text-xs text-[#4B6382] space-y-2">
          <p>Instant Activation • 100% Secure Checkout • 3-Day Grace Period</p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            {#each ['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard'] as method}
              <span
                class="px-3 py-1 rounded-lg bg-white border border-[#E3ECF7] font-semibold text-[#102A56] shadow-2xs"
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
          <h2 class="text-2xl sm:text-4xl font-extrabold text-[#102A56]">
            Frequently Asked Questions
          </h2>
          <p class="text-xs sm:text-sm text-[#4B6382]">
            Everything you need to know about the Master AI CEO, 75+ AI Helpers, and WhatsApp/Telegram control.
          </p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, i}
            <div
              class="rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] hover:border-[#1677FF]/40 overflow-hidden transition-all"
            >
              <button
                onclick={() => (openFaq = openFaq === i ? null : i)}
                class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-[#102A56] hover:text-[#1677FF] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <Icon
                  name="ChevronRight"
                  size={16}
                  class="text-[#1677FF] shrink-0 transform transition-transform {openFaq === i
                    ? 'rotate-90'
                    : ''}"
                />
              </button>
              {#if openFaq === i}
                <div
                  class="px-6 pb-5 pt-2 text-xs sm:text-sm text-[#4B6382] leading-relaxed border-t border-[#E3ECF7] bg-white"
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
