<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import {
    TOOL_CONNECTOR_CATEGORIES,
    TOOL_CONNECTORS,
    BUSINESS_CHANNELS,
    getConnectedTools,
    getBusinessChannelsState,
    saveToolCredentials,
    saveBusinessChannelCredentials,
    disconnectTool,
    disconnectBusinessChannel,
    type ToolConnector,
    type ConnectedToolState,
    type BusinessChannelConfig
  } from '$lib/config/toolConnectors';
  import { enabledToolConnectorsStore, loadPublicPlans } from '$lib/stores/plansStore';
  import { draggableScroll } from '$lib/utils/draggableScroll';

  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let connectedMap = $state<Record<string, ConnectedToolState>>({});
  let businessChannelsMap = $state<Record<string, ConnectedToolState>>({});
  let activeModalTool = $state<ToolConnector | null>(null);
  let activeBusinessChannelModal = $state<BusinessChannelConfig | null>(null);
  let modalCredentials = $state<Record<string, string>>({});
  let businessModalCreds = $state<Record<string, string>>({});
  let saveFeedbackMessage = $state('');
  let businessFeedbackMsg = $state('');

  function refreshConnectedState(): void {
    connectedMap = getConnectedTools();
    businessChannelsMap = getBusinessChannelsState();
  }

  onMount(() => {
    refreshConnectedState();
    loadPublicPlans();

    const handleUpdate = () => {
      refreshConnectedState();
    };

    const handleSettingsUpdate = () => {
      loadPublicPlans(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ezbo:tools-updated', handleUpdate);
      window.addEventListener('ezbo:tools-settings-updated', handleSettingsUpdate);
      window.addEventListener('storage', handleUpdate);
      return () => {
        window.removeEventListener('ezbo:tools-updated', handleUpdate);
        window.removeEventListener('ezbo:tools-settings-updated', handleSettingsUpdate);
        window.removeEventListener('storage', handleUpdate);
      };
    }
  });

  const totalConnectedCount = $derived(
    Object.values(connectedMap).filter((item) => item?.status === 'connected').length
  );

  const enabledTools = $derived(
    TOOL_CONNECTORS.filter((tool) => $enabledToolConnectorsStore.includes(tool.id))
  );

  const categoryCounts = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const tool of enabledTools) {
      counts[tool.categoryId] = (counts[tool.categoryId] || 0) + 1;
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    }
    return counts;
  });

  const filteredTools = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    return enabledTools.filter((tool) => {
      // Category filter
      if (selectedCategory === 'connected') {
        if (connectedMap[tool.id]?.status !== 'connected') return false;
      } else if (selectedCategory !== 'all') {
        if (tool.categoryId !== selectedCategory && tool.category !== selectedCategory) {
          return false;
        }
      }

      // Search query filter
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
      );
    });
  });

  function openConfigureModal(tool: ToolConnector): void {
    activeModalTool = tool;
    saveFeedbackMessage = '';
    const existing = connectedMap[tool.id]?.credentials || {};
    const initialCreds: Record<string, string> = {};
    for (const field of tool.fields) {
      initialCreds[field.key] = existing[field.key] || '';
    }
    modalCredentials = initialCreds;
  }

  function closeModal(): void {
    activeModalTool = null;
    modalCredentials = {};
    saveFeedbackMessage = '';
  }

  function handleSaveCredentials(): void {
    if (!activeModalTool) return;
    saveToolCredentials(activeModalTool.id, { ...modalCredentials });
    refreshConnectedState();
    saveFeedbackMessage = 'Credentials saved successfully!';
    setTimeout(() => {
      if (saveFeedbackMessage) saveFeedbackMessage = '';
      closeModal();
    }, 1200);
  }

  function handleDisconnect(): void {
    if (!activeModalTool) return;
    disconnectTool(activeModalTool.id);
    refreshConnectedState();
    modalCredentials = {};
    saveFeedbackMessage = 'Tool disconnected.';
    setTimeout(() => {
      if (saveFeedbackMessage) saveFeedbackMessage = '';
      closeModal();
    }, 1000);
  }

  function openBusinessChannelModal(channel: BusinessChannelConfig): void {
    activeBusinessChannelModal = channel;
    businessFeedbackMsg = '';
    const existing = businessChannelsMap[channel.id]?.credentials || {};
    const initialCreds: Record<string, string> = {};
    for (const field of channel.fields) {
      initialCreds[field.key] = existing[field.key] || '';
    }
    businessModalCreds = initialCreds;
  }

  function closeBusinessChannelModal(): void {
    activeBusinessChannelModal = null;
    businessModalCreds = {};
    businessFeedbackMsg = '';
  }

  function handleSaveBusinessCredentials(): void {
    if (!activeBusinessChannelModal) return;
    saveBusinessChannelCredentials(activeBusinessChannelModal.id, { ...businessModalCreds });
    refreshConnectedState();
    businessFeedbackMsg = 'Business channel credentials saved successfully!';
    setTimeout(() => {
      businessFeedbackMsg = '';
      closeBusinessChannelModal();
    }, 1200);
  }

  function handleDisconnectBusinessChannel(): void {
    if (!activeBusinessChannelModal) return;
    disconnectBusinessChannel(activeBusinessChannelModal.id);
    refreshConnectedState();
    businessModalCreds = {};
    businessFeedbackMsg = 'Business channel disconnected.';
    setTimeout(() => {
      businessFeedbackMsg = '';
      closeBusinessChannelModal();
    }, 1000);
  }

  function formatAuthType(type: string): string {
    switch (type) {
      case 'api_key':
        return 'API Key';
      case 'oauth2':
        return 'OAuth 2.0';
      case 'webhook':
        return 'Webhook';
      case 'token':
        return 'Bearer Token';
      default:
        return type.toUpperCase();
    }
  }
</script>

<div class="space-y-6 pb-12">
  <!-- Connect Customer Support Channels (Omnichannel Auto-Reply) Hero Container -->
  <div
    id="core-business-channels"
    class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-[#F8FAFD] to-[#EDF5FF] border border-[#CFE2FA] shadow-sm hover:border-[#1677FF]/50 transition-all space-y-6 scroll-mt-6"
  >
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
      <div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#102A56] tracking-tight">
          Connect Customer Support Channels
        </h2>
        <p class="text-xs sm:text-sm text-[#4B6382] mt-1 max-w-3xl leading-relaxed">
          Connect your customer-facing communication channels so your AI agents can automatically reply to inbound customer messages 24/7.
        </p>
      </div>

      <a
        href="/docs/channels"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#CFE2FA] text-[#1677FF] hover:bg-[#F3F8FF] hover:border-[#1677FF] text-xs font-bold transition-all shadow-2xs hover:shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
      >
        <Icon name="BookOpen" size={15} />
        <span>Documentation ↗</span>
      </a>
    </div>

    <!-- 4 Featured Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each BUSINESS_CHANNELS as ch}
        {@const isConnected = businessChannelsMap[ch.id]?.status === 'connected'}
        <div class="p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md {isConnected ? 'border-emerald-300 ring-1 ring-emerald-200/50' : 'border-[#E3ECF7] hover:border-[#1677FF]/40'}">
          <div class="space-y-3">
            <!-- Icon + Status Beacon -->
            <div class="flex items-center justify-between gap-2">
              <div class="w-12 h-12 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center shrink-0">
                <BrandIcon modelId={ch.id} name={ch.brand} icon={ch.icon} size={26} />
              </div>

              {#if isConnected}
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Connected ✅</span>
                </span>
              {:else}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-[#5E7694]">
                  <span>Configure 🔗</span>
                </span>
              {/if}
            </div>

            <!-- Title & Subtitle -->
            <div>
              <h3 class="font-bold text-sm text-[#102A56] leading-snug">{ch.name}</h3>
              <p class="text-[11px] text-[#5E7694] mt-0.5 font-medium">{ch.subtitle}</p>
            </div>
          </div>

          <div class="pt-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onclick={() => openBusinessChannelModal(ch)}
              class="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer {isConnected
                ? 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                : 'bg-[#1677FF] hover:bg-[#1162DB] text-white shadow-xs'}"
            >
              {#if isConnected}
                <Icon name="Settings" size={13} />
                <span>Settings &amp; Webhook</span>
              {:else}
                <Icon name="Plus" size={13} />
                <span>Connect Account</span>
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Top Hero Header matching Relevance AI / clean SaaS design -->
  <div class="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#CFE2FA]/70 shadow-xs hover:border-[#1677FF]/40 transition-all space-y-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
      <div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#102A56] tracking-tight">
          Tools &amp; Enterprise Integrations
        </h2>
        <p class="text-xs sm:text-sm text-[#4B6382] mt-1 max-w-3xl leading-relaxed">
          Connect your workspace platforms, messaging bots, payment gateways, and CRM suites.
          Both Starter and Pro plans have complete access to all connectors to empower autonomous agent execution.
        </p>
      </div>

      <!-- Quick Metrics Counters -->
      <div class="flex items-center gap-3 shrink-0">
        <div class="px-4 py-2.5 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs text-center min-w-[100px]">
          <p class="text-[10px] uppercase font-bold text-[#5E7694] tracking-wider">Available</p>
          <p class="text-lg font-black text-[#102A56]">{enabledTools.length}</p>
        </div>
        <div class="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-2xs text-center min-w-[100px]">
          <p class="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Connected</p>
          <p class="text-lg font-black text-emerald-600">{totalConnectedCount}</p>
        </div>
      </div>
    </div>

    <!-- Search Input & Active Filter Stats -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
      <div class="relative flex-1 max-w-xl">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E7694]">
          <Icon name="Search" size={16} />
        </div>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search connectors by name, category, or service..."
          class="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-[#CFE2FA] focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 text-xs sm:text-sm text-[#102A56] placeholder-[#7B92AE] outline-none transition-all shadow-2xs"
          aria-label="Search tool connectors"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = '')}
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B92AE] hover:text-[#102A56] cursor-pointer"
            aria-label="Clear search"
          >
            <Icon name="X" size={14} />
          </button>
        {/if}
      </div>

      <div class="text-xs font-semibold text-[#5E7694] flex items-center gap-1.5 self-center sm:self-auto">
        <span>Showing</span>
        <strong class="text-[#102A56]">{filteredTools.length}</strong>
        <span>of {enabledTools.length} tools</span>
      </div>
    </div>
  </div>

  <!-- Category Filter Chips (All + Connected + 10 Categories) -->
  <div use:draggableScroll class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0 cursor-grab active:cursor-grabbing select-none">
    <!-- All Chip -->
    <button
      type="button"
      onclick={() => (selectedCategory = 'all')}
      class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 {selectedCategory === 'all'
        ? 'bg-[#1677FF] text-white shadow-xs font-bold'
        : 'bg-white/80 hover:bg-[#F3F8FF] border border-[#CFE2FA]/70 text-[#4B6382] hover:text-[#102A56]'}"
    >
      <Icon name="Grid" size={14} class={selectedCategory === 'all' ? 'text-white' : 'text-[#1677FF]'} />
      <span>All Tools</span>
      <span class="text-[10px] px-1.5 py-0.2 rounded-full {selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}">
        {enabledTools.length}
      </span>
    </button>

    <!-- Connected Filter Chip -->
    <button
      type="button"
      onclick={() => (selectedCategory = 'connected')}
      class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 {selectedCategory === 'connected'
        ? 'bg-emerald-600 text-white shadow-xs font-bold'
        : 'bg-white/80 hover:bg-emerald-50/50 border border-[#CFE2FA]/70 text-[#4B6382] hover:text-emerald-700'}"
    >
      <span class="w-2 h-2 rounded-full {selectedCategory === 'connected' ? 'bg-white' : 'bg-emerald-500'}"></span>
      <span>Connected</span>
      <span class="text-[10px] px-1.5 py-0.2 rounded-full {selectedCategory === 'connected' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 font-bold'}">
        {totalConnectedCount}
      </span>
    </button>

    <!-- 10 Categories -->
    {#each TOOL_CONNECTOR_CATEGORIES as cat}
      <button
        type="button"
        onclick={() => (selectedCategory = cat.id)}
        class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 {selectedCategory === cat.id
          ? 'bg-[#1677FF] text-white shadow-xs font-bold'
          : 'bg-white/80 hover:bg-[#F3F8FF] border border-[#CFE2FA]/70 text-[#4B6382] hover:text-[#102A56]'}"
      >
        <Icon name={cat.icon} size={14} class={selectedCategory === cat.id ? 'text-white' : 'text-[#5E7694]'} />
        <span>{cat.name}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full {selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}">
          {categoryCounts[cat.id] || 0}
        </span>
      </button>
    {/each}
  </div>

  <!-- Connectors Grid -->
  {#if filteredTools.length === 0}
    <div class="text-center py-20 bg-white/70 backdrop-blur-xl border border-[#CFE2FA]/70 rounded-3xl p-8 space-y-4 shadow-xs">
      <div class="w-16 h-16 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] mx-auto shadow-2xs">
        <Icon name="Search" size={28} />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-[#102A56]">No Connectors Found</h3>
        <p class="text-xs text-[#4B6382] max-w-md mx-auto">
          We couldn't find any tool matching your search or filter. Try a different keyword or reset the category.
        </p>
      </div>
      <button
        type="button"
        onclick={() => { searchQuery = ''; selectedCategory = 'all'; }}
        class="px-5 py-2.5 rounded-xl bg-[#1677FF] text-white text-xs font-bold hover:bg-[#1260CC] transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <Icon name="RefreshCw" size={13} />
        <span>Reset Filters</span>
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
      {#each filteredTools as tool (tool.id)}
        {@const isConnected = connectedMap[tool.id]?.status === 'connected'}
        <div
          class="bg-white/80 hover:bg-white backdrop-blur-xl border {isConnected ? 'border-emerald-300/80 shadow-xs' : 'border-[#CFE2FA]/70'} hover:border-[#1677FF]/50 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div class="space-y-3">
            <!-- Header Row: Icon + Status Pill -->
            <div class="flex items-start justify-between gap-3">
              <div class="w-11 h-11 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] group-hover:scale-105 transition-all shadow-2xs shrink-0">
                <BrandIcon name={tool.name} modelId={tool.id} icon={tool.icon} size={24} />
              </div>

              <!-- Live Status Pill (Connected vs Configure) -->
              {#if isConnected}
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Connected</span>
                </span>
              {:else}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200/80">
                  <Icon name="Plus" size={11} class="text-gray-400" />
                  <span>Configure</span>
                </span>
              {/if}
            </div>

            <!-- Content Area -->
            <div>
              <p class="text-[10px] font-bold text-[#1677FF] uppercase tracking-wider mb-0.5">
                {tool.category}
              </p>
              <h3 class="text-sm font-bold text-[#102A56] group-hover:text-[#1677FF] transition-colors leading-snug">
                {tool.name}
              </h3>
              <p class="text-xs text-[#4B6382] mt-1.5 leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </div>
          </div>

          <!-- Footer Actions & Auth Type Indicator -->
          <div class="mt-4 pt-3 border-t border-[#F0F5FF] flex items-center justify-between gap-2">
            <span class="text-[10px] font-semibold text-[#5E7694] bg-[#F3F8FF] px-2 py-0.5 rounded-md border border-[#E3ECF7]">
              {formatAuthType(tool.authType)}
            </span>

            <button
              type="button"
              onclick={() => openConfigureModal(tool)}
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 {isConnected
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-[#1677FF] text-white hover:bg-[#1260CC] shadow-2xs'}"
            >
              <Icon name={isConnected ? 'Settings' : 'Plus'} size={13} />
              <span>{isConnected ? 'Settings' : 'Connect'}</span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- ========================================================================= -->
<!-- CREDENTIAL CONFIGURATION MODAL / DRAWER -->
<!-- ========================================================================= -->
{#if activeModalTool}
  {@const modalConnected = connectedMap[activeModalTool.id]?.status === 'connected'}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A56]/50 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-tool-title"
  >
    <div
      class="bg-white rounded-3xl border border-[#CFE2FA] shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up"
    >
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-[#E3ECF7] bg-[#F8FAFC] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shrink-0">
            <BrandIcon name={activeModalTool.name} modelId={activeModalTool.id} icon={activeModalTool.icon} size={22} />
          </div>
          <div>
            <h3 id="modal-tool-title" class="text-base font-bold text-[#102A56]">
              {activeModalTool.name}
            </h3>
            <p class="text-[11px] text-[#5E7694]">
              {activeModalTool.category} • {formatAuthType(activeModalTool.authType)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={closeModal}
          class="w-9 h-9 rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close configuration modal"
        >
          <Icon name="X" size={17} />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
        <!-- Live Status Pill -->
        <div class="flex items-center justify-between p-3 rounded-2xl {modalConnected ? 'bg-emerald-50 border border-emerald-200' : 'bg-[#F3F8FF] border border-[#CFE2FA]'}">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full {modalConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}"></span>
            <span class="text-xs font-bold {modalConnected ? 'text-emerald-800' : 'text-[#102A56]'}">
              Status: {modalConnected ? 'Connected & Active' : 'Unconfigured'}
            </span>
          </div>
          {#if modalConnected && connectedMap[activeModalTool.id]?.connectedAt}
            <span class="text-[10px] text-emerald-700">
              Synced {new Date(connectedMap[activeModalTool.id].connectedAt!).toLocaleDateString()}
            </span>
          {/if}
        </div>

        <p class="text-xs text-[#4B6382] leading-relaxed">
          {activeModalTool.description} Provide the required API credentials below to allow your agents to run actions with this tool.
        </p>

        <!-- Dynamic Credential Fields -->
        <form onsubmit={(e) => { e.preventDefault(); handleSaveCredentials(); }} class="space-y-3.5 pt-1">
          {#each activeModalTool.fields as field}
            <div class="space-y-1">
              <label for={`field-${field.key}`} class="block text-xs font-bold text-[#102A56]">
                {field.label}
                {#if field.required}
                  <span class="text-rose-500">*</span>
                {/if}
              </label>
              <input
                id={`field-${field.key}`}
                type={field.type === 'password' ? 'password' : 'text'}
                bind:value={modalCredentials[field.key]}
                placeholder={field.placeholder || ''}
                required={field.required}
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE2FA] focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 text-xs text-[#102A56] placeholder-[#8EA3BD] outline-none transition-all"
              />
            </div>
          {/each}

          <!-- Feedback Notice -->
          {#if saveFeedbackMessage}
            <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Icon name="CheckCircle2" size={15} class="text-emerald-600" />
              <span>{saveFeedbackMessage}</span>
            </div>
          {/if}

          <!-- Modal Footer Buttons -->
          <div class="pt-4 border-t border-[#E3ECF7] flex items-center justify-between gap-3">
            <div>
              {#if modalConnected}
                <button
                  type="button"
                  onclick={handleDisconnect}
                  class="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                >
                  Disconnect Tool
                </button>
              {/if}
            </div>

            <div class="flex items-center gap-2.5">
              <button
                type="button"
                onclick={closeModal}
                class="px-4 py-2 rounded-xl text-xs font-semibold text-[#5E7694] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#1260CC] text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Icon name="Save" size={14} />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Business Customer Channel Configuration Modal -->
{#if activeBusinessChannelModal}
  <div
    role="button"
    tabindex="0"
    onclick={closeBusinessChannelModal}
    onkeydown={(e) => e.key === 'Escape' && closeBusinessChannelModal()}
    class="fixed inset-0 bg-[#102A56]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
  >
    <div
      role="dialog"
      aria-modal="true"
      tabindex="0"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && closeBusinessChannelModal()}
      class="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#CFE2FA] space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
    >
      <!-- Modal Header -->
      <div class="flex items-start justify-between gap-3 border-b border-[#E3ECF7] pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center shrink-0">
            <BrandIcon modelId={activeBusinessChannelModal.id} name={activeBusinessChannelModal.brand} icon={activeBusinessChannelModal.icon} size={28} />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-base sm:text-lg text-[#102A56]">
                {activeBusinessChannelModal.name}
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1677FF]/10 text-[#1677FF]">
                {activeBusinessChannelModal.badge}
              </span>
            </div>
            <p class="text-xs text-[#4B6382] mt-0.5">
              {activeBusinessChannelModal.subtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onclick={closeBusinessChannelModal}
          class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      {#if businessFeedbackMsg}
        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <Icon name="CheckCircle2" size={15} />
          <span>{businessFeedbackMsg}</span>
        </div>
      {/if}

      <!-- Webhook Callback URL Notice -->
      <div class="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1.5">
        <p class="text-[11px] font-bold text-[#102A56]">Webhook Inbound Callback URL:</p>
        <div class="flex items-center gap-2">
          <code class="px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[11px] font-mono text-[#0F172A] flex-1 select-all break-all">
            https://ezboagents.com{activeBusinessChannelModal.webhookPath}
          </code>
        </div>
        <p class="text-[10px] text-[#64748B]">
          Configure this Webhook in your Meta App Dashboard or Telegram @BotFather to receive customer messages in real-time.
        </p>
      </div>

      <!-- Form Fields -->
      <form onsubmit={(e) => { e.preventDefault(); handleSaveBusinessCredentials(); }} class="space-y-3.5 pt-1">
        {#each activeBusinessChannelModal.fields as field}
          <div class="space-y-1">
            <label for={'biz-' + field.key} class="block text-xs font-bold text-[#102A56]">
              {field.label}
              {#if field.required}
                <span class="text-rose-500">*</span>
              {/if}
            </label>
            <input
              id={'biz-' + field.key}
              type={field.type === 'password' ? 'password' : 'text'}
              bind:value={businessModalCreds[field.key]}
              placeholder={field.placeholder || ''}
              required={field.required}
              class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#CFE2FA] focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 text-xs text-[#102A56] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        {/each}

        <!-- Modal Actions -->
        <div class="flex items-center justify-between gap-3 pt-4 border-t border-[#E3ECF7]">
          <div>
            {#if businessChannelsMap[activeBusinessChannelModal.id]?.status === 'connected'}
              <button
                type="button"
                onclick={handleDisconnectBusinessChannel}
                class="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
              >
                Disconnect Channel
              </button>
            {/if}
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={closeBusinessChannelModal}
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#1162DB] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="Save" size={14} />
              <span>Save Credentials</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
{/if}
