import { AdmissionsDomainConfig } from './types';
import { SupportedLanguage } from '../i18n';

export const russiaAdmissionsDomain: AdmissionsDomainConfig = {
  id: 'russia_higher_education',
  countryCode: 'RU',
  countryName: {
    ru: 'Российская Федерация',
    en: 'Russian Federation',
    si: 'රුසියානු සමූහාණ්ඩුව',
    ta: 'ரஷ்ய கூட்டமைப்பு',
  },
  currency: {
    code: 'RUB',
    symbol: '₽',
    position: 'after',
    formatAmount: (amount: number) => `${amount.toLocaleString('ru-RU')} ₽/год`,
  },
  locale: {
    defaultLocale: 'ru-RU',
    defaultLanguage: 'ru',
    supportedLanguages: ['ru', 'en', 'si', 'ta'],
  },
  pathways: [
    {
      id: 'ege_budget_state',
      type: 'state_quota',
      name: {
        ru: 'Бюджетный конкурс по результатам ЕГЭ',
        en: 'State Funded Budget Competition (USE / ЕГЭ)',
        si: 'රාජ්‍ය ප්‍රතිපාදන සහිත විශ්වවිද්‍යාල ප්‍රවේශය (ЕГЭ)',
        ta: 'அரசு மானியப் பல்கலைக்கழக சேர்க்கை (ЕГЭ)',
      },
      description: {
        ru: 'Конкурс на бюджетные места по сумме баллов 3-4 предметов ЕГЭ и индивидуальных достижений.',
        en: 'Merit-based competition for state-funded places using USE exam scores and personal achievements.',
        si: 'රාජ්‍ය අරමුදල් සහිත විශ්වවිද්‍යාල ආසන සඳහා ලකුණු මත පදනම් වූ තරගකාරී ප්‍රවේශය.',
        ta: 'தேர்வுப் புள்ளிகள் அடிப்படையில் அரசு நிதியுதவி பெறும் இடங்களுக்கான சேர்க்கை.',
      },
      governingAuthority: 'Минобрнауки РФ (Приказ №1076)',
      profileFields: [
        {
          id: 'educationContext',
          type: 'select',
          required: true,
          label: {
            ru: 'Образовательный статус',
            en: 'Educational Status',
            si: 'අධ්‍යාපනික මට්ටම',
            ta: 'கல்வி நிலை',
          },
          options: [
            { value: 'school_11', label: { ru: '11 класс', en: '11th Grade', si: '11 ශ්‍රේණිය', ta: '11 ஆம் வகுப்பு' } },
            { value: 'college_spo', label: { ru: 'Диплом СПО / колледж', en: 'College / Vocational Diploma', si: 'වෘත්තීය ඩිප්ලෝමා (SPO)', ta: 'தொழில்நுட்ப டிப்ளோமா' } },
            { value: 'graduate_past_years', label: { ru: 'Выпускник прошлых лет', en: 'Past Graduate', si: 'පෙර වසරවල උපාධිධාරී', ta: 'முந்தைய பட்டதாரி' } },
          ],
        },
        {
          id: 'subjects',
          type: 'grade_list',
          required: true,
          label: {
            ru: 'Предметы и баллы ЕГЭ',
            en: 'USE Exam Subjects & Scores',
            si: 'විභාග විෂයයන් සහ ලකුණු',
            ta: 'தேர்வுப் பாடங்கள் மற்றும் புள்ளிகள்',
          },
        },
      ],
      eligibilityNotes: {
        ru: 'Требуется преодоление минимальных пороговых баллов Минобрнауки по каждому предмету.',
        en: 'Requires meeting the Ministry minimum score thresholds for every subject.',
        si: 'සෑම විෂයයක් සඳහාම අමාත්‍යාංශය නියම කළ අවම ලකුණු සීමාව ඉක්මවිය යුතුය.',
        ta: 'ஒவ்வொரு பாடத்திற்கும் அமைச்சு நிர்ணயித்த ஆகக்குறைந்த புள்ளிகளைப் பெற வேண்டும்.',
      },
    },
    {
      id: 'paid_commercial_loan',
      type: 'private_non_state',
      name: {
        ru: 'Платное обучение (в т.ч. льготный кредит 3%)',
        en: 'Commercial Contract Tuition (incl. 3% Subsidized Loan)',
        si: 'ගෙවීම් සහිත පාඨමාලා (3% ශිෂ්‍ය ණය සහන සහිතව)',
        ta: 'கட்டணப் படிப்பு (3% மானியக் கடனுடன்)',
      },
      description: {
        ru: 'Обучение по договору с оплатой стоимости обучения за счет собственных средств или господдержки 3%.',
        en: 'Tuition contract paid via personal funds or state-subsidized 3% education loan (Decree №1448).',
        si: 'පුද්ගලික වියදමින් හෝ රජයේ 3% ශිෂ්‍ය ණය යටතේ ගෙවීම් කර හදාරන පාඨමාලා.',
        ta: 'சொந்த நிதியிலோ அல்லது 3% அரச கல்விக் கடனிலோ பயிலும் படிப்புகள்.',
      },
      governingAuthority: 'Постановление Правительства РФ №1448',
      profileFields: [
        {
          id: 'budgetConstraint',
          type: 'select',
          required: true,
          label: {
            ru: 'Финансовые условия',
            en: 'Financial Condition',
            si: 'මූල්‍ය තත්ත්වය',
            ta: 'நிதி நிலை',
          },
          options: [
            { value: 'only_budget', label: { ru: 'Только бюджет', en: 'Budget only', si: 'ශිෂ්‍යත්ව/රජයේ වියදමින් පමණි', ta: 'அரசு உதவி மட்டும்' } },
            { value: 'paid_with_loan', label: { ru: 'Платное с кредитом 3%', en: 'Paid with 3% loan', si: '3% ණය පහසුකම් සහිතව', ta: '3% கடனுடன்' } },
            { value: 'paid_direct', label: { ru: 'Платное без кредита', en: 'Direct tuition payment', si: 'සෘජු ගෙවීම්', ta: 'நேரடி கட்டணம்' } },
          ],
        },
      ],
      eligibilityNotes: {
        ru: 'Требуется заключение официального договора с вузом и соответствие минимальным баллам для контракта.',
        en: 'Requires an official institutional contract and meeting contractual minimum score thresholds.',
        si: 'විශ්වවිද්‍යාලය සමඟ නිල ගිවිසුමක් සහ ගෙවීම් පාඨමාලාවේ අවම ලකුණු සපුරාලිය යුතුය.',
        ta: 'பல்கலைக்கழகத்துடன் முறையான ஒப்பந்தமும் கட்டணப் படிப்புக்கான குறைந்தபட்ச புள்ளிகளும் தேவை.',
      },
    },
  ],
  sourceDocuments: [
    {
      id: 'doc-minobrnauki-1076',
      title: 'Порядок приема на обучение по образовательным программам высшего образования (Приказ №1076)',
      publisher: 'Минобрнауки РФ',
      applicableYear: 2026,
      officialUrl: 'http://publication.pravo.gov.ru/',
      isVerified: true,
      notes: 'Федеральный регламент сроков и процедур приёма 2026 года.',
    },
    {
      id: 'doc-rf-gov-1448',
      title: 'Государственная поддержка образовательного кредитования (Постановление №1448)',
      publisher: 'Правительство РФ',
      applicableYear: 2026,
      officialUrl: 'http://government.ru/',
      isVerified: true,
      notes: 'Субсидирование процентной ставки до 3% годовых через ПАО Сбербанк.',
    },
  ],
  actionMappings: {
    compare: 'compare',
    comparison: 'compare',
    calculator: 'calculator',
    ege: 'calculator',
    student_budget: 'student_budget',
    budget: 'student_budget',
    credit: 'credit',
    achievements: 'achievements',
    programs: 'programs',
    catalog: 'catalog',
    spo: 'spo',
  },
  terminology: {
    examName: {
      ru: 'ЕГЭ (Единый государственный экзамен)',
      en: 'USE (Unified State Exam)',
      si: 'ЕГЭ (රාජ්‍ය ඒකාබද්ධ විභාගය)',
      ta: 'ЕГЭ (ஒருங்கிணைந்த அரசுத் தேர்வு)',
    },
    quotaName: {
      ru: 'Бюджетные места',
      en: 'State-Funded Places',
      si: 'රාජ්‍ය අනුග්‍රහය ලත් ස්ථාන',
      ta: 'அரசு உதவிபெறும் இடங்கள்',
    },
    dormitoryName: {
      ru: 'Студенческое общежитие',
      en: 'Student Dormitory / Hostel',
      si: 'නේවාසිකාගාරය (Hostel)',
      ta: 'மாணவர் விடுதி (Hostel)',
    },
    militaryCenter: {
      ru: 'Военный учебный центр (ВУЦ)',
      en: 'Military Training Center (VUC)',
      si: 'හමුදා පුහුණු අංශය (VUC)',
      ta: 'இராணுவப் பயிற்சிப் பிரிவு (VUC)',
    },
  },
  evaluateEligibility: (profile: any) => {
    if (!profile) {
      return {
        status: 'missing_official_data',
        reasons: ['Профиль абитуриента не заполнен.'],
        missingFields: ['subjects', 'educationContext'],
        applicableRules: ['Приказ Минобрнауки РФ №1076'],
        disclaimer: 'Оценка носит ориентировочный характер на основе предоставленных данных.',
      };
    }
    const hasSubjects = Array.isArray(profile.subjects) && profile.subjects.length >= 3;
    if (!hasSubjects) {
      return {
        status: 'requires_clarification',
        reasons: ['Для большинства направлений требуется не менее 3 предметов ЕГЭ.'],
        missingFields: ['subjects'],
        applicableRules: ['Перечень вступительных испытаний Минобрнауки РФ'],
        disclaimer: 'Точный перечень предметов зависит от выбранного направления подготовки.',
      };
    }
    return {
      status: 'eligible',
      reasons: ['Предоставлен полный комплект из 3+ предметов.'],
      missingFields: [],
      applicableRules: ['Приказ Минобрнауки РФ №1076'],
      disclaimer: 'Допуск к конкурсу зависит от преодоления минимальных порогов каждого вуза.',
    };
  },
  compareCutoffs: (studentScore: any, historicalThreshold: any, year = 2025) => {
    const scoreNum = Number(studentScore);
    const thresholdNum = Number(historicalThreshold);
    if (!scoreNum || !thresholdNum) {
      return {
        metricName: 'Сумма баллов ЕГЭ',
        metricType: 'total_points',
        historicalYear: year,
        historicalThreshold: thresholdNum || undefined,
        studentValue: scoreNum || undefined,
        status: 'unavailable',
        explanation: 'Недостаточно данных для сопоставления с проходным баллом.',
        disclaimer: 'Проходные баллы определяются по факту завершения приёма и не могут быть гарантированы заранее.',
      };
    }
    const diff = scoreNum - thresholdNum;
    return {
      metricName: 'Сумма баллов ЕГЭ',
      metricType: 'total_points',
      historicalYear: year,
      historicalThreshold: thresholdNum,
      studentValue: scoreNum,
      status: diff >= 0 ? 'above_historical' : 'below_historical',
      explanation:
        diff >= 0
          ? `Ваш балл (${scoreNum}) выше или равен проходному баллу ${year} года (${thresholdNum}) на ${diff} б.`
          : `Ваш балл (${scoreNum}) ниже проходного балла ${year} года (${thresholdNum}) на ${Math.abs(diff)} б.`,
      disclaimer:
        'Внимание: Проходной балл прошлых лет является ретроспективной статистикой и не гарантирует зачисление в 2026 году.',
    };
  },
};
