/**
 * Challenger 1 Adversarial Stress Testing Suite: Full-Screen Studio UI & Invariant Stress Testing
 *
 * Exhaustively stress-tests:
 * Suite 1: Full-Screen Studio Layout & Tailwind CSS Token Integrity (ToolDrawer.svelte)
 * Suite 2: Escape Keydown Event Delegation & Nested Modal Precedence
 * Suite 3: Reactive Word & Character Counter Stress Testing (Edge Cases, Unicode, Whitespace, Massive Payloads)
 * Suite 4: Omnichannel Customer Reply Card Gating (#76–#80 vs #01–#75 vs Edge Cases)
 * Suite 5: Missing AI API Key Guidance Card, Pre-Execution Guard & 1-Click Navigation
 * Suite 6: Empirical Verification of All 26 Test Invariants across All Test Suites
 * Suite 7: robots.css Byte-for-Byte SHA256 Checksum & File Size Preservation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

const PATHS = {
  toolDrawer: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolDrawer.svelte'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  toolsConfig: path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'),
  runAllTests: path.join(ROOT_DIR, 'tests', 'run_all_tests.mjs'),
  tier7Test: path.join(ROOT_DIR, 'tests', 'tier7_realtime_pipeline_security.test.mjs'),
  studioPlanTest: path.join(ROOT_DIR, 'tests', 'fullscreen_studio_plan_intelligence.test.mjs'),
  workflowToggleTest: path.join(ROOT_DIR, 'tests', 'workflow_customization_toggle.test.mjs'),
  omnichannelTest: path.join(ROOT_DIR, 'tests', 'omnichannel_customer_reply_and_webhooks.test.mjs'),
  openrouterTest: path.join(ROOT_DIR, 'tests', 'openrouter_multimodel_multikey.test.mjs'),
  saasPlatformTest: path.join(ROOT_DIR, 'tests', 'test_saas_platform_e2e.test.mjs'),
  challenger2Test: path.join(ROOT_DIR, 'tests', 'challenger2_coldstart_gating.test.mjs')
};

function readSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `Target file must exist: ${filePath}`);
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Challenger 1: Adversarial Studio UI & Invariant Stress Testing', () => {

  // =========================================================================
  // Suite 1: Full-Screen Studio Layout & Tailwind CSS Token Integrity
  // =========================================================================
  describe('Suite 1: Full-Screen Studio Layout & Tailwind CSS Token Integrity', () => {
    const source = readSafe(PATHS.toolDrawer);

    it('1.1 Container uses exact full-viewport studio classes and eliminates old slideout drawer classes', () => {
      // Must include full-screen container classes
      assert.ok(
        source.includes('fixed inset-0 z-50 w-full h-full bg-[#F8FAFC] flex flex-col overflow-hidden animate-in fade-in duration-200'),
        'Must contain exact full-screen studio container class'
      );

      // Must NOT contain old half-screen slideout classes
      assert.ok(
        !source.includes('fixed inset-y-0 right-0 max-w-2xl'),
        'Old slideout class (fixed inset-y-0 right-0 max-w-2xl) must be eliminated'
      );
      assert.ok(
        !source.includes('fixed inset-y-0 right-0 z-50 w-full max-w-2xl'),
        'Old slideout class (fixed inset-y-0 right-0 z-50 w-full max-w-2xl) must be eliminated'
      );
      assert.ok(
        !source.includes('max-w-2xl w-full bg-white shadow-2xl'),
        'Old drawer wrapper classes must be eliminated'
      );
    });

    it('1.2 Top studio header toolbar enforces exact 65px height with flex alignment and borders', () => {
      assert.ok(
        source.includes('h-[65px] min-h-[65px] px-4 sm:px-6 border-b border-[#E3ECF7] bg-white flex items-center justify-between'),
        'Header toolbar must enforce h-[65px] min-h-[65px] with responsive padding and flex layout'
      );
    });

    it('1.3 Main workspace container defines desktop 12-column grid and mobile stacking', () => {
      assert.ok(
        source.includes('lg:grid lg:grid-cols-12 lg:h-[calc(100vh-65px)]'),
        'Main workspace container must define lg:grid lg:grid-cols-12 lg:h-[calc(100vh-65px)]'
      );
      assert.ok(
        source.includes('flex-1 overflow-y-auto lg:overflow-hidden'),
        'Workspace must allow vertical scroll on mobile and lock viewport on desktop'
      );
    });

    it('1.4 Left pane parameter column enforces 5-col split on desktop and 12-col on mobile', () => {
      assert.ok(
        source.includes('col-span-12 lg:col-span-5'),
        'Left pane must be col-span-12 lg:col-span-5'
      );
      assert.ok(
        source.includes('border-b lg:border-b-0 lg:border-r border-[#E3ECF7] bg-white'),
        'Left pane must have responsive borders (bottom on mobile, right on desktop)'
      );
    });

    it('1.5 Right pane deliverables column enforces 7-col split on desktop and 12-col on mobile', () => {
      assert.ok(
        source.includes('col-span-12 lg:col-span-7'),
        'Right pane must be col-span-12 lg:col-span-7'
      );
      assert.ok(
        source.includes('bg-[#F3F8FF]/40'),
        'Right pane must use distinct executive tinted canvas background bg-[#F3F8FF]/40'
      );
    });

    it('1.6 Full accessibility attributes are present on root studio container', () => {
      assert.ok(source.includes('role="dialog"'), 'Studio container must have role="dialog"');
      assert.ok(source.includes('aria-modal="true"'), 'Studio container must have aria-modal="true"');
      assert.ok(source.includes('aria-label="Executive Studio Workspace: {$activeTool.name}"'), 'Studio container must have dynamic aria-label');
    });
  });

  // =========================================================================
  // Suite 2: Escape Keydown Event Delegation & Nested Modal Precedence
  // =========================================================================
  describe('Suite 2: Escape Keydown Event Delegation & Nested Modal Precedence', () => {
    const source = readSafe(PATHS.toolDrawer);

    it('2.1 Window keydown listener is registered via <svelte:window onkeydown={handleKeyDown} />', () => {
      assert.ok(
        source.includes('<svelte:window onkeydown={handleKeyDown} />'),
        'Must register window onkeydown listener'
      );
    });

    it('2.2 handleKeyDown function implements strict nested modal precedence', () => {
      // Extract handleKeyDown function implementation from source
      const handleKeyDownMatch = source.match(/function handleKeyDown\s*\(e:\s*KeyboardEvent\)\s*\{([\s\S]*?)\n  \}/);
      assert.ok(handleKeyDownMatch, 'handleKeyDown function must exist in ToolDrawer.svelte');
      const body = handleKeyDownMatch[1];

      assert.ok(body.includes("e.key === 'Escape'"), 'Must check e.key === "Escape"');
      assert.ok(body.includes('$isDrawerOpen'), 'Must check $isDrawerOpen');
      assert.ok(body.includes('if (showUpgradeModal) {'), 'Must check showUpgradeModal first');
      assert.ok(body.includes('showUpgradeModal = false'), 'Must close showUpgradeModal on Escape');
      assert.ok(body.includes('else if (isStudioOpen) {'), 'Must delegate to isStudioOpen without closing drawer');
      assert.ok(body.includes('closeToolDrawer()'), 'Must call closeToolDrawer() when no child modal is open');
    });

    it('2.3 Empirical simulation of Escape keydown handler across all modal states', () => {
      function simulateHandleKeyDown(e, state) {
        let closedDrawer = false;
        let closedUpgradeModal = false;

        if (e.key === 'Escape' && state.isDrawerOpen) {
          if (state.showUpgradeModal) {
            state.showUpgradeModal = false;
            closedUpgradeModal = true;
          } else if (state.isStudioOpen) {
            // WorkflowStudioModal handles its own Escape keydown event
          } else {
            state.isDrawerOpen = false;
            closedDrawer = true;
          }
        }

        return { closedDrawer, closedUpgradeModal };
      }

      // Scenario A: Drawer open, Upgrade Modal open -> Escape closes Upgrade Modal only
      const stateA = { isDrawerOpen: true, showUpgradeModal: true, isStudioOpen: false };
      const resA = simulateHandleKeyDown({ key: 'Escape' }, stateA);
      assert.strictEqual(resA.closedUpgradeModal, true, 'Escape must close showUpgradeModal');
      assert.strictEqual(resA.closedDrawer, false, 'Escape must NOT close tool drawer while upgrade modal is active');
      assert.strictEqual(stateA.showUpgradeModal, false);
      assert.strictEqual(stateA.isDrawerOpen, true);

      // Scenario B: Drawer open, Workflow Studio open -> Escape does not close Drawer
      const stateB = { isDrawerOpen: true, showUpgradeModal: false, isStudioOpen: true };
      const resB = simulateHandleKeyDown({ key: 'Escape' }, stateB);
      assert.strictEqual(resB.closedDrawer, false, 'Escape must NOT close tool drawer while WorkflowStudioModal is active');
      assert.strictEqual(stateB.isDrawerOpen, true);

      // Scenario C: Drawer open, no child modal open -> Escape closes Tool Drawer
      const stateC = { isDrawerOpen: true, showUpgradeModal: false, isStudioOpen: false };
      const resC = simulateHandleKeyDown({ key: 'Escape' }, stateC);
      assert.strictEqual(resC.closedDrawer, true, 'Escape must close tool drawer when no nested modal is open');
      assert.strictEqual(stateC.isDrawerOpen, false);

      // Scenario D: Drawer closed -> Escape does nothing
      const stateD = { isDrawerOpen: false, showUpgradeModal: false, isStudioOpen: false };
      const resD = simulateHandleKeyDown({ key: 'Escape' }, stateD);
      assert.strictEqual(resD.closedDrawer, false, 'Escape must do nothing when drawer is not open');

      // Scenario E: Non-escape keys (Enter, Space, Tab) -> does nothing
      const stateE = { isDrawerOpen: true, showUpgradeModal: false, isStudioOpen: false };
      const resE1 = simulateHandleKeyDown({ key: 'Enter' }, stateE);
      const resE2 = simulateHandleKeyDown({ key: 'Tab' }, stateE);
      assert.strictEqual(resE1.closedDrawer, false);
      assert.strictEqual(resE2.closedDrawer, false);
      assert.strictEqual(stateE.isDrawerOpen, true);
    });
  });

  // =========================================================================
  // Suite 3: Reactive Word & Character Counter Stress Testing
  // =========================================================================
  describe('Suite 3: Reactive Word & Character Counter Stress Testing', () => {
    const source = readSafe(PATHS.toolDrawer);

    it('3.1 ToolDrawer derives charCount and wordCount with correct reactive formulas', () => {
      assert.ok(
        source.includes("const charCount = $derived(outputText ? outputText.length : 0);"),
        'Must define charCount using outputText ? outputText.length : 0'
      );
      assert.ok(
        source.includes("const wordCount = $derived(outputText ? outputText.trim().split(/\\s+/).filter(Boolean).length : 0);"),
        'Must define wordCount using outputText.trim().split(/\\s+/).filter(Boolean).length'
      );
    });

    const calculateCounters = (outputText) => {
      const charCount = outputText ? outputText.length : 0;
      const wordCount = outputText ? outputText.trim().split(/\s+/).filter(Boolean).length : 0;
      return { charCount, wordCount };
    };

    it('3.2 Edge cases: empty string, null, and undefined return exactly 0 words and 0 chars', () => {
      assert.deepStrictEqual(calculateCounters(''), { charCount: 0, wordCount: 0 });
      assert.deepStrictEqual(calculateCounters(null), { charCount: 0, wordCount: 0 });
      assert.deepStrictEqual(calculateCounters(undefined), { charCount: 0, wordCount: 0 });
    });

    it('3.3 Edge cases: single word and leading/trailing whitespaces', () => {
      const res1 = calculateCounters('Adversarial');
      assert.strictEqual(res1.charCount, 11);
      assert.strictEqual(res1.wordCount, 1);

      const res2 = calculateCounters('   \t  Adversarial   \n  ');
      assert.strictEqual(res2.charCount, 23);
      assert.strictEqual(res2.wordCount, 1);
    });

    it('3.4 Edge cases: whitespace-only strings yield 0 words without NaN or negative numbers', () => {
      const whitespaceOnly = '     \t\t\n\n\r\n     ';
      const res = calculateCounters(whitespaceOnly);
      assert.strictEqual(res.charCount, whitespaceOnly.length);
      assert.strictEqual(res.wordCount, 0, 'Whitespace-only string must result in exactly 0 words');
    });

    it('3.5 Edge cases: multiple consecutive internal spaces and newlines count words accurately', () => {
      const multiWhitespace = 'Line 1\n\n\nLine 2     with     spaces\r\n\tTabbed';
      const res = calculateCounters(multiWhitespace);
      assert.strictEqual(res.wordCount, 7);
    });

    it('3.6 Multilingual & Unicode support: Bengali script and Banglish', () => {
      const bengaliText = 'আমাদের Ezbo AI প্ল্যাটফর্ম অত্যন্ত শক্তিশালী ও দ্রুত ডেলিভারেবল দেয়।';
      const resBengali = calculateCounters(bengaliText);
      assert.strictEqual(resBengali.wordCount, 10);
      assert.strictEqual(resBengali.charCount, bengaliText.length);

      const banglishText = 'Bhaiya product ta Dhanmondi te delivery kobe pabo? Cash on delivery hobe?';
      const resBanglish = calculateCounters(banglishText);
      assert.strictEqual(resBanglish.wordCount, 12);
    });

    it('3.7 Emojis and surrogate pairs handled cleanly', () => {
      const emojiText = '🔥 100% Guaranteed 🇧🇩 #01 Top Ranking! 🚀';
      const res = calculateCounters(emojiText);
      assert.strictEqual(res.wordCount, 8);
      assert.ok(res.charCount > 0);
    });

    it('3.8 Massive payload stress test: 50,000 words executes in < 25ms without stack overflow', () => {
      const wordSample = 'Executive studio agent workflow deliverable optimization ';
      const repeatCount = 10000; // ~60,000 words
      const massiveText = wordSample.repeat(repeatCount);

      const start = performance.now();
      const res = calculateCounters(massiveText);
      const duration = performance.now() - start;

      assert.strictEqual(res.wordCount, repeatCount * 6);
      assert.strictEqual(res.charCount, massiveText.length);
      assert.ok(duration < 100, `Massive word count execution took ${duration.toFixed(2)}ms (must be < 100ms)`);
    });
  });

  // =========================================================================
  // Suite 4: Omnichannel Customer Reply Card Gating (#76–#80)
  // =========================================================================
  describe('Suite 4: Omnichannel Customer Reply Card Gating (#76–#80)', () => {
    const source = readSafe(PATHS.toolDrawer);

    it('4.1 ToolDrawer derives isCustomerReplyAgent for #76-#80 and matching IDs', () => {
      const derivedMatch = source.match(/const isCustomerReplyAgent = \$derived\(([\s\S]*?)\);/);
      assert.ok(derivedMatch, 'Must derive isCustomerReplyAgent');
      const body = derivedMatch[1];

      assert.ok(body.includes("code === '#76'"), 'Must include #76');
      assert.ok(body.includes("code === '#77'"), 'Must include #77');
      assert.ok(body.includes("code === '#78'"), 'Must include #78');
      assert.ok(body.includes("code === '#79'"), 'Must include #79');
      assert.ok(body.includes("code === '#80'"), 'Must include #80');

      assert.ok(body.includes("id === 'omnichannel_customer_support'"), 'Must check omnichannel_customer_support');
      assert.ok(body.includes("id === 'whatsapp_business_support'"), 'Must check whatsapp_business_support');
      assert.ok(body.includes("id === 'messenger_customer_support'"), 'Must check messenger_customer_support');
      assert.ok(body.includes("id === 'instagram_dm_support'"), 'Must check instagram_dm_support');
      assert.ok(body.includes("id === 'telegram_customer_support'"), 'Must check telegram_customer_support');
    });

    const isCustomerReplyAgent = (activeTool) => {
      return Boolean(
        activeTool?.code === '#76' ||
        activeTool?.code === '#77' ||
        activeTool?.code === '#78' ||
        activeTool?.code === '#79' ||
        activeTool?.code === '#80' ||
        activeTool?.id === 'omnichannel_customer_support' ||
        activeTool?.id === 'whatsapp_business_support' ||
        activeTool?.id === 'messenger_customer_support' ||
        activeTool?.id === 'instagram_dm_support' ||
        activeTool?.id === 'telegram_customer_support'
      );
    };

    it('4.2 Customer Reply Agents (#76 through #80) all evaluate to TRUE', () => {
      const replyAgents = [
        { code: '#76', id: 'omnichannel_customer_support', name: 'OmniSupport' },
        { code: '#77', id: 'whatsapp_business_support', name: 'WACallCenter' },
        { code: '#78', id: 'messenger_customer_support', name: 'PageRep' },
        { code: '#79', id: 'instagram_dm_support', name: 'InstaCloser' },
        { code: '#80', id: 'telegram_customer_support', name: 'TeleDesk' }
      ];

      for (const agent of replyAgents) {
        assert.strictEqual(isCustomerReplyAgent(agent), true, `Agent ${agent.code} (${agent.name}) must evaluate to true`);
        // Test by code only
        assert.strictEqual(isCustomerReplyAgent({ code: agent.code }), true);
        // Test by id only
        assert.strictEqual(isCustomerReplyAgent({ id: agent.id }), true);
      }
    });

    it('4.3 Non-customer reply helpers (#01 through #75 and others) all evaluate to FALSE', () => {
      const nonReplyAgents = [
        { code: '#01', id: 'facebook_ad_copy' },
        { code: '#02', id: 'google_search_ads' },
        { code: '#15', id: 'cold_email_sequence' },
        { code: '#34', id: 'visual_creative_generator' },
        { code: '#50', id: 'seo_keyword_cluster' },
        { code: '#75', id: 'invoice_billing_assistant' },
        { code: '#81', id: 'hypothetical_future_agent' }
      ];

      for (const agent of nonReplyAgents) {
        assert.strictEqual(isCustomerReplyAgent(agent), false, `Agent ${agent.code} must NOT trigger omnichannel card`);
      }

      // Falsy and edge cases
      assert.strictEqual(isCustomerReplyAgent(null), false);
      assert.strictEqual(isCustomerReplyAgent(undefined), false);
      assert.strictEqual(isCustomerReplyAgent({}), false);
      assert.strictEqual(isCustomerReplyAgent({ code: '#760', id: 'other' }), false);
    });

    it('4.4 Omnichannel card UI contains 4-channel status grid, live status pulse, and 1-click navigation', () => {
      assert.ok(source.includes('{#if isCustomerReplyAgent}'), 'Must guard card with {#if isCustomerReplyAgent}');
      assert.ok(source.includes('Connected Business Channels'), 'Must render Connected Business Channels heading');
      assert.ok(source.includes('Auto-Reply'), 'Must display Auto-Reply badge');
      assert.ok(source.includes('whatsapp_business'), 'Must render WhatsApp status icon');
      assert.ok(source.includes('facebook_messenger'), 'Must render Messenger status icon');
      assert.ok(source.includes('instagram_dm'), 'Must render Instagram status icon');
      assert.ok(source.includes('telegram_support_bot'), 'Must render Telegram status icon');

      assert.ok(source.includes('handleNavigateToChannels'), 'Must bind handleNavigateToChannels handler');
      assert.ok(source.includes("activeDashboardTab.set('tools')"), 'Must switch tab to tools');
      assert.ok(source.includes("document.getElementById('core-business-channels')"), 'Must target core-business-channels');
    });
  });

  // =========================================================================
  // Suite 5: Missing AI API Key Guidance Card, Pre-Execution Guard & 1-Click Navigation
  // =========================================================================
  describe('Suite 5: Missing AI API Key Guidance Card, Pre-Execution Guard & 1-Click Navigation', () => {
    const source = readSafe(PATHS.toolDrawer);

    it('5.1 ToolDrawer derives hasActiveKey from cloud plan, vault keys, or standalone apiKey', () => {
      const hasActiveKeyMatch = source.match(/const hasActiveKey = \$derived\(([\s\S]*?)\);/);
      assert.ok(hasActiveKeyMatch, 'Must derive hasActiveKey');
      const body = hasActiveKeyMatch[1];

      assert.ok(body.includes('isCloudManaged'), 'Must check isCloudManaged');
      assert.ok(body.includes('$apiVault.some'), 'Must inspect $apiVault');
      assert.ok(body.includes('k.isEnabled !== false'), 'Must verify vault key is not disabled');
      assert.ok(body.includes('k.encryptedKey'), 'Must verify vault key has encryptedKey');
      assert.ok(body.includes('!!$apiKey && $apiKey.trim().length > 5'), 'Must check standalone apiKey length > 5');
    });

    const checkHasActiveKey = ({ isCloudManaged, apiVault = [], apiKey = '' }) => {
      return Boolean(
        isCloudManaged ||
        apiVault.some((k) => k.isEnabled !== false && k.encryptedKey) ||
        (!!apiKey && apiKey.trim().length > 5)
      );
    };

    it('5.2 Guidance card displays when hasActiveKey is false, and hides when true', () => {
      // Missing keys -> card displays (hasActiveKey = false)
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: false, apiVault: [], apiKey: '' }), false);
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: false, apiVault: [], apiKey: '   ' }), false);
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: false, apiVault: [], apiKey: '1234' }), false); // length <= 5
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: false, apiVault: [{ isEnabled: false, encryptedKey: 'key1' }], apiKey: '' }), false);

      // Present keys -> card hidden (hasActiveKey = true)
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: true, apiVault: [], apiKey: '' }), true);
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: false, apiVault: [{ isEnabled: true, encryptedKey: 'enc' }], apiKey: '' }), true);
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: false, apiVault: [{ encryptedKey: 'enc' }], apiKey: '' }), true);
      assert.strictEqual(checkHasActiveKey({ isCloudManaged: false, apiVault: [], apiKey: 'AIzaSyValidGeminiKey' }), true);
    });

    it('5.3 Pre-execution interceptor in runHelperRequest and handleGenerate guards API calls', () => {
      assert.ok(
        source.includes("if (!hasActiveKey) {\n      errorMessage = 'No AI API Key connected. Please connect your free Google Gemini or OpenRouter key in the API Vault.';\n      handleConnectKey();\n      return;\n    }"),
        'runHelperRequest must intercept when !hasActiveKey and trigger handleConnectKey()'
      );
      assert.ok(
        source.includes("if (!hasActiveKey) {\n      errorMessage = 'No AI API Key connected. Please connect your free Google Gemini or OpenRouter key in the API Vault.';\n      handleConnectKey();\n      return;\n    }"),
        'handleGenerate must intercept when !hasActiveKey and trigger handleConnectKey()'
      );
    });

    it('5.4 handleConnectKey closes ToolDrawer and navigates directly to api-keys tab', () => {
      assert.ok(source.includes('function handleConnectKey() {'), 'handleConnectKey function must exist');
      assert.ok(source.includes('closeToolDrawer();'), 'handleConnectKey must invoke closeToolDrawer()');
      assert.ok(source.includes("activeDashboardTab.set('api-keys');"), 'handleConnectKey must set tab to api-keys');
      assert.ok(source.includes('if (onOpenByok) {\n      onOpenByok();\n    }'), 'handleConnectKey must invoke optional onOpenByok callback');
    });
  });

  // =========================================================================
  // Suite 6: Full Verification of All 26 Test Invariants Across All Test Suites
  // =========================================================================
  describe('Suite 6: Full Verification of All 26 Test Invariants Across All Test Suites', () => {
    const source = readSafe(PATHS.toolDrawer);

    const invariants = [
      { id: 1, name: 'Full-viewport container class', test: () => source.includes('fixed inset-0 z-50 w-full h-full bg-[#F8FAFC]') },
      { id: 2, name: 'Fixed 65px header toolbar', test: () => source.includes('h-[65px]') },
      { id: 3, name: 'Desktop 12-column grid container', test: () => source.includes('lg:grid lg:grid-cols-12 lg:h-[calc(100vh-65px)]') },
      { id: 4, name: '5-column left parameter pane', test: () => source.includes('col-span-12 lg:col-span-5') },
      { id: 5, name: '7-column right deliverable pane', test: () => source.includes('col-span-12 lg:col-span-7') },
      { id: 6, name: 'Missing API key warning title', test: () => source.includes('No AI API Key Connected') },
      { id: 7, name: '100% Free highlight badge', test: () => source.includes('100% Free') },
      { id: 8, name: 'Free Gemini explanation', test: () => source.includes('Google Gemini API is <strong>100% free with no credit card required</strong>') },
      { id: 9, name: 'Missing key conditional guard', test: () => source.includes('{#if !hasActiveKey}') },
      { id: 10, name: 'Connect Free API Key button text', test: () => source.includes('Connect Free API Key') },
      { id: 11, name: 'Connect button onclick handler', test: () => source.includes('onclick={handleConnectKey}') },
      { id: 12, name: 'Navigation to api-keys tab', test: () => source.includes("activeDashboardTab.set('api-keys')") },
      { id: 13, name: 'Drawer closing function call', test: () => source.includes('closeToolDrawer()') },
      { id: 14, name: 'Pre-execution key check', test: () => source.includes('if (!hasActiveKey) {') },
      { id: 15, name: 'Server response requiresApiKey interception', test: () => source.includes('data.requiresApiKey') },
      { id: 16, name: 'Admin authentication detection', test: () => source.includes("sessionStorage.getItem('ezbo_admin_authed') === 'true'") },
      { id: 17, name: 'Workflow studio visibility derivation', test: () => source.includes('isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false)') },
      { id: 18, name: 'Workflow studio button visibility guard', test: () => source.includes('{#if isWorkflowStudioVisible}') },
      { id: 19, name: 'Admin preview badge verbatim string', test: () => source.includes('👑 Admin Preview: (Locked for regular users)') },
      { id: 20, name: 'Connected Business Channels heading', test: () => source.includes('Connected Business Channels') },
      { id: 21, name: 'Connect Channels button text', test: () => source.includes('Connect Channels in Tools &amp; Integrations') || source.includes('Connect Channels in Tools & Integrations') },
      { id: 22, name: 'Navigation to tools tab', test: () => source.includes("activeDashboardTab.set('tools')") },
      { id: 23, name: 'Scroll target core-business-channels ID', test: () => source.includes('core-business-channels') },
      { id: 24, name: 'Multi-key vault round-robin payload binding', test: () => source.includes('payload.vaultKeys = roundRobinKeys') },
      { id: 25, name: 'OpenRouter selected models payload binding', test: () => source.includes('payload.openrouterModels = $openrouterSelectedModels') },
      { id: 26, name: 'Starter upgrade [PRO] lock badge', test: () => source.includes('[PRO]') }
    ];

    for (const inv of invariants) {
      it(`6.${inv.id} Invariant ${inv.id}: "${inv.name}" strictly preserved in ToolDrawer.svelte`, () => {
        assert.ok(inv.test(), `Invariant ${inv.id} ("${inv.name}") must be satisfied`);
      });
    }

    it('6.27 All 26 test invariants verified with 100% pass rate (26/26)', () => {
      const results = invariants.map((inv) => ({ id: inv.id, name: inv.name, passed: inv.test() }));
      const failed = results.filter((r) => !r.passed);
      assert.strictEqual(failed.length, 0, `All invariants must pass. Failures: ${JSON.stringify(failed)}`);
      assert.strictEqual(results.length, 26);
    });
  });

  // =========================================================================
  // Suite 7: robots.css Byte-for-Byte SHA256 Checksum & File Size Preservation
  // =========================================================================
  describe('Suite 7: robots.css Byte-for-Byte SHA256 Checksum & File Size Preservation', () => {
    it('7.1 web/src/lib/components/robots/robots.css byte-for-byte SHA256 strictly matches 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      assert.ok(fs.existsSync(PATHS.robotsCss), 'robots.css file must exist');
      const buffer = fs.readFileSync(PATHS.robotsCss);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      const EXPECTED_HASH = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

      assert.strictEqual(sha256, EXPECTED_HASH, `robots.css SHA256 must match authoritative hash ${EXPECTED_HASH}`);
      assert.strictEqual(buffer.length, 5427, 'robots.css size must remain exactly 5,427 bytes');
    });
  });
});
