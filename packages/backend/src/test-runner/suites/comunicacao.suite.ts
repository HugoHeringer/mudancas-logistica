import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runComunicacaoSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'comunicacao';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let createdTemplateId: string | null = null;
  const templateName = `test-template-${Date.now()}`;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  await t('POST /api/comunicacao/templates/initialize — inicializar templates padrão', async () => {
    const res = await http.post('/api/comunicacao/templates/initialize');
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/comunicacao/templates — listar templates', async () => {
    const res = await http.get('/api/comunicacao/templates');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(Array.isArray(res.body), 'Resposta não é array', res.body);
  })();

  await t('POST /api/comunicacao/templates — criar template', async () => {
    const res = await http.post('/api/comunicacao/templates', {
      nome: templateName,
      assunto: 'Teste {{nome}}',
      corpo: 'Olá {{nome}}, este é um teste.',
      variaveis: ['nome'],
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    createdTemplateId = res.body?.id;
  })();

  await t('GET /api/comunicacao/templates/:nome — obter template por nome', async () => {
    const res = await http.get(`/api/comunicacao/templates/${templateName}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/comunicacao/templates/:nome — atualizar template', async () => {
    const res = await http.patch(`/api/comunicacao/templates/${templateName}`, {
      assunto: 'Atualizado — Teste {{nome}}',
    });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('POST /api/comunicacao/templates/:nome/render — renderizar template', async () => {
    const res = await http.post(`/api/comunicacao/templates/${templateName}/render`, {
      variaveis: { nome: 'Mundo' },
    });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  await t('DELETE /api/comunicacao/templates/:id — remover template', async () => {
    if (!createdTemplateId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/comunicacao/templates/${createdTemplateId}`);
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
