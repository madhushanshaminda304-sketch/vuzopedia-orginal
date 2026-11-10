import React, { useState, useMemo } from 'react';
import { Briefcase, Search, Sparkles, TrendingUp, Cpu, Award } from 'lucide-react';
import { PROFESSIONS } from '../data/mockData';

interface ProfessionsCatalogViewProps {
  onSelectSpecialtyCode?: (code: string) => void;
}

export const ProfessionsCatalogView: React.FC<ProfessionsCatalogViewProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSphere, setSelectedSphere] = useState('all');

  const spheres = [
    { id: 'all', label: 'Все сферы' },
    { id: 'it', label: 'IT и разработка' },
    { id: 'security', label: 'Кибербезопасность' },
    { id: 'medicine', label: 'Медицина' },
    { id: 'finance', label: 'Финансы' },
    { id: 'robotics', label: 'Робототехника' },
  ];

  const filtered = useMemo(() => {
    return PROFESSIONS.filter((p) => {
      if (selectedSphere === 'it' && !p.sphere.includes('Информационные')) return false;
      if (selectedSphere === 'security' && !p.sphere.includes('Кибербезопасность')) return false;
      if (selectedSphere === 'medicine' && !p.sphere.includes('Медицина')) return false;
      if (selectedSphere === 'finance' && !p.sphere.includes('Финансы')) return false;
      if (selectedSphere === 'robotics' && !p.sphere.includes('технологии')) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.sphere.toLowerCase().includes(q) ||
          p.keySkills.some((k) => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [searchTerm, selectedSphere]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Briefcase className="w-4 h-4" />
          Атлас востребованных профессий
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Каталог профессий и карьерных траекторий
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
          Изучите реальные зарплатные уровни для начинающих и опытных специалистов, ключевые навыки и направления высшего образования, которые ведут к карьере мечты.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft mb-8 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск профессии (AI Engineer, Хирург, Финансовый аналитик)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {spheres.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSphere(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedSphere === s.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Professions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prof) => (
          <div
            key={prof.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-elevated transition flex flex-col justify-between"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-500 truncate">{prof.sphere}</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                  {prof.demandLevel} востребованность
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {prof.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {prof.description}
              </p>

              {/* Salary Matrix */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Доходы в месяц:
                </div>
                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Junior</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      {prof.salaryJunior}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Middle</div>
                    <div className="font-bold text-brand-600 dark:text-brand-400">
                      {prof.salaryMiddle}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Senior</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {prof.salarySenior}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ключевые навыки:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prof.keySkills.map((sk, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Education */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 font-medium">Где учиться:</div>
              <div className="space-y-1">
                {prof.recommendedSpecialties.map((spec, i) => (
                  <div
                    key={i}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 line-clamp-1"
                  >
                    • {spec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
