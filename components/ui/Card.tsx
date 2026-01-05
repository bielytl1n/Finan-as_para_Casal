import React from 'react';

interface CardProps {
  title: string;
  value: string;
  subValue?: string;
  limit?: string;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, value, subValue, limit, status = 'neutral', icon }) => {
  const getColors = () => {
    switch (status) {
      case 'success': return 'border-l-emerald-500 text-emerald-900 dark:text-emerald-400';
      case 'warning': return 'border-l-amber-500 text-amber-900 dark:text-amber-400';
      case 'danger': return 'border-l-rose-500 text-rose-900 dark:text-rose-400 bg-red-50 dark:bg-red-900/10';
      default: return 'border-l-slate-300 text-slate-900 dark:text-slate-100';
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 ${getColors()} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>
      <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
        {value}
      </div>
      {(subValue || limit) && (
        <div className="mt-3 pt-2 border-t border-slate-100/50 dark:border-slate-800 text-xs flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span className="font-medium">{subValue}</span>
          {limit && <span>Meta: {limit}</span>}
        </div>
      )}
    </div>
  );
};