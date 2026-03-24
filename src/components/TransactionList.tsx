import { motion } from 'framer-motion';
import { useAppData } from '@/contexts/AppContext';

const TransactionList = ({ limit }: { limit?: number }) => {
  const { transactions } = useAppData();
  const items = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="space-y-2">
      {items.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center justify-between p-3 rounded-xl bg-card hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
              {t.categoryIcon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t.description}</p>
              <p className="text-xs text-muted-foreground">{t.category} · {t.account}</p>
            </div>
          </div>
          <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default TransactionList;
