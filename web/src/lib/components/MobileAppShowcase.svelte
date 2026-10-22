<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import AppDownloadModal from '$lib/components/AppDownloadModal.svelte';

  let isQrModalOpen = $state(false);
  let screenshotLoaded = $state(false);

  // Curated list of high-impact brand icons representing 100+ tools & frontier AI models
  // Each has an orbit trajectory, positioning angle, radius, and animation timing
  const orbitIcons = [
    // Top-tier Frontier AI Models
    { id: 'gemini', name: 'Google Gemini', type: 'AI Model', delay: '0s', duration: '6s', top: '4%', left: '8%', scale: 1.15, glow: '#4285F4' },
    { id: 'openai', name: 'OpenAI GPT-4o', type: 'AI Model', delay: '1.2s', duration: '7s', top: '12%', right: '10%', scale: 1.2, glow: '#10A37F' },
    { id: 'claude', name: 'Anthropic Claude', type: 'AI Model', delay: '2.4s', duration: '6.5s', top: '28%', left: '4%', scale: 1.1, glow: '#D97706' },
    { id: 'deepseek', name: 'DeepSeek AI', type: 'AI Model', delay: '0.8s', duration: '8s', top: '35%', right: '5%', scale: 1.15, glow: '#1E40AF' },
    { id: 'grok', name: 'xAI Grok', type: 'AI Model', delay: '3.1s', duration: '7.5s', top: '50%', left: '6%', scale: 1.05, glow: '#000000' },
    { id: 'replicate', name: 'Replicate Flux', type: 'AI Visual', delay: '1.9s', duration: '6.8s', top: '56%', right: '8%', scale: 1.1, glow: '#DC2626' },

    // Core Automation & Communication Tools
    { id: 'whatsapp', name: 'WhatsApp Bot', type: 'Channel', delay: '0.5s', duration: '7.2s', top: '70%', left: '9%', scale: 1.2, glow: '#25D366' },
    { id: 'telegram', name: 'Telegram Bot', type: 'Channel', delay: '2.7s', duration: '6.4s', top: '74%', right: '11%', scale: 1.15, glow: '#0088CC' },
    { id: 'shopify', name: 'Shopify E-Com', type: 'E-Commerce', delay: '1.5s', duration: '7.8s', top: '86%', left: '18%', scale: 1.1, glow: '#96BF48' },
    { id: 'stripe', name: 'Stripe Payments', type: 'Billing', delay: '3.5s', duration: '6.2s', top: '88%', right: '20%', scale: 1.1, glow: '#635BFF' },

    // Productivity & Marketing Hubs
    { id: 'meta', name: 'Meta Ads', type: 'Marketing', delay: '0.3s', duration: '8.2s', top: '2%', right: '28%', scale: 1.05, glow: '#0668E1' },
    { id: 'youtube', name: 'YouTube Engine', type: 'Social Media', delay: '2.1s', duration: '7s', top: '3%', left: '26%', scale: 1.05, glow: '#FF0000' },
    { id: 'sheets', name: 'Google Sheets', type: 'Data Sync', delay: '3.8s', duration: '6.6s', top: '65%', left: '2%', scale: 1.0, glow: '#0F9D58' },
    { id: 'slack', name: 'Slack Alerts', type: 'Team Hub', delay: '1.0s', duration: '7.4s', top: '68%', right: '3%', scale: 1.05, glow: '#4A154B' },
    { id: 'notion', name: 'Notion Workspace', type: 'Knowledge', delay: '2.9s', duration: '6.9s', top: '42%', left: '1%', scale: 1.0, glow: '#000000' },
    { id: 'github', name: 'GitHub Actions', type: 'DevOps', delay: '0.7s', duration: '8.5s', top: '44%', right: '2%', scale: 1.0, glow: '#24292E' },
    { id: 'gmail', name: 'Gmail Outreach', type: 'Email AI', delay: '2.0s', duration: '7.1s', top: '18%', left: '3%', scale: 1.0, glow: '#EA4335' },
    { id: 'hubspot', name: 'HubSpot CRM', type: 'Sales & Leads', delay: '3.3s', duration: '7.6s', top: '22%', right: '3%', scale: 1.05, glow: '#FF7A59' }
  ];
</script>

<!-- Embedded App Download Modal -->
<AppDownloadModal bind:isOpen={isQrModalOpen} />

<section
  id="mobile-app"
  class="relative py-24 sm:py-32 bg-gradient-to-b from-white via-[#F3F8FF] to-white border-t border-gray-100 overflow-hidden"
  aria-label="EzboAgents Mobile App Showcase"
>
  <!-- Ambient Cyber Lighting & Radial Mesh Glows -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden select-none">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-[#1677FF]/15 via-[#38CFFF]/20 to-purple-400/10 rounded-full blur-3xl opacity-75 animate-pulse"></div>
    <div class="absolute bottom-10 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-2xl"></div>
    <div class="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-2xl"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <!-- Header Title & Badges -->
    <div class="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#CFE2FA] shadow-xs text-xs font-bold text-[#1677FF]">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>NEW: 120Hz Fluid Wave Android App</span>
        <span class="px-2 py-0.2 rounded-full bg-[#1677FF] text-white text-[10px] font-black">APK v1.0</span>
      </div>

      <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black text-[#102A56] tracking-tight leading-[1.15]">
        Ezbo in Your Pocket.
        <br />
        <span class="bg-gradient-to-r from-[#1677FF] via-[#38CFFF] to-[#4F46E5] bg-clip-text text-transparent">
          100+ Tools & AI Models Bursting to Life.
        </span>
      </h2>

      <p class="text-sm sm:text-base text-[#5E7694] max-w-2xl mx-auto leading-relaxed">
        Command the Master AI CEO on the go. Seamlessly orchestrate bespoke AI workflows with our custom 120Hz animated wave navigation, offline session memory, and instant tool connectors.
      </p>

      <!-- Quick Action CTA Group -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href="/downloads/EzboAgents.apk"
          download="EzboAgents.apk"
          class="px-6 py-3.5 rounded-2xl blue-btn text-white text-sm font-extrabold shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:scale-102 active:scale-98 transition-all"
        >
          <Icon name="Download" size={17} />
          <span>Download Android APK (19.1 MB)</span>
        </a>

        <button
          type="button"
          onclick={() => (isQrModalOpen = true)}
          class="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#F3F8FF] text-[#102A56] border border-[#CFE2FA] text-sm font-bold shadow-2xs flex items-center gap-2 hover:scale-102 active:scale-98 transition-all cursor-pointer"
        >
          <Icon name="QrCode" size={17} class="text-[#1677FF]" />
          <span>Scan Phone QR</span>
        </button>

        <a
          href="/download"
          class="px-4 py-3.5 text-xs font-bold text-[#5E7694] hover:text-[#1677FF] flex items-center gap-1 transition-colors"
        >
          <span>Install Guide</span>
          <Icon name="ArrowRight" size={13} />
        </a>
      </div>
    </div>

    <!-- 3D SMARTPHONE SHOWCASE WITH ORBITING & BURSTING BRAND ICONS -->
    <div class="relative max-w-5xl mx-auto min-h-[580px] sm:min-h-[700px] flex items-center justify-center select-none">
      <!-- ==================================================== -->
      <!-- ORBITING & BURSTING TOOL & MODEL BRAND PODS -->
      <!-- ==================================================== -->
      <div class="absolute inset-0 pointer-events-none z-20">
        {#each orbitIcons as item}
          <div
            class="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-125 hover:z-30 cursor-pointer group"
            style="
              top: {item.top};
              {item.left ? `left: ${item.left};` : `right: ${item.right};`}
              animation: floatPod {item.duration} ease-in-out infinite alternate;
              animation-delay: {item.delay};
            "
          >
            <!-- Circular Glass Pod -->
            <div
              class="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_8px_24px_rgba(16,42,86,0.12)] p-2.5 sm:p-3 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(22,119,255,0.28)] group-hover:border-[#38CFFF]"
              style="transform: scale({item.scale});"
            >
              <BrandIcon name={item.id} size={24} />

              <!-- Micro glowing badge -->
              <span
                class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                style="background-color: {item.glow};"
              ></span>
            </div>

            <!-- Floating Label Tooltip on Hover -->
            <div class="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-40">
              <span class="px-2 py-0.5 rounded-md bg-[#102A56] text-white text-[10px] font-bold shadow-md">
                {item.name}
              </span>
            </div>
          </div>
        {/each}
      </div>

      <!-- ==================================================== -->
      <!-- CENTRAL 3D SMARTPHONE CHASSIS & SCREEN -->
      <!-- ==================================================== -->
      <div class="relative z-10 w-[290px] sm:w-[320px] md:w-[340px] transition-transform duration-500 hover:scale-[1.02]">
        <!-- Outer Glowing Aura -->
        <div class="absolute -inset-4 bg-gradient-to-tr from-[#1677FF]/40 via-[#38CFFF]/30 to-purple-500/20 rounded-[52px] blur-2xl opacity-60"></div>

        <!-- Phone Chassis (Titanium Border Frame) -->
        <div class="relative rounded-[48px] p-3 bg-gradient-to-b from-[#2B3545] via-[#102A56] to-[#0A192F] shadow-[0_25px_60px_-15px_rgba(16,42,86,0.5),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40">
          <!-- Side Buttons Simulation -->
          <div class="absolute -left-[14px] top-24 w-[3px] h-10 bg-gray-400 rounded-l-sm"></div>
          <div class="absolute -left-[14px] top-38 w-[3px] h-10 bg-gray-400 rounded-l-sm"></div>
          <div class="absolute -right-[14px] top-28 w-[3px] h-14 bg-gray-400 rounded-r-sm"></div>

          <!-- Glass Screen Container -->
          <div class="relative rounded-[38px] overflow-hidden bg-[#F3F8FF] border border-[#CFE2FA] aspect-[9/19.2] flex flex-col justify-between shadow-inner">
            <!-- Dynamic Island / Punch Hole Notch -->
            <div class="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5 shadow-xs">
              <div class="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] ring-1 ring-gray-700"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            <!-- User Uploadable Screenshot (`/app-preview.png`) -->
            <img
              src="/app-preview.png"
              alt="EzboAgents Mobile App Live Interface"
              onload={() => (screenshotLoaded = true)}
              class="absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-300 {screenshotLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
            />

            <!-- Interactive High-Fidelity UI Fallback (Renders when screenshot is not yet added) -->
            {#if !screenshotLoaded}
              <div class="w-full h-full flex flex-col justify-between pt-9 pb-2 px-3 text-[#102A56] select-none bg-gradient-to-b from-[#F3F8FF] via-white to-[#F3F8FF]">
                <!-- Top Status Bar & App Header -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between px-1 text-[10px] font-bold text-[#5E7694]">
                    <span>9:41</span>
                    <div class="flex items-center gap-1.5">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <!-- In-App Header -->
                  <div class="flex items-center justify-between p-2 rounded-2xl bg-white border border-[#E3ECF7] shadow-xs">
                    <div class="flex items-center gap-2">
                      <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#1677FF] to-[#38CFFF] p-0.5">
                        <div class="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden">
                          <img src="/ezbo-ceo.png" alt="Ezbo CEO" class="w-full h-full object-contain" />
                        </div>
                        <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>
                      <div>
                        <h4 class="text-xs font-black text-[#102A56] leading-none">Ezbo</h4>
                        <span class="text-[9px] text-[#1677FF] font-bold">120Hz Fluid Wave</span>
                      </div>
                    </div>
                    <div class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </div>
                  </div>
                </div>

                <!-- Chat Simulation Feed -->
                <div class="flex-1 py-3 space-y-2.5 overflow-hidden text-left">
                  <!-- User Bubble -->
                  <div class="flex justify-end">
                    <div class="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-xs bg-[#1677FF] text-white text-[11px] font-medium shadow-xs">
                      Ezbo, optimize my Q4 Facebook ads and generate 3 hook copies
                    </div>
                  </div>

                  <!-- Ezbo CEO Bubble -->
                  <div class="flex items-start gap-1.5">
                    <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <img src="/ezbo-ceo.png" alt="CEO" class="w-3.5 h-3.5 object-contain" />
                    </div>
                    <div class="max-w-[88%] space-y-1.5">
                      <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4F0FF] text-[#1677FF] text-[9px] font-extrabold border border-[#CFE2FA]">
                        <Icon name="Zap" size={9} />
                        <span>Delegating to Ad Copywriter Specialist</span>
                      </div>
                      <div class="p-2.5 rounded-2xl rounded-tl-xs bg-white border border-[#E3ECF7] text-[11px] text-[#102A56] shadow-xs space-y-1">
                        <p class="font-bold text-[#1677FF]">⚡ High-ROAS Ad Hook:</p>
                        <p class="text-[10px] text-[#5E7694] leading-relaxed">
                          "Stop wasting 60% of your ad spend on outdated audiences..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Custom 120Hz Animated Fluid Wave Bottom Bar Simulation -->
                <div class="relative pt-2">
                  <!-- Wave Background Container -->
                  <div class="h-14 rounded-2xl bg-[#102A56] text-white flex items-center justify-around px-2 shadow-xl border border-white/10 relative">
                    <!-- Left: My Agents -->
                    <div class="flex flex-col items-center gap-0.5 text-white/70">
                      <Icon name="Grid" size={15} />
                      <span class="text-[8px] font-bold">My Agents</span>
                    </div>

                    <!-- Center: Floating Wave Crest AI CEO -->
                    <div class="relative -top-4">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1677FF] to-[#38CFFF] p-1 shadow-lg shadow-blue-500/50 flex items-center justify-center ring-4 ring-[#F3F8FF] animate-bounce">
                        <div class="w-full h-full rounded-full bg-white flex items-center justify-center p-1">
                          <img src="/ezbo-ceo.png" alt="Ezbo" class="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>

                    <!-- Right: Notifications -->
                    <div class="flex flex-col items-center gap-0.5 text-white/70 relative">
                      <Icon name="MessageSquare" size={15} />
                      <span class="text-[8px] font-bold">Updates</span>
                      <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white"></span>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Phone Reflection / Glass Sheen Overlay -->
        <div class="absolute inset-0 rounded-[48px] bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
      </div>
    </div>

    <!-- 3-Pillar Feature Summary Under the Showcase -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 sm:mt-20">
      <div class="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#CFE2FA] shadow-xs text-center space-y-2">
        <div class="w-10 h-10 rounded-xl bg-[#E4F0FF] text-[#1677FF] mx-auto flex items-center justify-center font-black">
          120
        </div>
        <h4 class="text-sm font-black text-[#102A56]">120Hz Fluid Wave UI</h4>
        <p class="text-xs text-[#5E7694] leading-relaxed">
          Custom custom-painted bottom wave navigation bar tuned for 120 FPS high-refresh displays.
        </p>
      </div>

      <div class="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#CFE2FA] shadow-xs text-center space-y-2">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center">
          <Icon name="Bot" size={20} />
        </div>
        <h4 class="text-sm font-black text-[#102A56]">Master AI CEO + Bespoke Agents</h4>
        <p class="text-xs text-[#5E7694] leading-relaxed">
          Orchestrate ad creators, coders, writers, and image engines with instant slash (/) autocomplete.
        </p>
      </div>

      <div class="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#CFE2FA] shadow-xs text-center space-y-2">
        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 mx-auto flex items-center justify-center">
          <Icon name="Shield" size={20} />
        </div>
        <h4 class="text-sm font-black text-[#102A56]">Compact & 100% Private</h4>
        <p class="text-xs text-[#5E7694] leading-relaxed">
          Lightweight 19.1 MB APK. Offline SQLite chat memory and zero token markup.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes floatPod {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
    }
    50% {
      transform: translate3d(0, -10px, 15px) scale(1.04);
    }
    100% {
      transform: translate3d(0, 8px, -10px) scale(0.98);
    }
  }
</style>
