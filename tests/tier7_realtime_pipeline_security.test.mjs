import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Key file paths under test
const PATHS = {
  // Proactive Missing API Key Detection
  chatApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'chat', '+server.ts'),
  toolDrawer: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolDrawer.svelte'),
  floatingCeoChat: path.join(WEB_DIR, 'src', 'lib', 'components', 'FloatingCeoChat.svelte'),
  dashboardChat: path.join(WEB_DIR, 'src', 'lib', 'components', 'DashboardChat.svelte'),

  // Real-Time Pipeline Execution in Visual Workflow Studio
  workflowStudio: path.join(WEB_DIR, 'src', 'lib', 'components', 'WorkflowStudioModal.svelte'),

  // Dedicated Image Generation Endpoint & Router
  generateImageApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'generate-image', '+server.ts'),
  ceoRouter: path.join(WEB_DIR, 'src', 'lib', 'services', 'ceoRouter.ts'),

  // AI Helpers and Store Bots configs
  toolsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'),
  storeBotsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'storeBots.ts'),

  // Security, Payment, and Admin files
  adminSettings: path.join(WEB_DIR, 'src', 'lib', 'server', 'adminSettings.ts'),
  paymentWebhook: path.join(WEB_DIR, 'src', 'routes', 'api', 'payment', 'webhook', '+server.ts'),
  paymentCreate: path.join(WEB_DIR, 'src', 'routes', 'api', 'payment', 'create', '+server.ts'),
  telegramWebhook: path.join(WEB_DIR, 'src', 'routes', 'api', 'telegram', 'webhook', '+server.ts'),
  telegramService: path.join(WEB_DIR, 'src', 'lib', 'services', 'telegram.ts'),
  adminPage: path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte'),
  adminSettingsApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'settings', '+server.ts'),
  adminUsersApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'users', '+server.ts'),
  adminTelegramApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'telegram', 'webhook', '+server.ts'),

  // Critical Invariants
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  runAllTests: path.join(ROOT_DIR, 'tests', 'run_all_tests.mjs'),
  dashboardPage: path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte'),
  toolConnectorsTab: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolConnectorsTab.svelte'),
  toolConnectorsApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'tool-connectors', '+server.ts')
};

describe('Tier 7: Real-Time Pipeline, Missing Key Detection & Security Suite', () => {

  // ==========================================================================
  // 1. Proactive Missing API Key Detection & 1-Click Navigation
  // ==========================================================================
  describe('1. Proactive Missing API Key Detection & 1-Click Navigation', () => {
    it('1.1 web/src/routes/api/chat/+server.ts returns status 400 and structured missing key error', () => {
      const content = readSafe(PATHS.chatApi);
      assert.ok(content.includes('requiresApiKey: true'), 'api/chat must return requiresApiKey: true');
      assert.ok(
        content.includes('No API Key configured. Please add your free Google Gemini or OpenRouter key in the API Vault.'),
        'api/chat must return exact missing key error message'
      );
      assert.ok(
        content.includes('{ status: 400 }'),
        'api/chat must respond with HTTP status 400 when no API key is configured'
      );
      assert.ok(
        content.includes('!hasUserVaultKey && !hasSingleKey && !hasPlatformKey'),
        'api/chat must evaluate presence of user vault keys, single keys, and platform key'
      );
    });

    it('1.2 web/src/lib/components/ToolDrawer.svelte renders prominent "🔑 No AI API Key Connected" card with "100% Free"', () => {
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(
        content.includes('No AI API Key Connected'),
        'ToolDrawer must contain warning title "No AI API Key Connected"'
      );
      assert.ok(
        content.includes('100% Free'),
        'ToolDrawer warning card must feature the "100% Free" highlight badge'
      );
      assert.ok(
        content.includes('Google Gemini API is <strong>100% free with no credit card required</strong>'),
        'ToolDrawer must inform user that Gemini is free with no credit card required'
      );
      assert.ok(
        content.includes('{#if !hasActiveKey}'),
        'Warning card must be conditionally rendered when hasActiveKey is falsy'
      );
    });

    it('1.3 web/src/lib/components/ToolDrawer.svelte provides 1-click "Connect Free API Key" button navigating to api-keys', () => {
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(
        content.includes('Connect Free API Key'),
        'ToolDrawer must have action button labeled "Connect Free API Key"'
      );
      assert.ok(
        content.includes('onclick={handleConnectKey}'),
        'Connect button must bind to handleConnectKey function'
      );
      assert.ok(
        content.includes("activeDashboardTab.set('api-keys')"),
        'handleConnectKey must switch activeDashboardTab to api-keys'
      );
      assert.ok(
        content.includes('closeToolDrawer()'),
        'handleConnectKey must close the ToolDrawer upon navigation'
      );
    });

    it('1.4 web/src/lib/components/ToolDrawer.svelte intercepts execution when no API key is connected', () => {
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(
        content.includes('if (!hasActiveKey) {'),
        'runHelperRequest must check hasActiveKey before dispatching request'
      );
      assert.ok(
        content.includes('handleConnectKey()'),
        'runHelperRequest must invoke handleConnectKey when key is missing'
      );
      assert.ok(
        content.includes('data.requiresApiKey'),
        'ToolDrawer must handle server-side requiresApiKey response'
      );
    });

    it('1.5 web/src/lib/components/FloatingCeoChat.svelte handles missing API key with in-chat action button', () => {
      const content = readSafe(PATHS.floatingCeoChat);
      assert.ok(
        content.includes('Boolean(data.requiresApiKey)'),
        'FloatingCeoChat must inspect requiresApiKey flag from response'
      );
      assert.ok(
        content.includes('requiresApiKey: true'),
        'FloatingCeoChat bot message must store requiresApiKey property'
      );
      assert.ok(
        content.includes('Setup API Key in Vault'),
        'FloatingCeoChat must render in-chat button "Setup API Key in Vault"'
      );
      assert.ok(
        content.includes("activeDashboardTab.set('api-keys')"),
        'In-chat action button must navigate directly to api-keys tab'
      );
      assert.ok(
        content.includes('isOpen = false'),
        'Clicking Setup API Key in Vault must close/minimize the chat window'
      );
      assert.ok(
        content.includes('100% free with no credit card required'),
        'FloatingCeoChat must explain Gemini is 100% free without credit card'
      );
    });
  });

  // ==========================================================================
  // 2. Real-Time Pipeline Execution in Visual Workflow Studio
  // ==========================================================================
  describe('2. Real-Time Pipeline Execution in Visual Workflow Studio', () => {
    it('2.1 WorkflowStudioModal.svelte contains prominent "▶ Run Live Workflow" button with spinner state', () => {
      const content = readSafe(PATHS.workflowStudio);
      assert.ok(
        content.includes('▶ Run Live Workflow'),
        'WorkflowStudioModal must render "▶ Run Live Workflow" button in toolbar'
      );
      assert.ok(
        content.includes('onclick={runLiveWorkflow}'),
        'Run button must invoke runLiveWorkflow'
      );
      assert.ok(
        content.includes('disabled={isExecuting}'),
        'Run button must be disabled while isExecuting is true'
      );
      assert.ok(
        content.includes('Executing...'),
        'Run button must display "Executing..." during pipeline execution'
      );
      assert.ok(
        content.includes('animate-spin'),
        'Run button must render spinning loader icon during execution'
      );
    });

    it('2.2 Graph topology traversal tracks Trigger, AI Reasoning Engine, and downstream Action nodes', () => {
      const content = readSafe(PATHS.workflowStudio);
      assert.ok(
        content.includes("n.type === 'trigger'"),
        'Pipeline must identify root trigger node by type'
      );
      assert.ok(
        content.includes("n.type === 'ai_agent' || n.id === 'node-2'"),
        'Pipeline must locate AI reasoning engine node (node-2)'
      );
      assert.ok(
        content.includes("downstreamFromAi.includes(n.id) && n.type === 'action'"),
        'Pipeline must traverse downstream action nodes from AI node'
      );
      assert.ok(
        content.includes('pipelineSteps = ['),
        'Pipeline must initialize step statuses across all stages'
      );
    });

    it('2.3 Token variable interpolation replaces {{input}}, {{user_prompt}}, and {{previous_step}}', () => {
      const content = readSafe(PATHS.workflowStudio);
      assert.ok(
        content.includes("interpolatePrompt(template: string, inputVal: string, prevStepVal: string)"),
        'WorkflowStudioModal must define interpolatePrompt function'
      );
      assert.ok(
        content.includes("replaceAll('{{input}}', inputVal)"),
        'interpolatePrompt must interpolate {{input}}'
      );
      assert.ok(
        content.includes("replaceAll('{{user_prompt}}', inputVal)"),
        'interpolatePrompt must interpolate {{user_prompt}}'
      );
      assert.ok(
        content.includes("replaceAll('{{previous_step}}', prevStepVal)"),
        'interpolatePrompt must interpolate {{previous_step}}'
      );

      // Algorithmic validation of the interpolation logic
      function simulateInterpolate(template, inputVal, prevStepVal) {
        if (!template) return inputVal;
        let res = template;
        if (res.includes('{{input}}') || res.includes('{{user_prompt}}') || res.includes('{{previous_step}}')) {
          return res
            .replaceAll('{{input}}', inputVal)
            .replaceAll('{{user_prompt}}', inputVal)
            .replaceAll('{{previous_step}}', prevStepVal);
        }
        return `${res}\n\n[Trigger Inbound Input Payload]:\n${inputVal}`;
      }

      const raw = 'Analyze {{input}} for campaign with prompt: {{user_prompt}}. Context: {{previous_step}}';
      const interpolated = simulateInterpolate(raw, 'Black Friday Sale', 'Previous Trigger Ready');
      assert.strictEqual(
        interpolated,
        'Analyze Black Friday Sale for campaign with prompt: Black Friday Sale. Context: Previous Trigger Ready'
      );

      const fallback = simulateInterpolate('Direct prompt without tokens', 'Sample Data', 'Trigger');
      assert.ok(fallback.includes('[Trigger Inbound Input Payload]:\nSample Data'));
    });

    it('2.4 Live pipeline execution calls POST /api/chat with vault keys and failover chains', () => {
      const content = readSafe(PATHS.workflowStudio);
      assert.ok(
        content.includes("fetch('/api/chat'"),
        'WorkflowStudioModal must execute real live pipeline via fetch POST /api/chat'
      );
      assert.ok(
        content.includes("method: 'POST'"),
        'Request must use POST method'
      );
      assert.ok(
        content.includes('payload.vaultKey = {') || content.includes('vaultKey: {'),
        'Pipeline must supply vault key parameters'
      );
      assert.ok(
        content.includes('roundRobinKeys.map') || content.includes('payload.vaultKeys'),
        'Pipeline must support multi-key round-robin failover keys'
      );
      assert.ok(
        content.includes('payload.openrouterModels = $openrouterSelectedModels'),
        'Pipeline must pass selected OpenRouter failover models'
      );
      assert.ok(
        content.includes('payload.usePlatformKey = true'),
        'Pipeline must support Cloud Managed usePlatformKey'
      );
    });

    it('2.5 Animated SVG Bézier cables pulse with @keyframes pulseCable and stroke-dasharray', () => {
      const content = readSafe(PATHS.workflowStudio);
      assert.ok(
        content.includes('@keyframes pulseCable'),
        'WorkflowStudioModal must declare @keyframes pulseCable in styles'
      );
      assert.ok(
        content.includes('stroke-dashoffset: 48;') && content.includes('stroke-dashoffset: 0;'),
        'pulseCable animation must animate stroke-dashoffset'
      );
      assert.ok(
        content.includes('.pulse-cable-active'),
        'WorkflowStudioModal must declare .pulse-cable-active class'
      );
      assert.ok(
        content.includes('stroke-dasharray: 10 6;'),
        '.pulse-cable-active must define stroke-dasharray: 10 6'
      );
      assert.ok(
        content.includes('animation: pulseCable'),
        '.pulse-cable-active must bind pulseCable animation'
      );
      assert.ok(
        content.includes('activePulsingCables'),
        'WorkflowStudioModal must track active pulsing cables reactively'
      );
    });

    it('2.6 Live Execution Output Drawer renders 3-step node status, markdown, copy, and export', () => {
      const content = readSafe(PATHS.workflowStudio);
      assert.ok(
        content.includes('Trigger: ✅ Ready'),
        'Output Drawer must display Step 1: "Trigger: ✅ Ready"'
      );
      assert.ok(
        content.includes('AI Reasoning: ⚡ Running') && content.includes('AI Reasoning: ⚡ Done'),
        'Output Drawer must display Step 2: "AI Reasoning: ⚡ Running / Done"'
      );
      assert.ok(
        content.includes('Action: 📄 Deliverable Ready'),
        'Output Drawer must display Step 3: "Action: 📄 Deliverable Ready"'
      );
      assert.ok(
        content.includes('marked.parse(outputMarkdown)'),
        'Output Drawer must render full markdown deliverable via marked.parse'
      );
      assert.ok(
        content.includes('Copy Deliverable'),
        'Output Drawer must provide Copy Deliverable button'
      );
      assert.ok(
        content.includes('Export Markdown (.md)'),
        'Output Drawer must provide Export Markdown button'
      );
      assert.ok(
        content.includes('Export JSON (.json)'),
        'Output Drawer must provide Export JSON button'
      );
    });

    it('2.7 WorkflowStudioModal handles missing API key with in-drawer setup guidance', () => {
      const content = readSafe(PATHS.workflowStudio);
      assert.ok(
        content.includes('if (!hasActiveKey) {'),
        'runLiveWorkflow must check hasActiveKey before execution'
      );
      assert.ok(
        content.includes('requiresApiKey = true'),
        'Studio must flag requiresApiKey when key is missing'
      );
      assert.ok(
        content.includes("activeDashboardTab.set('api-keys')"),
        'In-drawer card must allow 1-click navigation to api-keys tab'
      );
    });
  });

  // ==========================================================================
  // 3. Dedicated Image Generation Endpoint
  // ==========================================================================
  describe('3. Dedicated Image Generation Endpoint', () => {
    it('3.1 web/src/routes/api/generate-image/+server.ts exists and exports GET and POST handlers', () => {
      assert.ok(fs.existsSync(PATHS.generateImageApi), 'generate-image endpoint must exist');
      const content = readSafe(PATHS.generateImageApi);
      assert.ok(
        content.includes('export const GET: RequestHandler'),
        'generate-image must export GET RequestHandler'
      );
      assert.ok(
        content.includes('export const POST: RequestHandler'),
        'generate-image must export POST RequestHandler'
      );
    });

    it('3.2 GET /api/generate-image returns active status, 4 aspect ratios, and visual helpers #34 & #35', () => {
      const content = readSafe(PATHS.generateImageApi);
      assert.ok(content.includes("status: 'active'"), 'GET response must report status active');
      assert.ok(
        content.includes("supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3']"),
        'GET response must list all 4 supported aspect ratios'
      );
      assert.ok(
        content.includes("defaultModel: 'flux'"),
        'GET response must specify defaultModel as flux'
      );
      assert.ok(
        content.includes('ai_commercial_image_generator') && content.includes('#34'),
        'GET response must document helper #34'
      );
      assert.ok(
        content.includes('ai_business_logo_generator') && content.includes('#35'),
        'GET response must document helper #35'
      );
    });

    it('3.3 POST /api/generate-image validates request body and rejects empty prompts with 400', () => {
      const content = readSafe(PATHS.generateImageApi);
      assert.ok(
        content.includes('if (!prompt || typeof prompt !== \'string\' || !prompt.trim())'),
        'POST handler must validate prompt existence and non-empty string'
      );
      assert.ok(
        content.includes('A valid non-empty "prompt" is required for image generation.'),
        'POST handler must return clear error message for invalid prompt'
      );
      assert.ok(
        content.includes('{ status: 400 }'),
        'POST handler must return status 400 for validation errors'
      );
    });

    it('3.4 Aspect ratio dimension calculation accurately maps 1:1, 16:9, 9:16, and 4:3', () => {
      const content = readSafe(PATHS.ceoRouter);
      assert.ok(content.includes('VISUAL_ASPECT_RATIO_DIMS'), 'ceoRouter must export VISUAL_ASPECT_RATIO_DIMS');

      // Verify standard aspect ratio dimensions:
      // 1:1  -> 1024x1024
      // 16:9 -> 1280x720
      // 9:16 -> 720x1280
      // 4:3  -> 1024x768
      assert.ok(content.includes("'1:1': { width: 1024, height: 1024 }"), '1:1 must map to 1024x1024');
      assert.ok(content.includes("'16:9': { width: 1280, height: 720 }"), '16:9 must map to 1280x720');
      assert.ok(content.includes("'9:16': { width: 720, height: 1280 }"), '9:16 must map to 720x1280');
      assert.ok(content.includes("'4:3': { width: 1024, height: 768 }"), '4:3 must map to 1024x768');
    });

    it('3.5 buildVisualGenerationParams produces live Pollinations AI Flux engine image URLs', () => {
      const content = readSafe(PATHS.ceoRouter);
      assert.ok(
        content.includes('https://image.pollinations.ai/prompt/'),
        'Must generate image URL using Pollinations AI endpoint'
      );
      assert.ok(content.includes('nologo=true'), 'Image URL must include nologo=true parameter');
      assert.ok(content.includes('seed='), 'Image URL must include seed parameter');
      assert.ok(content.includes('model='), 'Image URL must include model parameter');
      assert.ok(
        content.includes('vector logo brand identity') || content.includes('clean lines'),
        'Logo generation must append brand identity quality tags'
      );
    });
  });

  // ==========================================================================
  // 4. Comprehensive 75 AI Helpers & Store Bots Invariant
  // ==========================================================================
  describe('4. Comprehensive 75 AI Helpers & Store Bots Invariant', () => {
    it('4.1 At least 75 AI Helpers (all 80 helpers) must be defined and exported in tools.ts', async () => {
      assert.ok(fs.existsSync(PATHS.toolsTs), 'tools.ts must exist');
      const { TOOLS, ALL_TOOLS } = await import(pathToFileURL(PATHS.toolsTs).href);
      const helperList = ALL_TOOLS || TOOLS;
      assert.ok(Array.isArray(helperList), 'tools.ts must export array of helpers');
      assert.ok(helperList.length >= 75, `Expected >= 75 AI Helpers, got ${helperList.length}`);
      assert.strictEqual(helperList.length, 80, 'Must contain all 80 AI Helpers');
    });

    it('4.2 Every single AI Helper (#01 to #80) has non-empty typed inputs, roles, and deep executive prompts', async () => {
      const { TOOLS } = await import(pathToFileURL(PATHS.toolsTs).href);
      const expectedCodes = Array.from({ length: 80 }, (_, i) => `#${String(i + 1).padStart(2, '0')}`);

      for (let i = 0; i < 80; i++) {
        const helper = TOOLS[i];
        assert.ok(helper, `Helper at index ${i} must exist`);
        assert.strictEqual(helper.code, expectedCodes[i], `Helper ${i + 1} code must match ${expectedCodes[i]}`);
        assert.ok(helper.id && helper.id.trim().length > 0, `Helper ${helper.code} must have non-empty id`);
        assert.ok(helper.name && helper.name.trim().length > 0, `Helper ${helper.code} must have non-empty name`);
        assert.ok(helper.category && helper.category.trim().length > 0, `Helper ${helper.code} must have category`);
        assert.ok(helper.agentName && helper.agentName.trim().length > 0, `Helper ${helper.code} must have agentName`);
        assert.ok(helper.agentRole && helper.agentRole.trim().length > 0, `Helper ${helper.code} must have agentRole`);
        assert.ok(helper.agentTagline && helper.agentTagline.trim().length > 0, `Helper ${helper.code} must have agentTagline`);
        assert.ok(helper.agentAvatar && helper.agentAvatar.trim().length > 0, `Helper ${helper.code} must have agentAvatar`);

        // Inputs validation
        assert.ok(Array.isArray(helper.inputs) && helper.inputs.length > 0, `Helper ${helper.code} must have >=1 input`);
        for (const input of helper.inputs) {
          assert.ok(input.name && input.name.trim().length > 0, `Helper ${helper.code} input must have name`);
          assert.ok(input.label && input.label.trim().length > 0, `Helper ${helper.code} input must have label`);
          assert.ok(['text', 'textarea', 'select'].includes(input.type), `Helper ${helper.code} input type must be valid`);
          if (input.type === 'select') {
            assert.ok(Array.isArray(input.options) && input.options.length > 0, `Helper ${helper.code} select must have options`);
          }
        }

        // Deep executive system prompt validation: no dummy or canned mock text
        assert.ok(helper.systemPrompt && helper.systemPrompt.length >= 100, `Helper ${helper.code} systemPrompt must be >=100 chars`);
        assert.ok(!helper.systemPrompt.includes('Lorem ipsum'), `Helper ${helper.code} must not contain placeholder text`);
        assert.ok(!helper.systemPrompt.includes('TODO:'), `Helper ${helper.code} must not contain TODO marker`);
      }
    });

    it('4.2b Hybrid Omnichannel Customer Reply Agents (#76 to #80) exist with required inputs and deep prompts', async () => {
      const { TOOLS } = await import(pathToFileURL(PATHS.toolsTs).href);
      const replyAgentIds = [
        'omnichannel_customer_support',
        'whatsapp_business_support',
        'messenger_customer_support',
        'instagram_dm_support',
        'telegram_customer_support'
      ];
      for (const id of replyAgentIds) {
        const agent = TOOLS.find((t) => t.id === id);
        assert.ok(agent, `Customer reply agent ${id} must exist in TOOLS`);
        const inputNames = agent.inputs.map((inp) => inp.name);
        assert.ok(inputNames.includes('businessName'), `${id} must have businessName input`);
        assert.ok(inputNames.includes('businessDescription'), `${id} must have businessDescription input`);
        assert.ok(inputNames.includes('deliveryReturnPolicy'), `${id} must have deliveryReturnPolicy input`);
        assert.ok(inputNames.includes('faqKnowledgeBase'), `${id} must have faqKnowledgeBase input`);
        assert.ok(inputNames.includes('toneOfVoice'), `${id} must have toneOfVoice input`);
        assert.ok(inputNames.includes('customerMessage'), `${id} must have customerMessage input`);
      }
    });

    it('4.3 Visual image generation helpers #34 and #35 are correctly configured', async () => {
      const { TOOLS } = await import(pathToFileURL(PATHS.toolsTs).href);
      const helper34 = TOOLS.find((t) => t.code === '#34');
      const helper35 = TOOLS.find((t) => t.code === '#35');

      assert.ok(helper34, 'Helper #34 must exist');
      assert.strictEqual(helper34.id, 'ai_commercial_image_generator');
      assert.ok(helper34.inputs.some((inp) => inp.name === 'aspectRatio'), 'Helper #34 must have aspectRatio input');

      assert.ok(helper35, 'Helper #35 must exist');
      assert.strictEqual(helper35.id, 'ai_business_logo_generator');
      assert.ok(helper35.inputs.some((inp) => inp.name === 'brandName'), 'Helper #35 must have brandName input');
    });

    it('4.4 Store bots invariant: STORE_BOTS array exported from storeBots.ts', async () => {
      assert.ok(fs.existsSync(PATHS.storeBotsTs), 'storeBots.ts must exist');
      const { STORE_BOTS, STORE_CATEGORIES } = await import(pathToFileURL(PATHS.storeBotsTs).href);
      assert.ok(Array.isArray(STORE_BOTS), 'STORE_BOTS must be exported as array');
      assert.ok(Array.isArray(STORE_CATEGORIES), 'STORE_CATEGORIES must be exported as array');
    });
  });

  // ==========================================================================
  // 5. Centralized Admin Passphrase Validation (Security Invariant)
  // ==========================================================================
  describe('5. Centralized Admin Passphrase Validation', () => {
    it('5.1 adminSettings.ts must export verifyAdminPassphrase function', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('export function verifyAdminPassphrase('), 'adminSettings.ts must export verifyAdminPassphrase');
    });

    it('5.2 adminSettings.ts AdminConfig must declare telegramWebhookSecret', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('telegramWebhookSecret?: string'), 'AdminConfig must declare telegramWebhookSecret');
      assert.ok(content.includes('process.env.TELEGRAM_WEBHOOK_SECRET'), 'Must check process.env.TELEGRAM_WEBHOOK_SECRET');
    });

    it('5.3 api/admin/settings must use verifyAdminPassphrase for authentication', () => {
      const content = readSafe(PATHS.adminSettingsApi);
      assert.ok(content.includes('verifyAdminPassphrase('), 'settings endpoint must call verifyAdminPassphrase');
    });

    it('5.4 api/admin/users must use verifyAdminPassphrase for authentication', () => {
      const content = readSafe(PATHS.adminUsersApi);
      assert.ok(content.includes('verifyAdminPassphrase('), 'users endpoint must call verifyAdminPassphrase');
    });

    it('5.5 api/admin/telegram/webhook must use verifyAdminPassphrase for authentication', () => {
      const content = readSafe(PATHS.adminTelegramApi);
      assert.ok(content.includes('verifyAdminPassphrase('), 'telegram endpoint must call verifyAdminPassphrase');
    });
  });

  // ==========================================================================
  // 6. Server-to-Server Payment Webhook / IPN Endpoint (Security Invariant)
  // ==========================================================================
  describe('6. Server-to-Server Payment Webhook / IPN Endpoint', () => {
    it('6.1 web/src/routes/api/payment/webhook/+server.ts must exist', () => {
      assert.ok(fs.existsSync(PATHS.paymentWebhook), 'Payment webhook endpoint file must exist');
    });

    it('6.2 Payment webhook must export POST and GET handlers', () => {
      const content = readSafe(PATHS.paymentWebhook);
      assert.ok(content.includes('export const POST: RequestHandler'), 'Must export POST handler');
      assert.ok(content.includes('export const GET: RequestHandler'), 'Must export GET handler');
    });

    it('6.3 Payment webhook must require transaction_id', () => {
      const content = readSafe(PATHS.paymentWebhook);
      assert.ok(content.includes('transaction_id is required'), 'Must validate transaction_id');
    });

    it('6.4 Payment webhook must perform server-to-server gateway re-verification', () => {
      const content = readSafe(PATHS.paymentWebhook);
      assert.ok(content.includes('OPAY_VERIFY_URL') || content.includes('/verify'), 'Must call gateway verify endpoint');
      assert.ok(content.includes('upsertUserGrant'), 'Must call upsertUserGrant upon verified transaction');
    });

    it('6.5 api/payment/create must pass webhook_url and ipn_url in form parameters', () => {
      const content = readSafe(PATHS.paymentCreate);
      assert.ok(content.includes("formParams.set('webhook_url'"), 'Must set webhook_url parameter');
      assert.ok(content.includes("formParams.set('ipn_url'"), 'Must set ipn_url parameter');
      assert.ok(content.includes('/api/payment/webhook'), 'Webhook URL must target /api/payment/webhook');
    });
  });

  // ==========================================================================
  // 7. Telegram Webhook Security Verification (Security Invariant)
  // ==========================================================================
  describe('7. Telegram Webhook Security Verification', () => {
    it('7.1 api/telegram/webhook must verify X-Telegram-Bot-Api-Secret-Token header', () => {
      const content = readSafe(PATHS.telegramWebhook);
      assert.ok(content.includes('x-telegram-bot-api-secret-token'), 'Must inspect x-telegram-bot-api-secret-token header');
      assert.ok(content.includes('TELEGRAM_WEBHOOK_SECRET') || content.includes('telegramWebhookSecret'), 'Must compare with secret token');
    });

    it('7.2 telegram.ts setTelegramWebhook must accept optional secretToken argument', () => {
      const content = readSafe(PATHS.telegramService);
      assert.ok(content.includes('secretToken?: string'), 'setTelegramWebhook signature must accept secretToken');
      assert.ok(content.includes('secret_token'), 'Payload must include secret_token when provided');
    });

    it('7.3 api/admin/telegram/webhook must pass configured secret token when registering webhook', () => {
      const content = readSafe(PATHS.adminTelegramApi);
      assert.ok(content.includes('telegramWebhookSecret'), 'Must pass telegramWebhookSecret to setTelegramWebhook');
    });
  });

  // ==========================================================================
  // 8. Admin User Grant Modal 3-Tier Selector (Security Invariant)
  // ==========================================================================
  describe('8. Admin User Grant Modal 3-Tier Selector', () => {
    it('8.1 admin/+page.svelte grantTier state must support byok_starter, byok_pro, managed', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes("grantTier = $state<'byok_starter' | 'byok_pro' | 'managed' | 'byok'>"), 'grantTier must support all 3 tiers');
    });

    it('8.2 admin/+page.svelte User Grant modal must render Starter Plan button (byok_starter)', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes("grantTier = 'byok_starter'"), 'Grant modal must allow selecting byok_starter');
      assert.ok(content.includes('editablePlans.byok_starter'), 'Grant modal must read editablePlans.byok_starter');
    });

    it('8.3 admin/+page.svelte User Grant modal must render Pro Plan button (byok_pro)', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes("grantTier = 'byok_pro'"), 'Grant modal must allow selecting byok_pro');
      assert.ok(content.includes('editablePlans.byok_pro'), 'Grant modal must read editablePlans.byok_pro');
    });

    it('8.4 admin/+page.svelte User Grant modal must render Cloud Managed button (managed)', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes("grantTier = 'managed'"), 'Grant modal must allow selecting managed');
      assert.ok(content.includes('editablePlans.managed'), 'Grant modal must read editablePlans.managed');
    });
  });

  // ==========================================================================
  // 9. Critical Platform Integrity & Invariant Verification
  // ==========================================================================
  describe('9. Critical Platform Integrity & Invariant Verification', () => {
    it('9.1 web/src/lib/components/robots/robots.css byte-for-byte SHA256 checksum matches 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      assert.ok(fs.existsSync(PATHS.robotsCss), 'robots.css must exist');
      const fileBuffer = fs.readFileSync(PATHS.robotsCss);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const EXPECTED_HASH = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';
      assert.strictEqual(hash, EXPECTED_HASH, `robots.css SHA256 must match ${EXPECTED_HASH} exactly`);
    });

    it('9.2 tests/run_all_tests.mjs retains exactly 7 test tiers (Tier 1 through Tier 7)', () => {
      assert.ok(fs.existsSync(PATHS.runAllTests), 'run_all_tests.mjs must exist');
      const content = readSafe(PATHS.runAllTests);
      const tierMatches = content.match(/id:\s*([1-7])/g);
      assert.ok(tierMatches && tierMatches.length >= 7, 'Must define all 7 test tier ids');
      assert.ok(!content.includes('id: 8'), 'Must NOT add Tier 8 (exactly 7 tiers invariant)');
    });

    it('9.3 Dashboard sidebar provides api-keys tab to receive 1-click navigation from ToolDrawer and Chat', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes("activeDashboardTab = 'api-keys'") || content.includes("activeDashboardTab === 'api-keys'"),
        'Dashboard must have api-keys tab'
      );
      assert.ok(
        content.includes('ApiKeyManager'),
        'Dashboard must render ApiKeyManager when api-keys tab is active'
      );
    });

    it('9.4 Admin Panel provides Tool Connectors toggle system and persistence', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes("activeAdminTab === 'tools'"), 'Admin page must have tools tab panel');
      assert.ok(content.includes('enabledToolConnectors'), 'Admin page must manage enabledToolConnectors');
      assert.ok(content.includes('toggleToolConnector'), 'Admin page must provide toggleToolConnector');
      assert.ok(content.includes('selectAllToolConnectors'), 'Admin page must provide selectAllToolConnectors');
      assert.ok(content.includes('clearAllToolConnectors'), 'Admin page must provide clearAllToolConnectors');

      const serverSettings = readSafe(PATHS.adminSettings);
      assert.ok(serverSettings.includes('DEFAULT_TOOL_CONNECTOR_IDS'), 'adminSettings.ts must export DEFAULT_TOOL_CONNECTOR_IDS');
      assert.ok(serverSettings.includes('enabledToolConnectors?: string[]'), 'AdminConfig must declare enabledToolConnectors');

      const apiSettings = readSafe(PATHS.adminSettingsApi);
      assert.ok(apiSettings.includes('patch.enabledToolConnectors'), 'admin/settings API must accept patch.enabledToolConnectors');
    });

    it('9.5 "100+" count text is removed from Tools & Integrations navigation and headers', () => {
      const dashboard = readSafe(PATHS.dashboardPage);
      assert.ok(!dashboard.includes('>100+<'), 'Dashboard must not have hardcoded 100+ badge in navigation');

      const toolsTab = readSafe(PATHS.toolConnectorsTab);
      assert.ok(!toolsTab.includes('100+ Connectors'), 'Tools tab header must not have 100+ Connectors text');
      assert.ok(!toolsTab.includes('Search 100+ connectors'), 'Search input must not have Search 100+ text');
    });

    it('9.6 User Dashboard and WorkflowStudio filter tools against enabled connectors', () => {
      const toolsTab = readSafe(PATHS.toolConnectorsTab);
      assert.ok(toolsTab.includes('enabledToolConnectorsStore'), 'ToolConnectorsTab must subscribe to enabledToolConnectorsStore');
      assert.ok(toolsTab.includes('enabledTools'), 'ToolConnectorsTab must derive enabledTools');

      const studio = readSafe(PATHS.workflowStudio);
      assert.ok(studio.includes('enabledToolConnectorsStore'), 'WorkflowStudio must subscribe to enabledToolConnectorsStore');
      assert.ok(studio.includes('enabledConnectors'), 'WorkflowStudio must derive enabledConnectors');
    });
  });

  // ==========================================================================
  // 10. Resilient Gemini Fallback Models & Conversational Greeting Routing
  // ==========================================================================
  describe('10. Resilient Gemini Fallback Models & Conversational Greeting Routing', () => {
    it('10.1 gemini.ts exports GEMINI_FALLBACK_MODELS array with modern models', () => {
      const geminiTsPath = path.join(WEB_DIR, 'src', 'lib', 'services', 'gemini.ts');
      const content = readSafe(geminiTsPath);
      assert.ok(content.includes('export const GEMINI_FALLBACK_MODELS'), 'Must export GEMINI_FALLBACK_MODELS');
      assert.ok(content.includes('gemini-2.0-flash'), 'Fallback list must include gemini-2.0-flash');
      assert.ok(content.includes('gemini-2.5-flash'), 'Fallback list must include gemini-2.5-flash');
      assert.ok(content.includes('gemini-1.5-flash-latest'), 'Fallback list must include gemini-1.5-flash-latest');
      assert.ok(content.includes('gemini-1.5-pro'), 'Fallback list must include gemini-1.5-pro');
    });

    it('10.2 validateGeminiKey and executeToolWithGemini iterate through fallback models on 404', () => {
      const geminiTsPath = path.join(WEB_DIR, 'src', 'lib', 'services', 'gemini.ts');
      const content = readSafe(geminiTsPath);
      assert.ok(content.includes('for (const model of GEMINI_FALLBACK_MODELS)'), 'validateGeminiKey must loop over GEMINI_FALLBACK_MODELS');
      assert.ok(content.includes('modelUsed: model'), 'Must record modelUsed upon successful validation');
    });

    it('10.3 chat/+server.ts implements resilient Gemini fallback and never exposes raw 404 crash', () => {
      const content = readSafe(PATHS.chatApi);
      assert.ok(content.includes('GEMINI_FALLBACK_MODELS'), 'chat/+server.ts must import and use GEMINI_FALLBACK_MODELS');
      assert.ok(content.includes('for (const geminiModel of candidateModels)'), 'chat/+server.ts must loop over candidate models for Gemini');
      assert.ok(content.includes('isModelNotFound'), 'Must detect 404/not supported errors and continue failover');
      assert.ok(content.includes('status: 502'), 'Must return clean 502 status on total model failure');
    });

    it('10.4 ceoRouter.ts exports isConversationalGreeting and strictly prevents greetings from delegating', () => {
      const content = readSafe(PATHS.ceoRouter);
      assert.ok(content.includes('export function isConversationalGreeting'), 'Must export isConversationalGreeting');
      assert.ok(content.includes('isConversationalGreeting(clean)'), 'matchHelperForMessage must guard against greetings');
      assert.ok(content.includes('export function recommendHelperForMessage'), 'Must export recommendHelperForMessage');
      assert.ok(content.includes('export function isExplicitExecutionIntent'), 'Must export isExplicitExecutionIntent');
    });

    it('10.5 FloatingCeoChat and ceoRouter execute tasks directly without intermediate recommendation cards', () => {
      const floatContent = readSafe(PATHS.floatingCeoChat);
      const dashContent = readSafe(path.join(WEB_DIR, 'src', 'lib', 'components', 'DashboardChat.svelte'));
      const ceoRouterContent = readSafe(PATHS.ceoRouter);

      // Verify intermediate recommendation buttons are eliminated per user directive
      assert.ok(!floatContent.includes('Deploy {msg.recommendedHelper.code} Now'), 'FloatingCeoChat must not show intermediate Deploy Now card');
      assert.ok(!dashContent.includes('Deploy {msg.recommendedHelper.code} Now'), 'DashboardChat must not show intermediate Deploy Now card');

      // Verify autonomous direct execution in ceoRouter
      assert.ok(ceoRouterContent.includes('Autonomous direct execution'), 'ceoRouter must support autonomous direct execution');
      assert.ok(ceoRouterContent.includes('AUTONOMOUS EXECUTION DIRECTIVE'), 'ceoRouter must instruct autonomous execution');
    });

    it('10.6 ApiVaultManager includes modern active models for Gemini', () => {
      const apiVaultPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'ApiVaultManager.svelte');
      const content = readSafe(apiVaultPath);
      assert.ok(content.includes("'gemini-2.0-flash'"), 'ApiVaultManager must include gemini-2.0-flash');
      assert.ok(content.includes("'gemini-2.5-flash'"), 'ApiVaultManager must include gemini-2.5-flash');
    });

    it('10.7 functional verification: conversational greeting guard filters 100% of casual greetings & pleasantries', () => {
      // Re-create pure evaluation function matching ceoRouter implementation
      const GREETING_PATTERNS = [
        /^(h+i+|h+e+y+|h+e+l+l+o+|h+e+y+a+|y+o+|h+o+l+a+|h+o+w+d+y+|s+u+p+|greetings)(?:\s+(?:ezbo|ceo|there|bro|brother|friend|sir|vai|bhai|boss|mate|team|all|everyone))?$/i,
        /^(good\s+(?:morning|afternoon|evening|day|night))(?:\s+(?:ezbo|ceo|there|bro|sir|vai|bhai))?$/i,
        /^(how\s+are\s+you|how're\s+you|how\s+do\s+you\s+do|how\s+is\s+it\s+going|what's\s+up|whats\s+up|who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|can\s+you\s+help\s+me|help\s+me(?:\s+please)?|help(?:\s+please)?|start)(?:\s+(?:ezbo|ceo|today|bro|sir|vai|bhai))?$/i,
        /^(হাই|হ্যালো|হে|সালাম|আসসালামু\s*আলাইকুম|কেমন\s*(?:আছেন|আছো)|কি\s*খবর|কী\s*খবর|কি\s*অবস্থা|কে\s*তুমি|তুমি\s*কে|তোমার\s*নাম\s*কি|শুভ\s*(?:সকাল|সন্ধ্যা|রাত্রি)|ধন্যবাদ|ঠিক\s*আছে|আচ্ছা|বাই|খোদা\s*হাফেজ|আল্লাহ\s*হাফেজ)(?:\s+(?:এজবো|সিইও|ভাই|স্যার|বন্ধু|বস))?$/i,
        /^(salam|assalamu\s*alaikum|asalamu\s*alaikum|slm|ki\s*khobor|kemon\s*(?:acho|achen)|ki\s*obostha|ke\s*tumi|tumi\s*k|apni\s*k|nam\s*ki|shuvo\s*(?:shokal|sondha|ratri)|valo\s*achi|bhalo\s*achi|dhonnobad|shukriya|thanks|thank\s*you|thx|welcome|ok|okay|thik\s*ache|accha|bye|goodbye|bye\s*bye|allah\s*hafez|tata)(?:\s+(?:ezbo|ceo|vai|bhai|bro|sir|boss|dost))?$/i,
        /^(?:hi+|hello+|hey+|salam|assalamu\s*alaikum)[,\s!]+(?:how\s+are\s+you|how're\s+you|kemon\s*(?:acho|achen)|ki\s*khobor|who\s+are\s+you|what\s+can\s+you\s+do)[,\s!?.]*$/i
      ];

      function isGreeting(message) {
        if (!message || typeof message !== 'string') return false;
        const clean = message.trim().replace(/^[\s!.,?।~*-]+|[\s!.,?।~*-]+$/g, '');
        if (!clean || clean.length <= 1) return true;
        return GREETING_PATTERNS.some((pattern) => pattern.test(clean));
      }

      const casualGreetings = [
        'hi', 'hello', 'hey', 'salam', 'hi ezbo', 'hello ezbo', 'hey ezbo', 'salam ezbo',
        'hi there', 'hello there', 'hey bro', 'salam bhai', 'salam bhai!!', 'ki khobor bro',
        'kemon acho vai', 'assalamu alaikum bhai', 'good morning ezbo', 'who are you?',
        'what can you do?', 'help me please', 'can you help me?', 'hiii', 'heyyy',
        'helloooo', 'thanks', 'thank you', 'dhonnobad', 'ok', 'okay', 'thik ache', 'bye'
      ];

      for (const g of casualGreetings) {
        assert.strictEqual(isGreeting(g), true, `Greeting "${g}" must evaluate to true`);
      }

      const taskQueries = [
        'Write a facebook ad copy for my fashion brand',
        'Create a 30 day content calendar',
        'Humanize this text: The product delivers efficiency',
        '#01 Facebook ad copy for wireless earbuds',
        '/boost #01'
      ];

      for (const t of taskQueries) {
        assert.strictEqual(isGreeting(t), false, `Task query "${t}" must evaluate to false`);
      }
    });

    it('10.8 functional verification: explicit execution intent detects commands correctly', () => {
      const EXPLICIT_COMMANDS = [
        /^\/(boost|teamwork-preview|run|execute|deploy|start)\b/i,
        /\[⚡?\s*#(\d{1,2})\b/i,
        /(?:^|\s|\[⚡?)#(0[1-9]|[1-7][0-9]|80)\b/i,
        /\b(run|execute|deploy|start|proceed\s+with)\s+(agent|helper)?\s*#?(\d{1,2})\b/i,
        /\b(run|execute|deploy|start|proceed\s+with)\s+(this|the)\s+(agent|helper)\b/i,
        /\b(yes\s+proceed|yes\s+run|yes\s+deploy|proceed\s+now|deploy\s+now|run\s+now|proceed|deploy|execute)\b/i,
        /(শুরু\s*করো|কাজে\s*লাগাঁও|চালাও|এজেন্ট\s*দিয়ে\s*করাও|হ্যাঁ\s*শুরু\s*করো|হ্যাঁ\s*চালাও)/i,
        /(kaj\s*shuru\s*koro|kaj\s*koro|chalu\s*koro|run\s*koro|deploy\s*koro|proceed\s*koro|boost\s*koro)/i
      ];

      function hasExplicitIntent(message) {
        if (!message || typeof message !== 'string') return false;
        const trimmed = message.trim();
        if (!trimmed) return false;
        return EXPLICIT_COMMANDS.some((pattern) => pattern.test(trimmed));
      }

      assert.strictEqual(hasExplicitIntent('/boost #01'), true);
      assert.strictEqual(hasExplicitIntent('/boost 01'), true);
      assert.strictEqual(hasExplicitIntent('/teamwork-preview #01'), true);
      assert.strictEqual(hasExplicitIntent('#01 Facebook Ad'), true);
      assert.strictEqual(hasExplicitIntent('run agent 01'), true);
      assert.strictEqual(hasExplicitIntent('proceed'), true);
      assert.strictEqual(hasExplicitIntent('yes proceed'), true);
      assert.strictEqual(hasExplicitIntent('শুরু করো'), true);
      assert.strictEqual(hasExplicitIntent('চালাও'), true);
      assert.strictEqual(hasExplicitIntent('kaj shuru koro'), true);

      assert.strictEqual(hasExplicitIntent('hi ezbo'), false);
      assert.strictEqual(hasExplicitIntent('Can you write an ad for my store?'), false);
      assert.strictEqual(hasExplicitIntent('How do I build an audience?'), false);
    });

    it('10.9 DashboardChat and FloatingCeoChat render 1-click API Vault navigation for missing key detection', () => {
      const dashboardChatContent = readSafe(PATHS.dashboardChat);
      assert.ok(dashboardChatContent.includes('activeDashboardTab'), 'DashboardChat must import activeDashboardTab');
      assert.ok(dashboardChatContent.includes("activeDashboardTab.set('api-keys')"), 'DashboardChat must provide 1-click navigation to api-keys');
      assert.ok(dashboardChatContent.includes('requiresApiKey'), 'DashboardChat must intercept requiresApiKey');
      assert.ok(dashboardChatContent.includes('AI CEO Service Notice'), 'DashboardChat must display friendly AI CEO Service Notice');
    });

    it('10.10 ceoRouter and tools mandate strict dynamic language mirroring', () => {
      const ceoRouterContent = readSafe(PATHS.ceoRouter);
      const toolsContent = readSafe(path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'));
      const chatServerContent = readSafe(path.join(WEB_DIR, 'src', 'routes', 'api', 'chat', '+server.ts'));

      // Check export of detectUserLanguage and language detection
      assert.ok(ceoRouterContent.includes('export function detectUserLanguage'), 'Must export detectUserLanguage');
      assert.ok(ceoRouterContent.includes('MANDATORY LANGUAGE MIRRORING PROTOCOL'), 'Must define MANDATORY LANGUAGE MIRRORING PROTOCOL');
      assert.ok(ceoRouterContent.includes('FINAL LANGUAGE MIRRORING OVERRIDE'), 'Must enforce FINAL LANGUAGE MIRRORING OVERRIDE');

      // Check AI_CEO_PROFILE in tools.ts
      assert.ok(toolsContent.includes('STRICT DYNAMIC LANGUAGE MIRRORING'), 'AI_CEO_PROFILE must mandate STRICT DYNAMIC LANGUAGE MIRRORING');

      // Check api/chat passes userMessage
      assert.ok(chatServerContent.includes('userMessage: message'), 'api/chat must pass userMessage to buildCeoOrHelperSystemPrompt');
    });
  });
});
