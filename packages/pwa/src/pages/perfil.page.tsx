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
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Perfil</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center py-4">
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">{user?.nome}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>

        {/* Dados pessoais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{user?.email}</span>
            </div>
            {motorista?.telefone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{motorista.telefone}</span>
              </div>
            )}
            {motorista?.cartaConducao && (
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Carta: {motorista.cartaConducao}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Veículo */}
        {motorista?.veiculo && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Veículo Atribuído</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{motorista.veiculo.nome}</p>
              <p className="text-sm text-gray-500">{motorista.veiculo.matricula} • {motorista.veiculo.metrosCubicos}m³</p>
            </CardContent>
          </Card>
        )}

        {/* App info */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Info className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Versão da app</p>
              <p className="text-xs text-gray-400">1.0.0</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Terminar Sessão
        </Button>
      </main>
    </div>
  );
}
