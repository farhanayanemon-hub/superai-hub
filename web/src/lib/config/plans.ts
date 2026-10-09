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
    description: 'For freelancers, developers, and power users who want to connect their own API keys with unlimited engine switching and zero token markups.',
    monthlyPrice: 499,
    yearlyMonthlyPrice: 399,
    yearlyTotal: 4790,
    features: [
      'Universal Multi-API Key Vault (Gemini, ChatGPT, Grok, DeepSeek, OpenRouter & Replicate)',
      'All 50+ Specialized AI Executives & Neural Brain Router',
      'Live model switcher (use different APIs for different tasks)',
      'Zero token markups — direct provider billing',
      'Free 1,500 daily requests via Google Gemini Free Key',
      'Personal WhatsApp self-assistant integration',
      'Executive Web Console & image generation (/image)',
      'Standard technical support'
    ]
  },
  managed: {
    id: 'managed',
    name: 'All-Inclusive Cloud',
    badge: '100% Managed Cloud',
    highlightBadge: '⚡ Zero Setup • Most Popular',
    description: 'For business owners and executives who want 100% plug & play AI. No API keys or technical setup required — ready instantly.',
    monthlyPrice: 1499,
    yearlyMonthlyPrice: 1199,
    yearlyTotal: 14390,
    features: [
      'ZERO API Keys Required — 100% platform managed',
      'Platform-managed high-speed AI cluster (Gemini 2.0 Flash & GPT-4o)',
      'Immediate plug-and-play access upon signup',
      'All 50+ Specialized AI Executives & Neural Brain Router',
      'Priority WhatsApp multi-device sync',
      '5,000 fast-lane requests / month',
      'Executive Web Console & image generation (/image)',
      'Dedicated VIP WhatsApp concierge & 24/7 priority support'
    ]
  }
};

export function getPlanPrice(
  plans: PlansSettings,
  planId: string,
  interval: 'monthly' | 'yearly'
): number {
  const normalizedId = (planId === 'managed' || planId === 'complete') ? 'managed' : 'byok';
  const plan = plans[normalizedId] || DEFAULT_PLANS[normalizedId];
  return interval === 'yearly' ? plan.yearlyTotal : plan.monthlyPrice;
}
