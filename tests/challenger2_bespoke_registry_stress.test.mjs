/**
 * Adversarial Empirical Challenge Suite: Challenger 2
 * Bespoke Registry & Dynamic Execution Stress Challenge
 * 
 * Verifies:
 * 1. agentRegistry.ts exports and interface contracts
 * 2. Store reactivity and dynamic registration/unregistration lifecycle
 * 3. Custom component binding and view preferences
 * 4. In-place updates and multi-agent handling
 * 5. Active agent lifecycle and automatic cleanup on unregister
 * 6. Dashboard empty state verbatim string and populated state host
 * 7. CEO Router dynamic resolution using getRegisteredAgents()
 * 8. Plan capabilities dynamic count and directive generation without hardcoded 80
 * 9. Legacy agent purge completeness across platform
 * 10. Cryptographic invariant: robots.css SHA256
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

try {
  register('./helpers/sveltekit_loader.mjs', import.meta.url);
} catch {
  // Already registered
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

const REGISTRY_PATH = path.join(WEB_DIR, 'src', 'lib', 'config', 'agentRegistry.ts');
const DASHBOARD_PATH = path.join(WEB_DIR, 'src', 'routes', 'dashboard', '+page.svelte');
const CEO_ROUTER_PATH = path.join(WEB_DIR, 'src', 'lib', 'services', 'ceoRouter.ts');
const TOOLS_PATH = path.join(WEB_DIR, 'src', 'lib', 'config', 'tools.ts');
const NAVBAR_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'Navbar.svelte');
const HOMEPAGE_PATH = path.join(WEB_DIR, 'src', 'routes', '+page.svelte');
const ADMIN_PATH = path.join(WEB_DIR, 'src', 'routes', 'admin', '+page.svelte');
const ROBOTS_CSS_PATH = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots', 'robots.css');

// Dynamically import modules
const registryMod = await import(pathToFileURL(REGISTRY_PATH).href);
const {
  DEFAULT_REGISTERED_AGENTS,
  registeredAgents,
  activeBespokeAgent,
  registerAgent,
  unregisterAgent,
  getRegisteredAgents,
  getAgentById,
  openBespokeAgent,
  closeBespokeAgent
} = registryMod;

const ceoRouterMod = await import(pathToFileURL(CEO_ROUTER_PATH).href);
const {
  recommendHelperForMessage,
  matchHelperForMessage,
  extractPlanCapabilities,
  buildPlanCapabilityDirective,
  buildCeoOrHelperSystemPrompt,
  isRestrictedStarterIntent,
  isConversationalGreeting
} = ceoRouterMod;

const toolsMod = await import(pathToFileURL(TOOLS_PATH).href);
const { TOOLS, ALL_TOOLS, CATEGORIES, AI_CEO_PROFILE } = toolsMod;

describe('Challenger 2: Bespoke Registry & Dynamic Execution Stress Challenge', () => {

  // Clean slate before and after each test
  function resetRegistry() {
    closeBespokeAgent();
    registeredAgents.set([]);
  }

  beforeEach(() => {
    resetRegistry();
  });

  afterEach(() => {
    resetRegistry();
  });

  // =========================================================================
  // 1. REGISTRY EXPORTS & INTERFACE CONTRACTS
  // =========================================================================
  describe('1. agentRegistry.ts Exports & Contract Verification', () => {
    it('1.1 should export all mandatory functions, constants, and stores', () => {
      assert.ok(Array.isArray(DEFAULT_REGISTERED_AGENTS), 'DEFAULT_REGISTERED_AGENTS should be an array');
      assert.strictEqual(DEFAULT_REGISTERED_AGENTS.length, 0, 'DEFAULT_REGISTERED_AGENTS should default to empty array');
      assert.strictEqual(typeof registerAgent, 'function', 'registerAgent should be a function');
      assert.strictEqual(typeof unregisterAgent, 'function', 'unregisterAgent should be a function');
      assert.strictEqual(typeof getRegisteredAgents, 'function', 'getRegisteredAgents should be a function');
      assert.strictEqual(typeof getAgentById, 'function', 'getAgentById should be a function');
      assert.strictEqual(typeof openBespokeAgent, 'function', 'openBespokeAgent should be a function');
      assert.strictEqual(typeof closeBespokeAgent, 'function', 'closeBespokeAgent should be a function');
      assert.strictEqual(typeof registeredAgents.subscribe, 'function', 'registeredAgents store should be subscribable');
      assert.strictEqual(typeof activeBespokeAgent.subscribe, 'function', 'activeBespokeAgent store should be subscribable');
    });

    it('1.2 should declare TypeScript interfaces BespokeAgentMetadata and BespokeAgent in source code', () => {
      const source = fs.readFileSync(REGISTRY_PATH, 'utf-8');
      assert.ok(source.includes('export interface BespokeAgentMetadata'), 'Must export BespokeAgentMetadata');
      assert.ok(source.includes('export interface BespokeAgent extends BespokeAgentMetadata'), 'Must export BespokeAgent');
      assert.ok(source.includes("component?: Component<any> | null;"), 'Must declare component?: Component<any> | null');
      assert.ok(source.includes("viewPreference?: 'fullscreen' | 'drawer' | 'dialog' | 'inline'"), 'Must declare viewPreference options');
    });
  });

  // =========================================================================
  // 2. STORE REACTIVITY & DYNAMIC REGISTRATION LIFECYCLE
  // =========================================================================
  describe('2. Store Reactivity and Dynamic Registration Lifecycle', () => {
    it('2.1 should notify store subscribers upon registering a bespoke agent', () => {
      const updates = [];
      const unsubscribe = registeredAgents.subscribe((list) => {
        updates.push([...list]);
      });

      assert.strictEqual(updates.length, 1, 'Should emit initial value');
      assert.strictEqual(updates[0].length, 0, 'Initial list is empty');

      const mockComponent = { name: 'CustomGrowthUi' };
      const customAgent = {
        id: 'agent_custom_growth',
        name: 'Growth Hacker Pro',
        nameEn: 'Growth Hacker Pro',
        description: 'Autonomous virality and growth hacking agent.',
        shortDesc: 'Growth Agent',
        icon: 'Rocket',
        badge: 'Custom',
        category: 'Growth',
        systemPrompt: 'You are Growth Hacker Pro.',
        keywords: ['growth', 'virality', 'hack'],
        inputs: [{ name: 'niche', label: 'Business Niche', type: 'text' }],
        settings: { autonomous: true },
        component: mockComponent,
        viewPreference: 'fullscreen'
      };

      registerAgent(customAgent);

      assert.strictEqual(updates.length, 2, 'Subscriber should be notified of addition');
      assert.strictEqual(updates[1].length, 1, 'Subscriber list now contains 1 agent');
      assert.strictEqual(updates[1][0].id, 'agent_custom_growth');
      assert.strictEqual(updates[1][0].component, mockComponent);
      assert.strictEqual(updates[1][0].viewPreference, 'fullscreen');

      unsubscribe();
    });

    it('2.2 should retrieve registered agent via getRegisteredAgents() and getAgentById()', () => {
      const agent = {
        id: 'agent_seo_master',
        name: 'SEO Master bespoke',
        description: 'Advanced semantic SEO clustering.',
        systemPrompt: 'You are SEO Master bespoke.'
      };

      registerAgent(agent);

      const all = getRegisteredAgents();
      assert.strictEqual(all.length, 1);
      assert.strictEqual(all[0].id, 'agent_seo_master');

      const found = getAgentById('agent_seo_master');
      assert.ok(found, 'Should find registered agent by ID');
      assert.strictEqual(found.name, 'SEO Master bespoke');

      const notFound = getAgentById('non_existent_id');
      assert.strictEqual(notFound, undefined, 'Unknown ID returns undefined');
    });

    it('2.3 should update an agent in-place when re-registering with the same ID', () => {
      const v1 = {
        id: 'agent_crypto',
        name: 'Crypto Agent v1',
        description: 'Version 1'
      };
      const v2 = {
        id: 'agent_crypto',
        name: 'Crypto Agent v2 (Updated)',
        description: 'Version 2 with upgrade'
      };

      registerAgent(v1);
      assert.strictEqual(getRegisteredAgents().length, 1);
      assert.strictEqual(getAgentById('agent_crypto')?.name, 'Crypto Agent v1');

      registerAgent(v2);
      assert.strictEqual(getRegisteredAgents().length, 1, 'Count must NOT increase on update');
      assert.strictEqual(getAgentById('agent_crypto')?.name, 'Crypto Agent v2 (Updated)');
      assert.strictEqual(getAgentById('agent_crypto')?.description, 'Version 2 with upgrade');
    });

    it('2.4 should handle multiple agents and support all view preferences', () => {
      const agents = [
        { id: 'agent_1', name: 'Agent One', description: 'Desc 1', viewPreference: 'fullscreen' },
        { id: 'agent_2', name: 'Agent Two', description: 'Desc 2', viewPreference: 'drawer' },
        { id: 'agent_3', name: 'Agent Three', description: 'Desc 3', viewPreference: 'dialog' },
        { id: 'agent_4', name: 'Agent Four', description: 'Desc 4', viewPreference: 'inline' }
      ];

      for (const a of agents) {
        registerAgent(a);
      }

      assert.strictEqual(getRegisteredAgents().length, 4);
      assert.strictEqual(getAgentById('agent_1')?.viewPreference, 'fullscreen');
      assert.strictEqual(getAgentById('agent_2')?.viewPreference, 'drawer');
      assert.strictEqual(getAgentById('agent_3')?.viewPreference, 'dialog');
      assert.strictEqual(getAgentById('agent_4')?.viewPreference, 'inline');
    });
  });

  // =========================================================================
  // 3. ACTIVE BESPOKE AGENT WORKSPACE LIFECYCLE
  // =========================================================================
  describe('3. Active Bespoke Agent Workspace Controls & Auto-Cleanup', () => {
    it('3.1 should open agent by string ID or agent object', () => {
      const agent = {
        id: 'agent_visual',
        name: 'Visual Creative Studio',
        description: 'Dedicated visual workflow'
      };
      registerAgent(agent);

      let currentActive = null;
      const unsub = activeBespokeAgent.subscribe((val) => {
        currentActive = val;
      });

      assert.strictEqual(currentActive, null, 'Active agent starts null');

      // Open by string ID
      openBespokeAgent('agent_visual');
      assert.ok(currentActive);
      assert.strictEqual(currentActive.id, 'agent_visual');

      // Close
      closeBespokeAgent();
      assert.strictEqual(currentActive, null);

      // Open by object
      openBespokeAgent(agent);
      assert.ok(currentActive);
      assert.strictEqual(currentActive.id, 'agent_visual');

      unsub();
    });

    it('3.2 should automatically reset activeBespokeAgent to null when that agent is unregistered', () => {
      const agentA = { id: 'agent_a', name: 'Agent A', description: 'A' };
      const agentB = { id: 'agent_b', name: 'Agent B', description: 'B' };
      registerAgent(agentA);
      registerAgent(agentB);

      openBespokeAgent('agent_a');
      let activeVal = null;
      const unsub = activeBespokeAgent.subscribe((val) => {
        activeVal = val;
      });

      assert.strictEqual(activeVal?.id, 'agent_a');

      // Unregistering a DIFFERENT agent should NOT close agent_a
      const removedB = unregisterAgent('agent_b');
      assert.strictEqual(removedB, true);
      assert.strictEqual(activeVal?.id, 'agent_a', 'Active agent_a remains open');

      // Unregistering the CURRENT active agent must reset activeBespokeAgent to null
      const removedA = unregisterAgent('agent_a');
      assert.strictEqual(removedA, true);
      assert.strictEqual(activeVal, null, 'Active agent must be reset to null when unregistered');

      // Subsequent unregister of same id returns false
      const removedAgain = unregisterAgent('agent_a');
      assert.strictEqual(removedAgain, false);

      unsub();
    });
  });

  // =========================================================================
  // 4. DASHBOARD EMPTY STATE & POPULATED STATE VERBATIM ASSERTION
  // =========================================================================
  describe('4. Dashboard Empty State & Custom Component Mount Assertion', () => {
    const dashboardContent = fs.readFileSync(DASHBOARD_PATH, 'utf-8');

    it('4.1 should display the EXACT verbatim empty state text when 0 agents are registered', () => {
      const expectedText = "Your agent workspace is clean. Custom agents will appear here as you add them, or you can command the Master AI CEO directly.";
      assert.ok(
        dashboardContent.includes(expectedText),
        `Dashboard must contain verbatim text: "${expectedText}"`
      );
    });

    it('4.2 should condition the empty state on $registeredAgents.length === 0', () => {
      assert.ok(
        dashboardContent.includes('{#if $registeredAgents.length === 0}'),
        'Dashboard must render empty state when $registeredAgents.length === 0'
      );
    });

    it('4.3 should render the dynamic grid when registeredAgents is populated', () => {
      assert.ok(
        dashboardContent.includes('{#each filteredBespokeAgents as agent (agent.id)}'),
        'Dashboard must dynamically loop over filteredBespokeAgents'
      );
    });

    it('4.4 should mount the bespoke agent dynamic component host', () => {
      assert.ok(
        dashboardContent.includes('{#if $activeBespokeAgent?.component}'),
        'Dashboard must check if $activeBespokeAgent?.component exists'
      );
      assert.ok(
        dashboardContent.includes('{@const CustomComponent = $activeBespokeAgent.component}'),
        'Dashboard must alias component with {@const CustomComponent = ...}'
      );
      assert.ok(
        dashboardContent.includes('<CustomComponent agent={$activeBespokeAgent} onClose={closeBespokeAgent} />'),
        'Dashboard must render CustomComponent with agent and onClose props'
      );
    });

    it('4.5 should NOT contain "Show All 80 Helpers" or static category scrollbar in template', () => {
      assert.ok(!dashboardContent.includes('Show All 80 Helpers'), 'Show All 80 Helpers button must be purged');
      assert.ok(!dashboardContent.includes('use:draggableScroll'), 'Static category draggable scrollbar must be removed from template');
    });
  });

  // =========================================================================
  // 5. CEO ROUTER & DYNAMIC EXECUTION STRESS
  // =========================================================================
  describe('5. CEO Router Dynamic Execution & Plan Intelligence', () => {
    it('5.1 recommendHelperForMessage resolves bespoke agent dynamically by name or keyword', () => {
      const customAgent = {
        id: 'agent_crypto_arbitrage',
        name: 'Crypto Arbitrage Specialist',
        nameEn: 'Crypto Arbitrage Specialist',
        description: 'Finds arbitrage across DEX and CEX.',
        keywords: ['arbitrage', 'dex', 'cex', 'token swap']
      };
      registerAgent(customAgent);

      // Query matching name
      const rec1 = recommendHelperForMessage('I need the Crypto Arbitrage Specialist');
      assert.ok(rec1, 'Should recommend bespoke agent');
      assert.strictEqual(rec1.id, 'agent_crypto_arbitrage');

      // Query matching keyword
      const rec2 = recommendHelperForMessage('calculate token swap spread for me');
      assert.ok(rec2, 'Should recommend bespoke agent via keyword');
      assert.strictEqual(rec2.id, 'agent_crypto_arbitrage');

      // Casual greeting should return null, not trigger delegation
      const recGreeting = recommendHelperForMessage('hello ezbo');
      assert.strictEqual(recGreeting, null, 'Greeting must not trigger recommendation');
    });

    it('5.2 matchHelperForMessage resolves bespoke agent by explicit ID and text match', () => {
      const customAgent = {
        id: 'agent_funnel_builder',
        name: 'High-Ticket Funnel Architect',
        description: 'Builds webinar funnels.',
        keywords: ['webinar funnel', 'high ticket']
      };
      registerAgent(customAgent);

      // Explicit ID match
      const matchedById = matchHelperForMessage('proceed with plan', 'agent_funnel_builder');
      assert.ok(matchedById);
      assert.strictEqual(matchedById.id, 'agent_funnel_builder');

      // Text keyword match
      const matchedByText = matchHelperForMessage('create a high ticket funnel strategy');
      assert.ok(matchedByText);
      assert.strictEqual(matchedByText.id, 'agent_funnel_builder');
    });

    it('5.3 extractPlanCapabilities dynamically reflects registered agents without hardcoded 80 count', () => {
      // 0 registered agents
      const capsZero = extractPlanCapabilities(null, 'byok_starter');
      assert.strictEqual(capsZero.totalHelpersCount, 0, 'Total helpers should be 0 when registry is clean');
      assert.strictEqual(capsZero.unlockedHelpersCount, 0, 'Unlocked helpers should be 0');
      assert.strictEqual(capsZero.allHelpersUnlocked, true, 'allHelpersUnlocked should be true for Starter default');

      // 3 registered bespoke agents
      registerAgent({ id: 'b1', name: 'Bespoke 1', description: 'D1' });
      registerAgent({ id: 'b2', name: 'Bespoke 2', description: 'D2' });
      registerAgent({ id: 'b3', name: 'Bespoke 3', description: 'D3' });

      const capsThree = extractPlanCapabilities(null, 'byok_starter');
      assert.strictEqual(capsThree.totalHelpersCount, 3, 'Total helpers must dynamically equal 3');
      assert.strictEqual(capsThree.unlockedHelpersCount, 3, 'Unlocked helpers must equal 3');
      assert.strictEqual(capsThree.unlockedHelpers.length, 3);
      assert.deepStrictEqual(capsThree.unlockedHelpers.map(h => h.id), ['b1', 'b2', 'b3']);

      // Partial toggle restriction
      const customAdmin = {
        plans: {
          byok_starter: {
            name: 'Custom Starter',
            badge: 'Starter',
            monthlyPrice: 499,
            yearlyMonthlyPrice: 399,
            featureToggles: {
              allHelpersEnabled: false,
              enabledHelpers: ['b1', 'b3']
            }
          }
        }
      };

      const capsRestricted = extractPlanCapabilities(customAdmin, 'byok_starter');
      assert.strictEqual(capsRestricted.allHelpersUnlocked, false);
      assert.strictEqual(capsRestricted.unlockedHelpersCount, 2);
      assert.strictEqual(capsRestricted.lockedHelpers.length, 1);
      assert.strictEqual(capsRestricted.lockedHelpers[0].id, 'b2');
    });

    it('5.4 buildPlanCapabilityDirective generates clean prompt without hardcoded 80 references', () => {
      // When registry has 0 agents
      const capsZero = extractPlanCapabilities(null, 'byok_starter');
      const directiveZero = buildPlanCapabilityDirective(capsZero);
      assert.ok(!directiveZero.includes('80 AI'), 'Must not contain "80 AI"');
      assert.ok(!directiveZero.includes('80 Helpers'), 'Must not contain "80 Helpers"');
      assert.ok(!directiveZero.includes('#01-#80'), 'Must not contain "#01-#80"');
      assert.ok(directiveZero.includes('All bespoke AI agents and workflows are unlocked and authorized for execution.'));

      // When registry has bespoke agents
      registerAgent({ id: 'agent_x', name: 'Agent X', description: 'Specialist X' });
      const capsPopulated = extractPlanCapabilities(null, 'byok_starter');
      const directivePopulated = buildPlanCapabilityDirective(capsPopulated);
      assert.ok(directivePopulated.includes('All 1 AI Agents are unlocked and authorized for execution.'));
      assert.ok(!directivePopulated.includes('80'));
    });

    it('5.5 isRestrictedStarterIntent correctly guards workflow customization and custom agent creation', () => {
      assert.strictEqual(isRestrictedStarterIntent('customize this workflow'), true);
      assert.strictEqual(isRestrictedStarterIntent('create a custom agent'), true);
      assert.strictEqual(isRestrictedStarterIntent('build me a custom agent from scratch'), true);
      assert.strictEqual(isRestrictedStarterIntent('কাস্টম এজেন্ট তৈরি করো'), true);
      assert.strictEqual(isRestrictedStarterIntent('ওয়ার্কফ্লো এডিট'), true);
      assert.strictEqual(isRestrictedStarterIntent('write a high-converting facebook ad'), false);
    });
  });

  // =========================================================================
  // 6. LEGACY PURGE VERIFICATION ACROSS PLATFORM
  // =========================================================================
  describe('6. Legacy Agent Purge Completeness', () => {
    it('6.1 tools.ts must have empty TOOLS, ALL_TOOLS, and CATEGORIES', () => {
      assert.strictEqual(TOOLS.length, 0, 'TOOLS must be empty array');
      assert.strictEqual(ALL_TOOLS.length, 0, 'ALL_TOOLS must be empty array');
      assert.strictEqual(CATEGORIES.length, 0, 'CATEGORIES must be empty array');
    });

    it('6.2 Navbar.svelte must not link to /#helpers', () => {
      const navbarContent = fs.readFileSync(NAVBAR_PATH, 'utf-8');
      assert.ok(!navbarContent.includes('href="/#helpers"'), 'Navbar must not link to /#helpers');
    });

    it('6.3 +page.svelte must not render RobotShowcase or #helpers section', () => {
      const pageContent = fs.readFileSync(HOMEPAGE_PATH, 'utf-8');
      assert.ok(!pageContent.includes('RobotShowcase'), 'Homepage must not import or render RobotShowcase');
      assert.ok(!pageContent.includes('id="helpers"'), 'Homepage must not contain section id="helpers"');
      assert.ok(!pageContent.includes('80 AI Helpers'), 'Homepage must not mention 80 AI Helpers');
    });

    it('6.4 admin/+page.svelte must not contain "4. AI Helpers Access Matrix (80 Total)"', () => {
      const adminContent = fs.readFileSync(ADMIN_PATH, 'utf-8');
      assert.ok(!adminContent.includes('4. AI Helpers Access Matrix (80 Total)'), 'Admin matrix must be purged');
      assert.ok(!adminContent.includes('toggleHelperForPlan'), 'Unused toggle helper functions must be purged');
    });
  });

  // =========================================================================
  // 7. CRYPTOGRAPHIC & INTEGRITY INVARIANTS
  // =========================================================================
  describe('7. Cryptographic and Integrity Invariants', () => {
    it('7.1 robots.css byte-for-byte SHA256 checksum matches invariant', () => {
      const cssContent = fs.readFileSync(ROBOTS_CSS_PATH);
      const hash = crypto.createHash('sha256').update(cssContent).digest('hex').toLowerCase();
      assert.strictEqual(
        hash,
        '549729f4c18443e871d09766d36b27fbf28ed91552139ff6fcb7a77f1ec009be',
        'robots.css SHA256 checksum has changed!'
      );
    });
  });

  // =========================================================================
  // 8. ADVERSARIAL EDGE CASES & FUZZING
  // =========================================================================
  describe('8. Adversarial Edge Cases, Fuzzing & Stress Churn', () => {
    it('8.1 unregisterAgent gracefully handles edge cases (empty strings, undefined, null, unknown)', () => {
      assert.strictEqual(unregisterAgent(''), false);
      assert.strictEqual(unregisterAgent('   '), false);
      assert.strictEqual(unregisterAgent('non_existent_123'), false);
      assert.strictEqual(unregisterAgent('undefined'), false);
      assert.strictEqual(unregisterAgent('null'), false);
      assert.strictEqual(getRegisteredAgents().length, 0);
    });

    it('8.2 rapid registration and unregistration churn (100 agents, unregister 50)', () => {
      for (let i = 0; i < 100; i++) {
        registerAgent({
          id: `stress_agent_${i}`,
          name: `Stress Agent ${i}`,
          description: `Testing rapid churn ${i}`
        });
      }

      assert.strictEqual(getRegisteredAgents().length, 100);

      // Unregister even numbered agents
      for (let i = 0; i < 100; i += 2) {
        const res = unregisterAgent(`stress_agent_${i}`);
        assert.strictEqual(res, true);
      }

      const remaining = getRegisteredAgents();
      assert.strictEqual(remaining.length, 50);

      // Verify all remaining have odd IDs
      for (const a of remaining) {
        const num = parseInt(a.id.replace('stress_agent_', ''), 10);
        assert.strictEqual(num % 2, 1, 'Only odd IDs should remain');
      }
    });

    it('8.3 extractPlanCapabilities handles fuzzing of tiers and adminConfig', () => {
      // Null, empty, unknown
      const c1 = extractPlanCapabilities(null, null);
      assert.strictEqual(c1.tierId, 'byok_starter');

      const c2 = extractPlanCapabilities(undefined, '');
      assert.strictEqual(c2.tierId, 'byok_starter');

      const c3 = extractPlanCapabilities({}, 'unknown_tier_xyz');
      assert.strictEqual(c3.tierId, 'byok_starter');

      // Case insensitivity
      const c4 = extractPlanCapabilities(null, 'MANAGED');
      assert.strictEqual(c4.tierId, 'managed');
      assert.strictEqual(c4.features.zeroKeyManagedCloud, true);

      const c5 = extractPlanCapabilities(null, 'PRO');
      assert.strictEqual(c5.tierId, 'byok_pro');
      assert.strictEqual(c5.features.workflowCustomization, true);

      const c6 = extractPlanCapabilities(null, 'FREE');
      assert.strictEqual(c6.tierId, 'free');
      assert.strictEqual(c6.isFree, true);
      assert.strictEqual(c6.unlockedHelpersCount, 0);
    });

    it('8.4 buildCeoOrHelperSystemPrompt synthesizes prompt for bespoke agent with language mirroring', () => {
      const bespoke = {
        id: 'bespoke_marketing_agent',
        name: 'Omni Growth Engine',
        shortDesc: 'Omnichannel scaling agent',
        badge: 'Bespoke',
        systemPrompt: 'You are Omni Growth Engine.'
      };

      // Helper mode in Bengali
      const promptBn = buildCeoOrHelperSystemPrompt(bespoke, {
        mode: 'helper',
        userMessage: 'আমার জন্য একটা ফেসবুক এড তৈরি করো'
      });
      assert.ok(promptBn.includes('Omni Growth Engine'));
      assert.ok(promptBn.includes('MANDATORY LANGUAGE MIRRORING PROTOCOL'));
      assert.ok(promptBn.includes('BENGALI (বাংলায়)'));

      // CEO mode delegation with bespoke agent
      const promptCeo = buildCeoOrHelperSystemPrompt(bespoke, {
        mode: 'ceo',
        userMessage: 'Run omni growth engine for my store'
      });
      assert.ok(promptCeo.includes('EXPLICIT HELPER DELEGATION ACTIVE'));
      assert.ok(promptCeo.includes('Omni Growth Engine'));
    });
  });
});

