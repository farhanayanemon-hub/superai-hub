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
  class="group relative rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-400 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
>
  <div>
    <!-- Top Header: Executive Portrait & Metadata -->
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="flex items-center gap-3">
        <!-- Executive Portrait Container -->
        <div class="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-blue-200 group-hover:border-blue-500 group-hover:scale-105 transition-all shadow-xs shrink-0">
          <img
            src={tool.agentAvatar}
            alt={tool.agentName}
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Online & Ready"></span>
        </div>

        <div>
          <!-- Agent Name & Luxury Badge -->
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
              {tool.agentName}
            </h4>
            {#if tool.badge}
              <span class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 tracking-wide uppercase">
                {tool.badge}
              </span>
            {/if}
          </div>
          <p class="text-[11px] font-semibold text-blue-600 line-clamp-1">{tool.agentRole}</p>
        </div>
      </div>

      <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
        {tool.categoryName}
      </span>
    </div>

    <!-- Tool Specialization Title & Persona Tagline -->
    <h3 class="font-bold text-xs sm:text-sm text-slate-800 mb-1.5 line-clamp-1 group-hover:text-slate-950 transition-colors">
      {tool.name}
    </h3>
    <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
      {tool.agentTagline || tool.description}
    </p>
  </div>

  <!-- Footer Action Strip -->
  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
    <span class="text-[11px] text-slate-500 flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
      <span>{tool.inputs.length} parameters</span>
    </span>
    <div class="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all">
      <span>Consult with {tool.agentName}</span>
      <Icon name="ArrowRight" size={13} />
    </div>
  </div>
</div>
