import { z } from 'zod';

export const TipoMovimentoEnum = z.enum(['receita', 'custo']);

export const CategoriaMovimentoEnum = z.enum([
  'servico',
  'materiais',
  'combustivel',
  'alimentacao',
  'manutencao',
  'outros'
]);

export const MovimentoFinanceiroSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  mudancaId: z.string().uuid().optional(),
  tipo: TipoMovimentoEnum,
  categoria: CategoriaMovimentoEnum,
  descricao: z.string(),
  valor: z.number().min(0),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const TelaFinanceiraMudancaSchema = z.object({
  mudancaId: z.string().uuid(),
  receitaPrevista: z.object({
    horasEstimadas: z.number(),
    valorHora: z.number(),
    subtotal: z.number(),
    materiais: z.number()
  }),
  receitaRealizada: z.object({
    horasCobradas: z.number(),
    valorHora: z.number(),
    subtotal: z.number(),
    materiaisUtilizados: z.number()
  }),
  custosOperacionais: z.object({
    combustivel: z.number(),
    alimentacao: z.number(),
    total: z.number()
  }),
  margem: z.number()
});

export type MovimentoFinanceiro = z.infer<typeof MovimentoFinanceiroSchema>;
export type TipoMovimento = z.infer<typeof TipoMovimentoEnum>;
export type CategoriaMovimento = z.infer<typeof CategoriaMovimentoEnum>;
