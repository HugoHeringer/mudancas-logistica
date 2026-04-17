import { Module } from '@nestjs/common';
import { FormularioService } from './formulario.service';
import { FormularioController } from './formulario.controller';

@Module({
  controllers: [FormularioController],
  providers: [FormularioService],
  exports: [FormularioService],
})
export class FormularioModule {}
