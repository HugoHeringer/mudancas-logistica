import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

/**
 * Suite 10.1 — Multi-tenant isolation tests
 * Creates 2 tenants, inserts data in each, verifies tenant A cannot see tenant B's data.
 */
export async function runMultiTenantIsolationSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'multi-tenant-isolation';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];

  let tenantAId: string | null = null;
  let tenantBId: string | null = null;
  let tenantASubdomain = `iso-a-${Date.now()}`;
  let tenantBSubdomain = `iso-b-${Date.now()}`;
  let adminAToken: string | null = null;
  let adminBToken: string | null = null;
  let mudancaAId: string | null = null;
  let mudancaBId: string | null = null;

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

  // --- Setup: Create 2 tenants ---
  await t('Setup: Criar tenant A', async () => {
    const res = await http.post('/api/tenants', {
      subdomain: tenantASubdomain,
      estado: 'ativa',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    tenantAId = res.body?.id;
  })();

  await t('Setup: Criar tenant B', async () => {
    const res = await http.post('/api/tenants', {
      subdomain: tenantBSubdomain,
      estado: 'ativa',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    tenantBId = res.body?.id;
  })();

  // --- Setup: Create admin users for each tenant ---
  await t('Setup: Criar admin para tenant A', async () => {
    if (!tenantAId) {
      const err: any = new Error('Tenant A nao criado');
      err.status = 'skip';
      throw err;
    }
    const emailA = `admin-iso-a-${Date.now()}@test.pt`;
    const passA = 'Test@123456';
    await http.post('/api/auth/register', {
      nome: 'Admin Isolation A',
      email: emailA,
      password: passA,
      perfil: 'admin',
      tenantId: tenantAId,
    });
    const loginRes = await http.post('/api/auth/login', {
      email: emailA,
      password: passA,
      tenantId: tenantAId,
    });
    assert(loginRes.statusCode === 200, `Login falhou: ${loginRes.statusCode}`, loginRes.body);
    adminAToken = loginRes.body?.accessToken;
  })();

  await t('Setup: Criar admin para tenant B', async () => {
    if (!tenantBId) {
      const err: any = new Error('Tenant B nao criado');
      err.status = 'skip';
      throw err;
    }
    const emailB = `admin-iso-b-${Date.now()}@test.pt`;
    const passB = 'Test@123456';
    await http.post('/api/auth/register', {
      nome: 'Admin Isolation B',
      email: emailB,
      password: passB,
      perfil: 'admin',
      tenantId: tenantBId,
    });
    const loginRes = await http.post('/api/auth/login', {
      email: emailB,
      password: passB,
      tenantId: tenantBId,
    });
    assert(loginRes.statusCode === 200, `Login falhou: ${loginRes.statusCode}`, loginRes.body);
    adminBToken = loginRes.body?.accessToken;
  })();

  // --- Setup: Create a mudanca in each tenant ---
  await t('Setup: Criar mudanca no tenant A', async () => {
    if (!adminAToken || !tenantAId) {
      const err: any = new Error('Sem token ou tenant A');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminAToken);
    const res = await http.post('/api/mudancas', {
      clienteNome: 'Cliente Isolation A',
      clienteEmail: `cliente-iso-a-${Date.now()}@test.pt`,
      clienteTelefone: '911111111',
      moradaRecolha: { rua: 'Rua A', numero: '1', codigoPostal: '1000-001', localidade: 'Lisboa' },
      moradaEntrega: { rua: 'Rua A2', numero: '2', codigoPostal: '2000-002', localidade: 'Porto' },
      dataPretendida: '2026-06-01',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    mudancaAId = res.body?.id;
  })();

  await t('Setup: Criar mudanca no tenant B', async () => {
    if (!adminBToken || !tenantBId) {
      const err: any = new Error('Sem token ou tenant B');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminBToken);
    const res = await http.post('/api/mudancas', {
      clienteNome: 'Cliente Isolation B',
      clienteEmail: `cliente-iso-b-${Date.now()}@test.pt`,
      clienteTelefone: '922222222',
      moradaRecolha: { rua: 'Rua B', numero: '1', codigoPostal: '3000-003', localidade: 'Faro' },
      moradaEntrega: { rua: 'Rua B2', numero: '2', codigoPostal: '4000-004', localidade: 'Braga' },
      dataPretendida: '2026-06-15',
      tipoServico: 'normal',
      equipa: 'motorista',
    });
    assert(res.statusCode === 201, `Esperado 201, recebido ${res.statusCode}`, res.body);
    mudancaBId = res.body?.id;
  })();

  // --- 10.1.1: Tenant A cannot see tenant B's mudancas ---
  await t('10.1.1a: Tenant A nao ve mudancas do tenant B', async () => {
    if (!adminAToken) {
      const err: any = new Error('Sem token A');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminAToken);
    const res = await http.get('/api/mudancas');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    const mudancas = Array.isArray(res.body) ? res.body : [];
    const foundB = mudancas.find((m: any) => m.id === mudancaBId);
    assert(!foundB, 'Tenant A pode ver mudanca do tenant B — isolamento falhou!', { mudancas, mudancaBId });
  })();

  await t('10.1.1b: Tenant B nao ve mudancas do tenant A', async () => {
    if (!adminBToken) {
      const err: any = new Error('Sem token B');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminBToken);
    const res = await http.get('/api/mudancas');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    const mudancas = Array.isArray(res.body) ? res.body : [];
    const foundA = mudancas.find((m: any) => m.id === mudancaAId);
    assert(!foundA, 'Tenant B pode ver mudanca do tenant A — isolamento falhou!', { mudancas, mudancaAId });
  })();

  // --- 10.1.1c: Tenant A cannot access tenant B's mudanca by ID ---
  await t('10.1.1c: Tenant A nao pode aceder mudanca do tenant B por ID', async () => {
    if (!adminAToken || !mudancaBId) {
      const err: any = new Error('Sem token A ou mudanca B');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminAToken);
    const res = await http.get(`/api/mudancas/${mudancaBId}`);
    assert(
      res.statusCode === 404 || res.statusCode === 403,
      `Esperado 404/403, recebido ${res.statusCode} — Tenant A pode ler mudanca do B!`,
      res.body,
    );
  })();

  // --- 10.1.2: Alteracao de configMarca do tenant A nao afeta tenant B ---
  await t('10.1.2a: Alterar configMarca do tenant A', async () => {
    if (!adminAToken || !tenantAId) {
      const err: any = new Error('Sem token A ou tenant A');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminAToken);
    const res = await http.patch(`/api/tenants/${tenantAId}/brand`, {
      nome: 'Empresa A Alterada',
      cores: {
        primaria: '#FF0000',
        secundaria: '#00FF00',
        acento: '#0000FF',
        fundo: '#FFFFFF',
        fundoEscuro: '#111111',
        texto: '#000000',
        textoClaro: '#FFFFFF',
      },
      fontes: { display: 'Arial', body: 'Arial' },
    });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  await t('10.1.2b: configMarca do tenant B nao foi afetada', async () => {
    if (!adminBToken || !tenantBId) {
      const err: any = new Error('Sem token B ou tenant B');
      err.status = 'skip';
      throw err;
    }
    http.setAuth(adminBToken);
    const res = await http.get(`/api/tenants/${tenantBId}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    const configMarca = res.body?.configMarca || {};
    const nome = configMarca?.nome || res.body?.nome;
    // Tenant B should NOT have the name "Empresa A Alterada"
    assert(
      nome !== 'Empresa A Alterada',
      'configMarca do tenant B foi afetada pela alteracao do A — isolamento falhou!',
      { configMarca, tenantBId },
    );
  })();

  // --- 10.1.3: Subdominio A so resolve dados do tenant A ---
  await t('10.1.3a: Subdominio A resolve dados do tenant A', async () => {
    const res = await http.get(`/api/public/tenant/${tenantASubdomain}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(
      res.body?.id === tenantAId || res.body?.subdomain === tenantASubdomain,
      'Subdominio A nao resolveu para tenant A',
      res.body,
    );
  })();

  await t('10.1.3b: Subdominio B resolve dados do tenant B (nao A)', async () => {
    const res = await http.get(`/api/public/tenant/${tenantBSubdomain}`);
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    const resolvedId = res.body?.id;
    assert(
      resolvedId !== tenantAId,
      'Subdominio B resolveu para tenant A — isolamento falhou!',
      res.body,
    );
  })();

  // --- Cleanup ---
  await t('Cleanup: Remover tenant A de teste', async () => {
    if (!tenantAId) {
      const err: any = new Error('Sem tenant A para limpar');
      err.status = 'skip';
      throw err;
    }
    // Use the main test-runner auth (admin) to delete
    const adminLoginRes = await http.post('/api/auth/login', {
      email: `test-runner@${tenantId}.pt`,
      password: 'Test@123456',
      tenantId,
    });
    if (adminLoginRes.statusCode === 200) http.setAuth(adminLoginRes.body.accessToken);
    const res = await http.delete(`/api/tenants/${tenantAId}`);
    assert(
      res.statusCode === 200 || res.statusCode === 204,
      `Esperado 200/204, recebido ${res.statusCode}`,
      res.body,
    );
  })();

  await t('Cleanup: Remover tenant B de teste', async () => {
    if (!tenantBId) {
      const err: any = new Error('Sem tenant B para limpar');
      err.status = 'skip';
      throw err;
    }
    const res = await http.delete(`/api/tenants/${tenantBId}`);
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
