import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Edit2, CalendarClock } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Bill, BillFrequency } from '@/lib/types';
import { billNextDue, billMonthlyCost } from '@/lib/finance';
import { categories } from '@/lib/mock-data';
import { daysBetween, todayISO } from '@/lib/dateRange';
import { toast } from 'sonner';

const expenseCats = categories.filter(c => c.type === 'expense');

const BillsPage = () => {
  const { bills, addBill, updateBill, deleteBill, payBill, accounts, cs } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [anchorDate, setAnchorDate] = useState(todayISO());
  const [category, setCategory] = useState(expenseCats[0]?.name || 'Bills');
  const [account, setAccount] = useState(accounts[0]?.name || 'Cash');
  const [remindDays, setRemindDays] = useState('3');

  const resetForm = () => {
    setName(''); setAmount(''); setFrequency('monthly'); setAnchorDate(todayISO());
    setCategory(expenseCats[0]?.name || 'Bills'); setAccount(accounts[0]?.name || 'Cash'); setRemindDays('3'); setEditId(null);
  };

  const openAdd = () => { resetForm(); setShowAdd(true); };
  const openEdit = (b: Bill) => {
    setName(b.name); setAmount(b.amount.toString()); setFrequency(b.frequency);
    setAnchorDate(b.anchorDate); setCategory(b.category); setAccount(b.account);
    setRemindDays(b.remindDaysBefore.toString()); setEditId(b.id); setShowAdd(true);
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!name.trim()) { toast.error('Enter the bill name'); return; }
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (!anchorDate) { toast.error('Pick the first due date'); return; }
    const cat = expenseCats.find(c => c.name === category);
    const payload = {
      name: name.trim(),
      icon: cat?.icon || '📄',
      amount: amt,
      frequency,
      anchorDate,
      category,
      categoryIcon: cat?.icon || '📄',
      account,
      remindDaysBefore: Math.max(parseInt(remindDays) || 0, 0),
      active: true,
    };
    if (editId) {
      updateBill(editId, payload);
      toast.success('Bill updated');
    } else {
      addBill(payload);
      toast.success('Bill added — reminders and upcoming payments will track it');
    }
    resetForm();
    setShowAdd(false);
  };

  const handlePay = (b: Bill) => {
    payBill(b.id);
    toast.success(`${b.name} paid — added as an expense in ${b.account}`);
  };

  return (
    <div className="space-y-4">
      {bills.filter(b => b.active).length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground mb-1">Monthly recurring total</p>
          <p className="text-lg font-bold text-foreground">
            {cs}{Math.round(bills.filter(b => b.active).reduce((s, b) => s + billMonthlyCost(b), 0)).toLocaleString()}/mo
          </p>
        </div>
      )}

      <button onClick={openAdd} className="w-full rounded-xl h-11 gap-2 border border-border bg-secondary/50 text-sm font-semibold text-foreground flex items-center justify-center">
        <Plus className="w-4 h-4" /> Add Bill / Subscription
      </button>

      {bills.length > 0 ? (
        <div className="space-y-3">
          {bills.map(b => {
            const next = billNextDue(b);
            const daysLeft = daysBetween(todayISO(), next);
            const urgent = daysLeft <= 3;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-lg">{b.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.name}</p>
                      <p className="text-[11px] text-muted-foreground">{cs}{b.amount} · {b.frequency} · {b.account}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => { deleteBill(b.id); toast.success('Bill deleted'); }} className="w-7 h-7 rounded-lg bg-expense/10 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-expense" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarClock className={`w-3.5 h-3.5 ${urgent ? 'text-expense' : ''}`} />
                    <span className={urgent ? 'text-expense font-semibold' : ''}>
                      {b.lastPaidDate ? `Last paid ${b.lastPaidDate} · ` : ''}Next due {next} ({daysLeft <= 0 ? 'today' : `${daysLeft}d`})
                    </span>
                  </div>
                  <button onClick={() => handlePay(b)} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">
                    Mark Paid
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-sm font-semibold text-foreground mb-1">No Bills Yet</p>
          <p className="text-xs text-muted-foreground">Add subscriptions and recurring bills to get reminders before they're due</p>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">{editId ? 'Edit Bill' : 'Add Bill'}</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Internet, Netflix, Rent" className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount ({cs})</label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(['weekly', 'monthly', 'yearly'] as BillFrequency[]).map(f => (
                  <button key={f} onClick={() => setFrequency(f)} className={`p-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${frequency === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">First Due Date</label>
              <Input type="date" value={anchorDate} onChange={e => setAnchorDate(e.target.value)} className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-4">
                {expenseCats.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pay From Account</label>
              <select value={account} onChange={e => setAccount(e.target.value)} className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-4">
                {accounts.map(a => <option key={a.id} value={a.name}>{a.icon} {a.name}</option>)}
              </select>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Remind Days Before</label>
              <Input type="number" value={remindDays} onChange={e => setRemindDays(e.target.value)} min="0" className="rounded-xl bg-secondary border-0 h-11 mb-5" />
              <button onClick={handleSubmit} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">{editId ? 'Save Changes' : 'Add Bill'}</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillsPage;
