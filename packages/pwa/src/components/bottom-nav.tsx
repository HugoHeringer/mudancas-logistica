import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import { cn } from './utils';

const tabs = [
  { path: '/', label: 'Agenda', icon: Calendar },
  { path: '/historico', label: 'Histórico', icon: Clock },
  { path: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-night border-t border-gold/10 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-300',
                isActive ? 'text-gold' : 'text-cream/40 hover:text-cream/60'
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] tracking-wider font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
