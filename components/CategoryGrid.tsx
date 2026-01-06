
import React, { useState } from 'react';
import { Home, ShoppingBag, Target, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react';
import { Expense, CategoryType } from '../types.ts';
import { formatCurrency } from '../utils.ts';
import { ExpenseList } from './ExpenseList.tsx';

interface Props {
  expenses: Expense[];
  onRemove: (id: string) => void;
  limits: { essential: number; lifestyle: number; goals: number };
  percentageA: number; percentageB: number; nameA: string; nameB: string;
}

// Configuração de Temas por Categoria (Design System)
const THEME_CONFIG = {
    [CategoryType.ESSENTIAL]: {
        icon: Home,
        label: 'Essencial',
        // Light: Fundo Azul Claro / Texto Azul Forte
        // Dark: Fundo Azul Escuro Transp. / Texto Azul Claro
        colors: {
            iconBg: 'bg-blue-50 dark:bg-blue-500/10',
            iconText: 'text-blue-600 dark:text-blue-400',
            bar: 'bg-blue-600 dark:bg-blue-500',
            barBg: 'bg-blue-100 dark:bg-slate-700'
        }
    },
    [CategoryType.LIFESTYLE]: {
        icon: ShoppingBag,
        label: 'Estilo de Vida',
        colors: {
            iconBg: 'bg-purple-50 dark:bg-purple-500/10',
            iconText: 'text-purple-600 dark:text-purple-400',
            bar: 'bg-purple-600 dark:bg-purple-500',
            barBg: 'bg-purple-100 dark:bg-slate-700'
        }
    },
    [CategoryType.GOALS]: {
        icon: Target,
        label: 'Objetivos',
        colors: {
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
            iconText: 'text-emerald-600 dark:text-emerald-400',
            bar: 'bg-emerald-600 dark:bg-emerald-500',
            barBg: 'bg-emerald-100 dark:bg-slate-700'
        }
    }
};

interface CategoryCardProps {
    type: CategoryType; 
    total: number; 
    limit: number; 
    expenses: Expense[];
    onRemove: (id: string) => void;
    percentageA: number; percentageB: number; nameA: string; nameB: string;
    icon?: React.ReactNode; // Slot para ícone customizado
}

const CategoryCard = ({ 
    type, total, limit, expenses, onRemove, percentageA, percentageB, nameA, nameB, icon 
}: CategoryCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const theme = THEME_CONFIG[type];
    const Icon = theme.icon;
    
    const progress = limit > 0 ? (total / limit) * 100 : 0;
    const isOver = total > limit;

    return (
        <>
        <div 
            onClick={() => setIsOpen(true)}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
        >
            <div className="flex justify-between items-start mb-6">
                {/* Ícone com Container Colorido */}
                <div className={`p-3.5 rounded-xl ${theme.colors.iconBg} ${theme.colors.iconText} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                
                {/* Indicador de Alerta ou Seta */}
                {isOver ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Estourou</span>
                    </div>
                ) : (
                    <div className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300" />
                    </div>
                )}
            </div>
            
            {/* Títulos e Valores */}
            <div className="space-y-1 mb-5">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {theme.label}
                </h3>
                
                {/* Slot para ícone proeminente */}
                {icon && (
                    <div className="py-2 animate-in slide-in-from-left-2 fade-in duration-300">
                        {icon}
                    </div>
                )}

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(total)}
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        / {formatCurrency(limit)}
                    </span>
                </div>
            </div>

            {/* Progress Bar Minimalista */}
            <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                <div 
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out ${isOver ? 'bg-red-500' : theme.colors.bar}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            
            <div className="mt-3 flex justify-between items-center text-xs">
                <span className={`${isOver ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                    {progress.toFixed(0)}% da meta
                </span>
                {expenses.length > 0 && (
                    <span className="text-slate-400 dark:text-slate-600">
                        {expenses.length} lançamentos
                    </span>
                )}
            </div>
        </div>

        {/* Modal de Detalhes */}
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div 
                    className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${theme.colors.iconBg} ${theme.colors.iconText}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{theme.label}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Detalhamento de despesas</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                        >
                            <span className="sr-only">Fechar</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                        <ExpenseList 
                            expenses={expenses}
                            nameA={nameA} nameB={nameB}
                            percentageA={percentageA} percentageB={percentageB}
                            onRemove={onRemove}
                        />
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export const CategoryGrid: React.FC<Props> = ({ expenses, onRemove, limits, percentageA, percentageB, nameA, nameB }) => {
  const getExpenses = (cat: CategoryType) => expenses.filter(e => e.category === cat);
  const getTotal = (cat: CategoryType) => getExpenses(cat).reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="grid md:grid-cols-3 gap-6">
        <CategoryCard 
            type={CategoryType.ESSENTIAL}
            total={getTotal(CategoryType.ESSENTIAL)}
            limit={limits.essential}
            expenses={getExpenses(CategoryType.ESSENTIAL)}
            onRemove={onRemove}
            percentageA={percentageA}
            percentageB={percentageB}
            nameA={nameA}
            nameB={nameB}
        />
        <CategoryCard 
            type={CategoryType.LIFESTYLE}
            total={getTotal(CategoryType.LIFESTYLE)}
            limit={limits.lifestyle}
            expenses={getExpenses(CategoryType.LIFESTYLE)}
            onRemove={onRemove}
            percentageA={percentageA}
            percentageB={percentageB}
            nameA={nameA}
            nameB={nameB}
        />
        <CategoryCard 
            type={CategoryType.GOALS}
            total={getTotal(CategoryType.GOALS)}
            limit={limits.goals}
            expenses={getExpenses(CategoryType.GOALS)}
            onRemove={onRemove}
            percentageA={percentageA}
            percentageB={percentageB}
            nameA={nameA}
            nameB={nameB}
        />
    </div>
  );
};
