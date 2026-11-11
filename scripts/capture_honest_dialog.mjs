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
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
  }
});

server.listen(4182, async () => {
  let browser;
  try {
    try {
      browser = await chromium.launch({ headless: true });
    } catch {
      browser = await chromium.launch({ headless: true, channel: 'chrome' });
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4182');
    await page.waitForLoadState('networkidle');

    const headerBtn = page.locator('button[title*="Дед Вузопед"], button:has-text("Дед Вузопед")').first();
    await headerBtn.click();
    await page.waitForTimeout(600);

    const input = page.locator('input[data-testid="ded-assistant-input"]');
    await input.fill('У меня 270 баллов, IT в Москве');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);

    const shotPath = path.join('.pipeline/after', 'feature_assistant_honest_dialog.png');
    await page.screenshot({ path: shotPath });
    const artDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';
    if (fs.existsSync(artDir)) {
      fs.copyFileSync(shotPath, path.join(artDir, 'feature_assistant_honest_dialog.png'));
    }
    console.log('Captured feature_assistant_honest_dialog.png');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
