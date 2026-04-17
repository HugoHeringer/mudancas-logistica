import { HttpHelper } from '../http-helper';
import { TestCaseResult, TestSuiteResult } from '../types';

export async function runAuthSuite(http: HttpHelper, tenantId: string): Promise<TestSuiteResult> {
  const suiteName = 'auth';
  const startedAt = new Date().toISOString();
  const tests: TestCaseResult[] = [];
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

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

  // --- Test: Register ---
  await t('POST /api/auth/register — criar utilizador de teste', async () => {
    const res = await http.post('/api/auth/register', {
      nome: 'Teste Automatizado',
      email: `test-runner-${Date.now()}@test.pt`,
      password: 'Test@123456',
      perfil: 'admin',
      tenantId,
    });
    // Can be 201 (created) or 409 (already exists) — both acceptable
    assert(
      res.statusCode === 201 || res.statusCode === 409,
      `Esperado 201 ou 409, recebido ${res.statusCode}`,
      res.body,
    );
  })();

  // --- Test: Login ---
  await t('POST /api/auth/login — login com credenciais válidas', async () => {
    // First register to guarantee user exists
    const testEmail = `login-test-${Date.now()}@test.pt`;
    const testPass = 'Test@123456';
    await http.post('/api/auth/register', {
      nome: 'Login Test User',
      email: testEmail,
      password: testPass,
      perfil: 'admin',
      tenantId,
    });

    const res = await http.post('/api/auth/login', {
      email: testEmail,
      password: testPass,
      tenantId,
    });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(!!res.body?.accessToken, 'accessToken ausente na resposta', res.body);
    assert(!!res.body?.refreshToken, 'refreshToken ausente na resposta', res.body);
    assert(res.body?.user?.email === testEmail, 'Email do user não confere', res.body);

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
    http.setAuth(accessToken!, refreshToken!);
  })();

  // --- Test: Login com senha errada ---
  await t('POST /api/auth/login — login com senha errada (401)', async () => {
    const testEmail = `login-test-${Date.now()}@test.pt`;
    await http.post('/api/auth/register', {
      nome: 'Login Fail Test',
      email: testEmail,
      password: 'Test@123456',
      perfil: 'admin',
      tenantId,
    });

    const res = await http.post('/api/auth/login', {
      email: testEmail,
      password: 'senhaErrada123',
      tenantId,
    });
    assert(res.statusCode === 401, `Esperado 401, recebido ${res.statusCode}`, res.body);
  })();

  // --- Test: Refresh Token ---
  await t('POST /api/auth/refresh — renovar token', async () => {
    if (!refreshToken) {
      const err: any = new Error('Sem refreshToken — teste de login pode ter falhado');
      err.status = 'skip';
      throw err;
    }
    const res = await http.post('/api/auth/refresh', { refreshToken });
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
    assert(!!res.body?.accessToken, 'Novo accessToken ausente', res.body);

    // Update auth with new token
    accessToken = res.body.accessToken;
    if (refreshToken) http.setAuth(accessToken!, refreshToken);
  })();

  // --- Test: Access protected route with valid token ---
  await t('GET /api/mudancas — acesso protegido com token válido', async () => {
    if (!accessToken) {
      const err: any = new Error('Sem accessToken — teste de login pode ter falhado');
      err.status = 'skip';
      throw err;
    }
    const res = await http.get('/api/mudancas');
    assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);
  })();

  // --- Test: Access protected route without token ---
  await t('GET /api/mudancas — acesso sem token (401)', async () => {
    const savedToken = accessToken;
    http.clearAuth();
    const res = await http.get('/api/mudancas');
    assert(res.statusCode === 401, `Esperado 401, recebido ${res.statusCode}`, res.body);
    // Restore auth
    if (savedToken) http.setAuth(savedToken, refreshToken!);
    accessToken = savedToken;
  })();

  // --- Test: Update Password ---
  await t('POST /api/auth/update-password — alterar senha', async () => {
    if (!accessToken) {
      const err: any = new Error('Sem accessToken — teste de login pode ter falhado');
      err.status = 'skip';
      throw err;
    }
    // Create a dedicated user for password test
    const passTestEmail = `pass-test-${Date.now()}@test.pt`;
    const passTestOld = 'OldPass@123';
    const passTestNew = 'NewPass@456';
    const regRes = await http.post('/api/auth/register', {
      nome: 'Password Test User',
      email: passTestEmail,
      password: passTestOld,
      perfil: 'operacional',
      tenantId,
    });

    if (regRes.statusCode === 201) {
      // Login with this user to get their token
      const loginRes = await http.post('/api/auth/login', {
        email: passTestEmail,
        password: passTestOld,
        tenantId,
      });

      if (loginRes.statusCode === 200) {
        const userToken = loginRes.body.accessToken;
        const userId = loginRes.body.user?.id;

        // Use the user's token for this request
        const savedAuth = accessToken;
        http.setAuth(userToken);

        const res = await http.post('/api/auth/update-password', {
          userId,
          currentPassword: passTestOld,
          newPassword: passTestNew,
        });
        assert(res.statusCode === 200, `Esperado 200, recebido ${res.statusCode}`, res.body);

        // Restore original auth
        http.setAuth(savedAuth!, refreshToken!);
        accessToken = savedAuth;
      } else {
        const err: any = new Error(`Login do user de teste falhou: ${loginRes.statusCode}`);
        err.status = 'fail';
        err.details = loginRes.body;
        throw err;
      }
    } else {
      const err: any = new Error('Registo do user de teste falhou — skip');
      err.status = 'skip';
      throw err;
    }
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
