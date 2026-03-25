import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { categories } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import TransactionList from '@/components/TransactionList';
import { Transaction } from '@/lib/types';

type Props = { open: boolean; onClose: () => void; onEdit?: (t: Transaction) => void };

const SearchSheet = ({ open, onClose, onEdit }: Props) => {
  const { t } = useAppData();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const clearFilters = () => {
    setFilterCategory('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasFilters = filterCategory || dateFrom || dateTo || minAmount || maxAmount;

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 bg-card rounded-b-3xl p-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Search Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('search')}
                  autoFocus
                  className="pl-10 rounded-xl bg-secondary border-0 h-11"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${showFilters || hasFilters ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden mb-4">
                <div className="space-y-3 p-3 bg-secondary/50 rounded-xl">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('byCategory')}</label>
                    <div className="flex flex-wrap gap-1.5">
                      {expenseCategories.slice(0, 8).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setFilterCategory(filterCategory === cat.name ? '' : cat.name)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${filterCategory === cat.name ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'}`}
                        >
                          {cat.icon} {cat.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">From</label>
                      <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-card border-0 rounded-lg h-9 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">To</label>
                      <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-card border-0 rounded-lg h-9 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Min Amount</label>
                      <Input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="0" className="bg-card border-0 rounded-lg h-9 text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Max Amount</label>
                      <Input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="∞" className="bg-card border-0 rounded-lg h-9 text-xs" />
                    </div>
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-expense font-medium">{t('clearFilters')}</button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Results */}
            {(query || hasFilters) && (
              <TransactionList
                filter={{
                  search: query,
                  category: filterCategory,
                  dateFrom: dateFrom || undefined,
                  dateTo: dateTo || undefined,
                  minAmount: minAmount ? parseFloat(minAmount) : undefined,
                  maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
                }}
                onEdit={onEdit}
              />
            )}

            {!query && !hasFilters && (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Search transactions, categories, notes...</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchSheet;
