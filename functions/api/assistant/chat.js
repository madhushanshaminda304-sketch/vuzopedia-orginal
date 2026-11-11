/**
 * Cloudflare Pages Function: POST /api/assistant/chat
 * 
 * Secure Edge handler for Gemini chat requests.
 * Uses environment secrets (env.GEMINI_API_KEY) with zero client exposure.
 */

import { handleAssistantChat } from '../../server/geminiProxy.mjs';

export async function onRequestPost(context) {
  const { request, env } = context;

  const config = {
    apiKey: env.GEMINI_API_KEY || '',
    aiEnabled: env.AI_ENABLED !== 'false',
    globalDailyLimit: parseInt(env.AI_GLOBAL_DAILY_LIMIT || '1500', 10),
    rateLimitPerMinute: parseInt(env.AI_RATE_LIMIT_PER_MINUTE || '15', 10),
    maxConcurrency: parseInt(env.AI_MAX_CONCURRENCY || '2', 10),
  };

  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'INVALID_JSON', message: 'Malformed JSON payload' } }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }

  const result = await handleAssistantChat(body, clientIp, config);

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  if (result.body?.error?.retryAfter) {
    headers['Retry-After'] = String(result.body.error.retryAfter);
  }

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers,
  });
}
