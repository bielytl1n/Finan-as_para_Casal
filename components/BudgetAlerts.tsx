
import React from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface AlertData {
  id: string;
  label: string;
  type: 'warning' | 'danger';
  message: string;
  pct: number;
}

interface Props {
  alerts: AlertData[];
  onDismiss: (id: string) => void;
}

export const BudgetAlerts: React.FC<Props> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={`
            relative flex items-start gap-4 p-4 rounded-xl border shadow-sm transition-all
            ${alert.type === 'danger' 
              ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' 
              : 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'
            }
          `}
        >
          <div className={`
            p-2 rounded-full shrink-0
            ${alert.type === 'danger' 
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
            }
          `}>
            {alert.type === 'danger' ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>

          <div className="flex-1 pt-0.5">
            <h4 className={`text-sm font-bold ${alert.type === 'danger' ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100'}`}>
              {alert.type === 'danger' ? 'Limite Excedido' : 'Atenção ao Orçamento'}
            </h4>
            <p className={`text-sm mt-0.5 ${alert.type === 'danger' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
              A categoria <span className="font-bold">{alert.label}</span> {alert.message}.
            </p>
            
            {/* Barra de progresso visual dentro do alerta */}
            <div className="mt-2 w-full h-1.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${alert.type === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(alert.pct, 100)}%` }}
              />
            </div>
          </div>

          <button 
            onClick={() => onDismiss(alert.id)}
            className={`
              p-1 rounded-lg transition-colors
              ${alert.type === 'danger' 
                ? 'text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
                : 'text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
              }
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
