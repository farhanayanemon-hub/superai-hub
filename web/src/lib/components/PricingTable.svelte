<script lang="ts">
  import Icon from './Icon.svelte';
  import { PRICING_PLANS, PAYMENT_METHODS, type PricingPlan } from '$lib/config/pricing';
  import { subscription } from '$lib/stores/userStore';

  let selectedBilling = $state<'monthly' | 'yearly'>('yearly');
  let checkoutModalOpen = $state(false);
  let selectedPlan = $state<PricingPlan>(PRICING_PLANS.yearly);
  let selectedGateway = $state('bkash');
  let customerPhone = $state('');
  let isCheckingOut = $state(false);
  let checkoutSuccess = $state(false);

  function openCheckout(plan: PricingPlan) {
    selectedPlan = plan;
    checkoutModalOpen = true;
    checkoutSuccess = false;
  }

  async function handlePayment() {
    if (!customerPhone.trim()) {
      alert('অনুগ্রহ করে আপনার সচল মোবাইল নম্বর দিন।');
      return;
    }

    isCheckingOut = true;
    await new Promise((r) => setTimeout(r, 1800));

    // Update subscription store
    subscription.set({
      plan: selectedPlan.id,
      status: 'active',
      expiresAt: new Date(Date.now() + (selectedPlan.id === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      isVip: selectedPlan.id === 'yearly'
    });

    isCheckingOut = false;
    checkoutSuccess = true;

    setTimeout(() => {
      checkoutModalOpen = false;
      window.location.href = '/dashboard';
    }, 2000);
  }
</script>

<div class="w-full max-w-6xl mx-auto">
  <!-- Section Title -->
  <div class="text-center space-y-3 mb-10">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
      <Icon name="Crown" size={13} />
      <span>স্বচ্ছ ও সাশ্রয়ী সাবস্ক্রিপশন</span>
    </div>
    <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
      আপনার ব্যবসার গতি বাড়ান মাত্র এক ক্লিকে
    </h2>
    <p class="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
      কোনো লুকানো খরচ নেই। ফ্রি Gemini API Key ব্যবহার করায় কোনো টোকেন চার্জ কাটা হবে না।
    </p>

    <!-- Plan Toggle Bar -->
    <div class="pt-4 flex items-center justify-center gap-3">
      <div class="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center shadow-inner">
        <button
          onclick={() => (selectedBilling = 'monthly')}
          class="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all {selectedBilling === 'monthly' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}"
        >
          মাসিক প্ল্যান (৳৪৯৯/মাস)
        </button>

        <button
          onclick={() => (selectedBilling = 'yearly')}
          class="relative px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 {selectedBilling === 'yearly' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}"
        >
          <span>বাৎসরিক স্পেশাল (৳১,৪৯৯/১ম বছর)</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-tight">
            ৭৫% ছাড়
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- Pricing Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
    <!-- Monthly Card -->
    <div class="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between relative backdrop-blur-sm transition-all hover:border-slate-700">
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">{PRICING_PLANS.monthly.nameBn}</h3>
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            ৩০ দিনের মেয়াদ
          </span>
        </div>

        <p class="text-xs text-slate-400 mb-6 leading-relaxed">
          {PRICING_PLANS.monthly.description}
        </p>

        <!-- Price Display -->
        <div class="flex items-baseline gap-1.5 mb-6">
          <span class="text-4xl sm:text-5xl font-extrabold text-white font-mono">৳{PRICING_PLANS.monthly.price}</span>
          <span class="text-sm text-slate-400">{PRICING_PLANS.monthly.periodBn}</span>
        </div>

        <!-- Features List -->
        <ul class="space-y-3 text-xs sm:text-sm text-slate-300 mb-8">
          {#each PRICING_PLANS.monthly.features as feat}
            <li class="flex items-start gap-2.5">
              <Icon name="CheckCircle2" size={16} class="text-emerald-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          {/each}
        </ul>
      </div>

      <button
        onclick={() => openCheckout(PRICING_PLANS.monthly)}
        class="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all shadow-md active:scale-98"
      >
        {PRICING_PLANS.monthly.ctaText}
      </button>
    </div>

    <!-- Yearly Card (Featured) -->
    <div class="rounded-3xl bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/60 p-8 flex flex-col justify-between relative backdrop-blur-sm shadow-2xl shadow-emerald-500/10 transition-all hover:border-emerald-400">
      <!-- Top Badge -->
      <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold shadow-md uppercase tracking-wider">
        সবচেয়ে জনপ্রিয় • অফার লিমিটেড
      </div>

      <div>
        <div class="flex items-center justify-between mb-4 mt-2">
          <h3 class="text-xl font-bold text-white">{PRICING_PLANS.yearly.nameBn}</h3>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {PRICING_PLANS.yearly.discountBadge}
          </span>
        </div>

        <p class="text-xs text-slate-400 mb-6 leading-relaxed">
          {PRICING_PLANS.yearly.description}
        </p>

        <!-- Price Display -->
        <div class="mb-2">
          <div class="flex items-baseline gap-2">
            <span class="text-4xl sm:text-5xl font-extrabold text-white font-mono">৳{PRICING_PLANS.yearly.price}</span>
            <span class="text-sm text-slate-400">{PRICING_PLANS.yearly.periodBn}</span>
            <span class="text-sm line-through text-slate-500 font-mono">৳{PRICING_PLANS.yearly.originalPrice}</span>
          </div>
          <p class="text-[11px] text-amber-400/90 mt-1">
            * {PRICING_PLANS.yearly.renewalNotice}
          </p>
        </div>

        <!-- Features List -->
        <ul class="space-y-3 text-xs sm:text-sm text-slate-300 my-8">
          {#each PRICING_PLANS.yearly.features as feat}
            <li class="flex items-start gap-2.5">
              <Icon name="CheckCircle2" size={16} class="text-emerald-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          {/each}
        </ul>
      </div>

      <button
        onclick={() => openCheckout(PRICING_PLANS.yearly)}
        class="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/30 active:scale-98 flex items-center justify-center gap-2"
      >
        <Icon name="Sparkles" size={18} />
        <span>{PRICING_PLANS.yearly.ctaText}</span>
      </button>
    </div>
  </div>

  <!-- Gateway logos strip -->
  <div class="mt-12 text-center space-y-3">
    <p class="text-xs text-slate-500 uppercase tracking-widest font-semibold">
      তাত্ক্ষণিক পেমেন্ট সাপোর্ট: bKash, Nagad, Rocket, ও কার্ড
    </p>
    <div class="flex items-center justify-center gap-6 opacity-70">
      <span class="text-xs font-bold text-pink-400">bKash</span>
      <span class="text-xs font-bold text-orange-400">Nagad</span>
      <span class="text-xs font-bold text-purple-400">Rocket</span>
      <span class="text-xs font-bold text-blue-400">Visa / MasterCard</span>
      <span class="text-xs font-bold text-emerald-400">৩ দিনের গ্রেস পিরিয়ড</span>
    </div>
  </div>
</div>

<!-- Interactive Checkout Modal -->
{#if checkoutModalOpen}
  <div
    class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
    onclick={() => !isCheckingOut && (checkoutModalOpen = false)}
    role="presentation"
  >
    <div
      class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <h3 class="font-bold text-base text-white">অর্ডার কনফার্মেশন ও চেকআউট</h3>
        <button
          onclick={() => (checkoutModalOpen = false)}
          disabled={isCheckingOut}
          class="p-1 text-slate-400 hover:text-white"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      {#if checkoutSuccess}
        <!-- Success Screen -->
        <div class="p-8 text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Icon name="CheckCircle2" size={36} />
          </div>
          <h4 class="text-xl font-bold text-white">পেমেন্ট সফল হয়েছে!</h4>
          <p class="text-xs text-slate-300">
            আপনার {selectedPlan.nameBn} অ্যাক্টিভ হয়েছে। ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...
          </p>
        </div>
      {:else}
        <!-- Form Screen -->
        <div class="p-6 space-y-5 text-xs text-slate-300">
          <!-- Order Summary -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-sm text-white">{selectedPlan.nameBn}</h4>
              <p class="text-[11px] text-slate-400">৫০+ টুলস + WhatsApp বট আনলিমিটেড</p>
            </div>
            <div class="text-right">
              <span class="text-xl font-bold text-emerald-400 font-mono">৳{selectedPlan.price}</span>
              <p class="text-[10px] text-slate-500">{selectedPlan.periodBn}</p>
            </div>
          </div>

          <!-- Select Gateway -->
          <div class="space-y-2">
            <label class="block font-semibold text-slate-200">পেমেন্ট মাধ্যম নির্বাচন করুন</label>
            <div class="grid grid-cols-2 gap-2">
              {#each PAYMENT_METHODS as method}
                <button
                  type="button"
                  onclick={() => (selectedGateway = method.id)}
                  class="p-3 rounded-xl border flex items-center gap-2 transition-all {selectedGateway === method.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}"
                >
                  <span class="w-2.5 h-2.5 rounded-full {selectedGateway === method.id ? 'bg-emerald-400' : 'bg-slate-700'}"></span>
                  <span class="font-bold text-xs">{method.name}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Phone Number Input -->
          <div class="space-y-1.5">
            <label class="block font-semibold text-slate-200">আপনার মোবাইল নম্বর</label>
            <input
              type="text"
              bind:value={customerPhone}
              placeholder="017XXXXXXXX বা 018XXXXXXXX"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <!-- Pay CTA -->
          <button
            onclick={handlePayment}
            disabled={isCheckingOut}
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98 disabled:opacity-50"
          >
            {#if isCheckingOut}
              <Icon name="Loader2" size={16} class="animate-spin" />
              <span>পেমেন্ট গেটওয়ে ভ্যালিডেট হচ্ছে...</span>
            {:else}
              <Icon name="Check" size={16} />
              <span>৳{selectedPlan.price} পরিশোধ করে অ্যাক্টিভ করুন</span>
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
