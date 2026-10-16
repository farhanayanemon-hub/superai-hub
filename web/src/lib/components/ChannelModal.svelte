<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { whatsappApi } from '$lib/services/whatsappApi';
  import {
    whatsappStatus,
    whatsappQr,
    currentUser,
    subscription
  } from '$lib/stores/userStore';
  import { onMount, onDestroy } from 'svelte';

  let { isOpen = $bindable(false), onClose } = $props<{
    isOpen?: boolean;
    onClose?: () => void;
  }>();

  // Active channel tab: 'whatsapp' | 'telegram'
  let activeChannel = $state<'whatsapp' | 'telegram'>('whatsapp');

  // WhatsApp sub-mode: 'qr' | 'pairing_code'
  let waMode = $state<'qr' | 'pairing_code'>('qr');

  // WhatsApp Pairing Code state
  let phoneNumber = $state('');
  let isRequestingPairing = $state(false);
  let pairingCode = $state<string | null>(null);
  let pairingError = $state<string | null>(null);
  let copiedPairing = $state(false);
  let isDisconnectingWa = $state(false);

  // Telegram state
  let isSyncingTelegram = $state(false);
  let tgSyncCode = $state<string | null>(null);
  let tgDeepLink = $state<string | null>(null);
  let tgBotUsername = $state('EzboAgentsBot');
  let tgError = $state<string | null>(null);
  let copiedTgCode = $state(false);
  let isTgLinked = $state(false);
  let linkedTgUsername = $state<string | null>(null);
  let isDisconnectingTg = $state(false);

  function closeModal() {
    isOpen = false;
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      closeModal();
    }
  }

  // Effect to manage WhatsApp SSE stream when modal is opened
  $effect(() => {
    if (isOpen && activeChannel === 'whatsapp') {
      whatsappApi.initStream();
      whatsappApi.triggerSessionStart();
      return () => {
        whatsappApi.closeStream();
      };
    }
  });

  // Check Telegram status when Telegram tab is activated
  $effect(() => {
    if (isOpen && activeChannel === 'telegram') {
      checkTelegramStatus();
    }
  });

  async function checkTelegramStatus() {
    const userId = $currentUser?.id || 'guest';
    try {
      const res = await fetch(`/api/telegram/sync?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          isTgLinked = !!data.isLinked;
          linkedTgUsername = data.telegramUsername || null;
          if (data.botUsername) tgBotUsername = data.botUsername;
        }
      }
    } catch {
      // ignore
    }
  }

  async function handleRequestPairingCode() {
    pairingError = null;
    const clean = phoneNumber.replace(/[^\d+]/g, '');
    if (!clean || clean.replace(/\D/g, '').length < 8) {
      pairingError = 'Please enter a valid phone number with country code (e.g. +880 1700 000000 or +1 415 555 2671).';
      return;
    }

    isRequestingPairing = true;
    try {
      const res = await whatsappApi.requestPairingCode(clean);
      if (res.success && res.pairingCode) {
        pairingCode = res.pairingCode;
      } else {
        pairingError = res.error || 'Failed to request pairing code from WhatsApp engine. Ensure server is online.';
      }
    } catch (err: any) {
      pairingError = err.message || 'Network error requesting pairing code.';
    } finally {
      isRequestingPairing = false;
    }
  }

  function copyPairingCode() {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode.replace(/-/g, ''));
    copiedPairing = true;
    setTimeout(() => {
      copiedPairing = false;
    }, 2000);
  }

  async function handleDisconnectWhatsApp() {
    isDisconnectingWa = true;
    try {
      await whatsappApi.triggerDisconnect();
      pairingCode = null;
      pairingError = null;
      setTimeout(() => {
        whatsappApi.triggerSessionStart();
      }, 600);
    } finally {
      isDisconnectingWa = false;
    }
  }

  async function handleGenerateTelegramSync() {
    isSyncingTelegram = true;
    tgError = null;
    try {
      const userId = $currentUser?.id || `user_${Date.now()}`;
      const res = await fetch('/api/telegram/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName: $currentUser?.name || 'Ezbo Member',
          userEmail: $currentUser?.email || '',
          planTier: $subscription?.tier || 'byok',
          isSubscribed: $subscription?.status === 'active'
        })
      });
      const data = await res.json();
      if (data.success) {
        tgSyncCode = data.syncCode;
        tgDeepLink = data.deepLink;
        if (data.botUsername) tgBotUsername = data.botUsername;
      } else {
        tgError = data.error || 'Failed to generate Telegram sync code.';
      }
    } catch (err: any) {
      tgError = err.message || 'Network error generating Telegram link.';
    } finally {
      isSyncingTelegram = false;
    }
  }

  function copyTgSyncCode() {
    if (!tgSyncCode) return;
    navigator.clipboard.writeText(tgSyncCode);
    copiedTgCode = true;
    setTimeout(() => {
      copiedTgCode = false;
    }, 2000);
  }

  async function handleDisconnectTelegram() {
    isDisconnectingTg = true;
    try {
      const userId = $currentUser?.id || 'guest';
      await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      isTgLinked = false;
      linkedTgUsername = null;
      tgSyncCode = null;
      tgDeepLink = null;
    } finally {
      isDisconnectingTg = false;
    }
  }

  // Format Crockford pairing code into split blocks: e.g. "ABCD-1234" -> ["ABCD", "1234"]
  const formattedCodeParts = $derived.by(() => {
    if (!pairingCode) return [];
    const clean = pairingCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length === 8) {
      return [clean.slice(0, 4), clean.slice(4, 8)];
    }
    return [clean];
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Frosted Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#102A56]/40 backdrop-blur-md overflow-y-auto"
    onclick={(e) => {
      if (e.target === e.currentTarget) closeModal();
    }}
    onkeydown={(e) => {
      if (e.key === 'Escape') closeModal();
    }}
    role="dialog"
    aria-modal="true"
    aria-label="Connect Multi-Channel Gateway"
    tabindex="-1"
  >
    <!-- Modal Container -->
    <div
      class="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-[#CFE2FA] rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto flex flex-col transition-all duration-200"
    >
      <!-- Close Button -->
      <button
        type="button"
        onclick={closeModal}
        class="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F3F8FF] hover:bg-rose-50 text-[#5E7694] hover:text-rose-600 border border-[#CFE2FA] flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Close Channel Modal"
        title="Close (Esc)"
      >
        <Icon name="X" size={18} />
      </button>

      <!-- Channels Header -->
      <div class="pr-10 mb-6">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-[#1677FF]">
            Multi-Channel Bridge
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-[#102A56] tracking-tight">
          Connect Multi-Channel Gateway
        </h2>
        <p class="text-xs sm:text-sm text-[#4B6382] mt-1 leading-relaxed">
          Command your Master AI CEO and 75 Helpers remotely via WhatsApp and Telegram with zero latency.
        </p>
      </div>

      <!-- Channel Tabs Switcher with Official Brand Logos -->
      <div class="grid grid-cols-2 gap-3 p-1.5 bg-[#F3F8FF] rounded-2xl border border-[#CFE2FA] mb-6">
        <!-- WhatsApp Tab -->
        <button
          type="button"
          onclick={() => (activeChannel = 'whatsapp')}
          class="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer {activeChannel ===
          'whatsapp'
            ? 'bg-white text-[#102A56] shadow-sm border border-[#CFE2FA]'
            : 'text-[#5E7694] hover:text-[#102A56]'}"
        >
          <!-- Official WhatsApp SVG Logo (Green #25D366 badge with white phone handset) -->
          <div class="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-xs">
            <svg class="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
              <path
                d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.32"
              />
            </svg>
          </div>
          <span>WhatsApp Gateway</span>
          {#if $whatsappStatus === 'connected'}
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          {/if}
        </button>

        <!-- Telegram Tab -->
        <button
          type="button"
          onclick={() => (activeChannel = 'telegram')}
          class="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer {activeChannel ===
          'telegram'
            ? 'bg-white text-[#102A56] shadow-sm border border-[#CFE2FA]'
            : 'text-[#5E7694] hover:text-[#102A56]'}"
        >
          <!-- Official Telegram SVG Logo (Blue #229ED9 badge with white paper airplane) -->
          <div class="w-7 h-7 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 shadow-xs">
            <svg class="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
              />
            </svg>
          </div>
          <span>Telegram Bot</span>
          {#if isTgLinked}
            <span class="w-2 h-2 rounded-full bg-[#229ED9]"></span>
          {/if}
        </button>
      </div>

      <!-- ====================================================================== -->
      <!-- TAB 1: WHATSAPP -->
      <!-- ====================================================================== -->
      {#if activeChannel === 'whatsapp'}
        <div class="space-y-5">
          <!-- WhatsApp Status Banner -->
          <div
            class="flex items-center justify-between p-3.5 rounded-2xl border {$whatsappStatus ===
            'connected'
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-[#F3F8FF] border-[#CFE2FA]'}"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-3 h-3 rounded-full {$whatsappStatus === 'connected'
                  ? 'bg-emerald-500 ring-4 ring-emerald-100'
                  : 'bg-amber-400 ring-4 ring-amber-100 animate-pulse'}"
              ></span>
              <div>
                <p class="text-xs font-bold text-[#102A56]">
                  {$whatsappStatus === 'connected'
                    ? 'WhatsApp Gateway Connected'
                    : 'Awaiting WhatsApp Pairing'}
                </p>
                <p class="text-[11px] text-[#5E7694]">
                  {$whatsappStatus === 'connected'
                    ? 'Ready to receive CEO commands from any linked phone.'
                    : 'Choose QR scan or 8-digit phone pairing below.'}
                </p>
              </div>
            </div>

            {#if $whatsappStatus === 'connected'}
              <button
                type="button"
                onclick={handleDisconnectWhatsApp}
                disabled={isDisconnectingWa}
                class="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isDisconnectingWa ? 'Disconnecting...' : 'Disconnect'}
              </button>
            {/if}
          </div>

          {#if $whatsappStatus === 'connected'}
            <!-- Connected State Display -->
            <div
              class="p-6 rounded-2xl bg-white border border-[#CFE2FA] text-center space-y-3 shadow-xs"
            >
              <div
                class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs"
              >
                <Icon name="CheckCircle2" size={32} />
              </div>
              <h3 class="text-base font-extrabold text-[#102A56]">
                WhatsApp is Live & Synced
              </h3>
              <p class="text-xs text-[#5E7694] max-w-md mx-auto leading-relaxed">
                Send messages from your mobile device to chat with the Master AI CEO or command any specialist using commands like <code class="px-1.5 py-0.5 rounded bg-[#F3F8FF] text-[#1677FF] font-mono font-bold">#01</code> through <code class="px-1.5 py-0.5 rounded bg-[#F3F8FF] text-[#1677FF] font-mono font-bold">#75</code>.
              </p>
              <div class="pt-2">
                <button
                  type="button"
                  onclick={handleDisconnectWhatsApp}
                  disabled={isDisconnectingWa}
                  class="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                >
                  {isDisconnectingWa ? 'Resetting Handshake...' : 'Disconnect & Reconnect Fresh'}
                </button>
              </div>
            </div>
          {:else}
            <!-- Sub-Mode Switcher: QR Code vs Phone Pairing Code -->
            <div class="flex items-center justify-center gap-2 p-1 bg-[#F3F8FF] rounded-xl border border-[#E3ECF7] max-w-sm mx-auto">
              <button
                type="button"
                onclick={() => (waMode = 'qr')}
                class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer {waMode ===
                'qr'
                  ? 'bg-white text-[#1677FF] shadow-xs'
                  : 'text-[#5E7694] hover:text-[#102A56]'}"
              >
                QR Code Scan
              </button>
              <button
                type="button"
                onclick={() => (waMode = 'pairing_code')}
                class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer {waMode ===
                'pairing_code'
                  ? 'bg-white text-[#1677FF] shadow-xs'
                  : 'text-[#5E7694] hover:text-[#102A56]'}"
              >
                8-Digit Phone Pairing
              </button>
            </div>

            <!-- Mode A: QR Code Scanner -->
            {#if waMode === 'qr'}
              <div class="p-6 rounded-2xl bg-white border border-[#CFE2FA] text-center space-y-4 shadow-xs">
                {#if $whatsappQr}
                  <div class="relative inline-block p-3 rounded-2xl bg-[#F8FAFC] border border-[#E3ECF7] shadow-sm">
                    <img
                      src={$whatsappQr}
                      alt="WhatsApp Web QR Code"
                      class="w-56 h-56 sm:w-64 sm:h-64 rounded-xl mx-auto object-contain"
                    />
                    <div class="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 border border-emerald-200 text-emerald-700 text-[10px] font-bold shadow-xs">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live QR</span>
                    </div>
                  </div>

                  <div class="max-w-md mx-auto text-left bg-[#F3F8FF] rounded-xl p-3.5 border border-[#CFE2FA] space-y-1.5 text-xs text-[#102A56]">
                    <div class="font-bold flex items-center gap-2 text-[#1677FF]">
                      <Icon name="Smartphone" size={14} />
                      <span>How to link WhatsApp:</span>
                    </div>
                    <ol class="list-decimal list-inside space-y-1 text-[#4B6382] pl-1">
                      <li>Open <strong>WhatsApp</strong> on your mobile phone.</li>
                      <li>Go to <strong>Settings</strong> (iOS) or <strong>Menu ⋮</strong> (Android) &gt; <strong>Linked Devices</strong>.</li>
                      <li>Tap <strong>Link a Device</strong> and point your camera at this QR code.</li>
                    </ol>
                  </div>
                {:else}
                  <!-- Loading / Handshake state -->
                  <div class="h-64 flex flex-col items-center justify-center gap-3">
                    <div class="w-12 h-12 rounded-full border-3 border-[#1677FF] border-t-transparent animate-spin"></div>
                    <p class="text-sm font-bold text-[#102A56]">
                      Generating secure WhatsApp QR handshake...
                    </p>
                    <p class="text-xs text-[#5E7694] max-w-xs">
                      Connecting to the Baileys multi-device engine. This takes 2–5 seconds.
                    </p>
                    <button
                      type="button"
                      onclick={() => whatsappApi.triggerSessionStart()}
                      class="mt-2 px-3.5 py-1.5 rounded-xl bg-[#F3F8FF] hover:bg-[#E4F0FF] border border-[#CFE2FA] text-[#1677FF] text-xs font-bold transition-all cursor-pointer"
                    >
                      Refresh Handshake
                    </button>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- Mode B: 8-Digit Phone Pairing Code -->
            {#if waMode === 'pairing_code'}
              <div class="p-6 rounded-2xl bg-white border border-[#CFE2FA] space-y-5 shadow-xs">
                <div>
                  <h4 class="text-sm font-extrabold text-[#102A56]">
                    Link via 8-Digit Crockford Pairing Code
                  </h4>
                  <p class="text-xs text-[#5E7694] mt-0.5">
                    Connect directly using your mobile phone number without needing to scan a QR code.
                  </p>
                </div>

                <!-- Phone Input Field -->
                <div class="space-y-1.5">
                  <label for="wa-phone-input" class="block text-xs font-bold text-[#102A56]">
                    Phone Number (with Country Code)
                  </label>
                  <div class="flex gap-2">
                    <div class="relative flex-1">
                      <input
                        id="wa-phone-input"
                        type="tel"
                        bind:value={phoneNumber}
                        placeholder="+880 1700 000000 or +1 415 555 2671"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-[#CFE2FA] text-sm text-[#102A56] placeholder-[#889DB5] focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 bg-[#F8FAFC]"
                      />
                    </div>
                    <button
                      type="button"
                      onclick={handleRequestPairingCode}
                      disabled={isRequestingPairing || !phoneNumber.trim()}
                      class="px-4 py-2.5 rounded-xl blue-btn text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                    >
                      {#if isRequestingPairing}
                        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Requesting...</span>
                      {:else}
                        <Icon name="Zap" size={14} />
                        <span>Request Code</span>
                      {/if}
                    </button>
                  </div>
                  <p class="text-[11px] text-[#5E7694]">
                    Include international code (e.g. <span class="font-mono text-[#1677FF]">+880</span> for Bangladesh, <span class="font-mono text-[#1677FF]">+1</span> for US).
                  </p>
                </div>

                {#if pairingError}
                  <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} class="shrink-0" />
                    <span>{pairingError}</span>
                  </div>
                {/if}

                {#if pairingCode}
                  <!-- Formatted 8-digit Crockford Code Blocks -->
                  <div class="p-5 rounded-2xl bg-linear-to-b from-[#F3F8FF] to-white border border-[#CFE2FA] text-center space-y-3">
                    <p class="text-xs font-bold text-[#5E7694] uppercase tracking-wider">
                      Your 8-Digit Pairing Code
                    </p>

                    <div class="flex items-center justify-center gap-3">
                      {#each formattedCodeParts as part, idx}
                        <div class="flex items-center gap-1">
                          {#each part.split('') as char}
                            <span
                              class="w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-white border-2 border-[#1677FF]/40 text-[#102A56] font-mono font-black text-lg sm:text-2xl flex items-center justify-center shadow-xs select-all"
                            >
                              {char}
                            </span>
                          {/each}
                        </div>
                        {#if idx < formattedCodeParts.length - 1}
                          <span class="text-2xl font-bold text-[#5E7694]">-</span>
                        {/if}
                      {/each}
                    </div>

                    <div class="pt-1 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onclick={copyPairingCode}
                        class="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#125BCC] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        {#if copiedPairing}
                          <Icon name="Check" size={14} />
                          <span>Copied to Clipboard!</span>
                        {:else}
                          <Icon name="Copy" size={14} />
                          <span>Copy 8-Digit Code</span>
                        {/if}
                      </button>
                    </div>

                    <!-- Instructions -->
                    <div class="text-left bg-white rounded-xl p-3 border border-[#E3ECF7] text-xs text-[#4B6382] space-y-1">
                      <p class="font-bold text-[#102A56]">Next steps on your phone:</p>
                      <ol class="list-decimal list-inside space-y-0.5 pl-1">
                        <li>Open WhatsApp &gt; <strong>Linked Devices</strong>.</li>
                        <li>Tap <strong>Link with phone number instead</strong> at the bottom.</li>
                        <li>Type in the 8-character code shown above.</li>
                      </ol>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- ====================================================================== -->
      <!-- TAB 2: TELEGRAM -->
      <!-- ====================================================================== -->
      {#if activeChannel === 'telegram'}
        <div class="space-y-5">
          <!-- Telegram Status Banner -->
          <div
            class="flex items-center justify-between p-3.5 rounded-2xl border {isTgLinked
              ? 'bg-[#EBF7FD] border-[#97D7F7]'
              : 'bg-[#F3F8FF] border-[#CFE2FA]'}"
          >
            <div class="flex items-center gap-3">
              <span
                class="w-3 h-3 rounded-full {isTgLinked
                  ? 'bg-[#229ED9] ring-4 ring-[#229ED9]/20'
                  : 'bg-amber-400 ring-4 ring-amber-100'}"
              ></span>
              <div>
                <p class="text-xs font-bold text-[#102A56]">
                  {isTgLinked
                    ? `Linked to Telegram (@${linkedTgUsername || 'User'})`
                    : 'Telegram Bot Gateway'}
                </p>
                <p class="text-[11px] text-[#5E7694]">
                  {isTgLinked
                    ? 'Sync is active. Commands from Telegram execute on your account.'
                    : 'Sync your account to chat with the AI CEO from Telegram.'}
                </p>
              </div>
            </div>

            {#if isTgLinked}
              <button
                type="button"
                onclick={handleDisconnectTelegram}
                disabled={isDisconnectingTg}
                class="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isDisconnectingTg ? 'Unlinking...' : 'Disconnect'}
              </button>
            {/if}
          </div>

          <!-- Telegram 1-Click Sync Card -->
          <div class="p-6 rounded-2xl bg-white border border-[#CFE2FA] space-y-4 shadow-xs">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 class="text-sm font-extrabold text-[#102A56]">
                  1-Click Instant Telegram Sync
                </h4>
                <p class="text-xs text-[#5E7694] mt-0.5">
                  Link with our official bot <strong class="text-[#229ED9]">@{tgBotUsername}</strong>.
                </p>
              </div>

              {#if !tgSyncCode}
                <button
                  type="button"
                  onclick={handleGenerateTelegramSync}
                  disabled={isSyncingTelegram}
                  class="px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1B8AC2] text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {#if isSyncingTelegram}
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Generating Link...</span>
                  {:else}
                    <Icon name="Zap" size={14} />
                    <span>Connect Telegram Bot</span>
                  {/if}
                </button>
              {/if}
            </div>

            {#if tgError}
              <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <Icon name="AlertCircle" size={16} class="shrink-0" />
                <span>{tgError}</span>
              </div>
            {/if}

            {#if tgSyncCode && tgDeepLink}
              <!-- Sync Code & Direct Deep Link Display -->
              <div class="p-5 rounded-2xl bg-linear-to-b from-[#F3F8FF] to-white border border-[#CFE2FA] space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span class="text-[11px] font-bold text-[#5E7694] uppercase tracking-wider block">
                      Sync Token (Valid 15 Minutes)
                    </span>
                    <span class="font-mono font-black text-2xl sm:text-3xl text-[#102A56] tracking-widest select-all">
                      {tgSyncCode}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      onclick={copyTgSyncCode}
                      class="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F8FF] border border-[#CFE2FA] text-[#102A56] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      {#if copiedTgCode}
                        <Icon name="Check" size={14} class="text-emerald-600" />
                        <span class="text-emerald-700">Copied!</span>
                      {:else}
                        <Icon name="Copy" size={14} />
                        <span>Copy Code</span>
                      {/if}
                    </button>

                    <a
                      href={tgDeepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-4 py-2 rounded-xl bg-[#229ED9] hover:bg-[#1B8AC2] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Open in Telegram</span>
                      <Icon name="ExternalLink" size={14} />
                    </a>
                  </div>
                </div>

                <p class="text-xs text-[#5E7694] pt-1 leading-relaxed">
                  Click <strong>Open in Telegram</strong> and press <strong>Start</strong>, or message <code>/sync {tgSyncCode}</code> to <strong class="text-[#229ED9]">@{tgBotUsername}</strong>.
                </p>
              </div>
            {/if}

            <!-- Telegram Slash Commands Cheatsheet -->
            <div class="pt-2">
              <h5 class="text-xs font-extrabold text-[#102A56] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Icon name="Terminal" size={14} class="text-[#229ED9]" />
                <span>Telegram Bot Slash Commands Cheatsheet</span>
              </h5>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div class="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3ECF7] flex items-start gap-2.5">
                  <code class="px-2 py-0.5 rounded-md bg-[#229ED9]/10 text-[#229ED9] font-mono font-bold text-xs">
                    /status
                  </code>
                  <div>
                    <p class="font-bold text-[#102A56]">Account & Bot Status</p>
                    <p class="text-[11px] text-[#5E7694]">Shows your current plan tier, active bot, and token balance.</p>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3ECF7] flex items-start gap-2.5">
                  <code class="px-2 py-0.5 rounded-md bg-[#229ED9]/10 text-[#229ED9] font-mono font-bold text-xs">
                    /agents
                  </code>
                  <div>
                    <p class="font-bold text-[#102A56]">List & Switch Agents</p>
                    <p class="text-[11px] text-[#5E7694]">Explore and switch between all 75 AI specialist personas.</p>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3ECF7] flex items-start gap-2.5">
                  <code class="px-2 py-0.5 rounded-md bg-[#229ED9]/10 text-[#229ED9] font-mono font-bold text-xs">
                    /image [prompt]
                  </code>
                  <div>
                    <p class="font-bold text-[#102A56]">AI Image Generation</p>
                    <p class="text-[11px] text-[#5E7694]">Instantly generates 8K commercial product images & visuals.</p>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-[#F8FAFC] border border-[#E3ECF7] flex items-start gap-2.5">
                  <code class="px-2 py-0.5 rounded-md bg-[#229ED9]/10 text-[#229ED9] font-mono font-bold text-xs">
                    /help
                  </code>
                  <div>
                    <p class="font-bold text-[#102A56]">Help & Documentation</p>
                    <p class="text-[11px] text-[#5E7694]">Comprehensive command guide and delegation tips.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Modal Footer -->
      <div class="mt-6 pt-4 border-t border-[#E3ECF7] flex items-center justify-between text-xs text-[#5E7694]">
        <span class="flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={14} class="text-[#1677FF]" />
          <span>End-to-end encrypted session bridge</span>
        </span>
        <button
          type="button"
          onclick={closeModal}
          class="font-bold text-[#1677FF] hover:underline cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  </div>
{/if}
