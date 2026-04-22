import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigAgendaDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  horaAbertura?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  horaFecho?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  capacidadeSlot?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  duracaoSlotMinutos?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  diasFuncionamento?: Record<string, boolean>;
}
