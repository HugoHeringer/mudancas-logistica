import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../lib/api';

export function TrocarSenhaPage() {
  const navigate = useNavigate();
  const { user, accessToken, clearRequirePasswordChange } = useAuthStore();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (novaSenha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (novaSenha !== confirmar) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', { novaSenha }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      clearRequirePasswordChange();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: 'var(--brand-surface-dark)' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="bg-primary/15 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--brand-on-surface-dark)', fontFamily: 'var(--tenant-font-display)' }}>
            Alterar Senha
          </h1>
          <p className="text-sm mt-1" style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}>
            Por segurança, defina uma nova senha antes de continuar.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)' }}>
            <p className="text-sm" style={{ color: 'var(--brand-secondary)' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}>
              Nova Senha
            </label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full px-4 py-3 bg-transparent text-sm outline-none"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)', color: 'var(--brand-on-surface-dark)' }}
              placeholder="Mínimo 8 caracteres" required />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}>
              Confirmar Senha
            </label>
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
              className="w-full px-4 py-3 bg-transparent text-sm outline-none"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)', color: 'var(--brand-on-surface-dark)' }}
              placeholder="Repita a nova senha" required />
          </div>
          <button type="submit" disabled={isLoading || !novaSenha || !confirmar}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium tracking-wider uppercase disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-surface-dark)' }}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {isLoading ? 'A guardar...' : 'Guardar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
