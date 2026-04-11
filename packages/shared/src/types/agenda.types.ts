import { SlotAgenda, HorarioFuncionamento } from '../schemas/agenda.schema';

export type { SlotAgenda, HorarioFuncionamento };

export type AgendaDia = {
  data: string;
  slots: SlotAgenda[];
  capacidadeTotal: number;
  capacidadeOcupada: number;
  disponivel: boolean;
};

export type AgendaSemana = {
  dataInicio: string;
  dataFim: string;
  dias: AgendaDia[];
};

export type AgendaMotorista = {
  motoristaId: string;
  motoristaNome: string;
  dias: AgendaDia[];
};

export type DisponibilidadeSlot = {
  data: string;
  horaInicio: string;
  horaFim: string;
  disponivel: boolean;
  slotsLivres: number;
};

export type FiltroAgenda = {
  dataInicio: string;
  dataFim: string;
  motoristaId?: string;
  veiculoId?: string;
};
