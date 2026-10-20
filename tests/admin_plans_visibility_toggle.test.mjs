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

describe('Admin Plans Visibility, On/Off Toggles & Deletion Control Suite', () => {
  const plansTsPath = path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts');
  const adminSettingsPath = path.join(WEB_DIR, 'src', 'lib', 'server', 'adminSettings.ts');
  const plansApiPath = path.join(WEB_DIR, 'src', 'routes', 'api', 'plans', '+server.ts');
  const plansStorePath = path.join(WEB_DIR, 'src', 'lib', 'stores', 'plansStore.ts');
  const pricingCardsGridPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'PricingCardsGrid.svelte');
  const adminPagePath = path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte');
  const robotsCssPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css');

  describe('1. Plan Config & Defaults (plans.ts)', () => {
    it('1.1 PlanConfig interface must declare optional isEnabled?: boolean', () => {
      const content = readSafe(plansTsPath);
      assert.ok(content.includes('isEnabled?: boolean;'), 'PlanConfig must have isEnabled?: boolean');
    });

    it('1.2 DEFAULT_PLANS sets isEnabled: true for Starter & Pro, and false for Managed by default', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(plansTsPath).href);
      assert.strictEqual(DEFAULT_PLANS.byok_starter.isEnabled, true, 'Starter must default to isEnabled: true');
      assert.strictEqual(DEFAULT_PLANS.byok_pro.isEnabled, true, 'Pro must default to isEnabled: true');
      assert.strictEqual(DEFAULT_PLANS.managed.isEnabled, false, 'Managed must default to isEnabled: false');
    });
  });

  describe('2. Backend Admin Settings Persistence (adminSettings.ts)', () => {
    it('2.1 loadConfigFromStorage and updateAdminConfig preserve isEnabled flag per plan', () => {
      const content = readSafe(adminSettingsPath);
      assert.ok(content.includes('isEnabled: savedStarter.isEnabled !== undefined'), 'Must preserve starter isEnabled on load');
      assert.ok(content.includes('isEnabled: savedPro.isEnabled !== undefined'), 'Must preserve pro isEnabled on load');
      assert.ok(content.includes('isEnabled: savedManaged.isEnabled !== undefined'), 'Must preserve managed isEnabled on load');
      assert.ok(content.includes('starterPatch.isEnabled !== undefined'), 'Must support starter isEnabled in updateAdminConfig');
      assert.ok(content.includes('proPatch.isEnabled !== undefined'), 'Must support pro isEnabled in updateAdminConfig');
      assert.ok(content.includes('managedPatch.isEnabled !== undefined'), 'Must support managed isEnabled in updateAdminConfig');
    });

    it('2.2 updateAdminConfig contract verifies plan visibility preservation in memory and storage', () => {
      const content = readSafe(adminSettingsPath);
      // Ensure updateAdminConfig checks each tier patch isEnabled
      assert.ok(content.includes('starterPatch.isEnabled !== undefined'), 'Must handle starterPatch.isEnabled');
      assert.ok(content.includes('proPatch.isEnabled !== undefined'), 'Must handle proPatch.isEnabled');
      assert.ok(content.includes('managedPatch.isEnabled !== undefined'), 'Must handle managedPatch.isEnabled');
      // Ensure getMaskedAdminConfig includes plans
      assert.ok(content.includes('plans: config.plans || DEFAULT_PLANS'), 'getMaskedAdminConfig must export plans');
    });
  });

  describe('3. Public API Endpoint & Store Normalization', () => {
    it('3.1 api/plans/+server.ts returns plans with isEnabled flags', () => {
      const content = readSafe(plansApiPath);
      assert.ok(content.includes('const plans = config.plans || DEFAULT_PLANS;'), 'Must return plans from config or DEFAULT_PLANS');
      assert.ok(content.includes('plans,'), 'Must return plans in response JSON');
    });

    it('3.2 plansStore.ts normalizePlans contract preserves isEnabled for all tiers', () => {
      const content = readSafe(plansStorePath);
      assert.ok(content.includes('isEnabled: starterSource.isEnabled !== undefined ? starterSource.isEnabled'), 'Must preserve starter isEnabled');
      assert.ok(content.includes('isEnabled: proSource.isEnabled !== undefined ? proSource.isEnabled'), 'Must preserve pro isEnabled');
      assert.ok(content.includes('isEnabled: managedSource.isEnabled !== undefined ? managedSource.isEnabled'), 'Must preserve managed isEnabled');
    });
    it('3.3 plansStore provides real-time storage event and custom event cross-tab synchronization', () => {
      const content = readSafe(plansStorePath);
      assert.ok(content.includes('event.key === STORAGE_KEY'), 'Must listen for STORAGE_KEY on storage event');
      assert.ok(content.includes('ezbo:plans-settings-updated'), 'Must listen for ezbo:plans-settings-updated custom event');
    });

    it('3.4 loadPublicPlans updates plansStore on throttled cache hit and supports cache-busting on force', () => {
      const content = readSafe(plansStorePath);
      assert.ok(content.includes('plansStore.set(cached)'), 'Throttled loadPublicPlans must update plansStore');
      assert.ok(content.includes('/api/plans?_t='), 'Force reload must include cache-busting query parameter');
    });
  });

  describe('4. Dynamic Pricing Cards Grid (PricingCardsGrid.svelte)', () => {
    it('4.1 Declares planOrder = ["byok_starter", "byok_pro"] for test backwards compliance', () => {
      const content = readSafe(pricingCardsGridPath);
      const match = content.match(/planOrder\s*:\s*PlanTierId\[\]\s*=\s*\[([^\]]+)\]/);
      assert.ok(match, 'Must declare planOrder for backward compliance');
      const items = match[1].split(',').map((s) => s.trim().replace(/['"]/g, ''));
      assert.deepStrictEqual(items, ['byok_starter', 'byok_pro'], 'planOrder must have byok_starter and byok_pro');
    });

    it('4.2 Derives activePlans dynamically from plansStore based on isEnabled !== false', () => {
      const content = readSafe(pricingCardsGridPath);
      assert.ok(content.includes('activePlans = $derived'), 'Must declare activePlans derived rune');
      assert.ok(content.includes('plan.isEnabled !== false'), 'Must filter on plan.isEnabled !== false');
      assert.ok(content.includes('allPlatformTiers'), 'Must check all platform tiers (byok_starter, byok_pro, managed)');
    });

    it('4.3 Responsively adapts grid layout for 1, 2, or 3 plans', () => {
      const content = readSafe(pricingCardsGridPath);
      assert.ok(content.includes('grid-cols-1 max-w-md'), 'Must provide 1-card centered layout');
      assert.ok(content.includes('grid-cols-1 md:grid-cols-2 max-w-4xl'), 'Must provide 2-column layout');
      assert.ok(content.includes('grid-cols-1 md:grid-cols-3 max-w-6xl'), 'Must provide 3-column layout');
      assert.ok(content.includes('#each activePlans as planId (planId)'), 'Must iterate over activePlans');
    });
  });

  describe('5. Admin Panel Plans & Visibility Controls (admin/+page.svelte)', () => {
    it('5.1 Renders 3-plan switcher tabs with live status indicators', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes("onclick={() => activePlanTab = 'byok_starter'}"), 'Must have Starter tab button');
      assert.ok(content.includes("onclick={() => activePlanTab = 'byok_pro'}"), 'Must have Pro tab button');
      assert.ok(content.includes("onclick={() => activePlanTab = 'managed'}"), 'Must have Cloud Managed tab button');
    });

    it('5.2 Renders Plan Status & Visibility control card with Live beacon and Visible to Public Users switch', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes('Plan Status:'), 'Must render Plan Status heading');
      assert.ok(content.includes('Active & Visible to Public Users'), 'Must render active status text');
      assert.ok(content.includes('Hidden / Deleted from Users'), 'Must render hidden status text');
      assert.ok(content.includes('Visible to Public Users'), 'Must render Visible to Public Users label');
    });

    it('5.3 Provides Delete Plan (Hide from Users) and Restore Plan actions with at-least-1 enforcement', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes('Delete Plan (Hide from Users)'), 'Must render Delete Plan button');
      assert.ok(content.includes('Restore Plan'), 'Must render Restore Plan button');
      assert.ok(content.includes('function togglePlanVisibility('), 'Must define togglePlanVisibility');
      assert.ok(content.includes('function deleteOrHidePlan('), 'Must define deleteOrHidePlan');
      assert.ok(content.includes('function restorePlan('), 'Must define restorePlan');
      assert.ok(content.includes('function getEnabledPlanCount('), 'Must define getEnabledPlanCount');
      assert.ok(content.includes('At least 1 plan must remain active and visible to users'), 'Must enforce at least 1 plan remains enabled');
    });

    it('5.4 Displays hidden banner on Live Customer Preview when plan is disabled', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes('This plan is currently HIDDEN from public users'), 'Must render hidden preview notification');
    });

    it('5.5 Admin saveSettings dispatches ezbo:plans-settings-updated and syncs plansStore', () => {
      const content = readSafe(adminPagePath);
      assert.ok(content.includes('plansStore.set(normalizePlans(editablePlans))'), 'Admin save must update plansStore in memory');
      assert.ok(content.includes('ezbo:plans-settings-updated'), 'Admin save must dispatch ezbo:plans-settings-updated custom event');
    });
  });

  describe('6. Dashboard Billing Tab Integration', () => {
    it('6.1 Dashboard billing tab dynamically integrates PricingCardsGrid', () => {
      const dashboardPath = path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte');
      const content = readSafe(dashboardPath);
      assert.ok(content.includes('<PricingCardsGrid'), 'Dashboard must render PricingCardsGrid');
      assert.ok(content.includes('context="billing"'), 'Dashboard must pass context="billing"');
      assert.ok(content.includes('Explore available plans and switch tiers to elevate your AI capabilities.'), 'Dashboard must have universal available plans subtitle');
    });
  });

  describe('7. Quality Invariant: robots.css Integrity', () => {
    it('7.1 robots.css byte-for-byte SHA256 checksum matches 549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be', () => {
      const buffer = fs.readFileSync(robotsCssPath);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      assert.strictEqual(
        hash,
        '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be',
        'robots.css must remain strictly byte-for-byte identical'
      );
    });
  });
});
