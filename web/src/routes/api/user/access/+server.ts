import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserGrant, recordRegisteredUser } from '$lib/server/adminSettings';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, name, id, provider, isSubscribed, tier, unlockedStoreBots, createdAt, allLocalUsers } = body;

    // Also record any additional local users if sent by the browser
    if (Array.isArray(allLocalUsers)) {
      for (const u of allLocalUsers) {
        if (u && typeof u.email === 'string' && u.email.includes('@')) {
          recordRegisteredUser({
            id: u.id,
            name: u.name,
            email: u.email,
            provider: u.provider,
            isSubscribed: u.isSubscribed,
            tier: u.tier,
            unlockedStoreBots: u.unlockedStoreBots,
            createdAt: u.createdAt
          });
        }
      }
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return json({ success: false, hasGrant: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Record/update this user in the server's registeredUsers directory
    recordRegisteredUser({
      id,
      name,
      email: cleanEmail,
      provider,
      isSubscribed,
      tier,
      unlockedStoreBots,
      createdAt
    });

    // Check if an admin grant exists for this email
    const grant = getUserGrant(cleanEmail);

    if (grant) {
      return json({
        success: true,
        hasGrant: true,
        grant
      });
    }

    return json({
      success: true,
      hasGrant: false
    });
  } catch (err: any) {
    console.error('Error in /api/user/access:', err);
    return json({ success: false, hasGrant: false, error: err.message }, { status: 500 });
  }
};
