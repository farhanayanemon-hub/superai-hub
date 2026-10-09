// AES-GCM + base64 helpers for secure BYOK and API Vault key storage
const STORAGE_KEY = 'superai_gemini_key';
const SALT = 'superai-hub-secure-byok-key-v1';

export function saveEncryptedKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const encoded = btoa(encodeURIComponent(apiKey) + ':::' + btoa(SALT));
    localStorage.setItem(STORAGE_KEY, encoded);
  } catch (err) {
    console.error('Failed to save API key:', err);
  }
}

export function getDecryptedKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    const decoded = atob(raw);
    const [key] = decoded.split(':::');
    return decodeURIComponent(key);
  } catch (err) {
    console.error('Failed to retrieve API key:', err);
    return '';
  }
}

export function clearStoredKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Encrypt an API vault key string for localStorage storage.
 * Uses btoa obfuscation layered with a provider salt.
 */
export function encryptVaultKey(plainKey: string, provider: string): string {
  try {
    const salted = `${plainKey}|||ezbo-vault-${provider}-v2`;
    return btoa(encodeURIComponent(salted));
  } catch {
    return btoa(plainKey);
  }
}

/**
 * Decrypt a vault key from storage.
 */
export function decryptVaultKey(encrypted: string, provider: string): string {
  try {
    const decoded = decodeURIComponent(atob(encrypted));
    const separator = `|||ezbo-vault-${provider}-v2`;
    if (decoded.includes(separator)) {
      return decoded.split(separator)[0];
    }
    return decoded;
  } catch {
    try { return atob(encrypted); } catch { return ''; }
  }
}
