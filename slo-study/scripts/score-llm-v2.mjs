/**
 * score-llm-v2.mjs
 *
 * Policy-grounded LLM evaluator for D1–D6 across all 16 corpus institutions.
 * Uses OpenAI API (gpt-4o-mini by default). Reads OPENAI_API_KEY from .env.
 *
 * Upgrades over score-llm-claude.mjs:
 *   - System prompt contains QQI/ECTS/Cedefop/NFQ policy layer
 *   - User prompt selects per-institution guidance block by institution code
 *   - Evaluates D1–D6 (D1_verify for IRR cross-validation against NLP pipeline)
 *   - Accepts any institution's scored JSON as input (not MU-only)
 *   - Output includes institution code and d1_verify for IRR computation
 *
 * Reads:  LO-App/public/data/scored/<INST>.json
 * Writes: LO-App/public/data/scored-llm-v2/<INST>.json  (incremental — safe to resume)
 *
 * Usage (from MU-finder directory):
 *   node slo-study/scripts/score-llm-v2.mjs --inst MU
 *   node slo-study/scripts/score-llm-v2.mjs --inst MU --pilot 50
 *   node slo-study/scripts/score-llm-v2.mjs --inst ALL --pilot 30
 *
 * Flags:
 *   --inst <CODE>   Institution code (e.g. MU, DCU, UCC, ALL)
 *   --pilot <N>     Limit to first N LOs (default: 50 unless --full)
 *   --full          Run all LOs for the institution
 *   --batch <N>     LOs per API call (default: 1; recommended: 5)
 *   --model <id>    Override model (default: gpt-4o-mini)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import OpenAI from 'openai';

// Load .env from MU-finder root
config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.env') });

const __dir = dirname(fileURLToPath(import.meta.url));
// Scored NLP data lives in the app's public directory (served at /lo-browser/data/scored/)
const APP_DATA = join(__dir, '..', '..', 'LO-App', 'public', 'data');
const SCORED_DIR = join(APP_DATA, 'scored');
const OUT_DIR    = join(APP_DATA, 'scored-llm-v2');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ── CLI ───────────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const instIdx  = args.indexOf('--inst');
const pilotIdx = args.indexOf('--pilot');
const modelIdx = args.indexOf('--model');
const fullRun  = args.includes('--full');

const batchIdx  = args.indexOf('--batch');

const INST_ARG  = instIdx  >= 0 ? args[instIdx  + 1].toUpperCase() : null;
const PILOT_N   = pilotIdx >= 0 ? parseInt(args[pilotIdx + 1], 10) : (fullRun ? null : 50);
const BATCH_N   = batchIdx >= 0 ? parseInt(args[batchIdx + 1], 10) : 1;
const MODEL     = modelIdx >= 0 ? args[modelIdx + 1]
                : (process.env.OPENAI_MODEL ?? 'gpt-4o-mini');
const API_KEY   = process.env.OPENAI_API_KEY;

if (!API_KEY)   { console.error('Error: OPENAI_API_KEY not set (check .env).'); process.exit(1); }
if (!INST_ARG)  { console.error('Error: --inst <CODE> required.'); process.exit(1); }

const client = new OpenAI({ apiKey: API_KEY });

// gpt-4o-mini: 500 RPM — be conservative
const DELAY_MS = 200;

// ── NFQ level descriptors ──────────────────────────────────────────────────────
const NFQ_DESCRIPTORS = `
NFQ Level 6: Knowledge — broad general knowledge of field; Skill — demonstrate a range of standard skills; Competence — act independently in familiar contexts, limited autonomy.
NFQ Level 7: Knowledge — broad knowledge with some theoretical depth; Skill — apply range of skills to known or new contexts; Competence — some autonomy in decision-making, take responsibility for outcomes.
NFQ Level 8 (Honours Bachelor): Knowledge — detailed theoretical and conceptual knowledge; Skill — demonstrate advanced skills including synthesis, evaluation, critical analysis; Competence — act with autonomy in novel complex contexts, take initiative.
NFQ Level 9 (Masters): Knowledge — specialised knowledge at forefront of field, including research; Skill — highly developed skills including in research, analysis, and problem-solving in unpredictable contexts; Competence — act with substantial autonomy, manage complex professional activities.
NFQ Level 10 (Doctoral): Knowledge — original contribution to knowledge at forefront of field; Skill — expert research and advanced technical skills; Competence — exercise substantial authority, innovation, full autonomy in academic or professional activity.
`.trim();

// ── Policy layer (system prompt — fixed, prompt-cached) ───────────────────────
const SYSTEM_PROMPT = `You are an expert evaluator of learning outcomes (LOs) in Irish higher education. Your evaluations are grounded in the following policy framework, which defines what a well-formed LO must achieve in this jurisdiction.

## QQI Policies and Criteria for the Validation of Programmes (QP.17, 2017)
- Module LOs must be "explicitly specified" — vague or generalised statements are non-compliant.
- LOs must not be "vague, ambiguous or generalised."
- LOs must be "appropriate to award title and credit volumes."
- Minimum Intended Module Learning Outcomes (MIMLOs) are the binding specification.

## QQI Core Policies and Criteria (QP 24, 2024)
- LOs must be plainly written so that students can understand what they are expected to achieve.
- QQI's stated normative reference for LO writing guidance is Cedefop (2017).

## ECTS Users' Guide (European Commission, 2015)
- LOs describe what the learner will be able to know, understand, and do after completing a learning activity.
- LOs must describe demonstrable, observable achievement — not curriculum content coverage.
- Verbs such as "understand" and "know" are explicitly discouraged as unobservable.
- One ECTS credit corresponds to 25–30 hours of student workload — scope must be calibrated accordingly.

## Cedefop (2017) — Defining, Writing and Applying Learning Outcomes (QQI's normative reference)
- Each LO should specify a single observable behaviour using an active verb.
- Verbs should be drawn from a recognised taxonomy (e.g. Bloom's) appropriate to the cognitive level.
- LOs should be specific, measurable, and student-centred.
- Common errors: using vague verbs (know, understand, appreciate, be familiar with); writing aims or curriculum content as LOs; writing teacher-centred rather than learner-centred statements.

## NFQ Level Descriptors
${NFQ_DESCRIPTORS}

## Evaluation Rubric

D1 — VERB OBSERVABILITY TIER (for IRR against NLP pipeline)
The observability and cognitive demand of the leading action verb.
0 = Tier 0: Non-observable verb (know, understand, appreciate, be aware of, be familiar with, learn) — cannot be assessed as stated.
1 = Tier 1: Low-demand observable verb (identify, define, describe, list, name, state, recall) — assessable but cognitively undemanding.
2 = Tier 2: Mid-demand observable verb (apply, analyse, explain, compare, demonstrate, calculate, classify) — standard HE-level demand.
3 = Tier 3: High-demand observable verb (evaluate, critique, synthesise, design, create, construct, formulate, justify) — advanced cognitive demand.

D4 — SCOPE APPROPRIATENESS
Does the scope of the outcome match the NFQ level and ECTS credit volume of the module?
0 = Scope is wrong: either a micro-task (sub-step within a module) or a programme-level goal (too broad for a single module).
1 = Scope is plausible but imprecise — could be narrower or broader without contradiction.
2 = Scope is module-appropriate — a single assessable outcome at the right granularity for this credit weight.
3 = Scope is precisely calibrated — matches module content and credit weight exactly.

D5 — ASSESSABILITY SIGNAL
Can a specific, valid assessment be pictured for this outcome?
0 = No plausible assessment — the LO describes a state, disposition, or curriculum content rather than a performance.
1 = An assessment can be imagined but requires significant reinterpretation of the LO.
2 = A clear assessment method is implied (exam question, lab task, report, presentation, portfolio).
3 = The LO directly signals a specific assessment approach, including context or artefact type.

D6 — NFQ LEVEL CALIBRATION
Is the cognitive demand of this LO appropriate for the stated NFQ level?
0 = Substantial mismatch — e.g. recall-only verb on NFQ 8/9, or unrealistic demand on NFQ 6.
1 = Mild mismatch — one level below or above the expected cognitive demand for this NFQ level.
2 = Consistent with NFQ level — the cognitive demand is appropriate.
3 = Precisely calibrated — verb and content complexity match both NFQ level and module context exactly.

Respond with ONLY valid JSON in exactly this schema:
{
  "d1_verify": { "score": <0-3>, "verb": "<extracted verb or null>", "rationale": "<one sentence>" },
  "d4": { "score": <0-3>, "rationale": "<one sentence>" },
  "d5": { "score": <0-3>, "rationale": "<one sentence>" },
  "d6": { "score": <0-3>, "rationale": "<one sentence>" }
}`;

// ── Institutional context blocks ───────────────────────────────────────────────
const INST_CONTEXT = {
  MU: `Maynooth University: Action verb is mandatory — "the important word in every learning outcome is the action verb." Staff required to write LOs "appropriate to learners' level and stage." LOs should identify WHAT the student does, not HOW. Maximum 8 LOs per module enforced by system.`,

  DCU: `Dublin City University (DCU Teaching Enhancement Unit, 2023): Formula: Action Verb + Content + Context. Golden rules: always start with an action verb; use one verb per LO; be observable and/or measurable; ideally 4–6 per module. Explicitly prohibited: the verb "Understand" ("not an observable or measurable output"). Common problems: overuse of lower-level verbs (identify, describe, explain) — a mix of Bloom's levels appropriate to NFQ level is required. NFQ alignment mandatory.`,

  UCC: `University College Cork (CIRTL/Kennedy, 2023): Stem: "At the end of this module students should be able to:" Always use action verbs. Prohibited terms (explicit): know, understand, learn, be familiar with, be exposed to, be acquainted with, be aware of. LOs should range across Bloom's taxonomy levels. Module policy: 3–9 LOs per module. Programme LOs must map to NFQ level descriptors.`,

  Galway: `University of Galway (CELT, v1.4, 2024): Stem: "On successful completion of this module, the student should be able to:" Performance-oriented — "what the student can do." 4–8 LOs per module (AKARI system target: ≤5). Each LO must be capable of being assessed. ACTIVE checklist: Active, Attractive, Comprehensible, Appropriate, Attainable, Assessable, Visible, Aligned. NFQ alignment is a hard institutional requirement (QA050). Bloom's taxonomy (or SOLO or Fink) recommended but not mandated.`,

  UCD: `University College Dublin: Stem: "On completion of this module, students will be able to…" 6 Golden Rules including: use action verbs; outcomes must be observable/measurable; constructive alignment is mandatory (Biggs & Tang). LOs are "general performance indicators that guide the judgement of academic assessors rather than definitive threshold statements." Bloom's Revised Taxonomy (Anderson et al. 2001) is the primary verb-selection framework. NFQ alignment required.`,

  UL: `University of Limerick (Centre for Teaching and Learning): Bloom's Taxonomy is mandated for verb selection. Guidance warns against "vague and immeasurable outcomes." NFQ level is the primary calibration reference.`,

  ATU: `Atlantic Technological University: Bloom's Taxonomy "Learning Outcomes Game Card" — "Try to start with a verb for immediate action." Modules designed in multiples of 5 ECTS; NFQ level must be indicated. Student workload: 20–25 hours per ECTS credit.`,

  SETU: `South East Technological University: Curriculum reviews require "use of active verbs." NFQ level alignment is the primary structural requirement. QQI/NFQ joint-sectoral protocol applies.`,

  MTU: `Munster Technological University (Extended Campus): Formula: Verb + Object + Adverb + Context (SOLO taxonomy for verb level). Prohibited: overly restrictive phrasing naming specific theories, approaches, or software where alternatives would demonstrate the same competence ("gained/proved competences count, not the exact way"). Standard module: 5 ECTS.`,

  TUD: `TU Dublin: Module descriptors must include Programme Learning Outcomes mapped to NFQ award descriptor fields (Knowledge / Know-How & Skill / Competence strands). Each assessment component must map to specific LOs. No separate verb list — QQI/NFQ level descriptor language applies.`,

  DkIT: `Dundalk Institute of Technology: Stem: "On successful completion of this module the learner will be able to:" Active Bloom's verbs (Identify, Apply, Demonstrate, Evaluate). LOs must be robustly assessable. Standard module: 5 ECTS.`,

  IADT: `Institute of Art, Design and Technology: Explicitly prohibited: "know", "understand", "appreciate" — "these tend to be vague." Introductory modules: define, recall, list, describe, explain, discuss. Advanced modules: formulate, appraise, evaluate, estimate, construct. LOs mapped to QQI strands: Breadth (knowledge extent), Kind (knowledge nature), Range (skill extent). Arts/creative verbs appropriate where context supports.`,

  NCI: `National College of Ireland: LOs must reflect NFQ level complexity — "the more facts and concepts that are layered on top of each other and integrated, the higher the level." Competence selectivity: higher NFQ levels require acting "effectively and autonomously in complex or ill-defined and unpredictable situations." Knowledge/Skill/Competence strand mapping expected.`,

  NCAD: `National College of Art and Design (UCD-accredited): Uses capitalised meta-verb format (e.g. "RESEARCH: Demonstrate an expanded understanding of…") — evaluate the elaborating sentence, not the label alone. 3–5 LOs per module. Assessment mapping table required. Arts/creative verbs (formulate, construct, appraise, critique) appropriate. UCD academic framework applies.`,

  GC: `Griffith College Dublin: Uses MIMLO (Minimum Intended Module Learning Outcomes) terminology. Stem: "On successful completion of this module, learners are able to:" Active verbs mandatory. 4–6 LOs per 5 ECTS module. Each module descriptor includes rationale for contribution to programme-level MIPLOs. LOs from PDF module descriptors — "Module Objectives" section is the equivalent of "Learning Outcomes."`,

  MIE: `Marino Institute of Education (TCD-accredited): TCD Bologna Desk framework (Scattergood, 2008). LOs identify "essential knowledge and the nature of that knowledge, along with the necessary skills and attitudinal dispositions." Assessment must be "valid, reliable and equitable and aligned with programme and module learning outcomes." Teacher education context: professional disposition LOs are appropriate and expected.`,
};

const DEFAULT_CONTEXT = `This institution defers to QQI national standards: LOs must be explicitly specified, not vague or generalised, and appropriate to NFQ level and credit volume. Active verb required. Kennedy (2006) and Cedefop (2017) apply as normative references.`;

// ── Prompt builder ─────────────────────────────────────────────────────────────
function loBlock(rec, idx) {
  const nfqLabel = rec.nfqLevel ? `NFQ Level ${rec.nfqLevel}` : 'NFQ level unknown';
  const workload = rec.credits ? `${rec.credits} ECTS` : 'ECTS unknown';
  const content  = rec.moduleContent
    ? rec.moduleContent.split(/\s+/).slice(0, 100).join(' ') + (rec.moduleContent.split(/\s+/).length > 100 ? '…' : '')
    : 'Not provided.';
  return `LO ${idx + 1} [${rec.loId}]:
Module: ${rec.moduleCode ?? '?'} — ${rec.moduleName ?? '?'} | ${nfqLabel} | ${workload}
Descriptor: ${content}
Text: "${rec.loText}"`;
}

function buildUserPrompt(batch) {
  const first = batch[0];
  const instContext = INST_CONTEXT[first.institution] ?? DEFAULT_CONTEXT;
  const loBlocks = batch.map((rec, i) => loBlock(rec, i)).join('\n\n');
  const schema = batch.map((_, i) =>
    `  { "id": "${batch[i].loId}", "d1_verify": {"score":<0-3>,"verb":"<verb>","rationale":"<1 sentence>"}, "d4": {"score":<0-3>,"rationale":"<1 sentence>"}, "d5": {"score":<0-3>,"rationale":"<1 sentence>"}, "d6": {"score":<0-3>,"rationale":"<1 sentence>"} }`
  ).join(',\n');

  return `INSTITUTIONAL CONTEXT — ${first.institution}:
${instContext}

Evaluate the following ${batch.length} learning outcome(s). Return a JSON array — one object per LO in the same order.

${loBlocks}

Return ONLY a valid JSON array:
[
${schema}
]`;
}

// ── Load institution data ──────────────────────────────────────────────────────
function loadInst(code) {
  const path = join(SCORED_DIR, `${code}.json`);
  if (!existsSync(path)) {
    console.error(`No scored data found for ${code} at ${path}`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return Array.isArray(raw) ? raw : (raw.records ?? raw);
}

// ── Registry (for ALL mode) ────────────────────────────────────────────────────
function loadRegistry() {
  const path = join(APP_DATA, 'institution-registry.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const records = Array.isArray(raw) ? raw : (raw.institutions ?? raw);
  return records.filter(i => i.loCount && i.loCount > 0).map(i => i.code);
}

// ── Scoring ────────────────────────────────────────────────────────────────────
function clamp(n) { return Math.max(0, Math.min(3, Math.round(n))); }

async function scoreBatch(batch) {
  const maxOut = 300 * batch.length;
  const response = await client.chat.completions.create({
    model:       MODEL,
    max_tokens:  maxOut,
    temperature: 0,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: buildUserPrompt(batch) },
    ],
  });

  const raw      = response.choices[0].message.content.trim();
  const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed   = JSON.parse(jsonText);

  if (!Array.isArray(parsed) || parsed.length !== batch.length) {
    throw new Error(`Expected array of ${batch.length}, got: ${raw.slice(0, 200)}`);
  }

  const usage = response.usage ?? {};
  const perLO  = { input_tokens: Math.round((usage.prompt_tokens ?? 0) / batch.length),
                   output_tokens: Math.round((usage.completion_tokens ?? 0) / batch.length) };

  return batch.map((rec, i) => {
    const p = parsed[i];
    for (const dim of ['d1_verify', 'd4', 'd5', 'd6']) {
      if (!p[dim] || typeof p[dim].score !== 'number') {
        throw new Error(`Missing ${dim} for LO ${i + 1} (${rec.loId}): ${JSON.stringify(p)}`);
      }
      p[dim].score = clamp(p[dim].score);
    }
    return {
      loId:        rec.loId,
      institution: rec.institution,
      moduleCode:  rec.moduleCode,
      nfqLevel:    rec.nfqLevel,
      credits:     rec.credits,
      loIndex:     rec.loIndex,
      loText:      rec.loText,
      model:       MODEL,
      d1_nlp:      rec.d1 ?? null,
      d1_verify:   { ...p.d1_verify, model: MODEL },
      d4:          { ...p.d4,        model: MODEL },
      d5:          { ...p.d5,        model: MODEL },
      d6:          { ...p.d6,        model: MODEL },
      usage:       perLO,
    };
  });
}

// ── Run one institution ────────────────────────────────────────────────────────
async function runInst(code) {
  const outFile = join(OUT_DIR, `${code}.json`);
  let records = loadInst(code);

  if (PILOT_N) records = records.slice(0, PILOT_N);

  // Resume
  let existing = {};
  if (existsSync(outFile)) {
    const saved = JSON.parse(readFileSync(outFile, 'utf8'));
    for (const r of saved.records) {
      if (!r.error) existing[r.loId] = r;  // skip errored records so they're retried
    }
    console.log(`  Resuming ${code}: ${Object.keys(existing).length} already scored`);
  }

  const todo = records.filter(r => !existing[r.loId]);
  if (todo.length === 0) { console.log(`  ${code}: nothing to do.`); return; }

  console.log(`  ${code}: ${todo.length} to score | batch: ${BATCH_N} | model: ${MODEL}`);

  const save = () => {
    writeFileSync(outFile, JSON.stringify({
      generated:    new Date().toISOString(),
      institution:  code,
      model:        MODEL,
      batchSize:    BATCH_N,
      totalRecords: Object.keys(existing).length,
      records:      Object.values(existing),
    }, null, 2));
  };

  let done = 0, errors = 0;
  let totalIn = 0, totalOut = 0;
  const start = Date.now();

  // Split into batches
  for (let i = 0; i < todo.length; i += BATCH_N) {
    const batch = todo.slice(i, i + BATCH_N);
    try {
      const results = await scoreBatch(batch);
      for (const result of results) {
        existing[result.loId] = result;
        totalIn  += result.usage?.input_tokens  ?? 0;
        totalOut += result.usage?.output_tokens ?? 0;
        done++;
      }

      if (done % 10 === 0 || done >= todo.length) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(0);
        const rate    = (done / ((Date.now() - start) / 60000)).toFixed(1);
        // gpt-4o-mini pricing: $0.15/M input, $0.60/M output
        const cost = ((totalIn / 1e6) * 0.15) + ((totalOut / 1e6) * 0.60);
        console.log(`    [${done}/${todo.length}] ${elapsed}s | ${rate} LOs/min | ~$${cost.toFixed(4)}`);
        save();
      }
    } catch (err) {
      errors++;
      console.error(`    BATCH ERROR [${batch.map(r => r.loId).join(',')}]: ${err.message}`);
      // Mark each LO in the failed batch as errored
      for (const rec of batch) {
        existing[rec.loId] = {
          loId: rec.loId, institution: code, loText: rec.loText,
          error: err.message, model: MODEL,
          d1_verify: null, d4: null, d5: null, d6: null,
        };
      }
      if (errors > 10) { console.error('Too many batch errors — stopping.'); break; }
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  save();
  return { done, errors, totalIn, totalOut };
}

// ── Main ──────────────────────────────────────────────────────────────────────
const instCodes = INST_ARG === 'ALL' ? loadRegistry() : [INST_ARG];

console.log(`\nModel:        ${MODEL}`);
console.log(`Institution:  ${instCodes.join(', ')}`);
console.log(`Mode:         ${PILOT_N ? `pilot (${PILOT_N} LOs per institution)` : 'full run'} | batch size: ${BATCH_N}`);
console.log(`Output:       ${OUT_DIR}\n`);

let grandTotal = { done: 0, errors: 0, in: 0, out: 0 };

for (const code of instCodes) {
  console.log(`\n── ${code} ──`);
  const stats = await runInst(code);
  if (stats) {
    grandTotal.done   += stats.done;
    grandTotal.errors += stats.errors;
    grandTotal.in     += stats.totalIn;
    grandTotal.out    += stats.totalOut;
  }
}

const finalCost = ((grandTotal.in / 1e6) * 0.15) + ((grandTotal.out / 1e6) * 0.60);
console.log(`\n── Complete ──────────────────────────────────────────────────`);
console.log(`  Scored:        ${grandTotal.done}`);
console.log(`  Errors:        ${grandTotal.errors}`);
console.log(`  Input tokens:  ${grandTotal.in.toLocaleString()}`);
console.log(`  Output tokens: ${grandTotal.out.toLocaleString()}`);
console.log(`  Actual cost:   ~$${finalCost.toFixed(4)} (${MODEL})`);
