import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, Fuel, Utensils, BarChart3 } from 'lucide-react';
import { financeiroApi } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';

export function FinanceiroPage() {
  const [dataInicio, setDataInicio] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: resumo } = useQuery({
    queryKey: ['financeiro', 'resumo', dataInicio, dataFim],
    queryFn: () => financeiroApi.getResumo(dataInicio, dataFim).then((r) => r.data),
  });

  const { data: breakdownMotoristas, isLoading: loadingMotoristas } = useQuery({
    queryKey: ['financeiro', 'motoristas', dataInicio, dataFim],
    queryFn: () => financeiroApi.getBreakdownMotoristas(dataInicio, dataFim).then((r) => r.data),
  });

  const { data: breakdownTipo } = useQuery({
    queryKey: ['financeiro', 'tipo', dataInicio, dataFim],
    queryFn: () => financeiroApi.getBreakdownTipoServico(dataInicio, dataFim).then((r) => r.data),
  });

  const { data: gastos } = useQuery({
    queryKey: ['financeiro', 'gastos', dataInicio, dataFim],
    queryFn: () => financeiroApi.getGastosDetalhados(dataInicio, dataFim).then((r) => r.data),
  });

  const motoristaColumns: ColumnDef<any>[] = [
    { accessorKey: 'nome', header: 'Motorista' },
    { accessorKey: 'mudancas', header: 'Mudanças' },
    {
      accessorKey: 'receita',
      header: 'Receita',
      cell: ({ row }) => `€${(row.original.receita || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'custos',
      header: 'Custos',
      cell: ({ row }) => `€${(row.original.custos || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'margem',
      header: 'Margem',
      cell: ({ row }) => {
        const m = row.original.margem || 0;
        return <span className={m >= 0 ? 'text-green-600' : 'text-red-600'}>€{m.toFixed(2)}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financeiro</h2>
        <p className="text-muted-foreground">Receitas, custos e relatórios</p>
      </div>

      {/* Filtro de período */}
      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label>Data Início</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data Fim</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">€{(resumo?.receitaTotal || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Operacionais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">€{(resumo?.custosOperacionais || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais</CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{(resumo?.custosMateriais || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${(resumo?.margem || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{(resumo?.margem || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gastos detalhados */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Fuel className="h-5 w-5" /> Combustível</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{(gastos?.totalCombustivel || 0).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{gastos?.totalLitros || 0} litros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Alimentação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">€{(gastos?.totalAlimentacao || 0).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{gastos?.totalRefeicoes || 0} refeições</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown por motorista */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Breakdown por Motorista</h3>
        <DataTable
          columns={motoristaColumns}
          data={breakdownMotoristas || []}
          isLoading={loadingMotoristas}
        />
      </div>

      {/* Breakdown por tipo de serviço */}
      {breakdownTipo && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Serviços Normais</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="text-lg font-bold">{breakdownTipo.normal?.total || 0} mudanças</p>
              <p className="text-green-600">€{(breakdownTipo.normal?.receita || 0).toFixed(2)} receita</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Serviços Urgentes</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="text-lg font-bold">{breakdownTipo.urgente?.total || 0} mudanças</p>
              <p className="text-green-600">€{(breakdownTipo.urgente?.receita || 0).toFixed(2)} receita</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
