
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Camera, Sparkles, Loader2, Calendar, Repeat } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CategoryType, Expense, SubCategoryType } from '../types.ts';
import { sanitizeString, loadFromStorage } from '../utils.ts';

interface Props {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  currentDate: Date;
}

// Mapeamento estrito das subcategorias conforme definido em types.ts
const SubCategoriesMap: Record<CategoryType, string[]> = {
  [CategoryType.ESSENTIAL]: ['Moradia', 'Mercado', 'Saúde', 'Educação', 'Transporte', 'Outros'],
  [CategoryType.LIFESTYLE]: ['Lazer', 'Restaurantes', 'Assinaturas', 'Viagem', 'Compras', 'Outros'],
  [CategoryType.GOALS]: ['Reserva', 'Investimentos', 'Aposentadoria', 'Dívidas', 'Outros']
};

export const SmartExpenseForm: React.FC<Props> = ({ onAdd, currentDate }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>(CategoryType.ESSENTIAL);
  const [subCategory, setSubCategory] = useState<string>('Outros');
  const [dueDate, setDueDate] = useState<string>(currentDate.toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Atualiza a data padrão quando o mês muda
    const now = new Date();
    // Se o mês selecionado for o atual, usa o dia de hoje, senão usa dia 1
    if (currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear()) {
         setDueDate(now.toISOString().split('T')[0]);
    } else {
         const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
         setDueDate(firstDay.toISOString().split('T')[0]);
    }
  }, [currentDate]);

  useEffect(() => {
    const savedExpenses = loadFromStorage<Expense[]>('cf_expenses', []);
    if (savedExpenses && savedExpenses.length > 0) {
      const uniqueNames = Array.from(new Set(
        savedExpenses.slice().reverse().map(e => e.name)
      )).slice(0, 20);
      setSuggestions(uniqueNames);
    }
  }, []);

  const getApiKey = () => process.env.API_KEY;

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      alert("Arquivo inválido (max 5MB, imagem apenas).");
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      alert("Erro de Configuração: API_KEY não encontrada no ambiente. Configure sua chave no arquivo .env ou nas variáveis do sistema.");
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
      
      // Contexto extra para a IA saber quais subcategorias existem
      const subcatsContext = `
        Valid Subcategories:
        - Essencial: ${SubCategoriesMap[CategoryType.ESSENTIAL].join(', ')}
        - Estilo de Vida: ${SubCategoriesMap[CategoryType.LIFESTYLE].join(', ')}
        - Objetivos: ${SubCategoriesMap[CategoryType.GOALS].join(', ')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Content } }
          ]
        },
        config: {
          systemInstruction: `Extract merchant name ("name"), total amount ("amount"), suggest a category ("category") and strictly suggest a sub-category ("subCategory") from the provided lists. JSON format. ${subcatsContext}`,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const json = JSON.parse(text);
        if (json.name) setName(sanitizeString(json.name));
        if (json.amount) setAmount(Math.abs(Number(json.amount)).toString());
        
        // Lógica inteligente para definir Categoria E Subcategoria
        let detectedCategory = category;
        
        if (json.category) {
            const catStr = json.category.toLowerCase();
            if (catStr.includes('essencial')) detectedCategory = CategoryType.ESSENTIAL;
            else if (catStr.includes('estilo')) detectedCategory = CategoryType.LIFESTYLE;
            else if (catStr.includes('objetivos')) detectedCategory = CategoryType.GOALS;
            
            setCategory(detectedCategory);
        }

        // Tenta aplicar a subcategoria sugerida se ela for válida para a categoria detectada
        if (json.subCategory) {
            const validSubs = SubCategoriesMap[detectedCategory];
            // Busca insensível a maiúsculas/minúsculas
            const match = validSubs.find(s => s.toLowerCase() === json.subCategory.toLowerCase());
            setSubCategory(match || 'Outros');
        } else if (json.category) {
            // Se mudou a categoria mas a IA não soube a subcategoria, reseta para Outros
            setSubCategory('Outros');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Falha na leitura IA. Verifique sua conexão e a validade da API Key.');
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

    if (!safeName || isNaN(val) || val <= 0) return;
    
    onAdd({
        name: safeName,
        amount: val,
        category,
        subCategory,
        date: currentDate.toISOString(), // Data de registro = mês atual
        dueDate: dueDate,
        isPaid: false,
        isRecurring
    });
    
    // Atualiza sugestões locais
    if (!suggestions.includes(safeName)) {
      setSuggestions(prev => [safeName, ...prev].slice(0, 20));
    }

    setName('');
    setAmount('');
    setIsRecurring(false);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as CategoryType;
    setCategory(newCategory);
    // IMPORTANTE: Reseta a subcategoria para o padrão ('Outros') sempre que a categoria muda
    // Isso evita estados inconsistentes (ex: Categoria 'Essencial' com Subcategoria 'Investimentos')
    setSubCategory('Outros'); 
  };

  // Garante que a lista de opções seja sempre baseada na categoria atual
  const currentSubCategoryOptions = SubCategoriesMap[category] || ['Outros'];

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            Scan IA
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nome */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            list="expense-suggestions"
            className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            placeholder="Ex: Aluguel"
            disabled={loading}
            maxLength={60} 
          />
          <datalist id="expense-suggestions">
            {suggestions.map((s, i) => <option key={i} value={s} />)}
          </datalist>
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor (R$)</label>
                <input 
                    type="number" 
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="0.00"
                    disabled={loading}
                />
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vencimento</label>
                <div className="relative">
                    <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2 pl-8 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <Calendar className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                </div>
            </div>
        </div>

        {/* Categoria e Subcategoria */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria</label>
                <select 
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                >
                    {Object.values(CategoryType).map(cat => (
                        <option key={cat} value={cat}>{cat.split(' ')[0]}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subcategoria</label>
                <select 
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                >
                    {currentSubCategoryOptions.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Recorrência */}
        <div className="flex items-center gap-2 pt-1">
            <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition-all ${isRecurring ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
            >
                <Repeat className="w-3.5 h-3.5" />
                {isRecurring ? 'Repete todo mês' : 'Apenas este mês'}
            </button>
        </div>

        {loading && aiStatus && (
          <div className="text-xs text-indigo-500 dark:text-indigo-300 flex items-center gap-2 justify-center py-1">
            <Sparkles className="w-3 h-3 animate-pulse" />
            {aiStatus}
          </div>
        )}

        <button 
          type="submit" 
          disabled={!name || !amount || loading}
          className="w-full bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2 flex justify-center items-center gap-2"
        >
          {loading ? 'Processando...' : 'Adicionar Despesa'}
        </button>
      </form>
    </div>
  );
};
