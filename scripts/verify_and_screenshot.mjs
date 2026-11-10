import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Simple static server for dist
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
    // SPA fallback
    const indexPath = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(4173, async () => {
  console.log('Preview server running on port 4173');

  fs.mkdirSync('.pipeline/after', { recursive: true });

  let browser;
  try {
    // Try launching chromium or system chrome
    try {
      browser = await chromium.launch({ headless: true });
    } catch {
      browser = await chromium.launch({ headless: true, channel: 'chrome' });
    }

    const consoleErrors = [];

    // Test Desktop 1440px
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:4173');
    await page.waitForTimeout(1000);

    // Screenshot Desktop Home
    await page.screenshot({ path: '.pipeline/after/desktop_home_1440.png', fullPage: false });
    console.log('✓ Captured desktop_home_1440.png');

    // Click on Calculator Tab
    await page.click('button:has-text("Калькулятор ЕГЭ")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/desktop_calculator_1440.png', fullPage: false });
    console.log('✓ Captured desktop_calculator_1440.png');

    // Click on Specialties Tab
    await page.click('button:has-text("Специальности")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/desktop_specialties_1440.png', fullPage: false });
    console.log('✓ Captured desktop_specialties_1440.png');

    // Click on Tests Tab
    await page.click('button:has-text("Тесты и выбор")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/desktop_tests_1440.png', fullPage: false });
    console.log('✓ Captured desktop_tests_1440.png');

    // Click on Compare Tab
    await page.click('button:has-text("Сравнение")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/desktop_compare_1440.png', fullPage: false });
    console.log('✓ Captured desktop_compare_1440.png');

    // Test Mobile 375px
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 667 } });
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await mobilePage.goto('http://localhost:4173');
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: '.pipeline/after/mobile_home_375.png', fullPage: false });
    console.log('✓ Captured mobile_home_375.png');

    await browser.close();
    server.close();

    console.log('Console Errors Count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error('Errors:', consoleErrors);
      process.exit(1);
    }

    console.log('ALL PLAYWRIGHT TESTS AND SCREENSHOTS COMPLETED WITH 0 CONSOLE ERRORS!');
  } catch (err) {
    console.error('Playwright execution error:', err);
    if (browser) await browser.close();
    server.close();
    process.exit(1);
  }
});
