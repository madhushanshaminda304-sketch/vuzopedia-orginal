import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Building2,
  Shield,
  Star,
  Trophy,
  CreditCard,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  selectedCity: string;
  onOpenCityModal: () => void;
  onOpenSearchModal: () => void;
  onOpenDedAssistant: () => void;
  onOpenMyPlan?: () => void;
  myPlanCount?: number;
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
  onOpenMyPlan,
  myPlanCount = 0,
  compareCount,
  favoritesCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavItems = [
    { id: 'catalog', label: 'Вузы' },
    { id: 'programs', label: 'Программы', badge: 'Новинка' },
    { id: 'calculator', label: 'Подбор по ЕГЭ', badge: '2026' },
    { id: 'specialties', label: 'Специальности' },
    { id: 'professions', label: 'Профессии' },
    { id: 'tests', label: 'Профориентация', badge: 'ХИТ' },
    { id: 'calendar', label: 'Календарь' },
  ];

  const serviceItems = [
    { id: 'dorms', label: 'Общежития вузов', icon: Building2, desc: 'Стоимость, места, удалённость' },
    { id: 'military', label: 'Военные кафедры (ВУЦ)', icon: Shield, desc: 'Нормативы и звания запаса' },
    { id: 'reviews', label: 'Отзывы студентов', icon: Star, desc: 'Реальные оценки и мнения' },
    { id: 'olympiads', label: 'Олимпиады и БВИ', icon: Trophy, desc: 'Перечень РСОШ и льгота 75 баллов' },
    { id: 'credit', label: 'Кредит 3% и скидки', icon: CreditCard, desc: 'Господдержка и скидки вузов' },
    { id: 'target', label: 'Целевое обучение', icon: FileCheck, desc: 'Заказчики и квоты 2026' },
    { id: 'fear_map', label: 'С чего начать', icon: Compass, desc: 'Пошаговый гид абитуриента' },
    { id: 'blacklist', label: 'Черный список вузов', icon: ShieldAlert, desc: 'Лишенные аккредитации' },
    { id: 'remote', label: 'Онлайн-обучение', icon: Laptop, desc: 'Дистанционные дипломы' },
    { id: 'spo', label: 'Колледжи (СПО)', icon: School, desc: 'Поступление после 9 и 11 классов' },
  ];

  const isServiceActive = serviceItems.some((s) => s.id === currentTab);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Level Higher / College Education Switcher & News Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('catalog')}
            className={`font-bold uppercase tracking-wider transition ${
              currentTab === 'catalog' || currentTab.startsWith('proforient') ? 'text-white underline decoration-blue-500 decoration-2' : 'hover:text-white'
            }`}
          >
            ВЫСШЕЕ
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => onSelectTab('spo')}
            className={`font-bold uppercase tracking-wider transition ${
              currentTab === 'spo' ? 'text-white underline decoration-blue-500 decoration-2' : 'hover:text-white'
            }`}
          >
            СПО (КОЛЛЕДЖИ)
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Приёмная кампания 2026: официальные правила, даты и проходные баллы</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('catalog')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  ВУЗОПЕДИЯ
                </span>
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ЛЕТО БЛИЗКО 2026
                </span>
              </div>
            </button>

            {/* City & Vuz Quick Selectors */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={onOpenCityModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>ГОРОД: {selectedCity}</span>
              </button>
              <button
                onClick={() => onSelectTab('catalog')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              >
                <School className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>ВУЗ</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {primaryNavItems.map((item) => {
              const isActive = currentTab === item.id || (item.id === 'tests' && currentTab.startsWith('proforient'));
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
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Services Dropdown */}
            <div className="relative" ref={servicesDropdownRef}>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  isServiceActive || servicesOpen
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>Сервисы</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Специальные возможности
                  </div>
                  <div className="py-1">
                    {serviceItems.map((s) => {
                      const Icon = s.icon;
                      const active = currentTab === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            onSelectTab(s.id);
                            setServicesOpen(false);
                          }}
                          className={`w-full px-3 py-2 flex items-start gap-2.5 text-left transition ${
                            active
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">{s.label}</div>
                            <div className="text-[10px] text-slate-400">{s.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons & Assistant Button */}
          <div className="flex items-center gap-2">
            {/* My Plan Button (Featured in Vuzopedia header) */}
            <button
              onClick={onOpenMyPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition shadow-sm"
              title="Персональный план поступления"
            >
              <span>Мой план</span>
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {myPlanCount}
              </span>
            </button>

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

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Основные разделы
              </div>
              <div className="grid grid-cols-2 gap-2">
                {primaryNavItems.map((item) => (
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
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Специальные сервисы
              </div>
              <div className="grid grid-cols-2 gap-2">
                {serviceItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left text-xs font-medium transition flex items-center gap-2 ${
                        currentTab === item.id
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
