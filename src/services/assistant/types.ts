import { University } from '../../types';

export type ResponseMode = 'gemini' | 'local';

export type SpecialistMode = 'all' | 'calculator' | 'military' | 'finance' | 'olympiads';
export type RAGScopeFilter = 'all' | 'moscow' | 'spb' | 'it' | 'military' | 'olympiads';

export const VALID_ACTION_TABS = [
  'catalog',
  'programs',
  'calculator',
  'comparison',
  'military',
  'dorms',
  'olympiads',
  'credit',
  'achievements',
  'budget',
  'target',
] as const;

export type ValidActionTab = (typeof VALID_ACTION_TABS)[number];

export interface ValidatedAction {
  tabId: ValidActionTab;
  label: string;
  payload?: Record<string, any>;
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

export interface RetrievedCitationChunk {
  id: string;
  source: string;
  title: string;
  snippet: string;
  category: 'university' | 'program' | 'military' | 'dorm' | 'credit' | 'olympiad' | 'achievements';
  categoryLabel?: string;
  metadata: {
    city?: string;
    minScore?: number;
    budgetPlaces?: number;
    hasMilitary?: boolean;
    hasDorm?: boolean;
    annualFee?: number;
    tags?: string[];
  };
  vuzId?: string;
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
}

/**
 * Validate and sanitize untrusted assistant response data.
 * Protects frontend from malformed or incomplete model outputs.
 */
export function validateAssistantResponse(input: any): AssistantResponse {
  if (!input || typeof input !== 'object') {
    return createSafeEmptyResponse('Не удалось сформировать ответ.');
  }

  const text = typeof input.text === 'string' ? input.text : typeof input.reply === 'string' ? input.reply : '';
  const mode: ResponseMode = input.mode === 'gemini' ? 'gemini' : 'local';

  const referencedEntityIds = Array.isArray(input.referencedEntityIds)
    ? input.referencedEntityIds.filter((id: any): id is string => typeof id === 'string')
    : [];

  const evidenceIds = Array.isArray(input.evidenceIds)
    ? input.evidenceIds.filter((id: any): id is string => typeof id === 'string')
    : [];

  // Validate actions against allowed tabs
  const validatedActions: ValidatedAction[] = [];
  if (Array.isArray(input.validatedActions)) {
    for (const a of input.validatedActions) {
      if (a && typeof a.tabId === 'string' && VALID_ACTION_TABS.includes(a.tabId as ValidActionTab)) {
        validatedActions.push({
          tabId: a.tabId as ValidActionTab,
          label: typeof a.label === 'string' && a.label.trim() ? a.label.trim() : 'Перейти в раздел',
          payload: typeof a.payload === 'object' ? a.payload : undefined,
        });
      }
    }
  } else if (typeof input.actionTab === 'string' && VALID_ACTION_TABS.includes(input.actionTab as ValidActionTab)) {
    validatedActions.push({
      tabId: input.actionTab as ValidActionTab,
      label: typeof input.actionLabel === 'string' && input.actionLabel.trim() ? input.actionLabel.trim() : 'Перейти в раздел',
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

  const citationChunks: RetrievedCitationChunk[] = Array.isArray(input.citationChunks)
    ? input.citationChunks
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
