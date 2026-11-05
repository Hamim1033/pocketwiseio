import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, PiggyBank, X } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { formatDateShort, todayISO } from '@/lib/dateRange';
import { toast } from 'sonner';

const SavingsPage = () => {
  const { goals, goalContributions, totalSavings, addGoalContribution, cs } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [goalId, setGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());

  const recent = [...goalContributions].reverse().slice(0, 10);
  const goalName = (id: string) => goals.find(g => g.id === id)?.name || 'Deleted goal';

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!goalId) { toast.error('Choose a savings goal'); return; }
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    addGoalContribution(goalId, amt, date || todayISO());
    toast.success(`${cs}${amt.toLocaleString()} added to "${goalName(goalId)}"`);
    setAmount(''); setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="gradient-primary rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank className="w-4 h-4 opacity-80" />
          <span className="text-xs opacity-80">Total Savings</span>
        </div>
        <p className="text-3xl font-bold">{cs}{totalSavings.toLocaleString()}</p>
        <p className="text-[11px] opacity-70 mt-1">Across {goals.length} goal{goals.length === 1 ? '' : 's'} · kept separate from account balances</p>
      </div>

      <button onClick={() => { setGoalId(goals[0]?.id || ''); setAmount(''); setDate(todayISO()); setShowAdd(true); }} disabled={goals.length === 0}
        className="w-full rounded-xl h-11 gap-2 border border-border bg-secondary/50 text-sm font-semibold text-foreground flex items-center justify-center disabled:opacity-50">
        <Plus className="w-4 h-4" /> Add Savings to a Goal
      </button>

      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map(g => {
            const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
            return (
              <div key={g.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{g.icon}</span>
                    <span className="text-sm font-medium text-foreground">{g.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">{Math.round(pct)}%</span>
                </div>
                <Progress value={pct} className="h-2 [&>div]:bg-primary" />
                <p className="text-[11px] text-muted-foreground mt-1.5">{cs}{g.savedAmount.toLocaleString()} / {cs}{g.targetAmount.toLocaleString()} · deadline {g.deadline}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">🐷</p>
          <p className="text-sm font-semibold text-foreground mb-1">No Savings Goals Yet</p>
          <p className="text-xs text-muted-foreground">Create a goal first, then record savings against it</p>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Savings History</h3>
          <div className="space-y-2">
            {recent.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{goalName(c.goalId)}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateShort(c.date)}{c.note ? ` · ${c.note}` : ''}</p>
                </div>
                <p className="text-sm font-semibold text-income">+{cs}{c.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Add Savings</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Goal</label>
              <select value={goalId} onChange={e => setGoalId(e.target.value)} className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-4">
                <option value="">Select a goal…</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
              </select>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount ({cs})</label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" className="rounded-xl bg-secondary border-0 h-14 text-2xl font-bold mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl bg-secondary border-0 h-11 mb-5" />
              <button onClick={handleAdd} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">Add Savings</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavingsPage;
