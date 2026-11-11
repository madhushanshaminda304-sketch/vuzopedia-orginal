import React, { useEffect, useRef } from 'react';
import { BookOpen, X, ExternalLink, ShieldCheck, AlertCircle, Calendar, Building2, Link as LinkIcon } from 'lucide-react';
import { RetrievedCitationChunk } from '../../services/assistant';
import { University } from '../../types';
import { UNIVERSITIES } from '../../data/mockData';

interface CitationsDrawerProps {
  inspectedCitations: { chunks: RetrievedCitationChunk[]; focusChunkId?: string } | null;
  onClose: () => void;
  onSelectUniversity?: (vuz: University) => void;
}

export function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'university':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
    case 'program':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inspectedCitations?.focusChunkId && containerRef.current) {
      const targetEl = containerRef.current.querySelector(
        `[data-chunk-id="${inspectedCitations.focusChunkId}"]`
      );
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [inspectedCitations]);

  if (!inspectedCitations) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Drawer Header */}
        <div className="p-4 px-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Источники данных и верификация</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                  {inspectedCitations.chunks.length} записей
                </span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Справочные материалы локальной базы данных: официальные регламенты и статистика зачисления
              </p>
            </div>
          </div>

          <button
            data-testid="close-citations-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Guidance Notice (Requirement 10: Citation validation != proof of 2026 admission) */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40 px-4 py-2 text-[11px] text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            Привязка к источникам фиксирует происхождение записи в каталоге. Проходные баллы прошлых лет отражают историческую статистику конкурса и не являются гарантией зачисления в 2026 году.
          </span>
        </div>

        {/* Drawer Body with Provenance Details */}
        <div ref={containerRef} className="p-4 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
          {inspectedCitations.chunks.map((chunk, cIdx) => {
            const isFocused = inspectedCitations.focusChunkId === chunk.id;
            const colorClass = getCategoryBadgeClass(chunk.category);
            const vuzObj = chunk.vuzId ? UNIVERSITIES.find((u) => u.id === chunk.vuzId) : null;
            const isVerified = chunk.verificationStatus === 'verified';

            return (
              <div
                key={chunk.id || cIdx}
                data-chunk-id={chunk.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-xs space-y-2.5 ${
                  isFocused
                    ? 'border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-400'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header row: ID, Category & Verification Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        ID: {chunk.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${colorClass}`}>
                        {chunk.categoryLabel || chunk.category}
                      </span>
                      {chunk.isHistoricalCutoff && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 text-[10px] font-bold">
                          Исторические баллы (2025)
                        </span>
                      )}
                    </div>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-white pt-1">
                      {chunk.documentTitle || chunk.title}
                    </h5>
                  </div>

                  {/* Verification Status Badge */}
                  <div className="shrink-0">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-extrabold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Верифицировано</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Не верифицировано</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata details row: Publisher, Year, Checked Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Издатель: <strong className="text-slate-800 dark:text-slate-200">{chunk.publisher || 'Каталог Вузопедии'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Год: <strong className="text-slate-800 dark:text-slate-200">{chunk.applicableAdmissionsYear || 'Не указан'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">📅</span>
                    <span>
                      Проверка: <strong className="text-slate-800 dark:text-slate-200">{chunk.checkedDate || 'Не зафиксирована'}</strong>
                    </span>
                  </div>
                </div>

                {/* Excerpt / Content Body */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {chunk.excerpt || chunk.snippet}
                </div>

                {/* Structured Fields if present */}
                {chunk.structuredFields && Object.keys(chunk.structuredFields).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {Object.entries(chunk.structuredFields).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] border border-slate-200 dark:border-slate-700"
                      >
                        {k}: <strong className="text-slate-800 dark:text-slate-200">{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer action buttons: Real source URL link & University Card */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    {chunk.url ? (
                      <a
                        href={chunk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Открыть источник ({new URL(chunk.url).hostname})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        Официальный URL отсутствует в каталоге
                      </span>
                    )}
                  </div>

                  {vuzObj && onSelectUniversity && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectUniversity(vuzObj);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-blue-700 hover:text-white dark:text-blue-300 dark:hover:text-white font-bold text-[10px] transition flex items-center gap-1"
                    >
                      <span>Карточка {vuzObj.shortName}</span>
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
            Справочные сведения каталога Вузопедии и нормативно-правовых актов РФ
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
