import React, { useState } from 'react';
import {
  Calendar,
  BookMarked,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  Search,
} from 'lucide-react';
import { ADMISSION_CALENDAR, GLOSSARY_TERMS } from '../data/mockData';

export const CalendarAndGlossaryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'glossary'>('calendar');
  const [glossarySearch, setGlossarySearch] = useState('');

  const filteredTerms = GLOSSARY_TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      t.definition.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      (t.abbr && t.abbr.toLowerCase().includes(glossarySearch.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Calendar className="w-4 h-4" />
          Справочник поступающего 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Календарь абитуриента и словарь терминов
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl leading-relaxed">
          Все ключевые даты приёмной кампании 2026 года, дедлайны подачи оригиналов аттестатов, даты публикации приказов и понятные объяснения терминов поступления.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
            activeTab === 'calendar'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Календарь поступления 2026</span>
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
            activeTab === 'glossary'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Словарь терминов поступления</span>
        </button>
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Главное правило 2026 года:</span> Зачисление на бюджет происходит строго при наличии выставленной отметки об оригинале на портале Госуслуг или поданного бумажного оригинала аттестата до 3 августа 12:00 МСК!
            </div>
          </div>

          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8 pt-4">
            {ADMISSION_CALENDAR.map((evt, idx) => (
              <div key={idx} className="relative group">
                {/* Dot Marker */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${
                    evt.isCrucial ? 'bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950' : 'bg-brand-500'
                  }`}
                />

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-elevated transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {evt.date}
                    </span>
                    {evt.isCrucial && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 self-start">
                        Критический дедлайн
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {evt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Glossary Tab */}
      {activeTab === 'glossary' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              placeholder="Поиск термина (БВИ, СНИЛС, проходной балл, целевая квота)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((term, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{term.term}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {term.definition}
                  </p>
                </div>

                {term.example && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 italic border-l-2 border-brand-500">
                    «{term.example}»
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
