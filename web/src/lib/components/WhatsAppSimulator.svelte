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
      text: 'টি-শার্টের জন্য একটা ভাইরাল ফেসবুক অ্যাড কপি বানিয়ে দাও তো! অফার: ২০% ছাড়।',
      time: '10:42 PM'
    },
    {
      id: '2',
      sender: 'bot',
      text: `🔥 *গরমের দিনে কুল লুক! প্রিমিয়াম ১০০% কম্বড কটন টি-শার্ট* 🔥\n\nগরমে ঘেমে ক্লান্ত? আর নয় অস্বস্তি! সাধারণ টি-শার্টের দিন শেষ, গায়ে জড়ান সুপার সফট ও ব্রিদেবল প্রিমিয়াম ফেব্রিকে তৈরি টি-শার্ট।\n\n✨ *কেন এটি আপনার পছন্দের শীর্ষে থাকবে?*\n• ১০০% প্রিমিয়াম সুতি কাপড়—রং নষ্ট বা ফেড হওয়ার ভয় নেই\n• আল্ট্রা কমফোর্ট ও স্টাইলিশ ফিট\n• প্রি-শ্রাঙ্ক ফেব্রিক—ধোয়ার পরও সাইজ পারফেক্ট\n\n💥 *আজকের স্পেশাল অফার:*\nফ্ল্যাট ২০% ছাড় + যেকোনো ৩টি নিলে সারাদেশে *ডেলিভারি ফ্রি!* 🚚\n\n🛍️ *অর্ডার করতে:* ইনবক্সে আপনার নাম, ঠিকানা ও ফোন নম্বর পাঠিয়ে দিন এখনই!`,
      time: '10:42 PM'
    }
  ]);

  let inputText = $state('');
  let isTyping = $state(false);

  const samplePrompts = [
    { label: '👕 টি-শার্টের ভাইরাল অ্যাড', text: 'টি-শার্টের জন্য একটি আকর্ষণীয় ফেসবুক অ্যাড লিখে দাও' },
    { label: '📧 ছুটির প্রফেশনাল ইমেইল', text: 'বসের কাছে ৩ দিনের অসুস্থতাজনিত ছুটির প্রফেশনাল ইমেইল ড্রাফট করো' },
    { label: '📊 এক্সেল VLOOKUP ফর্মুলা', text: 'এক্সেল: Column A এর নাম দেখে Column B এর ফোন নম্বর বের করার ফর্মুলা কী?' },
    { label: '🎨 /image সাইবারপঙ্ক ঢাকা', text: '/image a futuristic cyberpunk Dhaka city street with neon lights in rain, 8k cinematic' }
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

      if (query.startsWith('/image') || query.includes('ছবি')) {
        const cleanPrompt = query.replace('/image', '').trim() || 'futuristic futuristic city, neon, photorealistic 8k';
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=800&height=500&nologo=true`;
        botResponse = `🎨 আপনার রিকোয়েস্ট অনুযায়ী AI ইমেজ রেডি করা হয়েছে:\n\n*প্রম্পট:* "${cleanPrompt}"\n\nসরাসরি WhatsApp-এ হাই-রেজ্যুলিউশনে ছবি পাঠানো হয়েছে!`;
      } else if (query.includes('ইমেইল') || query.includes('ছুটি') || query.includes('email')) {
        botResponse = `📄 *Subject: Sick Leave Application - [Your Name]*\n\nDear [Manager's Name],\n\nI am writing to inform you that I have suddenly fallen ill and under my doctor's advice, I need to take medical leave from [Start Date] to [End Date].\n\nI have delegated my urgent daily tasks to [Colleague's Name] to ensure workflow continuity. I will monitor critical emails intermittently as my health allows.\n\nThank you for your understanding.\n\nBest regards,\n*[Your Name]*\n*[Designation]*`;
      } else if (query.includes('ফর্মুলা') || query.includes('excel') || query.includes('এক্সেল')) {
        botResponse = `📊 *Excel / Google Sheets Formula:*\n\n\`\`\`excel\n=XLOOKUP(E2, A2:A100, B2:B100, "Not Found")\n\`\`\`\n\n💡 *ব্যাখ্যা:*\n• \`E2\`: আপনি যে নামটি খুঁজতে চান।\n• \`A2:A100\`: নামের কলাম রেঞ্জ।\n• \`B2:B100\`: যেখান থেকে ফোন নম্বর আউটপুট আসবে।\n• পুরানো এক্সেলে: \`=VLOOKUP(E2, A2:B100, 2, FALSE)\` ব্যবহার করতে পারেন।`;
      } else {
        botResponse = `✅ *SuperAI Central Brain রেসপন্স:*\n\nআপনার রিকোয়েস্টটি বুঝতে পেরেছি! SuperAI Hub এর নিজস্ব Gemini 1.5 Flash ব্রেন স্বয়ংক্রিয়ভাবে সঠিক টুল সিলেক্ট করে আপনাকে নিখুঁত ফলাফল দিতে প্রস্তুত।\n\n💡 আপনি সরাসরি আপনার নিজের WhatsApp এ যেকোনো সময় বাংলায় মেসেজ পাঠালেই তাৎক্ষণিক রেজাল্ট পাবেন!`;
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
          <span>Strict Self-Scope Active (১০০% ব্যান-মুক্ত ও প্রাইভেট)</span>
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
            <span class="text-[11px] text-slate-400">SuperAI ব্রেন রেডি করছে...</span>
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
        placeholder="নিজের ইনবক্সে মেসেজ লিখুন..."
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
