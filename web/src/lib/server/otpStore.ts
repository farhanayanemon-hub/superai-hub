interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// In-memory OTP storage keyed by email + action
const store = new Map<string, OtpRecord>();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.expiresAt) {
      store.delete(key);
    }
  }
}, 60 * 1000);

export function generateAndStoreOtp(email: string, action: 'signup' | 'reset_password'): string {
  const key = `${email.toLowerCase().trim()}:${action}`;
  // 6-digit cryptographic numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const record: OtpRecord = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    createdAt: Date.now()
  };
  store.set(key, record);
  return code;
}

export function verifyOtp(email: string, code: string, action: 'signup' | 'reset_password'): { success: boolean; error?: string } {
  const key = `${email.toLowerCase().trim()}:${action}`;
  const record = store.get(key);

  if (!record) {
    return { success: false, error: 'No verification code found or it has expired. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (record.attempts >= 5) {
    store.delete(key);
    return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (record.code !== code.trim()) {
    record.attempts++;
    const remaining = 5 - record.attempts;
    return { success: false, error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` };
  }

  // Verification succeeded - consume code
  store.delete(key);
  return { success: true };
}
