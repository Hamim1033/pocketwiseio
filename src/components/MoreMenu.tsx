import { motion } from 'framer-motion';
import { HandCoins, Receipt, PiggyBank, Wallet, BarChart3, Sparkles, Target, Crown, ChevronRight } from 'lucide-react';

type Props = { onNavigate: (page: string) => void; onOpenPremium: () => void };

const modules = [
  { id: 'loans', title: 'Loans & Debts', desc: 'Borrowed, lent, repayments & due dates', icon: HandCoins, color: 'bg-expense/10 text-expense' },
  { id: 'bills', title: 'Bills & Subscriptions', desc: 'Recurring bills, reminders, mark paid', icon: Receipt, color: 'bg-warning/10 text-warning' },
  { id: 'savings', title: 'Savings', desc: 'Contributions & savings history', icon: PiggyBank, color: 'bg-income/10 text-income' },
  { id: 'accounts', title: 'Accounts & Wallets', desc: 'Cash, bank, bKash, Nagad, Rocket & transfers', icon: Wallet, color: 'bg-primary/10 text-primary' },
  { id: 'reports', title: 'Financial Reports', desc: 'Date-filtered reports & CSV export', icon: BarChart3, color: 'bg-primary/10 text-primary' },
  { id: 'insights', title: 'AI Insights', desc: 'Smart analysis of your real data', icon: Sparkles, color: 'bg-income/10 text-income' },
  { id: 'goals', title: 'Financial Goals', desc: 'Targets, deadlines & progress', icon: Target, color: 'bg-primary/10 text-primary' },
];

const MoreMenu = ({ onNavigate, onOpenPremium }: Props) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Finance Modules</h2>
      <div className="grid grid-cols-2 gap-3">
        {modules.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onNavigate(m.id)}
            className="glass-card rounded-xl p-4 text-left active:scale-95 transition-transform"
          >
            <div className={`w-9 h-9 rounded-lg ${m.color} flex items-center justify-center mb-2`}>
              <m.icon className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-foreground">{m.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{m.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onOpenPremium}
        className="w-full glass-card rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">SpendWise Premium</p>
            <p className="text-[10px] text-muted-foreground">Advanced analytics, exports & more</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </motion.button>
    </div>
  );
};

export default MoreMenu;
