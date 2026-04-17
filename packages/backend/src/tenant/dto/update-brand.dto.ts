import { IsString, IsOptional, IsNumber, IsUrl, IsArray, ValidateNested, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CoresDto {
  @ApiProperty({ example: '#1B4D3E' })
  @IsString()
  primaria: string;

  @ApiProperty({ example: '#2A7A64' })
  @IsOptional()
  @IsString()
  primariaLight?: string;

  @ApiProperty({ example: '#C4572A' })
  @IsString()
  secundaria: string;

  @ApiProperty({ example: '#D4A853' })
  @IsString()
  acento: string;

  @ApiProperty({ example: '#F5EDE0' })
  @IsString()
  fundo: string;

  @ApiProperty({ example: '#0A0F1E' })
  @IsString()
  fundoEscuro: string;

  @ApiProperty({ example: '#2C1810' })
  @IsString()
  texto: string;

  @ApiProperty({ example: '#F0E6D6' })
  @IsString()
  textoClaro: string;
}

class FontesDto {
  @ApiProperty({ example: 'Cormorant Garamond' })
  @IsString()
  display: string;

  @ApiProperty({ example: 'Inter' })
  @IsString()
  body: string;
}

class DepoimentoDto {
  @IsString()
  nome: string;

  @IsString()
  texto: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  estrelas: number;
}

class AvaliacoesDto {
  @ApiPropertyOptional({ example: 4.8 })
  @IsOptional()
  @IsNumber()
  googleRating?: number;

  @ApiPropertyOptional({ example: 156 })
  @IsOptional()
  @IsNumber()
  googleReviews?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepoimentoDto)
  depoimentos?: DepoimentoDto[];
}

class RedesSociaisDto {
  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;
}

class ContactoDto {
  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  morada?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RedesSociaisDto)
  redesSociais?: RedesSociaisDto;
}

export class UpdateBrandDto {
  @ApiProperty({ example: 'Minha Empresa' })
  @IsString()
  nome: string;

  @ApiPropertyOptional({ example: 'A sua mudança sem stress' })
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/favicon.ico' })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiProperty({ type: CoresDto })
  @ValidateNested()
  @Type(() => CoresDto)
  cores: CoresDto;

  @ApiProperty({ type: FontesDto })
  @ValidateNested()
  @Type(() => FontesDto)
  fontes: FontesDto;

  @ApiPropertyOptional({ example: 'https://example.com/hero.jpg' })
  @IsOptional()
  @IsUrl()
  heroImageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  galeriaUrls?: string[];

  @ApiPropertyOptional({ type: AvaliacoesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AvaliacoesDto)
  avaliacoes?: AvaliacoesDto;

  @ApiPropertyOptional({ type: ContactoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactoDto)
  contacto?: ContactoDto;
}
