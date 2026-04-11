import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { mudancasApi } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ESTADOS_MUDANCA_CORES } from '../../constants/estados';

export function DashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => mudancasApi.getDashboard().then((r) => r.data),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats do dia */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mudanças Hoje</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.hoje.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.hoje.mudancas.filter((m: any) => m.estado === 'em_servico').length} em curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.pendentes || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Curso</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.emCurso || 0}</div>
            <p className="text-xs text-muted-foreground">Motoristas em serviço</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(dashboard?.mes.receita || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.mes.total || 0} mudanças
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mudanças do dia */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Mudanças de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.hoje.mudancas?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma mudança agendada para hoje
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard?.hoje.mudancas?.map((mudanca: any) => (
                  <Link
                    key={mudanca.id}
                    to={`/mudancas/${mudanca.id}`}
                    className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{mudanca.clienteNome}</p>
                        <p className="text-sm text-muted-foreground">
                          {mudanca.motorista?.nome || 'Sem motorista'}
                        </p>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: ESTADOS_MUDANCA_CORES[mudanca.estado] || '#6b7280',
                          color: 'white',
                        }}
                      >
                        {mudanca.estado}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link
                to="/aprovacoes"
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Ver aprovações pendentes ({dashboard?.pendentes || 0})</span>
              </Link>
              <Link
                to="/agenda"
                className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Ver agenda</span>
              </Link>
              <Link
                to="/mudancas"
                className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <Truck className="h-5 w-5" />
                <span>Ver todas as mudanças</span>
              </Link>
              <Link
                to="/financeiro"
                className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                <span>Ver financeiro</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(dashboard?.concluidasSemFicha || 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Fichas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {dashboard?.concluidasSemFicha} mudança(s) concluída(s) sem ficha de conclusão
              preenchida.
            </p>
            <Link
              to="/mudancas?filtro=sem-ficha"
              className="text-orange-800 underline mt-2 inline-block"
            >
              Ver fichas pendentes
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
