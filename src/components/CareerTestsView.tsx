import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { KLIMOV_QUESTIONS } from '../data/mockData';
import { CareerGuidanceHub } from './CareerGuidanceHub';

interface CareerTestsViewProps {
  onNavigateTab: (tab: string) => void;
}

export const CareerTestsView: React.FC<CareerTestsViewProps> = ({ onNavigateTab }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: 'A' | 'B' }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectOption = (option: 'A' | 'B') => {
    const newAnswers = { ...answers, [currentQuestionIndex]: option };
    setAnswers(newAnswers);

    if (currentQuestionIndex < KLIMOV_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  };

  // Calculate scores
  const scoreCategories: { [key: string]: number } = {
    nature: 0,
    tech: 0,
    human: 0,
    sign: 0,
    art: 0,
  };

  Object.entries(answers).forEach(([qIdxStr, option]) => {
    const q = KLIMOV_QUESTIONS[Number(qIdxStr)];
    if (!q) return;
    const cat = option === 'A' ? q.optionA.category : q.optionB.category;
    scoreCategories[cat] = (scoreCategories[cat] || 0) + 1;
  });

  const categoryLabels = {
    sign: {
      title: 'Человек — Знаковая система',
      desc: 'Вам легко даются абстрактные структуры, математика, языки программирования, базы данных и аналитика.',
      recommended: ['01.03.02 Прикладная математика и информатика', '09.03.01 Информатика и ВТ', '38.03.01 Экономика'],
      color: 'bg-brand-500',
    },
    tech: {
      title: 'Человек — Техника',
      desc: 'Высокая склонность к инженерии, конструированию оборудования, робототехнике и физическим системам.',
      recommended: ['15.03.06 Мехатроника и робототехника', 'МГТУ им. Баумана', 'НИЯУ МИФИ'],
      color: 'bg-indigo-500',
    },
    human: {
      title: 'Человек — Человек',
      desc: 'Вы лидер, эмпат и организатор. Успешны в работе с коллективами, медицине, праве и обучении.',
      recommended: ['31.05.01 Лечебное дело', '40.03.01 Юриспруденция', 'Сеченовский Университет'],
      color: 'bg-emerald-500',
    },
    art: {
      title: 'Человек — Художественный образ',
      desc: 'Творческое мышление, чувство композиции, цвета и визуальной гармонии.',
      recommended: ['07.03.01 Архитектура', 'МАРХИ', 'Медиакоммуникации и дизайн'],
      color: 'bg-purple-500',
    },
    nature: {
      title: 'Человек — Природа',
      desc: 'Интерес к биологическим процессам, экосистемам, ветеринарии, химии и фармацевтике.',
      recommended: ['Биотехнологии', 'Биоинженерия', 'Экология и природопользование'],
      color: 'bg-teal-500',
    },
  };

  // Sort categories by score
  const sortedCategories = Object.entries(scoreCategories).sort((a, b) => b[1] - a[1]);
  const leadingCategoryKey = sortedCategories[0]?.[0] || 'sign';
  const leadingCategory = categoryLabels[leadingCategoryKey as keyof typeof categoryLabels];

  const currentQ = KLIMOV_QUESTIONS[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / KLIMOV_QUESTIONS.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* 5-Card Career Guidance Carousel (Matches user photo 1:1) */}
      <CareerGuidanceHub onNavigateTab={onNavigateTab} />

      <div className="my-12 border-t border-slate-200 dark:border-slate-800" />

      {/* In-depth Klimov Questionnaire Section */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4" />
            Профориентационный тест
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Тест Климова: Выбор профессиональной сферы
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Классическая академическая методика определения склонностей к пяти ключевым типам профессий. Отвечайте честно, выбирая то, что искренне привлекательнее.
          </p>
        </div>

      {!isCompleted ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-soft">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Вопрос {currentQuestionIndex + 1} из {KLIMOV_QUESTIONS.length}</span>
              <span>{progressPercent}% пройдено</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="text-center my-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {currentQ.question}
            </h3>
          </div>

          {/* 2 Options Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => handleSelectOption('A')}
              className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-brand-600 dark:hover:border-brand-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-50/50 dark:hover:bg-brand-950/40 text-left transition transform hover:-translate-y-1 duration-150 flex flex-col justify-between group"
            >
              <div>
                <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-extrabold flex items-center justify-center text-sm mb-3">
                  А
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition leading-snug">
                  {currentQ.optionA.text}
                </p>
              </div>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Выбрать этот вариант <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => handleSelectOption('B')}
              className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-brand-600 dark:hover:border-brand-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-50/50 dark:hover:bg-brand-950/40 text-left transition transform hover:-translate-y-1 duration-150 flex flex-col justify-between group"
            >
              <div>
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-sm mb-3">
                  Б
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition leading-snug">
                  {currentQ.optionB.text}
                </p>
              </div>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Выбрать этот вариант <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-soft space-y-8 animate-fadeIn">
          {/* Top Result Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-700 text-white text-center">
            <Sparkles className="w-10 h-10 text-amber-300 mx-auto mb-2" />
            <span className="text-xs uppercase tracking-wider text-brand-200 font-bold">
              Ваш ведущий профессиональный тип
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 mb-2">
              {leadingCategory.title}
            </h2>
            <p className="text-sm text-brand-100 max-w-lg mx-auto leading-relaxed">
              {leadingCategory.desc}
            </p>
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Распределение баллов по всем типам
            </h4>
            {sortedCategories.map(([catKey, score]) => {
              const meta = categoryLabels[catKey as keyof typeof categoryLabels];
              const pct = Math.round((score / KLIMOV_QUESTIONS.length) * 100);

              return (
                <div key={catKey} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    <span>{meta.title}</span>
                    <span className="font-mono text-brand-600 dark:text-brand-400">{score} б. ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Recommendations */}
          <div className="p-6 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800">
            <h4 className="text-base font-bold text-brand-950 dark:text-brand-200 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-600" />
              Рекомендуемые специальности для поступления
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {leadingCategory.recommended.map((rec, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300"
                >
                  {rec}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('calculator')}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
              >
                Рассчитать шансы в калькуляторе ЕГЭ
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Пройти тест заново
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
