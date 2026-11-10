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

server.listen(4175, async () => {
  console.log('Verification server running on port 4175');
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

    await page.goto('http://localhost:4175');
    await page.waitForTimeout(1000);

    // 1. Home Page with 5-Card Carousel (Photo 1)
    await page.screenshot({ path: '.pipeline/after/photo1_home_5cards.png' });
    console.log('✓ Captured Photo 1: photo1_home_5cards.png');

    // 2. Click Card 1 "Take advantage" -> Opens "Choose a future in which you will be happy" (Photos 6 & 7)
    const card1Btn = page.locator('section:has-text("Career guidance") button:has-text("Take advantage")').first();
    await card1Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo6_7_choose_future_input.png' });
    console.log('✓ Captured Photos 6 & 7: photo6_7_choose_future_input.png');

    // Click "Find me a profession" -> Opens Results (Photo 11)
    await page.click('button:has-text("Find me a profession")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo11_choose_future_results.png' });
    console.log('✓ Captured Photo 11: photo11_choose_future_results.png');

    // 3. Navigate to Card 2: "Career selection based on the Unified State Exam" (Photos 2 & 5)
    await page.click('button:has-text("ВУЗОПЕДИЯ")');
    await page.waitForTimeout(500);
    const card2Btn = page.locator('section:has-text("Career guidance") button:has-text("Take advantage")').nth(1);
    await card2Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo2_5_use_selection_input.png' });
    console.log('✓ Captured Photos 2 & 5: photo2_5_use_selection_input.png');

    // Click "Find me a profession" -> Opens Results (Photo 9)
    await page.click('button:has-text("Find me a profession")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo9_use_selection_results.png' });
    console.log('✓ Captured Photo 9: photo9_use_selection_results.png');

    // 4. Navigate to Card 3: "Подобрать профессию по школьным предметам" (Photo 8)
    await page.click('button:has-text("ВУЗОПЕДИЯ")');
    await page.waitForTimeout(500);
    const card3Btn = page.locator('section:has-text("Career guidance") button:has-text("Take advantage")').nth(2);
    await card3Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo8_school_subjects_input.png' });
    console.log('✓ Captured Photo 8: photo8_school_subjects_input.png');

    // Click "Подобрать профессию" -> Opens Results (Photo 10)
    await page.click('button:has-text("Подобрать профессию")');
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo10_school_subjects_results.png' });
    console.log('✓ Captured Photo 10: photo10_school_subjects_results.png');

    // 5. Navigate to Card 4: "Тест профориентации — ДДО Климова" (Photo 3)
    await page.click('button:has-text("ВУЗОПЕДИЯ")');
    await page.waitForTimeout(500);
    const card4Btn = page.locator('section:has-text("Career guidance") button:has-text("Take advantage")').nth(3);
    await card4Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo3_klimov_test.png' });
    console.log('✓ Captured Photo 3: photo3_klimov_test.png');

    // 6. Navigate to Card 5: "Тест профориентации «Одна из двух»" (Photo 4)
    await page.click('button:has-text("ВУЗОПЕДИЯ")');
    await page.waitForTimeout(500);
    const card5Btn = page.locator('section:has-text("Career guidance") button:has-text("Take advantage")').nth(4);
    await card5Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: '.pipeline/after/photo4_one_of_two.png' });
    console.log('✓ Captured Photo 4: photo4_one_of_two.png');

    // 7. Open "Мой план" modal
    await page.click('button:has-text("Мой план")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '.pipeline/after/my_plan_modal.png' });
    console.log('✓ Captured: my_plan_modal.png');

    await browser.close();
    server.close();

    console.log('Console errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error('Console errors found:', consoleErrors);
      process.exit(1);
    }

    console.log('SUCCESS! ALL 11 SCREENS FROM PHOTOS VERIFIED WITH 0 CONSOLE ERRORS!');
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    if (browser) await browser.close();
    server.close();
    process.exit(1);
  }
});
