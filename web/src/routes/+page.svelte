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
      q: 'BYOK (Bring Your Own Key) কী এবং Gemini API কি সত্যিই ১০০% ফ্রি?',
      a: 'হ্যাঁ, Google AI Studio প্রত্যেক ব্যবহারকারীকে সম্পূর্ণ ফ্রিতে নিজস্ব Gemini 1.5/2.0 Flash API Key প্রদান করে, যা দিয়ে প্রতিদিন ১৫০০টিরও বেশি রিকোয়েস্ট কোনো খরচ বা ক্রেডিট কার্ড ছাড়াই পাঠানো যায়। এই মডেলের কারণে প্ল্যাটফর্মের কোনো সার্ভার-টোকেন বিলিং খরচ নেই এবং ব্যবহারকারী আনলিমিটেড স্পিডে ব্যবহার করতে পারেন।'
    },
    {
      q: 'আমার WhatsApp নম্বর ব্যান হওয়ার কোনো ঝুঁকি আছে কি?',
      a: 'বিন্দুমাত্র কোনো ঝুঁকি নেই! SuperAI Hub কোনো স্প্যামিং বা বাল্ক মেসেজিং প্ল্যাটফর্ম নয়। আমাদের Baileys ইঞ্জিন শুধুমাত্র ব্যবহারকারীর নিজের সেন্ড করা সেলফ-মেসেজ (Message Yourself চ্যাট) মনিটর করে। অন্য কোনো পরিচিত বা অপরিচিত ব্যক্তি কিংবা গ্রুপে বট কখনোই অটোমেটিক মেসেজ দেয় না এবং মানুষের স্বাভাবিক টাইপিং স্পিড (২-৩ সেকেন্ড কম্পোজিং ডিলে) অনুকরণ করে।'
    },
    {
      q: '৫০+ টুলস এবং WhatsApp বট কি মোবাইল থেকেই চালানো যাবে?',
      a: 'অবশ্যই! আমাদের ওয়েব ড্যাশবোর্ড সম্পূর্ণ মোবাইল-অপটিমাইজড। আর একবার WhatsApp কানেক্ট করে নিলে আপনার ওয়েব ব্রাউজার খোলারও প্রয়োজন পড়বে না—সরাসরি ফোনের WhatsApp-এই ৫০টি টুল এবং ইমেজ জেনারেটর ব্যবহার করতে পারবেন।'
    },
    {
      q: 'বাৎসরিক প্ল্যানের ৭৫% ডিসকাউন্ট অফার কতদিন থাকবে?',
      a: 'এটি আমাদের অফিসিয়াল লঞ্চ ক্যাম্পেইন অফার। প্রথম বছরের জন্য মাত্র ৳১,৪৯৯ তে সম্পূর্ণ অ্যাক্সেস পাওয়া যাবে (যা মাসিক ৳১২৫ এর সমান)। প্রথম বছর শেষে পরবর্তী বছরগুলো থেকে রেগুলার মূল্য ৳২,৯৯৯/বছর প্রযোজ্য হবে।'
    },
    {
      q: 'কীভাবে পেমেন্ট করব এবং অ্যাক্টিভেশন কতক্ষণ লাগে?',
      a: 'bKash, Nagad, Rocket কিংবা ডেবিট/ক্রেডিট কার্ড দিয়ে পেমেন্ট করা মাত্রই স্বয়ংক্রিয়ভাবে অ্যাকাউন্ট অ্যাক্টিভ হয়ে যায়। পাশাপাশি যেকোনো প্রয়োজনে ৩ দিনের গ্রেস পিরিয়ড সুরক্ষা থাকছে।'
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
  <title>SuperAI Hub - ৫০+ AI হেল্পার ও নিজস্ব WhatsApp অ্যাসিস্ট্যান্ট</title>
  <meta name="description" content="একটি ড্যাশবোর্ড থেকে ৫০+ AI টুলস এবং নিজস্ব WhatsApp ইনবক্সে সরাসরি AI অ্যাসিস্ট্যান্ট। BYOK ফ্রি Gemini মডেল।" />
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
            <span>অল-ইন-ওয়ান AI Micro-SaaS প্ল্যাটফর্ম • Bring Your Own Key</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span class="text-amber-300">৭৫% লঞ্চ অফার</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
            ৫০+ স্পেশালাইজড AI হেল্পার <br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              এখন আপনার WhatsApp ইনবক্সে!
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            কোনো আলাদা জটিল অ্যাপ ডাউনলোড বা প্রম্পট লেখার ঝামেলা নেই। নিজের WhatsApp এ বাংলায় মেসেজ দিন—সেন্ট্রাল AI ব্রেন অটোমেটিক কাজ করে সঠিক আউটপুট বুঝিয়ে দেবে।
          </p>

          <!-- CTAs Bar -->
          <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Icon name="Sparkles" size={18} />
              <span>মাত্র ৳১,৪৯৯ তে ১ বছরের VIP নিন</span>
            </a>

            <a
              href="#simulator"
              class="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Icon name="Play" size={16} class="text-emerald-400" />
              <span>লাইভ WhatsApp ডেমো দেখুন</span>
            </a>
          </div>

          <!-- Trust Badges Strip -->
          <div class="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <Icon name="Shield" size={16} class="text-emerald-400" />
              <span>১০০% ব্যান-প্রটেক্টেড সেলফ চ্যাট</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Key" size={16} class="text-cyan-400" />
              <span>ফ্রি Gemini API Key (BYOK)</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} class="text-teal-400" />
              <span>৫০+ রেডি-মেড বিজনেস টুলস</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="Image" size={16} class="text-purple-400" />
              <span>Pollinations / Flux ছবি জেনারেশন</span>
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
              নিজের ইনবক্সে মেসেজ দিন, <br />
              <span class="text-emerald-400">বাকি দায়িত্ব SuperAI ব্রেনের!</span>
            </h2>

            <p class="text-sm sm:text-base text-slate-400 leading-relaxed">
              আপনি কি বারবার বিভিন্ন AI অ্যাপে লগইন করে প্রম্পট কপি-পেস্ট করতে করতে ক্লান্ত? SuperAI Hub দিয়ে আপনার নিজস্ব WhatsApp ইনবক্সকে বানিয়ে ফেলুন একটি অল-ইন-ওয়ান এক্সিকিউটিভ অ্যাসিস্ট্যান্ট।
            </p>

            <!-- Feature Bullet Cards -->
            <div class="space-y-4 pt-2">
              <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Megaphone" size={18} />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">ইনটেন্ট-অ্যাওয়ার সেন্ট্রাল ব্রেন রাউটার</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                    "বিজ্ঞাপন লিখে দাও" লিখলে অ্যাড টুল, "বসের ছুটির দরখাস্ত" লিখলে ইমেইল টুল—ব্রেন নিজে নিজেই সেরা ফরম্যাটে উত্তর তৈরি করে দেয়।
                  </p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Image" size={18} />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">ইনস্ট্যান্ট টেক্সট-টু-ইমেজ জেনারেশন</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                    শুধু লিখুন <code class="text-purple-300 font-mono">/image futuristic car</code> বা বাংলায় ছবির বর্ণনা দিন, সঙ্গে সঙ্গে হাই-রেজ্যুলিউশন ছবি আপনার হোয়াটসঅ্যাপে পৌঁছে যাবে।
                  </p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
                <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Shield" size={18} />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white">কঠোর অ্যান্টি-ব্যান ও প্রাইভেসি ফিল্টার</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                    আপনার নম্বর সম্পূর্ণ নিরাপদ। বট শুধুমাত্র আপনার "Message Yourself" ইনবক্স ফিল্টার করে, তৃতীয় পক্ষের মেসেজ বা গ্রুপ সম্পূর্ণ উপেক্ষা করে।
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
                <span>আপনার WhatsApp অ্যাকাউন্ট কানেক্ট করুন</span>
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
            <span>৫০+ প্রোফেশনাল AI হেল্পার</span>
          </div>

          <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            কাজের জন্য সঠিক AI টুল খুঁজুন নিমেষেই
          </h2>

          <p class="text-sm sm:text-base text-slate-400">
            F-Commerce সেলস, সোশ্যাল মিডিয়া, কর্পোরেট ক্যারিয়ার ও কোডিং—যেকোনো কার্ডে ক্লিক করে লাইভ এক্সিকিউট করুন।
          </p>

          <!-- Search Input Box -->
          <div class="pt-2 max-w-xl mx-auto">
            <div class="relative flex items-center">
              <Icon name="Search" size={18} class="absolute left-4 text-slate-500" />
              <input
                type="text"
                bind:value={$searchQuery}
                placeholder="টুলের নাম বা কাজের বিবরণ লিখে সার্চ করুন (যেমন: ফেসবুক অ্যাড, এক্সেল, ইমেইল, সিভি)..."
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
            <p class="text-sm font-semibold text-slate-400">"{$searchQuery}" এর সাথে কোনো টুল মেলেনি</p>
            <button
              onclick={() => { $searchQuery = ''; $activeCategory = 'all'; }}
              class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-slate-800"
            >
              সব টুলস আবার দেখান
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
            <span>সচরাচর জিজ্ঞাসা</span>
          </div>
          <h2 class="text-3xl font-extrabold text-white tracking-tight">
            আপনার মনের প্রশ্নগুলোর উত্তর
          </h2>
          <p class="text-sm text-slate-400">
            SuperAI Hub সম্পর্কে বিস্তারিত জানুন।
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
