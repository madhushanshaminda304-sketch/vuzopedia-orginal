import { UNIVERSITIES } from '../../data/mockData';
import { University } from '../../types';
import { AmbiguousEntity } from './types';

export interface UniversityAliasMap {
  id: string;
  acronyms: string[];
  canonicalNames: string[];
  stemPatterns: string[];
}

/**
 * Explicit, strictly isolated alias mappings per university.
 * Under NO circumstances are aliases shared, merged, or dynamically cross-assigned.
 */
export const UNIVERSITY_EXPLICIT_ALIASES: UniversityAliasMap[] = [
  {
    id: 'bmstu',
    acronyms: ['мгту', 'мгту им', 'bmstu'],
    canonicalNames: [
      'мгту им баумана',
      'мгту им н э баумана',
      'мгту баумана',
      'московский государственный технический университет имени н э баумана',
      'бауманский университет',
    ],
    stemPatterns: ['бауманка', 'баумана', 'бауманский', 'бауманец', 'бауман'],
  },
  {
    id: 'mgu',
    acronyms: ['мгу', 'msu'],
    canonicalNames: [
      'мгу им ломоносова',
      'мгу им м в ломоносова',
      'московский государственный университет',
      'московский университет имени ломоносова',
    ],
    stemPatterns: ['ломоносовский', 'ломоносова'],
  },
  {
    id: 'hse',
    acronyms: ['вшэ', 'ниу вшэ', 'hse'],
    canonicalNames: [
      'высшая школа экономики',
      'национальный исследовательский университет высшая школа экономики',
    ],
    stemPatterns: ['вышка', 'вышкинский', 'вышкинцы'],
  },
  {
    id: 'mipt',
    acronyms: ['мфти', 'mipt'],
    canonicalNames: [
      'московский физико технический институт',
      'физико технический институт',
    ],
    stemPatterns: ['физтех', 'физтеха', 'физтеховский'],
  },
  {
    id: 'itmo',
    acronyms: ['итмо', 'itmo'],
    canonicalNames: ['университет итмо', 'санкт петербургский национальный исследовательский университет итмо'],
    stemPatterns: ['итмошный', 'итмошник'],
  },
  {
    id: 'mephi',
    acronyms: ['мифи', 'нияу мифи', 'mephi'],
    canonicalNames: [
      'национальный исследовательский ядерный университет мифи',
      'московский инженерно физический институт',
    ],
    stemPatterns: ['мифист', 'мифический'],
  },
  {
    id: 'spbu',
    acronyms: ['спбгу', 'spbu'],
    canonicalNames: [
      'санкт петербургский государственный университет',
      'питерский государственный университет',
    ],
    stemPatterns: ['петербургский госуниверситет', 'спбгушный'],
  },
  {
    id: 'sechenov',
    acronyms: ['мгму', 'sechenov'],
    canonicalNames: [
      'сеченовский университет',
      'первый мгму им сеченова',
      'первый мед',
      '1 мед',
      'первый московский государственный медицинский университет',
    ],
    stemPatterns: ['сеченовка', 'сеченовский', 'сеченова'],
  },
  {
    id: 'kfu',
    acronyms: ['кфу', 'kfu'],
    canonicalNames: ['казанский федеральный университет', 'казанский государственный университет'],
    stemPatterns: ['казанский федеральный'],
  },
  {
    id: 'nsu',
    acronyms: ['нгу', 'nsu'],
    canonicalNames: ['новосибирский государственный университет', 'новосибирский госуниверситет'],
    stemPatterns: ['новосибирский универ'],
  },
  {
    id: 'urfu',
    acronyms: ['урфу', 'urfu'],
    canonicalNames: [
      'уральский федеральный университет',
      'уральский федеральный университет имени первого президента россии б н ельцина',
    ],
    stemPatterns: ['уральский федеральный'],
  },
  {
    id: 'tpu',
    acronyms: ['тпу', 'tpu'],
    canonicalNames: [
      'томский политехнический университет',
      'томский политех',
    ],
    stemPatterns: ['томский политехнический'],
  },
  {
    id: 'mirea',
    acronyms: ['мирэа', 'рту мирэа', 'mirea'],
    canonicalNames: ['российский технологический университет мирэа'],
    stemPatterns: ['мирэа'],
  },
  {
    id: 'ranepa',
    acronyms: ['ранхигс', 'ranepa'],
    canonicalNames: [
      'российская академия народного хозяйства и государственной службы',
      'президентская академия',
    ],
    stemPatterns: ['ранхигс'],
  },
  {
    id: 'mpei',
    acronyms: ['мэи', 'ниу мэи', 'mpei'],
    canonicalNames: ['национальный исследовательский университет мэи', 'московский энергетический институт'],
    stemPatterns: ['энергетический институт'],
  },
  {
    id: 'misis',
    acronyms: ['мисис', 'ниту мисис', 'misis'],
    canonicalNames: ['национальный исследовательский технологический университет мисис', 'институт стали и сплавов'],
    stemPatterns: ['мисис'],
  },
];

/**
 * Ambiguous terms that might refer to multiple institutions.
 */
export const AMBIGUOUS_ALIASES: Array<{
  term: string;
  regex: RegExp;
  candidates: Array<{ id: string; name: string; city: string; description: string }>;
}> = [
  {
    term: 'политех',
    regex: /(^|[^а-яa-z0-9])(политех|политехническ[а-я]*)([^а-яa-z0-9]|$)/i,
    candidates: [
      {
        id: 'bmstu',
        name: 'МГТУ им. Н.Э. Баумана',
        city: 'Москва',
        description: 'Главный технический университет страны (бывш. МВТУ)',
      },
      {
        id: 'tpu',
        name: 'Томский политехнический университет (ТПУ)',
        city: 'Томск',
        description: 'Ведущий политехнический вуз Сибири',
      },
    ],
  },
  {
    term: 'мед',
    regex: /(^|[^а-яa-z0-9])(мед|медицинск[а-я]*)([^а-яa-z0-9]|$)/i,
    candidates: [
      {
        id: 'sechenov',
        name: 'Сеченовский Университет (1-й Мед)',
        city: 'Москва',
        description: 'Крупнейший медицинский вуз России',
      },
    ],
  },
];

/**
 * Normalizes input string:
 * - Replaces punctuation, quotes, hyphens, and slashes with single spaces
 * - Converts 'ё' to 'е'
 * - Collapses repeated whitespace
 * - Trims and lowercases
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()«»"“”'?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves a single university by exact ID or isolated alias.
 */
export function resolveUniversity(identifierOrAlias: string): University | undefined {
  const norm = normalizeText(identifierOrAlias);
  if (!norm) return undefined;

  // Level 1: Direct ID match
  const direct = UNIVERSITIES.find((u) => u.id.toLowerCase() === norm);
  if (direct) return direct;

  // Level 2: Exact acronym match
  for (const item of UNIVERSITY_EXPLICIT_ALIASES) {
    if (item.acronyms.some((a) => normalizeText(a) === norm)) {
      return UNIVERSITIES.find((u) => u.id === item.id);
    }
  }

  // Level 3: Canonical names
  for (const item of UNIVERSITY_EXPLICIT_ALIASES) {
    if (item.canonicalNames.some((c) => normalizeText(c) === norm)) {
      return UNIVERSITIES.find((u) => u.id === item.id);
    }
  }

  // Level 4: Stems / spelling variations
  for (const item of UNIVERSITY_EXPLICIT_ALIASES) {
    if (item.stemPatterns.some((s) => normalizeText(s) === norm)) {
      return UNIVERSITIES.find((u) => u.id === item.id);
    }
  }

  // Fallback: check shortName or fullName
  return UNIVERSITIES.find((u) => {
    const sName = normalizeText(u.shortName);
    const fName = normalizeText(u.fullName);
    return sName === norm || fName.includes(norm);
  });
}

export interface EntityMentionResult {
  matchedUniversities: University[];
  ambiguousEntity?: AmbiguousEntity;
  isAmbiguous: boolean;
}

/**
 * Scans input text and returns mentioned universities.
 * Uses strict word-boundary matching and isolated aliases per university.
 * Detects ambiguous references (e.g. "политех") when no specific institution was named.
 */
export function findMentionedUniversitiesDetailed(text: string): EntityMentionResult {
  const norm = ` ${normalizeText(text)} `;
  const matched: University[] = [];
  const matchedIds = new Set<string>();

  // 1. Check exact acronyms with strict word boundaries
  for (const item of UNIVERSITY_EXPLICIT_ALIASES) {
    for (const acronym of item.acronyms) {
      const normA = normalizeText(acronym);
      const escaped = normA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, 'i');
      if (pattern.test(norm)) {
        if (!matchedIds.has(item.id)) {
          const vuz = UNIVERSITIES.find((u) => u.id === item.id);
          if (vuz) {
            matched.push(vuz);
            matchedIds.add(item.id);
          }
        }
        break;
      }
    }
  }

  // 2. Check canonical multi-word phrases
  for (const item of UNIVERSITY_EXPLICIT_ALIASES) {
    if (matchedIds.has(item.id)) continue;
    for (const phrase of item.canonicalNames) {
      const normPhrase = normalizeText(phrase);
      if (norm.includes(` ${normPhrase} `)) {
        const vuz = UNIVERSITIES.find((u) => u.id === item.id);
        if (vuz) {
          matched.push(vuz);
          matchedIds.add(item.id);
        }
        break;
      }
    }
  }

  // 3. Check stem patterns with word boundaries (e.g. \bбауман[а-я]*\b strictly for bmstu)
  for (const item of UNIVERSITY_EXPLICIT_ALIASES) {
    if (matchedIds.has(item.id)) continue;
    for (const stem of item.stemPatterns) {
      const normStem = normalizeText(stem);
      const escaped = normStem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?:^|\\s)${escaped}[а-я0-9]*(?:\\s|$)`, 'i');
      if (pattern.test(norm)) {
        const vuz = UNIVERSITIES.find((u) => u.id === item.id);
        if (vuz) {
          matched.push(vuz);
          matchedIds.add(item.id);
        }
        break;
      }
    }
  }

  // 4. Ambiguity detection: check if query contains ambiguous terms without a concrete university
  let ambiguousEntity: AmbiguousEntity | undefined;
  if (matched.length === 0) {
    for (const amb of AMBIGUOUS_ALIASES) {
      if (amb.regex.test(text)) {
        ambiguousEntity = {
          term: amb.term,
          candidates: amb.candidates,
        };
        break;
      }
    }
  }

  return {
    matchedUniversities: matched,
    ambiguousEntity,
    isAmbiguous: Boolean(ambiguousEntity),
  };
}

/**
 * Backward-compatible helper returning matched universities list.
 */
export function findMentionedUniversities(text: string): University[] {
  return findMentionedUniversitiesDetailed(text).matchedUniversities;
}

/**
 * Extracts all university IDs referenced in formatted tokens like [vuz:mgu:МГУ].
 */
export function extractReferencedEntityIds(text: string): string[] {
  const regex = /\[vuz:([a-z0-9_-]+):[^\]]+\]/gi;
  const ids = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawId = match[1].toLowerCase();
    const resolved = resolveUniversity(rawId);
    if (resolved) {
      ids.add(resolved.id);
    }
  }

  return Array.from(ids);
}

/**
 * Resolves active university entity from conversation history for follow-up questions
 * (e.g. "А что с общежитием?", "Сколько стоит обучение в нём?", "What about its hostel?").
 */
export function resolveActiveEntityFromHistory(
  query: string,
  history: Array<{ sender: string; text: string }> = []
): University | undefined {
  if (!history || history.length === 0) return undefined;

  // Detect anaphoric pronoun / follow-up references
  const anaphoricPattern =
    /(?:^|[^а-яa-z0-9])(там|туда|в нем|в нём|у него|у нее|в этом вузе|в данном вузе|его|ее|вуз|вузе|its|there|at this university)(?:[^а-яa-z0-9]|$)/i;

  const isFollowUpPattern =
    anaphoricPattern.test(query) ||
    /^(а |и |но )?(какие|сколько|какой|есть ли|а что с|что насчет|как с|условия|проходной|общежити|вуц|военн)/i.test(
      query.trim()
    );

  if (!isFollowUpPattern) return undefined;

  // Look backwards through conversation history for referenced universities
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];

    // Check [vuz:id:Name] tokens in assistant text
    const tokenIds = extractReferencedEntityIds(msg.text);
    if (tokenIds.length > 0) {
      const vuz = UNIVERSITIES.find((u) => u.id === tokenIds[0]);
      if (vuz) return vuz;
    }

    // Check direct mentions in user or assistant text
    const mentions = findMentionedUniversities(msg.text);
    if (mentions.length > 0) {
      return mentions[0];
    }
  }

  return undefined;
}
