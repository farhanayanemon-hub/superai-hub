import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Telegram Customer Support Bot Inbound Webhook Endpoint
 * 
 * GET: Health check / status probe
 * POST: Inbound customer messages, commands, and FAQ queries from Telegram Bot API
 */

export const GET: RequestHandler = async () => {
  return json({
    status: 'active',
    channel: 'telegram_support_bot',
    message: 'Telegram Customer Support Bot Webhook endpoint ready.'
  });
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const update = await request.json().catch(() => ({}));
    const message = update?.message;

    if (message?.chat?.id && message?.text) {
      // Inbound customer query or support command for Telegram Helpdesk / Omnichannel Support Agent
      const chatId = message.chat.id;
      const text = message.text.trim();
      // Acknowledged and logged
    }

    return json({ ok: true, channel: 'telegram_support_bot' }, { status: 200 });
  } catch (err: any) {
    console.error('[Telegram Support Bot Webhook] Error processing event:', err);
    return json({ ok: false, error: err?.message || 'Internal error' }, { status: 500 });
  }
};
