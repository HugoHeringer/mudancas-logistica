import { PartialType } from '@nestjs/swagger';
import { CreateMudancaDto } from './create-mudanca.dto';

export class UpdateMudancaDto extends PartialType(CreateMudancaDto) {}
