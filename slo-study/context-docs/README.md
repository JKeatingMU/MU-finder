# Context Documents for LO Evaluator

Policy and guidance documents used as grounding context for the LLM-based
LO evaluator (D4–D6 scoring). These are provided to the model as part of
the system prompt to ensure evaluation is normatively grounded in the same
framework a human expert rater would apply.

---

## Directory Structure

```
context-docs/
  policy/         — Irish and European regulatory frameworks
  institutional/  — Institution-specific LO writing guidance
  nfq/            — NFQ level descriptors (knowledge/skill/competence)
  README.md       — This file
```

---

## policy/

| File | Document | Source | Status |
|---|---|---|---|
| `qqi-core-policies-criteria.md` | QQI Core Policies and Criteria for Programmes | qqi.ie | TODO |
| `ects-users-guide-2015.md` | ECTS Users' Guide 2015 (Bologna) | European Commission | TODO |
| `qqa-lo-specificity.md` | QQI guidance on LO specificity and student-centredness | qqi.ie | TODO |
| `nqai-nfq-2003.md` | National Framework of Qualifications (original 2003) | NQAI | TODO |

Key extracts needed from QQI Core Policies:
- The definition of "specific and sufficiently detailed" for LOs
- The distinction between programme-level and module-level LOs
- The student-centredness requirement
- The assessability requirement

Key extracts needed from ECTS Users' Guide:
- Section 3.3 (Learning Outcomes)
- The distinction between aims, objectives, and outcomes
- The ECTS credit/workload/outcome relationship

---

## institutional/

| File | Institution | Document | Source | Status |
|---|---|---|---|---|
| `mu-lo-writing-guide.md` | MU | LO Writing Guide (Quality Office) | mu.ie | TODO |
| `ucd-lo-guide.md` | UCD | Learning Outcomes guidance (TLC) | ucd.ie | TODO |
| `ucc-lo-guide.md` | UCC | LO writing guidance | ucc.ie | TODO |
| `qqi-programme-standards.md` | All | QQI Programme Standards | qqi.ie | TODO |

Note: not all institutions publish LO writing guidance publicly.
Where unavailable, the QQI/Bologna framework will be the sole normative reference.

---

## nfq/

NFQ level descriptors will be extracted from the QQI NFQ document and
formatted as structured text suitable for inclusion in prompts.

| Level | Award type | Key cognitive expectation |
|---|---|---|
| 6 | Higher Certificate | Apply and demonstrate in familiar contexts |
| 7 | Ordinary Bachelor | Apply and analyse; some autonomy |
| 8 | Honours Bachelor | Synthesise and evaluate; novel contexts |
| 9 | Master's | Generate new knowledge; critical evaluation |
| 10 | Doctoral | Original contribution at research frontier |

File: `nfq-descriptors.md` — TODO: extract full knowledge/skill/competence strands

---

## How These Documents Are Used

Each evaluator prompt receives:

1. **Module context** — code, title, NFQ level, ECTS, descriptor text
2. **Relevant NFQ level descriptor** (from `nfq/nfq-descriptors.md`)
3. **Policy extracts** — the 3–5 most relevant paragraphs from QQI and ECTS
   (not the full documents — token budget is finite)
4. **Institutional guidance** for the institution being evaluated (if available)
5. **The LO text** and D4–D6 rubric

The evaluator is asked to apply these standards as an expert human rater would.

---

## Priority Order for Document Collection

1. QQI NFQ level descriptors (levels 6–10) — most directly used in D6 calibration
2. QQI Core Policies — LO specificity definition (D4, D5)
3. ECTS Users' Guide sections 3.2–3.4 — Bologna standards for D3/D5
4. MU LO writing guide — for the MU pilot IRR study
5. Remaining institutional guides — for cross-institutional consistency

---

## Notes

- Keep extracts concise — the prompt budget is approximately 2,000 tokens for context
- All documents are publicly available; no copyright issue for research use
- Store as plain Markdown, not PDF, so they can be embedded directly in prompts
- Date-stamp all extracts (policy documents are revised periodically)
