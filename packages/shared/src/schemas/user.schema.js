import { z } from 'zod';
export const PerfilUserEnum = z.enum(['admin', 'gerente', 'financeiro', 'operacional', 'motorista']);
export const PermissoesSecaoSchema = z.object({
    dashboard: z.enum(['none', 'view', 'edit']).default('view'),
    aprovacoes: z.enum(['none', 'view', 'edit']).default('view'),
    agenda: z.enum(['none', 'view', 'edit']).default('view'),
    mudancas: z.enum(['none', 'view', 'edit']).default('view'),
    clientes: z.enum(['none', 'view', 'edit']).default('view'),
    motoristas: z.enum(['none', 'view', 'edit']).default('view'),
    veiculos: z.enum(['none', 'view', 'edit']).default('view'),
    financeiro: z.enum(['none', 'view', 'edit']).default('none'),
    comunicacao: z.enum(['none', 'view', 'edit']).default('view'),
    utilizadores: z.enum(['none', 'view', 'edit']).default('none'),
    configuracoes: z.enum(['none', 'view', 'edit']).default('none')
});
export const UserSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    nome: z.string().min(2),
    email: z.string().email(),
    passwordHash: z.string().min(1),
    perfil: PerfilUserEnum,
    permissoes: PermissoesSecaoSchema.optional(),
    eAtivo: z.boolean().default(true),
    ultimaSessao: z.string().datetime().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
