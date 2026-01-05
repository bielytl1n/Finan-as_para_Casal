import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, TrendingUp, CheckCircle, Moon, Sun } from 'lucide-react';

// Imports locais com extensão explícita
import { CategoryType, Expense } from './types.ts';
import { loadFromStorage, saveToStorage, generateId, formatCurrency } from './utils.ts';
import { Card } from './components/ui/Card.tsx';
import { IncomeSection } from './components/IncomeSection.tsx';
import { ExpenseList } from './components/ExpenseList.tsx';
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { SmartExpenseForm } from './components/SmartExpenseForm.tsx';

function App() {
  // --- STATE ---
  // Preferências
  const [darkMode, setDarkMode] = useState<boolean>(() => loadFromStorage<boolean>('cf_darkmode', false));
  const [nameA, setNameA] = useState<string>(() => loadFromStorage<string>('cf_nameA', 'João'));
  const [nameB, setNameB] = useState<string>(() => loadFromStorage<string>('cf_nameB', 'Maria'));

  // Dados Financeiros
  const [incomeA, setIncomeA] = useState<number>(() => loadFromStorage<number>('cf_incomeA', 0));
  const [incomeB, setIncomeB] = useState<number>(() => loadFromStorage<number>('cf_incomeB', 0));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage<Expense[]>('cf_expenses', []));

  // --- PERSISTENCE ---
  useEffect(() => saveToStorage('cf_darkmode', darkMode), [darkMode]);
  useEffect(() => saveToStorage('cf_nameA', nameA), [nameA]);
  useEffect(() => saveToStorage('cf_nameB', nameB), [nameB]);
  useEffect(() => saveToStorage('cf_incomeA', incomeA), [incomeA]);
  useEffect(() => saveToStorage('cf_incomeB', incomeB), [incomeB]);
  useEffect(() => saveToStorage('cf_expenses', expenses), [expenses]);

  // --- DARK MODE CLASS TOGGLE ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- CALCULATIONS ---
  const totalIncome = incomeA + incomeB;
  
  // Percentuais de contribuição
  const percentageA = totalIncome > 0 ? (incomeA / totalIncome) * 100 : 0;
  const percentageB = totalIncome > 0 ? (incomeB / totalIncome) * 100 : 0;

  // Metas 50-30-20
  const limitEssential = totalIncome * 0.50;
  const limitLifestyle = totalIncome * 0.30;
  const limitGoals = totalIncome * 0.20;

  // Totais gastos por categoria
  const totals = useMemo(() => {
    return expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<CategoryType, number>);
  }, [expenses]);

  const spentEssential = totals[CategoryType.ESSENTIAL] || 0;
  const spentLifestyle = totals[CategoryType.LIFESTYLE] || 0;
  const spentGoals = totals[CategoryType.GOALS] || 0;
  const totalSpent = spentEssential + spentLifestyle + spentGoals;

  // --- HANDLERS ---
  const handleAddExpense = (name: string, amount: number, category: CategoryType) => {
    const newExpense: Expense = {
      id: generateId(),
      name,
      amount,
      category,
      date: new Date().toISOString()
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(prev => prev.filter(ex => ex.id !== id));
  };

  const getStatus = (spent: number, limit: number) => {
    if (limit === 0) return 'neutral';
    if (spent > limit) return 'danger';
    if (spent > limit * 0.8) return 'warning';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-10 font-sans transition-colors duration-300 flex flex-col">
      {/* HEADER */}
      <header className="bg-slate-900 dark:bg-black text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">CasalFinanças</h1>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
            title={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 flex-grow w-full">
        
        {/* 1. RENDA & NOMES */}
        <IncomeSection 
          nameA={nameA} setNameA={setNameA}
          incomeA={incomeA} setIncomeA={setIncomeA}
          nameB={nameB} setNameB={setNameB}
          incomeB={incomeB} setIncomeB={setIncomeB}
          totalIncome={totalIncome}
          percentageA={percentageA} percentageB={percentageB}
        />

        {/* 2. DASHBOARD 50/30/20 */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Metas do Mês (Regra 50-30-20)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              title="Essenciais (50%)"
              value={formatCurrency(spentEssential)}
              limit={formatCurrency(limitEssential)}
              status={getStatus(spentEssential, limitEssential)}
              subValue={spentEssential > limitEssential ? 'Meta Estourada!' : 'Dentro da meta'}
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <Card 
              title="Estilo de Vida (30%)"
              value={formatCurrency(spentLifestyle)}
              limit={formatCurrency(limitLifestyle)}
              status={getStatus(spentLifestyle, limitLifestyle)}
              subValue={spentLifestyle > limitLifestyle ? 'Atenção aos gastos' : 'Aproveite'}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <Card 
              title="Objetivos (20%)"
              value={formatCurrency(spentGoals)}
              limit={formatCurrency(limitGoals)}
              status={spentGoals >= limitGoals ? 'success' : 'neutral'}
              subValue={spentGoals < limitGoals ? 'Invista mais' : 'Parabéns!'}
              icon={<Wallet className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* 3. DESPESAS */}
        <section className="grid lg:grid-cols-3 gap-8">
          {/* FORMULÁRIO IA */}
          <div className="lg:col-span-1 h-fit">
            <SmartExpenseForm onAdd={handleAddExpense} />
          </div>

          {/* LISTA */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-bold text-lg dark:text-slate-200">Histórico de Contas</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">{expenses.length} lançamentos</span>
            </div>
            <ExpenseList 
              expenses={expenses}
              percentageA={percentageA}
              percentageB={percentageB}
              nameA={nameA}
              nameB={nameB}
              onRemove={handleRemoveExpense}
            />
          </div>
        </section>

        {/* 4. IA ADVISOR */}
        <AIAdvisor 
          summary={{
            totalIncome,
            totalSpent,
            spentEssential,
            limitEssential,
            spentLifestyle,
            limitLifestyle,
            spentGoals,
            limitGoals
          }}
          expenses={expenses}
        />

      </main>

      <footer className="w-full py-6 text-center border-t border-slate-200 dark:border-slate-800 mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Feito por <span className="font-semibold text-indigo-600 dark:text-indigo-400">DevGabriel</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
          Versão 3.0
        </p>
      </footer>
    </div>
  );
}

export default App;