export function getTenantId(req) {
    if (!req.tenantId) {
        throw new Error('Tenant ID não encontrado');
    }
    return req.tenantId;
}
