import { motion } from 'framer-motion';
import { useAppData } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';

const BudgetOverview = () => {
  const { budgets } = useAppData();

  return (
    <div className="space-y-3">
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
              <span className={`text-xs font-semibold ${isOver ? 'text-expense' : 'text-muted-foreground'}`}>
                ${b.spent} / ${b.limit}
              </span>
            </div>
            <Progress value={pct} className={`h-2 ${isOver ? '[&>div]:bg-expense' : '[&>div]:bg-primary'}`} />
            <p className="text-xs text-muted-foreground mt-1.5">
              {isOver ? '⚠️ Almost exceeded!' : `$${b.limit - b.spent} remaining`}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BudgetOverview;
