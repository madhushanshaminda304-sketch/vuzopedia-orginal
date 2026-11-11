/**
 * Cloudflare Pages Function: GET /api/assistant/status
 * 
 * Returns server assistant operating mode and protection state.
 */

import { getAssistantStatus } from '../../server/geminiProxy.mjs';

export async function onRequestGet(context) {
  const { env } = context;

  const config = {
    apiKey: env.GEMINI_API_KEY || '',
    aiEnabled: env.AI_ENABLED !== 'false',
    globalDailyLimit: parseInt(env.AI_GLOBAL_DAILY_LIMIT || '1500', 10),
    rateLimitPerMinute: parseInt(env.AI_RATE_LIMIT_PER_MINUTE || '15', 10),
    maxConcurrency: parseInt(env.AI_MAX_CONCURRENCY || '2', 10),
  };

  const status = getAssistantStatus(config);

  return new Response(JSON.stringify(status, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
}
