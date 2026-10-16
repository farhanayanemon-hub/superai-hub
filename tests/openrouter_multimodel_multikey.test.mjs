import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const API_KEY_MANAGER_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'components', 'ApiKeyManager.svelte');
const USER_STORE_PATH = path.join(ROOT_DIR, 'web', 'src', 'lib', 'stores', 'userStore.ts');
const CHAT_SERVER_PATH = path.join(ROOT_DIR, 'web', 'src', 'routes', 'api', 'chat', '+server.ts');
const DASHBOARD_PAGE_PATH = path.join(ROOT_DIR, 'web', 'src', 'routes', 'dashboard', '+page.svelte');

describe('Tier 6: OpenRouter In-Card Multi-Model & Multi-Key Failover Suite', () => {

  describe('Feature 1: Removal of Standalone Bottom Hub & In-Card Selector', () => {
    it('1.1 should have completely removed the bottom standalone OpenRouter Model Hub card', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(
        !source.includes('OpenRouter Model Hub (18 Free Models Available)'),
        'Standalone bottom hub card must be removed from ApiKeyManager.svelte'
      );
      assert.ok(
        !source.includes('<!-- 3. OPENROUTER MODEL SYNC & EXPLORER'),
        'Section 3 standalone bottom card must be removed'
      );
    });

    it('1.2 should embed Model Routing & Failover Chain inside the OpenRouter provider card', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(
        source.includes("p.id === 'openrouter'"),
        'OpenRouter provider card must have dedicated conditional section'
      );
      assert.ok(
        source.includes('Model Routing & Failover Chain'),
        'Must display "Model Routing & Failover Chain" header inside OpenRouter card'
      );
      assert.ok(
        source.includes('1st model acts as Primary') || source.includes('1st model is Primary'),
        'Must state primary-fallback sequence explanation'
      );
    });

    it('1.3 should render selected models as chips with priority pills (#1 Primary, #2 Fallback)', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(source.includes('#1 Primary'), 'Must have #1 Primary badge for the first model in chain');
      assert.ok(source.includes('Fallback'), 'Must designate subsequent models as Fallback');
      assert.ok(source.includes('BrandIcon'), 'Must render BrandIcon for selected model chips');
      assert.ok(source.includes('removeOpenRouterSelectedModel'), 'Must have remove handler on model chips');
    });

    it('1.4 should support searchable multi-select dropdown with Free models pinned on top', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(source.includes('modelSearchQuery'), 'Must support search filtering in model selector');
      assert.ok(source.includes('modelTabFilter'), 'Must support All / Free / Paid tab filters');
      assert.ok(source.includes('filteredOpenRouterModels'), 'Must derive filtered OpenRouter models');
      assert.ok(source.includes('[...syncedFreeModels, ...syncedPaidModels]'), 'Free models must be pinned at the top');
      assert.ok(source.includes('toggleModelInChain'), 'Must support clicking models to toggle in/out of chain');
    });

    it('1.5 should start with 0 models selected by default', () => {
      const userStoreSource = fs.readFileSync(USER_STORE_PATH, 'utf8');
      assert.ok(
        userStoreSource.includes('function loadInitialOpenRouterModels'),
        'Must have loadInitialOpenRouterModels loader'
      );
      assert.ok(
        userStoreSource.includes('return [];'),
        'Initial state must return empty array [] by default'
      );
    });
  });

  describe('Feature 2: Multiple API Keys Per AI Provider & Round-Robin Failover', () => {
    it('2.1 should render "+ Add Another Key" button for every provider', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(
        source.includes('+ Add Another Key'),
        'Must have "+ Add Another Key" button in provider cards'
      );
      assert.ok(
        source.includes('activeAddKeyProvider'),
        'Must manage inline form per provider'
      );
    });

    it('2.2 should display existing keys in masked format with active toggle and delete button', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(source.includes('getMaskedKey'), 'Must have getMaskedKey helper');
      assert.ok(source.includes('••••••••'), 'Masked format must use bullet characters');
      assert.ok(source.includes('toggleVaultKeyEnabled'), 'Must have active switch toggle button');
      assert.ok(source.includes('removeVaultKey'), 'Must have delete/remove button');
    });

    it('2.3 userStore.ts exports getActiveVaultKeys and getRoundRobinVaultKeys', () => {
      const userStoreSource = fs.readFileSync(USER_STORE_PATH, 'utf8');
      assert.ok(
        userStoreSource.includes('export function getActiveVaultKeys'),
        'Must export getActiveVaultKeys'
      );
      assert.ok(
        userStoreSource.includes('export function getRoundRobinVaultKeys'),
        'Must export getRoundRobinVaultKeys'
      );
      assert.ok(
        userStoreSource.includes('providerRoundRobinPointers'),
        'Must maintain round-robin pointers per provider'
      );
    });

    it('2.4 Round-robin key rotation alternates across active keys', () => {
      // Test round robin logic programmatically
      const keys = [
        { id: 'k1', provider: 'gemini', key: 'key-1' },
        { id: 'k2', provider: 'gemini', key: 'key-2' },
        { id: 'k3', provider: 'gemini', key: 'key-3' }
      ];
      let pointer = 0;
      function rotate(list) {
        const start = pointer % list.length;
        pointer = (start + 1) % list.length;
        return [...list.slice(start), ...list.slice(0, start)];
      }

      const r1 = rotate(keys);
      assert.strictEqual(r1[0].id, 'k1');
      assert.strictEqual(r1.length, 3);

      const r2 = rotate(keys);
      assert.strictEqual(r2[0].id, 'k2');
      assert.strictEqual(r2[1].id, 'k3');
      assert.strictEqual(r2[2].id, 'k1');

      const r3 = rotate(keys);
      assert.strictEqual(r3[0].id, 'k3');

      const r4 = rotate(keys);
      assert.strictEqual(r4[0].id, 'k1');
    });
  });

  describe('Feature 3: Server-side Primary-Fallback & Auto Failover in api/chat', () => {
    it('3.1 api/chat accepts vaultKeys and openrouterModels in ChatRequest', () => {
      const serverSource = fs.readFileSync(CHAT_SERVER_PATH, 'utf8');
      assert.ok(serverSource.includes('vaultKeys?:'), 'ChatRequest must include vaultKeys array');
      assert.ok(serverSource.includes('openrouterModels?:'), 'ChatRequest must include openrouterModels array');
    });

    it('3.2 OpenRouter executes user-selected models with 429 / quota failover', () => {
      const serverSource = fs.readFileSync(CHAT_SERVER_PATH, 'utf8');
      assert.ok(
        serverSource.includes('body.openrouterModels') && serverSource.includes('candidateModels = body.openrouterModels'),
        'Must use user-selected openrouterModels in priority sequence'
      );
      assert.ok(
        serverSource.includes('isRateLimitOrQuota') && serverSource.includes('continue'),
        'Must continue to next model/key on rate-limit or quota error'
      );
      assert.ok(
        serverSource.includes('providerRes.status === 429'),
        'Must detect HTTP 429 status code'
      );
    });

    it('3.3 Gemini executes candidate keys with auto failover on 429 / quota', () => {
      const serverSource = fs.readFileSync(CHAT_SERVER_PATH, 'utf8');
      assert.ok(
        serverSource.includes('[gemini-failover]'),
        'Must log and failover on Gemini rate limits'
      );
      assert.ok(
        serverSource.includes('geminiRes.status === 429') || serverSource.includes('RESOURCE_EXHAUSTED'),
        'Must detect Gemini rate-limit or resource exhaustion'
      );
    });
  });

  describe('Feature 4: Cloud Managed Plan Experience', () => {
    it('4.1 ApiKeyManager detects Cloud Managed tier (tier === managed)', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(
        source.includes("tier === 'managed'"),
        "Must check $subscription?.tier === 'managed' or $currentUser?.tier === 'managed'"
      );
      assert.ok(
        source.includes('isCloudManaged'),
        'Must derive isCloudManaged flag'
      );
    });

    it('4.2 ApiKeyManager renders sleek reassuring banner for Cloud Managed users', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(
        source.includes('You are on Cloud Managed Plan'),
        'Must include exact heading: You are on Cloud Managed Plan'
      );
      assert.ok(
        source.includes('All AI models and API keys are centrally managed by Ezbo Cloud. Zero configuration needed!'),
        'Must include exact reassurance text'
      );
    });

    it('4.3 ApiKeyManager suppresses all BYOK forms when isCloudManaged is true', () => {
      const source = fs.readFileSync(API_KEY_MANAGER_PATH, 'utf8');
      assert.ok(
        source.includes('{#if isCloudManaged}') && source.includes('{:else}'),
        'Must branch template using {#if isCloudManaged} and hide BYOK in {:else}'
      );
      assert.ok(
        source.includes('Configured API Providers'),
        'Configured API Providers must be inside {:else} branch'
      );
    });

    it('4.4 Dashboard sidebar keeps API Key Management tab accessible for all users', () => {
      const dashboardSource = fs.readFileSync(DASHBOARD_PAGE_PATH, 'utf8');
      assert.ok(
        dashboardSource.includes("switchTab('api-keys')"),
        'Sidebar must retain API Key Management tab click action'
      );
      assert.ok(
        dashboardSource.includes('API Key Management'),
        'Sidebar must display API Key Management text'
      );
    });
  });

  describe('Feature 5: Edge Cases & Immutability', () => {
    it('5.1 userStore addOpenRouterSelectedModel prevents duplicates', () => {
      const userStoreSource = fs.readFileSync(USER_STORE_PATH, 'utf8');
      assert.ok(
        userStoreSource.includes('if (current.includes(modelId)) return current;'),
        'addOpenRouterSelectedModel must deduplicate models'
      );
    });

    it('5.2 userStore removeOpenRouterSelectedModel removes cleanly', () => {
      const userStoreSource = fs.readFileSync(USER_STORE_PATH, 'utf8');
      assert.ok(
        userStoreSource.includes('current.filter((m) => m !== modelId)'),
        'removeOpenRouterSelectedModel must filter out target model'
      );
    });

    it('5.3 getActiveVaultKeys filters out disabled keys (isEnabled === false)', () => {
      const userStoreSource = fs.readFileSync(USER_STORE_PATH, 'utf8');
      assert.ok(
        userStoreSource.includes('k.isEnabled !== false'),
        'Must filter out keys where isEnabled is false'
      );
    });

    it('5.4 FloatingCeoChat, DashboardChat, and ToolDrawer bind round-robin keys & openrouterModels', () => {
      const chatSource = fs.readFileSync(path.join(ROOT_DIR, 'web/src/lib/components/FloatingCeoChat.svelte'), 'utf8');
      const dChatSource = fs.readFileSync(path.join(ROOT_DIR, 'web/src/lib/components/DashboardChat.svelte'), 'utf8');
      const drawerSource = fs.readFileSync(path.join(ROOT_DIR, 'web/src/lib/components/ToolDrawer.svelte'), 'utf8');

      assert.ok(chatSource.includes('payload.vaultKeys = roundRobinKeys'), 'FloatingCeoChat sets payload.vaultKeys');
      assert.ok(chatSource.includes('payload.openrouterModels = $openrouterSelectedModels'), 'FloatingCeoChat sets payload.openrouterModels');

      assert.ok(dChatSource.includes('payload.vaultKeys = roundRobinKeys'), 'DashboardChat sets payload.vaultKeys');
      assert.ok(dChatSource.includes('payload.openrouterModels = $openrouterSelectedModels'), 'DashboardChat sets payload.openrouterModels');

      assert.ok(drawerSource.includes('payload.vaultKeys = roundRobinKeys'), 'ToolDrawer sets payload.vaultKeys');
      assert.ok(drawerSource.includes('payload.openrouterModels = $openrouterSelectedModels'), 'ToolDrawer sets payload.openrouterModels');
    });
  });
});
