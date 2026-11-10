# Technical Specification: Vuzopedia Remake

## 1. Overview
A high-performance, elegant, and ad-free remake of Vuzopedia (https://vuzopedia.ru/) providing Russian university applicants with a powerful university directory, 11-subject USE calculator, specialty and profession catalogs, career guidance tests, comparison matrix, and personal application tracker.

## 2. Tech Stack
- **Framework**: React 18 / 19 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom educational design tokens, CSS variables, and Lucide Icons
- **State Management**: React state with localStorage persistence for favorites, compare list, and test history
- **Data Engine**: High-fidelity structured database of top Russian universities, faculties, scores, cities, specialties, professions, and career quizzes.

## 3. Core Modules & Component Architecture
1. **Header & Navigation (`Header.tsx`)**:
   - Logo ("Вузопедия" in modern bold wordmark + graduation cap badge)
   - City Quick-Selector modal
   - Main nav: Вузы (Universities), Калькулятор ЕГЭ (USE Calculator), Специальности (Specialties), Профессии (Professions), Тесты (Tests), Сравнение (Comparison), Календарь (Calendar)
   - Search bar with instant autocomplete
   - Favorites counter badge & Application Tracker button
   - Theme toggle (Light / Dark mode)

2. **Universal Search Overlay (`GlobalSearch.tsx`)**:
   - Instant search across universities, specialties, and professions with highlighted matches.

3. **USE Calculator (`EgeCalculator.tsx`)**:
   - Grid of 11 official Russian USE subjects:
     1. Русский язык
     2. Математика (профиль)
     3. Физика
     4. Информатика и ИКТ
     5. Обществознание
     6. История
     7. Химия
     8. Биология
     9. Иностранный язык (Английский)
     10. Литература
     11. География
   - Slider + number input for each subject (0–100)
   - Individual achievements slider (0–10 points for gold medal, GTO badge, volunteer book)
   - Minimum pass filters: City, Dormitory required, Military Department required, Budget vs Paid
   - Instant calculation algorithm:
     - Sum of best relevant 3 subjects + achievements
     - Real-time chance probability estimation (Зеленый / Желтый / Красный коридор)
     - Recommended universities and programs sorted by match percentage

4. **Universities Catalog & Filters (`UniversityCatalog.tsx`, `UniversityCard.tsx`)**:
   - Multi-facet filter drawer & sidebar:
     - Search by name/abbreviation (e.g., МГУ, Бауманка, ВШЭ, МФТИ)
     - City filter with university counts
     - Status: Государственный (State) / Негосударственный (Private)
     - Checkboxes: Военная кафедра (Military training), Общежитие (Dormitory), Бюджетные места (Budget places)
     - Score range slider (от 100 до 310)
     - Tuition cost range slider (от 50 000 до 800 000 ₽/год)
     - Sort: По популярности, По проходному баллу, По стоимости, По числу мест
   - University Card:
     - Logo / emblem, title, abbreviation, city, metro station
     - Badges: Гос., Воен. каф., Общежитие, Лицензия
     - Stats row: Мин. балл бюджет / платно, Бюджетных мест, Стоимость обучения от ... ₽
     - Action buttons: "В сравнение", "В избранное", "Подробнее"

5. **University Detail Modal / View (`UniversityDetail.tsx`)**:
   - Header with university facts and contact info
   - Tabs:
     - Обзор и преимущества (Overview, highlights, student reviews)
     - Программы и факультеты (Programs, degree levels, spots, exam requirements)
     - Проходные баллы прошлых лет (Historical trends 2023–2025)
     - Общежитие и военная кафедра (Campus photos, dorm fees, military center details)
     - Калькулятор шансов в данный вуз (Personalized chance calculator)

6. **Specialties Catalog (`SpecialtiesCatalog.tsx`)**:
   - Classification codes (09.03.01, 01.03.02, 38.03.01, 31.05.01, 40.03.01, 42.03.01, etc.)
   - Category filter: IT, Инженерия, Медицина, Экономика, Гуманитарные, Дизайн
   - Degree filter: Бакалавриат, Специалитет, Магистратура
   - Average salary, in-demand industries, required USE exams

7. **Professions Hub (`ProfessionsCatalog.tsx`)**:
   - Modern careers (AI Engineer, Data Scientist, Fullstack Developer, Surgeon, Architect, Financial Analyst, Cybersecurity Specialist)
   - Salary ranges (Junior / Middle / Senior), key skills
   - Direct links to corresponding university programs

8. **Career Guidance & Psychological Tests (`CareerTests.tsx`)**:
   - Klimov Aptitude Test (20 questions with 2 options, calculating score across Nature, Technique, Human, Sign, Art)
   - Quick Applicant Diagnostic Quiz (5 questions about interests, work style, and favorite tasks)
   - Detailed results dashboard with radar/percentage breakdown and matched career recommendations

9. **University Comparison Matrix (`UniversityComparison.tsx`)**:
   - Compare up to 4 selected universities side-by-side
   - Comprehensive metric table (budget score, paid score, tuition fee, budget spots, dorm, military center, city, rating)
   - Clear winner highlighting

10. **Admissions Calendar 2026 & Knowledge Base (`CalendarAndGlossary.tsx`)**:
    - Interactive 2026 Admissions Timeline with phases:
      - 20 июня: Начало приема документов
      - 7-20 июля: ДВИ (вступительные испытания)
      - 25 июля: Завершение приема документов на бюджет
      - 27 июля: Публикация конкурсных списков
      - 28 июля: Завершение приема согласий (приоритетное зачисление)
      - 3 августа: Завершение приема согласий (основной этап)
      - 4-9 августа: Приказы о зачислении
    - Admission Terminology Glossary (БВИ, Целевое, СНИЛС, Согласие, Конкурсный балл, Зеленая волна)

11. **Application Priority Tracker (`ApplicationTracker.tsx`)**:
    - Manages the student's legal limit of up to 5 university applications in Russia
    - Drag-and-drop or rank ordering of choices (1st to 5th priority)
    - Cumulative admission safety score

---

## 4. Design Direction & Palette
- Primary Brand Blue: `#1E40AF` (Deep Royal Blue) / `#2563EB` (Vibrant Blue)
- Secondary Teal: `#0D9488`
- Accent Amber: `#F59E0B`
- Success Green: `#10B981`
- Danger Red: `#EF4444`
- Surface Colors: `#F8FAFC` (Light background) / `#0F172A` (Dark background)
- Typography: Inter with clean Russian Cyrillic rendering.
