import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Transaction, Budget, Account, Goal, Notification, AppSettings, Transfer, Loan, LoanPayment, Bill, GoalContribution, DatePreset, DateRange, Insight } from '@/lib/types';
import { translations, TranslationKey } from '@/lib/translations';
import { getDateRange } from '@/lib/dateRange';
import { getAccountBalance, loanRemaining, totalOutstandingLoans, billNextDue, daysBetweenBillSafe } from '@/lib/financeHelpers';
import { todayISO, daysBetween } from '@/lib/dateRange';

type AppContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  transfers: Transfer[];
  loans: Loan[];
  bills: Bill[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  notifications: Notification[];
  settings: AppSettings;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addAccount: (a: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, a: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (fromId: string, toId: string, amount: number, date: string, note?: string) => void;
  addLoan: (l: Omit<Loan, 'id' | 'payments' | 'settledAt'>) => void;
  updateLoan: (id: string, l: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addLoanPayment: (loanId: string, p: Omit<LoanPayment, 'id'>) => void;
  addBill: (b: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, b: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  payBill: (billId: string, date?: string) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addSavingsToGoal: (goalId: string, amount: number) => void;
  addGoalContribution: (goalId: string, amount: number, date: string, note?: string) => void;
  addNotification: (n: Omit<Notification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  pushInsightNotifications: (insights: Insight[]) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  // Date range filtering
  dateRange: DateRange;
  setDatePreset: (p: DatePreset) => void;
  setCustomDateRange: (start: string, end: string) => void;
  filteredTransactions: Transaction[];
  // Derived finance figures
  accountBalances: Record<string, number>;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  rangeIncome: number;
  rangeExpense: number;
  rangeNet: number;
  totalSavings: number;
  outstandingLoans: number;
  upcomingPayments: { id: string; name: string; icon: string; amount: number; dueDate: string; kind: 'bill' | 'loan'; page: string }[];
  dismissedInsights: string[];
  dismissInsight: (id: string) => void;
  t: (key: TranslationKey) => string;
  cs: string;
  isLocked: boolean;
  unlock: (pin: string) => boolean;
  setPin: (pin: string) => void;
  removePin: () => void;
  hasPin: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
};

const defaultSettings: AppSettings = {
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  darkMode: false,
  notificationsEnabled: true,
  budgetAlerts: true,
  billReminders: true,
  goalReminders: true,
  profileName: 'User',
  profileEmail: '',
};

const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const defaultAccounts: Account[] = [
  { id: '1', name: 'Cash', type: 'cash', balance: 0, icon: '💵' },
  { id: '2', name: 'Bank Account', type: 'bank', balance: 0, icon: '🏦' },
  { id: '3', name: 'Credit Card', type: 'credit', balance: 0, icon: '💳' },
  { id: '4', name: 'Digital Wallet', type: 'wallet', balance: 0, icon: '📱' },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadState('sw_transactions', []));
  const [budgets, setBudgets] = useState<Budget[]>(() => loadState('sw_budgets', []));
  const [accounts, setAccounts] = useState<Account[]>(() => loadState('sw_accounts', defaultAccounts));
  const [transfers, setTransfers] = useState<Transfer[]>(() => loadState('sw_transfers', []));
  const [loans, setLoans] = useState<Loan[]>(() => loadState('sw_loans', []));
  const [bills, setBills] = useState<Bill[]>(() => loadState('sw_bills', []));
  const [goals, setGoals] = useState<Goal[]>(() => loadState('sw_goals', []));
  const [goalContributions, setGoalContributions] = useState<GoalContribution[]>(() => loadState('sw_goal_contributions', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('sw_notifications', []));
  const [settings, setSettings] = useState<AppSettings>(() => loadState('sw_settings', defaultSettings));
  const [dismissedInsights, setDismissedInsights] = useState<string[]>(() => loadState('sw_dismissed_insights', []));

  // Global date-range filter (default: This Month)
  const [datePreset, setPresetState] = useState<DatePreset>(() => loadState('sw_date_preset', 'this_month' as DatePreset));
  const [customRange, setCustomRangeState] = useState<{ start: string; end: string }>(() => loadState('sw_date_custom', { start: '', end: '' }));

  // PIN lock
  const [storedPin, setStoredPin] = useState<string | null>(() => localStorage.getItem('sw_pin'));
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem('sw_pin'));

  const hasPin = !!storedPin;

  const unlock = (pin: string): boolean => {
    if (pin === storedPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setPin = (pin: string) => {
    localStorage.setItem('sw_pin', pin);
    setStoredPin(pin);
  };

  const removePin = () => {
    localStorage.removeItem('sw_pin');
    setStoredPin(null);
    setIsLocked(false);
  };

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('sw_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('sw_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('sw_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('sw_transfers', JSON.stringify(transfers)); }, [transfers]);
  useEffect(() => { localStorage.setItem('sw_loans', JSON.stringify(loans)); }, [loans]);
  useEffect(() => { localStorage.setItem('sw_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('sw_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('sw_goal_contributions', JSON.stringify(goalContributions)); }, [goalContributions]);
  useEffect(() => { localStorage.setItem('sw_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('sw_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('sw_dismissed_insights', JSON.stringify(dismissedInsights)); }, [dismissedInsights]);
  useEffect(() => { localStorage.setItem('sw_date_preset', JSON.stringify(datePreset)); }, [datePreset]);
  useEffect(() => { localStorage.setItem('sw_date_custom', JSON.stringify(customRange)); }, [customRange]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // ============= Date range =============
  const dateRange = useMemo(
    () => getDateRange(datePreset, customRange.start || undefined, customRange.end || undefined),
    [datePreset, customRange]
  );

  const setDatePreset = (p: DatePreset) => setPresetState(p);
  const setCustomDateRange = (start: string, end: string) => {
    setCustomRangeState({ start, end });
    setPresetState('custom');
  };

  const filteredTransactions = useMemo(
    () => transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end),
    [transactions, dateRange]
  );

  // ============= Derived finance =============
  const accountBalances = useMemo(() => {
    const map: Record<string, number> = {};
    const ledger = { transactions, transfers, loans };
    accounts.forEach(a => { map[a.id] = getAccountBalance(a, ledger); });
    return map;
  }, [accounts, transactions, transfers, loans]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;
  const totalSavings = goals.reduce((s, g) => s + g.savedAmount, 0);

  const rangeIncome = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [filteredTransactions]);
  const rangeExpense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [filteredTransactions]);
  const rangeNet = rangeIncome - rangeExpense;
  const outstandingLoans = useMemo(() => totalOutstandingLoans(loans), [loans]);

  const upcomingPayments = useMemo(() => {
    const now = new Date();
    const items: AppContextType['upcomingPayments'] = [];
    bills.filter(b => b.active).forEach(b => {
      const due = billNextDue(b, now);
      if (daysBetween(todayISO(), due) <= 30) {
        items.push({ id: `bill_${b.id}`, name: b.name, icon: b.icon, amount: b.amount, dueDate: due, kind: 'bill', page: 'bills' });
      }
    });
    loans.filter(l => !l.settledAt).forEach(l => {
      if (loanRemaining(l, now) > 0 && daysBetween(todayISO(), l.dueDate) <= 30) {
        items.push({ id: `loan_${l.id}`, name: `${l.label || 'Loan'} · ${l.person}`, icon: l.direction === 'borrowed' ? '💸' : '🤝', amount: loanRemaining(l, now), dueDate: l.dueDate, kind: 'loan', page: 'loans' });
      }
    });
    return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
  }, [bills, loans]);

  // Budget alerts
  useEffect(() => {
    if (!settings.budgetAlerts) return;
    budgets.forEach(b => {
      const pct = (b.spent / b.limit) * 100;
      if (pct >= 90) {
        const exists = notifications.some(n => n.type === 'budget_alert' && n.message.includes(b.category) && !n.read);
        if (!exists) {
          addNotification({
            type: 'budget_alert',
            title: 'Budget Warning',
            message: `${b.category} budget is at ${Math.round(pct)}%!`,
            date: new Date().toISOString().split('T')[0],
            read: false,
            category: 'budget',
            priority: pct >= 100 ? 'high' : 'medium',
            link: 'budget',
          });
        }
      }
    });
  }, [budgets, settings.budgetAlerts]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Date.now().toString() + Math.random().toString(36).slice(2, 6) };
    setTransactions(prev => [newT, ...prev]);
    // Save last-used preferences
    localStorage.setItem('sw_last_category_' + t.type, t.category);
    localStorage.setItem('sw_last_account', t.account);
    // Update budget spent
    if (t.type === 'expense') {
      setBudgets(prev => prev.map(b =>
        b.category === t.category ? { ...b, spent: b.spent + t.amount } : b
      ));
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const before = transactions.find(t => t.id === id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (before && before.type === 'expense') {
      const afterType = updates.type || before.type;
      const afterCat = updates.category || before.category;
      const afterAmt = updates.amount !== undefined ? updates.amount : before.amount;
      setBudgets(prev => prev.map(b => {
        if (b.category === before.category && before.category !== afterCat) return { ...b, spent: Math.max(b.spent - before.amount, 0) };
        if (b.category === afterCat) return { ...b, spent: b.spent + (afterAmt - (before.category === afterCat ? before.amount : 0)) };
        return b;
      }));
    }
  };

  const deleteTransaction = (id: string) => {
    const removed = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (removed && removed.type === 'expense') {
      setBudgets(prev => prev.map(b => b.category === removed.category ? { ...b, spent: Math.max(b.spent - removed.amount, 0) } : b));
    }
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    setBudgets(prev => [...prev, { ...b, id: Date.now().toString() }]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // ============= Accounts =============
  const addAccount = (a: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...a, id: 'acc_' + Date.now().toString() + Math.random().toString(36).slice(2, 5) }]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setTransfers(prev => prev.filter(tr => tr.fromAccountId !== id && tr.toAccountId !== id));
  };

  const transferBetweenAccounts = (fromId: string, toId: string, amount: number, date: string, note?: string) => {
    if (fromId === toId || amount <= 0) return;
    setTransfers(prev => [...prev, { id: 'tr_' + Date.now().toString() + Math.random().toString(36).slice(2, 5), fromAccountId: fromId, toAccountId: toId, amount, date, note }]);
  };

  // ============= Loans =============
  const addLoan = (l: Omit<Loan, 'id' | 'payments' | 'settledAt'>) => {
    setLoans(prev => [...prev, { ...l, id: 'loan_' + Date.now().toString() + Math.random().toString(36).slice(2, 5), payments: [] }]);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  const addLoanPayment = (loanId: string, p: Omit<LoanPayment, 'id'>) => {
    setLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;
      const payments = [...l.payments, { ...p, id: 'pay_' + Date.now().toString() + Math.random().toString(36).slice(2, 5) }];
      const remaining = loanRemaining({ ...l, payments });
      return { ...l, payments, settledAt: remaining <= 0.005 ? p.date : l.settledAt };
    }));
  };

  // ============= Bills =============
  const addBill = (b: Omit<Bill, 'id'>) => {
    setBills(prev => [...prev, { ...b, id: 'bill_' + Date.now().toString() + Math.random().toString(36).slice(2, 5) }]);
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  // Paying a bill creates a REAL expense transaction (so it flows into budgets,
  // charts and reports) — it is never double-counted as anything else.
  const payBill = (billId: string, date?: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    const paidDate = date || todayISO();
    addTransaction({
      amount: bill.amount,
      type: 'expense',
      category: bill.category,
      categoryIcon: bill.categoryIcon,
      description: bill.name,
      date: paidDate,
      account: bill.account,
      notes: 'Bill payment',
      isRecurring: true,
      recurringInterval: bill.frequency === 'weekly' ? 'weekly' : bill.frequency === 'yearly' ? 'yearly' : 'monthly',
    });
    updateBill(billId, { lastPaidDate: paidDate });
  };

  // ============= Goals & savings =============
  const addGoal = (g: Omit<Goal, 'id'>) => {
    setGoals(prev => [...prev, { ...g, id: Date.now().toString() }]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setGoalContributions(prev => prev.filter(c => c.goalId !== id));
  };

  const addGoalContribution = (goalId: string, amount: number, date: string, note?: string) => {
    if (amount <= 0) return;
    setGoalContributions(prev => [...prev, { id: 'gc_' + Date.now().toString() + Math.random().toString(36).slice(2, 5), goalId, amount, date, note }]);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) } : g));
  };

  const addSavingsToGoal = (goalId: string, amount: number) => {
    addGoalContribution(goalId, amount, todayISO());
  };

  // ============= Notifications =============
  const addNotification = (n: Omit<Notification, 'id'>) => {
    if (n.dedupeKey) {
      const exists = notifications.some(x => x.dedupeKey === n.dedupeKey);
      if (exists) return;
    }
    setNotifications(prev => [{ ...n, id: Date.now().toString() + Math.random().toString(36).slice(2, 5) }, ...prev]);
  };

  const pushInsightNotifications = (insights: Insight[]) => {
    if (!settings.notificationsEnabled) return;
    const important = insights.filter(i => i.priority === 'high' || i.priority === 'medium');
    if (important.length === 0) return;
    const now = todayISO();
    setNotifications(prev => {
      let next = [...prev];
      important.forEach(i => {
        const key = `insight_${i.id}`;
        if (next.some(n => n.dedupeKey === key)) return;
        const typeMap: Record<string, Notification['type']> = {
          budget: 'budget_alert', loan: 'bill_reminder', savings: 'goal_reminder',
          expense: 'expense_reminder', income: 'general', ai_insight: 'general', system: 'general',
        };
        next = [{
          id: Date.now().toString() + Math.random().toString(36).slice(2, 5),
          type: typeMap[i.category] || 'general',
          title: i.title,
          message: i.explanation,
          date: now,
          read: false,
          category: i.category === 'system' ? 'system' : (i.category === 'ai_insight' ? 'ai_insight' : i.category),
          priority: i.priority,
          link: i.actionPage,
          dedupeKey: key,
        }, ...next];
      });
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const dismissInsight = (id: string) => {
    setDismissedInsights(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const updateSettings = (s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  };

  const t = (key: TranslationKey) => translations[settings.language][key] || translations.en[key];
  const cs = settings.currencySymbol;

  return (
    <AppContext.Provider value={{
      transactions, budgets, accounts, transfers, loans, bills, goals, goalContributions, notifications, settings,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      addAccount, updateAccount, deleteAccount, transferBetweenAccounts,
      addLoan, updateLoan, deleteLoan, addLoanPayment,
      addBill, updateBill, deleteBill, payBill,
      addGoal, updateGoal, deleteGoal, addSavingsToGoal, addGoalContribution,
      addNotification, markNotificationRead, markAllNotificationsRead, deleteNotification, clearNotifications,
      pushInsightNotifications, updateSettings,
      dateRange, setDatePreset, setCustomDateRange, filteredTransactions,
      accountBalances, totalBalance, totalIncome, totalExpense,
      rangeIncome, rangeExpense, rangeNet, totalSavings, outstandingLoans, upcomingPayments,
      dismissedInsights, dismissInsight,
      isLocked, unlock, setPin, removePin, hasPin,
    }}>
      {children}
    </AppContext.Provider>
  );
};
