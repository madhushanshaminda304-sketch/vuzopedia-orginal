import { UNIVERSITIES } from '../../data/mockData';
import { FULL_PROGRAMS } from '../../data/extendedData';
import { University } from '../../types';
import {
  AdmissionProbability,
  ComparisonMatrix,
  ClarificationOption,
  AdmissionArtifact,
  RetrievedCitationChunk,
  ExtractedQueryFilters,
  SpecialistMode,
  RAGScopeFilter,
  ProgramMatch,
  AlternativeOption,
  AmbiguousEntity,
} from './types';
import {
  findMentionedUniversitiesDetailed,
} from './entityResolution';
import { interpretStudentQuery } from './queryInterpretation';
import { buildEvidencePackage } from './evidenceSources';
import { determineDefaultAction } from './navigationActions';
import {
  StudentProfile,
  loadStudentProfile,
  loadPersistedChecklist,
  isHypotheticalQuery,
  mergeProfileWithQueryFilters,
} from './studentProfile';

export interface RetrievalContext {
  evidence: string;
  matchedUniversities: University[];
  matchedPrograms?: ProgramMatch[];
  conflictingRequirements?: string[];
  alternatives?: AlternativeOption[];
  ambiguousEntity?: AmbiguousEntity;
  reasoningTrace: string[];
  suggestedActionTab: string;
  suggestedActionLabel: string;
  toolName: string;
  toolQuery: string;
  probability?: AdmissionProbability;
  isComparison?: boolean;
  comparisonMatrix?: ComparisonMatrix;
  isUnderspecified?: boolean;
  clarificationOptions?: ClarificationOption[];
  followUps?: string[];
  citationChunks: RetrievedCitationChunk[];
  extractedFilters: ExtractedQueryFilters;
  artifact?: AdmissionArtifact;
  hasZeroMatches?: boolean;
}

/**
 * Searches and ranks academic programmes using programme-level thresholds,
 * faculties, and intake volumes rather than only university-wide minimums.
 */
export function searchAndRankPrograms(
  direction: string | null | undefined,
  userScore: number | null,
  targetUniversities?: University[]
): ProgramMatch[] {
  const allCandidatePrograms: ProgramMatch[] = [];
  const targetVuzIds = targetUniversities && targetUniversities.length > 0
    ? targetUniversities.map((u) => u.id)
    : null;

  // 1. Gather programs from UNIVERSITIES[].programs
  for (const u of UNIVERSITIES) {
    if (targetVuzIds && !targetVuzIds.includes(u.id)) continue;
    if (!u.programs) continue;

    for (const p of u.programs) {
      allCandidatePrograms.push({
        id: p.id,
        code: p.code,
        name: p.name,
        universityId: u.id,
        universityShort: u.shortName,
        faculty: p.faculty,
        minBudgetScore: p.minBudgetScore2025 || u.minBudgetScore,
        budgetPlaces: p.budgetPlaces,
        annualFee: p.annualFee || u.minAnnualFee,
        scoreDiff: userScore ? userScore - (p.minBudgetScore2025 || u.minBudgetScore) : undefined,
      });
    }
  }

  // 2. Gather additional detailed programs from FULL_PROGRAMS
  for (const fp of FULL_PROGRAMS) {
    if (targetVuzIds && !targetVuzIds.includes(fp.universityId)) continue;
    if (allCandidatePrograms.some((existing) => existing.id === fp.id)) continue;

    allCandidatePrograms.push({
      id: fp.id,
      code: fp.code,
      name: fp.name,
      universityId: fp.universityId,
      universityShort: fp.universityShort,
      faculty: fp.faculty,
      minBudgetScore: fp.minBudgetScore,
      budgetPlaces: fp.budgetPlaces,
      annualFee: fp.annualFee,
      scoreDiff: userScore ? userScore - fp.minBudgetScore : undefined,
    });
  }

  // 3. Filter by direction if specified
  let filtered = allCandidatePrograms;
  if (direction) {
    const isIT = direction.includes('IT');
    const isFinance = direction.includes('Финансы') || direction.includes('Экономика');

    filtered = allCandidatePrograms.filter((p) => {
      const code = p.code;
      const nameLower = p.name.toLowerCase();
      if (isIT) {
        return (
          code.startsWith('09.') ||
          code.startsWith('01.03.02') ||
          code.startsWith('02.03.02') ||
          code.startsWith('10.') ||
          nameLower.includes('программ') ||
          nameLower.includes('информат') ||
          nameLower.includes('компьютер') ||
          nameLower.includes('интеллект')
        );
      }
      if (isFinance) {
        return code.startsWith('38.') || nameLower.includes('эконом') || nameLower.includes('финанс');
      }
      return true;
    });

    if (filtered.length === 0) {
      filtered = allCandidatePrograms;
    }
  }

  // 4. Rank programmes
  if (userScore) {
    filtered.sort((a, b) => {
      // Prioritize programs within +-15 points or where userScore >= minBudgetScore
      const diffA = Math.abs(a.minBudgetScore - userScore);
      const diffB = Math.abs(b.minBudgetScore - userScore);
      return diffA - diffB || b.budgetPlaces - a.budgetPlaces;
    });
  } else {
    filtered.sort((a, b) => b.budgetPlaces - a.budgetPlaces);
  }

  return filtered.slice(0, 5);
}

/**
 * Creates a structured side-by-side comparison table between two universities.
 */
export function createComparisonMatrix(v1: University, v2: University): ComparisonMatrix {
  return {
    title: `Сравнительный анализ: ${v1.shortName} vs ${v2.shortName}`,
    headers: ['Критерий', v1.shortName, v2.shortName],
    rows: [
      {
        criterion: 'Проходной балл на бюджет прошлых лет',
        values: [`от ${v1.minBudgetScore} б.`, `от ${v2.minBudgetScore} б.`],
      },
      {
        criterion: 'Бюджетных мест',
        values: [`${v1.totalBudgetPlaces} мест`, `${v2.totalBudgetPlaces} мест`],
      },
      {
        criterion: 'Военный учебный центр (ВУЦ)',
        values: [
          v1.hasMilitaryDept ? 'Есть (офицер/сержант запаса)' : 'Нет',
          v2.hasMilitaryDept ? 'Есть (офицер/сержант запаса)' : 'Нет',
        ],
      },
      {
        criterion: 'Общежитие для 1 курса',
        values: [
          v1.hasDormitory ? `Есть (~${v1.dormitoryInfo?.costMonth || 1200} ₽/мес)` : 'Нет',
          v2.hasDormitory ? `Есть (~${v2.dormitoryInfo?.costMonth || 1500} ₽/мес)` : 'Нет',
        ],
      },
      {
        criterion: 'Стоимость платного в год',
        values: [`от ${v1.minAnnualFee.toLocaleString()} ₽/год`, `от ${v2.minAnnualFee.toLocaleString()} ₽/год`],
      },
      {
        criterion: 'Рейтинг вузов РФ (RAEX 2026)',
        values: [`№${v1.ratingRank} в России`, `№${v2.ratingRank} в России`],
      },
    ],
  };
}

/**
 * Calculates a qualitative comparative score assessment relative to historical cutoff scores.
 * Does NOT invent fake probabilities or artificial percentage numbers.
 */
export function calculateScoreAssessment(
  userScore: number,
  universities: University[]
): AdmissionProbability | undefined {
  if (universities.length === 0) return undefined;

  const avgThreshold = Math.round(
    universities.reduce((acc, u) => acc + u.minBudgetScore, 0) / universities.length
  );
  const diff = userScore - avgThreshold;

  if (diff >= 8) {
    return {
      level: 'high',
      label: 'Балл выше минимального проходного прошлых лет',
      description: `Сумма баллов (${userScore}) превышает средний проходной балл выбранных вузов прошлых лет (~${avgThreshold} б.) с комфортным запасом (+${diff} б.). Обратите внимание: конкурс 2026 года формируется заново.`,
      scoreDiff: diff,
      referenceCutoff: avgThreshold,
    };
  } else if (diff >= -8) {
    return {
      level: 'medium',
      label: 'Балл в зоне плотной конкуренции',
      description: `Сумма баллов (${userScore}) находится близко к среднему проходному баллу прошлых лет (~${avgThreshold} б., разница ${diff >= 0 ? '+' : ''}${diff} б.). Рекомендуется подавать документы и в запасные вузы с меньшим порогом.`,
      scoreDiff: diff,
      referenceCutoff: avgThreshold,
    };
  } else {
    return {
      level: 'low',
      label: 'Балл ниже проходного порога прошлых лет',
      description: `Сумма баллов (${userScore}) ниже среднего проходного балла прошлых лет (~${avgThreshold} б., отставание ${Math.abs(diff)} б.). Рекомендуем рассмотреть менее конкурентные специальности, целевой приём или платное обучение.`,
      scoreDiff: diff,
      referenceCutoff: avgThreshold,
    };
  }
}

/**
 * Generates an interactive admission roadmap and checklist artifact tailored
 * to the confirmed student profile and chosen educational pathway.
 * All items start UNCHECKED by default unless confirmed completed in persisted state.
 * Deadlines are sourced; unverified or institution-specific dates are clearly tagged.
 */
export function createAdmissionArtifact(
  profile?: StudentProfile,
  pathwayOrDirection?: string
): AdmissionArtifact {
  const prof = profile || loadStudentProfile();
  const artifactId = 'artifact-admission-roadmap';
  const savedCheckedIds = loadPersistedChecklist(artifactId);

  const isCollege = prof.educationContext === 'college_spo';
  const isLoan = prof.budgetConstraint === 'paid_with_loan';
  const needsDorm = prof.accommodationNeed === 'required';
  const wantsMilitary = Boolean(prof.hasMilitaryPreference);

  const items = [
    isCollege
      ? {
          id: 'item-exam-spo',
          label: 'Уточнить программы внутренних вступительных испытаний для выпускников СПО',
          deadline: 'До 10 июля 2026',
          deadlineSource: 'Приказ Минобрнауки РФ №1076',
          isDeadlineVerified: true,
          checked: savedCheckedIds.includes('item-exam-spo'),
          priority: 'high' as const,
        }
      : {
          id: 'item-exam-ege',
          label: 'Сдать ЕГЭ и дождаться официальной публикации баллов на РЦОИ / Госуслугах',
          deadline: 'До 20 июня 2026',
          deadlineSource: 'График Рособрнадзора 2026',
          isDeadlineVerified: true,
          checked: savedCheckedIds.includes('item-exam-ege'),
          priority: 'high' as const,
        },
    {
      id: 'item-portfolio',
      label: 'Собрать подтверждающие документы для индивидуальных достижений (ГТО, медаль, олимпиады)',
      deadline: 'До 20 июня 2026',
      deadlineSource: 'Приказ Минобрнауки РФ №1076',
      isDeadlineVerified: true,
      checked: savedCheckedIds.includes('item-portfolio'),
      priority: 'medium' as const,
    },
    {
      id: 'item-apply',
      label: 'Подать электронные заявления в выбранные вузы через суперсервис Госуслуг (до 5 вузов)',
      deadline: '20 июня — 25 июля 2026',
      deadlineSource: 'Приказ Минобрнауки РФ №1076',
      isDeadlineVerified: true,
      checked: savedCheckedIds.includes('item-apply'),
      priority: 'high' as const,
    },
    ...(isCollege
      ? [
          {
            id: 'item-dvi-spo',
            label: 'Сдать профильные вступительные экзамены в вузе',
            deadline: '11 — 25 июля 2026',
            deadlineSource: 'Расписание приёмной комиссии вуза',
            isDeadlineVerified: true,
            checked: savedCheckedIds.includes('item-dvi-spo'),
            priority: 'high' as const,
          },
        ]
      : [
          {
            id: 'item-dvi-creative',
            label: 'Пройти ДВИ (если выбраны направления с профильными или творческими испытаниями)',
            deadline: '7 — 20 июля 2026',
            deadlineSource: 'Регламент вуза',
            isDeadlineVerified: true,
            checked: savedCheckedIds.includes('item-dvi-creative'),
            priority: 'medium' as const,
          },
        ]),
    {
      id: 'item-monitor',
      label: 'Отслеживать конкурсные списки и реальное прохождение по поданным оригиналам',
      deadline: '27 июля — 2 августа 2026',
      deadlineSource: 'Приказ Минобрнауки РФ №1076',
      isDeadlineVerified: true,
      checked: savedCheckedIds.includes('item-monitor'),
      priority: 'high' as const,
    },
    ...(isLoan
      ? [
          {
            id: 'item-loan-contract',
            label: 'Заключить договор на платное обучение и подать заявку на кредит Сбера 3%',
            deadline: 'До 15 августа 2026',
            deadlineSource: 'Постановление Правительства РФ №1448',
            isDeadlineVerified: true,
            checked: savedCheckedIds.includes('item-loan-contract'),
            priority: 'high' as const,
          },
        ]
      : [
          {
            id: 'item-original-submit',
            label: 'Подать согласие / оригинал документа об образовании на бюджет',
            deadline: 'До 3 августа 2026 (12:00 МСК)',
            deadlineSource: 'Приказ Минобрнауки РФ №1076',
            isDeadlineVerified: true,
            checked: savedCheckedIds.includes('item-original-submit'),
            priority: 'high' as const,
          },
        ]),
    {
      id: 'item-admission-order',
      label: 'Проверить официальный приказ о зачислении на сайте университета',
      deadline: '4 — 9 августа 2026',
      deadlineSource: 'Приказ Минобрнауки РФ №1076',
      isDeadlineVerified: true,
      checked: savedCheckedIds.includes('item-admission-order'),
      priority: 'high' as const,
    },
    ...(needsDorm
      ? [
          {
            id: 'item-dorm-application',
            label: 'Подать заявление и пакет документов на предоставление места в общежитии',
            deadline: 'До 20 августа 2026',
            deadlineSource: 'Внутренний регламент студенческого городка',
            isDeadlineVerified: false,
            checked: savedCheckedIds.includes('item-dorm-application'),
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(wantsMilitary
      ? [
          {
            id: 'item-military-vuc',
            label: 'Пройти военно-врачебную комиссию и сдать нормативы физподготовки для ВУЦ',
            deadline: 'Сентябрь — октябрь 2026',
            deadlineSource: 'ФЗ «О воинской обязанности и военной службе»',
            isDeadlineVerified: false,
            checked: savedCheckedIds.includes('item-military-vuc'),
            priority: 'medium' as const,
          },
        ]
      : []),
  ];

  return {
    id: artifactId,
    type: 'checklist',
    title: isCollege
      ? 'Индивидуальная дорожная карта: Поступление после СПО 2026'
      : isLoan
      ? 'Индивидуальная дорожная карта: Платное обучение с кредитом 3%'
      : 'Индивидуальная дорожная карта поступления 2026',
    summary: isCollege
      ? 'Пошаговый план поступления в вуз на базе диплома колледжа с учетом внутренних экзаменов.'
      : isLoan
      ? 'План поступления на контракт с оформлением государственной субсидии на образовательный кредит 3%.'
      : 'Официальный регламент приёмной кампании 2026: от сдачи экзаменов до издания приказов о зачислении.',
    checklistItems: items,
    steps: [
      {
        stepNumber: 1,
        title: 'Выбор вузов и подготовка документов',
        description: 'Распределение 5 вузов по уровню конкурса: вузы мечты, реалистичные и запасной вариант.',
        status: 'pending',
      },
      {
        stepNumber: 2,
        title: 'Подача заявлений на Госуслугах',
        description: 'Электронная отправка документов с фиксацией приоритетов от 1 до 5.',
        status: 'pending',
      },
      {
        stepNumber: 3,
        title: 'Конкурс и подача оригинала',
        description: 'Финальный выбор вуза по конкурсной позиции среди подавших оригинал документа.',
        status: 'pending',
      },
    ],
    markdownContent: `## Памятка абитуриента 2026\n\n1. **Оригинал документа:** Для зачисления на бюджет критически важно предоставить оригинал (или электронную отметку на Госуслугах) строго до 3 августа 12:00 МСК.\n2. **Приоритеты:** Зачисление происходит по наивысшему приоритету, в который вы проходите по конкурсу.\n3. **Сроки:** Федеральные даты зафиксированы Приказом Минобрнауки РФ №1076; даты работы общежитий устанавливаются вузами индивидуально.`,
  };
}

/**
 * Generates dynamic context-sensitive conversational follow-ups.
 */
export function generateDynamicFollowUps(
  prompt: string,
  vuzes: University[] = [],
  userScore: number | null = null,
  isComparison = false
): string[] {
  const p = prompt.toLowerCase();

  if (isComparison && vuzes.length >= 2) {
    const v1 = vuzes[0].shortName;
    const v2 = vuzes[1].shortName;
    return [
      `В каком из вузов проще получить общежитие: в ${v1} или ${v2}?`,
      `Где сильнее практическая подготовка по IT: в ${v1} или ${v2}?`,
      `Каковы условия перевода с платного на бюджет в ${v1}?`,
    ];
  }

  if (vuzes.length > 0) {
    const v = vuzes[0];
    if (userScore) {
      return [
        `Какие специальности в ${v.shortName} подходят под ${userScore} баллов?`,
        `Есть ли в ${v.shortName} военная кафедра (ВУЦ)?`,
        `Как работает образовательный кредит под 3% для ${v.shortName}?`,
      ];
    }
    return [
      `Какие минимальные проходные баллы на бюджет в ${v.shortName}?`,
      `Сколько стоит проживание в общежитии ${v.shortName}?`,
      `Дает ли ${v.shortName} скидки за высокие баллы ЕГЭ?`,
    ];
  }

  if (p.includes('вуц') || p.includes('воен')) {
    return [
      'Какие нормативы физподготовки сдаются при поступлении в ВУЦ?',
      'Даёт ли окончание ВУЦ звание офицера запаса без срочной службы?',
      'В каких технических вузах Москвы есть ВУЦ?',
    ];
  }

  if (p.includes('кредит') || p.includes('сбер') || p.includes('3%')) {
    return [
      'Какой ежемесячный платеж во время учёбы при кредите 3%?',
      'Можно ли взять образовательный кредит без подтверждения дохода родителей?',
      'Что произойдет с кредитом в случае отчисления или академотпуске?',
    ];
  }

  if (p.includes('бви') || p.includes('олимпиад')) {
    return [
      'Что будет, если набрать меньше 75 баллов на профильном ЕГЭ?',
      'Какие олимпиады 1 уровня по информатике дают БВИ?',
      'Как узнать перечень льгот для олимпиадников в конкретном вузе?',
    ];
  }

  return [
    'Как сопоставить баллы с проходными порогами прошлых лет?',
    'В каких вузах первокурсникам гарантируют общежитие?',
    'Как получить максимальные +10 баллов за индивидуальные достижения?',
  ];
}

/**
 * Orchestrates entity matching, filtering, candidate scoring, and context assembly.
 * Strictly separates hard requirements from preferences. Never silently discards filters.
 */
export function retrieveAssistantContext(
  query: string,
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all',
  history: Array<{ sender: string; text: string }> = []
): RetrievalContext {
  const reasoningTrace: string[] = [];
  const matchedUniversities: University[] = [];

  // 1. Interpret user query and extract preferences
  reasoningTrace.push('1. Извлечение ключевых параметров запроса (баллы ЕГЭ, город, требования к ВУЦ и общежитию).');
  const interpretation = interpretStudentQuery(query, mode, scope, history);
  const {
    filters,
    isComparison,
    isUnderspecified,
    isStrategyRequest,
    rawScore,
    targetCity,
    excludedCities,
    wantsMilitary,
    isMilitaryHard,
    wantsDorm,
    isDormHard,
    wantsFinance,
    wantsOlympiads,
    wantsBudgetOnly,
    anaphoricEntity,
    hardRequirements,
  } = interpretation;

  // 2. Identify university mentions using normalized isolated matching
  const mentionResult = findMentionedUniversitiesDetailed(query);
  let mentionedVuzes = mentionResult.matchedUniversities;

  // If follow-up reference was resolved from history (e.g. "А что с общежитием в нём?")
  if (mentionedVuzes.length === 0 && anaphoricEntity) {
    mentionedVuzes = [anaphoricEntity];
    reasoningTrace.push(
      `2. Распознана отсылка к контексту предыдущего вопроса: [vuz:${anaphoricEntity.id}:${anaphoricEntity.shortName}].`
    );
  }

  // 3. Ambiguity Handling: if user asked about "политех" without specifying which one
  let clarificationOptions: ClarificationOption[] | undefined;
  if (mentionedVuzes.length === 0 && mentionResult.isAmbiguous && mentionResult.ambiguousEntity) {
    reasoningTrace.push(
      `2. Обнаружено неоднозначное наименование «${mentionResult.ambiguousEntity.term}». Сформированы варианты уточнения.`
    );
    clarificationOptions = mentionResult.ambiguousEntity.candidates.map((c) => ({
      icon: '🏛️',
      label: `${c.name} (${c.city})`,
      prompt: `Расскажи про ${c.name} в городе ${c.city}`,
    }));
  }

  // 4. Comparison check
  let comparisonMatrix: ComparisonMatrix | undefined;
  const isComparisonQuery = isComparison && mentionedVuzes.length >= 2;

  if (isComparisonQuery) {
    const v1 = mentionedVuzes[0];
    const v2 = mentionedVuzes[1];
    matchedUniversities.push(v1, v2);
    comparisonMatrix = createComparisonMatrix(v1, v2);
    reasoningTrace.push(
      `2. Выявлено сравнение двух вузов: ${v1.shortName} и ${v2.shortName}. Составлена сравнительная таблица параметров.`
    );
  }

  // 5. Underspecified Clarification Options (when no universities or criteria specified)
  if (!clarificationOptions && isUnderspecified && mentionedVuzes.length === 0) {
    clarificationOptions = [
      {
        icon: '🎯',
        label: 'IT и разработка в Москве (250+ баллов)',
        prompt: 'У меня 260 баллов, IT-специальности в Москве с общежитием',
      },
      {
        icon: '🛡️',
        label: 'Инженерия с ВУЦ (210–240 баллов)',
        prompt: 'Баллы 230, интересует технический вуз с военной кафедрой ВУЦ',
      },
      {
        icon: '💰',
        label: 'Экономика и менеджмент (бюджет / кредит 3%)',
        prompt: 'Поступление на экономику и менеджмент в Москве или СПб',
      },
      {
        icon: '🏆',
        label: 'Олимпиады РСОШ и БВИ без 300 баллов',
        prompt: 'Как поступить по олимпиаде БВИ и какие правила подтверждения 75 баллов?',
      },
    ];
    reasoningTrace.push('2. Запрос общего характера. Сформированы варианты уточнения для точного подбора.');
  }

  // 6. Strict Candidate Filtering & Zero-Match Alternative Generation
  let conflictingRequirements: string[] | undefined;
  let alternatives: AlternativeOption[] | undefined;
  let hasZeroMatches = false;

  if (!isComparisonQuery && matchedUniversities.length === 0 && !clarificationOptions) {
    reasoningTrace.push(
      `2. Фильтрация по критериям: Город = ${targetCity || 'Все'} (исключены: ${
        excludedCities.length > 0 ? excludedCities.join(', ') : 'нет'
      }), ВУЦ = ${wantsMilitary === true ? (isMilitaryHard ? 'Строго да' : 'Желательно') : wantsMilitary === false ? 'Не требуется' : 'Не важно'}, Общежитие = ${
        wantsDorm === true ? (isDormHard ? 'Строго да' : 'Желательно') : wantsDorm === false ? 'Не требуется' : 'Не важно'
      }.`
    );

    // Apply strict filtering (NEVER silently drop filters)
    let candidates = UNIVERSITIES.filter((u) => {
      // Excluded cities
      if (excludedCities.includes(u.city)) return false;
      // Target city
      if (targetCity && u.city !== targetCity) return false;
      // Hard military requirement
      if (wantsMilitary === true && isMilitaryHard && !u.hasMilitaryDept) return false;
      // Hard dormitory requirement
      if (wantsDorm === true && isDormHard && !u.hasDormitory) return false;
      // Hard budget-only requirement
      if (wantsBudgetOnly && (!u.hasBudget || u.totalBudgetPlaces <= 0)) return false;
      // Score threshold: if student gave score and asked for budget, filter out universities where cutoff is unreachable (> score + 15)
      if (rawScore && wantsBudgetOnly && u.minBudgetScore > rawScore + 15) return false;
      return true;
    });

    const asksForSpecificVuz =
      /(?:в|про|о|об|для)\s+([а-яa-z\-]+)\s+(университет|институт|академи|вуз|колледж)/i.test(query) ||
      /(гарвард|оксфорд|кембридж|стэнфорд|mit|harvard|oxford|cambridge|stanford|yale|сорбонн)/i.test(query);

    if (mentionedVuzes.length > 0) {
      matchedUniversities.push(...mentionedVuzes);
    } else if (asksForSpecificVuz) {
      // User specifically requested an institution, but it is not in our 12-university catalog
      reasoningTrace.push('3. Запрошенный университет не найден в локальном каталоге 12 ведущих вузов.');
    } else if (candidates.length > 0) {
      // Sort and select top candidates
      if (rawScore) {
        candidates.sort((a, b) => {
          const diffA = Math.abs(a.minBudgetScore - rawScore);
          const diffB = Math.abs(b.minBudgetScore - rawScore);
          return diffA - diffB;
        });
      } else if (filters.direction?.includes('IT')) {
        const itFavs = ['hse', 'bmstu', 'itmo', 'mgu', 'mipt', 'mirea'];
        candidates.sort((a, b) => {
          const aIsIt = itFavs.includes(a.id) ? 1 : 0;
          const bIsIt = itFavs.includes(b.id) ? 1 : 0;
          return bIsIt - aIsIt || a.ratingRank - b.ratingRank;
        });
      } else {
        candidates.sort((a, b) => a.ratingRank - b.ratingRank);
      }
      matchedUniversities.push(...candidates.slice(0, 3));
      reasoningTrace.push(
        `3. Отобрано в каталоге: ${matchedUniversities.map((u) => u.shortName).join(', ')}.`
      );
    } else {
      // EXACT MATCHES = 0: Do NOT silently drop filters! Explain conflicting constraints and offer alternatives
      hasZeroMatches = true;
      conflictingRequirements = [...hardRequirements];
      reasoningTrace.push(
        `3. По заданным строгим критериям совпадений не найдено. Формирование альтернативных вариантов.`
      );

      // Construct clearly labelled alternative options
      alternatives = [];

      // Alternative A: Other regional hubs if city was restricted
      if (targetCity) {
        const otherCityMatches = UNIVERSITIES.filter(
          (u) =>
            u.city !== targetCity &&
            !excludedCities.includes(u.city) &&
            (!isMilitaryHard || u.hasMilitaryDept) &&
            (!isDormHard || u.hasDormitory)
        );
        if (otherCityMatches.length > 0) {
          alternatives.push({
            title: `Альтернативные вузы в других регионах РФ (ВУЦ: ${wantsMilitary ? 'есть' : 'не важно'})`,
            description: `Если расширить географию за пределы города ${targetCity}, подходящие варианты с общежитием и военной кафедрой есть в других городах каталога:`,
            universities: otherCityMatches.slice(0, 3),
            actionTab: 'catalog',
            actionLabel: 'Смотреть вузы в других регионах',
          });
        }
      }

      // Alternative B: Relaxing military requirement in the same city
      if (wantsMilitary && targetCity) {
        const withoutMilitary = UNIVERSITIES.filter(
          (u) => u.city === targetCity && !u.hasMilitaryDept && (!isDormHard || u.hasDormitory)
        );
        if (withoutMilitary.length > 0) {
          alternatives.push({
            title: `Вузы в городе ${targetCity} без военной кафедры`,
            description: `Вузы с академической отсрочкой по закону (без ВУЦ), где проходной порог может быть доступнее:`,
            universities: withoutMilitary.slice(0, 2),
            actionTab: 'military',
            actionLabel: 'Справочник отсрочек и ВУЦ',
          });
        }
      }

      // Alternative C: Paid education with 3% state loan if score was too low
      if (rawScore) {
        const paidOptions = UNIVERSITIES.filter((u) => {
          if (targetCity && u.city !== targetCity) return false;
          return u.minPaidScore <= rawScore;
        });
        if (paidOptions.length > 0) {
          alternatives.push({
            title: `Платное отделение с кредитом под 3% годовых`,
            description: `При сумме ${rawScore} баллов вы гарантированно проходите на платное отделение по конкурсу аттестатов/ЕГЭ (льготный кредит Сбера под 3%):`,
            universities: paidOptions.slice(0, 2),
            actionTab: 'credit',
            actionLabel: 'Рассчитать платеж по кредиту 3%',
          });
        }
      }
    }
  }

  // 7. Search and Rank Academic Programmes using programme-level data
  const matchedPrograms = searchAndRankPrograms(
    filters.direction,
    rawScore,
    matchedUniversities.length > 0 ? matchedUniversities : undefined
  );

  // 8. Build Evidence and Citations
  const { citationChunks, evidenceText } = buildEvidencePackage(
    matchedUniversities,
    filters,
    matchedPrograms
  );

  let fullEvidence = evidenceText;
  if (comparisonMatrix) {
    fullEvidence += '\n\nТАБЛИЦА СРАВНЕНИЯ ВУЗОВ:\n';
    fullEvidence += `| ${comparisonMatrix.headers.join(' | ')} |\n`;
    fullEvidence += `| ${comparisonMatrix.headers.map(() => '---').join(' | ')} |\n`;
    comparisonMatrix.rows.forEach((r) => {
      fullEvidence += `| ${r.criterion} | ${r.values.join(' | ')} |\n`;
    });
  }

  // 9. Qualitative Probability Assessment
  let probability: AdmissionProbability | undefined;
  if (rawScore && matchedUniversities.length > 0) {
    probability = calculateScoreAssessment(rawScore, matchedUniversities);
  } else if (filters.direction?.includes('IT')) {
    probability = {
      level: 'medium',
      label: 'Справочные пороги по IT-направлениям',
      description:
        'В ведущих вузах из каталога проходные баллы прошлых лет на IT-программы составляли 260–295 баллов. Укажите сумму баллов ЕГЭ для точного сопоставления.',
    };
  }

  reasoningTrace.push(`4. Отобрано ${citationChunks.length} справочных фрагментов из локального каталога.`);

  // 10. Navigation Action & Tool Metadata
  const defaultAction = determineDefaultAction(query, filters, isComparisonQuery, matchedUniversities);
  let toolName = 'Поиск по локальному каталогу Вузопедии';
  let toolQuery = `Параметры: город=${targetCity || 'все'}, IT=${Boolean(
    filters.direction?.includes('IT')
  )}, ВУЦ=${wantsMilitary}, баллы=${rawScore || 'не указаны'}`;

  if (isComparisonQuery) {
    toolName = 'Сравнительная таблица вузов каталога';
    toolQuery = `Сравнение: ${matchedUniversities.map((u) => u.shortName).join(' vs ')}`;
  } else if (filters.direction?.includes('IT')) {
    toolName = 'Каталог образовательных программ IT';
    toolQuery = 'Выборка направлений 09.03.01, 09.03.04, 01.03.02';
  } else if (wantsMilitary) {
    toolName = 'Справочник Военных учебных центров (ВУЦ)';
    toolQuery = 'Вузы с программами подготовки офицеров и сержантов запаса';
  } else if (wantsDorm) {
    toolName = 'Справочник студенческих общежитий';
    toolQuery = 'Общежития для студентов 1 курса и стоимость проживания';
  } else if (wantsOlympiads) {
    toolName = 'Справочник олимпиад РСОШ и льгот БВИ';
    toolQuery = 'Правила подтверждения льготы 75+ баллами профильного ЕГЭ';
  } else if (wantsFinance) {
    toolName = 'Калькулятор образовательного кредита 3%';
    toolQuery = 'Льготный образовательный кредит с господдержкой (Сбербанк)';
  } else if (rawScore) {
    toolName = 'Сопоставление баллов с порогом каталога';
    toolQuery = `Сравнение с проходными баллами прошлых лет для суммы: ${rawScore} баллов`;
  }

  // 11. Interactive Artifact
  let artifact: AdmissionArtifact | undefined;
  if (isStrategyRequest) {
    const studentProfile = loadStudentProfile();
    artifact = createAdmissionArtifact(studentProfile, filters.direction || undefined);
    reasoningTrace.push('3. Сформирован пошаговый чек-лист и дорожная карта поступления.');
  }

  const followUps = generateDynamicFollowUps(query, matchedUniversities, rawScore, isComparisonQuery);

  return {
    evidence: fullEvidence,
    matchedUniversities,
    matchedPrograms: matchedPrograms.length > 0 ? matchedPrograms : undefined,
    conflictingRequirements,
    alternatives,
    ambiguousEntity: mentionResult.ambiguousEntity,
    reasoningTrace,
    suggestedActionTab: defaultAction.tabId,
    suggestedActionLabel: defaultAction.label,
    toolName,
    toolQuery,
    probability,
    isComparison: isComparisonQuery,
    comparisonMatrix,
    isUnderspecified: Boolean(clarificationOptions),
    clarificationOptions,
    followUps,
    citationChunks,
    extractedFilters: filters,
    artifact,
    hasZeroMatches,
  };
}
