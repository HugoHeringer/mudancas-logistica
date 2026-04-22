import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { FormularioModule } from '../formulario/formulario.module';
import { AgendaModule } from '../agenda/agenda.module';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  imports: [FormularioModule, AgendaModule],
})
export class PublicModule {}
