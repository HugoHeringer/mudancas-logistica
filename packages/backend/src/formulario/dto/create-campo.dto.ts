import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ enum: ['texto', 'checkbox', 'selector', 'numero'] })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  obrigatorio?: boolean;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  ordem?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  opcoes?: string[];

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  eBase?: boolean;
}
