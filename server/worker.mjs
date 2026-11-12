import { pagesStatus, pagesChat } from './pagesAdapter.mjs';

const json = (body, status, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});

// Workers does not discover Pages' functions/ directory. Route these requests
// explicitly, sharing the same tested provider and durable-accounting adapter.
export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    const routes = {
      '/api/assistant/status': 'GET',
      '/api/assistant/chat': 'POST',
      '/api/assistant/stream': 'POST',
    };
    if (path === '/api' || path.startsWith('/api/')) {
      const method = routes[path];
      if (!method) return json({ error: { code: 'NOT_FOUND' } }, 404);
      if (request.method !== method) {
        return json({ error: { code: 'METHOD_NOT_ALLOWED' } }, 405, { Allow: method });
      }
      const context = { request, env, waitUntil: task => ctx.waitUntil(task) };
      try {
        if (path === '/api/assistant/status') return await pagesStatus(context);
        return await pagesChat(context, path === '/api/assistant/stream');
      } catch {
        return json({ error: { code: 'ASSISTANT_UNAVAILABLE' } }, 503);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
