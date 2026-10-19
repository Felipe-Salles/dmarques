export const DEFAULT_CSP_MODE = 'enforce';

const HEADER_NAMES = {
  'report-only': 'content-security-policy-report-only',
  enforce: 'content-security-policy',
};

const CSP_KEY = 'content-security-policy';
const UPGRADE = 'upgrade-insecure-requests';

export function headerNameFor(mode) {
  const name = HEADER_NAMES[mode];
  if (!name) throw new Error(`modo CSP invalido: ${mode}`);
  return name;
}

function isCspRoute(route) {
  const keys = Object.keys(route.headers ?? {});
  return keys.length === 1 && keys[0] === CSP_KEY;
}

export function collectCsp(routes) {
  const values = new Set(routes.filter(isCspRoute).map((r) => r.headers[CSP_KEY]));
  if (values.size === 0) throw new Error('nenhuma rota CSP');
  if (values.size > 1) throw new Error('CSP divergente entre paginas');
  return [...values][0];
}

export function withUpgrade(csp, mode) {
  headerNameFor(mode);
  const parts = csp
    .split(';')
    .map((p) => p.trim())
    .filter((p) => p !== '' && p !== UPGRADE);
  if (mode === 'enforce') parts.push(UPGRADE);
  return parts.join('; ');
}

export function reshapeRoutes(routes, mode) {
  const name = headerNameFor(mode);
  const value = withUpgrade(collectCsp(routes), mode);
  const kept = routes.filter((r) => !isCspRoute(r));
  const index = kept.findIndex((r) => r.handle === 'filesystem');
  if (index === -1) throw new Error('handle filesystem ausente');
  const global = { src: '/(.*)', headers: { [name]: value }, continue: true };
  return [...kept.slice(0, index), global, ...kept.slice(index)];
}
