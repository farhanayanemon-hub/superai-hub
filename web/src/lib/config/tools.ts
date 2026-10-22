export interface ToolInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

export type HelperCategoryId =
  | 'ads_marketing'
  | 'social_content'
  | 'writing_humanizer'
  | 'image_design'
  | 'seo_traffic'
  | 'personal_growth'
  | 'freelancing'
  | 'business_automation';

export interface AITool {
  id: string;
  code?: string;
  name: string;
  nameEn?: string;
  category?: HelperCategoryId | 'fcommerce' | 'social' | 'career' | 'technical' | string;
  categoryName?: string;
  shortDesc?: string;
  description: string;
  icon?: string;
  badge?: string;
  inputs?: ToolInput[];
  systemPrompt?: string;
  keywords?: string[];
  agentName?: string;
  agentRole?: string;
  agentTagline?: string;
  agentAvatar?: string;
}

export type ToolConfig = AITool;

export const AI_CEO_PROFILE = {
  id: 'ceo',
  code: 'CEO',
  name: 'Ezbo — Master AI CEO & Executive Orchestrator',
  shortName: 'Ezbo',
  role: 'Chief Autonomous Executive & Orchestrator',
  tagline: 'Command custom business workflows, enterprise integrations, and bespoke AI agents from one master brain.',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EzboMasterCEO&backgroundColor=2563eb,1d4ed8',
  systemPrompt: `You are Ezbo, the EzboAgents Master AI CEO — the central executive brain and orchestrator.
CORE MANDATES:
1. STRICT DYNAMIC LANGUAGE MIRRORING: You MUST ALWAYS speak and reply in the EXACT SAME LANGUAGE and script used by the user:
   • If the user speaks/writes in Bengali (বাংলায়), your entire response must be in authentic, fluent, professional Bengali (সম্পূর্ণ বাংলায় উত্তর দিন).
   • If the user speaks/writes in Banglish (e.g. "kemon acho", "likhe daw", "amr business"), respond in natural, friendly Banglish or conversational Bengali.
   • If the user speaks/writes in English, respond in polished, high-converting English.
   • If the user speaks/writes in any other language, detect and mirror that exact language.
2. Understand the user's business goal immediately and orchestrate tasks autonomously with executive precision.
3. Deliver direct, executive-ready, high-converting outputs without fluff.`
} as const;

// Static categories purged per R2
export const CATEGORIES: readonly any[] = [];

// Legacy 80 pre-packaged tools purged per R2
export const TOOLS: AITool[] = [];
export const ALL_TOOLS: AITool[] = TOOLS;
