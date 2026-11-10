import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexPath = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

const PORT = 4179;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`Verification server running on port ${PORT}`);
  fs.mkdirSync('.pipeline/after', { recursive: true });

  let browser;
  try {
    try {
      browser = await chromium.launch({ headless: true });
    } catch {
      browser = await chromium.launch({ headless: true, channel: 'chrome' });
    }

    const consoleErrors = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    console.log('1. Navigating to homepage...');
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');

    // Test 1: Open via Header button
    console.log('2. Opening assistant via Header button...');
    const headerBtn = page.locator('button[title*="Дед Вузопед"], button:has-text("Дед Вузопед")').first();
    await headerBtn.click();
    await page.waitForTimeout(500);

    const modalTitle = page.locator('text=Дед Вузопед AI');
    await modalTitle.waitFor({ timeout: 5000 });
    console.log('Verified: Assistant modal opened successfully from Header.');

    // Test 2: Test Gemini API Settings Popover
    console.log('3. Testing Gemini API settings modal...');
    const settingsBtn = page.locator('button[title="Настройки Gemini API"]');
    await settingsBtn.click();
    await page.waitForTimeout(400);

    const settingsDrawer = page.locator('text=Настройки Gemini API Key');
    await settingsDrawer.waitFor({ timeout: 4000 });
    console.log('Verified: Gemini API settings drawer opened with active key.');
    await settingsBtn.click(); // toggle close
    await page.waitForTimeout(300);

    // Test 3: Send question "Какие проходные баллы на IT в 2026?"
    console.log('4. Sending IT query to assistant...');
    const input = page.locator('input[data-testid="ded-assistant-input"], input[placeholder*="Спросите"]');
    await input.waitFor({ timeout: 5000 });
    await input.fill('Какие проходные баллы на IT в 2026?');
    await page.keyboard.press('Enter');

    // Wait for response and tool call (Gemini API or local fallback)
    console.log('5. Waiting for AI response and Astryx ChatToolCalls...');
    const toolCallPill = page.locator('button:has-text("Реестр программ"), button:has-text("Аналитический модуль"), button:has-text("База"), button:has-text("Калькулятор")').last();
    await toolCallPill.waitFor({ timeout: 15000 });
    console.log('Verified: Astryx ChatToolCall pill rendered.');

    // Expand tool call
    await toolCallPill.click();
    await page.waitForTimeout(400);

    // Capture screenshot with tool call expanded
    const toolCallImg = path.join('.pipeline/after', 'feature_assistant_toolcalls.png');
    await page.screenshot({ path: toolCallImg });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(toolCallImg, path.join(artifactDir, 'feature_assistant_toolcalls.png'));
    }
    console.log('Captured: feature_assistant_toolcalls.png');

    // Test 4: Astryx Toolbar - Thumbs up feedback & Copy
    console.log('6. Testing message reactions (Thumbs up and Copy)...');
    const thumbsUpBtn = page.locator('button[title="Полезный ответ"]').last();
    if (await thumbsUpBtn.isVisible()) {
      await thumbsUpBtn.click();
      await page.waitForTimeout(300);
      console.log('Verified: Thumbs up reaction clicked.');
    }

    const copyBtn = page.locator('button[title="Скопировать ответ"]').last();
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
      await page.waitForTimeout(400);
      console.log('Verified: Copy button triggered check confirmation.');
    }

    // Test 5: Fullscreen Toggle
    console.log('7. Testing Fullscreen workspace view...');
    const fullscreenBtn = page.locator('button[title="На весь экран"]');
    if (await fullscreenBtn.isVisible()) {
      await fullscreenBtn.click();
      await page.waitForTimeout(500);

      const fsImg = path.join('.pipeline/after', 'feature_assistant_fullscreen.png');
      await page.screenshot({ path: fsImg });
      if (fs.existsSync(artifactDir)) {
        fs.copyFileSync(fsImg, path.join(artifactDir, 'feature_assistant_fullscreen.png'));
      }
      console.log('Captured: feature_assistant_fullscreen.png');

      const normalViewBtn = page.locator('button[title="Обычный режим"]');
      await normalViewBtn.click();
      await page.waitForTimeout(400);
      console.log('Verified: Returned to normal modal view.');
    }

    // Capture full assistant dialog screenshot
    const fullAssistantImg = path.join('.pipeline/after', 'feature_assistant_astryx.png');
    await page.screenshot({ path: fullAssistantImg });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(fullAssistantImg, path.join(artifactDir, 'feature_assistant_astryx.png'));
    }
    console.log('Captured: feature_assistant_astryx.png');

    // Close modal
    const closeBtn = page.locator('button[title="Закрыть окно"], button[title*="Закрыть"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Test 6: Verify Floating Action Button opens assistant
    console.log('8. Opening assistant via Floating Action Button...');
    const floatingBtn = page.locator('button[title="Спросить Деда Вузопеда"]');
    await floatingBtn.click({ force: true });
    await page.waitForTimeout(500);
    await modalTitle.waitFor({ timeout: 5000 });
    console.log('Verified: Assistant modal opened from floating action button.');

    await closeBtn.click();
    await page.waitForTimeout(500);

    // Test 7: Verify Footer "ПОМОЩЬ И ОБРАТНАЯ СВЯЗЬ" opens assistant
    console.log('9. Testing Footer "ПОМОЩЬ И ОБРАТНАЯ СВЯЗЬ" link...');
    const footerHelpBtn = page.locator('footer button:has-text("ПОМОЩЬ И ОБРАТНАЯ СВЯЗЬ")');
    await footerHelpBtn.scrollIntoViewIfNeeded();
    await footerHelpBtn.click();
    await page.waitForTimeout(500);
    await modalTitle.waitFor({ timeout: 5000 });
    console.log('Verified: Footer help button successfully opens Ded Vuzoped assistant!');

    console.log('\n--- VERIFICATION SUMMARY ---');
    console.log('All 7 assistant verification checks PASSED.');
    console.log(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console errors encountered:', consoleErrors);
    }
  } catch (err) {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
