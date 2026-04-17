import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runSuperAdminSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'super-admin';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('GET /api/super-admin/tenants — listar todos os tenants', async () => {
    const res = await http.get('/api/super-admin/tenants');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(Array.isArray(res.body), 'Resposta não é array', res.body);
  })();

  await t('GET /api/super-admin/stats — estatísticas globais', async () => {
    const res = await http.get('/api/super-admin/stats');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  let testTenantId: string | null = null;
  await t('POST /api/super-admin/tenants — criar tenant com admin', async () => {
    const res = await http.post('/api/super-admin/tenants', {
      subdomain: `sa-test-${Date.now()}`,
      estado: 'ativa',
      adminNome: 'Admin Teste SA',
      adminEmail: `sa-admin-${Date.now()}@test.pt`,
      adminPassword: 'Test@123456',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    testTenantId = res.body?.tenant?.id || res.body?.id;
  })();

  await t('PATCH /api/super-admin/tenants/:id/estado — atualizar estado tenant', async () => {
    if (!testTenantId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.patch(`/api/super-admin/tenants/${testTenantId}/estado`, { estado: 'suspensa' });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('POST /api/super-admin/tenants/:id/reset-password — reset senha admin', async () => {
    if (!testTenantId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.post(`/api/super-admin/tenants/${testTenantId}/reset-password`, { newPassword: 'NewPass@789' });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  await t('DELETE /api/super-admin/tenants/:id — remover tenant', async () => {
    if (!testTenantId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/super-admin/tenants/${testTenantId}`);
    assert(res.statusCode === 200 || res.statusCode === 204, `Esperado 200/204, recebido ${res.statusCode}`, res.body);
  })();

  const finishedAt = new Date().toISOString();
  return {
    suite: suiteName, startedAt, finishedAt,
    durationMs: new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
    totalTests: tests.length,
    passed: tests.filter(t => t.status === 'pass').length,
    failed: tests.filter(t => t.status === 'fail').length,
    skipped: tests.filter(t => t.status === 'skip').length,
    errors: tests.filter(t => t.status === 'error').length,
    tests,
  };
}
