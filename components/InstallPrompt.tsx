
import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface Props {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallPrompt: React.FC<Props> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 dark:bg-indigo-950 text-white p-5 rounded-2xl shadow-2xl border border-slate-700/50 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <button 
        onClick={onDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-indigo-600 p-3 rounded-xl shrink-0">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight mb-1">Instalar Aplicativo</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Instale o CasalFinanças na sua tela inicial para acesso rápido e offline.
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onDismiss}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
            >
              Agora não
            </button>
            <button 
              onClick={onInstall}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-bold bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
