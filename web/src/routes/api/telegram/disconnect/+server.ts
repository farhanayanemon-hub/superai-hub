import { json, type RequestHandler } from '@sveltejs/kit';
import { unlinkByUserId } from '$lib/server/telegramStore';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const unlinked = unlinkByUserId(userId);

    return json({
      success: true,
      message: unlinked ? 'Telegram account disconnected.' : 'No active telegram session found for this user.'
    });
  } catch (err: any) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
};
