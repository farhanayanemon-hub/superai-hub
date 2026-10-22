/**
 * Comprehensive Automated Test Suite: Full-Screen Agent Studio Workspace & Real-Time Plan Intelligence
 * Verifies Requirements R1, R2, R3, and R4 from ORIGINAL_REQUEST.md:
 * - Section 1: Full-Screen Studio Layout & Container Architecture (ToolDrawer.svelte)
 * - Section 2: Safety & Critical Invariant Preservation (ToolDrawer.svelte)
 * - Section 3: Real-Time Plan Intelligence in Chat Server (api/chat/+server.ts)
 * - Section 4: Dynamic Plan Capability & Awareness Directive in AI CEO Router (ceoRouter.ts)
 * - Section 5: Checksum & Platform Invariants (robots.css SHA256 & Strict 7-Tier Invariant)
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
  // Already registered
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

const PATHS = {
  toolDrawerSvelte: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolDrawer.svelte'),
  chatServerTs: path.join(WEB_DIR, 'src', 'routes', 'api', 'chat', '+server.ts'),
  ceoRouterTs: path.join(WEB_DIR, 'src', 'lib', 'services', 'ceoRouter.ts'),
  plansConfigTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts'),
  toolsConfigTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'),
  toolConnectorsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'toolConnectors.ts'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  runAllTests: path.join(ROOT_DIR, 'tests', 'run_all_tests.mjs'),
  tier7Test: path.join(ROOT_DIR, 'tests', 'tier7_realtime_pipeline_security.test.mjs')
};

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

export function runFullscreenStudioAndPlanIntelligenceTests(describeFn = describe, itFn = it) {
  // =========================================================================
  // Section 1: Full-Screen Studio Layout & Container Architecture (ToolDrawer.svelte)
  // =========================================================================
  describeFn('Section 1: Full-Screen Studio Layout & Container Architecture (ToolDrawer.svelte)', () => {
    itFn('1.1 Expansive full-viewport studio container replaces half-screen right drawer', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Verify new executive studio container class per R1
      assert.ok(
        content.includes('fixed inset-0 z-50 w-full h-full bg-[#F8FAFC] flex flex-col overflow-hidden animate-in fade-in duration-200'),
        'ToolDrawer must use full-screen executive studio container classes'
      );

      // Verify old half-screen drawer panel is eliminated
      assert.ok(
        !content.includes('fixed inset-y-0 right-0 max-w-2xl'),
        'Old half-screen right drawer container (fixed inset-y-0 right-0 max-w-2xl) must be eliminated'
      );
      assert.ok(
        !content.includes('fixed inset-y-0 right-0 z-50 w-full max-w-2xl'),
        'Old max-w-2xl right drawer must be eliminated'
      );

      // Verify dialog role and accessibility
      assert.ok(content.includes('role="dialog"'), 'Studio container must specify role="dialog"');
      assert.ok(content.includes('aria-modal="true"'), 'Studio container must specify aria-modal="true"');
    });

    itFn('1.2 Top studio header toolbar (65px) renders helper identity, brand icon, category and online beacon', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Verify header container
      assert.ok(
        content.includes('h-[65px] min-h-[65px] px-4 sm:px-6 border-b border-[#E3ECF7] bg-white flex items-center justify-between'),
        'Header must be 65px fixed height with border and flex layout'
      );

      // BrandIcon and online beacon
      assert.ok(content.includes('<BrandIcon name={$activeTool.name}'), 'Header must render BrandIcon with activeTool');
      assert.ok(content.includes('rounded-full bg-emerald-500'), 'Header must render online beacon dot');
      assert.ok(content.includes('title="Online & Autonomous"'), 'Online beacon must have title Online & Autonomous');

      // Helper code, name, and category badge
      assert.ok(content.includes('{$activeTool.code}'), 'Header must render helper code');
      assert.ok(content.includes('{$activeTool.name}'), 'Header must render helper name');
      assert.ok(content.includes('{$activeTool.categoryName}'), 'Header must render categoryName');
    });

    itFn('1.3 Top toolbar includes Autonomous Workflow Pipeline chip and Customize Workflow button', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Autonomous Workflow Pipeline indicator chip
      assert.ok(content.includes('Autonomous Workflow Pipeline'), 'Header must render Autonomous Workflow Pipeline indicator chip');
      assert.ok(content.includes('Readymade 1-Click Execution'), 'Header chip must indicate Readymade 1-Click Execution');
      assert.ok(content.includes('Icon name="GitBranch"'), 'Header chip must render GitBranch icon');

      // Customize Workflow button & gating
      assert.ok(content.includes('Customize Workflow'), 'Header must contain Customize Workflow button');
      assert.ok(content.includes('isWorkflowStudioVisible'), 'Customize Workflow button must be guarded by isWorkflowStudioVisible');
      assert.ok(content.includes('👑 Admin Preview: (Locked for regular users)'), 'Must render Admin Preview badge when locked');
    });

    itFn('1.4 Prominent close button with Escape keydown listener smoothly closes workspace', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Prominent close button
      assert.ok(content.includes('onclick={closeToolDrawer}'), 'Close button must invoke closeToolDrawer');
      assert.ok(content.includes('aria-label="Close Helper Studio"'), 'Close button must have aria-label');
      assert.ok(content.includes('title="Close Studio (Esc)"'), 'Close button must have title Close Studio (Esc)');

      // Keyboard event listener
      assert.ok(content.includes('<svelte:window onkeydown={handleKeyDown} />'), 'Must listen to window onkeydown');
      assert.ok(content.includes("e.key === 'Escape'"), 'handleKeyDown must check for Escape key');
      assert.ok(content.includes('closeToolDrawer()'), 'Escape key must trigger closeToolDrawer');
    });

    itFn('1.5 Desktop 2-column split layout and responsive collapse for mobile viewports', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Grid container: lg:grid lg:grid-cols-12 lg:h-[calc(100vh-65px)]
      assert.ok(
        content.includes('lg:grid lg:grid-cols-12 lg:h-[calc(100vh-65px)]'),
        'Workspace must define desktop 12-column grid layout with calc(100vh-65px)'
      );

      // Left pane 5 columns on desktop, full width on mobile
      assert.ok(
        content.includes('col-span-12 lg:col-span-5'),
        'Left pane must occupy 5 columns on desktop and 12 columns on mobile'
      );

      // Right pane 7 columns on desktop, full width on mobile
      assert.ok(
        content.includes('col-span-12 lg:col-span-7'),
        'Right pane must occupy 7 columns on desktop and 12 columns on mobile'
      );
    });

    itFn('1.6 Left Pane (5 cols) provides sample fill, language & tone selectors, generate button, and channel cards', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // AI CEO / Channels Command Banner
      assert.ok(content.includes('AI CEO / Channels Command:'), 'Left pane must show AI CEO / Channels Command hint');

      // 1-Click Sample Fill
      assert.ok(
        content.includes('Sample Fill') || content.includes('1-Click Sample Fill'),
        'Left pane must include sample fill button'
      );
      assert.ok(content.includes('fillSampleInputs'), 'Left pane must bind fillSampleInputs handler');

      // Output language selector with English, Bangla/English Mix, Pure Bengali, Banglish
      assert.ok(content.includes('outputLanguage'), 'Left pane must bind outputLanguage');
      assert.ok(
        content.includes('Bangla & English Mix') || content.includes('Bangla/English Mix'),
        'Language selector must include Bangla/English Mix'
      );
      assert.ok(content.includes('Pure Bengali') || content.includes('Bengali'), 'Language selector must include Bengali');
      assert.ok(content.includes('Banglish'), 'Language selector must include Banglish');

      // Tone selector
      assert.ok(content.includes('outputTone'), 'Left pane must bind outputTone');

      // High-visibility generate button
      assert.ok(
        content.includes('Generate with {$activeTool.name}'),
        'Left pane must render prominent Generate with {$activeTool.name} button'
      );

      // Omnichannel Connected Business Channels card
      assert.ok(content.includes('{#if isCustomerReplyAgent}'), 'Left pane must conditionally render channels card for #76-#80');
      assert.ok(content.includes('Connected Business Channels'), 'Left pane must render Connected Business Channels card');
    });

    itFn('1.7 Right Pane (7 cols) delivers live deliverables, word/char counters, WhatsApp share, and follow-up chat', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Header title & counters
      assert.ok(content.includes('Live Deliverable & Executive Workspace'), 'Right pane must render workspace title');
      assert.ok(content.includes('wordCount'), 'Right pane must display word count');
      assert.ok(content.includes('charCount'), 'Right pane must display character count');

      // Action buttons: Copy & WhatsApp
      assert.ok(content.includes('Copy Latest Deliverable'), 'Right pane must have Copy Latest Deliverable button');
      assert.ok(content.includes('handleCopy'), 'Copy button must trigger handleCopy');
      assert.ok(content.includes('Share to WhatsApp'), 'Right pane must have Share to WhatsApp button');
      assert.ok(content.includes('sendToWhatsApp'), 'WhatsApp button must trigger sendToWhatsApp');

      // Scrollable deliverable markdown and chat history
      assert.ok(content.includes('renderMd'), 'Right pane must parse markdown deliverables via renderMd');
      assert.ok(content.includes('studioChatHistory'), 'Right pane must render studioChatHistory conversation turns');

      // Sticky follow-up refinement input bar
      assert.ok(content.includes('followUpInput'), 'Right pane must bind followUpInput');
      assert.ok(content.includes('handleFollowUpSend'), 'Right pane must provide handleFollowUpSend');
      assert.ok(
        content.includes('follow-up instructions to this helper') ||
        content.includes('Ask follow-up questions, request changes, or refine'),
        'Follow-up input bar must have informative placeholder'
      );
    });
  });

  // =========================================================================
  // Section 2: Safety & Critical Invariant Preservation (ToolDrawer.svelte)
  // =========================================================================
  describeFn('Section 2: Safety & Critical Invariant Preservation (ToolDrawer.svelte)', () => {
    itFn('2.1 Missing API Key guidance card preserves exact invariant strings and 1-click navigation', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Exact title and badge strings
      assert.ok(content.includes('No AI API Key Connected'), 'Must preserve "No AI API Key Connected" title');
      assert.ok(content.includes('100% Free'), 'Must preserve "100% Free" highlight badge');
      assert.ok(
        content.includes('Google Gemini API is <strong>100% free with no credit card required</strong>'),
        'Must preserve Google Gemini 100% free explanation'
      );

      // Conditional check & navigation handler
      assert.ok(content.includes('{#if !hasActiveKey}'), 'Must conditionally render card based on !hasActiveKey');
      assert.ok(content.includes('Connect Free API Key'), 'Action button must read "Connect Free API Key"');
      assert.ok(content.includes('onclick={handleConnectKey}'), 'Button must call handleConnectKey');
      assert.ok(content.includes("activeDashboardTab.set('api-keys')"), 'handleConnectKey must navigate to api-keys');
      assert.ok(content.includes('closeToolDrawer()'), 'handleConnectKey must close tool drawer');
    });

    itFn('2.2 Pre-execution guard and server response interception for missing API key are preserved', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Pre-execution guard
      assert.ok(content.includes('if (!hasActiveKey) {'), 'Must preserve pre-execution check: if (!hasActiveKey)');
      assert.ok(content.includes('handleConnectKey()'), 'Must invoke handleConnectKey() when key is missing');

      // Server response interception
      assert.ok(content.includes('data.requiresApiKey'), 'Must intercept data.requiresApiKey from server response');
    });

    itFn('2.3 Workflow studio customization toggle and admin preview badge are preserved', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      // Derived toggle and admin detection
      assert.ok(
        content.includes("sessionStorage.getItem('ezbo_admin_authed') === 'true'"),
        'Must detect admin status from sessionStorage'
      );
      assert.ok(
        content.includes('isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false)'),
        'Must derive isWorkflowStudioVisible correctly'
      );
      assert.ok(content.includes('{#if isWorkflowStudioVisible}'), 'Must wrap studio button in isWorkflowStudioVisible');
      assert.ok(
        content.includes('👑 Admin Preview: (Locked for regular users)'),
        'Must preserve Admin Preview badge string verbatim'
      );
    });

    itFn('2.4 Omnichannel Customer Reply card retains connection button and tab navigation', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      assert.ok(content.includes('Connected Business Channels'), 'Must preserve "Connected Business Channels" heading');
      assert.ok(
        content.includes('🔗 Connect Channels in Tools &amp; Integrations') ||
        content.includes('🔗 Connect Channels in Tools & Integrations'),
        'Must preserve Connect Channels in Tools & Integrations button label'
      );
      assert.ok(content.includes("activeDashboardTab.set('tools')"), 'Must switch active dashboard tab to tools');
      assert.ok(content.includes('core-business-channels'), 'Must scroll to core-business-channels container');
    });

    itFn('2.5 Multi-Key Vault and OpenRouter selected models payload integration are preserved', () => {
      const content = readSafe(PATHS.toolDrawerSvelte);

      assert.ok(content.includes('payload.vaultKeys = roundRobinKeys'), 'Must assign payload.vaultKeys for multi-key failover');
      assert.ok(content.includes('payload.openrouterModels = $openrouterSelectedModels'), 'Must pass payload.openrouterModels');
    });
  });

  // =========================================================================
  // Section 3: Real-Time Plan Intelligence in Chat Server (api/chat/+server.ts)
  // =========================================================================
  describeFn('Section 3: Real-Time Plan Intelligence in Chat Server (api/chat/+server.ts)', () => {
    itFn('3.1 chat/+server.ts imports extractPlanCapabilities and parses incoming plan tier', () => {
      const content = readSafe(PATHS.chatServerTs);

      assert.ok(content.includes('extractPlanCapabilities'), 'chat/+server.ts must import extractPlanCapabilities');
      assert.ok(content.includes('rawPlanTier = body.planTier || body.userPlan || body.tier'), 'chat server must extract rawPlanTier');
      assert.ok(content.includes('planCapabilities = extractPlanCapabilities(adminConfig, rawPlanTier)'), 'Must extract plan capabilities with adminConfig');
      assert.ok(content.includes('effectivePlanTier = planCapabilities.tierId'), 'Must obtain effectivePlanTier from planCapabilities');
    });

    itFn('3.2 chat/+server.ts passes structured planCapabilities into buildCeoOrHelperSystemPrompt', () => {
      const content = readSafe(PATHS.chatServerTs);

      assert.ok(content.includes('buildCeoOrHelperSystemPrompt(matchedHelper,'), 'chat server must call prompt builder');
      assert.ok(content.includes('planCapabilities,'), 'chat server must pass planCapabilities context object');
      assert.ok(content.includes('planTier: effectivePlanTier'), 'chat server must pass planTier');
      assert.ok(content.includes('userMessage: message'), 'chat server must pass userMessage for language detection');
    });

    itFn('3.3 chat/+server.ts preserves starter tier guard and returns guarded response', () => {
      const content = readSafe(PATHS.chatServerTs);

      assert.ok(content.includes('isStarter && isRestrictedStarterIntent(message)'), 'Must guard restricted starter intents');
      assert.ok(content.includes('getStarterGuardResponse()'), 'Must return standard starter guard response');
      assert.ok(content.includes('isPlanGuarded: true'), 'Response must mark isPlanGuarded: true');
    });

    itFn('3.4 chat/+server.ts respects admin workflow customization user enabled lock for pro tier', () => {
      const content = readSafe(PATHS.chatServerTs);

      assert.ok(content.includes('isProTier && isRestrictedStarterIntent(message)'), 'Must check pro tier restricted intents');
      assert.ok(
        content.includes('adminConfig.workflowCustomizationUserEnabled === false'),
        'Must check adminConfig.workflowCustomizationUserEnabled'
      );
      assert.ok(
        content.includes('Workflow Studio Access Notice'),
        'Must return informative locked response when studio is disabled by admin'
      );
    });
  });

  // =========================================================================
  // Section 4: Dynamic Plan Capability & Awareness Directive in AI CEO Router (ceoRouter.ts)
  // =========================================================================
  describeFn('Section 4: Dynamic Plan Capability & Awareness Directive in AI CEO Router (ceoRouter.ts)', async () => {
    itFn('4.1 ceoRouter.ts exports PlanCapabilityContext, extractPlanCapabilities, and buildPlanCapabilityDirective', () => {
      const content = readSafe(PATHS.ceoRouterTs);

      assert.ok(content.includes('export interface PlanCapabilityContext'), 'ceoRouter must export PlanCapabilityContext');
      assert.ok(content.includes('export function extractPlanCapabilities('), 'ceoRouter must export extractPlanCapabilities');
      assert.ok(content.includes('export function buildPlanCapabilityDirective('), 'ceoRouter must export buildPlanCapabilityDirective');
    });

    itFn('4.2 ceoRouter.ts does NOT import from $lib/server (preserves client-server boundary)', () => {
      const content = readSafe(PATHS.ceoRouterTs);

      assert.ok(!content.includes("from '$lib/server"), 'ceoRouter must never import from $lib/server');
      assert.ok(!content.includes('from "$lib/server'), 'ceoRouter must never import from $lib/server');
    });

    // Dynamic import for functional verification of prompt builder
    const ceoRouterMod = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    const {
      extractPlanCapabilities,
      buildPlanCapabilityDirective,
      buildCeoOrHelperSystemPrompt
    } = ceoRouterMod;

    itFn('4.3 Functional test: Starter Plan capability extraction correctly sets entitlements and restrictions', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');

      assert.strictEqual(caps.tierId, 'byok_starter');
      assert.strictEqual(caps.planName, 'Starter Plan');
      assert.strictEqual(caps.isFree, false);
      assert.strictEqual(caps.unlockedHelpersCount, 80);
      assert.strictEqual(caps.totalHelpersCount, 80);
      assert.strictEqual(caps.allHelpersUnlocked, true);
      assert.ok(caps.unlockedToolsCount >= 100, 'Starter plan must have access to 100+ connectors');
      assert.strictEqual(caps.features.workflowCustomization, false, 'Starter plan must have workflowCustomization = false');
      assert.strictEqual(caps.features.multiKeyVault, false, 'Starter plan must have multiKeyVault = false');
      assert.strictEqual(caps.features.zeroKeyManagedCloud, false, 'Starter plan is BYOK, not zero-key cloud');
      assert.strictEqual(caps.pricing.monthlyPrice, 499);
      assert.strictEqual(caps.pricing.yearlyMonthlyPrice, 399);
    });

    itFn('4.4 Functional test: Pro Plan capability extraction grants visual studio and multi-key vault', () => {
      const caps = extractPlanCapabilities(null, 'byok_pro');

      assert.strictEqual(caps.tierId, 'byok_pro');
      assert.strictEqual(caps.planName, 'Pro Plan');
      assert.strictEqual(caps.features.workflowCustomization, true, 'Pro plan must unlock workflowCustomization');
      assert.strictEqual(caps.features.multiKeyVault, true, 'Pro plan must unlock multiKeyVault');
      assert.strictEqual(caps.features.multiModelFailover, true, 'Pro plan must unlock multiModelFailover');
      assert.strictEqual(caps.pricing.monthlyPrice, 899);
    });

    itFn('4.5 Functional test: Cloud Managed Plan extraction grants zero-key managed cluster', () => {
      const caps = extractPlanCapabilities(null, 'managed');

      assert.strictEqual(caps.tierId, 'managed');
      assert.ok(
        caps.planName === 'All-Inclusive Cloud' || caps.planName === 'Cloud Managed Plan',
        `Cloud Managed plan name must match configured name, got: ${caps.planName}`
      );
      assert.strictEqual(caps.features.zeroKeyManagedCloud, true, 'Cloud Managed plan must set zeroKeyManagedCloud = true');
      assert.strictEqual(caps.features.workflowCustomization, true);
      assert.strictEqual(caps.pricing.monthlyPrice, 1499);
    });

    itFn('4.6 Functional test: Free tier marks isFree=true and locks helpers/tools', () => {
      const caps = extractPlanCapabilities(null, 'free');

      assert.strictEqual(caps.tierId, 'free');
      assert.strictEqual(caps.isFree, true);
      assert.strictEqual(caps.unlockedHelpersCount, 0);
      assert.strictEqual(caps.unlockedToolsCount, 0);
      assert.strictEqual(caps.features.workflowCustomization, false);
      assert.strictEqual(caps.features.multiKeyVault, false);
    });

    itFn('4.7 Functional test: buildPlanCapabilityDirective formats comprehensive directive with mandatory interaction rules', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      // Directive header and plan metadata
      assert.ok(directive.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
      assert.ok(directive.includes('USER ACTIVE PLAN: Starter Plan (Tier: BYOK_STARTER)'));
      assert.ok(directive.includes('PRICING: BDT 499/mo'));

      // Asset Entitlements
      assert.ok(directive.includes('1. ACTIVE PLAN ASSET ENTITLEMENTS:'));
      assert.ok(directive.includes('All 80 AI Helpers'));
      assert.ok(directive.includes('100+ Enterprise Tool Connectors'));
      assert.ok(directive.includes('Visual Workflow Studio & Custom Node Editing: LOCKED (Starter / Free Tier restriction)'));

      // Mandatory Interaction Directives
      assert.ok(directive.includes('2. MANDATORY INTERACTION DIRECTIVES:'));
      assert.ok(directive.includes('PLAN TOOL & AGENT INQUIRIES:'));
      assert.ok(directive.includes('LOCKED HELPER OR TOOL COMMANDS:'));
      assert.ok(directive.includes('Do NOT fake or pretend to execute it.'));
      assert.ok(directive.includes('PLAN DIFFERENCES & COMPARISON KNOWLEDGE:'));
      assert.ok(directive.includes('Starter Plan (BDT 499/mo'));
      assert.ok(directive.includes('Pro Plan (BDT 899/mo'));
      assert.ok(directive.includes('All-Inclusive Cloud Managed Plan (BDT 1,499/mo'));
    });

    itFn('4.8 Functional test: Prompt builder injects PLAN CAPABILITY & AWARENESS DIRECTIVE into autonomous CEO and helper modes', () => {
      // 1. Autonomous CEO prompt
      const ceoPrompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_starter',
        userMessage: 'What tools are included in my plan?'
      });
      assert.ok(
        ceoPrompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'),
        'Autonomous CEO prompt must include plan capability directive'
      );
      assert.ok(ceoPrompt.includes('USER ACTIVE PLAN: Starter Plan'), 'Autonomous CEO prompt must reflect active plan');

      // 2. Explicit Helper Delegation prompt
      const mockHelper = {
        id: 'ad_facebook',
        code: '#01',
        name: 'Facebook Ad Copy Specialist',
        category: 'marketing',
        categoryName: 'Ads & Marketing',
        badge: 'Popular',
        shortDesc: 'Generates high-converting Facebook and Instagram ad copies.',
        description: 'Complete Facebook Ads Specialist',
        agentRole: 'Ad Strategist',
        systemPrompt: 'You are Facebook Ad Copy Specialist #01.'
      };

      const delegatedPrompt = buildCeoOrHelperSystemPrompt(mockHelper, {
        planTier: 'byok_pro',
        userMessage: 'Write an ad for my shoes'
      });
      assert.ok(
        delegatedPrompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'),
        'Delegated helper prompt must include plan capability directive'
      );
      assert.ok(delegatedPrompt.includes('USER ACTIVE PLAN: Pro Plan'), 'Delegated prompt must reflect Pro Plan');

      // 3. Helper Studio mode (mode: "helper")
      const studioPrompt = buildCeoOrHelperSystemPrompt(mockHelper, {
        mode: 'helper',
        planTier: 'managed',
        userMessage: 'Hello helper'
      });
      assert.ok(
        studioPrompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'),
        'Helper studio prompt must include plan capability directive'
      );
      assert.ok(
        studioPrompt.includes('USER ACTIVE PLAN: All-Inclusive Cloud') ||
        studioPrompt.includes('USER ACTIVE PLAN: Cloud Managed Plan'),
        'Studio prompt must reflect Cloud Managed Plan'
      );
    });
  });

  // =========================================================================
  // Section 5: Checksum & Platform Invariants (robots.css & 7-Tier Strict Rule)
  // =========================================================================
  describeFn('Section 5: Checksum & Platform Invariants', () => {
    itFn('5.1 web/src/lib/components/robots/robots.css byte-for-byte SHA256 checksum strictly matches 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      assert.ok(fs.existsSync(PATHS.robotsCss), 'robots.css must exist');
      const fileBuffer = fs.readFileSync(PATHS.robotsCss);
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const EXPECTED_HASH = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

      assert.strictEqual(sha256, EXPECTED_HASH, `robots.css SHA256 checksum must match ${EXPECTED_HASH} byte-for-byte`);
      assert.strictEqual(fileBuffer.length, 5427, 'robots.css must remain exactly 5,427 bytes');
    });

    itFn('5.2 tests/run_all_tests.mjs preserves the strict 7-tier invariant (NO id: 8)', () => {
      assert.ok(fs.existsSync(PATHS.runAllTests), 'run_all_tests.mjs must exist');
      const content = readSafe(PATHS.runAllTests);

      // Must have Tier 7
      assert.ok(content.includes('id: 7'), 'Must include Tier 7');
      assert.ok(content.includes('tier7_realtime_pipeline_security.test.mjs'), 'Tier 7 must map to tier7_realtime_pipeline_security.test.mjs');

      // Must NEVER have id: 8 or Tier 8
      assert.ok(!content.includes('id: 8'), 'Must NEVER include id: 8; strictly 7 test tiers allowed');
      assert.ok(!content.includes('Tier 8'), 'Must NEVER include Tier 8 name in TIERS list');

      // TIERS array count check
      const tierMatches = content.match(/id:\s*([1-9][0-9]*)/g);
      assert.ok(tierMatches && tierMatches.length === 7, `Expected exactly 7 tier definitions, got ${tierMatches ? tierMatches.length : 0}`);
    });

    itFn('5.3 tests/tier7_realtime_pipeline_security.test.mjs integrates Section 12 hook without altering earlier tiers', () => {
      assert.ok(fs.existsSync(PATHS.tier7Test), 'tier7 test file must exist');
      const content = readSafe(PATHS.tier7Test);

      assert.ok(
        content.includes('runFullscreenStudioAndPlanIntelligenceTests'),
        'tier7 test file must import and invoke runFullscreenStudioAndPlanIntelligenceTests'
      );
      assert.ok(
        content.includes('12. Full-Screen Agent Studio Workspace & Real-Time Plan Intelligence'),
        'tier7 test file must declare Section 12 for Full-Screen Studio & Plan Intelligence'
      );
    });
  });
}

// Standalone execution entrypoint when run via `node --test tests/fullscreen_studio_plan_intelligence.test.mjs`
const isRunningDirectly = process.argv.some((arg) => arg.includes('fullscreen_studio_plan_intelligence'));
if (isRunningDirectly) {
  describe('Full-Screen Agent Studio Workspace & Real-Time Plan Intelligence Automated Regression Suite', () => {
    runFullscreenStudioAndPlanIntelligenceTests(describe, it);
  });
}
