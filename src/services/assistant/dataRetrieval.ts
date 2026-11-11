import { UNIVERSITIES } from '../../data/mockData';
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
} from './types';
import { findMentionedUniversities } from './entityResolution';
import { interpretStudentQuery } from './queryInterpretation';
import { buildEvidencePackage } from './evidenceSources';
import { determineDefaultAction } from './navigationActions';

export interface RetrievalContext {
  evidence: string;
  matchedUniversities: University[];
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
 * Generates an interactive admission roadmap and checklist artifact.
 */
export function createAdmissionArtifact(): AdmissionArtifact {
  return {
    id: `artifact-admission-${Date.now()}`,
    type: 'checklist',
    title: 'Индивидуальная дорожная карта поступления 2026',
    summary:
      'Пошаговый план прохождения приемной кампании: от сдачи ЕГЭ до зачисления на бюджет и заселения в общежитие.',
    checklistItems: [
      {
        id: 'item-1',
        label: 'Сдать ЕГЭ и проверить официальные баллы на портале РЦОИ / Госуслугах',
        deadline: 'До 20 июня',
        checked: true,
        priority: 'high',
      },
      {
        id: 'item-2',
        label: 'Собрать портфолио индивидуальных достижений (ГТО, медаль, волонтерство, олимпиады)',
        deadline: 'До 25 июня',
        checked: true,
        priority: 'medium',
      },
      {
        id: 'item-3',
        label: 'Подать электронные заявления в 5 вузов (до 5 направлений в каждом) через Госуслуги',
        deadline: '20 июня — 25 июля',
        checked: false,
        priority: 'high',
      },
      {
        id: 'item-4',
        label: 'Пройти ДВИ (если выбраны творческие или профильные вступительные испытания)',
        deadline: '7 — 20 июля',
        checked: false,
        priority: 'medium',
      },
      {
        id: 'item-5',
        label: 'Мониторить конкурсные списки вузов и реальную позицию по СНИЛС',
        deadline: '27 июля — 2 августа',
        checked: false,
        priority: 'high',
      },
      {
        id: 'item-6',
        label: 'Подать оригинал документа об образовании на Госуслугах или лично в вуз',
        deadline: 'До 3 августа (12:00 МСК)',
        checked: false,
        priority: 'high',
      },
      {
        id: 'item-7',
        label: 'Проверить приказ о зачислении на бюджетные места основного этапа',
        deadline: '4 — 9 августа',
        checked: false,
        priority: 'high',
      },
      {
        id: 'item-8',
        label: 'Подать заявление на предоставление места в студенческом общежитии',
        deadline: 'До 20 августа',
        checked: false,
        priority: 'medium',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Формирование пула вузов',
        description:
          '2 вуза мечты, 2 реалистичных и 1 надежный запасной вариант с проходным на 15+ баллов ниже.',
        status: 'completed',
      },
      {
        stepNumber: 2,
        title: 'Электронная подача через Госуслуги',
        description: 'Заполнение заявления единым пакетом с расстановкой приоритетов от 1 до 5.',
        status: 'in_progress',
      },
      {
        stepNumber: 3,
        title: 'Финальный выбор по оригиналам',
        description:
          '3 августа оценивайте только абитуриентов, подавших оригинал. Не пугайтесь общего списка копий!',
        status: 'pending',
      },
    ],
    markdownContent: `## Стратегия поступления на бюджет 2026\n\n1. **Правило запасного варианта:** средний проходной балл запасного вуза должен быть минимум на 15 пунктов ниже вашей суммы.\n2. **Приоритеты:** зачисление происходит строго по наивысшему приоритету, на который вы проходите по конкурсу среди подавших оригинал.\n3. **Оригинал:** электронная отметка на Госуслугах юридически полностью эквивалентна бумажному аттестату.`,
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
 */
export function retrieveAssistantContext(
  query: string,
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all'
): RetrievalContext {
  const reasoningTrace: string[] = [];
  const matchedUniversities: University[] = [];

  // 1. Interpret user query and extract preferences
  reasoningTrace.push('1. Извлечение ключевых параметров запроса (баллы ЕГЭ, город, требования к ВУЦ и общежитию).');
  const interpretation = interpretStudentQuery(query, mode, scope);
  const { filters, isComparison, isUnderspecified, isStrategyRequest, rawScore, targetCity } = interpretation;

  // 2. Identify university mentions
  const mentionedVuzes = findMentionedUniversities(query);

  // 3. Comparison check
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

  // 4. Underspecified Clarification Options
  let clarificationOptions: ClarificationOption[] | undefined;
  if (isUnderspecified && mentionedVuzes.length === 0) {
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

  // 5. University Candidate Filtering and Selection
  if (!isComparisonQuery && matchedUniversities.length === 0) {
    reasoningTrace.push(
      `2. Поиск в каталоге: Город = ${targetCity || 'Все регионы'}, Направление = ${
        filters.direction || 'Общее'
      }, ВУЦ = ${filters.wantsMilitary ? 'Да' : 'Не обязательно'}, Общежитие = ${
        filters.wantsDorm ? 'Да' : 'Не обязательно'
      }.`
    );

    let candidates = UNIVERSITIES.filter((u) => {
      if (targetCity && u.city !== targetCity) return false;
      if (filters.wantsMilitary && !u.hasMilitaryDept) return false;
      if (filters.wantsDorm && !u.hasDormitory) return false;
      return true;
    });

    if (candidates.length === 0) {
      candidates = UNIVERSITIES.filter((u) => {
        if (filters.wantsMilitary && !u.hasMilitaryDept) return false;
        return true;
      });
    }

    if (candidates.length === 0) {
      candidates = [...UNIVERSITIES];
    }

    if (mentionedVuzes.length > 0) {
      matchedUniversities.push(...mentionedVuzes);
    } else if (rawScore) {
      candidates.sort((a, b) => {
        const diffA = Math.abs(a.minBudgetScore - rawScore);
        const diffB = Math.abs(b.minBudgetScore - rawScore);
        return diffA - diffB;
      });
      matchedUniversities.push(...candidates.slice(0, 3));
    } else if (filters.direction?.includes('IT')) {
      const itFavs = ['hse', 'bmstu', 'itmo', 'mgu', 'mipt', 'mirea'];
      candidates.sort((a, b) => {
        const aIsIt = itFavs.includes(a.id) ? 1 : 0;
        const bIsIt = itFavs.includes(b.id) ? 1 : 0;
        return bIsIt - aIsIt || a.ratingRank - b.ratingRank;
      });
      matchedUniversities.push(...candidates.slice(0, 3));
    } else {
      candidates.sort((a, b) => a.ratingRank - b.ratingRank);
      matchedUniversities.push(...candidates.slice(0, 3));
    }

    reasoningTrace.push(
      `3. Отобрано в локальном каталоге: ${matchedUniversities.map((u) => u.shortName).join(', ')}.`
    );
  }

  // 6. Build Evidence and Citations
  const { citationChunks, evidenceText } = buildEvidencePackage(matchedUniversities, filters);

  let fullEvidence = evidenceText;
  if (comparisonMatrix) {
    fullEvidence += '\n\nТАБЛИЦА СРАВНЕНИЯ ВУЗОВ:\n';
    fullEvidence += `| ${comparisonMatrix.headers.join(' | ')} |\n`;
    fullEvidence += `| ${comparisonMatrix.headers.map(() => '---').join(' | ')} |\n`;
    comparisonMatrix.rows.forEach((r) => {
      fullEvidence += `| ${r.criterion} | ${r.values.join(' | ')} |\n`;
    });
  }

  // 7. Qualitative Probability Assessment
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

  // 8. Navigation action & Tool definition
  const defaultAction = determineDefaultAction(query, filters, isComparisonQuery);
  let toolName = 'Поиск по локальному каталогу Вузопедии';
  let toolQuery = `Параметры: город=${targetCity || 'все'}, IT=${Boolean(
    filters.direction?.includes('IT')
  )}, ВУЦ=${filters.wantsMilitary}, баллы=${rawScore || 'не указаны'}`;

  if (isComparisonQuery) {
    toolName = 'Сравнительная таблица вузов каталога';
    toolQuery = `Сравнение: ${matchedUniversities.map((u) => u.shortName).join(' vs ')}`;
  } else if (filters.direction?.includes('IT')) {
    toolName = 'Каталог образовательных программ IT';
    toolQuery = 'Выборка направлений 09.03.01, 09.03.04, 01.03.02';
  } else if (filters.wantsMilitary) {
    toolName = 'Справочник Военных учебных центров (ВУЦ)';
    toolQuery = 'Вузы с программами подготовки офицеров и сержантов запаса';
  } else if (filters.wantsDorm) {
    toolName = 'Справочник студенческих общежитий';
    toolQuery = 'Общежития для студентов 1 курса и стоимость проживания';
  } else if (filters.wantsOlympiads) {
    toolName = 'Справочник олимпиад РСОШ и льгот БВИ';
    toolQuery = 'Правила подтверждения льготы 75+ баллами профильного ЕГЭ';
  } else if (filters.wantsFinance) {
    toolName = 'Калькулятор образовательного кредита 3%';
    toolQuery = 'Льготный образовательный кредит с господдержкой (Сбербанк)';
  } else if (rawScore) {
    toolName = 'Сопоставление баллов с порогом каталога';
    toolQuery = `Сравнение с проходными баллами прошлых лет для суммы: ${rawScore} баллов`;
  }

  // 9. Interactive Artifact
  let artifact: AdmissionArtifact | undefined;
  if (isStrategyRequest) {
    artifact = createAdmissionArtifact();
    reasoningTrace.push('3. Сформирован пошаговый чек-лист и дорожная карта поступления.');
  }

  const followUps = generateDynamicFollowUps(query, matchedUniversities, rawScore, isComparisonQuery);

  return {
    evidence: fullEvidence,
    matchedUniversities,
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
  };
}
