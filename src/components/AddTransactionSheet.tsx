import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { categories } from '@/lib/mock-data';
import { TransactionType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = { open: boolean; onClose: () => void };

const AddTransactionSheet = ({ open, onClose }: Props) => {
  const { addTransaction } = useAppData();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [account, setAccount] = useState('Cash');

  const filtered = categories.filter(c => c.type === type);

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;
    const cat = categories.find(c => c.name === selectedCategory);
    addTransaction({
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      categoryIcon: cat?.icon || '📝',
      description: description || selectedCategory,
      date: new Date().toISOString().split('T')[0],
      account,
    });
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    onClose();
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Add Transaction</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-5 p-1 bg-secondary rounded-xl">
              <button
                onClick={() => setType('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  type === 'expense' ? 'bg-expense text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Minus className="w-4 h-4" /> Expense
              </button>
              <button
                onClick={() => setType('income')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  type === 'income' ? 'bg-income text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Plus className="w-4 h-4" /> Income
              </button>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 text-2xl font-bold h-14 rounded-xl bg-secondary border-0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What was this for?"
                className="rounded-xl bg-secondary border-0 h-11"
              />
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {filtered.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="truncate w-full text-center">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account */}
            <div className="mb-6">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Account</label>
              <div className="flex gap-2">
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
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionSheet;
