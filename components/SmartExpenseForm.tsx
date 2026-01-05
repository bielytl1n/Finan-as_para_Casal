import React, { useState, useRef } from 'react';
import { PlusCircle, Camera, Sparkles, Loader2, FileText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CategoryType } from '../types.ts';

interface Props {
  onAdd: (name: string, amount: number, category: CategoryType) => void;
}

export const SmartExpenseForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>(CategoryType.ESSENTIAL);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getApiKey = () => process.env.API_KEY;

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      alert("Configure a API_KEY em api.ts ou .env");
      return;
    }

    setLoading(true);
    setAiStatus('Lendo recibo...');
    
    try {
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Content } },
            { text: 'Analyze this receipt. Extract the merchant name (or concept) as "name", the total amount as "amount" (number), and suggest a category from ["Essencial", "Estilo de Vida", "Objetivos"]. Return JSON format: { "name": string, "amount": number, "category": string }.' }
          ]
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const json = JSON.parse(text);
        if (json.name) setName(json.name);
        if (json.amount) setAmount(json.amount.toString());
        if (json.category) {
          if (json.category.toLowerCase().includes('essencial')) setCategory(CategoryType.ESSENTIAL);
          else if (json.category.toLowerCase().includes('estilo')) setCategory(CategoryType.LIFESTYLE);
          else if (json.category.toLowerCase().includes('objetivos')) setCategory(CategoryType.GOALS);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível ler o recibo. Tente novamente.');
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

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize the expense "${name}" into exactly one of these categories: "Essencial", "Estilo de Vida", "Objetivos". Return ONLY the category name string.`,
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
    if (!name || isNaN(val) || val <= 0) return;
    
    onAdd(name, val, category);
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
              className="w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-300 dark:placeholder-slate-600"
              placeholder="Ex: Supermercado"
              disabled={loading}
            />
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