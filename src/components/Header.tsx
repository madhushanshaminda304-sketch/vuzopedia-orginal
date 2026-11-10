import React, { useState } from 'react';
import {
  GraduationCap,
  MapPin,
  Search,
  Scale,
  Bookmark,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  School,
  FileCheck,
  Compass,
  ShieldAlert,
  Laptop,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  selectedCity: string;
  onOpenCityModal: () => void;
  onOpenSearchModal: () => void;
  onOpenDedAssistant: () => void;
  compareCount: number;
  favoritesCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedCity,
  onOpenCityModal,
  onOpenSearchModal,
  onOpenDedAssistant,
  compareCount,
  favoritesCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { id: 'catalog', label: 'Вузы' },
    { id: 'calculator', label: 'Калькулятор ЕГЭ', badge: '2026' },
    { id: 'spo', label: 'Колледжи (СПО)' },
    { id: 'specialties', label: 'Специальности' },
    { id: 'professions', label: 'Профессии' },
    { id: 'target', label: 'Целевое' },
    { id: 'fear_map', label: 'С чего начать' },
    { id: 'blacklist', label: 'Черный список', isWarning: true },
    { id: 'remote', label: 'Онлайн-обучение' },
    { id: 'tests', label: 'Профориентация', badge: 'ХИТ' },
    { id: 'compare', label: 'Сравнение', count: compareCount },
    { id: 'calendar', label: 'Календарь' },
    { id: 'tracker', label: 'Мои приоритеты', count: favoritesCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-600 to-brand-800 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>Приёмная кампания 2026: вузы, колледжи СПО, целевые квоты, калькулятор баллов и навигатор поступления</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('catalog')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-indigo-600 dark:from-brand-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  ВУЗОПЕДИЯ
                </span>
                <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Поступление 2026
                </span>
              </div>
            </button>

            {/* City Selector Pill */}
            <button
              onClick={onOpenCityModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>{selectedCity}</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {item.label}
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-brand-600 text-white">
                        {item.count}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Assistant Button */}
          <div className="flex items-center gap-2">
            {/* Ded Vuzoped trigger button */}
            <button
              onClick={onOpenDedAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold shadow-sm transition transform hover:scale-105"
            >
              <span className="text-sm">🧙‍♂️</span>
              <span className="hidden sm:inline">Дед Вузопед</span>
            </button>

            {/* Quick Search */}
            <button
              onClick={onOpenSearchModal}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition"
              title="Поиск по сайту (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline text-xs">Поиск...</span>
            </button>

            {/* Compare Button */}
            <button
              onClick={() => onSelectTab('compare')}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Сравнение вузов"
            >
              <Scale className="w-4 h-4" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center animate-scaleIn">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Tracker / Favorites */}
            <button
              onClick={() => onSelectTab('tracker')}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Мои приоритеты (до 5 вузов)"
            >
              <Bookmark className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center animate-scaleIn">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile / Compact Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                onOpenCityModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-slate-800 dark:text-slate-200"
            >
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Город: {selectedCity}</span>
            </button>
            <span className="text-brand-600 cursor-pointer">Изменить</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-left text-xs font-medium transition ${
                  currentTab === item.id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-600 text-white font-bold">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
