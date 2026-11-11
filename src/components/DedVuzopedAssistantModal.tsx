import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown, Cpu } from 'lucide-react';
import {
  queryAssistant,
  getStoredApiKey,
  setStoredApiKey,
  resetStoredApiKey,
  DEFAULT_GEMINI_KEY,
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
} from './assistant';

interface DedVuzopedAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectUniversity?: (vuz: University) => void;
}

export const DedVuzopedAssistantModal: React.FC<DedVuzopedAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectUniversity,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([createInitialWelcomeMessage()]);
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session-${Date.now()}`);

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

  const [inputValue, setInputValue] = useState('');
  const [activeMode, setActiveMode] = useState<SpecialistMode>('all');
  const [activeScope, setActiveScope] = useState<RAGScopeFilter>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [currentToolRunning, setCurrentToolRunning] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyStatusMessage, setApiKeyStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
      return { ...prev, checklistItems: updated };
    });
  };

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
      const response = await queryAssistant(
        text,
        messages.map((m) => ({ sender: m.sender, text: m.text })),
        activeMode,
        activeScope
      );

      const dedMsg = createAssistantMessageFromResponse(response);
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
        {/* Header */}
        <AssistantHeader
          activeKey={activeKey}
          sessionsCount={sessions.length}
          isHistoryOpen={isHistoryOpen}
          isFullscreen={isFullscreen}
          onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          onOpenSettings={() => {
            setApiKeyInput(isCustomKey ? activeKey : '');
            setIsSettingsOpen(true);
          }}
          onRestart={createNewSession}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onClose={onClose}
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

        {/* API Key Settings Drawer/Popover */}
        <ApiKeySettingsModal
          isOpen={isSettingsOpen}
          activeKey={activeKey}
          isCustomKey={isCustomKey}
          apiKeyInput={apiKeyInput}
          apiKeyStatusMessage={apiKeyStatusMessage}
          onApiKeyInputChange={setApiKeyInput}
          onSave={() => {
            setStoredApiKey(apiKeyInput);
            setApiKeyStatusMessage('Ключ сохранен!');
            setTimeout(() => setApiKeyStatusMessage(null), 2500);
          }}
          onReset={() => {
            resetStoredApiKey();
            setApiKeyInput('');
            setApiKeyStatusMessage('Сброшено к ключу проекта!');
            setTimeout(() => setApiKeyStatusMessage(null), 2500);
          }}
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
              onNavigateTab={onNavigateTab}
              onOpenArtifact={setActiveArtifact}
              onInspectCitations={(chunks, focusChunkId) => setInspectedCitations({ chunks, focusChunkId })}
              onSelectUniversity={onSelectUniversity}
              onCloseModal={onClose}
            />
          ))}

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
          activeKey={activeKey}
          onInputChange={setInputValue}
          onSend={handleSend}
          onToggleDictation={toggleDictation}
          onEnhancePrompt={() => {
            const enriched = enhanceStudentPrompt(inputValue);
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
      </div>
    </div>
  );
};
