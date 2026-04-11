import { Tenant, EstadoTenant, ConfigMarca, ConfigPreco } from '../schemas/tenant.schema';

export type { Tenant, EstadoTenant, ConfigMarca, ConfigPreco };

export type TenantResumo = {
  id: string;
  subdominio: string;
  estado: EstadoTenant;
  nomeEmpresa: string;
  dataCriacao: string;
};

export type TenantCreate = {
  subdominio: string;
  nomeEmpresa: string;
  adminEmail: string;
  adminPassword: string;
  adminNome: string;
  pais?: string;
  moeda?: string;
  fusoHorario?: string;
};

export type TenantUpdate = Partial<{
  estado: EstadoTenant;
  configMarca: ConfigMarca;
  configPreco: ConfigPreco;
}>;

export type TenantConfig = {
  marca: ConfigMarca;
  precos: ConfigPreco;
  agenda: {
    horarios: Array<{
      diaSemana: number;
      horaInicio: string;
      horaFim: string;
      ativo: boolean;
    }>;
    capacidadePorSlot: number;
    duracaoSlotMinutos: number;
  };
};
