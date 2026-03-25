import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, DollarSign } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const GoalsPage = () => {
  const { goals, addGoal, deleteGoal, addSavingsToGoal, cs, t } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [showSavings, setShowSavings] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [savingsAmount, setSavingsAmount] = useState('');

  const icons = ['🎯', '🏠', '✈️', '💻', '🚗', '📱', '🛡️', '💰', '🎓', '💍', '🏋️', '📚'];

  const handleAddGoal = () => {
    if (!name.trim()) { toast.error('Enter a goal name'); return; }
    if (!targetAmount || parseFloat(targetAmount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!deadline) { toast.error('Select a deadline'); return; }
    addGoal({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      savedAmount: 0,
      deadline,
      icon,
      color: `hsl(${Math.random() * 360}, 65%, 50%)`,
    });
    toast.success('Goal created!');
    setName('');
    setTargetAmount('');
    setDeadline('');
    setIcon('🎯');
    setShowAdd(false);
  };

  const handleAddSavings = () => {
    if (!showSavings) return;
    if (!savingsAmount || parseFloat(savingsAmount) <= 0) { toast.error('Enter a valid amount'); return; }
    addSavingsToGoal(showSavings, parseFloat(savingsAmount));
    toast.success(`${cs}${parseFloat(savingsAmount).toFixed(2)} added to savings!`);
    setSavingsAmount('');
    setShowSavings(null);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowAdd(true)}
        className="w-full rounded-xl h-11 gap-2"
        variant="outline"
      >
        <Plus className="w-4 h-4" /> {t('addGoal')}
      </Button>

      {goals.map((g, i) => {
        const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
        const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000));
        const isComplete = pct >= 100;

        return (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{daysLeft} days left</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setShowSavings(g.id); setSavingsAmount(''); }}
                  className="w-8 h-8 rounded-lg bg-income/10 flex items-center justify-center"
                >
                  <DollarSign className="w-4 h-4 text-income" />
                </button>
                <button
                  onClick={() => { deleteGoal(g.id); toast.success('Goal deleted'); }}
                  className="w-8 h-8 rounded-lg bg-expense/10 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 text-expense" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">{cs}{g.savedAmount.toLocaleString()} / {cs}{g.targetAmount.toLocaleString()}</span>
              <span className={`font-semibold ${isComplete ? 'text-income' : 'text-primary'}`}>{Math.round(pct)}%</span>
            </div>
            <Progress value={pct} className={`h-2.5 ${isComplete ? '[&>div]:bg-income' : '[&>div]:bg-primary'}`} />
            {isComplete && <p className="text-xs text-income mt-1.5 font-medium">🎉 Goal achieved!</p>}
          </motion.div>
        );
      })}

      {goals.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm font-semibold text-foreground mb-1">No Goals Yet</p>
          <p className="text-xs text-muted-foreground">Set your first savings goal and start tracking</p>
        </div>
      )}

      {/* Add Goal Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">{t('addGoal')}</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${icon === ic ? 'bg-primary shadow-md scale-110' : 'bg-secondary'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('goalName')}</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emergency Fund" className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('targetAmount')} ({cs})</label>
                <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="e.g. 5000" min="0" className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('deadline')}</label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <Button onClick={handleAddGoal} className="w-full h-12 rounded-xl text-base font-semibold">{t('addGoal')}</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Savings Sheet */}
      <AnimatePresence>
        {showSavings && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowSavings(null)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">{t('addSavings')}</h3>
                <button onClick={() => setShowSavings(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('amount')} ({cs})</label>
                <Input type="number" value={savingsAmount} onChange={e => setSavingsAmount(e.target.value)} placeholder="0.00" min="0" className="rounded-xl bg-secondary border-0 h-14 text-2xl font-bold" />
              </div>
              <Button onClick={handleAddSavings} className="w-full h-12 rounded-xl text-base font-semibold">{t('addSavings')}</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalsPage;
