<script lang="ts">
  import Icon from './Icon.svelte';
  import { isAuthenticated, currentUser, logout } from '$lib/stores/userStore';

  let mobileMenuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-xs">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all">
        <div class="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
          <Icon name="Sparkles" class="text-blue-600" size={20} />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-lg text-slate-900 tracking-tight">Ezbo<span class="text-blue-600">Agents</span></span>
          <span class="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200 tracking-wider uppercase">Executive AI</span>
        </div>
        <p class="text-[11px] text-slate-500 font-mono">ezboagents.com</p>
      </div>
    </a>

    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
      <a href="/#features" class="hover:text-blue-600 transition-colors">WhatsApp Engine</a>
      <a href="/#pricing" class="hover:text-blue-600 transition-colors flex items-center gap-1.5">
        Pricing
        <span class="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">2 Plans</span>
      </a>
      <a href="/#faq" class="hover:text-blue-600 transition-colors">FAQ</a>
    </nav>

    <!-- Auth & Access CTAs -->
    <div class="hidden sm:flex items-center gap-3">
      {#if $isAuthenticated && $currentUser}
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="font-medium text-slate-900">{$currentUser.name}</span>
        </div>
        <a
          href={$currentUser.isSubscribed ? "/dashboard" : "/plans"}
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold blue-btn text-white transition-all active:scale-95 shadow-sm"
        >
          <span>{$currentUser.isSubscribed ? "Dashboard" : "Select Plan"}</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {:else}
        <!-- Log In Link -->
        <a
          href="/login"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
        >
          Log In
        </a>

        <!-- Sign Up CTA -->
        <a
          href="/signup"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold blue-btn text-white transition-all active:scale-95 shadow-sm"
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
        class="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
        aria-label="Toggle Navigation Menu"
      >
        <Icon name={mobileMenuOpen ? 'X' : 'Grid'} size={18} />
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Menu -->
  {#if mobileMenuOpen}
    <div class="sm:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
      <a href="/#features" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-700 hover:text-blue-600">WhatsApp Engine</a>
      <a href="/#pricing" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-700 hover:text-blue-600">Pricing (2 Plans)</a>
      <a href="/#faq" onclick={() => (mobileMenuOpen = false)} class="block py-1 text-sm font-medium text-slate-700 hover:text-blue-600">FAQ</a>

      <div class="pt-3 border-t border-slate-200 flex flex-col gap-2">
        {#if $isAuthenticated && $currentUser}
          <a
            href={$currentUser.isSubscribed ? "/dashboard" : "/plans"}
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold blue-btn text-white"
          >
            <span>{$currentUser.isSubscribed ? "Open Dashboard" : "Select Plan"}</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {:else}
          <a
            href="/login"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full text-center py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
          >
            Log In
          </a>
          <a
            href="/signup"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold blue-btn text-white"
          >
            <span>Get Started Free</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {/if}
      </div>
    </div>
  {/if}
</header>
