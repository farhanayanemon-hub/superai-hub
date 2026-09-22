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
    productName: 'Organic Wild Forest Raw Honey',
    targetAudience: 'Health-conscious families and busy professionals',
    offer: '10% OFF + Free Express Shipping',
    rawText: 'Hi boss, I need leave tomorrow because my stomach hurts badly and I have to see a doctor. I finished all urgent files and shared with John.'
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
        outputResult = `⚠️ ${res.error}\n\n(Showing Instant Preview Result):\n\n` + getPrebuiltDemo(selectedToolId);
      } else {
        outputResult = res.text;
      }
    } else {
      // Realistic instant generation simulation for prospective users
      await new Promise((r) => setTimeout(r, 1200));
      outputResult = getPrebuiltDemo(selectedToolId);
    }

    isGenerating = false;
  }

  function getPrebuiltDemo(toolId: string): string {
    if (toolId === 'fb_viral_ad') {
      return `🍯 **Pure, Unadulterated Wild Forest Raw Honey – Delivered Straight to Your Table!** 🐝

Looking for genuine, 100% pure raw honey without artificial corn syrups or preservatives? Sourced sustainably from ethical forest beekeepers, our raw honey preserves all vital enzymes, antioxidants, and immune boosters.

✨ **Why Choose Our Raw Honey?**
✔️ Zero artificial additives, chemicals, or heat processing
✔️ Rich in active bio-compounds and antibacterial properties
✔️ Promotes digestive health and natural daily vitality
✔️ Certified 100% pure by independent lab standards

🎁 **Exclusive Launch Offer:**
🔥 First 50 buyers get a Flat 10% Discount!
🚚 Free Express Delivery on orders of 2 jars or more!
📦 Cash on Delivery & 100% Money-Back Satisfaction Guarantee.

👉 Stock is strictly limited. Click Order Now or message us directly to claim your jar!`;
    } else {
      return `Dear [Manager's Name],

I am writing to formally request a single-day sick leave for tomorrow, [Date], due to sudden and severe abdominal discomfort requiring a medical examination and rest.

I have already finalized and shared all pending urgent deliverables with [Colleague's Name] to ensure complete continuity. For any critical emergencies, I will remain reachable by phone.

Thank you very much for your understanding and support.

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
        <span>Zero Registration Required • Free Sandbox</span>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
        Try It Yourself: Live Output in Seconds
      </h3>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        Test real-time generation on two of our most popular specialized AI helpers.
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
          <span>Input Parameters</span>
        </h4>
        <span class="text-[11px] text-slate-500">Edit fields to customize output</span>
      </div>

      {#if currentTool.id === 'fb_viral_ad'}
        <div>
          <label for="sandbox-product-name" class="block text-xs font-medium text-slate-300 mb-1.5">Product Name & Specs</label>
          <input
            id="sandbox-product-name"
            type="text"
            bind:value={formValues.productName}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label for="sandbox-target-audience" class="block text-xs font-medium text-slate-300 mb-1.5">Target Audience</label>
          <input
            id="sandbox-target-audience"
            type="text"
            bind:value={formValues.targetAudience}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label for="sandbox-offer" class="block text-xs font-medium text-slate-300 mb-1.5">Offer or Discount</label>
          <input
            id="sandbox-offer"
            type="text"
            bind:value={formValues.offer}
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      {:else}
        <div>
          <label for="sandbox-raw-text" class="block text-xs font-medium text-slate-300 mb-1.5">Your Casual or Draft Message</label>
          <textarea
            id="sandbox-raw-text"
            bind:value={formValues.rawText}
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
          <span>Generating with Gemini Brain...</span>
        {:else}
          <Icon name="Sparkles" size={16} />
          <span>Generate Result in 1-Click</span>
        {/if}
      </button>
    </div>

    <!-- Output Preview Column -->
    <div class="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 relative min-h-[320px]">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span class="text-xs font-bold text-slate-200">Live AI Output</span>
        </div>
        {#if outputResult}
          <button
            onclick={copyToClipboard}
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={13} class={copied ? 'text-emerald-400' : ''} />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        {/if}
      </div>

      <div class="flex-1 overflow-y-auto pr-1 text-xs sm:text-sm leading-relaxed text-slate-200 font-sans">
        {#if isGenerating}
          <div class="h-full flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
            <Icon name="Loader2" size={28} class="text-emerald-400 animate-spin" />
            <p class="text-xs">Gemini Flash is drafting your content...</p>
          </div>
        {:else if outputResult}
          <div class="whitespace-pre-line bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            {outputResult}
          </div>
        {:else}
          <div class="h-full flex flex-col items-center justify-center gap-2 text-slate-500 py-12 text-center">
            <Icon name="Play" size={32} class="text-slate-600 opacity-60" />
            <p class="text-xs font-medium">Customize your inputs on the left and click "Generate Result"</p>
            <p class="text-[11px] text-slate-600">Receive ready-to-use executive copy and formulas in seconds</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
