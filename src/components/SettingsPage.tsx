import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Moon, Sun, Bell, Shield, Database, ChevronRight, Lock, Unlock, UserPlus, LogOut } from 'lucide-react';
import { useAppData } from '@/contexts/AppContext';
import { currencies } from '@/lib/currencies';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PinSetupModal from '@/components/PinSetupModal';
import AuthModal from '@/components/AuthModal';

const SettingsPage = () => {
  const { settings, updateSettings, t, hasPin, setPin, removePin } = useAppData();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setAuthUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  const handleCurrencyChange = (code: string) => {
    const c = currencies.find(c => c.code === code);
    if (c) {
      updateSettings({ currency: c.code, currencySymbol: c.symbol });
      toast.success(`Currency changed to ${c.name}`);
    }
  };

  const handleExportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('sw_transactions') || '[]'),
      budgets: JSON.parse(localStorage.getItem('sw_budgets') || '[]'),
      goals: JSON.parse(localStorage.getItem('sw_goals') || '[]'),
      settings: JSON.parse(localStorage.getItem('sw_settings') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendwise-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.transactions) localStorage.setItem('sw_transactions', JSON.stringify(data.transactions));
          if (data.budgets) localStorage.setItem('sw_budgets', JSON.stringify(data.budgets));
          if (data.goals) localStorage.setItem('sw_goals', JSON.stringify(data.goals));
          if (data.settings) localStorage.setItem('sw_settings', JSON.stringify(data.settings));
          toast.success('Data imported! Refreshing...');
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          toast.error('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleTogglePin = () => {
    if (hasPin) {
      removePin();
      toast.success('PIN lock removed');
    } else {
      setShowPinSetup(true);
    }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</h3>
      <div className="glass-card rounded-xl overflow-hidden divide-y divide-border/50">
        {children}
      </div>
    </div>
  );

  const Row = ({ icon: Icon, label, right, onClick }: { icon: any; label: string; right: React.ReactNode; onClick?: () => void }) => (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${onClick ? 'cursor-pointer hover:bg-secondary/50 active:bg-secondary/70 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {right}
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-muted'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      <Section title={t('profile')}>
        <div className="px-4 py-3.5">
          <label className="text-xs text-muted-foreground mb-1 block">Name</label>
          <Input
            value={settings.profileName}
            onChange={e => updateSettings({ profileName: e.target.value })}
            className="bg-secondary border-0 rounded-lg h-9 text-sm"
          />
        </div>
        <div className="px-4 py-3.5">
          <label className="text-xs text-muted-foreground mb-1 block">Email</label>
          <Input
            value={settings.profileEmail}
            onChange={e => updateSettings({ profileEmail: e.target.value })}
            className="bg-secondary border-0 rounded-lg h-9 text-sm"
          />
        </div>
      </Section>

      <Section title="Preferences">
        <Row
          icon={Globe}
          label={t('currency')}
          right={
            <select
              value={settings.currency}
              onChange={e => handleCurrencyChange(e.target.value)}
              className="bg-secondary rounded-lg px-2 py-1 text-xs text-foreground border-0"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
          }
        />
        <Row
          icon={Globe}
          label={t('language')}
          right={
            <select
              value={settings.language}
              onChange={e => updateSettings({ language: e.target.value as 'en' | 'bn' })}
              className="bg-secondary rounded-lg px-2 py-1 text-xs text-foreground border-0"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          }
        />
        <Row
          icon={settings.darkMode ? Moon : Sun}
          label={t('darkMode')}
          right={<Toggle value={settings.darkMode} onChange={v => updateSettings({ darkMode: v })} />}
        />
      </Section>

      <Section title={t('notificationSettings')}>
        <Row
          icon={Bell}
          label="All Notifications"
          right={<Toggle value={settings.notificationsEnabled} onChange={v => updateSettings({ notificationsEnabled: v })} />}
        />
        <Row
          icon={Bell}
          label={t('budgetAlerts')}
          right={<Toggle value={settings.budgetAlerts} onChange={v => updateSettings({ budgetAlerts: v })} />}
        />
        <Row
          icon={Bell}
          label={t('billReminders')}
          right={<Toggle value={settings.billReminders} onChange={v => updateSettings({ billReminders: v })} />}
        />
        <Row
          icon={Bell}
          label={t('goalReminders')}
          right={<Toggle value={settings.goalReminders} onChange={v => updateSettings({ goalReminders: v })} />}
        />
      </Section>

      <Section title="Security">
        <Row
          icon={hasPin ? Lock : Unlock}
          label="App Lock (PIN)"
          right={
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${hasPin ? 'text-income' : 'text-muted-foreground'}`}>
                {hasPin ? 'Enabled' : 'Disabled'}
              </span>
              <Toggle value={hasPin} onChange={handleTogglePin} />
            </div>
          }
        />
      </Section>

      <Section title="Data">
        <Row
          icon={Database}
          label="Export Backup"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={handleExportData}
        />
        <Row
          icon={Database}
          label="Import Backup"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={handleImportData}
        />
      </Section>

      <PinSetupModal open={showPinSetup} onClose={() => setShowPinSetup(false)} onSetPin={setPin} />
    </motion.div>
  );
};

export default SettingsPage;
