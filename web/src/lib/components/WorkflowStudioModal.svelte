<script lang="ts">
  import type { Action } from 'svelte/action';
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import { TOOL_CONNECTORS, type ToolConnector } from '$lib/config/toolConnectors';
  import {
    apiKey,
    subscription,
    currentUser,
    getActiveVaultKey,
    getRoundRobinVaultKeys,
    openrouterSelectedModels,
    routingStrategy,
    isProPlan,
    apiVault,
    activeDashboardTab
  } from '$lib/stores/userStore';
  import { decryptVaultKey } from '$lib/services/crypto';
  import { marked } from 'marked';

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

  // Live Workflow Execution State
  let isExecuting = $state(false);
  let isExecutionDrawerOpen = $state(false);
  let isExecutionDrawerMinimized = $state(false);
  let executionInput = $state('Execute a high-converting multi-platform launch strategy for our flagship product.');
  let outputMarkdown = $state('');
  let executionDuration = $state(0);
  let executionError = $state('');
  let requiresApiKey = $state(false);
  let isCopied = $state(false);
  let activePulsingCables = $state<Set<string>>(new Set());

  interface ExecutionStep {
    id: string;
    name: string;
    role: 'trigger' | 'reasoning' | 'action';
    status: 'idle' | 'waiting' | 'ready' | 'running' | 'completed' | 'failed';
    detail: string;
  }

  let pipelineSteps = $state<ExecutionStep[]>([]);

  const isCloudManaged = $derived(
    $subscription?.tier === 'managed' ||
    $subscription?.tier === 'complete' ||
    $currentUser?.tier === 'managed'
  );

  const hasActiveKey = $derived(
    isCloudManaged ||
    $apiVault.some((k) => k.isEnabled !== false && !!k.encryptedKey) ||
    (!!$apiKey && $apiKey.trim().length > 5)
  );

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

  function interpolatePrompt(template: string, inputVal: string, prevStepVal: string): string {
    let res = template;
    if (res.includes('{{input}}') || res.includes('{{user_prompt}}') || res.includes('{{previous_step}}')) {
      return res
        .replaceAll('{{input}}', inputVal)
        .replaceAll('{{user_prompt}}', inputVal)
        .replaceAll('{{previous_step}}', prevStepVal);
    }
    return `${res}\n\n[Trigger Inbound Input Payload]:\n${inputVal}`;
  }

  async function runLiveWorkflow() {
    if (isExecuting) return;

    // Open live execution drawer
    isExecutionDrawerOpen = true;
    isExecutionDrawerMinimized = false;
    executionError = '';
    requiresApiKey = false;
    outputMarkdown = '';
    isCopied = false;
    activePulsingCables = new Set();

    // 1. Inspect graph topology starting from Trigger (node-1 or root trigger node)
    const triggerNode =
      nodes.find((n) => n.type === 'trigger') ||
      nodes.find((n) => !cables.some((c) => c.to === n.id)) ||
      nodes[0];

    const outgoingFromTrigger = triggerNode ? cables.filter((c) => c.from === triggerNode.id).map((c) => c.to) : [];
    const aiNode =
      nodes.find((n) => outgoingFromTrigger.includes(n.id) && (n.type === 'ai_agent' || n.id === 'node-2')) ||
      nodes.find((n) => n.type === 'ai_agent') ||
      nodes.find((n) => n.id === 'node-2') ||
      nodes[1];

    const downstreamFromAi = aiNode ? cables.filter((c) => c.from === aiNode.id).map((c) => c.to) : [];
    const actionNodes = nodes.filter((n) => downstreamFromAi.includes(n.id) && n.type === 'action');

    const inputPayload = (executionInput || triggerNode?.prompt || `Execute live workflow for ${agentName}`).trim();

    // Initialize step statuses
    pipelineSteps = [
      {
        id: triggerNode?.id || 'node-1',
        name: triggerNode?.title || 'Workflow Trigger',
        role: 'trigger',
        status: 'completed',
        detail: `Trigger input captured (${inputPayload.length} chars)`
      },
      {
        id: aiNode?.id || 'node-2',
        name: aiNode?.title || 'AI Reasoning Engine',
        role: 'reasoning',
        status: 'running',
        detail: `Synthesizing via ${aiNode?.config?.model || 'Master AI Specialist'}...`
      },
      ...actionNodes.map((a) => ({
        id: a.id,
        name: a.title,
        role: 'action' as const,
        status: 'waiting' as const,
        detail: 'Awaiting AI reasoning deliverable'
      }))
    ];

    // Check if API key is connected
    if (!hasActiveKey) {
      requiresApiKey = true;
      executionError = 'No AI API Key connected. Please connect your free Google Gemini or OpenRouter key in the API Vault.';
      pipelineSteps = pipelineSteps.map((s) => (s.role === 'reasoning' ? { ...s, status: 'failed', detail: 'Missing API key' } : s));
      return;
    }

    isExecuting = true;
    const startTime = Date.now();

    // Stage 1: Pulse cable between Trigger and AI Engine
    if (triggerNode && aiNode) {
      activePulsingCables = new Set([`${triggerNode.id}->${aiNode.id}`]);
    }

    // Token interpolation for {{input}}, {{user_prompt}}, and {{previous_step}}
    const rawAiPrompt = aiNode?.prompt || 'Reason over input variables and synthesize high-converting output.';
    const triggerSummary = `Inbound Trigger [${triggerNode?.title || 'Trigger'}]: "${inputPayload}"`;
    const assembledPrompt = interpolatePrompt(rawAiPrompt, inputPayload, triggerSummary);

    try {
      const activeVaultKey = getActiveVaultKey();
      const payload: Record<string, any> = {
        message: assembledPrompt,
        mode: 'ceo',
        planTier: $isProPlan ? 'byok_pro' : ($subscription?.tier || $currentUser?.tier || 'byok_starter'),
        history: []
      };

      if (isCloudManaged) {
        payload.usePlatformKey = true;
      } else if (activeVaultKey && activeVaultKey.encryptedKey) {
        const roundRobinKeys = getRoundRobinVaultKeys(activeVaultKey.provider);
        payload.vaultKey = {
          provider: activeVaultKey.provider,
          key: decryptVaultKey(activeVaultKey.encryptedKey, activeVaultKey.provider),
          model: aiNode?.config?.model || activeVaultKey.model,
          models: activeVaultKey.provider === 'openrouter' ? $openrouterSelectedModels : undefined,
          label: activeVaultKey.label
        };
        payload.vaultKeys = roundRobinKeys.map((k) => ({
          provider: k.provider,
          key: decryptVaultKey(k.encryptedKey, k.provider),
          model: k.model,
          models: k.provider === 'openrouter' ? $openrouterSelectedModels : undefined,
          label: k.label
        }));
        payload.openrouterModels = $openrouterSelectedModels;
        payload.routingStrategy = $routingStrategy;
      } else if ($apiKey) {
        payload.apiKey = $apiKey;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      executionDuration = Date.now() - startTime;

      if (data.requiresApiKey || (!data.success && data.error && (data.error.includes('API Key') || data.error.includes('api key')))) {
        requiresApiKey = true;
        executionError = data.error || 'No API Key configured. Please add your free Google Gemini or OpenRouter key in the API Vault.';
        activePulsingCables = new Set();
        pipelineSteps = pipelineSteps.map((s) => (s.role === 'reasoning' ? { ...s, status: 'failed', detail: executionError } : s));
        isExecuting = false;
        return;
      }

      if (res.ok && data.success && data.result) {
        if (data.result.type === 'image') {
          outputMarkdown = `![${data.result.caption || 'Synthesized Deliverable'}](${data.result.url})\n\n**Visual Deliverable:** ${data.result.caption || 'Render complete'}`;
        } else {
          outputMarkdown = data.result.text || '';
        }

        // Stage 2: Light stream flows to downstream action nodes
        const downstreamCables = new Set<string>();
        if (triggerNode && aiNode) {
          downstreamCables.add(`${triggerNode.id}->${aiNode.id}`);
        }
        for (const act of actionNodes) {
          if (aiNode) {
            downstreamCables.add(`${aiNode.id}->${act.id}`);
          }
        }
        activePulsingCables = downstreamCables;

        // Update pipeline step statuses
        pipelineSteps = [
          {
            id: triggerNode?.id || 'node-1',
            name: triggerNode?.title || 'Workflow Trigger',
            role: 'trigger',
            status: 'completed',
            detail: `Input processed (${inputPayload.length} chars)`
          },
          {
            id: aiNode?.id || 'node-2',
            name: aiNode?.title || 'AI Reasoning Engine',
            role: 'reasoning',
            status: 'completed',
            detail: `Synthesized via ${data.model || 'Master AI Specialist'} in ${(executionDuration / 1000).toFixed(2)}s`
          },
          ...actionNodes.map((a) => ({
            id: a.id,
            name: a.title,
            role: 'action' as const,
            status: 'completed' as const,
            detail: 'Deliverable ready for dispatch'
          }))
        ];
      } else {
        executionError = data.error || 'Failed to execute workflow. Please try again.';
        pipelineSteps = pipelineSteps.map((s) => (s.role === 'reasoning' ? { ...s, status: 'failed', detail: executionError } : s));
      }
    } catch (err: any) {
      executionDuration = Date.now() - startTime;
      executionError = err?.message || 'Network error executing live workflow.';
      pipelineSteps = pipelineSteps.map((s) => (s.role === 'reasoning' ? { ...s, status: 'failed', detail: executionError } : s));
    } finally {
      isExecuting = false;
    }
  }

  async function copyDeliverable() {
    if (!outputMarkdown) return;
    try {
      await navigator.clipboard.writeText(outputMarkdown);
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy deliverable:', err);
    }
  }

  function exportMarkdown() {
    if (!outputMarkdown) return;
    const filename = `${agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-deliverable.md`;
    const blob = new Blob([outputMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  function exportJson() {
    if (!outputMarkdown && !executionError) return;
    const data = {
      workflowName: agentName,
      executedAt: new Date().toISOString(),
      durationMs: executionDuration,
      input: executionInput,
      steps: pipelineSteps,
      outputMarkdown: outputMarkdown
    };
    const filename = `${agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-execution-run.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
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
          onclick={runLiveWorkflow}
          disabled={isExecuting}
          class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
          title="Execute connected workflow nodes live"
        >
          {#if isExecuting}
            <Icon name="Loader2" size={14} class="animate-spin text-white" />
            <span>Executing...</span>
          {:else}
            <Icon name="Play" size={12} class="fill-current text-white" />
            <span>▶ Run Live Workflow</span>
          {/if}
        </button>

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

              <!-- Pulsing Light Stream when executing/active -->
              {#if activePulsingCables.has(cableKey)}
                <!-- High-intensity Cyan Glow Underlay -->
                <path
                  d={curve}
                  fill="none"
                  stroke="#38CFFF"
                  stroke-width="7"
                  stroke-opacity="0.6"
                  class="blur-xs pointer-events-none"
                />
                <!-- Pulsing Light Stream with stroke-dasharray="10 6" and animation -->
                <path
                  d={curve}
                  fill="none"
                  stroke="#38CFFF"
                  stroke-width="3.5"
                  stroke-dasharray="10 6"
                  stroke-linecap="round"
                  class="pulse-cable-active pointer-events-none drop-shadow-sm"
                />
                <!-- White Core Particle Beam -->
                <path
                  d={curve}
                  fill="none"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-dasharray="10 6"
                  stroke-linecap="round"
                  class="pulse-cable-active pointer-events-none"
                />
              {/if}

              <!-- Visible Connection Cable -->
              <path
                d={curve}
                fill="none"
                stroke="url(#cableGradient)"
                stroke-width={isHovered || activePulsingCables.has(cableKey) ? 4 : 3}
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

      <!-- Live Execution Output Drawer / Modal -->
      {#if isExecutionDrawerOpen}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-4xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl border border-[#CFE2FA] shadow-2xl p-4 sm:p-5 flex flex-col z-35 transition-all duration-300 {isExecutionDrawerMinimized ? 'max-h-16' : 'max-h-[75vh]'}"
          onclick={(e) => e.stopPropagation()}
        >
          <!-- Drawer Header -->
          <div class="flex items-center justify-between pb-3 border-b border-[#F1F5F9] shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                {#if isExecuting}
                  <Icon name="Loader2" size={16} class="animate-spin text-white" />
                {:else if executionError || requiresApiKey}
                  <Icon name="AlertCircle" size={16} class="text-white" />
                {:else}
                  <Icon name="Zap" size={16} class="text-white" />
                {/if}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-xs sm:text-sm font-extrabold text-[#102A56]">Live Workflow Execution</h4>
                  {#if isExecuting}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      ⚡ Executing Pipeline...
                    </span>
                  {:else if requiresApiKey}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                      🔑 Missing API Key
                    </span>
                  {:else if executionError}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                      ⚠️ Execution Failed
                    </span>
                  {:else if outputMarkdown}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Icon name="Check" size={10} class="text-emerald-700" />
                      <span>Pipeline Complete ({executionDuration}ms)</span>
                    </span>
                  {:else}
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                      Ready to Run
                    </span>
                  {/if}
                </div>
                <p class="text-[11px] text-[#64748B]">Real-time pipeline: Trigger → AI Reasoning Engine → Delivery Actions</p>
              </div>
            </div>

            <!-- Header Controls -->
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                onclick={() => (isExecutionDrawerMinimized = !isExecutionDrawerMinimized)}
                class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
                title={isExecutionDrawerMinimized ? 'Expand Output Drawer' : 'Minimize Output Drawer'}
              >
                <Icon name={isExecutionDrawerMinimized ? 'ChevronUp' : 'ChevronDown'} size={14} />
              </button>
              <button
                type="button"
                onclick={() => (isExecutionDrawerOpen = false)}
                class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-rose-100 hover:text-rose-600 text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
                title="Close Output Drawer"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          </div>

          {#if !isExecutionDrawerMinimized}
            <div class="flex-1 overflow-y-auto space-y-4 pt-3 pr-1">
              <!-- Step-by-Step Node Execution Status Pipeline -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <!-- Trigger Node Status -->
                <div class="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                    <Icon name="Zap" size={14} />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Step 1: Trigger</span>
                      <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        Trigger: ✅ Ready
                      </span>
                    </div>
                    <p class="text-xs font-bold text-[#102A56] truncate">Workflow Trigger (node-1)</p>
                  </div>
                </div>

                <!-- AI Reasoning Engine Status -->
                <div class="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-[#1677FF] flex items-center justify-center shrink-0">
                    <Icon name="Bot" size={14} />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Step 2: AI Reasoning</span>
                      {#if isExecuting}
                        <span class="text-[11px] font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                          AI Reasoning: ⚡ Running
                        </span>
                      {:else if requiresApiKey}
                        <span class="text-[11px] font-bold text-rose-600">Missing Key</span>
                      {:else if executionError}
                        <span class="text-[11px] font-bold text-rose-600">Failed</span>
                      {:else if outputMarkdown}
                        <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          AI Reasoning: ⚡ Done
                        </span>
                      {:else}
                        <span class="text-[11px] font-semibold text-gray-400">Pending</span>
                      {/if}
                    </div>
                    <p class="text-xs font-bold text-[#102A56] truncate">AI Reasoning Engine (node-2)</p>
                  </div>
                </div>

                <!-- Action / Delivery Status -->
                <div class="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                    <Icon name="Layers" size={14} />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Step 3: Action</span>
                      {#if outputMarkdown}
                        <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          Action: 📄 Deliverable Ready
                        </span>
                      {:else if isExecuting}
                        <span class="text-[11px] font-semibold text-gray-400">Awaiting AI</span>
                      {:else}
                        <span class="text-[11px] font-semibold text-gray-400">Pending</span>
                      {/if}
                    </div>
                    <p class="text-xs font-bold text-[#102A56] truncate">Delivery Connectors (node-3, node-4)</p>
                  </div>
                </div>
              </div>

              <!-- Missing API Key Warning Card -->
              {#if requiresApiKey || (!hasActiveKey && !outputMarkdown && !isExecuting)}
                <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-base font-bold">
                      🔑
                    </div>
                    <div>
                      <h5 class="text-xs sm:text-sm font-extrabold text-amber-900">🔑 No AI API Key Connected</h5>
                      <p class="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        Google Gemini is 100% free with no credit card required. Connect your free API key in the API Vault to run visual workflows live.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onclick={() => { activeDashboardTab.set('api-keys'); isOpen = false; }}
                    class="px-4 py-2 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#1162DB] text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-transform active:scale-95"
                  >
                    <Icon name="Key" size={13} />
                    <span>Connect Free API Key</span>
                  </button>
                </div>
              {/if}

              <!-- Test Input / Trigger Payload Field -->
              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div class="flex items-center justify-between">
                  <label for="workflow-trigger-input" class="text-xs font-bold text-[#102A56] flex items-center gap-1.5">
                    <Icon name="Terminal" size={13} class="text-[#1677FF]" />
                    <span>Workflow Trigger Input Payload</span>
                  </label>
                  <span class="text-[10px] text-gray-500">Interpolates into <code>{'{{input}}'}</code> / <code>{'{{user_prompt}}'}</code></span>
                </div>
                <textarea
                  id="workflow-trigger-input"
                  bind:value={executionInput}
                  rows={2}
                  placeholder="Enter input parameters or prompt payload to send through connected nodes..."
                  class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#102A56] bg-white outline-none focus:border-[#1677FF] resize-none"
                ></textarea>
              </div>

              <!-- Output Deliverable Render Area -->
              {#if outputMarkdown}
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-[#102A56] flex items-center gap-1.5">
                      <Icon name="FileText" size={14} class="text-emerald-600" />
                      <span>Synthesized Deliverable</span>
                    </span>
                    <span class="text-[11px] text-gray-500 font-mono">
                      {outputMarkdown.length} chars
                    </span>
                  </div>

                  <div class="prose prose-sm max-w-none text-[#102A56] bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 overflow-y-auto max-h-[300px]">
                    {@html (marked.parse(outputMarkdown) as string)}
                  </div>
                </div>
              {/if}

              <!-- Error Display (if not missing API key) -->
              {#if executionError && !requiresApiKey}
                <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <Icon name="AlertCircle" size={15} class="text-rose-600 shrink-0" />
                  <span>{executionError}</span>
                </div>
              {/if}

              <!-- Bottom Action Toolbar: Copy, Export, Re-run -->
              <div class="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick={copyDeliverable}
                    disabled={!outputMarkdown}
                    class="px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#1677FF] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none text-[#102A56] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Icon name={isCopied ? 'Check' : 'Copy'} size={13} class={isCopied ? 'text-emerald-600' : 'text-gray-500'} />
                    <span>{isCopied ? 'Copied Deliverable!' : 'Copy Deliverable'}</span>
                  </button>

                  <button
                    type="button"
                    onclick={exportMarkdown}
                    disabled={!outputMarkdown}
                    class="px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#1677FF] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none text-[#102A56] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Icon name="FileText" size={13} class="text-gray-500" />
                    <span>Export Markdown (.md)</span>
                  </button>

                  <button
                    type="button"
                    onclick={exportJson}
                    disabled={!outputMarkdown}
                    class="px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#1677FF] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none text-[#102A56] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Icon name="FileJson" size={13} class="text-gray-500" />
                    <span>Export JSON (.json)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onclick={runLiveWorkflow}
                  disabled={isExecuting}
                  class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {#if isExecuting}
                    <Icon name="Loader2" size={13} class="animate-spin text-white" />
                    <span>Executing...</span>
                  {:else}
                    <Icon name="Play" size={12} class="fill-current text-white" />
                    <span>Run Again</span>
                  {/if}
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes pulseCable {
    0% {
      stroke-dashoffset: 48;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  .pulse-cable-active {
    stroke-dasharray: 10 6;
    animation: pulseCable 0.8s linear infinite;
  }
</style>
