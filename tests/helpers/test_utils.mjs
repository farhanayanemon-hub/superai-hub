import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function toFileUrl(filePath) {
  return pathToFileURL(filePath).href;
}

export const ROOT_DIR = path.resolve(__dirname, '../..');
export const WEB_DIR = path.join(ROOT_DIR, 'web');
export const ROBOTS_DIR = path.join(WEB_DIR, 'src', 'lib', 'components', 'robots');
export const STATIC_DIR = path.join(WEB_DIR, 'static');
export const DOWNLOADS_DIR = 'c:/Users/Farhan Ayan Emon/Downloads/files';

/**
 * Compute SHA256 of a file
 */
export function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Check if file exists and is non-empty
 */
export function fileExistsNonEmpty(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

/**
 * Check PNG signature magic bytes
 */
export function isValidPng(filePath) {
  if (!fileExistsNonEmpty(filePath)) return false;
  const buf = fs.readFileSync(filePath);
  if (buf.length < 8) return false;
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  return (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  );
}

/**
 * Authoritative bubble clamping calculator per specification
 */
export function computeClampedBubblePosition({
  offsetLeft,
  offsetTop,
  offsetWidth,
  offsetHeight,
  wrapClientWidth,
  gridOffsetHeight,
  bubOffsetHeight = 160,
  bubbleWidth = 240
}) {
  const w = bubbleWidth;
  const x = Math.max(0, Math.min(offsetLeft + offsetWidth / 2 - w / 2, wrapClientWidth - w));
  const below = offsetTop + offsetHeight - 6;
  const shouldFlip = below + bubOffsetHeight > gridOffsetHeight + 20;
  const y = shouldFlip
    ? Math.max(0, offsetTop - bubOffsetHeight + 10)
    : below;
  return { x, y, shouldFlip };
}

/**
 * Validate that an SVG string is syntactically sound and has required elements
 */
export function validateRobotSvg(svgString, agent) {
  const errors = [];
  if (!svgString.startsWith('<svg') || !svgString.endsWith('</svg>')) {
    errors.push('SVG does not start with <svg or end with </svg>');
  }
  if (!svgString.includes('viewBox="0 0 240 280"')) {
    errors.push('SVG missing standard viewBox="0 0 240 280"');
  }
  if (!svgString.includes('class="rb-svg"')) {
    errors.push('SVG missing class="rb-svg"');
  }
  if (!svgString.includes('class="rb-sh rb-e"')) {
    errors.push('SVG missing shadow element (.rb-sh .rb-e)');
  }
  if (!svgString.includes('class="rb-fl rb-e"')) {
    errors.push('SVG missing float group (.rb-fl .rb-e)');
  }
  if (!svgString.includes('class="rb-th rb-e"')) {
    errors.push('SVG missing thruster element (.rb-th .rb-e)');
  }
  if (!svgString.includes('class="rb-bk rb-e"')) {
    errors.push('SVG missing eye element (.rb-bk .rb-e)');
  }
  const padN = String(agent.n).padStart(2, '0');
  if (!svgString.includes(`#${padN}`)) {
    errors.push(`SVG missing chest badge #${padN}`);
  }
  if (!svgString.includes(agent.c)) {
    errors.push(`SVG missing accent color ${agent.c}`);
  }
  if (!svgString.includes(agent.e)) {
    errors.push(`SVG missing eye glow color ${agent.e}`);
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
