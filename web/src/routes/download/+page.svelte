<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { onMount } from 'svelte';

  let hasTriggeredDownload = $state(false);

  onMount(() => {
    // Auto-trigger APK download after a short 800ms delay so the page renders smoothly
    const timer = setTimeout(() => {
      triggerDownload();
    }, 800);

    return () => clearTimeout(timer);
  });

  function triggerDownload() {
    hasTriggeredDownload = true;
    const a = document.createElement('a');
    a.href = '/downloads/EzboAgents.apk';
    a.download = 'EzboAgents.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
</script>

<svelte:head>
  <title>Download EzboAgents Mobile App — 1 Master AI CEO + 75 Specialists</title>
  <meta name="description" content="Download EzboAgents native Android app (APK). 120Hz smooth fluid wave navigation, offline chat history, and 75 AI specialists in your pocket." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-[#F3F8FF] via-white to-[#F3F8FF] flex flex-col justify-between p-4 sm:p-8 text-[#102A56]">
  <!-- Top Minimal Bar -->
  <header class="max-w-md mx-auto w-full flex items-center justify-between py-2">
    <a href="/" class="flex items-center gap-2 group">
      <div class="w-8 h-8 rounded-xl bg-white border border-[#CFE2FA] p-1 shadow-2xs group-hover:scale-105 transition-transform">
        <img src="/ezbo-ceo.png" alt="Ezbo" class="w-full h-full object-contain" />
      </div>
      <span class="font-extrabold text-sm text-[#102A56] tracking-tight">Ezbo<span class="text-[#1677FF]">Agents</span></span>
    </a>

    <a href="/" class="text-xs font-bold text-[#5E7694] hover:text-[#1677FF] transition-colors">
      Web Console →
    </a>
  </header>

  <!-- Main Card -->
  <main class="max-w-md mx-auto w-full my-6 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#CFE2FA] shadow-xl p-6 sm:p-8 space-y-6 text-center">
    <!-- Mascot Avatar -->
    <div class="relative w-20 h-20 mx-auto">
      <div class="w-full h-full rounded-3xl bg-gradient-to-tr from-[#1677FF] to-[#38CFFF] p-1 shadow-lg shadow-blue-500/20">
        <div class="w-full h-full rounded-2xl bg-white flex items-center justify-center p-2">
          <img src="/ezbo-ceo.png" alt="Ezbo CEO" class="w-full h-full object-contain" />
        </div>
      </div>
      <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-3 ring-white flex items-center justify-center text-white text-[9px] font-black">
        ✓
      </span>
    </div>

    <div class="space-y-1.5">
      <h1 class="text-xl sm:text-2xl font-black text-[#102A56] tracking-tight">
        EzboAgents for Android
      </h1>
      <p class="text-xs text-[#5E7694] max-w-xs mx-auto leading-relaxed">
        1 Master AI CEO + 75 Specialized AI Specialists in your pocket. 120Hz native wave interface.
      </p>
    </div>

    <!-- Specs Pills -->
    <div class="flex items-center justify-center gap-2 flex-wrap text-[11px] font-bold">
      <span class="px-2.5 py-1 rounded-full bg-[#F3F8FF] text-[#1677FF] border border-[#CFE2FA]">
        v1.0.0 Release
      </span>
      <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        19.1 MB APK
      </span>
      <span class="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        Android 9.0+
      </span>
    </div>

    <!-- Primary Action Button -->
    <div class="space-y-2 pt-2">
      <button
        type="button"
        onclick={triggerDownload}
        class="w-full py-4 px-6 rounded-2xl blue-btn text-white text-sm font-extrabold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
      >
        <Icon name="Download" size={18} />
        <span>{hasTriggeredDownload ? 'Download Again (19.1 MB)' : 'Download APK (19.1 MB)'}</span>
      </button>

      {#if hasTriggeredDownload}
        <p class="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
          <Icon name="CheckCircle" size={13} />
          <span>Download started automatically!</span>
        </p>
      {/if}
    </div>

    <!-- 3-Step Installation Guide -->
    <div class="pt-2 text-left space-y-3">
      <p class="text-xs font-black uppercase tracking-wider text-[#889DB5] flex items-center gap-1.5">
        <Icon name="Smartphone" size={14} class="text-[#1677FF]" />
        <span>How to Install on Android</span>
      </p>

      <div class="space-y-2.5">
        <div class="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E3ECF7] flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-[#E4F0FF] text-[#1677FF] font-black text-xs flex items-center justify-center shrink-0">
            1
          </div>
          <div>
            <p class="text-xs font-bold text-[#102A56]">Tap "Download anyway"</p>
            <p class="text-[11px] text-[#5E7694]">If Android or Chrome displays a standard unknown APK warning.</p>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E3ECF7] flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-[#E4F0FF] text-[#1677FF] font-black text-xs flex items-center justify-center shrink-0">
            2
          </div>
          <div>
            <p class="text-xs font-bold text-[#102A56]">Open Downloaded APK</p>
            <p class="text-[11px] text-[#5E7694]">Swipe down from top of your phone screen and tap <strong>EzboAgents.apk</strong>.</p>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E3ECF7] flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-[#E4F0FF] text-[#1677FF] font-black text-xs flex items-center justify-center shrink-0">
            3
          </div>
          <div>
            <p class="text-xs font-bold text-[#102A56]">Tap "Install" & Launch</p>
            <p class="text-[11px] text-[#5E7694]">Open the app to command Ezbo CEO with 120Hz smooth wave physics!</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="max-w-md mx-auto w-full text-center py-2 text-[11px] text-[#889DB5]">
    <p>© 2026 EzboAgents • Verified SHA256 Safe • Android 9.0 (Pie) and above</p>
  </footer>
</div>
