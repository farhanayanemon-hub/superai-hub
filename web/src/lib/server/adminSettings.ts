import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PLANS, type PlansSettings, type PlanConfig, type PlanTierId } from '$lib/config/plans';

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

export type UserGrantTier = 'byok_starter' | 'byok_pro' | 'managed' | 'byok';

export interface UserAccessGrant {
  email: string;
  name?: string;
  isSubscribed: boolean;
  tier: UserGrantTier;
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
  providersAllowed?: Record<string, boolean>;
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

export const DEFAULT_PROVIDERS_ALLOWED: Record<string, boolean> = {
  gemini: true,
  openrouter: true,
  openai: true,
  grok: true,
  deepseek: true,
  replicate: true
};

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
    providersAllowed: { ...DEFAULT_PROVIDERS_ALLOWED },
    plans: DEFAULT_PLANS,
    userGrants: {},
    registeredUsers: {}
  };

  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const saved = JSON.parse(raw);

      // Deep migrate saved plans
      let mergedPlans: PlansSettings = { ...DEFAULT_PLANS };
      if (saved.plans) {
        const savedStarter = saved.plans.byok_starter || saved.plans.byok || {};
        const savedPro = saved.plans.byok_pro || {};
        const savedManaged = saved.plans.managed || {};

        const byok_starter: PlanConfig = {
          ...DEFAULT_PLANS.byok_starter,
          ...savedStarter,
          id: 'byok_starter',
          featureToggles: {
            ...DEFAULT_PLANS.byok_starter.featureToggles,
            ...(savedStarter.featureToggles || {})
          }
        };

        const byok_pro: PlanConfig = {
          ...DEFAULT_PLANS.byok_pro,
          ...savedPro,
          id: 'byok_pro',
          featureToggles: {
            ...DEFAULT_PLANS.byok_pro.featureToggles,
            ...(savedPro.featureToggles || {})
          }
        };

        const managed: PlanConfig = {
          ...DEFAULT_PLANS.managed,
          ...savedManaged,
          id: 'managed',
          featureToggles: {
            ...DEFAULT_PLANS.managed.featureToggles,
            ...(savedManaged.featureToggles || {})
          }
        };

        mergedPlans = {
          byok_starter,
          byok_pro,
          managed,
          byok: byok_starter
        };
      }

      // Grandfather existing subscribers in userGrants
      const rawGrants = saved.userGrants || {};
      const migratedGrants: Record<string, UserAccessGrant> = {};
      for (const [email, g] of Object.entries(rawGrants)) {
        const grant = g as UserAccessGrant;
        let tier: UserGrantTier = grant.tier;
        if (grant.isSubscribed && (tier === 'byok' || (tier as string) === 'pro' || (tier as string) === 'ultra')) {
          tier = 'byok_pro';
        } else if (!grant.isSubscribed && tier === 'byok') {
          tier = 'byok_starter';
        }
        migratedGrants[email] = {
          ...grant,
          tier
        };
      }

      // Grandfather existing subscribers in registeredUsers
      const rawUsers = saved.registeredUsers || {};
      const migratedUsers: Record<string, RegisteredUserSummary> = {};
      for (const [email, u] of Object.entries(rawUsers)) {
        const regUser = u as RegisteredUserSummary;
        let tier = regUser.tier;
        if (regUser.isSubscribed && (tier === 'byok' || tier === 'pro' || tier === 'ultra')) {
          tier = 'byok_pro';
        } else if (!regUser.isSubscribed && tier === 'byok') {
          tier = 'byok_starter';
        }
        migratedUsers[email] = {
          ...regUser,
          tier
        };
      }

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
        providersAllowed: {
          ...DEFAULT_PROVIDERS_ALLOWED,
          ...(saved.providersAllowed || {})
        },
        smtpHost: saved.smtpHost ?? envConfig.smtpHost,
        smtpPort: saved.smtpPort ?? envConfig.smtpPort,
        smtpUser: saved.smtpUser ?? envConfig.smtpUser,
        smtpPass: saved.smtpPass ?? envConfig.smtpPass,
        smtpFrom: saved.smtpFrom ?? envConfig.smtpFrom,
        smtpSecure: saved.smtpSecure ?? envConfig.smtpSecure,
        telegramBotToken: saved.telegramBotToken ?? envConfig.telegramBotToken,
        telegramBotUsername: saved.telegramBotUsername ?? envConfig.telegramBotUsername,
        plans: mergedPlans,
        userGrants: migratedGrants,
        registeredUsers: migratedUsers
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
  let updatedPlans: PlansSettings = current.plans || DEFAULT_PLANS;

  if (patch.plans) {
    const base = current.plans || DEFAULT_PLANS;
    const starterPatch = patch.plans.byok_starter || patch.plans.byok || {};
    const proPatch = patch.plans.byok_pro || {};
    const managedPatch = patch.plans.managed || {};

    const byok_starter: PlanConfig = {
      ...base.byok_starter,
      ...starterPatch,
      id: 'byok_starter',
      featureToggles: {
        ...base.byok_starter.featureToggles,
        ...(starterPatch.featureToggles || {})
      }
    };

    const byok_pro: PlanConfig = {
      ...base.byok_pro,
      ...proPatch,
      id: 'byok_pro',
      featureToggles: {
        ...base.byok_pro.featureToggles,
        ...(proPatch.featureToggles || {})
      }
    };

    const managed: PlanConfig = {
      ...base.managed,
      ...managedPatch,
      id: 'managed',
      featureToggles: {
        ...base.managed.featureToggles,
        ...(managedPatch.featureToggles || {})
      }
    };

    updatedPlans = {
      byok_starter,
      byok_pro,
      managed,
      byok: byok_starter
    };
  }

  const updated: AdminConfig = {
    ...current,
    ...patch,
    modelsEnabled: {
      ...current.modelsEnabled,
      ...(patch.modelsEnabled || {})
    },
    providersAllowed: {
      ...DEFAULT_PROVIDERS_ALLOWED,
      ...(current.providersAllowed || {}),
      ...(patch.providersAllowed || {})
    },
    plans: updatedPlans,
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
  tier: UserGrantTier;
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

  // Grandfathering logic:
  let resolvedTier: UserGrantTier = input.tier || 'byok_starter';
  if (resolvedTier === 'byok') {
    resolvedTier = input.isSubscribed ? 'byok_pro' : 'byok_starter';
  }

  const grant: UserAccessGrant = {
    email: cleanEmail,
    name: input.name?.trim() || existing?.name || config.registeredUsers?.[cleanEmail]?.name || cleanEmail.split('@')[0],
    isSubscribed: input.isSubscribed,
    tier: resolvedTier,
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

  let userTier = grant ? grant.tier : (user.tier || existing?.tier || 'byok_starter');
  if (userTier === 'byok') {
    const isSub = grant ? grant.isSubscribed : (user.isSubscribed ?? existing?.isSubscribed ?? false);
    userTier = isSub ? 'byok_pro' : 'byok_starter';
  }

  const summary: RegisteredUserSummary = {
    id: user.id || existing?.id || `usr-${Date.now().toString(36)}`,
    name: user.name?.trim() || existing?.name || grant?.name || cleanEmail.split('@')[0],
    email: cleanEmail,
    provider: user.provider || existing?.provider || 'email',
    isSubscribed: grant ? grant.isSubscribed : (user.isSubscribed ?? existing?.isSubscribed ?? false),
    tier: userTier,
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
    providersAllowed: config.providersAllowed || { ...DEFAULT_PROVIDERS_ALLOWED },
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
