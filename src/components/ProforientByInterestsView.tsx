import React, { useState } from 'react';
import {
  MapPin,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  Plus,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  WORK_OBJECTS,
  WORK_ACTIVITIES,
  EXTENDED_PROFESSIONS,
  ExtendedProfession,
} from '../data/proforientData';
import { ProforientSidebar } from './ProforientSidebar';
import { SingleWindowBanner } from './SingleWindowBanner';

interface ProforientByInterestsViewProps {
  onOpenMyPlan: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenCityModal: () => void;
  selectedCity: string;
  myPlanIds: string[];
  onToggleMyPlan: (prof: ExtendedProfession) => void;
  lang?: 'ru' | 'en';
}

export const ProforientByInterestsView: React.FC<ProforientByInterestsViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  onOpenCityModal,
  selectedCity,
  myPlanIds,
  onToggleMyPlan,
  lang = 'en',
}) => {
  const [selectedObject, setSelectedObject] = useState<string>('art');
  const [selectedActivity, setSelectedActivity] = useState<string>('control');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedProfDetail, setSelectedProfDetail] = useState<ExtendedProfession | null>(null);

  const currentObj = WORK_OBJECTS.find((o) => o.id === selectedObject) || WORK_OBJECTS[3];
  const currentAct = WORK_ACTIVITIES.find((a) => a.id === selectedActivity) || WORK_ACTIVITIES[0];

  // Filter professions or fallback to art/management set
  const displayedProfessions = EXTENDED_PROFESSIONS.filter(
    (p) => p.workObjectId === selectedObject || p.activityId === selectedActivity
  ).length > 0
    ? EXTENDED_PROFESSIONS.filter(
        (p) => p.workObjectId === selectedObject || p.activityId === selectedActivity
      )
    : EXTENDED_PROFESSIONS;

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
              {lang === 'en' ? 'Career selection' : 'Подбор профессии'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {showResults
              ? lang === 'en'
                ? `Professions that involve working with ${currentObj.nameEn.toLowerCase()} in the ${currentAct.nameEn.toLowerCase()} sphere`
                : `Профессии в сфере «${currentObj.nameRu.toLowerCase()}» и «${currentAct.nameRu.toLowerCase()}»`
              : lang === 'en'
              ? 'Choose a future in which you will be happy'
              : 'Выберите будущее, в котором вы будете счастливы'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed mb-6">
            {showResults
              ? lang === 'en'
                ? "Below, we've compiled a selection of professions that suit you based on the type and scope of work you selected on the previous page. You can refine your search by city or repeat the search by clicking the button below."
                : 'Ниже мы подобрали список профессий, которые подходят вам по выбранному объекту труда и виду деятельности. Вы можете повторить поиск или уточнить по городу.'
              : lang === 'en'
              ? "Choosing a career is an extremely important task that should be approached with the utmost seriousness. Graduates often struggle to decide on their future profession due to a lack of information and people they can turn to for advice. We created this tool to help prospective students choose the ideal career based on their interests. In the form below, select what you'd like to work with in the future and the type of work that interests you."
              : 'Выбор профессии — один из важнейших шагов в жизни. Мы создали уникальный инструмент, который позволяет найти подходящую специальность на основе того, с кем вы хотите работать и чем именно вам нравится заниматься каждый день.'}
          </p>

          {/* Action pills bar */}
          <div className="flex flex-wrap items-center gap-3">
            {showResults && (
              <button
                onClick={() => setShowResults(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Repeat the test' : 'Повторить тест'}</span>
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

      {/* Main Page Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          /* ==================================================== */
          /* STEP 1: INTERACTIVE SELECTION GRID (Photos 6 & 7)   */
          /* ==================================================== */
          <div className="space-y-8">
            {/* Top Prompt Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧭</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Start with what interests you' : 'Начните с того, что вам по-настоящему интересно'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {lang === 'en'
                      ? 'Find a profession based on your favorite subjects, activities, and interests.'
                      : 'Подберите профессию на основе любимых предметов, деятельности и интересов.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('proforient_subjects')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                <span>{lang === 'en' ? 'Select by subjects' : 'По предметам'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Two Column Grid: Who to work with VS Favorite Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Who or what would you like to work with? */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white text-center">
                  {lang === 'en'
                    ? 'Who or what would you like to work with?'
                    : 'С кем или с чем вы хотели бы работать?'}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {WORK_OBJECTS.map((obj) => {
                    const isSelected = selectedObject === obj.id;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObject(obj.id)}
                        className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 group ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-300 shadow-sm'
                        }`}
                      >
                        <span className="text-3xl transition transform group-hover:scale-110">
                          {obj.icon}
                        </span>
                        <span className="text-xs font-bold tracking-wide">
                          {lang === 'en' ? obj.nameEn : obj.nameRu}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Choose your favorite activity */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white text-center">
                  {lang === 'en' ? 'Choose your favorite activity' : 'Выберите любимый вид деятельности'}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {WORK_ACTIVITIES.map((act) => {
                    const isSelected = selectedActivity === act.id;
                    return (
                      <button
                        key={act.id}
                        onClick={() => setSelectedActivity(act.id)}
                        className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 group ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-300 shadow-sm'
                        }`}
                      >
                        <span className="text-3xl transition transform group-hover:scale-110">
                          {act.icon}
                        </span>
                        <span className="text-xs font-bold tracking-wide">
                          {lang === 'en' ? act.nameEn : act.nameRu}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => setShowResults(true)}
                className="px-10 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/25 transition transform hover:scale-105"
              >
                {lang === 'en' ? 'Find me a profession' : 'Найти мне профессию'}
              </button>
            </div>

            {/* Informational SEO text */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {lang === 'en'
                  ? 'About the "Choose a Profession" service from Vuzopedia.ru'
                  : 'О сервисе «Выбрать профессию» от Вузопедии'}
              </h4>
              <p>
                {lang === 'en'
                  ? 'Choosing a career is a crucial step determining your future. At the time of admission, it is not really about choosing a career, as you still have a couple of years left before you begin your journey in the job market. However, that does not mean you should not think about it.'
                  : 'Выбор будущей специальности определяет вектор развития на годы вперед. Вузопедия сопоставляет объекты труда, психологические типы и реальные образовательные программы вузов РФ.'}
              </p>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* STEP 2: PROFESSION RESULTS GRID & SIDEBAR (Photo 11)*/
          /* ==================================================== */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: 2-column profession cards grid */}
            <div className="flex-1 space-y-6">
              <div className="text-xs text-slate-500">
                {lang === 'en'
                  ? `The following professions were found according to your criteria (${displayedProfessions.length}):`
                  : `По вашим критериям найдено профессий (${displayedProfessions.length}):`}
              </div>

              {/* 2-Column Cards Grid */}
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
                          {/* Yellow "Any chance?" / "Есть шансы?" badge */}
                          {prof.hasBudgetChance && (
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] shadow-sm flex items-center gap-1">
                              <span>👁️</span>
                              <span>{lang === 'en' ? 'Any chance?' : 'Есть шансы?'}</span>
                            </div>
                          )}

                          {/* Universities & Colleges Count Pill */}
                          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate shadow-sm">
                            {prof.vuzCount} {lang === 'en' ? 'UNIVERSITIES' : 'ВУЗОВ'} {prof.ssuzCount > 0 ? `AND ${prof.ssuzCount} COLLEGES` : ''}
                          </div>
                        </div>

                        {/* Card Content */}
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

                      {/* Card Footer Actions */}
                      <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedProfDetail(prof)}
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
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100">
                  2
                </button>
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100">
                  3
                </button>
                <span className="px-2 text-slate-400">...</span>
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100">
                  94
                </button>
                <button className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100">
                  ›
                </button>
              </div>
            </div>

            {/* Right Sidebar Widget (Exact from Photo 11) */}
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

      {/* Detail Modal if "Read more" clicked */}
      {selectedProfDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <img
                src={selectedProfDetail.imageUrl}
                alt={selectedProfDetail.titleRu}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? selectedProfDetail.titleEn : selectedProfDetail.titleRu}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'en' ? selectedProfDetail.descriptionEn : selectedProfDetail.descriptionRu}
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'en' ? 'Average Salary' : 'Средняя зарплата'}:</span>
                <span className="font-bold text-emerald-600">{selectedProfDetail.salaryAvg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'en' ? 'Universities offering major' : 'Вузов обучают'}:</span>
                <span className="font-bold text-blue-600">{selectedProfDetail.vuzCount} вузов</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedProfDetail(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {lang === 'en' ? 'Close' : 'Закрыть'}
              </button>
              <button
                onClick={() => {
                  onToggleMyPlan(selectedProfDetail);
                  setSelectedProfDetail(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                {lang === 'en' ? 'Save to plan' : 'В мой план'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
