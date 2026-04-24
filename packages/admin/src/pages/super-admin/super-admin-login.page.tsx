import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminApi } from '../../lib/api';
import { useSuperAdminStore } from '../../stores/super-admin.store';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield } from 'lucide-react';

export function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useSuperAdminStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await superAdminApi.login(email, password);
      login(email, data.accessToken);
      navigate('/super-admin');
    } catch {
      toast({ title: 'Credenciais inválidas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      <Card className="w-full max-w-md bg-night-light border-gold/20 relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gold" />
          </div>
          <CardTitle className="text-2xl text-cream font-light tracking-wide">
            Super Admin
          </CardTitle>
          <p className="text-cream/50 text-sm">Acesso restrito à plataforma</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-cream/70">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mudancas-logistica.pt"
                className="bg-night border-gold/20 text-cream placeholder:text-cream/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cream/70">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-night border-gold/20 text-cream"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold/90 text-night font-medium"
              disabled={loading}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
