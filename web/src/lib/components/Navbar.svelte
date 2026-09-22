<script lang="ts">
  import Icon from './Icon.svelte';
  import { isAuthenticated, currentUser, logout } from '$lib/stores/userStore';

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
          <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/30">50+ Tools</span>
        </div>
        <p class="text-[11px] text-slate-400">ezboagents.com</p>
      </div>
    </a>

    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
      <a href="/#tools" class="hover:text-emerald-400 transition-colors">50+ Tools</a>
      <a href="/#features" class="hover:text-emerald-400 transition-colors">WhatsApp Engine</a>
      <a href="/#pricing" class="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
        Pricing
        <span class="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">75% OFF</span>
      </a>
      <a href="/#faq" class="hover:text-emerald-400 transition-colors">FAQ</a>
    </nav>

    <!-- Auth & Access CTAs -->
    <div class="hidden sm:flex items-center gap-3">
      {#if $isAuthenticated && $currentUser}
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="font-medium text-white">{$currentUser.name}</span>
        </div>
        <a
          href="/dashboard"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
        >
          <span>Dashboard</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {:else}
        <!-- Log In Link -->
        <a
          href="/login"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
        >
          Log In
        </a>

        <!-- Sign Up CTA -->
        <a
          href="/signup"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
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
        class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
        aria-label="Toggle Navigation Menu"
      >
        <Icon name={mobileMenuOpen ? 'X' : 'Grid'} size={18} />
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Menu -->
  {#if mobileMenuOpen}
    <div class="sm:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
      <a href="/#tools" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">50+ Tools</a>
      <a href="/#features" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">WhatsApp Engine</a>
      <a href="/#pricing" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">Pricing (75% OFF)</a>
      <a href="/#faq" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-300 hover:text-emerald-400">FAQ</a>

      <div class="pt-3 border-t border-slate-800 flex flex-col gap-2">
        {#if $isAuthenticated && $currentUser}
          <a
            href="/dashboard"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950"
          >
            <span>Open Dashboard</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {:else}
          <a
            href="/login"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200"
          >
            Log In
          </a>
          <a
            href="/signup"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950"
          >
            <span>Sign Up Free</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {/if}
      </div>
    </div>
  {/if}
</header>
