import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT_DIR,
  WEB_DIR,
  ROBOTS_DIR,
  STATIC_DIR,
  DOWNLOADS_DIR,
  getFileHash,
  fileExistsNonEmpty,
  isValidPng,
  validateRobotSvg,
  toFileUrl
} from './helpers/test_utils.mjs';
import {
  EXPECTED_CATEGORIES,
  TOTAL_AGENTS,
  EXPECTED_FILES,
  ADS_PROPS,
  EXPECTED_NAVBAR_LINK,
  EXPECTED_SECTION_ID
} from './fixtures/expected_agents.mjs';

describe('Tier 1: Feature Coverage (>=5 tests per feature)', () => {

  describe('Feature 1: Asset Existence & Integrity', () => {
    it('1.1 should have createRobot.js matching source hash byte-for-byte', () => {
      const targetPath = path.join(ROBOTS_DIR, 'createRobot.js');
      const sourcePath = path.join(DOWNLOADS_DIR, 'createRobot.js');
      assert.ok(fileExistsNonEmpty(targetPath), `Missing ${targetPath}`);
      if (fs.existsSync(sourcePath)) {
        assert.strictEqual(getFileHash(targetPath), getFileHash(sourcePath), 'createRobot.js was modified from source');
      }
    });

    it('1.2 should have agents.js matching source hash byte-for-byte', () => {
      const targetPath = path.join(ROBOTS_DIR, 'agents.js');
      const sourcePath = path.join(DOWNLOADS_DIR, 'agents.js');
      assert.ok(fileExistsNonEmpty(targetPath), `Missing ${targetPath}`);
      if (fs.existsSync(sourcePath)) {
        assert.strictEqual(getFileHash(targetPath), getFileHash(sourcePath), 'agents.js was modified from source');
      }
    });

    it('1.3 should have robots.css matching source hash byte-for-byte', () => {
      const targetPath = path.join(ROBOTS_DIR, 'robots.css');
      const sourcePath = path.join(DOWNLOADS_DIR, 'robots.css');
      assert.ok(fileExistsNonEmpty(targetPath), `Missing ${targetPath}`);
      if (fs.existsSync(sourcePath)) {
        assert.strictEqual(getFileHash(targetPath), getFileHash(sourcePath), 'robots.css was modified from source');
      }
    });

    it('1.4 should have README.md in robots dir matching source hash byte-for-byte', () => {
      const targetPath = path.join(ROBOTS_DIR, 'README.md');
      const sourcePath = path.join(DOWNLOADS_DIR, 'README.md');
      assert.ok(fileExistsNonEmpty(targetPath), `Missing ${targetPath}`);
      if (fs.existsSync(sourcePath)) {
        assert.strictEqual(getFileHash(targetPath), getFileHash(sourcePath), 'README.md was modified from source');
      }
    });

    it('1.5 should have web/static/ezbo-ceo.png with valid PNG signature magic bytes', () => {
      const targetPath = path.join(STATIC_DIR, 'ezbo-ceo.png');
      assert.ok(fileExistsNonEmpty(targetPath), 'Missing web/static/ezbo-ceo.png');
      assert.ok(isValidPng(targetPath), 'ezbo-ceo.png is not a valid PNG file');
    });

    it('1.6 should have ezbo-ceo.png identical to web/static/logo.png', () => {
      const targetPath = path.join(STATIC_DIR, 'ezbo-ceo.png');
      const sourceLogo = path.join(STATIC_DIR, 'logo.png');
      assert.ok(fileExistsNonEmpty(sourceLogo), 'Missing source web/static/logo.png');
      assert.ok(fileExistsNonEmpty(targetPath), 'Missing web/static/ezbo-ceo.png');
      assert.strictEqual(getFileHash(targetPath), getFileHash(sourceLogo), 'ezbo-ceo.png does not match logo.png');
    });
  });

  describe('Feature 2: Tabler Webfont Installation & Stylesheet Import', () => {
    it('2.1 should list @tabler/icons-webfont in web/package.json', () => {
      const pkgPath = path.join(WEB_DIR, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const hasDep = (pkg.dependencies && pkg.dependencies['@tabler/icons-webfont']) ||
                     (pkg.devDependencies && pkg.devDependencies['@tabler/icons-webfont']);
      assert.ok(hasDep, '@tabler/icons-webfont is not listed in dependencies or devDependencies');
    });

    it('2.2 should have installed @tabler/icons-webfont package in web/node_modules', () => {
      const modPath = path.join(WEB_DIR, 'node_modules', '@tabler', 'icons-webfont');
      assert.ok(fs.existsSync(modPath), 'node_modules/@tabler/icons-webfont directory does not exist');
    });

    it('2.3 should have tabler-icons.min.css containing .ti class rules', () => {
      const cssPath = path.join(WEB_DIR, 'node_modules', '@tabler', 'icons-webfont', 'dist', 'tabler-icons.min.css');
      assert.ok(fs.existsSync(cssPath), 'tabler-icons.min.css does not exist');
      const content = fs.readFileSync(cssPath, 'utf8');
      assert.ok(content.includes('.ti{') || content.includes('.ti-') || content.includes('.ti '), 'tabler-icons.min.css does not define .ti selectors');
    });

    it('2.4 should import tabler-icons stylesheet in web/src/routes/+layout.svelte', () => {
      const layoutPath = path.join(WEB_DIR, 'src', 'routes', '+layout.svelte');
      assert.ok(fs.existsSync(layoutPath), 'Missing +layout.svelte');
      const content = fs.readFileSync(layoutPath, 'utf8');
      const hasImport = content.includes('@tabler/icons-webfont/dist/tabler-icons.min.css') ||
                        content.includes('@tabler/icons-webfont');
      assert.ok(hasImport, '+layout.svelte does not import tabler-icons webfont stylesheet');
    });

    it('2.5 should have webfont binary files present (woff2/woff)', () => {
      const fontsDir = path.join(WEB_DIR, 'node_modules', '@tabler', 'icons-webfont', 'dist', 'fonts');
      assert.ok(fs.existsSync(fontsDir), 'fonts directory missing in @tabler/icons-webfont/dist');
      const files = fs.readdirSync(fontsDir);
      const hasWoff = files.some(f => f.endsWith('.woff2') || f.endsWith('.woff') || f.endsWith('.ttf'));
      assert.ok(hasWoff, 'No font files found in @tabler/icons-webfont/dist/fonts');
    });
  });

  describe('Feature 3: Svelte 5 Runes Usage in RobotShowcase.svelte', () => {
    const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');

    it('3.1 should exist with TypeScript script block', () => {
      assert.ok(fs.existsSync(sveltePath), 'Missing RobotShowcase.svelte');
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('<script lang="ts">') || content.includes('<script>'), 'Missing script tag');
    });

    it('3.2 should use $props() rune for props destructuring with defaults', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('$props()'), 'RobotShowcase.svelte does not use $props() rune');
      assert.ok(content.includes('ceoSrc'), 'Missing ceoSrc prop');
      assert.ok(content.includes('signupUrl'), 'Missing signupUrl prop');
      assert.ok(content.includes('defaultCategory'), 'Missing defaultCategory prop');
    });

    it('3.3 should use $state() rune for reactive variables', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('$state(') || content.includes('$state<'), 'RobotShowcase.svelte does not use $state() rune');
      assert.ok(content.includes('cat = $state') || content.includes('cat=$state'), 'Missing $state for cat');
      assert.ok(content.includes('active = $state') || content.includes('active=$state'), 'Missing $state for active');
    });

    it('3.4 should use $derived() rune for computed collections', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('$derived('), 'RobotShowcase.svelte does not use $derived() rune');
      assert.ok(content.includes('svgs') || content.includes('list') || content.includes('counts'), 'Missing $derived computed maps');
    });

    it('3.5 should use $effect() rune for IntersectionObserver, Escape key, and bubble clamping', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('$effect('), 'RobotShowcase.svelte does not use $effect() rune');
      assert.ok(content.includes('IntersectionObserver'), 'Missing IntersectionObserver in $effect');
      assert.ok(content.includes('Escape'), 'Missing Escape key handler in $effect');
    });

    it('3.6 should not contain legacy Svelte 3/4 reactivity syntax', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(!/^\s*export\s+let\s+/m.test(content), 'Found legacy export let prop syntax');
      assert.ok(!/^\s*\$:\s+/m.test(content), 'Found legacy $: reactive declaration syntax');
      assert.ok(!content.includes('beforeUpdate'), 'Found legacy beforeUpdate lifecycle');
      assert.ok(!content.includes('afterUpdate'), 'Found legacy afterUpdate lifecycle');
    });
  });

  describe('Feature 4: SVG Pre-rendering via createRobot', () => {
    it('4.1 should export ROBOT_DEFS and createRobot function', async () => {
      const createRobotModule = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));
      assert.ok(typeof createRobotModule.createRobot === 'function', 'createRobot is not a function');
      assert.ok(typeof createRobotModule.ROBOT_DEFS === 'string', 'ROBOT_DEFS is not a string');
      assert.ok(createRobotModule.ROBOT_DEFS.includes('id="rbHead"'), 'Missing rbHead gradient');
      assert.ok(createRobotModule.ROBOT_DEFS.includes('id="rbBody"'), 'Missing rbBody gradient');
    });

    it('4.2 should pre-render valid SVG for all 75 agents', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));
      assert.strictEqual(AGENTS.length, TOTAL_AGENTS, `Expected ${TOTAL_AGENTS} agents`);

      for (const agent of AGENTS) {
        const svg = createRobot(agent);
        const res = validateRobotSvg(svg, agent);
        assert.ok(res.valid, `Agent #${agent.n} (${agent.name}) failed SVG validation: ${res.errors.join(', ')}`);
      }
    });

    it('4.3 should render chest panel with padded badge number #01 to #75', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));

      const firstAgent = AGENTS[0];
      const svgFirst = createRobot(firstAgent);
      assert.ok(svgFirst.includes('#01'), 'Agent 1 missing #01 badge');

      const lastAgent = AGENTS[74];
      const svgLast = createRobot(lastAgent);
      assert.ok(svgLast.includes('#75'), 'Agent 75 missing #75 badge');
    });

    it('4.4 should correctly interpolate accent color (c) and eye glow (e)', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));

      for (const agent of AGENTS.slice(0, 10)) {
        const svg = createRobot(agent);
        assert.ok(svg.includes(agent.c), `Missing accent color ${agent.c} for agent ${agent.name}`);
        assert.ok(svg.includes(agent.e), `Missing eye color ${agent.e} for agent ${agent.name}`);
      }
    });

    it('4.5 should render hand-crafted custom SVG props for Ads #01-#12', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));

      for (let id = 1; id <= 12; id++) {
        const agent = AGENTS.find(a => a.n === id);
        assert.ok(agent, `Agent #${id} not found`);
        const expectedProp = ADS_PROPS[id];
        assert.strictEqual(agent.prop, expectedProp, `Agent #${id} expected prop ${expectedProp}`);
        const svg = createRobot(agent);
        assert.ok(svg.includes('class="rb-ar"'), `Agent #${id} missing right arm / prop group`);
      }
    });

    it('4.6 should render Tabler icon tiles for helpers #13-#75', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));

      for (const agent of AGENTS.slice(12)) {
        assert.ok(agent.icon, `Agent #${agent.n} (${agent.name}) missing icon property`);
        const svg = createRobot(agent);
        assert.ok(
          svg.includes(`ti ti-${agent.icon}`) || svg.includes(`class="ti ti-${agent.icon}"`),
          `Agent #${agent.n} missing Tabler icon ti-${agent.icon}`
        );
      }
    });

    it('4.7 should render distinct eye shapes according to eye specification', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));

      const eyeShapes = new Set(AGENTS.map(a => a.eyes));
      assert.ok(eyeShapes.has('smile'));
      assert.ok(eyeShapes.has('dots'));
      assert.ok(eyeShapes.has('wink'));
      assert.ok(eyeShapes.has('pill'));
      assert.ok(eyeShapes.has('star'));
      assert.ok(eyeShapes.has('heart'));
      assert.ok(eyeShapes.has('shades'));

      for (const shape of eyeShapes) {
        const agent = AGENTS.find(a => a.eyes === shape);
        const svg = createRobot(agent);
        assert.ok(svg.includes('class="rb-bk rb-e"'), `Missing eye class for shape ${shape}`);
      }
    });
  });

  describe('Feature 5: Category Filtering and Tab Counts', () => {
    it('5.1 should define exactly 8 categories in correct sequence', async () => {
      const { CATEGORIES } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      assert.strictEqual(CATEGORIES.length, 8, 'Expected exactly 8 categories');
      const keys = CATEGORIES.map(c => c.key);
      assert.deepStrictEqual(keys, ['all', 'ads', 'social', 'writing', 'image', 'seo', 'growth', 'biz']);
    });

    it('5.2 should have All category with count 75 spanning IDs 1-75', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      assert.strictEqual(AGENTS.length, 75);
      const ids = AGENTS.map(a => a.n);
      for (let i = 1; i <= 75; i++) {
        assert.ok(ids.includes(i), `Missing agent ID #${i}`);
      }
    });

    it('5.3 should have Ads category with count 12 spanning IDs 1-12', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const ads = AGENTS.filter(a => a.cat === 'ads');
      assert.strictEqual(ads.length, 12, 'Ads count mismatch');
      assert.deepStrictEqual(ads.map(a => a.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('5.4 should have Social media category with count 11 spanning IDs 13-23', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const social = AGENTS.filter(a => a.cat === 'social');
      assert.strictEqual(social.length, 11, 'Social count mismatch');
      assert.deepStrictEqual(social.map(a => a.n), [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    });

    it('5.5 should have Writing category with count 10 spanning IDs 24-33', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const writing = AGENTS.filter(a => a.cat === 'writing');
      assert.strictEqual(writing.length, 10, 'Writing count mismatch');
      assert.deepStrictEqual(writing.map(a => a.n), [24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);
    });

    it('5.6 should have Image and logo category with count 8 spanning IDs 34-41', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const image = AGENTS.filter(a => a.cat === 'image');
      assert.strictEqual(image.length, 8, 'Image count mismatch');
      assert.deepStrictEqual(image.map(a => a.n), [34, 35, 36, 37, 38, 39, 40, 41]);
    });

    it('5.7 should have SEO category with count 9 spanning IDs 42-50', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const seo = AGENTS.filter(a => a.cat === 'seo');
      assert.strictEqual(seo.length, 9, 'SEO count mismatch');
      assert.deepStrictEqual(seo.map(a => a.n), [42, 43, 44, 45, 46, 47, 48, 49, 50]);
    });

    it('5.8 should have Personal growth (12, IDs 51-62) and Business automation (13, IDs 63-75)', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const growth = AGENTS.filter(a => a.cat === 'growth');
      assert.strictEqual(growth.length, 12, 'Growth count mismatch');
      assert.deepStrictEqual(growth.map(a => a.n), [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62]);

      const biz = AGENTS.filter(a => a.cat === 'biz');
      assert.strictEqual(biz.length, 13, 'Biz count mismatch');
      assert.deepStrictEqual(biz.map(a => a.n), [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75]);
    });
  });

  describe('Feature 6: IntersectionObserver Animation Pausing Logic', () => {
    const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
    const cssPath = path.join(ROBOTS_DIR, 'robots.css');

    it('6.1 should configure IntersectionObserver with rootMargin 120px', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('rootMargin') && content.includes('120px'), 'Missing rootMargin: 120px');
    });

    it('6.2 should observe all .rb-cell grid elements', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('.rb-cell') && content.includes('.observe('), 'Missing cell observation query');
    });

    it('6.3 should toggle rb-vis class on intersecting entries', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('rb-vis') && (content.includes('isIntersecting') || content.includes('toggle')), 'Missing rb-vis toggling');
    });

    it('6.4 should disconnect observer on effect teardown', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('disconnect()'), 'Missing io.disconnect() teardown cleanup');
    });

    it('6.5 should enforce paused animation-play-state in robots.css when offscreen', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      assert.ok(css.includes('.rb-cell:not(.rb-vis)') || css.includes(':not(.rb-vis)'), 'Missing :not(.rb-vis) selector');
      assert.ok(css.includes('animation-play-state: paused !important'), 'Missing animation-play-state: paused !important');
    });
  });

  describe('Feature 7: Detail Bubble Display & Escape Key Handler', () => {
    const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');

    it('7.1 should render dialog bubble with number, name, tag, desc, and action', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('class="rb-bub"'), 'Missing .rb-bub container');
      assert.ok(content.includes('rb-bub-name'), 'Missing .rb-bub-name');
      assert.ok(content.includes('rb-bub-tag'), 'Missing .rb-bub-tag');
      assert.ok(content.includes('rb-bub-desc'), 'Missing .rb-bub-desc');
      assert.ok(content.includes('Launch studio'), 'Missing Launch studio action text');
    });

    it('7.2 should include .rb-live indicator dot', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('class="rb-live"') || content.includes("class='rb-live'"), 'Missing .rb-live active indicator');
    });

    it('7.3 should have role="dialog" accessibility attribute', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('role="dialog"') || content.includes("role='dialog'"), 'Missing role="dialog" on bubble');
    });

    it('7.4 should fall back to signupUrl for studio link', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('studioUrl ?') || content.includes('studioUrl(') || content.includes('signupUrl'), 'Missing signupUrl fallback for studio link');
    });

    it('7.5 should invoke studioUrl callback when provided', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('studioUrl'), 'studioUrl is not referenced in template');
    });

    it('7.6 should attach Escape key listener to dismiss active bubble', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(
        content.includes('keydown') &&
        content.includes('Escape') &&
        (content.includes('active = null') || content.includes('setActive(null)')),
        'Missing Escape key dismissal logic'
      );
    });
  });

  describe('Feature 8: AI CEO Mascot Logo and Floating Element', () => {
    const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');

    it('8.1 should render .rb-ceo container with mascot img alt="EZBO AI CEO"', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('class="rb-ceo"'), 'Missing .rb-ceo wrapper');
      assert.ok(content.includes('class="rb-ceo-img"') && content.includes('EZBO AI CEO'), 'Missing .rb-ceo-img with alt');
    });

    it('8.2 should default mascot img src to ceoSrc (/ezbo-ceo.png)', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('src={ceoSrc}') || content.includes('ceoSrc'), 'Missing ceoSrc binding on mascot img');
    });

    it('8.3 should display AI CEO title', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('class="rb-ceo-title"') && content.includes('AI CEO'), 'Missing AI CEO title');
    });

    it('8.4 should display Master executive orchestrator subtitle', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('Master executive orchestrator'), 'Missing Master executive orchestrator subtitle');
    });

    it('8.5 should render Command AI CEO link pointing to signupUrl', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.ok(content.includes('Command AI CEO'), 'Missing Command AI CEO link text');
      assert.ok(content.includes('href={signupUrl}') || content.includes('signupUrl'), 'Command AI CEO does not link to signupUrl');
    });
  });

  describe('Feature 9: Landing Page Replacement under <section id="helpers">', () => {
    const pagePath = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');

    it('9.1 should import RobotShowcase component in +page.svelte', () => {
      assert.ok(fs.existsSync(pagePath), 'Missing +page.svelte');
      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(content.includes('RobotShowcase'), '+page.svelte does not import RobotShowcase');
    });

    it('9.2 should wrap RobotShowcase inside <section id="helpers">', () => {
      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(
        content.includes('<section id="helpers">') || content.includes('<section id="helpers"'),
        '+page.svelte missing <section id="helpers">'
      );
      assert.ok(content.includes('<RobotShowcase'), 'RobotShowcase not rendered inside page');
    });

    it('9.3 should have removed the legacy 75-card static catalog', () => {
      const content = fs.readFileSync(pagePath, 'utf8');
      // The old static catalog had hardcoded helper cards array or 75 card divs
      assert.ok(!content.includes('helpers = [') && !content.includes('const helpers ='), 'Found old static helpers array in +page.svelte');
      assert.ok(!content.includes('id="catalog"'), 'Old #catalog section still present');
    });

    it('9.4 should preserve all other landing page sections intact', () => {
      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(content.includes('WhatsApp') || content.includes('whatsapp'), 'Missing WhatsApp Engine section');
      assert.ok(content.includes('Pricing') || content.includes('pricing') || content.includes('Tk'), 'Missing Pricing section');
      assert.ok(content.includes('FAQ') || content.includes('faq'), 'Missing FAQ section');
    });

    it('9.5 should link Hero CTA button to #helpers', () => {
      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(
        content.includes('href="#helpers"') || content.includes('href="/#helpers"'),
        'Hero CTA button does not link to #helpers'
      );
    });
  });

  describe('Feature 10: Navbar "Helpers" Link', () => {
    const navbarPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'Navbar.svelte');
    const layoutCssPath = path.join(WEB_DIR, 'src', 'routes', 'layout.css');
    const appHtmlPath = path.join(WEB_DIR, 'src', 'app.html');

    it('10.1 should contain desktop navigation link pointing to /#helpers', () => {
      assert.ok(fs.existsSync(navbarPath), 'Missing Navbar.svelte');
      const content = fs.readFileSync(navbarPath, 'utf8');
      assert.ok(
        content.includes('href="/#helpers"') || content.includes("href='/#helpers'") || content.includes('href="#helpers"'),
        'Navbar desktop navigation missing link to /#helpers'
      );
    });

    it('10.2 should contain mobile drawer navigation link pointing to /#helpers', () => {
      const content = fs.readFileSync(navbarPath, 'utf8');
      // Should appear in mobile menu as well (count at least 2 instances of helpers href)
      const matches = content.match(/href="[\/]?[#]helpers"/g) || content.match(/href='[\/]?[#]helpers'/g) || [];
      assert.ok(matches.length >= 2, `Expected at least 2 helpers links (desktop + mobile), found ${matches.length}`);
    });

    it('10.3 should display label "Helpers" in navigation links', () => {
      const content = fs.readFileSync(navbarPath, 'utf8');
      assert.ok(content.includes('Helpers'), 'Navigation link text does not contain Helpers');
    });

    it('10.4 should configure smooth scrolling in CSS or app.html', () => {
      let hasSmooth = false;
      if (fs.existsSync(layoutCssPath)) {
        const css = fs.readFileSync(layoutCssPath, 'utf8');
        if (css.includes('scroll-behavior: smooth') || css.includes('scroll-smooth')) hasSmooth = true;
      }
      if (!hasSmooth && fs.existsSync(appHtmlPath)) {
        const html = fs.readFileSync(appHtmlPath, 'utf8');
        if (html.includes('scroll-smooth') || html.includes('scroll-behavior')) hasSmooth = true;
      }
      const robotsCssPath = path.join(ROBOTS_DIR, 'robots.css');
      if (!hasSmooth && fs.existsSync(robotsCssPath)) {
        const rcss = fs.readFileSync(robotsCssPath, 'utf8');
        if (rcss.includes('scroll-behavior: smooth')) hasSmooth = true;
      }
      assert.ok(hasSmooth, 'Smooth scrolling behavior not configured');
    });

    it('10.5 should target valid section id="helpers" on landing page', () => {
      const pagePath = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');
      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(content.includes('id="helpers"'), 'Target section id="helpers" missing in landing page');
    });
  });
});
