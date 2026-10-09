import fs from 'node:fs';
import path from 'node:path';

export interface TelegramLinkedUser {
  userId: string;
  userName: string;
  userEmail: string;
  planTier: 'byok' | 'managed' | 'pro' | 'ultra' | 'complete' | 'free';
  isSubscribed: boolean;
  chatId: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  activeAgent: string;
  unlockedBots: string[];
  byokKey?: string;
  linkedAt: string;
  lastInteractionAt: string;
}

interface PendingSync {
  code: string;
  userId: string;
  userName: string;
  userEmail: string;
  planTier: 'byok' | 'managed' | 'pro' | 'ultra' | 'complete' | 'free';
  isSubscribed: boolean;
  byokKey?: string;
  unlockedBots?: string[];
  expiresAt: number;
}

const CACHE_FILE_PATH = path.join(
  process.platform === 'win32' ? process.env.TEMP || 'C:\\Windows\\Temp' : '/tmp',
  'ezbo_telegram_users.json'
);

// In-memory pending sync codes (TTL 15 min)
const pendingSyncs = new Map<string, PendingSync>();

// In-memory linked users cache (chatId -> user)
let linkedUsers = new Map<string, TelegramLinkedUser>();
let isInitialized = false;

function loadUsersFromDisk(): void {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const data: Record<string, TelegramLinkedUser> = JSON.parse(raw);
      linkedUsers = new Map(Object.entries(data));
    }
  } catch (err) {
    console.warn('Could not read telegram users cache:', err);
  }
  isInitialized = true;
}

function persistUsersToDisk(): void {
  try {
    const obj = Object.fromEntries(linkedUsers.entries());
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist telegram users cache:', err);
  }
}

function ensureInitialized() {
  if (!isInitialized) {
    loadUsersFromDisk();
  }
}

/**
 * Generate a 6-digit sync code (e.g. EZBO-4892) for user onboarding in Channels tab
 */
export function generateSyncCode(user: {
  userId: string;
  userName: string;
  userEmail: string;
  planTier: 'byok' | 'managed' | 'pro' | 'ultra' | 'complete' | 'free';
  isSubscribed: boolean;
  byokKey?: string;
  unlockedBots?: string[];
}): string {
  // Clean expired syncs
  const now = Date.now();
  for (const [key, item] of pendingSyncs.entries()) {
    if (now > item.expiresAt) {
      pendingSyncs.delete(key);
    }
  }

  // 4 random digits + 2 random alphanumeric uppercase
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `EZBO-${randomNum}`;

  pendingSyncs.set(code.toUpperCase(), {
    code: code.toUpperCase(),
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    planTier: user.planTier,
    isSubscribed: user.isSubscribed,
    byokKey: user.byokKey,
    unlockedBots: user.unlockedBots || [],
    expiresAt: now + 15 * 60 * 1000 // 15 mins
  });

  return code;
}

/**
 * Link a Telegram chat ID using a sync code or user ID
 */
export function linkUserByCode(
  chatId: string,
  rawCode: string,
  telegramInfo?: { username?: string; firstName?: string }
): { success: boolean; user?: TelegramLinkedUser; error?: string } {
  ensureInitialized();

  const clean = rawCode.trim().toUpperCase();
  // Also check if user passed raw code with prefix 'SYNC_'
  const normalized = clean.startsWith('SYNC_') ? clean.replace('SYNC_', '') : clean;

  let pending = pendingSyncs.get(normalized) || pendingSyncs.get(`EZBO-${normalized}`);

  // Fallback: Check if they provided exact user ID (e.g. usr-...)
  if (!pending) {
    // Search if code matches any user ID directly
    for (const item of pendingSyncs.values()) {
      if (item.userId.toUpperCase() === normalized) {
        pending = item;
        break;
      }
    }
  }

  if (!pending) {
    return {
      success: false,
      error: 'Invalid or expired sync code. Please check your Ezbo Dashboard > Channels > Telegram to get a fresh code.'
    };
  }

  if (Date.now() > pending.expiresAt) {
    pendingSyncs.delete(pending.code);
    return {
      success: false,
      error: 'This sync code has expired. Please refresh your Ezbo Dashboard to generate a new code.'
    };
  }

  const linkedUser: TelegramLinkedUser = {
    userId: pending.userId,
    userName: pending.userName,
    userEmail: pending.userEmail,
    planTier: pending.planTier,
    isSubscribed: pending.isSubscribed,
    chatId: chatId.toString(),
    telegramUsername: telegramInfo?.username || '',
    telegramFirstName: telegramInfo?.firstName || '',
    activeAgent: 'general',
    unlockedBots: pending.unlockedBots || [],
    byokKey: pending.byokKey,
    linkedAt: new Date().toISOString(),
    lastInteractionAt: new Date().toISOString()
  };

  linkedUsers.set(chatId.toString(), linkedUser);
  persistUsersToDisk();

  // Consume sync code
  pendingSyncs.delete(pending.code);

  return { success: true, user: linkedUser };
}

export function getLinkedUserByChatId(chatId: string | number): TelegramLinkedUser | null {
  ensureInitialized();
  return linkedUsers.get(chatId.toString()) || null;
}

export function getLinkedUserByUserId(userId: string): TelegramLinkedUser | null {
  ensureInitialized();
  for (const user of linkedUsers.values()) {
    if (user.userId === userId) {
      return user;
    }
  }
  return null;
}

export function unlinkByUserId(userId: string): boolean {
  ensureInitialized();
  for (const [chatId, user] of linkedUsers.entries()) {
    if (user.userId === userId) {
      linkedUsers.delete(chatId);
      persistUsersToDisk();
      return true;
    }
  }
  return false;
}

export function unlinkByChatId(chatId: string | number): boolean {
  ensureInitialized();
  const deleted = linkedUsers.delete(chatId.toString());
  if (deleted) {
    persistUsersToDisk();
  }
  return deleted;
}

export function updateUserAgent(chatId: string | number, agentId: string): boolean {
  ensureInitialized();
  const user = linkedUsers.get(chatId.toString());
  if (!user) return false;
  user.activeAgent = agentId;
  user.lastInteractionAt = new Date().toISOString();
  persistUsersToDisk();
  return true;
}

export function touchUserInteraction(chatId: string | number): void {
  ensureInitialized();
  const user = linkedUsers.get(chatId.toString());
  if (user) {
    user.lastInteractionAt = new Date().toISOString();
    persistUsersToDisk();
  }
}
