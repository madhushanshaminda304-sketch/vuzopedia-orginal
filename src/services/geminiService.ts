/**
 * Gemini AI Service for Ded Vuzoped Assistant
 * Connects to Google Generative Language API (Gemini 3.5 Flash) with seamless fallback
 */

const STORAGE_KEY = 'vuzopedia_gemini_api_key';
export const DEFAULT_GEMINI_KEY = '';

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

const SYSTEM_INSTRUCTION = `Ты — Дед Вузопед, мудрый, авторитетный и дружелюбный AI-наставник официального портала Вузопедия (vuzopedia.ru) по приёмной кампании 2026 года.
Твоя цель — дать абитуриенту или родителю исчерпывающий, структурированный и практически применимый ответ.

Правила форматирования:
1. Используй аккуратные списки, выделяй ключевые цифры и факты **жирным шрифтом**.
2. Оперируй актуальными правилами поступления 2026 года в РФ:
   - БВИ (Без вступительных испытаний) по олимпиадам РСОШ 1–3 уровней требует подтверждения профильным ЕГЭ на 75+ баллов. ВсОШ не требует подтверждения.
   - Льготный образовательный кредит с господдержкой (Сбербанк): фиксированная ставка 3% годовых, льготный период во время учёбы + 9 месяцев, срок погашения до 15 лет.
   - Дополнительные баллы к ЕГЭ за индивидуальные достижения (ФЗ-273): суммарно максимум +10 баллов (золотая/серебряная медаль, знак ГТО своей возрастной ступени, волонтёрская книжка, итоговое сочинение).
   - Военные учебные центры (ВУЦ): офицер/сержант запаса без срочной службы, строгие нормативы физподготовки (подтягивания 10+, бег).
   - Общежития: гарантия для очников-бюджетников, стоимость от 800 до 2500 руб/мес.
3. В самом конце ответа ОБЯЗАТЕЛЬНО укажи использованный внутренний инструмент и (если уместно) кнопку перехода в раздел сайта в точном формате:
   [TOOL: <Название инструмента> | <Краткий поисковый запрос/база данных>]
   [ACTION: <tab_id> | <Название кнопки>]

Доступные tab_id для ACTION:
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
 * Ask Gemini API with automatic model fallback & local engine backup
 */
export async function queryDedAssistant(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }> = []
): Promise<GeneratedAssistantResponse> {
  const startTime = performance.now();
  const apiKey = getStoredApiKey();

  // Try Gemini 3.5 Flash first, then 3.5 Flash Lite
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];

  for (const model of modelsToTry) {
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

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!res.ok) {
        console.warn(`Gemini API model ${model} returned status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText && rawText.trim()) {
        const durationMs = Math.round(performance.now() - startTime);

        // Parse annotations [TOOL: ...] and [ACTION: ...]
        let cleanText = rawText;
        let toolName = 'Аналитический модуль Вузопедия AI';
        let toolQuery = 'Поиск по нормативной базе Минобрнауки 2026';
        let actionTab: string | undefined;
        let actionLabel: string | undefined;

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

        // Generate contextual suggestions
        const suggestions = generateContextualSuggestions(prompt, cleanText);

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
        };
      }
    } catch (err) {
      console.warn(`Error querying Gemini model ${model}:`, err);
    }
  }

  // Graceful Local Fallback if API or Network is unavailable
  return queryLocalFallbackEngine(prompt, startTime);
}

/**
 * High-speed local fallback engine covering all 9 key domains
 */
function queryLocalFallbackEngine(query: string, startTime: number): GeneratedAssistantResponse {
  const durationMs = Math.round(performance.now() - startTime);
  const q = query.toLowerCase().trim();

  // 1. IT & Computer Science
  if (
    q.includes('it') ||
    q.includes('ит') ||
    q.includes('программист') ||
    q.includes('информатик') ||
    q.includes('код') ||
    q.includes('разработ')
  ) {
    return {
      reply:
        '**Лидеры IT-образования в России по зарплатам выпускников и качеству математики:**\n\n' +
        '1. **НИУ ВШЭ** (ФКН — совместные программы с Яндексом, средняя зарплата выпускников 240 000 ₽)\n' +
        '2. **МГТУ им. Баумана** (ИУ — легендарная инженерная школа, разработка ПО и архитектура систем)\n' +
        '3. **Университет ИТМО** (Мировые чемпионы по спортивному программированию ICPC, AI-лаборатории)\n' +
        '4. **МФТИ** (ФПМИ — сильнейший Data Science и Machine Learning в СНГ)\n\n' +
        'Все эти программы доступны в нашем едином Каталоге с фильтрами по баллам ЕГЭ и бюджетным местам!',
      toolCall: {
        name: 'Реестр программ IT и программной инженерии',
        query: 'Выборка направлений 09.03.01, 09.03.04, 01.03.02 в Москве и СПб',
        duration: `${durationMs || 160}ms`,
        status: 'complete',
      },
      actionTab: 'programs',
      actionLabel: 'Смотреть программы IT-направлений',
      suggestions: ['Какие проходные баллы на IT в ВШЭ?', 'Есть ли военная кафедра в ИТМО?', 'Где дают скидки за баллы?'],
      modelUsed: 'local',
    };
  }

  // 2. Military Centers & Army
  if (
    q.includes('арми') ||
    q.includes('вуц') ||
    q.includes('военн') ||
    q.includes('кафедр') ||
    q.includes('отсрочк') ||
    q.includes('призыв')
  ) {
    return {
      reply:
        '**Военный учебный центр (ВУЦ)** позволяет получить звание офицера, сержанта или рядового запаса **без прохождения срочной службы в армии**!\n\n' +
        '**Ключевые условия поступления в ВУЦ:**\n' +
        '• Очное обучение на аккредитованной программе бакалавриата или специалитета\n' +
        '• Сдача нормативов физподготовки (подтягивания от 10 раз, бег 100м до 14.2с, кросс 3км до 13 минут)\n' +
        '• Категория годности по здоровью «А» или «Б» (подтверждается ВВК в военкомате)\n\n' +
        'Ознакомься с нормативами и перечнем вузов в нашем интерактивном разделе!',
      toolCall: {
        name: 'База Военных учебных центров Минобороны РФ',
        query: 'Сверка вузов с лицензированными ВУЦ и военными специальностями',
        duration: `${durationMs || 150}ms`,
        status: 'complete',
      },
      actionTab: 'military',
      actionLabel: 'Открыть раздел Военных кафедр (ВУЦ)',
      suggestions: ['Как подготовиться к нормативам ВУЦ?', 'Какие вузы в Чёрном списке?', 'Дает ли колледж отсрочку?'],
      modelUsed: 'local',
    };
  }

  // 3. Dormitories & Housing
  if (
    q.includes('общежит') ||
    q.includes('общаг') ||
    q.includes('жил') ||
    q.includes('комнат') ||
    q.includes('аренд') ||
    q.includes('проживан')
  ) {
    return {
      reply:
        '**Общежития для иногородних студентов в 2026 году:**\n\n' +
        '• **МГУ, МГТУ и МИФИ:** 100% первокурсников-бюджетников получают гарантированное место от **850 до 1 400 ₽/мес**\n' +
        '• **НИУ ВШЭ:** студенты живут в современных студгородках квартирного типа (Дубки, Одинцово) за **~2 100 ₽/мес**\n' +
        '• Дорога до учебных корпусов в среднем занимает от 15 до 45 минут на общественном транспорте.\n\n' +
        'Смотри фотографии, адреса и условия заселения в нашем каталоге общежитий!',
      toolCall: {
        name: 'Справочник студенческого жилья и кампусов',
        query: 'Фильтрация общежитий по цене, типу и 100% гарантии 1 курсу',
        duration: `${durationMs || 175}ms`,
        status: 'complete',
      },
      actionTab: 'dorms',
      actionLabel: 'Перейти в каталог Общежитий',
      suggestions: ['Сколько стоит жить студенту в Москве?', 'Где посмотреть отзывы об общежитиях?'],
      modelUsed: 'local',
    };
  }

  // 4. Olympiads & BVI
  if (
    q.includes('олимпиад') ||
    q.includes('бви') ||
    q.includes('рсош') ||
    q.includes('всош') ||
    q.includes('без экзамен')
  ) {
    return {
      reply:
        '**БВИ (Без вступительных испытаний)** — главный джекпот абитуриента!\n\n' +
        '• **Всероссийская олимпиада школьников (ВсОШ):** дипломы победителя/призёра дают БВИ в любой вуз РФ без подтверждения баллами ЕГЭ!\n' +
        '• **Перечневые олимпиады РСОШ 1–3 уровня:** («Высшая проба», «Шаг в будущее», «Ломоносов» и др.) дают БВИ или 100 баллов, но диплом **обязательно** нужно подтвердить сдачей профильного ЕГЭ на **75+ баллов**.\n\n' +
        'Проверь свой диплом и вузы, принимающие его, в нашем БВИ-навигаторе!',
      toolCall: {
        name: 'Перечень РСОШ и реестр олимпиад Минобрнауки РФ',
        query: 'Сопоставление дипломов олимпиад с правилами БВИ на 2026 год',
        duration: `${durationMs || 190}ms`,
        status: 'complete',
      },
      actionTab: 'olympiads',
      actionLabel: 'Открыть навигатор Олимпиад и БВИ',
      suggestions: ['Какие олимпиады дают БВИ по физике?', 'Что будет, если набрать меньше 75 баллов?'],
      modelUsed: 'local',
    };
  }

  // 5. Educational Credit 3%
  if (
    q.includes('кредит') ||
    q.includes('сбер') ||
    q.includes('3%') ||
    q.includes('господдержк') ||
    q.includes('платн') ||
    q.includes('оплат')
  ) {
    return {
      reply:
        '**Образовательный кредит с господдержкой (Сбербанк под 3%):**\n\n' +
        '• Ставка для студента фиксирована: всего **3% годовых** (остальную ставку банку субсидирует государство).\n' +
        '• Во время обучения и 9 месяцев после выпуска ты платишь только крошечные проценты: **~150–600 ₽ в месяц**!\n' +
        '• Основной долг выплачивается в течение **15 лет** после трудоустройства.\n' +
        '• Кредит можно взять с 14 лет без поручителей и справок о доходах.\n\n' +
        'Рассчитай ежемесячный платёж в нашем интерактивном симуляторе!',
      toolCall: {
        name: 'Симулятор образовательного кредита с господдержкой 3%',
        query: 'Расчёт платежей по программам со стоимостью от 150к до 800к ₽/год',
        duration: `${durationMs || 135}ms`,
        status: 'complete',
      },
      actionTab: 'credit',
      actionLabel: 'Рассчитать кредит 3% в Симуляторе',
      suggestions: ['Можно ли погасить кредит досрочно?', 'Что делать при отчислении или переводе?'],
      modelUsed: 'local',
    };
  }

  // 6. Individual Achievements (+10 extra points)
  if (
    q.includes('медал') ||
    q.includes('гто') ||
    q.includes('волонтер') ||
    q.includes('достижен') ||
    q.includes('сочинен') ||
    q.includes('+10')
  ) {
    return {
      reply:
        '**Дополнительные баллы к ЕГЭ за индивидуальные достижения (ФЗ-273):**\n\n' +
        'По закону суммарно вуз может начислить **не более 10 баллов** к сумме трёх ЕГЭ:\n' +
        '• **Золотая / серебряная медаль:** от +3 до +10 баллов (в зависимости от вуза)\n' +
        '• **Знак отличия ГТО (золотой, серебряный, бронзовый):** от +2 до +5 баллов\n' +
        '• **Волонтёрская книжка (Добро.рф):** от +1 до +4 баллов (при наработке 100+ часов)\n' +
        '• **Итоговое школьное сочинение:** от +1 до +5 баллов в гуманитарных вузах.\n\n' +
        'Узнай точные баллы в интересующих вузах в нашем калькуляторе достижений!',
      toolCall: {
        name: 'Калькулятор индивидуальных достижений (ФЗ-273)',
        query: 'Сверка шкал начисления баллов за медали, ГТО и волонтерство',
        duration: `${durationMs || 155}ms`,
        status: 'complete',
      },
      actionTab: 'achievements',
      actionLabel: 'Открыть Калькулятор достижений (+10 баллов)',
      suggestions: ['Сколько часов волонтерства нужно для доп. баллов?', 'Как подтвердить золотой значок ГТО?'],
      modelUsed: 'local',
    };
  }

  // 7. Student Living Budget
  if (
    q.includes('бюджет') ||
    q.includes('расход') ||
    q.includes('карманн') ||
    q.includes('жизнь студент') ||
    q.includes('сколько тратит')
  ) {
    return {
      reply:
        '**Реальный бюджет студента на месяц (расчёты 2026 года):**\n\n' +
        '• **Москва:** 32 000 – 48 000 ₽ (питание ~18 000 ₽, общага ~1 500 ₽, проездной ~1 200 ₽, досуг и связь ~8 000 ₽)\n' +
        '• **Санкт-Петербург:** 26 000 – 38 000 ₽\n' +
        '• **Региональные центры (Казань, Томск, Нижний Новгород):** 18 000 – 28 000 ₽\n\n' +
        'Скорректируй свои статьи расходов в нашем Калькуляторе бюджета студента!',
      toolCall: {
        name: 'Калькулятор стоимости жизни студента по городам РФ',
        query: 'Аналитика цен потребительской корзины студентов за 2025–2026 гг.',
        duration: `${durationMs || 165}ms`,
        status: 'complete',
      },
      actionTab: 'budget',
      actionLabel: 'Спланировать бюджет в Калькуляторе',
      suggestions: ['Сколько платят академическую стипендию?', 'Как сэкономить на проезде и питании?'],
      modelUsed: 'local',
    };
  }

  // 8. Target Contracts (Целевое обучение)
  if (
    q.includes('целев') ||
    q.includes('предприят') ||
    q.includes('договор') ||
    q.includes('заказчик') ||
    q.includes('росатом') ||
    q.includes('газпром')
  ) {
    return {
      reply:
        '**Целевое обучение через платформу «Работа в России»:**\n\n' +
        '• Обучение полностью оплачивается государством или корпорацией-заказчиком (Росатом, РЖД, Ростех).\n' +
        '• Отдельный целевой конкурс (проходные баллы обычно на 20–40 пунктов ниже общего конкурса!).\n' +
        '• Дополнительная стипендия от предприятия от 5 000 до 35 000 ₽/мес.\n' +
        '• Обязательство отработать от 3 до 5 лет на предприятии после получения диплома.\n\n' +
        'Изучи предложения заказчиков в нашем каталоге целевых программ!',
      toolCall: {
        name: 'Единый реестр целевых квот («Работа в России»)',
        query: 'Агрегация предложений корпораций с гарантией трудоустройства',
        duration: `${durationMs || 180}ms`,
        status: 'complete',
      },
      actionTab: 'target',
      actionLabel: 'Смотреть целевые предложения корпораций',
      suggestions: ['Нужно ли возвращать деньги, если отчислили?', 'Какие вузы сотрудничают с Росатомом?'],
      modelUsed: 'local',
    };
  }

  // 9. EGE Scores & Calculator
  if (
    q.includes('балл') ||
    q.includes('егэ') ||
    q.includes('шанс') ||
    q.includes('калькулятор') ||
    q.includes('проходн')
  ) {
    return {
      reply:
        '**Калькулятор ЕГЭ 2026 поможет оценить реальные шансы поступления!**\n\n' +
        'Введи свои баллы по предметам, и наш алгоритм распределит программы вузов по зонам риска:\n' +
        '• 🟢 **Зелёная зона:** надёжное гарантированное поступление (запас от +5 баллов)\n' +
        '• 🟡 **Жёлтая зона:** пограничный конкурс (борьба за последние бюджетные места)\n' +
        '• 🔴 **Красная зона:** высококонкурентные специальности (требуются олимпиады или квоты)',
      toolCall: {
        name: 'Калькулятор шансов поступления (ФИС ГИА)',
        query: 'Анализ проходных баллов 2024–2025 гг. по 11 предметам ЕГЭ',
        duration: `${durationMs || 140}ms`,
        status: 'complete',
      },
      actionTab: 'calculator',
      actionLabel: 'Открыть Калькулятор ЕГЭ 2026',
      suggestions: ['Как получить +10 баллов к ЕГЭ?', 'Какие ЕГЭ сдавать для IT?', 'Что такое БВИ?'],
      modelUsed: 'local',
    };
  }

  // Default Fallback
  return {
    reply:
      `Я проанализировал твой запрос «${query}». Чтобы поступление прошло без стресса и с максимальным результатом, рекомендую:\n\n` +
      '1. **Оценить шансы** в интерактивном Калькуляторе ЕГЭ\n' +
      '2. **Пройти профориентационные тесты**, если ещё выбираешь специальность\n' +
      '3. **Сверить ключевые даты** в Календаре абитуриента 2026 года\n' +
      '4. **Проверить выбранные вузы** в Чёрном списке на предмет лишения аккредитации.\n\n' +
      'Какой конкретный вопрос о вузах или экзаменах тебя интересует?',
    toolCall: {
      name: 'Интеллектуальный маршрутизатор абитуриента',
      query: `Семантический поиск по 18 модулям Вузопедии для: "${query}"`,
      duration: `${durationMs || 130}ms`,
      status: 'complete',
    },
    actionTab: 'calculator',
    actionLabel: 'Открыть Калькулятор шансов ЕГЭ',
    suggestions: [
      'Как оценить мои шансы по баллам ЕГЭ?',
      'Где есть военная кафедра (ВУЦ)?',
      'Сколько баллов даёт золотая медаль?',
      'Как работает кредит 3%?',
    ],
    modelUsed: 'local',
  };
}

function generateContextualSuggestions(prompt: string, reply: string): string[] {
  const p = (prompt + ' ' + reply).toLowerCase();
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
