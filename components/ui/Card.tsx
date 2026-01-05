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
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-l-4 border-emerald-500 bg-white';
      case 'warning': return 'border-l-4 border-yellow-500 bg-white';
      case 'danger': return 'border-l-4 border-rose-500 bg-red-50';
      default: return 'border-l-4 border-slate-200 bg-white';
    }
  };

  const getTextColor = () => {
     switch (status) {
      case 'danger': return 'text-rose-700';
      case 'success': return 'text-emerald-700';
      default: return 'text-slate-900';
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm ${getStatusColor()} transition-all duration-200 hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold ${getTextColor()}`}>
        {value}
      </div>
      {(subValue || limit) && (
        <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
          <span>{subValue}</span>
          {limit && <span className="font-semibold">Teto: {limit}</span>}
        </div>
      )}
    </div>
  );
};