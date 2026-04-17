import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAjudanteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  valorHora?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  disponivel?: boolean;
}
