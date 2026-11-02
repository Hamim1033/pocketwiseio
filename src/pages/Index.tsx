import { useState } from 'react';
import { Bell, Search, Settings, Crown, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';
import BalanceCard from '@/components/BalanceCard';
import SpendingChart, { CategoryChart } from '@/components/SpendingChart';
import TransactionList from '@/components/TransactionList';
import AccountCards from '@/components/AccountCards';
import AIInsights from '@/components/AIInsights';
import BudgetOverview from '@/components/BudgetOverview';
import GoalsPage from '@/components/GoalsPage';
import SettingsPage from '@/components/SettingsPage';
import PremiumScreen from '@/components/PremiumScreen';
import NotificationsSheet from '@/components/NotificationsSheet';
import SearchSheet from '@/components/SearchSheet';
import AddTransactionSheet from '@/components/AddTransactionSheet';
import BottomNav from '@/components/BottomNav';
import PinLockScreen from '@/components/PinLockScreen';
import { AppProvider, useAppData } from '@/contexts/AppContext';
import { Transaction } from '@/lib/types';

const AppContent = () => {
  const [page, setPage] = useState('home');
  const [prevPage, setPrevPage] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const { notifications, settings, t, isLocked, unlock } = useAppData();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLocked) {
    return <PinLockScreen onUnlock={unlock} />;
  }

  const handleEdit = (tx: Transaction) => {
    setEditTransaction(tx);
    setShowAdd(true);
  };

  const handleCloseAdd = () => {
    setShowAdd(false);
    setEditTransaction(null);
  };

  const navigateTo = (newPage: string) => {
    setPrevPage(page);
    setPage(newPage);
  };

  const goBack = () => {
    setPage(prevPage === 'settings' ? 'home' : prevPage);
  };

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          {page === 'settings' ? (
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          ) : (
            <img
              src={logo}
              alt="SpendWise"
              className="h-8 w-auto dark:brightness-110 dark:contrast-110"
            />
          )}
          <div>
            <p className="text-xs text-muted-foreground">{t('welcome')}</p>
            <p className="text-sm font-bold text-foreground">{settings.profileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowNotifications(true)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center relative"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-expense flex items-center justify-center">
                <span className="text-[8px] text-primary-foreground font-bold">{unreadCount}</span>
              </div>
            )}
          </button>
          <button
            onClick={() => navigateTo('settings')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${page === 'settings' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            <Settings className="w-4 h-4" />
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
                <h3 className="text-sm font-semibold text-foreground">{t('aiInsights')}</h3>
                <button
                  onClick={() => setShowPremium(true)}
                  className="text-xs text-primary font-medium flex items-center gap-1"
                >
                  <Crown className="w-3 h-3" /> {t('premium')}
                </button>
              </div>
              <AIInsights />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">{t('recentTransactions')}</h3>
                <button onClick={() => navigateTo('transactions')} className="text-xs text-primary font-medium">
                  {t('seeAll')}
                </button>
              </div>
              <TransactionList limit={5} onEdit={handleEdit} />
            </div>
          </>
        )}

        {page === 'transactions' && (
          <>
            <h2 className="text-lg font-bold text-foreground">{t('allTransactions')}</h2>
            <TransactionList onEdit={handleEdit} />
          </>
        )}

        {page === 'budget' && (
          <>
            <h2 className="text-lg font-bold text-foreground">{t('budgetTracker')}</h2>
            <BudgetOverview />
          </>
        )}

        {page === 'goals' && (
          <>
            <h2 className="text-lg font-bold text-foreground">{t('savingsGoals')}</h2>
            <GoalsPage />
          </>
        )}

        {page === 'settings' && (
          <>
            <h2 className="text-lg font-bold text-foreground">{t('settings')}</h2>
            <SettingsPage />
          </>
        )}
      </main>

      <AddTransactionSheet open={showAdd} onClose={handleCloseAdd} editTransaction={editTransaction} />
      <PremiumScreen open={showPremium} onClose={() => setShowPremium(false)} />
      <NotificationsSheet open={showNotifications} onClose={() => setShowNotifications(false)} />
      <SearchSheet open={showSearch} onClose={() => setShowSearch(false)} onEdit={handleEdit} />
      <BottomNav active={page} onNavigate={navigateTo} onAdd={() => setShowAdd(true)} />
    </div>
  );
};

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
