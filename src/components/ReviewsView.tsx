import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ShieldCheck,
  Plus,
  Filter,
  Check,
  Building,
} from 'lucide-react';
import { UNIVERSITY_REVIEWS } from '../data/extendedData';
import { UniversityReview } from '../types';
import { SingleWindowBanner } from './SingleWindowBanner';

interface ReviewsViewProps {
  onOpenMyPlan?: () => void;
  onNavigateTab: (tab: string) => void;
  lang?: 'ru' | 'en';
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  onOpenMyPlan,
  onNavigateTab,
  lang = 'ru',
}) => {
  const [reviews, setReviews] = useState<UniversityReview[]>(UNIVERSITY_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  // Form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newVuz, setNewVuz] = useState('hse');
  const [newFaculty, setNewFaculty] = useState('');
  const [newOverall, setNewOverall] = useState(5);
  const [newPros, setNewPros] = useState('');
  const [newCons, setNewCons] = useState('');
  const [newVerdict, setNewVerdict] = useState('');

  const toggleLike = (id: string) => {
    if (likedIds.includes(id)) {
      setLikedIds(likedIds.filter((x) => x !== id));
      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, likesCount: r.likesCount - 1 } : r))
      );
    } else {
      setLikedIds([...likedIds, id]);
      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, likesCount: r.likesCount + 1 } : r))
      );
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newPros.trim()) return;

    const newRev: UniversityReview = {
      id: `rev-${Date.now()}`,
      universityId: newVuz,
      authorName: newAuthor,
      courseAndFaculty: newFaculty || '1 курс бакалавриата',
      date: 'Сегодня',
      ratingOverall: newOverall,
      ratingEducation: 5,
      ratingDorm: 4,
      ratingDeanery: 4,
      ratingEmployment: 5,
      pros: newPros,
      cons: newCons || 'Существенных минусов нет.',
      verdict: newVerdict || 'Рекомендую поступать!',
      isVerifiedStudent: true,
      likesCount: 1,
    };

    setReviews([newRev, ...reviews]);
    setIsModalOpen(false);
    setNewAuthor('');
    setNewPros('');
    setNewCons('');
    setNewVerdict('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Обратная связь и опыт студентов</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Честные отзывы студентов о вузах России
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm leading-relaxed mt-2">
            Реальные оценки качества образования, общежитий, работы деканата и содействия трудоустройству от первокурсников, старшекурсников и выпускников ведущих вузов.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition transform hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Написать свой отзыв</span>
        </button>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-6">
        {reviews.map((rev) => {
          const isLiked = likedIds.includes(rev.id);
          return (
            <div
              key={rev.id}
              className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition space-y-5"
            >
              {/* Author & Rating Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {rev.authorName}
                      </h4>
                      {rev.isVerifiedStudent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Проверенный студент</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rev.courseAndFaculty} • {rev.date}
                    </p>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{rev.ratingOverall.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Sub-ratings row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-center font-semibold">
                <div>
                  <span className="text-slate-400 text-[10px] block">Качество учебы</span>
                  <span className="text-blue-600 font-bold">{rev.ratingEducation} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Общежитие</span>
                  <span className="text-blue-600 font-bold">{rev.ratingDorm} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Деканат</span>
                  <span className="text-blue-600 font-bold">{rev.ratingDeanery} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Трудоустройство</span>
                  <span className="text-blue-600 font-bold">{rev.ratingEmployment} / 5</span>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block mb-1">
                    Плюсы:
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{rev.pros}</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide block mb-1">
                    Минусы:
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{rev.cons}</p>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-xs text-slate-400 block mb-1">Вердикт абитуриентам:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
                    «{rev.verdict}»
                  </p>
                </div>
              </div>

              {/* Like / Helpful button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => toggleLike(rev.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isLiked
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Полезный отзыв ({rev.likesCount})</span>
                </button>

                <button
                  onClick={() => onNavigateTab('catalog')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Карточка университета →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Write review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Оставить отзыв об университете
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Ваше имя / псевдоним:</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Университет и курс:</label>
                <input
                  type="text"
                  value={newFaculty}
                  onChange={(e) => setNewFaculty(e.target.value)}
                  placeholder="НИУ ВШЭ, 2 курс, ПИ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Главные плюсы:</label>
                <textarea
                  required
                  rows={2}
                  value={newPros}
                  onChange={(e) => setNewPros(e.target.value)}
                  placeholder="Преподаватели, аудитории, стипендии..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Минусы и сложности:</label>
                <textarea
                  rows={2}
                  value={newCons}
                  onChange={(e) => setNewCons(e.target.value)}
                  placeholder="Что расстроило или к чему готовиться..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Опубликовать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Window Banner */}
      <SingleWindowBanner onOpenMyPlan={() => onOpenMyPlan?.()} lang={lang} />
    </div>
  );
};
