/**
 * Challenger 1 Empirical Test Suite: Milestone 2 Deep Challenge & Edge Cases
 * Focus:
 * 1. 2-Plan Architecture (Starter & Pro) price & badge contracts
 * 2. Strict SHA256 invariance of robots.css
 * 3. Backward-compatibility of managed and alias 'byok'
 * 4. Empirical scan for residual user-facing "BYOK" strings
 * 5. Edge cases in getPlanPrice and plan switching
 */

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

const PATHS = {
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  plansTs: path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts'),
  pricingCardsGrid: path.join(WEB_DIR, 'src', 'lib', 'components', 'PricingCardsGrid.svelte'),
  apiKeyManager: path.join(WEB_DIR, 'src', 'lib', 'components', 'ApiKeyManager.svelte'),
  plansPage: path.join(WEB_DIR, 'src', 'routes', 'plans', '+page.svelte'),
  dashboardPage: path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte'),
  homePage: path.join(WEB_DIR, 'src', 'routes', '+page.svelte'),
  footerSvelte: path.join(WEB_DIR, 'src', 'lib', 'components', 'Footer.svelte'),
  signupPage: path.join(WEB_DIR, 'src', 'routes', 'signup', '+page.svelte')
};

const EXPECTED_ROBOTS_SHA256 = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

function getSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function readSafe(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Challenger 1 Milestone 2 Empirical Suite', () => {

  describe('1. Checksum Verification: robots.css SHA256 Invariance', () => {
    it('1.1 robots.css must exist and match exact SHA256 hash byte-for-byte', () => {
      assert.ok(fs.existsSync(PATHS.robotsCss), 'robots.css must exist');
      const hash = getSha256(PATHS.robotsCss);
      assert.strictEqual(
        hash,
        EXPECTED_ROBOTS_SHA256,
        `robots.css SHA256 checksum changed! Actual: ${hash}, Expected: ${EXPECTED_ROBOTS_SHA256}`
      );
    });
  });

  describe('2. 2-Plan Architecture Pricing & Features Contracts', () => {
    it('2.1 Starter Plan contract: ৳499/mo, ৳4,790/yr, name="Starter Plan", badge="Essential Starter"', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      const starter = DEFAULT_PLANS.byok_starter;
      assert.ok(starter, 'DEFAULT_PLANS.byok_starter must exist');
      assert.strictEqual(starter.name, 'Starter Plan');
      assert.strictEqual(starter.badge, 'Essential Starter');
      assert.strictEqual(starter.monthlyPrice, 499);
      assert.strictEqual(starter.yearlyMonthlyPrice, 399);
      assert.strictEqual(starter.yearlyTotal, 4790);
      assert.strictEqual(starter.featureToggles.aiCeo, true);
      assert.strictEqual(starter.featureToggles.allHelpersEnabled, true);
    });

    it('2.2 Pro Plan contract: ৳899/mo, ৳8,690/yr, name="Pro Plan", badge="Power Automation"', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      const pro = DEFAULT_PLANS.byok_pro;
      assert.ok(pro, 'DEFAULT_PLANS.byok_pro must exist');
      assert.strictEqual(pro.name, 'Pro Plan');
      assert.strictEqual(pro.badge, 'Power Automation');
      assert.strictEqual(pro.monthlyPrice, 899);
      assert.strictEqual(pro.yearlyMonthlyPrice, 719);
      assert.strictEqual(pro.yearlyTotal, 8690);
      assert.strictEqual(pro.featureToggles.aiCeo, true);
      assert.strictEqual(pro.featureToggles.allHelpersEnabled, true);
      assert.strictEqual(pro.featureToggles.multiKeyVault, true);
      assert.strictEqual(pro.featureToggles.multiModelFailover, true);
    });

    it('2.3 Backward compatibility: managed tier preserved in DEFAULT_PLANS and resolves correctly', async () => {
      const { DEFAULT_PLANS, getPlanPrice } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.ok(DEFAULT_PLANS.managed, 'DEFAULT_PLANS.managed must exist');
      assert.strictEqual(DEFAULT_PLANS.managed.monthlyPrice, 1499);
      assert.strictEqual(DEFAULT_PLANS.managed.yearlyTotal, 14390);

      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'monthly'), 1499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'managed', 'yearly'), 14390);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'complete', 'monthly'), 1499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'complete', 'yearly'), 14390);
    });

    it('2.4 Backward compatibility: alias "byok" resolves to Starter Plan pricing', async () => {
      const { DEFAULT_PLANS, getPlanPrice } = await import(pathToFileURL(PATHS.plansTs).href);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok', 'monthly'), 499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok', 'yearly'), 4790);
    });

    it('2.5 getPlanPrice handles edge cases: unknown tier falls back to Starter, invalid interval falls back to monthly', async () => {
      const { DEFAULT_PLANS, getPlanPrice } = await import(pathToFileURL(PATHS.plansTs).href);
      // Fallback for non-existent tier should default safely to starter price
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'unknown_tier', 'monthly'), 499);
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'unknown_tier', 'yearly'), 4790);
      // Invalid interval defaults to monthlyPrice
      assert.strictEqual(getPlanPrice(DEFAULT_PLANS, 'byok_pro', 'quarterly'), 899);
    });
  });

  describe('3. PricingCardsGrid 2-Column Layout & Constraints', () => {
    it('3.1 planOrder contains exactly byok_starter and byok_pro in order', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      const match = content.match(/const\s+planOrder\s*:\s*PlanTierId\[\]\s*=\s*\[([^\]]+)\]/);
      assert.ok(match, 'planOrder declaration must exist');
      const items = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
      assert.deepStrictEqual(items, ['byok_starter', 'byok_pro'], 'planOrder must only have byok_starter and byok_pro');
    });

    it('3.2 Container uses responsive 2-column layout and max-w-4xl', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      assert.ok(content.includes('grid-cols-1 md:grid-cols-2'), 'Must specify 2 columns on md');
      assert.ok(content.includes('max-w-4xl'), 'Must specify max-w-4xl container');
    });
  });

  describe('4. Empirical Audit for Residual BYOK in User-Facing UI', () => {
    it('4.1 plans.ts features and descriptions must have zero occurrences of "BYOK"', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansTs).href);
      for (const [tier, plan] of Object.entries(DEFAULT_PLANS)) {
        if (tier === 'managed') continue; // managed is legacy internal
        assert.ok(!plan.name.toUpperCase().includes('BYOK'), `${tier}.name contains BYOK: ${plan.name}`);
        assert.ok(!plan.badge.toUpperCase().includes('BYOK'), `${tier}.badge contains BYOK: ${plan.badge}`);
        assert.ok(!plan.description.toUpperCase().includes('BYOK'), `${tier}.description contains BYOK: ${plan.description}`);
        for (const feat of plan.features) {
          assert.ok(!feat.toUpperCase().includes('BYOK'), `${tier} feature contains BYOK: ${feat}`);
        }
      }
    });

    it('4.2 PricingCardsGrid.svelte must not render "BYOK" in public markup', () => {
      const content = readSafe(PATHS.pricingCardsGrid);
      // Strip script tag to check only template markup
      const template = content.replace(/<script[\s\S]*?<\/script>/, '');
      assert.ok(!template.includes('>BYOK'), 'PricingCardsGrid template contains >BYOK');
      assert.ok(!/class="[^"]*">[^<]*BYOK[^<]*</i.test(template), 'PricingCardsGrid renders BYOK text');
    });

    it('4.3 plans/+page.svelte must not contain user-facing "BYOK"', () => {
      const content = readSafe(PATHS.plansPage);
      const template = content.replace(/<script[\s\S]*?<\/script>/, '');
      assert.ok(!template.toUpperCase().includes('BYOK'), 'plans page template contains BYOK');
    });

    it('4.4 +page.svelte (Homepage) must not contain user-facing "BYOK"', () => {
      const content = readSafe(PATHS.homePage);
      const template = content.replace(/<script[\s\S]*?<\/script>/, '');
      assert.ok(!template.toUpperCase().includes('BYOK'), 'Homepage template contains BYOK');
    });

    it('4.5 dashboard/+page.svelte billing tab must not contain user-facing "BYOK"', () => {
      const content = readSafe(PATHS.dashboardPage);
      // Check billing section lines
      assert.ok(!content.includes('Plan: BYOK'), 'dashboard contains Plan: BYOK');
      assert.ok(!content.includes('BYOK Starter'), 'dashboard contains BYOK Starter');
      assert.ok(!content.includes('BYOK Pro'), 'dashboard contains BYOK Pro');
    });

    it('4.6 ApiKeyManager.svelte user-facing text must not contain "BYOK"', () => {
      const content = readSafe(PATHS.apiKeyManager);
      const template = content.replace(/<script[\s\S]*?<\/script>/, '');
      // Strip HTML comments
      const templateNoComments = template.replace(/<!--[\s\S]*?-->/g, '');
      // In BYOK Pro upgrade modal or cards
      assert.ok(!templateNoComments.includes('BYOK Starter'), 'ApiKeyManager contains BYOK Starter');
      assert.ok(!templateNoComments.includes('BYOK Pro'), 'ApiKeyManager contains BYOK Pro');
    });

    it('4.7 CHALLENGE: Footer.svelte must NOT contain "Zero-Markup BYOK Architecture"', () => {
      const content = readSafe(PATHS.footerSvelte);
      const template = content.replace(/<script[\s\S]*?<\/script>/, '');
      const hasByok = /BYOK/i.test(template);
      assert.ok(!hasByok, 'Footer.svelte still contains residual "BYOK" branding in link text!');
    });

    it('4.8 CHALLENGE: signup/+page.svelte must NOT contain "zero-markup BYOK"', () => {
      const content = readSafe(PATHS.signupPage);
      const template = content.replace(/<script[\s\S]*?<\/script>/, '');
      const hasByok = /BYOK/i.test(template);
      assert.ok(!hasByok, 'signup/+page.svelte still contains residual "zero-markup BYOK" in user pitch!');
    });
  });
});
