import { MovimentoFinanceiro, TipoMovimento, CategoriaMovimento } from '../schemas/financeiro.schema';

export type { MovimentoFinanceiro, TipoMovimento, CategoriaMovimento };

export type ResumoFinanceiro = {
  periodo: {
    inicio: string;
    fim: string;
  };
  receitaTotal: number;
  custosTotais: number;
  margemTotal: number;
  margemPercentual: number;
};

export type BreakdownMotorista = {
  motoristaId: string;
  motoristaNome: string;
  receitaGerada: number;
  custosCombustivel: number;
  custosAlimentacao: number;
  margem: number;
};

export type BreakdownTipoServico = {
  tipo: 'normal' | 'urgente';
  quantidade: number;
  receitaTotal: number;
  margemTotal: number;
};

export type GastosDetalhados = {
  combustivel: {
    total: number;
    porMudanca: Array<{ mudancaId: string; valor: number; litros: number }>;
  };
  alimentacao: {
    total: number;
    porMudanca: Array<{ mudancaId: string; valor: number }>;
  };
};

export type FiltroFinanceiro = {
  dataInicio: string;
  dataFim: string;
  motoristaId?: string;
  tipoServico?: 'normal' | 'urgente';
  categoria?: CategoriaMovimento;
};
