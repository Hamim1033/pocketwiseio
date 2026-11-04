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

export type AccountKind = 'cash' | 'bank' | 'wallet' | 'credit' | 'bkash' | 'nagad' | 'rocket' | 'custom';

export type Account = {
  id: string;
  name: string;
  type: AccountKind;
  balance: number; // starting/base balance — current balance is derived (see lib/finance.ts)
  icon: string;
};

export type Transfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note?: string;
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

export type GoalContribution = {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note?: string;
};

export type LoanDirection = 'borrowed' | 'lent'; // borrowed = money I owe; lent = money owed to me

export type LoanPayment = {
  id: string;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
};

export type Loan = {
  id: string;
  direction: LoanDirection;
  person: string;
  label: string;
  principal: number;
  interestRate: number; // simple annual %, 0 = interest free
  installmentAmount?: number;
  startDate: string;
  dueDate: string;
  payments: LoanPayment[];
  notes?: string;
  settledAt?: string;
  accountId?: string; // account used for disbursement / repayments
};

export type BillFrequency = 'weekly' | 'monthly' | 'yearly';

export type Bill = {
  id: string;
  name: string;
  icon: string;
  amount: number;
  frequency: BillFrequency;
  anchorDate: string; // first due date (YYYY-MM-DD)
  category: string;
  categoryIcon: string;
  account: string;
  remindDaysBefore: number;
  active: boolean;
  lastPaidDate?: string;
};

export type NotificationCategory =
  | 'ai_insight' | 'expense' | 'income' | 'loan' | 'budget' | 'savings' | 'security' | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type Notification = {
  id: string;
  type: 'expense_reminder' | 'bill_reminder' | 'budget_alert' | 'goal_reminder' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  link?: string; // page to navigate to when tapped
  dedupeKey?: string; // prevents duplicate notifications for the same event
};

export type DatePreset =
  | 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month'
  | 'last_3_months' | 'last_6_months' | 'this_year' | 'last_year' | 'all' | 'custom';

export type DateRange = {
  preset: DatePreset;
  start: string; // YYYY-MM-DD inclusive
  end: string; // YYYY-MM-DD inclusive
  prevStart: string; // equivalent previous period
  prevEnd: string;
  label: string;
};

export type InsightCategory = 'ai_insight' | 'expense' | 'income' | 'loan' | 'budget' | 'savings' | 'system';

export type Insight = {
  id: string;
  category: InsightCategory;
  priority: NotificationPriority;
  title: string;
  explanation: string;
  supportingData: string[];
  actionLabel?: string;
  actionPage?: string;
  dateRange: string;
  source: 'rules' | 'ai';
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
