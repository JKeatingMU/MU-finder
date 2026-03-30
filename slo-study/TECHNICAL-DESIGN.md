# SLO Evaluation System — Technical Design
*John Keating, Maynooth University — SLO Study*
*Draft: 30 March 2026*

---

## The Evaluation Triple

The canonical output unit — from every evaluator type — is a **triple**:

```
( loText , score , rationale )
```

This applies uniformly across all three evaluator types:

| Evaluator | loText | score | rationale |
|---|---|---|---|
| Rule-based NLP | The original LO | Integer 0–3 per D1–D3 | Template-generated from parsed evidence |
| LLM (× 3 models) | The original LO | Integer 0–3 per D4–D6 | Chain-of-thought sentence from the model |
| Human rater | The original LO | Integer 0–3 per D1–D6 | Free-text required field in the rating app |

**Why this matters:**
- IRR analysis is richer — you can examine *why* raters disagree, not just *that* they disagree
- Rule-based decisions are as interpretable as LLM decisions — no black-box layer
- Human rationales make AI–human comparison meaningful beyond bare score correlation
- The triple is the unit of analysis in Paper 1 and enables quotable evidence for findings
- Consistent format allows a single storage schema and analysis pipeline across all evaluator types

---

## Architecture Overview

The evaluation system has two distinct, independently-defensible layers:

```
Input: LO text + module metadata
        │
        ├─── LAYER 1: Rule-Based NLP ──── D1, D2, D3 (deterministic)
        │         Returns: (loText, score, template rationale) per dimension
        │
        └─── LAYER 2: LLM × 3 ─────────── D4, D5, D6 (contextual judgment)
                  ├── Claude (claude-opus-4-6) → (loText, score, model rationale)
                  ├── GPT-4                   → (loText, score, model rationale)
                  └── Gemini                  → (loText, score, model rationale)

        Human rater app ────────────────── D1–D6 (expert judgment)
                  Returns: (loText, score, free-text rationale) per dimension

All three produce the same triple format. IRR computed within and across evaluator types.
```

The two-layer design is itself academically defensible:
- Layer 1 is **deterministic and auditable** — given the same input and lexicon, it will
  always produce the same output. Reviewers can inspect the verb lexicon and parsing rules.
- Layer 2 is **contextual and probabilistic** — requires model judgment. IRR across three
  independent LLMs is the evidence of reliability (analogous to multiple human raters).
  Follows the G-Eval methodology (Liu et al., 2023, EMNLP).
- Human raters complete the triple with expert judgment and free-text rationale,
  enabling direct AI–human comparison at both score and reasoning levels.

---

## Inputs

One record per learning outcome:

| Field | Type | Source | Notes |
|---|---|---|---|
| `loText` | string | `modules.json` → `learningOutcome1`…`8` | The LO being evaluated |
| `moduleCode` | string | `modules.json` | e.g. `CS402` |
| `moduleTitle` | string | `modules.json` | e.g. `Network Security` |
| `moduleContent` | string | `modules.json` | Module descriptor |
| `ects` | number | `modules.json` | Credit weight |
| `nfqLevel` | number | Derived | See NFQ inference table below |
| `department` | string | `modules.json` | e.g. `COMPUTER SCIENCE` |
| `faculty` | string | `modules.json` | e.g. `Faculty of Science and Engineering` |
| `caPercent` | number | `modules.json` | Continuous assessment weighting |
| `examPercent` | number | `modules.json` | Exam weighting |
| `loPosition` | number | Derived | 1–8: position in the LO set |
| `loCount` | number | Derived | Total non-empty LOs for this module |

### NFQ Level Inference

MU module data does not include NFQ level directly. Inference from programme context:

| Context | NFQ Level |
|---|---|
| Year 1–2 undergraduate | 6 |
| Year 3 undergraduate | 7 |
| Year 4 (honours) / Final year | 8 |
| Postgraduate taught | 9 |
| Postgraduate research | 10 |

Where programme year is not determinable from module data alone, use department-level
heuristics (e.g. module code numeric suffix, ECTS weight patterns).

---

## Outputs

### Per-evaluator triple

Every evaluator — rule-based, LLM, or human — produces the same structure per dimension:

```json
{
  "loText": "Students will understand the principles of network security.",
  "dimension": "d1",
  "evaluatorType": "rule-based | llm | human",
  "evaluatorId": "nlp-v1 | claude-opus-4-6 | rater-uuid",
  "score": 0,
  "rationale": "The verb 'understand' is an unobservable internal state (Tier 0, Mager 1975). It describes an internal mental condition that cannot be directly observed or assessed."
}
```

### Aggregated output record (per LO, after all evaluators)

```json
{
  "moduleCode": "CS402",
  "loPosition": 3,
  "loText": "Students will understand the principles of network security.",
  "dimensions": {
    "d1": {
      "method": "rule-based",
      "verb": "understand",
      "verbTier": 0,
      "score": 0,
      "rationale": "The verb 'understand' is an unobservable internal state (Tier 0). Cannot be directly assessed or demonstrated."
    },
    "d2": {
      "method": "rule-based",
      "verbCount": 1,
      "score": 3,
      "rationale": "Single action verb detected ('understand'). Behavioral singularity satisfied."
    },
    "d3": {
      "method": "rule-based",
      "subject": "Students",
      "score": 3,
      "rationale": "Sentence subject is 'Students' — student-centered framing confirmed."
    },
    "d4": {
      "method": "llm",
      "triples": {
        "claude":  { "score": 1, "rationale": "Scope is plausible for the module but vague verb prevents meaningful calibration to the 5-credit workload." },
        "gpt4":    { "score": 1, "rationale": "Module-level scope is implied but the outcome lacks the specificity needed to distinguish it from a programme-level goal." },
        "gemini":  { "score": 2, "rationale": "Scope is appropriate for a 5-credit module; the topic is bounded and module-level." }
      },
      "mean": 1.33,
      "kappa": 0.61
    },
    "d5": {
      "method": "llm",
      "triples": {
        "claude":  { "score": 0, "rationale": "No assessable performance is specified — 'understand' does not imply any particular assessment method." },
        "gpt4":    { "score": 0, "rationale": "The outcome describes a state rather than a performance; no valid assessment task can be directly inferred." },
        "gemini":  { "score": 1, "rationale": "A knowledge-check assessment could be constructed, though the outcome does not clearly signal one." }
      },
      "mean": 0.33,
      "kappa": 0.72
    },
    "d6": {
      "method": "llm",
      "triples": {
        "claude":  { "score": 0, "rationale": "NFQ level 8 requires evaluation/synthesis-level cognitive complexity; 'understand' maps to level 2 at best." },
        "gpt4":    { "score": 0, "rationale": "This outcome is substantially below the cognitive level expected at honours degree level (NFQ 8)." },
        "gemini":  { "score": 1, "rationale": "Mild mismatch — 'understand' is low for NFQ 8 but not entirely inappropriate for an introductory component." }
      },
      "mean": 0.33,
      "kappa": 0.58
    }
  },
  "composite": 7.0,
  "compositeNormalised": 0.39,
  "flags": ["vague_verb:understand", "assessment_gap", "level_mismatch:nfq8"],
  "suggestedRevision": "Analyse and compare network security protocols, identifying vulnerabilities and justifying mitigation strategies aligned with current threat models."
}
```

**Composite score**: D1 + D2 + D3 + mean(D4) + mean(D5) + mean(D6) → 0–18.
**Normalised**: composite / 18 → 0.0–1.0 (for cross-module comparison).

### Human rater triple (same structure, from validation app)

```json
{
  "loText": "Students will understand the principles of network security.",
  "dimension": "d1",
  "evaluatorType": "human",
  "evaluatorId": "rater-3f8a2c",
  "score": 0,
  "rationale": "The word 'understand' doesn't tell me what the student actually has to do — I couldn't write an exam question or a lab task from this."
}
```

The human rationale is free text, required (not optional). The prompt in the app
is: *"In one or two sentences, explain why you gave this score."*
This makes the triple complete and analytically equivalent across all evaluator types.

---

## Layer 1: Rule-Based NLP (D1, D2, D3)

### D1 — Verb Observability

**Method**: Extract the primary action verb from the LO, look up in tiered lexicon,
return tier as score.

**Verb extraction** (in order of preference):
1. Parse the verb following "will be able to" or "will" in "students will…"
2. Extract the first infinitive or base-form verb in the sentence
3. If no clear verb detected, score 0 and flag `no_verb_detected`

**Tiered Verb Lexicon**

Tier 0 — Unobservable (score 0):
```
understand, know, appreciate, be aware of, be familiar with, learn,
grasp, realise, realize, recognise, recognize (used as sole verb),
study, cover, explore (used vaguely), engage with, gain insight into,
be introduced to, get to grips with, have an understanding of
```

Tier 1 — Weak observable (score 1):
```
identify, describe, discuss, explain, list, name, state, define,
outline, summarise, summarize, present, show, indicate, note,
recall, report, illustrate (when not producing an illustration)
```

Tier 2 — Clear observable (score 2):
```
analyse, analyze, apply, compare, contrast, demonstrate, evaluate,
classify, differentiate, interpret, solve, calculate, use, examine,
assess, review, test, measure, translate, predict, model, map,
distinguish, relate, organise, organize, select, determine
```

Tier 3 — Precise/contextual (score 3):
```
design, construct, implement, critique, formulate, synthesise,
synthesize, derive, develop, create, justify, argue, produce,
build, generate, plan, write (a specific artefact), debug,
deploy, simulate, validate, prove, compose, adapt, optimise, optimize,
recommend (with justification), evaluate and justify, propose
```

**Notes on the lexicon**:
- Some verbs are context-dependent (e.g. "identify" is Tier 1 as a standalone but
  "identify and justify" would trigger D2 compound flag). The lexicon is the primary
  lookup; LLM confirmation is not required for D1.
- The lexicon should be versioned and published with the paper as supplementary material.
  This is essential for reproducibility.
- "Understand" used in the construction "demonstrate an understanding of X by doing Y"
  where Y is a Tier 2/3 verb should be scored on Y, not "understand".

**Template rationale generation for D1** (completing the triple):

The rule-based scorer generates a natural-language rationale from detected evidence,
not a fixed string. Templates by tier:

```
Tier 0: "The verb '{verb}' is an unobservable internal state (Tier 0, Mager 1975).
         It describes a mental condition that cannot be directly observed or assessed."

Tier 1: "The verb '{verb}' is observable in principle (Tier 1) but insufficiently
         specific — a clear assessment method cannot be directly inferred from it."

Tier 2: "The verb '{verb}' is a clear, observable action (Tier 2). A specific
         assessment method is implied."

Tier 3: "The verb '{verb}' is precise and contextually specific (Tier 3). The outcome
         strongly implies both an assessment method and an artefact or context."

No verb: "No clear action verb was detected. The outcome does not specify a
          demonstrable student performance."
```

### D2 — Behavioral Singularity

**Method**: Count action verbs in the sentence. Flag if multiple verbs are joined by
"and", "or", or comma-separated.

**Rules**:
- Count base-form or infinitive verbs in the LO sentence
- If count > 1 AND verbs are at same syntactic level (not subordinate) → D2 = 0
- If count > 1 BUT one verb is clearly subordinate/instrumental
  (e.g. "design a circuit **to demonstrate** signal processing") → D2 = 2
- If count = 1 → D2 = 3
- Partial scores: 2 verbs = 1; 3+ verbs = 0

**Scoring**:
```
1 main verb:          3
2 verbs (marginal):   1
3+ verbs:             0
Subordinate clause:   2 (judgment call — flag for human review)
```

**Template rationale generation for D2**:
```
1 verb:  "Single behavior detected ('{verb}'). Behavioral singularity satisfied."
2 verbs: "Two behaviors detected ('{v1}' and '{v2}'). Compound outcome — unclear
          which behavior is the primary assessment target."
3+ verbs: "{n} behaviors detected ('{v1}', '{v2}', '{v3}'...). Outcome bundles
           multiple independent performances — cannot be validly assessed as a unit."
Subordinate: "Main verb '{v1}' with subordinate '{v2}'. Likely a single outcome
              with an instrumental clause — flagged for human review."
```

### D3 — Student-Centeredness

**Method**: Detect the grammatical subject of the main clause.

**Student-centered patterns** (score 3):
```
"Students will..."
"On completion of this module, students will..."
"The student will be able to..."
"Learners will..."
"By the end of this module, students will..."
```

**Instructor/course-centered patterns** (score 0):
```
"This module will introduce..."
"The course covers..."
"The aim of this module is to..."
"Students will be introduced to..." (passive construction — score 1)
"Students will be provided with..."
"This module provides..."
"Students will be given..."
```

**Scoring**:
```
Active student subject + observable action:    3
Passive student construction:                  1
Course/module/instructor as subject:           0
Ambiguous:                                     1
```

**Template rationale generation for D3**:
```
Score 3: "Sentence subject is '{subject}' — active student-centered framing confirmed."
Score 1: "Passive construction detected ('{pattern}') — the student is the recipient
          of teaching rather than the agent of learning."
Score 0: "Sentence subject is '{subject}' — outcome describes what the course/module
          does, not what the student achieves."
Ambiguous: "Subject is ambiguous — flagged for human review."
```

---

## Layer 2: LLM Evaluation (D4, D5, D6)

Each dimension is evaluated independently by three LLMs using identical structured prompts.
Scores are 0–3. IRR (Cohen's Kappa per rater pair, Fleiss's Kappa across all three) is
computed per dimension.

### Prompting Strategy

Following G-Eval (Liu et al., 2023): each prompt includes:
1. **The scoring task** and dimension definition
2. **The full module context** (title, content descriptor, ECTS, NFQ level, assessment split)
3. **Explicit scoring criteria** with examples at each level
4. **Chain-of-thought instruction**: "Think step by step before giving your score"
5. **Structured output format**: score (integer 0–3) + one-sentence rationale

Template structure (same for all three LLMs, same for each run):

```
You are evaluating the quality of a learning outcome (LO) written for a university module.

MODULE CONTEXT:
- Title: {moduleTitle}
- Department: {department}
- ECTS credits: {ects} (approx {ects * 25} hours student workload)
- NFQ Level: {nfqLevel} ({nfqDescription})
- Assessment: {caPercent}% continuous assessment, {examPercent}% exam
- Module descriptor: {moduleContent}

LEARNING OUTCOME TO EVALUATE:
"{loText}"

TASK: Score this learning outcome on DIMENSION {Dx}: {dimensionName}

{dimensionDefinition}

SCORING CRITERIA:
0 — {criteria0}
1 — {criteria1}
2 — {criteria2}
3 — {criteria3}

Think step by step. Then respond with exactly:
SCORE: [0/1/2/3]
RATIONALE: [one sentence explaining your score]
```

### D4 — Scope Appropriateness

**Definition**: Does the outcome sit at the right level — neither a micro-task
(too narrow) nor a programme-level goal (too broad) — given the module's ECTS weight?

**Criteria**:
- 0: A sub-task (e.g. "adjust page layout settings") or a programme-level goal
  (e.g. "understand the discipline of computer science")
- 1: Plausible scope but imprecise — could be narrower or broader without contradiction
- 2: Module-appropriate scope — clearly sits at the level of a single assessable outcome
  within this credit weighting
- 3: Precise scope with contextual specificity — clearly calibrated to the module's
  content and credit weight, neither over- nor under-specified

### D5 — Assessability Signal

**Definition**: Can you picture a specific, valid assessment for this outcome?
A well-written outcome implies its own assessment method.

**Criteria**:
- 0: No plausible assessment can be identified — the outcome describes a state,
  not a performance
- 1: An assessment can be imagined but it would require significant reinterpretation
  of the LO
- 2: A clear assessment method is implied (e.g. an exam question, a lab task,
  a report, a presentation)
- 3: The outcome directly signals a specific assessment approach, including
  the context or artefact (e.g. "design and implement a sorting algorithm
  in Python")

**Note**: This dimension is particularly sensitive to D1 — a vague verb (Tier 0)
will almost always produce D5 = 0 or 1. The LLM should be instructed to score
D5 independently of D1 (i.e. assuming the best plausible interpretation of the verb).

### D6 — NFQ Level Calibration

**Definition**: Is the cognitive complexity of the outcome consistent with the
NFQ level of this module?

**NFQ level reference** (provide in prompt):
- Level 6: Demonstrate knowledge and comprehension; apply standard methods
- Level 7: Apply and analyse; make judgments in familiar contexts
- Level 8: Synthesise, evaluate, and create; make judgments in novel contexts
- Level 9: Generate new knowledge; critical evaluation of complex problems

**Criteria**:
- 0: Cognitive complexity is substantially mismatched — e.g. a recall-level outcome
  on an NFQ 8 module, or an unrealistic synthesis outcome on an NFQ 6 module
- 1: Mild mismatch — outcome is one level below expected complexity
- 2: Consistent with NFQ level
- 3: Precisely calibrated — cognitive complexity matches NFQ level and module context

---

## IRR Computation

### Between AI raters (D4, D5, D6)
- **Cohen's Kappa** for each rater pair: (Claude/GPT-4), (Claude/Gemini), (GPT-4/Gemini)
- **Fleiss's Kappa** across all three raters
- **Kendall's W** for ordinal agreement across raters
- Target threshold: κ ≥ 0.60 ("substantial agreement", Landis & Koch 1977) per dimension

### Between AI and human raters (validation set)
- Same metrics computed against human rater scores on the 100-LO validation set
- Report per-dimension AI–human agreement separately from AI–AI agreement
- Identify dimensions where AI and human raters systematically diverge

---

## Human Validation App

### Purpose
Generate ground-truth scores from expert human raters on a 100-LO sample, to:
1. Validate the D1–D6 rubric has adequate face and content validity
2. Measure AI–human IRR per dimension
3. Identify dimensions where automated scoring is reliable vs unreliable
4. Provide the crowdsourced human rating capability for Phase 5 (scale-up)

### 100-LO Sample Design
Deliberately stratified — NOT random:
- 20 LOs: known-high quality (EdTech 2024 "good" set + hand-selected MU examples)
- 20 LOs: known-low quality (EdTech 2024 "poor" set + MU Tier 0 verb examples)
- 20 LOs: borderline / ambiguous
- 20 LOs: discipline-diverse (Arts, Science, Social Sciences — equal spread)
- 20 LOs: level-diverse (NFQ 6, 7, 8, 9 — equal spread)

This stratification ensures the validation set exercises the full range of the rubric
and does not cluster in the middle of the scale.

### App Design

**Per LO screen**:
```
Module: {moduleCode} — {moduleTitle}
Level: NFQ {n} | {ects} credits | {ca}% CA / {exam}% Exam
Department: {department}

Learning Outcome:
"{loText}"

Rate this outcome on each dimension:

D1 — Is the action verb observable and measurable?
     [0 — Vague] [1 — Weak] [2 — Clear] [3 — Precise]
     Why did you give this score? * [_______________]

D2 — Does the outcome describe a single behavior?
     [0 — Multiple] [1 — Marginal] [2 — Mostly] [3 — Single]
     Why did you give this score? * [_______________]

D3 — Is it framed around what the student achieves?
     [0 — Instructor-centred] [1 — Passive] [2 — Mostly] [3 — Student-centred]
     Why did you give this score? * [_______________]

D4 — Is the scope appropriate for this module's credit weight?
     [0 — Badly scoped] [1 — Imprecise] [2 — Appropriate] [3 — Well-calibrated]
     Why did you give this score? * [_______________]

D5 — Can you picture a valid assessment for it?
     [0 — No] [1 — With difficulty] [2 — Yes, clearly] [3 — Outcome implies method]
     Why did you give this score? * [_______________]

D6 — Is the cognitive level appropriate for NFQ {n}?
     [0 — Badly mismatched] [1 — Mild mismatch] [2 — Consistent] [3 — Precisely calibrated]
     Why did you give this score? * [_______________]

[Next →]
```

**Notes on the rationale fields**:
- Marked * — required before "Next" is enabled. One or two sentences is sufficient.
- Prompt text: *"In one or two sentences, explain why you gave this score."*
- The rationale fields are the core research data alongside the scores — not a
  secondary or optional element. They complete the triple for each human rating.
- UX consideration: show dimension definition on hover/tap to support raters who
  are unfamiliar with the framework. Do NOT show AI-generated scores during rating
  (anchoring bias). AI scores are revealed only in the post-study analysis phase.

**Rater flow**:
- 100 LOs presented in random order (shuffled per rater session)
- No login required — anonymous token per session
- Demographic question at start: academic staff / T&L professional / postgraduate / other
- Estimated time: 25–40 minutes for 100 LOs
- Progress bar shown; can pause and resume via session token

**Technical stack**:
- React front-end (consistent with MU-finder)
- Express + PostgreSQL backend (Railway)
- Anonymous session tokens (UUID, no PII)
- Ratings stored with: raterToken, loId, d1–d6 scores, comment, timestamp
- Export endpoint for JSON/CSV download

**Ethics**: Anonymous, no personal data, voluntary — likely Tier 1 (QQI/MU SRESC).
Confirm with ethics office before collecting data from T&L colleagues.

---

## Implementation Sequence

1. **Build verb lexicon** (`data/verb-lexicon.json`) — tiered, versioned, citable
2. **Build rule-based scorer** (`scripts/score-rule-based.js`) — D1, D2, D3
3. **Build LLM scorer** (`scripts/score-llm.js`) — D4, D5, D6 via Claude/GPT-4/Gemini APIs
4. **Build IRR calculator** (`scripts/compute-irr.js`) — Kappa/W per dimension
5. **Pilot on 50 CS modules** — inspect output, calibrate verb lexicon, refine prompts
6. **Build validation app** (`slo-rater/`) — React + Express, 100-LO human rating interface
7. **Validation study** — 3+ human raters on 100-LO set, compute AI–human IRR
8. **Full corpus run** — all 2,866 modules, store results in `data/ratings/`
9. **Analysis scripts** — distribution by faculty/dept/level, correlation analyses

---

## Academic Rationale for Each Dimension

Suitable for methods section of Paper 1.

**D1 — Verb Observability**
Grounded in Mager's (1975) foundational principle that instructional objectives must
describe observable terminal behaviours. Anderson & Krathwohl's (2001) revised taxonomy
operationalises cognitive verb levels. The unobservable/observable distinction is the
most basic and widely-accepted criterion in outcomes-based education literature (Harden,
2002). Verb observability is the only dimension fully tractable to rule-based evaluation
without contextual judgment.

**D2 — Behavioral Singularity**
Derived from measurement theory: a test item with two simultaneous targets has
construct validity problems (Popham, 1997). The same logic applies to LOs — an outcome
that bundles multiple behaviours cannot be attributed, assessed, or meaningfully mapped
in curriculum matrices. Mager (1975) explicitly requires one outcome per objective
statement.

**D3 — Student-Centeredness**
The shift from instructor-centered objectives to student-centered outcomes is definitional
to outcomes-based education (Spady, 1994) and is the central premise of Constructive
Alignment (Biggs & Tang, 2011). An outcome that describes curriculum delivery rather than
student achievement cannot function as an assessment criterion or as meaningful
communication to the learner.

**D4 — Scope Appropriateness**
Curriculum theory requires that learning outcomes be situated at the appropriate grain
size — neither micro-tasks nor programme-level goals (Fink, 2003). The ECTS credit system
grounds this in quantitative workload: 1 ECTS = ~25 hours; a 5-credit module with 6
outcomes implies ~20 hours per outcome. Outcomes that describe a 5-minute task or a
three-year programme objective are both miscalibrated to this workload context.

**D5 — Assessability Signal**
Biggs & Tang's (2011) Constructive Alignment requires that every learning outcome be
directly assessable. An LO that does not imply a plausible assessment method creates a
phantom target — it can neither guide teaching nor validate achievement. The criterion
is operationalised as "can a trained evaluator picture a specific, valid assessment task
for this outcome" — this is a face validity judgment well-suited to LLM evaluation.

**D6 — NFQ Level Calibration**
The National Framework of Qualifications (QQI) and the European Qualifications Framework
define level descriptors in terms of cognitive complexity. Anderson & Krathwohl's (2001)
cognitive taxonomy provides the verb-level mapping. An honours (NFQ 8) module should not
have outcomes at the remember/understand level; a first-year (NFQ 6) module should not
claim synthesis or critical evaluation-level outcomes without scaffolding. Level
miscalibration indicates either historical copy-paste from another module or a failure
to revise LOs after curriculum changes.

---

## Minimum Input Set

The system requires four fields to score all six dimensions meaningfully:

| Field | Source | Required for |
|---|---|---|
| `loText` | `modules.json` → `learningOutcome1`…`8` | D1, D2, D3, D4, D5, D6 |
| `moduleContent` | `modules.json` | D4 (scope), D5 (assessability) |
| `ects` | `modules.json` | D4 (scope vs workload calibration) |
| `nfqLevel` | Inferred from programme context | D6 (level calibration — essential) |

**Also included (low cost, improves D5)**:
- `caPercent` / `examPercent` — useful signal for D5 (100% CA implies practical outcomes expected)
- `moduleTitle` — fallback when `moduleContent` is thin or blank

**Data quality caveat**: `moduleContent` quality in the MU data is uneven — some modules
have rich descriptions, others have a single line or nothing. Thin/blank descriptions
degrade D4 and D5 scoring. Flag `moduleContent` character length in the output as a
data quality indicator. Modules with very short descriptions should be noted as a
limitation.

**D1, D2, D3** require only `loText` — the verb, verb count, and sentence subject are
entirely within the LO text itself. Module context adds nothing to the rule-based layer.

**D6 cannot be scored at all without `nfqLevel`**. Without it, the LLM has no
reference point for judging cognitive appropriateness. `nfqLevel` is inferred from
year-of-study via programme context — not present directly in `modules.json`.

---

## Key References

Anderson, L.W. & Krathwohl, D.R. (Eds.) (2001). *A Taxonomy for Learning, Teaching,
  and Assessing*. Longman.

Biggs, J. & Tang, C. (2011). *Teaching for Quality Learning at University* (4th ed.).
  McGraw-Hill.

Fink, L.D. (2003). *Creating Significant Learning Experiences*. Jossey-Bass.

Harden, R.M. (2002). Learning outcomes and instructional objectives: is there a difference?
  *Medical Teacher*, 24(2), 151–155.

Jonsson, A. & Svingby, G. (2007). The use of scoring rubrics: Reliability, validity and
  educational consequences. *Educational Research Review*, 2(2), 130–144.

Landis, J.R. & Koch, G.G. (1977). The measurement of observer agreement for categorical
  data. *Biometrics*, 33(1), 159–174.

Liu, Y. et al. (2023). G-Eval: NLG Evaluation using GPT-4 with Better Human Alignment.
  *EMNLP 2023*.

Mager, R.F. (1975). *Preparing Instructional Objectives* (2nd ed.). Fearon.

Popham, W.J. (1997). What's wrong—and what's right—with rubrics.
  *Educational Leadership*, 55(2), 72–75.

QQI (2022). *Assessment and Standards* (Revised). Quality and Qualifications Ireland.

Spady, W.G. (1994). *Outcome-Based Education: Critical Issues and Answers*.
  American Association of School Administrators.

Zheng, L. et al. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.
  *NeurIPS 2023*.

---

## Files in This Study Directory

```
slo-study/
├── CLAUDE.md                    — session context for new conversations
├── PLAN.md                      — 5-phase research plan
├── LO-EVALUATION-FRAMEWORK.md  — theoretical framework + research hypotheses
├── TECHNICAL-DESIGN.md          — this file: architecture, inputs/outputs, rationale
├── data/
│   ├── verb-lexicon.json        — tiered verb lexicon (to be built)
│   └── ratings/                 — AI and human rating outputs (to be generated)
├── scripts/
│   ├── extract-mu-los.js        — pull LOs + context from modules.json
│   ├── score-rule-based.js      — D1, D2, D3 scoring
│   ├── score-llm.js             — D4, D5, D6 via Claude/GPT-4/Gemini
│   └── compute-irr.js           — Kappa/W per dimension
└── papers/
    └── Strategic Frameworks...pdf  — Gemini Deep Research (March 2026)
```
