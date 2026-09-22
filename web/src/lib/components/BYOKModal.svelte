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
      feedbackMessage = { type: 'error', text: 'অনুগ্রহ করে একটি Gemini API Key পেস্ট করুন।' };
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
          text: 'অভিনন্দন! আপনার Google Gemini API Key সফলভাবে কানেক্ট ও এনক্রিপ্ট হয়ে সেভ হয়েছে।'
        };
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        feedbackMessage = {
          type: 'error',
          text: check.error || 'ভুল কী। দয়া করে Google AI Studio থেকে সঠিক কী কপি করেছেন কি না যাচাই করুন।'
        };
      }
    } catch (err: any) {
      feedbackMessage = { type: 'error', text: err.message || 'ভ্যালিডেশন ব্যর্থ হয়েছে।' };
    } finally {
      isTesting = false;
    }
  }

  function handleRemove() {
    inputKey = '';
    setApiKey('', false);
    feedbackMessage = { type: 'success', text: 'সংরক্ষিত কী সফলভাবে মুছে ফেলা হয়েছে।' };
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
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Icon name="Key" size={20} />
          </div>
          <div>
            <h3 class="font-bold text-base text-white">Gemini BYOK API Manager</h3>
            <p class="text-xs text-slate-400">Bring Your Own Key • ১০০% ফ্রি ও প্রাইভেট</p>
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
            <span>কেন নিজস্ব ফ্রি কী ব্যবহার করবেন?</span>
          </div>
          <p class="text-[11px] leading-relaxed text-emerald-200/90">
            Google AI Studio সম্পূর্ণ বিনামূল্যে প্রতিদিন ১৫০০ রিকোয়েস্টের ফ্রি কোটা প্রদান করে। আপনার কী লোকাল ব্রাউজারে AES-256 এনক্রিপ্টেড থাকে এবং প্ল্যাটফর্মের সেন্ট্রাল কোনো লিমিটেশনের ঝামেলা থাকে না।
          </p>
        </div>

        <!-- 3-Step Guide -->
        <div class="space-y-2">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400">
            কীভাবে ফ্রি API Key পাবেন? (মাত্র ৩০ সেকেন্ড):
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
                <span> পেজে যান এবং আপনার গুগল অ্যাকাউন্ট দিয়ে লগইন করুন।</span>
              </div>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
              <span><strong>"Create API Key"</strong> বাটনে ক্লিক করে একটি ফ্রি কী জেনারেট করুন।</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
              <span>কী কপি করে নিচের বক্সে পেস্ট করুন এবং "কানেকশন টেস্ট করুন" বাটনে চাপ দিন।</span>
            </li>
          </ol>
        </div>

        <!-- API Key Input Field -->
        <div class="space-y-1.5">
          <label class="block font-semibold text-slate-200 text-xs">
            আপনার Gemini API Key
          </label>
          <div class="relative flex items-center">
            <input
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
              {showKey ? 'হাইড' : 'দেখান'}
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
              <span>টেস্ট করা হচ্ছে...</span>
            {:else}
              <Icon name="Check" size={16} />
              <span>কানেকশন টেস্ট ও সেভ করুন</span>
            {/if}
          </button>

          {#if $isKeyValid}
            <button
              onclick={handleRemove}
              class="py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 font-semibold text-xs transition-colors"
              title="কী মুছে ফেলুন"
            >
              মুছে ফেলুন
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
