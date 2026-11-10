# Project Memory: Vuzopedia Remake

## Overview
High-performance, modern clone & reverse engineering of https://vuzopedia.ru/ built with React 19, TypeScript, Tailwind CSS, and Vite. Ad-free, fast, accessible, and responsive.

## Running the Project
- Development server: `npm run dev` (starts on http://localhost:3000)
- Production build: `npm run build` (outputs optimized bundle to `dist/`)
- Production preview: `npm run preview`
- Run logic tests: `npx tsx scripts/test_logic.mjs`
- Run verification & visual tests: `node scripts/verify_and_screenshot.mjs`

## Architecture & Folders
- `src/`
  - `components/`
    - `Header.tsx`: Navigation, search trigger, city selector, theme toggle, mobile menu
    - `UniversityCatalog.tsx`: University directory with multi-criteria filters & sorting
    - `UniversityCard.tsx`: University card with badges, scores, spots, and quick actions
    - `UniversityDetailModal.tsx`: Comprehensive modal with overview, programs, and chance calculator
    - `EgeCalculatorView.tsx`: 11-subject USE calculator with dynamic chance corridor calculation
    - `SpecialtiesCatalogView.tsx`: Catalog of official degree specialties (09.03.01, etc.)
    - `ProfessionsCatalogView.tsx`: Atlas of in-demand modern professions with salaries
    - `CareerTestsView.tsx`: Klimov 5-domain aptitude questionnaire with instant results
    - `UniversityComparisonView.tsx`: Side-by-side comparison matrix for up to 4 universities
    - `CalendarAndGlossaryView.tsx`: 2026 Admissions roadmap and terminology dictionary
    - `ApplicationTrackerView.tsx`: Priority ranking tool for up to 5 university applications
    - `CityModal.tsx`: Regional educational hub selector
    - `GlobalSearchModal.tsx`: Universal instant search across universities, specialties, and professions
    - `Footer.tsx`: Educational links, legal disclaimer, and branding
  - `data/`
    - `mockData.ts`: Realistic dataset of top Russian universities, programs, specialties, professions, questions, calendar, and glossary
  - `types/`
    - `index.ts`: TypeScript contracts and domain models
  - `utils/`
    - `calculator.ts`: Scoring and admission probability algorithm
  - `App.tsx`: Main layout, state sync, LocalStorage persistence
  - `main.tsx`: React DOM mount
  - `index.css`: Tailwind directives and custom micro-animations

## Key Design Tokens
- Primary Brand Blue: `#2563EB` (Tailwind `brand-600`)
- Accent Amber: `#F59E0B`
- Success Green: `#10B981`
- Typography: Inter with Cyrillic character support
- Dark Mode: `.dark` class supported via Tailwind CSS
