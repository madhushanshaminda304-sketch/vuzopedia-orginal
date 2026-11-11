/**
 * Central Typed Action Registry for Ded Vuzoped Assistant & Vuzopedia Platform
 * 
 * Provides:
 * 1. Single source of truth for all application routes and tab IDs
 * 2. Aliases resolving known mismatches (comparison -> compare, budget -> student_budget, colleges -> spo)
 * 3. Typed action contracts carrying validated entity IDs and parameters
 * 4. Strict entity validation (validating university IDs and programs against real catalog data)
 * 5. URL and code-execution safety guards (blocking arbitrary URLs or script injection)
 * 6. Explicit confirmation flags for irreversible actions
 * 7. Action execution dispatcher for the main application
 */

import { UNIVERSITIES } from '../../data/mockData';
import { FULL_PROGRAMS } from '../../data/extendedData';
import { University } from '../../types';

/**
 * All Canonical Application Tabs supported by the Vuzopedia Web Application
 */
export const APPLICATION_TABS = [
  'catalog',
  'programs',
  'calculator',
  'spo',
  'specialties',
  'professions',
  'target',
  'fear_map',
  'blacklist',
  'remote',
  'dorms',
  'military',
  'reviews',
  'olympiads',
  'credit',
  'achievements',
  'student_budget',
  'tests',
  'proforient_interests',
  'proforient_ege',
  'proforient_subjects',
  'proforient_klimov',
  'proforient_one_of_two',
  'compare',
  'calendar',
  'tracker',
] as const;

export type ApplicationTab = (typeof APPLICATION_TABS)[number];

/**
 * Normalization map for legacy assistant tags and common route aliases
 */
export const TAB_ALIASES: Record<string, ApplicationTab> = {
  // Direct fixes for known mismatches
  comparison: 'compare',
  budget: 'student_budget',
  colleges: 'spo',
  college: 'spo',
  
  // Alternative aliases
  ege_calculator: 'calculator',
  calc: 'calculator',
  dormitories: 'dorms',
  dorm: 'dorms',
  military_dept: 'military',
  vuc: 'military',
  bvi: 'olympiads',
  olymp: 'olympiads',
  my_plan: 'tracker',
  favorites: 'tracker',
  shortlist: 'tracker',
  proforient: 'tests',
  guidance: 'tests',
  career_tests: 'tests',
  specialities: 'specialties',
};

/**
 * Supported Action Types
 */
export type ActionType =
  | 'open_tab'
  | 'open_university'
  | 'open_program'
  | 'compare_universities'
  | 'apply_catalog_filters'
  | 'manage_shortlist'
  | 'open_calculator'
  | 'create_checklist'
  | 'explain_more';

export interface BaseAssistantAction {
  id: string;
  type: ActionType;
  label: string;
  canExecute: boolean;
  disabledReason?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface OpenTabAction extends BaseAssistantAction {
  type: 'open_tab';
  tabId: ApplicationTab;
  tabTitle: string;
}

export interface OpenUniversityAction extends BaseAssistantAction {
  type: 'open_university';
  universityId: string;
  universityName: string;
}

export interface OpenProgramAction extends BaseAssistantAction {
  type: 'open_program';
  programId?: string;
  code?: string;
  universityId?: string;
  programName?: string;
}

export interface CompareUniversitiesAction extends BaseAssistantAction {
  type: 'compare_universities';
  universityIds: string[];
  universityNames: string[];
}

export interface CatalogFiltersPayload {
  city?: string;
  searchTerm?: string;
  direction?: string;
  hasMilitary?: boolean;
  hasDorm?: boolean;
  maxScore?: number;
  onlyBudget?: boolean;
}

export interface ApplyCatalogFiltersAction extends BaseAssistantAction {
  type: 'apply_catalog_filters';
  filters: CatalogFiltersPayload;
}

export interface ManageShortlistAction extends BaseAssistantAction {
  type: 'manage_shortlist';
  action: 'add' | 'remove';
  universityId: string;
  universityName: string;
}

export interface OpenCalculatorAction extends BaseAssistantAction {
  type: 'open_calculator';
  calculatorType: 'ege' | 'credit' | 'achievements' | 'student_budget';
  score?: number;
  city?: string;
}

export interface CreateChecklistAction extends BaseAssistantAction {
  type: 'create_checklist';
  title: string;
  items: Array<{ id: string; text: string; checked: boolean; category: string }>;
}

export interface ExplainMoreAction extends BaseAssistantAction {
  type: 'explain_more';
  prompt?: string;
}

export type AppAssistantAction =
  | OpenTabAction
  | OpenUniversityAction
  | OpenProgramAction
  | CompareUniversitiesAction
  | ApplyCatalogFiltersAction
  | ManageShortlistAction
  | OpenCalculatorAction
  | CreateChecklistAction
  | ExplainMoreAction;

/**
 * Human-readable titles for application tabs
 */
export const APPLICATION_TAB_TITLES: Record<ApplicationTab, string> = {
  catalog: 'Каталог вузов России',
  programs: 'Программы бакалавриата и специалитета',
  calculator: 'Калькулятор шансов ЕГЭ',
  spo: 'Колледжи и техникумы (СПО)',
  specialties: 'Специальности высшего образования',
  professions: 'Атлас профессий и зарплат',
  target: 'Целевое обучение и квоты',
  fear_map: 'Карта страхов абитуриента',
  blacklist: 'Черный список вузов',
  remote: 'Дистанционное высшее образование',
  dorms: 'Каталог общежитий вузов',
  military: 'Военные учебные центры (ВУЦ)',
  reviews: 'Отзывы студентов',
  olympiads: 'Олимпиады РСОШ и льготы БВИ',
  credit: 'Образовательный кредит 3%',
  achievements: 'Калькулятор достижений (+10 б.)',
  student_budget: 'Калькулятор бюджета студента',
  tests: 'Тесты профориентации',
  proforient_interests: 'Тест по интересам',
  proforient_ege: 'Тест по баллам ЕГЭ',
  proforient_subjects: 'Тест по предметам',
  proforient_klimov: 'Опросник Климова',
  proforient_one_of_two: 'Тест «Один из двух»',
  compare: 'Сравнение выбранных вузов',
  calendar: 'Календарь абитуриента 2026',
  tracker: 'Мои приоритеты (до 5 вузов)',
};

/**
 * Resolves a raw candidate tab name into a canonical ApplicationTab or null
 */
export function resolveCanonicalTab(candidate: string): ApplicationTab | null {
  if (!candidate || typeof candidate !== 'string') return null;
  const clean = candidate.trim().toLowerCase();
  
  if (APPLICATION_TABS.includes(clean as ApplicationTab)) {
    return clean as ApplicationTab;
  }
  
  if (TAB_ALIASES[clean]) {
    return TAB_ALIASES[clean];
  }
  
  return null;
}

/**
 * Validates that an entity exists in the official catalog
 */
export function isValidUniversityId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const normId = id.trim().toLowerCase();
  return UNIVERSITIES.some((u) => u.id === normId);
}

/**
 * Resolves university entity details safely
 */
export function getUniversityById(id: string): University | null {
  if (!id) return null;
  const normId = id.trim().toLowerCase();
  return UNIVERSITIES.find((u) => u.id === normId) || null;
}

/**
 * URL and Code Injection Guard:
 * Strictly blocks javascript:, data:, file:, vbscript:, arbitrary paths or external arbitrary links
 */
export function isSafeNavigationTarget(target: string): boolean {
  if (!target || typeof target !== 'string') return false;
  const lower = target.trim().toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }
  if (lower.includes('<script') || lower.includes('eval(') || lower.includes('(') || lower.includes(')')) {
    return false;
  }
  if (lower.includes('/') || lower.includes('\\') || lower.includes('..')) {
    return false;
  }
  // External URLs are not allowed as raw tab navigation targets
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return false;
  }
  if (lower === 'explain_more') return true;
  return resolveCanonicalTab(lower) !== null;
}

/**
 * Factory and Validator for OpenTabAction
 */
export function createOpenTabAction(
  rawTab: string,
  customLabel?: string
): OpenTabAction {
  const canonical = resolveCanonicalTab(rawTab);
  const actionId = `tab-${rawTab}-${Date.now()}`;

  if (!canonical || !isSafeNavigationTarget(rawTab)) {
    return {
      id: actionId,
      type: 'open_tab',
      tabId: 'catalog',
      tabTitle: 'Каталог вузов',
      label: customLabel || 'Раздел недоступен',
      canExecute: false,
      disabledReason: `Раздел «${rawTab}» не существует на сайте`,
    };
  }

  const tabTitle = APPLICATION_TAB_TITLES[canonical] || canonical;
  return {
    id: actionId,
    type: 'open_tab',
    tabId: canonical,
    tabTitle,
    label: customLabel?.trim() || `Перейти: ${tabTitle}`,
    canExecute: true,
  };
}

/**
 * Factory and Validator for OpenUniversityAction
 */
export function createOpenUniversityAction(
  rawId: string,
  customLabel?: string
): OpenUniversityAction {
  const normId = (rawId || '').trim().toLowerCase();
  const u = getUniversityById(normId);
  const actionId = `vuz-${normId}-${Date.now()}`;

  if (!u) {
    return {
      id: actionId,
      type: 'open_university',
      universityId: normId,
      universityName: 'Неизвестный вуз',
      label: customLabel || `Вуз «${normId}»`,
      canExecute: false,
      disabledReason: `Университет с идентификатором «${normId}» не найден в каталоге`,
    };
  }

  return {
    id: actionId,
    type: 'open_university',
    universityId: u.id,
    universityName: u.shortName,
    label: customLabel?.trim() || `Карточка вуза: ${u.shortName}`,
    canExecute: true,
  };
}

/**
 * Factory and Validator for OpenProgramAction
 */
export function createOpenProgramAction(
  codeOrId: string,
  universityId?: string,
  customLabel?: string
): OpenProgramAction {
  const normCode = (codeOrId || '').trim();
  const prog = FULL_PROGRAMS.find(
    (p) => p.code === normCode || p.id === normCode || p.id.toLowerCase() === normCode.toLowerCase()
  );
  const actionId = `prog-${normCode}-${Date.now()}`;

  if (!prog) {
    return {
      id: actionId,
      type: 'open_program',
      code: normCode,
      label: customLabel || `Программа ${normCode}`,
      canExecute: false,
      disabledReason: `Программа «${normCode}» не найдена в каталоге`,
    };
  }

  return {
    id: actionId,
    type: 'open_program',
    programId: prog.id,
    code: prog.code,
    programName: prog.name,
    universityId: universityId || prog.universityId,
    label: customLabel || `📚 Программа ${prog.code}: ${prog.name}`,
    canExecute: true,
  };
}

/**
 * Factory and Validator for CompareUniversitiesAction
 */
export function createCompareAction(
  rawIds: string[] | string,
  customLabel?: string,
  fallbackUniversities?: University[]
): CompareUniversitiesAction {
  const list = Array.isArray(rawIds)
    ? rawIds
    : typeof rawIds === 'string'
    ? rawIds.split(',').map((s) => s.trim())
    : [];

  const validUniversities: University[] = [];
  for (const id of list) {
    const u = getUniversityById(id);
    if (u && !validUniversities.some((existing) => existing.id === u.id)) {
      validUniversities.push(u);
    }
  }

  // If no IDs given in tag, use contextual universities (e.g. from comparison query)
  if (validUniversities.length === 0 && fallbackUniversities && fallbackUniversities.length > 0) {
    for (const u of fallbackUniversities.slice(0, 4)) {
      if (!validUniversities.some((existing) => existing.id === u.id)) {
        validUniversities.push(u);
      }
    }
  }

  const actionId = `compare-${Date.now()}`;

  // Limit to max 4 universities
  const clamped = validUniversities.slice(0, 4);

  if (clamped.length === 0) {
    return {
      id: actionId,
      type: 'compare_universities',
      universityIds: [],
      universityNames: [],
      label: customLabel || 'Сравнить вузы',
      canExecute: false,
      disabledReason: 'Для сравнения необходимо указать хотя бы один существующий вуз',
    };
  }

  const names = clamped.map((u) => u.shortName);
  const defaultLabel =
    clamped.length === 1
      ? `Сравнить: ${names[0]} с другими`
      : `Сравнить: ${names.join(' и ')}`;

  return {
    id: actionId,
    type: 'compare_universities',
    universityIds: clamped.map((u) => u.id),
    universityNames: names,
    label: customLabel?.trim() || defaultLabel,
    canExecute: true,
  };
}

/**
 * Factory and Validator for ManageShortlistAction
 */
export function createManageShortlistAction(
  action: 'add' | 'remove',
  rawId: string,
  customLabel?: string
): ManageShortlistAction {
  const normId = (rawId || '').trim().toLowerCase();
  const u = getUniversityById(normId);
  const actionId = `shortlist-${action}-${normId}-${Date.now()}`;

  if (!u) {
    return {
      id: actionId,
      type: 'manage_shortlist',
      action,
      universityId: normId,
      universityName: 'Неизвестный вуз',
      label: customLabel || (action === 'add' ? 'Добавить в приоритеты' : 'Удалить из приоритетов'),
      canExecute: false,
      disabledReason: `Вуз «${normId}» не найден`,
    };
  }

  const defaultLabel =
    action === 'add'
      ? `⭐ Добавить ${u.shortName} в мои 5 приоритетов`
      : `❌ Удалить ${u.shortName} из приоритетов`;

  return {
    id: actionId,
    type: 'manage_shortlist',
    action,
    universityId: u.id,
    universityName: u.shortName,
    label: customLabel?.trim() || defaultLabel,
    canExecute: true,
    requiresConfirmation: action === 'remove',
    confirmationMessage: `Удалить ${u.shortName} из вашего списка 5 приоритетных вузов?`,
  };
}

/**
 * Factory and Validator for ApplyCatalogFiltersAction
 */
export function createApplyFiltersAction(
  filters: CatalogFiltersPayload,
  customLabel?: string
): ApplyCatalogFiltersAction {
  const actionId = `filter-${Date.now()}`;
  const parts: string[] = [];

  if (filters.city) parts.push(`г. ${filters.city}`);
  if (filters.direction) parts.push(filters.direction);
  if (filters.hasMilitary) parts.push('с ВУЦ');
  if (filters.hasDorm) parts.push('с общежитием');
  if (filters.maxScore) parts.push(`до ${filters.maxScore} б.`);

  const filterSummary = parts.length > 0 ? parts.join(', ') : 'Все вузы';
  const defaultLabel = `Фильтр каталога: ${filterSummary}`;

  return {
    id: actionId,
    type: 'apply_catalog_filters',
    filters,
    label: customLabel?.trim() || defaultLabel,
    canExecute: true,
  };
}

/**
 * Factory and Validator for OpenCalculatorAction
 */
export function createOpenCalculatorAction(
  calcType: 'ege' | 'credit' | 'achievements' | 'student_budget',
  score?: number,
  city?: string,
  customLabel?: string
): OpenCalculatorAction {
  const actionId = `calc-${calcType}-${Date.now()}`;
  const titles: Record<string, string> = {
    ege: score ? `Калькулятор шансов ЕГЭ (${score} б.)` : 'Калькулятор шансов ЕГЭ',
    credit: 'Симулятор кредита под 3%',
    achievements: 'Калькулятор индивидуальных достижений',
    student_budget: city ? `Калькулятор бюджета студента (${city})` : 'Калькулятор бюджета студента',
  };

  return {
    id: actionId,
    type: 'open_calculator',
    calculatorType: calcType,
    score,
    city,
    label: customLabel?.trim() || titles[calcType] || 'Открыть калькулятор',
    canExecute: true,
  };
}

/**
 * Parses raw action tag syntax from assistant model or local responses into strongly-typed actions.
 * 
 * Supports syntaxes:
 * 1. [ACTION: compare:mgu,hse | Сравнить МГУ и ВШЭ]
 * 2. [ACTION: vuz:bmstu | Открыть Бауманку]
 * 3. [ACTION: shortlist_add:hse | В приоритеты]
 * 4. [ACTION: filter:city=Москва,military=true | Вузы Москвы]
 * 5. [ACTION: calculator:260 | Рассчитать шансы]
 * 6. [ACTION: student_budget | Рассчитать расходы]
 * 7. Legacy: [ACTION: comparison | Сравнить] -> auto-normalizes to compare with context universities
 * 8. Legacy: [ACTION: budget | Бюджет] -> auto-normalizes to student_budget
 */
export function parseAndValidateAssistantActions(
  text: string,
  contextUniversities: University[] = []
): { cleanText: string; actions: AppAssistantAction[] } {
  const actions: AppAssistantAction[] = [];
  const actionRegex = /\[ACTION:\s*([^|]+)\|\s*([^\]]+)\]/gi;

  let cleanText = text;
  let match: RegExpExecArray | null;

  while ((match = actionRegex.exec(text)) !== null) {
    const rawTarget = match[1].trim();
    const rawLabel = match[2].trim();

    // 1. Structured action syntax: type:param1,param2...
    if (rawTarget.includes(':')) {
      const colonIdx = rawTarget.indexOf(':');
      const prefix = rawTarget.slice(0, colonIdx).trim().toLowerCase();
      const params = rawTarget.slice(colonIdx + 1).trim();

      if (prefix === 'compare' || prefix === 'comparison') {
        const ids = params.split(',').map((s) => s.trim());
        actions.push(createCompareAction(ids, rawLabel, contextUniversities));
        continue;
      }

      if (prefix === 'vuz' || prefix === 'university') {
        actions.push(createOpenUniversityAction(params, rawLabel));
        continue;
      }

      if (prefix === 'shortlist_add' || prefix === 'favorite_add') {
        actions.push(createManageShortlistAction('add', params, rawLabel));
        continue;
      }

      if (prefix === 'shortlist_remove' || prefix === 'favorite_remove') {
        actions.push(createManageShortlistAction('remove', params, rawLabel));
        continue;
      }

      if (prefix === 'filter') {
        const filterPairs = params.split(',').map((p) => p.trim());
        const filters: CatalogFiltersPayload = {};
        for (const pair of filterPairs) {
          const [k, v] = pair.split('=').map((s) => s?.trim());
          if (k === 'city') filters.city = v;
          if (k === 'direction') filters.direction = v;
          if (k === 'military') filters.hasMilitary = v === 'true';
          if (k === 'dorm') filters.hasDorm = v === 'true';
          if (k === 'score') filters.maxScore = parseInt(v, 10);
        }
        actions.push(createApplyFiltersAction(filters, rawLabel));
        continue;
      }

      if (prefix === 'calculator') {
        const score = parseInt(params, 10);
        actions.push(createOpenCalculatorAction('ege', isNaN(score) ? undefined : score, undefined, rawLabel));
        continue;
      }
    }

    // 2. Simple target syntax: tab or alias
    const canonicalTab = resolveCanonicalTab(rawTarget);

    if (rawTarget === 'explain_more') {
      actions.push({
        id: `explain-${Date.now()}`,
        type: 'explain_more',
        label: rawLabel || '📖 Раскрыть подробнее',
        canExecute: true,
      });
      continue;
    }

    if (canonicalTab === 'compare') {
      // Automatic enrichment: if the query referenced universities, pass them into comparison!
      actions.push(createCompareAction([], rawLabel, contextUniversities));
      continue;
    }

    if (canonicalTab === 'student_budget') {
      actions.push(createOpenCalculatorAction('student_budget', undefined, undefined, rawLabel));
      continue;
    }

    if (canonicalTab) {
      actions.push(createOpenTabAction(canonicalTab, rawLabel));
      continue;
    }

    // 3. Fallback for unrecognized or unsafe targets
    actions.push({
      id: `invalid-${Date.now()}`,
      type: 'open_tab',
      tabId: 'catalog',
      tabTitle: 'Каталог',
      label: rawLabel || 'Недоступное действие',
      canExecute: false,
      disabledReason: `Раздел «${rawTarget}» не поддерживается веб-сайтом`,
    });
  }

  cleanText = cleanText.replace(actionRegex, '').trim();
  return { cleanText, actions };
}

/**
 * Shared state handlers required by the action dispatcher in the application
 */
export interface ApplicationActionDispatcherHandlers {
  setCurrentTab: (tab: ApplicationTab) => void;
  setSelectedUniversityDetail: (u: University | null) => void;
  setCompareList: (updater: (prev: string[]) => string[]) => void;
  setFavorites: (updater: (prev: string[]) => string[]) => void;
  setSelectedCity?: (city: string) => void;
  setIsAssistantOpen?: (open: boolean) => void;
  onOpenChecklistArtifact?: (items: any[], title?: string) => void;
  onSendAssistantPrompt?: (prompt: string) => void;
  showToast: (message: string) => void;
}

/**
 * Central Execution Dispatcher for Assistant Actions in the application
 */
export function executeAppAssistantAction(
  action: AppAssistantAction,
  handlers: ApplicationActionDispatcherHandlers
): boolean {
  if (!action.canExecute) {
    handlers.showToast(`Действие недоступно: ${action.disabledReason || 'неизвестная ошибка'}`);
    return false;
  }

  switch (action.type) {
    case 'open_tab': {
      handlers.setCurrentTab(action.tabId);
      handlers.setIsAssistantOpen?.(false);
      return true;
    }

    case 'open_university': {
      const u = getUniversityById(action.universityId);
      if (u) {
        handlers.setSelectedUniversityDetail(u);
        handlers.setIsAssistantOpen?.(false);
        return true;
      }
      handlers.showToast(`Вуз «${action.universityId}» не найден`);
      return false;
    }

    case 'open_program': {
      handlers.setCurrentTab('programs');
      handlers.setIsAssistantOpen?.(false);
      return true;
    }

    case 'compare_universities': {
      const validUniversities = action.universityIds
        .map((id) => getUniversityById(id))
        .filter((u): u is University => u !== null);

      if (validUniversities.length === 0) {
        handlers.showToast('Вузы для сравнения не найдены');
        return false;
      }

      handlers.setCompareList((prev) => {
        const combined = Array.from(new Set([...validUniversities.map((u) => u.id), ...prev]));
        return combined.slice(0, 4);
      });

      handlers.setCurrentTab('compare');
      handlers.setIsAssistantOpen?.(false);
      const names = validUniversities.map((u) => u.shortName).join(' и ');
      handlers.showToast(`В сравнение добавлены: ${names}`);
      return true;
    }

    case 'manage_shortlist': {
      const u = getUniversityById(action.universityId);
      if (!u) {
        handlers.showToast(`Вуз «${action.universityId}» не найден`);
        return false;
      }

      if (action.action === 'add') {
        let added = false;
        handlers.setFavorites((prev) => {
          if (prev.includes(u.id)) {
            handlers.showToast(`${u.shortName} уже в приоритетах`);
            return prev;
          }
          if (prev.length >= 5) {
            alert('По правилам поступления в РФ можно выбрать не более 5 вузов в приоритетный список.');
            return prev;
          }
          added = true;
          return [...prev, u.id];
        });
        if (added) {
          handlers.showToast(`Добавлено в 5 приоритетов: ${u.shortName}`);
        }
      } else {
        handlers.setFavorites((prev) => prev.filter((id) => id !== u.id));
        handlers.showToast(`Удалено из приоритетов: ${u.shortName}`);
      }
      return true;
    }

    case 'apply_catalog_filters': {
      if (action.filters.city && handlers.setSelectedCity) {
        handlers.setSelectedCity(action.filters.city);
      }
      handlers.setCurrentTab('catalog');
      handlers.setIsAssistantOpen?.(false);
      handlers.showToast('Фильтры каталога применены');
      return true;
    }

    case 'open_calculator': {
      const tabMap: Record<string, ApplicationTab> = {
        ege: 'calculator',
        credit: 'credit',
        achievements: 'achievements',
        student_budget: 'student_budget',
      };
      const targetTab = tabMap[action.calculatorType] || 'calculator';
      handlers.setCurrentTab(targetTab);
      handlers.setIsAssistantOpen?.(false);
      return true;
    }

    case 'create_checklist': {
      if (handlers.onOpenChecklistArtifact) {
        handlers.onOpenChecklistArtifact(action.items, action.title);
        return true;
      }
      return false;
    }

    case 'explain_more': {
      if (handlers.onSendAssistantPrompt) {
        handlers.onSendAssistantPrompt(action.prompt || 'Расскажи подробнее с деталями и статистикой');
        return true;
      }
      return false;
    }

    default:
      return false;
  }
}
