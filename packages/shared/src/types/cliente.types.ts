import { Cliente } from '../schemas/cliente.schema';

export type { Cliente };

export type ClienteResumo = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  numeroMudancas: number;
  eRecorrente: boolean;
};

export type ClienteDetalhe = Cliente & {
  historicoMudancas: Array<{
    id: string;
    data: string;
    valor: number;
    estado: string;
  }>;
};

export type FiltroClientes = {
  search?: string;
  eRecorrente?: boolean;
  dataRegistroInicio?: string;
  dataRegistroFim?: string;
};
