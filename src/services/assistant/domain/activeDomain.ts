import { AdmissionsDomainConfig } from './types';
import { russiaAdmissionsDomain } from './russiaDomain';
import { unipediaAdmissionsDomain } from './unipediaDomain';
import { SupportedLanguage } from '../i18n';

const registeredDomains: Map<string, AdmissionsDomainConfig> = new Map([
  [russiaAdmissionsDomain.id, russiaAdmissionsDomain],
  [unipediaAdmissionsDomain.id, unipediaAdmissionsDomain],
]);

export const ACTIVE_DOMAIN_STORAGE_KEY = 'vuzopedia_active_domain_v1';

let activeDomainId: string = russiaAdmissionsDomain.id;

/**
 * Returns the currently active admissions domain configuration.
 * Defaults to the Russian higher education domain (Vuzopedia).
 */
export function getActiveDomain(): AdmissionsDomainConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(ACTIVE_DOMAIN_STORAGE_KEY);
      if (saved && registeredDomains.has(saved)) {
        return registeredDomains.get(saved)!;
      }
    } catch {}
  }
  return registeredDomains.get(activeDomainId) || russiaAdmissionsDomain;
}

/**
 * Sets the active admissions domain (e.g. for switching to UniPedia).
 */
export function setActiveDomain(domainId: string): boolean {
  if (registeredDomains.has(domainId)) {
    activeDomainId = domainId;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(ACTIVE_DOMAIN_STORAGE_KEY, domainId);
      } catch {}
    }
    return true;
  }
  return false;
}

/**
 * Lists all registered admissions domains.
 */
export function getRegisteredDomains(): AdmissionsDomainConfig[] {
  return Array.from(registeredDomains.values());
}

/**
 * Formats monetary amounts using active domain currency settings.
 */
export function formatDomainCurrency(amount: number, lang?: SupportedLanguage): string {
  const domain = getActiveDomain();
  return domain.currency.formatAmount(amount, lang);
}
