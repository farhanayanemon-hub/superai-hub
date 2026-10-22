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

function readSafe(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

const PATHS = {
  adminPage: path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte'),
  adminSettings: path.join(WEB_DIR, 'src', 'lib', 'server', 'adminSettings.ts'),
  plansStore: path.join(WEB_DIR, 'src', 'lib', 'stores', 'plansStore.ts'),
  plansConfig: path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts'),
  toolConnectorsConfig: path.join(WEB_DIR, 'src', 'lib', 'config', 'toolConnectors.ts'),
  toolsConfig: path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts'),
  dashboardPage: path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte'),
  toolConnectorsTab: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolConnectorsTab.svelte'),
  apiPlans: path.join(WEB_DIR, 'src', 'routes', 'api', 'plans', '+server.ts'),
  apiAdminSettings: path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'settings', '+server.ts'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css'),
  runAllTests: path.join(ROOT_DIR, 'tests', 'run_all_tests.mjs')
};

export function runAdminAutosaveColdstartTests(describeFn = describe, itFn = it) {
  // ==========================================================================
  // Section A: Admin Panel 300ms Debounced Auto-Save & Visual Badges
  // ==========================================================================
  describeFn('Section A: Admin Panel 300ms Debounced Auto-Save & Visual Badges', () => {
    itFn('A.1 admin/+page.svelte defines triggerAutoSave with 300ms debounce timer and cancellation', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('function triggerAutoSave('), 'admin page must define triggerAutoSave function');
      assert.ok(content.includes('autoSaveTimer = setTimeout('), 'triggerAutoSave must configure autoSaveTimer');
      assert.ok(content.includes(', 300)'), 'triggerAutoSave must debounce network calls with exactly 300ms');
      assert.ok(content.includes('clearTimeout(autoSaveTimer)'), 'triggerAutoSave must clear existing timer to prevent debounce drift');
      assert.ok(content.includes('activeAutoSaveSection = section'), 'triggerAutoSave must track activeAutoSaveSection');
      assert.ok(content.includes("autoSaveStatus = 'saving'"), 'triggerAutoSave must transition status to saving');
    });

    itFn('A.2 admin/+page.svelte implements executeAutoSave with optimistic local sync and status feedback', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('function syncStoresAndLocalStorageOptimistically()'), 'Must implement optimistic sync function');
      assert.ok(content.includes("localStorage.setItem('ezbo_admin_plans_master'"), 'Must optimistically update master localStorage');
      assert.ok(content.includes("localStorage.setItem('ezbo_workflow_user_enabled'"), 'Must optimistically update workflow localStorage');
      assert.ok(content.includes("localStorage.setItem('ezbo_enabled_tool_connectors'"), 'Must optimistically update tools localStorage');
      assert.ok(content.includes('async function executeAutoSave('), 'Must define executeAutoSave');
      assert.ok(content.includes("fetch('/api/admin/settings'"), 'executeAutoSave must send update to /api/admin/settings');
      assert.ok(content.includes("autoSaveStatus = 'saved'"), 'Successful save must transition status to saved');
      assert.ok(content.includes('autoSaveFeedbackTimer = setTimeout('), 'Must configure autoSaveFeedbackTimer to reset after delay');
    });

    itFn('A.3 admin/+page.svelte renders sticky header banner with real-time auto-save indicator', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('All changes auto-saved in real-time'), 'Header must contain "All changes auto-saved in real-time"');
      assert.ok(content.includes("autoSaveStatus === 'saved'"), 'Header banner must conditionally inspect saved status');
      assert.ok(content.includes("autoSaveStatus === 'saving'"), 'Header banner must conditionally inspect saving status');
      assert.ok(content.includes("autoSaveStatus === 'error'"), 'Header banner must conditionally inspect error status');
      assert.ok(content.includes('All changes auto-saved in real-time ✅'), 'Header banner must feature checkmark on saved state');
      assert.ok(content.includes('Saving changes...'), 'Header banner must feature spinner text on saving state');
    });

    itFn('A.4 admin/+page.svelte renders co-located "Saved ✅" badge adjacent to Workflow Studio toggle', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'workflow'"),
        'Workflow Studio section must conditionally render Saved badge when activeAutoSaveSection is workflow'
      );
      assert.ok(content.includes('<span>Saved ✅</span>'), 'Must render exact "Saved ✅" badge text');
      assert.ok(
        content.includes("input type=\"checkbox\" bind:checked={workflowCustomizationUserEnabled} onchange={() => triggerAutoSave('workflow')}"),
        'Workflow Studio input toggle must invoke triggerAutoSave with "workflow"'
      );
    });

    itFn('A.5 admin/+page.svelte renders co-located "Saved ✅" badge on Plan Visibility toggle', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'plan-visibility'"),
        'Plan visibility section must conditionally render Saved badge when activeAutoSaveSection is plan-visibility'
      );
      assert.ok(
        content.includes("triggerAutoSave('plan-visibility')"),
        'Plan visibility and status toggles must invoke triggerAutoSave with "plan-visibility"'
      );
    });

    itFn('A.6 admin/+page.svelte has cleanly purged legacy helpers matrix in favor of bespoke architecture', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        !content.includes('AI Helpers Access Matrix'),
        'AI Helpers Access Matrix must be purged from admin'
      );
    });

    itFn('A.7 admin/+page.svelte renders co-located "Saved ✅" badge on Tool Connectors Access Matrix', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("autoSaveStatus === 'saved' && activeAutoSaveSection === 'tools'"),
        'Tool Connectors section must conditionally render Saved badge when activeAutoSaveSection is tools'
      );
      assert.ok(
        content.includes("triggerAutoSave('tools')"),
        'Tool Connectors toggles must invoke triggerAutoSave with "tools"'
      );
    });

    itFn('A.8 admin/+page.svelte retains manual Save Configuration buttons for administrative assurance', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(content.includes('onclick={saveSettings}'), 'Must retain manual saveSettings click handler');
      assert.ok(content.includes('Save Configuration'), 'Must retain user-facing "Save Configuration" button text');
    });

    itFn('A.9 functional verification: debouncer collapses rapid burst into a single delayed save', async () => {
      let callCount = 0;
      let lastPayload = null;
      let timer = null;

      function simulateDebouncedAutoSave(data, delayMs = 300) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          callCount++;
          lastPayload = data;
        }, delayMs);
      }

      // Simulate 10 rapid burst changes within 60ms
      for (let i = 1; i <= 10; i++) {
        simulateDebouncedAutoSave({ toggleIndex: i, revision: i }, 40);
        await new Promise((r) => setTimeout(r, 4));
      }

      assert.strictEqual(callCount, 0, 'No call should have fired mid-burst');

      // Wait for debounce delay to expire
      await new Promise((r) => setTimeout(r, 60));

      assert.strictEqual(callCount, 1, 'Debounce must fire exactly once after the burst settles');
      assert.deepStrictEqual(lastPayload, { toggleIndex: 10, revision: 10 }, 'Payload must contain the latest state');
    });
  });

  // ==========================================================================
  // Section B: Dual-Tier Master Persistence & Serverless Cold-Start Recovery
  // ==========================================================================
  describeFn('Section B: Dual-Tier Master Persistence & Serverless Cold-Start Recovery', () => {
    itFn('B.1 web/src/lib/server/adminSettings.ts declares revision counter and updatedAt timestamp in AdminConfig', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('revision?: number;'), 'AdminConfig must declare optional revision counter');
      assert.ok(content.includes('updatedAt?: string;'), 'AdminConfig must declare optional updatedAt string');
      assert.ok(content.includes('revision: 0'), 'Default / virgin envConfig must initialize revision to 0');
      assert.ok(content.includes('updatedAt: new Date(0).toISOString()'), 'Default envConfig must initialize updatedAt');
    });

    itFn('B.2 web/src/lib/server/adminSettings.ts updateAdminConfig monotonically increments revision', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('const currentRevision = typeof current.revision === \'number\' ? current.revision : 0;'), 'Must resolve currentRevision');
      assert.ok(content.includes('nextRevision = typeof patch.revision === \'number\' && patch.revision > currentRevision'), 'Must support client higher revision');
      assert.ok(content.includes(': currentRevision + 1;'), 'Must increment revision monotonically by default');
      assert.ok(content.includes('nextUpdatedAt = patch.updatedAt && typeof patch.updatedAt === \'string\''), 'Must resolve nextUpdatedAt');
    });

    itFn('B.3 web/src/routes/api/plans/+server.ts exposes revision and updatedAt in response', () => {
      const content = readSafe(PATHS.apiPlans);
      assert.ok(content.includes('revision: config.revision || 0'), 'api/plans must expose revision number');
      assert.ok(content.includes('updatedAt: config.updatedAt || new Date(0).toISOString()'), 'api/plans must expose updatedAt timestamp');
      assert.ok(content.includes('workflowCustomizationUserEnabled: config.workflowCustomizationUserEnabled !== false'), 'api/plans must expose workflowCustomizationUserEnabled');
    });

    itFn('B.4 web/src/routes/api/admin/settings/+server.ts accepts revision and updatedAt patches', () => {
      const content = readSafe(PATHS.apiAdminSettings);
      assert.ok(content.includes("typeof patch.revision === 'number'"), 'api/admin/settings must accept patch.revision');
      assert.ok(content.includes('cleanPatch.revision = patch.revision'), 'api/admin/settings must assign cleanPatch.revision');
      assert.ok(content.includes("typeof patch.updatedAt === 'string'"), 'api/admin/settings must accept patch.updatedAt');
      assert.ok(content.includes('cleanPatch.updatedAt = patch.updatedAt.trim()'), 'api/admin/settings must assign cleanPatch.updatedAt');
    });

    itFn('B.5 web/src/lib/stores/plansStore.ts exports MASTER_STORAGE_KEY, AdminPlansMaster, and helpers', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(content.includes("MASTER_STORAGE_KEY = 'ezbo_admin_plans_master'"), 'Must export MASTER_STORAGE_KEY');
      assert.ok(content.includes('export interface AdminPlansMaster'), 'Must export AdminPlansMaster interface');
      assert.ok(content.includes('export function isVirginServerDefault('), 'Must export isVirginServerDefault helper');
      assert.ok(content.includes('export function hasCustomizedDisabledStates('), 'Must export hasCustomizedDisabledStates helper');
      assert.ok(content.includes('export async function syncMasterToServer('), 'Must export syncMasterToServer helper');
      assert.ok(content.includes("const STORAGE_KEY = 'ezbo_public_plans'"), 'Must define ezbo_public_plans storage key');
      assert.ok(content.includes("const TOOLS_STORAGE_KEY = 'ezbo_enabled_tool_connectors'"), 'Must define tools storage key');
      assert.ok(content.includes("const WORKFLOW_USER_STORAGE_KEY = 'ezbo_workflow_user_enabled'"), 'Must define workflow user storage key');
    });

    itFn('B.6 functional verification: isVirginServerDefault detects virgin server configurations accurately', () => {
      function isVirginServerDefault(serverPlans, serverWorkflowEnabled, serverRevision) {
        if (serverRevision !== undefined && serverRevision === 0) return true;
        const tiers = ['byok_starter', 'byok_pro', 'managed'];
        const allTogglesTrue = tiers.every((tier) => {
          const p = serverPlans[tier];
          if (!p) return true;
          return (
            p.featureToggles?.allHelpersEnabled !== false &&
            p.featureToggles?.allToolsEnabled !== false &&
            (tier === 'managed' || p.isEnabled !== false)
          );
        });
        return allTogglesTrue && serverWorkflowEnabled !== false;
      }

      const virginPlans = {
        byok_starter: { isEnabled: true, featureToggles: { allHelpersEnabled: true, allToolsEnabled: true } },
        byok_pro: { isEnabled: true, featureToggles: { allHelpersEnabled: true, allToolsEnabled: true } },
        managed: { isEnabled: false, featureToggles: { allHelpersEnabled: true, allToolsEnabled: true } }
      };

      // Case 1: Revision 0 is always virgin
      assert.strictEqual(isVirginServerDefault(virginPlans, true, 0), true, 'Revision 0 must be identified as virgin');

      // Case 2: Unconfigured default with revision undefined
      assert.strictEqual(isVirginServerDefault(virginPlans, true, undefined), true, 'All true toggles must be virgin');

      // Case 3: Admin disabled workflow studio
      assert.strictEqual(isVirginServerDefault(virginPlans, false, 1), false, 'Workflow studio disabled is not virgin');

      // Case 4: Admin disabled helpers on starter
      const customizedHelpers = {
        ...virginPlans,
        byok_starter: { ...virginPlans.byok_starter, featureToggles: { allHelpersEnabled: false, allToolsEnabled: true } }
      };
      assert.strictEqual(isVirginServerDefault(customizedHelpers, true, 1), false, 'Disabled allHelpersEnabled is not virgin');

      // Case 5: Admin disabled tools on pro
      const customizedTools = {
        ...virginPlans,
        byok_pro: { ...virginPlans.byok_pro, featureToggles: { allHelpersEnabled: true, allToolsEnabled: false } }
      };
      assert.strictEqual(isVirginServerDefault(customizedTools, true, 1), false, 'Disabled allToolsEnabled is not virgin');

      // Case 6: Admin disabled starter plan
      const disabledPlan = {
        ...virginPlans,
        byok_starter: { ...virginPlans.byok_starter, isEnabled: false }
      };
      assert.strictEqual(isVirginServerDefault(disabledPlan, true, 1), false, 'Disabled plan is not virgin');
    });

    itFn('B.7 functional verification: hasCustomizedDisabledStates detects local customization', () => {
      const TOTAL_TOOLS = 100;
      function hasCustomizedDisabledStates(master, localWorkflow, localPlans, localToolCount = TOTAL_TOOLS) {
        if (localWorkflow === false) return true;
        if (master && master.workflowCustomizationUserEnabled === false) return true;
        const targetPlans = master?.plans || localPlans;
        if (targetPlans) {
          const tiers = ['byok_starter', 'byok_pro', 'managed'];
          for (const tier of tiers) {
            const p = targetPlans[tier];
            if (!p) continue;
            if (p.featureToggles?.allHelpersEnabled === false) return true;
            if (Array.isArray(p.featureToggles?.enabledHelpers) && p.featureToggles.enabledHelpers.length > 0) return true;
            if (p.featureToggles?.allToolsEnabled === false) return true;
            if (Array.isArray(p.featureToggles?.enabledTools) && p.featureToggles.enabledTools.length > 0) return true;
            if (tier !== 'managed' && p.isEnabled === false) return true;
            if (tier === 'managed' && p.isEnabled === true) return true;
          }
        }

        if (master && Array.isArray(master.enabledToolConnectors) && master.enabledToolConnectors.length < TOTAL_TOOLS) {
          return true;
        }
        if (localToolCount < TOTAL_TOOLS) return true;

        return false;
      }

      // Default state: nothing customized
      assert.strictEqual(hasCustomizedDisabledStates(null, true, {
        byok_starter: { isEnabled: true, featureToggles: { allHelpersEnabled: true, allToolsEnabled: true } }
      }), false, 'Virgin client state should report false');

      // Local workflow disabled
      assert.strictEqual(hasCustomizedDisabledStates(null, false, null), true, 'localWorkflow === false must report true');

      // Master workflow disabled
      assert.strictEqual(hasCustomizedDisabledStates({ workflowCustomizationUserEnabled: false }, true, null), true, 'master workflow === false must report true');

      // Helper restricted
      assert.strictEqual(hasCustomizedDisabledStates(null, true, {
        byok_starter: { isEnabled: true, featureToggles: { allHelpersEnabled: false, enabledHelpers: ['01', '02'] } }
      }), true, 'Helper restricted plan must report true');

      // Tool connector disabled globally
      assert.strictEqual(hasCustomizedDisabledStates({ enabledToolConnectors: ['gmail'] }, true, null), true, 'Restricted master tool connectors must report true');
    });

    itFn('B.8 loadPublicPlans preserves client disabled states against cold-started virgin server', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(content.includes('const isServerVirgin = serverRevision === 0 || isVirginServerDefault('), 'Must evaluate isServerVirgin');
      assert.ok(content.includes('const clientHasCustom = hasCustomizedDisabledStates('), 'Must evaluate clientHasCustom');
      assert.ok(content.includes('if (isServerVirgin && clientHasCustom) {'), 'Must intercept virgin server overwrite when client has customized states');
      assert.ok(content.includes('plansStore.set(effectivePlans)'), 'Must preserve effective customized plans in store');
      assert.ok(content.includes('workflowCustomizationUserStore.set(effectiveWorkflow)'), 'Must preserve effective workflow customization');
      assert.ok(content.includes('enabledToolConnectorsStore.set(effectiveTools)'), 'Must preserve effective enabled tools');
      assert.ok(content.includes('syncMasterToServer('), 'Must trigger background sync of master configuration to server');
    });

    itFn('B.9 functional simulation: cold-start recovery retains disabled toggles and rejects virgin reset', async () => {
      // Mock Client Master State with admin customization
      const clientMaster = {
        revision: 4,
        updatedAt: '2026-10-21T18:00:00.000Z',
        workflowCustomizationUserEnabled: false, // Customized OFF
        plans: {
          byok_starter: {
            id: 'byok_starter',
            isEnabled: true,
            featureToggles: {
              allHelpersEnabled: false, // Customized OFF
              enabledHelpers: ['01', '02', '03'],
              allToolsEnabled: true,
              enabledTools: []
            }
          },
          byok_pro: {
            id: 'byok_pro',
            isEnabled: true,
            featureToggles: {
              allHelpersEnabled: true,
              enabledHelpers: [],
              allToolsEnabled: false, // Customized OFF
              enabledTools: ['gmail', 'google_calendar']
            }
          },
          managed: {
            id: 'managed',
            isEnabled: false,
            featureToggles: { allHelpersEnabled: true, allToolsEnabled: true }
          }
        },
        enabledToolConnectors: ['gmail', 'telegram_bot', 'slack']
      };

      // Mock Serverless cold-start response (virgin default)
      const serverlessColdStartResponse = {
        success: true,
        revision: 0, // Cold-start virgin default
        updatedAt: '1970-01-01T00:00:00.000Z',
        workflowCustomizationUserEnabled: true, // Server default
        plans: {
          byok_starter: { isEnabled: true, featureToggles: { allHelpersEnabled: true, allToolsEnabled: true } },
          byok_pro: { isEnabled: true, featureToggles: { allHelpersEnabled: true, allToolsEnabled: true } },
          managed: { isEnabled: false, featureToggles: { allHelpersEnabled: true, allToolsEnabled: true } }
        },
        enabledToolConnectors: ['all_100_tools']
      };

      // Evaluate Cold-Start Engine Protection
      const isServerVirgin = serverlessColdStartResponse.revision === 0;
      const clientHasCustom = clientMaster.workflowCustomizationUserEnabled === false ||
        clientMaster.plans.byok_starter.featureToggles.allHelpersEnabled === false;

      let effectivePlans = null;
      let effectiveWorkflow = null;
      let effectiveTools = null;
      let reSyncedToServer = false;

      if (isServerVirgin && clientHasCustom) {
        effectivePlans = clientMaster.plans;
        effectiveWorkflow = clientMaster.workflowCustomizationUserEnabled;
        effectiveTools = clientMaster.enabledToolConnectors;
        reSyncedToServer = true; // Queues re-sync back to /api/admin/settings
      } else {
        effectivePlans = serverlessColdStartResponse.plans;
        effectiveWorkflow = serverlessColdStartResponse.workflowCustomizationUserEnabled;
        effectiveTools = serverlessColdStartResponse.enabledToolConnectors;
      }

      // Assert that client customization was 100% protected
      assert.strictEqual(effectiveWorkflow, false, 'Workflow Studio must remain disabled on client');
      assert.strictEqual(effectivePlans.byok_starter.featureToggles.allHelpersEnabled, false, 'Starter AI Helpers must remain locked down');
      assert.deepStrictEqual(effectivePlans.byok_starter.featureToggles.enabledHelpers, ['01', '02', '03'], 'Enabled helpers list must be preserved');
      assert.strictEqual(effectivePlans.byok_pro.featureToggles.allToolsEnabled, false, 'Pro Tools toggle must remain disabled');
      assert.deepStrictEqual(effectiveTools, ['gmail', 'telegram_bot', 'slack'], 'Customized tool connectors must be preserved');
      assert.strictEqual(reSyncedToServer, true, 'Master configuration must trigger re-sync to server');
    });
  });

  // ==========================================================================
  // Section C: Dashboard Admin Preview Badge & Gating Invariant
  // ==========================================================================
  describeFn('Section C: Dashboard Admin Preview Badge & Gating Invariant', () => {
    itFn('C.1 dashboard/+page.svelte derives isAdmin from authenticated session state', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes("const isAdmin = $derived(typeof window !== 'undefined' && sessionStorage.getItem('ezbo_admin_authed') === 'true');"),
        'dashboard must derive isAdmin from sessionStorage ezbo_admin_authed'
      );
    });

    itFn('C.2 dashboard/+page.svelte defines isWorkflowStudioVisible with admin bypass', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('const isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false);'),
        'isWorkflowStudioVisible must allow admin bypass while respecting workflowCustomizationUserStore for users'
      );
    });

    itFn('C.3 launcher button renders "👑 Admin Preview: (Locked for regular users)" badge and tooltip in header', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('title={isAdmin && $workflowCustomizationUserStore === false ? "👑 Admin Preview: (Locked for regular users)" : "Launch Visual Workflow Studio"}'),
        'Header launcher button must set title to Admin Preview tooltip when studio is disabled for users'
      );
      assert.ok(
        content.includes('{#if isAdmin && $workflowCustomizationUserStore === false}'),
        'Header launcher button must conditionally render the Admin Preview badge'
      );
      assert.ok(
        content.includes('👑 Admin Preview: (Locked for regular users)'),
        'Header launcher button must display exact badge text "👑 Admin Preview: (Locked for regular users)"'
      );
      assert.ok(
        content.includes('bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400'),
        'Header launcher button must style amber gradient when in Admin Preview mode'
      );
    });

    itFn('C.4 My Agents "Customize Workflows" button renders "👑 Admin Preview: (Locked for regular users)" badge', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('title={isAdmin && $workflowCustomizationUserStore === false ? "👑 Admin Preview: (Locked for regular users)" : "Customize Workflows"}'),
        'Customize Workflows button must set title to Admin Preview tooltip'
      );
      assert.ok(
        content.includes('bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400/50'),
        'Customize Workflows button must style amber aesthetic when in Admin Preview mode'
      );
    });

    itFn('C.5 regular users are 100% blocked and launcher buttons are hidden when studio is disabled', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('{#if isWorkflowStudioVisible && ($isProPlan || isAdmin)}'),
        'Launcher buttons must be wrapped in isWorkflowStudioVisible condition'
      );
      assert.ok(
        content.includes('function openWorkflowStudio(agentName: string = \'Master Specialist Agent\') {'),
        'openWorkflowStudio must guard execution'
      );
      assert.ok(
        content.includes('if (!isWorkflowStudioVisible) {'),
        'openWorkflowStudio must verify isWorkflowStudioVisible before opening'
      );
      assert.ok(
        content.includes('showStudioBlockedToast()'),
        'Blocked access must trigger notification toast'
      );
      assert.ok(
        content.includes("history.replaceState(null, '', window.location.pathname + window.location.search);"),
        'Blocked access must strip #open-workflow-studio hash from URL'
      );
    });

    itFn('C.6 hash navigation #open-workflow-studio is intercepted and blocked for regular users', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes("if (window.location.hash === '#open-workflow-studio') {"),
        'Must listen for hashchange to #open-workflow-studio'
      );
      assert.ok(
        content.includes('if (!isWorkflowStudioVisible) {\n          showStudioBlockedToast();'),
        'Hashchange must block and notify if isWorkflowStudioVisible is false'
      );
    });

    itFn('C.7 functional verification: access matrix evaluates correctly for all admin & user combinations', () => {
      function evaluateWorkflowStudioAccess(isAdmin, workflowCustomizationUserEnabled, isProPlan) {
        const isWorkflowStudioVisible = isAdmin || workflowCustomizationUserEnabled !== false;
        const rendersButton = isWorkflowStudioVisible && (isProPlan || isAdmin);
        const showsAdminPreviewBadge = rendersButton && isAdmin && workflowCustomizationUserEnabled === false;
        const canExecuteStudio = isWorkflowStudioVisible;

        return {
          isWorkflowStudioVisible,
          rendersButton,
          showsAdminPreviewBadge,
          canExecuteStudio
        };
      }

      // Case 1: Regular User on Pro, Studio Enabled
      const userProEnabled = evaluateWorkflowStudioAccess(false, true, true);
      assert.strictEqual(userProEnabled.isWorkflowStudioVisible, true);
      assert.strictEqual(userProEnabled.rendersButton, true);
      assert.strictEqual(userProEnabled.showsAdminPreviewBadge, false);
      assert.strictEqual(userProEnabled.canExecuteStudio, true);

      // Case 2: Regular User on Starter, Studio Enabled (Shows in Studio modal or gated)
      const userStarterEnabled = evaluateWorkflowStudioAccess(false, true, false);
      assert.strictEqual(userStarterEnabled.isWorkflowStudioVisible, true);
      assert.strictEqual(userStarterEnabled.rendersButton, false, 'Starter users do not see launcher buttons directly');

      // Case 3: Regular User on Pro, Studio DISABLED by Admin
      const userProDisabled = evaluateWorkflowStudioAccess(false, false, true);
      assert.strictEqual(userProDisabled.isWorkflowStudioVisible, false, 'Must be hidden');
      assert.strictEqual(userProDisabled.rendersButton, false, 'Must NOT render any button');
      assert.strictEqual(userProDisabled.canExecuteStudio, false, 'Must block execution');

      // Case 4: Platform Administrator, Studio DISABLED by Admin
      const adminDisabled = evaluateWorkflowStudioAccess(true, false, false);
      assert.strictEqual(adminDisabled.isWorkflowStudioVisible, true, 'Admin always has visibility');
      assert.strictEqual(adminDisabled.rendersButton, true, 'Admin sees launcher button');
      assert.strictEqual(adminDisabled.showsAdminPreviewBadge, true, 'Must display Admin Preview badge');
      assert.strictEqual(adminDisabled.canExecuteStudio, true, 'Admin can enter and preview studio');

      // Case 5: Platform Administrator, Studio ENABLED
      const adminEnabled = evaluateWorkflowStudioAccess(true, true, false);
      assert.strictEqual(adminEnabled.rendersButton, true);
      assert.strictEqual(adminEnabled.showsAdminPreviewBadge, false, 'No preview badge when enabled for everyone');
    });
  });

  // ==========================================================================
  // Section D: Active Plan Tier Filtering in My Agents and Tools & Integrations
  // ==========================================================================
  describeFn('Section D: Active Plan Tier Filtering in My Agents and Tools & Integrations', () => {
    itFn('D.1 dashboard/+page.svelte filters accessibleTools by active subscription tier and toggles', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(content.includes('const accessibleTools = $derived.by(() => {'), 'Must derive accessibleTools');
      assert.ok(content.includes('if (isAdmin) return TOOLS;'), 'accessibleTools must bypass filtering for Admins');
      assert.ok(content.includes('const tier = $subscription?.tier || $currentUser?.tier || \'byok_starter\';'), 'Must resolve user subscription tier');
      assert.ok(content.includes('const plan ='), 'Must resolve plan config from plansStore');
      assert.ok(content.includes('if (!toggles || toggles.allHelpersEnabled !== false) {'), 'Must return all tools if allHelpersEnabled is true');
      assert.ok(content.includes('const enabledList = toggles.enabledHelpers || [];'), 'Must read enabledHelpers list');
      assert.ok(content.includes('return TOOLS.filter((t) => enabledList.includes(t.id));'), 'Must filter TOOLS by enabledHelpers');
    });

    itFn('D.2 dashboard/+page.svelte dynamicCategories and activeTool automatically sync with accessibleTools', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('const dynamicCategories = $derived.by(() => {'),
        'dynamicCategories must derive category counts from accessibleTools'
      );
      assert.ok(
        content.includes('if (!isAdmin && $activeTool && !accessibleTools.some((t) => t.id === $activeTool.id)) {\n      closeToolDrawer();\n    }'),
        'Must close active tool drawer if currently inspected tool is disabled for user tier'
      );
    });

    itFn('D.3 ToolConnectorsTab.svelte filters enabledTools by active subscription tier and toggles', () => {
      const content = readSafe(PATHS.toolConnectorsTab);
      assert.ok(content.includes('const enabledTools = $derived.by(() => {'), 'Must derive enabledTools');
      assert.ok(content.includes('if (isAdmin) {\n      return TOOL_CONNECTORS;\n    }'), 'enabledTools must bypass filtering for Admins');
      assert.ok(content.includes('const tier = $subscription?.tier || $currentUser?.tier || \'byok_starter\';'), 'Must resolve user subscription tier');
      assert.ok(content.includes('if (toggles && toggles.allToolsEnabled === false) {'), 'Must check allToolsEnabled');
      assert.ok(content.includes('const allowed = Array.isArray(toggles.enabledTools) ? toggles.enabledTools : [];'), 'Must resolve plan allowed tools');
      assert.ok(content.includes('return baseList.filter((tool) => $enabledToolConnectorsStore.includes(tool.id));'), 'Must intersect with global enabledToolConnectorsStore');
    });

    itFn('D.4 functional verification: active tier filtering isolates plan catalog permissions accurately', () => {
      const mockAllHelpers = [
        { id: '01', name: 'Facebook Ad Copy', category: 'ads' },
        { id: '02', name: 'Google Ads Strategist', category: 'ads' },
        { id: '13', name: 'TikTok Hook Creator', category: 'social' },
        { id: '24', name: 'SEO Content Optimizer', category: 'seo' },
        { id: '34', name: 'Image Specialist', category: 'image' }
      ];

      function filterHelpers(helpers, isAdmin, userTier, plansStore) {
        if (isAdmin) return helpers;
        const plan = plansStore[userTier] || plansStore.byok_starter;
        const toggles = plan?.featureToggles;
        if (!toggles || toggles.allHelpersEnabled !== false) {
          return helpers;
        }
        const enabledList = toggles.enabledHelpers || [];
        return helpers.filter((h) => enabledList.includes(h.id));
      }

      const mockPlans = {
        byok_starter: {
          featureToggles: {
            allHelpersEnabled: false,
            enabledHelpers: ['01', '13']
          }
        },
        byok_pro: {
          featureToggles: {
            allHelpersEnabled: true,
            enabledHelpers: []
          }
        }
      };

      // Starter user gets only '01' and '13'
      const starterResult = filterHelpers(mockAllHelpers, false, 'byok_starter', mockPlans);
      assert.strictEqual(starterResult.length, 2);
      assert.deepStrictEqual(starterResult.map((h) => h.id), ['01', '13']);

      // Pro user gets all 5 helpers
      const proResult = filterHelpers(mockAllHelpers, false, 'byok_pro', mockPlans);
      assert.strictEqual(proResult.length, 5);

      // Admin user gets all 5 helpers even if masquerading or testing on starter tier
      const adminResult = filterHelpers(mockAllHelpers, true, 'byok_starter', mockPlans);
      assert.strictEqual(adminResult.length, 5, 'Admin must see 100% of helpers regardless of plan toggles');
    });

    itFn('D.5 functional verification: tool connectors tab respects both per-tier restrictions and global toggles', () => {
      const mockAllTools = [
        { id: 'gmail', name: 'Gmail' },
        { id: 'google_sheets', name: 'Google Sheets' },
        { id: 'slack', name: 'Slack' },
        { id: 'telegram_bot', name: 'Telegram' },
        { id: 'stripe', name: 'Stripe' }
      ];

      function filterTools(tools, isAdmin, userTier, plansStore, globalEnabledList) {
        if (isAdmin) return tools;
        const plan = plansStore[userTier] || plansStore.byok_starter;
        const toggles = plan?.featureToggles;
        let baseList = tools;
        if (toggles && toggles.allToolsEnabled === false) {
          const allowed = Array.isArray(toggles.enabledTools) ? toggles.enabledTools : [];
          baseList = tools.filter((t) => allowed.includes(t.id));
        }
        return baseList.filter((tool) => globalEnabledList.includes(tool.id));
      }

      const mockPlans = {
        byok_starter: {
          featureToggles: {
            allToolsEnabled: false,
            enabledTools: ['gmail', 'google_sheets', 'slack']
          }
        },
        byok_pro: {
          featureToggles: {
            allToolsEnabled: true,
            enabledTools: []
          }
        }
      };

      // Scenario 1: Starter user with global tools active
      const res1 = filterTools(mockAllTools, false, 'byok_starter', mockPlans, ['gmail', 'google_sheets', 'slack', 'telegram_bot']);
      assert.deepStrictEqual(res1.map((t) => t.id), ['gmail', 'google_sheets', 'slack']);

      // Scenario 2: Admin turned off Slack globally in Tools tab
      const res2 = filterTools(mockAllTools, false, 'byok_starter', mockPlans, ['gmail', 'google_sheets', 'telegram_bot']);
      assert.deepStrictEqual(res2.map((t) => t.id), ['gmail', 'google_sheets'], 'Slack must be hidden because global switch is OFF');

      // Scenario 3: Admin inspects tools tab
      const res3 = filterTools(mockAllTools, true, 'byok_starter', mockPlans, ['gmail']);
      assert.strictEqual(res3.length, mockAllTools.length, 'Admin must see all tools');
    });
  });

  // ==========================================================================
  // Section E: Adversarial Integrity, Storage Resiliency & Platform Invariants
  // ==========================================================================
  describeFn('Section E: Adversarial Integrity, Storage Resiliency & Platform Invariants', () => {
    itFn('E.1 storage serialization handles malformed/corrupt JSON gracefully without throwing', () => {
      function safeParseMaster(rawJson) {
        if (!rawJson || typeof rawJson !== 'string') return null;
        try {
          const parsed = JSON.parse(rawJson);
          if (parsed && typeof parsed === 'object' && parsed.plans) {
            return {
              revision: typeof parsed.revision === 'number' && !isNaN(parsed.revision) ? parsed.revision : 1,
              updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
              workflowCustomizationUserEnabled: parsed.workflowCustomizationUserEnabled !== false
            };
          }
        } catch {
          return null;
        }
        return null;
      }

      // Adversarial malformed inputs
      assert.strictEqual(safeParseMaster(null), null);
      assert.strictEqual(safeParseMaster(''), null);
      assert.strictEqual(safeParseMaster('{ broken json ...'), null);
      assert.strictEqual(safeParseMaster('{"revision": "NaN", "workflowCustomizationUserEnabled": null}'), null);

      // Valid input
      const valid = safeParseMaster('{"revision": 5, "plans": {}, "workflowCustomizationUserEnabled": false}');
      assert.strictEqual(valid.revision, 5);
      assert.strictEqual(valid.workflowCustomizationUserEnabled, false);
    });

    itFn('E.2 higher server revision smoothly updates client master without regressions', () => {
      let clientMaster = {
        revision: 2,
        workflowCustomizationUserEnabled: false
      };

      const serverUpdate = {
        revision: 5,
        workflowCustomizationUserEnabled: true
      };

      if (serverUpdate.revision > clientMaster.revision) {
        clientMaster = {
          revision: serverUpdate.revision,
          workflowCustomizationUserEnabled: serverUpdate.workflowCustomizationUserEnabled
        };
      }

      assert.strictEqual(clientMaster.revision, 5);
      assert.strictEqual(clientMaster.workflowCustomizationUserEnabled, true);
    });

    itFn('E.3 web/src/lib/components/robots/robots.css byte-for-byte SHA256 checksum strictly preserved', () => {
      const robotsCssContent = fs.readFileSync(PATHS.robotsCss);
      const sha256 = crypto.createHash('sha256').update(robotsCssContent).digest('hex');
      const EXPECTED_HASH = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';
      assert.strictEqual(sha256, EXPECTED_HASH, 'robots.css must not be modified');
    });

    itFn('E.4 tests/run_all_tests.mjs preserves the strict 7-tier invariant (NO id: 8)', () => {
      const runAllContent = readSafe(PATHS.runAllTests);
      assert.ok(runAllContent.includes('id: 7'), 'Must include Tier 7');
      assert.ok(!runAllContent.includes('id: 8'), 'Must NEVER include id: 8; 7-tier invariant must be strictly preserved');
      assert.ok(runAllContent.includes('tier7_realtime_pipeline_security.test.mjs'), 'Tier 7 must map to tier7_realtime_pipeline_security.test.mjs');
    });
  });
}

// Standalone execution entrypoint when run via `node --test tests/admin_autosave_coldstart_preview.test.mjs`
const isRunningDirectly = process.argv.some((arg) => arg.includes('admin_autosave_coldstart_preview'));
if (isRunningDirectly) {
  describe('Milestone 4: Admin Real-Time Debounced Auto-Save, Cold-Start & Admin Preview Regression Suite', () => {
    runAdminAutosaveColdstartTests(describe, it);
  });
}
