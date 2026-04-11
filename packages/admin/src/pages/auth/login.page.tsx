import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  tenantId: z.string().uuid('ID do tenant inválido'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(data.email, data.password, data.tenantId);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@empresa.pt"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenantId">ID do Tenant</Label>
        <Input
          id="tenantId"
          type="text"
          placeholder="uuid-do-tenant"
          {...register('tenantId')}
        />
        {errors.tenantId && (
          <p className="text-sm text-red-600">{errors.tenantId.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            A entrar...
          </>
        ) : (
          'Entrar'
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Esqueceu a senha? Contacte o administrador.
      </p>
    </form>
  );
}
