<script lang="ts">
  import type { Action } from 'svelte/action';
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import { TOOL_CONNECTORS, type ToolConnector } from '$lib/config/toolConnectors';

  let { isOpen = $bindable(false), agentName = 'Custom Specialist', onSave } = $props<{
    isOpen?: boolean;
    agentName?: string;
    onSave?: (workflowData: any) => void;
  }>();

  export interface WorkflowNode {
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

  export interface WorkflowCable {
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

  let canvasContainer = $state<HTMLDivElement | null>(null);
  let activeConnectingSource = $state<string | null>(null);
  let liveCablePointer = $state<{ x: number; y: number } | null>(null);
  let isDraggingWire = $state(false);
  let hasMovedWire = $state(false);
  let wireDragStart = $state<{ x: number; y: number } | null>(null);
  let wasAlreadyActive = $state(false);
  let hoveredCable = $state<string | null>(null);
  let hoveredInPortNodeId = $state<string | null>(null);
  let nodeHeights = $state<Record<string, number>>({});
  let portOffsets = $state<Record<string, { inX: number; inY: number; outX: number; outY: number }>>({});

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
      title: 'Google Sheets',
      subtitle: 'Save Generated Deliverable',
      icon: 'sheets',
      x: 720,
      y: 120,
      prompt: 'Append output deliverable into designated Google Sheet.'
    },
    {
      id: 'node-4',
      type: 'action',
      title: 'WhatsApp Alert',
      subtitle: 'Dispatch Executive Preview',
      icon: 'whatsapp',
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

  const selectedOutgoingCables = $derived.by(() => {
    const cur = selectedNode;
    return cur ? cables.filter((c) => c.from === cur.id) : [];
  });

  const selectedIncomingCables = $derived.by(() => {
    const cur = selectedNode;
    return cur ? cables.filter((c) => c.to === cur.id) : [];
  });

  let movedWireTimer: any = null;

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
    } else if (!isOpen) {
      cancelConnecting();
      isDraggingNode = null;
      hoveredCable = null;
      hoveredInPortNodeId = null;
    }
  });

  function getCanvasCoordinates(e: { clientX: number; clientY: number }): { x: number; y: number } {
    if (!canvasContainer) {
      return { x: e.clientX / zoom - panX, y: e.clientY / zoom - panY };
    }
    const rect = canvasContainer.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom - panX,
      y: (e.clientY - rect.top) / zoom - panY
    };
  }

  function getOutPortPos(node: WorkflowNode): { x: number; y: number } {
    const offset = portOffsets[node.id];
    const h = nodeHeights[node.id] || (node.prompt ? 134 : 94);
    const x = offset && offset.outX > 0 ? node.x + offset.outX : node.x + 209;
    const y = nodeHeights[node.id] ? node.y + nodeHeights[node.id] - 22 : (offset && offset.outY > 0 ? node.y + offset.outY : node.y + h - 22);
    return { x, y };
  }

  function getInPortPos(node: WorkflowNode): { x: number; y: number } {
    const offset = portOffsets[node.id];
    const h = nodeHeights[node.id] || (node.prompt ? 134 : 94);
    const x = offset && offset.inX > 0 ? node.x + offset.inX : node.x + 21;
    const y = nodeHeights[node.id] ? node.y + nodeHeights[node.id] - 22 : (offset && offset.inY > 0 ? node.y + offset.inY : node.y + h - 22);
    return { x, y };
  }

  function computeBezierCurveFromPoints(p1: { x: number; y: number }, p2: { x: number; y: number }): string {
    const dx = Math.max(50, Math.abs(p2.x - p1.x) * 0.5);
    return `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;
  }

  function computeBezierCurve(n1: WorkflowNode, n2: WorkflowNode): string {
    const p1 = getOutPortPos(n1);
    const p2 = getInPortPos(n2);
    return computeBezierCurveFromPoints(p1, p2);
  }

  const registerPort: Action<HTMLElement, { id: string; type: 'in' | 'out' }> = (node, initialParams) => {
    let params = initialParams;
    let ro: ResizeObserver | null = null;

    function measure() {
      const card = node.closest('.workflow-node-card') as HTMLElement | null;
      if (card) {
        const cardRect = card.getBoundingClientRect();
        const dotRect = node.getBoundingClientRect();
        if (cardRect.width > 0 && zoom > 0) {
          const relX = (dotRect.left + dotRect.width / 2 - cardRect.left) / zoom;
          const relY = (dotRect.top + dotRect.height / 2 - cardRect.top) / zoom;
          if (!portOffsets[params.id]) {
            portOffsets[params.id] = { inX: 21, inY: 112, outX: 209, outY: 112 };
          }
          if (params.type === 'in') {
            portOffsets[params.id].inX = Math.round(relX);
            portOffsets[params.id].inY = Math.round(relY);
          } else {
            portOffsets[params.id].outX = Math.round(relX);
            portOffsets[params.id].outY = Math.round(relY);
          }
        }
      }
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        measure();
        const card = node.closest('.workflow-node-card');
        if (card && typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(() => measure());
          ro.observe(card);
        }
      });
    }

    return {
      update(newParams) {
        params = newParams;
        measure();
      },
      destroy() {
        if (ro) ro.disconnect();
      }
    };
  };

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
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (activeConnectingSource) {
      if (activeConnectingSource !== nodeId) {
        return;
      }
      cancelConnecting();
    }
    isDraggingNode = nodeId;
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    const canvasPos = getCanvasCoordinates(event);
    dragOffset = {
      x: canvasPos.x - targetNode.x,
      y: canvasPos.y - targetNode.y
    };
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {}
  }

  function onPointerMove(event: PointerEvent) {
    if (isDraggingNode) {
      const targetNode = nodes.find((n) => n.id === isDraggingNode);
      if (targetNode) {
        const canvasPos = getCanvasCoordinates(event);
        targetNode.x = Math.max(10, Math.round(canvasPos.x - dragOffset.x));
        targetNode.y = Math.max(10, Math.round(canvasPos.y - dragOffset.y));
        nodes = [...nodes];
      }
    }
    if (isDraggingWire && activeConnectingSource) {
      const mouseCanvasPos = getCanvasCoordinates(event);
      const el = typeof document !== 'undefined' ? document.elementFromPoint(event.clientX, event.clientY) : null;
      const targetInNodeId = el?.closest('[data-port-in]')?.getAttribute('data-port-in')
        || el?.closest('[data-node-id]')?.getAttribute('data-node-id');

      if (targetInNodeId && targetInNodeId !== activeConnectingSource) {
        hoveredInPortNodeId = targetInNodeId;
        const targetNode = nodes.find((n) => n.id === targetInNodeId);
        if (targetNode) {
          liveCablePointer = getInPortPos(targetNode);
        } else {
          liveCablePointer = mouseCanvasPos;
        }
      } else {
        hoveredInPortNodeId = null;
        liveCablePointer = mouseCanvasPos;
      }

      if (wireDragStart) {
        const dist = Math.hypot(event.clientX - wireDragStart.x, event.clientY - wireDragStart.y);
        if (dist > 5) {
          hasMovedWire = true;
        }
      }
    }
  }

  function stopDrag(event: PointerEvent) {
    if (isDraggingNode) {
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      } catch {}
      isDraggingNode = null;
    }
    if (isDraggingWire) {
      if (hasMovedWire && activeConnectingSource) {
        const el = typeof document !== 'undefined' ? document.elementFromPoint(event.clientX, event.clientY) : null;
        const targetInNodeId = el?.closest('[data-port-in]')?.getAttribute('data-port-in')
          || el?.closest('[data-node-id]')?.getAttribute('data-node-id');
        if (targetInNodeId && targetInNodeId !== activeConnectingSource) {
          connectNodes(activeConnectingSource, targetInNodeId);
        }
        cancelConnecting(true);
      } else {
        // Tapped without dragging: keep beacon active for 1-click tap connection
        isDraggingWire = false;
        liveCablePointer = null;
      }
    }
  }

  function startConnecting(nodeId: string, event: PointerEvent) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.stopPropagation();
    wasAlreadyActive = activeConnectingSource === nodeId;
    activeConnectingSource = nodeId;
    wireDragStart = { x: event.clientX, y: event.clientY };
    hasMovedWire = false;
    isDraggingWire = true;
    liveCablePointer = getCanvasCoordinates(event);
  }

  function cancelConnecting(keepMovedFlag = false) {
    activeConnectingSource = null;
    liveCablePointer = null;
    isDraggingWire = false;
    if (keepMovedFlag) {
      if (movedWireTimer) clearTimeout(movedWireTimer);
      movedWireTimer = setTimeout(() => {
        hasMovedWire = false;
      }, 100);
    } else {
      if (movedWireTimer) clearTimeout(movedWireTimer);
      hasMovedWire = false;
    }
    wireDragStart = null;
    hoveredInPortNodeId = null;
    wasAlreadyActive = false;
  }

  function handleOutPortClick(nodeId: string, event: MouseEvent) {
    event.stopPropagation();
    if (event.detail > 0 && hasMovedWire) {
      hasMovedWire = false;
      return;
    }
    if (wasAlreadyActive || (event.detail === 0 && activeConnectingSource === nodeId)) {
      cancelConnecting();
    } else {
      activeConnectingSource = nodeId;
    }
  }

  function handleInPortClick(nodeId: string, event: MouseEvent) {
    event.stopPropagation();
    if (activeConnectingSource) {
      if (activeConnectingSource !== nodeId) {
        connectNodes(activeConnectingSource, nodeId);
      }
      cancelConnecting();
    }
  }

  function handleInPortPointerUp(nodeId: string, event: PointerEvent) {
    if (activeConnectingSource && activeConnectingSource !== nodeId) {
      event.stopPropagation();
      connectNodes(activeConnectingSource, nodeId);
      cancelConnecting(true);
    }
  }

  function handleNodeCardClick(node: WorkflowNode, event: MouseEvent) {
    if (activeConnectingSource && activeConnectingSource !== node.id) {
      connectNodes(activeConnectingSource, node.id);
      cancelConnecting();
      return;
    }
    selectedNode = node;
  }

  function onCanvasClick(e: MouseEvent) {
    if (hoveredCable) {
      hoveredCable = null;
    }
    if (activeConnectingSource) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-port-in], [data-port-out], [data-node-id]')) {
        cancelConnecting();
      }
    }
  }

  function handleWindowKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (activeConnectingSource) {
        cancelConnecting();
        e.stopPropagation();
      } else if (selectedNode) {
        selectedNode = null;
      } else if (isPaletteOpen) {
        isPaletteOpen = false;
      }
    }
  }

  function addNodeFromPalette(tool: ToolConnector) {
    const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const lastNode = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: newId,
      type: 'action',
      title: tool.name,
      subtitle: tool.category,
      icon: tool.icon || 'Plug',
      x: Math.max(20, (lastNode ? lastNode.x : 300) + 260),
      y: Math.max(20, (lastNode ? lastNode.y : 180) + (Math.random() > 0.5 ? 50 : -50)),
      prompt: `Execute ${tool.name} action.`,
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
    const newId = `node-agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const lastNode = nodes[nodes.length - 1];
    const newNode: WorkflowNode = {
      id: newId,
      type: 'ai_agent',
      title: 'Custom AI Agent',
      subtitle: 'Autonomous Sub-Specialist',
      icon: 'Bot',
      x: Math.max(20, (lastNode ? lastNode.x : 300) + 260),
      y: Math.max(20, (lastNode ? lastNode.y : 180)),
      prompt: 'Perform specialized sub-task autonomously.',
      config: { model: 'google/gemini-2.0-flash-exp:free' }
    };
    nodes = [...nodes, newNode];
    if (lastNode) {
      cables = [...cables, { from: lastNode.id, to: newId }];
    }
    selectedNode = newNode;
    isPaletteOpen = false;
  }

  function addTriggerNode(triggerType: string = 'Manual / WhatsApp') {
    const newId = `node-trigger-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNode: WorkflowNode = {
      id: newId,
      type: 'trigger',
      title: `${triggerType} Trigger`,
      subtitle: 'Workflow Inbound Event',
      icon: 'Zap',
      x: 60 + Math.round(Math.random() * 40),
      y: 100 + Math.round(Math.random() * 80),
      prompt: 'Initiates workflow pipeline execution.'
    };
    nodes = [...nodes, newNode];
    selectedNode = newNode;
    isPaletteOpen = false;
  }

  // Universal Node Deletion: Any node can be deleted
  function deleteNode(id: string) {
    nodes = nodes.filter((n) => n.id !== id);
    cables = cables.filter((c) => c.from !== id && c.to !== id);
    if (selectedNode?.id === id) {
      selectedNode = null;
    }
    if (isDraggingNode === id) {
      isDraggingNode = null;
    }
    if (activeConnectingSource === id) {
      cancelConnecting();
    }
    if (hoveredInPortNodeId === id) {
      hoveredInPortNodeId = null;
    }
    if (hoveredCable && !cables.some((c) => `${c.from}->${c.to}` === hoveredCable)) {
      hoveredCable = null;
    }
    delete portOffsets[id];
    delete nodeHeights[id];
  }

  // Node Duplication: 1-click clone with offset
  function duplicateNode(id: string) {
    const orig = nodes.find((n) => n.id === id);
    if (!orig) return;
    const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const copy: WorkflowNode = {
      ...orig,
      id: newId,
      title: `${orig.title} (Copy)`,
      x: orig.x + 40,
      y: orig.y + 40,
      config: orig.config ? { ...orig.config } : undefined
    };
    nodes = [...nodes, copy];
    selectedNode = copy;
  }

  // Reset to default template
  function resetToDefault() {
    nodes = [
      {
        id: `node-1-${Date.now()}`,
        type: 'trigger',
        title: 'Workflow Trigger',
        subtitle: 'Manual 1-Click / WhatsApp Command',
        icon: 'Zap',
        x: 80,
        y: 180,
        prompt: 'Execute when user sends command or triggers workflow button.'
      },
      {
        id: `node-2-${Date.now()}`,
        type: 'ai_agent',
        title: 'AI Reasoning Engine',
        subtitle: 'Master AI Specialist (#01-#75)',
        icon: 'Bot',
        x: 390,
        y: 180,
        prompt: 'Reason over input variables and synthesize high-converting output.'
      },
      {
        id: `node-3-${Date.now()}`,
        type: 'action',
        title: 'Google Sheets',
        subtitle: 'Save Generated Deliverable',
        icon: 'sheets',
        x: 720,
        y: 120,
        prompt: 'Append output deliverable into designated Google Sheet.'
      },
      {
        id: `node-4-${Date.now()}`,
        type: 'action',
        title: 'WhatsApp Alert',
        subtitle: 'Dispatch Executive Preview',
        icon: 'whatsapp',
        x: 720,
        y: 280,
        prompt: 'Send instant notification to paired WhatsApp session.'
      }
    ];
    cables = [
      { from: nodes[0].id, to: nodes[1].id },
      { from: nodes[1].id, to: nodes[2].id },
      { from: nodes[1].id, to: nodes[3].id }
    ];
    selectedNode = null;
    isDraggingNode = null;
    hoveredCable = null;
    hoveredInPortNodeId = null;
    cancelConnecting();
  }

  function connectNodes(fromId: string, toId: string) {
    if (fromId === toId) return;
    const exists = cables.some((c) => c.from === fromId && c.to === toId);
    if (!exists) {
      cables = [...cables, { from: fromId, to: toId }];
    }
  }

  function disconnectCable(fromId: string, toId: string) {
    cables = cables.filter((c) => !(c.from === fromId && c.to === toId));
    if (hoveredCable === `${fromId}->${toId}`) {
      hoveredCable = null;
    }
  }

  function changeSelectedTool(toolId: string) {
    if (!selectedNode) return;
    const tool = TOOL_CONNECTORS.find((t) => t.id === toolId);
    if (!tool) return;
    selectedNode.title = tool.name;
    selectedNode.subtitle = tool.category;
    selectedNode.icon = tool.icon || 'Plug';
    selectedNode.config = { ...selectedNode.config, toolId: tool.id };
    nodes = [...nodes];
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

<svelte:window
  onpointermove={(e) => { if (isOpen && (isDraggingNode || isDraggingWire)) onPointerMove(e); }}
  onpointerup={(e) => { if (isOpen) stopDrag(e); }}
  onpointercancel={(e) => { if (isOpen) stopDrag(e); }}
  onkeydown={(e) => { if (isOpen) handleWindowKeyDown(e); }}
/>

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

        <button
          type="button"
          onclick={resetToDefault}
          class="hidden sm:inline-flex px-3 py-2 rounded-xl text-gray-600 hover:text-[#102A56] hover:bg-gray-100 border border-gray-200 text-xs font-semibold cursor-pointer transition-colors"
          title="Reset to default template"
        >
          Reset Template
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
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      bind:this={canvasContainer}
      class="flex-1 relative overflow-hidden bg-[#F8FAFC] touch-none"
      onclick={onCanvasClick}
    >
      <!-- SVG Bézier Cables Layer -->
      <svg
        class="absolute inset-0 w-full h-full pointer-events-none z-0"
        style="transform: scale({zoom}) translate({panX}px, {panY}px); transform-origin: top left;"
      >
        <defs>
          <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1677FF" />
            <stop offset="100%" stop-color="#38CFFF" />
          </linearGradient>
        </defs>

        {#each cables as cable (cable.from + '->' + cable.to)}
          {@const n1 = nodes.find((n) => n.id === cable.from)}
          {@const n2 = nodes.find((n) => n.id === cable.to)}
          {#if n1 && n2}
            {@const p1 = getOutPortPos(n1)}
            {@const p2 = getInPortPos(n2)}
            {@const curve = computeBezierCurveFromPoints(p1, p2)}
            {@const midX = (p1.x + p2.x) / 2}
            {@const midY = (p1.y + p2.y) / 2}
            {@const cableKey = `${cable.from}->${cable.to}`}
            {@const isHovered = hoveredCable === cableKey}

            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <g
              class="group pointer-events-auto"
              onpointerenter={() => (hoveredCable = cableKey)}
              onpointerleave={() => {
                if (hoveredCable === cableKey) hoveredCable = null;
              }}
            >
              <!-- Wide invisible hover/hit-area path (24px) -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <path
                d={curve}
                fill="none"
                stroke="transparent"
                stroke-width="24"
                class="cursor-pointer"
                onclick={(e) => {
                  e.stopPropagation();
                  hoveredCable = isHovered ? null : cableKey;
                }}
              />

              <!-- Hover Glow Underlay -->
              {#if isHovered}
                <path
                  d={curve}
                  fill="none"
                  stroke="#38CFFF"
                  stroke-width="8"
                  stroke-opacity="0.35"
                  class="blur-xs"
                />
              {/if}

              <!-- Visible Connection Cable -->
              <path
                d={curve}
                fill="none"
                stroke="url(#cableGradient)"
                stroke-width={isHovered ? 4 : 3}
                stroke-linecap="round"
                class="{isDraggingNode ? '!transition-none' : 'transition-[stroke-width,stroke] duration-150'} drop-shadow-xs"
              />

              <!-- Midpoint Disconnect Badge (✕) -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <g
                role="button"
                tabindex="0"
                transform="translate({midX}, {midY})"
                onclick={(e) => {
                  e.stopPropagation();
                  disconnectCable(cable.from, cable.to);
                }}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    disconnectCable(cable.from, cable.to);
                  }
                }}
                class="cursor-pointer {isDraggingNode ? '!transition-none' : 'transition-[opacity,transform] duration-150'} {isHovered ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100 group-hover:scale-100 focus-visible:opacity-100 focus-visible:scale-110'} outline-none focus-visible:outline-2 focus-visible:outline-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 rounded-full group/badge"
                aria-label="Disconnect connection between {n1.title} and {n2.title}"
              >
                <!-- Badge Background Circle -->
                <circle
                  r="11"
                  class="fill-white stroke-slate-300 hover:stroke-rose-500 hover:fill-rose-50 group-focus-visible/badge:stroke-rose-500 group-focus-visible/badge:stroke-2 group-focus-visible/badge:fill-rose-50 drop-shadow-md transition-colors"
                  stroke-width="1.5"
                />
                <!-- Disconnect ✕ Icon -->
                <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#E11D48" stroke-width="2" stroke-linecap="round" />
                <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#E11D48" stroke-width="2" stroke-linecap="round" />
              </g>
            </g>
          {/if}
        {/each}

        <!-- Live glowing dragging wire -->
        {#if isDraggingWire && activeConnectingSource && liveCablePointer}
          {@const srcNode = nodes.find((n) => n.id === activeConnectingSource)}
          {#if srcNode}
            {@const p1 = getOutPortPos(srcNode)}
            {@const liveCurve = computeBezierCurveFromPoints(p1, liveCablePointer)}
            <!-- Glow Underlay -->
            <path
              d={liveCurve}
              fill="none"
              stroke="#38CFFF"
              stroke-width="8"
              stroke-opacity="0.4"
              class="blur-xs"
            />
            <!-- Core Cable with animated pulse -->
            <path
              d={liveCurve}
              fill="none"
              stroke="url(#cableGradient)"
              stroke-width="3"
              stroke-dasharray="8 4"
              stroke-linecap="round"
              class="animate-pulse drop-shadow-sm"
            />
            <!-- Pinging Target Cursor Marker -->
            <g transform="translate({liveCablePointer.x}, {liveCablePointer.y})">
              <circle r="8" fill="#38CFFF" class="animate-ping opacity-60" />
              <circle r="5" fill="#1677FF" stroke="#FFFFFF" stroke-width="2" class="drop-shadow-sm" />
            </g>
          {/if}
        {/if}
      </svg>

      <!-- Draggable Nodes Canvas -->
      <div
        class="absolute inset-0 w-full h-full z-10 pointer-events-none"
        style="transform: scale({zoom}) translate({panX}px, {panY}px); transform-origin: top left;"
      >
        {#each nodes as node (node.id)}
          <div
            role="button"
            tabindex="0"
            data-node-id={node.id}
            bind:clientHeight={nodeHeights[node.id]}
            onpointerdown={(e) => startDrag(node.id, e)}
            onclick={(e) => handleNodeCardClick(node, e)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNodeCardClick(node, e as any);
              }
            }}
            class="workflow-node-card pointer-events-auto touch-none absolute w-[230px] rounded-2xl bg-white border p-4 select-none {isDraggingNode ? '!transition-none cursor-grabbing' : 'transition-[border-color,box-shadow,ring] duration-150 cursor-grab'} {isDraggingNode === node.id ? 'z-30 shadow-2xl ring-2 ring-[#1677FF]/40 border-[#1677FF]' : selectedNode?.id === node.id ? 'z-20 border-2 border-[#1677FF] ring-4 ring-[#1677FF]/15 shadow-xl' : 'z-10 border-[#CBD5E1] shadow-md hover:border-[#1677FF]'}"
            style="left: {node.x}px; top: {node.y}px;"
          >
            <!-- Node Header with Authentic Brand Icon -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border {node.type === 'trigger' ? 'bg-amber-50 border-amber-200' : node.type === 'ai_agent' ? 'bg-[#1677FF]/10 border-[#1677FF]/30' : 'bg-white border-[#CFE2FA]'}">
                  <BrandIcon name={node.title} modelId={node.config?.toolId} icon={node.icon} size={20} />
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-[#102A56] leading-tight truncate">{node.title}</h4>
                  <p class="text-[10px] text-[#64748B] truncate">{node.subtitle}</p>
                </div>
              </div>

              <!-- Action buttons on card: Duplicate & Universal Delete -->
              <div class="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onpointerdown={(e) => e.stopPropagation()}
                  onclick={(e) => { e.stopPropagation(); duplicateNode(node.id); }}
                  class="p-1 rounded-lg text-gray-400 hover:text-[#1677FF] hover:bg-[#F3F8FF] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF]"
                  title="Duplicate Node"
                  aria-label="Duplicate Node"
                >
                  <Icon name="Copy" size={13} />
                </button>
                <button
                  type="button"
                  onpointerdown={(e) => e.stopPropagation()}
                  onclick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  class="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Delete Node"
                  aria-label="Delete Node"
                >
                  <Icon name="Trash" size={13} />
                </button>
              </div>
            </div>

            {#if node.prompt}
              <p class="text-[10px] text-gray-600 italic mt-2.5 line-clamp-2 bg-gray-50/80 p-1.5 rounded-lg border border-gray-100">
                "{node.prompt}"
              </p>
            {/if}

            <!-- Ports (In / Out) in Card Footer -->
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-[10px] text-gray-400">
              <!-- In Port -->
              <button
                type="button"
                data-port-in={node.id}
                onpointerdown={(e) => e.stopPropagation()}
                onpointerup={(e) => handleInPortPointerUp(node.id, e)}
                onclick={(e) => handleInPortClick(node.id, e)}
                class="flex items-center gap-1.5 p-1 -m-1 rounded-lg transition-transform hover:scale-105 cursor-pointer group/in outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF]"
                title="Input Port (drop cable here or click to connect)"
              >
                <span
                  use:registerPort={{ id: node.id, type: 'in' }}
                  class="relative flex h-3 w-3 items-center justify-center"
                >
                  {#if activeConnectingSource && activeConnectingSource !== node.id}
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1677FF] opacity-60"></span>
                    <span class="absolute -inset-1 rounded-full ring-2 ring-[#1677FF] animate-pulse"></span>
                  {/if}
                  <span
                    class="w-2.5 h-2.5 rounded-full bg-[#1677FF] border-2 border-white shadow-2xs group-hover/in:ring-2 group-hover/in:ring-[#1677FF]/50 transition-all {hoveredInPortNodeId === node.id ? 'ring-2 ring-emerald-400 scale-125' : ''}"
                  ></span>
                </span>
                <span class="font-medium text-gray-500 group-hover/in:text-[#1677FF] transition-colors">In</span>
              </button>

              <span class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded {node.type === 'trigger' ? 'bg-amber-50 text-amber-700' : node.type === 'ai_agent' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}">
                {node.type}
              </span>

              <!-- Out Port -->
              <button
                type="button"
                data-port-out={node.id}
                onpointerdown={(e) => startConnecting(node.id, e)}
                onclick={(e) => handleOutPortClick(node.id, e)}
                class="flex items-center gap-1.5 p-1 -m-1 rounded-lg transition-transform hover:scale-105 cursor-crosshair group/out outline-none focus-visible:ring-2 focus-visible:ring-[#38CFFF]"
                title="Output Port (drag or tap to connect)"
              >
                <span class="font-medium text-gray-500 group-hover/out:text-[#38CFFF] transition-colors">Out</span>
                <span
                  use:registerPort={{ id: node.id, type: 'out' }}
                  class="relative flex h-3 w-3 items-center justify-center"
                >
                  {#if activeConnectingSource === node.id}
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38CFFF] opacity-75"></span>
                    <span class="absolute -inset-1.5 rounded-full ring-2 ring-[#38CFFF] ring-offset-1 animate-pulse"></span>
                  {/if}
                  <span
                    class="w-2.5 h-2.5 rounded-full {activeConnectingSource === node.id ? 'bg-[#1677FF] ring-2 ring-[#38CFFF]' : 'bg-[#38CFFF]'} border-2 border-white shadow-2xs group-hover/out:ring-2 group-hover/out:ring-[#38CFFF]/50 transition-all"
                  ></span>
                </span>
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Empty Canvas State -->
      {#if nodes.length === 0}
        <div class="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div class="p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-[#CFE2FA] shadow-2xl text-center space-y-4 max-w-sm pointer-events-auto animate-in zoom-in-95 duration-200">
            <div class="w-14 h-14 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] mx-auto shadow-2xs">
              <Icon name="GitBranch" size={26} />
            </div>
            <div>
              <h4 class="text-base font-extrabold text-[#102A56]">Canvas is Empty</h4>
              <p class="text-xs text-[#64748B] mt-1">Add a node from the palette or restore the default workflow template.</p>
            </div>
            <div class="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onclick={() => (isPaletteOpen = true)}
                class="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1162DB] text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Icon name="Plus" size={14} />
                <span>Add Node</span>
              </button>
              <button
                type="button"
                onclick={resetToDefault}
                class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#102A56] text-xs font-bold cursor-pointer"
              >
                Reset Template
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Comprehensive Node Inspector Panel (Slide-over when node is selected) -->
      {#if selectedNode}
        <div class="absolute right-4 bottom-4 top-4 w-96 max-w-[calc(100vw-32px)] bg-white/98 backdrop-blur-2xl rounded-3xl border border-[#CFE2FA] shadow-2xl p-5 flex flex-col z-30 animate-in slide-in-from-right duration-200 overflow-hidden">
          <!-- Header with Brand Icon, Title, and Close Button -->
          <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center shrink-0">
                <BrandIcon name={selectedNode.title} modelId={selectedNode.config?.toolId} icon={selectedNode.icon} size={22} />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <h4 class="text-xs font-bold text-[#102A56] truncate">{selectedNode.title}</h4>
                  <span class="text-[9px] font-mono px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                    {selectedNode.type}
                  </span>
                </div>
                <p class="text-[10px] text-[#64748B] truncate">{selectedNode.subtitle || 'Configure node properties'}</p>
              </div>
            </div>
            <button
              type="button"
              onclick={() => (selectedNode = null)}
              class="w-7 h-7 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              aria-label="Close Inspector"
            >
              <Icon name="X" size={14} />
            </button>
          </div>

          <!-- Scrollable Inspector Content -->
          <div class="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs">
            <!-- 1. Node Title & Subtitle -->
            <div class="space-y-2">
              <label for="inspect-title" class="block text-[11px] font-bold text-[#102A56]">Node Label</label>
              <input
                id="inspect-title"
                type="text"
                bind:value={selectedNode.title}
                class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF] bg-gray-50/50 focus:bg-white"
              />

              <label for="inspect-sub" class="block text-[11px] font-bold text-[#102A56] mt-2">Subtitle / Role</label>
              <input
                id="inspect-sub"
                type="text"
                bind:value={selectedNode.subtitle}
                class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF] bg-gray-50/50 focus:bg-white"
              />
            </div>

            <!-- 2. Node Type Switcher -->
            <div class="space-y-1.5">
              <span class="block text-[11px] font-bold text-[#102A56]">Node Role / Category</span>
              <div class="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onclick={() => { if (selectedNode) { selectedNode.type = 'trigger'; nodes = [...nodes]; } }}
                  class="py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer {selectedNode.type === 'trigger' ? 'bg-white text-amber-700 shadow-2xs font-extrabold' : 'text-gray-600 hover:text-gray-900'}"
                >
                  ⚡ Trigger
                </button>
                <button
                  type="button"
                  onclick={() => { if (selectedNode) { selectedNode.type = 'ai_agent'; nodes = [...nodes]; } }}
                  class="py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer {selectedNode.type === 'ai_agent' ? 'bg-white text-[#1677FF] shadow-2xs font-extrabold' : 'text-gray-600 hover:text-gray-900'}"
                >
                  🤖 AI Agent
                </button>
                <button
                  type="button"
                  onclick={() => { if (selectedNode) { selectedNode.type = 'action'; nodes = [...nodes]; } }}
                  class="py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer {selectedNode.type === 'action' ? 'bg-white text-emerald-700 shadow-2xs font-extrabold' : 'text-gray-600 hover:text-gray-900'}"
                >
                  🔌 Tool
                </button>
              </div>
            </div>

            <!-- 3. Tool / Connector Selector (When type === 'action') -->
            {#if selectedNode.type === 'action'}
              <div class="space-y-1.5 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span class="block text-[11px] font-bold text-[#102A56]">Switch Connected Tool</span>
                <select
                  value={selectedNode.config?.toolId || ''}
                  onchange={(e) => changeSelectedTool((e.target as HTMLSelectElement).value)}
                  class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF] bg-white cursor-pointer"
                >
                  <option value="">-- Choose from 100+ Connectors --</option>
                  {#each TOOL_CONNECTORS as tool}
                    <option value={tool.id}>{tool.name} ({tool.category})</option>
                  {/each}
                </select>
              </div>
            {/if}

            <!-- 4. AI Model Engine Selector (When type === 'ai_agent') -->
            {#if selectedNode.type === 'ai_agent'}
              <div class="space-y-1.5 p-3 rounded-2xl bg-[#F0F7FF] border border-[#CFE2FA]">
                <span class="block text-[11px] font-bold text-[#102A56]">AI Model Engine</span>
                <select
                  value={selectedNode.config?.model || 'google/gemini-2.0-flash-exp:free'}
                  onchange={(e) => {
                    if (selectedNode) {
                      selectedNode.config = { ...selectedNode.config, model: (e.target as HTMLSelectElement).value };
                      nodes = [...nodes];
                    }
                  }}
                  class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF] bg-white cursor-pointer"
                >
                  <option value="google/gemini-2.0-flash-exp:free">Google Gemini 2.0 Flash (Fast & Free)</option>
                  <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                  <option value="deepseek/deepseek-r1">DeepSeek R1 (Deep Reasoning)</option>
                  <option value="meta-llama/llama-3.3-70b-instruct:free">Meta Llama 3.3 70B</option>
                  <option value="qwen/qwen-2.5-coder-32b-instruct:free">Qwen 2.5 Coder 32B</option>
                </select>
              </div>
            {/if}

            <!-- 5. Instructions / Prompt Textarea -->
            <div class="space-y-1.5">
              <label for="inspect-prompt" class="block text-[11px] font-bold text-[#102A56]">Execution Directives / Prompt</label>
              <textarea
                id="inspect-prompt"
                bind:value={selectedNode.prompt}
                rows={3}
                placeholder="Enter execution instructions, task objectives, or mapping rules..."
                class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF] bg-gray-50/50 focus:bg-white resize-none leading-relaxed"
              ></textarea>
              <div class="flex items-center gap-1.5 flex-wrap pt-1">
                <span class="text-[10px] text-gray-400">Tokens:</span>
                {#each ['{{input}}', '{{previous_step}}', '{{user_prompt}}'] as token}
                  <button
                    type="button"
                    onclick={() => {
                      if (selectedNode) {
                        selectedNode.prompt = (selectedNode.prompt || '') + ' ' + token;
                        nodes = [...nodes];
                      }
                    }}
                    class="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-[#F3F8FF] hover:text-[#1677FF] border border-gray-200 text-[10px] font-mono text-gray-600 transition-colors cursor-pointer"
                  >
                    {token}
                  </button>
                {/each}
              </div>
            </div>

            <!-- 6. Cable Routing & Node Connections Manager -->
            <div class="space-y-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
              <span class="block text-[11px] font-bold text-[#102A56]">Active Node Connections</span>
              <div class="space-y-1">
                <span class="text-[10px] text-gray-500 font-semibold">Routes Output To:</span>
                {#if selectedOutgoingCables.length === 0}
                  <p class="text-[10px] text-gray-400 italic">No outgoing connections.</p>
                {:else}
                  {#each selectedOutgoingCables as cable}
                    {@const target = nodes.find((n) => n.id === cable.to)}
                    <div class="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-gray-200 text-[11px]">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#1677FF]"></span>
                        <span class="font-bold text-[#102A56] truncate">{target?.title || cable.to}</span>
                      </div>
                      <button
                        type="button"
                        onclick={() => disconnectCable(cable.from, cable.to)}
                        class="text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Disconnect"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  {/each}
                {/if}
              </div>

              <div class="space-y-1 pt-1.5 border-t border-gray-200">
                <span class="text-[10px] text-gray-500 font-semibold">Receives Input From:</span>
                {#if selectedIncomingCables.length === 0}
                  <p class="text-[10px] text-gray-400 italic">No incoming connections.</p>
                {:else}
                  {#each selectedIncomingCables as cable}
                    {@const source = nodes.find((n) => n.id === cable.from)}
                    <div class="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-gray-200 text-[11px]">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#38CFFF]"></span>
                        <span class="font-bold text-[#102A56] truncate">{source?.title || cable.from}</span>
                      </div>
                      <button
                        type="button"
                        onclick={() => disconnectCable(cable.from, cable.to)}
                        class="text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Disconnect"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  {/each}
                {/if}
              </div>

              <div class="pt-1.5 flex items-center gap-1.5">
                <select
                  onchange={(e) => {
                    const toId = (e.target as HTMLSelectElement).value;
                    if (toId && selectedNode) {
                      connectNodes(selectedNode.id, toId);
                      (e.target as HTMLSelectElement).value = '';
                    }
                  }}
                  class="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-[11px] text-gray-700 bg-white cursor-pointer outline-none focus:border-[#1677FF]"
                >
                  <option value="">+ Connect Output to Node...</option>
                  {#each nodes.filter((n) => n.id !== selectedNode!.id && !cables.some((c) => c.from === selectedNode!.id && c.to === n.id)) as targetNode}
                    <option value={targetNode.id}>{targetNode.title} ({targetNode.id})</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Footer Action Buttons: Duplicate & Delete -->
          <div class="pt-3 border-t border-[#F1F5F9] grid grid-cols-2 gap-2 shrink-0">
            <button
              type="button"
              onclick={() => duplicateNode(selectedNode!.id)}
              class="w-full py-2 px-3 rounded-xl border border-gray-200 hover:border-[#1677FF] bg-white hover:bg-[#F3F8FF] text-[#102A56] hover:text-[#1677FF] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Icon name="Copy" size={13} />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              onclick={() => deleteNode(selectedNode!.id)}
              class="w-full py-2 px-3 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Icon name="Trash" size={13} />
              <span>Delete Node</span>
            </button>
          </div>
        </div>
      {/if}

      <!-- Slide-over Node Palette with Authentic Brand Icons -->
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

          <!-- Quick Templates (Trigger & Custom Agent) -->
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              onclick={() => addTriggerNode('Webhook')}
              class="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-left transition-all cursor-pointer flex items-center gap-2"
            >
              <BrandIcon name="trigger" size={18} />
              <div>
                <h5 class="text-xs font-bold text-amber-900">+ Trigger</h5>
                <p class="text-[9px] text-amber-700">Event Start</p>
              </div>
            </button>

            <button
              type="button"
              onclick={addCustomAgentNode}
              class="p-2.5 rounded-xl border border-[#CFE2FA] bg-[#F3F8FF] hover:bg-[#EBF4FF] text-left transition-all cursor-pointer flex items-center gap-2"
            >
              <BrandIcon name="agent" size={18} />
              <div>
                <h5 class="text-xs font-bold text-[#102A56]">+ AI Agent</h5>
                <p class="text-[9px] text-[#1677FF]">Sub-specialist</p>
              </div>
            </button>
          </div>

          <input
            type="text"
            bind:value={paletteSearch}
            placeholder="Search 100+ tools to add as node..."
            class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] outline-none focus:border-[#1677FF]"
          />

          <!-- 100+ Tools List with Official Brand Icons -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            {#each TOOL_CONNECTORS.filter((t) => !paletteSearch || t.name.toLowerCase().includes(paletteSearch.toLowerCase()) || t.category.toLowerCase().includes(paletteSearch.toLowerCase())) as tool}
              <button
                type="button"
                onclick={() => addNodeFromPalette(tool)}
                class="w-full p-2.5 rounded-xl border border-gray-200 hover:border-[#1677FF] bg-gray-50/50 hover:bg-white text-left transition-all cursor-pointer flex items-center gap-2.5 group"
              >
                <div class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <BrandIcon name={tool.name} modelId={tool.id} icon={tool.icon} size={18} />
                </div>
                <div class="min-w-0 flex-1">
                  <h5 class="text-xs font-bold text-[#102A56] truncate group-hover:text-[#1677FF] transition-colors">{tool.name}</h5>
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
