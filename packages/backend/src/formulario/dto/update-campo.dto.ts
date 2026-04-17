import { PartialType } from '@nestjs/swagger';
import { CreateCampoDto } from './create-campo.dto';

export class UpdateCampoDto extends PartialType(CreateCampoDto) {}
