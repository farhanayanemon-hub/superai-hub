<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { STORE_BOTS, type StoreBot } from '$lib/config/storeBots';
  import { subscription, activeDashboardTab } from '$lib/stores/userStore';

  let { onBrowseStore } = $props<{
    onBrowseStore?: () => void;
  }>();

  // Find all bots unlocked by current user
  const unlockedBotsList = $derived.by(() => {
    const unlockedIds = $subscription?.unlockedStoreBots || [];
    return STORE_BOTS.filter((bot) => unlockedIds.includes(bot.id));
  });

  let selectedBot = $state<StoreBot | null>(null);
  let activeTabFilter = $state<string>('all');
</script>

<div class="h-full flex flex-col space-y-6 overflow-y-auto pr-1 pb-12">
  <!-- Header Banner -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 ui-banner-navy text-white p-5 sm:p-6 rounded-3xl">
    <div class="space-y-1">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38CFFF]/15 border border-[#38CFFF]/35 text-[#38CFFF] text-[10px] font-extrabold uppercase tracking-wider">
        <Icon name="ShieldCheck" size={12} />
        <span>Your Autonomous Fleet</span>
      </div>
      <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
        <span>Owned Autonomous Agents</span>
        <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
          {unlockedBotsList.length} Active
        </span>
      </h2>
      <p class="text-xs text-white/80 max-w-2xl leading-relaxed">
        These are your purchased standalone autonomous agents. They execute dedicated business workflows and client automations exclusively inside your web console.
      </p>
    </div>

    <div class="shrink-0">
      <button
        type="button"
        onclick={() => {
          if (onBrowseStore) onBrowseStore();
          else activeDashboardTab.set('store');
        }}
        class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
      >
        <Icon name="ShoppingBag" size={14} />
        <span>Browse Agents Store</span>
      </button>
    </div>
  </div>

  <!-- Content View -->
  {#if unlockedBotsList.length === 0}
    <!-- Empty State -->
    <div class="p-10 sm:p-14 rounded-3xl bg-white/70 backdrop-blur-xl border border-[#CFE2FA] shadow-xs flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto space-y-4">
      <div class="w-16 h-16 rounded-3xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shadow-xs">
        <Icon name="Bot" size={32} />
      </div>
      <div class="space-y-1">
        <h3 class="text-base sm:text-lg font-black text-[#102A56]">
          No Autonomous Agents Owned Yet
        </h3>
        <p class="text-xs text-[#5E7694] leading-relaxed max-w-md">
          You have not unlocked any standalone autonomous agents yet. Browse our Agents Store to find specialized bots for sales objection handling, lead qualification, and customer support.
        </p>
      </div>
      <button
        type="button"
        onclick={() => {
          if (onBrowseStore) onBrowseStore();
          else activeDashboardTab.set('store');
        }}
        class="px-5 py-2.5 rounded-xl blue-btn text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
      >
        <Icon name="ShoppingBag" size={15} />
        <span>Explore Available Agents</span>
      </button>
    </div>
  {:else}
    <!-- Grid of Owned Agents -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each unlockedBotsList as bot (bot.id)}
        <div
          class="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-[#CFE2FA] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#1677FF] to-[#38CFFF] p-0.5 shadow-xs">
                <div class="w-full h-full rounded-2xl bg-white flex items-center justify-center text-[#1677FF]">
                  <Icon name="Bot" size={20} />
                </div>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ Owned
              </span>
            </div>

            <div>
              <h4 class="text-sm font-black text-[#102A56] group-hover:text-[#1677FF] transition-colors">
                {bot.name}
              </h4>
              <span class="text-[10px] text-[#5E7694] uppercase tracking-wider font-semibold">
                {bot.category}
              </span>
            </div>

            <p class="text-xs text-[#5E7694] leading-relaxed line-clamp-3">
              {bot.description}
            </p>
          </div>

          <div class="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Autonomous Ready</span>
            </span>

            <button
              type="button"
              onclick={() => (selectedBot = bot)}
              class="px-3 py-1.5 rounded-xl bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#CFE2FA] text-[#1677FF] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Configure Agent
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Modal to Configure Owned Agent -->
  {#if selectedBot}
    <div
      class="fixed inset-0 bg-[#0B1F42]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="presentation"
    >
      <button
        type="button"
        class="fixed inset-0 w-full h-full cursor-default bg-transparent -z-10"
        onclick={() => (selectedBot = null)}
        aria-label="Close modal backdrop"
      ></button>
      <div
        class="w-full max-w-lg bg-white rounded-3xl border border-[#CFE2FA] shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150 relative z-10"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#F3F8FF] border border-[#CFE2FA] flex items-center justify-center text-[#1677FF] shadow-xs">
              <Icon name="Bot" size={24} />
            </div>
            <div>
              <h3 class="text-base font-black text-[#102A56]">{selectedBot.name}</h3>
              <span class="text-xs text-[#5E7694]">{selectedBot.category} • Autonomous Agent</span>
            </div>
          </div>
          <button
            type="button"
            onclick={() => (selectedBot = null)}
            class="text-[#5E7694] hover:text-[#102A56] p-1 rounded-xl cursor-pointer"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div class="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E3ECF7] text-xs text-[#5E7694] leading-relaxed">
          {selectedBot.description}
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-[#102A56] uppercase tracking-wider">Agent Settings</h4>
          <div>
            <label for="agent-directives" class="block text-xs font-semibold text-[#102A56] mb-1">Agent Custom Directives</label>
            <textarea
              id="agent-directives"
              rows="3"
              placeholder="Enter custom business rules or persona directives for this agent..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE2FA] text-xs text-[#102A56] placeholder-[#889DB5] focus:outline-none focus:border-[#1677FF] bg-[#F8FAFC]"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F1F5F9]">
          <button
            type="button"
            onclick={() => (selectedBot = null)}
            class="px-4 py-2 rounded-xl text-xs font-semibold text-[#5E7694] hover:text-[#102A56] cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onclick={() => (selectedBot = null)}
            class="px-5 py-2.5 rounded-xl blue-btn text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
