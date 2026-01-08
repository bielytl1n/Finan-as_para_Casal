
import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase.ts';
import { AlertTriangle, Lock } from 'lucide-react';

export const LoginScreen = () => {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao conectar: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-700">
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30 transform -rotate-3 hover:rotate-0 transition-transform">
          <span className="text-5xl">🚀</span>
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">CasalFinanças</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Sincronize as contas do casal em tempo real e atinja suas metas.</p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 text-left border border-red-100 dark:border-red-900/30">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin} 
          className="w-full py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="G" />
          <span>Entrar com Google</span>
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="w-3 h-3" />
          <span>Seus dados são criptografados e seguros.</span>
        </div>
      </div>
    </div>
  );
};
