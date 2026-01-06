
import React, { useState } from 'react';
import { Edit3, Plus, Trash2, ChevronDown, ChevronUp, DollarSign, Calendar, Save, Check, X } from 'lucide-react';
import { formatCurrency, sanitizeString, generateId, formatDate } from '../utils.ts';
import { IncomeItem } from '../types.ts';

interface IncomeColumnProps {
  name: string;
  setName: (v: string) => void;
  items: IncomeItem[];
  setItems: (v: IncomeItem[]) => void;
  percent: number;
  colorTheme: 'blue' | 'pink';
}

const IncomeColumn: React.FC<IncomeColumnProps> = ({ name, setName, items, setItems, percent, colorTheme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraAmount, setNewExtraAmount] = useState('');
  const [newExtraDate, setNewExtraDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Estado de Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  const fixedItems = items.filter(i => i.type === 'FIXED');
  const variableItems = items.filter(i => i.type === 'VARIABLE');
  
  // Renda Base (FIXED) - Garante que sempre exista um objeto para renderizar
  const baseSalaryItem = fixedItems[0] || { 
      id: 'temp_base', 
      name: 'Renda Mensal Fixa', 
      amount: 0, 
      receiptDate: new Date().toISOString().split('T')[0],
      type: 'FIXED'
  };
  const baseAmount = fixedItems.reduce((acc, i) => acc + i.amount, 0);
  const extraAmount = variableItems.reduce((acc, i) => acc + i.amount, 0);
  const total = baseAmount + extraAmount;

  // --- Handlers de Edição ---

  const startEditing = (item: IncomeItem | typeof baseSalaryItem) => {
      setEditingId(item.id);
      setEditName(item.name);
      setEditAmount(item.amount.toString());
      setEditDate(item.receiptDate || new Date().toISOString().split('T')[0]);
  };

  const cancelEditing = () => {
      setEditingId(null);
      setEditName('');
      setEditAmount('');
      setEditDate('');
  };

  const saveEditing = (originalId: string, type: 'FIXED' | 'VARIABLE') => {
      const val = parseFloat(editAmount.replace(',', '.'));
      const safeName = sanitizeString(editName);

      if (!safeName || isNaN(val) || val < 0) return;

      if (originalId === 'temp_base') {
          // Criando a renda base pela primeira vez via edição de nome
          setItems([...items, { 
            id: generateId(), 
            name: safeName, 
            amount: val, 
            type: 'FIXED', 
            isRecurring: true,
            receiptDate: editDate
          }]);
      } else {
          setItems(items.map(i => i.id === originalId ? { 
              ...i, 
              name: safeName, 
              amount: val, 
              receiptDate: editDate 
          } : i));
      }
      cancelEditing();
  };

  // Handlers diretos para Inputs da Renda Base (para manter UX rápida)
  const handleUpdateBaseDirect = (field: 'amount' | 'date', value: string) => {
      if (fixedItems.length > 0) {
          const updated = items.map(i => {
              if (i.id === fixedItems[0].id) {
                  if (field === 'amount') {
                      const val = parseFloat(value.replace(',', '.'));
                      return { ...i, amount: isNaN(val) ? 0 : val };
                  } else {
                      return { ...i, receiptDate: value };
                  }
              }
              return i;
          });
          setItems(updated);
      } else {
          // Cria item se não existir
          const val = field === 'amount' ? parseFloat(value.replace(',', '.')) : 0;
          setItems([...items, { 
            id: generateId(), 
            name: 'Renda Mensal Fixa', 
            amount: isNaN(val) ? 0 : val, 
            type: 'FIXED', 
            isRecurring: true,
            receiptDate: field === 'date' ? value : new Date().toISOString().split('T')[0]
          }]);
      }
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newExtraAmount.replace(',', '.'));
    const safeName = sanitizeString(newExtraName);
    
    if (!safeName || isNaN(val) || val <= 0 || !newExtraDate) return;

    setItems([...items, {
      id: generateId(),
      name: safeName,
      amount: val,
      type: 'VARIABLE',
      isRecurring: false,
      receiptDate: newExtraDate
    }]);
    setNewExtraName('');
    setNewExtraAmount('');
    setNewExtraDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const themeClass = colorTheme === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400';

  return (
    <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
      {/* Header Compacto (Nome da Pessoa) */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 group">
           <input 
             value={name}
             onChange={(e) => setName(sanitizeString(e.target.value))}
             className={`bg-transparent font-bold ${themeClass} w-24 focus:ring-0 border-none p-0 cursor-pointer text-sm`}
           />
           <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-full shadow-sm">
          {percent.toFixed(1)}%
        </div>
      </div>

      {/* Renda Base - Editável */}
      <div className="mb-4 group/base relative">
         <div className="flex items-center justify-between mb-1 min-h-[20px]">
            {editingId === baseSalaryItem.id ? (
                <div className="flex items-center gap-2 w-full">
                    <input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-[10px] uppercase font-bold tracking-wider bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 w-full"
                        autoFocus
                    />
                    <button onClick={() => saveEditing(baseSalaryItem.id, 'FIXED')} className="text-emerald-500 hover:bg-emerald-100 rounded p-0.5"><Check className="w-3 h-3" /></button>
                    <button onClick={cancelEditing} className="text-slate-400 hover:bg-slate-200 rounded p-0.5"><X className="w-3 h-3" /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 w-full">
                    <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                        {baseSalaryItem.name}
                    </label>
                    <button 
                        onClick={() => startEditing(baseSalaryItem)}
                        className="opacity-0 group-hover/base:opacity-100 text-slate-300 hover:text-indigo-500 transition-opacity"
                        title="Editar nome"
                    >
                        <Edit3 className="w-3 h-3" />
                    </button>
                </div>
            )}
         </div>

        <div className="flex items-end justify-between gap-2">
            <div className="relative flex-1">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-light text-lg">R$</span>
                <input 
                    type="number"
                    value={baseAmount || ''}
                    onChange={(e) => handleUpdateBaseDirect('amount', e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-2xl font-bold text-slate-800 dark:text-white pl-8 focus:outline-none placeholder-slate-200"
                />
            </div>
            
            {/* Input de Data da Renda Fixa */}
            <div className="flex flex-col items-end">
                 <label className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Recebe dia</label>
                 <input 
                    type="date"
                    value={baseSalaryItem.receiptDate || ''}
                    onChange={(e) => handleUpdateBaseDirect('date', e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs py-1 px-2 text-slate-600 dark:text-slate-300 w-[110px]"
                 />
            </div>
        </div>
      </div>

      {/* Extras Toggle */}
      <div className="mt-auto">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
            <span>Extras: <span className="text-emerald-500 font-semibold">+{formatCurrency(extraAmount)}</span></span>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-300"
            >
                {isExpanded ? 'Ocultar' : 'Gerenciar'}
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
        </div>

        {/* Lista de Extras (Expansível) */}
        {isExpanded && (
          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 shadow-inner space-y-3 animate-in fade-in slide-in-from-top-2 border border-slate-100 dark:border-slate-800">
             <ul className="space-y-2">
                {variableItems.map(item => (
                    <li key={item.id} className="text-xs border-b border-slate-50 dark:border-slate-800/50 pb-2 last:border-0">
                        {editingId === item.id ? (
                            // Modo Edição
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 outline-none"
                                        placeholder="Nome"
                                    />
                                    <input 
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 outline-none"
                                        placeholder="Valor"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <input 
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 outline-none"
                                    />
                                    <div className="flex gap-1">
                                        <button onClick={() => saveEditing(item.id, 'VARIABLE')} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1"><Check className="w-3.5 h-3.5" /></button>
                                        <button onClick={cancelEditing} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 rounded p-1"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Modo Visualização
                            <div className="flex justify-between items-center group/item">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{item.name}</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5" />
                                        {formatDate(item.receiptDate || '')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-emerald-600">{formatCurrency(item.amount)}</span>
                                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <button onClick={() => startEditing(item)} className="text-slate-300 hover:text-indigo-500 transition-colors p-1">
                                            <Edit3 className="w-3.5 h-3.5"/>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                            <Trash2 className="w-3.5 h-3.5"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
                {variableItems.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-2">Sem renda extra.</p>}
             </ul>
             
             {/* Add Form (Só mostra se não estiver editando algo para não poluir) */}
             {!editingId && (
                <form onSubmit={handleAddExtra} className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-2">
                        <input 
                            placeholder="Nome (ex: Bônus)" 
                            className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 outline-none focus:border-indigo-500 transition-colors"
                            value={newExtraName}
                            onChange={e => setNewExtraName(sanitizeString(e.target.value))}
                        />
                        <input 
                            placeholder="R$" 
                            type="number"
                            className="w-20 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 outline-none focus:border-indigo-500 transition-colors"
                            value={newExtraAmount}
                            onChange={e => setNewExtraAmount(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="date"
                            className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 outline-none focus:border-indigo-500 transition-colors"
                            value={newExtraDate}
                            onChange={e => setNewExtraDate(e.target.value)}
                        />
                        <button type="submit" className="bg-slate-800 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white rounded px-3 py-1 text-xs font-medium transition-colors flex items-center justify-center">
                            <Plus className="w-3 h-3"/>
                        </button>
                    </div>
                </form>
             )}
          </div>
        )}
      </div>

      <div className={`mt-3 pt-3 border-t ${colorTheme === 'blue' ? 'border-blue-100 dark:border-blue-900/30' : 'border-pink-100 dark:border-pink-900/30'} flex justify-between items-baseline`}>
         <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
         <span className={`text-lg font-bold ${themeClass}`}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

interface Props {
  nameA: string; setNameA: (v: string) => void;
  itemsA: IncomeItem[]; setItemsA: (v: IncomeItem[]) => void;
  nameB: string; setNameB: (v: string) => void;
  itemsB: IncomeItem[]; setItemsB: (v: IncomeItem[]) => void;
  totalIncome: number;
  percentageA: number; percentageB: number;
}

export const IncomeSection: React.FC<Props> = ({
  nameA, setNameA, itemsA, setItemsA,
  nameB, setNameB, itemsB, setItemsB,
  totalIncome, percentageA, percentageB
}) => {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Renda Mensal</h2>
        <span className="ml-auto text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <IncomeColumn name={nameA} setName={setNameA} items={itemsA} setItems={setItemsA} percent={percentageA} colorTheme="blue" />
        <IncomeColumn name={nameB} setName={setNameB} items={itemsB} setItems={setItemsB} percent={percentageB} colorTheme="pink" />
      </div>
    </section>
  );
};
