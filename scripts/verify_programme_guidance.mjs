import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let requests = 0;
  await page.route('**/api/assistant/**', route => { requests++; return route.abort(); });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.getByTitle('Спросить Деда Вузопеда').click();
  await page.getByRole('button', { name: 'I want to find the right program for me', exact: true }).click();
  const last = () => page.getByTestId('assistant-message').last();
  await last().getByText('Let’s narrow it down together.', { exact: false }).waitFor();
  assert.equal(await last().locator('article').count(), 0);
  for (const answer of ['I know subjects I enjoy', 'Computing & problem-solving', 'School completed', 'Moscow', '400000 RUB']) {
    await last().getByRole('button', { name: answer, exact: true }).click();
  }
  await last().getByText('Here are starting points', { exact: false }).waitFor();
  const count = await last().locator('article').count();
  assert.ok(count > 0 && count <= 3);
  await last().getByRole('button', { name: 'Change budget', exact: true }).click();
  await last().getByRole('button', { name: 'Funded places only', exact: true }).click();
  await last().getByText('Here are starting points', { exact: false }).waitFor();
  await last().getByText('What you’ve shared', { exact: true }).click();
  assert.ok(await last().getByText('Funded places', { exact: true }).isVisible());
  assert.equal(requests, 0);
  assert.deepEqual(errors, []);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.screenshot({ path: '/tmp/programme-guidance-mobile.png', fullPage: true });
  console.log('PASS: mobile guided journey, cards, budget refinement, no AI requests, no runtime errors or page overflow');
} finally {
  await browser.close();
}
