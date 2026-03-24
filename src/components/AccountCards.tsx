import { motion } from 'framer-motion';
import { useAppData } from '@/contexts/AppContext';

const AccountCards = () => {
  const { accounts } = useAppData();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {accounts.map((acc, i) => (
        <motion.div
          key={acc.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="min-w-[160px] glass-card rounded-xl p-4 flex-shrink-0"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{acc.icon}</span>
            <span className="text-xs font-medium text-muted-foreground">{acc.name}</span>
          </div>
          <p className={`text-lg font-bold ${acc.balance < 0 ? 'text-expense' : 'text-foreground'}`}>
            ${Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default AccountCards;
