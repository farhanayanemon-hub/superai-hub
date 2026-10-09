<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { isAuthenticated, currentUser } from '$lib/stores/userStore';
  import { plansStore, loadPublicPlans } from '$lib/stores/plansStore';

  let openFaq = $state<number | null>(0);
  let billingInterval = $state<'monthly' | 'yearly'>('monthly');

  onMount(() => {
    loadPublicPlans();
  });

  const faqs = [
    {
      q: 'What is the BYOK (Bring Your Own Key) plan?',
      a: 'The BYOK Multi-Engine plan lets you connect your own API keys from Google Gemini, OpenAI, xAI (Grok), DeepSeek, OpenRouter (Claude), and Replicate. Because requests go directly through your provider accounts, you pay zero token markup or middleman fees. Google also offers a free Gemini Flash API key with 1,500 daily requests requiring zero credit card!'
    },
    {
      q: 'What is the All-Inclusive Cloud plan?',
      a: 'The All-Inclusive Cloud plan requires ZERO API keys or technical setup. All your AI workflows, copywriting, data calculations, and image generation are powered directly by our platform high-speed AI cluster. You just sign in and start executing immediately!'
    },
    {
      q: 'Can I add multiple API keys for different tasks?',
      a: 'Yes! On the BYOK plan, our Universal API Key Vault allows you to add multiple keys from various providers. You can easily select DeepSeek for coding, GPT-4o for complex research, Grok for real-time insights, or Gemini for instant responses.'
    },
    {
      q: 'Is there any risk of my WhatsApp number getting restricted?',
      a: 'None at all! EzboAgents is an executive self-assistant, not a bulk marketing or broadcast bot. Our Baileys engine exclusively monitors your personal self-chat ("Message Yourself"). It completely ignores external contacts and groups, simulating natural human typing speed with authentic composing delay.'
    },
    {
      q: 'How do payments work and how fast is activation?',
      a: 'Payments via bKash, Nagad, Rocket, Visa, and Mastercard are processed instantly with immediate account activation. In addition, all subscriptions include 3-day safety grace period protection.'
    }
  ];
</script>

<svelte:head>
  <title>EzboAgents — Private AI Executive Advisory & Intelligent Automation</title>
  <meta name="description" content="Deploy your personalized autonomous AI workforce and sync your personal WhatsApp into an executive command center. Choose BYOK or All-Inclusive Cloud." />
</svelte:head>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
  <Navbar />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION -->
    <!-- ======================================================== -->
    <section class="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-[#f8fafc]">
      <!-- Ambient Royal Blue Spotlights -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-blue-400/10 via-indigo-400/5 to-transparent blur-[140px] pointer-events-none rounded-full"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.14]">
            Deploy Your Private <br class="hidden sm:inline" />
            <span class="blue-gradient-text font-serif italic">
              Autonomous AI Workforce
            </span><br class="hidden sm:inline" />
            To Automate 90% of Your Business.
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Custom specialized AI agents seamlessly synchronized between your private web console and your personal WhatsApp. Connect your own Multi-API keys with zero token markups, or choose our fully managed cloud cluster with zero setup.
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {#if $isAuthenticated}
              <a
                href={$currentUser?.isSubscribed ? "/dashboard" : "/plans"}
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm blue-btn text-white flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>{$currentUser?.isSubscribed ? "Enter Executive Console" : "Select Your Plan & Unlock"}</span>
                <Icon name="ArrowRight" size={16} />
              </a>
            {:else}
              <a
                href="/signup"
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm blue-btn text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Deploy Your AI Workforce</span>
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href="#pricing"
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>View Plans & Pricing</span>
              </a>
            {/if}
          </div>

          <!-- Trust Badges -->
          <div class="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div class="flex items-center gap-2 text-blue-700 font-bold text-xs sm:text-sm">
                <Icon name="MessageSquare" size={16} class="text-blue-600 shrink-0" />
                <span>Personal WhatsApp Link</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">Chat directly via private self-chat • Zero ban risk</p>
            </div>

            <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div class="flex items-center gap-2 text-blue-700 font-bold text-xs sm:text-sm">
                <Icon name="Key" size={16} class="text-blue-600 shrink-0" />
                <span>Multi-API Vault or Managed</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">BYOK with zero markup, or 100% plug & play</p>
            </div>

            <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div class="flex items-center gap-2 text-blue-700 font-bold text-xs sm:text-sm">
                <Icon name="Zap" size={16} class="text-blue-600 shrink-0" />
                <span>Instant 60s Activation</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">Immediate access • No complex setup</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. WHY EZBOAGENTS VS GENERIC CHATGPT -->
    <!-- ======================================================== -->
    <section class="py-24 relative overflow-hidden bg-white border-y border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Stop Staring At Blank Prompt Boxes.
          </h2>
          <p class="text-sm sm:text-base text-slate-600">
            Standard AI chatbots provide generic answers. EzboAgents deploys domain-specific, custom-calibrated agents that know exactly what to produce.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <!-- The Generic Way -->
          <div class="rounded-3xl bg-[#f8fafc] border border-slate-200 p-8 space-y-6 shadow-xs">
            <div class="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold">
                ✕
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-900">Standard ChatGPT & Generic Bots</h3>
                <p class="text-xs text-slate-500">Unfocused conversational chatbots</p>
              </div>
            </div>

            <ul class="space-y-4 text-xs sm:text-sm text-slate-600">
              <li class="flex items-start gap-3">
                <span class="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>Blank Prompt Paralysis:</strong> You have to engineer complex prompts from scratch every single time.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>Robotic & Generic Output:</strong> Hallucinates generic fluff that sounds like AI and lacks sales psychology or real domain nuance.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>High Monthly Subscriptions:</strong> Costs $20–$30/month per seat, recurring forever with no regional pricing.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-rose-500 font-bold mt-0.5">✕</span>
                <span><strong>Browser Only:</strong> You cannot run them inside your personal mobile WhatsApp without expensive 3rd-party webhook setups.</span>
              </li>
            </ul>
          </div>

          <!-- The EzboAgents Way -->
          <div class="rounded-3xl bg-white border-2 border-blue-500 p-8 space-y-6 relative shadow-xl shadow-blue-500/10">
            <div class="flex items-center gap-3 border-b border-blue-100 pb-4">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                ✓
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <span>EzboAgents Custom Architecture</span>
                  <span class="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">Superior</span>
                </h3>
                <p class="text-xs text-blue-700 font-medium">Calibrated specialized AI agents at your command</p>
              </div>
            </div>

            <ul class="space-y-4 text-xs sm:text-sm text-slate-700">
              <li class="flex items-start gap-3">
                <span class="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>Custom Specialized Agents:</strong> Pre-calibrated with proven industry frameworks, direct-response copy systems, and Excel models.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>Personal WhatsApp Sync:</strong> Chat with your agents directly in WhatsApp via private self-chat with zero ban risk.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>Multi-API Vault or Managed Cloud:</strong> Connect your own API keys with zero token markups, or let our managed cloud handle everything with zero keys.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-blue-600 font-bold mt-0.5">✓</span>
                <span><strong>Instant Visual Media (/image):</strong> Generate photorealistic commercial assets and mockups directly inside WhatsApp and web.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. WHATSAPP ENGINE ARCHITECTURE -->
    <!-- ======================================================== -->
    <section id="features" class="py-24 bg-[#f8fafc] relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Turn Your Personal WhatsApp Into an Autonomous Executive
          </h2>
          <p class="text-sm sm:text-base text-slate-600">
            No app switching required. Chat with yourself in WhatsApp and our Central Brain router delegates to the right specialist in seconds.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-lg">
              01
            </div>
            <h3 class="text-lg font-bold text-slate-900">Scan Private QR Code</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pair your personal WhatsApp in less than 10 seconds via our secure multi-device Baileys socket link. No API verification delays.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-lg">
              02
            </div>
            <h3 class="text-lg font-bold text-slate-900">Message Yourself Anytime</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Open your own chat ("Message Yourself") on your phone. Send questions, ask for copy variations, or type <span class="text-blue-600 font-mono font-bold">/image</span> for commercial renders.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-lg">
              03
            </div>
            <h3 class="text-lg font-bold text-slate-900">Instant AI Execution</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The Central Brain identifies the task, executes the prompt with your chosen engine, and replies back to your phone with authentic composing speed.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. PRICING - 2 TIERS: BYOK vs ALL-INCLUSIVE MANAGED -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-24 relative bg-white border-y border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Transparent Pricing. Choose Your Setup.
          </h2>
          <p class="text-sm sm:text-base text-slate-600">
            Bring your own API keys for complete control, or choose our managed cloud with zero configuration.
          </p>

          <!-- Monthly / Yearly Toggle -->
          <div class="flex items-center justify-center gap-3 pt-2">
            <span class="text-sm font-semibold {billingInterval === 'monthly' ? 'text-slate-900' : 'text-slate-500'}">Monthly</span>
            <button
              onclick={() => billingInterval = billingInterval === 'monthly' ? 'yearly' : 'monthly'}
              aria-label="Toggle billing interval between monthly and yearly"
              class="relative w-14 h-7 rounded-full transition-all duration-300 {billingInterval === 'yearly' ? 'bg-blue-600' : 'bg-slate-300'} cursor-pointer"
            >
              <span class="absolute top-1 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-xs {billingInterval === 'yearly' ? 'left-8' : 'left-1'}"></span>
            </button>
            <span class="text-sm font-semibold {billingInterval === 'yearly' ? 'text-blue-700 font-bold' : 'text-slate-500'}">Yearly</span>
            {#if billingInterval === 'yearly'}
              <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">Save 20% • 2 months FREE</span>
            {/if}
          </div>
        </div>

        <!-- 2-Tier Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- PLAN 1: BYOK MULTI-ENGINE -->
          <div class="rounded-3xl bg-white border border-slate-200 p-8 flex flex-col justify-between hover:border-blue-300 transition-all duration-300 shadow-sm">
            <div>
              <div class="mb-5">
                <span class="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">{$plansStore.byok.badge}</span>
                <h3 class="text-2xl font-extrabold text-slate-900 mt-3">{$plansStore.byok.name}</h3>
                <div class="flex items-baseline gap-1 mt-2">
                  <span class="text-3xl font-extrabold text-slate-900">BDT {billingInterval === 'yearly' ? $plansStore.byok.yearlyMonthlyPrice : $plansStore.byok.monthlyPrice}</span>
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
            <a
              href={$isAuthenticated ? "/plans?plan=byok" : "/signup?plan=byok"}
              class="mt-8 w-full py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-all block cursor-pointer"
            >
              Start with BYOK
            </a>
          </div>

          <!-- PLAN 2: ALL-INCLUSIVE MANAGED (Featured) -->
          <div class="rounded-3xl bg-white border-2 border-blue-600 p-8 flex flex-col justify-between relative shadow-xl shadow-blue-500/10 scale-[1.02]">
            {#if $plansStore.managed.highlightBadge}
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                {$plansStore.managed.highlightBadge}
              </div>
            {/if}
            <div>
              <div class="mb-5">
                <span class="px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200">{$plansStore.managed.badge}</span>
                <h3 class="text-2xl font-extrabold text-slate-900 mt-3">{$plansStore.managed.name}</h3>
                <div class="flex items-baseline gap-1 mt-2">
                  <span class="text-3xl font-extrabold text-slate-900">BDT {billingInterval === 'yearly' ? $plansStore.managed.yearlyMonthlyPrice : $plansStore.managed.monthlyPrice}</span>
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
                  <li class="flex items-center gap-2"><Icon name="Check" size={14} class="text-blue-600 shrink-0" /> <span>{feature}</span></li>
                {/each}
              </ul>
            </div>
            <a
              href={$isAuthenticated ? "/plans?plan=managed" : "/signup?plan=managed"}
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
              <span class="px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 shadow-2xs">{method}</span>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 5. FAQ SECTION -->
    <!-- ======================================================== -->
    <section id="faq" class="py-24 bg-[#f8fafc] relative">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 space-y-3">
          <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p class="text-xs sm:text-sm text-slate-600">Everything you need to know about EzboAgents, BYOK, and WhatsApp AI.</p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, i}
            <div class="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 overflow-hidden transition-all shadow-xs">
              <button
                onclick={() => (openFaq = openFaq === i ? null : i)}
                class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <Icon
                  name="ChevronRight"
                  size={16}
                  class="text-blue-600 shrink-0 transform transition-transform {openFaq === i ? 'rotate-90' : ''}"
                />
              </button>
              {#if openFaq === i}
                <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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
