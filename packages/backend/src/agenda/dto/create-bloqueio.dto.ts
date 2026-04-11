import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBloqueioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dataInicio: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dataFim: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  motivo: string;
}
