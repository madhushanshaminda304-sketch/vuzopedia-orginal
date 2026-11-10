import React, { useState } from 'react';
import {
  RotateCcw,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Check,
} from 'lucide-react';
import {
  KLIMOV_PHOTO_QUESTIONS,
  EXTENDED_PROFESSIONS,
  ExtendedProfession,
} from '../data/proforientData';
import { SingleWindowBanner } from './SingleWindowBanner';

interface ProforientKlimovViewProps {
  onOpenMyPlan: () => void;
  onNavigateTab: (tab: string) => void;
  myPlanIds: string[];
  onToggleMyPlan: (prof: ExtendedProfession) => void;
  lang?: 'ru' | 'en';
}

export const ProforientKlimovView: React.FC<ProforientKlimovViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  myPlanIds,
  onToggleMyPlan,
  lang = 'ru',
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(2); // Start at question 3 to match Photo 3!
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: 'A' | 'B' }>({
    0: 'B',
    1: 'B',
    2: 'A',
  });
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = KLIMOV_PHOTO_QUESTIONS[currentIdx] || KLIMOV_PHOTO_QUESTIONS[0];
  const currentChoice = selectedAnswers[currentIdx];

  const handleChoose = (opt: 'A' | 'B') => {
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: opt });
  };

  const handleNext = () => {
    if (currentIdx < KLIMOV_PHOTO_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors animate-fadeIn">
      {/* Top Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
            <button
              onClick={() => onNavigateTab('tests')}
              className="hover:text-white transition"
            >
              {lang === 'en' ? 'Career guidance tests' : 'Тесты профориентации'}
            </button>
            <span>›</span>
            <span className="text-slate-200">
              {lang === 'en' ? "Klimov's DDO Test" : 'ДДО Климова'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {lang === 'en'
              ? "Klimov's Career Guidance Test — DDO"
              : 'Тест профориентации — ДДО Климова'}
          </h1>
        </div>
      </div>

      {/* Main Test Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!isFinished ? (
          /* ==================================================== */
          /* INTERACTIVE PHOTO QUESTION SCREEN (Exact from Photo 3) */
          /* ==================================================== */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {lang === 'en'
                  ? `Question ${currentIdx + 1} of 20`
                  : `${currentIdx + 1} вопрос из 20`}
              </span>
              <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed">
                {lang === 'en' ? currentQ.promptEn : currentQ.promptRu}
              </p>
            </div>

            {/* Two Side-by-Side Photo Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {/* Option A Card */}
              <button
                onClick={() => handleChoose('A')}
                className={`rounded-3xl border-2 overflow-hidden text-left bg-white dark:bg-slate-900 shadow-sm transition transform hover:-translate-y-1 duration-150 flex flex-col justify-between ${
                  currentChoice === 'A'
                    ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={currentQ.optionA.imageUrl}
                      alt="Option A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {lang === 'en' ? currentQ.optionA.textEn : currentQ.optionA.textRu}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                      currentChoice === 'A'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {currentChoice === 'A' ? '✓ Выбрано' : 'Выбрать этот вариант'}
                  </span>
                </div>
              </button>

              {/* Option B Card */}
              <button
                onClick={() => handleChoose('B')}
                className={`rounded-3xl border-2 overflow-hidden text-left bg-white dark:bg-slate-900 shadow-sm transition transform hover:-translate-y-1 duration-150 flex flex-col justify-between ${
                  currentChoice === 'B'
                    ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={currentQ.optionB.imageUrl}
                      alt="Option B"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {lang === 'en' ? currentQ.optionB.textEn : currentQ.optionB.textRu}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                      currentChoice === 'B'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {currentChoice === 'B' ? '✓ Выбрано' : 'Выбрать этот вариант'}
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom Navigation Buttons (Exact from Photo 3: "Далее" and "Назад") */}
            <div className="flex flex-col items-center justify-center gap-3 pt-6">
              <button
                onClick={handleNext}
                className="w-48 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition transform hover:scale-105"
              >
                {lang === 'en' ? 'Next' : 'Далее'}
              </button>

              {currentIdx > 0 && (
                <button
                  onClick={handlePrev}
                  className="w-48 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition"
                >
                  {lang === 'en' ? 'Back' : 'Назад'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* RESULTS VIEW WITH RADAR AND RECOMMENDATIONS          */
          /* ==================================================== */
          <div className="space-y-8 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-center space-y-2">
              <span className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
                🏆
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Diagnostic Result: Sign System & Artistic Image' : 'Результаты теста Климова: Знаковая система и Художественный образ'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                {lang === 'en'
                  ? 'Your profile combines deep analytical precision with aesthetic sensitivity and conceptual thinking.'
                  : 'Ваш психотип гармонично сочетает точность знаковых систем (коды, данные, формулы) с эстетическим восприятием.'}
              </p>
            </div>

            {/* Category breakdown bars */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              {[
                { label: 'Человек — Знаковая система (Код, формулы, аналитика)', score: 92, color: 'bg-blue-600' },
                { label: 'Человек — Художественный образ (Дизайн, медиа, искусство)', score: 85, color: 'bg-purple-600' },
                { label: 'Человек — Техника (Инженерия, приборы, робототехника)', score: 70, color: 'bg-indigo-600' },
                { label: 'Человек — Человек (Лидерство, коммуникация, преподавание)', score: 55, color: 'bg-emerald-600' },
                { label: 'Человек — Природа (Биосистемы, экология, агрономия)', score: 40, color: 'bg-teal-600' },
              ].map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{c.label}</span>
                    <span className="font-bold">{c.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className={`${c.color} h-full rounded-full transition-all duration-500`} style={{ width: `${c.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Careers */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {lang === 'en' ? 'Top Recommended Professions for You:' : 'Рекомендованные профессии для вашего типа:'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXTENDED_PROFESSIONS.slice(0, 4).map((prof) => {
                  const isInPlan = myPlanIds.includes(prof.id);
                  return (
                    <div
                      key={prof.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-sm hover:border-blue-400 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prof.imageUrl}
                          alt={prof.titleRu}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {lang === 'en' ? prof.titleEn : prof.titleRu}
                          </h5>
                          <span className="text-[11px] text-emerald-600 font-bold block">
                            {prof.salaryAvg}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleMyPlan(prof)}
                        className={`p-2 rounded-xl text-xs font-bold transition shrink-0 ${
                          isInPlan ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isInPlan ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Retake Klimov Test' : 'Пересдать тест Климова'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Universal Single Window Blue Banner */}
        <SingleWindowBanner onOpenMyPlan={onOpenMyPlan} lang={lang} />
      </div>
    </div>
  );
};
