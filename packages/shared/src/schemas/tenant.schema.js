import { z } from 'zod';
export const EstadoTenantEnum = z.enum(['ativa', 'suspensa', 'em_setup', 'cancelada']);
export const ConfigMarcaSchema = z.object({
    nomeEmpresa: z.string().min(1),
    logoUrl: z.string().url().optional(),
    corPrincipal: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1e40af'),
    corSecundaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#64748b'),
    morada: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email().optional(),
    redesSociais: z.object({
        facebook: z.string().url().optional(),
        instagram: z.string().url().optional(),
        linkedin: z.string().url().optional()
    }).optional()
});
export const ConfigPrecosSchema = z.object({
    equipaMotorista: z.number().min(0).default(25),
    equipaMotorista1Ajudante: z.number().min(0).default(35),
    equipaMotorista2Ajudantes: z.number().min(0).default(45),
    horasMinimas: z.number().min(1).default(2),
    materiais: z.object({
        protecaoFilme: z.number().min(0).default(0.50),
        protecaoCartao: z.number().min(0).default(0.30),
        caixas: z.number().min(0).default(2.00),
        fitaCola: z.number().min(0).default(1.50)
    }),
    acrescimoUrgencia: z.object({
        tipo: z.enum(['percentagem', 'valor_fixo']).default('percentagem'),
        valor: z.number().min(0).default(25)
    })
});
export const ConfigAgendaSchema = z.object({
    horarios: z.array(z.object({
        diaSemana: z.number().min(0).max(6),
        horaInicio: z.string(),
        horaFim: z.string(),
        ativo: z.boolean().default(true)
    })),
    capacidadePorSlot: z.number().min(1).default(1),
    duracaoSlotMinutos: z.number().min(15).default(60)
});
export const TenantSchema = z.object({
    id: z.string().uuid(),
    subdominio: z.string().regex(/^[a-z0-9-]+$/),
    estado: EstadoTenantEnum.default('em_setup'),
    configMarca: ConfigMarcaSchema,
    configPreco: ConfigPrecosSchema,
    configAgenda: ConfigAgendaSchema,
    adminUserId: z.string().uuid().optional(),
    dataCriacao: z.string().datetime(),
    dataUltimoAcesso: z.string().datetime().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
