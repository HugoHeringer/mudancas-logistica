import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  tenantId: z.string().min(1, 'Código da empresa obrigatório'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantId: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.login(data.email, data.password, data.tenantId);
      const { user, accessToken, refreshToken } = response.data;

      if (user.perfil !== 'motorista') {
        setError('Esta app é exclusiva para motoristas.');
        return;
      }

      login(user, accessToken, refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="bg-blue-600 rounded-2xl p-3 w-16 h-16 mx-auto flex items-center justify-center">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Mudanças</h1>
          <p className="text-gray-500">App do Motorista</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="motorista@empresa.pt" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantId">Código da Empresa</Label>
            <Input id="tenantId" type="text" placeholder="ID da empresa" {...register('tenantId')} />
            {errors.tenantId && <p className="text-sm text-red-600">{errors.tenantId.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A entrar...</> : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
