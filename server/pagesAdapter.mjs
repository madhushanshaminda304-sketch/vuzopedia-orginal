import { handleAssistantChat, handleAssistantStream, getAssistantStatus } from './geminiProxy.mjs';

const positiveInt = (value, fallback) => {
  const n = Number(value ?? fallback);
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
};

export function pagesConfig(env = {}) {
  return {
    apiKey: env.GEMINI_API_KEY || '',
    // Fail closed until the durable usage binding has been configured.
    aiEnabled: env.AI_ENABLED !== 'false' && Boolean(env.ASSISTANT_USAGE),
    globalDailyLimit: positiveInt(env.AI_GLOBAL_DAILY_LIMIT, 1500),
    rateLimitPerMinute: positiveInt(env.AI_RATE_LIMIT_PER_MINUTE, 15),
    maxConcurrency: positiveInt(env.AI_MAX_CONCURRENCY, 2),
    reserveAttempt: async (limit) => {
      if (!env.ASSISTANT_USAGE) return false;
      const day = new Date().toISOString().slice(0, 10);
      // One atomic write: concurrent requests cannot reserve beyond the cap.
      const row = await env.ASSISTANT_USAGE.prepare(`
        INSERT INTO assistant_daily_usage (day, attempts) VALUES (?1, 1)
        ON CONFLICT(day) DO UPDATE SET attempts = attempts + 1
        WHERE attempts < ?2
        RETURNING attempts
      `).bind(day, limit).first();
      return Boolean(row);
    },
  };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

export async function pagesStatus({ env }) {
  const config = pagesConfig(env);
  const status = getAssistantStatus(config);
  if (!env.ASSISTANT_USAGE) {
    status.aiAvailable = false;
    status.mode = 'local_only';
    status.reason = 'USAGE_STORE_MISSING: Shared AI usage accounting is not configured.';
  } else {
    try {
      const row = await env.ASSISTANT_USAGE.prepare('SELECT attempts FROM assistant_daily_usage WHERE day = ?1')
        .bind(new Date().toISOString().slice(0, 10)).first();
      status.dailyUsage = row?.attempts || 0;
      if (status.dailyUsage >= config.globalDailyLimit) {
        status.aiAvailable = false; status.mode = 'local_only'; status.reason = 'GLOBAL_USAGE_CUTOFF';
      }
    } catch {
      status.aiAvailable = false; status.mode = 'local_only'; status.reason = 'USAGE_STORE_UNAVAILABLE';
    }
  }
  return json(status);
}

async function readPayload(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('INVALID_JSON');
  const parts = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); throw new Error('PAYLOAD_TOO_LARGE'); }
      parts.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const p of parts) { bytes.set(p, offset); offset += p.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function pagesChat(context, streaming = false) {
  const { request, env } = context;
  let body;
  try { body = await readPayload(request); }
  catch (err) { return json({ error: { code: err.message === 'PAYLOAD_TOO_LARGE' ? err.message : 'INVALID_JSON' } }, err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400); }
  const config = pagesConfig(env);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!streaming) {
    const result = await handleAssistantChat(body, ip, config);
    return json(result.body, result.status);
  }

  // Adapt the shared stream handler to Fetch/Web Streams, with backpressure.
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const closeCallbacks = [];
  let disconnected = request.signal.aborted;
  let finished = false;
  let closing = Promise.resolve();
  let resolveResponse;
  const responseReady = new Promise(resolve => { resolveResponse = resolve; });
  const disconnect = () => {
    if (finished) return;
    disconnected = true;
    closeCallbacks.forEach(fn => fn());
  };
  request.signal.addEventListener('abort', disconnect, { once: true });
  writer.closed.catch(disconnect);
  const adapter = {
    writeHead(status, headers) {
      const safeHeaders = new Headers(headers);
      safeHeaders.delete('Connection');
      safeHeaders.set('Cache-Control', 'no-store');
      resolveResponse(new Response(stream.readable, { status, headers: safeHeaders }));
    },
    on(event, callback) { if (event === 'close') { closeCallbacks.push(callback); if (disconnected) callback(); } },
    async write(text) { if (!disconnected) await writer.write(encoder.encode(text)); },
    end(text) {
      closing = (async () => {
        if (text && !disconnected) await writer.write(encoder.encode(text));
        if (!disconnected) await writer.close();
        finished = true;
      })();
      closing.catch(disconnect);
    },
  };
  const task = handleAssistantStream(body, ip, adapter, config)
    .then(() => closing)
    .catch(async () => { resolveResponse(json({ error: { code: 'STREAM_FAILED' } }, 502)); await writer.abort().catch(() => {}); })
    .finally(() => request.signal.removeEventListener('abort', disconnect));
  context.waitUntil(task);
  return responseReady;
}
