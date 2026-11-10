import React, { useState } from 'react';
import {
  Building,
  MapPin,
  CheckCircle2,
  Clock,
  Wifi,
  ShieldCheck,
  Search,
  Train,
} from 'lucide-react';
import { DORMITORIES } from '../data/extendedData';
import { SingleWindowBanner } from './SingleWindowBanner';

interface DormitoriesViewProps {
  onOpenMyPlan?: () => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const DormitoriesView: React.FC<DormitoriesViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  lang = 'ru',
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [onlyGuaranteed, setOnlyGuaranteed] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredDorms = DORMITORIES.filter((d) => {
    if (selectedType !== 'all' && d.buildingType !== selectedType) return false;
    if (onlyGuaranteed && !d.guaranteedForFirstYear) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        d.universityShort.toLowerCase().includes(q) ||
        d.universityFullName.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Building className="w-3.5 h-3.5" />
          <span>Студенческое жильё и кампусы</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Общежития вузов России 2026
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm leading-relaxed">
          База студенческих городков и общежитий при ведущих университетах: стоимость проживания в месяц, типы комнат (блочный, коридорный, квартирный), гарантия заселения первокурсников и транспортная доступность.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по вузу (МГУ, Бауманка, ВШЭ...) или адресу..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
            >
              <option value="all">Любой тип здания</option>
              <option value="Блочный">Блочный тип</option>
              <option value="Квартирный">Квартирный тип</option>
              <option value="Коридорный">Коридорный тип</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyGuaranteed}
                onChange={(e) => setOnlyGuaranteed(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>100% гарантия для 1 курса</span>
            </label>
          </div>
        </div>
      </div>

      {/* Dormitory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDorms.map((dorm) => (
          <div
            key={dorm.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={dorm.photos[0]}
                  alt={dorm.universityFullName}
                  className="w-full h-full object-cover transition transform hover:scale-105 duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-600 text-white font-extrabold text-[10px] shadow-sm">
                  {dorm.buildingType}
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-900/90 text-emerald-400 font-extrabold text-xs shadow-sm">
                  {dorm.costPerMonth.toLocaleString('ru-RU')} ₽ / мес
                </div>
              </div>

              <div className="p-6">
                <div className="text-xs font-bold text-blue-600 mb-1">{dorm.universityShort}</div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                  {dorm.universityFullName}
                </h3>
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{dorm.address}</span>
                </p>

                {dorm.metroStation && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-1.5 font-medium">
                    <Train className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Метро: {dorm.metroStation}</span>
                  </p>
                )}

                {/* Facilities Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dorm.facilities.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Мест: {dorm.placesTotal}</span>
              <button
                onClick={() => onNavigateTab('catalog')}
                className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition"
              >
                Вузы и программы
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
