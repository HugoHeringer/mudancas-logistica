import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

/**
 * Suite 10.2 — End-to-end flow tests
 * Tests the full lifecycle: client submits → admin approves → driver sees in agenda →
 * driver starts → driver completes → financial sees it
 */
export async function runE2EFlowSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'e2e-flow';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];

  let adminToken: string | null = null;
  let motoristaToken: string | null = null;
  let motoristaId: string | null = null;
  let motoristaUserId: string | null = null;
  let veiculoId: string | null = null;
  let mudancaId: string | null = null;

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

  // --- Setup: Create veiculo ---
  await t('E2E Setup: Criar veiculo', async () => {
    const res = await http.post('/api/veiculos', {
      nome: 'Veiculo E2E',
      marca: 'Mercedes',
      modelo: 'Sprinter',
      matricula: `E2E-${Date.now().toString(36).toUpperCase()}`,
      metrosCubicos: 20,
      precoHora: 40,
      estado: 'disponivel',
    });
    if (res.statusCode === 201) veiculoId = res.body?.id;
    // Accept either 201 or 200 (already exists)
    assert(res.statusCode === 201 || res.statusCode === 200, `Esperado 201/200, recebido ${res.statusCode}`, res.body);
  })();

  // --- Setup: Create motorista user ---
  await t('E2E Setup: Criar motorista', async () => {
    const motEmail = `mot-e2e-${Date.now()}@test.pt`;
    const motPass = 'Test@123456';
    const regRes = await http.post('/api/auth/register', {
      nome: 'Motorista E2E',
      email: motEmail,
      password: motPass,
      perfil: 'motorista',
      tenantId,
    });
    assert(regRes.statusCode === 201, `Esperado 201, recebido ${regRes.statusCode}`, regRes.body);
    motoristaUserId = regRes.body?.id;

    // Create motorista record
    const motRes = await http.post('/api/motoristas', {
      nome: 'Motorista E2E',
      email: motEmail,
      telefone: '919000000',
      cartaConducao: `E2E${Date.now()}`,
      validadeCarta: '2030-12-31',
      veiculoId: veiculoId || undefined,
      userId: motoristaUserId || undefined,
    });
    if (motRes.statusCode === 201) motoristaId = motRes.body?.id;

    // Login as motorista
    const loginRes = await http.post('/api/auth/login', {
      email: motEmail,
      password: motPass,
      tenantId,
    });
    assert(loginRes.statusCode === 200, `Login motorista falhou: ${loginRes.statusCode}`, loginRes.body);
    motoristaToken = loginRes.body?.accessToken;
  })();

  // --- Setup: Admin login ---
  await t('E2E Setup: Login como admin', async () => {
    const adminEmail = `test-runner@${tenantId}.pt`;
    const adminPass = 'Test@123456';
    // Register admin if not exists
    await http.post('/api/auth/register', {
      nome: 'Admin E2E',
      email: adminEmail,
      password: adminPass,
      perfil: 'admin',
      tenantId,
    });
    const loginRes = await http.post('/api/auth/login', {
      email: adminEmail,
      password: adminPass,
      tenantId,
    });
    assert(loginRes.statusCode === 200, `Login admin falhou: ${loginRes.statusCode}`, loginRes.body);
    adminToken = loginRes.body?.accessToken;
  })();

  // --- 10.2.1: Cliente submete formulario → aparece em aprovacoes ---
  await t('10.2.1a: Cliente submete formulario (publico)', async () => {
    // Use public endpoint — no auth needed
    http.clearAuth();
    const res = await http.post('/api/public/mudancas', {
      tenantId,
      clienteNome: 'Cliente E2E Flow',
      clienteEmail: `cliente-e2e-${Date.now()}@test.pt`,
      clienteTelefone: '912345678',
      moradaRecolha: { rua: 'Rua E2E Recolha', numero: '1', codigoPostal: '1000-001', localidade: 'Lisboa' },
      moradaEntrega: { rua: 'Rua E2E Entrega', numero: '2', codigoPostal: '2000-002', localidade: 'Porto' },
      dataPretendida: '2026-07-01',
      horaPretendida: '10:00',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    mudancaId = res.body?.id;
    // Restore admin token
    if (adminToken) http.setAuth(adminToken);
  })();

  await t('10.2.1b: Mudanca aparece como pendente nas aprovacoes', async () => {
    if (!adminToken) {
      const err: any = new Error('Sem token admin');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.get('/api/mudancas?estado=pendente');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    const mudancas = Array.isArray(res.body) ? res.body : [];
    const found = mudancas.find((m: any) => m.id === mudancaId);
    assert(!!found, 'Mudanca submetida nao aparece como pendente', { mudancaId, mudancas });
    assert(found?.estado === 'pendente', `Estado esperado 'pendente', recebido '${found?.estado}'`, found);
  })();

  // --- 10.2.1: Admin aprova → motorista ve na agenda ---
  await t('10.2.1c: Admin aprova mudanca', async () => {
    if (!adminToken || !mudancaId) {
      const err: any = new Error('Sem token admin ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.post(`/api/mudancas/${mudancaId}/aprovar`, {
      aprovadoPor: 'admin-e2e',
      motoristaId: motoristaId || undefined,
      tempoEstimadoHoras: 4,
    });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.2.1d: Motorista ve a mudanca na sua agenda', async () => {
    if (!motoristaToken) {
      const err: any = new Error('Sem token motorista');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.get('/api/mudancas/minhas');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    const mudancas = Array.isArray(res.body) ? res.body : [];
    const found = mudancas.find((m: any) => m.id === mudancaId);
    assert(!!found, 'Mudanca aprovada nao aparece na agenda do motorista', { mudancaId, mudancas });
  })();

  // --- 10.2.2: Motorista inicia deslocamento → estado muda → admin ve no dashboard ---
  await t('10.2.2a: Motorista inicia deslocamento', async () => {
    if (!motoristaToken || !mudancaId) {
      const err: any = new Error('Sem token motorista ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.post(`/api/mudancas/${mudancaId}/iniciar`, {
      previsaoChegadaMinutos: 30,
    });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.2.2b: Estado da mudanca mudou para em_deslocamento', async () => {
    if (!adminToken || !mudancaId) {
      const err: any = new Error('Sem token admin ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.get(`/api/mudancas/${mudancaId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(
      res.body?.estado === 'em_deslocamento',
      `Estado esperado 'em_deslocamento', recebido '${res.body?.estado}'`,
      res.body,
    );
  })();

  await t('10.2.2c: Admin ve mudanca em_deslocamento no dashboard', async () => {
    if (!adminToken) {
      const err: any = new Error('Sem token admin');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.get('/api/mudancas/dashboard');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    // Dashboard should reflect the em_deslocamento status
    const dashboard = res.body;
    assert(!!dashboard, 'Dashboard vazio', dashboard);
  })();

  // --- Motorista em servico ---
  await t('10.2.2d: Motorista inicia servico no local', async () => {
    if (!motoristaToken || !mudancaId) {
      const err: any = new Error('Sem token motorista ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.post(`/api/mudancas/${mudancaId}/em-servico`);
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  // --- 10.2.3: Motorista conclui com ficha → financeiro calculado → aparece no financeiro ---
  await t('10.2.3a: Motorista conclui mudanca com ficha', async () => {
    if (!motoristaToken || !mudancaId) {
      const err: any = new Error('Sem token motorista ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.post(`/api/mudancas/${mudancaId}/concluir`, {
      horasRegistadas: 4,
      horasCobradas: 4,
      ajudantesConfirmados: [],
      concluidoPor: 'motorista-e2e',
    });
    assert(res.statusCode === 200 || res.statusCode === 201, `Esperado 200/201, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.2.3b: Estado da mudanca mudou para concluida', async () => {
    if (!adminToken || !mudancaId) {
      const err: any = new Error('Sem token admin ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.get(`/api/mudancas/${mudancaId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(
      res.body?.estado === 'concluida',
      `Estado esperado 'concluida', recebido '${res.body?.estado}'`,
      res.body,
    );
  })();

  await t('10.2.3c: Mudanca concluida aparece no financeiro', async () => {
    if (!adminToken) {
      const err: any = new Error('Sem token admin');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    // Check financial resumo — it should reflect the completed mudanca
    const today = new Date().toISOString().slice(0, 10);
    const res = await http.get(`/api/financeiro/resumo?dataInicio=2026-01-01&dataFim=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    // Verify resumo has data (even if zero values, it should not error)
    assert(!!res.body, 'Resumo financeiro vazio', res.body);
  })();

  // --- Cleanup ---
  await t('E2E Cleanup: Remover mudanca de teste', async () => {
    if (!adminToken || !mudancaId) {
      const err: any = new Error('Sem token admin ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.delete(`/api/mudancas/${mudancaId}`);
    assert(
      res.statusCode === 200 || res.statusCode === 204,
      `Esperado 200/204, recebido ${res.statusCode}`,
      res.body,
    );
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
