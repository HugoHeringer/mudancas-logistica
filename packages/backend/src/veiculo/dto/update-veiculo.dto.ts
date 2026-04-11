import { PartialType, OmitType } from './create-veiculo.dto';

export class UpdateVeiculoDto extends PartialType(
  OmitType(CreateVeiculoDto, [] as const)
) {}
