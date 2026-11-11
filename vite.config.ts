import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { handleAssistantChat, getAssistantStatus, getClientIp } from './server/geminiProxy.mjs';

// Load .env variables into process.env for the Vite development server
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  } catch {
    // ignore
  }
}

function assistantDevServerPlugin(): Plugin {
  return {
    name: 'vuzopedia-assistant-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const pathname = url.pathname;

        if (pathname === '/api/assistant/status' && req.method === 'GET') {
          const status = getAssistantStatus({
            apiKey: process.env.GEMINI_API_KEY || '',
            aiEnabled: process.env.AI_ENABLED !== 'false',
            globalDailyLimit: parseInt(process.env.AI_GLOBAL_DAILY_LIMIT || '1500', 10),
            rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '15', 10),
            maxConcurrency: parseInt(process.env.AI_MAX_CONCURRENCY || '2', 10),
          });
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(status));
          return;
        }

        if (pathname === '/api/assistant/chat' && req.method === 'POST') {
          let bodyData = '';
          let bodyTooLarge = false;

          req.on('data', (chunk) => {
            bodyData += chunk;
            if (bodyData.length > 65536) {
              bodyTooLarge = true;
              req.destroy();
            }
          });

          req.on('end', async () => {
            if (bodyTooLarge) {
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload exceeds 64 KB limit' } }));
              return;
            }

            let parsedBody = {};
            try {
              parsedBody = JSON.parse(bodyData || '{}');
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: { code: 'INVALID_JSON', message: 'Malformed JSON payload' } }));
              return;
            }

            const clientIp = getClientIp(req.headers as any, req.socket.remoteAddress);
            const result = await handleAssistantChat(parsedBody, clientIp, {
              apiKey: process.env.GEMINI_API_KEY || '',
              aiEnabled: process.env.AI_ENABLED !== 'false',
              globalDailyLimit: parseInt(process.env.AI_GLOBAL_DAILY_LIMIT || '1500', 10),
              rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '15', 10),
              maxConcurrency: parseInt(process.env.AI_MAX_CONCURRENCY || '2', 10),
            });

            if (result.body?.error?.retryAfter) {
              res.setHeader('Retry-After', String(result.body.error.retryAfter));
            }

            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(result.body));
          });
          return;
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const pathname = url.pathname;

        if (pathname === '/api/assistant/status' && req.method === 'GET') {
          const status = getAssistantStatus({
            apiKey: process.env.GEMINI_API_KEY || '',
            aiEnabled: process.env.AI_ENABLED !== 'false',
            globalDailyLimit: parseInt(process.env.AI_GLOBAL_DAILY_LIMIT || '1500', 10),
            rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '15', 10),
            maxConcurrency: parseInt(process.env.AI_MAX_CONCURRENCY || '2', 10),
          });
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(status));
          return;
        }

        if (pathname === '/api/assistant/chat' && req.method === 'POST') {
          let bodyData = '';
          let bodyTooLarge = false;

          req.on('data', (chunk) => {
            bodyData += chunk;
            if (bodyData.length > 65536) {
              bodyTooLarge = true;
              req.destroy();
            }
          });

          req.on('end', async () => {
            if (bodyTooLarge) {
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload exceeds 64 KB limit' } }));
              return;
            }

            let parsedBody = {};
            try {
              parsedBody = JSON.parse(bodyData || '{}');
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: { code: 'INVALID_JSON', message: 'Malformed JSON payload' } }));
              return;
            }

            const clientIp = getClientIp(req.headers as any, req.socket.remoteAddress);
            const result = await handleAssistantChat(parsedBody, clientIp, {
              apiKey: process.env.GEMINI_API_KEY || '',
              aiEnabled: process.env.AI_ENABLED !== 'false',
              globalDailyLimit: parseInt(process.env.AI_GLOBAL_DAILY_LIMIT || '1500', 10),
              rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '15', 10),
              maxConcurrency: parseInt(process.env.AI_MAX_CONCURRENCY || '2', 10),
            });

            if (result.body?.error?.retryAfter) {
              res.setHeader('Retry-After', String(result.body.error.retryAfter));
            }

            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(result.body));
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), assistantDevServerPlugin()],
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
