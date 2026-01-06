
import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, TrendingUp, CheckCircle, Moon, Sun, ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';

import { CategoryType, Expense, IncomeItem, CreditCard } from './types.ts';
import { 
    loadFromStorage, saveToStorage, generateId, 
    migrateIncomeStorage, calculateTotalIncome, migrateExpenses,
    getMonthYearKey, getMonthName, isSameMonth, addMonths,
    formatCurrency
} from './utils.ts';

import { IncomeSection } from './components/IncomeSection.tsx';
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { SmartExpenseForm } from './components/SmartExpenseForm.tsx';
import { CategoryGrid } from './components/CategoryGrid.tsx';
import { FinancialAgenda } from './components/FinancialAgenda.tsx';
import { BudgetAlerts, AlertData } from './components/BudgetAlerts.tsx';
import { CreditCardManager } from './components/CreditCardManager.tsx';

function App() {
  // --- STATE TEMPORAL ---
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // --- PREFERÊNCIAS & DADOS ---
  const [darkMode, setDarkMode] = useState<boolean>(() => loadFromStorage<boolean>('cf_darkmode', false));
  const [nameA, setNameA] = useState<string>(() => loadFromStorage<string>('cf_nameA', 'Gabriel'));
  const [nameB, setNameB] = useState<string>(() => loadFromStorage<string>('cf_nameB', 'Odaiane'));

  // Rendas
  const [incomeListA, setIncomeListA] = useState<IncomeItem[]>(() => migrateIncomeStorage('cf_incomeA'));
  const [incomeListB, setIncomeListB] = useState<IncomeItem[]>(() => migrateIncomeStorage('cf_incomeB'));
  
  // Cartões de Crédito (NOVO)
  const [cards, setCards] = useState<CreditCard[]>(() => loadFromStorage<CreditCard[]>('cf_cards', []));

  // Despesas
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => {
      const stored = loadFromStorage<any[]>('cf_expenses', []);
      return migrateExpenses(stored);
  });
  
  // Estado para controlar alertas dispensados
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // --- PERSISTÊNCIA ---
  useEffect(() => saveToStorage('cf_darkmode', darkMode), [darkMode]);
  useEffect(() => saveToStorage('cf_nameA', nameA), [nameA]);
  useEffect(() => saveToStorage('cf_nameB', nameB), [nameB]);
  useEffect(() => saveToStorage('cf_incomeA', incomeListA), [incomeListA]);
  useEffect(() => saveToStorage('cf_incomeB', incomeListB), [incomeListB]);
  useEffect(() => saveToStorage('cf_expenses', allExpenses), [allExpenses]);
  useEffect(() => saveToStorage('cf_cards', cards), [cards]);

  // Dark Mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Limpa alertas dispensados quando muda o mês
  useEffect(() => {
    setDismissedAlerts([]);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // --- MOTOR DE RECORRÊNCIA ---
  useEffect(() => {
    const checkRecurrence = () => {
        // Verifica se já tem dados neste mês (baseado na data de competência)
        const hasDataForCurrentMonth = allExpenses.some(e => isSameMonth(new Date(e.date), currentDate.toISOString()));
        
        if (!hasDataForCurrentMonth) {
            // Se não tem, olha o mês anterior
            const prevDate = addMonths(currentDate, -1);
            const prevMonthExpenses = allExpenses.filter(e => isSameMonth(new Date(e.date), prevDate.toISOString()));
            
            // Filtra os que são recorrentes
            const recurringToClone = prevMonthExpenses.filter(e => e.isRecurring);
            
            if (recurringToClone.length > 0) {
                const newClones = recurringToClone.map(e => {
                    // Calcula nova data mantendo o dia
                    const oldDate = new Date(e.date);
                    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), oldDate.getDate());
                    
                    // Se tiver vencimento, ajusta para mês atual também
                    let newDueDate = newDate;
                    if (e.dueDate) {
                         const oldDue = new Date(e.dueDate);
                         newDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), oldDue.getDate());
                    }
                    
                    return {
                        ...e,
                        id: generateId(),
                        date: newDate.toISOString(),
                        dueDate: newDueDate.toISOString(),
                        isPaid: false 
                    };
                });
                
                setAllExpenses(prev => [...prev, ...newClones]);
            }
        }
    };
    
    checkRecurrence();
  }, [currentDate.getMonth()]);

  // --- DADOS FILTRADOS (VIEW ATUAL) ---
  const currentExpenses = useMemo(() => {
    return allExpenses.filter(e => {
        const refDate = e.dueDate || e.date;
        return isSameMonth(new Date(refDate), currentDate.toISOString());
    });
  }, [allExpenses, currentDate]);

  // --- CÁLCULOS FINANCEIROS ---
  const incomeA = calculateTotalIncome(incomeListA);
  const incomeB = calculateTotalIncome(incomeListB);
  const totalIncome = incomeA + incomeB;
  
  const percentageA = totalIncome > 0 ? (incomeA / totalIncome) * 100 : 0;
  const percentageB = totalIncome > 0 ? (incomeB / totalIncome) * 100 : 0;

  const limits = {
      essential: totalIncome * 0.50,
      lifestyle: totalIncome * 0.30,
      goals: totalIncome * 0.20
  };

  const totals = useMemo(() => {
    return currentExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<CategoryType, number>);
  }, [currentExpenses]);

  const totalSpent = (Object.values(totals) as number[]).reduce((a, b) => a + b, 0);

  // --- LÓGICA DE ALERTAS ---
  const activeAlerts = useMemo(() => {
    const alerts: AlertData[] = [];
    const categories = [
      { id: CategoryType.ESSENTIAL, limit: limits.essential, label: 'Essencial' },
      { id: CategoryType.LIFESTYLE, limit: limits.lifestyle, label: 'Estilo de Vida' },
      { id: CategoryType.GOALS, limit: limits.goals, label: 'Objetivos' },
    ];

    categories.forEach(cat => {
      if (cat.limit <= 0) return;
      const spent = totals[cat.id] || 0;
      const pct = (spent / cat.limit) * 100;

      if (dismissedAlerts.includes(cat.id)) return;

      if (pct > 100) {
        alerts.push({
          id: cat.id,
          label: cat.label,
          type: 'danger',
          message: `excedeu o limite em ${formatCurrency(spent - cat.limit)}`,
          pct: pct
        });
      } else if (pct >= 85) {
        alerts.push({
          id: cat.id,
          label: cat.label,
          type: 'warning',
          message: `atingiu ${pct.toFixed(0)}% do orçamento`,
          pct: pct
        });
      }
    });

    return alerts;
  }, [totals, limits, dismissedAlerts]);

  // --- HANDLERS ---
  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense = { ...expenseData, id: generateId() };
    setAllExpenses(prev => [...prev, newExpense]);
  };

  const handleRemoveExpense = (id: string) => {
    setAllExpenses(prev => prev.filter(ex => ex.id !== id));
  };

  const handleTogglePaid = (id: string) => {
    setAllExpenses(prev => prev.map(e => e.id === id ? { ...e, isPaid: !e.isPaid } : e));
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => addMonths(prev, delta));
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 pb-12">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-black/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight hidden sm:block">CasalFinanças</h1>
                </div>

                {/* MONTH NAVIGATOR */}
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900 rounded-full px-2 py-1 border border-slate-200 dark:border-slate-800">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-semibold text-sm">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span className="capitalize">{getMonthName(currentDate)}</span>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {installPrompt && (
                        <button 
                            onClick={handleInstallClick}
                            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-full transition-colors animate-pulse"
                        >
                            <Download className="w-4 h-4" />
                            Instalar App
                        </button>
                    )}

                    <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* 1. RENDA */}
        <IncomeSection 
          nameA={nameA} setNameA={setNameA} itemsA={incomeListA} setItemsA={setIncomeListA}
          nameB={nameB} setNameB={setNameB} itemsB={incomeListB} setItemsB={setIncomeListB}
          totalIncome={totalIncome} percentageA={percentageA} percentageB={percentageB}
        />

        {/* 2. DASHBOARD GRID & AGENDA */}
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                
                <BudgetAlerts alerts={activeAlerts} onDismiss={handleDismissAlert} />

                {/* 2.1 Cards de Categoria */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                         <h2 className="text-lg font-bold">Visão Geral</h2>
                         <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                            Gasto: {formatCurrency(totalSpent)}
                         </span>
                    </div>
                    <CategoryGrid 
                        expenses={currentExpenses}
                        onRemove={handleRemoveExpense}
                        limits={limits}
                        nameA={nameA} nameB={nameB}
                        percentageA={percentageA} percentageB={percentageB}
                    />
                </section>

                {/* 2.2 Gerenciador de Cartões (NOVO) */}
                <section>
                    <CreditCardManager cards={cards} setCards={setCards} />
                </section>

                {/* 2.3 Formulário Inteligente */}
                <section>
                    <SmartExpenseForm onAdd={handleAddExpense} currentDate={currentDate} cards={cards} />
                </section>
            </div>

            {/* 2.4 Agenda Lateral */}
            <div className="lg:col-span-1">
                <FinancialAgenda 
                    expenses={currentExpenses}
                    incomesA={incomeListA}
                    incomesB={incomeListB}
                    currentDate={currentDate}
                    onTogglePaid={handleTogglePaid}
                />
            </div>
        </div>

        {/* 3. IA ADVISOR */}
        <AIAdvisor 
          summary={{
            totalIncome, totalSpent,
            spentEssential: totals[CategoryType.ESSENTIAL] || 0, limitEssential: limits.essential,
            spentLifestyle: totals[CategoryType.LIFESTYLE] || 0, limitLifestyle: limits.lifestyle,
            spentGoals: totals[CategoryType.GOALS] || 0, limitGoals: limits.goals,
            monthName: getMonthName(currentDate)
          }}
          expenses={currentExpenses}
        />

      </main>

      <footer className="w-full py-8 text-center border-t border-slate-200 dark:border-slate-800 mt-12 bg-white dark:bg-slate-950">
        <p className="text-sm text-slate-500">CasalFinanças 4.0 &bull; Dashboard Inteligente</p>
      </footer>
    </div>
  );
}

export default App;
