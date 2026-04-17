import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMotoristaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cartaConducao: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  validadeCarta: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  veiculoId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ enum: ['disponivel', 'em_servico', 'ocupado', 'indisponivel'], default: 'disponivel' })
  @IsEnum(['disponivel', 'em_servico', 'ocupado', 'indisponivel'])
  @IsOptional()
  estado?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  valorHora?: number;
}
