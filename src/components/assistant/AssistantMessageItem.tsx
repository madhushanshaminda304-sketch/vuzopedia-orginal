import { ProgrammeGuidancePanel } from './ProgrammeGuidancePanel';
import React from 'react';
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  FileText,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import {
  AssistantMessage,
  AdmissionArtifact,
  RetrievedCitationChunk,
  AppAssistantAction,
  resolveAction,
} from '../../services/assistant';
import { University } from '../../types';
import { AssistantTextRenderer } from './AssistantTextRenderer';

interface AssistantMessageItemProps {
  message: AssistantMessage;
  isToolExpanded: boolean;
  isReasoningExpanded: boolean;
  isCopied: boolean;
  isSpeaking: boolean;
  onToggleTool: () => void;
  onToggleReasoning: () => void;
  onSpeak: () => void;
  onCopy: () => void;
  onFeedback: (type: 'like' | 'dislike') => void;
  onSendPrompt: (prompt: string) => void;
  onNavigateTab: (tab: string) => void;
  onExecuteAction?: (action: AppAssistantAction) => void;
  onOpenArtifact: (artifact: AdmissionArtifact) => void;
  onInspectCitations: (chunks: RetrievedCitationChunk[], focusChunkId?: string) => void;
  onSelectUniversity?: (vuz: University) => void;
  onCloseModal?: () => void;
}

export const AssistantMessageItem: React.FC<AssistantMessageItemProps> = ({
  message: m,
  isToolExpanded,
  isReasoningExpanded,
  isCopied,
  isSpeaking,
  onToggleTool,
  onToggleReasoning,
  onSpeak,
  onCopy,
  onFeedback,
  onSendPrompt,
  onNavigateTab,
  onExecuteAction,
  onOpenArtifact,
  onInspectCitations,
  onSelectUniversity,
  onCloseModal,
}) => {
  const guide = m.response?.guidance;
  const isUser = m.sender === 'user';

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm shrink-0 shadow-sm mt-1">
          🧙‍♂️
        </div>
      )}

      <div className="space-y-2 max-w-[92%] sm:max-w-[85%]">
        {/* Tool Call Component */}
        {m.toolCall && !guide && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-xs transition">
            <button
              onClick={onToggleTool}
              className="w-full px-3 py-2 flex items-center justify-between bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold truncate">
                <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">{m.toolCall.name}</span>
                {m.toolCall.duration && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {m.toolCall.duration}
                  </span>
                )}
              </div>
              {isToolExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isToolExpanded && (
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                  <span>ПАРАМЕТРЫ ЗАПРОСА:</span>
                </div>
                <p className="font-mono bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                  {m.toolCall.query}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reasoning Trace Accordion */}
        {m.reasoningTrace && m.reasoningTrace.length > 0 && (
          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs overflow-hidden transition">
            <button
              onClick={onToggleReasoning}
              className="w-full px-3 py-1.5 flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <span>🧠</span>
                <span>Этапы обработки запроса ({m.reasoningTrace.length})</span>
              </span>
              {isReasoningExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {isReasoningExpanded && (
              <div className="p-3 bg-white/70 dark:bg-slate-900/70 border-t border-indigo-100 dark:border-indigo-900/50 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                {m.reasoningTrace.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Message Bubble */}
        <div
          data-testid={isUser ? 'user-message' : 'assistant-message'}
          className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm leading-relaxed shadow-sm transition ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{m.text}</p>
          ) : (
            <div className="space-y-1">
              {/* Response Source Badge */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[10px]">
                {m.modelUsed === 'gemini' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span>🤖</span>
                    <span>Ответ сгенерирован Google Gemini</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <span>📖</span>
                    <span>{guide ? (guide.state.language === 'en' ? 'Programme adviser' : 'Подбор направления') : 'Данные локального каталога'}</span>
                  </span>
                )}
              </div>

              {/* Extracted Query Filter Tags */}
              {m.extractedFilters &&
                (m.extractedFilters.score ||
                  m.extractedFilters.city ||
                  m.extractedFilters.direction ||
                  m.extractedFilters.wantsMilitary ||
                  m.extractedFilters.wantsDorm) && (
                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 mb-2.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-400">Параметры поиска:</span>
                    {m.extractedFilters.score && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
                        🎯 {m.extractedFilters.score} б.
                      </span>
                    )}
                    {m.extractedFilters.city && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        📍 {m.extractedFilters.city}
                      </span>
                    )}
                    {m.extractedFilters.direction && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-900">
                        💻 {m.extractedFilters.direction}
                      </span>
                    )}
                    {m.extractedFilters.wantsMilitary && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900">
                        🛡️ ВУЦ
                      </span>
                    )}
                    {m.extractedFilters.wantsDorm && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-900">
                        🏠 Общежитие
                      </span>
                    )}
                  </div>
                )}

              {/* Message Body Content */}
              <AssistantTextRenderer
                content={m.text}
                onSelectUniversity={onSelectUniversity}
                onInspectChunk={(chunkId) => {
                  if (m.citationChunks && m.citationChunks.length > 0) {
                    onInspectCitations(m.citationChunks, chunkId);
                  }
                }}
                onClose={onCloseModal}
              />
              {guide && <ProgrammeGuidancePanel guide={guide} onSelectUniversity={onSelectUniversity} onClose={onCloseModal} />}
              {!m.response && m.id.startsWith('ded-stream-') && !m.toolCall?.duration && m.text && (
                <span className="inline-block w-1.5 h-3.5 bg-blue-500 animate-pulse ml-1 align-middle" />
              )}

              {/* AI disclaimer note */}
              {m.modelUsed === 'gemini' && (
                <p className="text-[10px] text-slate-400 italic pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  ℹ️ Ответ сгенерирован нейросетью на основе запроса и справочных данных каталога. Точные условия приёма и конкурсные списки проверяйте в приёмной комиссии вуза.
                </p>
              )}

              {/* Clarification Options */}
              {m.clarificationOptions && m.clarificationOptions.length > 0 && (
                <div className="space-y-2 my-2.5 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 animate-fadeIn">
                  <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <span>💡</span>
                    <span>{guide ? (guide.state.language === 'en' ? 'Choose an option or type your answer' : 'Выберите вариант или напишите ответ') : 'Выберите подходящий сценарий для точного расчёта:'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.clarificationOptions.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => onSendPrompt(opt.prompt)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 hover:border-blue-400 hover:shadow-xs transition text-left group flex items-start gap-2"
                      >
                        <span className="text-base shrink-0 group-hover:scale-110 transition">
                          {opt.icon || '🎯'}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition leading-snug">
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {!guide && opt.prompt}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualitative Admission Probability Card */}
              {m.probability && (
                <div className="rounded-2xl p-3.5 bg-gradient-to-br from-slate-900 to-blue-950 text-white border border-blue-500/30 shadow-md my-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-blue-200">
                      <span>📊</span>
                      <span>Сопоставление с баллами прошлых лет:</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        m.probability.level === 'high'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : m.probability.level === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {m.probability.level === 'high'
                        ? 'Комфортный балл'
                        : m.probability.level === 'medium'
                        ? 'Плотная конкуренция'
                        : 'Высокий порог'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{m.probability.label}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                    {m.probability.description}
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center gap-1">
                    <span>ℹ️</span>
                    <span>Сравнение со средним минимальным проходным баллом прошлых лет. Не является гарантией зачисления в 2026 году.</span>
                  </div>
                </div>
              )}

              {/* Citation Sources Button */}
              {m.citationChunks && m.citationChunks.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onInspectCitations(m.citationChunks!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-semibold transition border border-slate-200 dark:border-slate-700 shadow-2xs group"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition" />
                    <span>Использованные материалы каталога ({m.citationChunks.length})</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                      Локальная база
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Contextual Action Button */}
          {(m.action || m.actionTab) && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              {m.canExecute === false ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled
                    title={m.disabledReason ? `Действие недоступно: ${m.disabledReason}` : 'Действие недоступно'}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
                  >
                    <span>{m.actionLabel || 'Действие недоступно'}</span>
                  </button>
                  {m.disabledReason && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                      ({m.disabledReason})
                    </span>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (m.action && onExecuteAction) {
                      onExecuteAction(m.action);
                    } else if (m.actionTab) {
                      const resolved = resolveAction(m.actionTab);
                      if (onExecuteAction && resolved?.action) {
                        onExecuteAction(resolved.action);
                      } else if (resolved?.tabId) {
                        onNavigateTab(resolved.tabId);
                        if (onCloseModal) onCloseModal();
                      } else {
                        onNavigateTab(m.actionTab);
                        if (onCloseModal) onCloseModal();
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md hover:scale-105 transform"
                >
                  <span>{m.actionLabel || 'Перейти в раздел'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recommended University Cards */}
        {m.matchedUniversities && m.matchedUniversities.length > 0 && (
          <div className="space-y-2 pt-1 animate-fadeIn">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>🏛️ Рекомендованные вузы из базы:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {m.matchedUniversities.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition">
                        {u.shortName}
                      </h5>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] shrink-0">
                        #{u.ratingRank}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2 truncate">
                      {u.city}
                      {u.metro ? ` • м. ${u.metro}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-1 text-[10px] mb-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                        от {u.minBudgetScore} б.
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {u.totalBudgetPlaces} мест
                      </span>
                      {u.hasMilitaryDept && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                          🛡️ ВУЦ
                        </span>
                      )}
                    </div>
                  </div>
                  {onSelectUniversity && (
                    <button
                      onClick={() => {
                        onSelectUniversity(u);
                        if (onCloseModal) onCloseModal();
                      }}
                      className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white font-bold text-[11px] transition text-center flex items-center justify-center gap-1"
                    >
                      <span>Подробнее о вузе</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relevant Academic Programmes */}
        {m.response?.matchedPrograms && m.response.matchedPrograms.length > 0 && (
          <div className="space-y-1.5 pt-1 animate-fadeIn">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>📚 Релевантные программы направления:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {m.response.matchedPrograms.slice(0, 4).map((prog) => (
                <div
                  key={prog.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {prog.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      от {prog.minBudgetScore} б.
                    </span>
                  </div>
                  <h6 className="font-bold text-[11px] text-slate-900 dark:text-white line-clamp-1">
                    {prog.name}
                  </h6>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {prog.universityShort} • {prog.budgetPlaces} мест
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clearly Labelled Alternatives when exact criteria yielded no matches */}
        {m.response?.alternatives && m.response.alternatives.length > 0 && (
          <div className="space-y-2 pt-1 animate-fadeIn">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>💡 Доступные альтернативные варианты:</span>
            </div>
            <div className="space-y-2">
              {m.response.alternatives.map((alt, aIdx) => (
                <div
                  key={aIdx}
                  className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs space-y-2"
                >
                  <div>
                    <h6 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      {alt.title}
                    </h6>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      {alt.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {alt.universities.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          if (onSelectUniversity) onSelectUniversity(u);
                          if (onCloseModal) onCloseModal();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[10px] hover:border-amber-400 transition"
                      >
                        🏛️ {u.shortName} (от {u.minBudgetScore} б.)
                      </button>
                    ))}
                  </div>
                  {alt.actionTab && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const resolved = resolveAction(alt.actionTab!);
                          if (onExecuteAction && resolved?.action) {
                            onExecuteAction(resolved.action);
                          } else if (resolved?.tabId) {
                            onNavigateTab(resolved.tabId);
                            if (onCloseModal) onCloseModal();
                          } else {
                            onNavigateTab(alt.actionTab!);
                            if (onCloseModal) onCloseModal();
                          }
                        }}
                        className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <span>{alt.actionLabel || 'Смотреть варианты'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Admission Artifact Canvas Trigger */}
        {m.artifact && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800/90 dark:via-indigo-950/40 dark:to-slate-800/90 border border-blue-200/80 dark:border-indigo-800/60 shadow-xs flex items-center justify-between gap-3 animate-fadeIn my-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  Интерактивный артефакт
                </span>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  {m.artifact.title}
                </h5>
              </div>
            </div>
            <button
              onClick={() => onOpenArtifact(m.artifact!)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <span>Открыть холст</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Assistant Message Toolbar */}
        {!isUser && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span>{m.timestamp}</span>
              {m.modelUsed === 'gemini' ? (
                <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                  Gemini AI
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                  База знаний
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Voice TTS narration button */}
              <button
                onClick={onSpeak}
                className={`p-1 rounded-md transition ${
                  isSpeaking
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 animate-pulse'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title={isSpeaking ? 'Остановить озвучку' : 'Озвучить ответ Деда'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Copy button */}
              <button
                onClick={onCopy}
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                title="Скопировать ответ"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Thumbs up */}
              <button
                onClick={() => onFeedback('like')}
                className={`p-1 rounded-md transition ${
                  m.feedback === 'like'
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Полезный ответ"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs down */}
              <button
                onClick={() => onFeedback('dislike')}
                className={`p-1 rounded-md transition ${
                  m.feedback === 'dislike'
                    ? 'text-red-500 bg-red-50 dark:bg-red-950/50'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Неточный ответ"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Follow-up Suggestions */}
        {m.followUps && m.followUps.length > 0 && (
          <div className="pt-2 animate-fadeIn">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Рекомендуемые уточняющие вопросы:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.followUps.map((fu, fIdx) => (
                <button
                  key={fIdx}
                  onClick={() => onSendPrompt(fu)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 text-xs font-medium transition hover:border-blue-400 shadow-2xs text-left"
                >
                  <span>{fu}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

