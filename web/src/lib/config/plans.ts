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
}

export interface PlansSettings {
  byok_starter: PlanConfig;
  byok_pro: PlanConfig;
  managed: PlanConfig;
  byok: PlanConfig; // backward-compatible alias to byok_starter
}

const DEFAULT_BYOK_STARTER: PlanConfig = {
  id: 'byok_starter',
  name: 'BYOK Starter',
  badge: 'Essential BYOK',
  highlightBadge: '',
  description:
    'For freelancers, marketers, and solo creators starting with their own API keys. Single key per provider with zero token markups.',
  monthlyPrice: 499,
  yearlyMonthlyPrice: 399,
  yearlyTotal: 4790,
  features: [
    '1 Master AI CEO + All 75+ Specialized Business & Freelancer AI Helpers (#01–#75)',
    'Regularly Added New AI Helpers Included FREE in 1 Subscription',
    'Control AI CEO & All 75 Helpers via Web, WhatsApp & Telegram',
    '1 Active API Key per Provider (Gemini, ChatGPT, Grok, DeepSeek, OpenRouter & Replicate)',
    'Zero token markups — direct provider billing (1,500/day FREE via Google Gemini Key)',
    'Custom Studio Options + Interactive Chat for every AI Helper',
    'Commercial Image & Logo Generation (#34 & #35)',
    'Standard technical support'
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
    enabledHelpers: []
  }
};

const DEFAULT_BYOK_PRO: PlanConfig = {
  id: 'byok_pro',
  name: 'BYOK Pro',
  badge: 'Power Multi-Engine',
  highlightBadge: '⚡ Power User Choice',
  description:
    'For power users, agencies, and marketers who want unlimited multi-key round-robin failover, OpenRouter model chains, and zero downtime.',
  monthlyPrice: 899,
  yearlyMonthlyPrice: 719,
  yearlyTotal: 8690,
  features: [
    'Everything in BYOK Starter, PLUS:',
    'Universal Multi-Key Vault with Round-Robin Rotation & Auto-Failover',
    'OpenRouter Multi-Model Failover Chains & Free Auto-Rotation',
    'High-Throughput Concurrency for Teams & Automation Workflows',
    'Custom Master CEO System Prompts & Industry Presets',
    'Commercial Image & Logo Generation with Priority Render Queue',
    'Priority WhatsApp & Email Support',
    'Early Access to Newly Released AI Specialist Helpers'
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
    enabledHelpers: []
  }
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
    enabledHelpers: []
  }
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
