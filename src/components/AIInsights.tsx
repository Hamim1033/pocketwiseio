import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, Lightbulb } from 'lucide-react';

const insights = [
  {
    icon: TrendingDown,
    title: 'Spending Alert',
    text: 'Your shopping spending is 15% higher than last month. Consider setting a stricter budget.',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: Lightbulb,
    title: 'Money Tip',
    text: 'Switching to a meal prep plan could save you ~$120/month on food.',
    color: 'text-income',
    bg: 'bg-income/10',
  },
  {
    icon: Sparkles,
    title: 'AI Prediction',
    text: 'Based on your patterns, you\'ll likely spend $2,800 this month — $200 under budget!',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

const AIInsights = () => {
  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card rounded-xl p-4 flex gap-3"
        >
          <div className={`w-9 h-9 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
            <insight.icon className={`w-4 h-4 ${insight.color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{insight.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AIInsights;
