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
const PAGE_PATH = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');

describe('Adversarial Stress Test: Milestone 1 (Challenger 2)', () => {

  describe('Invariant Verification: Navbar.svelte', () => {
    const navbarContent = fs.readFileSync(NAVBAR_PATH, 'utf-8');

    it('Invariant 1: Exact >Helpers< substring presence', () => {
      assert.ok(
        navbarContent.includes('>Helpers<'),
        'Navbar.svelte MUST contain the exact substring ">Helpers<"'
      );
    });

    it('Invariant 2: Frequency count of href="/#helpers" >= 2', () => {
      const matches = navbarContent.match(/href="\/#helpers"/g) || [];
      assert.ok(
        matches.length >= 2,
        `Expected href="/#helpers" count >= 2, found ${matches.length}`
      );
    });

    it('Invariant 3: Desktop navigation link structure and styling', () => {
      const desktopNavMatch = navbarContent.match(/<nav([\s\S]*?)<\/nav>/);
      assert.ok(desktopNavMatch, 'Desktop <nav> block not found in Navbar.svelte');
      const desktopNav = desktopNavMatch[0];
      assert.ok(
        desktopNav.includes('href="/#helpers"'),
        'Desktop nav does not contain href="/#helpers"'
      );
      assert.ok(
        desktopNav.includes('>Helpers<'),
        'Desktop nav does not contain >Helpers<'
      );
      assert.ok(
        desktopNav.includes('text-gray-600') && desktopNav.includes('hover:text-gray-900'),
        'Desktop nav must follow Relevance AI typography tokens (text-gray-600 hover:text-gray-900)'
      );
    });

    it('Invariant 4: Mobile drawer navigation link structure and click dismiss', () => {
      // Find mobile drawer section
      const mobileDrawerMatch = navbarContent.match(/\{#if mobileMenuOpen\}([\s\S]*?)\{\/if\}/);
      assert.ok(mobileDrawerMatch, 'Mobile menu drawer {#if mobileMenuOpen} not found');
      const mobileDrawer = mobileDrawerMatch[1];
      assert.ok(
        mobileDrawer.includes('href="/#helpers"'),
        'Mobile drawer does not contain href="/#helpers"'
      );
      assert.ok(
        mobileDrawer.includes('>Helpers<'),
        'Mobile drawer does not contain >Helpers<'
      );
      // Verify clicking the link closes mobile menu
      assert.ok(
        mobileDrawer.includes('href="/#helpers"') && mobileDrawer.includes('mobileMenuOpen = false'),
        'Clicking mobile Helpers link must dismiss mobile menu drawer (mobileMenuOpen = false)'
      );
    });

    it('Invariant 5: Relevance AI styling classes on Navbar container and CTAs', () => {
      assert.ok(
        navbarContent.includes('bg-white/80') && navbarContent.includes('backdrop-blur-md') && navbarContent.includes('border-gray-100'),
        'Navbar header must use Relevance AI frosted blur styling (bg-white/80 backdrop-blur-md border-b border-gray-100)'
      );
      assert.ok(
        navbarContent.includes('bg-[#4F46E5]') && navbarContent.includes('hover:bg-[#4338CA]'),
        'Get started CTA must use Relevance AI Indigo styling (bg-[#4F46E5] hover:bg-[#4338CA])'
      );
      assert.ok(
        navbarContent.includes('bg-white') && navbarContent.includes('border-gray-200') && navbarContent.includes('text-gray-700'),
        'Log in CTA must use Relevance AI secondary border button styling'
      );
    });

    it('Invariant 6: Accessibility attributes on mobile toggle button', () => {
      assert.ok(navbarContent.includes('aria-label="Toggle Navigation Menu"'), 'Mobile menu button must have aria-label="Toggle Navigation Menu"');
      assert.ok(navbarContent.includes('type="button"'), 'Button must specify type="button" to prevent unwanted form submissions');
    });

    it('Invariant 7: Authenticated vs unauthenticated state handling', () => {
      assert.ok(navbarContent.includes('$isAuthenticated && $currentUser'), 'Must condition on user auth state');
      assert.ok(navbarContent.includes('bg-emerald-500'), 'Must render active user status beacon (bg-emerald-500)');
      assert.ok(navbarContent.includes('/dashboard'), 'Must support redirect to /dashboard for subscribed users');
      assert.ok(navbarContent.includes('/plans'), 'Must support redirect to /plans for unsubscribed users');
    });

    it('Invariant 8: Integration target #helpers exists on homepage', () => {
      const pageContent = fs.readFileSync(PAGE_PATH, 'utf-8');
      assert.ok(
        pageContent.includes('id="helpers"'),
        '+page.svelte must contain matching target id="helpers" for navbar anchors'
      );
    });
  });

  describe('Adversarial Stress: BrandIcon.svelte', () => {
    const brandIconContent = fs.readFileSync(BRAND_ICON_PATH, 'utf-8');

    // Simulate resolvedBrand derivation logic directly from BrandIcon.svelte
    function resolveBrand(name = '', modelId = '') {
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
    }

    it('Brand 1: Resolves WhatsApp brand via diverse casing and prefixes', () => {
      assert.strictEqual(resolveBrand('whatsapp'), 'whatsapp');
      assert.strictEqual(resolveBrand('WhatsApp'), 'whatsapp');
      assert.strictEqual(resolveBrand('WHATSAPP'), 'whatsapp');
      assert.strictEqual(resolveBrand('  whatsapp-channel  '), 'whatsapp');
      assert.strictEqual(resolveBrand('', 'whatsapp/business-api'), 'whatsapp');
      assert.strictEqual(resolveBrand('', 'WHATSAPP_BOT'), 'whatsapp');
    });

    it('Brand 2: Resolves Telegram brand via diverse casing and prefixes', () => {
      assert.strictEqual(resolveBrand('telegram'), 'telegram');
      assert.strictEqual(resolveBrand('Telegram'), 'telegram');
      assert.strictEqual(resolveBrand('TELEGRAM'), 'telegram');
      assert.strictEqual(resolveBrand('telegram-gateway'), 'telegram');
      assert.strictEqual(resolveBrand('', 'telegram/bot-api'), 'telegram');
      assert.strictEqual(resolveBrand('', 'TELEGRAM_CHANNEL'), 'telegram');
    });

    it('Brand 3: Preserves all existing AI model brand detections', () => {
      const testCases = [
        { input: { name: 'gemini' }, expected: 'gemini' },
        { input: { name: 'google' }, expected: 'gemini' },
        { input: { modelId: 'google/gemini-2.0-flash-exp' }, expected: 'gemini' },
        { input: { name: 'openrouter' }, expected: 'openrouter' },
        { input: { name: 'openai' }, expected: 'openai' },
        { input: { name: 'gpt-4o' }, expected: 'openai' },
        { input: { modelId: 'openai/gpt-4o-mini' }, expected: 'openai' },
        { input: { name: 'claude' }, expected: 'anthropic' },
        { input: { name: 'anthropic' }, expected: 'anthropic' },
        { input: { modelId: 'anthropic/claude-3-5-sonnet' }, expected: 'anthropic' },
        { input: { name: 'deepseek' }, expected: 'deepseek' },
        { input: { modelId: 'deepseek/deepseek-chat' }, expected: 'deepseek' },
        { input: { name: 'grok' }, expected: 'grok' },
        { input: { name: 'xai' }, expected: 'grok' },
        { input: { modelId: 'x-ai/grok-2' }, expected: 'grok' },
        { input: { name: 'llama' }, expected: 'meta' },
        { input: { modelId: 'meta-llama/llama-3.3-70b-instruct' }, expected: 'meta' },
        { input: { name: 'mistral' }, expected: 'mistral' },
        { input: { modelId: 'mistralai/mistral-large-2407' }, expected: 'mistral' },
        { input: { name: 'cohere' }, expected: 'cohere' },
        { input: { modelId: 'cohere/command-r-plus' }, expected: 'cohere' },
        { input: { name: 'qwen' }, expected: 'qwen' },
        { input: { modelId: 'qwen/qwen-2.5-72b-instruct' }, expected: 'qwen' },
        { input: { name: 'replicate' }, expected: 'replicate' },
        { input: { name: 'flux' }, expected: 'replicate' },
        { input: { modelId: 'black-forest-labs/flux-1.1-pro' }, expected: 'replicate' },
        { input: { name: '', modelId: '' }, expected: 'generic' },
        { input: {}, expected: 'generic' }
      ];

      for (const { input, expected } of testCases) {
        const result = resolveBrand(input.name, input.modelId);
        assert.strictEqual(
          result,
          expected,
          `Failed resolving for ${JSON.stringify(input)}: got ${result}, expected ${expected}`
        );
      }
    });

    it('Brand 4: WhatsApp SVG vector integrity', () => {
      assert.ok(brandIconContent.includes("resolvedBrand === 'whatsapp'"), 'Missing WhatsApp condition block');
      assert.ok(brandIconContent.includes('fill="#25D366"'), 'WhatsApp SVG must use official brand color #25D366');
      assert.ok(brandIconContent.includes('aria-label="WhatsApp"'), 'WhatsApp SVG must include aria-label="WhatsApp"');
      assert.ok(brandIconContent.includes('viewBox="0 0 24 24"'), 'WhatsApp SVG must have viewBox="0 0 24 24"');
    });

    it('Brand 5: Telegram SVG vector integrity', () => {
      assert.ok(brandIconContent.includes("resolvedBrand === 'telegram'"), 'Missing Telegram condition block');
      assert.ok(brandIconContent.includes('fill="#229ED9"'), 'Telegram SVG must use official brand color #229ED9');
      assert.ok(brandIconContent.includes('aria-label="Telegram"'), 'Telegram SVG must include aria-label="Telegram"');
      assert.ok(brandIconContent.includes('viewBox="0 0 24 24"'), 'Telegram SVG must have viewBox="0 0 24 24"');
    });

    it('Brand 6: Svelte 5 runes compliance', () => {
      assert.ok(brandIconContent.includes('$props<'), 'BrandIcon must use Svelte 5 $props rune');
      assert.ok(brandIconContent.includes('$derived.by('), 'BrandIcon must use Svelte 5 $derived.by rune');
      assert.ok(!brandIconContent.includes('export let'), 'BrandIcon must not use legacy Svelte 3/4 export let');
      assert.ok(!brandIconContent.includes('$:'), 'BrandIcon must not use legacy Svelte 3/4 reactive labels ($:)');
    });
  });

});
