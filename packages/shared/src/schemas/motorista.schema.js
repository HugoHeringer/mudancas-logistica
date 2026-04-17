import { z } from 'zod';
export const EstadoMotoristaEnum = z.enum(['disponivel', 'em_servico', 'indisponivel']);
export const MotoristaSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    nome: z.string().min(2),
    email: z.string().email(),
    telefone: z.string().min(9),
    cartaConducao: z.string(),
    validadeCarta: z.string(),
    veiculoId: z.string().uuid().optional(),
    estado: EstadoMotoristaEnum.default('disponivel'),
    mudancasRealizadas: z.number().default(0),
    horasTrabalhadasMes: z.number().default(0),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
export const AjudanteSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    nome: z.string().min(2),
    telefone: z.string().min(9),
    disponivel: z.boolean().default(true),
    createdAt: z.string().datetime()
});
