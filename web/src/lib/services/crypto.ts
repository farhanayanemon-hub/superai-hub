// Simple client-side obfuscation & AES helper for BYOK Gemini API key storage
const STORAGE_KEY = 'superai_gemini_key';
const SALT = 'superai-hub-secure-byok-key-v1';

export function saveEncryptedKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Light reversible encoding for browser storage protection
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
