import React from 'react';
import {
  Bookmark,
  CheckCircle2,
  Trash2,
  Plus,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { UNIVERSITIES } from '../data/mockData';
import { University } from '../types';

interface ApplicationTrackerViewProps {
  favoriteIds: string[];
  onRemoveFavorite: (id: string) => void;
  onOpenDetail: (vuz: University) => void;
  onNavigateTab: (tab: string) => void;
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  favoriteIds,
  onRemoveFavorite,
  onOpenDetail,
  onNavigateTab,
}) => {
  const selectedVuzes = UNIVERSITIES.filter((v) => favoriteIds.includes(v.id)).slice(0, 5);

  const maxAllowed = 5;
  const slotsRemaining = maxAllowed - selectedVuzes.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Bookmark className="w-4 h-4" />
          Персональный трекер поступления
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Мои приоритеты подачи заявлений (до 5 вузов)
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl leading-relaxed">
          По закону РФ каждый абитуриент может подать заявления максимум в <strong>5 вузов</strong>. Составьте свою идеальную стратегию: добавьте вузы мечты, стабильные варианты и страховку.
        </p>
      </div>

      {/* Safety Index Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-brand-950 text-white mb-8 border border-brand-800/40 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs text-brand-300 font-bold uppercase tracking-wider">
              Заполненность заявки
            </span>
            <div className="text-2xl font-black mt-1">
              {selectedVuzes.length} из {maxAllowed} вузов выбрано
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedVuzes.length >= 3 ? (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                Сбалансированная стратегия
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Info className="w-4 h-4" />
                Рекомендуется выбрать до 5 вузов
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          💡 Совет приемной комиссии: расставляйте вузы по приоритетам: 1–2 вуза мечты с высокими проходными баллами, 2 стабильных вуза и 1 надежный вариант с низким конкурсом для 100% гарантии бюджета.
        </p>
      </div>

      {/* Priorities List */}
      <div className="space-y-4">
        {selectedVuzes.map((v, idx) => (
          <div
            key={v.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex items-center justify-between gap-4 transition hover:border-brand-500/40"
          >
            <div className="flex items-center gap-4">
              {/* Priority Badge */}
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-base flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
                #{idx + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{v.city}</span>
                  <span className="text-xs text-emerald-600 font-semibold">• от {v.minBudgetScore} б. бюджет</span>
                </div>
                <h4
                  onClick={() => onOpenDetail(v)}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 cursor-pointer transition"
                >
                  {v.shortName}
                </h4>
                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{v.fullName}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenDetail(v)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Подробнее
              </button>
              <button
                onClick={() => onRemoveFavorite(v.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Удалить из списка"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty Slots */}
        {Array.from({ length: slotsRemaining }).map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigateTab('catalog')}
            className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 text-center text-xs font-bold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить приоритет #{selectedVuzes.length + i + 1} из каталога</span>
          </button>
        ))}
      </div>
    </div>
  );
};
