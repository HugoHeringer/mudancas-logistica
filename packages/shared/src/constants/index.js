/**
 * Constantes globais da aplicação
 */
// Estados de mudança
export const ESTADOS_MUDANCA = {
    PENDENTE: 'pendente',
    APROVADA: 'aprovada',
    A_CAMINHO: 'a_caminho',
    EM_SERVICO: 'em_servico',
    CONCLUIDA: 'concluida',
    RECUSADA: 'recusada',
    CANCELADA: 'cancelada'
};
export const ESTADOS_MUDANCA_LABELS = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    a_caminho: 'A Caminho',
    em_servico: 'Em Serviço',
    concluida: 'Concluída',
    recusada: 'Recusada',
    cancelada: 'Cancelada'
};
export const ESTADOS_MUDANCA_COLORS = {
    pendente: '#f59e0b',
    aprovada: '#3b82f6',
    a_caminho: '#8b5cf6',
    em_servico: '#06b6d4',
    concluida: '#10b981',
    recusada: '#ef4444',
    cancelada: '#6b7280'
};
// Tipos de serviço
export const TIPOS_SERVICO = {
    NORMAL: 'normal',
    URGENTE: 'urgente'
};
export const TIPOS_SERVICO_LABELS = {
    normal: 'Agendamento Normal',
    urgente: 'Mudança Urgente'
};
// Perfis de utilizador
export const PERFIS_USER = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    FINANCEIRO: 'financeiro',
    OPERACIONAL: 'operacional',
    MOTORISTA: 'motorista'
};
export const PERFIS_USER_LABELS = {
    admin: 'Administrador',
    gerente: 'Gerente',
    financeiro: 'Financeiro',
    operacional: 'Operacional',
    motorista: 'Motorista'
};
// Estados de veículo
export const ESTADOS_VEICULO = {
    DISPONIVEL: 'disponivel',
    EM_SERVICO: 'em_servico',
    EM_MANUTENCAO: 'em_manutencao'
};
export const ESTADOS_VEICULO_LABELS = {
    disponivel: 'Disponível',
    em_servico: 'Em Serviço',
    em_manutencao: 'Em Manutenção'
};
// Estados de motorista
export const ESTADOS_MOTORISTA = {
    DISPONIVEL: 'disponivel',
    EM_SERVICO: 'em_servico',
    INDISPONIVEL: 'indisponivel'
};
export const ESTADOS_MOTORISTA_LABELS = {
    disponivel: 'Disponivel',
    em_servico: 'Em Servico',
    indisponivel: 'Indisponivel'
};
// Estados de tenant
export const ESTADOS_TENANT = {
    ATIVA: 'ativa',
    SUSPENSA: 'suspensa',
    EM_SETUP: 'em_setup',
    CANCELADA: 'cancelada'
};
export const ESTADOS_TENANT_LABELS = {
    ativa: 'Ativa',
    suspensa: 'Suspensa',
    em_setup: 'Em Configuração',
    cancelada: 'Cancelada'
};
// Categorias financeiras
export const CATEGORIAS_FINANCEIRAS = {
    SERVICO: 'servico',
    MATERIAIS: 'materiais',
    COMBUSTIVEL: 'combustivel',
    ALIMENTACAO: 'alimentacao',
    MANUTENCAO: 'manutencao',
    OUTROS: 'outros'
};
export const CATEGORIAS_FINANCEIRAS_LABELS = {
    servico: 'Serviço',
    materiais: 'Materiais',
    combustivel: 'Combustível',
    alimentacao: 'Alimentação',
    manutencao: 'Manutenção',
    outros: 'Outros'
};
// Dias da semana
export const DIAS_SEMANA = [
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo'
];
export const DIAS_SEMANA_LABELS = {
    segunda: 'Segunda',
    terca: 'Terça',
    quarta: 'Quarta',
    quinta: 'Quinta',
    sexta: 'Sexta',
    sabado: 'Sábado',
    domingo: 'Domingo'
};
// Configurações padrão
export const DEFAULT_CONFIG = {
    HORA_INICIO: '08:00',
    HORA_FIM: '18:00',
    DURACAO_SLOT_MINUTOS: 60,
    CAPACIDADE_POR_SLOT: 1,
    HORAS_MINIMAS_SERVICO: 2,
    ACRESCIMO_URGENCIA_PERCENTAGEM: 25
};
// Materiais disponíveis
export const MATERIAIS = {
    PROTECAO_FILME: 'protecaoFilme',
    PROTECAO_CARTAO: 'protecaoCartao',
    CAIXAS: 'caixas',
    FITA_COLA: 'fitaCola'
};
export const MATERIAIS_LABELS = {
    protecaoFilme: 'Proteção Filme',
    protecaoCartao: 'Proteção Cartão',
    caixas: 'Caixas',
    fitaCola: 'Fita Cola'
};
// Opções de equipa
export const EQUIPAS = {
    MOTORISTA: 'motorista',
    MOTORISTA_1_AJUDANTE: 'motorista_1_ajudante',
    MOTORISTA_2_AJUDANTES: 'motorista_2_ajudantes'
};
export const EQUIPAS_LABELS = {
    motorista: 'Apenas Motorista',
    motorista_1_ajudante: 'Motorista + 1 Ajudante',
    motorista_2_ajudantes: 'Motorista + 2 Ajudantes'
};
