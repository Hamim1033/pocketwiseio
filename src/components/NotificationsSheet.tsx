import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell, Trash2 } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

type Props = { open: boolean; onClose: () => void };

const NotificationsSheet = ({ open, onClose }: Props) => {
  const { notifications, markNotificationRead, clearNotifications, t } = useAppData();
  const unread = notifications.filter(n => !n.read).length;

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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{t('notifications')}</h2>
                {unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-expense text-primary-foreground text-[10px] font-bold">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-expense font-medium flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all ${n.read ? 'bg-secondary/50' : 'bg-secondary'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${typeStyles[n.type] || typeStyles.general}`}>
                        {typeIcons[n.type] || '🔔'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{n.date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsSheet;
