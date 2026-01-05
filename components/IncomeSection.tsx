import React from 'react';
import { DollarSign, PieChart as PieIcon, Edit3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils.ts';

interface Props {
  nameA: string;
  setNameA: (val: string) => void;
  incomeA: number;
  setIncomeA: (val: number) => void;
  nameB: string;
  setNameB: (val: string) => void;
  incomeB: number;
  setIncomeB: (val: number) => void;
  totalIncome: number;
  percentageA: number;
  percentageB: number;
}

const COLORS = ['#3b82f6', '#ec4899']; // Azul e Rosa

export const IncomeSection: React.FC<Props> = ({
  nameA, setNameA, incomeA, setIncomeA, 
  nameB, setNameB, incomeB, setIncomeB, 
  totalIncome, percentageA, percentageB
}) => {
  
  const chartData = [
    { name: nameA || 'Pessoa A', value: incomeA },
    { name: nameB || 'Pessoa B', value: incomeB },
  ].filter(d => d.value > 0);

  return (
    <section className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Renda do Casal
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pessoa A */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent focus-within:border-blue-200 dark:focus-within:border-blue-900 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <input 
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-blue-400 placeholder-slate-400 focus:ring-0 p-0 w-full"
                placeholder="Nome Pessoa 1"
              />
              <Edit3 className="w-3 h-3 text-slate-400" />
            </div>
            <input 
              type="number" 
              value={incomeA || ''} 
              onChange={(e) => setIncomeA(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="R$ 0,00"
            />
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">Contribuição: {percentageA.toFixed(1)}%</div>
          </div>

          {/* Pessoa B */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent focus-within:border-pink-200 dark:focus-within:border-pink-900 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <input 
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-pink-400 placeholder-slate-400 focus:ring-0 p-0 w-full"
                placeholder="Nome Pessoa 2"
              />
              <Edit3 className="w-3 h-3 text-slate-400" />
            </div>
            <input 
              type="number" 
              value={incomeB || ''} 
              onChange={(e) => setIncomeB(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="R$ 0,00"
            />
            <div className="text-xs font-semibold text-pink-600 dark:text-pink-400">Contribuição: {percentageB.toFixed(1)}%</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Total Acumulado:</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalIncome)}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[200px] transition-colors">
        {totalIncome > 0 ? (
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)} 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-slate-400 mt-2">Distribuição Proporcional</p>
          </div>
        ) : (
          <div className="text-center text-slate-400 dark:text-slate-600">
            <PieIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Adicione rendas para ver o gráfico</p>
          </div>
        )}
      </div>
    </section>
  );
};