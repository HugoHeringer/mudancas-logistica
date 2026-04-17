import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { MudancaModule } from './mudanca/mudanca.module';
import { ClienteModule } from './cliente/cliente.module';
import { MotoristaModule } from './motorista/motorista.module';
import { VeiculoModule } from './veiculo/veiculo.module';
import { AgendaModule } from './agenda/agenda.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { ComunicacaoModule } from './comunicacao/comunicacao.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { UtilizadorModule } from './utilizador/utilizador.module';
import { AjudanteModule } from './ajudante/ajudante.module';
import { UploadModule } from './upload/upload.module';
import { NotificacaoModule } from './notificacao/notificacao.module';
import { FormularioModule } from './formulario/formulario.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SuperAdminGuard } from './auth/guards/super-admin.guard';
import { PublicModule } from './public/public.module';
import { TestRunnerModule } from './test-runner/test-runner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    TenantModule,
    MudancaModule,
    ClienteModule,
    MotoristaModule,
    VeiculoModule,
    AgendaModule,
    FinanceiroModule,
    ComunicacaoModule,
    SuperAdminModule,
    UtilizadorModule,
    AjudanteModule,
    UploadModule,
    NotificacaoModule,
    FormularioModule,
    PublicModule,
    TestRunnerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SuperAdminGuard,
    },
  ],
})
export class AppModule {}
