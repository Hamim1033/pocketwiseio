import { Bill, Budget, Goal, Insight, Loan, Transaction } from './types';
import { loanRemaining, billNextDue, billMonthlyCost } from './finance';
import { inRange, formatDateShort, daysBetween, todayISO } from './dateRange';

export type InsightInput = {
  transactions: Transaction[];
  budgets: Budget[];
  loans: Loan[];
  bills: Bill[];
  goals: Goal[];
  range: { start: string; end: string; prevStart: string; prevEnd: string; label: string };
  cs: string;
  now?: Date;
};

const money = (cs: string, n: number) => `${cs}${Math.round(n).toLocaleString()}`;

const sum = (list: number[]) => list.reduce((s, n) => s + n, 0);

const categorySpend = (txs: Transaction[], start: string, end: string): Map<string, number> => {
  const map = new Map<string, number>();
  txs
    .filter(t => t.type === 'expense' && inRange(t.date, start, end))
    .forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
  return map;
};

/**
 * Deterministic, rule-based insight engine. Every insight is computed strictly
 * from the user's real records — nothing is invented.
 */
export const generateInsights = (input: InsightInput): Insight[] => {
  const { transactions, budgets, loans, bills, goals, range, cs } = input;
  const now = input.now || new Date();
  const today = todayISO();
  const insights: Insight[] = [];
  const periodLabel = range.label;

  const inPeriod = transactions.filter(t => inRange(t.date, range.start, range.end));
  const income = sum(inPeriod.filter(t => t.type === 'income').map(t => t.amount));
  const expense = sum(inPeriod.filter(t => t.type === 'expense').map(t => t.amount));
  const net = income - expense;

  const cur = categorySpend(transactions, range.start, range.end);
  const prev = categorySpend(transactions, range.prevStart, range.prevEnd);

  // 1. Net cash flow summary
  if (income > 0 || expense > 0) {
    insights.push({
      id: `summary_${range.start}_${range.end}`,
      category: 'income',
      priority: net < 0 ? 'medium' : 'low',
      title: net < 0 ? `Spending exceeded income` : `Positive cash flow`,
      explanation:
        net < 0
          ? `In ${periodLabel} you spent ${money(cs, expense)} but earned ${money(cs, income)} — a shortfall of ${money(cs, Math.abs(net))}. Consider trimming your largest category or adding income.`
          : `In ${periodLabel} you kept ${money(cs, net)} (${income > 0 ? Math.round((net / income) * 100) : 0}% of income). Consider moving part of it into a savings goal.`,
      supportingData: [`Income: ${money(cs, income)}`, `Expenses: ${money(cs, expense)}`, `Net cash flow: ${money(cs, net)}`],
      actionLabel: net < 0 ? 'View Reports' : 'Add to Savings',
      actionPage: net < 0 ? 'reports' : 'savings',
      dateRange: periodLabel,
      source: 'rules',
    });
  }

  // 2. Budget warnings
  budgets.forEach(b => {
    if (b.limit <= 0) return;
    const pct = (b.spent / b.limit) * 100;
    if (pct >= 100) {
      insights.push({
        id: `budget_over_${b.id}`,
        category: 'budget',
        priority: 'high',
        title: `${b.category} budget exceeded`,
        explanation: `You have spent ${money(cs, b.spent)} of your ${money(cs, b.limit)} ${b.category} budget (${Math.round(pct)}%). New spending in this category will go over budget.`,
        supportingData: [`Spent: ${money(cs, b.spent)}`, `Limit: ${money(cs, b.limit)}`, `Over by: ${money(cs, Math.max(b.spent - b.limit, 0))}`],
        actionLabel: 'Review Budget',
        actionPage: 'budget',
        dateRange: 'This month',
        source: 'rules',
      });
    } else if (pct >= 80) {
      insights.push({
        id: `budget_near_${b.id}`,
        category: 'budget',
        priority: 'medium',
        title: `${b.category} budget almost used`,
        explanation: `${Math.round(pct)}% of your ${b.category} budget is used. ${money(cs, b.limit - b.spent)} remains for the rest of the month.`,
        supportingData: [`Spent: ${money(cs, b.spent)}`, `Remaining: ${money(cs, Math.max(b.limit - b.spent, 0))}`],
        actionLabel: 'Review Budget',
        actionPage: 'budget',
        dateRange: 'This month',
        source: 'rules',
      });
    }
  });

  // 3. Rising category vs previous equivalent period
  cur.forEach((amount, category) => {
    const prevAmount = prev.get(category) || 0;
    if (prevAmount > 0 && amount > prevAmount) {
      const changePct = Math.round(((amount - prevAmount) / prevAmount) * 100);
      if (changePct >= 25 && amount - prevAmount >= 50) {
        insights.push({
          id: `rising_${category}_${range.start}_${range.end}`,
          category: 'expense',
          priority: changePct >= 60 ? 'high' : 'medium',
          title: `${category} spending up ${changePct}%`,
          explanation: `${category} rose from ${money(cs, prevAmount)} to ${money(cs, amount)} versus the previous equivalent period (${formatDateShort(range.prevStart)} – ${formatDateShort(range.prevEnd)}). Watch this category to protect your budget.`,
          supportingData: [`Current: ${money(cs, amount)}`, `Previous: ${money(cs, prevAmount)}`, `Change: +${changePct}%`],
          actionLabel: 'View Transactions',
          actionPage: 'transactions',
          dateRange: periodLabel,
          source: 'rules',
        });
      }
    }
  });

  // 4. Savings opportunity on the largest category
  const topCat = Array.from(cur.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topCat && income > 0 && topCat[1] >= income * 0.15 && topCat[1] >= 100) {
    const saving = topCat[1] * 0.1;
    insights.push({
      id: `save_${topCat[0]}_${range.start}_${range.end}`,
      category: 'savings',
      priority: 'medium',
      title: `Save ${money(cs, saving)} on ${topCat[0]}`,
      explanation: `${topCat[0]} is your biggest category this period at ${money(cs, topCat[1])} (${Math.round((topCat[1] / income) * 100)}% of income). Cutting it by just 10% frees up ${money(cs, saving)} — enough to fund a savings goal.`,
      supportingData: [`${topCat[0]}: ${money(cs, topCat[1])}`, `10% saving: ${money(cs, saving)}`],
      actionLabel: 'Set a Goal',
      actionPage: 'goals',
      dateRange: periodLabel,
      source: 'rules',
    });
  }

  // 5. Upcoming loan payments (next 7 days)
  loans
    .filter(l => !l.settledAt)
    .forEach(loan => {
      const daysLeft = daysBetween(today, loan.dueDate);
      const remaining = loanRemaining(loan, now);
      if (daysLeft >= 0 && daysLeft <= 7 && remaining > 0) {
        insights.push({
          id: `loan_due_${loan.id}_${loan.dueDate}`,
          category: 'loan',
          priority: 'high',
          title: `${loan.direction === 'borrowed' ? 'Repayment' : 'Collection'} due in ${daysLeft === 0 ? 'today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`}`,
          explanation: `${loan.label || 'Loan'} with ${loan.person} has ${money(cs, remaining)} outstanding and is due on ${formatDateShort(loan.dueDate)}. ${loan.direction === 'borrowed' ? 'Plan cash for the repayment.' : 'Follow up to collect the payment.'}`,
          supportingData: [`Outstanding: ${money(cs, remaining)}`, `Due: ${loan.dueDate}`, `Person: ${loan.person}`],
          actionLabel: 'Open Loans',
          actionPage: 'loans',
          dateRange: `Due ${loan.dueDate}`,
          source: 'rules',
        });
      }
    });

  // 6. Upcoming bills (next 7 days)
  bills
    .filter(b => b.active)
    .forEach(bill => {
      const next = billNextDue(bill, now);
      const daysLeft = daysBetween(today, next);
      if (daysLeft >= 0 && daysLeft <= 7) {
        insights.push({
          id: `bill_due_${bill.id}_${next}`,
          category: 'expense',
          priority: daysLeft <= 2 ? 'high' : 'medium',
          title: `${bill.name} due ${daysLeft === 0 ? 'today' : `in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}`,
          explanation: `${bill.name} (${money(cs, bill.amount)}, ${bill.frequency}) is due on ${formatDateShort(next)}. Keep the amount ready in ${bill.account}.`,
          supportingData: [`Amount: ${money(cs, bill.amount)}`, `Due: ${next}`, `Account: ${bill.account}`],
          actionLabel: 'Open Bills',
          actionPage: 'bills',
          dateRange: `Due ${next}`,
          source: 'rules',
        });
      }
    });

  // 7. Subscriptions total
  const activeBills = bills.filter(b => b.active);
  if (activeBills.length > 0) {
    const monthly = sum(activeBills.map(billMonthlyCost));
    if (monthly >= 100) {
      insights.push({
        id: `subs_total_${activeBills.length}`,
        category: 'system',
        priority: 'low',
        title: `${money(cs, monthly)}/mo on bills & subscriptions`,
        explanation: `You have ${activeBills.length} recurring bills costing about ${money(cs, monthly)} every month (${money(cs, monthly * 12)} per year). Cancelling one you rarely use is the fastest saving.`,
        supportingData: activeBills.slice(0, 4).map(b => `${b.name}: ${money(cs, billMonthlyCost(b))}/mo`),
        actionLabel: 'Manage Bills',
        actionPage: 'bills',
        dateRange: 'Recurring',
        source: 'rules',
      });
    }
  }

  // 8. Goals behind pace
  goals.forEach(g => {
    if (g.targetAmount <= 0 || g.savedAmount >= g.targetAmount) return;
    const totalDays = daysBetween(today, g.deadline);
    const daysGone = daysBetween(g.deadline, today) === 0 && totalDays === 0 ? 0 : Math.max(0, daysBetween(g.startDateFallback || '', '') || 0);
    void daysGone;
    // pace measured against "today → deadline": required saving per remaining day
    const remainingDays = Math.max(totalDays, 1);
    const remainingAmount = g.targetAmount - g.savedAmount;
    const perDay = remainingAmount / remainingDays;
    if (perDay > 0) {
      const expectedPct = 100 - (remainingDays / (remainingDays + (totalDays >= 0 ? 30 : 30))) * 100;
      void expectedPct;
      if (totalDays < 30 && remainingAmount > 0) {
        insights.push({
          id: `goal_pace_${g.id}`,
          category: 'savings',
          priority: 'medium',
          title: `"${g.name}" needs ${money(cs, perDay)}/day`,
          explanation: `${remainingDays} days remain to reach ${money(cs, g.targetAmount)} for "${g.name}". You have ${money(cs, remainingAmount)} left to save — that's ${money(cs, perDay)} per day.`,
          supportingData: [`Saved: ${money(cs, g.savedAmount)} / ${money(cs, g.targetAmount)}`, `Days left: ${remainingDays}`],
          actionLabel: 'Add Savings',
          actionPage: 'savings',
          dateRange: `Deadline ${g.deadline}`,
          source: 'rules',
        });
      }
    }
  });

  // 9. Missing records: expenses but no income recorded
  if (expense > 0 && income === 0) {
    insights.push({
      id: `missing_income_${range.start}_${range.end}`,
      category: 'income',
      priority: 'medium',
      title: 'No income recorded this period',
      explanation: `You logged ${money(cs, expense)} of expenses in ${periodLabel} but no income. If you were paid during this period, add it so your cash flow and balance stay accurate.`,
      supportingData: [`Expenses: ${money(cs, expense)}`, `Income recorded: ${money(cs, 0)}`],
      actionLabel: 'Add Income',
      actionPage: 'transactions',
      dateRange: periodLabel,
      source: 'rules',
    });
  }

  const priorityRank = { high: 0, medium: 1, low: 2 } as const;
  return insights.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
};
