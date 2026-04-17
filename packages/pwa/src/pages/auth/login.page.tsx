import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../lib/api';
import { useTenantTheme } from '../../theme/TenantProvider';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { brand } = useTenantTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [guardarSessao, setGuardarSessao] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin') {
      setSubdomain(parts[0]);
    } else {
      const stored = localStorage.getItem('tenantSubdomain');
      if (stored) setSubdomain(stored);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.login(data.email, data.password, subdomain || 'demo');
      const { user, accessToken, refreshToken } = response.data;

      if (user.perfil !== 'motorista') {
        setError('Esta app é exclusiva para motoristas.');
        return;
      }

      login(user, accessToken, refreshToken, guardarSessao);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night flex flex-col items-center justify-center p-6 relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-night via-night-light/50 to-night" />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.nome}
              className="h-12 object-contain mx-auto mb-4"
            />
          ) : (
            <h1
              className="text-2xl tracking-[0.15em] text-cream font-light mb-1"
              style={{ fontFamily: 'var(--tenant-font-display)' }}
            >
              {brand.nome?.toUpperCase() || 'MUDANCAS'}
            </h1>
          )}
          <p className="text-cream-muted text-sm">App do Motorista</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-terracotta/10 border border-terracotta/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-terracotta mt-0.5 shrink-0" />
            <p className="text-sm text-terracotta">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[10px] font-medium tracking-wider uppercase text-cream-muted"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="motorista@empresa.pt"
              {...register('email')}
              className="w-full px-4 py-3 bg-transparent border-b border-cream/20 text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none transition-colors text-sm"
            />
            {errors.email && (
              <p className="text-xs text-terracotta mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[10px] font-medium tracking-wider uppercase text-cream-muted"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••"
              {...register('password')}
              className="w-full px-4 py-3 bg-transparent border-b border-cream/20 text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none transition-colors text-sm"
            />
            {errors.password && (
              <p className="text-xs text-terracotta mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="guardarSessao" className="text-sm text-cream-muted cursor-pointer">Guardar sessão</label>
              <button
                type="button"
                role="switch"
                aria-checked={guardarSessao}
                onClick={() => setGuardarSessao(!guardarSessao)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  guardarSessao ? 'bg-gold' : 'bg-cream/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-night transition-transform ${
                    guardarSessao ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gold text-night text-sm font-medium tracking-wider uppercase hover:bg-gold-light transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A entrar...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-cream/30 tracking-wider">
          Esqueceu a senha? Contacte o administrador.
        </p>
      </div>
    </div>
  );
}
