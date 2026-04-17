import { useAuthStore } from '../stores/auth.store';

type Perfil = 'admin' | 'gerente' | 'operacional' | 'financeiro' | 'motorista';

const ROUTE_PERMISSIONS: Record<string, Perfil[]> = {
  '/': ['admin', 'gerente', 'operacional', 'financeiro', 'motorista'],
  '/aprovacoes': ['admin', 'gerente'],
  '/agenda': ['admin', 'gerente', 'operacional', 'motorista'],
  '/mudancas': ['admin', 'gerente', 'operacional', 'motorista'],
  '/clientes': ['admin', 'gerente', 'operacional'],
  '/motoristas': ['admin', 'gerente', 'operacional'],
  '/ajudantes': ['admin', 'gerente', 'operacional'],
  '/veiculos': ['admin', 'gerente', 'operacional'],
  '/financeiro': ['admin', 'gerente', 'financeiro'],
  '/relatorios': ['admin', 'gerente', 'financeiro'],
  '/comunicacao': ['admin', 'gerente'],
  '/utilizadores': ['admin'],
  '/configuracoes': ['admin'],
};

const ACTION_PERMISSIONS: Record<string, Perfil[]> = {
  aprovar: ['admin', 'gerente'],
  recusar: ['admin', 'gerente'],
  cancelar: ['admin', 'gerente'],
  criar: ['admin', 'gerente', 'operacional'],
  editar: ['admin', 'gerente', 'operacional'],
  eliminar: ['admin'],
  gerir_utilizadores: ['admin'],
  gerir_config: ['admin'],
  ver_financeiro: ['admin', 'gerente', 'financeiro'],
  iniciar_deslocamento: ['motorista'],
  concluir: ['motorista'],
};

export function usePermissao() {
  const { user } = useAuthStore();
  const perfil = (user?.perfil || '') as Perfil;

  const podeVerRota = (rota: string): boolean => {
    const permitidos = ROUTE_PERMISSIONS[rota];
    if (!permitidos) return true; // rota desconhecida = permite
    return permitidos.includes(perfil);
  };

  const podeVer = (acao: string): boolean => {
    const permitidos = ACTION_PERMISSIONS[acao];
    if (!permitidos) return true; // acao desconhecida = permite
    return permitidos.includes(perfil);
  };

  const podeEditar = (acao: string): boolean => {
    // Mesma logica que podeVer por enquanto, mas separado para futuro refinamento
    return podeVer(acao);
  };

  const rotasPermitidas = Object.entries(ROUTE_PERMISSIONS)
    .filter(([, perfis]) => perfis.includes(perfil))
    .map(([rota]) => rota);

  return { podeVer, podeEditar, podeVerRota, rotasPermitidas, perfil };
}
