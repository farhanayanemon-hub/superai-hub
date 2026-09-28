<script lang="ts">
  import Icon from './Icon.svelte';
  import { activeTool, isDrawerOpen, closeToolDrawer, apiKey, isKeyValid } from '$lib/stores/userStore';
  import { executeToolWithGemini } from '$lib/services/gemini';
  import { marked } from 'marked';

  let { onOpenByok }: { onOpenByok?: () => void } = $props();

  let formValues = $state<Record<string, string>>({});
  let isGenerating = $state(false);
  let outputText = $state('');
  let errorMessage = $state('');
  let copied = $state(false);

  // Initialize input fields when activeTool changes
  $effect(() => {
    if ($activeTool) {
      outputText = '';
      errorMessage = '';
      const initial: Record<string, string> = {};
      for (const input of $activeTool.inputs) {
        initial[input.name] = input.defaultValue || '';
      }
      formValues = initial;
    }
  });

  const parsedHtml = $derived(outputText ? marked.parse(outputText) : '');

  async function handleGenerate() {
    if (!$activeTool) return;
    errorMessage = '';
    outputText = '';
    isGenerating = true;

    try {
      if ($apiKey && $apiKey.trim().length > 10) {
        const result = await executeToolWithGemini($apiKey, $activeTool, formValues);
        if (result.error) {
          errorMessage = result.error;
        } else {
          outputText = result.text;
        }
      } else {
        // When user has not yet entered their BYOK key
        outputText = `⚠️ **[Gemini API Key Required]**\n\nPlease navigate to the **Gemini BYOK Key** tab in your dashboard sidebar to add your free Google AI Studio API key.\n\n👉 Get your free key instantly here (zero cost, no credit card): https://aistudio.google.com/app/apikey`;
      }
    } catch (err: any) {
      errorMessage = err.message || 'An unexpected error occurred. Please try again.';
    } finally {
      isGenerating = false;
    }
  }

  function handleCopy() {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function sendToWhatsApp() {
    if (!outputText) return;
    const shareText = encodeURIComponent(`*${$activeTool?.name}*\n\n${outputText}`);
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  }
</script>

{#if $isDrawerOpen && $activeTool}
  <!-- Backdrop Overlay -->
  <div
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity"
    onclick={closeToolDrawer}
    role="presentation"
  ></div>

  <!-- Slide-out Drawer Panel -->
  <div
    class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#0b0c12] border-l border-amber-500/20 shadow-2xl flex flex-col transform transition-transform duration-300 overflow-hidden"
  >
    <!-- Drawer Header -->
    <div class="px-6 py-4 border-b border-white/[0.08] bg-[#10121a]/95 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-amber-500/30 p-0.5 shrink-0 shadow-md">
          <img
            src={$activeTool.agentAvatar}
            alt={$activeTool.agentName}
            class="w-full h-full object-cover rounded-lg"
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#10121a]"></span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-bold text-base text-white">{$activeTool.agentName}</h2>
            <span class="px-2.5 py-0.5 text-[10px] font-bold bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/30 tracking-wide uppercase">
              {$activeTool.agentRole}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">{$activeTool.name} • <span class="text-amber-400/80">{$activeTool.categoryName}</span></p>
        </div>
      </div>

      <button
        onclick={closeToolDrawer}
        class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        aria-label="Close Drawer"
      >
        <Icon name="X" size={18} />
      </button>
    </div>

    <!-- Gemini Key Warning / Guide Banner -->
    {#if !$isKeyValid}
      <div class="px-6 py-3 bg-amber-400/10 border-b border-amber-400/20 flex items-center justify-between gap-3 text-xs text-amber-200">
        <div class="flex items-center gap-2">
          <Icon name="AlertCircle" size={16} class="text-amber-400 shrink-0" />
          <span>Connect your private Gemini API Key for unlimited executive generations.</span>
        </div>
        <button
          onclick={onOpenByok}
          class="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shrink-0 shadow-sm"
        >
          Set Key
        </button>
      </div>
    {/if}

    <!-- Drawer Body (Inputs & Output) -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Input Parameters Form -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
            <Icon name="FileText" size={14} class="text-amber-400" />
            <span>Consultation Inputs</span>
          </h3>
          <span class="text-[11px] text-slate-500">Provide details for specialist analysis</span>
        </div>

        {#each $activeTool.inputs as input}
          <div class="space-y-1.5">
            <label for={'input-' + input.name} class="block text-xs font-medium text-slate-300">
              {input.label}
              {#if input.required}
                <span class="text-amber-400">*</span>
              {/if}
            </label>

            {#if input.type === 'textarea'}
              <textarea
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                rows={4}
                placeholder={input.placeholder}
                class="w-full bg-[#13151f] border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/20 leading-relaxed transition-all"
              ></textarea>
            {:else if input.type === 'select'}
              <select
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                class="w-full bg-[#13151f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/20 transition-all"
              >
                {#each input.options || [] as opt}
                  <option value={opt}>{opt}</option>
                {/each}
              </select>
            {:else}
              <input
                id={'input-' + input.name}
                type="text"
                bind:value={formValues[input.name]}
                placeholder={input.placeholder}
                class="w-full bg-[#13151f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            {/if}
          </div>
        {/each}

        <!-- Generate Button -->
        <button
          onclick={handleGenerate}
          disabled={isGenerating}
          class="w-full py-3.5 px-4 rounded-xl gold-btn text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          {#if isGenerating}
            <Icon name="Loader2" size={18} class="animate-spin text-slate-950" />
            <span>Consulting with {$activeTool.agentName}...</span>
          {:else}
            <Icon name="Sparkles" size={18} />
            <span>Execute Consultation</span>
          {/if}
        </button>
      </div>

      <!-- Error Box -->
      {#if errorMessage}
        <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <Icon name="AlertCircle" size={16} class="shrink-0 mt-0.5 text-rose-400" />
          <div class="flex-1 whitespace-pre-line">{errorMessage}</div>
        </div>
      {/if}

      <!-- Output Results Area -->
      {#if outputText}
        <div class="space-y-3 pt-5 border-t border-white/[0.08]">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Executive Briefing Result</span>
            </h3>

            <!-- Action Controls -->
            <div class="flex items-center gap-2">
              <button
                onclick={handleCopy}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181a24] hover:bg-[#202330] border border-white/10 text-slate-200 transition-all cursor-pointer"
              >
                <Icon name={copied ? 'Check' : 'Copy'} size={13} class={copied ? 'text-amber-400' : ''} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onclick={sendToWhatsApp}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161822] hover:bg-[#1f2230] border border-amber-500/30 text-amber-300 transition-all shadow-sm cursor-pointer"
              >
                <Icon name="MessageSquare" size={13} class="text-emerald-400" />
                <span>Dispatch to WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Markdown Content Render -->
          <div class="p-5 rounded-2xl bg-[#10121a] border border-amber-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none shadow-inner">
            {@html parsedHtml}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
