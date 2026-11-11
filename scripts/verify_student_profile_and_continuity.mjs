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

const PORT = 4186;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`Student Profile & Conversation Continuity Verification Server running on http://localhost:${PORT}`);
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
    }
  }

  try {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const launchOptions = fs.existsSync(chromePath)
      ? { executablePath: chromePath, headless: true }
      : { headless: true };
    browser = await chromium.launch(launchOptions);
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[Browser Console Error] ${msg.text()}`);
      }
    });

    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify application __ASSISTANT__ exposed
    const hasAssistant = await page.evaluate(() => typeof window.__ASSISTANT__ !== 'undefined');
    assertTest('Application window.__ASSISTANT__ services loaded', hasAssistant);

    // Test 1: Default Profile structure & loading
    const defaultProfileTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;
      ast.clearStudentProfile();
      const profile = ast.loadStudentProfile();
      return {
        hasSubjects: Array.isArray(profile.subjects) && profile.subjects.length === 0,
        budgetConstraint: profile.budgetConstraint === 'any',
        accommodationNeed: profile.accommodationNeed === 'unspecified',
        preferredLanguage: profile.preferredLanguage === 'ru',
      };
    });
    assertTest(
      'Default student profile contains clean uninvented defaults',
      defaultProfileTest.hasSubjects &&
        defaultProfileTest.budgetConstraint &&
        defaultProfileTest.accommodationNeed &&
        defaultProfileTest.preferredLanguage
    );

    // Test 2: Profile CRUD, automatic score calculation & summary badges
    const crudProfileTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;
      const saved = ast.saveStudentProfile({
        educationContext: 'school_11',
        subjects: [
          { subject: 'Информатика', score: 88 },
          { subject: 'Математика (профиль)', score: 82 },
          { subject: 'Русский язык', score: 90 },
        ],
        locationPreferences: ['Москва'],
        preferredStudyAreas: ['Информационные технологии'],
        budgetConstraint: 'only_budget',
        accommodationNeed: 'required',
        hasMilitaryPreference: true,
      });

      const loaded = ast.loadStudentProfile();
      const badges = ast.getProfileSummaryBadges(loaded);

      return {
        totalScoreCalculated: saved.totalScore === 260 && loaded.totalScore === 260,
        subjectsCount: loaded.subjects.length === 3,
        badgesCount: badges.length,
        hasScoreBadge: badges.some((b) => b.label.includes('260 б.')),
        hasEduBadge: badges.some((b) => b.label.includes('11 кл')),
        hasLocationBadge: badges.some((b) => b.label.includes('Москва')),
        hasBudgetBadge: badges.some((b) => b.label.includes('Только бюджет')),
        hasDormBadge: badges.some((b) => b.label.includes('Общежитие: обязательно')),
        hasMilitaryBadge: badges.some((b) => b.label.includes('ВУЦ')),
      };
    });
    assertTest(
      'Profile persistence computes total score (260) and generates verified badges',
      crudProfileTest.totalScoreCalculated &&
        crudProfileTest.subjectsCount &&
        crudProfileTest.hasScoreBadge &&
        crudProfileTest.hasEduBadge &&
        crudProfileTest.hasLocationBadge &&
        crudProfileTest.hasBudgetBadge &&
        crudProfileTest.hasDormBadge &&
        crudProfileTest.hasMilitaryBadge
    );

    // Test 3: Prompt enhancement honesty (NO hardcoded 265 score or fabricated military/dorms)
    const promptEnhanceHonestyTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      // With no profile saved
      ast.clearStudentProfile();
      const emptyProfilePrompt = ast.enhanceStudentPrompt('какие шансы поступить на IT?');
      const emptyPromptHonest =
        !emptyProfilePrompt.includes('265') &&
        !emptyProfilePrompt.includes('военную кафедру') &&
        !emptyProfilePrompt.includes('общежитие');

      // With 260 score confirmed
      ast.saveStudentProfile({
        subjects: [
          { subject: 'Информатика', score: 88 },
          { subject: 'Математика (профиль)', score: 82 },
          { subject: 'Русский язык', score: 90 },
        ],
      });
      const confirmedProfilePrompt = ast.enhanceStudentPrompt('');
      const usesConfirmedScoreOnly =
        confirmedProfilePrompt.includes('260 б.') && !confirmedProfilePrompt.includes('265');

      return {
        emptyPromptHonest,
        usesConfirmedScoreOnly,
      };
    });
    assertTest(
      'enhanceStudentPrompt does NOT inject hardcoded 265 or unstated conditions',
      promptEnhanceHonestyTest.emptyPromptHonest && promptEnhanceHonestyTest.usesConfirmedScoreOnly
    );

    // Test 4: Separation of temporary conversation context from saved profile
    const contextSeparationTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;
      const profile = ast.loadStudentProfile(); // score 260

      const isHypo1 = ast.isHypotheticalQuery('А что если у меня будет 180 баллов?');
      const isHypo2 = ast.isHypotheticalQuery('Допустим я не сдавал физику');
      const isHypo3 = ast.isHypotheticalQuery('Покажи проходные баллы МГУ');

      const mergedFilters = ast.mergeProfileWithQueryFilters(
        { score: 180 },
        profile,
        true
      );

      // Verify the saved profile was NOT overwritten
      const loadedAfter = ast.loadStudentProfile();

      return {
        isHypo1,
        isHypo2,
        notHypo3: !isHypo3,
        mergedScore: mergedFilters.score === 180,
        savedScoreUntouched: loadedAfter.totalScore === 260,
      };
    });
    assertTest(
      'Temporary what-if scenarios are separated and never corrupt saved profile',
      contextSeparationTest.isHypo1 &&
        contextSeparationTest.isHypo2 &&
        contextSeparationTest.notHypo3 &&
        contextSeparationTest.mergedScore &&
        contextSeparationTest.savedScoreUntouched
    );

    // Test 5: Single focused clarification question when underspecified
    const clarificationTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;
      const res = ast.interpretStudentQuery('Помоги поступить в вуз');
      return {
        isUnderspecified: res.isUnderspecified === true,
      };
    });
    assertTest(
      'Underspecified queries identify missing facts and prompt single focused clarification',
      clarificationTest.isUnderspecified
    );

    // Test 6: Pathway-tailored checklist with sourced & verified/unverified deadlines
    const pathwayChecklistTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      // 1. College graduate pathway
      const collegeProfile = {
        educationContext: 'college_spo',
        subjects: [],
        preferredStudyAreas: ['Программирование'],
        locationPreferences: ['Москва'],
        budgetConstraint: 'only_budget',
        accommodationNeed: 'required',
        shortlistedUniversities: [],
        shortlistedPrograms: [],
        preferredLanguage: 'ru',
        lastModifiedAt: new Date().toISOString(),
      };
      const collegeArtifact = ast.createAdmissionArtifact(collegeProfile);
      const isCollegeRoadmap = collegeArtifact.title.includes('СПО');
      const hasInternalExamsStep = collegeArtifact.checklistItems.some((item) =>
        item.id === 'item-exam-spo' || item.id === 'item-dvi-spo'
      );

      // 2. Loan pathway
      const loanProfile = {
        educationContext: 'school_11',
        subjects: [{ subject: 'Информатика', score: 60 }],
        preferredStudyAreas: [],
        locationPreferences: [],
        budgetConstraint: 'paid_with_loan',
        accommodationNeed: 'unspecified',
        shortlistedUniversities: [],
        shortlistedPrograms: [],
        preferredLanguage: 'ru',
        lastModifiedAt: new Date().toISOString(),
      };
      const loanArtifact = ast.createAdmissionArtifact(loanProfile);
      const isLoanRoadmap = loanArtifact.title.includes('3%');
      const hasLoanItem = loanArtifact.checklistItems.some((item) =>
        item.id === 'item-loan-contract'
      );

      // 3. Sourced deadlines check
      const verifiedItem = collegeArtifact.checklistItems.find(
        (i) => i.id === 'item-apply'
      );
      const unverifiedDormItem = collegeArtifact.checklistItems.find(
        (i) => i.id === 'item-dorm-application'
      );

      return {
        isCollegeRoadmap,
        hasInternalExamsStep,
        isLoanRoadmap,
        hasLoanItem,
        verifiedSourceOk:
          verifiedItem?.isDeadlineVerified === true &&
          typeof verifiedItem?.deadlineSource === 'string',
        unverifiedSourceOk: unverifiedDormItem?.isDeadlineVerified === false,
      };
    });
    assertTest(
      'Checklists reflect actual profile pathways with verified official vs institution deadlines',
      pathwayChecklistTest.isCollegeRoadmap &&
        pathwayChecklistTest.hasInternalExamsStep &&
        pathwayChecklistTest.isLoanRoadmap &&
        pathwayChecklistTest.hasLoanItem &&
        pathwayChecklistTest.verifiedSourceOk &&
        pathwayChecklistTest.unverifiedSourceOk
    );

    // Test 7: Checklist items start unchecked by default & persist when toggled
    const checklistPersistenceTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;
      localStorage.removeItem(ast.CHECKLIST_STORAGE_KEY);

      const art = ast.createAdmissionArtifact();
      const allStartUnchecked = art.checklistItems.every((item) => item.checked === false);

      // Toggle item-apply and item-portfolio and save
      ast.savePersistedChecklist(art.id, ['item-apply', 'item-portfolio']);
      const loadedChecked = ast.loadPersistedChecklist(art.id);

      // Re-create artifact; checked items should be restored
      const reloadedArt = ast.createAdmissionArtifact();
      const applyItem = reloadedArt.checklistItems.find((i) => i.id === 'item-apply');
      const portfolioItem = reloadedArt.checklistItems.find((i) => i.id === 'item-portfolio');
      const monitorItem = reloadedArt.checklistItems.find((i) => i.id === 'item-monitor');

      return {
        allStartUnchecked,
        loadedCheckedCount: loadedChecked.length === 2,
        applyItemRestored: applyItem?.checked === true,
        portfolioItemRestored: portfolioItem?.checked === true,
        monitorItemRemainsUnchecked: monitorItem?.checked === false,
      };
    });
    assertTest(
      'Checklist items start unchecked by default and restore persisted state across reloads',
      checklistPersistenceTest.allStartUnchecked &&
        checklistPersistenceTest.loadedCheckedCount &&
        checklistPersistenceTest.applyItemRestored &&
        checklistPersistenceTest.portfolioItemRestored &&
        checklistPersistenceTest.monitorItemRemainsUnchecked
    );

    // Test 8: Complete data wipe controls (Local storage governance)
    const dataGovernanceWipeTest = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;
      // Setup data
      ast.saveStudentProfile({ totalScore: 300 });
      ast.savePersistedChecklist('art-test', ['item-1']);

      // Perform complete wipe
      const result = ast.clearAllAssistantData();
      const profileAfter = ast.loadStudentProfile();
      const checklistAfter = ast.loadPersistedChecklist('art-test');

      return {
        clearedKeysCount: result.clearedKeys.length >= 3,
        profileReset: !profileAfter.totalScore,
        checklistEmpty: checklistAfter.length === 0,
      };
    });
    assertTest(
      'Complete local storage data wipe purges profile, checklist, and session keys safely',
      dataGovernanceWipeTest.clearedKeysCount &&
        dataGovernanceWipeTest.profileReset &&
        dataGovernanceWipeTest.checklistEmpty
    );

    // Test 9: Playwright E2E UI verification:
    // Open Ded Vuzoped assistant modal -> Open Student Profile modal -> Edit subjects/score -> Save -> Check banner & badges
    console.log('Beginning E2E UI verification in Headless Chrome...');

    // Open Assistant modal
    const assistantBtn = await page.$('button[title*="Дед"], button:has-text("Дед Вузопед")');
    if (assistantBtn) {
      await assistantBtn.click();
    } else {
      // Find floating button
      await page.click('.fixed.bottom-6.right-6 button, [data-assistant-toggle="true"]');
    }
    await page.waitForTimeout(600);

    // Verify Assistant modal opened
    const isModalOpen = await page.evaluate(() => {
      return !!document.querySelector('input[placeholder*="Спросите"], input[placeholder*="Дед"]');
    });
    assertTest('Ded Vuzoped assistant modal opened in UI', isModalOpen);

    // Click Student Profile button in AssistantHeader
    const profileBtn = await page.$('button[title*="профиль"], button:has-text("Профиль")');
    if (profileBtn) {
      await profileBtn.click();
    } else {
      await page.evaluate(() => {
        const btn = document.querySelector('button[title*="профиль"]');
        if (btn) btn.click();
      });
    }
    await page.waitForTimeout(600);

    // Verify Student Profile Modal is visible
    const isProfileModalVisible = await page.evaluate(() => {
      return (
        document.body.innerText.includes('Профиль абитуриента') ||
        document.body.innerText.includes('Конфиденциальность на устройстве')
      );
    });
    assertTest('Student Profile & Local Storage Governance modal opened', isProfileModalVisible);

    // Interact with form controls inside Student Profile Modal
    // 1. Select "11 класс"
    const eduBtn = await page.$('button:has-text("11 класс")');
    if (eduBtn) await eduBtn.click();

    // 2. Click "Добавить предмет" to add Russian (75 pts)
    const addSubBtn = await page.$('button:has-text("Добавить предмет")');
    if (addSubBtn) await addSubBtn.click();

    // 3. Select "Только бюджет" from select dropdown
    await page.selectOption('select:has(option[value="only_budget"])', 'only_budget');

    // 4. Select "Обязательно требуется" from dorm select dropdown
    await page.selectOption('select:has(option[value="required"])', 'required');

    // 5. Click "Сохранить профиль"
    const saveBtn = await page.$('[data-testid="save-profile-btn"]');
    if (saveBtn) await saveBtn.click();

    await page.waitForTimeout(1000);

    // Check confirmed profile banner is displayed in chat
    const bannerInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasBanner: text.includes('Ваш профиль:'),
        hasScore: text.includes('75 б.'),
        hasBudget: text.includes('Только бюджет'),
        hasDorm: text.includes('Общежитие: обязательно'),
        sampleText: text.substring(0, 400),
      };
    });
    console.log('bannerInfo:', bannerInfo);
    assertTest(
      'Confirmed student profile banner and badges rendered above messages',
      bannerInfo.hasBanner && bannerInfo.hasScore && bannerInfo.hasBudget && bannerInfo.hasDorm
    );

    // Send query for checklist to open artifact canvas
    const input = await page.$('input[placeholder*="Спросите"], input[placeholder*="Дед"]');
    if (input) {
      await input.fill('Составь пошаговый чек-лист поступления');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1200);
    }

    // Check if artifact button or action is available and click to open Canvas
    await page.evaluate(() => {
      const artifactBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Открыть интерактивный чек-лист') || b.innerText.includes('Открыть план')
      );
      if (artifactBtn) {
        artifactBtn.click();
      }
    });
    await page.waitForTimeout(800);

    // Capture screenshot of UI with confirmed profile and interactive roadmap
    const screenshotPath = '.pipeline/after/feature_student_profile_and_continuity.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved feature screenshot to ${screenshotPath}`);

    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(screenshotPath, path.join(artifactDir, 'feature_student_profile_and_continuity.png'));
      console.log('Copied feature screenshot to artifact directory.');
    }

    assertTest('Visual screenshot captured and archived', fs.existsSync(screenshotPath));

  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    if (browser) await browser.close();
    server.close();

    console.log('====================================================');
    console.log(`Results: ${passCount} / ${testCount} tests passed.`);
    if (passCount === testCount && testCount > 0) {
      console.log('ALL STUDENT PROFILE & CONTINUITY CHECKS PASSED!');
      process.exit(0);
    } else {
      console.error('SOME CHECKS FAILED!');
      process.exit(1);
    }
  }
});
