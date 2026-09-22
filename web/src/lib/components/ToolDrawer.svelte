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
        // Fallback simulation when no key is entered yet
        await new Promise((r) => setTimeout(r, 1400));
        outputText = `⚠️ **[Demo Mode - Gemini API Key Not Connected]**\n\nHere is a preview output based on your inputs:\n\n✨ **${$activeTool.name} Output:**\n\n1. The AI model has prepared a draft based on your parameters.\n2. For unlimited, real-time generation, click **"Set BYOK Key"** at the top and plug in your free Google AI Studio API key.\n\n💡 No credit card required, 100% free forever!`;
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
    class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity"
    onclick={closeToolDrawer}
    role="presentation"
  ></div>

  <!-- Slide-out Drawer Panel -->
  <div
    class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 overflow-hidden"
  >
    <!-- Drawer Header -->
    <div class="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Icon name={$activeTool.icon} size={20} />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-bold text-base text-white">{$activeTool.name}</h2>
            <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded-full border border-slate-700">
              {$activeTool.categoryName}
            </span>
          </div>
          <p class="text-xs text-slate-400">{$activeTool.nameEn}</p>
        </div>
      </div>

      <button
        onclick={closeToolDrawer}
        class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <Icon name="X" size={18} />
      </button>
    </div>

    <!-- Gemini Key Warning / Guide Banner -->
    {#if !$isKeyValid}
      <div class="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-xs text-amber-200">
        <div class="flex items-center gap-2">
          <Icon name="AlertCircle" size={16} class="text-amber-400 shrink-0" />
          <span>Connect your free Gemini API Key for unlimited AI generations.</span>
        </div>
        <button
          onclick={onOpenByok}
          class="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shrink-0"
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
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Icon name="FileText" size={14} class="text-emerald-400" />
            <span>Input Parameters</span>
          </h3>
          <span class="text-[11px] text-slate-500">Provide details below</span>
        </div>

        {#each $activeTool.inputs as input}
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-slate-300">
              {input.label}
              {#if input.required}
                <span class="text-rose-400">*</span>
              {/if}
            </label>

            {#if input.type === 'textarea'}
              <textarea
                bind:value={formValues[input.name]}
                rows={4}
                placeholder={input.placeholder}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 leading-relaxed"
              ></textarea>
            {:else if input.type === 'select'}
              <select
                bind:value={formValues[input.name]}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/80"
              >
                {#each input.options || [] as opt}
                  <option value={opt}>{opt}</option>
                {/each}
              </select>
            {:else}
              <input
                type="text"
                bind:value={formValues[input.name]}
                placeholder={input.placeholder}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80"
              />
            {/if}
          </div>
        {/each}

        <!-- Generate Button -->
        <button
          onclick={handleGenerate}
          disabled={isGenerating}
          class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98 disabled:opacity-50"
        >
          {#if isGenerating}
            <Icon name="Loader2" size={18} class="animate-spin" />
            <span>Processing with Gemini AI...</span>
          {:else}
            <Icon name="Sparkles" size={18} />
            <span>Generate Output</span>
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
        <div class="space-y-3 pt-4 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Result Output</span>
            </h3>

            <!-- Action Controls -->
            <div class="flex items-center gap-2">
              <button
                onclick={handleCopy}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
              >
                <Icon name={copied ? 'Check' : 'Copy'} size={13} class={copied ? 'text-emerald-400' : ''} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onclick={sendToWhatsApp}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-600/30"
              >
                <Icon name="MessageSquare" size={13} />
                <span>Send to WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Markdown Content Render -->
          <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none">
            {@html parsedHtml}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
