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
import { callGeminiProvider } from './aiProvider';
import { queryLocalEngine } from './localEngine';

export * from './types';
export * from './entityResolution';
export * from './navigationActions';
export * from './queryInterpretation';
export * from './evidenceSources';
export * from './dataRetrieval';
export * from './aiProvider';
export * from './localEngine';
export * from './sessionManager';

/**
 * Main coordinated entry point for Ded Vuzoped Assistant.
 * Queries Gemini if available and valid; otherwise falls back gracefully to local engine.
 * Always guarantees a strongly typed, validated AssistantResponse.
 */
export async function queryAssistant(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }> = [],
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all'
): Promise<AssistantResponse> {
  const startTime = performance.now();

  // 1. Ground-truth retrieval and intent analysis (with conversation history for anaphora resolution)
  const context = retrieveAssistantContext(prompt, mode, scope, history);

  // 2. Attempt AI Generation via Gemini Provider
  try {
    const aiResponse = await callGeminiProvider(prompt, history, context, startTime);
    if (aiResponse) {
      return aiResponse;
    }
  } catch (err) {
    console.warn('Gemini provider encountered an issue; using local engine:', err);
  }

  // 3. Fallback to Local Engine
  return queryLocalEngine(prompt, startTime, context);
}
