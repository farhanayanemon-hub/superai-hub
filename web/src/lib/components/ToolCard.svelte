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
  class="group relative rounded-2xl bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-blue-500/70 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-2xl hover:shadow-blue-500/15 cursor-pointer overflow-hidden"
>
  <!-- Animated Ambient Gradient Aura -->
  <div
    class="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-cyan-400/15 blur-2xl group-hover:scale-150 group-hover:opacity-100 opacity-60 transition-all duration-500"
  ></div>

  <div class="relative z-10">
    <!-- Top Header: Helper Code, Animated Icon & Category Pill -->
    <div class="flex items-start justify-between gap-2.5 mb-3.5">
      <div class="flex items-center gap-3">
        <!-- Animated Glassmorphic Icon Avatar -->
        <div
          class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-slate-100 border border-blue-200/80 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300 flex items-center justify-center text-blue-600 shadow-xs shrink-0"
        >
          <Icon name={tool.icon || 'Sparkles'} size={20} />
          <span
            class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"
            title="AI Helper Online"
          ></span>
        </div>

        <div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              class="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-md bg-slate-900 text-white tracking-wider"
            >
              {tool.code}
            </span>
            {#if tool.badge}
              <span
                class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-50/90 text-blue-700 border border-blue-200/80 tracking-wide uppercase"
              >
                {tool.badge}
              </span>
            {/if}
          </div>
          <p class="text-[11px] font-semibold text-blue-600/90 mt-0.5 line-clamp-1">
            {tool.categoryName}
          </p>
        </div>
      </div>

      <span
        class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-700 shrink-0 flex items-center gap-1"
        title="Controllable via AI CEO, WhatsApp & Telegram"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>CEO + WA/TG</span>
      </span>
    </div>

    <!-- Helper Name & Concise 1-Line Tagline -->
    <h3
      class="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1"
    >
      {tool.name}
    </h3>
    <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
      {tool.shortDesc || tool.description}
    </p>
  </div>

  <!-- Footer Action Strip -->
  <div
    class="relative z-10 mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between"
  >
    <span class="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
      <Icon name="Sliders" size={12} class="text-blue-500" />
      <span>{tool.inputs.length} Custom Options + Chat</span>
    </span>
    <div
      class="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all"
    >
      <span>Open Studio</span>
      <Icon name="ArrowRight" size={13} />
    </div>
  </div>
</div>
