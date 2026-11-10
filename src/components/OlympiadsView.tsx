import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  School,
  Calendar,
  Filter,
} from 'lucide-react';
import { OLYMPIADS_BVI } from '../data/extendedData';
import { OlympiadItem } from '../types';

export const OlympiadsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Interactive BVI Confirmation Tool State
  const [calcOlympiadId, setCalcOlympiadId] = useState<string>(OLYMPIADS_BVI[1].id);
  const [calcStatus, setCalcStatus] = useState<'winner' | 'prize'>('winner');
  const [calcScore, setCalcScore] = useState<number>(82);

  const subjectsList = ['all', 'Информатика', 'Математика', 'Физика', 'Химия', 'Биология', 'Экономика'];

  const filteredOlympiads = useMemo(() => {
    return OLYMPIADS_BVI.filter((olymp) => {
      const matchesSearch =
        olymp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        olymp.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        olymp.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        selectedLevel === 'all' || olymp.level.toString() === selectedLevel;

      const matchesSubject =
        selectedSubject === 'all' || olymp.subject.toLowerCase().includes(selectedSubject.toLowerCase());

      return matchesSearch && matchesLevel && matchesSubject;
    });
  }, [searchQuery, selectedLevel, selectedSubject]);

  const selectedCalcOlymp = OLYMPIADS_BVI.find((o) => o.id === calcOlympiadId) || OLYMPIADS_BVI[0];
  const isVsosh = selectedCalcOlymp.id === 'olymp-vsosh';
  const isConfirmed = isVsosh || calcScore >= selectedCalcOlymp.confirmationScore;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Перечень РСОШ & ВсОШ 2025/2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Олимпиады и БВИ (Поступление без экзаменов)
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Диплом победителя или призёра олимпиады из Перечня Минобрнауки РФ даёт право поступить в престижнейшие вузы страны без вступительных испытаний (БВИ) либо засчитывается как 100 баллов за профильный экзамен ЕГЭ.
          </p>
        </div>
      </div>

      {/* Interactive BVI Checker Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Калькулятор подтверждения льготы БВИ
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Проверьте, подтверждает ли ваш результат ЕГЭ право на поступление вне конкурса
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Olympiad selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Выберите олимпиаду
            </label>
            <select
              value={calcOlympiadId}
              onChange={(e) => setCalcOlympiadId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {OLYMPIADS_BVI.map((olymp) => (
                <option key={olymp.id} value={olymp.id}>
                  {olymp.title} (Уровень {olymp.level})
                </option>
              ))}
            </select>
          </div>

          {/* Winner / Prize winner */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Статус диплома
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCalcStatus('winner')}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  calcStatus === 'winner'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Победитель (I ст.)
              </button>
              <button
                type="button"
                onClick={() => setCalcStatus('prize')}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  calcStatus === 'prize'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Призёр (II–III ст.)
              </button>
            </div>
          </div>

          {/* Exam score */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300">
                Ваш балл ЕГЭ по предмету
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">
                {isVsosh ? 'Не требуется' : `${calcScore} баллов`}
              </span>
            </div>
            {isVsosh ? (
              <div className="py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
                Для ВсОШ подтверждение 75 баллами НЕ нужно
              </div>
            ) : (
              <input
                type="range"
                min={50}
                max={100}
                value={calcScore}
                onChange={(e) => setCalcScore(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Result alert */}
        <div
          className={`mt-6 p-4 rounded-xl border flex items-start gap-3 transition ${
            isConfirmed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          {isConfirmed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-bold">
              {isVsosh
                ? 'Всероссийская олимпиада: Абсолютное БВИ во все вузы России!'
                : isConfirmed
                ? `Льгота подтверждена! Балл ${calcScore} ≥ 75. Вы получаете право на БВИ или 100 баллов!`
                : `Внимание: балл ${calcScore} < 75. Льгота перечневой олимпиады не активирована.`}
            </p>
            <p className="opacity-90">
              {isConfirmed
                ? `По олимпиаде «${selectedCalcOlymp.title}» вы можете претендовать на зачисление вне основного конкурса в более чем ${selectedCalcOlymp.participatingUniversitiesCount} университетов.`
                : 'По правилам приёма РФ диплом олимпиады 1–3 уровней даёт льготу БВИ только при подтверждении не менее 75 баллов на профильном ЕГЭ.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию или организатору..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Level */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-medium"
            >
              <option value="all">Все уровни РСОШ</option>
              <option value="1">1 уровень (Максимальные льготы)</option>
              <option value="2">2 уровень</option>
              <option value="3">3 уровень</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-medium"
            >
              <option value="all">Все профильные предметы</option>
              {subjectsList.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Olympiad Cards Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Список перечневых олимпиад ({filteredOlympiads.length})
          </h2>
          <span className="text-xs text-slate-500">Приём 2026/2027</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOlympiads.map((olymp) => (
            <div
              key={olymp.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          olymp.level === 1
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        }`}
                      >
                        {olymp.level === 1 ? '🥇 1 уровень РСОШ' : `🥈 ${olymp.level} уровень`}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {olymp.confirmationScore === 0 ? 'Без подтверждения' : `Подтверждение: ${olymp.confirmationScore}+ баллов`}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {olymp.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <School className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{olymp.organizer}</span>
                    </p>
                  </div>
                </div>

                {/* Subject tag list */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Предметы:</span>
                    <span className="text-right font-medium text-slate-800 dark:text-slate-100">{olymp.subject}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Профильный ЕГЭ:</span>
                    <span className="text-right font-bold text-amber-600 dark:text-amber-400">{olymp.profileSubjectExam}</span>
                  </div>
                </div>

                {/* BVI Benefit Highlight */}
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    Льгота при поступлении:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {olymp.bviBenefit}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Регистрация: {olymp.registrationDeadline}</span>
                </div>
                <a
                  href={olymp.officialSite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold transition"
                >
                  <span>Сайт олимпиады</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Guidelines */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Важные правила поступления по БВИ в 2026 году
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">1 вуз и 1 специальность</h4>
            <p>
              Льготу БВИ (поступление без экзаменов) можно использовать строго один раз — в один выбранный университет на одну конкретную образовательную программу.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">Правило 75 баллов</h4>
            <p>
              Для перечневых олимпиад диплом необходимо подтвердить сдачей соответствующего предмета ЕГЭ минимум на 75 баллов (вузы имеют право повысить планку до 80–85 баллов).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">100 баллов за предмет</h4>
            <p>
              Если программа не предоставляет БВИ по вашей олимпиаде, вы имеете право зачесть диплом как 100 баллов за профильный вступительный экзамен в любые 5 вузов.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
