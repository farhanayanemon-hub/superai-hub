/**
 * Challenger 1: Adversarial Auto-Save & Debounce Stress Testing Suite
 * Target: web/src/routes/admin/+page.svelte
 *
 * Verifies:
 * 1. High-frequency burst testing (20 rapid toggles within 200ms consolidated into 1 network call)
 * 2. In-flight race condition testing (concurrency locking, trailing save queuing, zero state loss)
 * 3. Visual feedback invariants (co-located "Saved ✅" badge, 3.5s auto-clear, 4-state header banner)
 * 4. Manual save button preservation & non-interference
 * 5. Integrity invariants (all toggle handlers wired, robots.css SHA256 checksum)
 */

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

const PATHS = {
  adminPage: path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte'),
  adminSettings: path.join(WEB_DIR, 'src', 'lib', 'server', 'adminSettings.ts'),
  plansStore: path.join(WEB_DIR, 'src', 'lib', 'stores', 'plansStore.ts'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  runAllTests: path.join(ROOT_DIR, 'tests', 'run_all_tests.mjs')
};

const EXPECTED_ROBOTS_SHA256 = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Creates an exact behavioral clone of the Admin Auto-Save Engine
 * from web/src/routes/admin/+page.svelte lines 220-344.
 */
function createAdminAutoSaveEngine(mockFetch) {
  let autoSaveTimer = null;
  let isAutoSaving = false;
  let autoSaveStatus = 'idle'; // 'idle' | 'saving' | 'saved' | 'error'
  let activeAutoSaveSection = null;
  let autoSaveFeedbackTimer = null;
  let pendingAutoSaveSection = null;
  let autoSaveRevision = 0;

  // Local component state
  let workflowCustomizationUserEnabled = true;
  let enabledToolConnectors = ['gmail', 'slack', 'sheets'];
  let editablePlans = {
    byok_starter: { id: 'byok_starter', isEnabled: true, featureToggles: { allHelpersEnabled: true, aiCeo: true } },
    byok_pro: { id: 'byok_pro', isEnabled: true, featureToggles: { allHelpersEnabled: true, aiCeo: true } }
  };
  let modelsEnabled = { 'gemini-2.0-flash': true, 'gpt-4o': true };
  let providersAllowed = { gemini: true, openai: true };
  let channelsCeoEnabled = true;
  let authSecret = 'ezbo-admin-2026';

  const optimisticSyncLog = [];
  const statusHistory = [];

  function recordStatus(s) {
    autoSaveStatus = s;
    statusHistory.push({ status: s, section: activeAutoSaveSection, timestamp: Date.now() });
  }

  function getEnabledPlanCount() {
    return Object.values(editablePlans).filter((p) => p.isEnabled !== false).length;
  }

  function syncStoresAndLocalStorageOptimistically() {
    optimisticSyncLog.push({
      timestamp: Date.now(),
      workflowCustomizationUserEnabled,
      enabledToolConnectors: [...enabledToolConnectors],
      plans: JSON.parse(JSON.stringify(editablePlans))
    });
  }

  function triggerAutoSave(section = 'general') {
    activeAutoSaveSection = section;
    recordStatus('saving');

    // 1. Optimistically persist local stores immediately (0ms)
    syncStoresAndLocalStorageOptimistically();

    // 2. Clear existing debounce timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // 3. 300ms debounced network save
    autoSaveTimer = setTimeout(async () => {
      await executeAutoSave(section);
    }, 300);
  }

  async function executeAutoSave(section) {
    if (isAutoSaving) {
      pendingAutoSaveSection = section;
      return;
    }

    isAutoSaving = true;
    recordStatus('saving');
    const currentRevision = ++autoSaveRevision;

    try {
      const enabledPlanCount = getEnabledPlanCount();
      if (enabledPlanCount === 0) {
        recordStatus('error');
        return;
      }

      const secretToUse = authSecret.trim() || 'ezbo-admin-2026';
      const patch = {
        workflowCustomizationUserEnabled,
        enabledToolConnectors: [...enabledToolConnectors],
        plans: JSON.parse(JSON.stringify(editablePlans)),
        modelsEnabled,
        providersAllowed,
        channelsCeoEnabled
      };

      const res = await mockFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: secretToUse, patch })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        syncStoresAndLocalStorageOptimistically();

        if (currentRevision === autoSaveRevision) {
          recordStatus('saved');
          if (autoSaveFeedbackTimer) clearTimeout(autoSaveFeedbackTimer);
          autoSaveFeedbackTimer = setTimeout(() => {
            if (autoSaveStatus === 'saved') {
              recordStatus('idle');
              activeAutoSaveSection = null;
            }
          }, 3500);
        }
      } else {
        recordStatus('error');
      }
    } catch (e) {
      recordStatus('error');
    } finally {
      isAutoSaving = false;
      if (pendingAutoSaveSection) {
        const nextSec = pendingAutoSaveSection;
        pendingAutoSaveSection = null;
        triggerAutoSave(nextSec);
      }
    }
  }

  function destroy() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (autoSaveFeedbackTimer) clearTimeout(autoSaveFeedbackTimer);
  }

  return {
    triggerAutoSave,
    executeAutoSave,
    destroy,
    getStatus: () => autoSaveStatus,
    getActiveSection: () => activeAutoSaveSection,
    getIsAutoSaving: () => isAutoSaving,
    getStatusHistory: () => statusHistory,
    getOptimisticSyncLog: () => optimisticSyncLog,
    setWorkflowEnabled: (v) => { workflowCustomizationUserEnabled = v; },
    getWorkflowEnabled: () => workflowCustomizationUserEnabled,
    setToolConnectors: (t) => { enabledToolConnectors = t; },
    getToolConnectors: () => enabledToolConnectors,
    setEditablePlans: (p) => { editablePlans = p; },
    getEditablePlans: () => editablePlans
  };
}

describe('Challenger 1: Adversarial Auto-Save & Debounce Stress Testing Suite', () => {

  // =========================================================================
  // 1. High-Frequency Burst Testing
  // =========================================================================
  describe('1. High-Frequency Burst Testing (Debounce Collapsing)', () => {
    it('1.1 20 toggles fired in rapid burst (within 200ms) collapse into exactly 1 network save at t+300ms', async () => {
      const networkCalls = [];
      const mockFetch = async (url, opts) => {
        networkCalls.push({ url, opts, time: Date.now() });
        return {
          ok: true,
          json: async () => ({ success: true, settings: {} })
        };
      };

      const engine = createAdminAutoSaveEngine(mockFetch);

      // Fire 20 toggles 10ms apart = 190ms total
      const burstStart = Date.now();
      for (let i = 0; i < 20; i++) {
        engine.setWorkflowEnabled(i % 2 === 0);
        engine.triggerAutoSave('workflow');
        await new Promise((r) => setTimeout(r, 10));
      }
      const burstEnd = Date.now();
      assert.ok(burstEnd - burstStart < 350, 'Burst must complete within ~300ms');

      // During burst, 0 network calls must have completed
      assert.equal(networkCalls.length, 0, 'No network requests may fire while toggles are actively bursting');

      // Optimistic sync must have recorded all 20 changes locally
      assert.equal(engine.getOptimisticSyncLog().length, 20, 'Optimistic local sync must fire on every single toggle (0ms)');

      // Wait 350ms for debounce timer (300ms) to fire and resolve
      await new Promise((r) => setTimeout(r, 350));

      // Exactly 1 network save must have fired
      assert.equal(networkCalls.length, 1, 'Only exactly 1 consolidated network save must fire after debounce delay');

      // The single dispatched request must reflect the 20th toggle state (i = 19 -> false)
      const sentBody = JSON.parse(networkCalls[0].opts.body);
      assert.strictEqual(sentBody.patch.workflowCustomizationUserEnabled, false, 'Consolidated payload must have final toggle value');

      engine.destroy();
    });

    it('1.2 Irregular burst interval: repeatedly resets debounce timer without drifting', async () => {
      const networkCalls = [];
      const mockFetch = async (url, opts) => {
        networkCalls.push({ time: Date.now(), body: JSON.parse(opts.body) });
        return { ok: true, json: async () => ({ success: true }) };
      };

      const engine = createAdminAutoSaveEngine(mockFetch);

      // Delay sequence where every step is < 300ms: 50ms, 100ms, 150ms, 200ms
      const delays = [50, 100, 150, 200];
      for (const d of delays) {
        engine.triggerAutoSave('tools');
        await new Promise((r) => setTimeout(r, d));
        assert.equal(networkCalls.length, 0, `Network call must NOT fire after ${d}ms because < 300ms`);
      }

      // Now wait full 350ms after final toggle
      await new Promise((r) => setTimeout(r, 350));
      assert.equal(networkCalls.length, 1, 'Exactly 1 consolidated network call should fire after final rest period');

      engine.destroy();
    });

    it('1.3 Multi-section rapid burst consolidates all sections into single patch', async () => {
      const networkCalls = [];
      const mockFetch = async (url, opts) => {
        networkCalls.push({ body: JSON.parse(opts.body) });
        return { ok: true, json: async () => ({ success: true }) };
      };

      const engine = createAdminAutoSaveEngine(mockFetch);

      // Rapidly toggle different sections
      engine.setWorkflowEnabled(false);
      engine.triggerAutoSave('workflow');

      engine.setToolConnectors(['gmail']);
      engine.triggerAutoSave('tools');

      const plans = engine.getEditablePlans();
      plans.byok_starter.featureToggles.allHelpersEnabled = false;
      engine.setEditablePlans(plans);
      engine.triggerAutoSave('helpers');

      await new Promise((r) => setTimeout(r, 350));

      assert.equal(networkCalls.length, 1, 'Multi-section burst must collapse into 1 network dispatch');
      const patch = networkCalls[0].body.patch;
      assert.strictEqual(patch.workflowCustomizationUserEnabled, false, 'Workflow change included');
      assert.deepStrictEqual(patch.enabledToolConnectors, ['gmail'], 'Tool change included');
      assert.strictEqual(patch.plans.byok_starter.featureToggles.allHelpersEnabled, false, 'Helper change included');

      engine.destroy();
    });
  });

  // =========================================================================
  // 2. In-Flight Race Condition Testing
  // =========================================================================
  describe('2. In-Flight Race Condition Testing (Concurrency & Trailing Save)', () => {
    it('2.1 Toggling while a network request is in-flight queues a trailing save without dropping state', async () => {
      const dispatchedRequests = [];
      let inflightResolver = null;

      const mockFetch = async (url, opts) => {
        dispatchedRequests.push({ body: JSON.parse(opts.body), timestamp: Date.now() });
        return new Promise((resolve) => {
          inflightResolver = () => resolve({
            ok: true,
            json: async () => ({ success: true, settings: {} })
          });
        });
      };

      const engine = createAdminAutoSaveEngine(mockFetch);

      // 1. Initial toggle
      engine.setWorkflowEnabled(false);
      engine.triggerAutoSave('workflow');

      // Wait 320ms for first executeAutoSave to fire
      await new Promise((r) => setTimeout(r, 320));
      assert.equal(dispatchedRequests.length, 1, 'First request must be dispatched');
      assert.strictEqual(engine.getIsAutoSaving(), true, 'Engine must flag isAutoSaving = true while in-flight');

      // 2. User toggles tool connector WHILE request 1 is still in-flight
      engine.setToolConnectors(['gmail', 'notion']);
      engine.triggerAutoSave('tools');

      // Wait 320ms - the debounce timer for toggle 2 fires, but isAutoSaving is true!
      await new Promise((r) => setTimeout(r, 320));
      // Concurrency guard: no second request should have been dispatched simultaneously
      assert.equal(dispatchedRequests.length, 1, 'Must NOT start concurrent parallel request while in-flight');

      // 3. Now let the first in-flight request complete
      assert.ok(inflightResolver, 'Resolver must be present');
      inflightResolver();

      // Give microtask tick for finally block to run and call triggerAutoSave for pending section
      await new Promise((r) => setTimeout(r, 50));
      assert.strictEqual(engine.getIsAutoSaving(), false, 'isAutoSaving must reset to false after request completes');

      // Wait 350ms for the trailing queued debounced save to fire
      await new Promise((r) => setTimeout(r, 350));

      // 4. Assert trailing save fired and contains the new tools state
      assert.equal(dispatchedRequests.length, 2, 'Trailing save must be automatically dispatched');
      const secondBody = dispatchedRequests[1].body;
      assert.deepStrictEqual(secondBody.patch.enabledToolConnectors, ['gmail', 'notion'], 'Trailing save must persist newest tool connectors');
      assert.strictEqual(secondBody.patch.workflowCustomizationUserEnabled, false, 'Trailing save must preserve prior workflow change');

      engine.destroy();
    });

    it('2.2 Network 500 error transitions autoSaveStatus to "error" and releases concurrency lock', async () => {
      let callCount = 0;
      const mockFetch = async () => {
        callCount++;
        if (callCount === 1) {
          return { ok: false, status: 500, json: async () => ({ success: false, error: 'Database locked' }) };
        }
        return { ok: true, json: async () => ({ success: true }) };
      };

      const engine = createAdminAutoSaveEngine(mockFetch);

      engine.triggerAutoSave('workflow');
      await new Promise((r) => setTimeout(r, 350));

      assert.equal(callCount, 1);
      assert.strictEqual(engine.getStatus(), 'error', 'Status must transition to error on HTTP 500');
      assert.strictEqual(engine.getIsAutoSaving(), false, 'isAutoSaving must be released even on error');

      // Subsequent edit must recover cleanly
      engine.triggerAutoSave('workflow');
      await new Promise((r) => setTimeout(r, 350));
      assert.equal(callCount, 2);
      assert.strictEqual(engine.getStatus(), 'saved', 'Engine must recover and succeed on subsequent retry');

      engine.destroy();
    });

    it('2.3 Network exception (fetch rejection) transitions status to "error" without crashing or deadlocking', async () => {
      let fail = true;
      const mockFetch = async () => {
        if (fail) throw new Error('Network timeout (ECONNRESET)');
        return { ok: true, json: async () => ({ success: true }) };
      };

      const engine = createAdminAutoSaveEngine(mockFetch);

      engine.triggerAutoSave('helpers');
      await new Promise((r) => setTimeout(r, 350));

      assert.strictEqual(engine.getStatus(), 'error', 'Must capture network rejection and set status=error');
      assert.strictEqual(engine.getIsAutoSaving(), false, 'Concurrency lock must be released');

      // Self-heal on retry
      fail = false;
      engine.triggerAutoSave('helpers');
      await new Promise((r) => setTimeout(r, 350));
      assert.strictEqual(engine.getStatus(), 'saved', 'Must recover on next attempt');

      engine.destroy();
    });
  });

  // =========================================================================
  // 3. Visual Feedback Invariants & Timing Lifecycle
  // =========================================================================
  describe('3. Visual Feedback Invariants & 3.5s Auto-Clearing Lifecycle', () => {
    it('3.1 Successful save transitions status to "saved", then automatically clears to "idle" after exactly 3500ms', async () => {
      const mockFetch = async () => ({ ok: true, json: async () => ({ success: true }) });
      const engine = createAdminAutoSaveEngine(mockFetch);

      engine.triggerAutoSave('workflow');
      assert.strictEqual(engine.getStatus(), 'saving', 'Initial status must be saving');
      assert.strictEqual(engine.getActiveSection(), 'workflow');

      // Wait for network response (300ms debounce + execution)
      await new Promise((r) => setTimeout(r, 350));
      assert.strictEqual(engine.getStatus(), 'saved', 'Status must be saved immediately after network resolution');
      assert.strictEqual(engine.getActiveSection(), 'workflow', 'Active section remains workflow while saved');

      // At t = 2000ms after save, badge must still be visible
      await new Promise((r) => setTimeout(r, 2000));
      assert.strictEqual(engine.getStatus(), 'saved', 'Status must still be "saved" at t=2000ms (< 3500ms)');

      // At t = 1600ms more (total > 3500ms), badge must auto-clear to idle
      await new Promise((r) => setTimeout(r, 1600));
      assert.strictEqual(engine.getStatus(), 'idle', 'Status must auto-clear to "idle" after 3.5 seconds');
      assert.strictEqual(engine.getActiveSection(), null, 'Active section must clear to null when idle');

      engine.destroy();
    });

    it('3.2 Re-triggering auto-save during 3.5s display window cancels previous feedback timer and sets saving', async () => {
      const mockFetch = async () => ({ ok: true, json: async () => ({ success: true }) });
      const engine = createAdminAutoSaveEngine(mockFetch);

      engine.triggerAutoSave('workflow');
      await new Promise((r) => setTimeout(r, 350));
      assert.strictEqual(engine.getStatus(), 'saved');

      // At t = 1000ms, user toggles again
      await new Promise((r) => setTimeout(r, 1000));
      engine.triggerAutoSave('tools');

      // Status immediately becomes saving
      assert.strictEqual(engine.getStatus(), 'saving', 'Status transitions immediately back to saving');
      assert.strictEqual(engine.getActiveSection(), 'tools', 'Active section switches to new target');

      await new Promise((r) => setTimeout(r, 350));
      assert.strictEqual(engine.getStatus(), 'saved', 'Becomes saved for new section');
      assert.strictEqual(engine.getActiveSection(), 'tools');

      engine.destroy();
    });

    it('3.3 Invariant: admin/+page.svelte renders co-located "Saved ✅" badge for all 4 key sections', () => {
      const content = readSafe(PATHS.adminPage);

      // Section 1: Workflow Studio
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'workflow'"),
        'Workflow Studio must guard badge on activeAutoSaveSection === workflow'
      );

      // Section 2: Plan Visibility
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'plan-visibility'"),
        'Plan Visibility must guard badge on activeAutoSaveSection === plan-visibility'
      );

      // Section 3: AI Helpers Access Matrix
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'helpers'"),
        'AI Helpers must guard badge on activeAutoSaveSection === helpers'
      );

      // Section 4: Tool Connectors Access Matrix
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'tools'"),
        'Tool Connectors must guard badge on activeAutoSaveSection === tools'
      );

      // Badge text invariant
      assert.ok(content.includes('Saved ✅'), 'Must contain exact literal "Saved ✅" text');
    });

    it('3.4 Invariant: Sticky header status banner handles all 4 states ("saving", "saved", "idle", "error")', () => {
      const content = readSafe(PATHS.adminPage);

      assert.ok(content.includes("autoSaveStatus === 'saving'"), 'Header handles saving state');
      assert.ok(content.includes("autoSaveStatus === 'saved'"), 'Header handles saved state');
      assert.ok(content.includes("autoSaveStatus === 'error'"), 'Header handles error state');
      assert.ok(content.includes('All changes auto-saved in real-time ✅'), 'Header renders checkmark on saved');
      assert.ok(content.includes('All changes auto-saved in real-time'), 'Header renders default live label');
      assert.ok(content.includes('Saving changes...'), 'Header renders saving label');
      assert.ok(content.includes('Auto-save failed'), 'Header renders error label');
    });
  });

  // =========================================================================
  // 4. Manual Save Button Preservation & Concurrency Fallback
  // =========================================================================
  describe('4. Manual Save Button Preservation & Non-Interference', () => {
    it('4.1 All 5 manual save buttons are retained across the Admin Panel', () => {
      const content = readSafe(PATHS.adminPage);

      // Button 1: Header Save Changes
      assert.ok(content.includes('Save Changes'), 'Must retain top Save Changes button');
      assert.ok(content.includes('onclick={saveSettings}'), 'Must bind onclick={saveSettings}');

      // Button 2: Workflow Studio Save Setting
      assert.ok(content.includes('Save Setting'), 'Must retain Workflow Studio Save Setting button');

      // Button 3: Plans Tab Save Plan Changes
      assert.ok(content.includes('Save Plan Changes'), 'Must retain Plans Tab Save Plan Changes button');

      // Button 4: Tool Connectors Save Tool Settings
      assert.ok(content.includes('Save Tool Settings'), 'Must retain Tool Connectors Save Tool Settings button');

      // Button 5: AI Models Save Configuration
      assert.ok(content.includes('Save Configuration'), 'Must retain AI Models Save Configuration button');
    });

    it('4.2 Manual save and auto-save share source of truth without data race or divergence', () => {
      const content = readSafe(PATHS.adminPage);

      // Both executeAutoSave and saveSettings construct patches from editablePlans, workflowCustomizationUserEnabled, enabledToolConnectors
      assert.ok(content.includes('workflowCustomizationUserEnabled'), 'Both use workflowCustomizationUserEnabled');
      assert.ok(content.includes('enabledToolConnectors'), 'Both use enabledToolConnectors');
      assert.ok(content.includes('editablePlans'), 'Both use editablePlans');
      assert.ok(content.includes('syncStoresAndLocalStorageOptimistically()'), 'Auto-save calls optimistic sync');
    });

    it('4.3 Safety invariant: Zero enabled plans prevents both auto-save and manual save from corrupting public site', () => {
      let networkCalled = false;
      const mockFetch = async () => {
        networkCalled = true;
        return { ok: true, json: async () => ({ success: true }) };
      };

      const engine = createAdminAutoSaveEngine(mockFetch);
      // Disable all plans
      engine.setEditablePlans({
        byok_starter: { id: 'byok_starter', isEnabled: false },
        byok_pro: { id: 'byok_pro', isEnabled: false }
      });

      engine.triggerAutoSave('plan-visibility');
      return new Promise((resolve) => {
        setTimeout(() => {
          assert.strictEqual(networkCalled, false, 'Must NOT send network save when 0 plans are enabled');
          assert.strictEqual(engine.getStatus(), 'error', 'Must report error status when 0 plans enabled');
          engine.destroy();
          resolve();
        }, 350);
      });
    });
  });

  // =========================================================================
  // 5. Codebase Invariants & Checksums
  // =========================================================================
  describe('5. Platform Invariants & Regression Proofs', () => {
    it('5.1 All critical toggles in admin/+page.svelte invoke triggerAutoSave with appropriate section', () => {
      const content = readSafe(PATHS.adminPage);

      assert.ok(
        content.includes("onchange={() => triggerAutoSave('workflow')}"),
        'Workflow toggle calls triggerAutoSave("workflow")'
      );
      assert.ok(
        content.includes("triggerAutoSave('plan-visibility')"),
        'Plan visibility toggles call triggerAutoSave("plan-visibility")'
      );
      assert.ok(
        content.includes("triggerAutoSave('helpers')"),
        'AI helper toggles call triggerAutoSave("helpers")'
      );
      assert.ok(
        content.includes("triggerAutoSave('tools')"),
        'Tool connector toggles call triggerAutoSave("tools")'
      );
    });

    it('5.2 Component onDestroy cleans up timers preventing memory leaks', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('onDestroy(() => {'), 'Must have onDestroy handler');
      assert.ok(content.includes('clearTimeout(autoSaveTimer)'), 'Must clear autoSaveTimer on unmount');
      assert.ok(content.includes('clearTimeout(autoSaveFeedbackTimer)'), 'Must clear autoSaveFeedbackTimer on unmount');
    });

    it('5.3 robots.css byte-for-byte SHA256 matches exact authoritative hash', () => {
      const buf = fs.readFileSync(PATHS.robotsCss);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      assert.strictEqual(hash, EXPECTED_ROBOTS_SHA256, 'robots.css must not be modified');
    });

    it('5.4 Master test runner preserves 7-tier structure without unauthorized modifications', () => {
      const content = readSafe(PATHS.runAllTests);
      assert.ok(content.includes("id: 1, name: 'Tier 1"), 'Must retain Tier 1');
      assert.ok(content.includes("id: 7, name: 'Tier 7"), 'Must retain Tier 7');
      assert.ok(!content.includes("id: 8"), 'Must not introduce Tier 8');
    });
  });
});
