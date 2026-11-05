import { useState } from 'react';
import { CalendarDays, Check } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { PRESETS } from '@/lib/dateRange';
import { DatePreset } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const DateRangeFilter = () => {
  const { dateRange, setDatePreset, setCustomDateRange } = useAppData();
  const [showCustom, setShowCustom] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const applyCustom = () => {
    if (!start || !end) return;
    if (start > end) { [start, end].reverse(); }
    setCustomDateRange(start <= end ? start : end, end >= start ? end : start);
    setShowCustom(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>Period: <span className="font-semibold text-foreground">{dateRange.label}</span></span>
        <span className="text-[10px]">({dateRange.start === '0000-01-01' ? 'All time' : `${dateRange.start} → ${dateRange.end}`})</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {PRESETS.map(p => (
          <button
            key={p.value}
            onClick={() => {
              if (p.value === 'custom') setShowCustom(true);
              else setDatePreset(p.value as DatePreset);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              dateRange.preset === p.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showCustom && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowCustom(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Custom Date Range</h3>
                <button onClick={() => setShowCustom(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date</label>
              <input
                type="date" value={start} onChange={e => setStart(e.target.value)}
                className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-4"
              />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date</label>
              <input
                type="date" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-5"
              />
              <button
                onClick={applyCustom}
                disabled={!start || !end}
                className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Apply Range
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangeFilter;
