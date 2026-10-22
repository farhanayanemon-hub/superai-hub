/**
 * Authoritative Oracle Data for 75-Helper Showcase Integration
 * Derived directly from ORIGINAL_REQUEST.md, PROJECT.md, and Downloads/files/agents.js
 */

export const EXPECTED_CATEGORIES = [
  { key: 'all', label: 'All', expectedCount: 75, idRange: [1, 75] },
  { key: 'ads', label: 'Ads and marketing', expectedCount: 12, idRange: [1, 12] },
  { key: 'social', label: 'Social media', expectedCount: 11, idRange: [13, 23] },
  { key: 'writing', label: 'Writing', expectedCount: 10, idRange: [24, 33] },
  { key: 'image', label: 'Image and logo', expectedCount: 8, idRange: [34, 41] },
  { key: 'seo', label: 'SEO', expectedCount: 9, idRange: [42, 50] },
  { key: 'growth', label: 'Personal growth', expectedCount: 12, idRange: [51, 62] },
  { key: 'biz', label: 'Business automation', expectedCount: 13, idRange: [63, 75] }
];

export const TOTAL_AGENTS = 75;

export const EXPECTED_FILES = [
  'createRobot.js',
  'agents.js',
  'robots.css',
  'README.md'
];

export const ADS_PROPS = {
  1: 'mega',
  2: 'click',
  3: 'clap',
  4: 'mag',
  5: 'flag',
  6: 'doc',
  7: 'cycle',
  8: 'gift',
  9: 'web',
  10: 'mail',
  11: 'chat',
  12: 'pal'
};

export const EXPECTED_PROPS_CONTRACT = {
  ceoSrc: '/ezbo-ceo.png',
  signupUrl: '/signup',
  defaultCategory: 'ads',
  studioUrl: undefined
};

export const EXPECTED_NAVBAR_LINK = '/#features';
export const EXPECTED_SECTION_ID = 'features';
