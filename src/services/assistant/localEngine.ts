import { AssistantResponse, validateAssistantResponse, ValidatedAction } from './types';
import { RetrievalContext } from './dataRetrieval';
import { extractReferencedEntityIds } from './entityResolution';
import { resolveAction } from './navigationActions';

/**
 * Generates local grounded responses relying strictly on curated catalog records.
 * Acts as primary offline engine and resilient fallback.
 * Explains conflicting constraints and clearly offers alternatives when no exact matches exist.
 */
export function queryLocalEngine(
  query: string,
  startTime: number,
  context: RetrievalContext
): AssistantResponse {
  const durationMs = Math.round(performance.now() - startTime);

  let replyText = '';
  let missingInfoNotice: string | undefined;

  // Case 1: Ambiguous university mention (e.g. "политех")
  if (context.ambiguousEntity && context.clarificationOptions) {
    replyText =
      `В вашем запросе встретилось наименование «**${context.ambiguousEntity.term}**», которое может относиться к разным университетам:\n\n` +
      context.ambiguousEntity.candidates
        .map(
          (c, idx) =>
            `${idx + 1}. **[vuz:${c.id}:${c.name}]** (${c.city}) — ${c.description}`
        )
        .join('\n') +
      `\n\nУточните, какой именно университет вас интересует, или нажмите одну из кнопок ниже:`;
  }
  // Case 2: Underspecified generic query
  else if (context.isUnderspecified && context.clarificationOptions) {
    replyText =
      `Чтобы подобрать подходящие варианты из каталога вузов, укажите ключевые параметры:\n\n` +
      `1. **Ваши предметы ЕГЭ и примерную сумму баллов**\n` +
      `2. **Желаемый город или направление обучения** (IT, инженерия, экономика и др.)\n\n` +
      `Вы можете выбрать один из готовых сценариев ниже либо ввести свои баллы:`;
  }
  // Case 3: Comparison query
  else if (context.isComparison && context.comparisonMatrix && context.matchedUniversities.length >= 2) {
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
  }
  // Case 4: Zero exact matches with conflicting requirements (never silently discard filters!)
  else if (context.hasZeroMatches) {
    const conflictsList = context.conflictingRequirements && context.conflictingRequirements.length > 0
      ? context.conflictingRequirements.map((r) => `• ${r}`).join('\n')
      : `• Заданные строгие параметры фильтрации`;

    missingInfoNotice =
      `По заданным строгим критериям в каталоге не найдено точных совпадений. Ни один вуз выборки не удовлетворяет одновременно всем установленным ограничениям.`;

    replyText =
      `## Результат поиска по заданным критериям\n\n` +
      `По вашей комбинации условий в каталоге **не найдено прямых совпадений**.\n\n` +
      `**Установленные строгие ограничения:**\n${conflictsList}\n\n`;

    if (context.alternatives && context.alternatives.length > 0) {
      replyText += `### Рекомендуемые альтернативные варианты:\n\n`;
      replyText += context.alternatives
        .map(
          (alt, idx) =>
            `**Альтернатива ${idx + 1}: ${alt.title}**\n` +
            `${alt.description}\n` +
            alt.universities
              .map(
                (u) =>
                  `• **[vuz:${u.id}:${u.shortName}]** (${u.city}): проходной на бюджет 2025 г. от **${u.minBudgetScore} б.** [cite:src-vuz-${u.id}-admission], ВУЦ: ${
                    u.hasMilitaryDept ? 'Есть [cite:src-vuc-' + u.id + ']' : 'Нет'
                  }, общежитие: ${u.hasDormitory ? 'Предоставляется [cite:src-dorm-' + u.id + ']' : 'Нет'}`
              )
              .join('\n')
        )
        .join('\n\n');
    } else {
      replyText +=
        `Рекомендация: попробуйте расширить географию поиска, рассмотреть смежные специальности или воспользоваться Калькулятором ЕГЭ для подбора по баллам.`;
    }
  }
  // Case 5: Universities matched
  else if (context.matchedUniversities.length > 0) {
    replyText =
      `## Результаты подбора по локальному каталогу\n\n` +
      `По вашим критериям в каталоге найдены следующие университеты:\n\n` +
      context.matchedUniversities
        .map(
          (u, idx) =>
            `${idx + 1}. **[vuz:${u.id}:${u.shortName}]** (${u.city}):\n` +
            `   • Минимальный проходной балл прошлых лет (статистика 2025 г.): **от ${u.minBudgetScore} б.** [cite:src-vuz-${u.id}-admission]\n` +
            `   • Бюджетных мест: **${u.totalBudgetPlaces}**\n` +
            `   • Военный учебный центр (ВУЦ): **${u.hasMilitaryDept ? 'Есть' : 'Нет'}** [cite:src-vuc-${u.id}]\n` +
            `   • Общежитие: **${u.hasDormitory ? 'Предоставляется (' + (u.dormitoryInfo?.costMonth || 1200) + ' ₽/мес)' : 'Нет'}** [cite:src-dorm-${u.id}]`
        )
        .join('\n\n');

    // Programme-level recommendations
    if (context.matchedPrograms && context.matchedPrograms.length > 0) {
      replyText += `\n\n### Релевантные программы обучения:\n`;
      replyText += context.matchedPrograms
        .slice(0, 3)
        .map(
          (p) =>
            `• **${p.code} ${p.name}** ([vuz:${p.universityId}:${p.universityShort}]):\n` +
            `   Проходной балл 2025 г. на бюджет: **${p.minBudgetScore} б.** [cite:src-prog-${p.id}] | Бюджетных мест: **${p.budgetPlaces}** | Платное: от **${p.annualFee.toLocaleString()} ₽/год**`
        )
        .join('\n');
    }

    replyText += `\n\n💡 **Рекомендация:** для гарантированного поступления распределяйте 5 заявлений на 3 уровня: вузы мечты, реалистичные варианты и надежный запасной вуз с проходным баллом на 15–20 пунктов ниже вашей суммы. Проходные баллы 2025 года носят ориентировочный характер и не гарантируют проходной порог в 2026 году.`;
  }
  // Case 6: Fallback when completely out of scope or evidence is insufficient
  else {
    missingInfoNotice =
      `В локальной выборке ассистента представлены 12 ведущих университетов России. По запросу «${query}» точных сведений среди них не обнаружено.`;

    replyText =
      `${missingInfoNotice}\n\n` +
      `**Что представлено в базе:**\n` +
      `• Проходные баллы 2025 года, реестр ВУЦ и общежитий 12 ведущих университетов РФ\n` +
      `• Правила льготы БВИ по приказу Минобрнауки № 1076 и условия льготного кредита 3%\n\n` +
      `**Что требует обязательной проверки:**\n` +
      `Информацию о других вузах или детальные квоты целевого приёма 2026 года необходимо проверять непосредственно на официальных сайтах приемных комиссий.\n\n` +
      `Рекомендуемые действия:\n` +
      `1. Перейти во вкладку **«Каталог вузов»** для просмотра полного каталога университетов России\n` +
      `2. Воспользоваться **«Калькулятором ЕГЭ»** для подбора программ по предметам и баллам\n` +
      `3. Задать вопрос об одном из вузов локальной базы (например, «Какие проходные баллы в МГТУ им. Баумана?»).`;
  }

  if (context.artifact) {
    replyText +=
      '\n\n📋 *Сформирован интерактивный чек-лист абитуриента. Нажмите кнопку «Открыть холст» ниже для просмотра дорожной карты.*';
  }

  if (context.citationChunks.some(c => c.verificationStatus !== 'verified')) {
    replyText += '\n\n*Данные каталога не сверены с первичными документами. Перед решением проверьте актуальные условия в приёмной комиссии.*';
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

  const resolvedAction = resolveAction(
    context.suggestedActionTab,
    context.suggestedActionLabel,
    context.matchedUniversities
  );

  const validatedActions: ValidatedAction[] = resolvedAction
    ? [resolvedAction]
    : [
        {
          tabId: (context.suggestedActionTab || 'catalog') as any,
          label: context.suggestedActionLabel || 'Открыть каталог вузов',
          canExecute: true,
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
    matchedPrograms: context.matchedPrograms,
    alternatives: context.alternatives,
    ambiguousEntity: context.ambiguousEntity,
  };

  return validateAssistantResponse(rawPayload);
}

