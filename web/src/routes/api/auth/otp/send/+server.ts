import { json, type RequestHandler } from '@sveltejs/kit';
import { generateAndStoreOtp } from '$lib/server/otpStore';
import { sendEmail, getOtpEmailHtml } from '$lib/services/smtp';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, name, action } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return json({ success: false, error: 'A valid email address is required.' }, { status: 400 });
    }

    if (action !== 'signup' && action !== 'reset_password') {
      return json({ success: false, error: 'Valid action (signup or reset_password) is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpCode = generateAndStoreOtp(cleanEmail, action);

    const subject = action === 'signup'
      ? `${otpCode} is your EzboAgents verification code`
      : `${otpCode} is your EzboAgents password reset code`;

    const html = getOtpEmailHtml(otpCode, action, name);

    const mailResult = await sendEmail({
      to: cleanEmail,
      subject,
      html
    });

    return json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      simulated: mailResult.simulated,
      // Provide preview in development/simulated mode for convenience
      ...(mailResult.simulated ? { debugCode: otpCode } : {})
    });
  } catch (err: any) {
    console.error('Error in send-otp API:', err);
    return json({ success: false, error: err.message || 'Failed to send verification code.' }, { status: 500 });
  }
};
