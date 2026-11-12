/**
 * Admissions Domain Layer Type Contracts
 * 
 * Separates country-specific admissions regulations, institutional schemas,
 * currency, cutoff metrics, and qualification criteria from the core
 * conversational engine, enabling multi-country deployment (Vuzopedia -> UniPedia).
 */

import { SupportedLanguage } from '../i18n';

export type PathwayType = 'state_quota' | 'private_non_state' | 'transfer_or_other';

export interface CurrencyConfig {
  code: string;           // 'RUB', 'LKR', etc.
  symbol: string;         // '₽', 'Rs.', 'රු.', 'ரூ.'
  position: 'before' | 'after';
  formatAmount: (amount: number, lang?: SupportedLanguage) => string;
}

export interface LocaleConfig {
  defaultLocale: string;
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
}

export interface DomainFieldOption {
  value: string;
  label: Record<SupportedLanguage, string>;
}

export interface ProfileFieldDefinition {
  id: string;
  label: Record<SupportedLanguage, string>;
  type: 'select' | 'text' | 'number' | 'multiselect' | 'grade_list';
  pathwayScope?: PathwayType[];
  required: boolean;
  options?: DomainFieldOption[];
  helperText?: Record<SupportedLanguage, string>;
}

export interface EligibilityEvaluationResult {
  status: 'eligible' | 'ineligible' | 'requires_clarification' | 'missing_official_data';
  reasons: string[];
  missingFields: string[];
  applicableRules: string[];
  disclaimer: string;
}

export interface CutoffComparisonResult {
  metricName: string;
  metricType: 'total_points' | 'z_score' | 'grade_profile';
  historicalYear: number;
  historicalThreshold?: number | string;
  studentValue?: number | string;
  status: 'above_historical' | 'below_historical' | 'unavailable' | 'indeterminate';
  explanation: string;
  disclaimer: string;
}

export interface AdmissionsPathwayModel {
  id: string;
  name: Record<SupportedLanguage, string>;
  type: PathwayType;
  description: Record<SupportedLanguage, string>;
  governingAuthority: string;
  profileFields: ProfileFieldDefinition[];
  eligibilityNotes: Record<SupportedLanguage, string>;
}

export interface DomainSourceDocument {
  id: string;
  title: string;
  publisher: string;
  applicableYear: number;
  officialUrl?: string;
  isVerified: boolean;
  notes?: string;
}

export interface AdmissionsDomainConfig {
  id: string;
  countryCode: string;
  countryName: Record<SupportedLanguage, string>;
  currency: CurrencyConfig;
  locale: LocaleConfig;
  pathways: AdmissionsPathwayModel[];
  sourceDocuments: DomainSourceDocument[];
  actionMappings: Record<string, string>;
  terminology: Record<string, Record<SupportedLanguage, string>>;
  evaluateEligibility: (profile: any, programId?: string) => EligibilityEvaluationResult;
  compareCutoffs: (studentScoreOrZ: any, historicalThreshold: any, year: number) => CutoffComparisonResult;
}
