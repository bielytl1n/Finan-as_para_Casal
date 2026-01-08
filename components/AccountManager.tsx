
import React, { useState, useMemo } from 'react';
import { Landmark, Plus, Trash2, X, ChevronDown, Check, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { BankAccount, AccountType } from '../types.ts';
import { generateId, formatCurrency } from '../utils.ts';
import { BANKS_DATA } from '../constants/banks.tsx';

interface Props {
  accounts: BankAccount[];
  setAccounts: (acc: BankAccount[]) => void;
  nameA: string;
  nameB: string;
}

export const AccountManager: React.FC<Props> = ({ accounts, setAccounts, nameA, nameB }) => {
  const [isAdding, setIsAdding] = useState(false);
  
  // Form States
  const [selectedBankId, setSelectedBankId] = useState('');
  const [balance, setBalance] = useState('');
  const [holder, setHolder] = useState(nameA);
  const [type, setType] = useState<AccountType>('CHECKING');

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const sortedBanks = useMemo(() => {
    return [...BANKS_DATA].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    const val = parseFloat(balance.replace(',', '.'));
    if (isNaN(val)) return;

    const newAccount: BankAccount = {
      id: generateId(),
      bankId: selectedBankId,
      holder,
      balance: val,
      type
    };

    setAccounts([...accounts, newAccount]);
    
    // Reset
    setBalance('');
    setSelectedBankId('');
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
      if (confirm('Remover esta conta?')) {
          setAccounts(accounts.filter(a => a.id !== id));
      }
  };

  const getAccountTypeLabel = (t: AccountType) => {
      switch(t) {
          case 'CHECKING': return 'Conta Corrente';
          case 'SAVINGS': return 'Poupança';
          case 'INVESTMENT': return 'Investimentos';
          case 'CASH': return 'Dinheiro';
          default: return t;
      }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      
      {/* Header Resumo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Landmark className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo em Contas</p>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    {formatCurrency(totalBalance)}
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                </h2>
            </div>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full transition-colors self-end md:self-auto"
        >
          {isAdding ? <><X className="w-4 h-4"/> Cancelar</> : <><Plus className="w-4 h-4"/> Adicionar Saldo</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddAccount} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-8 animate-in slide-in-from-top-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                
                {/* 1. Banco */}
                <div className="lg:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Banco / Instituição</label>
                    <div className="relative mt-1">
                        <select
                            value={selectedBankId}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        >
                            <option value="" disabled>Selecione...</option>
                            {sortedBanks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* 2. Titular */}
                <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Titular</label>
                     <select
                        value={holder}
                        onChange={(e) => setHolder(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                     >
                         <option value={nameA}>{nameA}</option>
                         <option value={nameB}>{nameB}</option>
                         <option value="CONJUNTA">Conjunta</option>
                     </select>
                </div>

                {/* 3. Tipo */}
                <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                     <select
                        value={type}
                        onChange={(e) => setType(e.target.value as AccountType)}
                        className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                     >
                         <option value="CHECKING">Corrente</option>
                         <option value="SAVINGS">Poupança</option>
                         <option value="INVESTMENT">Investimento</option>
                         <option value="CASH">Dinheiro</option>
                     </select>
                </div>
            </div>

            {/* 4. Valor */}
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Atual</label>
                    <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                        <input 
                            type="number" step="0.01"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full p-3 pl-10 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-600 text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-600 dark:text-emerald-400 placeholder-slate-300"
                            placeholder="0,00"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                    <Check className="w-5 h-5" /> Salvar
                </button>
            </div>
        </form>
      )}

      {/* Grid de Contas (Widgets Compactos) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
         {accounts.map(acc => {
            const bank = BANKS_DATA.find(b => b.id === acc.bankId);
            const isInvest = acc.type === 'INVESTMENT';
            
            return (
                <div key={acc.id} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        {/* Logo / Icone */}
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm p-1.5 flex items-center justify-center overflow-hidden">
                            {bank?.logoComponent ? bank.logoComponent : (
                                bank?.logo ? <img src={bank.logo} className="w-full h-full object-contain" /> : <Wallet className="w-4 h-4 text-slate-400" />
                            )}
                        </div>
                        <button onClick={() => handleRemove(acc.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="mb-1">
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 truncate">{bank?.name || 'Conta'}</h4>
                        <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{acc.holder}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                         <span className={`text-sm font-black ${isInvest ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                             {formatCurrency(acc.balance)}
                         </span>
                         {isInvest && <ArrowUpRight className="w-3 h-3 text-blue-400" />}
                    </div>
                    
                    <div className="mt-1 text-[9px] font-medium px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded inline-block text-slate-400 border border-slate-100 dark:border-slate-700">
                        {getAccountTypeLabel(acc.type)}
                    </div>
                </div>
            );
         })}
         
         {accounts.length === 0 && !isAdding && (
             <div onClick={() => setIsAdding(true)} className="col-span-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400 transition-colors">
                 <Wallet className="w-6 h-6 mb-2 opacity-50" />
                 <p className="text-xs font-medium">Cadastrar Contas Bancárias</p>
             </div>
         )}
      </div>
    </div>
  );
};
