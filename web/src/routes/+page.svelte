<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { isAuthenticated } from '$lib/stores/userStore';

  let openFaq = $state<number | null>(0);

  const faqs = [
    {
      q: 'What is BYOK (Bring Your Own Key) and is Gemini API free?',
      a: 'Yes! Google AI Studio provides every user with a free Gemini 1.5/2.0 Flash API Key offering over 1,500 requests per day with zero fees and no credit card required. Because you use your own key, there are no middleman token markups and you get maximum generation speeds.'
    },
    {
      q: 'Is there any risk of my WhatsApp number getting banned?',
      a: 'None at all! SuperAI Hub is strictly an executive self-assistant, not a bulk marketing or spam tool. Our Baileys engine exclusively monitors your personal self-chat ("Message Yourself"). It completely ignores external contacts and groups, simulating natural human typing speed with a 2.5-second composing delay.'
    },
    {
      q: 'Can I use all 50+ tools and the WhatsApp bot on mobile?',
      a: 'Absolutely! Our dashboard is fully optimized for smartphones, tablets, and desktops. Once WhatsApp is connected, you can execute any tool, lookup formulas, draft emails, and generate images directly within your WhatsApp chat without opening a browser.'
    },
    {
      q: 'How long will the 75% launch special be available?',
      a: 'This special pricing is limited to our initial launch campaign. You lock in full VIP access for an entire year at just BDT 1,499 (equal to only BDT 125/month). Standard renewal rate is BDT 2,999/year after the first year.'
    },
    {
      q: 'How do payments work and how fast is activation?',
      a: 'Payments via bKash, Nagad, Rocket, Visa, and Mastercard are processed instantly with immediate account activation. In addition, all subscriptions include 3-day grace period safety protection.'
    }
  ];

  const categories = [
    {
      title: 'E-Commerce & Sales',
      count: '15 Tools',
      icon: 'ShoppingBag',
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      description: 'Facebook & TikTok ad copywriters, customer objection handlers, viral hook generators, product description writers, and discount campaign planners.',
      samples: ['Viral Ad Copy for Dropshipping', 'Customer Price Objection Reply', 'Flash Sale Urgency Offer']
    },
    {
      title: 'Social Media & Content',
      count: '12 Tools',
      icon: 'Share2',
      color: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/30',
      description: 'AI image generator (/image), TikTok & Reels 30s scripts, YouTube SEO tags and descriptions, LinkedIn thought leadership, and carousel planners.',
      samples: ['/image cyberpunk street tiger', '30s Viral TikTok Script', 'YouTube Video SEO & Tags']
    },
    {
      title: 'Career & Productivity',
      count: '12 Tools',
      icon: 'Briefcase',
      color: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
      description: 'Executive leave emails, corporate English rewriter, IELTS essay evaluator, resume tailoring to job descriptions, and meeting action-item extractors.',
      samples: ['Executive Sick Leave Email', 'Draft Corporate Email Rewriter', 'IELTS Writing Task-2 Grader']
    },
    {
      title: 'Technical & Freelancing',
      count: '11 Tools',
      icon: 'Code',
      color: 'from-purple-500/20 to-indigo-500/10',
      border: 'border-purple-500/30',
      description: 'Complex Excel & Google Sheets formula builder, winning Upwork & Fiverr proposals, SQL query optimizer, Tailwind CSS components, and automation scripts.',
      samples: ['Excel Duplicate Match Formula', 'Upwork Winning Cover Letter', 'Tailwind Responsive Navbar']
    }
  ];

  const featuredAgents = [
    {
      name: 'Cody',
      role: 'The Viral Ad Wordsmith',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cody&backgroundColor=0f172a',
      tagline: 'Your personal direct-response ad specialist. Crafts high-converting ad copy for Facebook & Instagram. Writer\'s block? Not on Cody\'s watch.'
    },
    {
      name: 'Zara',
      role: 'E-Commerce Storyteller',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zara&backgroundColor=0f172a',
      tagline: 'Transforms plain product specs into benefit-packed, sensory product pages with SEO keyword power.'
    },
    {
      name: 'Emmi',
      role: 'Spreadsheet Wizard',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emmi&backgroundColor=0f172a',
      tagline: 'Turns complex data into clean formulas. INDEX/MATCH, VLOOKUP, and automated Sheets are her superpower.'
    },
    {
      name: 'Arto',
      role: 'Visionary Concept Artist',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Arto&backgroundColor=0f172a',
      tagline: 'Generates photorealistic 8K art, branding mockups, and illustrations with instant /image synthesis.'
    },
    {
      name: 'Marcus',
      role: 'Master Closer & Negotiator',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=0f172a',
      tagline: 'Turns "price is too high" and customer hesitation into immediate checkout confirmations.'
    },
    {
      name: 'Logan',
      role: 'Top-Rated Freelance Pitcher',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Logan&backgroundColor=0f172a',
      tagline: 'Writes client-focused proposals that address specific pain points and close lucrative freelance contracts.'
    }
  ];
</script>

<svelte:head>
  <title>SuperAI Hub - 50+ Specialized AI Helpers & WhatsApp Personal Assistant</title>
  <meta name="description" content="Supercharge your workflow with 50+ specialized AI tools and connect your personal WhatsApp inbox as an AI assistant. BYOK free Gemini model at ezboagents.com." />
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
  <Navbar />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION -->
    <!-- ======================================================== -->
    <section class="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
      <!-- Glow Gradients -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[130px] pointer-events-none rounded-full"></div>
      <div class="absolute top-1/3 left-1/4 w-[350px] h-[280px] bg-teal-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Top Tagline Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/10 backdrop-blur-md">
            <Icon name="Sparkles" size={15} />
            <span>50+ AI Helpers • WhatsApp Assistant • Free Gemini BYOK</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span class="text-amber-300 font-bold">75% Launch Offer</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
            50+ Specialized AI Helpers <br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              In Your Web Dashboard & WhatsApp!
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate tedious tasks across e-commerce, content creation, freelancing, and business operations. Use your personal WhatsApp inbox and modern web dashboard as an executive AI assistant.
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {#if $isAuthenticated}
              <a
                href="/dashboard"
                class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <Icon name="ArrowRight" size={16} />
              </a>
            {:else}
              <a
                href="/signup"
                class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href="/login"
                class="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <span>Log In</span>
              </a>
            {/if}
            <a
              href="#tools"
              class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore 50+ Tools</span>
              <Icon name="ChevronRight" size={15} />
            </a>
          </div>

          <!-- Trust Highlights -->
          <div class="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <Icon name="Shield" class="text-emerald-400" size={16} />
              <span>100% Anti-Ban Safe (Self-Chat)</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Key" class="text-teal-400" size={16} />
              <span>Free Gemini 1.5/2.0 BYOK</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Zap" class="text-amber-400" size={16} />
              <span>1,500+ Daily Requests Free</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="CheckCircle" class="text-cyan-400" size={16} />
              <span>Instant Setup in 60s</span>
            </div>
          </div>
        </div>

        <!-- Interactive Preview Showcase -->
        <div class="mt-14 max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/60 p-2 sm:p-4 backdrop-blur-xl shadow-2xl shadow-emerald-500/5">
          <div class="rounded-xl bg-slate-950 border border-slate-800/80 p-4 sm:p-6 overflow-hidden">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Icon name="MessageSquare" size={20} />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-white flex items-center gap-2">
                    <span>SuperAI WhatsApp Assistant & Web Chat</span>
                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">Live Connected</span>
                  </h3>
                  <p class="text-xs text-slate-400">Central Brain Router with instant tool matching & image synthesis</p>
                </div>
              </div>
              <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Ready 24/7</span>
              </div>
            </div>

            <!-- Chat Preview Bubbles -->
            <div class="space-y-4 text-xs sm:text-sm font-sans">
              <!-- User message -->
              <div class="flex items-start gap-2.5 justify-end">
                <div class="bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-lg shadow-md">
                  <p>Write a high-converting Facebook ad copy for our waterproof gym backpack with a 20% discount code.</p>
                </div>
              </div>

              <!-- Assistant reply -->
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icon name="Sparkles" size={16} />
                </div>
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-sm max-w-xl text-slate-200 space-y-2 shadow-md">
                  <div class="flex items-center gap-2 text-[11px] font-semibold text-emerald-400 pb-1 border-b border-slate-800">
                    <Icon name="Zap" size={13} />
                    <span>Auto-routed to: E-Commerce Facebook Ad Copywriter</span>
                  </div>
                  <p class="font-bold text-white">🔥 Stop Ruining Your Gear In The Rain! 🎒⚡</p>
                  <p class="text-slate-300 leading-relaxed">Meet the ultimate 100% waterproof tactical gym backpack. Engineered with military-grade ballistic nylon, dedicated ventilated shoe compartment, and padded 16" laptop pocket.</p>
                  <p class="text-amber-300 font-mono font-semibold">🎁 Use Code: GYM20 for 20% OFF this week only!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. 50+ SPECIALIZED TOOLS SHOWCASE -->
    <!-- ======================================================== -->
    <section id="tools" class="py-20 bg-slate-900/40 border-y border-slate-800/60 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Icon name="Grid" size={13} />
            <span>Complete Suite</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            50+ Specialized AI Helpers Organized Into 4 Super-Pillars
          </h2>
          <p class="text-sm text-slate-400">
            Every tool features engineered prompts and dedicated input schemas to deliver pinpoint results without generic AI fluff.
          </p>
        </div>

        <!-- 4 Pillars Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {#each categories as cat}
            <div class="rounded-2xl bg-slate-900/80 border {cat.border} p-6 sm:p-8 flex flex-col justify-between backdrop-blur-sm hover:border-emerald-500/50 transition-all hover:-translate-y-1 shadow-lg">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br {cat.color} border {cat.border} flex items-center justify-center text-emerald-400">
                    <Icon name={cat.icon} size={24} />
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-emerald-300">
                    {cat.count}
                  </span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">{cat.title}</h3>
                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">{cat.description}</p>
              </div>

              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Popular Example Prompts:</p>
                <div class="flex flex-wrap gap-2">
                  {#each cat.samples as sample}
                    <span class="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-mono">
                      "{sample}"
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Featured AI Specialist Agents Spotlight (Darius Lukas Style) -->
        <div class="mt-20">
          <div class="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Meet Your New AI-Powered Workforce
            </h3>
            <p class="text-xs sm:text-sm text-slate-400">
              Pick the right AI specialist for the right job. From viral ad copy to financial formulas, our 50-agent squad has you covered:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {#each featuredAgents as agent}
              <div class="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-5 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 group">
                <div class="flex items-start gap-3.5 mb-3">
                  <div class="relative w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700/80 p-1 group-hover:border-emerald-500/50 transition-all shadow-md shrink-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      class="w-full h-full object-contain rounded-xl"
                      loading="lazy"
                    />
                    <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                  </div>
                  <div>
                    <h4 class="font-extrabold text-lg text-white group-hover:text-emerald-300 transition-colors">
                      {agent.name}
                    </h4>
                    <p class="text-xs font-semibold text-emerald-400">{agent.role}</p>
                  </div>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">
                  {agent.tagline}
                </p>
              </div>
            {/each}
          </div>
        </div>

        <!-- Dashboard Unlock Banner -->
        <div class="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="text-left">
            <h4 class="text-lg font-bold text-white">Ready to run any of the 50+ tools?</h4>
            <p class="text-xs text-slate-400">Create your account or log in to access the full interactive catalog and web chat.</p>
          </div>
          <div class="flex items-center gap-3">
            <a
              href="/signup"
              class="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
            >
              Sign Up to Unlock 50+ Tools
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. WHATSAPP AI ASSISTANT BENEFITS -->
    <!-- ======================================================== -->
    <section id="features" class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Icon name="Shield" size={13} />
              <span>Anti-Ban Protected Self-Chat</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Turn Your Personal WhatsApp Into an Executive Assistant
            </h2>
            <p class="text-sm text-slate-300 leading-relaxed">
              No need to log into multiple websites or switch apps. Just send a message to yourself in WhatsApp, and our Central Brain identifies the exact tool, crafts the response, or renders custom AI images in seconds.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Icon name="Check" size={16} />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">100% Anti-Ban Guarantee</h4>
                  <p class="text-xs text-slate-400">Strictly processes self-chat ("Message Yourself"). Never messages external contacts or groups, ensuring complete compliance.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                  <Icon name="Check" size={16} />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">Flux & Pollinations AI Image Synthesis</h4>
                  <p class="text-xs text-slate-400">Send <span class="text-emerald-300 font-mono">/image [prompt]</span> from your phone to receive hyper-realistic images right in chat.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Icon name="Check" size={16} />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">Seamless Dual-Sync</h4>
                  <p class="text-xs text-slate-400">Use both the Web Dashboard Chat and your WhatsApp phone chat interchangeably with full parity.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Graphic / Callout -->
          <div class="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
            <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3">Supported Instant WhatsApp Commands:</h3>
            <div class="space-y-3 font-mono text-xs">
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>/image neon cyber tiger in rain</span>
                <span class="text-emerald-400 text-[10px]">Instant AI Art</span>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>"Write 3 TikTok hooks for fitness apparel"</span>
                <span class="text-teal-400 text-[10px]">Social Hook</span>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>"Excel formula for VLOOKUP across sheets"</span>
                <span class="text-cyan-400 text-[10px]">Excel Formula</span>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>/help</span>
                <span class="text-amber-400 text-[10px]">Full Command Menu</span>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
              💡 <strong>Pro Tip:</strong> Simply connect your free Gemini API key inside your dashboard to enjoy over 1,500 assistant interactions daily at zero additional cost!
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. PRICING SECTION -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-20 bg-slate-900/30 border-t border-slate-800/60 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Icon name="Gift" size={13} />
            <span>Launch Special - 75% OFF</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Pricing. Instant Activation.
          </h2>
          <p class="text-sm text-slate-400">
            Supporting bKash, Nagad, Rocket, Visa & Mastercard with a 3-day safety grace period.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Monthly Pro Card -->
          <div class="rounded-2xl bg-slate-900/90 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">Monthly Pro</h3>
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">Flexible</span>
              </div>
              <div class="flex items-baseline gap-1 mb-6">
                <span class="text-4xl font-black text-white">BDT 499</span>
                <span class="text-xs text-slate-400">/ month</span>
              </div>
              <ul class="space-y-3 text-xs sm:text-sm text-slate-300 mb-8">
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> Full access to all 50+ AI tools</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> Personal WhatsApp bot connection</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> Free Gemini BYOK integration</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> Web dashboard AI chat</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> 24/7 technical support</li>
              </ul>
            </div>
            <a
              href="/signup"
              class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-all block"
            >
              Get Started with Monthly Pro
            </a>
          </div>

          <!-- Yearly VIP Card (Featured) -->
          <div class="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/60 p-8 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
            <div class="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg">
              Save 75% • VIP Access
            </div>
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                  <span>Yearly VIP Special</span>
                  <Icon name="Crown" size={18} class="text-amber-400" />
                </h3>
              </div>
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-4xl font-black text-white">BDT 1,499</span>
                <span class="text-xs text-slate-400">/ 1st year</span>
                <span class="text-xs line-through text-slate-500">BDT 5,988</span>
              </div>
              <p class="text-[11px] text-emerald-400 mb-6 font-semibold">Equal to only BDT 125/month!</p>
              <ul class="space-y-3 text-xs sm:text-sm text-slate-200 mb-8">
                <li class="flex items-center gap-2 font-semibold text-white"><Icon name="Check" size={16} class="text-emerald-400" /> Everything in Monthly Pro</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> Priority fast-lane AI response speeds</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> Early access to all upcoming tools</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> 3-day safety grace period protection</li>
                <li class="flex items-center gap-2"><Icon name="Check" size={16} class="text-emerald-400" /> Dedicated VIP WhatsApp support</li>
              </ul>
            </div>
            <a
              href="/signup"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs text-center shadow-lg shadow-emerald-500/25 transition-all block"
            >
              Claim 75% Launch Offer
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 5. FAQ SECTION -->
    <!-- ======================================================== -->
    <section id="faq" class="py-20 relative">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 space-y-3">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p class="text-xs sm:text-sm text-slate-400">Everything you need to know about SuperAI Hub, BYOK, and WhatsApp AI.</p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, i}
            <div class="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all">
              <button
                onclick={() => (openFaq = openFaq === i ? null : i)}
                class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-white hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <Icon
                  name="ChevronRight"
                  size={16}
                  class="text-emerald-400 shrink-0 transform transition-transform {openFaq === i ? 'rotate-90' : ''}"
                />
              </button>
              {#if openFaq === i}
                <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
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
