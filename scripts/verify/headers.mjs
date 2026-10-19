import { existsSync, readFileSync } from 'node:fs';

export const CSP_HEADER_NAMES = {
  'report-only': 'content-security-policy-report-only',
  enforce: 'content-security-policy',
};

function lowerKeys(object) {
  return Object.fromEntries(Object.entries(object).map(([k, v]) => [k.toLowerCase(), v]));
}

export function compileRules(configRoutes, vercelHeaders) {
  const fromConfig = (configRoutes ?? [])
    .filter((r) => r.headers && r.src && !r.dest)
    .map((r) => ({ re: new RegExp(r.src), headers: lowerKeys(r.headers) }));
  const fromVercel = (vercelHeaders ?? []).map((h) => ({
    re: new RegExp(`^${h.source}$`),
    headers: Object.fromEntries(h.headers.map((x) => [x.key.toLowerCase(), x.value])),
  }));
  return [...fromConfig, ...fromVercel];
}

export function loadRules({ configPath, vercelJsonPath } = {}) {
  let routes = [];
  let vercelHeaders = [];
  if (configPath && existsSync(configPath)) {
    routes = JSON.parse(readFileSync(configPath, 'utf8')).routes ?? [];
  }
  if (vercelJsonPath && existsSync(vercelJsonPath)) {
    vercelHeaders = JSON.parse(readFileSync(vercelJsonPath, 'utf8')).headers ?? [];
  }
  return compileRules(routes, vercelHeaders);
}

export function headersFor(rules, pathname) {
  return Object.assign({}, ...rules.filter((r) => r.re.test(pathname)).map((r) => r.headers));
}

export function isRegexCompatible(source) {
  if (/(^|[^?]):[A-Za-z_]/.test(source)) return false;
  if (/(^|[^.)\]])\*/.test(source)) return false;
  try {
    new RegExp(source);
  } catch {
    return false;
  }
  return true;
}

export function checkNonCspHeaders(h) {
  const failures = [];
  const need = (name) => {
    if (h[name] === undefined || h[name] === '') {
      failures.push(`${name} ausente`);
      return null;
    }
    return String(h[name]);
  };

  const hsts = need('strict-transport-security');
  if (hsts !== null) {
    const age = /max-age=(\d+)/i.exec(hsts);
    if (!age || Number(age[1]) < 31536000)
      failures.push('strict-transport-security com max-age insuficiente');
    if (!/includesubdomains/i.test(hsts))
      failures.push('strict-transport-security sem includeSubDomains');
    if (!/preload/i.test(hsts)) failures.push('strict-transport-security sem preload');
  }

  const xcto = need('x-content-type-options');
  if (xcto !== null && xcto.toLowerCase() !== 'nosniff')
    failures.push('x-content-type-options diferente de nosniff');

  const xfo = need('x-frame-options');
  if (xfo !== null && xfo.toUpperCase() !== 'DENY')
    failures.push('x-frame-options diferente de DENY');

  const rp = need('referrer-policy');
  if (rp !== null && rp.toLowerCase() !== 'strict-origin-when-cross-origin') {
    failures.push('referrer-policy diferente de strict-origin-when-cross-origin');
  }

  const pp = need('permissions-policy');
  if (pp !== null) {
    for (const token of ['camera=()', 'microphone=()', 'geolocation=()']) {
      if (!pp.includes(token)) failures.push(`permissions-policy sem ${token}`);
    }
  }

  const coop = need('cross-origin-opener-policy');
  if (coop !== null && coop.toLowerCase() !== 'same-origin') {
    failures.push('cross-origin-opener-policy diferente de same-origin');
  }

  need('cross-origin-resource-policy');
  return failures;
}

function directive(csp, name) {
  for (const part of csp.split(';')) {
    const trimmed = part.trim();
    if (trimmed === name || trimmed.startsWith(`${name} `)) return trimmed;
  }
  return null;
}

export function checkCsp(h, expect) {
  const failures = [];
  const enforcing = h[CSP_HEADER_NAMES.enforce];
  const reportOnly = h[CSP_HEADER_NAMES['report-only']];

  if (expect === 'none') {
    if (enforcing !== undefined) failures.push('content-security-policy presente');
    if (reportOnly !== undefined) failures.push('content-security-policy-report-only presente');
    return failures;
  }

  const wanted = expect === 'enforce' ? enforcing : reportOnly;
  const forbidden = expect === 'enforce' ? reportOnly : enforcing;
  const wantedName =
    expect === 'enforce' ? CSP_HEADER_NAMES.enforce : CSP_HEADER_NAMES['report-only'];
  const forbiddenName =
    expect === 'enforce' ? CSP_HEADER_NAMES['report-only'] : CSP_HEADER_NAMES.enforce;

  if (forbidden !== undefined) failures.push(`${forbiddenName} presente`);
  if (wanted === undefined) {
    failures.push(`${wantedName} ausente`);
    return failures;
  }

  const csp = String(wanted);
  const requiredExact = [
    ['default-src', "'self'"],
    ['object-src', "'none'"],
    ['base-uri', "'none'"],
    ['form-action', "'self'"],
    ['frame-ancestors', "'none'"],
  ];
  for (const [name, value] of requiredExact) {
    const found = directive(csp, name);
    if (found === null || !found.includes(value)) failures.push(`csp sem ${name} ${value}`);
  }
  for (const name of ['script-src', 'style-src']) {
    const found = directive(csp, name);
    if (found === null || !found.includes("'self'")) failures.push(`csp sem ${name} 'self'`);
  }
  if (csp.includes("'unsafe-inline'")) failures.push("csp contem 'unsafe-inline'");
  if (csp.includes("'unsafe-eval'")) failures.push("csp contem 'unsafe-eval'");
  if (expect === 'enforce' && directive(csp, 'upgrade-insecure-requests') === null) {
    failures.push('csp sem upgrade-insecure-requests');
  }
  return failures;
}
