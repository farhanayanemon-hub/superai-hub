import { writable } from 'svelte/store';
import { DEFAULT_PLANS, type PlansSettings, type PlanConfig, type PlanTierId } from '$lib/config/plans';
import { TOOL_CONNECTORS } from '$lib/config/toolConnectors';

export const MASTER_STORAGE_KEY = 'ezbo_admin_plans_master';
const STORAGE_KEY = 'ezbo_public_plans';
const TOOLS_STORAGE_KEY = 'ezbo_enabled_tool_connectors';
const WORKFLOW_USER_STORAGE_KEY = 'ezbo_workflow_user_enabled';

export interface AdminPlansMaster {
  revision: number;
  updatedAt: string;
  plans: PlansSettings;
  workflowCustomizationUserEnabled: boolean;
  enabledToolConnectors: string[];
}

export function getAllToolConnectorIds(): string[] {
  return TOOL_CONNECTORS.map((t) => t.id);
}

export function getAdminPlansMaster(): AdminPlansMaster | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MASTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.plans) {
      return {
        revision: typeof parsed.revision === 'number' ? parsed.revision : 1,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
        plans: normalizePlans(parsed.plans),
        workflowCustomizationUserEnabled: parsed.workflowCustomizationUserEnabled !== false,
        enabledToolConnectors: Array.isArray(parsed.enabledToolConnectors)
          ? parsed.enabledToolConnectors
          : getAllToolConnectorIds()
      };
    }
  } catch {}
  return null;
}

export function saveAdminPlansMaster(master: Partial<AdminPlansMaster>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAdminPlansMaster();
    const updated: AdminPlansMaster = {
      revision: master.revision ?? (existing ? existing.revision + 1 : 1),
      updatedAt: master.updatedAt ?? new Date().toISOString(),
      plans: master.plans ? normalizePlans(master.plans) : (existing ? existing.plans : getInitialPlans()),
      workflowCustomizationUserEnabled: master.workflowCustomizationUserEnabled ?? (existing ? existing.workflowCustomizationUserEnabled : getInitialWorkflowCustomizationState()),
      enabledToolConnectors: master.enabledToolConnectors ?? (existing ? existing.enabledToolConnectors : getInitialEnabledToolConnectors())
    };
    localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.plans));
    localStorage.setItem(WORKFLOW_USER_STORAGE_KEY, String(updated.workflowCustomizationUserEnabled));
    localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(updated.enabledToolConnectors));

    plansStore.set(updated.plans);
    workflowCustomizationUserStore.set(updated.workflowCustomizationUserEnabled);
    enabledToolConnectorsStore.set(updated.enabledToolConnectors);

    window.dispatchEvent(new CustomEvent('ezbo:plans-settings-updated', { detail: { plans: updated.plans } }));
    window.dispatchEvent(new CustomEvent('ezbo:workflow-settings-updated', { detail: { enabled: updated.workflowCustomizationUserEnabled } }));
    window.dispatchEvent(new CustomEvent('ezbo:tools-settings-updated'));
  } catch (err) {
    console.warn('Failed to save admin plans master:', err);
  }
}

export function isVirginServerDefault(
  serverPlans: PlansSettings,
  serverWorkflowEnabled?: boolean,
  serverRevision?: number
): boolean {
  if (serverRevision !== undefined && serverRevision === 0) return true;
  const tiers: PlanTierId[] = ['byok_starter', 'byok_pro', 'managed'];
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

export function hasCustomizedDisabledStates(
  master: AdminPlansMaster | null,
  localWorkflow?: boolean,
  localPlans?: PlansSettings
): boolean {
  if (localWorkflow === false) return true;
  if (master && master.workflowCustomizationUserEnabled === false) return true;
  const targetPlans = master?.plans || localPlans;
  if (!targetPlans) return false;

  const tiers: PlanTierId[] = ['byok_starter', 'byok_pro', 'managed'];
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

  if (master && Array.isArray(master.enabledToolConnectors) && master.enabledToolConnectors.length < getAllToolConnectorIds().length) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      const rawTools = localStorage.getItem(TOOLS_STORAGE_KEY);
      if (rawTools) {
        const parsedTools = JSON.parse(rawTools);
        if (Array.isArray(parsedTools) && parsedTools.length < getAllToolConnectorIds().length) {
          return true;
        }
      }
    } catch {}
  }

  return false;
}

export async function syncMasterToServer(masterConfig: AdminPlansMaster): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const adminSecret = sessionStorage.getItem('ezbo_admin_secret') || 'ezbo-admin-2026';
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminSecret,
        patch: {
          revision: masterConfig.revision,
          updatedAt: masterConfig.updatedAt,
          plans: masterConfig.plans,
          workflowCustomizationUserEnabled: masterConfig.workflowCustomizationUserEnabled,
          enabledToolConnectors: masterConfig.enabledToolConnectors
        }
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not re-sync master config to server:', err);
    return false;
  }
}

function getInitialEnabledToolConnectors(): string[] {
  if (typeof window === 'undefined') return getAllToolConnectorIds();
  try {
    const master = getAdminPlansMaster();
    if (master && Array.isArray(master.enabledToolConnectors)) {
      return master.enabledToolConnectors;
    }
    const raw = localStorage.getItem(TOOLS_STORAGE_KEY);
    if (!raw) return getAllToolConnectorIds();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fallback
  }
  return getAllToolConnectorIds();
}

export const enabledToolConnectorsStore = writable<string[]>(getInitialEnabledToolConnectors());

function getInitialWorkflowCustomizationState(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const master = getAdminPlansMaster();
    if (master && typeof master.workflowCustomizationUserEnabled === 'boolean') {
      return master.workflowCustomizationUserEnabled;
    }
    const raw = localStorage.getItem(WORKFLOW_USER_STORAGE_KEY);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch {
    // fallback
  }
  return true;
}

export const workflowCustomizationUserStore = writable<boolean>(getInitialWorkflowCustomizationState());

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === MASTER_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.plans) plansStore.set(normalizePlans(parsed.plans));
        if (typeof parsed?.workflowCustomizationUserEnabled === 'boolean') {
          workflowCustomizationUserStore.set(parsed.workflowCustomizationUserEnabled);
        }
        if (Array.isArray(parsed?.enabledToolConnectors)) {
          enabledToolConnectorsStore.set(parsed.enabledToolConnectors);
        }
      } catch {}
    }
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        plansStore.set(normalizePlans(parsed));
      } catch {}
    }
    if (event.key === WORKFLOW_USER_STORAGE_KEY && event.newValue !== null) {
      workflowCustomizationUserStore.set(event.newValue === 'true');
    }
    if (event.key === TOOLS_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) enabledToolConnectorsStore.set(parsed);
      } catch {}
    }
  });
  window.addEventListener('ezbo:plans-settings-updated', (event: any) => {
    if (event?.detail?.plans) {
      plansStore.set(normalizePlans(event.detail.plans));
    }
  });
  window.addEventListener('ezbo:workflow-settings-updated', (event: any) => {
    if (event?.detail && typeof event.detail.enabled === 'boolean') {
      workflowCustomizationUserStore.set(event.detail.enabled);
    }
  });
  window.addEventListener('ezbo:tools-settings-updated', () => {
    try {
      const raw = localStorage.getItem(TOOLS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) enabledToolConnectorsStore.set(parsed);
      }
    } catch {}
  });
}

export function normalizePlans(raw: any): PlansSettings {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PLANS;
  }

  const legacyByok = raw.byok;
  const starterSource = raw.byok_starter || legacyByok || DEFAULT_PLANS.byok_starter;
  const byok_starter: PlanConfig = {
    ...DEFAULT_PLANS.byok_starter,
    ...starterSource,
    id: 'byok_starter',
    isEnabled: starterSource.isEnabled !== undefined ? starterSource.isEnabled : DEFAULT_PLANS.byok_starter.isEnabled,
    featureToggles: {
      ...DEFAULT_PLANS.byok_starter.featureToggles,
      ...(starterSource.featureToggles || {}),
      allHelpersEnabled: starterSource.featureToggles?.allHelpersEnabled !== undefined
        ? starterSource.featureToggles.allHelpersEnabled
        : DEFAULT_PLANS.byok_starter.featureToggles.allHelpersEnabled,
      enabledHelpers: Array.isArray(starterSource.featureToggles?.enabledHelpers)
        ? starterSource.featureToggles.enabledHelpers
        : [...(DEFAULT_PLANS.byok_starter.featureToggles.enabledHelpers || [])],
      allToolsEnabled: starterSource.featureToggles?.allToolsEnabled !== undefined
        ? starterSource.featureToggles.allToolsEnabled
        : DEFAULT_PLANS.byok_starter.featureToggles.allToolsEnabled,
      enabledTools: Array.isArray(starterSource.featureToggles?.enabledTools)
        ? starterSource.featureToggles.enabledTools
        : [...(DEFAULT_PLANS.byok_starter.featureToggles.enabledTools || [])]
    }
  };

  const proSource = raw.byok_pro || DEFAULT_PLANS.byok_pro;
  const byok_pro: PlanConfig = {
    ...DEFAULT_PLANS.byok_pro,
    ...proSource,
    id: 'byok_pro',
    isEnabled: proSource.isEnabled !== undefined ? proSource.isEnabled : DEFAULT_PLANS.byok_pro.isEnabled,
    featureToggles: {
      ...DEFAULT_PLANS.byok_pro.featureToggles,
      ...(proSource.featureToggles || {}),
      allHelpersEnabled: proSource.featureToggles?.allHelpersEnabled !== undefined
        ? proSource.featureToggles.allHelpersEnabled
        : DEFAULT_PLANS.byok_pro.featureToggles.allHelpersEnabled,
      enabledHelpers: Array.isArray(proSource.featureToggles?.enabledHelpers)
        ? proSource.featureToggles.enabledHelpers
        : [...(DEFAULT_PLANS.byok_pro.featureToggles.enabledHelpers || [])],
      allToolsEnabled: proSource.featureToggles?.allToolsEnabled !== undefined
        ? proSource.featureToggles.allToolsEnabled
        : DEFAULT_PLANS.byok_pro.featureToggles.allToolsEnabled,
      enabledTools: Array.isArray(proSource.featureToggles?.enabledTools)
        ? proSource.featureToggles.enabledTools
        : [...(DEFAULT_PLANS.byok_pro.featureToggles.enabledTools || [])]
    }
  };

  const managedSource = raw.managed || raw.complete || DEFAULT_PLANS.managed;
  const managed: PlanConfig = {
    ...DEFAULT_PLANS.managed,
    ...managedSource,
    id: 'managed',
    isEnabled: managedSource.isEnabled !== undefined ? managedSource.isEnabled : DEFAULT_PLANS.managed.isEnabled,
    featureToggles: {
      ...DEFAULT_PLANS.managed.featureToggles,
      ...(managedSource.featureToggles || {}),
      allHelpersEnabled: managedSource.featureToggles?.allHelpersEnabled !== undefined
        ? managedSource.featureToggles.allHelpersEnabled
        : DEFAULT_PLANS.managed.featureToggles.allHelpersEnabled,
      enabledHelpers: Array.isArray(managedSource.featureToggles?.enabledHelpers)
        ? managedSource.featureToggles.enabledHelpers
        : [...(DEFAULT_PLANS.managed.featureToggles.enabledHelpers || [])],
      allToolsEnabled: managedSource.featureToggles?.allToolsEnabled !== undefined
        ? managedSource.featureToggles.allToolsEnabled
        : DEFAULT_PLANS.managed.featureToggles.allToolsEnabled,
      enabledTools: Array.isArray(managedSource.featureToggles?.enabledTools)
        ? managedSource.featureToggles.enabledTools
        : [...(DEFAULT_PLANS.managed.featureToggles.enabledTools || [])]
    }
  };

  const byok: PlanConfig = raw.byok
    ? { ...byok_starter, ...raw.byok, id: 'byok_starter' }
    : byok_starter;

  return {
    byok_starter,
    byok_pro,
    managed,
    byok
  };
}

function getInitialPlans(): PlansSettings {
  if (typeof window === 'undefined') return DEFAULT_PLANS;
  try {
    const master = getAdminPlansMaster();
    if (master && master.plans) {
      return normalizePlans(master.plans);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLANS;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const normalized = normalizePlans(parsed);
      if (!parsed.byok_starter || !parsed.byok_pro) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } catch {
          // ignore
        }
      }
      return normalized;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_PLANS;
}

export const plansStore = writable<PlansSettings>(getInitialPlans());

let inFlightPromise: Promise<PlansSettings> | null = null;
let lastFetched = 0;

export async function loadPublicPlans(force = false): Promise<PlansSettings> {
  const now = Date.now();
  // Throttle re-fetching to once every 30 seconds unless forced
  if (!force && now - lastFetched < 30000 && typeof window !== 'undefined') {
    const cached = getInitialPlans();
    plansStore.set(cached);
    return cached;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const url = force ? `/api/plans?_t=${now}` : '/api/plans';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plans) {
          const normalized = normalizePlans(data.plans);
          const serverRevision = typeof data.revision === 'number' ? data.revision : 0;
          const master = getAdminPlansMaster();
          const localWorkflow = getInitialWorkflowCustomizationState();
          const localPlans = getInitialPlans();
          const clientHasCustom = hasCustomizedDisabledStates(master, localWorkflow, localPlans);
          const isServerVirgin = serverRevision === 0 || isVirginServerDefault(normalized, data.workflowCustomizationUserEnabled, serverRevision);

          // COLD-START PROTECTION:
          // If cold-started server returns default values while client has customized settings,
          // preserve client disabled states and sync master configuration back to /api/admin/settings.
          if (isServerVirgin && clientHasCustom) {
            const effectivePlans = master?.plans || localPlans;
            const effectiveWorkflow = master ? master.workflowCustomizationUserEnabled : localWorkflow;
            const effectiveTools = master?.enabledToolConnectors || getInitialEnabledToolConnectors();

            plansStore.set(effectivePlans);
            workflowCustomizationUserStore.set(effectiveWorkflow);
            enabledToolConnectorsStore.set(effectiveTools);
            lastFetched = now;

            // Background sync back to /api/admin/settings
            syncMasterToServer({
              revision: (master?.revision || 1),
              updatedAt: master?.updatedAt || new Date().toISOString(),
              plans: effectivePlans,
              workflowCustomizationUserEnabled: effectiveWorkflow,
              enabledToolConnectors: effectiveTools
            }).catch(() => {});

            return effectivePlans;
          }

          // Standard server update
          plansStore.set(normalized);
          lastFetched = now;
          if (typeof data.workflowCustomizationUserEnabled === 'boolean') {
            workflowCustomizationUserStore.set(data.workflowCustomizationUserEnabled);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(WORKFLOW_USER_STORAGE_KEY, String(data.workflowCustomizationUserEnabled));
              } catch {
                // ignore
              }
            }
          }
          if (data.enabledToolConnectors && Array.isArray(data.enabledToolConnectors)) {
            enabledToolConnectorsStore.set(data.enabledToolConnectors);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(TOOLS_STORAGE_KEY, JSON.stringify(data.enabledToolConnectors));
              } catch {
                // ignore
              }
            }
          }
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
              if (serverRevision > 0) {
                const currentMaster = getAdminPlansMaster();
                if (!currentMaster || serverRevision >= currentMaster.revision) {
                  const newMaster: AdminPlansMaster = {
                    revision: serverRevision,
                    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
                    plans: normalized,
                    workflowCustomizationUserEnabled: data.workflowCustomizationUserEnabled !== false,
                    enabledToolConnectors: Array.isArray(data.enabledToolConnectors) ? data.enabledToolConnectors : getAllToolConnectorIds()
                  };
                  localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(newMaster));
                }
              }
            } catch (e) {
              // ignore
            }
          }
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Failed to load dynamic plans, using cached/defaults:', e);
    } finally {
      inFlightPromise = null;
    }

    return getInitialPlans();
  })();

  return inFlightPromise;
}

export async function loadEnabledToolConnectors(force = false): Promise<string[]> {
  await loadPublicPlans(force);
  let currentVal: string[] = [];
  const unsubscribe = enabledToolConnectorsStore.subscribe((val) => {
    currentVal = val;
  });
  unsubscribe();
  return currentVal;
}
