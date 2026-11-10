import React, { useState } from 'react';
import {
  MapPin,
  RotateCcw,
  Sparkles,
  Check,
  Plus,
  ChevronRight,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';
import {
  EXTENDED_PROFESSIONS,
  ExtendedProfession,
  USE_COMBINATIONS_PREVIEWS,
} from '../data/proforientData';
import { ProforientSidebar } from './ProforientSidebar';
import { SingleWindowBanner } from './SingleWindowBanner';

interface ProforientByEgeViewProps {
  onOpenMyPlan: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenCityModal: () => void;
  selectedCity: string;
  myPlanIds: string[];
  onToggleMyPlan: (prof: ExtendedProfession) => void;
  lang?: 'ru' | 'en';
}

export const ProforientByEgeView: React.FC<ProforientByEgeViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  onOpenCityModal,
  selectedCity,
  myPlanIds,
  onToggleMyPlan,
  lang = 'en',
}) => {
  const [selectedExams, setSelectedExams] = useState<string[]>([
    'math_prof',
    'rus',
    'foreign',
  ]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'professions' | 'universities' | 'specialties'>('professions');

  const USE_SUBJECTS_CARDS = [
    { id: 'math_prof', nameEn: 'MATHEMATICS', nameRu: 'МАТЕМАТИКА', icon: '📐' },
    { id: 'rus', nameEn: 'RUSSIAN LANGUAGE', nameRu: 'РУССКИЙ ЯЗЫК', icon: '📝' },
    { id: 'soc', nameEn: 'SOCIAL SCIENCE', nameRu: 'ОБЩЕСТВОЗНАНИЕ', icon: '🏛️' },
    { id: 'phys', nameEn: 'PHYSICS', nameRu: 'ФИЗИКА', icon: '⚡' },
    { id: 'hist', nameEn: 'STORY / HISTORY', nameRu: 'ИСТОРИЯ', icon: '📜' },
    { id: 'inf', nameEn: 'INFORMATICS', nameRu: 'ИНФОРМАТИКА', icon: '💻' },
    { id: 'bio', nameEn: 'BIOLOGY', nameRu: 'БИОЛОГИЯ', icon: '🌿' },
    { id: 'chem', nameEn: 'CHEMISTRY', nameRu: 'ХИМИЯ', icon: '🧪' },
    { id: 'geo', nameEn: 'GEOGRAPHY', nameRu: 'ГЕОГРАФИЯ', icon: '🌍' },
    { id: 'lit', nameEn: 'LITERATURE', nameRu: 'ЛИТЕРАТУРА', icon: '📖' },
    { id: 'foreign', nameEn: 'FOREIGN LANGUAGES', nameRu: 'ИНОСТРАННЫЕ ЯЗЫКИ', icon: '🌐' },
    { id: 'creative', nameEn: 'INTRODUCTORY / CREATIVE', nameRu: 'ВСТУПИТЕЛЬНЫЕ ИСПЫТАНИЯ', icon: '🎭' },
  ];

  const toggleExam = (id: string) => {
    if (selectedExams.includes(id)) {
      if (selectedExams.length > 2) {
        setSelectedExams(selectedExams.filter((x) => x !== id));
      }
    } else {
      setSelectedExams([...selectedExams, id]);
    }
  };

  // Filter professions by selected exams
  const matchedProfessions = EXTENDED_PROFESSIONS.filter((p) =>
    p.suitableExams.some((e) => selectedExams.includes(e))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors animate-fadeIn">
      {/* Top Hero Banner with dark architecture overlay */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
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
              {lang === 'en' ? 'Choosing a profession based on the Unified State Exam' : 'Подбор профессии по ЕГЭ'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {showResults
              ? lang === 'en'
                ? 'What to study for with math, Russian, and foreign languages: choosing a profession at Russian universities'
                : 'Кем работать с математикой, русским и иностранным языком: подбор профессий в вузах России'
              : lang === 'en'
              ? 'Career selection based on the Unified State Exam: choose a profession based on Unified State Exam subjects'
              : 'Подбор профессии по ЕГЭ: выберите профессию по предметам ЕГЭ'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed mb-6">
            {showResults
              ? lang === 'en'
                ? "Below you'll find a list of professions you can study for if you've passed the Unified State Exam in mathematics, Russian, and foreign languages. You can refine the results using filters. Clicking on a profession will show you the programs, universities, and cities in which it is available."
                : 'Ниже представлен список профессий, которые вы можете освоить с выбранным набором экзаменов. Вы можете настроить фильтры по баллам и стоимости.'
              : lang === 'en'
              ? "This service will help you choose a career based on the combination of Unified State Exam (USE) subjects you take. Simply select your USE subjects and click the button below. This is an experimental, unique tool that will help you choose a career based on the bachelor's and specialist's degree programs that match your USE subjects and that teach a selected career."
              : 'Этот сервис поможет подобрать профессию по комбинации сдаваемых предметов ЕГЭ. Просто выберите ваши предметы и нажмите кнопку. Система покажет подходящие профессии и программы в вузах.'}
          </p>

          {/* Action pills bar */}
          <div className="flex flex-wrap items-center gap-3">
            {showResults && (
              <button
                onClick={() => setShowResults(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Repeat the test' : 'Повторить подбор'}</span>
              </button>
            )}

            <button
              onClick={onOpenCityModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'en' ? `Customize by city (${selectedCity})` : `Настроить по городу (${selectedCity})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          /* ==================================================== */
          /* STEP 1: 12 EXAM SUBJECTS GRID (Photos 2 & 5)         */
          /* ==================================================== */
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'en'
                  ? 'Select your subjects and click "Find me a profession" below.'
                  : 'Выберите ваши предметы и нажмите кнопку «Найти мне профессию» ниже.'}
              </h3>
            </div>

            {/* 12 Subjects Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {USE_SUBJECTS_CARDS.map((subj) => {
                const isSelected = selectedExams.includes(subj.id);
                return (
                  <button
                    key={subj.id}
                    onClick={() => toggleExam(subj.id)}
                    className={`p-6 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-3 group relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-300 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                    <span className="text-3xl transition transform group-hover:scale-110">
                      {subj.icon}
                    </span>
                    <span className="text-xs font-extrabold tracking-wide">
                      {lang === 'en' ? subj.nameEn : subj.nameRu}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Big Action Button */}
            <div className="text-center pt-2">
              <button
                onClick={() => setShowResults(true)}
                className="px-10 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition transform hover:scale-105"
              >
                {lang === 'en' ? 'Find me a profession' : 'Найти мне профессию'}
              </button>
            </div>

            {/* Help / Notice text */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 text-center max-w-3xl mx-auto leading-relaxed">
              {lang === 'en'
                ? "IMPORTANT: Enter all subjects you've taken. The system will automatically select the combinations of universities that contain them. For your convenience, we've provided the popular subject combinations below."
                : 'ВАЖНО: Выберите все сдаваемые вами предметы ЕГЭ. Система автоматически сопоставит их с актуальными вступительными требованиями всех вузов России.'}
            </div>

            {/* 6 Combinations Preview Grid (From Photos 2 & 5) */}
            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Popular Unified State Exam Combinations:' : 'Популярные комбинации ЕГЭ:'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {USE_COMBINATIONS_PREVIEWS.map((combo) => (
                  <div
                    key={combo.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm hover:shadow transition"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                        {lang === 'en' ? combo.titleEn : combo.titleRu}
                      </h5>
                      <ul className="space-y-1 mb-4 text-xs text-slate-600 dark:text-slate-400">
                        {(lang === 'en' ? combo.subjectsEn : combo.subjectsRu).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setShowResults(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition text-center shadow-sm"
                    >
                      {lang === 'en' ? 'Check out the options' : 'Посмотреть варианты'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Informational SEO text */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {lang === 'en'
                  ? 'About the "Choose a Career Based on the Unified State Exam" service from Vuzopedia.ru — Russia'
                  : 'О сервисе «Выбрать профессию по ЕГЭ» от Вузопедии'}
              </h4>
              <p>
                {lang === 'en'
                  ? 'A very useful service for applicants. You need to select the combination of USE subjects above, choose a profession, and see programs with your subjects as entrance exams and see where they are taught.'
                  : 'Сервис связывает результаты ЕГЭ с более чем 1400 направлениями подготовки и специальностями высшего образования РФ.'}
              </p>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* STEP 2: RESULTS VIEW WITH 2-COLUMN CARDS (Photo 9)  */
          /* ==================================================== */
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {/* Combination cards bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
                  <span className="text-[10px] font-bold uppercase text-blue-600 block mb-1">
                    {lang === 'en' ? 'Selected combination' : 'Выбранная комбинация'}
                  </span>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedExams.join(' • ')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      {lang === 'en' ? 'Available Careers' : 'Доступных профессий'}
                    </span>
                    <div className="text-base font-extrabold text-blue-600">{matchedProfessions.length} профессий</div>
                  </div>
                  <button
                    onClick={() => setShowResults(false)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                  >
                    {lang === 'en' ? 'Change exams' : 'Изменить'}
                  </button>
                </div>
              </div>

              {/* Sub-tabs bar: Universities | Programs | Specialties | Professions */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
                <button
                  onClick={() => setSelectedSubTab('professions')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    selectedSubTab === 'professions'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'Professions' : 'Профессии'}
                </button>
                <button
                  onClick={() => onNavigateTab('specialties')}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  {lang === 'en' ? 'Specialties' : 'Специальности'}
                </button>
                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  {lang === 'en' ? 'Universities' : 'Вузы'}
                </button>
              </div>

              {/* 2-Column Profession Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedProfessions.map((prof) => {
                  const isInPlan = myPlanIds.includes(prof.id);
                  return (
                    <div
                      key={prof.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Header with Badges */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={prof.imageUrl}
                            alt={prof.titleRu}
                            className="w-full h-full object-cover transition transform hover:scale-105 duration-300"
                          />
                          {prof.hasBudgetChance && (
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] shadow-sm flex items-center gap-1">
                              <span>👁️</span>
                              <span>{lang === 'en' ? 'Any chance?' : 'Есть шансы?'}</span>
                            </div>
                          )}

                          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate shadow-sm">
                            {prof.vuzCount} {lang === 'en' ? 'UNIVERSITIES' : 'ВУЗОВ'} {prof.ssuzCount > 0 ? `AND ${prof.ssuzCount} COLLEGES` : ''}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug min-h-[44px]">
                            {lang === 'en' ? prof.titleEn : prof.titleRu}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {lang === 'en' ? prof.descriptionEn : prof.descriptionRu}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-400">
                            <span>{prof.sphereRu}</span>
                            <span className="text-emerald-600 font-bold">{prof.salaryAvg}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            onNavigateTab('specialties');
                          }}
                          className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition text-center"
                        >
                          {lang === 'en' ? 'Read more' : 'Подробнее'}
                        </button>

                        <button
                          onClick={() => onToggleMyPlan(prof)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isInPlan
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isInPlan ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{isInPlan ? (lang === 'en' ? 'In plan' : 'В плане') : (lang === 'en' ? 'Add to my plan' : 'Добавить в план')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1 pt-6 text-xs font-bold">
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                  ‹
                </button>
                <button className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  1
                </button>
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                  2
                </button>
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                  3
                </button>
                <span className="px-2 text-slate-400">...</span>
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                  94
                </button>
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                  ›
                </button>
              </div>
            </div>

            {/* Right Sidebar Widget */}
            <ProforientSidebar
              onOpenMyPlan={onOpenMyPlan}
              onNavigateTab={onNavigateTab}
              lang={lang}
            />
          </div>
        )}

        {/* Universal Single Window Blue Banner */}
        <SingleWindowBanner onOpenMyPlan={onOpenMyPlan} lang={lang} />
      </div>
    </div>
  );
};
