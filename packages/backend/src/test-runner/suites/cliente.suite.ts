import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runClienteSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'cliente';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let createdId: string | null = null;
  const testEmail = `cliente-test-${Date.now()}@test.pt`;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('POST /api/clientes — criar cliente', async () => {
    const res = await http.post('/api/clientes', {
      nome: 'Cliente', apelido: 'Teste', email: testEmail, telefone: '911111111',
      moradas: [{ tipo: 'recolha', rua: 'Rua Teste', numero: '1', codigoPostal: '1000-001', localidade: 'Lisboa' }],
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    createdId = res.body?.id;
  })();

  await t('GET /api/clientes — listar clientes', async () => {
    const res = await http.get('/api/clientes');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(Array.isArray(res.body), 'Resposta não é array', res.body);
  })();

  await t('GET /api/clientes/:id — obter cliente por ID', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.get(`/api/clientes/${createdId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/clientes/email/:email — buscar por email', async () => {
    const res = await http.get(`/api/clientes/email/${encodeURIComponent(testEmail)}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/clientes/:id — atualizar cliente', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.patch(`/api/clientes/${createdId}`, { telefone: '922222222' });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('DELETE /api/clientes/:id — remover cliente', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/clientes/${createdId}`);
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
