import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AprovarMudancaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aprovadoPor: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  motoristaId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  veiculoId?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ajudantesIds?: string[];

  @ApiProperty()
  @IsNumber()
  @Min(0.5)
  @Max(24)
  @IsNotEmpty()
  tempoEstimadoHoras: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observacoesAdmin?: string;
}
