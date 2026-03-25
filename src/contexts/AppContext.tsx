import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Budget, Account, Goal, Notification, AppSettings } from '@/lib/types';
import { mockTransactions, mockBudgets, mockAccounts } from '@/lib/mock-data';
import { translations, TranslationKey } from '@/lib/translations';

type AppContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  goals: Goal[];
  notifications: Notification[];
  settings: AppSettings;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addSavingsToGoal: (goalId: string, amount: number) => void;
  addNotification: (n: Omit<Notification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  t: (key: TranslationKey) => string;
  cs: string; // currency symbol
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
  darkMode: true,
  notificationsEnabled: true,
  budgetAlerts: true,
  billReminders: true,
  goalReminders: true,
  profileName: 'SpendWise User',
  profileEmail: 'user@example.com',
};

const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const defaultNotifications: Notification[] = [
  { id: '1', type: 'budget_alert', title: 'Budget Warning', message: 'Bills & Utilities budget is at 95%!', date: '2026-03-25', read: false },
  { id: '2', type: 'bill_reminder', title: 'Bill Due', message: 'Electricity bill due in 3 days', date: '2026-03-24', read: false },
  { id: '3', type: 'goal_reminder', title: 'Goal Update', message: 'You\'re 60% towards your Emergency Fund goal!', date: '2026-03-23', read: true },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadState('sw_transactions', mockTransactions));
  const [budgets, setBudgets] = useState<Budget[]>(() => loadState('sw_budgets', mockBudgets));
  const [accounts] = useState<Account[]>(mockAccounts);
  const [goals, setGoals] = useState<Goal[]>(() => loadState('sw_goals', [
    { id: '1', name: 'Emergency Fund', targetAmount: 5000, savedAmount: 3000, deadline: '2026-12-31', icon: '🛡️', color: 'hsl(155, 72%, 45%)' },
    { id: '2', name: 'Vacation Trip', targetAmount: 2000, savedAmount: 750, deadline: '2026-08-15', icon: '✈️', color: 'hsl(231, 75%, 55%)' },
    { id: '3', name: 'New Laptop', targetAmount: 1500, savedAmount: 400, deadline: '2026-06-30', icon: '💻', color: 'hsl(280, 65%, 55%)' },
  ]));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('sw_notifications', defaultNotifications));
  const [settings, setSettings] = useState<AppSettings>(() => loadState('sw_settings', defaultSettings));

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('sw_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('sw_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('sw_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('sw_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('sw_settings', JSON.stringify(settings)); }, [settings]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

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
          });
        }
      }
    });
  }, [budgets, settings.budgetAlerts]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Date.now().toString() };
    setTransactions(prev => [newT, ...prev]);
    // Update budget spent
    if (t.type === 'expense') {
      setBudgets(prev => prev.map(b =>
        b.category === t.category ? { ...b, spent: b.spent + t.amount } : b
      ));
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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

  const addGoal = (g: Omit<Goal, 'id'>) => {
    setGoals(prev => [...prev, { ...g, id: Date.now().toString() }]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addSavingsToGoal = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) } : g
    ));
  };

  const addNotification = (n: Omit<Notification, 'id'>) => {
    setNotifications(prev => [{ ...n, id: Date.now().toString() }, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const t = (key: TranslationKey) => translations[settings.language][key] || translations.en[key];
  const cs = settings.currencySymbol;

  return (
    <AppContext.Provider value={{
      transactions, budgets, accounts, goals, notifications, settings,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal, addSavingsToGoal,
      addNotification, markNotificationRead, clearNotifications,
      updateSettings,
      totalBalance, totalIncome, totalExpense, t, cs,
    }}>
      {children}
    </AppContext.Provider>
  );
};
