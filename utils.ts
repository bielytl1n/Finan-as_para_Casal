
import { IncomeItem, Expense } from './types.ts';

// --- DATA HELPERS ---

export const getMonthYearKey = (date: Date): string => {
  return `${date.getMonth()}-${date.getFullYear()}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // Tenta lidar com ISO e YYYY-MM-DD
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
    // Basic XSS check on load, though sanitizeString handles input
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Erro ao carregar ${key}, usando fallback.`, error);
    return fallback;
  }
};

// Migração 4.0: Garante que todos os itens tenham data
export const migrateExpenses = (expenses: any[]): Expense[] => {
  const now = new Date().toISOString();
  return expenses.map(e => ({
    ...e,
    name: sanitizeString(e.name || 'Despesa'),
    date: e.date || now,
    dueDate: e.dueDate || e.date || now,
    isPaid: e.isPaid !== undefined ? e.isPaid : false,
    isRecurring: e.isRecurring !== undefined ? e.isRecurring : false,
    subCategory: e.subCategory || 'Outros'
  }));
};

export const migrateIncomeStorage = (key: string): IncomeItem[] => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    
    const parsed = JSON.parse(item);
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
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

/**
 * SECURITY: Stronger sanitization against XSS
 * Removes HTML tags, script attempts, and dangerous attributes.
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  if (typeof str !== 'string') return String(str);
  
  return str
    // Remove tags HTML
    .replace(/<[^>]*>?/gm, '')
    // Remove caracteres perigosos para injeção
    .replace(/[<>{}[\]`\\]/g, '')
    // Remove tentativas de protocolo javascript
    .replace(/javascript:/gi, '')
    // Remove handlers de eventos comuns
    .replace(/on\w+=/gi, '')
    // Limita tamanho
    .slice(0, 100)
    .trim();
};
