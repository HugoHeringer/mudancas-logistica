/**
 * Helper para gerar filtro de motorista baseado nas permissões do gerente.
 * Se o utilizador for gerente com restrição, retorna filtro para motoristas permitidos.
 * Caso contrário, retorna objeto vazio (sem restrição).
 */
export function getMotoristaFilter(user: any): Record<string, any> {
  if (!user || user.perfil !== 'gerente') return {};

  const permissoes = user.permissoes as Record<string, any> | null;
  if (!permissoes) return {};

  const { verTodosMotoristas, motoristasPermitidos } = permissoes;
  if (verTodosMotoristas || !motoristasPermitidos?.length) return {};

  return { motoristaId: { in: motoristasPermitidos } };
}
