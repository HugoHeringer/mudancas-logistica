import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
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

  @ApiProperty({ enum: ['disponivel', 'em_servico', 'indisponivel'], default: 'disponivel' })
  @IsEnum(['disponivel', 'em_servico', 'indisponivel'])
  @IsOptional()
  estado?: string;
}
