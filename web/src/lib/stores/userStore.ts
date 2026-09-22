import { writable } from 'svelte/store';
import type { AITool } from '$lib/config/tools';
import { getDecryptedKey, saveEncryptedKey, clearStoredKey } from '$lib/services/crypto';

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';

export interface SubscriptionState {
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'grace_period';
  expiresAt: string;
  isVip: boolean;
}

// Initial state helpers
const initialKey = typeof window !== 'undefined' ? getDecryptedKey() : '';

export const apiKey = writable<string>(initialKey);
export const isKeyValid = writable<boolean>(!!initialKey);

export const whatsappStatus = writable<WhatsAppStatus>('disconnected');
export const whatsappQr = writable<string | null>(null);

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

// Helper actions
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
