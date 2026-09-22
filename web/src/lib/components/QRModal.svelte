<script lang="ts">
  import Icon from './Icon.svelte';
  import { whatsappStatus, whatsappQr } from '$lib/stores/userStore';
  import { whatsappApi } from '$lib/services/whatsappApi';

  let { isOpen = false, onClose }: { isOpen: boolean; onClose: () => void } = $props();

  let countdown = $state(45);
  let isConnecting = $state(false);

  // Initialize live backend stream when modal opens
  $effect(() => {
    if (isOpen) {
      whatsappApi.initStream();
      whatsappApi.triggerSessionStart();
    }
  });

  // Auto decrement timer for QR code validity
  $effect(() => {
    let interval: any;
    if (isOpen && $whatsappStatus !== 'connected') {
      countdown = 45;
      interval = setInterval(() => {
        if (countdown > 1) {
          countdown--;
        } else {
          countdown = 45; // Auto refresh QR
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  });

  async function simulateConnect() {
    isConnecting = true;
    whatsappStatus.set('connecting');
    setTimeout(() => {
      whatsappStatus.set('connected');
      isConnecting = false;
    }, 2000);
  }

  async function handleDisconnect() {
    await whatsappApi.triggerDisconnect();
    whatsappStatus.set('disconnected');
    whatsappQr.set(null);
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
    onclick={onClose}
    role="presentation"
  >
    <!-- Modal Card -->
    <div
      class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Icon name="QrCode" size={20} />
          </div>
          <div>
            <h3 class="font-bold text-base text-white">WhatsApp Self-Bot Connector</h3>
            <p class="text-xs text-slate-400">Baileys Multi-Device Protocol • Anti-Ban Protected</p>
          </div>
        </div>

        <button
          onclick={onClose}
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5 text-center">
        {#if $whatsappStatus === 'connected'}
          <!-- Connected State -->
          <div class="py-8 space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Icon name="CheckCircle2" size={32} />
            </div>

            <div>
              <h4 class="text-lg font-bold text-white">WhatsApp Successfully Connected!</h4>
              <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Your WhatsApp self-assistant is active. Simply open WhatsApp and message yourself ("Message Yourself") to run any of the 50+ AI tools or generate images.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-sm mx-auto text-left space-y-2">
              <div class="flex items-center gap-2 text-emerald-400 font-semibold">
                <Icon name="Shield" size={14} />
                <span>Anti-Ban Guardrails Active</span>
              </div>
              <p class="text-[11px] text-slate-400">
                The bot only processes messages sent to yourself. Auto-replies to external contacts and groups are strictly blocked.
              </p>
            </div>

            <div class="pt-2 flex items-center justify-center gap-3">
              <button
                onclick={handleDisconnect}
                class="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
              >
                Disconnect Session
              </button>
              <button
                onclick={onClose}
                class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          </div>
        {:else}
          <!-- QR Scanner State -->
          <div class="space-y-4">
            <!-- QR Code Display Box -->
            <div class="relative w-60 h-60 mx-auto rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center border-4 border-emerald-500/20">
              {#if isConnecting}
                <div class="flex flex-col items-center gap-2 text-slate-800">
                  <Icon name="Loader2" size={32} class="animate-spin text-emerald-600" />
                  <span class="text-xs font-bold">Linking session...</span>
                </div>
              {:else if $whatsappQr}
                <img src={$whatsappQr} alt="WhatsApp QR Code" class="w-full h-full object-contain p-2" />
              {:else}
                <!-- Generative SVG-styled high-res QR code with SuperAI Logo in center -->
                <div class="relative w-full h-full flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-2">
                  <svg viewBox="0 0 100 100" class="w-full h-full text-slate-900 fill-current">
                    <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                    <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                    <rect x="13" y="13" width="10" height="10" rx="1" fill="#059669" />

                    <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                    <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                    <rect x="77" y="13" width="10" height="10" rx="1" fill="#059669" />

                    <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                    <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                    <rect x="13" y="77" width="10" height="10" rx="1" fill="#059669" />

                    <rect x="36" y="8" width="5" height="5" />
                    <rect x="45" y="12" width="5" height="5" />
                    <rect x="55" y="6" width="5" height="5" />
                    <rect x="38" y="24" width="5" height="5" />
                    <rect x="48" y="22" width="5" height="5" />

                    <rect x="8" y="38" width="5" height="5" />
                    <rect x="16" y="44" width="5" height="5" />
                    <rect x="25" y="40" width="5" height="5" />
                    <rect x="8" y="52" width="5" height="5" />
                    <rect x="20" y="55" width="5" height="5" />

                    <rect x="72" y="38" width="5" height="5" />
                    <rect x="85" y="42" width="5" height="5" />
                    <rect x="76" y="52" width="5" height="5" />
                    <rect x="88" y="56" width="5" height="5" />

                    <rect x="38" y="72" width="5" height="5" />
                    <rect x="48" y="75" width="5" height="5" />
                    <rect x="58" y="70" width="5" height="5" />
                    <rect x="42" y="86" width="5" height="5" />
                    <rect x="55" y="88" width="5" height="5" />

                    <rect x="40" y="40" width="20" height="20" rx="4" fill="#059669" />
                    <circle cx="50" cy="50" r="6" fill="#ffffff" />
                  </svg>
                </div>
              {/if}
            </div>

            <!-- Countdown Timer -->
            <div class="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Icon name="RefreshCw" size={13} class="text-emerald-400" />
              <span>QR code refreshes in: <strong class="text-emerald-400 font-mono">{countdown}s</strong></span>
            </div>

            <!-- Instructions -->
            <div class="text-left bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <p class="font-bold text-white text-xs">How to scan and link:</p>
              <p>1. Open WhatsApp on your mobile phone.</p>
              <p>2. Tap the three dots menu (Android) or Settings (iPhone) and select <strong>Linked Devices</strong>.</p>
              <p>3. Tap <strong>Link a Device</strong> and scan the QR code above.</p>
            </div>

            <!-- Simulation Action button for testing -->
            <button
              onclick={simulateConnect}
              disabled={isConnecting}
              class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {#if isConnecting}
                <Icon name="Loader2" size={16} class="animate-spin" />
                <span>Validating connection...</span>
              {:else}
                <Icon name="Check" size={16} />
                <span>Click here once scanned</span>
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
