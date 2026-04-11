import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
  ],
})
export class AppModule {}
