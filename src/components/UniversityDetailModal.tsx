import React, { useState } from 'react';
import {
  X,
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Home,
  BookOpen,
  Award,
  Scale,
  Bookmark,
  ExternalLink,
  Star,
  Users,
  Coins,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { University, UniversityProgram, ExamSubjectId } from '../types';
import { EXAM_SUBJECTS } from '../data/mockData';
import { DORMITORIES, MILITARY_CENTERS, UNIVERSITY_REVIEWS } from '../data/extendedData';

interface UniversityDetailModalProps {
  university: University | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
}

export const UniversityDetailModal: React.FC<UniversityDetailModalProps> = ({
  university: v,
  onClose,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'chance' | 'dorms_military' | 'reviews'>('overview');
  const [userExamScores, setUserExamScores] = useState<{ [key: string]: number }>({
    rus: 82,
    math_prof: 80,
    inf: 85,
    phys: 75,
    soc: 78,
  });

  if (!v) return null;

  const getSubjectName = (subId: ExamSubjectId) => {
    const s = EXAM_SUBJECTS.find((x) => x.id === subId);
    return s ? s.shortName : subId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto transition-all">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shrink-0"
              style={{ backgroundColor: v.emblemColor || '#2563EB' }}
            >
              {v.shortName.slice(0, 3)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-300 border border-brand-400/30">
                  Рейтинг #{v.ratingRank} в России
                </span>
                {v.isState && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Государственный
                  </span>
                )}
                <span className="text-xs text-slate-300">Основан в {v.foundedYear} г.</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{v.fullName}</h2>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                {v.city}, {v.address} {v.metro && `(м. ${v.metro})`}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions Bar */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Бюджетный балл</span>
                <span className="font-bold text-emerald-400 text-sm">от {v.minBudgetScore}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Бюджетных мест</span>
                <span className="font-bold text-white text-sm">{v.totalBudgetPlaces}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Стоимость от</span>
                <span className="font-bold text-white text-sm">{v.minAnnualFee.toLocaleString()} ₽/год</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleCompare(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isCompared
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{isCompared ? 'В сравнении' : 'К сравнению'}</span>
              </button>
              <button
                onClick={() => onToggleFavorite(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isFavorite
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isFavorite ? 'В приоритетах' : 'В приоритеты'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-sm font-semibold transition border-b-2 ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Обзор и кампус
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`py-3 px-4 text-sm font-semibold transition border-b-2 ${
              activeTab === 'programs'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Программы обучения ({v.programs.length})
          </button>
          <button
            onClick={() => setActiveTab('chance')}
            className={`py-3 px-4 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'chance'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Калькулятор шансов в {v.shortName}</span>
          </button>
          <button
            onClick={() => setActiveTab('dorms_military')}
            className={`py-3 px-4 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'dorms_military'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4 text-blue-500" />
            <span>Общежития и ВУЦ</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Отзывы студентов</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Об университете</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  {v.description}
                </p>
              </div>

              {/* Highlights & Features */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Особенности и преимущества</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {v.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <Award className="w-5 h-5 text-brand-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dormitory & Military Dept */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40">
                  <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-bold mb-2">
                    <Home className="w-5 h-5" />
                    <span>Общежитие для иногородних</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div>• Мест в студгородке: <strong>{v.dormitoryInfo.places.toLocaleString()}</strong></div>
                    <div>• Стоимость проживания: <strong>от {v.dormitoryInfo.costMonth} ₽ / месяц</strong></div>
                    <div>• Удалённость от учебных корпусов: <strong>~{v.dormitoryInfo.distanceMinutes} минут</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold mb-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Военный учебный центр (ВУЦ)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Студенты имеют возможность пройти обучение по программам подготовки офицеров, сержантов или солдат запаса без отрыва от учёбы.
                  </p>
                </div>
              </div>

              {/* Contacts */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap gap-6 text-xs text-slate-600 dark:text-slate-300">
                <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 hover:underline">
                  <Globe className="w-4 h-4" />
                  <span>Официальный сайт</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{v.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{v.email}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="space-y-4">
              {v.programs.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 bg-white dark:bg-slate-900 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 mr-2">
                        {p.code}
                      </span>
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                        {p.degree === 'specialist' ? 'Специалитет (5 лет)' : 'Бакалавриат (4 года)'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{p.name}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">Проходной балл 2025</div>
                      <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {p.minBudgetScore2025}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mb-3">{p.faculty}</div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">ЕГЭ:</span>
                      <div className="flex gap-1">
                        {p.requiredExams.map((ex) => (
                          <span key={ex} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {getSubjectName(ex)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>Бюджет: <strong>{p.budgetPlaces} мест</strong></span>
                      <span>Платно: <strong>{p.annualFee.toLocaleString()} ₽/год</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'chance' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800">
                <h4 className="text-sm font-bold text-brand-900 dark:text-brand-200 mb-1">
                  Персональный расчет шансов на поступление в {v.shortName}
                </h4>
                <p className="text-xs text-brand-700 dark:text-brand-300">
                  Укажите ваши предполагаемые или полученные баллы ЕГЭ, чтобы система рассчитала вероятность прохождения на бюджетные программы этого университета.
                </p>
              </div>

              {/* Subject Score Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EXAM_SUBJECTS.slice(0, 8).map((sub) => (
                  <div key={sub.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block truncate">
                      {sub.shortName}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={userExamScores[sub.id] || ''}
                      onChange={(e) =>
                        setUserExamScores({
                          ...userExamScores,
                          [sub.id]: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="mt-1 w-full px-2 py-1 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ))}
              </div>

              {/* Calculated chance on programs */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Результаты по программам {v.shortName}</h5>
                {v.programs.map((p) => {
                  let userSum = 0;
                  let hasAll = true;
                  for (const req of p.requiredExams) {
                    const sc = userExamScores[req];
                    if (!sc) {
                      hasAll = false;
                      break;
                    }
                    userSum += sc;
                  }

                  const passing = p.minBudgetScore2025;
                  const diff = userSum - passing;
                  let colorClass = 'bg-slate-100 text-slate-600';
                  let label = 'Заполните баллы';
                  let percent = 0;

                  if (hasAll) {
                    if (diff >= 5) {
                      colorClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
                      label = 'Высокие шансы (90%+)';
                      percent = Math.min(99, 85 + diff);
                    } else if (diff >= -15) {
                      colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
                      label = 'На грани конкурса (~50%)';
                      percent = 50 + diff * 2;
                    } else {
                      colorClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
                      label = 'Мало шансов (<30%)';
                      percent = Math.max(5, 30 + diff);
                    }
                  }

                  return (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.code} • Проходной балл: {p.minBudgetScore2025}
                          {hasAll && ` • Ваш балл: ${userSum}`}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${colorClass}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'dorms_military' && (() => {
            const dorm = DORMITORIES.find(
              (d) =>
                d.universityShort.toLowerCase().includes(v.shortName.toLowerCase()) ||
                v.shortName.toLowerCase().includes(d.universityShort.toLowerCase())
            );
            const military = MILITARY_CENTERS.find(
              (m) =>
                m.universityShort.toLowerCase().includes(v.shortName.toLowerCase()) ||
                v.shortName.toLowerCase().includes(m.universityShort.toLowerCase())
            );

            return (
              <div className="space-y-6">
                {/* Dormitory Card */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {dorm ? dorm.universityFullName : `Общежитие ${v.shortName}`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {dorm ? dorm.address : `${v.city}, студенческий городок`}
                        </p>
                      </div>
                    </div>
                    {dorm?.guaranteedForFirstYear && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        100% гарантия 1 курсу
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Тип планировки</span>
                      <strong className="text-slate-800 dark:text-slate-200">{dorm ? dorm.buildingType : 'Блочный'}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Стоимость проживания</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {dorm ? `${dorm.costPerMonth} ₽ / мес` : `от ${v.dormitoryInfo.costMonth} ₽ / мес`}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Всего мест</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {dorm ? dorm.placesTotal.toLocaleString() : v.dormitoryInfo.places.toLocaleString()}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[10px]">До корпусов</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        ~{dorm ? dorm.distanceToCampusMin : v.dormitoryInfo.distanceMinutes} минут
                      </strong>
                    </div>
                  </div>

                  {dorm?.facilities && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Инфраструктура и удобства:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dorm.facilities.map((f, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700"
                          >
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Military Center Card */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Военный учебный центр (ВУЦ) при {v.shortName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Подготовка офицеров, сержантов и рядовых запаса
                      </p>
                    </div>
                  </div>

                  {military ? (
                    <div className="space-y-3 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {military.ranksTrained.map((r, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold"
                          >
                            🎖️ {r}
                          </span>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="font-semibold text-slate-400 block text-[11px]">Нормативы физподготовки:</span>
                        <div className="text-slate-700 dark:text-slate-200 flex flex-wrap gap-4 font-medium">
                          <span>Подтягивания: ≥ <strong>{military.physicalRequirements.pullUps} раз</strong></span>
                          <span>Бег 100м: ≤ <strong>{military.physicalRequirements.running100mSec} сек</strong></span>
                          <span>Кросс 3км: ≤ <strong>{military.physicalRequirements.running3kmMin} мин</strong></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Студенты очной формы обучения имеют право на государственную отсрочку от призыва на весь период непрерывного обучения (бакалавриат + магистратура + аспирантура).
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'reviews' && (() => {
            const vuzReviews = UNIVERSITY_REVIEWS.filter(
              (r) =>
                r.universityId === v.id ||
                r.courseAndFaculty.toLowerCase().includes(v.shortName.toLowerCase())
            );

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Рейтинг студентов: {v.studentRating} / 5.0 ({v.reviewsCount} отзывов)
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Верифицированные студенты
                  </span>
                </div>

                {vuzReviews.length > 0 ? (
                  vuzReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-slate-900 dark:text-white text-sm block">
                            {rev.authorName}
                          </strong>
                          <span className="text-slate-500">{rev.courseAndFaculty} • {rev.date}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                          ★ {rev.ratingOverall}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-slate-200 dark:border-slate-700 text-[11px]">
                        <div>Учёба: <strong>{rev.ratingEducation} / 5</strong></div>
                        <div>Общага: <strong>{rev.ratingDorm} / 5</strong></div>
                        <div>Деканат: <strong>{rev.ratingDeanery} / 5</strong></div>
                        <div>Карьера: <strong>{rev.ratingEmployment} / 5</strong></div>
                      </div>

                      <div className="space-y-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                        <div><strong className="text-emerald-600 dark:text-emerald-400">Плюсы:</strong> {rev.pros}</div>
                        <div><strong className="text-rose-600 dark:text-rose-400">Минусы:</strong> {rev.cons}</div>
                        <div className="pt-1 italic text-slate-600 dark:text-slate-400">«{rev.verdict}»</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                      По этому вузу пока нет развернутых текстовых отзывов на текущей сессии.
                    </p>
                    <p>Общая оценка студентов составляет {v.studentRating} на основе опросов выпускников.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
