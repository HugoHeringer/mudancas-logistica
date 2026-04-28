import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsEnum, ValidateNested, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MoradaDto {
  @IsString()
  @IsNotEmpty()
  rua: string;

  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsString()
  @IsOptional()
  andar?: string;

  @IsString()
  @IsNotEmpty()
  codigoPostal: string;

  @IsString()
  @IsNotEmpty()
  localidade: string;

  @IsBoolean()
  @IsOptional()
  elevador?: boolean;

  @IsString()
  @IsOptional()
  pais?: string;
}

export class MateriaisDto {
  @IsNumber()
  @IsOptional()
  protecaoFilme?: number;

  @IsNumber()
  @IsOptional()
  protecaoCartao?: number;

  @IsNumber()
  @IsOptional()
  caixas?: number;

  @IsNumber()
  @IsOptional()
  fitaCola?: number;
}

export class CreateMudancaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clienteNome: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clienteEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clienteTelefone: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => MoradaDto)
  moradaRecolha: MoradaDto;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => MoradaDto)
  moradaEntrega: MoradaDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dataPretendida: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  horaPretendida?: string;

  @ApiProperty()
  @IsEnum(['normal', 'urgente'])
  @IsNotEmpty()
  tipoServico: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  veiculoId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  motoristaId?: string;

  @ApiProperty()
  @IsEnum(['motorista', 'motorista_1_ajudante', 'motorista_2_ajudantes'])
  @IsNotEmpty()
  equipa: string;

  @ApiProperty({ required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => MateriaisDto)
  @IsOptional()
  materiais?: MateriaisDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observacoes?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  eInternacional?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  documentacao?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  camposPersonalizados?: Record<string, any>;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  consentimentoDados?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  consentimentoMarketing?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  timestampConsentimento?: string;
}
