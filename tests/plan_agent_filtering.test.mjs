import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Plan-Based Agent & Tool Filtering Suite', () => {
  const dashboardPath = path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte');
  const userStorePath = path.join(WEB_DIR, 'src', 'lib', 'stores', 'userStore.ts');
  const plansStorePath = path.join(WEB_DIR, 'src', 'lib', 'stores', 'plansStore.ts');
  const plansConfigPath = path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts');
  const chatPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'FloatingCeoChat.svelte');
  const toolConnectorsTabPath = path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolConnectorsTab.svelte');

  it('1.1 userStore exports isHelperUnlocked and getEffectivePlanTier', () => {
    const content = readSafe(userStorePath);
    assert.ok(content.includes('export function isHelperUnlocked'), 'Must export isHelperUnlocked');
    assert.ok(content.includes('export function getEffectivePlanTier'), 'Must export getEffectivePlanTier');
  });

  it('1.2 dashboard/+page.svelte computes accessibleTools and dynamicCategories based on plan toggles', () => {
    const content = readSafe(dashboardPath);
    assert.ok(content.includes('const accessibleTools = $derived.by('), 'Must compute accessibleTools');
    assert.ok(content.includes('toggles.allHelpersEnabled !== false'), 'Must check allHelpersEnabled');
    assert.ok(content.includes('toggles.enabledHelpers'), 'Must check enabledHelpers array');
    assert.ok(content.includes('const dynamicCategories = $derived.by('), 'Must compute dynamic category counts');
    assert.ok(content.includes('dynamicCategories as cat'), 'Must render dynamicCategories in category tabs');
  });

  it('1.3 Admin users bypass helper restrictions and see all tools', () => {
    const dashContent = readSafe(dashboardPath);
    assert.ok(dashContent.includes('if (isAdmin) return TOOLS;'), 'Admin user must see all tools in dashboard');
    const chatContent = readSafe(chatPath);
    assert.ok(chatContent.includes('if (isUserAdmin) return TOOLS;'), 'Admin user must see all tools in slash commands');
  });

  it('1.4 FloatingCeoChat.svelte filters slash autocomplete by accessibleTools', () => {
    const chatContent = readSafe(chatPath);
    assert.ok(chatContent.includes('const accessibleTools = $derived.by('), 'FloatingCeoChat must declare accessibleTools');
    assert.ok(chatContent.includes('if (!slashQuery) return accessibleTools.slice(0, 80);'), 'Default slash results must use accessibleTools');
    assert.ok(chatContent.includes('return accessibleTools.filter('), 'Slash search must filter accessibleTools');
  });

  it('1.5 ToolConnectorsTab.svelte filters enabled tools by enabledToolConnectorsStore', () => {
    const tabContent = readSafe(toolConnectorsTabPath);
    assert.ok(tabContent.includes('$enabledToolConnectorsStore.includes(tool.id)'), 'Must filter tools by enabled connectors store');
  });

  it('1.6 plans.ts defines allHelpersEnabled and enabledHelpers for every plan tier', () => {
    const content = readSafe(plansConfigPath);
    assert.ok(content.includes('allHelpersEnabled: boolean;'), 'PlanFeatureToggles must define allHelpersEnabled');
    assert.ok(content.includes('enabledHelpers: string[];'), 'PlanFeatureToggles must define enabledHelpers');
  });
});
