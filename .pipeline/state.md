# Pipeline State: Vuzopedia Reverse Engineering & Remake

pipeline: remake
mode: auto
explore: off
source: https://vuzopedia.ru/
started_at: 2026-11-10T14:19:00+05:30
profile: webapp

## Remake Checklist
- [x] R0: Setup & safety
- [x] R1: Identify source & live extraction
- [x] R2: Multi-angle audit (Inventory, Design, Motion, Performance, Features)
- [x] R3: Keep / Change / Drop decisions
- [x] R4: Migration plan + quality bar (spec.md, CONSTRAINTS.md)
- [x] R5: Rebuild (Phases 4-13: design direction, system, UI, backend/logic, motion, a11y, test, harden, review, ship prep)
- [x] R6: Compare & regression
- [x] R7: Report & learn

## Keep List
- Universal Search & Filter Engine (Universities, Specialties, Professions)
- Complete Universities Directory with detailed cards & multi-faceted filter
- University Details page with programs, scores, facilities, tabs
- 11-Subject USE (ЕГЭ) Calculator with chance estimation algorithm
- Specialties Catalog (Bachelors, Specialist, Masters) with official codes
- Professions Directory with career paths & salary ranges
- Interactive Career Guidance Tests (Klimov questionnaire, Subject test)
- University Comparison Tool (side-by-side specs)
- Regional City Hubs
- 2026 Admissions Calendar & Terminology Glossary
- Personal Application Priority Tracker & Favorites

## Quality Gate Status
- TypeScript Check: PASS (0 errors)
- Vite Production Build: PASS (106.89 kB gzipped bundle, within 200 kB budget)
- Logic Test Suite: PASS (4/4 tests passed)
- Playwright Browser Tests: PASS (0 console errors across desktop & mobile)
- Screenshots: Captured in `.pipeline/after/` (1440px desktop & 375px mobile)

## Unresolved
(None)

## Change 2026-11-10: Quality, Architecture & Feature Deepening
- **Size**: M | **Types**: feature, design, performance, content
- **Vite Bundle Optimization**: Configured `manualChunks` in `vite.config.ts` (`vendor-react`, `vendor-icons`), keeping core app gzipped size under 170 kB (within CONSTRAINTS.md 200 kB budget).
- **Universal Multi-Category Search (`GlobalSearchModal.tsx`)**: Expanded search indexing to Universities, Educational Programs, Specialties, Colleges (СПО), and Professions.
- **University Profile Deep-Linking (`UniversityDetailModal.tsx`)**: Added dedicated "Общежития и ВУЦ" and "Отзывы студентов" tabs with live student ratings and housing metrics.
- **Dynamic Context**: Document titles synchronized across all 18 views with clear metadata.
- **Interactive Feedback**: Floating glassmorphism toast notification system for priority lists, plan modifications, and comparisons.
- **Verification**: Zero console errors, Playwright E2E passed, build clean in 9.38s.
