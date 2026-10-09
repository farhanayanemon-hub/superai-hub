import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';

const OPAY_VERIFY_URL = 'http://verify.opaybd.com/api/payment/verify';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const adminConfig = getAdminConfig();
    const opayApiKey = adminConfig.opayApiKey || process.env.OPAY_API_KEY || '';
    const opaySecretKey = adminConfig.opaySecretKey || process.env.OPAY_SECRET_KEY || '';
    const opayBrandKey = adminConfig.opayBrandKey || process.env.OPAY_BRAND_KEY || '';

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return json({ success: false, error: 'Transaction ID is required' }, { status: 400 });
    }

    if (!opayApiKey) {
      return json({
        success: false,
        error: 'OPayBD Payment Gateway is not configured with an API Key. Please configure your OPay credentials in the Admin Panel (/admin).'
      }, { status: 500 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'API-KEY': opayApiKey.trim()
    };

    if (opaySecretKey) headers['SECRET-KEY'] = opaySecretKey.trim();
    if (opayBrandKey) headers['BRAND-KEY'] = opayBrandKey.trim();

    let opayRes = await fetch(OPAY_VERIFY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transaction_id: transactionId.trim()
      })
    }).catch(async () => {
      return await fetch('https://verify.opaybd.com/api/payment/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transaction_id: transactionId.trim()
        })
      });
    });

    if (!opayRes.ok) {
      const errText = await opayRes.text();
      return json({
        success: false,
        error: `OPay Verification Error (${opayRes.status}): ${errText}`
      }, { status: opayRes.status });
    }

    const verifyData = await opayRes.json();

    const isSuccess =
      verifyData.status === 'COMPLETED' ||
      verifyData.status === 'SUCCESS' ||
      verifyData.status === true;

    return json({
      success: isSuccess,
      status: verifyData.status,
      data: verifyData,
      metadata: typeof verifyData.metadata === 'string'
        ? JSON.parse(verifyData.metadata)
        : (verifyData.metadata || {})
    });
  } catch (error: any) {
    console.error('Error verifying OPay transaction:', error);
    return json({
      success: false,
      error: error.message || 'Verification failed due to an internal server error'
    }, { status: 500 });
  }
};
