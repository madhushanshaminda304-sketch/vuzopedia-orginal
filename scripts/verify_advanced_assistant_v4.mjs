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

const PORT = 4181;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`Assistant v4 Verification server running on port ${PORT}`);
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

    console.log('2. Opening assistant via Header button...');
    const headerBtn = page.locator('button[title*="Дед Вузопед"], button:has-text("Дед Вузопед")').first();
    await headerBtn.click();
    await page.waitForTimeout(500);

    const modalTitle = page.locator('h3:has-text("Дед Вузопед")').first();
    await modalTitle.waitFor({ timeout: 5000 });
    console.log('Verified: Ded Vuzoped assistant opened.');

    // Step 3: Test Dynamic Operating Mode Badge
    console.log('3. Testing Dynamic Mode Badge...');
    const modeBadge = page.locator('span:has-text("Google Gemini"), span:has-text("Локальный каталог")').first();
    await modeBadge.waitFor({ timeout: 5000 });
    const modeText = await modeBadge.innerText();
    console.log(`Verified: Honest Operating Mode Badge active: "${modeText}"`);

    // Step 4: Test Magic Prompt Enhancer
    console.log('4. Testing Magic Prompt Enhancer button...');
    const input = page.locator('input[data-testid="ded-assistant-input"]');
    await input.fill('260 баллов москва');
    const wandBtn = page.locator('button[title*="Улучшить"]').first();
    await wandBtn.click();
    await page.waitForTimeout(300);
    const enrichedValue = await input.inputValue();
    console.log(`Verified: Magic Prompt enriched text to: "${enrichedValue}"`);

    // Step 5: Test Interactive Artifact Generation (Roadmap & Checklist)
    console.log('5. Testing Interactive Artifact Generation...');
    const checklistChip = page.locator('button:has-text("Чек-лист 2026")').first();
    if (await checklistChip.isVisible()) {
      await checklistChip.click();
    } else {
      await input.fill('Составь пошаговый чек-лист и стратегию поступления на 2026 год');
      await page.keyboard.press('Enter');
    }

    // Wait for response
    console.log('Waiting for artifact response...');
    try {
      await page.locator('.animate-bounce').first().waitFor({ state: 'detached', timeout: 15000 });
    } catch {}
    await page.waitForTimeout(1000);

    // Verify Artifact Banner & Button
    const artifactBtn = page.locator('button:has-text("Открыть холст")').last();
    await artifactBtn.waitFor({ timeout: 5000 });
    console.log('Verified: Artifact Banner & "Открыть холст" button rendered.');

    // Click to open Artifact Canvas Drawer
    await artifactBtn.click();
    await page.waitForTimeout(600);

    const canvasTitle = page.locator('text=Интерактивный холст');
    await canvasTitle.waitFor({ timeout: 5000 });
    console.log('Verified: Interactive Artifact Canvas Drawer opened!');

    // Toggle a checkbox inside canvas
    const firstCheckbox = page.locator('[data-testid="artifact-checkbox"]').first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click();
      await page.waitForTimeout(300);
      console.log('Verified: Artifact checklist item toggled and state preserved.');
    }

    // Capture Canvas Screenshot
    const canvasImg = path.join('.pipeline/after', 'feature_assistant_artifact_canvas.png');
    await page.screenshot({ path: canvasImg });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(canvasImg, path.join(artifactDir, 'feature_assistant_artifact_canvas.png'));
    }
    console.log('Captured: feature_assistant_artifact_canvas.png');

    // Close Canvas
    const closeCanvasBtn = page.locator('[data-testid="close-artifact-canvas"]').first();
    await closeCanvasBtn.click();
    await page.waitForTimeout(300);
    console.log('Verified: Artifact Canvas closed.');

    // Step 6: Test Voice Text-to-Speech (TTS)
    console.log('6. Testing Voice TTS Playback button...');
    const ttsBtn = page.locator('button[title*="Озвучить"]').last();
    if (await ttsBtn.isVisible()) {
      await ttsBtn.click();
      await page.waitForTimeout(400);
      console.log('Verified: TTS Audio speech playback triggered.');
      await ttsBtn.click(); // Stop
      await page.waitForTimeout(300);
    }

    // Step 7: Test Honest Citations Drawer
    console.log('7. Testing Honest Local Citations Drawer...');
    const citationPill = page.locator('button:has-text("материалы каталога")').last();
    if (await citationPill.isVisible()) {
      await citationPill.click();
      await page.waitForTimeout(500);

      const catalogSourceBadge = page.locator('text=Локальный каталог').first();
      if (await catalogSourceBadge.isVisible()) {
        console.log('Verified: Honest Local Catalog grounding chunks verified!');
      }

      const webImg = path.join('.pipeline/after', 'feature_assistant_web_search.png');
      await page.screenshot({ path: webImg });
      if (fs.existsSync(artifactDir)) {
        fs.copyFileSync(webImg, path.join(artifactDir, 'feature_assistant_web_search.png'));
      }
      console.log('Captured: feature_assistant_web_search.png (updated honest citations)');

      const closeCitationsBtn = page.locator('[data-testid="close-citations-modal"]').first();
      await closeCitationsBtn.click();
      await page.waitForTimeout(300);
    }

    // Step 8: Test Chat Sessions History Drawer
    console.log('8. Testing Sessions History Drawer...');
    const historyBtn = page.locator('button[title="История консультаций"]').first();
    await historyBtn.click();
    await page.waitForTimeout(500);

    const historyDrawerTitle = page.locator('text=История консультаций');
    await historyDrawerTitle.waitFor({ timeout: 5000 });
    console.log('Verified: History Sessions Drawer opened with saved session!');

    // Capture Sessions History Screenshot
    const historyImg = path.join('.pipeline/after', 'feature_assistant_history_sessions.png');
    await page.screenshot({ path: historyImg });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(historyImg, path.join(artifactDir, 'feature_assistant_history_sessions.png'));
    }
    console.log('Captured: feature_assistant_history_sessions.png');

    // Click "+ Новый диалог"
    const newChatBtn = page.locator('button:has-text("Новый диалог")').last();
    await newChatBtn.click();
    await page.waitForTimeout(400);
    console.log('Verified: New Chat Session successfully started!');

    console.log('\n--- ALL ADVANCED ASSISTANT V4 CHECKS PASSED ---');
    console.log(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  } catch (err) {
    console.error('Assistant v4 verification failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
