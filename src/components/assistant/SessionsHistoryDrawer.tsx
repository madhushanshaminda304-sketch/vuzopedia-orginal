import React from 'react';
import { History, X, Plus, Trash2 } from 'lucide-react';
import { ChatSession } from '../../services/assistant';

interface SessionsHistoryDrawerProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string;
  onClose: () => void;
  onCreateNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionsHistoryDrawer: React.FC<SessionsHistoryDrawerProps> = ({
  isOpen,
  sessions,
  currentSessionId,
  onClose,
  onCreateNewSession,
  onSwitchSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slideRight">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-white/10">
        <span className="font-extrabold text-xs flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          История консультаций ({sessions.length})
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onCreateNewSession}
          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Новый диалог</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Сохранённых диалогов пока нет. Задайте любой вопрос Деду Вузопеду!
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSwitchSession(s.id)}
              className={`p-2.5 rounded-xl text-xs cursor-pointer transition flex items-center justify-between group ${
                s.id === currentSessionId
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="truncate flex-1 pr-2">
                <span className="block truncate">{s.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {s.updatedAt} • {s.messages.length} сообщ.
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition"
                title="Удалить диалог"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
