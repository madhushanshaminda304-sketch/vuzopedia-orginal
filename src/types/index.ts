export type StudyDegree = 'bachelor' | 'specialist' | 'master';

export type ExamSubjectId =
  | 'rus'
  | 'math_prof'
  | 'phys'
  | 'inf'
  | 'soc'
  | 'hist'
  | 'chem'
  | 'bio'
  | 'foreign'
  | 'lit'
  | 'geo';

export interface ExamSubject {
  id: ExamSubjectId;
  name: string;
  shortName: string;
  minScore: number;
}

export interface UniversityProgram {
  id: string;
  code: string; // e.g. "09.03.01"
  name: string;
  faculty: string;
  degree: StudyDegree;
  requiredExams: ExamSubjectId[];
  optionalExams?: ExamSubjectId[]; // choice subject, e.g. Phys or Inf
  budgetPlaces: number;
  paidPlaces: number;
  minBudgetScore2025: number;
  minPaidScore2025: number;
  annualFee: number;
  durationYears: number;
}

export interface University {
  id: string;
  shortName: string;
  fullName: string;
  city: string;
  address: string;
  metro?: string;
  foundedYear: number;
  ratingRank: number;
  isState: boolean;
  hasMilitaryDept: boolean;
  hasDormitory: boolean;
  hasBudget: boolean;
  hasLicense: boolean;
  hasAccreditation: boolean;
  minBudgetScore: number;
  minPaidScore: number;
  totalBudgetPlaces: number;
  totalPaidPlaces: number;
  minAnnualFee: number;
  website: string;
  phone: string;
  email: string;
  description: string;
  programsCount: number;
  studentRating: number;
  reviewsCount: number;
  emblemColor: string;
  programs: UniversityProgram[];
  dormitoryInfo: {
    places: number;
    costMonth: number;
    distanceMinutes: number;
  };
  features: string[];
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
  degree: StudyDegree;
  category: 'it' | 'engineering' | 'medicine' | 'economics' | 'humanities' | 'creative';
  categoryLabel: string;
  durationYears: number;
  requiredExams: ExamSubjectId[];
  avgSalary: string;
  description: string;
  popularPositions: string[];
  vuzCount: number;
}

export interface Profession {
  id: string;
  title: string;
  sphere: string;
  salaryJunior: string;
  salaryMiddle: string;
  salarySenior: string;
  demandLevel: 'Высокая' | 'Очень высокая' | 'Умеренная';
  description: string;
  keySkills: string[];
  recommendedSpecialties: string[];
  suitableExams: ExamSubjectId[];
}

export interface TestQuestion {
  id: number;
  question: string;
  optionA: {
    text: string;
    category: 'nature' | 'tech' | 'human' | 'sign' | 'art';
  };
  optionB: {
    text: string;
    category: 'nature' | 'tech' | 'human' | 'sign' | 'art';
  };
}

export interface TestResultCategory {
  category: 'nature' | 'tech' | 'human' | 'sign' | 'art';
  title: string;
  score: number;
  description: string;
  suitableProfessions: string[];
}

export interface AdmissionsCalendarEvent {
  date: string;
  title: string;
  stage: 'early' | 'main' | 'priority' | 'final';
  description: string;
  isCrucial: boolean;
}

export interface GlossaryTerm {
  term: string;
  abbr?: string;
  definition: string;
  example?: string;
}
