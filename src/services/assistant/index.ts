import {
  AssistantResponse,
  ResponseMode,
  SpecialistMode,
  RAGScopeFilter,
  ValidatedAction,
  ValidActionTab,
  AdmissionProbability,
  ComparisonMatrix,
  ClarificationOption,
  ArtifactChecklistItem,
  ArtifactStep,
  AdmissionArtifact,
  RetrievedCitationChunk,
  ExtractedQueryFilters,
  ToolCall,
  validateAssistantResponse,
} from './types';
import { retrieveAssistantContext, RetrievalContext } from './dataRetrieval';
import { callGeminiProvider, callGeminiStreamingProvider, fetchServerAssistantStatus } from './aiProvider';
import { queryLocalEngine } from './localEngine';
import { isSupportedFactualLookup } from './queryInterpretation';

export * from './types';
export * from './entityResolution';
export * from './navigationActions';
export * from './queryInterpretation';
export * from './evidenceSources';
export * from './dataRetrieval';
export * from './aiProvider';
export * from './localEngine';
export * from './sessionManager';
export * from './studentProfile';
export { UNIVERSITIES } from '../../data/mockData';
export { FULL_PROGRAMS } from '../../data/extendedData';

export interface QueryAssistantOptions {
  onStreamChunk?: (accumulatedText: string) => void;
  abortSignal?: AbortSignal;
}

/**
 * Main coordinated entry point for Ded Vuzoped Assistant.
 * 1. Immediate local response for supported factual lookups & deterministic tools.
 * 2. No provider request when configuration is missing.
 * 3. Real-time streaming AI execution via Gemini provider when appropriate.
 * 4. Graceful instant local engine fallback.
 */
export async function queryAssistant(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }> = [],
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all',
  options?: QueryAssistantOptions
): Promise<AssistantResponse> {
  const startTime = performance.now();

  // 1. Ground-truth retrieval and intent analysis (with conversation history for anaphora resolution)
  const context = retrieveAssistantContext(prompt, mode, scope, history);

  // 2. Requirement 1: Immediate local answers for supported factual lookups and deterministic tools
  if (isSupportedFactualLookup(context, prompt)) {
    return queryLocalEngine(prompt, startTime, context);
  }

  // 3. Requirement 2: No provider request when configuration is missing
  const serverStatus = await fetchServerAssistantStatus();
  if (!serverStatus.aiAvailable) {
    return queryLocalEngine(prompt, startTime, context);
  }

  // 4. Requirement 3, 5, 8, 9, 10: Streaming AI Generation via Gemini Provider
  try {
    const aiResponse = await callGeminiStreamingProvider(
      prompt,
      history,
      context,
      startTime,
      options?.onStreamChunk,
      options?.abortSignal
    );
    if (aiResponse) {
      return aiResponse;
    }
  } catch (err) {
    console.warn('Gemini streaming provider encountered an issue; using local engine:', err);
  }

  // 5. Fallback to Local Engine
  return queryLocalEngine(prompt, startTime, context);
}
