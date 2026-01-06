
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../utils.ts';

interface IncomeChartProps {
  incomeA: number;
  incomeB: number;
  percentageA: number;
  percentageB: number;
  nameA: string;
  nameB: string;
}

const COLORS = ['#3b82f6', '#ec4899']; // Azul (Indigo-500 approx) e Rosa (Pink-500)

export const IncomeChart: React.FC<IncomeChartProps> = ({ incomeA, incomeB, percentageA, percentageB, nameA, nameB }) => {
  const data = [
    { name: nameA || 'Pessoa A', value: incomeA, percent: percentageA },
    { name: nameB || 'Pessoa B', value: incomeB, percent: percentageB },
  ];

  // Estado Vazio
  if (incomeA <= 0 && incomeB <= 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <p className="text-slate-400 text-sm font-medium">Sem dados de renda</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-lg">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">{dataItem.name}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            {formatCurrency(dataItem.value)}
          </p>
          <p className="text-xs text-slate-400">
            {dataItem.percent.toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm relative">
       {/* Título Flutuante Opcional ou Indicador de Centro */}
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="flex flex-col items-center opacity-10 dark:opacity-20">
             <span className="text-4xl font-black text-slate-400">
                {(percentageA + percentageB > 0) ? '100%' : '0%'}
             </span>
          </div>
       </div>

       <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => (
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
