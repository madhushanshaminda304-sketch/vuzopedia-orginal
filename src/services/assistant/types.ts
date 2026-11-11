import { University } from '../../types';
import {
  APPLICATION_TABS,
  ApplicationTab,
  TAB_ALIASES,
  AppAssistantAction,
  resolveCanonicalTab,
} from './actionRegistry';

export * from './actionRegistry';

export type ResponseMode = 'gemini' | 'local';

export type SpecialistMode = 'all' | 'calculator' | 'military' | 'finance' | 'olympiads';
export type RAGScopeFilter = 'all' | 'moscow' | 'spb' | 'it' | 'military' | 'olympiads';

export const VALID_ACTION_TABS = [
  ...APPLICATION_TABS,
  'comparison', // legacy alias for 'compare'
  'budget',     // legacy alias for 'student_budget'
  'colleges',   // legacy alias for 'spo'
  'explain_more',
] as const;

export type ValidActionTab = (typeof VALID_ACTION_TABS)[number];

export interface ValidatedAction {
  tabId: ValidActionTab;
  label: string;
  payload?: Record<string, any>;
  action?: AppAssistantAction;
  canExecute?: boolean;
  disabledReason?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface AdmissionProbability {
  level: 'high' | 'medium' | 'low';
  label: string;
  description: string;
  scoreDiff?: number;
  referenceCutoff?: number;
}

export interface ComparisonMatrix {
  title: string;
  headers: string[];
  rows: Array<{
    criterion: string;
    values: string[];
  }>;
}

export interface ClarificationOption {
  label: string;
  prompt: string;
  icon?: string;
}

export interface ArtifactChecklistItem {
  id: string;
  label: string;
  deadline?: string;
  checked: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ArtifactStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface AdmissionArtifact {
  id: string;
  type: 'strategy' | 'checklist' | 'comparison' | 'calculator';
  title: string;
  summary: string;
  checklistItems?: ArtifactChecklistItem[];
  steps?: ArtifactStep[];
  markdownContent?: string;
}

export type VerificationStatus = 'verified' | 'unverified';

/**
 * Verifiable Evidence and Provenance Record for the assistant.
 * Transparently attributes every claim to real catalog records or official statutes.
 * Does NOT invent URLs, dates, or official endorsements.
 */
export interface RetrievedCitationChunk {
  /** Unique Source ID (e.g. 'src-vuz-bmstu-admission', 'src-reg-credit-3pct') */
  id: string;
  /** Primary source label for display */
  source: string;
  /** Document / Resource Title */
  documentTitle: string;
  /** Title for backward compatibility / display header */
  title: string;
  /** Publisher or institution owning the data */
  publisher: string;
  /** Real Source URL if actually known (e.g. u.website, official ministry portal) */
  url?: string;
  /** Relevant excerpt from document or catalog */
  excerpt: string;
  /** Backward compatibility snippet */
  snippet: string;
  /** Applicable admissions year (e.g. 2025 for historical cutoffs; 2026 for rules/quotas) */
  applicableAdmissionsYear?: number | string;
  /** Date the record was checked or verified from source, when known */
  checkedDate?: string;
  /** Verification status */
  verificationStatus: VerificationStatus;
  /** Whether the cutoffs in this chunk represent historical statistics rather than 2026 rules */
  isHistoricalCutoff?: boolean;
  /** Subject category */
  category: 'university' | 'program' | 'military' | 'dorm' | 'credit' | 'olympiad' | 'achievements' | 'statute';
  categoryLabel?: string;
  /** University ID reference if applicable */
  vuzId?: string;
  /** Structured fields extracted for grounding */
  structuredFields?: Record<string, string | number | boolean | undefined>;
  metadata: {
    city?: string;
    minScore?: number;
    budgetPlaces?: number;
    hasMilitary?: boolean;
    hasDorm?: boolean;
    annualFee?: number;
    tags?: string[];
  };
}

export interface ProgramMatch {
  id: string;
  code: string;
  name: string;
  universityId: string;
  universityShort: string;
  faculty?: string;
  minBudgetScore: number;
  budgetPlaces: number;
  annualFee: number;
  scoreDiff?: number;
}

export interface AlternativeOption {
  title: string;
  description: string;
  universities: University[];
  actionTab?: ValidActionTab;
  actionLabel?: string;
}

export interface AmbiguousEntity {
  term: string;
  candidates: Array<{
    id: string;
    name: string;
    city: string;
    description: string;
  }>;
}

export interface ExtractedQueryFilters {
  score?: number | null;
  city?: string | null;
  isCityHard?: boolean;
  excludedCities?: string[];
  direction?: string | null;
  wantsMilitary?: boolean;
  isMilitaryHard?: boolean;
  wantsDorm?: boolean;
  isDormHard?: boolean;
  wantsBudgetOnly?: boolean;
  wantsFinance?: boolean;
  wantsOlympiads?: boolean;
  scope?: string;
  hardRequirements?: string[];
  softPreferences?: string[];
  anaphoricEntityId?: string;
}

export interface ToolCall {
  name: string;
  query: string;
  duration?: string;
  status: 'complete' | 'running' | 'error';
}

/**
 * Standardized, strongly typed Assistant Response Contract.
 * Guarantees validated data structure across both AI provider and local engine.
 */
export interface AssistantResponse {
  /** Core answer text (may include Markdown and [vuz:id:name] tokens) */
  text: string;
  /** Actual operating mode producing this answer */
  mode: ResponseMode;
  /** Normalized university IDs referenced in this answer */
  referencedEntityIds: string[];
  /** IDs of evidence chunks supporting this answer */
  evidenceIds: string[];
  /** Validated, type-safe navigation actions */
  validatedActions: ValidatedAction[];
  /** Clarification options when input was ambiguous or underspecified */
  clarificationQuestions: ClarificationOption[];
  /** Structured side-by-side comparison table if applicable */
  comparison?: ComparisonMatrix;
  /** Interactive admissions checklist/strategy artifact if applicable */
  artifact?: AdmissionArtifact;
  /** Explicit warning when query targets universities/regions not in local dataset */
  missingInfoNotice?: string;
  /** Qualitative score assessment relative to historical thresholds */
  probability?: AdmissionProbability;
  /** Suggested questions and follow-ups */
  suggestions: string[];
  followUps?: string[];
  /** Actual operation and query metadata */
  toolCall: ToolCall;
  /** Factual status messages of operations performed */
  reasoningTrace: string[];
  /** Query filter predicates extracted from user message */
  extractedFilters: ExtractedQueryFilters;
  /** Underlying citation chunks */
  citationChunks: RetrievedCitationChunk[];
  /** Matched university entities from dataset */
  matchedUniversities: University[];
  /** Specific matched and ranked academic programs */
  matchedPrograms?: ProgramMatch[];
  /** Distinctly labelled alternatives when hard criteria yielded no matches */
  alternatives?: AlternativeOption[];
  /** Ambiguous entity information when multiple universities could match */
  ambiguousEntity?: AmbiguousEntity;
  /** Notice when user asks about facts not present in evidence */
  unsupportedClaimsNotice?: string;
  /** Explicit factual statement on citation limits (not absolute mathematical proof of future admission) */
  citationValidationNotice?: string;
}

/**
 * Validate and sanitize untrusted assistant response data.
 * Protects frontend from malformed or incomplete model outputs.
 * Verifies that returned evidence IDs genuinely exist in the supplied evidence.
 */
export function validateAssistantResponse(input: any): AssistantResponse {
  if (!input || typeof input !== 'object') {
    return createSafeEmptyResponse('Не удалось сформировать ответ.');
  }

  let text = typeof input.text === 'string' ? input.text : typeof input.reply === 'string' ? input.reply : '';
  const mode: ResponseMode = input.mode === 'gemini' ? 'gemini' : 'local';

  const citationChunks: RetrievedCitationChunk[] = Array.isArray(input.citationChunks)
    ? input.citationChunks
    : [];

  const validChunkIds = new Set(citationChunks.map((c) => c.id));

  // Requirement 4: Validate that returned evidence IDs exist in the supplied evidence.
  // Filter out any hallucinated IDs that do not exist in the retrieved evidence set.
  const rawEvidenceIds = Array.isArray(input.evidenceIds)
    ? input.evidenceIds.filter((id: any): id is string => typeof id === 'string')
    : [];
  const evidenceIds = rawEvidenceIds.filter((id: string) => validChunkIds.has(id));

  // Also strip invalid [cite:invalid-id] tokens from text if the model hallucinated an unsupplied ID
  text = text.replace(/\[cite:([a-zA-Z0-9_-]+)\]/g, (match: string, citedId: string) => {
    if (validChunkIds.has(citedId)) {
      return match;
    }
    // Remove citation tag for invalid/hallucinated ID
    return '';
  });

  const referencedEntityIds = Array.isArray(input.referencedEntityIds)
    ? input.referencedEntityIds.filter((id: any): id is string => typeof id === 'string')
    : [];

  // Validate actions against allowed tabs and canonical aliases
  const validatedActions: ValidatedAction[] = [];
  if (Array.isArray(input.validatedActions)) {
    for (const a of input.validatedActions) {
      if (a && typeof a.tabId === 'string' && VALID_ACTION_TABS.includes(a.tabId as ValidActionTab)) {
        const canonicalTab = (resolveCanonicalTab(a.tabId) || a.tabId) as ValidActionTab;
        validatedActions.push({
          tabId: canonicalTab,
          label: typeof a.label === 'string' && a.label.trim() ? a.label.trim() : 'Перейти в раздел',
          payload: typeof a.payload === 'object' ? a.payload : undefined,
          action: a.action,
          canExecute: a.canExecute !== false,
          disabledReason: a.disabledReason,
          requiresConfirmation: a.requiresConfirmation,
          confirmationMessage: a.confirmationMessage,
        });
      }
    }
  } else if (typeof input.actionTab === 'string' && VALID_ACTION_TABS.includes(input.actionTab as ValidActionTab)) {
    const canonicalTab = (resolveCanonicalTab(input.actionTab) || input.actionTab) as ValidActionTab;
    validatedActions.push({
      tabId: canonicalTab,
      label: typeof input.actionLabel === 'string' && input.actionLabel.trim() ? input.actionLabel.trim() : 'Перейти в раздел',
      canExecute: true,
    });
  }

  const clarificationQuestions: ClarificationOption[] = Array.isArray(input.clarificationQuestions)
    ? input.clarificationQuestions
    : Array.isArray(input.clarificationOptions)
    ? input.clarificationOptions
    : [];

  const suggestions: string[] = Array.isArray(input.suggestions)
    ? input.suggestions.filter((s: any): s is string => typeof s === 'string')
    : [];

  const followUps: string[] = Array.isArray(input.followUps)
    ? input.followUps.filter((s: any): s is string => typeof s === 'string')
    : suggestions;

  const reasoningTrace: string[] = Array.isArray(input.reasoningTrace)
    ? input.reasoningTrace.filter((s: any): s is string => typeof s === 'string')
    : [];

  const matchedUniversities: University[] = Array.isArray(input.matchedUniversities)
    ? input.matchedUniversities
    : [];

  const matchedPrograms: ProgramMatch[] | undefined = Array.isArray(input.matchedPrograms)
    ? input.matchedPrograms
    : undefined;

  const alternatives: AlternativeOption[] | undefined = Array.isArray(input.alternatives)
    ? input.alternatives
    : undefined;

  const ambiguousEntity: AmbiguousEntity | undefined =
    input.ambiguousEntity && typeof input.ambiguousEntity === 'object'
      ? input.ambiguousEntity
      : undefined;

  const toolCall: ToolCall = {
    name: input.toolCall?.name || 'Поиск по локальному каталогу Вузопедии',
    query: input.toolCall?.query || '',
    duration: typeof input.toolCall?.duration === 'string' ? input.toolCall.duration : undefined,
    status: input.toolCall?.status === 'error' ? 'error' : input.toolCall?.status === 'running' ? 'running' : 'complete',
  };

  const extractedFilters: ExtractedQueryFilters =
    input.extractedFilters && typeof input.extractedFilters === 'object'
      ? input.extractedFilters
      : {};

  const missingInfoNotice =
    typeof input.missingInfoNotice === 'string' && input.missingInfoNotice.trim()
      ? input.missingInfoNotice.trim()
      : undefined;

  return {
    text: text || 'Ответ сформирован на основе локального каталога.',
    mode,
    referencedEntityIds,
    evidenceIds,
    validatedActions,
    clarificationQuestions,
    comparison: input.comparison || input.comparisonMatrix,
    artifact: input.artifact,
    missingInfoNotice,
    probability: input.probability,
    suggestions,
    followUps,
    toolCall,
    reasoningTrace,
    extractedFilters,
    citationChunks,
    matchedUniversities,
    matchedPrograms,
    alternatives,
    ambiguousEntity,
    unsupportedClaimsNotice:
      typeof input.unsupportedClaimsNotice === 'string' && input.unsupportedClaimsNotice.trim()
        ? input.unsupportedClaimsNotice.trim()
        : undefined,
    citationValidationNotice:
      typeof input.citationValidationNotice === 'string' && input.citationValidationNotice.trim()
        ? input.citationValidationNotice.trim()
        : 'Указание ссылок на источники отражает происхождение справочных сведений из локального каталога и не является гарантией зачисления в 2026 году.',
  };
}

function createSafeEmptyResponse(message: string): AssistantResponse {
  return {
    text: message,
    mode: 'local',
    referencedEntityIds: [],
    evidenceIds: [],
    validatedActions: [{ tabId: 'catalog', label: 'Открыть каталог вузов' }],
    clarificationQuestions: [],
    suggestions: ['Как оценить шансы по баллам ЕГЭ?'],
    toolCall: {
      name: 'Локальный модуль',
      query: '',
      status: 'complete',
    },
    reasoningTrace: ['Обработка запроса локальным модулем'],
    extractedFilters: {},
    citationChunks: [],
    matchedUniversities: [],
  };
}
