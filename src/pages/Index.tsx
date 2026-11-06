import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Settings, Crown, ArrowLeft, Sparkles, TrendingUp, TrendingDown, Wallet, HandCoins, PiggyBank, CalendarClock, ChevronRight } from 'lucide-react';
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
import DateRangeFilter from '@/components/DateRangeFilter';
import LoansPage from '@/components/LoansPage';
import BillsPage from '@/components/BillsPage';
import SavingsPage from '@/components/SavingsPage';
import AccountsPage from '@/components/AccountsPage';
import ReportsPage from '@/components/ReportsPage';
import InsightsPage from '@/components/InsightsPage';
import MoreMenu from '@/components/MoreMenu';
import { AppProvider, useAppData } from '@/contexts/AppContext';
import { generateInsights } from '@/lib/insights';
import { Progress } from '@/components/ui/progress';
import { Transaction } from '@/lib/types';

const StatTile = ({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: string; color: string; onClick?: () => void }) => (
  <button onClick={onClick} className="glass-card rounded-xl p-3 text-left active:scale-95 transition-transform">
    <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center mb-1.5`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="text-sm font-bold text-foreground">{value}</p>
  </button>
);

const AppContent = () => {
  const [page, setPage] = useState('home');
  const [prevPage, setPrevPage] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const {
    notifications, settings, t, isLocked, unlock,
    dateRange, filteredTransactions, rangeIncome, rangeExpense, rangeNet,
    outstandingLoans, totalSavings, budgets, upcomingPayments,
    transactions, loans, bills, goals,
  } = useAppData();
  const unreadCount = notifications.filter(n => !n.read).length;

  const topInsights = generateInsights({
    transactions, budgets, loans, bills, goals,
    range: { start: dateRange.start, end: dateRange.end, prevStart: dateRange.prevStart, prevEnd: dateRange.prevEnd, label: dateRange.label },
    cs: settings.currencySymbol,
  }).slice(0, 2);

  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0);
  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const budgetPct = budgetTotal > 0 ? Math.min((budgetSpent / budgetTotal) * 100, 100) : 0;

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

  const subtitlePages: Record<string, string> = {
    transactions: t('allTransactions'),
    budget: t('budgetTracker'),
    goals: t('savingsGoals'),
    more: 'Finance Modules',
    loans: 'Loans & Debts',
    bills: 'Bills & Subscriptions',
    savings: 'Savings',
    accounts: 'Accounts & Wallets',
    reports: 'Financial Reports',
    insights: 'AI Financial Insights',
    settings: t('settings'),
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
            <>
              <img src={logo} alt="SpendWise" className="h-8 w-auto dark:hidden" />
              <img src={logoDark} alt="SpendWise" className="h-8 w-auto hidden dark:block" />
            </>
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
            <DateRangeFilter />
            <BalanceCard />

            {/* Period stats — respect the selected date range */}
            <div className="grid grid-cols-3 gap-2">
              <StatTile icon={TrendingUp} label="Income (period)" value={`${settings.currencySymbol}${rangeIncome.toLocaleString()}`} color="bg-income/10 text-income" onClick={() => navigateTo('reports')} />
              <StatTile icon={TrendingDown} label="Expenses (period)" value={`${settings.currencySymbol}${rangeExpense.toLocaleString()}`} color="bg-expense/10 text-expense" onClick={() => navigateTo('reports')} />
              <StatTile icon={Wallet} label="Net cash flow" value={`${settings.currencySymbol}${rangeNet.toLocaleString()}`} color="bg-primary/10 text-primary" onClick={() => navigateTo('reports')} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatTile icon={HandCoins} label="Outstanding loans" value={`${settings.currencySymbol}${Math.round(outstandingLoans).toLocaleString()}`} color="bg-expense/10 text-expense" onClick={() => navigateTo('loans')} />
              <StatTile icon={PiggyBank} label="Total savings" value={`${settings.currencySymbol}${Math.round(totalSavings).toLocaleString()}`} color="bg-income/10 text-income" onClick={() => navigateTo('savings')} />
              <StatTile icon={Crown} label="Budget used" value={`${Math.round(budgetPct)}%`} color="bg-warning/10 text-warning" onClick={() => navigateTo('budget')} />
            </div>

            <AccountCards />
            <SpendingChart />
            <CategoryChart />

            {/* Budget utilization */}
            {budgetTotal > 0 && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Budget Utilization</p>
                  <span className={`text-xs font-semibold ${budgetPct >= 90 ? 'text-expense' : 'text-primary'}`}>{Math.round(budgetPct)}%</span>
                </div>
                <Progress value={budgetPct} className={`h-2 ${budgetPct >= 90 ? '[&>div]:bg-expense' : '[&>div]:bg-primary'}`} />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {settings.currencySymbol}{budgetSpent.toLocaleString()} of {settings.currencySymbol}{budgetTotal.toLocaleString()} · {settings.currencySymbol}{Math.max(budgetTotal - budgetSpent, 0).toLocaleString()} remaining
                </p>
              </div>
            )}

            {/* Upcoming payments */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Upcoming Payments</h3>
              {upcomingPayments.length === 0 ? (
                <div className="glass-card rounded-xl p-4 text-center">
                  <CalendarClock className="w-5 h-5 text-muted-foreground/50 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">No bills or loan payments due in the next 30 days</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingPayments.map(p => (
                    <button key={p.id} onClick={() => navigateTo(p.page)} className="w-full glass-card rounded-xl p-3 flex items-center justify-between text-left">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{p.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">Due {p.dueDate} · {p.kind === 'bill' ? 'Bill' : 'Loan'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-foreground">{settings.currencySymbol}{p.amount.toLocaleString()}</p>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI insights */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">{t('aiInsights')}</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigateTo('insights')} className="text-xs text-primary font-medium">
                    View all
                  </button>
                  <button
                    onClick={() => setShowPremium(true)}
                    className="text-xs text-primary font-medium flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" /> {t('premium')}
                  </button>
                </div>
              </div>
              <AIInsights />
            </div>

            {/* Top rule-based insights teaser */}
            {topInsights.length > 0 && (
              <button onClick={() => navigateTo('insights')} className="w-full glass-card rounded-xl p-4 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Smart insight · {dateRange.label}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{topInsights[0].title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{topInsights[0].explanation}</p>
              </button>
            )}

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
            <DateRangeFilter />
            <TransactionList onEdit={handleEdit} dateFiltered />
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

        {page === 'more' && <MoreMenu onNavigate={navigateTo} onOpenPremium={() => setShowPremium(true)} />}
        {page === 'loans' && <LoansPage />}
        {page === 'bills' && <BillsPage />}
        {page === 'savings' && <SavingsPage />}
        {page === 'accounts' && <AccountsPage />}
        {page === 'reports' && <ReportsPage />}
        {page === 'insights' && <InsightsPage onNavigate={navigateTo} />}

        {page === 'settings' && (
          <>
            <h2 className="text-lg font-bold text-foreground">{t('settings')}</h2>
            <SettingsPage />
          </>
        )}
      </main>

      <AddTransactionSheet open={showAdd} onClose={handleCloseAdd} editTransaction={editTransaction} />
      <PremiumScreen open={showPremium} onClose={() => setShowPremium(false)} />
      <NotificationsSheet open={showNotifications} onClose={() => setShowNotifications(false)} onNavigate={navigateTo} />
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
