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

const LAYOUT_CSS_PATH = path.join(WEB_DIR, 'src', 'routes', 'layout.css');
const APP_HTML_PATH = path.join(WEB_DIR, 'src', 'app.html');
const NAVBAR_SVELTE_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'Navbar.svelte');
const ROBOTS_CSS_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css');

const EXPECTED_ROBOTS_SHA256 = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';
const EXPECTED_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];

describe('Challenger 1 Empirical Deep Probe: Milestone 1 Verification', () => {

  describe('1. Google Font Poppins & Typography Tokens', () => {
    it('1.1 should correctly configure Tailwind v4 @theme with Poppins and monospace tokens', () => {
      assert.ok(fs.existsSync(LAYOUT_CSS_PATH), 'layout.css must exist');
      const content = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8');

      const themeMatch = content.match(/@theme\s*\{([\s\S]*?)\}/);
      assert.ok(themeMatch, '@theme block must exist in layout.css');
      const themeBody = themeMatch[1];

      // Must declare --font-sans with 'Poppins'
      assert.match(
        themeBody,
        /--font-sans:\s*['"]Poppins['"],/,
        '@theme must declare --font-sans starting with Poppins'
      );
      assert.ok(themeBody.includes('-apple-system'), 'Fallback must include -apple-system');
      assert.ok(themeBody.includes('BlinkMacSystemFont'), 'Fallback must include BlinkMacSystemFont');
      assert.ok(themeBody.includes('sans-serif'), 'Fallback must end with sans-serif');

      // Monospace token
      assert.match(
        themeBody,
        /--font-mono:\s*['"]JetBrains Mono['"],\s*monospace;/,
        '@theme must declare --font-mono with JetBrains Mono'
      );
    });

    it('1.2 should declare --font-sans in :root and apply Poppins to body in @layer base', () => {
      const content = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8');

      // :root declaration
      assert.match(
        content,
        /:root\s*\{[\s\S]*?--font-sans:\s*['"]Poppins['"],/,
        ':root must declare --font-sans starting with Poppins'
      );

      // body font-family
      assert.match(
        content,
        /body\s*\{[\s\S]*?font-family:\s*['"]Poppins['"],\s*var\(--font-sans\),\s*sans-serif;/,
        'body font-family must cascade Poppins with var(--font-sans) and sans-serif'
      );
    });

    it('1.3 should load Poppins weights 300..900 and JetBrains Mono in app.html with preconnect', () => {
      assert.ok(fs.existsSync(APP_HTML_PATH), 'app.html must exist');
      const html = fs.readFileSync(APP_HTML_PATH, 'utf-8');

      // Preconnect tags
      assert.match(html, /<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.googleapis\.com["']\s*\/?>/);
      assert.match(html, /<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.gstatic\.com["']\s+crossorigin\s*\/?>/);

      // Google Font link
      const fontMatch = html.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/);
      assert.ok(fontMatch, 'app.html must contain Google Fonts link');
      const fontUrl = fontMatch[0];

      assert.ok(fontUrl.includes('family=Poppins:wght@'), 'Font URL must contain Poppins wght');
      for (const w of EXPECTED_WEIGHTS) {
        assert.ok(fontUrl.includes(w), `Font URL missing weight ${w}`);
      }
      assert.ok(fontUrl.includes('JetBrains+Mono'), 'Font URL must contain JetBrains Mono');
      assert.ok(fontUrl.includes('display=swap'), 'Font URL must include display=swap');

      // Body class includes font-sans
      assert.match(html, /<body[^>]*class=["'][^"']*font-sans[^"']*["']/);
    });

    it('1.4 should ensure zero references to obsolete Inter or Plus Jakarta Sans in CSS and HTML', () => {
      const css = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8');
      const html = fs.readFileSync(APP_HTML_PATH, 'utf-8');

      assert.ok(!css.includes('Inter'), 'layout.css should not contain Inter');
      assert.ok(!css.includes('Plus Jakarta Sans'), 'layout.css should not contain Plus Jakarta Sans');
      assert.ok(!html.includes('Inter'), 'app.html should not contain Inter');
      assert.ok(!html.includes('Plus Jakarta Sans'), 'app.html should not contain Plus Jakarta Sans');
    });

    it('1.5 should verify CSS prose and code blocks preserve monospace font', () => {
      const css = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8');
      assert.match(css, /\.prose\s+code\s*\{[\s\S]*?font-family:\s*var\(--font-mono\);/);
      assert.match(css, /\.prose\s+pre\s*\{[\s\S]*?font-family:\s*var\(--font-mono\);/);
    });
  });

  describe('2. robots.css SHA256 Checksum & Immutability', () => {
    it('2.1 should match exact SHA256 checksum and size', () => {
      assert.ok(fs.existsSync(ROBOTS_CSS_PATH), 'robots.css must exist');
      const content = fs.readFileSync(ROBOTS_CSS_PATH);
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      assert.strictEqual(
        hash,
        EXPECTED_ROBOTS_SHA256,
        `robots.css hash invariant violated: got ${hash}, expected ${EXPECTED_ROBOTS_SHA256}`
      );
      assert.strictEqual(content.length, 5427, 'robots.css size must match original 5427 bytes');
    });

    it('2.2 should verify robots.css contains font: inherit for tabs and monospace for numbers', () => {
      const content = fs.readFileSync(ROBOTS_CSS_PATH, 'utf-8');
      assert.match(content, /\.rb-tab\s*\{[^}]*font:\s*inherit;/);
      assert.match(content, /\.rb-num\s*\{[^}]*font:\s*0\.7rem\s+ui-monospace/);
    });
  });

  describe('3. Navbar.svelte Invariant Regression Checks', () => {
    it('3.1 should contain >Helpers< verbatim in both desktop nav and mobile drawer', () => {
      assert.ok(fs.existsSync(NAVBAR_SVELTE_PATH), 'Navbar.svelte must exist');
      const content = fs.readFileSync(NAVBAR_SVELTE_PATH, 'utf-8');

      const helpersMatches = [...content.matchAll(/>Helpers</g)];
      assert.ok(
        helpersMatches.length >= 2,
        `Expected at least 2 occurrences of >Helpers<, found ${helpersMatches.length}`
      );
    });

    it('3.2 should contain href="/#helpers" at least 2 times', () => {
      const content = fs.readFileSync(NAVBAR_SVELTE_PATH, 'utf-8');
      const hrefMatches = [...content.matchAll(/href=["']\/#helpers["']/g)];
      assert.ok(
        hrefMatches.length >= 2,
        `Expected at least 2 occurrences of href="/#helpers", found ${hrefMatches.length}`
      );
    });

    it('3.3 should preserve all 4 primary landing page section anchor routes', () => {
      const content = fs.readFileSync(NAVBAR_SVELTE_PATH, 'utf-8');
      assert.match(content, /href=["']\/#helpers["']/);
      assert.match(content, /href=["']\/#features["']/);
      assert.match(content, /href=["']\/#pricing["']/);
      assert.match(content, /href=["']\/#faq["']/);
    });

    it('3.4 should compile cleanly with Svelte compiler without syntax or runtime runes errors', async () => {
      const compilerPath = path.join(WEB_DIR, 'node_modules', 'svelte', 'src', 'compiler', 'index.js');
      const { compile } = await import(pathToFileURL(compilerPath).href);
      const content = fs.readFileSync(NAVBAR_SVELTE_PATH, 'utf-8');
      const result = compile(content, {
        filename: 'Navbar.svelte',
        generate: 'client'
      });
      assert.ok(result.js.code, 'Compiled JS code should not be empty');
      const errors = (result.warnings || []).filter(w => w.code && w.code.includes('error'));
      assert.strictEqual(errors.length, 0, `Expected 0 compiler errors, got: ${JSON.stringify(errors)}`);
    });

    it('3.5 should contain auto-dismiss handlers for mobile drawer items', () => {
      const content = fs.readFileSync(NAVBAR_SVELTE_PATH, 'utf-8');
      assert.match(content, /mobileMenuOpen\s*=\s*\$state\(false\)/);
      assert.match(content, /onclick=\{\(\)\s*=>\s*\(mobileMenuOpen\s*=\s*false\)\}/);
    });

    it('3.6 should render emerald active beacon for authenticated user state', () => {
      const content = fs.readFileSync(NAVBAR_SVELTE_PATH, 'utf-8');
      assert.match(content, /bg-emerald-500/);
      assert.match(content, /\$currentUser\.name/);
      assert.match(content, /\$currentUser\.isSubscribed\s*\?\s*["']\/dashboard["']\s*:\s*["']\/plans["']/);
    });
  });

});
