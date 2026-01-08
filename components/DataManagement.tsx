
import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, FileJson, Check, Loader2, Database, RefreshCw } from 'lucide-react';

const STORAGE_KEYS = [
  'cf_expenses',
  'cf_cards',
  'cf_accounts',
  'cf_incomeA',
  'cf_incomeB',
  'cf_profileA',
  'cf_profileB',
  'cf_goals',
  'cf_darkmode'
];

export const DataManagement: React.FC = () => {
  const [loading, setLoading] = useState<'export' | 'import' | 'reset' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EXPORTAR ---
  const handleExport = () => {
    setLoading('export');
    try {
      const data: Record<string, any> = {
        meta: {
          app: 'CasalFinancas',
          version: '2.0',
          exportedAt: new Date().toISOString()
        }
      };

      STORAGE_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            data[key] = JSON.parse(item);
          } catch (e) {
            console.warn(`Erro ao parsear ${key}`, e);
          }
        }
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-casalfinancas-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ type: 'success', text: 'Backup gerado com sucesso!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Falha ao gerar backup.' });
    } finally {
      setLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // --- IMPORTAR ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert("Por favor, selecione um arquivo .json válido.");
      return;
    }

    if (!window.confirm("ATENÇÃO: Isso substituirá TODOS os seus dados atuais pelos dados do backup. Essa ação é irreversível. Deseja continuar?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLoading('import');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // Validação simples
        if (!json.meta || json.meta.app !== 'CasalFinancas') {
          throw new Error("Arquivo de backup inválido ou incompatível.");
        }

        // Limpar dados atuais
        STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

        // Restaurar dados
        Object.keys(json).forEach(key => {
          if (STORAGE_KEYS.includes(key)) {
            localStorage.setItem(key, JSON.stringify(json[key]));
          }
        });

        setMessage({ type: 'success', text: 'Dados restaurados! Recarregando...' });
        setTimeout(() => window.location.reload(), 1500);

      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Erro ao restaurar: Arquivo inválido.' });
        setLoading(null);
      }
    };

    reader.readAsText(file);
  };

  // --- RESETAR ---
  const handleReset = () => {
    if (window.confirm("PERIGO: Você tem certeza que deseja APAGAR TUDO? Todos os dados serão perdidos para sempre.") &&
        window.confirm("Confirmação final: Deseja realmente resetar o aplicativo para o estado inicial?")) {
      
      setLoading('reset');
      STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
      
      setMessage({ type: 'success', text: 'Aplicativo resetado. Recarregando...' });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-2 px-2">
        <Database className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gerenciamento de Dados</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Card de Backup */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Fazer Backup</h3>
                <p className="text-xs text-slate-500">Salvar dados no dispositivo</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Gera um arquivo JSON com todas as suas despesas, cartões e configurações. Guarde-o em local seguro.
            </p>
          </div>
          <button 
            onClick={handleExport}
            disabled={loading !== null}
            className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
            Exportar Dados
          </button>
        </div>

        {/* Card de Restore */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Restaurar Dados</h3>
                <p className="text-xs text-slate-500">Carregar de um backup</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Recupera seus dados a partir de um arquivo salvo anteriormente. <strong className="text-amber-500">Substitui os dados atuais.</strong>
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            disabled={loading !== null}
            className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Importar Backup
          </button>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
             <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 mt-1">
                <AlertTriangle className="w-5 h-5" />
             </div>
             <div>
                <h4 className="font-bold text-red-800 dark:text-red-200 text-sm">Zona de Perigo</h4>
                <p className="text-xs text-red-600 dark:text-red-400 max-w-sm mt-1">
                   Deseja começar do zero? Essa ação apagará todas as despesas, contas e configurações deste navegador.
                </p>
             </div>
          </div>
          <button 
             onClick={handleReset}
             disabled={loading !== null}
             className="whitespace-nowrap px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
          >
             <Trash2 className="w-3.5 h-3.5" />
             Apagar Tudo
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {message && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-10 md:left-auto md:right-10 md:translate-x-0 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50 ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}
    </div>
  );
};
