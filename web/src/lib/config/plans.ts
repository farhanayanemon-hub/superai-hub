export type PlanTierId = 'byok_starter' | 'byok_pro' | 'managed';

export interface PlanFeatureToggles {
  aiCeo: boolean;
  whatsapp: boolean;
  telegram: boolean;
  multiKeyVault: boolean;
  multiModelFailover: boolean;
  commercialImages: boolean;
  customPrompts: boolean;
  prioritySupport: boolean;
  allHelpersEnabled: boolean;
  enabledHelpers: string[];
  allToolsEnabled: boolean;
  enabledTools: string[];
}

export interface PlanConfig {
  id: PlanTierId;
  name: string;
  badge: string;
  highlightBadge?: string;
  description: string;
  monthlyPrice: number;
  yearlyMonthlyPrice: number;
  yearlyTotal: number;
  features: string[];
  featureToggles: PlanFeatureToggles;
  isEnabled?: boolean;
}

export interface PlansSettings {
  byok_starter: PlanConfig;
  byok_pro: PlanConfig;
  managed: PlanConfig;
  byok: PlanConfig; // backward-compatible alias to byok_starter
}

const DEFAULT_BYOK_STARTER: PlanConfig = {
  id: 'byok_starter',
  name: 'Starter Plan',
  badge: 'Essential Starter',
  highlightBadge: '',
  description:
    'For freelancers, marketers, and solo creators. Run-only access to all 75 pre-built agent workflows, 100+ tool connectors, and tier-guarded Master AI CEO.',
  monthlyPrice: 499,
  yearlyMonthlyPrice: 399,
  yearlyTotal: 4790,
  features: [
    '1 Master AI CEO + All 75+ Specialized Business & Freelancer AI Helpers (#01–#75)',
    'Run-Only Access to 75 Readymade Agent Workflows',
    'Full Access to 100+ Enterprise Tool Connectors',
    'Control AI CEO & All 75 Helpers via Web, WhatsApp & Telegram',
    '1 Active API Key per Provider (Gemini, ChatGPT, Grok, DeepSeek, OpenRouter & Replicate)',
    'Zero Token Markups — Direct Provider Billing (1,500/day FREE via Google Gemini Key)',
    'Commercial Image & Logo Generation (#34 & #35)',
    'Standard Technical Support'
  ],
  featureToggles: {
    aiCeo: true,
    whatsapp: true,
    telegram: true,
    multiKeyVault: false,
    multiModelFailover: false,
    commercialImages: true,
    customPrompts: true,
    prioritySupport: false,
    allHelpersEnabled: true,
    enabledHelpers: [],
    allToolsEnabled: true,
    enabledTools: []
  },
  isEnabled: true
};

const DEFAULT_BYOK_PRO: PlanConfig = {
  id: 'byok_pro',
  name: 'Pro Plan',
  badge: 'Power Automation',
  highlightBadge: '⚡ Power User Choice',
  description:
    'For power users, agencies, and marketers who want visual workflow editing, custom agent building, and multi-key failover.',
  monthlyPrice: 899,
  yearlyMonthlyPrice: 719,
  yearlyTotal: 8690,
  features: [
    'Everything in Starter Plan, PLUS:',
    'Visual Workflow Studio with Node Graph Canvas & Curved Cables',
    'Full Workflow Customization & Node Editing',
    'Unlimited Custom Agent Builder with Dedicated Frameworks',
    'Unrestricted Master AI CEO with Executive Workflow Authority',
    'Universal Multi-Key Vault with Round-Robin Rotation & Auto-Failover',
    'OpenRouter Multi-Model Failover Chains & Free Auto-Rotation',
    'Priority WhatsApp & Email Support'
  ],
  featureToggles: {
    aiCeo: true,
    whatsapp: true,
    telegram: true,
    multiKeyVault: true,
    multiModelFailover: true,
    commercialImages: true,
    customPrompts: true,
    prioritySupport: true,
    allHelpersEnabled: true,
    enabledHelpers: [],
    allToolsEnabled: true,
    enabledTools: []
  },
  isEnabled: true
};

const DEFAULT_MANAGED: PlanConfig = {
  id: 'managed',
  name: 'All-Inclusive Cloud',
  badge: '100% Managed Cloud',
  highlightBadge: '⚡ Zero Setup • Most Popular',
  description:
    'For business owners and executives who want 100% plug & play AI. No API keys or technical setup required — ready instantly.',
  monthlyPrice: 1499,
  yearlyMonthlyPrice: 1199,
  yearlyTotal: 14390,
  features: [
    'ZERO API Keys Required — 100% platform managed cloud',
    '1 Master AI CEO + All 75+ Specialized Business & Freelancer AI Helpers (#01–#75)',
    'Regularly Added New AI Helpers Included FREE in 1 Subscription',
    'Control AI CEO & All 75 Helpers via Web, WhatsApp & Telegram',
    'Platform-managed high-speed AI cluster (Gemini 2.0 Flash & GPT-4o)',
    '5,000 fast-lane requests / month + Commercial Image & Logo Generation',
    'Custom Studio Options + Interactive Chat for every AI Helper',
    'Dedicated VIP WhatsApp concierge & 24/7 priority support'
  ],
  featureToggles: {
    aiCeo: true,
    whatsapp: true,
    telegram: true,
    multiKeyVault: false,
    multiModelFailover: true,
    commercialImages: true,
    customPrompts: true,
    prioritySupport: true,
    allHelpersEnabled: true,
    enabledHelpers: [],
    allToolsEnabled: true,
    enabledTools: []
  },
  isEnabled: false
};

export const DEFAULT_PLANS: PlansSettings = {
  byok_starter: DEFAULT_BYOK_STARTER,
  byok_pro: DEFAULT_BYOK_PRO,
  managed: DEFAULT_MANAGED,
  byok: DEFAULT_BYOK_STARTER
};

export function getPlanPrice(
  plans: PlansSettings,
  planId: string,
  interval: 'monthly' | 'yearly' = 'monthly'
): number {
  if (!plans) plans = DEFAULT_PLANS;
  let resolved: PlanConfig | undefined;

  switch (planId) {
    case 'byok_pro':
      resolved = plans.byok_pro || DEFAULT_PLANS.byok_pro;
      break;
    case 'managed':
    case 'complete':
      resolved = plans.managed || DEFAULT_PLANS.managed;
      break;
    case 'byok_starter':
    case 'byok':
    case 'pro':
    case 'ultra':
      resolved = plans.byok_starter || plans.byok || DEFAULT_PLANS.byok_starter;
      break;
    default:
      resolved = (plans as any)?.[planId] || plans.byok_starter || plans.byok || DEFAULT_PLANS.byok_starter;
      break;
  }

  if (!resolved) {
    resolved = DEFAULT_PLANS.byok_starter;
  }

  return interval === 'yearly' ? resolved.yearlyTotal : resolved.monthlyPrice;
}
