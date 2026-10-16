import { TOOLS, AI_CEO_PROFILE, type ToolConfig } from '$lib/config/tools';

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

  { helperId: 'ai_commercial_image_generator', keywords: ['generate image', 'create image', 'commercial photo', 'ছবি তৈরি'] },
  { helperId: 'ai_business_logo_generator', keywords: ['logo', 'brand mark', 'লোগো'] },
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
  { helperId: 'weekly_productivity_goal_tracker', keywords: ['weekly review', 'okr', 'kpi', 'habit tracker'] }
];

export function matchHelperForMessage(query: string, explicitHelperId?: string): ToolConfig | null {
  if (explicitHelperId && explicitHelperId !== 'ceo') {
    const exact = TOOLS.find(
      (t) =>
        t.id.toLowerCase() === explicitHelperId.toLowerCase() ||
        t.code.toLowerCase() === explicitHelperId.toLowerCase() ||
        t.code.replace('#', '') === explicitHelperId.replace('#', '')
    );
    if (exact) return exact;

    // Check if explicitHelperId references a mention chip or #XX
    const explicitChipMatch = explicitHelperId.match(/\[?⚡?\s*#(\d{1,2})\b/i);
    if (explicitChipMatch) {
      const num = explicitChipMatch[1].padStart(2, '0');
      const byCode = TOOLS.find((t) => t.code === `#${num}`);
      if (byCode) return byCode;
    }
  }

  const clean = (query || '').trim();
  if (!clean) return null;

  // Check if message references slash command mention chip: [⚡ #01 Facebook Ad Copy] or #01 - #75 directly
  const chipMatch = clean.match(/\[?⚡?\s*#(\d{1,2})\b/i);
  if (chipMatch) {
    const num = chipMatch[1].padStart(2, '0');
    const byCode = TOOLS.find((t) => t.code === `#${num}`);
    if (byCode) return byCode;
  }

  const lower = clean.toLowerCase();

  // Check keyword rules
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        const found = TOOLS.find((t) => t.id === rule.helperId);
        if (found) return found;
      }
    }
  }

  // Fallback name match
  for (const tool of TOOLS) {
    if (lower.includes(tool.name.toLowerCase())) {
      return tool;
    }
  }

  return null;
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
  if (typeof helper === 'object' && helper !== null && (helper.code === '#34' || helper.code === '#35')) {
    return true;
  }
  const lower = (query || (typeof helper === 'string' && !query ? helper : '')).toLowerCase();
  return (
    lower.startsWith('/img ') ||
    lower.startsWith('generate image:') ||
    lower.startsWith('create logo:')
  );
}

export function buildCeoOrHelperSystemPrompt(
  helper: ToolConfig | null,
  options?: {
    language?: string;
    tone?: string;
    mode?: 'ceo' | 'helper';
    ceoCustomPrompt?: string;
  }
): string {
  const langInstruction = options?.language
    ? `\nOUTPUT LANGUAGE: Respond primarily in ${options.language}.`
    : `\nOUTPUT LANGUAGE: Respond in the same language the user used (Bangla, English, or Banglish), unless they ask for a specific language.`;

  const toneInstruction = options?.tone
    ? `\nTONE & STYLE: Use a ${options.tone} tone.`
    : `\nTONE & STYLE: Executive, structured, high-converting, ready-to-use output with clear headings and bullet points.`;

  const customDirective = options?.ceoCustomPrompt && options.ceoCustomPrompt.trim()
    ? `\n\nUSER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):\n${options.ceoCustomPrompt.trim()}`
    : '';

  if (helper && options?.mode === 'helper') {
    return `You are [${helper.code}] ${helper.name} (${helper.badge}) on the EzboAgents Business & Freelancer AI Platform.
SPECIALTY: ${helper.shortDesc}
CORE INSTRUCTION: ${helper.systemPrompt}${langInstruction}${toneInstruction}
Do not give generic filler. Deliver complete, copy-paste ready results immediately.${customDirective}`;
  }

  if (helper) {
    return `${AI_CEO_PROFILE.systemPrompt}

AUTOMATIC HELPER DELEGATION ACTIVE:
You have automatically routed this request to specialist helper **[${helper.code}] ${helper.name}** (${helper.badge}).
Begin your response with a brief 1-line executive header:
"⚡ **AI CEO → Delegated to [${helper.code}] ${helper.name}**"
Then execute the task using this specialist's protocol:
${helper.systemPrompt}${langInstruction}${toneInstruction}${customDirective}`;
  }

  return `${AI_CEO_PROFILE.systemPrompt}

You oversee 75 specialized Business & Freelancer AI Helpers (#01 to #75) across 7 categories:
1. Ads & Marketing (#01-#12)
2. Social Media & Content (#13-#23)
3. Writing & AI Humanizer (#24-#33)
4. Image, Logo & Visual Design (#34-#41)
5. SEO & Website Traffic (#42-#50)
6. Freelancing — Upwork, Fiverr & Client Hunting (#51-#62)
7. Business Operations, Sales & Productivity (#63-#75)

NOTE ON AUTONOMOUS STORE AGENTS: Agents purchased from the "Agents Store" are standalone autonomous agents configured exclusively on the Web Dashboard and are NOT controlled via chat/WhatsApp/Telegram.${langInstruction}${toneInstruction}${customDirective}`;
}
