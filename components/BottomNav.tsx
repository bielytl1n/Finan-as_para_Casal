
import React from 'react';
import { LayoutDashboard, Wallet, Receipt, User } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Extrato', icon: Receipt },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
            {menuItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${
                        activeTab === item.id
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400'
                    }`}
                >
                    <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-current opacity-20' : ''}`} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
            ))}
        </div>
    </div>
  );
};
