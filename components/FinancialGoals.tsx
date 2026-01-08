
import React, { useState } from 'react';
import { Target, Plus, TrendingUp, Trophy, Trash2 } from 'lucide-react';
import { FinancialGoal } from '../types.ts';
import { formatCurrency, generateId, loadFromStorage, saveToStorage } from '../utils.ts';

export const FinancialGoals: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>(() => loadFromStorage<FinancialGoal[]>('cf_goals', [
    { id: '1', name: 'Reserva Emergência', currentAmount: 5000, targetAmount: 15000, color: 'bg-emerald-500', icon: 'shield' },
    { id: '2', name: 'Viagem Europa', currentAmount: 2500, targetAmount: 20000, color: 'bg-blue-500', icon: 'plane' }
  ]));
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Persistência simples local no componente (idealmente subiria para o App.tsx se compartilhado)
  React.useEffect(() => {
    saveToStorage('cf_goals', goals);
  }, [goals]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTarget) return;
    
    const goal: FinancialGoal = {
        id: generateId(),
        name: newName,
        currentAmount: 0,
        targetAmount: parseFloat(newTarget),
        color: 'bg-indigo-500'
    };
    
    setGoals([...goals, goal]);
    setNewName('');
    setNewTarget('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
      setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                <Trophy className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Metas & Sonhos</h2>
            </div>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col gap-3 animate-in slide-in-from-top-2">
              <input 
                placeholder="Nome da Meta (ex: Carro Novo)" 
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                value={newName} onChange={e => setNewName(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                    type="number" placeholder="Valor Alvo (R$)" 
                    className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    value={newTarget} onChange={e => setNewTarget(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 rounded-lg font-bold text-sm">Criar</button>
              </div>
          </form>
      )}

      <div className="space-y-5">
        {goals.map(goal => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
                <div key={goal.id} className="group">
                    <div className="flex justify-between items-end mb-1">
                        <div className="flex items-center gap-2">
                             <Target className="w-4 h-4 text-slate-400" />
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{goal.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">{pct.toFixed(0)}%</span>
                            <button onClick={() => handleDelete(goal.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full ${goal.color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                </div>
            );
        })}
        {goals.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Nenhuma meta definida.</p>}
      </div>
    </div>
  );
};
