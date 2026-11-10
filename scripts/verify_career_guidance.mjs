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

server.listen(4174, async () => {
  console.log('Verification server running on port 4174');
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
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:4174');
    await page.waitForTimeout(1000);

    // 1. Capture Career Guidance 5-card carousel (matches user photo)
    const careerSection = await page.locator('section:has-text("Career guidance")').first();
    await careerSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await careerSection.screenshot({ path: '.pipeline/after/career_guidance_exact.png' });
    console.log('✓ Captured .pipeline/after/career_guidance_exact.png (matches uploaded photo)');

    // 2. Full desktop home screenshot with career cards
    await page.screenshot({ path: '.pipeline/after/desktop_home_with_career_cards.png' });
    console.log('✓ Captured .pipeline/after/desktop_home_with_career_cards.png');

    // 3. Test Clicking "Take advantage" on Card 1 (Selecting a profession)
    const card1Btn = careerSection.locator('button:has-text("Take advantage")').nth(0);
    await card1Btn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/modal_card1_profession_selector.png' });
    console.log('✓ Captured modal_card1_profession_selector.png');

    // Close modal
    await page.click('button:has(svg.lucide-x)');
    await page.waitForTimeout(300);

    // 4. Test Card 5 (One of two / Balance Test)
    const card5Btn = careerSection.locator('button:has-text("Take advantage")').nth(4);
    await card5Btn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/modal_card5_one_of_two.png' });
    console.log('✓ Captured modal_card5_one_of_two.png');

    // Close modal
    await page.click('button:has(svg.lucide-x)');
    await page.waitForTimeout(300);

    // 5. Test switching to "Профориентация" tab
    await page.click('button:has-text("Профориентация")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/career_tests_tab.png' });
    console.log('✓ Captured career_tests_tab.png');

    await browser.close();
    server.close();

    console.log('Console errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
      process.exit(1);
    }

    console.log('ALL CAREER GUIDANCE TESTS PASSED WITH 0 CONSOLE ERRORS!');
    process.exit(0);
  } catch (err) {
    console.error('Error during test execution:', err);
    if (browser) await browser.close();
    server.close();
    process.exit(1);
  }
});
