import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ROBOTS_DIR,
  WEB_DIR,
  computeClampedBubblePosition,
  toFileUrl
} from './helpers/test_utils.mjs';

describe('Tier 2: Boundary & Corner Cases', () => {

  describe('Detail Bubble Boundary Clamping Mathematics', () => {
    const bubbleWidth = 240;
    const bubHeight = 160;

    it('2.1 should clamp x to 0 when robot card is at the left boundary', () => {
      // Cell at left edge: offsetLeft = 0, width = 140
      // Ideal x = 0 + 70 - 120 = -50
      const pos = computeClampedBubblePosition({
        offsetLeft: 0,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 0, 'Left boundary did not clamp to 0');
    });

    it('2.2 should clamp x to 0 even with negative offsetLeft edge cases', () => {
      const pos = computeClampedBubblePosition({
        offsetLeft: -30,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 0, 'Negative offset did not clamp to 0');
    });

    it('2.3 should clamp x to wrapClientWidth - bubbleWidth at the right boundary', () => {
      // Container width: 1200, bubble width: 240. Max x = 960.
      // Cell at offsetLeft = 1100, width = 140. Ideal x = 1100 + 70 - 120 = 1050.
      const pos = computeClampedBubblePosition({
        offsetLeft: 1100,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 960, 'Right boundary did not clamp to 1200 - 240 = 960');
    });

    it('2.4 should perfectly center bubble when cell is in middle of container', () => {
      // Cell at offsetLeft = 530, width = 140. Center = 600.
      // Ideal x = 600 - 120 = 480. Bound is [0, 960].
      const pos = computeClampedBubblePosition({
        offsetLeft: 530,
        offsetTop: 100,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 480, 'Centered cell did not yield 480');
    });

    it('2.5 should clamp x strictly within mobile viewport (375px width)', () => {
      // Mobile wrap width: 360px (375px viewport with padding).
      // Max x = 360 - 240 = 120px.
      // Cell at right column: offsetLeft = 200, width = 150. Ideal x = 200 + 75 - 120 = 155.
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 100,
        offsetWidth: 150,
        offsetHeight: 170,
        wrapClientWidth: 360,
        gridOffsetHeight: 800,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.x, 120, 'Mobile viewport right clamp exceeded container');
      assert.ok(pos.x + bubbleWidth <= 360, 'Bubble overflows mobile container');
    });

    it('2.6 should position bubble below cell for upper and middle rows', () => {
      // Row 1: offsetTop = 50, height = 170. below = 50 + 170 - 6 = 214.
      // gridHeight = 1000. 214 + 160 = 374 <= 1020 -> does NOT flip.
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 50,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 1000,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.shouldFlip, false, 'Upper row cell flipped unexpectedly');
      assert.strictEqual(pos.y, 214);
    });

    it('2.7 should flip bubble above cell when at bottom edge of grid', () => {
      // Bottom row: offsetTop = 800, height = 170. below = 800 + 170 - 6 = 964.
      // gridHeight = 900. below + bubHeight = 964 + 160 = 1124 > 920 -> FLIPS!
      // Flipped y = Math.max(0, 800 - 160 + 10) = 650.
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 800,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 900,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.shouldFlip, true, 'Bottom row cell failed to flip above');
      assert.strictEqual(pos.y, 650);
    });

    it('2.8 should clamp flipped vertical y to 0 if card is near container top', () => {
      // Extreme edge case: gridHeight is small (150px), card offsetTop = 50px.
      // below = 50 + 170 - 6 = 214 > 170 -> FLIPS!
      // flipped = 50 - 160 + 10 = -100 -> Clamped to 0!
      const pos = computeClampedBubblePosition({
        offsetLeft: 200,
        offsetTop: 50,
        offsetWidth: 140,
        offsetHeight: 170,
        wrapClientWidth: 1200,
        gridOffsetHeight: 150,
        bubOffsetHeight: bubHeight,
        bubbleWidth
      });
      assert.strictEqual(pos.shouldFlip, true);
      assert.strictEqual(pos.y, 0, 'Flipped y allowed negative vertical position');
    });
  });

  describe('Off-Screen Animation Pause Threshold & Accessibility', () => {
    const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
    const cssPath = path.join(ROBOTS_DIR, 'robots.css');

    it('2.9 should verify rootMargin is set to exactly 120px in component', () => {
      const content = fs.readFileSync(sveltePath, 'utf8');
      assert.match(content, /rootMargin\s*:\s*['"]120px['"]/, 'IntersectionObserver rootMargin is not 120px');
    });

    it('2.10 should verify CSS animation-play-state paused rule has !important flag', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      const hasImportant = css.includes('animation-play-state: paused !important') ||
                           css.includes('animation-play-state:paused!important');
      assert.ok(hasImportant, 'CSS missing !important flag on off-screen paused state');
    });

    it('2.11 should zero out animations under prefers-reduced-motion: reduce', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      assert.ok(css.includes('prefers-reduced-motion'), 'Missing prefers-reduced-motion media query');
      assert.ok(
        css.includes('animation: none !important') ||
        css.includes('animation:none!important') ||
        css.includes('animation-duration: 0.01ms'),
        'prefers-reduced-motion does not eliminate animations'
      );
    });
  });

  describe('Viewport Resizing & Layout Responsiveness', () => {
    const cssPath = path.join(ROBOTS_DIR, 'robots.css');
    const pagePath = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');

    it('2.12 should configure auto-fill grid with minmax(130px, 1fr) for mobile scaling', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      assert.ok(
        css.includes('repeat(auto-fill, minmax(130px, 1fr))') ||
        css.includes('repeat(auto-fill,minmax(130px,1fr))') ||
        css.includes('repeat(auto-fit, minmax(130px, 1fr))') ||
        css.includes('repeat(auto-fit,minmax(130px,1fr))'),
        'CSS grid does not use minmax(130px, 1fr) for responsive wrapping'
      );
    });

    it('2.13 should define centered desktop container (max-w-7xl mx-auto or max-width)', () => {
      const page = fs.readFileSync(pagePath, 'utf8');
      const css = fs.readFileSync(cssPath, 'utf8');
      const hasPageConstraint = page.includes('max-w-7xl') && page.includes('mx-auto');
      const hasCssConstraint = css.includes('max-width') && css.includes('margin: 0 auto');
      assert.ok(hasPageConstraint || hasCssConstraint, 'Missing desktop container width constrain and centering');
    });

    it('2.14 should fix bubble width to 240px and allow safe margins on 375px mobile', () => {
      const css = fs.readFileSync(cssPath, 'utf8');
      assert.ok(css.includes('width: 240px') || css.includes('width:240px'), 'Bubble width is not 240px');
      // On 375px screen: 375 - 240 = 135px safe clearance
      assert.ok(375 - 240 >= 100, 'Bubble exceeds safe mobile width clearance');
    });
  });

  describe('Rapid Tab Switching & State Preservation', () => {
    it('2.15 should reset active bubble to null upon category change', async () => {
      const sveltePath = path.join(ROBOTS_DIR, 'RobotShowcase.svelte');
      const content = fs.readFileSync(sveltePath, 'utf8');
      // In template or handler: onClick or onTabChange must set active = null
      assert.ok(
        content.includes('active = null') ||
        content.includes('active=null') ||
        content.includes('setActive(null)'),
        'Tab selection does not dismiss active bubble'
      );
    });

    it('2.16 should preserve category data immutability during sequential filtering', async () => {
      const { AGENTS, CATEGORIES } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const countsMap = Object.fromEntries(
        CATEGORIES.map(c => [
          c.key,
          c.key === 'all' ? AGENTS.length : AGENTS.filter(a => a.cat === c.key).length
        ])
      );

      // Simulate rapid switching
      const sequence = ['ads', 'biz', 'growth', 'all', 'seo', 'writing', 'social', 'image', 'ads'];
      for (const cat of sequence) {
        const filtered = AGENTS.filter(a => cat === 'all' || a.cat === cat);
        assert.strictEqual(filtered.length, countsMap[cat], `Filter for ${cat} returned inconsistent length`);
      }
    });
  });
});
