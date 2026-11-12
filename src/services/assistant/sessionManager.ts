import { University } from '../../types';
import {
  AssistantResponse,
  ResponseMode,
  SpecialistMode,
  RAGScopeFilter,
  ToolCall,
  ClarificationOption,
  ComparisonMatrix,
  RetrievedCitationChunk,
  ExtractedQueryFilters,
  AdmissionProbability,
  AdmissionArtifact,
  AppAssistantAction,
} from './types';

export const SESSIONS_STORAGE_KEY = 'vuzopedia_assistant_sessions_v4';

export interface AssistantMessage {
  id: string;
  sender: 'ded' | 'user';
  text: string;
  timestamp: string;
  response?: AssistantResponse;
  toolCall?: ToolCall;
  actionTab?: string;
  actionLabel?: string;
  action?: AppAssistantAction;
  canExecute?: boolean;
  disabledReason?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  suggestions?: string[];
  followUps?: string[];
  clarificationOptions?: ClarificationOption[];
  comparisonMatrix?: ComparisonMatrix;
  citationChunks?: RetrievedCitationChunk[];
  extractedFilters?: ExtractedQueryFilters;
  modelUsed?: ResponseMode;
  feedback?: 'like' | 'dislike' | null;
  matchedUniversities?: University[];
  reasoningTrace?: string[];
  probability?: AdmissionProbability;
  artifact?: AdmissionArtifact;
  missingInfoNotice?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: AssistantMessage[];
  activeMode: SpecialistMode;
  activeScope: RAGScopeFilter;
}

/**
 * Creates the standard welcome message for Ded Vuzoped.
 */
export function createInitialWelcomeMessage(): AssistantMessage {
  return {
    id: 'msg-welcome', sender: 'ded', timestamp: 'Только что', modelUsed: 'local',
    text: 'Привет! Помогу разобраться, что изучать, сравнить варианты и понять, что проверить перед поступлением. Можно писать своими словами. В этом эксперименте пока используется каталог российских вузов.',
    suggestions: ['Помоги выбрать программу', 'I want to find the right program for me', 'Сравни МГУ и ВШЭ'],
  };
}

export function createRestartMessage(): AssistantMessage {
  return { ...createInitialWelcomeMessage(), id: 'msg-restart-' + Date.now() };
}

/**
 * Loads saved sessions from localStorage safely.
 */
export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load assistant sessions:', err);
  }
  return [];
}

/**
 * Persists chat sessions to localStorage.
 */
export function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save assistant sessions:', err);
  }
}

/**
 * Helper to convert an AssistantResponse into an AssistantMessage object.
 */
export function createAssistantMessageFromResponse(
  response: AssistantResponse,
  timestamp?: string
): AssistantMessage {
  const ts = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const primaryAction = response.validatedActions[0];

  return {
    id: `ded-${Date.now()}`,
    sender: 'ded',
    text: response.text,
    timestamp: ts,
    response,
    toolCall: response.toolCall,
    action: primaryAction?.action,
    canExecute: primaryAction?.canExecute,
    disabledReason: primaryAction?.disabledReason,
    requiresConfirmation: primaryAction?.requiresConfirmation,
    confirmationMessage: primaryAction?.confirmationMessage,
    actionTab: primaryAction?.tabId,
    actionLabel: primaryAction?.label,
    suggestions: response.suggestions,
    followUps: response.followUps,
    clarificationOptions: response.clarificationQuestions,
    comparisonMatrix: response.comparison,
    citationChunks: response.citationChunks,
    extractedFilters: response.extractedFilters,
    modelUsed: response.mode,
    matchedUniversities: response.matchedUniversities,
    reasoningTrace: response.reasoningTrace,
    probability: response.probability,
    artifact: response.artifact,
    missingInfoNotice: response.missingInfoNotice,
  };
}

