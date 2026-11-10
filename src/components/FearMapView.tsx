import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { FEAR_MAP_ITEMS } from '../data/mockData';

interface FearMapViewProps {
  onNavigateTab: (tab: string) => void;
}

export const FearMapView: React.FC<FearMapViewProps> = ({ onNavigateTab }) => {
  const [selectedFearId, setSelectedFearId] = useState<string>(FEAR_MAP_ITEMS[0].id);

  const activeFear = FEAR_MAP_ITEMS.find((f) => f.id === selectedFearId) || FEAR_MAP_ITEMS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          Гид по поступлению и антистресс
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          С чего начать: Карта страхов абитуриента
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Спокойные, проверенные юристами и приемными комиссиями инструкции для любых непредвиденных ситуаций во время приёмной кампании 2026.
        </p>
      </div>

      {/* 5-Step Action Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft mb-10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          Пошаговый план действий перед стартом приема
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '1',
              title: 'Проверка баллов',
              desc: 'Сравните баллы с минимальными порогами вузов Рособрнадзора',
              action: () => onNavigateTab('calculator'),
              actionLabel: 'В калькулятор',
            },
            {
              step: '2',
              title: 'Подбор 5 вузов',
              desc: 'Распределите варианты: 2 мечты, 2 стабильных, 1 надежная страховка',
              action: () => onNavigateTab('tracker'),
              actionLabel: 'Мои приоритеты',
            },
            {
              step: '3',
              title: 'Проверка вуза',
              desc: 'Убедитесь в наличии действующей аккредитации и лицензии',
              action: () => onNavigateTab('blacklist'),
              actionLabel: 'Черный список',
            },
            {
              step: '4',
              title: 'Подача через Госуслуги',
              desc: 'Подайте заявления онлайн без очередей с 20 июня до 25 июля',
              action: () => onNavigateTab('calendar'),
              actionLabel: 'Календарь',
            },
            {
              step: '5',
              title: 'Оригинал до 3 августа',
              desc: 'Поставьте электронную отметку об оригинале аттестата до 12:00 МСК',
              action: () => onNavigateTab('calendar'),
              actionLabel: 'Сроки дедлайна',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center mb-2.5">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {item.desc}
                </p>
              </div>
              <button
                onClick={item.action}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start"
              >
                <span>{item.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Fear Map Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Fear List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Выберите волнующий вопрос
          </h3>

          {FEAR_MAP_ITEMS.map((item) => {
            const isSelected = item.id === selectedFearId;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedFearId(item.id)}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/60 dark:border-brand-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isSelected ? 'text-brand-600' : 'text-amber-500'
                  }`}
                />
                <div>
                  <h4
                    className={`text-sm font-bold leading-snug ${
                      isSelected
                        ? 'text-brand-900 dark:text-brand-200'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.fear}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Remedy & Reality Check */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
              Разбор ситуации
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {activeFear.fear}
            </h3>
          </div>

          {/* Reality Check */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
              Реальность и факты:
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeFear.realityCheck}
            </p>
          </div>

          {/* Step by step solution */}
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block mb-3">
              Пошаговый план решения:
            </span>
            <div className="space-y-2.5">
              {activeFear.stepByStepSolution.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Paths */}
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
              Запасные надежные траектории:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeFear.alternativePaths.map((alt, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  {alt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
