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
  empresa: z.string().min(1, 'Indique o ID da sua empresa'),
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
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { empresa: subdomain },
  });

  // Keep form empresa field in sync with auto-detected subdomain
  useEffect(() => {
    if (subdomain) {
      setValue('empresa', subdomain);
    }
  }, [subdomain, setValue]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login(data.email, data.password, data.empresa);
      const { user, accessToken, refreshToken, requirePasswordChange } = response.data;

      if (user.perfil !== 'motorista') {
        setError('Esta app é exclusiva para motoristas.');
        return;
      }

      // Remember the empresa slug for next login
      localStorage.setItem('tenantSubdomain', data.empresa);

      login(user, accessToken, refreshToken, guardarSessao);

      if (requirePasswordChange) {
        navigate('/trocar-senha');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{ backgroundColor: 'var(--brand-surface-dark)' }}
    >
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, var(--brand-surface-dark), color-mix(in srgb, var(--sidebar-bg-elevated, #141B2D) 50%, transparent), var(--brand-surface-dark))`,
        }}
      />

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
              className="text-2xl tracking-[0.15em] font-light mb-1"
              style={{
                color: 'var(--brand-on-surface-dark)',
                fontFamily: 'var(--tenant-font-display)',
              }}
            >
              {brand.nome?.toUpperCase() || 'MOVEFY'}
            </h1>
          )}
          <p
            className="text-sm"
            style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}
          >
            App do Motorista
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded-lg"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-secondary) 20%, transparent)',
            }}
          >
            <AlertCircle
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: 'var(--brand-secondary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--brand-secondary)' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="empresa"
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}
            >
              Empresa
            </label>
            <input
              id="empresa"
              type="text"
              placeholder="ID da sua empresa"
              {...register('empresa')}
              className="w-full px-4 py-3 bg-transparent text-sm transition-colors outline-none"
              style={{
                borderBottom: '1px solid color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)',
                color: 'var(--brand-on-surface-dark)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--brand-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)')}
            />
            <p
              className="text-[9px]"
              style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 30%, transparent)' }}
            >
              O seu gestor fornece este código
            </p>
            {errors.empresa && (
              <p className="text-xs mt-1" style={{ color: 'var(--brand-secondary)' }}>{errors.empresa.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="motorista@empresa.pt"
              {...register('email')}
              className="w-full px-4 py-3 bg-transparent text-sm transition-colors outline-none"
              style={{
                borderBottom: '1px solid color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)',
                color: 'var(--brand-on-surface-dark)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--brand-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)')}
            />
            {errors.email && (
              <p className="text-xs mt-1" style={{ color: 'var(--brand-secondary)' }}>{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••"
              {...register('password')}
              className="w-full px-4 py-3 bg-transparent text-sm transition-colors outline-none"
              style={{
                borderBottom: '1px solid color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)',
                color: 'var(--brand-on-surface-dark)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--brand-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)')}
            />
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: 'var(--brand-secondary)' }}>{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <label
                htmlFor="guardarSessao"
                className="text-sm cursor-pointer"
                style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}
              >
                Guardar sessão
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={guardarSessao}
                onClick={() => setGuardarSessao(!guardarSessao)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: guardarSessao ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-on-surface-dark) 20%, transparent)',
                }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full transition-transform"
                  style={{
                    backgroundColor: 'var(--brand-surface-dark)',
                    transform: guardarSessao ? 'translateX(24px)' : 'translateX(4px)',
                  }}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-300 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--brand-accent)',
                color: 'var(--brand-surface-dark)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
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
        <p
          className="text-center text-[10px] tracking-wider"
          style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 25%, transparent)' }}
        >
          Esqueceu a senha? Contacte o administrador.
        </p>
      </div>
    </div>
  );
}
