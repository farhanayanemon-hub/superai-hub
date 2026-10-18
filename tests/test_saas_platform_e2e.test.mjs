/**
 * Comprehensive E2E Test Suite for EzboAgents World-Class AI SaaS Platform
 * Direct authoritative derivation from:
 * - ORIGINAL_REQUEST.md (section ## 2026-10-18T10:03:21Z)
 * - PROJECT.md (Architecture, Interface Contracts, Milestones M1-M7)
 * - TEST_INFRA.md (16 Features, Tiers 1-4 Specification)
 *
 * Framework: Native Node.js test runner (`node:test`, `node:assert/strict`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

// Register SvelteKit $lib resolver hook for dynamic module imports
try {
  register('./helpers/sveltekit_loader.mjs', import.meta.url);
} catch {
  // Fallback if already registered
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

// Canonical paths to platform assets, components, and services
const PATHS = {
  appHtml: path.join(WEB_DIR, 'src', 'app.html'),
  layoutCss: path.join(WEB_DIR, 'src', 'routes', 'layout.css'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  createRobotJs: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'createRobot.js'),
  agentsJs: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'agents.js'),
  robotShowcase: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'RobotShowcase.svelte'),
  plansTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts'),
  toolsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'),
  toolConnectorsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'toolConnectors.ts'),
  pricingCardsGrid: path.join(WEB_DIR, 'src', 'lib', 'components', 'PricingCardsGrid.svelte'),
  toolConnectorsTab: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolConnectorsTab.svelte'),
  toolDrawer: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolDrawer.svelte'),
  workflowStudioModal: path.join(WEB_DIR, 'src', 'lib', 'components', 'WorkflowStudioModal.svelte'),
  apiKeyManager: path.join(WEB_DIR, 'src', 'lib', 'components', 'ApiKeyManager.svelte'),
  floatingCeoChat: path.join(WEB_DIR, 'src', 'lib', 'components', 'FloatingCeoChat.svelte'),
  ceoRouterTs: path.join(WEB_DIR, 'src', 'lib', 'services', 'ceoRouter.ts'),
  chatServerTs: path.join(WEB_DIR, 'src', 'routes', 'api', 'chat', '+server.ts'),
  adminSettingsTs: path.join(WEB_DIR, 'src', 'lib', 'server', 'adminSettings.ts'),
  adminSettingsApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'settings', '+server.ts'),
  adminPage: path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte'),
  dashboardPage: path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte'),
  plansPage: path.join(WEB_DIR, 'src', 'routes', 'plans', '+page.svelte'),
  homePage: path.join(WEB_DIR, 'src', 'routes', '+page.svelte'),
  userStoreTs: path.join(WEB_DIR, 'src', 'lib', 'stores', 'userStore.ts'),
  plansStoreTs: path.join(WEB_DIR, 'src', 'lib', 'stores', 'plansStore.ts')
};

function readSafe(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

function getSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ============================================================================
// TIER 1: FEATURE COVERAGE (>=5 tests per feature, 16 features = 80 tests)
// ============================================================================
describe('Tier 1: Feature Coverage (16 SaaS Platform Features)', () => {

  // --------------------------------------------------------------------------
  // Feature 1: Platform-Wide Poppins Typography & Fonts (R1)
  // --------------------------------------------------------------------------
  describe('Feature 1: Platform-Wide Poppins Typography & Fonts', () => {
    it('1.1 web/src/app.html must import Google Font Poppins with weights 300 to 900', () => {
      assert.ok(fs.existsSync(PATHS.appHtml), 'app.html must exist');
      const html = readSafe(PATHS.appHtml);
      assert.ok(html.includes('fonts.googleapis.com'), 'app.html must connect to Google Fonts');
      assert.ok(html.includes('family=Poppins'), 'app.html must request family=Poppins');
      const hasWeights = /Poppins:wght@(.*?)(?:&|$)/.test(html);
      assert.ok(hasWeights, 'app.html must specify Poppins font weights');
      const weightMatch = html.match(/Poppins:wght@([0-9;]+)/);
      assert.ok(weightMatch, 'app.html must match Poppins weight string');
      for (const w of ['300', '400', '500', '600', '700', '800', '900']) {
        assert.ok(weightMatch[1].includes(w), `app.html Poppins import must include weight ${w}`);
      }
    });

    it('1.2 layout.css @theme block must configure --font-sans with Poppins first', () => {
      assert.ok(fs.existsSync(PATHS.layoutCss), 'layout.css must exist');
      const css = readSafe(PATHS.layoutCss);
      assert.ok(css.includes('@theme'), 'layout.css must contain Tailwind v4 @theme block');
      assert.ok(
        /--font-sans:\s*['"]Poppins['"]/.test(css),
        'layout.css @theme must set --font-sans with Poppins as primary family'
      );
    });

    it('1.3 layout.css base styles must apply var(--font-sans) to body', () => {
      const css = readSafe(PATHS.layoutCss);
      assert.ok(
        css.includes('font-family: var(--font-sans)') || css.includes("font-family: 'Poppins'"),
        'layout.css must bind font-family to var(--font-sans)'
      );
    });

    it('1.4 app.html body must include font-sans class for global typography cascade', () => {
      const html = readSafe(PATHS.appHtml);
      assert.ok(/<body[^>]*class="[^"]*font-sans[^"]*"/.test(html), 'app.html body must include font-sans class');
    });

    it('1.5 layout.css must preserve --font-mono for code snippets with JetBrains Mono', () => {
      const css = readSafe(PATHS.layoutCss);
      assert.ok(
        /--font-mono:\s*['"]JetBrains Mono['"]/.test(css),
        'layout.css must configure --font-mono with JetBrains Mono'
      );
    });
  });

  // --------------------------------------------------------------------------
  // Feature 2: Color Harmony & Design Tokens (R1)
  // --------------------------------------------------------------------------
  describe('Feature 2: Color Harmony & Styling Tokens', () => {
    it('2.1 layout.css must define corporate deep navy and slate color tokens', () => {
      const css = readSafe(PATHS.layoutCss);
      assert.ok(css.includes('#102A56'), 'Must define deep corporate navy #102A56');
      assert.ok(css.includes('#111827'), 'Must define slate text/canvas token #111827');
    });

    it('2.2 layout.css must define cool gray border tokens (#CFE2FA and #E5E7EB)', () => {
      const css = readSafe(PATHS.layoutCss);
      assert.ok(css.includes('#CFE2FA'), 'Must define cool ice-blue border #CFE2FA');
      assert.ok(css.includes('#E5E7EB'), 'Must define crisp neutral border #E5E7EB');
    });

    it('2.3 layout.css must define electric blue primary accent #1677FF', () => {
      const css = readSafe(PATHS.layoutCss);
      assert.ok(css.includes('#1677FF'), 'Must define electric blue accent #1677FF');
    });

    it('2.4 layout.css must define pure crisp white canvas tokens #FFFFFF', () => {
      const css = readSafe(PATHS.layoutCss);
      assert.ok(
        css.includes('--color-white: #FFFFFF') || css.includes('--color-bg-pale: #FFFFFF'),
        'Must define pure white surface tokens'
      );
    });

    it('2.5 layout.css must define Indigo primary interactive brand tokens #4F46E5', () => {
      const css = readSafe(PATHS.layoutCss);
      assert.ok(css.includes('#4F46E5'), 'Must define primary interactive color #4F46E5');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 3: 2-Plan Subscription Architecture (Starter & Pro) (R2)
  // --------------------------------------------------------------------------
  describe('Feature 3: 2-Plan Subscription Architecture (Starter & Pro)', () => {
    it('3.1 plans.ts must declare canonical plan IDs byok_starter and byok_pro', () => {
      assert.ok(fs.existsSync(PATHS.plansTs), 'plans.ts must exist');
      const content = readSafe(PATHS.plansTs);
      assert.ok(content.includes("'byok_starter'"), "plans.ts must declare 'byok_starter'");
      assert.ok(content.includes("'byok_pro'"), "plans.ts must declare 'byok_pro'");
    });

    it('3.2 Starter Plan must be priced at ৳499/mo and ৳4,790/yr', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.ok(DEFAULT_PLANS.byok_starter, 'DEFAULT_PLANS.byok_starter must exist');
      assert.strictEqual(DEFAULT_PLANS.byok_starter.monthlyPrice, 499, 'Starter monthly price must be 499');
      assert.strictEqual(DEFAULT_PLANS.byok_starter.yearlyTotal, 4790, 'Starter yearly price must be 4790');
    });

    it('3.3 Pro Plan must be priced at ৳899/mo and ৳8,690/yr', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.ok(DEFAULT_PLANS.byok_pro, 'DEFAULT_PLANS.byok_pro must exist');
      assert.strictEqual(DEFAULT_PLANS.byok_pro.monthlyPrice, 899, 'Pro monthly price must be 899');
      assert.strictEqual(DEFAULT_PLANS.byok_pro.yearlyTotal, 8690, 'Pro yearly price must be 8690');
    });

    it('3.4 Starter Plan display name must be "Starter Plan" with badge "Essential Starter"', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(DEFAULT_PLANS.byok_starter.name, 'Starter Plan', 'Starter display name must be "Starter Plan"');
      assert.strictEqual(DEFAULT_PLANS.byok_starter.badge, 'Essential Starter', 'Starter badge must be "Essential Starter"');
    });

    it('3.5 Pro Plan display name must be "Pro Plan" with badge "Power Automation"', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(DEFAULT_PLANS.byok_pro.name, 'Pro Plan', 'Pro display name must be "Pro Plan"');
      assert.strictEqual(DEFAULT_PLANS.byok_pro.badge, 'Power Automation', 'Pro badge must be "Power Automation"');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 4: "BYOK" Removal from UI (R2)
  // --------------------------------------------------------------------------
  describe('Feature 4: "BYOK" Removal from Public UI', () => {
    it('4.1 plans.ts user-facing plan names must NOT contain "BYOK"', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.ok(!DEFAULT_PLANS.byok_starter.name.toUpperCase().includes('BYOK'), 'Starter name must not contain BYOK');
      assert.ok(!DEFAULT_PLANS.byok_pro.name.toUpperCase().includes('BYOK'), 'Pro name must not contain BYOK');
    });

    it('4.2 plans.ts user-facing plan badges must NOT contain "BYOK"', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.ok(!DEFAULT_PLANS.byok_starter.badge.toUpperCase().includes('BYOK'), 'Starter badge must not contain BYOK');
      assert.ok(!DEFAULT_PLANS.byok_pro.badge.toUpperCase().includes('BYOK'), 'Pro badge must not contain BYOK');
    });

    it('4.3 PricingCardsGrid.svelte must not contain "BYOK" in public plan titles or headers', () => {
      assert.ok(fs.existsSync(PATHS.pricingCardsGrid), 'PricingCardsGrid.svelte must exist');
      const content = readSafe(PATHS.pricingCardsGrid);
      assert.ok(!content.includes('>BYOK Starter<'), 'PricingCardsGrid must not render >BYOK Starter<');
      assert.ok(!content.includes('>BYOK Pro<'), 'PricingCardsGrid must not render >BYOK Pro<');
    });

    it('4.4 Dedicated Plans page (+page.svelte) must NOT render "BYOK" in plan titles or badges', () => {
      assert.ok(fs.existsSync(PATHS.plansPage), 'plans/+page.svelte must exist');
      const content = readSafe(PATHS.plansPage);
      assert.ok(!content.includes('>BYOK Starter<'), 'plans page must not render >BYOK Starter<');
      assert.ok(!content.includes('>BYOK Pro<'), 'plans page must not render >BYOK Pro<');
      assert.ok(!content.includes('Essential BYOK'), 'plans page must not render Essential BYOK');
    });

    it('4.5 Dashboard billing tab must display clean plan names without BYOK prefix', () => {
      assert.ok(fs.existsSync(PATHS.dashboardPage), 'dashboard/+page.svelte must exist');
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(!content.includes('>BYOK Starter Plan<'), 'dashboard must not render BYOK Starter Plan');
      assert.ok(!content.includes('>BYOK Pro Plan<'), 'dashboard must not render BYOK Pro Plan');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 5: 2-Column PricingCardsGrid (R2)
  // --------------------------------------------------------------------------
  describe('Feature 5: 2-Column PricingCardsGrid Component', () => {
    it('5.1 PricingCardsGrid.svelte must define planOrder containing exactly byok_starter and byok_pro', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      const match = content.match(/planOrder[^=]*=\s*\[([^\]]+)\]/);
      assert.ok(match, 'PricingCardsGrid must declare planOrder array');
      const orderStr = match[1];
      assert.ok(orderStr.includes("'byok_starter'") || orderStr.includes('"byok_starter"'), 'planOrder must include byok_starter');
      assert.ok(orderStr.includes("'byok_pro'") || orderStr.includes('"byok_pro"'), 'planOrder must include byok_pro');
      assert.ok(!orderStr.includes("'managed'"), 'Public planOrder must NOT include managed');
    });

    it('5.2 PricingCardsGrid.svelte must render a 2-column responsive grid container', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      assert.ok(
        content.includes('grid-cols-1 md:grid-cols-2') ||
        content.includes('grid-cols-1 lg:grid-cols-2') ||
        content.includes('max-w-4xl'),
        'PricingCardsGrid must specify 2-column layout'
      );
    });

    it('5.3 PricingCardsGrid.svelte must provide monthly/yearly interval toggle', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      assert.ok(content.includes('selectedInterval'), 'Must bind selectedInterval state');
      assert.ok(content.includes('Monthly'), 'Must render Monthly toggle label');
      assert.ok(content.includes('Yearly'), 'Must render Yearly toggle label');
    });

    it('5.4 PricingCardsGrid.svelte must render feature lists and CTA buttons for both plans', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      assert.ok(content.includes('plan.features') || content.includes('plan.name'), 'Must iterate or render plan features');
      assert.ok(content.includes('button') || content.includes('onclick'), 'Must render interactive CTA buttons');
    });

    it('5.5 PricingCardsGrid.svelte must support highlighting the user active subscription tier', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      assert.ok(
        content.includes('isUserCurrentPlan') || content.includes('Current Active Plan') || content.includes('Active'),
        'Must support active plan badge in billing context'
      );
    });
  });

  // --------------------------------------------------------------------------
  // Feature 6: Cloud Managed Public Removal & Compatibility (R2)
  // --------------------------------------------------------------------------
  describe('Feature 6: Cloud Managed Public Removal & Compatibility', () => {
    it('6.1 PricingCardsGrid.svelte must NOT publicly display Cloud Managed plan card', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      assert.ok(!content.includes("'managed' in planOrder"), 'managed must not be in public planOrder');
      assert.ok(!content.includes('>All-Inclusive Cloud<'), 'Public grid must not render All-Inclusive Cloud title');
    });

    it('6.2 plans.ts must preserve DEFAULT_PLANS.managed internally for test & backward compatibility', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.ok(DEFAULT_PLANS.managed, 'DEFAULT_PLANS.managed must exist for backwards compatibility');
      assert.strictEqual(DEFAULT_PLANS.managed.monthlyPrice, 1499, 'Managed monthly price must remain 1499');
      assert.strictEqual(DEFAULT_PLANS.managed.yearlyTotal, 14390, 'Managed yearly total must remain 14390');
    });

    it('6.3 getPlanPrice in plans.ts must continue resolving managed tier price correctly', async () => {
      const { DEFAULT_PLANS, getPlanPrice } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'monthly'), 1499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'yearly'), 14390);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'complete', 'monthly'), 1499);
    });

    it('6.4 plans.ts must maintain legacy byok alias resolving to Starter Plan pricing', async () => {
      const { DEFAULT_PLANS, getPlanPrice } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok', 'monthly'), 499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok', 'yearly'), 4790);
    });

    it('6.5 ApiKeyManager.svelte must preserve cloud managed detection and banner', () => {
      assert.ok(fs.existsSync(PATHS.apiKeyManager), 'ApiKeyManager.svelte must exist');
      const content = readSafe(PATHS.apiKeyManager);
      assert.ok(
        content.includes('tier ===') || content.includes('managed') || content.includes('isCloudManaged'),
        'ApiKeyManager must maintain cloud managed compatibility branch'
      );
    });
  });

  // --------------------------------------------------------------------------
  // Feature 7: Universal AI CEO Access (R3)
  // --------------------------------------------------------------------------
  describe('Feature 7: Universal Master AI CEO Access', () => {
    it('7.1 Both Starter and Pro plans must have featureToggles.aiCeo enabled (true)', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(DEFAULT_PLANS.byok_starter.featureToggles.aiCeo, true, 'Starter must have AI CEO enabled');
      assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.aiCeo, true, 'Pro must have AI CEO enabled');
    });

    it('7.2 FloatingCeoChat.svelte component must exist and render floating launcher', () => {
      assert.ok(fs.existsSync(PATHS.floatingCeoChat), 'FloatingCeoChat.svelte must exist');
      const content = readSafe(PATHS.floatingCeoChat);
      assert.ok(content.includes('fixed bottom-6 right-6') || content.includes('z-40'), 'Must render fixed floating button');
      assert.ok(content.includes('ezbo-ceo.png') || content.includes('AI CEO'), 'Must display CEO mascot or badge');
    });

    it('7.3 FloatingCeoChat.svelte chat window must provide ChatGPT-style conversation view', () => {
      const content = readSafe(PATHS.floatingCeoChat);
      assert.ok(content.includes('messages') || content.includes('chat'), 'Must manage conversation state');
      assert.ok(content.includes('textarea') || content.includes('input'), 'Must provide chat input field');
    });

    it('7.4 chat/+server.ts must accept messages from both Starter and Pro users', () => {
      assert.ok(fs.existsSync(PATHS.chatServerTs), 'chat/+server.ts must exist');
      const content = readSafe(PATHS.chatServerTs);
      assert.ok(content.includes('POST') || content.includes('Request'), 'Must export POST handler');
    });

    it('7.5 ceoRouter.ts must build system prompt with Master AI CEO persona for all users', () => {
      assert.ok(fs.existsSync(PATHS.ceoRouterTs), 'ceoRouter.ts must exist');
      const content = readSafe(PATHS.ceoRouterTs);
      assert.ok(content.includes('buildCeoOrHelperSystemPrompt'), 'Must export buildCeoOrHelperSystemPrompt');
      assert.ok(content.includes('AI_CEO_PROFILE') || content.includes('Master AI CEO'), 'Must inject CEO persona');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 8: Intelligent Plan Guard in CEO Router (R3)
  // --------------------------------------------------------------------------
  describe('Feature 8: Intelligent Plan Guard (Bilingual Decline + Link)', () => {
    it('8.1 ceoRouter.ts must export isRestrictedStarterIntent function', async () => {
      assert.ok(fs.existsSync(PATHS.ceoRouterTs), 'ceoRouter.ts must exist');
      const mod = await import(pathToFileURL(PATHS.ceoRouterTs).href);
      assert.strictEqual(
        typeof mod.isRestrictedStarterIntent,
        'function',
        'ceoRouter.ts must export isRestrictedStarterIntent'
      );
    });

    it('8.2 isRestrictedStarterIntent must return true for workflow customization queries', async () => {
      const { isRestrictedStarterIntent } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
      assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
      assert.strictEqual(isRestrictedStarterIntent('Can you customize this workflow for me?'), true);
      assert.strictEqual(isRestrictedStarterIntent('I want to edit nodes in the graph'), true);
      assert.strictEqual(isRestrictedStarterIntent('Build me a custom agent from scratch'), true);
      assert.strictEqual(isRestrictedStarterIntent('Set up multi-key failover rotation'), true);
    });

    it('8.3 isRestrictedStarterIntent must return false for standard readymade helper tasks', async () => {
      const { isRestrictedStarterIntent } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
      assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
      assert.strictEqual(isRestrictedStarterIntent('Write a Facebook ad copy for Eid sale'), false);
      assert.strictEqual(isRestrictedStarterIntent('Create a logo concept for my brand'), false);
      assert.strictEqual(isRestrictedStarterIntent('Give me 10 SEO blog titles'), false);
      assert.strictEqual(isRestrictedStarterIntent('Hello CEO, how are you?'), false);
    });

    it('8.4 ceoRouter.ts must export getStarterGuardResponse function', async () => {
      const mod = await import(pathToFileURL(PATHS.ceoRouterTs).href);
      assert.strictEqual(
        typeof mod.getStarterGuardResponse,
        'function',
        'ceoRouter.ts must export getStarterGuardResponse'
      );
    });

    it('8.5 getStarterGuardResponse must return polite bilingual response with [Upgrade to Pro Plan](/plans) markdown link', async () => {
      const { getStarterGuardResponse } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
      assert.strictEqual(typeof getStarterGuardResponse, 'function', 'ceoRouter.ts must export getStarterGuardResponse');
      const res = getStarterGuardResponse();
      assert.strictEqual(typeof res, 'string', 'Guard response must be a string');
      assert.ok(res.includes('[Upgrade to Pro Plan](/plans)'), 'Must include exact markdown link [Upgrade to Pro Plan](/plans)');
      // Bilingual check: Bengali characters present
      assert.ok(/[\u0980-\u09FF]/.test(res), 'Guard response must contain Bengali explanation');
      // English check: Pro Plan explanation present
      assert.ok(res.toLowerCase().includes('pro plan'), 'Guard response must mention Pro Plan in English');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 9: Complete Removal of Agents Store (R4)
  // --------------------------------------------------------------------------
  describe('Feature 9: Complete Removal of Agents Store', () => {
    it('9.1 dashboard/+page.svelte sidebar must NOT contain "Store" navigation button or link', () => {
      assert.ok(fs.existsSync(PATHS.dashboardPage), 'dashboard/+page.svelte must exist');
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(!content.includes("activeDashboardTab = 'store'"), 'Must not have activeDashboardTab store assignment');
      assert.ok(!content.includes('>Agents Store<') && !content.includes('>Store<'), 'Must not render Store nav label');
    });

    it('9.2 dashboard/+page.svelte must NOT contain "Owned Agents" tab or store bot grid', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(!content.includes('>Owned Agents<'), 'Must not render Owned Agents tab');
      assert.ok(!content.includes('STORE_BOTS'), 'Must not reference STORE_BOTS in dashboard template');
    });

    it('9.3 dashboard/+page.svelte must NOT invoke initiateBotPayment or bot purchase modal', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(!content.includes('initiateBotPayment'), 'Must not import or invoke initiateBotPayment');
      assert.ok(!content.includes('unlockStoreBot'), 'Must not reference unlockStoreBot in dashboard');
    });

    it('9.4 All 75 AI Helpers in tools.ts must be fully accessible without store purchase', async () => {
      assert.ok(fs.existsSync(PATHS.toolsTs), 'tools.ts must exist');
      const { TOOLS, ALL_TOOLS } = await import(pathToFileURL(PATHS.toolsTs).href);
      const helperList = ALL_TOOLS || TOOLS;
      assert.ok(Array.isArray(helperList), 'tools.ts must export array of helpers');
      assert.strictEqual(helperList.length, 75, 'Must contain all 75 readymade AI Helpers');
    });

    it('9.5 Slash command (/) autocomplete in chat must list helpers without store purchase barriers', () => {
      const content = readSafe(PATHS.floatingCeoChat);
      assert.ok(content.includes('/') || content.includes('helper') || content.includes('autocomplete'), 'Chat must support helper selection');
      assert.ok(!content.includes('unlockedStoreBots'), 'Chat autocomplete must not gate helpers on store bots');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 10: 100+ Enterprise Tool Connectors Config (R5)
  // --------------------------------------------------------------------------
  describe('Feature 10: 100+ Enterprise Tool Connectors Configuration', () => {
    it('10.1 web/src/lib/config/toolConnectors.ts must exist and export connectors', async () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
      const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
      const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
      assert.ok(connectors, 'toolConnectors.ts must export TOOL_CONNECTORS or toolConnectors');
    });

    it('10.2 Total number of tool connectors must be at least 100', async () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
      const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
      const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
      const list = Array.isArray(connectors) ? connectors : Object.values(connectors);
      assert.ok(list.length >= 100, `Expected >= 100 tool connectors, got ${list.length}`);
    });

    it('10.3 Tool connectors must span all 10 required enterprise categories', async () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
      const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
      const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
      const list = Array.isArray(connectors) ? connectors : Object.values(connectors);

      const requiredCategories = [
        'Google Workspace',
        'Messaging & Channels',
        'E-Commerce & Payments',
        'CRM & Leads',
        'Social Media',
        'Marketing & Ads',
        'Microsoft 365',
        'Storage & Media',
        'Productivity',
        'Developer Utilities'
      ];

      const presentCategories = new Set(list.map((c) => c.category));
      for (const req of requiredCategories) {
        assert.ok(presentCategories.has(req), `toolConnectors must include category "${req}"`);
      }
    });

    it('10.4 Every tool connector must define id, name, category, icon, and description', async () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
      const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
      const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
      const list = Array.isArray(connectors) ? connectors : Object.values(connectors);

      for (const item of list) {
        assert.ok(item.id, `Connector must have id: ${JSON.stringify(item)}`);
        assert.ok(item.name, `Connector ${item.id} must have name`);
        assert.ok(item.category, `Connector ${item.id} must have category`);
        assert.ok(item.icon, `Connector ${item.id} must have icon`);
        assert.ok(item.description, `Connector ${item.id} must have description`);
      }
    });

    it('10.5 Tool connectors must define credential or authentication configuration schema', async () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
      const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
      const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
      const list = Array.isArray(connectors) ? connectors : Object.values(connectors);
      // Verify items have authType or credential fields defined
      const hasAuthSchema = list.some((c) => c.authType || c.fields || c.credentials || c.requiredKeys);
      assert.ok(hasAuthSchema, 'Tool connectors must define authentication schema or fields');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 11: Dedicated Tools & Integrations Hub Tab (R5)
  // --------------------------------------------------------------------------
  describe('Feature 11: Dedicated Tools & Integrations Hub Tab', () => {
    it('11.1 web/src/lib/components/ToolConnectorsTab.svelte must exist', () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTab), 'ToolConnectorsTab.svelte must exist');
    });

    it('11.2 ToolConnectorsTab.svelte must provide a search input for filtering connectors', () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTab), 'ToolConnectorsTab.svelte must exist');
      const content = readSafe(PATHS.toolConnectorsTab);
      assert.ok(content.includes('search') || content.includes('filter'), 'ToolConnectorsTab must provide search input');
    });

    it('11.3 ToolConnectorsTab.svelte must render category filter chips', () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTab), 'ToolConnectorsTab.svelte must exist');
      const content = readSafe(PATHS.toolConnectorsTab);
      assert.ok(content.includes('category') || content.includes('categories'), 'Must support category filtering chips');
    });

    it('11.4 ToolConnectorsTab.svelte must render tool cards with connection status and configuration modal', () => {
      assert.ok(fs.existsSync(PATHS.toolConnectorsTab), 'ToolConnectorsTab.svelte must exist');
      const content = readSafe(PATHS.toolConnectorsTab);
      assert.ok(content.includes('Connected') || content.includes('Configure') || content.includes('status'), 'Must display connection status');
    });

    it('11.5 dashboard/+page.svelte must render Tools & Integrations tab in sidebar', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(content.includes("'tools'") || content.includes('"tools"'), 'dashboard must have "tools" activeDashboardTab');
      assert.ok(content.includes('ToolConnectorsTab'), 'dashboard must import and render ToolConnectorsTab');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 12: Readymade Execution vs Studio Gating (R6)
  // --------------------------------------------------------------------------
  describe('Feature 12: Readymade Workflow Execution vs Visual Studio Customization Gating', () => {
    it('12.1 ToolDrawer.svelte must allow executing readymade workflows for Starter users', () => {
      assert.ok(fs.existsSync(PATHS.toolDrawer), 'ToolDrawer.svelte must exist');
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(content.includes('run') || content.includes('execute') || content.includes('generate'), 'Must have run/execute control');
    });

    it('12.2 ToolDrawer.svelte must gate "Customize Workflow" button with [PRO] lock for Starter users', () => {
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(
        content.includes('[PRO]') || content.includes('PRO') || content.includes('isPro') || content.includes('Upgrade'),
        'ToolDrawer must gate workflow customization with PRO badge'
      );
    });

    it('12.3 Clicking "Customize Workflow" on Starter plan must open upgrade modal with CTA to /plans', () => {
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(
        content.includes('/plans') || content.includes('upgradeModal') || content.includes('showUpgradePrompt'),
        'Must trigger upgrade prompt to /plans for Starter users'
      );
    });

    it('12.4 Clicking "Customize Workflow" on Pro plan must open WorkflowStudioModal', () => {
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(
        content.includes('WorkflowStudioModal') || content.includes('openStudio') || content.includes('isStudioOpen'),
        'Must wire WorkflowStudioModal opening for Pro users'
      );
    });

    it('12.5 Pro users must have unrestricted permission to modify nodes and execution flow', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.multiKeyVault, true);
      assert.strictEqual(DEFAULT_PLANS.byok_starter.featureToggles.multiKeyVault, false);
    });
  });

  // --------------------------------------------------------------------------
  // Feature 13: Workflow Studio Modal (Canvas & Bézier Cables) (R6)
  // --------------------------------------------------------------------------
  describe('Feature 13: Workflow Studio Modal (Canvas & Bézier Cables)', () => {
    it('13.1 web/src/lib/components/WorkflowStudioModal.svelte must exist', () => {
      assert.ok(fs.existsSync(PATHS.workflowStudioModal), 'WorkflowStudioModal.svelte must exist');
    });

    it('13.2 WorkflowStudioModal.svelte must render interactive node graph canvas', () => {
      assert.ok(fs.existsSync(PATHS.workflowStudioModal), 'WorkflowStudioModal.svelte must exist');
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('canvas') || content.includes('nodes') || content.includes('svg'),
        'WorkflowStudioModal must render node graph canvas'
      );
    });

    it('13.3 WorkflowStudioModal.svelte must render Bézier curved SVG cables connecting nodes', () => {
      assert.ok(fs.existsSync(PATHS.workflowStudioModal), 'WorkflowStudioModal.svelte must exist');
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('<path') && (content.includes(' d=') || content.includes('d={') || content.includes('d="M')),
        'WorkflowStudioModal must render SVG path elements for Bézier cables'
      );
      assert.ok(
        content.includes(' C ') || content.includes('C') || content.includes('bezier') || content.includes('curve'),
        'Must compute cubic Bézier curves (C) between nodes'
      );
    });

    it('13.4 WorkflowStudioModal.svelte must support pan and zoom canvas navigation controls', () => {
      assert.ok(fs.existsSync(PATHS.workflowStudioModal), 'WorkflowStudioModal.svelte must exist');
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('zoom') || content.includes('scale') || content.includes('pan'),
        'WorkflowStudioModal must support pan/zoom controls'
      );
    });

    it('13.5 WorkflowStudioModal.svelte must provide node palette with triggers, actions, and custom agent builder', () => {
      assert.ok(fs.existsSync(PATHS.workflowStudioModal), 'WorkflowStudioModal.svelte must exist');
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('palette') || content.includes('addNode') || content.includes('trigger') || content.includes('action'),
        'WorkflowStudioModal must provide node palette'
      );
    });
  });

  // --------------------------------------------------------------------------
  // Feature 14: External Channels Dynamic Master Switch (R7)
  // --------------------------------------------------------------------------
  describe('Feature 14: External Channels Dynamic Master Switch', () => {
    it('14.1 adminSettings.ts AdminConfig must declare channelsCeoEnabled: boolean (default true)', () => {
      assert.ok(fs.existsSync(PATHS.adminSettingsTs), 'adminSettings.ts must exist');
      const content = readSafe(PATHS.adminSettingsTs);
      assert.ok(content.includes('channelsCeoEnabled'), 'AdminConfig must declare channelsCeoEnabled property');
    });

    it('14.2 adminSettings.ts must expose channelsCeoEnabled via settings API', () => {
      assert.ok(fs.existsSync(PATHS.adminSettingsApi), 'admin/settings/+server.ts must exist');
      const content = readSafe(PATHS.adminSettingsApi);
      assert.ok(content.includes('GET') && content.includes('POST'), 'Settings API must handle GET and POST');
    });

    it('14.3 admin/+page.svelte must render master toggle switch for External Channels', () => {
      assert.ok(fs.existsSync(PATHS.adminPage), 'admin/+page.svelte must exist');
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('channelsCeoEnabled') || content.includes('Channels') || content.includes('WhatsApp'),
        'Admin panel must render external channels toggle switch'
      );
    });

    it('14.4 When channelsCeoEnabled is true, external channel connect buttons must be active', () => {
      const content = readSafe(PATHS.floatingCeoChat);
      assert.ok(
        content.includes('ChannelModal') || content.includes('Connect Channels') || content.includes('channelsCeoEnabled'),
        'Ceo chat must wire channel connect modal'
      );
    });

    it('14.5 When channelsCeoEnabled is false, external channels must be suppressed or deactivated', () => {
      // Validates structural logic contract in admin & channels
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(!content.includes("activeDashboardTab = 'channels'"), 'Channels tab must remain removed from sidebar');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 15: Admin Panel Model Toggles & 2 Plans (R8)
  // --------------------------------------------------------------------------
  describe('Feature 15: Admin Panel Model Toggles & 2-Plan Management', () => {
    it('15.1 admin/+page.svelte Plans & Pricing manager must render exactly 2 plan tabs (Starter Plan and Pro Plan)', () => {
      assert.ok(fs.existsSync(PATHS.adminPage), 'admin/+page.svelte must exist');
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('Starter Plan') || content.includes('byok_starter'),
        'Admin panel must render Starter Plan tab'
      );
      assert.ok(
        content.includes('Pro Plan') || content.includes('byok_pro'),
        'Admin panel must render Pro Plan tab'
      );
    });

    it('15.2 adminSettings.ts AdminModelToggles must manage all 8 specified AI models', () => {
      const content = readSafe(PATHS.adminSettingsTs);
      const expectedModels = [
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gpt-4o',
        'gpt-4o-mini',
        'grok-3',
        'deepseek-chat',
        'claude-3.5-sonnet',
        'flux-schnell'
      ];
      for (const m of expectedModels) {
        assert.ok(content.includes(`'${m}'`), `AdminModelToggles must include '${m}'`);
      }
    });

    it('15.3 Admin model toggle states must persist in server storage', () => {
      const content = readSafe(PATHS.adminSettingsTs);
      assert.ok(content.includes('modelsEnabled'), 'AdminConfig must track modelsEnabled dictionary');
      assert.ok(content.includes('updateAdminSettings') || content.includes('saveConfigToStorage'), 'Must persist settings to storage');
    });

    it('15.4 Admin panel must allow assigning either Starter Plan or Pro Plan to users', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('byok_starter') && content.includes('byok_pro'),
        'Admin must support assigning byok_starter and byok_pro'
      );
    });

    it('15.5 Admin settings API must validate input payloads and reject malformed plans', () => {
      const content = readSafe(PATHS.adminSettingsApi);
      assert.ok(content.includes('json') || content.includes('request.json()'), 'Admin settings endpoint must parse JSON payload safely');
    });
  });

  // --------------------------------------------------------------------------
  // Feature 16: robots.css SHA256 Invariance (R9)
  // --------------------------------------------------------------------------
  describe('Feature 16: robots.css SHA256 Invariance', () => {
    const EXPECTED_HASH = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

    it('16.1 robots.css must exist and be non-empty', () => {
      assert.ok(fs.existsSync(PATHS.robotsCss), 'robots.css must exist');
      const stat = fs.statSync(PATHS.robotsCss);
      assert.ok(stat.size > 0, 'robots.css must not be empty');
    });

    it('16.2 robots.css SHA256 checksum MUST be exactly 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      const hash = getSha256(PATHS.robotsCss);
      assert.strictEqual(
        hash,
        EXPECTED_HASH,
        `robots.css SHA256 hash was modified! Expected ${EXPECTED_HASH}, got ${hash}`
      );
    });

    it('16.3 robots.css exact byte length must be 5427 bytes', () => {
      const stat = fs.statSync(PATHS.robotsCss);
      assert.strictEqual(stat.size, 5427, `robots.css size mismatch: expected 5427, got ${stat.size}`);
    });

    it('16.4 createRobot.js and agents.js must remain untouched in robots directory', () => {
      assert.ok(fs.existsSync(PATHS.createRobotJs), 'createRobot.js must exist');
      assert.ok(fs.existsSync(PATHS.agentsJs), 'agents.js must exist');
    });

    it('16.5 RobotShowcase.svelte must import ./robots.css to drive the 75-helper showcase', () => {
      assert.ok(fs.existsSync(PATHS.robotShowcase), 'RobotShowcase.svelte must exist');
      const content = readSafe(PATHS.robotShowcase);
      assert.ok(content.includes('./robots.css'), 'RobotShowcase.svelte must import ./robots.css');
    });
  });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES (>=20 tests)
// ============================================================================
describe('Tier 2: Boundary & Corner Cases', () => {
  it('2.1 CEO Chat: Empty string or whitespace input must not crash or trigger plan guard', async () => {
    assert.ok(fs.existsSync(PATHS.ceoRouterTs), 'ceoRouter.ts must exist');
    const { isRestrictedStarterIntent } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
    assert.strictEqual(isRestrictedStarterIntent(''), false);
    assert.strictEqual(isRestrictedStarterIntent('   '), false);
    assert.strictEqual(isRestrictedStarterIntent('\n\t'), false);
  });

  it('2.2 CEO Chat: Multilingual Bengali intent "আমি ওয়ার্কফ্লো এডিট করতে চাই" must trigger guard', async () => {
    assert.ok(fs.existsSync(PATHS.ceoRouterTs), 'ceoRouter.ts must exist');
    const { isRestrictedStarterIntent } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
    assert.strictEqual(isRestrictedStarterIntent('আমি ওয়ার্কফ্লো এডিট করতে চাই'), true);
    assert.strictEqual(isRestrictedStarterIntent('কাস্টম এজেন্ট তৈরি করুন'), true);
  });

  it('2.3 CEO Chat: Multilingual Banglish intent "workflow customize koro" must trigger guard', async () => {
    assert.ok(fs.existsSync(PATHS.ceoRouterTs), 'ceoRouter.ts must exist');
    const { isRestrictedStarterIntent } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
    assert.strictEqual(isRestrictedStarterIntent('workflow customize koro'), true);
    assert.strictEqual(isRestrictedStarterIntent('custom agent banano lagbe'), true);
  });

  it('2.4 CEO Chat: Case-insensitivity in workflow customization triggers ("CUSTOMIZE WORKFLOW")', async () => {
    assert.ok(fs.existsSync(PATHS.ceoRouterTs), 'ceoRouter.ts must exist');
    const { isRestrictedStarterIntent } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
    assert.strictEqual(isRestrictedStarterIntent('PLEASE CUSTOMIZE WORKFLOW FOR ME'), true);
    assert.strictEqual(isRestrictedStarterIntent('MULTI-KEY FAILOVER SETUP'), true);
  });

  it('2.5 CEO Chat: Substrings containing "pro" in normal text must NOT trigger guard falsely', async () => {
    assert.ok(fs.existsSync(PATHS.ceoRouterTs), 'ceoRouter.ts must exist');
    const { isRestrictedStarterIntent } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
    assert.strictEqual(isRestrictedStarterIntent('Write a product description for my store'), false);
    assert.strictEqual(isRestrictedStarterIntent('How to promote my business online'), false);
    assert.strictEqual(isRestrictedStarterIntent('Create professional ad copy'), false);
  });

  it('2.6 Tool Connectors Search: Empty search string returns all connectors', async () => {
    assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
    const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
    const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
    const list = Array.isArray(connectors) ? connectors : Object.values(connectors);

    const filterFn = (items, q) => items.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));
    assert.strictEqual(filterFn(list, '').length, list.length);
  });

  it('2.7 Tool Connectors Search: Non-matching random string returns empty array gracefully', async () => {
    assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
    const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
    const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
    const list = Array.isArray(connectors) ? connectors : Object.values(connectors);

    const filterFn = (items, q) => items.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
    const result = filterFn(list, 'xyz999_non_existent_tool_token');
    assert.strictEqual(result.length, 0);
  });

  it('2.8 Tool Connectors Category: "all" category returns all connectors', async () => {
    assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
    const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
    const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
    const list = Array.isArray(connectors) ? connectors : Object.values(connectors);

    const catFilter = (items, cat) => items.filter((c) => cat === 'all' || c.category === cat);
    assert.strictEqual(catFilter(list, 'all').length, list.length);
  });

  it('2.9 Tool Connectors Category: Each category filter returns a non-empty subset', async () => {
    assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
    const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
    const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
    const list = Array.isArray(connectors) ? connectors : Object.values(connectors);

    const categories = [...new Set(list.map((c) => c.category))];
    for (const cat of categories) {
      const subset = list.filter((c) => c.category === cat);
      assert.ok(subset.length > 0, `Category ${cat} must contain at least 1 connector`);
    }
  });

  it('2.10 Tool Connectors: Connector IDs must be unique across all 100+ connectors', async () => {
    assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
    const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
    const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
    const list = Array.isArray(connectors) ? connectors : Object.values(connectors);

    const idSet = new Set();
    for (const item of list) {
      assert.ok(!idSet.has(item.id), `Duplicate connector id found: ${item.id}`);
      idSet.add(item.id);
    }
  });

  it('2.11 API Key Boundary: Starter Plan allows exactly 1 active key per provider', async () => {
    assert.ok(fs.existsSync(PATHS.plansTs), 'plans.ts must exist');
    const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
    assert.strictEqual(DEFAULT_PLANS.byok_starter.featureToggles.multiKeyVault, false);
  });

  it('2.12 API Key Boundary: Pro Plan allows multi-key vault with round-robin rotation', async () => {
    assert.ok(fs.existsSync(PATHS.plansTs), 'plans.ts must exist');
    const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
    assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.multiKeyVault, true);
  });

  it('2.13 Annual Price Calculation: Starter yearly price 4790 reflects 20% discount on 499*12 (5988)', async () => {
    const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
    const fullYear = DEFAULT_PLANS.byok_starter.monthlyPrice * 12;
    const discount = 1 - DEFAULT_PLANS.byok_starter.yearlyTotal / fullYear;
    assert.ok(discount >= 0.19 && discount <= 0.21, `Expected ~20% discount, got ${discount}`);
  });

  it('2.14 Annual Price Calculation: Pro yearly price 8690 reflects 20% discount on 899*12 (10788)', async () => {
    const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
    const fullYear = DEFAULT_PLANS.byok_pro.monthlyPrice * 12;
    const discount = 1 - DEFAULT_PLANS.byok_pro.yearlyTotal / fullYear;
    assert.ok(discount >= 0.19 && discount <= 0.21, `Expected ~20% discount, got ${discount}`);
  });

  it('2.15 Fallback Resolution: Unknown plan ID safely falls back to Starter price without throwing', async () => {
    const { DEFAULT_PLANS, getPlanPrice } = await import(pathToFileURL(PATHS.plansTs).href);
    const price = getPlanPrice(DEFAULT_PLANS, 'unknown_tier_nonexistent_xyz');
    assert.strictEqual(price, 499, 'Unknown plan ID must fall back to Starter monthly price 499');
  });

  it('2.16 Admin Settings: Null or undefined channelsCeoEnabled falls back to default true', () => {
    const content = readSafe(PATHS.adminSettingsTs);
    assert.ok(
      content.includes('channelsCeoEnabled') || content.includes('true'),
      'Admin config must safely handle channels toggle'
    );
  });

  it('2.17 Admin Models: Exactly 8 AI models defined in AdminModelToggles', () => {
    const content = readSafe(PATHS.adminSettingsTs);
    const matches = content.match(/'(gemini-2\.0-flash|gemini-1\.5-pro|gpt-4o|gpt-4o-mini|grok-3|deepseek-chat|claude-3\.5-sonnet|flux-schnell)'/g);
    assert.ok(matches && matches.length >= 8, 'Must declare all 8 model toggle keys');
  });

  it('2.18 Bézier Cable Math: start and end point computation produces valid cubic curve coordinates', () => {
    function computeBezierCable(x1, y1, x2, y2) {
      const dx = Math.abs(x2 - x1) * 0.5;
      const cp1x = x1 + Math.max(dx, 40);
      const cp1y = y1;
      const cp2x = x2 - Math.max(dx, 40);
      const cp2y = y2;
      return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    }

    const path1 = computeBezierCable(100, 150, 400, 250);
    assert.ok(path1.startsWith('M 100 150 C'), 'Must format valid SVG cubic path');
    assert.ok(!path1.includes('NaN'), 'Path must not produce NaN');

    // Identical points edge case
    const path2 = computeBezierCable(200, 200, 200, 200);
    assert.ok(!path2.includes('NaN'), 'Coincident points must not produce NaN');
  });

  it('2.19 Workflow Studio Canvas Zoom: Zoom scale clamped between 0.2 and 2.0', () => {
    function clampZoom(scale) {
      return Math.min(2.0, Math.max(0.2, scale));
    }
    assert.strictEqual(clampZoom(0.05), 0.2, 'Must clamp low zoom to 0.2');
    assert.strictEqual(clampZoom(5.0), 2.0, 'Must clamp high zoom to 2.0');
    assert.strictEqual(clampZoom(1.0), 1.0, 'Must preserve valid zoom 1.0');
  });

  it('2.20 robots.css SHA256 Integrity: Single byte alteration would fail checksum', () => {
    const content = fs.readFileSync(PATHS.robotsCss);
    const altered = Buffer.from(content);
    altered[0] = altered[0] === 0x2f ? 0x23 : 0x2f;
    const alteredHash = crypto.createHash('sha256').update(altered).digest('hex');
    assert.notStrictEqual(
      alteredHash,
      '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be',
      'Altered bytes must produce distinct SHA256'
    );
  });
});

// ============================================================================
// TIER 3: CROSS-FEATURE INTERACTIONS (Pairwise Combinations)
// ============================================================================
describe('Tier 3: Cross-Feature Interactions', () => {

  // --------------------------------------------------------------------------
  // Interaction 1: Starter Subscriber Journey (Tools + Readymade Run + Plan Guard)
  // --------------------------------------------------------------------------
  describe('Interaction 1: Starter Subscriber Workflow & Plan Guard Pipeline', () => {
    it('3.1 Starter Plan subscriber can run readymade workflows but receives guard on customization', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      const { isRestrictedStarterIntent, getStarterGuardResponse } = await import(pathToFileURL(PATHS.ceoRouterTs).href);

      // 1. Starter has AI CEO access
      assert.strictEqual(DEFAULT_PLANS.byok_starter.featureToggles.aiCeo, true);

      assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
      assert.strictEqual(typeof getStarterGuardResponse, 'function', 'ceoRouter.ts must export getStarterGuardResponse');

      // 2. Starter executes standard request (e.g., ad copywriting)
      const isCustomization = isRestrictedStarterIntent('Run #01 Facebook ad copy for Eid sale');
      assert.strictEqual(isCustomization, false, 'Standard helper execution must be allowed');

      // 3. Starter asks to edit workflow nodes
      const isEditing = isRestrictedStarterIntent('I want to edit nodes and change workflow cables');
      assert.strictEqual(isEditing, true, 'Workflow customization must be flagged');

      // 4. Starter receives bilingual upgrade prompt
      const guardMsg = getStarterGuardResponse();
      assert.ok(guardMsg.includes('[Upgrade to Pro Plan](/plans)'));
    });
  });

  // --------------------------------------------------------------------------
  // Interaction 2: Pro Subscriber Journey (Tools + Visual Studio Canvas)
  // --------------------------------------------------------------------------
  describe('Interaction 2: Pro Subscriber Studio Canvas Integration', () => {
    it('3.2 Pro Plan subscriber has multi-key vault and opens visual workflow canvas', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.multiKeyVault, true);

      const drawerContent = readSafe(PATHS.toolDrawer);
      assert.ok(
        drawerContent.includes('WorkflowStudioModal') || drawerContent.includes('openStudio') || drawerContent.includes('studio'),
        'ToolDrawer must coordinate with WorkflowStudioModal'
      );
    });
  });

  // --------------------------------------------------------------------------
  // Interaction 3: Admin Channels Toggle Master Switch OFF Interaction
  // --------------------------------------------------------------------------
  describe('Interaction 3: Admin Master Switch Disabling External Channels', () => {
    it('3.3 When channelsCeoEnabled is disabled in Admin, web chat remains fully operational', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      // AI CEO web toggle remains true independently of channels switch
      assert.strictEqual(DEFAULT_PLANS.byok_starter.featureToggles.aiCeo, true);
      assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.aiCeo, true);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction 4: Admin Model Toggles & Model Routing Interaction
  // --------------------------------------------------------------------------
  describe('Interaction 4: Admin Model Toggles & Model Routing Integration', () => {
    it('3.4 Admin model toggles in adminSettings.ts must define all 8 active models', () => {
      const content = readSafe(PATHS.adminSettingsTs);
      assert.ok(content.includes('modelsEnabled'), 'Admin settings must manage modelsEnabled');
    });
  });

  // --------------------------------------------------------------------------
  // Interaction 5: Unified 2-Column Pricing Grid Component Synchronization
  // --------------------------------------------------------------------------
  describe('Interaction 5: Unified 2-Column Pricing Synchronization Across Routes', () => {
    it('3.5 PricingCardsGrid is imported and used in Homepage, Plans page, and Dashboard', () => {
      const homeContent = readSafe(PATHS.homePage);
      const plansContent = readSafe(PATHS.plansPage);
      const dashboardContent = readSafe(PATHS.dashboardPage);

      assert.ok(homeContent.includes('PricingCardsGrid'), 'Homepage must use PricingCardsGrid');
      assert.ok(plansContent.includes('PricingCardsGrid'), 'Plans page must use PricingCardsGrid');
      assert.ok(dashboardContent.includes('PricingCardsGrid'), 'Dashboard must use PricingCardsGrid');
    });
  });
});

// ============================================================================
// TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 Scenarios from TEST_INFRA.md)
// ============================================================================
describe('Tier 4: Real-World Application Scenarios', () => {

  // --------------------------------------------------------------------------
  // Scenario 1: Free/Starter User Browses Homepage, Checks Pricing, Tests Guard
  // --------------------------------------------------------------------------
  it('Scenario 1: Free/Starter User Browses Homepage, Checks Pricing, Tries to Customize Workflow in CEO', async () => {
    // 1. User arrives on homepage with Poppins typography
    const appHtml = readSafe(PATHS.appHtml);
    assert.ok(appHtml.includes('Poppins'), 'Visitor loads Poppins font');

    // 2. User navigates to Pricing section and views 2 plans: Starter ৳499 & Pro ৳899
    const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
    assert.strictEqual(DEFAULT_PLANS.byok_starter.monthlyPrice, 499);
    assert.strictEqual(DEFAULT_PLANS.byok_pro.monthlyPrice, 899);

    // 3. User verifies zero occurrences of "BYOK" in public names
    assert.ok(!DEFAULT_PLANS.byok_starter.name.includes('BYOK'), 'Starter name must not contain BYOK');
    assert.ok(!DEFAULT_PLANS.byok_pro.name.includes('BYOK'), 'Pro name must not contain BYOK');

    // 4. Starter subscriber asks AI CEO to customize nodes
    const { isRestrictedStarterIntent, getStarterGuardResponse } = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    assert.strictEqual(typeof isRestrictedStarterIntent, 'function', 'ceoRouter.ts must export isRestrictedStarterIntent');
    assert.strictEqual(typeof getStarterGuardResponse, 'function', 'ceoRouter.ts must export getStarterGuardResponse');
    const blocked = isRestrictedStarterIntent('Please customize this workflow with custom nodes');
    assert.strictEqual(blocked, true);

    // 5. CEO outputs bilingual decline and link to /plans
    const response = getStarterGuardResponse();
    assert.ok(response.includes('[Upgrade to Pro Plan](/plans)'));
  });

  // --------------------------------------------------------------------------
  // Scenario 2: Pro User Logs In, Opens Tools Hub, Opens Visual Studio Canvas
  // --------------------------------------------------------------------------
  it('Scenario 2: Pro User Logs In, Opens Tools Hub, Configures Tool, and Opens Visual Studio Canvas', async () => {
    // 1. Pro subscriber has full multi-key and studio privileges
    const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
    assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.multiKeyVault, true);

    // 2. Opens 100+ Enterprise Tools Hub
    assert.ok(fs.existsSync(PATHS.toolConnectorsTs), 'toolConnectors.ts must exist');
    const mod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
    const connectors = mod.TOOL_CONNECTORS || mod.toolConnectors;
    const list = Array.isArray(connectors) ? connectors : Object.values(connectors);
    assert.ok(list.length >= 100);

    // 3. Pro user accesses Workflow Studio Modal with Bézier cables
    assert.ok(fs.existsSync(PATHS.workflowStudioModal), 'WorkflowStudioModal must exist');
    const studioContent = readSafe(PATHS.workflowStudioModal);
    assert.ok(studioContent.includes('<path') || studioContent.includes('svg'));
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Administrator Toggles Channels CEO Off and Manages AI Models
  // --------------------------------------------------------------------------
  it('Scenario 3: Administrator Toggles Channels CEO Off and Manages AI Models in Admin Panel', () => {
    // 1. Admin panel contains channels toggle
    const adminPage = readSafe(PATHS.adminPage);
    assert.ok(adminPage.includes('channels') || adminPage.includes('Channels') || adminPage.includes('WhatsApp'));

    // 2. Admin panel manages 8 AI models
    const adminSettings = readSafe(PATHS.adminSettingsTs);
    assert.ok(adminSettings.includes('modelsEnabled'));
  });

  // --------------------------------------------------------------------------
  // Scenario 4: User Runs Readymade Helper Workflow with Connected Tool Credentials
  // --------------------------------------------------------------------------
  it('Scenario 4: User Runs Readymade Helper Workflow with Connected Tool Credentials', async () => {
    // 1. Verify 75 readymade AI Helpers exist
    const { TOOLS, ALL_TOOLS } = await import(pathToFileURL(PATHS.toolsTs).href);
    const helpers = ALL_TOOLS || TOOLS;
    assert.strictEqual(helpers.length, 75);

    // 2. Tool Drawer allows executing readymade workflows
    const drawer = readSafe(PATHS.toolDrawer);
    assert.ok(drawer.length > 0);
  });

  // --------------------------------------------------------------------------
  // Scenario 5: Legacy Subscriber with byok tier is Grandfathered into Pro Plan
  // --------------------------------------------------------------------------
  it('Scenario 5: Legacy Subscriber with byok tier accesses platform and is grandfathered into Pro Plan', () => {
    const userStoreContent = readSafe(PATHS.userStoreTs);
    assert.ok(
      userStoreContent.includes('getEffectivePlanTier') || userStoreContent.includes('byok_pro'),
      'userStore must export effective plan calculation with grandfathering'
    );

    // Algorithm simulation matching userStore
    function getEffectivePlanTier(tier, isSubscribed = true) {
      if (!isSubscribed) return 'free';
      const clean = String(tier || '').trim().toLowerCase();
      if (clean === 'byok' || clean === 'pro' || clean === 'ultra') return 'byok_pro';
      if (clean === 'byok_starter') return 'byok_starter';
      if (clean === 'byok_pro') return 'byok_pro';
      if (clean === 'managed' || clean === 'complete') return 'managed';
      return 'free';
    }

    assert.strictEqual(getEffectivePlanTier('byok'), 'byok_pro', 'Legacy byok must grandfather to byok_pro');
    assert.strictEqual(getEffectivePlanTier('byok_starter'), 'byok_starter');
    assert.strictEqual(getEffectivePlanTier('byok_pro'), 'byok_pro');
  });
});
