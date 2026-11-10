import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Home,
  Trophy,
  CreditCard,
  Medal,
  Wallet,
  Calendar,
  BookOpen,
  Mic,
  MicOff,
} from 'lucide-react';

interface DedVuzopedAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

interface ToolCall {
  name: string;
  query: string;
  duration: string;
  status: 'complete';
}

interface AssistantMessage {
  id: string;
  sender: 'ded' | 'user';
  text: string;
  timestamp: string;
  toolCall?: ToolCall;
  actionTab?: string;
  actionLabel?: string;
  suggestions?: string[];
}

export const DedVuzopedAssistantModal: React.FC<DedVuzopedAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ded',
      text: 'Здравствуй, будущий студент! Я Дед Вузопед — твой персональный AI-консультант по приёмной кампании 2026 года. \n\nЯ знаю всё о проходных баллах, общежитиях, военных кафедрах, олимпиадах БВИ, льготном кредите 3% и доп. баллах к ЕГЭ. Спроси меня о любом вузе, специальности или правилах приёма!',
      timestamp: 'Только что',
      suggestions: [
        'Как оценить мои шансы по баллам ЕГЭ?',
        'Какие лучшие IT-вузы в Москве и СПб?',
        'Где есть военная кафедра (ВУЦ)?',
        'Сколько баллов даёт золотая медаль и ГТО?',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [isOpen, messages, isTyping]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isAtBottom);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const restartChat = () => {
    setMessages([
      {
        id: 'msg-restart',
        sender: 'ded',
        text: 'Диалог начат заново. Готов ответить на новые вопросы о вузах, экзаменах и поступлении 2026 года!',
        timestamp: 'Только что',
        suggestions: [
          'Как рассчитать шансы по баллам ЕГЭ?',
          'Какие вузы дают скидку до 70% на платном?',
          'Как подтвердить БВИ перечневой олимпиадой?',
          'Сколько стоит жизнь студента в Москве?',
        ],
      },
    ]);
  };

  // Comprehensive Knowledge Engine matching user queries
  const generateDedResponse = (query: string): {
    reply: string;
    toolCall: ToolCall;
    actionTab?: string;
    actionLabel?: string;
    suggestions: string[];
  } => {
    const q = query.toLowerCase().trim();

    // 1. IT & Computer Science (takes precedence when user mentions IT/coding/CS)
    if (q.includes('it') || q.includes('ит') || q.includes('программист') || q.includes('информатик') || q.includes('код') || q.includes('разработ')) {
      return {
        reply: 'Лидеры IT-образования в России по зарплатам выпускников и качеству математики:\n1. НИУ ВШЭ (ФКН — совместные программы с Яндексом, средняя зарплата 240 000 ₽)\n2. МГТУ им. Баумана (ИУ — легендарная инженерная школа и архитектура систем)\n3. Университет ИТМО (Мировые чемпионы по программированию ICPC, AI-лаборатории)\n4. МФТИ (ФПМИ — сильнейший Data Science и Machine Learning в СНГ)\n\nВсе эти программы доступны в нашем едином Каталоге программ с фильтром по проходным баллам!',
        toolCall: {
          name: 'Реестр программ IT и программной инженерии',
          query: 'Выборка направлений 09.03.01, 09.03.04, 01.03.02 в Москве и СПб',
          duration: '190ms',
          status: 'complete',
        },
        actionTab: 'programs',
        actionLabel: 'Смотреть программы IT-направлений',
        suggestions: ['Какие проходные баллы на IT в ВШЭ?', 'Есть ли военная кафедра в ИТМО?', 'Где дают скидки за баллы?'],
      };
    }

    // 2. EGE Scores & Calculator
    if (q.includes('балл') || q.includes('егэ') || q.includes('шанс') || q.includes('калькулятор') || q.includes('проходн')) {
      return {
        reply: 'Для точного расчета шансов перейди в наш Калькулятор ЕГЭ 2026. Введи свои баллы по предметам, и алгоритм распределит программы вузов по зонам:\n• Зелёная: гарантированное поступление (запас от +5 баллов)\n• Жёлтая: пограничный конкурс (борьба за последние бюджетные места)\n• Красная: высококонкурентные специальности (требуются олимпиады или квоты)',
        toolCall: {
          name: 'Калькулятор шансов поступления (ФИС ГИА)',
          query: 'Анализ проходных баллов 2024–2025 гг. по 11 предметам ЕГЭ',
          duration: '140ms',
          status: 'complete',
        },
        actionTab: 'calculator',
        actionLabel: 'Открыть Калькулятор ЕГЭ 2026',
        suggestions: ['Как получить +10 баллов к ЕГЭ?', 'Какие ЕГЭ сдавать для IT?', 'Что такое БВИ?'],
      };
    }

    // 3. Military Centers & Army
    if (q.includes('арми') || q.includes('вуц') || q.includes('военн') || q.includes('кафедр') || q.includes('отсрочк') || q.includes('призыв')) {
      return {
        reply: 'Военный учебный центр (ВУЦ) позволяет получить звание офицера, сержанта или рядового запаса БЕЗ прохождения срочной службы в армии!\n\nКлючевые условия поступления в ВУЦ:\n• Очное обучение на аккредитованной программе\n• Сдача нормативов физподготовки (подтягивания от 10 раз, бег 100м до 14.2с, кросс 3км до 13 минут)\n• Категория годности по здоровью «А» или «Б»\n\nИзучи нормативы и список вузов с ВУЦ в нашем интерактивном разделе!',
        toolCall: {
          name: 'База Военных учебных центров Минобороны РФ',
          query: 'Сверка вузов с лицензированными ВУЦ и военными специальностями',
          duration: '160ms',
          status: 'complete',
        },
        actionTab: 'military',
        actionLabel: 'Открыть раздел Военных кафедр (ВУЦ)',
        suggestions: ['Как подготовиться к нормативам ВУЦ?', 'Какие вузы в Чёрном списке?', 'Дает ли колледж отсрочку?'],
      };
    }

    // 4. Dormitories & Housing
    if (q.includes('общежит') || q.includes('общаг') || q.includes('жил') || q.includes('комнат') || q.includes('аренд') || q.includes('проживан')) {
      return {
        reply: 'Общежития для иногородних студентов предоставляются на конкурсной основе:\n• В МГУ, МГТУ и МИФИ 100% первокурсников получают гарантированное место от 850 до 1 400 ₽/мес\n• В НИУ ВШЭ студенты живут в современных студгородках квартирного типа (Дубки, Одинцово) за ~2 100 ₽/мес\n• В среднем дорога до кампуса занимает от 15 до 45 минут на метро\n\nСмотри фотографии, адреса и условия заселения в нашем каталоге общежитий!',
        toolCall: {
          name: 'Справочник студенческого жилья и кампусов',
          query: 'Фильтрация общежитий по цене, типу и 100% гарантии 1 курсу',
          duration: '175ms',
          status: 'complete',
        },
        actionTab: 'dorms',
        actionLabel: 'Перейти в каталог Общежитий',
        suggestions: ['Сколько стоит жить студенту в Москве?', 'Где посмотреть отзывы об общежитиях?'],
      };
    }

    // 5. Olympiads & BVI
    if (q.includes('олимпиад') || q.includes('бви') || q.includes('рсош') || q.includes('всош') || q.includes('без экзамен')) {
      return {
        reply: 'БВИ (Без вступительных испытаний) — главный джекпот абитуриента!\n• Всероссийская олимпиада (ВсОШ): даёт БВИ в любой вуз РФ без подтверждения баллами ЕГЭ!\n• Олимпиады РСОШ 1–3 уровня («Высшая проба», «Шаг в будущее», «Ломоносов»): дают БВИ или 100 баллов, но диплом ОБЯЗАТЕЛЬНО нужно подтвердить сдачей профильного ЕГЭ на 75+ баллов.\n\nПроверь свой диплом в нашем БВИ-калькуляторе!',
        toolCall: {
          name: 'Перечень РСОШ и реестр олимпиад Минобрнауки РФ',
          query: 'Проверка уровней олимпиад и правила 75 баллов',
          duration: '210ms',
          status: 'complete',
        },
        actionTab: 'olympiads',
        actionLabel: 'Открыть Олимпиады и БВИ',
        suggestions: ['Что если набрал 74 балла по ЕГЭ?', 'В сколько вузов можно подать БВИ?'],
      };
    }

    // 6. Educational Credit 3% & Tuition Discounts
    if (q.includes('кредит') || q.includes('платн') || q.includes('скидк') || q.includes('стоимост') || q.includes('цена') || q.includes('оплат')) {
      return {
        reply: 'Если не хватило баллов на бюджет — не паникуй! Государственная программа льготного образовательного кредита под 3% годовых делает обучение доступным:\n• Во время учёбы и 9 месяцев после ты платишь только символические проценты (~200–800 ₽/мес)\n• Основной долг выплачивается в течение 15 лет после устройства на работу\n• Кредит выдается с 14 лет без залога и справок о доходах\n• В ВШЭ, РАНХиГС и МИФИ дают скидки от 25% до 70% за высокие баллы ЕГЭ!\n\nРассчитай график платежей в нашем кредитном калькуляторе.',
        toolCall: {
          name: 'Симулятор образовательного кредита с господдержкой',
          query: 'Расчет аннуитета под фиксированную ставку 3% и скидок вузов',
          duration: '150ms',
          status: 'complete',
        },
        actionTab: 'credit',
        actionLabel: 'Рассчитать Кредит 3% и скидки',
        suggestions: ['Сколько дает скидка 50% в ВШЭ?', 'Как оформить кредит в Сбере?'],
      };
    }

    // 7. Extra Points & Individual Achievements
    if (q.includes('медал') || q.includes('гто') || q.includes('волонтер') || q.includes('достижен') || q.includes('сочинен') || q.includes('доп балл')) {
      return {
        reply: 'По закону РФ вузы могут начислить до +10 дополнительных баллов к сумме трёх предметов ЕГЭ:\n• Золотая медаль (аттестат с отличием): от +3 до +10 баллов (в Бауманке дают максимум 10!)\n• Серебряная медаль: +2...+5 баллов\n• Золотой знак ГТО: +2...+5 баллов\n• Книжка волонтёра (от 100 часов на dobro.ru): +1...+4 балла\n• Итоговое сочинение: до +10 баллов (в МГУ и ВШЭ перепроверяют комиссией)\n\nПосчитай свою прибавку по разным университетам в нашем калькуляторе достижений!',
        toolCall: {
          name: 'Калькулятор индивидуальных достижений (ФЗ-273)',
          query: 'Сравнение начисления баллов за медали, ГТО и волонтерство',
          duration: '165ms',
          status: 'complete',
        },
        actionTab: 'achievements',
        actionLabel: 'Посчитать доп. баллы к ЕГЭ',
        suggestions: ['Как подтвердить часы на dobro.ru?', 'Сколько баллов даёт серебряная медаль?'],
      };
    }

    // 8. Cost of Living & Student Budget
    if (q.includes('бюджет') || q.includes('город') || q.includes('москв') || q.includes('питер') || q.includes('казан') || q.includes('еда') || q.includes('трат') || q.includes('деньг')) {
      return {
        reply: 'Реальный бюджет студента зависит от наличия общежития и города:\n• В Москве: с общежитием ~27 000 ₽/мес (без общаги при аренде квартиры ~68 000 ₽)\n• В Санкт-Петербурге: ~23 000 ₽/мес с общежитием\n• В Казани и Томске: ~18 000 – 20 000 ₽/мес\n\nПри этом средняя студенческая подработка в Москве приносит 45 000 ₽/мес, что полностью закрывает базовые потребности!',
        toolCall: {
          name: 'Калькулятор расходов и стоимости жизни студента',
          query: 'Сравнение цен на аренду, питание и транспорт по 6 крупным городам РФ',
          duration: '180ms',
          status: 'complete',
        },
        actionTab: 'student_budget',
        actionLabel: 'Открыть Калькулятор бюджета студента',
        suggestions: ['Сколько платят студентам на подработке?', 'Как получить льготный проездной?'],
      };
    }

    // 9. Target Education & Corporate Sponsors
    if (q.includes('целев') || q.includes('росатом') || q.includes('ржд') || q.includes('газпром') || q.includes('ростех') || q.includes('сбер') || q.includes('предприят')) {
      return {
        reply: 'Целевое обучение в 2026 году — это отдельный конкурс с проходным баллом ниже общего на 20–50 пунктов!\n• Крупнейшие заказчики: Росатом, Ростех, РЖД, Газпром, Сбербанк, Роскосмос\n• Стипендия от предприятия: до 35 000 – 50 000 ₽/мес в дополнение к университетской\n• Гарантированное трудоустройство по трудовому договору на 2–3 года\n• Заявки подаются через портал «Работа в России» (ТрудВсем)\n\nПосмотри открытые квоты и условия корпораций в нашем разделе!',
        toolCall: {
          name: 'Федеральный реестр целевых квот («Работа в России»)',
          query: 'Каталог работодателей и мер поддержки студентов 2026',
          duration: '195ms',
          status: 'complete',
        },
        actionTab: 'target',
        actionLabel: 'Смотреть целевые предложения корпораций',
        suggestions: ['Нужно ли возвращать деньги, если отчислили?', 'Какие вузы сотрудничают с Росатомом?'],
      };
    }

    // Default Fallback with rich smart guidance
    return {
      reply: `Я проанализировал твой запрос «${query}». Чтобы поступление прошло без стресса, рекомендую:\n1. Оценить шансы в Калькуляторе ЕГЭ\n2. Пройти профориентационные тесты, если еще сомневаешься в специальности\n3. Сверить дедлайны приёма в Календаре абитуриента 2026\n4. Проверить вузы в Чёрном списке, чтобы не попасть в реорганизуемое заведение.\n\nКакой именно вопрос тебя сейчас больше всего волнует?`,
      toolCall: {
        name: 'Интеллектуальный маршрутизатор абитуриента',
        query: `Семантический поиск по 18 модулям Вузопедии для: "${query}"`,
        duration: '130ms',
        status: 'complete',
      },
      actionTab: 'fear_map',
      actionLabel: 'Открыть Карту страхов абитуриента',
      suggestions: [
        'Как оценить мои шансы по баллам ЕГЭ?',
        'Где есть военная кафедра (ВУЦ)?',
        'Сколько баллов даёт золотая медаль?',
        'Как работает кредит 3%?',
      ],
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate smart AI inference with tools
    setTimeout(() => {
      const responseData = generateDedResponse(text);

      const dedMsg: AssistantMessage = {
        id: `ded-${Date.now()}`,
        sender: 'ded',
        text: responseData.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: responseData.toolCall,
        actionTab: responseData.actionTab,
        actionLabel: responseData.actionLabel,
        suggestions: responseData.suggestions,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, dedMsg]);
    }, 550);
  };

  const toggleDictation = () => {
    setIsDictating(!isDictating);
    if (!isDictating) {
      setInputValue('Какие проходные баллы на IT в 2026 году?');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl h-[90vh] max-h-[820px] flex flex-col overflow-hidden transition-all relative">
        {/* Top Header: Astryx AppShell / Chat Header Style */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 text-white flex items-center justify-between shadow-md relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
                🧙‍♂️
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-amber-600 rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Дед Вузопед</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase tracking-wider backdrop-blur-sm">
                  AI v2.6 Pro
                </span>
              </div>
              <p className="text-xs text-amber-100 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                <span>Нейросетевой наставник приёмной кампании 2026</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={restartChat}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition"
              title="Начать диалог сначала"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition"
              title="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Container (Astryx ChatMessageList pattern) */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-slate-950/40 relative"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isToolExpanded = expandedToolId === m.id;

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm shrink-0 shadow-sm mt-1">
                    🧙‍♂️
                  </div>
                )}

                <div className={`space-y-2 max-w-[88%] sm:max-w-[80%]`}>
                  {/* Astryx Tool Calls Component */}
                  {m.toolCall && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-xs transition">
                      <button
                        onClick={() => setExpandedToolId(isToolExpanded ? null : m.id)}
                        className="w-full px-3 py-2 flex items-center justify-between bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold truncate">
                          <Cpu className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                          <span className="truncate">{m.toolCall.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {m.toolCall.duration}
                          </span>
                        </div>
                        {isToolExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {isToolExpanded && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                          <span className="text-slate-400 block mb-1">Параметры поискового запроса:</span>
                          <code className="text-brand-600 dark:text-brand-400">{m.toolCall.query}</code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble (Astryx ChatMessageBubble) */}
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm transition ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>

                    {/* Action Deep Link Button */}
                    {m.actionTab && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            onNavigateTab(m.actionTab!);
                            onClose();
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md hover:scale-105 transform"
                        >
                          <span>{m.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => copyMessage(m.id, m.text)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Скопировать ответ"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggestions Pills attached to message */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s)}
                          className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-brand-500 border border-slate-200 dark:border-slate-800 text-[11px] font-medium transition hover:shadow-sm text-left"
                        >
                          💬 {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shrink-0">
                🧙‍♂️
              </div>
              <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Дед Вузопед размышляет...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 right-6 z-20 p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-110 transition animate-bounce"
            title="Прокрутить вниз"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Message Input Box: Astryx ChatComposer pattern */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDictation}
              className={`p-2.5 rounded-2xl transition border ${
                isDictating
                  ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/60 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200'
              }`}
              title={isDictating ? 'Выключить голосовой ввод' : 'Голосовой ввод'}
            >
              {isDictating ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              autoFocus
              data-testid="ded-assistant-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder="Спросите о баллах ЕГЭ, вузах, общежитиях, ВУЦ или олимпиадах..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim()}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Нажмите <strong>Enter</strong> для отправки</span>
            <span>Дед Вузопед AI обучен на правилах приёма 2026 года</span>
          </div>
        </div>
      </div>
    </div>
  );
};
