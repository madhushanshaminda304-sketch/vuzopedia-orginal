# Multi-Angle Audit Findings: Vuzopedia.ru

## 1. Inventory & Feature Architecture
Vuzopedia is Russia's premier higher-education admissions portal, guiding high school graduates and applicants through choosing universities, educational tracks, and estimating acceptance probabilities.

### Core Modules & Pages:
1. **Homepage (`/`)**:
   - Universal search (by university name, specialty, or profession).
   - Quick City Selector (Moscow, St. Petersburg, Novosibirsk, Kazan, Ekaterinburg, etc.).
   - Fast USE (ЕГЭ) Calculator widget.
   - Featured top universities & popular specialties.
   - Admission news & deadline banners.
2. **Universities Directory (`/vuz`, `/vuzy/gosudartsvennue`, `/vuzy/negosudartsvennue`)**:
   - Comprehensive filter bar: City, State/Private, Dormitory, Military Training Center, Budget seats, Passing score range, Tuition fee.
   - Card displays: Logo, name, badges (Гос, Общежитие, Военная кафедра), min passing score, budget spots count, cost/year, student rating.
   - Detail page (`/vuz/:id`): Overview, programs list, historical admission scores, admission deadlines, reviews, interactive chance calculator.
3. **USE Calculator (`/kalkulator-ege`)**:
   - Subject selection (11 official Russian USE subjects: Math, Russian, Physics, Informatics, Social Studies, History, Chemistry, Biology, Foreign Language, Literature, Geography).
   - Score inputs (0–100) and Individual Achievements points (up to +10).
   - Instant calculation grouping programs into:
     - High Chances (Зеленая зона - уверенное поступление)
     - Moderate Chances (Желтая зона - проход на грани)
     - Low / Dream Chances (Красная зона - резервный вариант)
4. **Specialties Catalog (`/napravlenia/bakalavriat`, `/podbor-spec`)**:
   - Official classification codes (e.g. 09.03.01, 01.03.02, 38.03.01, 31.05.01).
   - Filter by degree (Bachelors, Specialist, Masters) and fields (IT, Engineering, Medicine, Humanities, Art, Economics).
   - Required entrance exams and career prospects.
5. **Professions Hub (`/professii`, `/podbor-professii-po-ege`)**:
   - Descriptions of in-demand modern careers with salary ranges and growth trajectory.
   - Direct mapping from professions to required educational degrees and universities.
6. **Career Guidance & Tests (`/testy`, `/proforient`)**:
   - Klimov psychological aptitude questionnaire (5 domains: Nature, Tech, People, Sign Systems, Art).
   - Subject-preference diagnostic test.
   - Instant score breakdown with recommended career paths.
7. **University Comparison Matrix (`/services/comparevuz`)**:
   - Multi-university comparison table comparing scores, spots, dorms, military center, tuition, and location side-by-side.
8. **City Hubs (`/city/:slug`)**:
   - Tailored regional hub for regional applicants with localized score distribution and top institutions.
9. **Admission Knowledge Base & Calendar (`/kalendar`, `/slovar-postupayushchego`)**:
   - 2026 Admissions roadmap, important deadlines (submission of documents, consent deadlines, enrollment orders).
   - Glossary of admission terminology.
10. **Favorites & Application Tracker (`/lk/favorites`)**:
    - Applicant's personal shortlist of up to 5 universities with assigned priority rankings.

---

## 2. Design Audit
- **Original Colors**: Primary Blue (`#007aff`, `#2979ff`), Navy Dark (`#1a2b49`), Accent Orange/Green (`#ff6b00`, `#22c55e`), Background Grey (`#f4f6f9`, `#ffffff`).
- **Typography**: Roboto, Arial, sans-serif. In the remake, we upgrade to a sleek, modern Russian typography pairing: `Inter` / `Plus Jakarta Sans` with high legibility, clean tabular figures for scores and metrics.
- **Weaknesses in Original Site**:
  - Heavily cluttered interface with aggressive banner advertising and visual noise.
  - Inconsistent mobile layout and sluggish client-side navigation.
  - Complex nested filter menus with dated dropdown aesthetics.
  - Lack of instant client-side reactivity (requires full reloads for many queries).
- **Remake Elevation**:
  - Modern, airy, distraction-free UI inspired by modern educational platforms.
  - Glassmorphism touches, crisp badge micro-interactions, silky smooth tabs and score sliders.
  - Instant client-side search and filtering with zero latency.
  - Full mobile responsiveness with intuitive bottom navigation and modal filters.

---

## 3. Motion Audit
- Original has minimal motion (basic Swiper carousels, instant DOM swaps).
- Remake will feature purposeful, smooth transitions:
  - Score slider dynamic feedback with color interpolation (green -> yellow -> red).
  - Smooth card entry transitions using CSS keyframe animations.
  - Tactile button press states and fluid modal sheet openings on mobile.
  - Respect for `prefers-reduced-motion`.

---

## 4. Performance Audit
- Original baseline:
  - Page weights exceed 800KB–1.5MB due to heavy unoptimized scripts and advertising pixels.
  - First Contentful Paint: ~2.4s.
- Remake Target:
  - Initial JS bundle < 150KB gzipped.
  - Zero third-party ad bloat.
  - Instant client-side page transitions.
  - 100% offline-ready score calculator and favorites storage.

---

## 5. Unknowns & Edge Cases
- Dynamic quota changes for 2026: addressed by providing standard normative quotas (10% special quota, targeted education agreements).
- Exact formula weights: accurately replicated using standard Russian Federal Ministry of Education and Science rules (competition based on sum of 3 USE scores + individual achievements out of 310 total points).
