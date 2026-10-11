import { TOOLS, AI_CEO_PROFILE, type ToolConfig } from '$lib/config/tools';

const KEYWORD_RULES: Array<{ helperId: string; keywords: string[] }> = [
  { helperId: 'fb_ig_ad_generator', keywords: ['facebook ad', 'fb ad', 'instagram ad', 'ig ad', 'meta ad', ' ফেসবুক এড', 'বিজ্ঞাপন'] },
  { helperId: 'google_search_ad_writer', keywords: ['google ad', 'ppc', 'search ad', 'display ad', 'adwords'] },
  { helperId: 'tiktok_reels_ad_script', keywords: ['tiktok ad', 'reels ad', 'ugc script', 'short video ad', 'টিকটক'] },
  { helperId: 'target_audience_finder', keywords: ['target audience', 'buyer persona', 'interest targeting', 'টার্গেট অডিয়েন্স'] },
  { helperId: 'marketing_campaign_360', keywords: ['360 marketing', 'marketing plan', 'launch strategy', 'মার্কেটিং প্ল্যান'] },
  { helperId: 'competitor_ad_spy', keywords: ['competitor ad', 'ad spy', 'counter angle', 'কম্পিটিটর'] },
  { helperId: 'retargeting_ad_specialist', keywords: ['retargeting', 'abandoned cart', 'warm audience'] },
  { helperId: 'promo_offer_bundle_creator', keywords: ['bundle offer', 'discount offer', 'flash sale', 'ঈদ অফার', 'ডিসকাউন্ট'] },
  { helperId: 'landing_page_copywriter', keywords: ['landing page', 'sales page', 'funnel copy', 'ল্যান্ডিং পেজ'] },
  { helperId: 'email_marketing_sequence', keywords: ['email sequence', 'newsletter', 'drip campaign'] },
  { helperId: 'whatsapp_sms_blaster', keywords: ['whatsapp broadcast', 'sms campaign', 'bulk sms'] },
  { helperId: 'ad_creative_brief_writer', keywords: ['creative brief', 'designer brief', 'video editor brief'] },

  { helperId: 'unlimited_post_ideas', keywords: ['post idea', 'content idea', 'পোস্ট আইডিয়া'] },
  { helperId: 'content_calendar_30d', keywords: ['30 day calendar', 'content calendar', 'কন্টেন্ট ক্যালেন্ডার'] },
  { helperId: 'viral_hook_generator', keywords: ['viral hook', 'scroll stopping', 'হুক'] },
  { helperId: 'fb_ig_caption_writer', keywords: ['caption', 'fb post', 'ig caption', 'ক্যাপশন'] },
  { helperId: 'linkedin_authority_writer', keywords: ['linkedin post', 'thought leadership'] },
  { helperId: 'carousel_slide_planner', keywords: ['carousel', 'slide post', 'ক্যারোসেল'] },
  { helperId: 'youtube_script_title_master', keywords: ['youtube script', 'youtube title', 'ইউটিউব স্ক্রিপ্ট'] },
  { helperId: 'content_repurposer_1to10', keywords: ['repurpose', '1 to 10', 'atomize'] },
  { helperId: 'hashtag_social_seo', keywords: ['hashtag', 'হ্যাশট্যাগ'] },
  { helperId: 'engagement_poll_quiz', keywords: ['poll', 'quiz', 'engagement question'] },
  { helperId: 'trend_jacking_meme_ideator', keywords: ['meme idea', 'trend jack', 'ট্রেন্ড'] },

  { helperId: 'ai_text_humanizer', keywords: ['humanize', 'humanizer', 'bypass ai', 'natural text', 'হিউম্যানাইজ'] },
  { helperId: 'grammar_spell_checker', keywords: ['grammar', 'proofread', 'spell check', 'গ্রামার'] },
  { helperId: 'smart_paraphraser', keywords: ['paraphrase', 'rewrite', 'rephrase', 'প্যারাফ্রেজ'] },
  { helperId: 'tone_changer_pro', keywords: ['change tone', 'formal tone', 'friendly tone'] },
  { helperId: 'bangla_english_translator', keywords: ['translate', 'bangla to english', 'english to bangla', 'অনুবাদ'] },
  { helperId: 'long_text_summarizer', keywords: ['summarize', 'summary', 'tl;dr', 'সামারি'] },
  { helperId: 'brand_storytelling_writer', keywords: ['brand story', 'about us', 'mission vision'] },
  { helperId: 'press_release_writer', keywords: ['press release', 'media announcement'] },
  { helperId: 'cold_email_outreach', keywords: ['cold email', 'b2b email', 'outreach email'] },
  { helperId: 'speech_presentation_script', keywords: ['speech', 'presentation script', 'pitch deck script'] },

  { helperId: 'ai_commercial_image_gen', keywords: ['generate image', 'create image', 'commercial photo', 'ছবি তৈরি'] },
  { helperId: 'ai_business_logo_gen', keywords: ['logo', 'brand mark', 'লোগো'] },
  { helperId: 'product_photography_mockup', keywords: ['product photo', 'mockup', 'studio backdrop'] },
  { helperId: 'youtube_fb_thumbnail_designer', keywords: ['thumbnail', 'থাম্বনেইল'] },
  { helperId: 'social_poster_banner_creator', keywords: ['poster', 'banner design', 'পোস্টার', 'ব্যানার'] },
  { helperId: 'brand_color_typography_guide', keywords: ['color palette', 'font pair', 'brand identity'] },
  { helperId: 'midjourney_flux_prompt_eng', keywords: ['midjourney prompt', 'flux prompt', 'image prompt'] },
  { helperId: 'packaging_label_ideator', keywords: ['packaging', 'box design', 'label design'] },

  { helperId: 'seo_keyword_research', keywords: ['keyword research', 'low kd', 'search volume', 'কিওয়ার্ড'] },
  { helperId: 'seo_blog_article_writer', keywords: ['seo blog', 'article writer', 'blog post', 'ব্লগ আর্টিকেল'] },
  { helperId: 'onpage_meta_tag_generator', keywords: ['meta title', 'meta description', 'on-page seo'] },
  { helperId: 'ecommerce_product_seo', keywords: ['product description', 'shopify seo', 'daraz', 'প্রোডাক্ট ডেসক্রিপশন'] },
  { helperId: 'local_seo_gmb_optimizer', keywords: ['google my business', 'gmb', 'local seo'] },
  { helperId: 'faq_schema_generator', keywords: ['faq schema', 'json-ld', 'people also ask'] },
  { helperId: 'backlink_outreach_pitcher', keywords: ['backlink', 'guest post', 'link building'] },
  { helperId: 'content_gap_cluster_planner', keywords: ['topic cluster', 'content gap', 'pillar page'] },
  { helperId: 'youtube_video_seo', keywords: ['youtube seo', 'video tags', 'youtube description'] },

  { helperId: 'upwork_proposal_writer', keywords: ['upwork', 'proposal', 'cover letter', 'আপওয়ার্ক', 'প্রপোজাল'] },
  { helperId: 'fiverr_gig_seo_creator', keywords: ['fiverr', 'gig title', 'gig description', 'ফাইভার', 'গিগ'] },
  { helperId: 'client_inbox_closer', keywords: ['close client', 'client reply', 'inbox reply', 'ক্লায়েন্ট রিপ্লাই'] },
  { helperId: 'client_price_negotiator', keywords: ['price negotiation', 'low budget', 'counter offer', 'বাজেট'] },
  { helperId: 'project_quotation_estimator', keywords: ['quotation', 'estimate', 'project quote', 'কোটেশন'] },
  { helperId: 'linkedin_cold_dm_hunter', keywords: ['cold dm', 'linkedin dm', 'instagram dm'] },
  { helperId: 'discovery_call_script', keywords: ['discovery call', 'zoom call', 'client meeting'] },
  { helperId: 'scope_creep_extra_charge', keywords: ['scope creep', 'extra work', 'additional charge'] },
  { helperId: 'deadline_extension_communicator', keywords: ['deadline extension', 'project delay', 'progress update'] },
  { helperId: 'five_star_review_requester', keywords: ['5 star review', 'ask for review', 'testimonial request'] },
  { helperId: 'freelance_contract_nda', keywords: ['contract', 'nda', 'freelance agreement'] },
  { helperId: 'portfolio_case_study_builder', keywords: ['case study', 'portfolio project'] },

  { helperId: 'time_management_scheduler', keywords: ['time management', 'schedule', 'time block', 'রুটিন', 'টাইম ম্যানেজমেন্ট'] },
  { helperId: 'inbox_sales_objection_handler', keywords: ['price too high', 'objection', 'inbox sales', 'ইনবক্স সেলস'] },
  { helperId: 'angry_customer_retention', keywords: ['angry customer', 'refund request', 'complaint', 'অভিযোগ'] },
  { helperId: 'excel_sheets_formula_gen', keywords: ['excel formula', 'google sheets', 'vlookup', 'xlookup', 'এক্সেল'] },
  { helperId: 'profit_margin_calculator', keywords: ['profit margin', 'roas', 'break even', 'হিসাব', 'লাভ'] },
  { helperId: 'sop_creator', keywords: ['sop', 'standard operating procedure'] },
  { helperId: 'meeting_notes_action_plan', keywords: ['meeting notes', 'minutes', 'action items'] },
  { helperId: 'business_name_domain_gen', keywords: ['business name', 'brand name', 'domain idea', 'বিজনেস নাম'] },
  { helperId: 'invoice_payment_followup', keywords: ['overdue invoice', 'payment reminder', 'বকেয়া'] },
  { helperId: 'hr_job_circular_interview', keywords: ['job circular', 'interview questions', 'hiring', 'নিয়োগ'] },
  { helperId: 'business_idea_swot_validator', keywords: ['swot', 'validate idea', 'business idea', 'বিজনেস আইডিয়া'] },
  { helperId: 'website_code_bug_helper', keywords: ['wordpress bug', 'shopify liquid', 'css fix', 'html fix', 'কোড বাগ'] },
  { helperId: 'weekly_productivity_tracker', keywords: ['weekly review', 'okr', 'kpi', 'habit tracker'] }
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
  }

  const clean = (query || '').trim();
  if (!clean) return null;

  // Check if message references #01 - #75 directly
  const codeMatch = clean.match(/#(\d{1,2})\b/);
  if (codeMatch) {
    const num = codeMatch[1].padStart(2, '0');
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

export function isVisualGenerationHelper(helper: ToolConfig | null, query: string): boolean {
  if (helper && ['ai_commercial_image_gen', 'ai_business_logo_gen'].includes(helper.id)) {
    return true;
  }
  const lower = (query || '').toLowerCase();
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
  }
): string {
  const langInstruction = options?.language
    ? `\nOUTPUT LANGUAGE: Respond primarily in ${options.language}.`
    : `\nOUTPUT LANGUAGE: Respond in the same language the user used (Bangla, English, or Banglish), unless they ask for a specific language.`;

  const toneInstruction = options?.tone
    ? `\nTONE & STYLE: Use a ${options.tone} tone.`
    : `\nTONE & STYLE: Executive, structured, high-converting, ready-to-use output with clear headings and bullet points.`;

  if (helper && options?.mode === 'helper') {
    return `You are [${helper.code}] ${helper.name} (${helper.badge}) on the EzboAgents Business & Freelancer AI Platform.
SPECIALTY: ${helper.shortDesc}
CORE INSTRUCTION: ${helper.systemPrompt}${langInstruction}${toneInstruction}
Do not give generic filler. Deliver complete, copy-paste ready results immediately.`;
  }

  if (helper) {
    return `${AI_CEO_PROFILE.systemPrompt}

AUTOMATIC HELPER DELEGATION ACTIVE:
You have automatically routed this request to specialist helper **[${helper.code}] ${helper.name}** (${helper.badge}).
Begin your response with a brief 1-line executive header:
"⚡ **AI CEO → Delegated to [${helper.code}] ${helper.name}**"
Then execute the task using this specialist's protocol:
${helper.systemPrompt}${langInstruction}${toneInstruction}`;
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

NOTE ON AUTONOMOUS STORE AGENTS: Agents purchased from the "Agents Store" are standalone autonomous agents configured exclusively on the Web Dashboard and are NOT controlled via chat/WhatsApp/Telegram.${langInstruction}${toneInstruction}`;
}
