# SLO Quality Study — Research Plan

**Status:** Phase 2 in progress — rule-based scoring complete (31 March 2026)
**Authors:** John G Keating, Mark P McCormack — Maynooth University

---

## Research Questions

1. What constitutes a high-quality SLO? Can a rigorous, multi-dimensional evaluation framework be defined and validated?
2. How does SLO quality vary across MU's full module catalogue — by faculty, department, level (UG/PG), year of study, and compulsory vs optional status?
3. How does MU SLO quality compare to other Irish HEIs?
4. How do AI-generated SLOs compare in quality to real institutionally-authored SLOs?
5. Can multiple AI raters (Claude, GPT-4, Gemini) produce reliable, consistent SLO quality ratings? What is the inter-rater reliability?
6. Can a crowdsourced human rating app generate reliable IRR data at scale?

---

## Phase 1 — Evaluation Framework Development ✓ COMPLETE

### Goal
Define a rigorous, multi-dimensional SLO quality rubric that goes beyond SMART.

### Status: Complete (30–31 March 2026)
- Framework document: `LO-EVALUATION-FRAMEWORK.md`
- Technical design (inputs, outputs, prompts, IRR): `TECHNICAL-DESIGN.md`
- Verb lexicon v1.2 (tiered, citable as supplementary material): `data/verb-lexicon.json`

### D1–D6 Rubric (0–3 per dimension, 0–18 composite per outcome)

| # | Dimension | What it measures |
|---|---|---|
| D1 | **Verb observability** | Measurable action verb vs vague internal state |
| D2 | **Behavioral singularity** | One behavior per outcome vs compound |
| D3 | **Student-centeredness** | Student achievement vs teaching intent |
| D4 | **Scope appropriateness** | Outcome (not sub-task, not goal) |
| D5 | **Assessability signal** | Can an assessment be pictured for it? |
| D6 | **Level calibration** | Verb complexity consistent with NFQ level |

**Automation tractability:**
- High (rule-based): D1 (verb lookup), D2 (verb count), D3 (sentence subject)
- Medium/LLM: D4 (scope judgment), D5 (assessability), D6 (level calibration)

### Literature basis
- Gemini Deep Research (March 2026): poor/excellent LO comparison, SMARTIE/ABCD, constructive alignment, ECTS 6–8 outcomes guidance — `papers/Strategic Frameworks...pdf`
- EdTech 2024 (Keating & McCormack): SMART rubric, AI rater reliability, IRR methodology
- QQI Assessment and Standards (2022); NFQ 10-level framework
- ECTS Users' Guide

### Approach
- Dialogic engagement with multiple LLMs to co-develop the rubric (as per EdTech 2024 method)
- Pilot on a small known sample (CS modules) before scaling
- Define a scoring instrument suitable for both AI and human raters
- Bloom's level mapping is useful context but not the primary framework — focus on D1–D6

---

## Phase 2 — MU Data Analysis (AI Raters)

### Goal
Score all MU LOs against the framework using rule-based and AI batch rating.

### Status: Rule-based (D1–D3) complete. LLM (D4–D6) pending.

### Data (confirmed)
- Source: `../public/data/modules.json`
- **12,603 LOs** extracted from 2,537 modules (329 modules have no LOs)
- Extracted dataset: `data/mu-los-raw.json`
- Each LO evaluated in context: `moduleCode`, `moduleName`, `moduleContent`, `credits`, `nfqLevel` (derived), `ugPg`, `yearOfStudy`

### D1–D3 Rule-based scoring (complete)
- Script: `scripts/extract-mu-los.mjs` → `scripts/score-rule-based.mjs` → `scripts/analyse-corpus.mjs`
- Output: `data/scored-rule-based.json`, `data/corpus-analysis.json`
- Verb lexicon v1.2 (4 tiers, 34% → 8.4% unknown rate after two corpus analysis passes)
- Handles: `LO1/LO2` numbering prefixes, `critically [verb]` adverb boost (+1 tier), `be able to` stripping, noun-phrase opener detection, wrong-tense flagging, Irish language detection

### Key findings from D1–D3 (rule-based)

| Finding | Value |
|---|---|
| Total LOs scored | 12,603 |
| Tier 0 (unobservable verbs) | 1,237 (9.8%) |
| Single-behaviour LOs (D2=3) | 9,758 (77.4%) |
| Verb-first framing (D3=3) | 10,365 (82.2%) |
| Mean composite (D1+D2+D3, max 9) | 6.71 |
| High quality (≥7) | 7,930 (62.9%) |
| "understand" occurrences | 632 (most common Tier 0 verb) |
| "critically [verb]" boosted | 469 LOs |
| Unscoreable (all reasons) | 1,056 (8.4%) |
| Modules with no LOs | 329 |

**By department (notable):**
- Physics: 7.28 composite, 1.2% Tier 0 — best large-department performer
- History: 5.66 composite, 22.0% Tier 0 — highest Tier 0 rate; also 37 modules with no LOs
- Adult Education: 6.38 composite, 19.2% Tier 0
- Law & Criminology: 6.45 composite, 12.7% Tier 0

**No-LO modules (329):** concentrated in Arts & Humanities (110) and Social Sciences (112). English (44), Applied Social Studies (40), History (37) are the largest gaps. 322 of 329 have module content — data entry omission, not curriculum gap. 58 modules with 30 credits are likely dissertations/projects (defensible).

**UG vs PG:** near-identical quality (6.74 vs 6.66 composite, both 9.9% Tier 0) — PG LOs are not better written than UG, contrary to expectation.

### D4–D6 LLM scoring (next)
- Script to build: `scripts/score-llm.mjs`
- Raters: Claude (claude-opus-4-6), GPT-4o, Gemini 1.5 Pro
- Each LO scored on D4 (scope), D5 (assessability), D6 (NFQ calibration)
- G-Eval methodology: structured chain-of-thought, JSON output, triple per dimension
- Pilot on 50-module CS sample before full run
- Store: `data/scored-llm.json`

### IRR computation (`scripts/compute-irr.mjs`)
- Cohen's Kappa for each AI rater pair
- Fleiss's Kappa across all AI raters
- Kendall's W for ordinal agreement

---

## Phase 3 — Irish HEI Comparison

### Goal
Scrape LOs and module descriptors from other Irish universities and apply the same evaluation framework for comparative analysis.

### Target institutions (subject to scraping feasibility)
- University College Dublin (UCD)
- Trinity College Dublin (TCD)
- University College Cork (UCC)
- University of Galway (NUIG)
- Dublin City University (DCU)
- TU Dublin

### Approach
- Each HEI has a public module catalogue; scraping approach varies
- For each: extract module code, title, descriptor, LOs where available
- Apply same AI rating pipeline as Phase 2
- Compare quality distributions across institutions
- Note: some HEIs may not publish LOs publicly — this will reduce sample sizes

### Output
- `data/scraped/{hei}/` — raw scraped data per institution
- Comparative analysis: MU vs Irish sector

---

## Phase 4 — AI-Generated LO Comparison

### Goal
Generate synthetic SLOs using AI (from module descriptors only) and compare quality against real institutionally-authored SLOs.

### Method
- For a sample of modules: provide only the module title, descriptor, ECTS, and level to the LLM
- Generate 5–8 SLOs per module using Claude, GPT-4, Gemini (separately)
- Rate both real and generated LOs using the Phase 1 framework
- Compare distributions: are AI-generated LOs systematically higher quality? Higher Bloom's levels? Less specific to discipline?

### Key question (from EdTech 2024)
AI is biased toward generating HIGH quality LOs. Does this persist at scale with a stricter framework? Does prompting strategy affect quality distribution?

---

## Phase 5 — Crowdsourced Human Rating App

### Goal
A web app that presents a module description and a set of LOs and captures human quality ratings, enabling IRR analysis between human raters and AI raters.

### App design
- Present: module name, descriptor, assessment info, one LO at a time (or batched)
- Rater evaluates each LO against the rubric dimensions (radio buttons / sliders)
- Anonymous participation; optional demographic (academic / student / other)
- Data stored server-side; no PII required
- Results feed directly into IRR analysis pipeline

### Technical approach
- React front-end (consistent with MU-finder stack)
- Express + MongoDB backend (or lightweight — SQLite/PostgreSQL)
- Deploy to GitHub Pages (static) or Railway (if backend needed)
- Ethics: anonymous, voluntary, no personal data — likely Tier 1

### IRR output
- Human–human Kappa (between human raters)
- Human–AI Kappa (human raters vs each AI rater)
- Identify dimensions where AI and humans systematically diverge

---

## Publication Plan

### Paper 1 — Framework + MU analysis
- Full rubric development rationale
- AI batch rating of 2,866 MU modules
- IRR across AI raters
- Quality variation by faculty/dept/level
- Target: EdTech or Learning & Teaching journal

### Paper 2 — Irish HEI comparison
- Cross-institutional comparison
- Methodology: scraping, standardisation, comparison
- Target: Irish/European HE journal

### Paper 3 — Human vs AI ratings (crowdsourced app)
- IRR: human vs human, human vs AI
- Where do human and AI raters agree/disagree?
- Target: AIED, EDM, or similar

### Paper 4 — AI-generated vs real SLOs
- Can you tell the difference? Is AI-generated quality systematically different?
- Links to generative AI use in curriculum design
- Target: Computers & Education or similar

---

## Immediate Next Steps

1. **Design LLM rating prompt** (CRTRF format) for D4/D5/D6 — see `TECHNICAL-DESIGN.md` for prompt template
2. **Build `scripts/score-llm.mjs`** — batch rating against Claude, GPT-4o, Gemini; JSON triple output per LO per dimension
3. **Pilot on 50 CS modules** — validate output quality before full 12,603-LO run
4. **Build `scripts/compute-irr.mjs`** — Cohen's Kappa, Fleiss's Kappa, Kendall's W across AI rater pairs
5. **Scope Phase 3 scraping** — check UCD, TCD, UCC module catalogue structure
6. **Draft ethics application** — Tier 1 for Phases 1–4 (no personal data); Tier 2 for Phase 5 (crowdsourced human rater app)
