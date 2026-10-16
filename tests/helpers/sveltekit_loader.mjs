import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIB_DIR = path.resolve(__dirname, '../../web/src/lib');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('$lib/')) {
    const relative = specifier.slice('$lib/'.length);
    let resolvedPath = path.join(LIB_DIR, relative);
    if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.js')) {
      resolvedPath += '.ts';
    }
    return {
      url: pathToFileURL(resolvedPath).href,
      shortCircuit: true
    };
  }
  return nextResolve(specifier, context);
}
