import React from 'react';
import { GraduationCap, Heart, Shield, Globe } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onSelectCity: (city: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onSelectCity }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">ВУЗОПЕДИЯ</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Главный независимый портал для поступающих в вузы России. Помогаем абитуриентам трезво оценить свои шансы, рассчитать баллы ЕГЭ, подобрать востребованную профессию и поступить на бюджет в вуз мечты.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Верифицированная база данных приемной кампании 2026</span>
            </div>
          </div>

          {/* Column 1: Поступающим */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Поступающим</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('catalog')}
                  className="hover:text-white transition"
                >
                  Каталог вузов России
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calculator')}
                  className="hover:text-white transition"
                >
                  Калькулятор ЕГЭ 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('specialties')}
                  className="hover:text-white transition"
                >
                  Каталог специальностей
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('professions')}
                  className="hover:text-white transition"
                >
                  Атлас профессий
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Сервисы */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Сервисы</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('compare')}
                  className="hover:text-white transition"
                >
                  Сравнение университетов
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('tests')}
                  className="hover:text-white transition"
                >
                  Тест Климова (Профориентация)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calendar')}
                  className="hover:text-white transition"
                >
                  Календарь и дедлайны 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('tracker')}
                  className="hover:text-white transition"
                >
                  Мои 5 приоритетов
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Города */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Города</h4>
            <ul className="space-y-2 text-xs">
              {['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Томск'].map(
                (city) => (
                  <li key={city}>
                    <button
                      onClick={() => {
                        onSelectCity(city);
                        onSelectTab('catalog');
                      }}
                      className="hover:text-white transition"
                    >
                      Вузы: {city}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Вузопедия (vuzopedia.ru remake). Все права защищены.</p>
          <p className="flex items-center gap-1">
            Создано с <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> для будущих студентов
          </p>
        </div>
      </div>
    </footer>
  );
};
