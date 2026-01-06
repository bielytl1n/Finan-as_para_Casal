
import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, CalendarClock, ArrowUpCircle, ArrowDownCircle, LayoutList } from 'lucide-react';
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

type FilterType = 'ALL' | 'EXPENSE' | 'INCOME';

export const FinancialAgenda: React.FC<Props> = ({ expenses, incomesA, incomesB, currentDate, onTogglePaid }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  
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

  const filteredItems = useMemo(() => {
      if (filter === 'ALL') return timelineItems;
      return timelineItems.filter(item => item.type === filter);
  }, [timelineItems, filter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Agenda</h3>
        </div>

        {/* Filter Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
            <button 
                onClick={() => setFilter('ALL')}
                className={`p-1.5 rounded-md transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Tudo"
            >
                <LayoutList className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setFilter('INCOME')}
                className={`p-1.5 rounded-md transition-all ${filter === 'INCOME' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Entradas"
            >
                <ArrowUpCircle className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setFilter('EXPENSE')}
                className={`p-1.5 rounded-md transition-all ${filter === 'EXPENSE' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500 dark:text-red-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Saídas"
            >
                <ArrowDownCircle className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="space-y-0 relative flex-1">
        {/* Linha vertical */}
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>

        {filteredItems.length === 0 ? (
           <div className="text-center py-8">
               <p className="text-sm text-slate-400 mb-1">Nenhum registro encontrado.</p>
               <p className="text-xs text-slate-300 dark:text-slate-600">Tente mudar o filtro ou o mês.</p>
           </div>
        ) : (
           filteredItems.map((item, idx) => (
             <div key={`${item.id}-${idx}`} className="relative flex items-center gap-4 py-3 z-10 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                {/* Data Badge */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm z-10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{item.dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-none">{item.day}</span>
                </div>

                {/* Conteúdo */}
                <div className={`flex-1 flex justify-between items-center p-3 rounded-lg border transition-colors ${item.type === 'INCOME' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                    <div className="flex flex-col min-w-0 pr-2">
                        <span className={`text-sm font-semibold truncate ${item.status === 'PAID' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                            {item.name}
                        </span>
                        {item.status === 'LATE' && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Atrasado</span>}
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm font-bold whitespace-nowrap ${item.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                        </span>
                        
                        {item.type === 'EXPENSE' && (
                            <button 
                                onClick={() => onTogglePaid(item.id)}
                                className={`transition-colors ${item.status === 'PAID' ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                                title={item.status === 'PAID' ? "Marcar como não pago" : "Marcar como pago"}
                            >
                                {item.status === 'PAID' ? <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-900/30" /> : <Circle className="w-5 h-5" />}
                            </button>
                        )}
                        {/* Placeholder para alinhar Incomes que não têm botão de check */}
                        {item.type === 'INCOME' && <div className="w-5 h-5" />}
                    </div>
                </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
};
