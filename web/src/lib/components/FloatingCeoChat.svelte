<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import ChannelModal from '$lib/components/ChannelModal.svelte';
  import AppDownloadModal from '$lib/components/AppDownloadModal.svelte';
  import { TOOLS, AI_CEO_PROFILE, type AITool } from '$lib/config/tools';
  import {
    chatMessages,
    addChatMessage,
    clearChatHistory,
    apiKey,
    currentUser,
    subscription,
    getActiveVaultKey,
    getRoundRobinVaultKeys,
    openrouterSelectedModels,
    routingStrategy,
    incrementManagedUsage,
    ceoCustomPrompt,
    activeDashboardTab,
    isHelperUnlocked,
    isProPlan,
    getEffectivePlanTier,
    addVaultKey,
    setDefaultVaultKey,
    type ChatMessage,
    type AIProvider
  } from '$lib/stores/userStore';
  import { DEFAULT_PLANS, type PlansSettings } from '$lib/config/plans';
  import { plansStore, workflowCustomizationUserStore } from '$lib/stores/plansStore';
  import { decryptVaultKey, encryptVaultKey } from '$lib/services/crypto';
  import { offlineStorage } from '$lib/services/offlineStorage';
  import { marked } from 'marked';
  import { onMount, tick } from 'svelte';

  export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: ChatMessage[];
  }

  const SESSIONS_STORAGE_KEY = 'ezbo_ceo_sessions_v3';

  let {
    isOpen = $bindable(false),
    activeTab,
    onOpenChannels
  } = $props<{
    isOpen?: boolean;
    activeTab?: string;
    onOpenChannels?: () => void;
  }>();

  // Multi-session chat history state
  let sessions = $state<ChatSession[]>([]);
  let activeSessionId = $state<string>('session-default');
  let isInnerSidebarOpen = $state(false);
  let isTypingWelcome = $state(false);

  // Channels modal state
  let isChannelsModalOpen = $state(false);

  // App Download modal & smart banner state
  let isAppDownloadModalOpen = $state(false);
  let isAppBannerDismissed = $state(false);
  let isMobileDevice = $state(false);

  // Input & Attachment state
  let inputMessage = $state('');
  let selectedHelperId = $state('ceo');
  let isSending = $state(false);
  let messagesContainer = $state<HTMLDivElement | null>(null);
  let textareaRef = $state<HTMLTextAreaElement | null>(null);
  let copiedMessageId = $state<string | null>(null);
  let isPlusMenuOpen = $state(false);
  let speechBubbleDismissed = $state(false);

  // Media Attachment state
  let attachedImage = $state<{ url: string; name: string } | null>(null);
  let fileInputRef = $state<HTMLInputElement | null>(null);
  let cameraInputRef = $state<HTMLInputElement | null>(null);

  // Slash Command (/) Autocomplete state
  let isSlashOpen = $state(false);
  let slashQuery = $state('');
  let selectedSlashIndex = $state(0);

  // Active session and messages
  const activeSession = $derived(
    sessions.find((s) => s.id === activeSessionId) || sessions[0]
  );
  const currentMessages = $derived(
    activeSession ? activeSession.messages : []
  );
  const isAdmin = $derived(typeof window !== 'undefined' && sessionStorage.getItem('ezbo_admin_authed') === 'true');
  const isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false);

  function loadStoredSessions(): ChatSession[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'session-default',
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: 'welcome-default',
            role: 'assistant',
            content: 'Hi, how can I help you today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ];
  }

  function saveSessions() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }

  // Auto-scroll to bottom of conversation feed
  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // 1. Auto-open on first dashboard visit
  $effect(() => {
    if (typeof window !== 'undefined') {
      try {
        const seen = localStorage.getItem('ezbo_ceo_chat_seen');
        if (!seen) {
          isOpen = true;
          localStorage.setItem('ezbo_ceo_chat_seen', 'true');
        }
      } catch {
        // ignore localStorage errors
      }
    }
  });

  // 2. Auto-minimize when user switches tabs away from chat
  let previousObservedTab = $state<string | null>(null);
  $effect(() => {
    const currentTab = activeTab || $activeDashboardTab;
    if (
      previousObservedTab !== null &&
      currentTab &&
      currentTab !== previousObservedTab &&
      currentTab !== 'chat'
    ) {
      isOpen = false;
    }
    previousObservedTab = currentTab;
  });

  // Watch messages for auto-scroll
  $effect(() => {
    if (currentMessages.length || isTypingWelcome) {
      scrollToBottom();
    }
  });

  onMount(() => {
    sessions = loadStoredSessions();
    if (sessions.length > 0) {
      activeSessionId = sessions[0].id;
      chatMessages.set(sessions[0].messages);
    }
    scrollToBottom();

    if (typeof window !== 'undefined') {
      isMobileDevice = window.innerWidth < 768;
      const dismissed = localStorage.getItem('ezbo_app_banner_dismissed');
      if (dismissed === 'true') {
        isAppBannerDismissed = true;
      }
      const handleResize = () => {
        isMobileDevice = window.innerWidth < 768;
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  });

  // Start a new chat session with animated typing
  function startNewChat() {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };

    sessions = [newSession, ...sessions];
    activeSessionId = newId;
    isInnerSidebarOpen = false;
    inputMessage = '';
    attachedImage = null;
    selectedHelperId = 'ceo';

    // Show brief typing animation for welcome message
    isTypingWelcome = true;
    setTimeout(() => {
      isTypingWelcome = false;
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Hi, how can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      newSession.messages = [welcomeMsg];
      sessions = sessions.map((s) => (s.id === newId ? { ...s, messages: [welcomeMsg] } : s));
      chatMessages.set([welcomeMsg]);
      saveSessions();
      scrollToBottom();
    }, 900);
  }

  function switchSession(sessionId: string) {
    activeSessionId = sessionId;
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      chatMessages.set(target.messages);
    }
    isInnerSidebarOpen = false;
    attachedImage = null;
    scrollToBottom();
  }

  function deleteSession(sessionId: string, e: MouseEvent) {
    e.stopPropagation();
    if (sessions.length <= 1) {
      startNewChat();
      return;
    }
    sessions = sessions.filter((s) => s.id !== sessionId);
    saveSessions();
    offlineStorage.clearMessages(sessionId).catch(() => {});

    if (activeSessionId === sessionId) {
      const next = sessions[0];
      activeSessionId = next.id;
      chatMessages.set(next.messages);
    }
  }

  function formatSessionTime(timestamp: number): string {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function generateSessionTitle(text: string): string {
    const clean = text
      .replace(/\[⚡[^\]]+\]/g, '')
      .replace(/[#*`_]/g, '')
      .trim();
    if (!clean) return 'Assistance Request';
    return clean.length > 24 ? clean.slice(0, 24) + '...' : clean;
  }

  // Handle image selected from file input or camera
  function handleImagePicked(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      attachedImage = {
        url: dataUrl,
        name: file.name
      };
      if (textareaRef) textareaRef.focus();
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  // Accessible AI helpers for slash command popover based on subscription tier & admin status
  const accessibleTools = $derived.by(() => {
    const isUserAdmin = typeof window !== 'undefined' && sessionStorage.getItem('ezbo_admin_authed') === 'true';
    if (isUserAdmin) return TOOLS;
    const tier = $subscription?.tier || $currentUser?.tier || 'byok_starter';
    const effective = getEffectivePlanTier(tier);
    const planKey = effective === 'free' ? 'byok_starter' : effective;
    const plan =
      ($plansStore && ($plansStore[planKey] || $plansStore[tier as keyof PlansSettings])) ||
      DEFAULT_PLANS[planKey] ||
      DEFAULT_PLANS.byok_starter;
    const toggles = plan?.featureToggles;
    if (!toggles || toggles.allHelpersEnabled !== false) {
      return TOOLS;
    }
    const enabledList = toggles.enabledHelpers || [];
    return TOOLS.filter((t) => enabledList.includes(t.id));
  });

  // Filtered helpers for slash command popover
  const filteredTools = $derived.by(() => {
    if (!slashQuery) return accessibleTools;
    const q = slashQuery.toLowerCase().replace(/^#/, '');
    return accessibleTools.filter((t) => {
      const codeClean = (t.code || '').toLowerCase().replace(/^#/, '');
      return (
        codeClean.includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.agentName || '').toLowerCase().includes(q) ||
        (t.categoryName || '').toLowerCase().includes(q) ||
        t.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    });
  });

  // Detect slash typing
  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    const val = target.value;
    const cursor = target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);

    // Matches / at beginning of string or after whitespace
    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9_#\s-]*)$/);
    if (slashMatch) {
      isSlashOpen = true;
      isPlusMenuOpen = false;
      slashQuery = slashMatch[1].trim();
      selectedSlashIndex = 0;
    } else {
      isSlashOpen = false;
    }
  }

  // Keyboard navigation for slash helper popover & submit
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (isSlashOpen) {
        e.preventDefault();
        isSlashOpen = false;
        return;
      }
      if (isPlusMenuOpen) {
        e.preventDefault();
        isPlusMenuOpen = false;
        return;
      }
      if (isInnerSidebarOpen) {
        e.preventDefault();
        isInnerSidebarOpen = false;
        return;
      }
    }

    if (isSlashOpen && filteredTools.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSlashIndex = (selectedSlashIndex + 1) % filteredTools.length;
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSlashIndex =
          (selectedSlashIndex - 1 + filteredTools.length) % filteredTools.length;
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectHelper(filteredTools[selectedSlashIndex]);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Selecting a helper inserts visual mention chip: [⚡ Facebook Ad Copy]
  function selectHelper(helper: AITool) {
    const isUserAdmin = typeof window !== 'undefined' && sessionStorage.getItem('ezbo_admin_authed') === 'true';
    const isUnlocked = isHelperUnlocked(helper.id, $subscription?.tier || $currentUser?.tier || 'byok_starter', $plansStore);
    if (!isUserAdmin && !isUnlocked) {
      isSlashOpen = false;
      activeDashboardTab.set('billing');
      return;
    }
    const codePrefix = helper.code && !helper.code.startsWith('#') ? `${helper.code} ` : '';
    const chip = `[⚡ ${codePrefix}${helper.name}] `;
    if (!textareaRef) {
      inputMessage = chip;
    } else {
      const val = inputMessage;
      const cursor = textareaRef.selectionStart || val.length;
      const textBeforeCursor = val.slice(0, cursor);
      const textAfterCursor = val.slice(cursor);
      const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        inputMessage = textBeforeCursor.slice(0, lastSlashIndex) + chip + textAfterCursor;
      } else {
        inputMessage = chip + val;
      }
    }
    isSlashOpen = false;
    selectedHelperId = helper.id;

    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
      }
    }, 50);
  }

  // =========================================================================
  // API Key & Sensitive Credential Detection Engine
  // =========================================================================
  interface KeyDetectionResult {
    provider: AIProvider;
    providerName: string;
    rawKey: string;
    maskedKey: string;
  }

  function detectApiKey(text: string): KeyDetectionResult | null {
    if (!text || typeof text !== 'string') return null;

    // 1. Google Gemini (AIzaSy followed by 33 base64/url-safe chars)
    const geminiMatch = text.match(/\b(AIzaSy[0-9A-Za-z_-]{33})\b/);
    if (geminiMatch) {
      const rawKey = geminiMatch[1];
      return {
        provider: 'gemini',
        providerName: 'Google Gemini',
        rawKey,
        maskedKey: `${rawKey.slice(0, 6)}...${rawKey.slice(-4)}`
      };
    }

    // 2. OpenRouter (sk-or-v1- followed by 64 hex characters)
    const openRouterMatch = text.match(/\b(sk-or-v1-[a-f0-9]{64})\b/);
    if (openRouterMatch) {
      const rawKey = openRouterMatch[1];
      return {
        provider: 'openrouter',
        providerName: 'OpenRouter',
        rawKey,
        maskedKey: `${rawKey.slice(0, 11)}...${rawKey.slice(-4)}`
      };
    }

    // 3. xAI Grok (xai- followed by 20+ chars)
    const grokMatch = text.match(/\b(xai-[a-zA-Z0-9_-]{20,})\b/);
    if (grokMatch) {
      const rawKey = grokMatch[1];
      return {
        provider: 'grok',
        providerName: 'xAI Grok',
        rawKey,
        maskedKey: `${rawKey.slice(0, 6)}...${rawKey.slice(-4)}`
      };
    }

    // 4. OpenAI (sk- followed by 20+ chars, when not openrouter)
    const openAiMatch = text.match(/\b(sk-(?!or-v1-)[a-zA-Z0-9_-]{20,})\b/);
    if (openAiMatch) {
      const rawKey = openAiMatch[1];
      return {
        provider: 'openai',
        providerName: 'OpenAI',
        rawKey,
        maskedKey: `${rawKey.slice(0, 5)}...${rawKey.slice(-4)}`
      };
    }

    return null;
  }

  // =========================================================================
  // Smart Site Navigation Detection Engine
  // =========================================================================
  interface NavigationDetectionResult {
    type: 'workflow' | 'tools' | 'agents' | 'billing' | 'vault' | 'channels' | 'app';
    label: string;
    description: string;
  }

  function detectNavigationIntent(text: string): NavigationDetectionResult | null {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();

    if (
      lower.includes('workflow studio') ||
      lower.includes('open workflow') ||
      lower.includes('ওয়ার্কফ্লো') ||
      lower.includes('ওয়ার্কফ্লো') ||
      lower.includes('node graph') ||
      lower.includes('workflow canvas')
    ) {
      if (!isWorkflowStudioVisible) return null;
      return {
        type: 'workflow',
        label: '🚀 Open Visual Workflow Studio',
        description: 'Launch full-screen canvas to orchestrate nodes and automated pipelines.'
      };
    }

    if (
      lower.includes('tool connector') ||
      lower.includes('open tools') ||
      lower.includes('tools page') ||
      lower.includes('integrations') ||
      lower.includes('কানেক্টর') ||
      (lower.includes('tools') && (lower.includes('dekhao') || lower.includes('show') || lower.includes('open')))
    ) {
      return {
        type: 'tools',
        label: '🛠️ Open Tools & Integrations',
        description: 'Connect WhatsApp, Telegram, Google Workspace, CRMs, and 100+ platforms.'
      };
    }

    if (
      lower.includes('my agents') ||
      lower.includes('all agents') ||
      lower.includes('show agents') ||
      lower.includes('এজেন্ট লিস্ট') ||
      (lower.includes('agents') && (lower.includes('dekhao') || lower.includes('show') || lower.includes('open')))
    ) {
      return {
        type: 'agents',
        label: '🤖 Open My Agents',
        description: 'Browse, search, and run all 75 specialized AI Agents.'
      };
    }

    if (
      lower.includes('upgrade plan') ||
      lower.includes('view billing') ||
      lower.includes('pricing') ||
      lower.includes('বিলিং') ||
      lower.includes('প্ল্যান') ||
      lower.includes('সাবস্ক্রিপশন') ||
      (lower.includes('billing') && (lower.includes('open') || lower.includes('show') || lower.includes('dekhao')))
    ) {
      return {
        type: 'billing',
        label: '💳 View Plans & Billing',
        description: 'Manage Starter vs Pro subscription and explore plan features.'
      };
    }

    if (
      lower.includes('api vault') ||
      lower.includes('manage keys') ||
      lower.includes('ভল্ট') ||
      (lower.includes('api key') && (lower.includes('vault') || lower.includes('open') || lower.includes('manage')))
    ) {
      return {
        type: 'vault',
        label: '🔑 Open API Vault',
        description: 'Configure encrypted API keys, failover chains, and model rotation.'
      };
    }

    if (
      lower.includes('connect channel') ||
      lower.includes('pair whatsapp') ||
      lower.includes('connect telegram') ||
      lower.includes('চ্যানেল কানেক্ট')
    ) {
      return {
        type: 'channels',
        label: '⚡ Connect Channels (WhatsApp / Telegram)',
        description: 'Link your WhatsApp number or Telegram bot for 24/7 AI access.'
      };
    }

    if (
      lower.includes('download app') ||
      lower.includes('android app') ||
      lower.includes('mobile app') ||
      lower.includes('apk download') ||
      lower.includes('অ্যাপ ডাউনলোড')
    ) {
      return {
        type: 'app',
        label: '📱 Download Android App',
        description: 'Get the official Ezbo Android APK with 120Hz fluid wave interface.'
      };
    }

    return null;
  }

  function confirmSaveKeyProposal(msgId: string) {
    if (!activeSession) return;
    const msg = activeSession.messages.find((m) => m.id === msgId);
    if (!msg || !msg.keyProposal || msg.keyProposal.status !== 'pending') return;

    const { provider, providerName, rawKey } = msg.keyProposal;

    // Encrypt and save to user's Vault
    const encrypted = encryptVaultKey(rawKey, provider);
    const added = addVaultKey({
      provider,
      label: `${providerName} Key (Saved from CEO Chat)`,
      encryptedKey: encrypted,
      isDefault: true,
      isEnabled: true,
      isValid: true
    });
    setDefaultVaultKey(added.id);
    apiKey.set(rawKey);

    // Notify listeners across app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ezbo:vault-updated'));
    }

    msg.keyProposal.status = 'saved';

    // Add confirmation message from CEO
    const confMsg: ChatMessage = {
      id: `bot-conf-${Date.now()}`,
      role: 'assistant',
      content: `✅ **${providerName} API Key** সফলভাবে আপনার ব্রাউজার এনক্রিপ্টেড ভল্টে সেভ করা হয়েছে এবং সক্রিয় রয়েছে! আপনি এখন যেকোনো এজেন্ট বা ওয়ার্কফ্লো নির্বিঘ্নে চালাতে পারেন।\n\n*(Your ${providerName} API Key has been safely encrypted and activated in your Vault. You can now command all agents without restrictions!)*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    activeSession.messages = [...activeSession.messages, confMsg];
    activeSession.updatedAt = Date.now();
    sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
    saveSessions();
    chatMessages.set(activeSession.messages);
    scrollToBottom();
  }

  function discardKeyProposal(msgId: string) {
    if (!activeSession) return;
    const msg = activeSession.messages.find((m) => m.id === msgId);
    if (!msg || !msg.keyProposal) return;
    msg.keyProposal.status = 'discarded';

    const discardMsg: ChatMessage = {
      id: `bot-discard-${Date.now()}`,
      role: 'assistant',
      content: '❌ API Key সংরক্ষণ বাতিল করা হয়েছে। এটি কোথাও সেভ করা হয়নি। *(API Key discarded and not stored).*',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    activeSession.messages = [...activeSession.messages, discardMsg];
    activeSession.updatedAt = Date.now();
    sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
    saveSessions();
    chatMessages.set(activeSession.messages);
    scrollToBottom();
  }

  function handleNavigationAction(type: 'workflow' | 'tools' | 'agents' | 'billing' | 'vault' | 'channels' | 'app') {
    switch (type) {
      case 'workflow':
        if (!isWorkflowStudioVisible) {
          return;
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ezbo:open-workflow-studio', { detail: { agentName: 'Master Specialist Agent' } }));
        }
        isOpen = false;
        break;
      case 'tools':
        activeDashboardTab.set('tools');
        isOpen = false;
        break;
      case 'agents':
        activeDashboardTab.set('agents');
        isOpen = false;
        break;
      case 'billing':
        activeDashboardTab.set('billing');
        isOpen = false;
        break;
      case 'vault':
        activeDashboardTab.set('api-keys');
        isOpen = false;
        break;
      case 'channels':
        openChannelsModal();
        break;
      case 'app':
        isAppDownloadModalOpen = true;
        break;
    }
  }

  function executeRecommendedHelper(helper: { code: string; name: string }) {
    inputMessage = `[⚡ ${helper.code} ${helper.name}] Please proceed and execute this task now.`;
    handleSend();
  }

  function sendQuickCommand(cmd: string) {
    inputMessage = cmd;
    handleSend();
  }

  async function handleSend() {
    const text = inputMessage.trim();
    if ((!text && !attachedImage) || isSending) return;

    const messageText = text || 'Please inspect this attached image.';
    const imagePayload = attachedImage ? attachedImage.url : undefined;

    inputMessage = '';
    attachedImage = null;
    isSlashOpen = false;
    isPlusMenuOpen = false;

    // Detect API Key intent in user message (Human-in-the-Loop Safe Setup)
    const detectedKey = detectApiKey(messageText);
    if (detectedKey) {
      const userMsgId = `usr-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: messageText.replace(detectedKey.rawKey, detectedKey.maskedKey),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const proposalMsgId = `bot-${Date.now()}`;
      const proposalMsg: ChatMessage = {
        id: proposalMsgId,
        role: 'assistant',
        content: `I detected a **${detectedKey.providerName}** API Key in your message.\n\nFor your security and privacy, Ezbo never stores unconfirmed keys. Would you like me to securely encrypt and save this key to your browser Vault right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: 'api_key_proposal',
        keyProposal: {
          provider: detectedKey.provider,
          providerName: detectedKey.providerName,
          rawKey: detectedKey.rawKey,
          maskedKey: detectedKey.maskedKey,
          status: 'pending'
        }
      };

      if (activeSession) {
        activeSession.messages = [...activeSession.messages, userMsg, proposalMsg];
        activeSession.updatedAt = Date.now();
        sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
        saveSessions();
      }
      chatMessages.set(activeSession ? activeSession.messages : [userMsg, proposalMsg]);
      scrollToBottom();
      return;
    }

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: messageText,
      imageUrl: imagePayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update session title if default
    if (activeSession && (activeSession.title === 'New Conversation' || activeSession.title === 'Untitled Chat')) {
      activeSession.title = generateSessionTitle(messageText);
    }

    // Append to active session and save
    if (activeSession) {
      activeSession.messages = [...activeSession.messages, userMsg];
      activeSession.updatedAt = Date.now();
      sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
      saveSessions();
    }
    chatMessages.set(activeSession ? activeSession.messages : [userMsg]);
    scrollToBottom();

    isSending = true;

    try {
      const activeVaultKey = getActiveVaultKey();
      const isCompletePlan =
        $subscription?.tier === 'complete' ||
        $subscription?.tier === 'managed' ||
        $currentUser?.tier === 'managed';

      const payload: Record<string, any> = {
        message: messageText,
        imageUrl: imagePayload,
        helperId: selectedHelperId === 'ceo' ? undefined : selectedHelperId,
        mode: selectedHelperId === 'ceo' ? 'ceo' : 'helper',
        planTier: $isProPlan ? 'byok_pro' : ($subscription?.tier || $currentUser?.tier || 'byok_starter'),
        ceoCustomPrompt: $ceoCustomPrompt || undefined,
        history: (activeSession ? activeSession.messages : []).slice(-6).map((m) => ({
          role: m.role,
          content: m.content
        }))
      };

      if (isCompletePlan) {
        payload.usePlatformKey = true;
      } else if (activeVaultKey && activeVaultKey.encryptedKey) {
        const roundRobinKeys = getRoundRobinVaultKeys(activeVaultKey.provider);
        payload.vaultKey = {
          provider: activeVaultKey.provider,
          key: decryptVaultKey(activeVaultKey.encryptedKey, activeVaultKey.provider),
          model: activeVaultKey.model,
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

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      const isMissingKey =
        Boolean(data.requiresApiKey) ||
        (data.error && /api key/i.test(data.error)) ||
        (!response.ok && response.status === 400 && data.requiresApiKey);

      if (isMissingKey) {
        const errorText =
          data.error ||
          'No API Key configured. Please add your free Google Gemini or OpenRouter key in the API Vault.';
        const botMsg: ChatMessage & { requiresApiKey?: boolean } = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: errorText,
          status: 'error',
          requiresApiKey: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (activeSession) {
          activeSession.messages = [...activeSession.messages, botMsg];
          activeSession.updatedAt = Date.now();
          sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
          saveSessions();
        }
        chatMessages.set(activeSession ? activeSession.messages : [botMsg]);
        return;
      }

      if (!response.ok) {
        if (data.error) {
          const alertMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ **AI CEO Service Notice:** ${data.error}`,
            status: 'error',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          if (activeSession) {
            activeSession.messages = [...activeSession.messages, alertMsg];
            activeSession.updatedAt = Date.now();
            sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
            saveSessions();
          }
          chatMessages.set(activeSession ? activeSession.messages : [alertMsg]);
          return;
        }
        throw new Error(`Engine communication error (${response.status})`);
      }

      let replyContent = '';
      let toolMatched: string | undefined = data.delegatedHelper
        ? `[${data.delegatedHelper.code}] ${data.delegatedHelper.name}`
        : undefined;
      let replyImageUrl: string | undefined = undefined;

      if (data.result) {
        if (data.result.type === 'image') {
          replyImageUrl =
            data.result.url ||
            data.result.image?.imageUrl ||
            data.result.imageUrl ||
            (typeof data.result.image === 'string' ? data.result.image : undefined);
          replyContent =
            data.result.caption ||
            data.result.image?.caption ||
            `🎨 **AI Visual Generated Successfully!**`;
          toolMatched = toolMatched || '[#34] AI Commercial Image Generator';
        } else if (data.result.text) {
          replyContent = data.result.text;
          toolMatched = data.delegatedHelper
            ? `[${data.delegatedHelper.code}] ${data.delegatedHelper.name}`
            : undefined;
        } else if (typeof data.result === 'string') {
          replyContent = data.result;
        }
      } else if (data.error) {
        replyContent = `⚠️ **AI CEO Alert:** ${data.error}`;
      } else {
        replyContent =
          'Your message was received, but no output was generated. Please verify your API Key in the API Vault / Settings tab.';
      }

      const navIntent = detectNavigationIntent(messageText);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        toolMatched,
        imageUrl: replyImageUrl,
        navigationAction: navIntent || undefined,
        delegatedPipeline: data.delegatedPipeline,
        recommendedHelper: data.recommendedHelper || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (activeSession) {
        activeSession.messages = [...activeSession.messages, botMsg];
        activeSession.updatedAt = Date.now();
        sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
        saveSessions();
      }
      chatMessages.set(activeSession ? activeSession.messages : [botMsg]);

      if (isCompletePlan) {
        incrementManagedUsage();
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Connection Issue:** Unable to connect to the AI CEO Engine.\n\nDetails: ${err.message}\n\nPlease verify your API Key in the Settings / Vault tab.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error'
      };

      if (activeSession) {
        activeSession.messages = [...activeSession.messages, errMsg];
        sessions = sessions.map((s) => (s.id === activeSession.id ? activeSession : s));
        saveSessions();
      }
      chatMessages.set(activeSession ? activeSession.messages : [errMsg]);
    } finally {
      isSending = false;
      scrollToBottom();
    }
  }

  function copyText(id: string, text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      copiedMessageId = id;
      setTimeout(() => {
        copiedMessageId = null;
      }, 2000);
    }
  }

  function renderMarkdown(content: string): string {
    try {
      return marked.parse(content) as string;
    } catch {
      return content.replace(/\n/g, '<br/>');
    }
  }

  function openChannelsModal() {
    isChannelsModalOpen = true;
    onOpenChannels?.();
  }
</script>

<!-- Embedded Channels Modal -->
<ChannelModal bind:isOpen={isChannelsModalOpen} />

<!-- Embedded Mobile App Download Modal -->
<AppDownloadModal bind:isOpen={isAppDownloadModalOpen} />

<!-- ====================================================================== -->
<!-- 1. FIXED FLOATING LAUNCHER BUTTON (Bottom-Right) -->
<!-- ====================================================================== -->
{#if !isOpen}
  <div class="fixed bottom-6 right-6 z-40 flex items-center gap-3">
    <!-- Animated Bouncing Speech Bubble -->
    {#if !speechBubbleDismissed}
      <div
        class="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#102A56] text-white text-xs font-semibold shadow-xl border border-[#38CFFF]/30 animate-bounce cursor-pointer group"
        onclick={() => (isOpen = true)}
        role="button"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === 'Enter') isOpen = true;
        }}
      >
        <span>👋 Hey, Ezbo is here! Click to chat</span>
        <span class="sr-only">👋 Hey, CEO is here! Click to chat</span>
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            speechBubbleDismissed = true;
          }}
          class="text-white/60 hover:text-white ml-1 cursor-pointer"
          title="Dismiss tooltip"
          aria-label="Dismiss tooltip"
        >
          <Icon name="X" size={12} />
        </button>
      </div>
    {/if}

    <!-- Launcher Avatar Button -->
    <button
      type="button"
      onclick={() => (isOpen = true)}
      class="relative w-14 h-14 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
      aria-label="Open AI CEO Executive Chat"
      title="Open Master AI CEO Chat"
    >
      <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-1">
        <img
          src="/ezbo-ceo.png"
          alt="Master AI CEO"
          class="w-full h-full object-contain drop-shadow-xs"
          onerror={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      <!-- Glowing Status Beacon (Live Pulse) -->
      <span class="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
    </button>
  </div>
{/if}

<!-- ====================================================================== -->
<!-- 2. CHATGPT-STYLE FLOATING GLASS WINDOW -->
<!-- ====================================================================== -->
{#if isOpen}
  <div
    class="fixed bottom-4 right-2.5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-20px)] sm:w-[520px] md:w-[580px] max-w-full h-[78vh] max-h-[720px] bg-white/95 backdrop-blur-2xl border border-[#CFE2FA] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    role="dialog"
    aria-label="Master AI CEO Executive Chat"
  >
    <!-- Header -->
    <div
      class="h-16 px-3.5 sm:px-5 border-b border-[#E3ECF7] bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0 gap-2 select-none"
    >
      <!-- Left: Hamburger Menu (☰) + CEO Identity & Status -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <!-- 3-line hamburger menu toggle button -->
        <button
          type="button"
          onclick={() => (isInnerSidebarOpen = !isInnerSidebarOpen)}
          class="w-8 h-8 rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-2xs"
          title="Chat History & Channels (☰)"
          aria-label="Toggle Chat History and Channels"
        >
          <Icon name="Menu" size={17} />
        </button>

        <div class="relative w-9 h-9 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shrink-0 shadow-xs">
          <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-0.5">
            <img src="/ezbo-ceo.png" alt="AI CEO" class="w-full h-full object-contain" />
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h3 class="font-extrabold text-xs sm:text-sm text-[#102A56] truncate">
              Ezbo
            </h3>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
              Online
            </span>
          </div>
          <p class="text-[10px] text-[#5E7694] truncate">
            {activeSession?.title || 'Master AI CEO • Executive Orchestrator'}
          </p>
        </div>
      </div>

      <!-- Right: Minimize & Close Controls -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Minimize (-) Button -->
        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="w-8 h-8 rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] border border-transparent hover:border-[#CFE2FA] flex items-center justify-center cursor-pointer transition-colors"
          title="Minimize to launcher"
          aria-label="Minimize Chat"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <!-- Close (✕) Button -->
        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="w-8 h-8 rounded-xl text-[#5E7694] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 flex items-center justify-center cursor-pointer transition-colors"
          title="Close chat"
          aria-label="Close Chat"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>

    <!-- Main Workspace Container (Holds Drawer & Conversation) -->
    <div class="relative flex-1 overflow-hidden flex flex-col">
      <!-- ====================================================================== -->
      <!-- Inner Sidebar Drawer (Chat History & Connect Channels) -->
      <!-- ====================================================================== -->
      {#if isInnerSidebarOpen}
        <!-- Frosted Backdrop overlay -->
        <div
          class="absolute inset-0 bg-[#0B1F42]/30 backdrop-blur-xs z-30 transition-opacity"
          onclick={() => (isInnerSidebarOpen = false)}
          role="button"
          tabindex="0"
          onkeydown={(e) => {
            if (e.key === 'Escape') isInnerSidebarOpen = false;
          }}
          aria-label="Close Sidebar"
        ></div>

        <!-- Drawer Panel -->
        <div
          class="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white/98 backdrop-blur-2xl border-r border-[#CFE2FA] z-40 shadow-2xl flex flex-col p-3.5 animate-in slide-in-from-left duration-200"
        >
          <!-- Drawer Header -->
          <div class="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF]">
                <img src="/ezbo-ceo.png" alt="CEO" class="w-5 h-5 object-contain" />
              </div>
              <div>
                <span class="text-xs font-bold text-[#102A56] block leading-tight">Ezbo AI Console</span>
                <span class="text-[9px] text-[#5E7694]">History & Channels</span>
              </div>
            </div>
            <button
              type="button"
              onclick={() => (isInnerSidebarOpen = false)}
              class="w-7 h-7 rounded-lg text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] flex items-center justify-center cursor-pointer"
              aria-label="Close Drawer"
            >
              <Icon name="X" size={15} />
            </button>
          </div>

          <!-- New Chat Button -->
          <div class="py-2.5">
            <button
              type="button"
              onclick={startNewChat}
              class="w-full py-2.5 px-3 rounded-xl blue-btn text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Icon name="Plus" size={15} />
              <span>New Chat</span>
            </button>
          </div>

            <!-- Connect Channels Button -->
          <div class="pb-2.5 border-b border-[#F1F5F9]">
            <button
              type="button"
              onclick={() => {
                isInnerSidebarOpen = false;
                openChannelsModal();
              }}
              class="w-full p-2.5 rounded-xl bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#CFE2FA] flex items-center justify-between text-xs transition-all cursor-pointer group shadow-2xs"
              title="Connect WhatsApp & Telegram"
            >
              <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <div class="text-left">
                  <p class="font-bold text-[#102A56] group-hover:text-[#1677FF] text-xs">⚡ Connect Channels</p>
                  <span class="text-[10px] text-[#5E7694]">WhatsApp & Telegram</span>
                </div>
              </div>
              <Icon name="ChevronRight" size={14} class="text-[#1677FF]" />
            </button>
          </div>

          <!-- Download Mobile App Button -->
          <div class="pb-2.5 border-b border-[#F1F5F9]">
            <button
              type="button"
              onclick={() => {
                isInnerSidebarOpen = false;
                isAppDownloadModalOpen = true;
              }}
              class="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#F3F8FF] to-white hover:bg-[#E4F0FF] border border-[#CFE2FA] flex items-center justify-between text-xs transition-all cursor-pointer group shadow-2xs"
              title="Download Ezbo Android App"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-lg bg-[#E4F0FF] text-[#1677FF] flex items-center justify-center">
                  <Icon name="Smartphone" size={14} />
                </div>
                <div class="text-left">
                  <p class="font-bold text-[#102A56] group-hover:text-[#1677FF] text-xs flex items-center gap-1.5">
                    <span>Mobile App</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#1677FF] text-white">APK</span>
                  </p>
                  <span class="text-[10px] text-[#5E7694]">120Hz Fluid Wave</span>
                </div>
              </div>
              <Icon name="Download" size={14} class="text-[#1677FF]" />
            </button>
          </div>

          <!-- Chat History Section -->
          <div class="flex-1 overflow-y-auto py-2 space-y-1">
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-[#889DB5] px-2 py-1 flex items-center justify-between">
              <span>Conversations</span>
              <span>{sessions.length}</span>
            </p>

            {#each sessions as s (s.id)}
              <div
                class="group relative flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer {s.id === activeSessionId ? 'bg-[#1677FF]/10 text-[#1677FF] font-bold border border-[#1677FF]/30' : 'hover:bg-[#F3F8FF] text-[#102A56]'}"
                onclick={() => switchSession(s.id)}
                role="button"
                tabindex="0"
                onkeydown={(e) => {
                  if (e.key === 'Enter') switchSession(s.id);
                }}
              >
                <div class="min-w-0 flex-1 pr-2">
                  <p class="text-xs truncate">{s.title || 'New Conversation'}</p>
                  <span class="text-[9px] text-[#889DB5] font-normal">{formatSessionTime(s.updatedAt)}</span>
                </div>

                {#if sessions.length > 1}
                  <button
                    type="button"
                    onclick={(e) => deleteSession(s.id, e)}
                    class="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-1 rounded-md transition-opacity cursor-pointer"
                    title="Delete conversation"
                    aria-label="Delete session"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- ====================================================================== -->
      <!-- Smart App Download Banner (Desktop: QR Code Modal, Mobile: 1-Click APK) -->
      <!-- ====================================================================== -->
      {#if !isAppBannerDismissed}
        <div class="px-3.5 py-2.5 bg-gradient-to-r from-[#1677FF]/10 via-[#38CFFF]/10 to-indigo-50/50 border-b border-[#CFE2FA] flex items-center justify-between gap-2.5 shrink-0 animate-in fade-in duration-200">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-lg bg-white border border-[#CFE2FA] shadow-xs flex items-center justify-center shrink-0">
              <Icon name="Smartphone" size={15} class="text-[#1677FF]" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-[#102A56] truncate flex items-center gap-1.5">
                <span>{isMobileDevice ? 'Get Ezbo Android App' : 'Ezbo Android App'}</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#1677FF] text-white">120Hz</span>
              </p>
              <p class="text-[10px] text-[#5E7694] truncate">
                {isMobileDevice ? 'Tap Download for 120Hz smooth chat' : 'Scan QR code with phone camera to download'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            {#if isMobileDevice}
              <a
                href="/downloads/EzboAgents.apk"
                download="EzboAgents.apk"
                class="px-2.5 py-1 rounded-lg blue-btn text-white text-[11px] font-bold shadow-xs flex items-center gap-1 hover:scale-102 transition-transform"
              >
                <Icon name="Download" size={12} />
                <span>Download Now</span>
              </a>
            {:else}
              <button
                type="button"
                onclick={() => (isAppDownloadModalOpen = true)}
                class="px-2.5 py-1 rounded-lg blue-btn text-white text-[11px] font-bold shadow-xs flex items-center gap-1 hover:scale-102 transition-transform cursor-pointer"
              >
                <Icon name="QrCode" size={12} />
                <span>Download</span>
              </button>
            {/if}

            <button
              type="button"
              onclick={() => {
                isAppBannerDismissed = true;
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('ezbo_app_banner_dismissed', 'true');
                }
              }}
              class="w-6 h-6 rounded-md text-[#5E7694] hover:text-[#102A56] hover:bg-white/60 flex items-center justify-center cursor-pointer transition-colors"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <Icon name="X" size={13} />
            </button>
          </div>
        </div>
      {/if}

      <!-- ====================================================================== -->
      <!-- Conversation Stream (ChatGPT-like clean feed) -->
      <!-- ====================================================================== -->
      <div
        bind:this={messagesContainer}
        class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth bg-linear-to-b from-[#F8FAFC]/60 to-white/80"
      >
        {#each currentMessages as msg (msg.id)}
          {#if msg.role === 'user'}
            <!-- User Message Bubble (ChatGPT Pill on right) -->
            <div class="flex items-start justify-end gap-2">
              <div
                class="max-w-[85%] bg-[#1677FF] text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs space-y-2"
              >
                {#if msg.imageUrl}
                  <div class="rounded-xl overflow-hidden border border-white/20 bg-black/10 max-w-xs">
                    <img
                      src={msg.imageUrl}
                      alt="User Attachment"
                      class="w-full h-auto object-cover max-h-56 rounded-xl"
                    />
                  </div>
                {/if}

                <p class="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words font-medium">
                  {msg.content}
                </p>
                <div class="text-[9px] text-[#CFE2FA] text-right mt-1 font-mono">
                  {msg.timestamp}
                </div>
              </div>
              <div
                class="w-7 h-7 rounded-full bg-[#E4F0FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shrink-0 text-xs font-bold"
              >
                {$currentUser?.name ? $currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          {:else}
            <!-- Assistant / CEO Message (Clean, Card-Free Stream) -->
            <div class="flex items-start gap-2.5">
              <div
                class="w-7 h-7 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shrink-0 mt-0.5 shadow-2xs"
              >
                <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img src="/ezbo-ceo.png" alt="AI CEO" class="w-5 h-5 object-contain" />
                </div>
              </div>

              <div class="max-w-[90%] space-y-2">
                <!-- Delegated Pipeline Badges if present -->
                {#if msg.delegatedPipeline && msg.delegatedPipeline.length > 0}
                  <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span class="text-[9px] font-extrabold text-[#5E7694] uppercase tracking-wider">Coordinated Pipeline:</span>
                    {#each msg.delegatedPipeline as p, idx}
                      <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#CFE2FA] text-[10px] font-bold text-[#1677FF] shadow-2xs">
                        <span class="w-3.5 h-3.5 rounded-full bg-[#1677FF] text-white flex items-center justify-center text-[8px] font-black">{idx + 1}</span>
                        <span>[{p.code}] {p.name}</span>
                      </div>
                      {#if idx < msg.delegatedPipeline.length - 1}
                        <span class="text-[#889DB5] text-xs font-bold">→</span>
                      {/if}
                    {/each}
                  </div>
                {/if}

                <!-- Delegated Helper Badge if present -->
                {#if msg.toolMatched}
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F8FF] border border-[#CFE2FA] text-[10px] font-bold text-[#1677FF]">
                    <Icon name="Zap" size={10} />
                    <span>Delegated: {msg.toolMatched}</span>
                  </div>
                {/if}

                <!-- Content Bubble -->
                <div
                  class="bg-white/90 border {msg.status === 'error'
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-[#E3ECF7]'} rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-[#102A56] shadow-xs space-y-2.5"
                >
                  <!-- Rendered Image if present -->
                  {#if msg.imageUrl}
                    <div class="rounded-xl overflow-hidden border border-[#E3ECF7] bg-[#F8FAFC] max-w-sm">
                      <img
                        src={msg.imageUrl}
                        alt="AI Generated Visual"
                        class="w-full h-auto object-cover max-h-72 rounded-xl"
                        loading="lazy"
                      />
                    </div>
                  {/if}

                  <!-- Rendered Markdown Text -->
                  <div
                    class="prose prose-xs sm:prose-sm max-w-none text-[#102A56] leading-relaxed break-words"
                  >
                    {@html renderMarkdown(msg.content)}
                  </div>


                  <!-- Interactive API Key Setup Action Card -->
                  {#if msg.keyProposal}
                    <div class="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#F3F8FF] via-indigo-50/70 to-blue-50/70 border border-[#CFE2FA] space-y-2.5 animate-in fade-in duration-200">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-white border border-[#CFE2FA] flex items-center justify-center text-xs shadow-2xs">
                            🔑
                          </div>
                          <span class="text-xs font-bold text-[#102A56]">Detected {msg.keyProposal.providerName} API Key</span>
                        </div>
                        {#if msg.keyProposal.status === 'saved'}
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Icon name="Check" size={10} /> Saved
                          </span>
                        {:else if msg.keyProposal.status === 'discarded'}
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            Discarded
                          </span>
                        {:else}
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Confirmation Required
                          </span>
                        {/if}
                      </div>

                      <div class="p-2 rounded-xl bg-white/95 border border-[#E3ECF7] font-mono text-xs text-[#102A56] flex items-center justify-between shadow-2xs">
                        <span class="tracking-wider">{msg.keyProposal.maskedKey}</span>
                        <span class="text-[10px] font-sans font-bold text-emerald-600">Valid Format</span>
                      </div>

                      {#if msg.keyProposal.status === 'pending'}
                        <div class="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onclick={() => confirmSaveKeyProposal(msg.id)}
                            class="px-3.5 py-1.5 rounded-xl blue-btn text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 transition-all"
                          >
                            <span>✅ Confirm & Save to Vault</span>
                          </button>
                          <button
                            type="button"
                            onclick={() => discardKeyProposal(msg.id)}
                            class="px-3 py-1.5 rounded-xl bg-white border border-[#E3ECF7] text-xs font-semibold text-[#5E7694] hover:text-[#102A56] hover:bg-gray-50 cursor-pointer transition-all"
                          >
                            <span>❌ Discard</span>
                          </button>
                        </div>
                      {:else if msg.keyProposal.status === 'saved'}
                        <div class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-0.5">
                          <Icon name="ShieldCheck" size={13} class="text-emerald-600" />
                          <span>Encrypted and active in your local browser Vault.</span>
                        </div>
                      {/if}
                    </div>
                  {/if}

                  <!-- Smart Site Navigation Action Chip -->
                  {#if msg.navigationAction && (msg.navigationAction.type !== 'workflow' || isWorkflowStudioVisible)}
                    <div class="mt-3 pt-2.5 border-t border-[#E3ECF7] space-y-1.5">
                      <p class="text-[11px] text-[#5E7694]">{msg.navigationAction.description}</p>
                      <button
                        type="button"
                        onclick={() => handleNavigationAction(msg.navigationAction!.type)}
                        class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#38CFFF] hover:from-[#1162DB] hover:to-[#22B8E6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                      >
                        <span>{msg.navigationAction.label}</span>
                        <Icon name="ArrowRight" size={13} />
                      </button>
                    </div>
                  {/if}

                  <!-- In-Chat Missing API Key Setup Action Chip -->
                  {#if (msg as any).requiresApiKey || (msg.role === 'assistant' && msg.content && msg.content.includes('API Key') && (msg.content.includes('API Vault') || msg.content.includes('Vault tab') || msg.content.includes('No API Key')))}
                    <div class="mt-3 pt-2.5 border-t border-[#E3ECF7] space-y-2">
                      <p class="text-[11px] text-[#5E7694]">
                        Google Gemini API is <strong>100% free with no credit card required</strong> and includes high rate limits.
                      </p>
                      <button
                        type="button"
                        onclick={() => {
                          activeDashboardTab.set('api-keys');
                          isOpen = false;
                        }}
                        class="px-3.5 py-2 rounded-xl bg-linear-to-r from-[#1677FF] to-[#38CFFF] hover:from-[#1162DB] hover:to-[#22B8E6] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                      >
                        <span>🔑 Setup API Key in Vault</span>
                        <Icon name="ArrowRight" size={13} />
                      </button>
                    </div>
                  {/if}

                  <!-- Footer with Copy Button & Timestamp -->
                  <div class="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[10px] text-[#5E7694]">
                    <span class="font-mono">{msg.timestamp}</span>

                    <button
                      type="button"
                      onclick={() => copyText(msg.id, msg.content)}
                      class="px-2 py-0.5 rounded-md hover:bg-[#F3F8FF] text-[#5E7694] hover:text-[#1677FF] transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      title="Copy message content"
                    >
                      {#if copiedMessageId === msg.id}
                        <Icon name="Check" size={11} class="text-emerald-600" />
                        <span class="text-emerald-700">Copied</span>
                      {:else}
                        <Icon name="Copy" size={11} />
                        <span>Copy</span>
                      {/if}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/each}

        <!-- Animated Typing Indicator for initial welcome message -->
        {#if isTypingWelcome}
          <div class="flex items-start gap-2.5 animate-in fade-in duration-150">
            <div
              class="w-7 h-7 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shrink-0 shadow-2xs"
            >
              <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/ezbo-ceo.png" alt="AI CEO" class="w-5 h-5 object-contain" />
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-white border border-[#E3ECF7] shadow-xs flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce"></span>
              <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce [animation-delay:150ms]"></span>
              <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce [animation-delay:300ms]"></span>
              <span class="text-xs text-[#5E7694] ml-1 font-medium">CEO is typing...</span>
            </div>
          </div>
        {/if}

        <!-- Ongoing Request Typing Indicator -->
        {#if isSending}
          <div class="flex items-start gap-2.5">
            <div
              class="w-7 h-7 rounded-full bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shrink-0 shadow-2xs"
            >
              <div class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/ezbo-ceo.png" alt="AI CEO" class="w-5 h-5 object-contain" />
              </div>
            </div>
            <div class="p-3.5 rounded-2xl bg-white border border-[#E3ECF7] shadow-xs flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce"></span>
              <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce [animation-delay:150ms]"></span>
              <span class="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce [animation-delay:300ms]"></span>
              <span class="text-xs text-[#5E7694] ml-1.5 font-medium">CEO orchestrating...</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- ====================================================================== -->
      <!-- Chat Input Bar & Popovers (Clean, Margin-Corrected, Zero Footer Hints) -->
      <!-- ====================================================================== -->
      <div class="relative p-3 sm:p-4 border-t border-[#E3ECF7] bg-white/95 shrink-0">
        <!-- Hidden File & Camera Inputs -->
        <input
          bind:this={fileInputRef}
          type="file"
          accept="image/*"
          class="hidden"
          onchange={handleImagePicked}
        />
        <input
          bind:this={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          onchange={handleImagePicked}
        />

        <!-- Attached Image Preview Chip -->
        {#if attachedImage}
          <div class="mb-2.5 flex items-center gap-2 p-1.5 pr-2.5 bg-[#F3F8FF] border border-[#CFE2FA] rounded-xl w-fit shadow-2xs animate-in fade-in duration-150">
            <img src={attachedImage.url} alt="Attached Preview" class="w-9 h-9 rounded-lg object-cover border border-[#CFE2FA]" />
            <div class="min-w-0">
              <span class="text-xs font-bold text-[#102A56] block max-w-[160px] truncate">{attachedImage.name}</span>
              <span class="text-[9px] text-emerald-600 font-semibold">Ready to send</span>
            </div>
            <button
              type="button"
              onclick={() => (attachedImage = null)}
              class="text-[#5E7694] hover:text-rose-600 ml-1 p-1 rounded-md cursor-pointer transition-colors"
              title="Remove image"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        {/if}

        <!-- 1. Plus (+) Attachment Menu Popover -->
        {#if isPlusMenuOpen}
          <div
            class="absolute bottom-full left-3 sm:left-4 mb-2 w-64 bg-white/98 backdrop-blur-xl border border-[#CFE2FA] rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div class="flex items-center justify-between px-2.5 py-1.5 border-b border-[#F1F5F9] text-xs font-bold text-[#102A56]">
              <span>Attach Media</span>
              <button
                type="button"
                onclick={() => (isPlusMenuOpen = false)}
                class="text-[#5E7694] hover:text-[#102A56] cursor-pointer"
              >
                <Icon name="X" size={14} />
              </button>
            </div>

            <div class="py-1 space-y-1">
              <button
                type="button"
                onclick={() => {
                  cameraInputRef?.click();
                  isPlusMenuOpen = false;
                }}
                class="w-full px-2.5 py-2 rounded-xl hover:bg-[#F3F8FF] text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
              >
                <div class="w-8 h-8 rounded-lg bg-[#F3F8FF] group-hover:bg-white border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shrink-0">
                  <Icon name="Camera" size={16} />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-[#102A56] group-hover:text-[#1677FF]">Take Photo</p>
                  <span class="text-[10px] text-[#5E7694]">Open device camera</span>
                </div>
              </button>

              <button
                type="button"
                onclick={() => {
                  fileInputRef?.click();
                  isPlusMenuOpen = false;
                }}
                class="w-full px-2.5 py-2 rounded-xl hover:bg-[#F3F8FF] text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
              >
                <div class="w-8 h-8 rounded-lg bg-[#F3F8FF] group-hover:bg-white border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shrink-0">
                  <Icon name="Image" size={16} />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-[#102A56] group-hover:text-[#1677FF]">Upload Image</p>
                  <span class="text-[10px] text-[#5E7694]">Choose from gallery or files</span>
                </div>
              </button>
            </div>
          </div>
        {/if}

        <!-- 2. Slash Command (/) Autocomplete Popover (Lists 75 AI Helpers) -->
        {#if isSlashOpen && filteredTools.length > 0}
          <div
            class="absolute bottom-full left-3 right-3 sm:left-4 sm:right-4 mb-2 max-h-64 bg-white/95 backdrop-blur-xl border border-[#CFE2FA] rounded-2xl shadow-2xl overflow-y-auto z-30 divide-y divide-[#F1F5F9]"
          >
            <div class="p-2.5 bg-[#F3F8FF] border-b border-[#CFE2FA] flex items-center justify-between text-xs font-bold text-[#102A56] sticky top-0 z-10">
              <div class="flex items-center gap-1.5">
                <span class="text-[#1677FF]">⚡</span>
                <span>Select Specialist Helper ({filteredTools.length} found)</span>
              </div>
              <span class="text-[10px] text-[#5E7694]">↑↓ to navigate • Enter to select</span>
            </div>

            {#each filteredTools as tool, idx}
              {@const isUnlocked = isHelperUnlocked(tool.id, $subscription?.tier, $plansStore)}
              <button
                type="button"
                onclick={() => selectHelper(tool)}
                class="w-full px-3 py-2 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors {idx ===
                selectedSlashIndex
                  ? 'bg-[#1677FF]/10 text-[#1677FF]'
                  : 'hover:bg-[#F8FAFC] text-[#102A56]'}"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  {#if tool.code && !tool.code.startsWith('#')}
                    <span class="px-1.5 py-0.5 rounded-md font-mono font-bold text-[11px] shrink-0 {isUnlocked ? 'bg-[#1677FF]/10 text-[#1677FF]' : 'bg-gray-100 text-gray-500'}">
                      {tool.code}
                    </span>
                  {/if}
                  <div class="w-5 h-5 rounded flex items-center justify-center shrink-0">
                    <BrandIcon name={tool.name} modelId={tool.id} icon={tool.icon} size={16} />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold break-words flex items-center gap-1.5">
                      <span>{tool.name}</span>
                      {#if !isUnlocked}
                        <Icon name="Lock" size={11} class="text-amber-500 shrink-0" />
                      {/if}
                    </p>
                    <p class="text-[10px] text-[#5E7694] break-words">{tool.agentName} • {tool.categoryName}</p>
                  </div>
                </div>

                {#if !isUnlocked}
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 border border-amber-200 text-amber-700 shrink-0 flex items-center gap-1 shadow-2xs">
                    <Icon name="Lock" size={9} />
                    <span>PRO</span>
                  </span>
                {:else if tool.badge}
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F3F8FF] border border-[#CFE2FA] text-[#1677FF] shrink-0">
                    {tool.badge}
                  </span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}

        <!-- Main Input Bar Form -->
        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          class="flex items-end gap-2"
        >
          <!-- Sleek '+' Plus Action Button (Opens Photo/Camera menu) -->
          <button
            type="button"
            onclick={() => {
              isPlusMenuOpen = !isPlusMenuOpen;
              if (isPlusMenuOpen) isSlashOpen = false;
            }}
            class="w-10 h-10 rounded-xl bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#CFE2FA] text-[#1677FF] transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
            title="Attach Photo or Image (+)"
            aria-label="Attach Photo or Image"
          >
            <Icon name="Plus" size={20} />
          </button>

          <!-- Prompt Textarea -->
          <div class="flex-1 relative min-w-0">
            <textarea
              bind:this={textareaRef}
              bind:value={inputMessage}
              oninput={handleInput}
              onkeydown={handleKeyDown}
              rows="1"
              placeholder="Ask Ezbo anything, or type / to invoke custom agents..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE2FA] text-xs sm:text-sm text-[#102A56] placeholder-[#889DB5] focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 bg-[#F8FAFC] resize-none max-h-32 leading-relaxed"
            ></textarea>
          </div>

          <!-- Send Button -->
          <button
            type="submit"
            disabled={isSending || (!inputMessage.trim() && !attachedImage)}
            class="w-10 h-10 rounded-xl blue-btn text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
            title="Send message (Enter)"
            aria-label="Send message to AI CEO"
          >
            {#if isSending}
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {:else}
              <Icon name="ArrowRight" size={18} />
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
