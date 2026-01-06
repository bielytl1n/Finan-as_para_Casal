
import React, { useState } from 'react';
import { CreditCard as CardIcon, Plus, Trash2, X, CreditCard as CCIcon } from 'lucide-react';
import { CreditCard } from '../types.ts';
import { generateId, sanitizeString } from '../utils.ts';

interface Props {
  cards: CreditCard[];
  setCards: (cards: CreditCard[]) => void;
}

const CARD_COLORS = [
  { name: 'Nubank Roxinho', class: 'from-purple-600 to-purple-800' },
  { name: 'Inter Laranja', class: 'from-orange-500 to-orange-700' },
  { name: 'Black Premium', class: 'from-slate-700 to-black' },
  { name: 'Azul Bank', class: 'from-blue-500 to-blue-700' },
  { name: 'Verde Green', class: 'from-emerald-500 to-emerald-700' },
  { name: 'Vermelho Red', class: 'from-red-500 to-red-700' },
];

export const CreditCardManager: React.FC<Props> = ({ cards, setCards }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0].class);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cDay = parseInt(closingDay);
    const dDay = parseInt(dueDay);

    if (!name.trim()) return;
    if (isNaN(cDay) || cDay < 1 || cDay > 31) { alert("Dia de fechamento inválido (1-31)."); return; }
    if (isNaN(dDay) || dDay < 1 || dDay > 31) { alert("Dia de vencimento inválido (1-31)."); return; }

    const newCard: CreditCard = {
      id: generateId(),
      name: sanitizeString(name),
      closingDay: cDay,
      dueDay: dDay,
      color: selectedColor
    };

    setCards([...cards, newCard]);
    setName('');
    setClosingDay('');
    setDueDay('');
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    if (confirm('Tem certeza? Isso não apagará as despesas já lançadas.')) {
        setCards(cards.filter(c => c.id !== id));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <CardIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Meus Cartões</h2>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
        >
          {isAdding ? <><X className="w-4 h-4"/> Cancelar</> : <><Plus className="w-4 h-4"/> Adicionar Cartão</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCard} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Apelido do Cartão</label>
                    <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Nubank"
                        className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm"
                        maxLength={20}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Fecha dia</label>
                        <input 
                            type="number" min="1" max="31"
                            value={closingDay}
                            onChange={e => setClosingDay(e.target.value)}
                            placeholder="Dia"
                            className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Vence dia</label>
                        <input 
                            type="number" min="1" max="31"
                            value={dueDay}
                            onChange={e => setDueDay(e.target.value)}
                            placeholder="Dia"
                            className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm"
                            required
                        />
                    </div>
                </div>
            </div>
            
            <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Cor do Cartão</label>
                <div className="flex gap-2 flex-wrap">
                    {CARD_COLORS.map((c) => (
                        <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c.class)}
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.class} ring-offset-2 ring-offset-white dark:ring-offset-slate-800 transition-all ${selectedColor === c.class ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>

            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors">
                Salvar Cartão
            </button>
        </form>
      )}

      {/* Lista de Cartões (Visual) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         {cards.map(card => (
            <div key={card.id} className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${card.color} shadow-md text-white group`}>
                <div className="flex justify-between items-start">
                    <CCIcon className="w-6 h-6 opacity-80" />
                    <button onClick={() => handleRemove(card.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded-full transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-4">
                    <h3 className="font-bold text-lg tracking-wide truncate max-w-[200px]" title={card.name}>{card.name}</h3>
                    <div className="flex gap-4 mt-2 text-xs opacity-90 font-medium">
                        <div className="flex flex-col">
                            <span className="uppercase text-[10px] opacity-70">Fechamento</span>
                            <span>Dia {card.closingDay}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="uppercase text-[10px] opacity-70">Vencimento</span>
                            <span>Dia {card.dueDay}</span>
                        </div>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute top-0 right-10 w-12 h-12 bg-black/10 rounded-full blur-lg"></div>
            </div>
         ))}
         {cards.length === 0 && !isAdding && (
             <div className="col-span-full py-8 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                 Nenhum cartão cadastrado.
             </div>
         )}
      </div>
    </div>
  );
};
