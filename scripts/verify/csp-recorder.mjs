export async function attachCspRecorder(page) {
  const violations = [];
  await page.exposeFunction('__cspReport', (entry) => {
    violations.push(entry);
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      const origem = e.sourceFile ? ` ${e.sourceFile}:${e.lineNumber}` : '';
      window.__cspReport(`${e.disposition} ${e.effectiveDirective} ${e.blockedURI}${origem}`);
    });
  });
  return violations;
}
