import { Module } from '@nestjs/common';
import { MudancaService } from './mudanca.service';
import { MudancaController } from './mudanca.controller';
import { ComunicacaoModule } from '../comunicacao/comunicacao.module';
import { NotificacaoModule } from '../notificacao/notificacao.module';
import { ExportModule } from '../export/export.module';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports: [ComunicacaoModule, NotificacaoModule, ExportModule, ClienteModule],
  controllers: [MudancaController],
  providers: [MudancaService],
  exports: [MudancaService],
})
export class MudancaModule {}
