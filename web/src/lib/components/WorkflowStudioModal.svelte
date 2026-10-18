<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { TOOL_CONNECTORS, type ToolConnector } from '$lib/config/toolConnectors';

  let { isOpen = $bindable(false), agentName = 'Custom Specialist', onSave } = $props<{
    isOpen?: boolean;
    agentName?: string;
    onSave?: (workflowData: any) => void;
  }>();

  interface WorkflowNode {
    id: string;
    type: 'trigger' | 'action' | 'ai_agent';
    title: string;
    subtitle: string;
    icon: string;
    x: number;
    y: number;
    config?: Record<string, any>;
  }

  interface WorkflowCable {
    from: string;
    to: string;
  }

  let zoom = $state(1);
  let panX = $state(0);
  let panY = $state(10);
  let isDraggingNode = $state<string | null>(null);
  let dragOffset = { x: 0, y: 0 };
  let isPaletteOpen = $state(false);
  let paletteSearch = $state('');

  let nodes = $state<WorkflowNode[]>([
    {
      id: 'node-1',
      type: 'trigger',
      title: 'Workflow Trigger',
      subtitle: 'Manual 1-Click / WhatsApp',
      icon: 'Zap',
      x: 100,
      y: 180
    },
    {
      id: 'node-2',
      type: 'ai_agent',
      title: 'AI Reasoning Engine',
      subtitle: 'Master AI Specialist (#01-#75)',
      icon: 'Bot',
      x: 420,
      y: 180
    },
    {
      id: 'node-3',
      type: 'action',
      title: 'Google Docs / Sheets',
      subtitle: 'Save Generated Deliverable',
      icon: 'FileText',
      x: 740,
      y: 120
    },
    {
      id: 'node-4',
      type: 'action',
      title: 'WhatsApp Alert',
      subtitle: 'Dispatch Executive Preview',
      icon: 'MessageSquare',
      x: 740,
      y: 280
    }
  ]);

  let cables = $state<WorkflowCable[]>([
    { from: 'node-1', to: 'node-2' },
    { from: 'node-2', to: 'node-3' },
    { from: 'node-2', to: 'node-4' }
  ]);

  function computeBezierCurve(n1: WorkflowNode, n2: WorkflowNode): string {
    const x1 = n1.x + 220;
    const y1 = n1.y + 40;
    const x2 = n2.x;
    const y2 = n2.y + 40;
    const dx = Math.max(60, Math.abs(x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  function handleZoomIn() {
    zoom = Math.min(2, +(zoom + 0.15).toFixed(2));
  }

  function handleZoomOut() {
    zoom = Math.max(0.5, +(zoom - 0.15).toFixed(2));
  }

  function handleResetView() {
    zoom = 1;
    panX = 0;
    panY = 10;
  }

  function addNodeFromPalette(tool: ToolConnector) {
    const newId = `node-${Date.now()}`;
    nodes.push({
      id: newId,
      type: 'action',
      title: tool.name,
      subtitle: tool.category,
      icon: tool.icon || 'Plug',
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 150
    });
    isPaletteOpen = false;
  }

  function deleteNode(id: string) {
    nodes = nodes.filter((n) => n.id !== id);
    cables = cables.filter((c) => c.from !== id && c.to !== id);
  }

  function handleSaveWorkflow() {
    if (onSave) {
      onSave({ nodes, cables, agentName });
    }
    isOpen = false;
  }
</script>

{#if isOpen}
  <div
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 bg-[#102A56]/70 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
  >
    <!-- Top Studio Navbar -->
    <header class="h-16 px-6 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#1677FF] text-white flex items-center justify-center font-bold">
          <Icon name="GitBranch" size={18} />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm sm:text-base font-extrabold text-[#102A56]">n8n Visual Workflow Studio</h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1677FF]/10 text-[#1677FF] border border-[#1677FF]/30 uppercase">
              Pro Studio
            </span>
          </div>
          <p class="text-xs text-[#64748B]">
            Editing: <span class="font-bold text-[#102A56]">{agentName}</span>
          </p>
        </div>
      </div>

      <!-- Center Controls: Zoom, Pan & Palette -->
      <div class="flex items-center gap-2">
        <div class="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-semibold">
          <button
            type="button"
            onclick={handleZoomOut}
            class="px-2.5 py-1 rounded-lg hover:bg-white text-gray-700 transition-colors cursor-pointer"
            title="Zoom out"
          >
            -
          </button>
          <span class="px-2 text-[11px] font-mono text-gray-600">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onclick={handleZoomIn}
            class="px-2.5 py-1 rounded-lg hover:bg-white text-gray-700 transition-colors cursor-pointer"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onclick={handleResetView}
            class="px-2 py-1 text-[10px] text-gray-500 hover:text-gray-900 border-l border-gray-300 ml-1 cursor-pointer"
          >
            Reset
          </button>
        </div>

        <button
          type="button"
          onclick={() => (isPaletteOpen = !isPaletteOpen)}
          class="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-[#102A56] border border-[#CBD5E1] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Icon name="Plus" size={14} class="text-[#1677FF]" />
          <span>Add Node</span>
        </button>
      </div>

      <!-- Right CTAs -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onclick={handleSaveWorkflow}
          class="px-5 py-2 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#1162DB] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Icon name="Check" size={14} />
          <span>Save Custom Agent</span>
        </button>
      </div>
    </header>

    <!-- Main Studio Workspace with Interactive Canvas -->
    <div class="flex-1 relative overflow-hidden bg-[#F8FAFC]">
      <!-- SVG Bézier Cables Layer -->
      <svg
        class="absolute inset-0 w-full h-full pointer-events-none"
        style="transform: scale({zoom}) translate({panX}px, {panY}px); transform-origin: top left;"
      >
        <defs>
          <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1677FF" />
            <stop offset="100%" stop-color="#38CFFF" />
          </linearGradient>
        </defs>

        {#each cables as cable}
          {@const n1 = nodes.find((n) => n.id === cable.from)}
          {@const n2 = nodes.find((n) => n.id === cable.to)}
          {#if n1 && n2}
            <path
              d={computeBezierCurve(n1, n2)}
              fill="none"
              stroke="url(#cableGradient)"
              stroke-width="3"
              stroke-linecap="round"
              class="drop-shadow-xs"
            />
          {/if}
        {/each}
      </svg>

      <!-- Draggable Nodes Canvas -->
      <div
        class="absolute inset-0 w-full h-full"
        style="transform: scale({zoom}) translate({panX}px, {panY}px); transform-origin: top left;"
      >
        {#each nodes as node (node.id)}
          <div
            role="button"
            tabindex="0"
            class="absolute w-[220px] rounded-2xl bg-white border border-[#CBD5E1] shadow-md p-4 cursor-grab active:cursor-grabbing hover:border-[#1677FF] transition-colors select-none"
            style="left: {node.x}px; top: {node.y}px;"
          >
            <!-- Node Header -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {node.type === 'trigger' ? 'bg-amber-50 text-amber-600' : node.type === 'ai_agent' ? 'bg-[#1677FF] text-white' : 'bg-emerald-50 text-emerald-600'}">
                  <Icon name={node.icon} size={15} />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-[#102A56] leading-tight truncate">{node.title}</h4>
                  <p class="text-[10px] text-[#64748B] truncate">{node.subtitle}</p>
                </div>
              </div>

              {#if node.type !== 'trigger' && node.type !== 'ai_agent'}
                <button
                  type="button"
                  onclick={() => deleteNode(node.id)}
                  class="text-gray-400 hover:text-rose-600 cursor-pointer text-xs"
                  title="Remove Node"
                >
                  <Icon name="Trash" size={13} />
                </button>
              {/if}
            </div>

            <!-- Ports -->
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-[10px] text-gray-400">
              <div class="flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-full bg-[#1677FF] border border-white"></span>
                <span>In</span>
              </div>
              <div class="flex items-center gap-1">
                <span>Out</span>
                <span class="w-2.5 h-2.5 rounded-full bg-[#38CFFF] border border-white"></span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Slide-over Node Palette -->
      {#if isPaletteOpen}
        <div class="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#E2E8F0] shadow-xl p-5 space-y-4 flex flex-col z-20 animate-in slide-in-from-right duration-200">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-[#102A56] flex items-center gap-2">
              <Icon name="Layers" size={16} class="text-[#1677FF]" />
              <span>Tool Node Palette</span>
            </h3>
            <button
              type="button"
              onclick={() => (isPaletteOpen = false)}
              class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
            >
              <Icon name="X" size={13} />
            </button>
          </div>

          <input
            type="text"
            bind:value={paletteSearch}
            placeholder="Search tools to add as node..."
            class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF]"
          />

          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            {#each TOOL_CONNECTORS.filter((t) => !paletteSearch || t.name.toLowerCase().includes(paletteSearch.toLowerCase())) as tool}
              <button
                type="button"
                onclick={() => addNodeFromPalette(tool)}
                class="w-full p-2.5 rounded-xl border border-gray-200 hover:border-[#1677FF] bg-gray-50/50 hover:bg-white text-left transition-all cursor-pointer flex items-center gap-2.5 group"
              >
                <div class="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#1677FF] group-hover:bg-[#1677FF] group-hover:text-white transition-colors">
                  <Icon name={tool.icon || 'Plug'} size={14} />
                </div>
                <div class="min-w-0 flex-1">
                  <h5 class="text-xs font-bold text-[#102A56] truncate">{tool.name}</h5>
                  <p class="text-[10px] text-gray-500 truncate">{tool.category}</p>
                </div>
                <Icon name="Plus" size={14} class="text-gray-400 group-hover:text-[#1677FF]" />
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
