import { PartialType, OmitType } from './create-cliente.dto';

export class UpdateClienteDto extends PartialType(
  OmitType(CreateClienteDto, [] as const)
) {}
