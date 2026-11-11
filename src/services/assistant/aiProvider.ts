import { AssistantResponse, validateAssistantResponse } from './types';
import { RetrievalContext } from './dataRetrieval';
import { parseAndExtractActions } from './navigationActions';
import { extractReferencedEntityIds } from './entityResolution';

export interface ServerAssistantStatus {
  aiAvailable: boolean;
  mode: 'server_ai' | 'local_only';
  reason: string | null;
  dailyUsage?: number;
  dailyLimit?: number;
  freeTierPolicy?: string;
}

let cachedServerStatus: { status: ServerAssistantStatus; timestamp: number } | null = null;

/**
 * Checks server assistant operating status.
 * Results are cached for 10 seconds to minimize network queries.
 */
export async function fetchServerAssistantStatus(): Promise<ServerAssistantStatus> {
  const now = Date.now();
  if (cachedServerStatus && now - cachedServerStatus.timestamp < 10000) {
    return cachedServerStatus.status;
  }

  try {
    const res = await fetch('/api/assistant/status', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const status: ServerAssistantStatus = {
        aiAvailable: Boolean(data.aiAvailable),
        mode: data.mode === 'server_ai' ? 'server_ai' : 'local_only',
        reason: data.reason || null,
        dailyUsage: data.dailyUsage,
        dailyLimit: data.dailyLimit,
        freeTierPolicy: data.freeTierPolicy,
      };
      cachedServerStatus = { status, timestamp: now };
      return status;
    }
  } catch {
    // Server is unreachable or running in static export mode
  }

  const fallbackStatus: ServerAssistantStatus = {
    aiAvailable: false,
    mode: 'local_only',
    reason: 'Серверный эндпоинт недоступен. Работает надежный каталог.',
  };
  cachedServerStatus = { status: fallbackStatus, timestamp: now };
  return fallbackStatus;
}

/**
 * Helper to package final structured assistant response from raw text.
 */
function finalizeStreamResponse(
  rawText: string,
  context: RetrievalContext,
  startTime: number,
  modelUsed: string = 'gemini-3.8-flash',
  isPartial: boolean = false
): AssistantResponse {
  const durationMs = Math.round(performance.now() - startTime);

  let cleanText = rawText;
  let toolName = context.toolName;
  let toolQuery = context.toolQuery;

  // Extract [TOOL: ...] if model produced it
  const toolMatch = cleanText.match(/\[TOOL:\s*([^|]+)\|\s*([^\]]+)\]/i);
  if (toolMatch) {
    toolName = toolMatch[1].trim();
    toolQuery = toolMatch[2].trim();
    cleanText = cleanText.replace(toolMatch[0], '').trim();
  }

  // Extract and validate [ACTION: ...] tags
  const actionResult = parseAndExtractActions(cleanText);
  cleanText = actionResult.cleanText;
  let validatedActions = actionResult.actions;

  // Requirement 8: Add optional "Explain more" action if response is concise and not already requesting it
  if (
    !validatedActions.some((a) => a.tabId === 'explain_more' || a.label.includes('подробнее')) &&
    !cleanText.includes('Подробный разбор')
  ) {
    validatedActions.push({
      tabId: 'explain_more' as any,
      label: '📖 Раскрыть подробнее',
    });
  }

  if (validatedActions.length === 0 && context.suggestedActionTab) {
    validatedActions = [{ tabId: context.suggestedActionTab as any, label: context.suggestedActionLabel }];
  }

  // Extract referenced university IDs from generated text
  const referencedEntityIds = extractReferencedEntityIds(cleanText);
  if (context.matchedUniversities.length > 0) {
    context.matchedUniversities.forEach((u) => {
      if (!referencedEntityIds.includes(u.id)) {
        referencedEntityIds.push(u.id);
      }
    });
  }

  const evidenceIds = context.citationChunks.map((c) => c.id);

  const candidateResponse = {
    text: cleanText,
    mode: 'gemini' as const,
    referencedEntityIds,
    evidenceIds,
    validatedActions,
    clarificationQuestions: context.clarificationOptions || [],
    comparison: context.comparisonMatrix,
    artifact: context.artifact,
    suggestions: context.followUps || [],
    followUps: context.followUps || [],
    toolCall: {
      name: toolName,
      query: toolQuery,
      duration: `${durationMs}ms`,
      status: isPartial ? ('error' as const) : ('complete' as const),
    },
    reasoningTrace: context.reasoningTrace,
    extractedFilters: context.extractedFilters,
    citationChunks: context.citationChunks,
    matchedUniversities: context.matchedUniversities,
    matchedPrograms: context.matchedPrograms,
    alternatives: context.alternatives,
    ambiguousEntity: context.ambiguousEntity,
    probability: context.probability,
  };

  // Validate structured output before returning
  return validateAssistantResponse(candidateResponse);
}

/**
 * Streams real-time AI responses through the server endpoint (/api/assistant/stream).
 * Invokes onChunk callback as each text token arrives so the UI renders immediately.
 * Supports cancellation via abortSignal, timeout detection, and partial-response preservation.
 */
export async function callGeminiStreamingProvider(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }>,
  context: RetrievalContext,
  startTime: number,
  onChunk?: (accumulatedText: string) => void,
  abortSignal?: AbortSignal
): Promise<AssistantResponse | null> {
  let accumulatedText = '';
  let modelUsed: string = 'gemini-3.8-flash';
  let isPartial = false;

  const internalController = new AbortController();
  const forwardAbort = () => internalController.abort();
  if (abortSignal) {
    if (abortSignal.aborted) return null;
    abortSignal.addEventListener('abort', forwardAbort);
  }

  // First-token timeout: if no first token arrives in 4.5s, abort and fall back
  let firstTokenReceived = false;
  const firstTokenTimeout = setTimeout(() => {
    if (!firstTokenReceived) {
      internalController.abort();
    }
  }, 7000);

  try {
    const res = await fetch('/api/assistant/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      signal: internalController.signal,
      body: JSON.stringify({
        prompt,
        history: history.slice(-3).map((h) => ({ sender: h.sender, text: h.text.slice(0, 1000) })),
        evidence: (context.evidence || '').slice(0, 16000),
        model: 'gemini-3.5-flash',
      }),
    });

    if (!res.ok) {
      clearTimeout(firstTokenTimeout);
      return null;
    }

    if (!res.body) {
      clearTimeout(firstTokenTimeout);
      return null;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (!firstTokenReceived) {
        firstTokenReceived = true;
        clearTimeout(firstTokenTimeout);
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('data:')) {
          const jsonStr = line.slice(5).trim();
          if (jsonStr) {
            try {
              const data = JSON.parse(jsonStr);
              if (data.delta && typeof data.delta === 'string') {
                accumulatedText += data.delta;
                onChunk?.(accumulatedText);
              }
              if (data.done) {
                if (data.modelUsed) modelUsed = data.modelUsed;
                if (data.partial) isPartial = true;
              }
            } catch {
              // ignore partial event json
            }
          }
        }
      }
    }

    clearTimeout(firstTokenTimeout);

    if (!accumulatedText.trim()) {
      return null;
    }

    return finalizeStreamResponse(accumulatedText, context, startTime, modelUsed, isPartial);
  } catch (err: any) {
    clearTimeout(firstTokenTimeout);

    if (abortSignal?.aborted) {
      // User pressed Stop
      if (accumulatedText.trim()) {
        return finalizeStreamResponse(
          accumulatedText + '\n\n*(Генерация остановлена пользователем)*',
          context,
          startTime,
          'gemini',
          true
        );
      }
      return null;
    }

    if (accumulatedText.trim().length > 40) {
      // Partial response on stalled connection or timeout
      return finalizeStreamResponse(
        accumulatedText + '\n\n*(Ответ был прерван из-за сбоя соединения)*',
        context,
        startTime,
        'gemini',
        true
      );
    }

    return null;
  } finally {
    if (abortSignal) {
      abortSignal.removeEventListener('abort', forwardAbort);
    }
  }
}

/**
 * Backward-compatible buffered fallback provider (/api/assistant/chat).
 */
export async function callGeminiProvider(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }>,
  context: RetrievalContext,
  startTime: number
): Promise<AssistantResponse | null> {
  let timeoutId: any = null;

  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        history: history.slice(-3).map((h) => ({ sender: h.sender, text: h.text.slice(0, 1000) })),
        evidence: (context.evidence || '').slice(0, 16000),
        model: 'gemini-3.5-flash',
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const rawText = data?.rawText;

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return null;
    }

    return finalizeStreamResponse(rawText, context, startTime, data.modelUsed || 'gemini-3.8-flash', false);
  } catch {
    if (timeoutId) clearTimeout(timeoutId);
    return null;
  }
}
