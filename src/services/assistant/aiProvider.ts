import { AssistantResponse, validateAssistantResponse } from './types';
import { RetrievalContext } from './dataRetrieval';
import { parseAndExtractActions } from './navigationActions';
import { extractReferencedEntityIds } from './entityResolution';

const STORAGE_KEY = 'vuzopedia_gemini_api_key';
export const DEFAULT_GEMINI_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

export const getStoredApiKey = (): string => {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && key.trim() ? key.trim() : DEFAULT_GEMINI_KEY;
  } catch {
    return DEFAULT_GEMINI_KEY;
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const resetStoredApiKey = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const SYSTEM_INSTRUCTION_BASE = `Ты — Дед Вузопед, доброжелательный консультант портала Вузопедия (vuzopedia.ru) по приёмной кампании 2026 года.
Твоя цель — дать абитуриенту или родителю ясный, структурированный, честный и практически применимый ответ.

ВАЖНЫЕ ПРАВИЛА ЧЕСТНОСТИ И ТОЧНОСТИ:
1. **Строго по фактам**:
   - Опирайся на переданный контекст из локальной базы данных Вузопедии.
   - Если информации о каком-то конкретном вузе, направлении или общежитии нет в переданном контексте, прямо и честно скажи: «В моей локальной базе нет подробных данных по этому запросу». Не выдумывай несуществующие баллы, кафедры или правила.
   - Не заявляй, что у тебя есть доступ к «онлайн-выгрузке ФИС ГИА в реальном времени» или «живому поиску в интернете». Твои данные — это справочный каталог вузов и правила приёма прошлых лет.
2. **Проходные баллы — это ориентир, а не гарантия**:
   - Ясно поясняй, что проходные баллы из базы — это минимальные баллы зачисленных на бюджет в прошлые приёмные кампании. Конкурс 2026 года зависит от реального числа поданных заявлений.
3. **Прямой ответ сразу**:
   - Начинай с 1–2 ёмких предложений с прямым выводом по сути вопроса. Избегай пустых шаблонных вступлений.
4. **Сравнительные таблицы**:
   - При сравнении двух и более вузов формируй Markdown таблицу (| Критерий | Вуз 1 | Вуз 2 |).
5. **Инлайн-ссылки на вузы**:
   - Используй строгий формат токенов: [vuz:<id>:<КраткоеНазвание>], например: [vuz:mgu:МГУ], [vuz:hse:НИУ ВШЭ], [vuz:bmstu:МГТУ им. Баумана], [vuz:mirea:РТУ МИРЭА], [vuz:itmo:ИТМО].
6. **Конструктивная поддержка**:
   - Если баллов недостаточно для бюджета в выбранный вуз, прямо скажи об этом и предложи альтернативные варианты: запасные вузы, целевое обучение, льготный кредит 3% или скидки на платном отделении.
7. **Инструменты и действия в конце ответа**:
   [TOOL: <Название инструмента> | <Краткий поисковый запрос/база данных>]
   [ACTION: <tab_id> | <Название кнопки>]

Доступные tab_id:
- calculator (Калькулятор ЕГЭ 2026)
- programs (Каталог программ бакалавриата и специалитета)
- comparison (Сравнение выбранных вузов)
- military (Военные учебные центры ВУЦ)
- dorms (Каталог студенческих общежитий)
- olympiads (БВИ и олимпиады РСОШ)
- credit (Образовательный кредит 3%)
- achievements (Учет индивидуальных достижений +10 баллов)
- budget (Калькулятор бюджета студента)
- target (Целевое обучение от предприятий)
- catalog (Каталог вузов России)`;

/**
 * Communicates with the Google Gemini API, parsing raw untrusted model output into a validated AssistantResponse.
 * Returns null if the API call fails or API key is not present.
 */
export async function callGeminiProvider(
  prompt: string,
  history: Array<{ sender: 'ded' | 'user'; text: string }>,
  context: RetrievalContext,
  startTime: number
): Promise<AssistantResponse | null> {
  const apiKey = getStoredApiKey();
  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  const augmentedSystemInstruction = `${SYSTEM_INSTRUCTION_BASE}

СПРАВОЧНЫЙ КОНТЕКСТ ИЗ ЛОКАЛЬНОГО КАТАЛОГА ВУЗОПЕДИИ:
${context.evidence}

Используй эти факты, баллы, таблицы и инлайн-ссылки [vuz:id:Name] в ответе! Если данных недостаточно для ответа на вопрос, честно сообщи об этом.`;

  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  for (const model of modelsToTry) {
    let timeoutId: any = null;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = [
        ...history.slice(-4).map((h) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: augmentedSystemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`Gemini API model ${model} returned status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText && typeof rawText === 'string' && rawText.trim()) {
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
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn(`Error querying Gemini model ${model}:`, err);
    }
  }

  return null;
}
