// Generated robot configurations for EzboAgents Homepage AI Helpers & AI CEO
// Total mapped agents: 76 (1 Master AI CEO + 75 AI Helpers)

import { TOOLS, AI_CEO_PROFILE } from './tools.ts';

export type HeadShape =
  | 'round-rect'
  | 'squircle'
  | 'capsule'
  | 'hexagon'
  | 'dome'
  | 'shield'
  | 'wide-monitor'
  | 'pebble';

export type AntennaType =
  | 'crown'
  | 'radar-dish'
  | 'single-beacon'
  | 'dual-tech'
  | 'quill-pen'
  | 'camera-lens'
  | 'code-brackets'
  | 'wifi-waves'
  | 'target-crosshair'
  | 'bolt-speed'
  | 'chart-bars'
  | 'lightbulb'
  | 'star-crest'
  | 'shield-crest';

export type EarType =
  | 'headphones'
  | 'bolts'
  | 'fins'
  | 'dishes'
  | 'leds'
  | 'audio'
  | 'circuits'
  | 'capsules';

export type VisorShape =
  | 'full-visor'
  | 'dual-pod'
  | 'wide-curve'
  | 'hex-screen'
  | 'matrix-strip'
  | 'circular-lens';

export type EyeStyle =
  | 'pill'
  | 'circle'
  | 'crescent'
  | 'visor-beam'
  | 'star'
  | 'bracket'
  | 'concentric'
  | 'matrix-dot';

export type EyeColor = 'cyan' | 'electric-blue' | 'sky' | 'teal';

export type MouthStyle = 'smile' | 'wave' | 'dots' | 'grill' | 'dash' | 'none';

export type ForeheadAccent =
  | 'gem'
  | 'tech-line'
  | 'dot-matrix'
  | 'target'
  | 'bracket'
  | 'code'
  | 'spark'
  | 'wave'
  | 'circuit'
  | 'none';

export interface RobotConfig {
  id: string;
  code: string;
  name: string;
  agentName: string;
  category: string;
  headShape: HeadShape;
  antenna: AntennaType;
  ears: EarType;
  visorShape: VisorShape;
  eyeStyle: EyeStyle;
  eyeColor: EyeColor;
  mouthStyle: MouthStyle;
  foreheadAccent: ForeheadAccent;
  blinkDuration: number;
  blinkDelay: number;
}

export const ROBOT_CONFIGS: Record<string, RobotConfig> = {
  "ceo": {
    "id": "ceo",
    "code": "CEO-00",
    "name": "AI CEO — Master Executive Orchestrator",
    "agentName": "Master AI CEO",
    "category": "ceo",
    "headShape": "shield",
    "antenna": "crown",
    "ears": "fins",
    "visorShape": "full-visor",
    "eyeStyle": "star",
    "eyeColor": "cyan",
    "mouthStyle": "smile",
    "foreheadAccent": "gem",
    "blinkDuration": 3.6,
    "blinkDelay": -0.3
  },
  "fb_insta_ads": {
    "id": "fb_insta_ads",
    "code": "#01",
    "name": "Facebook & Instagram Ads Generator",
    "agentName": "AdNexus",
    "category": "ads_marketing",
    "headShape": "round-rect",
    "antenna": "target-crosshair",
    "ears": "headphones",
    "visorShape": "full-visor",
    "eyeStyle": "pill",
    "eyeColor": "cyan",
    "mouthStyle": "smile",
    "foreheadAccent": "target",
    "blinkDuration": 4.3,
    "blinkDelay": -1.73
  },
  "google_search_display_ads": {
    "id": "google_search_display_ads",
    "code": "#02",
    "name": "Google Search & Display Ads Generator",
    "agentName": "ClickForge",
    "category": "ads_marketing",
    "headShape": "wide-monitor",
    "antenna": "radar-dish",
    "ears": "circuits",
    "visorShape": "hex-screen",
    "eyeStyle": "concentric",
    "eyeColor": "electric-blue",
    "mouthStyle": "dash",
    "foreheadAccent": "circuit",
    "blinkDuration": 5,
    "blinkDelay": -3.16
  },
  "tiktok_reels_ad_scripts": {
    "id": "tiktok_reels_ad_scripts",
    "code": "#03",
    "name": "TikTok & Reels Video Ad Scriptwriter",
    "agentName": "ReelCloser",
    "category": "ads_marketing",
    "headShape": "hexagon",
    "antenna": "radar-dish",
    "ears": "audio",
    "visorShape": "wide-curve",
    "eyeStyle": "visor-beam",
    "eyeColor": "electric-blue",
    "mouthStyle": "dash",
    "foreheadAccent": "circuit",
    "blinkDuration": 5.7,
    "blinkDelay": -4.59
  },
  "target_audience_persona": {
    "id": "target_audience_persona",
    "code": "#04",
    "name": "Target Audience & Buyer Persona Finder",
    "agentName": "PersonaIQ",
    "category": "ads_marketing",
    "headShape": "shield",
    "antenna": "target-crosshair",
    "ears": "headphones",
    "visorShape": "matrix-strip",
    "eyeStyle": "bracket",
    "eyeColor": "sky",
    "mouthStyle": "wave",
    "foreheadAccent": "tech-line",
    "blinkDuration": 3.7,
    "blinkDelay": -0.63
  },
  "marketing_campaign_planner": {
    "id": "marketing_campaign_planner",
    "code": "#05",
    "name": "360° Marketing Campaign Planner",
    "agentName": "GrowthMap",
    "category": "ads_marketing",
    "headShape": "round-rect",
    "antenna": "chart-bars",
    "ears": "circuits",
    "visorShape": "full-visor",
    "eyeStyle": "star",
    "eyeColor": "cyan",
    "mouthStyle": "dots",
    "foreheadAccent": "target",
    "blinkDuration": 4.4,
    "blinkDelay": -2.06
  },
  "competitor_ad_spy": {
    "id": "competitor_ad_spy",
    "code": "#06",
    "name": "Competitor Ad & Strategy Spy Helper",
    "agentName": "SpyEdge",
    "category": "ads_marketing",
    "headShape": "squircle",
    "antenna": "dual-tech",
    "ears": "leds",
    "visorShape": "hex-screen",
    "eyeStyle": "pill",
    "eyeColor": "electric-blue",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 5.1,
    "blinkDelay": -3.49
  },
  "retargeting_ad_generator": {
    "id": "retargeting_ad_generator",
    "code": "#07",
    "name": "Retargeting Ad Copy Generator",
    "agentName": "WinBack",
    "category": "ads_marketing",
    "headShape": "wide-monitor",
    "antenna": "single-beacon",
    "ears": "fins",
    "visorShape": "wide-curve",
    "eyeStyle": "concentric",
    "eyeColor": "sky",
    "mouthStyle": "dash",
    "foreheadAccent": "circuit",
    "blinkDuration": 5.8,
    "blinkDelay": -4.92
  },
  "promo_offer_bundle_architect": {
    "id": "promo_offer_bundle_architect",
    "code": "#08",
    "name": "Promo Offer & Bundle Architect",
    "agentName": "OfferCraft",
    "category": "ads_marketing",
    "headShape": "hexagon",
    "antenna": "star-crest",
    "ears": "audio",
    "visorShape": "matrix-strip",
    "eyeStyle": "visor-beam",
    "eyeColor": "cyan",
    "mouthStyle": "wave",
    "foreheadAccent": "tech-line",
    "blinkDuration": 3.8,
    "blinkDelay": -0.96
  },
  "landing_page_copywriter": {
    "id": "landing_page_copywriter",
    "code": "#09",
    "name": "Landing Page Conversion Copywriter",
    "agentName": "PageConvert",
    "category": "ads_marketing",
    "headShape": "shield",
    "antenna": "radar-dish",
    "ears": "headphones",
    "visorShape": "full-visor",
    "eyeStyle": "bracket",
    "eyeColor": "electric-blue",
    "mouthStyle": "dots",
    "foreheadAccent": "target",
    "blinkDuration": 4.5,
    "blinkDelay": -2.39
  },
  "email_marketing_newsletter": {
    "id": "email_marketing_newsletter",
    "code": "#10",
    "name": "Email Marketing & Newsletter Generator",
    "agentName": "InboxPulse",
    "category": "ads_marketing",
    "headShape": "round-rect",
    "antenna": "target-crosshair",
    "ears": "circuits",
    "visorShape": "hex-screen",
    "eyeStyle": "star",
    "eyeColor": "sky",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 5.2,
    "blinkDelay": -3.82
  },
  "whatsapp_sms_blaster": {
    "id": "whatsapp_sms_blaster",
    "code": "#11",
    "name": "WhatsApp & SMS Marketing Blaster",
    "agentName": "PingConvert",
    "category": "ads_marketing",
    "headShape": "squircle",
    "antenna": "chart-bars",
    "ears": "leds",
    "visorShape": "wide-curve",
    "eyeStyle": "pill",
    "eyeColor": "cyan",
    "mouthStyle": "dash",
    "foreheadAccent": "circuit",
    "blinkDuration": 5.9,
    "blinkDelay": -5.25
  },
  "ad_creative_banner_brief": {
    "id": "ad_creative_banner_brief",
    "code": "#12",
    "name": "Ad Creative & Banner Brief Maker",
    "agentName": "VisualBrief",
    "category": "ads_marketing",
    "headShape": "wide-monitor",
    "antenna": "dual-tech",
    "ears": "fins",
    "visorShape": "matrix-strip",
    "eyeStyle": "concentric",
    "eyeColor": "electric-blue",
    "mouthStyle": "wave",
    "foreheadAccent": "tech-line",
    "blinkDuration": 3.9,
    "blinkDelay": -1.29
  },
  "unlimited_post_ideas": {
    "id": "unlimited_post_ideas",
    "code": "#13",
    "name": "Unlimited Post Ideas Generator",
    "agentName": "IdeaSpark",
    "category": "social_content",
    "headShape": "round-rect",
    "antenna": "wifi-waves",
    "ears": "leds",
    "visorShape": "wide-curve",
    "eyeStyle": "circle",
    "eyeColor": "electric-blue",
    "mouthStyle": "dash",
    "foreheadAccent": "wave",
    "blinkDuration": 4.6,
    "blinkDelay": -2.72
  },
  "social_content_calendar_30d": {
    "id": "social_content_calendar_30d",
    "code": "#14",
    "name": "30-Day Social Media Content Calendar",
    "agentName": "CalendarPro",
    "category": "social_content",
    "headShape": "capsule",
    "antenna": "lightbulb",
    "ears": "audio",
    "visorShape": "circular-lens",
    "eyeStyle": "pill",
    "eyeColor": "cyan",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 5.3,
    "blinkDelay": -4.15
  },
  "viral_hook_headline_generator": {
    "id": "viral_hook_headline_generator",
    "code": "#15",
    "name": "Viral Hook & Headline Generator",
    "agentName": "HookMaster",
    "category": "social_content",
    "headShape": "squircle",
    "antenna": "wifi-waves",
    "ears": "audio",
    "visorShape": "wide-curve",
    "eyeStyle": "crescent",
    "eyeColor": "sky",
    "mouthStyle": "wave",
    "foreheadAccent": "wave",
    "blinkDuration": 6,
    "blinkDelay": -5.58
  },
  "fb_insta_caption_writer": {
    "id": "fb_insta_caption_writer",
    "code": "#16",
    "name": "Facebook & Instagram Caption Writer",
    "agentName": "CaptionCraft",
    "category": "social_content",
    "headShape": "dome",
    "antenna": "star-crest",
    "ears": "dishes",
    "visorShape": "full-visor",
    "eyeStyle": "crescent",
    "eyeColor": "electric-blue",
    "mouthStyle": "dots",
    "foreheadAccent": "gem",
    "blinkDuration": 4,
    "blinkDelay": -1.62
  },
  "linkedin_authority_writer": {
    "id": "linkedin_authority_writer",
    "code": "#17",
    "name": "LinkedIn Authority Post & Article Writer",
    "agentName": "LinkLeader",
    "category": "social_content",
    "headShape": "pebble",
    "antenna": "dual-tech",
    "ears": "capsules",
    "visorShape": "wide-curve",
    "eyeStyle": "star",
    "eyeColor": "cyan",
    "mouthStyle": "dash",
    "foreheadAccent": "wave",
    "blinkDuration": 4.7,
    "blinkDelay": -3.05
  },
  "carousel_slide_planner": {
    "id": "carousel_slide_planner",
    "code": "#18",
    "name": "Carousel & Infographic Slide Planner",
    "agentName": "SlideDeck",
    "category": "social_content",
    "headShape": "round-rect",
    "antenna": "wifi-waves",
    "ears": "leds",
    "visorShape": "circular-lens",
    "eyeStyle": "circle",
    "eyeColor": "sky",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 5.4,
    "blinkDelay": -4.48
  },
  "youtube_script_title_generator": {
    "id": "youtube_script_title_generator",
    "code": "#19",
    "name": "YouTube Video Script & Title Generator",
    "agentName": "TubeArchitect",
    "category": "social_content",
    "headShape": "capsule",
    "antenna": "lightbulb",
    "ears": "audio",
    "visorShape": "dual-pod",
    "eyeStyle": "pill",
    "eyeColor": "electric-blue",
    "mouthStyle": "wave",
    "foreheadAccent": "dot-matrix",
    "blinkDuration": 6.1,
    "blinkDelay": -0.52
  },
  "content_repurposer_1_to_10": {
    "id": "content_repurposer_1_to_10",
    "code": "#20",
    "name": "Content Repurposer 1-to-10",
    "agentName": "OmniMultiply",
    "category": "social_content",
    "headShape": "squircle",
    "antenna": "single-beacon",
    "ears": "headphones",
    "visorShape": "full-visor",
    "eyeStyle": "matrix-dot",
    "eyeColor": "cyan",
    "mouthStyle": "dots",
    "foreheadAccent": "gem",
    "blinkDuration": 4.1,
    "blinkDelay": -1.95
  },
  "hashtag_social_keyword_researcher": {
    "id": "hashtag_social_keyword_researcher",
    "code": "#21",
    "name": "Hashtag & Social Keyword Researcher",
    "agentName": "TagRadar",
    "category": "social_content",
    "headShape": "dome",
    "antenna": "star-crest",
    "ears": "dishes",
    "visorShape": "wide-curve",
    "eyeStyle": "crescent",
    "eyeColor": "sky",
    "mouthStyle": "dash",
    "foreheadAccent": "wave",
    "blinkDuration": 4.8,
    "blinkDelay": -3.38
  },
  "engagement_question_poll_creator": {
    "id": "engagement_question_poll_creator",
    "code": "#22",
    "name": "Engagement Question & Poll Creator",
    "agentName": "BuzzSpark",
    "category": "social_content",
    "headShape": "pebble",
    "antenna": "dual-tech",
    "ears": "capsules",
    "visorShape": "circular-lens",
    "eyeStyle": "star",
    "eyeColor": "electric-blue",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 5.5,
    "blinkDelay": -4.81
  },
  "trend_jacking_meme_ideator": {
    "id": "trend_jacking_meme_ideator",
    "code": "#23",
    "name": "Trend-Jacking & Meme Idea Generator",
    "agentName": "MemeWave",
    "category": "social_content",
    "headShape": "round-rect",
    "antenna": "wifi-waves",
    "ears": "leds",
    "visorShape": "dual-pod",
    "eyeStyle": "circle",
    "eyeColor": "cyan",
    "mouthStyle": "wave",
    "foreheadAccent": "dot-matrix",
    "blinkDuration": 6.2,
    "blinkDelay": -0.85
  },
  "ai_text_humanizer": {
    "id": "ai_text_humanizer",
    "code": "#24",
    "name": "AI Text Humanizer 100% Natural",
    "agentName": "HumanPulse",
    "category": "writing_humanizer",
    "headShape": "dome",
    "antenna": "quill-pen",
    "ears": "capsules",
    "visorShape": "dual-pod",
    "eyeStyle": "circle",
    "eyeColor": "teal",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 4.2,
    "blinkDelay": -2.28
  },
  "advanced_grammar_spell_checker": {
    "id": "advanced_grammar_spell_checker",
    "code": "#25",
    "name": "Advanced Grammar & Spell Checker",
    "agentName": "LexiCheck",
    "category": "writing_humanizer",
    "headShape": "dome",
    "antenna": "dual-tech",
    "ears": "dishes",
    "visorShape": "dual-pod",
    "eyeStyle": "pill",
    "eyeColor": "sky",
    "mouthStyle": "dots",
    "foreheadAccent": "tech-line",
    "blinkDuration": 4.9,
    "blinkDelay": -3.71
  },
  "smart_paraphraser_rewriter": {
    "id": "smart_paraphraser_rewriter",
    "code": "#26",
    "name": "Smart Paraphraser & Content Rewriter",
    "agentName": "RePhrasePro",
    "category": "writing_humanizer",
    "headShape": "pebble",
    "antenna": "quill-pen",
    "ears": "fins",
    "visorShape": "full-visor",
    "eyeStyle": "crescent",
    "eyeColor": "electric-blue",
    "mouthStyle": "smile",
    "foreheadAccent": "dot-matrix",
    "blinkDuration": 5.6,
    "blinkDelay": -5.14
  },
  "tone_changer_polisher": {
    "id": "tone_changer_polisher",
    "code": "#27",
    "name": "Tone Changer (Professional / Friendly / Persuasive)",
    "agentName": "ToneShift",
    "category": "writing_humanizer",
    "headShape": "capsule",
    "antenna": "single-beacon",
    "ears": "capsules",
    "visorShape": "circular-lens",
    "eyeStyle": "bracket",
    "eyeColor": "cyan",
    "mouthStyle": "dash",
    "foreheadAccent": "spark",
    "blinkDuration": 3.6,
    "blinkDelay": -1.18
  },
  "bangla_english_business_translator": {
    "id": "bangla_english_business_translator",
    "code": "#28",
    "name": "Bangla-to-English Business Translator",
    "agentName": "BiLingualPro",
    "category": "writing_humanizer",
    "headShape": "round-rect",
    "antenna": "shield-crest",
    "ears": "headphones",
    "visorShape": "wide-curve",
    "eyeStyle": "circle",
    "eyeColor": "teal",
    "mouthStyle": "wave",
    "foreheadAccent": "circuit",
    "blinkDuration": 4.3,
    "blinkDelay": -2.61
  },
  "long_text_document_summarizer": {
    "id": "long_text_document_summarizer",
    "code": "#29",
    "name": "Long Text & Document Summarizer",
    "agentName": "BriefCore",
    "category": "writing_humanizer",
    "headShape": "squircle",
    "antenna": "dual-tech",
    "ears": "dishes",
    "visorShape": "dual-pod",
    "eyeStyle": "pill",
    "eyeColor": "sky",
    "mouthStyle": "dots",
    "foreheadAccent": "tech-line",
    "blinkDuration": 5,
    "blinkDelay": -4.04
  },
  "storytelling_brand_narrative": {
    "id": "storytelling_brand_narrative",
    "code": "#30",
    "name": "Storytelling & Brand Narrative Writer",
    "agentName": "StoryLoom",
    "category": "writing_humanizer",
    "headShape": "dome",
    "antenna": "quill-pen",
    "ears": "fins",
    "visorShape": "full-visor",
    "eyeStyle": "crescent",
    "eyeColor": "electric-blue",
    "mouthStyle": "smile",
    "foreheadAccent": "dot-matrix",
    "blinkDuration": 5.7,
    "blinkDelay": -5.47
  },
  "press_release_announcement": {
    "id": "press_release_announcement",
    "code": "#31",
    "name": "Press Release & Announcement Writer",
    "agentName": "PressDesk",
    "category": "writing_humanizer",
    "headShape": "pebble",
    "antenna": "single-beacon",
    "ears": "capsules",
    "visorShape": "circular-lens",
    "eyeStyle": "bracket",
    "eyeColor": "cyan",
    "mouthStyle": "dash",
    "foreheadAccent": "spark",
    "blinkDuration": 3.7,
    "blinkDelay": -1.51
  },
  "cold_email_b2b_outreach": {
    "id": "cold_email_b2b_outreach",
    "code": "#32",
    "name": "Cold Email & B2B Outreach Writer",
    "agentName": "OutreachSniper",
    "category": "writing_humanizer",
    "headShape": "capsule",
    "antenna": "shield-crest",
    "ears": "headphones",
    "visorShape": "wide-curve",
    "eyeStyle": "circle",
    "eyeColor": "teal",
    "mouthStyle": "wave",
    "foreheadAccent": "circuit",
    "blinkDuration": 4.4,
    "blinkDelay": -2.94
  },
  "speech_presentation_scriptwriter": {
    "id": "speech_presentation_scriptwriter",
    "code": "#33",
    "name": "Speech & Presentation Scriptwriter",
    "agentName": "StageVoice",
    "category": "writing_humanizer",
    "headShape": "round-rect",
    "antenna": "dual-tech",
    "ears": "dishes",
    "visorShape": "dual-pod",
    "eyeStyle": "pill",
    "eyeColor": "sky",
    "mouthStyle": "dots",
    "foreheadAccent": "tech-line",
    "blinkDuration": 5.1,
    "blinkDelay": -4.37
  },
  "ai_commercial_image_generator": {
    "id": "ai_commercial_image_generator",
    "code": "#34",
    "name": "AI Commercial Image Generator",
    "agentName": "PixelForge",
    "category": "image_design",
    "headShape": "hexagon",
    "antenna": "camera-lens",
    "ears": "dishes",
    "visorShape": "circular-lens",
    "eyeStyle": "concentric",
    "eyeColor": "cyan",
    "mouthStyle": "dots",
    "foreheadAccent": "gem",
    "blinkDuration": 5.8,
    "blinkDelay": -0.41
  },
  "ai_business_logo_generator": {
    "id": "ai_business_logo_generator",
    "code": "#35",
    "name": "AI Business Logo Generator",
    "agentName": "LogoCraft",
    "category": "image_design",
    "headShape": "pebble",
    "antenna": "star-crest",
    "ears": "circuits",
    "visorShape": "hex-screen",
    "eyeStyle": "star",
    "eyeColor": "electric-blue",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 3.8,
    "blinkDelay": -1.84
  },
  "product_photography_mockup": {
    "id": "product_photography_mockup",
    "code": "#36",
    "name": "Product Photography & Mockup Scene Maker",
    "agentName": "StudioLens",
    "category": "image_design",
    "headShape": "squircle",
    "antenna": "dual-tech",
    "ears": "leds",
    "visorShape": "wide-curve",
    "eyeStyle": "concentric",
    "eyeColor": "electric-blue",
    "mouthStyle": "dash",
    "foreheadAccent": "tech-line",
    "blinkDuration": 4.5,
    "blinkDelay": -3.27
  },
  "youtube_fb_thumbnail_designer": {
    "id": "youtube_fb_thumbnail_designer",
    "code": "#37",
    "name": "YouTube & Facebook Thumbnail Designer",
    "agentName": "ThumbMagnet",
    "category": "image_design",
    "headShape": "wide-monitor",
    "antenna": "target-crosshair",
    "ears": "bolts",
    "visorShape": "circular-lens",
    "eyeStyle": "star",
    "eyeColor": "sky",
    "mouthStyle": "wave",
    "foreheadAccent": "gem",
    "blinkDuration": 5.2,
    "blinkDelay": -4.7
  },
  "social_poster_ad_banner": {
    "id": "social_poster_ad_banner",
    "code": "#38",
    "name": "Social Media Poster & Ad Banner Creator",
    "agentName": "PosterLab",
    "category": "image_design",
    "headShape": "round-rect",
    "antenna": "camera-lens",
    "ears": "headphones",
    "visorShape": "hex-screen",
    "eyeStyle": "circle",
    "eyeColor": "cyan",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 5.9,
    "blinkDelay": -0.74
  },
  "brand_color_typography_guide": {
    "id": "brand_color_typography_guide",
    "code": "#39",
    "name": "Brand Color Palette & Typography Guide",
    "agentName": "ChromaGuide",
    "category": "image_design",
    "headShape": "pebble",
    "antenna": "star-crest",
    "ears": "dishes",
    "visorShape": "full-visor",
    "eyeStyle": "matrix-dot",
    "eyeColor": "electric-blue",
    "mouthStyle": "dots",
    "foreheadAccent": "target",
    "blinkDuration": 3.9,
    "blinkDelay": -2.17
  },
  "midjourney_flux_prompt_engineer": {
    "id": "midjourney_flux_prompt_engineer",
    "code": "#40",
    "name": "Midjourney / Flux Pro Prompt Engineer",
    "agentName": "PromptLens",
    "category": "image_design",
    "headShape": "hexagon",
    "antenna": "lightbulb",
    "ears": "circuits",
    "visorShape": "wide-curve",
    "eyeStyle": "pill",
    "eyeColor": "sky",
    "mouthStyle": "dash",
    "foreheadAccent": "tech-line",
    "blinkDuration": 4.6,
    "blinkDelay": -3.6
  },
  "packaging_label_design_ideator": {
    "id": "packaging_label_design_ideator",
    "code": "#41",
    "name": "Packaging & Label Design Ideator",
    "agentName": "PackStudio",
    "category": "image_design",
    "headShape": "squircle",
    "antenna": "dual-tech",
    "ears": "leds",
    "visorShape": "circular-lens",
    "eyeStyle": "concentric",
    "eyeColor": "cyan",
    "mouthStyle": "wave",
    "foreheadAccent": "gem",
    "blinkDuration": 5.3,
    "blinkDelay": -5.03
  },
  "seo_keyword_research_finder": {
    "id": "seo_keyword_research_finder",
    "code": "#42",
    "name": "SEO Keyword Research & Low-Comp Finder",
    "agentName": "RankScout",
    "category": "seo_traffic",
    "headShape": "wide-monitor",
    "antenna": "radar-dish",
    "ears": "leds",
    "visorShape": "matrix-strip",
    "eyeStyle": "bracket",
    "eyeColor": "cyan",
    "mouthStyle": "dash",
    "foreheadAccent": "tech-line",
    "blinkDuration": 6,
    "blinkDelay": -1.07
  },
  "seo_blog_article_writer": {
    "id": "seo_blog_article_writer",
    "code": "#43",
    "name": "SEO-Optimized Blog & Article Writer",
    "agentName": "ArticleRank",
    "category": "seo_traffic",
    "headShape": "shield",
    "antenna": "radar-dish",
    "ears": "bolts",
    "visorShape": "full-visor",
    "eyeStyle": "concentric",
    "eyeColor": "sky",
    "mouthStyle": "dots",
    "foreheadAccent": "dot-matrix",
    "blinkDuration": 4,
    "blinkDelay": -2.5
  },
  "onpage_seo_meta_generator": {
    "id": "onpage_seo_meta_generator",
    "code": "#44",
    "name": "On-Page SEO & Meta Tag Generator",
    "agentName": "MetaOptima",
    "category": "seo_traffic",
    "headShape": "squircle",
    "antenna": "chart-bars",
    "ears": "leds",
    "visorShape": "dual-pod",
    "eyeStyle": "matrix-dot",
    "eyeColor": "electric-blue",
    "mouthStyle": "grill",
    "foreheadAccent": "target",
    "blinkDuration": 4.7,
    "blinkDelay": -3.93
  },
  "ecommerce_product_description_seo": {
    "id": "ecommerce_product_description_seo",
    "code": "#45",
    "name": "E-Commerce Product Description SEO",
    "agentName": "ShopRank",
    "category": "seo_traffic",
    "headShape": "wide-monitor",
    "antenna": "single-beacon",
    "ears": "circuits",
    "visorShape": "matrix-strip",
    "eyeStyle": "pill",
    "eyeColor": "cyan",
    "mouthStyle": "smile",
    "foreheadAccent": "tech-line",
    "blinkDuration": 5.4,
    "blinkDelay": -5.36
  },
  "local_seo_gmb_optimizer": {
    "id": "local_seo_gmb_optimizer",
    "code": "#46",
    "name": "Local SEO & Google My Business Optimizer",
    "agentName": "LocalRank",
    "category": "seo_traffic",
    "headShape": "hexagon",
    "antenna": "target-crosshair",
    "ears": "fins",
    "visorShape": "hex-screen",
    "eyeStyle": "bracket",
    "eyeColor": "sky",
    "mouthStyle": "dash",
    "foreheadAccent": "circuit",
    "blinkDuration": 6.1,
    "blinkDelay": -1.4
  },
  "faq_schema_markup_generator": {
    "id": "faq_schema_markup_generator",
    "code": "#47",
    "name": "FAQ & Schema Markup Generator",
    "agentName": "SchemaBot",
    "category": "seo_traffic",
    "headShape": "capsule",
    "antenna": "dual-tech",
    "ears": "dishes",
    "visorShape": "full-visor",
    "eyeStyle": "visor-beam",
    "eyeColor": "electric-blue",
    "mouthStyle": "dots",
    "foreheadAccent": "dot-matrix",
    "blinkDuration": 4.1,
    "blinkDelay": -2.83
  },
  "backlink_outreach_guest_post": {
    "id": "backlink_outreach_guest_post",
    "code": "#48",
    "name": "Backlink Outreach & Guest Post Pitcher",
    "agentName": "LinkPitch",
    "category": "seo_traffic",
    "headShape": "shield",
    "antenna": "radar-dish",
    "ears": "bolts",
    "visorShape": "dual-pod",
    "eyeStyle": "concentric",
    "eyeColor": "cyan",
    "mouthStyle": "grill",
    "foreheadAccent": "target",
    "blinkDuration": 4.8,
    "blinkDelay": -4.26
  },
  "content_gap_topic_cluster": {
    "id": "content_gap_topic_cluster",
    "code": "#49",
    "name": "Content Gap & Topic Cluster Planner",
    "agentName": "ClusterMap",
    "category": "seo_traffic",
    "headShape": "squircle",
    "antenna": "chart-bars",
    "ears": "leds",
    "visorShape": "matrix-strip",
    "eyeStyle": "matrix-dot",
    "eyeColor": "sky",
    "mouthStyle": "smile",
    "foreheadAccent": "tech-line",
    "blinkDuration": 5.5,
    "blinkDelay": -0.3
  },
  "youtube_video_seo_optimizer": {
    "id": "youtube_video_seo_optimizer",
    "code": "#50",
    "name": "YouTube Video SEO Tags & Description",
    "agentName": "VidRanker",
    "category": "seo_traffic",
    "headShape": "wide-monitor",
    "antenna": "single-beacon",
    "ears": "circuits",
    "visorShape": "hex-screen",
    "eyeStyle": "pill",
    "eyeColor": "electric-blue",
    "mouthStyle": "dash",
    "foreheadAccent": "circuit",
    "blinkDuration": 6.2,
    "blinkDelay": -1.73
  },
  "daily_habit_routine_architect": {
      "id": "daily_habit_routine_architect",
      "code": "#51",
      "name": "Daily Habit & Routine Architect",
      "agentName": "HabitForge",
      "category": "personal_growth",
      "headShape": "squircle",
      "antenna": "bolt-speed",
      "ears": "leds",
      "visorShape": "full-visor",
      "eyeStyle": "visor-beam",
      "eyeColor": "cyan",
      "mouthStyle": "smile",
      "foreheadAccent": "spark",
      "blinkDuration": 4.2,
      "blinkDelay": -3.16
  },
  "deep_work_focus_protocol": {
      "id": "deep_work_focus_protocol",
      "code": "#52",
      "name": "Deep Work & Laser Focus Protocol",
      "agentName": "FocusTitan",
      "category": "personal_growth",
      "headShape": "round-rect",
      "antenna": "target-crosshair",
      "ears": "headphones",
      "visorShape": "dual-pod",
      "eyeStyle": "concentric",
      "eyeColor": "electric-blue",
      "mouthStyle": "dash",
      "foreheadAccent": "target",
      "blinkDuration": 4.9,
      "blinkDelay": -4.59
  },
  "overcoming_procrastination_catalyst": {
      "id": "overcoming_procrastination_catalyst",
      "code": "#53",
      "name": "Overcoming Procrastination & Action Catalyst",
      "agentName": "ActionIgnite",
      "category": "personal_growth",
      "headShape": "capsule",
      "antenna": "single-beacon",
      "ears": "circuits",
      "visorShape": "wide-curve",
      "eyeStyle": "star",
      "eyeColor": "cyan",
      "mouthStyle": "wave",
      "foreheadAccent": "gem",
      "blinkDuration": 5.6,
      "blinkDelay": -0.63
  },
  "stoic_mindset_resilience_guide": {
      "id": "stoic_mindset_resilience_guide",
      "code": "#54",
      "name": "Stoic Mindset & Mental Resilience Guide",
      "agentName": "MindFortress",
      "category": "personal_growth",
      "headShape": "shield",
      "antenna": "shield-crest",
      "ears": "fins",
      "visorShape": "hex-screen",
      "eyeStyle": "circle",
      "eyeColor": "sky",
      "mouthStyle": "dots",
      "foreheadAccent": "tech-line",
      "blinkDuration": 3.6,
      "blinkDelay": -2.06
  },
  "quarterly_goal_sprint_planner": {
      "id": "quarterly_goal_sprint_planner",
      "code": "#55",
      "name": "90-Day Goal & Milestone Sprint Planner",
      "agentName": "GoalCraft",
      "category": "personal_growth",
      "headShape": "wide-monitor",
      "antenna": "chart-bars",
      "ears": "dishes",
      "visorShape": "matrix-strip",
      "eyeStyle": "bracket",
      "eyeColor": "teal",
      "mouthStyle": "grill",
      "foreheadAccent": "bracket",
      "blinkDuration": 4.3,
      "blinkDelay": -3.49
  },
  "mental_models_decision_advisor": {
      "id": "mental_models_decision_advisor",
      "code": "#56",
      "name": "First-Principles & Mental Models Advisor",
      "agentName": "CogniWise",
      "category": "personal_growth",
      "headShape": "pebble",
      "antenna": "lightbulb",
      "ears": "audio",
      "visorShape": "full-visor",
      "eyeStyle": "pill",
      "eyeColor": "electric-blue",
      "mouthStyle": "smile",
      "foreheadAccent": "circuit",
      "blinkDuration": 5,
      "blinkDelay": -4.92
  },
  "rapid_skill_accelerated_learning": {
      "id": "rapid_skill_accelerated_learning",
      "code": "#57",
      "name": "Rapid Skill Acquisition & Fast Learning Master",
      "agentName": "UltraLearn",
      "category": "personal_growth",
      "headShape": "squircle",
      "antenna": "radar-dish",
      "ears": "capsules",
      "visorShape": "circular-lens",
      "eyeStyle": "matrix-dot",
      "eyeColor": "cyan",
      "mouthStyle": "dash",
      "foreheadAccent": "code",
      "blinkDuration": 5.7,
      "blinkDelay": -0.96
  },
  "public_speaking_voice_coach": {
      "id": "public_speaking_voice_coach",
      "code": "#58",
      "name": "High-Impact Public Speaking & Voice Coach",
      "agentName": "VoiceMaster",
      "category": "personal_growth",
      "headShape": "dome",
      "antenna": "star-crest",
      "ears": "audio",
      "visorShape": "wide-curve",
      "eyeStyle": "crescent",
      "eyeColor": "cyan",
      "mouthStyle": "smile",
      "foreheadAccent": "wave",
      "blinkDuration": 3.7,
      "blinkDelay": -2.39
  },
  "emotional_intelligence_boundary": {
      "id": "emotional_intelligence_boundary",
      "code": "#59",
      "name": "Emotional Intelligence & Boundary Setter",
      "agentName": "EmpathyPro",
      "category": "personal_growth",
      "headShape": "capsule",
      "antenna": "quill-pen",
      "ears": "headphones",
      "visorShape": "dual-pod",
      "eyeStyle": "circle",
      "eyeColor": "teal",
      "mouthStyle": "dots",
      "foreheadAccent": "gem",
      "blinkDuration": 4.4,
      "blinkDelay": -3.82
  },
  "peak_energy_bio_rhythm_protocol": {
      "id": "peak_energy_bio_rhythm_protocol",
      "code": "#60",
      "name": "Peak Energy, Sleep & Bio-Rhythm Protocol",
      "agentName": "BioVitality",
      "category": "personal_growth",
      "headShape": "round-rect",
      "antenna": "bolt-speed",
      "ears": "leds",
      "visorShape": "full-visor",
      "eyeStyle": "star",
      "eyeColor": "cyan",
      "mouthStyle": "wave",
      "foreheadAccent": "spark",
      "blinkDuration": 5.1,
      "blinkDelay": -5.25
  },
  "wealth_mindset_budget_planner": {
      "id": "wealth_mindset_budget_planner",
      "code": "#61",
      "name": "Personal Wealth Mindset & Budget Planner",
      "agentName": "WealthMind",
      "category": "personal_growth",
      "headShape": "shield",
      "antenna": "star-crest",
      "ears": "circuits",
      "visorShape": "hex-screen",
      "eyeStyle": "concentric",
      "eyeColor": "electric-blue",
      "mouthStyle": "dash",
      "foreheadAccent": "circuit",
      "blinkDuration": 5.8,
      "blinkDelay": -1.29
  },
  "evening_gratitude_zen_reflection": {
      "id": "evening_gratitude_zen_reflection",
      "code": "#62",
      "name": "Evening Gratitude & Zen Reflection Coach",
      "agentName": "ReflectZen",
      "category": "personal_growth",
      "headShape": "pebble",
      "antenna": "single-beacon",
      "ears": "dishes",
      "visorShape": "circular-lens",
      "eyeStyle": "crescent",
      "eyeColor": "sky",
      "mouthStyle": "smile",
      "foreheadAccent": "gem",
      "blinkDuration": 3.8,
      "blinkDelay": -2.72
  },
  "time_management_planner": {
    "id": "time_management_planner",
    "code": "#63",
    "name": "Time Management & Daily Schedule Planner",
    "agentName": "ChronoExec",
    "category": "business_automation",
    "headShape": "round-rect",
    "antenna": "bolt-speed",
    "ears": "leds",
    "visorShape": "full-visor",
    "eyeStyle": "circle",
    "eyeColor": "cyan",
    "mouthStyle": "smile",
    "foreheadAccent": "spark",
    "blinkDuration": 4.5,
    "blinkDelay": -4.15
  },
  "inbox_sales_objection_handler": {
    "id": "inbox_sales_objection_handler",
    "code": "#64",
    "name": "Inbox Sales & Objection Handler",
    "agentName": "DealCloser",
    "category": "business_automation",
    "headShape": "capsule",
    "antenna": "bolt-speed",
    "ears": "bolts",
    "visorShape": "dual-pod",
    "eyeStyle": "pill",
    "eyeColor": "sky",
    "mouthStyle": "dots",
    "foreheadAccent": "gem",
    "blinkDuration": 5.2,
    "blinkDelay": -5.58
  },
  "angry_customer_retention": {
    "id": "angry_customer_retention",
    "code": "#65",
    "name": "Angry Customer Handling & Retention Bot",
    "agentName": "CalmResolve",
    "category": "business_automation",
    "headShape": "hexagon",
    "antenna": "code-brackets",
    "ears": "circuits",
    "visorShape": "matrix-strip",
    "eyeStyle": "circle",
    "eyeColor": "cyan",
    "mouthStyle": "smile",
    "foreheadAccent": "code",
    "blinkDuration": 5.9,
    "blinkDelay": -1.62
  },
  "excel_sheets_formula_generator": {
    "id": "excel_sheets_formula_generator",
    "code": "#66",
    "name": "Excel & Google Sheets Formula Generator",
    "agentName": "SheetWizard",
    "category": "business_automation",
    "headShape": "wide-monitor",
    "antenna": "chart-bars",
    "ears": "circuits",
    "visorShape": "hex-screen",
    "eyeStyle": "bracket",
    "eyeColor": "electric-blue",
    "mouthStyle": "dash",
    "foreheadAccent": "tech-line",
    "blinkDuration": 3.9,
    "blinkDelay": -3.05
  },
  "profit_margin_pricing_calculator": {
    "id": "profit_margin_pricing_calculator",
    "code": "#67",
    "name": "Business Profit Margin & Pricing Calculator",
    "agentName": "MarginPro",
    "category": "business_automation",
    "headShape": "shield",
    "antenna": "lightbulb",
    "ears": "fins",
    "visorShape": "full-visor",
    "eyeStyle": "matrix-dot",
    "eyeColor": "sky",
    "mouthStyle": "dash",
    "foreheadAccent": "tech-line",
    "blinkDuration": 4.6,
    "blinkDelay": -4.48
  },
  "sop_creator": {
    "id": "sop_creator",
    "code": "#68",
    "name": "SOP Standard Operating Procedure Creator",
    "agentName": "SystemFlow",
    "category": "business_automation",
    "headShape": "round-rect",
    "antenna": "radar-dish",
    "ears": "audio",
    "visorShape": "dual-pod",
    "eyeStyle": "bracket",
    "eyeColor": "cyan",
    "mouthStyle": "dots",
    "foreheadAccent": "gem",
    "blinkDuration": 5.3,
    "blinkDelay": -0.52
  },
  "meeting_notes_action_converter": {
    "id": "meeting_notes_action_converter",
    "code": "#69",
    "name": "Meeting Notes to Action Plan Converter",
    "agentName": "BriefSync",
    "category": "business_automation",
    "headShape": "capsule",
    "antenna": "shield-crest",
    "ears": "bolts",
    "visorShape": "matrix-strip",
    "eyeStyle": "pill",
    "eyeColor": "electric-blue",
    "mouthStyle": "smile",
    "foreheadAccent": "code",
    "blinkDuration": 6,
    "blinkDelay": -1.95
  },
  "business_name_domain_generator": {
    "id": "business_name_domain_generator",
    "code": "#70",
    "name": "Business Name & Domain Idea Generator",
    "agentName": "NameCraft",
    "category": "business_automation",
    "headShape": "hexagon",
    "antenna": "bolt-speed",
    "ears": "circuits",
    "visorShape": "hex-screen",
    "eyeStyle": "circle",
    "eyeColor": "sky",
    "mouthStyle": "grill",
    "foreheadAccent": "circuit",
    "blinkDuration": 4,
    "blinkDelay": -3.38
  },
  "invoice_payment_followup": {
    "id": "invoice_payment_followup",
    "code": "#71",
    "name": "Invoice Reminder & Payment Follow-up Bot",
    "agentName": "PayPulse",
    "category": "business_automation",
    "headShape": "wide-monitor",
    "antenna": "code-brackets",
    "ears": "leds",
    "visorShape": "full-visor",
    "eyeStyle": "visor-beam",
    "eyeColor": "cyan",
    "mouthStyle": "dash",
    "foreheadAccent": "tech-line",
    "blinkDuration": 4.7,
    "blinkDelay": -4.81
  },
  "hr_job_circular_interview": {
    "id": "hr_job_circular_interview",
    "code": "#72",
    "name": "HR Job Circular & Interview Question Maker",
    "agentName": "TalentScout",
    "category": "business_automation",
    "headShape": "shield",
    "antenna": "chart-bars",
    "ears": "fins",
    "visorShape": "dual-pod",
    "eyeStyle": "matrix-dot",
    "eyeColor": "electric-blue",
    "mouthStyle": "dots",
    "foreheadAccent": "gem",
    "blinkDuration": 5.4,
    "blinkDelay": -0.85
  },
  "business_idea_swot_validator": {
    "id": "business_idea_swot_validator",
    "code": "#73",
    "name": "Business Idea Validator & Competitor SWOT",
    "agentName": "VentureLens",
    "category": "business_automation",
    "headShape": "round-rect",
    "antenna": "lightbulb",
    "ears": "audio",
    "visorShape": "matrix-strip",
    "eyeStyle": "bracket",
    "eyeColor": "sky",
    "mouthStyle": "smile",
    "foreheadAccent": "code",
    "blinkDuration": 6.1,
    "blinkDelay": -2.28
  },
  "website_code_bug_wordpress_helper": {
    "id": "website_code_bug_wordpress_helper",
    "code": "#74",
    "name": "Website Code/Bug Fix & WordPress Helper",
    "agentName": "DevFixer",
    "category": "business_automation",
    "headShape": "hexagon",
    "antenna": "code-brackets",
    "ears": "bolts",
    "visorShape": "matrix-strip",
    "eyeStyle": "visor-beam",
    "eyeColor": "cyan",
    "mouthStyle": "grill",
    "foreheadAccent": "code",
    "blinkDuration": 4.1,
    "blinkDelay": -3.71
  },
  "weekly_productivity_goal_tracker": {
    "id": "weekly_productivity_goal_tracker",
    "code": "#75",
    "name": "Weekly Productivity & Goal Tracker",
    "agentName": "GoalPulse",
    "category": "business_automation",
    "headShape": "hexagon",
    "antenna": "shield-crest",
    "ears": "circuits",
    "visorShape": "full-visor",
    "eyeStyle": "circle",
    "eyeColor": "electric-blue",
    "mouthStyle": "dash",
    "foreheadAccent": "tech-line",
    "blinkDuration": 4.8,
    "blinkDelay": -5.14
  }
};

/**
 * Deterministic fallback generator for any unknown or future tool IDs.
 * Guarantees a stable identity that never changes on re-render.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

const HEAD_SHAPES: HeadShape[] = [
  'round-rect',
  'squircle',
  'capsule',
  'hexagon',
  'dome',
  'shield',
  'wide-monitor',
  'pebble'
];

const ANTENNAS: AntennaType[] = [
  'radar-dish',
  'single-beacon',
  'dual-tech',
  'quill-pen',
  'camera-lens',
  'code-brackets',
  'wifi-waves',
  'target-crosshair',
  'bolt-speed',
  'chart-bars',
  'lightbulb',
  'star-crest',
  'shield-crest'
];

const EARS: EarType[] = [
  'headphones',
  'bolts',
  'fins',
  'dishes',
  'leds',
  'audio',
  'circuits',
  'capsules'
];

const VISORS: VisorShape[] = [
  'full-visor',
  'dual-pod',
  'wide-curve',
  'hex-screen',
  'matrix-strip',
  'circular-lens'
];

const EYE_STYLES: EyeStyle[] = [
  'pill',
  'circle',
  'crescent',
  'visor-beam',
  'star',
  'bracket',
  'concentric',
  'matrix-dot'
];

const EYE_COLORS: EyeColor[] = ['cyan', 'electric-blue', 'sky', 'teal'];
const MOUTHS: MouthStyle[] = ['smile', 'wave', 'dots', 'grill', 'dash'];
const ACCENTS: ForeheadAccent[] = [
  'gem',
  'tech-line',
  'dot-matrix',
  'target',
  'bracket',
  'code',
  'spark',
  'wave',
  'circuit'
];

export function getRobotConfig(toolId: string): RobotConfig {
  if (ROBOT_CONFIGS[toolId]) {
    return ROBOT_CONFIGS[toolId];
  }

  const tool = TOOLS.find((t) => t.id === toolId);
  const isCeo = toolId === AI_CEO_PROFILE.id || toolId === 'ceo';
  const realCode = isCeo ? AI_CEO_PROFILE.code : (tool?.code ?? '#AI');
  const realName = isCeo ? AI_CEO_PROFILE.name : (tool?.name ?? 'AI Specialist');
  const realAgentName = isCeo ? AI_CEO_PROFILE.shortName : (tool?.agentName ?? 'EzboBot');
  const realCategory = isCeo ? 'ceo' : (tool?.category ?? 'general');

  const h = hashString(toolId);
  return {
    id: toolId,
    code: realCode,
    name: realName,
    agentName: realAgentName,
    category: realCategory,
    headShape: HEAD_SHAPES[h % HEAD_SHAPES.length],
    antenna: ANTENNAS[(h >> 2) % ANTENNAS.length],
    ears: EARS[(h >> 4) % EARS.length],
    visorShape: VISORS[(h >> 6) % VISORS.length],
    eyeStyle: EYE_STYLES[(h >> 8) % EYE_STYLES.length],
    eyeColor: EYE_COLORS[(h >> 10) % EYE_COLORS.length],
    mouthStyle: MOUTHS[(h >> 12) % MOUTHS.length],
    foreheadAccent: ACCENTS[(h >> 14) % ACCENTS.length],
    blinkDuration: parseFloat((3.8 + (h % 20) * 0.1).toFixed(2)),
    blinkDelay: parseFloat((-0.5 - (h % 40) * 0.1).toFixed(2))
  };
}
