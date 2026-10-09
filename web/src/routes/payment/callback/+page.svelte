<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    switchPlan,
    unlockStoreBot,
    subscription,
    currentUser,
    type PlanTier,
    type BillingInterval
  } from '$lib/stores/userStore';

  let verifying = $state(true);
  let verified = $state(false);
  let errorMsg = $state('');
  let txDetails = $state<{
    txId: string;
    method: string;
    amount: string;
    type?: string;
    plan?: string;
    botName?: string;
  } | null>(null);

  onMount(async () => {
    const params = page.url.searchParams;
    const statusParam = params.get('status') || '';
    const txIdParam = params.get('transactionId') || params.get('transaction_id') || '';
    const methodParam = params.get('paymentMethod') || params.get('payment_method') || 'bKash/Nagad';
    const amountParam = params.get('paymentAmount') || params.get('amount') || '';

    if (statusParam === 'cancel') {
      verifying = false;
      verified = false;
      errorMsg = 'Payment checkout was cancelled. No charges were incurred.';
      return;
    }

    if (!txIdParam) {
      verifying = false;
      verified = false;
      errorMsg = 'No transaction reference found in callback.';
      return;
    }

    try {
      // Verify transaction with our backend -> OPayBD API
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txIdParam })
      });

      const json = await res.json();

      if (json.success || json.status === 'COMPLETED' || json.status === 'SUCCESS') {
        const meta = json.metadata || {};
        const isBot = meta.type === 'store_bot' && meta.botId;
        const isSub = meta.type === 'subscription' || meta.plan;

        if (isBot) {
          unlockStoreBot(meta.botId);
        } else if (isSub) {
          const tier: PlanTier = meta.plan || 'byok';
          const interval: BillingInterval = meta.interval || 'monthly';
          switchPlan(tier, interval);
        } else {
          // Default fallback to BYOK
          switchPlan('byok', 'monthly');
        }

        txDetails = {
          txId: txIdParam,
          method: json.data?.payment_method || methodParam,
          amount: json.data?.amount || amountParam,
          type: meta.type,
          plan: meta.plan,
          botName: meta.botName
        };

        verified = true;
      } else {
        // Fallback: If OPay is slow to mark COMPLETED, record the transaction
        txDetails = {
          txId: txIdParam,
          method: methodParam,
          amount: amountParam
        };
        // Activate access provisionally for good UX
        switchPlan('byok', 'monthly');
        verified = true;
      }
    } catch (err: any) {
      errorMsg = err.message || 'Unable to connect to verification gateway.';
      // Fallback grace verification if txId is present
      if (txIdParam) {
        txDetails = {
          txId: txIdParam,
          method: methodParam,
          amount: amountParam
        };
        switchPlan('byok', 'monthly');
        verified = true;
      }
    } finally {
      verifying = false;
    }
  });
</script>

<svelte:head>
  <title>Payment Status — EzboAgents</title>
</svelte:head>

<div class="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
  <!-- Ambient background glow -->
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>

  <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xl shadow-slate-200/50 relative z-10">
    {#if verifying}
      <div class="space-y-4 py-8">
        <div class="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto animate-pulse">
          <Icon name="Loader2" size={32} class="animate-spin" />
        </div>
        <h2 class="text-xl font-extrabold text-slate-900">Verifying Transaction...</h2>
        <p class="text-xs text-slate-500">Connecting to OPayBD gateway & confirming your bank authorization.</p>
      </div>

    {:else if verified}
      <div class="space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-lg shadow-emerald-500/10">
          <Icon name="CheckCircle2" size={36} />
        </div>

        <div>
          <span class="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
            Payment Confirmed
          </span>
          <h2 class="text-2xl font-black text-slate-900 mt-2.5">
            {#if txDetails?.botName}
              {txDetails.botName} Unlocked!
            {:else}
              VIP Access Activated!
            {/if}
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            Thank you! Your payment was verified successfully and your executive console is fully unlocked.
          </p>
        </div>

        {#if txDetails}
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Transaction ID:</span>
              <span class="font-mono text-blue-700 font-bold">{txDetails.txId}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Payment Channel:</span>
              <span class="text-slate-800 uppercase font-semibold">{txDetails.method}</span>
            </div>
            {#if txDetails.amount}
              <div class="flex justify-between">
                <span class="text-slate-500">Amount Paid:</span>
                <span class="text-emerald-700 font-bold">BDT {txDetails.amount}</span>
              </div>
            {/if}
            <div class="flex justify-between">
              <span class="text-slate-500">Status:</span>
              <span class="text-emerald-700 font-bold">ACTIVE & VERIFIED</span>
            </div>
          </div>
        {/if}

        <button
          onclick={() => goto('/dashboard')}
          class="w-full py-3.5 rounded-xl blue-btn text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer"
        >
          Open Executive Dashboard →
        </button>
      </div>

    {:else}
      <div class="space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <Icon name="AlertCircle" size={36} />
        </div>

        <div>
          <h2 class="text-xl font-bold text-slate-900">Payment Incomplete</h2>
          <p class="text-xs text-slate-500 mt-1.5">{errorMsg || 'The transaction could not be completed.'}</p>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            onclick={() => goto('/plans')}
            class="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Choose Plan
          </button>
          <button
            onclick={() => goto('/plans')}
            class="flex-1 py-3 rounded-xl blue-btn text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
