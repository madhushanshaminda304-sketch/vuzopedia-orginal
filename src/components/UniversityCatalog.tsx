import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  TrendingUp,
  MapPin,
  Check,
  ChevronDown,
} from 'lucide-react';
import { University } from '../types';
import { UniversityCard } from './UniversityCard';
import { CareerGuidanceHub } from './CareerGuidanceHub';

interface UniversityCatalogProps {
  universities: University[];
  selectedCity: string;
  onOpenCityModal: () => void;
  onOpenDetail: (vuz: University) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  compareList: string[];
  onToggleCompare: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const UniversityCatalog: React.FC<UniversityCatalogProps> = ({
  universities,
  selectedCity,
  onOpenCityModal,
  onOpenDetail,
  favorites,
  onToggleFavorite,
  compareList,
  onToggleCompare,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'score_asc' | 'score_desc' | 'places' | 'fee'>('rank');
  const [onlyState, setOnlyState] = useState(false);
  const [hasMilitary, setHasMilitary] = useState(false);
  const [hasDorm, setHasDorm] = useState(false);
  const [maxScore, setMaxScore] = useState<number>(310);
  const [maxFee, setMaxFee] = useState<number>(800000);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filter logic
  const filteredUniversities = useMemo(() => {
    return universities.filter((v) => {
      // City check
      if (selectedCity !== 'Все города' && v.city !== selectedCity) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          v.shortName.toLowerCase().includes(q) ||
          v.fullName.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.features.some((f) => f.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Checkbox filters
      if (onlyState && !v.isState) return false;
      if (hasMilitary && !v.hasMilitaryDept) return false;
      if (hasDorm && !v.hasDormitory) return false;

      // Score filter: show universities where user's max score could reach minimum budget
      if (v.minBudgetScore > maxScore) return false;

      // Fee filter
      if (v.minAnnualFee > maxFee) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rank') return a.ratingRank - b.ratingRank;
      if (sortBy === 'score_asc') return a.minBudgetScore - b.minBudgetScore;
      if (sortBy === 'score_desc') return b.minBudgetScore - a.minBudgetScore;
      if (sortBy === 'places') return b.totalBudgetPlaces - a.totalBudgetPlaces;
      if (sortBy === 'fee') return a.minAnnualFee - b.minAnnualFee;
      return 0;
    });
  }, [
    universities,
    selectedCity,
    searchTerm,
    onlyState,
    hasMilitary,
    hasDorm,
    maxScore,
    maxFee,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setOnlyState(false);
    setHasMilitary(false);
    setHasDorm(false);
    setMaxScore(310);
    setMaxFee(800000);
    setSortBy('rank');
  };

  const hasActiveFilters =
    searchTerm || onlyState || hasMilitary || hasDorm || maxScore < 310 || maxFee < 800000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Hero Intro */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Каталог вузов России 2026
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
          Полная база аккредитованных университетов, институтов и академий с официальными проходными баллами на бюджет, количеством бюджетных мест, стоимостью обучения и информацией о военной кафедре и общежитиях.
        </p>
      </div>

      {/* Featured Career Guidance Section (Exact 5-Card Carousel from Vuzopedia) */}
      <CareerGuidanceHub
        onNavigateTab={onNavigateTab}
        onOpenUniversity={onOpenDetail}
      />

      {/* Main Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по названию вуза (МГУ, МГТУ Баумана, ВШЭ...)"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* City Pill in bar */}
          <button
            onClick={onOpenCityModal}
            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 transition shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>{selectedCity}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="rank">По рейтингу вузов</option>
              <option value="score_asc">Проходной балл (по возрастанию)</option>
              <option value="score_desc">Проходной балл (по убыванию)</option>
              <option value="places">Больше бюджетных мест</option>
              <option value="fee">Минимальная стоимость</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Фильтры</span>
          </button>
        </div>

        {/* Quick Filter Badges Row */}
        <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={onlyState}
                onChange={(e) => setOnlyState(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Только государственные</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={hasMilitary}
                onChange={(e) => setHasMilitary(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Военный центр (ВУЦ)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={hasDorm}
                onChange={(e) => setHasDorm(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>С общежитием</span>
            </label>

            {/* Score Slider */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 ml-auto">
              <span>Балл до: <strong className="text-brand-600">{maxScore}</strong></span>
              <input
                type="range"
                min="150"
                max="310"
                step="5"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-24 sm:w-32 accent-brand-600"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold px-2 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Найдено вузов:{' '}
          <span className="text-slate-900 dark:text-white font-bold text-base">
            {filteredUniversities.length}
          </span>
        </div>
      </div>

      {/* Grid of Universities */}
      {filteredUniversities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((vuz) => (
            <UniversityCard
              key={vuz.id}
              university={vuz}
              onOpenDetail={onOpenDetail}
              isFavorite={favorites.includes(vuz.id)}
              onToggleFavorite={onToggleFavorite}
              isCompared={compareList.includes(vuz.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            По заданным фильтрам ничего не найдено
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Попробуйте увеличить максимальный балл или снять некоторые ограничения.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}
    </div>
  );
};
