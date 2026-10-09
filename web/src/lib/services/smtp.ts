import nodemailer from 'nodemailer';
import { getAdminConfig } from '$lib/server/adminSettings';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Configure and return Nodemailer transporter using admin settings or environment variables.
 * Falls back to mock transport with detailed console logging if credentials are not configured.
 */
function getTransporter() {
  const admin = getAdminConfig();

  const host = admin.smtpHost || process.env.SMTP_HOST;
  const port = admin.smtpPort || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);
  const user = admin.smtpUser || process.env.SMTP_USER;
  const pass = admin.smtpPass || process.env.SMTP_PASS;
  const secure = admin.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || port === 465);

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });
  }

  return null;
}

/**
 * Send an email via configured SMTP server or simulated mock logger.
 */
export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  try {
    const admin = getAdminConfig();
    const transporter = getTransporter();
    const fromAddress = admin.smtpFrom || process.env.SMTP_FROM || 'EzboAgents <noreply@ezboagents.com>';

    if (!transporter) {
      console.log(`\n📧 [SMTP SIMULATED LOG] Outgoing Email:`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   (Configure SMTP credentials in /admin to deliver live emails)\n`);
      return {
        success: true,
        simulated: true,
        messageId: `simulated-${Date.now()}`
      };
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html
    });

    console.log(`✅ [SMTP] Email successfully sent to ${to} (MessageId: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
      simulated: false
    };
  } catch (error: any) {
    console.error('❌ [SMTP] Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Generate 6-Digit OTP Email template with EzboAgents branding
 */
export function getOtpEmailHtml(code: string, action: 'signup' | 'reset_password', name?: string): string {
  const isSignup = action === 'signup';
  const title = isSignup ? 'Verify Your Email Address' : 'Reset Your Password';
  const subtitle = isSignup
    ? 'Use the 6-digit verification code below to confirm your account and activate your Executive Workspace.'
    : 'Use the 6-digit code below to securely reset the password for your EzboAgents account.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 20px 32px; text-align: center; background-color: #ffffff;">
                  <div style="display: inline-block; width: 44px; height: 44px; border-radius: 12px; background: #2563eb; color: #ffffff; line-height: 44px; font-size: 22px; font-weight: bold; margin-bottom: 12px;">
                    ⚡
                  </div>
                  <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">EzboAgents</h1>
                  <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Executive AI Consortium</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 10px 32px 32px 32px;">
                  <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #1e293b; text-align: center;">${title}</h2>
                  ${name ? `<p style="margin: 0 0 14px 0; font-size: 14px; color: #475569; text-align: center;">Hello <strong>${name}</strong>,</p>` : ''}
                  <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">
                    ${subtitle}
                  </p>

                  <!-- OTP Box -->
                  <div style="background-color: #f8fafc; border: 2px dashed #93c5fd; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #1d4ed8; display: inline-block;">
                      ${code}
                    </span>
                    <p style="margin: 8px 0 0 0; font-size: 11px; font-weight: 600; color: #64748b;">
                      Valid for 10 minutes • Do not share this code
                    </p>
                  </div>

                  <!-- Security Note -->
                  <div style="background-color: #eff6ff; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
                      🔒 If you did not make this request on <a href="https://ezboagents.com" style="color: #2563eb; font-weight: 600; text-decoration: none;">ezboagents.com</a>, please ignore this email. Your account remains completely secure.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    © 2026 EzboAgents • ezboagents.com • Real-time AI Executive Workforce
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Generate Welcome Email template for new EzboAgents users
 */
export function getWelcomeEmailHtml(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to EzboAgents</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <tr>
                <td style="padding: 32px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a;">Welcome to EzboAgents! 🎉</h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #2563eb; font-weight: 600;">Your Executive AI Consortium is ready.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; line-height: 1.6;">
                    Hello <strong>${name}</strong>,<br><br>
                    Your account has been successfully verified! You now have access to our 50+ specialized AI executives, Multi-API Key Vault, and private WhatsApp link.
                  </p>

                  <div style="text-align: center; margin: 28px 0;">
                    <a href="https://ezboagents.com/plans" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-size: 13px; font-weight: 700; text-decoration: none; display: inline-block;">
                      Select Your Plan & Unlock Dashboard →
                    </a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
