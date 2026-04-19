# LO Browser

A React web app for browsing a research corpus of Student Learning Outcomes (LOs) from Irish higher education institutions.

## Tech Stack
- React 18 + Vite
- Tailwind CSS (used for styling as per platform constraints, but designed to look like a clean, lightweight Vanilla CSS app)
- GitHub Pages deployment via `gh-pages`

## Data Structure
The app fetches static JSON files at runtime from the `public/data/` directory.

### 1. Institution Registry
`public/data/institution-registry.json`
This file contains the list of all institutions and their summary statistics.

### 2. Scored LO Files
`public/data/scored/<INSTITUTION_CODE>.json`
Each institution has its own file containing all its LO records.

## How to Add Real Data
1. Replace `public/data/institution-registry.json` with your real registry file.
2. Place all your scored JSON files (e.g., `NCI.json`, `MU.json`) into the `public/data/scored/` directory.
3. The app will automatically read the registry and fetch the corresponding scored files when an institution is selected.

## Development
```bash
npm install
npm run dev
```

## Deployment to GitHub Pages
1. Ensure your GitHub repository is named `lo-browser`. If it's named differently, update the `base` property in `vite.config.ts`.
2. Run the deployment script:
```bash
npm run deploy
```
This will build the app and push the `dist` folder to the `gh-pages` branch.
