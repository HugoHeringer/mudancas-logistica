import { WifiOff } from 'lucide-react';
import { useOnline } from '../hooks/use-online';

export function OfflineIndicator() {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-terracotta text-cream text-center py-1.5 text-sm font-medium z-[100] flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      Sem ligação — dados podem estar desatualizados
    </div>
  );
}
