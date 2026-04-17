import { z } from 'zod';
export const ClienteSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    nome: z.string().min(2),
    apelido: z.string().min(2),
    email: z.string().email(),
    telefone: z.string().min(9),
    moradas: z.array(z.object({
        tipo: z.enum(['recolha', 'entrega']),
        rua: z.string(),
        numero: z.string(),
        andar: z.string().optional(),
        codigoPostal: z.string(),
        localidade: z.string(),
        pais: z.string().default('Portugal')
    })).optional(),
    numeroMudancas: z.number().default(0),
    eRecorrente: z.boolean().default(false),
    ultimaMudanca: z.string().datetime().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
