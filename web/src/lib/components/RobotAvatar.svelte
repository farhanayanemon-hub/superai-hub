<script lang="ts">
  import { getRobotConfig, type RobotConfig } from '$lib/config/robotConfigs';

  let {
    helperId,
    size = 'sm',
    class: customClass = '',
    title = '',
    ariaHidden = false
  }: {
    helperId: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
    class?: string;
    title?: string;
    ariaHidden?: boolean;
  } = $props();

  const config = $derived(getRobotConfig(helperId));

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    custom: ''
  };

  const safeId = $derived(helperId.replace(/[^a-zA-Z0-9_-]/g, '_'));
  const filterGlowId = $derived(`glow-${safeId}`);
  const chassisGradId = $derived(`chassis-${safeId}`);
  const visorGradId = $derived(`visor-${safeId}`);
  const crownGradId = $derived(`crown-${safeId}`);
  const earGradId = $derived(`ear-${safeId}`);

  const eyeColorHex = $derived.by(() => {
    switch (config.eyeColor) {
      case 'cyan':
        return '#00F0FF';
      case 'electric-blue':
        return '#2563EB';
      case 'sky':
        return '#38BDF8';
      case 'teal':
        return '#14B8A6';
      default:
        return '#00F0FF';
    }
  });
</script>

<div
  class="relative inline-flex items-center justify-center shrink-0 select-none {sizeClasses[size]} {customClass}"
  title={title || `${config.agentName} (${config.code}) — ${config.name}`}
>
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="w-full h-full drop-shadow-sm"
    role={ariaHidden ? undefined : 'img'}
    aria-label={ariaHidden ? undefined : (title || config.name)}
    aria-hidden={ariaHidden ? 'true' : undefined}
  >
    <defs>
      <!-- Neon LED Glow Filter -->
      <filter id={filterGlowId} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color={eyeColorHex} flood-opacity="0.95" />
      </filter>

      <!-- Chassis Titanium Gradient -->
      <linearGradient id={chassisGradId} x1="0" y1="0" x2="0" y2="1">
        {#if config.id === 'ceo'}
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="25%" stop-color="#FEF9C3" />
          <stop offset="65%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#CBD5E1" />
        {:else}
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="25%" stop-color="#F1F5F9" />
          <stop offset="70%" stop-color="#E2E8F0" />
          <stop offset="100%" stop-color="#CBD5E1" />
        {/if}
      </linearGradient>

      <!-- Glossy Cyber Visor Obsidian Gradient -->
      <linearGradient id={visorGradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0E1B2E" />
        <stop offset="50%" stop-color="#07101E" />
        <stop offset="100%" stop-color="#02060D" />
      </linearGradient>

      <!-- Ear Module Dark Metallic Gradient -->
      <linearGradient id={earGradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="50%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>

      <!-- CEO Golden Crown Gradient -->
      <linearGradient id={crownGradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FEF08A" />
        <stop offset="45%" stop-color="#EAB308" />
        <stop offset="100%" stop-color="#B45309" />
      </linearGradient>
    </defs>

    <!-- ======================================================== -->
    <!-- 1. BACKGROUND COLLAR HYDRAULICS & SHOULDERS -->
    <!-- ======================================================== -->
    <!-- Hydraulic Neck Piston Cylinder -->
    <rect x="42" y="74" width="16" height="10" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1.6" />
    <line x1="46" y1="75" x2="46" y2="83" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" />
    <line x1="50" y1="75" x2="50" y2="83" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" />
    <line x1="54" y1="75" x2="54" y2="83" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" />

    <!-- Shoulders & Chest Armor -->
    <path
      d="M 16,100 C 16,83 34,80 50,80 C 66,80 84,83 84,100 Z"
      fill="url(#{chassisGradId})"
      stroke="#1E293B"
      stroke-width="2.2"
    />
    <!-- Shoulder Armor Seam Lines -->
    <path d="M 26,100 C 26,89 34,85 42,84" fill="none" stroke="#64748B" stroke-width="1.2" stroke-dasharray="2.5 2" />
    <path d="M 74,100 C 74,89 66,85 58,84" fill="none" stroke="#64748B" stroke-width="1.2" stroke-dasharray="2.5 2" />
    <!-- Shoulder Tech Micro-LEDs -->
    <rect x="20" y="93" width="5" height="1.8" rx="0.9" fill="#38CFFF" />
    <rect x="75" y="93" width="5" height="1.8" rx="0.9" fill="#38CFFF" />

    <!-- Chest Power Reactor Arc Core -->
    <circle cx="50" cy="91" r="5.5" fill="#0A1628" stroke="#38CFFF" stroke-width="1.4" />
    <circle cx="50" cy="91" r="3.2" fill={eyeColorHex} filter="url(#{filterGlowId})" />
    <circle cx="50" cy="91" r="1.3" fill="#FFFFFF" />

    <!-- Reactor Circuit Traces -->
    <line x1="30" y1="91" x2="42" y2="91" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="29" cy="91" r="1.2" fill="#38CFFF" />
    <line x1="58" y1="91" x2="70" y2="91" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="71" cy="91" r="1.2" fill="#38CFFF" />

    <!-- ======================================================== -->
    <!-- 2. EAR MODULES (Rendered Behind Head) -->
    <!-- ======================================================== -->
    {#if config.ears === 'headphones'}
      <!-- Left Headphone -->
      <rect x="11" y="42" width="9" height="24" rx="4.5" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <circle cx="15.5" cy="54" r="3.6" fill="#0A1628" stroke="#38CFFF" stroke-width="1.4" />
      <circle cx="15.5" cy="54" r="1.8" fill={eyeColorHex} filter="url(#{filterGlowId})" />
      <circle cx="15.5" cy="54" r="0.7" fill="#FFFFFF" />
      <!-- Right Headphone -->
      <rect x="80" y="42" width="9" height="24" rx="4.5" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <circle cx="84.5" cy="54" r="3.6" fill="#0A1628" stroke="#38CFFF" stroke-width="1.4" />
      <circle cx="84.5" cy="54" r="1.8" fill={eyeColorHex} filter="url(#{filterGlowId})" />
      <circle cx="84.5" cy="54" r="0.7" fill="#FFFFFF" />
    {:else if config.ears === 'bolts'}
      <!-- Cylindrical Power Bolts -->
      <rect x="10" y="46" width="10" height="16" rx="3.5" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <line x1="12" y1="50" x2="18" y2="50" stroke="#64748B" stroke-width="1.2" />
      <line x1="12" y1="58" x2="18" y2="58" stroke="#64748B" stroke-width="1.2" />
      <line x1="7" y1="54" x2="13" y2="54" stroke="#38CFFF" stroke-width="3" stroke-linecap="round" />
      <circle cx="15" cy="54" r="1.5" fill="#FFFFFF" />
      <rect x="80" y="46" width="10" height="16" rx="3.5" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <line x1="82" y1="50" x2="88" y2="50" stroke="#64748B" stroke-width="1.2" />
      <line x1="82" y1="58" x2="88" y2="58" stroke="#64748B" stroke-width="1.2" />
      <line x1="87" y1="54" x2="93" y2="54" stroke="#38CFFF" stroke-width="3" stroke-linecap="round" />
      <circle cx="85" cy="54" r="1.5" fill="#FFFFFF" />
    {:else if config.ears === 'fins'}
      <!-- Aerodynamic Mecha Sensor Fins -->
      <polygon points="20,38 9,46 9,62 20,57" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" stroke-linejoin="round" />
      <line x1="12" y1="49" x2="18" y2="53" stroke="#38CFFF" stroke-width="2.2" stroke-linecap="round" />
      <polygon points="80,38 91,46 91,62 80,57" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" stroke-linejoin="round" />
      <line x1="88" y1="49" x2="82" y2="53" stroke="#38CFFF" stroke-width="2.2" stroke-linecap="round" />
    {:else if config.ears === 'dishes'}
      <!-- Radar Dishes -->
      <circle cx="13" cy="54" r="7" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <circle cx="13" cy="54" r="4.2" fill="#1677FF" stroke="#38CFFF" stroke-width="1.2" />
      <circle cx="13" cy="54" r="1.8" fill="#FFFFFF" />
      <circle cx="87" cy="54" r="7" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <circle cx="87" cy="54" r="4.2" fill="#1677FF" stroke="#38CFFF" stroke-width="1.2" />
      <circle cx="87" cy="54" r="1.8" fill="#FFFFFF" />
    {:else if config.ears === 'leds'}
      <!-- Vertical Diagnostic LED Towers -->
      <rect x="12" y="43" width="8" height="22" rx="4" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <circle cx="16" cy="47" r="1.8" fill="#38CFFF" filter="url(#{filterGlowId})" />
      <circle cx="16" cy="54" r="1.8" fill="#1677FF" />
      <circle cx="16" cy="61" r="1.8" fill="#10B981" />
      <rect x="80" y="43" width="8" height="22" rx="4" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <circle cx="84" cy="47" r="1.8" fill="#38CFFF" filter="url(#{filterGlowId})" />
      <circle cx="84" cy="54" r="1.8" fill="#1677FF" />
      <circle cx="84" cy="61" r="1.8" fill="#10B981" />
    {:else if config.ears === 'audio'}
      <!-- Graphic Equalizer Stack -->
      <rect x="11" y="43" width="9" height="22" rx="3.5" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <line x1="13.5" y1="48" x2="17.5" y2="48" stroke="#38CFFF" stroke-width="2" stroke-linecap="round" />
      <line x1="13" y1="54" x2="18" y2="54" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" />
      <line x1="13.5" y1="60" x2="17.5" y2="60" stroke="#38CFFF" stroke-width="2" stroke-linecap="round" />
      <rect x="80" y="43" width="9" height="22" rx="3.5" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <line x1="82.5" y1="48" x2="86.5" y2="48" stroke="#38CFFF" stroke-width="2" stroke-linecap="round" />
      <line x1="82" y1="54" x2="87" y2="54" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" />
      <line x1="82.5" y1="60" x2="86.5" y2="60" stroke="#38CFFF" stroke-width="2" stroke-linecap="round" />
    {:else if config.ears === 'circuits'}
      <!-- Exposed Cyber PCB Module -->
      <polygon points="20,41 12,44 12,63 20,66" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" stroke-linejoin="round" />
      <circle cx="15.5" cy="54" r="2.2" fill="#FFFFFF" />
      <line x1="15.5" y1="47" x2="15.5" y2="51.5" stroke="#38CFFF" stroke-width="1.5" />
      <polygon points="80,41 88,44 88,63 80,66" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" stroke-linejoin="round" />
      <circle cx="84.5" cy="54" r="2.2" fill="#FFFFFF" />
      <line x1="84.5" y1="47" x2="84.5" y2="51.5" stroke="#38CFFF" stroke-width="1.5" />
    {:else if config.ears === 'capsules'}
      <!-- Glowing Energy Fuel Cells -->
      <rect x="12" y="42" width="8" height="24" rx="4" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <rect x="13.5" y="45" width="5" height="18" rx="2.5" fill="#0A1628" />
      <line x1="16" y1="47" x2="16" y2="61" stroke="#38CFFF" stroke-width="2.5" stroke-linecap="round" filter="url(#{filterGlowId})" />
      <rect x="80" y="42" width="8" height="24" rx="4" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <rect x="81.5" y="45" width="5" height="18" rx="2.5" fill="#0A1628" />
      <line x1="84" y1="47" x2="84" y2="61" stroke="#38CFFF" stroke-width="2.5" stroke-linecap="round" filter="url(#{filterGlowId})" />
    {/if}

    <!-- ======================================================== -->
    <!-- 3. ANTENNA MOUNT SOCKET & ACCESSORY (Rendered Behind Head) -->
    <!-- ======================================================== -->
    <!-- Mechanical Skull Antenna Mount Socket -->
    <rect x="45" y="28" width="10" height="5" rx="2" fill="#334155" stroke="#475569" stroke-width="1.2" />
    <circle cx="50" cy="30" r="1.2" fill="#38CFFF" />

    {#if config.antenna === 'crown'}
      <!-- Master AI CEO Royal Crown -->
      <path d="M 35,32 L 33,14 L 43,22 L 50,8 L 57,22 L 67,14 L 65,32 Z" fill="url(#{crownGradId})" stroke="#1E293B" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M 37,30 L 35,17 L 43,23 L 50,11 L 57,23 L 65,17 L 63,30" fill="none" stroke="#FEF08A" stroke-width="1" stroke-linejoin="round" />
      <!-- 3 Glowing Power Jewels -->
      <circle cx="50" cy="8" r="3.8" fill="#38CFFF" stroke="#1E293B" stroke-width="1.5" filter="url(#{filterGlowId})" />
      <circle cx="50" cy="8" r="1.4" fill="#FFFFFF" />
      <circle cx="33" cy="14" r="3" fill="#38CFFF" stroke="#1E293B" stroke-width="1.2" />
      <circle cx="33" cy="14" r="1" fill="#FFFFFF" />
      <circle cx="67" cy="14" r="3" fill="#38CFFF" stroke="#1E293B" stroke-width="1.2" />
      <circle cx="67" cy="14" r="1" fill="#FFFFFF" />
      <!-- Center Royal Diamond -->
      <polygon points="50,18 53,22 50,26 47,22" fill="#FFFFFF" />
    {:else if config.antenna === 'single-beacon'}
      <!-- Telescoping Titanium Mast + Glowing Beacon -->
      <line x1="50" y1="30" x2="50" y2="17" stroke="#94A3B8" stroke-width="2.8" stroke-linecap="round" />
      <circle cx="50" cy="14" r="5.5" fill="#38CFFF" stroke="#1E293B" stroke-width="1.8" filter="url(#{filterGlowId})" />
      <circle cx="50" cy="14" r="2.2" fill="#FFFFFF" />
      <!-- Radio Signal Emission Arcs -->
      <path d="M 41,12 A 11,11 0 0,1 59,12" fill="none" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.75" />
      <path d="M 37,8 A 16,16 0 0,1 63,8" fill="none" stroke="#38CFFF" stroke-width="1.3" stroke-linecap="round" opacity="0.45" />
    {:else if config.antenna === 'dual-tech'}
      <!-- Twin Angled Mecha Antennas -->
      <line x1="43" y1="30" x2="33" y2="14" stroke="#94A3B8" stroke-width="2.4" stroke-linecap="round" />
      <circle cx="33" cy="13" r="3.8" fill="#38CFFF" stroke="#1E293B" stroke-width="1.4" filter="url(#{filterGlowId})" />
      <circle cx="33" cy="13" r="1.3" fill="#FFFFFF" />
      <line x1="57" y1="30" x2="67" y2="14" stroke="#94A3B8" stroke-width="2.4" stroke-linecap="round" />
      <circle cx="67" cy="13" r="3.8" fill="#38CFFF" stroke="#1E293B" stroke-width="1.4" filter="url(#{filterGlowId})" />
      <circle cx="67" cy="13" r="1.3" fill="#FFFFFF" />
    {:else if config.antenna === 'radar-dish'}
      <!-- Satellite Parabolic Dish -->
      <line x1="50" y1="30" x2="50" y2="21" stroke="#94A3B8" stroke-width="2.6" />
      <path d="M 36,19 A 15,9 0 0,0 64,19 Z" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <line x1="50" y1="19" x2="50" y2="11" stroke="#38CFFF" stroke-width="2" />
      <circle cx="50" cy="10" r="3.5" fill="#38CFFF" stroke="#1E293B" stroke-width="1.5" filter="url(#{filterGlowId})" />
    {:else if config.antenna === 'bolt-speed'}
      <!-- High-Voltage Energy Lightning Crest -->
      <polygon points="55,7 41,21 49,21 43,32 59,16 51,16" fill="#38CFFF" stroke="#1E293B" stroke-width="1.8" stroke-linejoin="round" filter="url(#{filterGlowId})" />
    {:else if config.antenna === 'wifi-waves'}
      <!-- High-Speed Broadcast Transmitter -->
      <line x1="50" y1="30" x2="50" y2="24" stroke="#94A3B8" stroke-width="2.4" />
      <circle cx="50" cy="23" r="2.5" fill="#1677FF" />
      <path d="M 40,17 A 12,12 0 0,1 60,17" fill="none" stroke="#38CFFF" stroke-width="2.2" stroke-linecap="round" filter="url(#{filterGlowId})" />
      <path d="M 34,11 A 18,18 0 0,1 66,11" fill="none" stroke="#1677FF" stroke-width="2" stroke-linecap="round" />
    {:else if config.antenna === 'code-brackets'}
      <!-- Holographic Cyber Code Brackets -->
      <line x1="50" y1="30" x2="50" y2="22" stroke="#94A3B8" stroke-width="2.2" />
      <path d="M 41,16 L 34,22 L 41,28" fill="none" stroke="#1677FF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 59,16 L 66,22 L 59,28" fill="none" stroke="#38CFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#{filterGlowId})" />
      <line x1="52" y1="14" x2="48" y2="30" stroke="#38CFFF" stroke-width="2" stroke-linecap="round" />
    {:else if config.antenna === 'camera-lens'}
      <!-- Optical Cyber Sensor Scope -->
      <rect x="40" y="16" width="20" height="15" rx="4.5" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" />
      <circle cx="50" cy="23.5" r="5" fill="#0A1628" stroke="#38CFFF" stroke-width="1.5" />
      <circle cx="50" cy="23.5" r="3.2" fill="#38CFFF" filter="url(#{filterGlowId})" />
      <circle cx="51.5" cy="22" r="1.4" fill="#FFFFFF" />
    {:else if config.antenna === 'chart-bars'}
      <!-- Holographic Analytics Bar Equalizer -->
      <rect x="39" y="21" width="5.5" height="11" rx="1.5" fill="#1677FF" stroke="#1E293B" stroke-width="1.2" />
      <rect x="47.2" y="15" width="5.5" height="17" rx="1.5" fill="#38CFFF" stroke="#1E293B" stroke-width="1.2" filter="url(#{filterGlowId})" />
      <rect x="55.5" y="9" width="5.5" height="23" rx="1.5" fill="#10B981" stroke="#1E293B" stroke-width="1.2" />
    {:else if config.antenna === 'target-crosshair'}
      <!-- Tactical HUD Crosshair Reticle -->
      <line x1="50" y1="30" x2="50" y2="26" stroke="#94A3B8" stroke-width="2.2" />
      <circle cx="50" cy="16" r="9" fill="none" stroke="#1677FF" stroke-width="2" />
      <circle cx="50" cy="16" r="3.5" fill="#38CFFF" filter="url(#{filterGlowId})" />
      <circle cx="50" cy="16" r="1.3" fill="#FFFFFF" />
      <line x1="38" y1="16" x2="62" y2="16" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" />
      <line x1="50" y1="4" x2="50" y2="28" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" />
    {:else if config.antenna === 'lightbulb'}
      <!-- Cyber Ideation Bulb -->
      <path d="M 42,21 A 9,9 0 1,1 58,21 L 55,27.5 L 45,27.5 Z" fill="#FBBF24" stroke="#1E293B" stroke-width="1.8" stroke-linejoin="round" filter="url(#{filterGlowId})" />
      <line x1="45" y1="29.5" x2="55" y2="29.5" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" />
      <circle cx="50" cy="18" r="2.5" fill="#FFFFFF" />
    {:else if config.antenna === 'star-crest'}
      <!-- 4-Point Chrome Star Crest -->
      <path d="M 50,9 L 53.5,19 L 63,20 L 56,26 L 58,33 L 50,28 L 42,33 L 44,26 L 37,20 L 46.5,19 Z" fill="#1677FF" stroke="#1E293B" stroke-width="1.8" stroke-linejoin="round" />
      <circle cx="50" cy="21" r="2.8" fill="#38CFFF" filter="url(#{filterGlowId})" />
    {:else if config.antenna === 'shield-crest'}
      <!-- Security Shield Crest -->
      <path d="M 41,14 L 59,14 L 59,24 Q 59,32 50,34 Q 41,32 41,24 Z" fill="url(#{earGradId})" stroke="#475569" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M 45,18 L 55,18 L 55,23.5 Q 55,28 50,29.5 Q 45,28 45,23.5 Z" fill="#38CFFF" filter="url(#{filterGlowId})" />
    {:else if config.antenna === 'quill-pen'}
      <!-- High-Tech Digital Stylus Antenna -->
      <path d="M 44,30 L 48,13 L 50,6 L 52,13 L 56,30 Z" fill="#1677FF" stroke="#1E293B" stroke-width="1.8" stroke-linejoin="round" />
      <line x1="50" y1="8" x2="50" y2="22" stroke="#38CFFF" stroke-width="2" />
      <circle cx="50" cy="23" r="2" fill="#FFFFFF" />
    {/if}

    <!-- ======================================================== -->
    <!-- 4. HEAD CHASSIS BODY SILHOUETTE (Metallic Shading) -->
    <!-- ======================================================== -->
    {#if config.headShape === 'round-rect'}
      <rect x="20" y="30" width="60" height="47" rx="16" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" />
    {:else if config.headShape === 'squircle'}
      <rect x="19" y="29" width="62" height="49" rx="20" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" />
    {:else if config.headShape === 'capsule'}
      <rect x="21" y="27" width="58" height="52" rx="25" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" />
    {:else if config.headShape === 'hexagon'}
      <polygon points="28,29 72,29 81,45 81,64 72,77 28,77 19,64 19,45" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" stroke-linejoin="round" />
    {:else if config.headShape === 'dome'}
      <path d="M 20,77 L 20,52 A 30,30 0 0,1 80,52 L 80,77 Z" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" stroke-linejoin="round" />
    {:else if config.headShape === 'shield'}
      <path d="M 21,30 L 79,30 Q 81,59 50,78 Q 19,59 21,30 Z" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" stroke-linejoin="round" />
    {:else if config.headShape === 'wide-monitor'}
      <rect x="17" y="31" width="66" height="45" rx="12" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" />
    {:else if config.headShape === 'pebble'}
      <path d="M 24,32 Q 50,26 76,32 Q 82,53 76,74 Q 50,80 24,74 Q 18,53 24,32 Z" fill="url(#{chassisGradId})" stroke="#1E293B" stroke-width="2.4" stroke-linejoin="round" />
    {/if}

    <!-- Chassis Precision Hardware Screws -->
    <circle cx="26" cy="35" r="1.3" fill="#64748B" stroke="#334155" stroke-width="0.6" />
    <circle cx="74" cy="35" r="1.3" fill="#64748B" stroke="#334155" stroke-width="0.6" />

    <!-- Forehead Cyber Tech Accent -->
    {#if config.foreheadAccent === 'gem'}
      <polygon points="50,32 53.5,35.5 50,39 46.5,35.5" fill="#38CFFF" stroke="#1E293B" stroke-width="0.8" filter="url(#{filterGlowId})" />
    {:else if config.foreheadAccent === 'tech-line'}
      <line x1="44" y1="35.5" x2="56" y2="35.5" stroke="#38CFFF" stroke-width="2.2" stroke-linecap="round" />
    {:else if config.foreheadAccent === 'dot-matrix'}
      <circle cx="45" cy="35.5" r="1.3" fill="#38CFFF" />
      <circle cx="50" cy="35.5" r="1.3" fill="#1677FF" />
      <circle cx="55" cy="35.5" r="1.3" fill="#38CFFF" />
    {:else if config.foreheadAccent === 'target'}
      <circle cx="50" cy="35.5" r="3" fill="none" stroke="#1677FF" stroke-width="1.3" />
      <circle cx="50" cy="35.5" r="1.3" fill="#38CFFF" />
    {:else if config.foreheadAccent === 'bracket'}
      <path d="M 46,33.5 L 43.5,35.5 L 46,37.5" fill="none" stroke="#38CFFF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 54,33.5 L 56.5,35.5 L 54,37.5" fill="none" stroke="#38CFFF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    {:else if config.foreheadAccent === 'code'}
      <path d="M 46.5,33.5 L 44,35.5 L 46.5,37.5" fill="none" stroke="#1677FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 53.5,33.5 L 56,35.5 L 53.5,37.5" fill="none" stroke="#38CFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    {:else if config.foreheadAccent === 'spark'}
      <path d="M 50,32 Q 50,35.5 47.5,35.5 Q 50,35.5 50,39 Q 50,35.5 52.5,35.5 Q 50,35.5 50,32 Z" fill="#38CFFF" filter="url(#{filterGlowId})" />
    {:else if config.foreheadAccent === 'wave'}
      <path d="M 44,35.5 Q 47,33.5 50,35.5 Q 53,37.5 56,35.5" fill="none" stroke="#38CFFF" stroke-width="1.6" stroke-linecap="round" />
    {:else if config.foreheadAccent === 'circuit'}
      <line x1="44" y1="35.5" x2="51" y2="35.5" stroke="#1677FF" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="53" cy="35.5" r="1.5" fill="#38CFFF" />
    {/if}

    <!-- ======================================================== -->
    <!-- 5. HIGH-CONTRAST CYBER VISOR SCREEN -->
    <!-- ======================================================== -->
    {#if config.visorShape === 'full-visor'}
      <rect x="25" y="41" width="50" height="20" rx="9.5" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" />
      <!-- Glass Glare Curved Reflection -->
      <path d="M 28,43 Q 50,40.5 72,43 Q 50,45 28,43 Z" fill="#FFFFFF" opacity="0.22" />
    {:else if config.visorShape === 'dual-pod'}
      <!-- Left Pod -->
      <rect x="26" y="41" width="20" height="20" rx="9" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" />
      <path d="M 28,43 Q 36,41.5 44,43 Q 36,44.5 28,43 Z" fill="#FFFFFF" opacity="0.22" />
      <!-- Right Pod -->
      <rect x="54" y="41" width="20" height="20" rx="9" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" />
      <path d="M 56,43 Q 64,41.5 72,43 Q 64,44.5 56,43 Z" fill="#FFFFFF" opacity="0.22" />
      <!-- Center Goggle Bridge Connector -->
      <line x1="46" y1="51" x2="54" y2="51" stroke="#38CFFF" stroke-width="2" />
    {:else if config.visorShape === 'wide-curve'}
      <path d="M 23,45 Q 50,39 77,45 Q 79,61 74,63 Q 50,66 26,63 Q 21,61 23,45 Z" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M 27,45 Q 50,42 73,45 Q 50,47 27,45 Z" fill="#FFFFFF" opacity="0.22" />
    {:else if config.visorShape === 'hex-screen'}
      <polygon points="28,41 72,41 77,51 72,61 28,61 23,51" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M 30,43 L 70,43 L 73,47 L 27,47 Z" fill="#FFFFFF" opacity="0.2" />
    {:else if config.visorShape === 'matrix-strip'}
      <rect x="23" y="42" width="54" height="18" rx="6" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" />
      <path d="M 26,44 Q 50,43 74,44 Q 50,45.5 26,44 Z" fill="#FFFFFF" opacity="0.22" />
    {:else if config.visorShape === 'circular-lens'}
      <!-- Left Lens -->
      <circle cx="37" cy="51" r="10" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" />
      <path d="M 30,46 Q 37,44 44,46 Q 37,48 30,46 Z" fill="#FFFFFF" opacity="0.22" />
      <!-- Right Lens -->
      <circle cx="63" cy="51" r="10" fill="url(#{visorGradId})" stroke="#38CFFF" stroke-width="1.8" />
      <path d="M 56,46 Q 63,44 70,46 Q 63,48 56,46 Z" fill="#FFFFFF" opacity="0.22" />
      <!-- Center Lens Bridge -->
      <line x1="47" y1="51" x2="53" y2="51" stroke="#38CFFF" stroke-width="2.4" />
    {/if}

    <!-- ======================================================== -->
    <!-- 6. BLINKING EYES GROUP (Glowing LEDs inside Visor) -->
    <!-- ======================================================== -->
    <g
      class="robot-eyes"
      style="animation-duration: {config.blinkDuration}s; animation-delay: {config.blinkDelay}s;"
    >
      {#if config.eyeStyle === 'pill'}
        <!-- Classic Friendly Capsule Eyes -->
        <rect x="33" y="45.5" width="8.5" height="11" rx="4.2" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <circle cx="35.5" cy="48" r="1.6" fill="#FFFFFF" />
        <rect x="58.5" y="45.5" width="8.5" height="11" rx="4.2" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <circle cx="61" cy="48" r="1.6" fill="#FFFFFF" />
      {:else if config.eyeStyle === 'circle'}
        <!-- Bright Round Expressive Eyes -->
        <circle cx="37" cy="51" r="5" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <circle cx="35.5" cy="49" r="1.6" fill="#FFFFFF" />
        <circle cx="63" cy="51" r="5" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <circle cx="61.5" cy="49" r="1.6" fill="#FFFFFF" />
      {:else if config.eyeStyle === 'crescent'}
        <!-- Happy Arched Eyes -->
        <path d="M 32,53.5 Q 37,46 42,53.5" fill="none" stroke={eyeColorHex} stroke-width="3.4" stroke-linecap="round" filter="url(#{filterGlowId})" />
        <path d="M 58,53.5 Q 63,46 68,53.5" fill="none" stroke={eyeColorHex} stroke-width="3.4" stroke-linecap="round" filter="url(#{filterGlowId})" />
      {:else if config.eyeStyle === 'visor-beam'}
        <!-- Sleek Daft Punk Cyber Scanner Beam -->
        <rect x="29" y="49" width="14" height="4" rx="2" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <line x1="30" y1="51" x2="42" y2="51" stroke="#FFFFFF" stroke-width="1.3" />
        <rect x="57" y="49" width="14" height="4" rx="2" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <line x1="58" y1="51" x2="70" y2="51" stroke="#FFFFFF" stroke-width="1.3" />
      {:else if config.eyeStyle === 'star'}
        <!-- Sparkling 4-Point Cyber Star Pupils -->
        <path d="M 37,45 Q 37,51 31.5,51 Q 37,51 37,57 Q 37,51 42.5,51 Q 37,51 37,45 Z" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <circle cx="37" cy="51" r="1.5" fill="#FFFFFF" />
        <path d="M 63,45 Q 63,51 57.5,51 Q 63,51 63,57 Q 63,51 68.5,51 Q 63,51 63,45 Z" fill={eyeColorHex} filter="url(#{filterGlowId})" />
        <circle cx="63" cy="51" r="1.5" fill="#FFFFFF" />
      {:else if config.eyeStyle === 'bracket'}
        <!-- HUD Tactical Bracket Eyes -->
        <path d="M 40,46 L 34,46 L 34,56 L 40,56" fill="none" stroke={eyeColorHex} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#{filterGlowId})" />
        <circle cx="37" cy="51" r="1.6" fill="#FFFFFF" />
        <path d="M 60,46 L 66,46 L 66,56 L 60,56" fill="none" stroke={eyeColorHex} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#{filterGlowId})" />
        <circle cx="63" cy="51" r="1.6" fill="#FFFFFF" />
      {:else if config.eyeStyle === 'concentric'}
        <!-- Concentric HUD Targeting Ring Eyes -->
        <circle cx="37" cy="51" r="5.5" fill="none" stroke={eyeColorHex} stroke-width="1.8" filter="url(#{filterGlowId})" />
        <circle cx="37" cy="51" r="2.8" fill={eyeColorHex} />
        <circle cx="35.8" cy="49.8" r="1" fill="#FFFFFF" />
        <circle cx="63" cy="51" r="5.5" fill="none" stroke={eyeColorHex} stroke-width="1.8" filter="url(#{filterGlowId})" />
        <circle cx="63" cy="51" r="2.8" fill={eyeColorHex} />
        <circle cx="61.8" cy="49.8" r="1" fill="#FFFFFF" />
      {:else if config.eyeStyle === 'matrix-dot'}
        <!-- Digital LED Dot Matrix Eyes -->
        <g filter="url(#{filterGlowId})">
          <circle cx="34" cy="49" r="1.5" fill={eyeColorHex} />
          <circle cx="37" cy="49" r="1.5" fill={eyeColorHex} />
          <circle cx="40" cy="49" r="1.5" fill={eyeColorHex} />
          <circle cx="35.5" cy="53" r="1.5" fill={eyeColorHex} />
          <circle cx="38.5" cy="53" r="1.5" fill={eyeColorHex} />
          <circle cx="60" cy="49" r="1.5" fill={eyeColorHex} />
          <circle cx="63" cy="49" r="1.5" fill={eyeColorHex} />
          <circle cx="66" cy="49" r="1.5" fill={eyeColorHex} />
          <circle cx="61.5" cy="53" r="1.5" fill={eyeColorHex} />
          <circle cx="64.5" cy="53" r="1.5" fill={eyeColorHex} />
        </g>
      {/if}
    </g>

    <!-- ======================================================== -->
    <!-- 7. LOWER FACEPLATE (Mouth & Speaker Area Below Visor) -->
    <!-- ======================================================== -->
    <!-- Cheek Sensor Blush LEDs -->
    <circle cx="27" cy="65" r="1.8" fill={eyeColorHex} opacity="0.85" filter="url(#{filterGlowId})" />
    <circle cx="73" cy="65" r="1.8" fill={eyeColorHex} opacity="0.85" filter="url(#{filterGlowId})" />

    <!-- Robot Mouth / Acoustic Speaker Display -->
    {#if config.mouthStyle === 'smile'}
      <path d="M 44,67 Q 50,71.5 56,67" fill="none" stroke={eyeColorHex} stroke-width="2.2" stroke-linecap="round" filter="url(#{filterGlowId})" />
    {:else if config.mouthStyle === 'grill'}
      <!-- Acoustic Speaker Grill Vents -->
      <line x1="44.5" y1="65" x2="44.5" y2="70" stroke={eyeColorHex} stroke-width="1.6" stroke-linecap="round" />
      <line x1="48.2" y1="65" x2="48.2" y2="70" stroke={eyeColorHex} stroke-width="1.6" stroke-linecap="round" />
      <line x1="51.8" y1="65" x2="51.8" y2="70" stroke={eyeColorHex} stroke-width="1.6" stroke-linecap="round" />
      <line x1="55.5" y1="65" x2="55.5" y2="70" stroke={eyeColorHex} stroke-width="1.6" stroke-linecap="round" />
    {:else if config.mouthStyle === 'dots'}
      <!-- 3 Speech LED Indicators -->
      <circle cx="45" cy="67" r="1.4" fill={eyeColorHex} filter="url(#{filterGlowId})" />
      <circle cx="50" cy="67" r="1.4" fill={eyeColorHex} filter="url(#{filterGlowId})" />
      <circle cx="55" cy="67" r="1.4" fill={eyeColorHex} filter="url(#{filterGlowId})" />
    {:else if config.mouthStyle === 'wave'}
      <!-- Oscilloscope Voice Waveform -->
      <path d="M 43,67 Q 46.5,64.5 50,67 Q 53.5,69.5 57,67" fill="none" stroke={eyeColorHex} stroke-width="1.8" stroke-linecap="round" filter="url(#{filterGlowId})" />
    {:else if config.mouthStyle === 'dash'}
      <!-- Digital Status Dash -->
      <line x1="45" y1="67" x2="55" y2="67" stroke={eyeColorHex} stroke-width="2.2" stroke-linecap="round" filter="url(#{filterGlowId})" />
    {/if}

    <!-- Chin Hardware Center Rivet -->
    <circle cx="50" cy="74" r="1" fill="#94A3B8" />
  </svg>
</div>

<style>
  .robot-eyes {
    transform-box: fill-box;
    transform-origin: center;
    will-change: transform;
    animation-name: robot-blink;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    animation-iteration-count: infinite;
  }

  @keyframes robot-blink {
    0%,
    92%,
    100% {
      transform: scaleY(1);
    }
    95% {
      transform: scaleY(0.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .robot-eyes {
      animation: none !important;
      transform: scaleY(1) !important;
    }
  }
</style>
