import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runMotoristaSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'motorista';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let createdId: string | null = null;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('POST /api/motoristas — criar motorista', async () => {
    const res = await http.post('/api/motoristas', {
      nome: 'Motorista Teste', email: `mot-test-${Date.now()}@test.pt`, telefone: '933333333',
      cartaConducao: 'C98765432', validadeCarta: '2030-12-31',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    createdId = res.body?.id;
  })();

  await t('GET /api/motoristas — listar motoristas', async () => {
    const res = await http.get('/api/motoristas');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(Array.isArray(res.body), 'Resposta não é array', res.body);
  })();

  await t('GET /api/motoristas/disponiveis — motoristas disponíveis', async () => {
    const res = await http.get('/api/motoristas/disponiveis');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/motoristas/:id — obter motorista por ID', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.get(`/api/motoristas/${createdId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/motoristas/:id — atualizar motorista', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.patch(`/api/motoristas/${createdId}`, { telefone: '944444444' });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/motoristas/:id/estado — atualizar estado', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.patch(`/api/motoristas/${createdId}/estado`, { estado: 'indisponivel' });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/motoristas/:id/performance — performance', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const now = new Date();
    const res = await http.get(`/api/motoristas/${createdId}/performance?mes=${now.getMonth() + 1}&ano=${now.getFullYear()}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('DELETE /api/motoristas/:id — remover motorista', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/motoristas/${createdId}`);
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
