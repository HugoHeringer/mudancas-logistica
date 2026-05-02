import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Truck, Search, Plus } from 'lucide-react';
import { mudancasApi, motoristasApi } from '../../lib/api';
import { formatDateOnly } from '@mudancas/shared';
import { StatusBadge } from '../../components/status-badge';
import { EmptyState } from '../../components/empty-state';
import { DataTable } from '../../components/data-table';
import { PageHeader } from '../../components/ui/page-header';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

interface Mudanca {
  id: string;
  clienteNome: string;
  clienteEmail: string;
  dataPretendida: string;
  horaPretendida?: string;
  tipoServico: string;
  equipa: string;
  estado: string;
  motorista?: { id: string; nome: string };
  veiculo?: { id: string; nome: string };
  createdAt: string;
}

const EQUIPA_LABELS: Record<string, string> = {
  motorista: 'Motorista',
  motorista_1_ajudante: 'Mot. + 1 Aj.',
  motorista_2_ajudantes: 'Mot. + 2 Aj.',
};

export function MudancasPage() {
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMotorista, setFiltroMotorista] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  const { data: mudancasData, isLoading } = useQuery({
    queryKey: ['mudancas', filtroEstado, filtroTipo, filtroMotorista],
    queryFn: async () => {
      const filters: any = {};
      if (filtroEstado === 'todos') {
        filters.estado = ['aprovada', 'a_caminho', 'em_servico', 'concluida', 'cancelada'];
      } else {
        filters.estado = [filtroEstado];
      }
      if (filtroTipo !== 'todos') filters.tipoServico = filtroTipo;
      if (filtroMotorista !== 'todos') filters.motoristaId = filtroMotorista;
      const res = await mudancasApi.findAll(filters);
      return res.data?.items || res.data || [];
    },
  });

  const mudancas = mudancasData || [];

  const { data: motoristas } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => motoristasApi.findAll().then((r) => r.data),
  });

  const filteredData = (mudancas || []).filter((m: Mudanca) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      m.clienteNome?.toLowerCase().includes(termo) ||
      m.clienteEmail?.toLowerCase().includes(termo) ||
      m.id?.toLowerCase().includes(termo)
    );
  });

  const columns: ColumnDef<Mudanca>[] = [
    {
      accessorKey: 'dataPretendida',
      header: 'Data',
      cell: ({ row }) => {
        const data = row.original.dataPretendida;
        const hora = row.original.horaPretendida;
        return (
          <div>
            <p className="font-medium">{formatDateOnly(data)}</p>
            {hora && <p className="text-xs text-muted-foreground">{hora}</p>}
          </div>
        );
      },
    },
    {
      accessorKey: 'clienteNome',
      header: 'Cliente',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.clienteNome}</p>
          <p className="text-xs text-muted-foreground">{row.original.clienteEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'tipoServico',
      header: 'Tipo',
      cell: ({ row }) => (
        <span className={row.original.tipoServico === 'urgente' ? 'text-red-600 font-semibold' : ''}>
          {row.original.tipoServico === 'urgente' ? 'URGENTE' : 'Normal'}
        </span>
      ),
    },
    {
      accessorKey: 'equipa',
      header: 'Equipa',
      cell: ({ row }) => EQUIPA_LABELS[row.original.equipa] || row.original.equipa,
    },
    {
      accessorKey: 'motorista',
      header: 'Motorista',
      cell: ({ row }) => row.original.motorista?.nome || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.original.estado} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mudanças"
        subtitle="Histórico completo de todas as mudanças"
        actions={
          <Button onClick={() => navigate('/mudancas/nova')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Mudança
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="a_caminho">A Caminho</SelectItem>
            <SelectItem value="em_servico">Em Serviço</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="recusada">Recusada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroMotorista} onValueChange={setFiltroMotorista}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Motorista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os motoristas</SelectItem>
            {(motoristas || []).map((m: any) => (
              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filteredData.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nenhuma mudança encontrada"
          description="Não existem mudanças com os filtros selecionados. Tente alterar os filtros ou aguarde novas solicitações."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/mudancas/${row.id}`)}
        />
      )}
    </div>
  );
}
