import React from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { UNIVERSITIES } from '../data/mockData';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const CityModal: React.FC<CityModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
}) => {
  if (!isOpen) return null;

  // Extract cities and count universities in each
  const cityCounts: { [key: string]: number } = {};
  UNIVERSITIES.forEach((v) => {
    cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
  });

  const allCities = ['Все города', ...Object.keys(cityCounts).sort()];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Выберите город обучения</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-2 gap-2">
          {allCities.map((city) => {
            const isSelected = selectedCity === city;
            const count = city === 'Все города' ? UNIVERSITIES.length : cityCounts[city] || 0;

            return (
              <button
                key={city}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm font-medium transition ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:border-brand-500 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                  <span className="truncate">{city}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
