import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories } from '@/lib/mock-data';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const BudgetOverview = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, cs, t } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = () => {
    if (!selectedCategory) { toast.error('Select a category'); return; }
    if (!limit || parseFloat(limit) <= 0) { toast.error('Enter a valid limit'); return; }
    const cat = categories.find(c => c.name === selectedCategory);

    if (editId) {
      updateBudget(editId, { limit: parseFloat(limit) });
      toast.success('Budget updated!');
      setEditId(null);
    } else {
      if (budgets.some(b => b.category === selectedCategory)) {
        toast.error('Budget for this category already exists');
        return;
      }
      addBudget({
        category: selectedCategory,
        categoryIcon: cat?.icon || '📝',
        limit: parseFloat(limit),
        spent: 0,
        period: 'monthly',
      });
      toast.success('Budget created!');
    }
    setSelectedCategory('');
    setLimit('');
    setShowAdd(false);
  };

  const startEdit = (id: string) => {
    const b = budgets.find(b => b.id === id);
    if (b) {
      setEditId(id);
      setSelectedCategory(b.category);
      setLimit(b.limit.toString());
      setShowAdd(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Total Budget Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-2xl p-5 text-primary-foreground"
      >
        <p className="text-xs opacity-80 mb-1">{t('monthlyBudget')}</p>
        <p className="text-2xl font-bold">{cs}{totalSpent.toLocaleString()} / {cs}{totalBudget.toLocaleString()}</p>
        <Progress value={totalPct} className={`h-2 mt-3 bg-primary-foreground/20 ${totalPct >= 90 ? '[&>div]:bg-expense' : '[&>div]:bg-primary-foreground'}`} />
        <p className="text-xs opacity-70 mt-1.5">
          {cs}{Math.max(totalBudget - totalSpent, 0).toLocaleString()} {t('remaining')}
        </p>
      </motion.div>

      {/* Add Budget Button */}
      <Button
        onClick={() => { setEditId(null); setSelectedCategory(''); setLimit(''); setShowAdd(true); }}
        className="w-full rounded-xl h-11 gap-2"
        variant="outline"
      >
        <Plus className="w-4 h-4" /> {t('addBudget')}
      </Button>

      {/* Budget Items */}
      {budgets.map((b, i) => {
        const pct = Math.min((b.spent / b.limit) * 100, 100);
        const isOver = pct >= 90;
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{b.categoryIcon}</span>
                <span className="text-sm font-medium text-foreground">{b.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isOver ? 'text-expense' : 'text-muted-foreground'}`}>
                  {cs}{b.spent} / {cs}{b.limit}
                </span>
                <button onClick={() => startEdit(b.id)} className="p-1">
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => { deleteBudget(b.id); toast.success('Budget deleted'); }} className="p-1">
                  <Trash2 className="w-3.5 h-3.5 text-expense" />
                </button>
              </div>
            </div>
            <Progress value={pct} className={`h-2 ${isOver ? '[&>div]:bg-expense' : '[&>div]:bg-primary'}`} />
            <p className="text-xs text-muted-foreground mt-1.5">
              {isOver ? `⚠️ ${t('exceeded')}` : `${cs}${b.limit - b.spent} ${t('remaining')}`}
            </p>
          </motion.div>
        );
      })}

      {budgets.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm font-semibold text-foreground mb-1">No Budgets Yet</p>
          <p className="text-xs text-muted-foreground">Create your first budget to start tracking</p>
        </div>
      )}

      {/* Add/Edit Budget Sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">
                  {editId ? 'Edit Budget' : t('addBudget')}
                </h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {!editId && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('category')}</label>
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                    {expenseCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] transition-all ${
                          selectedCategory === cat.name
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="truncate w-full text-center">{cat.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Budget Limit ({cs})</label>
                <Input
                  type="number"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  placeholder="e.g. 500"
                  min="0"
                  className="rounded-xl bg-secondary border-0 h-12 text-lg font-bold"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full h-12 rounded-xl text-base font-semibold">
                {editId ? t('save') : t('addBudget')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetOverview;
