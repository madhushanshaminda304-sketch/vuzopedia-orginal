export interface WorkObject {
  id: string;
  nameEn: string;
  nameRu: string;
  icon: string;
}

export interface WorkActivity {
  id: string;
  nameEn: string;
  nameRu: string;
  icon: string;
}

export interface ExtendedProfession {
  id: string;
  titleEn: string;
  titleRu: string;
  vuzCount: number;
  ssuzCount: number;
  imageUrl: string;
  hasBudgetChance: boolean;
  salaryAvg: string;
  sphereEn: string;
  sphereRu: string;
  descriptionEn: string;
  descriptionRu: string;
  suitableExams: string[];
  schoolSubjects: string[];
  workObjectId: string;
  activityId: string;
}

export const WORK_OBJECTS: WorkObject[] = [
  { id: 'animals', nameEn: 'ANIMALS', nameRu: 'ЖИВОТНЫЕ', icon: '🐕' },
  { id: 'human', nameEn: 'HUMAN', nameRu: 'ЧЕЛОВЕК', icon: '👤' },
  { id: 'finance', nameEn: 'FINANCE', nameRu: 'ФИНАНСЫ', icon: '💳' },
  { id: 'art', nameEn: 'ART', nameRu: 'ИСКУССТВО', icon: '🎨' },
  { id: 'plants', nameEn: 'PLANTS', nameRu: 'РАСТЕНИЯ', icon: '🌱' },
  { id: 'products', nameEn: 'PRODUCTS', nameRu: 'ТОВАРЫ', icon: '🛍️' },
  { id: 'information', nameEn: 'INFORMATION', nameRu: 'ИНФОРМАЦИЯ', icon: '📊' },
  { id: 'technique', nameEn: 'TECHNIQUE', nameRu: 'ТЕХНИКА', icon: '🚢' },
  { id: 'natural_resources', nameEn: 'NATURAL RESOURCES', nameRu: 'ПРИРОДНЫЕ РЕСУРСЫ', icon: '⛰️' },
  { id: 'food_medicine', nameEn: 'FOOD AND MEDICINE', nameRu: 'ЕДА И МЕДИЦИНА', icon: '💊' },
];

export const WORK_ACTIVITIES: WorkActivity[] = [
  { id: 'control', nameEn: 'CONTROL', nameRu: 'УПРАВЛЕНИЕ', icon: '💼' },
  { id: 'service', nameEn: 'SERVICE', nameRu: 'ОБСЛУЖИВАНИЕ', icon: '🤝' },
  { id: 'education', nameEn: 'EDUCATION', nameRu: 'ОБРАЗОВАНИЕ', icon: '📚' },
  { id: 'health', nameEn: 'HEALTH IMPROVEMENT', nameRu: 'ОЗДОРОВЛЕНИЕ', icon: '❤️' },
  { id: 'creation', nameEn: 'CREATION', nameRu: 'ТВОРЧЕСТВО', icon: '🖌️' },
  { id: 'production', nameEn: 'PRODUCTION', nameRu: 'ПРОИЗВОДСТВО', icon: '⚙️' },
  { id: 'design', nameEn: 'DESIGN', nameRu: 'ПРОЕКТИРОВАНИЕ', icon: '📐' },
  { id: 'study', nameEn: 'STUDY', nameRu: 'ИССЛЕДОВАНИЕ', icon: '🔬' },
  { id: 'protection', nameEn: 'PROTECTION', nameRu: 'ЗАЩИТА', icon: '🛡️' },
  { id: 'inspection', nameEn: 'INSPECTION / CONTROL', nameRu: 'КОНТРОЛЬ', icon: '🔭' },
];

export const EXTENDED_PROFESSIONS: ExtendedProfession[] = [
  {
    id: 'cultural-organizer',
    titleEn: 'Cultural organizer',
    titleRu: 'Культорганизатор',
    vuzCount: 127,
    ssuzCount: 110,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '75 000 ₽',
    sphereEn: 'Culture & Event Management',
    sphereRu: 'Культура и организация мероприятий',
    descriptionEn: 'Develops cultural programs, community festivals, theatre performances, and interactive public shows.',
    descriptionRu: 'Разрабатывает сценарии и организует проведение праздников, фестивалей, концертных программ и культурных акций.',
    suitableExams: ['rus', 'soc', 'lit'],
    schoolSubjects: ['lit', 'hist', 'soc'],
    workObjectId: 'art',
    activityId: 'control',
  },
  {
    id: 'curator-exhibitions',
    titleEn: 'Curator of multimedia exhibitions',
    titleRu: 'Куратор мультимедийных выставок',
    vuzCount: 92,
    ssuzCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '110 000 ₽',
    sphereEn: 'Digital Art & Museum Studies',
    sphereRu: 'Цифровое искусство и музейное дело',
    descriptionEn: 'Curates digital art spaces, VR museum experiences, and interactive contemporary exhibitions.',
    descriptionRu: 'Создает концепции иммерсивных музейных пространств, объединяя световые инсталляции, цифровое искусство и историю.',
    suitableExams: ['rus', 'soc', 'inf'],
    schoolSubjects: ['lit', 'inf', 'hist'],
    workObjectId: 'art',
    activityId: 'control',
  },
  {
    id: 'social-cultural-manager',
    titleEn: 'Manager of social and cultural activities',
    titleRu: 'Менеджер социально-культурной деятельности',
    vuzCount: 128,
    ssuzCount: 110,
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '85 000 ₽',
    sphereEn: 'Social & Cultural Management',
    sphereRu: 'Социально-культурный менеджмент',
    descriptionEn: 'Coordinates large-scale educational, creative, and municipal community projects.',
    descriptionRu: 'Руководит центрами творчества, координирует работу кружков, студий и городских просветительских программ.',
    suitableExams: ['rus', 'soc', 'hist'],
    schoolSubjects: ['soc', 'hist', 'lit'],
    workObjectId: 'art',
    activityId: 'control',
  },
  {
    id: 'musical-theatre-director',
    titleEn: 'Musical theatre director (musical director)',
    titleRu: 'Режиссер музыкального театра',
    vuzCount: 70,
    ssuzCount: 215,
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '120 000 ₽',
    sphereEn: 'Theatre & Performing Arts',
    sphereRu: 'Театр и музыкальное искусство',
    descriptionEn: 'Directs operas, musicals, and operettas, fusing stagecraft, choreography, and vocal performance.',
    descriptionRu: 'Осуществляет художественную постановку музыкальных спектаклей, опер и мюзиклов, руководит актерским составом.',
    suitableExams: ['rus', 'lit', 'creative'],
    schoolSubjects: ['lit', 'music', 'hist'],
    workObjectId: 'art',
    activityId: 'creation',
  },
  {
    id: 'art-studio-head',
    titleEn: 'Head of the art studio',
    titleRu: 'Руководитель художественной студии',
    vuzCount: 452,
    ssuzCount: 959,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '95 000 ₽',
    sphereEn: 'Visual Arts & Education',
    sphereRu: 'Изобразительное искусство и студийное руководство',
    descriptionEn: 'Manages fine art education, painting workshops, and sculpture studios for all age groups.',
    descriptionRu: 'Организует учебный и творческий процесс в художественной мастерской, обучает живописи и композиции.',
    suitableExams: ['rus', 'lit', 'creative'],
    schoolSubjects: ['izo', 'lit', 'hist'],
    workObjectId: 'art',
    activityId: 'education',
  },
  {
    id: 'artistic-chaser',
    titleEn: 'Chaser of artistic products',
    titleRu: 'Чеканщик художественных изделий',
    vuzCount: 31,
    ssuzCount: 13,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '80 000 ₽',
    sphereEn: 'Artisan Crafts & Metallurgy',
    sphereRu: 'Художественная обработка металлов',
    descriptionEn: 'Crafts bespoke metal reliefs, decorative panels, and architectural ornaments using traditional chasing techniques.',
    descriptionRu: 'Выполняет рельефные художественные изображения на листовом металле для архитектурных и ювелирных изделий.',
    suitableExams: ['rus', 'math_prof', 'creative'],
    schoolSubjects: ['cherch', 'izo', 'phys'],
    workObjectId: 'art',
    activityId: 'production',
  },
  {
    id: 'theatre-producer',
    titleEn: 'Theatre manager, theatre producer, troupe manager',
    titleRu: 'Театральный менеджер, продюсер',
    vuzCount: 82,
    ssuzCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '150 000 ₽',
    sphereEn: 'Theatre Management & Production',
    sphereRu: 'Продюсирование и театральный менеджмент',
    descriptionEn: 'Oversees financial budgeting, commercial touring, PR campaigns, and contractual negotiations for theatres.',
    descriptionRu: 'Формирует репертуарную политику, привлекает финансирование, организует гастроли и промо-кампании труппы.',
    suitableExams: ['rus', 'soc', 'lit'],
    schoolSubjects: ['soc', 'econ', 'lit'],
    workObjectId: 'art',
    activityId: 'control',
  },
  {
    id: 'speech-therapist',
    titleEn: 'Speech therapist / Defectologist',
    titleRu: 'Дефектолог / Логопед',
    vuzCount: 155,
    ssuzCount: 212,
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '90 000 ₽',
    sphereEn: 'Special Education & Rehabilitation',
    sphereRu: 'Специальное образование и коррекционная педагогика',
    descriptionEn: 'Helps children and adults overcome speech impairments, cognitive delays, and motor difficulties.',
    descriptionRu: 'Оказывает помощь детям и взрослым с нарушениями речи и развития, восстанавливает речевые функции.',
    suitableExams: ['rus', 'bio', 'soc'],
    schoolSubjects: ['rus', 'bio', 'psy'],
    workObjectId: 'human',
    activityId: 'health',
  },
  {
    id: 'geographer',
    titleEn: 'Geographer / Cartographer',
    titleRu: 'Географ / Картограф',
    vuzCount: 116,
    ssuzCount: 48,
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '105 000 ₽',
    sphereEn: 'Earth Sciences & GIS',
    sphereRu: 'Науки о Земле и геоинформационные системы (ГИС)',
    descriptionEn: 'Analyzes spatial geographic data, satellite imagery, climate change impacts, and natural hazard zones.',
    descriptionRu: 'Исследует природно-климатические процессы, строит цифровые модели рельефа и геоинформационные карты.',
    suitableExams: ['rus', 'geo', 'math_prof'],
    schoolSubjects: ['geo', 'math', 'inf'],
    workObjectId: 'natural_resources',
    activityId: 'study',
  },
  {
    id: 'teacher',
    titleEn: 'Teacher / Educator',
    titleRu: 'Учитель / Педагог',
    vuzCount: 256,
    ssuzCount: 350,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '70 000 ₽',
    sphereEn: 'Pedagogy & Teaching',
    sphereRu: 'Педагогическое образование',
    descriptionEn: 'Teaches fundamental disciplines to primary, secondary, and specialized school students.',
    descriptionRu: 'Преподает предметы школьной программы, формирует исследовательские навыки и воспитывает личность учащихся.',
    suitableExams: ['rus', 'soc', 'math_prof'],
    schoolSubjects: ['rus', 'math', 'soc'],
    workObjectId: 'human',
    activityId: 'education',
  },
  {
    id: 'engineer',
    titleEn: 'Mechanical / Industrial Engineer',
    titleRu: 'Инженер-конструктор',
    vuzCount: 419,
    ssuzCount: 650,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '140 000 ₽',
    sphereEn: 'Mechanical Engineering',
    sphereRu: 'Машиностроение и приборостроение',
    descriptionEn: 'Designs high-performance industrial equipment, automotive mechanisms, and mechanical assemblies in CAD.',
    descriptionRu: 'Проектирует сложное оборудование, транспортные механизмы и производственные линии в CAD-системах.',
    suitableExams: ['rus', 'math_prof', 'phys'],
    schoolSubjects: ['math', 'phys', 'cherch'],
    workObjectId: 'technique',
    activityId: 'design',
  },
  {
    id: 'marketer',
    titleEn: 'Marketer / Brand Strategist',
    titleRu: 'Маркетолог / Бренд-стратег',
    vuzCount: 468,
    ssuzCount: 612,
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '120 000 ₽',
    sphereEn: 'Marketing & Business Strategy',
    sphereRu: 'Маркетинг и стратегическое развитие',
    descriptionEn: 'Researches customer behavior, designs marketing funnels, and drives commercial revenue growth.',
    descriptionRu: 'Анализирует рынок, целевую аудиторию и конкурентную среду, формирует позиционирование бренда.',
    suitableExams: ['rus', 'math_prof', 'soc'],
    schoolSubjects: ['soc', 'math', 'econ'],
    workObjectId: 'products',
    activityId: 'control',
  },
  {
    id: 'programmer',
    titleEn: 'Programmer / Software Engineer',
    titleRu: 'Программист / Разработчик ПО',
    vuzCount: 627,
    ssuzCount: 1026,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '220 000 ₽',
    sphereEn: 'Software Development',
    sphereRu: 'Разработка программного обеспечения',
    descriptionEn: 'Architects backend services, scalable cloud platforms, APIs, and cross-platform desktop applications.',
    descriptionRu: 'Создает высоконагруженные серверные системы, мобильные и веб-приложения, оптимизирует архитектуру кода.',
    suitableExams: ['rus', 'math_prof', 'inf'],
    schoolSubjects: ['math', 'inf', 'phys'],
    workObjectId: 'information',
    activityId: 'creation',
  },
  {
    id: 'energy-engineer',
    titleEn: 'Energy engineer / Power systems specialist',
    titleRu: 'Инженер-энергетик',
    vuzCount: 299,
    ssuzCount: 420,
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '130 000 ₽',
    sphereEn: 'Energy & Power Grids',
    sphereRu: 'Электроэнергетика и энергоснабжение',
    descriptionEn: 'Oversees electric grid transmission, renewable wind/solar installations, and thermal power stations.',
    descriptionRu: 'Обеспечивает бесперебойную работу электрических сетей, трансформаторных подстанций и теплоэлектростанций.',
    suitableExams: ['rus', 'math_prof', 'phys'],
    schoolSubjects: ['phys', 'math', 'cherch'],
    workObjectId: 'technique',
    activityId: 'production',
  },
  {
    id: 'internet-marketer',
    titleEn: 'Internet marketer / Performance Lead',
    titleRu: 'Интернет-маркетолог',
    vuzCount: 231,
    ssuzCount: 390,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '115 000 ₽',
    sphereEn: 'Digital Marketing & Growth',
    sphereRu: 'Интернет-маркетинг и performance-реклама',
    descriptionEn: 'Runs targeted ad campaigns, SEO strategies, data analytics pipelines, and conversion rate optimizations.',
    descriptionRu: 'Управляет контекстной и таргетированной рекламой, сквозной веб-аналитикой и SEO-продвижением.',
    suitableExams: ['rus', 'soc', 'inf'],
    schoolSubjects: ['inf', 'soc', 'econ'],
    workObjectId: 'information',
    activityId: 'control',
  },
  {
    id: 'qa-engineer',
    titleEn: 'Tester, QA engineer',
    titleRu: 'Тестировщик, QA-инженер',
    vuzCount: 484,
    ssuzCount: 1443,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '140 000 ₽',
    sphereEn: 'Quality Assurance & Automated Testing',
    sphereRu: 'Тестирование и контроль качества ПО',
    descriptionEn: 'Designs automated end-to-end test suites, stress-tests servers, and verifies UI/UX fidelity before release.',
    descriptionRu: 'Разрабатывает сценарии ручного и автоматизированного тестирования, выявляет дефекты в цифровых продуктах.',
    suitableExams: ['rus', 'math_prof', 'inf'],
    schoolSubjects: ['math', 'inf', 'foreign'],
    workObjectId: 'information',
    activityId: 'inspection',
  },
  {
    id: 'bioengineer',
    titleEn: 'Bioengineer / Geneticist',
    titleRu: 'Биоинженер / Генетик',
    vuzCount: 184,
    ssuzCount: 80,
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '160 000 ₽',
    sphereEn: 'Biotechnology & Genetic Engineering',
    sphereRu: 'Биотехнологии и генная инженерия',
    descriptionEn: 'Edits molecular sequences, synthesizes biopharmaceuticals, and creates artificial biological systems.',
    descriptionRu: 'Исследует ДНК и молекулярные структуры, создает инновационные вакцины и биопрепараты нового поколения.',
    suitableExams: ['rus', 'chem', 'bio'],
    schoolSubjects: ['bio', 'chem', 'math'],
    workObjectId: 'food_medicine',
    activityId: 'study',
  },
  {
    id: 'data-analyst',
    titleEn: 'Data analyst / Business Intelligence',
    titleRu: 'Аналитик данных',
    vuzCount: 718,
    ssuzCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '180 000 ₽',
    sphereEn: 'Big Data & Business Intelligence',
    sphereRu: 'Аналитика больших данных и бизнес-аналитика',
    descriptionEn: 'Transforms millions of unstructured data points into clear executive dashboards and predictive models.',
    descriptionRu: 'Строит математические модели, находит скрытые рыночные тренды и визуализирует показатели бизнеса в дашбордах.',
    suitableExams: ['rus', 'math_prof', 'inf'],
    schoolSubjects: ['math', 'inf', 'econ'],
    workObjectId: 'information',
    activityId: 'study',
  },
  {
    id: 'biologist',
    titleEn: 'Biologist / Ecologist',
    titleRu: 'Биолог / Эколог',
    vuzCount: 176,
    ssuzCount: 81,
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '90 000 ₽',
    sphereEn: 'Biological & Environmental Sciences',
    sphereRu: 'Биологические науки и охрана окружающей среды',
    descriptionEn: 'Studies ecosystems, wildlife behavior, biodiversity preservation, and environmental impact assessments.',
    descriptionRu: 'Проводит полевые и лабораторные биологические исследования, изучает флору, фауну и состояние экосистем.',
    suitableExams: ['rus', 'bio', 'chem'],
    schoolSubjects: ['bio', 'chem', 'geo'],
    workObjectId: 'plants',
    activityId: 'study',
  },
  {
    id: 'it-specialist',
    titleEn: 'IT specialist / DevOps Systems Architect',
    titleRu: 'IT-специалист / DevOps-архитектор',
    vuzCount: 640,
    ssuzCount: 1781,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    hasBudgetChance: true,
    salaryAvg: '240 000 ₽',
    sphereEn: 'Cloud Infrastructure & DevOps',
    sphereRu: 'Облачная инфраструктура и администрирование',
    descriptionEn: 'Automates deployment pipelines, maintains Kubernetes clusters, and guarantees 99.99% server uptime.',
    descriptionRu: 'Настраивает автоматизированную непрерывную доставку кода (CI/CD), мониторинг и отказоустойчивость серверов.',
    suitableExams: ['rus', 'math_prof', 'inf'],
    schoolSubjects: ['inf', 'math', 'phys'],
    workObjectId: 'information',
    activityId: 'design',
  },
];

// Photo-based questions for Klimov Test (Photo 3)
export interface KlimovPhotoQuestion {
  id: number;
  questionNumber: number;
  totalQuestions: number;
  promptRu: string;
  promptEn: string;
  optionA: {
    textRu: string;
    textEn: string;
    imageUrl: string;
    category: 'art' | 'sign' | 'human' | 'tech' | 'nature';
  };
  optionB: {
    textRu: string;
    textEn: string;
    imageUrl: string;
    category: 'art' | 'sign' | 'human' | 'tech' | 'nature';
  };
}

export const KLIMOV_PHOTO_QUESTIONS: KlimovPhotoQuestion[] = [
  {
    id: 1,
    questionNumber: 1,
    totalQuestions: 20,
    promptRu: 'Предположим, что после соответствующего обучения вы сможете выполнить любую работу. Но если бы вам пришлось выбирать только одну из двух возможностей, что бы вы предпочли?',
    promptEn: 'Suppose that after appropriate training you could perform any job. But if you had to choose only one of two possibilities, what would you prefer?',
    optionA: {
      textRu: 'Ухаживать за животными, дрессировать или лечить их',
      textEn: 'Care for animals, train them or treat them',
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
      category: 'nature',
    },
    optionB: {
      textRu: 'Обслуживать машины, механизмы, собирать и настраивать приборы',
      textEn: 'Maintain machines, mechanisms, assemble and calibrate devices',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      category: 'tech',
    },
  },
  {
    id: 2,
    questionNumber: 2,
    totalQuestions: 20,
    promptRu: 'Предположим, что после соответствующего обучения вы сможете выполнить любую работу. Но если бы вам пришлось выбирать только одну из двух возможностей, что бы вы предпочли?',
    promptEn: 'Suppose that after appropriate training you could perform any job. But if you had to choose only one of two possibilities, what would you prefer?',
    optionA: {
      textRu: 'Помогать больным людям, лечить их или консультировать',
      textEn: 'Help patients, treat them, or provide medical consultations',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      category: 'human',
    },
    optionB: {
      textRu: 'Составлять таблицы, математические графики, программы для ЭВМ',
      textEn: 'Compile tables, mathematical graphs, computer algorithms',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      category: 'sign',
    },
  },
  {
    id: 3,
    questionNumber: 3,
    totalQuestions: 20,
    promptRu: 'Предположим, что после соответствующего обучения вы сможете выполнить любую работу. Но если бы вам пришлось выбирать только одну из двух возможностей, что бы вы предпочли?',
    promptEn: 'Suppose that after appropriate training you could perform any job. But if you had to choose only one of two possibilities, what would you prefer?',
    optionA: {
      textRu: 'Следить за качеством книжных иллюстраций, плакатов, художественных открыток, грампластинок',
      textEn: 'Monitor the quality of book illustrations, posters, artistic postcards, vinyl sleeves',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      category: 'art',
    },
    optionB: {
      textRu: 'Следить за состоянием, развитием растений',
      textEn: 'Monitor the state and developmental growth of agricultural crops and botanical species',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      category: 'nature',
    },
  },
  {
    id: 4,
    questionNumber: 4,
    totalQuestions: 20,
    promptRu: 'Предположим, что после соответствующего обучения вы сможете выполнить любую работу. Но если бы вам пришлось выбирать только одну из двух возможностей, что бы вы предпочли?',
    promptEn: 'Suppose that after appropriate training you could perform any job. But if you had to choose only one of two possibilities, what would you prefer?',
    optionA: {
      textRu: 'Обрабатывать материалы (дерево, металл, ткань, пластмассу)',
      textEn: 'Process materials (wood, metal, textiles, plastics) on CNC machines',
      imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
      category: 'tech',
    },
    optionB: {
      textRu: 'Рекламировать и продавать товары населению',
      textEn: 'Advertise and market consumer goods to the public',
      imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80',
      category: 'human',
    },
  },
  {
    id: 5,
    questionNumber: 5,
    totalQuestions: 20,
    promptRu: 'Предположим, что после соответствующего обучения вы сможете выполнить любую работу. Но если бы вам пришлось выбирать только одну из двух возможностей, что бы вы предпочли?',
    promptEn: 'Suppose that after appropriate training you could perform any job. But if you had to choose only one of two possibilities, what would you prefer?',
    optionA: {
      textRu: 'Обсуждать научно-популярные статьи, книги по искусству',
      textEn: 'Critique and debate science articles and books on world art history',
      imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
      category: 'art',
    },
    optionB: {
      textRu: 'Изучать чертежи, схемы, физико-математические формулы',
      textEn: 'Study engineering schematics, blueprints, physics formulas and code',
      imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
      category: 'sign',
    },
  },
];

// Binary Pairings for "One of Two" Test (Photo 4)
export interface OneOfTwoMatchup {
  id: number;
  profA: {
    id: string;
    titleRu: string;
    titleEn: string;
    imageUrl: string;
    category: string;
  };
  profB: {
    id: string;
    titleRu: string;
    titleEn: string;
    imageUrl: string;
    category: string;
  };
}

export const ONE_OF_TWO_MATCHUPS: OneOfTwoMatchup[] = [
  {
    id: 1,
    profA: {
      id: 'aerospace-thermo',
      titleRu: 'Инженер-конструктор по теплофизике в ракетно-космической промышленности',
      titleEn: 'Thermal physics design engineer in aerospace and rocketry industry',
      imageUrl: 'https://images.unsplash.com/photo-1517976487507-5b3bb113295e?auto=format&fit=crop&w=600&q=80',
      category: 'engineering',
    },
    profB: {
      id: 'milling-operator',
      titleRu: 'Фрезеровщик',
      titleEn: 'Precision milling machine operator',
      imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
      category: 'production',
    },
  },
  {
    id: 2,
    profA: {
      id: 'ai-architect',
      titleRu: 'Архитектор нейросетей и генеративного ИИ',
      titleEn: 'Neural networks and generative AI architect',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
      category: 'tech',
    },
    profB: {
      id: 'neurosurgeon',
      titleRu: 'Нейрохирург высокотехнологичной медицины',
      titleEn: 'High-tech robotic neurosurgeon',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
      category: 'medicine',
    },
  },
  {
    id: 3,
    profA: {
      id: 'venture-fund-lead',
      titleRu: 'Управляющий венчурным фондом высоких технологий',
      titleEn: 'High-tech venture capital fund manager',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      category: 'finance',
    },
    profB: {
      id: 'gamedev-director',
      titleRu: 'Геймдиректор масштабных метавселенных и игр',
      titleEn: 'AAA gaming metaverse creative director',
      imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
      category: 'creative',
    },
  },
  {
    id: 4,
    profA: {
      id: 'cybersecurity-head',
      titleRu: 'Руководитель центра противодействия кибератакам (SOC)',
      titleEn: 'Security Operations Center (SOC) director',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
      category: 'tech',
    },
    profB: {
      id: 'genetic-bioengineer',
      titleRu: 'Ученый-генетик по синтетической биологии',
      titleEn: 'Synthetic biology genetic researcher',
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
      category: 'medicine',
    },
  },
];

// Pre-defined USE combinations for Card 2 (Photo 2 & 5)
export const USE_COMBINATIONS_PREVIEWS = [
  {
    id: 1,
    titleEn: 'Combination of the Unified State exam 1',
    titleRu: 'Комбинация ЕГЭ 1',
    subjectsEn: ['Mathematics', 'Russian language', 'Foreign language'],
    subjectsRu: ['Математика', 'Русский язык', 'Иностранный язык'],
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 2,
    titleEn: 'Unified State Exam Combination 2',
    titleRu: 'Комбинация ЕГЭ 2',
    subjectsEn: ['Mathematics', 'Russian language', 'Physics'],
    subjectsRu: ['Математика', 'Русский язык', 'Физика'],
    color: 'from-indigo-600 to-purple-600',
  },
  {
    id: 3,
    titleEn: 'Unified State Exam Combination 3',
    titleRu: 'Комбинация ЕГЭ 3',
    subjectsEn: ['Mathematics', 'Russian language', 'Informatics'],
    subjectsRu: ['Математика', 'Русский язык', 'Информатика'],
    color: 'from-sky-600 to-blue-700',
  },
  {
    id: 4,
    titleEn: 'Unified State Exam Combination 4',
    titleRu: 'Комбинация ЕГЭ 4',
    subjectsEn: ['Mathematics', 'Russian language', 'Chemistry'],
    subjectsRu: ['Математика', 'Русский язык', 'Химия'],
    color: 'from-teal-600 to-emerald-600',
  },
  {
    id: 5,
    titleEn: 'Unified State Exam Combination 5',
    titleRu: 'Комбинация ЕГЭ 5',
    subjectsEn: ['Mathematics', 'Russian language', 'Social science'],
    subjectsRu: ['Математика', 'Русский язык', 'Обществознание'],
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 6,
    titleEn: 'Unified State Exam Combination 6',
    titleRu: 'Комбинация ЕГЭ 6',
    subjectsEn: ['Mathematics', 'Russian language', 'Biology'],
    subjectsRu: ['Математика', 'Русский язык', 'Биология'],
    color: 'from-emerald-600 to-teal-700',
  },
];

// 22 School subjects for Card 3 (Photo 8)
export interface SchoolSubjectCheckbox {
  id: string;
  nameRu: string;
  nameEn: string;
  defaultChecked?: boolean;
}

export const SCHOOL_SUBJECTS_CHECKBOXES: { left: SchoolSubjectCheckbox[]; right: SchoolSubjectCheckbox[] } = {
  left: [
    { id: 'math', nameRu: 'Математика', nameEn: 'Mathematics', defaultChecked: true },
    { id: 'phys', nameRu: 'Физика', nameEn: 'Physics', defaultChecked: true },
    { id: 'hist', nameRu: 'История', nameEn: 'History' },
    { id: 'inf', nameRu: 'Информатика', nameEn: 'Informatics' },
    { id: 'mhk', nameRu: 'МХК', nameEn: 'World Art Culture' },
    { id: 'foreign', nameRu: 'Ин. язык', nameEn: 'Foreign Languages' },
    { id: 'pe', nameRu: 'Физкультура', nameEn: 'Physical Education' },
    { id: 'obzh', nameRu: 'ОБЖ', nameEn: 'Safety Fundamentals' },
    { id: 'cherch', nameRu: 'Черчение', nameEn: 'Technical Drafting' },
    { id: 'psy', nameRu: 'Психология', nameEn: 'Psychology' },
    { id: 'law', nameRu: 'Право', nameEn: 'Law' },
    { id: 'none', nameRu: 'Нет интересов', nameEn: 'No specific interest' },
  ],
  right: [
    { id: 'rus_lit', nameRu: 'Русский/литература', nameEn: 'Russian/Literature', defaultChecked: true },
    { id: 'soc', nameRu: 'Обществознание', nameEn: 'Social Science' },
    { id: 'bio', nameRu: 'Биология', nameEn: 'Biology' },
    { id: 'chem', nameRu: 'Химия', nameEn: 'Chemistry' },
    { id: 'geo', nameRu: 'География', nameEn: 'Geography' },
    { id: 'izo', nameRu: 'ИЗО', nameEn: 'Fine Arts' },
    { id: 'tech', nameRu: 'Технология', nameEn: 'Technology & Crafts' },
    { id: 'dance', nameRu: 'Танец', nameEn: 'Dance & Choreography' },
    { id: 'econ', nameRu: 'Экономика', nameEn: 'Economics' },
    { id: 'music', nameRu: 'Музыка', nameEn: 'Music' },
    { id: 'theology', nameRu: 'Теология', nameEn: 'Theology' },
  ],
};
