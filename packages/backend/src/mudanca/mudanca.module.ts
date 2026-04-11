import { Module } from '@nestjs/common';
import { MudancaService } from './mudanca.service';
import { MudancaController } from './mudanca.controller';

@Module({
  controllers: [MudancaController],
  providers: [MudancaService],
  exports: [MudancaService],
})
export class MudancaModule {}
