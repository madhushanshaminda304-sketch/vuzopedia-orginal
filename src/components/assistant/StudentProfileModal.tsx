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
  SupportedLanguage,
  getDictionary,
} from '../../services/assistant';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
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
  language = 'ru',
  onProfileUpdated,
  onAllDataCleared,
}) => {
  const [profile, setProfile] = useState<StudentProfile>(() => loadStudentProfile());
  const [selectedDomain, setSelectedDomain] = useState<'russia' | 'unipedia'>(() =>
    profile.domainId === 'unipedia_sri_lanka' ? 'unipedia' : 'russia'
  );
  const [unipediaPathway, setUnipediaPathway] = useState<'ugc' | 'private'>('ugc');
  const [newSubject, setNewSubject] = useState(AVAILABLE_SUBJECTS[0]);
  const [newScore, setNewScore] = useState<number>(75);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const dict = getDictionary(language);

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
                <h3 className="font-extrabold text-base text-white">{dict.profileModalTitle}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold">
                  {dict.profileConfirmedBadge}
                </span>
              </div>
              <p className="text-xs text-blue-100">
                {dict.profileSubtitle}
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
          {/* Admissions Domain Selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              data-testid="domain-russia-btn"
              onClick={() => {
                setSelectedDomain('russia');
                setProfile((prev) => ({ ...prev, domainId: 'russia_higher_education' }));
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                selectedDomain === 'russia'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇷🇺</span>
              <span>Россия (Вузопедия)</span>
            </button>
            <button
              type="button"
              data-testid="domain-unipedia-btn"
              onClick={() => {
                setSelectedDomain('unipedia');
                setProfile((prev) => ({ ...prev, domainId: 'unipedia_sri_lanka' }));
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                selectedDomain === 'unipedia'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇱🇰</span>
              <span>Sri Lanka (UniPedia)</span>
            </button>
          </div>

          {selectedDomain === 'unipedia' ? (
            /* UniPedia Sri Lanka Pathway Modeling */
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  data-testid="unipedia-pathway-ugc"
                  onClick={() => setUnipediaPathway('ugc')}
                  className={`pb-1 font-bold text-xs transition border-b-2 -mb-2.5 px-2 ${
                    unipediaPathway === 'ugc'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  🏛️ UGC State University Quota
                </button>
                <button
                  type="button"
                  data-testid="unipedia-pathway-private"
                  onClick={() => setUnipediaPathway('private')}
                  className={`pb-1 font-bold text-xs transition border-b-2 -mb-2.5 px-2 ${
                    unipediaPathway === 'private'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  🏢 Private & Non-State Degrees
                </button>
              </div>

              {unipediaPathway === 'ugc' ? (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        G.C.E. A/L Examination Year:
                      </label>
                      <input
                        type="number"
                        data-testid="unipedia-exam-year-input"
                        value={profile.examYear || 2024}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, examYear: parseInt(e.target.value, 10) || 2024 }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        A/L Stream:
                      </label>
                      <select
                        data-testid="unipedia-stream-select"
                        value={profile.alStream || 'physical_science'}
                        onChange={(e) => setProfile((p) => ({ ...p, alStream: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      >
                        <option value="physical_science">Physical Science (Maths)</option>
                        <option value="biological_science">Biological Science</option>
                        <option value="commerce">Commerce</option>
                        <option value="arts">Arts</option>
                        <option value="engineering_technology">Engineering Technology (ET)</option>
                        <option value="biosystems_technology">Bio-systems Technology (BST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Administrative District:
                      </label>
                      <select
                        data-testid="unipedia-district-select"
                        value={profile.district || 'colombo'}
                        onChange={(e) => setProfile((p) => ({ ...p, district: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      >
                        <option value="colombo">Colombo</option>
                        <option value="gampaha">Gampaha</option>
                        <option value="kalutara">Kalutara</option>
                        <option value="kandy">Kandy</option>
                        <option value="galle">Galle</option>
                        <option value="matara">Matara</option>
                        <option value="jaffna">Jaffna</option>
                        <option value="batticaloa">Batticaloa</option>
                        <option value="kurunegala">Kurunegala</option>
                        <option value="badulla">Badulla</option>
                        <option value="anuradhapura">Anuradhapura</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Official Z-Score:
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        data-testid="unipedia-zscore-input"
                        placeholder="e.g. 1.8421"
                        value={profile.zScore ?? ''}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, zScore: parseFloat(e.target.value) || undefined }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Common General Test (CGT):
                      </label>
                      <input
                        type="number"
                        data-testid="unipedia-cgt-input"
                        placeholder="min 30"
                        value={profile.cgtScore ?? 35}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, cgtScore: parseInt(e.target.value, 10) || undefined }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    <strong>Notice on UGC Quota Evaluation:</strong> State university admission in Sri Lanka is regulated by the UGC via a 40% National Merit, 55% District Quota, and 5% Underprivileged District allocation. Historical minimum Z-scores published in past handbooks reflect past competitive selection and are <em>never</em> guaranteed predictions of future cutoffs.
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Entry Qualification:
                      </label>
                      <select
                        data-testid="unipedia-entry-qual-select"
                        value={profile.entryQualification || 'al_local'}
                        onChange={(e) => setProfile((p) => ({ ...p, entryQualification: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      >
                        <option value="al_local">Local G.C.E. A/L</option>
                        <option value="al_london">Cambridge / Edexcel A-Levels</option>
                        <option value="foundation_slqf3">Recognized University Foundation (SLQF 3)</option>
                        <option value="tvec_nvq">TVEC NVQ Level 4 / 5</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Awarding Institution Type:
                      </label>
                      <select
                        data-testid="unipedia-awarding-body-select"
                        value={profile.awardingInstitutionType || 'local_degree_awarding'}
                        onChange={(e) => setProfile((p) => ({ ...p, awardingInstitutionType: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      >
                        <option value="local_degree_awarding">Sri Lankan Ministry Accredited Degree (e.g. SLIIT, NSBM, CINEC)</option>
                        <option value="foreign_partner_uk_aus">Foreign Partner University (UK / Australia / Ireland)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Annual Tuition Budget (LKR):
                    </label>
                    <input
                      type="number"
                      data-testid="unipedia-budget-input"
                      placeholder="e.g. 750000"
                      value={profile.maxAnnualFee || ''}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, maxAnnualFee: parseInt(e.target.value, 10) || undefined }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}

          {/* Section 5: Transparency & Privacy Notice (Requirement 11) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{dict.privacyNoticeTitle}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {dict.privacyNoticeBody}
            </p>
            {language !== 'ru' && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                {dict.translationDisclaimer}
              </div>
            )}
            <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <span className="text-slate-500">
                Ключ хранилища: <code className="font-mono text-[10px] bg-white dark:bg-slate-900 px-1 py-0.5 rounded">vuzopedia_student_profile_v1</code>
              </span>
              <button
                type="button"
                onClick={() => setShowResetAllConfirm(true)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 font-bold hover:underline"
              >
                {dict.resetAllBtn}
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
                <span>{dict.clearProfileBtn}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {dict.cancelBtn}
            </button>
            <button
              type="button"
              data-testid="save-profile-btn"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{dict.saveProfileBtn}</span>
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
