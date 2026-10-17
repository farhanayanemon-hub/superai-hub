import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('$lib/')) {
    const sub = specifier.slice(5);
    const fullPath = path.resolve(process.cwd(), 'web', 'src', 'lib', sub + (sub.endsWith('.ts') || sub.endsWith('.js') ? '' : '.ts'));
    return nextResolve(pathToFileURL(fullPath).href, context);
  }
  return nextResolve(specifier, context);
}
