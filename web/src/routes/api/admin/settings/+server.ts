import { json, type RequestHandler } from '@sveltejs/kit';
import {
  getAdminConfig,
  updateAdminConfig,
  getMaskedAdminConfig,
  verifyAdminPassphrase,
  type AdminConfig
} from '$lib/server/adminSettings';

export const GET: RequestHandler = async () => {
  try {
    const masked = getMaskedAdminConfig();
    return json({
      success: true,
      settings: masked
    });
  } catch (err: any) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { adminSecret, patch } = body;

    if (!verifyAdminPassphrase(adminSecret)) {
      return json({ success: false, error: 'Unauthorized: Invalid Admin Secret Passphrase' }, { status: 401 });
    }

    // If empty patch sent (e.g. login verification check)
    if (!patch || typeof patch !== 'object' || Object.keys(patch).length === 0) {
      return json({
        success: true,
        message: 'Passphrase verified successfully.',
        settings: getMaskedAdminConfig(true)
      });
    }

    // Only update keys that have meaningful non-placeholder values
    const cleanPatch: Partial<AdminConfig> = {};

    const stringKeys: (keyof AdminConfig)[] = [
      'opayApiKey',
      'opaySecretKey',
      'opayBrandKey',
      'opayEndpointUrl',
      'geminiApiKey',
      'openaiApiKey',
      'grokApiKey',
      'deepseekApiKey',
      'openrouterApiKey',
      'replicateApiKey',
      'adminPassphrase',
      'smtpHost',
      'smtpUser',
      'smtpPass',
      'smtpFrom',
      'telegramBotToken',
      'telegramBotUsername',
      'telegramWebhookSecret'
    ];

    for (const key of stringKeys) {
      if (typeof patch[key] === 'string' && patch[key].trim() && !patch[key].includes('••••')) {
        (cleanPatch as any)[key] = patch[key].trim();
      }
    }

    if (patch.smtpPort && (typeof patch.smtpPort === 'number' || !isNaN(Number(patch.smtpPort)))) {
      cleanPatch.smtpPort = Number(patch.smtpPort);
    }

    if (typeof patch.smtpSecure === 'boolean') {
      cleanPatch.smtpSecure = patch.smtpSecure;
    }

    if (patch.modelsEnabled && typeof patch.modelsEnabled === 'object') {
      cleanPatch.modelsEnabled = patch.modelsEnabled;
    }

    if (patch.providersAllowed && typeof patch.providersAllowed === 'object') {
      cleanPatch.providersAllowed = patch.providersAllowed;
    }

    if (patch.plans && typeof patch.plans === 'object') {
      cleanPatch.plans = patch.plans;
    }

    if (typeof patch.channelsCeoEnabled === 'boolean') {
      cleanPatch.channelsCeoEnabled = patch.channelsCeoEnabled;
    }

    if (Array.isArray(patch.enabledToolConnectors)) {
      cleanPatch.enabledToolConnectors = patch.enabledToolConnectors.filter((id: any) => typeof id === 'string');
    }

    const updated = updateAdminConfig(cleanPatch);
    const masked = getMaskedAdminConfig(true);

    return json({
      success: true,
      message: 'Admin settings & model configuration updated successfully.',
      settings: masked
    });
  } catch (err: any) {
    console.error('Error in /api/admin/settings:', err);
    return json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
};
