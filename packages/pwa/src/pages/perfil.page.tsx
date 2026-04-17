import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Truck, LogOut, Info } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { motoristasApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: motorista } = useQuery({
    queryKey: ['motorista', 'me'],
    queryFn: () => motoristasApi.getMe().then((r) => r.data),
    enabled: !!user?.motoristaId,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-sand pb-20">
      <header className="bg-night text-cream p-4">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--tenant-font-display)' }}>Perfil</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center py-4">
          <div className="bg-gold/15 rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <User className="h-10 w-10 text-gold" />
          </div>
          <h2 className="text-xl font-bold text-brown" style={{ fontFamily: 'var(--tenant-font-display)' }}>{user?.nome}</h2>
          <p className="text-brown-medium/60 text-sm">{user?.email}</p>
        </div>

        {/* Dados pessoais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-brown-medium/60">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-brown">
              <Mail className="h-4 w-4 text-gold" />
              <span className="text-sm">{user?.email}</span>
            </div>
            {motorista?.telefone && (
              <div className="flex items-center gap-3 text-brown">
                <Phone className="h-4 w-4 text-gold" />
                <span className="text-sm">{motorista.telefone}</span>
              </div>
            )}
            {motorista?.cartaConducao && (
              <div className="flex items-center gap-3 text-brown">
                <Truck className="h-4 w-4 text-gold" />
                <span className="text-sm">Carta: {motorista.cartaConducao}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Veículo */}
        {motorista?.veiculo && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-brown-medium/60">Veículo Atribuído</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-brown">{motorista.veiculo.nome}</p>
              <p className="text-sm text-brown-medium/60">{motorista.veiculo.matricula} • {motorista.veiculo.metrosCubicos}m³</p>
            </CardContent>
          </Card>
        )}

        {/* App info */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Info className="h-4 w-4 text-gold" />
            <div className="flex-1">
              <p className="text-sm text-brown-medium/60">Versão da app</p>
              <p className="text-xs text-brown-medium/40">1.0.0</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-terracotta border-terracotta/20 hover:bg-terracotta/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Terminar Sessão
        </Button>
      </main>
    </div>
  );
}
