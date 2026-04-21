# SLO Quality Study — Research Log

A running record of feedback received, proposed responses, and implemented changes.
Entries are in reverse chronological order (newest first).

---

## 2026-04-20 — Feedback from Lisa O'Regan
**Tags:** `Paper — Methods`

### Feedback
- Calling out specific HEIs by name is sensitive — risks upsetting institutions and could damage relationships with the sector.
- The work should be framed as a **service to the HEI sector**, not as external critique or benchmarking.
- The **AI + Human collaborative evaluation** model was seen as a strong contribution.
- Possibility of **two papers** noted positively.

### Proposed Response
1. **Anonymise institutions** in charts and tables (University A, Institution B, etc.) while retaining full data in methodology descriptions. Shift the narrative to sector-level patterns rather than institutional comparisons.
2. **Reframe the contribution** — from "measuring LO quality" to "providing a scalable diagnostic tool the sector can use internally." Aligns better with QQI/HEA audience.
3. **Two-paper split**:
   - Paper 1: Methods/tool — rubric, corpus, NLP pipeline, human-AI validation model. Target: IICE (Oct 2026, Dún Laoghaire) for first outing; longer term Computers & Education or BJET.
   - Paper 2: Findings — sector-level patterns, NFQ calibration gaps, verb distribution. Target: Assessment & Evaluation in Higher Education (AECHE) or Studies in Higher Education; SRHE Annual Conference for conference output.
4. **Foreground AI + Human collaboration** as the centrepiece of Paper 1 — position the confidence slider and IRR design as a human-AI validation framework, not just a data collection tool.

### Status
- [ ] Revise abstract and intro to reflect service/collaborative framing
- [ ] Anonymise institution labels in figures and tables
- [ ] Draft two-paper structure outline
- [ ] Await further feedback before implementing paper changes

---

## 2026-04-21 — Dataset Anonymisation & Open Data Strategy
**Tags:** `General`

### Decision
Create an anonymised mirror of the full corpus for potential public release as a research dataset (e.g. via Data in Brief, Zenodo, or OSF).

### Anonymisation Approach Agreed
1. **Institution → sector-coded identifier** (PU-A, TU-B, PS-A etc.) — removes institutional fingerpointing while preserving the sector-gap finding (Δ=0.203)
2. **Module code → anonymised code** (e.g. `L8-BUS-0042` format: NFQ level + broad discipline + sequential ID) — removes the Google-findable string that, combined with institution, makes LOs trivially attributable
3. **LO text retained as-is** — it is the research object; anonymising it destroys dataset value
4. **Full asymmetric "praise by name" approach ruled out** — methodological asymmetry is not defensible; full anonymisation is cleaner and more consistent

### On the Full Dataset
- Retained internally as the attributed research asset
- Available to verified researchers on request
- Not for public release without ethics amendment (DPIA covers original collection, not public redistribution — needs a new processing purpose review)

### Next Steps
- [ ] Create anonymised mirror dataset (institution + module code substitution)
- [ ] Draft dataset readme with provenance statement, licence (CC BY), and ethics note
- [ ] Consult ethics board re: DPIA amendment for public dataset release
- [ ] Consider Data in Brief submission alongside main findings paper

---

## 2026-04-21 — Publication Venue Discussion
**Tags:** `General`

### Notes
- **Irish J.TEL ruled out** — prior poor reviewing experience; perceived bias towards TU sector; also not a strong fit (work uses technology but is not EdTech per se).
- **AISHE-J** noted as more appropriate Irish outlet for policy-facing work; not Scopus indexed but credible for Irish HE audience.
- **IICE 2026** (Oct, Dún Laoghaire) under consideration for methods paper — Irish visibility, conference travel funded, good fit. Decision pending discussion with colleagues. Deadline: 1 May 2026.
- **Target venues agreed**:
  - Methods paper (journal): Computers & Education or BJET
  - Findings paper (journal): Assessment & Evaluation in Higher Education (AECHE) — strong fit for NFQ calibration / LO quality angle
  - Conference: IICE short-term; SRHE Annual for longer cycle
- No immediate rush — quality of work prioritised over speed to publication.

---

*Log maintained by J. Keating. Updated alongside code and paper changes in this repository.*
