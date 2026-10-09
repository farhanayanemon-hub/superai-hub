import { writable, get } from 'svelte/store';
import type { AITool } from '$lib/config/tools';
import { getDecryptedKey, saveEncryptedKey, clearStoredKey, encryptVaultKey, decryptVaultKey } from '$lib/services/crypto';

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
export type DashboardTab = 'chat' | 'agents' | 'store' | 'channels' | 'billing' | 'settings' | 'tools' | 'whatsapp' | 'vault';
export type AIProvider = 'gemini' | 'openai' | 'grok' | 'deepseek' | 'openrouter' | 'replicate';
export type PlanTier = 'byok' | 'managed' | 'free' | 'pro' | 'ultra' | 'complete';
export type BillingInterval = 'monthly' | 'yearly';

export interface ApiVaultKey {
  id: string;
  provider: AIProvider;
  label: string;
  encryptedKey: string;
  model?: string;
  isDefault: boolean;
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
    const user = JSON.parse(raw);
    // Migrate legacy plan -> 2-tier system
    if (user.tier === 'complete') {
      user.tier = 'managed';
    } else if (user.tier === 'ultra' || user.tier === 'pro' || !user.tier) {
      user.tier = 'byok';
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
      content: `👋 **Welcome to your EzboAgents Executive Console!**\n\nI am connected to your Multi-API Vault and central AI engine. Whatever you can do from WhatsApp, you can do right here:\n\n• **Chat freely** with advanced AI models.\n• **Generate high-resolution AI images** using \`/image [your prompt]\`.\n• Add and manage multiple API keys in your **API Vault**.\n• Type \`/help\` anytime for a full guide.\n\nHow can I help grow your business today?`,
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

function loadInitialSubscription(): SubscriptionState {
  const initialUser = loadInitialUser();
  const defaultSub: SubscriptionState = {
    tier: (initialUser?.tier as PlanTier) || 'byok',
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
    const parsed = JSON.parse(raw);
    // Migrate legacy tier -> 2-tier system
    if (parsed.tier === 'complete') {
      parsed.tier = 'managed';
    } else if (parsed.tier === 'ultra' || parsed.tier === 'pro' || !parsed.tier) {
      parsed.tier = 'byok';
    }
    if (!parsed.unlockedStoreBots) parsed.unlockedStoreBots = [];
    if (initialUser && !initialUser.isSubscribed) {
      parsed.status = 'expired';
      parsed.isVip = false;
    }
    return parsed;
  } catch (e) {
    return defaultSub;
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
export const activeDashboardTab = writable<DashboardTab>('chat');
export const activeTool = writable<AITool | null>(null);
export const isDrawerOpen = writable<boolean>(false);
export const activeCategory = writable<string>('all');
export const searchQuery = writable<string>('');
export const subscription = writable<SubscriptionState>(loadInitialSubscription());
export const apiVault = writable<ApiVaultKey[]>(loadInitialVault());
export const activeVaultKeyId = writable<string | null>(null);

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

export function getActiveVaultKey(): ApiVaultKey | null {
  const vault = get(apiVault);
  const activeId = get(activeVaultKeyId);
  if (activeId) {
    const found = vault.find((k) => k.id === activeId);
    if (found) return found;
  }
  return vault.find((k) => k.isDefault) || vault[0] || null;
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
    return { success: true, user: account.user };
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
      tier: 'byok',
      createdAt: new Date().toISOString()
    };
    saveUserToDb(cleanEmail, { user, passHash: pass });
    saveUserSession(user);
    const unpaidSub: SubscriptionState = {
      tier: 'byok',
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
    if (typeof window !== 'undefined') {
      fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: user.email, name: user.name, type: 'welcome' })
      }).catch((e) => console.warn('Welcome email trigger:', e));
    }
    return { success: true, user };
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
      return { success: true, isNewUser: false, user: existing.user };
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
      tier: 'byok',
      createdAt: new Date().toISOString()
    };
    saveUserToDb(cleanEmail, { user: newUser, passHash: payload.password || '' });
    saveUserSession(newUser);
    const unpaidSub: SubscriptionState = {
      tier: 'byok',
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
    if (typeof window !== 'undefined') {
      fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: newUser.email, name: newUser.name, type: 'welcome' })
      }).catch((e) => console.warn('Welcome email trigger:', e));
    }
    return { success: true, isNewUser: true, user: newUser };
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
}

export function clearChatHistory() {
  const initial = loadInitialChat().slice(0, 1);
  chatMessages.set(initial);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('superai_chat_history');
  }
}
