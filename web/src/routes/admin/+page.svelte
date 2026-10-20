<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import { onMount } from 'svelte';
  import { DEFAULT_PLANS, type PlansSettings, type PlanConfig, type PlanTierId } from '$lib/config/plans';
  import { STORE_BOTS } from '$lib/config/storeBots';
  import { ALL_TOOLS, CATEGORIES, type AITool } from '$lib/config/tools';
  import { TOOL_CONNECTORS, TOOL_CONNECTOR_CATEGORIES, type ToolConnector, type ToolConnectorCategory } from '$lib/config/toolConnectors';
  import {
    currentUser,
    getAllLocalRegisteredUsers,
    applyAdminGrantLocally,
    type ServerUserGrant
  } from '$lib/stores/userStore';
  import { plansStore, normalizePlans, workflowCustomizationUserStore } from '$lib/stores/plansStore';
  import { draggableScroll } from '$lib/utils/draggableScroll';

  type AdminTab = 'overview' | 'users' | 'plans' | 'tools' | 'payment' | 'ai-keys' | 'models' | 'smtp' | 'telegram' | 'security';

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
    channelsCeoEnabled?: boolean;
    workflowCustomizationUserEnabled?: boolean;
    enabledToolConnectors?: string[];
    plans?: PlansSettings;
    providersAllowed?: Record<string, boolean>;
    userGrants?: Record<string, ServerUserGrant>;
    registeredUsers?: Record<string, any>;
  }

  // Navigation State
  let activeAdminTab = $state<AdminTab>('overview');
  let mobileSidebarOpen = $state(false);

  // Passphrase gate
  let authSecret = $state('');
  let newPassphrase = $state('');
  let passphraseUpdateMsg = $state('');
  let isAuthenticated = $state(false);
  let authError = $state('');

  // Form state - User Access & Bot Assignment
  let userGrantsMap = $state<Record<string, ServerUserGrant>>({});
  let registeredUsersMap = $state<Record<string, any>>({});
  let grantEmail = $state('');
  let grantName = $state('');
  let grantIsSubscribed = $state(true);
  let grantTier = $state<'byok_starter' | 'byok_pro' | 'managed' | 'byok'>('byok_pro');
  let grantInterval = $state<'monthly' | 'yearly'>('yearly');
  let grantSelectedBots = $state<string[]>(STORE_BOTS.map((b) => b.id));
  let grantNote = $state('');
  let isGrantingUser = $state(false);
  let grantFeedback = $state('');
  let grantFeedbackType = $state<'success' | 'error'>('success');
  let userSearchQuery = $state('');

  // Form state - Plans & Pricing
  let editablePlans = $state<PlansSettings>(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
  let activePlanTab = $state<PlanTierId>('byok_starter');
  let isCurrentPlanActive = $derived(editablePlans[activePlanTab]?.isEnabled !== false);
  let newFeatureText = $state('');
  let previewBillingInterval = $state<'monthly' | 'yearly'>('monthly');
  let helperSearch = $state('');
  let helperCategoryFilter = $state('all');
  let planToolSearch = $state('');
  let planToolCategoryFilter = $state('all');

  // Form state - Tool Connectors (100 Enterprise Connectors)
  let enabledToolConnectors = $state<string[]>(TOOL_CONNECTORS.map((t) => t.id));
  let toolConnectorSearch = $state('');
  let toolConnectorCategoryFilter = $state('all');

  // Form state - Payment
  let opayApiKey = $state('');
  let opaySecretKey = $state('');
  let opayBrandKey = $state('');
  let opayEndpointUrl = $state('https://verify.opaybd.com/api/payment/create');
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

  let providersAllowed = $state<Record<string, boolean>>({
    gemini: true,
    openrouter: true,
    openai: true,
    grok: true,
    deepseek: true,
    replicate: true
  });

  const CLIENT_PROVIDERS_CATALOG = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      tag: 'Google AI Studio',
      desc: 'Free tier available (Gemini 2.0 Flash / Pro). Recommended default.',
      freeBadge: 'Free Tier Available'
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      tag: '200+ Multi-Model Gateway',
      desc: 'Auto-rotating free models (:free) or top-up credit balance.',
      freeBadge: 'Free & Paid Models'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      tag: 'OpenAI Platform',
      desc: 'Allows users to supply personal OpenAI keys for GPT-4o & GPT-4o-mini.',
      freeBadge: 'BYOK Paid'
    },
    {
      id: 'grok',
      name: 'xAI (Grok)',
      tag: 'xAI Console',
      desc: 'Allows users to connect xAI keys for Grok-2 and Grok-3.',
      freeBadge: 'BYOK Paid'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      tag: 'DeepSeek Platform',
      desc: 'DeepSeek-V3 & R1 reasoning at ultra-low token cost.',
      freeBadge: 'Low-Cost BYOK'
    },
    {
      id: 'replicate',
      name: 'Replicate (Flux Images)',
      tag: 'Replicate API',
      desc: 'Flux Schnell & SDXL image generation tokens.',
      freeBadge: 'Image AI'
    }
  ];

  let isLoading = $state(false);
  let isSaving = $state(false);
  let saveFeedback = $state('');
  let saveFeedbackType = $state<'success' | 'error'>('success');
  let copyFeedback = $state('');
  let channelsCeoEnabled = $state(true);
  let workflowCustomizationUserEnabled = $state(true);

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
    { id: 'users', label: 'User Access & Bots', icon: 'UserCheck', badge: 'Assign' },
    { id: 'plans', label: 'Plans & Pricing', icon: 'Receipt', badge: 'Editable' },
    { id: 'tools', label: 'Tool Connectors', icon: 'Wrench', badge: 'Connectors' },
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

  async function syncUsersDirectory(secretToUse: string) {
    try {
      const localUsers = getAllLocalRegisteredUsers();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: secretToUse,
          action: 'list',
          localUsers
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          userGrantsMap = data.userGrants || {};
          registeredUsersMap = data.registeredUsers || {};
        }
      }
    } catch {
      // ignore
    }
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
        opayEndpointUrl = (s.opayEndpointUrl || 'https://verify.opaybd.com/api/payment/create').replace('http://verify.opaybd.com', 'https://verify.opaybd.com');
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
        if (s.providersAllowed) {
          providersAllowed = {
            gemini: s.providersAllowed.gemini !== false,
            openrouter: s.providersAllowed.openrouter !== false,
            openai: s.providersAllowed.openai !== false,
            grok: s.providersAllowed.grok !== false,
            deepseek: s.providersAllowed.deepseek !== false,
            replicate: s.providersAllowed.replicate !== false
          };
        }
        if (s.plans) {
          editablePlans = JSON.parse(JSON.stringify(normalizePlans(s.plans)));
        }
        if (s.userGrants) {
          userGrantsMap = s.userGrants;
        }
        if (s.registeredUsers) {
          registeredUsersMap = s.registeredUsers;
        }
        if (s.enabledToolConnectors && Array.isArray(s.enabledToolConnectors)) {
          enabledToolConnectors = [...s.enabledToolConnectors];
        }
        channelsCeoEnabled = s.channelsCeoEnabled !== false;
        workflowCustomizationUserEnabled = s.workflowCustomizationUserEnabled !== false;
        workflowCustomizationUserStore.set(workflowCustomizationUserEnabled);
        isAuthenticated = true;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ezbo_admin_authed', 'true');
          sessionStorage.setItem('ezbo_admin_secret', secretToUse);
        }
        syncUsersDirectory(secretToUse);
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

  function toggleGrantBot(botId: string) {
    if (grantSelectedBots.includes(botId)) {
      grantSelectedBots = grantSelectedBots.filter((id) => id !== botId);
    } else {
      grantSelectedBots = [...grantSelectedBots, botId];
    }
  }

  function selectAllGrantBots() {
    grantSelectedBots = STORE_BOTS.map((b) => b.id);
  }

  function clearAllGrantBots() {
    grantSelectedBots = [];
  }

  function fillMyCurrentEmail() {
    if ($currentUser?.email) {
      selectUserForGrant($currentUser.email, $currentUser.name);
    }
  }

  function selectUserForGrant(email: string, fallbackName?: string) {
    const clean = email.trim().toLowerCase();
    grantEmail = clean;
    const existingGrant = userGrantsMap[clean];
    const existingReg = registeredUsersMap[clean];

    if (existingGrant) {
      grantName = existingGrant.name || existingReg?.name || fallbackName || '';
      grantIsSubscribed = existingGrant.isSubscribed;
      if (existingGrant.tier === 'managed') {
        grantTier = 'managed';
      } else if (existingGrant.tier === 'byok_starter') {
        grantTier = 'byok_starter';
      } else {
        grantTier = 'byok_pro';
      }
      grantInterval = existingGrant.interval === 'yearly' ? 'yearly' : 'monthly';
      grantSelectedBots = [...(existingGrant.unlockedStoreBots || [])];
      grantNote = existingGrant.note || '';
    } else if (existingReg) {
      grantName = existingReg.name || fallbackName || '';
      grantIsSubscribed = existingReg.isSubscribed ?? true;
      if (existingReg.tier === 'managed') {
        grantTier = 'managed';
      } else if (existingReg.tier === 'byok_starter') {
        grantTier = 'byok_starter';
      } else {
        grantTier = 'byok_pro';
      }
      grantInterval = 'yearly';
      grantSelectedBots = [...(existingReg.unlockedStoreBots || [])];
      grantNote = '';
    } else {
      grantName = fallbackName || '';
      grantIsSubscribed = true;
      grantTier = 'byok_pro';
    }
  }

  async function handleGrantUserAccess() {
    if (!grantEmail.trim() || !grantEmail.includes('@')) {
      grantFeedback = 'Please enter a valid user email address.';
      grantFeedbackType = 'error';
      return;
    }

    isGrantingUser = true;
    grantFeedback = '';
    try {
      const secretToUse = authSecret.trim() || 'ezbo-admin-2026';
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: secretToUse,
          action: 'grant',
          email: grantEmail.trim(),
          name: grantName.trim(),
          isSubscribed: grantIsSubscribed,
          tier: grantTier,
          interval: grantInterval,
          unlockedStoreBots: grantSelectedBots,
          note: grantNote.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.userGrants) userGrantsMap = data.userGrants;
        if (data.registeredUsers) registeredUsersMap = data.registeredUsers;
        if (data.grant) {
          applyAdminGrantLocally(data.grant);
        }
        grantFeedback = data.message || 'User plan and bot access activated successfully!';
        grantFeedbackType = 'success';
      } else {
        grantFeedback = data.error || 'Failed to update user access.';
        grantFeedbackType = 'error';
      }
    } catch (e: any) {
      grantFeedback = e.message || 'Network error while assigning user access.';
      grantFeedbackType = 'error';
    } finally {
      isGrantingUser = false;
      setTimeout(() => {
        grantFeedback = '';
      }, 6000);
    }
  }

  async function handleQuickUnlockAllBots(email: string, name?: string) {
    grantEmail = email;
    if (name) grantName = name;
    grantIsSubscribed = true;
    grantSelectedBots = STORE_BOTS.map((b) => b.id);
    await handleGrantUserAccess();
  }

  async function handleRevokeUserAccess(email: string) {
    isGrantingUser = true;
    grantFeedback = '';
    try {
      const secretToUse = authSecret.trim() || 'ezbo-admin-2026';
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: secretToUse,
          action: 'revoke',
          email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.userGrants) userGrantsMap = data.userGrants;
        if (data.registeredUsers) registeredUsersMap = data.registeredUsers;
        if (data.grant) {
          applyAdminGrantLocally(data.grant);
        }
        grantFeedback = data.message || `Access revoked for ${email}.`;
        grantFeedbackType = 'success';
      }
    } catch (e: any) {
      grantFeedback = e.message || 'Error revoking access.';
      grantFeedbackType = 'error';
    } finally {
      isGrantingUser = false;
    }
  }

  const combinedUsersList = $derived.by(() => {
    const map = new Map<string, {
      email: string;
      name: string;
      isSubscribed: boolean;
      tier: 'byok' | 'managed';
      interval: 'monthly' | 'yearly';
      unlockedStoreBots: string[];
      hasAdminGrant: boolean;
      note?: string;
      updatedAt?: string;
    }>();

    // 1. Local browser users
    const localList = typeof window !== 'undefined' ? getAllLocalRegisteredUsers() : [];
    for (const u of localList) {
      const clean = u.email.toLowerCase();
      map.set(clean, {
        email: clean,
        name: u.name || clean.split('@')[0],
        isSubscribed: !!u.isSubscribed,
        tier: u.tier === 'managed' ? 'managed' : 'byok',
        interval: u.plan === 'yearly' ? 'yearly' : 'monthly',
        unlockedStoreBots: [],
        hasAdminGrant: false
      });
    }

    // 2. Server registered users
    for (const [emailKey, reg] of Object.entries(registeredUsersMap)) {
      const clean = emailKey.toLowerCase();
      const prev = map.get(clean);
      map.set(clean, {
        email: clean,
        name: reg.name || prev?.name || clean.split('@')[0],
        isSubscribed: reg.isSubscribed ?? prev?.isSubscribed ?? false,
        tier: reg.tier === 'managed' ? 'managed' : (prev?.tier || 'byok'),
        interval: prev?.interval || 'monthly',
        unlockedStoreBots: reg.unlockedStoreBots || prev?.unlockedStoreBots || [],
        hasAdminGrant: false,
        updatedAt: reg.lastSeenAt
      });
    }

    // 3. Admin grants override
    for (const [emailKey, g] of Object.entries(userGrantsMap)) {
      const clean = emailKey.toLowerCase();
      const prev = map.get(clean);
      map.set(clean, {
        email: clean,
        name: g.name || prev?.name || clean.split('@')[0],
        isSubscribed: g.isSubscribed,
        tier: g.tier === 'managed' ? 'managed' : 'byok',
        interval: g.interval === 'yearly' ? 'yearly' : 'monthly',
        unlockedStoreBots: g.unlockedStoreBots || [],
        hasAdminGrant: true,
        note: g.note,
        updatedAt: g.updatedAt
      });
    }

    const q = userSearchQuery.trim().toLowerCase();
    const arr = Array.from(map.values());
    if (!q) return arr;
    return arr.filter((u) => u.email.includes(q) || u.name.toLowerCase().includes(q));
  });

  function addPlanFeature(planId: PlanTierId) {
    if (!newFeatureText.trim()) return;
    editablePlans[planId].features = [...editablePlans[planId].features, newFeatureText.trim()];
    newFeatureText = '';
  }

  function removePlanFeature(planId: PlanTierId, index: number) {
    editablePlans[planId].features = editablePlans[planId].features.filter((_, i) => i !== index);
  }

  function resetPlanDefaults(planId: PlanTierId) {
    editablePlans[planId] = JSON.parse(JSON.stringify(DEFAULT_PLANS[planId]));
  }

  function getEnabledPlanCount(): number {
    const tiers: PlanTierId[] = ['byok_starter', 'byok_pro', 'managed'];
    return tiers.filter((t) => editablePlans[t]?.isEnabled !== false).length;
  }

  function togglePlanVisibility(planId: PlanTierId) {
    const isCurrentlyEnabled = editablePlans[planId]?.isEnabled !== false;
    if (isCurrentlyEnabled) {
      const enabledCount = getEnabledPlanCount();
      if (enabledCount <= 1) {
        saveFeedback = 'Cannot hide/delete this plan: At least 1 plan must remain active and visible to users!';
        saveFeedbackType = 'error';
        setTimeout(() => { if (saveFeedback.startsWith('Cannot hide/delete')) saveFeedback = ''; }, 5000);
        return;
      }
      editablePlans[planId].isEnabled = false;
    } else {
      editablePlans[planId].isEnabled = true;
    }
  }

  function deleteOrHidePlan(planId: PlanTierId) {
    const enabledCount = getEnabledPlanCount();
    if (enabledCount <= 1 && editablePlans[planId]?.isEnabled !== false) {
      saveFeedback = 'Cannot hide/delete this plan: At least 1 plan must remain active and visible to users!';
      saveFeedbackType = 'error';
      setTimeout(() => { if (saveFeedback.startsWith('Cannot hide/delete')) saveFeedback = ''; }, 5000);
      return;
    }
    editablePlans[planId].isEnabled = false;
  }

  function restorePlan(planId: PlanTierId) {
    editablePlans[planId].isEnabled = true;
  }

  function toggleHelperForPlan(planId: PlanTierId, helperId: string) {
    const plan = editablePlans[planId];
    if (!plan.featureToggles) {
      plan.featureToggles = {
        aiCeo: true,
        whatsapp: true,
        telegram: true,
        multiKeyVault: planId === 'byok_pro',
        multiModelFailover: planId !== 'byok_starter',
        commercialImages: true,
        customPrompts: true,
        prioritySupport: planId !== 'byok_starter',
        allHelpersEnabled: false,
        enabledHelpers: [helperId],
        allToolsEnabled: true,
        enabledTools: []
      };
      return;
    }
    if (!Array.isArray(plan.featureToggles.enabledHelpers)) {
      plan.featureToggles.enabledHelpers = [];
    }
    // If all helpers were active, transition to explicit list excluding this one
    if (plan.featureToggles.allHelpersEnabled !== false) {
      plan.featureToggles.allHelpersEnabled = false;
      plan.featureToggles.enabledHelpers = ALL_TOOLS.map((t) => t.id).filter((id) => id !== helperId);
      return;
    }
    plan.featureToggles.allHelpersEnabled = false;
    const currentList = plan.featureToggles.enabledHelpers;
    if (currentList.includes(helperId)) {
      plan.featureToggles.enabledHelpers = currentList.filter((id) => id !== helperId);
    } else {
      plan.featureToggles.enabledHelpers = [...currentList, helperId];
    }
  }

  function selectAllHelpersForPlan(planId: PlanTierId) {
    const plan = editablePlans[planId];
    if (!plan.featureToggles) return;
    plan.featureToggles.allHelpersEnabled = false;
    plan.featureToggles.enabledHelpers = ALL_TOOLS.map((t) => t.id);
  }

  function clearAllHelpersForPlan(planId: PlanTierId) {
    const plan = editablePlans[planId];
    if (!plan.featureToggles) return;
    plan.featureToggles.allHelpersEnabled = false;
    plan.featureToggles.enabledHelpers = [];
  }

  const filteredMatrixHelpers = $derived.by(() => {
    let list = ALL_TOOLS;
    if (helperCategoryFilter !== 'all') {
      list = list.filter((t) => t.category === helperCategoryFilter);
    }
    if (helperSearch.trim()) {
      const q = helperSearch.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.shortDesc && t.shortDesc.toLowerCase().includes(q)) ||
          t.categoryName.toLowerCase().includes(q)
      );
    }
    return list;
  });

  function toggleToolForPlan(planId: PlanTierId, toolId: string) {
    const plan = editablePlans[planId];
    if (!plan.featureToggles) return;
    if (!Array.isArray(plan.featureToggles.enabledTools)) {
      plan.featureToggles.enabledTools = [];
    }
    // If all tools were active, transition to explicit list excluding this one
    if (plan.featureToggles.allToolsEnabled !== false) {
      plan.featureToggles.allToolsEnabled = false;
      plan.featureToggles.enabledTools = TOOL_CONNECTORS.map((t) => t.id).filter((id) => id !== toolId);
      return;
    }
    plan.featureToggles.allToolsEnabled = false;
    const currentList = plan.featureToggles.enabledTools;
    if (currentList.includes(toolId)) {
      plan.featureToggles.enabledTools = currentList.filter((id) => id !== toolId);
    } else {
      plan.featureToggles.enabledTools = [...currentList, toolId];
    }
  }

  function selectAllToolsForPlan(planId: PlanTierId) {
    const plan = editablePlans[planId];
    if (!plan.featureToggles) return;
    plan.featureToggles.allToolsEnabled = false;
    plan.featureToggles.enabledTools = TOOL_CONNECTORS.map((t) => t.id);
  }

  function clearAllToolsForPlan(planId: PlanTierId) {
    const plan = editablePlans[planId];
    if (!plan.featureToggles) return;
    plan.featureToggles.allToolsEnabled = false;
    plan.featureToggles.enabledTools = [];
  }

  const filteredPlanTools = $derived.by(() => {
    let list = TOOL_CONNECTORS;
    if (planToolCategoryFilter !== 'all') {
      list = list.filter((t) => t.categoryId === planToolCategoryFilter);
    }
    if (planToolSearch.trim()) {
      const q = planToolSearch.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }
    return list;
  });

  function toggleToolConnector(id: string) {
    toggleToolForPlan(activePlanTab, id);
    if (enabledToolConnectors.includes(id)) {
      enabledToolConnectors = enabledToolConnectors.filter((t) => t !== id);
    } else {
      enabledToolConnectors = [...enabledToolConnectors, id];
    }
  }

  function selectAllToolConnectors() {
    selectAllToolsForPlan(activePlanTab);
    enabledToolConnectors = TOOL_CONNECTORS.map((t) => t.id);
  }

  function clearAllToolConnectors() {
    clearAllToolsForPlan(activePlanTab);
    enabledToolConnectors = [];
  }

  function enableCategoryTools(catId: string) {
    const catTools = TOOL_CONNECTORS.filter((t) => t.categoryId === catId).map((t) => t.id);
    const set = new Set([...enabledToolConnectors, ...catTools]);
    enabledToolConnectors = Array.from(set);
  }

  function disableCategoryTools(catId: string) {
    const catTools = new Set(TOOL_CONNECTORS.filter((t) => t.categoryId === catId).map((t) => t.id));
    enabledToolConnectors = enabledToolConnectors.filter((id) => !catTools.has(id));
  }

  const filteredToolConnectors = $derived.by(() => {
    const q = toolConnectorSearch.trim().toLowerCase();
    return TOOL_CONNECTORS.filter((tool) => {
      if (toolConnectorCategoryFilter !== 'all' && tool.categoryId !== toolConnectorCategoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q)
      );
    });
  });

  async function saveSettings() {
    isSaving = true;
    saveFeedback = '';
    const enabledPlanCount = getEnabledPlanCount();
    if (enabledPlanCount === 0) {
      saveFeedback = 'Cannot save: At least 1 plan must remain active and visible to users!';
      saveFeedbackType = 'error';
      isSaving = false;
      return;
    }
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
        channelsCeoEnabled,
        workflowCustomizationUserEnabled,
        modelsEnabled,
        providersAllowed,
        enabledToolConnectors,
        plans: {
          ...editablePlans,
          byok: editablePlans.byok_starter
        }
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
          if (s.workflowCustomizationUserEnabled !== undefined) {
            workflowCustomizationUserEnabled = s.workflowCustomizationUserEnabled !== false;
          }
          if (s.modelsEnabled) modelsEnabled = { ...s.modelsEnabled };
          if (s.providersAllowed) providersAllowed = { ...providersAllowed, ...s.providersAllowed };
          if (s.enabledToolConnectors && Array.isArray(s.enabledToolConnectors)) {
            enabledToolConnectors = [...s.enabledToolConnectors];
          }
          if (s.plans) {
            editablePlans = JSON.parse(JSON.stringify(normalizePlans(s.plans)));
          }
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ezbo_enabled_tool_connectors', JSON.stringify(enabledToolConnectors));
              localStorage.setItem('ezbo_workflow_user_enabled', String(workflowCustomizationUserEnabled));
              localStorage.setItem('ezbo_public_plans', JSON.stringify(editablePlans));
              plansStore.set(normalizePlans(editablePlans));
              workflowCustomizationUserStore.set(workflowCustomizationUserEnabled);
              window.dispatchEvent(new CustomEvent('ezbo:plans-settings-updated', { detail: { plans: editablePlans } }));
              window.dispatchEvent(new CustomEvent('ezbo:tools-settings-updated'));
              window.dispatchEvent(new CustomEvent('ezbo:workflow-settings-updated', { detail: { enabled: workflowCustomizationUserEnabled } }));
            } catch {}
          }
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

  const handleSaveSettings = saveSettings;

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

<div class="min-h-screen bg-[#F3F8FF] text-[#102A56] selection:bg-[#1677FF] selection:text-white font-sans">
  {#if !isAuthenticated}
    <!-- ======================================================== -->
    <!-- AUTHENTICATION PASSCODE GATE -->
    <!-- ======================================================== -->
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md rounded-3xl ui-card-static p-8 space-y-6">
        <div class="text-center space-y-2">
          <img src="/logo.png" alt="EzboAgents Admin" class="w-14 h-14 object-contain drop-shadow-xs mx-auto" />
          <h1 class="text-2xl font-black text-[#102A56] tracking-tight">Ezbo<span class="text-[#1677FF]">Agents</span> Admin</h1>
          <p class="text-xs text-[#4B6382]">Master Platform Operations &amp; Intelligence Control Hub</p>
        </div>

        {#if authError}
          <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <Icon name="AlertCircle" size={16} />
            <span>{authError}</span>
          </div>
        {/if}

        <form onsubmit={(e) => { e.preventDefault(); handleAuthSubmit(); }} class="space-y-4">
          <div>
            <label for="admin-passphrase-input" class="block text-xs font-bold text-[#102A56] uppercase tracking-wider mb-1.5">
              Admin Passphrase
            </label>
            <input
              id="admin-passphrase-input"
              type="password"
              bind:value={authSecret}
              placeholder="Enter master admin passphrase..."
              class="ui-input px-4 py-3 text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            class="w-full py-3.5 rounded-xl blue-btn text-white text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

        <div class="pt-4 border-t border-[#E3ECF7] text-center">
          <a href="/dashboard" class="text-xs text-[#4B6382] hover:text-[#1677FF] transition-colors font-semibold">
            ← Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  {:else}
    <!-- ======================================================== -->
    <!-- MASTER ADMIN CONSOLE WITH SIDEBAR LAYOUT -->
    <!-- ======================================================== -->
    <div class="min-h-screen flex flex-col lg:flex-row bg-[#F3F8FF]">
      
      <!-- MOBILE TOPBAR -->
      <div class="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#E3ECF7] sticky top-0 z-40">
        <div class="flex items-center gap-2.5">
          <img src="/logo.png" alt="EzboAgents Admin" class="w-8 h-8 object-contain drop-shadow-xs" />
          <span class="font-black text-[#102A56] text-sm">Ezbo<span class="text-[#1677FF]">Agents</span> Admin</span>
        </div>
        <button
          type="button"
          onclick={() => mobileSidebarOpen = !mobileSidebarOpen}
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] text-[#102A56] hover:bg-white transition-colors cursor-pointer"
          aria-label="Toggle Admin Sidebar Menu"
        >
          <Icon name={mobileSidebarOpen ? 'X' : 'AlignLeft'} size={18} />
        </button>
      </div>

      <!-- SIDEBAR (DESKTOP & MOBILE DRAWER) -->
      <aside class="
        fixed lg:sticky top-0 inset-y-0 left-0 z-50
        w-64 sm:w-72 max-w-[85vw] ui-sidebar flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        {mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        h-screen shrink-0
      ">
        <div class="p-5 flex flex-col h-full overflow-y-auto">
          <!-- Logo & Brand -->
          <div class="flex items-center justify-between pb-5 border-b border-[#E3ECF7]">
            <div class="flex items-center gap-3">
              <img src="/logo.png" alt="EzboAgents Admin" class="w-10 h-10 object-contain drop-shadow-xs" />
              <div>
                <h1 class="text-sm font-black text-[#102A56] tracking-tight">Ezbo<span class="text-[#1677FF]">Agents</span></h1>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-[10px] font-bold text-[#4B6382] uppercase tracking-wider">Admin Ops</span>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onclick={() => mobileSidebarOpen = false}
              class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] transition-colors cursor-pointer"
              aria-label="Close Admin Sidebar"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          <!-- Navigation Links -->
          <div class="py-5 space-y-1.5 flex-1">
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-[#5E7694] mb-2">Management Modules</p>
            {#each ADMIN_NAV as nav}
              <button
                type="button"
                onclick={() => { activeAdminTab = nav.id; mobileSidebarOpen = false; }}
                class="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group {activeAdminTab === nav.id ? 'bg-[#1677FF] text-white shadow-xs font-bold' : 'text-[#4B6382] hover:text-[#102A56] hover:bg-[#F3F8FF]'}"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <Icon name={nav.icon} size={17} class={activeAdminTab === nav.id ? 'text-white' : 'text-[#5E7694] group-hover:text-[#1677FF]'} />
                  <span class="truncate">{nav.label}</span>
                </div>
                <span class="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-tight uppercase shrink-0 {activeAdminTab === nav.id ? 'bg-white/20 text-white' : 'bg-[#F3F8FF] text-[#4B6382] border border-[#E3ECF7] group-hover:text-[#1677FF]'}">
                  {#if nav.id === 'tools'}
                    {enabledToolConnectors.length}/{TOOL_CONNECTORS.length}
                  {:else}
                    {nav.badge}
                  {/if}
                </span>
              </button>
            {/each}
          </div>

          <!-- Bottom Session & Quick Links -->
          <div class="pt-4 border-t border-[#E3ECF7] space-y-3">
            <div class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#5E7694]">Authenticated Session</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p class="text-xs font-mono font-bold text-[#102A56] truncate">{authSecret}</p>
            </div>

            <div class="flex items-center gap-2">
              <a
                href="/dashboard"
                class="flex-1 py-2 px-3 rounded-xl btn-secondary text-xs text-center flex items-center justify-center gap-1.5"
              >
                <Icon name="Layout" size={13} />
                <span>App Dashboard</span>
              </a>
              <button
                type="button"
                onclick={handleLogout}
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors cursor-pointer shrink-0"
                title="Logout from Admin"
                aria-label="Logout from Admin"
              >
                <Icon name="LogOut" size={16} />
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
          class="fixed inset-0 ui-modal-backdrop z-40 lg:hidden"
        ></button>
      {/if}

      <!-- MAIN CONTENT VIEWPORT -->
      <main class="flex-1 flex flex-col min-w-0">
        
        <!-- TOP STICKY HEADER -->
        <header class="bg-white/95 backdrop-blur-md border-b border-[#E3ECF7] px-4 sm:px-8 py-4 sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5">
              <h2 class="text-base sm:text-lg font-black text-[#102A56] tracking-tight">
                {#if activeAdminTab === 'overview'}Overview Dashboard
                {:else if activeAdminTab === 'users'}User Access &amp; Bot Assignment
                {:else if activeAdminTab === 'plans'}Plans &amp; Pricing Manager
                {:else if activeAdminTab === 'tools'}Tool Connectors &amp; Integrations
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
            <p class="text-xs text-[#4B6382] mt-0.5 hidden sm:block">
              EzboAgents Central Executive Infrastructure &bull; Live Production Cluster
            </p>
          </div>

          <!-- Quick Top Actions -->
          <div class="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onclick={copyVercelEnv}
              class="px-3.5 py-2 rounded-xl btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
              title="Copy Vercel .env format"
            >
              <Icon name="Copy" size={13} />
              <span class="hidden md:inline">Export</span> <span>.env</span>
            </button>

            <button
              type="button"
              onclick={saveSettings}
              disabled={isSaving}
              class="px-5 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
          <div class="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs {saveFeedbackType === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}">
            <Icon name={saveFeedbackType === 'success' ? 'Check' : 'AlertCircle'} size={16} />
            <span>{saveFeedback}</span>
          </div>
        {/if}

        {#if copyFeedback}
          <div class="mx-4 sm:mx-8 mt-4 p-3.5 rounded-2xl text-xs font-semibold bg-white border border-[#1677FF]/30 text-[#102A56] flex items-center gap-2 shadow-2xs">
            <Icon name="Check" size={16} class="text-[#1677FF]" />
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
              <div class="p-4 sm:p-6 lg:p-8 rounded-3xl ui-banner-navy text-white relative overflow-hidden">
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div class="space-y-2 max-w-2xl">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38CFFF]/15 text-[11px] font-bold text-[#38CFFF] border border-[#38CFFF]/35">
                      <Icon name="Sparkles" size={13} class="text-[#38CFFF]" />
                      <span>Executive Command &bull; Central Router v2.4</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Platform Operations Overview
                    </h2>
                    <p class="text-xs sm:text-sm text-white/80 leading-relaxed">
                      Unified dashboard for live payment settlements, user plan &amp; bot store access grants, multi-engine AI models, and omni-channel synchronization.
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onclick={() => activeAdminTab = 'users'}
                      class="px-5 py-2.5 rounded-xl blue-btn text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icon name="UserCheck" size={15} />
                      <span>Assign Plan &amp; Bots</span>
                    </button>
                    <button
                      type="button"
                      onclick={() => activeAdminTab = 'tools'}
                      class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Icon name="Wrench" size={14} />
                      <span>Tool Connectors ({enabledToolConnectors.length})</span>
                    </button>
                    <button
                      type="button"
                      onclick={() => activeAdminTab = 'ai-keys'}
                      class="px-5 py-2.5 rounded-xl bg-white text-[#102A56] font-bold text-xs hover:bg-[#F3F8FF] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Icon name="Key" size={14} class="text-[#1677FF]" />
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

              <!-- Top KPI Metric Cards (6 Cards) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <!-- User Access & Bots KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'users'}
                  class="p-5 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/45 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] group-hover:scale-105 transition-transform">
                      <Icon name="UserCheck" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]">
                      {combinedUsersList.length} Users
                    </span>
                  </div>
                  <p class="text-xs text-[#4B6382] font-medium">User Access &amp; Bots</p>
                  <h3 class="text-base font-extrabold text-[#102A56] mt-0.5 truncate">
                    Assign Plan &amp; Bots
                  </h3>
                  <p class="text-[11px] text-[#5E7694] mt-1">Grant VIP &amp; Store Bots</p>
                </button>

                <!-- Plans & Pricing KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'plans'}
                  class="p-5 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/45 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] group-hover:scale-105 transition-transform">
                      <Icon name="Receipt" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]">
                      2 Tiers Live
                    </span>
                  </div>
                  <p class="text-xs text-[#4B6382] font-medium">Pricing Plans</p>
                  <h3 class="text-base font-extrabold text-[#102A56] mt-0.5 truncate">
                    ৳{editablePlans.byok.monthlyPrice} / ৳{editablePlans.managed.monthlyPrice}
                  </h3>
                  <p class="text-[11px] text-[#5E7694] mt-1">Click to Edit Price &amp; Details</p>
                </button>

                <!-- Tool Connectors KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'tools'}
                  class="p-5 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/45 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] group-hover:scale-105 transition-transform">
                      <Icon name="Wrench" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]">
                      {enabledToolConnectors.length}/{TOOL_CONNECTORS.length} Active
                    </span>
                  </div>
                  <p class="text-xs text-[#4B6382] font-medium">Tool Connectors</p>
                  <h3 class="text-base font-extrabold text-[#102A56] mt-0.5 truncate">
                    {enabledToolConnectors.length === TOOL_CONNECTORS.length ? 'All 100 Online' : `${enabledToolConnectors.length} Enabled`}
                  </h3>
                  <p class="text-[11px] text-[#5E7694] mt-1">Click to Toggle Tools</p>
                </button>

                <!-- Payment Gateway KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'payment'}
                  class="p-5 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/45 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                      <Icon name="CreditCard" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {opayApiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                      {opayApiKey ? 'Connected' : 'Action Needed'}
                    </span>
                  </div>
                  <p class="text-xs text-[#4B6382] font-medium">Payment Gateway</p>
                  <h3 class="text-base font-extrabold text-[#102A56] mt-0.5 truncate">
                    {opayApiKey ? 'OPayBD Active' : 'Setup Required'}
                  </h3>
                  <p class="text-[11px] text-[#5E7694] mt-1">bKash, Nagad, Rocket Real-Time</p>
                </button>

                <!-- AI Engines Vault KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'ai-keys'}
                  class="p-5 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/45 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] group-hover:scale-105 transition-transform">
                      <Icon name="Key" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]">
                      {configuredKeysCount} / 6 Ready
                    </span>
                  </div>
                  <p class="text-xs text-[#4B6382] font-medium">Master Engine Vault</p>
                  <h3 class="text-base font-extrabold text-[#102A56] mt-0.5 truncate">
                    {geminiApiKey ? 'Gemini 2.0 Primed' : 'Platform Key Missing'}
                  </h3>
                  <p class="text-[11px] text-[#5E7694] mt-1">ChatGPT, Grok, DeepSeek</p>
                </button>

                <!-- Model Toggles KPI -->
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'models'}
                  class="p-5 rounded-2xl bg-white border border-[#E3ECF7] shadow-2xs hover:border-[#1677FF]/45 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-[#38CFFF]/15 border border-[#38CFFF]/35 flex items-center justify-center text-[#089CD0] group-hover:scale-105 transition-transform">
                      <Icon name="Bot" size={20} />
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#38CFFF]/15 text-[#089CD0] border border-[#38CFFF]/35">
                      {activeModelsCount} / {MODELS_CATALOG.length} Online
                    </span>
                  </div>
                  <p class="text-xs text-[#4B6382] font-medium">AI Models Roster</p>
                  <h3 class="text-base font-extrabold text-[#102A56] mt-0.5 truncate">
                    {activeModelsCount === MODELS_CATALOG.length ? '100% Available' : `${activeModelsCount} Models Enabled`}
                  </h3>
                  <p class="text-[11px] text-[#5E7694] mt-1">Latency Avg ~650ms</p>
                </button>
              </div>

              <!-- Core Services Health Matrix (4 Interactive Cards) -->
              <div class="p-4 sm:p-6 lg:p-8 rounded-3xl ui-card-static space-y-5">
                <div class="flex items-center justify-between border-b border-[#E3ECF7] pb-4">
                  <div>
                    <h3 class="text-sm font-bold text-[#102A56] flex items-center gap-2">
                      <Icon name="Layers" size={18} class="text-[#1677FF]" />
                      <span>Core Services &amp; Infrastructure Matrix</span>
                    </h3>
                    <p class="text-xs text-[#4B6382] mt-0.5">Real-time telemetry and subsystem operational readiness.</p>
                  </div>
                  <span class="text-xs font-mono text-[#5E7694]">Node 24 LTS &bull; Edge Vercel</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Service 1: Payment Settlement -->
                  <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {opayApiKey ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                        <h4 class="text-xs font-bold text-[#102A56]">OPayBD Payment Settlements</h4>
                      </div>
                      <p class="text-[11px] text-[#4B6382] leading-relaxed">
                        Automatic webhook verification for bKash, Nagad, and Rocket checkouts. Direct instant tier provisioning.
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'payment'}
                        class="text-xs text-[#1677FF] hover:text-[#1162DB] font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Configure Gateway</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>

                  <!-- Service 2: Multi-Model AI Routing -->
                  <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {geminiApiKey ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                        <h4 class="text-xs font-bold text-[#102A56]">Multi-Model AI Orchestrator</h4>
                      </div>
                      <p class="text-[11px] text-[#4B6382] leading-relaxed">
                        Universal router supporting BYOK vault decryption and platform fallback across Google, OpenAI, xAI and DeepSeek.
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'ai-keys'}
                        class="text-xs text-[#1677FF] hover:text-[#1162DB] font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Manage Vault Keys</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>

                  <!-- Service 3: Transactional 6-Digit Email OTP -->
                  <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {hasSmtp ? 'bg-emerald-500' : 'bg-[#1677FF]'}"></span>
                        <h4 class="text-xs font-bold text-[#102A56]">Transactional 6-Digit Email OTP</h4>
                      </div>
                      <p class="text-[11px] text-[#4B6382] leading-relaxed">
                        {hasSmtp ? 'Live SMTP relay configured with branded HTML template.' : 'Sandbox mode active. Logs codes to console for rapid development.'}
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'smtp'}
                        class="text-xs text-[#1677FF] hover:text-[#1162DB] font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Test Email Dispatch</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>

                  <!-- Service 4: Telegram Official Bot -->
                  <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full {hasTelegramBot || telegramBotToken ? 'bg-emerald-500' : 'bg-[#5E7694]'}"></span>
                        <h4 class="text-xs font-bold text-[#102A56]">Telegram Bot &amp; Webhook Hub</h4>
                      </div>
                      <p class="text-[11px] text-[#4B6382] leading-relaxed">
                        24/7 client assistant for instant chat, slash commands (/status, /agents), and image generation (/image).
                      </p>
                      <button
                        type="button"
                        onclick={() => activeAdminTab = 'telegram'}
                        class="text-xs text-[#1677FF] hover:text-[#1162DB] font-bold flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <span>Manage Telegram</span>
                        <Icon name="ArrowRight" size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Command Action Shortcuts -->
              <div class="p-6 rounded-3xl ui-banner-navy text-white space-y-4">
                <div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#38CFFF]">Quick Operations Shortcuts</h3>
                  <p class="text-xs text-white/80 mt-0.5">One-click operational tasks for rapid testing and deployment.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onclick={() => activeAdminTab = 'users'}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="UserCheck" size={16} class="text-[#38CFFF] mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Assign User Access</h4>
                    <p class="text-[10px] text-white/70">Grant Plan &amp; Store Bots to any email</p>
                  </button>

                  <button
                    type="button"
                    onclick={() => activeAdminTab = 'smtp'}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="Mail" size={16} class="text-[#38CFFF] mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Send Test OTP</h4>
                    <p class="text-[10px] text-white/70">Dispatch 6-digit test email</p>
                  </button>

                  <button
                    type="button"
                    onclick={enableAllModels}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="Bot" size={16} class="text-emerald-400 mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Enable All Models</h4>
                    <p class="text-[10px] text-white/70">Turn on all 8 engines</p>
                  </button>

                  <button
                    type="button"
                    onclick={copyVercelEnv}
                    class="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <Icon name="Copy" size={16} class="text-[#38CFFF] mb-1.5" />
                    <h4 class="text-xs font-bold text-white">Export .env</h4>
                    <p class="text-[10px] text-white/70">Copy keys for Vercel deployment</p>
                  </button>
                </div>
              </div>

            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 1a. USER ACCESS & BOT STORE ASSIGNMENT TAB -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'users'}
            <div class="space-y-6 animate-in fade-in duration-200">
              <!-- Header Banner -->
              <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3.5">
                  <div class="w-11 h-11 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shrink-0">
                    <Icon name="UserCheck" size={22} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] uppercase">User Access Control</span>
                      <h2 class="text-base sm:text-lg font-extrabold text-[#102A56]">Assign Plans &amp; Bot Store Agents to Any User</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-1">
                      Directly assign a subscription plan (BYOK / All-Inclusive Cloud) and unlock any Bot Store agent for any user by email.
                    </p>
                  </div>
                </div>

                {#if $currentUser?.email}
                  <button
                    type="button"
                    onclick={fillMyCurrentEmail}
                    class="px-4 py-2.5 rounded-xl bg-[#F3F8FF] hover:bg-[#E3ECF7] border border-[#E3ECF7] text-[#1677FF] text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Icon name="User" size={14} />
                    <span>Use My Account ({$currentUser.email})</span>
                  </button>
                {/if}
              </div>

              {#if grantFeedback}
                <div class="p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-2xs {grantFeedbackType === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}">
                  <div class="flex items-center gap-2">
                    <Icon name={grantFeedbackType === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={18} />
                    <span>{grantFeedback}</span>
                  </div>
                  <button type="button" onclick={() => grantFeedback = ''} class="p-1 rounded-lg hover:bg-black/5">
                    <Icon name="X" size={14} />
                  </button>
                </div>
              {/if}

              <!-- Main 2-Column Layout -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <!-- LEFT: GRANT FORM (7 COLUMNS) -->
                <div class="lg:col-span-7 ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6">
                  <div class="flex items-center justify-between border-b border-[#E3ECF7] pb-4">
                    <div class="flex items-center gap-2">
                      <Icon name="Crown" size={18} class="text-[#1677FF]" />
                      <h3 class="text-sm font-bold text-[#102A56]">1. User Account &amp; Plan Assignment</h3>
                    </div>
                    <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Instant Activation
                    </span>
                  </div>

                  <!-- User Email & Name -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="grant-email" class="text-xs font-bold text-[#102A56]">
                        User Email Address <span class="text-rose-500">*</span>
                      </label>
                      <input
                        id="grant-email"
                        type="email"
                        bind:value={grantEmail}
                        placeholder="user@gmail.com (Any user email)"
                        class="ui-input px-3.5 py-2.5 text-xs font-semibold"
                      />
                      <p class="text-[10px] text-[#5E7694]">The user will automatically receive this plan &amp; bot access upon login.</p>
                    </div>

                    <div class="space-y-1.5">
                      <label for="grant-name" class="text-xs font-bold text-[#102A56]">
                        User Name <span class="text-[#5E7694] font-normal">(Optional)</span>
                      </label>
                      <input
                        id="grant-name"
                        type="text"
                        bind:value={grantName}
                        placeholder="e.g. Farhan Ayan"
                        class="ui-input px-3.5 py-2.5 text-xs"
                      />
                      <p class="text-[10px] text-[#5E7694]">Optional display name for the user directory.</p>
                    </div>
                  </div>

                  <!-- Plan Status & Tier Selector -->
                  <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
                    <div class="flex items-center justify-between">
                      <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">2. Select Subscription Plan</h4>
                      <label class="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" bind:checked={grantIsSubscribed} class="rounded text-[#1677FF] focus:ring-[#1677FF]" />
                        <span class="text-xs font-bold {grantIsSubscribed ? 'text-emerald-600' : 'text-rose-600'}">
                          {grantIsSubscribed ? '● Plan Active' : '○ Plan Inactive'}
                        </span>
                      </label>
                    </div>

                    <!-- Plan Tier Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <!-- Starter Plan (byok_starter) -->
                      <button
                        type="button"
                        onclick={() => { grantTier = 'byok_starter'; grantIsSubscribed = true; }}
                        class="p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer {grantTier === 'byok_starter' && grantIsSubscribed ? 'border-[#1677FF] bg-[#F3F8FF] shadow-2xs' : 'border-[#E3ECF7] bg-white hover:border-[#C8D8EC]'}"
                      >
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3F8FF] text-[#102A56] border border-[#E3ECF7]">
                            {editablePlans.byok_starter?.badge || 'STARTER'}
                          </span>
                          {#if grantTier === 'byok_starter' && grantIsSubscribed}
                            <Icon name="CheckCircle2" size={16} class="text-[#1677FF]" />
                          {/if}
                        </div>
                        <h5 class="text-xs sm:text-sm font-extrabold text-[#102A56]">{editablePlans.byok_starter?.name || 'Starter Plan'}</h5>
                        <p class="text-[10px] text-[#4B6382] mt-0.5">BDT {editablePlans.byok_starter?.monthlyPrice || 499}/mo • Single Key BYOK</p>
                      </button>

                      <!-- Pro Plan (byok_pro) -->
                      <button
                        type="button"
                        onclick={() => { grantTier = 'byok_pro'; grantIsSubscribed = true; }}
                        class="p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer {(grantTier === 'byok_pro' || grantTier === 'byok') && grantIsSubscribed ? 'border-[#1677FF] bg-[#F3F8FF] shadow-2xs' : 'border-[#E3ECF7] bg-white hover:border-[#C8D8EC]'}"
                      >
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1677FF]/10 text-[#1677FF] border border-[#1677FF]/20">
                            {editablePlans.byok_pro?.badge || 'PRO'}
                          </span>
                          {#if (grantTier === 'byok_pro' || grantTier === 'byok') && grantIsSubscribed}
                            <Icon name="CheckCircle2" size={16} class="text-[#1677FF]" />
                          {/if}
                        </div>
                        <h5 class="text-xs sm:text-sm font-extrabold text-[#102A56]">{editablePlans.byok_pro?.name || 'Pro Plan'}</h5>
                        <p class="text-[10px] text-[#4B6382] mt-0.5">BDT {editablePlans.byok_pro?.monthlyPrice || 899}/mo • Multi-Key & Failover</p>
                      </button>

                      <!-- Managed All-Inclusive Tier -->
                      <button
                        type="button"
                        onclick={() => { grantTier = 'managed'; grantIsSubscribed = true; }}
                        class="p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer {grantTier === 'managed' && grantIsSubscribed ? 'border-[#1677FF] bg-[#F3F8FF] shadow-2xs' : 'border-[#E3ECF7] bg-white hover:border-[#C8D8EC]'}"
                      >
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38CFFF]/20 text-[#102A56] border border-[#38CFFF]/30">
                            {editablePlans.managed?.badge || 'MANAGED'}
                          </span>
                          {#if grantTier === 'managed' && grantIsSubscribed}
                            <Icon name="CheckCircle2" size={16} class="text-[#1677FF]" />
                          {/if}
                        </div>
                        <h5 class="text-xs sm:text-sm font-extrabold text-[#102A56]">{editablePlans.managed?.name || 'Cloud Managed'}</h5>
                        <p class="text-[10px] text-[#4B6382] mt-0.5">BDT {editablePlans.managed?.monthlyPrice || 1499}/mo • Zero API Keys</p>
                      </button>
                    </div>

                    <!-- Billing Duration Selector -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                      <div>
                        <span class="text-xs font-bold text-[#102A56] block">Plan Validity / Billing Cycle</span>
                        <span class="text-[11px] text-[#4B6382]">Select monthly or annual billing cycle</span>
                      </div>
                      <div class="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onclick={() => grantInterval = 'monthly'}
                          class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center {grantInterval === 'monthly' ? 'bg-[#102A56] text-white shadow-2xs' : 'bg-white text-[#4B6382] border border-[#E3ECF7]'}"
                        >
                          1 Month (30d)
                        </button>
                        <button
                          type="button"
                          onclick={() => grantInterval = 'yearly'}
                          class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center {grantInterval === 'yearly' ? 'bg-[#1677FF] text-white shadow-2xs' : 'bg-white text-[#4B6382] border border-[#E3ECF7]'}"
                        >
                          1 Year VIP (365d)
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Bot Store Bots Selector -->
                  <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">
                          3. Assign Bot Store Add-on Agents ({grantSelectedBots.length} / {STORE_BOTS.length} Selected)
                        </h4>
                        <p class="text-[11px] text-[#4B6382] mt-0.5">
                          Selected store bots will be unlocked inside the user's Web Dashboard.
                        </p>
                      </div>
                      {#if STORE_BOTS.length > 0}
                        <div class="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onclick={selectAllGrantBots}
                            class="px-3 py-1.5 rounded-xl bg-[#F3F8FF] hover:bg-[#E3ECF7] text-[#1677FF] border border-[#E3ECF7] text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Select All Bots
                          </button>
                          <button
                            type="button"
                            onclick={clearAllGrantBots}
                            class="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3F8FF] text-[#4B6382] border border-[#E3ECF7] text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                      {/if}
                    </div>

                    {#if STORE_BOTS.length === 0}
                      <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-dashed border-[#C8D8EC] text-center space-y-1">
                        <p class="text-xs font-bold text-[#102A56]">No Add-on Bots in Store Yet (0 Bots)</p>
                        <p class="text-[11px] text-[#4B6382]">Once custom autonomous bots are added to the store, they can be assigned to any user here.</p>
                      </div>
                    {:else}
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {#each STORE_BOTS as bot (bot.id)}
                          {@const isBotSelected = grantSelectedBots.includes(bot.id)}
                          <button
                            type="button"
                            onclick={() => toggleGrantBot(bot.id)}
                            class="p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer {isBotSelected ? 'border-[#1677FF] bg-[#F3F8FF] shadow-2xs' : 'border-[#E3ECF7] bg-white hover:border-[#C8D8EC] opacity-75'}"
                          >
                            <img src={bot.avatar} alt={bot.name} class="w-10 h-10 rounded-xl object-cover border border-[#E3ECF7] shrink-0 mt-0.5" />
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center justify-between gap-1">
                                <span class="text-xs font-extrabold text-[#102A56] truncate">{bot.name}</span>
                                <span class="w-4 h-4 rounded-md flex items-center justify-center shrink-0 {isBotSelected ? 'bg-[#1677FF] text-white' : 'border border-[#C8D8EC] bg-[#F3F8FF]'}">
                                  {#if isBotSelected}
                                    <Icon name="Check" size={11} />
                                  {/if}
                                </span>
                              </div>
                              <p class="text-[11px] text-[#1677FF] font-semibold truncate">{bot.role}</p>
                              <p class="text-[10px] text-[#5E7694] mt-0.5">Store Value: BDT {bot.monthlyPrice}/mo</p>
                            </div>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <!-- Optional Admin Note -->
                  <div class="space-y-1.5 pt-2 border-t border-[#E3ECF7]">
                    <label for="grant-note" class="text-xs font-bold text-[#102A56]">Admin Note / Reference (Optional)</label>
                    <input
                      id="grant-note"
                      type="text"
                      bind:value={grantNote}
                      placeholder="e.g. Manual bKash payment / Partner VIP Access"
                      class="ui-input px-3.5 py-2.5 text-xs"
                    />
                  </div>

                  <!-- Submit Action Footer -->
                  <div class="pt-3 border-t border-[#E3ECF7] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p class="text-[11px] text-[#4B6382]">
                      Changes apply immediately across Web, WhatsApp &amp; Telegram.
                    </p>
                    <button
                      type="button"
                      onclick={handleGrantUserAccess}
                      disabled={isGrantingUser}
                      class="w-full sm:w-auto px-6 py-3 rounded-xl blue-btn text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {#if isGrantingUser}
                        <Icon name="Loader2" size={15} class="animate-spin" />
                        <span>Activating Access...</span>
                      {:else}
                        <Icon name="UserCheck" size={15} />
                        <span>Grant Plan &amp; Bot Access Now</span>
                      {/if}
                    </button>
                  </div>
                </div>

                <!-- RIGHT: USERS & ACTIVE GRANTS DIRECTORY (5 COLUMNS) -->
                <div class="lg:col-span-5 ui-card-static rounded-3xl p-6 space-y-5">
                  <div class="flex items-center justify-between border-b border-[#E3ECF7] pb-4">
                    <div>
                      <h3 class="text-sm font-bold text-[#102A56] flex items-center gap-2">
                        <Icon name="User" size={16} class="text-[#1677FF]" />
                        <span>Users &amp; Granted Access ({combinedUsersList.length})</span>
                      </h3>
                      <p class="text-[11px] text-[#4B6382] mt-0.5">Click Edit on any user to modify their plan or bot access.</p>
                    </div>
                  </div>

                  <!-- Search Input -->
                  <div class="relative">
                    <input
                      type="text"
                      bind:value={userSearchQuery}
                      placeholder="Search user by email or name..."
                      class="ui-input !pl-9 pr-3.5 py-2.5 text-xs"
                    />
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E7694]">
                      <Icon name="Search" size={14} />
                    </div>
                  </div>

                  <!-- Users List -->
                  {#if combinedUsersList.length === 0}
                    <div class="text-center py-12 px-4 rounded-2xl bg-[#F3F8FF] border border-dashed border-[#C8D8EC] space-y-2">
                      <Icon name="UserCheck" size={28} class="text-[#1677FF] mx-auto" />
                      <p class="text-xs font-bold text-[#102A56]">No users listed yet</p>
                      <p class="text-[11px] text-[#4B6382]">
                        Enter any user's email in the form on the left to assign a plan and bots.
                      </p>
                    </div>
                  {:else}
                    <div class="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                      {#each combinedUsersList as u (u.email)}
                        <div class="p-4 rounded-2xl border transition-all {grantEmail.toLowerCase() === u.email ? 'border-[#1677FF] bg-[#F3F8FF] shadow-2xs' : 'border-[#E3ECF7] bg-[#F3F8FF]/60 hover:border-[#C8D8EC]'} space-y-3">
                          <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                              <div class="flex items-center gap-1.5 flex-wrap">
                                <h4 class="text-xs font-bold text-[#102A56] truncate">{u.name}</h4>
                                {#if u.isSubscribed}
                                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase {u.tier === 'managed' ? 'bg-[#1677FF]/10 text-[#1677FF] border border-[#1677FF]/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
                                    {u.tier === 'managed' ? 'All-Inclusive Cloud' : 'BYOK Multi-Engine'} ({u.interval})
                                  </span>
                                {:else}
                                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                    No Active Plan
                                  </span>
                                {/if}
                              </div>
                              <p class="text-[11px] font-mono text-[#4B6382] truncate mt-0.5">{u.email}</p>
                            </div>

                            <button
                              type="button"
                              onclick={() => selectUserForGrant(u.email, u.name)}
                              class="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] hover:border-[#1677FF]/40 text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                          </div>

                          <!-- Unlocked Store Bots Badges -->
                          {#if STORE_BOTS.length > 0}
                            <div class="flex flex-wrap items-center gap-1.5">
                              <span class="text-[10px] font-bold text-[#5E7694]">Store Bots ({u.unlockedStoreBots.length}/{STORE_BOTS.length}):</span>
                              {#if u.unlockedStoreBots.length === 0}
                                <span class="text-[10px] text-[#5E7694] italic">None unlocked</span>
                              {:else}
                                {#each u.unlockedStoreBots as botId}
                                  {@const botObj = STORE_BOTS.find((b) => b.id === botId)}
                                  {#if botObj}
                                    <span class="px-2 py-0.5 rounded-md bg-white border border-[#E3ECF7] text-[10px] font-semibold text-[#102A56]">
                                      {botObj.name}
                                    </span>
                                  {/if}
                                {/each}
                              {/if}
                            </div>
                          {/if}

                          {#if u.note}
                            <p class="text-[10px] text-[#4B6382] bg-white px-2.5 py-1 rounded-lg border border-[#E3ECF7]">
                              📝 {u.note}
                            </p>
                          {/if}

                          <!-- Quick Row Actions -->
                          <div class="pt-2 border-t border-[#E3ECF7] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onclick={() => handleQuickUnlockAllBots(u.email, u.name)}
                              class="text-[11px] font-bold text-[#1677FF] hover:text-[#1162DB] flex items-center gap-1 cursor-pointer"
                            >
                              <Icon name="Zap" size={12} />
                              <span>{STORE_BOTS.length > 0 ? 'Unlock Plan + All Bots' : 'Activate VIP Plan'}</span>
                            </button>

                            {#if u.isSubscribed || u.unlockedStoreBots.length > 0}
                              <button
                                type="button"
                                onclick={() => handleRevokeUserAccess(u.email)}
                                class="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                              >
                                Revoke Access
                              </button>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>

              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 1b. PLANS & PRICING TAB -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'plans'}
            <div class="space-y-6 animate-in fade-in duration-200">
              <!-- Quick Banner to Assign Plan to a Specific User -->
              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 text-xs text-[#102A56]">
                  <Icon name="UserCheck" size={18} class="text-[#1677FF] shrink-0" />
                  <span>
                    <strong>Want to manually assign a plan or store bots to a specific user for free?</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onclick={() => activeAdminTab = 'users'}
                  class="px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Go to User Access &amp; Bots</span>
                  <Icon name="ArrowRight" size={13} />
                </button>
              </div>

              <!-- Header Card -->
              <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shrink-0">
                    <Icon name="Receipt" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] uppercase">Pricing System</span>
                      <h2 class="text-base font-bold text-[#102A56]">Subscription Plans &amp; Details Manager</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-0.5">
                      Customize plan pricing, descriptions, and feature bullet points directly from the Admin Panel. Updates take effect immediately on the homepage and dashboard.
                    </p>
                  </div>
                </div>

                <!-- Plan Switcher Pills (3 Plans) -->
                <div class="flex items-center p-1 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] shrink-0 gap-1 flex-wrap">
                  <button
                    type="button"
                    onclick={() => activePlanTab = 'byok_starter'}
                    class="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 {activePlanTab === 'byok_starter' ? 'bg-[#102A56] text-white shadow-2xs' : 'text-[#4B6382] hover:text-[#102A56]'}"
                  >
                    <span class="w-2 h-2 rounded-full {editablePlans.byok_starter?.isEnabled !== false ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
                    <span>Starter Plan</span>
                  </button>
                  <button
                    type="button"
                    onclick={() => activePlanTab = 'byok_pro'}
                    class="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 {activePlanTab === 'byok_pro' ? 'bg-[#1677FF] text-white shadow-sm' : 'text-[#4B6382] hover:text-[#102A56]'}"
                  >
                    <span class="w-2 h-2 rounded-full {editablePlans.byok_pro?.isEnabled !== false ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
                    <span>Pro Plan</span>
                  </button>
                  <button
                    type="button"
                    onclick={() => activePlanTab = 'managed'}
                    class="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 {activePlanTab === 'managed' ? 'bg-[#0E7490] text-white shadow-sm' : 'text-[#4B6382] hover:text-[#102A56]'}"
                  >
                    <span class="w-2 h-2 rounded-full {editablePlans.managed?.isEnabled !== false ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
                    <span>Cloud Managed</span>
                  </button>
                </div>
              </div>

              <!-- Dedicated Switch Card: Workflow Studio & Customization (User Access Control) -->
              <div class="p-4 sm:p-6 rounded-3xl {workflowCustomizationUserEnabled ? 'bg-[#F3F8FF] border border-[#CFE2FA]' : 'bg-amber-50/70 border border-amber-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-2xs">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="relative flex h-3 w-3">
                      {#if workflowCustomizationUserEnabled}
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      {:else}
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      {/if}
                    </span>
                    <h3 class="text-sm sm:text-base font-bold text-[#102A56]">
                      Workflow Studio &amp; Customization (User Access Control)
                    </h3>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide {workflowCustomizationUserEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}">
                      {workflowCustomizationUserEnabled ? 'Active for Users' : 'Admin-Only Access'}
                    </span>
                  </div>
                  <p class="text-xs text-[#4B6382] leading-relaxed max-w-2xl">
                    Toggle whether regular users can access the Workflow Studio. When turned OFF, Workflow Studio is completely locked and hidden for regular users, while Admins always retain full access to open and customize workflows.
                  </p>
                </div>

                <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={workflowCustomizationUserEnabled} class="sr-only peer" />
                    <div class="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1677FF]"></div>
                  </label>
                  <button
                    type="button"
                    onclick={saveSettings}
                    disabled={isSaving}
                    class="px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {#if isSaving}
                      <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    {:else}
                      <Icon name="Save" size={14} />
                      <span>Save Setting</span>
                    {/if}
                  </button>
                </div>
              </div>

              <!-- Main Editor & Live Preview Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <!-- Left: Plan Form Editor (7 Columns) -->
                <div class="lg:col-span-7 ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6">
                  
                  <div class="flex items-center justify-between border-b border-[#E3ECF7] pb-4">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full {activePlanTab === 'managed' ? 'bg-[#38CFFF]' : activePlanTab === 'byok_pro' ? 'bg-[#1677FF]' : 'bg-[#102A56]'}"></span>
                      <h3 class="text-sm font-bold text-[#102A56]">
                        Editing: <span class="text-[#1677FF] font-extrabold">{editablePlans[activePlanTab]?.name || activePlanTab}</span>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onclick={() => resetPlanDefaults(activePlanTab)}
                      class="text-xs text-[#4B6382] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      title="Reset this plan to factory defaults"
                    >
                      <Icon name="RefreshCw" size={12} />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  <!-- Plan Status & Visibility Control Card -->
                  <div
                    class="p-4 sm:p-5 rounded-2xl border transition-all shadow-xs {isCurrentPlanActive
                      ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30'
                      : 'bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border-rose-500/30'}"
                  >
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2.5 flex-wrap">
                          <span class="relative flex h-3 w-3">
                            {#if isCurrentPlanActive}
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            {:else}
                              <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            {/if}
                          </span>
                          <h4 class="text-sm font-extrabold text-[#102A56] flex items-center gap-2">
                            <span>Plan Status:</span>
                            <span class={isCurrentPlanActive ? 'text-emerald-700' : 'text-rose-700'}>
                              {isCurrentPlanActive ? 'Active & Visible to Public Users' : 'Hidden / Deleted from Users'}
                            </span>
                          </h4>
                          <span
                            class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide {isCurrentPlanActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'}"
                          >
                            {isCurrentPlanActive ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                        <p class="text-xs text-[#4B6382] leading-relaxed">
                          {#if isCurrentPlanActive}
                            This plan is currently <strong class="text-emerald-700 font-bold">LIVE &amp; VISIBLE</strong> on the Homepage, <code class="text-[#1677FF] font-mono">/plans</code> page, and Dashboard Billing.
                          {:else}
                            This plan is currently <strong class="text-rose-700 font-bold">HIDDEN</strong> from public users.
                          {/if}
                        </p>
                      </div>

                      <div class="flex items-center gap-3 shrink-0 self-end sm:self-center flex-wrap">
                        <!-- Visibility Switch -->
                        <label class="inline-flex items-center gap-2.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#CFE2FA] shadow-2xs hover:border-[#1677FF]/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={isCurrentPlanActive}
                            onchange={() => togglePlanVisibility(activePlanTab)}
                            class="w-4 h-4 text-[#1677FF] rounded cursor-pointer"
                          />
                          <span class="text-xs font-bold text-[#102A56] select-none">
                            Visible to Public Users
                          </span>
                        </label>

                        <!-- Action Button: Delete or Restore -->
                        {#if isCurrentPlanActive}
                          <button
                            type="button"
                            onclick={() => deleteOrHidePlan(activePlanTab)}
                            class="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Hide this plan from all public user pages"
                          >
                            <Icon name="Trash2" size={13} />
                            <span>Delete Plan (Hide from Users)</span>
                          </button>
                        {:else}
                          <button
                            type="button"
                            onclick={() => restorePlan(activePlanTab)}
                            class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            title="Restore this plan and make it visible again"
                          >
                            <Icon name="RotateCcw" size={13} />
                            <span>Restore Plan</span>
                          </button>
                        {/if}
                      </div>
                    </div>
                  </div>

                  <!-- General Info Group -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">1. Basic Plan Identifiers</h4>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <!-- Plan Name -->
                      <div class="space-y-1.5">
                        <label for="plan-name" class="text-xs font-bold text-[#102A56]">Plan Display Name</label>
                        <input
                          id="plan-name"
                          type="text"
                          bind:value={editablePlans[activePlanTab].name}
                          placeholder="e.g. BYOK Starter"
                          class="ui-input bg-white px-3.5 py-2.5 text-xs font-semibold"
                        />
                      </div>

                      <!-- Plan Badge -->
                      <div class="space-y-1.5">
                        <label for="plan-badge" class="text-xs font-bold text-[#102A56]">Category Tag / Badge</label>
                        <input
                          id="plan-badge"
                          type="text"
                          bind:value={editablePlans[activePlanTab].badge}
                          placeholder="e.g. Essential BYOK"
                          class="ui-input bg-white px-3.5 py-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <!-- Highlight Ribbon (Optional) -->
                    <div class="space-y-1.5">
                      <label for="plan-ribbon" class="text-xs font-bold text-[#102A56]">
                        Promotional Top Ribbon <span class="text-[#5E7694] font-normal text-[11px]">(Optional — e.g. "⚡ Power User Choice")</span>
                      </label>
                      <input
                        id="plan-ribbon"
                        type="text"
                        bind:value={editablePlans[activePlanTab].highlightBadge}
                        placeholder="Leave blank for standard card"
                        class="ui-input bg-white px-3.5 py-2.5 text-xs"
                      />
                    </div>

                    <!-- Description -->
                    <div class="space-y-1.5">
                      <label for="plan-desc" class="text-xs font-bold text-[#102A56]">Plan Description / Pitch</label>
                      <textarea
                        id="plan-desc"
                        rows="2"
                        bind:value={editablePlans[activePlanTab].description}
                        placeholder="Compelling description of who this plan is for..."
                        class="ui-textarea bg-white p-3 text-xs resize-none leading-relaxed"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Pricing Structure Group (BDT) -->
                  <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">2. Pricing Rates (BDT)</h4>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <!-- Monthly Price -->
                      <div class="p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-1.5">
                        <label for="monthly-price" class="text-[11px] font-bold text-[#102A56] block">Monthly Price (BDT)</label>
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-[#5E7694]">BDT</span>
                          <input
                            id="monthly-price"
                            type="number"
                            min="0"
                            bind:value={editablePlans[activePlanTab].monthlyPrice}
                            class="ui-input bg-white !px-2.5 !py-1.5 text-sm font-bold"
                          />
                        </div>
                        <span class="text-[10px] text-[#5E7694] block">Monthly billing rate</span>
                      </div>

                      <!-- Yearly Monthly Equivalent -->
                      <div class="p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-1.5">
                        <label for="yearly-monthly" class="text-[11px] font-bold text-[#102A56] block">Yearly Rate (/mo)</label>
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-[#5E7694]">BDT</span>
                          <input
                            id="yearly-monthly"
                            type="number"
                            min="0"
                            bind:value={editablePlans[activePlanTab].yearlyMonthlyPrice}
                            class="ui-input bg-white !px-2.5 !py-1.5 text-sm font-bold"
                          />
                        </div>
                        <span class="text-[10px] text-[#5E7694] block">Monthly equivalent on annual plan</span>
                      </div>

                      <!-- Yearly Total Billed -->
                      <div class="p-3.5 rounded-2xl bg-[#1677FF]/8 border border-[#1677FF]/25 space-y-1.5">
                        <label for="yearly-total" class="text-[11px] font-bold text-[#102A56] block">Yearly Total Billed</label>
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-[#1677FF]">BDT</span>
                          <input
                            id="yearly-total"
                            type="number"
                            min="0"
                            bind:value={editablePlans[activePlanTab].yearlyTotal}
                            class="ui-input bg-white border-[#1677FF]/35 !px-2.5 !py-1.5 text-sm font-bold"
                          />
                        </div>
                        <span class="text-[10px] text-[#1677FF] font-medium block">Charged at annual checkout</span>
                      </div>
                    </div>
                  </div>

                  <!-- 3. Core Feature Capabilities Toggles -->
                  <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
                    <div class="flex items-center justify-between">
                      <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">3. Plan Feature Capabilities</h4>
                      <span class="text-[11px] font-semibold text-[#1677FF]">Access Privileges</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <!-- AI CEO -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">Master AI CEO</span>
                          <span class="text-[10px] text-[#5E7694] block">Central brain orchestration</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.aiCeo} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>

                      <!-- WhatsApp -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">WhatsApp Engine</span>
                          <span class="text-[10px] text-[#5E7694] block">24/7 client assistant</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.whatsapp} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>

                      <!-- Telegram -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">Telegram Bot</span>
                          <span class="text-[10px] text-[#5E7694] block">Official channel integration</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.telegram} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>

                      <!-- Multi-Key Vault -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">Multi-Key Vault</span>
                          <span class="text-[10px] text-[#5E7694] block">Round-robin key rotation (BYOK Pro)</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.multiKeyVault} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>

                      <!-- Multi-Model Failover -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">Multi-Model Failover</span>
                          <span class="text-[10px] text-[#5E7694] block">OpenRouter model chain & failover</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.multiModelFailover} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>

                      <!-- Commercial Images -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">Commercial Images & Logos</span>
                          <span class="text-[10px] text-[#5E7694] block">Helpers #34 & #35 generation</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.commercialImages} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>

                      <!-- Custom Prompts -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">Custom Master Prompts</span>
                          <span class="text-[10px] text-[#5E7694] block">CEO system prompt in settings</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.customPrompts} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>

                      <!-- Priority Support -->
                      <label class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-between cursor-pointer hover:border-[#1677FF]/40 transition-colors">
                        <div class="space-y-0.5">
                          <span class="text-xs font-bold text-[#102A56] block">Priority Support</span>
                          <span class="text-[10px] text-[#5E7694] block">Fast-lane response support</span>
                        </div>
                        <input type="checkbox" bind:checked={editablePlans[activePlanTab].featureToggles.prioritySupport} class="w-4 h-4 text-[#1677FF] rounded cursor-pointer" />
                      </label>
                    </div>
                  </div>

                  <!-- 4. AI Helpers Access Matrix -->
                  <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">4. AI Helpers Access Matrix ({ALL_TOOLS.length} Total)</h4>
                        <p class="text-[11px] text-[#4B6382]">Control which AI specialists are unlocked for this subscription tier.</p>
                      </div>

                      <!-- Master Toggle -->
                      <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={editablePlans[activePlanTab].featureToggles.allHelpersEnabled}
                          onchange={(e) => {
                            const checked = e.currentTarget.checked;
                            editablePlans[activePlanTab].featureToggles.allHelpersEnabled = checked;
                            if (!checked && !Array.isArray(editablePlans[activePlanTab].featureToggles.enabledHelpers)) {
                              editablePlans[activePlanTab].featureToggles.enabledHelpers = ALL_TOOLS.map((t) => t.id);
                            }
                          }}
                          class="w-4 h-4 text-[#1677FF] rounded cursor-pointer"
                        />
                        <span class="text-xs font-extrabold text-[#102A56]">All {ALL_TOOLS.length} Helpers Enabled</span>
                      </label>
                    </div>

                    {#if !editablePlans[activePlanTab].featureToggles.allHelpersEnabled}
                      <div class="space-y-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#CFE2FA] animate-in fade-in duration-200">
                        <!-- Controls: Search, Category Filter, Select All / Clear All -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div class="relative flex-1">
                            <Icon name="Search" size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E7694]" />
                            <input
                              type="text"
                              bind:value={helperSearch}
                              placeholder="Search helpers by name, code (#01), or category..."
                              class="w-full ui-input bg-white pl-8 pr-3 py-2 text-xs"
                            />
                          </div>
                          <div class="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onclick={() => selectAllHelpersForPlan(activePlanTab)}
                              class="px-2.5 py-1.5 rounded-lg bg-white border border-[#CFE2FA] text-[#1677FF] text-[11px] font-bold hover:bg-[#F3F8FF] transition-all cursor-pointer"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onclick={() => clearAllHelpersForPlan(activePlanTab)}
                              class="px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 text-[11px] font-bold hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        <!-- Category Filter Chips -->
                        <div use:draggableScroll class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar cursor-grab active:cursor-grabbing select-none">
                          <button
                            type="button"
                            onclick={() => helperCategoryFilter = 'all'}
                            class="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all {helperCategoryFilter === 'all' ? 'bg-[#102A56] text-white' : 'bg-white text-[#4B6382] border border-[#CFE2FA]'}"
                          >
                            All ({ALL_TOOLS.length})
                          </button>
                          {#each CATEGORIES as cat}
                            <button
                              type="button"
                              onclick={() => helperCategoryFilter = cat.id}
                              class="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all {helperCategoryFilter === cat.id ? 'bg-[#1677FF] text-white' : 'bg-white text-[#4B6382] border border-[#CFE2FA]'}"
                            >
                              {cat.name} ({cat.count})
                            </button>
                          {/each}
                        </div>

                        <!-- Helpers Checklist Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                          {#each filteredMatrixHelpers as helper (helper.id)}
                            {@const isEnabled = editablePlans[activePlanTab].featureToggles.enabledHelpers?.includes(helper.id)}
                            <button
                              type="button"
                              onclick={() => toggleHelperForPlan(activePlanTab, helper.id)}
                              class="p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer {isEnabled ? 'bg-white border-[#1677FF] shadow-2xs' : 'bg-white/60 border-[#E3ECF7] opacity-60'}"
                            >
                              <div class="flex items-center gap-2 min-w-0">
                                <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#102A56] text-white shrink-0">
                                  {helper.code}
                                </span>
                                <div class="min-w-0">
                                  <p class="text-xs font-bold text-[#102A56] truncate">{helper.name}</p>
                                  <p class="text-[10px] text-[#5E7694] truncate">{helper.categoryName}</p>
                                </div>
                              </div>
                              <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 {isEnabled ? 'border-[#1677FF] bg-[#1677FF] text-white' : 'border-[#CFE2FA]' }">
                                {#if isEnabled}
                                  <Icon name="Check" size={10} />
                                {/if}
                              </span>
                            </button>
                          {/each}
                        </div>
                        <p class="text-[10px] text-[#5E7694] text-right">
                          Currently Enabled: {editablePlans[activePlanTab].featureToggles.enabledHelpers?.length || 0} of {ALL_TOOLS.length} helpers
                        </p>
                      </div>
                    {/if}
                  </div>

                  <!-- 5. Tool Connectors Access Matrix -->
                  <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">5. Tool Connectors Access Matrix ({TOOL_CONNECTORS.length} Total)</h4>
                        <p class="text-[11px] text-[#4B6382]">Control which enterprise tool connectors are unlocked for this subscription tier.</p>
                      </div>

                      <!-- Master Toggle -->
                      <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={editablePlans[activePlanTab].featureToggles.allToolsEnabled !== false}
                          onchange={(e) => {
                            const checked = e.currentTarget.checked;
                            editablePlans[activePlanTab].featureToggles.allToolsEnabled = checked;
                            if (!checked && !Array.isArray(editablePlans[activePlanTab].featureToggles.enabledTools)) {
                              editablePlans[activePlanTab].featureToggles.enabledTools = TOOL_CONNECTORS.map((t) => t.id);
                            }
                          }}
                          class="w-4 h-4 text-[#1677FF] rounded cursor-pointer"
                        />
                        <span class="text-xs font-extrabold text-[#102A56]">All {TOOL_CONNECTORS.length} Connectors Enabled</span>
                      </label>
                    </div>

                    {#if editablePlans[activePlanTab].featureToggles.allToolsEnabled === false}
                      <div class="space-y-3 p-4 rounded-2xl bg-[#F8FAFC] border border-[#CFE2FA] animate-in fade-in duration-200">
                        <!-- Controls: Search, Category Filter, Select All / Clear All -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div class="relative flex-1">
                            <Icon name="Search" size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E7694]" />
                            <input
                              type="text"
                              bind:value={planToolSearch}
                              placeholder="Search connectors by name, category, or service..."
                              class="w-full ui-input bg-white pl-8 pr-3 py-2 text-xs"
                            />
                          </div>
                          <div class="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onclick={() => selectAllToolsForPlan(activePlanTab)}
                              class="px-2.5 py-1.5 rounded-lg bg-white border border-[#CFE2FA] text-[#1677FF] text-[11px] font-bold hover:bg-[#F3F8FF] transition-all cursor-pointer"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onclick={() => clearAllToolsForPlan(activePlanTab)}
                              class="px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 text-[11px] font-bold hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        <!-- Category Filter Chips -->
                        <div use:draggableScroll class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar cursor-grab active:cursor-grabbing select-none">
                          <button
                            type="button"
                            onclick={() => planToolCategoryFilter = 'all'}
                            class="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all {planToolCategoryFilter === 'all' ? 'bg-[#102A56] text-white' : 'bg-white text-[#4B6382] border border-[#CFE2FA]'}"
                          >
                            All ({TOOL_CONNECTORS.length})
                          </button>
                          {#each TOOL_CONNECTOR_CATEGORIES as cat}
                            {@const catCount = TOOL_CONNECTORS.filter((t) => t.categoryId === cat.id).length}
                            <button
                              type="button"
                              onclick={() => planToolCategoryFilter = cat.id}
                              class="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all {planToolCategoryFilter === cat.id ? 'bg-[#1677FF] text-white' : 'bg-white text-[#4B6382] border border-[#CFE2FA]'}"
                            >
                              {cat.name} ({catCount})
                            </button>
                          {/each}
                        </div>

                        <!-- Tool Connectors Checklist Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                          {#each filteredPlanTools as tool (tool.id)}
                            {@const isEnabled = editablePlans[activePlanTab].featureToggles.enabledTools?.includes(tool.id)}
                            <button
                              type="button"
                              onclick={() => toggleToolForPlan(activePlanTab, tool.id)}
                              class="p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer {isEnabled ? 'bg-white border-[#1677FF] shadow-2xs' : 'bg-white/60 border-[#E3ECF7] opacity-60'}"
                            >
                              <div class="flex items-center gap-2 min-w-0">
                                <div class="w-6 h-6 rounded-lg bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center shrink-0 p-1">
                                  <BrandIcon name={tool.name} modelId={tool.id} icon={tool.icon} size={14} />
                                </div>
                                <div class="min-w-0">
                                  <p class="text-xs font-bold text-[#102A56] truncate">{tool.name}</p>
                                  <p class="text-[10px] text-[#5E7694] truncate">{tool.category}</p>
                                </div>
                              </div>
                              <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 {isEnabled ? 'border-[#1677FF] bg-[#1677FF] text-white' : 'border-[#CFE2FA]'}">
                                {#if isEnabled}
                                  <Icon name="Check" size={10} />
                                {/if}
                              </span>
                            </button>
                          {/each}
                        </div>
                        <p class="text-[10px] text-[#5E7694] text-right">
                          Currently Enabled: {editablePlans[activePlanTab].featureToggles.enabledTools?.length || 0} of {TOOL_CONNECTORS.length} connectors
                        </p>
                      </div>
                    {/if}
                  </div>

                  <!-- 6. Features List Group -->
                  <div class="space-y-4 pt-2 border-t border-[#E3ECF7]">
                    <div class="flex items-center justify-between">
                      <h4 class="text-xs font-bold uppercase tracking-wider text-[#5E7694]">6. Features &amp; Bullet Points</h4>
                      <span class="text-[11px] font-semibold text-[#4B6382]">{editablePlans[activePlanTab].features.length} features</span>
                    </div>

                    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {#each editablePlans[activePlanTab].features as feature, idx}
                        <div class="flex items-center gap-2 p-2 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] group">
                          <span class="text-xs font-bold text-[#5E7694] w-5 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            bind:value={editablePlans[activePlanTab].features[idx]}
                            class="flex-1 ui-input bg-white !px-2.5 !py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            onclick={() => removePlanFeature(activePlanTab, idx)}
                            class="p-1.5 rounded-lg text-[#5E7694] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                        class="flex-1 ui-input bg-white px-3.5 py-2.5 text-xs"
                      />
                      <button
                        type="button"
                        onclick={() => addPlanFeature(activePlanTab)}
                        disabled={!newFeatureText.trim()}
                        class="px-4 py-2.5 rounded-xl btn-navy text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <Icon name="Plus" size={14} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <!-- Save Button Footer -->
                  <div class="pt-4 border-t border-[#E3ECF7] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onclick={saveSettings}
                      disabled={isSaving}
                      class="px-6 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
                    <span class="text-xs font-bold uppercase tracking-wider text-[#5E7694] flex items-center gap-1.5">
                      <Icon name="Eye" size={14} class="text-[#1677FF]" />
                      <span>Live Customer View</span>
                    </span>

                    <!-- Preview Interval Toggle -->
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-semibold text-[#4B6382]">Preview:</span>
                      <button
                        type="button"
                        onclick={() => previewBillingInterval = previewBillingInterval === 'monthly' ? 'yearly' : 'monthly'}
                        class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border cursor-pointer {previewBillingInterval === 'yearly' ? 'bg-[#1677FF] text-white border-[#1677FF]' : 'bg-[#F3F8FF] text-[#102A56] border-[#E3ECF7]'}"
                      >
                        {previewBillingInterval}
                      </button>
                    </div>
                  </div>

                  <!-- Mockup Card -->
                  <div class="rounded-3xl bg-white border-2 {editablePlans[activePlanTab].highlightBadge ? 'border-[#1677FF] shadow-xl shadow-[#1677FF]/12' : 'border-[#E3ECF7] shadow-2xs'} p-6 sm:p-7 relative transition-all">
                    {#if editablePlans[activePlanTab].highlightBadge}
                      <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#1677FF] text-white text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                        {editablePlans[activePlanTab].highlightBadge}
                      </div>
                    {/if}

                    {#if editablePlans[activePlanTab]?.isEnabled === false}
                      <div class="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
                        <Icon name="EyeOff" size={16} class="shrink-0 text-rose-600" />
                        <span>This plan is currently HIDDEN from public users. Enable it to make it visible.</span>
                      </div>
                    {/if}

                    <div class="mb-4">
                      <span class="px-2.5 py-0.5 rounded-full {activePlanTab === 'managed' ? 'bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]' : 'bg-[#F3F8FF] text-[#102A56] border border-[#E3ECF7]'} text-[11px] font-bold">
                        {editablePlans[activePlanTab].badge}
                      </span>
                      <h4 class="text-xl font-extrabold text-[#102A56] mt-2.5">
                        {editablePlans[activePlanTab].name}
                      </h4>
                      <div class="flex items-baseline gap-1 mt-1.5">
                        <span class="text-3xl font-black text-[#102A56]">
                          BDT {previewBillingInterval === 'yearly' ? editablePlans[activePlanTab].yearlyMonthlyPrice.toLocaleString() : editablePlans[activePlanTab].monthlyPrice.toLocaleString()}
                        </span>
                        <span class="text-xs font-medium text-[#5E7694]">/mo</span>
                      </div>
                      {#if previewBillingInterval === 'yearly'}
                        <p class="text-[11px] text-[#4B6382] mt-0.5">
                          Billed annually (BDT {editablePlans[activePlanTab].yearlyTotal.toLocaleString()}/yr)
                        </p>
                      {/if}
                    </div>

                    <p class="text-xs text-[#4B6382] mb-3 leading-relaxed">
                      {editablePlans[activePlanTab].description}
                    </p>

                    <!-- Helper Count Preview Badge -->
                    <div class="mb-2 px-3 py-1.5 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] text-xs font-bold text-[#102A56] flex items-center gap-1.5">
                      <Icon name="Bot" size={14} class="text-[#1677FF]" />
                      {#if editablePlans[activePlanTab].featureToggles?.allHelpersEnabled !== false}
                        <span>All {ALL_TOOLS.length}+ AI Helpers Included</span>
                      {:else}
                        <span>{editablePlans[activePlanTab].featureToggles?.enabledHelpers?.length || 0} of {ALL_TOOLS.length} AI Helpers Included</span>
                      {/if}
                    </div>

                    <!-- Tool Connectors Count Preview Badge -->
                    <div class="mb-4 px-3 py-1.5 rounded-xl bg-[#F3F8FF] border border-[#CFE2FA] text-xs font-bold text-[#102A56] flex items-center gap-1.5">
                      <Icon name="Wrench" size={14} class="text-[#1677FF]" />
                      {#if editablePlans[activePlanTab].featureToggles?.allToolsEnabled !== false}
                        <span>All {TOOL_CONNECTORS.length}+ Enterprise Connectors</span>
                      {:else}
                        <span>{editablePlans[activePlanTab].featureToggles?.enabledTools?.length || 0} of {TOOL_CONNECTORS.length} Enterprise Connectors</span>
                      {/if}
                    </div>

                    <div class="space-y-2.5 border-t border-[#E3ECF7] pt-4">
                      {#each editablePlans[activePlanTab].features as feat}
                        <div class="flex items-start gap-2 text-xs text-[#102A56]">
                          <Icon name="Check" size={13} class="text-[#1677FF] shrink-0 mt-0.5" />
                          <span class="leading-tight">{feat}</span>
                        </div>
                      {/each}
                    </div>

                    <div class="mt-6 pt-4 border-t border-[#E3ECF7]">
                      <div class="w-full py-3 rounded-xl {activePlanTab === 'managed' ? 'blue-btn text-white' : 'btn-navy text-white'} font-bold text-xs text-center uppercase tracking-wider">
                        Subscribe with OPay
                      </div>
                    </div>
                  </div>

                  <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] text-[#102A56] text-xs space-y-1">
                    <p class="font-bold flex items-center gap-1.5 text-[#102A56]">
                      <Icon name="Sparkles" size={14} class="text-[#1677FF]" />
                      <span>Real-Time Synchronization:</span>
                    </p>
                    <p class="text-[11px] text-[#4B6382] leading-relaxed">
                      Clicking "Save Plan Changes" immediately updates pricing and features across the homepage, <code class="text-[#1677FF] font-mono">/plans</code> page, and user dashboard billing section.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- TOOL CONNECTORS & ENTERPRISE INTEGRATIONS TAB -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'tools'}
            <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
              
              <!-- Per-Plan Notice & Switcher Banner -->
              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <Icon name="Info" size={18} class="text-[#1677FF] shrink-0" />
                  <div>
                    <p class="text-xs font-bold text-[#102A56]">Per-Plan Tool Configuration Active</p>
                    <p class="text-[11px] text-[#4B6382]">Tool connectors are now configured directly inside each plan's tier settings under <strong>Plans &amp; Pricing</strong>.</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onclick={() => activeAdminTab = 'plans'}
                    class="px-3.5 py-1.5 rounded-xl bg-white border border-[#1677FF] text-[#1677FF] text-xs font-bold hover:bg-[#F3F8FF] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Icon name="Receipt" size={13} />
                    <span>Configure in Plan Settings</span>
                  </button>
                </div>
              </div>

              <!-- Header & Summary -->
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-11 h-11 rounded-2xl bg-[#1677FF]/10 border border-[#1677FF]/20 flex items-center justify-center text-[#1677FF] shrink-0">
                    <Icon name="Wrench" size={22} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1677FF]/10 text-[#1677FF] border border-[#1677FF]/20 uppercase">
                        Admin Controls
                      </span>
                      <h2 class="text-lg sm:text-xl font-black text-[#102A56]">
                        Enterprise Tool Connectors &amp; Integrations
                      </h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-1 max-w-2xl leading-relaxed">
                      Toggle any of the {TOOL_CONNECTORS.length} enterprise tool connectors ON or OFF. Disabled connectors are immediately hidden from user dashboards, workflow studios, and catalog pickers in real time.
                    </p>
                  </div>
                </div>

                <!-- Stats Badges & Save CTA -->
                <div class="flex flex-wrap items-center gap-2.5 shrink-0">
                  <div class="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span class="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">Active</span>
                    <span class="text-sm font-black text-emerald-800">{enabledToolConnectors.length} Tools</span>
                  </div>
                  <div class="px-3.5 py-1.5 rounded-xl {TOOL_CONNECTORS.length - enabledToolConnectors.length > 0 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-gray-50 border border-gray-200 text-gray-500'} text-center">
                    <span class="text-[10px] uppercase font-bold tracking-wider block">Hidden</span>
                    <span class="text-sm font-black">{TOOL_CONNECTORS.length - enabledToolConnectors.length} Tools</span>
                  </div>
                  <button
                    type="button"
                    onclick={saveSettings}
                    disabled={isSaving}
                    class="px-5 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {#if isSaving}
                      <Icon name="Loader2" size={14} class="animate-spin" />
                      <span>Saving...</span>
                    {:else}
                      <Icon name="Save" size={14} />
                      <span>Save Tool Settings</span>
                    {/if}
                  </button>
                </div>
              </div>

              <!-- Search and Quick Bulk Actions Bar -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <!-- Search Input -->
                <div class="relative flex-1 max-w-md">
                  <Icon name="Search" size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B92AE]" />
                  <input
                    type="text"
                    bind:value={toolConnectorSearch}
                    placeholder="Search connectors by name, category, or service..."
                    class="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-[#CFE2FA] focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 text-xs sm:text-sm text-[#102A56] placeholder-[#7B92AE] outline-none transition-all shadow-2xs"
                  />
                  {#if toolConnectorSearch}
                    <button
                      type="button"
                      onclick={() => toolConnectorSearch = ''}
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  {/if}
                </div>

                <!-- Bulk Selection Buttons -->
                <div class="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onclick={selectAllToolConnectors}
                    class="px-3.5 py-2 rounded-xl bg-[#F3F8FF] hover:bg-[#E3ECF7] border border-[#CFE2FA] text-xs font-bold text-[#1677FF] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="CheckSquare" size={14} />
                    <span>Enable All ({TOOL_CONNECTORS.length})</span>
                  </button>
                  <button
                    type="button"
                    onclick={clearAllToolConnectors}
                    class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="Ban" size={14} />
                    <span>Disable All</span>
                  </button>
                </div>
              </div>

              <!-- Category Filter Chips -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onclick={() => toolConnectorCategoryFilter = 'all'}
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer {toolConnectorCategoryFilter === 'all' ? 'bg-[#1677FF] text-white shadow-xs' : 'bg-[#F3F8FF] text-[#4B6382] hover:bg-[#E3ECF7]'}"
                >
                  <span>All Categories</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded-full {toolConnectorCategoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white border border-[#E3ECF7] text-gray-600'}">
                    {enabledToolConnectors.length}/{TOOL_CONNECTORS.length}
                  </span>
                </button>

                {#each TOOL_CONNECTOR_CATEGORIES as cat}
                  {@const catTools = TOOL_CONNECTORS.filter((t) => t.categoryId === cat.id)}
                  {@const enabledInCat = catTools.filter((t) => enabledToolConnectors.includes(t.id)).length}
                  <button
                    type="button"
                    onclick={() => toolConnectorCategoryFilter = cat.id}
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer {toolConnectorCategoryFilter === cat.id ? 'bg-[#1677FF] text-white shadow-xs' : 'bg-[#F3F8FF] text-[#4B6382] hover:bg-[#E3ECF7]'}"
                  >
                    <Icon name={cat.icon} size={13} class={toolConnectorCategoryFilter === cat.id ? 'text-white' : 'text-[#5E7694]'} />
                    <span>{cat.name}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded-full {toolConnectorCategoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-white border border-[#E3ECF7] text-gray-600'}">
                      {enabledInCat}/{catTools.length}
                    </span>
                  </button>
                {/each}
              </div>

              <!-- Category Quick Batch Actions (if specific category selected) -->
              {#if toolConnectorCategoryFilter !== 'all'}
                {@const activeCat = TOOL_CONNECTOR_CATEGORIES.find((c: ToolConnectorCategory) => c.id === toolConnectorCategoryFilter)}
                {@const catTools = TOOL_CONNECTORS.filter((t) => t.categoryId === toolConnectorCategoryFilter)}
                {@const enabledInCat = catTools.filter((t) => enabledToolConnectors.includes(t.id)).length}
                <div class="p-3 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-2">
                    <Icon name={activeCat?.icon || 'Folder'} size={16} class="text-[#1677FF]" />
                    <span class="font-bold text-[#102A56]">{activeCat?.name}:</span>
                    <span class="text-[#4B6382]">{enabledInCat} of {catTools.length} active</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      onclick={() => enableCategoryTools(toolConnectorCategoryFilter)}
                      class="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] cursor-pointer transition-colors"
                    >
                      Enable All in {activeCat?.name}
                    </button>
                    <button
                      type="button"
                      onclick={() => disableCategoryTools(toolConnectorCategoryFilter)}
                      class="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] cursor-pointer transition-colors"
                    >
                      Disable All in {activeCat?.name}
                    </button>
                  </div>
                </div>
              {/if}

              <!-- Connectors Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-2">
                {#each filteredToolConnectors as tool}
                  {@const isEnabled = enabledToolConnectors.includes(tool.id)}
                  <div
                    class="rounded-2xl p-4 transition-all border {isEnabled ? 'bg-white border-[#CFE2FA] shadow-2xs hover:border-[#1677FF]/50 hover:shadow-xs' : 'bg-gray-50/80 border-gray-200/90 opacity-70 hover:opacity-100'}"
                  >
                    <!-- Top row: BrandIcon, Name, and Toggle Switch -->
                    <div class="flex items-start justify-between gap-3 mb-2.5">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center shrink-0 p-1.5 shadow-2xs">
                          <BrandIcon name={tool.name} modelId={tool.id} icon={tool.icon} size={24} />
                        </div>
                        <div class="min-w-0">
                          <h4 class="text-xs sm:text-sm font-bold text-[#102A56] truncate">
                            {tool.name}
                          </h4>
                          <span class="text-[10px] font-semibold text-[#5E7694] block truncate">
                            {tool.category}
                          </span>
                        </div>
                      </div>

                      <!-- Toggle Switch Button -->
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        onclick={() => toggleToolConnector(tool.id)}
                        class="shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none {isEnabled ? 'bg-[#1677FF]' : 'bg-gray-300'}"
                        title={isEnabled ? 'Click to disable' : 'Click to enable'}
                      >
                        <span
                          class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform {isEnabled ? 'translate-x-6' : 'translate-x-1'}"
                        ></span>
                      </button>
                    </div>

                    <!-- Description -->
                    <p class="text-[11px] text-[#4B6382] leading-relaxed line-clamp-2 mb-3 min-h-[32px]">
                      {tool.description}
                    </p>

                    <!-- Footer: Status Pill & Auth Type -->
                    <div class="flex items-center justify-between pt-2.5 border-t border-[#E3ECF7]/80 text-[10px]">
                      <span class="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider {isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-gray-100 text-gray-500 border border-gray-200'}">
                        {isEnabled ? 'Active' : 'Hidden'}
                      </span>
                      <span class="text-[#7B92AE] font-mono">
                        {tool.authType === 'oauth2' ? 'OAuth 2.0' : tool.authType === 'api_key' ? 'API Key' : 'Webhook'}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>

              {#if filteredToolConnectors.length === 0}
                <div class="p-12 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                  <Icon name="Search" size={32} class="mx-auto text-gray-400 mb-2" />
                  <p class="text-sm font-bold text-[#102A56]">No tool connectors matched your search</p>
                  <p class="text-xs text-[#5E7694] mt-1">Try clearing your search query or choosing another category.</p>
                </div>
              {/if}

              <!-- Bottom Sticky/Action Banner -->
              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div class="flex items-center gap-2 text-xs text-[#102A56]">
                  <Icon name="CheckCircle2" size={16} class="text-[#1677FF] shrink-0" />
                  <span>
                    Currently <strong>{enabledToolConnectors.length} of {TOOL_CONNECTORS.length}</strong> connectors are active.
                    Click <strong>"Save Tool Settings"</strong> to persist changes.
                  </span>
                </div>
                <button
                  type="button"
                  onclick={saveSettings}
                  disabled={isSaving}
                  class="w-full sm:w-auto px-6 py-2.5 rounded-xl blue-btn text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {#if isSaving}
                    <Icon name="Loader2" size={14} class="animate-spin" />
                    <span>Saving Changes...</span>
                  {:else}
                    <Icon name="Save" size={14} />
                    <span>Save Tool Settings</span>
                  {/if}
                </button>
              </div>

            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 2. PAYMENT GATEWAY TAB (SECTION 1) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'payment'}
            <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shrink-0">
                    <Icon name="CreditCard" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] uppercase">Section 1</span>
                      <h2 class="text-base font-bold text-[#102A56]">OPayBD Payment Gateway Configuration</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-0.5">
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
              <div class="p-4 sm:p-6 rounded-2xl bg-[#F3F8FF] border-2 border-[#1677FF]/30 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <label for="opay-api-key" class="text-sm font-bold text-[#102A56]">
                      Primary OPayBD API Key (Required)
                    </label>
                  </div>
                  <button
                    type="button"
                    onclick={() => toggleShowKey('opayApiKey')}
                    class="text-xs text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer text-left sm:text-right"
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
                    class="ui-input bg-white px-4 py-3 text-sm font-mono shadow-2xs"
                  />
                </div>

                <div class="p-3.5 rounded-xl bg-white border border-[#CFE2FA] flex items-start gap-2.5 text-xs text-[#102A56] shadow-2xs">
                  <Icon name="CheckCircle2" size={17} class="text-[#1677FF] shrink-0 mt-0.5" />
                  <div>
                    <span class="font-bold text-[#102A56] block mb-0.5">Only this 1 API Key is required for OPayBD!</span>
                    <p class="text-[#4B6382] leading-relaxed">
                      Saving your single <strong>API Key</strong> from your OPayBD Merchant Panel (<a href="https://verify.opaybd.com" target="_blank" rel="noreferrer" class="text-[#1677FF] underline font-semibold">verify.opaybd.com</a>) activates bKash, Nagad, Rocket, and Card checkout immediately.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Optional / Advanced Settings Toggle -->
              <div class="border border-[#E3ECF7] rounded-2xl p-4 bg-[#F3F8FF]">
                <button
                  type="button"
                  onclick={() => showAdvancedPayment = !showAdvancedPayment}
                  class="w-full flex items-center justify-between text-xs font-bold text-[#102A56] hover:text-[#1677FF] transition-colors cursor-pointer"
                >
                  <span class="flex items-center gap-2">
                    <Icon name="Sliders" size={14} class="text-[#1677FF]" />
                    <span>Advanced / Optional Fields (Leave blank for standard usage)</span>
                  </span>
                  <div class="flex items-center gap-1.5 text-[#4B6382]">
                    <span class="text-[11px] font-normal">{showAdvancedPayment ? 'Hide' : 'Expand (Optional)'}</span>
                    <Icon name={showAdvancedPayment ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  </div>
                </button>

                {#if showAdvancedPayment || opaySecretKey || opayBrandKey}
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-[#E3ECF7] animate-in fade-in duration-150">
                    <!-- Secret Key -->
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <label for="opay-secret-key" class="text-xs font-semibold text-[#102A56]">
                          OPAY_SECRET_KEY <span class="text-[#5E7694] font-normal text-[11px]">(Optional)</span>
                        </label>
                        <button
                          type="button"
                          onclick={() => toggleShowKey('opaySecretKey')}
                          class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                        >
                          {showKeyMap['opaySecretKey'] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        id="opay-secret-key"
                        type={showKeyMap['opaySecretKey'] ? 'text' : 'password'}
                        bind:value={opaySecretKey}
                        placeholder="Leave blank if not provided by OPay"
                        class="ui-input bg-white px-3.5 py-2.5 text-xs font-mono"
                      />
                      <p class="text-[10px] text-[#5E7694]">Only used for custom HMAC packages. Leave blank for standard merchants.</p>
                    </div>

                    <!-- Brand Key -->
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <label for="opay-brand-key" class="text-xs font-semibold text-[#102A56]">
                          OPAY_BRAND_KEY <span class="text-[#5E7694] font-normal text-[11px]">(Optional)</span>
                        </label>
                        <button
                          type="button"
                          onclick={() => toggleShowKey('opayBrandKey')}
                          class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                        >
                          {showKeyMap['opayBrandKey'] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        id="opay-brand-key"
                        type={showKeyMap['opayBrandKey'] ? 'text' : 'password'}
                        bind:value={opayBrandKey}
                        placeholder="Leave blank if not provided by OPay"
                        class="ui-input bg-white px-3.5 py-2.5 text-xs font-mono"
                      />
                      <p class="text-[10px] text-[#5E7694]">Optional custom checkout branding identifier.</p>
                    </div>

                    <!-- Custom API Endpoint URL -->
                    <div class="col-span-full space-y-1.5 pt-2 border-t border-[#E3ECF7]">
                      <div class="flex items-center justify-between">
                        <label for="opay-endpoint-url" class="text-xs font-semibold text-[#102A56]">
                          OPAY_ENDPOINT_URL <span class="text-[#5E7694] font-normal text-[11px]">(Checkout API URL)</span>
                        </label>
                      </div>
                      <input
                        id="opay-endpoint-url"
                        type="text"
                        bind:value={opayEndpointUrl}
                        placeholder="https://verify.opaybd.com/api/payment/create"
                        class="ui-input bg-white px-3.5 py-2.5 text-xs font-mono"
                      />
                      <p class="text-[10px] text-[#4B6382]">
                        Default: <code class="break-all">https://verify.opaybd.com/api/payment/create</code>. Update here anytime if OPayBD changes its gateway domain.
                      </p>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Integration Documentation Card -->
              <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] text-xs space-y-2">
                <div class="font-bold text-[#102A56] flex items-center gap-1.5">
                  <Icon name="Shield" size={14} class="text-emerald-600" />
                  <span>Real-time Callback &amp; Verification Endpoints</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-[#4B6382]">
                  <div class="p-2.5 rounded-xl bg-white border border-[#E3ECF7]">
                    <span class="font-bold text-[#102A56] block mb-0.5">Payment Return URL:</span>
                    <code class="text-[#1677FF] font-mono break-all">https://ezboagents.com/payment/callback</code>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white border border-[#E3ECF7]">
                    <span class="font-bold text-[#102A56] block mb-0.5">Webhook Listener:</span>
                    <code class="text-[#1677FF] font-mono break-all">https://ezboagents.com/api/payment/verify</code>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 3. AI KEYS VAULT TAB (SECTION 2) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'ai-keys'}
            <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shrink-0">
                    <Icon name="Key" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] uppercase">Section 2</span>
                      <h2 class="text-base font-bold text-[#102A56]">AI Model Master API Keys (Cloud Tier)</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-0.5">
                      These platform keys power the <strong>All-Inclusive Cloud Plan (1,499 BDT/mo)</strong> where users don't have to provide keys.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]">
                    {configuredKeysCount} of 6 Keys Configured
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Gemini Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                  <div class="flex items-center justify-between">
                    <label for="gemini-key" class="text-xs font-bold text-[#102A56] flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                        <BrandIcon name="gemini" size={16} />
                      </div>
                      <span>Google Gemini API</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('geminiApiKey')}
                      class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                    >
                      {showKeyMap['geminiApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="gemini-key"
                    type={showKeyMap['geminiApiKey'] ? 'text' : 'password'}
                    bind:value={geminiApiKey}
                    placeholder="AIzaSy... (Gemini 2.0 Flash)"
                    class="ui-input bg-white !px-3 !py-2 text-xs font-mono"
                  />
                  <div class="flex items-center justify-between text-[11px] text-[#5E7694]">
                    <span>Powers: Primary Chat &amp; Agents</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="text-[#1677FF] hover:underline font-medium">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- OpenAI Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                  <div class="flex items-center justify-between">
                    <label for="openai-key" class="text-xs font-bold text-[#102A56] flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                        <BrandIcon name="openai" size={16} />
                      </div>
                      <span>OpenAI (ChatGPT)</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('openaiApiKey')}
                      class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                    >
                      {showKeyMap['openaiApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="openai-key"
                    type={showKeyMap['openaiApiKey'] ? 'text' : 'password'}
                    bind:value={openaiApiKey}
                    placeholder="sk-proj-... (GPT-4o &amp; Mini)"
                    class="ui-input bg-white !px-3 !py-2 text-xs font-mono"
                  />
                  <div class="flex items-center justify-between text-[11px] text-[#5E7694]">
                    <span>Powers: GPT-4o Flagship</span>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" class="text-[#1677FF] hover:underline font-medium">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- Grok Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                  <div class="flex items-center justify-between">
                    <label for="grok-key" class="text-xs font-bold text-[#102A56] flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                        <BrandIcon name="grok" size={16} />
                      </div>
                      <span>xAI Grok API</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('grokApiKey')}
                      class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                    >
                      {showKeyMap['grokApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="grok-key"
                    type={showKeyMap['grokApiKey'] ? 'text' : 'password'}
                    bind:value={grokApiKey}
                    placeholder="xai-... (Grok 3)"
                    class="ui-input bg-white !px-3 !py-2 text-xs font-mono"
                  />
                  <div class="flex items-center justify-between text-[11px] text-[#5E7694]">
                    <span>Powers: Real-Time Intelligence</span>
                    <a href="https://console.x.ai" target="_blank" rel="noopener" class="text-[#1677FF] hover:underline font-medium">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- DeepSeek Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                  <div class="flex items-center justify-between">
                    <label for="deepseek-key" class="text-xs font-bold text-[#102A56] flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                        <BrandIcon name="deepseek" size={16} />
                      </div>
                      <span>DeepSeek Platform</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('deepseekApiKey')}
                      class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                    >
                      {showKeyMap['deepseekApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="deepseek-key"
                    type={showKeyMap['deepseekApiKey'] ? 'text' : 'password'}
                    bind:value={deepseekApiKey}
                    placeholder="sk-... (DeepSeek Chat/Reasoner)"
                    class="ui-input bg-white !px-3 !py-2 text-xs font-mono"
                  />
                  <div class="flex items-center justify-between text-[11px] text-[#5E7694]">
                    <span>Powers: Deep Reasoning &amp; Code</span>
                    <a href="https://platform.deepseek.com" target="_blank" rel="noopener" class="text-[#1677FF] hover:underline font-medium">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- OpenRouter Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                  <div class="flex items-center justify-between">
                    <label for="openrouter-key" class="text-xs font-bold text-[#102A56] flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                        <BrandIcon name="openrouter" size={16} />
                      </div>
                      <span>OpenRouter (Claude 3.5)</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('openrouterApiKey')}
                      class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                    >
                      {showKeyMap['openrouterApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="openrouter-key"
                    type={showKeyMap['openrouterApiKey'] ? 'text' : 'password'}
                    bind:value={openrouterApiKey}
                    placeholder="sk-or-v1-... (Claude Sonnet)"
                    class="ui-input bg-white !px-3 !py-2 text-xs font-mono"
                  />
                  <div class="flex items-center justify-between text-[11px] text-[#5E7694]">
                    <span>Powers: Claude 3.5 Sonnet</span>
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" class="text-[#1677FF] hover:underline font-medium">Get Key &rarr;</a>
                  </div>
                </div>

                <!-- Replicate Key -->
                <div class="space-y-1.5 p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7]">
                  <div class="flex items-center justify-between">
                    <label for="replicate-key" class="text-xs font-bold text-[#102A56] flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                        <BrandIcon name="replicate" size={16} />
                      </div>
                      <span>Replicate (Flux Image)</span>
                    </label>
                    <button
                      type="button"
                      onclick={() => toggleShowKey('replicateApiKey')}
                      class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                    >
                      {showKeyMap['replicateApiKey'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="replicate-key"
                    type={showKeyMap['replicateApiKey'] ? 'text' : 'password'}
                    bind:value={replicateApiKey}
                    placeholder="r8_... (Flux Schnell Image)"
                    class="ui-input bg-white !px-3 !py-2 text-xs font-mono"
                  />
                  <div class="flex items-center justify-between text-[11px] text-[#5E7694]">
                    <span>Powers: High-Res AI Images</span>
                    <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener" class="text-[#1677FF] hover:underline font-medium">Get Key &rarr;</a>
                  </div>
                </div>
              </div>

              <!-- Client BYOK Provider Access Control (User Permission Switches) -->
              <div class="p-6 sm:p-8 rounded-3xl bg-[#F3F8FF] border-2 border-[#1677FF]/25 space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-4">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#1677FF] text-white uppercase tracking-wider">
                        Client BYOK Access Control
                      </span>
                      <h3 class="text-sm font-extrabold text-[#102A56] flex items-center gap-2">
                        <span>ইউজারদের জন্য এলাউড API প্রোভাইডার কনফিগারেশন</span>
                      </h3>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-1 leading-relaxed">
                      এডমিন প্যানেল থেকে আপনি যে যে প্রোভাইডার <strong>Enable</strong> রাখবেন, ইউজাররা তাদের ড্যাশবোর্ডে <strong>"API Key Management"</strong> ট্যাবে শুধু সেই সেই প্রোভাইডার দেখতে পারবে এবং তাদের নিজস্ব API Key বসাতে পারবে। যে প্রোভাইডার আপনি <strong>Disable</strong> করবেন, তা সাধারণ ইউজারদের থেকে সম্পূর্ণ লুকিয়ে রাখা হবে।
                    </p>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onclick={() => {
                        CLIENT_PROVIDERS_CATALOG.forEach((p) => { providersAllowed[p.id] = true; });
                      }}
                      class="px-3 py-1.5 rounded-xl btn-secondary text-xs cursor-pointer font-bold"
                    >
                      Enable All
                    </button>
                    <button
                      type="button"
                      onclick={() => {
                        CLIENT_PROVIDERS_CATALOG.forEach((p) => { providersAllowed[p.id] = false; });
                      }}
                      class="px-3 py-1.5 rounded-xl btn-secondary text-xs cursor-pointer font-bold"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {#each CLIENT_PROVIDERS_CATALOG as prov}
                    <div class="p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between {providersAllowed[prov.id] !== false ? 'bg-white border-[#1677FF]/40 shadow-xs' : 'bg-white/50 border-[#E3ECF7] opacity-60'}">
                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-1.5">
                            <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                              <BrandIcon name={prov.id} size={15} />
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]">
                              {prov.tag}
                            </span>
                          </div>
                          <span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {prov.freeBadge}
                          </span>
                        </div>
                        <h4 class="text-xs font-bold text-[#102A56]">{prov.name}</h4>
                        <p class="text-[11px] text-[#4B6382] mt-1 leading-relaxed">{prov.desc}</p>
                      </div>

                      <div class="mt-4 pt-3 border-t border-[#E3ECF7] flex items-center justify-between">
                        <span class="text-xs font-semibold {providersAllowed[prov.id] !== false ? 'text-emerald-600 font-bold' : 'text-rose-500 font-semibold'}">
                          {providersAllowed[prov.id] !== false ? '✓ User Allowed' : '✕ Hidden from Users'}
                        </span>
                        <button
                          type="button"
                          aria-label={`Toggle user access for ${prov.name}`}
                          onclick={() => { providersAllowed[prov.id] = providersAllowed[prov.id] === false ? true : false; }}
                          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer {providersAllowed[prov.id] !== false ? 'bg-[#1677FF]' : 'bg-[#C8D8EC]'}"
                        >
                          <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-2xs {providersAllowed[prov.id] !== false ? 'translate-x-6' : 'translate-x-1'}"></span>
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>

                <div class="p-3.5 rounded-xl bg-white border border-[#CFE2FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#102A56]">
                  <div class="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={16} class="text-[#1677FF] shrink-0" />
                    <span>পরিবর্তন সংরক্ষণ করতে নিচে <strong>"Save Configuration"</strong> বাটনে ক্লিক করুন। সাথে সাথে ইউজার ড্যাশবোর্ডে সিঙ্ক হয়ে যাবে।</span>
                  </div>
                  <button
                    type="button"
                    onclick={saveSettings}
                    disabled={isSaving}
                    class="px-4 py-2 rounded-xl blue-btn text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50 shrink-0 text-center"
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            </div>
          {/if}

          <!-- ======================================================== -->
          <!-- 4. MODEL TOGGLES TAB (SECTION 3) -->
          <!-- ======================================================== -->
          {#if activeAdminTab === 'models'}
            <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#38CFFF]/15 border border-[#38CFFF]/35 flex items-center justify-center text-[#089CD0] shrink-0">
                    <Icon name="Bot" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#38CFFF]/15 text-[#089CD0] border border-[#38CFFF]/35 uppercase">Section 3</span>
                      <h2 class="text-base font-bold text-[#102A56]">AI Model On / Off Toggles</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-0.5">
                      Instantly enable or disable individual AI models across the entire platform in real time.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick={enableAllModels}
                    class="px-3.5 py-1.5 rounded-xl btn-secondary text-xs cursor-pointer"
                  >
                    Enable All
                  </button>
                  <button
                    type="button"
                    onclick={disableAllModels}
                    class="px-3.5 py-1.5 rounded-xl btn-secondary text-xs cursor-pointer"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              <!-- Models Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {#each MODELS_CATALOG as model}
                  <div class="p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between {modelsEnabled[model.id] ? 'bg-white border-[#1677FF]/35 shadow-2xs' : 'bg-[#F3F8FF]/70 border-[#E3ECF7] opacity-65'}">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-1.5">
                          <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center shadow-2xs shrink-0">
                            <BrandIcon modelId={model.id} size={15} />
                          </div>
                          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded {modelsEnabled[model.id] ? 'bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]' : 'bg-[#E3ECF7] text-[#4B6382]'}">
                            {model.provider}
                          </span>
                        </div>
                        <span class="text-[10px] font-mono text-[#5E7694]">{model.latency}</span>
                      </div>
                      <h3 class="text-xs font-bold text-[#102A56] leading-tight">{model.name}</h3>
                      <p class="text-[11px] text-[#4B6382] mt-1">{model.tag}</p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-[#E3ECF7] flex items-center justify-between">
                      <span class="text-xs font-semibold {modelsEnabled[model.id] ? 'text-emerald-600 font-bold' : 'text-[#5E7694]'}">
                        {modelsEnabled[model.id] ? 'Active (Live)' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        aria-label={`Toggle ${model.name}`}
                        onclick={() => { modelsEnabled[model.id] = !modelsEnabled[model.id]; }}
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer {modelsEnabled[model.id] ? 'bg-[#1677FF]' : 'bg-[#C8D8EC]'}"
                      >
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-2xs {modelsEnabled[model.id] ? 'translate-x-6' : 'translate-x-1'}"></span>
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
            <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shrink-0">
                    <Icon name="Mail" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] uppercase">Section 4</span>
                      <h2 class="text-base font-bold text-[#102A56]">Transactional Email &amp; SMTP (6-Digit OTP Delivery)</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-0.5">
                      Configure your production SMTP relay (Gmail, Hostinger, Brevo, Resend) for real-time 6-digit email OTPs.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold {hasSmtp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7]'}">
                    {hasSmtp ? '● Live SMTP Active' : '○ Simulated Sandbox Mode'}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <!-- Inputs (2 Cols) -->
                <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Host -->
                  <div class="sm:col-span-2">
                    <label for="smtp-host" class="block text-xs font-bold text-[#102A56] mb-1">SMTP Host</label>
                    <input
                      id="smtp-host"
                      type="text"
                      bind:value={smtpHost}
                      placeholder="smtp.gmail.com or smtp.hostinger.com"
                      class="ui-input px-3.5 py-2.5 text-xs font-mono"
                    />
                  </div>

                  <!-- Port -->
                  <div>
                    <label for="smtp-port" class="block text-xs font-bold text-[#102A56] mb-1">SMTP Port</label>
                    <input
                      id="smtp-port"
                      type="number"
                      bind:value={smtpPort}
                      placeholder="465 (SSL) or 587 (TLS)"
                      class="ui-input px-3.5 py-2.5 text-xs font-mono"
                    />
                  </div>

                  <!-- User -->
                  <div>
                    <label for="smtp-user" class="block text-xs font-bold text-[#102A56] mb-1">SMTP Username / Email</label>
                    <input
                      id="smtp-user"
                      type="text"
                      bind:value={smtpUser}
                      placeholder="noreply@ezboagents.com or your-gmail@gmail.com"
                      class="ui-input px-3.5 py-2.5 text-xs font-mono"
                    />
                  </div>

                  <!-- Password -->
                  <div class="sm:col-span-2">
                    <div class="flex items-center justify-between mb-1">
                      <label for="smtp-pass" class="text-xs font-bold text-[#102A56]">SMTP Password / App Password</label>
                      <button
                        type="button"
                        onclick={() => toggleShowKey('smtpPass')}
                        class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                      >
                        {showKeyMap['smtpPass'] ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="smtp-pass"
                      type={showKeyMap['smtpPass'] ? 'text' : 'password'}
                      bind:value={smtpPass}
                      placeholder="16-letter Gmail App Password or SMTP token"
                      class="ui-input px-3.5 py-2.5 text-xs font-mono"
                    />
                  </div>

                  <!-- From -->
                  <div class="sm:col-span-2">
                    <label for="smtp-from" class="block text-xs font-bold text-[#102A56] mb-1">Sender "From" Address</label>
                    <input
                      id="smtp-from"
                      type="text"
                      bind:value={smtpFrom}
                      placeholder="EzboAgents &lt;noreply@ezboagents.com&gt;"
                      class="ui-input px-3.5 py-2.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <!-- Test & Guide Column (1 Col) -->
                <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex flex-col justify-between space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-[#102A56] flex items-center gap-1.5 mb-1.5">
                      <Icon name="Send" size={14} class="text-[#1677FF]" />
                      <span>Test Live 6-Digit OTP Delivery</span>
                    </h3>
                    <p class="text-[11px] text-[#4B6382] leading-relaxed mb-3">
                      Send a real 6-digit verification code email right now to confirm your SMTP configuration.
                    </p>

                    <div class="space-y-2">
                      <input
                        type="email"
                        bind:value={testEmailTo}
                        placeholder="your-personal@email.com"
                        class="ui-input bg-white !px-3 !py-2 text-xs"
                      />

                      <button
                        type="button"
                        onclick={sendTestEmail}
                        disabled={isSendingTestEmail}
                        class="w-full py-2.5 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

                  <div class="pt-3 border-t border-[#E3ECF7] text-[10px] text-[#5E7694] space-y-1">
                    <p class="font-semibold text-[#102A56]">💡 Gmail Quick Tip:</p>
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
            <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#38CFFF]/15 border border-[#38CFFF]/35 flex items-center justify-center text-[#089CD0] shrink-0">
                    <Icon name="Send" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#38CFFF]/15 text-[#089CD0] border border-[#38CFFF]/35 uppercase">Section 5</span>
                      <h2 class="text-base font-bold text-[#102A56]">Telegram Bot &amp; Webhook Synchronization</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-0.5">
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

              <!-- Master Channels Toggle Card -->
              <div class="p-4 sm:p-5 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full {channelsCeoEnabled ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                    <h4 class="text-sm font-bold text-[#102A56]">External Channels CEO Master Switch (WhatsApp & Telegram)</h4>
                  </div>
                  <p class="text-xs text-[#4B6382] mt-0.5">
                    Toggle external WhatsApp and Telegram channel control dynamically. When disabled, public and dashboard channel interfaces are deactivated.
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" bind:checked={channelsCeoEnabled} class="sr-only peer" />
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1677FF]"></div>
                </label>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <!-- Inputs (2 Cols) -->
                <div class="lg:col-span-2 space-y-4">
                  <!-- Bot Token -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label for="tg-token" class="text-xs font-bold text-[#102A56]">Telegram Bot API Token</label>
                      <button
                        type="button"
                        onclick={() => toggleShowKey('telegramBotToken')}
                        class="text-[11px] text-[#1677FF] hover:text-[#1162DB] font-semibold cursor-pointer"
                      >
                        {showKeyMap['telegramBotToken'] ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="tg-token"
                      type={showKeyMap['telegramBotToken'] ? 'text' : 'password'}
                      bind:value={telegramBotToken}
                      placeholder="e.g. 7192849102:AAH9f2Xv... (from @BotFather)"
                      class="ui-input px-3.5 py-2.5 text-xs font-mono"
                    />
                  </div>

                  <!-- Bot Username -->
                  <div>
                    <label for="tg-username" class="block text-xs font-bold text-[#102A56] mb-1">Bot Handle / Username</label>
                    <div class="relative">
                      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#5E7694]">@</span>
                      <input
                        id="tg-username"
                        type="text"
                        bind:value={telegramBotUsername}
                        placeholder="EzboAgentsBot"
                        class="ui-input !pl-8 pr-3.5 py-2.5 text-xs font-mono"
                      />
                    </div>
                    <p class="text-[11px] text-[#5E7694] mt-1">This handle is used to generate 1-click sync deep links in user dashboards.</p>
                  </div>

                  <!-- Target Webhook Preview -->
                  <div class="p-3.5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] text-xs text-[#4B6382]">
                    <span class="font-bold text-[#102A56]">Live Webhook Target:</span>
                    <code class="ml-1 text-[11px] font-mono text-[#1677FF] break-all">https://ezboagents.com/api/telegram/webhook</code>
                  </div>
                </div>

                <!-- Actions & Health Column (1 Col) -->
                <div class="p-4 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex flex-col justify-between space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-[#102A56] flex items-center gap-1.5 mb-1.5">
                      <Icon name="Zap" size={14} class="text-[#089CD0]" />
                      <span>Webhook &amp; Bot Test</span>
                    </h3>
                    <p class="text-[11px] text-[#4B6382] leading-relaxed mb-3">
                      Verify token validity and activate the live webhook on ezboagents.com.
                    </p>

                    <div class="space-y-2.5">
                      <!-- Ping Button -->
                      <button
                        type="button"
                        onclick={testTelegramBot}
                        disabled={isTestingTelegram || !telegramBotToken}
                        class="w-full py-2.5 rounded-xl btn-secondary text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {#if isTestingTelegram}
                          <Icon name="Loader2" size={14} class="animate-spin" />
                          <span>Pinging bot...</span>
                        {:else}
                          <Icon name="Bot" size={14} class="text-[#089CD0]" />
                          <span>Test Bot Ping (getMe)</span>
                        {/if}
                      </button>

                      <!-- Set Webhook Button -->
                      <button
                        type="button"
                        onclick={registerTelegramWebhook}
                        disabled={isRegisteringWebhook || !telegramBotToken}
                        class="w-full py-2.5 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

                  <div class="pt-3 border-t border-[#E3ECF7] text-[10px] text-[#5E7694] space-y-1">
                    <p class="font-semibold text-[#102A56]">💡 BotFather Quick Setup:</p>
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
            <div class="ui-card-static rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3ECF7] pb-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] flex items-center justify-center text-[#1677FF] shrink-0">
                    <Icon name="Shield" size={20} />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F8FF] text-[#1677FF] border border-[#E3ECF7] uppercase">Section 6</span>
                      <h2 class="text-base font-bold text-[#102A56]">Security &amp; Vercel .env Synchronizer</h2>
                    </div>
                    <p class="text-xs text-[#4B6382] mt-0.5">
                      Update the master admin secret passphrase or export current configuration into Vercel Project Settings.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onclick={copyVercelEnv}
                  class="px-4 py-2 rounded-xl blue-btn text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Icon name="Copy" size={14} />
                  <span>Copy Vercel .env</span>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Change Admin Passphrase -->
                <div class="p-4 sm:p-5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-[#102A56]">Master Admin Passphrase</h3>
                    <span class="text-[10px] text-[#5E7694] font-mono">Current: {authSecret ? '••••••••' : 'default'}</span>
                  </div>
                  <p class="text-xs text-[#4B6382]">
                    To change the master admin passphrase, enter a new passphrase below and click "Save Changes" to apply.
                  </p>
                  <div class="space-y-1.5">
                    <input
                      type="text"
                      bind:value={newPassphrase}
                      placeholder="Enter new passphrase (leave empty to keep current)..."
                      class="ui-input bg-white px-3.5 py-2.5 text-xs font-mono"
                    />
                    {#if passphraseUpdateMsg}
                      <p class="text-[11px] text-emerald-600 font-semibold">{passphraseUpdateMsg}</p>
                    {/if}
                  </div>
                </div>

                <!-- Environment Deployment Architecture -->
                <div class="p-4 sm:p-5 rounded-2xl bg-[#F3F8FF] border border-[#E3ECF7] space-y-3">
                  <h3 class="text-xs font-bold text-[#102A56]">Hosting &amp; Storage Architecture</h3>
                  <ul class="space-y-2 text-xs text-[#4B6382]">
                    <li class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span class="font-medium">Primary Hosting:</span>
                      <span class="font-mono text-[#102A56] font-semibold break-all">Vercel Serverless (Node 24)</span>
                    </li>
                    <li class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span class="font-medium">WhatsApp Socket:</span>
                      <span class="font-mono text-[#102A56] font-semibold break-all">Railway (Baileys 24/7)</span>
                    </li>
                    <li class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span class="font-medium">Telegram Webhook:</span>
                      <span class="font-mono text-[#1677FF] font-bold break-all">ezboagents.com/api/telegram/webhook</span>
                    </li>
                    <li class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span class="font-medium">Client Encryption:</span>
                      <span class="font-mono text-emerald-700 font-bold break-all">AES-GCM &amp; Local Vault</span>
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
