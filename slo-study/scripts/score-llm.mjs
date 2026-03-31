/**
 * score-llm.mjs
 *
 * Evaluates D4 (scope), D5 (assessability), D6 (NFQ calibration) for each LO
 * using the OpenAI API (GPT-4o-mini by default).
 *
 * Each LO produces one evaluation triple per dimension:
 *   { score: 0–3, rationale: string, model: string }
 *
 * Reads:  slo-study/data/mu-los-raw.json
 * Writes: slo-study/data/scored-llm-openai.json  (incremental — safe to resume)
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node slo-study/scripts/score-llm.mjs
 *   OPENAI_API_KEY=sk-... node slo-study/scripts/score-llm.mjs --full
 *   OPENAI_API_KEY=sk-... node slo-study/scripts/score-llm.mjs --pilot 50
 *   OPENAI_API_KEY=sk-... node slo-study/scripts/score-llm.mjs --dept "COMPUTER SCIENCE"
 *
 * Environment variables:
 *   OPENAI_API_KEY  — required
 *   OPENAI_MODEL    — optional, default: gpt-4o-mini
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA  = join(__dir, '..', 'data');

// ── Config ────────────────────────────────────────────────────────────────────
const MODEL      = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const API_KEY    = process.env.OPENAI_KEY ?? process.env.OPENAI_API_KEY;
const OUT_FILE   = join(DATA, `scored-llm-openai.json`);

// Parse CLI flags
const args       = process.argv.slice(2);
const fullRun    = args.includes('--full');
const pilotIdx   = args.indexOf('--pilot');
const deptIdx    = args.indexOf('--dept');
const PILOT_N    = pilotIdx >= 0 ? parseInt(args[pilotIdx + 1], 10) : (fullRun ? null : 50);
const DEPT_FILTER = deptIdx >= 0 ? args[deptIdx + 1] : null;

const RATE_LIMIT_RPM = 500;   // gpt-4o-mini: 500 RPM on tier 1
const DELAY_MS       = Math.ceil(60_000 / RATE_LIMIT_RPM); // ~120ms between calls

if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY not set.\nUsage: OPENAI_API_KEY=sk-... node slo-study/scripts/score-llm.mjs');
  process.exit(1);
}

const client = new OpenAI({ apiKey: API_KEY });

// ── Load data ─────────────────────────────────────────────────────────────────
const { records: allRecords } = JSON.parse(readFileSync(join(DATA, 'mu-los-raw.json'), 'utf8'));

let records = allRecords;
if (DEPT_FILTER) {
  records = records.filter(r => r.departmentName?.toUpperCase() === DEPT_FILTER.toUpperCase());
  console.log(`Filtered to department "${DEPT_FILTER}": ${records.length} LOs`);
}
if (PILOT_N) {
  records = records.slice(0, PILOT_N);
}

// Load existing results (resume support)
let existing = {};
if (existsSync(OUT_FILE)) {
  const saved = JSON.parse(readFileSync(OUT_FILE, 'utf8'));
  for (const r of saved.records) existing[r.loId] = r;
  console.log(`Resuming: ${Object.keys(existing).length} already scored`);
}

const todo = records.filter(r => !existing[r.loId]);
console.log(`\nModel: ${MODEL}`);
console.log(`Mode:  ${PILOT_N ? `pilot (${PILOT_N} LOs)` : DEPT_FILTER ? `dept filter` : 'full run'}`);
console.log(`To score: ${todo.length} LOs  |  Already done: ${Object.keys(existing).length}`);

if (todo.length === 0) {
  console.log('Nothing to do — all LOs already scored.');
  process.exit(0);
}

// ── NFQ descriptions ──────────────────────────────────────────────────────────
const NFQ_DESC = {
  6: 'Level 6 — Demonstrate knowledge and comprehension; apply standard methods in familiar contexts.',
  7: 'Level 7 — Apply and analyse; make judgments in familiar contexts; some autonomy.',
  8: 'Level 8 — Synthesise, evaluate, and create; make judgments in novel or complex contexts.',
  9: 'Level 9 — Generate new knowledge; critical evaluation of complex and unpredictable problems.',
};

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(rec) {
  const nfqDesc = NFQ_DESC[rec.nfqLevel] ?? `Level ${rec.nfqLevel ?? 'unknown'} — level not determined.`;
  const workload = rec.credits ? `${rec.credits} ECTS (approx ${rec.credits * 25} hours student workload)` : 'unknown';
  // Truncate module content to ~200 words
  const content = rec.moduleContent
    ? rec.moduleContent.split(/\s+/).slice(0, 200).join(' ') + (rec.moduleContent.split(/\s+/).length > 200 ? '…' : '')
    : 'Not provided.';

  return `You are evaluating the quality of a learning outcome (LO) written for a university module.

MODULE CONTEXT:
- Module: ${rec.moduleCode} — ${rec.moduleName}
- Department: ${rec.departmentName}
- Credits: ${workload}
- NFQ Level: ${nfqDesc}
- Module descriptor: ${content}

LEARNING OUTCOME TO EVALUATE (LO ${rec.loIndex}):
"${rec.loText}"

Evaluate this LO on THREE dimensions. Think step by step for each, then give your score.

---
D4 — SCOPE APPROPRIATENESS
Does the outcome sit at the right level for this module — not a micro-task (too narrow) nor a programme-level goal (too broad)?
0 = Sub-task or programme-level goal — wrong granularity
1 = Plausible scope but imprecise — could be narrower or broader without contradiction
2 = Module-appropriate scope — clearly a single assessable outcome for this credit weight
3 = Precisely calibrated — scope matches module content and credit weight exactly

D5 — ASSESSABILITY SIGNAL
Can you picture a specific, valid assessment for this outcome? Score independently of D4 — assume the best plausible reading of the verb.
0 = No plausible assessment — describes a state, not a performance
1 = An assessment can be imagined but requires significant reinterpretation
2 = A clear assessment method is implied (exam question, lab task, report, presentation)
3 = Outcome directly signals a specific assessment approach, including context or artefact

D6 — NFQ LEVEL CALIBRATION
Is the cognitive complexity appropriate for NFQ ${rec.nfqLevel ?? '?'}?
0 = Substantial mismatch — e.g. recall-level on NFQ 8, or unrealistic synthesis on NFQ 6
1 = Mild mismatch — one level below or above expected complexity
2 = Consistent with NFQ level
3 = Precisely calibrated — complexity matches both the NFQ level and the module context

---
Respond with ONLY valid JSON in exactly this format:
{
  "d4": { "score": <0-3>, "rationale": "<one sentence>" },
  "d5": { "score": <0-3>, "rationale": "<one sentence>" },
  "d6": { "score": <0-3>, "rationale": "<one sentence>" }
}`;
}

// ── Call OpenAI ───────────────────────────────────────────────────────────────
async function scoreLO(rec) {
  const prompt = buildPrompt(rec);

  const response = await client.chat.completions.create({
    model:       MODEL,
    messages:    [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens:  300,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  const parsed = JSON.parse(raw);

  // Validate structure
  for (const dim of ['d4', 'd5', 'd6']) {
    if (!parsed[dim] || typeof parsed[dim].score !== 'number') {
      throw new Error(`Invalid response structure for ${dim}: ${raw}`);
    }
    parsed[dim].score = Math.max(0, Math.min(3, Math.round(parsed[dim].score)));
  }

  return {
    loId:           rec.loId,
    moduleCode:     rec.moduleCode,
    departmentName: rec.departmentName,
    facultyName:    rec.facultyName,
    ugPg:           rec.ugPg,
    nfqLevel:       rec.nfqLevel,
    credits:        rec.credits,
    loIndex:        rec.loIndex,
    loText:         rec.loText,
    model:          MODEL,
    d4:             { ...parsed.d4, model: MODEL },
    d5:             { ...parsed.d5, model: MODEL },
    d6:             { ...parsed.d6, model: MODEL },
    usage:          response.usage,
  };
}

// ── Main loop ─────────────────────────────────────────────────────────────────
function save() {
  const all = [...Object.values(existing)];
  writeFileSync(OUT_FILE, JSON.stringify({
    generated:    new Date().toISOString(),
    model:        MODEL,
    totalRecords: all.length,
    records:      all,
  }, null, 2));
}

let done = 0, errors = 0;
let totalInputTokens = 0, totalOutputTokens = 0;
const startTime = Date.now();

console.log('\nStarting...\n');

for (const rec of todo) {
  try {
    const result = await scoreLO(rec);
    existing[rec.loId] = result;
    totalInputTokens  += result.usage?.prompt_tokens    ?? 0;
    totalOutputTokens += result.usage?.completion_tokens ?? 0;
    done++;

    if (done % 10 === 0 || done === todo.length) {
      const elapsed  = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate     = (done / ((Date.now() - startTime) / 60000)).toFixed(1);
      const estCost  = ((totalInputTokens / 1e6) * 0.15) + ((totalOutputTokens / 1e6) * 0.60);
      console.log(`  [${done}/${todo.length}] ${elapsed}s | ${rate} LOs/min | ~$${estCost.toFixed(4)} so far`);
      save();
    }
  } catch (err) {
    errors++;
    console.error(`  ERROR [${rec.loId}]: ${err.message}`);
    existing[rec.loId] = {
      loId: rec.loId, moduleCode: rec.moduleCode, loText: rec.loText,
      error: err.message, model: MODEL,
      d4: null, d5: null, d6: null,
    };
    if (errors > 20) { console.error('Too many errors — stopping.'); break; }
  }

  // Rate limiting
  await new Promise(r => setTimeout(r, DELAY_MS));
}

save();

// ── Final summary ─────────────────────────────────────────────────────────────
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const finalCost = ((totalInputTokens / 1e6) * 0.15) + ((totalOutputTokens / 1e6) * 0.60);

console.log(`\n── Complete ─────────────────────────────────────────────────`);
console.log(`  Scored:        ${done}`);
console.log(`  Errors:        ${errors}`);
console.log(`  Time:          ${elapsed}s`);
console.log(`  Input tokens:  ${totalInputTokens.toLocaleString()}`);
console.log(`  Output tokens: ${totalOutputTokens.toLocaleString()}`);
console.log(`  Actual cost:   ~$${finalCost.toFixed(4)} (${MODEL})`);
console.log(`  Written →      ${OUT_FILE}`);

// Print sample results
const sample = Object.values(existing).filter(r => r.d4).slice(0, 3);
if (sample.length) {
  console.log('\n── Sample results ───────────────────────────────────────────');
  for (const r of sample) {
    console.log(`\n  [${r.moduleCode} LO${r.loIndex}] ${r.loText.slice(0, 70)}`);
    console.log(`    D4 (scope):       ${r.d4.score}/3 — ${r.d4.rationale}`);
    console.log(`    D5 (assessable):  ${r.d5.score}/3 — ${r.d5.rationale}`);
    console.log(`    D6 (NFQ level):   ${r.d6.score}/3 — ${r.d6.rationale}`);
  }
}
