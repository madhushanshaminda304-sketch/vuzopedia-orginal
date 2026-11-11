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

## Change 2026-11-11: Production RAG Architecture Upgrade (Open-WebUI, Dify, RAGFlow)
- **Size**: L | **Types**: feature, architecture, rag, nlp, ui
- **Patterns Borrowed from `c:\Users\DELL\Downloads\RAG`**:
  - **Open-WebUI Citation & Chunk Modal (`Citations.svelte` & `CitationModal.svelte`)**:
    - `RetrievedCitationChunk` verifiable chunk data model with confidence calculation and dynamic color-coded relevance scoring (`>=85%` emerald, `>=70%` yellow, `>=50%` orange, `<50%` rose).
    - Compact citation pill on assistant bubble showing chunk count and overall relevance percentage (`📚 Источники данных (N) • X% релевантность`).
    - Dedicated full Citations Modal Drawer (`inspectedCitations`) showing grounding confidence meter, exact factual text snippets, tag chips, and direct 1-click `"Карточка вуза"` button navigating to `UniversityDetailModal`.
  - **Dify-style Structured Predicate Extraction (`template_prompts.py`)**:
    - Automatic query extraction parsing raw question into structured predicates (`ExtractedQueryFilters`): USE score (`🎯 Баллы`), City filter (`📍 Город`), Educational Track (`💻 Направление`), Military Center requirement (`🛡️ ВУЦ`), and Dormitory need (`🏠 Общежитие`).
    - Visual predicate chip bar rendered atop assistant responses demonstrating transparent query understanding.
  - **Open-WebUI Scope Filter Bar**:
    - Interactive horizontal filter strip at the top of the chat allowing students to dynamically scope their questions (`🌐 Все вузы РФ`, `📍 Москва`, `🏛️ Санкт-Петербург`, `💻 IT и Инженерия`, `🛡️ Только с ВУЦ`, `🏆 Олимпиады БВИ`).
- **Resilience & Testing**:
  - Automated Playwright verification (`scripts/verify_rag_features.mjs`) verified scope switching, question submission, Dify predicate pill rendering, Open-WebUI citation pill, Citations Drawer inspection, confidence gauge, and drawer closing.
  - Zero console errors; TypeScript type check passed; Vite production build clean in 6.51s (gzip 187.37 kB).
  - Screenshot captured: `feature_assistant_rag_citations_drawer.png`.

## Change 2026-11-10: Quality, Architecture & Feature Deepening
- **Size**: M | **Types**: feature, design, performance, content
- **Vite Bundle Optimization**: Configured `manualChunks` in `vite.config.ts` (`vendor-react`, `vendor-icons`), keeping core app gzipped size under 180 kB (within CONSTRAINTS.md 200 kB budget).
- **Universal Multi-Category Search (`GlobalSearchModal.tsx`)**: Expanded search indexing to Universities, Educational Programs, Specialties, Colleges (СПО), and Professions.
- **University Profile Deep-Linking (`UniversityDetailModal.tsx`)**: Added dedicated "Общежития и ВУЦ" and "Отзывы студентов" tabs with live student ratings and housing metrics.
- **Dynamic Context**: Document titles synchronized across all 18 views with clear metadata.
- **Interactive Feedback**: Floating glassmorphism toast notification system for priority lists, plan modifications, and comparisons.
- **Verification**: Zero console errors, Playwright E2E passed, build clean in 9.38s.

## Change 2026-11-11: Advanced Question-Answering Prompt Leaks Architecture
- **Size**: M | **Types**: feature, architecture, prompt-engineering, nlp, ui
- **Prompt Engineering Infusions (from `c:\Users\DELL\Downloads\ffaan\system_prompts_leaks`)**:
  - **Perplexity Pro Search & Synthesis (`perplexity-search.md`)**:
    - Pre-execution Intent Gating: `DIRECT_RESPONSE` vs `TOOL_NEEDED` to ensure factual grounding on all admissions data.
    - Query Decomposition for multi-parameter questions (city, score, branch, VUTs, dorms).
    - Comparative Matrix Generator: Structured Markdown comparison table (`| Критерий | Вуз 1 | Вуз 2 |`) for side-by-side evaluations.
    - Dynamic Conversational Handoffs: Contextual follow-up question chips (`followUps: string[]`) derived from specific entities in the response.
    - Inline Grounded Citations (`[vuz:id:Name]`) rendered as interactive clickable badges that open the university profile in one click.
  - **Google Gemini 3.5 Flash (`gemini-3.5-flash.md`)**:
    - Scannable formatting toolkit (hierarchical headers, bold key stats, direct 1-2 sentence core conclusion upfront).
    - Empathetic peer voice and candor; specifics over vague generalities.
  - **Anthropic Claude (`research_instructions.md` & `claude-sonnet-4.6.md`)**:
    - Clarification Protocol: Underspecified questions without scores or preferences trigger interactive preset scenario cards (`clarificationOptions`) rather than ungrounded assumptions.
    - Anti-Sycophancy: Realistic statistical probability evaluation without sugarcoating low scores; provides actionable alternative pathways (target quotas, 3% loan, regional flagships).
- **Astryx Chat UI Enhancements (`DedVuzopedAssistantModal.tsx`)**:
  - Built-in Markdown table renderer with alternating rows, styled headers, and cell citation parsing.
  - Quick Question Builder toolbar above composer input with one-tap query presets.
  - Interactive clarification scenario cards with instant execution.
- **Verification**: All 15 Playwright verification tests passed with 0 console errors (`scripts/verify_assistant_astryx.mjs`). Screenshots captured: `feature_assistant_comparison_matrix.png`, `feature_assistant_clarification.png`. Build: clean in 6.58s (gzip ~184.4 kB).
- **Size**: L | **Types**: feature, architecture, ai-rag, design, performance
- **Agentic RAG Architecture (from `awesome-llm-apps`)**:
  - Semantic knowledge retrieval across Vuzopedia real data: `UNIVERSITIES`, `FULL_PROGRAMS`, `DORMITORIES`, `MILITARY_CENTERS`, `OLYMPIADS_BVI`, `INDIVIDUAL_ACHIEVEMENTS`, and `STUDENT_LIVING_COSTS`.
  - Transparent step-by-step Agentic Reasoning Traces (`reasoningTrace: string[]`) showing retrieval, score cross-referencing, and synthesis.
  - Generative UI University Citation Cards with interactive badges (budget cutoff score, military center presence, dormitories) and 1-click modal deep-linking to `UniversityDetailModal`.
  - Generative UI Admission Probability Gauge with green/yellow/red color spectrum and risk assessment.
  - Multi-agent specialist persona switching (`all`, `calculator`, `military`, `finance`, `olympiads`) with customized system prompts and retrieval filters.
- **Astryx Chat Suite UI Integration**:
  - Full markdown parser with code highlighting, inline quotes, and tabular rendering.
  - Interaction toolbar: copy to clipboard confirmation, thumbs up/down user sentiment reactions.
  - Fullscreen expandable workspace view and glassmorphism styling.
  - Multi-tier resilience: Gemini 3.5 Flash live API with 3.5s AbortController timeout & automatic fallback to the instant deterministic local RAG engine.
- **Verification**: Passed all 12 Playwright automated checks (`scripts/verify_assistant_astryx.mjs`), clean TypeScript and Vite build (gzip ~180.1 kB).

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
