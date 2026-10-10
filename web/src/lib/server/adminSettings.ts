import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PLANS, type PlansSettings } from '$lib/config/plans';

export interface AdminModelToggles {
  'gemini-2.0-flash': boolean;
  'gemini-1.5-pro': boolean;
  'gpt-4o': boolean;
  'gpt-4o-mini': boolean;
  'grok-3': boolean;
  'deepseek-chat': boolean;
  'claude-3.5-sonnet': boolean;
  'flux-schnell': boolean;
}

export interface UserAccessGrant {
  email: string;
  name?: string;
  isSubscribed: boolean;
  tier: 'byok' | 'managed';
  interval: 'monthly' | 'yearly';
  unlockedStoreBots: string[];
  expiresAt: string;
  grantedAt: string;
  updatedAt: string;
  note?: string;
}

export interface RegisteredUserSummary {
  id: string;
  name: string;
  email: string;
  provider: string;
  isSubscribed: boolean;
  tier: string;
  unlockedStoreBots: string[];
  createdAt: string;
  lastSeenAt: string;
}

export interface AdminConfig {
  adminPassphrase?: string;
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
  modelsEnabled: AdminModelToggles;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  smtpSecure?: boolean;
  telegramBotToken?: string;
  telegramBotUsername?: string;
  plans?: PlansSettings;
  userGrants?: Record<string, UserAccessGrant>;
  registeredUsers?: Record<string, RegisteredUserSummary>;
}

const DEFAULT_MODELS: AdminModelToggles = {
  'gemini-2.0-flash': true,
  'gemini-1.5-pro': true,
  'gpt-4o': true,
  'gpt-4o-mini': true,
  'grok-3': true,
  'deepseek-chat': true,
  'claude-3.5-sonnet': true,
  'flux-schnell': true
};

const CACHE_FILE_PATH = path.join(
  process.platform === 'win32' ? process.env.TEMP || 'C:\\Windows\\Temp' : '/tmp',
  'ezbo_admin_settings.json'
);

let memoryConfig: AdminConfig | null = null;

function loadConfigFromStorage(): AdminConfig {
  const envConfig: AdminConfig = {
    adminPassphrase: process.env.ADMIN_SECRET || 'ezbo-admin-2026',
    opayApiKey: process.env.OPAY_API_KEY || '',
    opaySecretKey: process.env.OPAY_SECRET_KEY || '',
    opayBrandKey: process.env.OPAY_BRAND_KEY || '',
    opayEndpointUrl: process.env.OPAY_ENDPOINT_URL || 'https://verify.opaybd.com/api/payment/create',
    geminiApiKey: process.env.PLATFORM_GEMINI_KEY || process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    grokApiKey: process.env.GROK_API_KEY || '',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    replicateApiKey: process.env.REPLICATE_API_KEY || '',
    modelsEnabled: { ...DEFAULT_MODELS },
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'EzboAgents <noreply@ezboagents.com>',
    smtpSecure: process.env.SMTP_SECURE === 'true',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || 'EzboAgentsBot',
    plans: DEFAULT_PLANS,
    userGrants: {},
    registeredUsers: {}
  };

  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const saved = JSON.parse(raw);
      return {
        adminPassphrase: saved.adminPassphrase || envConfig.adminPassphrase,
        opayApiKey: saved.opayApiKey || envConfig.opayApiKey,
        opaySecretKey: saved.opaySecretKey || envConfig.opaySecretKey,
        opayBrandKey: saved.opayBrandKey || envConfig.opayBrandKey,
        opayEndpointUrl: saved.opayEndpointUrl || envConfig.opayEndpointUrl,
        geminiApiKey: saved.geminiApiKey || envConfig.geminiApiKey,
        openaiApiKey: saved.openaiApiKey || envConfig.openaiApiKey,
        grokApiKey: saved.grokApiKey || envConfig.grokApiKey,
        deepseekApiKey: saved.deepseekApiKey || envConfig.deepseekApiKey,
        openrouterApiKey: saved.openrouterApiKey || envConfig.openrouterApiKey,
        replicateApiKey: saved.replicateApiKey || envConfig.replicateApiKey,
        modelsEnabled: {
          ...DEFAULT_MODELS,
          ...(saved.modelsEnabled || {})
        },
        smtpHost: saved.smtpHost ?? envConfig.smtpHost,
        smtpPort: saved.smtpPort ?? envConfig.smtpPort,
        smtpUser: saved.smtpUser ?? envConfig.smtpUser,
        smtpPass: saved.smtpPass ?? envConfig.smtpPass,
        smtpFrom: saved.smtpFrom ?? envConfig.smtpFrom,
        smtpSecure: saved.smtpSecure ?? envConfig.smtpSecure,
        telegramBotToken: saved.telegramBotToken ?? envConfig.telegramBotToken,
        telegramBotUsername: saved.telegramBotUsername ?? envConfig.telegramBotUsername,
        plans: saved.plans || DEFAULT_PLANS,
        userGrants: saved.userGrants || {},
        registeredUsers: saved.registeredUsers || {}
      };
    }
  } catch (err) {
    console.warn('Could not read admin settings cache file:', err);
  }

  return envConfig;
}

export function getAdminConfig(): AdminConfig {
  if (!memoryConfig) {
    memoryConfig = loadConfigFromStorage();
  }
  return memoryConfig;
}

export function updateAdminConfig(patch: Partial<AdminConfig>): AdminConfig {
  const current = getAdminConfig();
  const updated: AdminConfig = {
    ...current,
    ...patch,
    modelsEnabled: {
      ...current.modelsEnabled,
      ...(patch.modelsEnabled || {})
    },
    plans: patch.plans ? {
      byok: { ...(current.plans?.byok || DEFAULT_PLANS.byok), ...patch.plans.byok },
      managed: { ...(current.plans?.managed || DEFAULT_PLANS.managed), ...patch.plans.managed }
    } : (current.plans || DEFAULT_PLANS),
    userGrants: patch.userGrants ?? current.userGrants ?? {},
    registeredUsers: patch.registeredUsers ?? current.registeredUsers ?? {}
  };

  memoryConfig = updated;

  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist admin settings to file cache:', err);
  }

  return updated;
}

export function upsertUserGrant(input: {
  email: string;
  name?: string;
  isSubscribed: boolean;
  tier: 'byok' | 'managed';
  interval: 'monthly' | 'yearly';
  unlockedStoreBots: string[];
  note?: string;
}): UserAccessGrant {
  const config = getAdminConfig();
  const cleanEmail = input.email.trim().toLowerCase();
  const existing = config.userGrants?.[cleanEmail];
  const now = new Date().toISOString();
  const days = input.interval === 'yearly' ? 365 : 30;
  const expiresAt = input.isSubscribed
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    : new Date(0).toISOString();

  const grant: UserAccessGrant = {
    email: cleanEmail,
    name: input.name?.trim() || existing?.name || config.registeredUsers?.[cleanEmail]?.name || cleanEmail.split('@')[0],
    isSubscribed: input.isSubscribed,
    tier: input.tier || 'byok',
    interval: input.interval || 'monthly',
    unlockedStoreBots: Array.from(new Set(input.unlockedStoreBots || [])),
    expiresAt,
    grantedAt: existing?.grantedAt || now,
    updatedAt: now,
    note: input.note !== undefined ? input.note : existing?.note
  };

  const updatedGrants = { ...(config.userGrants || {}), [cleanEmail]: grant };
  const updatedUsers = { ...(config.registeredUsers || {}) };

  if (updatedUsers[cleanEmail]) {
    updatedUsers[cleanEmail] = {
      ...updatedUsers[cleanEmail],
      name: grant.name || updatedUsers[cleanEmail].name,
      isSubscribed: grant.isSubscribed,
      tier: grant.tier,
      unlockedStoreBots: grant.unlockedStoreBots,
      lastSeenAt: now
    };
  } else {
    updatedUsers[cleanEmail] = {
      id: `usr-${Date.now().toString(36)}`,
      name: grant.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      provider: 'admin-assigned',
      isSubscribed: grant.isSubscribed,
      tier: grant.tier,
      unlockedStoreBots: grant.unlockedStoreBots,
      createdAt: now,
      lastSeenAt: now
    };
  }

  updateAdminConfig({
    userGrants: updatedGrants,
    registeredUsers: updatedUsers
  });

  return grant;
}

export function deleteUserGrant(email: string): void {
  const config = getAdminConfig();
  const cleanEmail = email.trim().toLowerCase();
  const updatedGrants = { ...(config.userGrants || {}) };
  delete updatedGrants[cleanEmail];
  updateAdminConfig({ userGrants: updatedGrants });
}

export function getUserGrant(email: string): UserAccessGrant | null {
  if (!email) return null;
  const config = getAdminConfig();
  const cleanEmail = email.trim().toLowerCase();
  return config.userGrants?.[cleanEmail] || null;
}

export function recordRegisteredUser(user: {
  id?: string;
  name?: string;
  email: string;
  provider?: string;
  isSubscribed?: boolean;
  tier?: string;
  unlockedStoreBots?: string[];
  createdAt?: string;
}): RegisteredUserSummary {
  const config = getAdminConfig();
  const cleanEmail = user.email.trim().toLowerCase();
  const existing = config.registeredUsers?.[cleanEmail];
  const grant = config.userGrants?.[cleanEmail];
  const now = new Date().toISOString();

  const summary: RegisteredUserSummary = {
    id: user.id || existing?.id || `usr-${Date.now().toString(36)}`,
    name: user.name?.trim() || existing?.name || grant?.name || cleanEmail.split('@')[0],
    email: cleanEmail,
    provider: user.provider || existing?.provider || 'email',
    isSubscribed: grant ? grant.isSubscribed : (user.isSubscribed ?? existing?.isSubscribed ?? false),
    tier: grant ? grant.tier : (user.tier || existing?.tier || 'byok'),
    unlockedStoreBots: grant ? grant.unlockedStoreBots : (user.unlockedStoreBots || existing?.unlockedStoreBots || []),
    createdAt: user.createdAt || existing?.createdAt || now,
    lastSeenAt: now
  };

  const updatedUsers = { ...(config.registeredUsers || {}), [cleanEmail]: summary };
  updateAdminConfig({ registeredUsers: updatedUsers });
  return summary;
}

function maskKey(key?: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

export function getMaskedAdminConfig() {
  const config = getAdminConfig();
  return {
    opayApiKey: maskKey(config.opayApiKey),
    opaySecretKey: maskKey(config.opaySecretKey),
    opayBrandKey: maskKey(config.opayBrandKey),
    opayEndpointUrl: config.opayEndpointUrl || 'https://verify.opaybd.com/api/payment/create',
    geminiApiKey: maskKey(config.geminiApiKey),
    openaiApiKey: maskKey(config.openaiApiKey),
    grokApiKey: maskKey(config.grokApiKey),
    deepseekApiKey: maskKey(config.deepseekApiKey),
    openrouterApiKey: maskKey(config.openrouterApiKey),
    replicateApiKey: maskKey(config.replicateApiKey),
    hasOpayKey: !!config.opayApiKey,
    hasGeminiKey: !!config.geminiApiKey,
    hasOpenaiKey: !!config.openaiApiKey,
    hasGrokKey: !!config.grokApiKey,
    hasDeepseekKey: !!config.deepseekApiKey,
    hasOpenrouterKey: !!config.openrouterApiKey,
    hasReplicateKey: !!config.replicateApiKey,
    modelsEnabled: config.modelsEnabled,
    smtpHost: config.smtpHost || '',
    smtpPort: config.smtpPort || 587,
    smtpUser: config.smtpUser || '',
    smtpPass: maskKey(config.smtpPass),
    smtpFrom: config.smtpFrom || '',
    hasSmtp: !!(config.smtpHost && config.smtpUser && config.smtpPass),
    telegramBotToken: maskKey(config.telegramBotToken),
    telegramBotUsername: config.telegramBotUsername || 'EzboAgentsBot',
    hasTelegramBot: !!config.telegramBotToken,
    plans: config.plans || DEFAULT_PLANS,
    userGrants: config.userGrants || {},
    registeredUsers: config.registeredUsers || {}
  };
}
