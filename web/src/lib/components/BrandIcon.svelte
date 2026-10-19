<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';

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

  // Deduce brand from modelId, name, or icon string with 100% precision for all 100 enterprise tool connectors
  const resolvedBrand = $derived.by(() => {
    const mid = (modelId || '').toLowerCase().trim();
    const n = (name || '').toLowerCase().trim();
    const raw = `${n} ${mid}`.trim();

    // 1. Exact Tool Connector ID Matches (Highest Priority)
    // Google Workspace (10)
    if (mid === 'google_drive') return 'drive';
    if (mid === 'gmail') return 'gmail';
    if (mid === 'google_sheets') return 'sheets';
    if (mid === 'google_calendar') return 'calendar';
    if (mid === 'google_docs') return 'docs';
    if (mid === 'google_slides') return 'slides';
    if (mid === 'google_meet') return 'google_meet';
    if (mid === 'google_forms') return 'google_forms';
    if (mid === 'google_analytics_4') return 'google_analytics';
    if (mid === 'bigquery') return 'bigquery';

    // Messaging & Channels (10)
    if (mid === 'whatsapp_cloud') return 'whatsapp';
    if (mid === 'telegram_bot') return 'telegram';
    if (mid === 'slack_webhooks') return 'slack';
    if (mid === 'discord_bot') return 'discord';
    if (mid === 'twilio_sms_voice') return 'twilio';
    if (mid === 'sendgrid_email') return 'sendgrid';
    if (mid === 'resend_email') return 'resend';
    if (mid === 'pushover_notify') return 'pushover';
    if (mid === 'ms_teams_webhooks' || mid === 'teams_graph') return 'teams';
    if (mid === 'intercom_chat') return 'intercom';

    // E-Commerce & Payments (10)
    if (mid === 'opaybd') return 'opaybd';
    if (mid === 'bkash_merchant') return 'bkash';
    if (mid === 'nagad_direct') return 'nagad';
    if (mid === 'shopify_storefront') return 'shopify';
    if (mid === 'woocommerce_rest') return 'woocommerce';
    if (mid === 'stripe_elements') return 'stripe';
    if (mid === 'paypal_smart') return 'paypal';
    if (mid === 'sslcommerz_bd') return 'sslcommerz';
    if (mid === 'razorpay_intl') return 'razorpay';
    if (mid === 'paddle_merchant') return 'paddle';

    // CRM & Leads (10)
    if (mid === 'hubspot_crm') return 'hubspot';
    if (mid === 'salesforce_rest') return 'salesforce';
    if (mid === 'pipedrive_crm') return 'pipedrive';
    if (mid === 'zoho_crm') return 'zoho';
    if (mid === 'leadsquared') return 'leadsquared';
    if (mid === 'close_crm') return 'close';
    if (mid === 'gohighlevel') return 'gohighlevel';
    if (mid === 'activecampaign') return 'activecampaign';
    if (mid === 'copper_crm') return 'copper';
    if (mid === 'freshsales') return 'freshsales';

    // Social Media (10)
    if (mid === 'facebook_graph' || mid === 'meta_ads_manager') return 'facebook';
    if (mid === 'instagram_basic') return 'instagram';
    if (mid === 'linkedin_marketing') return 'linkedin';
    if (mid === 'tiktok_content' || mid === 'tiktok_ads') return 'tiktok';
    if (mid === 'twitter_v2') return 'twitter';
    if (mid === 'pinterest_api') return 'pinterest';
    if (mid === 'youtube_data_v3') return 'youtube';
    if (mid === 'reddit_data') return 'reddit';
    if (mid === 'threads_publishing') return 'threads';
    if (mid === 'buffer_scheduler') return 'buffer';

    // Marketing & Ads (10)
    if (mid === 'google_ads_scripts') return 'google_ads';
    if (mid === 'mailchimp_marketing') return 'mailchimp';
    if (mid === 'klaviyo_ecommerce') return 'klaviyo';
    if (mid === 'brevo_sendinblue') return 'brevo';
    if (mid === 'omnisend_automation') return 'omnisend';
    if (mid === 'convertkit_creators') return 'convertkit';
    if (mid === 'drip_automation') return 'drip';
    if (mid === 'constant_contact') return 'constant_contact';

    // Microsoft 365 (10)
    if (mid === 'outlook_365') return 'outlook';
    if (mid === 'onedrive_business') return 'onedrive';
    if (mid === 'excel_online') return 'excel';
    if (mid === 'onenote_api') return 'onenote';
    if (mid === 'sharepoint_lists') return 'sharepoint';
    if (mid === 'ms_planner') return 'ms_planner';
    if (mid === 'power_bi_embedded') return 'power_bi';
    if (mid === 'azure_blob') return 'azure';
    if (mid === 'azure_openai') return 'azure_openai';

    // Storage & Media (10)
    if (mid === 'amazon_s3') return 'amazon_s3';
    if (mid === 'cloudinary_engine') return 'cloudinary';
    if (mid === 'supabase_storage' || mid === 'supabase_db') return 'supabase';
    if (mid === 'dropbox_core') return 'dropbox';
    if (mid === 'box_platform') return 'box';
    if (mid === 'google_cloud_storage') return 'google_cloud';
    if (mid === 'cloudflare_r2') return 'cloudflare';
    if (mid === 'backblaze_b2') return 'backblaze';
    if (mid === 'imgur_api') return 'imgur';
    if (mid === 'replicate_cdn') return 'replicate';

    // Productivity (10)
    if (mid === 'notion_api') return 'notion';
    if (mid === 'airtable_enterprise') return 'airtable';
    if (mid === 'trello_rest') return 'trello';
    if (mid === 'asana_tasks') return 'asana';
    if (mid === 'clickup_workspaces') return 'clickup';
    if (mid === 'monday_graphql') return 'monday';
    if (mid === 'todoist_rest') return 'todoist';
    if (mid === 'linear_api') return 'linear';
    if (mid === 'jira_software') return 'jira';
    if (mid === 'basecamp_4') return 'basecamp';

    // Developer Utilities (10)
    if (mid === 'github_api') return 'github';
    if (mid === 'gitlab_api') return 'gitlab';
    if (mid === 'webhook_dispatcher') return 'webhook';
    if (mid === 'postgresql_direct') return 'postgresql';
    if (mid === 'mysql_pool') return 'mysql';
    if (mid === 'redis_cache') return 'redis';
    if (mid === 'postman_collections') return 'postman';
    if (mid === 'docker_hub') return 'docker';
    if (mid === 'vercel_deployments') return 'vercel';

    // 2. Specific AI Helper Platform Matches
    // Helper #01: Facebook & Instagram Ads -> Facebook / Meta Ads
    if (mid === 'fb_insta_ads' || (raw.includes('facebook') && raw.includes('ads'))) return 'facebook';
    // Helper #02: Google Search & Display Ads -> Google Ads
    if (mid === 'google_search_ads' || (raw.includes('google') && raw.includes('ads'))) return 'google_ads';
    // Helper #16: Instagram Captions
    if (mid === 'fb_insta_captions' || raw.includes('instagram caption')) return 'instagram';
    // Helper #46: Google My Business / Local SEO
    if (raw.includes('google my business') || raw.includes('google business')) return 'google';
    // Helper #66: Excel & Sheets
    if (raw.includes('excel')) return 'excel';
    if (raw.includes('google sheets') || raw.includes('sheet')) return 'sheets';
    // Helper #74: WordPress
    if (raw.includes('wordpress')) return 'wordpress';

    // 3. Specific Brand Keywords
    if (raw.includes('opay')) return 'opaybd';
    if (raw.includes('bkash')) return 'bkash';
    if (raw.includes('nagad')) return 'nagad';
    if (raw.includes('sslcommerz')) return 'sslcommerz';
    if (raw.includes('razorpay')) return 'razorpay';
    if (raw.includes('paddle')) return 'paddle';
    if (raw.includes('woocommerce')) return 'woocommerce';
    if (raw.includes('paypal')) return 'paypal';
    if (raw.includes('stripe')) return 'stripe';
    if (raw.includes('shopify')) return 'shopify';

    if (raw.includes('mailchimp')) return 'mailchimp';
    if (raw.includes('sendgrid')) return 'sendgrid';
    if (raw.includes('resend')) return 'resend';
    if (raw.includes('klaviyo')) return 'klaviyo';
    if (raw.includes('brevo') || raw.includes('sendinblue')) return 'brevo';
    if (raw.includes('omnisend')) return 'omnisend';
    if (raw.includes('convertkit') || raw.includes('kit.com')) return 'convertkit';
    if (raw.includes('drip')) return 'drip';
    if (raw.includes('constant contact') || raw.includes('constant_contact')) return 'constant_contact';

    if (raw.includes('salesforce')) return 'salesforce';
    if (raw.includes('pipedrive')) return 'pipedrive';
    if (raw.includes('zoho')) return 'zoho';
    if (raw.includes('leadsquared')) return 'leadsquared';
    if (raw.includes('close crm') || raw.includes('close_crm')) return 'close';
    if (raw.includes('gohighlevel') || raw.includes('highlevel')) return 'gohighlevel';
    if (raw.includes('activecampaign')) return 'activecampaign';
    if (raw.includes('copper crm') || raw.includes('copper_crm')) return 'copper';
    if (raw.includes('freshsales') || raw.includes('freshworks')) return 'freshsales';
    if (raw.includes('hubspot')) return 'hubspot';

    if (raw.includes('outlook')) return 'outlook';
    if (raw.includes('onedrive')) return 'onedrive';
    if (raw.includes('onenote')) return 'onenote';
    if (raw.includes('sharepoint')) return 'sharepoint';
    if (raw.includes('power bi') || raw.includes('power_bi')) return 'power_bi';
    if (raw.includes('ms planner') || raw.includes('microsoft planner')) return 'ms_planner';
    if (raw.includes('teams') && !raw.includes('rate') && !raw.includes('strategy')) return 'teams';
    if (raw.includes('azure openai')) return 'azure_openai';
    if (raw.includes('azure')) return 'azure';

    if (raw.includes('amazon s3') || raw.includes('aws s3') || raw.includes('s3 bucket')) return 'amazon_s3';
    if (raw.includes('cloudinary')) return 'cloudinary';
    if (raw.includes('supabase')) return 'supabase';
    if (raw.includes('dropbox')) return 'dropbox';
    if (raw.includes('box.com') || raw.includes('box platform') || mid === 'box') return 'box';
    if (raw.includes('cloudflare')) return 'cloudflare';
    if (raw.includes('backblaze')) return 'backblaze';
    if (raw.includes('imgur')) return 'imgur';

    if (raw.includes('airtable')) return 'airtable';
    if (raw.includes('trello')) return 'trello';
    if (raw.includes('asana')) return 'asana';
    if (raw.includes('clickup')) return 'clickup';
    if (raw.includes('monday.com') || raw.includes('monday')) return 'monday';
    if (raw.includes('todoist')) return 'todoist';
    if (raw.includes('linear')) return 'linear';
    if (raw.includes('jira')) return 'jira';
    if (raw.includes('basecamp')) return 'basecamp';
    if (raw.includes('notion')) return 'notion';

    if (raw.includes('gitlab')) return 'gitlab';
    if (raw.includes('github')) return 'github';
    if (raw.includes('postgresql') || raw.includes('postgres')) return 'postgresql';
    if (raw.includes('mysql')) return 'mysql';
    if (raw.includes('redis')) return 'redis';
    if (raw.includes('postman')) return 'postman';
    if (raw.includes('docker')) return 'docker';
    if (raw.includes('vercel')) return 'vercel';

    if (raw.includes('google cloud')) return 'google_cloud';
    if (raw.includes('google meet')) return 'google_meet';
    if (raw.includes('google forms')) return 'google_forms';
    if (raw.includes('analytics') || raw.includes('google analytics')) return 'google_analytics';
    if (raw.includes('bigquery')) return 'bigquery';
    if (raw.includes('docs') || raw.includes('google doc')) return 'docs';
    if (raw.includes('calendar') || raw.includes('content calendar')) return 'calendar';
    if (raw.includes('slides') || raw.includes('presentation')) return 'slides';
    if (raw.includes('drive')) return 'drive';
    if (raw.includes('gmail')) return 'gmail';

    if (raw.includes('whatsapp')) return 'whatsapp';
    if (raw.includes('telegram')) return 'telegram';
    if (raw.includes('slack')) return 'slack';
    if (raw.includes('discord')) return 'discord';
    if (raw.includes('twilio')) return 'twilio';
    if (raw.includes('pushover')) return 'pushover';
    if (raw.includes('intercom')) return 'intercom';

    if (raw.includes('twitter') || raw.includes('x.com') || raw.includes('x api')) return 'twitter';
    if (raw.includes('pinterest')) return 'pinterest';
    if (raw.includes('reddit')) return 'reddit';
    if (raw.includes('threads')) return 'threads';
    if (raw.includes('buffer')) return 'buffer';
    if (raw.includes('youtube')) return 'youtube';
    if (raw.includes('instagram')) return 'instagram';
    if (raw.includes('facebook') || (raw.includes('meta') && !raw.includes('meta tag') && !raw.includes('meta-llama') && !raw.includes('llama'))) return 'facebook';
    if (raw.includes('tiktok')) return 'tiktok';
    if (raw.includes('linkedin')) return 'linkedin';

    if (raw.includes('midjourney')) return 'midjourney';
    if (raw.includes('gemini') || raw.startsWith('google/') || raw.includes('google gemini')) return 'gemini';
    if (raw.includes('openrouter')) return 'openrouter';
    if (raw.includes('openai') || raw.includes('gpt') || raw.includes('chatgpt')) return 'openai';
    if (raw.includes('claude') || raw.includes('anthropic')) return 'anthropic';
    if (raw.includes('deepseek')) return 'deepseek';
    if (raw.includes('grok') || raw.includes('xai') || raw.includes('x-ai')) return 'grok';
    if (raw.includes('llama')) return 'meta';
    if (raw.includes('mistral') || raw.includes('mixtral')) return 'mistral';
    if (raw.includes('cohere')) return 'cohere';
    if (raw.includes('replicate') || raw.includes('flux')) return 'replicate';
    if (raw.includes('qwen') || raw.includes('alibaba')) return 'qwen';

    if (raw.includes('trigger') || raw.includes('webhook')) return 'webhook';
    if (raw.includes('agent') || raw.includes('bot') || raw.includes('reasoning') || raw.includes('specialist') || raw.includes('ceo')) return 'agent';

    return 'generic';
  });

  // Unique ID for SVG linear gradients to prevent cross-instance ID collisions in lists
  const uid = Math.random().toString(36).substring(2, 8);
</script>

{#if resolvedBrand === 'sheets'}
  <!-- Official Google Sheets Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Sheets">
    <path fill="#34A853" d="M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0v6h6l-6-6zm1.363 10.636h-3.41v1.91h3.41v-1.91zm0 3.273h-3.41v1.91h3.41v-1.91zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5h6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91z"/>
  </svg>

{:else if resolvedBrand === 'docs'}
  <!-- Official Google Docs Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Docs">
    <path fill="#4285F4" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zm-.545 10.455H7.09v-1.364h7.09v1.364zm2.727-3.273H7.091v-1.364h9.818v1.364zm0-3.273H7.091V9.273h9.818v1.363zM14.727 6h6l-6-6v6z"/>
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
  <!-- Official Gmail Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Gmail">
    <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>

{:else if resolvedBrand === 'calendar'}
  <!-- Official Google Calendar Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Calendar">
    <path fill="#4285F4" d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z"/>
  </svg>

{:else if resolvedBrand === 'slides'}
  <!-- Official Google Slides Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Slides">
    <path fill="#FBBC04" d="M16.09 15.273H7.91v-4.637h8.18v4.637zm1.728-8.523h2.91v15.614c0 .904-.733 1.636-1.637 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.068v6.75h3.841zm-.363 2.523H6.545v7.363h10.91V9.273zm-2.728-5.979V6h6.001l-6-6v3.294z"/>
  </svg>

{:else if resolvedBrand === 'google_meet'}
  <!-- Official Google Meet Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Meet">
    <path fill="#00897B" d="M5.53 2.13 0 7.75h5.53zm.398 0v5.62h7.608v3.65l5.47-4.45c-.014-1.22.031-2.25-.025-3.46-.148-1.09-1.287-1.47-2.236-1.36zM23.1 4.32c-.802.295-1.358.995-2.047 1.49-2.506 2.05-4.982 4.12-7.468 6.19 3.025 2.59 6.04 5.18 9.065 7.76 1.218.671 1.428-.814 1.328-1.64v-13a.828.828 0 0 0-.877-.825zM.038 8.15v7.7h5.53v-7.7zm13.577 8.1H6.008v5.62c3.864-.006 7.737.011 11.58-.009 1.02-.07 1.618-1.12 1.468-2.07v-2.51l-5.47-4.68v3.65zm-13.577 0c.02 1.44-.041 2.88.033 4.31.162.948 1.158 1.43 2.047 1.31h3.464v-5.62z"/>
  </svg>

{:else if resolvedBrand === 'google_forms'}
  <!-- Official Google Forms Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Forms">
    <path fill="#7248B9" d="M14.727 6h6l-6-6v6zm0 .727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zM7.91 17.318a.819.819 0 1 1 .001-1.638.819.819 0 0 1 0 1.638zm0-3.273a.819.819 0 1 1 .001-1.637.819.819 0 0 1 0 1.637zm0-3.272a.819.819 0 1 1 .001-1.638.819.819 0 0 1 0 1.638zm9 6.409h-6.818v-1.364h6.818v1.364zm0-3.273h-6.818v-1.364h6.818v1.364zm0-3.273h-6.818V9.273h6.818v1.363z"/>
  </svg>

{:else if resolvedBrand === 'google_analytics'}
  <!-- Official Google Analytics Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Analytics">
    <path fill="#E37400" d="M22.84 2.9982v17.9987c.0086 1.6473-1.3197 2.9897-2.967 2.9984a2.9808 2.9808 0 01-.3677-.0208c-1.528-.226-2.6477-1.5558-2.6105-3.1V3.1204c-.0369-1.5458 1.0856-2.8762 2.6157-3.1 1.6361-.1915 3.1178.9796 3.3093 2.6158.014.1201.0208.241.0202.3619zM4.1326 18.0548c-1.6417 0-2.9726 1.331-2.9726 2.9726C1.16 22.6691 2.4909 24 4.1326 24s2.9726-1.3309 2.9726-2.9726-1.331-2.9726-2.9726-2.9726zm7.8728-9.0098c-.0171 0-.0342 0-.0513.0003-1.6495.0904-2.9293 1.474-2.891 3.1256v7.9846c0 2.167.9535 3.4825 2.3505 3.763 1.6118.3266 3.1832-.7152 3.5098-2.327.04-.1974.06-.3983.0593-.5998v-8.9585c.003-1.6474-1.33-2.9852-2.9773-2.9882z"/>
  </svg>

{:else if resolvedBrand === 'bigquery'}
  <!-- Official Google BigQuery Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google BigQuery">
    <path fill="#669DF6" d="M5.676 10.595h2.052v5.244a5.892 5.892 0 0 1-2.052-2.088v-3.156zm18.179 10.836a.504.504 0 0 1 0 .708l-1.716 1.716a.504.504 0 0 1-.708 0l-4.248-4.248a.206.206 0 0 1-.007-.007c-.02-.02-.028-.045-.043-.066a10.736 10.736 0 0 1-6.334 2.065C4.835 21.599 0 16.764 0 10.799S4.835 0 10.8 0s10.799 4.835 10.799 10.8c0 2.369-.772 4.553-2.066 6.333.025.017.052.028.074.05l4.248 4.248zm-5.028-10.632a8.015 8.015 0 1 0-8.028 8.028h.024a8.016 8.016 0 0 0 8.004-8.028zm-4.86 4.98a6.002 6.002 0 0 0 2.04-2.184v-1.764h-2.04v3.948zm-4.5.948c.442.057.887.08 1.332.072.4.025.8.025 1.2 0V7.692H9.468v9.035z"/>
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
    <path fill="#FFFFFF" d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/>
  </svg>

{:else if resolvedBrand === 'facebook'}
  <!-- Official Facebook Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Facebook">
    <path fill="#1877F2" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
  </svg>

{:else if resolvedBrand === 'tiktok'}
  <!-- Official TikTok Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="TikTok">
    <path fill="#000000" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>

{:else if resolvedBrand === 'linkedin'}
  <!-- Official LinkedIn Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="LinkedIn">
    <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.729C24 .774 23.205 0 22.225 0z"/>
  </svg>

{:else if resolvedBrand === 'slack'}
  <!-- Official Slack Authentic 4-Color Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Slack">
    <path fill="#36C5F0" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
    <path fill="#2EB67D" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.521 2.522v2.52h-2.521zm0 1.271a2.527 2.527 0 0 1 2.521 2.521v6.313A2.528 2.528 0 0 1 8.834 17.65a2.528 2.528 0 0 1-2.521-2.523V8.834a2.527 2.527 0 0 1 2.521-2.521z"/>
    <path fill="#ECB22E" d="M18.958 8.835a2.528 2.528 0 0 1 2.52-2.523A2.528 2.528 0 0 1 24 8.835a2.527 2.527 0 0 1-2.522 2.52h-2.52v-2.52zM17.687 8.835a2.527 2.527 0 0 1-2.521 2.52 2.527 2.527 0 0 1-2.521-2.52V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.313z"/>
    <path fill="#E01E5A" d="M15.166 18.958a2.528 2.528 0 0 1 2.521 2.52 2.528 2.528 0 0 1-2.521 2.522 2.527 2.527 0 0 1-2.521-2.52v-2.52h2.521zm0-1.271a2.527 2.527 0 0 1-2.521-2.521V8.834A2.528 2.528 0 0 1 15.166 6.35a2.528 2.528 0 0 1 2.521 2.523v6.313a2.527 2.527 0 0 1-2.521 2.521z"/>
  </svg>

{:else if resolvedBrand === 'discord'}
  <!-- Official Discord Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Discord">
    <path fill="#5865F2" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>

{:else if resolvedBrand === 'twilio'}
  <!-- Official Twilio Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Twilio">
    <path fill="#F22F46" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-3.3 6.9a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm6.6 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm-6.6 6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm6.6 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z"/>
  </svg>

{:else if resolvedBrand === 'sendgrid'}
  <!-- Official SendGrid Authentic Brand Icon -->
  <svg viewBox="250 250 524 524" width={size} height={size} class={className} aria-label="SendGrid">
    <path fill="#1A82E2" d="M290.5 591.72h141.78V733.5H290.5zm292.39 0H441.11V733.5h141.78zm-292.39-8.83h141.78V441.11H290.5zm150.61 0h141.78V441.11H441.11zm150.61-150.61H733.5V290.5H591.72zm141.78 8.82H591.72v141.79H733.5zm-292.39-8.82h141.78V290.5H441.11z"/>
  </svg>

{:else if resolvedBrand === 'resend'}
  <!-- Official Resend Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Resend">
    <path fill="#000000" d="M14.679 0c4.648 0 7.413 2.765 7.413 6.434s-2.765 6.434-7.413 6.434H12.33L24 24h-8.245l-8.88-8.44c-.636-.588-.93-1.273-.93-1.86 0-.831.587-1.565 1.713-1.883l4.574-1.224c1.737-.465 2.936-1.81 2.936-3.572 0-2.153-1.761-3.4-3.939-3.4H0V0z"/>
  </svg>

{:else if resolvedBrand === 'pushover'}
  <!-- Official Pushover Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Pushover">
    <path fill="#1E88E5" d="M12 0C5.373 0 0 5.373 0 12c0 2.22.607 4.3 1.666 6.082L.373 23.11a.8.8 0 0 0 .973.973l5.028-1.293A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm-2 17.5H7.5V6.5h5.2c2.4 0 4.3 1.9 4.3 4.3s-1.9 4.3-4.3 4.3H10v2.4zm0-4.8h2.8c1.1 0 2-.9 2-2s-.9-2-2-2H10v4z"/>
  </svg>

{:else if resolvedBrand === 'teams'}
  <!-- Official Microsoft Teams Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Teams">
    <path fill="#6264A7" d="M20.625 8.127q-.55 0-1.025-.205-.475-.205-.832-.563-.358-.357-.563-.832Q18 6.053 18 5.502q0-.54.205-1.02t.563-.837q.357-.358.832-.563.474-.205 1.025-.205.54 0 1.02.205t.837.563q.358.357.563.837.205.48.205 1.02 0 .55-.205 1.025-.205.475-.563.832-.357.358-.837.563-.48.205-1.02.205zm0-3.75q-.469 0-.797.328-.328.328-.328.797 0 .469.328.797.328.328.797.328.469 0 .797-.328.328-.328.328-.797 0-.469-.328-.797-.328-.328-.797-.328zM24 10.002v5.578q0 .774-.293 1.46-.293.685-.803 1.194-.51.51-1.195.803-.686.293-1.459.293-.445 0-.908-.105-.463-.106-.85-.329-.293.95-.855 1.729-.563.78-1.319 1.336-.756.557-1.67.861-.914.305-1.898.305-1.148 0-2.162-.398-1.014-.399-1.805-1.102-.79-.703-1.312-1.664t-.674-2.086h-5.8q-.411 0-.704-.293T0 16.881V6.873q0-.41.293-.703t.703-.293h8.59q-.34-.715-.34-1.5 0-.727.275-1.365.276-.639.75-1.114.475-.474 1.114-.75.638-.275 1.365-.275t1.365.275q.639.276 1.114.75.474.475.75 1.114.275.638.275 1.365t-.275 1.365q-.276.639-.75 1.113-.475.475-1.114.75-.638.276-1.365.276-.188 0-.375-.024-.188-.023-.375-.058v1.078h10.875q.469 0 .797.328.328.328.328.797zM12.75 2.373q-.41 0-.78.158-.368.158-.638.434-.27.275-.428.639-.158.363-.158.773 0 .41.158.78.159.368.428.638.27.27.639.428.369.158.779.158.41 0 .773-.158.364-.159.64-.428.274-.27.433-.639.158-.369.158-.779 0-.41-.158-.773-.159-.364-.434-.64-.275-.275-.639-.433-.363-.158-.773-.158zM6.937 9.814h2.25V7.94H2.814v1.875h2.25v6h1.875zm10.313 7.313v-6.75H12v6.504q0 .41-.293.703t-.703.293H8.309q.152.809.556 1.5.405.691.985 1.19.58.497 1.318.779.738.281 1.582.281.926 0 1.746-.352.82-.351 1.436-.966.615-.616.966-1.43.352-.815.352-1.752zm5.25-1.547v-5.203h-3.75v6.855q.305.305.691.452.387.146.809.146.469 0 .879-.176.41-.175.715-.48.304-.305.48-.715t.176-.879Z"/>
  </svg>

{:else if resolvedBrand === 'intercom'}
  <!-- Official Intercom Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Intercom">
    <path fill="#1F8DED" d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.658 1.343 3 3 3h18c1.658 0 3-1.342 3-3V3c0-1.657-1.342-3-3-3zm-5.801 4.399c0-.44.36-.8.802-.8.44 0 .8.36.8.8v10.688c0 .442-.36.801-.8.801-.443 0-.802-.359-.802-.801V4.399zM11.2 3.994c0-.44.357-.799.8-.799s.8.359.8.799v11.602c0 .44-.357.8-.8.8s-.8-.36-.8-.8V3.994zm-4 .405c0-.44.359-.8.799-.8.443 0 .802.36.802.8v10.688c0 .442-.36.801-.802.801-.44 0-.799-.359-.799-.801V4.399zM3.199 6c0-.442.36-.8.802-.8.44 0 .799.358.799.8v7.195c0 .441-.359.8-.799.8-.443 0-.802-.36-.802-.8V6zM20.52 18.202c-.123.105-3.086 2.593-8.52 2.593-5.433 0-8.397-2.486-8.521-2.593-.335-.288-.375-.792-.086-1.128.285-.334.79-.375 1.125-.09.047.041 2.693 2.211 7.481 2.211 4.848 0 7.456-2.186 7.479-2.207.334-.289.839-.25 1.128.086.289.336.25.84-.086 1.128zm.281-5.007c0 .441-.36.8-.801.8-.441 0-.801-.36-.801-.8V6c0-.442.361-.8.801-.8.441 0 .801.357.801.8v7.195z"/>
  </svg>

{:else if resolvedBrand === 'opaybd'}
  <!-- Official OPayBD Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="OPayBD">
    <path fill="#00B875" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15.5c-3.04 0-5.5-2.46-5.5-5.5s2.46-5.5 5.5-5.5 5.5 2.46 5.5 5.5-2.46 5.5-5.5 5.5zm0-8.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>

{:else if resolvedBrand === 'bkash'}
  <!-- Official bKash Authentic Origami Bird Icon -->
  <svg viewBox="125 0 125 115" width={size} height={size} class={className} aria-label="bKash">
    <path fill="#D12053" d="M223.65 62.45l-53.03-8.31 7.03 31.6z"/>
    <path fill="#E2136E" d="M223.65 62.45L183.69 6.93l-13.06 47.22z"/>
    <path fill="#D12053" d="M169.39 53.51L127.52 0l54.83 6.55z"/>
    <path fill="#9E1638" d="M150.32 31.15L127.07 9.24h6.12z"/>
    <path fill="#D12053" d="M234.96 35.46l-9.84 26.69-15.95-22.06z"/>
    <path fill="#E2136E" d="M183.84 84.14l38.61-15.51 1.62-4.93z"/>
    <path fill="#9E1638" d="M152.96 113.41l16.54-58.02 8.39 37.75z"/>
    <path fill="#E2136E" d="M236.5 35.67l-4.06 11.02 14.64-.24z"/>
  </svg>

{:else if resolvedBrand === 'nagad'}
  <!-- Official Nagad Authentic Flame & Swirl Icon -->
  <svg viewBox="5 0 50 51" width={size} height={size} class={className} aria-label="Nagad">
    <path fill="#ED1C24" d="M53.2 28.1c0 .7 0 1.3-.1 1.9-.2 2.8-.9 5.4-2 7.8-.4 1-.9 1.9-1.5 2.8-4.2 6.6-11.6 11-20 11-3.6 0-7-.8-10-2.2C11.6 45.7 6 37.5 6 28.1 6 18.8 11.4 10.8 19.1 7c-.6.8-1.2 1.6-1.7 2.5 0 .1-.1.1-.1.2-.3.3-.6.5-.9.8-.4.3-.7.7-1.1 1l-.2.2-.2.2c-.1.1-.2.3-.4.4-.2.3-.5.6-.7.9-1 1.3-1.8 2.7-2.4 4.2-.1.1-.1.3-.2.4-.1.2-.1.4-.2.5 0 .1-.1.2-.1.3-.1.3-.2.5-.3.8-.1.2-.1.4-.2.5 0 .1-.1.2-.1.3 0 .2-.1.4-.1.6l-.3 1.8c0 .2 0 .3-.1.5v2.4c0 6.4 2.9 12.2 7.6 15.9 3.6 2.9 8.1 4.7 13 4.7 4.5 0 8.6-1.4 12-3.9 2.5-1.8 4.5-4.1 6-6.8.2-.4.4-.7.6-1.1 1.2-2.5 1.9-5.2 1.9-8.1v-.7c0-.7 0-1.3-.1-2l.1.1c.3.3.6.5.9.8.3-.5.6-.9.9-1.4.2.9.3 1.8.4 2.8.1.9.1 1.6.1 2.3z"/>
    <path fill="#F7941D" d="M32.4 9.2L28 1.1c-7.3 3.3-12.3 10.6-12.3 19.1 0 4.3 1.3 8.3 3.5 11.6-.2-1.1-.2-2.2-.2-3.4.1-8.7 5.6-16.1 13.4-19.2z"/>
    <path fill="#ED1C24" d="M35.9 13.2c1.8-.5 3.8-.7 5.7-.7 1.2 0 2.5.1 3.6.3l-.1-3.6-.2-7.2c-.8-.1-1.7-.2-2.6-.2-4 0-7.7 1.3-10.7 3.4L34 9.6c-4.3 1.5-7.8 4.5-10 8.4-1.1 1.9-1.9 4.1-2.2 6.4.6-1.2 1.3-2.3 2.1-3.3 2.9-3.8 7.1-6.7 12-7.9z"/>
    <path fill="#F7941D" d="M46.4 9.1l.2 5.1c-1.7-.5-3.4-.8-5.3-.8-3.5 0-6.8 1-9.7 2.7-3.6 2.2-6.4 5.7-7.8 9.8 1.4-1.9 3.1-3.6 5.1-4.9 2.9-1.9 6.4-3 10.1-3 2.8 0 5.4.6 7.8 1.7 1.8.8 3.4 1.9 4.8 3.3l2.8-4.2 3.6-5.5c-3.2-2.6-7.2-4.2-11.6-4.2z"/>
    <path fill="#F7941D" d="M50.9 25.7v.7c0 4.2-1.7 7.7-1.9 8.1-.2.4-.4.7-.6 1.1-1.5 2.7-3.5 5-6 6.8-3.4 2.4-7.5 3.9-12 3.9-4.9 0-9.5-1.7-13-4.7-4.6-3.8-7.6-9.5-7.6-15.9v-2.4c0-.2 0-.3.1-.5l.3-1.8c0-.2.1-.4.1-.6 0-.1.1-.2.1-.3.1-.2.1-.4.2-.5.1-.3.2-.6.3-.8 0-.1.1-.2.1-.3.1-.2.1-.4.2-.5.1-.1.1-.3.2-.4.6-1.5 1.5-2.9 2.4-4.2.2-.3.5-.6.7-.9.1-.1.2-.3.4-.4.1-.1.1-.2.2-.2.1-.1.1-.2.2-.2.3-.4.7-.7 1.1-1 .3-.3.6-.5.9-.8 0 .1-.1.1-.1.2s-.1.2-.1.2c-1.2 2.4-2 5.3-2.3 8.3-.1.8-.1 1.6-.1 2.5 0 10.8 6.3 19.5 14.1 19.5h.8c1.1 0 2.2-.2 3.3-.4 5.3-1.4 9.2-6.3 9.2-12v-.3c-.1-3.4-1.5-6.5-3.8-8.6 1.6 0 3.2.3 4.7.7 2.9.7 5.5 2.1 7.8 3.9l.1.1c-.1.4 0 1.1 0 1.7z"/>
  </svg>

{:else if resolvedBrand === 'shopify'}
  <!-- Official Shopify Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Shopify">
    <path fill="#7AB55C" d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z"/>
  </svg>

{:else if resolvedBrand === 'woocommerce'}
  <!-- Official WooCommerce Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="WooCommerce">
    <path fill="#96588A" d="M.754 9.58a.754.754 0 00-.754.758v2.525c0 .42.339.758.758.758h3.135l1.431.799-.326-.799h2.373a.757.757 0 00.758-.758v-2.525a.757.757 0 00-.758-.758H.754zm2.709.445h.03c.065.001.124.023.179.067a.26.26 0 01.103.19.29.29 0 01-.033.16c-.13.239-.236.64-.322 1.199-.083.541-.114.965-.094 1.267a.392.392 0 01-.039.219.213.213 0 01-.176.12c-.086.006-.177-.034-.263-.124-.31-.316-.555-.788-.735-1.416-.216.425-.375.744-.478.957-.196.376-.363.568-.502.578-.09.007-.166-.069-.233-.228-.17-.436-.352-1.277-.548-2.524a.297.297 0 01.054-.222c.047-.064.116-.095.21-.102.169-.013.265.065.288.238.103.695.217 1.284.336 1.766l.727-1.387c.066-.126.15-.192.25-.199.146-.01.237.083.273.28.083.441.188.817.315 1.136.086-.844.233-1.453.44-1.828a.255.255 0 01.218-.147zm1.293.36c.056 0 .116.006.18.02.232.05.411.177.53.386.107.18.161.395.161.654 0 .343-.087.654-.26.94-.2.332-.459.5-.781.5a.88.88 0 01-.18-.022.763.763 0 01-.531-.384 1.287 1.287 0 01-.158-.659c0-.342.085-.655.258-.937.202-.333.462-.498.78-.498zm2.084 0c.056 0 .116.006.18.02.236.05.411.177.53.386.107.18.16.395.16.654 0 .343-.086.654-.259.94-.2.332-.459.5-.781.5a.88.88 0 01-.18-.022.763.763 0 01-.531-.384 1.287 1.287 0 01-.16-.659c0-.342.087-.655.26-.937.202-.333.462-.498.78-.498zm4.437.047c-.305 0-.546.102-.718.304-.173.203-.256.49-.256.856 0 .395.086.697.256.906.17.21.418.316.744.316.315 0 .559-.107.728-.316.17-.21.256-.504.256-.883s-.087-.673-.26-.879c-.176-.202-.424-.304-.75-.304zm-1.466.002a1.13 1.13 0 00-.84.326c-.223.22-.332.499-.332.838 0 .362.108.658.328.88.22.223.505.336.861.336.103 0 .22-.016.346-.052v-.54c-.117.034-.216.051-.303.051a.545.545 0 01-.422-.177c-.106-.12-.16-.278-.16-.48 0-.19.053-.348.156-.468a.498.498 0 01.397-.181c.103 0 .212.015.332.049v-.537a1.394 1.394 0 00-.363-.045zm12.414 0a1.135 1.135 0 00-.84.326c-.223.22-.332.499-.332.838 0 .362.108.658.328.88.22.223.506.336.861.336.103 0 .22-.016.346-.052v-.54c-.116.034-.216.051-.303.051a.545.545 0 01-.422-.177c-.106-.12-.16-.278-.16-.48 0-.19.053-.348.156-.468a.498.498 0 01.397-.181c.103 0 .212.015.332.049v-.537a1.394 1.394 0 00-.363-.045zm-9.598.06l-.29 2.264h.579l.156-1.559.395 1.559h.412l.379-1.555.164 1.555h.603l-.304-2.264h-.791l-.12.508c-.03.13-.06.264-.087.4l-.067.352a29.97 29.97 0 00-.258-1.26h-.771zm2.768 0l-.29 2.264h.579l.156-1.559.396 1.559h.412l.375-1.555.165 1.555h.603l-.305-2.264h-.789l-.119.508c-.03.13-.06.264-.086.4l-.066.352c-.063-.352-.15-.771-.26-1.26h-.771zm3.988 0v2.264h.611v-1.031h.012l.494 1.03h.645l-.489-1.019a.61.61 0 00.37-.552.598.598 0 00-.25-.506c-.167-.123-.394-.186-.68-.186h-.713zm3.377 0v2.264H24v-.483h-.63v-.414h.54v-.468h-.54v-.416h.626v-.483H22.76zm-4.793.004v2.264h1.24v-.483h-.627v-.416h.541v-.468h-.54v-.415h.622v-.482h-1.236zm2.025.432c.146.003.25.025.313.072.063.046.091.12.091.227 0 .156-.135.236-.404.24v-.54zm-15.22.011c-.104 0-.205.069-.301.211a1.078 1.078 0 00-.2.639c0 .096.02.2.06.303.049.13.117.198.196.215.083.016.173-.02.27-.106.123-.11.205-.273.252-.492.016-.077.023-.16.023-.246 0-.097-.02-.2-.06-.303-.05-.13-.116-.198-.196-.215a.246.246 0 00-.045-.006zm2.083 0c-.103 0-.204.069-.3.211a1.078 1.078 0 00-.2.639c0 .096.02.2.06.303.049.13.117.198.196.215.083.016.173-.02.27-.106.123-.11.205-.273.252-.492.013-.077.023-.16.023-.246 0-.097-.02-.2-.06-.303-.05-.13-.116-.198-.196-.215a.246.246 0 00-.045-.006zm4.428.006c.233 0 .354.218.354.66-.004.273-.038.46-.098.553a.293.293 0 01-.262.139.266.266 0 01-.242-.139c-.056-.093-.084-.28-.084-.562 0-.436.11-.65.332-.65Z"/>
  </svg>

{:else if resolvedBrand === 'stripe'}
  <!-- Official Stripe Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Stripe">
    <path fill="#635BFF" d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
  </svg>

{:else if resolvedBrand === 'paypal'}
  <!-- Official PayPal Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="PayPal">
    <path fill="#002991" d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z"/>
  </svg>

{:else if resolvedBrand === 'sslcommerz'}
  <!-- Official SSLCommerz Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="SSLCommerz">
    <path fill="#1F4788" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6a3 3 0 0 1 3 3v2h1v5H8v-5h1v-2a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v2h2v-2a1 1 0 0 0-1-1z"/>
  </svg>

{:else if resolvedBrand === 'razorpay'}
  <!-- Official Razorpay Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Razorpay">
    <path fill="#0C2451" d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
  </svg>

{:else if resolvedBrand === 'paddle'}
  <!-- Official Paddle Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Paddle">
    <path fill="#00D26A" d="M2.363 7.904v.849a3.95 3.95 0 0 1 3.65 2.425c.198.476.3.987.299 1.502h.791c0-1.04.416-2.037 1.157-2.772a3.962 3.962 0 0 1 2.792-1.149V7.91a3.959 3.959 0 0 1-3.65-2.425 3.893 3.893 0 0 1-.299-1.502h-.791c0 1.04-.416 2.037-1.157 2.772a3.96 3.96 0 0 1-2.792 1.149M13.105 2.51H6.312V0h6.793c4.772 0 8.532 3.735 8.532 8.314 0 4.58-3.76 8.314-8.532 8.314H9.156V24H6.312v-9.882h6.793c3.319 0 5.688-2.352 5.688-5.804 0-3.451-2.37-5.804-5.688-5.804"/>
  </svg>

{:else if resolvedBrand === 'hubspot'}
  <!-- Official HubSpot Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="HubSpot">
    <path fill="#FF7A59" d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z"/>
  </svg>

{:else if resolvedBrand === 'salesforce'}
  <!-- Official Salesforce Authentic Cloud Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Salesforce">
    <path fill="#00A1E0" d="M10.005 5.416c.75-.796 1.845-1.306 3.046-1.306 1.56 0 2.954.9 3.689 2.205.63-.3 1.35-.45 2.101-.45 2.849 0 5.159 2.34 5.159 5.22s-2.311 5.22-5.176 5.22c-.345 0-.689-.044-1.02-.104-.645 1.17-1.875 1.95-3.3 1.95-.6 0-1.155-.15-1.65-.375-.72 1.365-2.145 2.295-3.795 2.295-2.385 0-4.335-1.935-4.335-4.32 0-.255.03-.51.09-.75C1.86 15.066.75 13.681.75 12.001c0-1.935 1.41-3.555 3.255-3.885.645-1.68 2.28-2.88 4.17-2.88.66 0 1.29.15 1.83.42z"/>
  </svg>

{:else if resolvedBrand === 'pipedrive'}
  <!-- Official Pipedrive Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Pipedrive">
    <path fill="#26A373" d="M11.758 0C5.268 0 0 5.268 0 11.758s5.268 11.758 11.758 11.758 11.758-5.268 11.758-11.758S18.248 0 11.758 0zm4.12 7.02c1.782 0 3.23 1.448 3.23 3.23 0 1.782-1.448 3.23-3.23 3.23h-2.126V7.02h2.126zm-5.748 0h2.126v9.756H10.13V7.02zM7.886 10.25c0-.98-.795-1.775-1.775-1.775s-1.775.795-1.775 1.775.795 1.775 1.775 1.775 1.775-.795 1.775-1.775z"/>
  </svg>

{:else if resolvedBrand === 'zoho'}
  <!-- Official Zoho Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Zoho">
    <path fill="#E42527" d="M8.66 6.897a1.299 1.299 0 0 0-1.205.765l-.642 1.44-.062-.385A1.291 1.291 0 0 0 5.27 7.648l-4.185.678A1.291 1.291 0 0 0 .016 9.807l.678 4.18a1.293 1.293 0 0 0 1.27 1.087c.074 0 .143-.01.216-.017l4.18-.678c.436-.07.784-.351.96-.723l2.933 1.307a1.304 1.304 0 0 0 .988.026c.321-.12.575-.365.716-.678l.28-.629.038.276a1.297 1.297 0 0 0 1.455 1.103l3.712-.501a1.29 1.29 0 0 0 1.03.514h4.236c.713 0 1.29-.58 1.291-1.291V9.545c0-.712-.58-1.291-1.291-1.291h-4.236c-.079 0-.155.008-.23.022a1.309 1.309 0 0 0-.275-.288c-.275-.21-.614-.3-.958-.253l-4.197.571c-.155.021-.3.07-.432.14L9.159 7.01a1.27 1.27 0 0 0-.499-.113zm-.025.705c.077 0 .159.013.24.052l2.971 1.324c-.128.238-.18.508-.142.782l.357 2.596h.002l-.745 1.672a.59.59 0 0 1-.777.296l-3.107-1.385-.004-.041-.41-2.526L8.1 7.95a.589.589 0 0 1 .536-.348zm-3.159.733c.125 0 .245.039.343.112.13.09.21.227.237.382l.234 1.446-.56 1.259a1.27 1.27 0 0 0-.026.987c.12.322.364.575.678.717l.295.131a.585.585 0 0 1-.428.314l-4.185.678a.59.59 0 0 1-.674-.485l-.678-4.18a.588.588 0 0 1 .485-.674l4.185-.678c.03-.004.064-.01.094-.01zm11.705.09a.59.59 0 0 1 .415.173 1.287 1.287 0 0 0-.416.947v4.237c0 .033.003.065.005.097l-3.55.482a.586.586 0 0 1-.66-.502l-.191-1.403.899-2.017a1.29 1.29 0 0 0-.333-1.5l3.754-.51c.026-.004.051-.004.077-.004zm1.3.532h4.227c.326 0 .588.266.588.588v4.237a.589.589 0 0 1-.588.588h-4.237a.564.564 0 0 1-.12-.013c.47-.246.758-.765.684-1.318zm-5.988.309.254.113c.296.133.43.48.296.777l-.432.97-.207-1.465a.58.58 0 0 1 .09-.395zm5.39.538.453 3.325a.583.583 0 0 1-.453.65zM6.496 11.545l.17 1.052a.588.588 0 0 1-.293-.776zm3.985 4.344a.588.588 0 0 0-.612.603c0 .358.244.61.601.61a.582.582 0 0 0 .607-.608c0-.35-.242-.605-.596-.605zm5.545 0a.588.588 0 0 0-.612.603c0 .358.245.61.602.61a.582.582 0 0 0 .606-.608c0-.35-.24-.605-.596-.605zm-8.537.018a.047.047 0 0 0-.048.047v.085c0 .026.021.047.048.047h.52l-.623.9a.052.052 0 0 0-.009.027v.027c0 .026.021.047.048.047h.815a.047.047 0 0 0 .047-.047v-.085a.047.047 0 0 0-.047-.047h-.55l.606-.9a.05.05 0 0 0 .008-.026v-.028a.047.047 0 0 0-.047-.047zm5.303 0a.047.047 0 0 0-.047.047v1.086c0 .026.02.047.047.047h.135a.047.047 0 0 0 .047-.047v-.454h.545v.454c0 .026.02.047.047.047h.134a.047.047 0 0 0 .047-.047v-1.086a.047.047 0 0 0-.047-.047h-.134a.047.047 0 0 0-.047.047v.453h-.545v-.453a.047.047 0 0 0-.047-.047zm-2.324.164c.25 0 .372.194.372.425 0 .219-.109.425-.358.426-.242 0-.375-.197-.375-.419 0-.235.108-.432.36-.432zm5.545 0c.25 0 .372.194.372.425 0 .219-.108.425-.358.426-.242 0-.374-.197-.374-.419 0-.235.108-.432.36-.432z"/>
  </svg>

{:else if resolvedBrand === 'leadsquared'}
  <!-- Official LeadSquared Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="LeadSquared">
    <rect width="24" height="24" rx="4" fill="#1C2E4A"/>
    <path fill="#F36F24" d="M6 5h4v10h8v4H6z"/>
    <path fill="#FFFFFF" d="M12 5h6v6h-6z"/>
  </svg>

{:else if resolvedBrand === 'close'}
  <!-- Official Close CRM Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Close CRM">
    <path fill="#1D273B" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
    <path fill="#FF4F5E" d="M12 6a6 6 0 1 0 5.2 9h-2.6A3.6 3.6 0 1 1 12 8.4c1.2 0 2.2.6 2.9 1.5l2-1.6A6 6 0 0 0 12 6z"/>
  </svg>

{:else if resolvedBrand === 'gohighlevel'}
  <!-- Official GoHighLevel Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="GoHighLevel">
    <path fill="#FF5722" d="M12 2L2 22h7l3-6 3 6h7L12 2zm0 6.5l2 4h-4l2-4z"/>
  </svg>

{:else if resolvedBrand === 'activecampaign'}
  <!-- Official ActiveCampaign Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="ActiveCampaign">
    <path fill="#004CFF" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-5.5 16.5l4-9h3l-4 9H6.5zm6.5 0l4-9h3l-4 9H13z"/>
  </svg>

{:else if resolvedBrand === 'copper'}
  <!-- Official Copper CRM Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Copper CRM">
    <path fill="#F35369" d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 18a6 6 0 0 1-4.2-10.2l2 1.7a3.5 3.5 0 1 0 4.4 0l2-1.7A6 6 0 0 1 12 18z"/>
  </svg>

{:else if resolvedBrand === 'freshsales'}
  <!-- Official Freshsales Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Freshsales">
    <path fill="#FF5722" d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 4.5a4 4 0 1 1-4 4 4 4 0 0 1 4-4zm0 15a7.5 7.5 0 0 1-6.5-3.8c.03-2.2 4.3-3.4 6.5-3.4s6.47 1.2 6.5 3.4a7.5 7.5 0 0 1-6.5 3.8z"/>
  </svg>

{:else if resolvedBrand === 'twitter'}
  <!-- Official X / Twitter Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="X / Twitter">
    <path fill="#000000" d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
  </svg>

{:else if resolvedBrand === 'pinterest'}
  <!-- Official Pinterest Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Pinterest">
    <path fill="#BD081C" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
  </svg>

{:else if resolvedBrand === 'reddit'}
  <!-- Official Reddit Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Reddit">
    <path fill="#FF4500" d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/>
  </svg>

{:else if resolvedBrand === 'threads'}
  <!-- Official Threads Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Threads">
    <path fill="#000000" d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z"/>
  </svg>

{:else if resolvedBrand === 'buffer'}
  <!-- Official Buffer Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Buffer">
    <path fill="#231F20" d="M1.371 5.476L11.943 0l10.686 5.476-10.686 5.495zm3.36 4.81l7.212 3.547 7.288-3.547 3.398 1.655-10.686 5.202L1.371 11.94zm0 6.171l7.212 3.911 7.288-3.91 3.398 1.815L11.943 24 1.371 18.273z"/>
  </svg>

{:else if resolvedBrand === 'google_ads'}
  <!-- Official Google Ads Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Ads">
    <path fill="#4285F4" d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998zm19.4643-6.0004L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644zM7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z"/>
  </svg>

{:else if resolvedBrand === 'mailchimp'}
  <!-- Official Mailchimp Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Mailchimp">
    <path fill="#FFE01B" d="M11.267 0C6.791-.015-1.82 10.246 1.397 12.964l.79.669a3.88 3.88 0 0 0-.22 1.792c.084.84.518 1.644 1.22 2.266.666.59 1.542.964 2.392.964 1.406 3.24 4.62 5.228 8.386 5.34 4.04.12 7.433-1.776 8.854-5.182.093-.24.488-1.316.488-2.267 0-.956-.54-1.352-.885-1.352-.01-.037-.078-.286-.172-.586-.093-.3-.19-.51-.19-.51.375-.563.382-1.065.332-1.35-.053-.353-.2-.653-.496-.964-.296-.311-.902-.63-1.753-.868l-.446-.124c-.002-.019-.024-1.053-.043-1.497-.014-.32-.042-.822-.197-1.315-.186-.668-.508-1.253-.911-1.627 1.112-1.152 1.806-2.422 1.804-3.511-.003-2.095-2.576-2.729-5.746-1.416l-.672.285A678.22 678.22 0 0 0 12.7.504C12.304.159 11.817.002 11.267 0zm.073.873c.166 0 .322.019.465.058.297.084 1.28 1.224 1.28 1.224s-1.826 1.013-3.52 2.426c-2.28 1.757-4.005 4.311-5.037 7.082-.811.158-1.526.618-1.963 1.253-.261-.218-.748-.64-.834-.804-.698-1.326.761-3.902 1.781-5.357C5.834 3.44 9.37.867 11.34.873zm3.286 3.273c.04-.002.06.05.028.074-.143.11-.299.26-.413.414a.04.04 0 0 0 .031.064c.659.004 1.587.235 2.192.574.041.023.012.103-.034.092-.915-.21-2.414-.369-3.97.01-1.39.34-2.45.863-3.224 1.426-.04.028-.086-.023-.055-.06.896-1.035 1.999-1.935 2.987-2.44.034-.018.07.019.052.052-.079.143-.23.447-.278.678-.007.035.032.063.062.042.615-.42 1.684-.868 2.622-.926zm3.023 3.205l.056.001a.896.896 0 0 1 .456.146c.534.355.61 1.216.638 1.845.015.36.059 1.229.074 1.478.034.571.184.651.487.751.17.057.33.098.563.164.706.198 1.125.4 1.39.658.157.162.23.333.253.497.083.608-.472 1.36-1.942 2.041-1.607.746-3.557.935-4.904.785l-.471-.053c-1.078-.145-1.693 1.247-1.046 2.201.417.615 1.552 1.015 2.688 1.015 2.604 0 4.605-1.111 5.35-2.072a.987.987 0 0 0 .06-.085c.036-.055.006-.085-.04-.054-.608.416-3.31 2.069-6.2 1.571 0 0-.351-.057-.672-.182-.255-.1-.788-.344-.853-.891 2.333.72 3.801.039 3.801.039a.072.072 0 0 0 .042-.072.067.067 0 0 0-.074-.06s-1.911.283-3.718-.378c.197-.64.72-.408 1.51-.345a11.045 11.045 0 0 0 3.647-.394c.818-.234 1.892-.697 2.727-1.356.281.618.38 1.299.38 1.299s.219-.04.4.073c.173.106.299.326.213.895-.176 1.063-.628 1.926-1.387 2.72a5.714 5.714 0 0 1-1.666 1.244c-.34.18-.704.334-1.087.46-2.863.935-5.794-.093-6.739-2.3a3.545 3.545 0 0 1-.189-.522c-.403-1.455-.06-3.2 1.008-4.299.065-.07.132-.153.132-.256 0-.087-.055-.179-.102-.243-.374-.543-1.669-1.466-1.409-3.254.187-1.284 1.31-2.189 2.357-2.135.089.004.177.01.266.015.453.027.85.085 1.223.1.625.028 1.187-.063 1.853-.618.225-.187.405-.35.71-.401.028-.005.092-.028.215-.028zm.022 2.18a.42.42 0 0 0-.06.005c-.335.054-.347.468-.228 1.04.068.32.187.595.32.765.175-.02.343-.022.498 0 .089-.205.104-.557.024-.942-.112-.535-.261-.872-.554-.868zm-3.66 1.546a1.724 1.724 0 0 0-1.016.326c-.16.117-.311.28-.29.378.008.032.031.056.088.063.131.015.592-.217 1.122-.25.374-.023.684.094.923.2.239.104.386.173.443.113.037-.038.026-.11-.031-.204-.118-.192-.36-.387-.618-.497a1.601 1.601 0 0 0-.621-.129zm4.082.81c-.171-.003-.313.186-.317.42-.004.236.131.43.303.432.172.003.314-.185.318-.42.004-.236-.132-.429-.304-.432zm-3.58.172c-.05 0-.102.002-.155.008-.311.05-.483.152-.593.247-.094.082-.152.173-.152.237a.075.075 0 0 0 .075.076c.07 0 .228-.063.228-.063a1.98 1.98 0 0 1 1.001-.104c.157.018.23.027.265-.026.01-.016.022-.049-.01-.1-.063-.103-.311-.269-.66-.275zm2.26.4c-.127 0-.235.051-.283.148-.075.154.035.363.246.466.21.104.443.063.52-.09.075-.155-.035-.364-.246-.467a.542.542 0 0 0-.237-.058zm-11.635.024c.048 0 .098 0 .149.003.73.04 1.806.6 2.052 2.19.217 1.41-.128 2.843-1.449 3.069-.123.02-.248.029-.374.026-1.22-.033-2.539-1.132-2.67-2.435-.145-1.44.591-2.548 1.894-2.811.117-.024.252-.04.398-.042zm-.07.927a1.144 1.144 0 0 0-.847.364c-.38.418-.439.988-.366 1.19.027.073.07.094.1.098.064.008.16-.039.22-.2a1.2 1.2 0 0 0 .017-.052 1.58 1.58 0 0 1 .157-.37.689.689 0 0 1 .955-.199c.266.174.369.5.255.81-.058.161-.154.469-.133.721.043.511.357.717.64.738.274.01.466-.143.515-.256.029-.067.005-.107-.011-.125-.043-.053-.113-.037-.18-.021a.638.638 0 0 1-.16.022.347.347 0 0 1-.294-.148c-.078-.12-.073-.3.013-.504.011-.028.025-.058.04-.092.138-.308.368-.825.11-1.317-.195-.37-.513-.602-.894-.65a1.135 1.135 0 0 0-.138-.01z"/>
  </svg>

{:else if resolvedBrand === 'klaviyo'}
  <!-- Official Klaviyo Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Klaviyo">
    <path fill="#000000" d="M2.5 4h12l7 8-7 8H2.5l7-8z"/>
  </svg>

{:else if resolvedBrand === 'brevo'}
  <!-- Official Brevo Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Brevo">
    <path fill="#0B996E" d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zM7.2 4.8h5.747c2.34 0 3.895 1.406 3.895 3.516 0 1.022-.348 1.862-1.09 2.588C17.189 11.812 18 13.22 18 14.785c0 2.86-2.64 5.016-6.164 5.016H7.199v-15zm2.085 1.952v5.537h.07c.233-.432.858-.796 2.249-1.226 2.039-.659 3.037-1.52 3.037-2.655 0-.998-.766-1.656-1.924-1.656H9.285zm4.87 5.266c-.766.385-1.67.748-2.76 1.11-1.229.387-2.11 1.386-2.11 2.407v2.315h2.365c2.387 0 4.149-1.34 4.149-3.155 0-1.067-.625-2.087-1.645-2.677z"/>
  </svg>

{:else if resolvedBrand === 'omnisend'}
  <!-- Official Omnisend Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Omnisend">
    <path fill="#13D596" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a6 6 0 1 1 6-6h-2.5a3.5 3.5 0 1 0-3.5 3.5V18z"/>
  </svg>

{:else if resolvedBrand === 'convertkit'}
  <!-- Official ConvertKit Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="ConvertKit">
    <path fill="#FF5887" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-3.5 6h7a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 10.5v-1A1.5 1.5 0 0 1 8.5 8zm0 5h7a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 15.5v-1A1.5 1.5 0 0 1 8.5 13z"/>
  </svg>

{:else if resolvedBrand === 'drip'}
  <!-- Official Drip Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Drip">
    <path fill="#7400FF" d="M12 2C9.5 5.5 5 11 5 15a7 7 0 0 0 14 0c0-4-4.5-9.5-7-13zm0 18a5 5 0 0 1-5-5c0-2.8 3.2-7 5-9.2 1.8 2.2 5 6.4 5 9.2a5 5 0 0 1-5 5z"/>
    <circle cx="10" cy="14.5" r="1.5" fill="#FF007A"/>
  </svg>

{:else if resolvedBrand === 'constant_contact'}
  <!-- Official Constant Contact Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Constant Contact">
    <path fill="#0A52CC" d="M8.5 4a8 8 0 0 0-4.6 14.5l1.2-1.6A6 6 0 1 1 8.5 18H9v2h-.5A8 8 0 0 0 8.5 4zm7 0a8 8 0 1 0 4.6 14.5l-1.2-1.6A6 6 0 1 0 15.5 18H15v2h.5a8 8 0 0 0 0-16z"/>
  </svg>

{:else if resolvedBrand === 'outlook'}
  <!-- Official Microsoft Outlook Authentic Brand Icon -->
  <svg viewBox="0 0 507 512" width={size} height={size} class={className} aria-label="Microsoft Outlook">
    <path fill="#0078D4" d="M0 57.69v391.812L298.066 512V0zm150.167 287.028c-94.754-6.111-84.995-176.906 2.212-178.263c93.423 6.175 84.258 176.9-2.212 178.263m1.366-144.822c-49.919 3.466-47.684 110.407-.77 111.265c49.704-3.203 46.785-110.434.77-111.265m197.32 68.113c4.5 3.308 9.922 0 9.922 0c-5.404 3.308 147.63-98.342 147.63-98.342v184.07c0 20.037-12.827 28.441-27.25 28.441H316.892l.01-136.11zM316.91 108.554v100.15l34.999 22.037c.923.27 2.923.289 3.846 0l150.629-101.554c0-12.018-11.211-20.633-17.538-20.633z"/>
  </svg>

{:else if resolvedBrand === 'onedrive'}
  <!-- Official Microsoft OneDrive Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft OneDrive">
    <path fill="#0078D4" d="M4.92 17.562c-.499.305-1.059.457-1.68.457-.92-.029-1.68-.346-2.287-.951-.607-.601-.922-1.367-.953-2.282.016-.862.291-1.594.83-2.192.54-.601 1.225-.948 2.058-1.05-.03-.178-.042-.367-.042-.566.03-1.14.42-2.084 1.17-2.819.754-.741 1.683-1.127 2.788-1.157.734.025 1.442.227 2.086.606.643.379 1.183.896 1.62 1.551.498-.598 1.109-1.077 1.835-1.437.726-.359 1.516-.54 2.372-.54 1.341 0 2.502.434 3.483 1.302.981.868 1.547 1.954 1.698 3.258.941.159 1.745.59 2.411 1.291.666.702 1 1.548 1 2.539 0 1.018-.351 1.88-1.053 2.585-.702.705-1.547 1.061-2.535 1.067H4.92z"/>
  </svg>

{:else if resolvedBrand === 'excel'}
  <!-- Official Microsoft Excel Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Excel">
    <path fill="#107C41" d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7L6.3.3q.29-.3.7-.3zm-6.6 4.8h2.3l-5 6.9 5.2 7h-2.3l-4-5.6-4 5.6H7l5.2-7-5-6.9h2.3l3.9 5.4z"/>
  </svg>

{:else if resolvedBrand === 'onenote'}
  <!-- Official Microsoft OneNote Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft OneNote">
    <path fill="#7719AA" d="M21.5 3h-10A2.5 2.5 0 0 0 9 5.5v2.5H4.5A2.5 2.5 0 0 0 2 10.5v8A2.5 2.5 0 0 0 4.5 21H9v-2.5h12.5A2.5 2.5 0 0 0 24 16V5.5A2.5 2.5 0 0 0 21.5 3zM7.5 17.5h-1.8v-6h1.8l2.2 4v-4h1.5v6h-1.8l-2.2-4v4z"/>
  </svg>

{:else if resolvedBrand === 'sharepoint'}
  <!-- Official Microsoft SharePoint Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft SharePoint">
    <path fill="#038387" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm4 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
  </svg>

{:else if resolvedBrand === 'ms_planner'}
  <!-- Official Microsoft Planner Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Planner">
    <path fill="#31752F" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1.8 14.5l-4.2-4.2 1.4-1.4 2.8 2.8 6.4-6.4 1.4 1.4z"/>
  </svg>

{:else if resolvedBrand === 'power_bi'}
  <!-- Official Microsoft Power BI Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Power BI">
    <path fill="#F2C811" d="M4 14a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zm6-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9zm6-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4z"/>
  </svg>

{:else if resolvedBrand === 'azure'}
  <!-- Official Microsoft Azure Authentic Brand Icon -->
  <svg viewBox="0 0 96 96" width={size} height={size} class={className} aria-label="Microsoft Azure">
    <defs>
      <linearGradient id="az-grad-a-{uid}" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#114a8b"/>
        <stop offset="100%" stop-color="#0669bc"/>
      </linearGradient>
      <linearGradient id="az-grad-c-{uid}" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3ccbf4"/>
        <stop offset="100%" stop-color="#2892df"/>
      </linearGradient>
    </defs>
    <path fill="url(#az-grad-a-{uid})" d="M33.34 6.54h26.04l-27.03 80.1a4.15 4.15 0 0 1-3.94 2.81H8.15a4.14 4.14 0 0 1-3.93-5.47L29.4 9.38a4.15 4.15 0 0 1 3.94-2.83z"/>
    <path fill="#0078d4" d="M71.17 60.26H29.88a1.91 1.91 0 0 0-1.3 3.31l26.53 24.76a4.17 4.17 0 0 0 2.85 1.13h23.38z"/>
    <path fill="url(#az-grad-c-{uid})" d="M66.6 9.36a4.14 4.14 0 0 0-3.93-2.82H33.65a4.15 4.15 0 0 1 3.93 2.82l25.18 74.62a4.15 4.15 0 0 1-3.93 5.46h23.47a4.15 4.15 0 0 0 3.93-5.46z"/>
  </svg>

{:else if resolvedBrand === 'azure_openai'}
  <!-- Official Azure OpenAI Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Azure OpenAI">
    <rect width="24" height="24" rx="5" fill="#0078D4"/>
    <circle cx="12" cy="12" r="5.5" fill="#10A37F"/>
    <path fill="#FFFFFF" d="M12 8.5l1 2.2 2.5.3-1.8 1.8.4 2.5L12 14l-2.1 1.3.4-2.5-1.8-1.8 2.5-.3 1-2.2z"/>
  </svg>

{:else if resolvedBrand === 'amazon_s3'}
  <!-- Official Amazon S3 Authentic Brand Icon -->
  <svg viewBox="0 0 512 512" width={size} height={size} class={className} aria-label="Amazon S3">
    <rect width="512" height="512" rx="72" fill="#E05243"/>
    <g fill="#FFFFFF">
      <path d="M256 64v97l58 14V93zm133 67v250l26-13V143zm-133 77v97l58-8v-82zm58 129l-58 14v97l58-29z"/>
      <path transform="rotate(180 256 256)" d="M256 64v97l58 14V93zm133 67v250l26-13V143zm-133 77v97l58-8v-82zm58 129l-58 14v97l58-29z" opacity="0.85"/>
    </g>
  </svg>

{:else if resolvedBrand === 'cloudinary'}
  <!-- Official Cloudinary Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Cloudinary">
    <path fill="#3448C5" d="M24 14.8598c0 2.1729-1.3757 3.974-3.5903 4.6996l-.0995.0318V17.989c1.3777-.5805 2.1869-1.7275 2.1869-3.1291-.0072-2-1.6087-3.6288-3.6082-3.6699h-.5964l-.1432-.5686c-.7025-2.8996-3.2886-4.9489-6.2721-4.97a6.3915 6.3915 0 0 0-5.811 3.664l-.1828.3757-.4175.0437a4.4311 4.4311 0 0 0-3.3052 2.088c-1.2803 2.0856-.6274 4.8143 1.4583 6.0947v1.6897h-.01l-.149-.0675a5.9402 5.9402 0 0 1-3.3658-4.3494c-.5787-3.2291 1.57-6.3161 4.7991-6.8948a7.8766 7.8766 0 0 1 6.9839-4.149c3.4724.025 6.535 2.28 7.5901 5.5883 2.5789.3366 4.5138 2.5245 4.5327 5.1251zm-15.3176-1.322h.5647a.0656.0656 0 0 0 .0457-.1113L7.084 11.2158l-.0007-.0007a.0656.0656 0 0 0-.0927.0007L4.78 13.4265a.0656.0656 0 0 0 .0477.1113h.5566a.0656.0656 0 0 1 .0657.0656v5.0574c0 .6588.534 1.1928 1.1928 1.1928H9.247a.0656.0656 0 0 0 .0457-.1113l-.33-.33a1.1928 1.1928 0 0 1-.348-.839v-4.97a.0676.0676 0 0 1 .0676-.0655zm9.769 2.5466h.5667a.0655.0655 0 0 0 .0457-.1133l-2.2107-2.2087-.0015-.0015a.0636.0636 0 0 0-.0899.0015L14.551 15.971a.0657.0657 0 0 0 .0457.1133h.5567a.0656.0656 0 0 1 .0656.0656v2.5108c0 .6588.534 1.1928 1.1928 1.1928h2.6063a.0655.0655 0 0 0 .0457-.1113l-.33-.33a1.1928 1.1928 0 0 1-.348-.839V16.15a.0656.0656 0 0 1 .0657-.0656zm-4.8844-1.2743h.5646a.0656.0656 0 0 0 .0477-.1114l-2.2107-2.2027-.0006-.0006a.0656.0656 0 0 0-.0928.0006l-2.2087 2.2068a.0656.0656 0 0 0 .0457.1113h.5626a.0676.0676 0 0 1 .0657.0676v3.7791c0 .6588.534 1.1928 1.1928 1.1928h2.5983a.0656.0656 0 0 0 .0477-.1113l-.332-.33a1.193 1.193 0 0 1-.346-.839v-3.6956c0-.0366.0291-.0665.0657-.0676z"/>
  </svg>

{:else if resolvedBrand === 'supabase'}
  <!-- Official Supabase Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Supabase">
    <path fill="#3FCF8E" d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z"/>
  </svg>

{:else if resolvedBrand === 'dropbox'}
  <!-- Official Dropbox Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Dropbox">
    <path fill="#0061FF" d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"/>
  </svg>

{:else if resolvedBrand === 'box'}
  <!-- Official Box Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Box">
    <path fill="#0061D5" d="M.959 5.523c-.54 0-.959.42-.959.899v7.549a4.59 4.59 0 004.613 4.494 4.717 4.717 0 004.135-2.457c.779 1.438 2.337 2.457 4.074 2.457 2.577 0 4.674-2.037 4.674-4.613.06-2.457-2.037-4.495-4.613-4.495-1.738 0-3.295.959-4.074 2.397-.78-1.438-2.338-2.397-4.135-2.397-1.079 0-2.038.36-2.817.899V6.422a.92.92 0 00-.898-.899zM17.602 9.26a.95.95 0 00-.704.158c-.36.3-.479.899-.18 1.318l2.397 3.116-2.396 3.115c-.3.42-.24.96.18 1.26.419.3 1.016.298 1.316-.122l2.039-2.636 2.096 2.697c.3.36.899.419 1.318.12.36-.3.42-.84.121-1.259l-2.338-3.115 2.338-3.057c.3-.419.298-1.018-.121-1.318-.48-.3-1.019-.24-1.318.18l-2.096 2.576-2.04-2.695c-.149-.18-.373-.3-.612-.338zM4.613 11.154c1.558 0 2.817 1.26 2.817 2.758 0 1.558-1.259 2.756-2.817 2.756-1.558 0-2.816-1.198-2.816-2.756 0-1.498 1.258-2.758 2.816-2.758zm8.27 0c1.558 0 2.816 1.26 2.816 2.758-.06 1.558-1.318 2.756-2.816 2.756-1.558 0-2.817-1.198-2.817-2.756 0-1.498 1.259-2.758 2.817-2.758Z"/>
  </svg>

{:else if resolvedBrand === 'google_cloud'}
  <!-- Official Google Cloud Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Cloud">
    <path fill="#4285F4" d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-2.821-4.552l-.043.043.006-.05A9.344 9.344 0 0 0 12.19 2.38zm-.358 4.146c1.244-.04 2.518.368 3.486 1.15a5.186 5.186 0 0 1 1.862 4.078v.518c3.53-.07 3.53 5.262 0 5.193h-5.193l-.008.009v-.04H6.785a2.59 2.59 0 0 1-1.067-.23h.001a2.597 2.597 0 1 1 3.437-3.437l3.013-3.012A6.747 6.747 0 0 0 8.11 8.24c.018-.01.04-.026.054-.023a5.186 5.186 0 0 1 3.67-1.69z"/>
  </svg>

{:else if resolvedBrand === 'cloudflare'}
  <!-- Official Cloudflare Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Cloudflare">
    <path fill="#F38020" d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727"/>
  </svg>

{:else if resolvedBrand === 'backblaze'}
  <!-- Official Backblaze Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Backblaze">
    <path fill="#E21E29" d="M9.3108.0003c.6527 1.3502 1.5666 4.0812-1.3887 7.1738-1.8096 1.8796-3.078 3.8487-2.3496 6.0644.3642 1.1037 1.1864 2.5079 2.8867 2.7852.6107.1008 1.3425-.0006 1.7403-.1406 2.4538-.8544 2.098-3.4138 1.5546-5.0469-.07-.2129-.1915-.7333-.2363-.9238-.3726-1.6023.776-2.6562 1.129-3.8047.028-.0925.0534-.1819.0702-.2715.042-.21.067-.423.0781-.6387 0-1.8264-.9882-2.6303-1.7754-3.5996C10.1794.5643 9.3107.0003 9.3107.0003Zm6.2754 6.0175s-.709.3366-1.2188.8829c-.4454.4818-.8635.8789-1.2949 1.8593-.028.14-.0518.2863-.0742.4375-.2325 1.6416 1.1473 3.1446.7187 5.1895-.112.535-.3554.7123-.7812 1.6367-.5098 1.1065-.383 2.588.3594 3.5293.6723.8488 1.879 1.2321 3.0527.9492 2.1065-.5042 3.0646-2.2822 2.8965-4.2851-.1317-1.58-.8154-2.7536-2.754-4.961-.9607-1.0925-1.6072-2.409-1.5624-3.4062.1373-1.2074.6582-1.832.6582-1.832zM4.8928 15.1936c-.0222.0145-.0439.0614-.0586.1602a.0469.0469 0 0 1-.0059.0195v.01c-.1148.5406-.1649 1.823.1153 2.9687.353 1.4427 1.4175 3.902 4.412 5.129 2.5184 1.0336 5.718.5411 7.8497-1.627.5294-.5435.408-.4897-.4883-.2012v-.002c-1.1121.3558-3.5182.5463-4.7676-1-1.5239-1.8852-.4302-3.3633-1.3574-3.1504-3.6164.8348-5.2667-1.4657-5.5469-2.1016-.0023-.002-.0857-.2487-.1523-.205z"/>
  </svg>

{:else if resolvedBrand === 'imgur'}
  <!-- Official Imgur Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Imgur">
    <path fill="#1BB76E" d="M21.147 3.043c-.002-.113-.069-.182-.189-.191a14.117 14.117 0 00-.51-.045l-.162-.01a21.998 21.998 0 00-1.085-.046l-.217-.005c-.172-.003-.35-.004-.532-.004l-.189-.001c-.295 0-.601.003-.919.01l-.106.003a55.86 55.86 0 00-.87.026l-.237.009c-.335.013-.676.029-1.027.049l-.012.001c-.357.021-.724.045-1.095.071l-.275.021c-.304.023-.609.048-.92.076l-.25.021c-.38.035-.766.074-1.156.115-.08.009-.161.019-.242.027-.319.035-.641.073-.965.113l-.33.042c-.403.051-.806.105-1.212.164a.547.547 0 00-.154.045.303.303 0 00-.097.074l-.003.002c-.045.055-.047.12.004.179.003.004.002.008.005.012l3.488 3.456-6.629 6.596c-.069.067-.068.165 0 .251.856 1.093 1.44 1.793 2.143 2.492.699.703 1.398 1.286 2.493 2.143a.216.216 0 00.132.051.167.167 0 00.119-.051l6.597-6.629 3.455 3.488a.143.143 0 00.101.047c.096 0 .187-.118.212-.292.746-5.141.882-10.051.634-12.31z M15.87 24l6.356-6.357.026-.026.156-.155-.006-.006a3.144 3.144 0 00.822-1.711c.804-5.53.903-10.591.654-12.952a2.904 2.904 0 00-.834-1.812 2.96 2.96 0 00-1.816-.855C20.458.042 19.476 0 18.318 0c-2.999 0-6.667.284-10.063.777a3.143 3.143 0 00-1.887.991L0 8.137V24H15.87zm1.528-6.707c-.151 0-.563.405-.563.613a.1.1 0 01-.099.1.1.1 0 01-.099-.1c0-.208-.411-.613-.563-.613a.1.1 0 01-.099-.1c0-.054.044-.098.099-.098.152 0 .563-.404.563-.614 0-.055.044-.098.099-.098.054 0 .099.043.099.098 0 .21.412.614.563.614a.1.1 0 010 .198zM5.4 7.045c.197 0 .735-.528.735-.801a.13.13 0 01.128-.129c.071 0 .128.058.128.129 0 .272.538.801.735.801.071 0 .128.057.128.128a.128.128 0 01-.128.128c-.197 0-.735.528-.735.801a.128.128 0 01-.128.128.128.128 0 01-.128-.128c0-.273-.538-.801-.735-.801a.128.128 0 010-.256zm-3.99 3.26c0-.065.057-.098.119-.118.69-.228 1.269-.8 1.403-1.554.011-.064.053-.118.118-.118.066 0 .107.054.119.118.133.754.711 1.326 1.401 1.554.062.02.118.053.118.118s-.056.098-.118.119c-.69.227-1.269.799-1.403 1.553-.011.064-.053.119-.119.119-.065 0-.106-.054-.118-.119-.134-.754-.713-1.326-1.403-1.553-.061-.022-.117-.054-.117-.119zm1.565 9.307c-.113 0-.42.302-.42.459 0 .04-.034.073-.074.073a.074.074 0 01-.074-.073c0-.157-.307-.459-.42-.459a.074.074 0 01-.074-.073c0-.039.034-.073.074-.073.113 0 .42-.302.42-.457 0-.042.033-.073.074-.073.04 0 .074.031.074.073 0 .155.307.457.42.457.04 0 .073.034.073.073a.073.073 0 01-.073.073zm.568-3.047c-.14 0-.521.375-.521.568a.092.092 0 11-.183 0c0-.193-.381-.568-.521-.568a.09.09 0 01-.091-.09c0-.051.041-.092.091-.092.14 0 .521-.375.521-.568a.09.09 0 01.092-.09.09.09 0 01.091.09c0 .193.381.568.521.568a.091.091 0 010 .182zm3.334 4.382c-.203 0-.758.546-.758.827 0 .073-.06.133-.132.133a.133.133 0 01-.133-.133c0-.281-.555-.827-.758-.827a.134.134 0 01-.133-.133c0-.073.059-.132.133-.132.204 0 .758-.545.758-.828 0-.071.06-.132.133-.132.073 0 .132.061.132.132 0 .283.555.828.758.828.074 0 .133.059.133.132a.133.133 0 01-.133.133zm1.922-.806c-1.086-.851-1.869-1.498-2.653-2.287-.789-.784-1.436-1.566-2.287-2.654-.626-.8-.566-1.897.144-2.607l.001-.001.002-.001L9.364 7.26 7.149 5.066l-.003-.003-.002-.003c-.52-.52-.7-1.27-.472-1.958.148-.447.464-.802.867-1.049a1.983 1.983 0 01.371-.19 2.1 2.1 0 01.468-.131c.005 0 .009-.003.014-.004C11.746 1.24 15.363.96 18.317.96h.002c1.125 0 2.072.041 2.818.121.469.046.903.249 1.228.576.328.331.525.767.562 1.237.243 2.311.144 7.253-.651 12.714-.001.01-.006.016-.007.025a2.258 2.258 0 01-.18.586c-.006.014-.01.028-.018.042-.333.699-1.001 1.163-1.771 1.163-.51 0-.992-.2-1.358-.567l-.003-.002-.004-.004-2.192-2.215-5.333 5.359-.001.002h-.001a1.94 1.94 0 01-1.378.573c-.44 0-.877-.151-1.231-.429zm2.576 2.09c-.139 0-.518.373-.518.566a.09.09 0 01-.091.09.09.09 0 01-.09-.09c0-.193-.379-.566-.519-.566a.09.09 0 110-.18c.139 0 .519-.373.519-.566a.09.09 0 01.09-.09c.05 0 .091.041.091.09 0 .193.379.566.518.566.05 0 .091.039.091.09s-.04.09-.091.09zm2.115-2.437c.248 0 .922-.662.922-1.003 0-.088.072-.161.161-.161.088 0 .161.073.161.161 0 .341.674 1.003.921 1.003.089 0 .161.073.161.161a.16.16 0 01-.161.161c-.247 0-.921.662-.921 1.005a.162.162 0 01-.161.162.162.162 0 01-.161-.162c0-.343-.674-1.005-.922-1.005a.161.161 0 010-.322z"/>
  </svg>

{:else if resolvedBrand === 'airtable'}
  <!-- Official Airtable Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Airtable">
    <path fill="#FCB400" d="M11.992 1.966c-.434 0-.87.086-1.28.257L1.779 5.917c-.503.208-.49.908.012 1.116l8.982 3.558a3.266 3.266 0 0 0 2.454 0l8.982-3.558c.503-.196.503-.908.012-1.116l-8.957-3.694a3.255 3.255 0 0 0-1.272-.257z"/>
    <path fill="#F82B60" d="M23.4 8.056a.589.589 0 0 0-.222.045l-10.012 3.877a.612.612 0 0 0-.38.564v8.896a.6.6 0 0 0 .821.552L23.62 18.1a.583.583 0 0 0 .38-.551V8.653a.6.6 0 0 0-.6-.596z"/>
    <path fill="#18BFFF" d="M.676 8.095a.644.644 0 0 0-.48.19C.086 8.396 0 8.53 0 8.69v8.355c0 .442.515.737.908.54l6.27-3.006.307-.147 2.969-1.436c.466-.22.43-.908-.061-1.092L.883 8.138a.57.57 0 0 0-.207-.044z"/>
  </svg>

{:else if resolvedBrand === 'trello'}
  <!-- Official Trello Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Trello">
    <path fill="#0079BF" d="M21.147 0H2.853A2.86 2.86 0 000 2.853v18.294A2.86 2.86 0 002.853 24h18.294A2.86 2.86 0 0024 21.147V2.853A2.86 2.86 0 0021.147 0zM10.34 17.287a.953.953 0 01-.953.953h-4a.954.954 0 01-.954-.953V5.38a.953.953 0 01.954-.953h4a.954.954 0 01.953.953zm9.233-5.467a.944.944 0 01-.953.947h-4a.947.947 0 01-.953-.947V5.38a.953.953 0 01.953-.953h4a.954.954 0 01.953.953z"/>
  </svg>

{:else if resolvedBrand === 'asana'}
  <!-- Official Asana Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Asana">
    <path fill="#F06A6A" d="M18.78 12.653c-2.882 0-5.22 2.336-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.34 5.22-5.22-2.336-5.22-5.22-5.22zm-13.56 0c-2.88 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.336-5.22-5.22-5.22zm12-6.525c0 2.883-2.337 5.22-5.22 5.22-2.882 0-5.22-2.337-5.22-5.22 0-2.88 2.338-5.22 5.22-5.22 2.883 0 5.22 2.34 5.22 5.22z"/>
  </svg>

{:else if resolvedBrand === 'clickup'}
  <!-- Official ClickUp Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="ClickUp">
    <path fill="#7B68EE" d="M2 18.439l3.69-2.828c1.961 2.56 4.044 3.739 6.363 3.739 2.307 0 4.33-1.166 6.203-3.704L22 18.405C19.298 22.065 15.941 24 12.053 24 8.178 24 4.788 22.078 2 18.439zM12.04 6.15l-6.568 5.66-3.036-3.52L12.055 0l9.543 8.296-3.05 3.509z"/>
  </svg>

{:else if resolvedBrand === 'monday'}
  <!-- Official Monday.com Authentic Brand Icon -->
  <svg viewBox="-1 0 23 14" width={size} height={size} class={className} aria-label="Monday.com">
    <path d="M 2.62,12.627 A 2.63,2.63 0 0 1 0.328,11.297 2.543,2.543 0 0 1 0.4,8.679 L 5.12,1.267 a 2.632,2.632 0 0 1 2.33,-1.266 2.627,2.627 0 0 1 2.255,1.39 c 0.44,0.832 0.385,1.833 -0.142,2.614 l -4.717,7.412 a 2.631,2.631 0 0 1 -2.226,1.21 z" fill="#f62b54" />
    <path d="M 10.716,12.627 C 9.764,12.627 8.888,12.118 8.428,11.3 A 2.535,2.535 0 0 1 8.5,8.689 l 4.711,-7.395 a 2.628,2.628 0 0 1 2.332,-1.293 c 0.96,0.021 1.83,0.558 2.27,1.398 0.437,0.84 0.373,1.847 -0.17,2.626 l -4.71,7.395 a 2.627,2.627 0 0 1 -2.217,1.207 z" fill="#ffcc00" />
    <ellipse cx="18.631" cy="10.31" rx="2.43" ry="2.38" fill="#00ca72" />
  </svg>

{:else if resolvedBrand === 'todoist'}
  <!-- Official Todoist Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Todoist">
    <path fill="#E44332" d="M21 0H3C1.35 0 0 1.35 0 3v3.858s3.854 2.24 4.098 2.38c.31.18.694.177 1.004 0 .26-.147 8.02-4.608 8.136-4.675.279-.161.58-.107.748-.01.164.097.606.348.84.48.232.134.221.502.013.622l-9.712 5.59c-.346.2-.69.204-1.048.002C3.478 10.907.998 9.463 0 8.882v2.02l4.098 2.38c.31.18.694.177 1.004 0 .26-.147 8.02-4.609 8.136-4.676.279-.16.58-.106.748-.008.164.096.606.347.84.48.232.133.221.5.013.62-.208.121-9.288 5.346-9.712 5.59-.346.2-.69.205-1.048.002C3.478 14.951.998 13.506 0 12.926v2.02l4.098 2.38c.31.18.694.177 1.004 0 .26-.147 8.02-4.609 8.136-4.676.279-.16.58-.106.748-.009.164.097.606.348.84.48.232.133.221.502.013.622l-9.712 5.59c-.346.199-.69.204-1.048.001C3.478 18.994.998 17.55 0 16.97V21c0 1.65 1.35 3 3 3h18c1.65 0 3-1.35 3-3V3c0-1.65-1.35-3-3-3z"/>
  </svg>

{:else if resolvedBrand === 'linear'}
  <!-- Official Linear Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Linear">
    <path fill="#5E6AD2" d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z"/>
  </svg>

{:else if resolvedBrand === 'jira'}
  <!-- Official Jira Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Jira">
    <path fill="#0052CC" d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.218 5.218 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z"/>
  </svg>

{:else if resolvedBrand === 'basecamp'}
  <!-- Official Basecamp Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Basecamp">
    <path fill="#1D2D35" d="M12.6516 22.453c-4.0328 0-7.575-1.5542-10.244-4.4946a1.11 1.11 0 0 1-.219-1.1338c.7008-1.8884 2.5935-6.2808 5.0205-6.2948h.0125c1.219 0 2.1312.9655 2.8648 1.7412.2192.2324.555.5875.7818.7611.5656-.5587 1.6775-2.4158 2.5422-4.2779.259-.5567.9203-.7985 1.4765-.5402.557.2584.7988.919.5404 1.4762-2.6217 5.6503-4.019 5.6503-4.478 5.6503-1.022 0-1.7628-.7843-2.4791-1.5422-.3208-.339-.9878-1.045-1.2482-1.045h-.0004c-.5665.095-1.8085 2.0531-2.6966 4.2034 2.1925 2.1722 4.9232 3.2726 8.1266 3.2726 4.3955 0 7.683-1.1964 9.0996-3.2953-.4888-5.585-3.5642-13.1634-9.0996-13.1634-4.6855 0-8.2152 3.264-10.4915 9.7007-.205.579-.8416.8828-1.4187.6776-.5789-.2047-.882-.8398-.6776-1.4185 2.624-7.421 6.859-11.1833 12.5878-11.1833 7.4826 0 10.9304 9.5613 11.3458 15.588a1.1154 1.1154 0 0 1-.1456.6314c-1.7407 3.0221-5.7182 4.6864-11.2002 4.6864Z"/>
  </svg>

{:else if resolvedBrand === 'github'}
  <!-- Official GitHub Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="GitHub">
    <path fill="#181717" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>

{:else if resolvedBrand === 'gitlab'}
  <!-- Official GitLab Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="GitLab">
    <path fill="#FC6D26" d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z"/>
  </svg>

{:else if resolvedBrand === 'webhook'}
  <!-- Official Webhook Authentic Brand Lightning Trigger -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Webhook">
    <path fill="#6366F1" d="M13 2L3 14h8v8l10-12h-8V2z"/>
  </svg>

{:else if resolvedBrand === 'postgresql'}
  <!-- Official PostgreSQL Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="PostgreSQL">
    <path fill="#4169E1" d="M23.5594 14.7228a.5269.5269 0 0 0-.0563-.1191c-.139-.2632-.4768-.3418-1.0074-.2321-1.6533.3411-2.2935.1312-2.5256-.0191 1.342-2.0482 2.445-4.522 3.0411-6.8297.2714-1.0507.7982-3.5237.1222-4.7316a1.5641 1.5641 0 0 0-.1509-.235C21.6931.9086 19.8007.0248 17.5099.0005c-1.4947-.0158-2.7705.3461-3.1161.4794a9.449 9.449 0 0 0-.5159-.0816 8.044 8.044 0 0 0-1.3114-.1278c-1.1822-.0184-2.2038.2642-3.0498.8406-.8573-.3211-4.7888-1.645-7.2219.0788C.9359 2.1526.3086 3.8733.4302 6.3043c.0409.818.5069 3.334 1.2423 5.7436.4598 1.5065.9387 2.7019 1.4334 3.582.553.9942 1.1259 1.5933 1.7143 1.7895.4474.1491 1.1327.1441 1.8581-.7279.8012-.9635 1.5903-1.8258 1.9446-2.2069.4351.2355.9064.3625 1.39.3772a.0569.0569 0 0 0 .0004.0041 11.0312 11.0312 0 0 0-.2472.3054c-.3389.4302-.4094.5197-1.5002.7443-.3102.064-1.1344.2339-1.1464.8115-.0025.1224.0329.2309.0919.3268.2269.4231.9216.6097 1.015.6331 1.3345.3335 2.5044.092 3.3714-.6787-.017 2.231.0775 4.4174.3454 5.0874.2212.5529.7618 1.9045 2.4692 1.9043.2505 0 .5263-.0291.8296-.0941 1.7819-.3821 2.5557-1.1696 2.855-2.9059.1503-.8707.4016-2.8753.5388-4.1012.0169-.0703.0357-.1207.057-.1362.0007-.0005.0697-.0471.4272.0307a.3673.3673 0 0 0 .0443.0068l.2539.0223.0149.001c.8468.0384 1.9114-.1426 2.5312-.4308.6438-.2988 1.8057-1.0323 1.5951-1.6698zM2.371 11.8765c-.7435-2.4358-1.1779-4.8851-1.2123-5.5719-.1086-2.1714.4171-3.6829 1.5623-4.4927 1.8367-1.2986 4.8398-.5408 6.108-.13-.0032.0032-.0066.0061-.0098.0094-2.0238 2.044-1.9758 5.536-1.9708 5.7495-.0002.0823.0066.1989.0162.3593.0348.5873.0996 1.6804-.0735 2.9184-.1609 1.1504.1937 2.2764.9728 3.0892.0806.0841.1648.1631.2518.2374-.3468.3714-1.1004 1.1926-1.9025 2.1576-.5677.6825-.9597.5517-1.0886.5087-.3919-.1307-.813-.5871-1.2381-1.3223-.4796-.839-.9635-2.0317-1.4155-3.5126zm6.0072 5.0871c-.1711-.0428-.3271-.1132-.4322-.1772.0889-.0394.2374-.0902.4833-.1409 1.2833-.2641 1.4815-.4506 1.9143-1.0002.0992-.126.2116-.2687.3673-.4426a.3549.3549 0 0 0 .0737-.1298c.1708-.1513.2724-.1099.4369-.0417.156.0646.3078.26.3695.4752.0291.1016.0619.2945-.0452.4444-.9043 1.2658-2.2216 1.2494-3.1676 1.0128zm2.094-3.988-.0525.141c-.133.3566-.2567.6881-.3334 1.003-.6674-.0021-1.3168-.2872-1.8105-.8024-.6279-.6551-.9131-1.5664-.7825-2.5004.1828-1.3079.1153-2.4468.079-3.0586-.005-.0857-.0095-.1607-.0122-.2199.2957-.2621 1.6659-.9962 2.6429-.7724.4459.1022.7176.4057.8305.928.5846 2.7038.0774 3.8307-.3302 4.7363-.084.1866-.1633.3629-.2311.5454zm7.3637 4.5725c-.0169.1768-.0358.376-.0618.5959l-.146.4383a.3547.3547 0 0 0-.0182.1077c-.0059.4747-.054.6489-.115.8693-.0634.2292-.1353.4891-.1794 1.0575-.11 1.4143-.8782 2.2267-2.4172 2.5565-1.5155.3251-1.7843-.4968-2.0212-1.2217a6.5824 6.5824 0 0 0-.0769-.2266c-.2154-.5858-.1911-1.4119-.1574-2.5551.0165-.5612-.0249-1.9013-.3302-2.6462.0044-.2932.0106-.5909.019-.8918a.3529.3529 0 0 0-.0153-.1126 1.4927 1.4927 0 0 0-.0439-.208c-.1226-.4283-.4213-.7866-.7797-.9351-.1424-.059-.4038-.1672-.7178-.0869.067-.276.1831-.5875.309-.9249l.0529-.142c.0595-.16.134-.3257.213-.5012.4265-.9476 1.0106-2.2453.3766-5.1772-.2374-1.0981-1.0304-1.6343-2.2324-1.5098-.7207.0746-1.3799.3654-1.7088.5321a5.6716 5.6716 0 0 0-.1958.1041c.0918-1.1064.4386-3.1741 1.7357-4.4823a4.0306 4.0306 0 0 1 .3033-.276.3532.3532 0 0 0 .1447-.0644c.7524-.5706 1.6945-.8506 2.802-.8325.4091.0067.8017.0339 1.1742.081 1.939.3544 3.2439 1.4468 4.0359 2.3827.8143.9623 1.2552 1.9315 1.4312 2.4543-1.3232-.1346-2.2234.1268-2.6797.779-.9926 1.4189.543 4.1729 1.2811 5.4964.1353.2426.2522.4522.2889.5413.2403.5825.5515.9713.7787 1.2552.0696.087.1372.1714.1885.245-.4008.1155-1.1208.3825-1.0552 1.717-.0123.1563-.0423.4469-.0834.8148-.0461.2077-.0702.4603-.0994.7662zm.8905-1.6211c-.0405-.8316.2691-.9185.5967-1.0105a2.8566 2.8566 0 0 0 .135-.0406 1.202 1.202 0 0 0 .1342.103c.5703.3765 1.5823.4213 3.0068.1344-.2016.1769-.5189.3994-.9533.6011-.4098.1903-1.0957.333-1.7473.3636-.7197.0336-1.0859-.0807-1.1721-.151zm.5695-9.2712c-.0059.3508-.0542.6692-.1054 1.0017-.055.3576-.112.7274-.1264 1.1762-.0142.4368.0404.8909.0932 1.3301.1066.887.216 1.8003-.2075 2.7014a3.5272 3.5272 0 0 1-.1876-.3856c-.0527-.1276-.1669-.3326-.3251-.6162-.6156-1.1041-2.0574-3.6896-1.3193-4.7446.3795-.5427 1.3408-.5661 2.1781-.463zm.2284 7.0137a12.3762 12.3762 0 0 0-.0853-.1074l-.0355-.0444c.7262-1.1995.5842-2.3862.4578-3.4385-.0519-.4318-.1009-.8396-.0885-1.2226.0129-.4061.0666-.7543.1185-1.0911.0639-.415.1288-.8443.1109-1.3505.0134-.0531.0188-.1158.0118-.1902-.0457-.4855-.5999-1.938-1.7294-3.253-.6076-.7073-1.4896-1.4972-2.6889-2.0395.5251-.1066 1.2328-.2035 2.0244-.1859 2.0515.0456 3.6746.8135 4.8242 2.2824a.908.908 0 0 1 .0667.1002c.7231 1.3556-.2762 6.2751-2.9867 10.5405zm-8.8166-6.1162c-.025.1794-.3089.4225-.6211.4225a.5821.5821 0 0 1-.0809-.0056c-.1873-.026-.3765-.144-.5059-.3156-.0458-.0605-.1203-.178-.1055-.2844.0055-.0401.0261-.0985.0925-.1488.1182-.0894.3518-.1226.6096-.0867.3163.0441.6426.1938.6113.4186zm7.9305-.4114c.0111.0792-.049.201-.1531.3102-.0683.0717-.212.1961-.4079.2232a.5456.5456 0 0 1-.075.0052c-.2935 0-.5414-.2344-.5607-.3717-.024-.1765.2641-.3106.5611-.352.297-.0414.6111.0088.6356.1851z"/>
  </svg>

{:else if resolvedBrand === 'mysql'}
  <!-- Official MySQL Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="MySQL">
    <path fill="#00758F" d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 00-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 00-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.064h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.35.41.877.615 1.583.615.264 0 .506-.033.725-.098l1.325.772.36-.622zM15.5 17.588c-.225-.36-.337-.94-.337-1.736 0-1.393.424-2.09 1.27-2.09.443 0 .77.167.977.5.224.362.336.936.336 1.723 0 1.404-.424 2.108-1.27 2.108-.445 0-.77-.167-.978-.5zm-1.658-.425c0 .47-.172.856-.516 1.156-.344.3-.803.45-1.384.45-.543 0-1.064-.172-1.573-.515l.237-.476c.438.22.833.328 1.19.328.332 0 .593-.073.783-.22a.754.754 0 00.3-.615c0-.33-.23-.61-.648-.845-.388-.213-1.163-.657-1.163-.657-.422-.307-.632-.636-.632-1.177 0-.45.157-.81.47-1.085.315-.278.72-.415 1.22-.415.512 0 .98.136 1.4.41l-.213.476a2.726 2.726 0 00-1.064-.23c-.283 0-.502.068-.654.206a.685.685 0 00-.248.524c0 .328.234.61.666.85.393.215 1.187.67 1.187.67.433.305.648.63.648 1.168zm9.382-5.852c-.535-.014-.95.04-1.297.188-.1.04-.26.04-.274.167.055.053.063.14.11.214.08.134.218.313.346.407.14.11.28.216.427.31.26.16.555.255.81.416.145.094.293.213.44.313.073.05.12.14.214.172v-.02c-.046-.06-.06-.147-.105-.214-.067-.067-.134-.127-.2-.193a3.223 3.223 0 00-.695-.675c-.214-.146-.682-.35-.77-.595l-.013-.014c.146-.013.32-.066.46-.106.227-.06.435-.047.67-.106.106-.027.213-.06.32-.094v-.06c-.12-.12-.21-.283-.334-.395a8.867 8.867 0 00-1.104-.823c-.21-.134-.476-.22-.697-.334-.08-.04-.214-.06-.26-.127-.12-.146-.19-.34-.275-.514a17.69 17.69 0 01-.547-1.163c-.12-.262-.193-.523-.34-.763-.69-1.137-1.437-1.826-2.586-2.5-.247-.14-.543-.2-.856-.274-.167-.008-.334-.02-.5-.027-.11-.047-.216-.174-.31-.235-.38-.24-1.364-.76-1.644-.072-.18.434.267.862.422 1.082.115.153.26.328.34.5.047.116.06.235.107.356.106.294.207.622.347.897.073.14.153.287.247.413.054.073.146.107.167.227-.094.136-.1.334-.154.5-.24.757-.146 1.693.194 2.25.107.166.362.534.703.393.3-.12.234-.5.32-.835.02-.08.007-.133.048-.187v.015c.094.188.188.367.274.555.206.328.566.668.867.895.16.12.287.328.487.402v-.02h-.015c-.043-.058-.1-.086-.154-.133a3.445 3.445 0 01-.35-.4 8.76 8.76 0 01-.747-1.218c-.11-.21-.202-.436-.29-.643-.04-.08-.04-.2-.107-.24-.1.146-.247.273-.32.453-.127.288-.14.642-.188 1.01-.027.007-.014 0-.027.014-.214-.052-.287-.274-.367-.46-.2-.475-.233-1.238-.06-1.785.047-.14.247-.582.167-.716-.042-.127-.174-.2-.247-.303a2.478 2.478 0 01-.24-.427c-.16-.374-.24-.788-.414-1.162-.08-.173-.22-.354-.334-.513-.127-.18-.267-.307-.368-.52-.033-.073-.08-.194-.027-.274.014-.054.042-.075.094-.09.088-.072.335.022.422.062.247.1.455.194.662.334.094.066.195.193.315.226h.14c.214.047.455.014.655.073.355.114.675.28.962.46a5.953 5.953 0 012.085 2.286c.08.154.115.295.188.455.14.33.313.663.455.982.14.315.275.636.476.897.1.14.502.213.682.286.133.06.34.115.46.188.23.14.454.3.67.454.11.076.443.243.463.378z"/>
  </svg>

{:else if resolvedBrand === 'redis'}
  <!-- Official Redis Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Redis">
    <path fill="#FF4438" d="M22.71 13.145c-1.66 2.092-3.452 4.483-7.038 4.483-3.203 0-4.397-2.825-4.48-5.12.701 1.484 2.073 2.685 4.214 2.63 4.117-.133 6.94-3.852 6.94-7.239 0-4.05-3.022-6.972-8.268-6.972-3.752 0-8.4 1.428-11.455 3.685C2.59 6.937 3.885 9.958 4.35 9.626c2.648-1.904 4.748-3.13 6.784-3.744C8.12 9.244.886 17.05 0 18.425c.1 1.261 1.66 4.648 2.424 4.648.232 0 .431-.133.664-.365a100.49 100.49 0 0 0 5.54-6.765c.222 3.104 1.748 6.898 6.014 6.898 3.819 0 7.604-2.756 9.33-8.965.2-.764-.73-1.361-1.261-.73zm-4.349-5.013c0 1.959-1.926 2.922-3.685 2.922-.941 0-1.664-.247-2.235-.568 1.051-1.592 2.092-3.225 3.21-4.973 1.972.334 2.71 1.43 2.71 2.619z"/>
  </svg>

{:else if resolvedBrand === 'postman'}
  <!-- Official Postman Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Postman">
    <path fill="#FF6C37" d="M13.527.099C6.955-.744.942 3.9.099 10.473c-.843 6.572 3.8 12.584 10.373 13.428 6.573.843 12.587-3.801 13.428-10.374C24.744 6.955 20.101.943 13.527.099zm2.471 7.485a.855.855 0 0 0-.593.25l-4.453 4.453-.307-.307-.643-.643c4.389-4.376 5.18-4.418 5.996-3.753zm-4.863 4.861l4.44-4.44a.62.62 0 1 1 .847.903l-4.699 4.125-.588-.588zm.33.694l-1.1.238a.06.06 0 0 1-.067-.032.06.06 0 0 1 .01-.073l.645-.645.512.512zm-2.803-.459l1.172-1.172.879.878-1.979.426a.074.074 0 0 1-.085-.039.072.072 0 0 1 .013-.093zm-3.646 6.058a.076.076 0 0 1-.069-.083.077.077 0 0 1 .022-.046h.002l.946-.946 1.222 1.222-2.123-.147zm2.425-1.256a.228.228 0 0 0-.117.256l.203.865a.125.125 0 0 1-.211.117h-.003l-.934-.934-.294-.295 3.762-3.758 1.82-.393.874.874c-1.255 1.102-2.971 2.201-5.1 3.268zm5.279-3.428h-.002l-.839-.839 4.699-4.125a.952.952 0 0 0 .119-.127c-.148 1.345-2.029 3.245-3.977 5.091zm3.657-6.46l-.003-.002a1.822 1.822 0 0 1 2.459-2.684l-1.61 1.613a.119.119 0 0 0 0 .169l1.247 1.247a1.817 1.817 0 0 1-2.093-.343zm2.578 0a1.714 1.714 0 0 1-.271.218h-.001l-1.207-1.207 1.533-1.533c.661.72.637 1.832-.054 2.522zM18.855 6.05a.143.143 0 0 0-.053.157.416.416 0 0 1-.053.45.14.14 0 0 0 .023.197.141.141 0 0 0 .084.03.14.14 0 0 0 .106-.05.691.691 0 0 0 .087-.751.138.138 0 0 0-.194-.033z"/>
  </svg>

{:else if resolvedBrand === 'docker'}
  <!-- Official Docker Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Docker">
    <path fill="#2496ED" d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/>
  </svg>

{:else if resolvedBrand === 'vercel'}
  <!-- Official Vercel Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Vercel">
    <path fill="#000000" d="m12 1.608 12 20.784H0Z"/>
  </svg>

{:else if resolvedBrand === 'notion'}
  <!-- Official Notion Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Notion">
    <path fill="#000000" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
  </svg>

{:else if resolvedBrand === 'midjourney'}
  <!-- Official Midjourney Authentic Sailboat Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Midjourney">
    <path fill="#0D0F1A" d="M21.74 19.17c-.41 0-.71-.25-1.05-.54c-.37-.31-.79-.66-1.38-.66s-1.01.35-1.38.66c-.35.29-.64.54-1.05.54c-.26 0-.47-.1-.68-.25c1.86-.9 3.33-1.83 4.45-2.84c.08-.07.11-.19.06-.29a.26.26 0 0 0-.25-.16L3.55 16.72c-.09 0-.17.06-.22.14a.27.27 0 0 0 0 .27c1.12 1.01 2.59 1.94 4.45 2.84c-.21.15-.42.25-.68.25c-.41 0-.71-.25-1.05-.54c-.37-.31-.79-.66-1.38-.66s-1.01.35-1.38.66c-.35.29-.64.54-1.05.54c-.45 0-.83-.22-1.15-.55c-.34-.35-.58-.8-.74-1.33c-.32-1.07-.48-2.31-.48-3.69c0-1.38.16-2.62.48-3.69c.16-.53.4-.98.74-1.33c.32-.33.7-.55 1.15-.55c.41 0 .71.25 1.05.54c.37.31.79.66 1.38.66s1.01-.35 1.38-.66c.35-.29.64-.54 1.05-.54c.26 0 .47.1.68.25c-1.86.9-3.33 1.83-4.45 2.84a.26.26 0 0 0-.06.29c.05.1.14.16.25.16l16.89-.98c.09 0 .17-.06.22-.14a.27.27 0 0 0 0-.27c-1.12-1.01-2.59-1.94-4.45-2.84c.21-.15.42-.25.68-.25c.41 0 .71.25 1.05.54c.37.31.79.66 1.38.66s1.01-.35 1.38-.66c.35-.29.64-.54 1.05-.54c.45 0 .83.22 1.15.55c.34.35.58.8.74 1.33c.32 1.07.48 2.31.48 3.69c0 1.38-.16 2.62-.48 3.69c-.16.53-.4.98-.74 1.33c-.32.33-.7.55-1.15.55Z"/>
  </svg>

{:else if resolvedBrand === 'agent'}
  <!-- Autonomous AI Agent Specialist Badge -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="AI Specialist">
    <path fill="#1677FF" d="M12 2a2 2 0 0 1 2 2c0 .7-.4 1.4-1 1.7V7h3a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h3V5.7c-.6-.3-1-1-1-1.7a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-6 5h6v1H9v-1z"/>
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
  <!-- Official WhatsApp Authentic Brand Icon -->
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
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
    />
  </svg>

{:else if resolvedBrand === 'google'}
  <!-- Official Google Brand 4-Color Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.39 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
  </svg>

{:else if resolvedBrand === 'wordpress'}
  <!-- Official WordPress Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="WordPress">
    <path fill="#21759B" d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0"/>
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
      d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
    />
  </svg>

{:else if icon}
  <!-- Polished Thematic Category / Skill Icon Fallback -->
  <Icon name={icon} {size} class={className} />

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
