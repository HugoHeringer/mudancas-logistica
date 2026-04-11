import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovimentoDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mudancaId?: string;

  @ApiProperty({ enum: ['receita', 'custo'] })
  @IsEnum(['receita', 'custo'])
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    enum: ['servico', 'materiais', 'combustivel', 'alimentacao', 'manutencao', 'outros'],
  })
  @IsEnum(['servico', 'materiais', 'combustivel', 'alimentacao', 'manutencao', 'outros'])
  @IsNotEmpty()
  categoria: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  valor: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  data: string;
}
