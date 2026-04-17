import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runPublicSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'public';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  // Save auth to restore later — public endpoints don't need it
  const savedAuth = (http as any).authToken;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('POST /api/public/mudancas — criar mudança (sem auth)', async () => {
    http.clearAuth();
    const res = await http.post('/api/public/mudancas', {
      tenantId,
      clienteNome: 'Cliente Public Test',
      clienteEmail: `public-${Date.now()}@test.pt`,
      clienteTelefone: '955555555',
      moradaRecolha: { rua: 'Rua Public', numero: '1', codigoPostal: '1000-001', localidade: 'Lisboa' },
      moradaEntrega: { rua: 'Rua Public Ent', numero: '2', codigoPostal: '2000-002', localidade: 'Porto' },
      dataPretendida: '2026-08-01',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/public/veiculos?tenantId — listar veículos (sem auth)', async () => {
    http.clearAuth();
    const res = await http.get(`/api/public/veiculos?tenantId=${tenantId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/public/disponibilidade?tenantId&data — disponibilidade (sem auth)', async () => {
    http.clearAuth();
    const today = new Date().toISOString().split('T')[0];
    const res = await http.get(`/api/public/disponibilidade?tenantId=${tenantId}&data=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  // Restore auth
  if (savedAuth) http.setAuth(savedAuth, (http as any).refreshToken);

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
