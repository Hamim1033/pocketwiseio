import { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction, Budget, Account } from '@/lib/types';
import { mockTransactions, mockBudgets, mockAccounts } from '@/lib/mock-data';

type AppContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [budgets] = useState<Budget[]>(mockBudgets);
  const [accounts] = useState<Account[]>(mockAccounts);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...t, id: Date.now().toString() }, ...prev]);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <AppContext.Provider value={{ transactions, budgets, accounts, addTransaction, totalBalance, totalIncome, totalExpense }}>
      {children}
    </AppContext.Provider>
  );
};
