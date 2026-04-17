import { PartialType } from '@nestjs/swagger';
import { CreateAjudanteDto } from './create-ajudante.dto';

export class UpdateAjudanteDto extends PartialType(CreateAjudanteDto) {}
