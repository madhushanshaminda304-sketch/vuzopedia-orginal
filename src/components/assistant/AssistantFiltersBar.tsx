import React from 'react';
import { Database } from 'lucide-react';
import { SpecialistMode, RAGScopeFilter } from '../../services/assistant';

interface AssistantFiltersBarProps {
  activeMode: SpecialistMode;
  activeScope: RAGScopeFilter;
  onSelectMode: (mode: SpecialistMode) => void;
  onSelectScope: (scope: RAGScopeFilter) => void;
}

export const AssistantFiltersBar: React.FC<AssistantFiltersBarProps> = ({
  activeMode,
  activeScope,
  onSelectMode,
  onSelectScope,
}) => {
  return (
    <>
      {/* Specialist Mode Switcher Bar */}
      <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <span className="text-slate-400 font-bold shrink-0 text-[10px] uppercase tracking-wider mr-1">
          Режим:
        </span>
        {[
          { id: 'all', icon: '🧙‍♂️', label: 'Дед Вузопед' },
          { id: 'calculator', icon: '🎯', label: 'Калькулятор шансов' },
          { id: 'military', icon: '🛡️', label: 'Военная кафедра' },
          { id: 'finance', icon: '💰', label: 'Кредит 3% и бюджет' },
          { id: 'olympiads', icon: '🏆', label: 'Олимпиады и БВИ' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id as SpecialistMode)}
            className={`px-2.5 py-1 rounded-full shrink-0 font-medium transition flex items-center gap-1.5 ${
              activeMode === mode.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* RAG Scope Filter Bar */}
      <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
        <span className="text-slate-400 font-semibold shrink-0 uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3 text-blue-500" />
          <span>RAG Фильтр базы:</span>
        </span>
        {[
          { id: 'all', label: '🌐 Все вузы РФ' },
          { id: 'moscow', label: '📍 Москва' },
          { id: 'spb', label: '🏛️ Санкт-Петербург' },
          { id: 'it', label: '💻 IT и Инженерия' },
          { id: 'military', label: '🛡️ Только с ВУЦ' },
          { id: 'olympiads', label: '🏆 Олимпиады БВИ' },
        ].map((scope) => (
          <button
            key={scope.id}
            onClick={() => onSelectScope(scope.id as RAGScopeFilter)}
            className={`px-2 py-0.5 rounded-md shrink-0 font-semibold transition ${
              activeScope === scope.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {scope.label}
          </button>
        ))}
      </div>
    </>
  );
};
