<script lang="ts">
  import Icon from './Icon.svelte';
  import { isAuthenticated, currentUser, logout } from '$lib/stores/userStore';

  let mobileMenuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 w-full ui-navbar">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1677FF] to-[#38CFFF] p-[1.5px] shadow-xs group-hover:shadow-md transition-all">
        <div class="w-full h-full bg-white rounded-[10.5px] flex items-center justify-center">
          <Icon name="Sparkles" class="text-[#1677FF]" size={20} />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-lg text-[#102A56] tracking-tight">Ezbo<span class="text-[#1677FF]">Agents</span></span>
          <span class="hidden min-[380px]:inline-flex px-2 py-0.5 text-[9px] font-bold ui-badge-primary rounded-full tracking-wider uppercase">Executive AI</span>
        </div>
        <p class="text-[11px] text-[#5E7694] font-mono">ezboagents.com</p>
      </div>
    </a>

    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-7 text-sm font-semibold text-[#4B6382]">
      <a href="/#features" class="hover:text-[#1677FF] transition-colors">WhatsApp Engine</a>
      <a href="/#pricing" class="hover:text-[#1677FF] transition-colors flex items-center gap-1.5">
        Pricing
        <span class="px-2 py-0.5 text-[10px] font-bold ui-badge-primary rounded-full">2 Plans</span>
      </a>
      <a href="/#faq" class="hover:text-[#1677FF] transition-colors">FAQ</a>
    </nav>

    <!-- Auth & Access CTAs -->
    <div class="hidden md:flex items-center gap-3">
      {#if $isAuthenticated && $currentUser}
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] text-xs text-[#102A56]">
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="font-semibold text-[#102A56] truncate max-w-[120px]">{$currentUser.name}</span>
        </div>
        <a
          href={$currentUser.isSubscribed ? "/dashboard" : "/plans"}
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold blue-btn text-white transition-all active:scale-95"
        >
          <span>{$currentUser.isSubscribed ? "Dashboard" : "Select Plan"}</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {:else}
        <!-- Log In Link -->
        <a
          href="/login"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B6382] hover:text-[#102A56] hover:bg-[#F3F8FF] border border-transparent hover:border-[#E3ECF7] transition-all"
        >
          Log In
        </a>

        <!-- Sign Up CTA -->
        <a
          href="/signup"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold blue-btn text-white transition-all active:scale-95"
        >
          <span>Get Started Free</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {/if}
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex items-center gap-2 md:hidden">
      <button
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] text-[#102A56] hover:border-[#1677FF] flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Toggle Navigation Menu"
      >
        <Icon name={mobileMenuOpen ? 'X' : 'Grid'} size={18} />
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-b border-[#E3ECF7] bg-white px-4 py-4 space-y-3 shadow-lg">
      <a href="/#features" onclick={() => (mobileMenuOpen = false)} class="block py-2 text-sm font-semibold text-[#102A56] hover:text-[#1677FF]">WhatsApp Engine</a>
      <a href="/#pricing" onclick={() => (mobileMenuOpen = false)} class="block py-2 text-sm font-semibold text-[#102A56] hover:text-[#1677FF]">Pricing (2 Plans)</a>
      <a href="/#faq" onclick={() => (mobileMenuOpen = false)} class="block py-2 text-sm font-semibold text-[#102A56] hover:text-[#1677FF]">FAQ</a>

      <div class="pt-3 border-t border-[#E3ECF7] flex flex-col gap-2">
        {#if $isAuthenticated && $currentUser}
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] text-xs text-[#102A56] min-w-0">
            <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
            <span class="font-semibold text-[#102A56] truncate min-w-0 flex-1">{$currentUser.name}</span>
            <span class="text-[10px] text-[#5E7694] font-mono ml-auto truncate max-w-[140px] shrink-0">{$currentUser.email}</span>
          </div>
          <a
            href={$currentUser.isSubscribed ? "/dashboard" : "/plans"}
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold blue-btn text-white"
          >
            <span>{$currentUser.isSubscribed ? "Open Dashboard" : "Select Plan"}</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {:else}
          <a
            href="/login"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full text-center py-2.5 rounded-xl text-xs font-semibold btn-secondary"
          >
            Log In
          </a>
          <a
            href="/signup"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold blue-btn text-white"
          >
            <span>Get Started Free</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {/if}
      </div>
    </div>
  {/if}
</header>
