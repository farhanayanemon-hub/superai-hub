import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const channelModalPath = path.join(ROOT_DIR, 'web/src/lib/components/ChannelModal.svelte');
const floatingChatPath = path.join(ROOT_DIR, 'web/src/lib/components/FloatingCeoChat.svelte');
const channelModalSource = fs.readFileSync(channelModalPath, 'utf-8');
const floatingChatSource = fs.readFileSync(floatingChatPath, 'utf-8');

describe('Forensic Integrity Audit: Milestone M3 Components', () => {

  // =========================================================================
  // Forensic Check 1: Static Analysis - No Hardcoded Fakes or Placeholders
  // =========================================================================
  describe('Forensic Check 1: Static Analysis (Fake Code & Dummy Chat Detection)', () => {
    it('ChannelModal: pairingCode is not hardcoded to any static string', () => {
      // Must be initialized to null
      assert.match(channelModalSource, /let\s+pairingCode\s*=\s*\$state<string\s*\|\s*null>\(null\)/);
      // Must receive value strictly from whatsappApi.requestPairingCode
      assert.match(channelModalSource, /const\s+res\s*=\s*await\s+whatsappApi\.requestPairingCode\(/);
      assert.match(channelModalSource, /pairingCode\s*=\s*res\.pairingCode/);
      
      // Check that no static hardcoded codes like "ABCD1234", "12345678", etc. are assigned
      const assignmentMatches = channelModalSource.match(/pairingCode\s*=\s*['"`][^'"`]+['"`]/g);
      assert.equal(assignmentMatches, null, 'pairingCode must not be assigned any literal string');
    });

    it('ChannelModal: tgSyncCode is not hardcoded to any static string', () => {
      // Must be initialized to null
      assert.match(channelModalSource, /let\s+tgSyncCode\s*=\s*\$state<string\s*\|\s*null>\(null\)/);
      // Must receive value from fetch POST /api/telegram/sync
      assert.match(channelModalSource, /fetch\(['"]\/api\/telegram\/sync['"],\s*\{/);
      assert.match(channelModalSource, /tgSyncCode\s*=\s*data\.syncCode/);

      const tgCodeAssignments = channelModalSource.match(/tgSyncCode\s*=\s*['"`][^'"`]+['"`]/g);
      assert.equal(tgCodeAssignments, null, 'tgSyncCode must not be assigned any literal string');
    });

    it('FloatingCeoChat: chat messages are not hardcoded dummy mock conversations', () => {
      // Must read from $chatMessages store
      assert.match(floatingChatSource, /\{#each\s+(?:\$chatMessages|currentMessages)\s+as\s+msg\s*\(msg\.id\)\}/);
      // Must not contain pre-baked fake chat transcripts in state
      assert.doesNotMatch(floatingChatSource, /let\s+(?:chatMessages|messages)\s*=\s*\[\s*\{/);
    });

    it('No facade dummy implementations (return constant / stubbed handlers)', () => {
      // handleRequestPairingCode must validate phone and make network call
      assert.match(channelModalSource, /async\s+function\s+handleRequestPairingCode\(\)/);
      assert.match(channelModalSource, /clean\.replace\(/);
      assert.match(channelModalSource, /whatsappApi\.requestPairingCode/);

      // handleSend must build payload, call /api/chat and handle response
      assert.match(floatingChatSource, /async\s+function\s+handleSend\(\)/);
      assert.match(floatingChatSource, /fetch\(['"]\/api\/chat['"],\s*\{/);
      assert.match(floatingChatSource, /(?:addChatMessage|chatMessages\.set)\(/);
    });
  });

  // =========================================================================
  // Forensic Check 2: Genuine Brand Assets (Official SVG Logos)
  // =========================================================================
  describe('Forensic Check 2: Genuine Brand Assets (Official SVG Logos)', () => {
    it('ChannelModal: Contains authentic official WhatsApp SVG brand logo with #25D366 styling', () => {
      // Must have WhatsApp official brand color #25D366
      assert.match(channelModalSource, /bg-\[#25D366\]/);
      // Must embed genuine WhatsApp SVG path (M12.04 2c-5.46 0-9.91 4.45...)
      assert.match(channelModalSource, /<svg[^>]*viewBox=["']0 0 24 24["'][^>]*>/);
      assert.match(channelModalSource, /d=["']M12\.04\s*2c-5\.46/);
    });

    it('ChannelModal: Contains authentic official Telegram SVG brand logo with #229ED9 styling', () => {
      // Must have Telegram official brand color #229ED9
      assert.match(channelModalSource, /bg-\[#229ED9\]/);
      // Must embed genuine Telegram SVG path (M12 2C6.48 2 2 6.48...)
      assert.match(channelModalSource, /d=["']M12\s*2C6\.48/);
    });

    it('FloatingCeoChat: Renders AI CEO mascot avatar and status beacon', () => {
      assert.match(floatingChatSource, /src=["']\/ezbo-ceo\.png["']/);
      assert.match(floatingChatSource, /bg-emerald-500\s+ring-2\s+ring-white\s+animate-pulse/);
      assert.match(floatingChatSource, /👋 Hey, CEO is here! Click to chat/);
    });
  });

  // =========================================================================
  // Forensic Check 3: Component Authenticity & Genuine Bindings
  // =========================================================================
  describe('Forensic Check 3: Component Authenticity & Bindings', () => {
    it('FloatingCeoChat imports and binds to TOOLS, chatMessages, userStore, and ChannelModal', () => {
      // TOOLS from tools.ts
      assert.match(floatingChatSource, /import\s*\{\s*TOOLS,\s*AI_CEO_PROFILE/);
      // userStore bindings
      assert.match(floatingChatSource, /import\s*\{[^}]*chatMessages[^}]*\}\s*from\s*['"]\$lib\/stores\/userStore['"]/);
      assert.match(floatingChatSource, /addChatMessage/);
      assert.match(floatingChatSource, /ceoCustomPrompt/);
      assert.match(floatingChatSource, /activeDashboardTab/);
      // ChannelModal binding
      assert.match(floatingChatSource, /import\s+ChannelModal\s+from\s+['"]\$lib\/components\/ChannelModal\.svelte['"]/);
      assert.match(floatingChatSource, /<ChannelModal\s+bind:isOpen=\{isChannelsModalOpen\}\s*\/>/);
    });

    it('ChannelModal imports and binds to whatsappApi, whatsappStatus, whatsappQr, and userStore', () => {
      assert.match(channelModalSource, /import\s*\{\s*whatsappApi\s*\}\s*from\s*['"]\$lib\/services\/whatsappApi['"]/);
      assert.match(channelModalSource, /import\s*\{[^}]*whatsappStatus,\s*whatsappQr/);
      assert.match(channelModalSource, /\$whatsappStatus\s*===\s*['"]connected['"]/);
      assert.match(channelModalSource, /src=\{\$whatsappQr\}/);
    });

    it('FloatingCeoChat implements slash command (/) popover for all helpers', () => {
      assert.match(floatingChatSource, /const\s+filteredTools\s*=\s*\$derived\.by\(/);
      assert.match(floatingChatSource, /TOOLS\.slice\(0,\s*(?:75|80)\)/);
      assert.match(floatingChatSource, /handleInput/);
      assert.match(floatingChatSource, /handleKeyDown/);
      assert.match(floatingChatSource, /selectHelper/);
      assert.match(floatingChatSource, /\[⚡ \$\{helper\.code\} \$\{helper\.name\}\]/);
    });

    it('FloatingCeoChat implements auto-open on first visit and auto-minimize on tab switch', () => {
      // Auto-open via localStorage
      assert.match(floatingChatSource, /localStorage\.getItem\(['"]ezbo_ceo_chat_seen['"]\)/);
      assert.match(floatingChatSource, /localStorage\.setItem\(['"]ezbo_ceo_chat_seen['"],\s*['"]true['"]\)/);
      // Auto-minimize on tab switch
      assert.match(floatingChatSource, /currentTab\s*!==\s*previousObservedTab\s*&&\s*currentTab\s*!==\s*['"]chat['"]/);
      assert.match(floatingChatSource, /isOpen\s*=\s*false/);
    });

    it('ChannelModal implements Crockford 8-digit split blocks format', () => {
      assert.match(channelModalSource, /formattedCodeParts\s*=\s*\$derived\.by/);
      assert.match(channelModalSource, /clean\.slice\(0,\s*4\),\s*clean\.slice\(4,\s*8\)/);
    });
  });

  // =========================================================================
  // Forensic Check 4: Svelte 5 Native Runes & Responsiveness
  // =========================================================================
  describe('Forensic Check 4: Svelte 5 Runes & Responsive Glassmorphism', () => {
    it('Components use Svelte 5 runes ($state, $derived, $effect, $props, $bindable)', () => {
      assert.match(channelModalSource, /\$state/);
      assert.match(channelModalSource, /\$derived/);
      assert.match(channelModalSource, /\$effect/);
      assert.match(channelModalSource, /\$props/);
      assert.match(channelModalSource, /\$bindable/);

      assert.match(floatingChatSource, /\$state/);
      assert.match(floatingChatSource, /\$derived/);
      assert.match(floatingChatSource, /\$effect/);
      assert.match(floatingChatSource, /\$props/);
      assert.match(floatingChatSource, /\$bindable/);
    });

    it('Components adhere to glassmorphism design tokens (backdrop-blur, border-[#CFE2FA], rounded-3xl)', () => {
      assert.match(channelModalSource, /backdrop-blur-2xl/);
      assert.match(channelModalSource, /border-\[#CFE2FA\]/);
      assert.match(channelModalSource, /rounded-3xl/);

      assert.match(floatingChatSource, /backdrop-blur-2xl/);
      assert.match(floatingChatSource, /border-\[#CFE2FA\]/);
      assert.match(floatingChatSource, /rounded-3xl/);
    });
  });
});
