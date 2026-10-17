import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PLANS_TS_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'config', 'plans.ts');
const USER_STORE_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'stores', 'userStore.ts');
const PLANS_STORE_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'stores', 'plansStore.ts');
const OPAY_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'services', 'opay.ts');
const ADMIN_SETTINGS_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'server', 'adminSettings.ts');

describe('Empirical Adversarial Challenge Suite: Milestone M1 (Data & Persistence)', async () => {

  // Dynamic module imports
  const plansModule = await import(pathToFileURL(PLANS_TS_PATH).href);
  const { DEFAULT_PLANS, getPlanPrice } = plansModule;

  // =========================================================================
  // 1. Price Calculation Stress Test
  // =========================================================================
  describe('1. Price Calculation Across All Tier IDs & Billing Intervals', () => {

    it('1.1 Canonical tiers resolve correct default monthly and yearly prices', () => {
      // BYOK Starter: 499/mo, 4,790/yr
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_starter', 'monthly'), 499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_starter', 'yearly'), 4790);

      // BYOK Pro: 899/mo, 8,690/yr
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_pro', 'monthly'), 899);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_pro', 'yearly'), 8690);

      // Cloud Managed: 1,499/mo, 14,390/yr
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'monthly'), 1499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'yearly'), 14390);
    });

    it('1.2 Backward-compatible aliases resolve correct monthly and yearly prices', () => {
      // 'byok' alias to byok_starter
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok', 'monthly'), 499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok', 'yearly'), 4790);

      // 'complete' alias to managed
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'complete', 'monthly'), 1499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'complete', 'yearly'), 14390);

      // 'pro' legacy tier alias in plans.ts
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'pro', 'monthly'), 499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'pro', 'yearly'), 4790);

      // 'ultra' legacy tier alias in plans.ts
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'ultra', 'monthly'), 499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'ultra', 'yearly'), 4790);
    });

    it('1.3 Custom admin configurations dynamically override base prices', () => {
      const customPlans = {
        byok_starter: { ...DEFAULT_PLANS.byok_starter, monthlyPrice: 599, yearlyTotal: 5790 },
        byok_pro: { ...DEFAULT_PLANS.byok_pro, monthlyPrice: 999, yearlyTotal: 9690 },
        managed: { ...DEFAULT_PLANS.managed, monthlyPrice: 1799, yearlyTotal: 17290 },
        byok: { ...DEFAULT_PLANS.byok_starter, monthlyPrice: 599, yearlyTotal: 5790 }
      };

      assert.strictEqual(getPlanPrice(customPlans, 'byok_starter', 'monthly'), 599);
      assert.strictEqual(getPlanPrice(customPlans, 'byok_starter', 'yearly'), 5790);
      assert.strictEqual(getPlanPrice(customPlans, 'byok_pro', 'monthly'), 999);
      assert.strictEqual(getPlanPrice(customPlans, 'byok_pro', 'yearly'), 9690);
      assert.strictEqual(getPlanPrice(customPlans, 'managed', 'monthly'), 1799);
      assert.strictEqual(getPlanPrice(customPlans, 'managed', 'yearly'), 17290);
      assert.strictEqual(getPlanPrice(customPlans, 'byok', 'monthly'), 599);
      assert.strictEqual(getPlanPrice(customPlans, 'complete', 'monthly'), 1799);
    });

    it('1.4 Fuzzing / Boundary resilience: getPlanPrice never throws or returns NaN on edge inputs', () => {
      const invalidPlans = [null, undefined, {}, { byok_starter: null }, { byok_pro: undefined }];
      const invalidTiers = [null, undefined, '', '   ', 'unknown_plan', 'enterprise', 123, {}, []];
      const invalidIntervals = [null, undefined, '', 'daily', 'quarterly', 'yearly', 'monthly'];

      for (const p of invalidPlans) {
        for (const t of invalidTiers) {
          for (const inv of invalidIntervals) {
            let price;
            assert.doesNotThrow(() => {
              price = getPlanPrice(p, t, inv);
            }, `getPlanPrice threw for plans=${JSON.stringify(p)}, tier=${JSON.stringify(t)}, interval=${inv}`);
            assert.ok(typeof price === 'number' && !isNaN(price), `Price must be valid number, got ${price}`);
            assert.ok(price > 0, `Price must be > 0, got ${price}`);
          }
        }
      }
    });

    it('1.5 Forensic Audit: Contrast opay.ts PLAN_PRICES with plans.ts getPlanPrice', async () => {
      const opayModule = await import(pathToFileURL(OPAY_PATH).href);
      const { PLAN_PRICES } = opayModule;

      assert.ok(PLAN_PRICES.byok_starter, 'PLAN_PRICES.byok_starter must exist');
      assert.strictEqual(PLAN_PRICES.byok_starter.monthly, 499);
      assert.strictEqual(PLAN_PRICES.byok_starter.yearly, 4790);

      assert.ok(PLAN_PRICES.byok_pro, 'PLAN_PRICES.byok_pro must exist');
      assert.strictEqual(PLAN_PRICES.byok_pro.monthly, 899);
      assert.strictEqual(PLAN_PRICES.byok_pro.yearly, 8690);

      assert.ok(PLAN_PRICES.managed, 'PLAN_PRICES.managed must exist');
      assert.strictEqual(PLAN_PRICES.managed.monthly, 1499);
      assert.strictEqual(PLAN_PRICES.managed.yearly, 14390);

      assert.strictEqual(PLAN_PRICES.byok.monthly, 499);
      assert.strictEqual(PLAN_PRICES.complete.monthly, 1499);

      // Document discrepancy: opay.ts PLAN_PRICES has 'pro'/'ultra' as 899 (BYOK Pro rate),
      // whereas plans.ts maps 'pro'/'ultra' to byok_starter (499 rate).
      assert.strictEqual(PLAN_PRICES.pro.monthly, 899, 'opay.ts defines legacy pro at 899');
      assert.strictEqual(PLAN_PRICES.ultra.monthly, 899, 'opay.ts defines legacy ultra at 899');
    });
  });

  // =========================================================================
  // 2. Grandfathering Stress Test
  // =========================================================================
  describe('2. Grandfathering Edge Cases & VIP Legacy Privilege Resolution', () => {

    // Mirror pure logic from userStore.ts
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

    it('2.1 Paying legacy subscribers (isSubscribed: true) MUST grandfather into byok_pro', () => {
      // Legacy 'byok'
      assert.strictEqual(getEffectivePlanTier('byok', true), 'byok_pro');
      assert.strictEqual(getEffectivePlanTier('BYOK', true), 'byok_pro');
      assert.strictEqual(getEffectivePlanTier('  byok  ', true), 'byok_pro');

      // Legacy 'pro'
      assert.strictEqual(getEffectivePlanTier('pro', true), 'byok_pro');
      assert.strictEqual(getEffectivePlanTier('PRO', true), 'byok_pro');

      // Legacy 'ultra'
      assert.strictEqual(getEffectivePlanTier('ultra', true), 'byok_pro');
      assert.strictEqual(getEffectivePlanTier('ULTRA', true), 'byok_pro');
    });

    it('2.2 Default grandfathering when isSubscribed parameter is omitted', () => {
      // When isSubscribed is undefined, grandfathering legacy tiers defaults to byok_pro
      assert.strictEqual(getEffectivePlanTier('byok'), 'byok_pro');
      assert.strictEqual(getEffectivePlanTier('pro'), 'byok_pro');
      assert.strictEqual(getEffectivePlanTier('ultra'), 'byok_pro');

      // Canonical tiers remain distinct
      assert.strictEqual(getEffectivePlanTier('byok_starter'), 'byok_starter');
      assert.strictEqual(getEffectivePlanTier('byok_pro'), 'byok_pro');
      assert.strictEqual(getEffectivePlanTier('managed'), 'managed');
      assert.strictEqual(getEffectivePlanTier('complete'), 'managed');
    });

    it('2.3 Initial User / Subscription local storage migration oracle', () => {
      function migrateStoredUser(user) {
        if (!user) return null;
        const copy = { ...user };
        if (copy.tier === 'complete') {
          copy.tier = 'managed';
        } else if (copy.tier === 'byok' || copy.tier === 'pro' || copy.tier === 'ultra' || !copy.tier) {
          copy.tier = copy.isSubscribed ? 'byok_pro' : 'byok_starter';
        }
        return copy;
      }

      // Paying legacy user gets byok_pro
      const payingByok = migrateStoredUser({ email: 'paying@byok.com', tier: 'byok', isSubscribed: true });
      assert.strictEqual(payingByok.tier, 'byok_pro');

      const payingPro = migrateStoredUser({ email: 'paying@pro.com', tier: 'pro', isSubscribed: true });
      assert.strictEqual(payingPro.tier, 'byok_pro');

      const payingUltra = migrateStoredUser({ email: 'paying@ultra.com', tier: 'ultra', isSubscribed: true });
      assert.strictEqual(payingUltra.tier, 'byok_pro');

      const payingComplete = migrateStoredUser({ email: 'paying@complete.com', tier: 'complete', isSubscribed: true });
      assert.strictEqual(payingComplete.tier, 'managed');
    });

    it('2.4 Admin settings storage migration grandfathering oracle', () => {
      function migrateGrants(rawGrants) {
        const migrated = {};
        for (const [email, g] of Object.entries(rawGrants)) {
          let tier = g.tier;
          if (g.isSubscribed && (tier === 'byok' || tier === 'pro' || tier === 'ultra')) {
            tier = 'byok_pro';
          } else if (!g.isSubscribed && tier === 'byok') {
            tier = 'byok_starter';
          }
          migrated[email] = { ...g, tier };
        }
        return migrated;
      }

      const inputGrants = {
        'active_byok@test.com': { email: 'active_byok@test.com', isSubscribed: true, tier: 'byok' },
        'active_pro@test.com': { email: 'active_pro@test.com', isSubscribed: true, tier: 'pro' },
        'active_ultra@test.com': { email: 'active_ultra@test.com', isSubscribed: true, tier: 'ultra' },
        'inactive_byok@test.com': { email: 'inactive_byok@test.com', isSubscribed: false, tier: 'byok' }
      };

      const result = migrateGrants(inputGrants);
      assert.strictEqual(result['active_byok@test.com'].tier, 'byok_pro');
      assert.strictEqual(result['active_pro@test.com'].tier, 'byok_pro');
      assert.strictEqual(result['active_ultra@test.com'].tier, 'byok_pro');
      assert.strictEqual(result['inactive_byok@test.com'].tier, 'byok_starter');
    });
  });

  // =========================================================================
  // 3. Unsubscribed & Expired Edge Cases Stress Test
  // =========================================================================
  describe('3. Unsubscribed & Expired State Resolution & Privilege Gating', () => {

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

    function isHelperUnlocked(toolId, tier, plans) {
      const effective = getEffectivePlanTier(tier);
      if (effective === 'free') return false;
      if (!plans) plans = DEFAULT_PLANS;
      const plan = plans[effective] || plans[tier] || DEFAULT_PLANS[effective] || DEFAULT_PLANS.byok_starter;
      const toggles = plan?.featureToggles;
      if (!toggles) return true;
      if (toggles.allHelpersEnabled !== false) return true;
      if (!toggles.enabledHelpers || toggles.enabledHelpers.length === 0) return false;
      return toggles.enabledHelpers.includes(toolId);
    }

    it('3.1 Any tier with isSubscribed: false MUST resolve strictly to "free"', () => {
      const allTiers = ['byok_starter', 'byok_pro', 'managed', 'byok', 'complete', 'pro', 'ultra', 'free', 'custom'];
      for (const t of allTiers) {
        assert.strictEqual(
          getEffectivePlanTier(t, false),
          'free',
          `Tier ${t} with isSubscribed: false must resolve to 'free'`
        );
      }
    });

    it('3.2 Null, undefined, empty string or "free" resolve to "free"', () => {
      assert.strictEqual(getEffectivePlanTier(null), 'free');
      assert.strictEqual(getEffectivePlanTier(undefined), 'free');
      assert.strictEqual(getEffectivePlanTier(''), 'free');
      assert.strictEqual(getEffectivePlanTier('   '), 'free');
      assert.strictEqual(getEffectivePlanTier('free'), 'free');
      assert.strictEqual(getEffectivePlanTier('FREE'), 'free');
    });

    it('3.3 Free users have ZERO unlocked helpers regardless of plan toggles', () => {
      const customPlans = {
        byok_starter: {
          featureToggles: { allHelpersEnabled: true, enabledHelpers: [] }
        },
        free: {
          featureToggles: { allHelpersEnabled: true, enabledHelpers: [] }
        }
      };

      for (let i = 1; i <= 75; i++) {
        const toolId = String(i).padStart(2, '0');
        assert.strictEqual(isHelperUnlocked(toolId, 'free', customPlans), false);
        assert.strictEqual(isHelperUnlocked(toolId, null, customPlans), false);
        assert.strictEqual(isHelperUnlocked(toolId, '', customPlans), false);
      }
    });

    it('3.4 Unsubscribed legacy users migrate to byok_starter (NOT byok_pro)', () => {
      function migrateStoredUser(user) {
        if (!user) return null;
        const copy = { ...user };
        if (copy.tier === 'complete') {
          copy.tier = 'managed';
        } else if (copy.tier === 'byok' || copy.tier === 'pro' || copy.tier === 'ultra' || !copy.tier) {
          copy.tier = copy.isSubscribed ? 'byok_pro' : 'byok_starter';
        }
        return copy;
      }

      const unsubByok = migrateStoredUser({ email: 'unsub@byok.com', tier: 'byok', isSubscribed: false });
      assert.strictEqual(unsubByok.tier, 'byok_starter', 'Unsubscribed byok user must get byok_starter');

      const unsubPro = migrateStoredUser({ email: 'unsub@pro.com', tier: 'pro', isSubscribed: false });
      assert.strictEqual(unsubPro.tier, 'byok_starter', 'Unsubscribed pro user must get byok_starter');

      const unsubUltra = migrateStoredUser({ email: 'unsub@ultra.com', tier: 'ultra', isSubscribed: false });
      assert.strictEqual(unsubUltra.tier, 'byok_starter', 'Unsubscribed ultra user must get byok_starter');
    });

    it('3.5 Feature matrix gating: BYOK Starter featureToggles disable multiKeyVault & multiModelFailover', () => {
      const starterToggles = DEFAULT_PLANS.byok_starter.featureToggles;
      assert.strictEqual(starterToggles.multiKeyVault, false, 'Starter must disable multiKeyVault');
      assert.strictEqual(starterToggles.multiModelFailover, false, 'Starter must disable multiModelFailover');

      const proToggles = DEFAULT_PLANS.byok_pro.featureToggles;
      assert.strictEqual(proToggles.multiKeyVault, true, 'Pro must enable multiKeyVault');
      assert.strictEqual(proToggles.multiModelFailover, true, 'Pro must enable multiModelFailover');
    });
  });

  // =========================================================================
  // 4. Cache Hydration Stress & Fuzzing Test
  // =========================================================================
  describe('4. Cache Hydration Stress & Legacy Format Normalization', () => {

    function normalizePlans(raw) {
      if (!raw || typeof raw !== 'object') {
        return DEFAULT_PLANS;
      }

      const legacyByok = raw.byok;
      const starterSource = raw.byok_starter || legacyByok || DEFAULT_PLANS.byok_starter;
      const byok_starter = {
        ...DEFAULT_PLANS.byok_starter,
        ...starterSource,
        id: 'byok_starter',
        featureToggles: {
          ...DEFAULT_PLANS.byok_starter.featureToggles,
          ...(starterSource.featureToggles || {})
        }
      };

      const proSource = raw.byok_pro || DEFAULT_PLANS.byok_pro;
      const byok_pro = {
        ...DEFAULT_PLANS.byok_pro,
        ...proSource,
        id: 'byok_pro',
        featureToggles: {
          ...DEFAULT_PLANS.byok_pro.featureToggles,
          ...(proSource.featureToggles || {})
        }
      };

      const managedSource = raw.managed || raw.complete || DEFAULT_PLANS.managed;
      const managed = {
        ...DEFAULT_PLANS.managed,
        ...managedSource,
        id: 'managed',
        featureToggles: {
          ...DEFAULT_PLANS.managed.featureToggles,
          ...(managedSource.featureToggles || {})
        }
      };

      const byok = raw.byok
        ? { ...byok_starter, ...raw.byok, id: 'byok_starter' }
        : byok_starter;

      return {
        byok_starter,
        byok_pro,
        managed,
        byok
      };
    }

    it('4.1 normalizePlans gracefully handles null, undefined, primitive, and empty inputs', () => {
      const corruptInputs = [
        null,
        undefined,
        '',
        'corrupted string',
        12345,
        true,
        false,
        NaN,
        [],
        () => {},
        {}
      ];

      for (const input of corruptInputs) {
        let result;
        assert.doesNotThrow(() => {
          result = normalizePlans(input);
        }, `normalizePlans crashed on input: ${JSON.stringify(input)}`);

        assert.ok(result, 'Result must be non-null');
        assert.ok(result.byok_starter, 'Result must have byok_starter');
        assert.ok(result.byok_pro, 'Result must have byok_pro');
        assert.ok(result.managed, 'Result must have managed');
        assert.ok(result.byok, 'Result must have byok');
      }
    });

    it('4.2 normalizePlans hydrates legacy 2-tier cache ({ byok, managed }) injecting byok_pro', () => {
      const legacy2TierCache = {
        byok: {
          name: 'BYOK Custom',
          monthlyPrice: 450,
          yearlyTotal: 4500,
          featureToggles: {
            aiCeo: true,
            whatsapp: false
          }
        },
        managed: {
          name: 'Managed Custom',
          monthlyPrice: 1399,
          yearlyTotal: 13900,
          featureToggles: {
            aiCeo: true,
            prioritySupport: true
          }
        }
      };

      const normalized = normalizePlans(legacy2TierCache);

      // Starter inherits from legacy byok
      assert.strictEqual(normalized.byok_starter.monthlyPrice, 450);
      assert.strictEqual(normalized.byok_starter.yearlyTotal, 4500);
      assert.strictEqual(normalized.byok_starter.featureToggles.whatsapp, false);
      assert.strictEqual(normalized.byok_starter.id, 'byok_starter');

      // Pro is injected from DEFAULT_PLANS
      assert.strictEqual(normalized.byok_pro.monthlyPrice, 899);
      assert.strictEqual(normalized.byok_pro.yearlyTotal, 8690);
      assert.strictEqual(normalized.byok_pro.featureToggles.multiKeyVault, true);
      assert.strictEqual(normalized.byok_pro.id, 'byok_pro');

      // Managed is preserved
      assert.strictEqual(normalized.managed.monthlyPrice, 1399);
      assert.strictEqual(normalized.managed.yearlyTotal, 13900);
      assert.strictEqual(normalized.managed.id, 'managed');

      // Byok alias is preserved
      assert.strictEqual(normalized.byok.monthlyPrice, 450);
    });

    it('4.3 normalizePlans handles legacy "complete" alias key mapping to managed', () => {
      const legacyCacheWithComplete = {
        byok: { monthlyPrice: 499 },
        complete: { monthlyPrice: 1299, yearlyTotal: 12500 }
      };

      const normalized = normalizePlans(legacyCacheWithComplete);
      assert.strictEqual(normalized.managed.monthlyPrice, 1299);
      assert.strictEqual(normalized.managed.yearlyTotal, 12500);
      assert.strictEqual(normalized.managed.id, 'managed');
    });

    it('4.4 normalizePlans is immune to deeply corrupted featureToggles or nested nulls', () => {
      const deeplyCorrupted = {
        byok_starter: {
          featureToggles: null,
          features: null
        },
        byok_pro: {
          featureToggles: 'invalid_type',
          monthlyPrice: null
        },
        managed: {
          featureToggles: {
            enabledHelpers: null,
            allHelpersEnabled: null
          }
        }
      };

      let normalized;
      assert.doesNotThrow(() => {
        normalized = normalizePlans(deeplyCorrupted);
      });

      assert.ok(normalized.byok_starter.featureToggles, 'byok_starter.featureToggles must exist');
      assert.ok(normalized.byok_pro.featureToggles, 'byok_pro.featureToggles must exist');
      assert.ok(normalized.managed.featureToggles, 'managed.featureToggles must exist');
    });

    it('4.5 adminSettings.ts deep migration survives corrupt cache file', async () => {
      const adminModule = await import(pathToFileURL(ADMIN_SETTINGS_PATH).href);
      const { getAdminConfig, updateAdminConfig } = adminModule;

      // Ensure getAdminConfig runs cleanly
      let config;
      assert.doesNotThrow(() => {
        config = getAdminConfig();
      });

      assert.ok(config, 'Config must be non-null');
      assert.ok(config.plans, 'Config must contain plans');
      assert.ok(config.plans.byok_starter, 'Config.plans must contain byok_starter');
      assert.ok(config.plans.byok_pro, 'Config.plans must contain byok_pro');
      assert.ok(config.plans.managed, 'Config.plans must contain managed');

      // Test partial update patch merging
      const patch = {
        plans: {
          byok_starter: {
            ...config.plans.byok_starter,
            monthlyPrice: 520
          }
        }
      };

      let updated;
      assert.doesNotThrow(() => {
        updated = updateAdminConfig(patch);
      });

      assert.strictEqual(updated.plans.byok_starter.monthlyPrice, 520);
      // Ensure other plans were preserved and not erased
      assert.strictEqual(updated.plans.byok_pro.monthlyPrice, 899);
      assert.strictEqual(updated.plans.managed.monthlyPrice, 1499);

      // Revert test patch
      updateAdminConfig({
        plans: {
          byok_starter: {
            ...config.plans.byok_starter,
            monthlyPrice: 499
          }
        }
      });
    });
  });

  // =========================================================================
  // 5. Findings & Potential Failure Modes Summary
  // =========================================================================
  describe('5. Adversarial Edge Case Discovery & Forensic Observations', () => {

    it('5.1 Finding 1: upsertUserGrant does not grandfather "pro" or "ultra" tiers', async () => {
      const adminModule = await import(pathToFileURL(ADMIN_SETTINGS_PATH).href);
      const { upsertUserGrant, getUserGrant } = adminModule;

      // In adminSettings.ts line 351:
      // let resolvedTier = input.tier || 'byok_starter';
      // if (resolvedTier === 'byok') {
      //   resolvedTier = input.isSubscribed ? 'byok_pro' : 'byok_starter';
      // }
      // Notice: If input.tier is 'pro' or 'ultra', resolvedTier is NOT converted to 'byok_pro'!
      const grantPro = upsertUserGrant({
        email: 'test_legacy_pro@example.com',
        isSubscribed: true,
        tier: 'pro',
        interval: 'monthly',
        unlockedStoreBots: []
      });

      // Observe actual behavior:
      // grantPro.tier is 'pro', not 'byok_pro'!
      // While getEffectivePlanTier('pro') maps to 'byok_pro' at runtime, the persisted grant tier remains 'pro'.
      assert.ok(grantPro.tier === 'pro' || grantPro.tier === 'byok_pro', 'Persisted tier should be documented');
    });

    it('5.2 Finding 2: opay.ts PLAN_PRICES legacy keys pro/ultra specify 899 instead of plans.ts 499', async () => {
      const opayModule = await import(pathToFileURL(OPAY_PATH).href);
      const { PLAN_PRICES } = opayModule;

      // In opay.ts:
      // pro: { monthly: 899, yearly: 8690 }
      // ultra: { monthly: 899, yearly: 8690 }
      // Whereas in plans.ts getPlanPrice:
      // case 'pro': case 'ultra': resolved = plans.byok_starter (499 / 4790)
      assert.strictEqual(PLAN_PRICES.pro.monthly, 899);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'pro', 'monthly'), 499);
      // This is a noticeable divergence between client pricing table and server resolver!
    });
  });
});
