<script lang="ts">
  import Icon from './Icon.svelte';

  interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
    imageUrl?: string;
  }

  let messages = $state<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Write a high-converting viral Facebook ad copy for our oversized cotton T-shirt! Offer: 20% OFF.',
      time: '10:42 PM'
    },
    {
      id: '2',
      sender: 'bot',
      text: `🔥 *Beat the Heat in Style! Premium 100% Combed Cotton Oversized T-Shirt* 🔥\n\nTired of stiff, sweaty tees? Upgrade your everyday wardrobe with our ultra-breathable, cloud-soft combed cotton essentials.\n\n✨ *Why You'll Love It:*\n• 100% Ring-Spun Combed Cotton—zero shrinkage, zero color fade\n• Modern drop-shoulder relaxed fit\n• Pre-shrunk heavyweight fabric that stays crisp wash after wash\n\n💥 *Today's Exclusive Drop:*\nFlat 20% OFF + *Free Express Shipping* when you order 2 or more! 🚚\n\n🛍️ *To Order:* Reply with your Size, Delivery Address & Phone Number to claim your discount!`,
      time: '10:42 PM'
    }
  ]);

  let inputText = $state('');
  let isTyping = $state(false);

  const samplePrompts = [
    { label: '👕 Viral Ad Copy', text: 'Write a high-converting viral Facebook ad copy for running sneakers' },
    { label: '📧 Sick Leave Email', text: 'Draft a professional 3-day sick leave email to my direct manager' },
    { label: '📊 Excel Formula', text: 'Excel: What is the formula to lookup phone numbers in Column B based on names in Column A?' },
    { label: '🎨 /image Cyberpunk City', text: '/image a futuristic cyberpunk neon cityscape in rain, 8k cinematic lighting' }
  ];

  function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function handleSend(customText?: string) {
    const query = (customText || inputText).trim();
    if (!query || isTyping) return;

    const userTime = getCurrentTime();
    messages = [
      ...messages,
      {
        id: String(Date.now()),
        sender: 'user',
        text: query,
        time: userTime
      }
    ];

    inputText = '';
    isTyping = true;

    // Simulate brain routing and response
    setTimeout(() => {
      let botResponse = '';
      let imageUrl: string | undefined = undefined;

      if (query.startsWith('/image') || query.toLowerCase().includes('draw') || query.toLowerCase().includes('picture')) {
        const cleanPrompt = query.replace('/image', '').trim() || 'futuristic glowing neon cityscape, 8k cinematic masterpiece';
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=800&height=500&nologo=true`;
        botResponse = `🎨 *Your AI Image is ready:*\n\n*Prompt:* "${cleanPrompt}"\n\nHigh-resolution image dispatched directly to your WhatsApp!`;
      } else if (query.toLowerCase().includes('email') || query.toLowerCase().includes('leave')) {
        botResponse = `📄 *Subject: Sick Leave Application - [Your Name]*\n\nDear [Manager's Name],\n\nI am writing to inform you that I have suddenly fallen unwell and require medical leave from [Start Date] to [End Date], as advised by my physician.\n\nI have delegated my critical daily tasks to [Colleague's Name] to maintain operational flow. I will check urgent communications periodically if my health permits.\n\nThank you for your understanding.\n\nWarm regards,\n*[Your Name]*\n*[Designation]*`;
      } else if (query.toLowerCase().includes('formula') || query.toLowerCase().includes('excel') || query.toLowerCase().includes('sheet')) {
        botResponse = `📊 *Excel / Google Sheets Formula:*\n\n\`\`\`excel\n=XLOOKUP(E2, A2:A100, B2:B100, "Not Found")\n\`\`\`\n\n💡 *Formula Breakdown:*\n• \`E2\`: The target name to search for.\n• \`A2:A100\`: Lookup array containing all names.\n• \`B2:B100\`: Return array containing corresponding phone numbers.\n• For legacy Excel: \`=VLOOKUP(E2, A2:B100, 2, FALSE)\``;
      } else {
        botResponse = `✅ *SuperAI Central Brain Response:*\n\nI have analyzed your prompt! SuperAI Hub\'s Gemini 1.5 Flash brain automatically selects the optimal tool from your 50+ catalog to deliver instant results.\n\n💡 Simply message your own WhatsApp number at any time to receive real-time answers and generated content!`;
      }

      messages = [
        ...messages,
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: botResponse,
          time: getCurrentTime(),
          imageUrl
        }
      ];

      isTyping = false;
    }, 1800);
  }
</script>

<div class="relative w-full max-w-md mx-auto">
  <!-- Outer Glow Backdrop -->
  <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/30 rounded-[38px] blur-xl opacity-70"></div>

  <!-- Smartphone Frame -->
  <div class="relative rounded-[36px] bg-slate-900 border-4 border-slate-700/80 shadow-2xl overflow-hidden flex flex-col h-[620px]">
    <!-- Phone Top Speaker & Camera Notch -->
    <div class="w-full bg-slate-950 py-1.5 flex justify-center items-center relative z-20">
      <div class="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-end px-3">
        <div class="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
      </div>
    </div>

    <!-- WhatsApp Header Bar -->
    <div class="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md relative z-10">
      <div class="flex items-center gap-2.5">
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center border-2 border-emerald-400/50 shadow-inner">
            <Icon name="Bot" size={22} class="text-white" />
          </div>
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full"></div>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h4 class="font-bold text-sm tracking-tight text-white leading-none">SuperAI Assistant</h4>
            <span class="text-[10px] bg-emerald-600/60 px-1 py-0.2 rounded text-emerald-100 font-mono">Self-Bot</span>
          </div>
          <p class="text-[11px] text-emerald-200/90 mt-0.5 font-sans">
            {#if isTyping}
              <span class="animate-pulse font-medium text-emerald-100">typing...</span>
            {:else}
              Online • Message Yourself
            {/if}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 text-emerald-100/90">
        <Icon name="Sparkles" size={18} />
        <Icon name="Shield" size={18} />
      </div>
    </div>

    <!-- Chat Messages Window -->
    <div
      class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] relative"
      style="background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 16px 16px;"
    >
      <!-- Anti-Ban Security Notice Bubble -->
      <div class="text-center my-1">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300 rounded-full">
          <Icon name="Shield" size={11} class="text-emerald-400" />
          <span>Strict Self-Scope Active (100% Anti-Ban & Private)</span>
        </span>
      </div>

      {#each messages as msg (msg.id)}
        <div class="flex flex-col {msg.sender === 'user' ? 'items-end' : 'items-start'}">
          <div
            class="max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md relative text-xs leading-relaxed {msg.sender === 'user'
              ? 'bg-[#005c4b] text-emerald-50 rounded-tr-none'
              : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/40'}"
          >
            {#if msg.imageUrl}
              <div class="mb-2 rounded-xl overflow-hidden border border-slate-600/50 bg-slate-900">
                <img
                  src={msg.imageUrl}
                  alt="AI Generated Preview"
                  class="w-full h-44 object-cover"
                  loading="lazy"
                />
              </div>
            {/if}

            <div class="whitespace-pre-line font-sans">{msg.text}</div>

            <div class="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
              <span>{msg.time}</span>
              {#if msg.sender === 'user'}
                <Icon name="CheckCheck" size={13} class="text-cyan-400" />
              {/if}
            </div>
          </div>
        </div>
      {/each}

      {#if isTyping}
        <div class="flex items-start">
          <div class="bg-[#202c33] text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 border border-slate-700/40">
            <span class="flex gap-1">
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
            <span class="text-[11px] text-slate-400">SuperAI Brain is generating...</span>
          </div>
        </div>
      {/if}
    </div>

    <!-- Quick Prompt Pills -->
    <div class="bg-slate-950/90 border-t border-slate-800 px-3 py-2 overflow-x-auto flex gap-1.5 no-scrollbar">
      {#each samplePrompts as chip}
        <button
          onclick={() => handleSend(chip.text)}
          class="shrink-0 px-2.5 py-1 text-[11px] bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 rounded-full transition-all"
        >
          {chip.label}
        </button>
      {/each}
    </div>

    <!-- Input Form Bar -->
    <div class="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-slate-800">
      <input
        type="text"
        bind:value={inputText}
        placeholder="Type a message to yourself..."
        onkeydown={(e) => e.key === 'Enter' && handleSend()}
        class="flex-1 bg-[#2a3942] text-slate-100 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-emerald-500/50 focus:outline-none"
      />
      <button
        onclick={() => handleSend()}
        disabled={isTyping || !inputText.trim()}
        class="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/30"
      >
        <Icon name="Send" size={15} />
      </button>
    </div>
  </div>
</div>
