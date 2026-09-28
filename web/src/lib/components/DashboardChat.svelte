<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import {
    chatMessages,
    addChatMessage,
    clearChatHistory,
    apiKey,
    isKeyValid,
    whatsappStatus,
    currentUser,
    type ChatMessage
  } from '$lib/stores/userStore';
  import { marked } from 'marked';
  import { onMount, tick } from 'svelte';

  let inputMessage = $state('');
  let isSending = $state(false);
  let messagesContainer = $state<HTMLDivElement | null>(null);
  let copiedMessageId = $state<string | null>(null);

  const quickPrompts = [
    { label: 'Viral Facebook Ad', text: 'Write a high-converting Facebook ad copy for a luxury wireless noise-canceling headphone.' },
    { label: 'Generate AI Image', text: '/image a futuristic cyberpunk street in neon rain with reflections, 8k cinematic' },
    { label: 'Excel Formula', text: 'Excel: Give me a formula to compare Column A and Column B and highlight duplicate emails.' },
    { label: 'Executive Leave Email', text: 'Draft a professional 3-day sick leave email to my senior manager.' },
    { label: 'Upwork Proposal', text: 'Write a winning Upwork proposal for a Full-Stack SvelteKit & Node.js Developer job post.' },
    { label: 'WhatsApp Bot Help', text: '/help' }
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
      // Send message to our server proxy endpoint which reaches WhatsApp Engine / Brain Router
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          apiKey: $apiKey || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Engine communication error (${response.status})`);
      }

      const data = await response.json();

      let replyContent = '';
      let toolMatched: string | undefined = undefined;
      let imageUrl: string | undefined = undefined;

      if (data.result) {
        if (data.result.type === 'image') {
          imageUrl = data.result.image?.imageUrl || data.result.imageUrl || (typeof data.result.image === 'string' ? data.result.image : undefined);
          replyContent = data.result.caption || data.result.image?.caption || `🎨 **AI Image Generated Successfully!**\n\nPrompt: "${text.replace(/^\/image\s*/i, '')}"`;
          toolMatched = data.result.toolMatched || 'ai_image_generator';
        } else if (data.result.text) {
          replyContent = data.result.text;
          toolMatched = data.result.toolMatched;
        } else if (typeof data.result === 'string') {
          replyContent = data.result;
        }
      } else if (data.error) {
        replyContent = `⚠️ **Assistant Error:** ${data.error}`;
      } else {
        replyContent = 'I received your message but no output was generated. Please try again or check your Gemini API key.';
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
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Connection Issue:** Unable to reach WhatsApp Central Brain.\n\nDetails: ${err.message}\n\nPlease verify your Gemini API key in the BYOK tab or ensure the engine is online.`,
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
    } catch (e) {
      return content.replace(/\n/g, '<br/>');
    }
  }
</script>

<div class="h-full flex flex-col bg-[#090a0f] rounded-2xl border border-amber-500/20 shadow-2xl overflow-hidden">
  <!-- Top Bar -->
  <div class="px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#0e1017]/90 backdrop-blur-md flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 p-0.5 shadow-md shadow-amber-500/10">
        <div class="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
          <Icon name="Sparkles" class="text-amber-400" size={18} />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-sm sm:text-base font-bold text-white">Central Brain AI Chat</h2>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-300 tracking-wide uppercase">
            WhatsApp Live Sync
          </span>
        </div>
        <p class="text-[11px] text-slate-400 hidden sm:block">Full parity with your personal encrypted WhatsApp self-assistant</p>
      </div>
    </div>

    <!-- Status Badges & Actions -->
    <div class="flex items-center gap-2">
      <!-- WhatsApp Status Indicator -->
      <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141622] border border-white/10 text-[11px] text-slate-300">
        <span class="w-2 h-2 rounded-full {$whatsappStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
        <span>WhatsApp: {$whatsappStatus === 'connected' ? 'Connected' : 'QR Standby'}</span>
      </div>

      <!-- Gemini BYOK Indicator -->
      <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141622] border border-white/10 text-[11px] text-slate-300">
        <Icon name="Key" size={12} class={$isKeyValid ? 'text-amber-400' : 'text-slate-400'} />
        <span>BYOK: {$isKeyValid ? 'Direct Key Active' : 'Shared Cloud'}</span>
      </div>

      <!-- Clear Chat Button -->
      <button
        type="button"
        onclick={clearChatHistory}
        class="p-2 rounded-lg bg-[#141622] hover:bg-[#1a1d2c] border border-white/10 text-slate-400 hover:text-slate-200 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
        title="Clear chat history"
      >
        <Icon name="RotateCcw" size={14} />
        <span class="hidden sm:inline">Clear</span>
      </button>
    </div>
  </div>

  <!-- Messages List Container -->
  <div
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth"
  >
    {#each $chatMessages as msg (msg.id)}
      {#if msg.role === 'user'}
        <!-- User Bubble -->
        <div class="flex items-start justify-end gap-2.5">
          <div class="max-w-[85%] sm:max-w-[70%] bg-[#1c202e] border border-amber-500/20 text-slate-100 rounded-2xl rounded-tr-sm p-4 shadow-lg">
            <p class="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            <div class="text-[10px] text-amber-300/70 text-right mt-1.5 font-mono">{msg.timestamp}</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 text-xs font-bold">
            {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      {:else}
        <!-- Assistant Bubble -->
        <div class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-inner">
            <Icon name="Sparkles" size={16} />
          </div>
          <div class="max-w-[90%] sm:max-w-[80%] bg-[#10121a] border border-white/10 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-xl text-slate-200 space-y-3">
            <!-- Tool Badge Tag if matched -->
            {#if msg.toolMatched}
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-300 tracking-wide uppercase">
                <Icon name="Zap" size={11} />
                <span>Auto-routed: {msg.toolMatched}</span>
              </div>
            {/if}

            <!-- Inline Generated Image -->
            {#if msg.imageUrl}
              <div class="rounded-xl overflow-hidden border border-white/10 bg-[#08090d] mt-1 max-w-md group relative">
                <img
                  src={msg.imageUrl}
                  alt="AI Generated Artwork"
                  class="w-full h-auto object-cover max-h-80 rounded-xl"
                  loading="lazy"
                />
                <div class="absolute bottom-2 right-2">
                  <a
                    href={msg.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="px-2.5 py-1 rounded-lg bg-[#08090d]/80 hover:bg-[#12141f] border border-white/20 text-slate-200 text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors"
                  >
                    <Icon name="ExternalLink" size={12} />
                    <span>View HD</span>
                  </a>
                </div>
              </div>
            {/if}

            <!-- Formatted Markdown Content -->
            <div class="prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-200 leading-relaxed break-words font-sans">
              {@html renderMarkdown(msg.content)}
            </div>

            <!-- Footer: Timestamp & Copy Button -->
            <div class="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-slate-500">
              <span class="font-mono">{msg.timestamp}</span>
              <button
                type="button"
                onclick={() => copyText(msg.id, msg.content)}
                class="hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
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

    <!-- Typing Loader Indicator -->
    {#if isSending}
      <div class="flex items-start gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
          <Icon name="Sparkles" size={16} />
        </div>
        <div class="bg-[#10121a] border border-amber-500/20 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-300 text-xs flex items-center gap-2 shadow-md">
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
          </div>
          <span class="text-slate-400 font-medium">Consulting WhatsApp Central Brain...</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Quick Starter Prompt Chips -->
  <div class="px-4 py-2 bg-[#0c0d14] border-t border-white/[0.06] overflow-x-auto no-scrollbar shrink-0">
    <div class="flex items-center gap-2 whitespace-nowrap">
      <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mr-1 flex items-center gap-1">
        <Icon name="Zap" size={11} class="text-amber-400" />
        <span>Try:</span>
      </span>
      {#each quickPrompts as prompt}
        <button
          type="button"
          onclick={() => selectPrompt(prompt.text)}
          class="px-2.5 py-1 rounded-lg bg-[#141622] hover:bg-[#1a1d2c] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-xs transition-colors cursor-pointer"
        >
          {prompt.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Input Bar -->
  <div class="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0e1017]/95 backdrop-blur-md shrink-0">
    <form onsubmit={(e) => { e.preventDefault(); handleSend(); }} class="flex items-end gap-2">
      <!-- Image Shortcut Button -->
      <button
        type="button"
        onclick={() => (inputMessage = '/image ')}
        class="p-2.5 rounded-xl bg-[#141622] hover:bg-[#1a1d2c] border border-white/10 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
        title="Insert /image command for AI art synthesis"
      >
        <Icon name="Image" size={18} />
      </button>

      <!-- Input Field -->
      <div class="flex-1 relative">
        <textarea
          bind:value={inputMessage}
          onkeydown={handleKeyDown}
          rows="1"
          placeholder="Ask anything, draft emails, copywrite, or type /image [prompt]..."
          class="w-full bg-[#08090d] border border-white/10 focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none resize-none transition-all max-h-32"
        ></textarea>
      </div>

      <!-- Send Button -->
      <button
        type="submit"
        disabled={isSending || !inputMessage.trim()}
        class="p-2.5 rounded-xl gold-btn text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center"
        title="Send message"
      >
        <Icon name="ArrowRight" size={18} />
      </button>
    </form>
    <div class="flex items-center justify-between mt-2 text-[10px] text-slate-500 px-1">
      <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line</span>
      <span class="text-amber-400/80">Direct WhatsApp Central Brain Sync</span>
    </div>
  </div>
</div>
