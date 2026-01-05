import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { FinancialSummary, Expense } from '../types.ts';

interface Props {
  summary: FinancialSummary;
  expenses: Expense[];
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
      {content.split('\n').map((line, i) => {
        const cleanLine = line.trim();
        if (!cleanLine) return <div key={i} className="h-2" />;
        if (cleanLine.startsWith('**')) return <strong key={i} className="block text-white mt-2">{cleanLine.replace(/\*\*/g, '')}</strong>;
        if (cleanLine.startsWith('-')) return <div key={i} className="flex gap-2 ml-2"><span className="text-indigo-400">•</span><span>{cleanLine.substring(1)}</span></div>;
        return <p key={i}>{cleanLine.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
};

export const AIAdvisor: React.FC<Props> = ({ summary, expenses }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAdvice = async () => {
    // API key must be obtained from process.env.API_KEY
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      setError('Chave de API não configurada (process.env.API_KEY).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Aja como um consultor financeiro sênior para casais. Analise os dados abaixo e dê 3 conselhos práticos e diretos (max 100 palavras total) em formato Markdown.
        
        CONTEXTO:
        - Renda Total: R$ ${summary.totalIncome.toFixed(2)}
        - Gasto Total: R$ ${summary.totalSpent.toFixed(2)}
        - 50/30/20 Realizado:
          * Essencial: R$ ${summary.spentEssential.toFixed(2)} (Meta: ${summary.limitEssential.toFixed(2)})
          * Estilo: R$ ${summary.spentLifestyle.toFixed(2)} (Meta: ${summary.limitLifestyle.toFixed(2)})
          * Objetivos: R$ ${summary.spentGoals.toFixed(2)} (Meta: ${summary.limitGoals.toFixed(2)})
        
        MAIORES GASTOS:
        ${expenses.slice(0, 5).map(e => `- ${e.name}: R$ ${e.amount.toFixed(2)}`).join('\n')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "Não foi possível gerar uma resposta.");
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com a IA. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700 mt-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Consultor IA</h2>
              <p className="text-slate-400 text-xs">Powered by Gemini</p>
            </div>
          </div>
          
          {!advice && !loading && (
            <button 
              onClick={generateAdvice}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Analisar
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 text-indigo-400 gap-2">
            <Loader2 className="animate-spin w-5 h-5" />
            <span className="text-sm">Analisando finanças do casal...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg flex items-center gap-3 text-red-200 text-sm">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {advice && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <MarkdownRenderer content={advice} />
            <button 
              onClick={generateAdvice}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Gerar nova análise
            </button>
          </div>
        )}
      </div>
    </div>
  );
};