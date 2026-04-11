import { PartialType, OmitType } from './create-motorista.dto';

export class UpdateMotoristaDto extends PartialType(
  OmitType(CreateMotoristaDto, [] as const)
) {}
