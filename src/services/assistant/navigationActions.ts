import { ValidActionTab, VALID_ACTION_TABS, ValidatedAction, ExtractedQueryFilters } from './types';

export const ACTION_TAB_DESCRIPTIONS: Record<ValidActionTab, string> = {
  calculator: 'Калькулятор ЕГЭ 2026',
  programs: 'Каталог программ бакалавриата и специалитета',
  comparison: 'Сравнение выбранных вузов',
  military: 'Военные учебные центры (ВУЦ)',
  dorms: 'Каталог студенческих общежитий',
  olympiads: 'БВИ и перечневые олимпиады РСОШ',
  credit: 'Образовательный кредит с господдержкой 3%',
  achievements: 'Калькулятор индивидуальных достижений (+10 баллов)',
  budget: 'Калькулятор бюджета студента',
  target: 'Целевое обучение от предприятий',
  catalog: 'Каталог вузов России',
};

/**
 * Validates a candidate action tab ID against the supported platform tabs.
 */
export function isValidActionTab(tab: string): tab is ValidActionTab {
  return VALID_ACTION_TABS.includes(tab as ValidActionTab);
}

/**
 * Resolves a raw tab identifier and label into a safe ValidatedAction.
 */
export function resolveAction(candidateTab: string, customLabel?: string): ValidatedAction | undefined {
  const cleanTab = candidateTab.trim().toLowerCase();
  if (!isValidActionTab(cleanTab)) return undefined;

  const defaultLabel = ACTION_TAB_DESCRIPTIONS[cleanTab] || 'Перейти в раздел';
  return {
    tabId: cleanTab,
    label: customLabel && customLabel.trim() ? customLabel.trim() : defaultLabel,
  };
}

/**
 * Extracts and removes [ACTION: tab | label] tags from raw text, validating against allowed tabs.
 */
export function parseAndExtractActions(text: string): { cleanText: string; actions: ValidatedAction[] } {
  const actions: ValidatedAction[] = [];
  const actionRegex = /\[ACTION:\s*([^|]+)\|\s*([^\]]+)\]/gi;

  let cleanText = text;
  let match: RegExpExecArray | null;

  while ((match = actionRegex.exec(text)) !== null) {
    const rawTab = match[1].trim();
    const rawLabel = match[2].trim();
    const resolved = resolveAction(rawTab, rawLabel);
    if (resolved) {
      actions.push(resolved);
    }
  }

  cleanText = cleanText.replace(actionRegex, '').trim();
  return { cleanText, actions };
}

/**
 * Determines the most appropriate default navigation action based on student intent and filters.
 */
export function determineDefaultAction(
  query: string,
  filters: ExtractedQueryFilters,
  isComparison: boolean
): ValidatedAction {
  const q = query.toLowerCase();

  if (isComparison) {
    return { tabId: 'comparison', label: 'Сравнить вузы детально' };
  }
  if (filters.direction?.includes('IT') || q.includes('программ')) {
    return { tabId: 'programs', label: 'Смотреть IT-программы вузов' };
  }
  if (filters.wantsMilitary) {
    return { tabId: 'military', label: 'Открыть реестр ВУЦ и нормативы' };
  }
  if (filters.wantsDorm) {
    return { tabId: 'dorms', label: 'Перейти в каталог общежитий' };
  }
  if (filters.wantsOlympiads) {
    return { tabId: 'olympiads', label: 'Открыть навигатор Олимпиад и БВИ' };
  }
  if (filters.wantsFinance) {
    return { tabId: 'credit', label: 'Рассчитать кредит 3% в Симуляторе' };
  }
  if (q.includes('медал') || q.includes('гто') || q.includes('достижен')) {
    return { tabId: 'achievements', label: 'Калькулятор достижений (+10 баллов)' };
  }
  if (filters.score) {
    return { tabId: 'calculator', label: 'Открыть Калькулятор шансов ЕГЭ' };
  }

  return { tabId: 'catalog', label: 'Открыть каталог вузов' };
}
