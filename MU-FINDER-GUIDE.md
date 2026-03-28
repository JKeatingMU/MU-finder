# MU Programme Finder 2026 — Feature Guide

**Maynooth University · Open Day Tool**
Built by Prof. John Keating, Associate Dean for Teaching and Learning (Faculty of Science & Engineering), Maynooth University
Contact: john.keating@mu.ie

---

## Overview

MU Programme Finder is a browser-based progressive web app (PWA) that helps prospective students explore the 55 MU undergraduate programmes for 2026. It requires no login, no server, and no personal data. It works fully offline once loaded and can be installed to a device home screen.

The app covers all three faculties:
- **Faculty of Arts, Celtic Studies & Philosophy** — 5 programmes
- **Faculty of Science & Engineering** — 23 programmes
- **Faculty of Social Sciences** — 27 programmes

Designed for use at Open Days (iPad kiosk), on the MU website, and as a standalone download.

---

## The Three Pathways

### 1. Personality Profile

A psychometric-style quiz that maps a student's cognitive interests and strengths onto MU programmes.

**Flow:**
1. Student selects a faculty (Arts / Science & Engineering / Social Sciences)
2. Answers 9–12 Likert-scale statements (Strongly Disagree → Strongly Agree)
3. Results screen shows a personalised strength profile bar chart, descriptions of top strengths, and all faculty programmes ranked by match percentage

**Question sets:**
- **Arts** — 9 questions across Creative, Humanities, and Language categories
- **Science & Engineering** — 12 questions across Scientific, Quantitative, Computing, and Creative
- **Social Sciences** — 12 questions across Social, Business, Language, and Quantitative

**The 8 strength categories:**

| Category | What it measures |
|----------|-----------------|
| **Creative** | Artistic expression, design thinking, original making |
| **Humanities** | Culture, history, philosophy, critical interpretation |
| **Language** | Communication, writing, debate, cross-cultural exchange |
| **Scientific** | Natural world curiosity — biology, chemistry, physics, environment |
| **Quantitative** | Mathematics, statistics, data, logical modelling |
| **Computing** | Software, algorithms, digital systems, coding |
| **Social** | People-centred motivation — wellbeing, rights, community |
| **Business** | Strategy, markets, organisations, entrepreneurship |

**Match score formula:**
Each course is tagged with a primary and optional secondary category. The match score is calculated as:

```
matchScore = (primaryScore + secondaryScore) / ((primaryQuestions + secondaryQuestions) × 5) × 100
```

where scores are the sum of Likert responses for that category, and the denominator is the theoretical maximum.

---

### 2. Subject Explorer

Calculates a student's estimated CAO points from their Leaving Certificate subjects and grades, then shows all MU programmes sorted by achievability.

**Flow:**
1. Student selects up to 7 LC subjects from a grouped list (Languages, Mathematics, Sciences, Technology & Design, Business & Social, Humanities & Other)
2. Selects a grade for each (Higher H1–H7 / Ordinary O1–O6 / Foundation F1–F2 for Maths and Irish)
3. App calculates CAO points (best 6 subjects + Higher Maths bonus) and displays all 55 programmes with status indicators

**Points calculation:**

| Grade | Points | Grade | Points |
|-------|--------|-------|--------|
| H1 | 100 | O1 | 56 |
| H2 | 88  | O2 | 46 |
| H3 | 77  | O3 | 37 |
| H4 | 66  | O4 | 28 |
| H5 | 56  | O5 | 20 |
| H6 | 46  | O6 | 12 |
| H7 | 37  | F1 | 28 |
|    |     | F2 | 20 |

Higher Mathematics H6 or above: **+25 bonus points**

**Status indicators:**
- **You qualify** (green) — estimated points ≥ 2025 entry requirement
- **Close** (amber) — within 40 points of the requirement
- **Aim higher** (grey) — more than 40 points below
- **Open entry** (blue) — no numeric threshold (e.g. new courses, portfolio-based entry)

> Points shown are 2025 Round 1 (last round) figures. Entry requirements change year to year.

**Faculty suggestion:** Based on the subjects selected, the app infers which faculty the student's profile most closely aligns with (e.g. Biology + Chemistry + Physics → Science & Engineering).

---

### 3. Career Finder

Students browse or search 37 career paths across 8 groups and see the MU programmes most relevant to each career.

**Career groups:**
- Technology & Computing
- Science & Research
- Healthcare & Wellbeing
- Business & Finance
- Education & Social Work
- Arts, Media & Communication
- Humanities & Culture
- Engineering & Design

**How matching works:**
Each career is tagged with a primary and optional secondary strength category. Courses are scored:
- Course primary = career primary → 70 points
- Course secondary = career primary → 40 points
- Course primary = career secondary → +30 points
- Course secondary = career secondary → +15 points
- Capped at 100%

Results show all programmes with a score > 0, sorted by relevance.

---

## Programme Directory

A browsable, searchable directory of all 55 MU 2026 undergraduate programmes.

**Features:**
- **Search** — by programme title, CAO code, or keyword in description
- **Faculty filter** — All / Arts / Science & Engineering / Social Sciences
- **Sort** — by CAO code, title A–Z, points high–low, points low–high
- **Read more / Show less** — inline expand of the programme description
- **Full summary** — opens a modal with the complete prospectus description
- **CAO points chip** — faculty-coloured, with tooltip confirming "2025 Round 1 (last round)"
- **MU page link** — direct link to the programme's page on maynoothuniversity.ie
- **Category pills** — strength categories tagged to each programme
- **AI summary badge** — shown where the programme description was AI-generated (prospectus text was not parseable for 5 programmes)
- **Accessibility font toggle** — three text sizes (small / normal / large), persisted across sessions
- **Save / Favourites** — heart icon (top-right of each card) saves a programme; a "Saved (N)" filter tab shows only saved programmes; state persists across sessions via localStorage
- **Programme Comparison** — available when the Saved filter is active; select 2 or 3 saved programmes using the compare icon (top-right of card, alongside the heart); a sticky bar at the bottom of the screen shows the selection count and a "Compare →" button (active from 2 programmes); opens a side-by-side comparison modal

### Programme Comparison modal

The comparison modal presents each selected programme in its own column with the following rows:

| Row | Detail |
|-----|--------|
| **CAO code & title** | Sticky column headers, faculty-coloured top border |
| **Faculty** | Full faculty name in faculty colour |
| **CAO Points** | Large, prominent; "2025 Round 1" note shown |
| **Strength Areas** | Primary and secondary category pills |
| **Your Match %** | Only shown if the student has completed the Personality Profile quiz; uses the same scoring formula as the Results screen; a bar and percentage are displayed for each programme. If the quiz has not been taken, the row is hidden. |
| **Related Careers** | Up to 5 career paths reverse-mapped from the programme's strength categories (using the Career Finder data) |
| **About** | Full prospectus summary (or AI-generated summary where applicable) |
| **MU Page** | Direct link to maynoothuniversity.ie |

> The compare icon is disabled (greyed out) once 3 programmes have been selected. Click the × in the sticky bar to clear the selection and start again.

---

## Data Sources

| Data | Source |
|------|--------|
| Programme titles, codes, descriptions | MU Prospectus 2026 (PDF) |
| CAO points | CAO Handbook 2026, Round 1 (last round) |
| Programme URLs | maynoothuniversity.ie (verified manually) |
| Strength category tags | Manually assigned by author |
| 5 AI-generated summaries | Claude (Anthropic) — used where prospectus text could not be parsed |

**Programmes with AI-generated summaries:** MH101, MH201, MH304, MH503, MH804

All data is baked into the app at build time. No API calls are made at runtime.

---

## Deployment Contexts

The compiled `dist/` folder is fully static and can be hosted anywhere.

### iPad Kiosk — Open Day

- Install the PWA via Safari → Share → Add to Home Screen for a fullscreen experience
- Enable iOS **Guided Access** (Settings → Accessibility → Guided Access) to lock the device to the app
- Load the app over Wi-Fi before the event; the service worker caches the app shell for offline use
- The MU logo is loaded from the MU CDN — add a local copy to `public/` for fully offline kiosk use
- No login, no personal data, no student-facing account required

### MU Website — Admissions Pages

- Live URL: `https://jkeatingmu.github.io/MU-finder/`
- Can be linked directly from admissions or undergraduate study pages
- Can be embedded in an `<iframe>` within the MU CMS
- Can be self-hosted on the MU web server by copying the `dist/` folder (no server required)
- Fully mobile-responsive; tested on Chrome, Safari, Edge, and Firefox
- If self-hosting, update `base` in `vite.config.ts` to match the server path, then rebuild

> **Recommended:** self-host on `maynoothuniversity.ie/programme-finder/` to remove the GitHub Pages dependency and allow a Content Security Policy to be set.

---

## Progressive Web App (PWA)

The app is a fully installable PWA. Students and staff can:

1. Open the app in a browser (Chrome, Safari, Edge, Firefox)
2. Use the browser's "Add to Home Screen" / "Install" option
3. The app installs like a native app — works offline, no app store required

**PWA manifest:** `public/manifest.json`
**Service worker:** `public/service-worker.js` (pre-caches the app shell for offline use)
**Theme colour:** MU maroon `#6b1a2b`

---

## Technical Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | motion/react (Framer Motion) |
| Charts | Recharts |
| Icons | lucide-react |
| Build output | Static files (HTML + JS + CSS) — deployable anywhere |

**To run locally:**
```bash
cd MU-finder
npm install
npm run dev        # development server at http://localhost:3000
npm run build      # production build to dist/
```

**To deploy:** Copy the `dist/` folder to any static web host (MU web server, Netlify, Vercel, GitHub Pages, etc.). No server-side processing required.

---

## Updating Content

### Adding or editing programmes

Edit `/src/data/courses.ts`. Each programme entry follows this structure:

```typescript
{
  id: 'mh101',
  code: 'MH101',
  title: 'The Maynooth Bachelor of Arts Degree',
  description: 'Short preview (shown in cards)',
  fullSummary: 'Full prospectus text (shown in modal and expanded view)',
  primaryCategory: 'Humanities',
  secondaryCategory: 'Language',
  faculty: 'arts',
  points: '300',
  url: 'https://www.maynoothuniversity.ie/arts',
  aiSummary: false,
}
```

Alternatively, edit `/MU-programmes/programmes.json` and regenerate `courses.ts` by running:
```bash
node /tmp/gen-courses.mjs
```

### Updating quiz questions

Edit `/src/data/questions.ts`. Questions are grouped by faculty (`artsQuestions`, `scienceQuestions`, `socialQuestions`). Each question maps to one of the 8 strength categories.

### Adding careers

Edit `/src/data/careers.ts`. Each career requires a `group`, `primaryCategory`, and optionally `secondaryCategory`.

### Updating LC subjects

Edit `/src/data/lcSubjects.ts`. The `facultyHint` field controls which faculty is suggested when a student selects that subject.

---

## Security Review

The following review was conducted against the application source code and deployment configuration. No significant vulnerabilities were identified.

| Area | Finding | Status |
|------|---------|--------|
| **XSS** | User input (search field) is used only for string comparison, never rendered as HTML. React escapes all dynamic content by default. | ✅ Pass |
| **Data injection** | All data is baked into the JS bundle at build time. No runtime API calls or external data parsing. | ✅ Pass |
| **localStorage** | Stores saved programme IDs, font preference, and a help-seen flag only. No PII. Data never leaves the device. | ✅ Pass |
| **External links** | All use `rel="noopener noreferrer"` — no tab-napping or referrer leakage. | ✅ Pass |
| **External image** | MU logo loaded from MU CDN with `referrerPolicy="no-referrer"`. Local fallback recommended for kiosk use. | ⚠️ Note |
| **HTTPS** | Enforced by GitHub Pages. Service worker will not register on non-HTTPS origins. | ✅ Pass |
| **Service worker** | Caches app shell only. No sensitive data cached. Old caches deleted on activation. | ✅ Pass |
| **GDPR** | No personal data collected, transmitted, or stored server-side. No cookies, no analytics. No DPIA required. | ✅ Pass |
| **Content Security Policy** | GitHub Pages does not support custom headers; no CSP is currently set. Configure if self-hosted on MU web server. | ⚠️ Recommend |
| **Dependencies** | React 19, Vite 6, Tailwind v4, Framer Motion, Recharts, lucide-react — all well-maintained. Run `npm audit` periodically. | ℹ️ Maintain |
| **Authentication surface** | None — no login, no user accounts, no privileged operations. | ✅ Pass |
| **Server-side code** | None — fully client-side. SQL injection, command injection, SSRF etc. do not apply. | ✅ Pass |

**Overall:** Low security risk profile. Two items noted for action: (1) add a CSP header if self-hosted; (2) add a local MU logo fallback for offline kiosk use.

> This review was conducted by source code inspection, not formal penetration testing. Commission a third-party pentest if the app is deployed in contexts handling sensitive student data.

---

## Accessibility

- **Font size toggle** — available in the Programme Directory (3 sizes, persisted to localStorage)
- **Keyboard navigable** — all interactive elements are focusable
- **Touch-optimised** — large tap targets throughout, suitable for iPad kiosk use
- **No motion preference** — animations are provided by Framer Motion; can be disabled via OS-level `prefers-reduced-motion`
- **Colour contrast** — faculty and category colours selected for reasonable contrast on white backgrounds

---

## Known Limitations

- CAO points data is from 2025 and will need to be updated annually
- 5 programme descriptions are AI-generated and should be replaced with official prospectus text when available
- The PWA service worker caches the app shell but not external programme pages on mu.ie
- The MU logo is loaded from the MU CDN; an offline fallback local copy would be needed for fully offline kiosk use
- The Froebel sub-programmes (MH001–MH004) share a single URL due to the way the Froebel department page is structured on mu.ie

---

*Last updated: March 2026*
