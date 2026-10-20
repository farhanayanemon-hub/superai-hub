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

  it('1.7 dashboard closes drawer if active tool disabled and draggableScroll is enhanced', () => {
    const dashContent = readSafe(dashboardPath);
    assert.ok(dashContent.includes('closeToolDrawer()'), 'Dashboard must auto-close drawer for disabled tools');
    const adminPath = path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte');
    const adminContent = readSafe(adminPath);
    assert.ok(adminContent.includes('use:draggableScroll'), 'Admin helper chips must use draggableScroll');
    const docsPath = path.join(WEB_DIR, 'src', 'routes', 'docs', 'channels', '+page.svelte');
    const docsContent = readSafe(docsPath);
    assert.ok(docsContent.includes('use:draggableScroll'), 'Docs channel tabs must use draggableScroll');
  });

  it('1.8 plans.ts defines allToolsEnabled and enabledTools for every plan tier', () => {
    const content = readSafe(plansConfigPath);
    assert.ok(content.includes('allToolsEnabled: boolean;'), 'PlanFeatureToggles must define allToolsEnabled');
    assert.ok(content.includes('enabledTools: string[];'), 'PlanFeatureToggles must define enabledTools');
  });

  it('1.9 admin page provides per-plan tool connectors matrix and safe helper toggling', () => {
    const adminPath = path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte');
    const adminContent = readSafe(adminPath);
    assert.ok(adminContent.includes('toggleToolForPlan'), 'Admin page must have toggleToolForPlan');
    assert.ok(adminContent.includes('selectAllToolsForPlan'), 'Admin page must have selectAllToolsForPlan');
    assert.ok(adminContent.includes('clearAllToolsForPlan'), 'Admin page must have clearAllToolsForPlan');
    assert.ok(adminContent.includes('allToolsEnabled'), 'Admin page must bind allToolsEnabled');
    assert.ok(adminContent.includes('enabledTools'), 'Admin page must bind enabledTools');
  });

  it('1.10 ToolConnectorsTab.svelte filters by plan featureToggles allToolsEnabled and enabledTools', () => {
    const tabContent = readSafe(toolConnectorsTabPath);
    assert.ok(tabContent.includes('allToolsEnabled === false'), 'ToolConnectorsTab must check allToolsEnabled');
    assert.ok(tabContent.includes('enabledTools'), 'ToolConnectorsTab must check enabledTools');
    assert.ok(tabContent.includes('isAdmin'), 'Admin users must bypass restrictions in ToolConnectorsTab');
  });

  it('1.11 admin page toggleHelperForPlan never auto-populates all tools on single selection', () => {
    const adminPath = path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte');
    const adminContent = readSafe(adminPath);
    // Must NOT have ALL_TOOLS.map in toggleHelperForPlan
    const toggleHelperSnippet = adminContent.slice(
      adminContent.indexOf('function toggleHelperForPlan'),
      adminContent.indexOf('function selectAllHelpersForPlan')
    );
    assert.ok(!toggleHelperSnippet.includes('ALL_TOOLS.map'), 'toggleHelperForPlan must never auto-populate ALL_TOOLS.map');
  });

  it('1.12 admin page toggleToolForPlan never auto-populates all tools on single selection', () => {
    const adminPath = path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte');
    const adminContent = readSafe(adminPath);
    // Must NOT have TOOL_CONNECTORS.map in toggleToolForPlan
    const toggleToolSnippet = adminContent.slice(
      adminContent.indexOf('function toggleToolForPlan'),
      adminContent.indexOf('function selectAllToolsForPlan')
    );
    assert.ok(!toggleToolSnippet.includes('TOOL_CONNECTORS.map'), 'toggleToolForPlan must never auto-populate TOOL_CONNECTORS.map');
  });
});
