import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Facebook Page Messenger Inbound Webhook Endpoint
 * 
 * GET: Meta Webhook Verification (hub.mode, hub.verify_token, hub.challenge)
 * POST: Inbound Page messages, postbacks, and quick replies from Meta Messenger Graph API
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
    channel: 'facebook_messenger',
    message: 'Facebook Page Messenger Webhook endpoint ready.'
  });
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));

    // Process incoming Facebook Page Messenger events
    if (payload?.object === 'page') {
      const entries = Array.isArray(payload?.entry) ? payload.entry : [];
      for (const entry of entries) {
        const messaging = Array.isArray(entry?.messaging) ? entry.messaging : [];
        for (const event of messaging) {
          const senderId = event?.sender?.id;
          const messageText = event?.message?.text;
          if (senderId && messageText) {
            // Received customer message for Facebook Messenger Support / Omnichannel auto-reply
          }
        }
      }
    }

    // Meta Graph API requires immediate HTTP 200 OK
    return json({ status: 'received', channel: 'facebook_messenger' }, { status: 200 });
  } catch (err: any) {
    console.error('[Facebook Messenger Webhook] Error processing event:', err);
    return json({ status: 'error', error: err?.message || 'Internal error' }, { status: 500 });
  }
};
