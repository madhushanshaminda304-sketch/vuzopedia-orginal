import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Home,
  Coffee,
  Bus,
  ShoppingBag,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { STUDENT_LIVING_COSTS } from '../data/extendedData';
import { SingleWindowBanner } from './SingleWindowBanner';

interface StudentBudgetCalculatorViewProps {
  onOpenMyPlan?: () => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const StudentBudgetCalculatorView: React.FC<StudentBudgetCalculatorViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
}) => {
  const [selectedCityName, setSelectedCityName] = useState<string>('Москва');
  const [housingType, setHousingType] = useState<'dorm' | 'room' | 'flat'>('dorm');
  const [foodPreference, setFoodPreference] = useState<'budget' | 'standard' | 'cafe'>('standard');
  const [personalSpendMultiplier, setPersonalSpendMultiplier] = useState<number>(1.0);

  const cityData = useMemo(() => {
    return (
      STUDENT_LIVING_COSTS.find((c) => c.city === selectedCityName) ||
      STUDENT_LIVING_COSTS[0]
    );
  }, [selectedCityName]);

  // Calculations
  const calculatedBudget = useMemo(() => {
    // Housing
    let housingCost = cityData.dormAvgPerMonth;
    if (housingType === 'room') {
      housingCost = Math.round(cityData.rentFlat1kPerMonth * 0.5);
    } else if (housingType === 'flat') {
      housingCost = cityData.rentFlat1kPerMonth;
    }

    // Food
    let foodMultiplier = 1.0;
    if (foodPreference === 'budget') foodMultiplier = 0.75;
    if (foodPreference === 'cafe') foodMultiplier = 1.45;
    const foodCost = Math.round(cityData.foodPerMonth * foodMultiplier);

    // Transport
    const transportCost = cityData.transportPerMonth;

    // Personal & Leisure
    const personalCost = Math.round(cityData.personalPerMonth * personalSpendMultiplier);

    const totalMonthly = housingCost + foodCost + transportCost + personalCost;
    const canSelfFund = cityData.averagePartTimePay >= totalMonthly;
    const gap = cityData.averagePartTimePay - totalMonthly;

    return {
      housingCost,
      foodCost,
      transportCost,
      personalCost,
      totalMonthly,
      canSelfFund,
      gap,
    };
  }, [cityData, housingType, foodPreference, personalSpendMultiplier]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-teal-300" />
            <span>Калькулятор студенческой жизни 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Сколько стоит жизнь студента в вузах России?
          </h1>
          <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
            Поступление в другой город — это не только баллы ЕГЭ, но и реальный ежемесячный бюджет. Рассчитайте расходы на общежитие, аренду, питание и проезд, и узнайте, хватит ли студенческой стипендии и подработки!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Выберите город обучения
            </h2>
          </div>

          {/* City Selection Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STUDENT_LIVING_COSTS.map((c) => (
              <button
                key={c.city}
                onClick={() => setSelectedCityName(c.city)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                  selectedCityName === c.city
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {c.city}
              </button>
            ))}
          </div>

          {/* Accommodation Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-500" />
              <span>Где вы планируете жить?</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setHousingType('dorm')}
                className={`p-3 rounded-xl text-xs font-bold transition border text-left ${
                  housingType === 'dorm'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-extrabold">Общежитие вуза</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ~{cityData.dormAvgPerMonth.toLocaleString('ru-RU')} ₽ / мес
                </div>
              </button>

              <button
                onClick={() => setHousingType('room')}
                className={`p-3 rounded-xl text-xs font-bold transition border text-left ${
                  housingType === 'room'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-extrabold">Комната напополам</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ~{Math.round(cityData.rentFlat1kPerMonth * 0.5).toLocaleString('ru-RU')} ₽ / мес
                </div>
              </button>

              <button
                onClick={() => setHousingType('flat')}
                className={`p-3 rounded-xl text-xs font-bold transition border text-left ${
                  housingType === 'flat'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-extrabold">Своя 1-к квартира</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ~{cityData.rentFlat1kPerMonth.toLocaleString('ru-RU')} ₽ / мес
                </div>
              </button>
            </div>
          </div>

          {/* Food Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-emerald-500" />
              <span>Формат питания:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'budget', label: 'Готовка дома', sub: 'Базовые продукты' },
                { key: 'standard', label: 'Университет + дома', sub: 'Столовые + супермаркет' },
                { key: 'cafe', label: 'Кафе и доставка', sub: 'Частые перекусы' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFoodPreference(item.key as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition border text-left ${
                    foodPreference === item.key
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Personal spend */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                <span>Личные расходы (одежда, гаджеты, досуг):</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {calculatedBudget.personalCost.toLocaleString('ru-RU')} ₽ / мес
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={personalSpendMultiplier}
              onChange={(e) => setPersonalSpendMultiplier(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Total Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Итоговый бюджет в месяц
              </span>
              <span className="text-xs font-bold text-emerald-300">
                г. {selectedCityName}
              </span>
            </div>

            <div className="text-center py-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400 block">Необходимый минимум на жизнь</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {calculatedBudget.totalMonthly.toLocaleString('ru-RU')} ₽
              </div>
              <span className="text-[10px] text-slate-400">в месяц</span>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Жилье:</span>
                </span>
                <span className="font-bold text-white">
                  {calculatedBudget.housingCost.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Питание:</span>
                </span>
                <span className="font-bold text-white">
                  {calculatedBudget.foodCost.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Транспорт (социальный билет):</span>
                </span>
                <span className="font-bold text-white">
                  {calculatedBudget.transportCost.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Личные расходы:</span>
                </span>
                <span className="font-bold text-white">
                  {calculatedBudget.personalCost.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Part-time Comparison Alert */}
            <div
              className={`p-4 rounded-2xl border ${
                calculatedBudget.canSelfFund
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                {calculatedBudget.canSelfFund ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>Подработка в {selectedCityName}: ~{cityData.averagePartTimePay.toLocaleString('ru-RU')} ₽ / мес</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {calculatedBudget.canSelfFund
                  ? `Покрывает расходы полностью с остатком +${calculatedBudget.gap.toLocaleString('ru-RU')} ₽ на накопления!`
                  : `Не хватает ${Math.abs(calculatedBudget.gap).toLocaleString('ru-RU')} ₽. Потребуется помощь родителей или студенческое общежитие.`}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Цены актуализированы</span>
            <span className="font-bold text-white">Сезон 2026</span>
          </div>
        </div>
      </div>

      {/* Single Window Banner */}
      <SingleWindowBanner onOpenMyPlan={onOpenMyPlan} />
    </div>
  );
};
