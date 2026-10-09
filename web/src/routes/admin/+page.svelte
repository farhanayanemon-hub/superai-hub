<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { onMount } from 'svelte';

  interface AdminModelToggles {
    'gemini-2.0-flash': boolean;
    'gemini-1.5-pro': boolean;
    'gpt-4o': boolean;
    'gpt-4o-mini': boolean;
    'grok-3': boolean;
    'deepseek-chat': boolean;
    'claude-3.5-sonnet': boolean;
    'flux-schnell': boolean;
  }

  interface PublicSettings {
    opayApiKey: string;
    opaySecretKey: string;
    opayBrandKey: string;
    geminiApiKey: string;
    openaiApiKey: string;
    grokApiKey: string;
    deepseekApiKey: string;
    openrouterApiKey: string;
    replicateApiKey: string;
    hasOpayKey: boolean;
    hasGeminiKey: boolean;
    hasOpenaiKey: boolean;
    hasGrokKey: boolean;
    hasDeepseekKey: boolean;
    hasOpenrouterKey: boolean;
    hasReplicateKey: boolean;
    modelsEnabled: AdminModelToggles;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpFrom?: string;
    hasSmtp?: boolean;
  }

  // Passphrase gate
  let adminSecret = $state('ezbo-admin-2026');
  let isAuthenticated = $state(false);
  let authError = $state('');

  // Form state
  let opayApiKey = $state('');
  let opaySecretKey = $state('');
  let opayBrandKey = $state('');
  let geminiApiKey = $state('');
  let openaiApiKey = $state('');
  let grokApiKey = $state('');
  let deepseekApiKey = $state('');
  let openrouterApiKey = $state('');
  let replicateApiKey = $state('');

  // SMTP Email Form State
  let smtpHost = $state('');
  let smtpPort = $state(587);
  let smtpUser = $state('');
  let smtpPass = $state('');
  let smtpFrom = $state('EzboAgents <noreply@ezboagents.com>');
  let hasSmtp = $state(false);
  let testEmailTo = $state('');
  let isSendingTestEmail = $state(false);
  let testEmailFeedback = $state('');

  let showKeyMap = $state<Record<string, boolean>>({});

  let modelsEnabled = $state<AdminModelToggles>({
    'gemini-2.0-flash': true,
    'gemini-1.5-pro': true,
    'gpt-4o': true,
    'gpt-4o-mini': true,
    'grok-3': true,
    'deepseek-chat': true,
    'claude-3.5-sonnet': true,
    'flux-schnell': true
  });

  let isLoading = $state(false);
  let isSaving = $state(false);
  let saveFeedback = $state('');
  let saveFeedbackType = $state<'success' | 'error'>('success');
  let copyFeedback = $state('');

  const MODELS_CATALOG: { id: keyof AdminModelToggles; name: string; provider: string; tag: string; latency: string }[] = [
    { id: 'gemini-2.0-flash', name: 'Google Gemini 2.0 Flash', provider: 'Google AI Studio', tag: 'High Speed (Default)', latency: '~350ms' },
    { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', provider: 'Google AI Studio', tag: '2M Long Context', latency: '~1.1s' },
    { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'OpenAI', tag: 'Flagship Multimodal', latency: '~800ms' },
    { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'OpenAI', tag: 'Cost Effective', latency: '~400ms' },
    { id: 'grok-3', name: 'xAI Grok-3', provider: 'xAI Console', tag: 'Uncensored Real-Time', latency: '~900ms' },
    { id: 'deepseek-chat', name: 'DeepSeek V3 Chat', provider: 'DeepSeek Platform', tag: 'Deep Reasoning', latency: '~1.2s' },
    { id: 'claude-3.5-sonnet', name: 'Anthropic Claude 3.5 Sonnet', provider: 'OpenRouter', tag: 'Coding & Analysis', latency: '~950ms' },
    { id: 'flux-schnell', name: 'Flux Schnell AI Image', provider: 'Replicate', tag: 'Image Generation', latency: '~2.4s' }
  ];

  function toggleShowKey(keyName: string) {
    showKeyMap[keyName] = !showKeyMap[keyName];
  }

  function handleAuthSubmit() {
    if (!adminSecret.trim()) {
      authError = 'Please enter the admin passphrase.';
      return;
    }
    authError = '';
    loadSettings();
  }

  async function loadSettings() {
    isLoading = true;
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s: PublicSettings = data.settings;
        opayApiKey = s.opayApiKey || '';
        opaySecretKey = s.opaySecretKey || '';
        opayBrandKey = s.opayBrandKey || '';
        geminiApiKey = s.geminiApiKey || '';
        openaiApiKey = s.openaiApiKey || '';
        grokApiKey = s.grokApiKey || '';
        deepseekApiKey = s.deepseekApiKey || '';
        openrouterApiKey = s.openrouterApiKey || '';
        replicateApiKey = s.replicateApiKey || '';
        smtpHost = s.smtpHost || '';
        smtpPort = s.smtpPort || 587;
        smtpUser = s.smtpUser || '';
        smtpPass = s.smtpPass || '';
        smtpFrom = s.smtpFrom || 'EzboAgents <noreply@ezboagents.com>';
        hasSmtp = !!s.hasSmtp;
        if (s.modelsEnabled) {
          modelsEnabled = { ...s.modelsEnabled };
        }
        isAuthenticated = true;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ezbo_admin_authed', 'true');
          sessionStorage.setItem('ezbo_admin_secret', adminSecret);
        }
      } else {
        authError = data.error || 'Failed to load settings from server.';
      }
    } catch (e: any) {
      authError = e.message || 'Network connection failed.';
    } finally {
      isLoading = false;
    }
  }

  async function saveSettings() {
    isSaving = true;
    saveFeedback = '';
    try {
      const patch = {
        opayApiKey,
        opaySecretKey,
        opayBrandKey,
        geminiApiKey,
        openaiApiKey,
        grokApiKey,
        deepseekApiKey,
        openrouterApiKey,
        replicateApiKey,
        smtpHost,
        smtpPort: Number(smtpPort) || 587,
        smtpUser,
        smtpPass,
        smtpFrom,
        modelsEnabled
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret,
          patch
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        saveFeedback = 'Admin configuration & AI models saved successfully in real-time.';
        saveFeedbackType = 'success';
        if (data.settings) {
          const s: PublicSettings = data.settings;
          opayApiKey = s.opayApiKey || opayApiKey;
          opaySecretKey = s.opaySecretKey || opaySecretKey;
          opayBrandKey = s.opayBrandKey || opayBrandKey;
          geminiApiKey = s.geminiApiKey || geminiApiKey;
          openaiApiKey = s.openaiApiKey || openaiApiKey;
          grokApiKey = s.grokApiKey || grokApiKey;
          deepseekApiKey = s.deepseekApiKey || deepseekApiKey;
          openrouterApiKey = s.openrouterApiKey || openrouterApiKey;
          replicateApiKey = s.replicateApiKey || replicateApiKey;
          smtpHost = s.smtpHost || smtpHost;
          smtpPort = s.smtpPort || smtpPort;
          smtpUser = s.smtpUser || smtpUser;
          smtpPass = s.smtpPass || smtpPass;
          smtpFrom = s.smtpFrom || smtpFrom;
          hasSmtp = !!s.hasSmtp;
          if (s.modelsEnabled) modelsEnabled = { ...s.modelsEnabled };
        }
      } else {
        saveFeedback = data.error || 'Failed to update settings. Please check your admin secret.';
        saveFeedbackType = 'error';
      }
    } catch (err: any) {
      saveFeedback = err.message || 'Network error saving settings.';
      saveFeedbackType = 'error';
    } finally {
      isSaving = false;
      setTimeout(() => {
        saveFeedback = '';
      }, 5000);
    }
  }

  async function sendTestEmail() {
    if (!testEmailTo.trim()) {
      testEmailFeedback = 'Please enter an email address to send the test verification code.';
      return;
    }
    isSendingTestEmail = true;
    testEmailFeedback = '';

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmailTo.trim(),
          name: 'Admin Test',
          action: 'signup'
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.simulated) {
          testEmailFeedback = `Simulated Mode: Code ${data.debugCode} generated. Save real SMTP below to deliver live emails to inbox.`;
        } else {
          testEmailFeedback = `✅ Live 6-digit OTP email delivered successfully to ${testEmailTo}! Check inbox or spam folder.`;
        }
      } else {
        testEmailFeedback = `❌ Failed: ${data.error || 'Could not send test email'}`;
      }
    } catch (e: any) {
      testEmailFeedback = `❌ Error: ${e.message || 'Network error'}`;
    } finally {
      isSendingTestEmail = false;
    }
  }

  function copyVercelEnv() {
    const lines: string[] = [];
    if (opayApiKey && !opayApiKey.includes('••••')) lines.push(`OPAY_API_KEY=${opayApiKey}`);
    if (opaySecretKey && !opaySecretKey.includes('••••')) lines.push(`OPAY_SECRET_KEY=${opaySecretKey}`);
    if (opayBrandKey && !opayBrandKey.includes('••••')) lines.push(`OPAY_BRAND_KEY=${opayBrandKey}`);
    if (geminiApiKey && !geminiApiKey.includes('••••')) lines.push(`PLATFORM_GEMINI_KEY=${geminiApiKey}`);
    if (openaiApiKey && !openaiApiKey.includes('••••')) lines.push(`OPENAI_API_KEY=${openaiApiKey}`);
    if (grokApiKey && !grokApiKey.includes('••••')) lines.push(`GROK_API_KEY=${grokApiKey}`);
    if (deepseekApiKey && !deepseekApiKey.includes('••••')) lines.push(`DEEPSEEK_API_KEY=${deepseekApiKey}`);
    if (openrouterApiKey && !openrouterApiKey.includes('••••')) lines.push(`OPENROUTER_API_KEY=${openrouterApiKey}`);
    if (replicateApiKey && !replicateApiKey.includes('••••')) lines.push(`REPLICATE_API_KEY=${replicateApiKey}`);
    if (smtpHost && !smtpHost.includes('••••')) lines.push(`SMTP_HOST=${smtpHost}`);
    if (smtpPort) lines.push(`SMTP_PORT=${smtpPort}`);
    if (smtpUser && !smtpUser.includes('••••')) lines.push(`SMTP_USER=${smtpUser}`);
    if (smtpPass && !smtpPass.includes('••••')) lines.push(`SMTP_PASS=${smtpPass}`);
    if (smtpFrom) lines.push(`SMTP_FROM=${smtpFrom}`);
    lines.push(`ADMIN_SECRET=${adminSecret}`);

    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    copyFeedback = 'Copied .env format to clipboard for Vercel!';
    setTimeout(() => (copyFeedback = ''), 4000);
  }

  function handleLogout() {
    isAuthenticated = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ezbo_admin_authed');
    }
  }

  const activeModelsCount = $derived(
    Object.values(modelsEnabled).filter(Boolean).length
  );

  onMount(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('ezbo_admin_authed');
      const storedSecret = sessionStorage.getItem('ezbo_admin_secret');
      if (storedSecret) adminSecret = storedSecret;
      if (storedAuth === 'true') {
        loadSettings();
      }
    }
  });
</script>

<svelte:head>
  <title>Admin Command Center • EzboAgents</title>
</svelte:head>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white font-sans">
  {#if !isAuthenticated}
    <!-- ======================================================== -->
    <!-- AUTHENTICATION PASSCODE GATE -->
    <!-- ======================================================== -->
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-blue-500/5 space-y-6">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 mx-auto">
            <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Icon name="Shield" class="text-blue-600" size={26} />
            </div>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Ezbo<span class="text-blue-600">Agents</span> Admin</h1>
          <p class="text-xs text-slate-500">Master Platform Control • Payment Gateways & Model Router</p>
        </div>

        {#if authError}
          <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <Icon name="AlertCircle" size={16} />
            <span>{authError}</span>
          </div>
        {/if}

        <form onsubmit={(e) => { e.preventDefault(); handleAuthSubmit(); }} class="space-y-4">
          <div>
            <label for="admin-passphrase-input" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Passphrase
            </label>
            <input
              id="admin-passphrase-input"
              type="password"
              bind:value={adminSecret}
              placeholder="Enter master admin passphrase..."
              class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-mono"
            />
            <p class="text-[11px] text-slate-400 mt-1">Default development passphrase: <code class="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono">ezbo-admin-2026</code></p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            class="w-full py-3.5 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {#if isLoading}
              <Icon name="Loader2" size={16} class="animate-spin" />
              <span>Verifying Credentials...</span>
            {:else}
              <Icon name="Lock" size={16} />
              <span>Authenticate into Admin Center</span>
            {/if}
          </button>
        </form>

        <div class="pt-4 border-t border-slate-100 text-center">
          <a href="/dashboard" class="text-xs text-slate-500 hover:text-blue-600 transition-colors font-semibold">
            ← Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  {:else}
    <!-- ======================================================== -->
    <!-- MASTER ADMIN CONSOLE DASHBOARD -->
    <!-- ======================================================== -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Top Navigation & Status Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20">
            <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Icon name="Settings" class="text-blue-600" size={24} />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-black text-slate-900">Ezbo<span class="text-blue-600">Agents</span> Admin Console</h1>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">Live Production</span>
            </div>
            <p class="text-xs text-slate-500">Configure production API keys, manage payment gateway, and toggle AI engines.</p>
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-2.5">
          <a
            href="/dashboard"
            class="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Icon name="Layout" size={14} />
            <span>Dashboard</span>
          </a>

          <button
            type="button"
            onclick={copyVercelEnv}
            class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-blue-600 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Export all configured keys in .env format"
          >
            <Icon name="Copy" size={14} />
            <span>Export Vercel .env</span>
          </button>

          <button
            type="button"
            onclick={handleLogout}
            class="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-colors flex items-center gap-1.5"
          >
            <Icon name="LogOut" size={14} />
            <span>Lock</span>
          </button>
        </div>
      </div>

      <!-- Feedback Toast -->
      {#if saveFeedback}
        <div class="p-4 rounded-2xl {saveFeedbackType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} border text-xs font-medium flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div class="flex items-center gap-2.5">
            <Icon name={saveFeedbackType === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={18} class={saveFeedbackType === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
            <span class="font-semibold">{saveFeedback}</span>
          </div>
          <button onclick={() => (saveFeedback = '')} class="p-1 hover:bg-white/50 rounded-lg">
            <Icon name="X" size={14} />
          </button>
        </div>
      {/if}

      {#if copyFeedback}
        <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Icon name="Check" size={16} class="text-blue-600" />
          <span>{copyFeedback}</span>
        </div>
      {/if}

      <!-- Top Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment Gateway</p>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full {opayApiKey ? 'bg-emerald-500' : 'bg-amber-400'} animate-pulse"></span>
            <p class="text-base font-bold text-slate-900">{opayApiKey ? 'OPayBD Active' : 'Key Missing'}</p>
          </div>
          <p class="text-[11px] text-slate-500">{opayApiKey ? 'Ready for real-time checkout' : 'Add API Key below to activate'}</p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active AI Engines</p>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <p class="text-base font-bold text-slate-900">{activeModelsCount} of {MODELS_CATALOG.length} Models Online</p>
          </div>
          <p class="text-[11px] text-slate-500">Toggle individual models below</p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Platform Master Key</p>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full {geminiApiKey || openaiApiKey ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
            <p class="text-base font-bold text-slate-900">{geminiApiKey ? 'Gemini 2.0 Synced' : openaiApiKey ? 'OpenAI Synced' : 'Not Configured'}</p>
          </div>
          <p class="text-[11px] text-slate-500">Powers All-Inclusive Managed Cloud plan</p>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 1: OPAYBD PAYMENT GATEWAY CONFIGURATION -->
      <!-- ======================================================== -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon name="Receipt" size={20} class="text-blue-600" />
              <span>OPayBD Real-Time Payment Gateway</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Enables live bKash, Nagad, Rocket, and card payments. Subscriptions activate instantly when verified.
            </p>
          </div>
          <div class="px-3 py-1 rounded-xl {opayApiKey ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border text-xs font-bold flex items-center gap-1.5 shrink-0">
            <span class="w-2 h-2 rounded-full {opayApiKey ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
            <span>{opayApiKey ? 'Gateway Configured' : 'Missing API Key'}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- OPAY API KEY -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="opay-api-key" class="text-xs font-bold text-slate-700">API Key (Required)</label>
              <button
                type="button"
                onclick={() => toggleShowKey('opayApiKey')}
                class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                {showKeyMap['opayApiKey'] ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="opay-api-key"
              type={showKeyMap['opayApiKey'] ? 'text' : 'password'}
              bind:value={opayApiKey}
              placeholder="e.g. OPAY_API_KEY_LIVE_..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <!-- OPAY SECRET KEY -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="opay-secret-key" class="text-xs font-bold text-slate-700">Secret Key (Optional)</label>
              <button
                type="button"
                onclick={() => toggleShowKey('opaySecretKey')}
                class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                {showKeyMap['opaySecretKey'] ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="opay-secret-key"
              type={showKeyMap['opaySecretKey'] ? 'text' : 'password'}
              bind:value={opaySecretKey}
              placeholder="e.g. OPAY_SECRET_KEY_..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <!-- OPAY BRAND KEY -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="opay-brand-key" class="text-xs font-bold text-slate-700">Brand Key (Optional)</label>
              <button
                type="button"
                onclick={() => toggleShowKey('opayBrandKey')}
                class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                {showKeyMap['opayBrandKey'] ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="opay-brand-key"
              type={showKeyMap['opayBrandKey'] ? 'text' : 'password'}
              bind:value={opayBrandKey}
              placeholder="e.g. OPAY_BRAND_KEY_..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 2: AI MODEL MASTER API KEYS -->
      <!-- ======================================================== -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Icon name="Key" size={20} class="text-blue-600" />
            <span>AI Platform Master API Keys</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Configure your platform master keys to power managed subscriptions and executive operations.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- 1. Google Gemini -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Icon name="Sparkles" size={14} class="text-blue-600" />
                <span>Google Gemini API</span>
              </span>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" class="text-[11px] text-blue-600 hover:underline">Get key →</a>
            </div>
            <input
              type={showKeyMap['geminiApiKey'] ? 'text' : 'password'}
              bind:value={geminiApiKey}
              placeholder="AIzaSy..."
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
            />
            <p class="text-[10px] text-slate-500">Gemini 2.0 Flash & Gemini 1.5 Pro</p>
          </div>

          <!-- 2. OpenAI -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Icon name="Bot" size={14} class="text-emerald-600" />
                <span>OpenAI API</span>
              </span>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" class="text-[11px] text-blue-600 hover:underline">Get key →</a>
            </div>
            <input
              type={showKeyMap['openaiApiKey'] ? 'text' : 'password'}
              bind:value={openaiApiKey}
              placeholder="sk-proj-..."
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
            />
            <p class="text-[10px] text-slate-500">GPT-4o & GPT-4o Mini</p>
          </div>

          <!-- 3. xAI Grok -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Icon name="Zap" size={14} class="text-amber-500" />
                <span>xAI Grok API</span>
              </span>
              <a href="https://console.x.ai/" target="_blank" rel="noreferrer" class="text-[11px] text-blue-600 hover:underline">Get key →</a>
            </div>
            <input
              type={showKeyMap['grokApiKey'] ? 'text' : 'password'}
              bind:value={grokApiKey}
              placeholder="xai-..."
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
            />
            <p class="text-[10px] text-slate-500">Grok-3 & Grok-2</p>
          </div>

          <!-- 4. DeepSeek -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Icon name="Terminal" size={14} class="text-sky-600" />
                <span>DeepSeek API</span>
              </span>
              <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer" class="text-[11px] text-blue-600 hover:underline">Get key →</a>
            </div>
            <input
              type={showKeyMap['deepseekApiKey'] ? 'text' : 'password'}
              bind:value={deepseekApiKey}
              placeholder="sk-..."
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
            />
            <p class="text-[10px] text-slate-500">DeepSeek-V3 Chat & Reasoner</p>
          </div>

          <!-- 5. OpenRouter (Claude) -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Icon name="Layers" size={14} class="text-purple-600" />
                <span>OpenRouter (Claude)</span>
              </span>
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" class="text-[11px] text-blue-600 hover:underline">Get key →</a>
            </div>
            <input
              type={showKeyMap['openrouterApiKey'] ? 'text' : 'password'}
              bind:value={openrouterApiKey}
              placeholder="sk-or-v1-..."
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
            />
            <p class="text-[10px] text-slate-500">Claude 3.5 Sonnet & Llama 3</p>
          </div>

          <!-- 6. Replicate (Images) -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Icon name="Image" size={14} class="text-pink-600" />
                <span>Replicate (Flux AI)</span>
              </span>
              <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noreferrer" class="text-[11px] text-blue-600 hover:underline">Get key →</a>
            </div>
            <input
              type={showKeyMap['replicateApiKey'] ? 'text' : 'password'}
              bind:value={replicateApiKey}
              placeholder="r8_..."
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
            />
            <p class="text-[10px] text-slate-500">Flux Schnell Image Engine</p>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 3: AI MODEL ON/OFF TOGGLES -->
      <!-- ======================================================== -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon name="ToggleRight" size={20} class="text-blue-600" />
              <span>AI Engine Models Manager (Live ON / OFF Toggles)</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Turn individual AI models on or off across the platform. Disabled models cannot be invoked by users.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={() => {
                for (const m of MODELS_CATALOG) modelsEnabled[m.id] = true;
              }}
              class="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Enable All
            </button>
            <button
              type="button"
              onclick={() => {
                for (const m of MODELS_CATALOG) modelsEnabled[m.id] = false;
              }}
              class="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Disable All
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {#each MODELS_CATALOG as model}
            <div class="p-4 rounded-2xl border transition-all duration-200 {modelsEnabled[model.id] ? 'bg-white border-blue-200 shadow-xs' : 'bg-slate-50/70 border-slate-200 opacity-60'} flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{model.provider}</span>
                  <span class="px-2 py-0.5 rounded text-[9px] font-bold {modelsEnabled[model.id] ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
                    {modelsEnabled[model.id] ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 mt-1">{model.name}</h3>
                <p class="text-[11px] text-blue-600 font-semibold">{model.tag}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Latency: {model.latency}</p>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs font-semibold {modelsEnabled[model.id] ? 'text-slate-700' : 'text-slate-400'}">
                  {modelsEnabled[model.id] ? 'Active' : 'Disabled'}
                </span>

                <button
                  type="button"
                  onclick={() => (modelsEnabled[model.id] = !modelsEnabled[model.id])}
                  class="relative w-12 h-6.5 rounded-full transition-colors duration-200 cursor-pointer {modelsEnabled[model.id] ? 'bg-blue-600' : 'bg-slate-300'}"
                  aria-label="Toggle model"
                >
                  <span
                    class="absolute top-1 transition-all duration-200 w-4.5 h-4.5 rounded-full bg-white shadow-sm {modelsEnabled[model.id] ? 'left-6.5' : 'left-1'}"
                  ></span>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 4: TRANSACTIONAL EMAIL & SMTP (6-DIGIT OTP) -->
      <!-- ======================================================== -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Icon name="Mail" size={20} class="text-blue-600" />
                <span>Transactional Email & SMTP (6-Digit OTP Delivery)</span>
              </h2>
              {#if hasSmtp}
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Live SMTP Active
                </span>
              {:else}
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                  Simulated Dev Mode
                </span>
              {/if}
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Configure your email server to deliver real 6-digit verification codes to user inboxes for Sign Up & Password Reset.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- SMTP Form Inputs (2 Cols) -->
          <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Host -->
            <div>
              <label for="smtp-host" class="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
              <input
                id="smtp-host"
                type="text"
                bind:value={smtpHost}
                placeholder="smtp.gmail.com or smtp.hostinger.com"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
              />
              <p class="text-[10px] text-slate-400 mt-1">e.g. smtp.gmail.com, smtp.resend.com</p>
            </div>

            <!-- Port -->
            <div>
              <label for="smtp-port" class="block text-xs font-bold text-slate-700 mb-1">SMTP Port</label>
              <input
                id="smtp-port"
                type="number"
                bind:value={smtpPort}
                placeholder="587"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
              />
              <p class="text-[10px] text-slate-400 mt-1">Usually 587 (STARTTLS) or 465 (SSL)</p>
            </div>

            <!-- User -->
            <div>
              <label for="smtp-user" class="block text-xs font-bold text-slate-700 mb-1">SMTP Username / Email</label>
              <input
                id="smtp-user"
                type="text"
                bind:value={smtpUser}
                placeholder="you@domain.com or your-gmail@gmail.com"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>

            <!-- Pass -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="smtp-pass" class="text-xs font-bold text-slate-700">SMTP Password / App Password</label>
                <button
                  type="button"
                  onclick={() => toggleShowKey('smtpPass')}
                  class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  {showKeyMap['smtpPass'] ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="smtp-pass"
                type={showKeyMap['smtpPass'] ? 'text' : 'password'}
                bind:value={smtpPass}
                placeholder="App Password or SMTP token"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>

            <!-- From -->
            <div class="sm:col-span-2">
              <label for="smtp-from" class="block text-xs font-bold text-slate-700 mb-1">Sender "From" Address</label>
              <input
                id="smtp-from"
                type="text"
                bind:value={smtpFrom}
                placeholder="EzboAgents &lt;noreply@ezboagents.com&gt;"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          <!-- Test & Guide Column (1 Col) -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Icon name="Send" size={14} class="text-blue-600" />
                <span>Test Live 6-Digit OTP Delivery</span>
              </h3>
              <p class="text-[11px] text-slate-500 leading-relaxed mb-3">
                Send a real 6-digit verification code email right now to confirm your SMTP configuration.
              </p>

              <div class="space-y-2">
                <input
                  type="email"
                  bind:value={testEmailTo}
                  placeholder="your-personal@email.com"
                  class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />

                <button
                  type="button"
                  onclick={sendTestEmail}
                  disabled={isSendingTestEmail}
                  class="w-full py-2.5 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {#if isSendingTestEmail}
                    <Icon name="Loader2" size={14} class="animate-spin" />
                    <span>Dispatching test email...</span>
                  {:else}
                    <Icon name="Mail" size={14} />
                    <span>Send Test OTP Email</span>
                  {/if}
                </button>
              </div>

              {#if testEmailFeedback}
                <div class="mt-2.5 p-2.5 rounded-xl text-[11px] leading-relaxed {testEmailFeedback.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
                  {testEmailFeedback}
                </div>
              {/if}
            </div>

            <div class="pt-3 border-t border-slate-200/70 text-[10px] text-slate-400 space-y-1">
              <p class="font-semibold text-slate-600">💡 Gmail Quick Tip:</p>
              <p>Turn on 2-Step Verification in Google Account ➔ Search "App Passwords" ➔ Create a 16-letter App Password and paste it here.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- BOTTOM SAVE ACTION BAR -->
      <!-- ======================================================== -->
      <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900">Commit & Deploy Platform Configuration</h3>
          <p class="text-xs text-slate-500">Updates live instantly across all user sessions and API routes.</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick={loadSettings}
            disabled={isLoading || isSaving}
            class="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Reset Changes
          </button>

          <button
            type="button"
            onclick={saveSettings}
            disabled={isSaving}
            class="px-6 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {#if isSaving}
              <Icon name="Loader2" size={15} class="animate-spin" />
              <span>Saving Changes...</span>
            {:else}
              <Icon name="Save" size={15} />
              <span>Save & Apply Settings</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
