import { writable } from 'svelte/store';
import { DEFAULT_PLANS, type PlansSettings, type PlanConfig } from '$lib/config/plans';

const STORAGE_KEY = 'ezbo_public_plans';

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
