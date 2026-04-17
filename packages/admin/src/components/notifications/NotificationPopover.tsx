import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotificacoes } from '../../hooks/use-notificacoes';
import { cn } from '../../lib/utils';

const TIPO_ICONE: Record<string, string> = {
  mudanca_criada: '📋',
  mudanca_aprovada: '✅',
  mudanca_recusada: '❌',
  motorista_a_caminho: '🚛',
  mudanca_concluida: '🎉',
  mudanca_alterada: '✏️',
};

function tempoRelativo(data: string) {
  const diff = Date.now() - new Date(data).getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `${minutos}m`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas}h`;
  const dias = Math.floor(horas / 24);
  return `${dias}d`;
}

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notificacoes, totalNaoLidas, markAsRead, markAllAsRead } = useNotificacoes();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleClick = (n: any) => {
    if (!n.lida) markAsRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-sand-dark text-brown-medium hover:text-brown transition-colors"
      >
        <Bell className="h-[18px] w-[18px]" />
        {totalNaoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-terracotta text-cream text-[10px] font-bold px-1">
            {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-cream border border-gold/20 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10">
            <h3 className="text-sm font-medium text-brown">Notificações</h3>
            {totalNaoLidas > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-xs text-brown-medium hover:text-gold transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-brown-medium">
                Sem notificações
              </div>
            ) : (
              notificacoes.map((n: any) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-gold/5 hover:bg-sand-dark/50 transition-colors flex gap-3',
                    !n.lida && 'bg-gold/[0.06]'
                  )}
                >
                  <span className="text-base mt-0.5 flex-shrink-0">
                    {TIPO_ICONE[n.tipo] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm text-brown leading-snug', !n.lida && 'font-medium')}>
                      {n.mensagem}
                    </p>
                    <p className="text-xs text-brown-medium mt-0.5">
                      {tempoRelativo(n.criadaEm)}
                    </p>
                  </div>
                  {!n.lida && (
                    <span className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
