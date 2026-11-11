/**
 * Student Profile, Preference Memory & Local Storage Data Governance Module
 * 
 * Responsibilities:
 * 1. Maintain an explicit, editable student profile containing ONLY information
 *    the student has provided or confirmed.
 * 2. Keep profile fields strictly separate from transient chat messages.
 * 3. Separate temporary conversation exploration from deliberately saved preferences.
 * 4. Transparently explain Local Storage and provide complete deletion controls.
 * 5. Persist and restore student checklist items across reloads.
 */

import { ExtractedQueryFilters } from './types';
import { SESSIONS_STORAGE_KEY } from './sessionManager';

export type EducationContext = 'school_11' | 'college_spo' | 'graduate_past_years' | 'bachelor';

export interface SubjectScore {
  subject: string;
  score: number;
}

export type BudgetConstraint = 'only_budget' | 'paid_with_loan' | 'paid_direct' | 'any';
export type AccommodationNeed = 'required' | 'not_required' | 'local_resident' | 'unspecified';

export interface StudentProfile {
  educationContext?: EducationContext;
  subjects: SubjectScore[];
  totalScore?: number;
  preferredStudyAreas: string[];
  locationPreferences: string[];
  budgetConstraint: BudgetConstraint;
  maxAnnualFee?: number;
  accommodationNeed: AccommodationNeed;
  hasMilitaryPreference?: boolean;
  shortlistedUniversities: string[];
  shortlistedPrograms: string[];
  preferredLanguage: 'ru' | 'en';
  confirmedAt?: string;
  lastModifiedAt: string;
}

export interface PersistedChecklistState {
  artifactId: string;
  checkedItemIds: string[];
  lastModifiedAt: string;
}

export const PROFILE_STORAGE_KEY = 'vuzopedia_student_profile_v1';
export const CHECKLIST_STORAGE_KEY = 'vuzopedia_student_checklist_v1';

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  subjects: [],
  preferredStudyAreas: [],
  locationPreferences: [],
  budgetConstraint: 'any',
  accommodationNeed: 'unspecified',
  shortlistedUniversities: [],
  shortlistedPrograms: [],
  preferredLanguage: 'ru',
  lastModifiedAt: new Date().toISOString(),
};

/**
 * Loads the confirmed student profile from localStorage safely.
 * Returns default empty profile if none is saved.
 */
export function loadStudentProfile(): StudentProfile {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_STUDENT_PROFILE };
  }
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_STUDENT_PROFILE,
          ...parsed,
          subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
          preferredStudyAreas: Array.isArray(parsed.preferredStudyAreas) ? parsed.preferredStudyAreas : [],
          locationPreferences: Array.isArray(parsed.locationPreferences) ? parsed.locationPreferences : [],
          shortlistedUniversities: Array.isArray(parsed.shortlistedUniversities) ? parsed.shortlistedUniversities : [],
          shortlistedPrograms: Array.isArray(parsed.shortlistedPrograms) ? parsed.shortlistedPrograms : [],
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load student profile from localStorage:', err);
  }
  return { ...DEFAULT_STUDENT_PROFILE };
}

/**
 * Persists the confirmed student profile to localStorage.
 */
export function saveStudentProfile(profile: Partial<StudentProfile>): StudentProfile {
  const current = loadStudentProfile();
  const totalScore = (profile.subjects || current.subjects).reduce((sum, s) => sum + (Number(s.score) || 0), 0);

  const updated: StudentProfile = {
    ...current,
    ...profile,
    totalScore: totalScore > 0 ? totalScore : undefined,
    lastModifiedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save student profile to localStorage:', err);
    }
  }
  return updated;
}

/**
 * Clears the saved student profile from localStorage.
 */
export function clearStudentProfile(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear student profile:', err);
    }
  }
}

/**
 * Completely purges all assistant-related local storage items:
 * profile, chat history sessions, checklists, and cached settings.
 */
export function clearAllAssistantData(): {
  clearedKeys: string[];
  freedBytesEstimate: number;
} {
  const keysToPurge = [
    PROFILE_STORAGE_KEY,
    CHECKLIST_STORAGE_KEY,
    SESSIONS_STORAGE_KEY,
    'vuzopedia_favs',
    'vuzopedia_compare',
    'vuzopedia_my_plan',
  ];

  let freedBytes = 0;
  if (typeof window !== 'undefined' && window.localStorage) {
    for (const key of keysToPurge) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          freedBytes += val.length * 2;
          localStorage.removeItem(key);
        }
      } catch {}
    }
  }

  return {
    clearedKeys: keysToPurge,
    freedBytesEstimate: freedBytes,
  };
}

/**
 * Generates human-readable badges of confirmed preferences for UI display.
 */
export function getProfileSummaryBadges(profile: StudentProfile): Array<{ id: string; label: string; type: string }> {
  const badges: Array<{ id: string; label: string; type: string }> = [];

  if (profile.totalScore && profile.totalScore > 0) {
    const subjectsCount = profile.subjects.length;
    badges.push({
      id: 'score',
      label: `Сумма ЕГЭ: ${profile.totalScore} б.${subjectsCount > 0 ? ` (${subjectsCount} предм.)` : ''}`,
      type: 'score',
    });
  }

  if (profile.educationContext) {
    const eduLabels: Record<EducationContext, string> = {
      school_11: 'Выпускник 11 кл.',
      college_spo: 'Диплом СПО / колледж',
      graduate_past_years: 'Выпускник прошлых лет',
      bachelor: 'Бакалавр',
    };
    badges.push({
      id: 'edu',
      label: eduLabels[profile.educationContext] || profile.educationContext,
      type: 'edu',
    });
  }

  if (profile.locationPreferences.length > 0) {
    badges.push({
      id: 'locations',
      label: profile.locationPreferences.join(', '),
      type: 'location',
    });
  }

  if (profile.preferredStudyAreas.length > 0) {
    badges.push({
      id: 'areas',
      label: profile.preferredStudyAreas.join(', '),
      type: 'area',
    });
  }

  if (profile.budgetConstraint === 'only_budget') {
    badges.push({ id: 'budget', label: 'Только бюджет', type: 'budget' });
  } else if (profile.budgetConstraint === 'paid_with_loan') {
    badges.push({ id: 'budget', label: 'Платное с кредитом 3%', type: 'budget' });
  }

  if (profile.accommodationNeed === 'required') {
    badges.push({ id: 'dorm', label: 'Общежитие: обязательно', type: 'dorm' });
  } else if (profile.accommodationNeed === 'local_resident') {
    badges.push({ id: 'dorm', label: 'Общежитие: не требуется', type: 'dorm' });
  }

  if (profile.hasMilitaryPreference) {
    badges.push({ id: 'military', label: 'ВУЦ: желательно', type: 'military' });
  }

  return badges;
}

/**
 * Detects whether a student query is merely a hypothetical exploration
 * ("что если", "а если сдам биологию", "предположим 300 баллов"),
 * which MUST NOT overwrite or corrupt the student's confirmed profile.
 */
export function isHypotheticalQuery(prompt: string): boolean {
  if (!prompt || typeof prompt !== 'string') return false;
  const lower = prompt.toLowerCase();
  return (
    lower.includes('что если') ||
    lower.includes('а если ') ||
    lower.includes('допустим ') ||
    lower.includes('предположим ') ||
    lower.includes('гипотетически') ||
    lower.includes('чисто теоретически') ||
    lower.includes('просто интересно')
  );
}

/**
 * Merges deliberately saved student profile with temporary query filters.
 * Ensures temporary exploration does not overwrite confirmed student facts.
 */
export function mergeProfileWithQueryFilters(
  queryFilters: ExtractedQueryFilters,
  profile: StudentProfile,
  isHypothetical = false
): ExtractedQueryFilters {
  // If the query is hypothetical, strictly prioritize query filters for the current turn
  if (isHypothetical) {
    return { ...queryFilters };
  }

  const merged: ExtractedQueryFilters = { ...queryFilters };

  // Score: if user did not specify a score in this query, use confirmed profile score
  if (!merged.score && profile.totalScore) {
    merged.score = profile.totalScore;
  }

  // City: if query did not specify city, use first confirmed profile location
  if (!merged.city && profile.locationPreferences.length > 0) {
    merged.city = profile.locationPreferences[0];
  }

  // Dormitory: if query did not specify dorm constraint, use profile need
  if (merged.wantsDorm === undefined && profile.accommodationNeed !== 'unspecified') {
    merged.wantsDorm = profile.accommodationNeed === 'required';
    merged.isDormHard = profile.accommodationNeed === 'required';
  }

  // Military: if query did not specify military preference, use profile
  if (merged.isMilitaryHard === undefined && profile.hasMilitaryPreference !== undefined) {
    merged.isMilitaryHard = profile.hasMilitaryPreference;
  }

  // Budget only: if profile states only_budget
  if (merged.wantsBudgetOnly === undefined && profile.budgetConstraint === 'only_budget') {
    merged.wantsBudgetOnly = true;
  }

  return merged;
}

/**
 * Loads persisted checklist state for a specific artifact ID.
 */
export function loadPersistedChecklist(artifactId: string): string[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (raw) {
      const records: Record<string, string[]> = JSON.parse(raw);
      if (records && records[artifactId] && Array.isArray(records[artifactId])) {
        return records[artifactId];
      }
    }
  } catch (err) {
    console.warn('Failed to load checklist persistence:', err);
  }
  return [];
}

/**
 * Saves checklist checked item IDs to localStorage so state persists across sessions.
 */
export function savePersistedChecklist(artifactId: string, checkedItemIds: string[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    let records: Record<string, string[]> = {};
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (raw) {
      try {
        records = JSON.parse(raw) || {};
      } catch {}
    }
    records[artifactId] = checkedItemIds;
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save checklist persistence:', err);
  }
}
