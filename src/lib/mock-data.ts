import { Transaction, Budget, Account, Category } from './types';

export const categories: Category[] = [
  // Expense categories
  { id: '1', name: 'Food & Dining', icon: '🍔', color: 'hsl(25, 95%, 53%)', type: 'expense' },
  { id: '2', name: 'Transport', icon: '🚗', color: 'hsl(210, 79%, 46%)', type: 'expense' },
  { id: '3', name: 'Shopping', icon: '🛍️', color: 'hsl(280, 65%, 55%)', type: 'expense' },
  { id: '4', name: 'Bills & Utilities', icon: '💡', color: 'hsl(38, 92%, 50%)', type: 'expense' },
  { id: '5', name: 'Entertainment', icon: '🎬', color: 'hsl(340, 75%, 55%)', type: 'expense' },
  { id: '6', name: 'Health', icon: '💊', color: 'hsl(0, 72%, 51%)', type: 'expense' },
  { id: '7', name: 'Education', icon: '📚', color: 'hsl(200, 70%, 50%)', type: 'expense' },
  { id: '8', name: 'Groceries', icon: '🛒', color: 'hsl(120, 50%, 45%)', type: 'expense' },
  { id: '13', name: 'Rent', icon: '🏠', color: 'hsl(30, 60%, 50%)', type: 'expense' },
  { id: '14', name: 'Insurance', icon: '🛡️', color: 'hsl(190, 55%, 45%)', type: 'expense' },
  { id: '15', name: 'Subscriptions', icon: '📺', color: 'hsl(260, 60%, 55%)', type: 'expense' },
  { id: '16', name: 'Travel', icon: '✈️', color: 'hsl(175, 65%, 45%)', type: 'expense' },
  { id: '17', name: 'Personal Care', icon: '💇', color: 'hsl(310, 50%, 55%)', type: 'expense' },
  { id: '18', name: 'Pets', icon: '🐾', color: 'hsl(35, 70%, 50%)', type: 'expense' },
  { id: '19', name: 'Gifts', icon: '🎁', color: 'hsl(350, 65%, 55%)', type: 'expense' },
  { id: '20', name: 'Other', icon: '📝', color: 'hsl(220, 15%, 50%)', type: 'expense' },

  // Income categories
  { id: '9', name: 'Salary', icon: '💰', color: 'hsl(155, 72%, 45%)', type: 'income' },
  { id: '10', name: 'Freelance', icon: '💻', color: 'hsl(231, 75%, 55%)', type: 'income' },
  { id: '11', name: 'Investment', icon: '📈', color: 'hsl(170, 65%, 50%)', type: 'income' },
  { id: '12', name: 'Gift', icon: '🎁', color: 'hsl(320, 70%, 55%)', type: 'income' },
  { id: '21', name: 'Business', icon: '🏢', color: 'hsl(200, 60%, 50%)', type: 'income' },
  { id: '22', name: 'Rental Income', icon: '🏠', color: 'hsl(30, 55%, 50%)', type: 'income' },
  { id: '23', name: 'Side Hustle', icon: '⚡', color: 'hsl(45, 90%, 50%)', type: 'income' },
  { id: '24', name: 'Refund', icon: '💸', color: 'hsl(140, 50%, 45%)', type: 'income' },
  { id: '25', name: 'Bonus', icon: '🏆', color: 'hsl(50, 80%, 50%)', type: 'income' },
  { id: '26', name: 'Other', icon: '📝', color: 'hsl(220, 15%, 50%)', type: 'income' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', amount: 42.50, type: 'expense', category: 'Food & Dining', categoryIcon: '🍔', description: 'Lunch with team', date: '2026-03-24', account: 'Credit Card' },
  { id: '2', amount: 3500, type: 'income', category: 'Salary', categoryIcon: '💰', description: 'March salary', date: '2026-03-23', account: 'Bank Account' },
  { id: '3', amount: 15.00, type: 'expense', category: 'Transport', categoryIcon: '🚗', description: 'Uber ride', date: '2026-03-23', account: 'Cash' },
  { id: '4', amount: 89.99, type: 'expense', category: 'Shopping', categoryIcon: '🛍️', description: 'New headphones', date: '2026-03-22', account: 'Credit Card' },
  { id: '5', amount: 120.00, type: 'expense', category: 'Bills & Utilities', categoryIcon: '💡', description: 'Electricity bill', date: '2026-03-21', account: 'Bank Account' },
  { id: '6', amount: 500, type: 'income', category: 'Freelance', categoryIcon: '💻', description: 'Website project', date: '2026-03-20', account: 'Bank Account' },
  { id: '7', amount: 35.00, type: 'expense', category: 'Entertainment', categoryIcon: '🎬', description: 'Movie tickets', date: '2026-03-20', account: 'Cash' },
  { id: '8', amount: 65.00, type: 'expense', category: 'Groceries', categoryIcon: '🛒', description: 'Weekly groceries', date: '2026-03-19', account: 'Credit Card' },
  { id: '9', amount: 200, type: 'income', category: 'Investment', categoryIcon: '📈', description: 'Dividend payout', date: '2026-03-18', account: 'Bank Account' },
  { id: '10', amount: 25.00, type: 'expense', category: 'Health', categoryIcon: '💊', description: 'Medicine', date: '2026-03-18', account: 'Cash' },
];

export const mockBudgets: Budget[] = [
  { id: '1', category: 'Food & Dining', categoryIcon: '🍔', limit: 500, spent: 320, period: 'monthly' },
  { id: '2', category: 'Transport', categoryIcon: '🚗', limit: 200, spent: 145, period: 'monthly' },
  { id: '3', category: 'Shopping', categoryIcon: '🛍️', limit: 300, spent: 289, period: 'monthly' },
  { id: '4', category: 'Entertainment', categoryIcon: '🎬', limit: 150, spent: 85, period: 'monthly' },
  { id: '5', category: 'Bills & Utilities', categoryIcon: '💡', limit: 400, spent: 380, period: 'monthly' },
];

export const mockAccounts: Account[] = [
  { id: '1', name: 'Bank Account', type: 'bank', balance: 12450.00, icon: '🏦' },
  { id: '2', name: 'Cash', type: 'cash', balance: 340.00, icon: '💵' },
  { id: '3', name: 'Credit Card', type: 'credit', balance: -890.00, icon: '💳' },
  { id: '4', name: 'Digital Wallet', type: 'wallet', balance: 1200.00, icon: '📱' },
];

export const monthlySpending = [
  { month: 'Oct', income: 4200, expense: 2800 },
  { month: 'Nov', income: 3800, expense: 3100 },
  { month: 'Dec', income: 5200, expense: 4100 },
  { month: 'Jan', income: 4000, expense: 2900 },
  { month: 'Feb', income: 4500, expense: 3200 },
  { month: 'Mar', income: 4200, expense: 2600 },
];

export const categorySpending = [
  { name: 'Food', value: 320, fill: 'hsl(25, 95%, 53%)' },
  { name: 'Transport', value: 145, fill: 'hsl(210, 79%, 46%)' },
  { name: 'Shopping', value: 289, fill: 'hsl(280, 65%, 55%)' },
  { name: 'Bills', value: 380, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Entertainment', value: 85, fill: 'hsl(340, 75%, 55%)' },
  { name: 'Health', value: 25, fill: 'hsl(0, 72%, 51%)' },
];
