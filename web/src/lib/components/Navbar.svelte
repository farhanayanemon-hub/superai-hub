<script lang="ts">
  import Icon from './Icon.svelte';
  import { isAuthenticated, currentUser } from '$lib/stores/userStore';

  let mobileMenuOpen = $state(false);
</script>

<header class="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-colors">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-2.5 group">
      <img src="/logo.png" alt="EzboAgents" class="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-2xs group-hover:scale-105 transition-transform" />
      <span class="font-bold text-lg text-gray-900 tracking-tight">Ezbo<span class="text-[#4F46E5]">Agents</span></span>
    </a>

    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
      <a href="/#helpers" class="hover:text-gray-900 transition-colors">Helpers</a>
      <a href="/#features" class="hover:text-gray-900 transition-colors">WhatsApp & Telegram</a>
      <a href="/#pricing" class="hover:text-gray-900 transition-colors">Pricing</a>
      <a href="/#faq" class="hover:text-gray-900 transition-colors">FAQ</a>
    </nav>

    <!-- Auth & Access CTAs -->
    <div class="hidden md:flex items-center gap-3">
      {#if $isAuthenticated && $currentUser}
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700">
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="font-medium text-gray-900 truncate max-w-[130px]">{$currentUser.name}</span>
        </div>
        <a
          href={$currentUser.isSubscribed ? "/dashboard" : "/plans"}
          class="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg shadow-xs transition-all active:scale-95"
        >
          <span>{$currentUser.isSubscribed ? "Dashboard" : "Select Plan"}</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {:else}
        <!-- Log In Link (Secondary border button) -->
        <a
          href="/login"
          class="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-2xs transition-all"
        >
          Log in
        </a>

        <!-- Sign Up CTA (Primary Indigo CTA) -->
        <a
          href="/signup"
          class="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg shadow-xs transition-all active:scale-95"
        >
          <span>Get started</span>
          <Icon name="ArrowRight" size={14} />
        </a>
      {/if}
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex items-center gap-2 md:hidden">
      <button
        type="button"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
        aria-label="Toggle Navigation Menu"
      >
        <Icon name={mobileMenuOpen ? 'X' : 'Grid'} size={18} />
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Menu Drawer -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-b border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg transition-all">
      <div class="flex flex-col space-y-1">
        <a
          href="/#helpers"
          onclick={() => (mobileMenuOpen = false)}
          class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >Helpers</a>
        <a
          href="/#features"
          onclick={() => (mobileMenuOpen = false)}
          class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          WhatsApp & Telegram
        </a>
        <a
          href="/#pricing"
          onclick={() => (mobileMenuOpen = false)}
          class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Pricing
        </a>
        <a
          href="/#faq"
          onclick={() => (mobileMenuOpen = false)}
          class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          FAQ
        </a>
      </div>

      <div class="pt-3 border-t border-gray-100 flex flex-col gap-2">
        {#if $isAuthenticated && $currentUser}
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 min-w-0">
            <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
            <span class="font-medium text-gray-900 truncate min-w-0 flex-1">{$currentUser.name}</span>
            <span class="text-[11px] text-gray-500 font-mono ml-auto truncate max-w-[140px] shrink-0">{$currentUser.email}</span>
          </div>
          <a
            href={$currentUser.isSubscribed ? "/dashboard" : "/plans"}
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-xs transition-all"
          >
            <span>{$currentUser.isSubscribed ? "Dashboard" : "Select Plan"}</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {:else}
          <a
            href="/login"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-2xs transition-all"
          >
            Log in
          </a>
          <a
            href="/signup"
            onclick={() => (mobileMenuOpen = false)}
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-xs transition-all"
          >
            <span>Get started</span>
            <Icon name="ArrowRight" size={14} />
          </a>
        {/if}
      </div>
    </div>
  {/if}
</header>
