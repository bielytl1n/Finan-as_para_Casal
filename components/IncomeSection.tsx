import React from 'react';
import { DollarSign, PieChart as PieIcon, Edit3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, sanitizeString } from '../utils.ts';

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
  
  // Ensure we don't pass NaNs or negatives to the chart
  const validIncomeA = Number.isFinite(incomeA) ? Math.max(0, incomeA) : 0;
  const validIncomeB = Number.isFinite(incomeB) ? Math.max(0, incomeB) : 0;

  const chartData = [
    { name: nameA || 'Pessoa A', value: validIncomeA, percent: percentageA },
    { name: nameB || 'Pessoa B', value: validIncomeB, percent: percentageB },
  ].filter(d => d.value > 0);

  // Handler seguro para inputs numéricos
  const handleIncomeChange = (val: string, setter: (v: number) => void) => {
    if (val === '') {
      setter(0);
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setter(Math.max(0, num));
    }
  };

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
                onChange={(e) => setNameA(sanitizeString(e.target.value))}
                className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-blue-400 placeholder-slate-400 focus:ring-0 p-0 w-full"
                placeholder="Nome Pessoa 1"
              />
              <Edit3 className="w-3 h-3 text-slate-400" />
            </div>
            <input 
              type="number" 
              value={incomeA > 0 ? incomeA : ''} 
              onChange={(e) => handleIncomeChange(e.target.value, setIncomeA)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="R$ 0,00"
            />
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Contribuição: {Number.isFinite(percentageA) ? percentageA.toFixed(1) : '0.0'}%
            </div>
          </div>

          {/* Pessoa B */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent focus-within:border-pink-200 dark:focus-within:border-pink-900 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <input 
                type="text"
                value={nameB}
                onChange={(e) => setNameB(sanitizeString(e.target.value))}
                className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-pink-400 placeholder-slate-400 focus:ring-0 p-0 w-full"
                placeholder="Nome Pessoa 2"
              />
              <Edit3 className="w-3 h-3 text-slate-400" />
            </div>
            <input 
              type="number" 
              value={incomeB > 0 ? incomeB : ''} 
              onChange={(e) => handleIncomeChange(e.target.value, setIncomeB)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="R$ 0,00"
            />
            <div className="text-xs font-semibold text-pink-600 dark:text-pink-400">
              Contribuição: {Number.isFinite(percentageB) ? percentageB.toFixed(1) : '0.0'}%
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Total Acumulado:</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalIncome)}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[250px] transition-colors">
        {totalIncome > 0 && chartData.length > 0 ? (
          <div className="w-full h-full min-h-[200px] flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center">Distribuição</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="50%" 
                    outerRadius="80%" 
                    paddingAngle={5} 
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${formatCurrency(value)} (${props.payload.percent?.toFixed(1)}%)`,
                      name
                    ]}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-600 dark:text-slate-300 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
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