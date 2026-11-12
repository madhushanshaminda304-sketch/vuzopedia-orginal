import { SupportedLanguage, AssistantDictionary, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { ruDictionary } from './ru';
import { enDictionary } from './en';
import { siDictionary } from './si';
import { taDictionary } from './ta';

export * from './types';

const dictionaries: Record<SupportedLanguage, AssistantDictionary> = {
  ru: ruDictionary,
  en: enDictionary,
  si: siDictionary,
  ta: taDictionary,
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ru';
export const LANGUAGE_STORAGE_KEY = 'vuzopedia_assistant_lang_v1';

/**
 * Loads preferred language from localStorage with safe fallback.
 */
export function getSavedLanguage(): SupportedLanguage {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (saved && dictionaries[saved]) {
        return saved;
      }
    } catch {}
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Saves preferred language to localStorage.
 */
export function saveLanguage(lang: SupportedLanguage): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
  }
}

/**
 * Returns the dictionary for the specified or current language.
 */
export function getDictionary(lang?: SupportedLanguage): AssistantDictionary {
  const selected = lang || getSavedLanguage();
  return dictionaries[selected] || dictionaries[DEFAULT_LANGUAGE];
}

/**
 * Translation helper with fallback.
 */
export function t(key: keyof AssistantDictionary, lang?: SupportedLanguage): string {
  const dict = getDictionary(lang);
  const val = dict[key];
  if (val) return val;
  return dictionaries[DEFAULT_LANGUAGE][key] || (key as string);
}

/**
 * Returns speech recognition locale string for Web Speech API (e.g. 'si-LK', 'ta-LK', 'ru-RU', 'en-US').
 */
export function getSpeechLocale(lang: SupportedLanguage): string {
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  return match ? match.speechLocale : 'ru-RU';
}
