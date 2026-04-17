import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart3,
  FileSpreadsheet,
  FileDown,
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  Package,
  Wallet,
  ArrowUpDown,
  Fuel,
  Utensils,
} from 'lucide-react';
import { financeiroApi, mudancasApi, motoristasApi, downloadBlob } from '../../lib/api';
import { GlassCard } from '../../components/luxury/GlassCard';
import { CardSkeleton } from '../../components/ui/skeleton';
import { GradientButton } from '../../components/luxury/GradientButton';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';

type ReportType = 'operacional' | 'financeiro' | 'equipa' | 'materiais';

export function RelatoriosPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('operacional');
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  // Financeiro queries
  const { data: resumo, isLoading: loadingResumo } = useQuery({
    queryKey: ['financeiro', 'resumo', dataInicio, dataFim],
    queryFn: () => financeiroApi.getResumo(dataInicio, dataFim).then((r) => r.data),
    enabled: activeReport === 'financeiro',
  });

  const { data: breakdownMotoristas, isLoading: loadingMotoristas } = useQuery({
    queryKey: ['financeiro', 'motoristas', dataInicio, dataFim],
    queryFn: () => financeiroApi.getBreakdownMotoristas(dataInicio, dataFim).then((r) => r.data),
    enabled: activeReport === 'equipa' || activeReport === 'financeiro',
  });

  const { data: breakdownTipo, isLoading: loadingTipo } = useQuery({
    queryKey: ['financeiro', 'tipo', dataInicio, dataFim],
    queryFn: () => financeiroApi.getBreakdownTipoServico(dataInicio, dataFim).then((r) => r.data),
    enabled: activeReport === 'operacional',
  });

  const { data: gastos, isLoading: loadingGastos } = useQuery({
    queryKey: ['financeiro', 'gastos', dataInicio, dataFim],
    queryFn: () => financeiroApi.getGastosDetalhados(dataInicio, dataFim).then((r) => r.data),
    enabled: activeReport === 'materiais',
  });

  const { data: mudancas, isLoading: loadingMudancas } = useQuery({
    queryKey: ['mudancas', 'all', dataInicio, dataFim],
    queryFn: () =>
      mudancasApi
        .findAll({
          dataInicio,
          dataFim,
          page: 1,
          limit: 1000,
        })
        .then((r) => r.data),
    enabled: activeReport === 'operacional',
  });

  const { data: motoristasList, isLoading: loadingMotoristasList } = useQuery({
    queryKey: ['motoristas', 'all'],
    queryFn: () => motoristasApi.findAll().then((r) => r.data),
    enabled: activeReport === 'equipa',
  });

  const periodoLabel = `${format(new Date(dataInicio), 'dd MMM yyyy', { locale: ptBR })} — ${format(new Date(dataFim), 'dd MMM yyyy', { locale: ptBR })}`;

  const handleExport = async (tipo: 'xlsx' | 'csv', modulo: 'mudancas' | 'financeiro' | 'clientes') => {
    try {
      let response: any;
      if (modulo === 'mudancas') {
        response = tipo === 'xlsx'
          ? await mudancasApi.exportExcel({ dataInicio, dataFim })
          : await mudancasApi.exportCsv({ dataInicio, dataFim });
      } else if (modulo === 'financeiro') {
        response = tipo === 'xlsx'
          ? await financeiroApi.exportExcel(dataInicio, dataFim)
          : await financeiroApi.exportCsv(dataInicio, dataFim);
      }
      if (response?.data) {
        const filename = `relatorio_${modulo}_${dataInicio}_${dataFim}.${tipo === 'xlsx' ? 'xlsx' : 'csv'}`;
        downloadBlob(response.data, filename);
      }
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  const reports: { key: ReportType; label: string; icon: any }[] = [
    { key: 'operacional', label: 'Operacional', icon: Truck },
    { key: 'financeiro', label: 'Financeiro', icon: Wallet },
    { key: 'equipa', label: 'Equipa', icon: Users },
    { key: 'materiais', label: 'Materiais', icon: Package },
  ];

  // --- Operacional Report ---
  const operacionalStats = (() => {
    if (!mudancas) return null;
    const list = Array.isArray(mudancas) ? mudancas : (mudancas as any)?.items || [];
    const total = list.length;
    const concluidas = list.filter((m: any) => m.estado === 'concluida').length;
    const canceladas = list.filter((m: any) => m.estado === 'cancelada').length;
    const pendentes = list.filter((m: any) => m.estado === 'pendente').length;
    const emCurso = list.filter((m: any) => ['aprovada', 'em_deslocamento', 'em_servico'].includes(m.estado)).length;
    const urgente = list.filter((m: any) => m.tipoServico === 'urgente').length;
    const receitaTotal = list.reduce((acc: number, m: any) => acc + (m.receitaRealizada || 0), 0);
    return { total, concluidas, canceladas, pendentes, emCurso, urgente, receitaTotal };
  })();

  const mudancaColumns: ColumnDef<any>[] = [
    { accessorKey: 'clienteNome', header: 'Cliente' },
    { accessorKey: 'estado', header: 'Estado' },
    { accessorKey: 'tipoServico', header: 'Tipo' },
    {
      accessorKey: 'dataPretendida',
      header: 'Data',
      cell: ({ row }) => row.original.dataPretendida ? format(new Date(row.original.dataPretendida), 'dd/MM/yyyy') : '-',
    },
    {
      accessorKey: 'receitaRealizada',
      header: 'Receita',
      cell: ({ row }) => `€${(row.original.receitaRealizada || 0).toFixed(2)}`,
    },
  ];

  // --- Financeiro Report ---
  const motoristaFinanceiroColumns: ColumnDef<any>[] = [
    { accessorKey: 'motoristaNome', header: 'Motorista' },
    { accessorKey: 'mudancasCount', header: 'Mudanças' },
    {
      accessorKey: 'receitaGerada',
      header: 'Receita',
      cell: ({ row }) => `€${(row.original.receitaGerada || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'custosCombustivel',
      header: 'Combustível',
      cell: ({ row }) => `€${(row.original.custosCombustivel || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'custosAlimentacao',
      header: 'Alimentação',
      cell: ({ row }) => `€${(row.original.custosAlimentacao || 0).toFixed(2)}`,
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

  // --- Equipa Report ---
  const equipaColumns: ColumnDef<any>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'estado', header: 'Estado' },
    {
      accessorKey: 'mudancasCount',
      header: 'Mudanças Concluídas',
      cell: ({ row }) => {
        const bd = (breakdownMotoristas || []).find((b: any) => b.motoristaId === row.original.id);
        return bd?.mudancasCount || 0;
      },
    },
    {
      accessorKey: 'receita',
      header: 'Receita Gerada',
      cell: ({ row }) => {
        const bd = (breakdownMotoristas || []).find((b: any) => b.motoristaId === row.original.id);
        return `€${(bd?.receitaGerada || 0).toFixed(2)}`;
      },
    },
    {
      accessorKey: 'margem',
      header: 'Margem',
      cell: ({ row }) => {
        const bd = (breakdownMotoristas || []).find((b: any) => b.motoristaId === row.original.id);
        const m = bd?.margem || 0;
        return <span className={m >= 0 ? 'text-green-600' : 'text-red-600'}>€{m.toFixed(2)}</span>;
      },
    },
  ];

  const isLoading =
    (activeReport === 'operacional' && (loadingMudancas || loadingTipo)) ||
    (activeReport === 'financeiro' && (loadingResumo || loadingMotoristas)) ||
    (activeReport === 'equipa' && (loadingMotoristasList || loadingMotoristas)) ||
    (activeReport === 'materiais' && loadingGastos);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-light text-foreground"
            style={{ fontFamily: 'var(--tenant-font-display)' }}
          >
            Relatórios
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{periodoLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <GradientButton
            variant="glass"
            size="sm"
            onClick={() => handleExport('xlsx', activeReport === 'financeiro' || activeReport === 'materiais' ? 'financeiro' : 'mudancas')}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </GradientButton>
          <GradientButton
            variant="glass"
            size="sm"
            onClick={() => handleExport('csv', activeReport === 'financeiro' || activeReport === 'materiais' ? 'financeiro' : 'mudancas')}
          >
            <FileDown className="h-4 w-4" />
            CSV
          </GradientButton>
        </div>
      </div>

      {/* Date Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </GlassCard>

      {/* Report Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reports.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 whitespace-nowrap ${
              activeReport === r.key
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground/70 hover:text-foreground hover:bg-primary/[0.05] border border-transparent'
            }`}
          >
            <r.icon className="h-4 w-4" />
            {r.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <CardSkeleton />
        </div>
      )}

      {/* Operacional Report */}
      {!isLoading && activeReport === 'operacional' && operacionalStats && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Mudanças', value: operacionalStats.total, icon: Truck, color: 'text-primary' },
              { label: 'Concluídas', value: operacionalStats.concluidas, icon: TrendingUp, color: 'text-green-600' },
              { label: 'Em Curso', value: operacionalStats.emCurso, icon: ArrowUpDown, color: 'text-blue-600' },
              { label: 'Receita', value: `€${operacionalStats.receitaTotal.toFixed(2)}`, icon: Wallet, color: 'text-primary' },
            ].map((stat) => (
              <GlassCard key={stat.label} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">{stat.label}</span>
                    <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/15">
                    <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Tipo de Serviço */}
          {breakdownTipo && Array.isArray(breakdownTipo) && breakdownTipo.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">Por Tipo de Serviço</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {breakdownTipo.map((bt: any) => (
                  <div key={bt.tipo} className="p-4 rounded-lg border border-border">
                    <p className="text-xs tracking-wider uppercase text-muted-foreground/60 mb-2">
                      {bt.tipo === 'urgente' ? 'Urgente' : 'Normal'}
                    </p>
                    <p className="text-2xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                      {bt.quantidade || bt.total || 0} mudanças
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      €{(bt.receitaTotal || bt.receita || 0).toFixed(2)} receita
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Summary Table */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">Detalhe de Mudanças</h3>
            <DataTable
              columns={mudancaColumns}
              data={Array.isArray(mudancas) ? mudancas : (mudancas as any)?.items || []}
              pageSize={10}
            />
          </GlassCard>
        </div>
      )}

      {/* Financeiro Report */}
      {!isLoading && activeReport === 'financeiro' && resumo && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Receita Total', value: `€${(resumo.receitaTotal || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600' },
              { label: 'Custos Totais', value: `€${(resumo.custosTotais || 0).toFixed(2)}`, icon: TrendingDown, color: 'text-red-600' },
              { label: 'Margem', value: `€${(resumo.margemTotal || 0).toFixed(2)}`, icon: BarChart3, color: (resumo.margemTotal || 0) >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Margem %', value: `${(resumo.margemPercentual || 0).toFixed(1)}%`, icon: ArrowUpDown, color: (resumo.margemPercentual || 0) >= 0 ? 'text-green-600' : 'text-red-600' },
            ].map((stat) => (
              <GlassCard key={stat.label} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">{stat.label}</span>
                    <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/15">
                    <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-5">
            <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">Breakdown por Motorista</h3>
            <DataTable
              columns={motoristaFinanceiroColumns}
              data={breakdownMotoristas || []}
              pageSize={10}
            />
          </GlassCard>
        </div>
      )}

      {/* Equipa Report */}
      {!isLoading && activeReport === 'equipa' && (
        <div className="space-y-6">
          <GlassCard className="p-5">
            <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
              Performance da Equipa
            </h3>
            <DataTable
              columns={equipaColumns}
              data={Array.isArray(motoristasList) ? motoristasList : (motoristasList as any)?.items || []}
              isLoading={loadingMotoristasList}
              pageSize={10}
            />
          </GlassCard>

          {/* Overall team stats */}
          {breakdownMotoristas && Array.isArray(breakdownMotoristas) && (
            <div className="grid gap-4 md:grid-cols-3">
              <GlassCard className="p-5">
                <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Total Motoristas</span>
                <p className="text-3xl font-light text-foreground mt-2" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                  {breakdownMotoristas.length}
                </p>
              </GlassCard>
              <GlassCard className="p-5">
                <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Receita Equipa</span>
                <p className="text-3xl font-light text-green-600 mt-2" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                  €{breakdownMotoristas.reduce((acc: number, b: any) => acc + (b.receitaGerada || 0), 0).toFixed(2)}
                </p>
              </GlassCard>
              <GlassCard className="p-5">
                <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Margem Equipa</span>
                <p className="text-3xl font-light text-foreground mt-2" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                  €{breakdownMotoristas.reduce((acc: number, b: any) => acc + (b.margem || 0), 0).toFixed(2)}
                </p>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {/* Materiais Report */}
      {!isLoading && activeReport === 'materiais' && gastos && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Combustível</span>
                  <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                    €{(gastos.combustivel?.total || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground/60">{gastos.combustivel?.porMudanca?.length || 0} registos</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/15">
                  <Fuel className="h-[18px] w-[18px] text-gold" />
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Alimentação</span>
                  <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                    €{(gastos.alimentacao?.total || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground/60">{gastos.alimentacao?.porMudanca?.length || 0} registos</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/15">
                  <Utensils className="h-[18px] w-[18px] text-gold" />
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">Gastos Detalhados</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Combustivel detail */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-gold" /> Combustível por Mudança
                </h4>
                <div className="space-y-2">
                  {(gastos.combustivel?.porMudanca || []).map((c: any) => (
                    <div key={c.mudancaId} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Mudança {c.mudancaId?.slice(0, 8)}...</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">€{(c.valor || 0).toFixed(2)}</p>
                        {c.litros && <p className="text-xs text-muted-foreground/60">{c.litros}L</p>}
                      </div>
                    </div>
                  ))}
                  {(!gastos.combustivel?.porMudanca || gastos.combustivel.porMudanca.length === 0) && (
                    <p className="text-sm text-muted-foreground/60 text-center py-4">Sem registos de combustível</p>
                  )}
                </div>
              </div>

              {/* Alimentacao detail */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-gold" /> Alimentação por Mudança
                </h4>
                <div className="space-y-2">
                  {(gastos.alimentacao?.porMudanca || []).map((a: any) => (
                    <div key={a.mudancaId} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm text-muted-foreground">Mudança {a.mudancaId?.slice(0, 8)}...</span>
                      <p className="text-sm font-medium text-foreground">€{(a.valor || 0).toFixed(2)}</p>
                    </div>
                  ))}
                  {(!gastos.alimentacao?.porMudanca || gastos.alimentacao.porMudanca.length === 0) && (
                    <p className="text-sm text-muted-foreground/60 text-center py-4">Sem registos de alimentação</p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
