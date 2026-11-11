import { ExtractedQueryFilters, SpecialistMode, RAGScopeFilter } from './types';
import { normalizeText, resolveActiveEntityFromHistory } from './entityResolution';
import { University } from '../../types';

export interface QueryInterpretationResult {
  filters: ExtractedQueryFilters;
  isComparison: boolean;
  isUnderspecified: boolean;
  isStrategyRequest: boolean;
  rawScore: number | null;
  targetCity: string | null;
  isCityHard: boolean;
  excludedCities: string[];
  wantsMilitary?: boolean;
  isMilitaryHard: boolean;
  wantsDorm?: boolean;
  isDormHard: boolean;
  wantsIT: boolean;
  wantsFinance: boolean;
  wantsOlympiads: boolean;
  wantsBudgetOnly: boolean;
  anaphoricEntity?: University;
  hardRequirements: string[];
  softPreferences: string[];
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
  const hasMilitary = /(?:^|[^а-яa-z0-9])(воен|вуц|кафедр)(?:[^а-яa-z0-9]|$)/i.test(trimmed);
  const hasDorm = /(?:^|[^а-яa-z0-9])(общаг|общежит)(?:[^а-яa-z0-9]|$)/i.test(trimmed);
  const hasStrategy = /(?:^|[^а-яa-z0-9])(стратег|план|чек[- ]?лист)(?:[^а-яa-z0-9]|$)/i.test(trimmed);

  if (scoreMatch && (!hasMilitary || !hasDorm || !hasStrategy)) {
    return `${trimmed}. Какие лучшие государственные вузы с бюджетными местами, военной кафедрой (ВУЦ) и общежитием? Составь пошаговый чек-лист действий.`;
  }

  if (trimmed.length < 25) {
    return `Подробно разбери запрос «${trimmed}»: проходные баллы на бюджет 2026, конкурс, наличие общежития и военной кафедры, а также составь дорожную карту.`;
  }

  return `${trimmed}. Оцени шансы поступления на бюджет, укажи проходные баллы, наличие общежития и составь интерактивный чек-лист абитуриента.`;
}

/**
 * Extracts student preferences, scores, domain flags, hard/soft constraints,
 * and negation predicates from user query without arbitrary substring collisions.
 */
export function interpretStudentQuery(
  query: string,
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all',
  history: Array<{ sender: string; text: string }> = []
): QueryInterpretationResult {
  const norm = normalizeText(query);
  const spaced = ` ${norm} `;
  const hardRequirements: string[] = [];
  const softPreferences: string[] = [];

  // 1. Follow-up Anaphora Resolution (e.g. "А что с общежитием?", "Сколько стоит в нём?")
  const anaphoricEntity = resolveActiveEntityFromHistory(query, history);

  // 2. Score extraction (3 digits 100-400)
  const scoreMatch = spaced.match(/\b([1-3]\d{2})\b/);
  const rawScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  if (rawScore) {
    hardRequirements.push(`Балл ЕГЭ: ${rawScore}`);
  }

  // 3. Negation & City Detection
  const excludedCities: string[] = [];
  let targetCity: string | null = null;
  let isCityHard = false;

  // City Negation: "не в Москве", "кроме Москвы", "не Москва"
  if (/(?:^|\s)(не в|кроме|не)\s+москв[а-я]*/i.test(spaced)) {
    excludedCities.push('Москва');
  }
  if (/(?:^|\s)(не в|кроме|не)\s+(питер[а-я]*|спб|санкт петербург[а-я]*)/i.test(spaced)) {
    excludedCities.push('Санкт-Петербург');
  }

  // Positive City Detection (only if not negated)
  if (!excludedCities.includes('Москва') && (scope === 'moscow' || /(?:^|\s)(в\s+)?(москв[а-я]*|мск)(?:\s|$)/i.test(spaced))) {
    targetCity = 'Москва';
  } else if (
    !excludedCities.includes('Санкт-Петербург') &&
    (scope === 'spb' || /(?:^|\s)(в\s+)?(питер[а-я]*|спб|санкт петербург[а-я]*)(?:\s|$)/i.test(spaced))
  ) {
    targetCity = 'Санкт-Петербург';
  } else if (/(?:^|\s)(в\s+)?(новосибирск[а-я]*)(?:\s|$)/i.test(spaced)) {
    targetCity = 'Новосибирск';
  } else if (/(?:^|\s)(в\s+)?(казан[а-я]*)(?:\s|$)/i.test(spaced)) {
    targetCity = 'Казань';
  } else if (/(?:^|\s)(в\s+)?(екатеринбург[а-я]*)(?:\s|$)/i.test(spaced)) {
    targetCity = 'Екатеринбург';
  } else if (/(?:^|\s)(в\s+)?(томск[а-я]*)(?:\s|$)/i.test(spaced)) {
    targetCity = 'Томск';
  }

  if (targetCity) {
    isCityHard = /(?:^|\s)(строго|только|исключительно|в городе|город)(?:\s|$)/i.test(spaced);
    if (isCityHard) {
      hardRequirements.push(`Город: только ${targetCity}`);
    } else {
      softPreferences.push(`Город: ${targetCity}`);
    }
  }

  // 4. Military Center (ВУЦ) with Negation & Hard/Soft separation
  let wantsMilitary: boolean | undefined = undefined;
  let isMilitaryHard = false;

  const militaryNegation =
    /(?:^|\s)(без|не нуж[а-я]*|не требу[а-я]*|не важен|без необходимост[а-я]*)\s+(к\s+)?(вуц|военн[а-я]* кафедр[а-я]*|военк[а-я]*)/i.test(
      spaced
    ) || /(?:^|\s)(вуц|военн[а-я]* кафедр[а-я]*)\s+(не нуж[а-я]*|не требу|не важен)/i.test(spaced);

  if (militaryNegation) {
    wantsMilitary = false;
    isMilitaryHard = true;
    hardRequirements.push('Военный учебный центр (ВУЦ): не требуется');
  } else {
    const militaryAffirmation =
      scope === 'military' ||
      mode === 'military' ||
      /(?:^|\s)(вуц|военн[а-я]* кафедр[а-я]*|военн[а-я]* учебн[а-я]* центр[а-я]*|офицер[а-я]* запас[а-я]*|срочн[а-я]* служб[а-я]*|отсрочк[а-я]* от арми[а-я]*)(?:\s|$)/i.test(
        spaced
      );

    if (militaryAffirmation) {
      wantsMilitary = true;
      isMilitaryHard =
        scope === 'military' ||
        mode === 'military' ||
        /(?:^|\s)(строго|только|обязательно|нужен|требуется|наличие)(?:\s|$)/i.test(spaced);
      if (isMilitaryHard) {
        hardRequirements.push('Военный учебный центр (ВУЦ): обязательно');
      } else {
        softPreferences.push('Военный учебный центр (ВУЦ): желательно');
      }
    }
  }

  // 5. Dormitory (Общежитие) with Negation & Hard/Soft separation
  let wantsDorm: boolean | undefined = undefined;
  let isDormHard = false;

  const dormNegation =
    /(?:^|\s)(без|не нуж[а-я]*|не требу[а-я]*|без необходимост[а-я]*|без требован[а-я]*)\s+(к\s+)?(общежити[а-я]*|общаг[а-я]*|проживан[а-я]*|кампус[а-я]*)/i.test(
      spaced
    ) || /(?:^|\s)(общежити[а-я]*|общаг[а-я]*)\s+(не нуж[а-я]*|не требу[а-я]*|не важн[а-я]*)/i.test(spaced);

  if (dormNegation) {
    wantsDorm = false;
    isDormHard = true;
    hardRequirements.push('Общежитие: не требуется');
  } else {
    const dormAffirmation =
      /(?:^|\s)(общежити[а-я]*|общаг[а-я]*|кампус[а-я]*|иногородн[а-я]*|проживан[а-я]*|койко мест[а-я]*)(?:\s|$)/i.test(
        spaced
      );

    if (dormAffirmation) {
      wantsDorm = true;
      isDormHard = /(?:^|\s)(строго|только|обязательно|нужно|требуется|гарантированн[а-я]*)(?:\s|$)/i.test(
        spaced
      );
      if (isDormHard) {
        hardRequirements.push('Общежитие: обязательно');
      } else {
        softPreferences.push('Общежитие: желательно');
      }
    }
  }

  // 6. IT & Computer Science Detection (Strict word boundaries - NO substring false positives)
  // Ensures words like "кредит", "депозит", "визит", "посетить", "защитить" NEVER trigger IT!
  const isCreditQuery = /(?:^|\s)(кредит[а-я]*|займ[а-я]*|ссуд[а-я]*|ставка|3%|сбер|господдержк[а-я]*)(?:\s|$)/i.test(
    spaced
  );

  const itPattern =
    /(?:^|\s)(it|айти|информатик[а-я]*|программирован[а-я]*|программист[а-я]*|программн[а-я]* инженери[а-я]*|софт|software|разработк[а-я]*|ивт|09 03 01|09 03 04|01 03 02|02 03 02|прикладн[а-я]* математик[а-я]*|кибербезопасност[а-я]*|информационн[а-я]* безопасност[а-я]*|искусственн[а-я]* интеллект[а-я]*|data science|ai|ml)(?:\s|$)/i;

  const wantsIT = (scope === 'it' || itPattern.test(spaced)) && !isCreditQuery;
  if (wantsIT) {
    softPreferences.push('Направление: IT / Программная инженерия');
  }

  // 7. Finance & Credit
  const wantsFinance =
    mode === 'finance' ||
    /(?:^|\s)(кредит[а-я]*|3%|сбер|господдержк[а-я]*|стоимост[а-я]* обучен[а-я]*|платн[а-я]* обучен[а-я]*|бюджет студент[а-я]*|расход[а-я]*)(?:\s|$)/i.test(
      spaced
    );
  if (wantsFinance) {
    softPreferences.push('Направление: Финансы и кредит');
  }

  // 8. Olympiads & BVI
  const wantsOlympiads =
    scope === 'olympiads' ||
    mode === 'olympiads' ||
    /(?:^|\s)(олимпиад[а-я]*|бви|рсош|всош|всерос|без вступительн[а-я]*)(?:\s|$)/i.test(spaced);
  if (wantsOlympiads) {
    softPreferences.push('Олимпиады и БВИ: желательно');
  }

  // 9. Budget places only constraint
  const wantsBudgetOnly =
    /(?:^|\s)(только бюджет|на бюджет|бюджетн[а-я]* мест[а-я]*|бесплатн[а-я]* обучен[а-я]*)(?:\s|$)/i.test(
      spaced
    ) && !/(?:^|\s)(платн[а-я]*|коммерческ[а-я]*)(?:\s|$)/i.test(spaced);

  if (wantsBudgetOnly) {
    hardRequirements.push('Только бюджетные места');
  }

  // 10. Comparison Intent
  const isComparison =
    /(?:^|\s)(сравн[а-я]*|против|vs|или|лучше|разниц[а-я]*|отличи[а-я]*)(?:\s|$)/i.test(spaced);

  // 11. Underspecified Intent Check
  const isUnderspecified =
    !rawScore &&
    !anaphoricEntity &&
    (/(куда.*(поступ|пойти)|посоветуй.*вуз|каковы.*шанс|где.*лучше|как.*выбрать.*вуз|помоги.*поступ|какой.*вуз.*выбрать|что.*выбрать|поступлени)/i.test(
      spaced
    ) ||
      norm === 'поступление');

  // 12. Strategy / Roadmap / Checklist Intent
  const isStrategyRequest =
    /(?:^|\s)(стратег[а-я]*|план|дорожн[а-я]* карт[а-я]*|чек[- ]?лист|пошагов[а-я]*|шаг[а-я]*|дедлайн[а-я]*|этап[а-я]*|как подать)(?:\s|$)/i.test(
      spaced
    );

  const filters: ExtractedQueryFilters = {
    score: rawScore,
    city: targetCity,
    isCityHard,
    excludedCities: excludedCities.length > 0 ? excludedCities : undefined,
    direction: wantsIT
      ? 'IT и Программная инженерия'
      : wantsFinance
      ? 'Финансы и Экономика'
      : wantsOlympiads
      ? 'Олимпиады и БВИ'
      : null,
    wantsMilitary,
    isMilitaryHard,
    wantsDorm,
    isDormHard,
    wantsBudgetOnly,
    wantsFinance,
    wantsOlympiads,
    scope: scope !== 'all' ? scope : undefined,
    hardRequirements: hardRequirements.length > 0 ? hardRequirements : undefined,
    softPreferences: softPreferences.length > 0 ? softPreferences : undefined,
    anaphoricEntityId: anaphoricEntity?.id,
  };

  return {
    filters,
    isComparison,
    isUnderspecified,
    isStrategyRequest,
    rawScore,
    targetCity,
    isCityHard,
    excludedCities,
    wantsMilitary,
    isMilitaryHard,
    wantsDorm,
    isDormHard,
    wantsIT,
    wantsFinance,
    wantsOlympiads,
    wantsBudgetOnly,
    anaphoricEntity,
    hardRequirements,
    softPreferences,
  };
}

/**
 * Checks if a query is a supported factual lookup or deterministic tool action
 * that can be answered immediately with high confidence using curated local records.
 */
export function isSupportedFactualLookup(
  context: {
    hasZeroMatches?: boolean;
    isCredit?: boolean;
    isOlympiads?: boolean;
    isDorm?: boolean;
    isMilitary?: boolean;
    toolName?: string;
    extractedFilters?: any;
    matchedUniversities?: any[];
    isUnderspecified?: boolean;
    isComparison?: boolean;
  },
  prompt: string
): boolean {
  // 1. Conflicting criteria / zero matches -> immediate local explanation and alternatives
  if (context.hasZeroMatches) return true;

  const isCredit = Boolean(context.isCredit || context.toolName?.includes('кредит') || /кредит/i.test(prompt));
  const isOlympiads = Boolean(context.isOlympiads || context.toolName?.includes('олимпиад') || /олимпиад/i.test(prompt));
  const isDorm = Boolean(
    context.isDorm ||
    context.extractedFilters?.wantsDorm ||
    context.toolName?.includes('Общежит') ||
    /общежит|общаг/i.test(prompt)
  );
  const isMilitary = Boolean(
    context.isMilitary ||
    context.extractedFilters?.wantsMilitary ||
    context.toolName?.includes('Воен') ||
    /вуц|воен/i.test(prompt)
  );

  // 2. Specific regulatory tools with curated official policies
  if (isCredit) return true;
  if (isOlympiads) return true;

  const matchedCount = context.matchedUniversities?.length ?? 0;

  // 3. Dormitory or Military specific query for a single university
  if ((isDorm || isMilitary) && matchedCount <= 1) {
    return true;
  }

  // 4. Exact factual question for a single university (passing score, address, contact)
  if (
    matchedCount === 1 &&
    !context.isUnderspecified &&
    !context.isComparison
  ) {
    const isDirectFactQuery = /сколько|стоимость|проходной|балл|общежит|вуц|воен|адрес|метро|сайт|факультет|документ/i.test(prompt);
    if (isDirectFactQuery) return true;
  }

  return false;
}
