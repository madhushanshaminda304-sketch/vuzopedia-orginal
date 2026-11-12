# UniPedia Sri Lanka — Admissions Assistant Migration Boundary

This document defines the architectural boundary for migrating the admissions help assistant from the Vuzopedia experimental prototype into **UniPedia** (Sri Lanka Higher Education Platform), preserving existing functionality while avoiding synthetic or unverified data.

---

## 1. Architectural Overview & Domain Separation

The assistant is refactored into a decoupled, domain-agnostic core connected to country-specific admissions adapters via the `AdmissionsDomainConfig` contract.

```
+-----------------------------------------------------------------------------------+
|                        Reusable Assistant Core Engine                             |
|  - Server-Side Gemini SSE Streaming Proxy (Node 18+ / Cloudflare Pages Functions)  |
|  - 15 RPM Sliding Window Rate Limiter & Concurrency Limiter                       |
|  - Typed Action Registry with Safe Dispatching & Confirmation Gates                |
|  - Honest Provenance & Citation Verification System                               |
|  - Client UI: Header, Composer, Messages, Interactive Artifact Canvas, Citations    |
|  - Privacy-First Local Storage Governance (vuzopedia_student_profile_v1)          |
|  - Multilingual i18n Subsystem (ru, en, si, ta)                                    |
+-----------------------------------------------------------------------------------+
                                       |
                   AdmissionsDomainConfig Contract
                                       |
          +----------------------------+----------------------------+
          |                                                         |
          v                                                         v
+-------------------------------+         +-----------------------------------------+
|     russia_higher_education   |         |           unipedia_sri_lanka            |
| - Order 1076 Regulations      |         | - Dual Pathway Architecture             |
| - Unified State Exam (ЕГЭ)    |         |   * UGC State University District Quota |
| - RUB Currency                |         |   * Private & Non-State SLQF Degrees    |
| - Russian VUZ Database        |         | - LKR Currency                          |
| - 2025 Historical Cutoffs     |         | - A/L Streams, Z-scores, CGT Benchmarks  |
+-------------------------------+         +-----------------------------------------+
```

---

## 2. Reusable Assistant Engine Components

The following modules in `src/services/assistant/` and `src/components/assistant/` are 100% reusable in UniPedia without changes to their core logic:

| Component | Path | UniPedia Reusability |
|---|---|---|
| **Secure AI Proxy** | `server/geminiProxy.mjs` & `functions/api/assistant/` | Complete reuse. Pure Node.js / Cloudflare Pages Function. Zero client key exposure, server-side rate limits, concurrency controls, and global cutoff. |
| **Typed Action Registry** | `src/services/assistant/actionRegistry.ts` | Complete reuse. Validates action payloads (`open_university`, `compare_entities`, `apply_catalog_filters`, `create_checklist`, `open_calculator`). Rejects arbitrary or malicious actions. |
| **Evidence & Provenance** | `src/services/assistant/evidence/` | Complete reuse. Manages source citations, verifies claim linkages, formats provenance drawers, and tracks verification status (`verified_official`, `unverified_historical`, `missing`). |
| **Student Profile Engine** | `src/services/assistant/studentProfile.ts` | Complete reuse. Handles on-device storage, isolation of temporary explorations from confirmed facts, and safe prompt enrichment. |
| **Multilingual i18n System** | `src/services/assistant/i18n/` | Complete reuse. Full dictionaries for English (`en`), Sinhala (`si`), Tamil (`ta`), and Russian (`ru`). Dynamic Web Speech API locale switching (`si-LK`, `ta-LK`, `en-US`, `ru-RU`). |
| **UI Components** | `src/components/assistant/` | Complete reuse. `AssistantHeader`, `AssistantComposer`, `AssistantMessageItem`, `ArtifactCanvasModal`, `CitationsDrawer`, `StudentProfileModal`. |

---

## 3. UniPedia Sri Lanka Admissions Domain Layer

Implemented in `src/services/assistant/domain/unipediaDomain.ts` under domain ID `unipedia_sri_lanka`:

### A. Dual Pathway Modeling
1. **UGC State University Quota Pathway (`ugc`)**:
   - **Legal Framework**: Universities Act No. 16 of 1978 and annual UGC Sri Lanka Admission Handbooks.
   - **Selection Scheme**: 40% All-Island Merit, 55% District Quota (across 25 administrative districts), 5% Underprivileged District allocation.
   - **Input Fields**:
     - G.C.E. A/L Examination Year (e.g. 2023 / 2024).
     - Stream: Physical Science (Maths), Biological Science, Commerce, Arts, Engineering Technology (ET), Bio-systems Technology (BST), Common/Indigenous.
     - 3 A/L Subject Grades (A, B, C, S, F).
     - Official Z-Score (standardized score calculated by Department of Examinations).
     - Common General Test (CGT) score (minimum 30 required for state university registration).
     - Administrative District of Schooling (determining district quota eligibility).
   - **Cutoff Semantics**: Historical minimum Z-scores are retrospective selection cutoffs. The system **never** presents them as guaranteed admission predictions.
2. **Private & Non-State Degree Pathway (`private`)**:
   - **Legal Framework**: Ministry of Higher Education accreditation under Section 25A of Universities Act.
   - **Awarding Bodies**:
     - Locally accredited non-state institutes (e.g. SLIIT, NSBM, CINEC, Horizon Campus).
     - Transnational partner universities (UK, Australia, Ireland degrees delivered in Sri Lanka).
   - **Input Fields**:
     - Entry Qualification (Local A/L, Cambridge/Edexcel London A/L, SLQF Level 3 Foundation, TVEC NVQ Level 4/5).
     - Awarding Institution Type.
     - Annual Tuition Budget in Sri Lankan Rupees (LKR).
     - Intake Periods (February / June / October).

### B. Currency & Locale
- Currency: `LKR` (`Rs.`, Sri Lankan Rupee).
- Formatter: `Rs. 750,000` (thousands separator with space/comma).
- Primary Languages: English (`en`), Sinhala (`si`), Tamil (`ta`).

---

## 4. Verification & Integrity Boundary: Data UniPedia Must Supply

To maintain the system's honesty and zero-fabrication contract, UniPedia **must** supply authentic Sri Lankan data before enabling live queries for the Lankan domain. The table below outlines official source requirements:

| Data Entity | Official Authority / Document | Status in Current Prototype | UniPedia Requirement |
|---|---|---|---|
| **State University Minimum Z-Scores** | University Grants Commission (UGC) Sri Lanka Admissions Handbook (annual) | Unpopulated (explicitly marked unavailable) | Ingest authentic Z-scores from official UGC gazettes. |
| **State Course Codes & Universities** | UGC Sri Lanka Course Directory | Unpopulated | Ingest official 3-digit course codes (e.g. `001 - Arts`, `008 - Medicine`, `014 - Physical Science`). |
| **Recognized Non-State Institutes** | Non-State Higher Education Division, Ministry of Education | Unpopulated | Ingest recognized institutes registered under SLQF guidelines. |
| **Non-State Tuition Fees & Scholarships** | Direct institutional published prospectuses | Unpopulated | Ingest fee schedules with explicit publication date and applicable intake. |
| **Localisation Verification** | Department of Official Languages / Professional Translators | Machine-assisted with explicit disclaimers | Optional professional human review of Sinhala and Tamil dictionaries. |

---

## 5. Migration Checklist for UniPedia Team

1. [x] **Core Architecture Decoupling**: Admissions domain separated from orchestration engine.
2. [x] **Multilingual Contracts**: Dictionaries created for `en`, `si`, `ta` adhering to modern communicative register.
3. [x] **Zero Regressions**: Default active domain remains Russian higher education so the experimental Vuzopedia project continues functioning without disruption.
4. [ ] **UniPedia Ingestion**: Populate `src/services/assistant/domain/unipediaDomain.ts` with authentic UGC tables and institutional records.
5. [ ] **Endpoint Environment**: Configure server deployment with `AI_GLOBAL_DAILY_LIMIT` and Cloudflare Pages Functions.
