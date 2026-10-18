export interface ToolConnectorField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number';
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export interface ToolConnector {
  id: string;
  name: string;
  category:
    | 'Google Workspace'
    | 'Messaging & Channels'
    | 'E-Commerce & Payments'
    | 'CRM & Leads'
    | 'Social Media'
    | 'Marketing & Ads'
    | 'Microsoft 365'
    | 'Storage & Media'
    | 'Productivity'
    | 'Developer Utilities';
  icon: string;
  description: string;
  authType: 'api_key' | 'oauth' | 'webhook' | 'smtp' | 'credentials';
  badge?: string;
  actions: string[];
  fields?: ToolConnectorField[];
}

export const TOOL_CATEGORIES = [
  'Google Workspace',
  'Messaging & Channels',
  'E-Commerce & Payments',
  'CRM & Leads',
  'Social Media',
  'Marketing & Ads',
  'Microsoft 365',
  'Storage & Media',
  'Productivity',
  'Developer Utilities'
] as const;

export type ToolCategoryName = (typeof TOOL_CATEGORIES)[number];

export const TOOL_CONNECTORS: ToolConnector[] = [
  // 1. Google Workspace (10)
  {
    id: 'google_gmail',
    name: 'Gmail',
    category: 'Google Workspace',
    icon: 'Mail',
    description: 'Send and receive emails, manage drafts, create labels, and search inbox threads.',
    authType: 'oauth',
    badge: 'Popular',
    actions: ['Send Email', 'Create Draft', 'Search Threads', 'Read Messages'],
    fields: [{ key: 'email', label: 'Google Account Email', type: 'text', placeholder: 'user@gmail.com', required: true }]
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'Google Workspace',
    icon: 'Table',
    description: 'Append rows, update cell ranges, and automate spreadsheet calculations.',
    authType: 'oauth',
    badge: 'Essential',
    actions: ['Append Row', 'Read Range', 'Update Cells', 'Create Sheet'],
    fields: [{ key: 'spreadsheetId', label: 'Spreadsheet ID / URL', type: 'text', required: true }]
  },
  {
    id: 'google_docs',
    name: 'Google Docs',
    category: 'Google Workspace',
    icon: 'FileText',
    description: 'Generate documents, append rich formatted text, and export to PDF.',
    authType: 'oauth',
    actions: ['Create Document', 'Append Text', 'Export to PDF'],
    fields: [{ key: 'folderId', label: 'Destination Folder ID', type: 'text' }]
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'Google Workspace',
    icon: 'Folder',
    description: 'Upload files, manage folders, and generate shareable links.',
    authType: 'oauth',
    actions: ['Upload File', 'Create Folder', 'Get Share Link', 'Search Files'],
    fields: [{ key: 'rootFolder', label: 'Root Folder Name', type: 'text' }]
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'Google Workspace',
    icon: 'Calendar',
    description: 'Create events, check attendee availability, and send calendar invites.',
    authType: 'oauth',
    actions: ['Create Event', 'List Events', 'Send Invites'],
    fields: [{ key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary' }]
  },
  {
    id: 'google_forms',
    name: 'Google Forms',
    category: 'Google Workspace',
    icon: 'CheckSquare',
    description: 'Listen to new form submissions and collect lead survey data.',
    authType: 'oauth',
    actions: ['Fetch Responses', 'On Submission Webhook'],
    fields: [{ key: 'formId', label: 'Form ID', type: 'text', required: true }]
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    category: 'Google Workspace',
    icon: 'Video',
    description: 'Generate instant Google Meet links for client consultations.',
    authType: 'oauth',
    actions: ['Create Meeting Room', 'Generate Meet Link']
  },
  {
    id: 'google_contacts',
    name: 'Google Contacts',
    category: 'Google Workspace',
    icon: 'UserCheck',
    description: 'Sync client address books, add contacts, and search phone numbers.',
    authType: 'oauth',
    actions: ['Create Contact', 'Search Contacts', 'Update Details']
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics GA4',
    category: 'Google Workspace',
    icon: 'BarChart2',
    description: 'Fetch daily traffic sessions, e-commerce conversion rates, and ROAS reports.',
    authType: 'oauth',
    actions: ['Get Daily Traffic', 'Get Conversion Report'],
    fields: [{ key: 'propertyId', label: 'GA4 Property ID', type: 'text', required: true }]
  },
  {
    id: 'google_youtube',
    name: 'YouTube Data API',
    category: 'Google Workspace',
    icon: 'PlayCircle',
    description: 'Upload videos, update video titles/tags, and monitor channel metrics.',
    authType: 'oauth',
    actions: ['Update Video Metadata', 'Schedule Video', 'Fetch Comments']
  },

  // 2. Messaging & Channels (10)
  {
    id: 'channel_whatsapp',
    name: 'WhatsApp Engine (Baileys)',
    category: 'Messaging & Channels',
    icon: 'MessageSquare',
    description: 'Send direct messages, interactive buttons, and media to clients via WhatsApp.',
    authType: 'credentials',
    badge: 'Popular',
    actions: ['Send Message', 'Send Image / PDF', 'Interactive Buttons', 'Inbound Trigger'],
    fields: [{ key: 'sessionPhone', label: 'WhatsApp Phone Number', type: 'text', placeholder: '8801700000000' }]
  },
  {
    id: 'channel_telegram',
    name: 'Telegram Bot API',
    category: 'Messaging & Channels',
    icon: 'Send',
    description: 'Dispatch alerts, command helpers via slash commands, and broadcast news.',
    authType: 'api_key',
    badge: 'High Speed',
    actions: ['Send Message', 'Send Photo', 'Slash Command Listener'],
    fields: [{ key: 'botToken', label: 'Telegram Bot Token', type: 'password', required: true }]
  },
  {
    id: 'channel_slack',
    name: 'Slack Webhooks & Bot',
    category: 'Messaging & Channels',
    icon: 'Hash',
    description: 'Post automated notifications, team alerts, and interactive block kits.',
    authType: 'webhook',
    actions: ['Post Message', 'Send Webhook', 'Upload File'],
    fields: [{ key: 'webhookUrl', label: 'Slack Webhook URL', type: 'url', required: true }]
  },
  {
    id: 'channel_discord',
    name: 'Discord Bot',
    category: 'Messaging & Channels',
    icon: 'MessageCircle',
    description: 'Publish announcements, rich embed cards, and automated server alerts.',
    authType: 'webhook',
    actions: ['Send Embed', 'Post Webhook Message'],
    fields: [{ key: 'webhookUrl', label: 'Discord Webhook URL', type: 'url', required: true }]
  },
  {
    id: 'channel_messenger',
    name: 'Facebook Messenger',
    category: 'Messaging & Channels',
    icon: 'MessageSquare',
    description: 'Automate Facebook page inbox replies and customer sales funnels.',
    authType: 'api_key',
    actions: ['Send Message', 'Send Quick Replies'],
    fields: [{ key: 'pageAccessToken', label: 'Page Access Token', type: 'password', required: true }]
  },
  {
    id: 'channel_twilio',
    name: 'Twilio SMS & WhatsApp',
    category: 'Messaging & Channels',
    icon: 'PhoneCall',
    description: 'Programmable global SMS notifications and automated OTP verification.',
    authType: 'credentials',
    actions: ['Send SMS', 'Send WhatsApp Message'],
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', required: true }
    ]
  },
  {
    id: 'channel_custom_smtp',
    name: 'Custom SMTP Server',
    category: 'Messaging & Channels',
    icon: 'Server',
    description: 'Send custom branded business emails directly from your own domain.',
    authType: 'smtp',
    actions: ['Send Email', 'Send Bulk HTML Mail'],
    fields: [
      { key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.mailgun.org', required: true },
      { key: 'port', label: 'Port', type: 'number', placeholder: '587', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true }
    ]
  },
  {
    id: 'channel_sendgrid',
    name: 'SendGrid',
    category: 'Messaging & Channels',
    icon: 'Mail',
    description: 'Enterprise transactional email delivery and newsletter broadcasting.',
    authType: 'api_key',
    actions: ['Send Email', 'Add Contact to List'],
    fields: [{ key: 'apiKey', label: 'SendGrid API Key', type: 'password', required: true }]
  },
  {
    id: 'channel_mailgun',
    name: 'Mailgun',
    category: 'Messaging & Channels',
    icon: 'Mail',
    description: 'High-volume email delivery with click tracking and bounce handling.',
    authType: 'api_key',
    actions: ['Send Email', 'Track Analytics'],
    fields: [{ key: 'apiKey', label: 'Mailgun API Key', type: 'password', required: true }]
  },
  {
    id: 'channel_postmark',
    name: 'Postmark',
    category: 'Messaging & Channels',
    icon: 'Zap',
    description: 'Ultra-fast transactional email dispatch with sub-second delivery.',
    authType: 'api_key',
    actions: ['Send Transactional Mail'],
    fields: [{ key: 'serverToken', label: 'Postmark Server Token', type: 'password', required: true }]
  },

  // 3. E-Commerce & Payments (12)
  {
    id: 'ecom_shopify',
    name: 'Shopify API',
    category: 'E-Commerce & Payments',
    icon: 'ShoppingBag',
    description: 'Sync store products, listen for new orders, and update inventory.',
    authType: 'credentials',
    badge: 'Popular',
    actions: ['Create Product', 'Get New Orders', 'Update Inventory', 'Customer Sync'],
    fields: [
      { key: 'storeUrl', label: 'Shopify Store URL', type: 'text', placeholder: 'yourstore.myshopify.com', required: true },
      { key: 'accessToken', label: 'Admin API Access Token', type: 'password', required: true }
    ]
  },
  {
    id: 'ecom_woocommerce',
    name: 'WooCommerce REST',
    category: 'E-Commerce & Payments',
    icon: 'ShoppingCart',
    description: 'WordPress e-commerce sync, customer updates, and order automation.',
    authType: 'credentials',
    actions: ['Create Product', 'Fetch Orders', 'Update Order Status'],
    fields: [
      { key: 'siteUrl', label: 'WordPress Site URL', type: 'url', required: true },
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'pay_bkash',
    name: 'bKash Merchant API',
    category: 'E-Commerce & Payments',
    icon: 'CreditCard',
    description: 'Bangladesh mobile payment gateway: create payment links & query transactions.',
    authType: 'credentials',
    badge: 'Bangladesh',
    actions: ['Create Payment URL', 'Query Payment', 'Search Transaction'],
    fields: [
      { key: 'appKey', label: 'App Key', type: 'text', required: true },
      { key: 'appSecret', label: 'App Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'pay_nagad',
    name: 'Nagad Merchant API',
    category: 'E-Commerce & Payments',
    icon: 'CreditCard',
    description: 'Nagad mobile payment verification and automated payment callbacks.',
    authType: 'credentials',
    badge: 'Bangladesh',
    actions: ['Verify Payment', 'Check Transaction Status'],
    fields: [{ key: 'merchantId', label: 'Nagad Merchant ID', type: 'text', required: true }]
  },
  {
    id: 'pay_stripe',
    name: 'Stripe',
    category: 'E-Commerce & Payments',
    icon: 'DollarSign',
    description: 'International card checkout sessions, invoicing, and subscription renewals.',
    authType: 'api_key',
    actions: ['Create Checkout Session', 'Create Invoice', 'Customer Sync'],
    fields: [{ key: 'secretKey', label: 'Stripe Secret Key', type: 'password', required: true }]
  },
  {
    id: 'pay_paypal',
    name: 'PayPal',
    category: 'E-Commerce & Payments',
    icon: 'DollarSign',
    description: 'Global invoicing, order verification, and recurring billing.',
    authType: 'credentials',
    actions: ['Create Order', 'Verify Payment'],
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'ecom_daraz',
    name: 'Daraz Open Platform',
    category: 'E-Commerce & Payments',
    icon: 'Package',
    description: 'Daraz Bangladesh & South Asia marketplace order sync and SKU listings.',
    authType: 'credentials',
    actions: ['Get New Orders', 'Sync SKU Inventory'],
    fields: [{ key: 'apiKey', label: 'Daraz API Key', type: 'password', required: true }]
  },
  {
    id: 'ecom_meta_catalog',
    name: 'Facebook Commerce Catalog',
    category: 'E-Commerce & Payments',
    icon: 'Grid',
    description: 'Sync product inventory to Meta Facebook Shop and Instagram Checkout.',
    authType: 'api_key',
    actions: ['Upload Catalog Items', 'Update Product Prices'],
    fields: [{ key: 'catalogId', label: 'Catalog ID', type: 'text', required: true }]
  },
  {
    id: 'ecom_amazon',
    name: 'Amazon Seller Central',
    category: 'E-Commerce & Payments',
    icon: 'Box',
    description: 'Amazon SP-API order retrieval, inventory tracking, and FBA fulfillment.',
    authType: 'credentials',
    actions: ['Get Orders', 'Sync Inventory']
  },
  {
    id: 'pay_paddle',
    name: 'Paddle',
    category: 'E-Commerce & Payments',
    icon: 'CreditCard',
    description: 'Global software checkout, SaaS licensing, and automated sales VAT.',
    authType: 'api_key',
    actions: ['Create Transaction', 'Manage Subscription'],
    fields: [{ key: 'apiKey', label: 'Paddle API Key', type: 'password', required: true }]
  },
  {
    id: 'pay_lemon_squeezy',
    name: 'Lemon Squeezy',
    category: 'E-Commerce & Payments',
    icon: 'ShoppingBag',
    description: 'Digital product delivery, license key generation, and customer portal.',
    authType: 'api_key',
    actions: ['Create Checkout', 'Validate License Key'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },
  {
    id: 'pay_sslcommerz',
    name: 'SSLCOMMERZ',
    category: 'E-Commerce & Payments',
    icon: 'CreditCard',
    description: 'Multi-card and mobile banking aggregator for Bangladesh businesses.',
    authType: 'credentials',
    actions: ['Initiate Session', 'Validate IPN'],
    fields: [{ key: 'storeId', label: 'Store ID', type: 'text', required: true }]
  },

  // 4. CRM & Leads (11)
  {
    id: 'crm_hubspot',
    name: 'HubSpot CRM',
    category: 'CRM & Leads',
    icon: 'Users',
    description: 'Create & update contacts, log sales deals, and trigger marketing pipelines.',
    authType: 'api_key',
    badge: 'Popular',
    actions: ['Create Contact', 'Log Deal', 'Update Lifecycle Stage'],
    fields: [{ key: 'accessToken', label: 'Private App Access Token', type: 'password', required: true }]
  },
  {
    id: 'crm_salesforce',
    name: 'Salesforce',
    category: 'CRM & Leads',
    icon: 'Cloud',
    description: 'Enterprise lead capture, opportunity pipeline updates, and account records.',
    authType: 'oauth',
    actions: ['Create Lead', 'Update Opportunity']
  },
  {
    id: 'crm_zoho',
    name: 'Zoho CRM',
    category: 'CRM & Leads',
    icon: 'UserCheck',
    description: 'Contact synchronization, lead status changes, and deal milestones.',
    authType: 'api_key',
    actions: ['Add Lead', 'Update Contact'],
    fields: [{ key: 'authDomain', label: 'Zoho Domain', type: 'text', placeholder: 'accounts.zoho.com' }]
  },
  {
    id: 'crm_pipedrive',
    name: 'Pipedrive',
    category: 'CRM & Leads',
    icon: 'Columns',
    description: 'Visual sales funnel management, deal stages, and call logging.',
    authType: 'api_key',
    actions: ['Create Deal', 'Add Person', 'Move Stage'],
    fields: [{ key: 'apiToken', label: 'API Token', type: 'password', required: true }]
  },
  {
    id: 'crm_notion',
    name: 'Notion API',
    category: 'CRM & Leads',
    icon: 'BookOpen',
    description: 'Append rows to Notion databases, create pages, and update task boards.',
    authType: 'api_key',
    badge: 'Popular',
    actions: ['Create Page', 'Append Database Item', 'Query Database'],
    fields: [
      { key: 'internalToken', label: 'Internal Integration Token', type: 'password', required: true },
      { key: 'databaseId', label: 'Default Database ID', type: 'text' }
    ]
  },
  {
    id: 'crm_airtable',
    name: 'Airtable',
    category: 'CRM & Leads',
    icon: 'Grid',
    description: 'Sync relational table records, trigger workflows, and automate fields.',
    authType: 'api_key',
    actions: ['Create Record', 'Update Record', 'Search Records'],
    fields: [
      { key: 'personalToken', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'baseId', label: 'Base ID', type: 'text' }
    ]
  },
  {
    id: 'crm_mailchimp',
    name: 'Mailchimp',
    category: 'CRM & Leads',
    icon: 'Mail',
    description: 'Add new email subscribers, assign tags, and trigger drip automations.',
    authType: 'api_key',
    actions: ['Add Subscriber', 'Tag Contact'],
    fields: [{ key: 'apiKey', label: 'Mailchimp API Key', type: 'password', required: true }]
  },
  {
    id: 'crm_activecampaign',
    name: 'ActiveCampaign',
    category: 'CRM & Leads',
    icon: 'Activity',
    description: 'Contact lead scoring, behavioral tags, and marketing automations.',
    authType: 'api_key',
    actions: ['Create Contact', 'Add Tag', 'Track Event'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },
  {
    id: 'crm_clickup',
    name: 'ClickUp',
    category: 'CRM & Leads',
    icon: 'CheckCircle',
    description: 'Create tasks, assign team members, and update milestone deadlines.',
    authType: 'api_key',
    actions: ['Create Task', 'Update Task Status'],
    fields: [{ key: 'apiKey', label: 'ClickUp API Token', type: 'password', required: true }]
  },
  {
    id: 'crm_monday',
    name: 'Monday.com',
    category: 'CRM & Leads',
    icon: 'Calendar',
    description: 'Manage project items, update column values, and team assignees.',
    authType: 'api_key',
    actions: ['Create Item', 'Update Column Value'],
    fields: [{ key: 'apiKey', label: 'API Token', type: 'password', required: true }]
  },
  {
    id: 'crm_close',
    name: 'Close CRM',
    category: 'CRM & Leads',
    icon: 'PhoneForwarded',
    description: 'High-velocity sales calling, automated email sequences, and lead tracking.',
    authType: 'api_key',
    actions: ['Create Lead', 'Log Call'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },

  // 5. Social Media (10)
  {
    id: 'social_facebook_pages',
    name: 'Facebook Pages',
    category: 'Social Media',
    icon: 'Share2',
    description: 'Publish page posts, schedule photos, and auto-reply to comments.',
    authType: 'oauth',
    badge: 'Popular',
    actions: ['Publish Post', 'Schedule Post', 'Post Photo']
  },
  {
    id: 'social_instagram',
    name: 'Instagram Graph API',
    category: 'Social Media',
    icon: 'Instagram',
    description: 'Publish carousels, schedule reels, and fetch audience insights.',
    authType: 'oauth',
    badge: 'Popular',
    actions: ['Publish Carousel', 'Publish Reel', 'Get Insights']
  },
  {
    id: 'social_tiktok',
    name: 'TikTok for Business',
    category: 'Social Media',
    icon: 'Video',
    description: 'Upload short-form video creative assets and schedule campaigns.',
    authType: 'oauth',
    actions: ['Upload Video', 'Track Video Views']
  },
  {
    id: 'social_linkedin',
    name: 'LinkedIn API',
    category: 'Social Media',
    icon: 'Linkedin',
    description: 'Publish personal thought leadership and company page updates.',
    authType: 'oauth',
    actions: ['Publish Update', 'Publish Article Link']
  },
  {
    id: 'social_twitter',
    name: 'X (Twitter) v2',
    category: 'Social Media',
    icon: 'Twitter',
    description: 'Post tweets, publish threads, and query keyword mentions.',
    authType: 'credentials',
    actions: ['Post Tweet', 'Post Thread', 'Search Mentions'],
    fields: [{ key: 'bearerToken', label: 'Bearer Token', type: 'password', required: true }]
  },
  {
    id: 'social_pinterest',
    name: 'Pinterest API',
    category: 'Social Media',
    icon: 'Image',
    description: 'Create rich pins, assign to visual boards, and drive organic traffic.',
    authType: 'oauth',
    actions: ['Create Pin', 'List Boards']
  },
  {
    id: 'social_reddit',
    name: 'Reddit API',
    category: 'Social Media',
    icon: 'MessageSquare',
    description: 'Post links and text discussions to targeted niche subreddits.',
    authType: 'credentials',
    actions: ['Submit Post', 'Search Subreddit']
  },
  {
    id: 'social_medium',
    name: 'Medium API',
    category: 'Social Media',
    icon: 'FileText',
    description: 'Publish formatted draft and live blog articles with tags.',
    authType: 'api_key',
    actions: ['Publish Article', 'Create Draft'],
    fields: [{ key: 'integrationToken', label: 'Integration Token', type: 'password', required: true }]
  },
  {
    id: 'social_wordpress',
    name: 'WordPress REST API',
    category: 'Social Media',
    icon: 'Globe',
    description: 'Publish blog posts, assign categories, and upload featured images.',
    authType: 'credentials',
    badge: 'Essential',
    actions: ['Create Post', 'Upload Media', 'Update Post'],
    fields: [
      { key: 'endpoint', label: 'WP JSON Endpoint URL', type: 'url', required: true },
      { key: 'appPassword', label: 'Application Password', type: 'password', required: true }
    ]
  },
  {
    id: 'social_webflow',
    name: 'Webflow CMS',
    category: 'Social Media',
    icon: 'Layout',
    description: 'Add items to Webflow CMS collections and publish sites live.',
    authType: 'api_key',
    actions: ['Create CMS Item', 'Publish Site'],
    fields: [{ key: 'apiKey', label: 'API Token', type: 'password', required: true }]
  },

  // 6. Marketing & Ads (10)
  {
    id: 'ads_meta',
    name: 'Meta Ads API',
    category: 'Marketing & Ads',
    icon: 'Target',
    description: 'Monitor campaign ROAS, create ad sets, and pause underperforming ads.',
    authType: 'oauth',
    badge: 'Popular',
    actions: ['Get Campaign ROAS', 'Create Ad Set', 'Pause Ad']
  },
  {
    id: 'ads_google',
    name: 'Google Ads API',
    category: 'Marketing & Ads',
    icon: 'Search',
    description: 'Track keyword performance, check CPC, and monitor conversion actions.',
    authType: 'oauth',
    actions: ['Fetch Campaign Metrics', 'Search Keywords']
  },
  {
    id: 'ads_tiktok',
    name: 'TikTok Ads API',
    category: 'Marketing & Ads',
    icon: 'TrendingUp',
    description: 'Track ad spend, CTR, conversion metrics, and creative performance.',
    authType: 'oauth',
    actions: ['Fetch Campaign Stats', 'Update Budget']
  },
  {
    id: 'mkt_klaviyo',
    name: 'Klaviyo',
    category: 'Marketing & Ads',
    icon: 'Mail',
    description: 'E-commerce automated email flows, cart abandonment, and customer event tracking.',
    authType: 'api_key',
    actions: ['Track Event', 'Add Profile to List'],
    fields: [{ key: 'privateKey', label: 'Private API Key', type: 'password', required: true }]
  },
  {
    id: 'mkt_brevo',
    name: 'Brevo (Sendinblue)',
    category: 'Marketing & Ads',
    icon: 'Send',
    description: 'Transactional email campaigns, marketing automation, and SMS blasts.',
    authType: 'api_key',
    actions: ['Send Transactional Mail', 'Send SMS'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },
  {
    id: 'mkt_bitly',
    name: 'Bitly / Dub.co',
    category: 'Marketing & Ads',
    icon: 'Link',
    description: 'Create branded short links with real-time click tracking and UTM parameters.',
    authType: 'api_key',
    actions: ['Shorten URL', 'Get Click Stats'],
    fields: [{ key: 'apiKey', label: 'API Token', type: 'password', required: true }]
  },
  {
    id: 'mkt_convertkit',
    name: 'ConvertKit / Kit',
    category: 'Marketing & Ads',
    icon: 'Mail',
    description: 'Creator newsletter broadcasts, subscriber tagging, and automation triggers.',
    authType: 'api_key',
    actions: ['Add Subscriber', 'Trigger Sequence'],
    fields: [{ key: 'apiSecret', label: 'API Secret', type: 'password', required: true }]
  },
  {
    id: 'mkt_beehiiv',
    name: 'Beehiiv',
    category: 'Marketing & Ads',
    icon: 'Send',
    description: 'Newsletter publishing, publication subscriber growth, and referral tracking.',
    authType: 'api_key',
    actions: ['Create Post', 'Subscribe Email'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },
  {
    id: 'mkt_semrush',
    name: 'Semrush API',
    category: 'Marketing & Ads',
    icon: 'PieChart',
    description: 'Domain SEO analytics, competitor backlink profiles, and keyword volume.',
    authType: 'api_key',
    actions: ['Keyword Overview', 'Domain Rank'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },
  {
    id: 'mkt_ahrefs',
    name: 'Ahrefs API',
    category: 'Marketing & Ads',
    icon: 'Activity',
    description: 'Backlink index monitoring, organic search keyword tracking, and rank alerts.',
    authType: 'api_key',
    actions: ['Check Backlinks', 'Get Organic Keywords'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },

  // 7. Microsoft 365 (8)
  {
    id: 'ms_outlook',
    name: 'Outlook 365',
    category: 'Microsoft 365',
    icon: 'Mail',
    description: 'Send enterprise emails, search shared mailboxes, and create drafts.',
    authType: 'oauth',
    badge: 'Enterprise',
    actions: ['Send Mail', 'Create Draft', 'List Messages']
  },
  {
    id: 'ms_onedrive',
    name: 'OneDrive',
    category: 'Microsoft 365',
    icon: 'Folder',
    description: 'Upload files, manage business documents, and generate share links.',
    authType: 'oauth',
    actions: ['Upload Document', 'Share Link']
  },
  {
    id: 'ms_excel',
    name: 'Excel Online',
    category: 'Microsoft 365',
    icon: 'Table',
    description: 'Append table rows, calculate formulas, and export corporate sheets.',
    authType: 'oauth',
    actions: ['Append Row', 'Update Range']
  },
  {
    id: 'ms_word',
    name: 'Microsoft Word Online',
    category: 'Microsoft 365',
    icon: 'FileText',
    description: 'Generate formatted proposals, agreements, and corporate DOCX files.',
    authType: 'oauth',
    actions: ['Generate Document', 'Insert Paragraph']
  },
  {
    id: 'ms_teams',
    name: 'Microsoft Teams',
    category: 'Microsoft 365',
    icon: 'Users',
    description: 'Post webhook announcements, meeting summaries, and adaptive cards.',
    authType: 'webhook',
    actions: ['Post to Channel', 'Send Direct Alert'],
    fields: [{ key: 'webhookUrl', label: 'Incoming Webhook URL', type: 'url', required: true }]
  },
  {
    id: 'ms_sharepoint',
    name: 'SharePoint',
    category: 'Microsoft 365',
    icon: 'Share2',
    description: 'Corporate document library sync and organization knowledge assets.',
    authType: 'oauth',
    actions: ['Upload to Library', 'Search Intranet']
  },
  {
    id: 'ms_onenote',
    name: 'OneNote',
    category: 'Microsoft 365',
    icon: 'Book',
    description: 'Notebook sync, meeting notes archive, and quick brain dumps.',
    authType: 'oauth',
    actions: ['Create Note Page', 'Append Section']
  },
  {
    id: 'ms_power_bi',
    name: 'Power BI',
    category: 'Microsoft 365',
    icon: 'BarChart',
    description: 'Trigger data refresh, export executive reports, and monitor KPIs.',
    authType: 'oauth',
    actions: ['Trigger Dataset Refresh', 'Export Report']
  },

  // 8. Storage & Media (10)
  {
    id: 'storage_s3',
    name: 'Amazon S3',
    category: 'Storage & Media',
    icon: 'HardDrive',
    description: 'Upload media assets, generate presigned URLs, and manage storage buckets.',
    authType: 'credentials',
    badge: 'Cloud',
    actions: ['Upload File', 'Generate Signed URL', 'Delete File'],
    fields: [
      { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
      { key: 'region', label: 'AWS Region', type: 'text', placeholder: 'ap-southeast-1', required: true },
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true }
    ]
  },
  {
    id: 'storage_cloudinary',
    name: 'Cloudinary',
    category: 'Storage & Media',
    icon: 'Image',
    description: 'Dynamic image resizing, automatic WebP format conversion, and watermarking.',
    authType: 'credentials',
    actions: ['Upload Image', 'Apply Transformation', 'Optimize Format'],
    fields: [
      { key: 'cloudName', label: 'Cloud Name', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'storage_dropbox',
    name: 'Dropbox',
    category: 'Storage & Media',
    icon: 'Box',
    description: 'Automatic file backup, client document sync, and shared folder management.',
    authType: 'oauth',
    actions: ['Upload File', 'Create Share Link']
  },
  {
    id: 'storage_supabase',
    name: 'Supabase Storage',
    category: 'Storage & Media',
    icon: 'Database',
    description: 'Private user buckets, image asset hosting, and secure file downloads.',
    authType: 'credentials',
    actions: ['Upload Asset', 'Get Public URL'],
    fields: [
      { key: 'projectUrl', label: 'Supabase Project URL', type: 'url', required: true },
      { key: 'serviceRoleKey', label: 'Service Role Key', type: 'password', required: true }
    ]
  },
  {
    id: 'storage_imgur',
    name: 'Imgur API',
    category: 'Storage & Media',
    icon: 'Image',
    description: 'Instant image hosting with direct public URLs for web sharing.',
    authType: 'api_key',
    actions: ['Upload Image', 'Get Direct URL'],
    fields: [{ key: 'clientId', label: 'Client ID', type: 'text', required: true }]
  },
  {
    id: 'storage_box',
    name: 'Box',
    category: 'Storage & Media',
    icon: 'Archive',
    description: 'Enterprise encrypted file sharing and compliance document storage.',
    authType: 'oauth',
    actions: ['Upload File', 'Create Folder']
  },
  {
    id: 'media_elevenlabs',
    name: 'ElevenLabs AI Voice',
    category: 'Storage & Media',
    icon: 'Volume2',
    description: 'Convert scripts into realistic studio-quality voiceover audio MP3s.',
    authType: 'api_key',
    badge: 'AI Audio',
    actions: ['Generate Voiceover', 'List Voice Models'],
    fields: [{ key: 'apiKey', label: 'ElevenLabs API Key', type: 'password', required: true }]
  },
  {
    id: 'media_replicate',
    name: 'Replicate Flux API',
    category: 'Storage & Media',
    icon: 'Camera',
    description: 'High-resolution image generation models (Flux Schnell, SDXL, Inpainting).',
    authType: 'api_key',
    badge: 'AI Image',
    actions: ['Generate Flux Image', 'Run Image Model'],
    fields: [{ key: 'apiKey', label: 'Replicate API Token', type: 'password', required: true }]
  },
  {
    id: 'media_canva',
    name: 'Canva Connect API',
    category: 'Storage & Media',
    icon: 'Layout',
    description: 'Auto-fill design template assets and export social media graphics.',
    authType: 'oauth',
    actions: ['Export Design', 'Create Asset']
  },
  {
    id: 'media_vimeo',
    name: 'Vimeo API',
    category: 'Storage & Media',
    icon: 'Video',
    description: 'Video upload, client showcase hosting, and privacy management.',
    authType: 'api_key',
    actions: ['Upload Video', 'Get Embed Code'],
    fields: [{ key: 'accessToken', label: 'Access Token', type: 'password', required: true }]
  },

  // 9. Productivity (10)
  {
    id: 'prod_trello',
    name: 'Trello',
    category: 'Productivity',
    icon: 'Trello',
    description: 'Manage Kanban cards, move items across lists, and set task deadlines.',
    authType: 'api_key',
    actions: ['Create Card', 'Move Card', 'Add Attachment'],
    fields: [
      { key: 'apiKey', label: 'Trello API Key', type: 'text', required: true },
      { key: 'token', label: 'Trello Token', type: 'password', required: true }
    ]
  },
  {
    id: 'prod_asana',
    name: 'Asana',
    category: 'Productivity',
    icon: 'CheckSquare',
    description: 'Create project tasks, set due dates, and assign team owners.',
    authType: 'api_key',
    actions: ['Create Task', 'Complete Task'],
    fields: [{ key: 'personalAccessToken', label: 'Personal Access Token', type: 'password', required: true }]
  },
  {
    id: 'prod_todoist',
    name: 'Todoist',
    category: 'Productivity',
    icon: 'Check',
    description: 'Fast task capture, project labels, and priority reminders.',
    authType: 'api_key',
    actions: ['Add Task', 'Close Task'],
    fields: [{ key: 'apiToken', label: 'API Token', type: 'password', required: true }]
  },
  {
    id: 'prod_linear',
    name: 'Linear',
    category: 'Productivity',
    icon: 'GitBranch',
    description: 'Create software issues, assign team cycles, and set urgency priorities.',
    authType: 'api_key',
    badge: 'Popular',
    actions: ['Create Issue', 'Update Status'],
    fields: [{ key: 'apiKey', label: 'Linear API Key', type: 'password', required: true }]
  },
  {
    id: 'prod_jira',
    name: 'Jira Software',
    category: 'Productivity',
    icon: 'Layers',
    description: 'Agile sprints, bug tickets, epics, and project issue management.',
    authType: 'credentials',
    actions: ['Create Issue', 'Transition Issue'],
    fields: [
      { key: 'domain', label: 'Atlassian Domain', type: 'text', placeholder: 'yourcompany.atlassian.net', required: true },
      { key: 'email', label: 'Account Email', type: 'text', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true }
    ]
  },
  {
    id: 'prod_basecamp',
    name: 'Basecamp',
    category: 'Productivity',
    icon: 'MessageSquare',
    description: 'Client message boards, to-dos, and automatic periodic check-ins.',
    authType: 'oauth',
    actions: ['Post Message', 'Create To-Do']
  },
  {
    id: 'prod_coda',
    name: 'Coda',
    category: 'Productivity',
    icon: 'FileText',
    description: 'Interactive documentation, automated tables, and app building blocks.',
    authType: 'api_key',
    actions: ['Insert Row', 'Update Cell'],
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', required: true }]
  },
  {
    id: 'prod_obsidian',
    name: 'Obsidian Sync',
    category: 'Productivity',
    icon: 'BookOpen',
    description: 'Markdown export, personal knowledge graphs, and local vault sync.',
    authType: 'credentials',
    actions: ['Export Markdown Note']
  },
  {
    id: 'prod_evernote',
    name: 'Evernote',
    category: 'Productivity',
    icon: 'File',
    description: 'Note synchronization, clipped web resources, and document archives.',
    authType: 'oauth',
    actions: ['Create Note', 'List Notebooks']
  },
  {
    id: 'prod_miro',
    name: 'Miro',
    category: 'Productivity',
    icon: 'Layout',
    description: 'Collaborative whiteboards, customer journey maps, and diagram syncing.',
    authType: 'oauth',
    actions: ['Create Widget', 'Export Board']
  },

  // 10. Developer Utilities (13)
  {
    id: 'dev_custom_webhook',
    name: 'Custom Webhooks',
    category: 'Developer Utilities',
    icon: 'Globe',
    description: 'Inbound HTTP triggers and outbound HTTP POST dispatch for any custom system.',
    authType: 'webhook',
    badge: 'Universal',
    actions: ['Inbound Webhook Listener', 'Outbound POST Request'],
    fields: [{ key: 'webhookUrl', label: 'Target Webhook URL', type: 'url', required: true }]
  },
  {
    id: 'dev_rest_client',
    name: 'Universal REST Client',
    category: 'Developer Utilities',
    icon: 'Code',
    description: 'Call any arbitrary third-party REST API with custom headers and authorization.',
    authType: 'credentials',
    badge: 'Universal',
    actions: ['HTTP GET', 'HTTP POST', 'HTTP PUT', 'HTTP DELETE'],
    fields: [
      { key: 'endpoint', label: 'API Endpoint', type: 'url', required: true },
      { key: 'authHeader', label: 'Authorization Header (Optional)', type: 'password' }
    ]
  },
  {
    id: 'dev_firecrawl',
    name: 'Firecrawl AI Scraper',
    category: 'Developer Utilities',
    icon: 'Compass',
    description: 'Extract clean structured Markdown or JSON from any public URL or documentation.',
    authType: 'api_key',
    actions: ['Scrape URL to Markdown', 'Crawl Website'],
    fields: [{ key: 'apiKey', label: 'Firecrawl API Key', type: 'password', required: true }]
  },
  {
    id: 'dev_rss_parser',
    name: 'RSS Feed Parser',
    category: 'Developer Utilities',
    icon: 'Rss',
    description: 'Listen for new blog posts, industry news, and competitor updates in real time.',
    authType: 'credentials',
    actions: ['Fetch Latest Feed Items'],
    fields: [{ key: 'feedUrl', label: 'RSS Feed URL', type: 'url', required: true }]
  },
  {
    id: 'dev_pdf_generator',
    name: 'PDF Generator',
    category: 'Developer Utilities',
    icon: 'FileText',
    description: 'Convert HTML and Markdown text into downloadable, formatted PDF reports.',
    authType: 'credentials',
    actions: ['Generate PDF Document']
  },
  {
    id: 'dev_json_transformer',
    name: 'JSON Transformer',
    category: 'Developer Utilities',
    icon: 'Sliders',
    description: 'Filter, pluck, map, and reshape data payloads between agent workflow nodes.',
    authType: 'credentials',
    actions: ['Transform Payload', 'Filter Keys']
  },
  {
    id: 'dev_regex_parser',
    name: 'Regex & Text Parser',
    category: 'Developer Utilities',
    icon: 'Search',
    description: 'Extract emails, phone numbers, and URLs from raw text output.',
    authType: 'credentials',
    actions: ['Extract Pattern Matches', 'Replace Text']
  },
  {
    id: 'dev_cron_scheduler',
    name: 'Cron Scheduler',
    category: 'Developer Utilities',
    icon: 'Clock',
    description: 'Trigger autonomous agent workflows on a recurring schedule (min/hour/day/week).',
    authType: 'credentials',
    actions: ['Schedule Recurring Run'],
    fields: [{ key: 'cronExpression', label: 'Cron Expression', type: 'text', placeholder: '0 9 * * 1', required: true }]
  },
  {
    id: 'dev_js_sandbox',
    name: 'JavaScript Sandbox',
    category: 'Developer Utilities',
    icon: 'Terminal',
    description: 'Run secure, isolated JavaScript expressions for custom business logic.',
    authType: 'credentials',
    actions: ['Run Script']
  },
  {
    id: 'dev_github',
    name: 'GitHub API',
    category: 'Developer Utilities',
    icon: 'Github',
    description: 'Create repository issues, trigger dispatch workflows, and review pull requests.',
    authType: 'api_key',
    actions: ['Create Issue', 'Trigger Repository Dispatch'],
    fields: [{ key: 'personalToken', label: 'Personal Access Token', type: 'password', required: true }]
  },
  {
    id: 'dev_gitlab',
    name: 'GitLab API',
    category: 'Developer Utilities',
    icon: 'Gitlab',
    description: 'Manage project issues, trigger CI/CD pipelines, and monitor deployments.',
    authType: 'api_key',
    actions: ['Create Issue', 'Trigger Pipeline'],
    fields: [{ key: 'privateToken', label: 'Private Token', type: 'password', required: true }]
  },
  {
    id: 'dev_qr_generator',
    name: 'Dynamic QR Generator',
    category: 'Developer Utilities',
    icon: 'Maximize',
    description: 'Create styled SVG and PNG QR codes for URLs, bKash payments, and contact vCards.',
    authType: 'credentials',
    actions: ['Generate QR SVG', 'Generate QR PNG']
  },
  {
    id: 'dev_crypto_hash',
    name: 'Cryptographic Hasher',
    category: 'Developer Utilities',
    icon: 'Shield',
    description: 'Compute SHA256, MD5, and HMAC signatures for secure webhook validation.',
    authType: 'credentials',
    actions: ['Compute Hash', 'Verify Signature']
  }
];

export const toolConnectors = TOOL_CONNECTORS;

/**
 * Filter connectors by free-text search (matching name, description, category, or actions).
 */
export function filterConnectorsBySearch(query: string, list: ToolConnector[] = TOOL_CONNECTORS): ToolConnector[] {
  if (!query || !query.trim()) return list;
  const q = query.toLowerCase().trim();
  return list.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.actions.some((a) => a.toLowerCase().includes(q))
  );
}

/**
 * Filter connectors by category name ('all' returns the full list).
 */
export function filterConnectorsByCategory(
  category: string,
  list: ToolConnector[] = TOOL_CONNECTORS
): ToolConnector[] {
  if (!category || category === 'all') return list;
  return list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
}
