<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { onMount } from 'svelte';
  import { DEFAULT_PLANS, type PlansSettings, type PlanConfig } from '$lib/config/plans';

  type AdminTab = 'overview' | 'plans' | 'payment' | 'ai-keys' | 'models' | 'smtp' | 'telegram' | 'security';

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
    opayEndpointUrl?: string;
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
    telegramBotToken?: string;
    telegramBotUsername?: string;
    hasTelegramBot?: boolean;
    plans?: PlansSettings;
  }

  // Navigation State
  let activeAdminTab = $state<AdminTab>('overview');
  let mobileSidebarOpen = $state(false);

  // Passphrase gate
  let authSecret = $state('ezbo-admin-2026');
  let newPassphrase = $state('');
  let passphraseUpdateMsg = $state('');
  let isAuthenticated = $state(false);
  let authError = $state('');

  // Form state - Plans & Pricing
  let editablePlans = $state<PlansSettings>(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
  let activePlanTab = $state<'byok' | 'managed'>('byok');
  let newFeatureText = $state('');
  let previewBillingInterval = $state<'monthly' | 'yearly'>('monthly');

  // Form state - Payment
  let opayApiKey = $state('');
  let opaySecretKey = $state('');
  let opayBrandKey = $state('');
  let opayEndpointUrl = $state('http://verify.opaybd.com/api/payment/create');
  let showAdvancedPayment = $state(false);

  // Form state - AI Keys
  let geminiApiKey = $state('');
  let openaiApiKey = $state('');
  let grokApiKey = $state('');
  let deepseekApiKey = $state('');
  let openrouterApiKey = $state('');
  let replicateApiKey = $state('');

  // Form state - SMTP
  let smtpHost = $state('');
  let smtpPort = $state(587);
  let smtpUser = $state('');
  let smtpPass = $state('');
  let smtpFrom = $state('EzboAgents <noreply@ezboagents.com>');
  let hasSmtp = $state(false);
  let testEmailTo = $state('');
  let isSendingTestEmail = $state(false);
  let testEmailFeedback = $state('');

  // Form state - Telegram
  let telegramBotToken = $state('');
  let telegramBotUsername = $state('EzboAgentsBot');
  let hasTelegramBot = $state(false);
  let isTestingTelegram = $state(false);
  let telegramFeedback = $state('');
  let isRegisteringWebhook = $state(false);
  let webhookFeedback = $state('');

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

  const ADMIN_NAV: { id: AdminTab; label: string; icon: string; badge: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'Grid', badge: 'Live' },
    { id: 'plans', label: 'Plans & Pricing', icon: 'Receipt', badge: 'Editable' },
    { id: 'payment', label: 'Payment Gateway', icon: 'CreditCard', badge: 'OPayBD' },
    { id: 'ai-keys', label: 'AI Engines Vault', icon: 'Key', badge: '6 Providers' },
    { id: 'models', label: 'Model Toggles', icon: 'Bot', badge: '8 Models' },
    { id: 'smtp', label: 'SMTP & Email OTP', icon: 'Mail', badge: '6-Digit' },
    { id: 'telegram', label: 'Telegram Bot', icon: 'Send', badge: 'Channel 2' },
    { id: 'security', label: 'Security & System', icon: 'Shield', badge: '.env' }
  ];

  function toggleShowKey(keyName: string) {
    showKeyMap[keyName] = !showKeyMap[keyName];
  }

  function handleAuthSubmit() {
    if (!authSecret.trim()) {
      authError = 'Please enter the admin passphrase.';
      return;
    }
    authError = '';
    loadSettings();
  }

  async function loadSettings() {
    isLoading = true;
    authError = '';
    const secretToUse = authSecret.trim() || 'ezbo-admin-2026';
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: secretToUse,
          patch: {}
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        const s: PublicSettings = data.settings;
        opayApiKey = s.opayApiKey || '';
        opaySecretKey = s.opaySecretKey || '';
        opayBrandKey = s.opayBrandKey || '';
        opayEndpointUrl = s.opayEndpointUrl || 'http://verify.opaybd.com/api/payment/create';
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
        telegramBotToken = s.telegramBotToken || '';
        telegramBotUsername = s.telegramBotUsername || 'EzboAgentsBot';
        hasTelegramBot = !!s.hasTelegramBot;
        if (s.modelsEnabled) {
          modelsEnabled = { ...s.modelsEnabled };
        }
        if (s.plans) {
          editablePlans = JSON.parse(JSON.stringify(s.plans));
        }
        isAuthenticated = true;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ezbo_admin_authed', 'true');
          sessionStorage.setItem('ezbo_admin_secret', secretToUse);
        }
      } else {
        authError = data.error || 'Failed to authenticate admin session.';
        isAuthenticated = false;
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('ezbo_admin_authed');
        }
      }
    } catch (e: any) {
      authError = e.message || 'Network connection failed.';
    } finally {
      isLoading = false;
    }
  }

  function addPlanFeature(planId: 'byok' | 'managed') {
    if (!newFeatureText.trim()) return;
    editablePlans[planId].features = [...editablePlans[planId].features, newFeatureText.trim()];
    newFeatureText = '';
  }

  function removePlanFeature(planId: 'byok' | 'managed', index: number) {
    editablePlans[planId].features = editablePlans[planId].features.filter((_, i) => i !== index);
  }

  function resetPlanDefaults(planId: 'byok' | 'managed') {
    editablePlans[planId] = JSON.parse(JSON.stringify(DEFAULT_PLANS[planId]));
  }

  async function saveSettings() {
    isSaving = true;
    saveFeedback = '';
    try {
      const patch: any = {
        opayApiKey,
        opaySecretKey,
        opayBrandKey,
        opayEndpointUrl,
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
        telegramBotToken,
        telegramBotUsername,
        modelsEnabled,
        plans: editablePlans
      };

      if (newPassphrase.trim()) {
        patch.adminPassphrase = newPassphrase.trim();
      }

      const secretToUse = authSecret.trim() || 'ezbo-admin-2026';

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: secretToUse,
          patch
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        saveFeedback = 'Admin configuration & AI models saved successfully in real-time.';
        saveFeedbackType = 'success';
        if (newPassphrase.trim()) {
          authSecret = newPassphrase.trim();
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('ezbo_admin_secret', authSecret);
          }
          newPassphrase = '';
          passphraseUpdateMsg = '✅ Master passphrase updated successfully!';
          setTimeout(() => { passphraseUpdateMsg = ''; }, 4000);
        }
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
          telegramBotToken = s.telegramBotToken || telegramBotToken;
          telegramBotUsername = s.telegramBotUsername || telegramBotUsername;
          hasTelegramBot = !!s.hasTelegramBot;
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
          testEmailFeedback = `Simulated Mode: Code ${data.debugCode} generated. Save real SMTP credentials to deliver live emails to inbox.`;
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

  async function testTelegramBot() {
    isTestingTelegram = true;
    telegramFeedback = '';
    try {
      const res = await fetch('/api/admin/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: authSecret.trim() || 'ezbo-admin-2026',
          action: 'test'
        })
      });

      const data = await res.json();
      if (data.success) {
        telegramFeedback = `✅ ${data.message}`;
      } else {
        telegramFeedback = `❌ Ping Failed: ${data.error}`;
      }
    } catch (e: any) {
      telegramFeedback = `❌ Error: ${e.message}`;
    } finally {
      isTestingTelegram = false;
    }
  }

  async function registerTelegramWebhook() {
    isRegisteringWebhook = true;
    webhookFeedback = '';
    try {
      const res = await fetch('/api/admin/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: authSecret.trim() || 'ezbo-admin-2026',
          action: 'set'
        })
      });

      const data = await res.json();
      if (data.success) {
        webhookFeedback = `✅ ${data.message}`;
      } else {
        webhookFeedback = `❌ Registration Failed: ${data.error}`;
      }
    } catch (e: any) {
      webhookFeedback = `❌ Error: ${e.message}`;
    } finally {
      isRegisteringWebhook = false;
    }
  }

  function copyVercelEnv() {
    const lines: string[] = [];
    if (opayApiKey && !opayApiKey.includes('••••')) lines.push(`OPAY_API_KEY=${opayApiKey}`);
    if (opaySecretKey && !opaySecretKey.includes('••••')) lines.push(`OPAY_SECRET_KEY=${opaySecretKey}`);
    if (opayBrandKey && !opayBrandKey.includes('••••')) lines.push(`OPAY_BRAND_KEY=${opayBrandKey}`);
    if (opayEndpointUrl) lines.push(`OPAY_ENDPOINT_URL=${opayEndpointUrl}`);
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
    if (telegramBotToken && !telegramBotToken.includes('••••')) lines.push(`TELEGRAM_BOT_TOKEN=${telegramBotToken}`);
    if (telegramBotUsername) lines.push(`TELEGRAM_BOT_USERNAME=${telegramBotUsername}`);
    lines.push(`ADMIN_SECRET=${newPassphrase.trim() || authSecret.trim() || 'ezbo-admin-2026'}`);

    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    copyFeedback = 'Copied .env format to clipboard for Vercel!';
    setTimeout(() => (copyFeedback = ''), 4000);
  }

  function handleLogout() {
    isAuthenticated = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ezbo_admin_authed');
      sessionStorage.removeItem('ezbo_admin_secret');
    }
  }

  function enableAllModels() {
    MODELS_CATALOG.forEach(m => {
      modelsEnabled[m.id] = true;
    });
  }

  function disableAllModels() {
    MODELS_CATALOG.forEach(m => {
      modelsEnabled[m.id] = false;
    });
  }

  const activeModelsCount = $derived(
    Object.values(modelsEnabled).filter(Boolean).length
  );

  const configuredKeysCount = $derived(
    [geminiApiKey, openaiApiKey, grokApiKey, deepseekApiKey, openrouterApiKey, replicateApiKey].filter(Boolean).length
  );

  onMount(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('ezbo_admin_authed');
      const storedSecret = sessionStorage.getItem('ezbo_admin_secret');
      if (storedSecret) authSecret = storedSecret;
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
          <p class="text-xs text-slate-500">Master Platform Operations &amp; Intelligence Control Hub</p>
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
              bind:value={authSecret}
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
    <!-- MASTER ADMIN CONSOLE WITH SIDEBAR LAYOUT -->
    <!-- ======================================================== -->
    <div class="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc]">
      
      <!-- MOBILE TOPBAR -->
      <div class="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Icon name="Shield" size={16} />
          </div>
          <span class="font-black text-slate-900 text-sm">Ezbo<span class="text-blue-600">Agents</span> Admin</span>
        </div>
        <button
          type="button"
          onclick={() => mobileSidebarOpen = !mobileSidebarOpen}
          class="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Icon name={mobileSidebarOpen ? 'X' : 'AlignLeft'} size={18} />
        </button>
      </div>

      <!-- SIDEBAR (DESKTOP & MOBILE DRAWER) -->
      <aside class="
        fixed lg:sticky top-0 inset-y-0 left-0 z-50
        w-64 sm:w-72 bg-white border-r border-slate-200 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        {mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        h-screen shrink-0
      ">
        <div class="p-5 flex flex-col h-full overflow-y-auto">
          <!-- Logo & Brand -->
          <div class="flex items-center justify-between pb-5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20">
                <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Icon name="Shield" class="text-blue-600" size={20} />
                </div>
              </div>
              <div>
                <h1 class="text-sm font-black text-slate-900 tracking-tight">Ezbo<span class="text-blue-600">Agents</span></h1>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Ops</span>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onclick={() => mobileSidebarOpen = false}
              class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          <!-- Navigation Links -->
          <div class="py-5 space-y-1.5 flex-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Management Modules</p>
            {#each ADMIN_NAV as nav}
              <button
                type="button"
                onclick={() => { activeAdminTab = nav.id; mobileSidebarOpen = false; }}
                class="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group {activeAdminTab === nav.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <Icon name={nav.icon} size={17} class={activeAdminTab === nav.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
                  <span class="truncate">{nav.label}</span>
                </div>
                <span class="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-tight uppercase shrink-0 {activeAdminTab === nav.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200/60 group-hover:bg-blue-50 group-hover:text-blue-700'}">
                  {nav.badge}
                </span>
              </button>
            {/each}
          </div>

          <!-- Bottom Session & Quick Links -->
          <div class="pt-4 border-t border-slate-100 space-y-3">
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated Session</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p class="text-xs font-mono font-bold text-slate-700 truncate">{authSecret}</p>
            </div>

            <div class="flex items-center gap-2">
              <a
                href="/dashboard"
                class="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="Layout" size={13} />
                <span>App Dashboard</span>
              </a>
              <button
                type="button"
                onclick={handleLogout}
                class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                title="Logout from Admin"
              >
                <Icon name="LogOut" size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- BACKDROP FOR MOBILE DRAWER -->
      {#if mobileSidebarOpen}
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onclick={() => mobileSidebarOpen = false}
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        ></button>
      {/if}

      <!-- MAIN CONTENT VIEWPORT -->
      <main class="flex-1 flex flex-col min-w-0">
        
        <!-- TOP STICKY HEADER -->
        <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5">
              <h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {#if activeAdminTab === 'overview'}Overview Dashboard
                {:else if activeAdminTab === 'payment'}OPayBD Payment Gateway
                {:else if activeAdminTab === 'ai-keys'}AI Engines Vault
                {:else if activeAdminTab === 'models'}AI Models Roster
                {:else if activeAdminTab === 'smtp'}SMTP &amp; Email OTP
                {:else if activeAdminTab === 'telegram'}Telegram Bot &amp; Webhook
                {:else if activeAdminTab === 'security'}Security &amp; System Configuration
                {/if}
              </h2>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Operational</span>
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5 hidden sm:block">
              EzboAgents Central Executive Infrastructure &bull; Live Production Cluster
            </p>
          </div>

          <!-- Quick Top Actions -->
          <div class="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onclick={copyVercelEnv}
              class="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Copy Vercel .env format"
            >
              <Icon name="Copy" size={13} />
              <span class="hidden md:inline">Export</span> <span>.env</span>
            </button>

            <button
              type="button"
              onclick={saveSettings}
              disabled={isSaving}
              class="px-5 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {#if isSaving}
                <Icon name="Loader2" size={14} class="animate-spin" />
                <span>Saving...</span>
              {:else}
                <Icon name="Save" size={14} />
                <span>Save Changes</span>
              {/if}
            </button>
          </div>
        </header>

        <!-- SAVE FEEDBACK NOTIFICATION BANNER -->
        {#if saveFeedback}
          <div class="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm {saveFeedbackType === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}">
            <Icon name={saveFeedbackType === 'success' ? 'Check' : 'AlertCircle'} size={16} />
            <span>{saveFeedback}</span>
          </div>
        {/if}

        {#if copyFeedback}
          <div class="mx-4 sm:mx-8 mt-4 p-3.5 rounded-2xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2 shadow-sm">
            <Icon name="Check" size={16} />
            <span>{copyFeedback}</span>
          </div>
        {/if}

        <!-- TAB BODY CONTENT -->
        <div class="p-4 sm:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          
          <!-- ======================================================== -->
          <!-- 1. OVERVIEW TAB -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'overview'}
            <div class="space-y-6 animate-in fade-in duration-200">
              
              <!-- Hero Operations Card -->
              <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-xl border border-blue-800/40">
                <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div class="space-y-2 max-w-2xl">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-blue-200 border border-white/10">
                      <Icon name="Sparkles" size={13} class="text-amber-400" />
                      <span>Executive Command &bull; Central Router v2.4</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Platform Operations Overview
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Unified dashboard for live payment settlements, multi-engine AI models, transactional email OTP delivery, and omni-channel synchronization.
                    </p>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onclick={() => activeAdminTab = 'ai-keys'}
                      class="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 cursor-pointer"
                    >
                      <Icon name="Key" size={14} class="text-blue-600" />
                      <span>Manage AI Keys</span>
                    </button>
                    <button
                      type="button"
                      onclick={() => activeAdminTab = 'payment'}
                      class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icon name="CreditCard" size={14} />
                      <span>Configure OPay</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Top KPI Metric Cards (5 Cards) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <!-- Plans & Pricing KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'plans'}
                  class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                      <Icon name="Receipt" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                      2 Tiers Live
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 font-medium">Pricing Plans</p>
                  <h3 class="text-base font-extrabold text-slate-900 mt-0.5 truncate">
                    ৳{editablePlans.byok.monthlyPrice} / ৳{editablePlans.managed.monthlyPrice}
                  </h3>
                  <p class="text-[11px] text-slate-400 mt-1">Click to Edit Price &amp; Details</p>
                </button>

                <!-- Payment Gateway KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'payment'}
                  class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                      <Icon name="CreditCard" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {opayApiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                      {opayApiKey ? 'Connected' : 'Action Needed'}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 font-medium">Payment Gateway</p>
                  <h3 class="text-base font-extrabold text-slate-900 mt-0.5 truncate">
                    {opayApiKey ? 'OPayBD Active' : 'Setup Required'}
                  </h3>
                  <p class="text-[11px] text-slate-400 mt-1">bKash, Nagad, Rocket Real-Time</p>
                </button>

                <!-- AI Engines Vault KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'ai-keys'}
                  class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                      <Icon name="Key" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {configuredKeysCount} / 6 Ready
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 font-medium">Master Engine Vault</p>
                  <h3 class="text-base font-extrabold text-slate-900 mt-0.5 truncate">
                    {geminiApiKey ? 'Gemini 2.0 Primed' : 'Platform Key Missing'}
                  </h3>
                  <p class="text-[11px] text-slate-400 mt-1">ChatGPT, Grok, DeepSeek</p>
                </button>

                <!-- Model Toggles KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'models'}
                  class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                      <Icon name="Bot" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activeModelsCount} / {MODELS_CATALOG.length} Online
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 font-medium">AI Models Roster</p>
                  <h3 class="text-base font-extrabold text-slate-900 mt-0.5 truncate">
                    {activeModelsCount === MODELS_CATALOG.length ? '100% Available' : `${activeModelsCount} Models Enabled`}
                  </h3>
                  <p class="text-[11px] text-slate-400 mt-1">Latency Avg ~650ms</p>
                </button>

                <!-- Channels KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'telegram'}
                  class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
                      <Icon name="Send" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {hasTelegramBot || telegramBotToken ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                      {hasTelegramBot || telegramBotToken ? 'Live Bot' : 'Pending'}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 font-medium">Omni-Channel Sync</p>
                  <h3 class="text-base font-extrabold text-slate-900 mt-0.5 truncate">
                    Telegram &amp; WhatsApp
                  </h3>
                  <p class="text-[11px] text-slate-400 mt-1">@{telegramBotUsername || 'EzboAgentsBot'}</p>
                </button>
              </div>

              <!-- Core Services Health Matrix (4 Interactive Cards) -->
              <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Icon name="Layers" size={18} class="text-blue-600" />
                      <span>Core Services &amp; Infrastructure Matrix</span>
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">Real-time telemetry and subsystem operational readiness.</p>
                  </div>
                  <span class="text-xs font-mono text-slate-400">Node 24 LTS &bull; Edge Vercel</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Service 1: Payment Settlement -->
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {opayApiKey ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                        <h4 class="text-xs font-bold text-slate-900">OPayBD Payment Settlements</h4>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-relaxed">
                        Automatic webhook verification for bKash, Nagad, and Rocket checkouts. Direct instant tier provisioning.
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'payment'}
                        class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Configure Gateway</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>

                  <!-- Service 2: Multi-Model AI Routing -->
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {geminiApiKey ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                        <h4 class="text-xs font-bold text-slate-900">Multi-Model AI Orchestrator</h4>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-relaxed">
                        Universal router supporting BYOK vault decryption and platform fallback across Google, OpenAI, xAI and DeepSeek.
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'ai-keys'}
                        class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Manage Vault Keys</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>

                  <!-- Service 3: Transactional 6-Digit Email OTP -->
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {hasSmtp ? 'bg-emerald-500' : 'bg-blue-500'}"></span>
                        <h4 class="text-xs font-bold text-slate-900">Transactional 6-Digit Email OTP</h4>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-relaxed">
                        {hasSmtp ? 'Live SMTP relay configured with branded HTML template.' : 'Sandbox mode active. Logs codes to console for rapid development.'}
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'smtp'}
                        class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Test Email Dispatch</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>

                  <!-- Service 4: Telegram Official Bot -->
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {hasTelegramBot || telegramBotToken ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                        <h4 class="text-xs font-bold text-slate-900">Telegram Bot &amp; Webhook Hub</h4>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-relaxed">
                        24/7 client assistant for instant chat, slash commands (/status, /agents), and image generation (/image).
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'telegram'}
                        class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Manage Telegram</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Command Action Shortcuts -->
              <div class="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-sm">
                <div>
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider text-slate-400">Quick Operations Shortcuts</h3>
                  <p class="text-xs text-slate-400 mt-0.5">One-click operational tasks for rapid testing and deployment.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onclick={() => activeAdminTab = 'smtp'}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="Mail" size={16} class="text-amber-400 mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Send Test OTP</h4>
                    <p class="text-[10px] text-slate-400">Dispatch 6-digit test email</p>
                  </button>

                  <button
                    type="button"
                    onclick={() => activeAdminTab = 'telegram'}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="Send" size={16} class="text-sky-400 mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Ping Telegram</h4>
                    <p class="text-[10px] text-slate-400">Check @{telegramBotUsername} ping</p>
                  </button>

                  <button
                    type="button"
                    onclick={enableAllModels}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="Bot" size={16} class="text-emerald-400 mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Enable All Models</h4>
                    <p class="text-[10px] text-slate-400">Turn on all 8 engines</p>
                  </button>

                  <button
                    type="button"
                    onclick={copyVercelEnv}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="Copy" size={16} class="text-blue-400 mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Export .env</h4>
                    <p class="text-[10px] text-slate-400">Copy keys for Vercel deployment</p>
                  </button>
                </div>
              </div>

            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 1b. PLANS & PRICING TAB -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'plans'}
            <div class="space-y-6 animate-in fade-in duration-200">
              <!-- Header Card -->
              <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                    <Icon name="Receipt" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase">Pricing System</span>
                      <h2 class="text-base font-bold text-slate-900">Subscription Plans &amp; Details Manager</h2>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      প্ল্যানের মূল্য, বিবরণ এবং ফিচারের তালিকা এডমিন প্যানেল থেকে সরাসরি পরিবর্তন করুন। হোমপেজ ও ড্যাশবোর্ডে সাথে সাথে কার্যকর হবে।
                    </p>
                  </div>
                </div>

                <!-- Plan Switcher Pills -->
                <div class="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onclick={() => activePlanTab = 'byok'}
                    class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {activePlanTab === 'byok' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
                  >
                    <span>BYOK Multi-Engine</span>
                  </button>
                  <button
                    type="button"
                    onclick={() => activePlanTab = 'managed'}
                    class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {activePlanTab === 'managed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
                  >
                    <span>All-Inclusive Cloud</span>
                  </button>
                </div>
              </div>

              <!-- Main Editor & Live Preview Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <!-- Left: Plan Form Editor (7 Columns) -->
                <div class="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full {activePlanTab === 'byok' ? 'bg-slate-700' : 'bg-blue-600'}"></span>
                      <h3 class="text-sm font-bold text-slate-900">
                        Editing: <span class="text-blue-600 font-extrabold">{editablePlans[activePlanTab].name}</span>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onclick={() => resetPlanDefaults(activePlanTab)}
                      class="text-xs text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      title="Reset this plan to factory defaults"
                    >
                      <Icon name="RefreshCw" size={12} />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  <!-- General Info Group -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Plan Identifiers</h4>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <!-- Plan Name -->
                      <div class="space-y-1.5">
                        <label for="plan-name" class="text-xs font-bold text-slate-700">Plan Display Name</label>
                        <input
                          id="plan-name"
                          type="text"
                          bind:value={editablePlans[activePlanTab].name}
                          placeholder="e.g. BYOK Multi-Engine"
                          class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs font-semibold text-slate-900 outline-none"
                        />
                      </div>

                      <!-- Plan Badge -->
                      <div class="space-y-1.5">
                        <label for="plan-badge" class="text-xs font-bold text-slate-700">Category Tag / Badge</label>
                        <input
                          id="plan-badge"
                          type="text"
                          bind:value={editablePlans[activePlanTab].badge}
                          placeholder="e.g. Bring Your Own Key"
                          class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <!-- Highlight Ribbon (Optional) -->
                    <div class="space-y-1.5">
                      <label for="plan-ribbon" class="text-xs font-bold text-slate-700">
                        Promotional Top Ribbon <span class="text-slate-400 font-normal text-[11px]">(Optional — e.g. "⚡ Zero Setup • Most Popular")</span>
                      </label>
                      <input
                        id="plan-ribbon"
                        type="text"
                        bind:value={editablePlans[activePlanTab].highlightBadge}
                        placeholder="Leave blank for standard card"
                        class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs text-slate-900 outline-none"
                      />
                    </div>

                    <!-- Description -->
                    <div class="space-y-1.5">
                      <label for="plan-desc" class="text-xs font-bold text-slate-700">Plan Description / Pitch</label>
                      <textarea
                        id="plan-desc"
                        rows="2"
                        bind:value={editablePlans[activePlanTab].description}
                        placeholder="Short compelling description of who this plan is for..."
                        class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs text-slate-900 outline-none resize-none leading-relaxed"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Pricing Structure Group (BDT) -->
                  <div class="space-y-4 pt-2 border-t border-slate-100">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">2. Pricing Rates (BDT ৳)</h4>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <!-- Monthly Price -->
                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label for="monthly-price" class="text-[11px] font-bold text-slate-700 block">Monthly Price (BDT)</label>
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-slate-400">৳</span>
                          <input
                            id="monthly-price"
                            type="number"
                            min="0"
                            bind:value={editablePlans[activePlanTab].monthlyPrice}
                            class="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                          />
                        </div>
                        <span class="text-[10px] text-slate-400 block">গ্রাহকের মাসিক বিল</span>
                      </div>

                      <!-- Yearly Monthly Equivalent -->
                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <label for="yearly-monthly" class="text-[11px] font-bold text-slate-700 block">Yearly Rate (/mo)</label>
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-slate-400">৳</span>
                          <input
                            id="yearly-monthly"
                            type="number"
                            min="0"
                            bind:value={editablePlans[activePlanTab].yearlyMonthlyPrice}
                            class="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                          />
                        </div>
                        <span class="text-[10px] text-slate-400 block">বাৎসরিকে প্রতি মাসের রেট</span>
                      </div>

                      <!-- Yearly Total Billed -->
                      <div class="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1.5">
                        <label for="yearly-total" class="text-[11px] font-bold text-blue-900 block">Yearly Total Billed</label>
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-blue-500">৳</span>
                          <input
                            id="yearly-total"
                            type="number"
                            min="0"
                            bind:value={editablePlans[activePlanTab].yearlyTotal}
                            class="w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-300 text-sm font-bold text-blue-900 outline-none focus:border-blue-600"
                          />
                        </div>
                        <span class="text-[10px] text-blue-600 block">চেকআউটে কাটা হবে</span>
                      </div>
                    </div>
                  </div>

                  <!-- Features List Group -->
                  <div class="space-y-4 pt-2 border-t border-slate-100">
                    <div class="flex items-center justify-between">
                      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">3. Features &amp; Bullet Points</h4>
                      <span class="text-[11px] font-semibold text-slate-500">{editablePlans[activePlanTab].features.length} features</span>
                    </div>

                    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {#each editablePlans[activePlanTab].features as feature, idx}
                        <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 group">
                          <span class="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            bind:value={editablePlans[activePlanTab].features[idx]}
                            class="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 text-xs text-slate-800 outline-none"
                          />
                          <button
                            type="button"
                            onclick={() => removePlanFeature(activePlanTab, idx)}
                            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove feature"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      {/each}
                    </div>

                    <!-- Add New Feature -->
                    <div class="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        bind:value={newFeatureText}
                        placeholder="Add new feature bullet point..."
                        onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPlanFeature(activePlanTab); } }}
                        class="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onclick={() => addPlanFeature(activePlanTab)}
                        disabled={!newFeatureText.trim()}
                        class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <Icon name="Plus" size={14} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <!-- Save Button Footer -->
                  <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onclick={saveSettings}
                      disabled={isSaving}
                      class="px-6 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {#if isSaving}
                        <Icon name="Loader2" size={14} class="animate-spin" />
                        <span>Saving Plans...</span>
                      {:else}
                        <Icon name="Save" size={14} />
                        <span>Save Plan Changes</span>
                      {/if}
                    </button>
                  </div>

                </div>

                <!-- Right: Live Customer Preview (5 Columns) -->
                <div class="lg:col-span-5 space-y-4">
                  <div class="flex items-center justify-between px-1">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Icon name="Eye" size={14} class="text-blue-600" />
                      <span>Live Customer View</span>
                    </span>

                    <!-- Preview Interval Toggle -->
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-semibold text-slate-500">Preview:</span>
                      <button
                        type="button"
                        onclick={() => previewBillingInterval = previewBillingInterval === 'monthly' ? 'yearly' : 'monthly'}
                        class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border cursor-pointer {previewBillingInterval === 'yearly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200'}"
                      >
                        {previewBillingInterval}
                      </button>
                    </div>
                  </div>

                  <!-- Mockup Card -->
                  <div class="rounded-3xl bg-white border-2 {editablePlans[activePlanTab].highlightBadge ? 'border-blue-600 shadow-xl shadow-blue-500/10' : 'border-slate-200 shadow-sm'} p-6 sm:p-7 relative transition-all">
                    {#if editablePlans[activePlanTab].highlightBadge}
                      <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                        {editablePlans[activePlanTab].highlightBadge}
                      </div>
                    {/if}

                    <div class="mb-4">
                      <span class="px-2.5 py-0.5 rounded-full {activePlanTab === 'managed' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'} text-[11px] font-bold">
                        {editablePlans[activePlanTab].badge}
                      </span>
                      <h4 class="text-xl font-extrabold text-slate-900 mt-2.5">
                        {editablePlans[activePlanTab].name}
                      </h4>
                      <div class="flex items-baseline gap-1 mt-1.5">
                        <span class="text-3xl font-black text-slate-900">
                          BDT {previewBillingInterval === 'yearly' ? editablePlans[activePlanTab].yearlyMonthlyPrice.toLocaleString() : editablePlans[activePlanTab].monthlyPrice.toLocaleString()}
                        </span>
                        <span class="text-xs font-medium text-slate-500">/mo</span>
                      </div>
                      {#if previewBillingInterval === 'yearly'}
                        <p class="text-[11px] text-slate-500 mt-0.5">
                          Billed annually (BDT {editablePlans[activePlanTab].yearlyTotal.toLocaleString()}/yr)
                        </p>
                      {/if}
                    </div>

                    <p class="text-xs text-slate-600 mb-5 leading-relaxed">
                      {editablePlans[activePlanTab].description}
                    </p>

                    <div class="space-y-2.5 border-t border-slate-100 pt-4">
                      {#each editablePlans[activePlanTab].features as feat}
                        <div class="flex items-start gap-2 text-xs text-slate-700">
                          <Icon name="Check" size={13} class="text-blue-600 shrink-0 mt-0.5" />
                          <span class="leading-tight">{feat}</span>
                        </div>
                      {/each}
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-100">
                      <div class="w-full py-3 rounded-xl {activePlanTab === 'managed' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-900 text-white'} font-bold text-xs text-center uppercase tracking-wider">
                        Subscribe with OPay
                      </div>
                    </div>
                  </div>

                  <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                    <p class="font-bold flex items-center gap-1.5">
                      <Icon name="Sparkles" size={14} class="text-amber-600" />
                      <span>রিয়েল-টাইম সিনক্রোনাইজেশন:</span>
                    </p>
                    <p class="text-[11px] text-amber-700 leading-relaxed">
                      "Save Plan Changes" বাটনে ক্লিক করার সাথে সাথে আপনার হোমপেজ, <code>/plans</code> পেজ এবং ইউজার ড্যাশবোর্ডের বিলিং সেকশনে নতুন মূল্য ও ফিচার স্বয়ংক্রিয়ভাবে কার্যকর হয়ে যাবে।
                    </p>
                  </div>

                </div>

              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 2. PAYMENT GATEWAY TAB (SECTION 1) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'payment'}
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <Icon name="CreditCard" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Section 1</span>
                      <h2 class="text-base font-bold text-slate-900">OPayBD Payment Gateway Configuration</h2>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Configure your production OPayBD Merchant API keys for live bKash, Nagad, Rocket, and Card payments.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold {opayApiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                    {opayApiKey ? '● Production Connected' : '○ Missing Credentials'}
                  </span>
                </div>
              </div>

              <!-- Primary Merchant API Key (The ONLY key needed for standard OPayBD!) -->
              <div class="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-emerald-500/[0.02] to-transparent border-2 border-emerald-500/30 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <label for="opay-api-key" class="text-sm font-bold text-slate-900">
                      Primary OPayBD API Key (একমাত্র প্রয়োজনীয় Key)
                    </label>
                  </div>
                  <button
                    type="button"
                    onclick={() => toggleShowKey('opayApiKey')}
                    class="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer text-left sm:text-right"
                  >
                    {showKeyMap['opayApiKey'] ? 'Hide Key' : 'Show Key'}
                  </button>
                </div>

                <div class="space-y-1.5">
                  <input
                    id="opay-api-key"
                    type={showKeyMap['opayApiKey'] ? 'text' : 'password'}
                    bind:value={opayApiKey}
                    placeholder="Enter your OPayBD Merchant API Key (e.g. 78a9c...)..."
                    class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-mono text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs"
                  />
                </div>

                <div class="p-3.5 rounded-xl bg-white border border-emerald-200/80 flex items-start gap-2.5 text-xs text-slate-700 shadow-xs">
                  <Icon name="CheckCircle2" size={17} class="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span class="font-bold text-emerald-950 block mb-0.5">OPayBD-তে শুধুমাত্র এই ১টি Key ব্যবহার করলেই যথেষ্ট!</span>
                    <p class="text-slate-600 leading-relaxed">
                      আপনার OPayBD মার্চেন্ট প্যানেল (<a href="http://verify.opaybd.com" target="_blank" rel="noreferrer" class="text-blue-600 underline font-semibold">verify.opaybd.com</a>) থেকে পাওয়া এই একটিমাত্র <strong>API Key</strong> সেভ করলেই bKash, Nagad, Rocket ও কার্ড পেমেন্ট সম্পূর্ণ সক্রিয় হয়ে যাবে।
                    </p>
                  </div>
                </div>
              </div>

              <!-- Optional / Advanced Settings Toggle -->
              <div class="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                <button
                  type="button"
                  onclick={() => showAdvancedPayment = !showAdvancedPayment}
                  class="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span class="flex items-center gap-2">
                    <Icon name="Sliders" size={14} class="text-slate-500" />
                    <span>Advanced / Optional Fields (ঐচ্ছিক — সাধারণ ব্যবহারে ফাঁকা রাখুন)</span>
                  </span>
                  <div class="flex items-center gap-1.5 text-slate-500">
                    <span class="text-[11px] font-normal">{showAdvancedPayment ? 'Hide' : 'Expand (Optional)'}</span>
                    <Icon name={showAdvancedPayment ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  </div>
                </button>

                {#if showAdvancedPayment || opaySecretKey || opayBrandKey}
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-200 animate-in fade-in duration-150">
                    <!-- Secret Key -->
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <label for="opay-secret-key" class="text-xs font-semibold text-slate-700">
                          OPAY_SECRET_KEY <span class="text-slate-400 font-normal text-[11px]">(Optional)</span>
                        </label>
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
                        placeholder="Leave blank if not provided by OPay"
                        class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                      />
                      <p class="text-[10px] text-slate-400">শুধুমাত্র বিশেষ HMAC প্যাকেজের জন্য। সাধারণ মার্চেন্টে এটি ফাঁকা থাকে।</p>
                    </div>

                    <!-- Brand Key -->
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <label for="opay-brand-key" class="text-xs font-semibold text-slate-700">
                          OPAY_BRAND_KEY <span class="text-slate-400 font-normal text-[11px]">(Optional)</span>
                        </label>
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
                        placeholder="Leave blank if not provided by OPay"
                        class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                      />
                      <p class="text-[10px] text-slate-400">কাস্টম চেকআউট ব্র্যান্ডিং আইডির জন্য (ঐচ্ছিক)।</p>
                    </div>

                    <!-- Custom API Endpoint URL -->
                    <div class="col-span-full space-y-1.5 pt-2 border-t border-slate-200/60">
                      <div class="flex items-center justify-between">
                        <label for="opay-endpoint-url" class="text-xs font-semibold text-slate-700">
                          OPAY_ENDPOINT_URL <span class="text-slate-400 font-normal text-[11px]">(Checkout API URL)</span>
                        </label>
                      </div>
                      <input
                        id="opay-endpoint-url"
                        type="text"
                        bind:value={opayEndpointUrl}
                        placeholder="http://verify.opaybd.com/api/payment/create"
                        class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                      />
                      <p class="text-[10px] text-slate-500">
                        ডিফল্ট: <code>http://verify.opaybd.com/api/payment/create</code>। OPayBD থেকে নতুন ডোমেন বা আপডেট পেলে এখানে সরাসরি পরিবর্তন করতে পারবেন।
                      </p>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Integration Documentation Card -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div class="font-bold text-slate-800 flex items-center gap-1.5">
                  <Icon name="Shield" size={14} class="text-emerald-600" />
                  <span>Real-time Callback &amp; Verification Endpoints</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-600">
                  <div class="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span class="font-bold text-slate-900 block mb-0.5">Payment Return URL:</span>
                    <code class="text-blue-700 font-mono">https://ezboagents.com/payment/callback</code>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span class="font-bold text-slate-900 block mb-0.5">Webhook Listener:</span>
                    <code class="text-blue-700 font-mono">https://ezboagents.com/api/payment/verify</code>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 3. AI KEYS VAULT TAB (SECTION 2) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'ai-keys'}
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Icon name="Key" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">Section 2</span>
                      <h2 class="text-base font-bold text-slate-900">AI Model Master API Keys (Cloud Tier)</h2>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      These platform keys power the <strong>All-Inclusive Cloud Plan (1,499 BDT/mo)</strong> where users don't have to provide keys.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {configuredKeysCount} of 6 Keys Configured
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Gemini Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between">
                    <label for="gemini-key" class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Google Gemini API</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('geminiApiKey')}
                      class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      {showKeyMap['geminiApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="gemini-key"
                    type={showKeyMap['geminiApiKey'] ? 'text' : 'password'}
                    bind:value={geminiApiKey}
                    placeholder="AIzaSy... (Gemini 2.0 Flash)"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Powers: Primary Chat &amp; Agents</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="text-blue-600 hover:underline">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- OpenAI Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between">
                    <label for="openai-key" class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>OpenAI (ChatGPT)</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('openaiApiKey')}
                      class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      {showKeyMap['openaiApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="openai-key"
                    type={showKeyMap['openaiApiKey'] ? 'text' : 'password'}
                    bind:value={openaiApiKey}
                    placeholder="sk-proj-... (GPT-4o &amp; Mini)"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Powers: GPT-4o Flagship</span>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" class="text-blue-600 hover:underline">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- Grok Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between">
                    <label for="grok-key" class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-slate-700"></span>
                      <span>xAI Grok API</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('grokApiKey')}
                      class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      {showKeyMap['grokApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="grok-key"
                    type={showKeyMap['grokApiKey'] ? 'text' : 'password'}
                    bind:value={grokApiKey}
                    placeholder="xai-... (Grok 3)"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Powers: Real-Time Intelligence</span>
                    <a href="https://console.x.ai" target="_blank" rel="noopener" class="text-blue-600 hover:underline">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- DeepSeek Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between">
                    <label for="deepseek-key" class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                      <span>DeepSeek Platform</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('deepseekApiKey')}
                      class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      {showKeyMap['deepseekApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="deepseek-key"
                    type={showKeyMap['deepseekApiKey'] ? 'text' : 'password'}
                    bind:value={deepseekApiKey}
                    placeholder="sk-... (DeepSeek Chat/Reasoner)"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Powers: Deep Reasoning &amp; Code</span>
                    <a href="https://platform.deepseek.com" target="_blank" rel="noopener" class="text-blue-600 hover:underline">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- OpenRouter Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between">
                    <label for="openrouter-key" class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>OpenRouter (Claude 3.5)</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('openrouterApiKey')}
                      class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      {showKeyMap['openrouterApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="openrouter-key"
                    type={showKeyMap['openrouterApiKey'] ? 'text' : 'password'}
                    bind:value={openrouterApiKey}
                    placeholder="sk-or-v1-... (Claude Sonnet)"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Powers: Claude 3.5 Sonnet</span>
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" class="text-blue-600 hover:underline">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- Replicate Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between">
                    <label for="replicate-key" class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-pink-500"></span>
                      <span>Replicate (Flux Image)</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('replicateApiKey')}
                      class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      {showKeyMap['replicateApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="replicate-key"
                    type={showKeyMap['replicateApiKey'] ? 'text' : 'password'}
                    bind:value={replicateApiKey}
                    placeholder="r8_... (Flux Schnell Image)"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Powers: High-Res AI Images</span>
                    <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener" class="text-blue-600 hover:underline">Get Key &rarr;</a>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 4. MODEL TOGGLES TAB (SECTION 3) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'models'}
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <Icon name="Bot" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">Section 3</span>
                      <h2 class="text-base font-bold text-slate-900">AI Model On / Off Toggles</h2>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Instantly enable or disable individual AI models across the entire platform in real time.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick={enableAllModels}
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Enable All
                  </button>
                  <button
                    type="button"
                    onclick={disableAllModels}
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              <!-- Models Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {#each MODELS_CATALOG as model}
                  <div class="p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between {modelsEnabled[model.id] ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50/70 border-slate-200 opacity-60'}">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded {modelsEnabled[model.id] ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-200 text-slate-600'}">
                          {model.provider}
                        </span>
                        <span class="text-[10px] font-mono text-slate-400">{model.latency}</span>
                      </div>
                      <h3 class="text-xs font-bold text-slate-900 leading-tight">{model.name}</h3>
                      <p class="text-[11px] text-slate-500 mt-1">{model.tag}</p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span class="text-xs font-semibold {modelsEnabled[model.id] ? 'text-emerald-600 font-bold' : 'text-slate-400'}">
                        {modelsEnabled[model.id] ? 'Active (Live)' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        aria-label={`Toggle ${model.name}`}
                        onclick={() => { modelsEnabled[model.id] = !modelsEnabled[model.id]; }}
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer {modelsEnabled[model.id] ? 'bg-blue-600' : 'bg-slate-300'}"
                      >
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs {modelsEnabled[model.id] ? 'translate-x-6' : 'translate-x-1'}"></span>
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 5. SMTP & OTP TAB (SECTION 4) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'smtp'}
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Icon name="Mail" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">Section 4</span>
                      <h2 class="text-base font-bold text-slate-900">Transactional Email &amp; SMTP (6-Digit OTP Delivery)</h2>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Configure your production SMTP relay (Gmail, Hostinger, Brevo, Resend) for real-time 6-digit email OTPs.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold {hasSmtp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
                    {hasSmtp ? '● Live SMTP Active' : '○ Simulated Sandbox Mode'}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <!-- Inputs (2 Cols) -->
                <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Host -->
                  <div class="sm:col-span-2">
                    <label for="smtp-host" class="block text-xs font-bold text-slate-700 mb-1">SMTP Host</label>
                    <input
                      id="smtp-host"
                      type="text"
                      bind:value={smtpHost}
                      placeholder="smtp.gmail.com or smtp.hostinger.com"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                    />
                  </div>

                  <!-- Port -->
                  <div>
                    <label for="smtp-port" class="block text-xs font-bold text-slate-700 mb-1">SMTP Port</label>
                    <input
                      id="smtp-port"
                      type="number"
                      bind:value={smtpPort}
                      placeholder="465 (SSL) or 587 (TLS)"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                    />
                  </div>

                  <!-- User -->
                  <div>
                    <label for="smtp-user" class="block text-xs font-bold text-slate-700 mb-1">SMTP Username / Email</label>
                    <input
                      id="smtp-user"
                      type="text"
                      bind:value={smtpUser}
                      placeholder="noreply@ezboagents.com or your-gmail@gmail.com"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                    />
                  </div>

                  <!-- Password -->
                  <div class="sm:col-span-2">
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
                      placeholder="16-letter Gmail App Password or SMTP token"
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
                    <p>Turn on 2-Step Verification in Google Account &rarr; Search "App Passwords" &rarr; Create a 16-letter App Password and paste it here.</p>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 6. TELEGRAM BOT TAB (SECTION 5) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'telegram'}
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                    <Icon name="Send" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase">Section 5</span>
                      <h2 class="text-base font-bold text-slate-900">Telegram Bot &amp; Webhook Synchronization</h2>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Connect your official Telegram bot so users can command their AI executives and generate images 24/7 directly from Telegram.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold {hasTelegramBot || telegramBotToken ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                    {hasTelegramBot || telegramBotToken ? '● Bot Configured' : '○ Pending Setup'}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <!-- Inputs (2 Cols) -->
                <div class="lg:col-span-2 space-y-4">
                  <!-- Bot Token -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label for="tg-token" class="text-xs font-bold text-slate-700">Telegram Bot API Token</label>
                      <button
                        type="button"
                        onclick={() => toggleShowKey('telegramBotToken')}
                        class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        {showKeyMap['telegramBotToken'] ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="tg-token"
                      type={showKeyMap['telegramBotToken'] ? 'text' : 'password'}
                      bind:value={telegramBotToken}
                      placeholder="e.g. 7192849102:AAH9f2Xv... (from @BotFather)"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                    />
                  </div>

                  <!-- Bot Username -->
                  <div>
                    <label for="tg-username" class="block text-xs font-bold text-slate-700 mb-1">Bot Handle / Username</label>
                    <div class="relative">
                      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">@</span>
                      <input
                        id="tg-username"
                        type="text"
                        bind:value={telegramBotUsername}
                        placeholder="EzboAgentsBot"
                        class="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 placeholder-slate-400 outline-none"
                      />
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1">This handle is used to generate 1-click sync deep links in user dashboards.</p>
                  </div>

                  <!-- Target Webhook Preview -->
                  <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <span class="font-bold text-slate-800">Live Webhook Target:</span>
                    <code class="ml-1 text-[11px] font-mono text-blue-700">https://ezboagents.com/api/telegram/webhook</code>
                  </div>
                </div>

                <!-- Actions & Health Column (1 Col) -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                      <Icon name="Zap" size={14} class="text-sky-600" />
                      <span>Webhook &amp; Bot Test</span>
                    </h3>
                    <p class="text-[11px] text-slate-500 leading-relaxed mb-3">
                      Verify token validity and activate the live webhook on ezboagents.com.
                    </p>

                    <div class="space-y-2.5">
                      <!-- Ping Button -->
                      <button
                        type="button"
                        onclick={testTelegramBot}
                        disabled={isTestingTelegram || !telegramBotToken}
                        class="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {#if isTestingTelegram}
                          <Icon name="Loader2" size={14} class="animate-spin" />
                          <span>Pinging bot...</span>
                        {:else}
                          <Icon name="Bot" size={14} class="text-sky-600" />
                          <span>Test Bot Ping (getMe)</span>
                        {/if}
                      </button>

                      <!-- Set Webhook Button -->
                      <button
                        type="button"
                        onclick={registerTelegramWebhook}
                        disabled={isRegisteringWebhook || !telegramBotToken}
                        class="w-full py-2.5 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {#if isRegisteringWebhook}
                          <Icon name="Loader2" size={14} class="animate-spin" />
                          <span>Registering webhook...</span>
                        {:else}
                          <Icon name="Send" size={14} />
                          <span>Set Live Webhook (1-Click)</span>
                        {/if}
                      </button>
                    </div>

                    {#if telegramFeedback}
                      <div class="mt-2.5 p-2.5 rounded-xl text-[11px] leading-relaxed {telegramFeedback.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
                        {telegramFeedback}
                      </div>
                    {/if}

                    {#if webhookFeedback}
                      <div class="mt-2 p-2.5 rounded-xl text-[11px] leading-relaxed {webhookFeedback.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
                        {webhookFeedback}
                      </div>
                    {/if}
                  </div>

                  <div class="pt-3 border-t border-slate-200/70 text-[10px] text-slate-400 space-y-1">
                    <p class="font-semibold text-slate-600">💡 BotFather Quick Setup:</p>
                    <p>1. Open Telegram &amp; search <strong>@BotFather</strong></p>
                    <p>2. Send <code>/newbot</code>, choose name &amp; handle</p>
                    <p>3. Paste token above &amp; click <strong>Set Live Webhook</strong></p>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 7. SECURITY & SYSTEM TAB -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'security'}
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
                    <Icon name="Shield" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">Section 6</span>
                      <h2 class="text-base font-bold text-slate-900">Security &amp; Vercel .env Synchronizer</h2>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Update the master admin secret passphrase or export current configuration into Vercel Project Settings.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onclick={copyVercelEnv}
                  class="px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Icon name="Copy" size={14} />
                  <span>Copy Vercel .env</span>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Change Admin Passphrase -->
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-slate-900">Master Admin Passphrase</h3>
                    <span class="text-[10px] text-slate-400 font-mono">Current: {authSecret ? '••••••••' : 'default'}</span>
                  </div>
                  <p class="text-xs text-slate-500">
                    To change the master admin passphrase, enter a new passphrase below and click "Save Changes" to apply.
                  </p>
                  <div class="space-y-1.5">
                    <input
                      type="text"
                      bind:value={newPassphrase}
                      placeholder="Enter new passphrase (leave empty to keep current)..."
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-900 outline-none"
                    />
                    {#if passphraseUpdateMsg}
                      <p class="text-[11px] text-emerald-600 font-semibold">{passphraseUpdateMsg}</p>
                    {/if}
                  </div>
                </div>

                <!-- Environment Deployment Architecture -->
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 class="text-xs font-bold text-slate-900">Hosting &amp; Storage Architecture</h3>
                  <ul class="space-y-2 text-xs text-slate-600">
                    <li class="flex items-center justify-between">
                      <span class="font-medium">Primary Hosting:</span>
                      <span class="font-mono text-slate-900">Vercel Serverless (Node 24)</span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span class="font-medium">WhatsApp Socket:</span>
                      <span class="font-mono text-slate-900">Railway (Baileys 24/7)</span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span class="font-medium">Telegram Webhook:</span>
                      <span class="font-mono text-blue-700 font-bold">ezboagents.com/api/telegram/webhook</span>
                    </li>
                    <li class="flex items-center justify-between">
                      <span class="font-medium">Client Encryption:</span>
                      <span class="font-mono text-emerald-700 font-bold">AES-GCM &amp; Local Vault</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          {/if}

        </div>
      </main>
    </div>
  {/if}
</div>
