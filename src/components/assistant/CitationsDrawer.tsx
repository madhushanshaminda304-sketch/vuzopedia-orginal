import React from 'react';
import { BookOpen, X, ExternalLink } from 'lucide-react';
import { RetrievedCitationChunk } from '../../services/assistant';
import { University } from '../../types';
import { UNIVERSITIES } from '../../data/mockData';

interface CitationsDrawerProps {
  inspectedCitations: { chunks: RetrievedCitationChunk[] } | null;
  onClose: () => void;
  onSelectUniversity?: (vuz: University) => void;
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'university':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
    case 'military':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    case 'dorm':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
    case 'olympiad':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
    case 'credit':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
  }
}

export const CitationsDrawer: React.FC<CitationsDrawerProps> = ({
  inspectedCitations,
  onClose,
  onSelectUniversity,
}) => {
  if (!inspectedCitations) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Drawer Header */}
        <div className="p-4 px-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="font-extrabold text-sm text-white">
                Справочные материалы локальной базы данных
              </h4>
              <p className="text-[11px] text-slate-300">
                Карточки вузов и справочники приёма Вузопедии
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-extrabold">
              Локальный каталог
            </span>
            <button
              data-testid="close-citations-modal"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
          {inspectedCitations.chunks.map((chunk, cIdx) => {
            const colorClass = getCategoryBadgeClass(chunk.category);
            const vuzObj = chunk.vuzId ? UNIVERSITIES.find((u) => u.id === chunk.vuzId) : null;

            return (
              <div
                key={chunk.id || cIdx}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                      {chunk.source}
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      {chunk.title}
                    </h5>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold shrink-0 ${colorClass}`}
                  >
                    {chunk.categoryLabel || 'Справочный материал'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {chunk.snippet}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1">
                    {chunk.metadata?.tags?.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {vuzObj && onSelectUniversity && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectUniversity(vuzObj);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-blue-700 hover:text-white dark:text-blue-300 dark:hover:text-white font-bold text-[10px] transition flex items-center gap-1"
                    >
                      <span>Карточка вуза</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Сведения приведены из локального каталога Вузопедии для ознакомления
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
