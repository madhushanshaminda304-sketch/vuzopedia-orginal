import { ExamSubjectId, University, UniversityProgram } from '../types';

export interface UserScores {
  [key: string]: number; // subjectId -> score (0-100)
}

export interface ProgramChanceResult {
  university: University;
  program: UniversityProgram;
  userScore: number;
  passingScore: number;
  diff: number;
  status: 'high' | 'medium' | 'low';
  statusLabel: string;
  chancePercent: number;
  matchingSubjects: string[];
}

export function calculateProgramChance(
  university: University,
  program: UniversityProgram,
  scores: UserScores,
  achievementScore: number = 0
): ProgramChanceResult | null {
  // Check if user has scores for all required exams
  const required = program.requiredExams;
  let totalScore = achievementScore;
  const matching: string[] = [];

  for (const subId of required) {
    const val = scores[subId];
    if (val === undefined || val === null || val <= 0) {
      return null; // Missing required exam
    }
    totalScore += val;
    matching.push(subId);
  }

  const passing = program.minBudgetScore2025;
  const diff = totalScore - passing;

  let status: 'high' | 'medium' | 'low';
  let statusLabel: string;
  let chancePercent: number;

  if (diff >= 5) {
    status = 'high';
    statusLabel = 'Высокие шансы (Зелёная зона)';
    chancePercent = Math.min(99, Math.round(85 + (diff / 20) * 14));
  } else if (diff >= -15) {
    status = 'medium';
    statusLabel = 'Средние шансы (Жёлтая зона)';
    chancePercent = Math.round(50 + (diff / 20) * 35);
  } else {
    status = 'low';
    statusLabel = 'Малые шансы (Красная зона)';
    chancePercent = Math.max(5, Math.round(30 + (diff / 40) * 25));
  }

  return {
    university,
    program,
    userScore: totalScore,
    passingScore: passing,
    diff,
    status,
    statusLabel,
    chancePercent,
    matchingSubjects: matching,
  };
}

export function calculateAllChances(
  universities: University[],
  scores: UserScores,
  achievementScore: number = 0,
  selectedCity?: string
): ProgramChanceResult[] {
  const results: ProgramChanceResult[] = [];

  for (const vuz of universities) {
    if (selectedCity && selectedCity !== 'Все города' && vuz.city !== selectedCity) {
      continue;
    }

    for (const prog of vuz.programs) {
      const chance = calculateProgramChance(vuz, prog, scores, achievementScore);
      if (chance) {
        results.push(chance);
      }
    }
  }

  // Sort by highest chance percent and total user score
  return results.sort((a, b) => b.chancePercent - a.chancePercent || b.userScore - a.userScore);
}
