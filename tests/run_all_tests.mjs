#!/usr/bin/env node
/**
 * Master E2E Test Suite Runner for EzboAgents Animated Robot Showcase Integration
 * Usage:
 *   node tests/run_all_tests.mjs
 *   node tests/run_all_tests.mjs --tier=1
 *   node tests/run_all_tests.mjs --tier=1,2,3
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const TIERS = [
  { id: 1, name: 'Tier 1: Feature Coverage (>=5 per feature)', file: 'tier1_feature_coverage.test.mjs' },
  { id: 2, name: 'Tier 2: Boundary & Corner Cases', file: 'tier2_boundary_cases.test.mjs' },
  { id: 3, name: 'Tier 3: Cross-Feature Interactions', file: 'tier3_cross_feature.test.mjs' },
  { id: 4, name: 'Tier 4: Real-World Scenarios & Full Build', file: 'tier4_real_world_build.test.mjs' },
  { id: 5, name: 'Tier 5: Adversarial Stress & Edge Cases', file: 'adversarial_challenge.test.mjs' },
  { id: 6, name: 'Tier 6: OpenRouter Multi-Model & Multi-Key Failover', file: 'openrouter_multimodel_multikey.test.mjs' }
];

// Parse CLI arguments
const args = process.argv.slice(2);
const tierArg = args.find(a => a.startsWith('--tier='));
let selectedTierIds = [1, 2, 3, 4, 5, 6];
if (tierArg) {
  selectedTierIds = tierArg.replace('--tier=', '').split(',').map(n => parseInt(n.trim(), 10)).filter(Boolean);
}

const tiersToRun = TIERS.filter(t => selectedTierIds.includes(t.id));

console.log('======================================================================');
console.log('  EZBO AGENTS: 75-HELPER ANIMATED ROBOT SHOWCASE E2E TEST SUITE');
console.log('======================================================================');
console.log(`Node: ${process.version} | Platform: ${process.platform} | PID: ${process.pid}`);
console.log(`Executing ${tiersToRun.length} test tiers:\n`);

function runTestFile(tier) {
  return new Promise((resolve) => {
    const filePath = path.join(__dirname, tier.file);
    const start = Date.now();
    console.log(`----------------------------------------------------------------------`);
    console.log(`▶ Running [${tier.name}]`);
    console.log(`  File: tests/${tier.file}`);
    console.log(`----------------------------------------------------------------------`);

    const child = spawn(process.execPath, ['--test', filePath], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    child.on('close', (code) => {
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      resolve({
        id: tier.id,
        name: tier.name,
        file: tier.file,
        passed: code === 0,
        exitCode: code,
        duration
      });
    });

    child.on('error', (err) => {
      resolve({
        id: tier.id,
        name: tier.name,
        file: tier.file,
        passed: false,
        error: err.message,
        duration: 0
      });
    });
  });
}

async function main() {
  const results = [];
  const overallStart = Date.now();

  for (const tier of tiersToRun) {
    const res = await runTestFile(tier);
    results.push(res);
  }

  const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(2);
  console.log('\n======================================================================');
  console.log('                      E2E TEST EXECUTION SUMMARY');
  console.log('======================================================================');

  let allPassed = true;
  for (const r of results) {
    const statusBadge = r.passed ? '✔ PASS' : '✖ FAIL';
    console.log(`[${statusBadge}] ${r.name} (${r.duration}s)`);
    if (!r.passed) {
      allPassed = false;
    }
  }

  console.log('----------------------------------------------------------------------');
  console.log(`Overall Result: ${allPassed ? 'ALL TEST TIERS PASSED ✔' : 'SOME TEST TIERS FAILED ✖'}`);
  console.log(`Total Time:     ${overallDuration}s`);
  console.log('======================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
