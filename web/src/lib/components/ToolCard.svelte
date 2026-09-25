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
  class="group relative rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer backdrop-blur-sm"
>
  <div>
    <!-- Top Header: Agent Avatar & Category Badge -->
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="flex items-center gap-3">
        <!-- Agent Avatar -->
        <div class="relative w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 p-1 group-hover:border-emerald-500/50 group-hover:scale-105 transition-all shadow-md shrink-0">
          <img
            src={tool.agentAvatar}
            alt={tool.agentName}
            class="w-full h-full object-contain rounded-xl"
            loading="lazy"
          />
          <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" title="Online & Ready"></span>
        </div>

        <div>
          <!-- Agent Name -->
          <div class="flex items-center gap-1.5">
            <h4 class="font-extrabold text-base text-white group-hover:text-emerald-300 transition-colors">
              {tool.agentName}
            </h4>
            {#if tool.badge}
              <span class="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {tool.badge}
              </span>
            {/if}
          </div>
          <p class="text-[11px] font-medium text-emerald-400 line-clamp-1">{tool.agentRole}</p>
        </div>
      </div>

      <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 shrink-0">
        {tool.categoryName}
      </span>
    </div>

    <!-- Tool Title & Persona Tagline -->
    <h3 class="font-bold text-xs sm:text-sm text-slate-200 mb-1.5 line-clamp-1">
      {tool.name}
    </h3>
    <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
      {tool.agentTagline || tool.description}
    </p>
  </div>

  <!-- Footer Action Button -->
  <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
    <span class="text-[11px] text-slate-500 flex items-center gap-1">
      <Icon name="Sparkles" size={12} class="text-emerald-400" />
      <span>{tool.inputs.length} inputs</span>
    </span>
    <div class="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
      <span>Chat with {tool.agentName}</span>
      <Icon name="ChevronRight" size={14} />
    </div>
  </div>
</div>
