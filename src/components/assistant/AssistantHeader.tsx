import React, { useState } from 'react';
import {
  Sparkles,
  Database,
  History,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  User,
  Globe,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, getDictionary } from '../../services/assistant';

interface AssistantHeaderProps {
  isAiAvailable: boolean;
  sessionsCount: number;
  isHistoryOpen: boolean;
  isFullscreen: boolean;
  profileBadgeCount?: number;
  language?: SupportedLanguage;
  onSelectLanguage?: (lang: SupportedLanguage) => void;
  onOpenProfile?: () => void;
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
  profileBadgeCount,
  language = 'ru',
  onSelectLanguage,
  onOpenProfile,
  onToggleHistory,
  onOpenSettings,
  onRestart,
  onToggleFullscreen,
  onClose,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const dict = getDictionary(language);
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

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
              {dict.assistantName}
            </h3>
            {isAiAvailable ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                {dict.modeAi}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <Database className="w-3 h-3 text-blue-300" />
                {dict.modeLocal}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300">
            {isAiAvailable ? dict.assistantSubtitle : dict.assistantSubtitleLocal}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {/* Language Selector Dropdown */}
        {onSelectLanguage && (
          <div className="relative">
            <button
              type="button"
              data-testid="language-select-btn"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-1.5 px-2 rounded-xl text-white/90 hover:text-white bg-white/10 hover:bg-white/20 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Выбор языка интерфейса / Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <span>{currentLangObj.flag} {currentLangObj.code.toUpperCase()}</span>
            </button>

            {isLangMenuOpen && (
              <div
                data-testid="language-dropdown-menu"
                className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    data-testid={`lang-option-${lang.code}`}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      language === lang.code
                        ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{lang.flag} {lang.nativeName}</span>
                    {language === lang.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Profile button */}
        {onOpenProfile && (
          <button
            data-testid="open-student-profile-btn"
            onClick={onOpenProfile}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition relative"
            title={dict.myProfile}
          >
            <User className="w-4 h-4 text-amber-300" />
            {profileBadgeCount && profileBadgeCount > 0 ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
            ) : null}
          </button>
        )}

        {/* Sessions History button */}
        <button
          onClick={onToggleHistory}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition relative"
          title={dict.consultationHistory}
        >
          <History className="w-4 h-4" />
          {sessionsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900" />
          )}
        </button>

        {/* Security & Server Status button */}
        <button
          data-testid="server-status-btn"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          title={dict.serverStatus}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          title={dict.newChat}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition hidden sm:flex"
          title={isFullscreen ? dict.exitFullscreen : dict.fullscreen}
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
          title={dict.close}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
