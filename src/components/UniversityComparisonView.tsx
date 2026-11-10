import React from 'react';
import {
  Scale,
  X,
  Plus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MapPin,
  Star,
  ShieldCheck,
  Home,
  Award,
} from 'lucide-react';
import { UNIVERSITIES } from '../data/mockData';
import { University } from '../types';

interface UniversityComparisonViewProps {
  compareIds: string[];
  onRemoveFromCompare: (id: string) => void;
  onOpenDetail: (vuz: University) => void;
  onNavigateTab: (tab: string) => void;
}

export const UniversityComparisonView: React.FC<UniversityComparisonViewProps> = ({
  compareIds,
  onRemoveFromCompare,
  onOpenDetail,
  onNavigateTab,
}) => {
  const comparedVuzes = UNIVERSITIES.filter((v) => compareIds.includes(v.id));

  if (comparedVuzes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Сравнение университетов
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Вы пока не добавили ни одного вуза к сравнению. Перейдите в каталог вузов и нажмите на значок весов на карточке интересующего университета.
        </p>
        <button
          onClick={() => onNavigateTab('catalog')}
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition"
        >
          Перейти в каталог вузов
        </button>
      </div>
    );
  }

  // Determine best stats for highlighting
  const minScore = Math.min(...comparedVuzes.map((v) => v.minBudgetScore));
  const maxPlaces = Math.max(...comparedVuzes.map((v) => v.totalBudgetPlaces));
  const minFee = Math.min(...comparedVuzes.map((v) => v.minAnnualFee));
  const maxRating = Math.max(...comparedVuzes.map((v) => v.studentRating));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            Инструмент сравнения
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Сравнение вузов ({comparedVuzes.length})
          </h1>
        </div>

        {comparedVuzes.length < 4 && (
          <button
            onClick={() => onNavigateTab('catalog')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 bg-brand-50/50 hover:bg-brand-100 dark:bg-brand-950/40 text-xs font-bold transition self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить еще вуз</span>
          </button>
        )}
      </div>

      {/* Comparison Table Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[650px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
          {/* Header Row: Universities */}
          <div className="grid grid-cols-5 p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center">
              Университет
            </div>
            {comparedVuzes.map((v) => (
              <div key={v.id} className="px-3 relative text-center">
                <button
                  onClick={() => onRemoveFromCompare(v.id)}
                  className="absolute -top-2 right-2 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                  title="Удалить из сравнения"
                >
                  <X className="w-4 h-4" />
                </button>
                <div
                  className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-black text-lg mb-2 shadow-sm"
                  style={{ backgroundColor: v.emblemColor || '#2563EB' }}
                >
                  {v.shortName.slice(0, 3)}
                </div>
                <h4
                  onClick={() => onOpenDetail(v)}
                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 cursor-pointer transition line-clamp-1"
                >
                  {v.shortName}
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">{v.city}</div>
              </div>
            ))}
          </div>

          {/* Metric Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Rank */}
            <div className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="font-semibold text-slate-500">Рейтинг в РФ</div>
              {comparedVuzes.map((v) => (
                <div key={v.id} className="px-3 text-center font-bold text-slate-900 dark:text-white">
                  #{v.ratingRank}
                </div>
              ))}
            </div>

            {/* Min Budget Score */}
            <div className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="font-semibold text-slate-500">Мин. проходной балл (бюджет)</div>
              {comparedVuzes.map((v) => {
                const isBest = v.minBudgetScore === minScore;
                return (
                  <div key={v.id} className="px-3 text-center">
                    <span
                      className={`inline-block font-extrabold px-2.5 py-1 rounded-full ${
                        isBest
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      от {v.minBudgetScore}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Budget Places */}
            <div className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="font-semibold text-slate-500">Бюджетных мест</div>
              {comparedVuzes.map((v) => {
                const isBest = v.totalBudgetPlaces === maxPlaces;
                return (
                  <div key={v.id} className="px-3 text-center">
                    <span
                      className={`inline-block font-extrabold px-2.5 py-1 rounded-full ${
                        isBest
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {v.totalBudgetPlaces.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tuition Fee */}
            <div className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="font-semibold text-slate-500">Стоимость обучения (платно)</div>
              {comparedVuzes.map((v) => {
                const isBest = v.minAnnualFee === minFee;
                return (
                  <div key={v.id} className="px-3 text-center">
                    <span
                      className={`inline-block font-bold px-2 py-0.5 rounded-lg ${
                        isBest
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      от {v.minAnnualFee.toLocaleString()} ₽/год
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Military Center */}
            <div className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="font-semibold text-slate-500">Военный центр (ВУЦ)</div>
              {comparedVuzes.map((v) => (
                <div key={v.id} className="px-3 text-center flex justify-center">
                  {v.hasMilitaryDept ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Есть ВУЦ
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <XCircle className="w-4 h-4" /> Нет
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Dormitory */}
            <div className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="font-semibold text-slate-500">Общежитие и цена в месяц</div>
              {comparedVuzes.map((v) => (
                <div key={v.id} className="px-3 text-center text-slate-700 dark:text-slate-300">
                  {v.hasDormitory ? (
                    <div>
                      <span className="font-semibold text-emerald-600">Есть</span>
                      <div className="text-[11px] text-slate-400">от {v.dormitoryInfo.costMonth} ₽/мес</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">Нет</span>
                  )}
                </div>
              ))}
            </div>

            {/* Student Rating */}
            <div className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="font-semibold text-slate-500">Оценка студентов</div>
              {comparedVuzes.map((v) => (
                <div key={v.id} className="px-3 text-center font-bold text-amber-500 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{v.studentRating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
