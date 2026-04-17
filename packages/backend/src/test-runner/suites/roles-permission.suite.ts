import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

/**
 * Suite 10.3 — Role permission tests
 * Verifies that users with specific roles cannot access endpoints
 * reserved for other roles (should receive 403 Forbidden).
 */
export async function runRolesPermissionSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'roles-permission';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];

  let adminToken: string | null = null;
  let motoristaToken: string | null = null;
  let financeiroToken: string | null = null;
  let gerenteToken: string | null = null;
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

  // --- Setup: Create users with different roles ---
  await t('Setup: Criar utilizador admin', async () => {
    const email = `admin-roles-${Date.now()}@test.pt`;
    const pass = 'Test@123456';
    await http.post('/api/auth/register', {
      nome: 'Admin Roles Test',
      email,
      password: pass,
      perfil: 'admin',
      tenantId,
    });
    const loginRes = await http.post('/api/auth/login', { email, password: pass, tenantId });
    assert(loginRes.statusCode === 200, `Login admin falhou`, loginRes.body);
    adminToken = loginRes.body?.accessToken;
  })();

  await t('Setup: Criar utilizador motorista', async () => {
    const email = `motorista-roles-${Date.now()}@test.pt`;
    const pass = 'Test@123456';
    await http.post('/api/auth/register', {
      nome: 'Motorista Roles Test',
      email,
      password: pass,
      perfil: 'motorista',
      tenantId,
    });
    const loginRes = await http.post('/api/auth/login', { email, password: pass, tenantId });
    assert(loginRes.statusCode === 200, `Login motorista falhou`, loginRes.body);
    motoristaToken = loginRes.body?.accessToken;
  })();

  await t('Setup: Criar utilizador financeiro', async () => {
    const email = `financeiro-roles-${Date.now()}@test.pt`;
    const pass = 'Test@123456';
    await http.post('/api/auth/register', {
      nome: 'Financeiro Roles Test',
      email,
      password: pass,
      perfil: 'financeiro',
      tenantId,
    });
    const loginRes = await http.post('/api/auth/login', { email, password: pass, tenantId });
    assert(loginRes.statusCode === 200, `Login financeiro falhou`, loginRes.body);
    financeiroToken = loginRes.body?.accessToken;
  })();

  await t('Setup: Criar utilizador gerente', async () => {
    const email = `gerente-roles-${Date.now()}@test.pt`;
    const pass = 'Test@123456';
    await http.post('/api/auth/register', {
      nome: 'Gerente Roles Test',
      email,
      password: pass,
      perfil: 'gerente',
      tenantId,
    });
    const loginRes = await http.post('/api/auth/login', { email, password: pass, tenantId });
    assert(loginRes.statusCode === 200, `Login gerente falhou`, loginRes.body);
    gerenteToken = loginRes.body?.accessToken;
  })();

  // --- Setup: Create a mudanca for testing ---
  await t('Setup: Criar mudanca para testes de role', async () => {
    if (!adminToken) {
      const err: any = new Error('Sem token admin');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.post('/api/mudancas', {
      clienteNome: 'Cliente Roles Test',
      clienteEmail: `cliente-roles-${Date.now()}@test.pt`,
      clienteTelefone: '913333333',
      moradaRecolha: { rua: 'Rua Roles', numero: '1', codigoPostal: '1000-001', localidade: 'Lisboa' },
      moradaEntrega: { rua: 'Rua Roles2', numero: '2', codigoPostal: '2000-002', localidade: 'Porto' },
      dataPretendida: '2026-08-01',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    mudancaId = res.body?.id;
  })();

  // =====================================================================
  // 10.3.1: Motorista tenta aceder endpoint admin → 403
  // =====================================================================
  await t('10.3.1a: Motorista tenta aceder GET /api/utilizadores → 403', async () => {
    if (!motoristaToken) {
      const err: any = new Error('Sem token motorista');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.get('/api/utilizadores');
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3.1b: Motorista tenta aceder GET /api/tenants → 403', async () => {
    if (!motoristaToken) {
      const err: any = new Error('Sem token motorista');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.get('/api/tenants');
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3.1c: Motorista tenta aceder PATCH /api/tenants/:id/brand → 403', async () => {
    if (!motoristaToken) {
      const err: any = new Error('Sem token motorista');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.patch(`/api/tenants/${tenantId}/brand`, { nome: 'Hack' });
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3.1d: Motorista tenta aprovar mudanca → 403', async () => {
    if (!motoristaToken || !mudancaId) {
      const err: any = new Error('Sem token motorista ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(motoristaToken);
    const res = await http.post(`/api/mudancas/${mudancaId}/aprovar`, {
      aprovadoPor: 'motorista-hack',
    });
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  // =====================================================================
  // 10.3.2: Financeiro tenta aprovar mudanca → 403
  // =====================================================================
  await t('10.3.2a: Financeiro tenta aprovar mudanca → 403', async () => {
    if (!financeiroToken || !mudancaId) {
      const err: any = new Error('Sem token financeiro ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(financeiroToken);
    const res = await http.post(`/api/mudancas/${mudancaId}/aprovar`, {
      aprovadoPor: 'financeiro-hack',
    });
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3.2b: Financeiro tenta recusar mudanca → 403', async () => {
    if (!financeiroToken || !mudancaId) {
      const err: any = new Error('Sem token financeiro ou mudanca ID');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(financeiroToken);
    const res = await http.post(`/api/mudancas/${mudancaId}/recusar`, {
      motivo: 'tentativa financeiro',
    });
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3.2c: Financeiro tenta aceder GET /api/utilizadores → 403', async () => {
    if (!financeiroToken) {
      const err: any = new Error('Sem token financeiro');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(financeiroToken);
    const res = await http.get('/api/utilizadores');
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  // =====================================================================
  // 10.3.3: Gerente tenta aceder configuracoes → 403
  // =====================================================================
  await t('10.3.3a: Gerente tenta aceder GET /api/utilizadores → 403', async () => {
    if (!gerenteToken) {
      const err: any = new Error('Sem token gerente');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(gerenteToken);
    const res = await http.get('/api/utilizadores');
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3.3b: Gerente tenta alterar brand do tenant → 403', async () => {
    if (!gerenteToken) {
      const err: any = new Error('Sem token gerente');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(gerenteToken);
    const res = await http.patch(`/api/tenants/${tenantId}/brand`, { nome: 'Hack Gerente' });
    assert(res.statusCode === 403, `Esperado 403, recebido ${res.statusCode}`, res.body);
  })();

  // --- Positive test: Verify roles that SHOULD have access ---
  await t('10.3+: Admin pode aceder GET /api/utilizadores → 200', async () => {
    if (!adminToken) {
      const err: any = new Error('Sem token admin');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.get('/api/utilizadores');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3+: Admin pode aceder PATCH /api/tenants/:id/brand → 200', async () => {
    if (!adminToken) {
      const err: any = new Error('Sem token admin');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminToken);
    const res = await http.patch(`/api/tenants/${tenantId}/brand`, {
      nome: 'Test Brand Update',
      cores: {
        primaria: '#D4A853',
        secundaria: '#C4572A',
        acento: '#1E2640',
        fundo: '#F5EDE0',
        fundoEscuro: '#0A0F1E',
        texto: '#2C1810',
        textoClaro: '#F0E6D6',
      },
      fontes: { display: 'Inter', body: 'Inter' },
    });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3+: Gerente pode aceder GET /api/financeiro → 200', async () => {
    if (!gerenteToken) {
      const err: any = new Error('Sem token gerente');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(gerenteToken);
    const today = new Date().toISOString().slice(0, 10);
    const res = await http.get(`/api/financeiro/resumo?dataInicio=2026-01-01&dataFim=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.3+: Financeiro pode aceder GET /api/financeiro → 200', async () => {
    if (!financeiroToken) {
      const err: any = new Error('Sem token financeiro');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(financeiroToken);
    const today = new Date().toISOString().slice(0, 10);
    const res = await http.get(`/api/financeiro/resumo?dataInicio=2026-01-01&dataFim=${today}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  // --- Cleanup: Delete mudanca ---
  await t('Cleanup: Remover mudanca de teste', async () => {
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
