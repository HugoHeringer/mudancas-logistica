import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { FormularioModule } from '../formulario/formulario.module';

@Module({
  controllers: [PublicController],
  providers: [PublicService],
  imports: [FormularioModule],
})
export class PublicModule {}
