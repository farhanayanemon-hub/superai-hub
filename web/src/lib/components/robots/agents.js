// agents.js
// Single source of truth for all 75 helpers. Edit text, icons, or overrides here.
// Ads (#01-#12) are hand-configured with hand-drawn props. The rest are generated from
// a color/eye/ear/antenna cycle so no two robots look the same; use OVERRIDES to tweak any bot.

export const CATEGORIES = [
  { key: 'all', label: 'All 75' },
  { key: 'ads', label: 'Ads and marketing' },
  { key: 'social', label: 'Social media' },
  { key: 'writing', label: 'Writing' },
  { key: 'image', label: 'Image and logo' },
  { key: 'seo', label: 'SEO' },
  { key: 'growth', label: 'Personal growth' },
  { key: 'biz', label: 'Business automation' },
];

const ADS = [
  { n: 1, name: 'AdNexus', tag: 'High ROI Facebook and Instagram ads generator', d: 'High-converting Facebook and Instagram ad copy, headlines, and CTAs.', c: '#1E6BFF', e: '#6FE3FF', eyes: 'smile', ear: 'ring', ant: 'ball', prop: 'mega' },
  { n: 2, name: 'ClickForge', tag: 'High CTR Google Search and Display ads generator', d: 'Google Search RSA headlines, descriptions, extensions, and keyword sets.', c: '#0EA5E9', e: '#7CF5E1', eyes: 'dots', ear: 'ring', ant: 'twin', prop: 'click' },
  { n: 3, name: 'ReelCloser', tag: 'TikTok and Reels video ad scriptwriter', d: '3-second scroll-stopping video ad scripts with visual cues and CTAs.', c: '#7C3AED', e: '#C4B5FD', eyes: 'wink', ear: 'rect', ant: 'ball', prop: 'clap' },
  { n: 4, name: 'PersonaIQ', tag: 'Target audience and buyer persona finder', d: 'Pinpoints exact buyer demographics, interests, pain points, and ad targeting.', c: '#2563EB', e: '#93E0FF', eyes: 'pill', ear: 'ring', ant: 'dish', prop: 'mag' },
  { n: 5, name: 'GrowthMap', tag: '360° marketing campaign planner', d: 'Complete launch and promotion roadmap across paid, organic, and direct channels.', c: '#14B8A6', e: '#8FFFE0', eyes: 'smile', ear: 'rect', ant: 'ball', prop: 'flag' },
  { n: 6, name: 'SpyEdge', tag: 'Competitor ad and strategy spy helper', d: 'Analyzes competitor offers and builds superior counter-campaigns.', c: '#1E3A8A', e: '#FFD166', eyes: 'shades', ear: 'ring', ant: 'none', hat: 'fedora', prop: 'doc' },
  { n: 7, name: 'WinBack', tag: 'Retargeting ad copy generator', d: 'Converts warm visitors and cart abandoners who did not buy on their first visit.', c: '#059669', e: '#8CFFC7', eyes: 'dots', ear: 'ring', ant: 'bulb', prop: 'cycle' },
  { n: 8, name: 'OfferCraft', tag: 'Promo offer and bundle architect', d: 'Designs high-AOV product bundles, BOGO deals, and grand-slam offers.', c: '#EC4899', e: '#FFD1EA', eyes: 'star', ear: 'rect', ant: 'ball', prop: 'gift' },
  { n: 9, name: 'PageConvert', tag: 'Landing page conversion copywriter', d: 'Full landing page copy with hero headline, benefits, social proof, and CTA.', c: '#0284C7', e: '#7DD3FC', eyes: 'smile', ear: 'rect', ant: 'dish', prop: 'web' },
  { n: 10, name: 'InboxPulse', tag: 'Email marketing and newsletter generator', d: 'High-open-rate subject lines, promotional emails, and value newsletters.', c: '#4F46E5', e: '#A5B4FC', eyes: 'dots', ear: 'ring', ant: 'ball', prop: 'mail' },
  { n: 11, name: 'PingConvert', tag: 'WhatsApp and SMS marketing blaster', d: 'Punchy WhatsApp broadcasts and 160-character SMS promos that trigger instant replies.', c: '#16A34A', e: '#86EFAC', eyes: 'smile', ear: 'ring', ant: 'twin', prop: 'chat' },
  { n: 12, name: 'VisualBrief', tag: 'Ad creative and banner brief maker', d: 'Exact banner layouts, on-image text, and visual instructions for designers.', c: '#9333EA', e: '#F0ABFC', eyes: 'pill', ear: 'rect', ant: 'bulb', prop: 'pal' },
].map((a) => ({ ...a, cat: 'ads' }));

// name | tag | description | tabler icon
const DATA = {
  social: [
    'IdeaSpark|Unlimited post ideas generator|Generates 20+ engaging, niche-specific social media post ideas in seconds.|bulb',
    'CalendarPro|30-day content calendar|Full 30-day day-by-day posting schedule with topics, formats, and CTAs.|calendar-event',
    'HookMaster|Viral hook and headline generator|30+ irresistible opening hooks for Reels, TikToks, carousels, and posts.|anchor',
    'CaptionCraft|Facebook and Instagram caption writer|Scroll-stopping captions with emojis and hashtags.|text-caption',
    'LinkLeader|LinkedIn authority post writer|Thought-leadership LinkedIn posts that attract high-paying B2B clients.|brand-linkedin',
    'SlideDeck|Carousel and infographic slide planner|Slide-by-slide carousel copy optimized for saves and shares.|slideshow',
    'TubeArchitect|YouTube script and title generator|High-CTR titles, thumbnail text, and retention-optimized video scripts.|brand-youtube',
    'OmniMultiply|Content repurposer, 1 to 10|Turns 1 blog, video, or rough note into 10 ready-to-post social assets.|copy',
    'TagRadar|Hashtag and social keyword researcher|Finds high-reach, low-competition hashtags and social SEO keywords.|hash',
    'BuzzSpark|Engagement question and poll creator|Interactive questions, polls, and debate posts that flood your comment section.|thumb-up',
    'MemeWave|Trend-jacking and meme idea generator|Connects relatable industry humor and viral trends to your brand.|mood-happy',
  ],
  writing: [
    'HumanPulse|AI text humanizer|Transforms robotic AI text into natural, authentic human writing.|heartbeat',
    'LexiCheck|Advanced grammar and spell checker|Fixes grammar, spelling, punctuation, and awkward phrasing instantly.|spell-check',
    'RePhrasePro|Smart paraphraser and rewriter|Rewrites any text into fresh, original, high-impact phrasing.|replace',
    'ToneShift|Tone changer|Adapts any rough message into diplomatic, persuasive, or executive tone.|adjustments',
    'BiLingualPro|Bangla-to-English business translator|Translates Bangla or Banglish thoughts into polished business English and back.|language',
    'BriefCore|Long text and document summarizer|Condenses long articles, reports, and PDFs into key takeaways and action points.|file-text',
    'StoryLoom|Storytelling and brand narrative writer|Crafts emotional founder stories, About Us pages, and brand mission statements.|book',
    'PressDesk|Press release and announcement writer|Media-ready press releases and official company announcements.|news',
    'OutreachSniper|Cold email and B2B outreach writer|Personalized 3-step cold email sequences that get replies from decision-makers.|target-arrow',
    'StageVoice|Keynote and presentation scriptwriter|Engaging scripts and talking points for webinars, pitches, and meetings.|microphone',
  ],
  image: [
    'PixelForge|AI commercial image generator|Generates photorealistic commercial images and ad visuals in your console.|photo',
    'LogoCraft|AI business logo generator|Designs modern business logo visuals, brand marks, and vector concepts.|vector',
    'StudioLens|Product photography and mockup maker|Creates studio-grade product photography scenes and lifestyle mockups.|camera',
    'ThumbMagnet|YouTube and Facebook thumbnail designer|High-contrast thumbnail visuals, composition layouts, and 3-word text hooks.|eye',
    'PosterLab|Poster and ad banner creator|Generates promotional poster visuals, typography hierarchy, and design prompts.|layout',
    'ChromaGuide|Brand color and typography guide|Complete HEX color palettes, Google Font pairings, and brand visual guidelines.|palette',
    'PromptLens|Midjourney and Flux Pro prompt engineer|Expands simple ideas into master-level Midjourney v6 and Flux Pro prompts.|sparkles',
    'PackStudio|Packaging and label design ideator|Box, pouch, and bottle label concepts with front and back copy.|package',
  ],
  seo: [
    'RankScout|Keyword research and low-competition finder|Finds high-intent, low-competition keywords and buyer search queries.|search',
    'ArticleRank|SEO-optimized blog and article writer|Writes ranking blog articles with H1-H3 headings, FAQs, and NLP keywords.|article',
    'MetaOptima|On-page SEO and meta tag generator|Generates meta titles, meta descriptions, URL slugs, and H1-H3 tags.|code',
    'ShopRank|E-commerce product description SEO|SEO-optimized product titles, benefit bullets, and specs for online stores.|shopping-cart',
    'LocalRank|Local SEO and Google My Business optimizer|Ranks your local business on Google Maps with optimized descriptions and posts.|map-pin',
    'SchemaBot|FAQ and schema markup generator|Creates SEO FAQs and valid JSON-LD schema markup for rich snippets.|braces',
    'LinkPitch|Backlink outreach and guest post pitcher|High-reply guest post pitches and backlink outreach emails.|link',
    'ClusterMap|Content gap and topic cluster planner|Maps 1 pillar page and 15 supporting cluster articles with internal link plans.|sitemap',
    'VidRanker|YouTube video SEO tags and description|Keyword-rich descriptions, timestamps, and tags that rank YouTube videos.|player-play',
  ],
  growth: [
    'HabitForge|Daily habit and routine architect|Builds morning and evening routines and habit-stacking systems for discipline.|repeat',
    'FocusTitan|Deep work and laser focus protocol|Flow-state triggers, Pomodoro and time-blocking protocols for 4+ hours of focus.|target',
    'ActionIgnite|Procrastination action catalyst|5-second drills, micro-chunking big tasks, and instant activation triggers.|flame',
    'MindFortress|Stoic mindset and resilience guide|Stoic reframing to overcome anxiety, burnout, criticism, and setbacks.|shield',
    'GoalCraft|90-day goal and milestone planner|Turns 1-year visions into 90-day sprints with weekly metrics and daily non-negotiables.|flag',
    'CogniWise|First-principles and mental models advisor|Solves dilemmas with First Principles, Inversion, 2nd-Order Thinking, and the 80/20 Rule.|brain',
    'UltraLearn|Rapid skill acquisition coach|Feynman technique, skill deconstruction, active recall drills, and fast knowledge synthesis.|school',
    'VoiceMaster|Public speaking and voice coach|3-act storytelling hooks, stage fright fixes, vocal cadence, and pitch frameworks.|presentation',
    'EmpathyPro|Emotional intelligence and boundary setter|Non-violent communication scripts, de-escalation, and guilt-free boundaries.|heart',
    'BioVitality|Energy, sleep and bio-rhythm protocol|Circadian rhythm tips, sleep hygiene checklists, and midday crash prevention.|bolt',
    'WealthMind|Wealth mindset and budget planner|50/30/20 budget framework, debt strategy, mindful spending filters, and money psychology.|coin',
    'ReflectZen|Evening gratitude and reflection coach|5-minute evening journaling, daily win celebrations, and a peaceful mental wind-down.|moon',
  ],
  biz: [
    'ChronoExec|Time management and daily planner|Structures chaotic task lists into prioritized time-blocked daily routines.|clock',
    'DealCloser|Inbox sales and objection handler|Turns price objections and "I will think about it" replies into confirmed orders.|handshake',
    'CalmResolve|Angry customer handling and retention|De-escalates angry complaints and late delivery issues with empathy.|headset',
    'SheetWizard|Excel and Google Sheets formula generator|Generates exact VLOOKUP, XLOOKUP, QUERY, and Apps Script automations.|table',
    'MarginPro|Profit margin and pricing calculator|Calculates net margin, break-even ROAS, and optimal retail pricing.|calculator',
    'SystemFlow|Standard operating procedure creator|Creates step-by-step SOP checklists to train team members and delegate tasks.|list-check',
    'BriefSync|Meeting notes to action plan converter|Turns messy meeting notes into clear decisions, owners, and deadlines.|notes',
    'NameCraft|Business name and domain generator|Generates brandable company names, taglines, and .com domain ideas.|tag',
    'PayPulse|Invoice reminder and payment follow-up|Polite yet firm invoice follow-ups that get overdue payments cleared fast.|receipt',
    'TalentScout|HR job post and interview question maker|Role-specific job posts, KPIs, practical test tasks, and interview questions.|users',
    'VentureLens|Business idea validator and SWOT|Validates ideas with SWOT analysis, profit potential, and a 30-day launch plan.|rocket',
    'DevFixer|Website code and WordPress bug fixer|Solves WordPress, Shopify, HTML/CSS, and JavaScript bugs with copy-paste code.|tool',
    'GoalPulse|Weekly productivity and goal tracker|Reviews weekly wins, fixes bottlenecks, and sets the top 3 KPIs for next week.|chart-line',
  ],
};

// [accent color, eye/glow color]
const PALETTE = [
  ['#1E6BFF', '#6FE3FF'], ['#0EA5E9', '#7CF5E1'], ['#7C3AED', '#C4B5FD'], ['#2563EB', '#93E0FF'],
  ['#14B8A6', '#8FFFE0'], ['#059669', '#8CFFC7'], ['#EC4899', '#FFD1EA'], ['#0284C7', '#7DD3FC'],
  ['#4F46E5', '#A5B4FC'], ['#16A34A', '#86EFAC'], ['#9333EA', '#F0ABFC'], ['#0D9488', '#99F6E4'],
  ['#3B82F6', '#BAE6FD'], ['#6366F1', '#C7D2FE'],
];
const EYES = ['smile', 'dots', 'wink', 'pill', 'star', 'heart'];
const ANTENNAS = ['ball', 'twin', 'dish', 'bulb'];

// Per-bot tweaks, keyed by name. Any field of the agent config can be overridden.
export const OVERRIDES = {
  UltraLearn: { hat: 'grad', ant: 'none' },
  TubeArchitect: { hat: 'cap', ant: 'none' },
  CalmResolve: { hat: 'headset', ant: 'none', eyes: 'heart' },
  EmpathyPro: { eyes: 'heart' },
  ReflectZen: { eyes: 'smile' },
};

let n = 13;
const generated = ['social', 'writing', 'image', 'seo', 'growth', 'biz'].flatMap((cat) =>
  DATA[cat].map((row) => {
    const [name, tag, d, icon] = row.split('|');
    const [c, e] = PALETTE[(n * 5) % PALETTE.length];
    const agent = {
      n, name, tag, d, icon, cat, c, e,
      eyes: EYES[(n * 7) % EYES.length],
      ear: (n + (n >> 2)) % 2 ? 'rect' : 'ring',
      ant: ANTENNAS[(n >> 1) % ANTENNAS.length],
      ...OVERRIDES[name],
    };
    n += 1;
    return agent;
  })
);

export const AGENTS = [...ADS, ...generated];
