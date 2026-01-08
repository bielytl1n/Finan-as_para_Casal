
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon, Download } from 'lucide-react';

import { CategoryType, Expense, IncomeItem, CreditCard, BankAccount } from './types.ts';
import { 
    loadFromStorage, saveToStorage, generateId, 
    migrateIncomeStorage, calculateTotalIncome, migrateExpenses,
    getMonthName, addMonths, isSameMonth, formatCurrency
} from './utils.ts';

// Legacy Components (To be used in specific tabs)
import { IncomeSection } from './components/IncomeSection.tsx';
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { SmartExpenseForm } from './components/SmartExpenseForm.tsx';
import { CategoryGrid } from './components/CategoryGrid.tsx';
import { FinancialAgenda } from './components/FinancialAgenda.tsx';
import { BudgetAlerts, AlertData } from './components/BudgetAlerts.tsx';
import { CreditCardManager } from './components/CreditCardManager.tsx';
import { AccountManager } from './components/AccountManager.tsx';
import { InstallPrompt } from './components/InstallPrompt.tsx';

// New Components (V2.0)
import { Sidebar } from './components/Sidebar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { FinancialGoals } from './components/FinancialGoals.tsx';
import { SmartAlerts } from './components/SmartAlerts.tsx';

// --- TYPES LOCAL ---
interface UserProfile {
  firstName: string;
  lastName: string;
}

// --- MIGRATION HELPER ---
const loadProfile = (keyOld: string, keyNew: string, defaultFirst: string, defaultLast: string): UserProfile => {
  // 1. Tenta carregar o formato novo
  const storedNew = localStorage.getItem(keyNew);
  if (storedNew) {
      try { return JSON.parse(storedNew); } catch (e) { console.error(e); }
  }

  // 2. Se não existir, tenta migrar do formato antigo (String única)
  const storedOld = localStorage.getItem(keyOld);
  if (storedOld) {
      try {
          const rawName = JSON.parse(storedOld); // ex: "Gabriel Queiroz"
          if (typeof rawName === 'string') {
              const parts = rawName.trim().split(' ');
              const firstName = parts[0] || defaultFirst;
              const lastName = parts.slice(1).join(' ') || defaultLast;
              return { firstName, lastName };
          }
      } catch (e) { console.error(e); }
  }

  // 3. Fallback
  return { firstName: defaultFirst, lastName: defaultLast };
};

function App() {
  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- STATE TEMPORAL ---
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // --- PREFERÊNCIAS & DADOS ---
  const [darkMode, setDarkMode] = useState<boolean>(() => loadFromStorage<boolean>('cf_darkmode', false));
  
  // PERFIS (Refatorado para Objeto)
  const [profileA, setProfileA] = useState<UserProfile>(() => loadProfile('cf_nameA', 'cf_profileA', 'Gabriel', 'Queiroz'));
  const [profileB, setProfileB] = useState<UserProfile>(() => loadProfile('cf_nameB', 'cf_profileB', 'Daiane', 'Rodrigues'));

  // Rendas
  const [incomeListA, setIncomeListA] = useState<IncomeItem[]>(() => migrateIncomeStorage('cf_incomeA'));
  const [incomeListB, setIncomeListB] = useState<IncomeItem[]>(() => migrateIncomeStorage('cf_incomeB'));
  
  // Contas e Cartões (ATIVOS E PASSIVOS)
  const [cards, setCards] = useState<CreditCard[]>(() => loadFromStorage<CreditCard[]>('cf_cards', []));
  const [accounts, setAccounts] = useState<BankAccount[]>(() => loadFromStorage<BankAccount[]>('cf_accounts', []));

  // Despesas
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => {
      const stored = loadFromStorage<any[]>('cf_expenses', []);
      return migrateExpenses(stored);
  });
  
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // --- PERSISTÊNCIA ---
  useEffect(() => saveToStorage('cf_darkmode', darkMode), [darkMode]);
  useEffect(() => saveToStorage('cf_profileA', profileA), [profileA]); // Salva novo formato
  useEffect(() => saveToStorage('cf_profileB', profileB), [profileB]); // Salva novo formato
  useEffect(() => saveToStorage('cf_incomeA', incomeListA), [incomeListA]);
  useEffect(() => saveToStorage('cf_incomeB', incomeListB), [incomeListB]);
  useEffect(() => saveToStorage('cf_expenses', allExpenses), [allExpenses]);
  useEffect(() => saveToStorage('cf_cards', cards), [cards]);
  useEffect(() => saveToStorage('cf_accounts', accounts), [accounts]);

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
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- MOTOR DE RECORRÊNCIA ---
  useEffect(() => {
    const checkRecurrence = () => {
        const hasDataForCurrentMonth = allExpenses.some(e => isSameMonth(new Date(e.date), currentDate.toISOString()));
        
        if (!hasDataForCurrentMonth) {
            const prevDate = addMonths(currentDate, -1);
            const prevMonthExpenses = allExpenses.filter(e => isSameMonth(new Date(e.date), prevDate.toISOString()));
            const recurringToClone = prevMonthExpenses.filter(e => e.isRecurring);
            
            if (recurringToClone.length > 0) {
                const newClones = recurringToClone.map(e => {
                    const oldDate = new Date(e.date);
                    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), oldDate.getDate());
                    
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

  // --- DADOS COMPUTADOS ---
  const currentExpenses = useMemo(() => {
    return allExpenses.filter(e => {
        const refDate = e.dueDate || e.date;
        return isSameMonth(new Date(refDate), currentDate.toISOString());
    });
  }, [allExpenses, currentDate]);

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

  // --- ALERTAS LEGADO ---
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
        alerts.push({ id: cat.id, label: cat.label, type: 'danger', message: `excedeu o limite em ${formatCurrency(spent - cat.limit)}`, pct: pct });
      } else if (pct >= 85) {
        alerts.push({ id: cat.id, label: cat.label, type: 'warning', message: `atingiu ${pct.toFixed(0)}% do orçamento`, pct: pct });
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

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  // --- HEADER COMPONENT (Internal) ---
  const HeaderControls = () => (
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-4 z-30 mb-6">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 flex-1 justify-between sm:justify-center border border-slate-200 dark:border-slate-700">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><ChevronLeft className="w-4 h-4" /></button>
              <div className="flex items-center gap-2 px-2 font-bold text-sm text-slate-700 dark:text-slate-200 min-w-[120px] justify-center">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="capitalize">{getMonthName(currentDate)}</span>
              </div>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 transition-colors">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* 1. SIDEBAR (Desktop) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        <HeaderControls />

        {/* --- VIEW: DASHBOARD (Home) --- */}
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Top: Accounts + Analytics */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <AccountManager accounts={accounts} setAccounts={setAccounts} nameA={profileA.firstName} nameB={profileB.firstName} />
                        <FinancialGoals />
                    </div>
                    <div className="lg:col-span-2">
                        <AnalyticsDashboard expenses={currentExpenses} totalIncome={totalIncome} totalSpent={totalSpent} />
                        <div className="mt-6">
                            <SmartAlerts totalIncome={totalIncome} totalSpent={totalSpent} remainingEssential={limits.essential - (totals[CategoryType.ESSENTIAL] || 0)} />
                        </div>
                    </div>
                </div>

                {/* Middle: Cards Carousel (NOW WITH PROFILES) */}
                <div>
                     <CreditCardManager 
                        cards={cards} 
                        setCards={setCards}
                        profileA={profileA}
                        profileB={profileB}
                     />
                </div>
            </div>
        )}

        {/* --- VIEW: TRANSACTIONS (Lançamentos) --- */}
        {activeTab === 'transactions' && (
            <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 space-y-8">
                    <BudgetAlerts alerts={activeAlerts} onDismiss={(id) => setDismissedAlerts([...dismissedAlerts, id])} />
                    
                    {/* Updated IncomeSection to handle first names */}
                    <IncomeSection 
                        firstNameA={profileA.firstName} 
                        setFirstNameA={(v) => setProfileA(p => ({...p, firstName: v}))} 
                        itemsA={incomeListA} setItemsA={setIncomeListA}
                        
                        firstNameB={profileB.firstName} 
                        setFirstNameB={(v) => setProfileB(p => ({...p, firstName: v}))} 
                        itemsB={incomeListB} setItemsB={setIncomeListB}
                        
                        totalIncome={totalIncome} percentageA={percentageA} percentageB={percentageB}
                        currentDate={currentDate}
                    />

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Detalhamento por Categoria</h3>
                        <CategoryGrid 
                            expenses={currentExpenses} onRemove={handleRemoveExpense} limits={limits}
                            percentageA={percentageA} percentageB={percentageB} 
                            nameA={profileA.firstName} nameB={profileB.firstName}
                        />
                    </div>
                    
                    <SmartExpenseForm onAdd={handleAddExpense} currentDate={currentDate} cards={cards} />
                </div>

                <div className="lg:col-span-1">
                    <FinancialAgenda 
                        expenses={currentExpenses} incomesA={incomeListA} incomesB={incomeListB}
                        currentDate={currentDate} onTogglePaid={handleTogglePaid}
                    />
                </div>
            </div>
        )}

        {/* --- VIEW: WALLET (Carteira) --- */}
        {activeTab === 'wallet' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold">Minha Carteira</h2>
                <AccountManager accounts={accounts} setAccounts={setAccounts} nameA={profileA.firstName} nameB={profileB.firstName} />
                <CreditCardManager cards={cards} setCards={setCards} profileA={profileA} profileB={profileB} />
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
            </div>
        )}

        {/* --- VIEW: PROFILE (Perfil) --- */}
        {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto py-12 text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                    <span className="text-4xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Configuração de Perfil</h2>
                <p className="text-slate-500 mb-8">Defina os nomes para exibição e cartões.</p>
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-6">
                    
                    {/* Perfil A */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                         <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Perfil A (Ele)</h3>
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Primeiro Nome</label>
                                <input 
                                    value={profileA.firstName} 
                                    onChange={e => setProfileA({...profileA, firstName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Gabriel"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Sobrenome</label>
                                <input 
                                    value={profileA.lastName} 
                                    onChange={e => setProfileA({...profileA, lastName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Queiroz"
                                />
                            </div>
                         </div>
                    </div>

                    {/* Perfil B */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                         <h3 className="text-sm font-bold text-pink-600 dark:text-pink-400 mb-3 uppercase tracking-wider">Perfil B (Ela)</h3>
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Primeiro Nome</label>
                                <input 
                                    value={profileB.firstName} 
                                    onChange={e => setProfileB({...profileB, firstName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Daiane"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Sobrenome</label>
                                <input 
                                    value={profileB.lastName} 
                                    onChange={e => setProfileB({...profileB, lastName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Rodrigues"
                                />
                            </div>
                         </div>
                    </div>

                    {installPrompt && (
                        <button onClick={handleInstallClick} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex justify-center gap-2 items-center mt-4">
                            <Download className="w-4 h-4" /> Instalar App
                        </button>
                    )}
                </div>
            </div>
        )}

      </main>

      {/* 3. BOTTOM NAV (Mobile) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {installPrompt && showInstallBanner && (
          <InstallPrompt onInstall={handleInstallClick} onDismiss={() => setShowInstallBanner(false)} />
      )}
    </div>
  );
}

export default App;
