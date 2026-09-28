<script lang="ts">
  import Icon from './Icon.svelte';
  import { isAuthenticated, currentUser, logout } from '$lib/stores/userStore';

  let mobileMenuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#08090d]/90 backdrop-blur-xl">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
        <div class="w-full h-full bg-[#08090d] rounded-[10px] flex items-center justify-center">
          <Icon name="Sparkles" class="text-amber-400" size={20} />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-lg text-white tracking-tight">Ezbo<span class="text-amber-400">Agents</span></span>
          <span class="px-2 py-0.5 text-[9px] font-bold bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/30 tracking-wider uppercase">Executive AI</span>
        </div>
        <p class="text-[11px] text-slate-400 font-mono">ezboagents.com</p>
      </div>
    </a>

    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
      <a href="/#tools" class="hover:text-amber-400 transition-colors">50+ Specialists</a>
      <a href="/#features" class="hover:text-amber-400 transition-colors">WhatsApp Engine</a>
      <a href="/#pricing" class="hover:text-amber-400 transition-colors flex items-center gap-1.5">
        Pricing
        <span class="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">VIP Launch</span>
      </a>
      <a href="/#faq" class="hover:text-amber-400 transition-colors">FAQ</a>
    </nav>

    <!-- Auth & Access CTAs -->
    <div class="hidden sm:flex items-center gap-3">
      {#if $isAuthenticated && $currentUser}
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#13151f] border border-amber-500/20 text-xs text-slate-300">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="font-medium text-white">{$currentUser.name}</span>
        </div>
        <a
          href="/dashboard"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold gold-btn text-slate-950 transition-all active:scale-95"
        >
          <span>Dashboard</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {:else}
        <!-- Log In Link -->
        <a
          href="/login"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all"
        >
          Log In
        </a>

        <!-- Sign Up CTA -->
        <a
          href="/signup"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold gold-btn text-slate-950 transition-all active:scale-95"
        >
          <span>Get Started Free</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {/if}
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex items-center gap-2 sm:hidden">
      <button
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="p-2 rounded-lg bg-[#13151f] border border-amber-500/20 text-slate-300"
        aria-label="Toggle Navigation Menu"
      >
        <Icon name={mobileMenuOpen ? 'X' : 'Grid'} size={18} />
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Menu -->
  {#if mobileMenuOpen}
    <div class="sm:hidden border-b border-amber-500/20 bg-[#0d0f15] px-4 py-4 space-y-3">
      <a href="/#tools" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-amber-400">50+ Specialists</a>
      <a href="/#features" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-amber-400">WhatsApp Engine</a>
      <a href="/#pricing" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-amber-400">Pricing (VIP Launch)</a>
      <a href="/#faq" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-amber-400">FAQ</a>

      <div class="pt-3 border-t border-white/10 flex flex-col gap-2">
        {#if $isAuthenticated && $currentUser}
          <a
            href="/dashboard"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold gold-btn text-slate-950"
          >
            <span>Open Dashboard</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {:else}
          <a
            href="/login"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center py-2 rounded-lg text-xs font-semibold bg-[#13151f] border border-white/10 text-slate-200"
          >
            Log In
          </a>
          <a
            href="/signup"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold gold-btn text-slate-950"
          >
            <span>Sign Up Free</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {/if}
      </div>
    </div>
  {/if}
</header>
