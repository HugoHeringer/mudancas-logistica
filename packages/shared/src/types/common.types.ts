// Tipos comuns e utilitários de tipo

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type UserRole = 'admin' | 'gerente' | 'financeiro' | 'operacional' | 'motorista';

export type TenantContext = {
  tenantId: string;
  subdomain: string;
};
