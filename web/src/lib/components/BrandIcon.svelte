<script lang="ts">
  let {
    name = '',
    modelId = '',
    icon = '',
    size = 20,
    class: className = ''
  } = $props<{
    name?: string;
    modelId?: string;
    icon?: string;
    size?: number;
    class?: string;
  }>();

  // Deduce brand from name, modelId, or icon string
  const resolvedBrand = $derived.by(() => {
    const raw = ((name || '') + ' ' + (modelId || '') + ' ' + (icon || '')).toLowerCase().trim();

    if (raw.includes('sheet')) return 'sheets';
    if (raw.includes('docs') || raw.includes('google doc')) return 'docs';
    if (raw.includes('drive')) return 'drive';
    if (raw.includes('gmail') || raw.includes('email') || raw.includes('newsletter') || raw.includes('mail')) return 'gmail';
    if (raw.includes('calendar')) return 'calendar';
    if (raw.includes('slides') || raw.includes('presentation')) return 'slides';
    if (raw.includes('youtube')) return 'youtube';
    if (raw.includes('whatsapp')) return 'whatsapp';
    if (raw.includes('telegram')) return 'telegram';
    if (raw.includes('instagram')) return 'instagram';
    if (raw.includes('facebook') || (raw.includes('meta') && !raw.includes('meta-llama') && !raw.includes('llama'))) return 'facebook';
    if (raw.includes('tiktok')) return 'tiktok';
    if (raw.includes('linkedin')) return 'linkedin';
    if (raw.includes('slack')) return 'slack';
    if (raw.includes('discord')) return 'discord';
    if (raw.includes('shopify')) return 'shopify';
    if (raw.includes('stripe')) return 'stripe';
    if (raw.includes('hubspot')) return 'hubspot';
    if (raw.includes('notion')) return 'notion';
    if (raw.includes('mailchimp')) return 'mailchimp';
    if (raw.includes('github')) return 'github';
    if (raw.includes('midjourney')) return 'midjourney';

    if (raw.includes('gemini') || raw.startsWith('google/') || raw.includes('google')) return 'gemini';
    if (raw.includes('openrouter')) return 'openrouter';
    if (raw.includes('openai') || raw.includes('gpt') || raw.includes('chatgpt')) return 'openai';
    if (raw.includes('claude') || raw.includes('anthropic')) return 'anthropic';
    if (raw.includes('deepseek')) return 'deepseek';
    if (raw.includes('grok') || raw.includes('xai') || raw.includes('x-ai')) return 'grok';
    if (raw.includes('llama') || raw.includes('meta')) return 'meta';
    if (raw.includes('mistral') || raw.includes('mixtral')) return 'mistral';
    if (raw.includes('cohere')) return 'cohere';
    if (raw.includes('replicate') || raw.includes('flux')) return 'replicate';
    if (raw.includes('qwen') || raw.includes('alibaba')) return 'qwen';

    if (raw.includes('trigger') || raw.includes('zap') || raw.includes('webhook') || raw.includes('button')) return 'trigger';
    if (raw.includes('agent') || raw.includes('bot') || raw.includes('reasoning') || raw.includes('specialist') || raw.includes('ceo')) return 'agent';

    return 'generic';
  });

  // Unique ID for SVG linear gradients to prevent cross-instance ID collisions in lists
  const uid = Math.random().toString(36).substring(2, 8);
</script>

{#if resolvedBrand === 'sheets'}
  <!-- Official Google Sheets Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Sheets">
    <rect width="24" height="24" rx="5" fill="#0F9D58"/>
    <path fill="#FFFFFF" d="M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1.5 2v3h7V8h-7zm0 4.5v3.5h3.2v-3.5H8.5zm4.8 0v3.5h2.2v-3.5h-2.2z"/>
  </svg>

{:else if resolvedBrand === 'docs'}
  <!-- Official Google Docs Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Docs">
    <rect width="24" height="24" rx="5" fill="#4285F4"/>
    <path fill="#FFFFFF" d="M8 7h8v1.8H8zm0 3.6h8v1.8H8zm0 3.6h5v1.8H8z"/>
  </svg>

{:else if resolvedBrand === 'drive'}
  <!-- Official Google Drive Authentic Polygon Icon -->
  <svg viewBox="0 0 87.3 78" width={size} height={size} class={className} aria-label="Google Drive">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h27.5z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.2z" fill="#ea4335"/>
    <path d="M43.65 25h27.5l-13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2-1.55 0-3.1.4-4.45 1.2z" fill="#00832d"/>
    <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h51.05c1.55 0 3.1-.4 4.45-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>

{:else if resolvedBrand === 'gmail'}
  <!-- Official Gmail Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Gmail">
    <rect width="24" height="24" rx="5" fill="#FFFFFF" stroke="#E2E8F0"/>
    <path fill="#4285F4" d="M4 6.5C4 5.7 4.7 5 5.5 5h1.2l5.3 4.2L17.3 5h1.2c.8 0 1.5.7 1.5 1.5v11c0 .8-.7 1.5-1.5 1.5H16V9.8l-4 3.1-4-3.1V19H5.5C4.7 19 4 18.3 4 17.5v-11z"/>
    <path fill="#EA4335" d="M18.5 5L12 10.2 5.5 5h13z"/>
  </svg>

{:else if resolvedBrand === 'youtube'}
  <!-- Official YouTube Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="YouTube">
    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>

{:else if resolvedBrand === 'instagram'}
  <!-- Official Instagram Gradient Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Instagram">
    <defs>
      <linearGradient id="ig-grad-{uid}" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFD600"/>
        <stop offset="25%" stop-color="#FF7A00"/>
        <stop offset="50%" stop-color="#FF0069"/>
        <stop offset="75%" stop-color="#D300C5"/>
        <stop offset="100%" stop-color="#7638FA"/>
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad-{uid})"/>
    <path fill="#FFFFFF" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0zm2.8 2.6c-.1-1.3-.4-2.5-1.3-3.4-.9-.9-2.1-1.2-3.4-1.3C13.9 4.6 10.1 4.6 8.7 4.7c-1.3.1-2.5.4-3.4 1.3-.9.9-1.2 2.1-1.3 3.4-.1 1.4-.1 5.2 0 6.6.1 1.3.4 2.5 1.3 3.4.9.9 2.1 1.2 3.4 1.3 1.4.1 5.2.1 6.6 0 1.3-.1 2.5-.4 3.4-1.3.9-.9 1.2-2.1 1.3-3.4.1-1.4.1-5.2 0-6.6zM18.8 17c-.3.7-.8 1.2-1.5 1.5-1.1.4-3.6.3-5.3.3s-4.2.1-5.3-.3c-.7-.3-1.2-.8-1.5-1.5-.4-1.1-.3-3.6-.3-5.3s-.1-4.2.3-5.3c.3-.7.8-1.2 1.5-1.5 1.1-.4 3.6-.3 5.3-.3s4.2-.1 5.3.3c.7.3 1.2.8 1.5 1.5.4 1.1.3 3.6.3 5.3s.1 4.2-.3 5.3z"/>
  </svg>

{:else if resolvedBrand === 'facebook'}
  <!-- Official Facebook Circle Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Facebook">
    <circle cx="12" cy="12" r="12" fill="#1877F2"/>
    <path fill="#FFFFFF" d="M14.5 12h-2v7h-3v-7h-1.5V9.5H9.5V8.2c0-1.6.7-2.6 2.6-2.6h1.9v2.4h-1.2c-.8 0-.9.4-.9.9v1.1h2.2L14.5 12z"/>
  </svg>

{:else if resolvedBrand === 'tiktok'}
  <!-- Official TikTok Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="TikTok">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path fill="#25F4EE" d="M16.5 7.5a4.5 4.5 0 0 1-3.5-3.5h-2.5v11a2.5 2.5 0 1 1-2.5-2.5c.3 0 .7.1 1 .2V10a5 5 0 1 0 4 4.9V8.8a6.9 6.9 0 0 0 3.5 1.1v-2.4z"/>
    <path fill="#FE2C55" d="M17 7a4.5 4.5 0 0 1-3.5-3.5h-2v11a2.5 2.5 0 1 1-2.5-2.5c.3 0 .7.1 1 .2V9.8a5 5 0 1 0 4 4.9V8.3a6.9 6.9 0 0 0 3.5 1.1V7z"/>
    <path fill="#FFFFFF" d="M16.7 7.2a4.5 4.5 0 0 1-3.5-3.5h-2.2v11a2.5 2.5 0 1 1-2.5-2.5c.3 0 .7.1 1 .2V10a5 5 0 1 0 4 4.9V8.5a6.9 6.9 0 0 0 3.5 1.1v-2.4z"/>
  </svg>

{:else if resolvedBrand === 'linkedin'}
  <!-- Official LinkedIn Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="LinkedIn">
    <rect width="24" height="24" rx="4.5" fill="#0A66C2"/>
    <path fill="#FFFFFF" d="M7.3 9h2.3v7.5H7.3V9zm1.2-3.8c.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4zM11.2 9h2.2v1h.1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6V16.5h-2.3v-3.5c0-.8 0-1.9-1.2-1.9s-1.4.9-1.4 1.8v3.6h-2.3V9z"/>
  </svg>

{:else if resolvedBrand === 'slack'}
  <!-- Official Slack Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Slack">
    <path fill="#E01E5A" d="M6 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm1.5-1.5a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 1 1-3 0V10.5a1.5 1.5 0 0 1 1.5-1.5z"/>
    <path fill="#36C5F0" d="M13.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-1.5 1.5a1.5 1.5 0 0 1 1.5-1.5h3.5a1.5 1.5 0 0 1 0 3H13.5a1.5 1.5 0 0 1-1.5-1.5z"/>
    <path fill="#2EB67D" d="M18 13.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5V10a1.5 1.5 0 1 1 3 0v3.5a1.5 1.5 0 0 1-1.5 1.5z"/>
    <path fill="#ECB22E" d="M10.5 18a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm1.5-1.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1 0-3h3.5a1.5 1.5 0 0 1 1.5 1.5z"/>
  </svg>

{:else if resolvedBrand === 'shopify'}
  <!-- Official Shopify Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Shopify">
    <path fill="#95BF47" d="M19.7 5.7c-.1-.3-.3-.4-.5-.4l-2.6-.3-1.7-1.7c-.2-.2-.5-.3-.7-.2l-1.3.4c-.4-.9-1-1.7-1.9-2.2C10 .6 8.7.6 7.6 1.3c-1.5 1-2.3 2.8-2.3 4.7 0 .3 0 .7.1 1L2 8.3c-.3.1-.5.4-.5.7l1.8 13.1c.1.5.5.9 1 .9h15.4c.5 0 .9-.4 1-.9l1.8-15.5c.1-.4 0-.7-.2-.9zM9 3.5c.7-.5 1.6-.5 2.2 0 .5.4.8 1 1 1.8L8.6 6.5C8.8 5.2 9.2 4.2 9 3.5zm2.8 11.2c-.4.2-1.3.4-1.9.4-1.6 0-2.4-.8-2.4-1.8 0-1.6 1.8-2.2 3.5-2.5v-.5c0-.8-.5-1.2-1.4-1.2-.7 0-1.4.3-1.9.6l-.4-.8c.7-.4 1.6-.7 2.6-.7 1.6 0 2.4.9 2.4 2.2v3.7c0 .5.1 1 .2 1.3h-1.2l-.2-.7zm0-2.8c-1.1.2-2.1.6-2.1 1.4 0 .6.4 1 1.2 1 .4 0 .8-.1 1-.3v-2.1z"/>
  </svg>

{:else if resolvedBrand === 'stripe'}
  <!-- Official Stripe Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Stripe">
    <rect width="24" height="24" rx="4.5" fill="#635BFF"/>
    <path fill="#FFFFFF" d="M13.8 9.8c0-.7-.6-1.1-1.6-1.1-1.4 0-3 .5-4.2 1.2l-.6-2.3c1.4-.7 3.3-1.1 5.1-1.1 3.5 0 5.6 1.7 5.6 4.7 0 4.6-6.2 3.9-6.2 5.8 0 .8.7 1.2 1.8 1.2 1.7 0 3.6-.7 4.7-1.5l.6 2.3c-1.4.9-3.4 1.4-5.5 1.4-3.6 0-5.9-1.8-5.9-4.8 0-4.8 6.2-4.1 6.2-5.8z"/>
  </svg>

{:else if resolvedBrand === 'hubspot'}
  <!-- Official HubSpot Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="HubSpot">
    <circle cx="12" cy="12" r="12" fill="#FF7A59"/>
    <path fill="#FFFFFF" d="M16.5 10.5V8.8a1.8 1.8 0 1 0-1.8 1.8v1.4a4.4 4.4 0 0 0-2.3 1.1l-4-3.1a1.8 1.8 0 1 0-1.1 1.4l3.9 3a4.5 4.5 0 0 0-.2 1.4 4.5 4.5 0 1 0 4.5-4.5c-.3 0-.7 0-1 .1v-1.4a4.4 4.4 0 0 0 2-.9zm-6.2 6.8a2.3 2.3 0 1 1 2.3-2.3 2.3 2.3 0 0 1-2.3 2.3z"/>
  </svg>

{:else if resolvedBrand === 'notion'}
  <!-- Official Notion Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Notion">
    <rect width="24" height="24" rx="4.5" fill="#000000"/>
    <path fill="#FFFFFF" d="M5.5 5.5v13h2.6l6.3-8.8v7.8h2.6v-13h-2.6l-6.3 8.8V5.5H5.5z"/>
  </svg>

{:else if resolvedBrand === 'discord'}
  <!-- Official Discord Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Discord">
    <rect width="24" height="24" rx="5" fill="#5865F2"/>
    <path fill="#FFFFFF" d="M18.2 6.8a14.8 14.8 0 0 0-3.7-1.1.2.2 0 0 0-.2.1c-.2.3-.3.7-.5 1-1.3-.2-2.7-.2-4 0-.2-.3-.3-.7-.5-1a.2.2 0 0 0-.2-.1 14.8 14.8 0 0 0-3.7 1.1.2.2 0 0 0-.1.1C3.2 10.5 2.6 14 3.7 17.5a.2.2 0 0 0 .1.1 14.9 14.9 0 0 0 4.5 2.3.2.2 0 0 0 .2-.1c.3-.5.7-1 1-1.5a.2.2 0 0 0-.1-.2 9.8 9.8 0 0 1-1.4-.7.2.2 0 0 1 0-.3c.1-.1.2-.1.3-.2 2.9 1.3 6 1.3 8.8 0 .1.1.2.1.3.2a.2.2 0 0 1 0 .3c-.4.3-.9.5-1.4.7a.2.2 0 0 0-.1.2c.3.5.7 1 1 1.5a.2.2 0 0 0 .2.1 14.9 14.9 0 0 0 4.5-2.3.2.2 0 0 0 .1-.1c1.2-3.8.5-7.3-1.6-10.6a.2.2 0 0 0-.1-.1zM9.5 14.6c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7c.9 0 1.6.8 1.5 1.7 0 1-.7 1.7-1.5 1.7zm5 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7c.9 0 1.6.8 1.5 1.7 0 1-.7 1.7-1.5 1.7z"/>
  </svg>

{:else if resolvedBrand === 'github'}
  <!-- Official GitHub Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="GitHub">
    <circle cx="12" cy="12" r="12" fill="#181717"/>
    <path fill="#FFFFFF" fill-rule="evenodd" d="M12 4.4a7.6 7.6 0 0 0-2.4 14.8c.4.1.5-.2.5-.4v-1.4c-2.1.5-2.6-.9-2.6-.9-.3-.9-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.8 2.2.6.1-.5.3-.8.5-1-1.7-.2-3.5-.9-3.5-3.8 0-.8.3-1.5.8-2-.1-.2-.4-1 .1-2 0 0 .6-.2 2.1.8a7.3 7.3 0 0 1 3.8 0c1.5-1 2.1-.8 2.1-.8.5 1 .2 1.8.1 2 .5.6.8 1.2.8 2 0 3-1.8 3.6-3.5 3.8.3.3.6.8.6 1.7V19c0 .2.2.5.5.4A7.6 7.6 0 0 0 12 4.4z"/>
  </svg>

{:else if resolvedBrand === 'mailchimp'}
  <!-- Official Mailchimp Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Mailchimp">
    <rect width="24" height="24" rx="5" fill="#FFE01B"/>
    <path fill="#241C15" d="M12 4.5c-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5 7.5-3.4 7.5-7.5-3.4-7.5-7.5-7.5zm-2.8 5.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm5.6 0a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm-2.8 6.5c-2 0-3.3-1.1-3.6-2h7.2c-.3.9-1.6 2-3.6 2z"/>
  </svg>

{:else if resolvedBrand === 'midjourney'}
  <!-- Official Midjourney Ship Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Midjourney">
    <rect width="24" height="24" rx="5" fill="#0D0F1A"/>
    <path fill="#FFFFFF" d="M12 4.5l1.6 4.7 4.9.4-3.7 3.3 1.1 4.8L12 15.2l-3.9 2.5 1.1-4.8-3.7-3.3 4.9-.4L12 4.5z"/>
  </svg>

{:else if resolvedBrand === 'trigger'}
  <!-- Workflow Trigger Zap Badge -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Trigger">
    <rect width="24" height="24" rx="5" fill="#F59E0B"/>
    <path fill="#FFFFFF" d="M13 3L4 14h7v7l9-11h-7V3z"/>
  </svg>

{:else if resolvedBrand === 'agent'}
  <!-- Autonomous AI Agent Specialist Badge -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="AI Specialist">
    <rect width="24" height="24" rx="5" fill="#1677FF"/>
    <path fill="#FFFFFF" d="M12 2a2 2 0 0 1 2 2c0 .7-.4 1.4-1 1.7V7h3a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h3V5.7c-.6-.3-1-1-1-1.7a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-6 5h6v1H9v-1z"/>
  </svg>

{:else if resolvedBrand === 'gemini'}
  <!-- Official Google Gemini Brand Sparkle with Authentic Corporate Gradient -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Google Gemini"
  >
    <defs>
      <linearGradient id="gemini-grad-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4E88F5"/>
        <stop offset="35%" stop-color="#5B73E8"/>
        <stop offset="70%" stop-color="#9353D3"/>
        <stop offset="100%" stop-color="#E25590"/>
      </linearGradient>
    </defs>
    <path
      fill="url(#gemini-grad-{uid})"
      d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68q.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58a12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68q-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96q2.19.93 3.81 2.55t2.55 3.81"
    />
  </svg>

{:else if resolvedBrand === 'openrouter'}
  <!-- Official OpenRouter Brand Gateway -->
  <svg
    viewBox="0 0 256 181"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="OpenRouter"
  >
    <path
      fill="#7624F4"
      d="M198.973 0c29.97 0 54.265 24.296 54.265 54.265s-24.294 54.266-54.265 54.266l53.826 53.826c6.838 6.837 1.995 18.528-7.673 18.528H90.442C40.492 180.885 0 140.392 0 90.442S40.492 0 90.442 0zM90.443 36.177c-29.97 0-54.266 24.295-54.266 54.265s24.295 54.265 54.265 54.265s54.265-24.295 54.265-54.265s-24.295-54.265-54.265-54.265"
    />
  </svg>

{:else if resolvedBrand === 'openai'}
  <!-- Official OpenAI Rosette Spiral -->
  <svg
    viewBox="0 0 256 260"
    fill="none"
    width={size}
    height={size}
    class="{className} text-[#10A37F]"
    aria-label="OpenAI"
  >
    <path
      fill="currentColor"
      d="M239.184 106.203a64.72 64.72 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.72 64.72 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.67 64.67 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.77 64.77 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483m-97.56 136.338a48.4 48.4 0 0 1-31.105-11.255l1.535-.87l51.67-29.825a8.6 8.6 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601M37.158 197.93a48.35 48.35 0 0 1-5.781-32.589l1.534.921l51.722 29.826a8.34 8.34 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803M23.549 85.38a48.5 48.5 0 0 1 25.58-21.333v61.39a8.29 8.29 0 0 0 4.195 7.316l62.874 36.272l-21.845 12.636a.82.82 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405zm179.466 41.695l-63.08-36.63L161.73 77.86a.82.82 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.54 8.54 0 0 0-4.4-7.213m21.742-32.69l-1.535-.922l-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.72.72 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391zM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87l-51.67 29.825a8.6 8.6 0 0 0-4.246 7.367zm11.868-25.58L128.067 97.3l28.188 16.218v32.434l-28.086 16.218l-28.188-16.218z"
    />
  </svg>

{:else if resolvedBrand === 'anthropic'}
  <!-- Official Anthropic Claude Starburst -->
  <svg
    viewBox="0 0 256 257"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Anthropic Claude"
  >
    <path
      fill="#D97757"
      d="m50.228 170.321l50.357-28.257l.843-2.463l-.843-1.361h-2.462l-8.426-.518l-28.775-.778l-24.952-1.037l-24.175-1.296l-6.092-1.297L0 125.796l.583-3.759l5.12-3.434l7.324.648l16.202 1.101l24.304 1.685l17.629 1.037l26.118 2.722h4.148l.583-1.685l-1.426-1.037l-1.101-1.037l-25.147-17.045l-27.22-18.017l-14.258-10.37l-7.713-5.25l-3.888-4.925l-1.685-10.758l7-7.713l9.397.649l2.398.648l9.527 7.323l20.35 15.75L94.817 91.9l3.889 3.24l1.555-1.102l.195-.777l-1.75-2.917l-14.453-26.118l-15.425-26.572l-6.87-11.018l-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0l10.63 1.426l4.472 3.888l6.61 15.101l10.694 23.786l16.591 32.34l4.861 9.592l2.592 8.879l.973 2.722h1.685v-1.556l1.36-18.211l2.528-22.36l2.463-28.776l.843-8.1l4.018-9.722l7.971-5.25l6.222 2.981l5.12 7.324l-.713 4.73l-3.046 19.768l-5.962 30.98l-3.889 20.739h2.268l2.593-2.593l10.499-13.934l17.628-22.036l7.778-8.749l9.073-9.657l5.833-4.601h11.018l8.1 12.055l-3.628 12.443l-11.342 14.388l-9.398 12.184l-13.48 18.147l-8.426 14.518l.778 1.166l2.01-.194l30.46-6.481l16.462-2.982l19.637-3.37l8.88 4.148l.971 4.213l-3.5 8.62l-20.998 5.184l-24.628 4.926l-36.682 8.685l-.454.324l.519.648l16.526 1.555l7.065.389h17.304l32.21 2.398l8.426 5.574l5.055 6.805l-.843 5.184l-12.962 6.611l-17.498-4.148l-40.83-9.721l-14-3.5h-1.944v1.167l11.666 11.406l21.387 19.314l26.767 24.887l1.36 6.157l-3.434 4.86l-3.63-.518l-23.526-17.693l-9.073-7.972l-20.545-17.304h-1.36v1.814l4.73 6.935l25.017 37.59l1.296 11.536l-1.814 3.76l-6.481 2.268l-7.13-1.297l-14.647-20.544l-15.1-23.138l-12.185-20.739l-1.49.843l-7.194 77.448l-3.37 3.953l-7.778 2.981l-6.48-4.925l-3.436-7.972l3.435-15.749l4.148-20.544l3.37-16.333l3.046-20.285l1.815-6.74l-.13-.454l-1.49.194l-15.295 20.999l-23.267 31.433l-18.406 19.702l-4.407 1.75l-7.648-3.954l.713-7.064l4.277-6.286l25.47-32.405l15.36-20.092l9.917-11.6l-.065-1.686h-.583L44.07 198.125l-12.055 1.555l-5.185-4.86l.648-7.972l2.463-2.593l20.35-13.999z"
    />
  </svg>

{:else if resolvedBrand === 'deepseek'}
  <!-- Official DeepSeek Whale -->
  <svg
    viewBox="0 0 256 189"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="DeepSeek"
  >
    <path
      fill="#4D6BFE"
      d="M253.314 15.812c-2.711-1.329-3.88 1.203-5.465 2.49c-.542.414-1.001.954-1.46 1.452c-3.963 4.232-8.594 7.013-14.643 6.68c-8.845-.497-16.396 2.284-23.071 9.048c-1.419-8.341-6.133-13.322-13.309-16.517c-3.754-1.66-7.55-3.32-10.179-6.931c-1.836-2.572-2.336-5.436-3.254-8.258c-.584-1.702-1.168-3.445-3.13-3.736c-2.127-.331-2.961 1.452-3.796 2.947c-3.337 6.101-4.63 12.824-4.506 19.63c.292 15.315 6.759 27.515 19.608 36.19c1.46.995 1.836 1.99 1.377 3.444c-.876 2.988-1.92 5.893-2.837 8.88c-.584 1.91-1.46 2.325-3.504 1.494c-7.051-2.945-13.142-7.304-18.524-12.574c-9.136-8.84-17.397-18.592-27.701-26.228a121 121 0 0 0-7.343-5.022c-10.513-10.209 1.377-18.593 4.13-19.588c2.879-1.038 1.002-4.607-8.302-4.565s-17.814 3.154-28.66 7.304c-1.586.623-3.255 1.079-4.966 1.452c-9.845-1.867-20.066-2.283-30.747-1.079c-20.108 2.241-36.17 11.745-47.976 27.972C.872 59.802-2.466 81.963 1.623 105.079c4.297 24.36 16.729 44.53 35.837 60.301c19.816 16.35 42.637 24.36 68.67 22.825c15.81-.913 33.416-3.029 53.275-19.837c5.005 2.49 10.262 3.486 18.982 4.233c6.717.623 13.183-.332 18.19-1.369c7.842-1.66 7.3-8.923 4.464-10.25c-22.988-10.708-17.94-6.35-22.529-9.878c11.681-13.82 29.287-28.18 36.17-74.702c.543-3.693.084-6.018 0-9.006c-.041-1.825.376-2.53 2.462-2.739c5.757-.664 11.348-2.24 16.48-5.062c14.893-8.134 20.9-21.498 22.318-37.517c.21-2.449-.041-4.98-2.628-6.266M123.526 159.985c-22.278-17.513-33.083-23.282-37.547-23.033c-4.172.25-3.42 5.022-2.503 8.135c.96 3.07 2.211 5.187 3.963 7.884c1.21 1.785 2.045 4.44-1.21 6.433c-7.175 4.44-19.65-1.494-20.234-1.784c-14.518-8.55-26.658-19.839-35.21-35.276c-8.261-14.858-13.058-30.794-13.851-47.81c-.21-4.107 1-5.56 5.09-6.307c5.38-.996 10.93-1.204 16.311-.416C61.073 71.131 80.43 81.3 96.66 97.401c9.261 9.172 16.27 20.129 23.488 30.836c7.676 11.37 15.936 22.203 26.45 31.084c3.712 3.112 6.674 5.478 9.511 7.221c-8.552.955-22.82 1.163-32.582-6.557m10.68-68.684a3.27 3.27 0 0 1 3.296-3.278c.418 0 .793.082 1.127.206c.46.167.876.416 1.21.789c.584.581.918 1.41.918 2.283a3.267 3.267 0 0 1-3.296 3.278c-1.835 0-3.254-1.452-3.254-3.278m33.167 17.016c-2.128.872-4.255 1.618-6.3 1.701c-3.17.166-6.633-1.121-8.51-2.698c-2.92-2.449-5.006-3.817-5.882-8.092c-.376-1.826-.167-4.649.167-6.267c.75-3.486-.084-5.726-2.545-7.76c-2.003-1.661-4.548-2.117-7.343-2.117c-1.043 0-2.002-.457-2.712-.83c-1.168-.581-2.127-2.034-1.21-3.818c.293-.58 1.711-1.992 2.045-2.24c3.797-2.16 8.177-1.453 12.224.165c3.755 1.535 6.592 4.358 10.68 8.341c4.172 4.814 4.923 6.143 7.3 9.753c1.879 2.822 3.59 5.727 4.757 9.048c.71 2.075-.209 3.776-2.67 4.814z"
    />
  </svg>

{:else if resolvedBrand === 'grok'}
  <!-- Official xAI Grok Mathematical Slash-X -->
  <svg
    viewBox="0 0 251 256"
    fill="currentColor"
    width={size}
    height={size}
    class="{className} text-[#0F172A]"
    aria-label="xAI Grok"
  >
    <path
      d="M149.079 108.399L242.33 0h-22.098l-80.97 94.12L74.59 0H0l97.796 142.328L0 256h22.1l85.507-99.395L175.905 256h74.59L149.073 108.399zM118.81 143.58l-9.909-14.172l-78.84-112.773h33.943l63.625 91.011l9.909 14.173l82.705 118.3H186.3l-67.49-96.533z"
    />
  </svg>

{:else if resolvedBrand === 'meta'}
  <!-- Official Meta Infinity Loop -->
  <svg
    viewBox="0 0 256 171"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Meta"
  >
    <defs>
      <linearGradient id="meta-grad-1-{uid}" x1="13.878%" x2="89.144%" y1="55.934%" y2="58.694%">
        <stop offset="0%" stop-color="#0064E1"/>
        <stop offset="40%" stop-color="#0064E1"/>
        <stop offset="83%" stop-color="#0073EE"/>
        <stop offset="100%" stop-color="#0082FB"/>
      </linearGradient>
      <linearGradient id="meta-grad-2-{uid}" x1="54.315%" x2="54.315%" y1="82.782%" y2="39.307%">
        <stop offset="0%" stop-color="#0082FB"/>
        <stop offset="100%" stop-color="#0064E0"/>
      </linearGradient>
    </defs>
    <path
      fill="#0081FB"
      d="M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82c3.677 5.947 9.16 8.466 14.751 8.466c7.211 0 13.808-1.79 26.52-19.372c10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946c-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927c0-23.52-5.484-49.623-17.564-68.273c-8.574-13.23-19.684-21.313-31.907-21.313c-13.22 0-23.859 9.97-35.815 27.75c-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07c-14.2 18.91-26.324 26.076-42.287 26.076c-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148z"
    />
    <path
      fill="url(#meta-grad-1-{uid})"
      d="M21.802 33.206C34.48 13.666 52.774 0 73.757 0C85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49c6.802 8.243 11.565 10.7 17.752 10.7c15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946c-5.591 9.686-16.488 19.363-34.818 19.363c-11.395 0-21.49-2.475-32.654-13.007c-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428c-10.923 0-20.2 7.666-27.963 19.39z"
    />
    <path
      fill="url(#meta-grad-2-{uid})"
      d="M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39c-10.976 16.568-17.698 41.245-17.698 64.944c0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148C0 83.772 7.514 55.24 21.802 33.206C34.48 13.666 52.774 0 73.757 0z"
    />
  </svg>

{:else if resolvedBrand === 'mistral'}
  <!-- Official Mistral AI Pixel Steps -->
  <svg
    viewBox="0 0 256 233"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Mistral AI"
  >
    <path fill="#0F172A" d="M186.182 0h46.545v46.545h-46.545z"/>
    <path fill="#F7D046" d="M209.455 0H256v46.545h-46.545z"/>
    <path fill="#0F172A" d="M0 0h46.545v46.545H0zm0 46.545h46.545V93.09H0zm0 46.546h46.545v46.545H0zm0 46.545h46.545v46.545H0zm0 46.546h46.545v46.545H0z"/>
    <path fill="#F7D046" d="M23.273 0h46.545v46.545H23.273z"/>
    <path fill="#F2A73B" d="M209.455 46.545H256V93.09h-46.545zm-186.182 0h46.545V93.09H23.273z"/>
    <path fill="#0F172A" d="M139.636 46.545h46.545V93.09h-46.545z"/>
    <path fill="#F2A73B" d="M162.909 46.545h46.545V93.09h-46.545zm-93.091 0h46.545V93.09H69.818z"/>
    <path fill="#EE792F" d="M116.364 93.091h46.545v46.545h-46.545zm46.545 0h46.545v46.545h-46.545zm-93.091 0h46.545v46.545H69.818z"/>
    <path fill="#0F172A" d="M93.091 139.636h46.545v46.545H93.091z"/>
    <path fill="#EB5829" d="M116.364 139.636h46.545v46.545h-46.545z"/>
    <path fill="#EE792F" d="M209.455 93.091H256v46.545h-46.545zm-186.182 0h46.545v46.545H23.273z"/>
    <path fill="#0F172A" d="M186.182 139.636h46.545v46.545h-46.545z"/>
    <path fill="#EB5829" d="M209.455 139.636H256v46.545h-46.545z"/>
    <path fill="#0F172A" d="M186.182 186.182h46.545v46.545h-46.545z"/>
    <path fill="#EB5829" d="M23.273 139.636h46.545v46.545H23.273z"/>
    <path fill="#EA3326" d="M209.455 186.182H256v46.545h-46.545zm-186.182 0h46.545v46.545H23.273z"/>
  </svg>

{:else if resolvedBrand === 'cohere'}
  <!-- Official Cohere Multi-Colored Organic Mark -->
  <svg
    viewBox="0 0 75 75"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Cohere"
  >
    <path
      fill="#39594D"
      fill-rule="evenodd"
      d="M24.3 44.7c2 0 6-.1 11.6-2.4c6.5-2.7 19.3-7.5 28.6-12.5c6.5-3.5 9.3-8.1 9.3-14.3C73.8 7 66.9 0 58.3 0h-36C10 0 0 10 0 22.3s9.4 22.4 24.3 22.4"
    />
    <path
      fill="#D18EE2"
      fill-rule="evenodd"
      d="M30.4 60c0-6 3.6-11.5 9.2-13.8l11.3-4.7C62.4 36.8 75 45.2 75 57.6C75 67.2 67.2 75 57.6 75H45.3c-8.2 0-14.9-6.7-14.9-15"
    />
    <path
      fill="#FF7759"
      d="M12.9 47.6C5.8 47.6 0 53.4 0 60.5v1.7C0 69.2 5.8 75 12.9 75s12.9-5.8 12.9-12.9v-1.7c-.1-7-5.8-12.8-12.9-12.8"
    />
  </svg>

{:else if resolvedBrand === 'qwen'}
  <!-- Official Qwen Brand Interlocking Prism -->
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    class="{className} text-[#6366F1]"
    aria-label="Qwen"
  >
    <path
      d="M23.919 14.545L20.817 9.17l1.47-2.544a.56.56 0 0 0 0-.566l-1.633-2.83a.57.57 0 0 0-.49-.283h-6.207L12.487.402a.57.57 0 0 0-.49-.284H8.732a.56.56 0 0 0-.49.284L5.139 5.775h-2.94a.56.56 0 0 0-.49.284L.077 8.887a.56.56 0 0 0 0 .567L3.18 14.83l-1.47 2.545a.56.56 0 0 0 0 .566l1.634 2.83a.57.57 0 0 0 .49.283h6.205l1.47 2.545a.57.57 0 0 0 .49.284h3.266a.57.57 0 0 0 .49-.284l3.104-5.375h2.94a.57.57 0 0 0 .49-.283l1.634-2.828a.55.55 0 0 0-.004-.568M8.733.686l1.634 2.828l-1.634 2.828H21.8L20.164 9.17H7.425L5.63 6.06Zm1.306 19.801l-6.205-.002l1.634-2.83h3.265L2.201 6.344h3.267q3.182 5.517 6.367 11.032zm10.124-5.66L18.53 12l-6.532 11.315l-1.634-2.83c2.129-3.673 4.25-7.351 6.373-11.028h3.592l3.102 5.374z"
    />
  </svg>

{:else if resolvedBrand === 'replicate'}
  <!-- Official Replicate Terminal Stepped Blocks -->
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    class="{className} text-[#0F172A]"
    aria-label="Replicate"
  >
    <path
      d="M24 10.262v2.712h-9.518V24h-3.034V10.262zm0-5.131v2.717H8.755V24H5.722V5.131zM24 0v2.717H3.034V24H0V0z"
    />
  </svg>

{:else if resolvedBrand === 'whatsapp'}
  <!-- Official WhatsApp SVG Logo -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="WhatsApp"
  >
    <path
      fill="#25D366"
      d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.32"
    />
  </svg>

{:else if resolvedBrand === 'telegram'}
  <!-- Official Telegram SVG Logo -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class={className}
    aria-label="Telegram"
  >
    <path
      fill="#229ED9"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
    />
  </svg>

{:else}
  <!-- Generic High-Tech AI Chip Fallback -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    class="{className} text-[#1677FF]"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-label="AI Model"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
{/if}
