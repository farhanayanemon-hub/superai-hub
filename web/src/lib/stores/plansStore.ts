import { writable } from 'svelte/store';
import { DEFAULT_PLANS, type PlansSettings, type PlanConfig } from '$lib/config/plans';
import { TOOL_CONNECTORS } from '$lib/config/toolConnectors';

const STORAGE_KEY = 'ezbo_public_plans';
const TOOLS_STORAGE_KEY = 'ezbo_enabled_tool_connectors';
const WORKFLOW_USER_STORAGE_KEY = 'ezbo_workflow_user_enabled';

export function getAllToolConnectorIds(): string[] {
  return TOOL_CONNECTORS.map((t) => t.id);
}

function getInitialEnabledToolConnectors(): string[] {
  if (typeof window === 'undefined') return getAllToolConnectorIds();
  try {
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
    const raw = localStorage.getItem(WORKFLOW_USER_STORAGE_KEY);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch {
    // fallback
  }
  return true;
}

export const workflowCustomizationUserStore = writable<boolean>(getInitialWorkflowCustomizationState());

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
    featureToggles: {
      ...DEFAULT_PLANS.byok_starter.featureToggles,
      ...(starterSource.featureToggles || {})
    }
  };

  const proSource = raw.byok_pro || DEFAULT_PLANS.byok_pro;
  const byok_pro: PlanConfig = {
    ...DEFAULT_PLANS.byok_pro,
    ...proSource,
    id: 'byok_pro',
    featureToggles: {
      ...DEFAULT_PLANS.byok_pro.featureToggles,
      ...(proSource.featureToggles || {})
    }
  };

  const managedSource = raw.managed || raw.complete || DEFAULT_PLANS.managed;
  const managed: PlanConfig = {
    ...DEFAULT_PLANS.managed,
    ...managedSource,
    id: 'managed',
    featureToggles: {
      ...DEFAULT_PLANS.managed.featureToggles,
      ...(managedSource.featureToggles || {})
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

let isLoading = false;
let lastFetched = 0;

export async function loadPublicPlans(force = false): Promise<PlansSettings> {
  const now = Date.now();
  // Throttle re-fetching to once every 30 seconds unless forced
  if (!force && now - lastFetched < 30000 && typeof window !== 'undefined') {
    return getInitialPlans();
  }

  if (isLoading) return getInitialPlans();
  isLoading = true;

  try {
    const res = await fetch('/api/plans');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.plans) {
        const normalized = normalizePlans(data.plans);
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
    isLoading = false;
  }

  return getInitialPlans();
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
