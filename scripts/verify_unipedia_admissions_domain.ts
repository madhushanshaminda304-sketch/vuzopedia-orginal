import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Step 1: In-memory unit verification of Domain Layer and i18n
import {
  SUPPORTED_LANGUAGES,
  getDictionary,
  getSpeechLocale,
  t,
} from '../src/services/assistant/i18n';
import {
  getActiveDomain,
  setActiveDomain,
  getRegisteredDomains,
  formatDomainCurrency,
} from '../src/services/assistant/domain/activeDomain';
import { russiaAdmissionsDomain } from '../src/services/assistant/domain/russiaDomain';
import { unipediaAdmissionsDomain } from '../src/services/assistant/domain/unipediaDomain';

console.log('================================================================');
console.log('--- PHASE 1: UNIT EVALUATION OF ADMISSIONS DOMAIN & I18N ---');
console.log('================================================================\n');

let failedTests = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// Test 1: Active domain defaults to Russia Higher Education (Preserving experimental project)
const initialDomain = getActiveDomain();
assert(
  initialDomain.id === 'russia_higher_education',
  'Default active domain is Russia Higher Education (prevents regressions in existing project)'
);
assert(
  initialDomain.currency.code === 'RUB',
  'Russia Higher Education currency is Russian Ruble (RUB)'
);

// Test 2: Registered domains count
const allDomains = getRegisteredDomains();
assert(
  allDomains.length >= 2,
  `At least 2 admissions domains registered (found ${allDomains.length})`
);
assert(
  allDomains.some((d) => d.id === 'unipedia_sri_lanka'),
  'UniPedia Sri Lanka domain is registered'
);

// Test 3: Currency formatting across domains
const rubFormatted = formatDomainCurrency(250000, 'ru');
assert(
  rubFormatted.includes('₽') && rubFormatted.includes('250'),
  `Russian Ruble formatting: "${rubFormatted}"`
);

setActiveDomain('unipedia_sri_lanka');
const lkrFormatted = formatDomainCurrency(750000, 'si');
assert(
  (lkrFormatted.includes('රු.') || lkrFormatted.includes('LKR')) && lkrFormatted.includes('750'),
  `Sri Lankan Rupee formatting: "${lkrFormatted}"`
);
setActiveDomain('russia_higher_education'); // restore default

// Test 4: UniPedia Dual Pathway Modeling
const unipedia = unipediaAdmissionsDomain;
assert(Boolean(unipedia), 'UniPedia domain configuration resolved successfully');
assert(
  unipedia.pathways.length === 2,
  'UniPedia supports exactly 2 pathways (UGC State University & Private/Non-state Degrees)'
);

const ugcPathway = unipedia.pathways.find((p) => p.id === 'ugc_state_university');
assert(Boolean(ugcPathway), 'UGC State University Quota pathway exists');
const ugcFieldIds = ugcPathway?.profileFields.map((f) => f.id) || [];
assert(
  ugcFieldIds.includes('examYear') &&
    ugcFieldIds.includes('alStream') &&
    ugcFieldIds.includes('district') &&
    ugcFieldIds.includes('zScore'),
  'UGC pathway requires examYear, alStream, district, and zScore'
);

const privatePathway = unipedia.pathways.find((p) => p.id === 'private_non_state');
assert(Boolean(privatePathway), 'Private & Non-State Degree pathway exists');
const privateFieldIds = privatePathway?.profileFields.map((f) => f.id) || [];
assert(
  privateFieldIds.includes('entryQualification') &&
    privateFieldIds.includes('awardingInstitutionType'),
  'Private pathway requires entryQualification and awardingInstitutionType'
);

// Test 5: Retrospective Cutoff Benchmarking Rule (Zero false prediction)
const cutoffComparison = unipedia.compareCutoffs(1.85, 1.84, 2023);
assert(
  cutoffComparison.disclaimer.toLowerCase().includes('guarantee') ||
    cutoffComparison.disclaimer.toLowerCase().includes('retrospective') ||
    cutoffComparison.disclaimer.toLowerCase().includes('past cutoffs'),
  'UGC cutoff comparison includes explicit disclaimer that past minimum Z-scores are retrospective benchmarks, not guaranteed predictions'
);

// Test 6: I18n Multilingual Dictionary Integrity
const requiredKeys = Object.keys(getDictionary('ru')) as (keyof ReturnType<typeof getDictionary>)[];
assert(requiredKeys.length >= 40, `Dictionary schema contains ${requiredKeys.length} keys`);

for (const lang of ['en', 'si', 'ta'] as const) {
  const dict = getDictionary(lang);
  const missingKeys = requiredKeys.filter((k) => dict[k] === undefined || dict[k] === '');
  assert(
    missingKeys.length === 0,
    `All required keys present in "${lang}" dictionary (missing: ${missingKeys.length})`
  );
  assert(
    Boolean(dict.translationDisclaimer),
    `AI-assisted translation disclaimer present in "${lang}" dictionary`
  );
}

// Test 7: Speech Recognition Locale Resolution
assert(getSpeechLocale('ru') === 'ru-RU', 'Russian speech locale is ru-RU');
assert(getSpeechLocale('en') === 'en-US', 'English speech locale is en-US');
assert(getSpeechLocale('si') === 'si-LK', 'Sinhala speech locale is si-LK');
assert(getSpeechLocale('ta') === 'ta-LK', 'Tamil speech locale is ta-LK');

// Test 8: Sinhala phrasing quality check (adhering to communicative register & anti-calques)
const siDict = getDictionary('si');
assert(
  siDict.myProfile.includes('මගේ විස්තර') || siDict.myProfile.includes('පැතිකඩ'),
  `Natural Sinhala for Profile: "${siDict.myProfile}"`
);
assert(
  siDict.send === 'යවන්න' || siDict.send === 'යොමු කරන්න',
  `Natural Sinhala for Send button: "${siDict.send}"`
);
assert(
  siDict.stopGeneration.includes('නවත්'),
  `Natural Sinhala for Stop button: "${siDict.stopGeneration}"`
);

if (failedTests > 0) {
  console.error(`\n❌ Unit evaluation failed with ${failedTests} errors.`);
  process.exit(1);
}
console.log('\n✅ All unit tests in Phase 1 passed cleanly!');

// Step 2: Headless Playwright UI Verification
console.log('\n================================================================');
console.log('--- PHASE 2: PLAYWRIGHT E2E BROWSER EVALUATION ---');
console.log('================================================================\n');

const distDir = path.resolve('dist');
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url?.split('?')[0] || '/';
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

const PORT = 4185;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`E2E Verification server running at http://localhost:${PORT}`);
  fs.mkdirSync('.pipeline/after', { recursive: true });

  let browser;
  try {
    try {
      browser = await chromium.launch({ headless: true });
    } catch {
      browser = await chromium.launch({ headless: true, channel: 'chrome' });
    }

    const consoleErrors: string[] = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    console.log('1. Loading application homepage...');
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');

    console.log('2. Opening assistant modal...');
    const headerBtn = page.locator('button[title*="Дед Вузопед"], button:has-text("Дед Вузопед")').first();
    await headerBtn.click();
    await page.waitForTimeout(500);

    const modalDialog = page.locator('[role="dialog"]').first();
    await modalDialog.waitFor({ timeout: 5000 });
    console.log('✅ Assistant modal opened with accessible role="dialog".');

    // 3. Test Language Selector: Switch to English
    console.log('3. Testing Language Selector: Switching to English (EN)...');
    const langSelectBtn = page.locator('[data-testid="language-select-btn"]');
    await langSelectBtn.waitFor({ timeout: 5000 });
    await langSelectBtn.click();
    await page.waitForTimeout(200);

    const enOption = page.locator('[data-testid="lang-option-en"]');
    await enOption.waitFor({ timeout: 3000 });
    await enOption.click();
    await page.waitForTimeout(300);

    const enPlaceholder = await page.locator('input[data-testid="ded-assistant-input"]').getAttribute('placeholder');
    console.log(`   English placeholder: "${enPlaceholder}"`);
    assert(
      Boolean(enPlaceholder && (enPlaceholder.includes('Ask') || enPlaceholder.includes('university') || enPlaceholder.includes('admission'))),
      'Placeholder updated to English'
    );

    // 4. Test Language Selector: Switch to Sinhala
    console.log('4. Testing Language Selector: Switching to Sinhala (SI)...');
    await langSelectBtn.click();
    await page.waitForTimeout(200);

    const siOption = page.locator('[data-testid="lang-option-si"]');
    await siOption.waitFor({ timeout: 3000 });
    await siOption.click();
    await page.waitForTimeout(300);

    const siPlaceholder = await page.locator('input[data-testid="ded-assistant-input"]').getAttribute('placeholder');
    console.log(`   Sinhala placeholder: "${siPlaceholder}"`);
    assert(
      Boolean(siPlaceholder && (siPlaceholder.includes('කඩයිම්') || siPlaceholder.includes('විමසන්න') || siPlaceholder.includes('පාඨමාලා'))),
      'Placeholder updated to Sinhala'
    );

    // 5. Open Student Profile Modal
    console.log('5. Opening Student Profile Modal in Sinhala mode...');
    const profileBtn = page.locator('[data-testid="open-student-profile-btn"]');
    await profileBtn.click();
    await page.waitForTimeout(400);

    const profileModal = page.locator('[data-testid="student-profile-modal"]');
    await profileModal.waitFor({ timeout: 5000 });
    console.log('✅ Student profile modal opened.');

    // 6. Test Admissions Domain Switcher: Switch to UniPedia Sri Lanka
    console.log('6. Switching Admissions Domain to "Sri Lanka (UniPedia)"...');
    const unipediaDomainBtn = page.locator('[data-testid="domain-unipedia-btn"]');
    await unipediaDomainBtn.click();
    await page.waitForTimeout(300);

    // Verify UGC State University pathway is displayed
    const ugcTab = page.locator('[data-testid="unipedia-pathway-ugc"]');
    await ugcTab.waitFor({ timeout: 3000 });
    console.log('✅ UGC State University Quota pathway selector is active.');

    // Enter G.C.E. A/L exam details
    console.log('7. Filling UGC applicant details: Physical Science, Colombo, Z-Score 1.8421...');
    const streamSelect = page.locator('[data-testid="unipedia-stream-select"]');
    await streamSelect.selectOption('physical_science');

    const districtSelect = page.locator('[data-testid="unipedia-district-select"]');
    await districtSelect.selectOption('colombo');

    const zScoreInput = page.locator('[data-testid="unipedia-zscore-input"]');
    await zScoreInput.fill('1.8421');

    const cgtInput = page.locator('[data-testid="unipedia-cgt-input"]');
    await cgtInput.fill('45');

    // 8. Test Private Pathway Tab
    console.log('8. Switching to "Private & Non-State Degrees" pathway tab...');
    const privateTab = page.locator('[data-testid="unipedia-pathway-private"]');
    await privateTab.click();
    await page.waitForTimeout(300);

    const budgetInput = page.locator('[data-testid="unipedia-budget-input"]');
    await budgetInput.waitFor({ timeout: 3000 });
    await budgetInput.fill('850000');
    console.log('✅ Private pathway entry qualification & annual budget in LKR rendered.');

    // Switch back to UGC to save
    await ugcTab.click();
    await page.waitForTimeout(200);

    // Verify Translation Disclaimer banner is visible
    const disclaimerBanner = page.locator('text=භාෂා පරිවර්තනය AI තාක්ෂණය').first();
    const isDisclaimerVisible = await disclaimerBanner.isVisible();
    assert(isDisclaimerVisible, 'AI-assisted translation disclaimer is visibly displayed');

    // Save Profile
    console.log('9. Saving Profile...');
    const saveBtn = page.locator('[data-testid="save-profile-btn"]');
    await saveBtn.click();
    await page.locator('[data-testid="student-profile-modal"]').waitFor({ state: 'detached', timeout: 5000 });
    console.log('✅ Student profile modal saved and closed cleanly.');

    // 10. Test Speech Input fallback notice (Honest behavior, no fake questions)
    console.log('10. Testing Dictation Button: checking honest speech notice fallback...');
    const micBtn = page.locator('[data-testid="dictation-btn"]').first();
    await micBtn.click();
    await page.waitForTimeout(300);

    // Verify speech notice banner appears
    const speechNotice = page.locator('[data-testid="speech-notice-banner"]');
    if (await speechNotice.isVisible()) {
      const noticeText = await speechNotice.innerText();
      console.log(`✅ Honest speech notice rendered: "${noticeText}"`);
      const dismissBtn = page.locator('[data-testid="dismiss-speech-notice"]');
      await dismissBtn.click();
    } else {
      console.log('Microphone prompt state handled cleanly.');
    }

    // Verify input value remained unchanged (no fake question inserted)
    const currentInputVal = await page.locator('input[data-testid="ded-assistant-input"]').inputValue();
    assert(
      !currentInputVal.includes('Какие проходные баллы на IT'),
      'No fake query was inserted into input on speech failure'
    );

    // 11. Switch back to English to capture clean screenshot
    await langSelectBtn.click();
    await page.waitForTimeout(200);
    const enOptionFinal = page.locator('[data-testid="lang-option-en"]');
    await enOptionFinal.click();
    await page.waitForTimeout(300);

    // Capture screenshot
    console.log('11. Capturing verification screenshot...');
    const screenshotPath = path.join('.pipeline/after', 'feature_unipedia_domain_and_i18n.png');
    await page.screenshot({ path: screenshotPath });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(screenshotPath, path.join(artifactDir, 'feature_unipedia_domain_and_i18n.png'));
    }
    console.log(`✅ Screenshot saved to ${screenshotPath}`);

    console.log('\n================================================================');
    console.log(`VERIFICATION SUMMARY: ${failedTests} failures | ${consoleErrors.length} console errors`);
    console.log('================================================================\n');

    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    if (failedTests > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Playwright verification encountered an error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
