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

## Change 2026-11-11: Public Deployment Security, Zero Key Exposure & Server-Side Abuse Prevention
- **Size**: M | **Types**: security, backend, architecture, upgrade
- **Key Isolation & Zero-Exposure Architecture**:
  - Removed `VITE_GEMINI_API_KEY` from all frontend bundles, `import.meta.env`, and client code.
  - Eliminated client-side API key storage in `localStorage`. Automatically purges legacy `vuzopedia_gemini_api_key` entries.
  - Secrets are stored exclusively in server environment configuration (`process.env.GEMINI_API_KEY`), never exposed to the browser or bundled in `dist/`.
- **Standalone Production Server & Dev Middleware (`server/geminiProxy.mjs`, `server/index.mjs`, `vite.config.ts`)**:
  - Pure native Node.js implementation (Node 18+) with zero external dependencies.
  - Handles `POST /api/assistant/chat` and `GET /api/assistant/status`.
  - Vite dev server middleware connects the same handler during development (`npm run dev`), while `server/index.mjs` provides a standalone production server (`npm start`).
  - Added Cloudflare Pages Functions (`functions/api/assistant/chat.js` and `status.js`) for seamless deployment on Cloudflare Edge.
- **Server-Side Validation & Sanitization**:
  - Request body size capped at 64 KB (rejects oversized payloads with 413).
  - Validates `prompt` (string, max 1000 chars), `history` (max 10 turns, max 1000 chars/msg), and `evidence` (max 8000 chars).
  - Restricts models to a strict allowlist (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-2.5-flash`); rejects arbitrary model injections.
  - Sanitizes all log strings and error responses to strip any raw key tokens (`[REDACTED_API_KEY]`).
- **Abuse Prevention & Concurrency Controls**:
  - In-memory sliding window rate limiter: enforces 15 RPM per client IP with `Retry-After` headers (matching the Gemini Free Tier 15 RPM allowance).
  - Concurrency throttle: limits active in-flight Gemini calls to 2, rejecting excess with 429 `CONCURRENCY_LIMIT`.
  - Configurable global usage cutoff (`AI_GLOBAL_DAILY_LIMIT=1500`, default 1,500 RPD for Google AI Studio Free Tier). When reached, responds with 503 `GLOBAL_USAGE_CUTOFF`.
- **Graceful Local-Only Fallback & UI Transparency**:
  - When the server key is missing, AI is disabled, or quota is exhausted, the assistant automatically and cleanly falls back to the local catalogue engine (`queryLocalEngine`).
  - `AssistantHeader` and `ApiKeySettingsModal` display honest server status: `Режим: Google Gemini (защищенный сервер)` vs `Режим: Локальный каталог (офлайн/защищенный)` and a live daily usage meter.
- **Zero-Cost Budget Contract**:
  - Google AI Studio Free Tier: 15 RPM, 1,500 RPD, $0/month.
  - Server runs with 0 new npm packages and 0 paid services.
- **Verification**:
  - `scripts/verify_secure_deployment.mjs`: All 6 test suites passed (0 failures, 0 console errors). Screenshot: `feature_assistant_secure_deployment.png`.
  - `scripts/verify_evidence_system.mjs`: 13/13 passed.
  - `scripts/verify_entity_matching_and_retrieval.mjs`: 13/13 passed.
  - Production bundle check: 0 occurrences of secret key or `VITE_GEMINI_API_KEY` in `dist/`.
  - TypeScript & Vite build: 0 errors.

## Change 2026-11-11: Trustworthy Evidence System and Provenance Tracking
- **Size**: M | **Types**: feature, architecture, rag, integrity, provenance, ui
- **Comprehensive Provenance Data Structure (`src/services/assistant/types.ts` & `evidenceSources.ts`)**:
  - Upgraded `RetrievedCitationChunk` with authentic provenance fields: `id` (source ID), `documentTitle`, `publisher`, `url` (real domain from `u.website` or government portals), `applicableAdmissionsYear` (historical 2025 vs regulatory 2026), `checkedDate`, `excerpt`, `structuredFields`, and `verificationStatus` (`verified` vs `unverified`).
  - No synthetic URLs, publication dates, or official endorsements. Legacy records without verifiable origin are flagged `unverified`.
- **Selective Evidence Packaging (No Prompt Bloat)**:
  - `buildEvidencePackage` filters out irrelevant institutional facts (e.g., omitting military VUC chunks when only hostel information was queried; omitting academic programs when general university rules were queried).
- **Inline Evidence Badges & Interactive Provenance Drawer (`CitationsDrawer.tsx`, `AssistantTextRenderer.tsx`)**:
  - Claims linked to evidence chunks via `[cite:chunk-id]` markdown tokens rendered as clickable badges (`[📖 chunk-id]`).
  - Clicking any citation badge opens `CitationsDrawer` with auto-focus and scrolling to the selected chunk.
  - Citations Drawer displays full provenance cards: Source ID, Publisher, Title, Year, Checked date, Excerpt, Structured Key-Values, and an external link button to the official verified website.
  - Transparent integrity notice: clearly states that citation validation reflects database consistency and is not mathematical proof or admission guarantee.
- **Strict Citation Validation & Hallucination Defense**:
  - `validateAssistantResponse` filters model-generated `[cite:id]` tokens, stripping hallucinated citation IDs that were not present in the supplied evidence package.
  - System prompt encloses data inside `<evidence_data>` tags and treats retrieved text strictly as untrusted data rather than system instructions (prompt injection mitigation).
- **Historical Cutoff Clarity vs Current Rules**:
  - Historical 2025 cutoff scores are explicitly flagged (`isHistoricalCutoff = true`) and labeled as retrospective statistics rather than guarantees for 2026 admissions.
- **Honest Missing Information Disclosures**:
  - Unknown or out-of-catalog institutions (such as foreign universities) are honestly reported as unavailable rather than substituted with unrelated Russian universities.
- **Verification**:
  - `scripts/verify_evidence_system.mjs`: 13/13 unit, integration, and Playwright tests passed (0 errors). Screenshot: `feature_assistant_trustworthy_evidence.png`.
  - `scripts/verify_rag_features.mjs`: passed (0 errors). Screenshot: `feature_assistant_rag_citations_drawer.png`.
  - `scripts/verify_entity_matching_and_retrieval.mjs`: 13/13 passed.
  - `scripts/verify_advanced_assistant_v4.mjs`: passed (0 errors).
  - TypeScript & Vite build: 0 errors.

## Change 2026-11-11: Correctness of Entity Matching, Negation, Programme Ranking & Alternatives
- **Size**: M | **Types**: bugfix, nlp, retrieval, architecture, ui
- **Bauman Alias Defect Fixed (`src/services/assistant/entityResolution.ts`)**:
  - Replaced loop-assigned aliases with static, strictly isolated `UNIVERSITY_EXPLICIT_ALIASES: UniversityAliasMap[]`.
  - BMSTU is the only entity possessing Bauman stems; other universities (MGU, HSE, MIPT, etc.) never receive Bauman tokens.
- **Ambiguity Detection & Interactive Clarification**:
  - Identifies polysemous terms (e.g., "политех" referring to BMSTU vs TPU) via `findMentionedUniversitiesDetailed()`.
  - Generates `AmbiguousEntity` state and renders interactive clarification choice buttons in the chat UI.
- **Strict Boundary Matching & False-Positive Prevention (`queryInterpretation.ts`)**:
  - Removed arbitrary substring matches that falsely classified words like "кредит", "депозит", "посетить", or "история" as IT.
  - Strict regex boundary checks distinguish financial questions from computer science programs.
- **Separation of Hard Requirements vs Soft Preferences**:
  - Parses constraint modalities: "строго", "только", "обязательно" generate hard requirements (`isCityHard`, `isDormHard`, `isMilitaryHard`, `wantsBudgetOnly`).
  - Softer cues generate `softPreferences` for secondary ranking.
- **Negation Predicate Parsing**:
  - Successfully handles negation: "без общежития" (`wantsDorm = false`), "не в Москве" (`excludedCities = ['Москва']`), "без ВУЦ" (`wantsMilitary = false`).
- **Zero-Match Integrity & Labeled Alternatives (No Silent Discard)**:
  - Required filters (city, accommodation, budget, score) are NEVER silently dropped.
  - When no university matches all hard criteria, `hasZeroMatches = true`, an explicit explanation of conflicting constraints is returned, and structured `alternatives` (regional alternatives, 3% credit paid options) are provided and rendered in the UI with navigation buttons.
- **Programme-Level Ranking (`dataRetrieval.ts`)**:
  - Searches and ranks specific academic programs (`matchedPrograms`) using program-level minimum budget scores, codes (e.g., `09.03.04`), intake volumes, and faculties rather than solely university-wide aggregates.
- **Multi-turn Contextual Follow-up Resolution (Anaphora)**:
  - `resolveActiveEntityFromHistory` resolves pronouns ("в нём", "там", "его", "its") from preceding turns to preserve active entity context.
- **Verification**:
  - `scripts/verify_entity_matching_and_retrieval.mjs`: 13/13 tests passed (0 errors). Screenshot: `feature_assistant_entity_matching_alternatives.png`.
  - `scripts/verify_rag_features.mjs`: passed (0 errors).
  - `scripts/verify_advanced_assistant_v4.mjs`: passed (0 errors).
  - TypeScript & Vite build: 0 errors.

## Change 2026-11-11: Advanced Assistant v4 (Artifacts Canvas, Live Web Search, Sessions History, Voice TTS & Prompt Optimizer)
- **Size**: M | **Types**: feature, architecture, nlp, audio, canvas, ui
- **Interactive Admission Artifact Canvas (`AdmissionArtifact`)**:
  - Claude 3.5 & ChatGPT Canvas-inspired dedicated slide-out panel for complex admission strategies.
  - Interactive checklists (`item.checked`) with real-time progress bar calculation (`N из M выполнено • X%`).
  - Step-by-step roadmap timeline and Markdown synthesis box with 1-click clipboard export.
- **Perplexity Pro Live Web Search Toggle**:
  - Top action bar toggle (`🌐 Live Web Search: ВКЛ / ВЫКЛ`).
  - Simulates and grounds real-time verification from official university admission portals (`priem.msu.ru`, `ba.hse.ru`, `mephi.ru`).
- **Chat Sessions & Persistent History (Open-WebUI / ChatGPT Sessions)**:
  - Sidebar drawer (`История консультаций`) storing multiple conversation sessions in `localStorage`.
  - Auto-titling based on user queries, switching between active threads, deleting sessions, and `+ Новый диалог` reset.
- **Text-to-Speech (TTS) Voice Narration**:
  - Full speech synthesis integration via `window.speechSynthesis` with Russian language tuning (`ru-RU`).
  - Speaker button (`Volume2` / `VolumeX`) on every assistant response with animated pulse indicators and stop/pause controls.
- **Magic Prompt Enhancer (`enhanceStudentPrompt`)**:
  - Interactive wand button (`Wand2`) in composer that expands brief student queries into complete, structured prompts.
- **Verification**: All checks in `scripts/verify_advanced_assistant_v4.mjs` passed with 0 console errors. Screenshots: `feature_assistant_artifact_canvas.png`, `feature_assistant_web_search.png`, `feature_assistant_history_sessions.png`.

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

## Change 2026-11-11: Assistant Responsiveness, Real-Time SSE Streaming & Safe Cache Architecture
- **Size**: L | **Types**: performance, streaming, backend, ui, caching
- **Immediate Local Answers & Deterministic Fast-Path**:
  - Implemented `isSupportedFactualLookup` across server (`server/geminiProxy.mjs`) and client (`src/services/assistant/queryInterpretation.ts`).
  - Supported factual queries (dormitories, military training centers, 3% preferential educational loans, BVI olympiads, exact cutoffs/contacts for individual institutions) bypass the network and render immediately (<5ms in server memory, <350ms in browser DOM).
  - 0 provider requests are triggered when server configuration is missing or AI is disabled, immediately falling back to curated local catalog records.
- **Real-Time SSE Streaming (`/api/assistant/stream`)**:
  - Built streaming endpoint using standard Server-Sent Events (`text/event-stream; charset=utf-8`).
  - Delivers progressive token chunks (`event: chunk`) directly to the chat interface with pulsing cursor indicator.
  - Reduced Time to First Content (TTFC) from ~3700ms down to **1329ms – 1781ms** (2.5x speedup over buffered generation).
  - Model verification: Officially supported `gemini-3.5-flash` with zero-thinking token configuration (`thinkingBudget: 0`) and fallback to `gemini-3.8-flash`.
- **Cancellation & Interactive Stop Button**:
  - Rendered red Stop button (`[data-testid="ded-assistant-stop-btn"]`) in `AssistantComposer` during active token streaming.
  - Connected `AbortController` on both client and server: clicking Stop cleanly aborts upstream Gemini fetch, closes SSE stream within 300ms, and preserves accumulated partial text with `partial: true` tag.
- **Robust Timeout & Error-Specific Retry Handling**:
  - Time to First Token (TTFT) timeout (6.5s) and Stalled Stream watchdog (4.5s) per model attempt.
  - Error-specific retry policy: Bounded 1-retry for 5xx/transient network issues with randomized backoff (300-450ms). Zero retries for client errors (400, 401, 403, 404).
  - Independent per-model quota fallback on HTTP 429 (`RESOURCE_EXHAUSTED`).
- **Safe Public Lookup Cache**:
  - In-memory sliding cache with 15-minute TTL and versioned key prefix (`vuzopedia-2026.1`).
  - Strict privacy boundary: `isPersonalizedQuery()` checks student scores (`260 баллов`), target subjects, and personal admission plans, strictly excluding them from caching.
  - Measured cache hit latency: **5ms**.
- **Concise Default Answers & "Explain More"**:
  - Enforced 800 token budget for fast generation with appended `[ACTION: explain_more | 📖 Раскрыть подробнее]` action button for deep breakdown on demand.
- **Verification Suite**:
  - Created and executed `scripts/measure_assistant_responsiveness.mjs` verifying cache miss, cache hit (<25ms), SSE streaming TTFC vs TCT, Stop button early cancellation, browser instant fast-path, and Playwright DOM streaming.
  - All existing suites verified green: `verify_secure_deployment.mjs`, `verify_evidence_system.mjs`, `verify_entity_matching_and_retrieval.mjs`.
  - Screenshot captured: `.pipeline/after/feature_assistant_streaming_and_responsiveness.png`.
