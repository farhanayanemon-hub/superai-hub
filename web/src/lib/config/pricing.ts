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
    nameBn: 'মাসিক প্ল্যান',
    price: 499,
    periodBn: '/ মাস',
    description: 'ছোট ব্যবসা, কন্টেন্ট ক্রিয়েটর এবং প্রফেশনালদের জন্য সেরা স্টার্টার প্ল্যান।',
    features: [
      '৫০+ অল-ইন-ওয়ান স্পেশালাইজড AI টুলস',
      'নিজস্ব WhatsApp পার্সোনাল AI অ্যাসিস্ট্যান্ট',
      'ফ্রি Gemini API Key (BYOK) - কোনো টোকেন লিমিট ছাড়া',
      'F-Commerce সেলস কপিরাইটিং ও অবজেকশন হ্যান্ডলার',
      'Pollinations / Flux দিয়ে সরাসরি WhatsApp-এ ইমেজ জেনারেশন',
      'বাংলা ও ইংলিশ উভয় ভাষায় নিখুঁত কনটেন্ট',
      'মোবাইল ও ডেক্সটপ ফ্রেন্ডলি লাইভ ড্যাশবোর্ড',
      '২৪/৭ কমিউনিটি ও চ্যাট সাপোর্ট'
    ],
    popular: false,
    ctaText: 'মাসিক প্ল্যানে শুরু করুন'
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly VIP (Launch Special)',
    nameBn: 'বাৎসরিক স্পেশাল অফার',
    price: 1499,
    originalPrice: 5988,
    periodBn: '/ ১ম বছর',
    discountBadge: '৭৫% ছাড় (সীমিত সময়ের জন্য)',
    renewalNotice: 'প্রথম বছর পর নিয়মিত ৳২,৯৯৯/বছর হিসেবে রিনিউ হবে',
    description: 'পুরো বছরের জন্য আনলিমিটেড অ্যাক্সেস। সবচেয়ে সাশ্রয়ী এবং লাভজনক ডিল!',
    features: [
      'সব ৫০+ প্রিমিয়াম AI টুলসের আনলিমিটেড অ্যাক্সেস',
      'WhatsApp পার্সোনাল বট আনলিমিটেড সেলফ-চ্যাট সাপোর্ট',
      'ফ্রি Gemini API Key (BYOK) দিয়ে কোনো অতিরিক্ত বিল নেই',
      'ভবিষ্যতের সকল নতুন টুলসে প্রায়োরিটি আর্লি অ্যাক্সেস',
      'হাই-স্পিড ডেডিকেটেড সার্ভার রেসপন্স টাইম',
      '৩ দিনের সাবস্ক্রিপশন গ্রেস পিরিয়ড সুরক্ষা',
      'ভিআইপি প্রায়োরিটি ওয়ান-অন-ওয়ান সাপোর্ট',
      'বাৎসরিক মাত্র ৳১২৫/মাস খরচে ফুল পাওয়ার'
    ],
    popular: true,
    ctaText: '৭৫% ছাড়ে ১ বছরের VIP নিন'
  }
};

export const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', icon: 'bkash', color: '#e2136e' },
  { id: 'nagad', name: 'Nagad', icon: 'nagad', color: '#f7941d' },
  { id: 'rocket', name: 'Rocket', icon: 'rocket', color: '#8c3494' },
  { id: 'card', name: 'Visa / MasterCard', icon: 'credit-card', color: '#1a1f71' }
];
