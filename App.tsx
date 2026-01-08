
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon, Download, LogOut } from 'lucide-react';
import { getMonthName, formatCurrency } from './utils.ts';
import { CategoryType } from './types.ts';

// Context
import { useFinancial } from './contexts/FinancialContext.tsx';

// Components
import { LoginScreen } from './components/LoginScreen.tsx';
import { IncomeSection } from './components/IncomeSection.tsx';
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { SmartExpenseForm } from './components/SmartExpenseForm.tsx';
import { CategoryGrid } from './components/CategoryGrid.tsx';
import { FinancialAgenda } from './components/FinancialAgenda.tsx';
import { BudgetAlerts } from './components/BudgetAlerts.tsx';
import { CreditCardManager } from './components/CreditCardManager.tsx';
import { AccountManager } from './components/AccountManager.tsx';
import { InstallPrompt } from './components/InstallPrompt.tsx';
import { DataManagement } from './components/DataManagement.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { FinancialGoals } from './components/FinancialGoals.tsx';
import { SmartAlerts } from './components/SmartAlerts.tsx';

function App() {
  const {
      // Auth
      user, loading, logout,

      // UI & Nav
      activeTab, setActiveTab,
      currentDate, changeMonth,
      darkMode, setDarkMode,
      
      // Profiles
      profileA, setProfileA,
      profileB, setProfileB,

      // Data Lists
      cards, setCards,
      accounts, setAccounts,
      allExpenses,
      currentExpenses,
      incomeListA, setIncomeListA,
      incomeListB, setIncomeListB,
      
      // Computed
      totalIncome, totalSpent,
      incomeA, incomeB,
      percentageA, percentageB,
      totals, limits,
      
      // Alerts & Actions
      activeAlerts, dismissedAlerts, setDismissedAlerts,
      handleAddExpense, handleRemoveExpense, handleTogglePaid,
      
      // PWA
      installPrompt, showInstallBanner, setShowInstallBanner, handleInstallClick
  } = useFinancial();

  // --- AUTH GUARD ---
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm font-medium">Carregando finanças...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // --- HEADER COMPONENT ---
  const HeaderControls = () => (
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-4 z-30 mb-6">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 flex-1 justify-between sm:justify-center border border-slate-200 dark:border-slate-700">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><ChevronLeft className="w-4 h-4" /></button>
              <div className="flex items-center gap-2 px-2 font-bold text-sm text-slate-700 dark:text-slate-200 min-w-[120px] justify-center">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="capitalize">{getMonthName(currentDate)}</span>
              </div>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 transition-colors">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={logout} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-500 transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
          </button>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* 1. SIDEBAR (Desktop) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        <HeaderControls />

        {/* --- VIEW: DASHBOARD (Home) --- */}
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Top: Accounts + Analytics */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <AccountManager accounts={accounts} setAccounts={setAccounts} nameA={profileA.firstName} nameB={profileB.firstName} />
                        <FinancialGoals />
                    </div>
                    <div className="lg:col-span-2">
                        <AnalyticsDashboard expenses={currentExpenses} totalIncome={totalIncome} totalSpent={totalSpent} />
                        <div className="mt-6">
                            <SmartAlerts totalIncome={totalIncome} totalSpent={totalSpent} remainingEssential={limits.essential - (totals[CategoryType.ESSENTIAL] || 0)} />
                        </div>
                    </div>
                </div>

                {/* Middle: Cards Carousel */}
                <div>
                     <CreditCardManager 
                        cards={cards} 
                        setCards={setCards}
                        profileA={profileA}
                        profileB={profileB}
                        expenses={allExpenses} 
                     />
                </div>
            </div>
        )}

        {/* --- VIEW: TRANSACTIONS (Lançamentos) --- */}
        {activeTab === 'transactions' && (
            <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 space-y-8">
                    <BudgetAlerts alerts={activeAlerts} onDismiss={(id) => setDismissedAlerts([...dismissedAlerts, id])} />
                    
                    <IncomeSection 
                        firstNameA={profileA.firstName} 
                        setFirstNameA={(v) => setProfileA({...profileA, firstName: v})} 
                        itemsA={incomeListA} setItemsA={setIncomeListA}
                        
                        firstNameB={profileB.firstName} 
                        setFirstNameB={(v) => setProfileB({...profileB, firstName: v})} 
                        itemsB={incomeListB} setItemsB={setIncomeListB}
                        
                        totalIncome={totalIncome} percentageA={percentageA} percentageB={percentageB}
                        currentDate={currentDate}
                    />

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Detalhamento por Categoria</h3>
                        <CategoryGrid 
                            expenses={currentExpenses} onRemove={handleRemoveExpense} limits={limits}
                            percentageA={percentageA} percentageB={percentageB} 
                            nameA={profileA.firstName} nameB={profileB.firstName}
                        />
                    </div>
                    
                    <SmartExpenseForm onAdd={handleAddExpense} currentDate={currentDate} cards={cards} />
                </div>

                <div className="lg:col-span-1">
                    <FinancialAgenda 
                        expenses={currentExpenses} incomesA={incomeListA} incomesB={incomeListB}
                        currentDate={currentDate} onTogglePaid={handleTogglePaid}
                    />
                </div>
            </div>
        )}

        {/* --- VIEW: WALLET (Carteira) --- */}
        {activeTab === 'wallet' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold">Minha Carteira</h2>
                <AccountManager accounts={accounts} setAccounts={setAccounts} nameA={profileA.firstName} nameB={profileB.firstName} />
                <CreditCardManager cards={cards} setCards={setCards} profileA={profileA} profileB={profileB} expenses={allExpenses} />
                <AIAdvisor 
                    summary={{
                        totalIncome, totalSpent,
                        spentEssential: totals[CategoryType.ESSENTIAL] || 0, limitEssential: limits.essential,
                        spentLifestyle: totals[CategoryType.LIFESTYLE] || 0, limitLifestyle: limits.lifestyle,
                        spentGoals: totals[CategoryType.GOALS] || 0, limitGoals: limits.goals,
                        monthName: getMonthName(currentDate)
                    }}
                    expenses={currentExpenses}
                />
            </div>
        )}

        {/* --- VIEW: PROFILE (Perfil) --- */}
        {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto py-12 text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                </div>
                <h2 className="text-2xl font-bold mb-1">Configuração de Perfil</h2>
                <p className="text-slate-500 mb-2">Conectado como {user?.email}</p>
                <button onClick={logout} className="text-xs text-red-500 font-bold hover:underline mb-8">Sair da Conta</button>
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-6">
                    
                    {/* Perfil A */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                         <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">Perfil A (Ele)</h3>
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Primeiro Nome</label>
                                <input 
                                    value={profileA.firstName} 
                                    onChange={e => setProfileA({...profileA, firstName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Gabriel"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Sobrenome</label>
                                <input 
                                    value={profileA.lastName} 
                                    onChange={e => setProfileA({...profileA, lastName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Queiroz"
                                />
                            </div>
                         </div>
                    </div>

                    {/* Perfil B */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                         <h3 className="text-sm font-bold text-pink-600 dark:text-pink-400 mb-3 uppercase tracking-wider">Perfil B (Ela)</h3>
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Primeiro Nome</label>
                                <input 
                                    value={profileB.firstName} 
                                    onChange={e => setProfileB({...profileB, firstName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Daiane"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Sobrenome</label>
                                <input 
                                    value={profileB.lastName} 
                                    onChange={e => setProfileB({...profileB, lastName: e.target.value})} 
                                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                                    placeholder="Ex: Rodrigues"
                                />
                            </div>
                         </div>
                    </div>

                    {/* Área de Dados e Backup */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                        <DataManagement />
                    </div>

                    {installPrompt && (
                        <button onClick={handleInstallClick} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex justify-center gap-2 items-center mt-4">
                            <Download className="w-4 h-4" /> Instalar App
                        </button>
                    )}
                </div>
            </div>
        )}

      </main>

      {/* 3. BOTTOM NAV (Mobile) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {installPrompt && showInstallBanner && (
          <InstallPrompt onInstall={handleInstallClick} onDismiss={() => setShowInstallBanner(false)} />
      )}
    </div>
  );
}

export default App;
