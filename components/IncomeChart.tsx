import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface IncomeChartProps {
  incomeA: number;
  incomeB: number;
  percentageA: number;
  percentageB: number;
}

const COLORS = ['#3b82f6', '#ec4899']; // Blue for A, Pink for B

export const IncomeChart: React.FC<IncomeChartProps> = ({ incomeA, incomeB, percentageA, percentageB }) => {
  const data = [
    { name: 'Pessoa A', value: incomeA, percent: percentageA },
    { name: 'Pessoa B', value: incomeB, percent: percentageB },
  ];

  if (incomeA === 0 && incomeB === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <p className="text-slate-400 text-sm">Insira os salários para ver o gráfico</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-white p-4 rounded-lg shadow-sm border border-slate-100">
      <h3 className="text-center text-sm font-semibold text-slate-700 mb-2">Proporção de Renda</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs mt-[-10px]">
        <span className="text-blue-600 font-bold">{percentageA.toFixed(1)}%</span>
        <span className="text-pink-600 font-bold">{percentageB.toFixed(1)}%</span>
      </div>
    </div>
  );
};