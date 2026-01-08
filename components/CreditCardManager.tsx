import React, { useState, useMemo } from 'react';
import { CreditCard as CardIcon, Plus, Trash2, X, ChevronDown, Cpu, Wifi, Bell, BellOff, User, Sparkles, AlertTriangle, LockOpen, CalendarDays, Check } from 'lucide-react';
import { CreditCard, Expense } from '../types'; //
import { generateId, sanitizeString } from '../utils'; //
import { BANKS_DATA } from '../constants/banks'; //
import { InvoiceModal } from './InvoiceModal'; // Importando o Modal

interface UserProfile {
  firstName: string;
  lastName: string;
}

interface Props {
  cards: CreditCard[];
  setCards: (cards: CreditCard[]) => void;
  profileA: UserProfile;
  profileB: UserProfile;
  expenses: Expense[]; // Adicionado prop expenses
}

// --- SUBCOMPONENT: CARD LOGO ---
const CardLogo = ({ card }: { card: CreditCard }) => {
    const bankDef = useMemo(() => {
        if (card.bankId) return BANKS_DATA.find(b => b.id === card.bankId);
        const byColor = BANKS_DATA.find(b => b.color.toLowerCase() === card.color.toLowerCase());
        if (byColor) return byColor;
        return BANKS_DATA.find(b => card.name.toLowerCase().includes(b.name.toLowerCase()));
    }, [card.bankId, card.color, card.name]);

    const isDark = card.textColor !== 'black';
    const textColorClass = isDark ? 'text-white' : 'text-slate-900';

    return (
        <span className={`text-sm font-bold uppercase tracking-wider ${textColorClass} truncate text-right drop-shadow-sm`}>
            {bankDef?.name || card.name.split(' ')[0] || 'Cartão'}
        </span>
    );
};

export const CreditCardManager: React.FC<Props> = ({ cards, setCards, profileA, profileB, expenses }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null); // Estado para o modal
  
  // Form States
  const [selectedBankId, setSelectedBankId] = useState('');
  const [name, setName] = useState('');
  const [holder, setHolder] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [notify, setNotify] = useState(false);

  const sortedBanks = useMemo(() => {
    const popularIds = ['nubank', 'itau', 'bb', 'bradesco', 'santander', 'c6', 'inter'];
    const popular = BANKS_DATA.filter(b => popularIds.includes(b.id));
    const others = BANKS_DATA.filter(b => !popularIds.includes(b.id) && b.id !== 'generic').sort((a, b) => a.name.localeCompare(b.name));
    const generic = BANKS_DATA.find(b => b.id === 'generic');
    
    return [...popular, ...others, generic!];
  }, []);

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankId = e.target.value;
    setSelectedBankId(bankId);
    
    const bank = BANKS_DATA.find(b => b.id === bankId);
    if (bank) {
        setName(bank.name === 'Outro Banco' ? '' : bank.name);
    }
  };

  const handleProfileSelect = (profile: 'A' | 'B') => {
      if (profile === 'A') {
          setHolder(`${profileA.firstName} ${profileA.lastName}`.toUpperCase());
      }
      if (profile === 'B') {
          setHolder(`${profileB.firstName} ${profileB.lastName}`.toUpperCase());
      }
  };

  const handleClosingDayChange = (val: string) => {
      setClosingDay(val);
      const closeNum = parseInt(val);
      if (!isNaN(closeNum) && closeNum >= 1 && closeNum <= 31) {
          let suggestedDue = closeNum + 10;
          if (suggestedDue > 30) suggestedDue = suggestedDue - 30;
          setDueDay(suggestedDue.toString());
      }
  };

  const getCardStatus = (closingDay: number) => {
      const today = new Date().getDate();
      if (today >= closingDay) {
          return { label: 'Melhor Dia', message: 'Só paga mês que vem!', bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-400', icon: Sparkles };
      }
      const daysUntilClose = closingDay - today;
      if (daysUntilClose > 0 && daysUntilClose <= 2) {
           return { label: 'Fechando', message: 'Evite comprar hoje', bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400', icon: AlertTriangle };
      }
      return { label: 'Fatura Aberta', message: 'Compra cai neste mês', bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400', icon: LockOpen };
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cDay = parseInt(closingDay);
    const dDay = parseInt(dueDay);

    if (!name.trim()) return;
    if (isNaN(cDay) || cDay < 1 || cDay > 31) { alert("Dia de fechamento inválido."); return; }
    if (isNaN(dDay) || dDay < 1 || dDay > 31) { alert("Dia de vencimento inválido."); return; }

    const bankData = BANKS_DATA.find(b => b.id === selectedBankId) || BANKS_DATA.find(b => b.id === 'generic')!;

    const newCard: CreditCard = {
      id: generateId(),
      bankId: bankData.id,
      name: sanitizeString(name),
      holder: sanitizeString(holder).toUpperCase(),
      closingDay: cDay,
      dueDay: dDay,
      color: bankData.color,
      logoUrl: bankData.logo,
      textColor: (bankData.textColor as 'black' | 'white') || 'white',
      notify: notify
    };

    setCards([...cards, newCard]);
    setName(''); setHolder(''); setClosingDay(''); setDueDay(''); setSelectedBankId(''); setNotify(false); setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    if (confirm('Tem certeza? Isso não apagará as despesas já lançadas.')) {
        setCards(cards.filter(c => c.id !== id));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <CardIcon className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Meus Cartões</h2>
                <p className="text-xs text-slate-400">Gerencie faturas e vencimentos</p>
            </div>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full"
        >
          {isAdding ? <><X className="w-4 h-4"/> Cancelar</> : <><Plus className="w-4 h-4"/> Novo Cartão</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCard} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-8 animate-in slide-in-from-top-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="mb-5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Quem é o Titular?</label>
                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => handleProfileSelect('A')}
                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${holder.includes(profileA.firstName.toUpperCase()) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-indigo-300'}`}
                    >
                        <User className="w-4 h-4" />
                        <span className="font-bold text-sm truncate">{profileA.firstName}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleProfileSelect('B')}
                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${holder.includes(profileB.firstName.toUpperCase()) ? 'bg-pink-600 border-pink-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-pink-300'}`}
                    >
                        <User className="w-4 h-4" />
                        <span className="font-bold text-sm truncate">{profileB.firstName}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instituição Financeira</label>
                    <div className="relative mt-1">
                        <select
                            value={selectedBankId}
                            onChange={handleBankSelect}
                            className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer shadow-sm"
                            required
                        >
                            <option value="" disabled>Selecione o banco na lista...</option>
                            {sortedBanks.map(bank => (
                                <option key={bank.id} value={bank.id}>{bank.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apelido do Cartão</label>
                    <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Nubank Alimentação"
                        className="w-full mt-1 p-3 rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        maxLength={25}
                        required
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome no Cartão (Impresso)</label>
                    <input 
                        value={holder}
                        onChange={e => setHolder(e.target.value.toUpperCase())}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full mt-1 p-3 rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm uppercase font-mono"
                        maxLength={30}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha dia</label>
                        <div className="relative">
                            <input 
                                type="number" min="1" max="31"
                                value={closingDay}
                                onChange={e => handleClosingDayChange(e.target.value)}
                                placeholder="Dia"
                                className="w-full mt-1 p-3 pl-8 rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                required
                            />
                            <LockOpen className="absolute left-3 top-[18px] w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vence dia</label>
                        <div className="relative">
                            <input 
                                type="number" min="1" max="31"
                                value={dueDay}
                                onChange={e => setDueDay(e.target.value)}
                                placeholder="Dia"
                                className="w-full mt-1 p-3 pl-8 rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                required
                            />
                            <CalendarDays className="absolute left-3 top-[18px] w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="flex items-end">
                     <button
                        type="button"
                        onClick={() => setNotify(!notify)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${notify ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600'}`}
                     >
                        {notify ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        <span className="text-xs font-bold">{notify ? 'Alerta Ativado' : 'Sem Alerta'}</span>
                     </button>
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                <Check className="w-4 h-4" />
                Salvar Cartão
            </button>
        </form>
      )}

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {cards.map(card => {
            const isDark = card.textColor !== 'black';
            const textColorClass = isDark ? 'text-white' : 'text-slate-900';
            const mutedTextClass = isDark ? 'text-white/70' : 'text-slate-900/60';
            const status = getCardStatus(card.closingDay);
            const StatusIcon = status.icon;
            
            return (
                <div 
                    key={card.id} 
                    className="relative w-full aspect-[1.586/1] rounded-xl p-4 shadow-lg group transition-transform hover:-translate-y-1 hover:shadow-xl overflow-hidden cursor-pointer"
                    style={{ backgroundColor: card.color }}
                    onClick={() => setSelectedCard(card)}
                >
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
                    
                    <div className={`absolute top-3 left-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm border ${status.bg} ${status.text} ${status.border}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        <span>{status.label}</span>
                    </div>

                    <div className="relative z-10 flex justify-between items-start mb-2 mt-7">
                         <div className="flex items-center gap-2">
                             <div className={`w-8 h-6 rounded bg-gradient-to-tr from-yellow-200 to-yellow-500 shadow-inner border ${isDark ? 'border-yellow-600/30' : 'border-yellow-600/10'} flex items-center justify-center`}>
                                <Cpu className="w-4 h-4 text-yellow-700/50" strokeWidth={1.5} />
                             </div>
                             <Wifi className={`w-3 h-3 ${mutedTextClass} rotate-90`} />
                         </div>
                         <div className="flex flex-col items-end h-8 justify-center max-w-[120px]">
                            <CardLogo card={card} />
                         </div>
                    </div>

                    <div className="relative z-10 mb-3 flex justify-between items-center">
                        <div className={`font-mono text-sm tracking-widest flex gap-2 ${textColorClass} drop-shadow-sm opacity-90`}>
                            <span>••••</span>
                            <span>••••</span>
                            <span>••••</span>
                            <span>{card.id.substring(0,4)}</span>
                        </div>
                        {card.notify && (
                            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-full">
                                <Bell className={`w-2.5 h-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                            </div>
                        )}
                    </div>

                    <div className="relative z-10 mt-auto flex justify-between items-end">
                         <div className="flex-1 overflow-hidden pr-2">
                             <p className={`text-[8px] uppercase tracking-widest mb-0.5 ${mutedTextClass}`}>Titular</p>
                             <p className={`font-medium text-xs uppercase tracking-wide truncate ${textColorClass} drop-shadow-md`}>
                                 {card.holder || card.name}
                             </p>
                         </div>
                         
                         <div className="flex gap-2 shrink-0 text-right">
                             <div>
                                 <p className={`text-[8px] uppercase tracking-widest mb-0.5 ${mutedTextClass}`}>Vence</p>
                                 <p className={`font-mono font-bold text-xs ${textColorClass}`}>
                                     {String(card.dueDay).padStart(2, '0')}/<span className="opacity-60">MES</span>
                                 </p>
                             </div>
                         </div>
                    </div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); handleRemove(card.id); }} 
                        className="absolute bottom-2 right-2 p-1.5 bg-black/40 backdrop-blur-md hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 scale-90 group-hover:scale-100"
                        title="Remover Cartão"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            );
         })}
         
         {cards.length === 0 && !isAdding && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setIsAdding(true)}>
                 <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-full mb-3">
                    <CardIcon className="w-8 h-8 opacity-50" />
                 </div>
                 <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Nenhum cartão cadastrado</p>
                 <p className="text-xs opacity-60 mt-1">Toque para adicionar o primeiro</p>
             </div>
         )}
      </div>

      {/* RENDERIZAÇÃO DO MODAL DE FATURA */}
      {selectedCard && (
        <InvoiceModal 
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          card={selectedCard}
          expenses={expenses}
        />
      )}
    </div>
  );
};