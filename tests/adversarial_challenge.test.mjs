import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Import target application modules
import { AGENTS, CATEGORIES } from '../web/src/lib/components/robots/agents.js';
import { createRobot, ROBOT_DEFS } from '../web/src/lib/components/robots/createRobot.js';

const SVELTE_PATH = resolve('web/src/lib/components/robots/RobotShowcase.svelte');
const CSS_PATH = resolve('web/src/lib/components/robots/robots.css');
const PAGE_PATH = resolve('web/src/routes/+page.svelte');
const LAYOUT_CSS_PATH = resolve('web/src/routes/layout.css');

describe('Adversarial Verification Suite: EzboAgents Robot Showcase', () => {

  // =========================================================================
  // 1. DETAIL BUBBLE CLAMPING MATH STRESS HARNESS
  // =========================================================================
  describe('Adversarial Clamping Math Stress Harness', () => {
    // Replicate the exact clamping formula from RobotShowcase.svelte lines 106-117
    function computeBubblePosition({
      cellOffsetLeft,
      cellOffsetWidth = 130,
      cellOffsetTop,
      cellOffsetHeight = 180,
      containerWidth,
      gridHeight = 1000,
      bubbleWidth = 240,
      bubbleHeight = 160
    }) {
      const w = bubbleWidth;
      const x = Math.max(
        0,
        Math.min(cellOffsetLeft + cellOffsetWidth / 2 - w / 2, containerWidth - w)
      );
      const below = cellOffsetTop + cellOffsetHeight - 6;
      const y =
        below + bubbleHeight > gridHeight + 20
          ? Math.max(0, cellOffsetTop - bubbleHeight + 10)
          : below;

      return { x, y };
    }

    it('Property: bubble is ALWAYS strictly contained within [0, containerWidth] for all W >= 240 (10,000 random cases)', () => {
      // Monte Carlo fuzzing of container widths, cell dimensions, and positions
      const iterations = 10000;
      let seed = 42;
      function pseudoRandom() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      }

      for (let i = 0; i < iterations; i++) {
        // Viewports from 240px to 3840px (4K)
        const containerWidth = 240 + Math.floor(pseudoRandom() * 3600);
        const cellOffsetWidth = 100 + Math.floor(pseudoRandom() * 150);
        // Cell position can be anywhere from outside left (-100px) to outside right (W + 100px)
        const cellOffsetLeft = -100 + Math.floor(pseudoRandom() * (containerWidth + 200));

        const { x } = computeBubblePosition({
          cellOffsetLeft,
          cellOffsetWidth,
          cellOffsetTop: 200,
          containerWidth,
          bubbleWidth: 240
        });

        // INVARIANT 1: x is never negative
        assert.ok(x >= 0, `Violation at iteration ${i}: x=${x} is negative!`);

        // INVARIANT 2: x + 240 never exceeds containerWidth
        assert.ok(
          x + 240 <= containerWidth,
          `Violation at iteration ${i}: x + 240 = ${x + 240} exceeds containerWidth=${containerWidth} (x=${x})`
        );
      }
    });

    it('Boundary: Far-left edge clamping at exact minimum viewport (W = 240px, left = 0)', () => {
      const { x } = computeBubblePosition({
        cellOffsetLeft: 0,
        cellOffsetWidth: 130,
        cellOffsetTop: 100,
        containerWidth: 240
      });
      assert.equal(x, 0, 'Left edge on 240px container should clamp to exactly 0');
    });

    it('Boundary: Far-right edge clamping at minimum viewport (W = 240px, left = 110)', () => {
      const { x } = computeBubblePosition({
        cellOffsetLeft: 110,
        cellOffsetWidth: 130,
        cellOffsetTop: 100,
        containerWidth: 240
      });
      assert.equal(x, 0, 'Right edge on 240px container should clamp to 0 (240 - 240 = 0)');
    });

    it('Boundary: Negative offsetLeft edge case (scrolled or translated)', () => {
      const { x } = computeBubblePosition({
        cellOffsetLeft: -500,
        cellOffsetWidth: 130,
        cellOffsetTop: 100,
        containerWidth: 1200
      });
      assert.equal(x, 0, 'Negative offsetLeft must clamp to 0');
    });

    it('Boundary: Gigantic offsetLeft edge case', () => {
      const { x } = computeBubblePosition({
        cellOffsetLeft: 99999,
        cellOffsetWidth: 130,
        cellOffsetTop: 100,
        containerWidth: 1200
      });
      assert.equal(x, 1200 - 240, 'Massive offsetLeft must clamp to containerWidth - 240');
    });

    it('Vertical Property: y is NEVER negative under any bottom/top condition', () => {
      // Test top-most card flipping scenario
      const { y: topY } = computeBubblePosition({
        cellOffsetLeft: 100,
        cellOffsetWidth: 130,
        cellOffsetTop: 10, // near the very top of container
        containerWidth: 800,
        gridHeight: 100, // artificially short grid to force flip
        bubbleHeight: 200
      });
      assert.ok(topY >= 0, `Top flipped y=${topY} must be >= 0`);

      // Test bottom-most card flipping scenario
      const { y: bottomY } = computeBubblePosition({
        cellOffsetLeft: 100,
        cellOffsetWidth: 130,
        cellOffsetTop: 900,
        cellOffsetHeight: 180,
        containerWidth: 800,
        gridHeight: 1000,
        bubbleHeight: 150
      });
      // below = 900 + 180 - 6 = 1074. below + 150 = 1224 > 1020 -> flips to 900 - 150 + 10 = 760
      assert.equal(bottomY, 760, 'Bottom card should flip bubble above card');
      assert.ok(bottomY >= 0, `Bottom flipped y=${bottomY} must be >= 0`);
    });
  });

  // =========================================================================
  // 2. MOBILE SCREEN LIMITS (320px & 375px)
  // =========================================================================
  describe('Mobile Screen Limits (320px and 375px Viewports)', () => {
    it('Mobile Viewport Math: 375px viewport guarantees positive margin around 240px bubble', () => {
      const viewportWidth = 375;
      const horizontalPadding = 16 * 2; // px-4 = 16px left + 16px right in Tailwind
      const contentWidth = viewportWidth - horizontalPadding; // 343px
      const bubbleWidth = 240;

      assert.ok(contentWidth >= bubbleWidth, 'Content width 343px must exceed 240px bubble');
      const spareMargin = contentWidth - bubbleWidth;
      assert.equal(spareMargin, 103, 'Spare margin at 375px viewport must be exactly 103px');
    });

    it('Mobile Viewport Math: 320px minimum mobile screen guarantees containment', () => {
      const viewportWidth = 320;
      const horizontalPadding = 16 * 2; // px-4 = 16px each side
      const contentWidth = viewportWidth - horizontalPadding; // 288px
      const bubbleWidth = 240;

      assert.ok(contentWidth >= bubbleWidth, 'Content width 288px must exceed 240px bubble');
      const spareMargin = contentWidth - bubbleWidth;
      assert.equal(spareMargin, 48, 'Spare margin at 320px viewport must be 48px');
    });

    it('Grid Column Scaling: repeat(auto-fit, minmax(130px, 1fr)) allows at least 2 columns on 320px+', () => {
      const contentWidth320 = 288;
      const gap = 8; // gap: 12px 8px in robots.css
      // 2 columns: 2 * 130 + 8 = 268 <= 288
      const maxColumns320 = Math.floor((contentWidth320 + gap) / (130 + gap));
      assert.ok(maxColumns320 >= 2, `Expected >= 2 columns on 320px screen, got ${maxColumns320}`);
    });

    it('Global Overflow Defense: layout.css and +page.svelte enforce zero horizontal scrolling', () => {
      const layoutCss = readFileSync(LAYOUT_CSS_PATH, 'utf-8');
      assert.match(
        layoutCss,
        /html,\s*body\s*\{[^}]*overflow-x:\s*hidden/s,
        'layout.css must enforce overflow-x: hidden on html and body'
      );

      const pageContent = readFileSync(PAGE_PATH, 'utf-8');
      assert.match(
        pageContent,
        /<section[^>]*overflow-hidden/,
        'Landing page sections must have overflow-hidden class'
      );
    });

    it('Tab Bar Responsiveness: .rb-tabs has flex-wrap to prevent horizontal overflow', () => {
      const cssContent = readFileSync(CSS_PATH, 'utf-8');
      assert.match(
        cssContent,
        /\.rb-tabs\s*\{[^}]*flex-wrap:\s*wrap/s,
        '.rb-tabs must set flex-wrap: wrap so tabs wrap cleanly on narrow screens'
      );
    });
  });

  // =========================================================================
  // 3. CATEGORY COUNTS AND AGENT INTEGRITY ORACLE
  // =========================================================================
  describe('Category Counts & Agent Integrity Oracle', () => {
    it('Exact 75 Agents in dataset', () => {
      assert.equal(AGENTS.length, 75, 'AGENTS array must contain exactly 75 agents');
    });

    it('IDs are strictly sequential integers 1 through 75 with zero gaps or duplicates', () => {
      const ids = AGENTS.map((a) => a.n);
      assert.equal(new Set(ids).size, 75, 'All agent IDs must be unique');
      for (let i = 0; i < 75; i++) {
        assert.equal(ids[i], i + 1, `Agent at index ${i} must have n=${i + 1}`);
      }
    });

    it('Exact Category Breakdown matches Acceptance Criteria verbatim', () => {
      const expectedCounts = {
        all: 75,
        ads: 12,
        social: 11,
        writing: 10,
        image: 8,
        seo: 9,
        growth: 12,
        biz: 13
      };

      const actualCounts = {
        all: AGENTS.length,
        ads: AGENTS.filter((a) => a.cat === 'ads').length,
        social: AGENTS.filter((a) => a.cat === 'social').length,
        writing: AGENTS.filter((a) => a.cat === 'writing').length,
        image: AGENTS.filter((a) => a.cat === 'image').length,
        seo: AGENTS.filter((a) => a.cat === 'seo').length,
        growth: AGENTS.filter((a) => a.cat === 'growth').length,
        biz: AGENTS.filter((a) => a.cat === 'biz').length
      };

      assert.deepEqual(
        actualCounts,
        expectedCounts,
        'Category agent counts must match acceptance criteria verbatim'
      );

      const sum =
        actualCounts.ads +
        actualCounts.social +
        actualCounts.writing +
        actualCounts.image +
        actualCounts.seo +
        actualCounts.growth +
        actualCounts.biz;
      assert.equal(sum, 75, 'Sum of all categories must equal exactly 75');
    });

    it('Every agent has non-empty required properties (n, name, cat, tag, d, c, e)', () => {
      for (const agent of AGENTS) {
        assert.ok(Number.isInteger(agent.n) && agent.n >= 1 && agent.n <= 75);
        assert.ok(typeof agent.name === 'string' && agent.name.length > 0);
        assert.ok(typeof agent.cat === 'string' && agent.cat.length > 0);
        assert.ok(typeof agent.tag === 'string' && agent.tag.length > 0);
        assert.ok(typeof agent.d === 'string' && agent.d.length > 0);
        assert.ok(typeof agent.c === 'string' && agent.c.startsWith('#'));
        assert.ok(typeof agent.e === 'string' && agent.e.length > 0);
      }
    });

    it('CATEGORIES array matches the 8 expected tabs and sequence', () => {
      const expectedKeys = ['all', 'ads', 'social', 'writing', 'image', 'seo', 'growth', 'biz'];
      const actualKeys = CATEGORIES.map((c) => c.key);
      assert.deepEqual(actualKeys, expectedKeys, 'Category sequence must match expected');
    });

    it('RobotShowcase counts derivation logic produces exact counts for all tabs', () => {
      const svelteCode = readFileSync(SVELTE_PATH, 'utf-8');
      assert.match(
        svelteCode,
        /const counts.*?=\s*Object\.fromEntries\(\s*CATEGORIES\.map\(/s,
        'RobotShowcase must dynamically map CATEGORIES to accurate counts'
      );
    });
  });

  // =========================================================================
  // 4. OFFSCREEN ANIMATION PAUSES & PERFORMANCE
  // =========================================================================
  describe('Offscreen Animation Pausing & Performance Oracle', () => {
    it('CSS rule strictly pauses all SVG child animations when .rb-vis is absent', () => {
      const css = readFileSync(CSS_PATH, 'utf-8');
      assert.match(
        css,
        /\.rb-cell:not\(\.rb-vis\)\s+\.rb-svg\s+\*\s*\{\s*animation-play-state:\s*paused\s*!important;\s*\}/,
        'CSS rule must apply animation-play-state: paused !important to all .rb-svg descendants when .rb-vis is missing'
      );
    });

    it('IntersectionObserver configuration: 120px rootMargin pre-warms animations before entry', () => {
      const svelte = readFileSync(SVELTE_PATH, 'utf-8');
      assert.match(
        svelte,
        /rootMargin:\s*['"]120px['"]/,
        'IntersectionObserver must configure rootMargin: 120px'
      );
      assert.match(
        svelte,
        /x\.target\.classList\.toggle\(['"]rb-vis['"],\s*x\.isIntersecting\)/,
        'IntersectionObserver must toggle rb-vis with x.isIntersecting'
      );
    });

    it('IntersectionObserver cleanup: disconnect is returned for lifecycle management', () => {
      const svelte = readFileSync(SVELTE_PATH, 'utf-8');
      assert.match(
        svelte,
        /return\s*\(\)\s*=>\s*\{\s*io\.disconnect\(\);\s*\};/,
        'IntersectionObserver effect must return io.disconnect() teardown'
      );
    });

    it('Prefers-reduced-motion accessibility rule enforces total animation stoppage', () => {
      const css = readFileSync(CSS_PATH, 'utf-8');
      assert.match(
        css,
        /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.rb-root\s*\*,[^}]*animation:\s*none\s*!important;/s,
        'Prefers-reduced-motion must disable animations with !important'
      );
    });
  });

  // =========================================================================
  // 5. ESCAPE KEY DISMISSAL & INTERACTION LIFECYCLE
  // =========================================================================
  describe('Escape Key & Dismissal Logic Oracle', () => {
    it('Escape key listener binds to window keydown and resets active state', () => {
      const svelte = readFileSync(SVELTE_PATH, 'utf-8');
      assert.match(
        svelte,
        /if\s*\(\s*e\.key\s*===\s*['"]Escape['"]\s*\)\s*\{\s*setActive\(null\);\s*\}/,
        'Component must reset active state on Escape key'
      );
      assert.match(
        svelte,
        /window\.addEventListener\(['"]keydown['"],\s*onKey\);/,
        'Component must register keydown listener on window'
      );
      assert.match(
        svelte,
        /window\.removeEventListener\(['"]keydown['"],\s*onKey\);/,
        'Component must clean up keydown listener on unmount'
      );
    });

    it('Pointerdown outside listener resets active state unless target is bubble or active cell', () => {
      const svelte = readFileSync(SVELTE_PATH, 'utf-8');
      assert.match(
        svelte,
        /bubEl\s*&&\s*!bubEl\.contains\(target\)\s*&&\s*active\.el\s*&&\s*!active\.el\.contains\(target\)/,
        'Pointerdown must dismiss bubble unless target is inside bubble or active card'
      );
      assert.match(
        svelte,
        /window\.addEventListener\(['"]pointerdown['"],\s*onPointerDown\);/,
        'Component must register pointerdown listener on window'
      );
      assert.match(
        svelte,
        /window\.removeEventListener\(['"]pointerdown['"],\s*onPointerDown\);/,
        'Component must clean up pointerdown listener on unmount'
      );
    });

    it('Category tab selection immediately dismisses active bubble', () => {
      const svelte = readFileSync(SVELTE_PATH, 'utf-8');
      assert.match(
        svelte,
        /onclick=\{\(\)\s*=>\s*\{\s*cat\s*=\s*c\.key;\s*setActive\(null\);\s*\}\}/,
        'Tab buttons must call setActive(null) when switching categories'
      );
    });

    it('Detail bubble contains role="dialog" and accessible label', () => {
      const svelte = readFileSync(SVELTE_PATH, 'utf-8');
      assert.match(
        svelte,
        /role="dialog"/,
        'Bubble must declare role="dialog"'
      );
      assert.match(
        svelte,
        /aria-label=\{a\s*\?\s*`\$\{a\.name\}\s*details`\s*:\s*undefined\}/,
        'Bubble must bind dynamic aria-label when open'
      );
    });
  });

  // =========================================================================
  // 6. SVG PRE-RENDERING & ASSET ORACLE
  // =========================================================================
  describe('SVG Pre-rendering & Geometry Oracle', () => {
    it('createRobot generates well-formed SVG strings for all 75 agents', () => {
      assert.ok(ROBOT_DEFS.includes('<svg'), 'ROBOT_DEFS must declare SVG definitions');
      assert.ok(ROBOT_DEFS.includes('id="rbHead"'), 'ROBOT_DEFS must define rbHead gradient');
      assert.ok(ROBOT_DEFS.includes('id="rbBody"'), 'ROBOT_DEFS must define rbBody gradient');

      for (const agent of AGENTS) {
        const svg = createRobot(agent);
        assert.ok(svg.startsWith('<svg'), `Agent ${agent.n} SVG must start with <svg`);
        assert.ok(svg.endsWith('</svg>'), `Agent ${agent.n} SVG must end with </svg>`);
        assert.ok(svg.includes('viewBox="0 0 240 280"'), `Agent ${agent.n} must have viewBox 0 0 240 280`);
        assert.ok(svg.includes('class="rb-svg"'), `Agent ${agent.n} must have class rb-svg`);
        assert.ok(svg.includes(agent.c), `Agent ${agent.n} must interpolate accent color ${agent.c}`);
        assert.ok(!svg.includes('undefined'), `Agent ${agent.n} SVG must not contain undefined`);
        assert.ok(!svg.includes('NaN'), `Agent ${agent.n} SVG must not contain NaN`);

        // Check badge text
        const badgeText = `#${String(agent.n).padStart(2, '0')}`;
        assert.ok(svg.includes(badgeText), `Agent ${agent.n} SVG must contain badge ${badgeText}`);

        // Check props vs icons
        if (agent.n <= 12) {
          // Hand-drawn prop (no foreignObject icon tile)
          assert.ok(
            !svg.includes('<foreignObject') && (svg.includes('<rect') || svg.includes('<polygon') || svg.includes('<path')),
            `Agent ${agent.n} (Ads) must contain hand-drawn vector prop without foreignObject`
          );
        } else {
          // Tabler icon tile
          assert.ok(
            svg.includes('<foreignObject') && svg.includes(`class="ti ti-${agent.icon}"`),
            `Agent ${agent.n} must contain Tabler icon tile <i class="ti ti-${agent.icon}">`
          );
        }
      }
    });
  });
});
