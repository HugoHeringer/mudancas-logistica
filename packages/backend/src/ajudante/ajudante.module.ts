import { Module } from '@nestjs/common';
import { AjudanteService } from './ajudante.service';
import { AjudanteController } from './ajudante.controller';

@Module({
  controllers: [AjudanteController],
  providers: [AjudanteService],
  exports: [AjudanteService],
})
export class AjudanteModule {}
