import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Percent,
  CheckCircle2,
  HelpCircle,
  PiggyBank,
  GraduationCap,
  Sparkles,
  TrendingUp,
  FileCheck2,
  CalendarClock,
} from 'lucide-react';

export const CreditCalculatorView: React.FC = () => {
  // Calculator States
  const [annualFee, setAnnualFee] = useState<number>(360000);
  const [durationYears, setDurationYears] = useState<number>(4);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [repaymentYears, setRepaymentYears] = useState<number>(15);

  // Discounted tuition
  const effectiveAnnualFee = useMemo(() => {
    return Math.round(annualFee * (1 - discountPercent / 100));
  }, [annualFee, discountPercent]);

  const totalTuitionCost = useMemo(() => {
    return effectiveAnnualFee * durationYears;
  }, [effectiveAnnualFee, durationYears]);

  // Government 3% loan calculations:
  // During study:
  // 1st year: student pays 40% of the 3% interest portion
  // 2nd year: student pays 60% of the 3% interest portion
  // 3rd year onwards + 9 months after graduation: student pays 100% of the 3% interest portion
  // After grace period: principal + 3% interest amortized over repaymentYears (default 15 years = 180 months)
  const calculation = useMemo(() => {
    const loanAmount = totalTuitionCost;
    const monthlyRate = 0.03 / 12;

    // Monthly interest on 1st year disbursement
    const firstYearLoan = effectiveAnnualFee;
    const firstYearMonthlyInterest = firstYearLoan * monthlyRate;
    const year1Payment = Math.round(firstYearMonthlyInterest * 0.4);

    // 2nd year payment
    const secondYearLoan = effectiveAnnualFee * 2;
    const secondYearMonthlyInterest = secondYearLoan * monthlyRate;
    const year2Payment = Math.round(secondYearMonthlyInterest * 0.6);

    // 3rd & 4th year payment during study
    const fullLoanMonthlyInterest = Math.round(loanAmount * monthlyRate);

    // Post-graduation amortization (annuity formula)
    const n = repaymentYears * 12;
    const postGradPayment = Math.round(
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1)
    );

    // Total commercial comparison (if bank rate was 24% without government subsidy)
    const commercialRate = 0.24 / 12;
    const commercialPostPayment = Math.round(
      (loanAmount * (commercialRate * Math.pow(1 + commercialRate, n))) /
        (Math.pow(1 + commercialRate, n) - 1)
    );
    const totalGovernmentSubsidySaved = (commercialPostPayment - postGradPayment) * n;

    return {
      year1Payment,
      year2Payment,
      fullLoanMonthlyInterest,
      postGradPayment,
      commercialPostPayment,
      totalGovernmentSubsidySaved,
    };
  }, [effectiveAnnualFee, totalTuitionCost, durationYears, repaymentYears]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-xs font-bold uppercase tracking-wider">
            <Percent className="w-4 h-4 text-emerald-300" />
            <span>Федеральная госпрограмма поддержки студентов</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Образовательный кредит 3% и скидки на платное обучение
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Не добрали баллы на бюджет? Получите высшее образование мечты без финансовой нагрузки на семью. Государство оплачивает основную процентную ставку, а вы платите всего 3% годовых и начинаете возвращать долг только после трудоустройства!
          </p>
        </div>
      </div>

      {/* Main Interactive Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Controls */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Калькулятор льготного кредита
              </h2>
              <p className="text-xs text-slate-500">Настройте параметры вашей образовательной программы</p>
            </div>
          </div>

          {/* Annual Tuition Fee Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">Базовая стоимость года обучения:</span>
              <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                {annualFee.toLocaleString('ru-RU')} ₽ / год
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={800000}
              step={10000}
              value={annualFee}
              onChange={(e) => setAnnualFee(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>100 000 ₽</span>
              <span>450 000 ₽ (средняя по Москве)</span>
              <span>800 000 ₽</span>
            </div>
          </div>

          {/* Study Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Ступень и срок обучения:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { years: 4, label: '4 года (Бакалавриат)' },
                { years: 5, label: '5 лет (Специалитет)' },
                { years: 2, label: '2 года (Магистратура)' },
              ].map((item) => (
                <button
                  key={item.years}
                  type="button"
                  onClick={() => setDurationYears(item.years)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    durationYears === item.years
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* University Discount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">
                Скидка от вуза за баллы ЕГЭ:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                {discountPercent}% скидка
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 25, 50, 70].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscountPercent(d)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    discountPercent === d
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {d === 0 ? 'Без скидки' : `${d}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Repayment Years */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Срок погашения после выпуска:</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold">
                {repaymentYears} лет (максимум по закону)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={15}
              value={repaymentYears}
              onChange={(e) => setRepaymentYears(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Summary Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Сумма к оплате за всё обучение:</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {totalTuitionCost.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            {discountPercent > 0 && (
              <div className="text-right">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ваша скидка:</span>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  -{(annualFee * durationYears - totalTuitionCost).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Payment Schedule Breakdown */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                График платежей
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Ставка 3% фиксирована
              </span>
            </div>

            {/* Stage 1: 1st Year */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">1 курс (первые 12 месяцев):</span>
                <span className="text-lg font-black text-emerald-400">
                  {calculation.year1Payment.toLocaleString('ru-RU')} ₽ / мес
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Оплачивается только 40% от начисленных процентов. Меньше чашки кофе в кафе!
              </p>
            </div>

            {/* Stage 2: 2nd Year */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">2 курс (13–24 месяцы):</span>
                <span className="text-lg font-black text-emerald-400">
                  {calculation.year2Payment.toLocaleString('ru-RU')} ₽ / мес
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Оплачивается 60% от начисленных процентов.
              </p>
            </div>

            {/* Stage 3: 3rd Year and onwards */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">3–4 курсы + 9 мес. после выпуска:</span>
                <span className="text-lg font-black text-amber-300">
                  {calculation.fullLoanMonthlyInterest.toLocaleString('ru-RU')} ₽ / мес
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% процентов по ставке 3%. Основной долг всё ещё заморожен!
              </p>
            </div>

            {/* Stage 4: After Graduation & Employment */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-300">
                  Погашение после устройства на работу:
                </span>
                <span className="text-xl font-black text-white">
                  {calculation.postGradPayment.toLocaleString('ru-RU')} ₽ / мес
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Выплата основного долга в течение {repaymentYears} лет. Сумма легко покрывается первой зарплатой молодого специалиста.
              </p>
            </div>
          </div>

          {/* Subsidy Benefit Callout */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Экономия за счёт субсидии государства:</span>
            </div>
            <p className="text-sm font-black text-white">
              ~ {Math.round(calculation.totalGovernmentSubsidySaved / 1000).toLocaleString('ru-RU')} тыс. ₽
            </p>
            <p className="text-[10px] text-slate-400">
              По сравнению с обычным потребительским кредитом по коммерческой ставке 24% годовых.
            </p>
          </div>
        </div>
      </div>

      {/* University Discount Criteria Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Скидки на платное обучение в ведущих вузах РФ
            </h3>
            <p className="text-xs text-slate-500">
              Вузы ежегодно снижают стоимость платного обучения для абитуриентов с высокими баллами ЕГЭ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">НИУ ВШЭ</h4>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Скидки до 70%
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>70% скидка:</strong> при нехватке 1–5 баллов до бюджетного проходного.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>50% скидка:</strong> при нехватке 6–15 баллов.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>25% скидка:</strong> при нехватке 16–30 баллов.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">РАНХиГС</h4>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Скидки до 80%
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>80% скидка:</strong> при сумме ЕГЭ от 280 баллов.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>50% скидка:</strong> при сумме ЕГЭ от 260 баллов.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>20% скидка:</strong> при сумме ЕГЭ от 240 баллов.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">НИЯУ МИФИ & МФТИ</h4>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Скидки до 50%
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span><strong>Гранты на 100% оплаты:</strong> для олимпиадников, не прошедших по квоте.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span><strong>50% скидка:</strong> при среднем балле за предмет от 85+.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span><strong>Сохранение скидки:</strong> при сдаче сессий на «хорошо» и «отлично».</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step by step to get credit */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Как оформить образовательный кредит под 3% (Пошагово)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Заключите договор</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Подайте документы в приёмную комиссию вуза и заключите договор об оказании платных образовательных услуг.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Подайте заявку в банк</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Обратитесь в СберБанк или Т-Банк с паспортом, договором с вузом и квитанцией на оплату первого семестра.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Одобрение без залога</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Кредит одобряется без подтверждения доходов и поручителей, даже абитуриентам с 14 лет (с согласия родителей).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center text-xs">
              4
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Оплата семестров</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Банк переводит средства напрямую на расчётный счёт вуза каждые полгода. Учитесь спокойно!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
