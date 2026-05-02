import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'joao@empresa.pt' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'admin', enum: ['admin', 'gerente', 'financeiro', 'operacional', 'motorista'] })
  @IsString()
  @IsNotEmpty()
  perfil: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motoristaId?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  obrigarTrocaSenha?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  permissoes?: Record<string, string>;
}
