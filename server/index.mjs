/**
 * Standalone Production Node.js Server for Vuzopedia Assistant API
 * 
 * Runs with standard Node.js (Node 18+). Zero external npm packages required.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleAssistantChat,
  getAssistantStatus,
  getClientIp,
  DEFAULT_CONFIG,
} from './geminiProxy.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

// Read .env if present in root (native simple parser)
const ENV_PATH = path.resolve(__dirname, '../.env');
if (fs.existsSync(ENV_PATH)) {
  try {
    const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    // ignore
  }
}

// Re-read configuration after loading .env
const serverConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  aiEnabled: process.env.AI_ENABLED !== 'false',
  globalDailyLimit: parseInt(process.env.AI_GLOBAL_DAILY_LIMIT || '1500', 10),
  rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '15', 10),
  maxConcurrency: parseInt(process.env.AI_MAX_CONCURRENCY || '2', 10),
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

export function createAssistantServer(config = serverConfig) {
  const server = http.createServer(async (req, res) => {
    // Basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // 1. Status endpoint
    if (pathname === '/api/assistant/status' && req.method === 'GET') {
      const statusData = getAssistantStatus(config);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(statusData, null, 2));
      return;
    }

    // 2. Chat endpoint
    if (pathname === '/api/assistant/chat') {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' } }));
        return;
      }

      // Check request size limit (64 KB)
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
          res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request payload exceeds 64 KB limit' } }));
          return;
        }

        let parsedBody;
        try {
          parsedBody = JSON.parse(bodyData || '{}');
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: { code: 'INVALID_JSON', message: 'Malformed JSON payload' } }));
          return;
        }

        const clientIp = getClientIp(req.headers, req.socket.remoteAddress);
        const result = await handleAssistantChat(parsedBody, clientIp, config);

        if (result.body?.error?.retryAfter) {
          res.setHeader('Retry-After', String(result.body.error.retryAfter));
        }

        res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.body));
      });

      return;
    }

    // 3. Static files if dist/ exists
    if (fs.existsSync(DIST_DIR) && req.method === 'GET') {
      let filePath = path.join(DIST_DIR, pathname);
      
      // Prevent path traversal
      if (!filePath.startsWith(DIST_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
      }

      let stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      if (stats && stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      }

      if (stats && stats.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      // SPA fallback to index.html for non-asset GET requests
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath) && !pathname.startsWith('/api/')) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
    }

    // 4. Default 404 for unknown endpoints
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not Found' } }));
  });

  return server;
}

// Start standalone server if directly executed
const isDirectRun = process.argv[1] && process.argv[1].endsWith('server/index.mjs');
if (isDirectRun) {
  const port = parseInt(process.env.PORT || '3001', 10);
  const server = createAssistantServer();
  server.listen(port, () => {
    console.log(`[Vuzopedia Assistant Server] Listening on http://localhost:${port}`);
    console.log(`[Vuzopedia Assistant Server] AI enabled: ${serverConfig.aiEnabled}, Key configured: ${Boolean(serverConfig.apiKey)}`);
  });
}
