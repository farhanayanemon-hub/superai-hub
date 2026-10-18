<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { TOOLS, AI_CEO_PROFILE } from '$lib/config/tools';
  import {
    chatMessages,
    addChatMessage,
    clearChatHistory,
    apiKey,
    isKeyValid,
    whatsappStatus,
    currentUser,
    subscription,
    getActiveVaultKey,
    getRoundRobinVaultKeys,
    openrouterSelectedModels,
    routingStrategy,
    incrementManagedUsage,
    isProPlan,
    type ChatMessage
  } from '$lib/stores/userStore';
  import { decryptVaultKey } from '$lib/services/crypto';
  import { marked } from 'marked';
  import { onMount, tick } from 'svelte';

  let inputMessage = $state('');
  let selectedHelperId = $state('ceo');
  let isSending = $state(false);
  let messagesContainer = $state<HTMLDivElement | null>(null);
  let copiedMessageId = $state<string | null>(null);

  const quickPrompts = [
    {
      label: '👑 AI CEO: 360° Marketing Plan',
      text: 'Build a complete 30-day Facebook Ads + Social Content + Offer launch strategy for my e-commerce clothing brand.'
    },
    {
      label: '#01 Facebook Ad Copy',
      text: '#01 Write 3 high-converting Facebook & Instagram ad copies for a premium wireless earbud.'
    },
    {
      label: '#24 AI Text Humanizer',
      text: '#24 Humanize this AI text so it sounds 100% natural and bypasses AI detectors: "Our company leverages cutting-edge solutions to maximize operational efficiency."'
    },
    {
      label: '#34 Commercial Image Gen',
      text: '#34 Luxury perfume bottle on black volcanic stone with golden water splashes, commercial studio lighting, 8k'
    },
    {
      label: '#51 Upwork Proposal',
      text: '#51 Write a winning Upwork proposal for a Full-Stack E-Commerce Website Development project.'
    },
    {
      label: '#63 Daily Time Block',
      text: '#63 Build an optimized hour-by-hour daily time-block schedule for my top priorities: client meetings, ad optimization, and content planning.'
    }
  ];

  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  onMount(() => {
    scrollToBottom();
  });

  async function handleSend() {
    const text = inputMessage.trim();
    if (!text || isSending) return;

    inputMessage = '';
    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessage(userMsg);
    scrollToBottom();

    isSending = true;

    try {
      const activeVaultKey = getActiveVaultKey();
      const isCompletePlan =
        $subscription?.tier === 'complete' ||
        $subscription?.tier === 'managed' ||
        $currentUser?.tier === 'managed';

      const payload: Record<string, any> = {
        message: text,
        helperId: selectedHelperId === 'ceo' ? undefined : selectedHelperId,
        mode: selectedHelperId === 'ceo' ? 'ceo' : 'helper',
        planTier: $isProPlan ? 'byok_pro' : ($subscription?.tier || $currentUser?.tier || 'byok_starter'),
        history: $chatMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content
        }))
      };

      if (isCompletePlan) {
        payload.usePlatformKey = true;
      } else if (activeVaultKey && activeVaultKey.encryptedKey) {
        const roundRobinKeys = getRoundRobinVaultKeys(activeVaultKey.provider);
        payload.vaultKey = {
          provider: activeVaultKey.provider,
          key: decryptVaultKey(activeVaultKey.encryptedKey, activeVaultKey.provider),
          model: activeVaultKey.model,
          models: activeVaultKey.provider === 'openrouter' ? $openrouterSelectedModels : undefined,
          label: activeVaultKey.label
        };
        payload.vaultKeys = roundRobinKeys.map((k) => ({
          provider: k.provider,
          key: decryptVaultKey(k.encryptedKey, k.provider),
          model: k.model,
          models: k.provider === 'openrouter' ? $openrouterSelectedModels : undefined,
          label: k.label
        }));
        payload.openrouterModels = $openrouterSelectedModels;
        payload.routingStrategy = $routingStrategy;
      } else if ($apiKey) {
        payload.apiKey = $apiKey;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Engine communication error (${response.status})`);
      }

      const data = await response.json();

      let replyContent = '';
      let toolMatched: string | undefined = data.delegatedHelper
        ? `[${data.delegatedHelper.code}] ${data.delegatedHelper.name}`
        : undefined;
      let imageUrl: string | undefined = undefined;

      if (data.result) {
        if (data.result.type === 'image') {
          imageUrl =
            data.result.url ||
            data.result.image?.imageUrl ||
            data.result.imageUrl ||
            (typeof data.result.image === 'string' ? data.result.image : undefined);
          replyContent =
            data.result.caption ||
            data.result.image?.caption ||
            `🎨 **AI Visual Generated Successfully!**`;
          toolMatched = toolMatched || '[#34] AI Commercial Image Generator';
        } else if (data.result.text) {
          replyContent = data.result.text;
          toolMatched = toolMatched || data.result.toolMatched;
        } else if (typeof data.result === 'string') {
          replyContent = data.result;
        }
      } else if (data.error) {
        replyContent = `⚠️ **AI CEO Alert:** ${data.error}`;
      } else {
        replyContent =
          'Your message was received, but no output was generated. Please verify your API Key in the API Vault / Settings tab.';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        toolMatched,
        imageUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      addChatMessage(botMsg);
      if (isCompletePlan) {
        incrementManagedUsage();
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Connection Issue:** Unable to connect to the AI CEO Engine.\n\nDetails: ${err.message}\n\nPlease verify your API Key in the Settings / Vault tab.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error'
      };
      addChatMessage(errMsg);
    } finally {
      isSending = false;
      scrollToBottom();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function selectPrompt(promptText: string) {
    inputMessage = promptText;
  }

  function copyText(id: string, text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      copiedMessageId = id;
      setTimeout(() => {
        copiedMessageId = null;
      }, 2000);
    }
  }

  function renderMarkdown(content: string): string {
    try {
      return marked.parse(content) as string;
    } catch {
      return content.replace(/\n/g, '<br/>');
    }
  }
</script>

<div
  class="h-full flex flex-col ui-card-static rounded-2xl overflow-hidden"
>
  <!-- Top Executive AI CEO Bar -->
  <div
    class="px-4 sm:px-6 py-3.5 border-b border-[#E3ECF7] bg-[#102A56] text-white flex items-center justify-between gap-3 flex-wrap shrink-0"
  >
    <div class="flex items-center gap-3">
      <div
        class="relative w-11 h-11 rounded-2xl bg-[#1677FF] border border-[#38CFFF]/40 flex items-center justify-center text-white shadow-sm"
      >
        <Icon name="Crown" size={20} />
        <span
          class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#102A56]"
        ></span>
      </div>
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-sm sm:text-base font-extrabold text-white tracking-tight">
            {AI_CEO_PROFILE.name}
          </h2>
          <span
            class="px-2.5 py-0.5 rounded-full ui-badge-sky text-[10px] tracking-wide uppercase"
          >
            Controls All 75 AI Helpers
          </span>
        </div>
        <p class="text-[11px] text-[#CFE2FA] hidden sm:block">
          Instruct the Master AI CEO directly to orchestrate any helper — or control via WhatsApp & Telegram
        </p>
      </div>
    </div>

    <!-- Helper Routing Selector & Status Badges -->
    <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
      <select
        bind:value={selectedHelperId}
        aria-label="Select AI CEO or Specific Helper"
        class="bg-[#0B1F42] hover:bg-[#15366E] text-white border border-[#38CFFF]/25 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#38CFFF] w-full sm:w-auto max-w-full sm:max-w-[230px] cursor-pointer"
      >
        <option value="ceo">👑 AI CEO (Auto-Route All 75 Helpers)</option>
        {#each TOOLS as helper}
          <option value={helper.id}>{helper.code} — {helper.name}</option>
        {/each}
      </select>

      <div
        class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B1F42] border border-[#38CFFF]/20 text-[11px] text-[#E4F0FF]"
      >
        <span
          class="w-2 h-2 rounded-full {$whatsappStatus === 'connected'
            ? 'bg-emerald-400'
            : 'bg-amber-400'}"
        ></span>
        <span>WA + TG Sync</span>
      </div>

      <button
        type="button"
        onclick={clearChatHistory}
        class="p-2 rounded-lg bg-[#0B1F42] hover:bg-[#15366E] border border-[#38CFFF]/20 text-[#E4F0FF] hover:text-white transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
        title="Clear chat history"
      >
        <Icon name="RotateCcw" size={14} />
        <span class="hidden sm:inline">Reset</span>
      </button>
    </div>
  </div>

  <!-- Messages List Container -->
  <div
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth bg-[#F3F8FF]/60"
  >
    {#if $chatMessages.length === 0 && !isSending}
      <div class="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6">
        <div class="w-14 h-14 rounded-2xl bg-white border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shadow-xs mb-3">
          <Icon name="Crown" size={26} />
        </div>
        <h3 class="text-sm sm:text-base font-extrabold text-[#102A56]">
          Master AI CEO Ready to Orchestrate
        </h3>
        <p class="text-xs text-[#4B6382] max-w-md mt-1 leading-relaxed">
          Select a quick command chip below or type any instruction (or <code class="text-[#1677FF] font-mono font-bold">#01</code>–<code class="text-[#1677FF] font-mono font-bold">#75</code>) to command your AI Helpers.
        </p>
      </div>
    {/if}

    {#each $chatMessages as msg (msg.id)}
      {#if msg.role === 'user'}
        <div class="flex items-start justify-end gap-2.5">
          <div
            class="max-w-[88%] sm:max-w-[72%] bg-[#1677FF] text-white rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-xs"
          >
            <p class="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
            <div class="text-[10px] text-[#E4F0FF] text-right mt-1.5 font-mono">
              {msg.timestamp}
            </div>
          </div>
          <div
            class="w-8 h-8 rounded-lg bg-[#E4F0FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shrink-0 mt-0.5 text-xs font-bold"
          >
            {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      {:else}
        <div class="flex items-start gap-2.5">
          <div
            class="w-8 h-8 rounded-lg bg-[#1677FF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
          >
            <Icon name="Crown" size={15} />
          </div>
          <div
            class="max-w-[92%] sm:max-w-[85%] bg-white border {msg.status === 'error' ? 'border-rose-200 bg-rose-50/20' : 'border-[#E3ECF7]'} rounded-2xl rounded-tl-xs p-3.5 sm:p-5 shadow-xs text-[#102A56] space-y-3"
          >
            {#if msg.toolMatched}
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ui-badge-primary text-[10px] tracking-wide uppercase"
              >
                <Icon name="Zap" size={11} class="text-[#1677FF]" />
                <span>AI CEO Delegated → {msg.toolMatched}</span>
              </div>
            {:else}
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F8FF] border border-[#E3ECF7] text-[10px] font-bold text-[#102A56] uppercase"
              >
                <Icon name="Crown" size={11} class="text-[#1677FF]" />
                <span>Master AI CEO Orchestrator</span>
              </div>
            {/if}

            {#if msg.imageUrl}
              <div
                class="rounded-xl overflow-hidden border border-[#E3ECF7] bg-[#F3F8FF] mt-1 max-w-md group relative"
              >
                <img
                  src={msg.imageUrl}
                  alt="AI Generated Visual"
                  class="w-full h-auto object-cover max-h-80 rounded-xl"
                  loading="lazy"
                />
                <div class="absolute bottom-2 right-2">
                  <a
                    href={msg.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="px-2.5 py-1 rounded-lg bg-white/95 hover:bg-white border border-[#E3ECF7] text-[#102A56] text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors shadow-xs"
                  >
                    <Icon name="ExternalLink" size={12} />
                    <span>Download HD</span>
                  </a>
                </div>
              </div>
            {/if}

            <div
              class="prose prose-slate prose-xs sm:prose-sm max-w-none text-[#102A56] leading-relaxed break-words font-sans"
            >
              {@html renderMarkdown(msg.content)}
            </div>

            <div
              class="flex items-center justify-between pt-2 border-t border-[#E3ECF7] text-[11px] text-[#5E7694]"
            >
              <span class="font-mono">{msg.timestamp}</span>
              <button
                type="button"
                onclick={() => copyText(msg.id, msg.content)}
                class="hover:text-[#1677FF] transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                title="Copy response"
              >
                <Icon name={copiedMessageId === msg.id ? 'Check' : 'Copy'} size={12} />
                <span>{copiedMessageId === msg.id ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      {/if}
    {/each}

    {#if isSending}
      <div class="flex items-start gap-2.5">
        <div
          class="w-8 h-8 rounded-lg bg-[#1677FF] text-white flex items-center justify-center shrink-0"
        >
          <Icon name="Crown" size={15} />
        </div>
        <div
          class="bg-white border border-[#E3ECF7] rounded-2xl rounded-tl-xs px-4 py-3 text-[#102A56] text-xs flex items-center gap-2 shadow-2xs"
        >
          <div class="flex items-center gap-1">
            <span
              class="w-1.5 h-1.5 bg-[#1677FF] rounded-full animate-bounce [animation-delay:-0.3s]"
            ></span>
            <span
              class="w-1.5 h-1.5 bg-[#1677FF] rounded-full animate-bounce [animation-delay:-0.15s]"
            ></span>
            <span class="w-1.5 h-1.5 bg-[#1677FF] rounded-full animate-bounce"></span>
          </div>
          <span class="text-[#4B6382] font-semibold">
            AI CEO is delegating to the specialist helper and generating output...
          </span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Quick Starter Prompt Chips -->
  <div
    class="px-4 py-2.5 bg-[#F3F8FF] border-t border-[#E3ECF7] overflow-x-auto no-scrollbar shrink-0"
  >
    <div class="flex items-center gap-2 whitespace-nowrap">
      <span
        class="text-[10px] font-extrabold uppercase tracking-wider text-[#1677FF] mr-1 flex items-center gap-1"
      >
        <Icon name="Zap" size={11} class="text-[#1677FF]" />
        <span>AI CEO Commands:</span>
      </span>
      {#each quickPrompts as prompt}
        <button
          type="button"
          onclick={() => selectPrompt(prompt.text)}
          class="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EBF4FF] border border-[#E3ECF7] hover:border-[#1677FF] text-[#102A56] hover:text-[#1677FF] text-xs font-medium transition-colors cursor-pointer"
        >
          {prompt.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Input Bar -->
  <div class="p-3 sm:p-4 border-t border-[#E3ECF7] bg-white shrink-0">
    <form
      onsubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      class="flex items-end gap-2"
    >
      <button
        type="button"
        onclick={() => (inputMessage = '#34 ')}
        class="w-10 h-10 rounded-xl bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#E3ECF7] text-[#4B6382] hover:text-[#1677FF] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
        title="Insert #34 AI Commercial Image Generator"
        aria-label="Insert Image Generator command"
      >
        <Icon name="Image" size={18} />
      </button>

      <div class="flex-1 relative min-w-0">
        <textarea
          bind:value={inputMessage}
          onkeydown={handleKeyDown}
          rows="1"
          placeholder="Instruct the AI CEO on any task, or type #01 to #75 to command a specific helper..."
          class="w-full ui-textarea px-3.5 py-2.5 text-sm resize-none max-h-32"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSending || !inputMessage.trim()}
        class="w-10 h-10 rounded-xl blue-btn text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center"
        title="Send to AI CEO"
        aria-label="Send message to AI CEO"
      >
        <Icon name="ArrowRight" size={18} />
      </button>
    </form>
    <div class="flex items-center justify-between mt-2 text-[10px] text-[#4B6382] px-1 flex-wrap gap-1">
      <span>
        Press <strong>Enter</strong> to send • <strong>#01–#75</strong> to target any helper directly
      </span>
      <span class="text-[#1677FF] font-semibold">
        👑 AI CEO + 75 Helpers (Controllable via Web, WhatsApp & Telegram)
      </span>
    </div>
  </div>
</div>
