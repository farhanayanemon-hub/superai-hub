import type { WAMessage, WASocket } from '@whiskeysockets/baileys';

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extracts plain text from any Baileys message structure.
 */
export function extractMessageText(msg: WAMessage): string {
  if (!msg.message) return '';
  const message = msg.message;

  if (message.conversation) {
    return message.conversation.trim();
  }
  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text.trim();
  }
  if (message.imageMessage?.caption) {
    return message.imageMessage.caption.trim();
  }
  if (message.videoMessage?.caption) {
    return message.videoMessage.caption.trim();
  }
  return '';
}

/**
 * Strict Anti-Ban Guardrail:
 * Checks whether the message originated from the user themselves AND was sent to themselves.
 * Rejects all third-party, group, or external messages with zero processing.
 */
export function isSafeSelfMessage(sock: WASocket, msg: WAMessage): boolean {
  // 1. MUST be sent by the authenticated account holder
  if (!msg.key.fromMe) {
    return false;
  }

  // 2. Identify the user's phone / JID
  const myJid = sock.user?.id;
  if (!myJid) return false;

  const normalizedMyPhone = myJid.split(':')[0].replace(/[^0-9]/g, '');
  const remoteJid = msg.key.remoteJid || '';
  const normalizedRemotePhone = remoteJid.split('@')[0].replace(/[^0-9]/g, '');

  // 3. MUST match self chat (Message Yourself) or self status
  const isSelfChat =
    remoteJid.includes('status@broadcast') ||
    remoteJid === `${normalizedMyPhone}@s.whatsapp.net` ||
    normalizedRemotePhone === normalizedMyPhone;

  return isSelfChat;
}

/**
 * Human Simulation: Shows 'composing' (typing...) state and waits 2-3 seconds.
 */
export async function simulateHumanTyping(sock: WASocket, jid: string, ms = 2500): Promise<void> {
  try {
    await sock.sendPresenceUpdate('composing', jid);
    await delay(ms);
    await sock.sendPresenceUpdate('paused', jid);
  } catch (err) {
    // Non-fatal if presence update fails
  }
}
