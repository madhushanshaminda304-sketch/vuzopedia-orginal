import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Building,
  RotateCcw,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { EXAM_SUBJECTS, UNIVERSITIES } from '../data/mockData';
import { ExamSubjectId, University } from '../types';
import { calculateAllChances, ProgramChanceResult, UserScores } from '../utils/calculator';

interface EgeCalculatorViewProps {
  onOpenUniversity: (vuz: University) => void;
  selectedCity: string;
  onOpenCityModal: () => void;
}

export const EgeCalculatorView: React.FC<EgeCalculatorViewProps> = ({
  onOpenUniversity,
  selectedCity,
  onOpenCityModal,
}) => {
  // Default selected subjects
  const [selectedSubjects, setSelectedSubjects] = useState<ExamSubjectId[]>([
    'rus',
    'math_prof',
    'inf',
  ]);
  const [scores, setScores] = useState<UserScores>({
    rus: 84,
    math_prof: 82,
    inf: 88,
  });
  const [achievements, setAchievements] = useState<number>(5); // e.g. medal or GTO
  const [requiresDorm, setRequiresDorm] = useState(false);
  const [requiresMilitary, setRequiresMilitary] = useState(false);

  const toggleSubject = (subId: ExamSubjectId) => {
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length <= 2) return; // keep at least 2
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subId));
      const newScores = { ...scores };
      delete newScores[subId];
      setScores(newScores);
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
      setScores({ ...scores, [subId]: 75 });
    }
  };

  const handleScoreChange = (subId: ExamSubjectId, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setScores({ ...scores, [subId]: clamped });
  };

  // Run calculation across all universities in mockData
  const results = useMemo(() => {
    const all = calculateAllChances(UNIVERSITIES, scores, achievements, selectedCity);
    return all.filter((r) => {
      if (requiresDorm && !r.university.hasDormitory) return false;
      if (requiresMilitary && !r.university.hasMilitaryDept) return false;
      return true;
    });
  }, [scores, achievements, selectedCity, requiresDorm, requiresMilitary]);

  const highChance = results.filter((r) => r.status === 'high');
  const mediumChance = results.filter((r) => r.status === 'medium');
  const lowChance = results.filter((r) => r.status === 'low');

  const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0) + achievements;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" />
          Калькулятор ЕГЭ 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Калькулятор шансов поступления в вузы
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
          Выберите сдаваемые предметы ЕГЭ, укажите баллы и индивидуальные достижения. Алгоритм сравнит ваши результаты с конкурсными списками прошлых лет и покажет, куда вы проходите на бюджет со 100% уверенностью.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings & Inputs Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              1. Выберите сдаваемые предметы
            </h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {EXAM_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              2. Укажите ваши баллы
            </h2>

            <div className="space-y-4">
              {selectedSubjects.map((subId) => {
                const sub = EXAM_SUBJECTS.find((s) => s.id === subId)!;
                const score = scores[subId] || 0;

                return (
                  <div key={subId} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sub.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={(e) => handleScoreChange(subId, Number(e.target.value))}
                          className="w-16 px-2 py-1 text-right text-sm font-black rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => handleScoreChange(subId, Number(e.target.value))}
                      className="w-full accent-brand-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            {/* Individual Achievements */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Индивидуальные достижения (ИД)
                  </span>
                  <span className="text-[11px] text-slate-400">Золотая медаль, ГТО, олимпиады</span>
                </div>
                <div className="text-sm font-extrabold text-amber-500">+{achievements} б.</div>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={achievements}
                onChange={(e) => setAchievements(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Preferences */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Город обучения:</span>
                <button
                  onClick={onOpenCityModal}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {selectedCity}
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={requiresDorm}
                  onChange={(e) => setRequiresDorm(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Только с общежитием для иногородних</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={requiresMilitary}
                  onChange={(e) => setRequiresMilitary(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Обязательно военный учебный центр (ВУЦ)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Calculation Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Summary Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 text-white shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-brand-200 font-semibold">
                  Ваша конкурсная сумма баллов
                </span>
                <div className="text-3xl sm:text-4xl font-black mt-0.5">
                  {totalPoints}{' '}
                  <span className="text-base font-normal text-brand-200">
                    (ЕГЭ + ИД)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-brand-200 block">Подобрано программ</span>
                <span className="text-2xl font-bold">{results.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/20 text-center text-xs">
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="font-extrabold text-emerald-300 text-lg">{highChance.length}</div>
                <div className="text-[11px] text-emerald-100 font-medium">Высокие шансы</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="font-extrabold text-amber-300 text-lg">{mediumChance.length}</div>
                <div className="text-[11px] text-amber-100 font-medium">Конкурс на грани</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="font-extrabold text-rose-300 text-lg">{lowChance.length}</div>
                <div className="text-[11px] text-rose-100 font-medium">Резервные</div>
              </div>
            </div>
          </div>

          {/* Results Lists */}
          {results.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Нет совпадений по выбранной комбинации предметов
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Попробуйте добавить предмет (например, Информатику или Физику к Математике и Русскому) либо выбрать другой город.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* High chance list */}
              {highChance.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Зелёная зона — гарантированное поступление ({highChance.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {highChance.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-950/60 shadow-soft hover:shadow-elevated transition group"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold mr-2">
                              {item.program.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {item.university.shortName} • {item.university.city}
                            </span>
                            <h4
                              onClick={() => onOpenUniversity(item.university)}
                              className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 cursor-pointer transition mt-0.5"
                            >
                              {item.program.name}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                              {item.chancePercent}% шанс
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            Проходной балл 2025: <strong>{item.passingScore}</strong> • Ваш запас:{' '}
                            <span className="text-emerald-600 font-bold">
                              +{item.diff} баллов
                            </span>
                          </div>
                          <button
                            onClick={() => onOpenUniversity(item.university)}
                            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                          >
                            <span>Подробнее</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium chance list */}
              {mediumChance.length > 0 && (
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Жёлтая зона — конкурс на грани ({mediumChance.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {mediumChance.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950/60 shadow-soft transition"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold mr-2">
                              {item.program.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {item.university.shortName} • {item.university.city}
                            </span>
                            <h4
                              onClick={() => onOpenUniversity(item.university)}
                              className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 cursor-pointer transition mt-0.5"
                            >
                              {item.program.name}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                              {item.chancePercent}% шанс
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            Проходной балл 2025: <strong>{item.passingScore}</strong> • Отставание:{' '}
                            <span className="text-amber-600 font-bold">
                              {item.diff} баллов
                            </span>
                          </div>
                          <button
                            onClick={() => onOpenUniversity(item.university)}
                            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                          >
                            <span>Подробнее</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
