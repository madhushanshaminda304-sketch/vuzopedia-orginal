import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Sparkles, TrendingUp, Layers, Check, ChevronRight } from 'lucide-react';
import { SPECIALTIES, EXAM_SUBJECTS } from '../data/mockData';
import { StudyDegree } from '../types';

interface SpecialtiesCatalogViewProps {
  onSelectSpecialtyForSearch?: (specName: string) => void;
}

export const SpecialtiesCatalogView: React.FC<SpecialtiesCatalogViewProps> = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDegree, setSelectedDegree] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Все сферы' },
    { id: 'it', label: 'IT и разработка' },
    { id: 'medicine', label: 'Медицина' },
    { id: 'engineering', label: 'Инженерия' },
    { id: 'economics', label: 'Экономика' },
    { id: 'humanities', label: 'Юриспруденция' },
    { id: 'creative', label: 'Архитектура' },
  ];

  const filtered = useMemo(() => {
    return SPECIALTIES.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (selectedDegree !== 'all' && s.degree !== selectedDegree) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.popularPositions.some((p) => p.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, selectedCategory, selectedDegree]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          Специальности высшего образования
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Каталог специальностей и направлений 2026
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
          Официальные коды направлений подготовки бакалавриата и специалитета. Узнайте, какие предметы ЕГЭ необходимы для поступления, сколько вузов обучают по данной программе и какие зарплатные ожидания у выпускников.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по коду (09.03.01) или названию (Прикладная математика, Юриспруденция)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}

          {/* Degree Filter */}
          <div className="ml-auto flex items-center gap-2">
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Любой уровень образования</option>
              <option value="bachelor">Бакалавриат (4 года)</option>
              <option value="specialist">Специалитет (5–6 лет)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Specialties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-elevated transition flex flex-col justify-between"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {s.code}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {s.degree === 'specialist' ? 'Специалитет (5–6 лет)' : 'Бакалавриат (4 года)'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed line-clamp-2">
                {s.description}
              </p>

              {/* Required Exams */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Экзамены ЕГЭ:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {s.requiredExams.map((ex) => {
                    const obj = EXAM_SUBJECTS.find((sub) => sub.id === ex);
                    return (
                      <span
                        key={ex}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        {obj ? obj.name : ex}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Positions */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Кем работать:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {s.popularPositions.map((pos, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Средний доход выпускника</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {s.avgSalary}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Вузов в РФ</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {s.vuzCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
