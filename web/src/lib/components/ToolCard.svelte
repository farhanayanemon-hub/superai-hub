<script lang="ts">
  import Icon from './Icon.svelte';
  import type { AITool } from '$lib/config/tools';
  import { openToolDrawer } from '$lib/stores/userStore';

  let { tool }: { tool: AITool } = $props();
</script>

<div
  onclick={() => openToolDrawer(tool)}
  onkeydown={(e) => e.key === 'Enter' && openToolDrawer(tool)}
  role="button"
  tabindex="0"
  class="group relative rounded-2xl glass-card p-4 sm:p-5 flex flex-col justify-between cursor-pointer overflow-hidden"
>
  <div class="relative z-10">
    <!-- Top Header: Helper Code, Icon & Category Pill -->
    <div class="flex items-start justify-between gap-2 mb-3.5 flex-wrap sm:flex-nowrap">
      <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <!-- Clean Icon Avatar -->
        <div
          class="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] group-hover:border-[#1677FF] group-hover:bg-[#EBF4FF] transition-all duration-200 flex items-center justify-center text-[#1677FF] shrink-0"
        >
          <Icon name={tool.icon || 'Sparkles'} size={20} />
          <span
            class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
            title="AI Helper Online"
          ></span>
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

      <span
        class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 flex items-center gap-1"
        title="Controllable via AI CEO, WhatsApp & Telegram"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>CEO + WA/TG</span>
      </span>
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
    <div
      class="flex items-center gap-1 text-xs font-bold text-[#1677FF] group-hover:translate-x-0.5 transition-transform"
    >
      <span>Open Studio</span>
      <Icon name="ArrowRight" size={13} />
    </div>
  </div>
</div>
