<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import PaymentMethods from '$lib/components/PaymentMethods.svelte';
  import PricingCardsGrid from '$lib/components/PricingCardsGrid.svelte';
  import MobileAppShowcase from '$lib/components/MobileAppShowcase.svelte';
  import { isAuthenticated, currentUser } from '$lib/stores/userStore';
  import { plansStore, loadPublicPlans } from '$lib/stores/plansStore';

  let openFaq = $state<number | null>(0);
  let billingInterval = $state<'monthly' | 'yearly'>('monthly');

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  const faqs = [
    {
      q: 'What is the Master AI CEO and how does it orchestrate custom agents?',
      a: 'You do not have to open separate chat windows if you do not want to! Simply tell the Master AI CEO what you need from the Web Console, WhatsApp, or Telegram — and the AI CEO automatically orchestrates the right workflow and bespoke agents for you. Or, if you prefer custom controls, you can open any agent workspace anytime.'
    },
    {
      q: 'Can I add custom agents and workflows in the same subscription?',
      a: 'Yes! Custom business agents and workflows can be orchestrated directly. All updates and capabilities are included automatically inside your single active subscription at zero extra cost.'
    },
    {
      q: 'What is the difference between Starter Plan and Pro Plan?',
      a: 'The Starter Plan (৳499/mo) gives you run-only access to executive agent workflows, 100+ enterprise tool connectors, and tier-guarded Master AI CEO. The Pro Plan (৳899/mo) unlocks the visual workflow studio with node graph editing, custom bespoke agent building, unrestricted Master AI CEO, and multi-key auto-failover.'
    },
    {
      q: 'Do I need my own API keys to use EzboAgents?',
      a: 'You can connect your own provider API keys (such as Google Gemini with 1,500 free daily requests, OpenAI, Grok, DeepSeek, OpenRouter, or Replicate) directly with zero token markups. Your keys remain encrypted and private in your vault.'
    },
    {
      q: 'How do payments work and how fast is activation?',
      a: 'Payments via bKash, Nagad, Rocket, Visa, and Mastercard are processed instantly with immediate account activation and 3-day grace period protection.'
    }
  ];

  const integrationBadges = [
    { id: 'whatsapp', name: 'WhatsApp Channel' },
    { id: 'telegram', name: 'Telegram Bot' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'openai', name: 'OpenAI GPT-4o' },
    { id: 'claude', name: 'Anthropic Claude' },
    { id: 'deepseek', name: 'DeepSeek AI' },
    { id: 'grok', name: 'xAI Grok' },
    { id: 'openrouter', name: 'OpenRouter Multi-Model' },
    { id: 'replicate', name: 'Replicate Flux' }
  ];
</script>

<svelte:head>
  <title>EzboAgents — Master AI CEO & Enterprise Agent Workflows</title>
  <meta
    name="description"
    content="1 Master AI CEO that orchestrates custom Business, Marketing & Freelancer AI workflows across Web, WhatsApp, and Telegram. Modular Bespoke Agent Architecture in 1 subscription."
  />
</svelte:head>

<div
  class="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white"
>
  <!-- Global Scroll Progress Bar -->
  <div class="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-50 pointer-events-none">
    <div
      class="h-full bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#4F46E5] transition-all duration-75 ease-out shadow-[0_0_8px_rgba(79,70,229,0.5)]"
      style="width: {scrollProgress}%;"
    ></div>
  </div>

  <Navbar />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION (Relevance AI Authority Aesthetic) -->
    <!-- ======================================================== -->
    <section class="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Main Title (Solid Charcoal #111827 / text-gray-900, Zero Gradient Spans) -->
          <h1
            class="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.15] max-w-4xl mx-auto break-words"
          >
            1 Master AI CEO Controlling
            <br class="hidden sm:inline" />
            Enterprise Business Workflows.
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mt-5">
            Every bespoke agent features its own custom options and interactive Studio workspace — or skip individual tools altogether and command the <strong class="font-semibold text-gray-900">Master AI CEO</strong> directly from Web, <strong class="font-semibold text-gray-900">WhatsApp</strong>, or <strong class="font-semibold text-gray-900">Telegram</strong> to orchestrate workflows for you.
          </p>

          <!-- Centered Dual Button Group -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            {#if $isAuthenticated}
              <a
                href={$currentUser?.isSubscribed ? '/dashboard' : '/plans'}
                class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {$currentUser?.isSubscribed
                    ? 'Enter AI CEO Console'
                    : 'Select Your Plan & Unlock Enterprise Workflows'}
                </span>
                <Icon name="ArrowRight" size={16} />
              </a>
            {:else}
              <a
                href="/signup"
                class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Unlock AI CEO & Workflows</span>
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href="/#features"
                class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-sm shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Platform Features</span>
              </a>
            {/if}
          </div>

          <!-- Ambient Mesh Integration Showcase Pod -->
          <div
            class="bg-gradient-to-r from-purple-100/40 via-indigo-50/50 to-blue-100/40 border border-indigo-100/60 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xs mt-12 text-center"
          >
            <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {#each integrationBadges as badge}
                <div
                  class="w-11 h-11 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-2 mx-auto hover:scale-105 transition-transform"
                  title={badge.name}
                >
                  <BrandIcon name={badge.id} size={20} />
                </div>
              {/each}
            </div>

            <!-- Micro-caption -->
            <p class="text-xs sm:text-sm font-medium text-gray-500 mt-4 tracking-wide">
              Enterprise AI Specialists & Custom Workflows orchestrated via WhatsApp, Telegram & Web
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. WHATSAPP & TELEGRAM ENGINE ARCHITECTURE -->
    <!-- ======================================================== -->
    <section id="features" class="py-16 sm:py-24 bg-white border-t border-gray-100 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Control Your AI CEO & Custom Agents via WhatsApp & Telegram
          </h2>
          <p class="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Alongside the Web Console, you can command the Master AI CEO and custom agents directly from your personal WhatsApp and Telegram.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs hover:shadow-sm hover:border-gray-300 transition-all space-y-4">
            <div
              class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 font-mono font-semibold text-sm"
            >
              1
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Link WhatsApp or Telegram</h3>
            <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Connect your WhatsApp QR or Telegram account in under 10 seconds from the Channels tab in your dashboard.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs hover:shadow-sm hover:border-gray-300 transition-all space-y-4">
            <div
              class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 font-mono font-semibold text-sm"
            >
              2
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Instruct AI CEO or Custom Agents</h3>
            <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Describe any task in plain language and the Master AI CEO will automatically route and execute it, or instruct your custom agents directly.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs hover:shadow-sm hover:border-gray-300 transition-all space-y-4">
            <div
              class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 font-mono font-semibold text-sm"
            >
              3
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Instant Executive Output</h3>
            <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Receive ready-to-use ad copies, proposals, humanized articles, graphics, and strategies directly in your chat within seconds.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. 120HZ MOBILE APP & ORBITING 100+ TOOLS SHOWCASE -->
    <!-- ======================================================== -->
    <MobileAppShowcase />

    <!-- ======================================================== -->
    <!-- 4. PRICING SECTION -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-20 sm:py-28 relative bg-white border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            One Subscription. Master AI CEO + Custom Workflows Included.
          </h2>
          <p class="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Unlock the Master AI CEO, custom bespoke agents, and 100+ Tool Connectors across Starter & Pro plans.
          </p>
        </div>

        <!-- 2-Tier Dynamic Pricing Grid -->
        <PricingCardsGrid context="landing" bind:selectedInterval={billingInterval} />

        <!-- Payment methods -->
        <div class="mt-12 text-center text-xs text-gray-500 space-y-2">
          <p class="font-medium text-gray-500">Instant Activation • 100% Secure Checkout • 3-Day Grace Period</p>
          <PaymentMethods class="pt-2" />
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 5. FAQ SECTION -->
    <!-- ======================================================== -->
    <section id="faq" class="py-20 sm:py-28 bg-white border-t border-gray-100 relative">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 space-y-3">
          <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p class="text-xs sm:text-sm text-gray-500">
            Everything you need to know about the Master AI CEO, Bespoke Agents, and WhatsApp/Telegram control.
          </p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, i}
            <div
              class="rounded-2xl bg-white border border-gray-200/80 hover:border-gray-300 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onclick={() => (openFaq = openFaq === i ? null : i)}
                class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <Icon
                  name="ChevronRight"
                  size={16}
                  class="text-gray-400 shrink-0 transform transition-transform duration-200 {openFaq === i
                    ? 'rotate-90 text-[#4F46E5]'
                    : ''}"
                />
              </button>
              {#if openFaq === i}
                <div
                  class="px-6 pb-5 pt-2 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/30"
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

  <!-- Floating Scroll to Top & Progress Indicator -->
  <button
    type="button"
    onclick={scrollToTop}
    aria-label="Scroll to top of page (Currently at {Math.round(scrollProgress)}%)"
    class="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-md hover:shadow-lg text-gray-700 hover:text-[#4F46E5] hover:border-[#4F46E5]/40 flex items-center justify-center transition-all duration-300 group cursor-pointer {showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}"
  >
    <!-- Circular SVG Progress Ring -->
    <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 44 44">
      <circle
        cx="22"
        cy="22"
        r="18"
        stroke="#F3F4F6"
        stroke-width="2.5"
        fill="transparent"
      />
      <circle
        cx="22"
        cy="22"
        r="18"
        stroke="#4F46E5"
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
        class="w-4 h-4 text-[#4F46E5] group-hover:-translate-y-1 transition-transform duration-200 stroke-[2.75]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
      <span class="text-[8.5px] font-mono font-bold leading-none text-gray-500 group-hover:text-[#4F46E5] transition-colors">
        {Math.round(scrollProgress)}%
      </span>
    </div>
  </button>
</div>
