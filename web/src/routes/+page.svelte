<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { isAuthenticated } from '$lib/stores/userStore';
  import { TOOLS, CATEGORIES, type AITool } from '$lib/config/tools';

  let activeCategory = $state<string>('all');
  let searchQuery = $state<string>('');
  let openFaq = $state<number | null>(0);

  let filteredTools = $derived(
    TOOLS.filter((t: AITool) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        t.agentName.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.agentRole.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.agentTagline.toLowerCase().includes(q) ||
        (t.keywords && t.keywords.some((k: string) => k.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    })
  );

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
</script>

<svelte:head>
  <title>EzboAgents — Private AI Executive Advisory & Intelligent Automation</title>
  <meta name="description" content="Deploy an elite consortium of 50+ specialized AI executives and sync your personal WhatsApp into an autonomous command center. Zero token markup with BYOK." />
</svelte:head>

<div class="min-h-screen bg-[#06070a] text-slate-100 flex flex-col font-sans selection:bg-amber-300 selection:text-black">
  <Navbar />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION (FOCUSED, LUXURIOUS, SCREEN MOCKUP REMOVED) -->
    <!-- ======================================================== -->
    <section class="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
      <!-- Ambient Luxury Spotlights -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-[160px] pointer-events-none rounded-full"></div>
      <div class="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/5 blur-[140px] pointer-events-none rounded-full"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Top Tagline Badge -->
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0d0f17] border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-semibold shadow-lg shadow-black/60 backdrop-blur-md">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Private AI Executive Consortium • 50+ Vetted Specialists</span>
            <span class="w-1 h-1 rounded-full bg-amber-400/60"></span>
            <span class="text-white font-bold">VIP Launch Access</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            Deploy An Elite Army of <br class="hidden sm:inline" />
            <span class="gold-gradient-text font-serif italic">
              50+ Specialized AI Experts
            </span><br class="hidden sm:inline" />
            To Automate 90% of Your Work.
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Direct-response copywriters, objection closers, financial architects, and software engineers — seamlessly synchronized between your private web console and your personal WhatsApp. Powered by your free Google Gemini API with zero token markups.
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {#if $isAuthenticated}
              <a
                href="/dashboard"
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm gold-btn text-slate-950 flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <span>Enter Executive Console</span>
                <Icon name="ArrowRight" size={16} />
              </a>
            {:else}
              <a
                href="/signup"
                class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm gold-btn text-slate-950 flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <span>Deploy Your Consortium Free</span>
                <Icon name="ArrowRight" size={16} />
              </a>
              <a
                href="/login"
                class="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-sm bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 hover:border-amber-400/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Client Sign In</span>
              </a>
            {/if}
            <a
              href="#specialists"
              class="w-full sm:w-auto px-6 py-4 rounded-xl font-medium text-sm text-slate-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore 50+ Specialists</span>
              <Icon name="ChevronRight" size={15} />
            </a>
          </div>

          <!-- Trust Checkpoint Bar (Darius Lukas Style) -->
          <div class="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-white/[0.07] mt-8">
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div class="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <Icon name="CheckCircle" size={16} class="text-amber-400 shrink-0" />
                <span>50+ Field Specialists</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Covering sales, media, tech, and corporate</p>
            </div>

            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div class="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <Icon name="Shield" size={16} class="text-amber-400 shrink-0" />
                <span>Personal WhatsApp</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">100% anti-ban self-chat synchronization</p>
            </div>

            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div class="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <Icon name="Key" size={16} class="text-amber-400 shrink-0" />
                <span>Zero Token Markup</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Free 1,500 daily requests via Gemini BYOK</p>
            </div>

            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div class="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <Icon name="Zap" size={16} class="text-amber-400 shrink-0" />
                <span>Instant 60s Setup</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Immediate access • No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. DARIUS LUKAS STYLE 50+ SPECIALIST GALLERY -->
    <!-- ======================================================== -->
    <section id="specialists" class="py-24 bg-[#090b11] border-y border-white/[0.06] relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Icon name="Grid" size={13} />
            <span>Meet Your New AI Workforce</span>
          </div>
          <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            50 Specialized AI Executives
          </h2>
          <p class="text-sm sm:text-base text-slate-400">
            From virtual wordsmiths to spreadsheet wizards, our diverse AI squad covers every business task 24/7.
          </p>
        </div>

        <!-- Search & Category Filters Strip -->
        <div class="max-w-5xl mx-auto mb-10 space-y-4">
          <!-- Search Bar -->
          <div class="relative">
            <Icon name="Search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search 50+ specialists by name, role, or task (e.g., Cody, Facebook Ads, Excel, SEO, Pitch)..."
              class="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0f121b] border border-white/10 hover:border-amber-400/30 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500 shadow-inner transition-all"
            />
            {#if searchQuery}
              <button
                onclick={() => (searchQuery = '')}
                class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            {/if}
          </div>

          <!-- Category Pills -->
          <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
            {#each CATEGORIES as cat}
              <button
                onclick={() => (activeCategory = cat.id)}
                class="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer {activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'}"
              >
                <Icon name={cat.icon} size={14} />
                <span>{cat.name}</span>
              </button>
            {/each}
          </div>

          <div class="text-center text-xs text-slate-400">
            Showing <span class="font-bold text-white">{filteredTools.length}</span> of 50 Specialists
          </div>
        </div>

        <!-- 50+ Specialists Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredTools as tool}
            <div class="glass-card rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300">
              <div>
                <!-- Top: Portrait + Name + Role Badge -->
                <div class="flex items-start gap-4 mb-4">
                  <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-white/10 group-hover:border-amber-400/60 transition-all shadow-md shrink-0">
                    <img
                      src={tool.agentAvatar}
                      alt={tool.agentName}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f121b]" title="Active & Ready"></span>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-lg text-white group-hover:text-amber-200 transition-colors truncate">
                        {tool.agentName}
                      </h3>
                      {#if tool.badge}
                        <span class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase tracking-wider shrink-0">
                          {tool.badge}
                        </span>
                      {/if}
                    </div>
                    <p class="text-xs font-semibold text-amber-300/90 truncate">{tool.agentRole}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {tool.categoryName}
                    </span>
                  </div>
                </div>

                <!-- Specialization & Description -->
                <p class="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {tool.agentTagline || tool.description}
                </p>
              </div>

              <!-- Footer CTA -->
              <div class="pt-3 border-t border-white/[0.07] flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-mono">
                  {tool.inputs.length} parameters
                </span>
                <a
                  href={$isAuthenticated ? '/dashboard' : '/signup'}
                  class="flex items-center gap-1.5 text-xs font-semibold text-amber-300 group-hover:text-amber-200 group-hover:translate-x-1 transition-all"
                >
                  <span>Consult Specialist</span>
                  <Icon name="ArrowRight" size={13} />
                </a>
              </div>
            </div>
          {/each}
        </div>

        {#if filteredTools.length === 0}
          <div class="text-center py-16 text-slate-400 space-y-3">
            <Icon name="Search" size={32} class="mx-auto text-slate-600" />
            <p class="text-sm">No specialists found matching "{searchQuery}".</p>
            <button
              onclick={() => { searchQuery = ''; activeCategory = 'all'; }}
              class="px-4 py-2 rounded-xl text-xs font-bold gold-btn text-slate-950"
            >
              Reset Filters
            </button>
          </div>
        {/if}

        <!-- Bottom Roster Unlock Callout -->
        <div class="mt-16 text-center p-8 rounded-3xl bg-gradient-to-r from-[#111420] via-[#0d0f17] to-[#111420] border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div class="text-left space-y-1">
            <h4 class="text-lg font-bold text-white">Wield the entire 50+ specialist roster</h4>
            <p class="text-xs text-slate-400">All 50 agents are available on web console and synced to your personal WhatsApp.</p>
          </div>
          <a
            href={$isAuthenticated ? '/dashboard' : '/signup'}
            class="px-7 py-3 rounded-xl font-bold text-xs gold-btn text-slate-950 transition-all shrink-0"
          >
            Access All 50 Specialists
          </a>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. WHY EZBOAGENTS VS GENERIC CHATGPT (DIRECT COMPARISON) -->
    <!-- ======================================================== -->
    <section class="py-24 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Icon name="Shield" size={13} />
            <span>Why Elite Operators Choose EzboAgents</span>
          </div>
          <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Stop Staring At Blank Prompt Boxes.
          </h2>
          <p class="text-sm sm:text-base text-slate-400">
            Standard AI chatbots provide generic answers. EzboAgents deploys domain-specific, pre-calibrated executives that know exactly what to produce.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <!-- The Generic Way (Red/Grey muted) -->
          <div class="rounded-3xl bg-white/[0.02] border border-white/10 p-8 space-y-6">
            <div class="flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                ✕
              </div>
              <div>
                <h3 class="font-bold text-lg text-white">Standard ChatGPT & Copilots</h3>
                <p class="text-xs text-slate-400">Generic, unfocused conversational bots</p>
              </div>
            </div>

            <ul class="space-y-4 text-xs sm:text-sm text-slate-400">
              <li class="flex items-start gap-3">
                <span class="text-rose-400 font-bold mt-0.5">✕</span>
                <span><strong>Blank Prompt Paralysis:</strong> You have to figure out how to engineer complex prompts from scratch every single time.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-rose-400 font-bold mt-0.5">✕</span>
                <span><strong>Robotic & Generic Output:</strong> Hallucinates generic fluff that sounds like AI and lacks sales psychology or real domain nuance.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-rose-400 font-bold mt-0.5">✕</span>
                <span><strong>High Monthly Subscriptions:</strong> Costs \$20–\$30/month per seat, recurring forever with no regional pricing.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-rose-400 font-bold mt-0.5">✕</span>
                <span><strong>Browser Only:</strong> You cannot run them inside your personal mobile WhatsApp without expensive 3rd-party webhook setups.</span>
              </li>
            </ul>
          </div>

          <!-- The EzboAgents Way (Champagne Gold Glow) -->
          <div class="rounded-3xl bg-gradient-to-b from-[#131624] via-[#0d0f17] to-[#131624] border-2 border-amber-400/50 p-8 space-y-6 relative shadow-2xl shadow-amber-500/10">
            <div class="flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <div class="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
                ✓
              </div>
              <div>
                <h3 class="font-bold text-lg text-white flex items-center gap-2">
                  <span>EzboAgents Executive Consortium</span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">Superior</span>
                </h3>
                <p class="text-xs text-amber-300/80">50 calibrated senior executives at your command</p>
              </div>
            </div>

            <ul class="space-y-4 text-xs sm:text-sm text-slate-200">
              <li class="flex items-start gap-3">
                <span class="text-amber-400 font-bold mt-0.5">✓</span>
                <span><strong>50 Calibrated Specialists:</strong> Each agent arrives pre-trained with hundreds of pages of real industry frameworks, copy systems, and Excel models.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-amber-400 font-bold mt-0.5">✓</span>
                <span><strong>Personal WhatsApp Sync:</strong> Chat with any specialist directly in WhatsApp via private self-chat with zero ban risk.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-amber-400 font-bold mt-0.5">✓</span>
                <span><strong>Zero Token Markup (BYOK):</strong> Connect your free Google Gemini API key and get 1,500 requests per day with zero middleman fees.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-amber-400 font-bold mt-0.5">✓</span>
                <span><strong>Instant Visual Media (/image):</strong> Generate photorealistic commercial assets and mockups directly inside WhatsApp and web.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. WHATSAPP ENGINE ARCHITECTURE -->
    <!-- ======================================================== -->
    <section id="features" class="py-24 bg-[#090b11] border-y border-white/[0.06] relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Icon name="MessageSquare" size={13} />
            <span>Autonomous WhatsApp Integration</span>
          </div>
          <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Turn Your Personal WhatsApp Into an Autonomous Executive
          </h2>
          <p class="text-sm sm:text-base text-slate-400">
            No app switching required. Chat with yourself in WhatsApp and our Central Brain router delegates to the right specialist in seconds.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-bold text-lg">
              01
            </div>
            <h3 class="text-lg font-bold text-white">Scan Private QR Code</h3>
            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pair your personal WhatsApp in less than 10 seconds via our secure multi-device Baileys socket link. No API verification delays.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-bold text-lg">
              02
            </div>
            <h3 class="text-lg font-bold text-white">Message Yourself Anytime</h3>
            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Open your own chat ("Message Yourself") on your phone. Send questions, ask for Excel formulas, or type <span class="text-amber-300 font-mono font-bold">/image</span> for commercial renders.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="glass-card rounded-2xl p-6 space-y-4">
            <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-bold text-lg">
              03
            </div>
            <h3 class="text-lg font-bold text-white">Instant Specialist Execution</h3>
            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The Central Brain identifies the exact persona, drafts the executive-level response, and replies back to your phone with authentic composing speed.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 5. PRICING & MEMBERSHIP TIERS (DARIUS LUKAS STYLE) -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-24 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Icon name="Crown" size={13} />
            <span>Inaugural VIP Launch — 75% OFF</span>
          </div>
          <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Transparent Pricing. Instant Activation.
          </h2>
          <p class="text-sm sm:text-base text-slate-400">
            Pay once, keep access. Supporting bKash, Nagad, Rocket, Visa & Mastercard with a 3-day safety grace period.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Monthly Pro Card -->
          <div class="rounded-3xl bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between hover:border-amber-400/30 transition-all duration-300 shadow-xl">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">Monthly Pro</h3>
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] text-slate-400">Monthly</span>
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
              class="w-full py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs text-center transition-all block"
            >
              Get Started with Monthly Pro
            </a>
          </div>

          <!-- Yearly VIP Card (Featured - Champagne Gold Accent) -->
          <div class="rounded-3xl bg-gradient-to-b from-[#161928] via-[#0e111a] to-[#161928] border-2 border-amber-400/60 p-8 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
            <div class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg">
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
              <p class="text-[11px] text-amber-300 mb-6 font-semibold">Equal to only BDT 125/month!</p>
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
              class="w-full py-4 rounded-xl gold-btn text-slate-950 font-bold text-xs text-center transition-all block shadow-lg"
            >
              Claim 75% Launch Offer
            </a>
          </div>
        </div>

        <!-- Payment Methods Trust Badge -->
        <div class="mt-12 text-center text-xs text-slate-400 space-y-2">
          <p>Instant Activation Guaranteed • 100% Secure Checkout</p>
          <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
            <span class="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10">bKash</span>
            <span class="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10">Nagad</span>
            <span class="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10">Rocket</span>
            <span class="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10">Visa / Mastercard</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 6. FAQ SECTION -->
    <!-- ======================================================== -->
    <section id="faq" class="py-24 bg-[#090b11] border-t border-white/[0.06] relative">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 space-y-3">
          <h2 class="text-2xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p class="text-xs sm:text-sm text-slate-400">Everything you need to know about EzboAgents, BYOK, and WhatsApp AI.</p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, i}
            <div class="rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-400/30 overflow-hidden transition-all">
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
