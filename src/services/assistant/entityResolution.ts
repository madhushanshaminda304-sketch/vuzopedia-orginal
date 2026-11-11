import { UNIVERSITIES } from '../../data/mockData';
import { University } from '../../types';

interface UniversityAliasMap {
  id: string;
  aliases: string[];
}

const UNIVERSITY_ALIASES: UniversityAliasMap[] = [
  {
    id: 'mgu',
    aliases: ['мгу', 'ломоносов', 'мгу им', 'московский государственный университет'],
  },
  {
    id: 'hse',
    aliases: ['вшэ', 'вышк', 'ниу вшэ', 'высшая школа экономики', 'hse'],
  },
  {
    id: 'bmstu',
    aliases: ['бауман', 'мгту', 'мгту им', 'бауманка', 'bmstu'],
  },
  {
    id: 'mipt',
    aliases: ['мфти', 'физтех', 'mipt'],
  },
  {
    id: 'itmo',
    aliases: ['итмо', 'itmo'],
  },
  {
    id: 'mephi',
    aliases: ['мифи', 'нияу мифи', 'mephi'],
  },
  {
    id: 'mirea',
    aliases: ['мирэа', 'рту мирэа', 'mirea'],
  },
  {
    id: 'spbu',
    aliases: ['спбгу', 'санкт-петербургский государственный университет', 'spbu'],
  },
  {
    id: 'ranepa',
    aliases: ['ранхигс', 'президентская академия', 'ranepa'],
  },
  {
    id: 'mpei',
    aliases: ['мэи', 'ниу мэи', 'энергетический', 'mpei'],
  },
  {
    id: 'misis',
    aliases: ['мисис', 'ниту мисис', 'misis'],
  },
];

/**
 * Resolves a single university by exact ID or common Russian alias.
 */
export function resolveUniversity(identifierOrAlias: string): University | undefined {
  const norm = identifierOrAlias.trim().toLowerCase();
  if (!norm) return undefined;

  // Direct match by ID
  const direct = UNIVERSITIES.find((u) => u.id.toLowerCase() === norm);
  if (direct) return direct;

  // Match by alias
  const aliasMatch = UNIVERSITY_ALIASES.find(
    (item) => item.id === norm || item.aliases.some((a) => norm.includes(a) || a.includes(norm))
  );

  if (aliasMatch) {
    return UNIVERSITIES.find((u) => u.id === aliasMatch.id);
  }

  // Match by shortName or fullName
  return UNIVERSITIES.find(
    (u) => u.shortName.toLowerCase() === norm || u.fullName.toLowerCase().includes(norm)
  );
}

/**
 * Scans input text and returns all universities mentioned by abbreviation, alias, or name.
 */
export function findMentionedUniversities(text: string): University[] {
  const t = text.toLowerCase();
  const matched: University[] = [];
  const matchedIds = new Set<string>();

  for (const item of UNIVERSITY_ALIASES) {
    const isHit = item.aliases.some((alias) => {
      // Regex boundary check for short aliases like "мгу", "вшэ"
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(^|[^а-яa-z0-9])${escaped}([^а-яa-z0-9]|$)`, 'i');
      return pattern.test(t);
    });

    if (isHit && !matchedIds.has(item.id)) {
      const vuz = UNIVERSITIES.find((u) => u.id === item.id);
      if (vuz) {
        matched.push(vuz);
        matchedIds.add(item.id);
      }
    }
  }

  // Also check direct shortName matching
  for (const u of UNIVERSITIES) {
    if (!matchedIds.has(u.id)) {
      const sName = u.shortName.toLowerCase();
      if (t.includes(sName)) {
        matched.push(u);
        matchedIds.add(u.id);
      }
    }
  }

  return matched;
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
