import React from 'react';
import { Key, CheckCircle2 } from 'lucide-react';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  activeKey: string;
  isCustomKey: boolean;
  apiKeyInput: string;
  apiKeyStatusMessage: string | null;
  onApiKeyInputChange: (value: string) => void;
  onSave: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  activeKey,
  isCustomKey,
  apiKeyInput,
  apiKeyStatusMessage,
  onApiKeyInputChange,
  onSave,
  onReset,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 animate-fadeIn text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-brand-600" />
          Настройки Gemini API Key
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✕
        </button>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
        Активный ключ:{' '}
        <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-mono">
          {activeKey ? `${activeKey.slice(0, 8)}...${activeKey.slice(-6)}` : 'Не настроен'}
        </code>{' '}
        {isCustomKey ? '(Пользовательский)' : '(Ключ проекта по умолчанию)'}
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => onApiKeyInputChange(e.target.value)}
          placeholder="Вставьте свой Gemini API ключ..."
          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
        />
        <button
          onClick={onSave}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
        >
          Сохранить
        </button>
        {isCustomKey && (
          <button
            onClick={onReset}
            className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            Сбросить
          </button>
        )}
      </div>
      {apiKeyStatusMessage && (
        <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {apiKeyStatusMessage}
        </p>
      )}
    </div>
  );
};
