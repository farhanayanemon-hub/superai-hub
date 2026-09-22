import { writable, get } from 'svelte/store';
import type { AITool } from '$lib/config/tools';
import { getDecryptedKey, saveEncryptedKey, clearStoredKey } from '$lib/services/crypto';

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';

export type DashboardTab = 'chat' | 'tools' | 'whatsapp' | 'byok' | 'billing' | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  isSubscribed: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  createdAt: string;
}

export interface SubscriptionState {
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'grace_period';
  expiresAt: string;
  isVip: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolMatched?: string;
  imageUrl?: string;
  status?: 'sending' | 'done' | 'error';
}

// -------------------------------------------------------------
// Initial State Loaders (Browser-Safe)
// -------------------------------------------------------------
const initialKey = typeof window !== 'undefined' ? getDecryptedKey() : '';

function loadInitialUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('superai_user');
    return raw ? JSON.parse(raw) : null;
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
      content: `👋 **Welcome to your SuperAI Hub Executive Assistant!**\n\nI am directly connected to your WhatsApp Engine and Central Brain Router. Whatever you can do from WhatsApp, you can do right here:\n\n• **Ask any question** to automatically trigger our 50+ specialized tools (Copywriting, Code, Email, SEO, Marketing).\n• **Generate high-resolution AI images** using \`/image [your prompt]\`.\n• Type \`/help\` anytime for a full guide.\n\nHow can I help grow your business today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
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

export const subscription = writable<SubscriptionState>({
  plan: 'yearly',
  status: 'active',
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  isVip: true
});

export const chatMessages = writable<ChatMessage[]>(loadInitialChat());

// -------------------------------------------------------------
// Authentication Helper Actions
// -------------------------------------------------------------
export async function loginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const user: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      provider: 'email',
      isSubscribed: true,
      plan: 'yearly',
      createdAt: new Date().toISOString()
    };

    saveUserSession(user);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed' };
  }
}

export async function signupWithEmail(name: string, email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const user: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      provider: 'email',
      isSubscribed: true,
      plan: 'yearly',
      createdAt: new Date().toISOString()
    };

    saveUserSession(user);

    // Send Welcome Email via server route (non-blocking)
    if (typeof window !== 'undefined') {
      fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          name: user.name,
          type: 'welcome'
        })
      }).catch((e) => console.warn('Welcome email trigger:', e));
    }

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sign up failed' };
  }
}

export async function loginWithGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const user: UserProfile = {
      id: `goog-${Date.now().toString(36)}`,
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      provider: 'google',
      isSubscribed: true,
      plan: 'yearly',
      createdAt: new Date().toISOString()
    };

    saveUserSession(user);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Google login failed' };
  }
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
