/**
 * CloudSync Service - Supabase Cloud Synchronization Hooks.
 * Allows multi-device chat history synchronization when Supabase is configured.
 * Gracefully no-ops without throwing errors when Supabase environment variables
 * or credentials are not configured or when running offline / SSR.
 */

function getSupabaseConfig(): { url: string; key: string } | null {
  let url = '';
  let key = '';

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      url =
        import.meta.env.PUBLIC_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL ||
        '';
      key =
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        '';
    }
  } catch {
    // ignore
  }

  if ((!url || !key) && typeof window !== 'undefined') {
    try {
      url = url || localStorage.getItem('ezbo_supabase_url') || '';
      key = key || localStorage.getItem('ezbo_supabase_anon_key') || '';
    } catch {
      // ignore
    }
  }

  if (url && key) {
    return { url: url.replace(/\/+$/, ''), key };
  }

  return null;
}

/**
 * Push local messages to cloud (Supabase).
 * No-ops gracefully if unconfigured.
 */
export async function syncPushMessages(userId: string, messages: any[]): Promise<void> {
  if (typeof window === 'undefined' || !userId || !messages || messages.length === 0) {
    return;
  }

  const config = getSupabaseConfig();
  if (!config) {
    return;
  }

  try {
    const payload = messages.map((m) => ({
      id: m.id,
      user_id: userId,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || new Date().toISOString(),
      metadata: {
        toolMatched: m.toolMatched,
        imageUrl: m.imageUrl,
        provider: m.provider,
        status: m.status
      }
    }));

    await fetch(`${config.url}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('[cloudSync] syncPushMessages caught error (graceful suppression):', err);
  }
}

/**
 * Pull messages from cloud (Supabase).
 * No-ops gracefully if unconfigured.
 */
export async function syncPullMessages(userId: string, lastTimestamp?: string): Promise<any[]> {
  if (typeof window === 'undefined' || !userId) {
    return [];
  }

  const config = getSupabaseConfig();
  if (!config) {
    return [];
  }

  try {
    let endpoint = `${config.url}/rest/v1/chat_messages?user_id=eq.${encodeURIComponent(userId)}&order=timestamp.asc`;
    if (lastTimestamp) {
      endpoint += `&timestamp=gt.${encodeURIComponent(lastTimestamp)}`;
    }

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      return [];
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((r: any) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      timestamp: r.timestamp,
      toolMatched: r.metadata?.toolMatched,
      imageUrl: r.metadata?.imageUrl,
      provider: r.metadata?.provider,
      status: r.metadata?.status
    }));
  } catch (err) {
    console.warn('[cloudSync] syncPullMessages caught error (graceful suppression):', err);
    return [];
  }
}

export const cloudSync = {
  syncPushMessages,
  syncPullMessages
};
