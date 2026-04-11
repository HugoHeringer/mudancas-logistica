import { Veiculo, EstadoVeiculo } from '../schemas/veiculo.schema';

export type { Veiculo, EstadoVeiculo };

export type VeiculoResumo = {
  id: string;
  nome: string;
  matricula: string;
  metrosCubicos: number;
  precoHora: number;
  estado: EstadoVeiculo;
};

export type VeiculoDetalhe = Veiculo & {
  historicoUso?: Array<{
    mudancaId: string;
    data: string;
    cliente: string;
    horas: number;
  }>;
};

export type FiltroVeiculos = {
  estado?: EstadoVeiculo;
  eParaUrgencias?: boolean;
  search?: string;
};
