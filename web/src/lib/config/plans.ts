export interface PlanConfig {
  id: 'byok' | 'managed';
  name: string;
  badge: string;
  highlightBadge?: string;
  description: string;
  monthlyPrice: number;
  yearlyMonthlyPrice: number;
  yearlyTotal: number;
  features: string[];
}

export interface PlansSettings {
  byok: PlanConfig;
  managed: PlanConfig;
}

export const DEFAULT_PLANS: PlansSettings = {
  byok: {
    id: 'byok',
    name: 'BYOK Multi-Engine',
    badge: 'Bring Your Own Key',
    highlightBadge: '',
    description:
      'For freelancers, marketers, and business owners who want to connect their own API keys with unlimited engine switching and zero token markups.',
    monthlyPrice: 499,
    yearlyMonthlyPrice: 399,
    yearlyTotal: 4790,
    features: [
      '1 Master AI CEO + All 75+ Specialized Business & Freelancer AI Helpers (#01–#75)',
      'Regularly Added New AI Helpers Included FREE in 1 Subscription',
      'Control AI CEO & All 75 Helpers via Web, WhatsApp & Telegram',
      'Universal Multi-API Key Vault (Gemini, ChatGPT, Grok, DeepSeek, OpenRouter & Replicate)',
      'Zero token markups — direct provider billing (1,500/day FREE via Google Gemini Key)',
      'Custom Studio Options + Interactive Chat for every AI Helper',
      'Commercial Image & Logo Generation (#34 & #35)',
      'Standard technical support'
    ]
  },
  managed: {
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
    ]
  }
};

export function getPlanPrice(
  plans: PlansSettings,
  planId: string,
  interval: 'monthly' | 'yearly'
): number {
  const normalizedId = planId === 'managed' || planId === 'complete' ? 'managed' : 'byok';
  const plan = plans[normalizedId] || DEFAULT_PLANS[normalizedId];
  return interval === 'yearly' ? plan.yearlyTotal : plan.monthlyPrice;
}
