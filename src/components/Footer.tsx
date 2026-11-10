import React from 'react';
import { GraduationCap, Send, Play } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onSelectCity: (city: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onSelectCity }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Main 5-Column Grid (Exact from Vuzopedia photos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-none">
                  ВУЗОПЕДИЯ
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ЛЕТО БЛИЗКО
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Ваш путь к успешному поступлению
            </p>

            {/* Social Icons (Telegram, VK, YouTube) */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://t.me/vuzopedia"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition shadow-sm"
                title="Telegram"
              >
                <Send className="w-4 h-4 -translate-x-0.5" />
              </a>
              <a
                href="https://vk.com/vuzopedia"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center transition shadow-sm"
                title="VK"
              >
                VK
              </a>
              <a
                href="https://youtube.com/@vuzopedia"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition shadow-sm"
                title="YouTube"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
              </a>
            </div>
          </div>

          {/* Column 1: ПОСТУПАЮЩИМ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              ПОСТУПАЮЩИМ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab('fear_map')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  С ЧЕГО НАЧАТЬ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('catalog')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ПЕРСОНАЛЬНЫЙ ПЛАН
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('catalog')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ПОДОБРАТЬ ВУЗ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calculator')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ПОСТУПАЮЩИМ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('fear_map')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  РОДИТЕЛЯМ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('tests')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  УЧИТЕЛЯМ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: О ПОСТУПЛЕНИИ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              О ПОСТУПЛЕНИИ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab('fear_map')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ОТВЕТЫ НА ВОПРОСЫ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calendar')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ПРАВИЛА ПРИЁМА
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calendar')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  СЛОВАРЬ ПОСТУПАЮЩЕГО
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('tests')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ТЕСТЫ О ПОСТУПЛЕНИИ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: УЧЕБНЫМ ЗАВЕДЕНИЯМ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              УЧЕБНЫМ ЗАВЕДЕНИЯМ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab('catalog')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ВУЗАМ И КОЛЛЕДЖАМ
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert('Регистрация личного кабинета вуза: contact@vuzopedia.ru')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  РЕГИСТРАЦИЯ ПРЕДСТАВИТЕЛЯ
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert('По вопросам рекламы: adv@vuzopedia.ru')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  РЕКЛАМА И СОТРУДНИЧЕСТВО
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: ВУЗОПЕДИЯ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              ВУЗОПЕДИЯ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => alert('Служба поддержки: support@vuzopedia.ru')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ПОМОЩЬ И ОБРАТНАЯ СВЯЗЬ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('calendar')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  ДОКУМЕНТЫ
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert('QR-код мобильного приложения: https://vuzopedia.ru/app')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  QR-КОД САЙТА
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert('Для удаления профиля напишите в поддержку')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  УДАЛИТЬ АККАУНТ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('spo')}
                  className="hover:text-white transition uppercase font-semibold text-[11px]"
                >
                  КОЛЛЕДЖИ И ТЕХНИКУМЫ
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Traffic counters */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-slate-400">© Vuzopedia.ru, 2026</p>
            <p className="text-[11px] text-slate-500">
              Вузопедия — информация о поступлении в вузы России. Информация на сайте не является офертой.
            </p>
          </div>

          {/* Live Visitor Traffic Counter Badges (from photos) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2 py-1 rounded bg-amber-400 text-slate-900 font-extrabold text-[10px] flex items-center gap-1 shadow-sm">
              <span>📊</span>
              <span>93 575</span>
            </div>
            <div className="px-2 py-1 rounded bg-amber-400 text-slate-900 font-extrabold text-[10px] flex items-center gap-1 shadow-sm">
              <span>↗</span>
              <span>49 121</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
