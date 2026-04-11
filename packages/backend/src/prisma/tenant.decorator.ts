import { TenantRequest } from './prisma.middleware';

export function getTenantId(req: TenantRequest): string {
  if (!req.tenantId) {
    throw new Error('Tenant ID não encontrado');
  }
  return req.tenantId;
}
