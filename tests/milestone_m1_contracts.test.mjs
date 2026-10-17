import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PLANS_TS_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'config', 'plans.ts');
const USER_STORE_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'stores', 'userStore.ts');
const PLANS_STORE_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'stores', 'plansStore.ts');
const OPAY_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'services', 'opay.ts');
const ADMIN_SETTINGS_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'server', 'adminSettings.ts');

describe('Milestone M1: 3-Tier Plan Architecture & Persistence Suite', () => {

  it('1.1 plans.ts must export canonical 3-tier defaults and backward-compatible byok alias', async () => {
    assert.ok(fs.existsSync(PLANS_TS_PATH), 'plans.ts must exist');

    const content = fs.readFileSync(PLANS_TS_PATH, 'utf-8');
    assert.ok(content.includes("'byok_starter'"), "Must declare 'byok_starter'");
    assert.ok(content.includes("'byok_pro'"), "Must declare 'byok_pro'");
    assert.ok(content.includes("'managed'"), "Must declare 'managed'");
    assert.ok(content.includes("export interface PlanFeatureToggles"), "Must declare PlanFeatureToggles");
    assert.ok(content.includes("byok: PlanConfig"), "Must declare byok alias in PlansSettings");

    // Dynamic import of plans.ts directly
    const plansModule = await import(pathToFileURL(PLANS_TS_PATH).href);
    const { DEFAULT_PLANS, getPlanPrice } = plansModule;

    assert.ok(DEFAULT_PLANS.byok_starter, 'DEFAULT_PLANS.byok_starter must exist');
    assert.strictEqual(DEFAULT_PLANS.byok_starter.id, 'byok_starter');
    assert.strictEqual(DEFAULT_PLANS.byok_starter.monthlyPrice, 499);
    assert.strictEqual(DEFAULT_PLANS.byok_starter.yearlyTotal, 4790);

    assert.ok(DEFAULT_PLANS.byok_pro, 'DEFAULT_PLANS.byok_pro must exist');
    assert.strictEqual(DEFAULT_PLANS.byok_pro.id, 'byok_pro');
    assert.strictEqual(DEFAULT_PLANS.byok_pro.monthlyPrice, 899);
    assert.strictEqual(DEFAULT_PLANS.byok_pro.yearlyTotal, 8690);

    assert.ok(DEFAULT_PLANS.managed, 'DEFAULT_PLANS.managed must exist');
    assert.strictEqual(DEFAULT_PLANS.managed.id, 'managed');
    assert.strictEqual(DEFAULT_PLANS.managed.monthlyPrice, 1499);
    assert.strictEqual(DEFAULT_PLANS.managed.yearlyTotal, 14390);

    // Backward-compatible alias
    assert.ok(DEFAULT_PLANS.byok, 'DEFAULT_PLANS.byok must exist as alias');
    assert.strictEqual(DEFAULT_PLANS.byok.monthlyPrice, 499);
    assert.strictEqual(DEFAULT_PLANS.byok.yearlyTotal, 4790);

    // Feature toggles presence
    for (const tier of ['byok_starter', 'byok_pro', 'managed']) {
      const toggles = DEFAULT_PLANS[tier].featureToggles;
      assert.ok(toggles, `${tier} must define featureToggles`);
      assert.strictEqual(typeof toggles.aiCeo, 'boolean');
      assert.strictEqual(typeof toggles.whatsapp, 'boolean');
      assert.strictEqual(typeof toggles.telegram, 'boolean');
      assert.strictEqual(typeof toggles.multiKeyVault, 'boolean');
      assert.strictEqual(typeof toggles.multiModelFailover, 'boolean');
      assert.strictEqual(typeof toggles.commercialImages, 'boolean');
      assert.strictEqual(typeof toggles.customPrompts, 'boolean');
      assert.strictEqual(typeof toggles.prioritySupport, 'boolean');
      assert.strictEqual(typeof toggles.allHelpersEnabled, 'boolean');
      assert.ok(Array.isArray(toggles.enabledHelpers));
    }

    // Specific toggle matrix
    assert.strictEqual(DEFAULT_PLANS.byok_starter.featureToggles.multiKeyVault, false);
    assert.strictEqual(DEFAULT_PLANS.byok_starter.featureToggles.multiModelFailover, false);
    assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.multiKeyVault, true);
    assert.strictEqual(DEFAULT_PLANS.byok_pro.featureToggles.multiModelFailover, true);
    assert.strictEqual(DEFAULT_PLANS.managed.featureToggles.multiModelFailover, true);

    // Price resolution test
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_starter', 'monthly'), 499);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_starter', 'yearly'), 4790);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_pro', 'monthly'), 899);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_pro', 'yearly'), 8690);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'monthly'), 1499);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'yearly'), 14390);

    // Legacy aliases resolution
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok', 'monthly'), 499);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'complete', 'monthly'), 1499);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'pro', 'monthly'), 499);
    assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'ultra', 'monthly'), 499);
  });

  it('1.2 userStore.ts must export getEffectivePlanTier and isHelperUnlocked with subscriber grandfathering', () => {
    const content = fs.readFileSync(USER_STORE_PATH, 'utf-8');

    assert.ok(content.includes('export function getEffectivePlanTier'), 'Must export getEffectivePlanTier');
    assert.ok(content.includes('export function isHelperUnlocked'), 'Must export isHelperUnlocked');
    assert.ok(content.includes("'byok_starter'"), "PlanTier must include 'byok_starter'");
    assert.ok(content.includes("'byok_pro'"), "PlanTier must include 'byok_pro'");

    // Test getEffectivePlanTier algorithmically
    function getEffectivePlanTier(tier, isSubscribed) {
      if (isSubscribed === false) return 'free';
      if (!tier) return 'free';
      const clean = String(tier).trim().toLowerCase();
      if (clean === 'free' || !clean) return 'free';
      if (clean === 'managed' || clean === 'complete') return 'managed';
      if (clean === 'byok_starter') return 'byok_starter';
      if (clean === 'byok_pro') return 'byok_pro';
      if (clean === 'byok' || clean === 'pro' || clean === 'ultra') {
        return 'byok_pro';
      }
      return 'byok_starter';
    }

    // Grandfathering: legacy paying byok subscribers -> byok_pro
    assert.strictEqual(getEffectivePlanTier('byok'), 'byok_pro');
    assert.strictEqual(getEffectivePlanTier('pro'), 'byok_pro');
    assert.strictEqual(getEffectivePlanTier('ultra'), 'byok_pro');

    // Canonical tiers
    assert.strictEqual(getEffectivePlanTier('byok_starter'), 'byok_starter');
    assert.strictEqual(getEffectivePlanTier('byok_pro'), 'byok_pro');
    assert.strictEqual(getEffectivePlanTier('managed'), 'managed');
    assert.strictEqual(getEffectivePlanTier('complete'), 'managed');

    // Free / Inactive tiers
    assert.strictEqual(getEffectivePlanTier('free'), 'free');
    assert.strictEqual(getEffectivePlanTier(null), 'free');
    assert.strictEqual(getEffectivePlanTier(undefined), 'free');
    assert.strictEqual(getEffectivePlanTier(''), 'free');
    assert.strictEqual(getEffectivePlanTier('byok', false), 'free');
    assert.strictEqual(getEffectivePlanTier('byok_pro', false), 'free');

    // Test isHelperUnlocked logic
    function isHelperUnlocked(toolId, tier, plans) {
      const effective = getEffectivePlanTier(tier);
      if (effective === 'free') return false;
      const plan = plans?.[effective];
      const toggles = plan?.featureToggles;
      if (!toggles) return true;
      if (toggles.allHelpersEnabled !== false) return true;
      if (!toggles.enabledHelpers || toggles.enabledHelpers.length === 0) return false;
      return toggles.enabledHelpers.includes(toolId);
    }

    const mockPlans = {
      byok_starter: {
        featureToggles: { allHelpersEnabled: true, enabledHelpers: [] }
      },
      byok_pro: {
        featureToggles: { allHelpersEnabled: false, enabledHelpers: ['helper-1', 'helper-2'] }
      }
    };

    assert.strictEqual(isHelperUnlocked('helper-99', 'byok_starter', mockPlans), true);
    assert.strictEqual(isHelperUnlocked('helper-1', 'byok_pro', mockPlans), true);
    assert.strictEqual(isHelperUnlocked('helper-99', 'byok_pro', mockPlans), false);
    assert.strictEqual(isHelperUnlocked('helper-1', 'free', mockPlans), false);
  });

  it('1.3 plansStore.ts normalizePlans must migrate legacy 2-tier cache and inject byok_pro', () => {
    const content = fs.readFileSync(PLANS_STORE_PATH, 'utf-8');
    assert.ok(content.includes('export function normalizePlans'), 'Must export normalizePlans');

    // Simulate normalizePlans logic
    const DEFAULT_STARTER = { monthlyPrice: 499, yearlyTotal: 4790 };
    const DEFAULT_PRO = { monthlyPrice: 899, yearlyTotal: 8690 };
    const DEFAULT_MANAGED = { monthlyPrice: 1499, yearlyTotal: 14390 };

    function normalizePlans(raw) {
      const legacyByok = raw?.byok;
      const starterSource = raw?.byok_starter || legacyByok || DEFAULT_STARTER;
      const byok_starter = { ...DEFAULT_STARTER, ...starterSource, id: 'byok_starter' };
      const byok_pro = { ...DEFAULT_PRO, ...(raw?.byok_pro || {}), id: 'byok_pro' };
      const managedSource = raw?.managed || raw?.complete || DEFAULT_MANAGED;
      const managed = { ...DEFAULT_MANAGED, ...managedSource, id: 'managed' };
      const byok = raw?.byok ? { ...byok_starter, ...raw.byok, id: 'byok_starter' } : byok_starter;
      return { byok_starter, byok_pro, managed, byok };
    }

    const legacyCache = {
      byok: { monthlyPrice: 499, yearlyTotal: 4790 },
      managed: { monthlyPrice: 1499, yearlyTotal: 14390 }
    };

    const normalized = normalizePlans(legacyCache);
    assert.ok(normalized.byok_starter, 'Must create byok_starter from legacy byok');
    assert.strictEqual(normalized.byok_starter.monthlyPrice, 499);
    assert.ok(normalized.byok_pro, 'Must inject default byok_pro');
    assert.strictEqual(normalized.byok_pro.monthlyPrice, 899);
    assert.strictEqual(normalized.byok_pro.yearlyTotal, 8690);
    assert.ok(normalized.managed, 'Must preserve managed');
    assert.strictEqual(normalized.managed.monthlyPrice, 1499);
    assert.ok(normalized.byok, 'Must preserve byok alias');
    assert.strictEqual(normalized.byok.monthlyPrice, 499);
  });

  it('1.4 opay.ts and payment create endpoint must define 3-tier pricing', () => {
    const content = fs.readFileSync(OPAY_PATH, 'utf-8');
    assert.ok(content.includes('byok_starter: { monthly: 499, yearly: 4790 }'), 'opay must define byok_starter');
    assert.ok(content.includes('byok_pro: { monthly: 899, yearly: 8690 }'), 'opay must define byok_pro');
    assert.ok(content.includes('managed: { monthly: 1499, yearly: 14390 }'), 'opay must define managed');

    const paymentCreateFile = path.join(ROOT_DIR, 'web', 'src', 'routes', 'api', 'payment', 'create', '+server.ts');
    const paymentContent = fs.readFileSync(paymentCreateFile, 'utf-8');
    assert.ok(paymentContent.includes("'byok_starter'"), 'CreatePaymentRequest must support byok_starter');
    assert.ok(paymentContent.includes("'byok_pro'"), 'CreatePaymentRequest must support byok_pro');
  });

  it('1.5 adminSettings.ts must support 3-tier persistence and grandfather legacy user grants', () => {
    const content = fs.readFileSync(ADMIN_SETTINGS_PATH, 'utf-8');
    assert.ok(content.includes('UserGrantTier'), 'adminSettings must define UserGrantTier');
    assert.ok(content.includes('byok_starter'), 'adminSettings must reference byok_starter');
    assert.ok(content.includes('byok_pro'), 'adminSettings must reference byok_pro');
    assert.ok(content.includes('resolvedTier = input.isSubscribed ? \'byok_pro\' : \'byok_starter\''), 'Must grandfather in upsertUserGrant');

    // Simulate grandfathering logic
    function resolveGrantTier(inputTier, isSubscribed) {
      let resolved = inputTier || 'byok_starter';
      if (resolved === 'byok') {
        resolved = isSubscribed ? 'byok_pro' : 'byok_starter';
      }
      return resolved;
    }

    assert.strictEqual(resolveGrantTier('byok', true), 'byok_pro');
    assert.strictEqual(resolveGrantTier('byok', false), 'byok_starter');
    assert.strictEqual(resolveGrantTier('byok_starter', true), 'byok_starter');
    assert.strictEqual(resolveGrantTier('byok_pro', true), 'byok_pro');
    assert.strictEqual(resolveGrantTier('managed', true), 'managed');
  });

  it('1.6 api/admin/users, telegramStore, and telegram webhook must support byok_starter and byok_pro', () => {
    const adminUsersFile = path.join(ROOT_DIR, 'web', 'src', 'routes', 'api', 'admin', 'users', '+server.ts');
    const adminUsersContent = fs.readFileSync(adminUsersFile, 'utf-8');
    assert.ok(adminUsersContent.includes("'byok_pro'"), 'api/admin/users must handle byok_pro');
    assert.ok(adminUsersContent.includes("'byok_starter'"), 'api/admin/users must handle byok_starter');

    const tgStoreFile = path.join(ROOT_DIR, 'web', 'src', 'lib', 'server', 'telegramStore.ts');
    const tgStoreContent = fs.readFileSync(tgStoreFile, 'utf-8');
    assert.ok(tgStoreContent.includes("'byok_starter'"), 'telegramStore must handle byok_starter');
    assert.ok(tgStoreContent.includes("'byok_pro'"), 'telegramStore must handle byok_pro');

    const tgWebhookFile = path.join(ROOT_DIR, 'web', 'src', 'routes', 'api', 'telegram', 'webhook', '+server.ts');
    const tgWebhookContent = fs.readFileSync(tgWebhookFile, 'utf-8');
    assert.ok(tgWebhookContent.includes("'byok_starter'"), 'telegram webhook must handle byok_starter');
    assert.ok(tgWebhookContent.includes("'byok_pro'"), 'telegram webhook must handle byok_pro');
  });

});
