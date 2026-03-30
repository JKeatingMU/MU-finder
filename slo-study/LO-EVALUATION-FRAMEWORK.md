# LO Evaluation Framework — Research Synthesis
*John Keating, Maynooth University — SLO Study*
*Draft: 30 March 2026*

## Sources

- Gemini Deep Research: "Strategic Frameworks for the Implementation and Evaluation of
  Learning Outcomes in Global Higher Education and Professional Development" (March 2026)
  → `papers/Strategic Frameworks for the Implementation and Evaluation of Learning Outcomes
     in Global Higher Education and Professional Development.pdf`
- EdTech 2024: CS undergraduate LO analysis (Keating & McCormack)
- QQI Assessment and Standards (2022)
- ECTS Users' Guide
- NFQ (National Framework of Qualifications) — 10-level framework

---

## What the Literature Gets Right

**The poor/excellent comparison** is the most practically useful output from the Gemini
report. Failure modes are real, recurring, and detectable at scale:

- **Vague verbs**: *understand, know, be aware of, appreciate, learn* — unobservable internal
  states that cannot be directly verified
- **Compound behaviors**: "name, explain, and apply" — three outcomes disguised as one
- **Scope errors**: too narrow (a sub-task: "adjust page layout settings") or too broad
  (a goal: "understand the field")
- **Instructor-centeredness**: describes what the course does, not what the student achieves
- **Assessment misalignment**: practical outcome paired with a non-practical assessment method

**ECTS guidance**: 6–8 outcomes per module. Many MU modules have 8 LO slots but several
are blank or repetitive — a measurable quality signal at corpus level.

**SMARTIE** extends SMART with Inclusive and Evident. The "Evident" criterion —
learning visible and transparent to the student, promoting metacognition — is underused in
Irish HE quality discussions.

---

## What the Literature Misses or Understates

**The action verb problem at scale.** The literature discusses verb quality qualitatively.
For corpus-level analysis (2,866 MU modules), verb classification must be operationalised:
a taxonomy ranked by observability that an LLM or rule-based pass can apply systematically.
The key binary is *observable/assessable* vs *unobservable/internal*.

**Generation ≠ evaluation.** The literature is almost entirely about evaluating existing LOs.
Generating high-quality LOs from module metadata (title, description, discipline, NFQ level)
is a distinct task — avoiding hallucinated specificity and calibrating cognitive complexity
to the module's year and credit weight are the main challenges.

**NFQ level calibration is absent.** For MU, level matters: a level 6 (Year 1–2) outcome
should not use the same cognitive verbs as a level 8 (final-year honours). The NFQ
knowledge/skill/competence strands provide a principled basis for this.

**Inter-rater reliability** is not operationalised. For LLM-scored evaluation, explicit
protocols are needed for measuring agreement between model runs, between models, and between
models and human raters (Cohen's Kappa / Fleiss's Kappa / Kendall's W).

**Distribution-level analysis** is absent from the literature. The interesting research
question is not "is this LO good?" but "what does the quality distribution look like across
a faculty, a discipline, a module credit weight?" That is where the MU corpus becomes
publishable.

---

## Proposed Evaluation Dimensions

Six dimensions, each scored 0–3, giving a 0–18 composite per outcome.

| # | Dimension | What it measures | Score 0 | Score 3 |
|---|---|---|---|---|
| D1 | **Verb observability** | Is the action verb measurable? | *understand, know, appreciate* | *analyse, design, implement, critique* |
| D2 | **Behavioral singularity** | Single demonstrable behavior? | Multiple verbs in one outcome | One clear action |
| D3 | **Student-centeredness** | Student achievement, not teaching intent? | "The course introduces…" | "Students will be able to…" |
| D4 | **Scope appropriateness** | Outcome (not goal, not sub-task)? | Too narrow (a task) or too broad (a goal) | Module-level, meaningfully scoped |
| D5 | **Assessability signal** | Can an assessment be pictured for it? | No plausible assessment method | Clearly maps to a real assessment |
| D6 | **Level calibration** | Consistent with NFQ level for this module? | Lower-order verb on a final-year module | Cognitive complexity matches year/NFQ level |

### Automation tractability

- **High (rule-based)**: D1 (verb lookup), D3 (sentence subject), D2 (verb count)
- **Medium (LLM)**: D4 (scope), D5 (assessability), D6 (level calibration)
- **Human validation needed**: D5 and D6 for inter-rater calibration

---

## Irish HE Specifics

### QQI / NFQ

The NFQ has 10 levels. MU undergraduate modules sit at levels 6–8:

| NFQ Level | Context |
|---|---|
| 6 | Advanced Certificate — first/second year undergrad |
| 7 | Ordinary Bachelor's Degree |
| 8 | Honours Bachelor's Degree — final year undergrad |
| 9 | Master's Degree |
| 10 | Doctoral Degree |

The three NFQ strands (Knowledge, Skill, Competence) map loosely to Bloom's
cognitive/psychomotor/affective domains but are more useful in Irish QA contexts because
they are the language QQI reviewers use.

### The "understand" problem in Irish HE

"Understand" appears disproportionately at all levels in Irish HE LOs. This is partly
cultural — Irish academic writing tends toward hedged, process-describing language — and
partly a copy-paste legacy from pre-outcome-based education descriptors never updated after
the Bologna/QQI shift.

### ECTS workload calibration

A 5-credit module = ~125 hours student workload. With 8 LOs, each outcome implicitly
represents ~15 hours of learning activity. Outcomes that are too narrow (a single
spreadsheet task) or too broad (understand the discipline) are both miscalibrated to this
workload context.

### The two-lane assessment model

Emerging de facto policy in Irish HEIs post-2023:
- **Lane 1**: Secured, in-person assessments at program milestones (AI not available)
- **Lane 2**: Open, unit-level assessments where AI tools are used responsibly

Many existing LOs were written before this distinction existed and align with neither lane.
This misalignment is an additional quality signal worth flagging in the corpus analysis.

---

## Research Hypotheses for the MU Corpus Study

1. **Verb quality degrades in high-CA modules** — outcomes were written for exam-era
   assessments and never revised when CA was introduced
2. **STEM modules score higher on D5 (assessability) but lower on D3
   (student-centeredness)** than Arts modules — STEM tends to describe procedures,
   Arts tends to describe the curriculum
3. **LO count correlates negatively with average quality** — more outcomes = more padding
4. **NFQ level calibration errors cluster in level 6 modules** — first-year, high-volume
   teaching, least curriculum review attention
5. **Blank/thin LO slots are non-random** — concentrated in specific departments or
   module types (e.g., large service modules taught across programmes)

---

## LO Generation Approach (Phase 2)

For generating improved LOs from module metadata:

**Inputs**: module code, title, credit weight, NFQ level, discipline/department,
existing (poor) LOs, module content description

**Generative constraints**:
- One observable action verb per outcome
- Verb cognitive level consistent with NFQ level
- 6–8 outcomes per module
- Each outcome maps to a plausible assessment method
- No repetition of content across outcomes
- Student-centered framing throughout

**Evaluation**: score generated LOs on the D1–D6 rubric and compare against the
original LOs. Publish the delta as evidence of generation quality.

**Prompt engineering note**: CRTRF framework (McCormack) applies here — the
generative prompt should specify Context (module metadata), Role (module designer),
Task (write LOs), Requirements (rubric dimensions), and Format (bullet list,
action-verb first).

---

## Relationship to Prior Work

- **EdTech 2024 (Keating & McCormack)**: qualitative SMART scoring on CS UG modules.
  This framework extends that work to a quantitative, multi-dimensional rubric
  applicable across all 2,866 MU modules.
- **ACQA**: Halstead complexity metrics on code. The D1–D6 rubric is the analogous
  quality instrument for LO text.
- **CRTRF (McCormack PhD)**: prompting framework applicable to both LO evaluation
  and LO generation tasks.
