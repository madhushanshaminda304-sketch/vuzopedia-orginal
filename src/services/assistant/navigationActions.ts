import {
  ValidActionTab,
  VALID_ACTION_TABS,
  ValidatedAction,
  ExtractedQueryFilters,
  ApplicationTab,
  APPLICATION_TABS,
  APPLICATION_TAB_TITLES,
  TAB_ALIASES,
  AppAssistantAction,
  resolveCanonicalTab,
  createOpenTabAction,
  createCompareAction,
  createOpenUniversityAction,
  createApplyFiltersAction,
  createOpenCalculatorAction,
  parseAndValidateAssistantActions,
} from './types';
import { University } from '../../types';

export const ACTION_TAB_DESCRIPTIONS: Record<string, string> = {
  ...APPLICATION_TAB_TITLES,
  comparison: 'Сравнение выбранных вузов',
  budget: 'Калькулятор бюджета студента',
  colleges: 'Колледжи и техникумы (СПО)',
  explain_more: 'Раскрыть подробнее с деталями и статистикой',
};

/**
 * Validates a candidate action tab ID against supported platform tabs or aliases.
 */
export function isValidActionTab(tab: string): tab is ValidActionTab {
  if (!tab || typeof tab !== 'string') return false;
  const clean = tab.trim().toLowerCase();
  return (
    VALID_ACTION_TABS.includes(clean as ValidActionTab) ||
    Boolean(resolveCanonicalTab(clean))
  );
}

/**
 * Resolves a raw tab identifier and label into a safe ValidatedAction with canonical tab mapping.
 */
export function resolveAction(
  candidateTab: string,
  customLabel?: string,
  contextUniversities: University[] = []
): ValidatedAction | undefined {
  const cleanTab = (candidateTab || '').trim().toLowerCase();
  const canonical = resolveCanonicalTab(cleanTab);

  if (!canonical && cleanTab !== 'explain_more') {
    return {
      tabId: 'catalog',
      label: customLabel || 'Раздел недоступен',
      canExecute: false,
      disabledReason: `Раздел «${candidateTab}» не поддерживается на сайте`,
    };
  }

  const effectiveTab = (canonical || cleanTab) as ValidActionTab;
  const defaultLabel = ACTION_TAB_DESCRIPTIONS[effectiveTab] || 'Перейти в раздел';
  const label = customLabel && customLabel.trim() ? customLabel.trim() : defaultLabel;

  if (effectiveTab === 'compare') {
    const compareAction = createCompareAction([], label, contextUniversities);
    return {
      tabId: 'compare',
      label: compareAction.label,
      action: compareAction,
      canExecute: compareAction.canExecute,
      disabledReason: compareAction.disabledReason,
    };
  }

  if (effectiveTab === 'student_budget') {
    const calcAction = createOpenCalculatorAction('student_budget', undefined, undefined, label);
    return {
      tabId: 'student_budget',
      label: calcAction.label,
      action: calcAction,
      canExecute: true,
    };
  }

  const tabAction = createOpenTabAction(effectiveTab, label);
  return {
    tabId: effectiveTab,
    label: tabAction.label,
    action: tabAction,
    canExecute: tabAction.canExecute,
    disabledReason: tabAction.disabledReason,
  };
}

/**
 * Extracts and removes [ACTION: ...] tags from raw text, validating against allowed actions and routes.
 */
export function parseAndExtractActions(
  text: string,
  contextUniversities: University[] = []
): { cleanText: string; actions: ValidatedAction[] } {
  const { cleanText, actions: richActions } = parseAndValidateAssistantActions(text, contextUniversities);

  const actions: ValidatedAction[] = richActions.map((ra) => {
    let tabId: ValidActionTab = 'catalog';

    if (ra.type === 'open_tab') {
      tabId = ra.tabId;
    } else if (ra.type === 'compare_universities') {
      tabId = 'compare';
    } else if (ra.type === 'open_university') {
      tabId = 'catalog';
    } else if (ra.type === 'open_calculator') {
      const tabMap: Record<string, ValidActionTab> = {
        ege: 'calculator',
        credit: 'credit',
        achievements: 'achievements',
        student_budget: 'student_budget',
      };
      tabId = tabMap[ra.calculatorType] || 'calculator';
    } else if (ra.type === 'apply_catalog_filters') {
      tabId = 'catalog';
    } else if (ra.type === 'manage_shortlist') {
      tabId = 'tracker';
    } else if (ra.type === 'explain_more') {
      tabId = 'explain_more';
    }

    return {
      tabId,
      label: ra.label,
      action: ra,
      canExecute: ra.canExecute,
      disabledReason: ra.disabledReason,
      requiresConfirmation: ra.requiresConfirmation,
      confirmationMessage: ra.confirmationMessage,
    };
  });

  return { cleanText, actions };
}

/**
 * Determines the most appropriate default navigation action based on student intent and filters.
 * Ensures comparison actions carry the matched university IDs so comparison opens with selected entities!
 */
export function determineDefaultAction(
  query: string,
  filters: ExtractedQueryFilters,
  isComparison: boolean,
  matchedUniversities: University[] = []
): ValidatedAction {
  const q = query.toLowerCase();

  // 1. Comparison Intent: carry specified universities so comparison is not empty!
  if (isComparison || q.includes('сравн')) {
    const compareAction = createCompareAction([], undefined, matchedUniversities);
    return {
      tabId: 'compare',
      label: compareAction.label || 'Сравнить выбранные вузы',
      action: compareAction,
      canExecute: compareAction.canExecute,
      disabledReason: compareAction.disabledReason,
    };
  }

  // 2. Specific single university inspection
  if (matchedUniversities.length === 1 && !filters.score && (q.includes('карточк') || q.includes('подробн') || q.includes('про вуз'))) {
    const vuzAction = createOpenUniversityAction(matchedUniversities[0].id);
    return {
      tabId: 'catalog',
      label: vuzAction.label,
      action: vuzAction,
      canExecute: vuzAction.canExecute,
    };
  }

  // 3. Domain-specific routes
  if (filters.direction?.includes('IT') || q.includes('программ')) {
    const tabAction = createOpenTabAction('programs', 'Смотреть IT-программы вузов');
    return { tabId: 'programs', label: tabAction.label, action: tabAction, canExecute: true };
  }

  if (filters.wantsMilitary) {
    const tabAction = createOpenTabAction('military', 'Открыть реестр ВУЦ и нормативы');
    return { tabId: 'military', label: tabAction.label, action: tabAction, canExecute: true };
  }

  if (filters.wantsDorm) {
    const tabAction = createOpenTabAction('dorms', 'Перейти в каталог общежитий');
    return { tabId: 'dorms', label: tabAction.label, action: tabAction, canExecute: true };
  }

  if (filters.wantsOlympiads) {
    const tabAction = createOpenTabAction('olympiads', 'Открыть навигатор Олимпиад и БВИ');
    return { tabId: 'olympiads', label: tabAction.label, action: tabAction, canExecute: true };
  }

  if (filters.wantsFinance || q.includes('кредит')) {
    const calcAction = createOpenCalculatorAction('credit', undefined, undefined, 'Рассчитать кредит 3% в Симуляторе');
    return { tabId: 'credit', label: calcAction.label, action: calcAction, canExecute: true };
  }

  if (q.includes('бюджет') && (q.includes('расход') || q.includes('прожив') || q.includes('трат') || q.includes('цен'))) {
    const budgetAction = createOpenCalculatorAction('student_budget', undefined, filters.city || undefined, 'Рассчитать расходы студента');
    return { tabId: 'student_budget', label: budgetAction.label, action: budgetAction, canExecute: true };
  }

  if (q.includes('медал') || q.includes('гто') || q.includes('достижен')) {
    const achAction = createOpenCalculatorAction('achievements', undefined, undefined, 'Калькулятор достижений (+10 баллов)');
    return { tabId: 'achievements', label: achAction.label, action: achAction, canExecute: true };
  }

  if (filters.score) {
    const calcAction = createOpenCalculatorAction('ege', filters.score, undefined, `Калькулятор шансов ЕГЭ (${filters.score} б.)`);
    return { tabId: 'calculator', label: calcAction.label, action: calcAction, canExecute: true };
  }

  // 4. Default Catalog
  const defaultAction = createOpenTabAction('catalog', 'Открыть каталог вузов');
  return { tabId: 'catalog', label: defaultAction.label, action: defaultAction, canExecute: true };
}
