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

server.listen(4173, async () => {
  console.log('Preview server running on port 4173');

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
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:4173');
    await page.waitForTimeout(1000);

    // 1. Home
    await page.screenshot({ path: '.pipeline/after/desktop_home_1440.png' });
    console.log('✓ Captured desktop_home_1440.png');

    // 2. Calculator
    await page.click('button:has-text("Калькулятор ЕГЭ")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/desktop_calculator_1440.png' });
    console.log('✓ Captured desktop_calculator_1440.png');

    // 3. SPO / Colleges
    await page.click('button:has-text("Колледжи (СПО)")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/desktop_spo_1440.png' });
    console.log('✓ Captured desktop_spo_1440.png');

    // 4. Target Quota
    await page.click('button:has-text("Целевое")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/desktop_target_1440.png' });
    console.log('✓ Captured desktop_target_1440.png');

    // 5. Fear Map / Where to start
    await page.click('button:has-text("С чего начать")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/desktop_fear_map_1440.png' });
    console.log('✓ Captured desktop_fear_map_1440.png');

    // 6. Blacklist
    await page.click('button:has-text("Черный список")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/desktop_blacklist_1440.png' });
    console.log('✓ Captured desktop_blacklist_1440.png');

    // 7. Remote / Online degrees
    await page.click('button:has-text("Онлайн-обучение")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: '.pipeline/after/desktop_remote_1440.png' });
    console.log('✓ Captured desktop_remote_1440.png');

    // 8. Open Ded Vuzoped Assistant
    await page.click('button:has-text("Дед Вузопед")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/desktop_ded_assistant_1440.png' });
    console.log('✓ Captured desktop_ded_assistant_1440.png');

    await browser.close();
    server.close();

    console.log('Console Errors Count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error('Errors:', consoleErrors);
      process.exit(1);
    }

    console.log('ALL EXTENDED PLAYWRIGHT TESTS PASSED WITH 0 CONSOLE ERRORS!');
  } catch (err) {
    console.error('Error in verification:', err);
    if (browser) await browser.close();
    server.close();
    process.exit(1);
  }
});
