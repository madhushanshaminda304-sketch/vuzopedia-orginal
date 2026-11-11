import { AssistantResponse, validateAssistantResponse, ValidatedAction } from './types';
import { RetrievalContext } from './dataRetrieval';
import { extractReferencedEntityIds } from './entityResolution';

/**
 * Generates local grounded responses relying strictly on curated catalog records.
 * Acts as primary offline engine and resilient fallback.
 */
export function queryLocalEngine(
  query: string,
  startTime: number,
  context: RetrievalContext
): AssistantResponse {
  const durationMs = Math.round(performance.now() - startTime);

  let replyText = '';
  let missingInfoNotice: string | undefined;

  if (context.isUnderspecified && context.clarificationOptions) {
    replyText =
      `Чтобы подобрать подходящие варианты из каталога вузов, укажите ключевые параметры:\n\n` +
      `1. **Ваши предметы ЕГЭ и примерную сумму баллов**\n` +
      `2. **Желаемый город или направление обучения** (IT, инженерия, экономика и др.)\n\n` +
      `Вы можете выбрать один из готовых сценариев ниже либо ввести свои баллы:`;
  } else if (context.isComparison && context.comparisonMatrix && context.matchedUniversities.length >= 2) {
    const v1 = context.matchedUniversities[0];
    const v2 = context.matchedUniversities[1];
    replyText =
      `## Сравнительный анализ: [vuz:${v1.id}:${v1.shortName}] vs [vuz:${v2.id}:${v2.shortName}]\n\n` +
      `Сравнение на основе данных локального каталога Вузопедии:\n\n` +
      `| Критерий | ${v1.shortName} | ${v2.shortName} |\n` +
      `|---|---|---|\n` +
      context.comparisonMatrix.rows
        .map((r) => `| ${r.criterion} | ${r.values[0]} | ${r.values[1]} |`)
        .join('\n') +
      `\n\n` +
      `### Справочный вывод:\n` +
      `• **[vuz:${v1.id}:${v1.shortName}]**: минимальный проходной балл прошлых лет от ${v1.minBudgetScore} б., бюджетных мест: ${v1.totalBudgetPlaces}.\n` +
      `• **[vuz:${v2.id}:${v2.shortName}]**: минимальный проходной балл прошлых лет от ${v2.minBudgetScore} б., бюджетных мест: ${v2.totalBudgetPlaces}.\n\n` +
      `*Примечание: приведены ориентировочные проходные баллы прошлых лет. Актуальные условия приёма 2026 года уточняйте на сайтах приёмных комиссий.*`;
  } else if (context.matchedUniversities.length > 0) {
    replyText =
      `## Результаты подбора по локальному каталогу\n\n` +
      `По вашим критериям в каталоге найдены следующие университеты:\n\n` +
      context.matchedUniversities
        .map(
          (u, idx) =>
            `${idx + 1}. **[vuz:${u.id}:${u.shortName}]** (${u.city}):\n` +
            `   • Минимальный проходной балл прошлых лет: **от ${u.minBudgetScore} б.**\n` +
            `   • Бюджетных мест: **${u.totalBudgetPlaces}**\n` +
            `   • Военный учебный центр (ВУЦ): **${u.hasMilitaryDept ? 'Есть' : 'Нет'}**\n` +
            `   • Общежитие: **${u.hasDormitory ? 'Предоставляется (' + (u.dormitoryInfo?.costMonth || 1200) + ' ₽/мес)' : 'Нет'}**`
        )
        .join('\n\n') +
      `\n\n💡 **Рекомендация:** для гарантированного поступления распределяйте 5 заявлений на 3 уровня: вузы мечты, реалистичные варианты и надежный запасной вуз с проходным баллом на 15–20 пунктов ниже вашей суммы.`;
  } else {
    missingInfoNotice =
      `В локальной выборке ассистента представлены 10 ведущих университетов России (МГУ, НИУ ВШЭ, МГТУ им. Баумана, МФТИ, НИЯУ МИФИ, ИТМО, СПбГУ, РТУ МИРЭА, РАНХиГС, НИУ МЭИ). По запросу «${query}» точных совпадений среди них не обнаружено.`;

    replyText =
      `${missingInfoNotice}\n\n` +
      `Что можно сделать:\n` +
      `1. Перейти во вкладку **«Каталог вузов»** для просмотра полного каталога университетов России\n` +
      `2. Воспользоваться **«Калькулятором ЕГЭ»** для подбора программ по предметам и баллам\n` +
      `3. Задать вопрос об одном из вузов локальной базы (например, «Какие проходные баллы в МГТУ им. Баумана?»).`;
  }

  if (context.artifact) {
    replyText +=
      '\n\n📋 *Сформирован интерактивный чек-лист абитуриента. Нажмите кнопку «Открыть холст» ниже для просмотра дорожной карты.*';
  }

  // Extract referenced entity IDs
  const referencedEntityIds = extractReferencedEntityIds(replyText);
  if (context.matchedUniversities.length > 0) {
    context.matchedUniversities.forEach((u) => {
      if (!referencedEntityIds.includes(u.id)) {
        referencedEntityIds.push(u.id);
      }
    });
  }

  const evidenceIds = context.citationChunks.map((c) => c.id);

  const validatedActions: ValidatedAction[] = [
    {
      tabId: context.suggestedActionTab as any,
      label: context.suggestedActionLabel,
    },
  ];

  const rawPayload = {
    text: replyText,
    mode: 'local' as const,
    referencedEntityIds,
    evidenceIds,
    validatedActions,
    clarificationQuestions: context.clarificationOptions || [],
    comparison: context.comparisonMatrix,
    artifact: context.artifact,
    missingInfoNotice,
    probability: context.probability,
    suggestions: context.followUps || [],
    followUps: context.followUps || [],
    toolCall: {
      name: context.toolName,
      query: context.toolQuery,
      duration: `${durationMs || 10}ms`,
      status: 'complete' as const,
    },
    reasoningTrace: context.reasoningTrace,
    extractedFilters: context.extractedFilters,
    citationChunks: context.citationChunks,
    matchedUniversities: context.matchedUniversities,
  };

  return validateAssistantResponse(rawPayload);
}
