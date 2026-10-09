import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
import { generateSyncCode, getLinkedUserByUserId } from '$lib/server/telegramStore';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const linkedUser = getLinkedUserByUserId(userId);
    const config = getAdminConfig();

    return json({
      success: true,
      isLinked: !!linkedUser,
      telegramUsername: linkedUser?.telegramUsername || '',
      telegramFirstName: linkedUser?.telegramFirstName || '',
      activeAgent: linkedUser?.activeAgent || 'general',
      linkedAt: linkedUser?.linkedAt || null,
      botUsername: config.telegramBotUsername || 'EzboAgentsBot'
    });
  } catch (err: any) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, planTier, isSubscribed, byokKey, unlockedBots } = body;

    if (!userId) {
      return json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const config = getAdminConfig();
    const botUsername = config.telegramBotUsername || 'EzboAgentsBot';

    const syncCode = generateSyncCode({
      userId,
      userName: userName || 'Ezbo Member',
      userEmail: userEmail || '',
      planTier: planTier || 'byok',
      isSubscribed: !!isSubscribed,
      byokKey,
      unlockedBots: unlockedBots || []
    });

    const deepLink = `https://t.me/${botUsername}?start=${syncCode}`;

    return json({
      success: true,
      syncCode,
      botUsername,
      deepLink,
      expiresInMinutes: 15
    });
  } catch (err: any) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
};
