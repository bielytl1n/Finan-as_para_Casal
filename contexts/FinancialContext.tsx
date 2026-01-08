
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
    CategoryType, Expense, IncomeItem, CreditCard, BankAccount, 
    FinancialGoal, FinancialSummary 
} from '../types.ts';
import { 
    loadFromStorage, saveToStorage, generateId, 
    migrateIncomeStorage, calculateTotalIncome, migrateExpenses,
    getMonthName, addMonths, isSameMonth, formatCurrency
} from '../utils.ts';
import { BANKS_DATA } from '../constants/banks.tsx';
import { AlertData } from '../components/BudgetAlerts.tsx';

// --- INTERFACES AUXILIARES ---
interface UserProfile {
  firstName: string;
  lastName: string;
}

interface Limits {
    essential: number;
    lifestyle: number;
    goals: number;
}

// --- TIPO DO CONTEXTO ---
interface FinancialContextType {
  // Navigation & UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentDate: Date;
  changeMonth: (delta: number) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  
  // Profiles
  profileA: UserProfile;
  setProfileA: React.Dispatch<React.SetStateAction<UserProfile>>;
  profileB: UserProfile;
  setProfileB: React.Dispatch<React.SetStateAction<UserProfile>>;
  
  // Data State
  incomeListA: IncomeItem[];
  setIncomeListA: React.Dispatch<React.SetStateAction<IncomeItem[]>>;
  incomeListB: IncomeItem[];
  setIncomeListB: React.Dispatch<React.SetStateAction<IncomeItem[]>>;
  cards: CreditCard[];
  setCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  allExpenses: Expense[];
  setAllExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  
  // Computed Data
  currentExpenses: Expense[];
  incomeA: number;
  incomeB: number;
  totalIncome: number;
  percentageA: number;
  percentageB: number;
  totalSpent: number;
  totals: Record<CategoryType, number>;
  limits: Limits;
  
  // Alerts
  activeAlerts: AlertData[];
  dismissedAlerts: string[];
  setDismissedAlerts: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Actions
  handleAddExpense: (expenseData: Omit<Expense, 'id'>) => void;
  handleRemoveExpense: (id: string) => void;
  handleTogglePaid: (id: string) => void;
  
  // PWA
  installPrompt: any;
  showInstallBanner: boolean;
  setShowInstallBanner: (show: boolean) => void;
  handleInstallClick: () => Promise<void>;
}

// --- HELPER DE MIGRAÇÃO (Movido do App.tsx) ---
const loadProfile = (keyOld: string, keyNew: string, defaultFirst: string, defaultLast: string): UserProfile => {
  const storedNew = localStorage.getItem(keyNew);
  if (storedNew) {
      try { return JSON.parse(storedNew); } catch (e) { console.error(e); }
  }
  const storedOld = localStorage.getItem(keyOld);
  if (storedOld) {
      try {
          const rawName = JSON.parse(storedOld);
          if (typeof rawName === 'string') {
              const parts = rawName.trim().split(' ');
              const firstName = parts[0] || defaultFirst;
              const lastName = parts.slice(1).join(' ') || defaultLast;
              return { firstName, lastName };
          }
      } catch (e) { console.error(e); }
  }
  return { firstName: defaultFirst, lastName: defaultLast };
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [darkMode, setDarkMode] = useState<boolean>(() => loadFromStorage<boolean>('cf_darkmode', false));
  
  // Dados Principais
  const [profileA, setProfileA] = useState<UserProfile>(() => loadProfile('cf_nameA', 'cf_profileA', 'Gabriel', 'Queiroz'));
  const [profileB, setProfileB] = useState<UserProfile>(() => loadProfile('cf_nameB', 'cf_profileB', 'Daiane', 'Rodrigues'));
  const [incomeListA, setIncomeListA] = useState<IncomeItem[]>(() => migrateIncomeStorage('cf_incomeA'));
  const [incomeListB, setIncomeListB] = useState<IncomeItem[]>(() => migrateIncomeStorage('cf_incomeB'));
  const [cards, setCards] = useState<CreditCard[]>(() => loadFromStorage<CreditCard[]>('cf_cards', []));
  const [accounts, setAccounts] = useState<BankAccount[]>(() => loadFromStorage<BankAccount[]>('cf_accounts', []));
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => {
      const stored = loadFromStorage<any[]>('cf_expenses', []);
      return migrateExpenses(stored);
  });

  // UI States
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // --- PERSISTÊNCIA ---
  useEffect(() => saveToStorage('cf_darkmode', darkMode), [darkMode]);
  useEffect(() => saveToStorage('cf_profileA', profileA), [profileA]);
  useEffect(() => saveToStorage('cf_profileB', profileB), [profileB]);
  useEffect(() => saveToStorage('cf_incomeA', incomeListA), [incomeListA]);
  useEffect(() => saveToStorage('cf_incomeB', incomeListB), [incomeListB]);
  useEffect(() => saveToStorage('cf_expenses', allExpenses), [allExpenses]);
  useEffect(() => saveToStorage('cf_cards', cards), [cards]);
  useEffect(() => saveToStorage('cf_accounts', accounts), [accounts]);

  // Dark Mode Class
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Limpa alertas ao mudar mês
  useEffect(() => {
    setDismissedAlerts([]);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // PWA Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- RECORRÊNCIA ---
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

  const limits = useMemo(() => ({
      essential: totalIncome * 0.50,
      lifestyle: totalIncome * 0.30,
      goals: totalIncome * 0.20
  }), [totalIncome]);

  const totals = useMemo(() => {
    return currentExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<CategoryType, number>);
  }, [currentExpenses]);

  const totalSpent = (Object.values(totals) as number[]).reduce((a, b) => a + b, 0);

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

  // --- ACTIONS ---
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

  return (
    <FinancialContext.Provider value={{
        activeTab, setActiveTab,
        currentDate, changeMonth,
        darkMode, setDarkMode,
        profileA, setProfileA,
        profileB, setProfileB,
        incomeListA, setIncomeListA,
        incomeListB, setIncomeListB,
        cards, setCards,
        accounts, setAccounts,
        allExpenses, setAllExpenses,
        currentExpenses,
        incomeA, incomeB, totalIncome, percentageA, percentageB,
        totalSpent, totals, limits,
        activeAlerts, dismissedAlerts, setDismissedAlerts,
        handleAddExpense, handleRemoveExpense, handleTogglePaid,
        installPrompt, showInstallBanner, setShowInstallBanner, handleInstallClick
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
