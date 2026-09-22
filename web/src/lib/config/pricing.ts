export interface PricingPlan {
  id: 'monthly' | 'yearly';
  name: string;
  nameBn: string;
  price: number;
  periodBn: string;
  originalPrice?: number;
  discountBadge?: string;
  renewalNotice?: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
}

export const PRICING_PLANS: Record<'monthly' | 'yearly', PricingPlan> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Pro',
    nameBn: 'Monthly Pro',
    price: 499,
    periodBn: '/ month',
    description: 'The ultimate starter plan for small businesses, content creators, and professionals.',
    features: [
      '50+ All-in-One Specialized AI Tools',
      'Personal WhatsApp AI Assistant (Self-Chat)',
      'Free Gemini API Key (BYOK) - Zero Token Limit',
      'E-Commerce Sales Copy & Objection Closer',
      'Direct WhatsApp Image Generation via Flux / Pollinations',
      'Crystal-Clear English & Multilingual Generation',
      'Mobile & Desktop Optimized Live Dashboard',
      '24/7 Community & Dedicated Support'
    ],
    popular: false,
    ctaText: 'Get Started with Monthly'
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly VIP (Launch Special)',
    nameBn: 'Yearly VIP Special',
    price: 1499,
    originalPrice: 5988,
    periodBn: '/ 1st year',
    discountBadge: '75% OFF (Limited Time)',
    renewalNotice: 'Renews at standard BDT 2,999/year after the first year',
    description: 'Unlimited access for the whole year. Maximum cost savings and exclusive VIP features!',
    features: [
      'Unlimited Access to All 50+ Premium AI Tools',
      'Unlimited WhatsApp Self-Assistant Conversations',
      'Free Gemini API Key (BYOK) with Zero Extra Platform Fees',
      'Priority Early Access to All Future AI Tools',
      'High-Speed Dedicated Cloud Response Time',
      '3-Day Subscription Grace Period Protection',
      'VIP Priority 1-on-1 Customer Support',
      'Full SuperAI Power at only BDT 125/month'
    ],
    popular: true,
    ctaText: 'Claim 75% OFF 1-Year VIP'
  }
};

export const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', icon: 'bkash', color: '#e2136e' },
  { id: 'nagad', name: 'Nagad', icon: 'nagad', color: '#f7941d' },
  { id: 'rocket', name: 'Rocket', icon: 'rocket', color: '#8c3494' },
  { id: 'card', name: 'Visa / MasterCard', icon: 'credit-card', color: '#1a1f71' }
];
