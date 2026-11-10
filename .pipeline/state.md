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

## Change 2026-11-10: Astryx Chat Architecture Upgrade for Ded Vuzoped AI Assistant
- **Size**: L | **Types**: feature, architecture, ui, nlp
- **Astryx Chat Pattern Integration**: Rebuilt `DedVuzopedAssistantModal.tsx` following open-source Astryx design system (`packages/core/src/Chat`):
  - Added simulated agent tool calls (`ChatToolCalls`) displaying tool name, execution duration badge (e.g. `140ms`), status icon, and collapsible query parameter inspector.
  - Multi-domain NLP knowledge router matching 9 key admission domains (IT programs, Military Centers/VUTs, Dormitories & campus living, Olympiads & BVI 75-point rule, 3% Educational Credit, Individual Achievements & +10 extra points, Student living budget, Target enterprise contracts, and USE Calculator).
  - Contextual action pills with deep links to navigate directly into related application tabs (`programs`, `calculator`, `military`, `dorms`, etc.).
  - Interactive suggestion chips dynamically tailored to each message topic.
  - Dictation voice input simulation, message copying with toast confirmation, chat history reset, auto-scroll to bottom with floating helper, and accessible keyboard shortcuts.
- **Omnipresent Entry Points**: Wired Header assistant button, mobile/desktop floating action button (with smooth scale interactive transitions), and Footer "ПОМОЩЬ И ОБРАТНАЯ СВЯЗЬ" link.
- **Verification**: Playwright automated suite (`verify_assistant_astryx.mjs`) ran all 7 checks (Header launch, NLP query matching, ChatToolCall rendering & expansion, deep-link navigation, floating widget launch, suggestion chips, clipboard copy, Footer trigger) with 0 errors. Screenshots captured to `.pipeline/after/feature_assistant_astryx.png` and `.pipeline/after/feature_assistant_toolcalls.png`.

## Change 2026-11-11: Live Gemini 3.5 Flash AI Integration & Astryx Advanced Suite
- **Size**: M | **Types**: feature, api, ui, speech
- **Google Generative AI Integration (`src/services/geminiService.ts`)**:
  - Connected live to Google Gemini API (`models/gemini-3.5-flash` with fallback to `models/gemini-3.5-flash-lite` and offline engine) using the user-provided Gemini key.
  - Injected comprehensive 2026 Russian admissions system instructions covering BVI, quotas, 3% credit, and FZ-273 achievement caps.
  - Real-time tool call extraction from responses (`[TOOL: ...]` and `[ACTION: ...]`).
- **Astryx Chat Suite Additions**:
  - Markdown bubble formatting with bold highlights, clean bullet/numbered lists, and section headers.
  - Astryx `ChatMessageToolbar` with Thumbs up/down reaction feedback, clipboard copy, and model attribution badge.
  - Web Speech API integration (`window.webkitSpeechRecognition || window.SpeechRecognition`) with animated recording state and graceful fallback.
  - Workspace Fullscreen mode toggle (`Maximize2` / `Minimize2`) for comprehensive admissions research.
  - In-app API Key settings drawer for key management, status check, and custom keys.
- **Verification**: All 7 Playwright tests passed with zero console errors. Screenshots captured to `.pipeline/after/feature_assistant_fullscreen.png`.
