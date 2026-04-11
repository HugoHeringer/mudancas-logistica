import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'minha-empresa' })
  @IsString()
  @IsNotEmpty()
  subdomain: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['ativa', 'suspensa', 'em_setup', 'cancelada'])
  estado?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  configMarca?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  configPreco?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  configAgenda?: Record<string, any>;
}
