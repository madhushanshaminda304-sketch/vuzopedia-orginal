import React from 'react';
import { SlidersHorizontal, Bookmark, Calendar, MessageSquare, ArrowRight } from 'lucide-react';

interface SingleWindowBannerProps {
  onOpenMyPlan: () => void;
  lang?: 'ru' | 'en';
}

export const SingleWindowBanner: React.FC<SingleWindowBannerProps> = ({
  onOpenMyPlan,
  lang = 'ru',
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-10 my-10 shadow-xl overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Call to Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider">
            <span>{lang === 'en' ? 'Personal Admission Plan' : 'Персональный план поступления'}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-900 font-extrabold text-[10px]">
              {lang === 'en' ? 'Free' : 'Бесплатно'}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {lang === 'en' ? 'All receipts in one place: a single window' : 'Всё поступление в одном месте: единое окно'}
          </h3>

          <div>
            <button
              onClick={onOpenMyPlan}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-bold text-sm shadow-md transition transform hover:scale-105"
            >
              <span>{lang === 'en' ? 'Open a personal plan' : 'Открыть персональный план'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: 4 Feature Blocks in 2x2 grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Feature 1 */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold leading-snug">
                {lang === 'en' ? 'Selection according to your conditions' : 'Подбор под ваши условия'}
              </h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                {lang === 'en'
                  ? 'Universities and programs based on what is important to you.'
                  : 'Вузы и программы с учётом того, что важно вам.'}
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bookmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold leading-snug">
                {lang === 'en' ? 'Saved options' : 'Сохранённые варианты'}
              </h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                {lang === 'en'
                  ? 'Return to the selected training at any time.'
                  : 'Возвращайтесь к выбранному обучению в любой момент.'}
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold leading-snug">
                {lang === 'en' ? 'Documents and deadlines' : 'Документы и сроки'}
              </h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                {lang === 'en'
                  ? 'Preparation and important dates always at hand.'
                  : 'Подготовка и важные даты всегда под рукой.'}
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold leading-snug">
                {lang === 'en' ? 'Communication with universities' : 'Связь с вузами'}
              </h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                {lang === 'en'
                  ? 'Contacts and dialogues with admissions committees are in the plan.'
                  : 'Контакты и диалоги с приёмными комиссиями — в плане.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
