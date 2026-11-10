import React, { useState } from 'react';
import {
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Search,
  Globe,
  Award,
  BookOpen,
} from 'lucide-react';
import { REMOTE_PROGRAMS } from '../data/mockData';

export const RemoteEducationView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = REMOTE_PROGRAMS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.universityShort.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Laptop className="w-4 h-4" />
          Онлайн и дистанционное высшее образование
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Дистанционное обучение в ведущих вузах России
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Получите полноценный государственный диплом престижного университета без необходимости переезда в Москву или Санкт-Петербург. 100% онлайн-формат с дистанционной защитой диплома.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <Award className="w-6 h-6 text-brand-600 mb-2" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Государственный диплом
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            В дипломе не указывается форма обучения (дистанционная). Вы получаете такой же диплом бакалавра, как и очные студенты.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <Laptop className="w-6 h-6 text-brand-600 mb-2" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Сессии и экзамены онлайн
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Сдача зачетов и экзаменов через аккредитованные прокторинговые системы с биометрической идентификацией.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <Globe className="w-6 h-6 text-brand-600 mb-2" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Совмещение с работой
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Гибкий график лекций и практических вебинаров по вечерам или в записи из любой точки мира.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft mb-8">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск онлайн-программы (Информатика, Менеджмент, Юриспруденция)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((prog) => (
          <div
            key={prog.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-elevated transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  {prog.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {prog.universityShort}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3">
                {prog.title}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{prog.diplomaType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Срок обучения: 4 года (Бакалавриат)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Онлайн-прокторинг экзаменов</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Стоимость обучения</span>
                <span className="font-black text-brand-600 dark:text-brand-400 text-sm">
                  {prog.annualFee.toLocaleString()} ₽ / год
                </span>
              </div>
              <button className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition">
                Подать заявку
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
