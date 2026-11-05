import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Download } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { categories } from '@/lib/mock-data';
import { toISO } from '@/lib/dateRange';
import { toast } from 'sonner';

const ReportsPage = () => {
  const { filteredTransactions, dateRange, rangeIncome, rangeExpense, rangeNet, cs } = useAppData();

  const byCategory = useMemo(() => {
    const map = new Map<string, { value: number; icon: string; color: string }>();
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cur = map.get(t.category) || { value: 0, icon: t.categoryIcon, color: categories.find(c => c.name === t.category)?.color || 'hsl(220,70%,50%)' };
      map.set(t.category, { ...cur, value: cur.value + t.amount });
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const byMonth = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    filteredTransactions.forEach(t => {
      const ym = t.date.slice(0, 7);
      const cur = map.get(ym) || { income: 0, expense: 0 };
      if (t.type === 'income') cur.income += t.amount; else cur.expense += t.amount;
      map.set(ym, cur);
    });
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([ym, v]) => ({ month: `${names[parseInt(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`, ...v }));
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) { toast.error('No transactions in this period to export'); return; }
    const header = 'Date,Type,Category,Description,Amount,Account,Tags,Notes\n';
    const rows = filteredTransactions.map(t =>
      [t.date, t.type, t.category, `"${t.description.replace(/"/g, '""')}"`, t.amount, t.account,
       (t.tags || []).join('|'), `"${(t.notes || '').replace(/"/g, '""')}"`].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendwise-report-${dateRange.start}_${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported as CSV (opens in Excel/Sheets)');
  };

  const savingsRate = rangeIncome > 0 ? Math.max(0, Math.round((rangeNet / rangeIncome) * 100)) : 0;

  return (
    <div className="space-y-4">
      <DateRangeFilter />

      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Income</p>
          <p className="text-sm font-bold text-income">{cs}{rangeIncome.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Expenses</p>
          <p className="text-sm font-bold text-expense">{cs}{rangeExpense.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Net Flow</p>
          <p className={`text-sm font-bold ${rangeNet >= 0 ? 'text-income' : 'text-expense'}`}>{cs}{rangeNet.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground">Savings rate</p>
          <p className="text-xs font-semibold text-primary">{savingsRate}%</p>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${Math.min(savingsRate, 100)}%` }} />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Trend</h3>
        {byMonth.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No transactions in this period</p>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220,9%,46%)' }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: number) => [`${cs}${value.toLocaleString()}`]} />
                <Bar dataKey="income" fill="hsl(155,72%,45%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(0,72%,51%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Expense Breakdown</h3>
        {byCategory.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No expenses in this period</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map(c => {
              const pct = rangeExpense > 0 ? Math.round((c.value / rangeExpense) * 100) : 0;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{c.icon} {c.name}</span>
                    <span className="font-medium text-foreground">{cs}{c.value.toLocaleString()} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={handleExportCSV} className="w-full rounded-xl h-11 gap-2 border border-border bg-secondary/50 text-sm font-semibold text-foreground flex items-center justify-center">
        <Download className="w-4 h-4" /> Export CSV ({filteredTransactions.length} rows)
      </button>
    </div>
  );
};

export default ReportsPage;
