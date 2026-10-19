import { writable, get, derived } from 'svelte/store';
import type { AITool } from '$lib/config/tools';
import { getDecryptedKey, saveEncryptedKey, clearStoredKey, encryptVaultKey, decryptVaultKey } from '$lib/services/crypto';
import { offlineStorage } from '$lib/services/offlineStorage';
import { DEFAULT_PLANS, type PlansSettings } from '$lib/config/plans';

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
export type DashboardTab = 'chat' | 'agents' | 'store' | 'owned-agents' | 'channels' | 'billing' | 'settings' | 'api-keys' | 'tools' | 'whatsapp' | 'vault';
export type AIProvider = 'gemini' | 'openai' | 'grok' | 'deepseek' | 'openrouter' | 'replicate';
export type RoutingStrategy = 'auto_free_rotate' | 'single_model' | 'multi_provider_rotate';
export type PlanTier = 'byok_starter' | 'byok_pro' | 'managed' | 'byok' | 'complete' | 'pro' | 'ultra' | 'free';
export type BillingInterval = 'monthly' | 'yearly';

export interface ApiVaultKey {
  id: string;
  provider: AIProvider;
  label: string;
  encryptedKey: string;
  model?: string;
  isDefault: boolean;
  isEnabled?: boolean;
  addedAt: string;
  lastValidated?: string;
  isValid?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  isSubscribed: boolean;
  plan: 'free' | 'monthly' | 'yearly'; // legacy compat
  tier: PlanTier;
  createdAt: string;
}

export interface SubscriptionState {
  tier: PlanTier;
  interval: BillingInterval;
  status: 'active' | 'expired' | 'grace_period' | 'cancelled';
  expiresAt: string;
  autoRenew?: boolean;
  cancelledAt?: string;
  // Legacy fields for compatibility
  plan: 'free' | 'monthly' | 'yearly';
  isVip: boolean;
  // Complete plan usage tracking
  managedUsage?: {
    usedThisMonth: number;
    monthlyLimit: number;
    resetsAt: string;
  };
  // Store unlocks
  unlockedStoreBots: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolMatched?: string;
  imageUrl?: string;
  status?: 'sending' | 'done' | 'error';
  provider?: AIProvider;
  requiresApiKey?: boolean;
  actionCard?: 'api_key_proposal' | 'navigation' | 'multi_agent_pipeline';
  keyProposal?: {
    provider: AIProvider;
    providerName: string;
    rawKey: string;
    maskedKey: string;
    status: 'pending' | 'saved' | 'discarded';
  };
  navigationAction?: {
    type: 'workflow' | 'tools' | 'agents' | 'billing' | 'vault' | 'channels' | 'app';
    label: string;
    description?: string;
  };
  delegatedPipeline?: Array<{
    id: string;
    code: string;
    name: string;
    icon?: string;
    badge?: string;
  }>;
}

// -------------------------------------------------------------
// Initial State Loaders (Browser-Safe)
// -------------------------------------------------------------
const initialKey = typeof window !== 'undefined' ? getDecryptedKey() : '';

function loadInitialUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('superai_user');
    if (!raw) return null;
    const user: UserProfile = JSON.parse(raw);
    let modified = false;

    // Migrate legacy plan -> 3-tier system with grandfathering
    if (user.tier === 'complete') {
      user.tier = 'managed';
      modified = true;
    } else if (user.tier === 'byok' || user.tier === 'pro' || user.tier === 'ultra' || !user.tier) {
      user.tier = user.isSubscribed ? 'byok_pro' : 'byok_starter';
      modified = true;
    }

    if (modified) {
      try {
        localStorage.setItem('superai_user', JSON.stringify(user));
      } catch {
        // ignore quota
      }
    }
    return user;
  } catch (e) {
    return null;
  }
}

function loadInitialChat(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('superai_chat_history');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi, how can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
}

function loadInitialVault(): ApiVaultKey[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ezbo_api_vault');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function loadInitialCeoCustomPrompt(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('ezbo_ceo_custom_prompt') || '';
  } catch {
    return '';
  }
}

function loadInitialSubscription(): SubscriptionState {
  const initialUser = loadInitialUser();
  const defaultSub: SubscriptionState = {
    tier: (initialUser?.tier as PlanTier) || 'byok_starter',
    interval: 'monthly',
    status: initialUser?.isSubscribed ? 'active' : 'expired',
    expiresAt: initialUser?.isSubscribed
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(0).toISOString(),
    autoRenew: !!initialUser?.isSubscribed,
    plan: 'monthly',
    isVip: !!initialUser?.isSubscribed,
    unlockedStoreBots: []
  };
  if (typeof window === 'undefined') return defaultSub;
  try {
    const raw = localStorage.getItem('superai_subscription');
    if (!raw) return defaultSub;
    const parsed: SubscriptionState = JSON.parse(raw);
    const isActive = !!(initialUser?.isSubscribed || parsed.status === 'active' || parsed.isVip);
    let modified = false;

    // Migrate legacy tier -> 3-tier system with grandfathering
    if (parsed.tier === 'complete') {
      parsed.tier = 'managed';
      modified = true;
    } else if (parsed.tier === 'byok' || parsed.tier === 'ultra' || parsed.tier === 'pro' || !parsed.tier) {
      parsed.tier = isActive ? 'byok_pro' : 'byok_starter';
      modified = true;
    }
    if (!parsed.unlockedStoreBots) parsed.unlockedStoreBots = [];
    if (initialUser && !initialUser.isSubscribed) {
      parsed.status = 'expired';
      parsed.isVip = false;
    }

    if (modified) {
      try {
        localStorage.setItem('superai_subscription', JSON.stringify(parsed));
      } catch {
        // ignore quota
      }
    }
    return parsed;
  } catch (e) {
    return defaultSub;
  }
}

function loadInitialRoutingStrategy(): RoutingStrategy {
  if (typeof window === 'undefined') return 'auto_free_rotate';
  try {
    return (localStorage.getItem('ezbo_routing_strategy') as RoutingStrategy) || 'auto_free_rotate';
  } catch {
    return 'auto_free_rotate';
  }
}

function loadInitialProviderToggles(): Record<string, boolean> {
  const defaults = { gemini: true, openrouter: true, openai: true, grok: true, deepseek: true, replicate: true };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem('ezbo_provider_toggles');
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

function loadInitialOpenRouterModels(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ezbo_openrouter_selected_models');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Stores
// -------------------------------------------------------------
export const currentUser = writable<UserProfile | null>(loadInitialUser());
export const isAuthenticated = writable<boolean>(!!loadInitialUser());
export const apiKey = writable<string>(initialKey);
export const isKeyValid = writable<boolean>(!!initialKey);
export const whatsappStatus = writable<WhatsAppStatus>('disconnected');
export const whatsappQr = writable<string | null>(null);
export const activeDashboardTab = writable<DashboardTab>('agents');
export const activeTool = writable<AITool | null>(null);
export const isDrawerOpen = writable<boolean>(false);
export const activeCategory = writable<string>('all');
export const searchQuery = writable<string>('');
export const subscription = writable<SubscriptionState>(loadInitialSubscription());
export const apiVault = writable<ApiVaultKey[]>(loadInitialVault());
export const activeVaultKeyId = writable<string | null>(null);
export const ceoCustomPrompt = writable<string>(loadInitialCeoCustomPrompt());
export const routingStrategy = writable<RoutingStrategy>(loadInitialRoutingStrategy());
export const providerToggles = writable<Record<string, boolean>>(loadInitialProviderToggles());
export const openrouterSelectedModels = writable<string[]>(loadInitialOpenRouterModels());
export const adminAllowedProviders = writable<Record<string, boolean>>({
  gemini: true,
  openrouter: true,
  openai: true,
  grok: true,
  deepseek: true,
  replicate: true
});

/**
 * Universal helper to determine whether a given user and subscription constitute an active Pro Plan.
 * Accurately covers all historical and canonical tier variants ('byok_pro', 'pro', 'managed', 'ultra', 'complete', and active grandfathered 'byok').
 */
export function isUserProTier(sub?: SubscriptionState | null, user?: UserProfile | null): boolean {
  const subTier = sub?.tier;
  const userTier = user?.tier;
  const isSubActive = sub?.status === 'active' || !!user?.isSubscribed;

  if (!isSubActive) return false;

  const proTiers = ['byok_pro', 'pro', 'managed', 'complete', 'ultra'];
  if (subTier && proTiers.includes(subTier)) return true;
  if (userTier && proTiers.includes(userTier)) return true;

  // Grandfathered 'byok' subscribers are treated as Pro
  if (subTier === 'byok' || userTier === 'byok') return true;

  // If active subscriber and not explicitly starter or free
  if (isSubActive && subTier !== 'byok_starter' && subTier !== 'free' && userTier !== 'byok_starter' && userTier !== 'free') {
    return true;
  }

  return false;
}

export const isProPlan = derived([subscription, currentUser], ([$sub, $user]) => isUserProTier($sub, $user));


if (typeof window !== 'undefined') {
  fetch('/api/admin/settings')
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.settings?.providersAllowed) {
        adminAllowedProviders.set(data.settings.providersAllowed);
      }
    })
    .catch(() => {});
}

export function setRoutingStrategy(strategy: RoutingStrategy): void {
  routingStrategy.set(strategy);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ezbo_routing_strategy', strategy);
    } catch {
      // ignore
    }
  }
}

export function setProviderToggle(provider: string, enabled: boolean): void {
  providerToggles.update((curr) => {
    const updated = { ...curr, [provider]: enabled };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ezbo_provider_toggles', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  });
}

export function toggleVaultKeyEnabled(keyId: string): void {
  apiVault.update((keys) => {
    const updated = keys.map((k) => (k.id === keyId ? { ...k, isEnabled: k.isEnabled === false ? true : false } : k));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ezbo_api_vault', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  });
}

export function setCeoCustomPrompt(prompt: string): void {
  ceoCustomPrompt.set(prompt);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ezbo_ceo_custom_prompt', prompt);
    } catch (e) {
      console.warn('LocalStorage quota exceeded or unavailable:', e);
    }
  }
}

export const saveCeoCustomPrompt = setCeoCustomPrompt;

// Initialize default vault key from legacy single key
if (typeof window !== 'undefined') {
  const legacyKey = getDecryptedKey();
  const vault = loadInitialVault();
  if (legacyKey && vault.length === 0) {
    const defaultEntry: ApiVaultKey[] = [{
      id: `vault-${Date.now()}`,
      provider: 'gemini',
      label: 'My Gemini Key',
      encryptedKey: legacyKey, // will be re-encrypted below
      model: 'gemini-2.0-flash',
      isDefault: true,
      addedAt: new Date().toISOString(),
      isValid: true
    }];
    localStorage.setItem('ezbo_api_vault', JSON.stringify(defaultEntry));
    apiVault.set(defaultEntry);
  }
}

// -------------------------------------------------------------
// Vault Actions
// -------------------------------------------------------------
export function addVaultKey(entry: Omit<ApiVaultKey, 'id' | 'addedAt'>): ApiVaultKey {
  const newKey: ApiVaultKey = {
    ...entry,
    id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedAt: new Date().toISOString()
  };
  apiVault.update((vault) => {
    // If this is default, unset others
    const updated = entry.isDefault
      ? vault.map((k) => ({ ...k, isDefault: false }))
      : [...vault];
    const final = [...updated, newKey];
    localStorage.setItem('ezbo_api_vault', JSON.stringify(final));
    return final;
  });
  return newKey;
}

export function removeVaultKey(id: string): void {
  apiVault.update((vault) => {
    const filtered = vault.filter((k) => k.id !== id);
    localStorage.setItem('ezbo_api_vault', JSON.stringify(filtered));
    return filtered;
  });
}

export function setDefaultVaultKey(id: string): void {
  apiVault.update((vault) => {
    const updated = vault.map((k) => ({ ...k, isDefault: k.id === id }));
    localStorage.setItem('ezbo_api_vault', JSON.stringify(updated));
    return updated;
  });
  activeVaultKeyId.set(id);
}

export function setOpenRouterSelectedModels(models: string[]): void {
  openrouterSelectedModels.set(models);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ezbo_openrouter_selected_models', JSON.stringify(models));
    } catch {
      // ignore
    }
  }
}

export function addOpenRouterSelectedModel(modelId: string): void {
  openrouterSelectedModels.update((current) => {
    if (current.includes(modelId)) return current;
    const updated = [...current, modelId];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ezbo_openrouter_selected_models', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  });
}

export function removeOpenRouterSelectedModel(modelId: string): void {
  openrouterSelectedModels.update((current) => {
    const updated = current.filter((m) => m !== modelId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ezbo_openrouter_selected_models', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  });
}

const providerRoundRobinPointers: Record<string, number> = {};

export function getActiveVaultKeys(provider?: AIProvider): ApiVaultKey[] {
  const vault = get(apiVault);
  return vault.filter((k) => k.isEnabled !== false && (!provider || k.provider === provider));
}

export function getRoundRobinVaultKeys(provider?: AIProvider): ApiVaultKey[] {
  const activeKeys = getActiveVaultKeys(provider);
  if (activeKeys.length <= 1) return activeKeys;
  const keyType = provider || 'global';
  const curr = providerRoundRobinPointers[keyType] ?? 0;
  const start = curr % activeKeys.length;
  providerRoundRobinPointers[keyType] = (start + 1) % activeKeys.length;
  return [...activeKeys.slice(start), ...activeKeys.slice(0, start)];
}

export function getActiveVaultKey(): ApiVaultKey | null {
  const vault = get(apiVault);
  const enabledKeys = vault.filter((k) => k.isEnabled !== false);
  const candidates = enabledKeys.length > 0 ? enabledKeys : vault;
  const activeId = get(activeVaultKeyId);
  if (activeId) {
    const found = candidates.find((k) => k.id === activeId);
    if (found) return found;
  }
  return candidates.find((k) => k.isDefault) || candidates[0] || null;
}

// -------------------------------------------------------------
// Subscription Actions
// -------------------------------------------------------------
export function cancelSubscription(): void {
  subscription.update((sub) => {
    const updated: SubscriptionState = {
      ...sub,
      status: 'cancelled',
      autoRenew: false,
      cancelledAt: new Date().toISOString()
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('superai_subscription', JSON.stringify(updated));
    }
    return updated;
  });
}

export function reactivateSubscription(): void {
  subscription.update((sub) => {
    const updated: SubscriptionState = {
      ...sub,
      status: 'active',
      autoRenew: true,
      cancelledAt: undefined
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('superai_subscription', JSON.stringify(updated));
    }
    return updated;
  });
}

export function switchPlan(tier: PlanTier, interval: BillingInterval = 'monthly'): void {
  subscription.update((sub) => {
    const days = interval === 'yearly' ? 365 : 30;
    const monthlyUsedReset = new Date();
    monthlyUsedReset.setMonth(monthlyUsedReset.getMonth() + 1);

    const updated: SubscriptionState = {
      tier,
      interval,
      status: 'active',
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      cancelledAt: undefined,
      plan: interval === 'yearly' ? 'yearly' : 'monthly',
      isVip: true,
      unlockedStoreBots: sub.unlockedStoreBots || [],
      managedUsage: (tier === 'managed' || tier === 'complete') ? {
        usedThisMonth: 0,
        monthlyLimit: 5000,
        resetsAt: monthlyUsedReset.toISOString()
      } : undefined
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('superai_subscription', JSON.stringify(updated));
    }
    return updated;
  });

  currentUser.update((user) => {
    if (!user) return null;
    const updatedUser: UserProfile = {
      ...user,
      isSubscribed: true,
      tier,
      plan: interval === 'yearly' ? 'yearly' : 'monthly'
    };
    saveUserSession(updatedUser);
    const db = getStoredUsersDb();
    if (db[user.email.toLowerCase()]) {
      db[user.email.toLowerCase()].user = updatedUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('superai_registered_users', JSON.stringify(db));
      }
    }
    return updatedUser;
  });
}

export function unlockStoreBot(botId: string): void {
  subscription.update((sub) => {
    const updated = {
      ...sub,
      unlockedStoreBots: [...new Set([...(sub.unlockedStoreBots || []), botId])]
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('superai_subscription', JSON.stringify(updated));
    }
    return updated;
  });
}

export function incrementManagedUsage(): void {
  subscription.update((sub) => {
    if (!sub.managedUsage) return sub;
    const updated = {
      ...sub,
      managedUsage: {
        ...sub.managedUsage,
        usedThisMonth: sub.managedUsage.usedThisMonth + 1
      }
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('superai_subscription', JSON.stringify(updated));
    }
    return updated;
  });
}

export const chatMessages = writable<ChatMessage[]>(loadInitialChat());

// Dual-Tier Persistence: Asynchronously load unbounded IndexedDB history and reconcile
if (typeof window !== 'undefined') {
  offlineStorage
    .getAllMessages()
    .then((storedMsgs) => {
      if (storedMsgs && storedMsgs.length > 0) {
        chatMessages.update((current) => {
          const idMap = new Map<string, ChatMessage>();
          for (const msg of storedMsgs) {
            if (msg && msg.id) idMap.set(msg.id, msg);
          }
          for (const msg of current) {
            if (msg && msg.id) idMap.set(msg.id, msg);
          }
          const reconciled = Array.from(idMap.values());
          try {
            localStorage.setItem(
              'superai_chat_history',
              JSON.stringify(reconciled.slice(-50))
            );
          } catch {
            // ignore
          }
          return reconciled;
        });
      } else {
        const current = get(chatMessages);
        if (current && current.length > 0) {
          for (const msg of current) {
            offlineStorage.saveMessage(msg).catch(() => {});
          }
        }
      }
    })
    .catch((err) => {
      console.warn('[userStore] Failed to hydrate messages from offlineStorage:', err);
    });
}

// -------------------------------------------------------------
// Authentication Helper Actions (Production-Ready)
// -------------------------------------------------------------
interface StoredUserAccount {
  user: UserProfile;
  passHash: string;
}

function getStoredUsersDb(): Record<string, StoredUserAccount> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('superai_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveUserToDb(email: string, account: StoredUserAccount) {
  if (typeof window === 'undefined') return;
  try {
    const db = getStoredUsersDb();
    db[email.toLowerCase()] = account;
    localStorage.setItem('superai_registered_users', JSON.stringify(db));
  } catch (e) {
    // ignore
  }
}

export function getAllLocalRegisteredUsers(): UserProfile[] {
  const db = getStoredUsersDb();
  const list = Object.values(db).map((a) => a.user);
  const curr = get(currentUser);
  if (curr && !list.some((u) => u.email.toLowerCase() === curr.email.toLowerCase())) {
    list.push(curr);
  }
  return list;
}

export interface ServerUserGrant {
  email: string;
  name?: string;
  isSubscribed: boolean;
  tier: 'byok_starter' | 'byok_pro' | 'managed' | 'byok' | 'complete' | 'pro' | 'ultra' | 'free';
  interval: 'monthly' | 'yearly';
  unlockedStoreBots: string[];
  expiresAt: string;
  grantedAt?: string;
  updatedAt?: string;
  note?: string;
}

export function applyAdminGrantLocally(grant: ServerUserGrant): void {
  if (typeof window === 'undefined' || !grant || !grant.email) return;
  const cleanEmail = grant.email.trim().toLowerCase();

  let effectiveTier: PlanTier = grant.tier;
  if (effectiveTier === 'byok' || effectiveTier === 'pro' || effectiveTier === 'ultra') {
    effectiveTier = grant.isSubscribed ? 'byok_pro' : 'byok_starter';
  } else if (effectiveTier === 'complete') {
    effectiveTier = 'managed';
  }

  // 1. Update in local registered users DB if exists
  const db = getStoredUsersDb();
  if (db[cleanEmail]) {
    db[cleanEmail].user = {
      ...db[cleanEmail].user,
      name: grant.name || db[cleanEmail].user.name,
      isSubscribed: grant.isSubscribed,
      tier: effectiveTier,
      plan: grant.interval
    };
    localStorage.setItem('superai_registered_users', JSON.stringify(db));
  }

  // 2. If this grant is for the currently logged-in user, update active stores & session
  const curr = get(currentUser);
  if (curr && curr.email.trim().toLowerCase() === cleanEmail) {
    const updatedUser: UserProfile = {
      ...curr,
      name: grant.name || curr.name,
      isSubscribed: grant.isSubscribed,
      tier: effectiveTier,
      plan: grant.interval
    };
    saveUserSession(updatedUser);

    subscription.update((sub) => {
      const monthlyUsedReset = new Date();
      monthlyUsedReset.setMonth(monthlyUsedReset.getMonth() + 1);
      const days = grant.interval === 'yearly' ? 365 : 30;
      const updatedSub: SubscriptionState = {
        ...sub,
        tier: effectiveTier,
        interval: grant.interval,
        status: grant.isSubscribed ? 'active' : 'expired',
        expiresAt: grant.expiresAt || (grant.isSubscribed ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : new Date(0).toISOString()),
        autoRenew: grant.isSubscribed,
        plan: grant.interval,
        isVip: grant.isSubscribed,
        unlockedStoreBots: Array.from(new Set(grant.unlockedStoreBots || [])),
        managedUsage: effectiveTier === 'managed' ? (sub.managedUsage || {
          usedThisMonth: 0,
          monthlyLimit: 5000,
          resetsAt: monthlyUsedReset.toISOString()
        }) : undefined
      };
      localStorage.setItem('superai_subscription', JSON.stringify(updatedSub));
      return updatedSub;
    });
  }
}

export async function syncUserAccessWithServer(overrideUser?: UserProfile): Promise<{ hasGrant: boolean; grant?: ServerUserGrant }> {
  if (typeof window === 'undefined') return { hasGrant: false };
  const targetUser = overrideUser || get(currentUser);
  if (!targetUser || !targetUser.email) return { hasGrant: false };

  try {
    const sub = get(subscription);
    const allLocalUsers = getAllLocalRegisteredUsers();
    const res = await fetch('/api/user/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        provider: targetUser.provider,
        isSubscribed: targetUser.isSubscribed,
        tier: targetUser.tier,
        unlockedStoreBots: sub.unlockedStoreBots || [],
        createdAt: targetUser.createdAt,
        allLocalUsers
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.hasGrant && data.grant) {
        applyAdminGrantLocally(data.grant);
        return { hasGrant: true, grant: data.grant };
      }
    }
  } catch (e) {
    console.warn('Could not sync user access with server:', e);
  }

  return { hasGrant: false };
}

export async function loginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !pass) {
    return { success: false, error: 'Email and password are required.' };
  }
  try {
    const db = getStoredUsersDb();
    const account = db[cleanEmail];
    if (!account) {
      return { success: false, error: 'No account found with this email. Please check your credentials or click "Sign Up Free" to create your account.' };
    }
    if (account.passHash !== pass) {
      return { success: false, error: 'Incorrect password. Click "Forgot password?" if you need to reset it.' };
    }
    saveUserSession(account.user);
    if (!account.user.isSubscribed) {
      subscription.update((s) => ({ ...s, status: 'expired', isVip: false }));
      if (typeof window !== 'undefined') {
        const sub = get(subscription);
        localStorage.setItem('superai_subscription', JSON.stringify(sub));
      }
    }
    await syncUserAccessWithServer(account.user);
    return { success: true, user: get(currentUser) || account.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed.' };
  }
}

export async function signupWithEmail(name: string, email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  if (!cleanName || !cleanEmail || !pass) {
    return { success: false, error: 'All fields are required.' };
  }
  if (pass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  try {
    const db = getStoredUsersDb();
    if (db[cleanEmail]) {
      return { success: false, error: 'An account with this email already exists. Please log in directly.' };
    }
    const user: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=2563eb&color=ffffff`,
      provider: 'email',
      isSubscribed: false,
      plan: 'monthly',
      tier: 'byok_starter',
      createdAt: new Date().toISOString()
    };
    saveUserToDb(cleanEmail, { user, passHash: pass });
    saveUserSession(user);
    const unpaidSub: SubscriptionState = {
      tier: 'byok_starter',
      interval: 'monthly',
      status: 'expired',
      expiresAt: new Date(0).toISOString(),
      autoRenew: false,
      plan: 'monthly',
      isVip: false,
      unlockedStoreBots: []
    };
    subscription.set(unpaidSub);
    if (typeof window !== 'undefined') {
      localStorage.setItem('superai_subscription', JSON.stringify(unpaidSub));
    }
    await syncUserAccessWithServer(user);
    if (typeof window !== 'undefined') {
      fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: user.email, name: user.name, type: 'welcome' })
      }).catch((e) => console.warn('Welcome email trigger:', e));
    }
    return { success: true, user: get(currentUser) || user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sign up failed.' };
  }
}

export async function resetPassword(email: string, newPass: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !newPass) {
    return { success: false, error: 'Email and new password are required.' };
  }
  if (newPass.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }
  try {
    const db = getStoredUsersDb();
    const account = db[cleanEmail];
    if (!account) {
      return { success: false, error: 'No account registered with this email address.' };
    }
    account.passHash = newPass;
    saveUserToDb(cleanEmail, account);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reset password.' };
  }
}

export function checkUserExists(email: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return false;
  const db = getStoredUsersDb();
  return !!db[cleanEmail];
}

export function getUserAccount(email: string): UserProfile | null {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;
  const db = getStoredUsersDb();
  return db[cleanEmail]?.user || null;
}

export interface GoogleAuthPayload {
  email: string;
  name?: string;
  avatar?: string;
  password?: string;
  sub?: string;
}

export function decodeGoogleJwt(token: string): GoogleAuthPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const data = JSON.parse(jsonPayload);
    return {
      email: data.email,
      name: data.name || data.given_name || data.email?.split('@')[0],
      avatar: data.picture,
      sub: data.sub
    };
  } catch (e) {
    console.error('Failed to decode Google JWT token:', e);
    return null;
  }
}

export async function loginOrCreateWithGoogle(payload: GoogleAuthPayload): Promise<{ success: boolean; isNewUser: boolean; user?: UserProfile; error?: string }> {
  try {
    if (!payload || !payload.email || !payload.email.includes('@')) {
      return { success: false, isNewUser: false, error: 'A valid Google/Gmail address is required.' };
    }
    const cleanEmail = payload.email.trim().toLowerCase();
    const db = getStoredUsersDb();
    const existing = db[cleanEmail];
    if (existing) {
      if (payload.password && payload.password.length >= 6) {
        existing.passHash = payload.password;
        saveUserToDb(cleanEmail, existing);
      }
      saveUserSession(existing.user);
      if (!existing.user.isSubscribed) {
        subscription.update((s) => ({ ...s, status: 'expired', isVip: false }));
        if (typeof window !== 'undefined') {
          const sub = get(subscription);
          localStorage.setItem('superai_subscription', JSON.stringify(sub));
        }
      }
      await syncUserAccessWithServer(existing.user);
      return { success: true, isNewUser: false, user: get(currentUser) || existing.user };
    }
    const derivedName = payload.name?.trim() || cleanEmail.split('@')[0];
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    const avatar = payload.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=4285F4&color=fff`;
    const newUser: UserProfile = {
      id: payload.sub ? `goog-${payload.sub}` : `usr-${Date.now().toString(36)}`,
      name: formattedName,
      email: cleanEmail,
      avatar,
      provider: 'google',
      isSubscribed: false,
      plan: 'monthly',
      tier: 'byok_starter',
      createdAt: new Date().toISOString()
    };
    saveUserToDb(cleanEmail, { user: newUser, passHash: payload.password || '' });
    saveUserSession(newUser);
    const unpaidSub: SubscriptionState = {
      tier: 'byok_starter',
      interval: 'monthly',
      status: 'expired',
      expiresAt: new Date(0).toISOString(),
      autoRenew: false,
      plan: 'monthly',
      isVip: false,
      unlockedStoreBots: []
    };
    subscription.set(unpaidSub);
    if (typeof window !== 'undefined') {
      localStorage.setItem('superai_subscription', JSON.stringify(unpaidSub));
    }
    await syncUserAccessWithServer(newUser);
    if (typeof window !== 'undefined') {
      fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: newUser.email, name: newUser.name, type: 'welcome' })
      }).catch((e) => console.warn('Welcome email trigger:', e));
    }
    return { success: true, isNewUser: true, user: get(currentUser) || newUser };
  } catch (err: any) {
    return { success: false, isNewUser: false, error: err.message || 'Google login failed.' };
  }
}

export async function loginWithGoogle(profile?: GoogleAuthPayload): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!profile) return { success: false, error: 'Google profile is required.' };
  const res = await loginOrCreateWithGoogle(profile);
  return { success: res.success, user: res.user, error: res.error };
}

export function logout() {
  currentUser.set(null);
  isAuthenticated.set(false);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('superai_user');
  }
}

function saveUserSession(user: UserProfile) {
  currentUser.set(user);
  isAuthenticated.set(true);
  if (typeof window !== 'undefined') {
    localStorage.setItem('superai_user', JSON.stringify(user));
  }
}

// -------------------------------------------------------------
// Other Helper Actions
// -------------------------------------------------------------
export function setApiKey(key: string, valid: boolean = true) {
  apiKey.set(key);
  isKeyValid.set(valid);
  if (key) {
    saveEncryptedKey(key);
  } else {
    clearStoredKey();
  }
}

export function openToolDrawer(tool: AITool) {
  activeTool.set(tool);
  isDrawerOpen.set(true);
}

export function closeToolDrawer() {
  isDrawerOpen.set(false);
}

export function addChatMessage(message: ChatMessage) {
  chatMessages.update((msgs) => {
    const updated = [...msgs, message];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('superai_chat_history', JSON.stringify(updated.slice(-50)));
      } catch (e) {
        // ignore
      }
    }
    return updated;
  });

  if (typeof window !== 'undefined') {
    offlineStorage.saveMessage(message).catch((err) => {
      console.warn('[userStore] Failed to save message to offlineStorage:', err);
    });
  }
}

export function clearChatHistory() {
  const initial = loadInitialChat().slice(0, 1);
  chatMessages.set(initial);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('superai_chat_history');
    offlineStorage.clearMessages().catch((err) => {
      console.warn('[userStore] Failed to clear offlineStorage messages:', err);
    });
  }
}

/**
 * Resolves canonical plan tier with grandfathering and subscription checks.
 * Grandfathers legacy 'byok', 'pro', 'ultra' to 'byok_pro'.
 * Maps 'managed', 'complete' to 'managed'.
 * If isSubscribed === false, returns 'free'.
 */
export function getEffectivePlanTier(
  tier?: string | null,
  isSubscribed?: boolean
): 'byok_starter' | 'byok_pro' | 'managed' | 'free' {
  if (isSubscribed === false) return 'free';
  if (!tier) return 'free';
  const clean = String(tier).trim().toLowerCase();
  if (clean === 'free' || !clean) return 'free';
  if (clean === 'managed' || clean === 'complete') return 'managed';
  if (clean === 'byok_starter') return 'byok_starter';
  if (clean === 'byok_pro') return 'byok_pro';
  if (clean === 'byok' || clean === 'pro' || clean === 'ultra') {
    // Grandfather existing subscribers
    return 'byok_pro';
  }
  return 'byok_starter';
}

/**
 * Checks if a specific tool/helper is unlocked for a given tier according to plan feature toggles.
 */
export function isHelperUnlocked(
  toolId: string,
  tier: string,
  plans?: PlansSettings | null
): boolean {
  const effective = getEffectivePlanTier(tier);
  if (effective === 'free') return false;
  if (!plans) plans = DEFAULT_PLANS;
  const plan =
    plans[effective] ||
    plans[tier as keyof PlansSettings] ||
    DEFAULT_PLANS[effective] ||
    DEFAULT_PLANS.byok_starter;
  const toggles = plan?.featureToggles;
  if (!toggles) return true;
  if (toggles.allHelpersEnabled !== false) return true;
  if (!toggles.enabledHelpers || toggles.enabledHelpers.length === 0) return false;
  return toggles.enabledHelpers.includes(toolId);
}
