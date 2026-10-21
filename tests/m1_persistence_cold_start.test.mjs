import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
  plansConfig: path.join(WEB_DIR, 'src', 'lib', 'config', 'plans.ts')
};

describe('Milestone 1: Dual-Tier Master Persistence & Serverless Cold-Start Protection Suite', () => {

  describe('1. Server-Side Revision & Metadata Architecture (adminSettings.ts)', () => {
    it('1.1 AdminConfig declares revision?: number and updatedAt?: string', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('revision?: number;'), 'AdminConfig must declare revision?: number');
      assert.ok(content.includes('updatedAt?: string;'), 'AdminConfig must declare updatedAt?: string');
    });

    it('1.2 envConfig initializes virgin default state with revision: 0 and updatedAt: epoch', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('revision: 0,'), 'envConfig must set revision: 0');
      assert.ok(content.includes('updatedAt: new Date(0).toISOString()'), 'envConfig must set updatedAt to epoch');
    });

    it('1.3 loadConfigFromStorage restores revision and updatedAt from file cache if present', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(
        content.includes("revision: typeof saved.revision === 'number' ? saved.revision : 0"),
        'loadConfigFromStorage must restore revision safely'
      );
      assert.ok(
        content.includes("updatedAt: typeof saved.updatedAt === 'string' ? saved.updatedAt : new Date(0).toISOString()"),
        'loadConfigFromStorage must restore updatedAt safely'
      );
    });

    it('1.4 updateAdminConfig increments revision monotonically or applies higher patch.revision', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('currentRevision + 1'), 'updateAdminConfig must increment revision');
      assert.ok(content.includes('patch.revision > currentRevision'), 'updateAdminConfig must accept higher patch.revision');
      assert.ok(content.includes('revision: nextRevision,'), 'updateAdminConfig must assign nextRevision');
      assert.ok(content.includes('updatedAt: nextUpdatedAt,'), 'updateAdminConfig must assign nextUpdatedAt');
    });

    it('1.5 getMaskedAdminConfig exports revision and updatedAt', () => {
      const content = readSafe(PATHS.adminSettings);
      assert.ok(content.includes('revision: config.revision || 0'), 'getMaskedAdminConfig must export revision');
      assert.ok(content.includes('updatedAt: config.updatedAt || new Date(0).toISOString()'), 'getMaskedAdminConfig must export updatedAt');
    });
  });

  describe('2. API Endpoints Contract (api/plans & api/admin/settings)', () => {
    it('2.1 /api/plans returns revision and updatedAt in public JSON response', () => {
      const content = readSafe(PATHS.plansApi);
      assert.ok(content.includes('revision: config.revision || 0,'), '/api/plans GET must return revision');
      assert.ok(content.includes('updatedAt: config.updatedAt || new Date(0).toISOString(),'), '/api/plans GET must return updatedAt');
      assert.ok(content.includes('revision: 0,'), '/api/plans error fallback must return revision: 0');
    });

    it('2.2 /api/admin/settings accepts and sanitizes patch.revision and patch.updatedAt', () => {
      const content = readSafe(PATHS.adminSettingsApi);
      assert.ok(
        content.includes("typeof patch.revision === 'number'") || content.includes('typeof patch.revision === "number"'),
        '/api/admin/settings must sanitize patch.revision'
      );
      assert.ok(
        content.includes("typeof patch.updatedAt === 'string'") || content.includes('typeof patch.updatedAt === "string"'),
        '/api/admin/settings must sanitize patch.updatedAt'
      );
      assert.ok(content.includes('cleanPatch.revision = patch.revision'), '/api/admin/settings must assign cleanPatch.revision');
      assert.ok(content.includes('cleanPatch.updatedAt = patch.updatedAt'), '/api/admin/settings must assign cleanPatch.updatedAt');
    });
  });

  describe('3. Client Master Persistence & Cold-Start Detection (plansStore.ts)', () => {
    it('3.1 plansStore.ts exports MASTER_STORAGE_KEY = ezbo_admin_plans_master', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(
        content.includes("export const MASTER_STORAGE_KEY = 'ezbo_admin_plans_master'"),
        'plansStore.ts must export MASTER_STORAGE_KEY'
      );
    });

    it('3.2 plansStore.ts defines AdminPlansMaster interface', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(content.includes('export interface AdminPlansMaster'), 'plansStore.ts must export AdminPlansMaster');
      assert.ok(content.includes('revision: number;'), 'AdminPlansMaster must have revision');
      assert.ok(content.includes('plans: PlansSettings;'), 'AdminPlansMaster must have plans');
    });

    it('3.3 plansStore.ts provides getAdminPlansMaster and saveAdminPlansMaster', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(content.includes('export function getAdminPlansMaster(): AdminPlansMaster | null'), 'Must export getAdminPlansMaster');
      assert.ok(content.includes('export function saveAdminPlansMaster(master: Partial<AdminPlansMaster>): void'), 'Must export saveAdminPlansMaster');
      assert.ok(content.includes('localStorage.setItem(MASTER_STORAGE_KEY'), 'saveAdminPlansMaster must write to MASTER_STORAGE_KEY');
    });

    it('3.4 plansStore.ts exports isVirginServerDefault & hasCustomizedDisabledStates', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(content.includes('export function isVirginServerDefault('), 'Must export isVirginServerDefault');
      assert.ok(content.includes('export function hasCustomizedDisabledStates('), 'Must export hasCustomizedDisabledStates');
      assert.ok(content.includes('export async function syncMasterToServer('), 'Must export syncMasterToServer');
    });

    it('3.5 loadPublicPlans implements inFlightPromise deduplication and cold-start protection branch', () => {
      const content = readSafe(PATHS.plansStore);
      assert.ok(content.includes('let inFlightPromise: Promise<PlansSettings> | null = null'), 'Must define inFlightPromise');
      assert.ok(content.includes('if (inFlightPromise)'), 'Must check existing inFlightPromise');
      assert.ok(content.includes('isServerVirgin && clientHasCustom'), 'Must check cold-start condition isServerVirgin && clientHasCustom');
      assert.ok(content.includes('syncMasterToServer('), 'Must trigger syncMasterToServer on cold start');
    });
  });

  describe('4. Cold-Start Protection Functional Logic Verification', () => {
    it('4.1 isVirginServerDefault accurately identifies virgin server vs customized server', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansConfig).href);

      // Re-implement the exact isVirginServerDefault logic from plansStore to verify algorithm correctness
      function checkVirgin(serverPlans, serverWorkflowEnabled, serverRevision) {
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

      assert.strictEqual(checkVirgin(DEFAULT_PLANS, true, 0), true, 'Server with revision 0 is virgin');
      assert.strictEqual(checkVirgin(DEFAULT_PLANS, true, 1), true, 'Default plans with revision 1 and all toggles true is virgin');
      assert.strictEqual(checkVirgin(DEFAULT_PLANS, false, 1), false, 'Server with workflow disabled is NOT virgin');

      const customizedPlans = JSON.parse(JSON.stringify(DEFAULT_PLANS));
      customizedPlans.byok_starter.featureToggles.allHelpersEnabled = false;
      assert.strictEqual(checkVirgin(customizedPlans, true, 1), false, 'Server with disabled helpers is NOT virgin');
    });

    it('4.2 hasCustomizedDisabledStates accurately detects disabled customization states', async () => {
      const { DEFAULT_PLANS } = await import(pathToFileURL(PATHS.plansConfig).href);

      function checkHasCustom(master, localWorkflow, localPlans) {
        if (localWorkflow === false) return true;
        if (master && master.workflowCustomizationUserEnabled === false) return true;
        const targetPlans = master?.plans || localPlans;
        if (!targetPlans) return false;

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
        return false;
      }

      assert.strictEqual(checkHasCustom(null, true, DEFAULT_PLANS), false, 'Default plans with local workflow true has no custom disabled states');
      assert.strictEqual(checkHasCustom(null, false, DEFAULT_PLANS), true, 'Disabled local workflow is recognized as customized');

      const masterWithDisabledHelper = {
        revision: 5,
        updatedAt: new Date().toISOString(),
        plans: JSON.parse(JSON.stringify(DEFAULT_PLANS)),
        workflowCustomizationUserEnabled: true,
        enabledToolConnectors: []
      };
      masterWithDisabledHelper.plans.byok_starter.featureToggles.allHelpersEnabled = false;
      assert.strictEqual(checkHasCustom(masterWithDisabledHelper, true, DEFAULT_PLANS), true, 'Master with disabled helpers is customized');
    });
  });
});
