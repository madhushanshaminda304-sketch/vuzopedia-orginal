import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  TrendingUp,
  MapPin,
  Check,
  ChevronDown,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';
import { FULL_PROGRAMS } from '../data/extendedData';
import { FullProgramItem } from '../types';
import { SingleWindowBanner } from './SingleWindowBanner';

interface ProgramsCatalogViewProps {
  onOpenMyPlan?: () => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const ProgramsCatalogView: React.FC<ProgramsCatalogViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  lang = 'ru',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState<'all' | 'bachelor' | 'specialist'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('Все');
  const [maxScore, setMaxScore] = useState<number>(400);
  const [maxFee, setMaxFee] = useState<number>(900000);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((x) => x !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const filteredPrograms = useMemo(() => {
    return FULL_PROGRAMS.filter((prog) => {
      if (selectedDegree !== 'all' && prog.degree !== selectedDegree) return false;
      if (selectedCity !== 'Все' && prog.city !== selectedCity) return false;
      if (prog.minBudgetScore > maxScore) return false;
      if (prog.annualFee > maxFee) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          prog.name.toLowerCase().includes(q) ||
          prog.code.toLowerCase().includes(q) ||
          prog.universityShort.toLowerCase().includes(q) ||
          prog.faculty.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedDegree, selectedCity, maxScore, maxFee, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Каталог образовательных программ ВО</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Программы высшего образования России 2026
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm leading-relaxed">
          Полная база направлений бакалавриата и специалитета с официальными проходными баллами на бюджет, планом набора, стоимостью обучения и карьерными перспективами выпускников.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по названию, коду (09.03.04), вузу или факультету..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Degree Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">Все ступени образования</option>
              <option value="bachelor">Бакалавриат (4 года)</option>
              <option value="specialist">Специалитет (5-6 лет)</option>
            </select>
          </div>

          {/* City Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="Все">Все города</option>
              <option value="Москва">Москва</option>
              <option value="Санкт-Петербург">Санкт-Петербург</option>
            </select>
          </div>
        </div>

        {/* Sliders row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span>Макс. проходной балл на бюджет:</span>
              <span className="text-blue-600">{maxScore}</span>
            </div>
            <input
              type="range"
              min={180}
              max={400}
              step={5}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span>Макс. стоимость обучения в год:</span>
              <span className="text-blue-600">{maxFee.toLocaleString('ru-RU')} ₽</span>
            </div>
            <input
              type="range"
              min={200000}
              max={900000}
              step={20000}
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 mb-4 flex items-center justify-between">
        <span>Найдено программ: <strong className="text-slate-900 dark:text-white">{filteredPrograms.length}</strong></span>
        <span>Приёмная кампания 2026</span>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPrograms.map((prog) => {
          const isSaved = savedIds.includes(prog.id);
          return (
            <div
              key={prog.id}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Code & University Header */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                    {prog.code}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>{prog.universityShort} ({prog.city})</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                  {prog.name}
                </h3>

                <p className="text-xs text-slate-500 mb-4 font-medium">
                  {prog.faculty} • {prog.degree === 'bachelor' ? 'Бакалавриат' : 'Специалитет'} ({prog.durationYears} года)
                </p>

                {/* Score & Fees Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Балл бюджет</span>
                    <span className="text-sm font-extrabold text-blue-600">{prog.minBudgetScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Мест бюджет</span>
                    <span className="text-sm font-extrabold text-emerald-600">{prog.budgetPlaces}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Стоимость/год</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {(prog.annualFee / 1000).toFixed(0)} тыс ₽
                    </span>
                  </div>
                </div>

                {/* Career Prospects */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Кем работать (доход {prog.averageGraduateSalary}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.careerProspects.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => onNavigateTab('calculator')}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                >
                  Оценить шансы в калькуляторе
                </button>

                <button
                  onClick={() => toggleSave(prog.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'В плане' : 'В мой план'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Window Banner */}
      <SingleWindowBanner onOpenMyPlan={() => onOpenMyPlan?.()} lang={lang} />
    </div>
  );
};
