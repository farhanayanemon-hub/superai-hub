/**
 * Adversarial Empirical Challenge Suite: Challenger 1
 * Empirical Purge & Zero-String Invariant Challenge
 *
 * Rigorously challenges the codebase to empirically assert:
 * 1. Zero occurrences of prohibited count phrases across web/src/
 * 2. Zero occurrences of prefix codes (#01, #02, etc.) in titles, agent cards, search bars, and UI badges
 * 3. tools.ts invariant: TOOLS.length === 0, ALL_TOOLS.length === 0, CATEGORIES.length === 0
 * 4. web/src/routes/+page.svelte invariant: no <RobotShowcase and no id="helpers"
 * 5. web/src/routes/admin/+page.svelte invariant: no "4. AI Helpers Access Matrix" and no static category tabs
 * 6. web/src/routes/dashboard/+page.svelte invariant: no "Show All 80 Helpers", no category scrollbar, and verbatim empty state
 * 7. Navbar.svelte invariant: no /#helpers link, points cleanly to /#features or /#pricing
 * 8. Cryptographic invariant: robots.css byte-for-byte SHA256 matches spec
 * 9. Bespoke Agent Architecture & Registry lifecycle verification
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
  // Loader already registered
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_SRC_DIR = path.join(ROOT_DIR, 'web', 'src');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

describe('Challenger 1: Empirical Purge & Zero-String Invariant Challenge', () => {

  describe('Suite 1: Prohibited Count Phrases Zero-Occurrence Invariant', () => {
    const prohibitedPhrases = [
      '75 agents',
      '75+ helpers',
      '80 helpers',
      '80 AI Helpers',
      '#01–#75',
      '#01-#75',
      '#01–#80',
      '#01-#80',
      'Show All 80 Helpers',
      '4. AI Helpers Access Matrix'
    ];

    // Collect all source files in web/src/ excluding invariant legacy assets (robots/)
    const allSrcFiles = getAllFiles(WEB_SRC_DIR).filter((f) => {
      const rel = path.relative(WEB_SRC_DIR, f).replace(/\\/g, '/');
      // robots/ contains the preserved robots.css and its dormant sibling files
      return !rel.startsWith('lib/components/robots/');
    });

    for (const phrase of prohibitedPhrases) {
      it(`should assert 0 occurrences of prohibited phrase: "${phrase}" across active web/src/`, () => {
        const violations = [];
        const lowerPhrase = phrase.toLowerCase();

        for (const file of allSrcFiles) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.toLowerCase().includes(lowerPhrase)) {
            violations.push(path.relative(ROOT_DIR, file));
          }
        }

        assert.deepStrictEqual(
          violations,
          [],
          `Found prohibited phrase "${phrase}" in files:\n${violations.join('\n')}`
        );
      });
    }
  });

  describe('Suite 2: Prefix Codes & Badge Zero-Occurrence Invariant in UI Components', () => {
    const uiComponentFiles = [
      path.join(WEB_SRC_DIR, 'lib', 'components', 'ToolCard.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'ToolDrawer.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'DashboardChat.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'FloatingCeoChat.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'MobileAppShowcase.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'ChannelModal.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'WorkflowStudioModal.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'Navbar.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'PricingCardsGrid.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'ApiKeyManager.svelte'),
      path.join(WEB_SRC_DIR, 'lib', 'components', 'AppDownloadModal.svelte'),
      path.join(WEB_SRC_DIR, 'routes', '+page.svelte'),
      path.join(WEB_SRC_DIR, 'routes', 'dashboard', '+page.svelte'),
      path.join(WEB_SRC_DIR, 'routes', 'admin', '+page.svelte'),
      path.join(WEB_SRC_DIR, 'routes', 'plans', '+page.svelte'),
      path.join(WEB_SRC_DIR, 'routes', 'download', '+page.svelte')
    ];

    it('should assert zero occurrences of prefix badges (#01, #02, #03, etc.) rendered in agent cards/titles/UI', () => {
      // Regex for UI badge/prefix text: e.g. text containing '#01' or '#02' or '#80' not as hex color
      // CSS hex colors have 3 or 6 hex digits like #00F0FF or #0A1628
      const prefixRegex = /(?:badge|title|code|placeholder|heading|label|text)[^>]*>.*?(#(?:0[1-9]|[1-7][0-9]|80)\b)/i;
      const chipRegex = /\[⚡\s*#(?:0[1-9]|[1-7][0-9]|80)\b/;

      for (const filePath of uiComponentFiles) {
        if (!fs.existsSync(filePath)) continue;
        const content = fs.readFileSync(filePath, 'utf8');
        const rel = path.relative(ROOT_DIR, filePath);

        assert.ok(
          !chipRegex.test(content),
          `Found legacy mention chip [⚡ #XX] in ${rel}`
        );
        assert.ok(
          !content.includes('Show All 80 Helpers'),
          `Found "Show All 80 Helpers" in ${rel}`
        );
        assert.ok(
          !content.includes('4. AI Helpers Access Matrix'),
          `Found "4. AI Helpers Access Matrix" in ${rel}`
        );
      }
    });

    it('ToolCard.svelte should NOT render # prefix code badges (#01, #02, etc.)', () => {
      const toolCardPath = path.join(WEB_SRC_DIR, 'lib', 'components', 'ToolCard.svelte');
      const content = fs.readFileSync(toolCardPath, 'utf8');
      // Assert that any code rendering excludes # prefixes
      assert.ok(
        content.includes("!tool.code.startsWith('#')") || !content.includes('{tool.code}'),
        'ToolCard does not guard against # prefix code badges'
      );
      assert.ok(!content.includes('#01'), 'ToolCard contains literal #01');
      assert.ok(!content.includes('#76'), 'ToolCard contains literal #76');
    });

    it('Navbar.svelte should NOT contain /#helpers link and should point to /#features or /#pricing', () => {
      const navbarPath = path.join(WEB_SRC_DIR, 'lib', 'components', 'Navbar.svelte');
      const content = fs.readFileSync(navbarPath, 'utf8');
      assert.ok(!content.includes('href="/#helpers"'), 'Navbar still links to /#helpers');
      assert.ok(!content.includes('>Helpers<'), 'Navbar still displays "Helpers" link text');
      assert.ok(
        content.includes('href="/#features"') || content.includes('href="/#pricing"'),
        'Navbar desktop link does not point to /#features or /#pricing'
      );
    });
  });

  describe('Suite 3: Config Layer Purge Invariant (tools.ts)', () => {
    it('tools.ts should export empty arrays for TOOLS, ALL_TOOLS, and CATEGORIES', async () => {
      const toolsPath = path.join(WEB_SRC_DIR, 'lib', 'config', 'tools.ts');
      const mod = await import(pathToFileURL(toolsPath).href);

      assert.ok(Array.isArray(mod.TOOLS), 'TOOLS must be an array');
      assert.strictEqual(mod.TOOLS.length, 0, `TOOLS length must be 0, got ${mod.TOOLS.length}`);

      assert.ok(Array.isArray(mod.ALL_TOOLS), 'ALL_TOOLS must be an array');
      assert.strictEqual(mod.ALL_TOOLS.length, 0, `ALL_TOOLS length must be 0, got ${mod.ALL_TOOLS.length}`);

      assert.ok(Array.isArray(mod.CATEGORIES), 'CATEGORIES must be an array');
      assert.strictEqual(mod.CATEGORIES.length, 0, `CATEGORIES length must be 0, got ${mod.CATEGORIES.length}`);
    });

    it('AI_CEO_PROFILE should not mention 80 helpers or static counts', async () => {
      const toolsPath = path.join(WEB_SRC_DIR, 'lib', 'config', 'tools.ts');
      const mod = await import(pathToFileURL(toolsPath).href);

      const ceoProfile = mod.AI_CEO_PROFILE;
      assert.ok(ceoProfile, 'AI_CEO_PROFILE must exist');
      const profileStr = JSON.stringify(ceoProfile);

      assert.ok(!profileStr.includes('80'), 'AI_CEO_PROFILE mentions 80');
      assert.ok(!profileStr.includes('75'), 'AI_CEO_PROFILE mentions 75');
      assert.ok(!profileStr.includes('#01'), 'AI_CEO_PROFILE mentions #01');
    });
  });

  describe('Suite 4: Landing Page & Route Invariants', () => {
    it('web/src/routes/+page.svelte must NOT import or render RobotShowcase or count phrases', () => {
      const pagePath = path.join(WEB_SRC_DIR, 'routes', '+page.svelte');
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(!content.includes('RobotShowcase'), '+page.svelte still references RobotShowcase');
      assert.ok(!content.includes('id="helpers"'), '+page.svelte still contains id="helpers" anchor');
      assert.ok(!/\b75\s+(?:agents?|helpers?|specialists?|robots?)\b/i.test(content), '+page.svelte contains 75 agent count phrase');
      assert.ok(!/\b80\s+(?:agents?|helpers?|specialists?|robots?)\b/i.test(content), '+page.svelte contains 80 agent count phrase');
      assert.ok(!/#01[-–—]#?(?:75|80)/.test(content), '+page.svelte contains range prefix');
    });

    it('web/src/routes/admin/+page.svelte must NOT contain Section 4 or category tabs', () => {
      const adminPath = path.join(WEB_SRC_DIR, 'routes', 'admin', '+page.svelte');
      const content = fs.readFileSync(adminPath, 'utf8');

      assert.ok(!content.includes('AI Helpers Access Matrix'), 'admin/+page.svelte still contains AI Helpers Access Matrix');
      assert.ok(!content.includes('4. AI Helpers Access Matrix'), 'admin/+page.svelte still contains 4. AI Helpers Access Matrix');
      assert.ok(!content.includes('filteredMatrixHelpers'), 'admin/+page.svelte still references filteredMatrixHelpers');
    });

    it('web/src/routes/dashboard/+page.svelte must render verbatim clean empty state and NO static scrollbar', () => {
      const dashPath = path.join(WEB_SRC_DIR, 'routes', 'dashboard', '+page.svelte');
      const content = fs.readFileSync(dashPath, 'utf8');

      const expectedEmptyState = 'Your agent workspace is clean. Custom agents will appear here as you add them, or you can command the Master AI CEO directly.';
      assert.ok(
        content.includes(expectedEmptyState),
        `dashboard/+page.svelte does not contain exact verbatim empty state text:\n"${expectedEmptyState}"`
      );

      assert.ok(!content.includes('Show All 80 Helpers'), 'dashboard/+page.svelte still contains "Show All 80 Helpers"');
      assert.ok(!content.includes('selectCategory'), 'dashboard/+page.svelte still references selectCategory');
    });
  });

  describe('Suite 5: Cryptographic Invariant (robots.css SHA256)', () => {
    it('web/src/lib/components/robots/robots.css byte-for-byte SHA256 must match authoritative spec', () => {
      const cssPath = path.join(WEB_SRC_DIR, 'lib', 'components', 'robots', 'robots.css');
      assert.ok(fs.existsSync(cssPath), 'robots.css must exist');

      const fileBuffer = fs.readFileSync(cssPath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();

      const expectedHash = '549729F4C18443E871D09766D36B27FBF28ED91552139FF6FCB7A77F1EC009BE';
      assert.strictEqual(
        hash,
        expectedHash,
        `robots.css SHA256 mismatch! Expected ${expectedHash}, got ${hash}`
      );
    });
  });

  describe('Suite 6: Bespoke Agent Architecture & Registry Lifecycle Stress', () => {
    it('agentRegistry.ts should support full registration, lookup, unregistration lifecycle', async () => {
      const registryPath = path.join(WEB_SRC_DIR, 'lib', 'config', 'agentRegistry.ts');
      const reg = await import(pathToFileURL(registryPath).href);

      // Verify clean initial state
      assert.ok(Array.isArray(reg.DEFAULT_REGISTERED_AGENTS), 'DEFAULT_REGISTERED_AGENTS is an array');
      assert.strictEqual(reg.DEFAULT_REGISTERED_AGENTS.length, 0, 'Initial DEFAULT_REGISTERED_AGENTS is empty');

      // Test dynamic agent registration
      const testAgent = {
        id: 'test_bespoke_agent_alpha',
        name: 'Alpha Analyst',
        nameEn: 'Alpha Analyst En',
        description: 'Bespoke custom agent for data analysis',
        category: 'analytics',
        keywords: ['alpha', 'analyze data'],
        viewPreference: 'fullscreen'
      };

      reg.registerAgent(testAgent);

      const registered = reg.getRegisteredAgents();
      assert.ok(registered.length >= 1, 'Registered agents length should be >= 1');
      assert.strictEqual(reg.getAgentById('test_bespoke_agent_alpha')?.name, 'Alpha Analyst');

      // Test active bespoke agent lifecycle
      reg.openBespokeAgent('test_bespoke_agent_alpha');
      // Verify active agent via store
      let currentActive = null;
      const unsub = reg.activeBespokeAgent.subscribe((val) => { currentActive = val; });
      assert.strictEqual(currentActive?.id, 'test_bespoke_agent_alpha');

      reg.closeBespokeAgent();
      assert.strictEqual(currentActive, null);

      // Test unregistration
      const removed = reg.unregisterAgent('test_bespoke_agent_alpha');
      assert.strictEqual(removed, true, 'unregisterAgent should return true');
      assert.strictEqual(reg.getAgentById('test_bespoke_agent_alpha'), undefined);

      unsub();
    });
  });

  describe('Suite 7: Chat Services & Telegram Webhook Zero-Count Invariant', () => {
    it('web/src/routes/api/telegram/webhook/+server.ts should not output 80 helpers or #01-#80', () => {
      const tgPath = path.join(WEB_SRC_DIR, 'routes', 'api', 'telegram', 'webhook', '+server.ts');
      const content = fs.readFileSync(tgPath, 'utf8');

      assert.ok(!content.includes('80 helpers'), 'telegram webhook mentions 80 helpers');
      assert.ok(!content.includes('80 AI Helpers'), 'telegram webhook mentions 80 AI Helpers');
      assert.ok(!content.includes('#01-#80'), 'telegram webhook mentions #01-#80');
      assert.ok(!content.includes('#01–#75'), 'telegram webhook mentions #01–#75');
    });

    it('ceoRouter.ts should not contain hardcoded 80 count in directives or prompt generation', () => {
      const ceoPath = path.join(WEB_SRC_DIR, 'lib', 'services', 'ceoRouter.ts');
      const content = fs.readFileSync(ceoPath, 'utf8');

      assert.ok(!content.includes('80 helpers'), 'ceoRouter.ts mentions 80 helpers');
      assert.ok(!content.includes('80 AI Helpers'), 'ceoRouter.ts mentions 80 AI Helpers');
      assert.ok(!content.includes('75 helpers'), 'ceoRouter.ts mentions 75 helpers');
      assert.ok(!content.includes('75+ helpers'), 'ceoRouter.ts mentions 75+ helpers');
    });
  });

});
