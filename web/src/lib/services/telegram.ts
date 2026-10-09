/**
 * Telegram Bot API Client Service for EzboAgents
 * Handles sending messages, photos, chat actions, and webhook management.
 */

export interface TelegramSendMessageOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: any;
  disable_web_page_preview?: boolean;
}

const TELEGRAM_API_BASE = 'https://api.telegram.org';

export async function sendTelegramMessage(
  token: string,
  chatId: number | string,
  text: string,
  options?: TelegramSendMessageOptions
): Promise<{ ok: boolean; result?: any; description?: string }> {
  if (!token) {
    return { ok: false, description: 'Telegram bot token is not configured.' };
  }

  try {
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;
    const payload: Record<string, any> = {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode ?? 'HTML',
      disable_web_page_preview: options?.disable_web_page_preview ?? true
    };

    if (options?.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Failed to send Telegram message:', err);
    return { ok: false, description: err.message || 'Network error sending telegram message' };
  }
}

export async function sendTelegramPhoto(
  token: string,
  chatId: number | string,
  photoUrl: string,
  caption?: string
): Promise<{ ok: boolean; result?: any; description?: string }> {
  if (!token) {
    return { ok: false, description: 'Telegram bot token is not configured.' };
  }

  try {
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendPhoto`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption || '',
        parse_mode: 'HTML'
      })
    });

    return await res.json();
  } catch (err: any) {
    console.error('Failed to send Telegram photo:', err);
    return { ok: false, description: err.message };
  }
}

export async function sendTelegramChatAction(
  token: string,
  chatId: number | string,
  action: 'typing' | 'upload_photo' = 'typing'
): Promise<{ ok: boolean; result?: boolean }> {
  if (!token) return { ok: false };
  try {
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendChatAction`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action })
    });
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export async function setTelegramWebhook(
  token: string,
  webhookUrl: string
): Promise<{ ok: boolean; description?: string }> {
  if (!token) {
    return { ok: false, description: 'Telegram bot token is missing.' };
  }

  try {
    const url = `${TELEGRAM_API_BASE}/bot${token}/setWebhook`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
}

export async function getTelegramMe(
  token: string
): Promise<{ ok: boolean; result?: { id: number; username: string; first_name: string }; description?: string }> {
  if (!token) {
    return { ok: false, description: 'Telegram bot token is missing.' };
  }

  try {
    const url = `${TELEGRAM_API_BASE}/bot${token}/getMe`;
    const res = await fetch(url);
    return await res.json();
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
}

export async function getTelegramWebhookInfo(
  token: string
): Promise<{ ok: boolean; result?: any; description?: string }> {
  if (!token) return { ok: false, description: 'Token missing' };
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getWebhookInfo`);
    return await res.json();
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
}

/**
 * Escapes plain text for safe rendering in Telegram HTML mode
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
