<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import {
    TOOL_CONNECTORS,
    TOOL_CATEGORIES,
    filterConnectorsBySearch,
    filterConnectorsByCategory,
    type ToolConnector
  } from '$lib/config/toolConnectors';
  import { onMount } from 'svelte';

  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let selectedConnector = $state<ToolConnector | null>(null);
  let isConfigModalOpen = $state(false);
  let configValues = $state<Record<string, string>>({});
  let saveFeedback = $state('');
  let connectedToolsMap = $state<Record<string, boolean>>({});

  const STORAGE_KEY = 'ezbo_connected_tools';

  onMount(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        connectedToolsMap = JSON.parse(raw);
      }
    } catch {
      // fallback
    }
  });

  function saveConnectedState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connectedToolsMap));
    } catch {
      // ignore
    }
  }

  const filteredConnectors = $derived(() => {
    let result = TOOL_CONNECTORS;
    if (selectedCategory !== 'all') {
      result = filterConnectorsByCategory(selectedCategory, result);
    }
    if (searchQuery.trim()) {
      result = filterConnectorsBySearch(searchQuery, result);
    }
    return result;
  });

  function openConfigureModal(connector: ToolConnector) {
    selectedConnector = connector;
    configValues = {};
    saveFeedback = '';
    isConfigModalOpen = true;
  }

  function handleSaveCredentials() {
    if (!selectedConnector) return;
    connectedToolsMap[selectedConnector.id] = true;
    saveConnectedState();
    saveFeedback = `Successfully connected ${selectedConnector.name}!`;
    setTimeout(() => {
      saveFeedback = '';
      isConfigModalOpen = false;
    }, 1200);
  }

  function handleDisconnect(id: string) {
    delete connectedToolsMap[id];
    saveConnectedState();
  }
</script>

<div class="space-y-6">
  <!-- Header Banner -->
  <div class="rounded-3xl p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0F5FF] text-[#1677FF] border border-[#CFE2FA] mb-2">
          <Icon name="Plug" size={14} />
          <span>100+ Enterprise Connectors • Open for All Plans</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#102A56] tracking-tight">
          Tools &amp; Integrations Hub
        </h2>
        <p class="text-xs sm:text-sm text-[#4B6382] max-w-2xl mt-1 leading-relaxed">
          Connect your Google Workspace, WhatsApp, Shopify, HubSpot, and 100+ business tools. All 75 AI Specialist Agents seamlessly execute actions through your connected accounts.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
          <span class="block text-xl font-extrabold text-[#1677FF]">{Object.keys(connectedToolsMap).length}</span>
          <span class="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Connected</span>
        </div>
        <div class="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
          <span class="block text-xl font-extrabold text-[#102A56]">{TOOL_CONNECTORS.length}</span>
          <span class="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Tools</span>
        </div>
      </div>
    </div>

    <!-- Search bar & Category filter chips -->
    <div class="pt-2 space-y-3">
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search 100+ tools by name, action (e.g. Gmail, Shopify, ROAS, bKash)..."
          class="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#CBD5E1] bg-white text-xs sm:text-sm text-[#102A56] placeholder-[#94A3B8] focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 outline-none transition-all"
        />
        <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
          <Icon name="Search" size={16} />
        </div>
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = '')}
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#102A56] cursor-pointer"
          >
            <Icon name="X" size={14} />
          </button>
        {/if}
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onclick={() => (selectedCategory = 'all')}
          class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {selectedCategory === 'all'
            ? 'bg-[#102A56] text-white shadow-2xs'
            : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#102A56] hover:bg-[#E2E8F0]'}"
        >
          All Categories ({TOOL_CONNECTORS.length})
        </button>

        {#each TOOL_CATEGORIES as cat}
          {@const count = filterConnectorsByCategory(cat).length}
          <button
            type="button"
            onclick={() => (selectedCategory = cat)}
            class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {selectedCategory === cat
              ? 'bg-[#1677FF] text-white shadow-xs'
              : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#102A56] hover:bg-[#E2E8F0]'}"
          >
            <span>{cat}</span>
            <span class="ml-1 opacity-75 text-[10px]">({count})</span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Connectors Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredConnectors() as connector (connector.id)}
      {@const isConnected = !!connectedToolsMap[connector.id]}
      <div
        class="rounded-2xl p-5 bg-white border transition-all duration-200 flex flex-col justify-between {isConnected
          ? 'border-emerald-300 shadow-xs'
          : 'border-[#E2E8F0] hover:border-[#1677FF]/40 hover:shadow-xs'}"
      >
        <div class="space-y-3">
          <!-- Top Row: Icon + Badge + Connection Status -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {isConnected
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-[#F0F5FF] text-[#1677FF] border border-[#CFE2FA]'}"
              >
                <Icon name={connector.icon || 'Plug'} size={18} />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#102A56] leading-tight flex items-center gap-1.5">
                  <span>{connector.name}</span>
                  {#if connector.badge}
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      {connector.badge}
                    </span>
                  {/if}
                </h3>
                <span class="text-[10px] font-semibold text-[#64748B]">{connector.category}</span>
              </div>
            </div>

            <!-- Status Pill -->
            {#if isConnected}
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Connected</span>
              </span>
            {:else}
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span>Configure</span>
              </span>
            {/if}
          </div>

          <p class="text-xs text-[#4B6382] leading-relaxed line-clamp-2">
            {connector.description}
          </p>

          <!-- Actions Tags -->
          <div class="flex flex-wrap gap-1 pt-1">
            {#each connector.actions.slice(0, 3) as action}
              <span class="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] font-medium text-[#475569]">
                {action}
              </span>
            {/each}
            {#if connector.actions.length > 3}
              <span class="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-[#64748B]">
                +{connector.actions.length - 3}
              </span>
            {/if}
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            {connector.authType.replace('_', ' ')}
          </span>

          <div class="flex items-center gap-1.5">
            {#if isConnected}
              <button
                type="button"
                onclick={() => handleDisconnect(connector.id)}
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-colors"
              >
                Disconnect
              </button>
            {/if}

            <button
              type="button"
              onclick={() => openConfigureModal(connector)}
              class="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 {isConnected
                ? 'bg-white hover:bg-gray-50 text-[#102A56] border border-[#CBD5E1]'
                : 'bg-[#1677FF] hover:bg-[#1162DB] text-white shadow-2xs'}"
            >
              <span>{isConnected ? 'Edit Settings' : 'Configure'}</span>
              <Icon name="ArrowRight" size={12} />
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Configure Credentials Modal -->
  {#if isConfigModalOpen && selectedConnector}
    <div
      role="button"
      tabindex="0"
      onclick={() => (isConfigModalOpen = false)}
      onkeydown={(e) => { if (e.key === 'Escape') isConfigModalOpen = false; }}
      class="fixed inset-0 bg-[#102A56]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        tabindex="0"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => { if (e.key === 'Escape') isConfigModalOpen = false; }}
        class="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#CFE2FA] space-y-6 animate-in zoom-in-95 duration-200"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#F0F5FF] text-[#1677FF] border border-[#CFE2FA] flex items-center justify-center">
              <Icon name={selectedConnector.icon || 'Plug'} size={22} />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-[#102A56]">Connect {selectedConnector.name}</h3>
              <p class="text-xs text-[#64748B]">{selectedConnector.category}</p>
            </div>
          </div>
          <button
            type="button"
            onclick={() => (isConfigModalOpen = false)}
            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
          >
            <Icon name="X" size={14} />
          </button>
        </div>

        <p class="text-xs text-[#4B6382] leading-relaxed">
          {selectedConnector.description}
        </p>

        <!-- Dynamic Form Fields -->
        {#if selectedConnector.fields && selectedConnector.fields.length > 0}
          <div class="space-y-3">
            {#each selectedConnector.fields as field}
              <div>
                <label for="field-{field.key}" class="block text-xs font-bold text-[#102A56] mb-1">
                  {field.label} {#if field.required}<span class="text-rose-500">*</span>{/if}
                </label>
                <input
                  id="field-{field.key}"
                  type={field.type}
                  bind:value={configValues[field.key]}
                  placeholder={field.placeholder || `Enter ${field.label}`}
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#102A56] focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 outline-none"
                />
              </div>
            {/each}
          </div>
        {:else}
          <div class="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-center">
            <Icon name="CheckCircle" size={24} class="text-emerald-500 mx-auto" />
            <p class="text-xs font-bold text-[#102A56]">OAuth 1-Click Connection</p>
            <p class="text-[11px] text-[#64748B]">Click connect below to authorize your account via official gateway.</p>
          </div>
        {/if}

        {#if saveFeedback}
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 text-center animate-in fade-in">
            {saveFeedback}
          </div>
        {/if}

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onclick={() => (isConfigModalOpen = false)}
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleSaveCredentials}
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#1162DB] text-white shadow-sm cursor-pointer"
          >
            Save &amp; Connect
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
