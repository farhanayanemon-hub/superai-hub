<script lang="ts">
  import Icon from './Icon.svelte';
  import type { AITool } from '$lib/config/tools';
  import { openToolDrawer } from '$lib/stores/userStore';

  let { tool }: { tool: AITool } = $props();

  const categoryColorMap: Record<string, string> = {
    fcommerce: 'from-amber-500/10 via-orange-500/5 to-transparent text-amber-400 border-amber-500/30',
    social: 'from-pink-500/10 via-purple-500/5 to-transparent text-pink-400 border-pink-500/30',
    career: 'from-blue-500/10 via-cyan-500/5 to-transparent text-cyan-400 border-cyan-500/30',
    technical: 'from-emerald-500/10 via-teal-500/5 to-transparent text-emerald-400 border-emerald-500/30'
  };
</script>

<div
  onclick={() => openToolDrawer(tool)}
  onkeydown={(e) => e.key === 'Enter' && openToolDrawer(tool)}
  role="button"
  tabindex="0"
  class="group relative rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer backdrop-blur-sm"
>
  <div>
    <!-- Top Header: Icon & Badges -->
    <div class="flex items-start justify-between gap-2 mb-3.5">
      <div class="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all shadow-inner">
        <Icon name={tool.icon} size={20} />
      </div>

      <div class="flex items-center gap-1.5 flex-wrap justify-end">
        {#if tool.badge}
          <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
            {tool.badge}
          </span>
        {/if}
        <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400">
          {tool.categoryName}
        </span>
      </div>
    </div>

    <!-- Title & Description -->
    <h3 class="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
      {tool.name}
    </h3>
    <p class="text-[11px] text-slate-500 font-mono mb-2 line-clamp-1">{tool.nameEn}</p>
    <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
      {tool.description}
    </p>
  </div>

  <!-- Footer Action Button -->
  <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
    <span class="text-[11px] text-slate-500 flex items-center gap-1">
      <span>{tool.inputs.length} input fields</span>
    </span>
    <div class="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
      <span>Launch Tool</span>
      <Icon name="ChevronRight" size={14} />
    </div>
  </div>
</div>
