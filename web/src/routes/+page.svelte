<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import WhatsAppSimulator from '$lib/components/WhatsAppSimulator.svelte';
  import SandboxTrial from '$lib/components/SandboxTrial.svelte';
  import ToolCard from '$lib/components/ToolCard.svelte';
  import ToolDrawer from '$lib/components/ToolDrawer.svelte';
  import BYOKModal from '$lib/components/BYOKModal.svelte';
  import QRModal from '$lib/components/QRModal.svelte';
  import PricingTable from '$lib/components/PricingTable.svelte';
  import Footer from '$lib/components/Footer.svelte';

  import { TOOLS, CATEGORIES, type AITool } from '$lib/config/tools';
  import { activeCategory, searchQuery } from '$lib/stores/userStore';

  let byokModalOpen = $state(false);
  let qrModalOpen = $state(false);

  // FAQ state
  let openFaq = $state<number | null>(0);

  const faqs = [
    {
      q: 'What is BYOK (Bring Your Own Key) and is Gemini API truly free?',
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

  const filteredTools = $derived(
    TOOLS.filter((tool) => {
      const matchCategory = $activeCategory === 'all' || tool.category === $activeCategory;
      const query = $searchQuery.toLowerCase().trim();
      if (!query) return matchCategory;

      const matchText =
        tool.name.toLowerCase().includes(query) ||
        tool.nameEn.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.keywords.some((k) => k.toLowerCase().includes(query));

      return matchCategory && matchText;
    })
  );
</script>

<svelte:head>
  <title>SuperAI Hub - 50+ AI Helpers & WhatsApp Personal Assistant</title>
  <meta name="description" content="Access 50+ specialized AI tools from an intuitive dashboard and use your personal WhatsApp inbox as an AI assistant. BYOK Free Gemini model." />
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
  <!-- Navbar -->
  <Navbar
    onOpenByok={() => (byokModalOpen = true)}
    onOpenQr={() => (qrModalOpen = true)}
  />

  <main class="flex-1">
    <!-- ======================================================== -->
    <!-- 1. HERO SECTION -->
    <!-- ======================================================== -->
    <section class="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      <!-- Glow Gradients -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/15 blur-[120px] pointer-events-none rounded-full"></div>
      <div class="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-teal-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Hero Header -->
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <!-- Top Tagline Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/10 backdrop-blur-md">
            <Icon name="Sparkles" size={15} />
            <span>All-in-One AI Micro-SaaS Platform • Bring Your Own Key</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span class="text-amber-300">75% Launch Offer</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
            50+ Specialized AI Helpers <br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Now Inside Your WhatsApp Inbox!
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            No complicated app downloads or complex prompt engineering. Message yourself on WhatsApp—our central AI brain automatically executes the right tool and delivers ready-to-use output.
          </p>

          <!-- CTAs Bar -->
          <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Icon name="Sparkles" size={18} />
              <span>Claim 1-Year VIP for only BDT 1,499</span>
            </a>

            <a
              href="#simulator"
              class="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Icon name="Play" size={16} class="text-emerald-400" />
              <span>Watch Live WhatsApp Demo</span>
            </a>
          </div>

          <!-- Trust Badges Strip -->
          <div class="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <Icon name="Shield" size={16} class="text-emerald-400" />
              <span>100% Anti-Ban Self-Chat</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Key" size={16} class="text-cyan-400" />
              <span>Free Gemini API Key (BYOK)</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} class="text-teal-400" />
              <span>50+ Pre-Built Business Helpers</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Image" size={16} class="text-purple-400" />
              <span>Flux / Pollinations Image Gen</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 2. WHATSAPP SIMULATOR & FEATURES SHOWCASE -->
    <!-- ======================================================== -->
    <section id="simulator" class="py-20 bg-slate-950 border-t border-slate-900 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left Value Narrative -->
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Icon name="Bot" size={14} />
              <span>Zero-Friction WhatsApp Assistant</span>
            </div>

            <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Message Your Own Inbox, <br />
              <span class="text-emerald-400">Let SuperAI Brain Handle The Rest!</span>
            </h2>

            <p class="text-sm sm:text-base text-slate-400 leading-relaxed">
              Tired of logging into multiple apps and copy-pasting prompts back and forth? SuperAI Hub turns your private WhatsApp inbox into an executive personal assistant.
            </p>

            <!-- Feature Bullet Cards -->
            <div class="space-y-4 pt-2">
              <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Megaphone" size={18} />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">Intent-Aware Central Brain Router</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                    Say "Write an ad" and it triggers the ad copywriter; say "Sick leave email" and it drafts a corporate email—the central brain selects the best tool automatically.
                  </p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Image" size={18} />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">Instant Text-to-Image Generation</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                    Simply send <code class="text-purple-300 font-mono">/image futuristic car</code>, and high-resolution visuals are delivered directly into your WhatsApp chat.
                  </p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Shield" size={18} />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">Strict Anti-Ban & Privacy Guardrails</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                    Your account is completely secure. The bot operates solely within your "Message Yourself" chat and completely ignores third-party messages and groups.
                  </p>
                </div>
              </div>
            </div>

            <!-- Try simulator CTA button -->
            <div class="pt-2">
              <button
                onclick={() => (qrModalOpen = true)}
                class="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Icon name="QrCode" size={16} />
                <span>Connect Your WhatsApp Account</span>
              </button>
            </div>
          </div>

          <!-- Right Interactive Simulator Frame -->
          <div class="lg:col-span-6">
            <WhatsAppSimulator />
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 3. FREE INTERACTIVE SANDBOX TRIAL -->
    <!-- ======================================================== -->
    <section id="sandbox" class="py-20 bg-slate-950/60 border-t border-slate-900 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SandboxTrial />
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 4. 50+ TOOLS SHOWCASE & LIVE FILTER -->
    <!-- ======================================================== -->
    <section id="tools" class="py-20 bg-slate-950 border-t border-slate-900 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center space-y-4 max-w-3xl mx-auto mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Icon name="Grid" size={13} />
            <span>50+ Professional AI Helpers</span>
          </div>

          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Find the Perfect AI Tool in Seconds
          </h2>

          <p class="text-sm sm:text-base text-slate-400">
            E-Commerce Sales, Social Media, Career Growth, and Coding—click any tool card to execute in real-time.
          </p>

          <!-- Search Input Box -->
          <div class="pt-2 max-w-xl mx-auto">
            <div class="relative flex items-center">
              <Icon name="Search" size={18} class="absolute left-4 text-slate-500" />
              <input
                type="text"
                bind:value={$searchQuery}
                placeholder="Search tools by title, keyword, or problem (e.g., Facebook Ad, Excel, Email, Resume)..."
                class="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 shadow-lg shadow-black/20"
              />
              {#if $searchQuery}
                <button
                  onclick={() => ($searchQuery = '')}
                  class="absolute right-4 text-slate-500 hover:text-slate-300"
                >
                  <Icon name="X" size={16} />
                </button>
              {/if}
            </div>
          </div>
        </div>

        <!-- Category Tabs Filter -->
        <div class="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {#each CATEGORIES as cat}
            <button
              onclick={() => ($activeCategory = cat.id)}
              class="shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 {$activeCategory === cat.id ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}"
            >
              <Icon name={cat.icon} size={15} />
              <span>{cat.name}</span>
              {#if cat.count}
                <span class="px-1.5 py-0.2 rounded-full text-[10px] {$activeCategory === cat.id ? 'bg-emerald-900/40 text-emerald-950 font-bold' : 'bg-slate-800 text-slate-400'}">
                  {cat.count}
                </span>
              {/if}
            </button>
          {/each}
        </div>

        <!-- Tool Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {#each filteredTools as tool (tool.id)}
            <ToolCard {tool} />
          {/each}
        </div>

        {#if filteredTools.length === 0}
          <div class="text-center py-16 text-slate-500 space-y-3">
            <Icon name="Search" size={36} class="mx-auto text-slate-600 opacity-60" />
            <p class="text-sm font-semibold text-slate-400">No tools matched "{$searchQuery}"</p>
            <button
              onclick={() => { $searchQuery = ''; $activeCategory = 'all'; }}
              class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-slate-800"
            >
              Reset Filter & Show All Tools
            </button>
          </div>
        {/if}
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 5. PRICING & SUBSCRIPTION SECTION -->
    <!-- ======================================================== -->
    <section id="pricing" class="py-20 bg-slate-950/70 border-t border-slate-900 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingTable />
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- 6. FREQUENTLY ASKED QUESTIONS (FAQ) -->
    <!-- ======================================================== -->
    <section class="py-20 bg-slate-950 border-t border-slate-900 relative">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-3 mb-12">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Icon name="HelpCircle" size={13} />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 class="text-3xl font-extrabold text-white tracking-tight">
            Got Questions? We Have Answers
          </h2>
          <p class="text-sm text-slate-400">
            Everything you need to know about SuperAI Hub and WhatsApp integration.
          </p>
        </div>

        <div class="space-y-3">
          {#each faqs as faq, idx}
            <div class="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all">
              <button
                onclick={() => (openFaq = openFaq === idx ? null : idx)}
                class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-white hover:text-emerald-300 transition-colors"
              >
                <span>{faq.q}</span>
                <Icon
                  name={openFaq === idx ? 'X' : 'ChevronRight'}
                  size={16}
                  class="text-emerald-400 shrink-0 transform transition-transform {openFaq === idx ? 'rotate-90' : ''}"
                />
              </button>

              {#if openFaq === idx}
                <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                  {faq.a}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <Footer />

  <!-- Dynamic Tool Execution Drawer -->
  <ToolDrawer onOpenByok={() => (byokModalOpen = true)} />

  <!-- Modals -->
  <BYOKModal isOpen={byokModalOpen} onClose={() => (byokModalOpen = false)} />
  <QRModal isOpen={qrModalOpen} onClose={() => (qrModalOpen = false)} />
</div>
