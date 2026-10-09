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
    class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
    onclick={closeToolDrawer}
    role="presentation"
  ></div>

  <!-- Slide-out Drawer Panel -->
  <div
    class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 overflow-hidden"
  >
    <!-- Drawer Header -->
    <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/95 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-blue-200 p-0.5 shrink-0 shadow-xs">
          <img
            src={$activeTool.agentAvatar}
            alt={$activeTool.agentName}
            class="w-full h-full object-cover rounded-lg"
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-bold text-base text-slate-900">{$activeTool.agentName}</h2>
            <span class="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200 tracking-wide uppercase">
              {$activeTool.agentRole}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">{$activeTool.name} • <span class="text-blue-600 font-medium">{$activeTool.categoryName}</span></p>
        </div>
      </div>

      <button
        onclick={closeToolDrawer}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        aria-label="Close Drawer"
      >
        <Icon name="X" size={18} />
      </button>
    </div>

    <!-- Gemini Key Warning / Guide Banner -->
    {#if !$isKeyValid}
      <div class="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-3 text-xs text-blue-900">
        <div class="flex items-center gap-2">
          <Icon name="AlertCircle" size={16} class="text-blue-600 shrink-0" />
          <span>Connect your private Gemini API Key for unlimited executive generations.</span>
        </div>
        <button
          onclick={onOpenByok}
          class="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
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
          <h3 class="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <Icon name="FileText" size={14} class="text-blue-600" />
            <span>Consultation Inputs</span>
          </h3>
          <span class="text-[11px] text-slate-400">Provide details for specialist analysis</span>
        </div>

        {#each $activeTool.inputs as input}
          <div class="space-y-1.5">
            <label for={'input-' + input.name} class="block text-xs font-medium text-slate-700">
              {input.label}
              {#if input.required}
                <span class="text-blue-600">*</span>
              {/if}
            </label>

            {#if input.type === 'textarea'}
              <textarea
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                rows={4}
                placeholder={input.placeholder}
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 leading-relaxed transition-all"
              ></textarea>
            {:else if input.type === 'select'}
              <select
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            {/if}
          </div>
        {/each}

        <!-- Generate Button -->
        <button
          onclick={handleGenerate}
          disabled={isGenerating}
          class="w-full py-3.5 px-4 rounded-xl blue-btn text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {#if isGenerating}
            <Icon name="Loader2" size={18} class="animate-spin text-white" />
            <span>Consulting with {$activeTool.agentName}...</span>
          {:else}
            <Icon name="Sparkles" size={18} />
            <span>Execute Consultation</span>
          {/if}
        </button>
      </div>

      <!-- Error Box -->
      {#if errorMessage}
        <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <Icon name="AlertCircle" size={16} class="shrink-0 mt-0.5 text-rose-600" />
          <div class="flex-1 whitespace-pre-line">{errorMessage}</div>
        </div>
      {/if}

      <!-- Output Results Area -->
      {#if outputText}
        <div class="space-y-3 pt-5 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Executive Briefing Result</span>
            </h3>

            <!-- Action Controls -->
            <div class="flex items-center gap-2">
              <button
                onclick={handleCopy}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-xs"
              >
                <Icon name={copied ? 'Check' : 'Copy'} size={13} class={copied ? 'text-blue-600' : ''} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onclick={sendToWhatsApp}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all shadow-xs cursor-pointer"
              >
                <Icon name="MessageSquare" size={13} class="text-emerald-600" />
                <span>Dispatch to WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Markdown Content Render -->
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans prose prose-slate max-w-none shadow-xs">
            {@html parsedHtml}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
