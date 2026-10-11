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
            user.planTier === 'byok'
              ? 'BYOK Multi-Engine'
              : user.planTier === 'managed'
                ? 'All-Inclusive Cloud'
                : user.planTier.toUpperCase();

          const welcomeMsg =
            `<b>🎉 অভিনন্দন ${escapeHtml(user.userName)}!</b>\n\nআপনার <b>EzboAgents</b> অ্যাকাউন্ট সফলভাবে টেলিগ্রামের সাথে সিঙ্ক হয়েছে!\n\n` +
            `💎 <b>সাবস্ক্রিপশন প্ল্যান:</b> ${escapeHtml(tierLabel)}\n` +
            `🟢 <b>স্ট্যাটাস:</b> ${user.isSubscribed ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}\n` +
            `👑 <b>অ্যাক্টিভ কমান্ডার:</b> ${escapeHtml(AI_CEO_PROFILE.name)} (Controls All 75 AI Helpers)\n\n` +
            `<b>প্রয়োজনীয় কমান্ডসমূহ:</b>\n` +
            `• <code>/ceo</code> - মেইন AI CEO মোড সক্রিয় করুন (সব ৭৫টি হেল্পার অটো-কন্ট্রোল)\n` +
            `• <code>/helpers</code> - ৭৫টি AI Helper-এর ক্যাটাগরি ও কোড (#01–#75) দেখুন\n` +
            `• <code>/helper #01</code> - নির্দিষ্ট হেল্পার সিলেক্ট করুন\n` +
            `• <code>/image [prompt]</code> - কমার্শিয়াল AI ছবি তৈরি (#34)\n` +
            `• <code>/status</code> - আপনার অ্যাকাউন্ট ও প্ল্যানের তথ্য\n\n` +
            `<i>ℹ️ নোট: Agents Store-এর অটোনোমাস এজেন্টগুলো শুধুমাত্র ওয়েব ড্যাশবোর্ডে কাজ করে, টেলিগ্রাম বা হোয়াটসঅ্যাপ থেকে কন্ট্রোল করা যায় না।</i>`;

          await sendTelegramMessage(botToken, chatId, welcomeMsg);
          return json({ ok: true });
        } else {
          const errMsg = `⚠️ <b>লিঙ্ক ব্যর্থ হয়েছে:</b>\n${escapeHtml(linkRes.error || 'ভুল বা মেয়াদোত্তীর্ণ সিঙ্ক কোড।')}\n\nদয়া করে আপনার ড্যাশবোর্ডের <b>Channels &gt; Telegram</b> ট্যাব থেকে ফ্রেশ কোড নিয়ে পুনরায় চেষ্টা করুন।`;
          await sendTelegramMessage(botToken, chatId, errMsg);
          return json({ ok: true });
        }
      }

      const existingUser = getLinkedUserByChatId(chatId);
      if (existingUser) {
        const msg =
          `👋 <b>ওয়েলকাম ব্যাক, ${escapeHtml(existingUser.userName)}!</b>\n\n` +
          `👑 আপনার <b>Master AI CEO</b> এবং <b>৭৫টি AI Helper (#01–#75)</b> প্রস্তুত।\n` +
          `যেকোনো কাজের নির্দেশ সরাসরি লিখে পাঠান অথবা <code>/helpers</code> লিখে তালিকা দেখুন।`;
        await sendTelegramMessage(botToken, chatId, msg);
        return json({ ok: true });
      }

      const unlinkedMsg =
        `👋 <b>স্বাগতম EzboAgents Telegram Bot-এ!</b>\n\n` +
        `আপনার টেলিগ্রাম অ্যাকাউন্টটি এখনও EzboAgents-এর সাথে লিঙ্ক করা হয়নি।\n\n` +
        `<b>কীভাবে লিঙ্ক করবেন:</b>\n` +
        `১. ড্যাশবোর্ডে লগইন করুন: <a href="https://ezboagents.com/dashboard">ezboagents.com/dashboard</a>\n` +
        `২. <b>Channels &gt; Telegram</b> অপশন থেকে ৬-সংখ্যার Sync কোডটি এখানে পাঠিয়ে দিন (যেমন: <code>EZBO-8492</code>)।`;
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
        const msg = `<b>✅ অ্যাকাউন্ট সফলভাবে লিঙ্ক হয়েছে!</b>\n\nস্বাগতম, <b>${escapeHtml(user.userName)}</b>!\nআপনার মেইন <b>AI CEO</b> এবং <b>৭৫টি AI Helper</b> এখন টেলিগ্রামে প্রস্তুত।`;
        await sendTelegramMessage(botToken, chatId, msg);
        return json({ ok: true });
      } else {
        await sendTelegramMessage(
          botToken,
          chatId,
          `⚠️ ${escapeHtml(linkRes.error || 'অবৈধ কোড।')}`
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
        `🔒 <b>Autonomous Store Agents Notice:</b>\n\nAgents Store থেকে কেনা এজেন্টগুলো সম্পূর্ণ <b>Autonomous Agent</b> স্টাইলে কাজ করে। সেগুলো শুধুমাত্র ওয়েব ড্যাশবোর্ডে (<a href="https://ezboagents.com/dashboard">ezboagents.com/dashboard</a>) গিয়ে আলাদাভাবে সেটআপ ও ব্যবহার করতে হবে — টেলিগ্রাম বা হোয়াটসঅ্যাপ থেকে কন্ট্রোল করা যাবে না।\n\nতবে মেইন <b>AI CEO</b> এবং সব <b>৭৫টি AI Helper (#01–#75)</b> এখান থেকে পূর্ণ নিয়ন্ত্রণ করতে পারবেন!`
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
          '⚠️ আপনার অ্যাকাউন্ট লিঙ্ক করা নেই। অনুগ্রহ করে ড্যাশবোর্ডের Channels ট্যাব থেকে Sync কোড পাঠান।'
        );
        return json({ ok: true });
      }

      const tierLabel =
        linkedUser.planTier === 'byok'
          ? 'BYOK Multi-Engine (Personal API)'
          : linkedUser.planTier === 'managed'
            ? 'All-Inclusive Cloud (Managed AI)'
            : linkedUser.planTier.toUpperCase();

      const activeHelper = matchHelperForMessage('', linkedUser.activeAgent);
      const activeLabel = activeHelper
        ? `[${activeHelper.code}] ${activeHelper.name}`
        : `👑 ${AI_CEO_PROFILE.name} (Auto-Controls All 75 Helpers)`;

      const statusCard =
        `<b>📊 আপনার EzboAgents অ্যাকাউন্ট স্ট্যাটাস</b>\n\n` +
        `👤 <b>নাম:</b> ${escapeHtml(linkedUser.userName)}\n` +
        `💎 <b>প্ল্যান:</b> ${escapeHtml(tierLabel)}\n` +
        `🟢 <b>সাবস্ক্রিপশন:</b> ${linkedUser.isSubscribed ? 'সক্রিয় (Active)' : 'মেয়াদোত্তীর্ণ (Expired)'}\n` +
        `🤖 <b>বর্তমান মোড:</b> ${escapeHtml(activeLabel)}\n` +
        `✨ <b>উপলব্ধ AI Helpers:</b> ৭৫টি (#01 থেকে #75)\n\n` +
        `<i>মেইন AI CEO মোডে ফিরতে <code>/ceo</code> লিখুন অথবা সব হেল্পার দেখতে <code>/helpers</code> লিখুন।</i>`;

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
        `👑 <b>Master AI CEO Mode Activated!</b>\n\nএখন থেকে আপনার যেকোনো মেসেজ মেইন <b>AI CEO</b> রিসিভ করবে এবং ৭৫টি AI Helper (#01–#75) থেকে উপযুক্ত হেল্পারকে দিয়ে সাথে সাথে কাজ করিয়ে দেবে।`
      );
      return json({ ok: true });
    }

    if (text === '/helpers' || text === '/agents') {
      const catLines = CATEGORIES.filter((c) => c.id !== 'all')
        .map((cat) => {
          const items = TOOLS.filter((t) => t.category === cat.id);
          const firstCode = items[0]?.code || '';
          const lastCode = items[items.length - 1]?.code || '';
          return `• <b>${escapeHtml(cat.name)}</b> (${firstCode}–${lastCode})\n  উদাহরণ: <code>${items
            .slice(0, 3)
            .map((i) => `${i.code} ${i.name}`)
            .join(', ')}</code>`;
        })
        .join('\n\n');

      const helperListMsg =
        `<b>👑 1 Master AI CEO + 75 AI Helpers (#01–#75)</b>\n\n` +
        `${catLines}\n\n` +
        `👉 <b>যেভাবে ব্যবহার করবেন:</b>\n` +
        `• সরাসরি যেকোনো কাজের নির্দেশ লিখুন — <b>AI CEO</b> নিজেই সঠিক হেল্পার বেছে নেবে।\n` +
        `• অথবা মেসেজের শুরুতে কোড লিখুন: যেমন <code>#01 ফ্যাশন ব্র্যান্ডের ফেসবুক এড লিখে দাও</code>\n` +
        `• নির্দিষ্ট হেল্পার পিন করতে: <code>/helper #24</code>\n` +
        `• মেইন AI CEO-তে ফিরতে: <code>/ceo</code>`;

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
          `👑 <b>Master AI CEO</b> সক্রিয় করা হয়েছে! এখন যেকোনো কাজের নির্দেশ পাঠান।`
        );
        return json({ ok: true });
      }

      const matched = matchHelperForMessage(target, target);
      if (!matched) {
        await sendTelegramMessage(
          botToken,
          chatId,
          `⚠️ "${escapeHtml(target)}" কোড বা নামের কোনো AI Helper পাওয়া যায়নি। <code>#01</code> থেকে <code>#75</code> কোড ব্যবহার করুন অথবা <code>/helpers</code> লিখুন।`
        );
        return json({ ok: true });
      }

      if (linkedUser) {
        updateUserAgent(chatId, matched.id);
      }

      await sendTelegramMessage(
        botToken,
        chatId,
        `✅ <b>AI Helper Selected: [${escapeHtml(matched.code)}] ${escapeHtml(matched.name)}</b>\n<i>${escapeHtml(matched.shortDesc)}</i>\n\nএখন আপনার টাস্ক লিখে পাঠান। (মেইন AI CEO মোডে ফিরতে <code>/ceo</code> লিখুন)`
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
          '⚠️ অনুগ্রহ করে প্রম্পট লিখুন। যেমন: <code>/image luxury perfume bottle commercial photo</code>'
        );
        return json({ ok: true });
      }

      if (!linkedUser || !linkedUser.isSubscribed) {
        await sendTelegramMessage(
          botToken,
          chatId,
          '⚠️ ইমেজ জেনারেশনের জন্য আপনার EzboAgents সাবস্ক্রিপশন সক্রিয় থাকা প্রয়োজন।'
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
        `• <code>/ceo</code> - মেইন AI CEO মোড (সব ৭৫টি হেল্পার অটো-কন্ট্রোল)\n` +
        `• <code>/helpers</code> - ৭৫টি AI Helper-এর ক্যাটাগরি ও কোড (#01–#75)\n` +
        `• <code>/helper #01</code> - নির্দিষ্ট হেল্পার সিলেক্ট করা\n` +
        `• <code>/image [প্রম্পট]</code> - কমার্শিয়াল AI ইমেজ জেনারেশন\n` +
        `• <code>/status</code> - আপনার অ্যাকাউন্ট ও প্ল্যানের তথ্য\n\n` +
        `<b>দ্রুত টিপস:</b> যেকোনো মেসেজে <code>#01</code> থেকে <code>#75</code> লিখলে সরাসরি সেই হেল্পার কাজ করবে, আর কিছু না লিখলে মেইন <b>AI CEO</b> নিজেই উপযুক্ত হেল্পার বেছে নেবে!`;
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
        '⚠️ আপনার টেলিগ্রাম অ্যাকাউন্টটি এখনও EzboAgents-এ লিঙ্ক করা নেই!\nড্যাশবোর্ডের <b>Channels &gt; Telegram</b> ট্যাব থেকে আপনার Sync কোডটি এখানে মেসেজ করুন।'
      );
      return json({ ok: true });
    }

    if (!linkedUser.isSubscribed) {
      await sendTelegramMessage(
        botToken,
        chatId,
        '⚠️ <b>সাবস্ক্রিপশন মেয়াদোত্তীর্ণ:</b> অনুগ্রহ করে <a href="https://ezboagents.com/plans">ezboagents.com/plans</a> থেকে প্ল্যান রিনিউ করুন।'
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
    if (linkedUser.planTier === 'byok' && linkedUser.byokKey) {
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
        (linkedUser.planTier === 'byok' && linkedUser.byokKey))
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
      aiReply = `👑 <b>AI CEO:</b> আপনার বার্তাটি গৃহীত হয়েছে। অনুগ্রহ করে ড্যাশবোর্ডে বা অ্যাডমিন প্যানেলে API Key সংযুক্ত আছে কিনা যাচাই করুন।`;
    }

    if (aiReply.length > 4000) {
      aiReply = aiReply.slice(0, 3950) + '\n\n...(মেসেজ সংক্ষিপ্ত করা হয়েছে)';
    }

    await sendTelegramMessage(botToken, chatId, aiReply);
    return json({ ok: true });
  } catch (err: any) {
    console.error('Unhandled error in /api/telegram/webhook:', err);
    return json({ ok: true });
  }
};
