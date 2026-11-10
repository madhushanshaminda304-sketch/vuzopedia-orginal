import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Sparkles,
  Send,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  Bot,
} from 'lucide-react';

interface DedVuzopedAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

interface Message {
  sender: 'ded' | 'user';
  text: string;
  actionTab?: string;
  actionLabel?: string;
}

export const DedVuzopedAssistantModal: React.FC<DedVuzopedAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ded',
      text: 'Здравствуй, будущий студент! Я Дед Вузопед — твой персональный наставник по поступлению 2026. Подскажу, как трезво оценить свои баллы, избежать ловушек приемных комиссий и гарантированно занять бюджетное место. О чём хочешь узнать?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickQuestions = [
    {
      q: 'Как рассчитать мои шансы на бюджет по ЕГЭ?',
      reply: 'Используй наш официальный Калькулятор ЕГЭ 2026! Укажи свои баллы и индивидуальные достижения, а система покажет зелёную, жёлтую и красную зоны прохождения по вузам России.',
      tab: 'calculator',
      action: 'Открыть Калькулятор ЕГЭ',
    },
    {
      q: 'Как не потерять отсрочку от армии?',
      reply: 'Поступай ТОЛЬКО на очную форму обучения и обязательно проверь вуз в нашем Чёрном списке! Если у вуза отозвана или приостановлена аккредитация — отсрочки не будет.',
      tab: 'blacklist',
      action: 'Проверить Чёрный список вузов',
    },
    {
      q: 'Как поступить в колледж (СПО) без ЕГЭ?',
      reply: 'В колледжи принимают строго по среднему баллу школьного аттестата за 9 или 11 класс! Экзамены ЕГЭ сдавать не нужно. Рассчитай свой средний балл в нашем каталоге СПО.',
      tab: 'spo',
      action: 'Открыть каталог Колледжей СПО',
    },
    {
      q: 'Где взять целевую квоту с работодателем?',
      reply: 'С 2024 года все целевые договоры публикуются на портале «Работа в России». Росатом, Газпром, РЖД и Ростех предоставляют бесплатные места, повышенную стипендию до 25 000 ₽ и гарантированное рабочее место!',
      tab: 'target',
      action: 'Смотреть целевые предложения',
    },
    {
      q: 'Главный дедлайн подачи оригинала?',
      reply: 'Запомни самое важное: 3 августа в 12:00 МСК приём оригиналов аттестатов на основной бюджет закрывается навсегда! Проверь наш Календарь поступления 2026.',
      tab: 'calendar',
      action: 'Смотреть Календарь 2026',
    },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Answer matching
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = 'Я внимательно изучил твой вопрос. Рекомендую воспользоваться нашими специализированными сервисами: Калькулятором шансов, Картой страхов абитуриента или Каталогом вузов!';
      let tab: string | undefined = 'fear_map';
      let action: string | undefined = 'Открыть Карту страхов';

      if (lower.includes('балл') || lower.includes('егэ') || lower.includes('шанс')) {
        replyText = 'По баллам лучше всего свериться в нашем интерактивном Калькуляторе ЕГЭ. Там учтены все 11 предметов и индивидуальные достижения.';
        tab = 'calculator';
        action = 'Перейти в Калькулятор';
      } else if (lower.includes('арми') || lower.includes('отсрочк') || lower.includes('лиценз') || lower.includes('аккредит')) {
        replyText = 'Внимание! Чтобы не потерять отсрочку от призыва, выбирай вуз с действующей государственной аккредитацией и ВУЦ. Проверь статус в нашем реестре.';
        tab = 'blacklist';
        action = 'Проверить вуз';
      } else if (lower.includes('колледж') || lower.includes('спо') || lower.includes('9 класс') || lower.includes('аттестат')) {
        replyText = 'Поступление в колледжи идет по конкурсу аттестатов. В нашем разделе СПО ты можешь рассчитать средний балл и выбрать колледж с общежитием.';
        tab = 'spo';
        action = 'В каталог колледжей';
      } else if (lower.includes('целев') || lower.includes('договор') || lower.includes('работодател')) {
        replyText = 'Целевая квота — это отличный шанс поступить с меньшим баллом. Предприятия вроде Росатома и РЖД доплачивают стипендии до 25 000 ₽/мес.';
        tab = 'target';
        action = 'Предложения работодателей';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ded',
          text: replyText,
          actionTab: tab,
          actionLabel: action,
        },
      ]);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl h-[85vh] flex flex-col overflow-hidden transition-all">
        {/* Header */}
        <div className="p-4 px-6 bg-gradient-to-r from-amber-600 via-brand-600 to-indigo-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🧙‍♂️
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                <span>Дед Вузопед</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-semibold uppercase">
                  Онлайн-консультант
                </span>
              </h3>
              <p className="text-xs text-amber-100">Искусственный интеллект & приёмная кампания 2026</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'ded' && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center text-sm shrink-0">
                  🧙‍♂️
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                <p>{m.text}</p>

                {m.actionTab && (
                  <button
                    onClick={() => {
                      onNavigateTab(m.actionTab!);
                      onClose();
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>{m.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          {quickQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.q)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap transition"
            >
              {item.q}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            placeholder="Задайте вопрос Деду Вузопеду..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim()}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
