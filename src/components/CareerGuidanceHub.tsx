import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Compass,
  Award,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Scale,
  X,
  SlidersHorizontal,
  ChevronRight,
  Briefcase,
  Users,
  Target,
  BrainCircuit,
  Languages,
} from 'lucide-react';
import { KLIMOV_QUESTIONS, PROFESSIONS, UNIVERSITIES } from '../data/mockData';

interface CareerGuidanceHubProps {
  onNavigateTab?: (tab: string) => void;
  onOpenUniversity?: (vuz: any) => void;
  defaultActiveTool?: 'none' | 'profession' | 'ege' | 'subjects' | 'klimov' | 'one_of_two';
  compactMode?: boolean;
}

export const CareerGuidanceHub: React.FC<CareerGuidanceHubProps> = ({
  onNavigateTab,
  onOpenUniversity,
  defaultActiveTool = 'none',
  compactMode = false,
}) => {
  // Language toggle: 'en' matches user screenshot exactly, 'ru' matches native Russian site
  const [lang, setLang] = useState<'en' | 'ru'>('en');

  // Active interactive tool modal/inline view
  const [activeTool, setActiveTool] = useState<
    'none' | 'profession' | 'ege' | 'subjects' | 'klimov' | 'one_of_two'
  >(defaultActiveTool);

  // ==========================================
  // Tool 1: Selecting a Profession Wizard State
  // ==========================================
  const [profStep, setProfStep] = useState(0);
  const [profAnswers, setProfAnswers] = useState<{
    sphere: string;
    workStyle: string;
    salary: string;
    mindset: string;
  }>({
    sphere: 'it',
    workStyle: 'remote',
    salary: 'high',
    mindset: 'analytical',
  });
  const [profFinished, setProfFinished] = useState(false);

  // ==========================================
  // Tool 2: Selection based on USE State
  // ==========================================
  const [selectedEge, setSelectedEge] = useState<string[]>(['rus', 'math_prof', 'inf']);
  const [egeScores, setEgeScores] = useState<{ [key: string]: number }>({
    rus: 82,
    math_prof: 80,
    inf: 85,
    phys: 75,
    soc: 78,
    chem: 74,
    bio: 76,
    foreign: 80,
    hist: 72,
    lit: 75,
    geo: 70,
  });

  // ==========================================
  // Tool 3: Selection based on School Subjects State
  // ==========================================
  const [favSubjects, setFavSubjects] = useState<string[]>(['inf', 'math']);

  // ==========================================
  // Tool 4: Klimov Career Test State
  // ==========================================
  const [klimovIndex, setKlimovIndex] = useState(0);
  const [klimovAnswers, setKlimovAnswers] = useState<{ [key: number]: 'A' | 'B' }>({});
  const [klimovFinished, setKlimovFinished] = useState(false);

  // ==========================================
  // Tool 5: One of Two Binary Test State
  // ==========================================
  const [binaryIndex, setBinaryIndex] = useState(0);
  const [binaryScores, setBinaryScores] = useState<{ [category: string]: number }>({
    tech: 0,
    bio: 0,
    creative: 0,
    business: 0,
    human: 0,
  });
  const [binaryFinished, setBinaryFinished] = useState(false);

  // Binary test dilemmas
  const BINARY_PAIRS = [
    {
      id: 1,
      titleA: lang === 'en' ? 'Develop Artificial Intelligence algorithms' : 'Разрабатывать алгоритмы искусственного интеллекта',
      catA: 'tech',
      titleB: lang === 'en' ? 'Perform precision neurosurgery in clinic' : 'Оперировать пациентов в современной клинике',
      catB: 'bio',
    },
    {
      id: 2,
      titleA: lang === 'en' ? 'Manage a $50M venture capital fund' : 'Управлять венчурным фондом на $50 млн',
      catA: 'business',
      titleB: lang === 'en' ? 'Direct cinematic visual effects for blockbusters' : 'Создавать спецэффекты для мировых фильмов',
      catB: 'creative',
    },
    {
      id: 3,
      titleA: lang === 'en' ? 'Defend human rights in international courts' : 'Защищать права граждан в международном суде',
      catA: 'human',
      titleB: lang === 'en' ? 'Build autonomous drones and aerospace robotics' : 'Конструировать беспилотники и космических роботов',
      catB: 'tech',
    },
    {
      id: 4,
      titleA: lang === 'en' ? 'Edit human DNA to eradicate hereditary diseases' : 'Редактировать геном человека для лечения болезней',
      catA: 'bio',
      titleB: lang === 'en' ? 'Scale an international tech startup to IPO' : 'Вывести технологический стартап на биржу (IPO)',
      catB: 'business',
    },
    {
      id: 5,
      titleA: lang === 'en' ? 'Design architecture for futuristic smart cities' : 'Проектировать архитектуру умных городов будущего',
      catA: 'creative',
      titleB: lang === 'en' ? 'Train future leaders and elite university students' : 'Обучать и вдохновлять новое поколение лидеров',
      catB: 'human',
    },
    {
      id: 6,
      titleA: lang === 'en' ? 'Architect ultra-secure cryptographic cyber defenses' : 'Создавать квантовую киберзащиту для банков',
      catA: 'tech',
      titleB: lang === 'en' ? 'Discover deep-sea ecosystems and marine biology' : 'Исследовать океанские глубины и новые биовиды',
      catB: 'bio',
    },
    {
      id: 7,
      titleA: lang === 'en' ? 'Write storyline & narrative for AAA video games' : 'Писать глубокие сценарии для культовых видеоигр',
      catA: 'creative',
      titleB: lang === 'en' ? 'Analyze global macroeconomic trends and crises' : 'Анализировать мировые макроэкономические тренды',
      catB: 'business',
    },
    {
      id: 8,
      titleA: lang === 'en' ? 'Lead humanitarian emergency response missions' : 'Руководить международными гуманитарными миссиями',
      catA: 'human',
      titleB: lang === 'en' ? 'Train next-gen multimodal neural networks' : 'Обучать мультимодальные нейросети следующего поколения',
      catB: 'tech',
    },
  ];

  // Strings according to language
  const texts = {
    en: {
      heading: 'Career guidance',
      topService: 'TOP service',
      takeAdvantage: 'Take advantage',
      card1Title: 'Selecting a profession',
      card2Title: 'Career selection based on the Unified State Exam',
      card3Title: 'Career selection based on school subjects',
      card4Title: "Klimov's career guidance test",
      card5Title: 'One of two',
      badgeSubtitle: 'Choose the best diagnostic tool to discover your ideal educational path for 2026',
    },
    ru: {
      heading: 'Профориентация',
      topService: 'ТОП сервис',
      takeAdvantage: 'Воспользоваться',
      card1Title: 'Подбор профессии',
      card2Title: 'Подбор профессии по ЕГЭ',
      card3Title: 'Подбор профессии по школьным предметам',
      card4Title: 'Тест Климова на профориентацию',
      card5Title: 'Один из двух',
      badgeSubtitle: 'Выбирайте проверенный сервис профориентации для точного выбора специальности в 2026 году',
    },
  }[lang];

  return (
    <section className="my-8 animate-fadeIn">
      {/* Header bar with Language switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {texts.heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {texts.badgeSubtitle}
          </p>
        </div>

        {/* Language selector toggle [EN | RU] */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-lg transition ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ru')}
            className={`px-2.5 py-1 rounded-lg transition ${
              lang === 'ru'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            RU
          </button>
        </div>
      </div>

      {/* 5-Card Grid matching the user's uploaded photo 1:1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* ==================================================== */}
        {/* CARD 1: Selecting a profession                      */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            {/* Top badge: TOP service in italics */}
            <div className="text-xs text-slate-400 dark:text-slate-500 italic font-medium tracking-wide mb-2">
              {texts.topService}
            </div>

            {/* Illustration 1: Girl with ruler & stethoscope */}
            <div className="h-32 flex items-center justify-center my-2">
              <svg
                viewBox="0 0 160 120"
                className="w-full h-full max-h-32 transition transform group-hover:scale-105 duration-200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sparkles / crosses */}
                <path d="M22 36L26 36M24 34L24 38" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M142 42L146 42M144 40L144 44" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M35 100L38 100M36.5 98.5L36.5 101.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="135" cy="75" r="1.5" fill="#3B82F6" />
                <circle cx="28" cy="62" r="1.5" fill="#F59E0B" />

                {/* Background Yellow Ruler / Curved Protractor */}
                <path
                  d="M26 65C26 50 38 38 54 38C58 38 62 39 65 41"
                  stroke="#F59E0B"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path d="M32 50L36 53M38 43L42 47M48 39L50 44" stroke="#D97706" strokeWidth="1.5" />

                {/* Stethoscope Looping on Right */}
                <path
                  d="M92 48C98 36 122 35 125 48C127 58 116 68 110 74C106 78 102 82 102 90"
                  stroke="#94A3B8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="92" cy="48" r="3.5" fill="#3B82F6" />
                <circle cx="125" cy="48" r="3.5" fill="#3B82F6" />
                <circle cx="102" cy="92" r="6" fill="#64748B" />
                <circle cx="102" cy="92" r="3" fill="#E2E8F0" />

                {/* Girl Figure */}
                {/* Hair in Ponytail */}
                <path
                  d="M62 48C56 36 68 24 82 25C92 26 96 34 94 45C92 52 88 56 80 58C72 60 65 56 62 48Z"
                  fill="#1E293B"
                />
                {/* High Ponytail sticking out left */}
                <path
                  d="M67 36C58 32 48 38 46 48C45 54 50 58 55 54C59 50 63 44 67 36Z"
                  fill="#1E293B"
                />
                {/* Hair band / tie */}
                <ellipse cx="64" cy="38" rx="3" ry="4" fill="#3B82F6" />

                {/* Neck & Face */}
                <rect x="76" y="52" width="6" height="8" rx="3" fill="#FED7AA" />
                <ellipse cx="79" cy="46" rx="9" ry="10" fill="#FED7AA" />
                {/* Cheeks & Eyes & Smile */}
                <circle cx="75" cy="45" r="1.2" fill="#1E293B" />
                <circle cx="82" cy="45" r="1.2" fill="#1E293B" />
                <path d="M76 49C78 51 81 51 83 49" stroke="#EA580C" strokeWidth="1" strokeLinecap="round" />
                {/* Fringe hair */}
                <path d="M70 42C74 38 84 38 87 42C85 41 78 40 70 42Z" fill="#1E293B" />

                {/* White Shirt Collar */}
                <path d="M72 58L79 66L86 58" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />

                {/* Blue Vest & Arms Crossed */}
                <path
                  d="M68 62C68 62 72 60 79 60C86 60 90 62 90 62L95 86C95 88 93 90 91 90H67C65 90 63 88 63 86L68 62Z"
                  fill="#2563EB"
                />
                {/* Crossed Arms */}
                <path
                  d="M66 72C70 78 86 78 92 72C93 78 88 84 79 84C70 84 65 78 66 72Z"
                  fill="#1D4ED8"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                {/* Hands */}
                <circle cx="69" cy="74" r="4" fill="#FED7AA" />
                <circle cx="89" cy="74" r="4" fill="#FED7AA" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center leading-snug min-h-[44px] flex items-center justify-center my-2">
              {texts.card1Title}
            </h3>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTool('profession')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition shadow-sm hover:shadow"
          >
            {texts.takeAdvantage}
          </button>
        </div>

        {/* ==================================================== */}
        {/* CARD 2: Selection based on USE                      */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            {/* Top badge */}
            <div className="text-xs text-slate-400 dark:text-slate-500 italic font-medium tracking-wide mb-2">
              {texts.topService}
            </div>

            {/* Illustration 2: Exam checklist with checkmarks & pen & camera */}
            <div className="h-32 flex items-center justify-center my-2">
              <svg
                viewBox="0 0 160 120"
                className="w-full h-full max-h-32 transition transform group-hover:scale-105 duration-200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sparkles */}
                <path d="M18 42L22 42M20 40L20 44" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M140 28L144 28M142 26L142 30" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="138" cy="88" r="1.5" fill="#10B981" />

                {/* Left: Camera / Flask */}
                <rect x="24" y="32" width="22" height="16" rx="3" fill="#94A3B8" />
                <circle cx="35" cy="40" r="5" fill="#3B82F6" />
                <rect x="28" y="29" width="6" height="3" rx="1" fill="#64748B" />

                {/* Left: Bottle / Flask */}
                <path
                  d="M32 70L30 86C29 90 32 94 36 94H42C46 94 49 90 48 86L46 70H32Z"
                  fill="#38BDF8"
                  opacity="0.8"
                />
                <rect x="34" y="66" width="10" height="4" rx="1" fill="#0284C7" />

                {/* Center: Exam Checklist Paper */}
                <g transform="rotate(-4 80 60)">
                  <rect
                    x="56"
                    y="22"
                    width="54"
                    height="72"
                    rx="4"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="2"
                    className="filter drop-shadow-sm"
                  />
                  {/* Checklist lines & boxes with vivid green checkmarks */}
                  {/* Item 1 */}
                  <rect x="62" y="32" width="8" height="8" rx="2" stroke="#94A3B8" strokeWidth="1.2" />
                  <path d="M63 36L66 39L72 31" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="75" y1="36" x2="100" y2="36" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                  {/* Item 2 */}
                  <rect x="62" y="48" width="8" height="8" rx="2" stroke="#94A3B8" strokeWidth="1.2" />
                  <path d="M63 52L66 55L72 47" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="75" y1="52" x2="98" y2="52" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                  {/* Item 3 */}
                  <rect x="62" y="64" width="8" height="8" rx="2" stroke="#94A3B8" strokeWidth="1.2" />
                  <path d="M63 68L66 71L72 63" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="75" y1="68" x2="96" y2="68" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                  {/* Item 4 */}
                  <rect x="62" y="80" width="8" height="8" rx="2" stroke="#94A3B8" strokeWidth="1.2" />
                  <line x1="75" y1="84" x2="94" y2="84" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Right: Blue Pen pointing to paper */}
                <g transform="rotate(-35 125 50)">
                  <rect x="110" y="44" width="30" height="7" rx="3.5" fill="#2563EB" />
                  <rect x="132" y="44" width="8" height="7" rx="1" fill="#FFFFFF" />
                  <path d="M102 47.5L110 44V51L102 47.5Z" fill="#1E293B" />
                  <path d="M102 47.5L105 46V49L102 47.5Z" fill="#F59E0B" />
                </g>
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center leading-snug min-h-[44px] flex items-center justify-center my-2">
              {texts.card2Title}
            </h3>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTool('ege')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition shadow-sm hover:shadow"
          >
            {texts.takeAdvantage}
          </button>
        </div>

        {/* ==================================================== */}
        {/* CARD 3: Selection based on School Subjects          */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            {/* Top badge */}
            <div className="text-xs text-slate-400 dark:text-slate-500 italic font-medium tracking-wide mb-2">
              {texts.topService}
            </div>

            {/* Illustration 3: Backpack with triangle set square & mouse */}
            <div className="h-32 flex items-center justify-center my-2">
              <svg
                viewBox="0 0 160 120"
                className="w-full h-full max-h-32 transition transform group-hover:scale-105 duration-200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sparkles */}
                <path d="M30 30L34 30M32 28L32 32" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M136 78L140 78M138 76L138 80" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="28" cy="74" r="1.5" fill="#EF4444" />

                {/* Top-Left: Blue Mouse / Compass */}
                <ellipse cx="48" cy="36" rx="6" ry="8" fill="#2563EB" />
                <path d="M48 28C42 22 36 28 40 38" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

                {/* Top-Right: Yellow Triangle Ruler (Set Square) */}
                <path
                  d="M100 24L132 64H88L100 24Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Triangular hole in ruler */}
                <path d="M102 38L118 58H96L102 38Z" fill="#FFFFFF" />
                {/* Metric tick marks on side */}
                <line x1="104" y1="28" x2="108" y2="30" stroke="#78350F" strokeWidth="1.2" />
                <line x1="110" y1="36" x2="114" y2="38" stroke="#78350F" strokeWidth="1.2" />
                <line x1="116" y1="44" x2="120" y2="46" stroke="#78350F" strokeWidth="1.2" />
                <line x1="122" y1="52" x2="126" y2="54" stroke="#78350F" strokeWidth="1.2" />

                {/* Backpack (White/Light Gray with crisp contours) */}
                <path
                  d="M60 48C60 40 68 34 80 34C92 34 100 40 100 48V94C100 98 96 102 91 102H69C64 102 60 98 60 94V48Z"
                  fill="#F8FAFC"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Backpack top handle */}
                <path d="M72 34C72 28 88 28 88 34" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                {/* Front Zip Pocket */}
                <path
                  d="M65 68C65 64 69 60 74 60H86C91 60 95 64 95 68V92C95 94 93 96 91 96H69C67 96 65 94 65 92V68Z"
                  fill="#FFFFFF"
                  stroke="#334155"
                  strokeWidth="2"
                />
                {/* Blue Pocket accent */}
                <line x1="72" y1="66" x2="88" y2="66" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                {/* Side water pocket / strap */}
                <path d="M60 62H55C53 62 52 64 52 66V82C52 84 53 86 55 86H60" stroke="#334155" strokeWidth="2" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center leading-snug min-h-[44px] flex items-center justify-center my-2">
              {texts.card3Title}
            </h3>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTool('subjects')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition shadow-sm hover:shadow"
          >
            {texts.takeAdvantage}
          </button>
        </div>

        {/* ==================================================== */}
        {/* CARD 4: Klimov's career guidance test               */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            {/* Top badge */}
            <div className="text-xs text-slate-400 dark:text-slate-500 italic font-medium tracking-wide mb-2">
              {texts.topService}
            </div>

            {/* Illustration 4: Open Laptop with checklist & arrow */}
            <div className="h-32 flex items-center justify-center my-2">
              <svg
                viewBox="0 0 160 120"
                className="w-full h-full max-h-32 transition transform group-hover:scale-105 duration-200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sparkles */}
                <path d="M25 40L29 40M27 38L27 42" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M134 32L138 32M136 30L136 34" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />

                {/* Right: Blue upward growth arrow */}
                <path
                  d="M125 54L135 44M135 44H126M135 44V53"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Isometric Laptop */}
                {/* Screen frame */}
                <path
                  d="M48 30L108 30C111 30 113 32 113 35L113 72L43 72L43 35C43 32 45 30 48 30Z"
                  fill="#FFFFFF"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Inside screen checklist */}
                <rect x="52" y="38" width="52" height="28" rx="2" fill="#F8FAFC" />
                {/* Green checkmarks on laptop screen */}
                <path d="M56 46L58 48L63 43" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="66" y1="46" x2="96" y2="46" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />

                <path d="M56 56L58 58L63 53" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="66" y1="56" x2="92" y2="56" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />

                {/* Laptop Keyboard Base */}
                <path
                  d="M34 74L43 72H113L122 74L116 94H40L34 74Z"
                  fill="#F1F5F9"
                  stroke="#334155"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Trackpad */}
                <rect x="70" y="84" width="16" height="8" rx="1.5" fill="#CBD5E1" />
                {/* Keyboard keys illusion */}
                <line x1="46" y1="78" x2="110" y2="78" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />

                {/* Computer Mouse with Wire */}
                <ellipse cx="126" cy="94" rx="5" ry="7" fill="#FFFFFF" stroke="#334155" strokeWidth="1.8" />
                <path d="M126 87C124 82 120 84 116 88" stroke="#64748B" strokeWidth="1.2" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center leading-snug min-h-[44px] flex items-center justify-center my-2">
              {texts.card4Title}
            </h3>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTool('klimov')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition shadow-sm hover:shadow"
          >
            {texts.takeAdvantage}
          </button>
        </div>

        {/* ==================================================== */}
        {/* CARD 5: One of two                                  */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            {/* Top badge */}
            <div className="text-xs text-slate-400 dark:text-slate-500 italic font-medium tracking-wide mb-2">
              {texts.topService}
            </div>

            {/* Illustration 5: Mechanical Balance Scales with Pen & Triangle */}
            <div className="h-32 flex items-center justify-center my-2">
              <svg
                viewBox="0 0 160 120"
                className="w-full h-full max-h-32 transition transform group-hover:scale-105 duration-200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sparkles */}
                <path d="M22 34L26 34M24 32L24 36" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M138 34L142 34M140 32L140 36" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />

                {/* Central Pillar of Scale */}
                <rect x="78" y="32" width="4" height="60" rx="2" fill="#64748B" />
                <path d="M68 92C68 88 92 88 92 92L96 96H64L68 92Z" fill="#334155" />
                <circle cx="80" cy="32" r="4.5" fill="#2563EB" />

                {/* Balance Beam (tilting slightly) */}
                <line x1="38" y1="44" x2="122" y2="40" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

                {/* Left Pan (Chains + Plate) */}
                <path d="M38 44L28 72M38 44L48 72" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M24 72C24 78 52 78 52 72H24Z" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
                {/* Left Pan Cargo: Blue Pen / Stylus */}
                <g transform="rotate(-15 36 68)">
                  <rect x="26" y="64" width="22" height="5" rx="2" fill="#2563EB" />
                  <path d="M22 66.5L26 64V69L22 66.5Z" fill="#1E293B" />
                </g>

                {/* Right Pan (Chains + Plate) */}
                <path d="M122 40L112 68M122 40L132 68" stroke="#94A3B8" strokeWidth="1.2" />
                <path d="M108 68C108 74 136 74 136 68H108Z" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
                {/* Right Pan Cargo: Yellow Triangle Set Square */}
                <path
                  d="M122 50L134 68H110L122 50Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M122 56L128 65H116L122 56Z" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center leading-snug min-h-[44px] flex items-center justify-center my-2">
              {texts.card5Title}
            </h3>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTool('one_of_two')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition shadow-sm hover:shadow"
          >
            {texts.takeAdvantage}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE WORKFLOW MODAL FOR ALL 5 TOOLS                                */}
      {/* ========================================================================= */}
      {activeTool !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  {activeTool === 'profession' && '🎯'}
                  {activeTool === 'ege' && '📝'}
                  {activeTool === 'subjects' && '🎒'}
                  {activeTool === 'klimov' && '🧭'}
                  {activeTool === 'one_of_two' && '⚖️'}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activeTool === 'profession' && (lang === 'en' ? 'Selecting a profession' : 'Подбор профессии')}
                    {activeTool === 'ege' && (lang === 'en' ? 'Career selection based on the Unified State Exam' : 'Подбор профессии по ЕГЭ')}
                    {activeTool === 'subjects' && (lang === 'en' ? 'Career selection based on school subjects' : 'Подбор профессии по школьным предметам')}
                    {activeTool === 'klimov' && (lang === 'en' ? "Klimov's career guidance test" : 'Тест Климова на профориентацию')}
                    {activeTool === 'one_of_two' && (lang === 'en' ? 'One of two (Career Balance Test)' : 'Тест «Один из двух» (Весы профессий)')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Vuzopedia Career Guidance Service 2026' : 'Официальный сервис профориентации Вузопедии 2026'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTool('none')}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* ==================================================== */}
              {/* TOOL 1: Selecting a profession Wizard                */}
              {/* ==================================================== */}
              {activeTool === 'profession' && (
                <div>
                  {!profFinished ? (
                    <div>
                      {/* Step Indicator */}
                      <div className="flex items-center justify-between mb-6 text-xs font-bold text-slate-400">
                        <span>
                          {lang === 'en' ? `Step ${profStep + 1} of 4` : `Шаг ${profStep + 1} из 4`}
                        </span>
                        <span>{((profStep + 1) / 4) * 100}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-6">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((profStep + 1) / 4) * 100}%` }}
                        />
                      </div>

                      {/* Step 0: Sphere */}
                      {profStep === 0 && (
                        <div className="space-y-4">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {lang === 'en' ? '1. Which industry area inspires you the most?' : '1. Какая сфера деятельности привлекает вас сильнее всего?'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { id: 'it', title: lang === 'en' ? 'IT, Artificial Intelligence & Cybersecurity' : 'IT, искусственный интеллект и кибербезопасность', icon: '💻' },
                              { id: 'med', title: lang === 'en' ? 'Biotechnology, Genetics & Modern Medicine' : 'Биотехнологии, медицина и генетика', icon: '🧬' },
                              { id: 'biz', title: lang === 'en' ? 'Fintech, Venture Capital & Business Leadership' : 'Финтех, бизнес, инвестиции и управление', icon: '📈' },
                              { id: 'eng', title: lang === 'en' ? 'Robotics, Aerospace & Engineering Systems' : 'Робототехника, космос и инженерия', icon: '🤖' },
                              { id: 'cre', title: lang === 'en' ? 'Game Development, 3D Design & Creative Media' : 'Геймдев, цифровой дизайн и медиа', icon: '🎨' },
                              { id: 'law', title: lang === 'en' ? 'Law, Diplomacy & Public Policy' : 'Юриспруденция, дипломатия и право', icon: '⚖️' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setProfAnswers({ ...profAnswers, sphere: opt.id })}
                                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                                  profAnswers.sphere === opt.id
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <span className="text-2xl">{opt.icon}</span>
                                <div>
                                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{opt.title}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 1: Work format */}
                      {profStep === 1 && (
                        <div className="space-y-4">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {lang === 'en' ? '2. What is your preferred working style?' : '2. В каком формате и обстановке вы хотите работать?'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { id: 'remote', title: lang === 'en' ? '100% Remote / Digital Nomad (anywhere in the world)' : '100% Удаленная работа / Digital Nomad из любой точки мира', icon: '🌍' },
                              { id: 'office', title: lang === 'en' ? 'Modern high-tech corporate campus or research lab' : 'Высокотехнологичный офис или современная лаборатория', icon: '🏢' },
                              { id: 'active', title: lang === 'en' ? 'Dynamic travel, field work, filming & expeditions' : 'Командировки, полевые исследования, съемки и экспедиции', icon: '🚀' },
                              { id: 'clinical', title: lang === 'en' ? 'Direct communication with clients, patients or teams' : 'Живая клиническая или консультационная практика с людьми', icon: '🤝' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setProfAnswers({ ...profAnswers, workStyle: opt.id })}
                                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                                  profAnswers.workStyle === opt.id
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <span className="text-2xl">{opt.icon}</span>
                                <div>
                                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{opt.title}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 2: Salary Target */}
                      {profStep === 2 && (
                        <div className="space-y-4">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {lang === 'en' ? '3. What starting monthly compensation do you target?' : '3. На какой начальный доход вы ориентируетесь через 2-3 года?'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'base', title: '100 000 – 150 000 ₽', desc: lang === 'en' ? 'Stable start with quick entry' : 'Стабильный уверенный старт' },
                              { id: 'high', title: '150 000 – 250 000 ₽', desc: lang === 'en' ? 'Competitive high-tech roles' : 'Высококонкурентные специальности' },
                              { id: 'ultra', title: '250 000+ ₽', desc: lang === 'en' ? 'Top-tier tech, AI & venture' : 'Элитный сегмент IT, AI и финансов' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setProfAnswers({ ...profAnswers, salary: opt.id })}
                                className={`p-5 rounded-2xl border text-center transition ${
                                  profAnswers.salary === opt.id
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mb-1">{opt.title}</div>
                                <div className="text-xs text-slate-500">{opt.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Mindset */}
                      {profStep === 3 && (
                        <div className="space-y-4">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {lang === 'en' ? '4. What is your dominant problem-solving mindset?' : '4. Какой тип мышления является вашей сильнейшей стороной?'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { id: 'analytical', title: lang === 'en' ? 'Algorithmic, math & logic' : 'Алгоритмический, математический и логический' },
                              { id: 'social', title: lang === 'en' ? 'Communication, empathy & negotiation' : 'Эмпатия, коммуникация и переговоры' },
                              { id: 'creative', title: lang === 'en' ? 'Visual, conceptual & artistic' : 'Визуальный, концептуальный и креативный' },
                              { id: 'strategic', title: lang === 'en' ? 'Risk management, enterprise & strategy' : 'Стратегический, предпринимательский и риск' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setProfAnswers({ ...profAnswers, mindset: opt.id })}
                                className={`p-4 rounded-2xl border text-left transition ${
                                  profAnswers.mindset === opt.id
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-semibold text-sm text-slate-900 dark:text-white">{opt.title}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Wizard Navigation Footer */}
                      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          disabled={profStep === 0}
                          onClick={() => setProfStep((p) => p - 1)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-40 transition"
                        >
                          {lang === 'en' ? 'Back' : 'Назад'}
                        </button>
                        <button
                          onClick={() => {
                            if (profStep < 3) {
                              setProfStep((p) => p + 1);
                            } else {
                              setProfFinished(true);
                            }
                          }}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition flex items-center gap-1.5"
                        >
                          {profStep < 3 ? (lang === 'en' ? 'Next step' : 'Следующий шаг') : (lang === 'en' ? 'Show matching professions' : 'Показать результат')}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Results screen */
                    <div className="space-y-6">
                      <div className="text-center">
                        <span className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto text-2xl mb-3">
                          ✨
                        </span>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                          {lang === 'en' ? 'Matching Professions Found (Top 3)' : 'Рекомендованные профессии (Топ 3)'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {lang === 'en'
                            ? 'Based on your parameters, these professions offer maximum salary growth and job security in 2026'
                            : 'На основе ваших параметров мы подобрали наиболее перспективные профессии с высоким доходом'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PROFESSIONS.slice(0, 3).map((prof, idx) => (
                          <div
                            key={prof.id}
                            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                  #{idx + 1} {lang === 'en' ? 'Match 96%' : 'Совпадение 96%'}
                                </span>
                                <span className="text-xs font-bold text-emerald-600">{prof.salaryMiddle}</span>
                              </div>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{prof.title}</h5>
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">{prof.description}</p>

                              <div className="text-[11px] font-semibold text-slate-400 mb-1">{lang === 'en' ? 'Required USE:' : 'Предметы ЕГЭ:'}</div>
                              <div className="flex flex-wrap gap-1 mb-4">
                                {prof.suitableExams.map((e) => (
                                  <span key={e} className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold">
                                    {e}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setActiveTool('none');
                                onNavigateTab?.('catalog');
                              }}
                              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition text-center"
                            >
                              {lang === 'en' ? 'Explore Universities' : 'Смотреть вузы'}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="text-center pt-2">
                        <button
                          onClick={() => {
                            setProfStep(0);
                            setProfFinished(false);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {lang === 'en' ? 'Restart Selection' : 'Пройти заново'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 2: Career selection based on USE               */}
              {/* ==================================================== */}
              {activeTool === 'ege' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {lang === 'en' ? 'Select your USE subjects to see unlocked careers:' : 'Выберите предметы ЕГЭ для подбора профессии:'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {lang === 'en' ? 'Russian Language is mandatory. Choose 2 or 3 additional subjects:' : 'Русский язык обязателен. Добавьте 2 или 3 профильных предмета:'}
                    </p>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'rus', label: 'Русский язык (Обязательно)', locked: true },
                      { id: 'math_prof', label: 'Профильная математика' },
                      { id: 'inf', label: 'Информатика и ИКТ' },
                      { id: 'phys', label: 'Физика' },
                      { id: 'soc', label: 'Обществознание' },
                      { id: 'chem', label: 'Химия' },
                      { id: 'bio', label: 'Биология' },
                      { id: 'foreign', label: 'Английский язык' },
                      { id: 'hist', label: 'История' },
                      { id: 'lit', label: 'Литература' },
                      { id: 'geo', label: 'География' },
                    ].map((subj) => {
                      const isSelected = selectedEge.includes(subj.id);
                      return (
                        <button
                          key={subj.id}
                          disabled={subj.locked}
                          onClick={() => {
                            if (isSelected) {
                              if (selectedEge.length > 2) {
                                setSelectedEge(selectedEge.filter((x) => x !== subj.id));
                              }
                            } else {
                              setSelectedEge([...selectedEge, subj.id]);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                          } ${subj.locked ? 'opacity-90 cursor-default' : ''}`}
                        >
                          {subj.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Matched Professions based on selected combination */}
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      {lang === 'en' ? 'Careers accessible with this combination:' : 'Профессии, доступные с данным набором ЕГЭ:'}
                    </h5>

                    <div className="space-y-3">
                      {PROFESSIONS.map((prof) => {
                        // Check exam overlap
                        const overlap = prof.suitableExams.filter((e) => selectedEge.includes(e));
                        const matchPct = Math.round((overlap.length / prof.suitableExams.length) * 100);

                        return (
                          <div
                            key={prof.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 transition"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  matchPct >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {lang === 'en' ? `Match ${matchPct}%` : `Совпадение ${matchPct}%`}
                                </span>
                                <span className="text-xs text-slate-400 font-semibold">{prof.sphere}</span>
                              </div>
                              <h6 className="font-bold text-sm text-slate-900 dark:text-white">{prof.title}</h6>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{prof.description}</p>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                              <div className="text-right">
                                <span className="text-xs font-bold text-emerald-600">{prof.salaryMiddle}</span>
                                <span className="block text-[10px] text-slate-400">{lang === 'en' ? 'Avg. salary' : 'Средняя ЗП'}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveTool('none');
                                  onNavigateTab?.('catalog');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                              >
                                {lang === 'en' ? 'Vuz Programs' : 'Вузы РФ'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 3: Selection based on school subjects          */}
              {/* ==================================================== */}
              {activeTool === 'subjects' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {lang === 'en' ? 'Choose 2 or 3 of your favorite school subjects:' : 'Выберите 2-3 ваших любимых школьных предмета:'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {lang === 'en'
                        ? 'We will analyze academic synergies and reveal high-potential future careers:'
                        : 'Алгоритм рассчитает межпредметные синергии и покажет актуальные профессии будущего:'}
                    </p>
                  </div>

                  {/* 10 Subject Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { id: 'math', label: lang === 'en' ? 'Math' : 'Математика', icon: '📐' },
                      { id: 'inf', label: lang === 'en' ? 'Computer Sci' : 'Информатика', icon: '💻' },
                      { id: 'phys', label: lang === 'en' ? 'Physics' : 'Физика', icon: '⚡' },
                      { id: 'bio', label: lang === 'en' ? 'Biology' : 'Биология', icon: '🌿' },
                      { id: 'chem', label: lang === 'en' ? 'Chemistry' : 'Химия', icon: '🧪' },
                      { id: 'soc', label: lang === 'en' ? 'Social Studies' : 'Общество', icon: '🏛️' },
                      { id: 'hist', label: lang === 'en' ? 'History' : 'История', icon: '📜' },
                      { id: 'eng', label: lang === 'en' ? 'Foreign Lang' : 'Иностр. язык', icon: '🌐' },
                      { id: 'lit', label: lang === 'en' ? 'Literature' : 'Литература', icon: '📖' },
                      { id: 'geo', label: lang === 'en' ? 'Geography' : 'География', icon: '🗺️' },
                    ].map((s) => {
                      const active = favSubjects.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (active) {
                              if (favSubjects.length > 1) {
                                setFavSubjects(favSubjects.filter((x) => x !== s.id));
                              }
                            } else {
                              if (favSubjects.length < 3) {
                                setFavSubjects([...favSubjects, s.id]);
                              } else {
                                setFavSubjects([favSubjects[1], favSubjects[2], s.id]);
                              }
                            }
                          }}
                          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                            active
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xl">{s.icon}</span>
                          <span className="text-xs font-bold">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Synergy Highlights */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {lang === 'en' ? 'Synergy Insights for Selected Subjects' : 'Карьерная синергия выбранных предметов'}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {lang === 'en'
                        ? 'Combining these subjects gives you a decisive advantage in hybrid industries like Generative AI, Quantitative Finance, and Precision Engineering.'
                        : 'Сочетание этих школьных дисциплин дает вам ключевое преимущество в гибридных отраслях: машинном обучении, биоинформатике и высокотехнологичном проектировании.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs font-bold text-blue-600 mb-1">{lang === 'en' ? 'Primary Direction' : 'Главное направление'}</div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">AI Machine Learning & Data Architecture</div>
                        <div className="text-xs text-slate-400 mt-1">{lang === 'en' ? 'Avg Salary: 250 000 ₽ • High Demand' : 'Доход: 250 000 ₽ • Высокий спрос'}</div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs font-bold text-blue-600 mb-1">{lang === 'en' ? 'Alternative Growth Track' : 'Смежный трек роста'}</div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">Applied Cybernetics & Robotics</div>
                        <div className="text-xs text-slate-400 mt-1">{lang === 'en' ? 'Avg Salary: 200 000 ₽ • Growth +35%' : 'Доход: 200 000 ₽ • Рост +35%'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 4: Klimov's career guidance test                */}
              {/* ==================================================== */}
              {activeTool === 'klimov' && (
                <div>
                  {!klimovFinished ? (
                    <div>
                      {/* Progress */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                        <span>
                          {lang === 'en'
                            ? `Question ${klimovIndex + 1} of ${KLIMOV_QUESTIONS.length}`
                            : `Вопрос ${klimovIndex + 1} из ${KLIMOV_QUESTIONS.length}`}
                        </span>
                        <span>{Math.round(((klimovIndex + 1) / KLIMOV_QUESTIONS.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-6">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((klimovIndex + 1) / KLIMOV_QUESTIONS.length) * 100}%` }}
                        />
                      </div>

                      {/* Question */}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white text-center my-6">
                        {KLIMOV_QUESTIONS[klimovIndex].question}
                      </h4>

                      {/* 2 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            const newAns = { ...klimovAnswers, [klimovIndex]: 'A' as const };
                            setKlimovAnswers(newAns);
                            if (klimovIndex < KLIMOV_QUESTIONS.length - 1) {
                              setKlimovIndex((i) => i + 1);
                            } else {
                              setKlimovFinished(true);
                            }
                          }}
                          className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition transform hover:-translate-y-0.5"
                        >
                          <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-extrabold flex items-center justify-center text-sm mb-3">
                            А
                          </span>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                            {KLIMOV_QUESTIONS[klimovIndex].optionA.text}
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            const newAns = { ...klimovAnswers, [klimovIndex]: 'B' as const };
                            setKlimovAnswers(newAns);
                            if (klimovIndex < KLIMOV_QUESTIONS.length - 1) {
                              setKlimovIndex((i) => i + 1);
                            } else {
                              setKlimovFinished(true);
                            }
                          }}
                          className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition transform hover:-translate-y-0.5"
                        >
                          <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-sm mb-3">
                            Б
                          </span>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                            {KLIMOV_QUESTIONS[klimovIndex].optionB.text}
                          </p>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Klimov Results */
                    <div className="space-y-6">
                      <div className="text-center">
                        <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                          {lang === 'en' ? 'Klimov Test Result: Sign System & Tech Dominance' : 'Результат теста Климова: Знаковая система и Техника'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                          {lang === 'en'
                            ? 'You exhibit strong affinity for abstract structures, algorithms, programming languages, and quantitative modeling.'
                            : 'У вас ярко выражена склонность к работе со знаками, кодом, математическими моделями и сложными техническими системами.'}
                        </p>
                      </div>

                      {/* Score breakdown bars */}
                      <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        {[
                          { label: lang === 'en' ? 'Man — Sign System (Code, Math, Data)' : 'Человек — Знаковая система (Код, формулы, базы)', val: 88, color: 'bg-blue-600' },
                          { label: lang === 'en' ? 'Man — Technique (Engineering, Hardware)' : 'Человек — Техника (Инженерия, приборы, роботы)', val: 74, color: 'bg-indigo-600' },
                          { label: lang === 'en' ? 'Man — Human (Leadership, Counseling)' : 'Человек — Человек (Лидерство, помощь, управление)', val: 55, color: 'bg-emerald-600' },
                          { label: lang === 'en' ? 'Man — Artistic Image (Visuals, Design)' : 'Человек — Художественный образ (Дизайн, медиа)', val: 42, color: 'bg-purple-600' },
                          { label: lang === 'en' ? 'Man — Nature (Bio, Ecology, Animals)' : 'Человек — Природа (Биосистемы, экология)', val: 30, color: 'bg-teal-600' },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              <span>{item.label}</span>
                              <span>{item.val}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center pt-2">
                        <button
                          onClick={() => {
                            setKlimovIndex(0);
                            setKlimovAnswers({});
                            setKlimovFinished(false);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {lang === 'en' ? 'Retake Test' : 'Пересдать тест Климова'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 5: One of two Binary Dilemma Battle            */}
              {/* ==================================================== */}
              {activeTool === 'one_of_two' && (
                <div>
                  {!binaryFinished ? (
                    <div>
                      {/* Scales Graphic Header */}
                      <div className="text-center mb-6">
                        <Scale className="w-10 h-10 text-blue-600 mx-auto mb-1 animate-pulse" />
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {lang === 'en'
                            ? `Round ${binaryIndex + 1} of ${BINARY_PAIRS.length}: Which calls to you more?`
                            : `Раунд ${binaryIndex + 1} из ${BINARY_PAIRS.length}: Что вам искренне ближе?`}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {lang === 'en' ? 'Make a spontaneous instinctive choice:' : 'Делайте быстрый инстинктивный выбор:'}
                        </p>
                      </div>

                      {/* Binary Choice Cards with Scales Animation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            const pair = BINARY_PAIRS[binaryIndex];
                            setBinaryScores((prev) => ({
                              ...prev,
                              [pair.catA]: (prev[pair.catA] || 0) + 1,
                            }));
                            if (binaryIndex < BINARY_PAIRS.length - 1) {
                              setBinaryIndex((i) => i + 1);
                            } else {
                              setBinaryFinished(true);
                            }
                          }}
                          className="p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 text-left transition transform hover:-translate-y-1 group"
                        >
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
                            {lang === 'en' ? 'Option 1' : 'Вариант 1'}
                          </span>
                          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                            {BINARY_PAIRS[binaryIndex].titleA}
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            const pair = BINARY_PAIRS[binaryIndex];
                            setBinaryScores((prev) => ({
                              ...prev,
                              [pair.catB]: (prev[pair.catB] || 0) + 1,
                            }));
                            if (binaryIndex < BINARY_PAIRS.length - 1) {
                              setBinaryIndex((i) => i + 1);
                            } else {
                              setBinaryFinished(true);
                            }
                          }}
                          className="p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 text-left transition transform hover:-translate-y-1 group"
                        >
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
                            {lang === 'en' ? 'Option 2' : 'Вариант 2'}
                          </span>
                          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                            {BINARY_PAIRS[binaryIndex].titleB}
                          </p>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Binary Test Finished */
                    <div className="space-y-6 text-center">
                      <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl mb-2">
                        ⚖️
                      </span>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                        {lang === 'en' ? 'Balance Test Result: High-Tech Architect' : 'Результат весов: Технологический инноватор'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {lang === 'en'
                          ? 'Through rapid binary showdowns, your scale tipped decisively toward frontier engineering and software systems.'
                          : 'В серии бинарных выборов ваши весы склонились к передовым инженерным решениям и технологическому созиданию.'}
                      </p>

                      <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 max-w-md mx-auto text-left">
                        <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
                          {lang === 'en' ? 'Your Prime Career Trio:' : 'Ваша ключевая тройка профессий:'}
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                          <li>• 1. AI/ML Deep Learning Architect (ЗП от 300 000 ₽)</li>
                          <li>• 2. Autonomous Systems Robotics Lead (ЗП от 240 000 ₽)</li>
                          <li>• 3. Quantum Computing Researcher (ЗП от 280 000 ₽)</li>
                        </ul>
                      </div>

                      <button
                        onClick={() => {
                          setBinaryIndex(0);
                          setBinaryScores({ tech: 0, bio: 0, creative: 0, business: 0, human: 0 });
                          setBinaryFinished(false);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {lang === 'en' ? 'Re-weigh on Scales' : 'Взвесить заново на весах'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
