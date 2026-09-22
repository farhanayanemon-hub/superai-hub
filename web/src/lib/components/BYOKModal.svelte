<script lang="ts">
  import Icon from './Icon.svelte';
  import { apiKey, isKeyValid, setApiKey } from '$lib/stores/userStore';
  import { validateGeminiKey } from '$lib/services/gemini';

  let { isOpen = false, onClose }: { isOpen: boolean; onClose: () => void } = $props();

  let inputKey = $state($apiKey || '');
  let showKey = $state(false);
  let isTesting = $state(false);
  let feedbackMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

  $effect(() => {
    if (isOpen) {
      inputKey = $apiKey || '';
      feedbackMessage = null;
    }
  });

  async function handleTestAndSave() {
    if (!inputKey.trim()) {
      feedbackMessage = { type: 'error', text: 'Please enter a Gemini API Key.' };
      return;
    }

    isTesting = true;
    feedbackMessage = null;

    try {
      const check = await validateGeminiKey(inputKey.trim());
      if (check.valid) {
        setApiKey(inputKey.trim(), true);
        feedbackMessage = {
          type: 'success',
          text: 'Success! Your Google Gemini API Key has been verified, encrypted, and saved locally.'
        };
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        feedbackMessage = {
          type: 'error',
          text: check.error || 'Invalid API key. Please check your key from Google AI Studio.'
        };
      }
    } catch (err: any) {
      feedbackMessage = { type: 'error', text: err.message || 'Validation failed.' };
    } finally {
      isTesting = false;
    }
  }

  function handleRemove() {
    inputKey = '';
    setApiKey('', false);
    feedbackMessage = { type: 'success', text: 'Saved API key has been removed.' };
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
    onclick={onClose}
    role="presentation"
  >
    <!-- Modal Card -->
    <div
      class="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Icon name="Key" size={20} />
          </div>
          <div>
            <h3 class="font-bold text-base text-white">Gemini BYOK API Manager</h3>
            <p class="text-xs text-slate-400">Bring Your Own Key • 100% Free & Private</p>
          </div>
        </div>

        <button
          onclick={onClose}
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-5 text-xs sm:text-sm text-slate-300">
        <!-- Explanatory Value Box -->
        <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-2">
          <div class="flex items-center gap-2 font-bold text-emerald-300">
            <Icon name="Shield" size={15} />
            <span>Why Bring Your Own Key (BYOK)?</span>
          </div>
          <p class="text-[11px] leading-relaxed text-emerald-200/90">
            Google AI Studio provides a free tier offering 1,500 daily requests at zero cost. Your API key is stored securely in your browser with AES-256 encryption, eliminating middleman token limits.
          </p>
        </div>

        <!-- 3-Step Guide -->
        <div class="space-y-2">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400">
            How to get your free Gemini Key (Takes 30 seconds):
          </h4>
          <ol class="space-y-2 text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
              <div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  class="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>aistudio.google.com</span>
                  <Icon name="ExternalLink" size={12} />
                </a>
                <span> and sign in with your Google account.</span>
              </div>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
              <span>Click <strong>"Create API Key"</strong> to generate your free secret key.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
              <span>Paste your key into the field below and click "Test & Save Connection".</span>
            </li>
          </ol>
        </div>

        <!-- API Key Input Field -->
        <div class="space-y-1.5">
          <label for="gemini-key-input" class="block font-semibold text-slate-200 text-xs">
            Your Google Gemini API Key
          </label>
          <div class="relative flex items-center">
            <input
              id="gemini-key-input"
              type={showKey ? 'text' : 'password'}
              bind:value={inputKey}
              placeholder="AIzaSy..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-wider pr-20"
            />
            <button
              type="button"
              onclick={() => (showKey = !showKey)}
              class="absolute right-3 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <!-- Feedback Notification -->
        {#if feedbackMessage}
          <div
            class="p-3 rounded-xl text-xs flex items-center gap-2 {feedbackMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'}"
          >
            <Icon name={feedbackMessage.type === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={15} />
            <span>{feedbackMessage.text}</span>
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-2">
          <button
            onclick={handleTestAndSave}
            disabled={isTesting}
            class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {#if isTesting}
              <Icon name="Loader2" size={16} class="animate-spin" />
              <span>Validating Key...</span>
            {:else}
              <Icon name="Check" size={16} />
              <span>Test & Save Connection</span>
            {/if}
          </button>

          {#if $isKeyValid}
            <button
              onclick={handleRemove}
              class="py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 font-semibold text-xs transition-colors"
              title="Remove Key"
            >
              Remove
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
