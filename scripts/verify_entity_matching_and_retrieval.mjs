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

const PORT = 4182;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`Verification server running on http://localhost:${PORT}`);
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

    // Verify AssistantServices is exposed
    const hasAssistant = await page.evaluate(() => typeof window.__ASSISTANT__ !== 'undefined');
    assertTest('Assistant module successfully exposed on window for testing', hasAssistant);

    console.log('\n--- EXECUTING DEEP UNIT & INTEGRATION REGRESSION TESTS ---');

    // TEST 1: Bauman alias defect fix
    const test1 = await page.evaluate(() => {
      const { findMentionedUniversities, UNIVERSITY_EXPLICIT_ALIASES, UNIVERSITIES } = window.__ASSISTANT__;
      
      // Ensure only BMSTU contains "бауман" in its aliases
      const baumanAliasesInOtherVuz = UNIVERSITY_EXPLICIT_ALIASES.filter(u => {
        if (u.id === 'bmstu') return false;
        const allAliases = [...u.acronyms, ...u.canonicalNames, ...u.stemPatterns];
        return allAliases.some(a => a.includes('бауман'));
      });

      // Query with "бауман"
      const matched = findMentionedUniversities('Какие проходные баллы в Бауманке?');

      return {
        hasLeakInAliases: baumanAliasesInOtherVuz.length > 0,
        matchedLength: matched.length,
        matchedId: matched[0]?.id,
      };
    });
    assertTest(
      'Bauman alias bug: "бауман" aliases strictly isolated to BMSTU and not leaked to other universities',
      !test1.hasLeakInAliases && test1.matchedLength === 1 && test1.matchedId === 'bmstu',
      `Matched length: ${test1.matchedLength}, Matched ID: ${test1.matchedId}, Has leak: ${test1.hasLeakInAliases}`
    );

    // TEST 2: Ambiguous names resolution and clarification
    const test2 = await page.evaluate(() => {
      const { findMentionedUniversitiesDetailed, queryLocalEngine, retrieveAssistantContext } = window.__ASSISTANT__;
      const detailed = findMentionedUniversitiesDetailed('Расскажи про политех');
      const ctx = retrieveAssistantContext('Расскажи про политех', 'all', 'all', []);
      const localResp = queryLocalEngine('Расскажи про политех', performance.now(), ctx);

      return {
        isAmbiguous: detailed.isAmbiguous,
        term: detailed.ambiguousEntity?.term,
        candidates: detailed.ambiguousEntity?.candidates?.map(c => c.id),
        hasClarification: (localResp.clarificationQuestions && localResp.clarificationQuestions.length > 0) || false,
        clarificationOptions: localResp.clarificationQuestions?.[0]?.options || [],
      };
    });
    assertTest(
      'Ambiguous names: "политех" triggers ambiguity clarification between BMSTU and TPU',
      test2.isAmbiguous && test2.candidates.includes('bmstu') && test2.candidates.includes('tpu') && test2.hasClarification,
      `Candidates: ${JSON.stringify(test2.candidates)}, Options: ${JSON.stringify(test2.clarificationOptions)}`
    );

    // TEST 3: Substring false-positive prevention ("кредит", "посетить" != IT)
    const test3 = await page.evaluate(() => {
      const { interpretStudentQuery } = window.__ASSISTANT__;
      const creditInterp = interpretStudentQuery('Как взять образовательный кредит на обучение?');
      const visitInterp = interpretStudentQuery('Хочу посетить университет в день открытых дверей');
      const historyInterp = interpretStudentQuery('Изучение всеобщей истории в университете');

      return {
        creditIT: creditInterp.wantsIT,
        creditFinance: creditInterp.wantsFinance,
        visitIT: visitInterp.wantsIT,
        historyIT: historyInterp.wantsIT,
      };
    });
    assertTest(
      'Substring false-positives: "кредит", "посетить", "история" do NOT trigger wantsIT',
      !test3.creditIT && test3.creditFinance && !test3.visitIT && !test3.historyIT,
      `Credit wantsIT: ${test3.creditIT}, wantsFinance: ${test3.creditFinance}, Visit wantsIT: ${test3.visitIT}`
    );

    // TEST 4: Hard vs Soft requirements separation
    const test4 = await page.evaluate(() => {
      const { interpretStudentQuery } = window.__ASSISTANT__;
      const interp = interpretStudentQuery('Строго в Москве, обязательно с общежитием, желательно олимпиады');

      return {
        isCityHard: interp.isCityHard,
        city: interp.targetCity,
        isDormHard: interp.isDormHard,
        wantsDorm: interp.wantsDorm,
        wantsOlympiads: interp.wantsOlympiads,
        hardRequirements: interp.hardRequirements,
        softPreferences: interp.softPreferences,
        raw: interp,
      };
    });
    console.log('DEBUG TEST 4:', JSON.stringify(test4, null, 2));
    assertTest(
      'Hard requirements separated from soft preferences: "строго", "обязательно", "желательно"',
      Boolean(test4.isCityHard && test4.city === 'Москва' && test4.isDormHard && test4.wantsDorm && test4.wantsOlympiads &&
      test4.hardRequirements.length >= 2 && test4.softPreferences.length >= 1),
      `Hard: ${JSON.stringify(test4.hardRequirements)}, Soft: ${JSON.stringify(test4.softPreferences)}, isCityHard: ${test4.isCityHard}, city: ${test4.city}, isDormHard: ${test4.isDormHard}, wantsDorm: ${test4.wantsDorm}`
    );

    // TEST 5: Negation handling ("без общежития", "не в Москве", "без ВУЦ")
    const test5 = await page.evaluate(() => {
      const { interpretStudentQuery } = window.__ASSISTANT__;
      const noDorm = interpretStudentQuery('Технические вузы в Москве без общежития');
      const notMoscow = interpretStudentQuery('Вузы с военной кафедрой не в Москве');
      const noMilitary = interpretStudentQuery('Вузы без военной кафедры и без ВУЦ');

      return {
        noDormWantsDorm: noDorm.wantsDorm,
        noDormIsHard: noDorm.isDormHard,
        notMoscowExcludedCities: notMoscow.excludedCities,
        notMoscowCity: notMoscow.targetCity,
        noMilitaryWantsMilitary: noMilitary.wantsMilitary,
        noMilitaryIsHard: noMilitary.isMilitaryHard,
      };
    });
    assertTest(
      'Negation handling: "без общежития" -> wantsDorm=false; "не в Москве" -> excludedCities=["Москва"]',
      test5.noDormWantsDorm === false && test5.noDormIsHard === true &&
      test5.notMoscowExcludedCities.includes('Москва') && test5.notMoscowCity === null &&
      test5.noMilitaryWantsMilitary === false && test5.noMilitaryIsHard === true,
      `noDorm: ${test5.noDormWantsDorm}, excluded: ${JSON.stringify(test5.notMoscowExcludedCities)}, military: ${test5.noMilitaryWantsMilitary}`
    );

    // TEST 6: Zero matches detection with conflicting requirements and clearly labelled alternatives (no silent discard)
    const test6 = await page.evaluate(() => {
      const { retrieveAssistantContext, queryLocalEngine } = window.__ASSISTANT__;
      // SPb with VUC and 210 points for budget
      const ctx = retrieveAssistantContext('Строго в Санкт-Петербурге, обязательно с ВУЦ, сумма баллов 210 на бюджет', 'all', 'all', []);
      const localResp = queryLocalEngine('Строго в Санкт-Петербурге, обязательно с ВУЦ, сумма баллов 210 на бюджет', performance.now(), ctx);

      return {
        hasZeroMatches: ctx.hasZeroMatches,
        conflictingRequirements: ctx.conflictingRequirements,
        alternativesCount: ctx.alternatives.length,
        alternativesInResponse: localResp.alternatives?.length || 0,
        answerContainsWarning: (localResp.text && (localResp.text.includes('не найдено') || localResp.text.includes('не проходят'))),
        sampleAlternativeTitle: ctx.alternatives[0]?.title,
      };
    });
    assertTest(
      'Zero-match handling: filters are NOT discarded silently; conflicts explained and alternatives provided',
      test6.hasZeroMatches && test6.conflictingRequirements.length > 0 && test6.alternativesCount > 0 && test6.alternativesInResponse > 0,
      `ZeroMatches: ${test6.hasZeroMatches}, Conflicts: ${JSON.stringify(test6.conflictingRequirements)}, Alternatives: ${test6.alternativesCount}`
    );

    // TEST 7: Programme-level ranking
    const test7 = await page.evaluate(() => {
      const { retrieveAssistantContext } = window.__ASSISTANT__;
      const ctx = retrieveAssistantContext('Программная инженерия 09.03.04 с баллами 280', 'all', 'all', []);

      return {
        matchedProgramsCount: (ctx.matchedPrograms || []).length,
        firstProgram: ctx.matchedPrograms?.[0],
        allPrograms: ctx.matchedPrograms,
      };
    });
    console.log('DEBUG TEST 7 all programs:', JSON.stringify(test7.allPrograms, null, 2));
    assertTest(
      'Programme-level ranking: identifies specific academic programmes (09.03.04) and ranks with programme-level data',
      test7.matchedProgramsCount > 0 && typeof test7.firstProgram?.minBudgetScore === 'number',
      `Matched programs: ${test7.matchedProgramsCount}, First: ${JSON.stringify(test7.firstProgram)}`
    );

    // TEST 8: Follow-up references and anaphora resolution in multi-turn conversation
    const test8 = await page.evaluate(() => {
      const { resolveActiveEntityFromHistory, retrieveAssistantContext, interpretStudentQuery } = window.__ASSISTANT__;
      const history = [
        { sender: 'user', text: 'Расскажи про МГТУ им. Баумана' },
        { sender: 'ded', text: 'МГТУ им. Н.Э. Баумана — ведущий технический университет...' },
      ];
      
      const prompt = 'А что с общежитием в нём?';
      const activeEntity = resolveActiveEntityFromHistory(prompt, history);
      const interp = interpretStudentQuery(prompt, 'all', 'all', history);
      const ctx = retrieveAssistantContext(prompt, 'all', 'all', history);

      return {
        activeId: activeEntity?.id,
        anaphoricEntityId: interp.filters?.anaphoricEntityId,
        ctxReferencedIds: ctx.referencedEntityIds,
        universitiesFound: (ctx.matchedUniversities || []).map(u => u.id),
      };
    });
    assertTest(
      'Multi-turn anaphora resolution: "А что с общежитием в нём?" resolves contextually to BMSTU',
      test8.activeId === 'bmstu' && test8.anaphoricEntityId === 'bmstu' && test8.universitiesFound.includes('bmstu'),
      `ActiveId: ${test8.activeId}, Interp anaphora: ${test8.anaphoricEntityId}, Universities found: ${JSON.stringify(test8.universitiesFound)}`
    );

    console.log('\n--- UI WORKFLOW & SCREENSHOT VERIFICATION ---');

    // TEST 9: Open modal, ask zero-match conflicting query, check alternatives rendered in UI
    console.log('2. Opening assistant modal...');
    const headerBtn = page.locator('button[title*="Дед Вузопед"], button:has-text("Дед Вузопед")').first();
    await headerBtn.click();
    await page.waitForTimeout(500);

    const input = page.locator('input[data-testid="ded-assistant-input"], input[placeholder*="Спросите"]');
    await input.fill('Строго в Санкт-Петербурге, обязательно с ВУЦ, сумма баллов 210 на бюджет');
    await page.keyboard.press('Enter');

    console.log('3. Waiting for response to render...');
    await page.locator('text=Строго в Санкт-Петербурге').waitFor({ timeout: 5000 });
    try {
      await page.locator('.animate-bounce').first().waitFor({ state: 'detached', timeout: 15000 });
    } catch {
      // Continue
    }
    await page.waitForTimeout(2000);

    const assistantMessages = await page.evaluate(() => {
      const msgs = document.querySelectorAll('[class*="DedVuzopedAssistantModal"], [class*="fixed inset-0"]');
      const container = document.querySelector('.flex-1.overflow-y-auto') || document.body;
      return container.innerText;
    });
    console.log('=== ASSISTANT MODAL INNER TEXT ===\n', assistantMessages);

    // Verify conflicting warning and alternative options in UI
    const warningText = page.locator('text=не найдено прямых совпадений').first();
    const isWarningVisible = await warningText.isVisible();
    assertTest('UI renders zero-match conflicting criteria warning', isWarningVisible);

    const altCard = page.locator('text=ДОСТУПНЫЕ АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ').first();
    const isAltVisible = await altCard.isVisible();
    assertTest('UI renders clearly labelled alternative options section', isAltVisible);

    // Capture screenshot
    const screenshotPath = path.join(artifactDir, 'feature_assistant_entity_matching_alternatives.png');
    await page.screenshot({ path: screenshotPath });
    const localScreenshotPath = path.join('.pipeline/after', 'feature_assistant_entity_matching_alternatives.png');
    fs.copyFileSync(screenshotPath, localScreenshotPath);
    console.log(`Saved screenshot to ${screenshotPath}`);

    // TEST 10: Test ambiguous entity in UI
    console.log('4. Submitting ambiguous query in UI...');
    await input.fill('Расскажи про политех');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    // Check clarification buttons
    const disambiguationBtn = page.locator('button:has-text("МГТУ им. Н.Э. Баумана"), button:has-text("Томский политехнический")').first();
    const isDisambiguationVisible = await disambiguationBtn.isVisible();
    assertTest('UI renders clarification buttons for ambiguous entity ("политех")', isDisambiguationVisible);

    // Console errors check (ignoring external image resource 404s)
    const jsErrors = consoleErrors.filter(e => !e.includes('Failed to load resource'));
    assertTest('No JavaScript/React console errors occurred during interactions', jsErrors.length === 0, jsErrors.join(' | '));

    console.log(`\n========================================`);
    console.log(`REGRESSION RESULTS: ${passCount} / ${testCount} PASSED`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Fatal error during verification:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
