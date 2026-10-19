import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Founder & Senior Architect Security & Payment Enhancements', () => {
  const adminSettingsPath = path.join(WEB_DIR, 'src', 'lib', 'server', 'adminSettings.ts');
  const paymentWebhookPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'payment', 'webhook', '+server.ts');
  const paymentCreatePath = path.join(WEB_DIR, 'src', 'routes', 'api', 'payment', 'create', '+server.ts');
  const telegramWebhookPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'telegram', 'webhook', '+server.ts');
  const telegramServicePath = path.join(WEB_DIR, 'src', 'lib', 'services', 'telegram.ts');
  const adminPagePath = path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte');
  const adminSettingsApiPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'settings', '+server.ts');
  const adminUsersApiPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'users', '+server.ts');
  const adminTelegramApiPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'telegram', 'webhook', '+server.ts');

  describe('1. Centralized Admin Passphrase Validation', () => {
    it('1.1 adminSettings.ts must export verifyAdminPassphrase function', () => {
      const content = readSafe(adminSettingsPath);
      assert.ok(content.includes('export function verifyAdminPassphrase('), 'adminSettings.ts must export verifyAdminPassphrase');
    });

    it('1.2 adminSettings.ts AdminConfig must declare telegramWebhookSecret', () => {
      const content = readSafe(adminSettingsPath);
      assert.ok(content.includes('telegramWebhookSecret?: string'), 'AdminConfig must declare telegramWebhookSecret');
      assert.ok(content.includes('process.env.TELEGRAM_WEBHOOK_SECRET'), 'Must check process.env.TELEGRAM_WEBHOOK_SECRET');
    });

    it('1.3 api/admin/settings must use verifyAdminPassphrase for authentication', () => {
      const content = readSafe(adminSettingsApiPath);
      assert.ok(content.includes('verifyAdminPassphrase('), 'settings endpoint must call verifyAdminPassphrase');
    });

    it('1.4 api/admin/users must use verifyAdminPassphrase for authentication', () => {
      const content = readSafe(adminUsersApiPath);
      assert.ok(content.includes('verifyAdminPassphrase('), 'users endpoint must call verifyAdminPassphrase');
    });

    it('1.5 api/admin/telegram/webhook must use verifyAdminPassphrase for authentication', () => {
      const content = readSafe(adminTelegramApiPath);
      assert.ok(content.includes('verifyAdminPassphrase('), 'telegram endpoint must call verifyAdminPassphrase');
    });
  });

  describe('2. Server-to-Server Payment Webhook / IPN Endpoint', () => {
    it('2.1 web/src/routes/api/payment/webhook/+server.ts must exist', () => {
      assert.ok(fs.existsSync(paymentWebhookPath), 'Payment webhook endpoint file must exist');
    });

    it('2.2 Payment webhook must export POST and GET handlers', () => {
      const content = readSafe(paymentWebhookPath);
      assert.ok(content.includes('export const POST: RequestHandler'), 'Must export POST handler');
      assert.ok(content.includes('export const GET: RequestHandler'), 'Must export GET handler');
    });

    it('2.3 Payment webhook must require transaction_id', () => {
      const content = readSafe(paymentWebhookPath);
      assert.ok(content.includes('transaction_id is required'), 'Must validate transaction_id');
    });

    it('2.4 Payment webhook must perform server-to-server gateway re-verification', () => {
      const content = readSafe(paymentWebhookPath);
      assert.ok(content.includes('OPAY_VERIFY_URL') || content.includes('/verify'), 'Must call gateway verify endpoint');
      assert.ok(content.includes('upsertUserGrant'), 'Must call upsertUserGrant upon verified transaction');
    });

    it('2.5 api/payment/create must pass webhook_url and ipn_url in form parameters', () => {
      const content = readSafe(paymentCreatePath);
      assert.ok(content.includes("formParams.set('webhook_url'"), 'Must set webhook_url parameter');
      assert.ok(content.includes("formParams.set('ipn_url'"), 'Must set ipn_url parameter');
      assert.ok(content.includes('/api/payment/webhook'), 'Webhook URL must target /api/payment/webhook');
    });
  });

  describe('3. Telegram Webhook Security Verification', () => {
    it('3.1 api/telegram/webhook must verify X-Telegram-Bot-Api-Secret-Token header', () => {
      const content = readSafe(telegramWebhookPath);
      assert.ok(content.includes('x-telegram-bot-api-secret-token'), 'Must inspect x-telegram-bot-api-secret-token header');
      assert.ok(content.includes('TELEGRAM_WEBHOOK_SECRET') || content.includes('telegramWebhookSecret'), 'Must compare with secret token');
    });

    it('3.2 telegram.ts setTelegramWebhook must accept optional secretToken argument', () => {
      const content = readSafe(telegramServicePath);
      assert.ok(content.includes('secretToken?: string'), 'setTelegramWebhook signature must accept secretToken');
      assert.ok(content.includes('secret_token'), 'Payload must include secret_token when provided');
    });

    it('3.3 api/admin/telegram/webhook must pass configured secret token when registering webhook', () => {
      const content = readSafe(adminTelegramApiPath);
      assert.ok(content.includes('telegramWebhookSecret'), 'Must pass telegramWebhookSecret to setTelegramWebhook');
    });
  });

  describe('4. Admin User Grant Modal 3-Tier Selector', () => {
    it('4.1 admin/+page.svelte grantTier state must support byok_starter, byok_pro, managed', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes("grantTier = $state<'byok_starter' | 'byok_pro' | 'managed' | 'byok'>"), 'grantTier must support all 3 tiers');
    });

    it('4.2 admin/+page.svelte User Grant modal must render Starter Plan button (byok_starter)', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes("grantTier = 'byok_starter'"), 'Grant modal must allow selecting byok_starter');
      assert.ok(content.includes('editablePlans.byok_starter'), 'Grant modal must read editablePlans.byok_starter');
    });

    it('4.3 admin/+page.svelte User Grant modal must render Pro Plan button (byok_pro)', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes("grantTier = 'byok_pro'"), 'Grant modal must allow selecting byok_pro');
      assert.ok(content.includes('editablePlans.byok_pro'), 'Grant modal must read editablePlans.byok_pro');
    });

    it('4.4 admin/+page.svelte User Grant modal must render Cloud Managed button (managed)', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes("grantTier = 'managed'"), 'Grant modal must allow selecting managed');
      assert.ok(content.includes('editablePlans.managed'), 'Grant modal must read editablePlans.managed');
    });
  });
});
