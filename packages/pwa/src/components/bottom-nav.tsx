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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-400'
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
