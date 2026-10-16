# Project: EzboAgents Executive Dashboard Modernization

## Architecture
EzboAgents provides an executive AI orchestrator workspace featuring the Master AI CEO controlling 75 specialized AI Helpers, standalone autonomous agents, and multi-channel communication (WhatsApp & Telegram).

The architecture consists of:
1. **Frontend Application (`web/`)**:
   - SvelteKit 5 runes application (`$state`, `$derived`, `$effect`, `$props`).
   - Tailwind CSS v4 with glassmorphism design tokens (`backdrop-blur-xl`, `bg-white/60`, `border-[#CFE2FA]/70`, `rounded-3xl`).
   - Hardware-accelerated 120Hz transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Component layer: `FloatingCeoChat.svelte`, `ChannelModal.svelte`, `RobotShowcase.svelte`, `ApiVaultManager.svelte`.
   - Store layer: `userStore.ts` managing reactive user state, auth, `ceoCustomPrompt`, active tabs, and dual-tier persistence.
   - Persistence layer: `offlineStorage.ts` (browser IndexedDB `EzboAgentsChatDB`) + `localStorage` cache + `cloudSync.ts` (Supabase hooks).
   - API client: `whatsappApi.ts` connecting to WhatsApp engine SSE and REST endpoints.
2. **Server & Chat Routing (`web/src/routes/api/chat/+server.ts` & `web/src/lib/services/ceoRouter.ts`)**:
   - Parses user prompts for slash-command mentions `[⚡ #XX Tool Name]` or keywords.
   - Injects user's `ceoCustomPrompt` into Master AI CEO and delegated specialist system prompts.
   - Routes requests to AI providers (Gemini, OpenAI, Grok, DeepSeek, Pollinations).
3. **WhatsApp Engine (`whatsapp-engine/`)**:
   - Express 4 server on port 4000.
   - `@whiskeysockets/baileys` v7 multi-file authentication socket.
   - Provides SSE stream (`/api/qr/stream`), QR data URL (`/api/qr`), and pairing code (`POST /api/session/pairing-code`).
   - Clean disconnect/restart lifecycle with `AUTH_DIR` cleanup and 500ms auto-restart for immediate fresh QR generation.
4. **Testing Harness (`tests/`)**:
   - Node.js native test runner (`tests/run_all_tests.mjs`).
   - Multi-tier requirement-driven opaque-box and white-box test suite verifying 100% of features and build integrity.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Brand Header Clean-up | Remove VIP badge and ezboagents.com URL subtitle | M4 | Survey (R1) |
| F02 | 120Hz Desktop Sidebar | 3-line animated hamburger toggle with 120Hz cubic-bezier transition, expanding workspace | M4 | Survey (R1) |
| F03 | 120Hz Mobile Drawer | Animated mobile drawer sliding in/out over frosted glass backdrop | M4 | Survey (R1) |
| F04 | AI Helpers Label Clean-up | Remove count badge `{TOOLS.length}` and numbers; label as `AI Helpers` | M4 | Survey (R1) |
| F05 | Store Label Clean-up | Rename `Agents Store` to `Store`, remove `Autonomous` badge | M4 | Survey (R1) |
| F06 | Remove Channels Tab | Remove Channels navigation tab from sidebar menu | M4 | Survey (R1) |
| F07 | Floating Launcher Button | Bottom-right launcher button with AI CEO mascot, glowing status beacon, and animated bouncing speech bubble | M3 | Survey (R2) |
| F08 | ChatGPT-Style Glass Window | Floating window (`w-[95vw] sm:w-[520px] md:w-[580px] h-[78vh]`) with frosted glass styling and shadow | M3 | Survey (R2) |
| F09 | Auto-Open on First Visit | Auto-opens floating chat on initial visit to `/dashboard` via localStorage check | M3 | Survey (R2) |
| F10 | Auto-Minimize on Tab Switch | Automatically docks chat into launcher when switching to Store, Billing, Helpers, or Settings | M3 | Survey (R2) |
| F11 | Header Minimize & Close | Working minimize (`-`) and close (`✕`) buttons in chat header | M3 | Survey (R2) |
| F12 | Clean Conversation Stream | Clean, modern ChatGPT-like message feed without rigid cards or noisy boilerplate containers | M3 | Survey (R2) |
| F13 | Sleek Plus (+) Action Button | Modern `+` action button in chat input bar opening attachments / quick tools popover | M3 | Survey (R3) |
| F14 | Slash (/) Helper Autocomplete | Typing `/` opens instant searchable popover of all 75 AI Helpers | M3 | Survey (R3) |
| F15 | Keyboard Navigation in Popover | ArrowUp / ArrowDown / Enter / Escape navigation for helper selection | M3 | Survey (R3) |
| F16 | Visual Mention Chip Insertion | Selecting helper inserts visual mention chip `[⚡ #01 Facebook Ad Copy]` in prompt | M3 | Survey (R3) |
| F17 | Mention Chip Specialist Routing | `ceoRouter.ts` parses mention chip and routes prompt to specialist helper | M2 | Survey (R3) |
| F18 | Settings AI CEO Persona Section | Dedicated "Master AI CEO Persona & Custom Instructions" section in Settings tab | M4 | Survey (R4) |
| F19 | Live Character Counter | Real-time character counter in custom prompt textarea | M4 | Survey (R4) |
| F20 | Bengali Professional Preset | One-click preset for professional Bengali executive responses | M4 | Survey (R4) |
| F21 | Concise Strategist Preset | One-click preset for bullet-pointed, high-converting executive directives | M4 | Survey (R4) |
| F22 | E-Commerce Master Preset | One-click preset for ROAS and hook-focused marketing directives | M4 | Survey (R4) |
| F23 | Instant Save & Persistence | Instant save button updating `userStore.ts` and `localStorage` with feedback toast | M2, M4 | Survey (R4) |
| F24 | System Prompt Injection | `/api/chat` and `ceoRouter.ts` inject `ceoCustomPrompt` into system prompt | M2 | Survey (R4) |
| F25 | Connect Channels Header Button | Prominent "⚡ Connect Channels" button with live pulse beacon in chat header | M3 | Survey (R5) |
| F26 | Embedded Channels Modal | Centered frosted modal (`ChannelModal.svelte`) with WhatsApp & Telegram official SVG logos | M3 | Survey (R5) |
| F27 | WhatsApp Dynamic QR Stream | Real-time QR code display via SSE stream in Channels modal | M3 | Survey (R5) |
| F28 | 8-Digit Phone Pairing UI | Phone number input and 8-digit Crockford code display with 1-click copy | M3 | Survey (R5) |
| F29 | Baileys requestPairingCode | In `baileysManager.ts`, implement `requestPairingCode(phoneNumber)` via Baileys socket | M1 | Survey (R5) |
| F30 | Pairing Code Engine Endpoint | In `whatsapp-engine/src/server.ts`, expose `POST /api/session/pairing-code` | M1 | Survey (R5) |
| F31 | whatsappApi Pairing Method | In `web/src/lib/services/whatsappApi.ts`, add `requestPairingCode(phone)` method | M1 | Survey (R5) |
| F32 | Disconnect Bug Fix & Auto-Restart | `disconnect()` cleans `AUTH_DIR` credentials and restarts within 500ms for immediate fresh QR | M1 | Survey (R5) |
| F33 | Telegram 1-Click Sync & Deep Link | Generates sync code, deep link button, and 1-click copy code button | M3 | Survey (R5) |
| F34 | Telegram Commands Cheatsheet | Formatted cheatsheet of `/start`, `/ask`, `/[#01-#75]`, `/img`, `/status`, `/help` | M3 | Survey (R5) |
| F35 | IndexedDB Offline Storage | `offlineStorage.ts` browser IndexedDB (`EzboAgentsChatDB`) for unbounded offline messages/files | M2 | Survey (R6) |
| F36 | LocalStorage Fast Hydration | Fast synchronous hydration from LocalStorage merged with IndexedDB | M2 | Survey (R6) |
| F37 | Supabase Cloud Sync Hooks | `cloudSync.ts` hooks for cross-device synchronization when authenticated | M2 | Survey (R6) |
| F38 | Strip Rigid Cards Across Tabs | Strip `ui-card-static` and boxy cards across Helpers, Store, Billing, and Settings | M4 | Survey (R7) |
| F39 | Modern Frosted Glass Tokens | Replace cards with `bg-white/60 backdrop-blur-xl border border-[#CFE2FA]/70 rounded-3xl shadow-xs` | M4 | Survey (R7) |
| F40 | Animated Gradient Headings | Animated gradient text and 120Hz micro-interactions across dashboard | M4 | Survey (R7) |
| F41 | SvelteKit Typecheck | `npm run check` in `web/` passes with 0 errors and 0 warnings | M5 | Survey (Acceptance) |
| F42 | E2E Test Suite Pass | `node tests/run_all_tests.mjs` passes 100% across all tiers | M5 | Survey (Acceptance) |
| F43 | Web Production Build | `npm run build` in `web/` completes successfully | M5 | Survey (Acceptance) |
| F44 | WhatsApp Engine TS Build | `npm run build` in `whatsapp-engine/` compiles cleanly with 0 TS errors | M1, M5 | Survey (Acceptance) |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | WhatsApp Engine & Channel API | Implement `requestPairingCode` and fix `disconnect()` (clean `AUTH_DIR` + 500ms auto-restart) in `whatsapp-engine/`; add `POST /api/session/pairing-code` endpoint; wire `whatsappApi.ts` client methods | none | DONE |
| M2 | Dual-Tier Persistence & CEO System Prompt Routing | Create `offlineStorage.ts` (IndexedDB) and `cloudSync.ts`; update `userStore.ts` with `ceoCustomPrompt` and dual-tier sync; update `ceoRouter.ts` and `/api/chat/+server.ts` for prompt injection and `/` mention routing | none | DONE |
| M3 | Embedded Channels Modal & Floating AI CEO Chat Component | Build `ChannelModal.svelte` (WhatsApp QR & 8-digit pairing code, Telegram sync & cheatsheet) and `FloatingCeoChat.svelte` (floating launcher, bouncing bubble, minimize/close, `+` button, slash autocomplete popover for 75 helpers, mention chips) | M1, M2 | DONE |
| M4 | Dashboard Modernization, 120Hz Sidebar & Glassmorphic Overhaul | Modernize `web/src/routes/dashboard/+page.svelte`: clean brand header (remove VIP & URL); add 3-line hamburger toggle with 120Hz cubic-bezier transition; clean sidebar tabs; add Settings CEO Persona section with character counter and presets; replace rigid cards with frosted glass containers across all tabs; integrate FloatingCeoChat & ChannelModal | M2, M3 | PLANNED |
| M5 | Comprehensive E2E Test Suite & Build Hardening | Expand `tests/run_all_tests.mjs` with comprehensive test tiers covering all requirements (R1–R7, Baileys pairing & disconnect, slash autocomplete, CEO custom prompt, ChannelModal, IndexedDB persistence, glassmorphism tokens). Verify `npm run check`, `npm run build` (web and engine), and 100% test pass. Publish `TEST_READY.md` | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts

### 1. `whatsapp-engine` ↔ `web/src/lib/services/whatsappApi.ts`
- **POST `/api/session/pairing-code`**:
  - Request: `{ phoneNumber: string }` (digits only or formatted, sanitized server-side).
  - Response (Success): `{ success: true, pairingCode: string }` (e.g., `ABCD-1234`).
  - Response (Error): `{ success: false, error: string }`.
- **POST `/api/session/disconnect`**:
  - Action: terminates socket, removes `AUTH_DIR` credentials, schedules `setTimeout(() => this.start(), 500)`.
  - Response: `{ success: true, message: string }`.
- **GET `/api/qr/stream`**:
  - SSE event payload: `data: JSON.stringify({ status: 'connecting' | 'connected' | 'disconnected', userJid: string | null, hasQr: boolean, qrDataUrl: string | null })`.

### 2. `web/src/lib/services/offlineStorage.ts` (IndexedDB Contract)
- **Database**: `EzboAgentsChatDB`, version 1.
- **Store `messages`**: keyPath `id`, index on `timestamp` (non-unique), index on `sessionId`.
- **Signatures**:
  - `saveMessage(msg: ChatMessage): Promise<void>`
  - `getAllMessages(sessionId?: string): Promise<ChatMessage[]>`
  - `clearMessages(sessionId?: string): Promise<void>`
  - `saveAttachment(id: string, dataUrl: string, metadata: any): Promise<void>`

### 3. `web/src/lib/stores/userStore.ts` ↔ Components
- **`ceoCustomPrompt`**: `Writable<string>`, initialized from `localStorage.getItem('ezbo_ceo_custom_prompt') || ''`.
- **`setCeoCustomPrompt(prompt: string): void`**: updates writable store and writes to `localStorage`.
- **`chatHistory`**: initialized with `localStorage` cache for instant render, then updated/synced with `offlineStorage`.

### 4. `web/src/routes/api/chat/+server.ts` & `ceoRouter.ts`
- **Request Payload (`ChatRequest`)**:
  - `message: string` (may contain mention chip `[⚡ #01 Facebook Ad Copy] ...`)
  - `helperId?: string` (explicitly targeted helper)
  - `ceoCustomPrompt?: string` (user-defined system prompt directive)
  - `history?: Array<{ role: 'user' | 'assistant', content: string }>`
- **Router Logic**:
  - Extracts `#XX` from mention chip or keywords to identify specialist helper from `TOOLS`.
  - Injects `ceoCustomPrompt` under `USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):` in system prompt.

---

## Code Layout
```
EzboAgents/
├── web/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   │   ├── FloatingCeoChat.svelte        # [NEW] ChatGPT-style floating AI CEO chat
│   │   │   │   ├── ChannelModal.svelte           # [NEW] Embedded WhatsApp/Telegram modal
│   │   │   │   └── robots/
│   │   │   │       ├── RobotShowcase.svelte      # 75-helper robot showcase component
│   │   │   │       └── agents.js                 # 75 agents SVG definitions
│   │   │   ├── config/
│   │   │   │   └── tools.ts                      # 75 AI Helpers metadata (#01-#75)
│   │   │   ├── services/
│   │   │   │   ├── offlineStorage.ts             # [NEW] Browser IndexedDB persistence
│   │   │   │   ├── cloudSync.ts                  # [NEW] Supabase cloud sync hooks
│   │   │   │   ├── whatsappApi.ts                # [MOD] WhatsApp engine client service
│   │   │   │   └── ceoRouter.ts                  # [MOD] Chat routing & prompt builder
│   │   │   └── stores/
│   │   │       └── userStore.ts                  # [MOD] User state, ceoCustomPrompt, dual persistence
│   │   └── routes/
│   │       ├── api/chat/+server.ts               # [MOD] Chat API endpoint with prompt injection
│   │       └── dashboard/+page.svelte            # [MOD] 120Hz sidebar, header clean-up, glassmorphism
│   └── package.json
├── whatsapp-engine/
│   ├── src/
│   │   ├── baileysManager.ts                     # [MOD] requestPairingCode + disconnect bug fix
│   │   └── server.ts                             # [MOD] POST /api/session/pairing-code endpoint
│   └── package.json
├── tests/
│   ├── run_all_tests.mjs                         # [MOD] Master test suite runner coordinating tiers
│   ├── tier1_feature_coverage.test.mjs           # Tier 1 tests
│   ├── tier2_boundary_cases.test.mjs             # Tier 2 tests
│   ├── tier3_cross_feature.test.mjs              # Tier 3 tests
│   ├── tier4_real_world_build.test.mjs           # Tier 4 build tests
│   ├── tier5_adversarial_dashboard.test.mjs      # [NEW] Tier 5 dashboard & R1-R7 verification
│   └── ...
└── PROJECT.md
```
