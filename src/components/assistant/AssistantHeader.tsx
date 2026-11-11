import React from 'react';
import {
  Sparkles,
  Database,
  History,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';

interface AssistantHeaderProps {
  isAiAvailable: boolean;
  sessionsCount: number;
  isHistoryOpen: boolean;
  isFullscreen: boolean;
  onToggleHistory: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  isAiAvailable,
  sessionsCount,
  isFullscreen,
  onToggleHistory,
  onOpenSettings,
  onRestart,
  onToggleFullscreen,
  onClose,
}) => {
  return (
    <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/25">
            🧙‍♂️
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Дед Вузопед
            </h3>
            {isAiAvailable ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                Режим: Google Gemini
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <Database className="w-3 h-3 text-blue-300" />
                Режим: Локальный каталог
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300">
            {isAiAvailable
              ? 'Защищенный серверный API • Каталог вузов и правила приёма 2026'
              : 'Автономный режим • Локальный каталог вузов и правила приёма 2026'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {/* Sessions History button */}
        <button
          onClick={onToggleHistory}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition relative"
          title="История консультаций"
        >
          <History className="w-4 h-4" />
          {sessionsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900" />
          )}
        </button>

        {/* Security & Server Status button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          title="Безопасность и серверный статус"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          title="Новый диалог"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition hidden sm:flex"
          title={isFullscreen ? 'Свернуть окно' : 'На весь экран'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        {/* Close modal */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition ml-1"
          title="Закрыть консультанта"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
