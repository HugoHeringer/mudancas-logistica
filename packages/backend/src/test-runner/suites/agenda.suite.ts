import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runAgendaSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'agenda';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try { await fn(); tests.push({ name, status: 'pass', durationMs: Date.now() - start }); }
    catch (err: any) { tests.push({ name, status: err.status || 'fail', durationMs: Date.now() - start, error: err.message, details: err.details }); }
  };

  const assert = (cond: boolean, msg: string, details?: any) => { if (!cond) { const e: any = new Error(msg); e.status = 'fail'; e.details = details; throw e; } };

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  await t('GET /api/agenda/slots/:data — slots por data', async () => {
    const res = await http.get(`/api/agenda/slots/${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/agenda/slots?dataInicio&dataFim — slots por range', async () => {
    const res = await http.get(`/api/agenda/slots?dataInicio=${today}&dataFim=${nextWeek}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/agenda/disponibilidade/:data — disponibilidade', async () => {
    const res = await http.get(`/api/agenda/disponibilidade/${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/agenda/semanal/:dataInicio — agenda semanal', async () => {
    const res = await http.get(`/api/agenda/semanal/${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/agenda/mensal/:ano/:mes — agenda mensal', async () => {
    const now = new Date();
    const res = await http.get(`/api/agenda/mensal/${now.getFullYear()}/${now.getMonth() + 1}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('GET /api/agenda/config — obter config da agenda', async () => {
    const res = await http.get('/api/agenda/config');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('PATCH /api/agenda/config — atualizar config da agenda', async () => {
    const res = await http.patch('/api/agenda/config', {
      horarios: [
        { diaSemana: 1, horaInicio: '08:00', horaFim: '18:00', ativo: 1 },
        { diaSemana: 2, horaInicio: '08:00', horaFim: '18:00', ativo: 1 },
        { diaSemana: 3, horaInicio: '08:00', horaFim: '18:00', ativo: 1 },
        { diaSemana: 4, horaInicio: '08:00', horaFim: '18:00', ativo: 1 },
        { diaSemana: 5, horaInicio: '08:00', horaFim: '18:00', ativo: 1 },
      ],
      duracaoSlotMinutos: 60,
    });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  let bloqueioId: string | null = null;
  await t('POST /api/agenda/bloqueios — criar bloqueio', async () => {
    const res = await http.post('/api/agenda/bloqueios', {
      dataInicio: nextWeek,
      dataFim: nextWeek,
      motivo: 'Teste automatizado',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    bloqueioId = res.body?.id;
  })();

  await t('DELETE /api/agenda/bloqueios/:id — remover bloqueio', async () => {
    if (!bloqueioId) { const e: any = new Error('skip'); e.status = 'skip'; throw e; }
    const res = await http.delete(`/api/agenda/bloqueios/${bloqueioId}`);
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
