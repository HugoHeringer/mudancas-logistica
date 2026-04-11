import { IsString, IsNotEmpty, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assunto: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  corpo: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variaveis?: string[];

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  eAtivo?: boolean;
}
