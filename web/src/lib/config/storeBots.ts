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

// Demo bots removed per user instruction. Custom store bots will be added as requested.
export const STORE_BOTS: StoreBot[] = [];

export const STORE_CATEGORIES = [
  { id: 'all', label: 'All AI Specialists' },
  { id: 'sales', label: 'Sales & Negotiation' },
  { id: 'content', label: 'Content & Advertising' },
  { id: 'legal', label: 'Legal & Risk' },
  { id: 'seo', label: 'SEO & Growth' },
  { id: 'technical', label: 'Engineering' }
] as const;
