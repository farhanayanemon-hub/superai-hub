import { json, type RequestHandler } from '@sveltejs/kit';

const RAILWAY_ENGINE_URL = process.env.WHATSAPP_ENGINE_URL || 'https://whatsapp-engine-production-04f4.up.railway.app';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, apiKey } = await request.json();

    if (!message) {
      return json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const engineResponse = await fetch(`${RAILWAY_ENGINE_URL}/api/chat/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, apiKey })
    });

    if (!engineResponse.ok) {
      const errText = await engineResponse.text();
      return json({
        success: false,
        error: `Engine responded with status ${engineResponse.status}: ${errText}`
      }, { status: engineResponse.status });
    }

    const data = await engineResponse.json();
    return json(data);
  } catch (error: any) {
    console.error('Error forwarding chat message to WhatsApp engine:', error);
    return json({
      success: false,
      error: error.message || 'Failed to communicate with WhatsApp engine'
    }, { status: 500 });
  }
};
