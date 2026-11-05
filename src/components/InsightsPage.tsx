import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Check, X, RefreshCw, Loader2, Brain } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { generateInsights } from '@/lib/insights';
import { Insight } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const priorityStyle: Record<string, string> = {
  high: 'bg-expense/10 text-expense',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-secondary text-muted-foreground',
};

const categoryLabel: Record<string, string> = {
  ai_insight: 'AI Insight', expense: 'Expense', income: 'Income', loan: 'Loan',
  budget: 'Budget', savings: 'Savings', system: 'System',
};

type Props = { onNavigate: (page: string) => void };

const InsightsPage = ({ onNavigate }: Props) => {
  const {
    transactions, budgets, loans, bills, goals, dateRange, cs,
    dismissedInsights, dismissInsight, pushInsightNotifications,
  } = useAppData();
  const [aiInsights, setAiInsights] = useState<Insight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const ruleInsights = generateInsights({
    transactions, budgets, loans, bills, goals,
    range: { start: dateRange.start, end: dateRange.end, prevStart: dateRange.prevStart, prevEnd: dateRange.prevEnd, label: dateRange.label },
    cs,
  });

  const visible = ruleInsights.filter(i => !dismissedInsights.includes(i.id));

  // Post the important insights to the notification center (deduplicated)
  useEffect(() => {
    pushInsightNotifications(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map(i => i.id).join(',')]);

  const fetchAiInsights = async () => {
    if (transactions.length === 0) { toast.error('Add some transactions first'); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { transactions: transactions.slice(0, 20) },
      });
      if (error) throw error;
      if (data?.insights && Array.isArray(data.insights) && data.insights.length > 0) {
        const mapped: Insight[] = data.insights.slice(0, 3).map((i: any, idx: number) => ({
          id: `ai_${Date.now()}_${idx}`,
          category: 'ai_insight',
          priority: 'medium',
          title: i.title || 'AI Insight',
          explanation: i.text || '',
          supportingData: [`Based on your ${transactions.length} most recent records`, `Period: ${dateRange.label}`],
          actionPage: 'transactions',
          actionLabel: 'View Transactions',
          dateRange: dateRange.label,
          source: 'ai',
        }));
        setAiInsights(mapped);
        toast.success('AI insights generated');
      } else {
        toast.error('AI returned no insights — showing rule-based insights below');
      }
    } catch {
      toast.error('AI service unavailable — rule-based insights are shown below');
    } finally {
      setAiLoading(false);
    }
  };

  const InsightCard = ({ insight }: { insight: Insight }) => {
    const isOpen = expanded === insight.id;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${priorityStyle[insight.priority]}`}>{insight.priority}</span>
            <span className="text-[10px] text-muted-foreground">{categoryLabel[insight.category] || insight.category}</span>
            {insight.source === 'ai' && <span className="text-[10px] text-primary flex items-center gap-0.5"><Brain className="w-3 h-3" />AI</span>}
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">{insight.title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.explanation}</p>

        {isOpen && (
          <div className="mt-3 p-3 rounded-xl bg-secondary/60 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Supporting data</p>
            {insight.supportingData.map((d, i) => (
              <p key={i} className="text-[11px] text-foreground font-medium">• {d}</p>
            ))}
            <p className="text-[10px] text-muted-foreground mt-2">Period: {insight.dateRange}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          {insight.actionPage && (
            <button
              onClick={() => onNavigate(insight.actionPage!)}
              className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> {insight.actionLabel || 'Apply'}
            </button>
          )}
          <button
            onClick={() => setExpanded(isOpen ? null : insight.id)}
            className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-1"
          >
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Details
          </button>
          {insight.source === 'rules' && (
            <button
              onClick={() => { dismissInsight(insight.id); toast('Insight dismissed'); }}
              className="ml-auto w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Financial Insights</p>
            <p className="text-[11px] text-muted-foreground">Period: {dateRange.label} · based on your real records</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rule-Based Analysis ({visible.length})</h3>
        </div>
        <div className="space-y-3">
          {visible.map(i => <InsightCard key={i.id} insight={i} />)}
          {visible.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">✨</p>
              <p className="text-sm font-semibold text-foreground mb-1">All caught up</p>
              <p className="text-xs text-muted-foreground">No insights for this period. Add transactions or change the date range.</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI-Generated Insights</h3>
          <button onClick={fetchAiInsights} disabled={aiLoading} className="text-xs text-primary font-medium flex items-center gap-1 disabled:opacity-50">
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {aiLoading ? 'Analyzing…' : 'Generate'}
          </button>
        </div>
        <AnimatePresence>
          {aiInsights.length > 0 ? (
            <div className="space-y-3">
              {aiInsights.map(i => <InsightCard key={i.id} insight={i} />)}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Tap "Generate" to get AI-crafted recommendations from your recent activity</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-muted-foreground px-1 text-center">
        Insights never modify your records automatically — every change happens only when you confirm it in the relevant module.
      </p>
    </div>
  );
};

export default InsightsPage;
