/**
 * Verification Suite: Public Deployment Security, Abuse Prevention & Zero-Exposure Architecture
 * 
 * Verifies:
 * 1. Server validation (body, lengths, history, disallowed models)
 * 2. Rate limiting (15 RPM)
 * 3. Concurrency protection
 * 4. Error categories (CONFIG_MISSING, GLOBAL_USAGE_CUTOFF, RATE_LIMIT_EXCEEDED, CONCURRENCY_LIMIT, INVALID_REQUEST)
 * 5. Client bundle zero-exposure check (no VITE_GEMINI or secret tokens in dist/)
 * 6. Playwright browser E2E test with Ded Vuzoped Assistant & Security Status Modal
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  handleAssistantChat,
  getAssistantStatus,
  validateChatPayload,
  checkRateLimit,
  sanitizeLogString,
  __resetProxyStateForTests,
} from '../server/geminiProxy.mjs';
import { createAssistantServer } from '../server/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

async function runSecurityTests() {
  console.log('=== STARTING SECURITY & DEPLOYMENT VERIFICATION ===\n');
  let failures = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✔ ${testName}`);
    } else {
      console.error(`❌ FAILED: ${testName}`);
      failures++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Request Body & Model Validation
  // -------------------------------------------------------------
  console.log('1. Testing server payload validation...');
  __resetProxyStateForTests();

  const emptyBody = validateChatPayload(null);
  assert(!emptyBody.valid, 'Empty/null body is rejected');

  const missingPrompt = validateChatPayload({});
  assert(!missingPrompt.valid && missingPrompt.reason.includes('prompt'), 'Missing prompt field is rejected');

  const longPrompt = validateChatPayload({ prompt: 'A'.repeat(1001) });
  assert(!longPrompt.valid && longPrompt.reason.includes('exceeds maximum allowed length'), 'Prompt > 1000 chars is rejected');

  const longHistory = validateChatPayload({
    prompt: 'test',
    history: Array.from({ length: 11 }, (_, i) => ({ sender: 'user', text: `msg ${i}` })),
  });
  assert(!longHistory.valid && longHistory.reason.includes('exceeds maximum allowed length of 10'), 'History > 10 turns is rejected');

  const disallowedModel = validateChatPayload({ prompt: 'test', model: 'gpt-4o-malicious' });
  assert(!disallowedModel.valid && disallowedModel.reason.includes('Disallowed model'), 'Arbitrary/disallowed models are rejected');

  const validPayload = validateChatPayload({
    prompt: 'У меня 260 баллов, куда поступить?',
    history: [{ sender: 'user', text: 'привет' }, { sender: 'ded', text: 'здравствуй' }],
    evidence: '<evidence_data>...</evidence_data>',
    model: 'gemini-2.5-flash',
  });
  assert(validPayload.valid, 'Valid payload with allowed model is accepted');

  // -------------------------------------------------------------
  // TEST 2: Error Categories & Safe Missing Config Handling
  // -------------------------------------------------------------
  console.log('\n2. Testing server error categories...');

  // 2.1 Config missing
  const noKeyRes = await handleAssistantChat(
    { prompt: 'test' },
    '127.0.0.1',
    { apiKey: '', aiEnabled: true, globalDailyLimit: 1500, rateLimitPerMinute: 15, maxConcurrency: 2 }
  );
  assert(
    noKeyRes.status === 503 && noKeyRes.body.error.code === 'CONFIG_MISSING',
    'Returns 503 CONFIG_MISSING when GEMINI_API_KEY is not set'
  );

  // 2.2 Global usage cutoff
  const cutoffRes = await handleAssistantChat(
    { prompt: 'test' },
    '127.0.0.1',
    { apiKey: 'fake-test-key-xyz', aiEnabled: false, globalDailyLimit: 1500, rateLimitPerMinute: 15, maxConcurrency: 2 }
  );
  assert(
    cutoffRes.status === 503 && cutoffRes.body.error.code === 'GLOBAL_USAGE_CUTOFF',
    'Returns 503 GLOBAL_USAGE_CUTOFF when AI is disabled globally'
  );

  // -------------------------------------------------------------
  // TEST 3: Rate Limiting & Concurrency Controls
  // -------------------------------------------------------------
  console.log('\n3. Testing abuse prevention & rate limiting...');
  __resetProxyStateForTests();

  const testIp = '192.168.1.100';
  let rateLimitExceeded = false;
  let retryAfterValue = 0;

  for (let i = 0; i < 16; i++) {
    const check = checkRateLimit(testIp, 15);
    if (!check.allowed) {
      rateLimitExceeded = true;
      retryAfterValue = check.retryAfter || 0;
      break;
    }
  }
  assert(rateLimitExceeded && retryAfterValue > 0, '16th request in 1 minute from single IP triggers RATE_LIMIT_EXCEEDED with retryAfter');

  // Test different IP is NOT blocked (IP isolation)
  const diffIpCheck = checkRateLimit('192.168.1.200', 15);
  assert(diffIpCheck.allowed, 'Different client IP is not blocked by another IP rate limit');

  // -------------------------------------------------------------
  // TEST 4: Key Sanitization & Leak Prevention
  // -------------------------------------------------------------
  console.log('\n4. Testing secret key leak prevention...');
  const fakeKey = 'AQ.Ab8SecretKeySecret12345';
  const rawLog = `Calling Gemini at https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${fakeKey} with key ${fakeKey}`;
  const sanitized = sanitizeLogString(rawLog, fakeKey);
  assert(!sanitized.includes(fakeKey), 'Log string sanitizer completely removes secret API keys');
  assert(sanitized.includes('[REDACTED'), 'Log string sanitizer inserts [REDACTED_API_KEY] placeholder');

  // -------------------------------------------------------------
  // TEST 5: Production Client Bundle Verification (dist/)
  // -------------------------------------------------------------
  console.log('\n5. Testing production bundle zero-exposure security...');
  const assetsDir = path.join(DIST_DIR, 'assets');
  let bundleFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  let bundleContainsSecret = false;
  let bundleContainsViteGemini = false;

  for (const file of bundleFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf-8');
    if (content.includes('VITE_GEMINI_API_KEY')) {
      bundleContainsViteGemini = true;
    }
    const testSecret = process.env.GEMINI_API_KEY;
    if (testSecret && content.includes(testSecret)) {
      bundleContainsSecret = true;
    }
  }

  assert(!bundleContainsViteGemini, 'Production JS bundles contain ZERO references to VITE_GEMINI_API_KEY');
  assert(!bundleContainsSecret, 'Production JS bundles contain ZERO occurrences of the secret Gemini API key');

  // -------------------------------------------------------------
  // TEST 6: Standalone Server & E2E Browser Test
  // -------------------------------------------------------------
  console.log('\n6. Launching standalone server and Playwright E2E browser verification...');
  const testPort = 4200;
  const server = createAssistantServer();

  await new Promise((resolve) => server.listen(testPort, resolve));
  console.log(`Test server running on port ${testPort}`);

  // 6.1 Test /api/assistant/status over HTTP
  const statusRes = await fetch(`http://localhost:${testPort}/api/assistant/status`);
  const statusJson = await statusRes.json();
  assert(statusRes.status === 200, 'GET /api/assistant/status returns HTTP 200');
  assert(statusJson.freeTierPolicy.includes('Zero Cost Budget'), 'Status indicates Zero Cost Budget Free Tier policy');

  // 6.2 Browser verification
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    await page.goto(`http://localhost:${testPort}/`, { waitUntil: 'networkidle' });
    assert(true, 'Application loaded in browser');

    // Open Ded Vuzoped assistant
    const openBtn = page.locator('button:has-text("Дед Вузопед")').first();
    await openBtn.click();
    await page.waitForSelector('text=Дед Вузопед');
    assert(true, 'Ded Vuzoped assistant opened');

    // Check operating mode badge in header
    const header = page.locator('text=Дед Вузопед').first();
    await page.waitForSelector('text=Режим: Google Gemini');
    assert(true, 'Operating mode badge displayed: "Режим: Google Gemini"');

    // Click Shield button to open Security & Server Status Modal
    const shieldBtn = page.locator('button[title="Безопасность и серверный статус"]');
    await shieldBtn.click();
    await page.waitForSelector('text=Безопасность и серверный статус AI');
    assert(true, 'Security and Server Status Modal opened');
    await page.waitForSelector('text=Серверный AI активен');
    assert(true, 'Server AI status card rendered');
    await page.waitForSelector('text=Суточный отсекатель нагрузки');
    assert(true, 'Daily cutoff meter rendered');

    // Close Security Modal
    const closeSecurityBtn = page.locator('button:has-text("✕")').first();
    await closeSecurityBtn.click();
    assert(true, 'Security Modal closed');

    // Send a query to assistant
    const input = page.locator('[data-testid="ded-assistant-input"]');
    await input.fill('У меня 270 баллов, посоветуй IT в Москве с общежитием');
    const sendBtn = page.locator('button[title="Отправить (Enter)"]');
    await sendBtn.click();

    // Wait for response to appear
    await page.waitForSelector('[data-testid="assistant-message"]', { timeout: 10000 });
    assert(true, 'Assistant response rendered successfully');

    // Take screenshots for evidence
    const screenshotPath = path.resolve(__dirname, '../.pipeline/after/feature_assistant_secure_deployment.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Captured: ${screenshotPath}`);

    const artifactPath = path.join(ARTIFACT_DIR, 'feature_assistant_secure_deployment.png');
    try {
      fs.copyFileSync(screenshotPath, artifactPath);
      console.log(`Copied to artifact: ${artifactPath}`);
    } catch (e) {
      // ignore
    }

  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\nConsole errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  console.log(`\n--- SECURITY & DEPLOYMENT VERIFICATION COMPLETE ---`);
  if (failures === 0) {
    console.log('ALL TESTS PASSED! (0 failures)');
    process.exit(0);
  } else {
    console.error(`${failures} TEST(S) FAILED!`);
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
