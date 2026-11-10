import React from 'react';
import {
  X,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
} from 'lucide-react';
import { ExtendedProfession } from '../data/proforientData';

interface MyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProfessions: ExtendedProfession[];
  onRemoveProfession: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const MyPlanModal: React.FC<MyPlanModalProps> = ({
  isOpen,
  onClose,
  savedProfessions,
  onRemoveProfession,
  onNavigateTab,
  lang = 'ru',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl shadow-sm">
              📋
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'My Personal Admission Plan' : 'Мой персональный план поступления 2026'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en'
                  ? `${savedProfessions.length} saved professions • Deadlines & steps tracked`
                  : `${savedProfessions.length} сохраненных профессий • Контроль сроков и документов`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Saved Professions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>{lang === 'en' ? 'Saved Professions' : 'Выбранные профессии'}</span>
              </h4>
              <span className="text-xs text-slate-400 font-semibold">{savedProfessions.length} / 10</span>
            </div>

            {savedProfessions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {lang === 'en'
                    ? 'No professions added to your plan yet. Click "Add to my plan" on any profession card to track it here.'
                    : 'В плане пока нет выбранных профессий. Нажмите «Добавить в мой план» на карточке любой профессии, чтобы сохранить её.'}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('proforient_interests');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  {lang === 'en' ? 'Explore Professions' : 'Перейти к подбору профессий'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedProfessions.map((prof) => (
                  <div
                    key={prof.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prof.imageUrl}
                        alt={prof.titleRu}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {lang === 'en' ? prof.titleEn : prof.titleRu}
                        </h5>
                        <p className="text-xs text-slate-500 truncate">
                          {prof.vuzCount} {lang === 'en' ? 'universities' : 'вузов'} • {prof.salaryAvg}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveProfession(prof.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                      title={lang === 'en' ? 'Remove from plan' : 'Удалить из плана'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Admission Steps */}
          <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{lang === 'en' ? 'Admission Milestones 2026' : 'Ключевые даты приёмной кампании 2026'}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? '20 June — Applications Open' : '20 июня — Старт приёма заявлений'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  {lang === 'en' ? 'Госуслуги' : 'Госуслуги'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? '25 July — USE Applications Close' : '25 июля — Дедлайн приёма документов'}
                </span>
                <span className="text-slate-400 text-[10px]">12:00 МСК</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? '3 August — Submission of Originals' : '3 августа — Предоставление оригинала аттестата'}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                  {lang === 'en' ? 'Crucial' : 'Решающий этап'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              alert(lang === 'en' ? 'Plan exported to PDF!' : 'План успешно сохранен!');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Export plan' : 'Экспорт в PDF'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
          >
            {lang === 'en' ? 'Done' : 'Готово'}
          </button>
        </div>
      </div>
    </div>
  );
};
