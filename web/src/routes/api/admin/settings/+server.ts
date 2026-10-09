import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig, updateAdminConfig, getMaskedAdminConfig, type AdminConfig } from '$lib/server/adminSettings';

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

    const currentConfig = getAdminConfig();
    const expectedSecret = currentConfig.adminPassphrase || 'ezbo-admin-2026';

    if (!adminSecret || adminSecret.trim() !== expectedSecret.trim()) {
      return json({ success: false, error: 'Unauthorized: Invalid Admin Secret Passphrase' }, { status: 401 });
    }

    if (!patch || typeof patch !== 'object') {
      return json({ success: false, error: 'No configuration patch provided' }, { status: 400 });
    }

    // Only update keys that have meaningful non-placeholder values
    const cleanPatch: Partial<AdminConfig> = {};

    const stringKeys: (keyof AdminConfig)[] = [
      'opayApiKey',
      'opaySecretKey',
      'opayBrandKey',
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
      'telegramBotUsername'
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

    const updated = updateAdminConfig(cleanPatch);
    const masked = getMaskedAdminConfig();

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
