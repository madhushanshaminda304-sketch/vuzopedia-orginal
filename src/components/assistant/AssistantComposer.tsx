import React from 'react';
import { Mic, MicOff, Wand2, Send, Square, AlertCircle, X } from 'lucide-react';
import { SupportedLanguage, getDictionary } from '../../services/assistant';

interface AssistantComposerProps {
  inputValue: string;
  isTyping: boolean;
  isDictating: boolean;
  isAiAvailable: boolean;
  language?: SupportedLanguage;
  speechNotice?: string | null;
  onInputChange: (val: string) => void;
  onSend: (text: string) => void;
  onStopGeneration?: () => void;
  onToggleDictation: () => void;
  onEnhancePrompt: () => void;
  onDismissSpeechNotice?: () => void;
}

const QUICK_QUESTIONS = [
  { icon: '📋', label: 'Чек-лист 2026', query: 'Составь пошаговый чек-лист и стратегию поступления на 2026 год' },
  { icon: '⚡', label: '275 б. (IT)', query: 'У меня 275 баллов, куда поступить на программную инженерию с военной кафедрой в Москве?' },
  { icon: '🎯', label: 'Шансы с 250 б.', query: 'У меня 250 баллов, куда я могу поступить на бюджет в Москве?' },
  { icon: '⚖️', label: 'Сравнить МГУ и ВШЭ', query: 'Сравни МГУ и ВШЭ' },
  { icon: '🛡️', label: 'ВУЦ и нормативы', query: 'В каких вузах Москвы есть ВУЦ и какие нормативы физподготовки?' },
  { icon: '💰', label: 'Кредит 3%', query: 'Как работает образовательный кредит с господдержкой 3%?' },
  { icon: '🏆', label: 'Олимпиады БВИ', query: 'Какие олимпиады дают БВИ без 75 баллов?' },
  { icon: '🏢', label: 'Общежития', query: 'Сколько стоит общежитие в Бауманке и МГУ?' },
];

export const AssistantComposer: React.FC<AssistantComposerProps> = ({
  inputValue,
  isTyping,
  isDictating,
  isAiAvailable,
  language = 'ru',
  speechNotice,
  onInputChange,
  onSend,
  onStopGeneration,
  onToggleDictation,
  onEnhancePrompt,
  onDismissSpeechNotice,
}) => {
  const dict = getDictionary(language);

  return (
    <>
      {/* Speech input unavailable / error notice */}
      {speechNotice && (
        <div
          data-testid="speech-notice-banner"
          className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-t border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">{speechNotice}</span>
          </div>
          {onDismissSpeechNotice && (
            <button
              type="button"
              data-testid="dismiss-speech-notice"
              onClick={onDismissSpeechNotice}
              className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition"
              title="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Quick Question Builder Toolbar */}
      <div className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Быстрый вопрос:</span>
        {QUICK_QUESTIONS.map((qp, qIdx) => (
          <button
            key={qIdx}
            onClick={() => onSend(qp.query)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-medium transition shrink-0 flex items-center gap-1 shadow-2xs"
          >
            <span>{qp.icon}</span>
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Composer Input Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          {/* Dictation voice button */}
          <button
            type="button"
            data-testid="dictation-btn"
            onClick={onToggleDictation}
            className={`p-3 rounded-2xl border transition shadow-sm ${
              isDictating
                ? 'bg-red-500 text-white border-red-500 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title={isDictating ? dict.stopDictation : dict.startDictation}
          >
            {isDictating ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Magic Prompt Enhancer Button */}
          <button
            type="button"
            onClick={onEnhancePrompt}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition shadow-xs"
            title={dict.enhancePrompt}
          >
            <Wand2 className="w-4 h-4" />
          </button>

          {/* Main Input Field */}
          <input
            type="text"
            autoFocus
            data-testid="ded-assistant-input"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend(inputValue)}
            placeholder={dict.inputPlaceholder}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {/* Send or Stop Button */}
          {isTyping ? (
            <button
              type="button"
              data-testid="ded-assistant-stop-btn"
              onClick={onStopGeneration}
              className="px-3.5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md shadow-red-500/20 flex items-center gap-1.5 text-xs animate-pulse"
              title={dict.stopGeneration}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">{dict.stopGeneration}</span>
            </button>
          ) : (
            <button
              onClick={() => onSend(inputValue)}
              disabled={!inputValue.trim()}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition shadow-md shadow-blue-500/20"
              title={`${dict.send} (Enter)`}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Нажмите Enter для отправки</span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${isAiAvailable ? 'bg-emerald-500' : 'bg-blue-400'}`} />
            <span>{isAiAvailable ? 'Google Gemini API • Режим консультанта' : 'Локальный каталог • Офлайн-режим'}</span>
          </span>
        </div>
      </div>
    </>
  );
};
