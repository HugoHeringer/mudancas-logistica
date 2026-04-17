import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Fuel,
  Utensils,
  BarChart3,
  Plus,
  Trash2,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';
import { financeiroApi, downloadBlob } from '../../lib/api';
import { GlassCard } from '../../components/luxury/GlassCard';
import { GradientButton } from '../../components/luxury/GradientButton';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';

const CATEGORIAS = ['servico', 'materiais', 'combustivel', 'alimentacao', 'pagamento_motorista', 'pagamento_ajudante', 'manutencao', 'outros'] as const;

export function FinanceiroPage() {
  const queryClient = useQueryClient();
  const [dataInicio, setDataInicio] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showNewMovimento, setShowNewMovimento] = useState(false);
  const [newMov, setNewMov] = useState({
    tipo: 'receita',
    categoria: 'servico',
    descricao: '',
    valor: '',
    data: format(new Date(), 'yyyy-MM-dd'),
  });

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

  const { data: movimentos, isLoading: loadingMovimentos } = useQuery({
    queryKey: ['financeiro', 'movimentos', dataInicio, dataFim],
    queryFn: () => financeiroApi.getMovimentos({ dataInicio, dataFim }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => financeiroApi.createMovimento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro'] });
      setShowNewMovimento(false);
      setNewMov({ tipo: 'receita', categoria: 'servico', descricao: '', valor: '', data: format(new Date(), 'yyyy-MM-dd') });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeiroApi.deleteMovimento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });

  const handleCreateMovimento = () => {
    if (!newMov.descricao || !newMov.valor) return;
    createMutation.mutate({
      tipo: newMov.tipo,
      categoria: newMov.categoria,
      descricao: newMov.descricao,
      valor: parseFloat(newMov.valor),
      data: newMov.data,
    });
  };

  const handleExport = async (formato: 'xlsx' | 'csv') => {
    try {
      const response = formato === 'xlsx'
        ? await financeiroApi.exportExcel(dataInicio, dataFim)
        : await financeiroApi.exportCsv(dataInicio, dataFim);
      if (response?.data) {
        downloadBlob(response.data, `financeiro_${dataInicio}_${dataFim}.${formato === 'xlsx' ? 'xlsx' : 'csv'}`);
      }
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  const motoristaColumns: ColumnDef<any>[] = [
    { accessorKey: 'motoristaNome', header: 'Motorista' },
    { accessorKey: 'mudancasCount', header: 'Mudanças' },
    {
      accessorKey: 'receitaGerada',
      header: 'Receita',
      cell: ({ row }) => `€${(row.original.receitaGerada || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'custoMotorista',
      header: 'Pago Motorista',
      cell: ({ row }) => `€${(row.original.custoMotorista || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'custoAjudantes',
      header: 'Pago Ajudantes',
      cell: ({ row }) => `€${(row.original.custoAjudantes || 0).toFixed(2)}`,
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

  const movimentoColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'data',
      header: 'Data',
      cell: ({ row }) => row.original.data ? format(new Date(row.original.data), 'dd/MM/yyyy') : '-',
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.original.tipo === 'receita' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
        }`}>
          {row.original.tipo === 'receita' ? 'Receita' : 'Custo'}
        </span>
      ),
    },
    {
      accessorKey: 'categoria',
      header: 'Categoria',
      cell: ({ row }) => row.original.categoria?.charAt(0).toUpperCase() + row.original.categoria?.slice(1),
    },
    { accessorKey: 'descricao', header: 'Descrição' },
    {
      accessorKey: 'valor',
      header: 'Valor',
      cell: ({ row }) => (
        <span className={row.original.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
          {row.original.tipo === 'receita' ? '+' : '-'}€{(row.original.valor || 0).toFixed(2)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Eliminar este movimento?')) {
              deleteMutation.mutate(row.original.id);
            }
          }}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors"
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-light text-foreground"
            style={{ fontFamily: 'var(--tenant-font-display)' }}
          >
            Financeiro
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Receitas, custos e relatórios</p>
        </div>
        <div className="flex items-center gap-2">
          <GradientButton variant="glass" size="sm" onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </GradientButton>
          <GradientButton variant="glass" size="sm" onClick={() => handleExport('csv')}>
            <FileDown className="h-4 w-4" /> CSV
          </GradientButton>
          <GradientButton variant="gold" size="sm" onClick={() => setShowNewMovimento(!showNewMovimento)}>
            <Plus className="h-4 w-4" /> Novo Movimento
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
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </GlassCard>

      {/* New Movimento Form */}
      {showNewMovimento && (
        <GlassCard className="p-5 border-border">
          <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">Novo Movimento Manual</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Tipo</label>
              <select
                value={newMov.tipo}
                onChange={(e) => setNewMov({ ...newMov, tipo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="receita">Receita</option>
                <option value="custo">Custo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Categoria</label>
              <select
                value={newMov.categoria}
                onChange={(e) => setNewMov({ ...newMov, categoria: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/50"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Valor (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newMov.valor}
                onChange={(e) => setNewMov({ ...newMov, valor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Data</label>
              <input
                type="date"
                value={newMov.data}
                onChange={(e) => setNewMov({ ...newMov, data: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Descrição</label>
              <input
                type="text"
                placeholder="Descrição do movimento"
                value={newMov.descricao}
                onChange={(e) => setNewMov({ ...newMov, descricao: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <GradientButton variant="glass" size="sm" onClick={() => setShowNewMovimento(false)}>
              Cancelar
            </GradientButton>
            <GradientButton
              variant="gold"
              size="sm"
              onClick={handleCreateMovimento}
              disabled={!newMov.descricao || !newMov.valor || createMutation.isPending}
            >
              {createMutation.isPending ? 'A criar...' : 'Criar Movimento'}
            </GradientButton>
          </div>
        </GlassCard>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: 'Receita Total',
            value: `€${(resumo?.receitaTotal || 0).toFixed(2)}`,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-500/10',
          },
          {
            label: 'Custos Operacionais',
            value: `€${(resumo?.custosTotais || 0).toFixed(2)}`,
            icon: TrendingDown,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
          },
          {
            label: 'Materiais',
            value: `€${(resumo?.custosMateriais || 0).toFixed(2)}`,
            icon: Wallet,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            label: 'Margem',
            value: `€${(resumo?.margemTotal || 0).toFixed(2)}`,
            icon: BarChart3,
            color: (resumo?.margemTotal || 0) >= 0 ? 'text-green-600' : 'text-destructive',
            bg: (resumo?.margemTotal || 0) >= 0 ? 'bg-green-500/10' : 'bg-destructive/10',
          },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">{stat.label}</span>
                <p
                  className={`text-3xl font-light ${stat.color}`}
                  style={{ fontFamily: 'var(--tenant-font-display)' }}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} border border-border`}>
                <stat.icon className={`h-[18px] w-[18px] ${stat.color}`} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Gastos detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Combustível</span>
              <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                €{(gastos?.combustivel?.total || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground/60">{gastos?.combustivel?.porMudanca?.length || 0} registos</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-border">
              <Fuel className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Alimentação</span>
              <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                €{(gastos?.alimentacao?.total || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground/60">{gastos?.alimentacao?.porMudanca?.length || 0} registos</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-border">
              <Utensils className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Pagamento Motoristas</span>
              <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                €{(gastos?.motoristas?.totalMotoristas || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground/60">{gastos?.motoristas?.porMudanca?.length || 0} mudanças</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-border">
              <Wallet className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Pagamento Ajudantes</span>
              <p className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
                €{(gastos?.motoristas?.totalAjudantes || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground/60">Mão-de-obra auxiliar</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-border">
              <Wallet className="h-[18px] w-[18px] text-primary" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Movimentos Manuais */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
          Movimentos Financeiros
        </h3>
        <DataTable
          columns={movimentoColumns}
          data={Array.isArray(movimentos) ? movimentos : []}
          isLoading={loadingMovimentos}
          pageSize={10}
        />
      </GlassCard>

      {/* Breakdown por motorista */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
          Breakdown por Motorista
        </h3>
        <DataTable
          columns={motoristaColumns}
          data={breakdownMotoristas || []}
          isLoading={loadingMotoristas}
          pageSize={10}
        />
      </GlassCard>

      {/* Breakdown por tipo de serviço */}
      {breakdownTipo && Array.isArray(breakdownTipo) && breakdownTipo.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">
            Por Tipo de Serviço
          </h3>
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
    </div>
  );
}
