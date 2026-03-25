import { motion } from 'framer-motion';
import { X, Check, Crown, Zap, BarChart3, Brain, Download, Cloud, Ban, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = { open: boolean; onClose: () => void };

const features = [
  { name: 'Basic Expense Tracking', free: true, premium: true, icon: Zap },
  { name: 'Up to 5 Budgets', free: true, premium: false, icon: BarChart3 },
  { name: 'Unlimited Budgets', free: false, premium: true, icon: BarChart3 },
  { name: 'Advanced Analytics', free: false, premium: true, icon: BarChart3 },
  { name: 'AI Insights', free: false, premium: true, icon: Brain },
  { name: 'Export (PDF/Excel)', free: false, premium: true, icon: Download },
  { name: 'Cloud Sync', free: false, premium: true, icon: Cloud },
  { name: 'No Ads', free: false, premium: true, icon: Ban },
  { name: 'Multi-device Access', free: false, premium: true, icon: Smartphone },
];

const PremiumScreen = ({ open, onClose }: Props) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">SpendWise Premium</h1>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="gradient-primary rounded-2xl p-6 text-center text-primary-foreground mb-6"
        >
          <Crown className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Unlock Full Power</h2>
          <p className="text-sm opacity-80">Get unlimited budgets, AI insights, cloud sync, and more</p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-xl p-4 border-2 border-transparent">
            <p className="text-xs text-muted-foreground mb-1">Monthly</p>
            <p className="text-2xl font-bold text-foreground">$4.99</p>
            <p className="text-[10px] text-muted-foreground">/month</p>
          </div>
          <div className="glass-card rounded-xl p-4 border-2 border-primary relative">
            <div className="absolute -top-2.5 right-2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">SAVE 40%</div>
            <p className="text-xs text-muted-foreground mb-1">Yearly</p>
            <p className="text-2xl font-bold text-foreground">$2.99</p>
            <p className="text-[10px] text-muted-foreground">/month, billed yearly</p>
          </div>
        </div>

        {/* Feature Comparison */}
        <h3 className="text-sm font-semibold text-foreground mb-3">Feature Comparison</h3>
        <div className="glass-card rounded-xl overflow-hidden mb-6">
          <div className="grid grid-cols-3 gap-0 p-3 bg-secondary/50 border-b border-border/50">
            <span className="text-xs font-semibold text-foreground">Feature</span>
            <span className="text-xs font-semibold text-muted-foreground text-center">Free</span>
            <span className="text-xs font-semibold text-primary text-center">Premium</span>
          </div>
          {features.map((f, i) => (
            <div key={i} className="grid grid-cols-3 gap-0 p-3 border-b border-border/30 last:border-0">
              <span className="text-xs text-foreground flex items-center gap-1.5">
                <f.icon className="w-3 h-3 text-muted-foreground" />
                {f.name}
              </span>
              <div className="flex justify-center">
                {f.free ? (
                  <Check className="w-4 h-4 text-income" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex justify-center">
                {f.premium ? (
                  <Check className="w-4 h-4 text-income" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground/30" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <Button
          onClick={() => toast.info('Payment integration coming soon! Stay tuned.')}
          className="w-full h-12 rounded-xl text-base font-semibold mb-3 gradient-primary border-0"
        >
          <Crown className="w-5 h-5 mr-2" /> Upgrade Now
        </Button>
        <Button
          onClick={() => toast.info('7-day free trial starting soon!')}
          variant="outline"
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Start 7-Day Free Trial
        </Button>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Cancel anytime. No questions asked. Terms apply.
        </p>
      </div>
    </motion.div>
  );
};

export default PremiumScreen;
