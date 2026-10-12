<script lang="ts">
  import Icon from './Icon.svelte';
  import {
    apiVault,
    subscription,
    addVaultKey,
    removeVaultKey,
    setDefaultVaultKey,
    type ApiVaultKey,
    type AIProvider
  } from '$lib/stores/userStore';
  import { encryptVaultKey, decryptVaultKey } from '$lib/services/crypto';

  interface ProviderConfig {
    id: AIProvider;
    label: string;
    placeholder: string;
    defaultModel: string;
    models: string[];
    color: string;
    docsUrl: string;
  }

  const PROVIDERS: ProviderConfig[] = [
    {
      id: 'gemini',
      label: 'Google Gemini',
      placeholder: 'AIzaSy...',
      defaultModel: 'gemini-2.0-flash',
      models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      color: 'text-[#1677FF]',
      docsUrl: 'https://aistudio.google.com/app/apikey'
    },
    {
      id: 'openai',
      label: 'OpenAI (ChatGPT)',
      placeholder: 'sk-proj-...',
      defaultModel: 'gpt-4o',
      models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'],
      color: 'text-emerald-600',
      docsUrl: 'https://platform.openai.com/api-keys'
    },
    {
      id: 'grok',
      label: 'xAI (Grok)',
      placeholder: 'xai-...',
      defaultModel: 'grok-3',
      models: ['grok-3', 'grok-2-latest', 'grok-beta'],
      color: 'text-[#102A56]',
      docsUrl: 'https://console.x.ai/'
    },
    {
      id: 'deepseek',
      label: 'DeepSeek',
      placeholder: 'sk-...',
      defaultModel: 'deepseek-chat',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      color: 'text-[#089CD0]',
      docsUrl: 'https://platform.deepseek.com/api_keys'
    },
    {
      id: 'openrouter',
      label: 'OpenRouter',
      placeholder: 'sk-or-v1-...',
      defaultModel: 'meta-llama/llama-3.1-70b-instruct',
      models: ['meta-llama/llama-3.1-70b-instruct', 'anthropic/claude-3.5-sonnet', 'mistralai/mixtral-8x7b-instruct'],
      color: 'text-[#1677FF]',
      docsUrl: 'https://openrouter.ai/keys'
    },
    {
      id: 'replicate',
      label: 'Replicate (Image AI)',
      placeholder: 'r8_...',
      defaultModel: 'black-forest-labs/flux-schnell',
      models: ['black-forest-labs/flux-schnell', 'black-forest-labs/flux-dev', 'stability-ai/sdxl'],
      color: 'text-[#089CD0]',
      docsUrl: 'https://replicate.com/account/api-tokens'
    }
  ];

  let showAddForm = $state(false);
  let newProvider = $state<AIProvider>('gemini');
  let newLabel = $state('');
  let newKey = $state('');
  let newModel = $state('gemini-2.0-flash');
  let isTestingKey = $state(false);
  let testResult = $state<'idle' | 'valid' | 'invalid'>('idle');
  let testMessage = $state('');
  let isSaving = $state(false);
  let deleteConfirmId = $state<string | null>(null);
  const isVaultUnlocked = $derived(true);

  function getProviderConfig(id: AIProvider): ProviderConfig {
    return PROVIDERS.find((p) => p.id === id) || PROVIDERS[0];
  }

  function handleProviderChange() {
    const config = getProviderConfig(newProvider);
    newModel = config.defaultModel;
    newLabel = '';
    testResult = 'idle';
    testMessage = '';
  }

  async function testKey() {
    if (!newKey.trim()) {
      testResult = 'invalid';
      testMessage = 'Please enter an API key first.';
      return;
    }
    isTestingKey = true;
    testResult = 'idle';
    testMessage = 'Testing connection...';

    try {
      if (newProvider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${newKey.trim()}`,
          { method: 'GET' }
        );
        if (res.ok) {
          testResult = 'valid';
          testMessage = 'Google Gemini key is active and valid.';
        } else {
          testResult = 'invalid';
          testMessage = 'Gemini key validation failed. Check the key and try again.';
        }
      } else {
        const keyLength = newKey.trim().length;
        if (newProvider === 'openai' && newKey.startsWith('sk-')) {
          testResult = 'valid';
          testMessage = 'OpenAI key format looks valid. It will be tested on first use.';
        } else if (newProvider === 'grok' && newKey.startsWith('xai-')) {
          testResult = 'valid';
          testMessage = 'xAI Grok key format looks valid. It will be tested on first use.';
        } else if (newProvider === 'deepseek' && newKey.startsWith('sk-')) {
          testResult = 'valid';
          testMessage = 'DeepSeek key format looks valid. It will be tested on first use.';
        } else if (newProvider === 'openrouter' && newKey.startsWith('sk-or-')) {
          testResult = 'valid';
          testMessage = 'OpenRouter key format looks valid. It will be tested on first use.';
        } else if (newProvider === 'replicate' && newKey.startsWith('r8_')) {
          testResult = 'valid';
          testMessage = 'Replicate key format looks valid. It will be tested on first use.';
        } else if (keyLength > 20) {
          testResult = 'valid';
          testMessage = 'Key saved. It will be validated on first API call.';
        } else {
          testResult = 'invalid';
          testMessage = 'This key format appears incorrect. Please double-check.';
        }
      }
    } catch {
      testResult = 'invalid';
      testMessage = 'Connection error during key test. Please try again.';
    } finally {
      isTestingKey = false;
    }
  }

  function saveKey() {
    if (!newKey.trim()) return;
    isSaving = true;
    const config = getProviderConfig(newProvider);
    const label = newLabel.trim() || `My ${config.label} Key`;
    const encrypted = encryptVaultKey(newKey.trim(), newProvider);
    const isFirstKey = $apiVault.length === 0;

    addVaultKey({
      provider: newProvider,
      label,
      encryptedKey: encrypted,
      model: newModel || config.defaultModel,
      isDefault: isFirstKey,
      isValid: testResult === 'valid' ? true : undefined
    });

    showAddForm = false;
    newKey = '';
    newLabel = '';
    newProvider = 'gemini';
    newModel = 'gemini-2.0-flash';
    testResult = 'idle';
    testMessage = '';
    isSaving = false;
  }

  function getDecryptedKeyDisplay(entry: ApiVaultKey): string {
    try {
      const decrypted = decryptVaultKey(entry.encryptedKey, entry.provider);
      if (decrypted.length > 12) {
        return decrypted.slice(0, 8) + '••••••••' + decrypted.slice(-4);
      }
      return '••••••••••';
    } catch {
      return '••••••••••';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-bold text-[#102A56]">Universal API Key Vault</h3>
      <p class="text-xs text-[#4B6382] mt-0.5">Add unlimited API keys from any AI provider. All keys are encrypted client-side.</p>
    </div>
    <button
      onclick={() => { showAddForm = !showAddForm; }}
      class="flex items-center gap-2 px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all cursor-pointer"
    >
      <Icon name={showAddForm ? 'X' : 'Plus'} size={14} />
      <span>{showAddForm ? 'Cancel' : 'Add API Key'}</span>
    </button>
  </div>

  <!-- Add Form -->
    {#if showAddForm}
      <div class="rounded-2xl ui-card-static p-5 space-y-4">
        <h4 class="text-sm font-bold text-[#102A56]">Add New API Key</h4>

        <!-- Provider Select -->
        <div class="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-2">
          {#each PROVIDERS as p}
            <button
              onclick={() => { newProvider = p.id; handleProviderChange(); }}
              class="p-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer {newProvider === p.id ? 'bg-[#F3F8FF] border-[#1677FF] text-[#102A56] ring-2 ring-[#1677FF]/15 shadow-2xs' : 'bg-white border-[#E3ECF7] text-[#4B6382] hover:border-[#1677FF]/50 hover:bg-[#F3F8FF]/60'}"
            >
              <span class="{p.color} font-bold">{p.label}</span>
            </button>
          {/each}
        </div>

        <!-- Label -->
        <div>
          <label for="vault-key-label" class="block text-xs font-semibold text-[#102A56] mb-1.5">Key Label (optional)</label>
          <input
            id="vault-key-label"
            type="text"
            bind:value={newLabel}
            placeholder="e.g. My Agency ChatGPT, Personal Grok 2..."
            class="ui-input px-4 py-2.5 text-sm"
          />
        </div>

        <!-- API Key Input -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="vault-api-key" class="text-xs font-semibold text-[#102A56]">API Key</label>
            <a
              href={getProviderConfig(newProvider).docsUrl}
              target="_blank"
              rel="noopener"
              class="text-xs text-[#1677FF] hover:underline font-semibold"
            >Get key →</a>
          </div>
          <input
            id="vault-api-key"
            type="password"
            bind:value={newKey}
            placeholder={getProviderConfig(newProvider).placeholder}
            class="ui-input px-4 py-2.5 text-sm font-mono"
          />
        </div>

        <!-- Model Select -->
        <div>
          <label for="vault-model-select" class="block text-xs font-semibold text-[#102A56] mb-1.5">Default Model</label>
          <select
            id="vault-model-select"
            bind:value={newModel}
            class="ui-select px-4 py-2.5 text-sm"
          >
            {#each getProviderConfig(newProvider).models as m}
              <option value={m}>{m}</option>
            {/each}
          </select>
        </div>

        <!-- Test Result -->
        {#if testMessage}
          <div class="p-3 rounded-xl text-xs {testResult === 'valid' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : testResult === 'invalid' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-[#F3F8FF] border border-[#E3ECF7] text-[#4B6382]'}">
            {testMessage}
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            onclick={testKey}
            disabled={isTestingKey || !newKey.trim()}
            class="flex items-center gap-2 px-4 py-2 rounded-xl btn-secondary text-xs disabled:opacity-50 cursor-pointer"
          >
            <Icon name={isTestingKey ? 'Loader' : 'Zap'} size={13} class={isTestingKey ? 'animate-spin' : ''} />
            <span>{isTestingKey ? 'Testing...' : 'Test Key'}</span>
          </button>
          <button
            onclick={saveKey}
            disabled={!newKey.trim() || isSaving}
            class="flex items-center gap-2 px-5 py-2 rounded-xl blue-btn text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer"
          >
            <Icon name="Save" size={13} />
            <span>Save Key</span>
          </button>
        </div>
      </div>
    {/if}

    <!-- Vault Keys List -->
    {#if $apiVault.length === 0}
      <div class="text-center py-12 text-[#4B6382] space-y-3 bg-[#F3F8FF]/80 rounded-2xl border border-[#E3ECF7]">
        <div class="w-12 h-12 rounded-2xl bg-white border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] mx-auto shadow-2xs">
          <Icon name="Key" size={22} />
        </div>
        <p class="text-sm font-bold text-[#102A56]">No API keys added yet.</p>
        <p class="text-xs text-[#4B6382]">Click "Add API Key" to add your first key.</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each $apiVault as entry}
          <div class="rounded-2xl bg-white border {entry.isDefault ? 'border-[#1677FF] ring-2 ring-[#1677FF]/15' : 'border-[#E3ECF7]'} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group shadow-2xs">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <!-- Provider badge -->
              <div class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center shrink-0">
                <span class="text-xs font-bold {getProviderConfig(entry.provider).color} uppercase">{entry.provider.slice(0, 3)}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-bold text-[#102A56] truncate">{entry.label}</p>
                  {#if entry.isDefault}
                    <span class="px-2 py-0.5 rounded-full ui-badge-primary text-[10px]">Default</span>
                  {/if}
                </div>
                <p class="text-xs text-[#4B6382] font-mono truncate">{getDecryptedKeyDisplay(entry)}</p>
                {#if entry.model}
                  <p class="text-[11px] text-[#5E7694] mt-0.5 truncate">{entry.model}</p>
                {/if}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E3ECF7]/60 justify-end">
              {#if !entry.isDefault}
                <button
                  onclick={() => setDefaultVaultKey(entry.id)}
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary cursor-pointer"
                >
                  Set Default
                </button>
              {/if}
              {#if deleteConfirmId === entry.id}
                <button
                  onclick={() => { removeVaultKey(entry.id); deleteConfirmId = null; }}
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  onclick={() => deleteConfirmId = null}
                  class="px-2 py-1.5 rounded-lg text-xs text-[#4B6382] hover:text-[#102A56] cursor-pointer"
                >
                  Cancel
                </button>
              {:else}
                <button
                  onclick={() => deleteConfirmId = entry.id}
                  class="w-10 h-10 flex items-center justify-center rounded-xl text-[#5E7694] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Delete API key"
                  aria-label="Delete API key"
                >
                  <Icon name="Trash2" size={15} />
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
</div>
