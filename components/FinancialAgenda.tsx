
import React, { useMemo } from 'react';
import { CheckCircle2, Circle, AlertCircle, CalendarClock } from 'lucide-react';
import { Expense, IncomeItem } from '../types.ts';
import { formatCurrency } from '../utils.ts';

interface Props {
  expenses: Expense[];
  incomesA: IncomeItem[];
  incomesB: IncomeItem[];
  currentDate: Date;
  onTogglePaid: (id: string) => void;
}

interface TimelineItem {
  id: string;
  day: number;
  name: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  status: 'PAID' | 'PENDING' | 'LATE';
  dateObj: Date;
}

export const FinancialAgenda: React.FC<Props> = ({ expenses, incomesA, incomesB, currentDate, onTogglePaid }) => {
  
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];
    const today = new Date();
    
    // Process Expenses
    expenses.forEach(e => {
        const d = new Date(e.dueDate || e.date);
        const isLate = !e.isPaid && d < today && d.getMonth() === today.getMonth();
        items.push({
            id: e.id,
            day: d.getDate(),
            name: e.name,
            amount: e.amount,
            type: 'EXPENSE',
            status: e.isPaid ? 'PAID' : (isLate ? 'LATE' : 'PENDING'),
            dateObj: d
        });
    });

    // Process Incomes (Assume recebimento dia 5 se não especificado)
    [...incomesA, ...incomesB].forEach(i => {
        const day = i.receiptDate ? new Date(i.receiptDate).getDate() : 5;
        items.push({
            id: i.id,
            day: day,
            name: i.name,
            amount: i.amount,
            type: 'INCOME',
            status: 'PAID', // Incomes are assumed available
            dateObj: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        });
    });

    return items.sort((a, b) => a.day - b.day);
  }, [expenses, incomesA, incomesB, currentDate]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 h-full">
      <div className="flex items-center gap-2 mb-6">
        <CalendarClock className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-slate-800 dark:text-white">Agenda Financeira</h3>
      </div>

      <div className="space-y-0 relative">
        {/* Linha vertical */}
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>

        {timelineItems.length === 0 ? (
           <p className="text-center text-sm text-slate-400 py-4">Nenhum evento para este mês.</p>
        ) : (
           timelineItems.map((item, idx) => (
             <div key={`${item.id}-${idx}`} className="relative flex items-center gap-4 py-3 z-10">
                {/* Data Badge */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm z-10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{item.dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-none">{item.day}</span>
                </div>

                {/* Conteúdo */}
                <div className={`flex-1 flex justify-between items-center p-3 rounded-lg border ${item.type === 'INCOME' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                    <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${item.status === 'PAID' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                            {item.name}
                        </span>
                        {item.status === 'LATE' && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Atrasado</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>
                            {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                        </span>
                        
                        {item.type === 'EXPENSE' && (
                            <button 
                                onClick={() => onTogglePaid(item.id)}
                                className={`transition-colors ${item.status === 'PAID' ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                            >
                                {item.status === 'PAID' ? <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-900/30" /> : <Circle className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
};
