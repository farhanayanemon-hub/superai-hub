import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
import { TOOLS, CATEGORIES, AI_CEO_PROFILE } from '$lib/config/tools';
import {
  matchHelperForMessage,
  buildCeoOrHelperSystemPrompt,
  isVisualGenerationHelper
} from '$lib/services/ceoRouter';
import {
  sendTelegramMessage,
  sendTelegramPhoto,
  sendTelegramChatAction,
  escapeHtml
} from '$lib/services/telegram';
import {
  getLinkedUserByChatId,
  linkUserByCode,
  updateUserAgent,
  touchUserInteraction
} from '$lib/server/telegramStore';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const config = getAdminConfig();
    const botToken = config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '';

    if (!botToken) {
      console.warn('Telegram Webhook received update, but TELEGRAM_BOT_TOKEN is not configured.');
      return json({ ok: true });
    }

    const update = await request.json();
    const message = update.message;

    if (!message || !message.chat) {
      return json({ ok: true });
    }

    const chatId = message.chat.id;
    const text: string = (message.text || '').trim();
    const fromUser = message.from || {};

    if (!text) {
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 1. COMMAND: /start [payload]
    // -----------------------------------------------------------------
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const payload = parts.length > 1 ? parts[1].trim() : '';

      if (payload) {
        const linkRes = linkUserByCode(chatId, payload, {
          username: fromUser.username,
          firstName: fromUser.first_name
        });

        if (linkRes.success && linkRes.user) {
          const user = linkRes.user;
          const tierLabel =
            user.planTier === 'byok' || user.planTier === 'byok_starter'
              ? 'BYOK Starter'
              : user.planTier === 'byok_pro'
                ? 'BYOK Pro'
                : user.planTier === 'managed'
                  ? 'All-Inclusive Cloud'
                  : user.planTier.toUpperCase();

          const welcomeMsg =
            `<b>🎉 Welcome ${escapeHtml(user.userName)}!</b>\n\nYour <b>EzboAgents</b> account is now synced with Telegram!\n\n` +
            `💎 <b>Subscription Plan:</b> ${escapeHtml(tierLabel)}\n` +
            `🟢 <b>Status:</b> ${user.isSubscribed ? 'Active' : 'Inactive'}\n` +
            `👑 <b>Active Commander:</b> ${escapeHtml(AI_CEO_PROFILE.name)} (Controls All 75 AI Helpers)\n\n` +
            `<b>Available Commands:</b>\n` +
            `• <code>/ceo</code> - Activate Master AI CEO Mode (Auto-controls all 75 helpers)\n` +
            `• <code>/helpers</code> - View all 75 AI Helpers by category (#01–#75)\n` +
            `• <code>/helper #01</code> - Pin a specific AI Helper\n` +
            `• <code>/image [prompt]</code> - Generate commercial AI visuals (#34)\n` +
            `• <code>/status</code> - View your account and plan status\n\n` +
            `<i>ℹ️ Note: Autonomous Agents from the "Agents Store" operate exclusively on the Web Dashboard and cannot be controlled via Telegram or WhatsApp.</i>`;

          await sendTelegramMessage(botToken, chatId, welcomeMsg);
          return json({ ok: true });
        } else {
          const errMsg = `⚠️ <b>Link Failed:</b>\n${escapeHtml(linkRes.error || 'Invalid or expired sync code.')}\n\nPlease generate a fresh code from your Dashboard under <b>Channels &gt; Telegram</b>.`;
          await sendTelegramMessage(botToken, chatId, errMsg);
          return json({ ok: true });
        }
      }

      const existingUser = getLinkedUserByChatId(chatId);
      if (existingUser) {
        const msg =
          `👋 <b>Welcome back, ${escapeHtml(existingUser.userName)}!</b>\n\n` +
          `👑 Your <b>Master AI CEO</b> and <b>75 AI Helpers (#01–#75)</b> are online.\n` +
          `Send any instruction directly or type <code>/helpers</code> to browse the catalog.`;
        await sendTelegramMessage(botToken, chatId, msg);
        return json({ ok: true });
      }

      const unlinkedMsg =
        `👋 <b>Welcome to the EzboAgents Telegram Bot!</b>\n\n` +
        `Your Telegram account is not linked to EzboAgents yet.\n\n` +
        `<b>How to link:</b>\n` +
        `1. Sign in to your dashboard: <a href="https://ezboagents.com/dashboard">ezboagents.com/dashboard</a>\n` +
        `2. Open <b>Channels &gt; Telegram</b> and send your 6-digit Sync Code here (e.g. <code>EZBO-8492</code>).`;
      await sendTelegramMessage(botToken, chatId, unlinkedMsg);
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 2. RAW SYNC CODE (e.g. EZBO-1234 or SYNC_...)
    // -----------------------------------------------------------------
    if (text.toUpperCase().startsWith('EZBO-') || text.toUpperCase().startsWith('SYNC_')) {
      const linkRes = linkUserByCode(chatId, text, {
        username: fromUser.username,
        firstName: fromUser.first_name
      });

      if (linkRes.success && linkRes.user) {
        const user = linkRes.user;
        const msg = `<b>✅ Account Linked Successfully!</b>\n\nWelcome, <b>${escapeHtml(user.userName)}</b>!\nYour <b>Master AI CEO</b> and all <b>75 AI Helpers</b> are ready on Telegram.`;
        await sendTelegramMessage(botToken, chatId, msg);
        return json({ ok: true });
      } else {
        await sendTelegramMessage(
          botToken,
          chatId,
          `⚠️ ${escapeHtml(linkRes.error || 'Invalid sync code.')}`
        );
        return json({ ok: true });
      }
    }

    const linkedUser = getLinkedUserByChatId(chatId);

    // -----------------------------------------------------------------
    // 3. BLOCK AUTONOMOUS STORE AGENTS ON TELEGRAM
    // -----------------------------------------------------------------
    if (text.startsWith('/store') || text.toLowerCase().includes('store agent')) {
      await sendTelegramMessage(
        botToken,
        chatId,
        `🔒 <b>Autonomous Store Agents Notice:</b>\n\nAgents unlocked from the <b>Agents Store</b> operate as standalone <b>Autonomous Agents</b>. They must be configured and used directly inside the Web Dashboard (<a href="https://ezboagents.com/dashboard">ezboagents.com/dashboard</a>) and cannot be controlled via Telegram or WhatsApp.\n\nHowever, you can control the <b>Master AI CEO</b> and all <b>75 AI Helpers (#01–#75)</b> right here!`
      );
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 4. COMMAND: /status
    // -----------------------------------------------------------------
    if (text === '/status') {
      if (!linkedUser) {
        await sendTelegramMessage(
          botToken,
          chatId,
          '⚠️ Your account is not linked. Please send your Sync Code from the Channels tab in the dashboard.'
        );
        return json({ ok: true });
      }

      const tierLabel =
        linkedUser.planTier === 'byok' || linkedUser.planTier === 'byok_starter'
          ? 'BYOK Starter (Personal API)'
          : linkedUser.planTier === 'byok_pro'
            ? 'BYOK Pro (Multi-Engine API)'
            : linkedUser.planTier === 'managed'
              ? 'All-Inclusive Cloud (Managed AI)'
              : linkedUser.planTier.toUpperCase();

      const activeHelper = matchHelperForMessage('', linkedUser.activeAgent);
      const activeLabel = activeHelper
        ? `[${activeHelper.code}] ${activeHelper.name}`
        : `👑 ${AI_CEO_PROFILE.name} (Auto-Controls All 75 Helpers)`;

      const statusCard =
        `<b>📊 Your EzboAgents Account Status</b>\n\n` +
        `👤 <b>Name:</b> ${escapeHtml(linkedUser.userName)}\n` +
        `💎 <b>Plan:</b> ${escapeHtml(tierLabel)}\n` +
        `🟢 <b>Subscription:</b> ${linkedUser.isSubscribed ? 'Active' : 'Expired'}\n` +
        `🤖 <b>Current Mode:</b> ${escapeHtml(activeLabel)}\n` +
        `✨ <b>Available AI Helpers:</b> 75 (#01 to #75)\n\n` +
        `<i>Type <code>/ceo</code> for Master AI CEO mode or <code>/helpers</code> to browse all helpers.</i>`;

      await sendTelegramMessage(botToken, chatId, statusCard);
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 5. COMMAND: /ceo, /helpers, /agents, /helper [code], /agent [code]
    // -----------------------------------------------------------------
    if (text === '/ceo') {
      if (linkedUser) {
        updateUserAgent(chatId, 'ceo');
      }
      await sendTelegramMessage(
        botToken,
        chatId,
        `👑 <b>Master AI CEO Mode Activated!</b>\n\nSend any task or instruction — the <b>AI CEO</b> will automatically select and command the right specialist helper from all 75 AI Helpers (#01–#75).`
      );
      return json({ ok: true });
    }

    if (text === '/helpers' || text === '/agents') {
      const catLines = CATEGORIES.filter((c) => c.id !== 'all')
        .map((cat) => {
          const items = TOOLS.filter((t) => t.category === cat.id);
          const firstCode = items[0]?.code || '';
          const lastCode = items[items.length - 1]?.code || '';
          return `• <b>${escapeHtml(cat.name)}</b> (${firstCode}–${lastCode})\n  Examples: <code>${items
            .slice(0, 3)
            .map((i) => `${i.code} ${i.name}`)
            .join(', ')}</code>`;
        })
        .join('\n\n');

      const helperListMsg =
        `<b>👑 1 Master AI CEO + 75 AI Helpers (#01–#75)</b>\n\n` +
        `${catLines}\n\n` +
        `👉 <b>How to use:</b>\n` +
        `• Just write your task in plain language — the <b>AI CEO</b> will automatically delegate to the best helper.\n` +
        `• Or start your message with a code: e.g. <code>#01 Write Facebook ad copy for a clothing brand</code>\n` +
        `• Pin a specific helper: <code>/helper #24</code>\n` +
        `• Return to Master AI CEO: <code>/ceo</code>`;

      await sendTelegramMessage(botToken, chatId, helperListMsg);
      return json({ ok: true });
    }

    if (text.startsWith('/helper ') || text.startsWith('/agent ')) {
      const target = text.replace(/^\/(helper|agent)\s+/i, '').trim();
      if (target.toLowerCase() === 'ceo' || target.toLowerCase() === 'general') {
        if (linkedUser) updateUserAgent(chatId, 'ceo');
        await sendTelegramMessage(
          botToken,
          chatId,
          `👑 <b>Master AI CEO</b> activated! Send any task or instruction now.`
        );
        return json({ ok: true });
      }

      const matched = matchHelperForMessage(target, target);
      if (!matched) {
        await sendTelegramMessage(
          botToken,
          chatId,
          `⚠️ Could not find an AI Helper matching "${escapeHtml(target)}". Use a code from <code>#01</code> to <code>#75</code> or type <code>/helpers</code>.`
        );
        return json({ ok: true });
      }

      if (linkedUser) {
        updateUserAgent(chatId, matched.id);
      }

      await sendTelegramMessage(
        botToken,
        chatId,
        `✅ <b>AI Helper Selected: [${escapeHtml(matched.code)}] ${escapeHtml(matched.name)}</b>\n<i>${escapeHtml(matched.shortDesc)}</i>\n\nSend your instruction now. (Type <code>/ceo</code> anytime to return to Master AI CEO mode)`
      );
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 6. COMMAND: /image [prompt] or #34 / #35
    // -----------------------------------------------------------------
    if (text.startsWith('/image')) {
      const prompt = text.replace('/image', '').trim();
      if (!prompt) {
        await sendTelegramMessage(
          botToken,
          chatId,
          '⚠️ Please provide an image prompt. Example: <code>/image luxury perfume bottle commercial photo</code>'
        );
        return json({ ok: true });
      }

      if (!linkedUser || !linkedUser.isSubscribed) {
        await sendTelegramMessage(
          botToken,
          chatId,
          '⚠️ An active EzboAgents subscription is required for image generation.'
        );
        return json({ ok: true });
      }

      await sendTelegramChatAction(botToken, chatId, 'upload_photo');
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
      await sendTelegramPhoto(
        botToken,
        chatId,
        imageUrl,
        `🎨 <b>[#34] AI Commercial Image Generator:</b> ${escapeHtml(prompt)}`
      );
      touchUserInteraction(chatId);
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 7. COMMAND: /help
    // -----------------------------------------------------------------
    if (text === '/help') {
      const helpMsg =
        `<b>💡 EzboAgents — Master AI CEO & 75 Helpers Guide</b>\n\n` +
        `• <code>/ceo</code> - Master AI CEO Mode (Auto-controls all 75 helpers)\n` +
        `• <code>/helpers</code> - View all 75 AI Helpers by category (#01–#75)\n` +
        `• <code>/helper #01</code> - Pin a specific helper\n` +
        `• <code>/image [prompt]</code> - Commercial AI image generation\n` +
        `• <code>/status</code> - View your account and plan status\n\n` +
        `<b>Quick Tip:</b> Prefix any message with <code>#01</code> through <code>#75</code> to invoke that helper directly, or simply write your request and let the <b>Master AI CEO</b> route it automatically!`;
      await sendTelegramMessage(botToken, chatId, helpMsg);
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 8. GENERAL CHAT / AI CEO ORCHESTRATION
    // -----------------------------------------------------------------
    if (!linkedUser) {
      await sendTelegramMessage(
        botToken,
        chatId,
        '⚠️ Your Telegram account is not linked to EzboAgents yet!\nPlease send your Sync Code from <b>Channels &gt; Telegram</b> in your dashboard.'
      );
      return json({ ok: true });
    }

    if (!linkedUser.isSubscribed) {
      await sendTelegramMessage(
        botToken,
        chatId,
        '⚠️ <b>Subscription Expired:</b> Please renew your plan at <a href="https://ezboagents.com/plans">ezboagents.com/plans</a>.'
      );
      return json({ ok: true });
    }

    const pinnedHelperId =
      linkedUser.activeAgent && linkedUser.activeAgent !== 'general' && linkedUser.activeAgent !== 'ceo'
        ? linkedUser.activeAgent
        : undefined;
    const matchedHelper = matchHelperForMessage(text, pinnedHelperId);

    // Visual generation check (#34 or #35)
    if (isVisualGenerationHelper(matchedHelper, text)) {
      await sendTelegramChatAction(botToken, chatId, 'upload_photo');
      const cleanPrompt = text.replace(/^#\d+\s*/, '').trim();
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
      await sendTelegramPhoto(
        botToken,
        chatId,
        imageUrl,
        `👑 <b>AI CEO → [${escapeHtml(matchedHelper?.code || '#34')}] ${escapeHtml(matchedHelper?.name || 'Visual Generator')}</b>\nPrompt: ${escapeHtml(cleanPrompt)}`
      );
      touchUserInteraction(chatId);
      return json({ ok: true });
    }

    await sendTelegramChatAction(botToken, chatId, 'typing');
    touchUserInteraction(chatId);

    const systemPrompt = buildCeoOrHelperSystemPrompt(matchedHelper, {
      mode: pinnedHelperId ? 'helper' : 'ceo'
    });

    let resolvedApiKey = config.geminiApiKey || process.env.PLATFORM_GEMINI_KEY || '';
    const isByokTier =
      linkedUser.planTier === 'byok' ||
      linkedUser.planTier === 'byok_starter' ||
      linkedUser.planTier === 'byok_pro';
    if (isByokTier && linkedUser.byokKey) {
      resolvedApiKey = linkedUser.byokKey;
    }
    if (!resolvedApiKey) {
      resolvedApiKey = config.openaiApiKey || '';
    }

    let aiReply = '';

    if (
      resolvedApiKey &&
      (config.geminiApiKey ||
        process.env.PLATFORM_GEMINI_KEY ||
        (isByokTier && linkedUser.byokKey))
    ) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${resolvedApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          aiReply = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (err) {
        console.error('Gemini fetch error in telegram webhook:', err);
      }
    } else if (config.openaiApiKey) {
      try {
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ]
          })
        });

        if (oaiRes.ok) {
          const oaiData = await oaiRes.json();
          aiReply = oaiData?.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.error('OpenAI fetch error in telegram webhook:', err);
      }
    }

    if (!aiReply) {
      aiReply = `👑 <b>AI CEO:</b> Your message was received. Please ensure an API Key is configured in your Dashboard or Admin Panel.`;
    }

    if (aiReply.length > 4000) {
      aiReply = aiReply.slice(0, 3950) + '\n\n...(Message truncated)';
    }

    await sendTelegramMessage(botToken, chatId, aiReply);
    return json({ ok: true });
  } catch (err: any) {
    console.error('Unhandled error in /api/telegram/webhook:', err);
    return json({ ok: true });
  }
};
