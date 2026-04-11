import { z } from 'zod';

export const DiaSemanaEnum = z.enum(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']);

export const HorarioFuncionamentoSchema = z.object({
  diaSemana: DiaSemanaEnum,
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/),
  eAtivo: z.boolean().default(true)
});

export const SlotAgendaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/),
  capacidadeTotal: z.number().min(1).default(1),
  capacidadeOcupada: z.number().min(0).default(0),
  eBloqueado: z.boolean().default(false),
  motivoBloqueio: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const BloqueioAgendaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motivo: z.string(),
  createdAt: z.string().datetime()
});

export type HorarioFuncionamento = z.infer<typeof HorarioFuncionamentoSchema>;
export type SlotAgenda = z.infer<typeof SlotAgendaSchema>;
