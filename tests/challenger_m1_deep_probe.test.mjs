import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';

const CACHE_FILE_PATH = path.join(
  process.platform === 'win32' ? process.env.TEMP || 'C:\\Windows\\Temp' : '/tmp',
  'ezbo_admin_settings.json'
);

describe('Milestone M1 Challenger Deep Probe: Boundary & Adversarial Suite', () => {
  let adminModule;
  let userStoreModule;
  let plansModule;
  let paymentCreateModule;
  let originalCacheBackup = null;

  before(async () => {
    // Backup existing cache file if present
    if (fs.existsSync(CACHE_FILE_PATH)) {
      originalCacheBackup = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
    }

    // Dynamic imports
    adminModule = await import('../web/src/lib/server/adminSettings.ts');
    userStoreModule = await import('../web/src/lib/stores/userStore.ts');
    plansModule = await import('../web/src/lib/config/plans.ts');
    paymentCreateModule = await import('../web/src/routes/api/payment/create/+server.ts');
  });

  after(() => {
    // Restore original cache backup
    try {
      if (originalCacheBackup !== null) {
        fs.writeFileSync(CACHE_FILE_PATH, originalCacheBackup, 'utf-8');
      } else if (fs.existsSync(CACHE_FILE_PATH)) {
        fs.unlinkSync(CACHE_FILE_PATH);
      }
    } catch (e) {
      console.warn('Failed to restore admin settings cache backup:', e);
    }
  });

  // =========================================================================
  // SECTION 1: updateAdminConfig() Round-Trip Persistence & Partial Patches
  // =========================================================================
  describe('1. updateAdminConfig() Partial Patch & Deep-Merge Persistence', () => {
    
    it('1.1 should patch only byok_pro and preserve byok_starter, managed, and unmentioned byok_pro fields', () => {
      const initial = adminModule.getAdminConfig();
      const initialStarterPrice = initial.plans?.byok_starter?.monthlyPrice || 499;
      const initialManagedPrice = initial.plans?.managed?.monthlyPrice || 1499;
      const initialProFeatures = [...(initial.plans?.byok_pro?.features || [])];

      // Patch ONLY byok_pro monthlyPrice
      const patched = adminModule.updateAdminConfig({
        plans: {
          byok_pro: {
            monthlyPrice: 1099
          }
        }
      });

      // Verify byok_pro changed price but kept other fields
      assert.strictEqual(patched.plans?.byok_pro?.monthlyPrice, 1099, 'byok_pro.monthlyPrice must be updated to 1099');
      assert.strictEqual(patched.plans?.byok_pro?.yearlyTotal, 8690, 'byok_pro.yearlyTotal must be preserved');
      assert.strictEqual(patched.plans?.byok_pro?.id, 'byok_pro', 'byok_pro.id must remain byok_pro');
      assert.deepStrictEqual(patched.plans?.byok_pro?.features, initialProFeatures, 'byok_pro.features must be preserved');
      assert.strictEqual(patched.plans?.byok_pro?.featureToggles?.multiKeyVault, true, 'byok_pro feature toggles must be preserved');

      // Verify byok_starter was NOT clobbered
      assert.strictEqual(patched.plans?.byok_starter?.monthlyPrice, initialStarterPrice, 'byok_starter.monthlyPrice must NOT be clobbered');
      assert.strictEqual(patched.plans?.byok_starter?.id, 'byok_starter');
      assert.strictEqual(patched.plans?.byok_starter?.featureToggles?.multiKeyVault, false);

      // Verify managed was NOT clobbered
      assert.strictEqual(patched.plans?.managed?.monthlyPrice, initialManagedPrice, 'managed.monthlyPrice must NOT be clobbered');
      assert.strictEqual(patched.plans?.managed?.id, 'managed');

      // Verify byok alias remains in sync with byok_starter
      assert.strictEqual(patched.plans?.byok?.monthlyPrice, initialStarterPrice);
    });

    it('1.2 should patch only byok_starter and update byok alias without affecting byok_pro or managed', () => {
      const patched = adminModule.updateAdminConfig({
        plans: {
          byok_starter: {
            monthlyPrice: 599,
            yearlyTotal: 5790
          }
        }
      });

      assert.strictEqual(patched.plans?.byok_starter?.monthlyPrice, 599);
      assert.strictEqual(patched.plans?.byok_starter?.yearlyTotal, 5790);
      assert.strictEqual(patched.plans?.byok?.monthlyPrice, 599, 'byok alias must reflect byok_starter changes');
      assert.strictEqual(patched.plans?.byok?.yearlyTotal, 5790);

      // byok_pro should still hold its previous update (1099)
      assert.strictEqual(patched.plans?.byok_pro?.monthlyPrice, 1099);
      assert.strictEqual(patched.plans?.managed?.monthlyPrice, 1499);
    });

    it('1.3 should patch only a subset of featureToggles in byok_pro and preserve unmentioned toggles', () => {
      // byok_pro starts with multiKeyVault: true, multiModelFailover: true, prioritySupport: true
      const patched = adminModule.updateAdminConfig({
        plans: {
          byok_pro: {
            featureToggles: {
              customPrompts: false
            }
          }
        }
      });

      const toggles = patched.plans?.byok_pro?.featureToggles;
      assert.strictEqual(toggles?.customPrompts, false, 'customPrompts toggle must be updated to false');
      assert.strictEqual(toggles?.multiKeyVault, true, 'multiKeyVault toggle must be preserved as true');
      assert.strictEqual(toggles?.multiModelFailover, true, 'multiModelFailover toggle must be preserved as true');
      assert.strictEqual(toggles?.allHelpersEnabled, true, 'allHelpersEnabled toggle must be preserved');
      assert.ok(Array.isArray(toggles?.enabledHelpers), 'enabledHelpers array must be preserved');
    });

    it('1.4 should patch enabledHelpers without resetting allHelpersEnabled or other toggles', () => {
      const patched = adminModule.updateAdminConfig({
        plans: {
          byok_starter: {
            featureToggles: {
              allHelpersEnabled: false,
              enabledHelpers: ['robot-01', 'robot-02', 'robot-03']
            }
          }
        }
      });

      const starterToggles = patched.plans?.byok_starter?.featureToggles;
      assert.strictEqual(starterToggles?.allHelpersEnabled, false);
      assert.deepStrictEqual(starterToggles?.enabledHelpers, ['robot-01', 'robot-02', 'robot-03']);
      assert.strictEqual(starterToggles?.aiCeo, true, 'aiCeo toggle must remain true');
      assert.strictEqual(starterToggles?.whatsapp, true, 'whatsapp toggle must remain true');
    });

    it('1.5 should support legacy patch key "byok" mapping directly to byok_starter', () => {
      const patched = adminModule.updateAdminConfig({
        plans: {
          byok: {
            monthlyPrice: 649
          }
        }
      });

      assert.strictEqual(patched.plans?.byok_starter?.monthlyPrice, 649, 'byok patch must update byok_starter');
      assert.strictEqual(patched.plans?.byok?.monthlyPrice, 649, 'byok alias must reflect update');
      assert.strictEqual(patched.plans?.byok_starter?.featureToggles?.allHelpersEnabled, false, 'previous featureToggles must persist');
    });

    it('1.6 should update non-plan fields without wiping or resetting plans', () => {
      const patched = adminModule.updateAdminConfig({
        opayApiKey: 'opay_live_key_challenger_test',
        telegramBotUsername: 'ChallengerBot'
      });

      assert.strictEqual(patched.opayApiKey, 'opay_live_key_challenger_test');
      assert.strictEqual(patched.telegramBotUsername, 'ChallengerBot');

      // Verify plans remain fully populated and custom-configured
      assert.strictEqual(patched.plans?.byok_starter?.monthlyPrice, 649);
      assert.strictEqual(patched.plans?.byok_pro?.monthlyPrice, 1099);
      assert.strictEqual(patched.plans?.managed?.monthlyPrice, 1499);
      assert.strictEqual(patched.plans?.byok_pro?.featureToggles?.customPrompts, false);
    });

    it('1.7 should persist changes to disk cache and reload faithfully', () => {
      assert.ok(fs.existsSync(CACHE_FILE_PATH), 'Cache file must exist on disk');
      const rawDisk = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const parsedDisk = JSON.parse(rawDisk);

      assert.strictEqual(parsedDisk.opayApiKey, 'opay_live_key_challenger_test');
      assert.strictEqual(parsedDisk.plans?.byok_starter?.monthlyPrice, 649);
      assert.strictEqual(parsedDisk.plans?.byok_pro?.monthlyPrice, 1099);
      assert.strictEqual(parsedDisk.plans?.byok_pro?.featureToggles?.customPrompts, false);
      assert.strictEqual(parsedDisk.plans?.byok_starter?.featureToggles?.allHelpersEnabled, false);
      assert.deepStrictEqual(parsedDisk.plans?.byok_starter?.featureToggles?.enabledHelpers, ['robot-01', 'robot-02', 'robot-03']);
    });
  });

  // =========================================================================
  // SECTION 2: Dynamic Amount Derivation in opay.ts & /api/payment/create
  // =========================================================================
  describe('2. Dynamic Payment Amount Derivation & Tamper Resistance', () => {

    it('2.1 should derive default amounts correctly for all 3 subscription tiers across monthly and yearly', () => {
      const defaultPlans = plansModule.DEFAULT_PLANS;

      // Starter
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'byok_starter', 'monthly'), 499);
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'byok_starter', 'yearly'), 4790);

      // Pro
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'byok_pro', 'monthly'), 899);
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'byok_pro', 'yearly'), 8690);

      // Managed
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'managed', 'monthly'), 1499);
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'managed', 'yearly'), 14390);

      // Legacy aliases
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'byok', 'monthly'), 499);
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'complete', 'monthly'), 1499);
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'pro', 'monthly'), 499);
      assert.strictEqual(plansModule.getPlanPrice(defaultPlans, 'ultra', 'monthly'), 499);
    });

    it('2.2 api/payment/create should strictly enforce serverConfig price over client-supplied subscription amount', async () => {
      // Set a known price in adminConfig
      adminModule.updateAdminConfig({
        plans: {
          byok_pro: { monthlyPrice: 899 },
          managed: { monthlyPrice: 1499 }
        }
      });

      // Mock request trying to buy Managed plan for 1 BDT (client tampering attempt)
      let capturedBodyParams = null;
      const originalFetch = globalThis.fetch;
      
      try {
        globalThis.fetch = async (url, opts) => {
          if (typeof url === 'string' && url.includes('verify.opaybd.com')) {
            capturedBodyParams = new URLSearchParams(opts.body);
            return new Response(JSON.stringify({
              status: true,
              payment_url: 'https://verify.opaybd.com/checkout/mock-url-123'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          return originalFetch(url, opts);
        };

        const mockRequest = new Request('http://localhost:5173/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'subscription',
            plan: 'managed',
            interval: 'monthly',
            amount: 1, // Tampered price
            customerName: 'Hacker Bob',
            customerEmail: 'bob@attacker.com'
          })
        });

        const res = await paymentCreateModule.POST({ request: mockRequest, url: new URL('http://localhost:5173/api/payment/create') });
        const data = await res.json();

        assert.strictEqual(data.success, true);
        assert.ok(capturedBodyParams, 'Should have forwarded to OPay');
        assert.strictEqual(capturedBodyParams.get('amount'), '1499', 'Server MUST override tampered amount (1) with official serverPrice (1499)');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('2.3 api/payment/create should dynamically use newly updated adminConfig price', async () => {
      // Update byok_pro price to 1150 in adminConfig
      adminModule.updateAdminConfig({
        plans: {
          byok_pro: { monthlyPrice: 1150 }
        }
      });

      let capturedBodyParams = null;
      const originalFetch = globalThis.fetch;

      try {
        globalThis.fetch = async (url, opts) => {
          if (typeof url === 'string' && url.includes('verify.opaybd.com')) {
            capturedBodyParams = new URLSearchParams(opts.body);
            return new Response(JSON.stringify({
              status: true,
              payment_url: 'https://verify.opaybd.com/checkout/mock-url-dynamic'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          return originalFetch(url, opts);
        };

        const mockRequest = new Request('http://localhost:5173/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'subscription',
            plan: 'byok_pro',
            interval: 'monthly',
            amount: 899 // Sent old price
          })
        });

        const res = await paymentCreateModule.POST({ request: mockRequest, url: new URL('http://localhost:5173/api/payment/create') });
        const data = await res.json();

        assert.strictEqual(data.success, true);
        assert.strictEqual(capturedBodyParams.get('amount'), '1150', 'Server MUST dynamically charge new adminConfig price (1150)');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('2.4 api/payment/create should preserve custom amount for store_bot and reject <= 0 amounts', async () => {
      let capturedBodyParams = null;
      const originalFetch = globalThis.fetch;

      try {
        globalThis.fetch = async (url, opts) => {
          if (typeof url === 'string' && url.includes('verify.opaybd.com')) {
            capturedBodyParams = new URLSearchParams(opts.body);
            return new Response(JSON.stringify({
              status: true,
              payment_url: 'https://verify.opaybd.com/checkout/mock-bot-url'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          return originalFetch(url, opts);
        };

        // Valid custom bot amount
        const mockValid = new Request('http://localhost:5173/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'store_bot',
            botId: 'seo-master-bot',
            botName: 'SEO Master Bot',
            amount: 349
          })
        });

        const resValid = await paymentCreateModule.POST({ request: mockValid, url: new URL('http://localhost:5173') });
        const dataValid = await resValid.json();
        assert.strictEqual(dataValid.success, true);
        assert.strictEqual(capturedBodyParams.get('amount'), '349');

        // Invalid bot amount (0 or negative)
        const mockInvalid = new Request('http://localhost:5173/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'store_bot',
            botId: 'seo-master-bot',
            amount: 0
          })
        });

        const resInvalid = await paymentCreateModule.POST({ request: mockInvalid, url: new URL('http://localhost:5173') });
        assert.strictEqual(resInvalid.status, 400);
        const dataInvalid = await resInvalid.json();
        assert.strictEqual(dataInvalid.success, false);
        assert.strictEqual(dataInvalid.error, 'Valid payment amount is required');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  // =========================================================================
  // SECTION 3: isHelperUnlocked() Comprehensive Matrix Testing
  // =========================================================================
  describe('3. isHelperUnlocked() Gatekeeper Stress & Boundary Harness', () => {

    it('3.1 should return true for all helpers when allHelpersEnabled is true', () => {
      const plans = {
        byok_starter: {
          featureToggles: {
            allHelpersEnabled: true,
            enabledHelpers: []
          }
        },
        byok_pro: {
          featureToggles: {
            allHelpersEnabled: true,
            enabledHelpers: ['random-helper']
          }
        }
      };

      // Stress test with 50 diverse helper IDs
      for (let i = 1; i <= 50; i++) {
        const toolId = `tool-${i.toString().padStart(2, '0')}`;
        assert.strictEqual(userStoreModule.isHelperUnlocked(toolId, 'byok_starter', plans), true);
        assert.strictEqual(userStoreModule.isHelperUnlocked(toolId, 'byok_pro', plans), true);
      }
    });

    it('3.2 should strictly gate helpers when allHelpersEnabled is false', () => {
      const allowedStarter = ['tool-01', 'tool-02', 'tool-05'];
      const allowedPro = ['tool-01', 'tool-02', 'tool-03', 'tool-04', 'tool-05'];

      const plans = {
        byok_starter: {
          featureToggles: {
            allHelpersEnabled: false,
            enabledHelpers: allowedStarter
          }
        },
        byok_pro: {
          featureToggles: {
            allHelpersEnabled: false,
            enabledHelpers: allowedPro
          }
        }
      };

      // In allowedStarter -> unlocked
      for (const id of allowedStarter) {
        assert.strictEqual(userStoreModule.isHelperUnlocked(id, 'byok_starter', plans), true, `${id} must be unlocked for byok_starter`);
      }

      // Not in allowedStarter -> locked
      for (const id of ['tool-03', 'tool-04', 'tool-99', 'unknown-tool']) {
        assert.strictEqual(userStoreModule.isHelperUnlocked(id, 'byok_starter', plans), false, `${id} must be LOCKED for byok_starter`);
      }

      // In allowedPro -> unlocked
      for (const id of allowedPro) {
        assert.strictEqual(userStoreModule.isHelperUnlocked(id, 'byok_pro', plans), true, `${id} must be unlocked for byok_pro`);
      }

      // Not in allowedPro -> locked
      for (const id of ['tool-06', 'tool-99']) {
        assert.strictEqual(userStoreModule.isHelperUnlocked(id, 'byok_pro', plans), false, `${id} must be LOCKED for byok_pro`);
      }
    });

    it('3.3 should lock ALL helpers when allHelpersEnabled is false and enabledHelpers is empty or omitted', () => {
      const plansEmptyList = {
        byok_starter: {
          featureToggles: {
            allHelpersEnabled: false,
            enabledHelpers: []
          }
        }
      };

      const plansOmittedList = {
        byok_starter: {
          featureToggles: {
            allHelpersEnabled: false
          }
        }
      };

      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', 'byok_starter', plansEmptyList), false);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-75', 'byok_starter', plansEmptyList), false);

      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', 'byok_starter', plansOmittedList), false);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-75', 'byok_starter', plansOmittedList), false);
    });

    it('3.4 should grandfather legacy subscriber tiers into byok_pro access rules', () => {
      const plans = {
        byok_starter: {
          featureToggles: { allHelpersEnabled: false, enabledHelpers: ['tool-starter'] }
        },
        byok_pro: {
          featureToggles: { allHelpersEnabled: false, enabledHelpers: ['tool-starter', 'tool-pro-exclusive'] }
        }
      };

      // Legacy paying tiers 'byok', 'pro', 'ultra' should evaluate against byok_pro
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-pro-exclusive', 'byok', plans), true);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-pro-exclusive', 'pro', plans), true);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-pro-exclusive', 'ultra', plans), true);

      // Whereas byok_starter cannot access tool-pro-exclusive
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-pro-exclusive', 'byok_starter', plans), false);
    });

    it('3.5 should ALWAYS return false for free or unauthenticated tiers regardless of toggles', () => {
      const permissivePlans = {
        byok_starter: { featureToggles: { allHelpersEnabled: true, enabledHelpers: [] } },
        byok_pro: { featureToggles: { allHelpersEnabled: true, enabledHelpers: [] } },
        managed: { featureToggles: { allHelpersEnabled: true, enabledHelpers: [] } }
      };

      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', 'free', permissivePlans), false);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', '', permissivePlans), false);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', null, permissivePlans), false);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', undefined, permissivePlans), false);
    });

    it('3.6 should fall back gracefully to DEFAULT_PLANS if plans argument is omitted or null', () => {
      // In DEFAULT_PLANS, all subscribed tiers have allHelpersEnabled: true
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', 'byok_starter'), true);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', 'byok_pro'), true);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', 'managed'), true);
      assert.strictEqual(userStoreModule.isHelperUnlocked('tool-01', 'free'), false);
    });
  });
});
