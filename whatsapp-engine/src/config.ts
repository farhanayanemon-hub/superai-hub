import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

export const PORT = parseInt(process.env.PORT || '4000', 10);
export const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:5173';
export const AUTH_DIR = path.resolve(process.cwd(), 'auth_info_baileys');

// Ensure auth dir exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// Load 50+ tools definitions
export interface ToolItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryName: string;
  description: string;
  systemPrompt: string;
  keywords: string[];
}

let loadedTools: ToolItem[] = [];
try {
  const toolsPath = path.resolve(process.cwd(), '../web/src/lib/config/tools.json');
  if (fs.existsSync(toolsPath)) {
    const raw = fs.readFileSync(toolsPath, 'utf-8');
    loadedTools = JSON.parse(raw);
  }
} catch (err) {
  console.warn('Could not load tools.json directly, fallback to empty list:', err);
}

export const TOOLS = loadedTools;
