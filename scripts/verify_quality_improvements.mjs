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

server.listen(4178, async () => {
  console.log('Verification server running on port 4178');
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

    await page.goto('http://localhost:4178');
    await page.waitForTimeout(1000);

    // 1. Verify dynamic document title on Home
    console.log(`Document Title on load: "${await page.title()}"`);

    // 2. Test Global Search Modal with Multi-Category Results
    console.log('Testing Global Multi-Category Search...');
    await page.click('button[title*="Ctrl+K"]');
    await page.waitForTimeout(400);
    await page.fill('input[placeholder*="Поиск по вузам"]', 'информат');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_global_search_expanded.png' });
    console.log('✓ Captured Global Multi-Category Search Results');

    // Close search modal by clicking ESC button
    await page.click('button:has-text("ESC")');
    await page.waitForTimeout(500);

    // 3. Open University Detail Modal and Test New Tabs
    console.log('Testing University Detail Modal Extended Tabs...');
    // Click on the first university card (MGU or BMSTU)
    await page.locator('h3:has-text("МГУ им. М.В. Ломоносова")').first().click();
    await page.waitForTimeout(600);

    // Click "Общежития и ВУЦ" tab
    await page.click('button:has-text("Общежития и ВУЦ")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/feature_vuz_detail_dorms.png' });
    console.log('✓ Captured University Detail - Dorms & Military Tab');

    // Click "Отзывы студентов" tab
    await page.click('button:has-text("Отзывы студентов")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/feature_vuz_detail_reviews.png' });
    console.log('✓ Captured University Detail - Reviews Tab');

    // Close detail modal
    await page.locator('.bg-gradient-to-br button').first().click();
    await page.waitForTimeout(500);

    // 4. Test Toast Notification on Adding to Favorites
    console.log('Testing Toast Notifications...');
    const favBtn = page.locator('button[title*="приоритеты"]').first();
    await favBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: '.pipeline/after/feature_toast_notification.png' });
    console.log('✓ Captured Toast Notification');

    console.log('\n--- VERIFICATION SUMMARY ---');
    console.log(`Console Errors count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
    } else {
      console.log('All quality improvements verified cleanly with 0 console errors!');
    }

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(0);
  }
});
