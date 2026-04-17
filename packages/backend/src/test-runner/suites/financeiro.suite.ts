import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runFinanceiroSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'financeiro';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let createdMovId: string | null = null;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('POST /api/financeiro/movimentos — criar movimento', async () => {
    const res = await http.post('/api/financeiro/movimentos', {
      tipo: 'receita', categoria: 'servico', descricao: 'Teste automatizado', valor: 150.00, data: new Date().toISOString().split('T')[0],
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    createdMovId = res.body?.id;
  })();

  await t('GET /api/financeiro/movimentos — listar movimentos', async () => {
    const res = await http.get('/api/financeiro/movimentos');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  await t('GET /api/financeiro/resumo — resumo financeiro', async () => {
    const res = await http.get(`/api/financeiro/resumo?dataInicio=${monthAgo}&dataFim=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/financeiro/breakdown/motoristas — breakdown por motorista', async () => {
    const res = await http.get(`/api/financeiro/breakdown/motoristas?dataInicio=${monthAgo}&dataFim=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/financeiro/breakdown/tipo-servico — breakdown por tipo', async () => {
    const res = await http.get(`/api/financeiro/breakdown/tipo-servico?dataInicio=${monthAgo}&dataFim=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/financeiro/gastos-detalhados — gastos detalhados', async () => {
    const res = await http.get(`/api/financeiro/gastos-detalhados?dataInicio=${monthAgo}&dataFim=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('DELETE /api/financeiro/movimentos/:id — remover movimento', async () => {
    if (!createdMovId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/financeiro/movimentos/${createdMovId}`);
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
