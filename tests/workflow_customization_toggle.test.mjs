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
  adminSettings: path.join(WEB_DIR, 'src', 'lib', 'server', 'adminSettings.ts'),
  plansApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'plans', '+server.ts'),
  adminSettingsApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'admin', 'settings', '+server.ts'),
  plansStore: path.join(WEB_DIR, 'src', 'lib', 'stores', 'plansStore.ts'),
  adminPage: path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte'),
  dashboardPage: path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte'),
  toolDrawer: path.join(WEB_DIR, 'src', 'lib', 'components', 'ToolDrawer.svelte'),
  workflowStudioModal: path.join(WEB_DIR, 'src', 'lib', 'components', 'WorkflowStudioModal.svelte'),
  floatingCeoChat: path.join(WEB_DIR, 'src', 'lib', 'components', 'FloatingCeoChat.svelte'),
  chatApi: path.join(WEB_DIR, 'src', 'routes', 'api', 'chat', '+server.ts'),
  robotsCss: path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css')
};

const EXPECTED_ROBOTS_SHA256 = '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be';

describe('Workflow Customization Admin Toggle & User Access Control Suite', () => {

  // =========================================================================
  // 1. Backend Persistence & Types (adminSettings.ts)
  // =========================================================================
  describe('1. Backend Admin Settings & Storage', () => {
    it('1.1 adminSettings.ts declares workflowCustomizationUserEnabled in AdminConfig interface', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled: boolean;'),
        'AdminConfig interface must declare workflowCustomizationUserEnabled: boolean;'
      );
    });

    it('1.2 adminSettings.ts initializes workflowCustomizationUserEnabled to true by default', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled: true'),
        'envConfig default must include workflowCustomizationUserEnabled: true'
      );
    });

    it('1.3 adminSettings.ts restores workflowCustomizationUserEnabled from storage cache safely', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled: saved.workflowCustomizationUserEnabled !== false'),
        'Storage cache loader must default to true if saved value is not explicitly false'
      );
    });

    it('1.4 adminSettings.ts updates and persists workflowCustomizationUserEnabled in updateAdminConfig', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled: patch.workflowCustomizationUserEnabled !== undefined'),
        'updateAdminConfig must handle patch.workflowCustomizationUserEnabled'
      );
    });

    it('1.5 adminSettings.ts includes workflowCustomizationUserEnabled in getMaskedAdminConfig', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled: config.workflowCustomizationUserEnabled !== false'),
        'getMaskedAdminConfig must export workflowCustomizationUserEnabled'
      );
    });
  });

  // =========================================================================
  // 2. API Endpoints (+server.ts)
  // =========================================================================
  describe('2. Public and Admin API Endpoints', () => {
    it('2.1 /api/plans returns workflowCustomizationUserEnabled in public JSON response', () => {
      const content = readSafe(PATHS.plansApi);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled: config.workflowCustomizationUserEnabled !== false'),
        'Public /api/plans endpoint must return workflowCustomizationUserEnabled'
      );
      assert.ok(
        content.includes('workflowCustomizationUserEnabled: true'),
        'Public /api/plans fallback error handler must default workflowCustomizationUserEnabled to true'
      );
    });

    it('2.2 /api/admin/settings accepts and extracts workflowCustomizationUserEnabled from patch', () => {
      const content = readSafe(PATHS.adminSettingsApi);
      assert.ok(
        content.includes("typeof patch.workflowCustomizationUserEnabled === 'boolean'"),
        '/api/admin/settings POST must validate typeof patch.workflowCustomizationUserEnabled === boolean'
      );
      assert.ok(
        content.includes('cleanPatch.workflowCustomizationUserEnabled = patch.workflowCustomizationUserEnabled'),
        '/api/admin/settings POST must assign cleanPatch.workflowCustomizationUserEnabled'
      );
    });
  });

  // =========================================================================
  // 3. Client State & Store Synchronization (plansStore.ts)
  // =========================================================================
  describe('3. Client Store (plansStore.ts)', () => {
    it('3.1 plansStore.ts exports workflowCustomizationUserStore backed by localStorage', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(
        content.includes("const WORKFLOW_USER_STORAGE_KEY = 'ezbo_workflow_user_enabled'"),
        'plansStore.ts must define storage key ezbo_workflow_user_enabled'
      );
      assert.ok(
        content.includes('export const workflowCustomizationUserStore = writable<boolean>('),
        'plansStore.ts must export workflowCustomizationUserStore writable'
      );
      assert.ok(
        content.includes('function getInitialWorkflowCustomizationState()'),
        'plansStore.ts must provide getInitialWorkflowCustomizationState'
      );
    });

    it('3.2 loadPublicPlans synchronizes workflowCustomizationUserStore and local cache', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(
        content.includes("typeof data.workflowCustomizationUserEnabled === 'boolean'"),
        'loadPublicPlans must check typeof data.workflowCustomizationUserEnabled'
      );
      assert.ok(
        content.includes('workflowCustomizationUserStore.set(data.workflowCustomizationUserEnabled)'),
        'loadPublicPlans must set workflowCustomizationUserStore'
      );
      assert.ok(
        content.includes('localStorage.setItem(WORKFLOW_USER_STORAGE_KEY, String(data.workflowCustomizationUserEnabled))'),
        'loadPublicPlans must persist state to localStorage'
      );
    });
  });

  // =========================================================================
  // 4. Admin Panel UI (admin/+page.svelte)
  // =========================================================================
  describe('4. Admin Panel UI & Real-Time Switch', () => {
    it('4.1 admin page defines workflowCustomizationUserEnabled state and PublicSettings typing', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled?: boolean;'),
        'PublicSettings in admin/+page.svelte must type workflowCustomizationUserEnabled'
      );
      assert.ok(
        content.includes('let workflowCustomizationUserEnabled = $state(true);'),
        'admin/+page.svelte must declare reactive workflowCustomizationUserEnabled state'
      );
    });

    it('4.2 admin page loads and saves workflowCustomizationUserEnabled', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('workflowCustomizationUserEnabled = s.workflowCustomizationUserEnabled !== false'),
        'loadSettings in admin page must load workflowCustomizationUserEnabled'
      );
      assert.ok(
        content.includes('workflowCustomizationUserEnabled,') && content.includes('saveSettings'),
        'saveSettings in admin page must send workflowCustomizationUserEnabled in patch'
      );
    });

    it('4.3 admin page renders dedicated Workflow Studio switch card in Plans tab with status beacon', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes('Workflow Studio &amp; Customization (User Access Control)'),
        'admin page must display card title: Workflow Studio & Customization (User Access Control)'
      );
      assert.ok(
        content.includes('bg-emerald-500') && content.includes('bg-amber-500'),
        'admin page must display glowing status dot: emerald for active, amber for admin-only'
      );
      assert.ok(
        content.includes('Active for Users') && content.includes('Admin-Only Access'),
        'admin page switch card must have explicit active / admin-only status badges'
      );
      assert.ok(
        content.includes('bind:checked={workflowCustomizationUserEnabled}'),
        'admin page switch must bind to workflowCustomizationUserEnabled'
      );
    });
  });

  // =========================================================================
  // 5. Dashboard & Access Gating (dashboard/+page.svelte)
  // =========================================================================
  describe('5. Dashboard Access Control & Locking', () => {
    it('5.1 dashboard derives isAdmin and isWorkflowStudioVisible safely', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes("sessionStorage.getItem('ezbo_admin_authed') === 'true'"),
        'dashboard must derive isAdmin from sessionStorage ezbo_admin_authed'
      );
      assert.ok(
        content.includes('const isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false)'),
        'dashboard must derive isWorkflowStudioVisible as isAdmin || workflowCustomizationUserStore !== false'
      );
    });

    it('5.2 dashboard launcher buttons are gated by isWorkflowStudioVisible', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('{#if isWorkflowStudioVisible && ($isProPlan || isAdmin)}'),
        'Dashboard launcher buttons must be wrapped with {#if isWorkflowStudioVisible && ($isProPlan || isAdmin)}'
      );
    });

    it('5.3 direct openWorkflowStudio call & hash #open-workflow-studio block regular users when disabled', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('if (!isWorkflowStudioVisible) {'),
        'openWorkflowStudio must verify !isWorkflowStudioVisible'
      );
      assert.ok(
        content.includes('showStudioBlockedToast()'),
        'openWorkflowStudio must call showStudioBlockedToast() when locked'
      );
      assert.ok(
        content.includes('history.replaceState(null, \'\', window.location.pathname + window.location.search)'),
        'openWorkflowStudio and hash handler must strip #open-workflow-studio hash from URL when blocked'
      );
    });

    it('5.4 dashboard renders lock toast warning when unauthorized access is attempted', () => {
      const content = readSafe(PATHS.dashboardPage);
      assert.ok(
        content.includes('Workflow Studio is currently reserved for platform administrators.'),
        'Dashboard must render warning toast message when locked'
      );
    });
  });

  // =========================================================================
  // 6. ToolDrawer & WorkflowStudioModal Safeguards
  // =========================================================================
  describe('6. ToolDrawer & WorkflowStudioModal Safeguards', () => {
    it('6.1 ToolDrawer hides Customize Workflow button when disabled for regular users', () => {
      const content = readSafe(PATHS.toolDrawer);
      assert.ok(
        content.includes('const isAdmin = $derived(typeof window !== \'undefined\' && sessionStorage.getItem(\'ezbo_admin_authed\') === \'true\')'),
        'ToolDrawer must detect isAdmin'
      );
      assert.ok(
        content.includes('const isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false)'),
        'ToolDrawer must derive isWorkflowStudioVisible'
      );
      assert.ok(
        content.includes('{#if isWorkflowStudioVisible}'),
        'ToolDrawer must wrap Customize Workflow button with {#if isWorkflowStudioVisible}'
      );
    });

    it('6.2 WorkflowStudioModal auto-closes if regular user accesses it while disabled', () => {
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('if (isOpen && !isAdmin && $workflowCustomizationUserStore === false)'),
        'WorkflowStudioModal must have safety effect closing modal when !isAdmin and disabled'
      );
    });

    it('6.3 WorkflowStudioModal displays Admin Mode badge in toolbar for logged-in admin', () => {
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('👑 Admin Mode: Full Customization Unlocked'),
        'WorkflowStudioModal must display 👑 Admin Mode: Full Customization Unlocked when isAdmin'
      );
    });
  });

  // =========================================================================
  // 7. Checksum Invariance (robots.css)
  // =========================================================================
  describe('7. robots.css SHA256 Checksum Invariance', () => {
    it('7.1 robots.css exists and matches exact SHA256 checksum byte-for-byte', () => {
      assert.ok(fs.existsSync(PATHS.robotsCss), 'robots.css must exist');
      const content = fs.readFileSync(PATHS.robotsCss);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      assert.strictEqual(
        hash,
        EXPECTED_ROBOTS_SHA256,
        `robots.css SHA256 checksum modified! Expected: ${EXPECTED_ROBOTS_SHA256}, Got: ${hash}`
      );
      assert.strictEqual(content.length, 5427, 'robots.css exact size must be 5427 bytes');
    });
  });
  // =========================================================================
  // 8. Cross-Tab Storage & Real-Time Event Synchronization
  // =========================================================================
  describe('8. Cross-Tab Storage & Real-Time Event Synchronization', () => {
    it('8.1 plansStore.ts listens to storage event for instant cross-tab update', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(
        content.includes("event.key === WORKFLOW_USER_STORAGE_KEY"),
        'plansStore must listen for storage events targeting WORKFLOW_USER_STORAGE_KEY'
      );
      assert.ok(
        content.includes("workflowCustomizationUserStore.set(event.newValue === 'true')"),
        'plansStore must update store when storage event fires'
      );
    });

    it('8.2 plansStore.ts listens to ezbo:workflow-settings-updated in-window event', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(
        content.includes("window.addEventListener('ezbo:workflow-settings-updated'"),
        'plansStore must listen for ezbo:workflow-settings-updated'
      );
    });

    it('8.3 admin page persists ezbo_workflow_user_enabled and dispatches update event', () => {
      const content = readSafe(PATHS.adminPage);
      assert.ok(
        content.includes("localStorage.setItem('ezbo_workflow_user_enabled'"),
        'admin page must persist ezbo_workflow_user_enabled upon save'
      );
      assert.ok(
        content.includes("new CustomEvent('ezbo:workflow-settings-updated'"),
        'admin page must dispatch ezbo:workflow-settings-updated event upon save'
      );
    });
  });

  // =========================================================================
  // 9. FloatingCeoChat & AI CEO Chat API Guarding
  // =========================================================================
  describe('9. FloatingCeoChat & AI CEO Chat API Guarding', () => {
    it('9.1 FloatingCeoChat derives isWorkflowStudioVisible and suppresses intent when disabled', () => {
      const content = readSafe(PATHS.floatingCeoChat);
      assert.ok(
        content.includes('const isWorkflowStudioVisible = $derived(isAdmin || $workflowCustomizationUserStore !== false)'),
        'FloatingCeoChat must compute isWorkflowStudioVisible'
      );
      assert.ok(
        content.includes('if (!isWorkflowStudioVisible) return null;'),
        'detectNavigationIntent must suppress workflow intent when isWorkflowStudioVisible is false'
      );
    });

    it('9.2 FloatingCeoChat hides workflow navigation action button when disabled', () => {
      const content = readSafe(PATHS.floatingCeoChat);
      assert.ok(
        content.includes("msg.navigationAction.type !== 'workflow' || isWorkflowStudioVisible"),
        'FloatingCeoChat must hide workflow navigation chip when isWorkflowStudioVisible is false'
      );
      assert.ok(
        content.includes('if (!isWorkflowStudioVisible) {\n          return;'),
        'handleNavigationAction must abort when isWorkflowStudioVisible is false'
      );
    });

    it('9.3 api/chat/+server.ts intercepts workflow customization intent when disabled', () => {
      const content = readSafe(PATHS.chatApi);
      assert.ok(
        content.includes('if (adminConfig.workflowCustomizationUserEnabled === false)'),
        'api/chat must check if workflowCustomizationUserEnabled is disabled'
      );
      assert.ok(
        content.includes('🔒 **Workflow Studio Access Notice**'),
        'api/chat must return locked notice when customization is disabled by admin'
      );
    });
  });

  // =========================================================================
  // 10. WorkflowStudioModal Programmatic Execution Guarding
  // =========================================================================
  describe('10. WorkflowStudioModal Programmatic Execution Guarding', () => {
    it('10.1 WorkflowStudioModal handleSaveWorkflow guards against unauthorized user saving', () => {
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('if (!isAdmin && $workflowCustomizationUserStore === false) {\n      isOpen = false;\n      return;'),
        'handleSaveWorkflow must abort and close if regular user attempts to save while disabled'
      );
    });

    it('10.2 WorkflowStudioModal runLiveWorkflow guards against unauthorized user execution', () => {
      const content = readSafe(PATHS.workflowStudioModal);
      assert.ok(
        content.includes('if (!isAdmin && $workflowCustomizationUserStore === false) {\n      isOpen = false;\n      return;\n    }\n    if (isExecuting) return;'),
        'runLiveWorkflow must abort and close if regular user attempts to run pipeline while disabled'
      );
    });
  });

});
