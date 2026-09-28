<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { isAuthenticated } from '$lib/stores/userStore';

  let openFaq = $state<number | null>(0);

  const faqs = [
    {
      q: 'What is BYOK (Bring Your Own Key) and is Gemini API free?',
      a: 'Yes! Google AI Studio provides every user with a free Gemini 1.5/2.0 Flash API Key offering over 1,500 requests per day with zero fees and no credit card required. Because you use your own key, there are zero middleman token markups and you get maximum generation speeds directly from Google.'
    },
    {
      q: 'Is there any risk of my WhatsApp number getting restricted?',
      a: 'None at all! EzboAgents is an executive self-assistant, not a bulk marketing or broadcast bot. Our Baileys engine exclusively monitors your personal self-chat ("Message Yourself"). It completely ignores external contacts and groups, simulating natural human typing speed with an authentic composing delay.'
    },
    {
      q: 'Can I use all 50+ specialists and the WhatsApp bot on mobile?',
      a: 'Absolutely! The EzboAgents console is fully optimized for smartphones, tablets, and desktops. Once WhatsApp is paired, you can execute any specialist, evaluate proposals, draft contracts, and generate images directly within your WhatsApp chat without opening a browser.'
    },
    {
      q: 'How long will the VIP launch special be available?',
      a: 'This special pricing is limited to our inaugural launch campaign. You lock in full executive VIP access for an entire year at just BDT 1,499 (equal to only BDT 125/month). Standard renewal rate is BDT 2,999/year after the first year.'
    },
    {
      q: 'How do payments work and how fast is activation?',
      a: 'Payments via bKash, Nagad, Rocket, Visa, and Mastercard are processed instantly with immediate account activation. In addition, all subscriptions include 3-day safety grace period protection.'
    }
  ];

  const categories = [
    {
      title: 'E-Commerce & High-Ticket Sales',
      count: '15 Specialists',
      icon: 'ShoppingBag',
      description: 'Viral Facebook & TikTok direct-response copywriters, objection closers, order verification guards, product description architects, and discount campaign planners.',
      samples: ['Viral Direct-Response Ad Copy', 'High-Ticket Price Objection Closer', 'Flash Sale Urgency Protocol']
    },
    {
      title: 'Media, Content & Virality',
      count: '12 Specialists',
      icon: 'Share2',
      description: 'AI visual concept artist (/image), short-form TikTok & Reels directors, YouTube algorithm tags & SEO, executive LinkedIn thought leadership, and carousel architects.',
      samples: ['/image ultra-luxury penthouse desk', '30s Viral Hook & Script', 'YouTube Video SEO & Tags']
    },
    {
      title: 'Career & Executive Operations',
      count: '12 Specialists',
      icon: 'Briefcase',
      description: 'Executive leave correspondence, corporate English polisher, IELTS 8.5+ evaluated essays, ATS resume tailoring to job descriptions, and board-level briefings.',
      samples: ['Diplomatic Corporate Email', 'Executive Leave Notice', 'IELTS Writing Task-2 Grader']
    },
    {
      title: 'Engineering & Technical Architecture',
      count: '11 Specialists',
      icon: 'Code',
      description: 'Advanced Excel & Google Sheets formula builder, winning Upwork & enterprise proposals, SQL query optimizer, Tailwind CSS components, and automation scripts.',
      samples: ['INDEX/MATCH Dynamic Data Formula', 'Winning Upwork Proposal Pitch', 'Tailwind Responsive Component']
    }
  ];

  const featuredAgents = [
    {
      name: 'Cody',
      role: 'The Viral Ad Wordsmith',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      tagline: 'Your private direct-response copywriting strategist. Crafts high-converting campaigns across Meta, TikTok, and Google.'
    },
    {
      name: 'Zara',
      role: 'E-Commerce Sensory Storyteller',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      tagline: 'Transforms raw product specifications into emotionally captivating, high-converting product pages with built-in search authority.'
    },
    {
      name: 'Marcus',
      role: 'Enterprise Closer & Negotiator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      tagline: 'Deconstructs buyer hesitation and price resistance into immediate, confident checkout confirmations and signed contracts.'
    },
    {
      name: 'Emmi',
      role: 'The Spreadsheet & Data Wizard',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
      tagline: 'Engineers sophisticated formulas, nested conditions, and automated data pipelines across Excel and Google Sheets.'
    },
    {
      name: 'Arto',
      role: 'Visionary AI Concept Artist',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
      tagline: 'Produces hyper-realistic commercial imagery, brand identities, and editorial renders via instant /image synthesis.'
    },
    {
      name: 'Logan',
      role: 'Top-Rated Freelance Pitcher',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      tagline: 'Drafts bespoke, client-obsessed proposals that capture premium freelance contracts on Upwork, Fiverr, and LinkedIn.'
    }
  ];
</script>

<svelte:head>
  <title>EzboAgents — Private AI Executive Advisory & Intelligent Automation</title>
  <meta name="description" content="Deploy an elite consortium of 50+ specialized AI executives and sync your personal WhatsApp into an autonomous command center. Zero token markup with BYOK." />
</svelte:head>

<div class="min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
  <Navbar />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION (OBSIDIAN & CHAMPAGNE GOLD) -->
    <!-- ======================================================== -->
    <section class="relative pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden">
      <!-- Ambient Luxury Spotlights -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full"></div>
      <div class="absolute top-1/3 left-1/4 w-[350px] h-[300px] bg-amber-600/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Top Tagline Badge -->
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#12141e] border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold shadow-lg shadow-amber-500/5 backdrop-blur-md">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Private AI Executive Consortium • 50+ Vetted Specialists</span>
            <span class="w-1 h-1 rounded-full bg-amber-400/60"></span>
            <span class="text-white font-bold">VIP Launch Access</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            Deploy An Elite Consortium of <br class="hidden sm:inline" />
            <span class="gold-gradient-text">
              50+ Specialized AI Executives.
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Direct-response copywriters, objection closers, financial architects, and software engineers — seamlessly synchronized between your private web console and your personal WhatsApp.
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {#if $isAuthenticated}
              <a
                href="/dashboard"
                class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm gold-btn text-slate-950 flex items-center justify-center gap-2"
              >
                <span>Enter Executive Console</span>
                <Icon name="ArrowRight" size={16} />
              </a>
            {:else}
              <a
                href="/signup"
                class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm gold-btn text-slate-950 flex items-center justify-center gap-2"
              >
                <span>Deploy Your Consortium Free</span>
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href="/login"
                class="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-[#12141f] hover:bg-[#181a28] text-slate-200 border border-amber-500/20 hover:border-amber-400/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Client Sign In</span>
              </a>
            {/if}
            <a
              href="#tools"
              class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-sm text-slate-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Specialist Roster</span>
              <Icon name="ChevronRight" size={15} />
            </a>
          </div>

          <!-- Trust Metrics Bar -->
          <div class="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 border-t border-white/[0.06] mt-4">
            <div class="flex items-center gap-2">
              <Icon name="Shield" class="text-amber-400" size={16} />
              <span>100% Anti-Ban Encrypted Architecture</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Key" class="text-amber-400" size={16} />
              <span>Zero-Markup Gemini BYOK</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Zap" class="text-amber-400" size={16} />
              <span>1,500+ Daily Requests Included</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="CheckCircle" class="text-amber-400" size={16} />
              <span>Instant Setup in 60s</span>
            </div>
          </div>
        </div>

        <!-- Interactive Executive Console Preview Mockup -->
        <div class="mt-14 max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-[#181b28] to-[#0e1017] border border-amber-500/30 p-2 sm:p-4 backdrop-blur-xl shadow-2xl shadow-black/80">
          <div class="rounded-2xl bg-[#0b0c12] border border-white/[0.08] p-4 sm:p-6 overflow-hidden">
            <div class="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Icon name="MessageSquare" size={20} />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-white flex items-center gap-2">
                    <span>EzboAgents WhatsApp & Executive Console</span>
                    <span class="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-semibold border border-amber-400/30">Active Link</span>
                  </h3>
                  <p class="text-xs text-slate-400">Central Brain Router with instant specialist routing & media generation</p>
                </div>
              </div>
              <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Standby 24/7</span>
              </div>
            </div>

            <!-- Chat Preview Bubbles -->
            <div class="space-y-4 text-xs sm:text-sm font-sans">
              <!-- User message -->
              <div class="flex items-start gap-2.5 justify-end">
                <div class="bg-[#1c202e] border border-amber-500/20 text-slate-100 p-3.5 rounded-2xl rounded-tr-sm max-w-lg shadow-md">
                  <p>Write an urgent, high-converting Facebook ad copy for our waterproof executive backpack with a 20% promotional code.</p>
                </div>
              </div>

              <!-- Assistant reply -->
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Icon name="Sparkles" size={16} />
                </div>
                <div class="bg-[#12141f] border border-amber-500/30 p-4 rounded-2xl rounded-tl-sm max-w-xl text-slate-200 space-y-2 shadow-lg">
                  <div class="flex items-center gap-2 text-[11px] font-semibold text-amber-400 pb-1.5 border-b border-white/[0.06]">
                    <Icon name="Zap" size={13} />
                    <span>Dispatched to Cody • Direct-Response Copywriting Specialist</span>
                  </div>
                  <p class="font-bold text-white">🔥 Never Compromise Your Valuables In The Rain. 💼⚡</p>
                  <p class="text-slate-300 leading-relaxed">Engineered with military-grade ballistic nylon, shock-absorbing laptop suspension, and weather-sealed zippers. Built for the modern operator.</p>
                  <p class="text-amber-300 font-mono font-semibold">🎁 Use Code: EXECUTIVE20 for 20% OFF this week only.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. 50+ SPECIALIST ROSTER (4 PILLARS) -->
    <!-- ======================================================== -->
    <section id="tools" class="py-20 bg-[#0c0d14] border-y border-amber-500/20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Icon name="Grid" size={13} />
            <span>Complete Executive Suite</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            50+ Specialized AI Executives Across 4 Strategic Domains
          </h2>
          <p class="text-sm text-slate-400">
            Each specialist is calibrated with rigorous system directives, tailored schema inputs, and professional response structures.
          </p>
        </div>

        <!-- 4 Pillars Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {#each categories as cat}
            <div class="rounded-3xl bg-[#10121a]/90 border border-amber-500/20 hover:border-amber-400/50 p-6 sm:p-8 flex flex-col justify-between backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-amber-500/5">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Icon name={cat.icon} size={24} />
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#161824] border border-amber-500/30 text-amber-300">
                    {cat.count}
                  </span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">{cat.title}</h3>
                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">{cat.description}</p>
              </div>

              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80 mb-2">Signature Directives:</p>
                <div class="flex flex-wrap gap-2">
                  {#each cat.samples as sample}
                    <span class="px-2.5 py-1 rounded-lg bg-[#141622] border border-white/10 text-[11px] text-slate-300 font-mono">
                      "{sample}"
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Featured AI Specialist Agents Spotlight (Executive Headshots) -->
        <div class="mt-20">
          <div class="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Advisory Specialists
            </h3>
            <p class="text-xs sm:text-sm text-slate-400">
              Select any vetted specialist to tackle your high-impact operational objectives:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each featuredAgents as agent}
              <div class="group rounded-2xl bg-[#10121a]/90 hover:bg-[#141624] border border-amber-500/20 hover:border-amber-400/60 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10">
                <div class="flex items-start gap-4 mb-4">
                  <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-amber-500/30 group-hover:border-amber-400/70 transition-all shadow-md shrink-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#10121a]"></span>
                  </div>
                  <div>
                    <h4 class="font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                      {agent.name}
                    </h4>
                    <p class="text-xs font-semibold text-amber-400/90">{agent.role}</p>
                  </div>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed mb-4">
                  {agent.tagline}
                </p>
                <div class="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                  <span>Consult Specialist</span>
                  <Icon name="ArrowRight" size={13} class="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Dashboard Unlock Banner -->
        <div class="mt-14 text-center p-8 rounded-3xl bg-gradient-to-r from-[#171926] via-[#12141e] to-[#171926] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div class="text-left">
            <h4 class="text-lg font-bold text-white">Ready to consult all 50+ specialists?</h4>
            <p class="text-xs text-slate-400 mt-1">Unlock the full interactive console, direct WhatsApp dispatch, and BYOK capabilities.</p>
          </div>
          <div class="flex items-center gap-3">
            <a
              href="/signup"
              class="px-6 py-2.5 rounded-xl font-bold text-xs gold-btn text-slate-950 transition-all"
            >
              Deploy Full Roster
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. WHATSAPP ENGINE ARCHITECTURE -->
    <!-- ======================================================== -->
    <section id="features" class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Icon name="Shield" size={13} />
              <span>Anti-Ban Private Self-Chat Architecture</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Turn Your Personal WhatsApp Into an Autonomous Executive Assistant
            </h2>
            <p class="text-sm text-slate-300 leading-relaxed">
              No context switching. Simply send a message to yourself in WhatsApp, and our Central Brain identifies the exact tool, crafts the response, or renders custom AI images in seconds.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Icon name="Check" size={16} />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">100% Anti-Ban Guarantee</h4>
                  <p class="text-xs text-slate-400">Strictly processes self-chat ("Message Yourself"). Never messages external contacts or groups, ensuring complete compliance.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Icon name="Check" size={16} />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">High-Resolution Visual Media Synthesis</h4>
                  <p class="text-xs text-slate-400">Send <span class="text-amber-300 font-mono">/image [prompt]</span> from your smartphone to receive photorealistic concept renders right in your chat stream.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Icon name="Check" size={16} />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">Seamless Dual-Sync Parity</h4>
                  <p class="text-xs text-slate-400">Use both the Web Executive Console and your mobile WhatsApp chat interchangeably with full parity.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Graphic / Callout -->
          <div class="rounded-3xl bg-[#10121a] border border-amber-500/20 p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 class="text-base font-bold text-white border-b border-white/[0.08] pb-3">Instant WhatsApp Command Directives:</h3>
            <div class="space-y-3 font-mono text-xs">
              <div class="p-3 rounded-xl bg-[#08090d] border border-white/10 text-slate-300 flex items-center justify-between">
                <span>/image modern executive penthouse</span>
                <span class="text-amber-400 text-[10px] font-sans font-bold">Commercial Render</span>
              </div>
              <div class="p-3 rounded-xl bg-[#08090d] border border-white/10 text-slate-300 flex items-center justify-between">
                <span>"Draft 3 high-converting ad hooks"</span>
                <span class="text-amber-400 text-[10px] font-sans font-bold">Direct Response</span>
              </div>
              <div class="p-3 rounded-xl bg-[#08090d] border border-white/10 text-slate-300 flex items-center justify-between">
                <span>"INDEX/MATCH formula for Sheets"</span>
                <span class="text-amber-400 text-[10px] font-sans font-bold">Data Architecture</span>
              </div>
              <div class="p-3 rounded-xl bg-[#08090d] border border-white/10 text-slate-300 flex items-center justify-between">
                <span>/help</span>
                <span class="text-amber-400 text-[10px] font-sans font-bold">Command Directory</span>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 leading-relaxed">
              💡 <strong>Executive Architecture:</strong> Connect your personal Google AI Studio API key in your console to unlock 1,500 daily interactions at zero middleman markup.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. PRICING & MEMBERSHIP TIERS -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-20 bg-[#0c0d14] border-t border-amber-500/20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Icon name="Crown" size={13} />
            <span>Launch Special — 75% OFF</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Membership. Instant Activation.
          </h2>
          <p class="text-sm text-slate-400">
            Instant activation supporting bKash, Nagad, Rocket, Visa & Mastercard with a 3-day safety grace period.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Monthly Pro Card -->
          <div class="rounded-3xl bg-[#10121a]/90 border border-white/10 p-8 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300 shadow-xl">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">Monthly Pro</h3>
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-[#181a26] text-slate-400">Monthly</span>
              </div>
              <div class="flex items-baseline gap-1 mb-6">
                <span class="text-4xl font-extrabold text-white">BDT 499</span>
                <span class="text-xs text-slate-400">/ month</span>
              </div>
              <ul class="space-y-3 text-xs sm:text-sm text-slate-300 mb-8">
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> Full access to all 50+ AI specialists</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> Personal WhatsApp assistant pair</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> Free Gemini BYOK zero-markup engine</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> Web executive console chat</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> 24/7 technical concierge</li>
              </ul>
            </div>
            <a
              href="/signup"
              class="w-full py-3 rounded-xl bg-[#181a26] hover:bg-[#202332] border border-white/10 text-white font-bold text-xs text-center transition-all block"
            >
              Get Started with Monthly Pro
            </a>
          </div>

          <!-- Yearly VIP Card (Featured - Champagne Gold Accent) -->
          <div class="rounded-3xl bg-gradient-to-b from-[#161824] via-[#10121a] to-[#161824] border-2 border-amber-400/60 p-8 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
            <div class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg">
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
                <span class="text-4xl font-extrabold text-white">BDT 1,499</span>
                <span class="text-xs text-slate-400">/ 1st year</span>
                <span class="text-xs line-through text-slate-500">BDT 5,988</span>
              </div>
              <p class="text-[11px] text-amber-400 mb-6 font-semibold">Equal to only BDT 125/month!</p>
              <ul class="space-y-3 text-xs sm:text-sm text-slate-200 mb-8">
                <li class="flex items-center gap-2.5 font-semibold text-white"><Icon name="Check" size={16} class="text-amber-400" /> Everything in Monthly Pro</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> Priority fast-lane AI response speeds</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> Early access to all upcoming specialists</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> 3-day safety grace period protection</li>
                <li class="flex items-center gap-2.5"><Icon name="Check" size={16} class="text-amber-400" /> Dedicated VIP WhatsApp concierge</li>
              </ul>
            </div>
            <a
              href="/signup"
              class="w-full py-3.5 rounded-xl gold-btn text-slate-950 font-bold text-xs text-center transition-all block"
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
          <p class="text-xs sm:text-sm text-slate-400">Everything you need to know about EzboAgents, BYOK, and WhatsApp AI.</p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, i}
            <div class="rounded-2xl bg-[#10121a] border border-white/10 hover:border-amber-500/30 overflow-hidden transition-all">
              <button
                onclick={() => (openFaq = openFaq === i ? null : i)}
                class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-white hover:text-amber-300 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <Icon
                  name="ChevronRight"
                  size={16}
                  class="text-amber-400 shrink-0 transform transition-transform {openFaq === i ? 'rotate-90' : ''}"
                />
              </button>
              {#if openFaq === i}
                <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.06]">
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
