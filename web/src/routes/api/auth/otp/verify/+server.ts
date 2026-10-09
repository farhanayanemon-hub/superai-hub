import { json, type RequestHandler } from '@sveltejs/kit';
import { verifyOtp } from '$lib/server/otpStore';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, code, action } = body;

    if (!email || !code || !action) {
      return json({ success: false, error: 'Email, verification code, and action are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const result = verifyOtp(cleanEmail, cleanCode, action);
    if (!result.success) {
      return json({ success: false, error: result.error || 'Invalid verification code.' }, { status: 400 });
    }

    return json({
      success: true,
      verified: true,
      message: 'Code verified successfully.'
    });
  } catch (err: any) {
    console.error('Error in verify-otp API:', err);
    return json({ success: false, error: err.message || 'Failed to verify code.' }, { status: 500 });
  }
};
