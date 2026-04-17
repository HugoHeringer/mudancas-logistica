export function getTenantId(req: any): string {
  const tenantId = req.tenantId || req.user?.tenantId;
  if (!tenantId) {
    throw new Error('Tenant ID não encontrado');
  }
  return tenantId;
}
