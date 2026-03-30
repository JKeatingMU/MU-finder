# SLO Quality Study — Project Instructions

## Owner
Prof. John Keating & Mark P McCormack
Maynooth University, Dept of Computer Science
john.keating@mu.ie · mark.mccormack@mu.ie

## What This Is
A multi-phase research study on the quality of Student Learning Outcomes (SLOs)
across Irish higher education, using AI evaluation, Inter-Rater Reliability (IRR)
methodology, and a crowdsourced human rating app.

Prior work: ILTA EdTech 2024 paper (CS UG modules only, manual/interactive approach).
This phase: institutional scale, rigorous framework, multi-university, publication-ready.

## Directory Structure

```
slo-study/
  CLAUDE.md           ← this file
  PLAN.md             ← full research plan
  data/
    mu-modules/       ← extracted from public/data/modules.json
    scraped/          ← LOs scraped from other Irish HEIs
    synthetic/        ← AI-generated LOs for comparison
    ratings/          ← AI and human rating outputs
  scripts/
    extract-mu-los.js     ← pull LOs + descriptors from modules.json
    scrape-hei-*.js       ← scrapers for other Irish universities
    rate-los.js           ← LLM API batch rater
    compute-irr.js        ← Cohen's Kappa, Fleiss's Kappa, Kendall's W
  papers/             ← LaTeX drafts, outlines
```

## Key Data Available (MU-finder)
- `../public/data/modules.json` — 2,866 MU modules with LO1–LO8 + moduleContent + dept + faculty
- `../public/data/programme-data.json` — module → year + compulsory/optional context
- Both are clean, structured, ready to analyse

## Communication Preferences
- Concise and direct — no preamble
- No inline comments unless logic is non-obvious
- Scripts in Node.js (consistent with rest of mumodulesapp tooling)
- LaTeX for papers (consistent with ACQA papers)

## Separations
- This study is SEPARATE from ACQA (different focus: module quality vs code quality)
- Data scripts here; paper drafts in papers/
- Do not mix with mumodulesapp admin app code
