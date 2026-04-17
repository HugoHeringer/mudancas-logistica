import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runVeiculoSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'veiculo';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let createdId: string | null = null;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('POST /api/veiculos — criar veículo', async () => {
    const res = await http.post('/api/veiculos', {
      nome: 'Caminhão Teste', marca: 'Volvo', modelo: 'FH',
      matricula: `XX-${Date.now().toString(36).toUpperCase()}`,
      metrosCubicos: 25, precoHora: 45,
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    createdId = res.body?.id;
  })();

  await t('GET /api/veiculos — listar veículos', async () => {
    const res = await http.get('/api/veiculos');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(Array.isArray(res.body), 'Resposta não é array', res.body);
  })();

  await t('GET /api/veiculos/disponiveis — veículos disponíveis', async () => {
    const res = await http.get('/api/veiculos/disponiveis');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/veiculos/:id — obter veículo por ID', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.get(`/api/veiculos/${createdId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/veiculos/:id — atualizar veículo', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.patch(`/api/veiculos/${createdId}`, { precoHora: 50 });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/veiculos/:id/estado — atualizar estado', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.patch(`/api/veiculos/${createdId}/estado`, { estado: 'em_manutencao' });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('DELETE /api/veiculos/:id — remover veículo', async () => {
    if (!createdId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/veiculos/${createdId}`);
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
