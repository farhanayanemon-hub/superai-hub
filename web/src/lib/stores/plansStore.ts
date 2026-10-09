import { writable } from 'svelte/store';
import { DEFAULT_PLANS, type PlansSettings, type PlanConfig } from '$lib/config/plans';

const STORAGE_KEY = 'ezbo_public_plans';

function getInitialPlans(): PlansSettings {
  if (typeof window === 'undefined') return DEFAULT_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLANS;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.byok && parsed.managed) {
      return parsed;
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
  if (!force && (now - lastFetched < 30000) && typeof window !== 'undefined') {
    return getInitialPlans();
  }

  if (isLoading) return getInitialPlans();
  isLoading = true;

  try {
    const res = await fetch('/api/plans');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.plans) {
        plansStore.set(data.plans);
        lastFetched = now;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.plans));
          } catch (e) {
            // ignore
          }
        }
        return data.plans;
      }
    }
  } catch (e) {
    console.warn('Failed to load dynamic plans, using cached/defaults:', e);
  } finally {
    isLoading = false;
  }

  return DEFAULT_PLANS;
}
