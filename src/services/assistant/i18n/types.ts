/**
 * Assistant Localisation Types & Language Contracts
 */

export type SupportedLanguage = 'ru' | 'en' | 'si' | 'ta';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechLocale: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский', speechLocale: 'ru-RU', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-US', flag: '🇬🇧' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', speechLocale: 'si-LK', flag: '🇱🇰' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-LK', flag: '🇱🇰' },
];

export interface AssistantDictionary {
  // Common / Header
  assistantName: string;
  assistantSubtitle: string;
  assistantSubtitleLocal: string;
  modeAi: string;
  modeLocal: string;
  myProfile: string;
  consultationHistory: string;
  serverStatus: string;
  newChat: string;
  fullscreen: string;
  exitFullscreen: string;
  close: string;
  
  // Composer
  inputPlaceholder: string;
  send: string;
  stopGeneration: string;
  enhancePrompt: string;
  startDictation: string;
  stopDictation: string;
  speechNotSupported: string;
  speechPermissionDenied: string;
  speechLanguageUnavailable: string;

  // Specialist Modes
  modeAll: string;
  modeCalculator: string;
  modeMilitary: string;
  modeFinance: string;
  modeOlympiads: string;

  // Scope Filters
  scopeAll: string;
  scopeRules: string;
  scopePassingScores: string;
  scopeMilitary: string;
  scopeDorm: string;

  // Profile Modal
  profileModalTitle: string;
  profileConfirmedBadge: string;
  profileSubtitle: string;
  educationStatusLabel: string;
  subjectsAndScoresLabel: string;
  totalScoreLabel: string;
  noSubjectsYet: string;
  addSubjectBtn: string;
  subjectAlreadyAdded: string;
  studyAreasLabel: string;
  citiesLabel: string;
  budgetLabel: string;
  accommodationLabel: string;
  militaryLabel: string;
  privacyNoticeTitle: string;
  privacyNoticeBody: string;
  saveProfileBtn: string;
  cancelBtn: string;
  clearProfileBtn: string;
  resetAllBtn: string;
  savedNotification: string;
  clearedNotification: string;

  // Roadmap & Checklists
  roadmapTitle: string;
  checklistSummary: string;
  deadlineVerifiedOfficial: string;
  deadlineNotVerifiedInstitution: string;
  openChecklistBtn: string;
  closeChecklistBtn: string;
  originalDocumentsAlert: string;

  // Citations & Evidence
  evidenceDrawerTitle: string;
  provenanceSubtitle: string;
  sourceIdLabel: string;
  publisherLabel: string;
  applicableYearLabel: string;
  verifiedOfficialSource: string;
  unverifiedSourceNotice: string;
  openOfficialSiteBtn: string;
  noExternalUrl: string;
  citationDisclaimer: string;

  // Actions & Clarifications
  confirmActionTitle: string;
  confirmActionSubtitle: string;
  confirmBtn: string;
  singleClarificationPrompt: string;
  missingDataNotice: string;

  // Translation Disclaimer
  translationDisclaimer: string;
}
