import { AdmissionsDomainConfig, EligibilityEvaluationResult, CutoffComparisonResult } from './types';

/**
 * UniPedia Admissions Domain Model (Sri Lanka)
 * 
 * Accurately models the dual-pathway higher education landscape in Sri Lanka:
 * 1. University Grants Commission (UGC) State University Quota Pathway:
 *    - G.C.E. Advanced Level (A/L) exam year, Stream, 3 Subjects with Grades (A, B, C, S, F),
 *      General English, Common General Test (CGT), District of examination, and official Z-Score.
 *    - Selection quota system: 40% National Merit, 55% District Quota, 5% Underprivileged Districts.
 *    - Retrospective Minimum Z-scores from previous academic handbooks.
 * 2. Private & Non-State Degree Pathway:
 *    - Direct entry qualifications (A/L, London Edexcel/Cambridge, Foundation, SLQF NVQ Level 4/5),
 *      programme-specific prerequisites (e.g., Mathematics minimum for IT/Engineering),
 *      awarding university (Local vs Foreign Partner in UK/Australia), intake periods, and semester fees.
 * 
 * Strict Integrity Principle:
 * - Does NOT present historical minimum Z-scores as guaranteed admission predictions.
 * - Missing official data is left explicitly unavailable.
 */

export const unipediaAdmissionsDomain: AdmissionsDomainConfig = {
  id: 'unipedia_sri_lanka',
  countryCode: 'LK',
  countryName: {
    ru: 'Шри-Ланка (UniPedia)',
    en: 'Sri Lanka (UniPedia)',
    si: 'ශ්‍රී ලංකාව (UniPedia)',
    ta: 'இலங்கை (UniPedia)',
  },
  currency: {
    code: 'LKR',
    symbol: 'රු.',
    position: 'before',
    formatAmount: (amount: number, lang = 'si') => {
      if (lang === 'ta') return `ரூ. ${amount.toLocaleString('en-US')}`;
      if (lang === 'en') return `LKR ${amount.toLocaleString('en-US')}`;
      return `රු. ${amount.toLocaleString('en-US')}`;
    },
  },
  locale: {
    defaultLocale: 'en-LK',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'si', 'ta', 'ru'],
  },
  pathways: [
    {
      id: 'ugc_state_university',
      type: 'state_quota',
      name: {
        ru: 'Государственные университеты Шри-Ланки (UGC)',
        en: 'UGC State University Admissions Pathway',
        si: 'විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව (UGC) රාජ්‍ය විශ්වවිද්‍යාල ප්‍රවේශය',
        ta: 'பல்கலைக்கழக மானியங்கள் ஆணைக்குழு (UGC) அரச பல்கலைக்கழக சேர்க்கை',
      },
      description: {
        ru: 'Приём в государственные университеты на основе экзаменов G.C.E. A/L, Z-score и районных квот через UGC.',
        en: 'Government-funded state university allocation administered by the UGC based on G.C.E. A/L Z-Score, stream, and district quotas.',
        si: 'අ.පො.ස. උසස් පෙළ (A/L) Z-Score, විෂය ධාරාව සහ දිස්ත්‍රික් කෝටාව පදනම් කරගත් නොමිලේ උසස් අධ්‍යාපනය ලබාදෙන රාජ්‍ය විශ්වවිද්‍යාල ප්‍රවේශය.',
        ta: 'க.பொ.த. உயர்தர Z-Score, பாடத்துறை மற்றும் மாவட்ட ஒதுக்கீட்டின் அடிப்படையில் அரச பல்கலைக்கழக சேர்க்கை.',
      },
      governingAuthority: 'University Grants Commission (UGC) Sri Lanka',
      profileFields: [
        {
          id: 'examYear',
          type: 'number',
          required: true,
          label: {
            ru: 'Год сдачи A/L',
            en: 'G.C.E. A/L Examination Year',
            si: 'උසස් පෙළ (A/L) විභාග වර්ෂය',
            ta: 'க.பொ.த. உயர்தரப் பரீட்சை ஆண்டு',
          },
        },
        {
          id: 'alStream',
          type: 'select',
          required: true,
          label: {
            ru: 'Направление (Stream)',
            en: 'A/L Study Stream',
            si: 'උසස් පෙළ විෂය ධාරාව',
            ta: 'உயர்தர பாடத்துறை (Stream)',
          },
          options: [
            { value: 'physical_science', label: { ru: 'Physical Science (Maths)', en: 'Physical Science (Maths)', si: 'භෞතික විද්‍යා (ගණිත) ධාරාව', ta: 'பௌதீக விஞ்ஞானம் (கணிதம்)' } },
            { value: 'biological_science', label: { ru: 'Biological Science', en: 'Biological Science', si: 'ජීව විද්‍යා ධාරාව', ta: 'உயிரியல் விஞ்ஞானம்' } },
            { value: 'commerce', label: { ru: 'Commerce', en: 'Commerce', si: 'වාණිජ ධාරාව', ta: 'வணிகத்துறை' } },
            { value: 'arts', label: { ru: 'Arts', en: 'Arts', si: 'කලා ධාරාව', ta: 'கலைத்துறை' } },
            { value: 'engineering_technology', label: { ru: 'Engineering Technology (ET)', en: 'Engineering Technology (ET)', si: 'ඉංජිනේරු තාක්ෂණවේදය (ET)', ta: 'பொறியியல் தொழில்நுட்பம் (ET)' } },
            { value: 'biosystems_technology', label: { ru: 'Bio-systems Technology (BST)', en: 'Bio-systems Technology (BST)', si: 'ජෛව පද්ධති තාක්ෂණවේදය (BST)', ta: 'உயிர்ப்பদ্ধதிகள் தொழில்நுட்பம்' } },
          ],
        },
        {
          id: 'district',
          type: 'select',
          required: true,
          label: {
            ru: 'Район сдачи экзамена (District)',
            en: 'Administrative Examination District',
            si: 'විභාගයට පෙනී සිටි දිස්ත්‍රික්කය',
            ta: 'பரீட்சைக்குத் தோற்றிய மாவட்டம்',
          },
          options: [
            { value: 'colombo', label: { ru: 'Colombo', en: 'Colombo', si: 'කොළඹ', ta: 'கொழும்பு' } },
            { value: 'gampaha', label: { ru: 'Gampaha', en: 'Gampaha', si: 'ගම්පහ', ta: 'கம்பஹா' } },
            { value: 'kalutara', label: { ru: 'Kalutara', en: 'Kalutara', si: 'කළුතර', ta: 'களுத்துறை' } },
            { value: 'kandy', label: { ru: 'Kandy', en: 'Kandy', si: 'මහනුවර', ta: 'கண்டி' } },
            { value: 'galle', label: { ru: 'Galle', en: 'Galle', si: 'ගාල්ල', ta: 'காலி' } },
            { value: 'jaffna', label: { ru: 'Jaffna', en: 'Jaffna', si: 'යාපනය', ta: 'யாழ்ப்பாணம்' } },
            { value: 'batticaloa', label: { ru: 'Batticaloa', en: 'Batticaloa', si: 'මඩකලපුව', ta: 'மட்டக்களப்பு' } },
            { value: 'kurunegala', label: { ru: 'Kurunegala', en: 'Kurunegala', si: 'කුරුණෑගල', ta: 'குருணாகல்' } },
            { value: 'badulla', label: { ru: 'Badulla', en: 'Badulla', si: 'බදුල්ල', ta: 'பதுளை' } },
            { value: 'anuradhapura', label: { ru: 'Anuradhapura', en: 'Anuradhapura', si: 'අනුරාධපුරය', ta: 'அனுராதபுரம்' } },
          ],
        },
        {
          id: 'zScore',
          type: 'number',
          required: true,
          label: {
            ru: 'Итоговый Z-Score',
            en: 'Official A/L Z-Score',
            si: 'නිල Z-Score අගය',
            ta: 'அதிகாரப்பூர்வ Z-Score',
          },
          helperText: {
            ru: 'Значение Z-Score из официальной ведомости Департамента экзаменов Шри-Ланки.',
            en: 'Z-score value issued by the Department of Examinations Sri Lanka.',
            si: 'ශ්‍රී ලංකා විභාග දෙපාර්තමේන්තුව විසින් නිකුත් කරන ලද නිල Z-ලකුණ.',
            ta: 'இலங்கை பரீட்சைத் திணைக்களத்தால் வழங்கப்பட்ட உத்தியோகபூர்வ Z-Score.',
          },
        },
        {
          id: 'cgtScore',
          type: 'number',
          required: false,
          label: {
            ru: 'Common General Test (CGT)',
            en: 'Common General Test Score (min 30)',
            si: 'පොදු සාමාන්‍ය පරීක්ෂණය (අවම ලකුණු 30)',
            ta: 'பொதுப் பொதுத் தேர்வுப் புள்ளி (குறைந்தது 30)',
          },
        },
      ],
      eligibilityNotes: {
        ru: 'Минимум 3 оценки "S" в утверждённой комбинации предметов + не менее 30 баллов по CGT.',
        en: 'Minimum of 3 "S" passes in an approved subject combination in one sitting, plus min. 30 in Common General Test.',
        si: 'එක් වරකදී අනුමත විෂය සංකලනයකින් අවම වශයෙන් "S" සාමාර්ථ 3ක් සහ පොදු සාමාන්‍ය පරීක්ෂණයෙන් ලකුණු 30ක් ලබාගත යුතුය.',
        ta: 'ஒரே அமர்வில் அங்கீகரிக்கப்பட்ட பாடச் சேர்க்கையில் குறைந்தது 3 "S" சித்திகளும் பொதுத் தேர்வில் 30 புள்ளிகளும் தேவை.',
      },
    },
    {
      id: 'private_non_state',
      type: 'private_non_state',
      name: {
        ru: 'Негосударственные институты и зарубежные дипломы',
        en: 'Non-State & Private Degree Pathway (SLQF & Transnational)',
        si: 'රාජ්‍ය නොවන උසස් අධ්‍යාපන සහ විදේශීය උපාධි පාඨමාලා',
        ta: 'அரச சார்பற்ற உயர்கல்வி மற்றும் வெளிநாட்டுப் பட்டப்படிப்புகள்',
      },
      description: {
        ru: 'Программы высшего образования в аккредитованных институтах Шри-Ланки (SLIIT, NSBM, IIT, CINEC и др.) и зарубежные франшизы.',
        en: 'Degree programs offered by Ministry-recognized non-state institutes and transnational university partner campuses.',
        si: 'අධ්‍යාපන අමාත්‍යාංශයේ පිළිගත් රාජ්‍ය නොවන ආයතන (SLIIT, NSBM, IIT ආදී) සහ විදේශීය විශ්වවිද්‍යාල උපාධි පාඨමාලා.',
        ta: 'கல்வி அமைச்சினால் அங்கீகரிக்கப்பட்ட அரச சார்பற்ற நிறுவனங்கள் மற்றும் வெளிநாட்டுப் பல்கலைக்கழகப் பட்டங்கள்.',
      },
      governingAuthority: 'Ministry of Education (Non-State Higher Education Division) & SLQF',
      profileFields: [
        {
          id: 'entryQualification',
          type: 'select',
          required: true,
          label: {
            ru: 'Входная квалификация',
            en: 'Entry Qualification',
            si: 'ප්‍රවේශ සුදුසුකම',
            ta: 'நுழைவுத் தகுதி',
          },
          options: [
            { value: 'al_local', label: { ru: 'G.C.E. A/L (Sri Lanka)', en: 'Local G.C.E. A/L', si: 'දේශීය උසස් පෙළ (A/L)', ta: 'உள்நாட்டு க.பொ.த. உயர்தரம்' } },
            { value: 'al_london', label: { ru: 'Cambridge / Edexcel A-Levels', en: 'Cambridge / Edexcel A-Levels', si: 'ලන්ඩන් (Cambridge / Edexcel) A/L', ta: 'லண்டன் A-Levels' } },
            { value: 'foundation_slqf3', label: { ru: 'Recognized Foundation Diploma (SLQF 3)', en: 'Recognized University Foundation (SLQF 3)', si: 'පිළිගත් Foundation ඩිප්ලෝමාව', ta: 'அங்கீகரிக்கப்பட்ட Foundation டிப்ளோமா' } },
            { value: 'tvec_nvq', label: { ru: 'TVEC NVQ Level 4 / 5', en: 'TVEC NVQ Level 4 / 5 Qualification', si: 'වෘත්තීය NVQ 4/5 මට්ටම', ta: 'NVQ மட்டம் 4 / 5' } },
          ],
        },
        {
          id: 'awardingInstitutionType',
          type: 'select',
          required: true,
          label: {
            ru: 'Тип диплома',
            en: 'Awarding Degree Body',
            si: 'උපාධිය පිරිනමන ආයතනය',
            ta: 'பட்டம் வழங்கும் நிறுவனம்',
          },
          options: [
            { value: 'local_degree_awarding', label: { ru: 'Accredited Sri Lankan Degree (Ministry Recognized)', en: 'Sri Lankan Ministry Accredited Degree', si: 'දේශීය අමාත්‍යාංශ පිළිගත් උපාධිය', ta: 'இலங்கை அமைச்சு அங்கீகரித்த பட்டம்' } },
            { value: 'foreign_partner_uk_aus', label: { ru: 'Foreign University Partner (UK / Australia / Ireland)', en: 'Foreign Partner University (UK / Australia)', si: 'විදේශීය (එක්සත් රාජධානිය/ඕස්ට්‍රේලියාව) විශ්වවිද්‍යාල උපාධිය', ta: 'வெளிநாட்டுப் பல்கலைக்கழகப் பட்டம்' } },
          ],
        },
        {
          id: 'annualFeeLkr',
          type: 'number',
          required: false,
          label: {
            ru: 'Бюджет обучения (LKR / год)',
            en: 'Annual Tuition Budget (LKR)',
            si: 'වාර්ෂික ගාස්තු සීමාව (රුපියල්)',
            ta: 'வருடாந்த கட்டண வரம்பு (LKR)',
          },
        },
      ],
      eligibilityNotes: {
        ru: 'Входные требования определяются институтом и комиссией SLQF (обычно 2-3 проходных балла A/L или Foundation).',
        en: 'Program-specific requirements set by the awarding body according to SLQF guidelines (typically 2-3 passes or recognized foundation).',
        si: 'SLQF මාර්ගෝපදේශ සහ අදාළ ආයතනයේ නීති අනුව තීරණය වේ (සාමාන්‍යයෙන් A/L සාමාර්ථ 2-3ක් හෝ පිළිගත් Foundation එකක්).',
        ta: 'SLQF வழிகாட்டுதலின்படி நிறுவனத்தால் தீர்மானிக்கப்படும் (பொதுவாக 2-3 உயர்தர சித்திகள் அல்லது Foundation).',
      },
    },
  ],
  sourceDocuments: [
    {
      id: 'doc-ugc-handbook',
      title: 'Admission to Undergraduate Courses in Universities in Sri Lanka (UGC Handbook)',
      publisher: 'University Grants Commission (UGC) Sri Lanka',
      applicableYear: 2025,
      officialUrl: 'https://www.ugc.ac.lk/',
      isVerified: true,
      notes: 'Official state university course guidelines, minimum qualification criteria, and quota specifications.',
    },
    {
      id: 'doc-moe-nonstate-registry',
      title: 'Official Register of Specified Non-State Higher Education Degree Awarding Institutes',
      publisher: 'Ministry of Education (Non-State Higher Education Division)',
      applicableYear: 2025,
      officialUrl: 'https://moe.gov.lk/',
      isVerified: true,
      notes: 'Legislative orders specifying degree awarding status under Section 25A of the Universities Act.',
    },
  ],
  actionMappings: {
    compare: 'compare',
    comparison: 'compare',
    calculator: 'calculator',
    zscore_calculator: 'calculator',
    courses: 'programs',
    catalog: 'catalog',
    institutes: 'catalog',
    student_budget: 'student_budget',
  },
  terminology: {
    examName: {
      ru: 'G.C.E. Advanced Level (A/L)',
      en: 'G.C.E. Advanced Level (A/L)',
      si: 'අ.පො.ස. උසස් පෙළ (A/L)',
      ta: 'க.பொ.த. உயர்தரம் (A/L)',
    },
    quotaName: {
      ru: 'Квота государственного университета (UGC)',
      en: 'UGC State University Quota',
      si: 'රාජ්‍ය විශ්වවිද්‍යාල ප්‍රවේශ ආසන',
      ta: 'அரச பல்கலைக்கழக சேர்க்கை இடங்கள்',
    },
    dormitoryName: {
      ru: 'Университетское общежитие (Hostel)',
      en: 'University Hostel Accommodation',
      si: 'විශ්වවිද්‍යාල නේවාසිකාගාරය (Hostel)',
      ta: 'பல்கலைக்கழக விடுதி (Hostel)',
    },
    militaryCenter: {
      ru: 'Военная подготовка (KDU / ROTC)',
      en: 'Defence University / Cadetship (KDU)',
      si: 'ආරක්ෂක අධ්‍යයන / කැඩෙට් (KDU)',
      ta: 'பாதுகாப்புப் பல்கலைக்கழகம் (KDU)',
    },
  },
  evaluateEligibility: (profile: any) => {
    if (!profile) {
      return {
        status: 'missing_official_data',
        reasons: ['No student qualifications recorded.'],
        missingFields: ['alStream', 'subjects', 'district'],
        applicableRules: ['UGC Handbook Minimum Admission Requirements'],
        disclaimer: 'Admissions eligibility cannot be evaluated without official exam results.',
      };
    }

    // UGC State University Pathway evaluation
    if (profile.zScore !== undefined && profile.zScore !== null) {
      if (typeof profile.zScore === 'number' && profile.zScore < 0.5) {
        return {
          status: 'requires_clarification',
          reasons: [
            'A low or negative Z-Score typically limits selection for high-demand state university courses.',
          ],
          missingFields: [],
          applicableRules: ['UGC Quota Merit Allocation Rules'],
          disclaimer:
            'Selection depends heavily on your district quota and stream ranking. Review private and non-state alternatives.',
        };
      }
      return {
        status: 'eligible',
        reasons: ['Valid Z-score and exam profile registered for state quota evaluation.'],
        missingFields: [],
        applicableRules: ['UGC Admission Handbook (Rule 4: Selection Criteria)'],
        disclaimer:
          'State university selection depends on merit (40%), district quota (55%), and special underprivileged quotas (5%).',
      };
    }

    return {
      status: 'requires_clarification',
      reasons: ['Please specify your official A/L Z-Score and examination district.'],
      missingFields: ['zScore', 'district'],
      applicableRules: ['UGC Admission Regulations'],
      disclaimer: 'Official Z-Scores are mandatory for Sri Lankan state university evaluation.',
    };
  },
  compareCutoffs: (studentScoreOrZ: any, historicalThreshold: any, year = 2024) => {
    const studentZ = Number(studentScoreOrZ);
    const thresholdZ = Number(historicalThreshold);

    if (isNaN(studentZ) || isNaN(thresholdZ)) {
      return {
        metricName: 'Minimum Z-Score',
        metricType: 'z_score',
        historicalYear: year,
        historicalThreshold: isNaN(thresholdZ) ? undefined : thresholdZ,
        studentValue: isNaN(studentZ) ? undefined : studentZ,
        status: 'unavailable',
        explanation: 'Official historical minimum Z-score is not available for this course and district.',
        disclaimer: 'Do not extrapolate cutoffs. Check the official UGC Cutoff Gazette.',
      };
    }

    const diff = Number((studentZ - thresholdZ).toFixed(4));
    return {
      metricName: 'Minimum Z-Score',
      metricType: 'z_score',
      historicalYear: year,
      historicalThreshold: thresholdZ,
      studentValue: studentZ,
      status: diff >= 0 ? 'above_historical' : 'below_historical',
      explanation:
        diff >= 0
          ? `Your Z-Score (${studentZ}) is higher than or equal to the ${year} minimum cutoff (${thresholdZ}) by +${diff}.`
          : `Your Z-Score (${studentZ}) is lower than the ${year} minimum cutoff (${thresholdZ}) by ${diff}.`,
      disclaimer:
        'IMPORTANT: Historical minimum Z-scores are retrospective benchmarks determined by past quota allocations. They do NOT guarantee admission for upcoming academic years.',
    };
  },
};
