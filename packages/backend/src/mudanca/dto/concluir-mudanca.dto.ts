import {
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CombustivelDto {
  @IsNumber()
  @Min(0)
  valor: number;

  @IsNumber()
  @Min(0)
  litros: number;
}

class AlimentacaoDto {
  @IsBoolean()
  teve: boolean;

  @IsNumber()
  @Min(0)
  valor: number;
}

class MateriaisUtilizadosDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  protecaoFilme?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  protecaoCartao?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  caixas?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fitaCola?: number;
}

export class ConcluirMudancaDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  horasRegistadas: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  horasCobradas: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ajudantesConfirmados: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MateriaisUtilizadosDto)
  materiaisUtilizados?: MateriaisUtilizadosDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CombustivelDto)
  combustivel?: CombustivelDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AlimentacaoDto)
  alimentacao?: AlimentacaoDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observacoes?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  concluidoPor: string;
}
