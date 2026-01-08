
import React from 'react';
import { AlertTriangle, TrendingDown, ThumbsUp, Zap } from 'lucide-react';
import { formatCurrency } from '../utils.ts';

interface Props {
  totalIncome: number;
  totalSpent: number;
  remainingEssential: number;
}

export const SmartAlerts: React.FC<Props> = ({ totalIncome, totalSpent, remainingEssential }) => {
  const ratio = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
  
  // Lógica simples de Insights
  const alerts = [];

  if (ratio > 90) {
      alerts.push({
          id: 'critico',
          type: 'danger',
          icon: AlertTriangle,
          title: 'Cuidado!',
          text: `Você já comprometeu ${ratio.toFixed(0)}% da sua renda mensal.`
      });
  } else if (ratio < 50 && totalIncome > 0) {
      alerts.push({
          id: 'bom',
          type: 'success',
          icon: ThumbsUp,
          title: 'Excelente!',
          text: 'Seus gastos estão abaixo de 50%. Ótimo momento para investir.'
      });
  }

  if (remainingEssential < 0) {
       alerts.push({
          id: 'essencial',
          type: 'warning',
          icon: TrendingDown,
          title: 'Orçamento Essencial',
          text: `Você excedeu o limite essencial em ${formatCurrency(Math.abs(remainingEssential))}.`
      });
  }

  // Insight Padrão (Placeholder para IA)
  if (alerts.length === 0) {
      alerts.push({
          id: 'ia',
          type: 'info',
          icon: Zap,
          title: 'Análise Inteligente',
          text: 'Seus gastos parecem equilibrados esta semana. Continue assim!'
      });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                alert.type === 'danger' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' :
                alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' :
                'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30'
            }`}>
                <div className={`p-2 rounded-lg shrink-0 ${
                    alert.type === 'danger' ? 'bg-red-100 text-red-600' :
                    alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    alert.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-indigo-100 text-indigo-600'
                }`}>
                    <alert.icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{alert.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {alert.text}
                    </p>
                </div>
            </div>
        ))}
    </div>
  );
};
