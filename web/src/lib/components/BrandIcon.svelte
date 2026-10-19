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

{:else if resolvedBrand === 'calendar'}
  <!-- Official Google Calendar Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Calendar">
    <rect width="24" height="24" rx="5" fill="#4285F4"/>
    <path fill="#FFFFFF" d="M7 3a1 1 0 0 1 1 1v1h8V4a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V4a1 1 0 0 1 1-1zm12 6H5v10h14V9z"/>
    <text x="12" y="16.5" fill="#4285F4" font-size="7.5" font-weight="bold" font-family="sans-serif" text-anchor="middle">31</text>
  </svg>

{:else if resolvedBrand === 'slides'}
  <!-- Official Google Slides Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Slides">
    <rect width="24" height="24" rx="5" fill="#FBBC04"/>
    <path fill="#FFFFFF" d="M6 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm2 1v6h8V8H8zm2 8.8h4V18h-4v-1.2z"/>
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
  <!-- Official Slack Authentic 4-Color Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Slack">
    <path fill="#36C5F0" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
    <path fill="#2EB67D" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.521 2.522v2.52h-2.521zm0 1.271a2.527 2.527 0 0 1 2.521 2.521v6.313A2.528 2.528 0 0 1 8.834 17.65a2.528 2.528 0 0 1-2.521-2.523V8.834a2.527 2.527 0 0 1 2.521-2.521z"/>
    <path fill="#ECB22E" d="M18.958 8.835a2.528 2.528 0 0 1 2.52-2.523A2.528 2.528 0 0 1 24 8.835a2.527 2.527 0 0 1-2.522 2.52h-2.52v-2.52zM17.687 8.835a2.527 2.527 0 0 1-2.521 2.52 2.527 2.527 0 0 1-2.521-2.52V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.313z"/>
    <path fill="#E01E5A" d="M15.166 18.958a2.528 2.528 0 0 1 2.521 2.52 2.528 2.528 0 0 1-2.521 2.522 2.527 2.527 0 0 1-2.521-2.52v-2.52h2.521zm0-1.271a2.527 2.527 0 0 1-2.521-2.521V8.834A2.528 2.528 0 0 1 15.166 6.35a2.528 2.528 0 0 1 2.521 2.523v6.313a2.527 2.527 0 0 1-2.521 2.521z"/>
  </svg>

{:else if resolvedBrand === 'discord'}
  <!-- Official Discord Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Discord">
    <rect width="24" height="24" rx="5" fill="#5865F2"/>
    <path fill="#FFFFFF" d="M18.2 6.8a14.8 14.8 0 0 0-3.7-1.1.2.2 0 0 0-.2.1c-.2.3-.3.7-.5 1-1.3-.2-2.7-.2-4 0-.2-.3-.3-.7-.5-1a.2.2 0 0 0-.2-.1 14.8 14.8 0 0 0-3.7 1.1.2.2 0 0 0-.1.1C3.2 10.5 2.6 14 3.7 17.5a.2.2 0 0 0 .1.1 14.9 14.9 0 0 0 4.5 2.3.2.2 0 0 0 .2-.1c.3-.5.7-1 1-1.5a.2.2 0 0 0-.1-.2 9.8 9.8 0 0 1-1.4-.7.2.2 0 0 1 0-.3c.1-.1.2-.1.3-.2 2.9 1.3 6 1.3 8.8 0 .1.1.2.1.3.2a.2.2 0 0 1 0 .3c-.4.3-.9.5-1.4.7a.2.2 0 0 0-.1.2c.3.5.7 1 1 1.5a.2.2 0 0 0 .2.1 14.9 14.9 0 0 0 4.5-2.3.2.2 0 0 0 .1-.1c1.2-3.8.5-7.3-1.6-10.6a.2.2 0 0 0-.1-.1zM9.5 14.6c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7c.9 0 1.6.8 1.5 1.7 0 1-.7 1.7-1.5 1.7zm5 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7c.9 0 1.6.8 1.5 1.7 0 1-.7 1.7-1.5 1.7z"/>
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
  <!-- Official Resend Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Resend">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path fill="#FFFFFF" d="M6 7h7a4 4 0 0 1 4 4c0 2.2-1.8 4-4 4h-3v3H6V7zm4 5h3a1.5 1.5 0 0 0 0-3h-3v3zm5.5 3.5L18 18h-2.5l-2.2-2.5h2.2z"/>
  </svg>

{:else if resolvedBrand === 'pushover'}
  <!-- Official Pushover Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Pushover">
    <rect width="24" height="24" rx="5" fill="#1E88E5"/>
    <path fill="#FFFFFF" d="M8 6h5a4 4 0 0 1 4 4 4 4 0 0 1-4 4h-2.5v4H8V6zm2.5 5.5H13a1.5 1.5 0 0 0 0-3h-2.5v3z"/>
  </svg>

{:else if resolvedBrand === 'teams'}
  <!-- Official Microsoft Teams Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Teams">
    <rect width="24" height="24" rx="5" fill="#464EB8"/>
    <path fill="#FFFFFF" d="M14.5 9.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zm3 1.5h-3.6c-.6 0-1.1.3-1.4.7.7.5 1.2 1.3 1.3 2.1h3.7c.6 0 1.1-.5 1.1-1.1v-.6c0-.6-.5-1.1-1.1-1.1z"/>
    <circle cx="10" cy="8" r="2.2" fill="#FFFFFF"/>
    <path fill="#FFFFFF" d="M5.5 12h9c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5h-9c-.8 0-1.5-.7-1.5-1.5v-3c0-.8.7-1.5 1.5-1.5z"/>
  </svg>

{:else if resolvedBrand === 'intercom'}
  <!-- Official Intercom Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Intercom">
    <rect width="24" height="24" rx="5" fill="#1F8DED"/>
    <path fill="#FFFFFF" d="M6 7.5a1.2 1.2 0 0 1 2.4 0v6a1.2 1.2 0 0 1-2.4 0v-6zm3.6-2a1.2 1.2 0 0 1 2.4 0v9.5a1.2 1.2 0 0 1-2.4 0V5.5zm3.6 0a1.2 1.2 0 0 1 2.4 0v9.5a1.2 1.2 0 0 1-2.4 0V5.5zm3.6 2a1.2 1.2 0 0 1 2.4 0v6a1.2 1.2 0 0 1-2.4 0v-6zM7 17a5 5 0 0 0 10 0H7z"/>
  </svg>

{:else if resolvedBrand === 'opaybd'}
  <!-- Official OPayBD Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="OPayBD">
    <rect width="24" height="24" rx="5" fill="#00B875"/>
    <circle cx="12" cy="12" r="6" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
    <circle cx="12" cy="12" r="2.2" fill="#FFFFFF"/>
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
  <!-- Official Shopify Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Shopify">
    <path fill="#95BF47" d="M19.7 5.7c-.1-.3-.3-.4-.5-.4l-2.6-.3-1.7-1.7c-.2-.2-.5-.3-.7-.2l-1.3.4c-.4-.9-1-1.7-1.9-2.2C10 .6 8.7.6 7.6 1.3c-1.5 1-2.3 2.8-2.3 4.7 0 .3 0 .7.1 1L2 8.3c-.3.1-.5.4-.5.7l1.8 13.1c.1.5.5.9 1 .9h15.4c.5 0 .9-.4 1-.9l1.8-15.5c.1-.4 0-.7-.2-.9zM9 3.5c.7-.5 1.6-.5 2.2 0 .5.4.8 1 1 1.8L8.6 6.5C8.8 5.2 9.2 4.2 9 3.5zm2.8 11.2c-.4.2-1.3.4-1.9.4-1.6 0-2.4-.8-2.4-1.8 0-1.6 1.8-2.2 3.5-2.5v-.5c0-.8-.5-1.2-1.4-1.2-.7 0-1.4.3-1.9.6l-.4-.8c.7-.4 1.6-.7 2.6-.7 1.6 0 2.4.9 2.4 2.2v3.7c0 .5.1 1 .2 1.3h-1.2l-.2-.7zm0-2.8c-1.1.2-2.1.6-2.1 1.4 0 .6.4 1 1.2 1 .4 0 .8-.1 1-.3v-2.1z"/>
  </svg>

{:else if resolvedBrand === 'woocommerce'}
  <!-- Official WooCommerce Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="WooCommerce">
    <rect width="24" height="24" rx="5" fill="#7F54B3"/>
    <path fill="#FFFFFF" d="M4.5 7.5C4.5 6.1 5.6 5 7 5h10c1.4 0 2.5 1.1 2.5 2.5v6c0 1.4-1.1 2.5-2.5 2.5H9.8L6.5 18v-2H7c-.7 0-1.3-.3-1.8-.7-.4-.5-.7-1.1-.7-1.8v-6zm3 2a.8.8 0 0 0-.8.8c0 .8.6 1.8 1.4 2.5.5.4 1.1.7 1.6.7.7 0 1.2-.4 1.6-1.1.4.7.9 1.1 1.6 1.1.5 0 1.1-.3 1.6-.7.8-.7 1.4-1.7 1.4-2.5a.8.8 0 0 0-.8-.8c-.4 0-.7.3-.8.7-.1.5-.4 1.1-.8 1.5-.3.3-.6.4-.8.4s-.6-.2-.8-.6c-.2-.4-.3-.9-.4-1.4a.8.8 0 0 0-.8-.6c-.4 0-.7.2-.8.6-.1.5-.3 1-.5 1.4-.2.4-.5.6-.8.6s-.5-.1-.8-.4c-.4-.4-.7-1-.8-1.5 0-.4-.4-.7-.8-.7z"/>
  </svg>

{:else if resolvedBrand === 'stripe'}
  <!-- Official Stripe Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Stripe">
    <rect width="24" height="24" rx="4.5" fill="#635BFF"/>
    <path fill="#FFFFFF" d="M13.8 9.8c0-.7-.6-1.1-1.6-1.1-1.4 0-3 .5-4.2 1.2l-.6-2.3c1.4-.7 3.3-1.1 5.1-1.1 3.5 0 5.6 1.7 5.6 4.7 0 4.6-6.2 3.9-6.2 5.8 0 .8.7 1.2 1.8 1.2 1.7 0 3.6-.7 4.7-1.5l.6 2.3c-1.4.9-3.4 1.4-5.5 1.4-3.6 0-5.9-1.8-5.9-4.8 0-4.8 6.2-4.1 6.2-5.8z"/>
  </svg>

{:else if resolvedBrand === 'paypal'}
  <!-- Official PayPal Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="PayPal">
    <rect width="24" height="24" rx="5" fill="#003087"/>
    <path fill="#0079C1" d="M9.5 5h4.8c2.2 0 3.7 1.3 3.4 3.4-.4 2.5-2.2 3.8-4.5 3.8h-2l-1 5.8H7.5l2-13z"/>
    <path fill="#00457C" d="M11 9h3.5c1.8 0 3.1 1 2.8 2.8-.4 2.2-2 3.4-4 3.4h-1.8l-.9 5.3H8.3L11 9z"/>
    <path fill="#0079C1" d="M12.8 12.5h1.7c1.8 0 3.1-1 3.4-2.8.2-1.3-.4-2.4-1.7-2.8-.3 1.2-1.3 2-2.6 2.3-.4.1-.7.1-.8.1v3.2z"/>
  </svg>

{:else if resolvedBrand === 'sslcommerz'}
  <!-- Official SSLCommerz Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="SSLCommerz">
    <rect width="24" height="24" rx="5" fill="#1F4788"/>
    <path fill="#FFFFFF" d="M12 4.5l6 2.5v5.5c0 4-2.8 7-6 8-3.2-1-6-4-6-8V7l6-2.5zm0 4a2 2 0 0 0-2 2v1h-.5a.5.5 0 0 0-.5.5v3c0 .3.2.5.5.5h5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5H14v-1a2 2 0 0 0-2-2zm0 1.2c.4 0 .8.4.8.8v1h-1.6v-1c0-.4.4-.8.8-.8z"/>
  </svg>

{:else if resolvedBrand === 'razorpay'}
  <!-- Official Razorpay Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Razorpay">
    <rect width="24" height="24" rx="5" fill="#0C2340"/>
    <path fill="#0082FB" d="M15.5 4.5L9 15.5h4.5l2-3.5h3L15.5 4.5zm-5 10L6 19.5h4.5l2-3.5h-2z"/>
  </svg>

{:else if resolvedBrand === 'paddle'}
  <!-- Official Paddle Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Paddle">
    <rect width="24" height="24" rx="5" fill="#1E293B"/>
    <path fill="#00D26A" d="M7 6h6.5a4.5 4.5 0 0 1 4.5 4.5v0a4.5 4.5 0 0 1-4.5 4.5H10v4H7V6zm3 6h3.5a1.5 1.5 0 0 0 1.5-1.5v0A1.5 1.5 0 0 0 13.5 9H10v3z"/>
  </svg>

{:else if resolvedBrand === 'hubspot'}
  <!-- Official HubSpot Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="HubSpot">
    <circle cx="12" cy="12" r="12" fill="#FF7A59"/>
    <path fill="#FFFFFF" d="M16.5 10.5V8.8a1.8 1.8 0 1 0-1.8 1.8v1.4a4.4 4.4 0 0 0-2.3 1.1l-4-3.1a1.8 1.8 0 1 0-1.1 1.4l3.9 3a4.5 4.5 0 0 0-.2 1.4 4.5 4.5 0 1 0 4.5-4.5c-.3 0-.7 0-1 .1v-1.4a4.4 4.4 0 0 0 2-.9zm-6.2 6.8a2.3 2.3 0 1 1 2.3-2.3 2.3 2.3 0 0 1-2.3 2.3z"/>
  </svg>

{:else if resolvedBrand === 'salesforce'}
  <!-- Official Salesforce Authentic Cloud Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Salesforce">
    <path fill="#00A1E0" d="M19.388 9.394c-.456-2.185-2.072-3.87-4.184-4.457-.962-.267-1.958-.33-2.923-.178-1.222-1.74-3.262-2.775-5.46-2.775-3.328 0-6.195 2.37-6.864 5.632C.46 7.424-.002 9.04 0 10.74c.002 2.658 1.488 4.975 3.731 6.095h1.225c.348 0 .63-.283.63-.631v-1.168c0-.287-.202-.53-.484-.59-1.396-.298-2.435-1.527-2.437-2.997 0-1.472 1.042-2.702 2.44-2.999.282-.06.484-.303.484-.59V7.525c0-2.42 1.96-4.382 4.38-4.382 1.764 0 3.326 1.066 4.004 2.703.116.278.384.463.689.463h.79c.636 0 1.258.077 1.854.238 1.41.378 2.476 1.579 2.708 3.037.042.268.267.469.539.469h1.166c.347 0 .628-.281.63-.628.003-.314-.07-.63-.222-.924zm-2.036 6.326h-1.168c-.272 0-.497.201-.539.47-.232 1.458-1.298 2.66-2.708 3.037-.596.16-1.218.238-1.854.238h-.79c-.305 0-.573.185-.689.463-.678 1.637-2.24 2.703-4.004 2.703-2.42 0-4.38-1.962-4.38-4.382v-.935c0-.287-.202-.53-.484-.59-1.398-.297-2.44-1.527-2.44-2.999 0-1.47 1.041-2.699 2.437-2.997.282-.06.484-.303.484-.59V8.04c0-.348.283-.631.63-.631h1.225c2.243 1.12 3.729 3.437 3.731 6.095 0 1.7-.462 3.316-1.264 4.731.669 3.262 3.536 5.632 6.864 5.632 2.198 0 4.238-1.035 5.46-2.775.965.152 1.961.089 2.923-.178 2.112-.587 3.728-2.272 4.184-4.457.152-.294.225-.61.222-.924-.002-.347-.283-.628-.63-.628h-1.166c-.272 0-.497.201-.539.47z"/>
  </svg>

{:else if resolvedBrand === 'pipedrive'}
  <!-- Official Pipedrive Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Pipedrive">
    <path fill="#26A373" d="M11.758 0C5.268 0 0 5.268 0 11.758s5.268 11.758 11.758 11.758 11.758-5.268 11.758-11.758S18.248 0 11.758 0zm4.12 7.02c1.782 0 3.23 1.448 3.23 3.23 0 1.782-1.448 3.23-3.23 3.23h-2.126V7.02h2.126zm-5.748 0h2.126v9.756H10.13V7.02zM7.886 10.25c0-.98-.795-1.775-1.775-1.775s-1.775.795-1.775 1.775.795 1.775 1.775 1.775 1.775-.795 1.775-1.775z"/>
  </svg>

{:else if resolvedBrand === 'zoho'}
  <!-- Official Zoho Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Zoho">
    <rect width="24" height="24" rx="5" fill="#FFFFFF" stroke="#E2E8F0"/>
    <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" fill="#E42528"/>
    <rect x="12.5" y="4.5" width="7" height="7" rx="1.5" fill="#226CB4"/>
    <rect x="4.5" y="12.5" width="7" height="7" rx="1.5" fill="#5AA639"/>
    <rect x="12.5" y="12.5" width="7" height="7" rx="1.5" fill="#F4B41A"/>
  </svg>

{:else if resolvedBrand === 'leadsquared'}
  <!-- Official LeadSquared Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="LeadSquared">
    <rect width="24" height="24" rx="5" fill="#1C2E4A"/>
    <path fill="#F36F24" d="M7 6h3.5v7.5H17V17H7V6z"/>
    <path fill="#FFFFFF" d="M12 6h5v4.5h-5z"/>
  </svg>

{:else if resolvedBrand === 'close'}
  <!-- Official Close CRM Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Close CRM">
    <rect width="24" height="24" rx="5" fill="#1D273B"/>
    <path fill="#FF4F5E" d="M12 6a6 6 0 1 0 5.2 9h-2.6A3.6 3.6 0 1 1 12 8.4c1.2 0 2.2.6 2.9 1.5l2-1.6A6 6 0 0 0 12 6z"/>
  </svg>

{:else if resolvedBrand === 'gohighlevel'}
  <!-- Official GoHighLevel Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="GoHighLevel">
    <rect width="24" height="24" rx="5" fill="#FF5722"/>
    <path fill="#FFFFFF" d="M7 16l5-8 5 8h-3l-2-3.5L10 16H7zm5-4.5l1.2 2h-2.4l1.2-2z"/>
  </svg>

{:else if resolvedBrand === 'activecampaign'}
  <!-- Official ActiveCampaign Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="ActiveCampaign">
    <rect width="24" height="24" rx="5" fill="#004CFF"/>
    <path fill="#FFFFFF" d="M6 14.5l3.5-7h3l-3.5 7H6zm5.5 0l3.5-7h3l-3.5 7h-3z"/>
  </svg>

{:else if resolvedBrand === 'copper'}
  <!-- Official Copper CRM Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Copper CRM">
    <rect width="24" height="24" rx="5" fill="#F35369"/>
    <path fill="#FFFFFF" d="M12 6a6 6 0 0 0-4.2 10.2l2-1.7a3.5 3.5 0 1 1 4.4 0l2 1.7A6 6 0 0 0 12 6z"/>
  </svg>

{:else if resolvedBrand === 'freshsales'}
  <!-- Official Freshsales Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Freshsales">
    <rect width="24" height="24" rx="5" fill="#FF5722"/>
    <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
    <path fill="#FFFFFF" d="M6.5 18a5.5 5.5 0 0 1 11 0h-11z"/>
  </svg>

{:else if resolvedBrand === 'twitter'}
  <!-- Official X / Twitter Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="X / Twitter">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path fill="#FFFFFF" d="M15.8 5h2.4l-5.3 6.1 6.2 8.2h-4.8l-3.8-5-4.3 5H3.8l5.7-6.5L3.5 5h5l3.5 4.6L15.8 5zm-.9 12.8h1.3L7.7 6.4H6.3l8.6 11.4z"/>
  </svg>

{:else if resolvedBrand === 'pinterest'}
  <!-- Official Pinterest Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Pinterest">
    <circle cx="12" cy="12" r="12" fill="#BD081C"/>
    <path fill="#FFFFFF" d="M12 5a7 7 0 0 0-2.4 13.6c-.1-.6-.2-1.5 0-2.2l1.3-5.5s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6 1 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.8-.3 1.1.6 2.1 1.7 2.1 2 0 3.6-2.1 3.6-5.2 0-2.7-2-4.6-4.8-4.6-3.3 0-5.2 2.5-5.2 5 0 1 .4 2.1 1 2.7.1.1.1.2.1.3l-.3 1.3c0 .2-.2.2-.4.1-1.4-.7-2.3-2.7-2.3-4.4 0-3.6 2.6-6.8 7.5-6.8 3.9 0 7 2.8 7 6.6 0 3.9-2.5 7.1-5.9 7.1-1.2 0-2.3-.6-2.6-1.3l-.7 2.8c-.3 1-1 2.3-1.5 3.1A7 7 0 1 0 12 5z"/>
  </svg>

{:else if resolvedBrand === 'reddit'}
  <!-- Official Reddit Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Reddit">
    <circle cx="12" cy="12" r="12" fill="#FF4500"/>
    <path fill="#FFFFFF" d="M17.8 11.8a1.5 1.5 0 0 0-1.5-1.5c-.4 0-.8.2-1.1.4-1-.7-2.4-1.2-4-1.2l.7-3.3 2.3.5a1.2 1.2 0 1 0 1.2-1.2 1.2 1.2 0 0 0-1.1.7l-2.7-.6a.3.3 0 0 0-.4.2l-.9 4c-1.6.1-3 .5-4 1.2a1.5 1.5 0 0 0-1.1-.4 1.5 1.5 0 0 0-1.5 1.5c0 .6.3 1.1.8 1.3 0 .2 0 .4 0 .7 0 2.4 2.8 4.3 6.3 4.3s6.3-1.9 6.3-4.3c0-.2 0-.5 0-.7.5-.2.8-.7.8-1.3zm-8.6 1.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4.6 2.6c-.6.6-1.7.6-2.3 0a.3.3 0 0 1 .4-.4c.4.4 1.1.4 1.5 0a.3.3 0 0 1 .4.4zm.5-2.6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
  </svg>

{:else if resolvedBrand === 'threads'}
  <!-- Official Threads Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Threads">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path fill="#FFFFFF" d="M15.4 10.4c-.1-.2-.3-.5-.6-.7-.5-.4-1.3-.7-2.3-.7-1.8 0-3.3 1.2-3.7 3-.3 1.4.3 2.7 1.6 3.3.8.4 1.7.4 2.4.1.7-.3 1.3-.9 1.6-1.7h1.4c-.4 1.3-1.2 2.3-2.3 2.9-1.2.6-2.6.6-3.8 0-1.8-1-2.7-2.9-2.3-4.9.5-2.5 2.6-4.3 5.1-4.3 1.5 0 2.8.5 3.7 1.3.9.9 1.4 2.1 1.4 3.5 0 1.6-.6 3-1.7 4-1.2 1.1-2.8 1.6-4.7 1.6-2.4 0-4.5-.8-5.9-2.3-1.4-1.6-2.1-3.8-2-6.2.2-4.5 3.8-8.1 8.3-8.1 2.3 0 4.5.9 6.1 2.5l-1 1c-1.3-1.3-3.1-2-5.1-2-3.7 0-6.7 3-6.8 6.7-.1 2 .5 3.8 1.6 5.1 1.2 1.3 2.9 2 5 2 1.6 0 2.9-.4 3.8-1.3.8-.8 1.3-1.9 1.3-3.2 0-1.1-.4-2-1.1-2.7z"/>
  </svg>

{:else if resolvedBrand === 'buffer'}
  <!-- Official Buffer Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Buffer">
    <rect width="24" height="24" rx="5" fill="#2C4BFF"/>
    <path fill="#FFFFFF" d="M12 4.5L5 8.2l7 3.8 7-3.8L12 4.5zm-5 6.7l5 2.7 5-2.7 2 1.1-7 3.8-7-3.8 2-1.1zm0 4.2l5 2.7 5-2.7 2 1.1-7 3.8-7-3.8 2-1.1z"/>
  </svg>

{:else if resolvedBrand === 'google_ads'}
  <!-- Official Google Ads Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Ads">
    <path fill="#FABB05" d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998zm19.4643-6.0004L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644z"/>
    <path fill="#4285F4" d="M7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z"/>
  </svg>

{:else if resolvedBrand === 'mailchimp'}
  <!-- Official Mailchimp Authentic Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Mailchimp">
    <rect width="24" height="24" rx="5" fill="#FFE01B"/>
    <path fill="#241C15" d="M11.267 0C6.791-.015-1.82 10.246 1.397 12.964l.79.669a3.88 3.88 0 0 0-.22 1.792c.084.84.518 1.644 1.22 2.266.666.59 1.542.964 2.392.964 1.406 3.24 4.62 5.228 8.386 5.34 4.04.12 7.433-1.776 8.854-5.182.093-.24.488-1.316.488-2.267 0-.956-.54-1.352-.885-1.352-.01-.037-.078-.286-.172-.586-.093-.3-.19-.51-.19-.51.375-.563.382-1.065.332-1.35-.053-.353-.2-.653-.496-.964-.296-.311-.902-.63-1.753-.868l-.446-.124c-.002-.019-.024-1.053-.043-1.497-.014-.32-.042-.822-.197-1.315-.186-.668-.508-1.253-.911-1.627 1.112-1.152 1.806-2.422 1.804-3.511-.003-2.095-2.576-2.729-5.746-1.416l-.672.285A678.22 678.22 0 0 0 12.7.504C12.304.159 11.817.002 11.267 0zm.073.873c.166 0 .322.019.465.058.297.084 1.28 1.224 1.28 1.224s-1.826 1.013-3.52 2.426c-2.28 1.757-4.005 4.311-5.037 7.082-.811.158-1.526.618-1.963 1.253-.261-.218-.748-.64-.834-.804-.698-1.326.761-3.902 1.781-5.357C5.834 3.44 9.37.867 11.34.873z"/>
  </svg>

{:else if resolvedBrand === 'klaviyo'}
  <!-- Official Klaviyo Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Klaviyo">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path fill="#FFFFFF" d="M7 6h2.5v12H7V6zm9.5 0l-5 6 5 6h-3.2l-4-4.8v-2.4l4-4.8h3.2z"/>
  </svg>

{:else if resolvedBrand === 'brevo'}
  <!-- Official Brevo Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Brevo">
    <rect width="24" height="24" rx="5" fill="#0B996F"/>
    <path fill="#FFFFFF" d="M8 6h4.5a3.5 3.5 0 0 1 2.5 6 3.5 3.5 0 0 1-2.5 6H8V6zm2.5 5h2a1.5 1.5 0 0 0 0-3h-2v3zm0 4.5h2a1.5 1.5 0 0 0 0-3h-2v3z"/>
  </svg>

{:else if resolvedBrand === 'omnisend'}
  <!-- Official Omnisend Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Omnisend">
    <rect width="24" height="24" rx="5" fill="#13D596"/>
    <circle cx="12" cy="12" r="5.5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
    <path fill="#FFFFFF" d="M12 6.5A5.5 5.5 0 0 1 17.5 12h-2.5A3 3 0 0 0 12 9V6.5z"/>
  </svg>

{:else if resolvedBrand === 'convertkit'}
  <!-- Official ConvertKit Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="ConvertKit">
    <rect width="24" height="24" rx="5" fill="#FF5887"/>
    <path fill="#FFFFFF" d="M7 6.5a1.5 1.5 0 0 1 1.5-1.5h7a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 9.5v-3zm0 8a1.5 1.5 0 0 1 1.5-1.5h7a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5v-3z"/>
  </svg>

{:else if resolvedBrand === 'drip'}
  <!-- Official Drip Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Drip">
    <rect width="24" height="24" rx="5" fill="#7400FF"/>
    <path fill="#FF007A" d="M12 4.5c2.5 3.5 5 7 5 9.5a5 5 0 1 1-10 0c0-2.5 2.5-6 5-9.5z"/>
    <circle cx="10" cy="14" r="1.5" fill="#FFFFFF"/>
  </svg>

{:else if resolvedBrand === 'constant_contact'}
  <!-- Official Constant Contact Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Constant Contact">
    <rect width="24" height="24" rx="5" fill="#0A52CC"/>
    <circle cx="10" cy="12" r="4.5" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="14" cy="12" r="4.5" fill="none" stroke="#68A5FF" stroke-width="2"/>
  </svg>

{:else if resolvedBrand === 'outlook'}
  <!-- Official Microsoft Outlook Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Outlook">
    <rect width="24" height="24" rx="5" fill="#0078D4"/>
    <path fill="#FFFFFF" d="M13 7l7 4.5v6.5a1 1 0 0 1-1 1h-6V7z"/>
    <path fill="#28A8EA" d="M13 7l-7 4.5V19h7V7z"/>
    <rect x="4" y="8" width="8" height="8" rx="2" fill="#005A9E"/>
    <circle cx="8" cy="12" r="2.2" fill="none" stroke="#FFFFFF" stroke-width="1.4"/>
  </svg>

{:else if resolvedBrand === 'onedrive'}
  <!-- Official Microsoft OneDrive Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft OneDrive">
    <rect width="24" height="24" rx="5" fill="#FFFFFF" stroke="#E2E8F0"/>
    <path fill="#0078D4" d="M8.5 16h8.8a3.2 3.2 0 0 0 .5-6.4 4.5 4.5 0 0 0-8.6-1.1A3.8 3.8 0 0 0 8.5 16z"/>
    <path fill="#28A8EA" d="M14 16h4.5a3 3 0 0 0 0-6 3.5 3.5 0 0 0-3.3 2 3.8 3.8 0 0 1-1.2 4z"/>
  </svg>

{:else if resolvedBrand === 'excel'}
  <!-- Official Microsoft Excel Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Excel">
    <rect width="24" height="24" rx="5" fill="#107C41"/>
    <path fill="#FFFFFF" d="M12.5 6.5H19a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.5v-11z"/>
    <rect x="4" y="6" width="9" height="12" rx="2" fill="#0A5A2B"/>
    <path fill="#FFFFFF" d="M6.5 9l2 3-2 3h1.6l1.2-2 1.2 2H11l-2-3 2-3H9.5L8.3 11 7.1 9H6.5z"/>
  </svg>

{:else if resolvedBrand === 'onenote'}
  <!-- Official Microsoft OneNote Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft OneNote">
    <rect width="24" height="24" rx="5" fill="#7719AA"/>
    <path fill="#FFFFFF" d="M12.5 6.5H19a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.5v-11z"/>
    <rect x="4" y="6" width="9" height="12" rx="2" fill="#520F76"/>
    <path fill="#FFFFFF" d="M6.5 9h1.5l2.2 4.2V9h1.3v6h-1.5L7.8 10.8V15H6.5V9z"/>
  </svg>

{:else if resolvedBrand === 'sharepoint'}
  <!-- Official Microsoft SharePoint Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft SharePoint">
    <rect width="24" height="24" rx="5" fill="#038387"/>
    <circle cx="10" cy="10" r="4" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>
    <circle cx="14" cy="13.5" r="3.5" fill="none" stroke="#68C7C9" stroke-width="1.8"/>
  </svg>

{:else if resolvedBrand === 'ms_planner'}
  <!-- Official Microsoft Planner Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Planner">
    <rect width="24" height="24" rx="5" fill="#31752F"/>
    <path fill="#FFFFFF" d="M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm2 3.5l-1.5 1.5 3 3 5-5-1.5-1.5-3.5 3.5-1.5-1.5z"/>
  </svg>

{:else if resolvedBrand === 'power_bi'}
  <!-- Official Microsoft Power BI Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Microsoft Power BI">
    <rect width="24" height="24" rx="5" fill="#F2C811"/>
    <rect x="6" y="13" width="3" height="6" rx="1" fill="#102A56"/>
    <rect x="10.5" y="9" width="3" height="10" rx="1" fill="#102A56"/>
    <rect x="15" y="5" width="3" height="14" rx="1" fill="#102A56"/>
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
  <!-- Official Cloudinary Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Cloudinary">
    <rect width="24" height="24" rx="5" fill="#3448C5"/>
    <path fill="#FFFFFF" d="M8.5 15.5h7a3 3 0 0 0 .5-6 4 4 0 0 0-7.8-1 3.5 3.5 0 0 0 .3 7z"/>
    <circle cx="12" cy="11.5" r="1.5" fill="#3448C5"/>
  </svg>

{:else if resolvedBrand === 'supabase'}
  <!-- Official Supabase Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Supabase">
    <rect width="24" height="24" rx="5" fill="#1C1C1C"/>
    <path fill="#3ECF8E" d="M13.5 4.5L5.5 14h7L10.5 19.5 18.5 10h-7l2-5.5z"/>
  </svg>

{:else if resolvedBrand === 'dropbox'}
  <!-- Official Dropbox Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Dropbox">
    <rect width="24" height="24" rx="5" fill="#0061FF"/>
    <path fill="#FFFFFF" d="M6 7l6 4-3.5 2.5L2.5 9.5 6 7zm12 0l3.5 2.5-6 4L8.5 11 18 7zM2.5 14.5L6 17l6-4-3.5-2.5-6 4zm19 0L18 17l-6-4 3.5-2.5 6 4zM12 14.5l3.5 2.5-3.5 2.5-3.5-2.5 3.5-2.5z"/>
  </svg>

{:else if resolvedBrand === 'box'}
  <!-- Official Box Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Box">
    <rect width="24" height="24" rx="5" fill="#0061D5"/>
    <path fill="#FFFFFF" d="M8 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm8 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm-4 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
  </svg>

{:else if resolvedBrand === 'google_cloud'}
  <!-- Official Google Cloud Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google Cloud">
    <rect width="24" height="24" rx="5" fill="#FFFFFF" stroke="#E2E8F0"/>
    <path fill="#4285F4" d="M9.5 15.5h5a2.5 2.5 0 0 0 .5-5 3.5 3.5 0 0 0-6.8-.8A3 3 0 0 0 9.5 15.5z"/>
    <path fill="#EA4335" d="M12 7.5a3.5 3.5 0 0 0-3.3 2.2 3 3 0 0 1 3.3-2.2z"/>
    <path fill="#FBBC04" d="M14.5 10.5a2.5 2.5 0 0 1 .5 5h-1a2.5 2.5 0 0 0 .5-5z"/>
    <path fill="#34A853" d="M9.5 15.5h4a2.5 2.5 0 0 1-4 0z"/>
  </svg>

{:else if resolvedBrand === 'cloudflare'}
  <!-- Official Cloudflare Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Cloudflare">
    <rect width="24" height="24" rx="5" fill="#F38020"/>
    <path fill="#FFFFFF" d="M15.5 9.5a3.8 3.8 0 0 0-4.3 1.3 2.5 2.5 0 0 0-3.7 2.2c0 .2 0 .4.1.6H6.5a2.5 2.5 0 0 0 0 5h11a3.5 3.5 0 0 0 0-7c-.6 0-1.3.1-2 .4z"/>
    <path fill="#FAAE40" d="M17.5 13.5a3.5 3.5 0 0 1 0 5.1h-4.2l.8-2.6a1.5 1.5 0 0 1 1.4-1c.7 0 1.3-.5 1.5-1.2.1-.1.3-.2.5-.3z"/>
  </svg>

{:else if resolvedBrand === 'backblaze'}
  <!-- Official Backblaze Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Backblaze">
    <rect width="24" height="24" rx="5" fill="#E2231A"/>
    <path fill="#FFFFFF" d="M12 4.5c1.8 3 4.5 6 3.5 9.5-.8 2.5-3 3.5-5 3.5-3 0-5-2-5-5 0-3.5 4-5.5 6.5-8z"/>
  </svg>

{:else if resolvedBrand === 'imgur'}
  <!-- Official Imgur Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Imgur">
    <rect width="24" height="24" rx="5" fill="#1BB76E"/>
    <circle cx="9" cy="8.5" r="1.5" fill="#FFFFFF"/>
    <rect x="7.5" y="11.5" width="3" height="6.5" rx="1.5" fill="#FFFFFF"/>
    <circle cx="15" cy="8.5" r="1.5" fill="#FFFFFF"/>
    <rect x="13.5" y="11.5" width="3" height="6.5" rx="1.5" fill="#FFFFFF"/>
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
  <!-- Official Todoist Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Todoist">
    <rect width="24" height="24" rx="5" fill="#E44332"/>
    <path fill="#FFFFFF" d="M7 8l5 4 5-4-1.5-1.5L12 9 8.5 6.5 7 8zm0 4.5l5 4 5-4-1.5-1.5L12 13.5 8.5 11 7 12.5zm0 4.5l5 4 5-4-1.5-1.5L12 18 8.5 15.5 7 17z"/>
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
  <!-- Official GitHub Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="GitHub">
    <circle cx="12" cy="12" r="12" fill="#181717"/>
    <path fill="#FFFFFF" fill-rule="evenodd" d="M12 4.4a7.6 7.6 0 0 0-2.4 14.8c.4.1.5-.2.5-.4v-1.4c-2.1.5-2.6-.9-2.6-.9-.3-.9-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.8 2.2.6.1-.5.3-.8.5-1-1.7-.2-3.5-.9-3.5-3.8 0-.8.3-1.5.8-2-.1-.2-.4-1 .1-2 0 0 .6-.2 2.1.8a7.3 7.3 0 0 1 3.8 0c1.5-1 2.1-.8 2.1-.8.5 1 .2 1.8.1 2 .5.6.8 1.2.8 2 0 3-1.8 3.6-3.5 3.8.3.3.6.8.6 1.7V19c0 .2.2.5.5.4A7.6 7.6 0 0 0 12 4.4z"/>
  </svg>

{:else if resolvedBrand === 'gitlab'}
  <!-- Official GitLab Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="GitLab">
    <path fill="#E24329" d="M12 20.5l4.5-13.8H7.5L12 20.5z"/>
    <path fill="#FC6D26" d="M12 20.5L7.5 6.7 3 20.5h9z"/>
    <path fill="#FCA326" d="M3 20.5l-1.8-5.6a.8.8 0 0 1 .3-.9L7.5 6.7 3 20.5z"/>
    <path fill="#FC6D26" d="M12 20.5l4.5-13.8L21 20.5h-9z"/>
    <path fill="#FCA326" d="M21 20.5l1.8-5.6a.8.8 0 0 0-.3-.9L16.5 6.7 21 20.5z"/>
  </svg>

{:else if resolvedBrand === 'webhook'}
  <!-- Official Webhook Brand Lightning Trigger -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Webhook">
    <rect width="24" height="24" rx="5" fill="#6366F1"/>
    <path fill="#FFFFFF" d="M13 3L4 14h7v7l9-11h-7V3z"/>
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
  <!-- Official Vercel Brand Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Vercel">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path fill="#FFFFFF" d="M12 6l6 11H6l6-11z"/>
  </svg>

{:else if resolvedBrand === 'notion'}
  <!-- Official Notion Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Notion">
    <rect width="24" height="24" rx="4.5" fill="#000000"/>
    <path fill="#FFFFFF" d="M5.5 5.5v13h2.6l6.3-8.8v7.8h2.6v-13h-2.6l-6.3 8.8V5.5H5.5z"/>
  </svg>

{:else if resolvedBrand === 'midjourney'}
  <!-- Official Midjourney Ship Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Midjourney">
    <rect width="24" height="24" rx="5" fill="#0D0F1A"/>
    <path fill="#FFFFFF" d="M12 4.5l1.6 4.7 4.9.4-3.7 3.3 1.1 4.8L12 15.2l-3.9 2.5 1.1-4.8-3.7-3.3 4.9-.4L12 4.5z"/>
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

{:else if resolvedBrand === 'google'}
  <!-- Official Google Brand 4-Color Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} class={className} aria-label="Google">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.39 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
  </svg>

{:else if resolvedBrand === 'wordpress'}
  <!-- Official WordPress Brand Icon -->
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
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
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
