import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class HorarioDto {
  @IsNumber()
  diaSemana: number;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFim: string;

  @IsNumber()
  ativo: number;
}

export class UpdateConfigAgendaDto {
  @ApiProperty({ type: [HorarioDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioDto)
  @IsOptional()
  horarios?: HorarioDto[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  capacidadePorSlot?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  duracaoSlotMinutos?: number;
}
