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
const PAGE_SVELTE_PATH = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');
const ROBOTS_CSS_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css');

describe('Challenger 1 Empirical Verification: Milestone 2 — EzboAgents Homepage Relevance AI Overhaul', () => {
  assert.ok(fs.existsSync(PAGE_SVELTE_PATH), `+page.svelte must exist at ${PAGE_SVELTE_PATH}`);
  const pageSource = fs.readFileSync(PAGE_SVELTE_PATH, 'utf-8');

  // =========================================================================
  // 1. Svelte 5 Compiler AST & Diagnostics Verification
  // =========================================================================
  describe('1. Svelte 5 AST & Component Compilation', () => {
    it('1.1 should compile +page.svelte (client mode) with zero compiler errors', async () => {
      const compilerPath = path.join(WEB_DIR, 'node_modules', 'svelte', 'src', 'compiler', 'index.js');
      const { compile } = await import(pathToFileURL(compilerPath).href);
      
      const compiled = compile(pageSource, {
        filename: '+page.svelte',
        generate: 'client'
      });

      assert.ok(compiled.js, 'Compiled JS must be generated');
      const errors = (compiled.warnings || []).filter(w => w.code && w.code.includes('error'));
      assert.strictEqual(errors.length, 0, `Compiler errors found: ${JSON.stringify(errors)}`);
    });

    it('1.2 should compile +page.svelte (server mode) with zero compiler errors', async () => {
      const compilerPath = path.join(WEB_DIR, 'node_modules', 'svelte', 'src', 'compiler', 'index.js');
      const { compile } = await import(pathToFileURL(compilerPath).href);
      
      const compiled = compile(pageSource, {
        filename: '+page.svelte',
        generate: 'server'
      });

      assert.ok(compiled.js, 'Compiled JS must be generated');
      const errors = (compiled.warnings || []).filter(w => w.code && w.code.includes('error'));
      assert.strictEqual(errors.length, 0, `SSR compiler errors found: ${JSON.stringify(errors)}`);
    });

    it('1.3 should correctly utilize Svelte 5 runes ($state, $derived)', () => {
      assert.ok(pageSource.includes('$state<number | null>(0)'), 'openFaq rune state missing');
      assert.ok(pageSource.includes("$state<'monthly' | 'yearly'>('monthly')"), 'billingInterval rune state missing');
      assert.ok(pageSource.includes('$state(0)'), 'scrollY / scrollProgress state runes missing');
      assert.ok(pageSource.includes('$derived(scrollY > 280)'), 'showScrollTop derived rune missing');
    });

    it('1.4 should properly import all required components and stores', () => {
      const requiredImports = [
        "import Icon from '$lib/components/Icon.svelte';",
        "import BrandIcon from '$lib/components/BrandIcon.svelte';",
        "import Navbar from '$lib/components/Navbar.svelte';",
        "import Footer from '$lib/components/Footer.svelte';",
        "import PaymentMethods from '$lib/components/PaymentMethods.svelte';",
        "import RobotShowcase from '$lib/components/robots/RobotShowcase.svelte';",
        "import PricingCardsGrid from '$lib/components/PricingCardsGrid.svelte';",
        "import { isAuthenticated, currentUser } from '$lib/stores/userStore';",
        "import { plansStore, loadPublicPlans } from '$lib/stores/plansStore';"
      ];

      for (const imp of requiredImports) {
        assert.ok(pageSource.includes(imp), `Missing required import: ${imp}`);
      }
    });
  });

  // =========================================================================
  // 2. DOM & Visual Structure: Hero Section & Typography (R2)
  // =========================================================================
  describe('2. Hero Section Typography, Background & Layout (R2)', () => {
    it('2.1 should use pure crisp white canvas without muddy blue washes', () => {
      assert.ok(
        pageSource.includes('class="min-h-screen bg-white text-gray-900'),
        'Root container must be min-h-screen bg-white text-gray-900'
      );
      assert.ok(
        pageSource.includes('selection:bg-[#4F46E5] selection:text-white'),
        'Selection highlights must use Indigo #4F46E5'
      );
      assert.ok(
        pageSource.includes('<section class="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-white">'),
        'Hero section wrapper must have bg-white and generous padding'
      );
      // Ensure legacy background washes are completely eliminated
      assert.ok(!pageSource.includes('bg-[#F3F8FF]'), 'Legacy cyan/blue wash bg-[#F3F8FF] must not exist');
      assert.ok(!pageSource.includes('text-[#102A56]'), 'Legacy text-[#102A56] must not exist');
    });

    it('2.2 should render solid dark charcoal headline without gradient spans', () => {
      // Check headline text
      assert.ok(
        pageSource.includes('1 Master AI CEO Controlling'),
        'Hero must contain "1 Master AI CEO Controlling"'
      );
      assert.ok(
        pageSource.includes('75+ Business & Freelancer Helpers.'),
        'Hero must contain "75+ Business & Freelancer Helpers."'
      );
      assert.ok(
        pageSource.includes('<br class="hidden sm:inline" />'),
        'Hero must contain responsive line break'
      );

      // Check classes
      assert.ok(
        pageSource.includes('text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.15] max-w-4xl mx-auto break-words'),
        'Headline must match Relevance AI typography specification'
      );

      // Verify NO gradient text or cheap rainbow spans
      assert.ok(!pageSource.includes('blue-gradient-text'), 'Headline must not use blue-gradient-text');
      assert.ok(!pageSource.includes('font-serif italic'), 'Headline must not use serif italic fonts');
      assert.ok(!pageSource.includes('bg-clip-text text-transparent'), 'Headline must not use gradient text clipping');
    });

    it('2.3 should render neutral gray subtitle with bold dark accents', () => {
      assert.ok(
        pageSource.includes('text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mt-5'),
        'Subtitle must have neutral gray #6B7280 styling'
      );
      assert.ok(
        pageSource.includes('Every helper features its own custom options and interactive Studio chat'),
        'Subtitle narrative missing expected opening phrase'
      );
      assert.ok(
        pageSource.includes('<strong class="font-semibold text-gray-900">Master AI CEO</strong>'),
        'Master AI CEO must be bold dark accent'
      );
      assert.ok(
        pageSource.includes('<strong class="font-semibold text-gray-900">WhatsApp</strong>'),
        'WhatsApp must be bold dark accent'
      );
      assert.ok(
        pageSource.includes('<strong class="font-semibold text-gray-900">Telegram</strong>'),
        'Telegram must be bold dark accent'
      );
    });

    it('2.4 should render centered dual CTA buttons with unauthenticated & authenticated branches', () => {
      // Unauthenticated Primary Button
      assert.ok(
        pageSource.includes('href="/signup"'),
        'Unauthenticated CTA must link to /signup'
      );
      assert.ok(
        pageSource.includes('Unlock AI CEO + 75+ Helpers'),
        'Unauthenticated Primary CTA text mismatch'
      );
      assert.ok(
        pageSource.includes('bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-sm transition-all'),
        'Primary button must match Indigo #4F46E5 styling'
      );

      // Unauthenticated Secondary Button
      assert.ok(
        pageSource.includes('href="#helpers"'),
        'Secondary CTA must link to #helpers'
      );
      assert.ok(
        pageSource.includes('Explore All 75+ AI Helpers'),
        'Secondary CTA text mismatch'
      );
      assert.ok(
        pageSource.includes('bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-sm shadow-2xs transition-all'),
        'Secondary button must match bordered white styling'
      );

      // Authenticated Button handling
      assert.ok(
        pageSource.includes('href={$currentUser?.isSubscribed ? \'/dashboard\' : \'/plans\'}'),
        'Authenticated CTA must link dynamically to /dashboard or /plans'
      );
      assert.ok(
        pageSource.includes('Enter AI CEO Console'),
        'Authenticated CTA must include "Enter AI CEO Console"'
      );
      assert.ok(
        pageSource.includes('Select Your Plan & Unlock All 75+ Helpers'),
        'Authenticated unsubscribed CTA must include "Select Your Plan & Unlock All 75+ Helpers"'
      );
    });
  });

  // =========================================================================
  // 3. Ambient Mesh Integration Showcase Banner (R3)
  // =========================================================================
  describe('3. Ambient Mesh Integration Showcase Banner (R3)', () => {
    it('3.1 should render ambient mesh gradient container with precise classes', () => {
      const containerClass = 'bg-gradient-to-r from-purple-100/40 via-indigo-50/50 to-blue-100/40 border border-indigo-100/60 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xs mt-12 text-center';
      assert.ok(
        pageSource.includes(containerClass),
        `Mesh container class mismatch. Expected to find:\n${containerClass}`
      );
    });

    it('3.2 should define all 9 partner and channel badges in integrationBadges array', () => {
      const expectedBadges = [
        { id: 'whatsapp', name: 'WhatsApp Channel' },
        { id: 'telegram', name: 'Telegram Bot' },
        { id: 'gemini', name: 'Google Gemini' },
        { id: 'openai', name: 'OpenAI GPT-4o' },
        { id: 'claude', name: 'Anthropic Claude' },
        { id: 'deepseek', name: 'DeepSeek AI' },
        { id: 'grok', name: 'xAI Grok' },
        { id: 'openrouter', name: 'OpenRouter Multi-Model' },
        { id: 'replicate', name: 'Replicate Flux' }
      ];

      for (const b of expectedBadges) {
        assert.ok(
          pageSource.includes(`id: '${b.id}'`),
          `integrationBadges missing id: '${b.id}'`
        );
        assert.ok(
          pageSource.includes(`name: '${b.name}'`),
          `integrationBadges missing name: '${b.name}'`
        );
      }
    });

    it('3.3 should render circular badges with BrandIcon component', () => {
      assert.ok(
        pageSource.includes('class="w-11 h-11 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-2 mx-auto hover:scale-105 transition-transform"'),
        'Circular badge container styling mismatch'
      );
      assert.ok(
        pageSource.includes('<BrandIcon name={badge.id} size={20} />'),
        'Circular badge must render <BrandIcon name={badge.id} size={20} />'
      );
    });

    it('3.4 should include the verbatim micro-caption text beneath the badges', () => {
      const captionText = '75+ AI Specialists & 2,000+ Workflows orchestrated via WhatsApp, Telegram & Web';
      assert.ok(
        pageSource.includes(captionText),
        `Caption text mismatch. Expected: "${captionText}"`
      );
      assert.ok(
        pageSource.includes('class="text-xs sm:text-sm font-medium text-gray-500 mt-4 tracking-wide"'),
        'Caption typography class mismatch'
      );
    });
  });

  // =========================================================================
  // 4. Section Harmony & Preservation (R4 & Regression Safeguards)
  // =========================================================================
  describe('4. Preserved Sections Harmony (#helpers, #features, #pricing, #faq)', () => {
    it('4.1 should preserve #helpers section and RobotShowcase untouched', () => {
      assert.ok(
        pageSource.includes('<section id="helpers" class="scroll-mt-16 py-12 sm:py-20 relative overflow-hidden bg-white border-t border-gray-100">'),
        'Section #helpers wrapper class mismatch'
      );
      assert.ok(
        pageSource.includes('<RobotShowcase signupUrl="/signup" />'),
        'Must render <RobotShowcase signupUrl="/signup" /> inside #helpers'
      );
      assert.ok(
        pageSource.includes('class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"'),
        '#helpers container must maintain max-w-7xl layout'
      );
    });

    it('4.2 should preserve #features section with Relevance AI 3-step cards', () => {
      assert.ok(
        pageSource.includes('<section id="features"'),
        'Section #features missing'
      );
      assert.ok(
        pageSource.includes('Control Your AI CEO & 75+ Helpers via WhatsApp & Telegram'),
        'Features heading missing'
      );
      assert.ok(
        pageSource.includes('Link WhatsApp or Telegram'),
        'Step 01 missing'
      );
      assert.ok(
        pageSource.includes('Instruct AI CEO or #01–#75'),
        'Step 02 missing'
      );
      assert.ok(
        pageSource.includes('Instant Executive Output'),
        'Step 03 missing'
      );

      // Card styling
      assert.ok(
        pageSource.includes('bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs hover:shadow-sm hover:border-gray-300 transition-all space-y-4'),
        'Features cards must use modern hairline border cards'
      );
      assert.ok(
        pageSource.includes('w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-900 font-mono font-semibold text-sm'),
        'Features cards must use minimalist step number badges'
      );
    });

    it('4.3 should preserve #pricing section rendering dynamic PricingCardsGrid', () => {
      assert.ok(
        pageSource.includes('<section id="pricing"'),
        'Section #pricing missing'
      );
      assert.ok(
        pageSource.includes('<PricingCardsGrid context="landing" bind:selectedInterval={billingInterval} />'),
        'Must render PricingCardsGrid component'
      );
      assert.ok(
        pageSource.includes('<PaymentMethods class="pt-2" />'),
        'Must render PaymentMethods component'
      );
      assert.ok(
        pageSource.includes('Instant Activation • 100% Secure Checkout • 3-Day Grace Period'),
        'Must render trust badge notice'
      );
    });

    it('4.4 should preserve #faq section with all 5 interactive accordion items', () => {
      assert.ok(
        pageSource.includes('<section id="faq"'),
        'Section #faq missing'
      );
      assert.ok(
        pageSource.includes('Frequently Asked Questions'),
        'FAQ heading missing'
      );

      const expectedFaqKeywords = [
        'What is the Master AI CEO and how does it control all 75+ AI Helpers?',
        'Will I get newly added AI Helpers in the same subscription?',
        'What is the difference between the 75 AI Helpers and Agents Store bots?',
        'What is the BYOK (Bring Your Own Key) plan vs All-Inclusive Cloud?',
        'How do payments work and how fast is activation?'
      ];

      for (const kw of expectedFaqKeywords) {
        assert.ok(pageSource.includes(kw), `FAQ missing question: ${kw}`);
      }

      // Interactive toggle logic
      assert.ok(
        pageSource.includes('onclick={() => (openFaq = openFaq === i ? null : i)}'),
        'FAQ toggle handler missing'
      );
      assert.ok(
        pageSource.includes('rotate-90 text-[#4F46E5]'),
        'FAQ open active chevron accent missing'
      );
    });

    it('4.5 should render floating scroll-to-top button with circular SVG progress ring', () => {
      assert.ok(
        pageSource.includes('onclick={scrollToTop}'),
        'Scroll to top button missing onclick handler'
      );
      assert.ok(
        pageSource.includes('stroke="#4F46E5"'),
        'Progress ring stroke must be Indigo #4F46E5'
      );
      assert.ok(
        pageSource.includes('stroke-dasharray="113.097"'),
        'Progress ring stroke-dasharray missing'
      );
    });
  });

  // =========================================================================
  // 5. Checksum & Immutability Verification
  // =========================================================================
  describe('5. Immutability & Checksum Verification', () => {
    it('5.1 should verify robots.css is 100% byte-for-byte untouched', () => {
      assert.ok(fs.existsSync(ROBOTS_CSS_PATH), 'robots.css must exist');
      const cssContent = fs.readFileSync(ROBOTS_CSS_PATH);
      const hash = crypto.createHash('sha256').update(cssContent).digest('hex');
      const EXPECTED_HASH = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';
      assert.strictEqual(
        hash,
        EXPECTED_HASH,
        `robots.css SHA256 altered! Expected: ${EXPECTED_HASH}, got: ${hash}`
      );
    });
  });
});
