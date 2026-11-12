import { UNIVERSITIES, EXAM_SUBJECTS } from '../../data/mockData';
import { validateAssistantResponse, AssistantResponse } from './types';
import { createProgramCitationChunk } from './evidenceSources';
import { findMentionedUniversities } from './entityResolution';

export type GuideStage = 'goal' | 'interests' | 'education' | 'location' | 'budget' | 'results' | 'paused';
export type GuideArea = 'tech' | 'engineering' | 'business' | 'health' | 'creative' | 'science' | 'people';
export interface GuidanceState {
  version: 1;
  language: 'en' | 'ru';
  stage: GuideStage;
  areas: GuideArea[];
  education?: string;
  location?: string;
  maxFee?: number;
  freeOnly?: boolean;
  answered: string[];
  excluded: GuideArea[];
  resultIds: string[];
}
export interface GuideRecommendation {
  id: string;
  name: string;
  universityId: string;
  universityName: string;
  city: string;
  annualFee: number;
  why: string;
  tradeoff: string;
  requirements: string;
}
export interface GuidanceView {
  state: GuidanceState;
  title: string;
  summary: string[];
  recommendations: GuideRecommendation[];
}
export interface GuideHistoryTurn { sender: 'ded' | 'user'; text: string; guidance?: GuidanceState }

const areas: Record<GuideArea, { en: string; ru: string; words: RegExp; codes: string[]; tradeoff: [string, string] }> = {
  tech: { en: 'Computing & problem-solving', ru: 'Программирование и задачи', words: /comput|cod(e|ing)|software|\bIT\b|программ|информат|компьютер/i, codes: ['09.', '02.', '01.03.02', '10.'], tradeoff: ['Expect regular coding and mathematical problem-solving; inspect the actual curriculum.', 'Обычно много программирования и математических задач; проверьте учебный план.'] },
  engineering: { en: 'Building & designing things', ru: 'Техника и конструирование', words: /engineer|building|designing things|robot|инженер|техник|констру|робот/i, codes: ['11.', '12.', '13.', '15.', '16.', '20.', '21.', '22.', '23.', '24.', '27.'], tradeoff: ['Check the balance of maths, laboratory work and practical projects.', 'Проверьте объём математики, лабораторных работ и практических проектов.'] },
  business: { en: 'Business & organising', ru: 'Бизнес и организация', words: /business|econom|financ|management|organis|бизнес|эконом|финанс|менедж|организац/i, codes: ['38.'], tradeoff: ['Compare quantitative subjects, placements and specialisations rather than the degree title alone.', 'Сравните количественные дисциплины, практику и специализации, а не только название диплома.'] },
  health: { en: 'Healthcare & biology', ru: 'Медицина и биология', words: /medicin|doctor|health|biolog|медицин|врач|биолог/i, codes: ['30.', '31.', '32.', '33.', '06.'], tradeoff: ['Check science prerequisites, training length and professional recognition separately.', 'Отдельно проверьте предметы для поступления, срок обучения и профессиональные требования.'] },
  creative: { en: 'Creative work & communication', ru: 'Творчество и коммуникации', words: /creativ|\bart\b|design|writing|journal|творч|дизайн|искусств|журналист/i, codes: ['42.', '54.', '55.'], tradeoff: ['A portfolio or additional entrance assessment may be required; verify the programme rules.', 'Может потребоваться портфолио или дополнительное испытание; проверьте правила программы.'] },
  science: { en: 'Research & understanding nature', ru: 'Исследования и естественные науки', words: /research|nature|science|physic|chemistry|math|исслед|природ|физик|хим|математ/i, codes: ['01.', '03.', '04.', '05.', '06.'], tradeoff: ['Look at laboratory opportunities and whether your intended career needs further study.', 'Узнайте о лабораторной работе и необходимости дальнейшего обучения для выбранной карьеры.'] },
  people: { en: 'Helping people & society', ru: 'Работа с людьми и общество', words: /helping|people|psycholog|teach|law|society|люд|психолог|педагог|право|общество/i, codes: ['37.', '39.', '40.', '44.'], tradeoff: ['These fields lead to different professions; examine each curriculum and professional requirements.', 'Направления ведут к разным профессиям; изучите учебный план и профессиональные требования.'] },
};
const stages: GuideStage[] = ['goal', 'interests', 'education', 'location', 'budget', 'results'];
export function isProgrammeGuidanceRequest(text: string): boolean {
  return /(?:find|choose|pick|recommend|right|suit|help).{0,55}(?:program(?:me)?|course|degree|study)|(?:program(?:me)?|course|degree).{0,35}(?:for me|suit)|(?:don't|do not|not sure|unsure).{0,25}(?:study|career)|(?:help me choose)|(?:помоги|хочу|подбери|выбрать|подходящ).{0,45}(?:программ|специальност|что изучать|направлен)|не знаю.{0,25}(?:учиться|изучать|выбрать)/i.test(text);
}
function initial(language: 'en' | 'ru'): GuidanceState {
  return { version: 1, language, stage: 'goal', areas: [], excluded: [], answered: [], resultIds: [] };
}
function validState(s: GuidanceState | undefined): s is GuidanceState {
  return Boolean(s && s.version === 1 && [...stages, 'paused'].includes(s.stage) && ['en', 'ru'].includes(s.language) && Array.isArray(s.areas) && s.areas.every(a => Object.prototype.hasOwnProperty.call(areas, a)) && Array.isArray(s.answered) && Array.isArray(s.excluded) && Array.isArray(s.resultIds));
}
function city(text: string): string | undefined {
  if (/moscow|москв/i.test(text)) return 'Москва';
  if (/petersburg|спб|петербург|питер/i.test(text)) return 'Санкт-Петербург';
  if (/kazan|казан/i.test(text)) return 'Казань';
  if (/novosibirsk|новосибирск/i.test(text)) return 'Новосибирск';
  if (/tomsk|томск/i.test(text)) return 'Томск';
  if (/yekaterinburg|екатеринбург/i.test(text)) return 'Екатеринбург';
  if (/^(?:any(?: location)?|anywhere|no preference|skip|любой(?: город)?|не важно|пропустить)$/i.test(text.trim())) return undefined;
  return text.trim().slice(0, 80);
}

/** Per-conversation state is passed through saved messages, never a shared singleton. */
export function guideProgrammeChoice(prompt: string, history: GuideHistoryTurn[]): AssistantResponse | null {
  const previous = [...history].reverse().find(h => h.sender === 'ded' && validState(h.guidance))?.guidance;
  const start = isProgrammeGuidanceRequest(prompt);
  if (!previous && !start) return null;
  if (previous?.stage === 'paused' && !start) return null;
  const restart = /^(start over|restart|начать заново|сначала)$/i.test(prompt.trim());
  const state = previous && !restart && previous.stage !== 'paused' ? JSON.parse(JSON.stringify(previous)) as GuidanceState : initial(/[а-яё]/i.test(prompt) ? 'ru' : 'en');
  const en = state.language === 'en';
  const t = (english: string, russian: string) => en ? english : russian;
  let note = '';
  const fresh = !previous || restart || previous.stage === 'paused';
  const skip = /^(skip|not sure|i.?m not sure|i don.t know|пропустить|не знаю|не уверен[а]?)$/i.test(prompt.trim());
  const stop = /^(stop|exit|leave guide|стоп|выйти|закончить подбор)$/i.test(prompt.trim());
  if (stop) { state.stage = 'paused'; return respond(t('We can pause here. Ask a question, or say “help me choose a programme” whenever you want to continue.', 'Подбор приостановлен. Задайте вопрос или напишите «помоги выбрать программу», чтобы начать снова.')); }
  // Let ordinary factual questions use the existing answer pipeline, without losing this journey.
  if (!fresh && findMentionedUniversities(prompt).length && /fee|cost|hostel|dorm|score|compare|стоит|стоимост|общежит|балл|сравни/i.test(prompt)) return null;

  if (!fresh) {
    if (/^(back|назад)$/i.test(prompt.trim())) {
      state.stage = stages[Math.max(0, stages.indexOf(state.stage) - 1)];
    } else if (/change interests|другие интересы|dislike coding|hate coding|don.t like coding|не люблю программ/i.test(prompt)) {
      if (/coding|программ/i.test(prompt)) state.excluded = [...new Set([...state.excluded, 'tech' as GuideArea])];
      state.areas = []; state.stage = 'interests'; state.resultIds = [];
    } else if (/too expensive|cheaper|change budget|дорого|дешевле|изменить бюджет/i.test(prompt)) {
      state.stage = 'budget'; state.maxFee = undefined; state.freeOnly = false; state.resultIds = [];
      note = t('Let’s adjust the cost limit. ', 'Уточним ограничение по стоимости. ');
    } else if (/change location|другой город/i.test(prompt)) { state.stage = 'location'; state.resultIds = []; }
    else if (state.stage === 'goal') {
      state.stage = 'interests';
      note = t('We’ll explore possibilities, not assign you a “perfect” career. ', 'Рассмотрим варианты — это не тест на «идеальную» профессию. ');
    } else if (state.stage === 'interests') {
      const selected = (Object.keys(areas) as GuideArea[]).filter(key => areas[key].words.test(prompt) && !state.excluded.includes(key));
      if (selected.length || skip) { state.areas = selected; state.answered.push('interests'); state.stage = 'education'; }
      else note = t('I haven’t confidently understood your interest yet. Try describing an activity you enjoy, or choose below. ', 'Пока не удалось уверенно понять интерес. Опишите любимое занятие или выберите вариант ниже. ');
    } else if (state.stage === 'education') {
      state.education = skip ? undefined : prompt.slice(0, 350); state.answered.push('education'); state.stage = 'location';
    } else if (state.stage === 'location') {
      state.location = skip ? undefined : city(prompt); state.answered.push('location'); state.stage = 'budget';
    } else if (state.stage === 'budget') {
      const amount = prompt.trim().match(/^(?:up to\s+|до\s+)?(\d[\d ,]*)(?:\s*(?:RUB|руб(?:лей)?|₽))?$/i)?.[1];
      if (skip || /not decided|no limit|не определ|без огранич/i.test(prompt)) { state.maxFee = undefined; state.freeOnly = false; state.stage = 'results'; }
      else if (/funded|free|scholarship|бюджет|бесплат/i.test(prompt) && !amount) { state.freeOnly = true; state.maxFee = undefined; state.stage = 'results'; }
      else if (amount && !/\$|usd|lkr|රු|€|eur/i.test(prompt)) {
        state.maxFee = Number(amount.replace(/[ ,]/g, '')); state.freeOnly = false; state.stage = 'results';
      } else note = t('For this catalogue, enter a yearly amount in RUB, choose funded places, or skip. I won’t guess currency conversions. ', 'Укажите годовую сумму в рублях, выберите бюджетные места или пропустите. Конвертацию валют не предполагаю. ');
    } else if (state.stage === 'results' && /next steps|what next|дальше|следующ/i.test(prompt)) {
      return respond(t('Next: open a programme’s university page, check its current curriculum and entry requirements, and confirm the full fee and intake with admissions. Your qualifications have not been assessed for eligibility. Which option would you like to investigate?', 'Следующий шаг: откройте страницу вуза, проверьте актуальный учебный план и требования, уточните полную стоимость и набор в приёмной комиссии. Право на поступление пока не проверено. Какой вариант хотите изучить?'), resultOptions());
    } else if (state.stage === 'results' && !start) {
      return respond(t('We can refine the options. Tell me what does not fit, change your interests, location or budget, or ask a factual question about a named university.', 'Можно уточнить варианты. Измените интересы, город или бюджет либо задайте конкретный вопрос о вузе.'), resultOptions());
    }
  }
  if (state.stage === 'goal') return respond(t('Let’s narrow it down together. Do you already have a career or subject in mind, or are you still exploring?', 'Давайте разберёмся вместе. У вас уже есть профессия или предмет на примете, или вы пока ищете своё направление?'), [t('I have a career in mind', 'Есть профессия на примете'), t('I know subjects I enjoy', 'Знаю любимые предметы'), t('I’m not sure yet', 'Пока не знаю')]);
  if (state.stage === 'interests') return respond(note + t('What kinds of activities or subjects do you enjoy? Choose one or describe a few in your own words.', 'Какие занятия или предметы вам нравятся? Выберите вариант или опишите несколько своими словами.'), (Object.keys(areas) as GuideArea[]).filter(k => !state.excluded.includes(k)).map(k => areas[k][en ? 'en' : 'ru']));
  if (state.stage === 'education') return respond(t('What qualifications are you studying for or have you completed? Include subjects/results if you know them. This helps identify what still needs checking; it does not establish eligibility.', 'Какое образование вы получаете или уже закончили? Можно добавить предметы и результаты. Это поможет понять, что проверить; право на поступление пока не определяется.'), [t('Still at school; results pending', 'Ещё в школе, результатов пока нет'), t('School completed', 'Школа окончена'), t('College or another qualification', 'Колледж или другое образование')]);
  if (state.stage === 'location') return respond(t('Where would you like to study? This experimental catalogue contains Russian institutions only. You can type another location; I’ll tell you honestly if it isn’t covered.', 'Где вы хотите учиться? В этом экспериментальном каталоге пока только российские вузы. Если нужного места нет, я скажу об этом.'), [t('Moscow', 'Москва'), t('Saint Petersburg', 'Санкт-Петербург'), t('Kazan', 'Казань'), t('Any location', 'Любой город')]);
  if (state.stage === 'budget') return respond(note + t('What is your maximum tuition budget per year in RUB? Living costs are separate. You can also explore funded places or leave the budget open.', 'Какой максимум в год вы готовы выделить на обучение в рублях? Проживание считается отдельно. Можно рассмотреть бюджетные места или пока не задавать сумму.'), [t('Funded places only', 'Только бюджетные места'), '200000 RUB', '400000 RUB', t('Not decided yet', 'Пока не определился')]);

  if (!state.areas.length) return respond(t('We haven’t identified a study direction yet, so I won’t choose universities arbitrarily. Pick an activity to explore; you can change it later.', 'Мы ещё не определили направление, поэтому не буду выбирать вузы случайно. Выберите занятие для дальнейшего поиска.'), [t('Change interests', 'Другие интересы')]);
  const candidates = UNIVERSITIES.flatMap(u => (u.programs || []).map(p => ({ u, p, area: state.areas.find(a => areas[a].codes.some(code => p.code.startsWith(code))) })))
    .filter(({ u, p, area }) => area && !state.excluded.includes(area) && (!state.location || u.city === state.location) && (!state.freeOnly || p.budgetPlaces > 0) && (state.maxFee === undefined || p.annualFee <= state.maxFee))
    .sort((a, b) => a.p.annualFee - b.p.annualFee || a.p.id.localeCompare(b.p.id));
  const picked = candidates.slice(0, 3);
  state.resultIds = picked.map(x => x.p.id);
  const recommendations = picked.map(({ u, p, area }) => ({ id: p.id, name: p.name, universityId: u.id, universityName: u.shortName, city: u.city, annualFee: p.annualFee,
    why: t(`Matches the interest you selected: ${areas[area!].en}.`, `Соответствует выбранному интересу: ${areas[area!].ru}.`), tradeoff: areas[area!].tradeoff[en ? 0 : 1],
    requirements: t(`Catalogue exam subjects: ${p.requiredExams.map(id => EXAM_SUBJECTS.find(e => e.id === id)?.name || id).join(', ')}. Verify the current rules; eligibility is not checked.`, `Предметы в каталоге: ${p.requiredExams.map(id => EXAM_SUBJECTS.find(e => e.id === id)?.name || id).join(', ')}. Проверьте актуальные правила; право на поступление не проверено.`) }));
  const response = respond(picked.length ? t('Here are starting points matching your stated interests and filters—not a ranking or a promise of admission. Names remain in the catalogue’s original language. All fees and entry details need confirmation.', 'Вот отправные варианты по вашим интересам и ограничениям — не рейтинг и не гарантия поступления. Стоимость и условия нужно подтвердить.') : t('There are no exact matches in this small catalogue. I haven’t relaxed your filters. You can change the location, budget or interests; missing results do not mean suitable programmes do not exist elsewhere.', 'В небольшом каталоге нет точных совпадений. Ограничения не ослаблены. Можно изменить город, бюджет или интересы; отсутствие результатов не означает, что подходящих программ нет вообще.'), resultOptions());
  response.guidance!.recommendations = recommendations;
  response.citationChunks = picked.map(({u,p}) => createProgramCitationChunk({id:p.id,code:p.code,name:p.name,universityId:u.id,universityShort:u.shortName,minBudgetScore:p.minBudgetScore2025,budgetPlaces:p.budgetPlaces,annualFee:p.annualFee},u));
  response.evidenceIds = response.citationChunks.map(c => c.id);
  return response;

  function resultOptions() { return [t('Change interests', 'Другие интересы'), t('Change location', 'Другой город'), t('Change budget', 'Изменить бюджет'), t('Next steps', 'Что дальше')]; }
  function respond(text: string, choices: string[] = []): AssistantResponse {
    const summary = [state.areas.length ? state.areas.map(a => areas[a]?.[en ? 'en' : 'ru']).join(', ') : '', state.education || '', state.location || '', state.freeOnly ? t('Funded places', 'Бюджетные места') : state.maxFee !== undefined ? `${state.maxFee.toLocaleString()} RUB / ${t('year','год')}` : ''].filter(Boolean);
    const options = [...choices];
    if (state.stage !== 'results' && state.stage !== 'paused' && state.stage !== 'goal') options.push(t('Skip','Пропустить'));
    if (state.stage !== 'goal' && state.stage !== 'paused') options.push(t('Back','Назад'));
    if (state.stage !== 'paused') options.push(t('Start over','Начать заново'), t('Stop','Закончить подбор'));
    const response = validateAssistantResponse({ text, mode: 'local', referencedEntityIds: [], evidenceIds: [], validatedActions: [], clarificationQuestions: options.map(label => ({label,prompt:label})), suggestions: [], followUps: [], toolCall: {name:'Programme guidance',query:'',status:'complete'}, reasoningTrace: [], extractedFilters: {}, citationChunks: [], matchedUniversities: [] });
    return {...response, guidance: {state, title: t('Find your study direction','Найдём ваше направление'), summary, recommendations: []}};
  }
}
