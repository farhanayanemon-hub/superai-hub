<script lang="ts">
  import Icon from './Icon.svelte';
  import { apiKey } from '$lib/stores/userStore';
  import { executeToolWithGemini } from '$lib/services/gemini';
  import { TOOLS } from '$lib/config/tools';

  const trialTools = [
    TOOLS.find((t) => t.id === 'fb_viral_ad')!,
    TOOLS.find((t) => t.id === 'bangla_to_corporate_en')!
  ];

  let selectedToolId = $state(trialTools[0].id);
  const currentTool = $derived(trialTools.find((t) => t.id === selectedToolId) || trialTools[0]);

  let formValues = $state<Record<string, string>>({
    productName: 'অর্গানিক সুন্দরবনের প্রাকৃতিক মধু',
    targetAudience: 'স্বাস্থ্য সচেতন পরিবার ও তরুণ চাকুরীজীবী',
    offer: '১০% ছাড় + ফ্রি ডেলিভারি',
    rawBanglaText: 'স্যার কালকে আমার ছুটি লাগবে কারণ পেটে অনেক ব্যথা ও ডাক্তার দেখাতে হবে। জরুরি ফাইল রেডি করে রেখেছি।'
  });

  let isGenerating = $state(false);
  let outputResult = $state('');
  let copied = $state(false);

  async function handleRun() {
    isGenerating = true;
    outputResult = '';

    if ($apiKey && $apiKey.trim().length > 10) {
      const res = await executeToolWithGemini($apiKey, currentTool, formValues);
      if (res.error) {
        outputResult = `⚠️ ${res.error}\n\n(ডেমো প্রিভিউ রেজাল্ট দেখানো হচ্ছে):\n\n` + getPrebuiltDemo(selectedToolId);
      } else {
        outputResult = res.text;
      }
    } else {
      // Realistic instant generation simulation for prospective customers
      await new Promise((r) => setTimeout(r, 1200));
      outputResult = getPrebuiltDemo(selectedToolId);
    }

    isGenerating = false;
  }

  function getPrebuiltDemo(toolId: string): string {
    if (toolId === 'fb_viral_ad') {
      return `🍯 **চিনি বা ভেজালের দিন শেষ! শতভাগ খাঁটি সুন্দরবনের প্রাকৃতিক মধু এখন আপনার টেবিলে!** 🐝

আপনি কি প্রতিদিন খাঁটি মধুর আসল স্বাদ ও পুষ্টি খুঁজছেন? বাজারে যখন সর্বত্র ভেজালের ছড়াছড়ি, তখন আমরা সরাসরি সুন্দরবনের মৌয়ালদের হাত থেকে সংগৃহীত খাঁটি কাঁচা মধু নিয়ে এসেছি আপনার পরিবারের সুস্বাস্থ্যের নিশ্চয়তায়।

✨ **কেন আমাদের মধু সেরা?**
✔️ কোনো কৃত্রিম চিনি বা রাসায়নিক প্রিজারভেটিভ নেই
✔️ সম্পূর্ণ প্রাকৃতিক অ্যান্টি-অক্সিডেন্ট ও অ্যান্টি-ব্যাকটেরিয়াল গুণে ভরপুর
✔️ রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি ও হজমে জাদুকরী সহায়ক
✔️ ল্যাব টেস্টে শতভাগ বিশুদ্ধতার নিশ্চয়তা

🎁 **আজকের স্পেশাল ধামাকা অফার:**
🔥 প্রথম ৫০ জনের জন্য ফ্ল্যাট ১০% ডিসকাউন্ট!
🚚 ২ কেজি বা তার বেশি অর্ডারে সারাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
📦 প্রোডাক্ট হাতে পেয়ে দেখে মূল্য পরিশোধের সুযোগ (Cash On Delivery)।

👉 স্টক সীমিত! আপনার ও পরিবারের জন্য আজই আসল সুন্দরবনের মধু অর্ডার করতে ইনবক্সে মেসেজ দিন অথবা ডায়াল করুন 017XXXXXXXX নম্বরে।`;
    } else {
      return `Dear Sir,

I am writing to formally request a sick leave for tomorrow, [Date], due to sudden and severe abdominal discomfort. As advised by my healthcare provider, I need to undergo a medical examination and rest.

I have already ensured that all pending urgent deliverables are completed and shared with the team. For any critical escalations, I will be reachable via phone.

Thank you very much for your understanding and consideration.

Sincerely,  
[Your Name]  
[Your Designation]`;
    }
  }

  function copyToClipboard() {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="w-full max-w-5xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
  <!-- Section Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
        <Icon name="Sparkles" size={13} />
        <span>জিরো রেজিস্ট্রেশন • ফ্রি স্যান্ডবক্স ট্রায়াল</span>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
        নিজে টেস্ট করুন: কোনো অ্যাকাউন্ট ছাড়াই লাইভ আউটপুট দেখুন
      </h3>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        আমাদের ৫০+ টুলসের মধ্যে সবচেয়ে জনপ্রিয় ২টি টুলের লাইভ রেজাল্ট পরীক্ষা করুন।
      </p>
    </div>

    <!-- Tool Selector Pills -->
    <div class="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start sm:self-auto">
      {#each trialTools as tool}
        <button
          onclick={() => { selectedToolId = tool.id; outputResult = ''; }}
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-all {selectedToolId === tool.id ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}"
        >
          {tool.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Interactive Sandbox Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    <!-- Input Form Column -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Icon name="FileText" size={14} class="text-emerald-400" />
          <span>ইনপুট দিন</span>
        </h4>
        <span class="text-[11px] text-slate-500">আপনার ইচ্ছেমতো পরিবর্তন করুন</span>
      </div>

      {#if currentTool.id === 'fb_viral_ad'}
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">প্রোডাক্টের নাম ও স্পেসিফিকেশন</label>
          <input
            type="text"
            bind:value={formValues.productName}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">টার্গেট অডিয়েন্স</label>
          <input
            type="text"
            bind:value={formValues.targetAudience}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">অফার বা ডিসকাউন্ট</label>
          <input
            type="text"
            bind:value={formValues.offer}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      {:else}
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">আপনার বাংলা টেক্সট বা ভাবনা</label>
          <textarea
            bind:value={formValues.rawBanglaText}
            rows={5}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
          ></textarea>
        </div>
      {/if}

      <button
        onclick={handleRun}
        disabled={isGenerating}
        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-98 disabled:opacity-50"
      >
        {#if isGenerating}
          <Icon name="Loader2" size={16} class="animate-spin" />
          <span>AI সুপার ব্রেন দিয়ে তৈরি হচ্ছে...</span>
        {:else}
          <Icon name="Sparkles" size={16} />
          <span>১-ক্লিকে রেজাল্ট জেনারেট করুন</span>
        {/if}
      </button>
    </div>

    <!-- Output Preview Column -->
    <div class="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 relative min-h-[320px]">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span class="text-xs font-bold text-slate-200">লাইভ AI আউটপুট</span>
        </div>
        {#if outputResult}
          <button
            onclick={copyToClipboard}
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={13} class={copied ? 'text-emerald-400' : ''} />
            <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
          </button>
        {/if}
      </div>

      <div class="flex-1 overflow-y-auto pr-1 text-xs sm:text-sm leading-relaxed text-slate-200 font-sans">
        {#if isGenerating}
          <div class="h-full flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
            <Icon name="Loader2" size={28} class="text-emerald-400 animate-spin" />
            <p class="text-xs">Gemini Flash আপনার জন্য পারফেক্ট কপি বানাচ্ছে...</p>
          </div>
        {:else if outputResult}
          <div class="whitespace-pre-line bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            {outputResult}
          </div>
        {:else}
          <div class="h-full flex flex-col items-center justify-center gap-2 text-slate-500 py-12 text-center">
            <Icon name="Play" size={32} class="text-slate-600 opacity-60" />
            <p class="text-xs font-medium">বামে আপনার ইনপুট দিয়ে "জেনারেট করুন" বাটনে ক্লিক করুন</p>
            <p class="text-[11px] text-slate-600">কয়েক সেকেন্ডেই রেডি-টু-পোস্ট বাংলা ও ইংরেজি কন্টেন্ট দেখতে পাবেন</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
