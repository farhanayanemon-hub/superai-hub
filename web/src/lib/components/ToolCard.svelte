<script lang="ts">
  import Icon from './Icon.svelte';
  import BrandIcon from './BrandIcon.svelte';
  import type { AITool } from '$lib/config/tools';
  import { openToolDrawer, subscription, isHelperUnlocked } from '$lib/stores/userStore';
  import { plansStore } from '$lib/stores/plansStore';
  import { goto } from '$app/navigation';

  let { tool }: { tool: AITool } = $props();

  const isUnlocked = $derived(
    isHelperUnlocked(tool.id, $subscription?.tier, $plansStore)
  );

  function handleClick() {
    if (!isUnlocked) {
      goto('/plans');
      return;
    }
    openToolDrawer(tool);
  }
</script>

<div
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
  class="group relative rounded-2xl glass-card p-4 sm:p-5 flex flex-col justify-between cursor-pointer overflow-hidden transition-all duration-200 {isUnlocked ? '' : 'hover:border-amber-300'}"
>
  <div class="relative z-10">
    <!-- Top Header: Helper Code, Icon & Category Pill -->
    <div class="flex items-start justify-between gap-2 mb-3.5 flex-wrap sm:flex-nowrap">
      <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <!-- Clean Icon Avatar -->
        <div
          class="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] group-hover:border-[#1677FF] group-hover:bg-[#EBF4FF] transition-all duration-200 flex items-center justify-center text-[#1677FF] shrink-0"
        >
          <BrandIcon name={tool.name} modelId={tool.id} icon={tool.icon || 'Sparkles'} size={22} />
          {#if isUnlocked}
            <span
              class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
              title="AI Helper Online"
            ></span>
          {:else}
            <span
              class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-white flex items-center justify-center text-[8px] text-white"
              title="Requires Pro Plan"
            >
              <Icon name="Lock" size={9} />
            </span>
          {/if}
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              class="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-md bg-[#102A56] text-white tracking-wider"
            >
              {tool.code}
            </span>
            {#if tool.badge}
              <span
                class="px-2 py-0.5 text-[9px] font-bold rounded-full ui-badge-primary tracking-wide uppercase"
              >
                {tool.badge}
              </span>
            {/if}
          </div>
          <p class="text-[11px] font-semibold text-[#1677FF] mt-0.5 line-clamp-1">
            {tool.categoryName}
          </p>
        </div>
      </div>

      {#if isUnlocked}
        <span
          class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 flex items-center gap-1"
          title="Controllable via AI CEO, WhatsApp & Telegram"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>CEO + WA/TG</span>
        </span>
      {:else}
        <span
          class="px-2 py-0.5 text-[9px] font-black rounded-full bg-amber-50 border border-amber-200 text-amber-700 shrink-0 flex items-center gap-1 shadow-2xs"
          title="Upgrade plan to unlock this helper"
        >
          <Icon name="Lock" size={10} />
          <span>PRO</span>
        </span>
      {/if}
    </div>

    <!-- Helper Name & Concise Tagline -->
    <h3
      class="font-extrabold text-sm text-[#102A56] group-hover:text-[#1677FF] transition-colors mb-1 line-clamp-1"
    >
      {tool.name}
    </h3>
    <p class="text-xs text-[#4B6382] leading-relaxed line-clamp-2">
      {tool.shortDesc || tool.description}
    </p>
  </div>

  <!-- Footer Action Strip -->
  <div
    class="relative z-10 mt-4 pt-3 border-t border-[#E3ECF7] flex items-center justify-between flex-wrap gap-2"
  >
    <span class="text-[11px] text-[#5E7694] flex items-center gap-1.5 font-medium">
      <Icon name="Sliders" size={12} class="text-[#1677FF]" />
      <span>{tool.inputs.length} Custom Options + Chat</span>
    </span>

    {#if isUnlocked}
      <div
        class="flex items-center gap-1 text-xs font-bold text-[#1677FF] group-hover:translate-x-0.5 transition-transform"
      >
        <span>Open Studio</span>
        <Icon name="ArrowRight" size={13} />
      </div>
    {:else}
      <div
        class="flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-transform"
      >
        <Icon name="Lock" size={12} />
        <span>Upgrade to Unlock</span>
      </div>
    {/if}
  </div>
</div>
