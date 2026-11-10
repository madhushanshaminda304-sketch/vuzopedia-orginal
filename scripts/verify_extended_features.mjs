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

server.listen(4176, async () => {
  console.log('Verification server running on port 4176');
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

    await page.goto('http://localhost:4176');
    await page.waitForTimeout(1000);

    // 1. Programs Catalog Tab
    console.log('Testing Programs Catalog...');
    await page.click('button:has-text("Программы")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_programs.png' });
    console.log('✓ Captured Programs Catalog');

    // 2. Open Services Dropdown -> Dormitories
    console.log('Testing Dormitories View...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Общежития вузов")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_dorms.png' });
    console.log('✓ Captured Dormitories View');

    // 3. Open Services Dropdown -> Military Centers (ВУЦ)
    console.log('Testing Military Training Centers...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Военные кафедры (ВУЦ)")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_military.png' });
    console.log('✓ Captured Military Centers View');

    // 4. Open Services Dropdown -> Reviews
    console.log('Testing Student Reviews...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Отзывы студентов")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_reviews.png' });
    console.log('✓ Captured Reviews View');

    // 5. Open Services Dropdown -> Olympiads & BVI
    console.log('Testing Olympiads & BVI Calculator...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Олимпиады и БВИ")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_olympiads.png' });
    console.log('✓ Captured Olympiads View');

    // 6. Open Services Dropdown -> Educational Credit 3%
    console.log('Testing Credit 3% Calculator...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Кредит 3% и скидки")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_credit.png' });
    console.log('✓ Captured Credit Calculator View');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log(`Console Errors count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
    } else {
      console.log('All 6 new views rendered cleanly with 0 console errors!');
    }

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(0);
  }
});
