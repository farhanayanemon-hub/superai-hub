import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ROBOTS_DIR,
  WEB_DIR,
  STATIC_DIR,
  DOWNLOADS_DIR,
  computeClampedBubblePosition,
  getFileHash,
  toFileUrl
} from './helpers/test_utils.mjs';

describe('Adversarial Stress & Edge Case Verification Suite (Challenger 2)', () => {

  // =========================================================================
  // 1. DETAIL BUBBLE CLAMPING MATHEMATICS & VIEWPORT CONTAINMENT
  // =========================================================================
  describe('Adversarial Viewport Clamping & Layout Math', () => {
    const bubbleWidth = 240;
    const bubbleHeight = 160;

    const VIEWPORTS = [
      { name: 'Ultra-compact / Legacy (320px)', width: 320 },
      { name: 'Compact Android (360px)', width: 360 },
      { name: 'Target Mobile (375px)', width: 375 },
      { name: 'Modern iPhone 14 (390px)', width: 390 },
      { name: 'iPhone Plus (414px)', width: 414 },
      { name: 'Large Mobile (480px)', width: 480 },
      { name: 'Small Tablet (600px)', width: 600 },
      { name: 'iPad Portrait (768px)', width: 768 },
      { name: 'Surface / Netbook (900px)', width: 900 },
      { name: 'iPad Pro / Laptop (1024px)', width: 1024 },
      { name: 'Standard Desktop (1280px)', width: 1280 },
      { name: 'QHD Laptop (1440px)', width: 1440 },
      { name: 'Full HD 1080p (1920px)', width: 1920 },
      { name: '2K QHD Display (2560px)', width: 2560 },
      { name: '4K UHD Display (3840px)', width: 3840 }
    ];

    it('should maintain zero-overflow invariants across all standard and extreme viewports', () => {
      for (const vp of VIEWPORTS) {
        // Container has px-4 (32px total) on mobile, px-6 (48px) on sm/md, px-8 (64px) on lg+
        const pad = vp.width < 640 ? 32 : (vp.width < 1024 ? 48 : 64);
        const containerWidth = Math.min(vp.width - pad, 1280); // max-w-7xl
        const minColWidth = 130;
        const colGap = 8;
        const cols = Math.max(1, Math.floor((containerWidth + colGap) / (minColWidth + colGap)));
        const colWidth = (containerWidth - (cols - 1) * colGap) / cols;

        for (let c = 0; c < cols; c++) {
          const offsetLeft = c * (colWidth + colGap);
          const cellWidth = colWidth;

          const pos = computeClampedBubblePosition({
            offsetLeft,
            offsetTop: 150,
            offsetWidth: cellWidth,
            offsetHeight: 170,
            wrapClientWidth: containerWidth,
            gridOffsetHeight: 800,
            bubOffsetHeight: bubbleHeight,
            bubbleWidth
          });

          // Invariant 1: Left boundary >= 0
          assert.ok(
            pos.x >= 0,
            `Violation at ${vp.name} col ${c}: x=${pos.x} is negative`
          );

          // Invariant 2: Right boundary must fit inside containerWidth when containerWidth >= bubbleWidth
          if (containerWidth >= bubbleWidth) {
            assert.ok(
              pos.x + bubbleWidth <= containerWidth + 0.001,
              `Violation at ${vp.name} col ${c}: x+w=${pos.x + bubbleWidth} exceeds containerWidth=${containerWidth}`
            );
          }
        }
      }
    });

    it('should withstand 10,000 randomized layout combinations without NaN, negative x, or overflow', () => {
      let passed = 0;
      for (let i = 0; i < 10000; i++) {
        // Randomized container width: 240 to 4000
        const wrapClientWidth = 240 + Math.random() * 3760;
        // Randomized cell width: 80 to 400
        const offsetWidth = 80 + Math.random() * 320;
        // Randomized offsetLeft: from -100 (abnormal margin) to wrapClientWidth + 100
        const offsetLeft = -100 + Math.random() * (wrapClientWidth + 200);
        // Randomized vertical dimensions
        const offsetTop = Math.random() * 2000;
        const offsetHeight = 100 + Math.random() * 150;
        const gridOffsetHeight = 500 + Math.random() * 2500;
        const bubOffsetHeight = 120 + Math.random() * 100;

        const pos = computeClampedBubblePosition({
          offsetLeft,
          offsetTop,
          offsetWidth,
          offsetHeight,
          wrapClientWidth,
          gridOffsetHeight,
          bubOffsetHeight,
          bubbleWidth
        });

        assert.ok(!Number.isNaN(pos.x), `x was NaN on iteration ${i}`);
        assert.ok(!Number.isNaN(pos.y), `y was NaN on iteration ${i}`);
        assert.ok(pos.x >= 0, `x was negative (${pos.x}) on iteration ${i}`);
        assert.ok(
          pos.x + bubbleWidth <= wrapClientWidth + 0.001,
          `x + bubbleWidth (${pos.x + bubbleWidth}) exceeded container (${wrapClientWidth}) on iteration ${i}`
        );
        assert.ok(pos.y >= 0, `y was negative (${pos.y}) on iteration ${i}`);
        passed++;
      }
      assert.strictEqual(passed, 10000);
    });

    it('should clamp x safely to 0 even if container is narrower than bubble (< 240px)', () => {
      // Degraded / ultra-narrow viewport e.g. 200px width
      const pos = computeClampedBubblePosition({
        offsetLeft: 20,
        offsetTop: 50,
        offsetWidth: 100,
        offsetHeight: 150,
        wrapClientWidth: 200,
        gridOffsetHeight: 500,
        bubOffsetHeight: bubbleHeight,
        bubbleWidth: 240
      });
      // Math.max(0, Math.min(20 + 50 - 120, 200 - 240)) = Math.max(0, Math.min(-50, -40)) = Math.max(0, -50) = 0
      assert.strictEqual(pos.x, 0, 'Did not clamp safely to 0 in sub-240px container');
    });

    it('should flip vertically to above-card when bottom row overflows gridOffsetHeight + 20', () => {
      const gridOffsetHeight = 600;
      const cellHeight = 170;
      const cellTop = 500; // bottom edge: 500 + 170 = 670, below = 664. below + 160 = 824 > 620
      const pos = computeClampedBubblePosition({
        offsetLeft: 100,
        offsetTop: cellTop,
        offsetWidth: 140,
        offsetHeight: cellHeight,
        wrapClientWidth: 800,
        gridOffsetHeight,
        bubOffsetHeight: bubbleHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.shouldFlip, true, 'Should have triggered vertical flip');
      // y = Math.max(0, offsetTop - bubOffsetHeight + 10) = 500 - 160 + 10 = 350
      assert.strictEqual(pos.y, 350, 'Flipped y position incorrect');
      assert.ok(pos.y < cellTop, 'Flipped bubble must be placed above the card top');
    });
  });

  // =========================================================================
  // 2. MOBILE SCREEN LIMITS (375px VIEWPORT SPECIFICATION)
  // =========================================================================
  describe('Mobile Screen Limits (375px)', () => {
    it('should guarantee zero horizontal overflow on standard 375px iPhone width', () => {
      const screenWidth = 375;
      const padding = 32; // Tailwind px-4 (16px * 2)
      const containerWidth = screenWidth - padding; // 343px

      // On 343px width, minmax(130px, 1fr) with 8px gap fits exactly 2 columns:
      // (343 - 8) / 2 = 167.5px column width
      const colWidth = (containerWidth - 8) / 2; // 167.5px
      assert.ok(colWidth >= 130, 'Column width below 130px min-width');

      // Test Column 1 (Left column: offsetLeft = 0)
      const col1Pos = computeClampedBubblePosition({
        offsetLeft: 0,
        offsetTop: 100,
        offsetWidth: colWidth,
        offsetHeight: 170,
        wrapClientWidth: containerWidth,
        gridOffsetHeight: 1000,
        bubOffsetHeight: 160,
        bubbleWidth: 240
      });

      // Left column: ideal center = 0 + 83.75 - 120 = -36.25 -> clamped to 0
      assert.strictEqual(col1Pos.x, 0, 'Left column bubble not clamped to 0');
      assert.ok(col1Pos.x + 240 <= containerWidth, 'Left column bubble overflows container');
      assert.ok(col1Pos.x + 240 + 16 <= screenWidth, 'Left column bubble overflows screen');

      // Test Column 2 (Right column: offsetLeft = 167.5 + 8 = 175.5)
      const col2Pos = computeClampedBubblePosition({
        offsetLeft: 175.5,
        offsetTop: 100,
        offsetWidth: colWidth,
        offsetHeight: 170,
        wrapClientWidth: containerWidth,
        gridOffsetHeight: 1000,
        bubOffsetHeight: 160,
        bubbleWidth: 240
      });

      // Right column: ideal center = 175.5 + 83.75 - 120 = 139.25
      // Max right clamp = containerWidth - bubbleWidth = 343 - 240 = 103
      // Clamped to 103
      assert.strictEqual(col2Pos.x, 103, 'Right column bubble not clamped to 103');
      assert.strictEqual(col2Pos.x + 240, containerWidth, 'Right column bubble right edge must align exactly with container width');
      assert.ok(col2Pos.x + 240 + 16 <= screenWidth, 'Right column bubble overflows 375px screen');
    });

    it('should ensure AI CEO section max-width (280px) is strictly less than mobile container (343px)', () => {
      const cssPath = path.join(ROBOTS_DIR, 'robots.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      const ceoMatch = cssContent.match(/\.rb-ceo\s*\{[^}]*max-width:\s*(\d+)px/);
      assert.ok(ceoMatch, 'Could not find .rb-ceo max-width in robots.css');
      const ceoMaxWidth = parseInt(ceoMatch[1], 10);
      assert.strictEqual(ceoMaxWidth, 280, 'CEO max-width is not 280px');
      assert.ok(ceoMaxWidth < 343, 'CEO max-width exceeds mobile content container width');
    });
  });

  // =========================================================================
  // 3. CATEGORY COUNTS & PARTITIONING ACROSS ALL 8 TABS
  // =========================================================================
  describe('Category Counts & Partitioning Integrity', () => {
    let AGENTS, CATEGORIES;

    it('should load agents and categories cleanly', async () => {
      const agentsMod = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      AGENTS = agentsMod.AGENTS;
      CATEGORIES = agentsMod.CATEGORIES;
      assert.ok(Array.isArray(AGENTS), 'AGENTS is not an array');
      assert.ok(Array.isArray(CATEGORIES), 'CATEGORIES is not an array');
    });

    it('should verify exact category tab sequence and accurate agent counts', () => {
      const expectedCategories = [
        { key: 'all', label: 'All 75', count: 75 },
        { key: 'ads', label: 'Ads and marketing', count: 12 },
        { key: 'social', label: 'Social media', count: 11 },
        { key: 'writing', label: 'Writing', count: 10 },
        { key: 'image', label: 'Image and logo', count: 8 },
        { key: 'seo', label: 'SEO', count: 9 },
        { key: 'growth', label: 'Personal growth', count: 12 },
        { key: 'biz', label: 'Business automation', count: 13 }
      ];

      assert.strictEqual(CATEGORIES.length, 8, 'Must have exactly 8 category definitions');

      for (let i = 0; i < expectedCategories.length; i++) {
        const expected = expectedCategories[i];
        const actual = CATEGORIES[i];
        assert.strictEqual(actual.key, expected.key, `Category index ${i} key mismatch`);
        assert.strictEqual(actual.label, expected.label, `Category index ${i} label mismatch`);

        const matchingAgents = expected.key === 'all'
          ? AGENTS
          : AGENTS.filter(a => a.cat === expected.key);
        assert.strictEqual(
          matchingAgents.length,
          expected.count,
          `Category ${expected.key} count mismatch: expected ${expected.count}, got ${matchingAgents.length}`
        );
      }
    });

    it('should verify strict disjoint partition of all 75 agents across the 7 sub-categories', () => {
      const subCategories = CATEGORIES.filter(c => c.key !== 'all').map(c => c.key);
      const categorySum = subCategories.reduce((sum, key) => {
        return sum + AGENTS.filter(a => a.cat === key).length;
      }, 0);

      assert.strictEqual(categorySum, 75, 'Sum of 7 sub-categories must equal exactly 75');

      // Check each agent belongs to exactly 1 known category
      const seenIds = new Set();
      for (const agent of AGENTS) {
        assert.ok(
          subCategories.includes(agent.cat),
          `Agent #${agent.n} (${agent.name}) has unknown category "${agent.cat}"`
        );
        assert.ok(!seenIds.has(agent.n), `Duplicate agent ID: #${agent.n}`);
        seenIds.add(agent.n);
      }
      assert.strictEqual(seenIds.size, 75, 'Must contain exactly 75 unique agent IDs');
    });

    it('should verify strict monotonicity of agent IDs from 1 to 75', () => {
      for (let i = 0; i < AGENTS.length; i++) {
        assert.strictEqual(
          AGENTS[i].n,
          i + 1,
          `Agent index ${i} has ID #${AGENTS[i].n}, expected #${i + 1}`
        );
      }
    });
  });

  // =========================================================================
  // 4. OFFSCREEN ANIMATION PAUSING & CSS SPECIFICITY
  // =========================================================================
  describe('Offscreen Animation Pausing (.rb-vis & CSS Specificity)', () => {
    it('should enforce animation-play-state: paused !important on .rb-cell:not(.rb-vis) .rb-svg *', () => {
      const cssPath = path.join(ROBOTS_DIR, 'robots.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      // Verify the exact CSS selector and priority
      const pauseRuleRegex = /\.rb-cell:not\(\.rb-vis\)\s+\.rb-svg\s+\*\s*\{[^}]*animation-play-state:\s*paused\s*!important/i;
      assert.ok(
        pauseRuleRegex.test(cssContent),
        'robots.css must contain .rb-cell:not(.rb-vis) .rb-svg * { animation-play-state: paused !important; }'
      );
    });

    it('should verify RobotShowcase Svelte component sets up IntersectionObserver with rootMargin 120px and cleans up on unmount', () => {
      const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
      const svelteContent = fs.readFileSync(sveltePath, 'utf-8');

      assert.ok(
        svelteContent.includes("new IntersectionObserver"),
        'RobotShowcase.svelte must instantiate IntersectionObserver'
      );
      assert.ok(
        svelteContent.includes("rootMargin: '120px'"),
        'RobotShowcase.svelte must configure rootMargin: 120px'
      );
      assert.ok(
        svelteContent.includes("x.target.classList.toggle('rb-vis', x.isIntersecting)"),
        'IntersectionObserver callback must toggle rb-vis according to isIntersecting'
      );
      assert.ok(
        svelteContent.includes("io.disconnect()"),
        'IntersectionObserver must disconnect on effect cleanup'
      );
    });

    it('should verify SVGs have root class .rb-svg and animated child classes for all 75 agents', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));

      for (const agent of AGENTS) {
        const svg = createRobot(agent);
        assert.ok(
          svg.includes('class="rb-svg"'),
          `Agent #${agent.n} SVG missing root class="rb-svg"`
        );
        // Children must include animated classes (.rb-fl, .rb-bk, .rb-sh, etc.)
        assert.ok(
          svg.includes('rb-fl') && svg.includes('rb-bk'),
          `Agent #${agent.n} SVG missing key animated child classes`
        );
      }
    });
  });

  // =========================================================================
  // 5. ESCAPE KEY & INTERACTIVE DISMISSAL BEHAVIOR
  // =========================================================================
  describe('Escape Key & Pointer-Down Interactive Dismissal Logic', () => {
    it('should verify RobotShowcase implements Escape key dismissal logic on window keydown', () => {
      const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
      const svelteContent = fs.readFileSync(sveltePath, 'utf-8');

      // Check keydown listener registration
      assert.ok(
        svelteContent.includes("window.addEventListener('keydown', onKey)"),
        'Must register window keydown listener'
      );
      assert.ok(
        svelteContent.includes("window.removeEventListener('keydown', onKey)"),
        'Must deregister window keydown listener on cleanup'
      );
      // Check Escape key handler
      assert.ok(
        svelteContent.includes("if (e.key === 'Escape')"),
        'Handler must check e.key === "Escape"'
      );
      assert.ok(
        svelteContent.includes("setActive(null)"),
        'Escape handler must invoke setActive(null)'
      );
    });

    it('should verify outside pointerdown dismisses bubble while preserving clicks inside bubble or active card', () => {
      const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
      const svelteContent = fs.readFileSync(sveltePath, 'utf-8');

      assert.ok(
        svelteContent.includes("window.addEventListener('pointerdown', onPointerDown)"),
        'Must register window pointerdown listener'
      );
      assert.ok(
        svelteContent.includes("window.removeEventListener('pointerdown', onPointerDown)"),
        'Must deregister window pointerdown listener on cleanup'
      );
      assert.ok(
        svelteContent.includes("!bubEl.contains(target)"),
        'Must check target is not contained within bubEl'
      );
      assert.ok(
        svelteContent.includes("!active.el.contains(target)"),
        'Must check target is not contained within active.el'
      );
    });

    it('should verify tab switching immediately clears active bubble state', () => {
      const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
      const svelteContent = fs.readFileSync(sveltePath, 'utf-8');

      // Look at tab onclick handler
      assert.ok(
        svelteContent.includes("cat = c.key; setActive(null);"),
        'Tab button onclick must set cat and call setActive(null)'
      );
    });
  });

  // =========================================================================
  // 6. UNTOUCHED ASSETS & CONTRACT INTEGRITY
  // =========================================================================
  describe('Forensic Untouched Files Check', () => {
    const FILES = ['createRobot.js', 'agents.js', 'robots.css', 'README.md'];

    for (const f of FILES) {
      it(`should verify ${f} matches original download hash byte-for-byte`, () => {
        const sourcePath = path.join(DOWNLOADS_DIR, f);
        const targetPath = path.join(ROBOTS_DIR, f);

        const sourceHash = getFileHash(sourcePath);
        const targetHash = getFileHash(targetPath);

        assert.ok(sourceHash, `Source file ${sourcePath} could not be hashed`);
        assert.ok(targetHash, `Target file ${targetPath} could not be hashed`);
        assert.strictEqual(targetHash, sourceHash, `${f} SHA256 does not match original untouched file!`);
      });
    }

    it('should verify ezbo-ceo.png is identical to static/logo.png', () => {
      const logoPath = path.join(STATIC_DIR, 'logo.png');
      const ceoPath = path.join(STATIC_DIR, 'ezbo-ceo.png');

      const logoHash = getFileHash(logoPath);
      const ceoHash = getFileHash(ceoPath);

      assert.ok(logoHash, 'Could not hash logo.png');
      assert.ok(ceoHash, 'Could not hash ezbo-ceo.png');
      assert.strictEqual(ceoHash, logoHash, 'ezbo-ceo.png differs from logo.png');
    });

    it('should verify Navbar desktop and mobile contain links to /#helpers', () => {
      const navbarPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'Navbar.svelte');
      const navbarContent = fs.readFileSync(navbarPath, 'utf-8');

      assert.ok(
        navbarContent.includes('href="/#helpers"'),
        'Navbar must contain href="/#helpers"'
      );
      assert.ok(
        navbarContent.includes('>Helpers<'),
        'Navbar must have link with text "Helpers"'
      );
    });

    it('should verify +page.svelte contains <section id="helpers"> wrapping RobotShowcase', () => {
      const pagePath = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');
      const pageContent = fs.readFileSync(pagePath, 'utf-8');

      assert.ok(
        pageContent.includes('<section id="helpers"'),
        '+page.svelte must contain <section id="helpers"'
      );
      assert.ok(
        pageContent.includes('<RobotShowcase'),
        '+page.svelte must embed <RobotShowcase'
      );
      assert.ok(
        pageContent.includes('import RobotShowcase from'),
        '+page.svelte must import RobotShowcase'
      );
    });
  });

});
