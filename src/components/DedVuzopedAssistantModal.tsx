import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown, Cpu } from 'lucide-react';
import {
  queryAssistant,
  fetchServerAssistantStatus,
  ServerAssistantStatus,
  SpecialistMode,
  RAGScopeFilter,
  AdmissionArtifact,
  RetrievedCitationChunk,
  enhanceStudentPrompt,
  ChatSession,
  AssistantMessage,
  createInitialWelcomeMessage,
  loadSessions,
  saveSessions,
  createAssistantMessageFromResponse,
  AppAssistantAction,
  resolveAction,
  StudentProfile,
  loadStudentProfile,
  getProfileSummaryBadges,
  savePersistedChecklist,
  loadPersistedChecklist,
  clearAllAssistantData,
} from '../services/assistant';
import { University } from '../types';
import {
  AssistantHeader,
  ApiKeySettingsModal,
  AssistantFiltersBar,
  AssistantMessageItem,
  ArtifactCanvasModal,
  CitationsDrawer,
  SessionsHistoryDrawer,
  AssistantComposer,
  StudentProfileModal,
} from './assistant';

interface DedVuzopedAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onExecuteAction?: (action: AppAssistantAction) => boolean | void;
  onSelectUniversity?: (vuz: University) => void;
}

export const DedVuzopedAssistantModal: React.FC<DedVuzopedAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onExecuteAction,
  onSelectUniversity,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([createInitialWelcomeMessage()]);
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session-${Date.now()}`);

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => loadStudentProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [expandedReasoningId, setExpandedReasoningId] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<AdmissionArtifact | null>(null);
  const [inspectedCitations, setInspectedCitations] = useState<{
    chunks: RetrievedCitationChunk[];
    focusChunkId?: string;
  } | null>(null);
  const [pendingConfirmationAction, setPendingConfirmationAction] = useState<AppAssistantAction | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [activeMode, setActiveMode] = useState<SpecialistMode>('all');
  const [activeScope, setActiveScope] = useState<RAGScopeFilter>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [currentToolRunning, setCurrentToolRunning] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const [serverStatus, setServerStatus] = useState<ServerAssistantStatus | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const refreshServerStatus = async () => {
    setIsStatusLoading(true);
    try {
      const st = await fetchServerAssistantStatus();
      setServerStatus(st);
    } finally {
      setIsStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.removeItem('vuzopedia_gemini_api_key');
      } catch {}
      setStudentProfile(loadStudentProfile());
      refreshServerStatus();
    }
  }, [isOpen]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const currentSessionIdRef = useRef<string>(currentSessionId);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  const handleStopGeneration = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    setIsTyping(false);
    setCurrentToolRunning(null);
  };

  // Sync sessions to localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech API initialization for dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ru-RU';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsDictating(false);
        };

        recognition.onerror = () => setIsDictating(false);
        recognition.onend = () => setIsDictating(false);

        recognitionRef.current = recognition;
      }
    }
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
    handleStopGeneration();
    const newId = `session-${Date.now()}`;
    currentSessionIdRef.current = newId;
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
    handleStopGeneration();
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      currentSessionIdRef.current = target.id;
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

  const toggleChecklistItem = (itemId: string) => {
    setActiveArtifact((prev) => {
      if (!prev || !prev.checklistItems) return prev;
      const updated = prev.checklistItems.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      const checkedIds = updated.filter((item) => item.checked).map((item) => item.id);
      savePersistedChecklist(prev.id, checkedIds);
      return { ...prev, checklistItems: updated };
    });
  };

  const handleExecuteAction = (action: AppAssistantAction) => {
    if (!action.canExecute) {
      return;
    }

    if (action.requiresConfirmation) {
      setPendingConfirmationAction(action);
      return;
    }

    dispatchAction(action);
  };

  const dispatchAction = (action: AppAssistantAction) => {
    if (action.type === 'explain_more') {
      handleSend(action.prompt || 'Расскажи подробнее с деталями и статистикой');
      return;
    }

    if (action.type === 'create_checklist') {
      const persistedChecked = new Set(loadPersistedChecklist(action.id));
      setActiveArtifact({
        id: action.id,
        type: 'checklist',
        title: action.title,
        summary: `Интерактивный чек-лист поступления (${action.items.length} пунктов)`,
        checklistItems: action.items.map((item, idx) => {
          const itemId = item.id || `item-${idx + 1}`;
          return {
            id: itemId,
            label: item.text,
            checked: persistedChecked.has(itemId) ? true : !!item.checked,
            priority: (item.category === 'essential' ? 'high' : 'medium') as 'high' | 'medium' | 'low',
          };
        }),
      });
      return;
    }

    if (onExecuteAction) {
      const handled = onExecuteAction(action);
      if (handled) {
        onClose();
        return;
      }
    }

    // Default fallback handling if application handler wasn't provided or didn't handle
    if (action.type === 'open_tab') {
      onNavigateTab(action.tabId);
      onClose();
    } else if (action.type === 'compare_universities') {
      onNavigateTab('compare');
      onClose();
    } else if (action.type === 'open_calculator') {
      const tabMap: Record<string, string> = {
        ege: 'calculator',
        credit: 'credit',
        achievements: 'achievements',
        student_budget: 'student_budget',
      };
      onNavigateTab(tabMap[action.calculatorType] || 'calculator');
      onClose();
    } else if (action.type === 'open_program') {
      onNavigateTab('programs');
      onClose();
    } else if (action.type === 'apply_catalog_filters') {
      onNavigateTab('catalog');
      onClose();
    }
  };

  const handleNavigateTab = (tab: string) => {
    if (tab === 'explain_more') {
      handleSend('Расскажи подробнее с деталями и статистикой');
    } else {
      const resolved = resolveAction(tab);
      if (resolved?.action) {
        handleExecuteAction(resolved.action);
      } else if (resolved?.tabId) {
        onNavigateTab(resolved.tabId);
        onClose();
      } else {
        onNavigateTab(tab);
        onClose();
      }
    }
  };

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    const sendingSessionId = currentSessionId;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const streamMsgId = `ded-stream-${Date.now()}`;
    const streamPlaceholder: AssistantMessage = {
      id: streamMsgId,
      sender: 'ded',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini',
    };

    setMessages((prev) => [...prev, userMsg, streamPlaceholder]);
    setInputValue('');
    setIsTyping(true);
    setCurrentToolRunning('Обработка запроса...');

    const abortCtrl = new AbortController();
    activeAbortControllerRef.current = abortCtrl;

    try {
      const response = await queryAssistant(
        text,
        messages.map((m) => ({ sender: m.sender, text: m.text })),
        activeMode,
        activeScope,
        {
          abortSignal: abortCtrl.signal,
          onStreamChunk: (accumulated) => {
            if (currentSessionIdRef.current === sendingSessionId) {
              setMessages((prev) =>
                prev.map((m) => (m.id === streamMsgId ? { ...m, text: accumulated } : m))
              );
            }
          },
        }
      );

      const finalMsg = {
        ...createAssistantMessageFromResponse(response),
        id: streamMsgId,
      };

      if (currentSessionIdRef.current === sendingSessionId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === streamMsgId ? finalMsg : m))
        );
      }

      // Auto update sessions in background
      setSessions((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === sendingSessionId);
        const targetSession = existingIdx >= 0 ? prev[existingIdx] : null;
        const title =
          targetSession && targetSession.title && !targetSession.title.startsWith('Новый')
            ? targetSession.title
            : text.slice(0, 36) + (text.length > 36 ? '...' : '');

        const priorMessages = targetSession ? targetSession.messages : messages;
        const updatedMessages = [
          ...priorMessages.filter((m) => m.id !== streamMsgId),
          userMsg,
          finalMsg,
        ];
        const newSession: ChatSession = {
          id: sendingSessionId,
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
        id: streamMsgId,
        sender: 'ded',
        text: 'Произошла непредвиденная ошибка связи, но наш Калькулятор ЕГЭ и база вузов работают в штатном режиме!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTab: 'calculator',
        actionLabel: 'Открыть Калькулятор ЕГЭ',
        suggestions: ['Как оценить шансы по баллам?'],
        modelUsed: 'local',
      };
      if (currentSessionIdRef.current === sendingSessionId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === streamMsgId ? errorMsg : m))
        );
      }
    } finally {
      activeAbortControllerRef.current = null;
      setIsTyping(false);
      setCurrentToolRunning(null);
    }
  };

  const isAiAvailable = serverStatus?.aiAvailable ?? false;
  const profileBadges = getProfileSummaryBadges(studentProfile);

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
        {/* Header */}
        <AssistantHeader
          isAiAvailable={isAiAvailable}
          sessionsCount={sessions.length}
          isHistoryOpen={isHistoryOpen}
          isFullscreen={isFullscreen}
          onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRestart={createNewSession}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onClose={onClose}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          profileBadgeCount={profileBadges.length}
        />

        {/* Sessions History Drawer */}
        <SessionsHistoryDrawer
          isOpen={isHistoryOpen}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onClose={() => setIsHistoryOpen(false)}
          onCreateNewSession={createNewSession}
          onSwitchSession={switchSession}
          onDeleteSession={deleteSession}
        />

        {/* Server Status & Security Drawer */}
        <ApiKeySettingsModal
          isOpen={isSettingsOpen}
          status={serverStatus}
          isLoading={isStatusLoading}
          onRefresh={refreshServerStatus}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Specialist Mode & Scope Filters Bar */}
        <AssistantFiltersBar
          activeMode={activeMode}
          activeScope={activeScope}
          onSelectMode={(mode) => {
            setActiveMode(mode);
            if (mode === 'calculator') setInputValue('У меня 260 баллов, куда я смогу поступить на бюджет?');
            else if (mode === 'military') setInputValue('В каких вузах Москвы есть ВУЦ и какие там нормативы?');
            else if (mode === 'finance') setInputValue('Как взять образовательный кредит под 3% в Сбере?');
            else if (mode === 'olympiads') setInputValue('Какие олимпиады дают БВИ без подтверждения 75 баллов?');
          }}
          onSelectScope={setActiveScope}
        />

        {/* Confirmed Student Profile Banner (explicitly saved preferences) */}
        {profileBadges.length > 0 && (
          <div className="bg-blue-50/90 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-900/60 px-4 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              <span className="font-semibold text-blue-900 dark:text-blue-300 shrink-0">
                Ваш профиль:
              </span>
              {profileBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-[11px] whitespace-nowrap font-medium shadow-2xs"
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold shrink-0 text-[11px]"
            >
              Изменить
            </button>
          </div>
        )}

        {/* Messages Body */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/70 dark:bg-slate-950/50"
        >
          {messages.map((m) => (
            <AssistantMessageItem
              key={m.id}
              message={m}
              isToolExpanded={expandedToolId === m.id}
              isReasoningExpanded={expandedReasoningId === m.id}
              isCopied={copiedId === m.id}
              isSpeaking={speakingMsgId === m.id}
              onToggleTool={() => setExpandedToolId(expandedToolId === m.id ? null : m.id)}
              onToggleReasoning={() =>
                setExpandedReasoningId(expandedReasoningId === m.id ? null : m.id)
              }
              onSpeak={() => handleSpeak(m.id, m.text)}
              onCopy={() => copyMessage(m.id, m.text)}
              onFeedback={(type) => setFeedback(m.id, type)}
              onSendPrompt={handleSend}
              onNavigateTab={handleNavigateTab}
              onExecuteAction={handleExecuteAction}
              onOpenArtifact={setActiveArtifact}
              onInspectCitations={(chunks, focusChunkId) => setInspectedCitations({ chunks, focusChunkId })}
              onSelectUniversity={onSelectUniversity}
              onCloseModal={onClose}
            />
          ))}

          {/* Typing / Agent Tool Execution Indicator (only until first token arrives) */}
          {isTyping && (!messages[messages.length - 1] || messages[messages.length - 1].text === '') && (
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
                  <span
                    className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
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

        {/* Composer */}
        <AssistantComposer
          inputValue={inputValue}
          isTyping={isTyping}
          isDictating={isDictating}
          isAiAvailable={isAiAvailable}
          onInputChange={setInputValue}
          onSend={handleSend}
          onStopGeneration={handleStopGeneration}
          onToggleDictation={toggleDictation}
          onEnhancePrompt={() => {
            const enriched = enhanceStudentPrompt(inputValue, studentProfile);
            setInputValue(enriched);
          }}
        />

        {/* Interactive Admission Artifact Canvas Modal */}
        <ArtifactCanvasModal
          artifact={activeArtifact}
          onClose={() => setActiveArtifact(null)}
          onToggleChecklistItem={toggleChecklistItem}
          onSelectUniversity={onSelectUniversity}
        />

        {/* Citations & Sources Modal / Drawer */}
        <CitationsDrawer
          inspectedCitations={inspectedCitations}
          onClose={() => setInspectedCitations(null)}
          onSelectUniversity={onSelectUniversity}
        />

        {/* Student Profile & Local Storage Governance Modal */}
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={(updated) => setStudentProfile(updated)}
          onAllDataCleared={() => {
            clearAllAssistantData();
            setStudentProfile(loadStudentProfile());
            createNewSession();
            setSessions([]);
            setIsProfileModalOpen(false);
          }}
        />

        {/* Action Confirmation Dialog for Irreversible Operations */}
        {pendingConfirmationAction && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Подтверждение действия
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Это действие изменит сохраненные приоритеты.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                {pendingConfirmationAction.confirmationMessage || 'Подтвердите выполнение операции.'}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingConfirmationAction(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const actionToRun = pendingConfirmationAction;
                    setPendingConfirmationAction(null);
                    if (actionToRun) {
                      dispatchAction(actionToRun);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
