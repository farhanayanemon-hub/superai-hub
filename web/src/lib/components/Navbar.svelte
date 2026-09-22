<script lang="ts">
  import Icon from './Icon.svelte';
  import { isKeyValid, whatsappStatus } from '$lib/stores/userStore';

  let { onOpenByok, onOpenQr }: { onOpenByok?: () => void; onOpenQr?: () => void } = $props();
  let mobileMenuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
        <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
          <Icon name="Sparkles" class="text-emerald-400" size={20} />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg text-white tracking-tight">Super<span class="text-emerald-400">AI</span> Hub</span>
          <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/30">৫০+ টুলস</span>
        </div>
        <p class="text-[11px] text-slate-400">Micro-SaaS & WhatsApp AI</p>
      </div>
    </a>

    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
      <a href="#tools" class="hover:text-emerald-400 transition-colors">টুলস এক্সপ্লোর</a>
      <a href="#simulator" class="hover:text-emerald-400 transition-colors">হোয়াটসঅ্যাপ সিমুলেটর</a>
      <a href="#sandbox" class="hover:text-emerald-400 transition-colors">ফ্রি ট্রায়াল</a>
      <a href="#pricing" class="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
        প্রাইসিং
        <span class="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">৭৫% ছাড়</span>
      </a>
      <a href="/dashboard" class="hover:text-emerald-400 transition-colors">ড্যাশবোর্ড</a>
    </nav>

    <!-- Status & Action CTAs -->
    <div class="hidden sm:flex items-center gap-3">
      <!-- Gemini Key Badge Button -->
      <button
        onclick={onOpenByok}
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all {$isKeyValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'}"
        title="Gemini API Key স্ট্যাটাস"
      >
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 {$isKeyValid ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 {$isKeyValid ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
        </span>
        <Icon name="Key" size={13} />
        <span>{$isKeyValid ? 'Gemini রেডি' : 'BYOK Key দিন'}</span>
      </button>

      <!-- WhatsApp Status Badge Button -->
      <button
        onclick={onOpenQr}
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all {$whatsappStatus === 'connected' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'}"
        title="WhatsApp কানেকশন স্ট্যাটাস"
      >
        <Icon name="QrCode" size={13} class={$whatsappStatus === 'connected' ? 'text-emerald-400' : 'text-slate-400'} />
        <span>{$whatsappStatus === 'connected' ? 'WhatsApp লাইভ' : 'কানেক্ট WhatsApp'}</span>
      </button>

      <!-- Dashboard Link -->
      <a
        href="/dashboard"
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
      >
        <span>ড্যাশবোর্ড</span>
        <Icon name="ArrowRight" size={14} />
      </a>
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex items-center gap-2 sm:hidden">
      <button
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
      >
        <Icon name={mobileMenuOpen ? 'X' : 'Grid'} size={18} />
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Menu -->
  {#if mobileMenuOpen}
    <div class="sm:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
      <a href="#tools" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">টুলস এক্সপ্লোর</a>
      <a href="#simulator" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">হোয়াটসঅ্যাপ সিমুলেটর</a>
      <a href="#sandbox" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">ফ্রি ট্রায়াল</a>
      <a href="#pricing" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">প্রাইসিং (৭৫% ছাড়)</a>
      <a href="/dashboard" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-semibold text-emerald-400">ড্যাশবোর্ড ওপেন করুন</a>

      <div class="pt-3 border-t border-slate-800 flex flex-col gap-2">
        <button
          onclick={() => { mobileMenuOpen = false; onOpenByok?.(); }}
          class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200"
        >
          <Icon name="Key" size={14} />
          <span>{$isKeyValid ? 'Gemini কী সক্রিয়' : 'BYOK Key সেটআপ করুন'}</span>
        </button>
        <button
          onclick={() => { mobileMenuOpen = false; onOpenQr?.(); }}
          class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
        >
          <Icon name="QrCode" size={14} />
          <span>কানেক্ট WhatsApp</span>
        </button>
      </div>
    </div>
  {/if}
</header>
