import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { baileysManager } from './baileysManager.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Root health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'SuperAI Hub WhatsApp Self-Assistant Engine',
    version: '1.0.0',
    status: baileysManager.getStatus(),
    endpoints: [
      'GET /api/status',
      'GET /api/qr',
      'GET /api/qr/stream',
      'POST /api/session/start',
      'POST /api/session/disconnect',
      'POST /api/chat/test'
    ]
  });
});

// Engine status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json(baileysManager.getStatus());
});

// QR Code image endpoint
app.get('/api/qr', (req: Request, res: Response) => {
  const status = baileysManager.getStatus();
  const qrDataUrl = baileysManager.getQrDataUrl();
  res.json({
    ...status,
    qrDataUrl
  });
});

// Server-Sent Events (SSE) for live QR and status updates
app.get('/api/qr/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendUpdate = () => {
    const data = JSON.stringify({
      ...baileysManager.getStatus(),
      qrDataUrl: baileysManager.getQrDataUrl()
    });
    res.write(`data: ${data}\n\n`);
  };

  sendUpdate();
  const interval = setInterval(sendUpdate, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Start session
app.post('/api/session/start', async (req: Request, res: Response) => {
  try {
    baileysManager.start().catch((err) => console.error('Start error:', err));
    res.json({ success: true, message: 'Baileys session initialization started' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Disconnect session
app.post('/api/session/disconnect', async (req: Request, res: Response) => {
  try {
    await baileysManager.disconnect();
    res.json({ success: true, message: 'Session disconnected' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test chat API (invokes Brain Router without needing physical WhatsApp device)
app.post('/api/chat/test', async (req: Request, res: Response) => {
  const { message, apiKey } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message field is required' });
  }

  try {
    const result = await baileysManager.testChat(message, apiKey);
    res.json({
      success: true,
      input: message,
      result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SuperAI Hub WhatsApp Engine listening on http://localhost:${PORT}`);
  // Automatically trigger Baileys initialization
  baileysManager.start().catch((e) => console.warn('Initial Baileys start deferred:', e.message));
});
