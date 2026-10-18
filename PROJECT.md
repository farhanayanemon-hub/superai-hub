# Project: EzboAgents World-Class AI SaaS Platform

## Architecture
EzboAgents is a full-stack AI SaaS application built with SvelteKit (Svelte 5 runes, Tailwind CSS v4 CSS-first configuration), Node.js server endpoints, and automated multi-channel messaging engines.
The platform delivers:
- Universal Master AI CEO accessible across Web, WhatsApp, and Telegram.
- 75 Specialized AI Business & Freelancer Helpers (#01–#75) in floating transparent SVG robot showcase.
- 100+ Enterprise Tool Connectors across 10 categories with local/encrypted vault credentials.
- 2-Plan Subscription Matrix: Starter Plan (৳499/mo, ৳4,790/yr) and Pro Plan (৳899/mo, ৳8,690/yr) with 2-column pricing comparison.
- Visual Workflow Studio with interactive node graph canvas, Bézier curved cables, pan/zoom, and custom agent builder for Pro users; readymade execution for Starter users.
- Admin Panel with model toggles, channels master switch, and 2-plan management.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Platform-Wide Poppins Typography | Google Font Poppins (300–900) in `app.html` & `--font-sans` in `layout.css` | M1 | ORIGINAL_REQUEST R1 |
| 2 | Humanized UI Design Harmony | Polish deep navy/slate, white canvas, cool gray borders, electric blue accents | M1 | ORIGINAL_REQUEST R1 |
| 3 | Robots CSS SHA256 Invariance | Preserve `robots.css` byte-for-byte SHA256 checksum `549729f4...` | M1, M7 | ORIGINAL_REQUEST R9 |
| 4 | 2-Plan Subscription Architecture | Exactly 2 public plans: Starter (`byok_starter`, ৳499) and Pro (`byok_pro`, ৳899) | M2 | ORIGINAL_REQUEST R2 |
| 5 | Complete "BYOK" Text Removal | Strip "BYOK" from names, cards, badges, and headers across UI | M2 | ORIGINAL_REQUEST R2 |
| 6 | 2-Column PricingCardsGrid | Balanced 2-column grid (`max-w-4xl mx-auto`) on Homepage, Plans, and Dashboard | M2 | ORIGINAL_REQUEST R2 |
| 7 | Cloud Managed Public Removal & Compatibility | Remove from public view while preserving internal fallbacks for tests | M2 | ORIGINAL_REQUEST R2 |
| 8 | Universal Master AI CEO | Both Starter and Pro subscribers have full access to Master AI CEO | M3 | ORIGINAL_REQUEST R3 |
| 9 | Intelligent Plan Guard in CEO Router | Polite bilingual decline with markdown link to `/plans` when Starter asks for Pro features | M3 | ORIGINAL_REQUEST R3 |
| 10 | Complete Removal of Agents Store | Remove Store and Owned Agents tabs, grids, and purchase modals from dashboard | M3 | ORIGINAL_REQUEST R4 |
| 11 | Full Access to all 75 Helpers | All 75 AI Helpers included in both Starter and Pro plans without extra fees | M3 | ORIGINAL_REQUEST R4 |
| 12 | 100+ Enterprise Tool Connectors Config | `toolConnectors.ts` with 100+ connectors across 10 distinct categories | M4 | ORIGINAL_REQUEST R5 |
| 13 | Dedicated Tools & Integrations Hub Tab | `ToolConnectorsTab.svelte` with search, chips, credentials modal in Dashboard | M4 | ORIGINAL_REQUEST R5 |
| 14 | Readymade Workflow Execution Gating | Starter users execute readymade workflows; "Customize Workflow" shows `[PRO]` lock badge | M5 | ORIGINAL_REQUEST R6 |
| 15 | Visual Workflow Studio Modal | Interactive node graph canvas with Bézier curves, pan/zoom, node palette, custom agent builder | M5 | ORIGINAL_REQUEST R6 |
| 16 | External Channels Dynamic Master Switch | Admin master toggle `channelsCeoEnabled: boolean` (default `true`) for WhatsApp/Telegram | M6 | ORIGINAL_REQUEST R7 |
| 17 | Admin Panel 2-Plan & Model Management | 2 tabs (`Starter Plan` and `Pro Plan`), 8 model toggles, user plan assignment | M6 | ORIGINAL_REQUEST R8 |
| 18 | Automated Test Suite 100% Pass Invariance | `tests/run_all_tests.mjs` 100% pass across all 6 tiers | M7 | ORIGINAL_REQUEST R9 |
| 19 | Zero Diagnostics & Build Success | `npm run check` 0 errors 0 warnings, `npm run build` clean Vite production build | M7 | ORIGINAL_REQUEST R9 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Poppins Typography & Global Styling | `web/src/app.html`, `web/src/routes/layout.css` | none | DONE |
| M2 | 2-Plan Architecture & BYOK Removal | `web/src/lib/config/plans.ts`, `web/src/lib/components/PricingCardsGrid.svelte`, `plans/+page.svelte`, `dashboard/+page.svelte` (billing), `ApiKeyManager.svelte` | M1 | DONE |
| M3 | Universal AI CEO Plan Guard & Store Removal | `web/src/lib/services/ceoRouter.ts`, `web/src/routes/api/chat/+server.ts`, `web/src/routes/dashboard/+page.svelte` (store removal) | M2 | DONE |
| M4 | Dedicated 100+ Tools & Integrations Hub | `web/src/lib/config/toolConnectors.ts`, `web/src/lib/components/ToolConnectorsTab.svelte`, `web/src/routes/dashboard/+page.svelte` (tools tab) | M3 | DONE |
| M5 | Workflow Studio Modal & Gating | `web/src/lib/components/WorkflowStudioModal.svelte`, `web/src/lib/components/ToolDrawer.svelte` | M4 | IN_PROGRESS |
| M6 | Admin Panel Master Toggles & Plan Manager | `web/src/lib/server/adminSettings.ts`, `web/src/routes/api/admin/settings/+server.ts`, `web/src/routes/admin/+page.svelte` | M2, M5 | PLANNED |
| M7 | E2E Test Suite & Adversarial Hardening | `tests/test_saas_platform_e2e.test.mjs`, `tests/run_all_tests.mjs`, `npm run check`, `npm run build` | M1-M6 | PLANNED |

## Interface Contracts
### `plans.ts` ↔ Public Pages (`PricingCardsGrid.svelte`, `/plans`, `/dashboard`)
- Canonical IDs: `'byok_starter'`, `'byok_pro'`, `'managed'` (internal).
- Public `planOrder`: `['byok_starter', 'byok_pro']`.
- User-facing names: `'Starter Plan'`, `'Pro Plan'`. Badges: `'Essential Starter'`, `'Power Automation'`.
- Starter price: 499/mo (4790/yr). Pro price: 899/mo (8690/yr). Managed price: 1499/mo (14390/yr) preserved for test invariants.

### `ceoRouter.ts` ↔ `chat/+server.ts`
- `isRestrictedStarterIntent(message: string): boolean`: detects workflow customization, node editing, custom agent building, multi-key failover.
- `getStarterGuardResponse(): string`: returns polite bilingual response explaining Pro Plan requirement and markdown link `[Upgrade to Pro Plan](/plans)`.
- Starter users get fast intercepted guard response or guided execution; Pro users get unrestricted authority.

### `dashboard/+page.svelte` ↔ `ToolConnectorsTab.svelte`
- `activeDashboardTab === 'tools'` renders `<ToolConnectorsTab />`.
- Connectors stored in `localStorage['ezbo_connected_tools']`.

### `ToolDrawer.svelte` ↔ `WorkflowStudioModal.svelte`
- "Customize Workflow" button: Starter users see `[PRO]` badge opening upgrade modal with 1-click CTA to `/plans`. Pro users open `WorkflowStudioModal`.

### `adminSettings.ts` ↔ `admin/+page.svelte`
- `channelsCeoEnabled: boolean` (default `true`) stored in `AdminConfig` and synced via `/api/admin/settings`.
- Model toggles: 8 models in `AdminModelToggles`.
- Plans manager: 2 tabs (`Starter Plan` and `Pro Plan`).

## Code Layout
- `web/src/app.html`: Google Font Poppins import
- `web/src/routes/layout.css`: Tailwind v4 `--font-sans` configuration
- `web/src/lib/config/plans.ts`: Plan definitions
- `web/src/lib/components/PricingCardsGrid.svelte`: 2-column pricing component
- `web/src/lib/services/ceoRouter.ts`: Plan guard logic
- `web/src/routes/api/chat/+server.ts`: Chat handler with tier guard
- `web/src/lib/config/toolConnectors.ts`: 100+ tool connector definitions
- `web/src/lib/components/ToolConnectorsTab.svelte`: Tools & Integrations UI tab
- `web/src/lib/components/WorkflowStudioModal.svelte`: Visual Studio Modal with Bézier cables
- `web/src/lib/components/ToolDrawer.svelte`: Workflow execution and gating
- `web/src/lib/server/adminSettings.ts`: Admin configuration backend
- `web/src/routes/api/admin/settings/+server.ts`: Admin settings API
- `web/src/routes/admin/+page.svelte`: Admin Panel UI
- `web/src/routes/dashboard/+page.svelte`: User Dashboard UI
- `tests/`: 6 test tiers in `run_all_tests.mjs` + new SaaS platform E2E suite
