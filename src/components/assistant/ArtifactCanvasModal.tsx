import React from 'react';
import { FileText, X, CheckSquare, ListTodo, Copy } from 'lucide-react';
import { AdmissionArtifact } from '../../services/assistant';
import { AssistantTextRenderer } from './AssistantTextRenderer';
import { University } from '../../types';

interface ArtifactCanvasModalProps {
  artifact: AdmissionArtifact | null;
  onClose: () => void;
  onToggleChecklistItem: (itemId: string) => void;
  onSelectUniversity?: (vuz: University) => void;
}

export const ArtifactCanvasModal: React.FC<ArtifactCanvasModalProps> = ({
  artifact,
  onClose,
  onToggleChecklistItem,
  onSelectUniversity,
}) => {
  if (!artifact) return null;

  const checkedCount = artifact.checklistItems?.filter((i) => i.checked).length || 0;
  const totalCount = artifact.checklistItems?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div
        data-testid="artifact-canvas-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slideUp"
      >
        {/* Canvas Header */}
        <div className="p-4 px-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-white">{artifact.title}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Интерактивный холст
                </span>
              </div>
              <p className="text-[11px] text-slate-300">{artifact.summary}</p>
            </div>
          </div>

          <button
            data-testid="close-artifact-canvas"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
            title="Закрыть холст"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
          {/* Checklist Section */}
          {artifact.checklistItems && artifact.checklistItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Готовность к поступлению
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {checkedCount} из {totalCount} выполнено ({progressPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-1.5 pt-1">
                {artifact.checklistItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <input
                      data-testid="artifact-checkbox"
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleChecklistItem(item.id)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="flex-1 text-xs">
                      <span
                        className={`font-semibold ${
                          item.checked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.deadline && (
                        <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                          Срок: {item.deadline}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Steps Section */}
          {artifact.steps && artifact.steps.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-blue-500" />
                Ключевые этапы стратегии
              </h5>
              <div className="space-y-2.5">
                {artifact.steps.map((step) => (
                  <div key={step.stepNumber} className="flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {step.title}
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Markdown Advice Box */}
          {artifact.markdownContent && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
              <AssistantTextRenderer
                content={artifact.markdownContent}
                onSelectUniversity={onSelectUniversity}
                onClose={onClose}
              />
            </div>
          )}
        </div>

        {/* Canvas Footer */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              const text =
                `${artifact.title}\n\n${artifact.summary}\n\nЧек-лист:\n` +
                (artifact.checklistItems
                  ?.map((i) => `[${i.checked ? 'X' : ' '}] ${i.label} (${i.deadline || ''})`)
                  .join('\n') || '');
              navigator.clipboard.writeText(text);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-600 transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Скопировать план</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
