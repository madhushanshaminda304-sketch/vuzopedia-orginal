import React from 'react';
import { GuidanceView, UNIVERSITIES } from '../../services/assistant';
import { University } from '../../types';

export function ProgrammeGuidancePanel({ guide, onSelectUniversity, onClose }: {
  guide: GuidanceView;
  onSelectUniversity?: (university: University) => void;
  onClose?: () => void;
}) {
  const en = guide.state.language === 'en';
  const steps = ['goal', 'interests', 'education', 'location', 'budget', 'results'];
  const step = steps.indexOf(guide.state.stage);
  return (
    <section aria-label={guide.title} className="space-y-3 pt-3">
      {step >= 0 && <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{guide.title}</span><span>{step + 1} / {steps.length}</span>
        </div>
        <progress aria-label={en ? 'Guidance progress' : 'Этап подбора'} max={steps.length} value={step + 1} className="w-full h-1.5 accent-blue-600" />
      </div>}
      {guide.summary.length > 0 && <details className="text-xs rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
        <summary className="cursor-pointer font-semibold">{en ? 'What you’ve shared' : 'Что вы рассказали'}</summary>
        <ul className="list-disc pl-4 mt-2 space-y-1">{guide.summary.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </details>}
      {guide.recommendations.map(item => {
        const university = UNIVERSITIES.find(u => u.id === item.universityId);
        return <article key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
          <h4 className="font-bold">{item.name}</h4>
          <p className="text-xs text-slate-500">{item.universityName} · {item.city}</p>
          <p>{item.why}</p>
          <p className="text-xs">{en ? 'Consider: ' : 'Учтите: '}{item.tradeoff}</p>
          <p className="text-xs">{item.requirements}</p>
          <p className="font-semibold text-xs">{en ? 'Listed tuition: ' : 'Стоимость в каталоге: '}{item.annualFee.toLocaleString()} RUB / {en ? 'year' : 'год'}</p>
          {guide.state.freeOnly && <p className="text-xs">{en ? 'Funded places are listed; receiving one is not guaranteed.' : 'В каталоге есть бюджетные места; поступление на них не гарантировано.'}</p>}
          <p className="text-xs text-amber-700 dark:text-amber-300">{en ? 'Unverified catalogue information — confirm with admissions.' : 'Данные каталога не проверены — уточните в приёмной комиссии.'}</p>
          {university && onSelectUniversity && <button type="button" className="text-blue-600 dark:text-blue-400 font-semibold py-2 text-xs" onClick={() => { onSelectUniversity(university); onClose?.(); }}>{en ? 'Open university details →' : 'Открыть страницу вуза →'}</button>}
        </article>;
      })}
    </section>
  );
}
