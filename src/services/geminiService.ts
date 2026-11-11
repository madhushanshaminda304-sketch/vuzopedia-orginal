/**
 * Honest Retrieval & Gemini Service Adapter for Ded Vuzoped Assistant
 *
 * This module re-exports cohesive assistant submodules from `src/services/assistant/`
 * ensuring seamless backward compatibility for existing consumers and test scripts.
 */

import {
  queryAssistant,
  retrieveAssistantContext,
  RetrievalContext,
  SpecialistMode,
  RAGScopeFilter,
  AdmissionProbability,
  ComparisonMatrix,
  ClarificationOption,
  AdmissionArtifact,
  RetrievedCitationChunk,
  ExtractedQueryFilters,
  ToolCall,
} from './assistant';
import { University } from '../types';

export * from './assistant';

export type RAGRetrievalResult = RetrievalContext;

export interface GeneratedAssistantResponse {
  reply: string;
  toolCall: {
    name: string;
    query: string;
    duration?: string;
    status: 'complete' | 'running' | 'error';
  };
  actionTab?: string;
  actionLabel?: string;
  suggestions: string[];
  followUps?: string[];
  clarificationOptions?: ClarificationOption[];
  comparisonMatrix?: ComparisonMatrix;
  citationChunks?: RetrievedCitationChunk[];
  extractedFilters?: ExtractedQueryFilters;
  modelUsed: 'gemini' | 'local';
  matchedUniversities?: University[];
  reasoningTrace?: string[];
  probability?: AdmissionProbability;
  artifact?: AdmissionArtifact;
}

/**
 * Backward-compatible query function delegating to modular queryAssistant.
 */
export async function queryDedAssistant(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }> = [],
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all',
  options?: any
): Promise<GeneratedAssistantResponse> {
  const resp = await queryAssistant(prompt, history, mode, scope, options);

  const primaryAction = resp.validatedActions[0];

  return {
    reply: resp.text,
    toolCall: resp.toolCall,
    actionTab: primaryAction?.tabId,
    actionLabel: primaryAction?.label,
    suggestions: resp.suggestions,
    followUps: resp.followUps,
    clarificationOptions: resp.clarificationQuestions,
    comparisonMatrix: resp.comparison,
    citationChunks: resp.citationChunks,
    extractedFilters: resp.extractedFilters,
    modelUsed: resp.mode,
    matchedUniversities: resp.matchedUniversities,
    reasoningTrace: resp.reasoningTrace,
    probability: resp.probability,
    artifact: resp.artifact,
  };
}

/**
 * Backward-compatible context retrieval function.
 */
export function retrieveRAGContext(
  query: string,
  mode: SpecialistMode = 'all',
  scope: RAGScopeFilter = 'all',
  history: Array<{ sender: 'ded' | 'user'; text: string }> = []
): RAGRetrievalResult {
  return retrieveAssistantContext(query, mode, scope, history);
}
