import React, { useState, useMemo } from 'react';
import { Search, X, Building2, BookOpen, Briefcase, ChevronRight } from 'lucide-react';
import { UNIVERSITIES, SPECIALTIES, PROFESSIONS } from '../data/mockData';
import { University, Specialty, Profession } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUniversity: (vuz: University) => void;
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUniversity,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return { vuzes: [], specs: [], profs: [] };
    const q = query.toLowerCase().trim();

    const vuzes = UNIVERSITIES.filter(
      (v) =>
        v.shortName.toLowerCase().includes(q) ||
        v.fullName.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q)
    ).slice(0, 5);

    const specs = SPECIALTIES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q)
    ).slice(0, 4);

    const profs = PROFESSIONS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sphere.toLowerCase().includes(q) ||
        p.keySkills.some((k) => k.toLowerCase().includes(q))
    ).slice(0, 4);

    return { vuzes, specs, profs };
  }, [query]);

  if (!isOpen) return null;

  const totalResults = filtered.vuzes.length + filtered.specs.length + filtered.profs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по вузам (МГУ, Бауманка), специальностям (09.03.01) или профессиям..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-4">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">
                Начните вводить название вуза, код направления или профессию
              </p>
              <p className="text-xs">
                Например: <span className="text-brand-600 dark:text-brand-400">МГТУ Баумана</span>,{' '}
                <span className="text-brand-600 dark:text-brand-400">09.03.01</span>,{' '}
                <span className="text-brand-600 dark:text-brand-400">Data Scientist</span>
              </p>
            </div>
          )}

          {query.trim() && totalResults === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Ничего не найдено по запросу «{query}». Попробуйте изменить формулировку.
            </div>
          )}

          {/* Universities Section */}
          {filtered.vuzes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                Вузы
              </div>
              <div className="space-y-1">
                {filtered.vuzes.map((vuz) => (
                  <button
                    key={vuz.id}
                    onClick={() => {
                      onSelectUniversity(vuz);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                        {vuz.shortName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {vuz.city} • от {vuz.minBudgetScore} баллов бюджет • {vuz.totalBudgetPlaces} мест
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specialties Section */}
          {filtered.specs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Специальности
              </div>
              <div className="space-y-1">
                {filtered.specs.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      onNavigateTab('specialties');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 mr-2">
                          {spec.code}
                        </span>
                        {spec.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {spec.categoryLabel} • Ср. зарплата: {spec.avgSalary}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Professions Section */}
          {filtered.profs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                Профессии
              </div>
              <div className="space-y-1">
                {filtered.profs.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      onNavigateTab('professions');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                        {prof.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {prof.sphere} • Доход: {prof.salaryMiddle}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
