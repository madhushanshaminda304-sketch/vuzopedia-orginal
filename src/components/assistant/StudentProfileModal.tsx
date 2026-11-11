import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  Save,
  Trash2,
  ShieldCheck,
  Plus,
  BookOpen,
  MapPin,
  GraduationCap,
  Wallet,
  Home,
  CheckCircle,
} from 'lucide-react';
import {
  StudentProfile,
  SubjectScore,
  EducationContext,
  BudgetConstraint,
  AccommodationNeed,
  loadStudentProfile,
  saveStudentProfile,
  clearStudentProfile,
  clearAllAssistantData,
} from '../../services/assistant';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: StudentProfile) => void;
  onAllDataCleared?: () => void;
}

const AVAILABLE_SUBJECTS = [
  'Русский язык',
  'Математика (профиль)',
  'Информатика',
  'Физика',
  'Обществознание',
  'Английский язык',
  'Химия',
  'Биология',
  'История',
  'Литература',
  'География',
];

const POPULAR_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Томск',
  'Нижний Новгород',
];

const POPULAR_DIRECTIONS = [
  'Информационные технологии (IT)',
  'Инженерия и робототехника',
  'Экономика и менеджмент',
  'Медицина и здравоохранение',
  'Юриспруденция',
  'Естественные науки',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  onAllDataCleared,
}) => {
  const [profile, setProfile] = useState<StudentProfile>(() => loadStudentProfile());
  const [newSubject, setNewSubject] = useState(AVAILABLE_SUBJECTS[0]);
  const [newScore, setNewScore] = useState<number>(75);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile(loadStudentProfile());
      setShowClearConfirm(false);
      setShowResetAllConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 2500);
  };

  const totalScore = profile.subjects.reduce((sum, s) => sum + (Number(s.score) || 0), 0);

  const handleAddSubject = () => {
    if (profile.subjects.some((s) => s.subject === newSubject)) {
      showNotification(`Предмет «${newSubject}» уже добавлен`);
      return;
    }
    const updatedSubjects = [...profile.subjects, { subject: newSubject, score: Math.min(100, Math.max(0, newScore)) }];
    setProfile((prev) => ({
      ...prev,
      subjects: updatedSubjects,
      totalScore: updatedSubjects.reduce((sum, s) => sum + s.score, 0),
    }));
  };

  const handleRemoveSubject = (subName: string) => {
    const updatedSubjects = profile.subjects.filter((s) => s.subject !== subName);
    setProfile((prev) => ({
      ...prev,
      subjects: updatedSubjects,
      totalScore: updatedSubjects.reduce((sum, s) => sum + s.score, 0),
    }));
  };

  const handleUpdateScore = (subName: string, val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    const updatedSubjects = profile.subjects.map((s) =>
      s.subject === subName ? { ...s, score: clamped } : s
    );
    setProfile((prev) => ({
      ...prev,
      subjects: updatedSubjects,
      totalScore: updatedSubjects.reduce((sum, s) => sum + s.score, 0),
    }));
  };

  const toggleCity = (city: string) => {
    setProfile((prev) => {
      const exists = prev.locationPreferences.includes(city);
      const updated = exists
        ? prev.locationPreferences.filter((c) => c !== city)
        : [...prev.locationPreferences, city];
      return { ...prev, locationPreferences: updated };
    });
  };

  const toggleDirection = (dir: string) => {
    setProfile((prev) => {
      const exists = prev.preferredStudyAreas.includes(dir);
      const updated = exists
        ? prev.preferredStudyAreas.filter((d) => d !== dir)
        : [...prev.preferredStudyAreas, dir];
      return { ...prev, preferredStudyAreas: updated };
    });
  };

  const handleSave = () => {
    const saved = saveStudentProfile({
      ...profile,
      confirmedAt: new Date().toISOString(),
    });
    setProfile(saved);
    if (onProfileUpdated) onProfileUpdated(saved);
    showNotification('Профиль успешно сохранен!');
    setTimeout(() => onClose(), 600);
  };

  const handleClearProfile = () => {
    clearStudentProfile();
    const fresh = loadStudentProfile();
    setProfile(fresh);
    if (onProfileUpdated) onProfileUpdated(fresh);
    setShowClearConfirm(false);
    showNotification('Данные профиля очищены');
  };

  const handleResetAll = () => {
    clearAllAssistantData();
    setShowResetAllConfirm(false);
    if (onAllDataCleared) onAllDataCleared();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div
        data-testid="student-profile-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slideUp text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-4 px-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Профиль абитуриента</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold">
                  Подтверждённые данные
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Только проверенные вами сведения, используемые для персональных рекомендаций
              </p>
            </div>
          </div>

          <button
            data-testid="close-profile-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Education Context */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Образовательный статус:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'school_11', label: '11 класс' },
                { id: 'college_spo', label: 'Диплом СПО / колледж' },
                { id: 'graduate_past_years', label: 'Выпускник прошлых лет' },
                { id: 'bachelor', label: 'Бакалавриат' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setProfile((prev) => ({ ...prev, educationContext: opt.id as EducationContext }))
                  }
                  className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                    profile.educationContext === opt.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Subjects & Scores */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Предметы и баллы ЕГЭ:
              </label>
              <div className="text-right">
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  Сумма: {totalScore} б.
                </span>
              </div>
            </div>

            {/* List of active subjects */}
            {profile.subjects.length > 0 ? (
              <div className="space-y-1.5">
                {profile.subjects.map((s) => (
                  <div
                    key={s.subject}
                    className="flex items-center justify-between gap-3 p-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.subject}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={s.score}
                        onChange={(e) => handleUpdateScore(s.subject, parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-slate-400 text-[11px]">б.</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(s.subject)}
                        className="p-1 hover:text-red-500 text-slate-400 transition"
                        title="Удалить предмет"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Предметы ещё не добавлены. Добавьте ваши сданные предметы или пробные баллы ниже:
              </p>
            )}

            {/* Add subject controls */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              >
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                max={100}
                value={newScore}
                onChange={(e) => setNewScore(parseInt(e.target.value, 10) || 0)}
                className="w-16 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          {/* Section 3: Study Areas & Cities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Интересующие направления:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DIRECTIONS.map((dir) => {
                  const active = profile.preferredStudyAreas.includes(dir);
                  return (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => toggleDirection(dir)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                        active
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-700 dark:text-purple-300'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {dir}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                Предпочитаемые города:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((city) => {
                  const active = profile.locationPreferences.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                        active
                          ? 'bg-red-50 dark:bg-red-950/60 border-red-400 text-red-700 dark:text-red-300'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Budget & Accommodation & Military */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Бюджет / Оплата:
              </label>
              <select
                value={profile.budgetConstraint}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, budgetConstraint: e.target.value as BudgetConstraint }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="any">Любая основа (бюджет / платное)</option>
                <option value="only_budget">Строго только бюджет</option>
                <option value="paid_with_loan">Платное + льготный кредит 3%</option>
                <option value="paid_direct">Готов к платному без кредита</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-blue-600" />
                Общежитие:
              </label>
              <select
                value={profile.accommodationNeed}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, accommodationNeed: e.target.value as AccommodationNeed }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="unspecified">Не имеет значения</option>
                <option value="required">Обязательно требуется</option>
                <option value="not_required">Не требуется</option>
                <option value="local_resident">Местный житель</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(profile.hasMilitaryPreference)}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, hasMilitaryPreference: e.target.checked }))
                  }
                  className="rounded text-blue-600 h-4 w-4"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  🛡️ Военная кафедра (ВУЦ)
                </span>
              </label>
            </div>
          </div>

          {/* Section 5: Transparency & Privacy Notice (Requirement 11) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Политика локального хранения данных</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Все введённые баллы, предметы и история диалогов сохраняются <strong>исключительно в вашем браузере (Local Storage)</strong> на этом устройстве. Данные не передаются на сторонние рекламные трекеры и не используются для обучения публичных моделей. Вы можете в любой момент изменить настройки или полностью удалить все записи.
            </p>
            <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <span className="text-slate-500">
                Ключ хранилища: <code className="font-mono text-[10px] bg-white dark:bg-slate-900 px-1 py-0.5 rounded">vuzopedia_student_profile_v1</code>
              </span>
              <button
                type="button"
                onClick={() => setShowResetAllConfirm(true)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 font-bold hover:underline"
              >
                Сбросить все локальные данные ассистента
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-semibold">Очистить профиль?</span>
                <button
                  type="button"
                  onClick={handleClearProfile}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[11px]"
                >
                  Да
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-[11px]"
                >
                  Нет
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-slate-500 hover:text-red-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить профиль</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Отмена
            </button>
            <button
              type="button"
              data-testid="save-profile-btn"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить профиль</span>
            </button>
          </div>
        </div>

        {/* Reset All Confirm Dialog */}
        {showResetAllConfirm && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
              <h4 className="font-extrabold text-sm text-red-600 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Полный сброс всех данных
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Это действие удалит ваш сохранённый профиль, историю диалогов, чек-лист и список избранных вузов из браузера.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetAllConfirm(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Удалить всё
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastText && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-xl animate-slideDown">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
