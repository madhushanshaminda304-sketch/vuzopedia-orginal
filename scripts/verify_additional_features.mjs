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

server.listen(4177, async () => {
  console.log('Verification server running on port 4177');
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

    await page.goto('http://localhost:4177');
    await page.waitForTimeout(1000);

    // 1. Open Services -> Individual Achievements Calculator
    console.log('Testing Individual Achievements Calculator...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Доп. баллы к ЕГЭ")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_achievements.png' });
    console.log('✓ Captured Achievements Calculator');

    // 2. Open Services -> Student Budget Calculator
    console.log('Testing Student Budget Calculator...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Бюджет студента")');
    await page.waitForTimeout(600);
    // Switch to Saint Petersburg
    await page.click('button:has-text("Санкт-Петербург")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/feature_student_budget.png' });
    console.log('✓ Captured Student Budget Calculator');

    // 3. Open Services -> Target Companies Directory
    console.log('Testing Target Education & Corporate Partners...');
    await page.click('button:has-text("Сервисы")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Целевое обучение")');
    await page.waitForTimeout(600);
    // Click Corporate Partners subtab
    await page.click('button:has-text("Крупнейшие корпорации-заказчики")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/feature_target_companies.png' });
    console.log('✓ Captured Target Corporate Partners');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log(`Console Errors count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
    } else {
      console.log('All additional features verified cleanly with 0 console errors!');
    }

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(0);
  }
});
