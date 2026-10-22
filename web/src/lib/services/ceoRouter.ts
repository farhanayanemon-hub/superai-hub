import { TOOLS, AI_CEO_PROFILE, type ToolConfig, type AITool } from '$lib/config/tools';
import { getRegisteredAgents } from '$lib/config/agentRegistry';
import { DEFAULT_PLANS, type PlansSettings, type PlanConfig } from '$lib/config/plans';
import { TOOL_CONNECTORS } from '$lib/config/toolConnectors';

const KEYWORD_RULES: Array<{ helperId: string; keywords: string[] }> = [
  { helperId: 'fb_insta_ads', keywords: ['facebook ad', 'fb ad', 'instagram ad', 'ig ad', 'meta ad', ' ফেসবুক এড', 'বিজ্ঞাপন'] },
  { helperId: 'google_search_display_ads', keywords: ['google ad', 'ppc', 'search ad', 'display ad', 'adwords'] },
  { helperId: 'tiktok_reels_ad_scripts', keywords: ['tiktok ad', 'reels ad', 'ugc script', 'short video ad', 'টিকটক'] },
  { helperId: 'target_audience_persona', keywords: ['target audience', 'buyer persona', 'interest targeting', 'টার্গেট অডিয়েন্স'] },
  { helperId: 'marketing_campaign_planner', keywords: ['360 marketing', 'marketing plan', 'launch strategy', 'মার্কেটিং প্ল্যান'] },
  { helperId: 'competitor_ad_spy', keywords: ['competitor ad', 'ad spy', 'counter angle', 'কম্পিটিটর'] },
  { helperId: 'retargeting_ad_generator', keywords: ['retargeting', 'abandoned cart', 'warm audience'] },
  { helperId: 'promo_offer_bundle_architect', keywords: ['bundle offer', 'discount offer', 'flash sale', 'ঈদ অফার', 'ডিসকাউন্ট'] },
  { helperId: 'landing_page_copywriter', keywords: ['landing page', 'sales page', 'funnel copy', 'ল্যান্ডিং পেজ'] },
  { helperId: 'email_marketing_newsletter', keywords: ['email sequence', 'newsletter', 'drip campaign'] },
  { helperId: 'whatsapp_sms_blaster', keywords: ['whatsapp broadcast', 'sms campaign', 'bulk sms'] },
  { helperId: 'ad_creative_banner_brief', keywords: ['creative brief', 'designer brief', 'video editor brief'] },

  { helperId: 'unlimited_post_ideas', keywords: ['post idea', 'content idea', 'পোস্ট আইডিয়া'] },
  { helperId: 'social_content_calendar_30d', keywords: ['30 day calendar', 'content calendar', 'কন্টেন্ট ক্যালেন্ডার'] },
  { helperId: 'viral_hook_headline_generator', keywords: ['viral hook', 'scroll stopping', 'হুক'] },
  { helperId: 'fb_insta_caption_writer', keywords: ['caption', 'fb post', 'ig caption', 'ক্যাপশন'] },
  { helperId: 'linkedin_authority_writer', keywords: ['linkedin post', 'thought leadership'] },
  { helperId: 'carousel_slide_planner', keywords: ['carousel', 'slide post', 'ক্যারোসেল'] },
  { helperId: 'youtube_script_title_generator', keywords: ['youtube script', 'youtube title', 'ইউটিউব স্ক্রিপ্ট'] },
  { helperId: 'content_repurposer_1_to_10', keywords: ['repurpose', '1 to 10', 'atomize'] },
  { helperId: 'hashtag_social_keyword_researcher', keywords: ['hashtag', 'হ্যাশট্যাগ'] },
  { helperId: 'engagement_question_poll_creator', keywords: ['poll', 'quiz', 'engagement question'] },
  { helperId: 'trend_jacking_meme_ideator', keywords: ['meme idea', 'trend jack', 'ট্রেন্ড'] },

  { helperId: 'ai_text_humanizer', keywords: ['humanize', 'humanizer', 'bypass ai', 'natural text', 'হিউম্যানাইজ'] },
  { helperId: 'advanced_grammar_spell_checker', keywords: ['grammar', 'proofread', 'spell check', 'গ্রামার'] },
  { helperId: 'smart_paraphraser_rewriter', keywords: ['paraphrase', 'rewrite', 'rephrase', 'প্যারাফ্রেজ'] },
  { helperId: 'tone_changer_polisher', keywords: ['change tone', 'formal tone', 'friendly tone'] },
  { helperId: 'bangla_english_business_translator', keywords: ['translate', 'bangla to english', 'english to bangla', 'অনুবাদ'] },
  { helperId: 'long_text_document_summarizer', keywords: ['summarize', 'summary', 'tl;dr', 'সামারি'] },
  { helperId: 'storytelling_brand_narrative', keywords: ['brand story', 'about us', 'mission vision'] },
  { helperId: 'press_release_announcement', keywords: ['press release', 'media announcement'] },
  { helperId: 'cold_email_b2b_outreach', keywords: ['cold email', 'b2b email', 'outreach email'] },
  { helperId: 'speech_presentation_scriptwriter', keywords: ['speech', 'presentation script', 'pitch deck script'] },

  { helperId: 'ai_commercial_image_generator', keywords: ['/img', '/image', 'generate image', 'create image', 'commercial image', 'commercial photo', 'ai image', 'ছবি তৈরি'] },
  { helperId: 'ai_business_logo_generator', keywords: ['/logo', 'create logo', 'design logo', 'business logo', 'brand logo', 'logo', 'brand mark', 'লোগো'] },
  { helperId: 'product_photography_mockup', keywords: ['product photo', 'mockup', 'studio backdrop'] },
  { helperId: 'youtube_fb_thumbnail_designer', keywords: ['thumbnail', 'থাম্বনেইল'] },
  { helperId: 'social_poster_ad_banner', keywords: ['poster', 'banner design', 'পোস্টার', 'ব্যানার'] },
  { helperId: 'brand_color_typography_guide', keywords: ['color palette', 'font pair', 'brand identity'] },
  { helperId: 'midjourney_flux_prompt_engineer', keywords: ['midjourney prompt', 'flux prompt', 'image prompt'] },
  { helperId: 'packaging_label_design_ideator', keywords: ['packaging', 'box design', 'label design'] },

  { helperId: 'seo_keyword_research_finder', keywords: ['keyword research', 'low kd', 'search volume', 'কিওয়ার্ড'] },
  { helperId: 'seo_blog_article_writer', keywords: ['seo blog', 'article writer', 'blog post', 'ব্লগ আর্টিকেল'] },
  { helperId: 'onpage_seo_meta_generator', keywords: ['meta title', 'meta description', 'on-page seo'] },
  { helperId: 'ecommerce_product_description_seo', keywords: ['product description', 'shopify seo', 'daraz', 'প্রোডাক্ট ডেসক্রিপশন'] },
  { helperId: 'local_seo_gmb_optimizer', keywords: ['google my business', 'gmb', 'local seo'] },
  { helperId: 'faq_schema_markup_generator', keywords: ['faq schema', 'json-ld', 'people also ask'] },
  { helperId: 'backlink_outreach_guest_post', keywords: ['backlink', 'guest post', 'link building'] },
  { helperId: 'content_gap_topic_cluster', keywords: ['topic cluster', 'content gap', 'pillar page'] },
  { helperId: 'youtube_video_seo_optimizer', keywords: ['youtube seo', 'video tags', 'youtube description'] },

  { helperId: 'daily_habit_routine_architect', keywords: ['habit', 'routine', 'daily routine', 'morning routine', 'atomic habits', 'discipline', 'অভ্যাস', 'রুটিন'] },
  { helperId: 'deep_work_focus_protocol', keywords: ['deep work', 'focus', 'laser focus', 'flow state', 'pomodoro', 'distraction', 'dopamine detox', 'মনোযোগ', 'ফোকাস'] },
  { helperId: 'overcoming_procrastination_catalyst', keywords: ['procrastination', 'stop procrastinating', 'action catalyst', '5 second rule', 'get started', 'overcome lazy', 'আলসেমি', 'কাজ শুরু'] },
  { helperId: 'stoic_mindset_resilience_guide', keywords: ['stoic', 'stoicism', 'resilience', 'mental toughness', 'anxiety', 'burnout', 'mindset', 'মানসিক শক্তি', 'ধৈর্য'] },
  { helperId: 'quarterly_goal_sprint_planner', keywords: ['goal', '90 day goal', 'okr', 'quarterly sprint', 'milestone', 'goal planner', 'লক্ষ্য', 'প্ল্যান'] },
  { helperId: 'mental_models_decision_advisor', keywords: ['mental model', 'first principles', 'decision', 'decision making', 'charlie munger', 'সিদ্ধান্ত', 'লজিক'] },
  { helperId: 'rapid_skill_accelerated_learning', keywords: ['learn fast', 'rapid skill acquisition', 'feynman technique', 'study smarter', 'memory retention', 'দ্রুত শেখা', 'পড়াশোনা'] },
  { helperId: 'public_speaking_voice_coach', keywords: ['public speaking', 'speech coach', 'presentation skills', 'elevator pitch', 'stage fright', 'বক্তব্য', 'কথা বলা'] },
  { helperId: 'emotional_intelligence_boundary', keywords: ['emotional intelligence', 'eq', 'boundaries', 'say no', 'conflict resolution', 'difficult conversation', 'সম্পর্ক', 'ইমোশন'] },
  { helperId: 'peak_energy_bio_rhythm_protocol', keywords: ['energy', 'sleep', 'circadian rhythm', 'biohack', 'stamina', 'fatigue', 'exhaustion', 'ঘুম', 'এনার্জি'] },
  { helperId: 'wealth_mindset_budget_planner', keywords: ['budget', 'money mindset', 'wealth', 'personal finance', 'savings', '50 30 20', 'debt payoff', 'টাকা জমানো', 'বাজেট'] },
  { helperId: 'evening_gratitude_zen_reflection', keywords: ['journaling', 'gratitude', 'evening reflection', 'daily review', 'mindfulness', 'zen', 'জার্নাল', 'কৃতজ্ঞতা'] },

  { helperId: 'time_management_planner', keywords: ['time management', 'schedule', 'time block', 'রুটিন', 'টাইম ম্যানেজমেন্ট'] },
  { helperId: 'inbox_sales_objection_handler', keywords: ['price too high', 'objection', 'inbox sales', 'ইনবক্স সেলস'] },
  { helperId: 'angry_customer_retention', keywords: ['angry customer', 'refund request', 'complaint', 'অভিযোগ'] },
  { helperId: 'excel_sheets_formula_generator', keywords: ['excel formula', 'google sheets', 'vlookup', 'xlookup', 'এক্সেল'] },
  { helperId: 'profit_margin_pricing_calculator', keywords: ['profit margin', 'roas', 'break even', 'হিসাব', 'লাভ'] },
  { helperId: 'sop_creator', keywords: ['sop', 'standard operating procedure'] },
  { helperId: 'meeting_notes_action_converter', keywords: ['meeting notes', 'minutes', 'action items'] },
  { helperId: 'business_name_domain_generator', keywords: ['business name', 'brand name', 'domain idea', 'বিজনেস নাম'] },
  { helperId: 'invoice_payment_followup', keywords: ['overdue invoice', 'payment reminder', 'বকেয়া'] },
  { helperId: 'hr_job_circular_interview', keywords: ['job circular', 'interview questions', 'hiring', 'নিয়োগ'] },
  { helperId: 'business_idea_swot_validator', keywords: ['swot', 'validate idea', 'business idea', 'বিজনেস আইডিয়া'] },
  { helperId: 'website_code_bug_wordpress_helper', keywords: ['wordpress bug', 'shopify liquid', 'css fix', 'html fix', 'কোড বাগ'] },
  { helperId: 'weekly_productivity_goal_tracker', keywords: ['weekly review', 'okr', 'kpi', 'habit tracker'] },
  { helperId: 'omnichannel_customer_support', keywords: ['omnichannel support', 'omnichannel customer', 'omnichannel', 'customer support rep', 'auto reply customer', 'customer service bot', 'মাল্টি চ্যানেল সাপোর্ট', 'কাস্টমার সাপোর্ট'] },
  { helperId: 'whatsapp_business_support', keywords: ['whatsapp business', 'whatsapp order', 'whatsapp customer', 'whatsapp concierge', 'whatsapp bot', 'হোয়াটসঅ্যাপ অর্ডার', 'হোয়াটসঅ্যাপ সাপোর্ট'] },
  { helperId: 'messenger_customer_support', keywords: ['messenger support', 'facebook page messenger', 'page inbox', 'messenger customer', 'messenger bot', 'ফেসবুক পেজ মেসেজ', 'মেসেঞ্জার সাপোর্ট'] },
  { helperId: 'instagram_dm_support', keywords: ['instagram dm', 'insta dm', 'story reply', 'instagram sales', 'dm sales closer', 'ইন্সটাগ্রাম ডিএম'] },
  { helperId: 'telegram_customer_support', keywords: ['telegram support', 'telegram helpdesk', 'telegram community bot', 'telegram customer', 'টেলিগ্রাম সাপোর্ট', 'হেল্পডেস্ক'] }
];

export const GREETING_PATTERNS: RegExp[] = [
  /^(h+i+|h+e+y+|h+e+l+l+o+|h+e+y+a+|y+o+|h+o+l+a+|h+o+w+d+y+|s+u+p+|greetings)(?:\s+(?:ezbo|ceo|there|bro|brother|friend|sir|vai|bhai|boss|mate|team|all|everyone))?$/i,
  /^(good\s+(?:morning|afternoon|evening|day|night))(?:\s+(?:ezbo|ceo|there|bro|sir|vai|bhai))?$/i,
  /^(how\s+are\s+you|how're\s+you|how\s+do\s+you\s+do|how\s+is\s+it\s+going|what's\s+up|whats\s+up|who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|can\s+you\s+help\s+me|help\s+me(?:\s+please)?|help(?:\s+please)?|start)(?:\s+(?:ezbo|ceo|today|bro|sir|vai|bhai))?$/i,
  /^(হাই|হ্যালো|হে|সালাম|আসসালামু\s*আলাইকুম|কেমন\s*(?:আছেন|আছো)|কি\s*খবর|কী\s*খবর|কি\s*অবস্থা|কে\s*তুমি|তুমি\s*কে|তোমার\s*নাম\s*কি|শুভ\s*(?:সকাল|সন্ধ্যা|রাত্রি)|ধন্যবাদ|ঠিক\s*আছে|আচ্ছা|বাই|খোদা\s*হাফেজ|আল্লাহ\s*হাফেজ)(?:\s+(?:এজবো|সিইও|ভাই|স্যার|বন্ধু|বস))?$/i,
  /^(salam|assalamu\s*alaikum|asalamu\s*alaikum|slm|ki\s*khobor|kemon\s*(?:acho|achen)|ki\s*obostha|ke\s*tumi|tumi\s*k|apni\s*k|nam\s*ki|shuvo\s*(?:shokal|sondha|ratri)|valo\s*achi|bhalo\s*achi|dhonnobad|shukriya|thanks|thank\s*you|thx|welcome|ok|okay|thik\s*ache|accha|bye|goodbye|bye\s*bye|allah\s*hafez|tata)(?:\s+(?:ezbo|ceo|vai|bhai|bro|sir|boss|dost))?$/i,
  /^(?:hi+|hello+|hey+|salam|assalamu\s*alaikum)[,\s!]+(?:how\s+are\s+you|how're\s+you|kemon\s*(?:acho|achen)|ki\s*khobor|who\s+are\s+you|what\s+can\s+you\s+do)[,\s!?.]*$/i
];

export function isConversationalGreeting(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const clean = message.trim().replace(/^[\s!.,?।~*-]+|[\s!.,?।~*-]+$/g, '');
  if (!clean) return false;
  if (clean.length <= 1) return true;
  return GREETING_PATTERNS.some((pattern) => pattern.test(clean));
}

export const EXPLICIT_EXECUTION_COMMANDS: RegExp[] = [
  /^\/(boost|teamwork-preview|run|execute|deploy|start)\b/i,
  /\b(run|execute|deploy|start|proceed\s+with)\s+(agent|helper)?\s*#?(\w+)\b/i,
  /\b(run|execute|deploy|start|proceed\s+with)\s+(this|the)\s+(agent|helper)\b/i,
  /\b(yes\s+proceed|yes\s+run|yes\s+deploy|proceed\s+now|deploy\s+now|run\s+now|proceed|deploy|execute)\b/i,
  /(শুরু\s*করো|কাজে\s*লাগাঁও|চালাও|এজেন্ট\s*দিয়ে\s*করাও|হ্যাঁ\s*শুরু\s*করো|হ্যাঁ\s*চালাও)/i,
  /(kaj\s*shuru\s*koro|kaj\s*koro|chalu\s*koro|run\s*koro|deploy\s*koro|proceed\s*koro|boost\s*koro)/i
];

export function isExplicitExecutionIntent(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const trimmed = message.trim();
  if (!trimmed) return false;
  return EXPLICIT_EXECUTION_COMMANDS.some((pattern) => pattern.test(trimmed));
}

export function textMatchesKeyword(text: string, keyword: string): boolean {
  const cleanKw = keyword.trim().toLowerCase();
  if (!cleanKw) return false;
  if (/^[a-z0-9\s_-]+$/i.test(cleanKw)) {
    const escaped = cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(text);
  }
  return text.toLowerCase().includes(cleanKw);
}

/**
 * Intelligently recommends the best-suited AI Helper for a given user query or task.
 * Returns null if the message is a casual greeting or empty.
 */
export function recommendHelperForMessage(query: string): ToolConfig | null {
  const clean = (query || '').trim();
  if (!clean) return null;
  if (isConversationalGreeting(clean)) return null;

  // Check registered bespoke agents
  const registered = getRegisteredAgents();
  for (const agent of registered) {
    if (textMatchesKeyword(clean, agent.name) || (agent.nameEn && textMatchesKeyword(clean, agent.nameEn))) {
      return agent as unknown as ToolConfig;
    }
    if (agent.keywords) {
      for (const kw of agent.keywords) {
        if (textMatchesKeyword(clean, kw)) {
          return agent as unknown as ToolConfig;
        }
      }
    }
  }

  // Check mention chips [⚡ Agent Name]
  const mentionChipMatch = clean.match(/\[⚡?\s*([^\]]+)\]/i);
  if (mentionChipMatch) {
    const target = mentionChipMatch[1].trim().toLowerCase();
    const byTarget = registered.find(
      (a) =>
        a.id.toLowerCase() === target ||
        a.name.toLowerCase() === target ||
        (a.nameEn && a.nameEn.toLowerCase() === target)
    );
    if (byTarget) return byTarget as unknown as ToolConfig;
  }

  // Check keyword rules with word boundaries
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (textMatchesKeyword(clean, kw)) {
        const found = TOOLS.find((t) => t.id === rule.helperId);
        if (found) return found;
      }
    }
  }

  // Fallback name match
  const lower = clean.toLowerCase();
  for (const tool of TOOLS) {
    if (lower.includes(tool.name.toLowerCase())) {
      return tool;
    }
  }

  return null;
}

export function matchHelperForMessage(
  query: string,
  explicitHelperId?: string,
  history?: Array<{ role: string; content: string }>
): ToolConfig | null {
  if (explicitHelperId && explicitHelperId !== 'ceo') {
    const registered = getRegisteredAgents();
    const foundAgent = registered.find(
      (a) =>
        a.id.toLowerCase() === explicitHelperId.toLowerCase() ||
        a.name.toLowerCase() === explicitHelperId.toLowerCase()
    );
    if (foundAgent) return foundAgent as unknown as ToolConfig;

    const exact = TOOLS.find(
      (t) =>
        t.id.toLowerCase() === explicitHelperId.toLowerCase() ||
        (t.code &&
          (t.code.toLowerCase() === explicitHelperId.toLowerCase() ||
            t.code.replace('#', '') === explicitHelperId.replace('#', '')))
    );
    if (exact) return exact;

    // Check if explicitHelperId references a mention chip [⚡ Agent Name]
    const explicitChipMatch = explicitHelperId.match(/\[⚡?\s*([^\]]+)\]/i);
    if (explicitChipMatch) {
      const target = explicitChipMatch[1].trim().toLowerCase();
      const byTarget = registered.find(
        (a) =>
          a.id.toLowerCase() === target ||
          a.name.toLowerCase() === target ||
          (a.nameEn && a.nameEn.toLowerCase() === target)
      );
      if (byTarget) return byTarget as unknown as ToolConfig;
    }
  }

  const clean = (query || '').trim();
  if (!clean) return null;

  // STRICT: Greetings never trigger auto-delegation!
  if (isConversationalGreeting(clean)) {
    return null;
  }

  // Check registered bespoke agents first
  const registered = getRegisteredAgents();
  for (const agent of registered) {
    if (textMatchesKeyword(clean, agent.name) || (agent.nameEn && textMatchesKeyword(clean, agent.nameEn))) {
      return agent as unknown as ToolConfig;
    }
    if (agent.keywords) {
      for (const kw of agent.keywords) {
        if (textMatchesKeyword(clean, kw)) {
          return agent as unknown as ToolConfig;
        }
      }
    }
  }

  // Check if message references slash command or explicit execution command for an agent
  const cmdMatch = clean.match(
    /(?:\/boost|\/teamwork-preview|\/run|\/deploy|\/start|run|deploy|start|proceed\s+with)\s+(?:agent\s+|helper\s+)?([a-zA-Z0-9_\-\s]+)\b/i
  );
  if (cmdMatch) {
    const target = cmdMatch[1].trim().toLowerCase();
    const byTarget = registered.find(
      (a) =>
        a.id.toLowerCase() === target ||
        a.name.toLowerCase() === target ||
        (a.nameEn && a.nameEn.toLowerCase() === target)
    );
    if (byTarget) return byTarget as unknown as ToolConfig;
  }

  // Visual image / logo commands always explicitly trigger
  if (isVisualGenerationHelper(null, clean)) {
    const isLogo = clean.toLowerCase().includes('logo') || clean.toLowerCase().startsWith('/logo');
    const targetId = isLogo ? 'ai_business_logo_generator' : 'ai_commercial_image_generator';
    const visualTool = registered.find((a) => a.id === targetId) || TOOLS.find((t) => t.id === targetId);
    if (visualTool) return visualTool as unknown as ToolConfig;
  }

  // Autonomous direct execution: keyword and tool name matching without intermediate confirmation cards
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (textMatchesKeyword(clean, kw)) {
        const found = TOOLS.find((t) => t.id === rule.helperId);
        if (found) return found;
      }
    }
  }

  const lower = clean.toLowerCase();
  for (const tool of TOOLS) {
    if (lower.includes(tool.name.toLowerCase())) {
      return tool;
    }
  }

  // Historical context resolution: if user says "proceed", "/boost", "start", "shuru koro", etc.
  // without repeating the helper name, find the helper from prior turns in the chat history.
  if (isExplicitExecutionIntent(clean) && history && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const turn = history[i];
      if (turn && turn.content) {
        if (turn.role === 'user') {
          const recFromPrev = recommendHelperForMessage(turn.content);
          if (recFromPrev) return recFromPrev;
        }
      }
    }
  }

  return null;
}

/**
 * Detects multiple agents mentioned or required in sequence for a multi-specialist pipeline.
 * Extracts explicit mention chips, agent names, or distinct keyword triggers.
 */
export function matchMultiHelpersForMessage(
  query: string,
  history?: Array<{ role: string; content: string }>
): ToolConfig[] {
  const clean = (query || '').trim();
  if (!clean || isConversationalGreeting(clean)) return [];

  const matchedTools: ToolConfig[] = [];
  const seenIds = new Set<string>();

  const isTeamworkCmd = /^\/teamwork-preview\b/i.test(clean) || clean.toLowerCase().includes('teamwork preview');

  // 1. Match registered bespoke agents mentioned in query or mention chips
  const registered = getRegisteredAgents();
  for (const agent of registered) {
    if (
      textMatchesKeyword(clean, agent.name) ||
      (agent.nameEn && textMatchesKeyword(clean, agent.nameEn)) ||
      (agent.keywords && agent.keywords.some((kw) => textMatchesKeyword(clean, kw)))
    ) {
      if (!seenIds.has(agent.id)) {
        matchedTools.push(agent as unknown as ToolConfig);
        seenIds.add(agent.id);
      }
    }
  }

  // If teamwork-preview was invoked without specific chips, check history for the primary helper
  if (isTeamworkCmd && matchedTools.length === 0 && history && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const turn = history[i];
      if (turn && turn.content) {
        if (turn.role === 'user') {
          const recFromPrev = recommendHelperForMessage(turn.content);
          if (recFromPrev && !seenIds.has(recFromPrev.id)) {
            matchedTools.push(recFromPrev);
            seenIds.add(recFromPrev.id);
            break;
          }
        }
      }
    }
  }

  // For teamwork-preview, auto-complement with related category team specialists if fewer than 3
  if (isTeamworkCmd && matchedTools.length > 0 && matchedTools.length < 3) {
    const primary = matchedTools[0];
    const categoryPeers = registered.filter((t) => t.category === primary.category && t.id !== primary.id);
    for (const peer of categoryPeers) {
      if (!seenIds.has(peer.id)) {
        matchedTools.push(peer as unknown as ToolConfig);
        seenIds.add(peer.id);
        if (matchedTools.length >= 3) break;
      }
    }
    return matchedTools;
  }

  // 2. If chaining conjunctions exist and explicit execution is indicated
  const lower = clean.toLowerCase();
  const hasChainIntent =
    lower.includes('prothome') ||
    lower.includes('tarpor') ||
    lower.includes('then') ||
    lower.includes('first') ||
    lower.includes('after that') ||
    lower.includes('এবং') ||
    lower.includes('পরপর') ||
    lower.includes('step by step') ||
    lower.includes('pipeline');

  if ((hasChainIntent || matchedTools.length > 0) && isExplicitExecutionIntent(clean)) {
    for (const rule of KEYWORD_RULES) {
      if (seenIds.has(rule.helperId)) continue;
      for (const kw of rule.keywords) {
        if (textMatchesKeyword(clean, kw)) {
          const found = TOOLS.find((t) => t.id === rule.helperId);
          if (found && !seenIds.has(found.id)) {
            matchedTools.push(found);
            seenIds.add(found.id);
            break;
          }
        }
      }
      if (matchedTools.length >= 3) break;
    }
  }

  return matchedTools;
}

export function isVisualGenerationHelper(
  helper: ToolConfig | string | null | undefined,
  query?: string
): boolean {
  const helperId = typeof helper === 'string' ? helper : helper?.id;
  if (
    helperId === 'ai_commercial_image_generator' ||
    helperId === 'ai_commercial_image_gen' ||
    helperId === 'ai_business_logo_generator' ||
    helperId === 'ai_business_logo_gen'
  ) {
    return true;
  }
  const lower = (query || (typeof helper === 'string' && !query ? helper : '')).toLowerCase().trim();
  return (
    lower.startsWith('/img ') ||
    lower.startsWith('/img') ||
    lower.startsWith('/image ') ||
    lower.startsWith('/image') ||
    lower.startsWith('generate image:') ||
    lower.startsWith('generate image') ||
    lower.startsWith('create logo:') ||
    lower.startsWith('create logo') ||
    lower.startsWith('/logo ') ||
    lower.startsWith('/logo')
  );
}

export interface VisualGenerationParams {
  prompt: string;
  width: number;
  height: number;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  seed: number;
  model: string;
  imageUrl: string;
  caption: string;
}

export const VISUAL_ASPECT_RATIO_DIMS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '4:3': { width: 1024, height: 768 }
};

export function buildVisualGenerationParams(
  prompt: string,
  options?: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | string;
    seed?: number;
    model?: string;
    helperId?: string;
  }
): VisualGenerationParams {
  const cleanPrompt = (prompt || '')
    .replace(/^\/img\s+/i, '')
    .replace(/^\/image\s+/i, '')
    .replace(/^\/logo\s+/i, '')
    .replace(/^generate image:\s*/i, '')
    .replace(/^create logo:\s*/i, '')
    .trim();

  let ratioKey: '1:1' | '16:9' | '9:16' | '4:3' = '1:1';
  if (options?.aspectRatio) {
    const rawRatio = options.aspectRatio.trim();
    if (rawRatio.includes('16:9') || rawRatio.includes('16/9') || rawRatio.toLowerCase().includes('banner') || rawRatio.toLowerCase().includes('widescreen')) {
      ratioKey = '16:9';
    } else if (rawRatio.includes('9:16') || rawRatio.includes('9/16') || rawRatio.toLowerCase().includes('reel') || rawRatio.toLowerCase().includes('story') || rawRatio.toLowerCase().includes('vertical')) {
      ratioKey = '9:16';
    } else if (rawRatio.includes('4:3') || rawRatio.includes('4/3')) {
      ratioKey = '4:3';
    } else if (rawRatio.includes('1:1') || rawRatio.includes('1/1') || rawRatio.toLowerCase().includes('square')) {
      ratioKey = '1:1';
    }
  }

  const { width, height } = VISUAL_ASPECT_RATIO_DIMS[ratioKey] || VISUAL_ASPECT_RATIO_DIMS['1:1'];
  const seed = typeof options?.seed === 'number' && !isNaN(options.seed) && options.seed >= 0
    ? Math.floor(options.seed)
    : Math.floor(Math.random() * 999999);
  const model = options?.model && typeof options.model === 'string' && options.model.trim()
    ? options.model.trim()
    : 'flux';

  const isLogo =
    options?.helperId === 'ai_business_logo_generator' ||
    options?.helperId === 'ai_business_logo_gen' ||
    cleanPrompt.toLowerCase().includes('logo');

  let qualityTags = 'ultra detailed commercial quality, 8k resolution, professional lighting';
  if (isLogo) {
    qualityTags = 'vector logo brand identity, clean lines, professional branding, high resolution';
  }

  const encodedPrompt = encodeURIComponent(`${cleanPrompt}, ${qualityTags}`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=${encodeURIComponent(model)}`;

  let captionHeader = '✨ **EzboAgents AI Visual Engine**\n\nYour commercial visual render is ready. Preview or download below:';
  if (isLogo) {
    captionHeader = '⚡ **AI CEO → Delegated to AI Business Logo Generator**\n\nYour commercial brand logo render is ready. Preview or download below:';
  } else if (
    options?.helperId === 'ai_commercial_image_generator' ||
    options?.helperId === 'ai_commercial_image_gen'
  ) {
    captionHeader = '⚡ **AI CEO → Delegated to AI Commercial Image Generator**\n\nYour commercial visual render is ready. Preview or download below:';
  }

  const caption = `${captionHeader}\n\n**Prompt:** ${cleanPrompt}\n**Aspect Ratio:** ${ratioKey} (${width}x${height})`;

  return {
    prompt: cleanPrompt,
    width,
    height,
    aspectRatio: ratioKey,
    seed,
    model,
    imageUrl,
    caption
  };
}

export type DetectedLanguage = 'bengali' | 'banglish' | 'english' | 'arabic' | 'hindi' | 'other';

const BANGLISH_WORDS = new Set([
  'kemon', 'acho', 'asen', 'achen', 'amr', 'amar', 'apnr', 'apnar', 'tomar', 'tmr',
  'tumi', 'apni', 'tui', 'koro', 'korben', 'korbe', 'kori', 'korte', 'kortam',
  'bolbe', 'bolte', 'bolo', 'bolen', 'boli', 'likhe', 'likho', 'likhen', 'daw',
  'dao', 'diben', 'den', 'dite', 'hobe', 'hoise', 'hoyeche', 'lagbe',
  'khobor', 'obostha', 'shate', 'shathe', 'sathe', 'valo', 'bhalo', 'bujhte',
  'parchi', 'parbo', 'dorkar', 'jonno', 'kintu', 'tobe', 'kivabe', 'konta',
  'kunta', 'shuru', 'chalu', 'ekta', 'akta', 'kichu', 'dekhao', 'dekhan',
  'eta', 'ota', 'tarpor', 'prothome', 'shesh', 'sesh', 'vai', 'bhai', 'apnader',
  'amader', 'shob', 'sob', 'kortechi', 'korechi', 'korbo', 'thik', 'accha',
  'acha', 'keno', 'kno', 'kobe', 'kothay', 'koi', 'ki', 'kee', 'pore',
  'parben', 'banaw', 'banao', 'banate', 'banabo', 'dorkari', 'bujhi', 'bujina',
  'jani', 'janen', 'shunte', 'parchen', 'ashole', 'shotti', 'dhonnobad', 'apnake',
  'tomake', 'kaje', 'kaj'
]);

const BANGLISH_PHRASE_PATTERNS: RegExp[] = [
  /\b(?:kemon\s+(?:acho|achen)|ki\s+(?:khobor|obostha|korcho)|valo\s+achi|bhalo\s+achi)\b/i,
  /\b(?:likhe\s+(?:daw|dao|diben)|kore\s+(?:daw|dao|diben)|banie\s+(?:daw|dao|diben)|baniye\s+(?:daw|dao|diben))\b/i,
  /\b(?:amr|amar)\s+(?:business|shathe|sathe|jonno|page|kaje)\b/i,
  /\b(?:kaj|kaaj)\s+(?:shuru|chalu)\s+koro\b/i,
  /\b(?:kivabe|konta)\s+(?:korbo|hobe)\b/i
];

export function detectUserLanguage(message: string): DetectedLanguage {
  if (!message || typeof message !== 'string') return 'english';
  const clean = message.trim();
  if (!clean) return 'english';

  // 1. Bengali script detection (Unicode range \u0980-\u09FF)
  if (/[\u0980-\u09FF]/.test(clean)) {
    return 'bengali';
  }

  // 2. Arabic script detection (\u0600-\u06FF)
  if (/[\u0600-\u06FF]/.test(clean)) {
    return 'arabic';
  }

  // 3. Devanagari / Hindi script detection (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(clean)) {
    return 'hindi';
  }

  // 4. Banglish detection (Bengali written using Latin alphabet)
  const lower = clean.toLowerCase();
  if (BANGLISH_PHRASE_PATTERNS.some((re) => re.test(lower))) {
    return 'banglish';
  }

  const tokens = lower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  let matchCount = 0;
  for (const t of tokens) {
    if (BANGLISH_WORDS.has(t)) {
      matchCount++;
    }
  }

  if (matchCount >= 2 || (tokens.length <= 4 && matchCount >= 1)) {
    return 'banglish';
  }

  return 'english';
}

export interface PlanCapabilityContext {
  tierId: 'byok_starter' | 'byok_pro' | 'managed' | 'free';
  planName: string;
  badge: string;
  isFree: boolean;
  unlockedHelpersCount: number;
  totalHelpersCount: number;
  unlockedHelpers: Array<{ id: string; code: string; name: string; category: string }>;
  lockedHelpers: Array<{ id: string; code: string; name: string }>;
  allHelpersUnlocked: boolean;
  unlockedToolsCount: number;
  totalToolsCount: number;
  unlockedTools: Array<{ id: string; name: string; category: string }>;
  lockedTools: Array<{ id: string; name: string }>;
  allToolsUnlocked: boolean;
  features: {
    workflowCustomization: boolean;
    multiKeyVault: boolean;
    multiModelFailover: boolean;
    commercialImages: boolean;
    customPrompts: boolean;
    prioritySupport: boolean;
    zeroKeyManagedCloud: boolean;
  };
  pricing: {
    monthlyPrice: number;
    yearlyMonthlyPrice: number;
  };
}

export function extractPlanCapabilities(
  adminConfig: any,
  rawTier?: string | null
): PlanCapabilityContext {
  const cleanTier = String(rawTier || 'byok_starter').trim().toLowerCase();
  const isFree = cleanTier === 'free';

  let effectivePlanTier: 'byok_starter' | 'byok_pro' | 'managed' = 'byok_starter';
  if (cleanTier === 'managed' || cleanTier === 'complete') {
    effectivePlanTier = 'managed';
  } else if (cleanTier === 'byok_pro' || cleanTier === 'pro' || cleanTier === 'ultra' || cleanTier === 'byok') {
    effectivePlanTier = 'byok_pro';
  } else {
    effectivePlanTier = 'byok_starter';
  }

  const plans: PlansSettings = adminConfig?.plans || DEFAULT_PLANS;
  const currentPlan: PlanConfig =
    plans[effectivePlanTier] ||
    plans.byok_starter ||
    DEFAULT_PLANS[effectivePlanTier] ||
    DEFAULT_PLANS.byok_starter;

  const toggles = currentPlan.featureToggles || DEFAULT_PLANS.byok_starter.featureToggles;

  const masterEnabledConnectors: string[] =
    Array.isArray(adminConfig?.enabledToolConnectors) && adminConfig.enabledToolConnectors.length > 0
      ? adminConfig.enabledToolConnectors
      : TOOL_CONNECTORS.map((t) => t.id);

  const platformTools = TOOL_CONNECTORS.filter((t) => masterEnabledConnectors.includes(t.id));

  const registered = getRegisteredAgents();
  const allHelpersList: any[] = registered.length > 0 ? registered : TOOLS;
  const allHelpersUnlocked = !isFree && toggles.allHelpersEnabled !== false;
  const unlockedHelpers = allHelpersList.filter((h: any) => {
    if (isFree) return false;
    if (toggles.allHelpersEnabled !== false) return true;
    return Array.isArray(toggles.enabledHelpers) && toggles.enabledHelpers.includes(h.id);
  });
  const lockedHelpers = allHelpersList.filter((h: any) => !unlockedHelpers.some((u: any) => u.id === h.id));

  const allToolsUnlocked = !isFree && toggles.allToolsEnabled !== false;
  const unlockedTools = platformTools.filter((t) => {
    if (isFree) return false;
    if (toggles.allToolsEnabled !== false) return true;
    return Array.isArray(toggles.enabledTools) && toggles.enabledTools.includes(t.id);
  });
  const lockedTools = platformTools.filter((t) => !unlockedTools.some((u) => u.id === t.id));

  const planName = isFree ? 'Free Trial / Unsubscribed' : currentPlan.name;
  const badge = isFree ? 'Free Access' : currentPlan.badge;

  const workflowCustomization =
    !isFree &&
    effectivePlanTier !== 'byok_starter' &&
    adminConfig?.workflowCustomizationUserEnabled !== false;

  return {
    tierId: isFree ? 'free' : effectivePlanTier,
    planName,
    badge,
    isFree,
    unlockedHelpersCount: unlockedHelpers.length,
    totalHelpersCount: allHelpersList.length,
    unlockedHelpers: unlockedHelpers.map((h: any) => ({
      id: h.id,
      code: h.code || '',
      name: h.name,
      category: h.categoryName || h.category || 'General'
    })),
    lockedHelpers: lockedHelpers.map((h: any) => ({ id: h.id, code: h.code || '', name: h.name })),
    allHelpersUnlocked,
    unlockedToolsCount: unlockedTools.length,
    totalToolsCount: platformTools.length,
    unlockedTools: unlockedTools.map((t) => ({ id: t.id, name: t.name, category: t.category })),
    lockedTools: lockedTools.map((t) => ({ id: t.id, name: t.name })),
    allToolsUnlocked,
    features: {
      workflowCustomization,
      multiKeyVault: !isFree && !!toggles.multiKeyVault,
      multiModelFailover: !isFree && !!toggles.multiModelFailover,
      commercialImages: !isFree && !!toggles.commercialImages,
      customPrompts: !isFree && !!toggles.customPrompts,
      prioritySupport: !isFree && !!toggles.prioritySupport,
      zeroKeyManagedCloud: !isFree && effectivePlanTier === 'managed'
    },
    pricing: {
      monthlyPrice: isFree ? 0 : currentPlan.monthlyPrice,
      yearlyMonthlyPrice: isFree ? 0 : currentPlan.yearlyMonthlyPrice
    }
  };
}

export function buildPlanCapabilityDirective(caps: PlanCapabilityContext): string {
  const helpersSummary = caps.allHelpersUnlocked
    ? (caps.totalHelpersCount > 0
        ? `All ${caps.totalHelpersCount} AI Agents are unlocked and authorized for execution.`
        : `All bespoke AI agents and workflows are unlocked and authorized for execution.`)
    : `Access is granted to ${caps.unlockedHelpersCount} of ${caps.totalHelpersCount} AI Agents. Unlocked (${caps.unlockedHelpersCount}): [${caps.unlockedHelpers.map((h) => `${h.code ? h.code + ' ' : ''}${h.name}`).join(', ') || 'None'}]. Locked (${caps.lockedHelpers.length}): [${caps.lockedHelpers.map((h) => `${h.code ? h.code + ' ' : ''}${h.name}`).join(', ') || 'None'}].`;

  const toolsSummary = caps.allToolsUnlocked
    ? `Full access to all 100+ Enterprise Tool Connectors across 10 categories (Google Workspace, WhatsApp, Telegram, E-Commerce, CRMs, Social Media, Marketing & Ads, Microsoft 365, Storage & Media, Productivity).`
    : `Access is granted to ${caps.unlockedToolsCount} of ${caps.totalToolsCount} tool connectors. Unlocked (${caps.unlockedToolsCount}): [${caps.unlockedTools.map((t) => t.name).join(', ') || 'None'}]. Locked (${caps.lockedTools.length}): [${caps.lockedTools.map((t) => t.name).join(', ') || 'None'}].`;

  return `================================================================================
⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)
================================================================================
USER ACTIVE PLAN: ${caps.planName} (Tier: ${caps.tierId.toUpperCase()}) | Badge: ${caps.badge}
PRICING: BDT ${caps.pricing.monthlyPrice}/mo (BDT ${caps.pricing.yearlyMonthlyPrice}/mo yearly)

1. ACTIVE PLAN ASSET ENTITLEMENTS:
• AI Helpers: ${helpersSummary}
• Tool Connectors: ${toolsSummary}
• Visual Workflow Studio & Custom Node Editing: ${caps.features.workflowCustomization ? 'UNLOCKED (Executive Authority Active)' : 'LOCKED (Starter / Free Tier restriction)'}
• Multi-Key Vault & Failover Rotation: ${caps.features.multiKeyVault ? 'UNLOCKED' : 'LOCKED (Pro Plan feature)'}
• AI Cluster Execution Mode: ${caps.features.zeroKeyManagedCloud ? 'PLATFORM MANAGED CLUSTER (Zero API Keys required, 5,000 fast-lane requests)' : 'BYOK (Bring Your Own Key via Google Gemini, OpenAI, etc.)'}

2. MANDATORY INTERACTION DIRECTIVES:
• PLAN TOOL & AGENT INQUIRIES: When the user asks which tools, helpers, or integrations are in their plan (e.g. "which tools are in my plan?", "আমার প্ল্যানে কি কি টুল আছে?", "amr plan e ki ki agent ache?"):
  - List their accessible tools/agents accurately based on the ACTIVE PLAN ASSET ENTITLEMENTS above.
  - Deliver your reply exclusively in the user's matching language (Bengali, Banglish, or English).
• LOCKED HELPER OR TOOL COMMANDS: If the user commands you to run or deploy a helper or tool that is locked on their current plan:
  - Do NOT fake or pretend to execute it.
  - Politely and professionally explain that this helper/tool is restricted on their current plan (${caps.planName}).
  - Clearly guide them on how to upgrade: navigate to "Subscription Plans" in the sidebar or click "Upgrade Plan" to unlock Pro / Cloud Managed.
  - State this explanation naturally in the user's matching language (Bengali, Banglish, or English).
• PLAN DIFFERENCES & COMPARISON KNOWLEDGE: You possess authoritative knowledge of all Ezbo subscription tiers:
  - Starter Plan (BDT 499/mo | BDT 399/mo yearly): Curated agent workflows, 100+ tool connectors, Single-Key BYOK (Free Gemini key supported with 1,500 free calls/day), run-only execution, standard support. Cannot visually edit workflow nodes or build custom agents.
  - Pro Plan (BDT 899/mo | BDT 719/mo yearly): Everything in Starter, PLUS Visual Workflow Studio with node graph canvas & curved cables, full workflow customization, unlimited custom agent builder, Multi-Key Vault with round-robin rotation & auto-failover, OpenRouter model chains, priority WhatsApp & email support.
  - All-Inclusive Cloud Managed Plan (BDT 1,499/mo | BDT 1,199/mo yearly): 100% plug & play zero-setup cloud, NO API keys required, 5,000 fast-lane requests/month on high-speed cluster (Gemini 2.0 Flash & GPT-4o), VIP WhatsApp concierge & 24/7 priority support.
  Answer any plan comparison or upgrade questions accurately, objectively, and persuasively in the user's matching language.
================================================================================`;
}

export function buildCeoOrHelperSystemPrompt(
  helper: ToolConfig | null,
  options?: {
    language?: string;
    tone?: string;
    mode?: 'ceo' | 'helper';
    ceoCustomPrompt?: string;
    planTier?: string;
    planCapabilities?: PlanCapabilityContext;
    multiHelpers?: ToolConfig[];
    recommendedHelper?: ToolConfig | null;
    userMessage?: string;
  }
): string {
  const detected = detectUserLanguage(options?.userMessage || '');

  let langInstruction = '';
  if (options?.language) {
    langInstruction = `\nOUTPUT LANGUAGE: Respond primarily in ${options.language}.\n🚨 MANDATORY LANGUAGE ENFORCEMENT: The user explicitly selected ${options.language}. All outputs, copy, headings, and explanations MUST be written in ${options.language}.`;
  } else if (detected === 'bengali') {
    langInstruction = `\nOUTPUT LANGUAGE: Respond in the same language the user used (Bangla, English, or Banglish), unless they ask for a specific language.
🚨 MANDATORY LANGUAGE MIRRORING PROTOCOL:
The user is speaking to you in BENGALI (বাংলায়).
You MUST reply 100% in natural, fluent, professional BENGALI (সম্পূর্ণ বাংলায় উত্তর দিন).
Do NOT reply in English. Every heading, explanation, bullet point, marketing framework, and call-to-action MUST be written in authentic বাংলা script.`;
  } else if (detected === 'banglish') {
    langInstruction = `\nOUTPUT LANGUAGE: Respond in the same language the user used (Bangla, English, or Banglish), unless they ask for a specific language.
🚨 MANDATORY LANGUAGE MIRRORING PROTOCOL:
The user is speaking to you in BANGLISH (Bengali written in English/Latin letters, e.g. "kemon acho", "likhe daw", "amr business").
You MUST mirror the user's language by responding in natural, conversational Banglish or friendly Bengali.
Do NOT default to stiff, formal English. Match the user's conversational flow, language, and friendly tone.`;
  } else if (detected === 'arabic') {
    langInstruction = `\nOUTPUT LANGUAGE: Respond in the same language the user used (Arabic).\n🚨 MANDATORY LANGUAGE MIRRORING PROTOCOL: The user is speaking in ARABIC (العربية). You MUST reply 100% in fluent ARABIC.`;
  } else if (detected === 'hindi') {
    langInstruction = `\nOUTPUT LANGUAGE: Respond in the same language the user used (Hindi).\n🚨 MANDATORY LANGUAGE MIRRORING PROTOCOL: The user is speaking in HINDI (हिन्दी). You MUST reply 100% in fluent HINDI.`;
  } else {
    langInstruction = `\nOUTPUT LANGUAGE: Respond in the same language the user used (Bangla, English, or Banglish), unless they ask for a specific language.
🚨 MANDATORY LANGUAGE MIRRORING PROTOCOL:
You MUST reply in the EXACT SAME LANGUAGE and tone used by the user. If the user writes in English, reply in crisp English. If the user writes in another language, detect and mirror that language seamlessly.`;
  }

  const toneInstruction = options?.tone
    ? `\nTONE & STYLE: Use a ${options.tone} tone.`
    : `\nTONE & STYLE: Executive, structured, high-converting, ready-to-use output with clear headings and bullet points.`;

  const planCaps =
    options?.planCapabilities || extractPlanCapabilities(null, options?.planTier);
  const planDirective = buildPlanCapabilityDirective(planCaps);
  const tierInstruction = `\n\n${planDirective}`;

  const customDirective = options?.ceoCustomPrompt && options.ceoCustomPrompt.trim()
    ? `\n\nUSER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):\n${options.ceoCustomPrompt.trim()}`
    : '';

  if (options?.multiHelpers && options.multiHelpers.length > 1) {
    const pipelineList = options.multiHelpers
      .map((h, i) => `Stage ${i + 1}: ${h.code ? `[${h.code}] ` : ''}${h.name} (${h.agentRole || 'Executive Specialist'})`)
      .join('\n');

    const specialistInstructions = options.multiHelpers
      .map(
        (h, i) => `### Stage ${i + 1}: ${h.code ? `[${h.code}] ` : ''}${h.name} (${h.agentRole || 'Executive Specialist'})
Framework & Specialist Instructions:
${h.systemPrompt}`
      )
      .join('\n\n');

    return `${AI_CEO_PROFILE.systemPrompt}

⚡ **MULTI-AGENT SEQUENTIAL PIPELINE ACTIVE**
You are executing a coordinated multi-specialist sequential pipeline across ${options.multiHelpers.length} agents:
${pipelineList}

EXECUTION PROTOCOL:
1. Begin your response with an executive pipeline header:
"⚡ **Ezbo Master AI CEO → Coordinated Multi-Agent Pipeline (${options.multiHelpers.map((h) => h.code || h.name).join(' → ')})**"
2. Execute each stage sequentially in complete detail, adhering to that specialist's exclusive prompt and framework:
${specialistInstructions}
3. The output of each stage must naturally connect to and power the next stage, delivering a unified, executive-ready deliverable.${langInstruction}${toneInstruction}${tierInstruction}${customDirective}

🚨 FINAL LANGUAGE MIRRORING DIRECTIVE (CRITICAL):
All stages of this pipeline must be delivered in the user's matched language. Never switch to English if the user communicated in Bengali or Banglish.`;
  }

  if (helper && options?.mode === 'helper') {
    return `You are ${helper.code ? `[${helper.code}] ` : ''}${helper.name} (${helper.badge || 'Specialist Agent'}) on the EzboAgents Business & Freelancer AI Platform.
SPECIALTY: ${helper.shortDesc || helper.description || helper.name}
CORE INSTRUCTION: ${helper.systemPrompt}${langInstruction}${toneInstruction}${tierInstruction}
Do not give generic filler. Deliver complete, copy-paste ready results immediately.${customDirective}

🚨 FINAL LANGUAGE MIRRORING DIRECTIVE (CRITICAL):
Your entire output must be delivered in the user's matched language. Never switch to English if the user communicated in Bengali or Banglish.`;
  }

  if (helper) {
    return `${AI_CEO_PROFILE.systemPrompt}

EXPLICIT HELPER DELEGATION ACTIVE:
The user has commanded deployment of specialist helper **${helper.code ? `[${helper.code}] ` : ''}${helper.name}** (${helper.badge || 'Specialist Agent'}).
Begin your response with a brief 1-line executive header:
"⚡ **AI CEO → Delegated to ${helper.code ? `[${helper.code}] ` : ''}${helper.name}**"
Then execute the task immediately using this specialist's framework:
${helper.systemPrompt}${langInstruction}${toneInstruction}${tierInstruction}${customDirective}

🚨 FINAL LANGUAGE MIRRORING OVERRIDE (CRITICAL PRIORITY):
Regardless of what language the specialist framework above is written in, your entire deliverable, copy, headings, and response MUST be written in the user's matched language (${detected === 'bengali' ? 'বাংলা' : detected === 'banglish' ? 'Banglish/বাংলা' : 'the user\'s language'}). Never switch to English if the user communicated in Bengali or Banglish.`;
  }

  return `${AI_CEO_PROFILE.systemPrompt}

AUTONOMOUS EXECUTION DIRECTIVE:
You are Ezbo, Master AI CEO. You execute business, marketing, creative, technical, and operational tasks directly and autonomously.
Deliver complete, high-converting, copy-paste ready results immediately with clear headings, bullet points, and actionable strategies.
Do not stall, do not ask the user for intermediate confirmation, and do not offer optional command buttons—execute and deliver the full work requested in your response.

You oversee a modular fleet of specialized bespoke business and freelancer agents across marketing, sales, content, design, SEO, freelancing, and omnichannel operations.
${langInstruction}${toneInstruction}${tierInstruction}${customDirective}

🚨 FINAL LANGUAGE MIRRORING OVERRIDE (CRITICAL PRIORITY):
Speak and deliver all outputs exclusively in the user's matched language (${detected === 'bengali' ? 'বাংলা' : detected === 'banglish' ? 'Banglish/বাংলা' : 'the user\'s language'}). Never default to English if the user communicated in Bengali or Banglish.`;
}

const RESTRICTED_PATTERNS: RegExp[] = [
  /customiz(e|ing|ation)\s+workflow/i,
  /customiz(e|ing|ation)\s+this\s+workflow/i,
  /edit(ing)?\s+workflow/i,
  /modify(ing)?\s+workflow/i,
  /workflow\s+(editor|customization|studio|builder|canvas|cables)/i,
  /workflow\s+(customiz|customis|edit|modify)/i,
  /edit(ing)?\s+nodes?/i,
  /custom(ize)?\s+nodes?/i,
  /connect\s+nodes?/i,
  /node\s+(graph|canvas|palette|editor|cables)/i,
  /nodes\s+in\s+the\s+graph/i,
  /creat(e|ing)\s+(a\s+)?(new\s+)?custom\s+agent/i,
  /build(ing)?\s+(a\s+)?(new\s+)?custom\s+agent/i,
  /build\s+me\s+a\s+custom\s+agent/i,
  /create\s+me\s+a\s+custom\s+agent/i,
  /make\s+(a\s+)?(new\s+)?custom\s+agent/i,
  /custom\s+agent\s+(builder|creation|studio)/i,
  /custom\s+agent\s+from\s+scratch/i,
  /new\s+agent\s+from\s+scratch/i,
  /multi(ple)?[- ]key/i,
  /key\s+failover/i,
  /round[- ]robin\s+keys?/i,
  /failover\s+vault/i,
  /ওয়ার্কফ্লো\s*(কাস্টমাইজ|এডিট|পরিবর্তন)/i,
  /ওয়ার্কফ্লো\s*(কাস্টমাইজ|এডিট|পরিবর্তন)/i,
  /নোড\s*(এডিট|পরিবর্তন|কাস্টমাইজ)/i,
  /নতুন\s+এজেন্ট\s*(তৈরি|বানাও)/i,
  /কাস্টম\s+এজেন্ট\s*(তৈরি|বানাও)/i,
  /মাল্টি[- ]কি/i,
  /কি\s+ফেইলওভার/i,
  /workflow\s+customize\s+koro/i,
  /custom\s+agent\s+(banano|banate)/i
];

/**
 * Intelligent plan guard to detect if a Starter Plan subscriber is asking to perform
 * restricted actions (workflow node customization, custom agent building from scratch, multi-key rotation).
 */
export function isRestrictedStarterIntent(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const q = message.trim();
  if (!q) return false;

  // Explicit prohibited phrases across English, Bengali, and Banglish
  const restrictedPhrases = [
    'customize this workflow',
    'customize workflow',
    'customise workflow',
    'workflow customize',
    'workflow customise',
    'workflow edit',
    'edit workflow',
    'edit node',
    'edit nodes',
    'node edit',
    'nodes edit',
    'nodes in the graph',
    'modify workflow',
    'workflow modify',
    'build me a custom agent',
    'create a custom agent',
    'custom agent',
    'custom agent from scratch',
    'new agent from scratch',
    'multi-key failover',
    'multi-key rotation',
    'multi key rotation',
    'key rotation failover',
    'n8n workflow studio',
    'workflow canvas',
    // Bengali triggers
    'ওয়ার্কফ্লো এডিট',
    'ওয়ার্কফ্লো এডিট',
    'ওয়ার্কফ্লো কাস্টমাইজ',
    'ওয়ার্কফ্লো কাস্টমাইজ',
    'কাস্টম এজেন্ট',
    'নতুন এজেন্ট তৈরি',
    'নোড এডিট',
    'মাল্টি-কি',
    // Banglish triggers
    'workflow customize koro',
    'custom agent banano',
    'custom agent banate',
    'custom agent banano lagbe',
    'workflow edit koro',
    'node edit koro'
  ];

  const lower = q.toLowerCase();
  for (const phrase of restrictedPhrases) {
    if (lower.includes(phrase)) return true;
  }

  return RESTRICTED_PATTERNS.some((re) => re.test(q));
}

/**
 * Polite bilingual response explaining that workflow customization, custom agent creation,
 * and multi-key rotation require upgrading to the Pro Plan.
 */
export function getStarterGuardResponse(): string {
  return `সম্মানিত গ্রাহক, আপনি বর্তমানে **Starter Plan** ব্যবহার করছেন।

Starter Plan-এ আপনি **রেডিমেড এআই ওয়ার্কফ্লো** চালানো এবং **১০০+ এন্টারপ্রাইজ টুল কানেক্টর** ব্যবহারের সম্পূর্ণ সুবিধা উপভোগ করতে পারেন।

তবে **ভিজ্যুয়াল নোড এডিটিং (Visual Workflow Studio)**, **কাস্টম ওয়ার্কফ্লো মডিফিকেশন**, **নতুন কাস্টম এজেন্ট তৈরি**, এবং **মাল্টি-কি অটো-ফেইলওভার ভল্ট** সুবিধাগুলো ব্যবহার করতে **Pro Plan**-এ আপগ্রেড করা প্রয়োজন।

আপনার এক্সিকিউটিভ অটোমেশনকে আরও শক্তিশালী করতে আজই প্রো প্ল্যানে আপগ্রেড করুন:
👉 [Upgrade to Pro Plan](/plans)

---
*Dear User, you are currently on the **Starter Plan**. Your current plan allows you to run specialized agent workflows and connect 100+ enterprise tool connectors. However, visual workflow customization, node canvas editing, custom agent building, and multi-key failover require the **Pro Plan**. Please [Upgrade to Pro Plan](/plans) to unlock full visual workflow customization and custom agent creation!*`;
}

