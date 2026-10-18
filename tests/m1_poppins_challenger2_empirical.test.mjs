import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const LAYOUT_CSS_PATH = path.join(ROOT_DIR, 'web', 'src', 'routes', 'layout.css');
const APP_HTML_PATH = path.join(ROOT_DIR, 'web', 'src', 'app.html');
const ROBOTS_CSS_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'components', 'robots', 'robots.css');

const EXPECTED_ROBOTS_SHA256 = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';
const EXPECTED_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];

describe('Challenger 2 Empirical Stress Test: Milestone 1 Poppins Typography', () => {

  it('1.1 layout.css correctly configures Tailwind v4 @theme with Poppins', () => {
    assert.ok(fs.existsSync(LAYOUT_CSS_PATH), 'layout.css must exist');
    const content = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8');

    // Extract @theme block
    const themeMatch = content.match(/@theme\s*\{([\s\S]*?)\}/);
    assert.ok(themeMatch, '@theme block must exist in layout.css');
    const themeBody = themeMatch[1];

    // Must declare --font-sans with 'Poppins'
    assert.match(
      themeBody,
      /--font-sans:\s*['"]Poppins['"],/,
      '@theme must declare --font-sans starting with Poppins'
    );

    // Must include system fallbacks
    assert.ok(
      themeBody.includes('-apple-system') &&
      themeBody.includes('BlinkMacSystemFont') &&
      themeBody.includes('sans-serif'),
      '@theme --font-sans must declare proper fallback fonts'
    );
  });

  it('1.2 layout.css :root and body correctly apply Poppins font stack', () => {
    const content = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8');

    // Extract :root in @layer base
    assert.match(
      content,
      /:root\s*\{[\s\S]*?--font-sans:\s*['"]Poppins['"]/,
      ':root must declare --font-sans starting with Poppins'
    );

    // Verify body font-family
    assert.match(
      content,
      /body\s*\{[\s\S]*?font-family:\s*['"]Poppins['"],\s*var\(--font-sans\)/,
      'body must declare font-family using Poppins and var(--font-sans)'
    );
  });

  it('1.3 app.html loads Google Font Poppins with all weights 300 through 900', () => {
    assert.ok(fs.existsSync(APP_HTML_PATH), 'app.html must exist');
    const content = fs.readFileSync(APP_HTML_PATH, 'utf-8');

    // Verify preconnects for optimal font loading
    assert.match(
      content,
      /<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.googleapis\.com["']\s*\/?>/,
      'app.html must preconnect to fonts.googleapis.com'
    );
    assert.match(
      content,
      /<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.gstatic\.com["']\s+crossorigin\s*\/?>/,
      'app.html must preconnect to fonts.gstatic.com with crossorigin'
    );

    // Extract Poppins href
    const poppinsLinkMatch = content.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/);
    assert.ok(poppinsLinkMatch, 'app.html must contain Google Fonts css2 link');
    const href = poppinsLinkMatch[0];

    // Verify family=Poppins
    assert.ok(href.includes('family=Poppins:wght@'), 'Link must specify family=Poppins:wght@');

    // Verify every required weight 300-900
    for (const w of EXPECTED_WEIGHTS) {
      assert.ok(
        href.includes(w),
        `Google Font link missing weight ${w}: ${href}`
      );
    }

    // Verify display=swap
    assert.ok(href.includes('display=swap'), 'Google Font link must include display=swap');

    // Verify body class contains font-sans
    assert.match(
      content,
      /<body[^>]*class=["'][^"']*font-sans[^"']*["']/,
      'body tag in app.html must include font-sans class'
    );
  });

  it('1.4 robots.css SHA256 checksum is byte-identical and untouched', () => {
    assert.ok(fs.existsSync(ROBOTS_CSS_PATH), 'robots.css must exist');
    const content = fs.readFileSync(ROBOTS_CSS_PATH);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    assert.strictEqual(
      hash,
      EXPECTED_ROBOTS_SHA256,
      `robots.css hash mismatch: expected ${EXPECTED_ROBOTS_SHA256}, got ${hash}`
    );
  });

  it('1.5 No conflicting legacy fonts (Inter, Plus Jakarta Sans) remain in markup or CSS', () => {
    const layoutContent = fs.readFileSync(LAYOUT_CSS_PATH, 'utf-8');
    const appHtmlContent = fs.readFileSync(APP_HTML_PATH, 'utf-8');

    assert.ok(!layoutContent.includes('Inter'), 'layout.css must not contain Inter');
    assert.ok(!layoutContent.includes('Plus Jakarta Sans'), 'layout.css must not contain Plus Jakarta Sans');
    assert.ok(!appHtmlContent.includes('Inter'), 'app.html must not contain Inter');
    assert.ok(!appHtmlContent.includes('Plus Jakarta Sans'), 'app.html must not contain Plus Jakarta Sans');
  });

});
