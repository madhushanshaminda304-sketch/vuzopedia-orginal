import React from 'react';
import {
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Building,
  Home,
  Scale,
  Bookmark,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { University } from '../types';

interface UniversityCardProps {
  university: University;
  onOpenDetail: (vuz: University) => void;
  isFavorite: boolean;
  onToggleFavorite: (vuzId: string) => void;
  isCompared: boolean;
  onToggleCompare: (vuzId: string) => void;
}

export const UniversityCard: React.FC<UniversityCardProps> = ({
  university: v,
  onOpenDetail,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft hover:shadow-elevated transition duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Emblem / Logo */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm shrink-0"
              style={{ backgroundColor: v.emblemColor || '#2563EB' }}
            >
              {v.shortName.slice(0, 3)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  #{v.ratingRank} в РФ
                </span>
                {v.isState && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Гос.
                  </span>
                )}
              </div>
              <h3
                onClick={() => onOpenDetail(v)}
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 cursor-pointer transition line-clamp-2 mt-0.5 leading-snug"
              >
                {v.shortName}
              </h3>
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleCompare(v.id)}
              className={`p-2 rounded-xl transition ${
                isCompared
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isCompared ? 'Удалить из сравнения' : 'Добавить к сравнению'}
            >
              <Scale className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(v.id)}
              className={`p-2 rounded-xl transition ${
                isFavorite
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Удалить из приоритетов' : 'В мои приоритеты'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location & Rating row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {v.city} {v.metro && `• м. ${v.metro}`}
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {v.studentRating} ({v.reviewsCount})
          </span>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          {v.hasMilitaryDept && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-brand-600" />
              Военный центр (ВУЦ)
            </span>
          )}
          {v.hasDormitory && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
              <Home className="w-3 h-3 text-brand-600" />
              Общежитие
            </span>
          )}
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            {v.programsCount} программ
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <div className="text-[11px] text-slate-400">Мин. балл (бюджет)</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              от {v.minBudgetScore}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Бюджетных мест</div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100">
              {v.totalBudgetPlaces.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Мин. балл (платно)</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              от {v.minPaidScore}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Стоимость от</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {v.minAnnualFee.toLocaleString()} ₽/год
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-2">
        <button
          onClick={() => onOpenDetail(v)}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/60 flex items-center justify-center gap-1.5 transition"
        >
          <span>Смотреть программы и проходные баллы</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
