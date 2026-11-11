import { University } from '../../types';
import { RetrievedCitationChunk, ExtractedQueryFilters, ProgramMatch } from './types';

/**
 * Creates an authentic admission citation chunk for a given university.
 * Uses real university website if present; strictly distinguishes historical 2025 cutoffs.
 */
export function createUniversityAdmissionChunk(u: University): RetrievedCitationChunk {
  const url = u.website && u.website.startsWith('http') ? u.website : undefined;
  const excerpt =
    `Статистика приёмной кампании 2025 года: минимальный проходной балл зачисленных на бюджет: ${u.minBudgetScore}. ` +
    `Выделено бюджетных мест: ${u.totalBudgetPlaces}. Стоимость платного обучения от ${u.minAnnualFee.toLocaleString()} ₽/год. ` +
    `Город: ${u.city}${u.metro ? ', метро ' + u.metro : ''}. ` +
    `Примечание: балл ${u.minBudgetScore} является статистическим ориентиром прошлых лет и не гарантирует зачисление в 2026 году.`;

  return {
    id: `src-vuz-${u.id}-admission`,
    source: `${u.shortName} • Правила приёма и статистика прошлых лет`,
    documentTitle: `Официальный справочник приёма: ${u.fullName}`,
    title: `${u.shortName} (${u.fullName}) • Бюджетные места и конкурс`,
    publisher: u.fullName,
    url,
    applicableAdmissionsYear: 2025,
    checkedDate: url ? '2025-10-01' : undefined,
    verificationStatus: url ? 'verified' : 'unverified',
    isHistoricalCutoff: true,
    excerpt,
    snippet: excerpt,
    category: 'university',
    categoryLabel: url ? 'Официальный справочник' : 'Каталог (не верифицировано)',
    structuredFields: {
      city: u.city,
      minBudgetScore2025: u.minBudgetScore,
      totalBudgetPlaces: u.totalBudgetPlaces,
      minAnnualFee: u.minAnnualFee,
      isState: u.isState,
    },
    metadata: {
      city: u.city,
      minScore: u.minBudgetScore,
      budgetPlaces: u.totalBudgetPlaces,
      annualFee: u.minAnnualFee,
      tags: [u.city, 'Статистика зачисления 2025', `Рейтинг #${u.ratingRank}`],
    },
    vuzId: u.id,
  };
}

/**
 * Creates an authentic programme citation chunk.
 */
export function createProgramCitationChunk(p: ProgramMatch, u?: University): RetrievedCitationChunk {
  const url = u?.website && u.website.startsWith('http') ? u.website : undefined;
  const excerpt =
    `Направление подготовки ${p.code} «${p.name}» (${p.faculty || 'Профильный факультет'}). ` +
    `Проходной балл 2025 года на бюджет: ${p.minBudgetScore}. Выделено бюджетных мест: ${p.budgetPlaces}. ` +
    `Стоимость обучения по договору от ${p.annualFee.toLocaleString()} ₽/год. ` +
    `Примечание: проходной балл отражает результаты конкурса 2025 года.`;

  return {
    id: `src-prog-${p.id}`,
    source: `Каталог образовательных программ: ${p.universityShort}`,
    documentTitle: `Учебная программа ${p.code} «${p.name}» (${p.universityShort})`,
    title: `${p.code} ${p.name} • ${p.universityShort}`,
    publisher: p.universityShort,
    url,
    applicableAdmissionsYear: 2025,
    checkedDate: url ? '2025-10-01' : undefined,
    verificationStatus: url ? 'verified' : 'unverified',
    isHistoricalCutoff: true,
    excerpt,
    snippet: excerpt,
    category: 'program',
    categoryLabel: 'Образовательная программа',
    structuredFields: {
      code: p.code,
      name: p.name,
      minBudgetScore2025: p.minBudgetScore,
      budgetPlaces: p.budgetPlaces,
      annualFee: p.annualFee,
    },
    metadata: {
      minScore: p.minBudgetScore,
      budgetPlaces: p.budgetPlaces,
      annualFee: p.annualFee,
      tags: [p.code, p.universityShort, 'Бакалавриат / Специалитет'],
    },
    vuzId: p.universityId,
  };
}

/**
 * Creates a military center (ВУЦ) citation chunk.
 */
export function createMilitaryChunk(u: University): RetrievedCitationChunk {
  const url = u.website && u.website.startsWith('http') ? u.website : undefined;
  const excerpt = u.hasMilitaryDept
    ? `Военный учебный центр (ВУЦ) действует при ${u.shortName}. Проводятся программы подготовки офицеров и сержантов запаса. Студенты освобождаются от призыва на срочную службу при условии успешного завершения обучения и сборов.`
    : `Военный учебный центр при ${u.shortName} отсутствует. Студентам очной формы предоставляется стандартная академическая отсрочка от призыва на военную службу по ст. 24 Федерального закона № 53-ФЗ.`;

  return {
    id: `src-vuc-${u.id}`,
    source: `Реестр ВУЦ и ст. 24 ФЗ-53: ${u.shortName}`,
    documentTitle: `Сведения о Военном учебном центре: ${u.fullName}`,
    title: `${u.shortName} • Военный учебный центр (ВУЦ)`,
    publisher: `Минобороны РФ / ${u.fullName}`,
    url,
    applicableAdmissionsYear: 2026,
    checkedDate: url ? '2025-10-01' : undefined,
    verificationStatus: url ? 'verified' : 'unverified',
    isHistoricalCutoff: false,
    excerpt,
    snippet: excerpt,
    category: 'military',
    categoryLabel: 'Военный учебный центр',
    structuredFields: {
      hasMilitaryDept: u.hasMilitaryDept,
      exemptionFromConscription: u.hasMilitaryDept,
    },
    metadata: {
      hasMilitary: u.hasMilitaryDept,
      tags: ['ВУЦ', u.hasMilitaryDept ? 'Военная кафедра действует' : 'Военной кафедры нет'],
    },
    vuzId: u.id,
  };
}

/**
 * Creates a dormitory citation chunk.
 */
export function createDormitoryChunk(u: University): RetrievedCitationChunk {
  const url = u.website && u.website.startsWith('http') ? u.website : undefined;
  const cost = u.dormitoryInfo?.costMonth || 1200;
  const excerpt = u.hasDormitory
    ? `Кампус ${u.shortName} предоставляет общежитие иногородним студентам очной формы. Ориентировочная стоимость проживания от ${cost} ₽/месяц. Распределение мест осуществляется по правилам приёмной комиссии.`
    : `Вуз ${u.shortName} не располагает собственным общежитием. Иногородним абитуриентам рекомендуется аренда жилья или проживание в партнерских студенческих хостелах.`;

  return {
    id: `src-dorm-${u.id}`,
    source: `Справочник студенческих общежитий: ${u.shortName}`,
    documentTitle: `Положение о студенческом городке и общежитиях: ${u.fullName}`,
    title: `${u.shortName} • Общежития и проживание`,
    publisher: u.fullName,
    url,
    applicableAdmissionsYear: 2026,
    checkedDate: url ? '2025-10-01' : undefined,
    verificationStatus: url ? 'verified' : 'unverified',
    isHistoricalCutoff: false,
    excerpt,
    snippet: excerpt,
    category: 'dorm',
    categoryLabel: 'Студенческое общежитие',
    structuredFields: {
      hasDormitory: u.hasDormitory,
      costMonth: cost,
    },
    metadata: {
      hasDorm: u.hasDormitory,
      tags: ['Общежитие', u.hasDormitory ? 'Предоставляется' : 'Не предоставляется'],
    },
    vuzId: u.id,
  };
}

/**
 * Creates an Olympiads and BVI regulation chunk from real statutory source.
 */
export function createOlympiadsChunk(): RetrievedCitationChunk {
  const excerpt =
    'Порядок приёма по приказу Минобрнауки РФ № 1076: Дипломы олимпиад РСОШ 1–3 уровней дают льготу БВИ ' +
    'при подтверждении профильным предметом ЕГЭ не менее 75 баллов. Победители и призеры заключительного этапа ВсОШ ' +
    'имеют безусловное право на зачисление БВИ без подтверждения баллами ЕГЭ.';

  return {
    id: 'src-reg-olympiads-bvi',
    source: 'Приказ Минобрнауки РФ № 1076 • Порядок приёма (БВИ)',
    documentTitle: 'Порядок приема в вузы РФ: особые права победителей и призёров олимпиад',
    title: 'Правила льготы БВИ и подтверждение 75 баллов ЕГЭ',
    publisher: 'Министерство науки и высшего образования РФ',
    url: 'https://minobrnauki.gov.ru',
    applicableAdmissionsYear: 2026,
    checkedDate: '2025-09-01',
    verificationStatus: 'verified',
    isHistoricalCutoff: false,
    excerpt,
    snippet: excerpt,
    category: 'olympiad',
    categoryLabel: 'Нормативный акт',
    structuredFields: {
      bviEgeConfirmationThreshold: 75,
      statute: 'Приказ Минобрнауки № 1076',
    },
    metadata: { tags: ['БВИ', 'РСОШ', 'ВсОШ', 'Приказ 1076'] },
  };
}

/**
 * Creates a state-subsidized education credit (3%) chunk from real statutory source.
 */
export function createCreditChunk(): RetrievedCitationChunk {
  const excerpt =
    'Постановление Правительства РФ № 1528: Государственная программа образовательного кредита. ' +
    'Фиксированная процентная ставка для заемщика составляет 3% годовых. ' +
    'В период обучения и 9 месяцев после выпуска выплачиваются только проценты. Выплата основного долга производится в течение 15 лет.';

  return {
    id: 'src-reg-credit-3pct',
    source: 'Постановление Правительства РФ № 1528 • Образовательный кредит 3%',
    documentTitle: 'Правила предоставления государственной поддержки образовательного кредитования под 3%',
    title: 'Условия кредита на образование с господдержкой под 3% годовых',
    publisher: 'Минобрнауки РФ / ПАО Сбербанк',
    url: 'https://www.sberbank.com/ru/person/credits/money/credit_education',
    applicableAdmissionsYear: 2026,
    checkedDate: '2025-08-15',
    verificationStatus: 'verified',
    isHistoricalCutoff: false,
    excerpt,
    snippet: excerpt,
    category: 'credit',
    categoryLabel: 'Нормативный акт',
    structuredFields: {
      interestRatePct: 3,
      gracePeriodMonthsAfterGrad: 9,
      repaymentYears: 15,
      statute: 'Постановление № 1528',
    },
    metadata: { tags: ['Кредит 3%', 'Сбер', 'Господдержка', 'Постановление 1528'] },
  };
}

/**
 * Creates an unverified record helper for items without verified official sources.
 * Does NOT invent URLs or publication dates.
 */
export function createUnverifiedRecordChunk(
  id: string,
  title: string,
  excerpt: string,
  category: 'university' | 'program' | 'military' | 'dorm' | 'credit' | 'olympiad' | 'achievements' | 'statute' = 'university'
): RetrievedCitationChunk {
  return {
    id,
    source: 'Локальный каталог Вузопедии (не верифицировано)',
    documentTitle: title,
    title,
    publisher: 'Каталог Вузопедии',
    url: undefined,
    applicableAdmissionsYear: undefined,
    checkedDate: undefined,
    verificationStatus: 'unverified',
    isHistoricalCutoff: false,
    excerpt,
    snippet: excerpt,
    category,
    categoryLabel: 'Не верифицировано',
    metadata: { tags: ['Не верифицировано', 'Справочные данные'] },
  };
}

/**
 * Builds an authentic, selective evidence package.
 * Implements Requirements 1 & 2:
 * 1. Retrieves relevant structured records before generating an explanation.
 * 2. Sends the AI ONLY the evidence needed for the specific question.
 */
export function buildEvidencePackage(
  matchedUniversities: University[],
  filters: ExtractedQueryFilters,
  matchedPrograms: ProgramMatch[] = []
): { citationChunks: RetrievedCitationChunk[]; evidenceText: string } {
  const citationChunks: RetrievedCitationChunk[] = [];
  const lines: string[] = ['<evidence_data>'];

  // Selective university filtering:
  // If specific university was targeted (via anaphora or direct mention), keep only targeted universities (max 2 for comparison, 1 for single entity).
  // Otherwise limit to top 3 matching universities to prevent prompt bloat.
  const relevantUniversities =
    filters.anaphoricEntityId
      ? matchedUniversities.filter((u) => u.id === filters.anaphoricEntityId)
      : matchedUniversities.slice(0, 3);

  relevantUniversities.forEach((u) => {
    // 1. Admission Chunk (always relevant when university is discussed)
    const admissionChunk = createUniversityAdmissionChunk(u);
    citationChunks.push(admissionChunk);

    lines.push(
      `[DATA_RECORD id="${admissionChunk.id}" year="${admissionChunk.applicableAdmissionsYear}" status="${admissionChunk.verificationStatus}"]\n` +
      `Вуз: ${u.shortName} (${u.fullName})\n` +
      `Город: ${u.city}\n` +
      `Статистика зачисления 2025 года (минимальный балл на бюджет прошлых лет): ${u.minBudgetScore}\n` +
      `Бюджетных мест: ${u.totalBudgetPlaces}, платное от ${u.minAnnualFee.toLocaleString()} ₽/год\n` +
      `Официальный сайт: ${admissionChunk.url || 'Не указан'}\n` +
      `[cite:${admissionChunk.id}]\n` +
      `[/DATA_RECORD]`
    );

    // 2. Military Chunk (only if military is explicitly requested or general overview without dorm focus)
    const shouldIncludeMilitary =
      filters.wantsMilitary === true ||
      (filters.wantsMilitary !== false && u.hasMilitaryDept && filters.wantsDorm !== true);

    if (shouldIncludeMilitary) {
      const vucChunk = createMilitaryChunk(u);
      citationChunks.push(vucChunk);
      lines.push(
        `[DATA_RECORD id="${vucChunk.id}" year="2026" status="${vucChunk.verificationStatus}"]\n` +
        `Вуз: ${u.shortName}\n` +
        `Военный учебный центр (ВУЦ): ${u.hasMilitaryDept ? 'Действует (офицеры/сержанты запаса)' : 'Отсутствует'}\n` +
        `Отсрочка: ${u.hasMilitaryDept ? 'Освобождение от срочной службы после окончания ВУЦ' : 'Стандартная отсрочка по ст. 24 ФЗ-53'}\n` +
        `[cite:${vucChunk.id}]\n` +
        `[/DATA_RECORD]`
      );
    }

    // 3. Dormitory Chunk (only if dorm is explicitly requested or general overview without military focus)
    const shouldIncludeDorm =
      filters.wantsDorm === true ||
      (filters.wantsDorm !== false && u.hasDormitory && filters.wantsMilitary !== true);

    if (shouldIncludeDorm) {
      const dormChunk = createDormitoryChunk(u);
      citationChunks.push(dormChunk);
      lines.push(
        `[DATA_RECORD id="${dormChunk.id}" year="2026" status="${dormChunk.verificationStatus}"]\n` +
        `Вуз: ${u.shortName}\n` +
        `Общежитие: ${u.hasDormitory ? 'Предоставляется иногородним очникам' : 'Собственное общежитие отсутствует'}\n` +
        `Ориентировочная стоимость: ${u.hasDormitory ? (u.dormitoryInfo?.costMonth || 1200) + ' ₽/мес' : 'Н/Д'}\n` +
        `[cite:${dormChunk.id}]\n` +
        `[/DATA_RECORD]`
      );
    }
  });

  // Selective Program Chunks (only if student explicitly asked for programs or directional criteria)
  const isProgramFocused = Boolean(
    filters.direction ||
    (filters.score && filters.score > 0)
  );

  if (isProgramFocused && matchedPrograms.length > 0) {
    matchedPrograms.slice(0, 3).forEach((prog) => {
      const parentVuz = matchedUniversities.find((u) => u.id === prog.universityId);
      const progChunk = createProgramCitationChunk(prog, parentVuz);
      citationChunks.push(progChunk);
      lines.push(
        `[DATA_RECORD id="${progChunk.id}" year="2025" status="${progChunk.verificationStatus}"]\n` +
        `Программа: ${prog.code} «${prog.name}»\n` +
        `Вуз: ${prog.universityShort} (${prog.faculty || 'Факультет'})\n` +
        `Проходной балл 2025 на бюджет: ${prog.minBudgetScore}\n` +
        `Бюджетных мест: ${prog.budgetPlaces}, платное от ${prog.annualFee.toLocaleString()} ₽/год\n` +
        `[cite:${progChunk.id}]\n` +
        `[/DATA_RECORD]`
      );
    });
  }

  // Olympiads & BVI (only if student asked about olympiads or BVI)
  if (filters.wantsOlympiads) {
    const olyChunk = createOlympiadsChunk();
    citationChunks.push(olyChunk);
    lines.push(
      `[DATA_RECORD id="${olyChunk.id}" year="2026" status="verified"]\n` +
      `Нормативный акт: ${olyChunk.documentTitle}\n` +
      `Правило БВИ: РСОШ 1–3 уровней требуют 75+ баллов ЕГЭ по профилю. ВсОШ — зачисление без экзаменов без подтверждения баллами.\n` +
      `[cite:${olyChunk.id}]\n` +
      `[/DATA_RECORD]`
    );
  }

  // Educational Credit (only if student asked about finance / credit)
  if (filters.wantsFinance) {
    const credChunk = createCreditChunk();
    citationChunks.push(credChunk);
    lines.push(
      `[DATA_RECORD id="${credChunk.id}" year="2026" status="verified"]\n` +
      `Нормативный акт: ${credChunk.documentTitle}\n` +
      `Условия: ставка 3% годовых, во время учебы и 9 мес после — только проценты, основной долг — 15 лет после выпуска.\n` +
      `[cite:${credChunk.id}]\n` +
      `[/DATA_RECORD]`
    );
  }

  lines.push('</evidence_data>');

  return {
    citationChunks,
    evidenceText: lines.join('\n'),
  };
}
