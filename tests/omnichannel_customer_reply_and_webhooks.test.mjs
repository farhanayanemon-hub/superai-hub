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

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Omnichannel Customer Reply Agents & Core Business Channels Suite', () => {
  const toolsPath = path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts');
  const toolConnectorsPath = path.join(WEB_DIR, 'src', 'lib', 'config', 'toolConnectors.ts');
  const toolConnectorsTabPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolConnectorsTab.svelte');
  const toolDrawerPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolDrawer.svelte');
  const brandIconPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'BrandIcon.svelte');
  const ceoRouterPath = path.join(WEB_DIR, 'src', 'lib', 'services', 'ceoRouter.ts');
  const dashboardPath = path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte');
  const robotsCssPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css');

  // Webhook server files
  const waWebhookPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'webhooks', 'whatsapp-business', '+server.ts');
  const msgWebhookPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'webhooks', 'messenger', '+server.ts');
  const igWebhookPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'webhooks', 'instagram-dm', '+server.ts');
  const tgWebhookPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'webhooks', 'telegram-support', '+server.ts');

  // =========================================================================
  // 1. Core Business Channels Invariants
  // =========================================================================
  describe('1. Core Business Channels Directory & LocalStorage Management', () => {
    it('1.1 toolConnectors.ts exports BUSINESS_CHANNELS with the 4 core channels', () => {
      const content = readSafe(toolConnectorsPath);
      assert.ok(content.includes('export const BUSINESS_CHANNELS'), 'Must export BUSINESS_CHANNELS');
      assert.ok(content.includes("'whatsapp_business'"), 'Must declare whatsapp_business');
      assert.ok(content.includes("'facebook_messenger'"), 'Must declare facebook_messenger');
      assert.ok(content.includes("'instagram_dm'"), 'Must declare instagram_dm');
      assert.ok(content.includes("'telegram_support_bot'"), 'Must declare telegram_support_bot');
    });

    it('1.2 toolConnectors.ts declares webhook paths and credential fields for all 4 channels', () => {
      const content = readSafe(toolConnectorsPath);
      assert.ok(content.includes('/api/webhooks/whatsapp-business'), 'Must configure WhatsApp webhook path');
      assert.ok(content.includes('/api/webhooks/messenger'), 'Must configure Messenger webhook path');
      assert.ok(content.includes('/api/webhooks/instagram-dm'), 'Must configure Instagram DM webhook path');
      assert.ok(content.includes('/api/webhooks/telegram-support'), 'Must configure Telegram support webhook path');
      assert.ok(content.includes('phoneNumberId') && content.includes('wabaId'), 'WhatsApp fields defined');
      assert.ok(content.includes('pageId') && content.includes('pageAccessToken'), 'Messenger fields defined');
      assert.ok(content.includes('instagramAccountId'), 'Instagram fields defined');
      assert.ok(content.includes('botToken'), 'Telegram fields defined');
    });

    it('1.3 toolConnectors.ts exports getBusinessChannelsState, saveBusinessChannelCredentials, and disconnectBusinessChannel', () => {
      const content = readSafe(toolConnectorsPath);
      assert.ok(content.includes('export function getBusinessChannelsState'), 'Must export getBusinessChannelsState');
      assert.ok(content.includes('export function saveBusinessChannelCredentials'), 'Must export saveBusinessChannelCredentials');
      assert.ok(content.includes('export function disconnectBusinessChannel'), 'Must export disconnectBusinessChannel');
      assert.ok(content.includes("'ezbo:tools-updated'"), 'Must dispatch ezbo:tools-updated event on save and disconnect');
    });
  });

  // =========================================================================
  // 2. Hybrid Omnichannel & Dedicated Customer Reply Agents (#76-#80)
  // =========================================================================
  describe('2. Hybrid Customer Reply Agents (#76 to #80)', () => {
    it('2.1 tools.ts defines all 5 customer reply agents (#76 to #80)', () => {
      const content = readSafe(toolsPath);
      const expectedAgents = [
        { id: 'omnichannel_customer_support', code: '#76' },
        { id: 'whatsapp_business_support', code: '#77' },
        { id: 'messenger_customer_support', code: '#78' },
        { id: 'instagram_dm_support', code: '#79' },
        { id: 'telegram_customer_support', code: '#80' }
      ];

      for (const ag of expectedAgents) {
        assert.ok(content.includes(`"id": "${ag.id}"`), `Must include agent id ${ag.id}`);
        assert.ok(content.includes(`"code": "${ag.code}"`), `Must include agent code ${ag.code}`);
      }
    });

    it('2.2 Every customer reply agent has typed inputs: businessName, businessDescription, deliveryReturnPolicy, faqKnowledgeBase, toneOfVoice, customerMessage', () => {
      const content = readSafe(toolsPath);
      const requiredInputs = [
        'businessName',
        'businessDescription',
        'deliveryReturnPolicy',
        'faqKnowledgeBase',
        'toneOfVoice',
        'customerMessage'
      ];

      for (const inputKey of requiredInputs) {
        const matches = (content.match(new RegExp(`"name":\\s*"${inputKey}"`, 'g')) || []).length;
        assert.ok(matches >= 5, `Input key ${inputKey} must appear at least 5 times (once per customer agent), found ${matches}`);
      }
    });

    it('2.3 Category counts in tools.ts correctly reflect 80 total tools and 18 business automation tools', () => {
      const content = readSafe(toolsPath);
      assert.ok(content.includes('"name": "All 80 AI Helpers"'), 'All category name must be All 80 AI Helpers');
      assert.ok(content.includes('"count": 80'), 'All category count must be 80');
      assert.ok(content.includes('"count": 18'), 'business_automation category count must be 18');
    });
  });

  // =========================================================================
  // 3. Brand Vector Icons & Messenger Authentic Gradient Icon
  // =========================================================================
  describe('3. Brand Vector Icons & Authentic Messenger Rendering', () => {
    it('3.1 BrandIcon.svelte maps facebook_messenger and messenger to messenger', () => {
      const content = readSafe(brandIconPath);
      assert.ok(content.includes("mid === 'facebook_messenger'"), 'Handles facebook_messenger');
      assert.ok(content.includes("return 'messenger'"), 'Returns messenger brand');
    });

    it('3.2 BrandIcon.svelte contains official Meta Messenger gradient and lightning bolt SVG', () => {
      const content = readSafe(brandIconPath);
      assert.ok(content.includes("resolvedBrand === 'messenger'"), 'Must have resolvedBrand === messenger template block');
      assert.ok(content.includes('aria-label="Facebook Messenger"'), 'Must have Facebook Messenger aria-label');
      assert.ok(content.includes('linearGradient') && content.includes('#0099FF'), 'Must contain Messenger gradient');
    });
  });

  // =========================================================================
  // 4. Inbound Webhook Endpoints
  // =========================================================================
  describe('4. Inbound Webhook Endpoints for WhatsApp, Messenger, Instagram, and Telegram', () => {
    it('4.1 WhatsApp Business webhook endpoint exists and exports GET and POST', () => {
      assert.ok(fs.existsSync(waWebhookPath), 'WhatsApp Business webhook file must exist');
      const content = readSafe(waWebhookPath);
      assert.ok(content.includes('export const GET'), 'Must export GET handler');
      assert.ok(content.includes('export const POST'), 'Must export POST handler');
      assert.ok(content.includes('hub.challenge'), 'Must handle Meta hub.challenge verification');
    });

    it('4.2 Facebook Messenger webhook endpoint exists and exports GET and POST', () => {
      assert.ok(fs.existsSync(msgWebhookPath), 'Facebook Messenger webhook file must exist');
      const content = readSafe(msgWebhookPath);
      assert.ok(content.includes('export const GET'), 'Must export GET handler');
      assert.ok(content.includes('export const POST'), 'Must export POST handler');
      assert.ok(content.includes('hub.challenge'), 'Must handle Meta hub.challenge verification');
    });

    it('4.3 Instagram Direct DM webhook endpoint exists and exports GET and POST', () => {
      assert.ok(fs.existsSync(igWebhookPath), 'Instagram DM webhook file must exist');
      const content = readSafe(igWebhookPath);
      assert.ok(content.includes('export const GET'), 'Must export GET handler');
      assert.ok(content.includes('export const POST'), 'Must export POST handler');
      assert.ok(content.includes('hub.challenge'), 'Must handle Meta hub.challenge verification');
    });

    it('4.4 Telegram Customer Support Bot webhook endpoint exists and exports GET and POST', () => {
      assert.ok(fs.existsSync(tgWebhookPath), 'Telegram support webhook file must exist');
      const content = readSafe(tgWebhookPath);
      assert.ok(content.includes('export const GET'), 'Must export GET handler');
      assert.ok(content.includes('export const POST'), 'Must export POST handler');
    });
  });

  // =========================================================================
  // 5. CeoRouter Keyword Rules & System Prompt
  // =========================================================================
  describe('5. Master AI CEO Routing & Prompt Presets', () => {
    it('5.1 ceoRouter.ts KEYWORD_RULES contains all 5 customer reply agents', () => {
      const content = readSafe(ceoRouterPath);
      assert.ok(content.includes("helperId: 'omnichannel_customer_support'"), 'Must route omnichannel_customer_support');
      assert.ok(content.includes("helperId: 'whatsapp_business_support'"), 'Must route whatsapp_business_support');
      assert.ok(content.includes("helperId: 'messenger_customer_support'"), 'Must route messenger_customer_support');
      assert.ok(content.includes("helperId: 'instagram_dm_support'"), 'Must route instagram_dm_support');
      assert.ok(content.includes("helperId: 'telegram_customer_support'"), 'Must route telegram_customer_support');
    });

    it('5.2 ceoRouter.ts system prompt mentions Omnichannel Auto-Reply and preserves 75 specialized helpers substring', () => {
      const content = readSafe(ceoRouterPath);
      assert.ok(content.includes('75 specialized Business & Freelancer AI Helpers'), 'Must preserve 75 helpers invariant');
      assert.ok(content.includes('Omnichannel Auto-Reply & Customer Channels (#76-#80)'), 'Must include category 8 Omnichannel Auto-Reply');
    });
  });

  // =========================================================================
  // 6. UI Components & 1-Click Navigation
  // =========================================================================
  describe('6. UI Components & 1-Click Navigation', () => {
    it('6.1 ToolConnectorsTab.svelte contains #core-business-channels hero section with all 4 cards', () => {
      const content = readSafe(toolConnectorsTabPath);
      assert.ok(content.includes('id="core-business-channels"'), 'Must contain id="core-business-channels"');
      assert.ok(content.includes('⭐ Core Business Customer Channels'), 'Must contain hero section title');
      assert.ok(content.includes('BUSINESS_CHANNELS'), 'Must loop over BUSINESS_CHANNELS');
    });

    it('6.2 ToolDrawer.svelte contains Connected Business Channels card and 1-click connect button', () => {
      const content = readSafe(toolDrawerPath);
      assert.ok(content.includes('isCustomerReplyAgent'), 'Must detect customer reply agents');
      assert.ok(content.includes('Connected Business Channels'), 'Must render Connected Business Channels title');
      assert.ok(content.includes('🔗 Connect Channels in Tools &amp; Integrations') || content.includes('🔗 Connect Channels in Tools & Integrations'), 'Must render 1-click action button');
      assert.ok(content.includes("activeDashboardTab.set('tools')"), 'Must switch tab to tools');
      assert.ok(content.includes('core-business-channels'), 'Must scroll to core-business-channels');
    });

    it('6.3 dashboard/+page.svelte displays clean My Agents header and Search #01-#80', () => {
      const content = readSafe(dashboardPath);
      assert.ok(content.includes('My Agents'), 'Must display My Agents header');
      assert.ok(content.includes('Search #01-#80 or helper name...'), 'Must search up to #80');
      assert.ok(content.includes('Show All 80 Helpers'), 'Must show All 80 Helpers');
    });
  });

  // =========================================================================
  // 7. Security & Integrity Invariants
  // =========================================================================
  describe('7. Security & Integrity Invariants', () => {
    it('7.1 robots.css byte-for-byte SHA256 checksum matches 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      const buffer = fs.readFileSync(robotsCssPath);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      assert.strictEqual(
        hash,
        '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be',
        'robots.css checksum must remain byte-for-byte identical'
      );
    });
  });
});
