import { User, PerfilUser, PermissoesSecao } from '../schemas/user.schema';

export type { User, PerfilUser, PermissoesSecao };

export type UserResumo = {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUser;
  eAtivo: boolean;
};

export type UserCreate = {
  nome: string;
  email: string;
  password: string;
  perfil: PerfilUser;
  permissoes?: PermissoesSecao;
};

export type UserUpdate = Partial<{
  nome: string;
  email: string;
  perfil: PerfilUser;
  permissoes: PermissoesSecao;
  eAtivo: boolean;
}>;

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: UserResumo;
  token: string;
  refreshToken: string;
};

export type TokenPayload = {
  sub: string;
  email: string;
  tenantId: string;
  perfil: PerfilUser;
  iat: number;
  exp: number;
};
