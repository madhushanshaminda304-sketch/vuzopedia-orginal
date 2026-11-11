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
 * Communicates with the protected server endpoint (/api/assistant/chat),
 * which securely invokes the Gemini API without exposing credentials to the client.
 * Returns null if the endpoint is unavailable, rate-limited, or unconfigured,
 * seamlessly triggering the local catalogue engine fallback.
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
    timeoutId = setTimeout(() => controller.abort(), 7500);

    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        history: history.slice(-4),
        evidence: context.evidence,
        model: 'gemini-1.5-flash',
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const code = errorData?.error?.code || `HTTP_${res.status}`;
      console.warn(`[Assistant] Server endpoint returned status ${res.status} (${code}); falling back to local catalog.`);
      return null;
    }

    const data = await res.json();
    const rawText = data?.rawText;

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return null;
    }

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
    const validatedActions = actionResult.actions.length > 0
      ? actionResult.actions
      : [{ tabId: context.suggestedActionTab as any, label: context.suggestedActionLabel }];

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
        status: 'complete' as const,
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
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);
    console.warn('[Assistant] Error communicating with assistant server endpoint:', err?.message || err);
    return null;
  }
}
