import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import logo from '@/assets/logo.png';
import BalanceCard from '@/components/BalanceCard';
import SpendingChart, { CategoryChart } from '@/components/SpendingChart';
import TransactionList from '@/components/TransactionList';
import AccountCards from '@/components/AccountCards';
import AIInsights from '@/components/AIInsights';
import BudgetOverview from '@/components/BudgetOverview';
import AddTransactionSheet from '@/components/AddTransactionSheet';
import BottomNav from '@/components/BottomNav';
import { AppProvider } from '@/contexts/AppContext';

const AppContent = () => {
  const [page, setPage] = useState('home');
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Haque Digital" className="h-8 w-auto" />
          <div>
            <p className="text-xs text-muted-foreground">Welcome back 👋</p>
            <p className="text-sm font-bold text-foreground">SpendWise</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center relative">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-expense" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 space-y-5">
        {page === 'home' && (
          <>
            <BalanceCard />
            <AccountCards />
            <SpendingChart />
            <CategoryChart />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">AI Insights ✨</h3>
                <span className="text-xs text-primary font-medium cursor-pointer">Premium</span>
              </div>
              <AIInsights />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
                <button onClick={() => setPage('transactions')} className="text-xs text-primary font-medium">
                  See all
                </button>
              </div>
              <TransactionList limit={5} />
            </div>
          </>
        )}

        {page === 'transactions' && (
          <>
            <h2 className="text-lg font-bold text-foreground">All Transactions</h2>
            <TransactionList />
          </>
        )}

        {page === 'budget' && (
          <>
            <h2 className="text-lg font-bold text-foreground">Budget Tracker</h2>
            <BudgetOverview />
          </>
        )}

        {page === 'goals' && (
          <>
            <h2 className="text-lg font-bold text-foreground">Savings Goals</h2>
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-sm font-semibold text-foreground mb-1">Coming Soon</p>
              <p className="text-xs text-muted-foreground">Set savings goals and track your progress towards them.</p>
            </div>
          </>
        )}
      </main>

      <AddTransactionSheet open={showAdd} onClose={() => setShowAdd(false)} />
      <BottomNav active={page} onNavigate={setPage} onAdd={() => setShowAdd(true)} />
    </div>
  );
};

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
