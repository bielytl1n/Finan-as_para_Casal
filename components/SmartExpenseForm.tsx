
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Camera, Sparkles, Loader2, FileText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CategoryType, Expense } from '../types.ts';
import { sanitizeString, loadFromStorage } from '../utils.ts';

interface Props {
  onAdd: (name: string, amount: number, category: CategoryType) => void;
}

export const SmartExpenseForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>(CategoryType.ESSENTIAL);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega sugestões de nomes baseadas em despesas anteriores
  useEffect(() => {
    const savedExpenses = loadFromStorage<Expense[]>('cf_expenses', []);
    if (savedExpenses && savedExpenses.length > 0) {
      // Cria um Set para valores únicos, revertendo o array para pegar os mais recentes primeiro
      const uniqueNames = Array.from(new Set(
        savedExpenses
          .slice() // Cria cópia para não mutar original
          .reverse() 
          .map(e => e.name)
      )).slice(0, 20); // Limita a 20 sugestões para performance
      setSuggestions(uniqueNames);
    }
  }, []); // Executa apenas na montagem

  const getApiKey = () => process.env.API_KEY;

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Security: Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem é muito grande. O tamanho máximo é 5MB.");
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      alert("Erro de Configuração: Chave de API não disponível.");
      return;
    }

    setLoading(true);
    setAiStatus('Lendo recibo...');
    
    try {
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Security: Ensure we only get the base64 part
          const base64 = result.split(',')[1];
          if (base64) resolve(base64);
          else reject(new Error("Falha ao ler arquivo."));
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Content } }
          ]
        },
        config: {
          systemInstruction: 'Analyze the provided receipt image. Extract the merchant name (or concept) as "name", the total amount as "amount" (number), and suggest a category from ["Essencial", "Estilo de Vida", "Objetivos"]. Return JSON format: { "name": string, "amount": number, "category": string }.',
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const json = JSON.parse(text);
        // Security: Sanitize all outputs from AI
        if (json.name) setName(sanitizeString(json.name));
        if (json.amount) setAmount(Math.abs(Number(json.amount)).toString()); // Ensure positive
        if (json.category) {
          const cat = json.category.toLowerCase();
          if (cat.includes('essencial')) setCategory(CategoryType.ESSENTIAL);
          else if (cat.includes('estilo')) setCategory(CategoryType.LIFESTYLE);
          else if (cat.includes('objetivos')) setCategory(CategoryType.GOALS);
        }
      }
    } catch (err) {
      console.error("Erro no processamento do recibo:", err);
      alert('Não foi possível ler o recibo. Verifique a imagem e tente novamente.');
    } finally {
      setLoading(false);
      setAiStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAutoCategorize = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!name) return;

    const apiKey = getApiKey();
    if (!apiKey) return;

    setLoading(true);
    setAiStatus('Categorizando...');

    // Security: Sanitize input to prevent prompt injection
    const safeName = sanitizeString(name);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: safeName,
        config: {
            systemInstruction: 'Categorize the expense provided by the user into exactly one of these categories: "Essencial", "Estilo de Vida", "Objetivos". Return ONLY the category name string.'
        }
      });

      const text = response.text?.toLowerCase() || '';
      
      if (text.includes('essencial')) setCategory(CategoryType.ESSENTIAL);
      else if (text.includes('estilo')) setCategory(CategoryType.LIFESTYLE);
      else if (text.includes('objetivos')) setCategory(CategoryType.GOALS);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setAiStatus('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    
    // Security: Final sanitization before state update
    const safeName = sanitizeString(name);

    if (!safeName || isNaN(val) || val <= 0) return;
    
    onAdd(safeName, val, category);
    
    // Atualiza sugestões se for um nome novo
    if (!suggestions.includes(safeName)) {
      setSuggestions(prev => [safeName, ...prev].slice(0, 20));
    }

    setName('');
    setAmount('');
    setCategory(CategoryType.ESSENTIAL);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24 transition-colors">
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
            title="Escanear Recibo com IA"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            Scan IA
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Descrição</label>
          <div className="relative mt-1">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              list="expense-suggestions"
              className="w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-300 dark:placeholder-slate-600"
              placeholder="Ex: Supermercado"
              disabled={loading}
              maxLength={100} 
            />
            {/* Datalist for Autocomplete */}
            <datalist id="expense-suggestions">
              {suggestions.map((suggestion, index) => (
                <option key={index} value={suggestion} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Valor (R$)</label>
          <input 
            type="number" 
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-300 dark:placeholder-slate-600"
            placeholder="0.00"
            disabled={loading}
          />
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
            <span>Categoria</span>
            {name && !loading && (
              <button 
                onClick={handleAutoCategorize}
                type="button"
                className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Sugerir
              </button>
            )}
          </label>
          <div className="relative">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none"
              disabled={loading}
            >
              {Object.values(CategoryType).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {loading && aiStatus && (
          <div className="text-xs text-indigo-500 dark:text-indigo-300 flex items-center gap-2 justify-center py-1 bg-indigo-50/50 dark:bg-indigo-900/30 rounded animate-pulse">
            <Sparkles className="w-3 h-3" />
            {aiStatus}
          </div>
        )}

        <button 
          type="submit" 
          disabled={!name || !amount || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2 flex justify-center items-center gap-2"
        >
          {loading ? 'Processando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};
