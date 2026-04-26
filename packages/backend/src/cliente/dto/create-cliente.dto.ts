import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MoradaClienteDto {
  @IsString()
  tipo: 'recolha' | 'entrega';

  @IsString()
  rua: string;

  @IsString()
  numero: string;

  @IsString()
  @IsOptional()
  andar?: string;

  @IsString()
  codigoPostal: string;

  @IsString()
  localidade: string;

  @IsString()
  @IsOptional()
  pais?: string;
}

export class CreateClienteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apelido: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nif?: string;

  @ApiProperty({ type: [MoradaClienteDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MoradaClienteDto)
  @IsOptional()
  moradas?: MoradaClienteDto[];
}
