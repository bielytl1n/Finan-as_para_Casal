
import React, { useMemo } from 'react';
import { X, Calendar, DollarSign, CreditCard, ShoppingBag } from 'lucide-react';
import { Expense, CreditCard as CardType } from '../types.ts';
import { formatCurrency, formatDate, calculateCardDueDate } from '../utils.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  card: CardType;
  expenses: Expense[];
}

export const InvoiceModal: React.FC<Props> = ({ isOpen, onClose, card, expenses }) => {
  if (!isOpen) return null;

  // Lógica de Filtro: Despesas do cartão + Competência da Fatura Atual
  const cardExpenses = useMemo(() => {
    const today = new Date();
    // Determinar a data de referência da fatura atual (Mês/Ano)
    let targetMonth = today.getMonth();
    let targetYear = today.getFullYear();

    // Se hoje já passou do dia de fechamento, a fatura atual é a do próximo mês
    if (today.getDate() >= card.closingDay) {
        targetMonth++;
        if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
        }
    }

    return expenses
      .filter(e => {
          if (e.cardId !== card.id) return false;
          
          // Verifica se a despesa pertence a esta fatura
          const expenseDueIso = calculateCardDueDate(e.date, card);
          const expenseDue = new Date(expenseDueIso);
          
          // Comparação de mês/ano (vencimento da despesa == vencimento da fatura)
          return expenseDue.getMonth() === targetMonth && expenseDue.getFullYear() === targetYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, card]);

  const totalInvoice = cardExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header do Cartão */}
        <div 
            className="p-6 relative text-white"
            style={{ backgroundColor: card.color }}
        >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
            >
                <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-3 mb-4 opacity-90">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">{card.name}</span>
            </div>

            <p className="text-xs opacity-80 uppercase tracking-widest mb-1 font-medium">Fatura Atual</p>
            <h2 className="text-4xl font-black flex items-baseline gap-1 tracking-tight">
                <span className="text-xl opacity-70 font-bold">R$</span>
                {totalInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            
            <div className="flex gap-3 mt-5 text-xs font-bold opacity-90">
                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha dia {card.closingDay}
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <DollarSign className="w-3.5 h-3.5" />
                    Vence dia {card.dueDay}
                </div>
            </div>
        </div>

        {/* Lista de Compras */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2 mb-1 flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                Lançamentos ({cardExpenses.length})
            </h3>
            
            {cardExpenses.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">Nenhuma compra nesta fatura.</p>
                </div>
            ) : (
                cardExpenses.map(expense => (
                    <div key={expense.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-bold text-xs flex-col leading-tight">
                                <span>{new Date(expense.date).getDate()}</span>
                                <span className="text-[8px] uppercase">{new Date(expense.date).toLocaleString('pt-BR', { month: 'short' }).slice(0,3)}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{expense.name}</h4>
                                <p className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">{expense.subCategory}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-slate-800 dark:text-slate-100">
                                {formatCurrency(expense.amount)}
                            </span>
                            {expense.installments && (
                                <span className="text-[9px] text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full inline-block mt-1">
                                    {expense.installments.current}/{expense.installments.total}
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
            <button 
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98]"
            >
                Fechar Fatura
            </button>
        </div>
      </div>
    </div>
  );
};
