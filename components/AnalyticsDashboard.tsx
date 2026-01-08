
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CategoryType, Expense } from '../types.ts';
import { formatCurrency } from '../utils.ts';

interface Props {
  expenses: Expense[];
  totalIncome: number;
  totalSpent: number;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

export const AnalyticsDashboard: React.FC<Props> = ({ expenses, totalIncome, totalSpent }) => {
  
  // Dados para o Gráfico de Rosca (Por Categoria)
  const pieData = React.useMemo(() => {
    const categories = {
      [CategoryType.ESSENTIAL]: 0,
      [CategoryType.LIFESTYLE]: 0,
      [CategoryType.GOALS]: 0
    };

    expenses.forEach(e => {
      if (categories[e.category] !== undefined) {
        categories[e.category] += e.amount;
      }
    });

    return [
      { name: 'Essencial', value: categories[CategoryType.ESSENTIAL], color: '#6366f1' }, // Indigo
      { name: 'Estilo', value: categories[CategoryType.LIFESTYLE], color: '#ec4899' }, // Pink
      { name: 'Objetivos', value: categories[CategoryType.GOALS], color: '#10b981' }, // Emerald
    ].filter(d => d.value > 0);
  }, [expenses]);

  // Dados para o Gráfico de Barras (Receita vs Despesa)
  const barData = [
    { name: 'Receita', valor: totalIncome },
    { name: 'Despesa', valor: totalSpent },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Gráfico 1: Despesas por Categoria */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-w-0">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Gastos por Pilar</h3>
        {/* CORREÇÃO: Container com altura e largura explícitas (h-64 w-full) */}
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">Sem dados</div>
          )}
        </div>
      </div>

      {/* Gráfico 2: Balanço Mensal */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col min-w-0">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Fluxo do Mês</h3>
        {/* CORREÇÃO: Container com altura e largura explícitas (h-64 w-full) */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={60} />
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 formatter={(value: number) => formatCurrency(value)}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={32}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
