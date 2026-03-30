# SLO Quality Study — Research Plan

**Status:** Planning phase (30 March 2026)
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

## Phase 1 — Evaluation Framework Development

### Goal
Define a rigorous, multi-dimensional SLO quality rubric that goes beyond SMART.

### Status: Draft framework developed — see `LO-EVALUATION-FRAMEWORK.md`

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
Score all MU LOs against the framework using AI batch rating.

### Data
- Source: `../public/data/modules.json`
- 2,866 modules, up to 8 LOs each (est. ~12,000–15,000 individual LOs)
- Each LO evaluated **in context**: module code, name, content descriptor, assessment split (CA/Exam), ECTS, year level (UG/PG)
- Programme context: compulsory vs optional (from `programme-data.json`)

### Method
- Node.js script (`scripts/rate-los.js`) calling LLM APIs in batch
- Raters: Claude (claude-opus-4-6), GPT-4, Gemini (minimum 3 raters)
- Each rater scores each LO on each rubric dimension
- Store results in `data/ratings/mu-ai-ratings.json`

### Analysis
- Mean scores by faculty, department, UG/PG, year, compulsory/optional
- Distribution of Bloom's levels across the catalogue
- Proportion of LOs that are outcomes vs objectives
- Critical Skills alignment check: do Data/Digital tagged modules have stronger LOs?
- Correlation between LO quality and ECTS, CA/Exam ratio

### IRR computation (`scripts/compute-irr.js`)
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

1. Finalise the evaluation framework (Phase 1) — dialogic sessions with AI
2. Write `scripts/extract-mu-los.js` — pull LOs + context from modules.json
3. Design the rating prompt (CRTRF format) for batch AI rating
4. Pilot on 50 CS modules — check output quality before full run
5. Scope scraping feasibility for Phase 3 (check UCD, TCD module catalogue structure)
6. Draft ethics application (likely Tier 1 — no personal data in Phases 1–4; Tier 2 for Phase 5 crowdsourced app)
