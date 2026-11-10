import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  ShieldAlert,
  FileText,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { BLACKLIST_UNIVERSITIES } from '../data/mockData';

export const BlacklistView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return BLACKLIST_UNIVERSITIES.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.consequences.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-4 h-4" />
          Реестр Рособрнадзора
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Чёрный список вузов 2026: проверка лицензий и аккредитаций
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          База данных учебных заведений, лишённых государственной аккредитации, лицензии или попавших под реорганизацию. Проверьте ваш вуз перед подачей документов!
        </p>
      </div>

      {/* Critical Warning Box */}
      <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 mb-8 space-y-4">
        <div className="flex items-center gap-3 text-rose-900 dark:text-rose-200">
          <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0" />
          <h3 className="text-base sm:text-lg font-bold">
            Чем опасна учеба в вузе без государственной аккредитации?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-rose-800 dark:text-rose-300">
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/30">
            <span className="font-bold block mb-1">❌ Нет отсрочки от армии</span>
            Студенты вузов без аккредитации подлежат призыву на военную службу на общих основаниях прямо во время семестра.
          </div>
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/30">
            <span className="font-bold block mb-1">❌ Диплом не гос. образца</span>
            Выдается диплом собственного образца. С ним невозможно поступить на госслужбу или в государственную магистратуру.
          </div>
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/30">
            <span className="font-bold block mb-1">❌ Нет маткапитала и вычетов</span>
            Государство запрещает оплачивать обучение средствами материнского капитала в неаккредитованных заведениях.
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft mb-8 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Проверьте вуз по названию или городу..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: 'Все проблемные вузы' },
            { id: 'revoked', label: 'Отозвана лицензия' },
            { id: 'no_accreditation', label: 'Лишен аккредитации' },
            { id: 'suspended', label: 'Приостановлена' },
            { id: 'reorganized', label: 'Реорганизован' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setStatusFilter(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === btn.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Entries */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400">{item.city}</span>
              <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 self-start">
                {item.statusLabel}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {item.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Последствия для студентов:</strong> {item.consequences}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <FileText className="w-3.5 h-3.5" /> {item.officialDocNumber}
              </span>
              <span>Решение от: {item.decisionDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
