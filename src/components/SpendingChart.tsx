import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { monthlySpending, categorySpending } from '@/lib/mock-data';

const SpendingChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Income vs Expense</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlySpending} barGap={4}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="income" fill="hsl(155,72%,45%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="hsl(0,72%,51%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export const CategoryChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>
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
        <div className="flex-1 space-y-2">
          {categorySpending.slice(0, 5).map(cat => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.fill }} />
                <span className="text-muted-foreground">{cat.name}</span>
              </div>
              <span className="font-medium text-foreground">${cat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SpendingChart;
