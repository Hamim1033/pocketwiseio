import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Trash2, CheckCheck, BellRing, AlertTriangle } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { NotificationCategory } from '@/lib/types';

type Props = { open: boolean; onClose: () => void; onNavigate: (page: string) => void };

const filters: { value: NotificationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai_insight', label: 'AI Insights' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
  { value: 'loan', label: 'Loans' },
  { value: 'budget', label: 'Budgets' },
  { value: 'savings', label: 'Savings' },
  { value: 'system', label: 'System' },
];

const typeStyles: Record<string, string> = {
  budget_alert: 'bg-warning/10 text-warning',
  bill_reminder: 'bg-expense/10 text-expense',
  goal_reminder: 'bg-primary/10 text-primary',
  expense_reminder: 'bg-income/10 text-income',
  general: 'bg-secondary text-muted-foreground',
};

const typeIcons: Record<string, string> = {
  budget_alert: '⚠️',
  bill_reminder: '📄',
  goal_reminder: '🎯',
  expense_reminder: '💰',
  general: '🔔',
};

const NotificationsSheet = ({ open, onClose, onNavigate }: Props) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, clearNotifications, t } = useAppData();
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  const unread = notifications.filter(n => !n.read).length;

  const items = filter === 'all' ? notifications : notifications.filter(n => (n.category || 'general') === filter || n.type === 'general' && filter === 'system');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{t('notifications')}</h2>
                {unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-expense text-primary-foreground text-[10px] font-bold">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button onClick={markAllNotificationsRead} className="text-xs text-primary font-medium flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                    <button onClick={clearNotifications} className="text-xs text-expense font-medium flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </>
                )}
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide -mx-1 px-1">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((n, i) => {
                  const cat = n.category || 'general';
                  const isHigh = n.priority === 'high';
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) { onNavigate(n.link); onClose(); }
                      }}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all group ${n.read ? 'bg-secondary/50' : 'bg-secondary'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${typeStyles[n.type] || typeStyles.general}`}>
                          {typeIcons[n.type] || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium ${n.read ? 'text-muted-foreground' : 'text-foreground'} flex items-center gap-1.5 truncate`}>
                              {isHigh && <AlertTriangle className="w-3 h-3 text-expense flex-shrink-0" />}
                              {isHigh && !n.read && <BellRing className="w-3 h-3 text-expense flex-shrink-0" />}
                              <span className="truncate">{n.title}</span>
                            </p>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-muted-foreground/70">{n.date} · {cat.replace('_', ' ')}</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                              className="w-6 h-6 rounded-md bg-expense/10 flex items-center justify-center opacity-70"
                            >
                              <Trash2 className="w-3 h-3 text-expense" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsSheet;
