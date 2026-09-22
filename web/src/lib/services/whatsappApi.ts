import { whatsappStatus, whatsappQr, type WhatsAppStatus } from '$lib/stores/userStore';

const ENGINE_URL = 'http://localhost:4000';

class WhatsAppClientService {
  private eventSource: EventSource | null = null;
  private reconnectTimeout: any = null;

  initStream() {
    if (typeof window === 'undefined') return;
    if (this.eventSource) return;

    try {
      this.eventSource = new EventSource(`${ENGINE_URL}/api/qr/stream`);

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status) {
            whatsappStatus.set(data.status as WhatsAppStatus);
          }
          if (data.qrDataUrl) {
            whatsappQr.set(data.qrDataUrl);
          } else if (data.status === 'connected') {
            whatsappQr.set(null);
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      this.eventSource.onerror = () => {
        this.closeStream();
        // Retry connection in 10s if engine server is booting up
        this.reconnectTimeout = setTimeout(() => this.initStream(), 10000);
      };
    } catch (err) {
      console.warn('Could not connect to WhatsApp engine stream:', err);
    }
  }

  closeStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  async triggerSessionStart(): Promise<boolean> {
    try {
      const res = await fetch(`${ENGINE_URL}/api/session/start`, { method: 'POST' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async triggerDisconnect(): Promise<boolean> {
    try {
      const res = await fetch(`${ENGINE_URL}/api/session/disconnect`, { method: 'POST' });
      whatsappStatus.set('disconnected');
      whatsappQr.set(null);
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

export const whatsappApi = new WhatsAppClientService();
