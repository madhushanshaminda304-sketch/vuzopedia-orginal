# Project Memory: Vuzopedia Remake (Full Feature Suite)

## Overview
Comprehensive, high-performance, ad-free clone & reverse engineering of https://vuzopedia.ru/ built with React 19, TypeScript, Tailwind CSS, and Vite.

## Complete Feature Matrix
1. **Каталог вузов России 2026 (`UniversityCatalog.tsx`)**:
   - Multi-criteria filter: City, State vs Private, Military Training Center (ВУЦ), Dormitory, Passing score slider (100–310), Tuition fee slider.
   - Sorting: by rank, passing score, budget spots, tuition fee.
2. **Калькулятор ЕГЭ 2026 (`EgeCalculatorView.tsx`)**:
   - All 11 official Russian USE subjects + Individual Achievements (+0..10).
   - Real-time chance corridor calculation: Green (guaranteed), Yellow (borderline), Red (reserve).
3. **Колледжи и техникумы СПО (`CollegesView.tsx`)**:
   - College directory for 9th and 11th grade graduates.
   - Interactive GPA (средний балл аттестата) calculator.
4. **Каталог специальностей высшего образования (`SpecialtiesCatalogView.tsx`)**:
   - Official classification codes (`09.03.01`, `01.03.02`, `38.03.01`, `31.05.01`, etc.).
   - Category filtering, degree levels, exam requirements, and salary benchmarks.
5. **Атлас востребованных профессий (`ProfessionsCatalogView.tsx`)**:
   - Salary matrix (Junior / Middle / Senior), key competencies, recommended degree tracks.
6. **Целевое обучение 2026 (`TargetEducationView.tsx`)**:
   - Employer quota contracts (Росатом, Газпром, РЖД, Ростех, Минздрав).
   - Monthly stipend allowances (+12 000 – 25 000 ₽), open seats, and direct links to «Работа в России».
7. **С чего начать: Карта страхов абитуриента (`FearMapView.tsx`)**:
   - 5-step interactive admission roadmap.
   - Actionable solutions for critical applicant anxieties (завалил экзамен, не хватило 2 баллов, армия и отсрочка, дедлайны Госуслуг).
8. **Чёрный список вузов Рособрнадзора (`BlacklistView.tsx`)**:
   - Verification tool for revoked, suspended, unaccredited, or reorganized universities.
   - Clear warnings on military draft deferral loss and unaccredited diplomas.
9. **Дистанционное и онлайн-образование (`RemoteEducationView.tsx`)**:
   - 100% remote university bachelor degree programs with state diplomas.
10. **Профориентационный тест Климова (`CareerTestsView.tsx`)**:
    - 5-domain aptitude questionnaire with instant radar/percentage breakdown and specialty matching.
11. **Сравнение университетов (`UniversityComparisonView.tsx`)**:
    - Side-by-side comparison matrix for up to 4 universities with best metric highlights.
12. **Календарь поступления 2026 и Словарь (`CalendarAndGlossaryView.tsx`)**:
    - Complete admissions milestones and searchable glossary (БВИ, СНИЛС, целевое, согласие).
13. **Персональный трекер 5 приоритетов (`ApplicationTrackerView.tsx`)**:
    - Strategy optimizer for the official 5-university application limit.
14. **Интерактивный консультант «Дед Вузопед» (`DedVuzopedAssistantModal.tsx`)**:
    - Smart virtual admission advisor with quick suggestion chips and deep linking.
15. **Глобальный поиск (`GlobalSearchModal.tsx`, `Ctrl+K`)**:
    - Instant multi-category search across universities, specialties, and careers.

## Running & Testing
- Development: `npm run dev`
- Production Build: `npm run build`
- Unit Logic Tests: `npx tsx scripts/test_logic.mjs`
- Full Visual Verification: `node scripts/verify_and_screenshot.mjs`
