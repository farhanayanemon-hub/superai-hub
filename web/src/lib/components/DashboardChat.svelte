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
    incrementManagedUsage,
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
      text: 'আমার ই-কমার্স ক্লোদিং ব্র্যান্ডের জন্য আগামী ৩০ দিনের Facebook Ads + Content + Offer প্ল্যান তৈরি করে দাও।'
    },
    {
      label: '#01 Facebook Ad Copy',
      text: '#01 Write 3 high-converting Facebook & Instagram ad copies for a premium wireless earbud in Bangla & English.'
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
      text: '#63 আমার আজকের কাজের রুটিন ও টাইম-ব্লকিং শিডিউল তৈরি করে দাও: ক্লায়েন্ট মিটিং, এড অপ্টিমাইজেশন, এবং কন্টেন্ট প্ল্যানিং।'
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
      const isCompletePlan = $subscription?.tier === 'complete';

      const payload: Record<string, any> = {
        message: text,
        helperId: selectedHelperId === 'ceo' ? undefined : selectedHelperId,
        mode: selectedHelperId === 'ceo' ? 'ceo' : 'helper',
        history: $chatMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content
        }))
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
          'আপনার মেসেজ পাওয়া গেছে কিন্তু কোনো আউটপুট জেনারেট হয়নি। অনুগ্রহ করে API Vault / BYOK ট্যাবে আপনার ফ্রি Gemini API Key যাচাই করুন।';
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
        content: `❌ **Connection Issue:** AI CEO ইঞ্জিনে সংযোগ করা যায়নি।\n\nDetails: ${err.message}\n\nঅনুগ্রহ করে API Vault ট্যাবে আপনার ফ্রি Gemini API key যাচাই করুন।`,
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
  class="h-full flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-md overflow-hidden"
>
  <!-- Top Executive AI CEO Bar -->
  <div
    class="px-4 sm:px-6 py-3.5 border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between gap-3 flex-wrap shrink-0"
  >
    <div class="flex items-center gap-3">
      <div
        class="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
      >
        <Icon name="Crown" size={20} />
        <span
          class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"
        ></span>
      </div>
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-sm sm:text-base font-extrabold text-white tracking-tight">
            {AI_CEO_PROFILE.name}
          </h2>
          <span
            class="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[10px] font-bold text-cyan-300 tracking-wide uppercase"
          >
            Controls All 75 AI Helpers
          </span>
        </div>
        <p class="text-[11px] text-slate-300 hidden sm:block">
          আলাদা হেল্পারে না গিয়ে সরাসরি AI CEO-কে বলুন — অথবা WhatsApp ও Telegram থেকে কমান্ড দিন
        </p>
      </div>
    </div>

    <!-- Helper Routing Selector & Status Badges -->
    <div class="flex items-center gap-2 flex-wrap">
      <select
        bind:value={selectedHelperId}
        aria-label="Select AI CEO or Specific Helper"
        class="bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-400 max-w-[230px]"
      >
        <option value="ceo">👑 AI CEO (Auto-Route All 75 Helpers)</option>
        {#each TOOLS as helper}
          <option value={helper.id}>{helper.code} — {helper.name}</option>
        {/each}
      </select>

      <div
        class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-200"
      >
        <span
          class="w-2 h-2 rounded-full {$whatsappStatus === 'connected'
            ? 'bg-emerald-400 animate-pulse'
            : 'bg-amber-400'}"
        ></span>
        <span>WA + TG Sync</span>
      </div>

      <button
        type="button"
        onclick={clearChatHistory}
        class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
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
    class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth bg-gradient-to-b from-slate-50/70 to-white"
  >
    {#each $chatMessages as msg (msg.id)}
      {#if msg.role === 'user'}
        <div class="flex items-start justify-end gap-2.5">
          <div
            class="max-w-[85%] sm:max-w-[70%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-xs p-4 shadow-sm"
          >
            <p class="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            <div class="text-[10px] text-blue-100 text-right mt-1.5 font-mono">
              {msg.timestamp}
            </div>
          </div>
          <div
            class="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 text-xs font-bold"
          >
            {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      {:else}
        <div class="flex items-start gap-2.5">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs"
          >
            <Icon name="Crown" size={15} />
          </div>
          <div
            class="max-w-[90%] sm:max-w-[82%] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-sm text-slate-800 space-y-3"
          >
            {#if msg.toolMatched}
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-[10px] font-extrabold text-blue-700 tracking-wide uppercase shadow-2xs"
              >
                <Icon name="Zap" size={11} class="text-blue-600" />
                <span>AI CEO Delegated → {msg.toolMatched}</span>
              </div>
            {:else}
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase"
              >
                <Icon name="Crown" size={11} class="text-blue-600" />
                <span>Master AI CEO Orchestrator</span>
              </div>
            {/if}

            {#if msg.imageUrl}
              <div
                class="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mt-1 max-w-md group relative"
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
                    class="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white border border-slate-200 text-slate-800 text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors shadow-xs"
                  >
                    <Icon name="ExternalLink" size={12} />
                    <span>Download HD</span>
                  </a>
                </div>
              </div>
            {/if}

            <div
              class="prose prose-slate prose-xs sm:prose-sm max-w-none text-slate-800 leading-relaxed break-words font-sans"
            >
              {@html renderMarkdown(msg.content)}
            </div>

            <div
              class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400"
            >
              <span class="font-mono">{msg.timestamp}</span>
              <button
                type="button"
                onclick={() => copyText(msg.id, msg.content)}
                class="hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
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
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0"
        >
          <Icon name="Crown" size={15} />
        </div>
        <div
          class="bg-white border border-blue-200 rounded-2xl rounded-tl-xs px-4 py-3 text-slate-700 text-xs flex items-center gap-2 shadow-xs"
        >
          <div class="flex items-center gap-1">
            <span
              class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"
            ></span>
            <span
              class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"
            ></span>
            <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
          </div>
          <span class="text-slate-600 font-semibold">
            AI CEO উপযুক্ত হেল্পার সিলেক্ট করে আউটপুট তৈরি করছে...
          </span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Quick Starter Prompt Chips -->
  <div
    class="px-4 py-2 bg-slate-50/90 border-t border-slate-200/80 overflow-x-auto no-scrollbar shrink-0"
  >
    <div class="flex items-center gap-2 whitespace-nowrap">
      <span
        class="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mr-1 flex items-center gap-1"
      >
        <Icon name="Zap" size={11} class="text-blue-600" />
        <span>AI CEO Commands:</span>
      </span>
      {#each quickPrompts as prompt}
        <button
          type="button"
          onclick={() => selectPrompt(prompt.text)}
          class="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
        >
          {prompt.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Input Bar -->
  <div class="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
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
        class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
        title="Insert #34 AI Commercial Image Generator"
      >
        <Icon name="Image" size={18} />
      </button>

      <div class="flex-1 relative">
        <textarea
          bind:value={inputMessage}
          onkeydown={handleKeyDown}
          rows="1"
          placeholder="AI CEO-কে যেকোনো কাজের নির্দেশ দিন অথবা #01 থেকে #75 কোড লিখে কমান্ড দিন..."
          class="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none resize-none transition-all max-h-32"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSending || !inputMessage.trim()}
        class="p-2.5 rounded-xl blue-btn text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
        title="Send to AI CEO"
      >
        <Icon name="ArrowRight" size={18} />
      </button>
    </form>
    <div class="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1 flex-wrap gap-1">
      <span>
        Press <strong>Enter</strong> to send • <strong>#01–#75</strong> to target any helper directly
      </span>
      <span class="text-blue-600 font-semibold">
        👑 AI CEO + 75 Helpers (Controllable via Web, WhatsApp & Telegram)
      </span>
    </div>
  </div>
</div>
