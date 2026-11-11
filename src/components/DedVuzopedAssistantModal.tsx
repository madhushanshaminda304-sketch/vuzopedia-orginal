import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Home,
  Trophy,
  CreditCard,
  Medal,
  Wallet,
  Calendar,
  BookOpen,
  Mic,
  MicOff,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
  Minimize2,
  Settings,
  ArrowDown,
  Bot,
  Key,
  CheckCircle2,
  AlertCircle,
  Flame,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  queryDedAssistant,
  getStoredApiKey,
  setStoredApiKey,
  resetStoredApiKey,
  DEFAULT_GEMINI_KEY,
  SpecialistMode,
  AdmissionProbability,
  ComparisonMatrix,
  ClarificationOption,
} from '../services/geminiService';
import { University } from '../types';
import { UNIVERSITIES } from '../data/mockData';

interface DedVuzopedAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectUniversity?: (vuz: University) => void;
}

interface ToolCall {
  name: string;
  query: string;
  duration: string;
  status: 'running' | 'complete' | 'error';
}

interface AssistantMessage {
  id: string;
  sender: 'ded' | 'user';
  text: string;
  timestamp: string;
  toolCall?: ToolCall;
  actionTab?: string;
  actionLabel?: string;
  suggestions?: string[];
  followUps?: string[];
  clarificationOptions?: ClarificationOption[];
  comparisonMatrix?: ComparisonMatrix;
  modelUsed?: 'gemini' | 'local';
  feedback?: 'like' | 'dislike' | null;
  matchedUniversities?: University[];
  reasoningTrace?: string[];
  probability?: AdmissionProbability;
}

export const DedVuzopedAssistantModal: React.FC<DedVuzopedAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectUniversity,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ded',
      text: 'Здравствуй, будущий студент! Я **Дед Вузопед** — твой персональный AI-консультант по приёмной кампании 2026 года на базе нейросети **Gemini 3.5 Flash**.\n\nЯ знаю всё о проходных баллах, общежитиях, военных кафедрах (ВУЦ), олимпиадах БВИ, льготном кредите 3% и доп. баллах к ЕГЭ. Спроси меня о любом вузе, сравни программы или укажи свои баллы для расчёта шансов!',
      timestamp: 'Только что',
      modelUsed: 'gemini',
      toolCall: {
        name: 'База знаний приемной кампании РФ 2026',
        query: 'Инициализация контекста: 1 200+ вузов, 11 предметов ЕГЭ, регламенты Минобрнауки',
        duration: '60ms',
        status: 'complete',
      },
      suggestions: [
        'Как оценить мои шансы по баллам ЕГЭ?',
        'Сравни МГУ и ВШЭ по направлению IT',
        'Какие лучшие IT-вузы в Москве и СПб?',
        'Где есть военная кафедра (ВУЦ)?',
      ],
      followUps: [
        'Как оценить мои шансы по баллам ЕГЭ?',
        'Сравни МГУ и ВШЭ по направлению IT',
        'Сколько баллов даёт золотая медаль и ГТО?',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [activeMode, setActiveMode] = useState<SpecialistMode>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [currentToolRunning, setCurrentToolRunning] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [expandedReasoningId, setExpandedReasoningId] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyStatusMessage, setApiKeyStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsDictating(false);
        };

        recognition.onerror = () => {
          setIsDictating(false);
        };

        recognition.onend = () => {
          setIsDictating(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }, []);

  // Handle voice recognition toggle
  const toggleDictation = () => {
    if (isDictating) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsDictating(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsDictating(true);
        } catch {
          // If already started or error, fallback to demo text
          setInputValue('Какие проходные баллы на IT в 2026 году?');
          setIsDictating(false);
        }
      } else {
        // Fallback simulation for unsupported environments
        setInputValue('Какие проходные баллы на IT в 2026 году?');
      }
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [isOpen, messages, isTyping]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isAtBottom);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const setFeedback = (id: string, type: 'like' | 'dislike') => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, feedback: msg.feedback === type ? null : type } : msg
      )
    );
  };

  const restartChat = () => {
    setMessages([
      {
        id: `msg-restart-${Date.now()}`,
        sender: 'ded',
        text: 'Диалог начат заново. Я готов ответить на любые вопросы о вузах, экзаменах и поступлении 2026 года!',
        timestamp: 'Только что',
        modelUsed: 'gemini',
        suggestions: [
          'Как рассчитать шансы по баллам ЕГЭ?',
          'Сравни МГУ и ВШЭ по направлению IT',
          'Какие вузы дают скидку до 70% на платном?',
          'Как подтвердить БВИ перечневой олимпиадой?',
        ],
        followUps: [
          'Как рассчитать шансы по баллам ЕГЭ?',
          'Сравни МГУ и ВШЭ по направлению IT',
          'Сколько стоит жизнь студента в Москве?',
        ],
      },
    ]);
  };

  // Send message to Gemini AI or Local Fallback
  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setCurrentToolRunning('Анализ запроса и сверка с базой данных Вузопедии');

    try {
      const response = await queryDedAssistant(
        text,
        messages.map((m) => ({ sender: m.sender, text: m.text })),
        activeMode
      );

      const dedMsg: AssistantMessage = {
        id: `ded-${Date.now()}`,
        sender: 'ded',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: response.toolCall,
        actionTab: response.actionTab,
        actionLabel: response.actionLabel,
        suggestions: response.suggestions,
        followUps: response.followUps,
        clarificationOptions: response.clarificationOptions,
        comparisonMatrix: response.comparisonMatrix,
        modelUsed: response.modelUsed,
        matchedUniversities: response.matchedUniversities,
        reasoningTrace: response.reasoningTrace,
        probability: response.probability,
      };

      setMessages((prev) => [...prev, dedMsg]);
    } catch (err) {
      console.error('Ded assistant error:', err);
      // Fallback message
      const errorMsg: AssistantMessage = {
        id: `ded-err-${Date.now()}`,
        sender: 'ded',
        text: 'Произошла непредвиденная ошибка связи, но наш Калькулятор ЕГЭ и база вузов работают в штатном режиме!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTab: 'calculator',
        actionLabel: 'Открыть Калькулятор ЕГЭ',
        suggestions: ['Как оценить шансы по баллам?'],
        modelUsed: 'local',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setCurrentToolRunning(null);
    }
  };

  // Helper to parse bold text AND inline clickable citations [vuz:id:Name]
  const renderTextWithCitations = (text: string) => {
    const regex = /(\[vuz:[a-z0-9_-]+:[^\]]+\]|\*\*[^*]+\*\*)/g;
    const tokens = text.split(regex);

    return tokens.map((token, tIdx) => {
      if (token.startsWith('[vuz:') && token.endsWith(']')) {
        const match = token.match(/^\[vuz:([a-z0-9_-]+):([^\]]+)\]$/);
        if (match) {
          const vuzId = match[1];
          const vuzName = match[2];
          const vuzObj = UNIVERSITIES.find((u) => u.id === vuzId);

          return (
            <button
              key={tIdx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (vuzObj && onSelectUniversity) {
                  onSelectUniversity(vuzObj);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/70 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs transition transform hover:scale-105 cursor-pointer border border-blue-200 dark:border-blue-800"
              title={`Открыть профиль ${vuzName}`}
            >
              <span>🏛️</span>
              <span>{vuzName}</span>
            </button>
          );
        }
      }

      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={tIdx} className="font-bold text-slate-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }

      return token;
    });
  };

  // Helper to render markdown-like formatting with Table Support & Inline Citations
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Detect Markdown Table
      if (line.trim().startsWith('|') && line.trim().endsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .split('|')
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => c.trim());

          const bodyLines = tableLines.slice(2);
          const rowCells = bodyLines.map((bLine) =>
            bLine
              .split('|')
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
              .map((c) => c.trim())
          );

          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                        {renderTextWithCitations(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {rowCells.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-3.5 py-2.5 ${
                            cIdx === 0
                              ? 'font-semibold text-slate-900 dark:text-white bg-slate-50/40 dark:bg-slate-900/40'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {renderTextWithCitations(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 2. Normal Line Parsing
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const isNumbered = /^\d+\.\s/.test(line.trim());
      const isHeader = line.trim().startsWith('###') || line.trim().startsWith('##');

      let cleanLine = line;
      if (isBullet) {
        cleanLine = line.replace(/^\s*[•\*\-]\s*/, '');
      } else if (isHeader) {
        cleanLine = line.replace(/^\s*#+\s*/, '');
      }

      const parsedContent = renderTextWithCitations(cleanLine);

      if (isHeader) {
        elements.push(
          <h4 key={i} className="font-extrabold text-sm text-slate-900 dark:text-white mt-3 mb-1">
            {parsedContent}
          </h4>
        );
      } else if (isBullet) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-1 my-0.5 text-xs sm:text-sm">
            <span className="text-blue-500 font-bold shrink-0">•</span>
            <span>{parsedContent}</span>
          </div>
        );
      } else if (isNumbered) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-1 my-0.5 text-xs sm:text-sm">
            <span>{parsedContent}</span>
          </div>
        );
      } else {
        elements.push(
          <p key={i} className={line.trim() === '' ? 'h-2' : 'my-0.5 text-xs sm:text-sm leading-relaxed'}>
            {parsedContent}
          </p>
        );
      }

      i++;
    }

    return elements;
  };

  const activeKey = getStoredApiKey();
  const isCustomKey = activeKey !== DEFAULT_GEMINI_KEY;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full max-w-full max-h-full rounded-none'
            : 'w-full max-w-3xl h-[88vh] max-h-[840px]'
        }`}
      >
        {/* Header (Astryx Chat Navigation Bar) */}
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
                  Дед Вузопед AI
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Gemini 3.5 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Эксперт приёмной кампании 2026 • Правила БВИ, ВУЦ, баллы ЕГЭ
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Settings button */}
            <button
              onClick={() => {
                setApiKeyInput(isCustomKey ? activeKey : '');
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Настройки Gemini API"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Restart button */}
            <button
              onClick={restartChat}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Очистить диалог"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition hidden sm:flex"
              title={isFullscreen ? 'Обычный режим' : 'На весь экран'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition"
              title="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Settings Drawer/Popover */}
        {isSettingsOpen && (
          <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 animate-fadeIn text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-brand-600" />
                Настройки Gemini API Key
              </span>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
              Активный ключ:{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-mono">
                {activeKey.slice(0, 8)}...{activeKey.slice(-6)}
              </code>{' '}
              {isCustomKey ? '(Пользовательский)' : '(Ключ проекта по умолчанию)'}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Вставьте свой Gemini API ключ..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
              />
              <button
                onClick={() => {
                  setStoredApiKey(apiKeyInput);
                  setApiKeyStatusMessage('Ключ сохранен!');
                  setTimeout(() => setApiKeyStatusMessage(null), 2500);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Сохранить
              </button>
              {isCustomKey && (
                <button
                  onClick={() => {
                    resetStoredApiKey();
                    setApiKeyInput('');
                    setApiKeyStatusMessage('Сброшено к ключу проекта!');
                    setTimeout(() => setApiKeyStatusMessage(null), 2500);
                  }}
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
        )}

        {/* Specialist Mode Switcher (Mixture of Agents / Specialist Teams from awesome-llm-apps) */}
        <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <span className="text-slate-400 font-bold shrink-0 text-[10px] uppercase tracking-wider mr-1">Режим:</span>
          {[
            { id: 'all', icon: '🧙‍♂️', label: 'Дед Вузопед' },
            { id: 'calculator', icon: '🎯', label: 'Калькулятор шансов' },
            { id: 'military', icon: '🛡️', label: 'Военная кафедра' },
            { id: 'finance', icon: '💰', label: 'Кредит 3% и бюджет' },
            { id: 'olympiads', icon: '🏆', label: 'Олимпиады и БВИ' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id as SpecialistMode);
                if (mode.id === 'calculator') setInputValue('У меня 260 баллов, куда я смогу поступить на бюджет?');
                else if (mode.id === 'military') setInputValue('В каких вузах Москвы есть ВУЦ и какие там нормативы?');
                else if (mode.id === 'finance') setInputValue('Как взять образовательный кредит под 3% в Сбере?');
                else if (mode.id === 'olympiads') setInputValue('Какие олимпиады дают БВИ без подтверждения 75 баллов?');
              }}
              className={`px-2.5 py-1 rounded-full shrink-0 font-medium transition flex items-center gap-1.5 ${
                activeMode === mode.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Body (Astryx ChatMessageList) */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/70 dark:bg-slate-950/50"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isToolExpanded = expandedToolId === m.id;

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm shrink-0 shadow-sm mt-1">
                    🧙‍♂️
                  </div>
                )}

                <div className="space-y-2 max-w-[92%] sm:max-w-[85%]">
                  {/* Astryx Tool Calls Component */}
                  {m.toolCall && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-xs transition">
                      <button
                        onClick={() => setExpandedToolId(isToolExpanded ? null : m.id)}
                        className="w-full px-3 py-2 flex items-center justify-between bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold truncate">
                          <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="truncate">{m.toolCall.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {m.toolCall.duration}
                          </span>
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

                  {/* Reasoning Trace Accordion (Agentic Reasoning & Grounding) */}
                  {m.reasoningTrace && m.reasoningTrace.length > 0 && (
                    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs overflow-hidden transition">
                      <button
                        onClick={() => setExpandedReasoningId(expandedReasoningId === m.id ? null : m.id)}
                        className="w-full px-3 py-1.5 flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🧠</span>
                          <span>Ход рассуждений AI (Reasoning Trace)</span>
                        </span>
                        {expandedReasoningId === m.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {expandedReasoningId === m.id && (
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
                        {renderFormattedText(m.text)}

                        {/* Clarification Options (Anthropic Clarification Protocol from system prompt leaks) */}
                        {m.clarificationOptions && m.clarificationOptions.length > 0 && (
                          <div className="space-y-2 my-2.5 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 animate-fadeIn">
                            <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                              <span>💡</span>
                              <span>Выберите подходящий сценарий для точного расчёта:</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {m.clarificationOptions.map((opt, optIdx) => (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSend(opt.prompt)}
                                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 hover:border-blue-400 hover:shadow-xs transition text-left group flex items-start gap-2"
                                >
                                  <span className="text-base shrink-0 group-hover:scale-110 transition">{opt.icon || '🎯'}</span>
                                  <div>
                                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition leading-snug">
                                      {opt.label}
                                    </p>
                                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                      {opt.prompt}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Admission Probability Gauge (Generative UI from awesome-llm-apps) */}
                        {m.probability && (
                          <div className="rounded-2xl p-3.5 bg-gradient-to-br from-slate-900 to-blue-950 text-white border border-blue-500/30 shadow-md my-2.5 animate-fadeIn">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold flex items-center gap-1.5 text-blue-200">
                                <span>📊</span>
                                <span>Оценка шансов поступления:</span>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  m.probability.level === 'high'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : m.probability.level === 'medium'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {m.probability.percentage}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  m.probability.level === 'high'
                                    ? 'bg-emerald-500'
                                    : m.probability.level === 'medium'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${m.probability.percentage}%` }}
                              />
                            </div>
                            <p className="text-[11px] font-semibold text-white mb-0.5">{m.probability.label}</p>
                            <p className="text-[10px] text-slate-300 leading-relaxed">{m.probability.description}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contextual Action Button (Deep-link into Platform tab) */}
                    {m.actionTab && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          onClick={() => {
                            onNavigateTab(m.actionTab!);
                            onClose();
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md hover:scale-105 transform"
                        >
                          <span>{m.actionLabel || 'Перейти в раздел'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Generative UI: Interactive University Citation Cards */}
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
                                {u.city}{u.metro ? ` • м. ${u.metro}` : ''}
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
                                  onClose();
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

                  {/* Astryx Message Toolbar / Reactions (Assistant only) */}
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
                        {/* Copy button */}
                        <button
                          onClick={() => copyMessage(m.id, m.text)}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Скопировать ответ"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Thumbs up */}
                        <button
                          onClick={() => setFeedback(m.id, 'like')}
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
                          onClick={() => setFeedback(m.id, 'dislike')}
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

                  {/* Leaked Prompt Architecture: Perplexity-Style Dynamic Conversational Handoffs */}
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
                            onClick={() => handleSend(fu)}
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
          })}

          {/* Typing / Agent Tool Execution Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm shrink-0 shadow-sm">
                🧙‍♂️
              </div>
              <div className="space-y-2">
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-2 flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-300 animate-pulse">
                  <Cpu className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="font-semibold">
                    {currentToolRunning || 'Дед Вузопед размышляет над ответом...'}
                  </span>
                </div>

                <div className="rounded-2xl px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-sm flex items-center gap-1.5 w-20">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <div className="relative">
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute -top-12 right-6 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition transform hover:scale-110 flex items-center gap-1 text-xs font-bold"
              title="Вниз"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Question Builder Toolbar (Above Input Field) */}
        <div className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Быстрый вопрос:</span>
          {[
            { icon: '🎯', label: 'Шансы с 250 б.', query: 'У меня 250 баллов, куда я могу поступить на бюджет в Москве?' },
            { icon: '⚖️', label: 'Сравнить МГУ и ВШЭ', query: 'Сравни МГУ и ВШЭ' },
            { icon: '🛡️', label: 'ВУЦ и нормативы', query: 'В каких вузах Москвы есть ВУЦ и какие нормативы физподготовки?' },
            { icon: '💰', label: 'Кредит 3%', query: 'Как работает образовательный кредит с господдержкой 3%?' },
            { icon: '🏆', label: 'Олимпиады БВИ', query: 'Какие олимпиады дают БВИ без 75 баллов?' },
            { icon: '🏢', label: 'Общежития', query: 'Сколько стоит общежитие в Бауманке и МГУ?' },
          ].map((qp, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSend(qp.query)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-medium transition shrink-0 flex items-center gap-1 shadow-2xs"
            >
              <span>{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Composer (Astryx ChatComposer Component) */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {/* Dictation voice button */}
            <button
              onClick={toggleDictation}
              className={`p-3 rounded-2xl border transition shadow-sm ${
                isDictating
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title={isDictating ? 'Остановить запись' : 'Голосовой ввод'}
            >
              {isDictating ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Main Input Field */}
            <input
              type="text"
              autoFocus
              data-testid="ded-assistant-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder="Спросите о баллах ЕГЭ, сравните вузы или выберите готовый сценарий..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition shadow-md shadow-blue-500/20"
              title="Отправить (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Нажмите Enter для отправки</span>
            <span className="flex items-center gap-1 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Gemini 3.5 Flash • Приём 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
