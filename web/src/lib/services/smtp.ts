import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Configure and return Nodemailer transporter using environment variables.
 * Falls back to mock transport with detailed console logging if credentials are not configured.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

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
    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"SuperAI Hub" <noreply@ezboagents.com>';

    if (!transporter) {
      console.log(`\n📧 [SMTP DEV MOCK] Outgoing Email:`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   (Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env for production mail delivery)\n`);
      return {
        success: true,
        simulated: true,
        messageId: `mock-${Date.now()}`
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
 * Generate Welcome Email template for new SuperAI Hub users
 */
export function getWelcomeEmailHtml(name: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; background-color: #090d16; color: #e2e8f0; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Super<span style="color: #10b981;">AI</span> Hub</h1>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">50+ Specialized AI Helpers & WhatsApp Personal Assistant</p>
      </div>

      <div style="background-color: #0f172a; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Welcome aboard, ${name}! 🎉</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Your SuperAI Hub account is now active. You have full access to our web AI workspace and personal WhatsApp assistant engine.
        </p>

        <div style="margin: 20px 0; padding: 16px; background-color: #1e293b; border-radius: 8px; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 6px 0; color: #10b981; font-size: 14px;">Next Steps to Get Started:</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #cbd5e1; line-height: 1.8;">
            <li>Go to your <strong>Dashboard</strong></li>
            <li>Connect your free Google AI Studio Gemini API Key</li>
            <li>Link your WhatsApp account via QR scan for 24/7 personal chat assistant</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://ezboagents.com/dashboard" style="background: #10b981; color: #022c22; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block;">
            Open Your Dashboard →
          </a>
        </div>
      </div>

      <div style="text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px;">
        <p style="margin: 0;">© 2026 SuperAI Hub (ezboagents.com). All rights reserved.</p>
        <p style="margin: 4px 0 0 0;">Need help? Contact support at <a href="mailto:support@ezboagents.com" style="color: #10b981; text-decoration: none;">support@ezboagents.com</a></p>
      </div>
    </div>
  `;
}
