<script lang="ts">
  import Icon from './Icon.svelte';
  import {
    activeTool,
    isDrawerOpen,
    closeToolDrawer,
    apiKey,
    isKeyValid,
    subscription,
    getActiveVaultKey,
    incrementManagedUsage
  } from '$lib/stores/userStore';
  import { decryptVaultKey } from '$lib/services/crypto';
  import { executeToolWithGemini } from '$lib/services/gemini';
  import { marked } from 'marked';

  let { onOpenByok }: { onOpenByok?: () => void } = $props();

  interface StudioTurn {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    timestamp: string;
  }

  let formValues = $state<Record<string, string>>({});
  let outputLanguage = $state('Bangla & English Mix');
  let outputTone = $state('High-Converting & Persuasive');
  let isGenerating = $state(false);
  let outputText = $state('');
  let outputImageUrl = $state('');
  let errorMessage = $state('');
  let copied = $state(false);
  let followUpInput = $state('');
  let studioChatHistory = $state<StudioTurn[]>([]);

  const refinementChips = [
    { label: '✨ 100% Humanize করুন', prompt: 'Rewrite this output so it sounds 100% natural, human-written, and bypasses AI detectors.' },
    { label: '🇧🇩 বাংলায় অনুবাদ করুন', prompt: 'Translate and adapt this entire output into natural, high-converting Bengali.' },
    { label: '🇺🇸 English Version দিন', prompt: 'Provide a polished, international-standard English version of this output.' },
    { label: '🔥 আরও Persuasive করুন', prompt: 'Make this more persuasive, punchy, and conversion-focused with stronger hooks.' },
    { label: '📏 সংক্ষিপ্ত ও পয়েন্ট আকারে দিন', prompt: 'Condense this into crisp, high-impact bullet points.' }
  ];

  $effect(() => {
    if ($activeTool) {
      outputText = '';
      outputImageUrl = '';
      errorMessage = '';
      studioChatHistory = [];
      followUpInput = '';
      const initial: Record<string, string> = {};
      for (const input of $activeTool.inputs) {
        initial[input.name] = input.defaultValue || (input.options ? input.options[0] : '');
      }
      formValues = initial;
    }
  });

  function fillSampleInputs() {
    if (!$activeTool) return;
    const sample: Record<string, string> = {};
    for (const input of $activeTool.inputs) {
      if (input.type === 'select' && input.options?.length) {
        sample[input.name] = input.options[0];
      } else {
        sample[input.name] = input.placeholder || `Sample ${input.label} for ${$activeTool.name}`;
      }
    }
    formValues = sample;
  }

  function buildPromptFromInputs(): string {
    if (!$activeTool) return '';
    const entries = $activeTool.inputs
      .map((inp) => {
        const val = (formValues[inp.name] || '').trim();
        return val ? `- **${inp.label}**: ${val}` : null;
      })
      .filter(Boolean)
      .join('\n');

    return `Execute [${$activeTool.code}] ${$activeTool.name} with these specifications:\n${entries || '- Standard best-practice execution'}\n- **Output Language**: ${outputLanguage}\n- **Tone**: ${outputTone}`;
  }

  async function runHelperRequest(userPrompt: string, isInitialForm = false) {
    if (!$activeTool || isGenerating) return;
    errorMessage = '';
    isGenerating = true;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!isInitialForm) {
      studioChatHistory = [
        ...studioChatHistory,
        { id: `u-${Date.now()}`, role: 'user', content: userPrompt, timestamp: nowTime }
      ];
    }

    try {
      const activeVaultKey = getActiveVaultKey();
      const isCompletePlan = $subscription?.tier === 'complete';

      const payload: Record<string, any> = {
        message: userPrompt,
        helperId: $activeTool.id,
        mode: 'helper',
        language: outputLanguage,
        tone: outputTone,
        history: studioChatHistory.map((t) => ({ role: t.role, content: t.content }))
      };

      if (isCompletePlan) {
        payload.usePlatformKey = true;
      } else if (activeVaultKey && activeVaultKey.encryptedKey) {
        payload.vaultKey = {
          provider: activeVaultKey.provider,
          key: decryptVaultKey(activeVaultKey.encryptedKey, activeVaultKey.provider),
          model: activeVaultKey.model
        };
      } else if ($apiKey) {
        payload.apiKey = $apiKey;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.result) {
        if (data.result.type === 'image') {
          outputImageUrl = data.result.url || '';
          outputText = data.result.caption || '✨ ভিজ্যুয়াল রেন্ডার সম্পন্ন হয়েছে।';
        } else {
          outputText = data.result.text || '';
        }

        studioChatHistory = [
          ...studioChatHistory,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: outputText,
            imageUrl: outputImageUrl || undefined,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

        if (isCompletePlan) {
          incrementManagedUsage();
        }
      } else if ($apiKey && $apiKey.trim().length > 10) {
        // Direct client-side Gemini fallback
        const fallback = await executeToolWithGemini($apiKey, $activeTool, {
          ...formValues,
          outputLanguage,
          outputTone,
          followUpInstruction: isInitialForm ? '' : userPrompt
        });
        if (fallback.error) {
          errorMessage = fallback.error;
        } else {
          outputText = fallback.text;
          studioChatHistory = [
            ...studioChatHistory,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: outputText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }
      } else {
        errorMessage =
          data.error ||
          'অনুগ্রহ করে ড্যাশবোর্ডের API Vault / BYOK ট্যাব থেকে আপনার ফ্রি Gemini API Key যুক্ত করুন অথবা Managed Plan ব্যবহার করুন।';
      }
    } catch (err: any) {
      errorMessage = err.message || 'নেটওয়ার্ক ত্রুটি হয়েছে। আবার চেষ্টা করুন।';
    } finally {
      isGenerating = false;
    }
  }

  async function handleGenerate() {
    const prompt = buildPromptFromInputs();
    await runHelperRequest(prompt, true);
  }

  async function handleFollowUpSend() {
    const text = followUpInput.trim();
    if (!text || isGenerating) return;
    followUpInput = '';
    await runHelperRequest(text, false);
  }

  function handleCopy(textToCopy = outputText) {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function sendToWhatsApp(textToShare = outputText) {
    if (!textToShare) return;
    const shareText = encodeURIComponent(
      `*[${$activeTool?.code}] ${$activeTool?.name}*\n\n${textToShare}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  }

  function renderMd(md: string): string {
    try {
      return marked.parse(md) as string;
    } catch {
      return md;
    }
  }
</script>

{#if $isDrawerOpen && $activeTool}
  <!-- Backdrop Overlay -->
  <div
    class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm transition-opacity"
    onclick={closeToolDrawer}
    role="presentation"
  ></div>

  <!-- Slide-out Animated Glassmorphic Studio Panel -->
  <div
    class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white/95 backdrop-blur-2xl border-l border-slate-200/80 shadow-2xl flex flex-col transform transition-transform duration-300 overflow-hidden"
  >
    <!-- Drawer Header -->
    <div
      class="px-6 py-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-between"
    >
      <div class="flex items-center gap-3.5">
        <div
          class="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20"
        >
          <Icon name={$activeTool.icon || 'Sparkles'} size={22} />
          <span
            class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
          ></span>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-md bg-slate-900 text-white"
            >
              {$activeTool.code}
            </span>
            <h2 class="font-extrabold text-base text-slate-900">{$activeTool.name}</h2>
            <span
              class="px-2.5 py-0.5 text-[10px] font-bold bg-blue-100/80 text-blue-700 rounded-full border border-blue-200 uppercase"
            >
              {$activeTool.badge}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            {$activeTool.shortDesc} •
            <span class="text-blue-600 font-semibold">{$activeTool.categoryName}</span>
          </p>
        </div>
      </div>

      <button
        onclick={closeToolDrawer}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        aria-label="Close Helper Studio"
      >
        <Icon name="X" size={18} />
      </button>
    </div>

    <!-- WhatsApp / Telegram Remote Control Hint Bar -->
    <div
      class="px-6 py-2 bg-slate-900 text-slate-200 text-[11px] flex items-center justify-between gap-2 flex-wrap"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>
          <strong>AI CEO / WhatsApp / Telegram কমান্ড:</strong> মেসেজে শুধু
          <code class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono"
            >{$activeTool.code}</code
          >
          বা টাস্ক লিখলেই এই হেল্পার কাজ করবে!
        </span>
      </div>
      {#if !$isKeyValid && $subscription?.tier !== 'complete'}
        <button
          onclick={onOpenByok}
          class="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer"
        >
          Connect API Key
        </button>
      {/if}
    </div>

    <!-- Drawer Body -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Tailored Helper Parameters Card -->
      <div
        class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4 shadow-2xs"
      >
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3
            class="text-xs font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5"
          >
            <Icon name="Sliders" size={14} class="text-blue-600" />
            <span>Helper Custom Options ({$activeTool.inputs.length})</span>
          </h3>
          <button
            type="button"
            onclick={fillSampleInputs}
            class="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Icon name="Zap" size={12} />
            <span>1-Click Sample Fill</span>
          </button>
        </div>

        {#each $activeTool.inputs as input}
          <div class="space-y-1.5">
            <label
              for={'input-' + input.name}
              class="block text-xs font-semibold text-slate-700"
            >
              {input.label}
              {#if input.required}
                <span class="text-blue-600">*</span>
              {/if}
            </label>

            {#if input.type === 'textarea'}
              <textarea
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                rows={3}
                placeholder={input.placeholder}
                class="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 leading-relaxed transition-all"
              ></textarea>
            {:else if input.type === 'select'}
              <select
                id={'input-' + input.name}
                bind:value={formValues[input.name]}
                class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
                class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            {/if}
          </div>
        {/each}

        <!-- Global Studio Controls: Output Language & Tone -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
          <div>
            <label for="studio-lang" class="block text-[11px] font-semibold text-slate-600 mb-1">
              Output Language (ভাষা)
            </label>
            <select
              id="studio-lang"
              bind:value={outputLanguage}
              class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="Bangla & English Mix">🇧🇩/🇺🇸 Bangla & English Mix</option>
              <option value="Pure Bangla (বাংলা)">🇧🇩 সম্পূর্ণ বাংলা (Pure Bangla)</option>
              <option value="Professional English">🇺🇸 Professional English</option>
              <option value="Banglish">💬 Banglish (Social Style)</option>
            </select>
          </div>
          <div>
            <label for="studio-tone" class="block text-[11px] font-semibold text-slate-600 mb-1">
              Execution Tone (টোন)
            </label>
            <select
              id="studio-tone"
              bind:value={outputTone}
              class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="High-Converting & Persuasive">🔥 High-Converting & Persuasive</option>
              <option value="100% Human & Natural">✨ 100% Human & Natural</option>
              <option value="Executive & Corporate">👔 Executive & Corporate</option>
              <option value="Viral & Scroll-Stopping">🚀 Viral & Scroll-Stopping</option>
            </select>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          onclick={handleGenerate}
          disabled={isGenerating}
          class="w-full py-3.5 px-4 rounded-xl blue-btn text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/20"
        >
          {#if isGenerating}
            <Icon name="Loader2" size={18} class="animate-spin text-white" />
            <span>Running [{$activeTool.code}] {$activeTool.name}...</span>
          {:else}
            <Icon name="Sparkles" size={18} />
            <span>Generate with {$activeTool.name}</span>
          {/if}
        </button>
      </div>

      <!-- Error Box -->
      {#if errorMessage}
        <div
          class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
        >
          <Icon name="AlertCircle" size={16} class="shrink-0 mt-0.5 text-rose-600" />
          <div class="flex-1 whitespace-pre-line">{errorMessage}</div>
        </div>
      {/if}

      <!-- Interactive Studio Output & Follow-Up Chat Thread -->
      {#if studioChatHistory.length > 0}
        <div class="space-y-4 pt-2 border-t border-slate-200">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3
              class="text-xs font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live Helper Studio Output & Chat</span>
            </h3>

            <div class="flex items-center gap-2">
              <button
                onclick={() => handleCopy(outputText)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                <Icon
                  name={copied ? 'Check' : 'Copy'}
                  size={13}
                  class={copied ? 'text-blue-600' : ''}
                />
                <span>{copied ? 'Copied!' : 'Copy Latest'}</span>
              </button>

              <button
                onclick={() => sendToWhatsApp(outputText)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all shadow-2xs cursor-pointer"
              >
                <Icon name="MessageSquare" size={13} class="text-emerald-600" />
                <span>Share to WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Conversation Turns inside Helper Drawer -->
          <div class="space-y-3">
            {#each studioChatHistory as turn (turn.id)}
              {#if turn.role === 'user'}
                <div class="flex justify-end">
                  <div
                    class="max-w-[85%] rounded-2xl rounded-tr-xs bg-blue-600 text-white px-4 py-2.5 text-xs shadow-xs"
                  >
                    <p class="whitespace-pre-wrap">{turn.content}</p>
                  </div>
                </div>
              {:else}
                <div
                  class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3"
                >
                  {#if turn.imageUrl}
                    <div class="rounded-xl overflow-hidden border border-slate-200 max-w-md">
                      <img
                        src={turn.imageUrl}
                        alt={$activeTool.name}
                        class="w-full h-auto object-cover"
                      />
                    </div>
                  {/if}
                  <div
                    class="prose prose-slate prose-xs sm:prose-sm max-w-none text-slate-800 leading-relaxed"
                  >
                    {@html renderMd(turn.content)}
                  </div>
                </div>
              {/if}
            {/each}
          </div>

          <!-- 1-Click Quick Refinement Chips -->
          <div class="flex items-center gap-1.5 flex-wrap pt-1">
            {#each refinementChips as chip}
              <button
                type="button"
                disabled={isGenerating}
                onclick={() => runHelperRequest(chip.prompt, false)}
                class="px-2.5 py-1 rounded-full bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 text-[11px] font-semibold text-blue-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            {/each}
          </div>

          <!-- Follow-up Chat Input with this Helper -->
          <form
            onsubmit={(e) => {
              e.preventDefault();
              handleFollowUpSend();
            }}
            class="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              bind:value={followUpInput}
              placeholder="এই হেল্পারকে আরও নির্দেশনা দিন (যেমন: আরও ছোট করো, ২য় অপশনটি পরিবর্তন করো)..."
              class="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
            />
            <button
              type="submit"
              disabled={isGenerating || !followUpInput.trim()}
              class="px-4 py-2.5 rounded-xl blue-btn text-white text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </form>
        </div>
      {/if}
    </div>
  </div>
{/if}
