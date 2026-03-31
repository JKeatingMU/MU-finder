/**
 * extract-mu-los.mjs
 *
 * Reads public/data/modules.json, flattens all learning outcomes into a
 * structured per-LO dataset, and writes slo-study/data/mu-los-raw.json.
 *
 * Each record: one LO, with its module context.
 * NFQ level is derived from UG_PG + yearOfStudy (no explicit field in source data).
 *
 * Usage: node slo-study/scripts/extract-mu-los.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..', '..');

// ── NFQ derivation ────────────────────────────────────────────────────────────
// MU modules have no explicit NFQ field. We derive a proxy:
//   Postgraduate            → NFQ 9 (Master's / PG Diploma level)
//   Undergraduate year 1    → NFQ 7 (introductory Honours Bachelor content)
//   Undergraduate year 2–4  → NFQ 8 (Honours Bachelor)
//   Unknown / no year       → null
function deriveNfq(ugpg, yearOfStudy) {
  if (ugpg === 'Postgraduate') return 9;
  if (ugpg === 'Undergraduate') {
    const y = parseInt(yearOfStudy, 10);
    if (y === 1) return 7;
    if (y >= 2) return 8;
    return 8; // UG but year unknown — assume honours level
  }
  return null;
}

// ── Load source data ──────────────────────────────────────────────────────────
const raw = JSON.parse(readFileSync(join(ROOT, 'public/data/modules.json'), 'utf8'));
const modules = raw.modules;

console.log(`Source: ${modules.length} modules, generated ${raw.generated}`);

// ── Flatten ───────────────────────────────────────────────────────────────────
const records = [];
let skippedEmpty = 0;
let skippedWhitespace = 0;

for (const mod of modules) {
  const los = mod.learningOutcomes;
  if (!los || los.length === 0) { skippedEmpty++; continue; }

  const nfqLevel = deriveNfq(mod.UG_PG, mod.yearOfStudy);

  for (let i = 0; i < los.length; i++) {
    const raw = los[i];
    if (!raw || raw.trim().length === 0) { skippedWhitespace++; continue; }

    records.push({
      loId:           `${mod.moduleCode}_LO${i + 1}`,
      moduleCode:     mod.moduleCode,
      moduleName:     mod.moduleName,
      departmentName: mod.departmentName,
      facultyName:    mod.facultyName,
      ugPg:           mod.UG_PG,
      yearOfStudy:    mod.yearOfStudy ?? null,
      credits:        mod.credits ?? null,
      nfqLevel:       nfqLevel,
      loIndex:        i + 1,
      loText:         raw.trim(),
      moduleContent:  mod.moduleContent ? mod.moduleContent.trim() : null,
    });
  }
}

// ── Summary stats ─────────────────────────────────────────────────────────────
const byFaculty = {};
const byUgPg = {};
const loCountsPerModule = {};

for (const r of records) {
  const fac = r.facultyName || 'Unknown';
  byFaculty[fac] = (byFaculty[fac] || 0) + 1;
  byUgPg[r.ugPg] = (byUgPg[r.ugPg] || 0) + 1;
  loCountsPerModule[r.moduleCode] = (loCountsPerModule[r.moduleCode] || 0) + 1;
}

const counts = Object.values(loCountsPerModule);
const avg = (counts.reduce((s, n) => s + n, 0) / counts.length).toFixed(2);
const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, '9+': 0 };
for (const c of counts) {
  if (c >= 9) dist['9+']++;
  else dist[c]++;
}

console.log('\n── Extraction complete ──────────────────────────────────────');
console.log(`  Total LO records:         ${records.length}`);
console.log(`  Modules with LOs:         ${Object.keys(loCountsPerModule).length}`);
console.log(`  Modules with no LOs:      ${skippedEmpty}`);
console.log(`  Empty LO strings skipped: ${skippedWhitespace}`);
console.log(`  Avg LOs per module:       ${avg}`);
console.log('\n  LOs per module distribution:');
for (const [k, v] of Object.entries(dist)) {
  console.log(`    ${k} LO${k === '1' ? ' ' : 's'}: ${v} modules`);
}
console.log('\n  By faculty:');
for (const [f, n] of Object.entries(byFaculty).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${n.toString().padStart(5)}  ${f}`);
}
console.log('\n  By UG/PG:');
for (const [k, v] of Object.entries(byUgPg)) {
  console.log(`    ${v.toString().padStart(5)}  ${k}`);
}

// ── Write output ──────────────────────────────────────────────────────────────
const output = {
  generated:    new Date().toISOString(),
  totalRecords: records.length,
  records,
};

const outPath = join(__dir, '..', 'data', 'mu-los-raw.json');
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n  Written → ${outPath}`);
