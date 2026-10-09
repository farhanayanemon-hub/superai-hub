import fs from 'node:fs';
import path from 'node:path';

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

export interface AdminConfig {
  adminPassphrase?: string;
  opayApiKey: string;
  opaySecretKey: string;
  opayBrandKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  grokApiKey: string;
  deepseekApiKey: string;
  openrouterApiKey: string;
  replicateApiKey: string;
  modelsEnabled: AdminModelToggles;
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
    geminiApiKey: process.env.PLATFORM_GEMINI_KEY || process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    grokApiKey: process.env.GROK_API_KEY || '',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    replicateApiKey: process.env.REPLICATE_API_KEY || '',
    modelsEnabled: { ...DEFAULT_MODELS }
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
        geminiApiKey: saved.geminiApiKey || envConfig.geminiApiKey,
        openaiApiKey: saved.openaiApiKey || envConfig.openaiApiKey,
        grokApiKey: saved.grokApiKey || envConfig.grokApiKey,
        deepseekApiKey: saved.deepseekApiKey || envConfig.deepseekApiKey,
        openrouterApiKey: saved.openrouterApiKey || envConfig.openrouterApiKey,
        replicateApiKey: saved.replicateApiKey || envConfig.replicateApiKey,
        modelsEnabled: {
          ...DEFAULT_MODELS,
          ...(saved.modelsEnabled || {})
        }
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
    }
  };

  memoryConfig = updated;

  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist admin settings to file cache:', err);
  }

  return updated;
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
    modelsEnabled: config.modelsEnabled
  };
}
