import React, { useState } from 'react';
import { Trash2, Filter, XCircle } from 'lucide-react';
import { Expense, CategoryType } from '../types.ts';
import { formatCurrency } from '../utils.ts';

interface Props {
  expenses: Expense[];
  percentageA: number;
  percentageB: number;
  nameA: string;
  nameB: string;
  onRemove: (id: string) => void;
}

export const ExpenseList: React.FC<Props> = ({ expenses, percentageA, percentageB, nameA, nameB, onRemove }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  if (expenses.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma despesa registrada.</p>
      </div>
    );
  }

  const filteredExpenses = expenses.filter(expense => {
    if (filterCategory === 'ALL') return true;
    return expense.category === filterCategory;
  });

  return (
    <div className="space-y-3">
      {/* Filter Controls */}
      <div className="flex justify-end">
        <div className="relative inline-block w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <Filter className="w-4 h-4 text-slate-400" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto pl-8 pr-8 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
          >
            <option value="ALL">Todas as Categorias</option>
            {Object.values(CategoryType).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left bg-white dark:bg-slate-900">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Despesa</th>
                <th className="px-4 py-3">Categ.</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 max-w-[100px] truncate">{nameA || 'Parte A'}</th>
                <th className="px-4 py-3 text-right text-pink-600 dark:text-pink-400 max-w-[100px] truncate">{nameB || 'Parte B'}</th>
                <th className="px-4 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const shareA = expense.amount * (percentageA / 100);
                  const shareB = expense.amount * (percentageB / 100);

                  return (
                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{expense.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {expense.category.split(' ')[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 text-xs">
                        {formatCurrency(shareA)}
                      </td>
                      <td className="px-4 py-3 text-right text-pink-600 dark:text-pink-400 text-xs">
                        {formatCurrency(shareB)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => onRemove(expense.id)}
                          className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                          title="Remover despesa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <XCircle className="w-8 h-8 opacity-20" />
                      <p>Nenhuma despesa encontrada nesta categoria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};