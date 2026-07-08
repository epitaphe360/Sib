/**
 * Stub léger d'expo-linking pour les tests unitaires (env node).
 * Évite de charger react-native (syntaxe Flow non parsable par Rollup).
 * Fournit uniquement l'API utilisée par le code testé.
 */

export interface ParsedURL {
  scheme: string | null;
  hostname: string | null;
  path: string | null;
  queryParams: Record<string, string | string[]>;
}

export function parse(url: string): ParsedURL {
  const queryParams: Record<string, string | string[]> = {};
  const queryIndex = url.indexOf('?');
  const query = queryIndex >= 0 ? url.slice(queryIndex + 1).split('#')[0] : '';
  if (query) {
    const params = new URLSearchParams(query);
    for (const [key, value] of params.entries()) {
      queryParams[key] = value;
    }
  }

  let scheme: string | null = null;
  let rest = url;
  const schemeMatch = /^([^:]+):\/\//.exec(url);
  if (schemeMatch) {
    scheme = schemeMatch[1];
    rest = url.slice(schemeMatch[0].length);
  }
  const withoutQuery = rest.split('?')[0].split('#')[0];
  const [hostname = null, ...pathParts] = withoutQuery.split('/');
  const path = pathParts.length ? pathParts.join('/') : null;

  return { scheme, hostname: hostname || null, path, queryParams };
}

export function createURL(path: string): string {
  return `urbaevent://${path}`;
}

export function useURL(): string | null {
  return null;
}

export function addEventListener(): { remove: () => void } {
  return { remove: () => {} };
}

export function getInitialURL(): Promise<string | null> {
  return Promise.resolve(null);
}

export default {
  parse,
  createURL,
  useURL,
  addEventListener,
  getInitialURL,
};
