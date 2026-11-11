import { ExtractedQueryFilters, SpecialistMode, RAGScopeFilter } from './types';

export interface QueryInterpretationResult {
  filters: ExtractedQueryFilters;
  isComparison: boolean;
  isUnderspecified: boolean;
  isStrategyRequest: boolean;
  rawScore: number | null;
  targetCity: string | null;
  wantsMilitary: boolean;
  wantsDorm: boolean;
  wantsIT: boolean;
  wantsFinance: boolean;
  wantsOlympiads: boolean;
}

/**
 * Transforms raw, brief, or vague student input into an enriched admissions prompt.
 */
export function enhanceStudentPrompt(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 'У меня 265 баллов ЕГЭ. Порекомендуй лучшие IT-вузы в Москве с военной кафедрой (ВУЦ) и общежитием, и составь пошаговую стратегию поступления.';
  }

  const scoreMatch = trimmed.match(/\b([1-3]\d{2})\b/);
  const hasMilitary = /(воен|вуц|кафедр)/i.test(trimmed);
  const hasDorm = /(общаг|общежит)/i.test(trimmed);
  const hasStrategy = /(стратег|план|чек[- ]?лист)/i.test(trimmed);

  if (scoreMatch && (!hasMilitary || !hasDorm || !hasStrategy)) {
    return `${trimmed}. Какие лучшие государственные вузы с бюджетными местами, военной кафедрой (ВУЦ) и общежитием? Составь пошаговый чек-лист действий.`;
  }

  if (trimmed.length < 25) {
    return `Подробно разбери запрос «${trimmed}»: проходные баллы на бюджет 2026, конкурс, наличие общежития и военной кафедры, а также составь дорожную карту.`;
  }

  return `${trimmed}. Оцени шансы поступления на бюджет, укажи проходные баллы, наличие общежития и составь интерактивный чек-лист абитуриента.`;
}

/**
 * Extracts student preferences, scores, domain flags, and intent from user query.
 */
export function interpretStudentQuery(
  query: string,
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all'
): QueryInterpretationResult {
  const q = query.toLowerCase().trim();

  // 1. Score extraction (e.g. 240, 285)
  const scoreMatch = q.match(/\b([1-3]\d{2})\b/);
  const rawScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  // 2. City & Scope detection
  let targetCity: string | null = null;
  if (scope === 'moscow' || q.includes('москв')) targetCity = 'Москва';
  else if (scope === 'spb' || q.includes('питер') || q.includes('спб') || q.includes('санкт')) targetCity = 'Санкт-Петербург';
  else if (q.includes('новосибирск')) targetCity = 'Новосибирск';
  else if (q.includes('казан')) targetCity = 'Казань';
  else if (q.includes('екатеринбург')) targetCity = 'Екатеринбург';

  // 3. Domain flags
  const wantsMilitary =
    scope === 'military' ||
    mode === 'military' ||
    q.includes('вуц') ||
    q.includes('военн') ||
    q.includes('кафедр') ||
    q.includes('арми');

  const wantsDorm =
    q.includes('общежит') ||
    q.includes('общаг') ||
    q.includes('жил') ||
    q.includes('иногородн');

  const wantsIT =
    scope === 'it' ||
    q.includes('it') ||
    q.includes('ит') ||
    q.includes('программист') ||
    q.includes('информатик') ||
    q.includes('код') ||
    q.includes('разработ');

  const wantsFinance =
    mode === 'finance' ||
    q.includes('кредит') ||
    q.includes('сбер') ||
    q.includes('3%') ||
    q.includes('стоимост') ||
    q.includes('бюджет');

  const wantsOlympiads =
    scope === 'olympiads' ||
    mode === 'olympiads' ||
    q.includes('олимпиад') ||
    q.includes('бви') ||
    q.includes('рсош') ||
    q.includes('всош');

  // 4. Comparison intent check
  const isComparison =
    q.includes('сравн') ||
    q.includes('против') ||
    q.includes(' vs ') ||
    q.includes(' или ') ||
    q.includes('лучше') ||
    q.includes('отлич');

  // 5. Underspecified intent check
  const isUnderspecified =
    !rawScore &&
    (/(куда.*(поступ|пойти)|посоветуй.*вуз|каковы.*шанс|где.*лучше|как.*выбрать.*вуз|помоги.*поступ|какой.*вуз.*выбрать|что.*выбрать|поступлени)/i.test(
      q
    ) ||
      q === 'поступление');

  // 6. Strategy / Checklist intent check
  const isStrategyRequest = /(стратег|план|дорожн|чек[- ]?лист|пошагов|шаг[а-я]*|дедлайн|документ|этап|как подать)/i.test(
    q
  );

  const filters: ExtractedQueryFilters = {
    score: rawScore,
    city: targetCity,
    direction: wantsIT
      ? 'IT и Программная инженерия'
      : wantsFinance
      ? 'Финансы и Экономика'
      : wantsOlympiads
      ? 'Олимпиады и БВИ'
      : null,
    wantsMilitary,
    wantsDorm,
    wantsFinance,
    wantsOlympiads,
    scope: scope !== 'all' ? scope : undefined,
  };

  return {
    filters,
    isComparison,
    isUnderspecified,
    isStrategyRequest,
    rawScore,
    targetCity,
    wantsMilitary,
    wantsDorm,
    wantsIT,
    wantsFinance,
    wantsOlympiads,
  };
}
