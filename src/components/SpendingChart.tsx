import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useAppData } from '@/contexts/AppContext';
import { categories } from '@/lib/mock-data';
import { PieChart as PieIcon } from 'lucide-react';

// Income vs Expense মাসিক চার্ট (রিয়েল ডাটা থেকে ক্যালকুলেট করা)
const SpendingChart = () => {
  const { transactions, cs } = useAppData();

  // গত ৬ মাসের ডাইনামিক হিসাব
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = monthNames[d.getMonth()];
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const income = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(yearMonth))
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(yearMonth))
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({ month: monthLabel, income, expense });
    }
    return result;
  }, [transactions]);

  const hasData = transactions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Income vs Expense</h3>
        {!hasData && <span className="text-xs text-muted-foreground">No data yet</span>}
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} barGap={4}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${cs}${value.toLocaleString()}`]}
            />
            <Bar dataKey="income" fill="hsl(155,72%,45%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="hsl(0,72%,51%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Spending by Category ডোন্ট চার্ট (রিয়েল খরচের উপর ভিত্তি করে)
export const CategoryChart = () => {
  const { transactions, cs } = useAppData();

  const categorySpending = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return [];

    const map = new Map<string, number>();
    expenses.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });

    return Array.from(map.entries())
      .map(([name, value]) => {
        const catObj = categories.find(c => c.name === name);
        return {
          name,
          value,
          fill: catObj?.color || 'hsl(220, 70%, 50%)',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const hasExpenses = categorySpending.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>

      {!hasExpenses ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
            <PieIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No expenses yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Category breakdown will appear automatically once you add your first expense
          </p>
        </div>
      ) : (
        <div className="h-44 flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2 max-h-40 overflow-y-auto pr-1">
            {categorySpending.slice(0, 5).map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.fill }} />
                  <span className="text-muted-foreground truncate">{cat.name}</span>
                </div>
                <span className="font-medium text-foreground flex-shrink-0">
                  {cs}{cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SpendingChart;
