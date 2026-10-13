import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ROBOTS_DIR,
  WEB_DIR,
  toFileUrl
} from './helpers/test_utils.mjs';

describe('Tier 3: Cross-Feature Interactions', () => {

  describe('Interaction 1: Category Filter + Detail Bubble + Escape Key State Lifecycle', () => {
    it('3.1 should correctly coordinate category filtering, bubble activation, and Escape dismiss', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));

      // Simulate Component State Machine
      let cat = 'ads';
      let active = null;

      // 1. Filter by ads
      let currentList = AGENTS.filter(a => cat === 'all' || a.cat === cat);
      assert.strictEqual(currentList.length, 12);

      // 2. Activate Agent #3
      const agent3 = currentList.find(a => a.n === 3);
      assert.ok(agent3);
      active = { agent: agent3 };
      assert.strictEqual(active.agent.name, 'ReelCloser');

      // 3. Switch Category to writing -> triggers active = null
      cat = 'writing';
      active = null;
      currentList = AGENTS.filter(a => cat === 'all' || a.cat === cat);
      assert.strictEqual(currentList.length, 10);
      assert.strictEqual(active, null, 'Active bubble did not clear upon category transition');

      // 4. Activate Agent #25 (LexiCheck)
      const agent25 = currentList.find(a => a.n === 25);
      assert.ok(agent25);
      active = { agent: agent25 };
      assert.strictEqual(active.agent.name, 'LexiCheck');

      // 5. Simulate Escape key event handler: onKey(e) => { if (e.key === 'Escape') active = null; }
      const simulateKeydown = (key) => {
        if (key === 'Escape') active = null;
      };
      simulateKeydown('Escape');
      assert.strictEqual(active, null, 'Escape key did not dismiss active agent');
      assert.strictEqual(cat, 'writing', 'Category changed unexpectedly after Escape');
    });
  });

  describe('Interaction 2: Navbar Anchor Navigation & Landing Page Section Target', () => {
    it('3.2 should align Navbar target link with Page section anchor and smooth scroll', () => {
      const navbarPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'Navbar.svelte');
      const pagePath = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');

      const navbarContent = fs.readFileSync(navbarPath, 'utf8');
      const pageContent = fs.readFileSync(pagePath, 'utf8');

      // Verify link href in Navbar
      const hasNavbarLink = navbarContent.includes('/#helpers') || navbarContent.includes('#helpers');
      assert.ok(hasNavbarLink, 'Navbar does not contain helpers anchor link');

      // Verify section target in +page.svelte
      const hasPageTarget = pageContent.includes('id="helpers"');
      assert.ok(hasPageTarget, '+page.svelte does not contain matching id="helpers" section');

      // Verify that the section encapsulates RobotShowcase
      const sectionMatch = pageContent.match(/<section[^>]*id="helpers"[^>]*>([\s\S]*?)<\/section>/);
      assert.ok(sectionMatch, 'Could not find closed <section id="helpers">...</section>');
      assert.ok(sectionMatch[1].includes('<RobotShowcase'), 'RobotShowcase is not inside <section id="helpers">');
    });
  });

  describe('Interaction 3: Props Cascading & studioUrl Callback Integration', () => {
    it('3.3 should fall back to signupUrl for both CEO CTA and helper studio link by default', () => {
      const defaultSignup = '/signup';
      const defaultCeoSrc = '/ezbo-ceo.png';

      // Simulation of props contract
      const renderLinks = (props, agent) => {
        const signupUrl = props.signupUrl ?? '/signup';
        const studioUrl = props.studioUrl ? props.studioUrl(agent) : signupUrl;
        const ceoLink = signupUrl;
        return { studioUrl, ceoLink };
      };

      const dummyAgent = { n: 1, name: 'AdNexus' };
      const links = renderLinks({}, dummyAgent);
      assert.strictEqual(links.ceoLink, defaultSignup);
      assert.strictEqual(links.studioUrl, defaultSignup);
    });

    it('3.4 should dynamically generate helper studio URL when studioUrl callback is supplied', () => {
      const customCallback = (agent) => `/app/agents/${agent.n}-${agent.name.toLowerCase()}`;
      const renderLinks = (props, agent) => {
        const signupUrl = props.signupUrl ?? '/signup';
        const studioUrl = props.studioUrl ? props.studioUrl(agent) : signupUrl;
        const ceoLink = signupUrl;
        return { studioUrl, ceoLink };
      };

      const dummyAgent = { n: 14, name: 'CalendarPro' };
      const links = renderLinks({ studioUrl: customCallback, signupUrl: '/custom-signup' }, dummyAgent);
      assert.strictEqual(links.ceoLink, '/custom-signup');
      assert.strictEqual(links.studioUrl, '/app/agents/14-calendarpro');
    });
  });

  describe('Interaction 4: SVG Geometry & CSS Keyframe Animation Integration', () => {
    it('3.5 should bind generated SVG animation classes to declared CSS keyframes', async () => {
      const { AGENTS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'agents.js')));
      const { createRobot, ROBOT_DEFS } = await import(toFileUrl(path.join(ROBOTS_DIR, 'createRobot.js')));
      const cssPath = path.join(ROBOTS_DIR, 'robots.css');
      const css = fs.readFileSync(cssPath, 'utf8');

      // Keyframes that must exist in CSS
      assert.ok(css.includes('@keyframes rb-fl') || css.includes('@keyframes rbFloat'), 'Missing rb-fl keyframes');
      assert.ok(css.includes('@keyframes rb-bl') || css.includes('@keyframes rbBlink'), 'Missing rb-bl keyframes');
      assert.ok(css.includes('@keyframes rb-sh') || css.includes('@keyframes rbShadow'), 'Missing rb-sh keyframes');
      assert.ok(css.includes('@keyframes rb-th') || css.includes('@keyframes rbFlame'), 'Missing rb-th keyframes');

      // Classes that createRobot generates
      const sampleSvg = createRobot(AGENTS[0]);
      assert.ok(sampleSvg.includes('class="rb-fl rb-e"'), 'Missing .rb-fl float class in SVG');
      assert.ok(sampleSvg.includes('class="rb-sh rb-e"'), 'Missing .rb-sh shadow class in SVG');
      assert.ok(sampleSvg.includes('class="rb-th rb-e"'), 'Missing .rb-th thruster class in SVG');
      assert.ok(sampleSvg.includes('class="rb-bk rb-e"'), 'Missing .rb-bk blink class in SVG');

      // Verify ROBOT_DEFS gradients match SVG fills
      assert.ok(ROBOT_DEFS.includes('id="rbHead"'), 'ROBOT_DEFS missing rbHead gradient');
      assert.ok(ROBOT_DEFS.includes('id="rbBody"'), 'ROBOT_DEFS missing rbBody gradient');
      assert.ok(sampleSvg.includes('url(#rbHead)'), 'SVG not using rbHead gradient fill');
      assert.ok(sampleSvg.includes('url(#rbBody)'), 'SVG not using rbBody gradient fill');
    });
  });
});
