import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { FormularioModule } from '../formulario/formulario.module';
import { ComunicacaoModule } from '../comunicacao/comunicacao.module';
import { AgendaModule } from '../agenda/agenda.module';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  imports: [FormularioModule, ComunicacaoModule, AgendaModule],
})
export class PublicModule {}
