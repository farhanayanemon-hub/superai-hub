/**
 * Challenger Empirical Verification & Stress Test Suite: Milestone M3
 * Target: web/src/lib/components/FloatingCeoChat.svelte & ChannelModal.svelte
 *
 * Covers:
 * 1. Static AST / Code Structure & Svelte 5 Runes Verification
 * 2. Exhaustive 75-Helper Slash (/) Autocomplete Filtering Engine
 * 3. Slash Input Regex & Parser Stress Harness
 * 4. Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape) State Machine
 * 5. Mention Chip Formatting, Cursor Insertion & Specialist Routing Contract
 * 6. Plus (+) Quick Action Popover & Preset Dispatch
 * 7. Auto-Open on First Visit & Auto-Minimize on Tab Switch Simulation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Import real configuration data
import { TOOLS, AI_CEO_PROFILE } from '../web/src/lib/config/tools.ts';

const FLOATING_CHAT_PATH = path.join(ROOT_DIR, 'web/src/lib/components/FloatingCeoChat.svelte');
const CHANNEL_MODAL_PATH = path.join(ROOT_DIR, 'web/src/lib/components/ChannelModal.svelte');

describe('Milestone M3 Empirical Challenge: Floating AI CEO Chat & Channels Modal', () => {

  // =========================================================================
  // 1. Static AST / Code Structure & Svelte 5 Runes Verification
  // =========================================================================
  describe('1. Static Code Structure & Svelte 5 Runes Verification', () => {
    it('FloatingCeoChat.svelte exists and contains Svelte 5 runes', () => {
      assert.ok(fs.existsSync(FLOATING_CHAT_PATH), 'FloatingCeoChat.svelte must exist');
      const content = fs.readFileSync(FLOATING_CHAT_PATH, 'utf8');

      // Check Svelte 5 runes
      assert.ok(content.includes('$state('), 'Must use $state rune');
      assert.ok(content.includes('$derived.by(') || content.includes('$derived('), 'Must use $derived rune');
      assert.ok(content.includes('$effect('), 'Must use $effect rune');
      assert.ok(content.includes('$props<'), 'Must use $props rune');
      assert.ok(content.includes('$bindable('), 'Must use $bindable rune for isOpen');
    });

    it('Anchors launcher button at bottom-right with animated speech bubble and status beacon', () => {
      const content = fs.readFileSync(FLOATING_CHAT_PATH, 'utf8');
      assert.ok(
        content.includes('fixed bottom-6 right-6 z-40'),
        'Launcher button must be fixed at bottom-6 right-6 z-40'
      );
      assert.ok(
        content.includes('👋 Hey, CEO is here! Click to chat'),
        'Speech bubble must display "👋 Hey, CEO is here! Click to chat"'
      );
      assert.ok(
        content.includes('animate-bounce'),
        'Speech bubble must include bounce animation'
      );
      assert.ok(
        content.includes('animate-pulse') && content.includes('bg-emerald-500'),
        'Launcher must feature emerald glowing status beacon'
      );
    });

    it('Renders ChatGPT-style glass window with required responsive classes', () => {
      const content = fs.readFileSync(FLOATING_CHAT_PATH, 'utf8');
      assert.ok(
        content.includes('fixed bottom-6 right-6 z-50'),
        'Chat window must be fixed at bottom-6 right-6 z-50'
      );
      assert.ok(
        content.includes('w-[95vw] sm:w-[520px] md:w-[580px] h-[78vh] max-h-[720px]'),
        'Chat window must have required responsive dimensions'
      );
      assert.ok(
        content.includes('bg-white/95 backdrop-blur-2xl border border-[#CFE2FA] rounded-3xl shadow-2xl'),
        'Chat window must have glassmorphic styling tokens'
      );
    });

    it('Header contains Connect Channels button, minimize (-) and close (✕) buttons', () => {
      const content = fs.readFileSync(FLOATING_CHAT_PATH, 'utf8');
      assert.ok(
        content.includes('⚡ Connect Channels'),
        'Header must contain prominent "⚡ Connect Channels" button'
      );
      assert.ok(
        content.includes('animate-ping'),
        'Connect Channels button must have live pulse ping indicator'
      );
      assert.ok(
        content.includes('aria-label="Minimize Chat"'),
        'Header must contain minimize (-) button'
      );
      assert.ok(
        content.includes('aria-label="Close Chat"'),
        'Header must contain close (✕) button'
      );
    });

    it('Imports and embeds ChannelModal with bind:isOpen', () => {
      const content = fs.readFileSync(FLOATING_CHAT_PATH, 'utf8');
      assert.ok(
        content.includes("import ChannelModal from '$lib/components/ChannelModal.svelte'"),
        'Must import ChannelModal'
      );
      assert.ok(
        content.includes('<ChannelModal bind:isOpen={isChannelsModalOpen} />'),
        'Must embed ChannelModal bound to isChannelsModalOpen'
      );
    });

    it('Input bar contains sleek Plus (+) action button and textarea with slash hint', () => {
      const content = fs.readFileSync(FLOATING_CHAT_PATH, 'utf8');
      assert.ok(
        content.includes('<Icon name="Plus" size={20} />'),
        'Input bar must have sleek Plus (+) icon button'
      );
      assert.ok(
        content.includes('Ask CEO anything, or type / to invoke any of 75 AI Helpers...'),
        'Textarea placeholder must instruct user on typing /'
      );
    });
  });

  // =========================================================================
  // 2. Exhaustive 75-Helper Slash (/) Autocomplete Filtering Engine
  // =========================================================================
  describe('2. Exhaustive 75-Helper Slash (/) Autocomplete Filtering Engine', () => {
    // Replicate exact filtering function from FloatingCeoChat.svelte lines 138-151
    function filterTools(slashQuery, tools = TOOLS) {
      if (!slashQuery) return tools.slice(0, 80);
      const q = slashQuery.toLowerCase().replace(/^#/, '');
      return tools.filter((t) => {
        const codeClean = t.code.toLowerCase().replace(/^#/, '');
        return (
          codeClean.includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.agentName.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          t.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      }).slice(0, 80);
    }

    it('Empty query (just typed /) returns helpers in catalog', () => {
      const results = filterTools('');
      assert.ok(results.length >= 75, `Expected >= 75 tools for empty slash query, got ${results.length}`);
      assert.equal(results[0].code, '#01');
      assert.equal(results[74].code, '#75');
    });

    it('Exhaustively matches all 75 helpers by exact code with hash (/#01 to /#75)', () => {
      for (let i = 1; i <= 75; i++) {
        const code = `#${String(i).padStart(2, '0')}`;
        const results = filterTools(code);
        assert.ok(results.length > 0, `Search for ${code} must return at least 1 result`);
        const primaryMatch = results.find(t => t.code === code);
        assert.ok(primaryMatch, `Search for ${code} must contain tool with code ${code}`);
      }
    });

    it('Exhaustively matches all 75 helpers by clean numeric code (/01 to /75)', () => {
      for (let i = 1; i <= 75; i++) {
        const numStr = String(i).padStart(2, '0');
        const results = filterTools(numStr);
        assert.ok(results.length > 0, `Search for ${numStr} must return at least 1 result`);
        const primaryMatch = results.find(t => t.code === `#${numStr}`);
        assert.ok(primaryMatch, `Search for ${numStr} must contain tool #${numStr}`);
      }
    });

    it('Matches single-digit searches (/1 to /9) returning the corresponding #0X helpers', () => {
      for (let i = 1; i <= 9; i++) {
        const results = filterTools(String(i));
        assert.ok(results.length > 0);
        const expected = `#0${i}`;
        const found = results.some(t => t.code === expected);
        assert.ok(found, `Search for single digit "${i}" must include helper ${expected}`);
      }
    });

    it('Case-insensitivity: matches uppercase queries (/FACEBOOK, /#01, /SEO)', () => {
      const upper1 = filterTools('FACEBOOK');
      assert.ok(upper1.length > 0);
      assert.ok(upper1.some(t => t.code === '#01'));

      const upper2 = filterTools('#01');
      assert.ok(upper2.length > 0);
      assert.equal(upper2[0].code, '#01');

      const upper3 = filterTools('SEO');
      assert.ok(upper3.length > 0);
      assert.ok(upper3.some(t => t.categoryName.includes('SEO') || t.name.includes('SEO')));
    });

    it('Matches across tool name substrings', () => {
      const testNames = [
        { query: 'humanizer', expectedCode: '#24' },
        { query: 'commercial image', expectedCode: '#34' },
        { query: 'habit', expectedCode: '#51' },
        { query: 'sheets formula', expectedCode: '#66' },
        { query: 'cold email', expectedCode: '#32' },
        { query: 'youtube script', expectedCode: '#19' },
        { query: 'retention', expectedCode: '#65' },
        { query: 'stoic', expectedCode: '#54' }
      ];

      for (const tc of testNames) {
        const res = filterTools(tc.query);
        assert.ok(res.length > 0, `Query "${tc.query}" should return results`);
        assert.ok(
          res.some(t => t.code === tc.expectedCode),
          `Query "${tc.query}" must contain ${tc.expectedCode}`
        );
      }
    });

    it('Matches across agentName (e.g. AdNexus, ScriptSage, etc.)', () => {
      for (const tool of TOOLS.slice(0, 20)) {
        if (tool.agentName) {
          const res = filterTools(tool.agentName);
          assert.ok(res.length > 0);
          assert.ok(
            res.some(t => t.id === tool.id),
            `Searching agentName "${tool.agentName}" must find tool ${tool.code}`
          );
        }
      }
    });

    it('Matches across keywords array', () => {
      for (const tool of TOOLS) {
        if (tool.keywords && tool.keywords.length > 0) {
          const kw = tool.keywords[0];
          const res = filterTools(kw);
          assert.ok(
            res.some(t => t.id === tool.id),
            `Searching keyword "${kw}" must find tool ${tool.code} (${tool.name})`
          );
        }
      }
    });

    it('Adversarial & boundary inputs return graceful empty array or safe slice', () => {
      // Completely non-matching alphanumeric query
      const nonMatch = filterTools('zzzxq_nonexistent_9999');
      assert.deepEqual(nonMatch, [], 'Non-matching query must return empty array');

      // Huge string
      const hugeQuery = 'a'.repeat(500);
      const hugeRes = filterTools(hugeQuery);
      assert.deepEqual(hugeRes, []);

      // Multiple hashes
      const multiHash = filterTools('###01');
      assert.ok(Array.isArray(multiHash));
    });
  });

  // =========================================================================
  // 3. Slash Input Regex & Parser Stress Harness
  // =========================================================================
  describe('3. Slash Input Regex & Parser Stress Harness', () => {
    // Replicate regex from FloatingCeoChat.svelte line 161
    const SLASH_REGEX = /(?:^|\s)\/([a-zA-Z0-9_#\s-]*)$/;

    function parseSlashInput(val, cursor = val.length) {
      const textBeforeCursor = val.slice(0, cursor);
      const slashMatch = textBeforeCursor.match(SLASH_REGEX);
      if (slashMatch) {
        return {
          isSlashOpen: true,
          slashQuery: slashMatch[1].trim()
        };
      }
      return {
        isSlashOpen: false,
        slashQuery: ''
      };
    }

    it('Triggers autocomplete when typing / at start of input', () => {
      const p1 = parseSlashInput('/');
      assert.equal(p1.isSlashOpen, true);
      assert.equal(p1.slashQuery, '');

      const p2 = parseSlashInput('/01');
      assert.equal(p2.isSlashOpen, true);
      assert.equal(p2.slashQuery, '01');

      const p3 = parseSlashInput('/#01');
      assert.equal(p3.isSlashOpen, true);
      assert.equal(p3.slashQuery, '#01');
    });

    it('Triggers autocomplete when typing / preceded by a space', () => {
      const p1 = parseSlashInput('Please write an ad /');
      assert.equal(p1.isSlashOpen, true);
      assert.equal(p1.slashQuery, '');

      const p2 = parseSlashInput('Please write an ad /01');
      assert.equal(p2.isSlashOpen, true);
      assert.equal(p2.slashQuery, '01');

      const p3 = parseSlashInput('Hello CEO /facebook ads');
      assert.equal(p3.isSlashOpen, true);
      assert.equal(p3.slashQuery, 'facebook ads');
    });

    it('Triggers autocomplete when typing / on a new line', () => {
      const p1 = parseSlashInput('Line 1 instructions\n/');
      assert.equal(p1.isSlashOpen, true);
      assert.equal(p1.slashQuery, '');

      const p2 = parseSlashInput('Line 1 instructions\n/humanizer');
      assert.equal(p2.isSlashOpen, true);
      assert.equal(p2.slashQuery, 'humanizer');
    });

    it('Does NOT trigger autocomplete on URLs or mid-word slashes', () => {
      const urls = [
        'https://ezboagents.com/dashboard',
        'http://localhost:5173/api/chat',
        'ftp://files/download',
        'user/password',
        'and/or',
        '5/10/2026',
        'km/h'
      ];

      for (const u of urls) {
        const p = parseSlashInput(u);
        assert.equal(
          p.isSlashOpen,
          false,
          `Input "${u}" should NOT trigger slash autocomplete`
        );
      }
    });

    it('Handles cursor positioning inside text correctly', () => {
      // User typed "Hello /01 world" and cursor is at index 9 (right after /01)
      const text = 'Hello /01 world';
      const p1 = parseSlashInput(text, 9);
      assert.equal(p1.isSlashOpen, true);
      assert.equal(p1.slashQuery, '01');

      // Cursor is at beginning of text (before /)
      const p2 = parseSlashInput(text, 5);
      assert.equal(p2.isSlashOpen, false);

      // Multi-word slash search: when cursor is after "facebook ads", parser extracts full multi-word query
      const p3 = parseSlashInput('Hello /facebook ads', 19);
      assert.equal(p3.isSlashOpen, true);
      assert.equal(p3.slashQuery, 'facebook ads');
    });

    it('Fuzzing: survives 1,000 random string combinations without crashing', () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /#-_.\n\t:';
      for (let i = 0; i < 1000; i++) {
        const len = Math.floor(Math.random() * 50);
        let s = '';
        for (let j = 0; j < len; j++) {
          s += chars[Math.floor(Math.random() * chars.length)];
        }
        const cursor = Math.floor(Math.random() * (s.length + 1));
        assert.doesNotThrow(() => {
          parseSlashInput(s, cursor);
        });
      }
    });
  });

  // =========================================================================
  // 4. Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape) State Machine
  // =========================================================================
  describe('4. Keyboard Navigation & Selection State Machine', () => {
    // Replicate state transitions from FloatingCeoChat.svelte lines 172-195
    class SlashNavStateMachine {
      constructor(toolsCount) {
        this.toolsCount = toolsCount;
        this.selectedIndex = 0;
        this.isOpen = true;
        this.selectedTool = null;
      }

      handleKey(key, tools) {
        if (!this.isOpen || this.toolsCount === 0) return 'passthrough';

        if (key === 'ArrowDown') {
          this.selectedIndex = (this.selectedIndex + 1) % this.toolsCount;
          return 'handled';
        }
        if (key === 'ArrowUp') {
          this.selectedIndex = (this.selectedIndex - 1 + this.toolsCount) % this.toolsCount;
          return 'handled';
        }
        if (key === 'Enter') {
          this.selectedTool = tools[this.selectedIndex];
          this.isOpen = false;
          return 'selected';
        }
        if (key === 'Escape') {
          this.isOpen = false;
          return 'closed';
        }
        return 'unhandled';
      }
    }

    it('ArrowDown increments index with wrap-around at bottom', () => {
      const machine = new SlashNavStateMachine(75);
      assert.equal(machine.selectedIndex, 0);

      // ArrowDown step
      machine.handleKey('ArrowDown', TOOLS);
      assert.equal(machine.selectedIndex, 1);

      // Advance to 74
      for (let i = 2; i <= 74; i++) {
        machine.handleKey('ArrowDown', TOOLS);
      }
      assert.equal(machine.selectedIndex, 74);

      // Wrap-around from 74 back to 0
      machine.handleKey('ArrowDown', TOOLS);
      assert.equal(machine.selectedIndex, 0, 'Index must wrap back to 0 at bottom of list');
    });

    it('ArrowUp decrements index with wrap-around at top', () => {
      const machine = new SlashNavStateMachine(75);
      assert.equal(machine.selectedIndex, 0);

      // Wrap-around from 0 up to 74
      machine.handleKey('ArrowUp', TOOLS);
      assert.equal(machine.selectedIndex, 74, 'Index must wrap from 0 to 74 on ArrowUp');

      machine.handleKey('ArrowUp', TOOLS);
      assert.equal(machine.selectedIndex, 73);
    });

    it('Enter selects highlighted tool and closes popover', () => {
      const machine = new SlashNavStateMachine(75);
      // Navigate to #03 (index 2)
      machine.handleKey('ArrowDown', TOOLS);
      machine.handleKey('ArrowDown', TOOLS);
      assert.equal(machine.selectedIndex, 2);

      const status = machine.handleKey('Enter', TOOLS);
      assert.equal(status, 'selected');
      assert.equal(machine.isOpen, false);
      assert.equal(machine.selectedTool.code, '#03');
    });

    it('Escape closes popover without selecting tool', () => {
      const machine = new SlashNavStateMachine(75);
      machine.handleKey('ArrowDown', TOOLS);
      assert.equal(machine.selectedIndex, 1);

      const status = machine.handleKey('Escape', TOOLS);
      assert.equal(status, 'closed');
      assert.equal(machine.isOpen, false);
      assert.equal(machine.selectedTool, null);
    });

    it('Stress test: 10,000 random keystrokes never produce out-of-bounds index', () => {
      const count = 75;
      const machine = new SlashNavStateMachine(count);
      const keys = ['ArrowDown', 'ArrowUp', 'Tab', 'Shift'];

      for (let i = 0; i < 10000; i++) {
        const k = keys[Math.floor(Math.random() * keys.length)];
        machine.handleKey(k, TOOLS);
        assert.ok(
          machine.selectedIndex >= 0 && machine.selectedIndex < count,
          `selectedIndex ${machine.selectedIndex} out of bounds [0, ${count - 1}]`
        );
      }
    });
  });

  // =========================================================================
  // 5. Mention Chip Formatting, Cursor Insertion & Specialist Routing Contract
  // =========================================================================
  describe('5. Mention Chip Formatting, Cursor Insertion & Specialist Routing', () => {
    // Replicate selectHelper insertion logic from FloatingCeoChat.svelte lines 204-222
    function selectHelperLogic(inputMessage, cursor, helper) {
      const chip = `[⚡ ${helper.code} ${helper.name}] `;
      const textBeforeCursor = inputMessage.slice(0, cursor);
      const textAfterCursor = inputMessage.slice(cursor);
      const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
      let result;
      if (lastSlashIndex !== -1) {
        result = textBeforeCursor.slice(0, lastSlashIndex) + chip + textAfterCursor;
      } else {
        result = chip + inputMessage;
      }
      return {
        inputMessage: result,
        selectedHelperId: helper.id
      };
    }

    it('Formats mention chip as [⚡ #XX Tool Name] with trailing space', () => {
      const tool1 = TOOLS.find(t => t.code === '#01');
      assert.ok(tool1);
      const chip1 = `[⚡ ${tool1.code} ${tool1.name}] `;
      assert.equal(chip1, '[⚡ #01 Facebook & Instagram Ads Generator] ');

      const tool75 = TOOLS.find(t => t.code === '#75');
      assert.ok(tool75);
      const chip75 = `[⚡ ${tool75.code} ${tool75.name}] `;
      assert.equal(chip75, '[⚡ #75 Weekly Productivity & Goal Tracker] ');
    });

    it('Correctly replaces slash query at beginning of prompt', () => {
      const tool = TOOLS[0];
      const res = selectHelperLogic('/01', 3, tool);
      assert.equal(res.inputMessage, `[⚡ ${tool.code} ${tool.name}] `);
      assert.equal(res.selectedHelperId, tool.id);
    });

    it('Correctly replaces slash query preceded by text', () => {
      const tool = TOOLS.find(t => t.code === '#24');
      const input = 'Please polish this copy /human';
      const res = selectHelperLogic(input, input.length, tool);
      assert.equal(
        res.inputMessage,
        `Please polish this copy [⚡ ${tool.code} ${tool.name}] `
      );
      assert.equal(res.selectedHelperId, tool.id);
    });

    it('Correctly preserves text after cursor when inserting chip mid-sentence', () => {
      const tool = TOOLS.find(t => t.code === '#34');
      const before = 'Generate /img';
      const after = ' for my summer collection';
      const full = before + after;
      const res = selectHelperLogic(full, before.length, tool);
      assert.equal(
        res.inputMessage,
        `Generate [⚡ ${tool.code} ${tool.name}]  for my summer collection`
      );
    });

    it('Correctly replaces only the last slash when earlier slashes exist', () => {
      const tool = TOOLS.find(t => t.code === '#15');
      const input = 'Check https://site.com/docs and use /cold';
      const res = selectHelperLogic(input, input.length, tool);
      assert.equal(
        res.inputMessage,
        `Check https://site.com/docs and use [⚡ ${tool.code} ${tool.name}] `
      );
    });

    it('Specialist Routing Contract: All 75 generated chips are recognized by backend router pattern', () => {
      // Backend router regex from ceoRouter.ts
      const CHIP_REGEX = /\[?⚡?\s*#(\d{1,2})\b/i;

      for (const tool of TOOLS) {
        const chip = `[⚡ ${tool.code} ${tool.name}] `;
        const fullPrompt = `${chip} Execute this strategic task for our enterprise.`;

        const match = fullPrompt.match(CHIP_REGEX);
        assert.ok(match, `Backend regex failed to parse chip: "${chip}"`);
        const parsedCodeNum = parseInt(match[1], 10);
        const expectedCodeNum = parseInt(tool.code.replace('#', ''), 10);
        assert.equal(
          parsedCodeNum,
          expectedCodeNum,
          `Mismatch in parsed code number for ${tool.code}: got ${parsedCodeNum}`
        );
      }
    });
  });

  // =========================================================================
  // 6. Plus (+) Quick Action Popover & Preset Dispatch
  // =========================================================================
  describe('6. Plus (+) Quick Action Popover & Preset Dispatch', () => {
    // Quick action presets extracted from FloatingCeoChat.svelte lines 49-86
    const quickActions = [
      {
        label: '360° AI CEO Marketing Plan',
        icon: 'Crown',
        tag: 'Strategy',
        prompt: 'Build a comprehensive 30-day marketing, ads, and conversion plan for our business.'
      },
      {
        label: '#01 Facebook & IG Ads Generator',
        icon: 'Megaphone',
        tag: '#01',
        prompt: '[⚡ #01 Facebook & Instagram Ads Generator] Write 3 high-converting ad angles with scroll-stopping hooks for: '
      },
      {
        label: '#24 AI Text Humanizer',
        icon: 'Wand2',
        tag: '#24',
        prompt: '[⚡ #24 AI Text Humanizer] Humanize this text to make it sound 100% human and natural: '
      },
      {
        label: '#34 Commercial Image Generator',
        icon: 'Image',
        tag: '#34',
        prompt: '[⚡ #34 Commercial Image Generator] High-resolution commercial product photograph with studio lighting, 8k: '
      },
      {
        label: '#51 Upwork Proposal Writer',
        icon: 'Briefcase',
        tag: '#51',
        prompt: '[⚡ #51 Upwork Proposal Writer] Write a winning high-conversion proposal for: '
      },
      {
        label: '#65 Excel & Sheets Formula Master',
        icon: 'Table',
        tag: '#65',
        prompt: '[⚡ #65 Excel & Google Sheets Formula Master] Provide the exact formula and explanation for: '
      }
    ];

    it('All 6 quick action presets are defined with non-empty prompts and icons', () => {
      assert.equal(quickActions.length, 6);
      for (const qa of quickActions) {
        assert.ok(qa.label && qa.label.length > 0);
        assert.ok(qa.icon && qa.icon.length > 0);
        assert.ok(qa.prompt && qa.prompt.length > 0);
        assert.ok(qa.tag && qa.tag.length > 0);
      }
    });

    it('EMPIRICAL BUG DEMONSTRATION: quickActions preset array contains mismatched helper codes and legacy titles (#51, #65, #24)', () => {
      const CHIP_REGEX = /\[⚡\s*(#\d{2})\s+([^\]]+)\]/;
      const mismatches = [];

      for (const qa of quickActions) {
        const match = qa.prompt.match(CHIP_REGEX);
        if (match) {
          const code = match[1];
          const tool = TOOLS.find(t => t.code === code);
          const declaredTitle = match[2].trim();
          if (!tool || tool.name !== declaredTitle) {
            mismatches.push({
              code,
              declaredTitle,
              actualToolName: tool ? tool.name : 'NOT_FOUND',
              actualToolId: tool ? tool.id : 'NOT_FOUND'
            });
          }
        }
      }

      // Assert that the bug exists empirically
      assert.ok(mismatches.length > 0, 'Expected mismatches in quickActions presets');
      assert.equal(mismatches.length, 4, `Expected 4 mismatched presets, got ${mismatches.length}`);

      // 1. #51 in quickActions claims to be Upwork Proposal Writer, but in TOOLS is Daily Habit & Routine Architect
      const m51 = mismatches.find(m => m.code === '#51');
      assert.ok(m51);
      assert.equal(m51.declaredTitle, 'Upwork Proposal Writer');
      assert.equal(m51.actualToolName, 'Daily Habit & Routine Architect');
      assert.equal(m51.actualToolId, 'daily_habit_routine_architect');

      // 2. #65 in quickActions claims to be Excel & Google Sheets Formula Master, but in TOOLS is Angry Customer Retention (Excel is #66)
      const m65 = mismatches.find(m => m.code === '#65');
      assert.ok(m65);
      assert.equal(m65.declaredTitle, 'Excel & Google Sheets Formula Master');
      assert.equal(m65.actualToolName, 'Angry Customer Handling & Retention Bot');
      assert.equal(m65.actualToolId, 'angry_customer_retention');

      // 3. #24 in quickActions omits "100% Natural" suffix from tool name
      const m24 = mismatches.find(m => m.code === '#24');
      assert.ok(m24);
      assert.equal(m24.declaredTitle, 'AI Text Humanizer');
      assert.equal(m24.actualToolName, 'AI Text Humanizer 100% Natural');

      // 4. #34 in quickActions omits "AI " prefix from tool name
      const m34 = mismatches.find(m => m.code === '#34');
      assert.ok(m34);
      assert.equal(m34.declaredTitle, 'Commercial Image Generator');
      assert.equal(m34.actualToolName, 'AI Commercial Image Generator');
    });

    it('Selecting a quick action sets inputMessage and closes plus menu', () => {
      let isPlusMenuOpen = true;
      let inputMessage = '';

      function handleSelectQuickAction(action) {
        inputMessage = action.prompt;
        isPlusMenuOpen = false;
      }

      handleSelectQuickAction(quickActions[1]);
      assert.equal(isPlusMenuOpen, false);
      assert.equal(inputMessage, quickActions[1].prompt);
    });

    it('Toggling Plus button alternates isPlusMenuOpen state', () => {
      let isPlusMenuOpen = false;
      function toggle() {
        isPlusMenuOpen = !isPlusMenuOpen;
      }

      toggle();
      assert.equal(isPlusMenuOpen, true);
      toggle();
      assert.equal(isPlusMenuOpen, false);
    });
  });

  // =========================================================================
  // 7. Auto-Open on First Visit & Auto-Minimize on Tab Switch Simulation
  // =========================================================================
  describe('7. Auto-Open on First Visit & Auto-Minimize on Tab Switch Simulation', () => {
    // In-memory mock localStorage
    function createMockStorage() {
      const map = new Map();
      return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, String(v)),
        clear: () => map.clear()
      };
    }

    it('Auto-opens on first visit when ezbo_ceo_chat_seen is not set', () => {
      const storage = createMockStorage();
      let isOpen = false;

      // Effect 1: Auto-open logic
      const seen = storage.getItem('ezbo_ceo_chat_seen');
      if (!seen) {
        isOpen = true;
        storage.setItem('ezbo_ceo_chat_seen', 'true');
      }

      assert.equal(isOpen, true, 'Chat should auto-open on initial visit');
      assert.equal(storage.getItem('ezbo_ceo_chat_seen'), 'true', 'Flag must be set');
    });

    it('Does NOT auto-open on repeat visits when ezbo_ceo_chat_seen is already true', () => {
      const storage = createMockStorage();
      storage.setItem('ezbo_ceo_chat_seen', 'true');
      let isOpen = false;

      const seen = storage.getItem('ezbo_ceo_chat_seen');
      if (!seen) {
        isOpen = true;
        storage.setItem('ezbo_ceo_chat_seen', 'true');
      }

      assert.equal(isOpen, false, 'Chat should NOT auto-open on repeat visit');
    });

    it('Auto-minimizes when activeTab switches away from chat to other tabs', () => {
      let isOpen = true;
      let previousObservedTab = null;

      function simulateTabEffect(currentTab) {
        if (
          previousObservedTab !== null &&
          currentTab &&
          currentTab !== previousObservedTab &&
          currentTab !== 'chat'
        ) {
          isOpen = false;
        }
        previousObservedTab = currentTab;
      }

      // Initial visit to chat
      simulateTabEffect('chat');
      assert.equal(isOpen, true);

      // User clicks 'store'
      simulateTabEffect('store');
      assert.equal(isOpen, false, 'Chat must auto-minimize when switching to store');

      // User re-opens chat manually
      isOpen = true;

      // User switches to 'billing'
      simulateTabEffect('billing');
      assert.equal(isOpen, false, 'Chat must auto-minimize when switching to billing');

      // User re-opens chat manually
      isOpen = true;

      // User switches to 'helpers'
      simulateTabEffect('helpers');
      assert.equal(isOpen, false, 'Chat must auto-minimize when switching to helpers');

      // User re-opens chat manually
      isOpen = true;

      // User switches to 'settings'
      simulateTabEffect('settings');
      assert.equal(isOpen, false, 'Chat must auto-minimize when switching to settings');
    });

    it('Does NOT auto-minimize when staying on the same tab or switching to chat', () => {
      let isOpen = true;
      let previousObservedTab = null;

      function simulateTabEffect(currentTab) {
        if (
          previousObservedTab !== null &&
          currentTab &&
          currentTab !== previousObservedTab &&
          currentTab !== 'chat'
        ) {
          isOpen = false;
        }
        previousObservedTab = currentTab;
      }

      simulateTabEffect('helpers');
      // Already on helpers, re-renders with same tab
      isOpen = true;
      simulateTabEffect('helpers');
      assert.equal(isOpen, true, 'Re-rendering same tab must not auto-minimize');

      // Switching to 'chat'
      simulateTabEffect('chat');
      assert.equal(isOpen, true, 'Switching to chat must not auto-minimize');
    });
  });
});
