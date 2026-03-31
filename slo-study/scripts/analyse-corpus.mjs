/**
 * analyse-corpus.mjs
 *
 * Generates a descriptive analysis of the MU LO corpus from the rule-based
 * scored dataset. Outputs to console (full report) and writes a JSON summary
 * to slo-study/data/corpus-analysis.json.
 *
 * Usage: node slo-study/scripts/analyse-corpus.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA  = join(__dir, '..', 'data');

const { records, generated } = JSON.parse(
  readFileSync(join(DATA, 'scored-rule-based.json'), 'utf8')
);
const rawData = JSON.parse(
  readFileSync(join(DATA, 'mu-los-raw.json'), 'utf8')
);

console.log(`\n${'═'.repeat(65)}`);
console.log('  MU LEARNING OUTCOME CORPUS ANALYSIS');
console.log(`  Scored data generated: ${generated}`);
console.log(`${'═'.repeat(65)}`);

// ── Helpers ───────────────────────────────────────────────────────────────────
function mean(arr) {
  const valid = arr.filter(v => v !== null && v !== undefined);
  if (!valid.length) return null;
  return valid.reduce((s, v) => s + v, 0) / valid.length;
}

function pct(n, total) {
  return ((n / total) * 100).toFixed(1) + '%';
}

function groupBy(arr, keyFn) {
  const map = {};
  for (const item of arr) {
    const k = keyFn(item) ?? 'Unknown';
    if (!map[k]) map[k] = [];
    map[k].push(item);
  }
  return map;
}

function printBar(label, val, max, width = 30) {
  const filled = Math.round((val / max) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  console.log(`  ${label.padEnd(38)} ${bar} ${val}`);
}

// ── 1. Corpus overview ────────────────────────────────────────────────────────
const totalModules = rawData.totalRecords; // not modules — LO records
const totalLOs = records.length;
const byModule = groupBy(records, r => r.moduleCode);
const moduleCount = Object.keys(byModule).length;

// Count LOs per module for distribution
const loCounts = Object.values(byModule).map(g => g.length);
const loCountDist = {};
for (const c of loCounts) {
  const key = c >= 9 ? '9+' : String(c);
  loCountDist[key] = (loCountDist[key] || 0) + 1;
}

const noLOmodules = rawData.totalRecords; // from raw file this is total LO records

console.log('\n── 1. CORPUS OVERVIEW ──────────────────────────────────────');
console.log(`  Total LOs analysed:        ${totalLOs.toLocaleString()}`);
console.log(`  Modules with LOs:          ${moduleCount.toLocaleString()}`);
console.log(`  Mean LOs per module:       ${mean(loCounts).toFixed(2)}`);
console.log(`  Min / Max LOs per module:  ${Math.min(...loCounts)} / ${Math.max(...loCounts)}`);
console.log('\n  LOs per module distribution:');
for (const k of ['1','2','3','4','5','6','7','8','9+']) {
  if (loCountDist[k]) {
    console.log(`    ${k} LO${k === '1' ? ' ' : 's'}: ${loCountDist[k]} modules (${pct(loCountDist[k], moduleCount)})`);
  }
}

// ── 2. By faculty ─────────────────────────────────────────────────────────────
const byFaculty = groupBy(records, r => r.facultyName);
console.log('\n── 2. BY FACULTY ───────────────────────────────────────────');
const facOrder = Object.entries(byFaculty).sort((a, b) => b[1].length - a[1].length);
const maxFacLOs = facOrder[0][1].length;
for (const [fac, recs] of facOrder) {
  const d1mean = mean(recs.map(r => r.d1.score)).toFixed(2);
  const d2mean = mean(recs.map(r => r.d2.score)).toFixed(2);
  const d3mean = mean(recs.map(r => r.d3.score)).toFixed(2);
  const t0count = recs.filter(r => r.d1.score === 0).length;
  console.log(`\n  ${fac}`);
  console.log(`    LOs: ${recs.length} | D1: ${d1mean} | D2: ${d2mean} | D3: ${d3mean} | Tier 0 verbs: ${t0count} (${pct(t0count, recs.length)})`);
}

// ── 3. D1 — Verb observability ────────────────────────────────────────────────
console.log('\n── 3. D1: VERB OBSERVABILITY ───────────────────────────────');
const d1groups = groupBy(records, r => String(r.d1.score ?? 'unknown'));
const d1labels = {
  '0': 'Tier 0 — Unobservable',
  '1': 'Tier 1 — Weak observable',
  '2': 'Tier 2 — Clear observable',
  '3': 'Tier 3 — Precise/contextual',
  'unknown': 'Unknown (not in lexicon)',
  'null': 'null',
};
const maxD1 = Math.max(...Object.values(d1groups).map(g => g.length));
for (const tier of ['0','1','2','3','unknown','null']) {
  if (!d1groups[tier]) continue;
  const n = d1groups[tier].length;
  printBar(`${d1labels[tier] || tier} (${pct(n, totalLOs)})`, n, maxD1);
}
console.log(`\n  Mean D1 score: ${mean(records.map(r => r.d1.score)).toFixed(3)}`);

// Top 20 most frequent verbs overall
const verbFreq = {};
for (const r of records) {
  if (r.d1.verb) verbFreq[r.d1.verb] = (verbFreq[r.d1.verb] || 0) + 1;
}
const top20 = Object.entries(verbFreq).sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log('\n  Top 20 leading verbs:');
for (const [verb, n] of top20) {
  const tier = records.find(r => r.d1.verb === verb)?.d1.tier;
  const tierStr = tier !== null && tier !== undefined ? `T${tier}` : ' ?';
  console.log(`    ${n.toString().padStart(5)}  [${tierStr}]  ${verb}`);
}

// Tier 0 verb breakdown
const tier0recs = records.filter(r => r.d1.score === 0);
const t0verbFreq = {};
for (const r of tier0recs) {
  t0verbFreq[r.d1.verb] = (t0verbFreq[r.d1.verb] || 0) + 1;
}
const tier0top = Object.entries(t0verbFreq).sort((a, b) => b[1] - a[1]);
console.log(`\n  Tier 0 (unobservable) verbs — full breakdown (${tier0recs.length} LOs, ${pct(tier0recs.length, totalLOs)}):`);
for (const [verb, n] of tier0top) {
  console.log(`    ${n.toString().padStart(5)}  "${verb}"`);
}

// ── 4. D2 — Behavioral singularity ───────────────────────────────────────────
console.log('\n── 4. D2: BEHAVIORAL SINGULARITY ───────────────────────────');
const d2groups = groupBy(records, r => String(r.d2.score ?? 'null'));
const d2labels = {
  '3': 'Score 3 — Single behavior',
  '2': 'Score 2 — Two behaviors (compound)',
  '1': 'Score 1 — Three behaviors',
  '0': 'Score 0 — Four+ behaviors',
};
const maxD2 = Math.max(...Object.values(d2groups).map(g => g.length));
for (const score of ['3','2','1','0']) {
  if (!d2groups[score]) continue;
  const n = d2groups[score].length;
  printBar(`${d2labels[score]} (${pct(n, totalLOs)})`, n, maxD2);
}
console.log(`\n  Mean D2 score: ${mean(records.map(r => r.d2.score)).toFixed(3)}`);
const compoundCount = records.filter(r => r.d2.behaviorCount > 1).length;
console.log(`  Compound LOs (2+ behaviors): ${compoundCount} (${pct(compoundCount, totalLOs)})`);

// ── 5. D3 — Student-centeredness ─────────────────────────────────────────────
console.log('\n── 5. D3: STUDENT-CENTEREDNESS ──────────────────────────────');
const d3groups = groupBy(records, r => String(r.d3.score ?? 'null'));
const d3labels = {
  '3': 'Score 3 — Verb-first (preferred OBE form)',
  '2': 'Score 2 — Student-centered (indirect)',
  '1': 'Score 1 — Passive student',
  '0': 'Score 0 — Course/module centered',
  'null': 'Unknown',
};
const maxD3 = Math.max(...Object.values(d3groups).map(g => g.length));
for (const score of ['3','2','1','0','null']) {
  if (!d3groups[score]) continue;
  const n = d3groups[score].length;
  printBar(`${d3labels[score]} (${pct(n, totalLOs)})`, n, maxD3);
}
console.log(`\n  Mean D3 score: ${mean(records.map(r => r.d3.score)).toFixed(3)}`);

const instrCentered = records.filter(r => r.d3.score === 0);
const passiveCount  = records.filter(r => r.d3.score === 1);
console.log(`  Course-centered (score 0):   ${instrCentered.length} (${pct(instrCentered.length, totalLOs)})`);
console.log(`  Passive student (score 1):   ${passiveCount.length} (${pct(passiveCount.length, totalLOs)})`);

// ── 6. Composite score distribution ──────────────────────────────────────────
console.log('\n── 6. COMPOSITE RULE-BASED SCORE (D1+D2+D3, max 9) ─────────');
const compDist = {};
for (const r of records) {
  const s = r.compositeScore ?? 'null';
  compDist[s] = (compDist[s] || 0) + 1;
}
const maxComp = Math.max(...Object.values(compDist));
for (const k of ['0','1','2','3','4','5','6','7','8','9','null']) {
  if (!compDist[k]) continue;
  printBar(`Score ${k} (${pct(compDist[k], totalLOs)})`, compDist[k], maxComp);
}
console.log(`\n  Mean composite score: ${mean(records.map(r => r.compositeScore)).toFixed(3)} / 9`);
const highQuality = records.filter(r => r.compositeScore >= 7).length;
const lowQuality  = records.filter(r => r.compositeScore <= 2).length;
console.log(`  High quality (≥7): ${highQuality} (${pct(highQuality, totalLOs)})`);
console.log(`  Low quality (≤2):  ${lowQuality} (${pct(lowQuality, totalLOs)})`);

// ── 7. By department (top 15) ─────────────────────────────────────────────────
console.log('\n── 7. MEAN COMPOSITE SCORE BY DEPARTMENT (top 15 by LO count) ──');
const byDept = groupBy(records, r => r.departmentName);
const deptStats = Object.entries(byDept).map(([dept, recs]) => ({
  dept,
  count: recs.length,
  meanD1: mean(recs.map(r => r.d1.score)),
  meanD2: mean(recs.map(r => r.d2.score)),
  meanD3: mean(recs.map(r => r.d3.score)),
  meanComposite: mean(recs.map(r => r.compositeScore)),
  tier0pct: recs.filter(r => r.d1.score === 0).length / recs.length * 100,
})).sort((a, b) => b.count - a.count).slice(0, 15);

console.log(`\n  ${'Department'.padEnd(35)} ${'LOs'.padStart(5)} ${'D1'.padStart(5)} ${'D2'.padStart(5)} ${'D3'.padStart(5)} ${'Comp'.padStart(5)} ${'T0%'.padStart(6)}`);
console.log(`  ${'─'.repeat(70)}`);
for (const d of deptStats) {
  console.log(
    `  ${d.dept.slice(0,34).padEnd(35)} ` +
    `${d.count.toString().padStart(5)} ` +
    `${(d.meanD1 ?? 0).toFixed(2).padStart(5)} ` +
    `${(d.meanD2 ?? 0).toFixed(2).padStart(5)} ` +
    `${(d.meanD3 ?? 0).toFixed(2).padStart(5)} ` +
    `${(d.meanComposite ?? 0).toFixed(2).padStart(5)} ` +
    `${d.tier0pct.toFixed(1).padStart(5)}%`
  );
}

// ── 8. UG vs PG comparison ────────────────────────────────────────────────────
console.log('\n── 8. UNDERGRADUATE vs POSTGRADUATE ────────────────────────');
const byUgPg = groupBy(records, r => r.ugPg);
for (const [level, recs] of Object.entries(byUgPg)) {
  const t0 = recs.filter(r => r.d1.score === 0).length;
  console.log(`\n  ${level} (${recs.length} LOs)`);
  console.log(`    Mean D1: ${mean(recs.map(r => r.d1.score)).toFixed(3)}  D2: ${mean(recs.map(r => r.d2.score)).toFixed(3)}  D3: ${mean(recs.map(r => r.d3.score)).toFixed(3)}  Composite: ${mean(recs.map(r => r.compositeScore)).toFixed(3)}`);
  console.log(`    Tier 0 (unobservable): ${t0} (${pct(t0, recs.length)})`);
}

// ── 9. Notable examples ───────────────────────────────────────────────────────
console.log('\n── 9. NOTABLE EXAMPLES ──────────────────────────────────────');

const best = records.filter(r => r.compositeScore === 9).slice(0, 3);
console.log('\n  Perfect score (9/9):');
for (const r of best) {
  console.log(`    [${r.moduleCode}] ${r.loText.slice(0, 100)}`);
}

const worst = records.filter(r => r.compositeScore === 0).slice(0, 3);
console.log('\n  Score 0/9:');
for (const r of worst) {
  console.log(`    [${r.moduleCode}] ${r.loText.slice(0, 100)}`);
}

const understand = records.filter(r => r.d1.verb === 'understand').slice(0, 3);
console.log(`\n  "Understand" examples (Tier 0):`);
for (const r of understand) {
  console.log(`    [${r.moduleCode}] ${r.loText.slice(0, 100)}`);
}

console.log(`\n${'═'.repeat(65)}`);

// ── Write JSON summary ────────────────────────────────────────────────────────
const summary = {
  generated: new Date().toISOString(),
  corpus: {
    totalLOs,
    moduleCount,
    meanLOsPerModule: mean(loCounts),
    loCountDistribution: loCountDist,
  },
  d1: {
    mean: mean(records.map(r => r.d1.score)),
    distribution: Object.fromEntries(
      Object.entries(d1groups).map(([k, v]) => [k, v.length])
    ),
    tier0count: tier0recs.length,
    tier0pct: tier0recs.length / totalLOs * 100,
    tier0verbs: Object.fromEntries(tier0top),
    top20verbs: top20.map(([verb, count]) => ({ verb, count, tier: records.find(r => r.d1.verb === verb)?.d1.tier })),
  },
  d2: {
    mean: mean(records.map(r => r.d2.score)),
    distribution: Object.fromEntries(
      Object.entries(d2groups).map(([k, v]) => [k, v.length])
    ),
    compoundCount,
    compoundPct: compoundCount / totalLOs * 100,
  },
  d3: {
    mean: mean(records.map(r => r.d3.score)),
    distribution: Object.fromEntries(
      Object.entries(d3groups).map(([k, v]) => [k, v.length])
    ),
    courseCenteredCount: instrCentered.length,
    passiveCount: passiveCount.length,
  },
  composite: {
    mean: mean(records.map(r => r.compositeScore)),
    distribution: compDist,
    highQualityCount: highQuality,
    lowQualityCount: lowQuality,
  },
  byFaculty: Object.fromEntries(
    Object.entries(byFaculty).map(([fac, recs]) => [fac, {
      count: recs.length,
      meanD1: mean(recs.map(r => r.d1.score)),
      meanD2: mean(recs.map(r => r.d2.score)),
      meanD3: mean(recs.map(r => r.d3.score)),
      meanComposite: mean(recs.map(r => r.compositeScore)),
      tier0pct: recs.filter(r => r.d1.score === 0).length / recs.length * 100,
    }])
  ),
  byUgPg: Object.fromEntries(
    Object.entries(byUgPg).map(([level, recs]) => [level, {
      count: recs.length,
      meanComposite: mean(recs.map(r => r.compositeScore)),
      tier0pct: recs.filter(r => r.d1.score === 0).length / recs.length * 100,
    }])
  ),
};

const outPath = join(DATA, 'corpus-analysis.json');
writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(`  Summary written → ${outPath}\n`);
