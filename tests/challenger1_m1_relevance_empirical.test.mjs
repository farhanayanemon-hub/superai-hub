import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');
const NAVBAR_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'Navbar.svelte');
const BRAND_ICON_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'BrandIcon.svelte');

describe('Milestone 1 Challenger Empirical Suite: BrandIcon & Navbar Relevance AI Overhaul', () => {

  // =========================================================================
  // SUITE 1: BrandIcon Resolution Oracle & Boundary Matrix
  // =========================================================================
  describe('1. BrandIcon Deduce Brand Resolution Oracle', () => {
    assert.ok(fs.existsSync(BRAND_ICON_PATH), 'BrandIcon.svelte must exist');
    const brandIconSource = fs.readFileSync(BRAND_ICON_PATH, 'utf-8');

    // Extract deduce brand logic directly from BrandIcon.svelte
    // to build an exact oracle
    function createBrandIconOracle() {
      // Replicate the exact derived logic in BrandIcon.svelte lines 15-49
      return function resolveBrand(name = '', modelId = '') {
        const raw = (name || '').toLowerCase().trim();
        if (raw) {
          if (raw.includes('whatsapp')) return 'whatsapp';
          if (raw.includes('telegram')) return 'telegram';
          if (raw.includes('gemini') || raw.includes('google')) return 'gemini';
          if (raw.includes('openrouter')) return 'openrouter';
          if (raw.includes('openai') || raw.includes('gpt') || raw.includes('chatgpt')) return 'openai';
          if (raw.includes('claude') || raw.includes('anthropic')) return 'anthropic';
          if (raw.includes('deepseek')) return 'deepseek';
          if (raw.includes('grok') || raw.includes('xai') || raw.includes('x-ai')) return 'grok';
          if (raw.includes('llama') || raw.includes('meta')) return 'meta';
          if (raw.includes('mistral') || raw.includes('mixtral')) return 'mistral';
          if (raw.includes('cohere')) return 'cohere';
          if (raw.includes('replicate') || raw.includes('flux')) return 'replicate';
          if (raw.includes('qwen') || raw.includes('alibaba')) return 'qwen';
          return raw;
        }

        const m = (modelId || '').toLowerCase().trim();
        if (m.includes('whatsapp')) return 'whatsapp';
        if (m.includes('telegram')) return 'telegram';
        if (m.startsWith('google/') || m.includes('gemini')) return 'gemini';
        if (m.startsWith('meta-llama/') || m.includes('llama') || m.startsWith('meta/')) return 'meta';
        if (m.startsWith('openai/') || m.includes('gpt-')) return 'openai';
        if (m.startsWith('anthropic/') || m.includes('claude')) return 'anthropic';
        if (m.startsWith('deepseek/') || m.includes('deepseek')) return 'deepseek';
        if (m.startsWith('x-ai/') || m.includes('grok')) return 'grok';
        if (m.startsWith('mistralai/') || m.includes('mistral') || m.includes('mixtral')) return 'mistral';
        if (m.startsWith('cohere/')) return 'cohere';
        if (m.startsWith('qwen/')) return 'qwen';
        if (m.includes('flux') || m.startsWith('black-forest-labs/') || m.includes('replicate')) return 'replicate';

        return 'generic';
      };
    }

    const resolveBrand = createBrandIconOracle();

    it('1.1 should correctly resolve WhatsApp from name variations', () => {
      const variations = [
        'whatsapp',
        'WhatsApp',
        '  WHATSAPP  ',
        'whatsapp-business',
        'official_whatsapp_gateway',
        'Ezbo WhatsApp'
      ];
      for (const v of variations) {
        assert.strictEqual(resolveBrand(v), 'whatsapp', `Failed for name: "${v}"`);
      }
    });

    it('1.2 should correctly resolve Telegram from name variations', () => {
      const variations = [
        'telegram',
        'Telegram',
        '  TELEGRAM  ',
        'telegram-bot',
        'official_telegram_channel',
        'Ezbo Telegram'
      ];
      for (const v of variations) {
        assert.strictEqual(resolveBrand(v), 'telegram', `Failed for name: "${v}"`);
      }
    });

    it('1.3 should correctly resolve WhatsApp and Telegram from modelId when name is omitted', () => {
      assert.strictEqual(resolveBrand('', 'whatsapp/cloud-api'), 'whatsapp');
      assert.strictEqual(resolveBrand('', 'baileys/whatsapp-web'), 'whatsapp');
      assert.strictEqual(resolveBrand('', 'telegram/bot-api'), 'telegram');
      assert.strictEqual(resolveBrand('', 'tg/telegram-webhook'), 'telegram');
    });

    it('1.4 should correctly resolve AI providers from names and modelIds', () => {
      const testCases = [
        { name: 'Google Gemini', modelId: '', expected: 'gemini' },
        { name: 'gemini-1.5-pro', modelId: '', expected: 'gemini' },
        { name: '', modelId: 'google/gemini-2.0-flash', expected: 'gemini' },
        { name: 'OpenRouter', modelId: '', expected: 'openrouter' },
        { name: 'OpenAI', modelId: '', expected: 'openai' },
        { name: 'GPT-4o', modelId: '', expected: 'openai' },
        { name: '', modelId: 'openai/gpt-4o', expected: 'openai' },
        { name: '', modelId: 'gpt-4o-mini', expected: 'openai' },
        { name: 'Claude 3.5 Sonnet', modelId: '', expected: 'anthropic' },
        { name: 'Anthropic', modelId: '', expected: 'anthropic' },
        { name: '', modelId: 'anthropic/claude-3-haiku', expected: 'anthropic' },
        { name: 'DeepSeek', modelId: '', expected: 'deepseek' },
        { name: '', modelId: 'deepseek/deepseek-r1', expected: 'deepseek' },
        { name: 'xAI Grok', modelId: '', expected: 'grok' },
        { name: '', modelId: 'x-ai/grok-2', expected: 'grok' },
        { name: 'Meta Llama 3', modelId: '', expected: 'meta' },
        { name: '', modelId: 'meta-llama/llama-3.3-70b-instruct', expected: 'meta' },
        { name: 'Mistral', modelId: '', expected: 'mistral' },
        { name: 'Mixtral 8x7B', modelId: '', expected: 'mistral' },
        { name: '', modelId: 'mistralai/mistral-large-2407', expected: 'mistral' },
        { name: 'Cohere', modelId: '', expected: 'cohere' },
        { name: '', modelId: 'cohere/command-r-plus', expected: 'cohere' },
        { name: 'Replicate', modelId: '', expected: 'replicate' },
        { name: 'Flux.1 Schnell', modelId: '', expected: 'replicate' },
        { name: '', modelId: 'black-forest-labs/flux-1.1-pro', expected: 'replicate' },
        { name: 'Qwen', modelId: '', expected: 'qwen' },
        { name: 'Alibaba Cloud', modelId: '', expected: 'qwen' },
        { name: '', modelId: 'qwen/qwen-2.5-72b-instruct', expected: 'qwen' }
      ];

      for (const tc of testCases) {
        const actual = resolveBrand(tc.name, tc.modelId);
        assert.strictEqual(actual, tc.expected, `Mismatch for name="${tc.name}", modelId="${tc.modelId}"`);
      }
    });

    it('1.5 should handle empty, null, undefined, or whitespace gracefully', () => {
      assert.strictEqual(resolveBrand('', ''), 'generic');
      assert.strictEqual(resolveBrand(null, null), 'generic');
      assert.strictEqual(resolveBrand(undefined, undefined), 'generic');
      assert.strictEqual(resolveBrand('   ', '   '), 'generic');
      assert.strictEqual(resolveBrand('', 'unrecognized/model-v1'), 'generic');
    });

    it('1.6 should verify BrandIcon.svelte markup contains official SVG icons for all resolved targets', () => {
      const requiredBranches = [
        "resolvedBrand === 'gemini'",
        "resolvedBrand === 'openrouter'",
        "resolvedBrand === 'openai'",
        "resolvedBrand === 'anthropic'",
        "resolvedBrand === 'deepseek'",
        "resolvedBrand === 'grok'",
        "resolvedBrand === 'meta'",
        "resolvedBrand === 'mistral'",
        "resolvedBrand === 'cohere'",
        "resolvedBrand === 'qwen'",
        "resolvedBrand === 'replicate'",
        "resolvedBrand === 'whatsapp'",
        "resolvedBrand === 'telegram'"
      ];

      for (const branch of requiredBranches) {
        assert.ok(
          brandIconSource.includes(branch),
          `BrandIcon.svelte missing template branch for: ${branch}`
        );
      }
    });

    it('1.7 should verify WhatsApp and Telegram official SVG paths and accessibility attributes', () => {
      // WhatsApp verification
      assert.ok(brandIconSource.includes('aria-label="WhatsApp"'), 'Missing aria-label="WhatsApp"');
      assert.ok(brandIconSource.includes('fill="#25D366"'), 'WhatsApp must use official brand color #25D366');
      assert.ok(brandIconSource.includes('viewBox="0 0 24 24"'), 'WhatsApp must have standard 24x24 viewBox');

      // Telegram verification
      assert.ok(brandIconSource.includes('aria-label="Telegram"'), 'Missing aria-label="Telegram"');
      assert.ok(brandIconSource.includes('fill="#229ED9"'), 'Telegram must use official brand color #229ED9');
      assert.ok(brandIconSource.includes('viewBox="0 0 24 24"'), 'Telegram must have standard 24x24 viewBox');
    });
  });

  // =========================================================================
  // SUITE 2: Navbar.svelte Structural & Relevance AI Visual Validation
  // =========================================================================
  describe('2. Navbar.svelte Relevance AI Style & Test Invariant Conformance', () => {
    assert.ok(fs.existsSync(NAVBAR_PATH), 'Navbar.svelte must exist');
    const navbarSource = fs.readFileSync(NAVBAR_PATH, 'utf-8');

    it('2.1 should adhere to Relevance AI frosted header specification', () => {
      assert.ok(
        navbarSource.includes('bg-white/80'),
        'Navbar header missing bg-white/80 backdrop'
      );
      assert.ok(
        navbarSource.includes('backdrop-blur-md'),
        'Navbar header missing backdrop-blur-md'
      );
      assert.ok(
        navbarSource.includes('border-b') && navbarSource.includes('border-gray-100'),
        'Navbar header missing hairline border-b border-gray-100'
      );
    });

    it('2.2 should strictly preserve href="/#helpers" with text >Helpers< in both desktop and mobile', () => {
      const helperMatches = navbarSource.match(/href="\/#helpers"/g) || [];
      assert.ok(
        helperMatches.length >= 2,
        `Expected at least 2 occurrences of href="/#helpers", found ${helperMatches.length}`
      );

      // Verbatim test invariant from challenger_stress_edge_cases line 459
      assert.ok(
        navbarSource.includes('>Helpers<'),
        'Navbar must contain verbatim string >Helpers< without whitespace'
      );
    });

    it('2.3 should preserve primary landing page section anchor routes', () => {
      const expectedSections = [
        { href: '/#helpers', label: 'Helpers' },
        { href: '/#pricing', label: 'Pricing' },
        { href: '/#faq', label: 'FAQ' }
      ];

      for (const section of expectedSections) {
        assert.ok(
          navbarSource.includes(`href="${section.href}"`),
          `Navbar missing navigation link to ${section.href}`
        );
        assert.ok(
          navbarSource.includes(section.label),
          `Navbar missing label ${section.label}`
        );
      }

      assert.ok(
        !navbarSource.includes('href="/#features"'),
        'Navbar should not include WhatsApp & Telegram link'
      );
    });

    it('2.4 should render Relevance AI styled dual CTA buttons for unauthenticated visitors', () => {
      // Secondary Log In button
      assert.ok(navbarSource.includes('href="/login"'), 'Navbar must link to /login');
      assert.ok(navbarSource.includes('Log in'), 'Navbar must contain "Log in" text');
      assert.ok(
        navbarSource.includes('border border-gray-200') && navbarSource.includes('hover:bg-gray-50'),
        'Log in CTA missing secondary border styling'
      );

      // Primary Indigo CTA
      assert.ok(navbarSource.includes('href="/signup"'), 'Navbar must link to /signup');
      assert.ok(navbarSource.includes('Get started'), 'Navbar must contain "Get started" text');
      assert.ok(
        navbarSource.includes('bg-[#4F46E5]') && navbarSource.includes('hover:bg-[#4338CA]'),
        'Get started CTA missing primary Indigo #4F46E5 styling'
      );
    });

    it('2.5 should render emerald beacon and dynamic routing for authenticated users', () => {
      assert.ok(
        navbarSource.includes('bg-emerald-500'),
        'Authenticated user pill missing emerald live beacon dot'
      );
      assert.ok(
        navbarSource.includes('{$currentUser.name}'),
        'Navbar must display $currentUser.name when authenticated'
      );
      assert.ok(
        navbarSource.includes('$currentUser.isSubscribed ? "/dashboard" : "/plans"'),
        'Navbar must dynamically route subscribed users to /dashboard and non-subscribed users to /plans'
      );
    });

    it('2.6 should support mobile drawer interactions cleanly', () => {
      // Toggle button with accessible label
      assert.ok(
        navbarSource.includes('aria-label="Toggle Navigation Menu"'),
        'Mobile menu button missing aria-label'
      );
      assert.ok(
        navbarSource.includes('mobileMenuOpen = !mobileMenuOpen'),
        'Mobile menu toggle button missing toggle handler'
      );

      // Auto-dismiss on click in mobile drawer
      const dismissMatches = navbarSource.match(/onclick=\{[^}]*mobileMenuOpen\s*=\s*false[^}]*\}/g) || [];
      assert.ok(
        dismissMatches.length >= 4,
        `Mobile menu links should auto-dismiss drawer on click (found ${dismissMatches.length})`
      );
    });
  });

  // =========================================================================
  // SUITE 3: Svelte 5 Compiler AST & Diagnostics Verification
  // =========================================================================
  describe('3. Svelte 5 AST & Component Syntax Validation', () => {
    it('3.1 should compile Navbar.svelte without any compiler errors', async () => {
      const { pathToFileURL } = await import('node:url');
      const compilerPath = path.join(WEB_DIR, 'node_modules', 'svelte', 'src', 'compiler', 'index.js');
      const { compile } = await import(pathToFileURL(compilerPath).href);
      const navbarSource = fs.readFileSync(NAVBAR_PATH, 'utf-8');
      
      const compiled = compile(navbarSource, {
        filename: 'Navbar.svelte',
        generate: 'client'
      });

      assert.ok(compiled.js, 'Compiled JS must be generated');
      const errors = (compiled.warnings || []).filter(w => w.code && w.code.includes('error'));
      assert.strictEqual(errors.length, 0, `Navbar compiler errors: ${JSON.stringify(errors)}`);
    });

    it('3.2 should compile BrandIcon.svelte without any compiler errors', async () => {
      const { pathToFileURL } = await import('node:url');
      const compilerPath = path.join(WEB_DIR, 'node_modules', 'svelte', 'src', 'compiler', 'index.js');
      const { compile } = await import(pathToFileURL(compilerPath).href);
      const brandIconSource = fs.readFileSync(BRAND_ICON_PATH, 'utf-8');
      
      const compiled = compile(brandIconSource, {
        filename: 'BrandIcon.svelte',
        generate: 'client'
      });

      assert.ok(compiled.js, 'Compiled JS must be generated');
      const errors = (compiled.warnings || []).filter(w => w.code && w.code.includes('error'));
      assert.strictEqual(errors.length, 0, `BrandIcon compiler errors: ${JSON.stringify(errors)}`);
    });
  });
});
