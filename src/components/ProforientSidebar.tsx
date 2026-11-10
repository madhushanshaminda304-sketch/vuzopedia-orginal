import React from 'react';
import {
  Search,
  BookOpen,
  SlidersHorizontal,
  FileText,
  HelpCircle,
  TrendingUp,
  Scale,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface ProforientSidebarProps {
  onOpenMyPlan: () => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const ProforientSidebar: React.FC<ProforientSidebarProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  lang = 'ru',
}) => {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Search Input Widget */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={lang === 'en' ? 'Search the site...' : 'Поиск по сайту...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* "My Plan" Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? 'My plan' : 'Мой план'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {lang === 'en'
                ? 'Options, deadlines and steps for admission'
                : 'Варианты, сроки и шаги для поступления'}
            </p>
          </div>
          <span className="text-2xl">📋</span>
        </div>

        <button
          onClick={onOpenMyPlan}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition shadow-sm text-center"
        >
          {lang === 'en' ? 'Open my plan' : 'Открыть мой план'}
        </button>
      </div>

      {/* "Admission" Guide Links Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>{lang === 'en' ? 'Admission' : 'Поступление'}</span>
        </h4>

        <div className="space-y-1 text-xs">
          <button
            onClick={() => onNavigateTab('catalog')}
            className="w-full py-2 px-2.5 rounded-xl text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'en' ? 'Set up conditions' : 'Настроить условия'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('calculator')}
            className="w-full py-2 px-2.5 rounded-xl text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'en' ? 'Which Unified State Exams to take?' : 'Какие ЕГЭ сдавать?'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('fear_map')}
            className="w-full py-2 px-2.5 rounded-xl text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'en' ? 'What documents are needed?' : 'Какие документы нужны?'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('calculator')}
            className="w-full py-2 px-2.5 rounded-xl text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'en' ? 'By subjects and USE scores' : 'По предметам и баллам ЕГЭ'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('specialties')}
            className="w-full py-2 px-2.5 rounded-xl text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'en' ? 'All selection methods' : 'Все способы подбора'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* "Compare Options" Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-600" />
          <span>{lang === 'en' ? 'Compare options' : 'Сравнить варианты'}</span>
        </h4>
        <button
          onClick={() => onNavigateTab('compare')}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center"
        >
          {lang === 'en' ? 'All comparisons' : 'Все сравнения вузов'}
        </button>
      </div>
    </aside>
  );
};
