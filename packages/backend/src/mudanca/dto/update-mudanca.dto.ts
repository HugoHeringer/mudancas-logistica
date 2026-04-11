import { PartialType, OmitType } from './create-mudanca.dto';

export class UpdateMudancaDto extends PartialType(
  OmitType(CreateMudancaDto, ['tenantId'] as const)
) {}
