<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import ChannelModal from '$lib/components/ChannelModal.svelte';
  import { TOOLS, AI_CEO_PROFILE, type AITool } from '$lib/config/tools';
  import {
    chatMessages,
    addChatMessage,
    clearChatHistory,
    apiKey,
    currentUser,
    subscription,
    getActiveVaultKey,
    incrementManagedUsage,
    ceoCustomPrompt,
    activeDashboardTab,
    type ChatMessage
  } from '$lib/stores/userStore';
  import { decryptVaultKey } from '$lib/services/crypto';
  import { marked } from 'marked';
  import { onMount, tick } from 'svelte';

  let {
    isOpen = $bindable(false),
    activeTab,
    onOpenChannels
  } = $props<{
    isOpen?: boolean;
    activeTab?: string;
    onOpenChannels?: () => void;
  }>();

  // Internal state
  let isChannelsModalOpen = $state(false);
  let inputMessage = $state('');
  let selectedHelperId = $state('ceo');
  let isSending = $state(false);
  let messagesContainer = $state<HTMLDivElement | null>(null);
  let textareaRef = $state<HTMLTextAreaElement | null>(null);
  let copiedMessageId = $state<string | null>(null);
  let isPlusMenuOpen = $state(false);
  let speechBubbleDismissed = $state(false);

  // Slash Command (/) Autocomplete state
  let isSlashOpen = $state(false);
  let slashQuery = $state('');
  let selectedSlashIndex = $state(0);

  // Quick action presets for '+' button aligned with tools.ts catalog
  // Presets mapping:
  // - #34: id: 'ai_commercial_image_generator', code: '#34', name: 'AI Commercial Image Generator'
  // - #24: id: 'ai_humanizer_bypasser' / 'ai_text_humanizer', code: '#24', name: 'AI Text Humanizer 100% Natural' ('AI Text Humanizer (100% Natural Bypass)')
  // - #64: id: 'freelance_proposal_writer' / 'inbox_sales_objection_handler', code: '#64', name: 'Inbox Sales & Objection Handler' ('Freelance Job Proposal & Cover Letter Writer')
  // - #66: id: 'excel_sheets_formula_bot' / 'excel_sheets_formula_generator', code: '#66', name: 'Excel & Google Sheets Formula Generator'
  const quickActions = [
    {
      id: 'marketing_plan',
      code: 'CEO-00',
      name: '360° AI CEO Marketing Plan',
      label: '360° AI CEO Marketing Plan',
      icon: 'Crown',
      tag: 'Strategy',
      prompt: 'Build a comprehensive 30-day marketing, ads, and conversion plan for our business.'
    },
    {
      id: 'fb_insta_ads',
      code: '#01',
      name: 'Facebook & Instagram Ads Generator',
      label: '#01 Facebook & IG Ads Generator',
      icon: 'Megaphone',
      tag: '#01',
      prompt: '[⚡ #01 Facebook & Instagram Ads Generator] Write 3 high-converting ad angles with scroll-stopping hooks for: '
    },
    {
      id: 'ai_text_humanizer',
      code: '#24',
      name: 'AI Text Humanizer 100% Natural',
      label: '#24 AI Text Humanizer',
      icon: 'Wand2',
      tag: '#24',
      prompt: '[⚡ #24 AI Text Humanizer 100% Natural] Humanize this text to make it sound 100% human and natural: '
    },
    {
      id: 'ai_commercial_image_generator',
      code: '#34',
      name: 'AI Commercial Image Generator',
      label: '#34 AI Commercial Image Generator',
      icon: 'Image',
      tag: '#34',
      prompt: '[⚡ #34 AI Commercial Image Generator] High-resolution commercial product photograph with studio lighting, 8k: '
    },
    {
      id: 'inbox_sales_objection_handler',
      code: '#64',
      name: 'Inbox Sales & Objection Handler',
      label: '#64 Inbox Sales & Objection Handler',
      icon: 'Briefcase',
      tag: '#64',
      prompt: '[⚡ #64 Inbox Sales & Objection Handler] Craft a high-converting objection handling script for: '
    },
    {
      id: 'excel_sheets_formula_generator',
      code: '#66',
      name: 'Excel & Google Sheets Formula Generator',
      label: '#66 Excel & Google Sheets Formula Generator',
      icon: 'Table',
      tag: '#66',
      prompt: '[⚡ #66 Excel & Google Sheets Formula Generator] Provide the exact formula and explanation for: '
    }
  ];

  // Auto-scroll to bottom of conversation feed
  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // 1. Auto-open on first dashboard visit
  $effect(() => {
    if (typeof window !== 'undefined') {
      try {
        const seen = localStorage.getItem('ezbo_ceo_chat_seen');
        if (!seen) {
          isOpen = true;
          localStorage.setItem('ezbo_ceo_chat_seen', 'true');
        }
      } catch {
        // ignore localStorage errors
      }
    }
  });

  // 2. Auto-minimize when user switches tabs away from chat
  let previousObservedTab = $state<string | null>(null);
  $effect(() => {
    const currentTab = activeTab || $activeDashboardTab;
    if (
      previousObservedTab !== null &&
      currentTab &&
      currentTab !== previousObservedTab &&
      currentTab !== 'chat'
    ) {
      isOpen = false;
    }
    previousObservedTab = currentTab;
  });

  // Watch messages for auto-scroll
  $effect(() => {
    if ($chatMessages.length) {
      scrollToBottom();
    }
  });

  onMount(() => {
    scrollToBottom();
  });

  // Filtered helpers for slash command popover
  const filteredTools = $derived.by(() => {
    if (!slashQuery) return TOOLS.slice(0, 75);
    const q = slashQuery.toLowerCase().replace(/^#/, '');
    return TOOLS.filter((t) => {
      const codeClean = t.code.toLowerCase().replace(/^#/, '');
      return (
        codeClean.includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.agentName.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q) ||
        t.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    }).slice(0, 75);
  });

  // Detect slash typing
  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    const val = target.value;
    const cursor = target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);

    // Matches / at beginning of string or after whitespace
    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9_#\s-]*)$/);
    if (slashMatch) {
      isSlashOpen = true;
      isPlusMenuOpen = false; // Mutual exclusivity: close '+' quick action menu when slash menu opens
      slashQuery = slashMatch[1].trim();
      selectedSlashIndex = 0;
    } else {
      isSlashOpen = false;
    }
  }

  // Keyboard navigation for slash helper popover & submit
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (isSlashOpen) {
        e.preventDefault();
        isSlashOpen = false;
        return;
      }
      if (isPlusMenuOpen) {
        e.preventDefault();
        isPlusMenuOpen = false;
        return;
      }
    }

    if (isSlashOpen && filteredTools.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSlashIndex = (selectedSlashIndex + 1) % filteredTools.length;
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSlashIndex =
          (selectedSlashIndex - 1 + filteredTools.length) % filteredTools.length;
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectHelper(filteredTools[selectedSlashIndex]);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Selecting a helper inserts visual mention chip: [⚡ #01 Facebook Ad Copy]
  function selectHelper(helper: AITool) {
    const chip = `[⚡ ${helper.code} ${helper.name}] `;
    if (!textareaRef) {
      inputMessage = chip;
    } else {
      const val = inputMessage;
      const cursor = textareaRef.selectionStart || val.length;
      const textBeforeCursor = val.slice(0, cursor);
      const textAfterCursor = val.slice(cursor);
      const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        inputMessage = textBeforeCursor.slice(0, lastSlashIndex) + chip + textAfterCursor;
      } else {
        inputMessage = chip + val;
      }
    }
    isSlashOpen = false;
    selectedHelperId = helper.id;

    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
      }
    }, 50);
  }

  function handleSelectQuickAction(action: (typeof quickActions)[0]) {
    inputMessage = action.prompt;
    isPlusMenuOpen = false;
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
      }
    }, 50);
  }

  async function handleSend() {
    const text = inputMessage.trim();
    if (!text || isSending) return;

    inputMessage = '';
    isSlashOpen = false;
    isPlusMenuOpen = false;

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
        ceoCustomPrompt: $ceoCustomPrompt || undefined,
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

  function openChannelsModal() {
    isChannelsModalOpen = true;
    onOpenChannels?.();
  }
</script>

<!-- Embedded Channels Modal -->
<ChannelModal bind:isOpen={isChannelsModalOpen} />

<!-- ====================================================================== -->
<!-- 1. FIXED FLOATING LAUNCHER BUTTON (Bottom-Right) -->
<!-- ====================================================================== -->
{#if !isOpen}
  <div class="fixed bottom-6 right-6 z-40 flex items-center gap-3">
    <!-- Animated Bouncing Speech Bubble -->
    {#if !speechBubbleDismissed}
      <div
        class="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#102A56] text-white text-xs font-semibold shadow-xl border border-[#38CFFF]/30 animate-bounce cursor-pointer group"
        onclick={() => (isOpen = true)}
        role="button"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === 'Enter') isOpen = true;
        }}
      >
        <span>👋 Hey, CEO is here! Click to chat</span>
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            speechBubbleDismissed = true;
          }}
          class="text-white/60 hover:text-white ml-1 cursor-pointer"
          title="Dismiss tooltip"
          aria-label="Dismiss tooltip"
        >
          <Icon name="X" size={12} />
        </button>
      </div>
    {/if}

    <!-- Launcher Avatar Button -->
    <button
      type="button"
      onclick={() => (isOpen = true)}
      class="relative w-14 h-14 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
      aria-label="Open AI CEO Executive Chat"
      title="Open Master AI CEO Chat"
    >
      <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-1">
        <img
          src="/ezbo-ceo.png"
          alt="Master AI CEO"
          class="w-full h-full object-contain drop-shadow-xs"
          onerror={(e) => {
            // Fallback if logo not found
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      <!-- Glowing Status Beacon (Emerald / Cyan Live Pulse) -->
      <span class="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
    </button>
  </div>
{/if}

<!-- ====================================================================== -->
<!-- 2. CHATGPT-STYLE FLOATING GLASS WINDOW -->
<!-- ====================================================================== -->
{#if isOpen}
  <!-- Mobile viewport clamping (replaces legacy fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[520px] md:w-[580px] h-[78vh] max-h-[720px] for 375px zero-overflow) -->
  <div
    class="fixed bottom-4 right-2.5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-20px)] sm:w-[520px] md:w-[580px] max-w-full h-[78vh] max-h-[720px] bg-white/95 backdrop-blur-2xl border border-[#CFE2FA] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    role="dialog"
    aria-label="Master AI CEO Executive Chat"
  >
    <!-- Header -->
    <div
      class="h-16 px-4 sm:px-5 border-b border-[#E3ECF7] bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0 gap-2 select-none"
    >
      <!-- CEO Identity & Status -->
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="relative w-9 h-9 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shrink-0 shadow-xs">
          <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-0.5">
            <img src="/ezbo-ceo.png" alt="AI CEO" class="w-full h-full object-contain" />
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h3 class="font-extrabold text-xs sm:text-sm text-[#102A56] truncate">
              Master AI CEO
            </h3>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
              Online
            </span>
          </div>
          <p class="text-[10px] text-[#5E7694] truncate">
            Controls All 75 AI Specialist Helpers
          </p>
        </div>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- Prominent "⚡ Connect Channels" Button with Live Pulse -->
        <button
          type="button"
          onclick={openChannelsModal}
          class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#CFE2FA] text-[#1677FF] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
          title="Connect WhatsApp & Telegram"
          aria-label="Connect Multi-Channel Gateway"
        >
          <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-ping"></span>
          <span class="hidden xs:inline sm:inline">⚡ Connect Channels</span>
          <span class="inline xs:hidden sm:hidden">⚡ Channels</span>
        </button>

        <!-- Minimize (-) Button -->
        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="w-8 h-8 rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] border border-transparent hover:border-[#CFE2FA] flex items-center justify-center cursor-pointer transition-colors"
          title="Minimize to launcher"
          aria-label="Minimize Chat"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <!-- Close (✕) Button -->
        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="w-8 h-8 rounded-xl text-[#5E7694] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 flex items-center justify-center cursor-pointer transition-colors"
          title="Close chat"
          aria-label="Close Chat"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>

    <!-- ====================================================================== -->
    <!-- Conversation Stream (ChatGPT-like clean feed) -->
    <!-- ====================================================================== -->
    <div
      bind:this={messagesContainer}
      class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth bg-linear-to-b from-[#F8FAFC]/60 to-white/80"
    >
      {#if $chatMessages.length === 0 && !isSending}
        <!-- Welcome Hero with Quick Suggestions -->
        <div class="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-4 max-w-md mx-auto">
          <div class="w-14 h-14 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shadow-xs mb-3">
            <img src="/ezbo-ceo.png" alt="AI CEO" class="w-10 h-10 object-contain" />
          </div>
          <h4 class="text-base font-extrabold text-[#102A56]">
            Master AI CEO Ready
          </h4>
          <p class="text-xs text-[#5E7694] mt-1 leading-relaxed">
            Instruct the CEO directly, type <code class="text-[#1677FF] font-bold font-mono">/</code> to pick any of the 75 specialist helpers, or tap a quick prompt below.
          </p>

          <div class="flex flex-wrap justify-center gap-1.5 mt-4">
            {#each quickActions.slice(0, 4) as action}
              <button
                type="button"
                onclick={() => handleSelectQuickAction(action)}
                class="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3F8FF] border border-[#CFE2FA] text-[#102A56] hover:text-[#1677FF] text-xs font-semibold transition-all cursor-pointer shadow-2xs text-left"
              >
                {action.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#each $chatMessages as msg (msg.id)}
        {#if msg.role === 'user'}
          <!-- User Message Bubble (ChatGPT Pill on right) -->
          <div class="flex items-start justify-end gap-2">
            <div
              class="max-w-[85%] bg-[#1677FF] text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs"
            >
              <p class="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words font-medium">
                {msg.content}
              </p>
              <div class="text-[9px] text-[#CFE2FA] text-right mt-1 font-mono">
                {msg.timestamp}
              </div>
            </div>
            <div
              class="w-7 h-7 rounded-full bg-[#E4F0FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shrink-0 text-xs font-bold"
            >
              {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        {:else}
          <!-- Assistant / CEO Message (Clean, Card-Free Stream) -->
          <div class="flex items-start gap-2.5">
            <div
              class="w-7 h-7 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shrink-0 mt-0.5 shadow-2xs"
            >
              <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/ezbo-ceo.png" alt="AI CEO" class="w-5 h-5 object-contain" />
              </div>
            </div>

            <div class="max-w-[90%] space-y-2">
              <!-- Delegated Helper Badge if present -->
              {#if msg.toolMatched}
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F8FF] border border-[#CFE2FA] text-[10px] font-bold text-[#1677FF]">
                  <Icon name="Zap" size={10} />
                  <span>Delegated: {msg.toolMatched}</span>
                </div>
              {/if}

              <!-- Content Bubble -->
              <div
                class="bg-white/90 border {msg.status === 'error'
                  ? 'border-rose-200 bg-rose-50/30'
                  : 'border-[#E3ECF7]'} rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-[#102A56] shadow-xs space-y-2.5"
              >
                <!-- Rendered Image if present -->
                {#if msg.imageUrl}
                  <div class="rounded-xl overflow-hidden border border-[#E3ECF7] bg-[#F8FAFC] max-w-sm">
                    <img
                      src={msg.imageUrl}
                      alt="AI Generated Visual"
                      class="w-full h-auto object-cover max-h-72 rounded-xl"
                      loading="lazy"
                    />
                  </div>
                {/if}

                <!-- Rendered Markdown Text -->
                <div
                  class="prose prose-xs sm:prose-sm max-w-none text-[#102A56] leading-relaxed break-words"
                >
                  {@html renderMarkdown(msg.content)}
                </div>

                <!-- Footer with Copy Button & Timestamp -->
                <div class="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[10px] text-[#5E7694]">
                  <span class="font-mono">{msg.timestamp}</span>

                  <button
                    type="button"
                    onclick={() => copyText(msg.id, msg.content)}
                    class="px-2 py-0.5 rounded-md hover:bg-[#F3F8FF] text-[#5E7694] hover:text-[#1677FF] transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    title="Copy message content"
                  >
                    {#if copiedMessageId === msg.id}
                      <Icon name="Check" size={11} class="text-emerald-600" />
                      <span class="text-emerald-700">Copied</span>
                    {:else}
                      <Icon name="Copy" size={11} />
                      <span>Copy</span>
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/each}

      {#if isSending}
        <!-- Typing indicator -->
        <div class="flex items-start gap-2.5">
          <div
            class="w-7 h-7 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shrink-0 shadow-2xs"
          >
            <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src="/ezbo-ceo.png" alt="AI CEO" class="w-5 h-5 object-contain" />
            </div>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-[#E3ECF7] shadow-xs flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce [animation-delay:150ms]"></span>
            <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce [animation-delay:300ms]"></span>
            <span class="text-xs text-[#5E7694] ml-1.5 font-medium">CEO orchestrating...</span>
          </div>
        </div>
      {/if}
    </div>

    <!-- ====================================================================== -->
    <!-- Chat Input Bar & Popovers -->
    <!-- ====================================================================== -->
    <div class="relative p-3 sm:p-4 border-t border-[#E3ECF7] bg-white/95 shrink-0">
      <!-- 1. Plus (+) Quick Actions Popover -->
      {#if isPlusMenuOpen}
        <div
          class="absolute bottom-full left-4 mb-2 w-72 bg-white/95 backdrop-blur-xl border border-[#CFE2FA] rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div class="flex items-center justify-between px-2.5 py-1.5 border-b border-[#F1F5F9] text-xs font-bold text-[#102A56]">
            <span>Quick CEO Tools & Presets</span>
            <button
              type="button"
              onclick={() => (isPlusMenuOpen = false)}
              class="text-[#5E7694] hover:text-[#102A56] cursor-pointer"
            >
              <Icon name="X" size={14} />
            </button>
          </div>

          <div class="py-1 space-y-0.5 max-h-60 overflow-y-auto">
            {#each quickActions as action}
              <button
                type="button"
                onclick={() => handleSelectQuickAction(action)}
                class="w-full px-2.5 py-2 rounded-xl hover:bg-[#F3F8FF] text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
              >
                <div class="w-7 h-7 rounded-lg bg-[#F3F8FF] group-hover:bg-white border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shrink-0">
                  <Icon name={action.icon} size={14} />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-[#102A56] group-hover:text-[#1677FF] truncate">
                    {action.label}
                  </p>
                  <span class="text-[10px] text-[#5E7694]">{action.tag}</span>
                </div>
              </button>
            {/each}
          </div>

          <div class="pt-1 border-t border-[#F1F5F9] flex items-center justify-between px-2">
            <button
              type="button"
              onclick={() => {
                clearChatHistory();
                isPlusMenuOpen = false;
              }}
              class="text-[11px] text-rose-600 hover:text-rose-700 font-semibold py-1 flex items-center gap-1 cursor-pointer"
            >
              <Icon name="RotateCcw" size={12} />
              <span>Reset Chat History</span>
            </button>
          </div>
        </div>
      {/if}

      <!-- 2. Slash Command (/) Autocomplete Popover (Lists 75 AI Helpers) -->
      {#if isSlashOpen && filteredTools.length > 0}
        <div
          class="absolute bottom-full left-3 right-3 sm:left-4 sm:right-4 mb-2 max-h-64 bg-white/95 backdrop-blur-xl border border-[#CFE2FA] rounded-2xl shadow-2xl overflow-y-auto z-30 divide-y divide-[#F1F5F9]"
        >
          <div class="p-2.5 bg-[#F3F8FF] border-b border-[#CFE2FA] flex items-center justify-between text-xs font-bold text-[#102A56] sticky top-0 z-10">
            <div class="flex items-center gap-1.5">
              <span class="text-[#1677FF]">⚡</span>
              <span>Select Specialist Helper ({filteredTools.length} found)</span>
            </div>
            <span class="text-[10px] text-[#5E7694]">↑↓ to navigate • Enter to select</span>
          </div>

          {#each filteredTools as tool, idx}
            <button
              type="button"
              onclick={() => selectHelper(tool)}
              class="w-full px-3 py-2 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors {idx ===
              selectedSlashIndex
                ? 'bg-[#1677FF]/10 text-[#1677FF]'
                : 'hover:bg-[#F8FAFC] text-[#102A56]'}"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="px-1.5 py-0.5 rounded-md bg-[#1677FF]/10 text-[#1677FF] font-mono font-bold text-[11px] shrink-0">
                  {tool.code}
                </span>
                <div class="min-w-0">
                  <p class="text-xs font-bold truncate">{tool.name}</p>
                  <p class="text-[10px] text-[#5E7694] truncate">{tool.agentName} • {tool.categoryName}</p>
                </div>
              </div>

              {#if tool.badge}
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F3F8FF] border border-[#CFE2FA] text-[#1677FF] shrink-0">
                  {tool.badge}
                </span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Main Input Bar Form -->
      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        class="flex items-end gap-2"
      >
        <!-- Sleek '+' Plus Action Button (Replaces old image icon) -->
        <button
          type="button"
          onclick={() => {
            isPlusMenuOpen = !isPlusMenuOpen;
            if (isPlusMenuOpen) isSlashOpen = false;
          }}
          class="w-10 h-10 rounded-xl bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#CFE2FA] text-[#1677FF] transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
          title="Quick CEO Actions & Tools (+)"
          aria-label="Quick Actions"
        >
          <Icon name="Plus" size={20} />
        </button>

        <!-- Prompt Textarea -->
        <div class="flex-1 relative min-w-0">
          <textarea
            bind:this={textareaRef}
            bind:value={inputMessage}
            oninput={handleInput}
            onkeydown={handleKeyDown}
            rows="1"
            placeholder="Ask CEO anything, or type / to invoke any of 75 AI Helpers..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE2FA] text-xs sm:text-sm text-[#102A56] placeholder-[#889DB5] focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 bg-[#F8FAFC] resize-none max-h-32 leading-relaxed"
          ></textarea>
        </div>

        <!-- Send Button -->
        <button
          type="submit"
          disabled={isSending || !inputMessage.trim()}
          class="w-10 h-10 rounded-xl blue-btn text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
          title="Send message (Enter)"
          aria-label="Send message to AI CEO"
        >
          {#if isSending}
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {:else}
            <Icon name="ArrowRight" size={18} />
          {/if}
        </button>
      </form>

      <!-- Subtitle hint under input -->
      <div class="flex items-center justify-between mt-2 text-[10px] text-[#5E7694] px-1 flex-wrap gap-1">
        <span>
          Press <strong>Enter</strong> to send • Type <strong>/</strong> for 75 Helpers
        </span>
        <button
          type="button"
          onclick={openChannelsModal}
          class="text-[#1677FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>WhatsApp & Telegram Synced</span>
        </button>
      </div>
    </div>
  </div>
{/if}
