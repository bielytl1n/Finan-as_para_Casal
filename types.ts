
export enum CategoryType {
  ESSENTIAL = 'Essencial (50%)',
  LIFESTYLE = 'Estilo de Vida (30%)',
  GOALS = 'Objetivos (20%)'
}

// Subcategorias para melhor organização
export type EssentialSubCategory = 'Moradia' | 'Mercado' | 'Saúde' | 'Educação' | 'Transporte' | 'Outros';
export type LifestyleSubCategory = 'Lazer' | 'Restaurantes' | 'Assinaturas' | 'Viagem' | 'Compras' | 'Outros';
export type GoalsSubCategory = 'Reserva' | 'Investimentos' | 'Aposentadoria' | 'Dívidas' | 'Outros';

export type SubCategoryType = EssentialSubCategory | LifestyleSubCategory | GoalsSubCategory;

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: CategoryType;
  subCategory?: string; // Nova: Subcategoria específica
  date: string; // Data de competência/criação (ISO)
  dueDate?: string; // Nova: Data de vencimento (ISO)
  isPaid: boolean; // Nova: Status do pagamento
  isRecurring: boolean; // Nova: Se deve repetir mês que vem
}

export type IncomeType = 'FIXED' | 'VARIABLE';

export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  type: IncomeType;
  receiptDate?: string; // Nova: Dia esperado de recebimento
  isRecurring?: boolean; // Nova: Se repete mensalmente
}

export interface FinancialSummary {
  totalIncome: number;
  totalSpent: number;
  spentEssential: number;
  limitEssential: number;
  spentLifestyle: number;
  limitLifestyle: number;
  spentGoals: number;
  limitGoals: number;
  monthName: string; // Nova
}
