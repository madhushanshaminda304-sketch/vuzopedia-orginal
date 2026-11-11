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

const PORT = 4183;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`Trustworthy Evidence Verification server running on http://localhost:${PORT}`);
  fs.mkdirSync('.pipeline/after', { recursive: true });

  let browser;
  let testCount = 0;
  let passCount = 0;

  function assertTest(name, condition, details = '') {
    testCount++;
    if (condition) {
      console.log(`[PASS] Test ${testCount}: ${name}`);
      passCount++;
    } else {
      console.error(`[FAIL] Test ${testCount}: ${name}`);
      if (details) console.error(`       Details: ${details}`);
      process.exitCode = 1;
    }
  }

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

    console.log('1. Navigating to application...');
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');

    // TEST 1: Provenance Data Model & Honest Fields (no invented URLs/dates for unverified)
    const test1 = await page.evaluate(() => {
      const {
        createUniversityAdmissionChunk,
        createUnverifiedRecordChunk,
        UNIVERSITIES,
      } = window.__ASSISTANT__;

      const bmstu = UNIVERSITIES.find((u) => u.id === 'bmstu');
      const verifiedChunk = createUniversityAdmissionChunk(bmstu);
      const unverifiedChunk = createUnverifiedRecordChunk(
        'src-test-unverified',
        'Непроверенный отзыв',
        'Некоторые студенты утверждают, что ремонт в общаге сделан в 2024 году'
      );

      return {
        // Verified chunk checks
        hasId: typeof verifiedChunk.id === 'string' && verifiedChunk.id.length > 0,
        hasPublisher: typeof verifiedChunk.publisher === 'string' && verifiedChunk.publisher.includes('Баумана'),
        hasDocTitle: typeof verifiedChunk.documentTitle === 'string' && verifiedChunk.documentTitle.length > 0,
        hasYear: verifiedChunk.applicableAdmissionsYear === 2025,
        hasCheckedDate: typeof verifiedChunk.checkedDate === 'string',
        hasRealUrl: verifiedChunk.url === 'https://bmstu.ru',
        isVerified: verifiedChunk.verificationStatus === 'verified',
        isHistorical: verifiedChunk.isHistoricalCutoff === true,

        // Unverified chunk checks (no invented URLs or dates!)
        unverifiedHasNoUrl: unverifiedChunk.url === undefined,
        unverifiedHasNoDate: unverifiedChunk.checkedDate === undefined,
        unverifiedStatus: unverifiedChunk.verificationStatus === 'unverified',
      };
    });
    assertTest(
      'Provenance model: includes Source ID, Publisher, DocTitle, Year, CheckedDate, Status, and real URLs without inventing data',
      test1.hasId &&
        test1.hasPublisher &&
        test1.hasDocTitle &&
        test1.hasYear &&
        test1.hasCheckedDate &&
        test1.hasRealUrl &&
        test1.isVerified &&
        test1.isHistorical &&
        test1.unverifiedHasNoUrl &&
        test1.unverifiedHasNoDate &&
        test1.unverifiedStatus,
      JSON.stringify(test1)
    );

    // TEST 2: Selective Retrieval (Retrieve only evidence needed for the question)
    const test2 = await page.evaluate(() => {
      const { retrieveAssistantContext } = window.__ASSISTANT__;
      // User asks specifically about BMSTU dormitory
      const ctx = retrieveAssistantContext('Сколько стоит общежитие в МГТУ им. Баумана?', 'all', 'all', []);

      const chunkIds = ctx.citationChunks.map((c) => c.id);
      const chunkCategories = ctx.citationChunks.map((c) => c.category);

      // Should contain BMSTU admission & dorm chunks, but NOT other 11 universities, NOT credit, NOT olympiads
      const hasBmstuDorm = chunkIds.some((id) => id.includes('bmstu') && id.includes('dorm'));
      const hasOtherUniversities = chunkIds.some(
        (id) => id.includes('mgu') || id.includes('hse') || id.includes('spbu')
      );
      const hasCredit = chunkIds.some((id) => id.includes('credit'));
      const hasOlympiads = chunkIds.some((id) => id.includes('olympiad'));

      return {
        chunkCount: ctx.citationChunks.length,
        hasBmstuDorm,
        hasOtherUniversities,
        hasCredit,
        hasOlympiads,
        chunkIds,
      };
    });
    assertTest(
      'Selective retrieval: sends only relevant evidence needed for the question (BMSTU dorm), avoiding catalog dumps',
      test2.hasBmstuDorm && !test2.hasOtherUniversities && !test2.hasCredit && !test2.hasOlympiads && test2.chunkCount <= 4,
      `Chunks: ${JSON.stringify(test2.chunkIds)}`
    );

    // TEST 3: Link factual claims to evidence IDs ([cite:sourceId])
    const test3 = await page.evaluate(() => {
      const { retrieveAssistantContext, queryLocalEngine } = window.__ASSISTANT__;
      const ctx = retrieveAssistantContext('Расскажи про МГТУ им. Баумана', 'all', 'all', []);
      const resp = queryLocalEngine('Расскажи про МГТУ им. Баумана', performance.now(), ctx);

      const hasCitationsInText = /\[cite:[a-zA-Z0-9_-]+\]/.test(resp.text);
      const citations = Array.from(resp.text.matchAll(/\[cite:([a-zA-Z0-9_-]+)\]/g)).map((m) => m[1]);

      return {
        hasCitationsInText,
        citations,
        evidenceIdsCount: resp.evidenceIds.length,
      };
    });
    assertTest(
      'Factual claim linkage: claims in response text are explicitly linked via [cite:<id>] tokens',
      test3.hasCitationsInText && test3.citations.length > 0 && test3.evidenceIdsCount > 0,
      `Citations in text: ${JSON.stringify(test3.citations)}`
    );

    // TEST 4: Validate that returned evidence IDs exist in supplied evidence (Hallucination rejection)
    const test4 = await page.evaluate(() => {
      const { validateAssistantResponse, createUniversityAdmissionChunk, UNIVERSITIES } = window.__ASSISTANT__;
      const realChunk = createUniversityAdmissionChunk(UNIVERSITIES[0]);

      // Simulate a raw model response that hallucinated a fake evidence ID
      const untrustedModelOutput = {
        text: 'МГУ имеет проходной балл 282 [cite:' + realChunk.id + '] и секретный факультет космонавтики [cite:src-fake-hallucination-999].',
        mode: 'gemini',
        evidenceIds: [realChunk.id, 'src-fake-hallucination-999'],
        citationChunks: [realChunk],
      };

      const validated = validateAssistantResponse(untrustedModelOutput);

      return {
        originalEvidenceIds: untrustedModelOutput.evidenceIds,
        validatedEvidenceIds: validated.evidenceIds,
        cleanedText: validated.text,
        retainedRealCitation: validated.text.includes(`[cite:${realChunk.id}]`),
        strippedFakeCitation: !validated.text.includes('src-fake-hallucination-999'),
        retainedOnlyRealId: validated.evidenceIds.includes(realChunk.id) && !validated.evidenceIds.includes('src-fake-hallucination-999'),
      };
    });
    assertTest(
      'Evidence ID validation: rejects hallucinated IDs, strips invalid [cite:fake] tokens, and keeps only valid IDs',
      test4.retainedRealCitation && test4.strippedFakeCitation && test4.retainedOnlyRealId,
      `Validated IDs: ${JSON.stringify(test4.validatedEvidenceIds)}, Text: ${test4.cleanedText}`
    );

    // TEST 5: Clearly distinguish historical cutoffs from current requirements
    const test5 = await page.evaluate(() => {
      const { retrieveAssistantContext, queryLocalEngine } = window.__ASSISTANT__;
      const ctx = retrieveAssistantContext('Какие проходные баллы в МФТИ?', 'all', 'all', []);
      const resp = queryLocalEngine('Какие проходные баллы в МФТИ?', performance.now(), ctx);

      const chunk = ctx.citationChunks.find((c) => c.vuzId === 'mipt' && c.category === 'university');
      const mentionsHistorical =
        resp.text.includes('2025') || resp.text.includes('прошлых лет') || resp.text.includes('ориентир');

      return {
        chunkIsHistorical: chunk?.isHistoricalCutoff === true,
        chunkYear: chunk?.applicableAdmissionsYear,
        mentionsHistorical,
      };
    });
    assertTest(
      'Historical cutoffs distinction: cutoffs explicitly tagged as past statistics (2025) and not 2026 guarantees',
      test5.chunkIsHistorical && test5.chunkYear === 2025 && test5.mentionsHistorical,
      `isHistorical: ${test5.chunkIsHistorical}, year: ${test5.chunkYear}, mentionsHistorical: ${test5.mentionsHistorical}`
    );

    // TEST 6: Missing / Insufficient evidence handling (no unsupported guesswork)
    const test6 = await page.evaluate(() => {
      const { retrieveAssistantContext, queryLocalEngine } = window.__ASSISTANT__;
      // Asking about Harvard or a university completely out of dataset
      const ctx = retrieveAssistantContext('Какие проходные баллы в Гарвардский университет?', 'all', 'all', []);
      const resp = queryLocalEngine('Какие проходные баллы в Гарвардский университет?', performance.now(), ctx);

      return {
        missingNoticePresent: typeof resp.missingInfoNotice === 'string' && resp.missingInfoNotice.length > 0,
        textExplainsMissing: resp.text.includes('не обнаружено') || resp.text.includes('нет точных данных'),
        textExplainsWhatNeedsChecking: resp.text.includes('Что требует') || resp.text.includes('Что можно сделать'),
      };
    });
    assertTest(
      'Missing evidence: identifies unavailable info honestly instead of fabricating unsupported answers',
      test6.missingNoticePresent && test6.textExplainsMissing && test6.textExplainsWhatNeedsChecking,
      `Missing notice: ${test6.missingNoticePresent}`
    );

    // TEST 7: Treat retrieved text as data, not instructions (<evidence_data> isolation)
    const test7 = await page.evaluate(() => {
      const { buildEvidencePackage, UNIVERSITIES } = window.__ASSISTANT__;
      const vuz = UNIVERSITIES[0];
      const { evidenceText } = buildEvidencePackage([vuz], {});

      return {
        hasDataWrapper: evidenceText.startsWith('<evidence_data>') && evidenceText.trim().endsWith('</evidence_data>'),
        hasDataRecordTags: evidenceText.includes('[DATA_RECORD') && evidenceText.includes('[/DATA_RECORD]'),
      };
    });
    assertTest(
      'Prompt isolation: retrieved text packaged strictly inside <evidence_data> with structured data boundaries',
      test7.hasDataWrapper && test7.hasDataRecordTags,
      `evidenceText sample: ${test7.hasDataWrapper}`
    );

    // TEST 8: No automatic trust score claims (honest limitation disclosure)
    const test8 = await page.evaluate(() => {
      const { validateAssistantResponse } = window.__ASSISTANT__;
      const resp = validateAssistantResponse({
        text: 'Тестовый ответ',
        citationChunks: [],
      });

      return {
        hasValidationNotice: typeof resp.citationValidationNotice === 'string',
        doesNotClaim100PercentProof:
          !resp.citationValidationNotice?.includes('100%') &&
          !resp.citationValidationNotice?.includes('гарантирует'),
      };
    });
    assertTest(
      'Honest attribution limits: citation validation not described as mathematical proof of future admission',
      test8.hasValidationNotice && test8.doesNotClaim100PercentProof,
      `Notice: ${test8.hasValidationNotice}`
    );

    console.log('\n--- UI CITATION DETAILS & REAL SOURCE URL VERIFICATION ---');

    // TEST 9 & 10: Open Assistant modal, submit query with specific citation, open CitationsDrawer
    console.log('2. Opening assistant modal...');
    const headerBtn = page.locator('button[title*="Дед Вузопед"], button:has-text("Дед Вузопед")').first();
    await headerBtn.click();
    await page.waitForTimeout(500);

    const input = page.locator('input[data-testid="ded-assistant-input"], input[placeholder*="Спросите"]');
    await input.fill('Расскажи про общежитие и военную кафедру в МГТУ им. Баумана');
    await page.keyboard.press('Enter');

    console.log('3. Waiting for answer to render...');
    await page.locator('text=МГТУ им. Баумана').first().waitFor({ timeout: 5000 });
    try {
      await page.locator('.animate-bounce').first().waitFor({ state: 'detached', timeout: 15000 });
    } catch {
      // Continue
    }
    await page.waitForTimeout(1000);

    // Check that inline cite badge or citation button is visible
    const citeBadge = page.locator('button:has-text("📖"), button[title*="Открыть источник данных"]').first();
    const isCiteBadgeVisible = await citeBadge.isVisible();
    assertTest('UI renders interactive inline citation badge for claimed facts', isCiteBadgeVisible);

    // Click citation button to open CitationsDrawer
    console.log('4. Clicking citation button to inspect provenance details...');
    if (isCiteBadgeVisible) {
      await citeBadge.click();
    } else {
      const footerCiteBtn = page.locator('button:has-text("Использованные материалы")').first();
      await footerCiteBtn.click();
    }
    await page.waitForTimeout(500);

    // Verify CitationsDrawer header and provenance fields
    const drawerTitle = page.locator('text=Источники данных и верификация').first();
    const isDrawerVisible = await drawerTitle.isVisible();
    assertTest('CitationsDrawer opens displaying "Источники данных и верификация"', isDrawerVisible);

    const verifiedBadge = page.locator('text=Верифицировано').first();
    const isVerifiedBadgeVisible = await verifiedBadge.isVisible();
    assertTest('CitationsDrawer displays verification status badge', isVerifiedBadgeVisible);

    // Verify real source URL link is present (Requirement 5: open real source URL)
    const realSourceLink = page.locator('a[href*="bmstu.ru"]').first();
    const isRealUrlPresent = await realSourceLink.isVisible();
    const realUrlHref = isRealUrlPresent ? await realSourceLink.getAttribute('href') : null;
    assertTest(
      'CitationsDrawer displays real source URL link to official website (https://bmstu.ru)',
      isRealUrlPresent && realUrlHref === 'https://bmstu.ru',
      `URL: ${realUrlHref}`
    );

    // Capture screenshot
    const screenshotPath = path.join(artifactDir, 'feature_assistant_trustworthy_evidence.png');
    await page.screenshot({ path: screenshotPath });
    const localScreenshotPath = path.join('.pipeline/after', 'feature_assistant_trustworthy_evidence.png');
    fs.copyFileSync(screenshotPath, localScreenshotPath);
    console.log(`Saved screenshot to ${screenshotPath}`);

    // Close drawer
    const closeBtn = page.locator('[data-testid="close-citations-modal"]').first();
    await closeBtn.click();
    await page.waitForTimeout(300);

    // Console errors check (ignoring external image resource 404s)
    const jsErrors = consoleErrors.filter((e) => !e.includes('Failed to load resource'));
    assertTest('No JavaScript or React runtime console errors occurred', jsErrors.length === 0, jsErrors.join(' | '));

    console.log(`\n========================================`);
    console.log(`EVIDENCE SYSTEM VERIFICATION: ${passCount} / ${testCount} PASSED`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Fatal error during verification:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
