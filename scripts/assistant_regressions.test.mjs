import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { handleAssistantChat, handleAssistantStream, reserveProviderAttempt, getAssistantStatus, __resetProxyStateForTests, DEFAULT_CONFIG } from '../server/geminiProxy.mjs';
import { pagesConfig } from '../server/pagesAdapter.mjs';
import { onRequestPost as pagesStream } from '../functions/api/assistant/stream.js';
import { onRequestPost as pagesChat } from '../functions/api/assistant/chat.js';
import { onRequestGet as pagesStatus } from '../functions/api/assistant/status.js';

const temp = await mkdtemp(path.join(tmpdir(), 'assistant-regressions-'));
await build({ entryPoints: ['src/services/assistant/index.ts'], bundle: true, platform: 'node', format: 'esm', outfile: path.join(temp, 'client.mjs') });
const client = await import(pathToFileURL(path.join(temp, 'client.mjs')).href);
const originalFetch = globalThis.fetch;
const config = { ...DEFAULT_CONFIG, apiKey: 'mock-only-key', globalDailyLimit: 100, maxConcurrency: 10, rateLimitPerMinute: 100 };
afterEach(() => { globalThis.fetch = originalFetch; delete globalThis.window; delete globalThis.localStorage; __resetProxyStateForTests(); });
after(() => rm(temp, { recursive: true, force: true }));

function sqliteBinding() {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE assistant_daily_usage(day TEXT PRIMARY KEY, attempts INTEGER NOT NULL)');
  return { db, prepare: sql => ({ bind: (...values) => ({ first: async () => db.prepare(sql).get(...values) || null }) }) };
}
function upstream(text, fail = false) {
  let n = 0;
  return new Response(new ReadableStream({ pull(c) {
    if (n++ === 0) c.enqueue(new TextEncoder().encode('data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }) + '\n\n'));
    else if (fail) c.error(new Error('simulated provider disconnect'));
    else c.close();
  } }), { status: 200 });
}
function context(env, payload) {
  const tasks = [];
  return { env, tasks, waitUntil(p) { tasks.push(p); }, request: new Request('https://example.test/api/assistant/stream', { method: 'POST', headers: { 'cf-connecting-ip': 'test' }, body: JSON.stringify(payload) }) };
}
function profileStore(profile) {
  const data = new Map([[client.PROFILE_STORAGE_KEY, JSON.stringify({ ...client.DEFAULT_STUDENT_PROFILE, ...profile })]]);
  globalThis.localStorage = { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
  globalThis.window = { localStorage };
}

test('Pages handlers import and bundle without Node runtime dependencies', async () => {
  for (const route of ['chat', 'status', 'stream']) {
    await build({ entryPoints: [`functions/api/assistant/${route}.js`], bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, `${route}.js`) });
  }
  const r = await pagesStatus({ env: {} });
  assert.equal((await r.json()).aiAvailable, false);
});

test('Pages fails closed without shared accounting and rejects oversized bodies', async () => {
  globalThis.fetch = () => { throw Error('Provider must not be called'); };
  const c = context({ GEMINI_API_KEY: 'mock' }, { prompt: 'Explain admissions' });
  assert.equal((await pagesChat(c)).status, 503);
  const oversized = context({}, { prompt: 'x'.repeat(70000) });
  assert.equal((await pagesChat(oversized)).status, 413);
});

test('same prompt in different conversations never shares an AI answer', async () => {
  let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const evidence = JSON.parse(init.body).systemInstruction.parts[0].text;
    return Response.json({ candidates: [{ content: { parts: [{ text: evidence.includes('University B') ? 'Answer B' : 'Answer A' }] } }] });
  };
  const a = await handleAssistantChat({ prompt: 'What about accommodation?', history: [{ sender: 'user', text: 'University A' }], evidence: 'University A' }, 'a', config);
  const b = await handleAssistantChat({ prompt: 'What about accommodation?', history: [{ sender: 'user', text: 'University B' }], evidence: 'University B' }, 'b', config);
  assert.equal(calls, 2); assert.equal(a.body.rawText, 'Answer A'); assert.equal(b.body.rawText, 'Answer B');
});

test('partial upstream failure does not append a replacement model answer', async () => {
  let calls = 0; let text = '';
  globalThis.fetch = async () => { calls++; return upstream('First partial answer.', true); };
  await handleAssistantStream({ prompt: 'Explain university options' }, 'a', { writeHead() {}, on() {}, write(s) { text += s; }, end() {} }, config);
  assert.equal(calls, 1); assert.match(text, /"partial":true/); assert.match(text, /First partial answer/);
});

test('real client consumes Pages SSE completion and partial metadata', async () => {
  const binding = sqliteBinding(); let activeTasks = []; let calls = 0;
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('/api/')) {
      const c = context({ GEMINI_API_KEY: 'mock', ASSISTANT_USAGE: binding }, JSON.parse(init.body));
      const r = await pagesStream(c); activeTasks = c.tasks; return r;
    }
    calls++; return upstream('Partial answer with enough information to display.', true);
  };
  const response = await client.callGeminiStreamingProvider('Explain admissions', [], client.retrieveAssistantContext('МГУ'), performance.now());
  await Promise.all(activeTasks);
  assert.equal(calls, 1); assert.equal(response.toolCall.status, 'error'); assert.match(response.text, /Ответ прерван/);
  binding.db.close();
});

test('client accepts done event across arbitrary transport chunk boundaries', async () => {
  const wire = 'event: chunk\ndata: {"delta":"Hello"}\n\nevent: done\ndata: {"rawText":"Hello final","modelUsed":"mock"}\n\n';
  let index = 0;
  globalThis.fetch = async () => new Response(new ReadableStream({ pull(c) { if (index < wire.length) c.enqueue(new TextEncoder().encode(wire.slice(index, ++index))); else c.close(); } }));
  const result = await client.callGeminiStreamingProvider('Explain', [], client.retrieveAssistantContext('МГУ'), performance.now());
  assert.equal(result.text, 'Hello final'); assert.equal(result.toolCall.status, 'complete');
});

test('confirmed profile drives retrieval and current query overrides it', () => {
  profileStore({ locationPreferences: ['Казань'], totalScore: 180, accommodationNeed: 'required', maxAnnualFee: 100000, confirmedAt: '2026-11-12' });
  const r = client.retrieveAssistantContext('Посоветуй университеты');
  assert.equal(r.extractedFilters.city, 'Казань'); assert.equal(r.extractedFilters.score, 180);
  assert.equal(r.extractedFilters.wantsDorm, true); assert.equal(r.extractedFilters.maxAnnualFee, 100000);
  assert(r.matchedUniversities.every(u => u.city === 'Казань' && u.hasDormitory && u.minAnnualFee <= 100000));
  assert.deepEqual(r.matchedPrograms ?? [], []); // no unrelated programme fallback when no university matches
  const override = client.retrieveAssistantContext('В Москве 270 баллов, общежитие не нужно, до 500000 рублей');
  assert.equal(override.extractedFilters.city, 'Москва'); assert.equal(override.extractedFilters.score, 270);
  assert.equal(override.extractedFilters.wantsDorm, false); assert.equal(override.extractedFilters.maxAnnualFee, 500000);
});

test('catalogue URLs do not manufacture verified evidence or checked dates', () => {
  const r = client.retrieveAssistantContext('МГУ общежитие кредит олимпиады');
  assert(r.citationChunks.length > 0);
  for (const chunk of r.citationChunks) { assert.equal(chunk.verificationStatus, 'unverified'); assert.equal(chunk.checkedDate, undefined); }
  assert(!r.evidence.includes('status="verified"'));
  const artifact = client.createAdmissionArtifact();
  assert(artifact.checklistItems.every(item => item.isDeadlineVerified === false && !item.checked));
  assert(!artifact.markdownContent.includes('3 августа'));
});

test('shared daily cap is atomic across instances and refuses unavailable storage', async () => {
  const binding = sqliteBinding();
  const a = pagesConfig({ ASSISTANT_USAGE: binding, AI_GLOBAL_DAILY_LIMIT: '2' });
  const b = pagesConfig({ ASSISTANT_USAGE: binding, AI_GLOBAL_DAILY_LIMIT: '2' });
  const attempts = await Promise.all(Array.from({ length: 20 }, (_, i) => reserveProviderAttempt(i % 2 ? a : b)));
  assert.equal(attempts.filter(Boolean).length, 2);
  assert.equal(binding.db.prepare('SELECT attempts FROM assistant_daily_usage').get().attempts, 2);
  assert.equal(await reserveProviderAttempt({ ...config, reserveAttempt: async () => { throw Error('offline'); } }), false);
  const status = await pagesStatus({ env: { GEMINI_API_KEY: 'mock', ASSISTANT_USAGE: binding, AI_GLOBAL_DAILY_LIMIT: '2' } });
  assert.equal((await status.json()).aiAvailable, false);
  binding.db.close();
});

test('failed provider attempts consume budget and cannot retry past it', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('unavailable', { status: 503 }); };
  await handleAssistantChat({ prompt: 'Explain admissions' }, 'a', { ...config, globalDailyLimit: 1 });
  assert.equal(calls, 1); assert.equal(getAssistantStatus({ ...config, globalDailyLimit: 1 }).dailyUsage, 1);
});

test('invalid credentials do not trigger a fallback model request', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('invalid credentials', { status: 401 }); };
  await handleAssistantChat({ prompt: 'Explain admissions' }, 'a', config);
  assert.equal(calls, 1);
});

test('cancelled requests never start provider calls or replace cancellation with local answers', async () => {
  let calls = 0; globalThis.fetch = async () => { calls++; throw Error('unexpected'); };
  const controller = new AbortController(); controller.abort();
  await assert.rejects(client.queryAssistant('Explain', [], 'all', 'all', { abortSignal: controller.signal }), { name: 'AbortError' });
  assert.equal(calls, 0);
});

test('cancelling a Pages response aborts the active upstream stream without retrying', async () => {
  const binding = sqliteBinding(); let aborted = false; let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls++;
    return new Response(new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode('data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Visible text' }] } }] }) + '\n\n'));
      init.signal.addEventListener('abort', () => { aborted = true; controller.error(new DOMException('Stopped', 'AbortError')); }, { once: true });
    } }));
  };
  const c = context({ GEMINI_API_KEY: 'mock', ASSISTANT_USAGE: binding }, { prompt: 'Explain university choices' });
  const response = await pagesStream(c);
  const reader = response.body.getReader();
  assert.match(new TextDecoder().decode((await reader.read()).value), /Visible text/);
  await reader.cancel();
  await Promise.all(c.tasks);
  assert.equal(aborted, true); assert.equal(calls, 1);
  binding.db.close();
});

function journey() {
  const history = [];
  return {
    history,
    async say(text) {
      const response = await client.queryAssistant(text, history);
      history.push({ sender: 'user', text }, { sender: 'ded', text: response.text, guidance: response.guidance?.state });
      return response;
    }
  };
}
function offlineOnly() {
  globalThis.fetch = () => { throw new Error('Guidance must never make a network request'); };
}
async function completedGuide(location = 'Any location', budget = '400000 RUB') {
  const j = journey();
  for (const text of ['I want to find the right program for me', 'I know subjects I enjoy', 'Computing & problem-solving', 'School completed', location]) await j.say(text);
  return { j, response: await j.say(budget) };
}

test('exact reported query starts guidance without a catalogue dump or network call', async () => {
  offlineOnly();
  const r = await journey().say('I want to find the right program for me');
  assert.equal(r.guidance.state.stage, 'goal');
  assert.equal(r.matchedUniversities.length, 0);
  assert.equal(r.citationChunks.length, 0);
  assert.equal(r.guidance.recommendations.length, 0);
  assert.match(r.text, /career or subject/);
});

test('complete journey produces at most three grounded options within hard constraints', async () => {
  offlineOnly();
  const { response: r } = await completedGuide('Moscow');
  assert.equal(r.guidance.state.stage, 'results');
  assert.ok(r.guidance.recommendations.length > 0 && r.guidance.recommendations.length <= 3);
  for (const result of r.guidance.recommendations) {
    const u = client.UNIVERSITIES.find(u => u.id === result.universityId);
    const p = u.programs.find(p => p.id === result.id);
    assert.equal(result.city, 'Москва');
    assert.ok(result.annualFee <= 400000);
    assert.equal(result.annualFee, p.annualFee);
    assert.match(result.requirements, /eligibility is not checked/);
    assert.doesNotMatch(result.requirements, /math_prof/);
  }
  assert.ok(r.citationChunks.every(c => c.verificationStatus !== 'verified'));
});

test('unsupported location and impossible budget never silently relax filters', async () => {
  offlineOnly();
  for (const [location, budget] of [['Sri Lanka', '400000 RUB'], ['Germany', '400000 RUB'], ['Moscow', '1 RUB']]) {
    const { response: r } = await completedGuide(location, budget);
    assert.equal(r.guidance.recommendations.length, 0);
    assert.match(r.text, /no exact matches/);
  }
});

test('funded option works and avoids implying a guaranteed scholarship', async () => {
  offlineOnly();
  const { response: r } = await completedGuide('Any location', 'Funded places only');
  assert.equal(r.guidance.state.stage, 'results');
  assert.equal(r.guidance.state.freeOnly, true);
  assert.ok(r.guidance.recommendations.length);
  for (const item of r.guidance.recommendations) {
    assert.ok(client.UNIVERSITIES.find(u => u.id === item.universityId).programs.find(p => p.id === item.id).budgetPlaces > 0);
  }
});

test('budget editing, back, restart and pause preserve predictable state', async () => {
  offlineOnly();
  const { j } = await completedGuide();
  assert.equal((await j.say('Too expensive')).guidance.state.stage, 'budget');
  assert.equal((await j.say('100 USD')).guidance.state.stage, 'budget');
  assert.equal((await j.say('200k')).guidance.state.stage, 'budget');
  assert.equal((await j.say('200000 RUB')).guidance.state.maxFee, 200000);
  assert.equal((await j.say('Back')).guidance.state.stage, 'budget');
  assert.equal((await j.say('Start over')).guidance.state.areas.length, 0);
  assert.equal((await j.say('Stop')).guidance.state.stage, 'paused');
  assert.equal(client.guideProgrammeChoice('ordinary question', j.history), null);
});

test('saved response keeps state and independent sessions cannot leak answers', async () => {
  offlineOnly();
  const { j, response } = await completedGuide('Kazan');
  const message = client.createAssistantMessageFromResponse(response);
  assert.deepEqual(JSON.parse(JSON.stringify(message)).response.guidance, response.guidance);
  const restored = JSON.parse(JSON.stringify(j.history));
  assert.equal(client.guideProgrammeChoice('Change budget', restored).guidance.state.location, 'Казань');
  assert.equal((await journey().say('Help me choose a programme')).guidance.state.location, undefined);
});

test('disliking coding excludes computing and skipped interests do not yield arbitrary options', async () => {
  offlineOnly();
  const { j } = await completedGuide();
  const revised = await j.say("I don't like coding");
  assert.equal(revised.guidance.state.stage, 'interests');
  assert.ok(revised.guidance.state.excluded.includes('tech'));
  assert.ok(!revised.clarificationQuestions.some(o => /Computing/.test(o.label)));
  for (const answer of ['Skip', 'Skip', 'Skip']) await j.say(answer);
  const result = await j.say('Skip');
  assert.equal(result.guidance.recommendations.length, 0);
  assert.match(result.text, /haven’t identified/);
});

test('Russian journey and factual detours retain conversation state', async () => {
  offlineOnly();
  const j = journey();
  assert.equal((await j.say('Помоги выбрать программу')).guidance.state.language, 'ru');
  await j.say('Знаю любимые предметы');
  await j.say('Программирование и задачи');
  assert.equal(client.guideProgrammeChoice('Сколько стоит обучение в МГУ?', j.history), null);
  assert.equal((await j.say('Школа окончена')).guidance.state.stage, 'location');
});

test('Workers serves JSON API routes instead of the SPA fallback', async () => {
  const { default: worker } = await import('../server/worker.mjs');
  const env = { ASSETS: { fetch: () => new Response('<html>app</html>', { headers: { 'Content-Type': 'text/html' } }) } };
  const ctx = { waitUntil() {} };
  const status = await worker.fetch(new Request('https://example.test/api/assistant/status'), env, ctx);
  assert.match(status.headers.get('content-type'), /application\/json/);
  assert.equal((await status.json()).aiAvailable, false);
  for (const route of ['chat', 'stream']) {
    const r = await worker.fetch(new Request('https://example.test/api/assistant/' + route, { method: 'POST', body: JSON.stringify({prompt:'Hello'}) }), env, ctx);
    assert.equal(r.status, 503);
    assert.match(r.headers.get('content-type'), /application\/json/);
  }
  const unknown = await worker.fetch(new Request('https://example.test/api/missing'), env, ctx);
  assert.equal(unknown.status, 404);
  const wrongMethod = await worker.fetch(new Request('https://example.test/api/assistant/chat'), env, ctx);
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get('allow'), 'POST');
  assert.equal(await (await worker.fetch(new Request('https://example.test/universities'), env, ctx)).text(), '<html>app</html>');
});

test('Workers entrypoint bundles for the edge and configuration gives APIs priority', async () => {
  await build({ entryPoints: ['server/worker.mjs'], bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'worker.mjs') });
  const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
  assert.equal(config.main, 'server/worker.mjs');
  assert.ok(config.assets.run_worker_first.includes('/api/*'));
  assert.equal(config.assets.binding, 'ASSETS');
});
