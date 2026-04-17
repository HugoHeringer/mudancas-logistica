import { z } from 'zod';
export const EstadoMudancaEnum = z.enum([
    'pendente',
    'aprovada',
    'a_caminho',
    'em_servico',
    'concluida',
    'recusada',
    'cancelada'
]);
export const TipoServicoEnum = z.enum(['normal', 'urgente']);
export const MoradaSchema = z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    andar: z.string().optional(),
    codigoPostal: z.string().min(1, 'Código postal é obrigatório'),
    localidade: z.string().min(1, 'Localidade é obrigatória'),
    elevador: z.boolean().default(false),
    pais: z.string().default('Portugal')
});
export const EquipaSchema = z.enum(['motorista', 'motorista_1_ajudante', 'motorista_2_ajudantes']);
export const MudancaFormSchema = z.object({
    // Dados pessoais
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    apelido: z.string().min(2, 'Apelido deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    telefone: z.string().min(9, 'Telefone inválido'),
    // Moradas
    moradaRecolha: MoradaSchema,
    moradaEntrega: MoradaSchema,
    // Serviço
    tipoServico: TipoServicoEnum,
    dataPretendida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    horaPretendida: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida').optional(),
    // Veículo e equipa
    veiculoId: z.string().uuid('Veículo inválido'),
    equipa: EquipaSchema,
    // Materiais
    materiais: z.object({
        protecaoFilme: z.number().min(0).default(0),
        protecaoCartao: z.number().min(0).default(0),
        caixas: z.number().min(0).default(0),
        fitaCola: z.number().min(0).default(0)
    }).default({
        protecaoFilme: 0,
        protecaoCartao: 0,
        caixas: 0,
        fitaCola: 0
    }),
    // Informações adicionais
    observacoes: z.string().max(2000).optional(),
    imagens: z.array(z.string().uuid()).optional(),
    // Internacional
    eInternacional: z.boolean().default(false),
    documentacao: z.string().optional()
});
export const MudancaAprovacaoSchema = z.object({
    motoristaId: z.string().uuid('Motorista é obrigatório'),
    ajudantes: z.array(z.string()).optional(),
    tempoEstimadoHoras: z.number().min(0.5).max(24),
    observacoesAdmin: z.string().optional()
});
export const MudancaConclusaoSchema = z.object({
    horasRegistadas: z.number().min(0),
    horasCobradas: z.number().min(0),
    ajudantesConfirmados: z.array(z.string()),
    materiaisUtilizados: z.object({
        protecaoFilme: z.number().min(0).default(0),
        protecaoCartao: z.number().min(0).default(0),
        caixas: z.number().min(0).default(0),
        fitaCola: z.number().min(0).default(0)
    }),
    combustivel: z.object({
        valor: z.number().min(0),
        litros: z.number().min(0)
    }),
    alimentacao: z.object({
        teve: z.boolean().default(false),
        valor: z.number().min(0).default(0)
    }),
    observacoes: z.string().optional()
});
export const MudancaSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    formulario: MudancaFormSchema,
    estado: EstadoMudancaEnum,
    aprovacao: MudancaAprovacaoSchema.optional(),
    conclusao: MudancaConclusaoSchema.optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});
