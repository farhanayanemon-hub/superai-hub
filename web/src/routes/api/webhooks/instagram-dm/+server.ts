import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Instagram Direct (DM) Inbound Webhook Endpoint
 * 
 * GET: Meta Webhook Verification (hub.mode, hub.verify_token, hub.challenge)
 * POST: Inbound Instagram Direct messages, Story replies, and mentions from Instagram Graph API
 */

export const GET: RequestHandler = async ({ url }) => {
  const mode = url.searchParams.get('hub.mode');
  const verifyToken = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Meta Webhook Verification handshake
  if (mode === 'subscribe' && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  // Health check / status probe
  return json({
    status: 'active',
    channel: 'instagram_dm',
    message: 'Instagram Direct (DM) Webhook endpoint ready.'
  });
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));

    // Process incoming Instagram DM / Story Reply events
    if (payload?.object === 'instagram') {
      const entries = Array.isArray(payload?.entry) ? payload.entry : [];
      for (const entry of entries) {
        const messaging = Array.isArray(entry?.messaging) ? entry.messaging : [];
        for (const event of messaging) {
          const senderId = event?.sender?.id;
          const messageText = event?.message?.text;
          const storyShare = event?.message?.reply_to?.story;
          if (senderId && (messageText || storyShare)) {
            // Received customer message / story reply for Instagram DM Closer / Omnichannel auto-reply
          }
        }
      }
    }

    // Meta Graph API requires immediate HTTP 200 OK
    return json({ status: 'received', channel: 'instagram_dm' }, { status: 200 });
  } catch (err: any) {
    console.error('[Instagram DM Webhook] Error processing event:', err);
    return json({ status: 'error', error: err?.message || 'Internal error' }, { status: 500 });
  }
};
