import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig, upsertUserGrant, getUserGrant } from '$lib/server/adminSettings';

const OPAY_VERIFY_URL = 'https://verify.opaybd.com/api/payment/verify';

/**
 * Handles incoming gateway IPN / Webhook callbacks from OPayBD
 * Performs server-to-server re-verification to prevent tampering and activates user grants.
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const adminConfig = getAdminConfig();
    const opayApiKey = adminConfig.opayApiKey || process.env.OPAY_API_KEY || '';
    const opaySecretKey = adminConfig.opaySecretKey || process.env.OPAY_SECRET_KEY || '';
    const opayBrandKey = adminConfig.opayBrandKey || process.env.OPAY_BRAND_KEY || '';

    // Support both application/json and application/x-www-form-urlencoded payloads
    let payload: Record<string, any> = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        payload = await request.json();
      } catch {
        payload = {};
      }
    } else {
      try {
        const rawText = await request.text();
        const searchParams = new URLSearchParams(rawText);
        payload = Object.fromEntries(searchParams.entries());
      } catch {
        payload = {};
      }
    }

    const transactionId = (
      payload.transaction_id ||
      payload.transactionId ||
      payload.trx_id ||
      payload.tran_id ||
      payload.id ||
      ''
    ).toString().trim();

    if (!transactionId) {
      return json({ success: false, error: 'transaction_id is required in webhook payload' }, { status: 400 });
    }

    if (!opayApiKey) {
      console.warn('Payment webhook received, but OPAY_API_KEY is not configured in settings.');
      return json({ success: false, error: 'Gateway API credentials not configured' }, { status: 500 });
    }

    // 1. Re-verify the transaction directly with the gateway to prevent forged callbacks
    let targetVerifyUrl = OPAY_VERIFY_URL;
    if (adminConfig.opayEndpointUrl) {
      targetVerifyUrl = adminConfig.opayEndpointUrl.replace(/\/create\/?$/, '/verify');
    }
    if (targetVerifyUrl.startsWith('http://verify.opaybd.com')) {
      targetVerifyUrl = targetVerifyUrl.replace('http://verify.opaybd.com', 'https://verify.opaybd.com');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'API-KEY': opayApiKey.trim()
    };
    if (opaySecretKey) headers['SECRET-KEY'] = opaySecretKey.trim();
    if (opayBrandKey) headers['BRAND-KEY'] = opayBrandKey.trim();

    const formParams = new URLSearchParams();
    formParams.set('transaction_id', transactionId);

    let opayRes: Response;
    try {
      opayRes = await fetch(targetVerifyUrl, {
        method: 'POST',
        headers,
        body: formParams.toString()
      });
    } catch (netErr: any) {
      console.error(`Gateway verification network error during webhook handling (${targetVerifyUrl}):`, netErr);
      return json({ success: false, error: `Gateway server unreachable: ${netErr.message}` }, { status: 502 });
    }

    if (!opayRes.ok) {
      const errText = await opayRes.text();
      return json({ success: false, error: `Gateway verification returned HTTP ${opayRes.status}: ${errText}` }, { status: 400 });
    }

    const verifyData = await opayRes.json();
    const isSuccess =
      verifyData.status === 'COMPLETED' ||
      verifyData.status === 'SUCCESS' ||
      verifyData.status === true ||
      verifyData.status === 1 ||
      verifyData.status === '1';

    if (!isSuccess) {
      console.warn(`Payment webhook received for non-successful transaction: ${transactionId}, status: ${verifyData.status}`);
      return json({
        success: false,
        message: 'Transaction is not in completed state',
        status: verifyData.status
      }, { status: 200 });
    }

    // 2. Parse metadata from gateway verification response or payload fallback
    let metadata: Record<string, any> = {};
    const rawMeta = verifyData.metadata || verifyData.meta_data || payload.meta_data || payload.metadata;
    if (typeof rawMeta === 'string') {
      try { metadata = JSON.parse(rawMeta); } catch {}
    } else if (typeof rawMeta === 'object' && rawMeta !== null) {
      metadata = rawMeta;
    }

    const customerEmail = (
      metadata.email ||
      verifyData.cus_email ||
      payload.cus_email ||
      payload.email ||
      ''
    ).toString().trim().toLowerCase();

    if (!customerEmail || !customerEmail.includes('@')) {
      console.warn(`Payment webhook succeeded for transaction ${transactionId}, but no valid customer email was identified.`);
      return json({
        success: true,
        message: 'Transaction verified, but no email provided to synchronize grant',
        transactionId
      });
    }

    const customerName = (
      metadata.name ||
      verifyData.cus_name ||
      payload.cus_name ||
      customerEmail.split('@')[0]
    ).toString().trim();

    const existingGrant = getUserGrant(customerEmail);
    const existingBots = existingGrant?.unlockedStoreBots || [];

    const paymentType = metadata.type || payload.type || 'subscription';

    if (paymentType === 'store_bot' && metadata.botId) {
      const botId = String(metadata.botId).trim();
      const updatedBots = Array.from(new Set([...existingBots, botId]));

      upsertUserGrant({
        email: customerEmail,
        name: customerName,
        isSubscribed: existingGrant ? existingGrant.isSubscribed : false,
        tier: existingGrant ? existingGrant.tier : 'byok_starter',
        interval: existingGrant ? existingGrant.interval : 'monthly',
        unlockedStoreBots: updatedBots,
        note: `Store Bot (${botId}) unlocked via webhook [trx: ${transactionId}]`
      });

      return json({
        success: true,
        message: `Store bot ${botId} unlocked successfully for ${customerEmail}`,
        transactionId
      });
    }

    // Default: Subscription activation
    const rawPlan = (metadata.plan || payload.plan || 'byok_starter').toString().trim().toLowerCase();
    let resolvedTier: 'byok_starter' | 'byok_pro' | 'managed' = 'byok_starter';
    if (rawPlan === 'managed' || rawPlan === 'complete') {
      resolvedTier = 'managed';
    } else if (rawPlan === 'byok_pro' || rawPlan === 'pro' || rawPlan === 'ultra' || rawPlan === 'byok') {
      resolvedTier = 'byok_pro';
    } else {
      resolvedTier = 'byok_starter';
    }

    const interval = metadata.interval === 'yearly' ? 'yearly' : 'monthly';

    const grant = upsertUserGrant({
      email: customerEmail,
      name: customerName,
      isSubscribed: true,
      tier: resolvedTier,
      interval,
      unlockedStoreBots: existingBots,
      note: `Subscription activated via IPN/Webhook [trx: ${transactionId}]`
    });

    console.log(`Payment Webhook successfully processed for ${customerEmail}: Tier ${grant.tier}, ${interval}`);

    return json({
      success: true,
      message: 'Subscription grant activated successfully',
      transactionId,
      tier: grant.tier,
      expiresAt: grant.expiresAt
    });
  } catch (err: any) {
    console.error('Unhandled error in /api/payment/webhook:', err);
    return json({ success: false, error: err.message || 'Internal webhook error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  return json({
    status: 'active',
    endpoint: '/api/payment/webhook',
    message: 'EzboAgents Payment IPN / Webhook Receiver is online'
  });
};
