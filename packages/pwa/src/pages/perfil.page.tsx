import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Truck, LogOut, Info, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { api, motoristasApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (novaSenha.length < 8) {
      setPwError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (novaSenha !== confirmar) {
      setPwError('As senhas não coincidem');
      return;
    }

    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { senhaAtual, novaSenha });
      setPwSuccess(true);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmar('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPwSuccess(false);
      }, 1500);
    } catch (err: any) {
      setPwError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setPwLoading(false);
    }
  };

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
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-night text-cream p-4">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--tenant-font-display)' }}>Perfil</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center py-4">
          <div className="bg-primary/15 rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>{user?.nome}</h2>
          <p className="text-muted-foreground/60 text-sm">{user?.email}</p>
        </div>

        {/* Dados pessoais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">{user?.email}</span>
            </div>
            {motorista?.telefone && (
              <div className="flex items-center gap-3 text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">{motorista.telefone}</span>
              </div>
            )}
            {motorista?.cartaConducao && (
              <div className="flex items-center gap-3 text-foreground">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-sm">Carta: {motorista.cartaConducao}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Veículo */}
        {motorista?.veiculo && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">Veículo Atribuído</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-foreground">{motorista.veiculo.nome}</p>
              <p className="text-sm text-muted-foreground/60">{motorista.veiculo.matricula} • {motorista.veiculo.metrosCubicos}m³</p>
            </CardContent>
          </Card>
        )}

        {/* Segurança */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            {!showChangePassword ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowChangePassword(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                {pwError && (
                  <p className="text-xs text-red-500">{pwError}</p>
                )}
                {pwSuccess && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Senha alterada com sucesso
                  </p>
                )}
                <div>
                  <label className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground/60">Senha Atual</label>
                  <input
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-transparent border-b border-muted-foreground/20 outline-none text-foreground"
                    placeholder="Senha atual"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground/60">Nova Senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-transparent border-b border-muted-foreground/20 outline-none text-foreground"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground/60">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-transparent border-b border-muted-foreground/20 outline-none text-foreground"
                    placeholder="Repita a nova senha"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPwError('');
                      setSenhaAtual('');
                      setNovaSenha('');
                      setConfirmar('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                    disabled={pwLoading || !senhaAtual || !novaSenha || !confirmar}
                  >
                    {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* App info */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Info className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground/60">Versão da app</p>
              <p className="text-xs text-muted-foreground/40">1.0.0</p>
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
