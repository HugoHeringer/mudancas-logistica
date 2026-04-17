import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runMudancaSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'mudanca';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let createdId: string | null = null;
  let veiculoId: string | null = null;
  let motoristaId: string | null = null;
  let motoristaUserId: string | null = null;

  const t = (name: string, fn: () => Promise<void>) => async () => {
    const start = Date.now();
    try {
      await fn();
      tests.push({ name, status: 'pass', durationMs: Date.now() - start });
    } catch (err: any) {
      tests.push({
        name,
        status: err.status || 'fail',
        durationMs: Date.now() - start,
        error: err.message || String(err),
        details: err.details,
      });
    }
  };

  const assert = (condition: boolean, message: string, details?: any) => {
    if (!condition) {
      const err: any = new Error(message);
      err.status = 'fail';
      err.details = details;
      throw err;
    }
  };

  // Pre-requisite: create veiculo and motorista for workflow tests
  const setupRes = await http.post('/api/veiculos', {
    nome: 'Veiculo Teste Mudanca',
    marca: 'Mercedes',
    modelo: 'Sprinter',
    matricula: `TT-${Date.now().toString(36).toUpperCase()}`,
    metrosCubicos: 18,
    precoHora: 35,
    estado: 'disponivel',
  });
  if (setupRes.statusCode === 201) veiculoId = setupRes.body.id;

  // Create motorista user + motorista record
  const motEmail = `mot-mudanca-${Date.now()}@test.pt`;
  const motPass = 'Test@123456';
  const motRegRes = await http.post('/api/auth/register', {
    nome: 'Motorista Mudanca Test',
    email: motEmail,
    password: motPass,
    perfil: 'motorista',
    tenantId,
  });
  if (motRegRes.statusCode === 201) motoristaUserId = motRegRes.body.id;

  const motCreateRes = await http.post('/api/motoristas', {
    nome: 'Motorista Mudanca Test',
    email: motEmail,
    telefone: '919999991',
    cartaConducao: 'D12345678',
    validadeCarta: '2030-12-31',
    veiculoId: veiculoId || undefined,
    userId: motoristaUserId || undefined,
  });
  if (motCreateRes.statusCode === 201) motoristaId = motCreateRes.body.id;

  // Login as motorista to get their token (needed for iniciar/em-servico)
  let motoristaToken: string | null = null;
  const motLoginRes = await http.post('/api/auth/login', {
    email: motEmail,
    password: motPass,
    tenantId,
  });
  if (motLoginRes.statusCode === 200) motoristaToken = motLoginRes.body.accessToken;

  // --- CREATE ---
  await t('POST /api/mudancas — criar mudança', async () => {
    const res = await http.post('/api/mudancas', {
      clienteNome: 'Cliente Teste Mudanca',
      clienteEmail: `cliente-mudanca-${Date.now()}@test.pt`,
      clienteTelefone: '912345678',
      moradaRecolha: {
        rua: 'Rua de Recolha',
        numero: '10',
        codigoPostal: '1000-001',
        localidade: 'Lisboa',
      },
      moradaEntrega: {
        rua: 'Rua de Entrega',
        numero: '20',
        codigoPostal: '2000-002',
        localidade: 'Porto',
      },
      dataPretendida: '2026-05-01',
      horaPretendida: '09:00',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    assert(!!res.body?.id, 'ID ausente', res.body);
    assert(res.body?.estado === 'pendente', `Estado esperado 'pendente', recebido '${res.body?.estado}'`, res.body);
    createdId = res.body.id;
  })();

  // --- FIND ALL ---
  await t('GET /api/mudancas — listar mudanças', async () => {
    const res = await http.get('/api/mudancas');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(Array.isArray(res.body), 'Resposta não é um array', res.body);
  })();

  // --- FIND ONE ---
  await t('GET /api/mudancas/:id — obter mudança por ID', async () => {
    if (!createdId) {
      const err: any = new Error('Sem ID — criação pode ter falhado');
      err.status = 'skip';
      throw err;
    }
    const res = await http.get(`/api/mudancas/${createdId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(res.body?.id === createdId, 'ID não confere', res.body);
  })();

  // --- DASHBOARD ---
  await t('GET /api/mudancas/dashboard — dados do dashboard', async () => {
    const res = await http.get('/api/mudancas/dashboard');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  // --- APROVAR ---
  await t('POST /api/mudancas/:id/aprovar — aprovar mudança', async () => {
    if (!createdId) {
      const err: any = new Error('Sem ID — skip');
      err.status = 'skip';
      throw err;
    }
    const res = await http.post(`/api/mudancas/${createdId}/aprovar`, {
      aprovadoPor: 'test-runner',
      motoristaId: motoristaId || undefined,
      tempoEstimadoHoras: 3,
    });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  // --- INICIAR DESLOCAMENTO ---
  await t('POST /api/mudancas/:id/iniciar — iniciar deslocamento', async () => {
    if (!createdId) {
      const err: any = new Error('Sem ID — skip');
      err.status = 'skip';
      throw err;
    }
    if (!motoristaToken) {
      const err: any = new Error('Sem token do motorista — skip');
      err.status = 'skip';
      throw err;
    }
    // Switch to motorista token — this endpoint requires the authenticated motorista
    const savedToken = http.hasAuth();
    http.setAuth(motoristaToken);
    const res = await http.post(`/api/mudancas/${createdId}/iniciar`);
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
    // Keep motorista token for em-servico
  })();

  // --- EM SERVIÇO ---
  await t('POST /api/mudancas/:id/em-servico — em serviço', async () => {
    if (!createdId) {
      const err: any = new Error('Sem ID — skip');
      err.status = 'skip';
      throw err;
    }
    // Still on motorista token
    if (!motoristaToken) {
      const err: any = new Error('Sem token do motorista — skip');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.post(`/api/mudancas/${createdId}/em-servico`);
    // Restore admin auth for remaining tests
    const adminLoginRes = await http.post('/api/auth/login', {
      email: `test-runner@${tenantId}.pt`,
      password: 'Test@123456',
      tenantId,
    });
    if (adminLoginRes.statusCode === 200) http.setAuth(adminLoginRes.body.accessToken);
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  // --- CONCLUIR ---
  await t('POST /api/mudancas/:id/concluir — concluir mudança', async () => {
    if (!createdId) {
      const err: any = new Error('Sem ID — skip');
      err.status = 'skip';
      throw err;
    }
    const res = await http.post(`/api/mudancas/${createdId}/concluir`, {
      horasRegistadas: 3,
      horasCobradas: 3,
      ajudantesConfirmados: [],
      concluidoPor: 'test-runner',
    });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  // --- CREATE + RECUSAR ---
  await t('POST /api/mudancas/:id/recusar — recusar mudança', async () => {
    const createRes = await http.post('/api/mudancas', {
      clienteNome: 'Cliente Recusa Test',
      clienteEmail: `recusa-${Date.now()}@test.pt`,
      clienteTelefone: '919999999',
      moradaRecolha: { rua: 'Rua R', numero: '1', codigoPostal: '1000-001', localidade: 'Lisboa' },
      moradaEntrega: { rua: 'Rua E', numero: '2', codigoPostal: '2000-002', localidade: 'Porto' },
      dataPretendida: '2026-06-01',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    if (createRes.statusCode !== 201) {
      const err: any = new Error('Não conseguiu criar mudança para recusar');
      err.status = 'skip';
      throw err;
    }
    const res = await http.post(`/api/mudancas/${createRes.body.id}/recusar`, {
      motivo: 'Teste automatizado',
    });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  // --- CREATE + CANCELAR ---
  await t('POST /api/mudancas/:id/cancelar — cancelar mudança', async () => {
    const createRes = await http.post('/api/mudancas', {
      clienteNome: 'Cliente Cancelar Test',
      clienteEmail: `cancelar-${Date.now()}@test.pt`,
      clienteTelefone: '918888888',
      moradaRecolha: { rua: 'Rua R', numero: '1', codigoPostal: '1000-001', localidade: 'Lisboa' },
      moradaEntrega: { rua: 'Rua E', numero: '2', codigoPostal: '2000-002', localidade: 'Porto' },
      dataPretendida: '2026-07-01',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    if (createRes.statusCode !== 201) {
      const err: any = new Error('Não conseguiu criar mudança para cancelar');
      err.status = 'skip';
      throw err;
    }
    const res = await http.post(`/api/mudancas/${createRes.body.id}/cancelar`);
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  // --- UPDATE ---
  await t('PATCH /api/mudancas/:id — atualizar mudança', async () => {
    if (!createdId) {
      const err: any = new Error('Sem ID — skip');
      err.status = 'skip';
      throw err;
    }
    const res = await http.patch(`/api/mudancas/${createdId}`, {
      observacoes: 'Observação do test-runner',
    });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  // --- MINHAS ---
  await t('GET /api/mudancas/minhas — mudanças do motorista', async () => {
    const res = await http.get('/api/mudancas/minhas');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  // --- NOT FOUND ---
  await t('GET /api/mudancas/:id — mudança inexistente (404)', async () => {
    const res = await http.get('/api/mudancas/00000000-0000-0000-0000-000000000000');
    assert(res.statusCode === 404 || res.statusCode === 400, `Esperado 404/400, recebido ${res.statusCode}`, res.body);
  })();

  // --- DELETE ---
  await t('DELETE /api/mudancas/:id — remover mudança', async () => {
    if (!createdId) {
      const err: any = new Error('Sem ID — skip');
      err.status = 'skip';
      throw err;
    }
    const res = await http.delete(`/api/mudancas/${createdId}`);
    assert(res.statusCode === 200 || res.statusCode === 204, `Esperado 200/204, recebido ${res.statusCode}`, res.body);
  })();

  const finishedAt = new Date().toISOString();
  const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

  return {
    suite: suiteName,
    startedAt,
    finishedAt,
    durationMs,
    totalTests: tests.length,
    passed: tests.filter((t) => t.status === 'pass').length,
    failed: tests.filter((t) => t.status === 'fail').length,
    skipped: tests.filter((t) => t.status === 'skip').length,
    errors: tests.filter((t) => t.status === 'error').length,
    tests,
  };
}
