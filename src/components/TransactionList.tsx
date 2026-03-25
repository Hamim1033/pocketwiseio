import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, RotateCcw } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Transaction } from '@/lib/types';

type Props = {
  limit?: number;
  filter?: {
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
  };
  onEdit?: (t: Transaction) => void;
};

const TransactionList = ({ limit, filter, onEdit }: Props) => {
  const { transactions, deleteTransaction, cs } = useAppData();
  const [swipedId, setSwipedId] = useState<string | null>(null);

  let items = [...transactions];

  if (filter) {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes?.toLowerCase().includes(q)) ||
        (t.tags?.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    if (filter.category) {
      items = items.filter(t => t.category === filter.category);
    }
    if (filter.dateFrom) {
      items = items.filter(t => t.date >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      items = items.filter(t => t.date <= filter.dateTo!);
    }
    if (filter.minAmount !== undefined) {
      items = items.filter(t => t.amount >= filter.minAmount!);
    }
    if (filter.maxAmount !== undefined) {
      items = items.filter(t => t.amount <= filter.maxAmount!);
    }
  }

  if (limit) items = items.slice(0, limit);

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="relative overflow-hidden rounded-xl"
        >
          {/* Action buttons behind */}
          {swipedId === t.id && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center gap-1 pr-2">
              {onEdit && (
                <button
                  onClick={() => { onEdit(t); setSwipedId(null); }}
                  className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 text-primary" />
                </button>
              )}
              <button
                onClick={() => { deleteTransaction(t.id); setSwipedId(null); }}
                className="w-9 h-9 rounded-lg bg-expense/20 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 text-expense" />
              </button>
            </div>
          )}

          <div
            onClick={() => setSwipedId(swipedId === t.id ? null : t.id)}
            className="flex items-center justify-between p-3 bg-card hover:bg-secondary/50 transition-colors cursor-pointer relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
                {t.categoryIcon}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  {t.description}
                  {t.isRecurring && <RotateCcw className="w-3 h-3 text-primary" />}
                </p>
                <p className="text-xs text-muted-foreground">{t.category} · {t.account}</p>
                {t.tags && t.tags.length > 0 && (
                  <div className="flex gap-1 mt-0.5">
                    {t.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                {t.type === 'income' ? '+' : '-'}{cs}{t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground">{t.date}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TransactionList;
