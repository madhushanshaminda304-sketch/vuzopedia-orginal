export type StudyDegree = 'bachelor' | 'specialist' | 'master' | 'spo';

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
  code: string;
  name: string;
  faculty: string;
  degree: StudyDegree;
  requiredExams: ExamSubjectId[];
  optionalExams?: ExamSubjectId[];
  budgetPlaces: number;
  paidPlaces: number;
  minBudgetScore2025: number;
  minPaidScore2025: number;
  annualFee: number;
  durationYears: number;
  isRemoteAvailable?: boolean;
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

// === NEW ADVANCED FEATURES TYPES ===

export interface College {
  id: string;
  shortName: string;
  fullName: string;
  city: string;
  minGpaBudget: number; // e.g. 4.45
  budgetPlaces: number;
  hasDormitory: boolean;
  base: 'after_9' | 'after_11' | 'both';
  annualFee: number;
  specialties: string[];
  rating: number;
}

export interface BlacklistEntry {
  id: string;
  name: string;
  city: string;
  status: 'revoked' | 'suspended' | 'no_accreditation' | 'reorganized';
  statusLabel: string;
  decisionDate: string;
  consequences: string;
  officialDocNumber: string;
}

export interface TargetQuotaOffer {
  id: string;
  employer: string;
  sphere: string;
  specialtyCode: string;
  specialtyName: string;
  universityShort: string;
  city: string;
  stipendPerMonth: number;
  openSpots: number;
  obligationYears: number;
  benefits: string[];
}

export interface FearMapItem {
  id: string;
  fear: string;
  riskSeverity: 'high' | 'medium' | 'low';
  realityCheck: string;
  stepByStepSolution: string[];
  alternativePaths: string[];
}

export interface RemoteProgram {
  id: string;
  code: string;
  title: string;
  universityShort: string;
  annualFee: number;
  durationYears: number;
  onlineExamProctoring: boolean;
  diplomaType: 'Диплом государственного образца' | 'Диплом установленного образца';
}

export interface DormitoryItem {
  id: string;
  universityShort: string;
  universityFullName: string;
  city: string;
  buildingType: 'Блочный' | 'Коридорный' | 'Квартирный' | 'Гостиничный';
  costPerMonth: number;
  placesTotal: number;
  guaranteedForFirstYear: boolean;
  distanceToCampusMin: number;
  metroStation?: string;
  facilities: string[];
  address: string;
  photos: string[];
}

export interface MilitaryDeptItem {
  id: string;
  universityShort: string;
  universityFullName: string;
  city: string;
  ranksTrained: ('Офицер запаса' | 'Сержант запаса' | 'Рядовой запаса')[];
  specialtiesTrained: string[];
  physicalRequirements: {
    pullUps: number;
    running100mSec: number;
    running3kmMin: number;
  };
  hasContractTraining: boolean;
  competitionPerSpot: string;
}

export interface UniversityReview {
  id: string;
  universityId: string;
  authorName: string;
  courseAndFaculty: string;
  date: string;
  ratingOverall: number;
  ratingEducation: number;
  ratingDorm: number;
  ratingDeanery: number;
  ratingEmployment: number;
  pros: string;
  cons: string;
  verdict: string;
  isVerifiedStudent: boolean;
  likesCount: number;
}

export interface OlympiadItem {
  id: string;
  title: string;
  organizer: string;
  level: 1 | 2 | 3;
  subject: string;
  profileSubjectExam: string;
  bviBenefit: string;
  confirmationScore: number;
  registrationDeadline: string;
  participatingUniversitiesCount: number;
  officialSite: string;
}

export interface FullProgramItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
  degree: StudyDegree;
  universityId: string;
  universityShort: string;
  city: string;
  requiredExams: ExamSubjectId[];
  minBudgetScore: number;
  minPaidScore: number;
  budgetPlaces: number;
  paidPlaces: number;
  annualFee: number;
  durationYears: number;
  careerProspects: string[];
  averageGraduateSalary: string;
  isRemoteAvailable: boolean;
}
