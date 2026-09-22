import { json, type RequestHandler } from '@sveltejs/kit';
import { sendEmail, getWelcomeEmailHtml } from '$lib/services/smtp';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { to, name, type, subject, html } = body;

    if (!to) {
      return json({ success: false, error: 'Recipient email is required' }, { status: 400 });
    }

    let emailSubject = subject;
    let emailHtml = html;

    if (type === 'welcome') {
      emailSubject = 'Welcome to SuperAI Hub - 50+ AI Helpers & WhatsApp Assistant!';
      emailHtml = getWelcomeEmailHtml(name || 'Entrepreneur');
    }

    const result = await sendEmail({
      to,
      subject: emailSubject || 'SuperAI Hub Notification',
      html: emailHtml || '<p>Hello from SuperAI Hub</p>'
    });

    return json(result);
  } catch (error: any) {
    console.error('Error in send-email API endpoint:', error);
    return json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
};
