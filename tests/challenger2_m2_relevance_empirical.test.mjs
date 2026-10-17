import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');
const PAGE_PATH = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');
const ROBOTS_CSS_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css');
const ROBOT_SHOWCASE_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'RobotShowcase.svelte');
const AGENTS_JS_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'agents.js');
const CREATE_ROBOT_JS_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'createRobot.js');

describe('Challenger 2 Empirical Verification: Milestone M2 (Homepage Relevance AI UI Overhaul)', () => {
  assert.ok(fs.existsSync(PAGE_PATH), '+page.svelte must exist');
  assert.ok(fs.existsSync(ROBOTS_CSS_PATH), 'robots.css must exist');
  const pageSource = fs.readFileSync(PAGE_PATH, 'utf-8');
  const robotsCssContent = fs.readFileSync(ROBOTS_CSS_PATH);

  // =========================================================================
  // 1. Strict Test Invariants Mandated by Dispatch
  // =========================================================================
  describe('1. Strict Invariants Mandated by Dispatch', () => {
    it('1.1 should satisfy regex /<section[^>]*id="helpers"[^>]*overflow-hidden/', () => {
      const regex = /<section[^>]*id="helpers"[^>]*overflow-hidden/;
      assert.ok(
        regex.test(pageSource),
        `Regex /<section[^>]*id="helpers"[^>]*overflow-hidden/ failed to match in +page.svelte`
      );
    });

    it('1.2 should satisfy page.includes("max-w-7xl") && page.includes("mx-auto")', () => {
      const hasMaxW7xl = pageSource.includes('max-w-7xl');
      const hasMxAuto = pageSource.includes('mx-auto');
      assert.ok(hasMaxW7xl, '+page.svelte missing max-w-7xl constraint');
      assert.ok(hasMxAuto, '+page.svelte missing mx-auto centering');
    });

    it('1.3 should satisfy content.includes("href=\\"#helpers\\"")', () => {
      const hasHrefHelpers = pageSource.includes('href="#helpers"');
      assert.ok(
        hasHrefHelpers,
        '+page.svelte missing anchor link href="#helpers" targeting the helpers section'
      );
    });

    it('1.4 should verify robots.css SHA256 checksum is untouched (549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be)', () => {
      const actualHash = crypto.createHash('sha256').update(robotsCssContent).digest('hex');
      const expectedHash = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';
      assert.strictEqual(
        actualHash,
        expectedHash,
        `robots.css SHA256 checksum mismatch! Expected ${expectedHash}, got ${actualHash}`
      );
    });

    it('1.5 should verify other robot showcase assets are present and intact', () => {
      assert.ok(fs.existsSync(ROBOT_SHOWCASE_PATH), 'RobotShowcase.svelte must exist');
      assert.ok(fs.existsSync(AGENTS_JS_PATH), 'agents.js must exist');
      assert.ok(fs.existsSync(CREATE_ROBOT_JS_PATH), 'createRobot.js must exist');
    });
  });

  // =========================================================================
  // 2. Hero Section & Relevance AI Design Tokens (R2)
  // =========================================================================
  describe('2. Hero Section Relevance AI Visual & Typographic Standards', () => {
    it('2.1 should use pure white background without legacy blue/cyan washes', () => {
      assert.ok(!pageSource.includes('bg-[#F3F8FF]'), 'Must eliminate legacy bg-[#F3F8FF] wash');
      assert.ok(!pageSource.includes('text-[#102A56]'), 'Must eliminate legacy text-[#102A56]');
      assert.ok(pageSource.includes('bg-white'), 'Must have bg-white canvas');
    });

    it('2.2 should render solid charcoal #111827 / text-gray-900 headline without cheap text gradients', () => {
      assert.ok(!pageSource.includes('blue-gradient-text'), 'Must eliminate blue-gradient-text');
      assert.ok(!pageSource.includes('bg-clip-text text-transparent'), 'Must eliminate text-transparent gradients in headline');

      const headlineMatch = pageSource.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      assert.ok(headlineMatch, 'Must contain an <h1> tag');
      const headlineClass = pageSource.slice(pageSource.indexOf('<h1'), pageSource.indexOf('>', pageSource.indexOf('<h1')));

      assert.ok(headlineClass.includes('text-gray-900'), 'Headline must use text-gray-900 (#111827)');
      assert.ok(headlineClass.includes('font-bold'), 'Headline must use font-bold');
      assert.ok(headlineClass.includes('tracking-tight'), 'Headline must use tight tracking');
      assert.ok(headlineMatch[1].includes('1 Master AI CEO Controlling'), 'Headline text missing CEO prefix');
      assert.ok(headlineMatch[1].includes('75+ Business & Freelancer Helpers'), 'Headline text missing 75+ helpers suffix');
    });

    it('2.3 should render neutral gray subtitle with bold dark emphasis tags', () => {
      const pMatch = pageSource.match(/<p class="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mt-5">([\s\S]*?)<\/p>/);
      assert.ok(pMatch, 'Subtitle paragraph missing expected classes');
      const pContent = pMatch[1];
      assert.ok(pContent.includes('Master AI CEO'), 'Subtitle must reference Master AI CEO');
      assert.ok(pContent.includes('WhatsApp'), 'Subtitle must reference WhatsApp');
      assert.ok(pContent.includes('Telegram'), 'Subtitle must reference Telegram');
      assert.ok(pContent.includes('75+ helpers'), 'Subtitle must reference 75+ helpers');
    });

    it('2.4 should render centered dual CTA buttons matching Relevance AI button specs', () => {
      // Primary button
      assert.ok(pageSource.includes('bg-[#4F46E5]'), 'Primary CTA must use Indigo #4F46E5');
      assert.ok(pageSource.includes('hover:bg-[#4338CA]'), 'Primary CTA must use #4338CA hover state');
      assert.ok(pageSource.includes('href="/signup"'), 'Unauthenticated primary CTA must link to /signup');

      // Secondary button
      assert.ok(pageSource.includes('bg-white hover:bg-gray-50'), 'Secondary CTA must be white with hover:bg-gray-50');
      assert.ok(pageSource.includes('border border-gray-200'), 'Secondary CTA must have 1px border');
      assert.ok(pageSource.includes('href="#helpers"'), 'Secondary CTA must link to #helpers');
      assert.ok(pageSource.includes('Explore All 75+ AI Helpers'), 'Secondary CTA must have descriptive text');
    });

    it('2.5 should handle authenticated state for CTA button properly', () => {
      assert.ok(pageSource.includes('{#if $isAuthenticated}'), 'Must check $isAuthenticated store');
      assert.ok(
        pageSource.includes('$currentUser?.isSubscribed ? \'/dashboard\' : \'/plans\'') ||
        pageSource.includes("$currentUser?.isSubscribed ? '/dashboard' : '/plans'"),
        'Must route subscribed users to /dashboard and unsubscribed to /plans'
      );
    });
  });

  // =========================================================================
  // 3. Ambient Mesh Integration Showcase Banner (R3)
  // =========================================================================
  describe('3. Ambient Mesh Integration Showcase Banner', () => {
    it('3.1 should define ambient mesh container with specific gradient and border', () => {
      assert.ok(
        pageSource.includes('from-purple-100/40 via-indigo-50/50 to-blue-100/40'),
        'Mesh banner missing ambient gradient'
      );
      assert.ok(
        pageSource.includes('border border-indigo-100/60 rounded-3xl'),
        'Mesh banner missing border or rounded-3xl'
      );
    });

    it('3.2 should enumerate all 9 official partner/channel integration badges', () => {
      const requiredBadges = [
        'whatsapp',
        'telegram',
        'gemini',
        'openai',
        'claude',
        'deepseek',
        'grok',
        'openrouter',
        'replicate'
      ];

      for (const badge of requiredBadges) {
        assert.ok(
          pageSource.includes(`'${badge}'`) || pageSource.includes(`"${badge}"`),
          `integrationBadges array missing partner id: "${badge}"`
        );
      }
    });

    it('3.3 should render circular floating white partner badges with BrandIcon', () => {
      assert.ok(
        pageSource.includes('w-11 h-11 bg-white rounded-full shadow-sm border border-gray-100'),
        'Missing circular floating white badge styling'
      );
      assert.ok(
        pageSource.includes('<BrandIcon name={badge.id} size={20} />'),
        'Must render BrandIcon with size 20 for each badge'
      );
    });

    it('3.4 should render the exact required micro-caption text', () => {
      const expectedCaption = '75+ AI Specialists & 2,000+ Workflows orchestrated via WhatsApp, Telegram & Web';
      assert.ok(
        pageSource.includes(expectedCaption),
        `Missing exact micro-caption: "${expectedCaption}"`
      );
    });
  });

  // =========================================================================
  // 4. Section Harmony: Helpers, Features, Pricing & FAQ (R4)
  // =========================================================================
  describe('4. Section Styling Harmony (Helpers, Features, Pricing, FAQ)', () => {
    it('4.1 Helpers section wraps RobotShowcase cleanly on white surface with border-t', () => {
      const helpersMatch = pageSource.match(/<section id="helpers"[^>]*>([\s\S]*?)<\/section>/);
      assert.ok(helpersMatch, 'Missing <section id="helpers">...</section>');
      const sectionHtml = helpersMatch[0];

      assert.ok(sectionHtml.includes('bg-white'), '#helpers section must have bg-white');
      assert.ok(sectionHtml.includes('border-t border-gray-100'), '#helpers section must have border-t border-gray-100');
      assert.ok(sectionHtml.includes('max-w-7xl mx-auto'), '#helpers must center content in max-w-7xl mx-auto');
      assert.ok(sectionHtml.includes('<RobotShowcase signupUrl="/signup" />'), '#helpers must mount RobotShowcase with signupUrl');
    });

    it('4.2 Features section contains 3 minimalist cards for WhatsApp & Telegram orchestration', () => {
      assert.ok(pageSource.includes('id="features"'), 'Features section missing id="features"');
      assert.ok(pageSource.includes('01'), 'Step 1 badge missing');
      assert.ok(pageSource.includes('02'), 'Step 2 badge missing');
      assert.ok(pageSource.includes('03'), 'Step 3 badge missing');
      assert.ok(pageSource.includes('Link WhatsApp or Telegram'), 'Missing Step 1 title');
      assert.ok(pageSource.includes('Instruct AI CEO or #01–#75'), 'Missing Step 2 title');
      assert.ok(pageSource.includes('Instant Executive Output'), 'Missing Step 3 title');
      assert.ok(pageSource.includes('#01'), 'Missing #01 highlight');
      assert.ok(pageSource.includes('#75'), 'Missing #75 highlight');
    });

    it('4.3 Pricing section integrates PricingCardsGrid and PaymentMethods cleanly', () => {
      assert.ok(pageSource.includes('id="pricing"'), 'Pricing section missing id="pricing"');
      assert.ok(
        pageSource.includes('<PricingCardsGrid context="landing" bind:selectedInterval={billingInterval} />'),
        'Pricing section must render PricingCardsGrid component'
      );
      assert.ok(
        pageSource.includes('<PaymentMethods class="pt-2" />'),
        'Pricing section must render PaymentMethods component'
      );
    });

    it('4.4 FAQ accordion has interactive toggle and accessible chevron animation', () => {
      assert.ok(pageSource.includes('id="faq"'), 'FAQ section missing id="faq"');
      assert.ok(pageSource.includes('openFaq = openFaq === i ? null : i'), 'FAQ toggle click handler missing');
      assert.ok(pageSource.includes('rotate-90 text-[#4F46E5]'), 'FAQ expanded chevron class missing');
      assert.ok(pageSource.includes('faqs = ['), 'FAQ items array must be defined');
    });

    it('4.5 Floating scroll-to-top button includes SVG progress circle and percentage', () => {
      assert.ok(pageSource.includes('aria-label="Scroll to top of page'), 'Scroll top button missing accessible aria-label');
      assert.ok(pageSource.includes('stroke="#4F46E5"'), 'SVG progress circle missing Indigo stroke');
      assert.ok(pageSource.includes('stroke-dasharray="113.097"'), 'SVG progress circle missing stroke-dasharray circumference');
      assert.ok(pageSource.includes('stroke-dashoffset='), 'SVG progress circle missing dynamic stroke-dashoffset');
      assert.ok(pageSource.includes('{Math.round(scrollProgress)}%'), 'Scroll percentage display missing');
    });
  });

  // =========================================================================
  // 5. Adversarial Svelte 5 Compilation & Syntax Health
  // =========================================================================
  describe('5. Svelte 5 Compiler AST Diagnostics', () => {
    it('5.1 should compile +page.svelte with official Svelte 5 compiler without error', async () => {
      const { pathToFileURL } = await import('node:url');
      const compilerPath = path.join(WEB_DIR, 'node_modules', 'svelte', 'src', 'compiler', 'index.js');
      const { compile } = await import(pathToFileURL(compilerPath).href);

      const result = compile(pageSource, {
        filename: '+page.svelte',
        generate: 'client'
      });

      assert.ok(result.js, 'Compiled JS should exist');
      const criticalWarnings = (result.warnings || []).filter(w =>
        w.code && (w.code.includes('error') || w.code.includes('unclosed'))
      );
      assert.strictEqual(criticalWarnings.length, 0, `Compiler reported critical warnings: ${JSON.stringify(criticalWarnings)}`);
    });
  });
});
