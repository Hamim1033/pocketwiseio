import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, ArrowLeftRight, Edit2 } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { AccountKind } from '@/lib/types';
import { formatDateShort, todayISO } from '@/lib/dateRange';
import { toast } from 'sonner';

const kinds: { value: AccountKind; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'bkash', label: 'bKash', icon: '📲' },
  { value: 'nagad', label: 'Nagad', icon: '🧾' },
  { value: 'rocket', label: 'Rocket', icon: '🚀' },
  { value: 'credit', label: 'Credit Card', icon: '💳' },
  { value: 'wallet', label: 'Wallet', icon: '📱' },
  { value: 'custom', label: 'Custom', icon: '📁' },
];

const AccountsPage = () => {
  const { accounts, transfers, accountBalances, addAccount, updateAccount, deleteAccount, transferBetweenAccounts, cs } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<AccountKind>('cash');
  const [balance, setBalance] = useState('0');
  const [icon, setIcon] = useState('💵');

  const [fromId, setFromId] = useState(accounts[0]?.id || '');
  const [toId, setToId] = useState(accounts[1]?.id || '');
  const [trAmount, setTrAmount] = useState('');
  const [trDate, setTrDate] = useState(todayISO());
  const [trNote, setTrNote] = useState('');

  const resetForm = () => { setName(''); setKind('cash'); setBalance('0'); setIcon('💵'); setEditId(null); };

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('Enter an account name'); return; }
    const bal = parseFloat(balance) || 0;
    if (bal < 0) { toast.error('Starting balance cannot be negative'); return; }
    if (editId) {
      updateAccount(editId, { name: name.trim(), type: kind, balance: bal, icon });
      toast.success('Account updated');
    } else {
      addAccount({ name: name.trim(), type: kind, balance: bal, icon });
      toast.success('Account added');
    }
    resetForm();
    setShowAdd(false);
  };

  const handleTransfer = () => {
    const amount = parseFloat(trAmount);
    if (!fromId || !toId || fromId === toId) { toast.error('Choose two different accounts'); return; }
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    const avail = accountBalances[fromId] ?? 0;
    if (amount > avail) { toast.error(`Only ${cs}${avail.toFixed(2)} available in ${accounts.find(a => a.id === fromId)?.name}`); return; }
    transferBetweenAccounts(fromId, toId, amount, trDate || todayISO(), trNote.trim() || undefined);
    toast.success(`Transferred ${cs}${amount.toLocaleString()} — transfers are not counted as income or expense`);
    setTrAmount(''); setTrNote(''); setShowTransfer(false);
  };

  const accountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="rounded-xl h-11 gap-2 border border-border bg-secondary/50 text-sm font-semibold text-foreground flex items-center justify-center">
          <Plus className="w-4 h-4" /> Add Account
        </button>
        <button onClick={() => setShowTransfer(true)} className="rounded-xl h-11 gap-2 gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
          <ArrowLeftRight className="w-4 h-4" /> Transfer
        </button>
      </div>

      <div className="space-y-3">
        {accounts.map(a => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">{a.icon}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{a.type} · starts at {cs}{a.balance.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-base font-bold ${accountBalances[a.id] < 0 ? 'text-expense' : 'text-foreground'}`}>
                {cs}{(accountBalances[a.id] ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <button onClick={() => {
                setEditId(a.id); setName(a.name); setKind(a.type); setBalance(a.balance.toString()); setIcon(a.icon); setShowAdd(true);
              }} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
              <button onClick={() => { if (accounts.length > 1) { deleteAccount(a.id); toast.success('Account deleted'); } else toast.error('Keep at least one account'); }} className="w-7 h-7 rounded-lg bg-expense/10 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-expense" /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {transfers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Transfer History</h3>
          <div className="space-y-2">
            {[...transfers].reverse().slice(0, 10).map(tr => (
              <div key={tr.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{accountName(tr.fromAccountId)} → {accountName(tr.toAccountId)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{cs}{tr.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateShort(tr.date)}{tr.note ? ` · ${tr.note}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">{editId ? 'Edit Account' : 'Add Account'}</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {kinds.map(k => (
                  <button key={k.value} onClick={() => { setKind(k.value); setIcon(k.icon); }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] transition-all ${kind === k.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    <span className="text-lg">{k.icon}</span><span>{k.label}</span>
                  </button>
                ))}
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. bKash Personal, DBBL Salary" className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Starting Balance ({cs})</label>
              <Input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="rounded-xl bg-secondary border-0 h-11 mb-5" />
              <button onClick={handleSubmit} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">{editId ? 'Save Changes' : 'Add Account'}</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transfer sheet */}
      <AnimatePresence>
        {showTransfer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setShowTransfer(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Transfer Money</h3>
                <button onClick={() => setShowTransfer(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From</label>
              <select value={fromId} onChange={e => setFromId(e.target.value)} className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-4">
                {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} ({cs}{(accountBalances[a.id] ?? 0).toFixed(2)})</option>)}
              </select>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To</label>
              <select value={toId} onChange={e => setToId(e.target.value)} className="w-full rounded-xl bg-secondary border-0 h-11 px-3 text-sm text-foreground mb-4">
                {accounts.filter(a => a.id !== fromId).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
              </select>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount ({cs})</label>
              <Input type="number" value={trAmount} onChange={e => setTrAmount(e.target.value)} min="0" className="rounded-xl bg-secondary border-0 h-14 text-2xl font-bold mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
              <Input type="date" value={trDate} onChange={e => setTrDate(e.target.value)} className="rounded-xl bg-secondary border-0 h-11 mb-4" />
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note (optional)</label>
              <Input value={trNote} onChange={e => setTrNote(e.target.value)} placeholder="e.g. Cash to bKash" className="rounded-xl bg-secondary border-0 h-11 mb-5" />
              <button onClick={handleTransfer} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">Transfer</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountsPage;
