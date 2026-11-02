import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, Lightbulb, RefreshCw, Loader2 } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Insight = {
  type: 'alert' | 'tip' | 'prediction';
  title: string;
  text: string;
};

const iconMap = {
  alert: TrendingDown,
  tip: Lightbulb,
  prediction: Sparkles,
};

const styleMap = {
  alert: { color: 'text-warning', bg: 'bg-warning/10' },
  tip: { color: 'text-income', bg: 'bg-income/10' },
  prediction: { color: 'text-primary', bg: 'bg-primary/10' },
};

const AIInsights = () => {
  const { transactions } = useAppData();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (transactions.length === 0) {
      setInsights([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { transactions: transactions.slice(0, 20) },
      });

      if (error) throw error;
      if (data?.insights && Array.isArray(data.insights) && data.insights.length > 0) {
        setInsights(data.insights.slice(0, 3));
      }
    } catch (err: any) {
      console.error('AI insights error:', err);
      toast.error('Could not fetch AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchInsights();
    } else {
      setInsights([]);
    }
  }, [transactions.length]);

  // নতুন ইউজার বা লেনদেন না থাকলে ক্লিন ফাঁকা স্টেট দেখাবে
  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 text-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">No AI Insights Yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Add your first income or expense to receive AI-powered spending tips and budget predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-primary font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>
      {insights.map((insight, i) => {
        const Icon = iconMap[insight.type] || Sparkles;
        const style = styleMap[insight.type] || styleMap.prediction;
        return (
          <motion.div
            key={`${insight.title}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-4 flex gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${style.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.text}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AIInsights;
