import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Wallet, TrendingUp, AlertTriangle, CheckCircle, PieChart as PieIcon, DollarSign } from 'lucide-react';
import { Card } from './components/ui/Card';
import { IncomeChart } from './components/IncomeChart';
import { ExpenseList } from './components/ExpenseList';
import { Expense, CategoryType } from './types';

function App() {
  // --- STATE ---
  // Input dos Salários
  const [incomeA, setIncomeA] = useState<number>(0);
  const [incomeB, setIncomeB] = useState<number>(0);

  // Input de Despesas
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<CategoryType>(CategoryType.ESSENTIAL);
  
  // Lista de Despesas
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // --- LÓGICA MATEMÁTICA (The Core Logic) ---

  // 1. Calcula Renda Total
  const totalIncome = incomeA + incomeB;

  // 2. Calcula Porcentagem de Contribuição (Proteção contra divisão por zero)
  const percentageA = totalIncome > 0 ? (incomeA / totalIncome) * 100 : 0;
  const percentageB = totalIncome > 0 ? (incomeB / totalIncome) * 100 : 0;

  // 3. Calcula Tetos da Regra 50-30-20
  const limitEssential = totalIncome * 0.50;
  const limitLifestyle = totalIncome * 0.30;
  const limitGoals = totalIncome * 0.20;

  // 4. Agrega Despesas por Categoria
  const totalsByCategory = useMemo(() => {
    return expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<CategoryType, number>);
  }, [expenses]);

  // Totais gastos reais
  const spentEssential = totalsByCategory[CategoryType.ESSENTIAL] || 0;
  const spentLifestyle = totalsByCategory[CategoryType.LIFESTYLE] || 0;
  const spentGoals = totalsByCategory[CategoryType.GOALS] || 0;
  const totalSpent = spentEssential + spentLifestyle + spentGoals;

  // 5. Calcula "Quem Deve Quanto" no total geral
  const totalShareA = totalSpent * (percentageA / 100);
  const totalShareB = totalSpent * (percentageB / 100);

  // --- HANDLERS ---

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName || !expenseAmount) return;

    const amount = parseFloat(expenseAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      name: expenseName,
      amount: amount,
      category: expenseCategory,
      date: new Date().toISOString()
    };

    setExpenses([...expenses, newExpense]);
    
    // Limpar form
    setExpenseName('');
    setExpenseAmount('');
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(ex => ex.id !== id));
  };

  // Helper para formatar moeda
  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Helper para verificar status do orçamento
  const getBudgetStatus = (spent: number, limit: number) => {
    if (limit === 0) return 'neutral';
    if (spent > limit) return 'danger';
    if (spent > limit * 0.8) return 'warning';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* HEADER */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Wallet className="text-emerald-400" />
          <h1 className="text-xl font-bold tracking-tight">CasalFinanças</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* SEÇÃO 1: RENDA E PROPORÇÃO */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Entradas Mensais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Renda Pessoa A (Eu)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input 
                    type="number" 
                    value={incomeA || ''} 
                    onChange={(e) => setIncomeA(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="0,00"
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-blue-600">
                  Contribuição: {percentageA.toFixed(1)}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Renda Pessoa B (Esposa)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input 
                    type="number" 
                    value={incomeB || ''} 
                    onChange={(e) => setIncomeB(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none"
                    placeholder="0,00"
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-pink-600">
                  Contribuição: {percentageB.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-500">Renda Total Familiar:</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalIncome)}</span>
            </div>
          </div>

          <div className="md:col-span-1">
            <IncomeChart 
              incomeA={incomeA} 
              incomeB={incomeB} 
              percentageA={percentageA} 
              percentageB={percentageB} 
            />
          </div>
        </section>

        {/* SEÇÃO 2: DASHBOARD 50-30-20 */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            Análise 50-30-20
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              title="Essenciais (50%)"
              value={formatCurrency(spentEssential)}
              limit={formatCurrency(limitEssential)}
              subValue={`${spentEssential > limitEssential ? 'Acima do teto!' : 'Dentro do orçamento'}`}
              status={getBudgetStatus(spentEssential, limitEssential)}
              icon={<CheckCircle className="w-5 h-5 text-indigo-500" />}
            />
            <Card 
              title="Estilo de Vida (30%)"
              value={formatCurrency(spentLifestyle)}
              limit={formatCurrency(limitLifestyle)}
              subValue={`${spentLifestyle > limitLifestyle ? 'Cuidado!' : 'Aproveite'}`}
              status={getBudgetStatus(spentLifestyle, limitLifestyle)}
              icon={<TrendingUp className="w-5 h-5 text-teal-500" />}
            />
            <Card 
              title="Objetivos (20%)"
              value={formatCurrency(spentGoals)}
              limit={formatCurrency(limitGoals)}
              subValue={`${spentGoals < limitGoals ? 'Pode investir mais' : 'Meta atingida!'}`}
              status={spentGoals >= limitGoals ? 'success' : 'neutral'}
              icon={<Wallet className="w-5 h-5 text-amber-500" />}
            />
          </div>
        </section>

        {/* SEÇÃO 3: GESTÃO DE DESPESAS */}
        <section className="grid lg:grid-cols-3 gap-6">
          
          {/* Formulário de Adição */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-slate-700" />
              Nova Despesa
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Nome da Conta</label>
                <input 
                  type="text" 
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Aluguel, Mercado..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Categoria</label>
                <select 
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {Object.values(CategoryType).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={!expenseName || !expenseAmount}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Adicionar Despesa
              </button>
            </form>
          </div>

          {/* Tabela de Lista */}
          <div className="lg:col-span-2 space-y-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Detalhamento de Contas</h2>
                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {expenses.length} itens
                  </span>
                </div>
                <ExpenseList 
                  expenses={expenses}
                  percentageA={percentageA}
                  percentageB={percentageB}
                  onRemove={handleRemoveExpense}
                />
             </div>

             {/* Cards de Resumo de Divisão */}
             {expenses.length > 0 && (
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-1">Parte A (Total)</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalShareA)}</p>
                    <p className="text-xs text-blue-600 mt-1">Deve pagar/transferir</p>
                 </div>
                 <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                    <p className="text-sm text-pink-800 font-medium mb-1">Parte B (Total)</p>
                    <p className="text-2xl font-bold text-pink-900">{formatCurrency(totalShareB)}</p>
                    <p className="text-xs text-pink-600 mt-1">Deve pagar/transferir</p>
                 </div>
               </div>
             )}
          </div>

        </section>
      </main>
    </div>
  );
}

export default App;