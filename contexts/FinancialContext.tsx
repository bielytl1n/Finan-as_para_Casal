
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User, signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../services/firebase.ts';
import { 
    CategoryType, Expense, IncomeItem, CreditCard, BankAccount, FinancialGoal 
} from '../types.ts';
import { 
    calculateTotalIncome, formatCurrency, generateId, isSameMonth, addMonths
} from '../utils.ts';
import { AlertData } from '../components/BudgetAlerts.tsx';

// --- INTERFACES ---
interface UserProfile { firstName: string; lastName: string; }
interface Limits { essential: number; lifestyle: number; goals: number; }

interface FinancialContextType {
  // Auth & Sync
  user: User | null;
  loading: boolean;
  logout: () => void;
  householdId: string;
  joinHousehold: (id: string) => Promise<void>;

  // UI State
  activeTab: string; setActiveTab: (t: string) => void;
  currentDate: Date; changeMonth: (d: number) => void;
  darkMode: boolean; setDarkMode: (m: boolean) => void;
  
  // Data State (Read/Write via Firebase wrappers)
  profileA: UserProfile; setProfileA: (p: UserProfile) => void;
  profileB: UserProfile; setProfileB: (p: UserProfile) => void;
  
  incomeListA: IncomeItem[]; setIncomeListA: (l: IncomeItem[]) => void;
  incomeListB: IncomeItem[]; setIncomeListB: (l: IncomeItem[]) => void;
  
  cards: CreditCard[]; setCards: (c: CreditCard[]) => void;
  accounts: BankAccount[]; setAccounts: (a: BankAccount[]) => void;
  
  allExpenses: Expense[]; 
  currentExpenses: Expense[];
  
  // Actions
  handleAddExpense: (e: Omit<Expense, 'id'>) => void;
  handleRemoveExpense: (id: string) => void;
  handleTogglePaid: (id: string) => void;
  
  // Computed
  totalIncome: number; incomeA: number; incomeB: number;
  percentageA: number; percentageB: number;
  totalSpent: number; 
  totals: Record<CategoryType, number>; 
  limits: Limits;
  
  // Alerts
  activeAlerts: AlertData[]; 
  dismissedAlerts: string[]; 
  setDismissedAlerts: React.Dispatch<React.SetStateAction<string[]>>;
  
  // PWA (Kept local)
  installPrompt: any; showInstallBanner: boolean; 
  setShowInstallBanner: (b: boolean) => void;
  handleInstallClick: () => Promise<void>;

  // Backwards Compatibility for DataManagement
  allExpensesSetter: (e: Expense[]) => void; 
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string>('');

  // UI States (Local)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // PWA State (Local)
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // DATA STATES (Synced)
  const [profileA, setLocalProfileA] = useState<UserProfile>({ firstName: 'Gabriel', lastName: '' });
  const [profileB, setLocalProfileB] = useState<UserProfile>({ firstName: 'Daiane', lastName: '' });
  const [incomeListA, setLocalIncomeListA] = useState<IncomeItem[]>([]);
  const [incomeListB, setLocalIncomeListB] = useState<IncomeItem[]>([]);
  const [cards, setLocalCards] = useState<CreditCard[]>([]);
  const [accounts, setLocalAccounts] = useState<BankAccount[]>([]);
  const [allExpenses, setLocalExpenses] = useState<Expense[]>([]);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Por padrão, usa o UID do usuário como ID da casa
        // Em um cenário futuro, leríamos um campo 'householdId' do documento do usuário
        setHouseholdId(currentUser.uid);
      } else {
        setHouseholdId('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Realtime Database Listener
  useEffect(() => {
    if (!householdId) return;

    const houseRef = doc(db, 'households', householdId);
    
    // Escuta TUDO dessa casa em tempo real
    const unsubscribe = onSnapshot(houseRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profileA) setLocalProfileA(data.profileA);
        if (data.profileB) setLocalProfileB(data.profileB);
        if (data.incomeListA) setLocalIncomeListA(data.incomeListA);
        if (data.incomeListB) setLocalIncomeListB(data.incomeListB);
        if (data.cards) setLocalCards(data.cards);
        if (data.accounts) setLocalAccounts(data.accounts);
        if (data.expenses) setLocalExpenses(data.expenses);
      } else {
        // Se não existe, cria o documento inicial
        setDoc(houseRef, { 
            createdAt: new Date(), 
            owner: user?.email,
            profileA, profileB, expenses: [], cards: [], accounts: [],
            incomeListA: [], incomeListB: []
        }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [householdId]);

  // --- ACTIONS (Write to Cloud) ---
  const updateCloud = (field: string, value: any) => {
    if (!householdId) return;
    updateDoc(doc(db, 'households', householdId), { [field]: value }).catch(console.error);
  };

  const setProfileA = (p: UserProfile) => updateCloud('profileA', p);
  const setProfileB = (p: UserProfile) => updateCloud('profileB', p);
  const setIncomeListA = (l: IncomeItem[]) => updateCloud('incomeListA', l);
  const setIncomeListB = (l: IncomeItem[]) => updateCloud('incomeListB', l);
  const setCards = (c: CreditCard[]) => updateCloud('cards', c);
  const setAccounts = (a: BankAccount[]) => updateCloud('accounts', a);
  const setAllExpenses = (e: Expense[]) => updateCloud('expenses', e); // Full overwrite (Import/Sync)

  const handleAddExpense = (data: Omit<Expense, 'id'>) => {
    if (!householdId) return;
    const newExpense = { ...data, id: generateId() };
    updateDoc(doc(db, 'households', householdId), {
      expenses: arrayUnion(newExpense)
    });
  };

  const handleRemoveExpense = (id: string) => {
    if (!householdId) return;
    const expenseToRemove = allExpenses.find(e => e.id === id);
    if (expenseToRemove) {
      updateDoc(doc(db, 'households', householdId), {
        expenses: arrayRemove(expenseToRemove)
      });
    }
  };

  const handleTogglePaid = (id: string) => {
    if (!householdId) return;
    // Firestore não atualiza item de array facilmente. 
    // Estratégia simples: Localiza, modifica e reescreve todo o array (ok para <1000 itens)
    // Estratégia ideal: Subcoleção 'expenses', mas manteremos estrutura simples array.
    const updated = allExpenses.map(e => e.id === id ? { ...e, isPaid: !e.isPaid } : e);
    setAllExpenses(updated);
  };

  const joinHousehold = async (targetId: string) => {
     setHouseholdId(targetId);
     // Nota: Em prod, salvar isso no perfil do usuario ('users' collection)
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => addMonths(prev, delta));
  };

  // --- UI & ALERTS ---
  
  // PWA Logic
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
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
      setShowInstallBanner(false);
    }
  };
  
  // Dark Mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Clear alerts on month change
  useEffect(() => {
    setDismissedAlerts([]);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);


  // --- COMPUTED VALUES ---
  const currentExpenses = useMemo(() => {
    return allExpenses.filter(e => {
        // Fallback para e.date se dueDate não existir
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

  return (
    <FinancialContext.Provider value={{
      user, loading, logout: () => signOut(auth), householdId, joinHousehold,
      
      activeTab, setActiveTab, currentDate, changeMonth, darkMode, setDarkMode,
      
      profileA, setProfileA, profileB, setProfileB,
      incomeListA, setIncomeListA, incomeListB, setIncomeListB,
      cards, setCards, accounts, setAccounts,
      allExpenses, currentExpenses, 
      
      handleAddExpense, handleRemoveExpense, handleTogglePaid,
      
      totalIncome, incomeA, incomeB, percentageA, percentageB, totalSpent, totals, limits,
      
      activeAlerts, dismissedAlerts, setDismissedAlerts,
      
      installPrompt, showInstallBanner, setShowInstallBanner, handleInstallClick,
      
      allExpensesSetter: setAllExpenses
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be used within a FinancialProvider');
  return context;
};
