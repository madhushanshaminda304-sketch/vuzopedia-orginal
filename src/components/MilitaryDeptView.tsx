import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Award,
  CheckCircle2,
  Activity,
  Users,
  Search,
} from 'lucide-react';
import { MILITARY_CENTERS } from '../data/extendedData';
import { SingleWindowBanner } from './SingleWindowBanner';

interface MilitaryDeptViewProps {
  onOpenMyPlan?: () => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const MilitaryDeptView: React.FC<MilitaryDeptViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  lang = 'ru',
}) => {
  const [pullUps, setPullUps] = useState<number>(12);
  const [running100m, setRunning100m] = useState<number>(13.5);
  const [running3km, setRunning3km] = useState<number>(12.2);

  // Simple normative check
  const isPhysicallyPassed = pullUps >= 10 && running100m <= 14.2 && running3km <= 13.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Законное освобождение от срочной службы</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Военные учебные центры (ВУЦ) при вузах России 2026
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm leading-relaxed">
          Обучение по программам военной подготовки офицеров, сержантов и солдат запаса. После успешного окончания вуза и сборов выпускнику присваивается воинское звание с зачислением в запас без призыва на срочную военную службу.
        </p>
      </div>

      {/* Normative Calculator Widget */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-10 shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-900 font-extrabold text-[10px] uppercase">
              Интерактивный тест
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold">
              Проверьте ваши шансы сдать нормативы по физо в ВУЦ
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Отбор в ВУЦ проходит на 2 курсе на конкурсной основе: учитывается средний балл зачетной книжки и нормативы физической подготовки Наставления по физподготовке ВС РФ (НФП-2023).
            </p>
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
              isPhysicallyPassed
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
            }`}>
              <span className="text-2xl">{isPhysicallyPassed ? '✅' : '⚠️'}</span>
              <span>
                {isPhysicallyPassed
                  ? 'Отличный результат! Ваши нормативы соответствуют проходному баллу на звание офицера запаса.'
                  : 'Потребуется подтянуть выносливость или подтягивания до старта отборочной комиссии в марте.'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Подтягивания на перекладине:</span>
                <span className="text-emerald-400">{pullUps} раз(а)</span>
              </div>
              <input
                type="range"
                min={4}
                max={25}
                value={pullUps}
                onChange={(e) => setPullUps(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Бег на 100 метров:</span>
                <span className="text-emerald-400">{running100m.toFixed(1)} сек</span>
              </div>
              <input
                type="range"
                min={11.0}
                max={16.5}
                step={0.1}
                value={running100m}
                onChange={(e) => setRunning100m(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Бег на 3 000 метров (кросс):</span>
                <span className="text-emerald-400">{running3km.toFixed(1)} мин</span>
              </div>
              <input
                type="range"
                min={9.5}
                max={15.0}
                step={0.1}
                value={running3km}
                onChange={(e) => setRunning3km(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Military Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MILITARY_CENTERS.map((vuc) => (
          <div
            key={vuc.id}
            className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {vuc.universityShort} ({vuc.city})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  Конкурс: {vuc.competitionPerSpot}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3">
                {vuc.universityFullName}
              </h3>

              {/* Ranks trained */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Программы подготовки:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vuc.ranksTrained.map((r, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                    >
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                  Военно-учетные специальности (ВУС):
                </span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {vuc.specialtiesTrained.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                1 день в неделю («военный день»)
              </span>
              <button
                onClick={() => onNavigateTab('catalog')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
              >
                Вузы с ВУЦ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Single Window Banner */}
      <SingleWindowBanner onOpenMyPlan={() => onOpenMyPlan?.()} lang={lang} />
    </div>
  );
};
