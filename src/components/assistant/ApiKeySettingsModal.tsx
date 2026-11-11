import React from 'react';
import { ShieldCheck, Server, AlertTriangle, RefreshCw, Database, Sparkles } from 'lucide-react';
import { ServerAssistantStatus } from '../../services/assistant';

interface AssistantServerStatusModalProps {
  isOpen: boolean;
  status: ServerAssistantStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export const ApiKeySettingsModal: React.FC<AssistantServerStatusModalProps> = ({
  isOpen,
  status,
  isLoading,
  onRefresh,
  onClose,
}) => {
  if (!isOpen) return null;

  const isServerAiActive = status?.aiAvailable === true;

  return (
    <div className="px-5 py-4 bg-slate-100 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 animate-fadeIn text-xs shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <span className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Безопасность и серверный статус AI
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
            title="Обновить статус"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        {/* Status card */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-2 mb-1.5">
            {isServerAiActive ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            )}
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {isServerAiActive ? 'Серверный AI активен' : 'Локальный каталог (офлайн)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {status?.reason || (isServerAiActive
              ? 'Эндпоинт /api/assistant/chat защищен. Ключи изолированы на сервере.'
              : 'Серверный ключ не настроен. Ассистент работает автономно по локальной базе.')}
          </p>
        </div>

        {/* Protection card */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-1.5 mb-1 text-slate-700 dark:text-slate-300 font-bold text-xs">
            <Server className="w-3.5 h-3.5 text-blue-500" />
            Лимиты и защита от абуза
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
            <div>• <strong>15 RPM:</strong> ограничение частоты на IP</div>
            <div>• <strong>2 потока:</strong> защита параллелизма</div>
            <div>• <strong>Бюджет $0:</strong> Free Tier (без биллинга)</div>
          </div>
        </div>
      </div>

      {/* Daily limit meter if available */}
      {status?.dailyLimit && (
        <div className="mb-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <div className="flex justify-between items-center text-[11px] font-semibold text-blue-900 dark:text-blue-300 mb-1">
            <span>Суточный отсекатель нагрузки (Daily Cutoff):</span>
            <span>{status.dailyUsage ?? 0} / {status.dailyLimit}</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round(((status.dailyUsage ?? 0) / status.dailyLimit) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Security notice */}
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
        🔒 <strong>Политика безопасности:</strong> Клиентский бандл и браузер не содержат API-ключей. При исчерпании лимитов или сбоях сети ассистент автоматически и безопасно переключается на локальный поиск по каталогу.
      </p>
    </div>
  );
};
