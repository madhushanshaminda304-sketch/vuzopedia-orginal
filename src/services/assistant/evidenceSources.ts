import { University } from '../../types';
import { RetrievedCitationChunk, ExtractedQueryFilters } from './types';

/**
 * Creates a verified admission citation chunk for a given university.
 */
export function createUniversityAdmissionChunk(u: University): RetrievedCitationChunk {
  return {
    id: `chunk-${u.id}-admission`,
    source: 'Локальный каталог Вузопедии: Справочные проходные баллы прошлых лет',
    title: `${u.shortName} (${u.fullName}) • Бюджетные места и конкурс`,
    snippet: `Минимальный проходной балл на бюджет прошлых лет: ${u.minBudgetScore}. Выделено бюджетных мест: ${u.totalBudgetPlaces}. Стоимость платного обучения от ${u.minAnnualFee.toLocaleString()} ₽/год. Город: ${u.city}${u.metro ? ', метро ' + u.metro : ''}.`,
    category: 'university',
    categoryLabel: 'Карточка вуза',
    metadata: {
      city: u.city,
      minScore: u.minBudgetScore,
      budgetPlaces: u.totalBudgetPlaces,
      annualFee: u.minAnnualFee,
      tags: [u.city, 'Бюджет прошлых лет', `Топ #${u.ratingRank}`],
    },
    vuzId: u.id,
  };
}

/**
 * Creates a military center (ВУЦ) citation chunk.
 */
export function createMilitaryChunk(u: University): RetrievedCitationChunk {
  return {
    id: `chunk-${u.id}-vuc`,
    source: 'Справочник Военных учебных центров (ВУЦ) Вузопедии',
    title: `${u.shortName} • Военный учебный центр (ВУЦ)`,
    snippet: u.hasMilitaryDept
      ? 'Военный учебный центр действует. Программы подготовки офицеров и сержантов запаса. Студенты освобождаются от прохождения срочной службы по призыву при успешном окончании.'
      : 'В данном вузе военный учебный центр отсутствует. Предоставляется стандартная академическая отсрочка по ст. 24 ФЗ-53 на время обучения.',
    category: 'military',
    categoryLabel: 'Военный учебный центр',
    metadata: {
      hasMilitary: u.hasMilitaryDept,
      tags: ['ВУЦ', 'Офицер запаса'],
    },
    vuzId: u.id,
  };
}

/**
 * Creates a dormitory citation chunk.
 */
export function createDormitoryChunk(u: University): RetrievedCitationChunk {
  return {
    id: `chunk-${u.id}-dorm`,
    source: 'Справочник студенческих общежитий Вузопедии',
    title: `${u.shortName} • Общежития и проживание`,
    snippet: u.hasDormitory
      ? `Студенческий кампус предоставляет места иногородним первокурсникам очной формы. Ориентировочная стоимость от ${u.dormitoryInfo?.costMonth || 1200} ₽/месяц.`
      : 'Вуз не располагает собственным общежитием. Рекомендуется поиск партнерского или коммерческого жилья.',
    category: 'dorm',
    categoryLabel: 'Студенческое общежитие',
    metadata: {
      hasDorm: u.hasDormitory,
      tags: ['Общежитие', 'Кампус'],
    },
    vuzId: u.id,
  };
}

/**
 * Creates an Olympiads and BVI regulation chunk.
 */
export function createOlympiadsChunk(): RetrievedCitationChunk {
  return {
    id: 'chunk-reg-olympiads',
    source: 'Справочник олимпиад школьников и порядка БВИ Вузопедии',
    title: 'Правила льготы БВИ и подтверждение 75 баллов ЕГЭ',
    snippet:
      'Дипломы олимпиад РСОШ 1–3 уровней дают льготу БВИ при подтверждении профильным предметом ЕГЭ на 75+ баллов. Диплом победителя/призера заключительного этапа ВсОШ дает безусловное зачисление БВИ.',
    category: 'olympiad',
    categoryLabel: 'Олимпиады и БВИ',
    metadata: { tags: ['БВИ', 'РСОШ', 'ВсОШ'] },
  };
}

/**
 * Creates a state-subsidized education credit (3%) chunk.
 */
export function createCreditChunk(): RetrievedCitationChunk {
  return {
    id: 'chunk-reg-credit',
    source: 'Справочник условий образовательного кредита с господдержкой (Сбербанк)',
    title: 'Условия кредита на образование под 3% годовых',
    snippet:
      'Льготная процентная ставка 3% годовых субсидируется государством. Во время обучения и 9 месяцев после выпуска выплачиваются только проценты. Основной долг выплачивается в течение 15 лет после выпуска.',
    category: 'credit',
    categoryLabel: 'Образовательный кредит',
    metadata: { tags: ['Кредит 3%', 'Сбер', 'Господдержка'] },
  };
}

/**
 * Builds all citation chunks and formatted ground-truth evidence text for matched universities.
 */
export function buildEvidencePackage(
  matchedUniversities: University[],
  filters: ExtractedQueryFilters
): { citationChunks: RetrievedCitationChunk[]; evidenceText: string } {
  const citationChunks: RetrievedCitationChunk[] = [];
  const lines: string[] = ['СПРАВОЧНЫЕ ДАННЫЕ ИЗ ЛОКАЛЬНОГО КАТАЛОГА ВУЗОПЕДИИ:'];

  matchedUniversities.forEach((u) => {
    // 1. Admission Chunk
    citationChunks.push(createUniversityAdmissionChunk(u));

    // 2. Military Chunk
    if (filters.wantsMilitary || u.hasMilitaryDept) {
      citationChunks.push(createMilitaryChunk(u));
    }

    // 3. Dormitory Chunk
    if (filters.wantsDorm || u.hasDormitory) {
      citationChunks.push(createDormitoryChunk(u));
    }

    lines.push(
      `• [vuz:${u.id}:${u.shortName}] (${u.fullName}): город ${u.city}${u.metro ? ', метро ' + u.metro : ''}. Проходной балл на бюджет прошлых лет: ${u.minBudgetScore}, мест на бюджете: ${u.totalBudgetPlaces}, платное от ${u.minAnnualFee.toLocaleString()} ₽/год. Военный учебный центр (ВУЦ): ${u.hasMilitaryDept ? 'Есть' : 'Нет'}. Общежитие: ${u.hasDormitory ? 'Предоставляется (' + (u.dormitoryInfo?.costMonth || 1200) + ' ₽/мес)' : 'Нет'}.`
    );
  });

  if (filters.wantsOlympiads) {
    citationChunks.push(createOlympiadsChunk());
    lines.push(
      'ПРАВИЛА БВИ: Дипломы олимпиад РСОШ 1–3 уровней требуют подтверждения профильным ЕГЭ на 75+ баллов. ВсОШ даёт безусловное право БВИ без подтверждения.'
    );
  }

  if (filters.wantsFinance) {
    citationChunks.push(createCreditChunk());
    lines.push(
      'КРЕДИТ С ГОСПОДДЕРЖКОЙ: Фиксированная ставка 3% годовых. Во время учёбы выплачиваются только проценты (~150–600 ₽/мес). Выплата основного долга — в течение 15 лет после выпуска.'
    );
  }

  return {
    citationChunks,
    evidenceText: lines.join('\n'),
  };
}
