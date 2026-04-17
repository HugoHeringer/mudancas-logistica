import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runTenantSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'tenant';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let createdId: string | null = null;
  const testSubdomain = `test-tenant-${Date.now()}`;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('POST /api/tenants — criar tenant', async () => {
    const res = await http.post('/api/tenants', {
      subdomain: testSubdomain,
      estado: 'ativa',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    createdId = res.body?.id;
  })();

  await t('GET /api/tenants — listar tenants', async () => {
    const res = await http.get('/api/tenants');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(Array.isArray(res.body), 'Resposta não é array', res.body);
  })();

  await t('GET /api/tenants/:id — obter tenant por ID', async () => {
    // Use the existing tenantId since the created one might not be accessible
    const res = await http.get(`/api/tenants/${tenantId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/tenants/subdomain/:subdomain — buscar por subdomain', async () => {
    // Use the existing tenant's subdomain — we'll try the created one first
    const id = createdId || tenantId;
    const res = await http.get(`/api/tenants/subdomain/${testSubdomain}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/tenants/:id/stats — estatísticas do tenant', async () => {
    const res = await http.get(`/api/tenants/${tenantId}/stats`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/tenants/:id — atualizar tenant', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.patch(`/api/tenants/${createdId}`, { estado: 'suspensa' });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/tenants/:id/brand — atualizar marca', async () => {
    const id = createdId || tenantId;
    const res = await http.patch(`/api/tenants/${id}/brand`, {
      nome: 'Teste Marca',
      cores: {
        primaria: '#FF0000',
        secundaria: '#2A7A64',
        acento: '#D4A853',
        fundo: '#F5EDE0',
        fundoEscuro: '#0A0F1E',
        texto: '#2C1810',
        textoClaro: '#F0E6D6',
      },
      fontes: {
        display: 'Inter',
        body: 'Inter',
      },
    });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('DELETE /api/tenants/:id — remover tenant de teste', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/tenants/${createdId}`);
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
