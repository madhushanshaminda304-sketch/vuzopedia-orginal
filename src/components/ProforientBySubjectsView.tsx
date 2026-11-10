import React, { useState } from 'react';
import {
  MapPin,
  RotateCcw,
  Check,
  Plus,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  SCHOOL_SUBJECTS_CHECKBOXES,
  EXTENDED_PROFESSIONS,
  ExtendedProfession,
} from '../data/proforientData';
import { ProforientSidebar } from './ProforientSidebar';
import { SingleWindowBanner } from './SingleWindowBanner';

interface ProforientBySubjectsViewProps {
  onOpenMyPlan: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenCityModal: () => void;
  selectedCity: string;
  myPlanIds: string[];
  onToggleMyPlan: (prof: ExtendedProfession) => void;
  lang?: 'ru' | 'en';
}

export const ProforientBySubjectsView: React.FC<ProforientBySubjectsViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  onOpenCityModal,
  selectedCity,
  myPlanIds,
  onToggleMyPlan,
  lang = 'ru',
}) => {
  const [checkedSubjects, setCheckedSubjects] = useState<string[]>([
    'math',
    'phys',
    'rus_lit',
  ]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [activeFilterPill, setActiveFilterPill] = useState<string>('all');

  const toggleSubject = (id: string) => {
    if (checkedSubjects.includes(id)) {
      if (checkedSubjects.length > 1) {
        setCheckedSubjects(checkedSubjects.filter((x) => x !== id));
      }
    } else {
      setCheckedSubjects([...checkedSubjects, id]);
    }
  };

  const displayedProfessions = EXTENDED_PROFESSIONS;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors animate-fadeIn">
      {/* Top Hero Banner with dark architecture overlay */}
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
              {lang === 'en'
                ? 'Career guidance test by school subjects'
                : 'Тест профориентации по школьным предметам'}
            </span>
            {showResults && (
              <>
                <span>›</span>
                <span className="text-slate-400">
                  {lang === 'en' ? 'Results' : 'Результаты'}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {showResults
              ? lang === 'en'
                ? 'Professions in Russian universities suitable for those who like mathematics, Russian/literature, physics'
                : 'Профессии в вузах России, которые подходят тем, кому нравится математика, русский язык/литература, физика'
              : lang === 'en'
              ? 'Choose a profession based on school subjects'
              : 'Подобрать профессию по школьным предметам'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed mb-6">
            {showResults
              ? lang === 'en'
                ? 'Below you will find professions that may suit you based on the selected subjects. All professions are sorted by combinations. By clicking on a specific subject/combination of subjects, you can see professions specifically for it.'
                : 'Ниже вы найдете профессии, которые могут подойти вам по выбранным предметам. Все профессии отсортированы по комбинациям. При нажатии на конкретный предмет/комбинацию предметов вы сможете посмотреть профессии конкретно по ней.'
              : lang === 'en'
              ? 'A unique tool that will allow you to choose a future profession based on your favorite subjects in school. Any profession contains in its foundation a set of knowledge from subjects that are taught in school.'
              : 'Уникальный инструмент, который позволит вам выбрать будущую профессию на основании ваших любимых предметов в школе. Любая профессия содержит в своем фундаменте набор знаний из школьных предметов.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {showResults && (
              <button
                onClick={() => setShowResults(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Repeat test' : 'Повторить тест'}</span>
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          /* ==================================================== */
          /* STEP 1: 22 CHECKBOXES SELECTION FORM (Photo 8)       */
          /* ==================================================== */
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'en'
                  ? 'Select your favorite subjects in school and we will show which professions may suit you:'
                  : 'Выберите любимые предметы в школе и мы покажем, какие профессии могут вам подойти исходя из предпочтений'}
              </h3>
            </div>

            {/* 2-Column Checkbox Form with exact 22 subjects from Photo 8 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3.5">
                {/* Left Column (12 subjects) */}
                <div className="space-y-3">
                  {SCHOOL_SUBJECTS_CHECKBOXES.left.map((item) => {
                    const isChecked = checkedSubjects.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer group text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubject(item.id)}
                          className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={isChecked ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>
                          {lang === 'en' ? item.nameEn : item.nameRu}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Right Column (11 subjects) */}
                <div className="space-y-3">
                  {SCHOOL_SUBJECTS_CHECKBOXES.right.map((item) => {
                    const isChecked = checkedSubjects.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer group text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubject(item.id)}
                          className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={isChecked ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>
                          {lang === 'en' ? item.nameEn : item.nameRu}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Big Action Button */}
              <div className="text-center pt-8">
                <button
                  onClick={() => setShowResults(true)}
                  className="px-12 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition transform hover:scale-105"
                >
                  {lang === 'en' ? 'Find a profession' : 'Подобрать профессию'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* STEP 2: PROFESSION RESULTS GRID & SIDEBAR (Photo 10)*/
          /* ==================================================== */
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {/* Filter Pills Bar (Photo 10): "Все по выбранным", "Математика", "Русский/литература", "Физика" */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveFilterPill('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    activeFilterPill === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {lang === 'en' ? 'All selected' : 'Все по выбранным'}
                </button>

                <button
                  onClick={() => setActiveFilterPill('math')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    activeFilterPill === 'math'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {lang === 'en' ? 'Mathematics' : 'Математика'}
                </button>

                <button
                  onClick={() => setActiveFilterPill('rus_lit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    activeFilterPill === 'rus_lit'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {lang === 'en' ? 'Russian/literature' : 'Русский/литература'}
                </button>

                <button
                  onClick={() => setActiveFilterPill('phys')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    activeFilterPill === 'phys'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {lang === 'en' ? 'Physics' : 'Физика'}
                </button>
              </div>

              {/* 2-Column Profession Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedProfessions.map((prof) => {
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
