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

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

const PATHS = {
  adminPage: path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte'),
  plansStore: path.join(WEB_DIR, 'src', 'lib', 'stores', 'plansStore.ts'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css')
};

const EXPECTED_ROBOTS_SHA256 = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

describe('Milestone 2: Admin Panel Real-Time Debounced Auto-Save & Visual Feedback Suite', () => {

  describe('1. Auto-Save Engine Architecture & 300ms Debounce', () => {
    it('1.1 admin/+page.svelte declares autoSave state variables', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;'), 'Must declare autoSaveTimer');
      assert.ok(content.includes('let isAutoSaving = $state(false);'), 'Must declare isAutoSaving');
      assert.ok(content.includes("let autoSaveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');"), 'Must declare autoSaveStatus');
      assert.ok(content.includes('let activeAutoSaveSection = $state<'), 'Must declare activeAutoSaveSection');
      assert.ok(content.includes('let autoSaveFeedbackTimer: ReturnType<typeof setTimeout> | null = null;'), 'Must declare autoSaveFeedbackTimer');
      assert.ok(content.includes('let pendingAutoSaveSection:'), 'Must declare pendingAutoSaveSection');
    });

    it('1.2 admin/+page.svelte implements triggerAutoSave with 300ms debounce and optimistic sync', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('function triggerAutoSave('), 'Must define triggerAutoSave');
      assert.ok(content.includes('syncStoresAndLocalStorageOptimistically()'), 'triggerAutoSave must call optimistic sync immediately');
      assert.ok(content.includes('clearTimeout(autoSaveTimer)'), 'triggerAutoSave must clear existing timer');
      assert.ok(content.includes('setTimeout(async () => {'), 'triggerAutoSave must create debounced timer');
      assert.ok(content.includes('300);'), 'triggerAutoSave debounce duration must be 300ms');
    });

    it('1.3 admin/+page.svelte implements executeAutoSave with network dispatch and trailing call handling', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('async function executeAutoSave('), 'Must define executeAutoSave');
      assert.ok(content.includes('if (isAutoSaving) {'), 'Must check isAutoSaving concurrency guard');
      assert.ok(content.includes('pendingAutoSaveSection = section;'), 'Must queue pendingAutoSaveSection when busy');
      assert.ok(content.includes("fetch('/api/admin/settings'"), 'executeAutoSave must send POST to /api/admin/settings');
      assert.ok(content.includes("autoSaveStatus = 'saved'"), 'executeAutoSave must set autoSaveStatus = saved on success');
      assert.ok(content.includes("autoSaveStatus = 'error'"), 'executeAutoSave must set autoSaveStatus = error on failure');
      assert.ok(content.includes('isAutoSaving = false'), 'executeAutoSave must release isAutoSaving in finally block');
      assert.ok(content.includes('if (pendingAutoSaveSection) {'), 'executeAutoSave must process trailing pending save');
    });

    it('1.4 syncStoresAndLocalStorageOptimistically syncs ezbo_admin_plans_master and stores', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('function syncStoresAndLocalStorageOptimistically()'), 'Must define syncStoresAndLocalStorageOptimistically');
      assert.ok(content.includes("localStorage.setItem('ezbo_admin_plans_master'"), 'Must persist ezbo_admin_plans_master');
      assert.ok(content.includes("localStorage.setItem('ezbo_enabled_tool_connectors'"), 'Must persist ezbo_enabled_tool_connectors');
      assert.ok(content.includes("localStorage.setItem('ezbo_workflow_user_enabled'"), 'Must persist ezbo_workflow_user_enabled');
      assert.ok(content.includes("localStorage.setItem('ezbo_public_plans'"), 'Must persist ezbo_public_plans');
      assert.ok(content.includes('plansStore.set('), 'Must update plansStore');
      assert.ok(content.includes('workflowCustomizationUserStore.set('), 'Must update workflowCustomizationUserStore');
      assert.ok(content.includes('enabledToolConnectorsStore.set('), 'Must update enabledToolConnectorsStore');
    });
  });

  describe('2. Hooking Up All Required Toggles', () => {
    it('2.1 Workflow Studio toggle retains bind:checked and calls triggerAutoSave("workflow")', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('bind:checked={workflowCustomizationUserEnabled}'),
        'Workflow switch must retain bind:checked={workflowCustomizationUserEnabled} for test invariance'
      );
      assert.ok(
        content.includes("onchange={() => triggerAutoSave('workflow')}"),
        'Workflow switch must call triggerAutoSave("workflow") onchange'
      );
    });

    it('2.2 Plan visibility and deletion toggles trigger auto-save', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('function togglePlanVisibility(') && content.includes("triggerAutoSave('plan-visibility')"),
        'togglePlanVisibility must call triggerAutoSave'
      );
      assert.ok(
        content.includes('function deleteOrHidePlan(') && content.includes("triggerAutoSave('plan-visibility')"),
        'deleteOrHidePlan must call triggerAutoSave'
      );
      assert.ok(
        content.includes('function restorePlan(') && content.includes("triggerAutoSave('plan-visibility')"),
        'restorePlan must call triggerAutoSave'
      );
    });

    it('2.3 AI Helpers master and individual toggles trigger auto-save', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("triggerAutoSave('helpers')"),
        'Must call triggerAutoSave("helpers")'
      );
      assert.ok(
        content.includes('function toggleHelperForPlan(') && content.includes("triggerAutoSave('helpers')"),
        'toggleHelperForPlan must call triggerAutoSave("helpers")'
      );
      assert.ok(
        content.includes('function selectAllHelpersForPlan(') && content.includes("triggerAutoSave('helpers')"),
        'selectAllHelpersForPlan must call triggerAutoSave("helpers")'
      );
      assert.ok(
        content.includes('function clearAllHelpersForPlan(') && content.includes("triggerAutoSave('helpers')"),
        'clearAllHelpersForPlan must call triggerAutoSave("helpers")'
      );
    });

    it('2.4 Tool Connectors master and individual toggles trigger auto-save', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("triggerAutoSave('tools')"),
        'Must call triggerAutoSave("tools")'
      );
      assert.ok(
        content.includes('function toggleToolForPlan(') && content.includes("triggerAutoSave('tools')"),
        'toggleToolForPlan must call triggerAutoSave("tools")'
      );
      assert.ok(
        content.includes('function selectAllToolsForPlan(') && content.includes("triggerAutoSave('tools')"),
        'selectAllToolsForPlan must call triggerAutoSave("tools")'
      );
      assert.ok(
        content.includes('function clearAllToolsForPlan(') && content.includes("triggerAutoSave('tools')"),
        'clearAllToolsForPlan must call triggerAutoSave("tools")'
      );
    });
  });

  describe('3. Visual Feedback Badging & Top Status Banner', () => {
    it('3.1 Co-located Saved ✅ badge is rendered adjacent to Workflow Studio switch', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'workflow'"),
        'Must check autoSaveStatus and workflow section'
      );
      assert.ok(
        content.includes('Saved ✅'),
        'Must render "Saved ✅" badge'
      );
    });

    it('3.2 Co-located Saved ✅ badge is rendered adjacent to Plan Visibility card', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'plan-visibility'"),
        'Must check autoSaveStatus and plan-visibility section'
      );
    });

    it('3.3 Co-located Saved ✅ badge is rendered adjacent to AI Helpers Access Matrix header', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'helpers'"),
        'Must check autoSaveStatus and helpers section'
      );
    });

    it('3.4 Co-located Saved ✅ badge is rendered adjacent to Tool Connectors Access Matrix header', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'tools'"),
        'Must check autoSaveStatus and tools section'
      );
    });

    it('3.5 Top sticky header renders real-time auto-save status banner', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('All changes auto-saved in real-time'),
        'Sticky header must render "All changes auto-saved in real-time"'
      );
      assert.ok(
        content.includes('Saving changes...'),
        'Sticky header must render "Saving changes..." when active'
      );
    });
  });

  describe('4. Manual Save Button Preservation & Substring Invariance', () => {
    it('4.1 Preserves all manual Save buttons across the Admin Panel', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('Save Changes'), 'Must retain top Save Changes button');
      assert.ok(content.includes('Save Setting'), 'Must retain Workflow Save Setting button');
      assert.ok(content.includes('Save Plan Changes'), 'Must retain Plans Save Plan Changes button');
      assert.ok(content.includes('Save Tool Settings'), 'Must retain Tools Save Tool Settings button');
      assert.ok(content.includes('Save Configuration'), 'Must retain Models Save Configuration button');
    });

    it('4.2 robots.css byte-for-byte SHA256 checksum remains intact', () => {
      const buffer = fs.readFileSync(PATHS.robotsCss);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      assert.strictEqual(
        hash,
        EXPECTED_ROBOTS_SHA256,
        'robots.css must remain strictly unchanged'
      );
    });
  });
});
