/**
 * score-rule-based.mjs
 *
 * Applies rule-based scoring for D1, D2, and D3 to each LO in mu-los-raw.json.
 * Each dimension produces an evaluation triple: { score, rationale, flags }.
 *
 * D1 — Verb observability      (0–3): tier of the leading action verb
 * D2 — Behavioral singularity  (0–3): how many distinct behaviors in one LO
 * D3 — Student-centeredness    (0–3): grammatical subject / framing
 *
 * Output: slo-study/data/scored-rule-based.json
 *
 * Usage: node slo-study/scripts/score-rule-based.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA  = join(__dir, '..', 'data');

// ── Load inputs ───────────────────────────────────────────────────────────────
const { records } = JSON.parse(readFileSync(join(DATA, 'mu-los-raw.json'), 'utf8'));
const lexicon     = JSON.parse(readFileSync(join(DATA, 'verb-lexicon.json'), 'utf8'));

// ── Build verb lookup map  (verb → tier number) ───────────────────────────────
// Entries with parenthetical qualifiers like "select (passively)" → strip qualifier
// for the primary lookup; qualifiers are handled by context-dependent logic.
const verbTier = {};
for (const [tierStr, tierData] of Object.entries(lexicon.tiers)) {
  const tier = parseInt(tierStr, 10);
  for (const verb of tierData.verbs) {
    const clean = verb.replace(/\s*\(.*\)/, '').trim().toLowerCase();
    verbTier[clean] = tier;
  }
}

// Context-dependent verb defaults (for flagging)
const contextVerbs = {};
for (const [verb, data] of Object.entries(lexicon.contextDependentVerbs.verbs)) {
  contextVerbs[verb.toLowerCase()] = data;
}

// Instructor-centered patterns → D3 score 0
const instrPatterns = lexicon.instructorCenteredPatterns.patterns.map(p => p.toLowerCase());

// ── D1: Verb observability ────────────────────────────────────────────────────
// Strategy:
//   1. Strip leading "To " / "to "
//   2. Try multi-word Tier 0 phrases first (longest-match)
//   3. Extract first token as candidate verb
//   4. Look up in verbTier map

// Multi-word verbs (all tiers, sorted longest-first for greedy matching)
const multiWordVerbs = Object.entries(lexicon.tiers)
  .flatMap(([tier, data]) => data.verbs.filter(v => v.includes(' ')).map(v => ({ verb: v, tier: parseInt(tier) })))
  .sort((a, b) => b.verb.length - a.verb.length);

const adverbBoost   = new Set(lexicon.adverbModifiers.criticallyBoost);
const adverbStyle   = new Set(lexicon.adverbModifiers.styleOnly);
const nonVerbTokens = new Set(lexicon.cleaningPatterns.nonVerbOpenings);
const irishWords    = new Set(lexicon.cleaningPatterns.irishLanguageIndicators);

// Noun/adjective openers that indicate a malformed LO (no action verb)
const nounOpeners = new Set([
  'understanding', 'ability', 'knowledge', 'development', 'learning',
  'skills', 'competence', 'awareness', 'capacity', 'analytical',
  'appreciation', 'mastery', 'familiarity', 'competency', 'proficiency',
  'critical', 'creativity', 'evidence', 'relationships', 'emotions',
  'wellbeing', 'citizenship', 'diversity', 'teaching', 'evaluation',
  'production', 'analytical', 'global', 'successful', 'effective',
  'broad', 'coherent', 'basic', 'overarching', 'detailed',
]);

// Past tense / participle suffixes that indicate wrong-tense LO writing
const pastTensePattern = /(?:ed|en|ing)$/;
// Specific wrong-tense verb forms seen in corpus
const wrongTenseVerbs = new Set([
  'developed', 'demonstrated', 'working', 'practised', 'applying',
  'explored', 'conducting', 'reflecting', 'reconstructing', 'supporting',
  'examined', 'reviewed', 'honed', 'deepened', 'refined', 'begun',
  'enhanced', 'increased', 'demonstrated', 'learnt',
]);

// Numbering prefix regexes for data-artefact detection
const numberingRegexes = lexicon.cleaningPatterns.numberingPrefixes.map(p => new RegExp(p, 'i'));

function cleanLoText(raw) {
  let text = raw.trim();
  // Strip numbering prefixes (e.g. "Lo 1.", "i.", "3.")
  for (const re of numberingRegexes) {
    text = text.replace(re, '');
  }
  return text.trim();
}

function detectIrish(text) {
  const lower = text.toLowerCase();
  return [...irishWords].some(w => lower.startsWith(w) || lower.includes(' ' + w + ' '));
}

function extractLeadingVerb(loText) {
  let text = cleanLoText(loText).toLowerCase();

  // Strip "To " / "to be able to " infinitive openers
  if (text.startsWith('to be able to ')) text = text.slice(14);
  else if (text.startsWith('to '))          text = text.slice(3);

  // Strip "be able to " pattern
  if (text.startsWith('be able to ')) text = text.slice(11);

  // Strip "students will (be able to)?" pattern — D1 should score the action verb
  const studentsMatch = text.match(/^students\s+(?:will\s+)?(?:be\s+able\s+to\s+)?(.+)/);
  if (studentsMatch) text = studentsMatch[1];

  // Try multi-word verb matches (greedy, longest first)
  for (const { verb, tier } of multiWordVerbs) {
    const clean = verb.replace(/\s*\(.*\)/, '').trim();
    if (text.startsWith(clean + ' ') || text === clean) {
      return { verb: clean, isMultiWord: true, adverbModifier: null, adverbBoostApplied: false };
    }
  }

  // Get first token
  let firstToken = text.split(/\s+/)[0].replace(/[^a-z]/g, '');

  // "have [past-participle]" — strip "have" and use the participle form
  // e.g. "have identified X" → score "identified" (which maps to "identify"-like T1)
  if (firstToken === 'have') {
    const rest = text.slice(4).trim();
    const nextToken = rest.split(/\s+/)[0].replace(/[^a-z]/g, '');
    return {
      verb: nextToken || 'have',
      isMultiWord: false,
      adverbModifier: 'have',
      adverbBoostApplied: false,
    };
  }

  // "be [adjective]" competency framing — treat as T1 (observable but indirect)
  if (firstToken === 'be') {
    return {
      verb: 'be',
      isMultiWord: false,
      adverbModifier: null,
      adverbBoostApplied: false,
    };
  }

  // Check for adverb modifier — extract the following verb
  if (adverbBoost.has(firstToken) || adverbStyle.has(firstToken)) {
    const rest = text.slice(firstToken.length).trim();
    const nextToken = rest.split(/\s+/)[0].replace(/[^a-z]/g, '');
    return {
      verb:                nextToken || firstToken,
      isMultiWord:         false,
      adverbModifier:      firstToken,
      adverbBoostApplied:  adverbBoost.has(firstToken),
    };
  }

  return { verb: firstToken, isMultiWord: false, adverbModifier: null, adverbBoostApplied: false };
}

function scoreD1(loText) {
  // Irish language detection — flag and skip scoring
  if (detectIrish(loText)) {
    return {
      score:     null,
      verb:      null,
      tier:      null,
      rationale: 'Irish language LO detected — not scored by English verb lexicon.',
      flags:     ['irish-language'],
    };
  }

  const { verb, isMultiWord, adverbModifier, adverbBoostApplied } = extractLeadingVerb(loText);

  // Non-verb opening — data artefact or unfixable framing
  if (!verb || nonVerbTokens.has(verb)) {
    return {
      score:     null,
      verb:      verb || '',
      tier:      null,
      rationale: `Opening token '${verb}' is not an action verb — possible data artefact or unusual framing. Requires manual review.`,
      flags:     ['non-verb-opening'],
    };
  }

  // Noun/adjective phrase opener — LO describes a capability state rather than an action
  if (nounOpeners.has(verb)) {
    return {
      score:     null,
      verb:      verb,
      tier:      null,
      rationale: `LO opens with a noun or adjective ('${verb}') rather than an action verb. This describes a capability or attribute rather than an observable performance — a structural writing defect. Requires rewriting with an action verb.`,
      flags:     ['no-action-verb'],
    };
  }

  // Wrong-tense verb form — LO written in past tense or as gerund rather than imperative
  if (wrongTenseVerbs.has(verb)) {
    return {
      score:     null,
      verb:      verb,
      tier:      null,
      rationale: `LO opens with a past tense or participial form ('${verb}') rather than the imperative form required by OBE convention (e.g. 'develop' not 'developed', 'apply' not 'applying'). Content may be scoreable after correction.`,
      flags:     ['wrong-tense'],
    };
  }

  // "be" competency framing — treat as T1 (observable state, unclear assessment method)
  if (verb === 'be') {
    return {
      score:     1,
      verb:      'be',
      tier:      1,
      rationale: `LO uses a competency framing ('Be [adjective]...') which describes a state of capability rather than an active performance. Observable in principle but assessment method is not implied. Equivalent to Tier 1 (weak observable).`,
      flags:     ['competency-framing'],
    };
  }

  let tier = verbTier[verb];

  if (tier === undefined) {
    return {
      score:     null,
      verb:      verb,
      tier:      null,
      rationale: `Leading verb '${verb}' not found in lexicon — requires manual review.`,
      flags:     ['unknown-verb'],
    };
  }

  // Apply 'critically' tier boost (+1, capped at 3)
  let boosted = false;
  if (adverbBoostApplied && tier < 3) {
    tier = tier + 1;
    boosted = true;
  }

  const rationales = {
    0: `The verb '${verb}' is an unobservable internal state (Tier 0, Mager 1975). It describes a mental condition rather than an observable performance and cannot be directly assessed.`,
    1: `The verb '${verb}' is weakly observable (Tier 1). It implies an assessable output but is insufficiently specific to determine the assessment method without additional context.`,
    2: `The verb '${verb}' is clearly observable (Tier 2). It directly implies an assessable performance and a clear assessment method.`,
    3: `The verb '${verb}' is precise and contextually specific (Tier 3). It specifies a high-level performance that implies both the action and the expected artefact or product.`,
  };

  const boostNote = boosted ? ` Tier boosted from ${tier - 1} to ${tier} by 'critically' qualifier (higher-order cognitive demand, Anderson & Krathwohl 2001).` : '';

  const flags = [];
  if (verb in contextVerbs)  flags.push('context-dependent');
  if (isMultiWord)            flags.push('multi-word-verb');
  if (adverbModifier)         flags.push(`adverb:${adverbModifier}`);
  if (boosted)                flags.push('critically-boosted');

  return {
    score:     tier,
    verb:      adverbModifier ? `${adverbModifier} ${verb}` : verb,
    tier:      tier,
    rationale: rationales[tier] + boostNote,
    flags,
  };
}

// ── D2: Behavioral singularity ────────────────────────────────────────────────
// Count distinct action verbs in the LO by:
//   - splitting on " and ", " or ", "; " and ", "
//   - extracting the first word of each clause
//   - checking if it's a known verb

function countBehaviors(loText) {
  let text = loText.trim().toLowerCase();
  if (text.startsWith('to ')) text = text.slice(3);

  // Split on coordination conjunctions and punctuation between clauses
  const clauses = text.split(/\s+and\s+|\s+or\s+|;\s*|,\s+(?=[a-z]+\s)/);
  const verbs = [];

  for (const clause of clauses) {
    const word = clause.trim().split(/\s+/)[0].replace(/[^a-z]/g, '');
    if (word && verbTier[word] !== undefined) {
      if (!verbs.includes(word)) verbs.push(word);
    }
  }

  return { count: Math.max(verbs.length, 1), verbs };
}

function scoreD2(loText) {
  const { count, verbs } = countBehaviors(loText);

  const scores = { 1: 3, 2: 2, 3: 1 };
  const score = count >= 4 ? 0 : (scores[count] ?? 0);

  const rationales = {
    3: `Single observable behavior ('${verbs[0]}'). LO is focused and directly assessable as a unit.`,
    2: `Two behaviors detected (${verbs.map(v => `'${v}'`).join(', ')}). Compound LO — assessable but would benefit from splitting into two distinct outcomes.`,
    1: `Three behaviors detected (${verbs.map(v => `'${v}'`).join(', ')}). This LO conflates multiple outcomes, making individual assessment and progression tracking difficult.`,
    0: `Four or more behaviors detected (${verbs.map(v => `'${v}'`).join(', ')}). This LO is highly fragmented and should be rewritten as multiple separate outcomes.`,
  };

  return {
    score,
    behaviorCount: count,
    verbs,
    rationale: rationales[score],
    flags: count > 1 ? ['compound'] : [],
  };
}

// ── D3: Student-centeredness ──────────────────────────────────────────────────
// Checks the grammatical framing of the LO:
//   3 — Active imperative (verb-first): student performance is the subject
//   2 — "Students will [active verb]": student-centered but indirect
//   1 — Passive student: "students will be introduced to / provided with..."
//   0 — Course/module centered: "This module will / The module aims to..."

function scoreD3(loText) {
  const text = loText.trim().toLowerCase();

  // Check instructor-centered patterns first (score 0)
  for (const pattern of instrPatterns) {
    if (text.startsWith(pattern)) {
      return {
        score:     0,
        pattern:   pattern,
        rationale: `The LO is framed from the course/module perspective ('${pattern}...') rather than stating what the student will demonstrate. This is a course aim, not a learning outcome.`,
        flags:     ['instructor-centered'],
      };
    }
  }

  // Passive student patterns (score 1)
  const passivePatterns = [
    'students will be introduced to',
    'students will be provided with',
    'students will be given',
    'students will be exposed to',
    'students will gain exposure to',
    'students will receive',
    'students will have an understanding of',
    'students will have a knowledge of',
    'students will become familiar with',
  ];
  for (const p of passivePatterns) {
    if (text.startsWith(p) || text.includes(p)) {
      return {
        score:     1,
        pattern:   p,
        rationale: `The LO uses a passive construction ('${p}...'), which describes what is done to or provided for the student rather than what the student will actively demonstrate.`,
        flags:     ['passive-student'],
      };
    }
  }

  // Active student (score 2)
  const activeStudentPatterns = [
    'students will be able to',
    'students will ',
    'the student will be able to',
    'the student will ',
    'learners will ',
  ];
  for (const p of activeStudentPatterns) {
    if (text.startsWith(p)) {
      return {
        score:     2,
        pattern:   p,
        rationale: `The LO states what the student will do ('${p}...'), which is student-centered. A minor improvement would be to use the direct imperative form (verb-first) which is the convention in outcome-based education.`,
        flags:     [],
      };
    }
  }

  // "To + verb" form — acceptable but slightly indirect (score 2)
  if (text.startsWith('to ')) {
    return {
      score:     2,
      pattern:   'to [verb]',
      rationale: `The LO uses an infinitive opener ('To [verb]...'), which implies student performance. Verb-first framing is preferred in OBE convention but this is a minor issue.`,
      flags:     ['infinitive-form'],
    };
  }

  // Verb-first imperative (score 3)
  const firstWord = text.split(/\s+/)[0].replace(/[^a-z]/g, '');
  if (verbTier[firstWord] !== undefined) {
    return {
      score:     3,
      pattern:   'verb-first',
      rationale: `The LO opens with an action verb ('${firstWord}'), placing the observable student performance at the forefront. This is the preferred OBE convention (QQI 2016, Biggs & Tang 2011).`,
      flags:     [],
    };
  }

  // Unknown / ambiguous
  return {
    score:     null,
    pattern:   null,
    rationale: `Opening pattern not recognised — requires manual review. First word: '${firstWord}'.`,
    flags:     ['unknown-pattern'],
  };
}

// ── Score all records ─────────────────────────────────────────────────────────
console.log(`Scoring ${records.length} LOs across D1, D2, D3...`);

const scored = records.map(rec => {
  const d1 = scoreD1(rec.loText);
  const d2 = scoreD2(rec.loText);
  const d3 = scoreD3(rec.loText);

  // Composite rule-based score (D1+D2+D3, max 9)
  const compositeScore = (d1.score ?? 0) + (d2.score ?? 0) + (d3.score ?? 0);

  return {
    loId:         rec.loId,
    moduleCode:   rec.moduleCode,
    facultyName:  rec.facultyName,
    departmentName: rec.departmentName,
    ugPg:         rec.ugPg,
    nfqLevel:     rec.nfqLevel,
    credits:      rec.credits,
    loIndex:      rec.loIndex,
    loText:       rec.loText,
    d1, d2, d3,
    compositeScore,
  };
});

// ── Summary stats ─────────────────────────────────────────────────────────────
function avg(arr, key) {
  const vals = arr.map(r => r[key]).filter(v => v !== null && v !== undefined);
  return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(3) : 'n/a';
}

function dist(arr, key) {
  const d = {};
  for (const r of arr) {
    const v = r[key] ?? 'null';
    d[v] = (d[v] || 0) + 1;
  }
  return d;
}

const d1scores = scored.map(r => r.d1.score);
const d2scores = scored.map(r => r.d2.score);
const d3scores = scored.map(r => r.d3.score);

console.log('\n── Rule-based scoring complete ──────────────────────────────');
console.log(`  Records scored: ${scored.length}`);

console.log('\n  D1 (Verb observability) — score distribution:');
const d1dist = dist(scored.map(r => ({ d1: r.d1.score })), 'd1');
for (const [k, v] of Object.entries(d1dist).sort()) {
  const pct = ((v / scored.length) * 100).toFixed(1);
  console.log(`    Score ${k}: ${v} LOs (${pct}%)`);
}
console.log(`  D1 mean: ${avg(scored.map(r => ({ d1: r.d1.score })), 'd1')}`);

const unknownVerbs  = scored.filter(r => r.d1.flags?.includes('unknown-verb'));
const noActionVerb  = scored.filter(r => r.d1.flags?.includes('no-action-verb'));
const wrongTense    = scored.filter(r => r.d1.flags?.includes('wrong-tense'));
const irishLang     = scored.filter(r => r.d1.flags?.includes('irish-language'));
const nonVerb       = scored.filter(r => r.d1.flags?.includes('non-verb-opening'));
const boosted       = scored.filter(r => r.d1.flags?.includes('critically-boosted'));
console.log(`  Unknown verbs (not in lexicon): ${unknownVerbs.length}`);
console.log(`  No action verb (noun opener):   ${noActionVerb.length}`);
console.log(`  Wrong tense (past/participle):  ${wrongTense.length}`);
console.log(`  Irish language:                 ${irishLang.length}`);
console.log(`  Non-verb opening (artefact):    ${nonVerb.length}`);
console.log(`  'Critically' boosted:           ${boosted.length}`);

console.log('\n  D2 (Behavioral singularity) — score distribution:');
const d2dist = dist(scored.map(r => ({ d2: r.d2.score })), 'd2');
for (const [k, v] of Object.entries(d2dist).sort()) {
  const pct = ((v / scored.length) * 100).toFixed(1);
  console.log(`    Score ${k}: ${v} LOs (${pct}%)`);
}

console.log('\n  D3 (Student-centeredness) — score distribution:');
const d3dist = dist(scored.map(r => ({ d3: r.d3.score })), 'd3');
for (const [k, v] of Object.entries(d3dist).sort()) {
  const pct = ((v / scored.length) * 100).toFixed(1);
  console.log(`    Score ${k}: ${v} LOs (${pct}%)`);
}

// Tier 0 verb breakdown
const tier0 = scored.filter(r => r.d1.score === 0);
const tier0verbs = {};
for (const r of tier0) {
  const v = r.d1.verb;
  tier0verbs[v] = (tier0verbs[v] || 0) + 1;
}
const top10t0 = Object.entries(tier0verbs).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log(`\n  Tier 0 (unobservable) verbs — top 10:`);
for (const [v, n] of top10t0) {
  console.log(`    ${n.toString().padStart(5)}  "${v}"`);
}

// ── Write output ──────────────────────────────────────────────────────────────
const output = {
  generated:    new Date().toISOString(),
  totalRecords: scored.length,
  records:      scored,
};

const outPath = join(DATA, 'scored-rule-based.json');
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n  Written → ${outPath}`);
