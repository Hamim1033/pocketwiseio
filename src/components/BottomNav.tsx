import { Home, ListOrdered, PieChart, LayoutGrid, Plus } from 'lucide-react';

type Props = {
  active: string;
  onNavigate: (page: string) => void;
  onAdd: () => void;
};

const BottomNav = ({ active, onNavigate, onAdd }: Props) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'transactions', icon: ListOrdered, label: 'History' },
    { id: 'add', icon: Plus, label: 'Add', isCenter: true },
    { id: 'budget', icon: PieChart, label: 'Budget' },
    { id: 'more', icon: LayoutGrid, label: 'Modules' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/90 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={onAdd}
                className="w-14 h-14 -mt-6 rounded-full gradient-primary shadow-lg flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            );
          }
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
