import React, { useState } from 'react';
import {
  RotateCcw,
  ArrowRight,
  Scale,
  Plus,
  Check,
  Eye,
  Award,
} from 'lucide-react';
import {
  ONE_OF_TWO_MATCHUPS,
  EXTENDED_PROFESSIONS,
  ExtendedProfession,
} from '../data/proforientData';
import { SingleWindowBanner } from './SingleWindowBanner';

interface ProforientOneOfTwoViewProps {
  onOpenMyPlan: () => void;
  onNavigateTab: (tab: string) => void;
  myPlanIds: string[];
  onToggleMyPlan: (prof: ExtendedProfession) => void;
  lang?: 'ru' | 'en';
}

export const ProforientOneOfTwoView: React.FC<ProforientOneOfTwoViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  myPlanIds,
  onToggleMyPlan,
  lang = 'ru',
}) => {
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [selectedSide, setSelectedSide] = useState<'A' | 'B'>('B'); // Default to B ('Фрезеровщик') to match Photo 4!
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const matchup = ONE_OF_TWO_MATCHUPS[currentRound] || ONE_OF_TWO_MATCHUPS[0];

  const handleNext = () => {
    if (currentRound < ONE_OF_TWO_MATCHUPS.length - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedSide('A');
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentRound(0);
    setSelectedSide('A');
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors animate-fadeIn">
      {/* Top Banner with architectural overlay */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <button
              onClick={() => onNavigateTab('tests')}
              className="hover:text-white transition"
            >
              {lang === 'en' ? 'Career guidance tests' : 'Тесты профориентации'}
            </button>
            <span>›</span>
            <span className="text-slate-200">
              {lang === 'en' ? 'Test "One of two"' : 'Тест профориентации «Одна из двух»'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {lang === 'en' ? 'Career Guidance Test "One of two"' : 'Тест профориентации «Одна из двух»'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            {lang === 'en'
              ? 'The simplest career guidance test from Vuzopedia. Choose one of two professions until you reach the end of the test or consider that the profession chosen at a certain stage is yours. At each step, you can familiarize yourself with the profession.'
              : 'Самый простой из тестов профориентации от Вузопедии. Выбирайте одну из двух профессий пока не достигнете конца теста или не посчитаете, что выбранная на определенном этапе профессия ваша. На каждом шаге вы сможете ознакомиться с профессией, перейдя на ее страницу или с текстовым описанием прямо в тесте.'}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isFinished ? (
          /* ==================================================== */
          /* BINARY PROFESSION BATTLE (Exact from Photo 4)        */
          /* ==================================================== */
          <div className="space-y-6">
            {/* Instruction paragraph */}
            <div className="max-w-4xl mx-auto text-center text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'en'
                ? 'Which of the two professions do you like more? Choose the most attractive of the two, even if you like or dislike both. The most attractive one. During the test, you can go to profession pages and study them in detail. We will save your progress and you can continue from where you left off.'
                : 'Какая из двух профессий вам нравится больше? Выбирайте наиболее привлекательную из двух, даже если обе не нравятся или нравятся. Наиболее привлекательную. Во время прохождения теста вы можете переходить на страницы профессий и изучать их подробнее. Мы сохраним ваш прогресс и вы сможете продолжить с момента выхода.'}
            </div>

            {/* Two Side-by-Side Cards Grid (Matching Photo 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4">
              {/* Profession A Card */}
              <div
                onClick={() => setSelectedSide('A')}
                className={`rounded-3xl border-4 overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition cursor-pointer flex flex-col justify-between ${
                  selectedSide === 'A'
                    ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-xl'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Action Bar: Подробнее, Сравнить, Добавить в мой план */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab('specialties');
                      }}
                      className="px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {lang === 'en' ? 'More details' : 'Подробнее'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab('compare');
                      }}
                      className="px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {lang === 'en' ? 'Compare' : 'Сравнить'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const p = EXTENDED_PROFESSIONS.find((x) => x.id === matchup.profA.id) || EXTENDED_PROFESSIONS[0];
                        onToggleMyPlan(p);
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1"
                    >
                      <span>+=</span>
                      <span>{lang === 'en' ? 'Add to my plan' : 'Добавить в мой план'}</span>
                    </button>
                  </div>

                  {/* Image */}
                  <div className="h-64 w-full overflow-hidden bg-slate-100">
                    <img
                      src={matchup.profA.imageUrl}
                      alt={matchup.profA.titleRu}
                      className="w-full h-full object-cover transition transform hover:scale-105 duration-300"
                    />
                  </div>

                  {/* Title */}
                  <div className="p-6 text-center min-h-[90px] flex items-center justify-center">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {lang === 'en' ? matchup.profA.titleEn : matchup.profA.titleRu}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Profession B Card (Active selection in Photo 4 with bright blue border!) */}
              <div
                onClick={() => setSelectedSide('B')}
                className={`rounded-3xl border-4 overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition cursor-pointer flex flex-col justify-between ${
                  selectedSide === 'B'
                    ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-xl'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Action Bar */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab('specialties');
                      }}
                      className="px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {lang === 'en' ? 'More details' : 'Подробнее'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab('compare');
                      }}
                      className="px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {lang === 'en' ? 'Compare' : 'Сравнить'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const p = EXTENDED_PROFESSIONS.find((x) => x.id === matchup.profB.id) || EXTENDED_PROFESSIONS[1];
                        onToggleMyPlan(p);
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1"
                    >
                      <span>+=</span>
                      <span>{lang === 'en' ? 'Add to my plan' : 'Добавить в мой план'}</span>
                    </button>
                  </div>

                  {/* Image */}
                  <div className="h-64 w-full overflow-hidden bg-slate-100">
                    <img
                      src={matchup.profB.imageUrl}
                      alt={matchup.profB.titleRu}
                      className="w-full h-full object-cover transition transform hover:scale-105 duration-300"
                    />
                  </div>

                  {/* Title */}
                  <div className="p-6 text-center min-h-[90px] flex items-center justify-center">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {lang === 'en' ? matchup.profB.titleEn : matchup.profB.titleRu}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation Buttons (Photo 4) */}
            <div className="text-center pt-6 space-y-3">
              <button
                onClick={handleNext}
                className="px-14 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition transform hover:scale-105"
              >
                {lang === 'en' ? 'Next' : 'Далее'}
              </button>

              <div>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
                >
                  {lang === 'en' ? 'Start from the beginning' : 'Начать сначала'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* BINARY VICTORY DESTINY PROFILE                       */
          /* ==================================================== */
          <div className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
              ✨
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Your Calling: High-Precision Technology' : 'Ваше призвание: Высокоточные технологии и инженерия'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              {lang === 'en'
                ? 'Through progressive pairwise choices, you identified strong vocational dedication to physical engineering, machinery, and tangible construction.'
                : 'В ходе попарного взвешивания ваши выборы четко указали на интерес к конструкторской и производственной инженерии.'}
            </p>

            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-left space-y-2">
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                {lang === 'en' ? 'Recommended Study Programs:' : 'Рекомендованные направления обучения:'}
              </div>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-semibold">
                <li>• 15.03.01 Машиностроение (МГТУ им. Н.Э. Баумана, СПбПУ)</li>
                <li>• 24.05.01 Проектирование, производство ракет и РКК (МАИ)</li>
                <li>• 15.03.05 Конструкторско-технологическое обеспечение машиностроения</li>
              </ul>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'en' ? 'Start again' : 'Пройти снова'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('catalog')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                {lang === 'en' ? 'Explore Russian Universities' : 'Смотреть вузы'}
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
