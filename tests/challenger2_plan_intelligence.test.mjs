/**
 * Adversarial Empirical Stress Test Suite: Challenger 2 — Real-Time Plan Intelligence & Directives
 * 
 * Conducts deep adversarial stress testing across:
 * 1. extractPlanCapabilities Edge Cases (null, undefined, "", spaces, unknown tiers, fuzzing types)
 * 2. Custom adminConfig Toggles (disabled helpers, subset helpers, subset tool connectors, admin overrides)
 * 3. Client-Server Isolation (static analysis of ceoRouter.ts - zero $lib/server imports)
 * 4. Directive Generation & Language Stress (Starter, Pro, Managed, Free, partial unlocks, zero unlocks)
 * 5. Multilingual Directives & Language Mirroring (Bengali, Banglish, English)
 * 6. Locked Asset Defense & Upgrade Guidance ("Do NOT fake or pretend to execute it")
 * 7. 3-Tier Comparative Knowledge Base (Starter BDT 499, Pro BDT 899, Managed BDT 1,499)
 * 8. System Prompt Integration Across Modes (Autonomous CEO, Delegated Helper, Studio, Multi-Agent Pipeline)
 * 9. Backward Compatibility (omitted options, empty options, pre-computed vs auto-extracted)
 * 10. Starter Intent Guard & Gating Accuracy (adversarial intent fuzzing, negative non-trigger cases)
 * 11. Platform Invariants (robots.css SHA256 & Strict 7-Tier Invariant)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

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
  chatServerTs: path.join(WEB_DIR, 'src', 'routes', 'api', 'chat', '+server.ts'),
  ceoRouterTs: path.join(WEB_DIR, 'src', 'lib', 'services', 'ceoRouter.ts'),
  plansConfigTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts'),
  toolsConfigTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'),
  toolConnectorsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'toolConnectors.ts'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  runAllTests: path.join(ROOT_DIR, 'tests', 'run_all_tests.mjs')
};

// Dynamically import ceoRouter module
const ceoRouterMod = await import(pathToFileURL(PATHS.ceoRouterTs).href);
const {
  extractPlanCapabilities,
  buildPlanCapabilityDirective,
  buildCeoOrHelperSystemPrompt,
  detectUserLanguage,
  isRestrictedStarterIntent,
  getStarterGuardResponse
} = ceoRouterMod;

// Dynamically import tools and tool connectors for oracle comparisons
const toolsMod = await import(pathToFileURL(PATHS.toolsConfigTs).href);
const { TOOLS } = toolsMod;

const toolConnectorsMod = await import(pathToFileURL(PATHS.toolConnectorsTs).href);
const { TOOL_CONNECTORS } = toolConnectorsMod;

const plansMod = await import(pathToFileURL(PATHS.plansConfigTs).href);
const { DEFAULT_PLANS } = plansMod;

describe('Adversarial Challenger 2: Real-Time Plan Intelligence & Directive Stress Testing', () => {

  // =========================================================================
  // 1. Capability Extractor Edge Cases & Type Fuzzing
  // =========================================================================
  describe('1. Capability Extractor Edge Cases & Type Fuzzing', () => {
    it('1.1 Should gracefully handle null, undefined, empty string and whitespace rawTier by falling back to byok_starter', () => {
      const edgeCases = [null, undefined, '', '   ', '\t\n'];
      for (const tierInput of edgeCases) {
        const caps = extractPlanCapabilities(null, tierInput);
        assert.strictEqual(caps.tierId, 'byok_starter', `Expected byok_starter for ${JSON.stringify(tierInput)}`);
        assert.strictEqual(caps.isFree, false);
        assert.strictEqual(caps.planName, 'Starter Plan');
        assert.strictEqual(caps.pricing.monthlyPrice, 499);
        assert.strictEqual(caps.pricing.yearlyMonthlyPrice, 399);
        assert.strictEqual(caps.allHelpersUnlocked, true);
        assert.strictEqual(caps.unlockedHelpersCount, 80);
      }
    });

    it('1.2 Should map unrecognized or exotic tier strings to byok_starter without throwing', () => {
      const unknownTiers = [
        'enterprise_vip',
        'diamond_tier',
        'custom_enterprise',
        'random_string_1234',
        'starter_plus_max',
        'byok_tier',
        'vip'
      ];
      for (const tier of unknownTiers) {
        const caps = extractPlanCapabilities(null, tier);
        assert.strictEqual(caps.tierId, 'byok_starter', `Unknown tier ${tier} should fall back to byok_starter`);
        assert.strictEqual(caps.isFree, false);
        assert.strictEqual(caps.planName, 'Starter Plan');
      }
    });

    it('1.3 Should recognize tier synonyms case-insensitively with whitespace trimming', () => {
      // Pro synonyms
      const proSynonyms = ['byok_pro', 'pro', 'ultra', 'byok', '  PRO  ', '  byok_pro  ', 'ULTRA', 'Byok'];
      for (const syn of proSynonyms) {
        const caps = extractPlanCapabilities(null, syn);
        assert.strictEqual(caps.tierId, 'byok_pro', `Synonym ${syn} should map to byok_pro`);
        assert.strictEqual(caps.isFree, false);
        assert.strictEqual(caps.planName, 'Pro Plan');
        assert.strictEqual(caps.features.workflowCustomization, true);
        assert.strictEqual(caps.features.multiKeyVault, true);
      }

      // Managed synonyms
      const managedSynonyms = ['managed', 'complete', '  MANAGED  ', '  Complete  ', 'COMPLETE'];
      for (const syn of managedSynonyms) {
        const caps = extractPlanCapabilities(null, syn);
        assert.strictEqual(caps.tierId, 'managed', `Synonym ${syn} should map to managed`);
        assert.strictEqual(caps.isFree, false);
        assert.ok(
          caps.planName === 'All-Inclusive Cloud' || caps.planName === 'Cloud Managed Plan',
          `Managed plan name mismatch: ${caps.planName}`
        );
        assert.strictEqual(caps.features.zeroKeyManagedCloud, true);
        assert.strictEqual(caps.features.workflowCustomization, true);
      }

      // Free tier
      const freeSynonyms = ['free', 'FREE', '  Free  ', '  free  '];
      for (const syn of freeSynonyms) {
        const caps = extractPlanCapabilities(null, syn);
        assert.strictEqual(caps.tierId, 'free', `Free synonym ${syn} should map to free`);
        assert.strictEqual(caps.isFree, true);
        assert.strictEqual(caps.planName, 'Free Trial / Unsubscribed');
        assert.strictEqual(caps.badge, 'Free Access');
        assert.strictEqual(caps.unlockedHelpersCount, 0);
        assert.strictEqual(caps.unlockedToolsCount, 0);
        assert.strictEqual(caps.allHelpersUnlocked, false);
        assert.strictEqual(caps.allToolsUnlocked, false);
        assert.strictEqual(caps.pricing.monthlyPrice, 0);
        assert.strictEqual(caps.pricing.yearlyMonthlyPrice, 0);
      }
    });

    it('1.4 Should handle non-string primitive inputs (numbers, booleans, objects, arrays) resiliently', () => {
      const weirdInputs = [0, 123, true, false, {}, [], () => {}];
      for (const weird of weirdInputs) {
        assert.doesNotThrow(() => {
          const caps = extractPlanCapabilities(null, weird);
          assert.ok(caps.tierId, 'Must return a valid tierId');
          assert.ok(typeof caps.unlockedHelpersCount === 'number');
          assert.ok(typeof caps.unlockedToolsCount === 'number');
        }, `Fuzzed input ${String(weird)} should not throw`);
      }
    });

    it('1.5 Should verify comprehensive return contract and immutability-ready arrays', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');
      assert.ok(Array.isArray(caps.unlockedHelpers), 'unlockedHelpers must be an array');
      assert.ok(Array.isArray(caps.lockedHelpers), 'lockedHelpers must be an array');
      assert.ok(Array.isArray(caps.unlockedTools), 'unlockedTools must be an array');
      assert.ok(Array.isArray(caps.lockedTools), 'lockedTools must be an array');

      // Total helpers invariant: unlocked + locked == total (80)
      assert.strictEqual(caps.unlockedHelpers.length + caps.lockedHelpers.length, 80);
      assert.strictEqual(caps.totalHelpersCount, 80);

      // Verify helper schema
      const sampleHelper = caps.unlockedHelpers[0];
      assert.ok(sampleHelper.id, 'Helper item must contain id');
      assert.ok(sampleHelper.code, 'Helper item must contain code');
      assert.ok(sampleHelper.name, 'Helper item must contain name');
      assert.ok(sampleHelper.category, 'Helper item must contain category');

      // Verify tool schema
      const sampleTool = caps.unlockedTools[0];
      assert.ok(sampleTool.id, 'Tool item must contain id');
      assert.ok(sampleTool.name, 'Tool item must contain name');
      assert.ok(sampleTool.category, 'Tool item must contain category');
    });
  });

  // =========================================================================
  // 2. Custom adminConfig Configurations & Override Toggles
  // =========================================================================
  describe('2. Custom adminConfig Configurations & Override Toggles', () => {
    it('2.1 Should enforce custom allHelpersEnabled: false and respect enabledHelpers whitelist', () => {
      const customConfig = {
        plans: {
          byok_starter: {
            ...DEFAULT_PLANS.byok_starter,
            featureToggles: {
              ...DEFAULT_PLANS.byok_starter.featureToggles,
              allHelpersEnabled: false,
              enabledHelpers: ['fb_insta_ads', 'unlimited_post_ideas', 'ai_text_humanizer']
            }
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_starter');
      assert.strictEqual(caps.allHelpersUnlocked, false);
      assert.strictEqual(caps.unlockedHelpersCount, 3);
      assert.strictEqual(caps.lockedHelpers.length, 77);

      const unlockedIds = caps.unlockedHelpers.map((h) => h.id);
      assert.deepStrictEqual(unlockedIds.sort(), ['ai_text_humanizer', 'fb_insta_ads', 'unlimited_post_ideas'].sort());
    });

    it('2.2 Should enforce custom allToolsEnabled: false and respect enabledTools whitelist', () => {
      const customConfig = {
        plans: {
          byok_pro: {
            ...DEFAULT_PLANS.byok_pro,
            featureToggles: {
              ...DEFAULT_PLANS.byok_pro.featureToggles,
              allToolsEnabled: false,
              enabledTools: ['google_sheets', 'whatsapp_cloud', 'bkash_merchant']
            }
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_pro');
      assert.strictEqual(caps.allToolsUnlocked, false);
      assert.strictEqual(caps.unlockedToolsCount, 3);
      assert.strictEqual(caps.lockedTools.length, caps.totalToolsCount - 3);

      const unlockedIds = caps.unlockedTools.map((t) => t.id);
      assert.deepStrictEqual(unlockedIds.sort(), ['bkash_merchant', 'google_sheets', 'whatsapp_cloud'].sort());
    });

    it('2.3 Should respect platform-level adminConfig.enabledToolConnectors global restriction', () => {
      const customConfig = {
        enabledToolConnectors: ['google_sheets', 'whatsapp_cloud', 'bkash_merchant', 'google_drive'],
        plans: {
          byok_starter: {
            ...DEFAULT_PLANS.byok_starter
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_starter');
      assert.strictEqual(caps.totalToolsCount, 4, 'totalToolsCount must match platform-enabled connectors count');
      assert.strictEqual(caps.unlockedToolsCount, 4);
      assert.strictEqual(caps.lockedTools.length, 0);
    });

    it('2.4 Should respect adminConfig.workflowCustomizationUserEnabled: false override on Pro/Managed plans', () => {
      const customConfig = {
        workflowCustomizationUserEnabled: false,
        plans: DEFAULT_PLANS
      };

      const proCaps = extractPlanCapabilities(customConfig, 'byok_pro');
      assert.strictEqual(
        proCaps.features.workflowCustomization,
        false,
        'Pro plan must lock workflowCustomization when admin sets workflowCustomizationUserEnabled to false'
      );

      const managedCaps = extractPlanCapabilities(customConfig, 'managed');
      assert.strictEqual(
        managedCaps.features.workflowCustomization,
        false,
        'Managed plan must lock workflowCustomization when admin sets workflowCustomizationUserEnabled to false'
      );
    });

    it('2.5 Should reflect custom pricing overrides from adminConfig.plans', () => {
      const customConfig = {
        plans: {
          byok_starter: {
            ...DEFAULT_PLANS.byok_starter,
            monthlyPrice: 650,
            yearlyMonthlyPrice: 520
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_starter');
      assert.strictEqual(caps.pricing.monthlyPrice, 650);
      assert.strictEqual(caps.pricing.yearlyMonthlyPrice, 520);
    });

    it('2.6 Should handle corrupted or missing plans / featureToggles objects in adminConfig safely', () => {
      const corruptedConfigs = [
        {},
        { plans: null },
        { plans: {} },
        { plans: { byok_starter: null } },
        { plans: { byok_starter: { featureToggles: null } } }
      ];

      for (const conf of corruptedConfigs) {
        assert.doesNotThrow(() => {
          const caps = extractPlanCapabilities(conf, 'byok_starter');
          assert.strictEqual(caps.tierId, 'byok_starter');
          assert.ok(caps.unlockedHelpersCount >= 0);
          assert.ok(caps.unlockedToolsCount >= 0);
        }, `Corrupted config ${JSON.stringify(conf)} should not crash extractor`);
      }
    });
  });

  // =========================================================================
  // 3. Client-Server Isolation (Static Verification)
  // =========================================================================
  describe('3. Client-Server Isolation (Static Verification)', () => {
    it('3.1 ceoRouter.ts must NOT import from $lib/server or any server-only modules', () => {
      const content = fs.readFileSync(PATHS.ceoRouterTs, 'utf-8');
      
      // Prohibit $lib/server
      assert.ok(!content.includes("from '$lib/server"), 'Must not import from $lib/server');
      assert.ok(!content.includes('from "$lib/server'), 'Must not import from "$lib/server"');
      assert.ok(!content.includes("import('$lib/server"), 'Must not dynamic import $lib/server');

      // Prohibit @sveltejs/kit server imports
      assert.ok(!content.includes('@sveltejs/kit'), 'Must not import @sveltejs/kit in client-safe ceoRouter');

      // Prohibit Node.js fs/path in ceoRouter
      assert.ok(!content.includes("from 'fs'"), 'Must not import fs');
      assert.ok(!content.includes("from 'node:fs'"), 'Must not import node:fs');
      assert.ok(!content.includes("from 'path'"), 'Must not import path');
      assert.ok(!content.includes("from 'node:path'"), 'Must not import node:path');
    });

    it('3.2 ceoRouter.ts imports only client-safe configuration modules', () => {
      const content = fs.readFileSync(PATHS.ceoRouterTs, 'utf-8');
      const importLines = content.split('\n').filter((l) => l.trim().startsWith('import '));

      for (const line of importLines) {
        const isClientSafe =
          line.includes('$lib/config/tools') ||
          line.includes('$lib/config/plans') ||
          line.includes('$lib/config/toolConnectors');
        assert.ok(
          isClientSafe,
          `Import line in ceoRouter.ts must be strictly client-safe, found: ${line}`
        );
      }
    });
  });

  // =========================================================================
  // 4. Directive Generation & Language Stress Testing
  // =========================================================================
  describe('4. Directive Generation & Language Stress Testing', () => {
    it('4.1 buildPlanCapabilityDirective formats comprehensive directive for all 4 subscription tiers', () => {
      const tiers = ['byok_starter', 'byok_pro', 'managed', 'free'];
      for (const t of tiers) {
        const caps = extractPlanCapabilities(null, t);
        const directive = buildPlanCapabilityDirective(caps);

        assert.ok(directive.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
        assert.ok(directive.includes(`USER ACTIVE PLAN: ${caps.planName}`));
        assert.ok(directive.includes(`PRICING: BDT ${caps.pricing.monthlyPrice}/mo`));
        assert.ok(directive.includes('1. ACTIVE PLAN ASSET ENTITLEMENTS:'));
        assert.ok(directive.includes('2. MANDATORY INTERACTION DIRECTIVES:'));
        assert.ok(directive.includes('PLAN TOOL & AGENT INQUIRIES:'));
        assert.ok(directive.includes('LOCKED HELPER OR TOOL COMMANDS:'));
        assert.ok(directive.includes('PLAN DIFFERENCES & COMPARISON KNOWLEDGE:'));
      }
    });

    it('4.2 Directive embeds exact multilingual inquiries in Bengali, Banglish, and English', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      // Verify English trigger example
      assert.ok(directive.includes('which tools are in my plan?'), 'Directive must include English question example');

      // Verify Bengali trigger example
      assert.ok(directive.includes('আমার প্ল্যানে কি কি টুল আছে?'), 'Directive must include Bengali question example');

      // Verify Banglish trigger example
      assert.ok(directive.includes('amr plan e ki ki agent ache?'), 'Directive must include Banglish question example');

      // Verify mandatory language matching directive
      assert.ok(
        directive.includes("Deliver your reply exclusively in the user's matching language (Bengali, Banglish, or English)."),
        'Directive must mandate replying in matching language'
      );
    });

    it('4.3 Locked Asset Defense strictly prohibits faking execution and guides upgrade to Pro / Managed', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      assert.ok(directive.includes('Do NOT fake or pretend to execute it.'), 'Directive must strictly prohibit faking execution');
      assert.ok(
        directive.includes('Politely and professionally explain that this helper/tool is restricted on their current plan'),
        'Directive must mandate polite restriction explanation'
      );
      assert.ok(
        directive.includes('Clearly guide them on how to upgrade: navigate to "Subscription Plans" in the sidebar or click "Upgrade Plan" to unlock Pro / Cloud Managed.'),
        'Directive must provide clear upgrade path'
      );
    });

    it('4.4 3-Tier Comparative Knowledge Base contains authoritative specifications and pricing', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      // Starter specifications
      assert.ok(directive.includes('Starter Plan (BDT 499/mo | BDT 399/mo yearly)'));
      assert.ok(directive.includes('80 readymade agent workflows (#01–#80)'));
      assert.ok(directive.includes('100+ tool connectors'));
      assert.ok(directive.includes('Single-Key BYOK'));
      assert.ok(directive.includes('Cannot visually edit workflow nodes or build custom agents'));

      // Pro specifications
      assert.ok(directive.includes('Pro Plan (BDT 899/mo | BDT 719/mo yearly)'));
      assert.ok(directive.includes('Visual Workflow Studio with node graph canvas & curved cables'));
      assert.ok(directive.includes('Multi-Key Vault with round-robin rotation & auto-failover'));

      // All-Inclusive Cloud Managed specifications
      assert.ok(directive.includes('All-Inclusive Cloud Managed Plan (BDT 1,499/mo | BDT 1,199/mo yearly)'));
      assert.ok(directive.includes('100% plug & play zero-setup cloud, NO API keys required'));
      assert.ok(directive.includes('5,000 fast-lane requests/month'));
    });

    it('4.5 Partial unlocks output detailed unlocked and locked item lists', () => {
      const customConfig = {
        plans: {
          byok_starter: {
            ...DEFAULT_PLANS.byok_starter,
            featureToggles: {
              ...DEFAULT_PLANS.byok_starter.featureToggles,
              allHelpersEnabled: false,
              enabledHelpers: ['fb_insta_ads']
            }
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      assert.ok(directive.includes('Access is granted to 1 of 80 AI Helpers.'));
      assert.ok(directive.includes('Unlocked (1): [#01 Facebook & Instagram Ads Generator]'));
      assert.ok(directive.includes('Locked (79): ['));
    });

    it('4.6 Zero unlocked helpers outputs [None] for unlocked and lists all locked helpers', () => {
      const customConfig = {
        plans: {
          byok_starter: {
            ...DEFAULT_PLANS.byok_starter,
            featureToggles: {
              ...DEFAULT_PLANS.byok_starter.featureToggles,
              allHelpersEnabled: false,
              enabledHelpers: []
            }
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      assert.ok(directive.includes('Access is granted to 0 of 80 AI Helpers.'));
      assert.ok(directive.includes('Unlocked (0): [None]'));
      assert.ok(directive.includes('Locked (80): ['));
    });

    it('4.7 Zero unlocked tools outputs [None] for unlocked and lists all locked tools', () => {
      const customConfig = {
        plans: {
          byok_starter: {
            ...DEFAULT_PLANS.byok_starter,
            featureToggles: {
              ...DEFAULT_PLANS.byok_starter.featureToggles,
              allToolsEnabled: false,
              enabledTools: []
            }
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      assert.ok(directive.includes(`Access is granted to 0 of ${caps.totalToolsCount} tool connectors.`));
      assert.ok(directive.includes('Unlocked (0): [None]'));
      assert.ok(directive.includes(`Locked (${caps.totalToolsCount}): [`));
    });

    it('4.8 Partial unlocked tools outputs exact unlocked tool names and locked list', () => {
      const customConfig = {
        plans: {
          byok_pro: {
            ...DEFAULT_PLANS.byok_pro,
            featureToggles: {
              ...DEFAULT_PLANS.byok_pro.featureToggles,
              allToolsEnabled: false,
              enabledTools: ['google_sheets', 'bkash_merchant']
            }
          }
        }
      };

      const caps = extractPlanCapabilities(customConfig, 'byok_pro');
      const directive = buildPlanCapabilityDirective(caps);

      assert.ok(directive.includes(`Access is granted to 2 of ${caps.totalToolsCount} tool connectors.`));
      assert.ok(directive.includes('Google Sheets'));
      assert.ok(directive.includes('bKash Merchant API'));
      assert.ok(directive.includes(`Locked (${caps.totalToolsCount - 2}): [`));
    });
  });

  // =========================================================================
  // 5. System Prompt Integration Across Modes & Language Mirroring
  // =========================================================================
  describe('5. System Prompt Integration Across Modes & Language Mirroring', () => {
    const mockHelper = {
      id: 'fb_insta_ads',
      code: '#01',
      name: 'Facebook & Instagram Ad Copy Specialist',
      category: 'marketing',
      categoryName: 'Ads & Marketing',
      badge: 'Popular',
      shortDesc: 'Generates ad copy',
      description: 'Ad specialist',
      agentRole: 'Ad Copy Strategist',
      systemPrompt: 'You are Facebook Ad Copy Specialist #01.'
    };

    const mockHelper2 = {
      id: 'seo_blog_article_writer',
      code: '#43',
      name: 'SEO Blog Article & Long-Form Writer',
      category: 'seo',
      categoryName: 'SEO & Website Traffic',
      badge: 'SEO',
      shortDesc: 'Generates SEO blogs',
      description: 'SEO writer',
      agentRole: 'SEO Copywriter',
      systemPrompt: 'You are SEO Blog Specialist #43.'
    };

    it('5.1 Mode 1: Autonomous CEO mode injects plan capability directive seamlessly', () => {
      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_starter',
        userMessage: 'Help me plan marketing for next month'
      });

      assert.ok(prompt.includes('AUTONOMOUS EXECUTION DIRECTIVE:'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
      assert.ok(prompt.includes('USER ACTIVE PLAN: Starter Plan (Tier: BYOK_STARTER)'));
      assert.ok(prompt.includes('🚨 FINAL LANGUAGE MIRRORING OVERRIDE (CRITICAL PRIORITY):'));
    });

    it('5.2 Mode 2: Explicit Helper Delegation mode injects plan capability directive', () => {
      const prompt = buildCeoOrHelperSystemPrompt(mockHelper, {
        planTier: 'byok_pro',
        userMessage: 'Write Facebook ad copy for sunglasses'
      });

      assert.ok(prompt.includes('EXPLICIT HELPER DELEGATION ACTIVE:'));
      assert.ok(prompt.includes('⚡ **AI CEO → Delegated to [#01] Facebook & Instagram Ad Copy Specialist**'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
      assert.ok(prompt.includes('USER ACTIVE PLAN: Pro Plan (Tier: BYOK_PRO)'));
    });

    it('5.3 Mode 3: Helper Studio mode (mode: "helper") injects plan capability directive', () => {
      const prompt = buildCeoOrHelperSystemPrompt(mockHelper, {
        mode: 'helper',
        planTier: 'managed',
        userMessage: 'Generate ad copy'
      });

      assert.ok(prompt.includes('You are [#01] Facebook & Instagram Ad Copy Specialist (Popular)'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
      assert.ok(
        prompt.includes('USER ACTIVE PLAN: All-Inclusive Cloud') ||
        prompt.includes('USER ACTIVE PLAN: Cloud Managed Plan')
      );
    });

    it('5.4 Mode 4: Sequential Multi-Agent pipeline mode injects plan capability directive', () => {
      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_pro',
        multiHelpers: [mockHelper, mockHelper2],
        userMessage: 'Create an ad and an SEO blog'
      });

      assert.ok(prompt.includes('⚡ **MULTI-AGENT SEQUENTIAL PIPELINE ACTIVE**'));
      assert.ok(prompt.includes('Stage 1: [#01] Facebook & Instagram Ad Copy Specialist (Ad Copy Strategist)'));
      assert.ok(prompt.includes('Stage 2: [#43] SEO Blog Article & Long-Form Writer (SEO Copywriter)'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
      assert.ok(prompt.includes('USER ACTIVE PLAN: Pro Plan (Tier: BYOK_PRO)'));
    });

    it('5.5 Backward Compatibility: Omitting options or planCapabilities gracefully defaults to Starter capabilities', () => {
      // No options provided at all
      const defaultPrompt = buildCeoOrHelperSystemPrompt(null);
      assert.ok(defaultPrompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
      assert.ok(defaultPrompt.includes('USER ACTIVE PLAN: Starter Plan (Tier: BYOK_STARTER)'));

      // Empty options object
      const emptyOptPrompt = buildCeoOrHelperSystemPrompt(null, {});
      assert.ok(emptyOptPrompt.includes('USER ACTIVE PLAN: Starter Plan (Tier: BYOK_STARTER)'));

      // Explicit planTier without planCapabilities
      const tierOnlyPrompt = buildCeoOrHelperSystemPrompt(null, { planTier: 'managed' });
      assert.ok(
        tierOnlyPrompt.includes('USER ACTIVE PLAN: All-Inclusive Cloud') ||
        tierOnlyPrompt.includes('USER ACTIVE PLAN: Cloud Managed Plan')
      );

      // Pre-computed planCapabilities forwarded directly
      const customCaps = extractPlanCapabilities(null, 'byok_pro');
      const precomputedPrompt = buildCeoOrHelperSystemPrompt(null, { planCapabilities: customCaps });
      assert.ok(precomputedPrompt.includes('USER ACTIVE PLAN: Pro Plan (Tier: BYOK_PRO)'));
    });

    it('5.6 Language Detection & Mirroring: Bengali query activates Bengali mirroring and plan directive', () => {
      const bengaliQuery = 'আমার প্ল্যানে কি কি টুল আছে?';
      assert.strictEqual(detectUserLanguage(bengaliQuery), 'bengali');

      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_starter',
        userMessage: bengaliQuery
      });

      assert.ok(prompt.includes('The user is speaking to you in BENGALI (বাংলায়).'));
      assert.ok(prompt.includes('You MUST reply 100% in natural, fluent, professional BENGALI (সম্পূর্ণ বাংলায় উত্তর দিন).'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
    });

    it('5.7 Language Detection & Mirroring: Banglish query activates Banglish mirroring and plan directive', () => {
      const banglishQuery = 'amr plan e ki ki agent ache?';
      assert.strictEqual(detectUserLanguage(banglishQuery), 'banglish');

      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_pro',
        userMessage: banglishQuery
      });

      assert.ok(prompt.includes('The user is speaking to you in BANGLISH'));
      assert.ok(prompt.includes('You MUST mirror the user\'s language by responding in natural, conversational Banglish or friendly Bengali.'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
    });

    it('5.8 Language Detection & Mirroring: English query activates English mirroring and plan directive', () => {
      const englishQuery = 'which tools are in my plan?';
      assert.strictEqual(detectUserLanguage(englishQuery), 'english');

      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'managed',
        userMessage: englishQuery
      });

      assert.ok(prompt.includes('You MUST reply in the EXACT SAME LANGUAGE and tone used by the user. If the user writes in English, reply in crisp English.'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
    });

    it('5.9 Pipeline Threshold: Single item in multiHelpers does not trigger multi-agent sequential pipeline', () => {
      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_starter',
        multiHelpers: [mockHelper],
        userMessage: 'Test single helper in array'
      });

      assert.ok(!prompt.includes('⚡ **MULTI-AGENT SEQUENTIAL PIPELINE ACTIVE**'), 'Single helper array must not trigger pipeline header');
      assert.ok(prompt.includes('AUTONOMOUS EXECUTION DIRECTIVE:'), 'Should fall back to autonomous CEO');
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
    });

    it('5.10 Code-Switching: Bengali-Banglish conversational code-switching triggers Banglish mirroring', () => {
      const mixedQuery = 'apnar plan e ki ki tool ache bhai? ekta list dao';
      assert.strictEqual(detectUserLanguage(mixedQuery), 'banglish');

      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_starter',
        userMessage: mixedQuery
      });

      assert.ok(prompt.includes('The user is speaking to you in BANGLISH'));
      assert.ok(prompt.includes('⚡ PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
    });
  });

  // =========================================================================
  // 6. Starter Intent Guard & Gating Accuracy
  // =========================================================================
  describe('6. Starter Intent Guard & Gating Accuracy', () => {
    it('6.1 isRestrictedStarterIntent detects restricted workflow customization & custom agent requests across languages', () => {
      const restrictedInputs = [
        // English
        'customize workflow',
        'customize this workflow',
        'workflow customization',
        'edit workflow',
        'modify workflow',
        'edit nodes',
        'connect nodes',
        'node graph',
        'build me a custom agent',
        'create a custom agent',
        'custom agent from scratch',
        'multi-key failover',
        'multi-key rotation',
        // Bengali
        'ওয়ার্কফ্লো কাস্টমাইজ',
        'ওয়ার্কফ্লো কাস্টমাইজ',
        'ওয়ার্কফ্লো এডিট',
        'নোড এডিট',
        'কাস্টম এজেন্ট',
        'নতুন এজেন্ট তৈরি',
        'মাল্টি-কি',
        // Banglish
        'workflow customize koro',
        'custom agent banano',
        'custom agent banate',
        'node edit koro'
      ];

      for (const input of restrictedInputs) {
        assert.strictEqual(
          isRestrictedStarterIntent(input),
          true,
          `Expected isRestrictedStarterIntent to return true for: "${input}"`
        );
      }
    });

    it('6.2 isRestrictedStarterIntent does NOT falsely flag standard user business or marketing commands', () => {
      const allowedInputs = [
        'write a facebook ad for my clothing brand',
        'help me plan marketing campaign',
        'seo blog for tech startup',
        'how to increase conversions',
        'create email newsletter for discount sale',
        'generate an image of a luxury watch',
        'আমার বিজনেসের জন্য একটি সুন্দর ফেসবুক বিজ্ঞাপন লিখো',
        'amr business er jonno ekta ad copy likhe dao',
        'amr plan e ki ki agent ache?',
        'which tools are in my plan?'
      ];

      for (const input of allowedInputs) {
        assert.strictEqual(
          isRestrictedStarterIntent(input),
          false,
          `Expected isRestrictedStarterIntent to return false for standard command: "${input}"`
        );
      }
    });

    it('6.3 getStarterGuardResponse returns polite bilingual guidance with link to upgrade', () => {
      const response = getStarterGuardResponse();
      assert.ok(response.includes('Starter Plan'), 'Response must mention Starter Plan');
      assert.ok(response.includes('Pro Plan'), 'Response must explain Pro Plan requirement');
      assert.ok(response.includes('[Upgrade to Pro Plan](/plans)'), 'Response must link to /plans');
      assert.ok(response.includes('Visual Workflow Studio'), 'Response must mention Visual Workflow Studio');
    });
  });

  // =========================================================================
  // 7. Platform Invariants & Checksum Preservation
  // =========================================================================
  describe('7. Platform Invariants & Checksum Preservation', () => {
    it('7.1 robots.css byte-for-byte SHA256 checksum strictly matches 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      assert.ok(fs.existsSync(PATHS.robotsCss), 'robots.css must exist');
      const fileBuffer = fs.readFileSync(PATHS.robotsCss);
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const EXPECTED_HASH = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

      assert.strictEqual(sha256, EXPECTED_HASH, `robots.css SHA256 checksum must match ${EXPECTED_HASH} byte-for-byte`);
      assert.strictEqual(fileBuffer.length, 5427, 'robots.css must remain exactly 5,427 bytes');
    });

    it('7.2 tests/run_all_tests.mjs strictly maintains 7 test tiers (NO id: 8)', () => {
      const content = fs.readFileSync(PATHS.runAllTests, 'utf-8');
      assert.ok(content.includes('id: 7'), 'Must include Tier 7');
      assert.ok(!content.includes('id: 8'), 'Must NEVER include Tier 8');
      assert.ok(!content.includes('Tier 8'), 'Must NEVER mention Tier 8');

      const tierMatches = content.match(/id:\s*([1-9][0-9]*)/g);
      assert.ok(tierMatches && tierMatches.length === 7, `Expected exactly 7 tier definitions, got ${tierMatches ? tierMatches.length : 0}`);
    });
  });
});
