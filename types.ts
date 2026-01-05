export enum CategoryType {
  ESSENTIAL = 'Essencial (50%)',
  LIFESTYLE = 'Estilo de Vida (30%)',
  GOALS = 'Objetivos (20%)'
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: CategoryType;
  date: string;
}

export interface FinancialSummary {
  totalIncome: number;
  incomeA: number;
  incomeB: number;
  percentageA: number;
  percentageB: number;
}