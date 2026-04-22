import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { GradientButton } from '../../components/luxury/GradientButton';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subdomain, setSubdomain] = useState('');

  // Detect subdomain from URL (e.g., empresa.mudancas.pt)
  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin') {
      setSubdomain(parts[0]);
    } else {
      // Fallback: check URL params or localStorage
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

    try {
      if (!subdomain) {
        toast({
          title: 'Empresa obrigatória',
          description: 'Por favor, indique o subdomain da sua empresa',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const response = await authApi.login(data.email, data.password, subdomain);
      const { user, accessToken, refreshToken } = response.data;

      login(user, accessToken, refreshToken);

      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo ao sistema.',
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: error.response?.data?.message || 'Credenciais inválidas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <span className="section-label">Iniciar Sessão</span>
        <h2
          className="text-3xl font-light text-foreground mt-2"
          style={{ fontFamily: 'var(--tenant-font-display)' }}
        >
          Bem-vindo de volta
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
          Introduza as suas credenciais para aceder ao sistema
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="subdomain"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Empresa (subdomain)
          </label>
          <input
            id="subdomain"
            type="text"
            placeholder="minha-empresa"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors text-sm"
          />
          <p className="text-xs text-muted-foreground/50">ex: demo, minha-empresa</p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@empresa.pt"
            {...register('email')}
            className="w-full px-4 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors text-sm"
          />
          {errors.email && (
            <p className="text-xs text-terracotta mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="w-full px-4 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors text-sm"
          />
          {errors.password && (
            <p className="text-xs text-terracotta mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="pt-2">
          <GradientButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
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
          </GradientButton>
        </div>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground/60 tracking-wide">
        Esqueceu a senha? Contacte o administrador.
      </p>
    </div>
  );
}
