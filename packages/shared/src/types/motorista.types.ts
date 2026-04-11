import { Motorista, EstadoMotorista, Ajudante } from '../schemas/motorista.schema';

export type { Motorista, EstadoMotorista, Ajudante };

export type MotoristaDetalhe = Motorista & {
  veiculo?: {
    id: string;
    nome: string;
    matricula: string;
  };
};

export type MotoristaPerformance = {
  motoristaId: string;
  motoristaNome: string;
  mudancasNoMes: number;
  horasTrabalhadas: number;
  receitaGerada: number;
  custosCombustivel: number;
  custosAlimentacao: number;
  margem: number;
};

export type FiltroMotoristas = {
  estado?: EstadoMotorista;
  veiculoId?: string;
  search?: string;
};
