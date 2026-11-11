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
  Database,
  Search,
  ExternalLink,
  Volume2,
  VolumeX,
  History,
  Plus,
  Trash2,
  FileText,
  CheckSquare,
  ListTodo,
  Wand2,
  Globe,
} from 'lucide-react';
import {
  queryDedAssistant,
  getStoredApiKey,
  setStoredApiKey,
  resetStoredApiKey,
  DEFAULT_GEMINI_KEY,
  SpecialistMode,
  RAGScopeFilter,
  AdmissionProbability,
  ComparisonMatrix,
  ClarificationOption,
  RetrievedCitationChunk,
  ExtractedQueryFilters,
  AdmissionArtifact,
  enhanceStudentPrompt,
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
  duration?: string;
  status: 'running' | 'complete' | 'error';
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: AssistantMessage[];
  activeMode: SpecialistMode;
  activeScope: RAGScopeFilter;
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
  citationChunks?: RetrievedCitationChunk[];
  extractedFilters?: ExtractedQueryFilters;
  modelUsed?: 'gemini' | 'local';
  feedback?: 'like' | 'dislike' | null;
  matchedUniversities?: University[];
  reasoningTrace?: string[];
  probability?: AdmissionProbability;
  artifact?: AdmissionArtifact;
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
      text: 'Здравствуй, будущий студент! Я **Дед Вузопед** — твой консультант по приёмной кампании 2026 года.\n\nВ моей локальной базе собраны сведения о ведущих университетах России: ориентировочные проходные баллы прошлых лет, наличие общежитий и военных учебных центров (ВУЦ), правила олимпиад БВИ и условия льготного кредита 3%.\n\nПри подключенном ключе Gemini ответы формулируются нейросетью с опорой на каталог, а в офлайн-режиме — напрямую из локального справочника. Спроси меня о вузах, сравни программы или введи свои баллы ЕГЭ!',
      timestamp: 'Только что',
      modelUsed: 'local',
      toolCall: {
        name: 'Локальная база вузов и справочников приёма 2026',
        query: 'Загрузка каталога: 10 ведущих университетов РФ, правила ВУЦ, общежитий и олимпиад',
        duration: '10ms',
        status: 'complete',
      },
      suggestions: [
        'Как сопоставить баллы с проходными прошлых лет?',
        'Сравни МГУ и ВШЭ по направлению IT',
        'Какие лучшие IT-вузы в Москве и СПб?',
        'Где есть военная кафедра (ВУЦ)?',
      ],
      followUps: [
        'Как сопоставить баллы с проходными прошлых лет?',
        'Сравни МГУ и ВШЭ по направлению IT',
        'Сколько баллов даёт золотая медаль и ГТО?',
      ],
      citationChunks: [
        {
          id: 'chunk-welcome-1',
          source: 'Локальный справочник правил приёма Вузопедии',
          title: 'Порядок приёма и подача документов 2026',
          snippet: 'Абитуриент вправе подать заявления максимум в 5 вузов (до 5 направлений в каждом). Электронная отметка о подаче оригинала на Госуслугах юридически эквивалентна бумажному оригиналу.',
          category: 'university',
          categoryLabel: 'Правила приёма',
          metadata: { tags: ['Правила приёма', 'Приём 2026', '5 вузов'] },
        },
      ],
    },
  ]);

  const SESSIONS_STORAGE_KEY = 'vuzopedia_assistant_sessions_v4';

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session-${Date.now()}`);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<AdmissionArtifact | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [activeMode, setActiveMode] = useState<SpecialistMode>('all');
  const [activeScope, setActiveScope] = useState<RAGScopeFilter>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [currentToolRunning, setCurrentToolRunning] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [expandedReasoningId, setExpandedReasoningId] = useState<string | null>(null);
  const [inspectedCitations, setInspectedCitations] = useState<{
    chunks: RetrievedCitationChunk[];
  } | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyStatusMessage, setApiKeyStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === id) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    const cleanText = text
      .replace(/\[vuz:[a-z0-9_-]+:([^\]]+)\]/g, '$1')
      .replace(/\[web:[^\]]+\]/g, '')
      .replace(/\[TOOL:[^\]]+\]/gi, '')
      .replace(/\[ACTION:[^\]]+\]/gi, '')
      .replace(/[#*`_~]/g, '')
      .replace(/\|/g, ', ')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find((v) => v.lang.startsWith('ru'));
    if (ruVoice) utterance.voice = ruVoice;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const createNewSession = () => {
    stopSpeaking();
    const newId = `session-${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'ded',
        text: 'Здравствуй! Я готов ответить на любые вопросы о вузах, экзаменах и поступлении 2026 года!',
        timestamp: 'Только что',
        modelUsed: 'gemini',
        suggestions: [
          'Как рассчитать шансы по баллам ЕГЭ?',
          'Сравни МГУ и ВШЭ по направлению IT',
          'Составь пошаговый чек-лист поступления',
        ],
        followUps: [
          'Как рассчитать шансы по баллам ЕГЭ?',
          'Сравни МГУ и ВШЭ по направлению IT',
        ],
      },
    ]);
    setIsHistoryOpen(false);
  };

  const switchSession = (sessionId: string) => {
    stopSpeaking();
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setCurrentSessionId(target.id);
      setMessages(target.messages);
      setActiveMode(target.activeMode || 'all');
      setActiveScope(target.activeScope || 'all');
      setIsHistoryOpen(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      createNewSession();
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!activeArtifact || !activeArtifact.checklistItems) return;
    const updatedItems = activeArtifact.checklistItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedArtifact: AdmissionArtifact = { ...activeArtifact, checklistItems: updatedItems };
    setActiveArtifact(updatedArtifact);

    setMessages((prev) =>
      prev.map((m) =>
        m.artifact && m.artifact.id === activeArtifact.id ? { ...m, artifact: updatedArtifact } : m
      )
    );
  };

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
          setInputValue('Какие проходные баллы на IT в 2026 году?');
          setIsDictating(false);
        }
      } else {
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
    setCurrentToolRunning('Поиск по локальному каталогу вузов Вузопедии...');

    try {
      const response = await queryDedAssistant(
        text,
        messages.map((m) => ({ sender: m.sender, text: m.text })),
        activeMode,
        activeScope
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
        citationChunks: response.citationChunks,
        extractedFilters: response.extractedFilters,
        modelUsed: response.modelUsed,
        matchedUniversities: response.matchedUniversities,
        reasoningTrace: response.reasoningTrace,
        probability: response.probability,
        artifact: response.artifact,
      };

      const updatedMessages = [...messages, userMsg, dedMsg];
      setMessages(updatedMessages);

      // Auto update sessions
      setSessions((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === currentSessionId);
        const title =
          existingIdx >= 0 && prev[existingIdx].title && !prev[existingIdx].title.startsWith('Новый')
            ? prev[existingIdx].title
            : text.slice(0, 36) + (text.length > 36 ? '...' : '');

        const newSession: ChatSession = {
          id: currentSessionId,
          title,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: updatedMessages,
          activeMode,
          activeScope,
        };

        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = newSession;
          return copy;
        } else {
          return [newSession, ...prev.slice(0, 19)];
        }
      });
    } catch (err) {
      console.error('Ded assistant error:', err);
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

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'university':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
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
  };

  const activeKey = getStoredApiKey();
  const isCustomKey = activeKey !== DEFAULT_GEMINI_KEY;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 relative ${
          isFullscreen
            ? 'w-full h-full max-w-full max-h-full rounded-none'
            : 'w-full max-w-3xl h-[88vh] max-h-[850px]'
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
                  Дед Вузопед
                </h3>
                {activeKey ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    Режим: Google Gemini
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold flex items-center gap-1">
                    <Database className="w-3 h-3 text-blue-300" />
                    Режим: Локальный каталог
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Локальный каталог вузов и справочные правила приёма 2026
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">

            {/* Sessions History button (Open-WebUI / ChatGPT Sessions) */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition relative"
              title="История консультаций"
            >
              <History className="w-4 h-4" />
              {sessions.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900" />
              )}
            </button>

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
              onClick={createNewSession}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Новый диалог"
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

        {/* Sessions History Sidebar Drawer */}
        {isHistoryOpen && (
          <div className="absolute inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slideRight">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-white/10">
              <span className="font-extrabold text-xs flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                История консультаций ({sessions.length})
              </span>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={createNewSession}
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
                    onClick={() => switchSession(s.id)}
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
                        deleteSession(s.id);
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
        )}

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

        {/* Specialist Mode Switcher Bar */}
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

        {/* Open-WebUI RAG Scope Filter Bar */}
        <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
          <span className="text-slate-400 font-semibold shrink-0 uppercase tracking-wider flex items-center gap-1">
            <Database className="w-3 h-3 text-blue-500" />
            <span>RAG Фильтр базы:</span>
          </span>
          {[
            { id: 'all', label: '🌐 Все вузы РФ' },
            { id: 'moscow', label: '📍 Москва' },
            { id: 'spb', label: '🏛️ Санкт-Петербург' },
            { id: 'it', label: '💻 IT и Инженерия' },
            { id: 'military', label: '🛡️ Только с ВУЦ' },
            { id: 'olympiads', label: '🏆 Олимпиады БВИ' },
          ].map((scope) => (
            <button
              key={scope.id}
              onClick={() => setActiveScope(scope.id as RAGScopeFilter)}
              className={`px-2 py-0.5 rounded-md shrink-0 font-semibold transition ${
                activeScope === scope.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {scope.label}
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

                  {/* Reasoning Trace Accordion (Transparent Status Steps) */}
                  {m.reasoningTrace && m.reasoningTrace.length > 0 && (
                    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs overflow-hidden transition">
                      <button
                        onClick={() => setExpandedReasoningId(expandedReasoningId === m.id ? null : m.id)}
                        className="w-full px-3 py-1.5 flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🧠</span>
                          <span>Этапы обработки запроса ({m.reasoningTrace.length})</span>
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
                              <span>Данные локального каталога</span>
                            </span>
                          )}
                        </div>

                        {/* Extracted Query Filter Tags */}
                        {m.extractedFilters && (m.extractedFilters.score || m.extractedFilters.city || m.extractedFilters.direction || m.extractedFilters.wantsMilitary || m.extractedFilters.wantsDorm) && (
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

                        {renderFormattedText(m.text)}

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

                        {/* Admission Qualitative Comparison Card (NO invented percentage) */}
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
                            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{m.probability.description}</p>
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
                              onClick={() =>
                                setInspectedCitations({
                                  chunks: m.citationChunks!,
                                })
                              }
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
                        onClick={() => setActiveArtifact(m.artifact || null)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <span>Открыть холст</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
                        {/* Voice TTS narration button */}
                        <button
                          onClick={() => handleSpeak(m.id, m.text)}
                          className={`p-1 rounded-md transition ${
                            speakingMsgId === m.id
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 animate-pulse'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                          title={speakingMsgId === m.id ? 'Остановить озвучку' : 'Озвучить ответ Деда'}
                        >
                          {speakingMsgId === m.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

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
            { icon: '📋', label: 'Чек-лист 2026', query: 'Составь пошаговый чек-лист и стратегию поступления на 2026 год' },
            { icon: '⚡', label: '275 б. (IT)', query: 'У меня 275 баллов, куда поступить на программную инженерию с военной кафедрой в Москве?' },
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

            {/* Magic Prompt Enhancer Button */}
            <button
              type="button"
              onClick={() => {
                const enriched = enhanceStudentPrompt(inputValue);
                setInputValue(enriched);
              }}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition shadow-xs"
              title="✨ Улучшить и дополнить вопрос деталями"
            >
              <Wand2 className="w-4 h-4" />
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
            <span className="flex items-center gap-1.5 text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${activeKey ? 'bg-emerald-500' : 'bg-blue-400'}`} />
              <span>{activeKey ? 'Google Gemini API • Каталог Вузопедии' : 'Локальный каталог • Офлайн-режим'}</span>
            </span>
          </div>
        </div>

        {/* Interactive Admission Artifact Canvas Drawer / Side Panel (Claude & ChatGPT Canvas style) */}
        {activeArtifact && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
            <div data-testid="artifact-canvas-modal" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
              {/* Canvas Header */}
              <div className="p-4 px-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">
                        {activeArtifact.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Интерактивный холст
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {activeArtifact.summary}
                    </p>
                  </div>
                </div>

                <button
                  data-testid="close-artifact-canvas"
                  onClick={() => setActiveArtifact(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
                  title="Закрыть холст"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Canvas Body */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
                {/* Checklist Section */}
                {activeArtifact.checklistItems && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                        Готовность к поступлению
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {activeArtifact.checklistItems.filter((i) => i.checked).length} из{' '}
                        {activeArtifact.checklistItems.length} выполнено (
                        {Math.round(
                          (activeArtifact.checklistItems.filter((i) => i.checked).length /
                            activeArtifact.checklistItems.length) *
                            100
                        )}
                        %)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{
                          width: `${Math.round(
                            (activeArtifact.checklistItems.filter((i) => i.checked).length /
                              activeArtifact.checklistItems.length) *
                              100
                          )}%`,
                        }}
                      />
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-1.5 pt-1">
                      {activeArtifact.checklistItems.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <input
                            data-testid="artifact-checkbox"
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleChecklistItem(item.id)}
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
                {activeArtifact.steps && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4 text-blue-500" />
                      Ключевые этапы стратегии
                    </h5>
                    <div className="space-y-2.5">
                      {activeArtifact.steps.map((step) => (
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
                {activeArtifact.markdownContent && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                    {renderFormattedText(activeArtifact.markdownContent)}
                  </div>
                )}
              </div>

              {/* Canvas Footer */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    const text = `${activeArtifact.title}\n\n${activeArtifact.summary}\n\nЧек-лист:\n` +
                      (activeArtifact.checklistItems?.map((i) => `[${i.checked ? 'X' : ' '}] ${i.label} (${i.deadline || ''})`).join('\n') || '');
                    navigator.clipboard.writeText(text);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-600 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать план</span>
                </button>
                <button
                  onClick={() => setActiveArtifact(null)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Citations & Sources Modal / Drawer */}
        {inspectedCitations && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
              {/* Drawer Header */}
              <div className="p-4 px-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      Справочные материалы локальной базы данных
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Карточки вузов и справочники приёма Вузопедии
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-extrabold">
                    Локальный каталог
                  </span>
                  <button
                    data-testid="close-citations-modal"
                    onClick={() => setInspectedCitations(null)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
                    title="Закрыть"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-4 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
                {inspectedCitations.chunks.map((chunk, cIdx) => {
                  const colorClass = getCategoryBadgeClass(chunk.category);
                  const vuzObj = chunk.vuzId ? UNIVERSITIES.find((u) => u.id === chunk.vuzId) : null;

                  return (
                    <div
                      key={chunk.id || cIdx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                            {chunk.source}
                          </span>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                            {chunk.title}
                          </h5>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold shrink-0 ${colorClass}`}>
                          {chunk.categoryLabel || 'Справочный материал'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                        {chunk.snippet}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-1">
                          {chunk.metadata?.tags?.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        {vuzObj && onSelectUniversity && (
                          <button
                            onClick={() => {
                              setInspectedCitations(null);
                              onSelectUniversity(vuzObj);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-blue-700 hover:text-white dark:text-blue-300 dark:hover:text-white font-bold text-[10px] transition flex items-center gap-1"
                          >
                            <span>Карточка вуза</span>
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
                  Сведения приведены из локального каталога Вузопедии для ознакомления
                </span>
                <button
                  onClick={() => setInspectedCitations(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
