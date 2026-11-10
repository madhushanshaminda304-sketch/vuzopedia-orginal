import React, { useState, useEffect } from 'react';
import { UNIVERSITIES } from './data/mockData';
import { University } from './types';
import { EXTENDED_PROFESSIONS, ExtendedProfession } from './data/proforientData';
import { Header } from './components/Header';
import { UniversityCatalog } from './components/UniversityCatalog';
import { EgeCalculatorView } from './components/EgeCalculatorView';
import { CollegesView } from './components/CollegesView';
import { SpecialtiesCatalogView } from './components/SpecialtiesCatalogView';
import { ProfessionsCatalogView } from './components/ProfessionsCatalogView';
import { TargetEducationView } from './components/TargetEducationView';
import { FearMapView } from './components/FearMapView';
import { BlacklistView } from './components/BlacklistView';
import { RemoteEducationView } from './components/RemoteEducationView';
import { CareerTestsView } from './components/CareerTestsView';
import { ProforientByInterestsView } from './components/ProforientByInterestsView';
import { ProforientByEgeView } from './components/ProforientByEgeView';
import { ProforientBySubjectsView } from './components/ProforientBySubjectsView';
import { ProforientKlimovView } from './components/ProforientKlimovView';
import { ProforientOneOfTwoView } from './components/ProforientOneOfTwoView';
import { ProgramsCatalogView } from './components/ProgramsCatalogView';
import { DormitoriesView } from './components/DormitoriesView';
import { MilitaryDeptView } from './components/MilitaryDeptView';
import { ReviewsView } from './components/ReviewsView';
import { OlympiadsView } from './components/OlympiadsView';
import { CreditCalculatorView } from './components/CreditCalculatorView';
import { AchievementsCalculatorView } from './components/AchievementsCalculatorView';
import { StudentBudgetCalculatorView } from './components/StudentBudgetCalculatorView';
import { MyPlanModal } from './components/MyPlanModal';
import { UniversityComparisonView } from './components/UniversityComparisonView';
import { CalendarAndGlossaryView } from './components/CalendarAndGlossaryView';
import { ApplicationTrackerView } from './components/ApplicationTrackerView';
import { CityModal } from './components/CityModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { UniversityDetailModal } from './components/UniversityDetailModal';
import { DedVuzopedAssistantModal } from './components/DedVuzopedAssistantModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [selectedCity, setSelectedCity] = useState<string>('Все города');

  // Persistence in LocalStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vuzopedia_favs');
      return saved ? JSON.parse(saved) : ['mgu', 'bmstu', 'hse'];
    } catch {
      return ['mgu', 'bmstu', 'hse'];
    }
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vuzopedia_compare');
      return saved ? JSON.parse(saved) : ['mgu', 'bmstu', 'hse'];
    } catch {
      return ['mgu', 'bmstu', 'hse'];
    }
  });

  const [myPlanProfessions, setMyPlanProfessions] = useState<ExtendedProfession[]>(() => {
    try {
      const saved = localStorage.getItem('vuzopedia_my_plan');
      return saved ? JSON.parse(saved) : [EXTENDED_PROFESSIONS[0], EXTENDED_PROFESSIONS[7]];
    } catch {
      return [EXTENDED_PROFESSIONS[0], EXTENDED_PROFESSIONS[7]];
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vuzopedia_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [selectedVuzDetail, setSelectedVuzDetail] = useState<University | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDedAssistantOpen, setIsDedAssistantOpen] = useState(false);
  const [isMyPlanOpen, setIsMyPlanOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Sync document title with currentTab
  useEffect(() => {
    const titles: Record<string, string> = {
      catalog: 'Вузы России 2026 — Каталог, баллы и бюджетные места | Вузопедия',
      programs: 'Программы высшего образования 2026 — Бакалавриат и специалитет | Вузопедия',
      calculator: 'Калькулятор ЕГЭ 2026 — Подбор вузов по предметам и баллам | Вузопедия',
      spo: 'Колледжи и техникумы России (СПО) 2026 — Поступление после 9 и 11 классов | Вузопедия',
      specialties: 'Специальности высшего образования — Каталог направлений | Вузопедия',
      professions: 'Атлас профессий — Кем стать и сколько платят | Вузопедия',
      target: 'Целевое обучение 2026 — Заказчики и квоты | Вузопедия',
      dorms: 'Общежития вузов России — Стоимость и гарантии | Вузопедия',
      military: 'Военные учебные центры (ВУЦ) при вузах РФ | Вузопедия',
      reviews: 'Отзывы студентов о вузах России — Честные оценки | Вузопедия',
      olympiads: 'Олимпиады для поступления и БВИ 2026 | Вузопедия',
      credit: 'Образовательный кредит с господдержкой 3% и скидки | Вузопедия',
      achievements: 'Калькулятор индивидуальных достижений к ЕГЭ (до +10 б.) | Вузопедия',
      student_budget: 'Калькулятор расходов и бюджета студента по городам РФ | Вузопедия',
      tests: 'Тесты профориентации — Выбор профессии онлайн | Вузопедия',
      compare: 'Сравнение выбранных университетов | Вузопедия',
      calendar: 'Календарь абитуриента 2026 и Словарь терминов | Вузопедия',
      tracker: 'Мои приоритеты поступления — Стратегия 5 вузов | Вузопедия',
    };
    document.title = titles[currentTab] || 'Вузопедия 2026 — Поступление в вузы России';
  }, [currentTab]);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vuzopedia_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vuzopedia_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync favorites, compare & my plan
  useEffect(() => {
    localStorage.setItem('vuzopedia_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('vuzopedia_compare', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('vuzopedia_my_plan', JSON.stringify(myPlanProfessions));
  }, [myPlanProfessions]);

  const toggleMyPlan = (prof: ExtendedProfession) => {
    const profName = prof.titleRu || prof.titleEn;
    if (myPlanProfessions.some((p) => p.id === prof.id)) {
      setMyPlanProfessions(myPlanProfessions.filter((p) => p.id !== prof.id));
      showToast(`Удалено из плана: ${profName}`);
    } else {
      setMyPlanProfessions([...myPlanProfessions, prof]);
      showToast(`Добавлено в Мой план: ${profName}`);
    }
  };

  const removeMyPlan = (id: string) => {
    const p = myPlanProfessions.find((item) => item.id === id);
    const profName = p ? (p.titleRu || p.titleEn) : '';
    setMyPlanProfessions(myPlanProfessions.filter((item) => item.id !== id));
    if (p) showToast(`Удалено из плана: ${profName}`);
  };

  // Global keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
      showToast('Удалено из ваших приоритетов');
    } else {
      if (favorites.length >= 5) {
        alert('По правилам поступления в РФ можно выбрать не более 5 вузов в приоритетный список.');
        return;
      }
      setFavorites([...favorites, id]);
      showToast('Добавлено в 5 приоритетов поступления');
    }
  };

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter((c) => c !== id));
      showToast('Удалено из сравнения');
    } else {
      if (compareList.length >= 4) {
        alert('Для комфортного сравнения можно одновременно выбрать до 4 вузов.');
        return;
      }
      setCompareList([...compareList, id]);
      showToast('Добавлено в сравнение вузов');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Main Sticky Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedCity={selectedCity}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenDedAssistant={() => setIsDedAssistantOpen(true)}
        onOpenMyPlan={() => setIsMyPlanOpen(true)}
        myPlanCount={myPlanProfessions.length}
        compareCount={compareList.length}
        favoritesCount={favorites.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'catalog' && (
          <UniversityCatalog
            universities={UNIVERSITIES}
            selectedCity={selectedCity}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            onOpenDetail={setSelectedVuzDetail}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            compareList={compareList}
            onToggleCompare={toggleCompare}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'programs' && (
          <ProgramsCatalogView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'calculator' && (
          <EgeCalculatorView
            onOpenUniversity={setSelectedVuzDetail}
            selectedCity={selectedCity}
            onOpenCityModal={() => setIsCityModalOpen(true)}
          />
        )}

        {currentTab === 'spo' && <CollegesView />}

        {currentTab === 'specialties' && <SpecialtiesCatalogView />}

        {currentTab === 'professions' && <ProfessionsCatalogView />}

        {currentTab === 'target' && <TargetEducationView />}

        {currentTab === 'fear_map' && <FearMapView onNavigateTab={setCurrentTab} />}

        {currentTab === 'blacklist' && <BlacklistView />}

        {currentTab === 'remote' && <RemoteEducationView />}

        {currentTab === 'dorms' && (
          <DormitoriesView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'military' && (
          <MilitaryDeptView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'olympiads' && <OlympiadsView />}

        {currentTab === 'credit' && <CreditCalculatorView />}

        {currentTab === 'achievements' && (
          <AchievementsCalculatorView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'student_budget' && (
          <StudentBudgetCalculatorView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'tests' && <CareerTestsView onNavigateTab={setCurrentTab} />}

        {/* 5 Dedicated Proforientation Full-Page Views (Exact from user photos) */}
        {currentTab === 'proforient_interests' && (
          <ProforientByInterestsView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            selectedCity={selectedCity}
            myPlanIds={myPlanProfessions.map((p) => p.id)}
            onToggleMyPlan={toggleMyPlan}
          />
        )}

        {currentTab === 'proforient_ege' && (
          <ProforientByEgeView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            selectedCity={selectedCity}
            myPlanIds={myPlanProfessions.map((p) => p.id)}
            onToggleMyPlan={toggleMyPlan}
          />
        )}

        {currentTab === 'proforient_subjects' && (
          <ProforientBySubjectsView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            selectedCity={selectedCity}
            myPlanIds={myPlanProfessions.map((p) => p.id)}
            onToggleMyPlan={toggleMyPlan}
          />
        )}

        {currentTab === 'proforient_klimov' && (
          <ProforientKlimovView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
            myPlanIds={myPlanProfessions.map((p) => p.id)}
            onToggleMyPlan={toggleMyPlan}
          />
        )}

        {currentTab === 'proforient_one_of_two' && (
          <ProforientOneOfTwoView
            onOpenMyPlan={() => setIsMyPlanOpen(true)}
            onNavigateTab={setCurrentTab}
            myPlanIds={myPlanProfessions.map((p) => p.id)}
            onToggleMyPlan={toggleMyPlan}
          />
        )}

        {currentTab === 'compare' && (
          <UniversityComparisonView
            compareIds={compareList}
            onRemoveFromCompare={toggleCompare}
            onOpenDetail={setSelectedVuzDetail}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'calendar' && <CalendarAndGlossaryView />}

        {currentTab === 'tracker' && (
          <ApplicationTrackerView
            favoriteIds={favorites}
            onRemoveFavorite={toggleFavorite}
            onOpenDetail={setSelectedVuzDetail}
            onNavigateTab={setCurrentTab}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUniversity={setSelectedVuzDetail}
        onNavigateTab={setCurrentTab}
      />

      <UniversityDetailModal
        university={selectedVuzDetail}
        onClose={() => setSelectedVuzDetail(null)}
        isFavorite={selectedVuzDetail ? favorites.includes(selectedVuzDetail.id) : false}
        onToggleFavorite={toggleFavorite}
        isCompared={selectedVuzDetail ? compareList.includes(selectedVuzDetail.id) : false}
        onToggleCompare={toggleCompare}
      />

      <DedVuzopedAssistantModal
        isOpen={isDedAssistantOpen}
        onClose={() => setIsDedAssistantOpen(false)}
        onNavigateTab={setCurrentTab}
        onSelectUniversity={(vuz) => {
          setSelectedVuzDetail(vuz);
          setIsDedAssistantOpen(false);
        }}
      />

      <MyPlanModal
        isOpen={isMyPlanOpen}
        onClose={() => setIsMyPlanOpen(false)}
        savedProfessions={myPlanProfessions}
        onRemoveProfession={removeMyPlan}
        onNavigateTab={setCurrentTab}
      />

      {/* Floating Ded Vuzoped launcher for mobile & desktop */}
      <button
        onClick={() => setIsDedAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-brand-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-2xl transition-all transform hover:scale-105 active:scale-95"
        title="Спросить Деда Вузопеда"
      >
        <span className="text-xl">🧙‍♂️</span>
        <span className="hidden sm:inline">Дед Вузопед (Помощник)</span>
      </button>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 font-bold text-xs shadow-2xl backdrop-blur-md border border-slate-700 dark:border-slate-300 animate-slideDown">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Footer */}
      <Footer
        onSelectTab={setCurrentTab}
        onSelectCity={setSelectedCity}
        onOpenDedAssistant={() => setIsDedAssistantOpen(true)}
      />
    </div>
  );
};
