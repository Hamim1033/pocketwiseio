import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, HandCoins, Handshake } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { loanRemaining, loanTotalPaid, totalOutstandingLoans } from '@/lib/finance';
import { Loan, LoanDirection } from '@/lib/types';
import { todayISO } from '@/lib/dateRange';
import { toast } from 'sonner';

const LoansPage = () => {
  const { loans, addLoan, deleteLoan, addLoanPayment, accounts, cs } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState<Loan | null>(null);
  const [showHistory, setShowHistory] = useState<Loan | null>(null);

  // form state
  const [direction, setDirection] = useState<LoanDirection>('borrowed');
  const [person, setPerson] = useState('');
  const [label, setLabel] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState('');

  // payment state
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(todayISO());
  const [payNote, setPayNote] = useState('');

  const borrowed = loans.filter(l => l.direction === 'borrowed' && !l.settledAt);
  const lent = loans.filter(l => l.direction === 'lent' && !l.settledAt);
  const borrowedTotal = totalOutstandingLoans(borrowed);
  const lentTotal = totalOutstandingLoans(lent);

  const resetForm = () => {
    setDirection('borrowed'); setPerson(''); setLabel(''); setPrincipal('');
    setInterestRate('0'); setDueDate(''); setAccountId('');
  };

  const handleAddLoan = () => {
    const amount = parseFloat(principal);
    if (!person.trim()) { toast.error('Enter the person / institution'); return; }
    if (!amount || amount <= 0) { toast.error('Enter a valid principal amount'); return; }
    if (!dueDate) { toast.error('Select a due date'); return; }
    addLoan({
      direction,
      person: person.trim(),
      label: label.trim() || (direction === 'borrowed' ? 'Money borrowed' : 'Money lent'),
      principal: amount,
      interestRate: Math.max(parseFloat(interestRate) || 0, 0),
      startDate: todayISO(),
      dueDate,
      accountId: accountId || undefined,
    });
    toast.success(direction === 'borrowed' ? 'Loan recorded — repayments tracked separately from expenses' : 'Loan recorded — collections tracked separately from income');
    resetForm();
    setShowAdd(false);
  };

  const handlePay = () => {
    if (!showPay) return;
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) { toast.error('Enter a valid payment amount'); return; }
    const remaining = loanRemaining(showPay);
    if (amount > remaining + 0.01) { toast.error(`Payment exceeds remaining ${cs}${remaining.toFixed(2)}`); return; }
    addLoanPayment(showPay.id, { amount, date: payDate || todayISO(), note: payNote.trim() || undefined, accountId: showPay.accountId });
    toast.success('Payment recorded — not counted as income or expense');
    setPayAmount(''); setPayNote(''); setShowPay(null);
  };

  const LoanCard = ({ loan }: { loan: Loan }) => {
    const remaining = loanRemaining(loan);
    const paid = loanTotalPaid(loan);
    const pct = Math.min((paid / loan.principal) * 100, 100);
    const settled = !!loan.settledAt;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${loan.direction === 'borrowed' ? 'bg-expense/10' : 'bg-income/10'}`}>
              {loan.direction === 'borrowed' ? <HandCoins className="w-4 h-4 text-expense" /> : <Handshake className="w-4 h-4 text-income" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{loan.person}</p>
              <p className="text-[11px] text-muted-foreground">{loan.label} · {loan.direction === 'borrowed' ? 'I owe' : 'Owed to me'}{loan.interestRate > 0 ? ` · ${loan.interestRate}%/yr` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setShowHistory(loan); }} className="px-2 py-1 rounded-lg bg-secondary text-[10px] text-muted-foreground">History</button>
            <button onClick={() => { deleteLoan(loan.id); toast.success('Loan deleted'); }} className="w-7 h-7 rounded-lg bg-expense/10 flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5 text-expense" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">
            {settled ? 'Settled ✓' : <>Paid {cs}{paid.toLocaleString()} of {cs}{loan.principal.toLocaleString()}</>}
          </span>
          <span className={`font-semibold ${settled ? 'text-income' : 'text-foreground'}`}>
            {settled ? '' : `${cs}${remaining.toLocaleString()} left`}
          </span>
        </div>
        <Progress value={pct} className={`h-2 ${settled ? '[&>div]:bg-income' : '[&>div]:bg-primary'}`} />
        {!settled && (
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-muted-foreground">Due {loan.dueDate}</span>
            <button
              onClick={() => { setShowPay(loan); setPayAmount(remaining.toFixed(2)); setPayDate(todayISO()); setPayNote(''); }}
              className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold"
            >
              Record Payment
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground mb-1">Outstanding Debt</p>
          <p className="text-lg font-bold text-expense">{cs}{borrowedTotal.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground mb-1">Lent (to collect)</p>
          <p className="text-lg font-bold text-income">{cs}{lentTotal.toLocaleString()}</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground px-1">
        Loan principals and repayments are tracked separately from income and expenses, so your cash flow is never double-counted.
      </p>

      <button onClick={() => setShowAdd(true)} className="w-full rounded-xl h-11 gap-2 border border-border bg-secondary/50 text-sm font-semibold text-foreground flex items-center justify-center">
        <Plus className="w-4 h-4" /> Add Loan / Debt
      </button>

      {(borrowed.length > 0 || lent.length > 0) ? (
        <div className="space-y-3">
          {[...borrowed, ...lent].map(loan => <LoanCard key={loan.id} loan={loan} />)}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-sm font-semibold text-foreground mb-1">No Loans Recorded</p>
          <p className="text-xs text-muted-foreground">Track money borrowed or lent, repayments and due dates here</p>
        </div>
      )}

      {/* Add loan sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Add Loan / Debt</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setDirection('borrowed')} className={`p-3 rounded-xl text-xs font-semibold transition-all ${direction === 'borrowed' ? 'bg-expense text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  💸 I Borrowed
                </button>
                <button onClick={() => setDirection('lent')} className={`p-3 rounded-xl text-xs font-semibold transition-all ${direction === 'lent' ? 'bg-income text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  🤝 I Lent Money
                </button>
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Lender / Borrower</label>
              <Input value={person} onChange={e => setPerson(e.target.value)} placeholder="e.g. Rahman uncle, City Bank" className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Label (optional)</label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Personal loan" className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Principal ({cs})</label>
                  <Input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="0" min="0" className="rounded-xl bg-secondary border-0 h-11" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Interest %/yr</label>
                  <Input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="0" min="0" className="rounded-xl bg-secondary border-0 h-11" />
                </div>
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Linked Account (cash effect)</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-5">
                <option value="">None (track balance only)</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
              </select>
              <button onClick={handleAddLoan} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">Add Loan</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment sheet */}
      <AnimatePresence>
        {showPay && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowPay(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Record Payment</h3>
                <button onClick={() => setShowPay(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {showPay.person} · Remaining {cs}{loanRemaining(showPay).toFixed(2)} · Partial payments allowed
              </p>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount ({cs})</label>
              <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} min="0" className="rounded-xl bg-secondary border-0 h-14 text-2xl font-bold mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
              <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note (optional)</label>
              <Input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="e.g. 2nd installment" className="rounded-xl bg-secondary border-0 h-11 mb-5" />
              <button onClick={handlePay} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">Save Payment</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* History sheet */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowHistory(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Payment History</h3>
                <button onClick={() => setShowHistory(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{showHistory.person} · {showHistory.label}</p>
              {showHistory.payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No payments recorded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...showHistory.payments].reverse().map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/60">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cs}{p.amount.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground">{p.date}{p.note ? ` · ${p.note}` : ''}</p>
                      </div>
                      <span className="text-xs text-income font-medium">Paid</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoansPage;
