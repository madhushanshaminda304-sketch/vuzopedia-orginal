import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Building,
  CheckCircle2,
  Coins,
  FileCheck,
  Info,
  ExternalLink,
  Sparkles,
  School,
  Clock,
  Award,
} from 'lucide-react';
import { TARGET_QUOTA_OFFERS } from '../data/mockData';
import { TARGET_COMPANIES } from '../data/extendedData';

export const TargetEducationView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'offers' | 'companies'>('offers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSphere, setSelectedSphere] = useState('all');

  const spheres = [
    { id: 'all', label: 'Все отрасли' },
    { id: 'atom', label: 'Атомная отрасль' },
    { id: 'oil', label: 'Нефтегаз' },
    { id: 'transport', label: 'Транспорт и РЖД' },
    { id: 'avia', label: 'Авиастроение' },
    { id: 'med', label: 'Здравоохранение' },
  ];

  const filtered = useMemo(() => {
    return TARGET_QUOTA_OFFERS.filter((offer) => {
      if (selectedSphere === 'atom' && !offer.sphere.includes('Атомная')) return false;
      if (selectedSphere === 'oil' && !offer.sphere.includes('Нефтегаз')) return false;
      if (selectedSphere === 'transport' && !offer.sphere.includes('Транспорт')) return false;
      if (selectedSphere === 'avia' && !offer.sphere.includes('Авиастроение')) return false;
      if (selectedSphere === 'med' && !offer.sphere.includes('медицина')) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          offer.employer.toLowerCase().includes(q) ||
          offer.specialtyName.toLowerCase().includes(q) ||
          offer.universityShort.toLowerCase().includes(q) ||
          offer.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchTerm, selectedSphere]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
          <FileCheck className="w-4 h-4" />
          Целевая квота 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Целевое обучение в вузах: предложения работодателей
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Бесплатное обучение в престижных университетах по отдельному конкурсу с гарантией первого рабочего места, корпоративными стипендиями и поддержкой ведущих корпораций России.
        </p>
      </div>

      {/* Highlights Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-soft mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Порядок подачи на целевое в 2026 году
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              Единый портал «Работа в России» (ТрудВсем)
            </h3>
          </div>
          <a
            href="https://trudvsem.ru"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition shrink-0"
          >
            <span>Перейти на портал ТрудВсем</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <p className="text-xs text-blue-100 max-w-3xl leading-relaxed">
          С 1 мая 2024 года все договоры о целевом обучении заключаются публично через федеральный портал «Работа в России». Абитуриенты подают заявку работодателю одновременно с заявлением в вуз через портал Госуслуг.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveSubTab('offers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'offers'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Вакансии и квоты по специальностям ({filtered.length})
        </button>
        <button
          onClick={() => setActiveSubTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'companies'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Крупнейшие корпорации-заказчики ({TARGET_COMPANIES.length})</span>
        </button>
      </div>

      {activeSubTab === 'offers' ? (
        <>
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft mb-8 space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по заказчику (Росатом, Газпром, РЖД) или специальности..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {spheres.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSphere(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedSphere === s.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Offers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-elevated transition flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {offer.sphere}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      {offer.openSpots} целевых мест
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {offer.employer}
                  </h3>

                  <div className="text-xs text-slate-500 mb-4">
                    Вуз: <strong className="text-slate-800 dark:text-slate-200">{offer.universityShort}</strong> ({offer.city})
                  </div>

                  {/* Specialty & Code */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 mr-2">
                      {offer.specialtyCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {offer.specialtyName}
                    </span>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Меры поддержки студента:
                    </span>
                    {offer.benefits.map((b, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Стипендия от заказчика</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      +{offer.stipendPerMonth.toLocaleString()} ₽/мес
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Отработка по контракту</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {offer.obligationYears} года
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Companies Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TARGET_COMPANIES.map((comp) => (
            <div
              key={comp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-elevated transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                    {comp.industry}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {comp.openSpots2026} мест в 2026
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {comp.name}
                </h3>

                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                    Корпоративная стипендия:
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                    {comp.stipendMonthly}
                  </span>
                </div>

                {/* Partner Universities */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-500">Вузы-партнёры целевой программы:</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {comp.partnerUniversities.map((vuz, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium"
                      >
                        {vuz}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Guaranteed Bonuses */}
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 pt-1">
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Бонусы:</strong> {comp.guaranteedBonus}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Подача до: {comp.applicationDeadline}</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Отработка: {comp.commitmentYears} года
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
