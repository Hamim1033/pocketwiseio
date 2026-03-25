import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';

const BalanceCard = () => {
  const { totalBalance, totalIncome, totalExpense, cs, t } = useAppData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-primary rounded-2xl p-6 text-primary-foreground"
    >
      <div className="flex items-center gap-2 mb-1">
        <Wallet className="w-4 h-4 opacity-80" />
        <span className="text-sm font-medium opacity-80">{t('totalBalance')}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight mb-4">
        {cs}{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs opacity-70">{t('income')}</p>
            <p className="text-sm font-semibold">{cs}{totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs opacity-70">{t('expense')}</p>
            <p className="text-sm font-semibold">{cs}{totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
