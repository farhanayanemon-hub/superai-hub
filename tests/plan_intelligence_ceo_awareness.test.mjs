/**
 * Comprehensive Automated Test Suite: Ezbo Real-Time Plan Intelligence & CEO System Prompt Architecture
 * Verifies R2 from ORIGINAL_REQUEST.md:
 * - Dynamic PLAN CAPABILITY & AWARENESS DIRECTIVE in CEO and Helper prompts
 * - extractPlanCapabilities and PlanCapabilityContext contracts
 * - Multilingual inquiry guidance, locked tool/helper execution defense, and 3-tier comparative knowledge
 * - Client-server isolation ($lib/server safety) and robots.css checksum invariant
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
  chatServerTs: path.join(WEB_DIR, 'src', 'routes', 'api', 'chat', '+server.ts'),
  ceoRouterTs: path.join(WEB_DIR, 'src', 'lib', 'services', 'ceoRouter.ts'),
  plansTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts'),
  toolsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'),
  toolConnectorsTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'toolConnectors.ts'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css')
};

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Ezbo Real-Time Plan Intelligence & CEO System Prompt Architecture', () => {
  // =========================================================================
  // 1. Static Contract & Client-Server Isolation Verification
  // =========================================================================
  describe('1. Static Contract & Client-Server Isolation', () => {
    it('1.1 ceoRouter.ts must NEVER import from $lib/server (preserves universal client-server boundary)', () => {
      const code = readSafe(PATHS.ceoRouterTs);
      assert.ok(!code.includes("from '$lib/server"), 'ceoRouter.ts must not import from $lib/server');
      assert.ok(!code.includes('from "$lib/server'), 'ceoRouter.ts must not import from $lib/server');
    });

    it('1.2 ceoRouter.ts must export PlanCapabilityContext, extractPlanCapabilities, and buildPlanCapabilityDirective', () => {
      const code = readSafe(PATHS.ceoRouterTs);
      assert.ok(code.includes('export interface PlanCapabilityContext'), 'Must export PlanCapabilityContext');
      assert.ok(code.includes('export function extractPlanCapabilities('), 'Must export extractPlanCapabilities');
      assert.ok(code.includes('export function buildPlanCapabilityDirective('), 'Must export buildPlanCapabilityDirective');
      assert.ok(code.includes('export function buildCeoOrHelperSystemPrompt('), 'Must export buildCeoOrHelperSystemPrompt');
    });

    it('1.3 chat/+server.ts imports extractPlanCapabilities and passes planCapabilities to buildCeoOrHelperSystemPrompt', () => {
      const code = readSafe(PATHS.chatServerTs);
      assert.ok(code.includes('extractPlanCapabilities'), 'chat/+server.ts must import extractPlanCapabilities');
      assert.ok(code.includes('extractPlanCapabilities(adminConfig,'), 'chat/+server.ts must call extractPlanCapabilities with adminConfig');
      assert.ok(code.includes('planCapabilities,'), 'chat/+server.ts must pass planCapabilities into prompt builder');
      assert.ok(code.includes('userMessage: message'), 'chat/+server.ts must pass userMessage');
    });

    it('1.4 chat/+server.ts accurately resolves effective plan tier without collapsing managed users', () => {
      const code = readSafe(PATHS.chatServerTs);
      assert.ok(code.includes("effectivePlanTier === 'managed'"), 'Must recognize managed plan');
      assert.ok(code.includes('planCapabilities.tierId'), 'Must resolve effective tier from planCapabilities');
    });
  });

  // =========================================================================
  // 2. Functional Verification: extractPlanCapabilities
  // =========================================================================
  describe('2. Functional Verification: extractPlanCapabilities', async () => {
    const ceoRouterMod = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    const { extractPlanCapabilities } = ceoRouterMod;

    it('2.1 Default Starter Plan extracts all 80 helpers and 100+ connectors with run-only restrictions', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');
      assert.strictEqual(caps.tierId, 'byok_starter');
      assert.strictEqual(caps.planName, 'Starter Plan');
      assert.strictEqual(caps.isFree, false);
      assert.strictEqual(caps.totalHelpersCount, 80);
      assert.strictEqual(caps.unlockedHelpersCount, 80);
      assert.strictEqual(caps.allHelpersUnlocked, true);
      assert.strictEqual(caps.lockedHelpers.length, 0);
      assert.ok(caps.totalToolsCount >= 100, `Expected >= 100 tools, got ${caps.totalToolsCount}`);
      assert.strictEqual(caps.allToolsUnlocked, true);
      assert.strictEqual(caps.features.workflowCustomization, false);
      assert.strictEqual(caps.features.multiKeyVault, false);
      assert.strictEqual(caps.features.zeroKeyManagedCloud, false);
      assert.strictEqual(caps.pricing.monthlyPrice, 499);
      assert.strictEqual(caps.pricing.yearlyMonthlyPrice, 399);
    });

    it('2.2 Pro Plan grants workflowCustomization and multiKeyVault', () => {
      const caps = extractPlanCapabilities(null, 'byok_pro');
      assert.strictEqual(caps.tierId, 'byok_pro');
      assert.strictEqual(caps.planName, 'Pro Plan');
      assert.strictEqual(caps.features.workflowCustomization, true);
      assert.strictEqual(caps.features.multiKeyVault, true);
      assert.strictEqual(caps.features.multiModelFailover, true);
      assert.strictEqual(caps.features.zeroKeyManagedCloud, false);
      assert.strictEqual(caps.pricing.monthlyPrice, 899);
      assert.strictEqual(caps.pricing.yearlyMonthlyPrice, 719);
    });

    it('2.3 Legacy Pro aliases (pro, ultra) map to byok_pro', () => {
      const proCaps = extractPlanCapabilities(null, 'pro');
      assert.strictEqual(proCaps.tierId, 'byok_pro');
      const ultraCaps = extractPlanCapabilities(null, 'ultra');
      assert.strictEqual(ultraCaps.tierId, 'byok_pro');
    });

    it('2.4 Cloud Managed Plan grants zeroKeyManagedCloud and preserves managed tierId', () => {
      const caps = extractPlanCapabilities(null, 'managed');
      assert.strictEqual(caps.tierId, 'managed');
      assert.strictEqual(caps.planName, 'All-Inclusive Cloud');
      assert.strictEqual(caps.features.zeroKeyManagedCloud, true);
      assert.strictEqual(caps.features.workflowCustomization, true);
      assert.strictEqual(caps.pricing.monthlyPrice, 1499);
      assert.strictEqual(caps.pricing.yearlyMonthlyPrice, 1199);

      // Alias 'complete' maps to managed
      const completeCaps = extractPlanCapabilities(null, 'complete');
      assert.strictEqual(completeCaps.tierId, 'managed');
    });

    it('2.5 Free tier marks isFree=true with locked helpers and tools', () => {
      const caps = extractPlanCapabilities(null, 'free');
      assert.strictEqual(caps.tierId, 'free');
      assert.strictEqual(caps.isFree, true);
      assert.strictEqual(caps.unlockedHelpersCount, 0);
      assert.strictEqual(caps.lockedHelpers.length, 80);
      assert.strictEqual(caps.allHelpersUnlocked, false);
      assert.strictEqual(caps.features.workflowCustomization, false);
      assert.strictEqual(caps.features.multiKeyVault, false);
    });

    it('2.6 Respects custom adminConfig plan toggles with custom helper subset', () => {
      const mockAdminConfig = {
        plans: {
          byok_starter: {
            id: 'byok_starter',
            name: 'Custom Starter',
            badge: 'Custom Badge',
            monthlyPrice: 550,
            yearlyMonthlyPrice: 450,
            featureToggles: {
              allHelpersEnabled: false,
              enabledHelpers: ['fb_insta_ads', 'landing_page_copywriter'],
              allToolsEnabled: true,
              enabledTools: []
            }
          }
        }
      };

      const caps = extractPlanCapabilities(mockAdminConfig, 'byok_starter');
      assert.strictEqual(caps.planName, 'Custom Starter');
      assert.strictEqual(caps.allHelpersUnlocked, false);
      assert.strictEqual(caps.unlockedHelpersCount, 2);
      assert.strictEqual(caps.lockedHelpers.length, 78);
      assert.ok(caps.unlockedHelpers.some(h => h.id === 'fb_insta_ads'));
      assert.ok(caps.unlockedHelpers.some(h => h.id === 'landing_page_copywriter'));
      assert.strictEqual(caps.pricing.monthlyPrice, 550);
    });

    it('2.7 Respects custom adminConfig plan toggles with custom tool connectors subset', () => {
      const mockAdminConfig = {
        plans: {
          byok_starter: {
            id: 'byok_starter',
            name: 'Starter Plan',
            badge: 'Starter',
            monthlyPrice: 499,
            yearlyMonthlyPrice: 399,
            featureToggles: {
              allHelpersEnabled: true,
              enabledHelpers: [],
              allToolsEnabled: false,
              enabledTools: ['whatsapp_cloud', 'telegram_bot', 'slack_webhooks']
            }
          }
        }
      };

      const caps = extractPlanCapabilities(mockAdminConfig, 'byok_starter');
      assert.strictEqual(caps.allToolsUnlocked, false);
      assert.strictEqual(caps.unlockedToolsCount, 3);
      assert.ok(caps.unlockedTools.some(t => t.id === 'whatsapp_cloud'));
      assert.ok(caps.unlockedTools.some(t => t.id === 'telegram_bot'));
      assert.ok(caps.unlockedTools.some(t => t.id === 'slack_webhooks'));
    });
  });

  // =========================================================================
  // 3. Functional Verification: buildPlanCapabilityDirective & System Prompt
  // =========================================================================
  describe('3. Functional Verification: buildPlanCapabilityDirective & Prompt Injections', async () => {
    const ceoRouterMod = await import(pathToFileURL(PATHS.ceoRouterTs).href);
    const {
      extractPlanCapabilities,
      buildPlanCapabilityDirective,
      buildCeoOrHelperSystemPrompt
    } = ceoRouterMod;

    it('3.1 buildPlanCapabilityDirective injects all mandatory awareness sections', () => {
      const caps = extractPlanCapabilities(null, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      assert.ok(directive.includes('PLAN CAPABILITY & AWARENESS DIRECTIVE (REAL-TIME SUBSCRIPTION INTELLIGENCE)'));
      assert.ok(directive.includes('USER ACTIVE PLAN: Starter Plan (Tier: BYOK_STARTER)'));
      assert.ok(directive.includes('BDT 499/mo (BDT 399/mo yearly)'));
      assert.ok(directive.includes('All 80 AI Helpers'));
      assert.ok(directive.includes('100+ Enterprise Tool Connectors'));
      assert.ok(directive.includes('PLAN TOOL & AGENT INQUIRIES'));
      assert.ok(directive.includes('LOCKED HELPER OR TOOL COMMANDS'));
      assert.ok(directive.includes('Do NOT fake or pretend to execute it'));
      assert.ok(directive.includes('PLAN DIFFERENCES & COMPARISON KNOWLEDGE'));
      assert.ok(directive.includes('Starter Plan (BDT 499/mo | BDT 399/mo yearly)'));
      assert.ok(directive.includes('Pro Plan (BDT 899/mo | BDT 719/mo yearly)'));
      assert.ok(directive.includes('All-Inclusive Cloud Managed Plan (BDT 1,499/mo | BDT 1,199/mo yearly)'));
    });

    it('3.2 buildPlanCapabilityDirective lists explicit locked and unlocked assets when subset is active', () => {
      const mockAdminConfig = {
        plans: {
          byok_starter: {
            id: 'byok_starter',
            name: 'Lite Plan',
            badge: 'Lite Access',
            monthlyPrice: 299,
            yearlyMonthlyPrice: 249,
            featureToggles: {
              allHelpersEnabled: false,
              enabledHelpers: ['fb_insta_ads', 'google_search_display_ads'],
              allToolsEnabled: false,
              enabledTools: ['whatsapp_cloud', 'telegram_bot']
            }
          }
        }
      };

      const caps = extractPlanCapabilities(mockAdminConfig, 'byok_starter');
      const directive = buildPlanCapabilityDirective(caps);

      assert.ok(directive.includes('Access is granted to 2 of 80 AI Helpers'));
      assert.ok(directive.includes('Unlocked (2): [#01 Facebook & Instagram Ads Generator, #02 Google Search & Display Ads Generator]'));
      assert.ok(directive.includes('Locked (78):'));
      assert.ok(directive.includes('Access is granted to 2 of'));
      assert.ok(directive.includes('Unlocked (2): [WhatsApp Business Cloud, Telegram Bot API]'));
    });

    it('3.3 Autonomous CEO mode injects PLAN CAPABILITY & AWARENESS DIRECTIVE', () => {
      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'byok_starter',
        userMessage: 'আমার বিজনেসের জন্য মার্কেটিং প্ল্যান বানাও'
      });

      assert.ok(prompt.includes('PLAN CAPABILITY & AWARENESS DIRECTIVE'));
      assert.ok(prompt.includes('USER ACTIVE PLAN: Starter Plan'));
      assert.ok(prompt.includes('AUTONOMOUS EXECUTION DIRECTIVE:'));
      assert.ok(prompt.includes('MANDATORY LANGUAGE MIRRORING PROTOCOL:'));
    });

    it('3.4 Explicit Helper Delegation mode injects PLAN CAPABILITY & AWARENESS DIRECTIVE', () => {
      const mockHelper = {
        id: 'fb_insta_ads',
        code: '#01',
        name: 'Facebook & Instagram Ads Copywriter',
        badge: 'High ROAS',
        systemPrompt: 'Generate high-converting Facebook ads.',
        shortDesc: 'Ad copy specialist'
      };

      const prompt = buildCeoOrHelperSystemPrompt(mockHelper, {
        planTier: 'byok_pro',
        userMessage: 'Write 3 ad variations for Eid campaign'
      });

      assert.ok(prompt.includes('PLAN CAPABILITY & AWARENESS DIRECTIVE'));
      assert.ok(prompt.includes('USER ACTIVE PLAN: Pro Plan (Tier: BYOK_PRO)'));
      assert.ok(prompt.includes('⚡ **AI CEO → Delegated to [#01] Facebook & Instagram Ads Copywriter**'));
    });

    it('3.5 Multi-Agent Sequential Pipeline mode injects PLAN CAPABILITY & AWARENESS DIRECTIVE', () => {
      const multiHelpers = [
        {
          id: 'marketing_campaign_planner',
          code: '#08',
          name: 'Marketing Campaign Planner',
          agentRole: 'Chief Strategist',
          systemPrompt: 'Strategy instructions'
        },
        {
          id: 'fb_insta_ads',
          code: '#01',
          name: 'Facebook Ads Copywriter',
          agentRole: 'Ad Specialist',
          systemPrompt: 'Copy instructions'
        }
      ];

      const prompt = buildCeoOrHelperSystemPrompt(null, {
        planTier: 'managed',
        multiHelpers,
        userMessage: 'Full launch campaign for new clothing brand'
      });

      assert.ok(prompt.includes('PLAN CAPABILITY & AWARENESS DIRECTIVE'));
      assert.ok(prompt.includes('USER ACTIVE PLAN: All-Inclusive Cloud (Tier: MANAGED)'));
      assert.ok(prompt.includes('MULTI-AGENT SEQUENTIAL PIPELINE ACTIVE'));
    });

    it('3.6 Helper Studio mode injects PLAN CAPABILITY & AWARENESS DIRECTIVE', () => {
      const mockHelper = {
        id: 'ai_text_humanizer',
        code: '#29',
        name: 'AI Text Humanizer & Undetectable Polisher',
        badge: 'Bypass AI',
        systemPrompt: 'Humanize text without detection.',
        shortDesc: 'Undetectable writing'
      };

      const prompt = buildCeoOrHelperSystemPrompt(mockHelper, {
        mode: 'helper',
        planTier: 'byok_starter',
        userMessage: 'Humanize this paragraph'
      });

      assert.ok(prompt.includes('PLAN CAPABILITY & AWARENESS DIRECTIVE'));
      assert.ok(prompt.includes('USER ACTIVE PLAN: Starter Plan'));
      assert.ok(prompt.includes('You are [#29] AI Text Humanizer'));
    });

    it('3.7 Backward Compatibility: callers omitting planCapabilities default smoothly without throwing', () => {
      // Calling with no options
      const defaultPrompt = buildCeoOrHelperSystemPrompt(null);
      assert.ok(defaultPrompt.includes('PLAN CAPABILITY & AWARENESS DIRECTIVE'));
      assert.ok(defaultPrompt.includes('USER ACTIVE PLAN: Starter Plan'));

      // Calling with only legacy string tier
      const proPrompt = buildCeoOrHelperSystemPrompt(null, { planTier: 'byok_pro' });
      assert.ok(proPrompt.includes('USER ACTIVE PLAN: Pro Plan'));

      const managedPrompt = buildCeoOrHelperSystemPrompt(null, { planTier: 'managed' });
      assert.ok(managedPrompt.includes('USER ACTIVE PLAN: All-Inclusive Cloud'));
    });
  });

  // =========================================================================
  // 4. Critical Platform Invariant: robots.css SHA256 Checksum
  // =========================================================================
  describe('4. Critical Platform Invariant', () => {
    it('4.1 web/src/lib/components/robots/robots.css byte-for-byte SHA256 matches 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      const fileBytes = fs.readFileSync(PATHS.robotsCss);
      const hash = crypto.createHash('sha256').update(fileBytes).digest('hex');
      assert.strictEqual(
        hash,
        '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be',
        'robots.css checksum must never be modified'
      );
    });
  });
});
