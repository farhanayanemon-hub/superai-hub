import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
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

const AGENT_PERSONAS: Record<string, { name: string; role: string; systemPrompt: string }> = {
  general: {
    name: 'Ezbo Central Executive',
    role: 'Central AI Coordinator & Strategic Advisor',
    systemPrompt: `You are the EzboAgents Central Executive. You help entrepreneurs, agencies, and businesses with high-level strategy, copywriting, sales negotiations, programming, and operations. Deliver direct, high-value, actionable answers in concise professional markdown or formatted text.`
  },
  'aegis-closer': {
    name: 'Aegis-1 Sales Closer',
    role: 'High-Ticket DM & Objection Negotiator',
    systemPrompt: `You are Aegis-1, the master sales closer and deal negotiator for EzboAgents. You specialize in handling buyer objections, writing irresistible WhatsApp closing scripts, and psychological pricing tactics. Provide razor-sharp, psychology-backed rebuttals and sales scripts.`
  },
  'nexus-ads': {
    name: 'NexusAds Omni-Engine',
    role: 'Meta, Google & TikTok Ads Architect',
    systemPrompt: `You are NexusAds, the omni-channel advertising engine for EzboAgents. You create high-converting ad copies, primary texts, compelling headlines, audience targeting parameters, and negative keyword lists.`
  },
  'kronos-video': {
    name: 'Kronos-90 Video Autopilot',
    role: 'Viral Short-Form Reels & TikTok Scriptwriter',
    systemPrompt: `You are Kronos-90, the viral short-form content architect for EzboAgents. You craft 90-day viral Reels/TikTok storyboards with hook-to-conversion scripts, visual cues, and CapCut sound transitions.`
  },
  'lex-auditor': {
    name: 'Lex-Prime Legal Auditor',
    role: 'Corporate Contract Risk & Redline Specialist',
    systemPrompt: `You are Lex-Prime, the executive corporate legal and contract risk auditor for EzboAgents. You review contracts, highlight risky clauses (indemnity, termination, liability), and recommend plain-English redline adjustments.`
  },
  'silo-seo': {
    name: 'Silo-Core SEO Dominator',
    role: 'Topical Authority & Cluster Architect',
    systemPrompt: `You are Silo-Core, the programmatic SEO and topical cluster architect. You structure comprehensive 30,000-word topical cluster blueprints, internal linking schemas, and semantic search strategies.`
  },
  'quant-cfo': {
    name: 'Quant-AI CFO Advisor',
    role: 'Financial Analyst & Break-Even Modeler',
    systemPrompt: `You are Quant-AI, the virtual CFO and quantitative financial advisor for EzboAgents. You analyze P&L statements, calculate unit economics, forecast cashflows, and build executive financial models.`
  },
  code: {
    name: 'Code Architect',
    role: 'Senior Full-Stack Engineer & Bug Hunter',
    systemPrompt: `You are the Senior Full-Stack Engineering Architect for EzboAgents. You write production-grade code, debug errors, design system architectures, and provide clean technical solutions.`
  },
  copy: {
    name: 'Copy Architect',
    role: 'High-Converting Copywriter',
    systemPrompt: `You are the High-Converting Copywriter for EzboAgents. You write landing page heroes, persuasive sales letters, cold email sequences, and high-CTR WhatsApp broadcast messages.`
  }
};

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
          const tierLabel = user.planTier === 'byok'
            ? 'BYOK Multi-Engine'
            : user.planTier === 'managed'
            ? 'All-Inclusive Cloud'
            : user.planTier.toUpperCase();

          const welcomeMsg = `<b>🎉 অভিনন্দন ${escapeHtml(user.userName)}!</b>\n\nআপনার <b>EzboAgents</b> অ্যাকাউন্ট সফলভাবে টেলিগ্রামের সাথে সিঙ্ক হয়েছে!\n\n` +
            `💎 <b>সাবস্ক্রিপশন প্ল্যান:</b> ${escapeHtml(tierLabel)}\n` +
            `🟢 <b>স্ট্যাটাস:</b> ${user.isSubscribed ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}\n` +
            `🤖 <b>অ্যাক্টিভ এজেন্ট:</b> Ezbo Central Executive\n` +
            `⚡ <b>ইন্টেলিজেন্স ইঞ্জিন:</b> Ready 24/7\n\n` +
            `এখন থেকে আপনি যেকোনো সময় এই চ্যাটে মেসেজ পাঠিয়ে আপনার AI টিম দিয়ে কাজ করাতে পারবেন।\n\n` +
            `<b>প্রয়োজনীয় কমান্ডসমূহ:</b>\n` +
            `• <code>/status</code> - আপনার অ্যাকাউন্ট ও প্ল্যানের তথ্য\n` +
            `• <code>/agents</code> - সকল স্পেশালিস্ট এজেন্টের তালিকা ও সুইচ\n` +
            `• <code>/image [prompt]</code> - হাই-রেজোলিউশন AI ছবি তৈরি\n` +
            `• <code>/help</code> - সকল কমান্ডের সহায়িকা\n\n` +
            `<i>কীভাবে সাহায্য করতে পারি বলুন?</i>`;

          await sendTelegramMessage(botToken, chatId, welcomeMsg);
          return json({ ok: true });
        } else {
          const errMsg = `⚠️ <b>লিঙ্ক ব্যর্থ হয়েছে:</b>\n${escapeHtml(linkRes.error || 'ভুল বা মেয়াদোত্তীর্ণ সিঙ্ক কোড।')}\n\nদয়া করে আপনার ড্যাশবোর্ডের <b>Channels &gt; Telegram</b> ট্যাব থেকে ফ্রেশ কোড নিয়ে পুনরায় চেষ্টা করুন।`;
          await sendTelegramMessage(botToken, chatId, errMsg);
          return json({ ok: true });
        }
      }

      // /start without payload
      const existingUser = getLinkedUserByChatId(chatId);
      if (existingUser) {
        const msg = `👋 <b>ওয়েলকাম ব্যাক, ${escapeHtml(existingUser.userName)}!</b>\n\nআপনার EzboAgents অ্যাকাউন্ট সক্রিয়ভাবে সংযুক্ত আছে।\n\n` +
          `🤖 <b>বর্তমান এজেন্ট:</b> ${escapeHtml(existingUser.activeAgent)}\n\n` +
          `যেকোনো কাজের নির্দেশ লিখে পাঠান অথবা <code>/status</code> লিখে আপনার প্ল্যানের বিবরণ দেখুন।`;
        await sendTelegramMessage(botToken, chatId, msg);
        return json({ ok: true });
      }

      // Not linked yet
      const unlinkedMsg = `👋 <b>স্বাগতম EzboAgents Telegram Bot-এ!</b>\n\n` +
        `আপনার টেলিগ্রাম অ্যাকাউন্টটি এখনও EzboAgents-এর সাথে লিঙ্ক করা হয়নি।\n\n` +
        `<b>কীভাবে লিঙ্ক করবেন:</b>\n` +
        `১. আপনার EzboAgents ড্যাশবোর্ডে লগইন করুন: <a href="https://ezboagents.com/dashboard">ezboagents.com/dashboard</a>\n` +
        `২. <b>Channels</b> ট্যাবে যান এবং <b>Telegram</b> অপশনটিতে ক্লিক করুন।\n` +
        `৩. সেখানে পাওয়া ৬-সংখ্যার কোডটি এখানে মেসেজ হিসেবে পাঠিয়ে দিন (যেমন: <code>EZBO-8492</code>)।`;
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
        const msg = `<b>✅ অ্যাকাউন্ট সফলভাবে লিঙ্ক হয়েছে!</b>\n\nস্বাগতম, <b>${escapeHtml(user.userName)}</b>!\nআপনার ড্যাশবোর্ড এবং টেলিগ্রাম এখন ১০০% সিঙ্কড।\n\nযেকোনো প্রশ্ন বা কাজের নির্দেশ লিখে শুরু করতে পারেন।`;
        await sendTelegramMessage(botToken, chatId, msg);
        return json({ ok: true });
      } else {
        await sendTelegramMessage(botToken, chatId, `⚠️ ${escapeHtml(linkRes.error || 'অবৈধ কোড।')}`);
        return json({ ok: true });
      }
    }

    // Retrieve linked user for all subsequent actions
    const linkedUser = getLinkedUserByChatId(chatId);

    // -----------------------------------------------------------------
    // 3. COMMAND: /status
    // -----------------------------------------------------------------
    if (text === '/status') {
      if (!linkedUser) {
        await sendTelegramMessage(botToken, chatId, '⚠️ আপনার অ্যাকাউন্ট লিঙ্ক করা নেই। অনুগ্রহ করে ড্যাশবোর্ডের Channels ট্যাব থেকে Sync কোড পাঠান।');
        return json({ ok: true });
      }

      const tierLabel = linkedUser.planTier === 'byok'
        ? 'BYOK Multi-Engine (Personal API)'
        : linkedUser.planTier === 'managed'
        ? 'All-Inclusive Cloud (Managed AI)'
        : linkedUser.planTier.toUpperCase();

      const activeAgentObj = AGENT_PERSONAS[linkedUser.activeAgent] || AGENT_PERSONAS.general;

      const statusCard = `<b>📊 আপনার EzboAgents অ্যাকাউন্ট স্ট্যাটাস</b>\n\n` +
        `👤 <b>নাম:</b> ${escapeHtml(linkedUser.userName)}\n` +
        `📧 <b>ইমেইল:</b> ${escapeHtml(linkedUser.userEmail)}\n` +
        `💎 <b>প্ল্যান:</b> ${escapeHtml(tierLabel)}\n` +
        `🟢 <b>সাবস্ক্রিপশন:</b> ${linkedUser.isSubscribed ? 'সক্রিয় (Active)' : 'মেয়াদোত্তীর্ণ (Expired)'}\n` +
        `🤖 <b>বর্তমান স্পেশালিস্ট:</b> ${escapeHtml(activeAgentObj.name)} (<code>${linkedUser.activeAgent}</code>)\n` +
        `📦 <b>আনলক করা স্টোর বটস:</b> ${linkedUser.unlockedBots.length} টি\n` +
        `🔗 <b>সিঙ্ক সময়:</b> ${new Date(linkedUser.linkedAt).toLocaleDateString()}\n\n` +
        `<i>এজেন্ট পরিবর্তন করতে <code>/agents</code> ব্যবহার করুন।</i>`;

      await sendTelegramMessage(botToken, chatId, statusCard);
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 4. COMMAND: /agents & /agent [id]
    // -----------------------------------------------------------------
    if (text === '/agents') {
      const agentListMsg = `<b>🤖 উপলব্ধ AI স্পেশালিস্ট তালিকা:</b>\n\n` +
        `• <b>General Executive:</b> <code>/agent general</code>\n  <i>সেন্ট্রাল স্ট্র্যাটেজি ও অল-রাউন্ডার সহকারী</i>\n\n` +
        `• <b>Aegis-1 Closer:</b> <code>/agent aegis-closer</code>\n  <i>হাই-টিকেট সেলস ও অবজেকশন নেগোশিয়েটর</i>\n\n` +
        `• <b>NexusAds Engine:</b> <code>/agent nexus-ads</code>\n  <i>Meta/Google/TikTok অ্যাড কপি ও টার্গেটিং</i>\n\n` +
        `• <b>Kronos-90 Video:</b> <code>/agent kronos-video</code>\n  <i>ভাইরাল রিলস ও টিকটক স্ক্রিপ্ট রাইটার</i>\n\n` +
        `• <b>Lex Legal Auditor:</b> <code>/agent lex-auditor</code>\n  <i>কর্পোরেট চুক্তি ও লিগ্যাল রিস্ক অডিটর</i>\n\n` +
        `• <b>Silo-Core SEO:</b> <code>/agent silo-seo</code>\n  <i>টপিক্যাল ক্লাস্টার ও প্রোগ্রাম্যাটিক এসইও</i>\n\n` +
        `• <b>Quant CFO Advisor:</b> <code>/agent quant-cfo</code>\n  <i>আর্থিক অ্যানালিসিস ও প্রফিট মডেলিং</i>\n\n` +
        `• <b>Code Architect:</b> <code>/agent code</code>\n  <i>ফুল-স্ট্যাক সফটওয়্যার কোডিং ও বাগ ফিক্স</i>\n\n` +
        `• <b>Copy Architect:</b> <code>/agent copy</code>\n  <i>হাই-কনভার্টিং ল্যান্ডিং পেজ ও সেলস কপি</i>\n\n` +
        `👉 <b>সুইচ করতে লিখুন:</b> <code>/agent aegis-closer</code>`;

      await sendTelegramMessage(botToken, chatId, agentListMsg);
      return json({ ok: true });
    }

    if (text.startsWith('/agent')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await sendTelegramMessage(botToken, chatId, '⚠️ কোন এজেন্টে সুইচ করতে চান উল্লেখ করুন। যেমন: <code>/agent aegis-closer</code> বা <code>/agent code</code>');
        return json({ ok: true });
      }

      const requestedAgent = parts[1].toLowerCase().trim();
      const persona = AGENT_PERSONAS[requestedAgent];

      if (!persona) {
        await sendTelegramMessage(botToken, chatId, `⚠️ "${escapeHtml(requestedAgent)}" নামের কোনো এজেন্ট পাওয়া যায়নি। এজেন্টের নাম দেখতে <code>/agents</code> লিখুন।`);
        return json({ ok: true });
      }

      if (!linkedUser) {
        await sendTelegramMessage(botToken, chatId, '⚠️ অনুগ্রহ করে প্রথমে আপনার Ezbo ড্যাশবোর্ডের Channels ট্যাব থেকে অ্যাকাউন্ট লিঙ্ক করুন।');
        return json({ ok: true });
      }

      // Check if it's a store bot and if user has access
      const storeBots = ['aegis-closer', 'nexus-ads', 'kronos-video', 'lex-auditor', 'silo-seo', 'quant-cfo'];
      if (storeBots.includes(requestedAgent)) {
        const hasAccess = linkedUser.planTier === 'managed' || linkedUser.unlockedBots.includes(requestedAgent);
        if (!hasAccess) {
          const lockMsg = `🔒 <b>এজেন্টটি এখনও আনলক করা হয়নি!</b>\n\n<b>${escapeHtml(persona.name)}</b> হলো একটি প্রিমিয়াম স্পেশালিস্ট।\nআপনার ড্যাশবোর্ডের <b>Agents Store</b> থেকে এটি আনলক করতে পারবেন:\n<a href="https://ezboagents.com/dashboard">ezboagents.com/dashboard</a>`;
          await sendTelegramMessage(botToken, chatId, lockMsg);
          return json({ ok: true });
        }
      }

      updateUserAgent(chatId, requestedAgent);
      await sendTelegramMessage(
        botToken,
        chatId,
        `✅ <b>সফলভাবে সুইচ হয়েছে!</b>\n\nবর্তমান অ্যাক্টিভ এজেন্ট: <b>${escapeHtml(persona.name)}</b>\n<i>${escapeHtml(persona.role)}</i>\n\nএখন আপনি সরাসরি যেকোনো টাস্ক বা প্রশ্ন করতে পারেন।`
      );
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 5. COMMAND: /image [prompt]
    // -----------------------------------------------------------------
    if (text.startsWith('/image')) {
      const prompt = text.replace('/image', '').trim();
      if (!prompt) {
        await sendTelegramMessage(botToken, chatId, '⚠️ অনুগ্রহ করে প্রম্পট লিখুন। যেমন: <code>/image futuristic cyberpunk robot in office</code>');
        return json({ ok: true });
      }

      if (!linkedUser || !linkedUser.isSubscribed) {
        await sendTelegramMessage(botToken, chatId, '⚠️ ইমেজ জেনারেশনের জন্য আপনার EzboAgents সাবস্ক্রিপশন সক্রিয় থাকা প্রয়োজন। ezboagents.com/plans এ যান।');
        return json({ ok: true });
      }

      await sendTelegramChatAction(botToken, chatId, 'upload_photo');

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
      await sendTelegramPhoto(botToken, chatId, imageUrl, `🎨 <b>Prompt:</b> ${escapeHtml(prompt)}`);
      touchUserInteraction(chatId);
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 6. COMMAND: /help
    // -----------------------------------------------------------------
    if (text === '/help') {
      const helpMsg = `<b>💡 EzboAgents Telegram Assistant Guide</b>\n\n` +
        `<b>উপলব্ধ কমান্ডসমূহ:</b>\n` +
        `• <code>/status</code> - আপনার অ্যাকাউন্ট, প্ল্যান ও মেয়াদের তথ্য\n` +
        `• <code>/agents</code> - ৫০+ স্পেশালিস্ট এজেন্টের তালিকা দেখা\n` +
        `• <code>/agent [নাম]</code> - স্পেশালিস্ট পরিবর্তন (যেমন: <code>/agent code</code>)\n` +
        `• <code>/image [প্রম্পট]</code> - আল্ট্রা-এইচডি AI ইমেজ জেনারেশন\n` +
        `• <code>/help</code> - এই সহায়িকা বার্তাটি দেখা\n\n` +
        `<b>সাধারণ বার্তা:</b>\n` +
        `কোনো কমান্ড ছাড়া যেকোনো কাজের কথা বাংলায় বা ইংরেজিতে লিখুন, আপনার অ্যাক্টিভ এজেন্ট সাথে সাথে উত্তর তৈরি করে দিবে।`;
      await sendTelegramMessage(botToken, chatId, helpMsg);
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // 7. GENERAL CHAT / PROMPT WITH AI
    // -----------------------------------------------------------------
    if (!linkedUser) {
      await sendTelegramMessage(
        botToken,
        chatId,
        '⚠️ আপনার টেলিগ্রাম অ্যাকাউন্টটি এখনও EzboAgents-এ লিঙ্ক করা নেই!\nঅনুগ্রহ করে ড্যাশবোর্ডের <b>Channels &gt; Telegram</b> ট্যাব থেকে আপনার Sync কোডটি এখানে মেসেজ করুন।'
      );
      return json({ ok: true });
    }

    if (!linkedUser.isSubscribed) {
      await sendTelegramMessage(
        botToken,
        chatId,
        '⚠️ <b>সাবস্ক্রিপশন মেয়াদোত্তীর্ণ:</b> আপনার EzboAgents প্ল্যানটি বর্তমানে সক্রিয় নেই।\nড্যাশবোর্ড ও টেলিগ্রাম সার্ভিস চালু রাখতে <a href="https://ezboagents.com/plans">ezboagents.com/plans</a> থেকে প্ল্যান রিনিউ করুন।'
      );
      return json({ ok: true });
    }

    // Trigger typing indicator in Telegram
    await sendTelegramChatAction(botToken, chatId, 'typing');
    touchUserInteraction(chatId);

    const activePersona = AGENT_PERSONAS[linkedUser.activeAgent] || AGENT_PERSONAS.general;

    // Resolve API key
    let resolvedApiKey = config.geminiApiKey || process.env.PLATFORM_GEMINI_KEY || '';
    if (linkedUser.planTier === 'byok' && linkedUser.byokKey) {
      resolvedApiKey = linkedUser.byokKey;
    }

    // Fallback: If no key yet configured, use free Gemini API or notify
    if (!resolvedApiKey) {
      resolvedApiKey = config.openaiApiKey || '';
    }

    let aiReply = '';

    if (resolvedApiKey && (config.geminiApiKey || process.env.PLATFORM_GEMINI_KEY || (linkedUser.planTier === 'byok' && linkedUser.byokKey))) {
      // Call Google Gemini API
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${resolvedApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: text }] }],
              systemInstruction: { parts: [{ text: activePersona.systemPrompt }] },
              generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          aiReply = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          const errText = await geminiRes.text();
          console.error('Gemini API call failed in telegram webhook:', errText);
        }
      } catch (err: any) {
        console.error('Gemini fetch error in telegram webhook:', err);
      }
    } else if (config.openaiApiKey) {
      // Call OpenAI
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
              { role: 'system', content: activePersona.systemPrompt },
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
      aiReply = `👋 <b>${escapeHtml(activePersona.name)}:</b>\nআপনার বার্তাটি গৃহীত হয়েছে। সিস্টেমটি বর্তমানে প্রসেস করছে।\n(অ্যাডমিন প্যানেলে Gemini বা OpenAI API Key কনফিগার নিশ্চিত করুন)।`;
    }

    // Telegram allows max 4096 characters per message
    if (aiReply.length > 4000) {
      aiReply = aiReply.slice(0, 3950) + '\n\n<i>...(মেসেজ ট্রাঙ্কেট করা হয়েছে)</i>';
    }

    // Send AI reply back to Telegram
    await sendTelegramMessage(botToken, chatId, aiReply, { parse_mode: 'HTML' });
    return json({ ok: true });
  } catch (err: any) {
    console.error('Unhandled error in /api/telegram/webhook:', err);
    return json({ ok: true }); // Always return 200 so Telegram does not retry violently
  }
};
