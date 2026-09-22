<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import ToolCard from '$lib/components/ToolCard.svelte';
  import ToolDrawer from '$lib/components/ToolDrawer.svelte';
  import BYOKModal from '$lib/components/BYOKModal.svelte';
  import QRModal from '$lib/components/QRModal.svelte';

  import { TOOLS, CATEGORIES, type AITool } from '$lib/config/tools';
  import {
    apiKey,
    isKeyValid,
    whatsappStatus,
    activeCategory,
    searchQuery,
    subscription
  } from '$lib/stores/userStore';

  let byokModalOpen = $state(false);
  let qrModalOpen = $state(false);

  // Quick stats
  const totalToolsCount = TOOLS.length;

  const filteredTools = $derived(
    TOOLS.filter((tool) => {
      const matchCategory = $activeCategory === 'all' || tool.category === $activeCategory;
      const query = $searchQuery.toLowerCase().trim();
      if (!query) return matchCategory;

      return (
        matchCategory &&
        (tool.name.toLowerCase().includes(query) ||
          tool.nameEn.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.keywords.some((k) => k.toLowerCase().includes(query)))
      );
    })
  );
</script>

<svelte:head>
  <title>User Dashboard • SuperAI Hub</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
  <!-- Top Dashboard Navigation -->
  <header class="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Icon name="Sparkles" class="text-emerald-400" size={18} />
            </div>
          </div>
          <div>
            <span class="font-bold text-base text-white">Super<span class="text-emerald-400">AI</span> Hub</span>
            <span class="ml-1.5 px-2 py-0.2 text-[10px] font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">Workspace</span>
          </div>
        </a>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex items-center gap-3">
        <!-- Gemini Key Badge Button -->
        <button
          onclick={() => (byokModalOpen = true)}
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all {$isKeyValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'}"
        >
          <span class="w-2 h-2 rounded-full {$isKeyValid ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
          <Icon name="Key" size={13} />
          <span>{$isKeyValid ? 'Gemini API সক্রিয়' : 'কী নেই (সেট করুন)'}</span>
        </button>

        <!-- WhatsApp Status Button -->
        <button
          onclick={() => (qrModalOpen = true)}
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all {$whatsappStatus === 'connected' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'}"
        >
          <Icon name="QrCode" size={13} class={$whatsappStatus === 'connected' ? 'text-emerald-400' : 'text-slate-400'} />
          <span>{$whatsappStatus === 'connected' ? 'WhatsApp লাইভ' : 'কানেক্ট WhatsApp'}</span>
        </button>

        <!-- Landing Page Home Link -->
        <a
          href="/"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
          title="হোম পেজে যান"
        >
          <Icon name="ExternalLink" size={16} />
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Status & Overview Metrics Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: BYOK Gemini Key -->
      <div
        onclick={() => (byokModalOpen = true)}
        class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
      >
        <div class="space-y-1">
          <p class="text-xs text-slate-400 font-medium">Gemini BYOK ইঞ্জিন</p>
          <h4 class="font-bold text-sm text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full {$isKeyValid ? 'bg-emerald-400' : 'bg-rose-500'}"></span>
            <span>{$isKeyValid ? 'কানেক্টেড (ফ্রি কী)' : 'কী যুক্ত করুন'}</span>
          </h4>
          <p class="text-[11px] text-slate-500">Google AI Studio 1.5 Flash</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
          <Icon name="Key" size={18} />
        </div>
      </div>

      <!-- Card 2: WhatsApp Session -->
      <div
        onclick={() => (qrModalOpen = true)}
        class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
      >
        <div class="space-y-1">
          <p class="text-xs text-slate-400 font-medium">WhatsApp পার্সোনাল বট</p>
          <h4 class="font-bold text-sm text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full {$whatsappStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
            <span>{$whatsappStatus === 'connected' ? 'অনলাইন (Self-Chat)' : 'ডিসকানেক্টেড'}</span>
          </h4>
          <p class="text-[11px] text-slate-500">Anti-Ban Baileys Protocol</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
          <Icon name="QrCode" size={18} />
        </div>
      </div>

      <!-- Card 3: Subscription Plan -->
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-xs text-slate-400 font-medium">সাবস্ক্রিপশন স্ট্যাটাস</p>
          <h4 class="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
            <Icon name="Crown" size={14} />
            <span>{$subscription.plan === 'yearly' ? 'Yearly VIP Plan' : 'Monthly Pro'}</span>
          </h4>
          <p class="text-[11px] text-slate-500">সব ৫০+ ফিচার আনলকড</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <Icon name="CheckCircle2" size={18} />
        </div>
      </div>

      <!-- Card 4: Total Tools -->
      <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-xs text-slate-400 font-medium">অ্যাক্টিভ AI টুলস</p>
          <h4 class="font-bold text-lg text-white font-mono">{totalToolsCount} টি টুলস</h4>
          <p class="text-[11px] text-slate-500">৪টি স্পেশালাইজড ক্যাটাগরি</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
          <Icon name="Grid" size={18} />
        </div>
      </div>
    </div>

    <!-- Interactive Setup Guide Banner (If API key is missing) -->
    {#if !$isKeyValid}
      <div class="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Icon name="Key" size={22} />
          </div>
          <div>
            <h3 class="font-bold text-base text-white">আপনার ফ্রি Gemini API Key সেট করুন</h3>
            <p class="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Google AI Studio থেকে সম্পূর্ণ ফ্রিতে ১ মিনিটের মধ্যে API Key নেওয়া যায়। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই। কী যুক্ত করলে ৫০টি ওয়েব টুল ও হোয়াটসঅ্যাপে আনলিমিটেড ব্যবহার করতে পারবেন।
            </p>
          </div>
        </div>

        <button
          onclick={() => (byokModalOpen = true)}
          class="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Icon name="Check" size={16} />
          <span>ফ্রি কী যোগ করুন</span>
        </button>
      </div>
    {/if}

    <!-- 50+ Tools Workspace Section -->
    <div class="space-y-6">
      <!-- Search & Filters Toolbar -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Icon name="Search" size={16} class="absolute left-3.5 text-slate-500" />
          <input
            type="text"
            bind:value={$searchQuery}
            placeholder="৫০টি টুলের মধ্যে সার্চ করুন (যেমন: ফেসবুক অ্যাড, এক্সেল, ইমেইল)..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {#if $searchQuery}
            <button
              onclick={() => ($searchQuery = '')}
              class="absolute right-3.5 text-slate-500 hover:text-slate-300"
            >
              <Icon name="X" size={14} />
            </button>
          {/if}
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {#each CATEGORIES as cat}
            <button
              onclick={() => ($activeCategory = cat.id)}
              class="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 {$activeCategory === cat.id ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}"
            >
              <Icon name={cat.icon} size={14} />
              <span>{cat.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Tools Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {#each filteredTools as tool (tool.id)}
          <ToolCard {tool} />
        {/each}
      </div>

      {#if filteredTools.length === 0}
        <div class="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
          <Icon name="Search" size={36} class="mx-auto text-slate-600 opacity-60" />
          <p class="text-sm font-semibold text-slate-400">কোনো টুল মেলেনি</p>
          <button
            onclick={() => { $searchQuery = ''; $activeCategory = 'all'; }}
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-emerald-400 hover:bg-slate-700"
          >
            সব টুলস ফিল্টার রিসেট করুন
          </button>
        </div>
      {/if}
    </div>
  </main>

  <!-- Execution Drawer -->
  <ToolDrawer onOpenByok={() => (byokModalOpen = true)} />

  <!-- Modals -->
  <BYOKModal isOpen={byokModalOpen} onClose={() => (byokModalOpen = false)} />
  <QRModal isOpen={qrModalOpen} onClose={() => (qrModalOpen = false)} />
</div>
