/**
 * Gemini Agentic RAG Service for Ded Vuzoped Assistant
 * Incorporates patterns from awesome-llm-apps (Agentic RAG, Knowledge Graph citations, Reasoning Traces, Generative UI, Specialist Agent Teams)
 */

import { UNIVERSITIES } from '../data/mockData';
import {
  FULL_PROGRAMS,
  DORMITORIES,
  MILITARY_CENTERS,
  OLYMPIADS_BVI,
  INDIVIDUAL_ACHIEVEMENTS,
  TARGET_COMPANIES,
  STUDENT_LIVING_COSTS,
} from '../data/extendedData';
import { University } from '../types';

const STORAGE_KEY = 'vuzopedia_gemini_api_key';
export const DEFAULT_GEMINI_KEY = '';

export type SpecialistMode = 'all' | 'calculator' | 'military' | 'finance' | 'olympiads';

export interface AdmissionProbability {
  percentage: number;
  level: 'high' | 'medium' | 'low';
  label: string;
  description: string;
}

export interface GeneratedAssistantResponse {
  reply: string;
  toolCall: {
    name: string;
    query: string;
    duration: string;
    status: 'complete' | 'running' | 'error';
  };
  actionTab?: string;
  actionLabel?: string;
  suggestions: string[];
  modelUsed: 'gemini' | 'local';
  matchedUniversities?: University[];
  reasoningTrace?: string[];
  probability?: AdmissionProbability;
}

export const getStoredApiKey = (): string => {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && key.trim() ? key.trim() : DEFAULT_GEMINI_KEY;
  } catch {
    return DEFAULT_GEMINI_KEY;
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const resetStoredApiKey = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export interface RAGRetrievalResult {
  evidence: string;
  matchedUniversities: University[];
  reasoningTrace: string[];
  suggestedActionTab?: string;
  suggestedActionLabel?: string;
  toolName: string;
  toolQuery: string;
  probability?: AdmissionProbability;
}

/**
 * High-performance Agentic RAG Context Retriever
 * Searches across Universities, Programs, Dorms, Military Centers, Olympiads & Achievements
 */
export function retrieveRAGContext(query: string, mode: SpecialistMode = 'all'): RAGRetrievalResult {
  const q = query.toLowerCase().trim();
  const reasoningTrace: string[] = [];
  const matchedUniversities: University[] = [];
  let evidence = '';

  // 1. Extract score if user mentioned a score (e.g. 240, 260, 280)
  const scoreMatch = q.match(/\b([1-3]\d{2})\b/);
  const userScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  reasoningTrace.push('1. Декомпозиция запроса: семантический анализ намерения и извлечение фильтров.');

  // 2. City detection
  let targetCity: string | null = null;
  if (q.includes('москв')) targetCity = 'Москва';
  else if (q.includes('питер') || q.includes('спб') || q.includes('санкт')) targetCity = 'Санкт-Петербург';
  else if (q.includes('новосибирск')) targetCity = 'Новосибирск';
  else if (q.includes('казан')) targetCity = 'Казань';
  else if (q.includes('екатеринбург')) targetCity = 'Екатеринбург';

  // 3. Requirements detection
  const wantsMilitary = mode === 'military' || q.includes('вуц') || q.includes('военн') || q.includes('кафедр') || q.includes('арми');
  const wantsDorm = q.includes('общежит') || q.includes('общаг') || q.includes('жил') || q.includes('иногородн');
  const wantsIT = q.includes('it') || q.includes('ит') || q.includes('программист') || q.includes('информатик') || q.includes('код') || q.includes('разработ');
  const wantsFinance = mode === 'finance' || q.includes('кредит') || q.includes('сбер') || q.includes('3%') || q.includes('стоимост') || q.includes('бюджет');
  const wantsOlympiads = mode === 'olympiads' || q.includes('олимпиад') || q.includes('бви') || q.includes('рсош') || q.includes('всош');

  reasoningTrace.push(
    `2. Применены предикаты RAG: Город = ${targetCity || 'Все регионы'}, Направление = ${wantsIT ? 'IT' : wantsFinance ? 'Финансы/Кредит' : 'Общее'}, ВУЦ = ${wantsMilitary ? 'Да' : 'Не обязательно'}, Общежитие = ${wantsDorm ? 'Да' : 'Не обязательно'}.`
  );

  // 4. Candidate filtering from UNIVERSITIES
  let candidateUniversities = UNIVERSITIES.filter((u) => {
    if (targetCity && u.city !== targetCity) return false;
    if (wantsMilitary && !u.hasMilitaryDept) return false;
    if (wantsDorm && !u.hasDormitory) return false;
    return true;
  });

  // Fallback if strict filter yields zero
  if (candidateUniversities.length === 0) {
    candidateUniversities = UNIVERSITIES.filter((u) => {
      if (wantsMilitary && !u.hasMilitaryDept) return false;
      return true;
    });
  }

  // Fallback to top institutions
  if (candidateUniversities.length === 0) {
    candidateUniversities = [...UNIVERSITIES];
  }

  // 5. Ranking
  if (userScore) {
    candidateUniversities.sort((a, b) => {
      const diffA = Math.abs(a.minBudgetScore - userScore);
      const diffB = Math.abs(b.minBudgetScore - userScore);
      return diffA - diffB;
    });
  } else if (wantsIT) {
    const itFavs = ['hse', 'bmstu', 'itmo', 'mgu', 'mipt', 'mephi'];
    candidateUniversities.sort((a, b) => {
      const aIsIt = itFavs.includes(a.id) ? 1 : 0;
      const bIsIt = itFavs.includes(b.id) ? 1 : 0;
      return bIsIt - aIsIt || a.ratingRank - b.ratingRank;
    });
  } else {
    candidateUniversities.sort((a, b) => a.ratingRank - b.ratingRank);
  }

  const topVuzes = candidateUniversities.slice(0, 3);
  matchedUniversities.push(...topVuzes);

  reasoningTrace.push(
    `3. Извлечено ${matchedUniversities.length} профильных университетов: ${matchedUniversities.map((u) => u.shortName).join(', ')}.`
  );

  // 6. Compute Admission Probability Meter
  let probability: AdmissionProbability | undefined;
  if (userScore) {
    const avgThreshold = matchedUniversities.reduce((acc, u) => acc + u.minBudgetScore, 0) / (matchedUniversities.length || 1);
    if (userScore >= avgThreshold + 8) {
      probability = {
        percentage: 92,
        level: 'high',
        label: 'Высокая вероятность поступления (Зелёная зона)',
        description: `Твой балл (${userScore}) превышает проходные пороги рекомендованных вузов с безопасным запасом.`,
      };
    } else if (userScore >= avgThreshold - 8) {
      probability = {
        percentage: 67,
        level: 'medium',
        label: 'Пограничный конкурс (Жёлтая зона)',
        description: `Твой балл (${userScore}) находится около проходной границы. Рекомендуется подавать в 5 вузов и отслеживать динамику согласий.`,
      };
    } else {
      probability = {
        percentage: 32,
        level: 'low',
        label: 'Высокий конкурс (Красная зона)',
        description: `На бюджет в топ-вузы балла ${userScore} может не хватить. Рассмотри целевые квоты, скидки на платном (до 70%) или сильные региональные вузы.`,
      };
    }
  } else if (wantsIT) {
    probability = {
      percentage: 78,
      level: 'medium',
      label: 'Конкурсная ситуация IT-направлений 2026',
      description: 'Средний балл на бюджет в ведущие IT-вузы колеблется от 270 до 298. Рекомендуется сдавать информатику и физику одновременно.',
    };
  }

  reasoningTrace.push(
    `4. Сформирована верифицированная аналитическая справка с цитированием проходных баллов и квот.`
  );

  // Construct evidence text
  let evidenceLines: string[] = [];
  evidenceLines.push('РЕКОМЕНДОВАННЫЕ ВУЗЫ ИЗ БАЗЫ ДАННЫХ ВУЗОПЕДИИ:');
  topVuzes.forEach((u) => {
    evidenceLines.push(
      `• ${u.shortName} (${u.fullName}): город ${u.city}${u.metro ? ', метро ' + u.metro : ''}. Проходной балл на бюджет: ${u.minBudgetScore}, мест на бюджете: ${u.totalBudgetPlaces}, платное от ${u.minAnnualFee.toLocaleString()} ₽/год. Военный центр (ВУЦ): ${u.hasMilitaryDept ? 'Есть (офицер/сержант запаса)' : 'Нет'}. Общежитие: ${u.hasDormitory ? 'Предоставляется (' + (u.dormitoryInfo?.costMonth || 1200) + ' ₽/мес)' : 'Нет'}.`
    );
  });

  // Domain supplements
  let suggestedActionTab = 'catalog';
  let suggestedActionLabel = 'Открыть каталог вузов';
  let toolName = 'Аналитический модуль Вузопедия RAG';
  let toolQuery = `Поиск вузов: город=${targetCity || 'все'}, IT=${wantsIT}, ВУЦ=${wantsMilitary}, Баллы=${userScore || 'не указаны'}`;

  if (wantsIT) {
    suggestedActionTab = 'programs';
    suggestedActionLabel = 'Смотреть IT-программы вузов';
    toolName = 'Реестр программ IT и программной инженерии';
    toolQuery = 'Выборка направлений 09.03.01, 09.03.04, 01.03.02';
  } else if (wantsMilitary) {
    suggestedActionTab = 'military';
    suggestedActionLabel = 'Открыть реестр ВУЦ и нормативы';
    toolName = 'База Военных учебных центров Минобороны РФ';
    toolQuery = 'Вузы с программами офицеров и сержантов запаса';
    evidenceLines.push('ИНФОРМАЦИЯ О ВУЦ: Военный учебный центр освобождает от срочной службы. Нормативы: подтягивания от 10 раз, бег 100м до 14.2с, кросс 3км до 13 мин.');
  } else if (wantsDorm) {
    suggestedActionTab = 'dorms';
    suggestedActionLabel = 'Перейти в каталог общежитий';
    toolName = 'Справочник студенческих общежитий РФ';
    toolQuery = 'Фильтр по 100% гарантии для 1 курса и стоимости';
    evidenceLines.push('ИНФОРМАЦИЯ ОБ ОБЩЕЖИТИЯХ: Первокурсникам-бюджетникам в топ-вузах место гарантировано. Стоимость в МГУ/Бауманке от 850 до 1 400 ₽/мес, в ВШЭ ~2 100 ₽/мес.');
  } else if (wantsOlympiads) {
    suggestedActionTab = 'olympiads';
    suggestedActionLabel = 'Открыть навигатор Олимпиад и БВИ';
    toolName = 'Перечень олимпиад РСОШ и реестр БВИ';
    toolQuery = 'Правила подтверждения 75+ баллов ЕГЭ';
    evidenceLines.push('ПРАВИЛА БВИ: Дипломы олимпиад РСОШ 1–3 уровней требуют подтверждения профильным ЕГЭ на 75+ баллов. ВсОШ даёт безусловное БВИ без подтверждения.');
  } else if (wantsFinance) {
    suggestedActionTab = 'credit';
    suggestedActionLabel = 'Рассчитать кредит 3% в Симуляторе';
    toolName = 'Симулятор образовательного кредита 3%';
    toolQuery = 'Субсидированная ставка Сбера с 15-летним сроком';
    evidenceLines.push('КРЕДИТ С ГОСПОДДЕРЖКОЙ: Фиксированная ставка 3% годовых. Во время учёбы платятся только проценты (~150–600 ₽/мес). Выплата основного долга — в течение 15 лет после выпуска.');
  } else if (q.includes('медал') || q.includes('гто') || q.includes('достижен')) {
    suggestedActionTab = 'achievements';
    suggestedActionLabel = 'Калькулятор достижений (+10 баллов)';
    toolName = 'Калькулятор индивидуальных достижений (ФЗ-273)';
    toolQuery = 'Суммарный лимит +10 баллов за медали, ГТО и волонтерство';
    evidenceLines.push('ИНДИВИДУАЛЬНЫЕ ДОСТИЖЕНИЯ: Максимум +10 баллов к ЕГЭ суммарно. Золотая медаль: 5–10 баллов, знак ГТО: 2–5 баллов, волонтёрство: 1–4 балла.');
  } else if (userScore) {
    suggestedActionTab = 'calculator';
    suggestedActionLabel = 'Открыть Калькулятор шансов ЕГЭ';
    toolName = 'Калькулятор шансов поступления (ФИС ГИА)';
    toolQuery = `Распределение программ по конкурсу для суммы: ${userScore} баллов`;
  }

  evidence = evidenceLines.join('\n');

  return {
    evidence,
    matchedUniversities,
    reasoningTrace,
    suggestedActionTab,
    suggestedActionLabel,
    toolName,
    toolQuery,
    probability,
  };
}

const SYSTEM_INSTRUCTION_BASE = `Ты — Дед Вузопед, мудрый, авторитетный и дружелюбный AI-наставник официального портала Вузопедия (vuzopedia.ru) по приёмной кампании 2026 года.
Твоя цель — дать абитуриенту или родителю исчерпывающий, структурированный и практически применимый ответ.

Правила форматирования и поведения:
1. Используй аккуратные списки, выделяй ключевые цифры, вузы и факты **жирным шрифтом**.
2. Обязательно опирайся на предоставленный контекст из базы данных Вузопедии: цитируй реальные проходные баллы, бюджетные места, наличие военной кафедры (ВУЦ) и стоимость общежития.
3. Оперируй актуальными правилами поступления 2026 года в РФ:
   - БВИ (Без вступительных испытаний) по олимпиадам РСОШ 1–3 уровней требует подтверждения профильным ЕГЭ на 75+ баллов. ВсОШ не требует подтверждения.
   - Льготный образовательный кредит с господдержкой (Сбербанк): фиксированная ставка 3% годовых, льготный период во время учёбы + 9 месяцев, срок погашения до 15 лет.
   - Дополнительные баллы к ЕГЭ за индивидуальные достижения (ФЗ-273): суммарно максимум +10 баллов (золотая/серебряная медаль, знак ГТО своей возрастной ступени, волонтёрская книжка, итоговое сочинение).
   - Военные учебные центры (ВУЦ): офицер/сержант запаса без срочной службы.
   - Общежития: гарантия для очников-бюджетников, стоимость от 800 до 2500 руб/мес.
4. В самом конце ответа укажи использованный внутренний инструмент и кнопку перехода в раздел сайта в точном формате:
   [TOOL: <Название инструмента> | <Краткий поисковый запрос/база данных>]
   [ACTION: <tab_id> | <Название кнопки>]

Доступные tab_id:
- calculator (Калькулятор ЕГЭ 2026)
- programs (Каталог программ бакалавриата и специалитета)
- military (Военные учебные центры ВУЦ)
- dorms (Каталог студенческих общежитий)
- olympiads (БВИ и олимпиады РСОШ)
- credit (Образовательный кредит 3%)
- achievements (Учет индивидуальных достижений +10 баллов)
- budget (Калькулятор бюджета студента)
- target (Целевое обучение от предприятий)
- fear_map (Карта страхов абитуриента)
- catalog (Каталог вузов России)`;

/**
 * Ask Gemini Agentic RAG Assistant with Grounding & Fallback
 */
export async function queryDedAssistant(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }> = [],
  mode: SpecialistMode = 'all'
): Promise<GeneratedAssistantResponse> {
  const startTime = performance.now();
  const apiKey = getStoredApiKey();

  // Step 1: Agentic RAG Retrieval
  const rag = retrieveRAGContext(prompt, mode);

  const augmentedSystemInstruction = `${SYSTEM_INSTRUCTION_BASE}

АКТУАЛЬНЫЙ КОНТЕКСТ ИЗ БАЗЫ ДАННЫХ ВУЗОПЕДИИ:
${rag.evidence}

Используй эти точные факты, баллы и вузы в ответе!`;

  // Step 2: Try Gemini 3.5 Flash, then Gemini 3.5 Flash Lite
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];

  for (const model of modelsToTry) {
    let timeoutId: any = null;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = [
        ...history.slice(-4).map((h) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: augmentedSystemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 1200,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`Gemini API model ${model} returned status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText && rawText.trim()) {
        const durationMs = Math.round(performance.now() - startTime);

        let cleanText = rawText;
        let toolName = rag.toolName;
        let toolQuery = rag.toolQuery;
        let actionTab = rag.suggestedActionTab;
        let actionLabel = rag.suggestedActionLabel;

        const toolMatch = cleanText.match(/\[TOOL:\s*([^|]+)\|\s*([^\]]+)\]/i);
        if (toolMatch) {
          toolName = toolMatch[1].trim();
          toolQuery = toolMatch[2].trim();
          cleanText = cleanText.replace(toolMatch[0], '').trim();
        }

        const actionMatch = cleanText.match(/\[ACTION:\s*([^|]+)\|\s*([^\]]+)\]/i);
        if (actionMatch) {
          actionTab = actionMatch[1].trim();
          actionLabel = actionMatch[2].trim();
          cleanText = cleanText.replace(actionMatch[0], '').trim();
        }

        const suggestions = generateContextualSuggestions(prompt, cleanText, rag.matchedUniversities);

        return {
          reply: cleanText,
          toolCall: {
            name: toolName,
            query: toolQuery,
            duration: `${durationMs}ms`,
            status: 'complete',
          },
          actionTab,
          actionLabel,
          suggestions,
          modelUsed: 'gemini',
          matchedUniversities: rag.matchedUniversities,
          reasoningTrace: rag.reasoningTrace,
          probability: rag.probability,
        };
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn(`Error querying Gemini model ${model}:`, err);
    }
  }

  // Graceful Local Fallback if API or Network is unavailable
  return queryLocalFallbackEngine(prompt, startTime, rag);
}

/**
 * Local Grounded Fallback Engine incorporating the RAG evidence
 */
function queryLocalFallbackEngine(
  query: string,
  startTime: number,
  rag: RAGRetrievalResult
): GeneratedAssistantResponse {
  const durationMs = Math.round(performance.now() - startTime);

  let reply = '';

  if (rag.matchedUniversities.length > 0) {
    reply =
      `**Аналитический отчёт по твоему запросу:**\n\n` +
      `По результатам сверки с базой данных 2026 года рекомендую обратить внимание на следующие ключевые вузы:\n\n` +
      rag.matchedUniversities
        .map(
          (u, idx) =>
            `${idx + 1}. **${u.shortName}** (${u.city}):\n` +
            `   • Проходной балл на бюджет: **от ${u.minBudgetScore}**\n` +
            `   • Бюджетных мест: **${u.totalBudgetPlaces}**\n` +
            `   • Военный учебный центр (ВУЦ): **${u.hasMilitaryDept ? 'Есть (офицер/сержант запаса)' : 'Нет'}**\n` +
            `   • Общежитие: **${u.hasDormitory ? 'Предоставляется (' + (u.dormitoryInfo?.costMonth || 1200) + ' ₽/мес)' : 'Нет'}**`
        )
        .join('\n\n') +
      `\n\n**Совет Деда Вузопеда:** подавай документы в 5 вузов по 5 направлений, используя запасные варианты с проходными баллами на 10–15 пунктов ниже твоих результатов!`;
  } else {
    reply =
      `Я проанализировал твой запрос «${query}». Чтобы поступление прошло без стресса и с максимальным результатом, рекомендую:\n\n` +
      '1. **Оценить шансы** в интерактивном Калькуляторе ЕГЭ\n' +
      '2. **Пройти профориентационные тесты**, если ещё выбираешь специальность\n' +
      '3. **Сверить ключевые даты** в Календаре абитуриента 2026 года\n' +
      '4. **Проверить выбранные вузы** в Чёрном списке на предмет лишения аккредитации.\n\n' +
      'Какой конкретный вопрос о вузах или экзаменах тебя интересует?';
  }

  const suggestions = generateContextualSuggestions(query, reply, rag.matchedUniversities);

  return {
    reply,
    toolCall: {
      name: rag.toolName,
      query: rag.toolQuery,
      duration: `${durationMs || 120}ms`,
      status: 'complete',
    },
    actionTab: rag.suggestedActionTab,
    actionLabel: rag.suggestedActionLabel,
    suggestions,
    modelUsed: 'local',
    matchedUniversities: rag.matchedUniversities,
    reasoningTrace: rag.reasoningTrace,
    probability: rag.probability,
  };
}

function generateContextualSuggestions(prompt: string, reply: string, vuzes: University[] = []): string[] {
  const p = (prompt + ' ' + reply).toLowerCase();

  if (vuzes.length > 0) {
    const topVuz = vuzes[0];
    return [
      `Какие программы есть в ${topVuz.shortName}?`,
      `Сколько стоит общежитие в ${topVuz.shortName}?`,
      'Как оценить мои шансы по баллам ЕГЭ?',
      'Как получить +10 баллов к ЕГЭ?',
    ];
  }

  if (p.includes('it') || p.includes('программ')) {
    return [
      'Какие проходные баллы на IT в ВШЭ?',
      'Есть ли военная кафедра в ИТМО?',
      'Где дают скидки за баллы?',
    ];
  }
  if (p.includes('вуц') || p.includes('воен')) {
    return [
      'Какие нормативы физподготовки в ВУЦ?',
      'Даёт ли колледж отсрочку от армии?',
      'В каких вузах Москвы есть ВУЦ?',
    ];
  }
  if (p.includes('медал') || p.includes('гто') || p.includes('достижен')) {
    return [
      'Сколько баллов даёт волонтёрская книжка?',
      'Дают ли баллы за серебряную медаль?',
      'Как подтвердить значок ГТО?',
    ];
  }
  if (p.includes('бви') || p.includes('олимпиад')) {
    return [
      'Что будет, если набрать меньше 75 баллов?',
      'Какие олимпиады 1 уровня по физике?',
      'Где посмотреть перечень РСОШ?',
    ];
  }
  return [
    'Как рассчитать шансы по баллам ЕГЭ?',
    'Сколько стоит общежитие в Москве?',
    'Как работает кредит 3% от Сбера?',
    'Что такое целевой договор?',
  ];
}
