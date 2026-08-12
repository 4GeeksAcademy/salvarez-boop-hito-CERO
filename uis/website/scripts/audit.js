/* ==============================================================
   audit.js — Auditoría de componentes HTML TrackFlow
   ==============================================================
   Uso: node audit.js [archivo1.html archivo2.html ...]
   Por defecto audita: index.html + todos los componentes
   ============================================================== */

const fs = require('fs');
const path = require('path');

// Etiquetas auto-cerrables en HTML5 y SVG (no requieren cierre)
const SELF_CLOSING = new Set([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr',
  'path','circle','rect','line','polyline','polygon',
  'ellipse','use','stop','animate','animatetransform',
  'animatemotion','set','marker','clippath','mask',
  'mp4track','!DOCTYPE'
]);

function audit(html, label) {
  let errors = [];
  let warnings = [];

  console.log(`\n══════ ${label} ══════\n`);

  // 1. IDs duplicados
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((id,i) => ids.indexOf(id) !== i);
  const uniqueDup = [...new Set(dup)];
  if (uniqueDup.length) {
    errors.push('IDs duplicados: ' + uniqueDup.join(', '));
  } else {
    console.log('  ✅ IDs únicos');
  }

  // 2. Balance de etiquetas
  // Opening tags: <tag | <tag> (pero no </tag)
  const openTags = [...html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)[\s>]/g)].map(m => m[1]);
  // Closing tags: </tag>
  const closeTags = [...html.matchAll(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g)].map(m => m[1]);

  const openCount = {};
  for (const t of openTags) {
    const lower = t.toLowerCase();
    if (SELF_CLOSING.has(lower)) continue;
    openCount[t] = (openCount[t] || 0) + 1;
  }

  const closeCount = {};
  for (const t of closeTags) {
    closeCount[t] = (closeCount[t] || 0) + 1;
  }

  let balOk = true;
  const allTagNames = new Set([...Object.keys(openCount), ...Object.keys(closeCount)]);
  for (const t of allTagNames) {
    const o = openCount[t] || 0;
    const c = closeCount[t] || 0;
    if (o !== c) {
      balOk = false;
      errors.push(t + ': ' + o + ' abiertas vs ' + c + ' cerradas');
    }
  }
  if (balOk) console.log('  ✅ Etiquetas balanceadas');

  // 3. data-i18n con contenido vacío
  const i18nEmpty = [...html.matchAll(/data-i18n="([^"]*)"[^>]*><\//g)].map(m => m[1]);
  if (i18nEmpty.length) {
    warnings.push('data-i18n sin texto visible: ' + i18nEmpty.join(', '));
  }

  // 4. Imágenes sin alt
  const imgs = [...html.matchAll(/<img[^>]+>/g)];
  const sinAlt = imgs.filter(i => !i[0].includes('alt='));
  if (sinAlt.length) {
    errors.push(sinAlt.length + ' img sin atributo alt');
  } else if (imgs.length) {
    console.log('  ✅ Imágenes con alt');
  }

  // 5. Botones sin aria-label
  const btns = [...html.matchAll(/<button[^>]+>/g)];
  const sinAria = btns.filter(b => !b[0].includes('aria-label'));
  if (sinAria.length) {
    warnings.push(sinAria.length + ' botón(es) sin aria-label');
  }

  // 6. Paréntesis balanceados en scripts
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (let i = 0; i < scripts.length; i++) {
    const code = scripts[i][1];
    const pOpen = (code.match(/\(/g) || []).length;
    const pClose = (code.match(/\)/g) || []).length;
    if (pOpen !== pClose) {
      errors.push('Script ' + i + ': ' + pOpen + ' paréntesis abiertos vs ' + pClose + ' cerrados');
    }
  }

  // Resultado
  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n  ✅ TODO OK');
  } else {
    for (const e of errors) console.log('\n  ❌ ' + e);
    for (const w of warnings) console.log('\n  ⚠️  ' + w);
  }

  return { errors, warnings };
}

/* ─── Main ──────────────────────────────────────────────────── */
const baseDir = path.resolve(__dirname, '..');
const defaultFiles = [
  path.join(baseDir, 'index.html'),
  path.join(baseDir, 'components', 'navbar.html'),
  path.join(baseDir, 'components', 'hero.html'),
  path.join(baseDir, 'components', 'about.html'),
  path.join(baseDir, 'components', 'footer.html'),
];

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map(f => path.resolve(f))
  : defaultFiles;

let totalErrors = 0;
let totalWarnings = 0;

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`\n⚠️  ${path.relative(baseDir, f)} — no existe, se salta`);
    continue;
  }
  const html = fs.readFileSync(f, 'utf8');
  const label = path.relative(baseDir, f);
  const result = audit(html, label);
  totalErrors += result.errors.length;
  totalWarnings += result.warnings.length;
}

console.log(`\n══════ TOTAL: ${totalErrors} errores, ${totalWarnings} advertencias ══════`);
process.exit(totalErrors > 0 ? 1 : 0);