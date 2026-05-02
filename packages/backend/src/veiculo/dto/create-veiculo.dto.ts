import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVeiculoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  marca: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  modelo?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  metrosCubicos: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  precoHora: number;

  @ApiProperty({ enum: ['disponivel', 'em_servico', 'em_manutencao'], default: 'disponivel' })
  @IsEnum(['disponivel', 'em_servico', 'em_manutencao'])
  @IsOptional()
  estado?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  eParaUrgencias?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imagemUrl?: string;
}
