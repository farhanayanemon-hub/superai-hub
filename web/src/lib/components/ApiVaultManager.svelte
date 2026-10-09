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
      color: 'text-blue-600',
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
      color: 'text-slate-900',
      docsUrl: 'https://console.x.ai/'
    },
    {
      id: 'deepseek',
      label: 'DeepSeek',
      placeholder: 'sk-...',
      defaultModel: 'deepseek-chat',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      color: 'text-sky-600',
      docsUrl: 'https://platform.deepseek.com/api_keys'
    },
    {
      id: 'openrouter',
      label: 'OpenRouter',
      placeholder: 'sk-or-v1-...',
      defaultModel: 'meta-llama/llama-3.1-70b-instruct',
      models: ['meta-llama/llama-3.1-70b-instruct', 'anthropic/claude-3.5-sonnet', 'mistralai/mixtral-8x7b-instruct'],
      color: 'text-purple-600',
      docsUrl: 'https://openrouter.ai/keys'
    },
    {
      id: 'replicate',
      label: 'Replicate (Image AI)',
      placeholder: 'r8_...',
      defaultModel: 'black-forest-labs/flux-schnell',
      models: ['black-forest-labs/flux-schnell', 'black-forest-labs/flux-dev', 'stability-ai/sdxl'],
      color: 'text-pink-600',
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
      <h3 class="text-lg font-bold text-slate-900">Universal API Key Vault</h3>
      <p class="text-xs text-slate-500 mt-0.5">Add unlimited API keys from any AI provider. All keys are encrypted client-side.</p>
    </div>
    <button
      onclick={() => { showAddForm = !showAddForm; }}
      class="flex items-center gap-2 px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
    >
      <Icon name={showAddForm ? 'X' : 'Plus'} size={14} />
      <span>{showAddForm ? 'Cancel' : 'Add API Key'}</span>
    </button>
  </div>

  <!-- Add Form -->
    {#if showAddForm}
      <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-900">Add New API Key</h4>

        <!-- Provider Select -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {#each PROVIDERS as p}
            <button
              onclick={() => { newProvider = p.id; handleProviderChange(); }}
              class="p-2.5 rounded-xl text-xs font-semibold transition-all border text-left {newProvider === p.id ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}"
            >
              <span class="{p.color} font-bold">{p.label}</span>
            </button>
          {/each}
        </div>

        <!-- Label -->
        <div>
          <label for="vault-key-label" class="block text-xs font-semibold text-slate-700 mb-1.5">Key Label (optional)</label>
          <input
            id="vault-key-label"
            type="text"
            bind:value={newLabel}
            placeholder="e.g. My Agency ChatGPT, Personal Grok 2..."
            class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>

        <!-- API Key Input -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="vault-api-key" class="text-xs font-semibold text-slate-700">API Key</label>
            <a
              href={getProviderConfig(newProvider).docsUrl}
              target="_blank"
              rel="noopener"
              class="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >Get key →</a>
          </div>
          <input
            id="vault-api-key"
            type="password"
            bind:value={newKey}
            placeholder={getProviderConfig(newProvider).placeholder}
            class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm text-slate-900 font-mono placeholder-slate-400 transition-all"
          />
        </div>

        <!-- Model Select -->
        <div>
          <label for="vault-model-select" class="block text-xs font-semibold text-slate-700 mb-1.5">Default Model</label>
          <select
            id="vault-model-select"
            bind:value={newModel}
            class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm text-slate-900 transition-all"
          >
            {#each getProviderConfig(newProvider).models as m}
              <option value={m}>{m}</option>
            {/each}
          </select>
        </div>

        <!-- Test Result -->
        {#if testMessage}
          <div class="p-3 rounded-xl text-xs {testResult === 'valid' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : testResult === 'invalid' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-slate-100 text-slate-600'}">
            {testMessage}
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            onclick={testKey}
            disabled={isTestingKey || !newKey.trim()}
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all disabled:opacity-50"
          >
            <Icon name={isTestingKey ? 'Loader' : 'Zap'} size={13} class={isTestingKey ? 'animate-spin' : ''} />
            <span>{isTestingKey ? 'Testing...' : 'Test Key'}</span>
          </button>
          <button
            onclick={saveKey}
            disabled={!newKey.trim() || isSaving}
            class="flex items-center gap-2 px-5 py-2 rounded-xl blue-btn text-white text-xs font-bold disabled:opacity-50 transition-all shadow-xs"
          >
            <Icon name="Save" size={13} />
            <span>Save Key</span>
          </button>
        </div>
      </div>
    {/if}

    <!-- Vault Keys List -->
    {#if $apiVault.length === 0}
      <div class="text-center py-12 text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <Icon name="Key" size={28} class="mx-auto text-slate-400" />
        <p class="text-sm font-medium">No API keys added yet.</p>
        <p class="text-xs text-slate-400">Click "Add API Key" to add your first key.</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each $apiVault as entry}
          <div class="rounded-2xl bg-white border {entry.isDefault ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'} p-4 flex items-center justify-between gap-4 group shadow-xs">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <!-- Provider badge -->
              <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold {getProviderConfig(entry.provider).color} uppercase">{entry.provider.slice(0, 3)}</span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-slate-900 truncate">{entry.label}</p>
                  {#if entry.isDefault}
                    <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">Default</span>
                  {/if}
                </div>
                <p class="text-xs text-slate-500 font-mono truncate">{getDecryptedKeyDisplay(entry)}</p>
                {#if entry.model}
                  <p class="text-[11px] text-slate-400 mt-0.5">{entry.model}</p>
                {/if}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              {#if !entry.isDefault}
                <button
                  onclick={() => setDefaultVaultKey(entry.id)}
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
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
                  class="px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              {:else}
                <button
                  onclick={() => deleteConfirmId = entry.id}
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <Icon name="Trash2" size={13} />
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
</div>
