import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = {
  onBack: () => void;
};

type Profile = {
  id: string;
  display_name: string;
  email: string | null;
  created_at: string;
  last_active: string;
};

type ActivityLog = {
  id: string;
  user_id: string;
  action: string;
  metadata: any;
  created_at: string;
};

const AdminDashboard = ({ onBack }: Props) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, activityRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_activity').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
      if (activityRes.data) setActivities(activityRes.data as ActivityLog[]);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalUsers = profiles.length;
  const activeToday = profiles.filter(p => {
    const lastActive = new Date(p.last_active);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length;
  const newThisWeek = profiles.filter(p => {
    const created = new Date(p.created_at);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return created >= weekAgo;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-24 max-w-lg mx-auto"
    >
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <button onClick={fetchData} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="px-5 space-y-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            <p className="text-[10px] text-muted-foreground">Total Users</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Activity className="w-5 h-5 text-income mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{activeToday}</p>
            <p className="text-[10px] text-muted-foreground">Active Today</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{newThisWeek}</p>
            <p className="text-[10px] text-muted-foreground">New This Week</p>
          </div>
        </div>

        {/* User List */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">All Users</h3>
          {loading ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map(p => (
                <div key={p.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{(p.display_name || 'U')[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.display_name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Joined</p>
                    <p className="text-[10px] text-foreground font-medium">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
          {activities.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map(a => (
                <div key={a.id} className="glass-card rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">{a.action}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default AdminDashboard;
