import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
import { getPlanPrice, DEFAULT_PLANS } from '$lib/config/plans';

// Primary OPay endpoint per documentation
const OPAY_CREATE_URL = 'http://verify.opaybd.com/api/payment/create';

interface CreatePaymentRequest {
  type: 'subscription' | 'store_bot';
  plan?: 'byok' | 'managed' | 'pro' | 'ultra' | 'complete';
  interval?: 'monthly' | 'yearly';
  botId?: string;
  botName?: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const adminConfig = getAdminConfig();
    const opayApiKey = adminConfig.opayApiKey || process.env.OPAY_API_KEY || '';
    const opaySecretKey = adminConfig.opaySecretKey || process.env.OPAY_SECRET_KEY || '';
    const opayBrandKey = adminConfig.opayBrandKey || process.env.OPAY_BRAND_KEY || '';

    const body: CreatePaymentRequest = await request.json();
    let {
      type = 'subscription',
      plan = 'ultra',
      interval = 'monthly',
      botId,
      botName,
      amount,
      customerName = 'Valued Customer',
      customerEmail = 'customer@ezboagents.com',
      customerPhone = '01700000000'
    } = body;

    // If subscription, use server-configured plan pricing
    if (type === 'subscription') {
      const serverPrice = getPlanPrice(adminConfig.plans || DEFAULT_PLANS, plan, interval);
      if (serverPrice > 0) {
        amount = serverPrice;
      }
    }

    if (!amount || amount <= 0) {
      return json({ success: false, error: 'Valid payment amount is required' }, { status: 400 });
    }

    if (!opayApiKey) {
      return json({
        success: false,
        error: 'OPayBD Payment Gateway is not configured with an API Key. Please configure your OPay credentials in the Admin Panel (/admin).'
      }, { status: 500 });
    }

    // Determine current domain origin for callbacks
    const origin = url.origin || 'https://ezboagents.com';
    const successUrl = `${origin}/payment/callback?status=success`;
    const cancelUrl = `${origin}/payment/callback?status=cancel`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'API-KEY': opayApiKey.trim()
    };

    if (opaySecretKey) headers['SECRET-KEY'] = opaySecretKey.trim();
    if (opayBrandKey) headers['BRAND-KEY'] = opayBrandKey.trim();

    const payload = {
      cus_name: customerName.trim(),
      cus_email: customerEmail.trim(),
      amount: String(amount),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type,
        plan,
        interval,
        botId,
        botName,
        email: customerEmail,
        name: customerName,
        phone: customerPhone
      }
    };

    const targetEndpoint = (adminConfig.opayEndpointUrl || process.env.OPAY_ENDPOINT_URL || OPAY_CREATE_URL).trim();

    let opayRes: Response;
    try {
      opayRes = await fetch(targetEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch (networkErr: any) {
      console.error(`OPay fetch failed for endpoint ${targetEndpoint}:`, networkErr);
      return json({
        success: false,
        error: `OPayBD গেটওয়ে সার্ভারে সংযোগ করা যায়নি (${networkErr.message || 'DNS/Network Error'})। Endpoint: ${targetEndpoint}। দয়া করে এডমিন প্যানেলে (/admin) সঠিক OPay API Endpoint চেক বা আপডেট করুন।`
      }, { status: 502 });
    }

    if (!opayRes.ok) {
      const errText = await opayRes.text();
      return json({
        success: false,
        error: `OPay Gateway Error (${opayRes.status}): ${errText}`
      }, { status: opayRes.status });
    }

    const opayData = await opayRes.json();

    if (opayData.status === false || opayData.status === 'false') {
      return json({
        success: false,
        error: opayData.message || 'Payment creation was rejected by OPayBD.'
      }, { status: 400 });
    }

    const paymentUrl = opayData.payment_url || opayData.url;
    if (!paymentUrl) {
      return json({
        success: false,
        error: 'OPayBD did not return a checkout payment URL.'
      }, { status: 500 });
    }

    return json({
      success: true,
      paymentUrl,
      message: opayData.message || 'Payment URL generated successfully'
    });
  } catch (error: any) {
    console.error('Error creating OPay payment:', error);
    return json({
      success: false,
      error: error.message || 'Internal server error while initializing payment'
    }, { status: 500 });
  }
};
