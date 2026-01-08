
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Camera, Sparkles, Loader2, Calendar, Repeat, CreditCard as CreditCardIcon, Landmark } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CategoryType, Expense, CreditCard, EXPENSE_CATEGORIES } from '../types.ts';
import { sanitizeString, loadFromStorage, calculateCardDueDate } from '../utils.ts';

interface Props {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  currentDate: Date;
  cards: CreditCard[];
}

export const SmartExpenseForm: React.FC<Props> = ({ onAdd, currentDate, cards }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  
  // Controle de Categorias Dividido
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CategoryType.ESSENTIAL);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  
  const [purchaseDate, setPurchaseDate] = useState<string>(currentDate.toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(currentDate.toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  
  // Payment Logic
  const [paymentMethod, setPaymentMethod] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializa a subcategoria com o primeiro item da categoria padrão
  useEffect(() => {
    if (!selectedSubCategory) {
        setSelectedSubCategory(EXPENSE_CATEGORIES[CategoryType.ESSENTIAL][0]);
    }
  }, []);

  // Efeito: Recalcular Data de Vencimento se usar Cartão de Crédito
  useEffect(() => {
    if (paymentMethod === 'CREDIT' && selectedCardId && purchaseDate) {
      const card = cards.find(c => c.id === selectedCardId);
      if (card) {
        const calculatedDue = calculateCardDueDate(purchaseDate, card);
        setDueDate(calculatedDue);
      }
    } else if (paymentMethod === 'DEBIT') {
      // No débito, o "vencimento" é a data da compra (sai da conta na hora)
      setDueDate(purchaseDate);
    }
  }, [purchaseDate, selectedCardId, paymentMethod, cards]);

  useEffect(() => {
    const savedExpenses = loadFromStorage<Expense[]>('cf_expenses', []);
    if (savedExpenses && savedExpenses.length > 0) {
      const uniqueNames = Array.from(new Set(
        savedExpenses.slice().reverse().map(e => e.name)
      )).slice(0, 20);
      setSuggestions(uniqueNames);
    }
  }, []);

  // Handler para mudança da Categoria Principal
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCategory = e.target.value as CategoryType;
      setSelectedCategory(newCategory);
      // Reseta a subcategoria para a primeira opção da nova categoria
      if (EXPENSE_CATEGORIES[newCategory] && EXPENSE_CATEGORIES[newCategory].length > 0) {
          setSelectedSubCategory(EXPENSE_CATEGORIES[newCategory][0]);
      }
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      alert("Arquivo inválido (max 5MB, imagem apenas).");
      return;
    }

    // SECURITY: Access API Key strictly from process.env inside the restricted scope
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Gemini API: Key not configured in environment.");
      alert("Serviço de IA indisponível no momento. Verifique as configurações.");
      return;
    }

    setLoading(true);
    setAiStatus('Lendo recibo...');
    
    try {
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey });
      
      const allSubCats = Object.values(EXPENSE_CATEGORIES).flat().join(', ');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Content } }
          ]
        },
        config: {
          systemInstruction: `Extract merchant name ("name"), total amount ("amount"), and suggest a specific category ("subCategory") from this list: [${allSubCats}]. If uncertain, use 'Outros'. JSON format.`,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const json = JSON.parse(text);
        if (json.name) setName(sanitizeString(json.name).substring(0, 50));
        if (json.amount) {
             const amt = Math.abs(Number(json.amount));
             setAmount(amt > 9999999 ? '9999999' : amt.toString());
        }
        
        if (json.subCategory) {
            // Lógica reversa: Encontrar a Categoria Pai baseada na Subcategoria sugerida pela IA
            let foundMain: CategoryType | null = null;
            let foundSub = 'Outros';

            for (const [cat, subs] of Object.entries(EXPENSE_CATEGORIES)) {
                const match = subs.find(s => s.toLowerCase() === json.subCategory.toLowerCase());
                if (match) {
                    foundMain = cat as CategoryType;
                    foundSub = match;
                    break;
                }
            }

            if (foundMain) {
                setSelectedCategory(foundMain);
                setSelectedSubCategory(foundSub);
            } else {
                // Fallback se a IA alucinar uma categoria que não existe
                setSelectedSubCategory('Outros');
            }
        }
      }
    } catch (err) {
      console.error("Error processing receipt:", err);
      alert('Não foi possível ler o recibo. Tente novamente ou insira manualmente.');
    } finally {
      setLoading(false);
      setAiStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    const safeName = sanitizeString(name);

    // Validações
    if (!safeName) return;
    if (isNaN(val) || val <= 0) { alert("O valor deve ser positivo."); return; }
    if (val > 9999999) { alert("O valor excede o limite permitido."); return; }
    
    // Validar Data
    const pDate = new Date(purchaseDate);
    if (isNaN(pDate.getTime()) || pDate.getFullYear() < 2000 || pDate.getFullYear() > 2100) {
        alert("Data inválida. Por favor verifique o ano.");
        return;
    }

    if (paymentMethod === 'CREDIT' && !selectedCardId) {
        alert("Por favor, selecione um cartão de crédito.");
        return;
    }
    
    onAdd({
        name: safeName,
        amount: val,
        category: selectedCategory, // Usa o estado explícito
        subCategory: selectedSubCategory,
        date: purchaseDate,
        dueDate: dueDate,
        isPaid: false,
        isRecurring,
        paymentMethod,
        cardId: paymentMethod === 'CREDIT' ? selectedCardId : undefined
    });
    
    if (!suggestions.includes(safeName)) {
      setSuggestions(prev => [safeName, ...prev].slice(0, 20));
    }

    setName('');
    setAmount('');
    setIsRecurring(false);
  };

  // --- STYLE CONSTANTS ---
  const inputClassName = "w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors";

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 text-lg">
          <PlusCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Nova Despesa
        </h2>
        
        <div className="relative group">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleScanReceipt}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            Scan IA
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Descrição</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            list="expense-suggestions"
            className={inputClassName}
            placeholder="Ex: Aluguel"
            disabled={loading}
            maxLength={50}
            required
          />
          <datalist id="expense-suggestions">
            {suggestions.map((s, i) => <option key={i} value={s} />)}
          </datalist>
        </div>

        {/* Valor e Data Compra */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Valor (R$)</label>
                <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    max="9999999"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={inputClassName}
                    placeholder="0.00"
                    disabled={loading}
                    required
                />
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Data Compra</label>
                <div className="relative">
                    <input 
                        type="date" 
                        max="9999-12-31"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className={`${inputClassName} pl-10`}
                        required
                    />
                    <Calendar className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>

        {/* Categoria e Subcategoria Divididas */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Categoria Principal</label>
                <select 
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className={inputClassName}
                >
                    {Object.keys(EXPENSE_CATEGORIES).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Subcategoria</label>
                <select 
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className={inputClassName}
                >
                    {EXPENSE_CATEGORIES[selectedCategory].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Método de Pagamento */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex gap-3 mb-4">
                <button
                    type="button"
                    onClick={() => setPaymentMethod('DEBIT')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'DEBIT' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                >
                    <Landmark className="w-4 h-4" /> Débito / Pix
                </button>
                <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'CREDIT' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                >
                    <CreditCardIcon className="w-4 h-4" /> Cartão Crédito
                </button>
            </div>

            {paymentMethod === 'CREDIT' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Selecione o Cartão</label>
                        {cards.length === 0 ? (
                            <div className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">Nenhum cartão cadastrado. Adicione um acima.</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {cards.map(card => (
                                    <button
                                        key={card.id}
                                        type="button"
                                        onClick={() => setSelectedCardId(card.id)}
                                        className={`p-3 rounded-xl text-left border transition-all relative overflow-hidden ${selectedCardId === card.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 opacity-70 hover:opacity-100'}`}
                                    >
                                        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${card.color}`}></div>
                                        <span className="text-xs font-bold block truncate text-slate-700 dark:text-slate-200">{card.name}</span>
                                        <span className="text-[10px] text-slate-400">Fecha dia {card.closingDay}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
                        <Calendar className="w-4 h-4" />
                        <span>
                            Vencimento Estimado: <strong>{dueDate.split('-').reverse().join('/')}</strong>
                        </span>
                    </div>
                </div>
            )}
        </div>

        {/* Recorrência */}
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${isRecurring ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
            >
                <Repeat className="w-4 h-4" />
                {isRecurring ? 'Repete todo mês' : 'Apenas este mês'}
            </button>
        </div>

        {loading && aiStatus && (
          <div className="text-xs text-indigo-500 dark:text-indigo-300 flex items-center gap-2 justify-center py-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 animate-pulse" />
            {aiStatus}
          </div>
        )}

        <button 
          type="submit" 
          disabled={!name || !amount || loading}
          className="w-full bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10 hover:shadow-xl mt-4 flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
        >
          {loading ? 'Processando...' : 'Adicionar Despesa'}
        </button>
      </form>
    </div>
  );
};
