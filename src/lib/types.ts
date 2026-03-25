export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryIcon: string;
  description: string;
  date: string;
  account: string;
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
};

export type Budget = {
  id: string;
  category: string;
  categoryIcon: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
};

export type Account = {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'wallet' | 'credit';
  balance: number;
  icon: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  icon: string;
  color: string;
};

export type Notification = {
  id: string;
  type: 'expense_reminder' | 'bill_reminder' | 'budget_alert' | 'goal_reminder' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
};

export type AppSettings = {
  currency: string;
  currencySymbol: string;
  language: 'en' | 'bn';
  darkMode: boolean;
  notificationsEnabled: boolean;
  budgetAlerts: boolean;
  billReminders: boolean;
  goalReminders: boolean;
  profileName: string;
  profileEmail: string;
};
