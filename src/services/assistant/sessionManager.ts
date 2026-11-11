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
    id: 'msg-welcome',
    sender: 'ded',
    text:
      'Здравствуй, будущий студент! Я **Дед Вузопед** — твой консультант по приёмной кампании 2026 года.\n\n' +
      'В моей локальной базе собраны сведения о ведущих университетах России: ориентировочные проходные баллы прошлых лет, наличие общежитий и военных учебных центров (ВУЦ), правила олимпиад БВИ и условия льготного кредита 3%.\n\n' +
      'При подключенном ключе Gemini ответы формулируются нейросетью с опорой на каталог, а в офлайн-режиме — напрямую из локального справочника. Спроси меня о вузах, сравни программы или введи свои баллы ЕГЭ!',
    timestamp: 'Только что',
    modelUsed: 'local',
    toolCall: {
      name: 'Локальная база вузов и справочников приёма 2026',
      query: 'Загрузка каталога: 10 ведущих университетов РФ, правила ВУЦ, общежитий и олимпиад',
      duration: '10ms',
      status: 'complete',
    },
    suggestions: [
      'Как сопоставить баллы с проходными прошлых лет?',
      'Сравни МГУ и ВШЭ по направлению IT',
      'Какие лучшие IT-вузы в Москве и СПб?',
      'Где есть военная кафедра (ВУЦ)?',
    ],
    followUps: [
      'Как сопоставить баллы с проходными прошлых лет?',
      'Сравни МГУ и ВШЭ по направлению IT',
      'Сколько баллов даёт золотая медаль и ГТО?',
    ],
    citationChunks: [
      {
        id: 'chunk-welcome-1',
        source: 'Приказ Минобрнауки РФ № 1076 • Порядок приёма 2026',
        documentTitle: 'Порядок приема в вузы: лимит заявлений и электронный оригинал',
        title: 'Порядок приёма и подача документов 2026',
        publisher: 'Министерство науки и высшего образования РФ',
        url: 'https://minobrnauki.gov.ru',
        applicableAdmissionsYear: 2026,
        checkedDate: '2025-10-01',
        verificationStatus: 'verified',
        isHistoricalCutoff: false,
        excerpt:
          'Абитуриент вправе подать заявления максимум в 5 вузов (до 5 направлений в каждом). Электронная отметка о подаче оригинала на Госуслугах юридически эквивалентна бумажному оригиналу.',
        snippet:
          'Абитуриент вправе подать заявления максимум в 5 вузов (до 5 направлений в каждом). Электронная отметка о подаче оригинала на Госуслугах юридически эквивалентна бумажному оригиналу.',
        category: 'university',
        categoryLabel: 'Правила приёма 2026',
        metadata: { tags: ['Правила приёма', 'Приём 2026', '5 вузов'] },
      },
    ],
  };
}

/**
 * Creates a message when chat conversation is restarted.
 */
export function createRestartMessage(): AssistantMessage {
  return {
    id: `msg-restart-${Date.now()}`,
    sender: 'ded',
    text: 'Диалог начат заново. Я готов ответить на любые вопросы о вузах, экзаменах и поступлении 2026 года!',
    timestamp: 'Только что',
    modelUsed: 'gemini',
    suggestions: [
      'Как рассчитать шансы по баллам ЕГЭ?',
      'Сравни МГУ и ВШЭ по направлению IT',
      'Какие вузы дают скидку до 70% на платном?',
      'Как подтвердить БВИ перечневой олимпиадой?',
    ],
    followUps: [
      'Как рассчитать шансы по баллам ЕГЭ?',
      'Сравни МГУ и ВШЭ по направлению IT',
      'Сколько стоит жизнь студента в Москве?',
    ],
  };
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
