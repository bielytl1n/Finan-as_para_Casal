
export enum CategoryType {
  ESSENTIAL = 'Essencial (50%)',
  LIFESTYLE = 'Estilo de Vida (30%)',
  GOALS = 'Objetivos (20%)'
}

// Estrutura de Mapeamento para UI agrupada
export const EXPENSE_CATEGORIES = {
  [CategoryType.ESSENTIAL]: ['Moradia', 'Mercado', 'Saúde', 'Educação', 'Transporte', 'Contas Fixas', 'Outros'],
  [CategoryType.LIFESTYLE]: ['Lazer', 'Restaurantes', 'Viagem', 'Assinaturas', 'Compras Pessoais', 'Cuidados Pessoais', 'Outros'],
  [CategoryType.GOALS]: ['Investimentos', 'Reserva de Emergência', 'Aposentadoria', 'Pagamento de Dívidas', 'Sonhos', 'Outros']
};

export type IncomeType = 'FIXED' | 'VARIABLE';

export interface CreditCard {
  id: string;
  name: string;
  closingDay: number; // Dia de fechamento da fatura
  dueDay: number; // Dia de vencimento
  color: string; // Hex ou classe tailwind para UI
  limit?: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: CategoryType; // O Pilar (50/30/20)
  subCategory: string; // A categoria granular (ex: "Mercado")
  date: string; // Data da Compra/Competência (ISO)
  dueDate?: string; // Data do Pagamento (Se crédito, é o vencimento da fatura)
  isPaid: boolean;
  isRecurring: boolean;
  
  // Novos campos para cartão
  paymentMethod: 'DEBIT' | 'CREDIT';
  cardId?: string; // Opcional, apenas se for crédito
  installments?: {
    current: number;
    total: number;
  };
}

export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  type: IncomeType;
  receiptDate?: string;
  isRecurring?: boolean;
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
  monthName: string;
}
