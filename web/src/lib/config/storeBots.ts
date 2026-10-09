export interface StoreBotSpecs {
  engine: string;
  responseTime: string;
  contextWindow: string;
  specialization: string;
}

export interface StoreBot {
  id: string;
  name: string;
  role: string;
  tagline: string;
  description: string;
  avatar: string;
  monthlyPrice: number; // BDT per month
  yearlyPrice: number;  // BDT per year
  category: 'sales' | 'content' | 'legal' | 'seo' | 'finance' | 'technical';
  categoryLabel: string;
  badge?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  specs: StoreBotSpecs;
  features: string[];
}

export const STORE_BOTS: StoreBot[] = [
  {
    id: 'aegis-closer',
    name: 'Aegis-1',
    role: 'Cybernetic Sales Closer & Deal Negotiator',
    tagline: 'Psychology-backed objection obliterator calibrated to high-ticket buyers.',
    description: 'Autonomous negotiation suite that synthesizes objection rebuttals, voice-tone scripts, and high-conversion WhatsApp closing sequences calibrated to buyer behavioral psychology.',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    monthlyPrice: 699,
    yearlyPrice: 5590,
    category: 'sales',
    categoryLabel: 'Sales & Closing',
    badge: 'Best Seller',
    isBestSeller: true,
    specs: {
      engine: 'GPT-4o & Grok-3 Hybrid',
      responseTime: '~420ms',
      contextWindow: '128k Tokens',
      specialization: 'High-Ticket Objection Handling & DM Closing'
    },
    features: [
      'High-ticket objection rebuttal playbook generator',
      'Voice tone & psychological pacing scripts',
      'WhatsApp & Messenger DM closing sequences',
      'Buyer archetype profiling & intent analysis',
      'Autonomous counter-offer & price anchoring matrices'
    ]
  },
  {
    id: 'krono-virality',
    name: 'Krono-X',
    role: '90-Day Viral Short-Form Video Architect',
    tagline: 'Full 90-day Reels, TikTok & Shorts storyboard with CapCut cues.',
    description: 'Designs an entire 90-day viral short-form roadmap with hook-to-conversion scripts, visual B-roll prompts, trending audio blueprints, and high-retention editing cues.',
    avatar: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=400&q=80',
    monthlyPrice: 599,
    yearlyPrice: 4790,
    category: 'content',
    categoryLabel: 'Advertising & Content',
    badge: 'High Viral ROI',
    isNew: true,
    specs: {
      engine: 'Gemini 2.0 Flash + Claude 3.5',
      responseTime: '~380ms',
      contextWindow: '1M Tokens',
      specialization: 'Hook Psychology & Short-Form Storyboarding'
    },
    features: [
      '90-day hook-to-conversion video script calendar',
      'CapCut audio selection & transition prompts',
      'Exact B-roll visual cues & text overlay guides',
      'Pattern interrupt & retention curve optimizer',
      'Multi-platform adapter for TikTok, IG Reels, and YouTube Shorts'
    ]
  },
  {
    id: 'lex-sentinel',
    name: 'Lex-Core',
    role: 'Corporate Legal & Contract Risk Auditor',
    tagline: 'Deep contract review, clause redlines, and liability indemnification.',
    description: 'Scans business contracts, vendor master service agreements, and non-disclosure documents to detect hidden liabilities, generate redline proposals, and produce plain-English executive summaries.',
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80',
    monthlyPrice: 999,
    yearlyPrice: 7990,
    category: 'legal',
    categoryLabel: 'Legal & Risk Audit',
    badge: 'Enterprise Grade',
    specs: {
      engine: 'Claude 3.5 Sonnet Deep',
      responseTime: '~650ms',
      contextWindow: '200k Tokens',
      specialization: 'Contract Liability & Clause Redlining'
    },
    features: [
      'Hidden indemnification & termination liability scanner',
      'Automated clause-by-clause redline generator',
      'Plain-English legal risk exposure executive summary',
      'Vendor & client MSA contract dispute protection',
      'Non-disclosure and IP ownership safeguarding'
    ]
  },
  {
    id: 'vortex-ads',
    name: 'Vortex-Ads',
    role: 'Omnichannel PPC & Ad Creative Synthesizer',
    tagline: 'One prompt produces 50 high-converting ad variations across Meta, Google & TikTok.',
    description: 'Generates 50 performance ad copy variations with headlines, hooks, creative angles, negative keyword filters, and demographic targeting parameters for Meta, Google Ads, and TikTok Ads.',
    avatar: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80',
    monthlyPrice: 649,
    yearlyPrice: 5190,
    category: 'content',
    categoryLabel: 'Advertising & Content',
    badge: 'High Conversion',
    specs: {
      engine: 'GPT-4o Omnimodal',
      responseTime: '~450ms',
      contextWindow: '128k Tokens',
      specialization: 'Multi-Network Paid Ad Performance Copy'
    },
    features: [
      '50 multi-angle ad copy variations in 1 execution',
      'Meta, Google Search, and TikTok format optimization',
      'Negative keyword list & cost-per-click defense builder',
      'High-CTR visual hook suggestions for graphic teams',
      'Direct A/B split-testing matrix with hypotheses'
    ]
  },
  {
    id: 'titan-architect',
    name: 'Titan-Code',
    role: 'Full-Stack Architecture & Security Synthesizer',
    tagline: 'Senior Staff Engineer for microservices, database schemas, and API design.',
    description: 'Produces production-ready software architectures, PostgreSQL schemas, API contracts, TypeScript definitions, and Docker deployment stacks with automated security auditing.',
    avatar: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=400&q=80',
    monthlyPrice: 899,
    yearlyPrice: 7190,
    category: 'technical',
    categoryLabel: 'Engineering & Architecture',
    badge: 'Senior Staff',
    specs: {
      engine: 'Claude 3.5 Sonnet + DeepSeek V3',
      responseTime: '~500ms',
      contextWindow: '200k Tokens',
      specialization: 'Full-Stack System Architecture & API Contracts'
    },
    features: [
      'Complete database schema & Prisma/PostgreSQL migration builder',
      'Microservices architecture & REST/GraphQL API contracts',
      'Security audit checklist (OWASP, SQLi, CSRF defense)',
      'Refactoring playbooks for legacy codebases',
      'Containerization & CI/CD deployment configuration'
    ]
  },
  {
    id: 'silo-dominator',
    name: 'Silo-SEO',
    role: 'Topical Authority & Programmatic SEO Architect',
    tagline: '30,000-word topical cluster blueprints with internal link schemas.',
    description: 'Designs programmatic topical SEO clusters that establish total organic domain dominance, mapping out pillar pages, cluster nodes, internal linking schemas, and schema markup.',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    monthlyPrice: 699,
    yearlyPrice: 5590,
    category: 'seo',
    categoryLabel: 'SEO & Growth',
    badge: 'Dominance Engine',
    specs: {
      engine: 'Gemini 2.0 Flash Deep',
      responseTime: '~390ms',
      contextWindow: '1M Tokens',
      specialization: 'Topical Authority Clusters & Semantic Search'
    },
    features: [
      '30,000-word topical cluster architecture & hierarchy',
      'Internal linking schema & anchor text distribution',
      'Keyword cannibalization prevention matrix',
      'Rich snippet & FAQ JSON-LD schema builder',
      'Competitor search intent gap identifier'
    ]
  }
];

export const STORE_CATEGORIES = [
  { id: 'all', label: 'All AI Specialists' },
  { id: 'sales', label: 'Sales & Negotiation' },
  { id: 'content', label: 'Content & Advertising' },
  { id: 'legal', label: 'Legal & Risk' },
  { id: 'seo', label: 'SEO & Growth' },
  { id: 'technical', label: 'Engineering' }
] as const;
