import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Calendar, Tag, FileText, RotateCcw } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { categories } from '@/lib/mock-data';
import { TransactionType, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
};

const AddTransactionSheet = ({ open, onClose, editTransaction }: Props) => {
  const { addTransaction, updateTransaction, cs } = useAppData();

  // Load last-used preferences from localStorage
  const getLastCategory = (type: TransactionType) => localStorage.getItem('sw_last_category_' + type) || '';
  const getLastAccount = () => localStorage.getItem('sw_last_account') || 'Cash';

  const [type, setType] = useState<TransactionType>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount.toString() || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [selectedCategory, setSelectedCategory] = useState(editTransaction?.category || getLastCategory('expense'));
  const [account, setAccount] = useState(editTransaction?.account || getLastAccount());
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState(editTransaction?.tags?.join(', ') || '');
  const [notes, setNotes] = useState(editTransaction?.notes || '');
  const [isRecurring, setIsRecurring] = useState(editTransaction?.isRecurring || false);
  const [recurringInterval, setRecurringInterval] = useState(editTransaction?.recurringInterval || 'monthly');

  // Reset form when opening with edit or new
  useEffect(() => {
    if (open) {
      if (editTransaction) {
        setType(editTransaction.type);
        setAmount(editTransaction.amount.toString());
        setDescription(editTransaction.description);
        setSelectedCategory(editTransaction.category);
        setAccount(editTransaction.account);
        setDate(editTransaction.date);
        setTags(editTransaction.tags?.join(', ') || '');
        setNotes(editTransaction.notes || '');
        setIsRecurring(editTransaction.isRecurring || false);
        setRecurringInterval(editTransaction.recurringInterval || 'monthly');
      } else {
        setAmount('');
        setDescription('');
        setSelectedCategory(getLastCategory(type));
        setAccount(getLastAccount());
        setDate(new Date().toISOString().split('T')[0]);
        setTags('');
        setNotes('');
        setIsRecurring(false);
      }
    }
  }, [open, editTransaction]);

  const filtered = categories.filter(c => c.type === type);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    const cat = categories.find(c => c.name === selectedCategory);
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

    const txData = {
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      categoryIcon: cat?.icon || '📝',
      description: description || selectedCategory,
      date,
      account,
      tags: tagArray.length > 0 ? tagArray : undefined,
      notes: notes || undefined,
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval as Transaction['recurringInterval'] : undefined,
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, txData);
      toast.success('Transaction updated!');
    } else {
      addTransaction(txData);
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} of ${cs}${parseFloat(amount).toFixed(2)} added!`);
    }
    onClose();
  };

  const handleTypeSwitch = (newType: TransactionType) => {
    setType(newType);
    setSelectedCategory(getLastCategory(newType));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-4 p-1 bg-secondary rounded-xl">
              <button
                onClick={() => handleTypeSwitch('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  type === 'expense' ? 'bg-expense text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Minus className="w-4 h-4" /> Expense
              </button>
              <button
                onClick={() => handleTypeSwitch('income')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  type === 'income' ? 'bg-income text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Plus className="w-4 h-4" /> Income
              </button>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">{cs}</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-10 text-2xl font-bold h-14 rounded-xl bg-secondary border-0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What was this for?"
                className="rounded-xl bg-secondary border-0 h-11"
              />
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="rounded-xl bg-secondary border-0 h-11"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Category ({type === 'income' ? 'Income' : 'Expense'})
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                {filtered.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="truncate w-full text-center text-[10px]">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags (comma separated)
              </label>
              <Input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. work, urgent"
                className="rounded-xl bg-secondary border-0 h-11"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                <FileText className="w-3 h-3" /> Notes
              </label>
              <Input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional details..."
                className="rounded-xl bg-secondary border-0 h-11"
              />
            </div>

            {/* Recurring */}
            <div className="mb-4 flex items-center justify-between p-3 bg-secondary rounded-xl">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Recurring
              </label>
              <div className="flex items-center gap-2">
                {isRecurring && (
                  <select
                    value={recurringInterval}
                    onChange={e => setRecurringInterval(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                    className="text-xs bg-card rounded-lg px-2 py-1 border-0 text-foreground"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
                <button
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-10 h-6 rounded-full transition-colors ${isRecurring ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Account */}
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Account</label>
              <div className="flex flex-wrap gap-2">
                {['Cash', 'Bank Account', 'Credit Card', 'Digital Wallet'].map(a => (
                  <button
                    key={a}
                    onClick={() => setAccount(a)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      account === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full h-12 rounded-xl text-base font-semibold">
              {editTransaction ? 'Update' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionSheet;
