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
