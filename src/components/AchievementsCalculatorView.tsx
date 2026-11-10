import React, { useState, useMemo } from 'react';
import {
  Award,
  Medal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  School,
  FileCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { INDIVIDUAL_ACHIEVEMENTS } from '../data/extendedData';
import { SingleWindowBanner } from './SingleWindowBanner';

interface AchievementsCalculatorViewProps {
  onOpenMyPlan?: () => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const AchievementsCalculatorView: React.FC<AchievementsCalculatorViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'ach-gold-medal',
    'ach-gto-gold',
  ]);

  const toggleAchievement = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Universities comparison data
  const targetVuzes = [
    { key: 'bmstu', name: 'МГТУ им. Н.Э. Баумана', logoBg: 'bg-blue-600' },
    { key: 'mgu', name: 'МГУ им. М.В. Ломоносова', logoBg: 'bg-red-700' },
    { key: 'hse', name: 'НИУ ВШЭ', logoBg: 'bg-indigo-600' },
    { key: 'mephi', name: 'НИЯУ МИФИ', logoBg: 'bg-emerald-600' },
    { key: 'spbu', name: 'СПбГУ', logoBg: 'bg-amber-600' },
  ];

  // Calculate total points per university capped at statutory maximum 10
  const vuzPoints = useMemo(() => {
    const scores: Record<string, number> = {};
    targetVuzes.forEach((vuz) => {
      let total = 0;
      selectedIds.forEach((id) => {
        const ach = INDIVIDUAL_ACHIEVEMENTS.find((a) => a.id === id);
        if (ach && ach.universityPoints[vuz.key] !== undefined) {
          total += ach.universityPoints[vuz.key];
        }
      });
      scores[vuz.key] = Math.min(10, total);
    });
    return scores;
  }, [selectedIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider">
            <Medal className="w-4 h-4 text-amber-300" />
            <span>Приёмная кампания 2026: Дополнительные баллы</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Калькулятор индивидуальных достижений к ЕГЭ
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Каждый университет России начисляет дополнительные баллы за золотую медаль, знаки ГТО, волонтерство и сочинение (в сумме до +10 баллов сверх 300 баллов за ЕГЭ). Отметьте ваши достижения и узнайте точную прибавку к вашему рейтингу!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Checklist of Achievements */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Отметьте ваши достижения ({selectedIds.length} выбрано)
              </h2>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Сбросить всё
            </button>
          </div>

          <div className="space-y-3">
            {INDIVIDUAL_ACHIEVEMENTS.map((ach) => {
              const isSelected = selectedIds.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  onClick={() => toggleAchievement(ach.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {ach.title}
                      </h3>
                      <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 shrink-0 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60">
                        до +{ach.maxLegalPoints} б.
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {ach.description}
                    </p>

                    <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <FileCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{ach.verificationDoc}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Real-time University Score Matrix */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ваша прибавка по вузам
                </h3>
                <p className="text-xs text-slate-500">Максимум по закону РФ: 10 баллов</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                2026/2027
              </span>
            </div>

            <div className="space-y-3">
              {targetVuzes.map((vuz) => {
                const points = vuzPoints[vuz.key] || 0;
                const isMax = points >= 10;
                return (
                  <div
                    key={vuz.key}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${vuz.logoBg} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}>
                        {vuz.name.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {vuz.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isMax ? 'Достигнут максимальный лимит' : `Осталось до лимита: ${10 - points} б.`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xl font-black ${points > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                        +{points}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">баллов</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Statutory Federal Rule Note */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Федеральный закон № 273-ФЗ</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                Даже если сумма ваших индивидуальных достижений превышает 10 баллов (например, золотая медаль + ГТО + волонтерство = 16), приёмная комиссия вуза начислит строго максимум <strong>10 баллов</strong> к сумме ЕГЭ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Single Window Banner */}
      <SingleWindowBanner onOpenMyPlan={onOpenMyPlan} />
    </div>
  );
};
