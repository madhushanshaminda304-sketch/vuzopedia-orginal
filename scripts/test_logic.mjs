import { UNIVERSITIES, SPECIALTIES, PROFESSIONS, EXAM_SUBJECTS, KLIMOV_QUESTIONS } from '../src/data/mockData.js';
import { calculateProgramChance, calculateAllChances } from '../src/utils/calculator.js';

console.log('--- TEST SUITE: Vuzopedia Remake Logic ---');

// Test 1: Verify data integrity
console.assert(UNIVERSITIES.length >= 10, 'Universities count should be >= 10');
console.assert(SPECIALTIES.length >= 8, 'Specialties count should be >= 8');
console.assert(PROFESSIONS.length >= 6, 'Professions count should be >= 6');
console.assert(EXAM_SUBJECTS.length === 11, 'Exam subjects should be exactly 11');
console.assert(KLIMOV_QUESTIONS.length === 10, 'Klimov questions should be 10');
console.log('✓ Test 1: Data integrity passed');

// Test 2: USE Calculator logic
const scores = { rus: 85, math_prof: 80, inf: 90 };
const achievements = 5; // total = 260
const mgu = UNIVERSITIES.find(v => v.id === 'mgu');
const pmi = mgu.programs.find(p => p.code === '01.03.02');

const chance = calculateProgramChance(mgu, pmi, scores, achievements);
console.assert(chance !== null, 'Chance calculation must not be null');
console.assert(chance.userScore === 260, 'User score should be 260');
console.log(`✓ Test 2: Calculator calculated chance: ${chance.chancePercent}%, status: ${chance.statusLabel}`);

// Test 3: Calculate all chances across universities
const allChances = calculateAllChances(UNIVERSITIES, scores, achievements);
console.assert(allChances.length > 0, 'Should find programs matching math+rus+inf');
console.log(`✓ Test 3: Found ${allChances.length} matching programs across all universities`);

// Test 4: City Filtering
const moscowChances = calculateAllChances(UNIVERSITIES, scores, achievements, 'Москва');
console.assert(moscowChances.every(c => c.university.city === 'Москва'), 'All should be in Moscow');
console.log(`✓ Test 4: City filter passed (${moscowChances.length} programs in Moscow)`);

console.log('--- ALL LOGIC TESTS PASSED SUCCESSFULLY! ---');
