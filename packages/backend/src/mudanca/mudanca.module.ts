import { Module } from '@nestjs/common';
import { MudancaService } from './mudanca.service';
import { MudancaController } from './mudanca.controller';
import { PrecoCalculatorService } from './preco-calculator.service';
import { ComunicacaoModule } from '../comunicacao/comunicacao.module';
import { NotificacaoModule } from '../notificacao/notificacao.module';
import { ExportModule } from '../export/export.module';
import { ClienteModule } from '../cliente/cliente.module';
import { AgendaModule } from '../agenda/agenda.module';

@Module({
  imports: [ComunicacaoModule, NotificacaoModule, ExportModule, ClienteModule, AgendaModule],
  controllers: [MudancaController],
  providers: [MudancaService, PrecoCalculatorService],
  exports: [MudancaService],
})
export class MudancaModule {}
