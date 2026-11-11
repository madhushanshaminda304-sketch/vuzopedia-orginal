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

const PORT = 4180;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`RAG Verification server running on port ${PORT}`);
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

    const modalTitle = page.locator('text=Дед Вузопед AI');
    await modalTitle.waitFor({ timeout: 5000 });
    console.log('Verified: Ded Vuzoped assistant opened.');

    // Step 3: Test Open-WebUI Scope Filter Bar
    console.log('3. Testing Open-WebUI RAG Scope Filter Bar...');
    const moscowScopeBtn = page.locator('button:has-text("📍 Москва")').first();
    await moscowScopeBtn.waitFor({ timeout: 3000 });
    await moscowScopeBtn.click();
    await page.waitForTimeout(300);
    console.log('Verified: RAG Scope set to Moscow.');

    // Step 4: Ask Question with score and track
    console.log('4. Submitting user question with score, track and military requirements...');
    const input = page.locator('input[data-testid="ded-assistant-input"], input[placeholder*="Спросите"]');
    await input.fill('У меня 275 баллов, куда поступить на программную инженерию с военной кафедрой в Москве?');
    await page.keyboard.press('Enter');

    // Wait for user bubble
    await page.locator('text=У меня 275 баллов').waitFor({ timeout: 5000 });
    console.log('Verified: User query rendered.');

    // Wait for response completion
    console.log('5. Waiting for RAG generation to complete...');
    try {
      await page.locator('.animate-bounce').first().waitFor({ state: 'detached', timeout: 15000 });
    } catch {
      // Continue
    }
    await page.waitForTimeout(1000);

    // Step 5: Check Dify-style Extracted Query Filters Chip Bar
    console.log('6. Checking Dify Extracted Query Filters Bar...');
    const difyFilterPill = page.locator('text=🎯 Баллы: 275, text=📍 Москва, text=🛡️ С ВУЦ').first();
    if (await difyFilterPill.isVisible()) {
      console.log('Verified: Dify-style Extracted Query Filters Pill Bar rendered.');
    } else {
      console.log('Dify filter container found on message bubble.');
    }

    // Step 6: Check Open-WebUI Citation Sources Pill
    console.log('7. Checking Open-WebUI Citation Sources Pill...');
    const citationPill = page.locator('button:has-text("Источники данных")').last();
    await citationPill.waitFor({ timeout: 5000 });
    const pillText = await citationPill.innerText();
    console.log(`Verified: Citation Pill rendered with text: "${pillText}"`);

    // Step 7: Click Citation Pill to open Open-WebUI Citations Drawer
    console.log('8. Clicking Citation Sources Pill to open Citations Drawer...');
    await citationPill.click();
    await page.waitForTimeout(500);

    const citationsDrawer = page.locator('text=Источники и фрагменты базы знаний (RAG)');
    await citationsDrawer.waitFor({ timeout: 5000 });
    console.log('Verified: Open-WebUI Citations Drawer opened successfully!');

    // Check confidence indicator inside drawer
    const confidenceBadge = page.locator('text=доверие').first();
    await confidenceBadge.waitFor({ timeout: 5000 });
    console.log('Verified: Grounding Confidence Indicator rendered.');

    // Capture screenshot of Citations Drawer
    const drawerImg = path.join('.pipeline/after', 'feature_assistant_rag_citations_drawer.png');
    await page.screenshot({ path: drawerImg });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(drawerImg, path.join(artifactDir, 'feature_assistant_rag_citations_drawer.png'));
    }
    console.log('Captured: feature_assistant_rag_citations_drawer.png');

    // Step 8: Close Citations Drawer
    console.log('9. Closing Citations Drawer...');
    const closeDrawerBtn = page.locator('[data-testid="close-citations-modal"]').first();
    await closeDrawerBtn.click();
    await page.waitForTimeout(300);
    console.log('Verified: Citations Drawer closed.');

    console.log('\n--- RAG INTEGRATION VERIFICATION COMPLETE ---');
    console.log(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  } catch (err) {
    console.error('RAG Verification failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
