# SuperAI Hub - 50+ AI Helpers & WhatsApp Personal Assistant

SuperAI Hub is an all-in-one AI Micro-SaaS platform. Users can access **50+ specialized AI helpers** across E-Commerce, Content, Career, and Technical domains from a modern web dashboard and link their personal WhatsApp account to turn their "Message Yourself" inbox into an autonomous AI assistant.

- **BYOK (Bring Your Own Key) Architecture:** Users provide their own free Google AI Studio Gemini API key (1,500 daily requests free quota). Zero central AI token costs to the platform.
- **Strict Anti-Ban Guardrails:** The bot exclusively handles self-messages sent by the user to themselves (`fromMe === true` and receiver is self). Automated replies to external contacts and groups are strictly blocked, with natural 2.5-second composing delays.
- **Flux / Pollinations Image Generation:** Generate high-resolution visuals directly in WhatsApp via `/image <prompt>` commands.

---

## 📁 Project Structure

```
superai-hub/
├── web/                           # SvelteKit 2 + Svelte 5 + Tailwind CSS Frontend
│   ├── src/lib/config/tools.ts    # Complete 50+ AI tools catalog & schemas
│   ├── src/lib/config/pricing.ts  # Monthly & Yearly launch special tiers
│   ├── src/lib/components/        # Simulator, Sandbox, Tool Drawer, BYOK/QR Modals
│   └── src/routes/                # Landing page & User Dashboard
│
├── whatsapp-engine/               # Node.js + Baileys WhatsApp Engine
│   ├── src/baileysManager.ts      # Multi-Device session & live QR streamer
│   ├── src/guardrails.ts          # Anti-ban filters & human typing simulation
│   ├── src/brainRouter.ts         # Gemini 1.5 Flash central intent router
│   ├── src/imageGenerator.ts      # Flux / Pollinations AI image generator
│   └── src/server.ts              # Express API & Server-Sent Events (SSE)
│
└── database/schema.sql            # PostgreSQL / Supabase database migration
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
# Frontend dependencies
cd web
npm install

# WhatsApp engine dependencies
cd ../whatsapp-engine
npm install
```

### 2. Run Development Servers
You can run both services concurrently:

```bash
# Terminal 1: Frontend Web App (http://localhost:5173)
npm run dev

# Terminal 2: WhatsApp Engine Service (http://localhost:4000)
npm run dev:engine
```

---

## 💎 Pricing & Subscription Tiers

1. **Monthly Pro Plan (BDT 499 / month):** Full access to all 50+ tools, unlimited WhatsApp self-assistant, free Gemini BYOK, and 24/7 support.
2. **Yearly VIP Special (BDT 1,499 / 1st year - 75% OFF):** Comprehensive unlimited access, priority high-speed response, early access to new tools, and 3-day grace period protection. (Standard renewal: BDT 2,999/year).

---

## 🌐 Live Deployments

- **Frontend (Vercel):** [https://web-dun-seven-nfi4eqbg3i.vercel.app](https://web-dun-seven-nfi4eqbg3i.vercel.app)
- **WhatsApp Engine (Railway):** [https://whatsapp-engine-production-04f4.up.railway.app](https://whatsapp-engine-production-04f4.up.railway.app)
- **GitHub Repository:** [https://github.com/farhanayanemon-hub/superai-hub](https://github.com/farhanayanemon-hub/superai-hub)
