import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  SlidersHorizontal,
  Home,
  CheckCircle2,
  Award,
  BookOpen,
  TrendingUp,
  School,
  Calculator,
} from 'lucide-react';
import { COLLEGES } from '../data/mockData';
import { College } from '../types';

export const CollegesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBase, setSelectedBase] = useState<'all' | 'after_9' | 'after_11'>('all');
  const [onlyDorm, setOnlyDorm] = useState(false);
  const [userGpa, setUserGpa] = useState<number>(4.6);
  const [showGpaCalculator, setShowGpaCalculator] = useState(false);

  // Grade inputs for calculator
  const [grades, setGrades] = useState<{ [key: string]: number }>({
    rus: 5,
    alg: 4,
    geom: 4,
    phys: 4,
    inf: 5,
    hist: 4,
    soc: 5,
    eng: 5,
  });

  const calculatedGpa = useMemo(() => {
    const vals = Object.values(grades);
    const sum = vals.reduce((a, b) => a + b, 0);
    return Number((sum / vals.length).toFixed(2));
  }, [grades]);

  const filteredColleges = useMemo(() => {
    return COLLEGES.filter((c) => {
      if (selectedBase !== 'all') {
        if (selectedBase === 'after_9' && c.base === 'after_11') return false;
        if (selectedBase === 'after_11' && c.base === 'after_9') return false;
      }
      if (onlyDorm && !c.hasDormitory) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          c.shortName.toLowerCase().includes(q) ||
          c.fullName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [searchTerm, selectedBase, onlyDorm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
          <School className="w-4 h-4" />
          СПО: Колледжи и техникумы 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Каталог колледжей и техникумов России
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Поступление без результатов ЕГЭ по среднему баллу аттестата. Найдите государственные ссузы после 9 и 11 класса с бюджетными местами, общежитием и отсрочкой от армии.
        </p>
      </div>

      {/* GPA Calculator Box Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white shadow-soft mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              Инструмент для поступающих в СПО
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              Калькулятор среднего балла аттестата
            </h3>
            <p className="text-xs text-teal-100 max-w-xl mt-1">
              В колледжах конкурс проходит строго по среднему баллу школьного аттестата (сумма всех оценок делённая на их количество).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md">
              <span className="text-[10px] text-teal-200 uppercase font-semibold block">Ваш средний балл</span>
              <span className="text-2xl font-black text-amber-300">{calculatedGpa}</span>
            </div>
            <button
              onClick={() => setShowGpaCalculator(!showGpaCalculator)}
              className="px-4 py-2.5 rounded-xl bg-white text-teal-800 font-bold text-xs hover:bg-teal-50 transition"
            >
              {showGpaCalculator ? 'Скрыть расчёт' : 'Рассчитать свой балл'}
            </button>
          </div>
        </div>

        {/* Interactive Grade Inputs */}
        {showGpaCalculator && (
          <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
            {[
              { id: 'rus', label: 'Русский язык' },
              { id: 'alg', label: 'Алгебра / Математика' },
              { id: 'geom', label: 'Геометрия' },
              { id: 'phys', label: 'Физика' },
              { id: 'inf', label: 'Информатика' },
              { id: 'hist', label: 'История' },
              { id: 'soc', label: 'Обществознание' },
              { id: 'eng', label: 'Иностранный язык' },
            ].map((sub) => (
              <div key={sub.id} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                <span className="text-[11px] text-teal-100 block truncate mb-1">{sub.label}</span>
                <select
                  value={grades[sub.id]}
                  onChange={(e) => setGrades({ ...grades, [sub.id]: Number(e.target.value) })}
                  className="w-full bg-white/20 text-white font-bold text-sm px-2 py-1 rounded-lg focus:outline-none"
                >
                  <option value={5} className="text-slate-900">5 (Отлично)</option>
                  <option value={4} className="text-slate-900">4 (Хорошо)</option>
                  <option value={3} className="text-slate-900">3 (Удовл.)</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft mb-8 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск колледжа по названию, специальности или городу..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Любая база' },
              { id: 'after_9', label: 'После 9 класса' },
              { id: 'after_11', label: 'После 11 класса' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBase(b.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedBase === b.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={onlyDorm}
              onChange={(e) => setOnlyDorm(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>С общежитием</span>
          </label>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((koll) => {
          const passChance = calculatedGpa >= koll.minGpaBudget;

          return (
            <div
              key={koll.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-elevated transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500">{koll.city}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">
                    {koll.base === 'after_9' ? 'После 9 кл.' : (koll.base === 'after_11' ? 'После 11 кл.' : '9 и 11 кл.')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {koll.shortName}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1 mb-4">{koll.fullName}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Проходной балл аттестата</span>
                    <span className="text-sm font-black text-teal-600 dark:text-teal-400">
                      от {koll.minGpaBudget}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Бюджетных мест</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {koll.budgetPlaces}
                    </span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Направления:
                  </span>
                  <div className="space-y-1">
                    {koll.specialties.map((s, i) => (
                      <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        <span className="line-clamp-1">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Admission Chance Status */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {passChance ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Вы проходите на бюджет!
                  </span>
                ) : (
                  <span className="font-medium text-amber-600">
                    Требуется аттестат от {koll.minGpaBudget}
                  </span>
                )}
                <span className="text-slate-400">Рейтинг: {koll.rating} ★</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
