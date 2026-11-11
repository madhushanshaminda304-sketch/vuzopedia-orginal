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

const PORT = 4185;
const artifactDir = 'C:/Users/DELL/.gemini/antigravity/brain/948c3b61-9b65-4ccd-ac5d-ed0b5675d063';

server.listen(PORT, async () => {
  console.log(`Action Registry Verification server running on http://localhost:${PORT}`);
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
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[Browser Console Error] ${msg.text()}`);
      }
    });

    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Ensure __ASSISTANT__ is exposed
    const hasAssistant = await page.evaluate(() => typeof window.__ASSISTANT__ !== 'undefined');
    assertTest('Application window.__ASSISTANT__ registry services loaded', hasAssistant);

    // Test 1: Tab registry validation and known mismatches resolution
    const tabRegistryResults = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;
      const tabs = ast.APPLICATION_TABS;
      const expectedKnownTabs = [
        'catalog', 'programs', 'calculator', 'spo', 'specialties', 'professions',
        'target', 'fear_map', 'blacklist', 'remote', 'dorms', 'military',
        'reviews', 'olympiads', 'credit', 'achievements', 'student_budget',
        'tests', 'proforient_interests', 'proforient_ege', 'proforient_subjects',
        'proforient_klimov', 'proforient_one_of_two', 'compare', 'calendar', 'tracker'
      ];

      const allExpectedExist = expectedKnownTabs.every(t => tabs.includes(t));
      
      // Known mismatches resolution:
      const comparisonResolved = ast.resolveCanonicalTab('comparison');
      const budgetResolved = ast.resolveCanonicalTab('budget');
      const collegesResolved = ast.resolveCanonicalTab('colleges');
      const myPlanResolved = ast.resolveCanonicalTab('my_plan');
      const unknownResolved = ast.resolveCanonicalTab('random_fake_tab_99');

      return {
        tabCount: tabs.length,
        allExpectedExist,
        comparisonResolved,
        budgetResolved,
        collegesResolved,
        myPlanResolved,
        unknownResolved,
      };
    });

    assertTest(
      'All 26 application tabs are canonically registered in APPLICATION_TABS',
      tabRegistryResults.allExpectedExist && tabRegistryResults.tabCount === 26,
      `Registered tabs count: ${tabRegistryResults.tabCount}`
    );

    assertTest(
      'Mismatches correctly resolved: comparison -> compare, budget -> student_budget, colleges -> spo, my_plan -> tracker',
      tabRegistryResults.comparisonResolved === 'compare' &&
      tabRegistryResults.budgetResolved === 'student_budget' &&
      tabRegistryResults.collegesResolved === 'spo' &&
      tabRegistryResults.myPlanResolved === 'tracker' &&
      tabRegistryResults.unknownResolved === null,
      JSON.stringify(tabRegistryResults)
    );

    // Test 2: Compare universities action validation with populated entities vs empty entities
    const compareValidationResults = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      // Valid compare action with real IDs
      const validAction = ast.createCompareAction(['mgu', 'hse']);

      // Compare action with single or empty IDs and no context
      const emptyAction = ast.createCompareAction([]);

      // Compare action with invalid IDs
      const invalidUniAction = ast.createCompareAction(['fake_uni_1', 'fake_uni_2']);

      const resolved = ast.resolveAction('compare');

      return {
        validActionCanExecute: validAction.canExecute,
        validActionIds: validAction.universityIds,
        validActionType: validAction.type,
        resolvedTabId: resolved?.tabId,
        emptyActionCanExecute: emptyAction.canExecute,
        emptyActionReason: emptyAction.disabledReason,
        invalidUniCanExecute: invalidUniAction.canExecute,
        invalidUniReason: invalidUniAction.disabledReason,
      };
    });

    assertTest(
      'Valid compare action with real entities carries populated university IDs and canExecute: true',
      compareValidationResults.validActionCanExecute === true &&
      compareValidationResults.validActionIds.length === 2 &&
      compareValidationResults.validActionType === 'compare_universities' &&
      compareValidationResults.resolvedTabId === 'compare'
    );

    assertTest(
      'Empty comparison without entities is marked canExecute: false with explanatory disabledReason',
      compareValidationResults.emptyActionCanExecute === false &&
      typeof compareValidationResults.emptyActionReason === 'string' &&
      compareValidationResults.emptyActionReason.length > 5
    );

    assertTest(
      'Comparison with invalid non-existent universities is marked canExecute: false',
      compareValidationResults.invalidUniCanExecute === false &&
      typeof compareValidationResults.invalidUniReason === 'string'
    );

    // Test 3: Open university and program actions validation
    const entityActionResults = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      const validUni = ast.createOpenUniversityAction('bmstu');
      const invalidUni = ast.createOpenUniversityAction('nonexistent_uni_123');

      const validProg = ast.createOpenProgramAction('09.03.04', 'mgu');
      const invalidProg = ast.createOpenProgramAction('99.99.99');

      return {
        validUniCanExecute: validUni.canExecute,
        validUniName: validUni.universityName,
        invalidUniCanExecute: invalidUni.canExecute,
        invalidUniReason: invalidUni.disabledReason,
        validProgCanExecute: validProg.canExecute,
        validProgCode: validProg.code,
        validProgType: validProg.type,
        invalidProgCanExecute: invalidProg.canExecute,
      };
    });

    assertTest(
      'Open university action validates entity ID against real mock catalog',
      entityActionResults.validUniCanExecute === true &&
      entityActionResults.validUniName.includes('Бауман') &&
      entityActionResults.invalidUniCanExecute === false &&
      entityActionResults.invalidUniReason.includes('не найден')
    );

    assertTest(
      'Open program action validates program code against catalog',
      entityActionResults.validProgCanExecute === true &&
      entityActionResults.validProgCode === '09.03.04' &&
      entityActionResults.validProgType === 'open_program' &&
      entityActionResults.invalidProgCanExecute === false
    );

    // Test 4: Manage shortlist action validation & confirmation rules
    const shortlistResults = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      const addAction = ast.createManageShortlistAction('add', 'mgu');
      const removeAction = ast.createManageShortlistAction('remove', 'mgu');
      const invalidShortlist = ast.createManageShortlistAction('add', 'ghost_vuz');

      return {
        addCanExecute: addAction.canExecute,
        addRequiresConfirmation: addAction.requiresConfirmation === true,
        removeCanExecute: removeAction.canExecute,
        removeRequiresConfirmation: removeAction.requiresConfirmation === true,
        removeMessage: removeAction.confirmationMessage,
        invalidShortlistCanExecute: invalidShortlist.canExecute,
      };
    });

    assertTest(
      'Reversible shortlist addition does NOT require confirmation, but irreversible removal DOES require confirmation',
      shortlistResults.addCanExecute === true &&
      shortlistResults.addRequiresConfirmation === false &&
      shortlistResults.removeCanExecute === true &&
      shortlistResults.removeRequiresConfirmation === true &&
      typeof shortlistResults.removeMessage === 'string' &&
      shortlistResults.invalidShortlistCanExecute === false
    );

    // Test 5: Calculator and filter actions validation
    const calcAndFilterResults = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      const calcEge = ast.createOpenCalculatorAction('ege', 275);
      const calcBudget = ast.createOpenCalculatorAction('student_budget', undefined, 'Москва');
      const filtersAction = ast.createApplyFiltersAction({ city: 'Санкт-Петербург', hasDorm: true });

      const resolvedEge = ast.resolveAction('calculator');
      const resolvedBudget = ast.resolveAction('student_budget');

      return {
        calcEgeType: calcEge.calculatorType,
        calcEgeScore: calcEge.score,
        resolvedEgeTab: resolvedEge?.tabId,
        calcBudgetType: calcBudget.calculatorType,
        calcBudgetCity: calcBudget.city,
        resolvedBudgetTab: resolvedBudget?.tabId,
        filtersCity: filtersAction.filters.city,
        filtersDorm: filtersAction.filters.hasDorm,
      };
    });

    assertTest(
      'Calculators map to canonical tabs: ege -> calculator, student_budget -> student_budget with parameters',
      calcAndFilterResults.calcEgeType === 'ege' &&
      calcAndFilterResults.calcEgeScore === 275 &&
      calcAndFilterResults.resolvedEgeTab === 'calculator' &&
      calcAndFilterResults.calcBudgetType === 'student_budget' &&
      calcAndFilterResults.calcBudgetCity === 'Москва' &&
      calcAndFilterResults.resolvedBudgetTab === 'student_budget' &&
      calcAndFilterResults.filtersCity === 'Санкт-Петербург' &&
      calcAndFilterResults.filtersDorm === true
    );

    // Test 6: Security: strict blocking of javascript:, arbitrary URLs, scripts, and unknown routes
    const securityResults = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      const testTargets = [
        { target: 'catalog', expected: true },
        { target: 'compare', expected: true },
        { target: 'javascript:alert(1)', expected: false },
        { target: 'javascript:document.cookie', expected: false },
        { target: 'https://malicious-external-site.com', expected: false },
        { target: 'data:text/html,<script>alert(1)</script>', expected: false },
        { target: 'admin/secret/shell', expected: false },
        { target: '../etc/passwd', expected: false },
        { target: 'eval(console.log(1))', expected: false },
      ];

      return testTargets.map(t => ({
        target: t.target,
        result: ast.isSafeNavigationTarget(t.target),
        pass: ast.isSafeNavigationTarget(t.target) === t.expected,
      }));
    });

    const allSecurityPassed = securityResults.every(r => r.pass);
    assertTest(
      'Security guards: isSafeNavigationTarget strictly rejects javascript:, script execution, external URLs and arbitrary paths',
      allSecurityPassed,
      JSON.stringify(securityResults.filter(r => !r.pass))
    );

    // Test 7: Integration execution with state handlers: Compare universities updates compareList
    const executionResults = await page.evaluate(() => {
      const ast = window.__ASSISTANT__;

      let currentTab = 'catalog';
      let compareList = ['mipt'];
      let favorites = ['hse'];
      let toast = '';

      const action = ast.createCompareAction(['mgu', 'bmstu']);

      const executed = ast.executeAppAssistantAction(action, {
        setCurrentTab: (tab) => { currentTab = tab; },
        setSelectedUniversityDetail: () => {},
        setCompareList: (updater) => {
          compareList = typeof updater === 'function' ? updater(compareList) : updater;
        },
        setFavorites: (updater) => {
          favorites = typeof updater === 'function' ? updater(favorites) : updater;
        },
        showToast: (msg) => { toast = msg; },
      });

      return {
        executed,
        currentTab,
        compareList,
        toast,
      };
    });

    assertTest(
      'executeAppAssistantAction populates compareList with target universities and updates tab to compare',
      executionResults.executed === true &&
      executionResults.currentTab === 'compare' &&
      executionResults.compareList.includes('mgu') &&
      executionResults.compareList.includes('bmstu')
    );

    // Test 8: End-to-End Browser UI Flow:
    // Open Ded Vuzoped Assistant modal, trigger comparison, click contextual action button,
    // verify navigation to compare view with universities populated!
    console.log('Testing End-to-End Assistant UI Navigation...');

    // Click floating Ded Vuzoped button
    const assistantBtn = page.locator('button[title="Спросить Деда Вузопеда"]');
    await assistantBtn.click();
    await page.waitForTimeout(600);

    // Verify modal opened
    const modalHeading = page.locator('text=Дед Вузопед');
    const isModalOpen = await modalHeading.first().isVisible();
    assertTest('Ded Vuzoped Assistant modal opened via UI button', isModalOpen);

    // Send query: "Сравни МГУ и ВШЭ"
    const input = page.locator('input[data-testid="ded-assistant-input"]').first();
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill('Сравни МГУ и ВШЭ');
    await input.press('Enter');

    // Wait for response to render with contextual comparison button
    await page.waitForTimeout(2000);

    // Locate the contextual action button
    const actionBtn = page.locator('button:has-text("Сравнить")').first();
    const isActionVisible = await actionBtn.isVisible();
    assertTest('Contextual action button with populated compare action rendered', isActionVisible);

    // Click the action button
    if (isActionVisible) {
      await actionBtn.click();
      await page.waitForTimeout(1000);

      // Verify URL / page state switched to compare view
      const compareView = page.locator('text=Инструмент сравнения').first();
      const isCompareViewActive = await compareView.isVisible();
      assertTest('Clicking assistant action navigated to UniversityComparisonView with selected entities', isCompareViewActive);

      // Verify that MGU and HSE are in the comparison table
      const mguInCompare = await page.locator('text=МГУ им. М.В. Ломоносова').first().isVisible();
      const hseInCompare = await page.locator('text=НИУ ВШЭ').first().isVisible();
      assertTest('Comparison view contains MGU and HSE side-by-side', mguInCompare && hseInCompare);
    }

    // Capture screenshot of the verified action registry & navigation flow
    const screenshotPath = '.pipeline/after/feature_assistant_action_registry.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    fs.copyFileSync(screenshotPath, path.join(artifactDir, 'feature_assistant_action_registry.png'));
    console.log(`Saved screenshot to ${screenshotPath} and artifact directory.`);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  console.log('\n=============================================');
  console.log(`Action Registry Verification: ${passCount}/${testCount} tests passed`);
  console.log('=============================================\n');

  if (passCount < testCount || testCount === 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
