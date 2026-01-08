
import React from 'react';
import { LayoutDashboard, Wallet, Receipt, User, LogOut } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: Receipt },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40">
      <div className="p-6">
        <h1 className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">CF</div>
            CasalFinanças
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(item => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
                <item.icon className="w-5 h-5" />
                {item.label}
            </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
             <p className="text-xs text-slate-400 mb-2">Versão 2.0.0 (Beta)</p>
             <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sair
             </button>
          </div>
      </div>
    </aside>
  );
};
