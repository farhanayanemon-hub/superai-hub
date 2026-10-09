import { get } from 'svelte/store';
import type { UserProfile, PlanTier, BillingInterval } from '$lib/stores/userStore';
import type { StoreBot } from '$lib/config/storeBots';
import { plansStore } from '$lib/stores/plansStore';
import { getPlanPrice } from '$lib/config/plans';

export const PLAN_PRICES: Record<PlanTier, Record<BillingInterval, number>> = {
  free: { monthly: 0, yearly: 0 },
  byok: { monthly: 499, yearly: 4790 },
  managed: { monthly: 1499, yearly: 14390 },
  pro: { monthly: 499, yearly: 4790 },
  ultra: { monthly: 499, yearly: 4790 },
  complete: { monthly: 1499, yearly: 14390 }
};

export interface OPayInitiateResult {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

export async function initiateSubscriptionPayment(
  plan: PlanTier,
  interval: BillingInterval,
  user: UserProfile | null,
  customAmount?: number
): Promise<OPayInitiateResult> {
  const currentPlans = get(plansStore);
  const amount = customAmount || getPlanPrice(currentPlans, plan, interval) || PLAN_PRICES[plan]?.[interval] || 499;

  try {
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'subscription',
        plan,
        interval,
        amount,
        customerName: user?.name || 'Valued Executive',
        customerEmail: user?.email || 'customer@ezboagents.com'
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to initialize OPay payment' };
    }

    return { success: true, paymentUrl: data.paymentUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error initializing payment' };
  }
}

export async function initiateBotPayment(
  bot: StoreBot,
  interval: BillingInterval = 'monthly',
  user: UserProfile | null = null
): Promise<OPayInitiateResult> {
  const amount = interval === 'yearly' ? bot.yearlyPrice : bot.monthlyPrice;

  try {
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'store_bot',
        botId: bot.id,
        botName: bot.name,
        interval,
        amount,
        customerName: user?.name || 'Valued Executive',
        customerEmail: user?.email || 'customer@ezboagents.com'
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to initialize OPay checkout' };
    }

    return { success: true, paymentUrl: data.paymentUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error initializing payment' };
  }
}

export async function verifyOpayTransaction(transactionId: string) {
  const res = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionId })
  });
  return await res.json();
}
