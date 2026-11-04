import { Account, Loan, Transfer, Transaction, Bill } from './types';
import { toISO, addDays } from './dateRange';

/**
 * Account balances are always DERIVED from the ledger — never mutated in place.
 * Loan money and transfers move cash between buckets without ever being counted
 * as income or expense, so no double-counting can occur.
 */
export const getAccountBalance = (
  account: Account,
  ledger: {
    transactions: Transaction[];
    transfers: Transfer[];
    loans: Loan[];
  }
): number => {
  let bal = account.balance;

  for (const t of ledger.transactions) {
    if (t.account !== account.name) continue;
    bal += t.type === 'income' ? t.amount : -t.amount;
  }

  for (const tr of ledger.transfers) {
    if (tr.fromAccountId === account.id) bal -= tr.amount;
    if (tr.toAccountId === account.id) bal += tr.amount;
  }

  for (const loan of ledger.loans) {
    const paid = loan.payments.reduce((s, p) => s + p.amount, 0);

    if (loan.direction === 'borrowed') {
      // loan received: cash in at disbursement; repayment: cash out
      if (loan.accountId === account.id) bal += loan.principal;
      for (const p of loan.payments) if (p.accountId === account.id) bal -= p.amount;
    } else {
      // money lent: cash out at disbursement; repayment received: cash in
      if (loan.accountId === account.id) bal -= loan.principal;
      for (const p of loan.payments) if (p.accountId === account.id) bal += p.amount;
    }
    void paid;
  }

  return bal;
};

/** Remaining balance on a loan: outstanding principal + accrued simple interest − repayments. */
export const loanRemaining = (loan: Loan, now: Date = new Date()): number => {
  const paid = loan.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(loan.principal - paid, 0);

  const [sy, sm, sd] = loan.startDate.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const elapsedDays = Math.max(0, Math.round((now.getTime() - start.getTime()) / 86400000));
  const interest = outstanding * (loan.interestRate / 100) * (elapsedDays / 365);

  return Math.round((outstanding + interest) * 100) / 100;
};

export const loanTotalPaid = (loan: Loan): number => loan.payments.reduce((s, p) => s + p.amount, 0);

export const totalOutstandingLoans = (loans: Loan[], now: Date = new Date()): number =>
  loans
    .filter(l => !l.settledAt)
    .reduce((s, l) => s + loanRemaining(l, now), 0);

/** Next due date for a bill, based on its anchor date and frequency. */
export const billNextDue = (bill: Bill, now: Date = new Date()): string => {
  const today = toISO(now);
  let next = bill.anchorDate;
  let guard = 0;
  while (next < today && guard < 500) {
    if (bill.frequency === 'weekly') next = addDays(next, 7);
    else if (bill.frequency === 'yearly') {
      const [y, m, d] = next.split('-').map(Number);
      const dt = new Date(y + 1, m - 1, 1);
      const lastDay = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
      next = toISO(new Date(y + 1, m - 1, Math.min(d, lastDay)));
    } else {
      const [y, m, d] = next.split('-').map(Number);
      const dt = new Date(y, m, 1);
      const lastDay = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
      next = toISO(new Date(y, m, Math.min(d, lastDay)));
    }
    guard++;
  }
  return next;
};

/** Monthly-equivalent cost of a bill (for subscription totals). */
export const billMonthlyCost = (bill: Bill): number => {
  if (bill.frequency === 'weekly') return bill.amount * (52 / 12);
  if (bill.frequency === 'yearly') return bill.amount / 12;
  return bill.amount;
};
