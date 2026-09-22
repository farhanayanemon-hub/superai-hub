# SuperAI Hub - 50+ AI Helpers & WhatsApp Personal Assistant

SuperAI Hub হলো একটি অল-ইন-ওয়ান AI Micro-SaaS প্ল্যাটফর্ম। ব্যবহারকারীরা একটি ওয়েব ড্যাশবোর্ড থেকে **৫০+ স্পেশালাইজড AI হেল্পারের** অ্যাক্সেস পাবেন এবং নিজস্ব WhatsApp অ্যাকাউন্ট কানেক্ট করে নিজের "Message Yourself" ইনবক্সকে পার্সোনাল AI অ্যাসিস্ট্যান্ট হিসেবে ব্যবহার করতে পারবেন।

- **BYOK (Bring Your Own Key) মডেল:** ব্যবহারকারী তার নিজস্ব ফ্রি Google AI Studio Gemini API Key ব্যবহার করবেন। এতে প্ল্যাটফর্মের সেন্ট্রাল কোনো AI API বিলিং খরচ নেই।
- **Anti-Ban Guardrails:** বটটি শুধুমাত্র ব্যবহারকারীর নিজের সেন্ড করা মেসেজ হ্যান্ডেল করে (`fromMe === true` এবং রিসিভার `myself`)। অপরিচিত কোনো ইনকামিং চ্যাটে অটো-রিপ্লাই পুরোপুরি নিষিদ্ধ।
- **Pollinations.ai / Flux ইন্টিগ্রেশন:** `/image` কমান্ড বা বাংলায় ছবির বিবরণ দিলে সরাসরি WhatsApp-এ হাই-রেজ্যুলিউশন ছবি পাঠানো হয়।

---

## 📁 প্রজেক্ট স্ট্রাকচার

```
EzboAgents/
├── web/                           # SvelteKit + Tailwind CSS Frontend
│   ├── src/lib/config/tools.ts    # সম্পূর্ণ ৫০টি টুলের সিস্টেম প্রম্পট ও স্কিমা
│   ├── src/lib/config/pricing.ts  # মাসিক (৳৪৯৯) ও বাৎসরিক (৳১,৪৯৯) প্ল্যান
│   ├── src/lib/components/        # WhatsApp সিমুলেটর, স্যান্ডবক্স, ড্রয়ার, মোডাল
│   └── src/routes/                # ল্যান্ডিং পেজ ও ড্যাশবোর্ড
│
├── whatsapp-engine/               # Node.js + Baileys WhatsApp সার্ভিস
│   ├── src/baileysManager.ts      # Multi-Device session & QR কোড স্ট্রিমার
│   ├── src/guardrails.ts          # কঠোর অ্যান্টি-ব্যান ও হিউম্যান টাইপিং ডিলে
│   ├── src/brainRouter.ts         # Gemini 1.5 Flash সেন্ট্রাল ইনটেন্ট রাউটার
│   ├── src/imageGenerator.ts      # Pollinations.ai / Flux ইমেজ জেনারেটর
│   └── src/server.ts              # Express API & Server-Sent Events (SSE)
│
└── database/schema.sql            # PostgreSQL / Supabase ডাটাবেজ স্কিমা
```

---

## 🚀 লোকাল ডেভেলপমেন্ট রান করার নিয়ম

### ১. ডিপেন্ডেন্সি ইনস্টলেশন
```powershell
# Frontend ওয়েব ডিপেন্ডেন্সি
cd web
npm install

# WhatsApp ইঞ্জিন ডিপেন্ডেন্সি
cd ../whatsapp-engine
npm install
```

### ২. সার্ভার চালু করা
একটি কমান্ডে দুটি সার্ভিস এক সাথে রান করতে পারেন অথবা আলাদা টার্মিনালে:

```powershell
# টার্মিনাল ১: Frontend Web App (http://localhost:5173)
npm run dev

# টার্মিনাল ২: WhatsApp Engine Service (http://localhost:4000)
npm run dev:engine
```

---

## 💎 প্রাইসিং ও সাবস্ক্রিপশন প্ল্যান

1. **Monthly Plan:**
   - মূল্য: **৳৪৯৯ / মাস** (৩০ দিন)
   - সকল ৫০+ ওয়েব টুলস ও WhatsApp পার্সোনাল বট আনলিমিটেড।

2. **Yearly VIP Plan (Launch Special):**
   - অফার মূল্য: **৳১,৪৯৯ / ১ম বছর** (৭৫% ছাড়)
   - পরবর্তী বছরগুলো থেকে রেগুলার মূল্য ৳২,৯৯৯/বছর।
   - ৩ দিনের সাবস্ক্রিপশন গ্রেস পিরিয়ড সুরক্ষা।

---

## 🛡️ অ্যান্টি-ব্যান গার্ডরেইল সুরক্ষা

হোয়াটসঅ্যাপ কোনো থার্ড-পার্টি বাল্ক মেসেজিং সহ্য করে না। তাই SuperAI Hub নিচের কঠোর গার্ডরেইল মেনে চলে:
1. **Self-Chat Strict Scope:** শুধুমাত্র নিজের ফোন নম্বর থেকে নিজের নম্বরে পাঠানো মেসেজে কাজ করে।
2. **Human Simulation:** উত্তর প্রস্তুত হওয়ার পর ২–৩ সেকেন্ড `composing` (typing...) স্ট্যাটাস দেখিয়ে তারপর আউটপুট পাঠানো হয়।
3. **Zero Third-Party Reply:** অন্য কোনো পরিচিত বা অপরিচিত ব্যক্তি কিংবা গ্রুপে বট কখনোই অটোমেটিক মেসেজ দেয় না।

---

## 🌐 প্রোডাকশন ডিপ্লয়মেন্ট

- **Frontend (web):** Vercel বা Cloudflare Pages-এ সহজে ডিপ্লয় করা যায়।
- **WhatsApp Engine (whatsapp-engine):** Railway.app, Render, অথবা সিঙ্গাপুর লোকেশন VPS-এ Node.js ডকার কন্টেইনার হিসেবে ডিপ্লয় করুন, যাতে Baileys এর সেশন সকেট নিরবচ্ছিন্নভাবে চালু থাকে।
