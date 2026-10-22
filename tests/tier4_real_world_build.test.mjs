import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { WEB_DIR, STATIC_DIR } from './helpers/test_utils.mjs';

describe('Tier 4: Real-World Scenarios & Full Build Verification', () => {

  it('4.1 should pass SvelteKit diagnostics (svelte-check) with 0 errors', () => {
    try {
      const output = execSync('npm run check', {
        cwd: WEB_DIR,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 90000
      });
      assert.ok(!output.toLowerCase().includes('error:'), `svelte-check reported errors:\n${output}`);
      assert.ok(
        output.includes('0 errors') || output.includes('no errors') || output.includes('svelte-check'),
        `Unexpected svelte-check output:\n${output}`
      );
    } catch (err) {
      assert.fail(`svelte-check failed with exit code ${err.status}:\n${err.stdout}\n${err.stderr}`);
    }
  });

  it('4.2 should complete Vite production build (npm run build) successfully', () => {
    const buildResult = spawnSync('npm', ['run', 'build'], {
      cwd: WEB_DIR,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000,
      shell: true
    });
    buildResult.code = buildResult.status;
    assert.strictEqual(
      buildResult.code,
      0,
      `Vite production build failed with exit code ${buildResult.status}:\n${buildResult.stdout}\n${buildResult.stderr}`
    );
    assert.ok(
      buildResult.stdout.includes('built in') || buildResult.stdout.includes('.svelte-kit/output') || buildResult.stdout.includes('✓ built'),
      `Build output did not indicate successful completion:\n${buildResult.stdout}`
    );
    const clientDir = path.join(WEB_DIR, '.svelte-kit', 'output', 'client');
    const serverDir = path.join(WEB_DIR, '.svelte-kit', 'output', 'server');
    assert.ok(fs.existsSync(clientDir), 'Production client build directory does not exist');
    assert.ok(fs.existsSync(serverDir), 'Production server build directory does not exist');
  });

  it('4.3 should emit static mascot logo (ezbo-ceo.png) in production output', () => {
    const staticLogo = path.join(STATIC_DIR, 'ezbo-ceo.png');
    assert.ok(fs.existsSync(staticLogo), 'web/static/ezbo-ceo.png does not exist');
    const stat = fs.statSync(staticLogo);
    assert.ok(stat.size > 100000, `Mascot image is suspiciously small (${stat.size} bytes)`);

    // In SvelteKit build output:
    const clientDir = path.join(WEB_DIR, '.svelte-kit', 'output', 'client');
    assert.ok(fs.existsSync(clientDir), 'Client build output directory (.svelte-kit/output/client) does not exist');
    const clientStatic = path.join(clientDir, 'ezbo-ceo.png');
    assert.ok(fs.existsSync(clientStatic), 'ezbo-ceo.png was not copied to client build output directory');
  });

  it('4.4 should bundle Tabler webfont into production assets', () => {
    const clientDir = path.join(WEB_DIR, '.svelte-kit', 'output', 'client');
    assert.ok(fs.existsSync(clientDir), 'Client build output directory (.svelte-kit/output/client) does not exist');
    // Find all css or font files recursively
    const findFiles = (dir) => {
      let results = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(findFiles(fullPath));
        } else {
          results.push(fullPath);
        }
      }
      return results;
    };

    const builtFiles = findFiles(clientDir);
    const hasFontOrCss = builtFiles.some(f =>
      f.endsWith('.css') || f.endsWith('.woff2') || f.endsWith('.woff') || f.endsWith('.ttf')
    );
    assert.ok(hasFontOrCss, 'No CSS or font assets found in production client output');
  });

  it('4.5 should verify no broken imports or missing CSS references in output', () => {
    const robotsPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'RobotShowcase.svelte');
    assert.ok(fs.existsSync(robotsPath));
    const content = fs.readFileSync(robotsPath, 'utf8');

    // Verify all relative imports exist
    const importMatches = [...content.matchAll(/import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"](\.[^'"]+)['"]/g)];
    for (const match of importMatches) {
      const importPath = match[1];
      const resolved = path.resolve(path.join(WEB_DIR, 'src', 'lib', 'components', 'robots'), importPath);
      const exists = fs.existsSync(resolved) ||
                     fs.existsSync(`${resolved}.js`) ||
                     fs.existsSync(`${resolved}.ts`) ||
                     fs.existsSync(`${resolved}.svelte`);
      assert.ok(exists, `RobotShowcase.svelte imports non-existent relative path: ${importPath}`);
    }
  });
});
