import React from 'react';
import { Expense } from '../types';
import { Trash2 } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  percentageA: number;
  percentageB: number;
  onRemove: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, percentageA, percentageB, onRemove }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <p className="text-slate-500">Nenhuma despesa adicionada ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" className="px-4 py-3">Despesa</th>
            <th scope="col" className="px-4 py-3">Categoria</th>
            <th scope="col" className="px-4 py-3 text-right">Valor Total</th>
            <th scope="col" className="px-4 py-3 text-right text-blue-600">Parte A ({percentageA.toFixed(0)}%)</th>
            <th scope="col" className="px-4 py-3 text-right text-pink-600">Parte B ({percentageB.toFixed(0)}%)</th>
            <th scope="col" className="px-4 py-3 text-center">Ação</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const shareA = expense.amount * (percentageA / 100);
            const shareB = expense.amount * (percentageB / 100);

            return (
              <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{expense.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${expense.category.includes('50') ? 'bg-indigo-100 text-indigo-700' : 
                      expense.category.includes('30') ? 'bg-teal-100 text-teal-700' : 
                      'bg-amber-100 text-amber-700'}`}>
                    {expense.category.split(' ')[0]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right text-blue-600">
                  R$ {shareA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right text-pink-600">
                  R$ {shareB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => onRemove(expense.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Remover despesa"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};