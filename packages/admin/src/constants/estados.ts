export const ESTADOS_MUDANCA_CORES: Record<string, string> = {
  pendente: 'bg-amber-500',
  aprovada: 'bg-blue-500',
  a_caminho: 'bg-violet-500',
  em_servico: 'bg-cyan-500',
  concluida: 'bg-emerald-500',
  recusada: 'bg-red-500',
  cancelada: 'bg-muted-foreground',
};

export const ESTADOS_MOTORISTA_CORES: Record<string, string> = {
  disponivel: 'bg-emerald-500',
  em_servico: 'bg-amber-500',
  indisponivel: 'bg-red-500',
};

export const ESTADOS_VEICULO_CORES: Record<string, string> = {
  disponivel: 'bg-emerald-500',
  em_servico: 'bg-amber-500',
  em_manutencao: 'bg-red-500',
};
