import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { DisponibilidadeService } from './disponibilidade.service';

@Module({
  controllers: [AgendaController],
  providers: [AgendaService, DisponibilidadeService],
  exports: [AgendaService, DisponibilidadeService],
})
export class AgendaModule {}
