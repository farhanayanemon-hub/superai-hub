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
  class="group relative rounded-2xl bg-[#10121a]/90 hover:bg-[#141622] border border-amber-500/20 hover:border-amber-400/60 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/50 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer backdrop-blur-md"
>
  <div>
    <!-- Top Header: Executive Portrait & Metadata -->
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="flex items-center gap-3">
        <!-- Executive Portrait Container -->
        <div class="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-amber-500/30 group-hover:border-amber-400/70 group-hover:scale-105 transition-all shadow-md shrink-0">
          <img
            src={tool.agentAvatar}
            alt={tool.agentName}
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#10121a]" title="Online & Ready"></span>
        </div>

        <div>
          <!-- Agent Name & Luxury Badge -->
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
              {tool.agentName}
            </h4>
            {#if tool.badge}
              <span class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 tracking-wide uppercase">
                {tool.badge}
              </span>
            {/if}
          </div>
          <p class="text-[11px] font-medium text-amber-400/90 line-clamp-1">{tool.agentRole}</p>
        </div>
      </div>

      <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.04] border border-white/10 text-slate-400 shrink-0">
        {tool.categoryName}
      </span>
    </div>

    <!-- Tool Specialization Title & Persona Tagline -->
    <h3 class="font-bold text-xs sm:text-sm text-slate-200 mb-1.5 line-clamp-1 group-hover:text-white transition-colors">
      {tool.name}
    </h3>
    <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
      {tool.agentTagline || tool.description}
    </p>
  </div>

  <!-- Footer Action Strip -->
  <div class="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
    <span class="text-[11px] text-slate-400 flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
      <span>{tool.inputs.length} parameters</span>
    </span>
    <div class="flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all">
      <span>Consult with {tool.agentName}</span>
      <Icon name="ArrowRight" size={13} />
    </div>
  </div>
</div>

