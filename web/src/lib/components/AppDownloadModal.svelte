<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { onMount } from 'svelte';

  let { isOpen = $bindable(false), onClose } = $props<{
    isOpen?: boolean;
    onClose?: () => void;
  }>();

  let isMobile = $state(false);
  let isDownloading = $state(false);

  onMount(() => {
    isMobile = window.innerWidth < 768;
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function closeModal() {
    isOpen = false;
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      closeModal();
    }
  }

  function handleDownloadClick() {
    isDownloading = true;
    setTimeout(() => {
      isDownloading = false;
    }, 3000);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
    aria-labelledby="app-download-title"
  >
    <!-- Frosted Backdrop Overlay -->
    <div
      class="fixed inset-0 bg-[#0B1F42]/60 backdrop-blur-md transition-opacity"
      onclick={closeModal}
      onkeydown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') closeModal();
      }}
      role="button"
      tabindex="0"
      aria-label="Close modal backdrop"
    ></div>

    <!-- Modal Card Container -->
    <div
      class="relative w-full max-w-lg bg-white rounded-3xl border border-[#CFE2FA] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-[#E3ECF7] flex items-center justify-between bg-gradient-to-r from-[#F3F8FF] to-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white p-1 border border-[#CFE2FA] shadow-xs flex items-center justify-center">
            <img src="/ezbo-ceo.png" alt="Ezbo CEO" class="w-8 h-8 object-contain" />
          </div>
          <div>
            <h2 id="app-download-title" class="text-base font-extrabold text-[#102A56] tracking-tight">
              Get Ezbo on Mobile
            </h2>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-xs text-[#5E7694] font-medium">120Hz Native Android App (v1.0)</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onclick={closeModal}
          class="w-9 h-9 rounded-xl text-[#5E7694] hover:text-[#102A56] hover:bg-[#F3F8FF] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      <!-- Body Content -->
      <div class="p-6 space-y-6">
        <!-- Feature Highlights Badges -->
        <div class="flex items-center justify-center gap-2 flex-wrap text-[11px] font-bold">
          <span class="px-2.5 py-1 rounded-full bg-[#F3F8FF] text-[#1677FF] border border-[#CFE2FA]">
            ⚡ 120Hz Fluid Wave UI
          </span>
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            🤖 Enterprise AI Studio
          </span>
          <span class="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            📦 Compact 19.1 MB
          </span>
        </div>

        <!-- Desktop Mode: QR Code Scanning -->
        {#if !isMobile}
          <div class="text-center space-y-4">
            <div class="relative inline-block p-4 rounded-2xl bg-[#F8FAFC] border border-[#CFE2FA] shadow-xs group">
              <img
                src="/downloads/app-qr.svg"
                alt="Scan QR code to download Ezbo Android App"
                class="w-48 h-48 mx-auto object-contain transition-transform group-hover:scale-102"
              />
              <div class="absolute -top-2.5 -right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-xs">
                <span>SCAN ME</span>
              </div>
            </div>

            <div class="max-w-xs mx-auto space-y-1">
              <p class="text-xs font-bold text-[#102A56]">
                Scan with your phone camera to download instantly
              </p>
              <p class="text-[11px] text-[#5E7694]">
                Works with any Android 9+ smartphone camera or Google Lens.
              </p>
            </div>

            <div class="pt-2">
              <a
                href="/downloads/EzboAgents.apk"
                download="EzboAgents.apk"
                onclick={handleDownloadClick}
                class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl blue-btn text-white text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {#if isDownloading}
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Starting APK Download...</span>
                {:else}
                  <Icon name="Download" size={16} />
                  <span>Download Direct APK for PC / Sideload (19.1 MB)</span>
                {/if}
              </a>
            </div>
          </div>
        {:else}
          <!-- Mobile Mode: Big 1-Click Download Button -->
          <div class="text-center space-y-5">
            <div class="w-16 h-16 rounded-3xl bg-[#E4F0FF] text-[#1677FF] border border-[#CFE2FA] mx-auto flex items-center justify-center shadow-xs">
              <Icon name="Smartphone" size={32} />
            </div>

            <div class="space-y-1">
              <h3 class="text-base font-extrabold text-[#102A56]">
                Instant Android App Download
              </h3>
              <p class="text-xs text-[#5E7694]">
                Download directly to your Android device for 120Hz smooth chat.
              </p>
            </div>

            <a
              href="/downloads/EzboAgents.apk"
              download="EzboAgents.apk"
              onclick={handleDownloadClick}
              class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl blue-btn text-white text-sm font-extrabold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {#if isDownloading}
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Downloading APK...</span>
              {:else}
                <Icon name="Download" size={18} />
                <span>Download APK Now (19.1 MB)</span>
              {/if}
            </a>

            <!-- 3-Step Quick Install Helper -->
            <div class="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E3ECF7] text-left space-y-2.5 text-xs text-[#102A56]">
              <p class="font-extrabold text-[#1677FF] flex items-center gap-1.5 text-xs">
                <Icon name="CheckCircle" size={14} />
                <span>Easy 3-Step Installation:</span>
              </p>
              <ol class="space-y-1.5 text-[11px] text-[#5E7694] list-decimal list-inside pl-1">
                <li>Tap <strong class="text-[#102A56]">"Download anyway"</strong> when browser alerts.</li>
                <li>Tap <strong class="text-[#102A56]">EzboAgents.apk</strong> from your notification tray.</li>
                <li>Select <strong class="text-[#102A56]">"Install"</strong> and begin commanding Ezbo!</li>
              </ol>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer Info -->
      <div class="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E3ECF7] flex items-center justify-between text-[11px] text-[#5E7694]">
        <div class="flex items-center gap-1.5">
          <Icon name="Shield" size={13} class="text-emerald-600" />
          <span>Verified Safe • Android 9.0 (Pie) & above</span>
        </div>
        <a href="/download" class="font-bold text-[#1677FF] hover:underline">
          Install Guide →
        </a>
      </div>
    </div>
  </div>
{/if}
