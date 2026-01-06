
import { IncomeItem, Expense, CreditCard, CategoryType, EXPENSE_CATEGORIES } from './types.ts';

// --- DATA HELPERS ---

export const getMonthYearKey = (date: Date): string => {
  return `${date.getMonth()}-${date.getFullYear()}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}`;
};

export const getMonthName = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

export const isSameMonth = (date1: Date, dateString: string): boolean => {
  if (!dateString) return false;
  const d2 = new Date(dateString);
  return date1.getMonth() === d2.getMonth() && date1.getFullYear() === d2.getFullYear();
};

export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

// --- LOGICA DE CARTÃO DE CRÉDITO (Best Day) ---

/**
 * Calcula a data de vencimento baseada na data da compra e no dia de fechamento.
 * Se compra >= fechamento -> Vence no mês seguinte (ou atual+1 dependendo da logica de virada).
 */
export const calculateCardDueDate = (purchaseDateIso: string, card: CreditCard): string => {
  const pDate = new Date(purchaseDateIso);
  // Ajuste de fuso horário simples (considerando input date yyyy-mm-dd)
  const purchaseDay = pDate.getUTCDate(); 
  
  let targetMonth = pDate.getUTCMonth();
  let targetYear = pDate.getUTCFullYear();

  // Se comprou no dia do fechamento ou depois, só paga na próxima fatura
  if (purchaseDay >= card.closingDay) {
    targetMonth++; 
  }

  // Se o dia de vencimento for menor que o de fechamento, geralmente significa mês seguinte também
  // Mas simplificando: O vencimento é sempre no mês alvo calculado acima, a menos que o vencimento seja dia 1-5 e fechamento 25-31, ai pula mês.
  // Regra padrão de mercado: Vencimento é X dias após fechamento.
  // Vamos assumir a regra simples: Data calculada = Mês Alvo e Dia de Vencimento.
  
  // Ajuste de ano
  if (targetMonth > 11) {
    targetMonth = 0;
    targetYear++;
  }

  // Cria a data de vencimento (usando UTC para evitar problemas de fuso no ISO)
  const dueDate = new Date(Date.UTC(targetYear, targetMonth, card.dueDay));
  return dueDate.toISOString().split('T')[0];
};

// --- HELPER DE CATEGORIA ---

export const getPillarFromSubCategory = (sub: string): CategoryType => {
  for (const [pillar, subs] of Object.entries(EXPENSE_CATEGORIES)) {
    if (subs.includes(sub)) return pillar as CategoryType;
  }
  return CategoryType.ESSENTIAL; // Fallback
};

// --- CURRENCY ---

export const formatCurrency = (val: number): string => {
  if (isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- STORAGE & MIGRATION ---

export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
  }
};

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null") return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Erro ao carregar ${key}, usando fallback.`, error);
    return fallback;
  }
};

export const migrateExpenses = (expenses: any[]): Expense[] => {
  const now = new Date().toISOString();
  return expenses.map(e => ({
    ...e,
    name: sanitizeString(e.name || 'Despesa'),
    date: e.date || now,
    dueDate: e.dueDate || e.date || now,
    isPaid: e.isPaid !== undefined ? e.isPaid : false,
    isRecurring: e.isRecurring !== undefined ? e.isRecurring : false,
    subCategory: e.subCategory || 'Outros',
    // Novos campos vêm default se não existirem
    paymentMethod: e.paymentMethod || 'DEBIT',
    cardId: e.cardId || undefined
  }));
};

export const migrateIncomeStorage = (key: string): IncomeItem[] => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    
    const parsed = JSON.parse(item);
    const now = new Date().toISOString().split('T')[0];
    
    if (typeof parsed === 'number') {
      if (parsed === 0) return [];
      return [{
        id: 'legacy_migration',
        name: 'Salário Base',
        amount: parsed,
        type: 'FIXED',
        isRecurring: true,
        receiptDate: now
      }];
    }
    
    if (Array.isArray(parsed)) {
       return parsed.map(p => ({
         ...p,
         name: sanitizeString(p.name || 'Renda'),
         isRecurring: p.isRecurring !== undefined ? p.isRecurring : true,
         receiptDate: p.receiptDate || now
       }));
    }
    
    return [];
  } catch (error) {
    console.error(`Erro na migração de ${key}:`, error);
    return [];
  }
};

export const calculateTotalIncome = (items: IncomeItem[]): number => {
  return items.reduce((acc, item) => acc + item.amount, 0);
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const sanitizeString = (str: string): string => {
  if (!str) return '';
  if (typeof str !== 'string') return String(str);
  
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>{}[\]`\\]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 100)
    .trim();
};
