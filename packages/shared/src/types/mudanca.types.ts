import {
  MudancaForm,
  EstadoMudanca,
  TipoServico,
  MudancaSchema,
  MudancaFormSchema,
  MudancaAprovacaoSchema,
  MudancaConclusaoSchema
} from '../schemas/mudanca.schema';

export type { MudancaForm, EstadoMudanca, TipoServico };

export type Mudanca = {
  id: string;
  tenantId: string;
  formulario: MudancaForm;
  estado: EstadoMudanca;
  aprovacao?: MudancaAprovacao;
  conclusao?: MudancaConclusao;
  createdAt: string;
  updatedAt: string;
};

export type MudancaAprovacao = {
  motoristaId: string;
  motoristaNome?: string;
  ajudantes: string[];
  ajudantesNomes?: string[];
  tempoEstimadoHoras: number;
  observacoesAdmin?: string;
  aprovadoEm?: string;
  aprovadoPor?: string;
};

export type MudancaConclusao = {
  horasRegistadas: number;
  horasCobradas: number;
  ajudantesConfirmados: string[];
  materiaisUtilizados: {
    protecaoFilme: number;
    protecaoCartao: number;
    caixas: number;
    fitaCola: number;
  };
  combustivel: {
    valor: number;
    litros: number;
  };
  alimentacao: {
    teve: boolean;
    valor: number;
  };
  observacoes?: string;
  concluidoEm?: string;
  concluidoPor?: string;
};

export type MudancaResumo = {
  id: string;
  clienteNome: string;
  data: string;
  hora?: string;
  estado: EstadoMudanca;
  tipoServico: TipoServico;
  moradaRecolha: string;
  moradaEntrega: string;
  motoristaNome?: string;
};

export type FiltroMudancas = {
  estado?: EstadoMudanca[];
  tipoServico?: TipoServico;
  dataInicio?: string;
  dataFim?: string;
  motoristaId?: string;
  clienteId?: string;
};
