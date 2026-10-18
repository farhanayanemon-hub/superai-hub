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
    prompt?: string;
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
  let selectedNode = $state<WorkflowNode | null>(null);
  let saveFeedbackMessage = $state('');

  const DEFAULT_NODES: WorkflowNode[] = [
    {
      id: 'node-1',
      type: 'trigger',
      title: 'Workflow Trigger',
      subtitle: 'Manual 1-Click / WhatsApp Command',
      icon: 'Zap',
      x: 80,
      y: 180,
      prompt: 'Execute when user sends command or triggers workflow button.'
    },
    {
      id: 'node-2',
      type: 'ai_agent',
      title: 'AI Reasoning Engine',
      subtitle: 'Master AI Specialist (#01-#75)',
      icon: 'Bot',
      x: 390,
      y: 180,
      prompt: 'Reason over input variables and synthesize high-converting output.'
    },
    {
      id: 'node-3',
      type: 'action',
      title: 'Google Docs / Sheets',
      subtitle: 'Save Generated Deliverable',
      icon: 'FileText',
      x: 720,
      y: 120,
      prompt: 'Append output deliverable into designated Google Sheet.'
    },
    {
      id: 'node-4',
      type: 'action',
      title: 'WhatsApp Alert',
      subtitle: 'Dispatch Executive Preview',
      icon: 'MessageSquare',
      x: 720,
      y: 280,
      prompt: 'Send instant notification to paired WhatsApp session.'
    }
  ];

  let nodes = $state<WorkflowNode[]>([...DEFAULT_NODES]);

  let cables = $state<WorkflowCable[]>([
    { from: 'node-1', to: 'node-2' },
    { from: 'node-2', to: 'node-3' },
    { from: 'node-2', to: 'node-4' }
  ]);

  // Load custom saved workflows for this agent when opened
  $effect(() => {
    if (isOpen && typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('ezbo_custom_workflows');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed[agentName]) {
            nodes = parsed[agentName].nodes || DEFAULT_NODES;
            cables = parsed[agentName].cables || [
              { from: 'node-1', to: 'node-2' },
              { from: 'node-2', to: 'node-3' },
              { from: 'node-2', to: 'node-4' }
            ];
          }
        }
      } catch (err) {
        console.warn('Failed to parse custom workflows:', err);
      }
    }
  });

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

  function startDrag(nodeId: string, event: PointerEvent) {
    // Only drag with primary mouse button or touch
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    isDraggingNode = nodeId;
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    dragOffset = {
      x: event.clientX / zoom - targetNode.x,
      y: event.clientY / zoom - targetNode.y
    };
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {}
  }

  function onPointerMove(event: PointerEvent) {
    if (!isDraggingNode) return;
    const targetNode = nodes.find((n) => n.id === isDraggingNode);
    if (!targetNode) return;
    targetNode.x = Math.max(20, Math.round(event.clientX / zoom - dragOffset.x));
    targetNode.y = Math.max(20, Math.round(event.clientY / zoom - dragOffset.y));
    nodes = [...nodes];
  }

  function stopDrag(event: PointerEvent) {
    if (isDraggingNode) {
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      } catch {}
      isDraggingNode = null;
    }
  }

  function addNodeFromPalette(tool: ToolConnector) {
    const newId = `node-${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: newId,
      type: 'action',
      title: tool.name,
      subtitle: tool.category,
      icon: tool.icon || 'Plug',
      x: (lastNode ? lastNode.x : 300) + 260,
      y: (lastNode ? lastNode.y : 180) + (Math.random() > 0.5 ? 50 : -50),
      config: { toolId: tool.id }
    };
    nodes = [...nodes, newNode];
    if (lastNode) {
      cables = [...cables, { from: lastNode.id, to: newId }];
    }
    selectedNode = newNode;
    isPaletteOpen = false;
  }

  function addCustomAgentNode() {
    const newId = `node-agent-${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: newId,
      type: 'ai_agent',
      title: 'Custom Sub-Agent',
      subtitle: 'Autonomous Sub-Specialist',
      icon: 'Bot',
      x: (lastNode ? lastNode.x : 300) + 260,
      y: (lastNode ? lastNode.y : 180),
      prompt: 'Perform specialized sub-task autonomously.'
    };
    nodes = [...nodes, newNode];
    if (lastNode) {
      cables = [...cables, { from: lastNode.id, to: newId }];
    }
    selectedNode = newNode;
    isPaletteOpen = false;
  }

  function deleteNode(id: string) {
    nodes = nodes.filter((n) => n.id !== id);
    cables = cables.filter((c) => c.from !== id && c.to !== id);
    if (selectedNode?.id === id) {
      selectedNode = null;
    }
  }

  function handleSaveWorkflow() {
    const workflowData = {
      agentName,
      nodes,
      cables,
      savedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = JSON.parse(localStorage.getItem('ezbo_custom_workflows') || '{}');
        stored[agentName] = workflowData;
        localStorage.setItem('ezbo_custom_workflows', JSON.stringify(stored));
      } catch (err) {
        console.error('Failed to persist workflow:', err);
      }
    }

    if (onSave) {
      onSave(workflowData);
    }

    saveFeedbackMessage = 'Workflow customized & saved successfully!';
    setTimeout(() => {
      saveFeedbackMessage = '';
      isOpen = false;
    }, 1200);
  }
</script>

{#if isOpen}
  <div
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-[100] bg-[#102A56]/70 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
  >
    <!-- Top Studio Navbar -->
    <header class="h-16 px-4 sm:px-6 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0 shadow-xs z-20">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#1677FF] text-white flex items-center justify-center font-bold shrink-0">
          <Icon name="GitBranch" size={18} />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm sm:text-base font-extrabold text-[#102A56]">Visual Workflow Studio</h2>
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
        {#if saveFeedbackMessage}
          <div class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Icon name="Check" size={13} class="text-emerald-600" />
            <span>{saveFeedbackMessage}</span>
          </div>
        {/if}

        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
        >
          Close
        </button>

        <button
          type="button"
          onclick={handleSaveWorkflow}
          class="px-5 py-2 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#1162DB] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Icon name="Save" size={14} />
          <span>Save Custom Agent</span>
        </button>
      </div>
    </header>

    <!-- Main Studio Workspace with Interactive Canvas -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="flex-1 relative overflow-hidden bg-[#F8FAFC]"
      onpointermove={onPointerMove}
      onpointerup={stopDrag}
    >
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
            onpointerdown={(e) => startDrag(node.id, e)}
            onclick={() => (selectedNode = node)}
            onkeydown={(e) => e.key === 'Enter' && (selectedNode = node)}
            class="absolute w-[220px] rounded-2xl bg-white border shadow-md p-4 cursor-grab active:cursor-grabbing hover:border-[#1677FF] transition-all select-none {selectedNode?.id === node.id ? 'border-2 border-[#1677FF] ring-4 ring-[#1677FF]/15' : 'border-[#CBD5E1]'}"
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
                  onclick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  class="text-gray-400 hover:text-rose-600 cursor-pointer text-xs p-1"
                  title="Remove Node"
                >
                  <Icon name="Trash" size={13} />
                </button>
              {/if}
            </div>

            {#if node.prompt}
              <p class="text-[10px] text-gray-500 italic mt-2 line-clamp-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                "{node.prompt}"
              </p>
            {/if}

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

      <!-- Node Inspector Panel (Slide-over when node is selected) -->
      {#if selectedNode}
        <div class="absolute left-4 bottom-4 w-84 bg-white/95 backdrop-blur-md rounded-2xl border border-[#CFE2FA] shadow-xl p-4 space-y-3 z-30 animate-in fade-in duration-200">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <div class="flex items-center gap-2">
              <Icon name="Sliders" size={15} class="text-[#1677FF]" />
              <h4 class="text-xs font-bold text-[#102A56]">Configure Node: {selectedNode.title}</h4>
            </div>
            <button
              type="button"
              onclick={() => (selectedNode = null)}
              class="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <Icon name="X" size={12} />
            </button>
          </div>

          <div class="space-y-2">
            <div>
              <label for="node-title-input" class="block text-[10px] font-bold text-gray-600 mb-0.5">Node Title</label>
              <input
                id="node-title-input"
                type="text"
                bind:value={selectedNode.title}
                class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF]"
              />
            </div>
            <div>
              <label for="node-prompt-input" class="block text-[10px] font-bold text-gray-600 mb-0.5">Custom Instructions / Prompt</label>
              <textarea
                id="node-prompt-input"
                bind:value={selectedNode.prompt}
                rows={2}
                placeholder="Enter prompt or operational instruction..."
                class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF] resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      {/if}

      <!-- Slide-over Node Palette -->
      {#if isPaletteOpen}
        <div class="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-[#E2E8F0] shadow-xl p-5 space-y-4 flex flex-col z-40 animate-in slide-in-from-right duration-200">
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

          <!-- Quick Add Custom Agent Node -->
          <button
            type="button"
            onclick={addCustomAgentNode}
            class="w-full p-2.5 rounded-xl border border-[#CFE2FA] bg-[#F3F8FF] hover:bg-[#EBF4FF] text-left transition-all cursor-pointer flex items-center gap-2.5 group"
          >
            <div class="w-8 h-8 rounded-lg bg-[#1677FF] text-white flex items-center justify-center shrink-0">
              <Icon name="Bot" size={15} />
            </div>
            <div class="min-w-0 flex-1">
              <h5 class="text-xs font-bold text-[#102A56]">Custom AI Agent</h5>
              <p class="text-[10px] text-[#1677FF]">Add autonomous sub-specialist</p>
            </div>
            <Icon name="Plus" size={14} class="text-[#1677FF]" />
          </button>

          <input
            type="text"
            bind:value={paletteSearch}
            placeholder="Search 100+ tools to add as node..."
            class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF]"
          />

          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            {#each TOOL_CONNECTORS.filter((t) => !paletteSearch || t.name.toLowerCase().includes(paletteSearch.toLowerCase())) as tool}
              <button
                type="button"
                onclick={() => addNodeFromPalette(tool)}
                class="w-full p-2.5 rounded-xl border border-gray-200 hover:border-[#1677FF] bg-gray-50/50 hover:bg-white text-left transition-all cursor-pointer flex items-center gap-2.5 group"
              >
                <div class="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#1677FF] group-hover:bg-[#1677FF] group-hover:text-white transition-colors shrink-0">
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
