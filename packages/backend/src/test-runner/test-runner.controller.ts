import {
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { TestLogger } from './test-logger';
import { HttpHelper } from './http-helper';
import { TestSuiteResult } from './types';

// Suite imports
import { runAuthSuite } from './suites/auth.suite';
import { runMudancaSuite } from './suites/mudanca.suite';
import { runClienteSuite } from './suites/cliente.suite';
import { runMotoristaSuite } from './suites/motorista.suite';
import { runVeiculoSuite } from './suites/veiculo.suite';
import { runAgendaSuite } from './suites/agenda.suite';
import { runFinanceiroSuite } from './suites/financeiro.suite';
import { runComunicacaoSuite } from './suites/comunicacao.suite';
import { runTenantSuite } from './suites/tenant.suite';
import { runSuperAdminSuite } from './suites/super-admin.suite';
import { runPublicSuite } from './suites/public.suite';
import { runMultiTenantIsolationSuite } from './suites/multi-tenant-isolation.suite';
import { runE2EFlowSuite } from './suites/e2e-flow.suite';
import { runRolesPermissionSuite } from './suites/roles-permission.suite';

interface SuiteEntry {
  name: string;
  run: (http: HttpHelper, tenantId: string) => Promise<TestSuiteResult>;
  needsAuth: boolean; // whether suite needs JWT token before running
}

const ALL_SUITES: SuiteEntry[] = [
  { name: 'auth', run: runAuthSuite, needsAuth: false },       // does its own login
  { name: 'public', run: runPublicSuite, needsAuth: false },    // public endpoints
  { name: 'super-admin', run: runSuperAdminSuite, needsAuth: false }, // has @Public()
  { name: 'mudanca', run: runMudancaSuite, needsAuth: true },
  { name: 'cliente', run: runClienteSuite, needsAuth: true },
  { name: 'motorista', run: runMotoristaSuite, needsAuth: true },
  { name: 'veiculo', run: runVeiculoSuite, needsAuth: true },
  { name: 'agenda', run: runAgendaSuite, needsAuth: true },
  { name: 'financeiro', run: runFinanceiroSuite, needsAuth: true },
  { name: 'comunicacao', run: runComunicacaoSuite, needsAuth: true },
  { name: 'tenant', run: runTenantSuite, needsAuth: true },
  { name: 'multi-tenant-isolation', run: runMultiTenantIsolationSuite, needsAuth: true },
  { name: 'e2e-flow', run: runE2EFlowSuite, needsAuth: true },
  { name: 'roles-permission', run: runRolesPermissionSuite, needsAuth: true },
];

@ApiTags('test-runner')
@Controller('test-runner')
@Public()
export class TestRunnerController {
  private logger = new TestLogger();

  @Get('status')
  @ApiOperation({ summary: 'Ver status do log de testes' })
  getStatus() {
    return this.logger.getLog();
  }

  @Get('suites')
  @ApiOperation({ summary: 'Listar suites disponíveis e status' })
  listSuites() {
    const log = this.logger.getLog();
    const completed = this.logger.getCompletedSuiteNames();
    return {
      total: ALL_SUITES.length,
      suites: ALL_SUITES.map((s) => ({
        name: s.name,
        completed: completed.includes(s.name),
      })),
      completedCount: completed.length,
      pendingCount: ALL_SUITES.length - completed.length,
      runStatus: log.status,
    };
  }

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'suite', required: false, description: 'Nome da suite específica (vazio = todas)' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID para os testes' })
  @ApiQuery({ name: 'reset', required: false, description: 'Resetar log antes de rodar' })
  @ApiOperation({ summary: 'Executar testes (resume automático se houver log anterior)' })
  async runTests(
    @Query('suite') suiteName?: string,
    @Query('tenantId') tenantId?: string,
    @Query('reset') reset?: string,
  ) {
    if (!tenantId) {
      return { error: 'tenantId é obrigatório. Use ?tenantId=SEU_TENANT_ID' };
    }

    if (reset === 'true') {
      this.logger.reset();
    }

    // Reload logger to pick up any existing log
    this.logger = new TestLogger();

    const http = new HttpHelper('http://localhost:3333');
    const completed = this.logger.getCompletedSuiteNames();

    // Determine which suites to run
    let suitesToRun: SuiteEntry[];
    if (suiteName) {
      const found = ALL_SUITES.find((s) => s.name === suiteName);
      if (!found) {
        return { error: `Suite '${suiteName}' não encontrada. Disponíveis: ${ALL_SUITES.map((s) => s.name).join(', ')}` };
      }
      suitesToRun = [found];
    } else {
      // Skip already completed suites (resume)
      suitesToRun = ALL_SUITES.filter((s) => !completed.includes(s.name));
    }

    if (suitesToRun.length === 0) {
      return {
        message: 'Todas as suites já foram executadas. Use ?reset=true para recomeçar.',
        log: this.logger.getLog(),
      };
    }

    // Auto-login if any suite needs auth and http has no token
    const needsAuth = suitesToRun.some((s) => s.needsAuth);
    if (needsAuth && !http.hasAuth()) {
      const testEmail = `test-runner@${tenantId}.pt`;
      const testPass = 'Test@123456';
      // Try register first (in case user doesn't exist)
      await http.post('/api/auth/register', {
        nome: 'Test Runner Auto',
        email: testEmail,
        password: testPass,
        perfil: 'admin',
        tenantId,
      });
      const loginRes = await http.post('/api/auth/login', {
        email: testEmail,
        password: testPass,
        tenantId,
      });
      if (loginRes.statusCode === 200 && loginRes.body?.accessToken) {
        http.setAuth(loginRes.body.accessToken, loginRes.body.refreshToken);
      } else {
        return {
          error: `Auto-login falhou (${loginRes.statusCode}). Execute a suite auth primeiro.`,
          details: loginRes.body,
        };
      }
    }

    // Run suites sequentially
    for (const suite of suitesToRun) {
      if (this.logger.isSuiteCompleted(suite.name)) continue;

      try {
        const result = await suite.run(http, tenantId);
        this.logger.addSuiteResult(result);
      } catch (err: any) {
        // Suite crashed — record as error
        const now = new Date().toISOString();
        this.logger.addSuiteResult({
          suite: suite.name,
          startedAt: now,
          finishedAt: now,
          durationMs: 0,
          totalTests: 1,
          passed: 0,
          failed: 0,
          skipped: 0,
          errors: 1,
          tests: [{
            name: `Suite ${suite.name} crash`,
            status: 'error',
            durationMs: 0,
            error: err.message || String(err),
          }],
        });
        // Mark as interrupted but continue to next suite
        this.logger.markInterrupted();
        // Re-create logger to keep state
        this.logger = new TestLogger();
      }
    }

    // If all suites completed, mark as completed
    const allNames = ALL_SUITES.map((s) => s.name);
    const allCompleted = allNames.every((n) => this.logger.isSuiteCompleted(n));
    if (allCompleted) {
      this.logger.markCompleted();
    }

    return this.logger.getLog();
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetar log de testes' })
  resetLog() {
    this.logger.reset();
    return { message: 'Log resetado com sucesso' };
  }
}
