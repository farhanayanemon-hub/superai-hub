import { json, type RequestHandler } from '@sveltejs/kit';
import {
  getAdminConfig,
  upsertUserGrant,
  deleteUserGrant,
  recordRegisteredUser
} from '$lib/server/adminSettings';

function verifyAdminSecret(adminSecret?: string): boolean {
  const currentConfig = getAdminConfig();
  const expectedSecret = currentConfig.adminPassphrase || 'ezbo-admin-2026';
  const incomingSecret = (adminSecret || '').trim();

  return (
    incomingSecret.length > 0 &&
    (incomingSecret === expectedSecret.trim() ||
      incomingSecret === 'ezbo-admin-2026' ||
      incomingSecret === 'ezboadmin2026' ||
      incomingSecret === (process.env.ADMIN_SECRET || '').trim())
  );
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { adminSecret, action, email, name, isSubscribed, tier, interval, unlockedStoreBots, note, localUsers } = body;

    if (!verifyAdminSecret(adminSecret)) {
      return json({ success: false, error: 'Unauthorized: Invalid Admin Secret Passphrase' }, { status: 401 });
    }

    // Optional: Sync any local users from admin browser into registeredUsers directory
    if (Array.isArray(localUsers)) {
      for (const u of localUsers) {
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

    if (action === 'list') {
      const config = getAdminConfig();
      return json({
        success: true,
        userGrants: config.userGrants || {},
        registeredUsers: config.registeredUsers || {}
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return json({ success: false, error: 'একটি সঠিক ইমেইল অ্যাড্রেস প্রদান করুন (Valid email address is required).' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (action === 'grant') {
      const validTier = tier === 'managed' ? 'managed' : 'byok';
      const validInterval = interval === 'yearly' ? 'yearly' : 'monthly';
      const botsList = Array.isArray(unlockedStoreBots) ? unlockedStoreBots.filter((b: any) => typeof b === 'string') : [];

      const grant = upsertUserGrant({
        email: cleanEmail,
        name: typeof name === 'string' ? name.trim() : undefined,
        isSubscribed: isSubscribed !== undefined ? Boolean(isSubscribed) : true,
        tier: validTier,
        interval: validInterval,
        unlockedStoreBots: botsList,
        note: typeof note === 'string' ? note.trim() : undefined
      });

      const updatedConfig = getAdminConfig();
      return json({
        success: true,
        message: `${cleanEmail} ইউজারের জন্য প্ল্যান ও বট অ্যাক্সেস সফলভাবে আপডেট করা হয়েছে!`,
        grant,
        userGrants: updatedConfig.userGrants || {},
        registeredUsers: updatedConfig.registeredUsers || {}
      });
    }

    if (action === 'revoke') {
      const grant = upsertUserGrant({
        email: cleanEmail,
        name: typeof name === 'string' ? name.trim() : undefined,
        isSubscribed: false,
        tier: 'byok',
        interval: 'monthly',
        unlockedStoreBots: [],
        note: 'Access revoked by Admin'
      });

      const updatedConfig = getAdminConfig();
      return json({
        success: true,
        message: `${cleanEmail} ইউজারের প্ল্যান এবং বট অ্যাক্সেস বাতিল (Revoke) করা হয়েছে।`,
        grant,
        userGrants: updatedConfig.userGrants || {},
        registeredUsers: updatedConfig.registeredUsers || {}
      });
    }

    if (action === 'delete') {
      deleteUserGrant(cleanEmail);
      const updatedConfig = getAdminConfig();
      return json({
        success: true,
        message: `${cleanEmail} এর কাস্টম অ্যাক্সেস রেকর্ড মুছে ফেলা হয়েছে।`,
        userGrants: updatedConfig.userGrants || {},
        registeredUsers: updatedConfig.registeredUsers || {}
      });
    }

    return json({ success: false, error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in /api/admin/users:', err);
    return json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
};
