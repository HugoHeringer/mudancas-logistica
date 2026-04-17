import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateClienteDto } from './create-cliente.dto';
export class UpdateClienteDto extends PartialType(OmitType(CreateClienteDto, [])) {
}
