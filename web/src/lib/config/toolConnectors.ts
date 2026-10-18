/**
 * Enterprise Tool Connectors Directory (100+ Tools across 10 Categories)
 * Authoritative specification from ORIGINAL_REQUEST.md and DISPATCH.md
 */

export type AuthType = 'api_key' | 'oauth2' | 'webhook' | 'token';

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder?: string;
  required?: boolean;
}

export interface ToolConnectorCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface ToolConnector {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  icon: string;
  authType: AuthType;
  fields: CredentialField[];
  defaultStatus: 'unconfigured';
}

export interface ConnectedToolState {
  status: 'connected' | 'unconfigured';
  connectedAt?: string;
  credentials?: Record<string, string>;
}

export const TOOL_CONNECTOR_CATEGORIES: ToolConnectorCategory[] = [
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    icon: 'Globe',
    description: 'Enterprise Google productivity, office documents, cloud storage, and analytics.',
    count: 10
  },
  {
    id: 'messaging',
    name: 'Messaging & Channels',
    icon: 'MessageSquare',
    description: 'Omnichannel communication, bots, SMS gateways, and webhook notifications.',
    count: 10
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Payments',
    icon: 'ShoppingBag',
    description: 'Automated payment gateways, storefronts, and multi-currency checkout infrastructure.',
    count: 10
  },
  {
    id: 'crm',
    name: 'CRM & Leads',
    icon: 'BriefcaseBusiness',
    description: 'Customer relationship pipelines, contact sync, deal lifecycle, and enterprise sales.',
    count: 10
  },
  {
    id: 'social_media',
    name: 'Social Media',
    icon: 'Share2',
    description: 'Multi-platform social publishing, audience analytics, feed automation, and engagement.',
    count: 10
  },
  {
    id: 'marketing_ads',
    name: 'Marketing & Ads',
    icon: 'Megaphone',
    description: 'Ad campaign management, email marketing suites, audience segmentation, and ROI tracking.',
    count: 10
  },
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    icon: 'Layers',
    description: 'Microsoft enterprise suite, Outlook mail, Azure cloud services, and Graph connectors.',
    count: 10
  },
  {
    id: 'storage_media',
    name: 'Storage & Media',
    icon: 'Database',
    description: 'Object storage, CDNs, asset delivery, image transformations, and media pipelines.',
    count: 10
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: 'Target',
    description: 'Task managers, relational databases, kanban boards, and sprint trackers.',
    count: 10
  },
  {
    id: 'developer_utilities',
    name: 'Developer Utilities',
    icon: 'Terminal',
    description: 'Source control, direct database pools, custom HTTP webhooks, and deployment pipelines.',
    count: 10
  }
];

export const TOOL_CONNECTORS: ToolConnector[] = [
  // ==========================================================================
  // 1. GOOGLE WORKSPACE (10 connectors)
  // ==========================================================================
  {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Sync files, auto-upload agent reports, and organize cloud drives securely.',
    icon: 'Database',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-...', required: true }
    ]
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Send and receive automated executive emails, client replies, and inbox digests.',
    icon: 'Mail',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-...', required: true }
    ]
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Read and append customer leads, order rows, and financial balance sheets in real-time.',
    icon: 'Table',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', required: false }
    ]
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Schedule discovery calls, client appointments, and executive team standups automatically.',
    icon: 'Calendar',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'calendar_id', label: 'Primary Calendar ID', type: 'text', placeholder: 'primary or user@domain.com', required: true }
    ]
  },
  {
    id: 'google_docs',
    name: 'Google Docs',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Generate polished client contracts, sales proposals, and formatted briefing memos.',
    icon: 'FileText',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-...', required: true }
    ]
  },
  {
    id: 'google_slides',
    name: 'Google Slides',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Create slide decks, pitch summaries, and weekly performance presentations.',
    icon: 'Layout',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
      { key: 'template_id', label: 'Deck Template ID', type: 'text', placeholder: '1p9gX... presentation id', required: false }
    ]
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Provision meeting links on the fly and deliver calendar invites directly to leads.',
    icon: 'Video',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true }
    ]
  },
  {
    id: 'google_forms',
    name: 'Google Forms',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Capture inbound survey submissions and trigger AI agent workflows instantly.',
    icon: 'CheckCheck',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'form_id', label: 'Google Form ID', type: 'text', placeholder: '1FAIpQLSc...', required: true },
      { key: 'api_key', label: 'Google Cloud API Key', type: 'password', placeholder: 'AIzaSy...', required: true }
    ]
  },
  {
    id: 'google_analytics_4',
    name: 'Google Analytics 4',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Extract web traffic metrics, conversion events, and e-commerce revenue funnels.',
    icon: 'TrendingUp',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'property_id', label: 'GA4 Property ID', type: 'text', placeholder: 'properties/123456789', required: true },
      { key: 'service_account_key', label: 'Service Account JSON Key', type: 'password', placeholder: '{"type": "service_account"...}', required: true }
    ]
  },
  {
    id: 'bigquery',
    name: 'BigQuery',
    category: 'Google Workspace',
    categoryId: 'google_workspace',
    description: 'Execute petabyte-scale SQL queries and pipe warehouse analytics to agents.',
    icon: 'Cpu',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'project_id', label: 'GCP Project ID', type: 'text', placeholder: 'ezbo-analytics-prod', required: true },
      { key: 'credentials_json', label: 'Service Account JSON', type: 'password', placeholder: '{"client_email": "..."}', required: true }
    ]
  },

  // ==========================================================================
  // 2. MESSAGING & CHANNELS (10 connectors)
  // ==========================================================================
  {
    id: 'whatsapp_cloud',
    name: 'WhatsApp Business Cloud',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Official Meta Cloud API for customer conversations, template messages, and OTPs.',
    icon: 'MessageSquareCheck',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', placeholder: '109823471092837', required: true },
      { key: 'access_token', label: 'Permanent System User Token', type: 'password', placeholder: 'EAAG...', required: true }
    ]
  },
  {
    id: 'telegram_bot',
    name: 'Telegram Bot API',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Instant bot commands, group administration, and file broadcasting over Telegram.',
    icon: 'Send',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ', required: true }
    ]
  },
  {
    id: 'slack_webhooks',
    name: 'Slack Webhooks',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Broadcast notifications, error alerts, and daily sales summaries to Slack channels.',
    icon: 'Share2',
    authType: 'webhook',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'webhook_url', label: 'Incoming Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/T00/B00/XXXX', required: true }
    ]
  },
  {
    id: 'discord_bot',
    name: 'Discord Bot API',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Deploy community bots, role managers, and ticket responders in Discord guilds.',
    icon: 'Bot',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'bot_token', label: 'Discord Bot Token', type: 'password', placeholder: 'MTIzNDU2...', required: true },
      { key: 'guild_id', label: 'Server (Guild) ID', type: 'text', placeholder: '987654321012345678', required: false }
    ]
  },
  {
    id: 'twilio_sms_voice',
    name: 'Twilio SMS & Voice',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Global SMS dispatch, verification codes, and automated voice IVR workflows.',
    icon: 'Smartphone',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'auth_token', label: 'Auth Token', type: 'password', placeholder: 'your_auth_token_here', required: true },
      { key: 'from_phone', label: 'Twilio Phone Number', type: 'text', placeholder: '+12025550199', required: true }
    ]
  },
  {
    id: 'sendgrid_email',
    name: 'SendGrid Email API',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'High-deliverability transactional emails, invoice dispatches, and newsletters.',
    icon: 'Mail',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'SendGrid API Key', type: 'password', placeholder: 'SG.xxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'from_email', label: 'Verified Sender Email', type: 'text', placeholder: 'noreply@yourdomain.com', required: true }
    ]
  },
  {
    id: 'resend_email',
    name: 'Resend Transactional',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Modern developer-first transactional email API with React templates and analytics.',
    icon: 'Zap',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Resend API Key', type: 'password', placeholder: 're_123456789_abcdef', required: true },
      { key: 'from_email', label: 'Verified Domain Sender', type: 'text', placeholder: 'team@yourdomain.com', required: true }
    ]
  },
  {
    id: 'pushover_notify',
    name: 'Pushover Notifications',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Real-time push notifications to iOS, Android, and desktop devices for critical alerts.',
    icon: 'Megaphone',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'user_key', label: 'Pushover User Key', type: 'password', placeholder: 'uQiRzpo...', required: true },
      { key: 'app_token', label: 'Application Token', type: 'password', placeholder: 'a87dkjs...', required: true }
    ]
  },
  {
    id: 'ms_teams_webhooks',
    name: 'Microsoft Teams Webhooks',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Push adaptive cards, team notices, and incident dispatches to Teams channels.',
    icon: 'Layers',
    authType: 'webhook',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'webhook_url', label: 'Teams Incoming Webhook Connector', type: 'url', placeholder: 'https://outlook.office.com/webhook/...', required: true }
    ]
  },
  {
    id: 'intercom_chat',
    name: 'Intercom Chat',
    category: 'Messaging & Channels',
    categoryId: 'messaging',
    description: 'Live website visitor engagement, automated lead triage, and CRM ticketing.',
    icon: 'MessageSquare',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'access_token', label: 'Intercom Access Token', type: 'password', placeholder: 'dG9rZW46...', required: true }
    ]
  },

  // ==========================================================================
  // 3. E-COMMERCE & PAYMENTS (10 connectors)
  // ==========================================================================
  {
    id: 'opaybd',
    name: 'OPayBD Automated Gateway',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Automated Bangladesh merchant payment gateway for bKash, Nagad, and Rocket.',
    icon: 'Receipt',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'OPayBD Merchant API Key', type: 'password', placeholder: 'opay_live_...', required: true },
      { key: 'merchant_id', label: 'Merchant ID', type: 'text', placeholder: 'OPBD-10928', required: true }
    ]
  },
  {
    id: 'bkash_merchant',
    name: 'bKash Merchant API',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Direct bKash tokenized checkout, query payment status, and instant refunds.',
    icon: 'CreditCard',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'app_key', label: 'bKash App Key', type: 'password', placeholder: 'key_...', required: true },
      { key: 'app_secret', label: 'bKash App Secret', type: 'password', placeholder: 'secret_...', required: true },
      { key: 'username', label: 'Merchant Username', type: 'text', placeholder: 'merchant_user', required: true }
    ]
  },
  {
    id: 'nagad_direct',
    name: 'Nagad Direct Pay',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Nagad PGW tokenized verification, transaction inquiry, and instant settlements.',
    icon: 'PiggyBank',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'merchant_id', label: 'Nagad Merchant ID', type: 'text', placeholder: 'NAGAD-0012', required: true },
      { key: 'private_key', label: 'Merchant Private Key', type: 'password', placeholder: '-----BEGIN PRIVATE KEY-----', required: true }
    ]
  },
  {
    id: 'shopify_storefront',
    name: 'Shopify Storefront API',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Query products, manage inventory stock, and track customer checkout orders.',
    icon: 'ShoppingBag',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'shop_domain', label: 'Shop Domain', type: 'text', placeholder: 'my-store.myshopify.com', required: true },
      { key: 'access_token', label: 'Storefront Access Token', type: 'password', placeholder: 'shpat_...', required: true }
    ]
  },
  {
    id: 'woocommerce_rest',
    name: 'WooCommerce REST API',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Full REST control over WordPress products, coupons, customers, and order fulfillment.',
    icon: 'Store',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'site_url', label: 'WordPress Site URL', type: 'url', placeholder: 'https://example.com', required: true },
      { key: 'consumer_key', label: 'Consumer Key', type: 'text', placeholder: 'ck_...', required: true },
      { key: 'consumer_secret', label: 'Consumer Secret', type: 'password', placeholder: 'cs_...', required: true }
    ]
  },
  {
    id: 'stripe_elements',
    name: 'Stripe Elements',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Global credit cards, Apple Pay, Google Pay, and recurring subscription charges.',
    icon: 'CreditCard',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'secret_key', label: 'Stripe Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
      { key: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: false }
    ]
  },
  {
    id: 'paypal_smart',
    name: 'PayPal Smart Buttons',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'International PayPal balances, Venmo, Pay in 4 installments, and buyer protection.',
    icon: 'ShieldCheck',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'PayPal Client ID', type: 'text', placeholder: 'Axxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'client_secret', label: 'PayPal Client Secret', type: 'password', placeholder: 'Exxxxxxxxxxxxxxxxxxxx', required: true }
    ]
  },
  {
    id: 'sslcommerz_bd',
    name: 'SSLCommerz Bangladesh',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Card networks (Visa, Mastercard), mobile wallets, and internet banking in BD.',
    icon: 'Receipt',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'store_id', label: 'Store ID', type: 'text', placeholder: 'ezbo_live', required: true },
      { key: 'store_passwd', label: 'Store Password', type: 'password', placeholder: 'secretpass', required: true }
    ]
  },
  {
    id: 'razorpay_intl',
    name: 'Razorpay International',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Accept Indian UPI, debit cards, netbanking, and 100+ international currencies.',
    icon: 'CreditCard',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'key_id', label: 'Key ID', type: 'text', placeholder: 'rzp_live_...', required: true },
      { key: 'key_secret', label: 'Key Secret', type: 'password', placeholder: 'secret_...', required: true }
    ]
  },
  {
    id: 'paddle_merchant',
    name: 'Paddle Merchant',
    category: 'E-Commerce & Payments',
    categoryId: 'ecommerce',
    description: 'Merchant of record SaaS billing, sales tax compliance, and automated invoicing.',
    icon: 'Percent',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'vendor_id', label: 'Vendor ID', type: 'text', placeholder: '12345', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'paddlevendor_...', required: true }
    ]
  },

  // ==========================================================================
  // 4. CRM & LEADS (10 connectors)
  // ==========================================================================
  {
    id: 'hubspot_crm',
    name: 'HubSpot CRM API',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'Manage contacts, sales pipelines, deal stages, and automated company properties.',
    icon: 'Briefcase',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'access_token', label: 'Private App Access Token', type: 'password', placeholder: 'pat-na1-...', required: true }
    ]
  },
  {
    id: 'salesforce_rest',
    name: 'Salesforce REST',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'Enterprise SOQL queries, lead assignment rules, and custom Salesforce objects.',
    icon: 'BriefcaseBusiness',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'instance_url', label: 'Instance URL', type: 'url', placeholder: 'https://yourinstance.salesforce.com', required: true },
      { key: 'client_id', label: 'Consumer Key', type: 'text', placeholder: '3MVG9...', required: true },
      { key: 'client_secret', label: 'Consumer Secret', type: 'password', placeholder: 'secret_...', required: true }
    ]
  },
  {
    id: 'pipedrive_crm',
    name: 'Pipedrive CRM',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'Visual sales pipelines, deal stages, activity reminders, and person profiles.',
    icon: 'Target',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_token', label: 'Personal API Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxx', required: true }
    ]
  },
  {
    id: 'zoho_crm',
    name: 'Zoho CRM',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'Sync leads, accounts, sales quotes, and customer histories across the Zoho suite.',
    icon: 'Layers',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'auth_token', label: 'OAuth Refresh Token', type: 'password', placeholder: '1000.xxxx...', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: '1000.xxxx...', required: true }
    ]
  },
  {
    id: 'leadsquared',
    name: 'LeadSquared',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'High-velocity lead capture, automated lead scoring, and SMS sales execution.',
    icon: 'UserCheck',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'access_key', label: 'Access Key', type: 'text', placeholder: 'u$r...', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'secret...', required: true }
    ]
  },
  {
    id: 'close_crm',
    name: 'Close CRM',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'Built-in calling, multi-channel email sequences, and high-volume sales outreach.',
    icon: 'Target',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Close API Key', type: 'password', placeholder: 'api_xxxxxxxxxxxx', required: true }
    ]
  },
  {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'All-in-one agency marketing funnels, appointment bookings, and client pipelines.',
    icon: 'Zap',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'location_id', label: 'Location ID', type: 'text', placeholder: 'loc_12345', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'ghl_...', required: true }
    ]
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'Predictive contact scoring, email automation trees, and sales deal tracking.',
    icon: 'Sparkles',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'account_url', label: 'Account URL', type: 'url', placeholder: 'https://yourname.api-us1.com', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'xxxxxxxxxxxxxxx', required: true }
    ]
  },
  {
    id: 'copper_crm',
    name: 'Copper CRM',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'Native Google Workspace CRM integration for contact history and sales forecasting.',
    icon: 'User',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'user_email', label: 'User Email', type: 'text', placeholder: 'agent@domain.com', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'copper_api_...', required: true }
    ]
  },
  {
    id: 'freshsales',
    name: 'Freshsales',
    category: 'CRM & Leads',
    categoryId: 'crm',
    description: 'AI-powered contact management, deal insights, and omnichannel customer communication.',
    icon: 'Briefcase',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'domain', label: 'Freshsales Domain', type: 'text', placeholder: 'domain.myfreshworks.com', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'freshsales_key_...', required: true }
    ]
  },

  // ==========================================================================
  // 5. SOCIAL MEDIA (10 connectors)
  // ==========================================================================
  {
    id: 'facebook_graph',
    name: 'Facebook Graph API',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Publish posts to Facebook Pages, read comments, and monitor page engagement.',
    icon: 'Share2',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'page_id', label: 'Page ID', type: 'text', placeholder: '1029384756', required: true },
      { key: 'page_access_token', label: 'Page Access Token', type: 'password', placeholder: 'EAAK...', required: true }
    ]
  },
  {
    id: 'instagram_basic',
    name: 'Instagram Basic Display',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Access media uploads, post carousel images, and extract reel performance analytics.',
    icon: 'Image',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'ig_user_id', label: 'Instagram User ID', type: 'text', placeholder: '17841400...', required: true },
      { key: 'access_token', label: 'User Token', type: 'password', placeholder: 'IGQVJ...', required: true }
    ]
  },
  {
    id: 'linkedin_marketing',
    name: 'LinkedIn Marketing',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Post thought leadership articles, share company updates, and measure impressions.',
    icon: 'Linkedin',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'LinkedIn Client ID', type: 'text', placeholder: '78xxxxxx', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'W1xxxxxx', required: true }
    ]
  },
  {
    id: 'tiktok_content',
    name: 'TikTok Content API',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Upload viral video content, manage creator posts, and inspect video metrics.',
    icon: 'Video',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_key', label: 'Client Key', type: 'text', placeholder: 'awxxxxxxxxxx', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'sec_xxxxxxxxxx', required: true }
    ]
  },
  {
    id: 'twitter_v2',
    name: 'X / Twitter API v2',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Post tweets, monitor mentions, schedule thread chains, and analyze impressions.',
    icon: 'Twitter',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'text', placeholder: 'consumer_key', required: true },
      { key: 'api_secret', label: 'API Key Secret', type: 'password', placeholder: 'consumer_secret', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'token', required: true },
      { key: 'access_token_secret', label: 'Access Token Secret', type: 'password', placeholder: 'token_secret', required: true }
    ]
  },
  {
    id: 'pinterest_api',
    name: 'Pinterest API',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Create visual pins, organize client mood boards, and track pin clicks and saves.',
    icon: 'Image',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'access_token', label: 'Pinterest Access Token', type: 'password', placeholder: 'pina_...', required: true },
      { key: 'board_id', label: 'Default Board ID', type: 'text', placeholder: '123456789', required: false }
    ]
  },
  {
    id: 'youtube_data_v3',
    name: 'YouTube Data API v3',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Upload video metadata, manage playlist tags, and read channel subscriber metrics.',
    icon: 'Youtube',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Google YouTube API Key', type: 'password', placeholder: 'AIzaSy...', required: true },
      { key: 'channel_id', label: 'Channel ID', type: 'text', placeholder: 'UCxxxxxxxxxxxxxxx', required: false }
    ]
  },
  {
    id: 'reddit_data',
    name: 'Reddit Data API',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Monitor trending subreddit discussions, submit posts, and respond to community queries.',
    icon: 'MessageSquare',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'Reddit App ID', type: 'text', placeholder: '14-char client id', required: true },
      { key: 'client_secret', label: 'Secret Key', type: 'password', placeholder: 'secret', required: true }
    ]
  },
  {
    id: 'threads_publishing',
    name: 'Threads Publishing API',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Automate post distribution to Meta Threads, reply to conversations, and view metrics.',
    icon: 'Share2',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'threads_user_id', label: 'Threads User ID', type: 'text', placeholder: '987654321', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'THQ...', required: true }
    ]
  },
  {
    id: 'buffer_scheduler',
    name: 'Buffer Scheduler',
    category: 'Social Media',
    categoryId: 'social_media',
    description: 'Queue multi-platform posts for timed release across Facebook, LinkedIn, X, and Instagram.',
    icon: 'Clock',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'access_token', label: 'Buffer Access Token', type: 'password', placeholder: '1/xxxx...', required: true }
    ]
  },

  // ==========================================================================
  // 6. MARKETING & ADS (10 connectors)
  // ==========================================================================
  {
    id: 'meta_ads_manager',
    name: 'Meta Ads Manager API',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Monitor ad spend, inspect ROAS, update campaign budgets, and launch new ad creatives.',
    icon: 'Megaphone',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'ad_account_id', label: 'Ad Account ID (act_xxxx)', type: 'text', placeholder: 'act_102938475', required: true },
      { key: 'access_token', label: 'System User Token', type: 'password', placeholder: 'EAAG...', required: true }
    ]
  },
  {
    id: 'google_ads_scripts',
    name: 'Google Ads Scripts',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Query search keywords, adjust CPC bids, and retrieve conversion performance.',
    icon: 'Target',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'developer_token', label: 'Developer Token', type: 'password', placeholder: 'dev_token', required: true },
      { key: 'customer_id', label: 'Customer ID (no hyphens)', type: 'text', placeholder: '1234567890', required: true }
    ]
  },
  {
    id: 'tiktok_ads',
    name: 'TikTok Ads API',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Manage TikTok video ads, monitor conversion pixel events, and optimize ad sets.',
    icon: 'Video',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'advertiser_id', label: 'Advertiser ID', type: 'text', placeholder: '69876543210', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'act.xxxxxxxx', required: true }
    ]
  },
  {
    id: 'mailchimp_marketing',
    name: 'Mailchimp Marketing',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Sync email subscriber lists, trigger RSS campaigns, and review click-through rates.',
    icon: 'Mail',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Mailchimp API Key', type: 'password', placeholder: 'xxxx-us19', required: true },
      { key: 'list_id', label: 'Audience List ID', type: 'text', placeholder: 'a1b2c3d4e5', required: true }
    ]
  },
  {
    id: 'klaviyo_ecommerce',
    name: 'Klaviyo E-Commerce',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Automate abandoned cart emails, customer segment tracking, and predictive LTV.',
    icon: 'ShoppingBag',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'private_key', label: 'Private API Key', type: 'password', placeholder: 'pk_xxxxxxxxxxxx', required: true }
    ]
  },
  {
    id: 'brevo_sendinblue',
    name: 'Brevo (Sendinblue)',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Multi-channel marketing automation, transactional SMS, and automated email drips.',
    icon: 'Send',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Brevo API Key (v3)', type: 'password', placeholder: 'xkeysib-...', required: true }
    ]
  },
  {
    id: 'omnisend_automation',
    name: 'Omnisend Automation',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Omnichannel email and push marketing built specifically for e-commerce stores.',
    icon: 'Zap',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Omnisend API Key', type: 'password', placeholder: 'xxxxxxxx-xxxx-...', required: true }
    ]
  },
  {
    id: 'convertkit_creators',
    name: 'ConvertKit Creators',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Creator newsletter broadcasting, digital product sales, and subscriber tagging.',
    icon: 'Sparkles',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'ck_sec_...', required: true }
    ]
  },
  {
    id: 'drip_automation',
    name: 'Drip Automation',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'E-commerce CRM marketing automation, revenue tracking, and customer journey maps.',
    icon: 'Flame',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'account_id', label: 'Account ID', type: 'text', placeholder: '1234567', required: true },
      { key: 'api_token', label: 'API Token', type: 'password', placeholder: 'drip_token_...', required: true }
    ]
  },
  {
    id: 'constant_contact',
    name: 'Constant Contact',
    category: 'Marketing & Ads',
    categoryId: 'marketing_ads',
    description: 'Contact list management, email blast dispatches, and event registration tracking.',
    icon: 'Mail',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'text', placeholder: 'cc_api_key', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'cc_token_...', required: true }
    ]
  },

  // ==========================================================================
  // 7. MICROSOFT 365 (10 connectors)
  // ==========================================================================
  {
    id: 'outlook_365',
    name: 'Outlook 365 Mail',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Read and send corporate emails via Microsoft Graph API with enterprise compliance.',
    icon: 'Mail',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'tenant_id', label: 'Azure Tenant ID', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true },
      { key: 'client_id', label: 'Application (client) ID', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true },
      { key: 'client_secret', label: 'Client Secret Value', type: 'password', placeholder: 'secret_...', required: true }
    ]
  },
  {
    id: 'onedrive_business',
    name: 'OneDrive Business',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Store client deliverables, synchronize enterprise files, and generate sharing links.',
    icon: 'Database',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'secret', required: true }
    ]
  },
  {
    id: 'excel_online',
    name: 'Excel Online REST',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Append financial reports and execute formula calculations in Excel cloud workbooks.',
    icon: 'Table',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'workbook_id', label: 'Workbook Item ID', type: 'text', placeholder: '01ABCDEFG...', required: true },
      { key: 'access_token', label: 'Graph Bearer Token', type: 'password', placeholder: 'EwBA...', required: true }
    ]
  },
  {
    id: 'onenote_api',
    name: 'OneNote API',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Create meeting notes, organize research binders, and document agent project logs.',
    icon: 'BookOpen',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'App Client ID', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true },
      { key: 'section_id', label: 'Notebook Section ID', type: 'text', placeholder: '0-xxxx...', required: false }
    ]
  },
  {
    id: 'sharepoint_lists',
    name: 'SharePoint Lists',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Synchronize corporate data tables, team inventories, and approval item workflows.',
    icon: 'Layers',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'site_id', label: 'SharePoint Site ID', type: 'text', placeholder: 'contoso.sharepoint.com,xxxx,yyyy', required: true },
      { key: 'list_id', label: 'List ID (GUID)', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true }
    ]
  },
  {
    id: 'teams_graph',
    name: 'Teams Graph API',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Post chat messages, schedule video meetings, and manage team channel members.',
    icon: 'MessageSquare',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'team_id', label: 'Team ID', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true },
      { key: 'channel_id', label: 'Channel ID', type: 'text', placeholder: '19:xxxx@thread.tacv2', required: true }
    ]
  },
  {
    id: 'ms_planner',
    name: 'Microsoft Planner',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Create task buckets, assign executive action items, and track team deadlines.',
    icon: 'Calendar',
    authType: 'oauth2',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'plan_id', label: 'Planner Plan ID', type: 'text', placeholder: 'xxxx...', required: true }
    ]
  },
  {
    id: 'power_bi_embedded',
    name: 'Power BI Embedded',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Trigger data model refreshes and embed interactive BI reports directly for clients.',
    icon: 'TrendingUp',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'workspace_id', label: 'Power BI Workspace ID', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true },
      { key: 'report_id', label: 'Report ID', type: 'text', placeholder: 'xxxx-xxxx-xxxx', required: true }
    ]
  },
  {
    id: 'azure_blob',
    name: 'Azure Blob Storage',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Massively scalable cloud object storage for binary files, archives, and model weights.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'account_name', label: 'Storage Account Name', type: 'text', placeholder: 'mystorageaccount', required: true },
      { key: 'account_key', label: 'Storage Account Key', type: 'password', placeholder: 'key1==', required: true },
      { key: 'container_name', label: 'Blob Container Name', type: 'text', placeholder: 'agent-assets', required: true }
    ]
  },
  {
    id: 'azure_openai',
    name: 'Azure OpenAI',
    category: 'Microsoft 365',
    categoryId: 'microsoft_365',
    description: 'Enterprise GPT-4o deployments hosted within your dedicated Microsoft Azure tenant.',
    icon: 'Cpu',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'endpoint', label: 'Azure Resource Endpoint', type: 'url', placeholder: 'https://your-resource.openai.azure.com/', required: true },
      { key: 'api_key', label: 'Azure API Key', type: 'password', placeholder: '32-character key', required: true },
      { key: 'deployment_name', label: 'Deployment Name', type: 'text', placeholder: 'gpt-4o', required: true }
    ]
  },

  // ==========================================================================
  // 8. STORAGE & MEDIA (10 connectors)
  // ==========================================================================
  {
    id: 'amazon_s3',
    name: 'Amazon S3 Buckets',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Industry-standard cloud object storage with versioning, lifecycle rules, and presigned URLs.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'bucket_name', label: 'S3 Bucket Name', type: 'text', placeholder: 'my-production-bucket', required: true },
      { key: 'region', label: 'AWS Region', type: 'text', placeholder: 'us-east-1', required: true },
      { key: 'access_key_id', label: 'AWS Access Key ID', type: 'text', placeholder: 'AKIA...', required: true },
      { key: 'secret_access_key', label: 'AWS Secret Access Key', type: 'password', placeholder: 'secret', required: true }
    ]
  },
  {
    id: 'cloudinary_engine',
    name: 'Cloudinary Media Engine',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Real-time image manipulation, automated resizing, face detection, and video transcoding.',
    icon: 'Image',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'cloud_name', label: 'Cloud Name', type: 'text', placeholder: 'my-cloud', required: true },
      { key: 'api_key', label: 'API Key', type: 'text', placeholder: '123456789012345', required: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'secret', required: true }
    ]
  },
  {
    id: 'supabase_storage',
    name: 'Supabase Storage',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'PostgreSQL-backed object storage with Row Level Security (RLS) policies.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'project_url', label: 'Supabase Project URL', type: 'url', placeholder: 'https://xxxx.supabase.co', required: true },
      { key: 'service_role_key', label: 'Service Role Key (secret)', type: 'password', placeholder: 'eyJhbG...', required: true },
      { key: 'bucket_id', label: 'Storage Bucket ID', type: 'text', placeholder: 'avatars', required: true }
    ]
  },
  {
    id: 'dropbox_core',
    name: 'Dropbox Core API',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Upload client deliverables, manage team folders, and create shared preview links.',
    icon: 'Database',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'access_token', label: 'Dropbox Access Token', type: 'password', placeholder: 'sl.xxxx...', required: true }
    ]
  },
  {
    id: 'box_platform',
    name: 'Box Platform',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Enterprise content management with strict compliance, watermarking, and classification.',
    icon: 'Database',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'Box Client ID', type: 'text', placeholder: 'box_client_id', required: true },
      { key: 'client_secret', label: 'Box Client Secret', type: 'password', placeholder: 'box_secret', required: true }
    ]
  },
  {
    id: 'google_cloud_storage',
    name: 'Google Cloud Storage',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'High-availability GCP bucket storage for AI datasets, media assets, and backups.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'bucket_name', label: 'GCS Bucket Name', type: 'text', placeholder: 'ezbo-assets-gcs', required: true },
      { key: 'service_account_json', label: 'Service Account JSON', type: 'password', placeholder: '{"client_email": "..."}', required: true }
    ]
  },
  {
    id: 'cloudflare_r2',
    name: 'Cloudflare R2',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Zero-egress fee S3-compatible cloud storage distributed across Cloudflare edge nodes.',
    icon: 'Globe',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'account_id', label: 'Cloudflare Account ID', type: 'text', placeholder: '32-character hex ID', required: true },
      { key: 'access_key_id', label: 'R2 Access Key ID', type: 'text', placeholder: 'R2_KEY', required: true },
      { key: 'secret_access_key', label: 'R2 Secret Access Key', type: 'password', placeholder: 'R2_SECRET', required: true },
      { key: 'bucket_name', label: 'Bucket Name', type: 'text', placeholder: 'media-vault', required: true }
    ]
  },
  {
    id: 'backblaze_b2',
    name: 'Backblaze B2',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Cost-effective cloud backup storage for automated long-term data archiving.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'key_id', label: 'Key ID', type: 'text', placeholder: '00xxxxxxxxxxxxx', required: true },
      { key: 'application_key', label: 'Application Key', type: 'password', placeholder: 'K00xxxxxxxxxxxx', required: true },
      { key: 'bucket_name', label: 'Bucket Name', type: 'text', placeholder: 'ezbo-backups', required: true }
    ]
  },
  {
    id: 'imgur_api',
    name: 'Imgur API',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Fast public and anonymous image hosting for social shares and temporary links.',
    icon: 'Image',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'client_id', label: 'Imgur Client ID', type: 'text', placeholder: 'b0xxxx...', required: true }
    ]
  },
  {
    id: 'replicate_cdn',
    name: 'Replicate CDN',
    category: 'Storage & Media',
    categoryId: 'storage_media',
    description: 'Run generative image and video models (Flux, SDXL) with instant CDN output delivery.',
    icon: 'Sparkles',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_token', label: 'Replicate API Token', type: 'password', placeholder: 'r8_xxxxxxxxxxxxxxxxxxxxxx', required: true }
    ]
  },

  // ==========================================================================
  // 9. PRODUCTIVITY (10 connectors)
  // ==========================================================================
  {
    id: 'notion_api',
    name: 'Notion REST API',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Create Notion database pages, sync task boards, and publish corporate wikis.',
    icon: 'BookOpen',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'integration_token', label: 'Internal Integration Secret', type: 'password', placeholder: 'secret_xxxxxxxx', required: true },
      { key: 'database_id', label: 'Target Database ID', type: 'text', placeholder: '32-character ID', required: true }
    ]
  },
  {
    id: 'airtable_enterprise',
    name: 'Airtable Enterprise API',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Relational databases with rich field types, automated views, and webhook triggers.',
    icon: 'Table',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'personal_access_token', label: 'Personal Access Token', type: 'password', placeholder: 'patXXXXXXXX.YYYYYYYY', required: true },
      { key: 'base_id', label: 'Base ID (appXXXX)', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
      { key: 'table_name', label: 'Table Name or ID', type: 'text', placeholder: 'Tasks', required: true }
    ]
  },
  {
    id: 'trello_rest',
    name: 'Trello REST API',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Move kanban cards across sprint lists, assign labels, and attach agent briefs.',
    icon: 'Layout',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Trello Developer API Key', type: 'text', placeholder: '32-char key', required: true },
      { key: 'token', label: 'User Token', type: 'password', placeholder: '64-char token', required: true },
      { key: 'board_id', label: 'Board ID', type: 'text', placeholder: 'board_id', required: false }
    ]
  },
  {
    id: 'asana_tasks',
    name: 'Asana Tasks API',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Create multi-assignee project tasks, milestone timelines, and portfolio updates.',
    icon: 'CheckCheck',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'personal_access_token', label: 'Personal Access Token', type: 'password', placeholder: '1/xxxx...', required: true },
      { key: 'workspace_gid', label: 'Workspace GID', type: 'text', placeholder: '123456789012345', required: true }
    ]
  },
  {
    id: 'clickup_workspaces',
    name: 'ClickUp Workspaces',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Task hierarchies, automated custom status transitions, and sprint time tracking.',
    icon: 'CheckCircle2',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_token', label: 'ClickUp API Token', type: 'password', placeholder: 'pk_12345678_...', required: true },
      { key: 'team_id', label: 'Workspace (Team) ID', type: 'text', placeholder: '1234567', required: false }
    ]
  },
  {
    id: 'monday_graphql',
    name: 'Monday.com GraphQL',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Custom board columns, automated status changes, and cross-team board pulses.',
    icon: 'Calendar',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_token', label: 'Personal API Token', type: 'password', placeholder: 'eyJhbGciOi...', required: true },
      { key: 'board_id', label: 'Board ID', type: 'text', placeholder: '1234567890', required: false }
    ]
  },
  {
    id: 'todoist_rest',
    name: 'Todoist REST API',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Quick task additions, natural language due dates, priorities, and project filters.',
    icon: 'CheckCheck',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_token', label: 'API Token', type: 'password', placeholder: '0123456789abcdef...', required: true }
    ]
  },
  {
    id: 'linear_api',
    name: 'Linear App API',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'High-speed software issue tracking, cycle planning, git sync, and triage workflows.',
    icon: 'Target',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Personal API Key', type: 'password', placeholder: 'lin_api_...', required: true }
    ]
  },
  {
    id: 'jira_software',
    name: 'Jira Software Cloud',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Agile epics, sprints, bug tickets, and velocity reports across enterprise engineering.',
    icon: 'Bug',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'domain', label: 'Atlassian Domain', type: 'text', placeholder: 'yourcompany.atlassian.net', required: true },
      { key: 'email', label: 'Account Email', type: 'text', placeholder: 'dev@company.com', required: true },
      { key: 'api_token', label: 'API Token', type: 'password', placeholder: 'ATATT3xFfGF0...', required: true }
    ]
  },
  {
    id: 'basecamp_4',
    name: 'Basecamp 4',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Campfires, message boards, to-do lists, and client check-in questionnaires.',
    icon: 'Briefcase',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'account_id', label: 'Account ID', type: 'text', placeholder: '1234567', required: true },
      { key: 'access_token', label: 'OAuth Access Token', type: 'password', placeholder: 'bc_token_...', required: true }
    ]
  },

  // ==========================================================================
  // 10. DEVELOPER UTILITIES (10 connectors)
  // ==========================================================================
  {
    id: 'github_api',
    name: 'GitHub REST & GraphQL',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Automate pull requests, commit code fixes, manage issue discussions, and trigger Actions.',
    icon: 'GitBranch',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'personal_access_token', label: 'GitHub PAT (classic or fine-grained)', type: 'password', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'default_owner', label: 'Default Owner / Org', type: 'text', placeholder: 'your-org', required: false }
    ]
  },
  {
    id: 'gitlab_api',
    name: 'GitLab API',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Trigger GitLab CI/CD pipelines, review merge requests, and monitor deployments.',
    icon: 'GitBranch',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'instance_url', label: 'GitLab URL (default gitlab.com)', type: 'url', placeholder: 'https://gitlab.com', required: false },
      { key: 'access_token', label: 'Personal Access Token', type: 'password', placeholder: 'glpat-xxxx...', required: true }
    ]
  },
  {
    id: 'webhook_dispatcher',
    name: 'Webhook Dispatcher / Custom HTTP',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Send custom authenticated JSON webhooks (POST/PUT/GET) to any endpoint with retry queues.',
    icon: 'CodeXml',
    authType: 'webhook',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'endpoint_url', label: 'Webhook Endpoint URL', type: 'url', placeholder: 'https://api.yourdomain.com/v1/webhook', required: true },
      { key: 'secret_token', label: 'HMAC Signature Secret', type: 'password', placeholder: 'whsec_xxxxxxxx', required: false }
    ]
  },
  {
    id: 'supabase_db',
    name: 'Supabase Database Client',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Direct PostgREST API client for instant CRUD queries and realtime table subscriptions.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'project_url', label: 'Project URL', type: 'url', placeholder: 'https://xxxx.supabase.co', required: true },
      { key: 'anon_or_service_key', label: 'Anon or Service Key', type: 'password', placeholder: 'eyJhbG...', required: true }
    ]
  },
  {
    id: 'postgresql_direct',
    name: 'PostgreSQL Direct',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Direct read-only or read-write Postgres connection pool with SSL certificate support.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'connection_string', label: 'Connection URI', type: 'password', placeholder: 'postgres://user:pass@host:5432/dbname?sslmode=require', required: true }
    ]
  },
  {
    id: 'mysql_pool',
    name: 'MySQL Pool',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Execute parameterized queries against MySQL or MariaDB enterprise databases.',
    icon: 'Database',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'connection_string', label: 'MySQL Connection String', type: 'password', placeholder: 'mysql://user:pass@host:3306/dbname', required: true }
    ]
  },
  {
    id: 'redis_cache',
    name: 'Redis Cache Engine',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Ultra-fast in-memory cache, key-value storage, and pub/sub message broker.',
    icon: 'Zap',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'redis_url', label: 'Redis URL', type: 'password', placeholder: 'redis://default:pass@host:6379', required: true }
    ]
  },
  {
    id: 'postman_collections',
    name: 'Postman Collections',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Execute automated API test collection runners and validate backend microservices.',
    icon: 'Terminal',
    authType: 'api_key',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'api_key', label: 'Postman API Key', type: 'password', placeholder: 'PMAK-xxxxxxxx', required: true },
      { key: 'collection_uid', label: 'Collection UID', type: 'text', placeholder: '12345678-xxxx...', required: false }
    ]
  },
  {
    id: 'docker_hub',
    name: 'Docker Hub API',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Inspect container repositories, monitor build tags, and manage webhook triggers.',
    icon: 'Cpu',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'username', label: 'Docker Hub Username', type: 'text', placeholder: 'myorg', required: true },
      { key: 'personal_access_token', label: 'Personal Access Token', type: 'password', placeholder: 'dckr_pat_...', required: true }
    ]
  },
  {
    id: 'vercel_deployments',
    name: 'Vercel Deployments',
    category: 'Developer Utilities',
    categoryId: 'developer_utilities',
    description: 'Trigger production deployments, preview staging builds, and manage custom domains.',
    icon: 'Globe',
    authType: 'token',
    defaultStatus: 'unconfigured',
    fields: [
      { key: 'access_token', label: 'Vercel Personal Token', type: 'password', placeholder: 'vercel_token_...', required: true },
      { key: 'team_id', label: 'Team ID (Optional)', type: 'text', placeholder: 'team_xxxx', required: false }
    ]
  }
];

export const toolConnectors = TOOL_CONNECTORS;

const STORAGE_KEY = 'ezbo_connected_tools';

/**
 * Retrieves the dictionary of connected tools from client-side storage.
 */
export function getConnectedTools(): Record<string, ConnectedToolState> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[toolConnectors] Failed to parse connected tools:', err);
    return {};
  }
}

/**
 * Saves credentials and marks a tool as connected in client-side storage.
 */
export function saveToolCredentials(toolId: string, credentials: Record<string, string>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getConnectedTools();
    existing[toolId] = {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      credentials
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('ezbo:tools-updated', { detail: { toolId, status: 'connected' } }));
    }
  } catch (err) {
    console.error('[toolConnectors] Failed to save tool credentials:', err);
  }
}

/**
 * Disconnects a tool and clears stored credentials.
 */
export function disconnectTool(toolId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getConnectedTools();
    delete existing[toolId];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('ezbo:tools-updated', { detail: { toolId, status: 'unconfigured' } }));
    }
  } catch (err) {
    console.error('[toolConnectors] Failed to disconnect tool:', err);
  }
}

/**
 * Filter connectors by free-text search (matching name, description, or category).
 */
export function filterConnectorsBySearch(query: string, list: ToolConnector[] = TOOL_CONNECTORS): ToolConnector[] {
  if (!query || !query.trim()) return list;
  const q = query.toLowerCase().trim();
  return list.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
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
  return list.filter((c) => c.category.toLowerCase() === category.toLowerCase() || c.categoryId.toLowerCase() === category.toLowerCase());
}

