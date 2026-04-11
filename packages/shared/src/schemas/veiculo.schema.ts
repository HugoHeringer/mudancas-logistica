import { z } from 'zod';

export const EstadoVeiculoEnum = z.enum(['disponivel', 'em_servico', 'em_manutencao']);

export const VeiculoSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nome: z.string().min(1), // Ex: "Furgão Grande"
  marca: z.string().min(1),
  modelo: z.string().optional(),
  matricula: z.string().min(1),
  metrosCubicos: z.number().min(1),
  precoHora: z.number().min(0),
  estado: EstadoVeiculoEnum.default('disponivel'),
  eParaUrgencias: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Veiculo = z.infer<typeof VeiculoSchema>;
export type EstadoVeiculo = z.infer<typeof EstadoVeiculoEnum>;
