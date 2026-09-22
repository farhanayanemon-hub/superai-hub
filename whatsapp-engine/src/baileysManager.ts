import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
  type ConnectionState
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import { AUTH_DIR } from './config.js';
import { isSafeSelfMessage, extractMessageText, simulateHumanTyping } from './guardrails.js';
import { CentralBrainRouter } from './brainRouter.js';

export type EngineStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';

export class BaileysManager {
  private sock: WASocket | null = null;
  private status: EngineStatus = 'disconnected';
  private currentQrRaw: string | null = null;
  private currentQrDataUrl: string | null = null;
  private userJid: string | null = null;
  private brainRouter: CentralBrainRouter;
  private isStarting = false;
  private processedMessageIds = new Set<string>();

  constructor() {
    this.brainRouter = new CentralBrainRouter();
  }

  getStatus() {
    return {
      status: this.status,
      userJid: this.userJid,
      hasQr: !!this.currentQrDataUrl
    };
  }

  getQrDataUrl() {
    return this.currentQrDataUrl;
  }

  async start(): Promise<void> {
    if (this.isStarting || this.status === 'connected') return;
    this.isStarting = true;
    this.status = 'connecting';

    try {
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version } = await fetchLatestBaileysVersion();

      const logger = pino({ level: 'silent' });

      this.sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false
      });

      // Save credentials updates
      this.sock.ev.on('creds.update', saveCreds);

      // Connection lifecycle updates
      this.sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.currentQrRaw = qr;
          try {
            this.currentQrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
          } catch (e) {
            console.error('Failed to generate QR data URL:', e);
          }
          this.status = 'qr_ready';
          console.log('📱 WhatsApp Baileys QR code generated and ready for mobile scan.');
        }

        if (connection === 'open') {
          this.status = 'connected';
          this.currentQrRaw = null;
          this.currentQrDataUrl = null;
          this.userJid = this.sock?.user?.id || null;
          console.log('✅ WhatsApp Multi-Device session connected successfully! User JID:', this.userJid);
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          this.status = 'disconnected';
          this.userJid = null;
          console.log(`🔌 Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

          if (shouldReconnect) {
            setTimeout(() => this.start(), 3000);
          }
        }
      });

      // Message Handling with Strict Anti-Ban Guardrails
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' || !this.sock) return;

        for (const msg of messages) {
          const msgId = msg.key.id;
          if (!msgId || this.processedMessageIds.has(msgId)) continue;
          this.processedMessageIds.add(msgId);

          // Keep cache size bounded
          if (this.processedMessageIds.size > 1000) {
            this.processedMessageIds.clear();
          }

          // 1. STRICT ANTI-BAN GUARDRAIL CHECK
          // Only messages sent by the user TO themselves are permitted
          if (!isSafeSelfMessage(this.sock, msg)) {
            continue; // Skip third-party chats completely
          }

          const rawText = extractMessageText(msg);
          if (!rawText) continue;

          // Prevent loop if text is an output header from bot
          if (rawText.startsWith('🤖 *SuperAI') || rawText.startsWith('✨ *SuperAI')) {
            continue;
          }

          console.log(`📩 Safe self-message received: "${rawText.substring(0, 50)}..."`);

          const targetJid = msg.key.remoteJid || this.sock.user?.id;
          if (!targetJid) continue;

          // 2. Human Simulation (2.5 seconds composing state)
          await simulateHumanTyping(this.sock, targetJid, 2500);

          // 3. Central Brain Routing
          const brainRes = await this.brainRouter.processMessage(rawText);

          // 4. Dispatch Result back to User
          if (brainRes.type === 'image' && brainRes.image) {
            if (brainRes.image.imageBuffer) {
              await this.sock.sendMessage(targetJid, {
                image: brainRes.image.imageBuffer,
                caption: brainRes.image.caption
              });
            } else {
              await this.sock.sendMessage(targetJid, {
                image: { url: brainRes.image.imageUrl },
                caption: brainRes.image.caption
              });
            }
          } else if (brainRes.text) {
            await this.sock.sendMessage(targetJid, {
              text: brainRes.text
            });
          }
        }
      });
    } catch (err) {
      console.error('Failed to initialize Baileys:', err);
      this.status = 'disconnected';
    } finally {
      this.isStarting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (err) {
        // ignore
      }
      this.sock = null;
    }
    this.status = 'disconnected';
    this.userJid = null;
    this.currentQrDataUrl = null;
  }

  /**
   * Helper to test brain router directly via HTTP API without requiring an active WhatsApp phone connection.
   */
  async testChat(message: string, apiKey?: string) {
    return await this.brainRouter.processMessage(message, apiKey);
  }
}

export const baileysManager = new BaileysManager();
