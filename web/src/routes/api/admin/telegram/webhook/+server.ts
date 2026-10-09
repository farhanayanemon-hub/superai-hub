import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
import {
  setTelegramWebhook,
  getTelegramMe,
  getTelegramWebhookInfo
} from '$lib/services/telegram';

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { adminSecret, action, webhookUrl } = body;

    const currentConfig = getAdminConfig();
    const expectedSecret = currentConfig.adminPassphrase || 'ezbo-admin-2026';

    if (!adminSecret || adminSecret.trim() !== expectedSecret.trim()) {
      return json({ success: false, error: 'Unauthorized: Invalid Admin Secret Passphrase' }, { status: 401 });
    }

    const token = currentConfig.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '';
    if (!token) {
      return json({
        success: false,
        error: 'Telegram Bot Token is not configured. Please save your bot token first.'
      }, { status: 400 });
    }

    if (action === 'test') {
      const meRes = await getTelegramMe(token);
      if (meRes.ok && meRes.result) {
        return json({
          success: true,
          message: `Bot ping successful! Connected as @${meRes.result.username} (${meRes.result.first_name}).`,
          bot: meRes.result
        });
      }
      return json({
        success: false,
        error: meRes.description || 'Failed to ping Telegram Bot API with current token.'
      }, { status: 400 });
    }

    if (action === 'info') {
      const infoRes = await getTelegramWebhookInfo(token);
      return json({ success: true, info: infoRes });
    }

    // Default: 'set' webhook
    const targetUrl = webhookUrl || `${url.origin || 'https://ezboagents.com'}/api/telegram/webhook`;
    const setRes = await setTelegramWebhook(token, targetUrl);

    if (setRes.ok) {
      return json({
        success: true,
        message: `Webhook registered successfully with Telegram! Target: ${targetUrl}`,
        result: setRes
      });
    }

    return json({
      success: false,
      error: setRes.description || 'Telegram rejected the webhook registration.'
    }, { status: 400 });
  } catch (err: any) {
    console.error('Error in /api/admin/telegram/webhook:', err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
};
