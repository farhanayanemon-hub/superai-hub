import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Import real modules using SvelteKit loader
import { TOOLS, AI_CEO_PROFILE } from '../web/src/lib/config/tools.ts';
import {
  matchHelperForMessage,
  buildCeoOrHelperSystemPrompt,
  isVisualGenerationHelper
} from '../web/src/lib/services/ceoRouter.ts';
import {
  offlineStorage,
  getAllMessages,
  saveMessage,
  clearMessages,
  saveAttachment,
  getAttachment
} from '../web/src/lib/services/offlineStorage.ts';
import {
  cloudSync,
  syncPushMessages,
  syncPullMessages
} from '../web/src/lib/services/cloudSync.ts';

describe('Empirical Challenge Suite: Milestone M2 (Dual-Tier Persistence & CEO System Prompt Routing)', () => {

  // =========================================================================
  // 1. All 75 Helpers Exhaustive Mention & Delegation Verification
  // =========================================================================
  describe('1. All 75 Helpers Mention Chip & Delegation Test', () => {
    it('TOOLS array has at least 75 helpers numbered #01 through #75', () => {
      assert.ok(TOOLS.length >= 75, `Expected >= 75 tools, got ${TOOLS.length}`);
      for (let i = 1; i <= 75; i++) {
        const expectedCode = `#${String(i).padStart(2, '0')}`;
        const tool = TOOLS.find(t => t.code === expectedCode);
        assert.ok(tool, `Helper with code ${expectedCode} must exist in TOOLS`);
        assert.ok(tool.id && tool.id.length > 0, `Helper ${expectedCode} must have non-empty id`);
        assert.ok(tool.name && tool.name.length > 0, `Helper ${expectedCode} must have non-empty name`);
        assert.ok(tool.systemPrompt && tool.systemPrompt.length > 0, `Helper ${expectedCode} must have systemPrompt`);
      }
    });

    it('Correctly resolves all 75 helpers from standard mention chips [⚡ #XX Name]', () => {
      for (let i = 1; i <= 75; i++) {
        const codeNum = String(i).padStart(2, '0');
        const expectedTool = TOOLS.find(t => t.code === `#${codeNum}`);
        const chip = `[⚡ #${codeNum} ${expectedTool.name}]`;
        const message = `${chip} Please handle this task for our company.`;

        const matched = matchHelperForMessage(message);
        assert.ok(matched, `Expected match for chip "${chip}"`);
        assert.equal(matched.id, expectedTool.id, `Mismatch for ${chip}: expected ${expectedTool.id}, got ${matched.id}`);
        assert.equal(matched.code, `#${codeNum}`, `Mismatch code for ${chip}: expected #${codeNum}, got ${matched.code}`);
      }
    });

    it('Correctly resolves all 75 helpers from direct #XX codes', () => {
      for (let i = 1; i <= 75; i++) {
        const codeNum = String(i).padStart(2, '0');
        const expectedTool = TOOLS.find(t => t.code === `#${codeNum}`);
        const message = `#${codeNum} generate executive output`;

        const matched = matchHelperForMessage(message);
        assert.ok(matched, `Expected match for message "#${codeNum}"`);
        assert.equal(matched.id, expectedTool.id);
      }
    });

    it('Correctly resolves single-digit #X codes (e.g. #1 -> #01, #7 -> #07)', () => {
      for (let i = 1; i <= 9; i++) {
        const expectedTool = TOOLS.find(t => t.code === `#0${i}`);
        const message = `#${i} quick directive`;

        const matched = matchHelperForMessage(message);
        assert.ok(matched, `Expected match for single-digit "#${i}"`);
        assert.equal(matched.id, expectedTool.id);
        assert.equal(matched.code, `#0${i}`);
      }
    });
  });

  // =========================================================================
  // 2. Mention Chip Formatting, Positioning & Variations
  // =========================================================================
  describe('2. Mention Chip Formatting & Positioning Variations', () => {
    it('Matches chip at beginning of query: [⚡ #01 Facebook Ad Copy]', () => {
      const matched = matchHelperForMessage('[⚡ #01 Facebook Ad Copy] High conversion ad for fitness shoes');
      assert.ok(matched);
      assert.equal(matched.code, '#01');
      assert.equal(matched.name, 'Facebook & Instagram Ads Generator');
    });

    it('Matches chip in the middle of query: [⚡ #07 SEO Article]', () => {
      const matched = matchHelperForMessage('Please consult [⚡ #07 Target Audience & Buyer Persona Finder] for fitness audience');
      assert.ok(matched);
      assert.equal(matched.code, '#07');
    });

    it('Matches chip at the end of query: [⚡ #75 Auto Task]', () => {
      const matched = matchHelperForMessage('Create a complete plan for next month [⚡ #75 Weekly Productivity & Habit Tracker]');
      assert.ok(matched);
      assert.equal(matched.code, '#75');
    });

    it('Matches direct #34 and #02 codes', () => {
      const matched34 = matchHelperForMessage('#34 Render an executive watch');
      assert.ok(matched34);
      assert.equal(matched34.code, '#34');

      const matched02 = matchHelperForMessage('#02 Create Google search ads');
      assert.ok(matched02);
      assert.equal(matched02.code, '#02');
    });

    it('Matches chip with extra internal whitespace', () => {
      const matched = matchHelperForMessage('[ ⚡   #34   Commercial Image Generator ]');
      assert.ok(matched);
      assert.equal(matched.code, '#34');
    });

    it('Matches chip without brackets: ⚡ #02', () => {
      const matched = matchHelperForMessage('⚡ #02 Google Search Ad Writer');
      assert.ok(matched);
      assert.equal(matched.code, '#02');
    });

    it('Matches chip without lightning emoji: [#12 Ad Creative Brief Writer]', () => {
      const matched = matchHelperForMessage('[#12 Ad Creative Brief Writer] Write designer brief');
      assert.ok(matched);
      assert.equal(matched.code, '#12');
    });

    it('Selects first helper when multiple mention chips are provided', () => {
      const message = '[⚡ #01 Facebook Ad Copy] then hand off to [⚡ #07 SEO Blog Article Writer]';
      const matched = matchHelperForMessage(message);
      assert.ok(matched);
      assert.equal(matched.code, '#01', 'First chip in message must take precedence');
    });

    it('Respects explicitHelperId when passed as exact tool id', () => {
      const matched = matchHelperForMessage('Random text without chips', 'google_search_display_ads');
      assert.ok(matched);
      assert.equal(matched.id, 'google_search_display_ads');
      assert.equal(matched.code, '#02');
    });

    it('Respects explicitHelperId when passed as code with #', () => {
      const matched = matchHelperForMessage('Random text', '#34');
      assert.ok(matched);
      assert.equal(matched.code, '#34');
    });

    it('Respects explicitHelperId when passed as mention chip string', () => {
      const matched = matchHelperForMessage('Random text', '[⚡ #05 Competitor Ad Angle Spy]');
      assert.ok(matched);
      assert.equal(matched.code, '#05');
    });

    it('explicitHelperId overrides conflicting mention chip in message text', () => {
      const matched = matchHelperForMessage('[⚡ #01 Facebook Ad Copy] text', 'google_search_display_ads');
      assert.ok(matched);
      assert.equal(matched.id, 'google_search_display_ads');
    });

    it('explicitHelperId="ceo" falls back to message chip parsing', () => {
      const matched = matchHelperForMessage('[⚡ #75 Weekly Productivity Tracker] plan sprint', 'ceo');
      assert.ok(matched);
      assert.equal(matched.code, '#75');
    });

    it('explicitHelperId="ceo" with plain message returns null (AI CEO orchestrates)', () => {
      const matched = matchHelperForMessage('Hello CEO, review our quarterly numbers', 'ceo');
      assert.equal(matched, null);
    });
  });

  // =========================================================================
  // 3. Malformed, Out-of-Bounds & Adversarial Mention Chips
  // =========================================================================
  describe('3. Malformed, Out-of-Bounds & Adversarial Mention Chips', () => {
    it('Out-of-bounds helper number #76 returns null (or fallback keyword)', () => {
      const matched = matchHelperForMessage('[⚡ #76 Non-existent Helper] run task');
      assert.equal(matched, null, 'Helper #76 must not match any tool');
    });

    it('Out-of-bounds helper number #99 returns null', () => {
      const matched = matchHelperForMessage('[⚡ #99 Quantum Computer]');
      assert.equal(matched, null);
    });

    it('Helper number #00 returns null', () => {
      const matched = matchHelperForMessage('[⚡ #00 Master Brain]');
      assert.equal(matched, null);
    });

    it('Three digit number #100 does not match false 2-digit chip', () => {
      const matched = matchHelperForMessage('Ticket #100 is resolved today');
      assert.equal(matched, null);
    });

    it('Empty brackets [] returns null or keyword fallback', () => {
      const matched = matchHelperForMessage('[] Just brackets');
      assert.equal(matched, null);
    });

    it('Malformed lightning without number [⚡] returns null', () => {
      const matched = matchHelperForMessage('[⚡] Some message');
      assert.equal(matched, null);
    });

    it('Empty hash [#] returns null', () => {
      const matched = matchHelperForMessage('[#] Some message');
      assert.equal(matched, null);
    });

    it('Negative number [⚡ #-05] does not match negative helper', () => {
      const matched = matchHelperForMessage('[⚡ #-05 Target]');
      assert.equal(matched, null);
    });

    it('Non-numeric hash [#abc] returns null', () => {
      const matched = matchHelperForMessage('[#abc Test]');
      assert.equal(matched, null);
    });

    it('Empty query returns null', () => {
      assert.equal(matchHelperForMessage(''), null);
      assert.equal(matchHelperForMessage('   '), null);
      assert.equal(matchHelperForMessage(null), null);
      assert.equal(matchHelperForMessage(undefined), null);
    });

    it('Query with only punctuation and symbols returns null', () => {
      assert.equal(matchHelperForMessage('!@#$%^&*()_+'), null);
      assert.equal(matchHelperForMessage('??? ... ,,, ///'), null);
    });
  });

  // =========================================================================
  // 4. Custom CEO System Prompt Injection & Presets
  // =========================================================================
  describe('4. Custom CEO System Prompt Injection & Presets', () => {
    const PRESETS = {
      bengali: 'আপনি EzboAgents-এর মাস্টার AI CEO। সমস্ত উত্তর শুদ্ধ, স্পষ্ট এবং পেশাদার বাংলায় প্রদান করুন। প্রতি উত্তরের কাঠামো হবে: ১. নির্বাহী সিদ্ধান্ত ২. বিস্তারিত কর্মপরিকল্পনা ৩. প্রয়োজনীয় অ্যাকশন পয়েন্ট।',
      concise: 'You are an elite business strategist. Deliver strictly high-converting, concise, bullet-pointed executive directives. Zero fluff, maximum ROI, clear action items.',
      ecommerce: 'Master E-Commerce & Performance Marketer. Focus relentlessly on ROAS, hook rate, CTR, AOV, and customer lifetime value. Every output must drive measurable revenue.'
    };

    it('Preset: Bengali Professional is correctly injected into CEO system prompt', () => {
      const prompt = buildCeoOrHelperSystemPrompt(null, { ceoCustomPrompt: PRESETS.bengali });
      assert.ok(prompt.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'), 'Must include strict priority header');
      assert.ok(prompt.includes(PRESETS.bengali), 'Must contain exact Bengali preset text');
      assert.ok(prompt.includes(AI_CEO_PROFILE.systemPrompt), 'Must preserve base AI CEO system prompt');
      assert.ok(prompt.includes('75 specialized Business & Freelancer AI Helpers'), 'Must preserve helpers catalog');
    });

    it('Preset: Concise Strategist is correctly injected into delegated helper system prompt', () => {
      const helper01 = TOOLS.find(t => t.code === '#01');
      const prompt = buildCeoOrHelperSystemPrompt(helper01, {
        ceoCustomPrompt: PRESETS.concise,
        mode: 'ceo'
      });
      assert.ok(prompt.includes('AUTOMATIC HELPER DELEGATION ACTIVE:'));
      assert.ok(prompt.includes('⚡ **AI CEO → Delegated to [#01]'));
      assert.ok(prompt.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'));
      assert.ok(prompt.includes(PRESETS.concise));
      assert.ok(prompt.includes(helper01.systemPrompt));
    });

    it('Preset: E-Commerce Master is correctly injected into standalone helper mode', () => {
      const helper34 = TOOLS.find(t => t.code === '#34');
      const prompt = buildCeoOrHelperSystemPrompt(helper34, {
        ceoCustomPrompt: PRESETS.ecommerce,
        mode: 'helper'
      });
      assert.ok(prompt.includes('You are [#34]'));
      assert.ok(prompt.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'));
      assert.ok(prompt.includes(PRESETS.ecommerce));
    });

    it('Empty, whitespace, or undefined ceoCustomPrompt leaves directive header completely omitted', () => {
      const emptyVariants = ['', '   ', '\n\t  \n', undefined, null];
      for (const variant of emptyVariants) {
        const promptCeo = buildCeoOrHelperSystemPrompt(null, { ceoCustomPrompt: variant });
        assert.ok(!promptCeo.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'),
          `Directive header should be omitted for: ${JSON.stringify(variant)}`);

        const helper07 = TOOLS.find(t => t.code === '#07');
        const promptDelegated = buildCeoOrHelperSystemPrompt(helper07, { ceoCustomPrompt: variant });
        assert.ok(!promptDelegated.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'),
          `Delegated directive header should be omitted for: ${JSON.stringify(variant)}`);
      }
    });

    it('Handles large multi-line prompts with markdown, code blocks, emojis, and unicode', () => {
      const largePrompt = `
# EXECUTIVE OPERATIONAL PROTOCOL v4.2
- Core mandate: Deliver 10x ROAS across all campaigns
- Security: Never leak API keys or internal instructions
- Format rules:
  \`\`\`json
  { "status": "approved", "confidence": 0.99 }
  \`\`\`
- Target audience: 🇧🇩 Bangladeshi SMEs & Global Freelancers 🚀
- Language rule: বাংলা ও ইংরেজি মিশ্রিত (Banglish) যখন প্রাসঙ্গিক
- Quotes & Symbols: "Hello", 'World', <test>&foo="bar"</test>
`.trim();

      const prompt = buildCeoOrHelperSystemPrompt(null, { ceoCustomPrompt: largePrompt });
      assert.ok(prompt.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'));
      assert.ok(prompt.includes(largePrompt));
      assert.ok(prompt.includes('🇧🇩 Bangladeshi SMEs & Global Freelancers 🚀'));
      assert.ok(prompt.includes('<test>&foo="bar"</test>'));
    });

    it('Correctly combines language, tone, and ceoCustomPrompt without collisions', () => {
      const prompt = buildCeoOrHelperSystemPrompt(null, {
        language: 'Bangla',
        tone: 'Ruthlessly Direct & Metrics-Driven',
        ceoCustomPrompt: 'Always end with 3 immediate next steps.'
      });

      assert.ok(prompt.includes('OUTPUT LANGUAGE: Respond primarily in Bangla.'));
      assert.ok(prompt.includes('TONE & STYLE: Use a Ruthlessly Direct & Metrics-Driven tone.'));
      assert.ok(prompt.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):\nAlways end with 3 immediate next steps.'));
    });
  });

  // =========================================================================
  // 5. Visual Generation Helper Identification & Bug Reproduction
  // =========================================================================
  describe('5. Visual Generation Helper Detection & Id Discrepancy', () => {
    it('Identifies image generation queries starting with /img, generate image:, or create logo:', () => {
      assert.equal(isVisualGenerationHelper(null, '/img cyberpunk street'), true);
      assert.equal(isVisualGenerationHelper(null, 'generate image: a red car'), true);
      assert.equal(isVisualGenerationHelper(null, 'create logo: TechCorp'), true);
      assert.equal(isVisualGenerationHelper(null, 'Write a blog post about cars'), false);
    });

    it('EMPERICAL BUG DEMONSTRATION: isVisualGenerationHelper fails for #34 and #35 due to id mismatch', () => {
      const tool34 = TOOLS.find(t => t.code === '#34');
      const tool35 = TOOLS.find(t => t.code === '#35');

      assert.ok(tool34, 'Tool #34 must exist');
      assert.ok(tool35, 'Tool #35 must exist');

      // The actual IDs in tools.ts
      assert.equal(tool34.id, 'ai_commercial_image_generator');
      assert.equal(tool35.id, 'ai_business_logo_generator');

      // ceoRouter.ts checks for: ['ai_commercial_image_gen', 'ai_business_logo_gen'].includes(helper.id)
      // Because of this naming mismatch, passing tool34 or tool35 with a plain prompt returns FALSE
      const is34Visual = isVisualGenerationHelper(tool34, 'render a luxury watch');
      const is35Visual = isVisualGenerationHelper(tool35, 'design an emblem logo');

      // Demonstrating the bug empirically:
      // It returns false when it SHOULD return true!
      assert.equal(is34Visual, false, 'BUG CONFIRMED: tool34 id mismatch causes isVisualGenerationHelper to return false');
      assert.equal(is35Visual, false, 'BUG CONFIRMED: tool35 id mismatch causes isVisualGenerationHelper to return false');
    });
  });

  // =========================================================================
  // 6. Empirical Demonstration of KEYWORD_RULES ID Discrepancies
  // =========================================================================
  describe('6. Empirical Demonstration of KEYWORD_RULES ID Discrepancies', () => {
    it('EMPERICAL BUG DEMONSTRATION: Keyword-only match fails for 44 tools due to helperId mismatch in KEYWORD_RULES', () => {
      // For instance, typing "facebook ad" matches rule with helperId: 'fb_ig_ad_generator'
      // But TOOLS has id: 'fb_insta_ads'. So matchHelperForMessage returns null!
      const result = matchHelperForMessage('I need a high converting facebook ad for new sunglasses');
      assert.equal(result, null, 'BUG CONFIRMED: Keyword routing for "facebook ad" fails due to helperId mismatch');

      // However, slash command mention chip bypasses this and succeeds:
      const chipResult = matchHelperForMessage('[⚡ #01 Facebook Ad Copy] I need a high converting facebook ad');
      assert.ok(chipResult);
      assert.equal(chipResult.code, '#01');
    });
  });

  // =========================================================================
  // 7. Dual-Tier Persistence SSR Safety & Contract Compliance
  // =========================================================================
  describe('7. Dual-Tier Persistence SSR Safety & API Contracts', () => {
    it('offlineStorage methods gracefully no-op during SSR without errors', async () => {
      assert.equal(typeof window, 'undefined');

      const messages = await getAllMessages();
      assert.deepEqual(messages, []);

      await assert.doesNotReject(async () => {
        await saveMessage({ id: 'test-1', text: 'hello', sender: 'user', timestamp: Date.now() });
      });

      await assert.doesNotReject(async () => {
        await clearMessages();
      });

      await assert.doesNotReject(async () => {
        await saveAttachment('att-1', 'data:image/png;base64,...', { name: 'test.png' });
      });

      const att = await getAttachment('att-1');
      assert.equal(att, null);
    });

    it('cloudSync methods gracefully no-op when unconfigured without throwing', async () => {
      await assert.doesNotReject(async () => {
        await syncPushMessages('user-1', [
          { id: 'msg-1', role: 'user', content: 'cloud test', timestamp: new Date().toISOString() }
        ]);
      });

      const pullRes = await syncPullMessages('user-1');
      assert.deepEqual(pullRes, []);
    });
  });

  // =========================================================================
  // 8. Chat Server Route (+server.ts) Contract Verification
  // =========================================================================
  describe('8. Chat Server Route (+server.ts) Contract Verification', () => {
    const chatServerFile = path.join(ROOT_DIR, 'web/src/routes/api/chat/+server.ts');

    it('+server.ts imports matchHelperForMessage and buildCeoOrHelperSystemPrompt', () => {
      const code = fs.readFileSync(chatServerFile, 'utf8');
      assert.ok(code.includes('matchHelperForMessage,'), 'Must import matchHelperForMessage');
      assert.ok(code.includes('buildCeoOrHelperSystemPrompt,'), 'Must import buildCeoOrHelperSystemPrompt');
    });

    it('+server.ts parses ceoCustomPrompt from request and injects it', () => {
      const code = fs.readFileSync(chatServerFile, 'utf8');
      assert.ok(code.includes('ceoCustomPrompt?: string;'), 'ChatRequest must include ceoCustomPrompt');
      assert.ok(code.includes('ceoCustomPrompt,'), 'POST handler must destructure ceoCustomPrompt');
      assert.ok(code.includes('buildCeoOrHelperSystemPrompt(matchedHelper,'), 'Must call prompt builder with matchedHelper');
    });

    it('+server.ts delegates helper metadata when matched', () => {
      const code = fs.readFileSync(chatServerFile, 'utf8');
      assert.ok(code.includes('delegatedHelperMeta'), 'Must define delegatedHelperMeta');
      assert.ok(code.includes('delegatedHelper: delegatedHelperMeta'), 'Must include delegatedHelper in JSON response');
    });
  });

  // =========================================================================
  // 9. User Store Wiring Verification
  // =========================================================================
  describe('9. User Store Wiring Verification', () => {
    const userStoreFile = path.join(ROOT_DIR, 'web/src/lib/stores/userStore.ts');

    it('userStore.ts exports ceoCustomPrompt writable store and persistence helpers', () => {
      const code = fs.readFileSync(userStoreFile, 'utf8');
      assert.ok(code.includes('export const ceoCustomPrompt'), 'Must export ceoCustomPrompt writable');
      assert.ok(code.includes('ezbo_ceo_custom_prompt'), 'Must use localStorage key ezbo_ceo_custom_prompt');
      assert.ok(code.includes('export function setCeoCustomPrompt'), 'Must export setCeoCustomPrompt function');
      assert.ok(code.includes('saveCeoCustomPrompt'), 'Must export saveCeoCustomPrompt alias or function');
    });

    it('userStore.ts integrates dual-tier persistence (offlineStorage + localStorage)', () => {
      const code = fs.readFileSync(userStoreFile, 'utf8');
      assert.ok(code.includes('offlineStorage'), 'Must reference offlineStorage');
      assert.ok(code.includes('getAllMessages()'), 'Must hydrate from offlineStorage.getAllMessages()');
      assert.ok(code.includes('saveMessage('), 'Must persist to offlineStorage.saveMessage');
      assert.ok(code.includes('clearMessages('), 'Must clear offlineStorage.clearMessages');
    });
  });
});
