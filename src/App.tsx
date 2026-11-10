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
    if (myPlanProfessions.some((p) => p.id === prof.id)) {
      setMyPlanProfessions(myPlanProfessions.filter((p) => p.id !== prof.id));
    } else {
      setMyPlanProfessions([...myPlanProfessions, prof]);
    }
  };

  const removeMyPlan = (id: string) => {
    setMyPlanProfessions(myPlanProfessions.filter((p) => p.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('vuzopedia_compare', JSON.stringify(compareList));
  }, [compareList]);

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
    } else {
      if (favorites.length >= 5) {
        alert('По правилам поступления в РФ можно выбрать не более 5 вузов в приоритетный список.');
      }
      setFavorites([...favorites, id]);
    }
  };

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter((c) => c !== id));
    } else {
      if (compareList.length >= 4) {
        alert('Для комфортного сравнения можно одновременно выбрать до 4 вузов.');
        return;
      }
      setCompareList([...compareList, id]);
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
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-brand-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-2xl transition transform hover:scale-110 animate-bounce"
        title="Спросить Деда Вузопеда"
      >
        <span className="text-xl">🧙‍♂️</span>
        <span className="hidden sm:inline">Дед Вузопед (Помощник)</span>
      </button>

      {/* Global Footer */}
      <Footer onSelectTab={setCurrentTab} onSelectCity={setSelectedCity} />
    </div>
  );
};
